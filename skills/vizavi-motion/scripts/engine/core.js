// vizavi-motion engine — deterministic Canvas-2D toolkit for cinematic 2.5D motion.
// Contract: the page defines window.renderAt(t) that draws frame at time t (seconds) from scratch,
// using ONLY t (no accumulated state), so frames can be rendered in any order and in parallel.
// Load order: core.js → (subtitles.js) → your scenes.js. Canvas size comes from <canvas id="c" width height>.

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const F = 1000; // focal length in world units: a layer at depth D (camera at z=0) is drawn at scale F/D

function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// scratch buffers: BUF[0] layerFX, BUF[1] bloom, BUF[2] lens overlays, BUF[3] dissolves. Don't keep content in them between calls.
const BUF = [mk(), mk(), mk(), mk()];

// ---------------- math ----------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));          // 0..1 progress of t inside [a,b]
const E = {                                                   // easing curves
  lin: t => t,
  io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  o: t => 1 - Math.pow(1 - t, 3),
  o5: t => 1 - Math.pow(1 - t, 5),
  i: t => t * t * t,
  s: t => -(Math.cos(Math.PI * t) - 1) / 2,
  back: t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * 2 * Math.PI / 3) + 1,
};
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function fbm(x, o = 3) { let v = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { v += a * noise1(x * f + i * 17.3); a *= .5; f *= 2; } return v; }
// keyframes [[t,v],...] (v number or array), eased between keys
function track(keys, t, ease = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) { const k = ease((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k); }
  }
  return keys[keys.length - 1][1];
}
// bell-shaped 0→1→0 pulse peaking at `peak`
function pulse(t, a, peak, b) { return t < a || t > b ? 0 : t < peak ? E.io(seg(t, a, peak)) : 1 - E.io(seg(t, peak, b)); }
function hexRGB(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function mixColor(a, b, t) { const pa = hexRGB(a), pb = hexRGB(b); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`; }
function rgba(hex, a) { const p = hexRGB(hex); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }

// Full state reset. Canvas keeps font/textAlign/filter/dash between calls — leaks cause bugs far away
// (e.g. a centred title makes every later subtitle overlap). Call reset() at the start of every draw block.
function reset(g = ctx) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.letterSpacing = '0px'; g.setLineDash([]); g.lineCap = 'butt';
}

// ---------------- 2.5D camera ----------------
// cam = {x, y, z, roll}. World layers live at depth D; nearer layers (small D) move faster → parallax.
// Pushing z towards a layer magnifies it; a layer with D - z < ~250 flies out of frame — plan foreground depths for the max z.
function camT(c, D, g = ctx) {
  const d = D - c.z; if (d < 5) return 0;
  const s = F / d;
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.rotate(c.roll || 0); g.scale(s, s); g.translate(-c.x, -c.y);
  return s;
}
// world point → screen [x, y, scale, distance]
function proj(c, x, y, D) {
  const d = D - c.z, s = F / d; const px = (x - c.x) * s, py = (y - c.y) * s, r = c.roll || 0, cr = Math.cos(r), sr = Math.sin(r);
  return [W / 2 + px * cr - py * sr, H / 2 + px * sr + py * cr, s, d];
}
// screen-space velocity of a world point between two camera states (for motion smear)
function screenVel(c, cp, x, y, D) { const a = proj(c, x, y, D), b = proj(cp, x, y, D); return [a[0] - b[0], a[1] - b[1]]; }

// Draw fn(g) into a buffer and composite: DOF blur, motion smear (multi-tap along screen velocity), alpha, blend.
function layerFX(fn, { blur = 0, smear = [0, 0], alpha = 1, buf = BUF[0], comp = 'source-over' } = {}) {
  const g = buf.getContext('2d'); reset(g); g.clearRect(0, 0, W, H); fn(g); reset(g);
  reset(ctx); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = comp;
  if (blur > .4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  const sm = Math.hypot(smear[0], smear[1]);
  if (sm > 1.5) {
    const n = Math.min(7, 2 + Math.floor(sm / 8));
    for (let i = 0; i < n; i++) { const k = i / (n - 1) - .5; ctx.globalAlpha = alpha * (i === 0 ? 1 : 1 / (i + 1)); ctx.drawImage(buf, smear[0] * k, smear[1] * k); }
  } else ctx.drawImage(buf, 0, 0);
  reset(ctx);
}
// circle-of-confusion style blur for a layer at depth D when focused at depth `focus`
function dof(c, D, focus, k = 9, max = 24) { return Math.min(max, Math.abs(1 / Math.max(1, D - c.z) - 1 / Math.max(1, focus - c.z)) * F * k); }

// ---------------- gradients, light, atmosphere ----------------
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function sky(g, top, bot, glow) { // glow = [x, y, radius, 'rgba(...)']
  reset(g); g.fillStyle = vgrad(g, 0, H, [[0, top], [1, bot]]); g.fillRect(0, 0, W, H);
  if (glow) radialGlow(g, glow[0], glow[1], glow[2], glow[3]);
}
function radialGlow(g, x, y, r, col, comp = 'source-over') {
  g.save(); g.globalCompositeOperation = comp; const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
// volumetric light shaft from (x,y) in direction `ang` (radians), screen space
function lightShaft(x, y, ang, len, w0, w1, col, alpha, blur = 30) {
  reset(ctx); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${blur}px)`;
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
  const gr = ctx.createLinearGradient(x, y, x + dx * len, y + dy * len); gr.addColorStop(0, rgba(col, alpha)); gr.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x + nx * w0 / 2, y + ny * w0 / 2); ctx.lineTo(x - nx * w0 / 2, y - ny * w0 / 2);
  ctx.lineTo(x + dx * len - nx * w1 / 2, y + dy * len - ny * w1 / 2); ctx.lineTo(x + dx * len + nx * w1 / 2, y + dy * len + ny * w1 / 2); ctx.fill(); reset(ctx);
}
// horizontal fog band in world space
function fogBand(g, cam, D, y, hgt, col, a) {
  const s = camT(cam, D, g); if (!s) return;
  g.fillStyle = vgrad(g, y - hgt, y + hgt, [[0, rgba(col, 0)], [.5, rgba(col, a)], [1, rgba(col, 0)]]);
  g.fillRect(cam.x - W / s, y - hgt, W * 2 / s, hgt * 2); reset(g);
}
// ground plane from horizon (projected at depth D0) to the bottom. For interiors pass the BACK-WALL depth as D0,
// otherwise the "floor" starts at the screen centre and covers whatever stands on/against the wall.
function groundPlane(g, cam, y, colTop, colBot, D0 = 20000) {
  reset(g); const hz = proj(cam, cam.x, y, D0)[1];
  g.fillStyle = vgrad(g, hz, H, [[0, colTop], [1, colBot]]);
  g.save(); g.translate(W / 2, H / 2); g.rotate(cam.roll || 0); g.translate(-W / 2, -H / 2); g.fillRect(-W, hz, W * 3, H * 2); g.restore();
}
// colour grade over the whole frame: tint via multiply (shadows/mood) or screen (lift/haze)
function grade(col, mode = 'multiply', alpha = 1) { reset(ctx); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); reset(ctx); }
// halation/bloom: bright areas bleed light. threshold-ish via brightness/contrast, then blurred screen
function bloom(strength = .35, radius = 28, threshold = 2.6) {
  const g = BUF[1].getContext('2d'); reset(g); g.clearRect(0, 0, W, H);
  g.filter = `brightness(.55) contrast(${threshold}) blur(${radius}px)`; g.drawImage(cv, 0, 0); reset(g);
  reset(ctx); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = strength; ctx.drawImage(BUF[1], 0, 0); reset(ctx);
}

