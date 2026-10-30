"""Narration: offline TTS (Piper) per line → trimmed WAVs → ASR check → word timings → timeline.js/json.

usage:
  python3 -I vo.py lines.tsv out_dir [--voice ru_RU-irina-medium] [--lang ru] [--speed 1.1]

lines.tsv (tab separated, # comments allowed):
  id <TAB> start_seconds <TAB> who <TAB> text
  L01	0.55	n	Она убивала одним дыханием.
  L02	3.4	y	Ты слишком молод.          # who: any tag; captions() styles who == 'y' as the alternate voice

Writes out_dir/<id>.wav, out_dir/timeline.json and out_dir/timeline.js (window.TL = [...]) with per-word times,
and prints the ASR transcript of every line next to the intended text. TTS mangles some words (names, rare
stress); when a line reads back wrong, REPHRASE it (synonym, word order) and rerun — stress marks like "+"
are spoken literally by Piper. Lines that overlap the next start time are reported.

Needs: pip install piper-tts faster-whisper; the voice model is downloaded from huggingface rhasspy/piper-voices.
Russian voices: ru_RU-irina-medium (female, clearest), ru_RU-denis-medium, ru_RU-dmitri-medium (male).
English: en_US-lessac-medium, en_GB-alan-medium, … This is a synthetic voice — say so when delivering.
"""
import json, os, subprocess, sys, urllib.request
import numpy as np


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def fetch_voice(voice, cache):
    os.makedirs(cache, exist_ok=True)
    lang_region, spk, q = voice.split('-')
    base = f"https://huggingface.co/rhasspy/piper-voices/resolve/main/{lang_region.split('_')[0]}/{lang_region}/{spk}/{q}/{voice}"
    for ext in ('.onnx', '.onnx.json'):
        p = os.path.join(cache, voice + ext)
        if not os.path.exists(p):
            print('downloading', base + ext); urllib.request.urlretrieve(base + ext, p)
    return os.path.join(cache, voice + '.onnx')


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


def main():
    tsv, out = sys.argv[1], sys.argv[2]
    voice, lang, speed = arg('--voice', 'ru_RU-irina-medium'), arg('--lang', 'ru'), float(arg('--speed', '1.1'))
    os.makedirs(out, exist_ok=True)
    model = fetch_voice(voice, os.path.expanduser('~/.cache/piper-voices'))
    lines = []
    for raw in open(tsv, encoding='utf-8'):
        raw = raw.split('#')[0].rstrip('\n')
        if not raw.strip(): continue
        id_, start, who, text = raw.split('\t', 3)
        lines.append(dict(id=id_.strip(), start=float(start), who=who.strip(), text=text.strip()))
    from faster_whisper import WhisperModel
    asr = WhisperModel('small', device='cpu', compute_type='int8')
    prev_end = -1
    for L in lines:
        rawp, wav = os.path.join(out, L['id'] + '.raw.wav'), os.path.join(out, L['id'] + '.wav')
        subprocess.run([sys.executable, '-m', 'piper', '-m', model, '--length-scale', str(speed if L['who'] != 'y' else speed * 1.07),
                        '--noise-scale', '0.5', '--noise-w-scale', '0.6', '-f', rawp], input=L['text'], text=True, check=True, capture_output=True)
        trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', rawp, '-af', trim, '-ar', '48000', wav], check=True); os.remove(rawp)
        L['dur'] = round(dur(wav), 3); L['end'] = round(L['start'] + L['dur'], 3)
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
        segs, _ = asr.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, language=lang, word_timestamps=True)
        ws = [w for s in segs for w in s.words]; mine = L['text'].split()
        heard = ' '.join(w.word.strip() for w in ws)
        if len(ws) == len(mine):
            L['words'] = [[m, round(L['start'] + w.start, 3)] for w, m in zip(ws, mine)]
        else:  # fall back to character-proportional timing
            tot = sum(len(m) for m in mine); acc = 0; L['words'] = []
            for m in mine: L['words'].append([m, round(L['start'] + L['dur'] * acc / tot, 3)]); acc += len(m)
        flag = '  <-- OVERLAPS previous line' if L['start'] < prev_end + .25 else ''
        print(f"{L['id']:5s} {L['start']:6.2f}-{L['end']:6.2f}  text : {L['text']}{flag}\n{'':21s}heard: {heard}")
        prev_end = L['end']
    json.dump(lines, open(os.path.join(out, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(out, 'timeline.js'), 'w').write('window.TL = ' + json.dumps(lines, ensure_ascii=False) + ';\n')
    print('wrote', os.path.join(out, 'timeline.js'))


if __name__ == '__main__':
    main()
