# Builds the narration track on the new timeline: each line is cut from the Gemini read (with a little air),
# sped up by plan.atempo (ffmpeg atempo, pitch kept), high-passed, and placed at its plan voice_at time.
import json, os, subprocess, numpy as np, soundfile as sf

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
plan = json.load(open(os.path.join(root, 'out', 'plan.json')))
src = os.path.join(root, plan.get('voice', 'voice/gem/full_31_orus.wav'))
SR = 48000; PRE, POST = 0.06, 0.18
total = int((plan['total'] + 1.0) * SR)
mix = np.zeros(total, np.float32)
tmp = os.path.join(root, 'out', 'voice_lines'); os.makedirs(tmp, exist_ok=True)
for s in plan['scenes']:
    a, b = s['src']
    f = os.path.join(tmp, f"line{s['i']:02d}.wav")
    af = (f"atrim={max(0, a - PRE):.3f}:{b + POST:.3f},asetpts=PTS-STARTPTS,atempo={plan['atempo']},"
          f"highpass=f=70,acompressor=threshold=-26dB:ratio=3:attack=6:release=140:makeup=3,equalizer=f=3200:t=q:w=1.2:g=2,afade=t=in:d=0.02")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ar', str(SR), '-ac', '1', f], check=True)
    y, _ = sf.read(f, dtype='float32')
    n = len(y); fo = int(0.12 * SR); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    at = int((s['voice_at'] - PRE / plan['atempo']) * SR)
    mix[at:at + n] += y[: max(0, min(n, total - at))]
out = os.path.join(root, 'out', 'audio', 'voice.wav'); os.makedirs(os.path.dirname(out), exist_ok=True)
sf.write(out, np.stack([mix, mix], 1), SR, subtype='FLOAT')
print('wrote', out, f'{total / SR:.2f} s, peak {20 * np.log10(np.abs(mix).max() + 1e-9):.1f} dBFS')
