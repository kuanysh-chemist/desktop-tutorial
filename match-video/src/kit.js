// Drawing kit: helpers on top of p5.brush (standalone build).
// World space is 540x960 logical px (9:16), rendered at pixelDensity 2 -> 1080x1920.
/* global brush */
const B = brush;
const W = 540, H = 960, D = 2;
const TAU = Math.PI * 2;
const INK = '#2b2420';
const PAPER = '#f2e8d2';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = {
  io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  back: (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
};
function hash(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 1000003;
}
function rnd(i, salt = 0) { // deterministic pseudo random 0..1
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// Global per-drawing state. `boil` cycles 0..2 so pencil lines "boil" like hand-drawn animation.
const K = { boil: 0, t: 0 };
let _uid = 0;
function sd(id, boil = true) {
  B.seed(hash(id) + (boil ? K.boil * 7919 : 0));
}
function resetState() { B.noStroke(); B.noFill(); B.noHatch(); B.noWash(); B.noMass(); B.noField(); }

// ---------- geometry ----------
function ell(cx, cy, rx, ry, n = 26, a0 = 0, a1 = TAU) {
  const full = Math.abs(a1 - a0 - TAU) < 1e-6;
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * i / (full ? n : n - 1);
    p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return p;
}
function xf(pts, { x = 0, y = 0, s = 1, sx = s, sy = s, r = 0 } = {}) {
  const c = Math.cos(r), sn = Math.sin(r);
  return pts.map(([px, py, pr]) => {
    const ax = px * sx, ay = py * sy;
    const q = [x + ax * c - ay * sn, y + ax * sn + ay * c];
    if (pr !== undefined) q.push(pr);
    return q;
  });
}
function jitter(pts, amt, id) {
  return pts.map((p, i) => [p[0] + (rnd(i, hash(id)) - 0.5) * amt, p[1] + (rnd(i + 99, hash(id)) - 0.5) * amt]);
}
// Truncate a polyline to a fraction of its length (for "drawing on" animations).
function partial(pts, prog) {
  if (prog >= 1) return pts;
  if (prog <= 0) return [];
  let total = 0; const L = [0];
  for (let i = 1; i < pts.length; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(total); }
  const target = total * prog; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= target) out.push(pts[i]);
    else { const f = (target - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; }
  }
  return out;
}

// ---------- primitives ----------
// shape(points, opts): closed shape with optional watercolor fill / flat wash / outline / hatch
function shape(pts, o = {}) {
  if (!pts || pts.length < 3) return;
  // opaque base under translucent watercolour, so the background does not show through characters
  if (o.solid && o.fill) {
    resetState(); sd((o.id || 'x') + 'base', false);
    B.wash(mixHex(o.fill, '#ffffff', 0.18), 255);
    B.beginShape(o.curve ?? 0.4); for (const p of pts) B.vertex(p[0], p[1]); B.endShape(true);
  }
  resetState();
  sd(o.id ?? ('s' + pts.length + '_' + Math.round(pts[0][0]) + '_' + Math.round(pts[0][1])), o.boil !== false);
  if (o.fill) { B.fill(o.fill, o.op ?? 190); B.fillBleed(o.bleed ?? 0.1); B.fillTexture(o.tex ?? 0.35, o.border ?? 0.35, o.scatter ?? true); }
  if (o.wash) B.wash(o.wash, o.wop ?? 255);
  if (o.hatch) { B.hatch(o.hatch[0], o.hatch[1], o.hatch[2] || { rand: 0.1 }); B.hatchStyle(o.hbrush || 'HB', o.hcolor || INK, o.hw || 1); }
  if (o.line) B.set(o.brush || 'HB', o.line, o.w ?? 1.3);
  B.beginShape(o.curve ?? 0.4);
  for (const p of pts) B.vertex(p[0], p[1], p[2]);
  B.endShape(true);
  resetState();
}
// Open stroke through points.
function path(pts, brushName = 'HB', color = INK, w = 1.3, o = {}) {
  if (!pts || pts.length < 2) return;
  resetState();
  sd(o.id ?? ('p' + pts.length + '_' + Math.round(pts[0][0]) + '_' + Math.round(pts[0][1]) + brushName), o.boil !== false);
  B.set(brushName, color, w);
  if (pts.length === 2 && !o.curve) B.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
  else { B.beginShape(o.curve ?? 0.5); for (const p of pts) B.vertex(p[0], p[1], p[2]); B.endShape(false); }
  resetState();
}
function line(x1, y1, x2, y2, brushName = 'HB', color = INK, w = 1.3, id) {
  path([[x1, y1], [x2, y2]], brushName, color, w, { id: id ?? `l${Math.round(x1)}_${Math.round(y1)}_${Math.round(x2)}` });
}
function circ(x, y, r, o = {}) { shape(ell(x, y, r, r, o.n ?? 24), o); }
function rectP(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function box(x, y, w, h, o = {}) { shape(rectP(x, y, w, h), { curve: 0, ...o }); }
function check(x, y, s, prog = 1, color = '#2f8a3e', id = 'chk') { // hand-drawn ✓
  const pts = [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.38], [x + s * 0.55, y - s * 0.55]];
  path(partial(pts, prog), 'charcoal', color, 3.2, { id, curve: 0.1 });
}
function cross(x, y, s, prog = 1, color = '#c0392b', id = 'x') { // hand-drawn ✗
  const a = clamp(prog * 2), b = clamp(prog * 2 - 1);
  if (a > 0) path(partial([[x - s * 0.5, y - s * 0.5], [x + s * 0.5, y + s * 0.5]], a), 'charcoal', color, 3.4, { id: id + 'a' });
  if (b > 0) path(partial([[x + s * 0.5, y - s * 0.5], [x - s * 0.5, y + s * 0.5]], b), 'charcoal', color, 3.4, { id: id + 'b' });
}

// ---------- flame ----------
function flamePts(x, y, size, t, k = 1, salt = 0) {
  const h = size * 2.3 * k, r = size * 0.62 * k; const pts = []; const n = 14;
  const wob = (s, side) => Math.sin(t * 13 + s * 6 + side * 1.7 + salt) * r * 0.22 * (1 - s) + Math.sin(t * 21 + s * 9 + salt) * r * 0.08;
  for (let i = 0; i <= n; i++) { const s = i / n; pts.push([x + r * Math.sin(Math.PI * Math.pow(s, 0.72)) + wob(s, 1), y - h + s * (h + r * 0.75)]); }
  for (let i = n - 1; i > 0; i--) { const s = i / n; pts.push([x - r * Math.sin(Math.PI * Math.pow(s, 0.72)) + wob(s, -1), y - h + s * (h + r * 0.75)]); }
  return pts;
}
function flame(x, y, size, t, o = {}) {
  if (size <= 0.5) return;
  const outer = o.outer || '#e8692a', inner = o.inner || '#ffd25a';
  shape(flamePts(x, y, size, t, 1, o.salt || 0), { fill: outer, op: 235, bleed: 0.04, tex: 0.2, border: 0.5, curve: 0.6, id: 'fl' + (o.id || '') + Math.floor(t * 24), boil: false });
  shape(flamePts(x, y + size * 0.1, size, t + 0.3, 0.55, (o.salt || 0) + 2), { wash: inner, wop: 255, curve: 0.6, id: 'fi' + (o.id || '') });
}

// ---------- match & box ----------
function match(x, y, ang, len = 150, o = {}) { // (x,y) = head center, stick goes in direction ang
  const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c, hw = 4.2 * (o.thick ?? 1);
  const L = len * (o.grow ?? 1);
  if (L > 2) {
    const ex = x + c * L, ey = y + s * L;
    const stick = [[x + nx * hw, y + ny * hw], [ex + nx * hw, ey + ny * hw], [ex - nx * hw, ey - ny * hw], [x - nx * hw, y - ny * hw]];
    shape(stick, { wash: o.burnt ? '#5a4636' : '#e3c08a', curve: 0, id: 'mst' + (o.id || '') });
    path([stick[0], stick[1]], 'HB', '#7a5a3a', 0.9, { id: 'msl' + (o.id || '') });
    path([stick[3], stick[2]], 'HB', '#7a5a3a', 0.9, { id: 'msr' + (o.id || '') });
  }
  if (o.noHead) return;
  const hr = 9 * (o.headScale ?? 1);
  const head = xf(ell(0, 0, hr * 1.35, hr, 18), { x: x - c * 2, y: y - s * 2, r: ang });
  shape(head, { fill: o.head || '#a8322a', op: 240, bleed: 0.03, tex: 0.5, border: 0.5, line: '#4a1a14', w: 1.0, id: 'mh' + (o.id || '') });
}
function matchbox(x, y, w, h, o = {}) {
  box(x, y, w, h, { wash: o.color || '#e9d9a8', line: INK, w: 1.4, id: 'mb' + (o.id || '') });
  if (o.label !== false) {
    box(x + w * 0.18, y + h * 0.2, w * 0.64, h * 0.6, { fill: o.labelColor || '#c2453a', op: 210, bleed: 0.02, tex: 0.3, id: 'mbl' + (o.id || '') });
    circ(x + w * 0.5, y + h * 0.5, Math.min(w, h) * 0.17, { wash: '#f5e7c2', id: 'mbc' + (o.id || '') });
  }
}

// Glass flask (Brand's) centred on bulb (x,y), scale s.
function flask(x, y, s, o = {}) {
  const T = (p) => xf(p, { x, y, s });
  const id = o.id || 'fk';
  const t = o.t ?? K.t;
  // glass body tint
  const g = [];
  for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + 0.17 + (TAU - 0.34) * i / 30; g.push([Math.cos(a) * 104, Math.sin(a) * 104]); }
  shape(T([[-18, -232], [18, -232], ...g.slice(0, 31), [-18, -232]].slice(0, 33)), { fill: '#bfe3ee', op: 70, bleed: 0.02, tex: 0.1, border: 0.6, curve: 0.5, id: id + 'gl', boil: false });
  // liquid with a wobbling surface
  const liq = [];
  for (let i = 0; i <= 20; i++) { const a = 0.08 * Math.PI + 0.84 * Math.PI * i / 20; liq.push([Math.cos(a) * 99, Math.sin(a) * 99]); }
  for (let i = 0; i <= 8; i++) { const xx = -96 + i * 24; liq.push([-xx, 14 + Math.sin(t * 3 + i) * 3]); }
  shape(T(liq), { fill: o.liquid || '#2cf27a', op: o.lop ?? 225, bleed: 0.04, tex: 0.35, border: 0.55, curve: 0.5, id: id + 'liq', boil: false });
  // bubbles
  for (let i = 0; i < 7; i++) {
    const ph = (t * 0.45 + i / 7) % 1;
    const bx = -60 + (i * 37) % 120 + Math.sin(t * 4 + i) * 4, byy = 80 - ph * 64;
    shape(T(ell(bx, byy, 3 + (i % 3) * 1.5, 3 + (i % 3) * 1.5, 10)), { line: '#e9fff0', w: 1.0, id: id + 'bb' + i });
  }
  // vapour inside the neck
  for (let i = 0; i < 2; i++) {
    const pts = []; for (let k = 0; k <= 6; k++) pts.push([-6 + i * 12 + Math.sin(k * 0.9 + t * 2.5 + i) * 6, -40 - k * 30]);
    path(T(pts), 'HB', '#bff7d2', 1.0, { id: id + 'vp' + i, curve: 0.8 });
  }
  path(T([[-18, -232], [-18, -104]]), '2B', INK, 1.8, { id: id + 'n1' });
  path(T([[18, -232], [18, -104]]), '2B', INK, 1.8, { id: id + 'n2' });
  path(T(g), '2B', INK, 1.9, { id: id + 'bulb', curve: 0.6 });
  shape(T([[-27, -244], [27, -244], [27, -230], [-27, -230]]), { wash: '#d9eef3', line: INK, w: 1.4, curve: 0.2, id: id + 'lip' });
  path(T(ell(0, 0, 78, 78, 10, -2.7, -1.8)), 'HB', '#ffffff', 3.0, { id: id + 'hl' });
  path(T([[-10, -220], [-10, -130]]), 'HB', '#ffffff', 2.0, { id: id + 'hl2' });
  shape(T(ell(0, 104, 70, 8, 16)), { fill: '#000000', op: 60, bleed: 0.2, tex: 0.1, id: id + 'shd', boil: false });
}

// Paper grain texture generated once (used by the compositor).
function makeGrain(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const img = g.createImageData(w, h); const d = img.data;
  let seed = 12345; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() - 0.5) * 60; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  // soft fibres
  g.globalAlpha = 0.05; g.strokeStyle = '#000';
  for (let i = 0; i < 1400; i++) { g.beginPath(); const x = r() * w, y = r() * h, a = r() * TAU, l = 6 + r() * 30; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  return c;
}
