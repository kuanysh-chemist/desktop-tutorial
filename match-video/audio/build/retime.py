# Re-times the rendered video scene by scene to out/plan.json (no re-render): each scene is trimmed from the
# source video and its timestamps scaled by the plan's factor; frames are repeated or dropped to stay at 24 fps.
import json, os, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, '..', 'out', 'siringke_v2.mp4')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(root, 'out', 'film_retimed.mp4')
plan = json.load(open(os.path.join(root, 'out', 'plan.json')))
parts = []
for i, s in enumerate(plan['scenes']):
    a, b = s['old_start'], s['old_start'] + s['old_dur']
    n = round((s['new_start'] + s['new_dur']) * 24) - round(s['new_start'] * 24)   # frames this scene gets
    parts.append(f"[0:v]trim=start={a:.4f}:end={b:.4f},setpts=(PTS-STARTPTS)*{s['f']:.5f},fps=24,trim=end_frame={n},setpts=PTS-STARTPTS[v{i}]")
fc = ';'.join(parts) + ';' + ''.join(f'[v{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0[out]'
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[out]', '-c:v', 'libx264', '-preset', 'slow',
       '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '24', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True)
print('wrote', out)
