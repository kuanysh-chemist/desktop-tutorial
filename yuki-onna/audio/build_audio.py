"""Synthesise music + SFX for «Юки-онна» and mix with the narration.

usage: python3 -I build_audio.py <vo_dir> <timeline.json> <out.wav>
Everything is generated procedurally (numpy/scipy); the only external input is the TTS narration.
"""
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 84.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

mus = np.zeros((N, 2))   # music bus (ducked under VO)
sfx = np.zeros((N, 2))   # effects bus
amb = np.zeros((N, 2))   # ambience bus (ducked a little)
vo = np.zeros((N, 2))


def T(t):
    return int(round(t * SR))


def place(bus, x, t, gain=1.0, pan=0.0):
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    i = T(t)
    if i < 0:
        x = x[-i:]; i = 0
    j = min(N, i + len(x))
    if j > i:
        bus[i:j] += x[:j - i] * gain


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def env(n, a, d, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def noise(n):
    return rng.standard_normal(n)


def pink(n):
    w = np.fft.rfft(noise(n)); f = np.arange(len(w)); f[0] = 1
    return np.fft.irfft(w / np.sqrt(f), n) * 30


# ---------------- reverb (synthetic plate) ----------------
def make_ir(sec, decay, bright=6000):
    n = int(sec * SR); t = np.arange(n) / SR
    ir = np.stack([noise(n), noise(n)], 1) * np.exp(-t / decay)[:, None]
    ir = filt(ir, 'lowpass', bright)
    ir[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0))


IR_HALL = make_ir(4.5, 1.3, 5000)
IR_ROOM = make_ir(1.2, .25, 7000)


def reverb(x, ir, wet):
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet * 1.0


