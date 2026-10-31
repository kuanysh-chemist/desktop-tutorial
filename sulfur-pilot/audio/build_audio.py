"""Score + sound design for the sulfur pilot (46 s). Times follow src/scenes.js and vo/timeline.json.
  python3 -I build_audio.py out/mix.wav
Acts: engraving (harpsichord-like plucks, lamp, drone) → dive (riser, cut, hit) → grid (cool pad, pulse,
atom plinks, ring snaps, viscous glide) → engraving again (motif in major, steam) → title bell.
"""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *

HERE = os.path.dirname(os.path.abspath(__file__))
D = 46.0
m = Mix(duration=D)
S = scale('D3', 'minor', 3)
Sm = scale('D3', 'major', 3)
motif = [7, 9, 10, 9, 7, 4]          # D4 F4 G4 F4 D4 A3 — "old lab" motif


def jshash(n):  # same as hash() in core.js, to place ring-snap sounds exactly on the sparks
    x = math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


def steam(dur, gain_hp=2500):
    n = int(dur * SR)
    return filt(noise(n), 'highpass', gain_hp) * adsr(n, .25, dur * .6) * .5


def glide(f0, f1, dur, cut=600):  # low sine glide = the melt "thickening"
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .35 * np.sin(2 * ph) + .15 * np.sin(3 * ph)
    return filt(x, 'lowpass', cut) * adsr(n, .4, 1.2)


# ---------- act 1: engraving (0 – 14.6)
m.amb(fire_bed(15.0), 0, gain=.10)
m.amb(crackle(15.0, rate=14), 0, gain=.06)
m.music(drone('D2', 15.2, 2.0, 1.5), 0, gain=.18)
for i, d in enumerate(motif):
    m.music(pluck(S[d], 2.2, .8), .3 + i * .42, gain=.26, pan=(-1) ** i * .25)
for i, d in enumerate(motif[:4]):
    m.music(pluck(S[d] / 2, 2.6, .6), 4.6 + i * .5, gain=.20, pan=-.2)
m.music(pad([S[0], S[2], S[4]], 6.0, 1.5, 2.0, bright=700), 4.2, gain=.08)
m.sfx(whoosh(1.2, 900, 250), 9.1, gain=.16, accent='ink bleed A→B')
for i, d in enumerate([4, 3, 2, 1]):  # descending, darker as the sulfur thickens
    m.music(pluck(S[d] / 2, 2.8, .45), 9.5 + i * .62, gain=.22, pan=.2)
m.music(pad([S[0], S[1], S[5]], 5.0, 1.0, 1.5, bright=500), 9.6, gain=.10)
m.sfx(drum(1.2, 70, 40, .1, 4), 11.45, gain=.22, accent='"смола"')
# ---------- dive (12.6 – 15.25): riser, cut, hit into the grid
m.sfx(riser(2.3, 180, 3500), 12.75, gain=.20)
m.silence(14.75, 15.22)
m.music(impact(2.6), 15.22, gain=.55, accent='grid opens')
m.sfx(bell(note('A5'), 2.5, 1.0), 15.22, gain=.08)

# ---------- act 2: grid (15.25 – 33.0)
G = scale('D3', 'dorian', 3)
m.music(pad([G[0], G[4], G[9], G[11]], 18.2, 1.2, 2.0, bright=1600), 15.2, gain=.12)
m.music(drone('D2', 18.0, 1.0, 1.0, cut=(200, 500)), 15.2, gain=.10)
for i in range(8):  # atoms of the hero ring pop in, rising
    m.sfx(plink(900 + i * 140, 1500 + i * 160), 15.45 + i * .11, gain=.10, pan=-.4 + i * .1)
m.sfx(ui_click(2600), 17.15, gain=.10, accent='8 атомов')
m.sfx(whoosh(1.4, 400, 2200), 18.95, gain=.14, accent='pull back')
# light pulse once the melt flows (100 bpm), stops when chains tangle
beat = 60 / 100
t = 19.4
while t < 29.4:
    m.music(bass(G[0] / 2 if int((t - 19.4) / (beat * 4)) % 2 == 0 else G[3] / 2, beat * .9, 420), t, gain=.16)
    m.sfx(hat(.05), t + beat / 2, gain=.05, pan=.3)
    t += beat
for k in range(12):  # temperature counter ticks
    m.sfx(ui_click(3200), 19.6 + k * .115, gain=.035, pan=.6)
m.music(bell(G[11] * 2, 3.0, .8), 20.75, gain=.10, accent='115° melts')
for k in range(12):
    m.sfx(ui_click(3600), 23.3 + k * .115, gain=.035, pan=.6)
m.sfx(bell(G[9] * 2, 1.5, 1.2), 24.7, gain=.06, accent='159°')
for r in range(12):  # each ring snaps open on its spark
    tb = 25.55 + jshash(r * 13) * 1.35
    m.sfx(plink(3200, 1800), tb, gain=.10, pan=(jshash(r * 3) - .5) * 1.2)
    m.sfx(hat(.03), tb, gain=.08, pan=(jshash(r * 3) - .5) * 1.2)
m.music(impact(2.2), 27.7, gain=.38, accent='ЦЕПИ')
m.music(glide(110, 46, 4.2), 29.6, gain=.30, accent='viscosity climbs')
m.music(pad([G[0], G[3], G[7]], 4.5, 1.5, 1.5, bright=600), 28.6, gain=.10)
m.sfx(kick(.5), 31.5, gain=.40); m.sfx(bell(note('D6'), 1.8, 1.3), 31.5, gain=.08, accent='×10 000')

# ---------- act 3: engraving again (33 – 46)
m.sfx(whoosh(1.0, 2500, 400), 32.95, gain=.18, accent='grid → engraving')
m.sfx(steam(4.5), 33.5, gain=.16, accent='quench in water')
m.amb(fire_bed(13.0), 33.0, gain=.06)
m.music(drone('D2', 13.0, 1.5, 3.0), 33.0, gain=.12)
for i, d in enumerate([7, 9, 11, 12, 11, 14]):  # motif in major: playful "rubber"
    m.music(pluck(Sm[d], 2.0, .85, bend=.03 if i == 3 else 0), 36.7 + i * .3, gain=.22, pan=(-1) ** i * .3)
m.music(pad([Sm[0], Sm[4], Sm[7]], 6.0, 1.5, 2.5, bright=900), 37.4, gain=.08)
for i, d in enumerate([7, 6, 4, 2, 0]):  # "back into rings": a gentle fall
    m.music(pluck(Sm[d], 2.4, .6), 40.4 + i * .36, gain=.18, pan=-.2)
m.music(bell(note('D5'), 4.5, .9), 42.7, gain=.12, accent='title СЕРА')
m.music(bell(note('A5'), 4.0, .8), 42.95, gain=.07, pan=.3)
m.music(drum(2.5, 75, 35, .2), 42.7, gain=.32)
m.music(pad([Sm[0], Sm[4], Sm[9]], 4.0, .5, 2.5, bright=1100), 42.7, gain=.11)

# ---------- narration
for L in json.load(open(os.path.join(HERE, 'vo', 'timeline.json'))):
    m.add_vo(os.path.join(HERE, 'vo', L['id'] + '.wav'), L['start'])

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'mix.wav')
os.makedirs(os.path.dirname(out), exist_ok=True)
m.render(out, lufs=-16)
