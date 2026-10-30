// Deterministic parallel renderer: page with window.renderAt(t) → MP4 (H.264 yuv420p, exact fps), optional audio mux.
//
//   node render.js --page project/index.html --out film.mp4 [--audio mix.wav] [--fps 60] [--duration 84]
//                  [--workers 4] [--crf 18] [--from 0 --to 12]   (range = quick partial render for review)
//   node render.js --page project/index.html --stills outdir 0.5 3 12.25 ...      (full-res JPG stills)
//   node render.js --page project/index.html --bench                               (ms/frame on 6 sample frames)
//
// Needs Playwright with Chromium (require('playwright')) and ffmpeg on PATH. Each worker is its own browser
// rendering a contiguous frame range into a high-quality intermediate; parts are concatenated without
// re-timing, then encoded once. Duration defaults to window.DURATION from the page.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn, execFileSync } = require('child_process');

const argv = process.argv.slice(2), opt = { fps: 60, workers: Math.max(1, Math.min(4, os.cpus().length)), crf: 18 }, rest = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['bench'].includes(k)) opt[k] = true; else opt[k] = argv[++i]; } else rest.push(a); }
if (!opt.page) { console.error('need --page'); process.exit(2); }
const pageURL = 'file://' + path.resolve(opt.page) + '?render=1';
const fps = +opt.fps;

async function openPage() {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  // a missing optional file (e.g. timeline.js before narration exists) is a warning, not a render failure
  p.on('console', m => { if (m.type() !== 'error') return; if (/Failed to load resource/.test(m.text())) { if (!openPage.warned) console.warn('warning:', m.text(), '(missing file referenced by the page)'); openPage.warned = true; } else errors.push(m.text()); });
  await p.goto(pageURL); await p.waitForFunction(() => window.LOADED === true, null, { timeout: 60000 });
  const [w, h, dur] = await p.evaluate(() => { const c = document.getElementById('c'); return [c.width, c.height, window.DURATION || 0]; });
  await p.setViewportSize({ width: w, height: h });
  return { b, p, w, h, dur, errors };
}
async function frameJPG(pg, t, q = 95) { await pg.evaluate(t => renderAt(t), t); return pg.screenshot({ type: 'jpeg', quality: q, clip: { x: 0, y: 0, width: pg.viewportSize().width, height: pg.viewportSize().height } }); }

(async () => {
  if (opt.stills) {
    fs.mkdirSync(opt.stills, { recursive: true }); const { b, p, errors } = await openPage();
    for (const t of rest) { const T = Date.now(); fs.writeFileSync(path.join(opt.stills, `f_${(+t).toFixed(2).padStart(6, '0')}.jpg`), await frameJPG(p, +t, 90)); console.log(`t=${t}  ${Date.now() - T} ms`); }
    if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
    await b.close(); return;
  }
  if (opt.bench) {
    const { b, p, dur, errors } = await openPage(); const ts = [0, .2, .4, .6, .8, .95].map(k => k * dur); let tot = 0;
    for (const t of ts) { const T = Date.now(); await frameJPG(p, t); const ms = Date.now() - T; tot += ms; console.log(`t=${t.toFixed(2)} ${ms} ms`); }
    const per = tot / ts.length, frames = Math.round(dur * fps);
    console.log(`avg ${per.toFixed(0)} ms/frame → ~${(frames * per / 1000 / 60 / opt.workers).toFixed(1)} min for ${frames} frames on ${opt.workers} workers`);
    if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
    await b.close(); return;
  }
  // --- full / partial render
  const probe = await openPage(); const dur = +(opt.duration || probe.dur); await probe.b.close();
  if (!dur) { console.error('no duration: set window.DURATION in the page or pass --duration'); process.exit(2); }
  const f0 = Math.round((+opt.from || 0) * fps), f1 = Math.round((opt.to != null ? +opt.to : dur) * fps); // frames f0..f1-1 at t=i/fps
  const N = opt.workers, tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vzrender-')), per = Math.ceil((f1 - f0) / N), T0 = Date.now();
  console.log(`rendering frames ${f0}..${f1 - 1} (${f1 - f0}) @${fps}fps on ${N} workers → ${tmp}`);
  await Promise.all(Array.from({ length: N }, async (_, wi) => {
    const a = f0 + wi * per, z = Math.min(f1, a + per); if (a >= z) return;
    const { b, p, w, h, errors } = await openPage();
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(tmp, `part${wi}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = a; f < z; f++) {
      const buf = await frameJPG(p, f / fps);
      if (errors.length) { console.error(`worker ${wi} page error at t=${(f / fps).toFixed(3)}: ${errors[0]}`); process.exit(1); }
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - a) % 240 === 0) console.log(`w${wi} ${f - a}/${z - a}  ${((Date.now() - T0) / (f - a + 1)).toFixed(0)} ms/frame`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  }));
  const list = path.join(tmp, 'parts.txt');
  fs.writeFileSync(list, Array.from({ length: N }, (_, i) => path.join(tmp, `part${i}.mp4`)).filter(fs.existsSync).map(f => `file '${f}'`).join('\n'));
  const args = ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list];
  if (opt.audio) args.push('-ss', String(f0 / fps), '-t', String((f1 - f0) / fps), '-i', opt.audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000');
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', String(opt.crf), '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', opt.out);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  console.log(`done ${opt.out} in ${((Date.now() - T0) / 60000).toFixed(1)} min`);
  console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_frames,sample_rate', '-show_entries', 'format=duration,size', '-of', 'compact', opt.out]).toString());
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.error(e); process.exit(1); });
