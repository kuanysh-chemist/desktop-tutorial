# Writes audio/sounddesign.json (real-sound mix.py format) from out/plan.json: real Mixkit recordings placed on the
# picture's cue events (out/cues.json), ambience beds per location, the narration on the music bus (there is no music),
# ambience ducked under the voice. Film times are computed from scene-local picture times via the plan.
import json, os

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
plan = json.load(open(os.path.join(root, 'out', 'plan.json')))
SC = {s['i']: s for s in plan['scenes']}
def T(i, lt):  # scene-local picture time -> film seconds
    s = SC[i]; return round(s['new_start'] + lt * s['f'], 3)

A = 'audio/assets/'
samples = {
    # fire / matches
    'fx.match':      {'file': A + 'fire/mk-2590_fire-match-lighting.wav', 'start': 0.06, 'end': 1.30, 'mono': True,
                      'norm_peak_db': -3, 'fade_out': 0.35, 'eq': {'hp': 120}, '_doc': 'scratch at 0.08, flare 0.44-0.92 (earshot find z +4.6 strong)'},
    'fx.flare':      {'file': A + 'fire/mk-1346_soft-woosh-fire.wav', 'start': 0.10, 'end': 2.6, 'norm_peak_db': -6,
                      'fade_out': 0.6, 'eq': {'hp': 90}, 'env': [[0, -2], [0.6, 0], [1.4, -3], [2.4, -12]]},
    'fx.flare_big':  {'file': A + 'fire/mk-1328_fire-swoosh-burning.wav', 'start': 0.62, 'end': 3.2, 'norm_peak_db': -4, 'fade_in': 0.05,
                      'fade_out': 0.8, 'eq': {'hp': 70}, '_doc': 'the recording rises from silence until 0.8 s: trimmed to its last 0.2 s of build'},
    'fx.crackle':    {'file': A + 'fire/mk-1329_campfire-burning-crackles.wav', 'start': 0.3, 'end': 2.0, 'mono': True,
                      'norm_peak_db': -10, 'fade_out': 0.5, 'eq': {'hp': 300}},
    # flint and steel
    'fl.scrape':     {'file': A + 'foley/mk-809_metal-scrape.wav', 'start': 0.005, 'end': 0.40, 'mono': True, 'norm_peak_db': -6,
                      'fade_out': 0.08, 'eq': {'hp': 400}},
    'fl.spark.0':    {'file': A + 'fire/mk-1816_gas-stove-spark-ignition.wav', 'start': 3.555, 'end': 3.70, 'mono': True, 'norm_peak_db': -8, 'fade_out': 0.04},
    'fl.spark.1':    {'file': A + 'fire/mk-1816_gas-stove-spark-ignition.wav', 'start': 3.795, 'end': 3.94, 'mono': True, 'norm_peak_db': -8, 'fade_out': 0.04},
    'fl.spark.2':    {'file': A + 'fire/mk-1816_gas-stove-spark-ignition.wav', 'start': 2.295, 'end': 2.45, 'mono': True, 'norm_peak_db': -8, 'fade_out': 0.04},
    'hu.blow':       {'file': A + 'human/mk-2660_person-blows.wav', 'start': 0.0, 'end': 0.42, 'mono': True, 'norm_peak_db': -8,
                      'pitch': -2, 'fade_out': 0.12, 'eq': {'hp': 150}},
    # writing, rubbing, scraping
    'wr.pencil.0':   {'file': A + 'foley/mk-3194_writing-pencil.wav', 'start': 0.50, 'end': 0.95, 'mono': True, 'norm_peak_db': -10, 'fade_out': 0.06},
    'wr.pencil.1':   {'file': A + 'foley/mk-3194_writing-pencil.wav', 'start': 1.00, 'end': 1.50, 'mono': True, 'norm_peak_db': -10, 'fade_out': 0.06},
    'wr.scribble':   {'file': A + 'foley/mk-2369_writing-scribble.wav', 'start': 0.0, 'end': 0.55, 'mono': True, 'norm_peak_db': -10, 'fade_out': 0.08},
    'wr.paper':      {'file': A + 'foley/mk-1530_paper-slide.wav', 'start': 0.01, 'end': 0.47, 'mono': True, 'norm_peak_db': -10, 'fade_out': 0.08},
    'wr.sand':       {'file': A + 'foley/mk-2369_writing-scribble.wav', 'start': 0.0, 'end': 1.0, 'mono': True, 'norm_peak_db': -7,
                      'pitch': -3, 'fade_out': 0.12, '_doc': 'coarse scribble pitched down = sandpaper under the match head'},
    'wr.scratch':    {'file': A + 'foley/mk-2369_writing-scribble.wav', 'start': 0.55, 'end': 1.0, 'mono': True, 'norm_peak_db': -9, 'pitch': -2, 'fade_in': 0.03, 'fade_out': 0.08},
    'wd.scrape':     {'file': A + 'foley/mk-3157_creaky-wooden-scrap.wav', 'start': 0.0, 'end': 0.55, 'mono': True, 'norm_peak_db': -9, 'fade_out': 0.1},
    'st.scrape':     {'file': A + 'foley/mk-809_metal-scrape.wav', 'start': 0.005, 'end': 0.40, 'mono': True, 'norm_peak_db': -10,
                      'pitch': -6, 'fade_out': 0.1, 'eq': {'hp': 200, 'lp': 6000}, '_doc': 'stick on the hearth stone: the metal scrape a fifth lower, top rolled off'},
    # objects
    'ob.glass':      {'file': A + 'foley/mk-2836_glasses-clinking.wav', 'start': 0.0, 'end': 0.6, 'mono': True, 'norm_peak_db': -12, 'fade_out': 0.2},
    'ob.coins':      {'file': A + 'foley/mk-1993_clinking-coins.wav', 'start': 0.03, 'end': 1.02, 'mono': True, 'norm_peak_db': -8, 'fade_out': 0.2},
    'ob.plop':       {'file': A + 'foley/mk-1317_water-bubble.wav', 'start': 0.0, 'end': 0.42, 'mono': True, 'norm_peak_db': -9, 'pitch': -3, 'fade_out': 0.08},
    'ob.squelch':    {'file': A + 'foley/mk-3058_boot-stomp-mud.wav', 'start': 0.0, 'end': 0.6, 'mono': True, 'norm_peak_db': -12, 'pitch': 5, 'fade_out': 0.12, 'eq': {'hp': 250}},
    'ob.stamp':      {'file': A + 'foley/mk-2182_wood-hard-hit.wav', 'start': 0.0, 'end': 0.36, 'mono': True, 'norm_peak_db': -3, 'pitch': -2, 'fade_out': 0.1},
    'ob.stamp_body': {'file': A + 'foley/mk-2934_bowl-put-in-table.wav', 'start': 0.0, 'end': 0.5, 'mono': True, 'norm_peak_db': -10, 'pitch': -4, 'fade_out': 0.15},
    'ob.tooth':      {'file': A + 'foley/mk-2183_glass-hitting-metal.wav', 'start': 0.0, 'end': 0.3, 'mono': True, 'norm_peak_db': -16, 'pitch': 4, 'fade_out': 0.08},
    'ob.bubble':     {'file': A + 'foley/mk-1317_water-bubble.wav', 'start': 0.0, 'end': 0.42, 'mono': True, 'norm_peak_db': -18, 'fade_out': 0.08},
    'ob.bubble_hi':  {'file': A + 'foley/mk-1317_water-bubble.wav', 'start': 0.0, 'end': 0.42, 'mono': True, 'norm_peak_db': -20, 'pitch': 3, 'fade_out': 0.08},
    'hu.cough':      {'file': A + 'human/mk-2218_sick-woman-coughing.wav', 'start': 0.16, 'end': 0.99, 'mono': True, 'norm_peak_db': -9, 'fade_out': 0.1},
    # transitions
    'mo.xray':       {'file': A + 'motion/mk-677_cinematic-glass-hit-suspense.wav', 'start': 0.0, 'end': 3.6, 'norm_peak_db': -8, 'fade_out': 1.2},
    'mo.woosh':      {'file': A + 'motion/mk-1489_air-woosh.wav', 'start': 0.0, 'end': 2.3, 'norm_peak_db': -12, 'fade_out': 0.4},
}
pools = {
    'p.match': ['fx.match'], 'p.flare': ['fx.flare'], 'p.flare_big': ['fx.flare_big'], 'p.crackle': ['fx.crackle'],
    'p.scrape': ['fl.scrape'], 'p.spark': ['fl.spark.0', 'fl.spark.1', 'fl.spark.2'], 'p.blow': ['hu.blow'],
    'p.pencil': ['wr.pencil.0', 'wr.scribble', 'wr.pencil.1'], 'p.paper': ['wr.paper'], 'p.sand': ['wr.sand'],
    'p.scratch': ['wr.scratch'], 'p.wood': ['wd.scrape'], 'p.stone': ['st.scrape'], 'p.glass': ['ob.glass'],
    'p.coins': ['ob.coins'], 'p.plop': ['ob.plop'], 'p.squelch': ['ob.squelch'], 'p.stamp': ['ob.stamp'],
    'p.stamp_body': ['ob.stamp_body'], 'p.tooth': ['ob.tooth'], 'p.cough': ['hu.cough'], 'p.xray': ['mo.xray'],
    'p.woosh': ['mo.woosh'],
}
rules = [
    # a match / stick ignites: the real strike (its flare lands 0.38 s after the scratch) + the flame's breath
    {'name': 'ig.match.today', 'match': {'kind': 'ignite', 'id': 'today'}, 'pool': 'p.match', 'gain_db': -9, 'align': 'start', 'offset': -0.40, 'pan': 0},
    {'name': 'ig.match', 'match': {'kind': 'ignite', 'id': '^(?!s12)'}, 'pool': 'p.match', 'gain_db': -6, 'weight_db': 3, 'align': 'start', 'offset': -0.40, 'pan': 0},
    {'name': 'ig.flare', 'match': {'kind': 'ignite', 'id': '^(?!s5:lap|s6:walker|s7:montage:[12])'}, 'pool': 'p.flare', 'gain_db': -14, 'weight_db': 4, 'align': 'start', 'offset': -0.08, 'pan': 0},
    {'name': 'ig.lap', 'match': {'kind': 'ignite', 'id': 'lap'}, 'pool': 'p.flare_big', 'gain_db': -9, 'align': 'start', 'offset': -0.12, 'pan': 0},
    {'name': 'ig.walker', 'match': {'kind': 'ignite', 'id': 'walker'}, 'pool': 'p.flare_big', 'gain_db': -13, 'align': 'start', 'offset': -0.12, 'pan': 0.1},
    {'name': 'em.crackle', 'match': {'kind': 'ember'}, 'pool': 'p.crackle', 'gain_db': -10, 'align': 'start', 'pan': 0.1},
    # flint on steel: scrape + a spark click
    {'name': 'fl.scrape', 'match': {'kind': 'strike'}, 'pool': 'p.scrape', 'gain_db': -10, 'weight_db': 3, 'align': 'attack', 'offset': -0.03, 'pan': 0.05},
    {'name': 'fl.spark', 'match': {'kind': 'strike'}, 'pool': 'p.spark', 'mode': 'cycle', 'gain_db': -12, 'jitter_db': 1, 'align': 'attack', 'pan': -0.05},
    {'name': 'hu.blow', 'match': {'kind': 'blow'}, 'pool': 'p.blow', 'gain_db': -10, 'align': 'start', 'pan': -0.1},
    {'name': 'hu.blow2', 'match': {'kind': 'blow', 'id': 'blow:0'}, 'pool': 'p.blow', 'gain_db': -13, 'align': 'start', 'offset': 0.36, 'pan': -0.1},
    {'name': 'hu.blow3', 'match': {'kind': 'blow', 'id': 'blow:0'}, 'pool': 'p.blow', 'gain_db': -15, 'align': 'start', 'offset': 0.72, 'pan': -0.1},
    # drawing on paper (arrows, P, crosses, checks), rubbing, sand, scratching
    {'name': 'wr.pencil', 'match': {'kind': 'pencil'}, 'pool': 'p.pencil', 'mode': 'cycle', 'gain_db': -16, 'jitter_db': 1, 'align': 'start', 'pan': 0},
    {'name': 'wr.rub', 'match': {'kind': 'rub'}, 'pool': 'p.paper', 'gain_db': -17, 'jitter_db': 1.5, 'weight_db': 2, 'align': 'start', 'pan': 0},
    {'name': 'wr.sand', 'match': {'kind': 'sand'}, 'pool': 'p.sand', 'gain_db': -10, 'align': 'start', 'pan': 0.1},
    {'name': 'wr.scratch', 'match': {'kind': 'scratch', 'variant': 'boot'}, 'pool': 'p.scratch', 'gain_db': -12, 'align': 'start', 'pan': 0.1},
    {'name': 'wr.scratch.wall', 'match': {'kind': 'scratch', 'variant': 'wall'}, 'pool': 'p.stone', 'gain_db': -8, 'align': 'start', 'pan': 0.1},
    {'name': 'wr.scratch.table', 'match': {'kind': 'scratch', 'variant': 'table'}, 'pool': 'p.wood', 'gain_db': -4, 'align': 'start', 'pan': 0.1},
    {'name': 'wr.scratch.box', 'match': {'kind': 'scratch', 'variant': 'box'}, 'pool': 'p.scratch', 'gain_db': -13, 'align': 'start', 'pan': 0.05},
    {'name': 'st.scrape', 'match': {'kind': 'scrape'}, 'pool': 'p.stone', 'gain_db': -9, 'jitter_db': 1.5, 'align': 'start', 'pan': 0.05},
    {'name': 'wr.paint', 'match': {'kind': 'paint'}, 'pool': 'p.paper', 'gain_db': -18, 'align': 'start', 'pan': 0},
    # objects
    {'name': 'ob.glass', 'match': {'kind': 'clink'}, 'pool': 'p.glass', 'gain_db': -10, 'align': 'attack', 'pan': -0.15,
     'qa_ok': 'the glass contact (attack) is on the vial landing frame; the measured peak is the ring after it'},
    {'name': 'ob.coins', 'match': {'kind': 'coins'}, 'pool': 'p.coins', 'gain_db': -10, 'align': 'attack', 'pan': 0.15,
     'qa_ok': 'a cascade of coins: the first coin is on the cue, the loudest lands later as the pan settles'},
    {'name': 'ob.plop', 'match': {'kind': 'plop'}, 'pool': 'p.plop', 'gain_db': -10, 'align': 'attack', 'pan': 0.1},
    {'name': 'ob.dip', 'match': {'kind': 'dip'}, 'pool': 'p.squelch', 'gain_db': -14, 'align': 'attack', 'pan': 0},
    {'name': 'hu.cough', 'match': {'kind': 'cough'}, 'pool': 'p.cough', 'gain_db': -11, 'align': 'attack', 'pan': -0.1},
    {'name': 'mo.xray', 'match': {'kind': 'xray'}, 'pool': 'p.xray', 'gain_db': -10, 'align': 'attack', 'pan': 0,
     'qa_ok': 'the hit lands on the cut to the x-ray; its long swell peaks later by design'},
    {'name': 'ob.tooth', 'match': {'kind': 'tooth'}, 'pool': 'p.tooth', 'gain_db': -10, 'align': 'attack', 'pan': 0.1},
    {'name': 'ob.stamp', 'match': {'kind': 'stamp'}, 'pool': 'p.stamp', 'gain_db': -5, 'align': 'attack', 'pan': 0},
    {'name': 'mo.woosh', 'match': {'kind': 'whoosh'}, 'pool': 'p.woosh', 'gain_db': -14, 'align': 'peak', 'offset': 0.6, 'pan': 0},
]
# small flask bubbles while the flask is on screen (scene 2 until it shrinks; scene 12 from 4.2)
place = []
for k, lt in enumerate([0.75, 1.15, 1.5, 1.9, 2.35]):
    place.append({'sample': 'ob.bubble' if k % 2 == 0 else 'ob.bubble_hi', 'at': T(2, lt), 'gain_db': -10 - (2 if lt > 1.6 else 0), 'pan': 0.05})
