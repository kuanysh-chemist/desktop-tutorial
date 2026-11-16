# Timing plan: fits each scene of the rendered video to its narration line and writes
#   out/plan.json  (per scene: old start/dur, speed factor, new start/dur, voice placement)
#   out/cues.json  (sound cue events on the NEW timeline, real-sound / mix.py format, fps 24)
# Scene-local event times come from src/scenes.js (strike(), sparks(), pop(), stamp ...).
import json, os

FPS = 24
ATEMPO = 1.05          # narration is played 5 % faster (Gemini reads slowly)
OLD = [6.6, 5.0, 7.2, 6.2, 6.6, 11.0, 11.0, 7.4, 6.2, 8.2, 5.6, 8.4]
# narration lines in voice/gem/full_31_orus.wav (source seconds, from silence detection)
LINES = [(0.543, 6.832), (7.699, 13.108), (14.182, 21.443), (22.465, 28.994), (29.958, 36.024), (37.094, 49.795),
         (50.833, 64.164), (65.212, 72.003), (72.965, 79.165), (80.249, 89.940), (90.879, 95.910), (97.066, 102.145)]
# (word offset inside the line in source seconds, scene-local picture time it belongs to)
ANCHOR = {
    3: (4.31, 3.55),   # "ұшқынды мүкке" -> the third spark lands on the moss
    4: (0.09, 0.15),   # "1680" -> the year pops
    5: (0.38, 0.14),   # "лап" -> the flame
    6: (9.54, 7.30),   # "лап етіп жанды" -> Walker's stick ignites on the hearth stone
    7: (9.56, 6.20),   # "Енді ... кез келген жерге" -> the boot / wall / table montage
    9: (0.17, 0.25),   # "фосфорлы жақ" -> the stamp lands
    10: (5.58, 4.35),  # "Швед" -> ШВЕЦИЯ
    11: (3.66, 4.0),   # "қауіпсіз" -> the title
    12: (0.69, 1.12),  # "тұтатқан" -> the match ignites
}
F_MIN, F_MAX = 0.86, 1.32
LEAD = 0.30            # voice starts this long after a cut when there is no anchor
TAIL = 0.45            # air after a line before the next cut
GAP = 0.40             # minimum silence between two lines

def plan():
    scenes = []
    old_start = 0.0
    for i, d in enumerate(OLD, 1):
        a, b = LINES[i - 1]
        s = (b - a) / ATEMPO
        if i in ANCHOR:
            w, e = ANCHOR[i]; w /= ATEMPO
            f = max(1.0, (s + TAIL - w) / (d - e))     # long enough for the line after the anchor
            f = min(max(f, F_MIN), F_MAX)
            # do not let the line start more than 0.6 s before the cut
            while e * f - w < -0.6 and f < F_MAX: f += 0.01
            lead = max(e * f - w, -0.55)   # when the anchor cannot be met, the picture event lands a little late
        else:
            lead = 0.6 if i == 1 else LEAD
            f = min(max((lead + s + TAIL) / d, F_MIN), F_MAX)
        if i == 12: f = max(f, 1.0)
        scenes.append(dict(i=i, old_start=old_start, old_dur=d, f=f, lead=lead, speech=s, src=(a, b)))
        old_start += d
    # make room: a line that starts before its cut eats into the previous scene's tail
    for k in range(1, len(scenes)):
        p, c = scenes[k - 1], scenes[k]
        need = p['lead'] + p['speech'] + GAP + max(0.0, -c['lead'])
        if p['old_dur'] * p['f'] < need: p['f'] = need / p['old_dur']
    t = 0.0
    for sc in scenes:
        sc['new_start'] = t; sc['new_dur'] = sc['old_dur'] * sc['f']
        sc['voice_at'] = t + sc['lead']
        t += sc['new_dur']
    return scenes, t

