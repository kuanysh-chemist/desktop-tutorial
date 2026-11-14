// Offline renderer: drives index.html in headless Chromium frame by frame and pipes JPEG frames to ffmpeg.
//   node render.mjs                       -> out/siriŋke.mp4 (full video)
//   node render.mjs --from 10 --to 20     -> only part of the timeline
//   node render.mjs --stills 1.5,3,7.2    -> PNG stills into out/stills/
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 700, height: 1100 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const info = await page.evaluate(() => window.videoInfo());
console.log(`total ${info.total.toFixed(2)} s, ${info.fps} fps`);

if (args.stills) {
  const dir = path.join(OUT, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of String(args.stills).split(',')) {
    const T = parseFloat(s);
    const url = await page.evaluate((t) => { window.renderAt(t); return document.getElementById('out').toDataURL('image/png'); }, T);
    const f = path.join(dir, `t${T.toFixed(2).padStart(6, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote', f);
  }
} else {
  const from = parseFloat(args.from ?? 0), to = Math.min(parseFloat(args.to ?? info.total), info.total);
  const outFile = args.out ? path.resolve(args.out) : path.join(OUT, (args.from || args.to) ? `part_${from}-${to}.mp4` : 'siringke.mp4');
  const n = Math.round((to - from) * info.fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(info.fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const T = from + f / info.fps;
    const url = await page.evaluate((t) => window.renderAt(t), T);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 24 === 0) {
      const el = (Date.now() - t0) / 1000, eta = el / (f + 1) * (n - f - 1);
      console.log(`frame ${f + 1}/${n}  t=${T.toFixed(2)}s  elapsed ${el.toFixed(0)}s  eta ${eta.toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('done:', outFile, `(${((Date.now() - t0) / 60000).toFixed(1)} min)`);
}
await browser.close();
server.close();