for k, lt in enumerate([4.6, 5.5, 5.95, 6.5, 7.0, 7.6]):
    place.append({'sample': 'ob.bubble' if k % 2 else 'ob.bubble_hi', 'at': T(12, lt), 'gain_db': -11, 'pan': -0.05})
# the narration (Gemini TTS, line-placed by build/voice.py) rides on the sfx bus; the music bus carries the music
samples['vo.narration'] = {'file': 'audio/out/audio/voice.wav', 'fade_in': 0.0, 'fade_out': 0.05, 'qa_ok': 'the narration is meant to sit above the music in the presence band'}
place.append({'sample': 'vo.narration', 'at': 0.0, 'align': 'start', 'bus': 'sfx', 'gain_db': 0.0})

NIGHT = A + 'ambience/mk-2414_night-forest-insects.wav'
CRICK = A + 'ambience/mk-1789_summer-night-crickets-loop.wav'
FIRE = A + 'fire/mk-1330_campfire-crackles.wav'
FIRE2 = A + 'fire/mk-1329_campfire-burning-crackles.wav'
amb = [
    {'name': 'am.night1', 'file': NIGHT, 'src_start': 4.0, 'at': 0.0, 'until': T(2, 4.6), 'fade_in': 0.9, 'fade_out': 1.2, 'gain_db': -6,
     'width': 0.8, 'eq': {'hp': 200, 'lp': 11000}, 'auto': [[0, 0], [T(2, 0) - 0.3, 0], [T(2, 0.6), -7]]},
    {'name': 'am.dusk', 'file': CRICK, 'src_start': 2.0, 'at': T(3, 0), 'until': T(3, 7.2), 'fade_in': 0.4, 'fade_out': 0.3, 'gain_db': -12,
     'width': 0.6, 'eq': {'hp': 300, 'lp': 10000}},
    {'name': 'am.hearth', 'file': FIRE, 'src_start': 2.0, 'at': T(6, 5.6), 'until': T(6, 11.0), 'fade_in': 0.15, 'fade_out': 0.8, 'gain_db': -9,
     'width': 0.5, 'eq': {'hp': 150}, 'auto': [[T(6, 5.6), 0], [T(6, 7.95), 0], [T(6, 8.1), -7]]},
    {'name': 'am.night9', 'file': NIGHT, 'src_start': 30.0, 'at': T(9, 2.6), 'until': T(9, 6.2), 'fade_in': 0.5, 'fade_out': 0.3, 'gain_db': -7,
     'width': 0.8, 'eq': {'hp': 200, 'lp': 11000}},
]
# a burning match crackles quietly while its flame is on screen
for n, (i, a, b) in enumerate([(3, 6.5, 7.2), (5, 0.2, 1.9), (7, 1.55, 2.8), (7, 6.85, 7.8), (7, 8.45, 9.4), (7, 10.05, 11.0),
                                (11, 3.05, 5.6), (12, 1.15, 3.6)]):
    amb.append({'name': f'am.flame{n}', 'file': FIRE2, 'src_start': 1.0 + 1.3 * n, 'at': T(i, a), 'until': T(i, b), 'fade_in': 0.12,
                'fade_out': 0.35, 'gain_db': -15, 'width': 0.25, 'eq': {'hp': 400}})
