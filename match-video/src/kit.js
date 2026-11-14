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
  shape(flamePts(x, y, size, t, 1, o.salt || 0), { fill: outer, op: 235, bleed: 0.04, tex: 0.2, border: 0.5, curve: 0.6, id: 'fl' + (o.id || '') + Math.floor(t * 12), boil: false });
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

// ---------- hands ----------
// Fist seen from the side, holding something at (x,y); `ang` = direction the forearm comes from (radians)
function fist(x, y, ang, s = 1, o = {}) {
  // ang = direction from the fist towards the forearm (radians)
  const sleeve = o.sleeve || '#5b6b8a';
  const skin = o.skin || '#e9bf98';
  const R = (pts) => xf(pts, { x, y, s, r: ang + Math.PI });
  // sleeve: tapered tube from the wrist backwards, with a cuff
  shape(R([[-34, -24], [-230, -34], [-230, 34], [-34, 24]]), { fill: sleeve, op: 225, bleed: 0.05, tex: 0.4, border: 0.3, line: INK, w: 1.4, curve: 0.15, id: 'sl' + (o.id || '') });
  shape(R([[-30, -26], [-52, -28], [-52, 28], [-30, 26]]), { wash: mixHex(sleeve, '#000000', 0.25), line: INK, w: 1.2, curve: 0.1, id: 'cf' + (o.id || '') });
  // fist (knuckles forward)
  const f = [[-30, -20], [-6, -28], [20, -26], [36, -14], [38, 6], [32, 24], [8, 30], [-22, 26], [-32, 12]];
  shape(R(f), { fill: skin, op: 235, bleed: 0.04, tex: 0.2, border: 0.2, line: INK, w: 1.5, curve: 0.55, id: 'fs' + (o.id || '') });
  for (let i = 0; i < 3; i++) {
    const yy = -12 + i * 12;
    path(R([[14, yy], [34, yy + 1]]), 'HB', INK, 1.0, { id: 'fc' + i + (o.id || '') });
  }
  path(R([[-20, -22], [6, -34], [26, -24]]), 'HB', INK, 1.3, { id: 'th' + (o.id || '') });
}