// ---------------- sprites (pre-baked once, cheap to draw every frame) ----------------
const SPR = {};
function drawSpr(g, s, x, y, scale = 1, alpha = 1) { g.globalAlpha = alpha; g.drawImage(s.c, x - s.ox * scale, y - s.oy * scale, s.c.width * scale, s.c.height * scale); g.globalAlpha = 1; }
function bake(key, w, h, ox, oy, drawFn) { // generic: bake drawFn(g) once into a sprite with origin (ox, oy)
  if (SPR[key]) return SPR[key]; const c = mk(w, h), g = c.getContext('2d'); drawFn(g); return (SPR[key] = { c, ox, oy });
}
function softDot(key, rad, col) {
  return bake(key, rad * 2, rad * 2, rad, rad, g => {
    const gr = g.createRadialGradient(rad, rad, 0, rad, rad, rad); gr.addColorStop(0, col);
    gr.addColorStop(.35, col.replace(/[\d.]+\)$/, m => (parseFloat(m) * .6) + ')')); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, rad * 2, rad * 2);
  });
}
// mountain/hill ridge via midpoint displacement. litCol = rim light along the crest (backlight / sunlit snow).
// The sprite tiles horizontally and drawRidge fills everything below it, so a layer never shows its edges.
function ridgeSprite(key, w, h, col, litCol, seed, rough = .52, blur = 0) {
  const spr = bake(key, w, h, 0, h, g => {
    const r = rng(seed), N = 257, ys = new Array(N).fill(0);
    ys[0] = ys[N - 1] = h * (.35 + r() * .3); // equal ends → seamless tiling
    (function sub(a, b, amp) { if (b - a < 2) return; const m = (a + b) >> 1; ys[m] = (ys[a] + ys[b]) / 2 + (r() - .5) * amp; sub(a, m, amp * rough); sub(m, b, amp * rough); })(0, N - 1, h * .55);
    const path = new Path2D(); path.moveTo(0, h); for (let i = 0; i < N; i++) path.lineTo(i / (N - 1) * w, clamp(ys[i], 10, h)); path.lineTo(w, h); path.closePath();
    if (blur) g.filter = `blur(${blur}px)`;
    g.fillStyle = col; g.fill(path);
    if (litCol) {
      g.save(); g.clip(path); g.filter = `blur(${3 + blur}px)`; g.strokeStyle = litCol; g.lineWidth = 7; g.globalAlpha = .75;
      const crest = new Path2D(); for (let i = 0; i < N; i++) crest[i ? 'lineTo' : 'moveTo'](i / (N - 1) * w, clamp(ys[i], 10, h));
      g.stroke(crest); g.lineWidth = 26; g.globalAlpha = .18; g.stroke(crest); g.restore();
    }
  });
  spr.col = col; return spr;
}
// draw a ridge layer at depth D: crest at world y (bottom of the sprite = y), tiled across the view, solid below
function drawRidge(g, cam, D, spr, y, tileW, tileH) {
  const s = camT(cam, D, g); if (!s) return;
  const half = (Math.hypot(W, H) / 2) / s, x0 = Math.floor((cam.x - half) / tileW) * tileW;
  for (let x = x0; x < cam.x + half; x += tileW) g.drawImage(spr.c, x, y - tileH, tileW + 1, tileH);
  g.fillStyle = spr.col; g.fillRect(cam.x - half, y - 1, half * 2, H / s + Math.abs(y) + 4000);
  reset(g);
}