def cues(scenes):
    ev = []
    def at(i, lt, kind, cid, **kw):
        sc = scenes[i - 1]
        e = dict(f=round((sc['new_start'] + lt * sc['f']) * FPS, 2), kind=kind, id=f's{i}:{cid}')
        e.update(kw); ev.append(e)
    # 1 night factory, hand goes to the jaw, "?"
    at(1, 2.6, 'touch', 'hand-jaw', weight=0.4)
    at(1, 4.6, 'pop', 'qmark', weight=0.5)
    # 2 flask shrinks into a match head
    at(2, 1.6, 'whoosh', 'flask-shrink', dur=round(1.7 * scenes[1]['f'] * FPS), apexFrac=0.7)
    at(2, 3.2, 'tick', 'match-head', weight=0.6)
    # 3 flint and steel: three strikes, ember, blowing, flame
    for n, ts in enumerate([0.9, 2.1, 3.3]): at(3, ts, 'strike', f'flint:{n}', weight=1.0 if n == 2 else 0.8)
    at(3, 3.82, 'ember', 'moss')
    at(3, 4.85, 'blow', 'blow:0'); at(3, 6.65, 'blow', 'blow:1')
    at(3, 6.5, 'ignite', 'moss-flame', weight=0.7)
    # 4 Boyle: arrows drawn, stick rubbed on the phosphorus paper (a stroke every 1/3 s from 3.0)
    at(4, 1.1, 'pencil', 'arrow:0'); at(4, 1.9, 'pencil', 'arrow:1')
    for n in range(9): at(4, 3.0 + 0.333 * n + 0.08, 'rub', f'paper:{n}', weight=0.5 + 0.05 * n)
    # 5 LAP!, the balance, the crossed P and the ?
    at(5, 0.12, 'ignite', 'lap', weight=1.6)
    at(5, 2.5, 'clink', 'vial-lands'); at(5, 2.6, 'coins', 'coins-rise')
    at(5, 4.75, 'pencil', 'P'); at(5, 5.3, 'pencil', 'cross'); at(5, 5.8, 'pencil', 'qmark')
    # 6 Walker: stirring, the drop dries, rubbing on the hearth stone, ignition, P x
    at(6, 0.3, 'stir', 'stir')
    for n in range(4): at(6, 5.9 + 0.3125 * n + 0.1, 'scrape', f'hearth:{n}', weight=0.8)
    at(6, 7.25, 'ignite', 'walker', weight=1.3)
    at(6, 8.15, 'gasp', 'walker-shock')
    at(6, 9.0, 'pencil', 'P'); at(6, 9.45, 'pencil', 'cross')
    # 7 sandpaper, Soria drops white phosphorus into the bowl, montage boot / wall / table
    at(7, 0.55, 'sand', 'sandpaper'); at(7, 1.5, 'ignite', 'sandpaper', weight=1.0)
    at(7, 4.72, 'plop', 'white-p');
    for n in range(3):
        at(7, 6.2 + 1.6 * n + 0.12, 'scratch', f'montage:{n}', variant=['boot', 'wall', 'table'][n])
        at(7, 6.2 + 1.6 * n + 0.6, 'ignite', f'montage:{n}', weight=1.0)
    # 8 dipping in the paste, coughing, x-ray, the tooth comes loose
    at(8, 0.7, 'dip', 'dip:0'); at(8, 2.65, 'dip', 'dip:1')
    at(8, 2.2, 'cough', 'worker')
    at(8, 3.7, 'xray', 'xray-in', weight=1.0)
    at(8, 4.3, 'tooth', 'tooth')
    # 9 stamp, back to the girl
    at(9, 0.28, 'stamp', 'stamp', weight=1.5)
    at(9, 3.6, 'pop', 'green-q', weight=0.4)
    # 10 red phosphorus checks, Sweden, painting the strip
    at(10, 1.05, 'pencil', 'check:0'); at(10, 2.15, 'pencil', 'check:1')
    at(10, 5.0, 'paint', 'strip')
    # 11 table strike fails, box strike works
    at(11, 0.32, 'scratch', 'table', variant='table'); at(11, 1.27, 'pencil', 'cross')
    at(11, 2.5, 'scratch', 'box', variant='box'); at(11, 3.0, 'ignite', 'box', weight=1.0)
    at(11, 3.32, 'pencil', 'check')
    # 12 today: match slides along the strip, flame, flask appears
    at(12, 0.4, 'scratch', 'box', variant='box'); at(12, 1.1, 'ignite', 'today', weight=1.0)
    at(12, 3.7, 'whoosh', 'to-flask', dur=round(1.5 * FPS), apexFrac=0.6)
    return ev

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
    scenes, total = plan()
    os.makedirs(os.path.join(root, 'out'), exist_ok=True)
    json.dump(dict(fps=FPS, atempo=ATEMPO, total=total, scenes=scenes), open(os.path.join(root, 'out/plan.json'), 'w'), indent=1)
    ev = sorted(cues(scenes), key=lambda e: e['f'])
    acts = {f's{s["i"]}': dict(**{'from': round(s['new_start'] * FPS)}, dur=round(s['new_dur'] * FPS)) for s in scenes}
    json.dump(dict(fps=FPS, total=round(total * FPS), acts=acts, events=ev), open(os.path.join(root, 'out/cues.json'), 'w'), indent=1, ensure_ascii=False)
    for s in scenes:
        print(f"{s['i']:2d} old {s['old_start']:6.2f}+{s['old_dur']:5.2f}  f {s['f']:.3f}  new {s['new_start']:6.2f}+{s['new_dur']:5.2f}  "
              f"voice {s['voice_at']:6.2f}-{s['voice_at'] + s['speech']:6.2f} (lead {s['lead']:+.2f})")
    print('total', round(total, 2), 's;', len(ev), 'cue events')