// ---------- characters ----------
// Bust in 3/4-front view. Head centre at (0,0) in local space, head ~ 120x150.
// opt: skin, hair, hairStyle(bun|curly|bald|short|scarf|wavy), coat, collar(white|shawl|cravat|band|hoodie),
//      expr(neutral|worry|surprised|blow|focus), mustache, beard, jawGlow (0..1), blush, look (eye offset)
function person(x, y, s, opt = {}) {
  const id = opt.id || 'p';
  const T = (pts) => xf(pts, { x, y, s });
  const skin = opt.skin || '#ecc6a2';
  const coat = opt.coat || '#4f5d75';
  const hair = opt.hair || '#3b2a20';
  const expr = opt.expr || 'neutral';
  const ex = opt.look || 0;

  // --- back hair (behind head)
  if (opt.hairStyle === 'curly') {
    const wig = [[-82, -70], [-92, 10], [-104, 90], [-96, 170], [-60, 190], [-40, 120], [40, 120], [60, 190], [96, 170], [104, 90], [92, 10], [82, -70], [40, -112], [-40, -112]];
    shape(T(wig), { fill: hair, op: 210, bleed: 0.12, tex: 0.6, border: 0.4, curve: 0.6, id: id + 'wig' });
  }
  if (opt.hairStyle === 'bun') {
    shape(T(ell(28, -92, 34, 28, 18)), { fill: hair, op: 220, bleed: 0.06, tex: 0.5, line: INK, w: 1.1, id: id + 'bun' });
  }
  if (opt.hairStyle === 'scarf') {
    const sc = [[-80, -40], [-92, 40], [-78, 120], [-40, 150], [40, 150], [78, 120], [92, 40], [80, -40], [50, -100], [0, -116], [-50, -100]];
    shape(T(sc), { fill: opt.scarf || '#8a6f5a', op: 215, bleed: 0.08, tex: 0.45, line: INK, w: 1.2, curve: 0.6, id: id + 'scb' });
  }

  // --- body / coat
  const body = [[-175, 330], [-160, 190], [-110, 132], [-34, 104], [34, 104], [110, 132], [160, 190], [175, 330]];
  shape(T(body), { fill: coat, op: 215, bleed: 0.08, tex: 0.45, border: 0.3, line: INK, w: 1.5, curve: 0.45, id: id + 'body' });
  // neck
  shape(T([[-24, 66], [24, 66], [28, 118], [-28, 118]]), { fill: skin, op: 200, bleed: 0.05, tex: 0.2, border: 0.1, curve: 0.2, id: id + 'neck' });
  path(T([[-24, 62], [-28, 116]]), 'HB', INK, 1.0, { id: id + 'nl' });
  path(T([[24, 62], [28, 116]]), 'HB', INK, 1.0, { id: id + 'nr' });
  // collar variants
  if (opt.collar === 'band') { // 17th c. white falling band
    shape(T([[-70, 112], [70, 112], [92, 176], [0, 196], [-92, 176]]), { fill: '#f7f3ea', op: 200, bleed: 0.03, tex: 0.15, line: INK, w: 1.2, curve: 0.35, id: id + 'band' });
  } else if (opt.collar === 'cravat') {
    shape(T([[-46, 106], [46, 106], [20, 150], [0, 190], [-20, 150]]), { fill: '#f4efe4', op: 200, bleed: 0.03, tex: 0.1, line: INK, w: 1.1, curve: 0.4, id: id + 'crv' });
    path(T([[-60, 110], [-30, 200], [-46, 300]]), 'HB', INK, 1.1, { id: id + 'lap1' });
    path(T([[60, 110], [30, 200], [46, 300]]), 'HB', INK, 1.1, { id: id + 'lap2' });
  } else if (opt.collar === 'shawl') {
    shape(T([[-150, 210], [-100, 130], [-30, 112], [0, 170], [30, 112], [100, 130], [150, 210], [60, 250], [0, 230], [-60, 250]]), { fill: opt.shawl || '#7b5d4c', op: 205, bleed: 0.06, tex: 0.55, line: INK, w: 1.2, curve: 0.4, id: id + 'shawl', hatch: [7, 60, { rand: 0.2 }], hcolor: '#3b2a20', hw: 0.6 });
  } else if (opt.collar === 'white') {
    path(T([[-40, 110], [0, 140], [40, 110]]), 'HB', INK, 1.1, { id: id + 'wc' });
  } else if (opt.collar === 'hoodie') {
    shape(T([[-90, 118], [0, 150], [90, 118], [70, 170], [0, 186], [-70, 170]]), { fill: mixHex(coat, '#000000', 0.15), op: 200, bleed: 0.05, tex: 0.3, line: INK, w: 1.1, curve: 0.5, id: id + 'hood' });
  }
  if (opt.hairStyle === 'curly') {
    for (const sx of [-1, 1]) shape(T([[sx * 60, 0], [sx * 96, 20], [sx * 108, 100], [sx * 100, 180], [sx * 70, 200], [sx * 58, 120]]), { fill: hair, op: 225, bleed: 0.1, tex: 0.6, border: 0.4, line: INK, w: 1.1, curve: 0.6, id: id + 'lobe' + sx });
  }
  if (opt.apron) {
    shape(T([[-80, 200], [80, 200], [96, 330], [-96, 330]]), { fill: '#efe7d6', op: 190, bleed: 0.03, tex: 0.2, line: INK, w: 1.1, curve: 0.2, id: id + 'apr' });
  }

  // --- head
  const head = [];
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * TAU; const lower = Math.max(0, Math.sin(a));
    const puff = expr === 'blow' ? 1 + 0.12 * Math.exp(-Math.pow((Math.sin(a) - 0.45) * 3, 2)) : 1;
    head.push([Math.cos(a) * 60 * (1 - 0.2 * lower * lower) * puff, Math.sin(a) * 76 - 4]);
  }
  // ears
  shape(T(ell(-60, 4, 10, 16, 12)), { fill: skin, op: 210, line: INK, w: 1.0, id: id + 'e1', bleed: 0.03 });
  shape(T(ell(60, 4, 10, 16, 12)), { fill: skin, op: 210, line: INK, w: 1.0, id: id + 'e2', bleed: 0.03 });
  shape(T(head), { fill: skin, op: 215, bleed: 0.05, tex: 0.25, border: 0.12, line: INK, w: 1.5, curve: 0.5, id: id + 'head' });

  // glowing jaw (phossy jaw) — green wash on the lower face
  if (opt.jawGlow > 0) {
    const jaw = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.08 + Math.PI * 0.84 * i / 14; jaw.push([Math.cos(a) * 56 * (1 - 0.2 * Math.sin(a) * Math.sin(a)), Math.sin(a) * 70 - 4]); }
    jaw.push([-30, 30], [30, 30]);
    shape(T(jaw), { fill: '#59f08a', op: Math.round(80 + 150 * opt.jawGlow), bleed: 0.1, tex: 0.3, border: 0.2, curve: 0.5, id: id + 'jaw', boil: false });
  }

  // blush
  if (opt.blush !== false) {
    shape(T(ell(-34, 26, 13, 8, 12)), { fill: '#e48b7b', op: expr === 'blow' ? 150 : 70, bleed: 0.2, tex: 0.1, id: id + 'bl1', boil: false });
    shape(T(ell(34, 26, 13, 8, 12)), { fill: '#e48b7b', op: expr === 'blow' ? 150 : 70, bleed: 0.2, tex: 0.1, id: id + 'bl2', boil: false });
  }

  // --- front hair
  if (opt.hairStyle === 'bun' || opt.hairStyle === 'short' || opt.hairStyle === 'wavy') {
    const fr = opt.hairStyle === 'bun'
      ? [[-64, 10], [-66, -40], [-44, -78], [0, -88], [44, -78], [66, -40], [64, 10], [52, -30], [20, -56], [0, -50], [-20, -56], [-52, -30]]
      : [[-64, -6], [-68, -46], [-40, -84], [8, -92], [50, -80], [68, -44], [64, -6], [54, -36], [30, -58], [-6, -62], [-40, -52], [-56, -30]];
    shape(T(fr), { fill: hair, op: 225, bleed: 0.06, tex: 0.5, border: 0.3, line: INK, w: 1.3, curve: 0.5, id: id + 'hair' });
    for (let i = 0; i < 5; i++) path(T([[-40 + i * 18, -70 + Math.abs(i - 2) * 4], [-46 + i * 20, -40]]), 'HB', INK, 0.7, { id: id + 'hs' + i });
  } else if (opt.hairStyle === 'curly') {
    shape(T([[-66, -10], [-70, -56], [-36, -96], [10, -102], [52, -88], [72, -50], [66, -10], [44, -50], [0, -64], [-42, -54]]), { fill: hair, op: 220, bleed: 0.08, tex: 0.6, line: INK, w: 1.2, curve: 0.6, id: id + 'hairf' });
    const curls = [[-80, 20], [-92, 60], [-96, 100], [-88, 140], [-76, 176], [80, 20], [92, 60], [96, 100], [88, 140], [76, 176], [-60, -70], [-30, -96], [6, -100], [40, -92], [64, -66]];
    curls.forEach((c, i) => {
      const sp = []; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU * 1.6 + i; const rr = 4 + k * 0.85; sp.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
      path(T(sp), 'HB', INK, 0.9, { id: id + 'curl' + i, curve: 0.8 });
    });
  } else if (opt.hairStyle === 'bald') {
    shape(T([[-62, -10], [-66, -40], [-50, -46], [-48, 0]]), { fill: hair, op: 200, line: INK, w: 1.0, id: id + 'bh1', curve: 0.6 });
    shape(T([[62, -10], [66, -40], [50, -46], [48, 0]]), { fill: hair, op: 200, line: INK, w: 1.0, id: id + 'bh2', curve: 0.6 });
    path(T([[-30, -66], [-10, -74], [14, -72]]), 'HB', INK, 0.6, { id: id + 'shine' });
  } else if (opt.hairStyle === 'scarf') {
    shape(T([[-74, 10], [-78, -40], [-50, -92], [0, -108], [50, -92], [78, -40], [74, 10], [60, -40], [30, -64], [0, -68], [-30, -64], [-60, -40]]), { fill: opt.scarf || '#8a6f5a', op: 225, bleed: 0.06, tex: 0.45, line: INK, w: 1.3, curve: 0.55, id: id + 'scf' });
    shape(T([[-30, -64], [0, -68], [30, -64], [24, -50], [0, -54], [-24, -50]]), { fill: hair, op: 200, id: id + 'scfh', curve: 0.5 });
  }
  if (opt.sideburns) {
    shape(T([[-60, -10], [-58, 30], [-48, 34], [-50, -6]]), { fill: opt.sideburns, op: 210, line: INK, w: 0.9, id: id + 'sb1', curve: 0.4 });
    shape(T([[60, -10], [58, 30], [48, 34], [50, -6]]), { fill: opt.sideburns, op: 210, line: INK, w: 0.9, id: id + 'sb2', curve: 0.4 });
  }

  // --- face features
  const browY = expr === 'surprised' ? -34 : -24;
  const tilt = expr === 'worry' ? -8 : expr === 'focus' ? 4 : 0;
  path(T([[-38, browY + 2 + tilt * 0.3], [-26, browY - 2], [-12, browY + tilt]]), '2B', INK, 1.5, { id: id + 'br1' });
  path(T([[12, browY + tilt], [26, browY - 2], [38, browY + 2 + tilt * 0.3]]), '2B', INK, 1.5, { id: id + 'br2' });
  const eyeR = expr === 'surprised' ? 8 : 5.2;
  for (const sx of [-1, 1]) {
    const cx = sx * 24;
    if (expr === 'blow') {
      path(T([[cx - 10, -4], [cx, 0], [cx + 10, -4]]), 'HB', INK, 1.4, { id: id + 'eyc' + sx });
    } else {
      if (expr === 'surprised') shape(T(ell(cx, -4, 12, 11, 14)), { wash: '#fbf7ef', line: INK, w: 1.1, id: id + 'eyw' + sx });
      shape(T(ell(cx + ex, -4, eyeR, eyeR * 1.1, 12)), { wash: '#2a1d18', id: id + 'eye' + sx, boil: false });
      path(T([[cx - 12, -10], [cx, -15], [cx + 12, -10]]), 'HB', INK, 1.1, { id: id + 'lid' + sx });
    }
  }
  path(T([[2, 2], [7, 22], [-2, 26]]), 'HB', INK, 1.2, { id: id + 'nose', curve: 0.6 });
  if (opt.mustache) {
    shape(T([[-30, 42], [-14, 32], [0, 36], [14, 32], [30, 42], [14, 40], [0, 42], [-14, 40]]), { fill: opt.mustache, op: 230, line: INK, w: 1.0, curve: 0.5, id: id + 'mst' });
  }
  if (opt.beard) {
    shape(T([[-50, 30], [-36, 66], [0, 82], [36, 66], [50, 30], [30, 54], [0, 60], [-30, 54]]), { fill: opt.beard, op: 215, line: INK, w: 1.0, curve: 0.55, id: id + 'brd' });
  }
  if (expr === 'surprised') shape(T(ell(0, 50, 10, 13, 14)), { wash: '#5a2420', line: INK, w: 1.1, id: id + 'mo' });
  else if (expr === 'blow') shape(T(ell(4, 48, 6, 6, 10)), { wash: '#5a2420', line: INK, w: 1.1, id: id + 'mo' });
  else if (expr === 'worry') path(T([[-14, 50], [0, 46], [14, 50]]), 'HB', INK, 1.3, { id: id + 'mo' });
  else if (expr === 'smile') path(T([[-16, 44], [0, 52], [16, 44]]), 'HB', INK, 1.3, { id: id + 'mo' });
  else path(T([[-13, 48], [0, 50], [13, 47]]), 'HB', INK, 1.3, { id: id + 'mo' });
}