// ---------------- particles: snow, dust, embers, petals, sparks ----------------
// Volumetric field around the camera; streaks along projected velocity (= real motion blur incl. camera motion),
// soft bokeh discs when out of focus. Pass cam and the camera one frame earlier (camPrev).
class Particles {
  constructor(n, seed, { spanX = 2600, spanY = 1600, near = 120, depth = 3000, wind = [-260, 220], sway = 40, size = 3 } = {}) {
    const r = rng(seed); this.p = [];
    for (let i = 0; i < n; i++) this.p.push({ x: (r() - .5) * spanX, y: (r() - .5) * spanY, z: r() * depth, ph: r() * 6.28, sp: .6 + r() * .8, sz: size * (.5 + r()) });
    Object.assign(this, { spanX, spanY, near, depth, wind, sway });
  }
  pos(q, t, c) {
    let x = q.x + this.wind[0] * q.sp * t + Math.sin(t * 1.3 + q.ph) * this.sway, y = q.y + this.wind[1] * q.sp * t + Math.cos(t * .9 + q.ph) * this.sway * .5;
    let z = q.z - c.z; z = ((z % this.depth) + this.depth) % this.depth + c.z + this.near;
    const sc = (z - c.z) / F, sx = this.spanX * sc, sy = this.spanY * sc;
    x = ((x - c.x) % sx + sx * 1.5) % sx - sx / 2 + c.x; y = ((y - c.y) % sy + sy * 1.5) % sy - sy / 2 + c.y;
    return [x, y, z];
  }
  draw(g, t, cam, camPrev, { focus = 1000, alpha = 1, color = '255,255,255', shutter = 1 / 60, dofK = 9, maxBlur = 22, mul = 1, comp = 'source-over' } = {}) {
    reset(g); g.lineCap = 'round'; g.globalCompositeOperation = comp;
    const dot = softDot('pdot_' + color, 64, `rgba(${color},1)`);
    for (const q of this.p) {
      const [x, y, z] = this.pos(q, t, cam), [x0, y0, z0] = this.pos(q, t - shutter, camPrev);
      if (Math.abs(z - z0) > this.depth * .5) continue;
      const a = proj(cam, x, y, z), b = proj(camPrev, x0, y0, z0);
      if (a[3] < 20 || a[0] < -60 || a[0] > W + 60 || a[1] < -60 || a[1] > H + 60) continue;
      const rad = Math.max(.6, q.sz * a[2] * mul), coc = Math.min(maxBlur, Math.abs(1 / a[3] - 1 / focus) * F * dofK);
      const R = rad + coc, op = clamp((a[3] - 20) / 200) * alpha * clamp(.95 * Math.pow(rad / R, 1.3) + .06), dx = a[0] - b[0], dy = a[1] - b[1];
      if (R > 6) {
        const L = Math.hypot(dx, dy), n = L > R ? Math.min(5, Math.ceil(L / R)) : 1;
        for (let i = 0; i < n; i++) { const k = i / n; g.globalAlpha = op * .9 / n * (n > 1 ? 1.6 : 1); g.drawImage(dot.c, a[0] - dx * k - R, a[1] - dy * k - R, R * 2, R * 2); }
      } else { g.globalAlpha = 1; g.strokeStyle = `rgba(${color},${op.toFixed(3)})`; g.lineWidth = R * 1.6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0] + .01, b[1]); g.stroke(); }
    }
    reset(g);
  }
}