# ---------------- instruments ----------------
NOTE = {'D2': 73.42, 'A2': 110.0, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'A3': 220.0, 'Bb3': 233.08,
        'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'A4': 440.0, 'Bb4': 466.16, 'D5': 587.33, 'E5': 659.26, 'F5': 698.46, 'A5': 880.0}


def koto(f, dur=3.0, bright=.6, bend=0.0):
    n = int(dur * SR); L = max(2, int(round(SR / f)))
    exc = np.zeros(n); burst = noise(L) * np.hanning(L) ** (1 - bright * .8)
    exc[:L] = burst
    g = .996 - (1 - bright) * .004
    a = np.zeros(L + 2); a[0] = 1; a[L] = -g / 2; a[L + 1] = -g / 2
    y = signal.lfilter([1], a, exc)
    if bend:  # oshide: press string → pitch rises a little after attack
        t = np.arange(n) / SR
        ratio = 1 + bend * np.clip((t - .25) / .25, 0, 1)
        idx = np.cumsum(ratio); idx = idx[idx < n - 1]
        y = np.interp(idx, np.arange(n), y); y = np.pad(y, (0, n - len(y)))
    body = filt(y, 'bandpass', [180, 4200])
    y = y * .6 + body * .8
    y *= adsr(n, .002, .3)
    return y / (np.abs(y).max() + 1e-9)


def shaku(notes, vib=5.2):
    """notes: list of (note, dur). breathy flute with portamento + delayed vibrato."""
    total = sum(d for _, d in notes); n = int(total * SR); t = np.arange(n) / SR
    f = np.zeros(n); a = np.zeros(n); pos = 0
    for k, (nm, d) in enumerate(notes):
        m = int(d * SR); seg_t = np.arange(m) / SR
        f[pos:pos + m] = NOTE[nm]
        e = np.minimum(1, seg_t / .12) * np.minimum(1, (d - seg_t) / .25)
        a[pos:pos + m] = np.clip(e, 0, 1) * (0.85 + .15 * np.sin(seg_t * 1.3))
        pos += m
    f = filt(f, 'lowpass', 6)  # portamento
    v = 1 + .012 * np.sin(2 * np.pi * vib * t) * np.clip((t % 1.5) / .6, 0, 1)
    ph = np.cumsum(f * v) / SR * 2 * np.pi
    tone = np.sin(ph) + .35 * np.sin(2 * ph + .3) + .12 * np.sin(3 * ph)
    breath = filt(noise(n), 'bandpass', [900, 5000]) * .18
    y = (tone * .9 + breath * (1 + 2 * (a < .5))) * filt(a, 'lowpass', 30)
    return y / (np.abs(y).max() + 1e-9)


def taiko(dur=2.2, f0=110, f1=48, body=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    y = np.sin(np.cumsum(f) / SR * 2 * np.pi) * np.exp(-t * 2.6) * body
    y += filt(noise(n), 'lowpass', 900) * np.exp(-t * 30) * .5
    y += filt(noise(n), 'bandpass', [1500, 4000]) * np.exp(-t * 80) * .25
    return y / np.abs(y).max()


def bell(f, dur=4.0, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for p, a, d in [(1, 1, 1.2), (2.76, .5 * bright, .9), (5.4, .3 * bright, .5), (8.93, .18 * bright, .3), (13.3, .08 * bright, .2)]:
        y += a * np.sin(2 * np.pi * f * p * t + rng.random() * 6) * np.exp(-t / (d * dur / 3))
    y *= np.minimum(1, t / .004)
    return y / np.abs(y).max()


def pad(chord, dur, a=1.5, r=2.0, bright=1200):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for nm in chord:
        for det in (-.004, 0, .005):
            f = NOTE[nm] * (1 + det)
            y += signal.sawtooth(2 * np.pi * f * t + rng.random() * 6) * .3
    y = filt(y, 'lowpass', bright) * adsr(n, a, r)
    return y / (np.abs(y).max() + 1e-9)


def drone(f, dur, a=2, r=2, lfo=.07):
    n = int(dur * SR); t = np.arange(n) / SR
    y = signal.sawtooth(2 * np.pi * f * t) + .5 * signal.sawtooth(2 * np.pi * f * 1.501 * t + 1)
    cut = 300 + 250 * (1 + np.sin(2 * np.pi * lfo * t))
    out = np.zeros(n); blk = 2400
    for i in range(0, n, blk):  # time-varying low-pass in blocks
        s = sos('lowpass', float(cut[i]))
        out[i:i + blk] = signal.sosfilt(s, y[i:i + blk])
    out *= adsr(n, a, r)
    return out / (np.abs(out).max() + 1e-9)


def whoosh(dur, f0=300, f1=3000, up=True):
    n = int(dur * SR); x = noise(n); out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        k = i / n; f = f0 * (f1 / f0) ** (k if up else 1 - k)
        out[i:i + blk] = signal.sosfilt(sos('bandpass', [f * .6, min(f * 1.6, 20000)]), x[i:i + blk])
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * e / (np.abs(out * e).max() + 1e-9)


def crackle(dur, rate=40, hp=2500, decay=.004):
    n = int(dur * SR); y = np.zeros(n)
    k = rng.poisson(rate * dur); pos = rng.integers(0, n - 400, k)
    for p in pos:
        m = min(n - p, int(SR * decay * (1 + rng.random() * 3))); y[p:p + m] += noise(m) * np.exp(-np.arange(m) / (m / 4)) * (.3 + rng.random())
    return filt(y, 'highpass', hp) / (np.abs(y).max() + 1e-9)


def fire_bed(dur):
    n = int(dur * SR)
    rumble = filt(pink(n), 'lowpass', 300) * .5
    cr = crackle(dur, 22, 800, .006) * .8
    y = rumble / (np.abs(rumble).max() + 1e-9) * .4 + cr
    return y / np.abs(y).max()


def wind(dur, base=500, var=.6, seed=0):
    n = int(dur * SR); x = pink(n); out = np.zeros(n); blk = 2400
    lfo = np.cumsum(np.random.default_rng(seed).standard_normal(n // blk + 2)) * .15
    for b, i in enumerate(range(0, n, blk)):
        f = base * np.exp(var * np.tanh(lfo[b]))
        out[i:i + blk] = signal.sosfilt(sos('bandpass', [f * .5, f * 2.2]), x[i:i + blk])
    gust = .6 + .4 * np.sin(np.linspace(0, dur * .7, n) + seed) ** 2
    out *= gust
    return out / (np.abs(out).max() + 1e-9)


def crunch_steps(dur, rate=1.6, jitter=.05):
    n = int(dur * SR); y = np.zeros(n); t = 0.0
    while t < dur - .2:
        m = int(.13 * SR); i = int(t * SR)
        g = filt(noise(m), 'bandpass', [900, 5000]) * (rng.random(m) < .35) * np.exp(-np.arange(m) / (m / 3))
        y[i:i + m] += g; t += 1 / rate + rng.uniform(-jitter, jitter)
    return y / (np.abs(y).max() + 1e-9)


def heartbeat(times):
    out = []
    for t0 in times:
        for dt, a in ((0, 1), (.28, .7)):
            n = int(.25 * SR); t = np.arange(n) / SR
            out.append((t0 + dt, np.sin(2 * np.pi * (52 - 10 * t) * t) * np.exp(-t * 22) * a))
    return out


def door_slide(dur=.45):
    n = int(dur * SR); x = filt(noise(n), 'lowpass', 700)
    grain = 1 + .8 * np.sin(2 * np.pi * 38 * np.arange(n) / SR) * rng.random(n)
    y = x * grain * np.sin(np.pi * np.linspace(0, 1, n))
    thump = taiko(.6, 140, 70) * .8
    y = np.concatenate([y / np.abs(y).max() * .6, thump])
    return y


def plink():
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 1400 + 1100 * (1 - np.exp(-t * 60))
    return np.sin(np.cumsum(f) / SR * 2 * np.pi) * np.exp(-t * 16)


# =============================== SCORE ===============================
def K(t, nm, g=.35, pan=0, dur=3, bend=0, bright=.6):
    place(mus, koto(NOTE[nm], dur, bright, bend), t, g, pan)


# --- hook 0–12
place(mus, drone(NOTE['D2'], 12.4, 1.0, 1.0), 0, .24)
place(mus, pad(['D3', 'A3'], 12, 1.5, 1.5, 700), 0, .12)
K(.5, 'D4', .32, -.2, bend=.0)
K(2.0, 'A3', .28, .3)
K(3.4, 'Bb3', .3, -.1, bend=.03)
K(6.5, 'D4', .26, .2); K(7.4, 'F4', .22, -.3); K(8.95, 'E4', .26, 0, bend=-.0)
place(mus, bell(NOTE['A5'], 5, .7), 5.0, .12, .4)
place(mus, whoosh(11.95 - 9.8, 200, 4000), 9.8, .25)  # riser into white-out
# --- title 12–20.4
place(mus, taiko(3.0, 120, 45), 12.0, .85); place(mus, taiko(2.5, 140, 55), 14.05, .75)
place(mus, drone(NOTE['D2'], 8.6, .3, 1.5), 12.0, .3)
place(mus, pad(['D3', 'A3', 'E4'], 8.4, 1.0, 1.8, 1500), 12.0, .14)
for i, (nm, tt) in enumerate([('D5', 14.05), ('A4', 14.3), ('F5', 14.55), ('E5', 14.8)]):
    place(mus, bell(NOTE[nm], 4, .8), tt, .09, (-1) ** i * .4)
place(mus, shaku([('A4', 1.1), ('Bb4', .7), ('A4', 1.4), ('F4', .8), ('E4', .9), ('D4', 2.4)]), 15.6, .15, -.15)
K(18.4, 'D3', .3, 0, 4); K(18.42, 'A3', .2, .2, 4)
# --- walk 20.4–27
place(mus, drone(NOTE['D2'], 7, 1, 1), 20.4, .26)
for b in range(9):  # low ostinato
    tt = 20.6 + b * .72
    K(tt, ['D3', 'A3', 'Bb3', 'A3'][b % 4], .18, -.2 + (b % 2) * .4, 2.0, bright=.4)
for b in range(4): place(mus, taiko(1.5, 90, 50), 21.0 + b * 1.44, .22)
# --- fire / death 27–32.5: tension then silence
place(mus, drone(NOTE['A2'], 4.4, 1.5, .3, .2), 27.0, .22)
place(mus, pad(['D3', 'Bb3', 'E4'], 4.3, 2.5, .2, 900), 27.0, .12)
# --- eyes 32.5–42
place(mus, drone(NOTE['E5'] / 4, 9.5, 2, 2, .05), 32.5, .14)
for tt, nm in [(32.7, 'A5'), (33.4, 'E5'), (34.3, 'F5'), (36.4, 'D5'), (38.7, 'A4')]:
    place(mus, bell(NOTE[nm], 5, .9), tt, .07, rng.uniform(-.5, .5))
place(mus, pad(['D3', 'F3', 'A3', 'D4'], 4.0, 1.5, 1.8, 1100), 38.4, .16)   # mercy chord
place(mus, whoosh(42.0 - 40.6, 300, 6000), 40.6, .25)
# --- warm years 42–52
place(mus, pad(['D3', 'A3', 'D4', 'F4'], 10.2, 1.0, 1.5, 1600), 42.0, .13)
mel = [('A4', 42.3), ('D5', 42.9), ('E5', 43.4), ('D5', 44.1), ('A4', 44.6), ('F4', 45.2), ('E4', 45.8), ('D4', 46.6),
       ('D4', 47.0), ('A4', 47.9), ('F4', 48.5), ('A4', 49.2), ('D5', 49.8), ('A4', 50.5), ('F4', 51.0), ('E4', 51.5)]
for i, (nm, tt) in enumerate(mel): K(tt, nm, .26, (-1) ** i * .25, 2.5, bend=.03 if i % 5 == 2 else 0)
for tt in (47.9, 49.2, 50.5):  # chord accent with each year
    K(tt, 'D3', .2, -.3); K(tt + .03, 'A3', .16, .3)
# --- by the fire 52–59
place(mus, pad(['D3', 'A3', 'F4'], 6.6, 1.5, 1.2, 1200), 52.0, .12)
for i, (nm, tt) in enumerate([('A4', 52.6), ('F4', 53.5), ('E4', 54.4), ('D4', 55.2)]): K(tt, nm, .22, (-1) ** i * .2, 2.5)
for f in (NOTE['E5'], NOTE['F5'] * 1.03, NOTE['Bb4']): place(mus, bell(f, 3, 1.2), 55.95, .1, rng.uniform(-.5, .5))  # memory sting
place(mus, whoosh(.6, 6000, 600, up=False), 55.85, .22)
place(mus, drone(NOTE['D2'], 2.6, 1.0, .2), 55.8, .2)   # darkens, then cuts at 58.4
# --- thread 59–63
place(mus, taiko(2.5, 160, 50), 60.18, .7)
place(mus, koto(NOTE['D5'] * 2, .6, 1.0), 60.18, .3)
place(mus, drone(NOTE['D2'], 3.4, 2.5, .2, .3), 60.0, .3)
place(mus, pad(['D3', 'E3', 'Bb3', 'E4'], 3.3, 2.8, .1, 2000), 60.0, .16)
# --- storm 63–68.6
place(mus, taiko(3, 110, 40), 63.0, .9)
for tt in (64.98, 65.3): place(mus, taiko(1.8, 130, 50), tt, .5)
place(mus, drone(NOTE['D2'], 2.8, .2, .6, .5), 63.0, .38)
place(mus, shaku([('D4', 1.2), ('F4', .9), ('E4', 1.1), ('D4', 2.2)]), 65.9, .22, .1)    # tenderness
place(mus, pad(['D3', 'A3', 'D4'], 3.5, 1.2, 1.5, 900), 65.7, .14)
# --- melting 68.6–73
for i in range(22):
    tt = 69.0 + i * .12 + rng.random() * .05
    place(mus, bell([NOTE['D5'], NOTE['E5'], NOTE['F5'], NOTE['A5']][i % 4] * (1 + (i // 8)), 2.5, .6), tt, .028, rng.uniform(-.7, .7))
place(mus, drone(NOTE['A2'], 4.6, 1.5, .8), 68.6, .18)
place(mus, whoosh(2.2, 400, 5000), 70.9, .3)
# --- legend 73–76.6
place(mus, drone(NOTE['D2'], 3.8, .5, 1.5), 73.0, .24)
K(73.5, 'D3', .22, -.2, 4); K(74.6, 'A3', .18, .2, 4); K(75.6, 'Bb3', .18, 0, 4, bend=.03)
# --- camellia 76.6–84
place(mus, pad(['D3', 'A3', 'D4', 'E4'], 7.4, 1.5, 3.0, 1300), 76.6, .15)
place(mus, shaku([('A4', 1.0), ('D5', 1.0), ('E5', .5), ('D5', .9), ('A4', 1.8)]), 79.9, .2, -.1)
for i, (nm, tt) in enumerate([('D4', 76.8), ('A4', 80.0), ('D4', 81.0), ('D3', 81.02)]):
    K(tt, nm, .24, (-1) ** i * .2, 3.5)
place(mus, taiko(4, 80, 35), 81.0, .45)
place(mus, bell(NOTE['D4'] / 2, 6, .5), 81.0, .14)

# =============================== SFX ===============================
# wind beds per scene (gain envelopes)
wind_full = wind(DUR, 520, .7, 1)
wg = np.interp(np.arange(N) / SR,
               [0, 4.8, 5.0, 11.4, 12.0, 15.8, 16.5, 20.4, 26.8, 27.0, 27.4, 27.9, 31.5, 32.5, 41.5, 42.0, 46.4, 46.6, 52, 59, 63.0, 63.6, 65.6, 68.6, 70.5, 73, 76.4, 76.6, 84],
               [.55, .7, .25, .25, .4, .35, .75, .75, .65, .08, .45, .18, .1, .06, .06, .2, .2, .05, .04, .03, .05, .45, .2, .25, .55, .75, .7, .18, .12])
place(amb, np.stack([wind_full * wg, np.roll(wind_full, 9000) * wg], 1), 0, .5)
# dive 0–5
place(sfx, whoosh(1.2, 200, 1500, up=False), 0.0, .35)
place(sfx, whoosh(2.6, 500, 7000), 1.3, .35, -.3)   # breath ribbon
place(sfx, crackle(1.8, 140, 3500), 3.3, .22)        # lens frost
place(sfx, crackle(1.0, 60, 4000), 6.0, .08)
place(sfx, filt(noise(int(1.6 * SR)), 'bandpass', [400, 2500]) * env(int(1.6 * SR), .4, .6), 5.2, .1)  # exhale
place(sfx, filt(noise(int(.9 * SR)), 'bandpass', [2500, 9000]) * env(int(.9 * SR), .15, .25), 8.65, .1)  # "shh"
place(sfx, whoosh(1.3, 1000, 8000), 9.6, .18, .5)    # word blown away
# title
place(sfx, whoosh(1.8, 200, 3000), 12.1, .2); place(sfx, whoosh(1.8, 3000, 300, False), 15.9, .25, -.4)
# walk 20.4–27
place(sfx, crunch_steps(5.4, 1.7), 20.6, .2, -.2); place(sfx, crunch_steps(5.2, 1.6), 20.9, .15, .1)
river = filt(pink(int(6.6 * SR)), 'bandpass', [200, 1800]); place(amb, river / np.abs(river).max() * adsr(len(river), 1, 1), 20.4, .1, .3)
for tt in (21.4, 23.3, 25.0): place(sfx, whoosh(.6, 300, 1200), tt, .22, -.6)  # trunk passes
place(sfx, door_slide(), 26.55, .55)
# interior 27–32.5
fb = fire_bed(31.4 - 27.0); place(sfx, fb * adsr(len(fb), .1, .9), 27.0, .28)
place(sfx, door_slide(.3)[:int(.3 * SR)], 27.45, .5, -.5)
place(sfx, whoosh(1.2, 300, 2500), 27.5, .35, -.5)  # gust in
for t0, x in heartbeat([28.0, 28.85, 29.75, 30.7, 31.75]): place(sfx, x, t0, .55)
place(sfx, filt(noise(int(1.3 * SR)), 'bandpass', [600, 4000]) * env(int(1.3 * SR), .3, .5), 29.9, .2)  # breath
place(sfx, filt(noise(int(1.2 * SR)), 'highpass', 2000) * env(int(1.2 * SR), .05, .4) * .6, 30.3, .2)  # fire hiss dies
# eyes
place(sfx, crackle(2.0, 30, 5000), 33.8, .06)   # freezing
place(sfx, plink(), 38.65, .2, .3)               # droplet
place(sfx, filt(noise(int(.15 * SR)), 'bandpass', [1500, 6000]) * env(int(.15 * SR), .01, .05), 34.42, .05)  # blink
# road
place(sfx, crunch_steps(3.4, 1.4), 42.2, .12, .4)
place(sfx, whoosh(1.0, 300, 3000), 45.6, .25)   # push into umbrella
place(sfx, taiko(.6, 200, 120) * .4, 46.58, .25)  # umbrella "thump"
# shoji / hearth
fb2 = fire_bed(7.0); place(sfx, fb2 * adsr(len(fb2), 1, .5), 52.0, .16)
place(sfx, filt(noise(int(.8 * SR)), 'highpass', 1500) * env(int(.8 * SR), .02, .3), 55.95, .15)  # flame gutters blue
place(sfx, filt(noise(int(1.5 * SR)), 'highpass', 1800) * env(int(1.5 * SR), .05, .6), 58.4, .08)  # hiss in the silence
# thread
place(sfx, crackle(3.2, 80, 3000) * np.linspace(.2, 1, int(3.2 * SR)), 60.3, .3)  # frost spreading
place(sfx, np.concatenate([np.zeros(10), noise(400) * np.exp(-np.arange(400) / 60)]), 60.18, .5)  # snap click
# storm
place(sfx, whoosh(2.4, 200, 2500), 63.2, .4, -.2); place(sfx, whoosh(1.6, 2500, 300, False), 65.4, .25, .2)
place(sfx, door_slide(.35)[:int(.35 * SR)], 68.7, .4, -.5)
place(sfx, whoosh(2.6, 1500, 9000), 69.0, .12, -.3)   # dissolve
place(sfx, whoosh(1.4, 300, 3000), 72.3, .35)        # out the door
place(sfx, whoosh(1.0, 400, 4000), 75.6, .25, .5)    # gust erases her
place(sfx, whoosh(1.0, 300, 5000), 76.0, .2)
place(sfx, whoosh(2.2, 600, 6000), 77.6, .2, -.5)    # frost wave
place(sfx, crackle(1.8, 50, 4000), 78.0, .1)

# =============================== VO ===============================
TLD = json.load(open(sys.argv[2]))
vodir = sys.argv[1]
for L in TLD:
    sr, x = wavfile.read(f"{vodir}/{L['id']}.trim.wav")
    x = x.astype(np.float64) / 32768.0
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = signal.resample_poly(x, SR, sr)
    x = filt(x, 'highpass', 90)
    x = x / (np.abs(x).max() + 1e-9) * .8
    if L['who'] == 'y':  # Yuki: colder, airier, doubled
        dbl = signal.resample_poly(x, 1000, 1006)[:len(x)]
        d0 = int(.018 * SR); dbl = np.pad(dbl, (d0, max(0, len(x) - len(dbl) - d0)))[:len(x)]
        air = filt(x, 'highpass', 3000) * 1.2
        y = np.stack([x + .35 * dbl + air * .4, x + .35 * np.roll(dbl, 300) + air * .4], 1)
        y = reverb(y, IR_HALL, .32)
    else:
        y = np.stack([x, x], 1); y = reverb(y, IR_ROOM, .12)
    place(vo, y, L['start'], 1.0)

# =============================== MIX ===============================
mus = reverb(mus, IR_HALL, .35)
sfx = reverb(sfx, IR_ROOM, .15)
# silence windows for drama (music cut)
cut = np.ones(N)
for a, b in [(31.3, 32.45), (58.35, 59.6)]:
    i, j = T(a), T(b); cut[i:j] = 0
cut = filt(cut, 'lowpass', 8)
mus *= cut[:, None]
# sidechain duck under narration
vabs = np.abs(vo).mean(1)
envv = signal.sosfilt(sos('lowpass', 4), vabs) * 6
envv = np.clip(envv / (envv.max() + 1e-9) * 1.6, 0, 1)
duck = 1 - .62 * envv
mus = filt(mus, 'highpass', 40, 4); amb = filt(amb, 'highpass', 110, 2)
mix = mus * duck[:, None] * .85 + amb * (1 - .4 * envv)[:, None] + sfx * (1 - .25 * envv)[:, None] + vo * 1.25
# fade in/out
fi, fo = T(.05), T(1.2)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.3) * .9
wavfile.write(sys.argv[3], SR, (mix * 32767).astype(np.int16))
# stems for review
for name, b in (('music', mus), ('sfx', sfx + amb), ('vo', vo)):
    wavfile.write(sys.argv[3].replace('.wav', f'_{name}.wav'), SR, (b / (np.abs(b).max() + 1e-9) * .9 * 32767).astype(np.int16))
print('ok', mix.shape)
