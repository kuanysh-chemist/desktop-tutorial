#!/usr/bin/env bash
# Review a DECODED export (not the HTML): technical facts + visual sheets + audio evidence.
#   review.sh film.mp4 outdir [cut times in seconds...]
# Produces in outdir:
#   probe.txt          codec / size / fps / frame count / duration / audio stream / loudness (LUFS, true peak)
#   sheet_XX.jpg       contact sheets, one frame per 0.5 s, 24 per sheet (12 s each) — read ALL of them
#   cuts.jpg           6 frames around every given cut (−0.4 … +0.4 s) — transitions in one image
#   spectrum.png       spectrogram of the mix (music/VO/SFX layout, silences, mud in the lows)
#   transcript.txt     speech recognised from the FINAL mix (only if faster-whisper is installed) — intelligibility check
# Sheets show composition and continuity; they do NOT prove motion quality or sound quality — still watch/listen
# where possible and state what was not checked.
set -euo pipefail
V="$1"; O="$2"; shift 2; mkdir -p "$O/fr"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
{
  ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,nb_frames,sample_rate,channels -show_entries format=duration,size -of compact "$V"
  ffmpeg -nostats -i "$V" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" || echo "no audio stream"
} | tee "$O/probe.txt"
n=$(python3 -c "import math;print(math.ceil($DUR/12))")
for i in $(seq 0 $((n-1))); do
  st=$((i*12))
  ffmpeg -v error -y -ss $st -t 12 -i "$V" -vf "fps=2,scale=400:-1,drawtext=text='%{pts\:flt}':x=5:y=5:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x4:padding=3" -frames:v 1 "$O/sheet_$(printf %02d $i).jpg"
done
if [ $# -gt 0 ]; then
  k=0
  for c in "$@"; do for o in -0.4 -0.2 -0.07 0.07 0.2 0.4; do
    t=$(python3 -c "print(round(max(0,min($DUR-0.02,$c+$o)),2))"); k=$((k+1))
    ffmpeg -v error -y -ss "$t" -i "$V" -frames:v 1 -vf "scale=320:-1,drawtext=text='$t':x=4:y=4:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6" "$O/fr/$(printf %03d $k).jpg"
  done; done
  ffmpeg -v error -y -framerate 1 -i "$O/fr/%03d.jpg" -vf "tile=6x$#:padding=2" -frames:v 1 "$O/cuts.jpg"
fi
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$V" | grep -q .; then
  ffmpeg -v error -y -i "$V" -lavfi "showspectrumpic=s=1600x400:legend=1:scale=log:fscale=log" "$O/spectrum.png"
  if python3 -c "import faster_whisper" 2>/dev/null; then
    ffmpeg -v error -y -i "$V" -ac 1 -ar 16000 -f s16le "$O/a.raw"
    python3 -I - "$O/a.raw" "${LANG_ASR:-ru}" > "$O/transcript.txt" 2>/dev/null <<'EOF' || true
import sys, numpy as np
from faster_whisper import WhisperModel
a = np.fromfile(sys.argv[1], dtype=np.int16).astype(np.float32) / 32768
for s in WhisperModel("small", device="cpu", compute_type="int8").transcribe(a, language=sys.argv[2])[0]:
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}")
EOF
    rm -f "$O/a.raw"; echo "--- transcript of final mix:"; cat "$O/transcript.txt"
  fi
fi
ls "$O"