// ---------------- lens overlays ----------------
// frost/condensation crystals growing from the frame edges; p = coverage 0..1, haze = flat wash.
// At high p keep haze ≥ .6, otherwise the transparent centre reads as a dirty smudge.
let FROST = null;
function frostLens(p, haze = 0, tint = '225,245,245', seed = 77) {
  if (p <= 0 && haze <= 0) return;
  if (!FROST) {
    FROST = mk(); const g = FROST.getContext('2d'), r = rng(seed); g.lineCap = 'round';
    const branch = (x, y, a, len, w, d) => { if (d > 5 || len < 4) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.strokeStyle = `rgba(235,250,250,${.18 + .3 * r()})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); const n = 2 + Math.floor(r() * 3); for (let i = 0; i < n; i++) { const k = (i + 1) / (n + 1); branch(lerp(x, x2, k), lerp(y, y2, k), a + (r() < .5 ? -1 : 1) * 1.05, len * .38, w * .6, d + 2); } branch(x2, y2, a + (r() - .5) * .6, len * .72, w * .8, d + 1); };
    for (let i = 0; i < 260; i++) { const s = i % 4; const [x, y, a] = s === 0 ? [r() * W, 0, Math.PI / 2] : s === 1 ? [r() * W, H, -Math.PI / 2] : s === 2 ? [0, r() * H, 0] : [W, r() * H, Math.PI]; branch(x, y, a + (r() - .5) * 1.2, 60 + r() * 160, 2.2, 0); }
    for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H; for (let k = 0; k < 6; k++) branch(x, y, k * Math.PI / 3 + r() * .2, 14 + r() * 26, 1.3, 2); }
  }
  const g = BUF[2].getContext('2d'); reset(g); g.clearRect(0, 0, W, H); g.drawImage(FROST, 0, 0); g.globalCompositeOperation = 'destination-in';
  const R = Math.hypot(W, H) / 2, r0 = lerp(R * 1.05, 0, p), gr = g.createRadialGradient(W / 2, H / 2, Math.max(0, r0 - 260), W / 2, H / 2, r0 + 120);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  reset(ctx); const eg = ctx.createRadialGradient(W / 2, H / 2, Math.max(0, r0 - 200), W / 2, H / 2, r0 + 300);
  eg.addColorStop(0, `rgba(${tint},0)`); eg.addColorStop(1, `rgba(${tint},${.55 * clamp(p * 1.4)})`); ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.drawImage(BUF[2], 0, 0); ctx.globalCompositeOperation = 'source-over';
  if (haze > 0) { ctx.fillStyle = `rgba(${tint},${haze})`; ctx.fillRect(0, 0, W, H); }
  reset(ctx);
}
// full-frame flash/dip (white-out, black-out, colour dip); a = 0..1
function dip(a, col = '240,250,250') { if (a <= 0) return; reset(ctx); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
// sliding panel wipe (door, shoji, card): covers the frame fully at the midpoint of [t0,t1]
function panelWipe(t, t0, t1, { col = '#2a1b12', dir = -1, slats = 14 } = {}) {
  const p = seg(t, t0, t1); if (p <= 0 || p >= 1) return;
  const PW = W * 1.3, L = dir < 0 ? W + 60 - (W * 2.5) * E.io(p) : -PW - 60 + (W * 2.5) * E.io(p);
  reset(ctx); ctx.filter = `blur(${20 * Math.sin(p * Math.PI)}px)`; ctx.fillStyle = col; ctx.fillRect(L, 0, PW, H);
  for (let i = 0; i < slats; i++) { ctx.fillStyle = `rgba(0,0,0,${.25 + .2 * hash(i)})`; ctx.fillRect(L + i * PW / slats, 0, 6, H); }
  reset(ctx);
}

// ---------------- post: grain + vignette ----------------
const GRAIN = [];
function post(t, { vig = .55, grain = .06 } = {}) {
  reset(ctx);
  if (!GRAIN.length) for (let k = 0; k < 6; k++) { const c = mk(512, 512), g = c.getContext('2d'), d = g.createImageData(512, 512), r = rng(900 + k); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 90; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GRAIN.push(c); }
  const f = Math.floor(t * 24), o = Math.floor(hash(f) * 512); // grain changes on 24 fps "film" cadence
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grain; ctx.fillStyle = ctx.createPattern(GRAIN[f % GRAIN.length], 'repeat');
  ctx.translate(-o, -o); ctx.fillRect(0, 0, W + 512, H + 512); reset(ctx);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${vig})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------------- particle morphs ----------------
// Sample n points from whatever drawFn paints (glyphs, a silhouette, a logo) — use as targets so particles
// can assemble into a title and then re-form into a character/object (strong, cheap transition).
function samplePoints(drawFn, n, seed, w = W, h = H, step = 3) {
  const c = mk(w, h), g = c.getContext('2d'); drawFn(g);
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 100) pts.push([x, y]);
  const r = rng(seed); return Array.from({ length: n }, () => pts[Math.floor(r() * pts.length)] || [w / 2, h / 2]);
}

// ---------------- anatomy helper ----------------
// A believable finger = rounded capsule with side shading, nail and knuckle creases. Build hands from 3–5 of
// these (+ a palm mass) instead of one flat "mitten" polygon.
function finger(g, x1, y1, x2, y2, w, skin, shade, nail = true) {
  const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
  g.save(); g.translate(x1, y1); g.rotate(ang);
  const gr = g.createLinearGradient(0, -w / 2, 0, w / 2); gr.addColorStop(0, shade); gr.addColorStop(.3, skin); gr.addColorStop(.55, skin); gr.addColorStop(1, shade);
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - w * .5, -w * .48); g.bezierCurveTo(L + w * .15, -w * .45, L + w * .15, w * .45, L - w * .5, w * .5); g.lineTo(0, w / 2); g.closePath(); g.fill();
  if (nail) { g.fillStyle = 'rgba(240,215,212,.95)'; g.beginPath(); g.moveTo(L - w * .85, -w * .34); g.quadraticCurveTo(L + w * .05, -w * .38, L + w * .02, 0); g.quadraticCurveTo(L + w * .05, w * .2, L - w * .85, w * .05); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(L - w * .45, -w * .2, w * .25, w * .06, 0, 0, 6.28); g.fill(); }
  g.strokeStyle = 'rgba(70,60,60,.28)'; g.lineWidth = Math.max(1, w * .025); [L * .42, L * .46, L * .74].forEach(k => { g.beginPath(); g.moveTo(k, -w * .35); g.quadraticCurveTo(k + 8, 0, k, w * .3); g.stroke(); });
  g.restore();
}

// ---------------- scene timeline helper ----------------
// scenes: [[t0, t1, fn], ...]; dissolves: [[t0, t1, fromIdx, toIdx]]; overlays(t) and texts(t) drawn on top.
function makeRenderer(scenes, { dissolves = [], overlays = () => {}, texts = () => {} } = {}) {
  const idx = t => { for (let i = 0; i < scenes.length; i++) if (t < scenes[i][1]) return i; return scenes.length - 1; };
  return function renderAt(t) {
    reset(ctx); ctx.clearRect(0, 0, W, H);
    const d = dissolves.find(([a, b]) => t >= a && t < b);
    if (d) {
      scenes[d[2]][2](t); const g = BUF[3].getContext('2d'); reset(g); g.clearRect(0, 0, W, H); g.drawImage(cv, 0, 0);
      reset(ctx); scenes[d[3]][2](t); reset(ctx); ctx.globalAlpha = 1 - E.io(seg(t, d[0], d[1])); ctx.drawImage(BUF[3], 0, 0); reset(ctx);
    } else scenes[idx(t)][2](t);
    reset(ctx); overlays(t); reset(ctx); texts(t); reset(ctx);
  };
}
