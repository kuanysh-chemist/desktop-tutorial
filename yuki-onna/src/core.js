// Core: canvas, math, camera, sprites, particles, overlays.
const W = 1920, H = 1080, F = 1000;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const BUF = [mk(), mk(), mk()];

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  o: t => 1 - Math.pow(1 - t, 3),
  o5: t => 1 - Math.pow(1 - t, 5),
  i: t => t * t * t,
  s: t => -(Math.cos(Math.PI * t) - 1) / 2,
  back: t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function fbm(x, o = 3) { let v = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { v += a * noise1(x * f + i * 17.3); a *= .5; f *= 2; } return v; }
// keyframe track: [[t,v],...] eased between keys
function track(keys, t, ease = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) { const k = ease((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k); }
  }
  return keys[keys.length - 1][1];
}
function mixColor(a, b, t) { // hex
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`;
}
function rgba(hex, a) { const p = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }

// ---------- palette ----------
const P = {
  night0: '#050f12', night1: '#0b2226', night2: '#123a3e', night3: '#1d5257', teal: '#2f7a7a', ice: '#cfeef0',
  snow: '#e6f0ec', snowShade: '#9fbcbc', red: '#c4211b', red2: '#e8452f', blood: '#7a0f12',
  fire: '#ffb347', ember: '#ff6a2a', wood: '#3a2418', wood2: '#5a3a26', skin: '#efe6e0', ink: '#0a0c0d',
};

// ---------- camera ----------
// cam = {x,y,z,roll}; a layer at depth D projects with scale F/(D-z)
function camT(c, D, g = ctx) {
  const d = D - c.z; if (d < 5) return 0;
  const s = F / d;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(W / 2, H / 2); g.rotate(c.roll || 0); g.scale(s, s); g.translate(-c.x, -c.y);
  return s;
}
function proj(c, x, y, D) {
  const d = D - c.z; const s = F / d; let px = (x - c.x) * s, py = (y - c.y) * s;
  const r = c.roll || 0, cr = Math.cos(r), sr = Math.sin(r);
  return [W / 2 + px * cr - py * sr, H / 2 + px * sr + py * cr, s, d];
}
function reset(g = ctx) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.shadowBlur = 0; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.letterSpacing = '0px'; g.setLineDash([]); }

// draw function fn into buffer, then composite with blur (DOF) and optional motion smear
function layerFX(fn, { blur = 0, smear = [0, 0], alpha = 1, buf = BUF[0], comp = 'source-over' } = {}) {
  const g = buf.getContext('2d'); reset(g); g.clearRect(0, 0, W, H); fn(g); reset(g);
  reset(ctx); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = comp;
  if (blur > .4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  const sm = Math.hypot(smear[0], smear[1]);
  if (sm > 1.5) {
    const n = Math.min(6, 2 + Math.floor(sm / 8));
    for (let i = 0; i < n; i++) { const k = i / (n - 1) - .5; ctx.globalAlpha = alpha * (i === 0 ? 1 : 1 / (i + 1)); ctx.drawImage(buf, smear[0] * k, smear[1] * k); }
  } else ctx.drawImage(buf, 0, 0);
  reset(ctx);
}

// ---------- sky / gradients ----------
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function sky(g, top, bot, glow) {
  reset(g); g.fillStyle = vgrad(g, 0, H, [[0, top], [1, bot]]); g.fillRect(0, 0, W, H);
  if (glow) { const r = g.createRadialGradient(glow[0], glow[1], 0, glow[0], glow[1], glow[2]); r.addColorStop(0, glow[3]); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H); }
}

// ---------- sprites ----------
const SPR = {};
function pineSprite(key, h, col, snowCol, seed, blur = 0) {
  if (SPR[key]) return SPR[key];
  const r = rng(seed), w = h * .55, pad = 40 + blur * 3;
  const c = mk(Math.ceil(w + pad * 2), Math.ceil(h + pad * 2)), g = c.getContext('2d');
  g.translate(pad + w / 2, pad + h);
  if (blur) g.filter = `blur(${blur}px)`;
  g.fillStyle = col;
  g.fillRect(-h * .018, -h * .25, h * .036, h * .25);
  const tiers = 7 + Math.floor(r() * 3);
  for (let i = 0; i < tiers; i++) {
    const k = i / tiers, yb = -h * (.1 + k * .82), th = h * .22 * (1 - k * .45), hw = w * .5 * (1 - k * .82) * (.85 + r() * .3);
    g.beginPath(); g.moveTo(0, yb - th);
    const n = 7;
    for (let j = 0; j <= n; j++) { const a = j / n; g.lineTo(hw * a + (r() - .5) * 8, yb - th + th * a + (j % 2 ? -th * .18 : 0) + a * a * th * .12); }
    for (let j = n; j >= 0; j--) { const a = j / n; g.lineTo(-hw * a + (r() - .5) * 8, yb - th + th * a + (j % 2 ? -th * .18 : 0) + a * a * th * .12); }
    g.closePath(); g.fill();
    // snow cap on tier
    g.save(); g.fillStyle = snowCol; g.beginPath(); g.moveTo(0, yb - th);
    for (let j = 0; j <= n; j++) { const a = j / n; g.lineTo(hw * a * .92, yb - th + th * a * .82 - th * .04); }
    for (let j = n; j >= 0; j--) { const a = j / n; g.lineTo(hw * a * .92 - 6, yb - th + th * a * .82 + th * (.08 + .07 * Math.sin(j * 2.1 + i))); }
    g.closePath(); g.globalAlpha = .9; g.fill();
    g.beginPath(); g.moveTo(0, yb - th);
    for (let j = 0; j <= n; j++) { const a = j / n; g.lineTo(-hw * a * .9, yb - th + th * a * .85); }
    for (let j = n; j >= 0; j--) { const a = j / n; g.lineTo(-hw * a * .9 + 6, yb - th + th * a * .85 + th * (.06 + .05 * Math.sin(j * 1.7 + i))); }
    g.closePath(); g.globalAlpha = .55; g.fill(); g.restore();
  }
  SPR[key] = { c, ox: pad + w / 2, oy: pad + h };
  return SPR[key];
}
function drawSpr(g, s, x, y, scale = 1, alpha = 1) { g.globalAlpha = alpha; g.drawImage(s.c, x - s.ox * scale, y - s.oy * scale, s.c.width * scale, s.c.height * scale); g.globalAlpha = 1; }

function ridgeSprite(key, w, h, col, snowCol, seed, rough = .5, blur = 0) {
  if (SPR[key]) return SPR[key];
  const r = rng(seed), c = mk(w, h), g = c.getContext('2d');
  const N = 257, ys = new Array(N).fill(0);
  ys[0] = h * (.35 + r() * .3); ys[N - 1] = h * (.35 + r() * .3);
  (function sub(a, b, amp) { if (b - a < 2) return; const m = (a + b) >> 1; ys[m] = (ys[a] + ys[b]) / 2 + (r() - .5) * amp; sub(a, m, amp * rough); sub(m, b, amp * rough); })(0, N - 1, h * .55);
  if (blur) g.filter = `blur(${blur}px)`;
  g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
  for (let i = 0; i < N; i++) g.lineTo(i / (N - 1) * w, clamp(ys[i], 10, h));
  g.lineTo(w, h); g.closePath(); g.fill();
  if (snowCol) { // snow on lit slopes
    g.globalCompositeOperation = 'source-atop';
    for (let i = 1; i < N; i++) {
      const x0 = (i - 1) / (N - 1) * w, x1 = i / (N - 1) * w, y0 = ys[i - 1], y1 = ys[i];
      if (y1 < y0) { g.fillStyle = snowCol; g.globalAlpha = clamp((y0 - y1) / 18) * .8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x1 + 30, y1 + h * .35); g.lineTo(x0 + 30, y0 + h * .2); g.fill(); }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  SPR[key] = { c, ox: w / 2, oy: h };
  return SPR[key];
}

function softDot(key, rad, col) {
  if (SPR[key]) return SPR[key];
  const c = mk(rad * 2, rad * 2), g = c.getContext('2d');
  const gr = g.createRadialGradient(rad, rad, 0, rad, rad, rad);
  gr.addColorStop(0, col); gr.addColorStop(.35, col.replace(/[\d.]+\)$/, m => (parseFloat(m) * .6) + ')')); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, rad * 2, rad * 2);
  SPR[key] = { c, ox: rad, oy: rad }; return SPR[key];
}

// ---------- snow (volumetric, camera-aware motion blur) ----------
class Snow {
  constructor(n, seed, { spanX = 2600, spanY = 1600, near = 120, depth = 3000, wind = [-260, 220], sway = 40, size = 3 } = {}) {
    const r = rng(seed); this.p = [];
    for (let i = 0; i < n; i++) this.p.push({ x: (r() - .5) * spanX, y: (r() - .5) * spanY, z: r() * depth, ph: r() * 6.28, sp: .6 + r() * .8, sz: size * (.5 + r()) });
    Object.assign(this, { spanX, spanY, near, depth, wind, sway });
  }
  pos(q, t, c) {
    const wx = this.wind[0] * q.sp, wy = this.wind[1] * q.sp;
    let x = q.x + wx * t + Math.sin(t * 1.3 + q.ph) * this.sway, y = q.y + wy * t + Math.cos(t * .9 + q.ph) * this.sway * .5;
    let z = q.z - c.z; z = ((z % this.depth) + this.depth) % this.depth + c.z + this.near;
    const d = z - c.z, sc = d / F; // keep spans proportional to view frustum
    const sx = this.spanX * sc, sy = this.spanY * sc;
    x = ((x - c.x) % sx + sx * 1.5) % sx - sx / 2 + c.x; y = ((y - c.y) % sy + sy * 1.5) % sy - sy / 2 + c.y;
    return [x, y, z];
  }
  draw(g, t, cam, camPrev, { focus = 1000, alpha = 1, color = '255,255,255', shutter = 1 / 60, dofK = 9, maxBlur = 22, mul = 1 } = {}) {
    reset(g); g.lineCap = 'round';
    for (const q of this.p) {
      const [x, y, z] = this.pos(q, t, cam);
      const [x0, y0, z0] = this.pos(q, t - shutter, camPrev);
      if (Math.abs(z - z0) > this.depth * .5) continue;
      const a = proj(cam, x, y, z), b = proj(camPrev, x0, y0, z0);
      if (a[3] < 20) continue;
      if (a[0] < -60 || a[0] > W + 60 || a[1] < -60 || a[1] > H + 60) continue;
      const rad = Math.max(.6, q.sz * a[2] * mul);
      const coc = Math.min(maxBlur, Math.abs(1 / a[3] - 1 / focus) * F * dofK);
      const fade = clamp((a[3] - 20) / 200) * alpha;
      const R = rad + coc;
      const op = fade * clamp(.95 * Math.pow(rad / R, 1.3) + .06);
      const dx = a[0] - b[0], dy = a[1] - b[1];
      if (R > 6) {
        const s = softDot('flake', 64, `rgba(${color},1)`);
        g.globalAlpha = op * .9;
        const L = Math.hypot(dx, dy);
        if (L > R) { const n = Math.min(5, Math.ceil(L / R)); for (let i = 0; i < n; i++) { const k = i / n; g.globalAlpha = op * .9 / n * 1.6; g.drawImage(s.c, a[0] - dx * k - R, a[1] - dy * k - R, R * 2, R * 2); } }
        else g.drawImage(s.c, a[0] - R, a[1] - R, R * 2, R * 2);
      } else {
        g.globalAlpha = 1; g.strokeStyle = `rgba(${color},${op.toFixed(3)})`; g.lineWidth = R * 1.6;
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0] + .01, b[1]); g.stroke();
      }
    }
    reset(g);
  }
}

// ---------- frost overlay (lens) ----------
let FROST = null;
function buildFrost() {
  const c = mk(), g = c.getContext('2d'), r = rng(77);
  g.lineCap = 'round';
  function branch(x, y, a, len, w, depth) {
    if (depth > 5 || len < 4) return;
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    g.lineWidth = w; g.strokeStyle = `rgba(235,250,250,${.18 + .3 * r()})`;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) { const k = (i + 1) / (n + 1); const bx = lerp(x, x2, k), by = lerp(y, y2, k); const s = r() < .5 ? -1 : 1; branch(bx, by, a + s * (1.05), len * .38, w * .6, depth + 2); }
    branch(x2, y2, a + (r() - .5) * .6, len * .72, w * .8, depth + 1);
  }
  for (let i = 0; i < 260; i++) {
    const side = i % 4; let x, y, a;
    if (side === 0) { x = r() * W; y = 0; a = Math.PI / 2 + (r() - .5) * 1.2; }
    else if (side === 1) { x = r() * W; y = H; a = -Math.PI / 2 + (r() - .5) * 1.2; }
    else if (side === 2) { x = 0; y = r() * H; a = (r() - .5) * 1.2; }
    else { x = W; y = r() * H; a = Math.PI + (r() - .5) * 1.2; }
    branch(x, y, a, 60 + r() * 160, 2.2, 0);
  }
  // seeds of crystals in the field
  for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H; for (let k = 0; k < 6; k++) branch(x, y, k * Math.PI / 3 + r() * .2, 14 + r() * 26, 1.3, 2); }
  FROST = c;
}
// p: 0..1 coverage from edges; haze: white wash
function frost(p, haze = 0, tint = '225,245,245') {
  if (p <= 0 && haze <= 0) return;
  if (!FROST) buildFrost();
  const g = BUF[2].getContext('2d'); reset(g); g.clearRect(0, 0, W, H);
  g.drawImage(FROST, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const R = Math.hypot(W, H) / 2, r0 = lerp(R * 1.05, 0, p);
  const gr = g.createRadialGradient(W / 2, H / 2, Math.max(0, r0 - 260), W / 2, H / 2, r0 + 120);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  reset(ctx);
  // frosted-glass edge haze
  const eg = ctx.createRadialGradient(W / 2, H / 2, Math.max(0, r0 - 200), W / 2, H / 2, r0 + 300);
  eg.addColorStop(0, `rgba(${tint},0)`); eg.addColorStop(1, `rgba(${tint},${.55 * clamp(p * 1.4)})`);
  ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.drawImage(BUF[2], 0, 0); ctx.globalCompositeOperation = 'source-over';
  if (haze > 0) { ctx.fillStyle = `rgba(${tint},${haze})`; ctx.fillRect(0, 0, W, H); }
  reset(ctx);
}

// ---------- grain & vignette ----------
const GRAIN = [];
function buildGrain() {
  for (let k = 0; k < 6; k++) {
    const c = mk(512, 512), g = c.getContext('2d'), d = g.createImageData(512, 512), r = rng(900 + k);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 90; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); GRAIN.push(c);
  }
}
function post(t, { vig = .55, grain = .06 } = {}) {
  reset(ctx);
  if (!GRAIN.length) buildGrain();
  const gtile = GRAIN[Math.floor(t * 24) % GRAIN.length];
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grain;
  const pat = ctx.createPattern(gtile, 'repeat'); ctx.fillStyle = pat;
  const o = Math.floor(hash(Math.floor(t * 24)) * 512);
  ctx.translate(-o, -o); ctx.fillRect(0, 0, W + 512, H + 512); reset(ctx);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${vig})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------- point sampling from a drawing (for particle morphs) ----------
function samplePoints(drawFn, n, seed, w = W, h = H, step = 3) {
  const c = mk(w, h), g = c.getContext('2d'); drawFn(g);
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { const a = d[(y * w + x) * 4 + 3]; if (a > 100) pts.push([x, y]); }
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) out.push(pts[Math.floor(r() * pts.length)] || [w / 2, h / 2]);
  return out;
}