# duck the ambience bus 5 dB under each narration line
ride = [[0, 0]]
for s in plan['scenes']:
    a, b = s['voice_at'], s['voice_at'] + s['speech']
    ride += [[round(a - 0.25, 3), 0], [round(a, 3), -5], [round(b, 3), -5], [round(b + 0.35, 3), 0]]
# music: Mixkit "Classical 3" (solo piano, C major, 129.9 BPM, bars of 1.847 s in 4-bar phrases; a near-silent bar
# closes each phrase). One splice at a phrase start removes the quieter middle (source bars 32-39, 8 bars = 2 phrases)
# under the x-ray, where the music is already ducked 11 dB. The full section (source bars 24-30) lands on Soria (film
# ~44.3) and the piece's own ending (bars 52-55) resolves the last scene.
SPLICE_FILM = 59.11          # source bar 32 (59.56 s) -> source bar 40 (74.34 s); film = src - 0.45, then src - 15.23
music = {'file': 'audio/assets/music2/mk-710_classical-3.wav', 'src_bpm': 129.913, 'stretch': 'none', 'gain_db': 2.5,
         'segments': [
             {'label': 'src bars 0-31 (intro, build, full section on Soria): film = src - 0.45',
              'src_from': 0.45, 'src_to': 59.56, 'at': 0.0, 'fade_in': 0.02, 'fade_out': 0.04},
             {'label': 'src bars 40-57 (phrase start, 8 bars later) to the final chord: film = src - 15.23',
              'src_from': 74.34, 'src_to': 105.1, 'at': SPLICE_FILM, 'fade_in': 0.012, 'fade_out': 0.4, 'tail_fade': 1.5},
         ]}
