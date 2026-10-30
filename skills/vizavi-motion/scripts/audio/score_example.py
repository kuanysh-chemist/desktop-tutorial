"""Example score for engine/demo-scenes.js (8 s, night → dawn, title at 2.2 s, tagline wipe at 3.4 s).
Shows the pattern: motif in a mode → arranged per section; silence before the hit; SFX on visual events only.
  python3 -I score_example.py out/mix.wav
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *

m = Mix(duration=8.0)
S = scale('D3', 'dorian', 3)                       # degrees: S[0]=D3, S[7]=D4 …
motif = [7, 9, 11, 9, 7]                          # 5-note motif, reused and varied

# 1. bed: night drone + pad that opens with the dawn
m.music(drone('D2', 8.0, 1.0, 1.5), 0, gain=.22)
m.music(pad([S[0], S[4], S[9]], 8.0, 2.0, 2.0, bright=900), 0, gain=.12)
# 2. motif on plucks before the title (sparse, low register)
for i, d in enumerate(motif[:3]):
    m.music(pluck(S[d] / 2, 2.5, .5), .4 + i * .45, gain=.25, pan=(-1) ** i * .3)
# 3. riser → short silence → hit exactly on the title reveal (visual event at 2.2 s)
m.sfx(riser(1.6, 300, 5000), .55, gain=.18)
m.silence(1.95, 2.18)
m.music(impact(3.0), 2.2, gain=.6, accent='title VIZAVI')
m.music(pad([S[7], S[9], S[11], S[14]], 5.6, .4, 2.5, bright=2200), 2.2, gain=.14)
# 4. motif answered an octave up, brighter, as the sun rises
for i, d in enumerate(motif):
    m.music(pluck(S[d], 3.0, .75, bend=.02 if i == 2 else 0), 3.0 + i * .38, gain=.22, pan=(-1) ** i * .25)
m.music(flute([(S[11], 1.0), (S[12], .6), (S[11], 1.6)]), 4.9, gain=.12)
# 5. SFX tied to picture: tagline wipe, shimmer of dust, final dip
m.sfx(whoosh(1.2, 2500, 600), 3.3, gain=.2, pan=.3, accent='tagline wipe')
for i, f in enumerate([S[14] * 2, S[16] * 2, S[18] * 2]):
    m.music(bell(f, 3, .7), 5.6 + i * .25, gain=.05, pan=(-1) ** i * .5)
m.music(drum(2.5, 80, 35, .3), 7.25, gain=.35, accent='fade to black')
m.amb(wind(8.0, 600, .5), 0, gain=.12)

m.render(sys.argv[1] if len(sys.argv) > 1 else 'mix.wav', lufs=-16)
