---
name: claude-animation-base
description: "Hand-painted cartoon character animation kit (ClaudeAnimationBase by John Heibel, MIT): the Clawd character with 5 drawn views, 31 acted emotions, eyes/mouths/hats/emotes/dances, p5.js + p5.brush painting, boiling linework, brush-wipe transitions and a headless renderer to MP4. Use whenever a cartoon / Disney-like / hand-drawn animated short with an ACTING character is wanted — 'мультик', 'анимируй персонажа', 'cartoon short', character emotions, model sheets — or to borrow its character-acting principles for another engine."
---

# claude-animation-base

Wrapper around [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT, see `kit/LICENSE`). The whole kit is in `kit/`.

## Use

1. Copy the kit into a fresh project folder: `cp -r <this skill>/kit <project>` and `cd <project>`.
2. **Read `ANIMATION_GUIDE.md` completely before drawing anything** — it holds the rules (handmade / alive / one piece), the character-animation principles, the timing rules models get wrong, the workflow and the full Clawd + engine API. Look at `docs/emotions.jpg` and `docs/views.jpg`.
3. `npm install` (p5, p5.brush, puppeteer-core). Chrome/Chromium is required: in this environment pass `--chrome=/opt/pw-browsers/chromium` style paths or set `CHROME_PATH` to Playwright's Chromium; on machines without a GPU add `--soft-gl` (watercolour fills are slow on software GL — the guide says you may swap them for cheaper fills).
4. Write the film in `src/scenes/`, storyboard first, render contact sheets to check (`node render.mjs --sheet=…`), then `node render.mjs --clip --out=out/video.mp4`.

## What to borrow even when using another engine

- characters ACT: every emotion is a held key pose + face + secondary motion, not a snap;
- turns happen through drawn key views (front → 3/4 → side → back), never fake 3D;
- something happens in every shot; characters are big enough to feel;
- timing is planned for perception (holds long enough to read, anticipation before action).