// Glass flask (Brand's) centred on bulb (x,y), scale s. `liquid` colour.
function flask(x, y, s, o = {}) {
  const T = (p) => xf(p, { x, y, s });
  const id = o.id || 'fk';
  // liquid
  const liq = []; for (let i = 0; i <= 20; i++) { const a = 0.1 * Math.PI + 0.8 * Math.PI * i / 20; liq.push([Math.cos(a) * 98, Math.sin(a) * 98]); }
  liq.push([-85, 20]);
  shape(T(liq), { fill: o.liquid || '#5df58c', op: o.lop ?? 200, bleed: 0.05, tex: 0.3, border: 0.5, curve: 0.5, id: id + 'liq', boil: false });
  // glass outline: bulb + neck
  const g = [];
  for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + 0.16 + (TAU - 0.32) * i / 30; g.push([Math.cos(a) * 104, Math.sin(a) * 104]); }
  const outline = [[-20, -210], [-20, -102], ...g.slice(1, -1).reverse().map(([a, b]) => [a, b]), [20, -102], [20, -210]];
  void outline;
  path(T([[-18, -230], [-18, -104]]), '2B', INK, 1.6, { id: id + 'n1' });
  path(T([[18, -230], [18, -104]]), '2B', INK, 1.6, { id: id + 'n2' });
  path(T(g), '2B', INK, 1.7, { id: id + 'bulb', curve: 0.6 });
  shape(T([[-26, -238], [26, -238], [26, -226], [-26, -226]]), { line: INK, w: 1.3, curve: 0, id: id + 'lip' });
  // highlight
  path(T(ell(0, 0, 76, 76, 10, -2.6, -1.9)), 'HB', '#ffffff', 2.5, { id: id + 'hl' });
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
