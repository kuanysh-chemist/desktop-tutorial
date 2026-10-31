"""vizavi-motion audio toolkit — procedural score + sound design + mix, no samples needed (numpy + scipy).

Use it when no licensed track/SFX library is available, or to add sync-locked sound design on top of one.
Import from a per-project score script (see score_example.py):

    import sys; sys.path.insert(0, "<skill>/scripts/audio"); from synth import *
    m = Mix(duration=30)
    m.music(pluck(note('D4')), 1.0, gain=.3)        # place a sound at t=1.0 s on the music bus
    m.sfx(whoosh(.8), 4.6, gain=.3, pan=-.4)
    m.add_vo("vo/L01.wav", 0.5)                       # narration (ducks music/ambience automatically)
    m.render("mix.wav", lufs=-16)

Design notes (why it sounds like music, not a pile of whooshes):
- write a MOTIF (3–6 notes in a mode) and vary it per act: register, instrument, density, harmony;
- leave SILENCE before big moments (cut music 0.5–1.5 s), then hit — contrast is what reads as "cinematic";
- put SFX on visual contacts/transitions, not on every beat; tie music accents to cuts selectively;
- keep the low end clean (high-pass ambience ~110 Hz) so narration and impacts stay clear.
"""
import json, subprocess, os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
_rng = np.random.default_rng(7)

# ---------------- pitch ----------------
A4 = 440.0
_NAMES = {'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6, 'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1, 'Ab': -1, 'A': 0, 'A#': 1, 'Bb': 1, 'B': 2}


def note(name):
    """'D4', 'Bb3', 'F#5' → Hz"""
    p, o = (name[:2], name[2:]) if len(name) > 2 and name[1] in '#b' else (name[:1], name[1:])
    return A4 * 2 ** ((_NAMES[p] + 12 * (int(o) - 4)) / 12)


MODES = {  # semitone offsets from the root
    'minor': [0, 2, 3, 5, 7, 8, 10], 'major': [0, 2, 4, 5, 7, 9, 11], 'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10], 'pent_minor': [0, 3, 5, 7, 10], 'pent_major': [0, 2, 4, 7, 9],
    'hirajoshi': [0, 2, 3, 7, 8], 'in': [0, 1, 5, 7, 8], 'yo': [0, 2, 5, 7, 9], 'harm_minor': [0, 2, 3, 5, 7, 8, 11],
}


def scale(root='D3', mode='minor', octaves=3):
    """list of Hz for a mode, so motifs can be written as degree numbers"""
    r = note(root)
    return [r * 2 ** ((o * 12 + s) / 12) for o in range(octaves) for s in MODES[mode]]


# ---------------- utilities ----------------
def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def adsr(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:min(na, n)] = np.linspace(0, 1, min(na, n))
    if nr: e[-min(nr, n):] *= np.linspace(1, 0, min(nr, n))
    return e


def decay_env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))


def noise(n):
    return _rng.standard_normal(n)


def pink(n):
    w = np.fft.rfft(noise(n)); f = np.arange(len(w)); f[0] = 1
    return np.fft.irfft(w / np.sqrt(f), n) * 30


def norm(x, peak=1.0):
    return x / (np.abs(x).max() + 1e-9) * peak


def _varlp(x, cut):  # time-varying low-pass in blocks (filter sweeps)
    out = np.zeros_like(x); blk = 1200
    for i in range(0, len(x), blk):
        out[i:i + blk] = signal.sosfilt(sos('lowpass', float(np.clip(cut[min(i, len(cut) - 1)], 30, SR / 2.2))), x[i:i + blk])
    return out


def _varbp(x, centre):
    out = np.zeros_like(x); blk = 1200
    for i in range(0, len(x), blk):
        f = float(np.clip(centre[min(i, len(centre) - 1)], 60, SR / 3))
        out[i:i + blk] = signal.sosfilt(sos('bandpass', [f * .6, min(f * 1.6, SR / 2.1)]), x[i:i + blk])
    return out