# the music dips 7 dB under each narration line, sits lower under the x-ray and the stamp, and opens up between lines
mride = [[0, 0]]
for s_ in plan['scenes']:
    a, b = s_['voice_at'], s_['voice_at'] + s_['speech']
    mride += [[round(a - 0.3, 3), 0], [round(a, 3), -6], [round(b, 3), -6], [round(b + 0.4, 3), 0]]
x0, x1 = T(8, 3.6), T(9, 2.6)
mride = [p for p in mride if not (x0 <= p[0] <= x1)] + [[round(x0, 3), -7], [round(x0 + 0.2, 3), -11], [round(x1 - 0.3, 3), -11], [round(x1, 3), -7]]
mride.sort()
design = {
    '_doc': 'Сіріңке тарихы: narration (Gemini TTS, Charon) + real Mixkit recordings only (no synthesis), placed on the picture cues computed in build/plan.py. Built by build/design.py; rendered by the real-sound skill mix.py.',
    'duration': round(plan['total'], 3), 'cues': 'audio/out/cues.json',
    'samples': samples, 'pools': pools, 'rules': rules, 'place': place, 'ambience': amb, 'music': music,
    '_buses_doc': 'ambience ducks 5 dB and the music 7 dB under every narration line (11 dB under the x-ray / stamp); effects and narration on the sfx bus stay dry and centred',
    'buses': {'amb': {'gain_db': 0.0, 'auto': ride}, 'sfx': {'gain_db': 0.0}, 'music': {'gain_db': 0.0, 'auto': mride}},
    '_master_doc': '-14 LUFS for social; voice-led, so the compressor stays on to keep the narration even',
    'master': {'lufs': -14, 'ceiling': 0.77, 'no_glue': True},
}
json.dump(design, open(os.path.join(root, 'sounddesign.json'), 'w'), indent=1, ensure_ascii=False)
print('wrote audio/sounddesign.json:', len(samples), 'samples,', len(rules), 'rules,', len(place), 'placements,', len(amb), 'beds')