# ---------------- instruments ----------------
def pluck(f, dur=3.0, bright=.6, bend=0.0, body=(180, 4200)):
    """Karplus-Strong string (koto / harp / guitar-ish). bend = pitch rise after attack (koto oshide)."""
    n = int(dur * SR); L = max(2, int(round(SR / f)))
    exc = np.zeros(n); exc[:L] = noise(L) * np.hanning(L) ** (1 - bright * .8)
    g = .996 - (1 - bright) * .004
    a = np.zeros(L + 2); a[0] = 1; a[L] = -g / 2; a[L + 1] = -g / 2
    y = signal.lfilter([1], a, exc)           # vectorised comb filter — no Python per-sample loop
    if bend:
        ratio = 1 + bend * np.clip((np.arange(n) / SR - .25) / .25, 0, 1)
        idx = np.cumsum(ratio); idx = idx[idx < n - 1]
        y = np.pad(np.interp(idx, np.arange(n), y), (0, n - len(idx)))
    y = y * .6 + filt(y, 'bandpass', list(body)) * .8
    return norm(y * adsr(n, .002, .3))


def flute(notes, vib=5.2, breath=.18):
    """Breathy flute / shakuhachi line. notes = [(Hz or 'A4', seconds), ...] with portamento + delayed vibrato."""
    n = sum(int(round(d * SR)) for _, d in notes); t = np.arange(n) / SR   # sum of per-note lengths (no rounding gap)
    f = np.zeros(n); a = np.zeros(n); pos = 0
    for nm, d in notes:
        m = int(round(d * SR)); st = np.arange(m) / SR
        f[pos:pos + m] = note(nm) if isinstance(nm, str) else nm
        a[pos:pos + m] = np.clip(np.minimum(1, st / .12) * np.minimum(1, (d - st) / .25), 0, 1); pos += m
    f = filt(f, 'lowpass', 6)
    v = 1 + .012 * np.sin(2 * np.pi * vib * t) * np.clip((t % 1.5) / .6, 0, 1)
    ph = np.cumsum(f * v) / SR * 2 * np.pi
    tone = np.sin(ph) + .35 * np.sin(2 * ph + .3) + .12 * np.sin(3 * ph)
    y = (tone * .9 + filt(noise(n), 'bandpass', [900, 5000]) * breath * (1 + 2 * (a < .5))) * filt(a, 'lowpass', 30)
    return norm(y)


def pad(freqs, dur, a=1.5, r=2.0, bright=1200, detune=(-.004, 0, .005)):
    """Warm detuned-saw pad; freqs = list of Hz or note names."""
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f0 in freqs:
        f0 = note(f0) if isinstance(f0, str) else f0
        for d in detune: y += signal.sawtooth(2 * np.pi * f0 * (1 + d) * t + _rng.random() * 6) * .3
    return norm(filt(y, 'lowpass', bright) * adsr(n, a, r))


def drone(f, dur, a=2, r=2, lfo=.07, cut=(300, 800)):
    """Low bowed drone with slow filter breathing (tension beds)."""
    f = note(f) if isinstance(f, str) else f
    n = int(dur * SR); t = np.arange(n) / SR
    y = signal.sawtooth(2 * np.pi * f * t) + .5 * signal.sawtooth(2 * np.pi * f * 1.501 * t + 1)
    c = cut[0] + (cut[1] - cut[0]) * (.5 + .5 * np.sin(2 * np.pi * lfo * t))
    return norm(_varlp(y, c) * adsr(n, a, r))


def bell(f, dur=4.0, bright=1.0):
    """Inharmonic bell / glass / ice shimmer."""
    f = note(f) if isinstance(f, str) else f
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for p, a, d in [(1, 1, 1.2), (2.76, .5 * bright, .9), (5.4, .3 * bright, .5), (8.93, .18 * bright, .3), (13.3, .08 * bright, .2)]:
        y += a * np.sin(2 * np.pi * f * p * t + _rng.random() * 6) * np.exp(-t / (d * dur / 3))
    return norm(y * np.minimum(1, t / .004))


def drum(dur=2.0, f0=110, f1=48, click=.5, decay=2.6):
    """Taiko / tom / cinematic boom: pitch-swept sine + noise skin."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    y = np.sin(np.cumsum(f) / SR * 2 * np.pi) * np.exp(-t * decay)
    y += filt(noise(n), 'lowpass', 900) * np.exp(-t * 30) * click
    y += filt(noise(n), 'bandpass', [1500, 4000]) * np.exp(-t * 80) * click * .5
    return norm(y)


def kick(dur=.5):
    return drum(dur, 160, 45, .3, 9)


def hat(dur=.08, open_=False):
    n = int((dur * (5 if open_ else 1)) * SR)
    return norm(filt(noise(n), 'highpass', 7000) * decay_env(n, .001, .02 if not open_ else .15))


def bass(f, dur, cut=500):
    f = note(f) if isinstance(f, str) else f
    n = int(dur * SR); t = np.arange(n) / SR
    y = signal.sawtooth(2 * np.pi * f * t) * .6 + np.sin(2 * np.pi * f * t)
    return norm(filt(y, 'lowpass', cut) * adsr(n, .01, .08))


# ---------------- sound design ----------------
def whoosh(dur, f0=300, f1=3000):
    """Air movement; f0 > f1 for a falling whoosh."""
    n = int(dur * SR); k = np.linspace(0, 1, n)
    y = _varbp(noise(n), f0 * (f1 / f0) ** k) * np.sin(np.pi * k) ** 2
    return norm(y)


def riser(dur, f0=200, f1=4000):
    n = int(dur * SR); k = np.linspace(0, 1, n); t = np.arange(n) / SR
    tone = np.sin(np.cumsum(f0 * (f1 / f0) ** k) / SR * 2 * np.pi) * .3
    return norm((_varbp(noise(n), f0 * (f1 / f0) ** k) + tone) * k ** 2)


def impact(dur=2.5):
    """Low boom + transient for reveals / hard cuts."""
    return norm(drum(dur, 90, 32, .8, 2.0) + .3 * filt(noise(int(dur * SR)), 'lowpass', 200) * decay_env(int(dur * SR), .005, .4))


def crackle(dur, rate=40, hp=2500, grain=.004):
    """Ice, frost, fire sparks, paper, electricity — sparse filtered clicks."""
    n = int(dur * SR); y = np.zeros(n)
    for p in _rng.integers(0, max(1, n - 400), _rng.poisson(rate * dur)):
        m = min(n - p, int(SR * grain * (1 + _rng.random() * 3)))
        y[p:p + m] += noise(m) * np.exp(-np.arange(m) / (m / 4 + 1)) * (.3 + _rng.random())
    return norm(filt(y, 'highpass', hp))


def fire_bed(dur):
    n = int(dur * SR)
    return norm(norm(filt(pink(n), 'lowpass', 300)) * .4 + crackle(dur, 22, 800, .006))


def wind(dur, base=500, var=.6, seed=0):
    n = int(dur * SR); r = np.random.default_rng(seed)
    lfo = np.repeat(np.cumsum(r.standard_normal(n // 2400 + 2)) * .15, 2400)[:n]
    y = _varbp(pink(n), base * np.exp(var * np.tanh(lfo)))
    return norm(y * (.6 + .4 * np.sin(np.linspace(0, dur * .7, n) + seed) ** 2))


def steps(dur, rate=1.6, band=(900, 5000), jitter=.05):
    """Footsteps: crunchy (snow/gravel) by default; lower band for wood/stone."""
    n = int(dur * SR); y = np.zeros(n); t = 0.0
    while t < dur - .2:
        m = int(.13 * SR); i = int(t * SR)
        y[i:i + m] += filt(noise(m), 'bandpass', list(band)) * (_rng.random(m) < .35) * np.exp(-np.arange(m) / (m / 3))
        t += 1 / rate + _rng.uniform(-jitter, jitter)
    return norm(y)


def heartbeat(bpm=60, beats=4, slow=1.0):
    out = np.zeros(int(SR * (beats * 60 / bpm * slow ** beats + 1))); t0 = 0.0; per = 60 / bpm
    for _ in range(beats):
        for dt, a in ((0, 1), (.28, .7)):
            n = int(.25 * SR); tt = np.arange(n) / SR; i = int((t0 + dt) * SR)
            out[i:i + n] += np.sin(2 * np.pi * (52 - 10 * tt) * tt) * np.exp(-tt * 22) * a
        t0 += per; per *= slow
    return norm(out)


def plink(f0=1400, f1=2500):
    n = int(.35 * SR); t = np.arange(n) / SR
    return np.sin(np.cumsum(f0 + (f1 - f0) * (1 - np.exp(-t * 60))) / SR * 2 * np.pi) * np.exp(-t * 16)


def ui_click(f=2400):
    n = int(.06 * SR); t = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + .3 * filt(noise(n), 'highpass', 4000) * np.exp(-t * 300))


# ---------------- reverb ----------------
def make_ir(sec, decay, bright=6000, seed=1):
    r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
    ir = filt(np.stack([r.standard_normal(n), r.standard_normal(n)], 1) * np.exp(-t / decay)[:, None], 'lowpass', bright)
    ir[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0))


IR = {'hall': None, 'room': None}


def reverb(x, kind='hall', wet=.3):
    if IR[kind] is None: IR[kind] = make_ir(4.5, 1.3, 5000) if kind == 'hall' else make_ir(1.2, .25, 7000)
    ir = IR[kind]; y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet


# ---------------- mixer ----------------
class Mix:
    """Buses: music (ducked under VO), amb (ducked lightly), sfx, vo. Silence windows cut the music for drama."""

    def __init__(self, duration):
        self.N = int(duration * SR); self.dur = duration
        self.bus = {k: np.zeros((self.N, 2)) for k in ('music', 'amb', 'sfx', 'vo')}
        self.cuts = []; self.accents = []

    def place(self, bus, x, t, gain=1.0, pan=0.0, accent=None):
        if x.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); x = np.stack([x * l, x * r], 1) * 1.414
        i = int(round(t * SR))
        if i < 0: x = x[-i:]; i = 0
        j = min(self.N, i + len(x))
        if j > i: self.bus[bus][i:j] += x[:j - i] * gain
        if accent: self.accents.append({'t': round(t, 3), 'what': accent})

    def music(self, x, t, gain=1.0, pan=0.0, accent=None): self.place('music', x, t, gain, pan, accent)
    def sfx(self, x, t, gain=1.0, pan=0.0, accent=None): self.place('sfx', x, t, gain, pan, accent)
    def amb(self, x, t, gain=1.0, pan=0.0): self.place('amb', x, t, gain, pan)

    def silence(self, t0, t1):
        """cut music in [t0,t1] (soft edges) — the pause before a reveal"""
        self.cuts.append((t0, t1))

    def add_vo(self, path, t, gain=1.0, voice='narrator'):
        sr, x = wavfile.read(path); isint = x.dtype.kind in 'iu'; x = x.astype(np.float64)
        if isint: x = x / 32768.0
        if x.ndim > 1: x = x.mean(1)
        x = x / (np.abs(x).max() + 1e-9) * .8
        if sr != SR: x = signal.resample_poly(x, SR, sr)
        x = filt(x, 'highpass', 90)
        if voice == 'ethereal':  # spirit / inner voice: doubled, airy, long reverb
            d0 = int(.018 * SR); dbl = signal.resample_poly(x, 1000, 1006); dbl = np.pad(dbl, (d0, max(0, len(x) - len(dbl) - d0)))[:len(x)]
            air = filt(x, 'highpass', 3000)
            y = reverb(np.stack([x + .35 * dbl + .4 * air, x + .35 * np.roll(dbl, 300) + .4 * air], 1), 'hall', .32)
        else:
            y = reverb(np.stack([x, x], 1), 'room', .12)
        self.place('vo', y, t, gain)

    def render(self, out, lufs=-16.0, duck=.62, stems=True):
        b = self.bus
        mus = reverb(b['music'], 'hall', .35)
        sfx = reverb(b['sfx'], 'room', .15)
        if self.cuts:
            c = np.ones(self.N)
            for a, z in self.cuts: c[int(a * SR):int(z * SR)] = 0
            mus *= filt(c, 'lowpass', 8)[:, None]
        env = signal.sosfilt(sos('lowpass', 4), np.abs(b['vo']).mean(1)) * 6
        env = np.clip(env / (env.max() + 1e-9) * 1.6, 0, 1) if env.max() > 0 else env
        mus = filt(mus, 'highpass', 40, 4); amb = filt(b['amb'], 'highpass', 110)
        mix = mus * (1 - duck * env)[:, None] * .85 + amb * (1 - .4 * env)[:, None] + sfx * (1 - .25 * env)[:, None] + b['vo'] * 1.25
        fi, fo = int(.05 * SR), int(1.0 * SR)
        mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
        mix = np.tanh(norm(mix) * 1.3) * .9                      # gentle soft-clip limiter
        tmp = out + '.pre.wav'; wavfile.write(tmp, SR, (mix * 32767).astype(np.int16))
        # loudness-normalise (EBU R128) with a true-peak ceiling
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'loudnorm=I={lufs}:TP=-1.5:LRA=11', '-ar', str(SR), out], check=True)
        os.remove(tmp)
        if stems:
            for k, v in (('music', mus), ('sfx', sfx + amb), ('vo', b['vo'])):
                wavfile.write(out.replace('.wav', f'_{k}.wav'), SR, (norm(v, .9) * 32767).astype(np.int16))
        if self.accents:
            json.dump(sorted(self.accents, key=lambda a: a['t']), open(out.replace('.wav', '_accents.json'), 'w'), ensure_ascii=False, indent=1)
        print('wrote', out)
