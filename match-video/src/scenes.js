// 12 scenes of the script "Сіріңке тарихы" (v2: richer backgrounds, articulated characters, 24 fps).
// Each scene: dur (s), draw(t) — brush layer (world coords 540x960), post(t, tq, O) — overlays, cam(t), bg(t).
/* global B, W, H, INK, PAPER, TAU, K, clamp, lerp, seg, ease, rnd, mixHex, xf, ell, jitter, partial,
   shape, path, line, circ, box, rectP, check, cross, flame, match, flask, pop, person, arm, fist, hand */

const GREEN = '#43ff7e';
const WARM = '#ffb03a';
const smooth = (t, a, b) => ease.io(seg(t, a, b));

// ---------------------------------------------------------------- background pieces
function brickLines(x, y, w, h, col, id) {
  for (let r = 0; r * 16 < h; r++) {
    const yy = y + r * 16;
    path([[x, yy], [x + w, yy]], 'HB', col, 0.6, { id: id + 'r' + r });
    for (let c = 0; c * 36 < w; c++) { const xx = x + c * 36 + (r % 2) * 18; if (xx < x + w - 4) path([[xx, yy], [xx, yy + 16]], 'HB', col, 0.5, { id: id + 'c' + r + '_' + c }); }
  }
}
function windowBox(x, y, w, h, lit, id, glass = '#ffcf4a') {
  box(x - 4, y - 4, w + 8, h + 8, { wash: '#3a2e2a', id: id + 'fr' });
  box(x, y, w, h, { wash: lit ? glass : '#2c3350', line: INK, w: 0.9, id: id + 'g' });
  path([[x + w / 2, y], [x + w / 2, y + h]], 'HB', '#3a2e2a', 1.6, { id: id + 'm1' });
  path([[x, y + h / 2], [x + w, y + h / 2]], 'HB', '#3a2e2a', 1.6, { id: id + 'm2' });
  box(x - 6, y + h + 2, w + 12, 6, { wash: '#6a6070', id: id + 'sill' });
}
function bottle(x, y, w, h, col, id, label = true) {
  shape([[x - w / 2, y], [x - w / 2, y - h * 0.62], [x - w * 0.18, y - h * 0.82], [x - w * 0.18, y - h], [x + w * 0.18, y - h], [x + w * 0.18, y - h * 0.82], [x + w / 2, y - h * 0.62], [x + w / 2, y]],
    { fill: col, op: 200, bleed: 0.02, tex: 0.35, border: 0.4, line: INK, w: 1.1, curve: 0.25, id });
  box(x - w * 0.22, y - h - 8, w * 0.44, 9, { wash: '#7a4a2a', line: INK, w: 0.8, id: id + 'k' });
  if (label) { box(x - w * 0.34, y - h * 0.45, w * 0.68, h * 0.26, { wash: '#f6ecd2', line: '#8a7a60', w: 0.6, id: id + 'l' }); path([[x - w * 0.24, y - h * 0.34], [x + w * 0.2, y - h * 0.34]], 'HB', '#6a5a40', 0.6, { id: id + 'll' }); }
  path([[x - w * 0.32, y - h * 0.55], [x - w * 0.32, y - h * 0.1]], 'HB', '#ffffff', 1.6, { id: id + 'h' });
}
function shelf(y, id, col = '#7a4e2c') {
  box(-20, y, 580, 12, { wash: col, line: INK, w: 1.0, id: id });
  box(-20, y + 12, 580, 5, { wash: mixHex(col, '#000000', 0.4), id: id + 's' });
}
function books(x, y, n, id) {
  const cols = ['#a8323a', '#2c5aa0', '#2f8a5e', '#c99a2a', '#6a3a8a', '#1f6f78', '#b5582a'];
  let xx = x;
  for (let i = 0; i < n; i++) {
    const w = 14 + (i * 7) % 9, h = 58 + (i * 13) % 26; const lean = i === n - 1 ? 0.18 : 0;
    shape(xf(rectP(0, -h, w, h), { x: xx, y, r: lean }), { wash: cols[i % cols.length], line: INK, w: 0.9, curve: 0, id: id + i });
    path(xf([[3, -h * 0.75], [w - 3, -h * 0.75]], { x: xx, y, r: lean }), 'HB', '#f2d27a', 1.0, { id: id + 'b' + i });
    xx += w + 1;
  }
}
function candle(x, y, t, id = 'cdl') {
  box(x - 22, y - 6, 44, 10, { wash: '#b08a3a', line: INK, w: 1.0, id: id + 'p' });
  box(x - 9, y - 70, 18, 64, { fill: '#f7efd8', op: 230, bleed: 0.02, tex: 0.2, line: INK, w: 1.1, id: id + 'w' });
  path([[x - 7, y - 66], [x - 8, y - 52]], 'HB', '#e8dcc0', 1.4, { id: id + 'd' });
  line(x, y - 70, x, y - 78, 'HB', INK, 1.0, id + 'wk');
  flame(x, y - 80, 10, t, { id: id + 'f' });
}
function cobbles(y0, id, col = '#7a7480') {
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const x = -10 + c * 66 + (r % 2) * 33, y = y0 + 18 + r * 34;
    path(ell(x, y, 26 + r * 3, 9 + r * 2, 10, Math.PI * 1.05, Math.PI * 1.95), 'HB', col, 0.8, { id: id + r + '_' + c, curve: 0.6 });
  }
}
function table(y, col = '#c39b6c', id = 'tbl') {
  box(-20, y, 580, 1000 - y, { wash: col, line: INK, w: 1.5, id });
  box(-20, y, 580, 10, { wash: mixHex(col, '#ffffff', 0.25), id: id + 'top' });
  for (let i = 0; i < 6; i++) path([[-10, y + 34 + i * 44], [180, y + 38 + i * 44 + (i % 2) * 6], [380, y + 30 + i * 44], [560, y + 34 + i * 44]], 'HB', mixHex(col, '#3b2414', 0.5), 0.8, { id: id + 'g' + i, curve: 0.6 });
  for (let i = 0; i < 2; i++) path(ell(120 + i * 260, y + 120 + i * 60, 16, 6, 10), 'HB', mixHex(col, '#3b2414', 0.5), 0.8, { id: id + 'k' + i, curve: 0.7 });
}
function planks(y0, col = '#b98a5a', id = 'pl') {
  box(-20, y0, 580, 1000 - y0, { wash: col, id });
  for (let i = 0; i < 7; i++) path([[-10, y0 + i * 70], [560, y0 + i * 70 + 4]], 'HB', INK, 1.2, { id: id + 'l' + i });
  for (let i = 0; i < 12; i++) {
    const yy = y0 + 18 + i * 30; const pts = [];
    for (let k = 0; k < 6; k++) pts.push([-10 + k * 115, yy + Math.sin(k * 1.3 + i) * 6]);
    path(pts, 'HB', mixHex(col, '#3b2414', 0.5), 0.7, { id: id + 'g' + i, curve: 0.7 });
  }
  for (let i = 0; i < 3; i++) path(ell(90 + i * 170, y0 + 100 + i * 70, 14, 6, 10), 'HB', mixHex(col, '#3b2414', 0.55), 0.9, { id: id + 'kn' + i, curve: 0.7 });
}

// ---------------------------------------------------------------- scene 1 / 9 pieces
function factoryBG(t) {
  // sky gradient is done in post; moon + stars there too
  shape(ell(452, 120, 32, 32, 20), { wash: '#fff3c8', id: 'moon' });
  shape(ell(442, 112, 8, 6, 10), { wash: '#ead9a0', id: 'cr1' }); shape(ell(462, 132, 6, 5, 10), { wash: '#ead9a0', id: 'cr2' });
  // far buildings
  shape([[-20, 560], [-20, 470], [60, 470], [60, 430], [140, 430], [140, 520], [210, 520], [210, 560]], { wash: '#6e6aa0', curve: 0, id: 'far' });
  // left building
  box(-20, 300, 175, 520, { wash: '#a2584a', line: INK, w: 1.3, id: 'fb1' });
  brickLines(-20, 300, 175, 500, '#6a3a32', 'fbb');
  box(56, 110, 40, 200, { wash: '#8a4a3e', line: INK, w: 1.2, id: 'ch1' });
  brickLines(56, 110, 40, 190, '#5a2a22', 'chb');
  box(48, 102, 56, 16, { wash: '#4a2a22', line: INK, w: 1.0, id: 'ch1t' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) windowBox(16 + c * 70, 336 + r * 96, 40, 54, (r + c) % 3 !== 1, `w${r}${c}`);
  // right saw-tooth factory
  shape([[320, 820], [320, 430], [372, 366], [372, 430], [424, 366], [424, 430], [476, 366], [476, 430], [560, 366], [560, 820]], { wash: '#8a6a9a', line: INK, w: 1.3, curve: 0, id: 'fb2' });
  brickLines(320, 440, 240, 360, '#5a4468', 'fb2b');
  box(432, 210, 34, 170, { wash: '#6a4a7a', line: INK, w: 1.2, id: 'ch2' });
  for (let c = 0; c < 3; c++) windowBox(340 + c * 68, 470, 42, 56, true, `wr${c}`);
  // sign board on the left building
  box(-6, 300, 150, 30, { wash: '#2b2420', line: '#c9a24a', w: 1.4, id: 'sign' });
  // street lamp
  box(296, 520, 8, 300, { wash: '#2b2a36', line: INK, w: 1.0, id: 'lp' });
  shape([[286, 520], [314, 520], [322, 490], [278, 490]], { wash: '#ffe08a', line: INK, w: 1.2, curve: 0, id: 'lpg' });
  shape([[274, 490], [326, 490], [300, 474]], { wash: '#2b2a36', line: INK, w: 1.0, curve: 0, id: 'lpt' });
  // smoke
  for (let k = 0; k < 2; k++) {
    for (let j = 0; j < 2; j++) {
      const pts = []; const x0 = k ? 449 : 76, y0 = k ? 205 : 100;
      for (let i = 0; i < 10; i++) pts.push([x0 + i * (8 + j * 3) + Math.sin(i * 0.9 + t * 1.6 + k + j) * 10, y0 - i * 12]);
      path(pts, 'charcoal', j ? '#c8c2d8' : '#a8a2b8', 1.8, { id: 'smk' + k + j, curve: 0.8 });
    }
  }
  // ground
  box(-20, 800, 580, 200, { wash: '#5a5468', id: 'grnd' });
  cobbles(800, 'cb', '#3a3448');
}
function nightPost(O, t, k = 1) {
  O.grad('#33449a', '#5a5aa8', 0.92 * k, 'multiply');
  // stars
  for (let i = 0; i < 18; i++) { const x = (i * 97) % 520 + 10, y = (i * 53) % 260 + 20; O.glow(x, y, 4 + (i % 3), '#ffffff', 0.5 + 0.4 * Math.sin(t * 2 + i), 'screen'); }
  O.glow(452, 120, 120, '#fff4c8', 0.5 * k);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) if ((r + c) % 3 !== 1) O.glow(36 + c * 70, 363 + r * 96, 46, '#ffc24a', 0.55 * k);
  for (let c = 0; c < 3; c++) O.glow(361 + c * 68, 498, 46, '#ffc24a', 0.55 * k);
  O.glow(300, 505, 110, '#ffd27a', 0.6 * k);
  O.text('СІРІҢКЕ ФАБРИКАСЫ', ...signPos(O), { font: 'rub', size: 12 * O.z(), color: '#e8c25a', alpha: k });
}
function girl(t, x, y, s, glow, P = {}) {
  person(x, y, s, {
    id: 'girl', t, female: true, hairStyle: 'bun', hair: '#5a3020', coat: '#3a4f7a', collar: 'shawl', shawl: '#a8452f',
    skin: '#f2bb94', iris: '#4a6a3a', jawGlow: glow, pose: P.pose, arms: P.arms,
  });
}
const pulse = (t, f = 1.1) => 0.5 + 0.5 * Math.sin(t * TAU * f);
function girlPose(t, handT0) {
  const up = smooth(t, 1.2, 2.2);
  const hk = handT0 == null ? 0 : smooth(t, handT0, handT0 + 1.2);
  const pose = { tilt: lerp(0.08, -0.03, up) + Math.sin(t * 0.8) * 0.015, turn: lerp(-0.25, 0.05, up), look: [lerp(-3, 0.5, up), lerp(3.5, 0.5, up)], worry: 1, mouth: 0.08 * hk, nod: lerp(4, 0, up) };
  // left hand rises from below the frame to touch the glowing jaw
  const rest = [250, 1100], touch = [214, 690];
  const to = [lerp(rest[0], touch[0], hk) + Math.sin(t * 1.3) * 2 * hk, lerp(rest[1], touch[1], hk)];
  return { pose, arms: hk > 0.01 ? [{ side: 'L', to, hand: 'open', front: true, bend: 1, handAng: lerp(1.6, 2.1, hk) }] : [] };
}
function girlGlowPost(O, t, k = 1) {
  const p = pulse(t);
  O.glow(272, 690, 120, GREEN, (0.32 + 0.3 * p) * k);
  O.glow(272, 694, 48, '#d2ffe0', (0.25 + 0.3 * p) * k);
}
function questionMark(O, t, t0, green = 0) {
  const p = pop(t, t0, 0.4); if (!p.a) return;
  const col = mixHex('#fff3d6', '#7dffa6', green);
  O.text('?', 440, 230, { size: 230, color: col, scale: p.s, alpha: p.a, rot: 0.12 + Math.sin(t * 2) * 0.03, outline: '#1d2440', outlineW: 6, glow: green > 0 ? '#2dff70' : '#ffe9a8', glowSize: 20 + 30 * green });
}

// ---------------------------------------------------------------- misc props
function moss(x, y, s = 1, id = 'moss') {
  shape(ell(x, y, 120 * s, 42 * s, 22), { fill: '#6e8a2a', op: 230, bleed: 0.15, tex: 0.8, border: 0.35, line: '#3a4a16', w: 1.1, curve: 0.6, id });
  shape(ell(x - 20 * s, y - 8 * s, 70 * s, 20 * s, 16), { fill: '#a8a03a', op: 160, bleed: 0.2, tex: 0.6, id: id + 'hi', boil: false });
  for (let i = 0; i < 34; i++) {
    const a = rnd(i, 3) * TAU, rr = Math.sqrt(rnd(i, 4)) * 112 * s;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.36;
    const b = rnd(i, 5) * TAU;
    path([[px, py], [px + Math.cos(b) * 20 * s, py + Math.sin(b) * 8 * s - 4]], 'HB', ['#2e3a10', '#8a6a3a', '#c9b45a'][i % 3], 1.0, { id: id + 'f' + i, curve: 0.3 });
  }
}
function steel(x, y, s = 1, id = 'st') {
  path(ell(x, y, 52 * s, 18 * s, 22, 0.55, TAU - 0.55), 'pen', '#3e434c', 4.6, { id, curve: 0.6 });
  path(ell(x, y, 46 * s, 13 * s, 16, 0.9, TAU - 0.9), 'HB', '#c8d0da', 1.4, { id: id + 'hl', curve: 0.6 });
}
function flint(x, y, id = 'flint') {
  const pts = jitter(ell(x, y, 36, 26, 9), 14, id);
  shape(pts, { fill: '#8a96a8', op: 230, bleed: 0.03, tex: 0.65, border: 0.5, line: INK, w: 1.4, curve: 0.15, id });
  shape(jitter(ell(x - 6, y - 6, 16, 10, 7), 6, id + 'f'), { fill: '#c8d2e0', op: 160, id: id + 'facet', curve: 0.1 });
  path([[x - 16, y - 8], [x + 6, y - 14]], 'HB', '#ffffff', 1.6, { id: id + 'h' });
}
function sparks(t, t0, n, salt, target, x0 = 232, y0 = 470) {
  const out = []; const dt = t - t0; if (dt < 0 || dt > 0.75) return out;
  const g = 1200;
  for (let i = 0; i < n; i++) {
    let vx = -140 + rnd(i, salt) * 340, vy = -120 + rnd(i, salt + 1) * 420;
    const life = 0.22 + rnd(i, salt + 2) * 0.32;
    if (target && i === 0) { vx = (target[0] - x0) / 0.5; vy = (target[1] - y0 - 0.5 * g * 0.25) / 0.5; }
    const L = target && i === 0 ? 0.5 : life;
    if (dt > L) continue;
    out.push({ x: x0 + vx * dt, y: y0 + vy * dt + 0.5 * g * dt * dt, vx, vy: vy + g * dt, fade: 1 - dt / L });
  }
  return out;
}
function sparkLine(sp, id) {
  const l = Math.hypot(sp.vx, sp.vy) || 1;
  path([[sp.x, sp.y], [sp.x - sp.vx / l * 22, sp.y - sp.vy / l * 22]], 'pen', '#ff7a10', 2.8, { id });
}
function lettersP(x, y, s, prog, id = 'P', col = INK) {
  const pts = [[0, 230], [0, 0], [62, 0], [100, 28], [104, 74], [70, 112], [2, 116]].map(([a, b]) => [x + a * s, y + b * s]);
  path(partial(pts, prog), 'charcoal', col, 5.6 * s, { id, curve: 0.35 });
}
function qmark(x, y, s, prog, id = 'q', col = INK) {
  const pts = [[0, 40], [20, 6], [62, -4], [96, 20], [98, 62], [66, 92], [52, 118], [52, 158]].map(([a, b]) => [x + a * s, y + b * s]);
  path(partial(pts, clamp(prog / 0.85)), 'charcoal', col, 5.6 * s, { id, curve: 0.5 });
  if (prog > 0.9) circ(x + 52 * s, y + 205 * s, 9 * s, { wash: col, id: id + 'd' });
}
// damped spring helper (balance beam etc.)
function spring(t, t0, from, to, w = 9, damp = 3.2) {
  if (t < t0) return from;
  const d = t - t0; return to + (from - to) * Math.exp(-damp * d) * Math.cos(w * d);
}
function balance(theta, id = 'bal') {
  const px = 270, py = 360, L = 190;
  shape(ell(px, 862, 124, 28, 20), { fill: '#8a5a2a', op: 235, bleed: 0.03, tex: 0.4, line: INK, w: 1.4, id: id + 'base' });
  box(px - 10, py, 20, 500, { fill: '#c9963e', op: 235, bleed: 0.02, tex: 0.35, line: INK, w: 1.4, id: id + 'post' });
  path([[px - 4, py + 10], [px - 4, 850]], 'HB', '#ffe7a0', 1.6, { id: id + 'ph' });
  shape([[px - 24, py + 10], [px + 24, py + 10], [px, py - 24]], { wash: '#8a5a2a', line: INK, w: 1.2, curve: 0, id: id + 'piv' });
  const c = Math.cos(theta), s = Math.sin(theta);
  const lx = px - c * L, ly = py - s * L, rx = px + c * L, ry = py + s * L;
  shape([[lx + s * 7, ly - c * 7 - 6], [rx + s * 7, ry - c * 7 - 6], [rx - s * 7, ry + c * 7 - 6], [lx - s * 7, ly + c * 7 - 6]], { fill: '#c9963e', op: 240, bleed: 0.02, tex: 0.35, line: INK, w: 1.4, curve: 0, id: id + 'beam' });
  const pans = [[lx, ly], [rx, ry]];
  pans.forEach(([ex, ey], k) => {
    const panY = ey + 170;
    path([[ex, ey], [ex - 58, panY]], 'HB', INK, 1.1, { id: id + 'sa' + k });
    path([[ex, ey], [ex + 58, panY]], 'HB', INK, 1.1, { id: id + 'sb' + k });
    shape(ell(ex, panY + 4, 68, 17, 18, 0, Math.PI).concat([[ex - 68, panY], [ex + 68, panY]]), { fill: '#d9a842', op: 240, bleed: 0.02, tex: 0.3, line: INK, w: 1.4, curve: 0.4, id: id + 'pan' + k });
    if (k === 1) {
      const rows = [5, 4, 4, 3, 2, 1]; let n = 0;
      rows.forEach((cnt, r) => {
        for (let j = 0; j < cnt; j++) {
          const cx = ex + (j - (cnt - 1) / 2) * 22 + (r % 2) * 3, cy = panY - 6 - r * 13;
          shape(ell(cx, cy, 13, 6, 12), { wash: n % 2 ? '#ffcf3a' : '#f0a81e', line: '#7a4a0a', w: 0.9, id: id + 'c' + n });
          path([[cx - 6, cy - 2], [cx + 2, cy - 3]], 'HB', '#fff6c0', 1.0, { id: id + 'cg' + n }); n++;
        }
      });
    }
  });
  return { lx, ly: ly + 170, rx, ry: ry + 170 };
}
function vial(x, y, id = 'vial') {
  box(x - 16, y - 76, 32, 76, { fill: '#fff6b0', op: 170, bleed: 0.02, tex: 0.2, line: INK, w: 1.4, id });
  box(x - 12, y - 42, 24, 38, { fill: '#f2ffd0', op: 220, bleed: 0.02, tex: 0.3, id: id + 'c' });
  box(x - 18, y - 90, 36, 14, { wash: '#8a5a3a', line: INK, w: 1.1, id: id + 'cork' });
  path([[x - 9, y - 70], [x - 9, y - 10]], 'HB', '#ffffff', 1.6, { id: id + 'h' });
}
function jar(x, y, w, h, col, id) {
  box(x - w / 2, y - h, w, h, { fill: col, op: 190, bleed: 0.03, tex: 0.4, border: 0.4, line: INK, w: 1.1, id });
  box(x - w / 2 - 3, y - h - 12, w + 6, 12, { wash: '#5a3a2a', line: INK, w: 1.0, id: id + 'l' });
  box(x - w / 3, y - h * 0.68, w * 0.66, h * 0.32, { wash: '#f6ecd2', line: '#8a7a60', w: 0.6, id: id + 'lab' });
  path([[x - w / 4, y - h * 0.58], [x + w / 4, y - h * 0.58]], 'HB', '#6a5a40', 0.6, { id: id + 'tx' });
  path([[x - w / 2 + 5, y - h + 6], [x - w / 2 + 5, y - 6]], 'HB', '#ffffff', 1.4, { id: id + 'hl' });
}
function stoneWall(y0, y1, id = 'sw') {
  let n = 0;
  for (let r = 0; r * 70 + y0 < y1; r++) for (let c = -1; c < 6; c++) {
    const x = c * 110 + (r % 2) * 55, y = y0 + r * 70;
    const col = ['#a99a8a', '#9c8e80', '#b8a894', '#8f857a'][n % 4];
    shape(jitter(rectP(x + 4, y + 4, 102, 62), 6, id + n), { fill: col, op: 220, bleed: 0.02, tex: 0.5, border: 0.3, line: INK, w: 1.0, curve: 0.25, id: id + n }); n++;
  }
}
function bricks(id = 'br') {
  box(-20, 0, 580, 960, { wash: '#d8c8b0', id: id + 'mortar' });
  let n = 0;
  for (let r = 0; r < 15; r++) for (let c = -1; c < 5; c++) {
    const x = c * 120 + (r % 2) * 60, y = r * 64;
    const col = ['#c4573a', '#b04a30', '#d0694a', '#a34028'][(n * 7) % 4];
    shape(jitter(rectP(x + 4, y + 4, 112, 56), 5, id + n), { wash: col, line: '#5a2a1c', w: 0.9, curve: 0.2, id: id + n });
    if (n % 3 === 0) path([[x + 14, y + 16], [x + 50, y + 18]], 'HB', '#e88a6a', 0.9, { id: id + 'h' + n });
    n++;
  }
}
function boot() {
  box(-20, 700, 580, 300, { wash: '#8a6a4a', id: 'floor7' });
  box(-20, 0, 580, 700, { wash: '#d9c39a', id: 'wall7' });
  // trouser leg
  shape([[30, -20], [250, -20], [244, 120], [36, 120]], { fill: '#3a4a6a', op: 235, bleed: 0.03, tex: 0.5, line: INK, w: 1.5, curve: 0.2, id: 'leg' });
  for (let i = 0; i < 3; i++) path([[60 + i * 60, 10], [70 + i * 56, 110]], 'HB', '#22304a', 1.0, { id: 'lf' + i });
  const b = [[40, 100], [236, 100], [240, 400], [300, 450], [430, 490], [510, 540], [522, 640], [30, 640], [36, 360]];
  shape(b, { fill: '#6a3a1e', op: 240, bleed: 0.03, tex: 0.55, border: 0.45, line: INK, w: 1.8, curve: 0.3, id: 'boot' });
  shape([[150, 110], [236, 110], [240, 400], [300, 450], [430, 490], [510, 540], [516, 600], [300, 560], [200, 420]], { fill: '#3a1e0e', op: 120, bleed: 0.08, tex: 0.3, curve: 0.4, id: 'bootsh', boil: false });
  path([[70, 140], [76, 380]], 'HB', '#c98a5a', 2.0, { id: 'bhl' });
  path([[240, 400], [300, 450], [380, 470]], 'HB', '#2e1808', 1.4, { id: 'bseam' });
  for (let i = 0; i < 6; i++) { circ(246 + i * 28, 420 + i * 9, 4, { wash: '#e9d2a0', line: INK, w: 0.6, id: 'lace' + i }); if (i < 5) line(246 + i * 28, 420 + i * 9, 274 + i * 28, 429 + i * 9, 'HB', '#e9d2a0', 1.2, 'lc' + i); }
  box(20, 640, 510, 40, { wash: '#2e2018', line: INK, w: 1.6, id: 'sole' });
  for (let i = 0; i < 18; i++) circ(36 + i * 28, 660, 2.2, { wash: '#8a7a6a', id: 'nail' + i });
  box(40, 680, 150, 30, { wash: '#2e2018', line: INK, w: 1.4, id: 'heel' });
}
// match struck along a surface: head moves from (x0,y0) to (x1,y1) between ta..tb, ignites at tb if `fire`
function strike(t, x0, y0, x1, y1, ta, tb, fire, o = {}) {
  const k = ease.io(seg(t, ta, tb));
  const pre = seg(t, ta - 0.25, ta) * (1 - seg(t, ta, ta + 0.05));
  const after = seg(t, tb, tb + 0.5);
  const hx = lerp(x0, x1, k) + 14 * pre + (o.liftX || 0) * ease.out(after), hy = lerp(y0, y1, k) - 6 * pre - (o.lift ?? 60) * ease.out(after);
  const ang = (o.ang ?? -0.35) + 0.08 * Math.sin(k * Math.PI);
  const L = o.len ?? 190;
  const fx = hx + Math.cos(ang) * L, fy = hy + Math.sin(ang) * L;
  // shadow of the match on the surface
  if (o.shadow !== false) path([[hx + 6, hy + 14], [fx + 6, fy + 14]], 'charcoal', '#000000', 1.2, { id: (o.id || 'sm') + 'shd' });
  match(hx, hy, ang, L, { id: o.id || 'sm' });
  fist(fx, fy, ang, o.hs ?? 0.95, { id: (o.id || 'sm') + 'h', sleeve: o.sleeve || '#2f5a8a', skin: o.skin });
  let fs = 0;
  if (fire && t >= tb) fs = (o.fsize || 28) * ease.elastic(seg(t, tb, tb + 0.6));
  if (fs > 0) flame(hx - 4, hy - 6, fs, t, { id: (o.id || 'sm') + 'f' });
  return { hx, hy, fs };
}
function smoke(x, y, t, t0, n = 3, id = 'smk', col = '#9a9aa2') {
  for (let j = 0; j < n; j++) {
    const age = t - t0 - j * 0.15; if (age <= 0) continue;
    const pts = []; const h = Math.min(220, age * 160);
    for (let i = 0; i <= 8; i++) pts.push([x + Math.sin(i * 0.9 + t * 3 + j * 2) * (4 + i * 2) + j * 8, y - h * i / 8]);
    path(pts, 'charcoal', col, 1.4, { id: id + j, curve: 0.8 });
  }
}

function dusk(gy) { // evening sky, hills, pines and ground
  box(-20, -20, 580, gy + 20, { wash: '#f2b070', id: 'sky' });
  box(-20, -20, 580, gy * 0.45, { wash: '#e88a5a', id: 'sky2' });
  shape(ell(400, gy * 0.55, 46, 46, 20), { wash: '#ffe2a0', id: 'sun' });
  shape([[-20, gy - 120], [80, gy - 200], [200, gy - 150], [330, gy - 230], [460, gy - 160], [560, gy - 190], [560, gy], [-20, gy]], { wash: '#8a5a7a', curve: 0.5, id: 'hill1' });
  shape([[-20, gy - 60], [120, gy - 110], [260, gy - 70], [400, gy - 120], [560, gy - 80], [560, gy], [-20, gy]], { wash: '#5a4a6a', curve: 0.5, id: 'hill2' });
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 98 + (i % 2) * 20, h = 110 + (i % 3) * 30, y = gy - 40 - (i % 2) * 20;
    shape([[x, y - h], [x + 34, y], [x - 34, y]], { wash: '#2f3a3a', curve: 0.1, id: 'pine' + i });
    line(x, y, x, y + 16, 'HB', '#2a1a10', 2, 'trunk' + i);
  }
  box(-20, gy, 580, 1000 - gy, { wash: '#6a5030', id: 'gnd' });
  for (let i = 0; i < 14; i++) path([[10 + i * 40, gy + 8 + (i % 3) * 30], [18 + i * 40, gy - 6 + (i % 3) * 30]], 'HB', '#3a4a1a', 1.2, { id: 'grass' + i });
  for (let i = 0; i < 10; i++) circ(30 + i * 52, gy + 70 + (i % 3) * 50, 5 + (i % 4) * 3, { wash: '#4a3a24', id: 'peb' + i });
}

// ---------------------------------------------------------------- X-ray
function xray(t, t0) {
  const lt = t - t0;
  const L = '#d6ecf8';
  path([[330, 120], [352, 230], [368, 300], [414, 392], [374, 432], [390, 474], [376, 500], [392, 534], [372, 610], [300, 676], [236, 700], [210, 900]], 'HB', '#7ea4c4', 1.2, { id: 'soft', curve: 0.6 });
  path([[90, 330], [140, 230], [240, 190], [330, 220], [356, 300], [372, 380], [362, 440]], '2B', L, 1.8, { id: 'skull', curve: 0.6 });
  path([[150, 370], [210, 360], [250, 380]], 'HB', L, 1.2, { id: 'zyg', curve: 0.6 });
  shape(ell(300, 300, 34, 26, 16), { line: L, w: 1.3, id: 'orbit' });
  // cervical vertebrae
  for (let i = 0; i < 4; i++) shape(jitter(rectP(150 - i * 6, 640 + i * 66, 54, 50), 4, 'vb' + i), { fill: '#a8c8de', op: 120, line: L, w: 1.1, curve: 0.4, id: 'vb' + i, boil: false });
  path([[214, 418], [300, 424], [352, 440], [364, 470], [330, 478], [240, 478]], '2B', L, 1.6, { id: 'max', curve: 0.6 });
  const necro = ease.io(clamp((lt - 1.5) / 2.2));
  const jaw = [[184, 410], [170, 470], [176, 540], [196, 594], [250, 616], [322, 622], [356, 606], [368, 576], [356, 540], [340, 530], [240, 532], [222, 500], [214, 450], [198, 424]];
  shape(jaw, { fill: mixHex('#e2f0f8', '#8a8f86', necro * 0.6), op: 215, bleed: 0.04, tex: 0.35, border: 0.6, line: L, w: 1.7, curve: 0.7, id: 'mand', boil: false });
  path([[200, 560], [260, 590], [330, 596]], 'HB', '#9ab8cc', 1.0, { id: 'canal', curve: 0.6 });
  for (let i = 0; i < 6; i++) {
    const x = 246 + i * 18;
    shape(rectP(x, 478, 15, 26), { wash: '#f2fafe', line: L, w: 1.0, curve: 0.5, id: 'ut' + i });
    path([[x + 4, 476], [x + 5, 450]], 'HB', L, 0.8, { id: 'utr' + i });
    if (i === 3) {
      const f = ease.in(clamp((lt - 0.6) / 0.9));
      const tooth = xf(rectP(-7, -13, 15, 26), { x: x + 7 + f * 40, y: 515 + f * 480, r: f * 2.4 });
      shape(tooth, { wash: '#f2fafe', line: L, w: 1.0, curve: 0.5, id: 'ft' });
      if (f > 0) shape(ell(x + 7, 516, 7, 10, 10), { wash: '#1a2a40', id: 'gap' });
    } else {
      shape(rectP(x, 504, 15, 24), { wash: '#f2fafe', line: L, w: 1.0, curve: 0.5, id: 'lt' + i });
      path([[x + 6, 528], [x + 7, 560]], 'HB', L, 0.8, { id: 'ltr' + i });
    }
  }
  if (necro > 0) {
    [[300, 580, 36], [252, 570, 28], [334, 560, 22], [220, 540, 20], [280, 600, 18]].forEach(([x, y, r], i) => {
      const rr = r * clamp(necro * 1.4 - i * 0.12);
      if (rr > 1) shape(jitter(ell(x, y, rr * 1.2, rr * 0.8, 14), rr * 0.4, 'nc' + i), { fill: '#2a2018', op: 240, bleed: 0.15, tex: 0.6, curve: 0.6, id: 'nc' + i, boil: false });
    });
  }
}

// ---------------------------------------------------------------- scenes
const SCENES = [
  // 1 ──────────────────────────────────────────────────────────────
  {
    name: '1 · Жарқыраған жақ', dur: 6.6,
    cam: (t) => { const k = ease.io(seg(t, 1.8, 5.2)); return { x: lerp(270, 262, k), y: lerp(480, 640, k), z: lerp(1, 2.0, k) }; },
    draw(t) { factoryBG(t); const g = girlPose(t, 2.6); girl(t, 270, 640, 1.3, 0.6 + 0.4 * pulse(t), g); },
    post(t, tq, O) { nightPost(O, t); girlGlowPost(O, t); questionMark(O, t, 4.6); },
    fadeIn: 0,
  },
  // 2 ──────────────────────────────────────────────────────────────
  {
    name: '2 · Брандтың колбасы → сіріңке', dur: 5.0,
    cam: (t) => { const k = ease.io(seg(t, 3.3, 4.9)); return { x: 270, y: lerp(480, 548, k) + Math.sin(t * 0.6) * 3, z: lerp(1.02, 1.65, k) }; },
    draw(t) {
      box(-20, -20, 580, 680, { wash: '#4a3a5a', id: 'labwall' });
      shelf(180, 'ls1', '#5a3a22'); shelf(330, 'ls2', '#5a3a22');
      const cols = ['#2f8a5e', '#a8323a', '#c99a2a', '#2c5aa0', '#6a3a8a', '#1f6f78'];
      for (let i = 0; i < 6; i++) bottle(40 + i * 92, 180, 34 + (i % 3) * 8, 70 + (i % 2) * 20, cols[i], 'lb' + i);
      books(30, 330, 8, 'lbk'); for (let i = 0; i < 3; i++) bottle(330 + i * 70, 330, 40, 80, cols[(i + 3) % 6], 'lb2' + i);
      table(640, '#7a4a2a');
      // notes + quill
      shape(xf(rectP(-70, -40, 140, 80), { x: 120, y: 720, r: 0.15 }), { wash: '#f4ead0', line: INK, w: 1.0, curve: 0, id: 'note' });
      for (let i = 0; i < 4; i++) path(xf([[-50, -20 + i * 14], [40, -20 + i * 14]], { x: 120, y: 720, r: 0.15 }), 'HB', '#6a5a40', 0.7, { id: 'nl' + i });
      candle(450, 660, t, 'c2');
      const k = ease.io(seg(t, 1.6, 3.3));
      const s = lerp(1, 0.06, k);
      if (t < 3.25) flask(270, lerp(528, 420, k), s, { lop: 225, t });
      if (t >= 3.15) {
        const g = ease.out(seg(t, 3.25, 4.3));
        match(270, 420, Math.PI / 2, 270, { grow: g, headScale: ease.back(seg(t, 3.15, 3.5)) * 2.0, thick: 1.6, id: 'm2' });
      }
    },
    post(t, tq, O) {
      O.grad('#3a3a8a', '#5a4a8a', 0.75, 'multiply');
      O.glow(450, 575, 120, WARM, 0.55 + 0.08 * Math.sin(t * 17));
      const k = ease.io(seg(t, 1.6, 3.3));
      const y = lerp(470, 420, k), r = lerp(280, 34, k);
      const fadeAfter = 1 - 0.85 * seg(t, 3.3, 4.3);
      O.glow(270, y, r, GREEN, (0.6 + 0.2 * pulse(t, 0.9)) * fadeAfter);
      O.glow(270, y + 20, r * 0.45, '#d8ffe4', 0.5 * fadeAfter);
      O.motes(t, 16, 60, 120, 420, 500, '#b8ffcf', 2.5, 0.6 * fadeAfter, 10, 2);
    },
    fadeColor: '#1d2440',
  },
  // 3 ──────────────────────────────────────────────────────────────
  {
    name: '3 · Шақпақ тас', dur: 7.2,
    cam: (t) => (t < 4.3 ? { x: 270, y: 560 + Math.sin(t * 0.7) * 4, z: 1.06 } : { x: 270, y: 520, z: lerp(1.0, 1.08, seg(t, 4.3, 7.2)) }),
    draw(t) {
      if (t < 4.3) {
        dusk(700);
        for (let i = 0; i < 12; i++) circ(30 + i * 46, 760 + (i % 3) * 50, 6 + (i % 4) * 3, { wash: '#4a3a24', id: 'peb' + i });
        moss(288, 812, 1, 'mossA');
        // left hand + flint (recoils at each strike)
        const strikes = [0.9, 2.1, 3.3];
        let k = 0, rec = 0;
        for (const ts of strikes) {
          k = Math.max(k, -0.18 * Math.sin(Math.PI * seg(t, ts - 0.55, ts - 0.25)) + ease.in(seg(t, ts - 0.25, ts)) * (1 - ease.out(seg(t, ts + 0.05, ts + 0.5))));
          rec = Math.max(rec, Math.sin(Math.PI * seg(t, ts, ts + 0.25)));
        }
        fist(196 - rec * 6, 522 + rec * 8, Math.PI * 0.8, 1.05, { id: 'lh', sleeve: '#8a4a2a' });
        flint(214 - rec * 6, 470 + rec * 8);
        const hx = lerp(450, 342, k), hy = lerp(380, 470, k);
        steel(hx - 66, hy, 1.1, 'steel');
        fist(hx, hy, -0.25 - 0.25 * k, 1.05, { id: 'rh', sleeve: '#8a4a2a' });
        strikes.forEach((ts, si) => { sparks(t, ts, 10, si * 10 + 1, si === 2 ? [288, 790] : null).forEach((sp, j) => sparkLine(sp, 'sp' + si + j)); });
        const e = ease.out(seg(t, 3.82, 4.3));
        if (e > 0) {
          circ(288, 790, 6 + 16 * e, { fill: '#e8401a', op: 240, bleed: 0.25, tex: 0.3, id: 'emb', boil: false });
          circ(288, 790, 3 + 7 * e, { wash: '#ffd04a', id: 'emb2' });
        }
        if (t > 4.0) smoke(288, 782, t, 4.0, 2, 'smA');
      } else {
        dusk(820);
        const lt = t - 4.3;
        // breathing cycle: inhale 0-0.6, blow 0.6-2.1, inhale 2.1-2.4, blow 2.4-2.9
        const blowA = smooth(lt, 0.55, 0.75) * (1 - smooth(lt, 2.0, 2.2)) + smooth(lt, 2.35, 2.5);
        const inhale = Math.sin(Math.PI * seg(lt, 0, 0.6)) + Math.sin(Math.PI * seg(lt, 2.05, 2.4));
        const nest = [306, 690 - inhale * 4];
        const blw = person(170, 470, 1.0, {
          id: 'blower', deferArms: true, t, hairStyle: 'short', hair: '#3a2214', coat: '#6a4a8a', collar: 'white', beard: '#3a2214', mustache: '#3a2214',
          pose: { blow: blowA, eyes: blowA > 0.5 ? 'squint' : 'open', lean: 10 + 8 * blowA, nod: 6 + 8 * blowA - inhale * 4, tilt: 0.12, turn: 0.35, look: [3, 4] },
          arms: [{ side: 'L', to: [nest[0] - 96, nest[1] + 18], hand: 'fist', front: true, bend: -1 }, { side: 'R', to: [nest[0] + 90, nest[1] + 22], hand: 'fist', front: true, bend: 1 }],
        });
        moss(nest[0], nest[1], 0.9, 'mossB');
        blw.drawArms();
        const e = seg(t, 4.3, 7.2);
        circ(nest[0] + 6, nest[1] - 10, 14 + 12 * e * (0.8 + 0.2 * blowA), { fill: '#e8401a', op: 240, bleed: 0.25, tex: 0.3, id: 'embB', boil: false });
        circ(nest[0] + 6, nest[1] - 10, 6 + 7 * e, { wash: '#ffd04a', id: 'embB2' });
        if (blowA > 0.2) for (let j = 0; j < 3; j++) {
          const ph = (t * 1.6 + j * 0.33) % 1; const pts = [];
          for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([lerp(196, nest[0] - 6, u), lerp(532 + j * 8, nest[1] - 26 + j * 5, u) + Math.sin(u * 8 + t * 6 + j) * 5]); }
          const pp = partial(pts, 0.3 + 0.7 * ph);
          path(pp.slice(Math.min(pp.length - 2, Math.floor(ph * 3))), '2B', '#e8f2ff', 1.8, { id: 'air' + j, curve: 0.7 });
        }
        smoke(nest[0] + 10, nest[1] - 20, t, 4.3, 3, 'smB', '#b0aab0');
        if (t > 6.5) flame(nest[0] + 6, nest[1] - 18, 28 * ease.elastic(seg(t, 6.5, 7.1)), t, { id: 'mf' });
      }
    },
    post(t, tq, O) {
      O.grad('#ffffff', '#c89a7a', 0.25, 'multiply');
      O.glow(400, t < 4.3 ? 385 : 451, 160, '#fff0b0', 0.4);
      if (t < 4.3) {
        [0.9, 2.1, 3.3].forEach((ts, si) => {
          const d = t - ts; if (d >= 0 && d < 0.25) { O.glow(232, 470, 120, '#ffcf6a', 0.95 * (1 - d / 0.25)); O.flash('#fff0c8', 0.2 * (1 - d / 0.25)); }
          sparks(tq, ts, 10, si * 10 + 1, si === 2 ? [288, 790] : null).forEach((sp) => O.glow(sp.x, sp.y, 18, '#ffb040', 0.9 * sp.fade));
        });
        const e = seg(t, 3.82, 4.3); if (e > 0) O.glow(288, 790, 60 + 40 * e, '#ff7a2a', 0.6 * e);
      } else {
        const e = seg(t, 4.3, 7.2);
        O.glow(312, 680, 80 + 70 * e, '#ff6a1a', 0.5 + 0.35 * e * (0.7 + 0.3 * Math.sin(t * 9)));
        O.glow(240, 500, 220, '#ff9a4a', 0.18 + 0.25 * e);
        if (t > 6.5) O.glow(312, 650, 160, WARM, 0.6);
        O.motes(t, 10, 260, 450, 140, 220, '#ffb050', 2.2, 0.7 * e, 40, 3);
      }
    },
  },
  // 4 ──────────────────────────────────────────────────────────────
  {
    name: '4 · Бойль, 1680', dur: 6.2,
    cam: (t) => ({ x: 270 + Math.sin(t * 0.5) * 3, y: 480, z: lerp(1.0, 1.06, seg(t, 0, 6.2)) }),
    draw(t) {
      box(-20, -20, 580, 680, { wash: '#7a5a3a', id: 'bwall' });
      // window with daylight
      windowBox(40, 60, 150, 200, true, 'bwin', '#bfe2f2');
      box(-20, 300, 260, 12, { wash: '#4a2e1a', id: 'bsh0' });
      books(10, 300, 10, 'bbk');
      // alembic / retort on the shelf
      shape(ell(110, 410, 34, 30, 16), { fill: '#d9a842', op: 210, line: INK, w: 1.2, id: 'ret' });
      path([[136, 396], [200, 360], [222, 372]], 'pen', '#8a5a2a', 3, { id: 'retn' });
      box(-20, 450, 220, 12, { wash: '#4a2e1a', id: 'bsh1' });
      const r = t > 3.0 ? 0.5 - 0.5 * Math.cos((t - 3.0) * TAU * 1.5) : 0;
      const handX = 400 - 90 * r, handY = 650 + 12 * r;
      const sway = -26 * r;
      const lookDown = smooth(t, 0.4, 1.4);
      const ang = -0.62, L = 150;
      const tipX = handX - Math.cos(ang) * L, tipY = handY - Math.sin(ang) * L;
      const by = person(370 + sway, 330, 1.15, {
        id: 'boyle', t, deferArms: true, hairStyle: 'curly', hair: '#8a6a4a', coat: '#1f3a5a', collar: 'band', skin: '#f2c4a0', iris: '#3a5a8a', age: true, buttons: false,
        pose: { tilt: lerp(-0.02, 0.14, lookDown) + Math.sin(t * 0.9) * 0.01, turn: lerp(0.1, -0.3, lookDown), look: [lerp(0, -3, lookDown), lerp(0, 4.5, lookDown)], frown: 0.5, nod: 6 * lookDown },
        arms: [{ side: 'R', to: [handX, handY], hand: 'fist', front: true, bend: -1, item: (hx, hy) => {
          shape([[tipX, tipY - 4], [hx, hy - 4], [hx, hy + 4], [tipX, tipY + 4]], { wash: '#d9a86a', line: '#6a4a2a', w: 1.0, curve: 0, id: 'stick' });
          shape(ell(tipX - 4, tipY, 15, 10, 14), { fill: '#ffd81a', op: 245, bleed: 0.03, tex: 0.5, line: '#8a6a10', w: 1.1, id: 'sulf' });
        } }],
      });
      table(640, '#b8834e');
      shape(xf(rectP(-150, -95, 300, 190), { x: 230, y: 790, r: -0.06 }), { wash: '#fdf8ec', line: INK, w: 1.4, curve: 0, id: 'paper' });
      for (let i = 0; i < 3; i++) path(xf([[-130, 60 + i * 10], [-40, 60 + i * 10]], { x: 230, y: 790, r: -0.06 }), 'HB', '#9a8a6a', 0.6, { id: 'pw' + i });
      shape(jitter(ell(228, 760, 96, 52, 18), 10, 'ph'), { fill: '#d8e070', op: 225, bleed: 0.1, tex: 0.7, border: 0.55, curve: 0.6, id: 'phos', boil: false });
      const nS = Math.floor(seg(t, 3.0, 6.2) * 10);
      for (let i = 0; i < nS; i++) line(168 + rnd(i, 7) * 40, 752 + i * 3, 290 + rnd(i, 8) * 20, 746 + i * 3, 'HB', '#8a7a2a', 0.8, 'scr' + i);
      by.drawArms();
      const a1 = ease.out(seg(t, 1.1, 1.6)), a2 = ease.out(seg(t, 1.9, 2.4));
      if (a1 > 0) path(partial([[96, 880], [124, 846], [168, 806]], a1), '2B', INK, 1.6, { id: 'ar1' });
      if (a2 > 0) path(partial([[420, 900], [380, 860], [tipX + 10, tipY + 18]], a2), '2B', INK, 1.6, { id: 'ar2' });
    },
    post(t, tq, O) {
      O.grad('#fff4dc', '#d8b088', 0.35, 'multiply');
      O.glow(115, 160, 260, '#fff2c8', 0.35);
      const y = pop(t, 0.15); O.text('1680', 34, 92, { font: 'rub', size: 74, align: 'left', scale: y.s, alpha: y.a, color: '#fff3d6', outline: INK, outlineW: 8 });
      const p1 = pop(t, 1.2); O.text('фосфор', 92, 905, { size: 48, scale: p1.s, alpha: p1.a, color: '#4a5a0a', rot: -0.06, outline: '#fdf8ec', outlineW: 6 });
      const p2 = pop(t, 2.0); O.text('күкірт', 440, 925, { size: 48, scale: p2.s, alpha: p2.a, color: '#8a5a00', rot: 0.04, outline: '#fdf8ec', outlineW: 6 });
      if (t > 3.0) O.glow(228, 760, 100, '#fffbb0', 0.18 + 0.12 * Math.sin(t * 20));
      O.motes(t, 14, 40, 60, 300, 400, '#fff6d8', 2.4, 0.5, 8, 4);
    },
  },
  // 5 ──────────────────────────────────────────────────────────────
  {
    name: '5 · Лап! Фосфор қымбат', dur: 6.6,
    cam: (t) => { const sh = t > 0.12 && t < 0.5 ? (1 - seg(t, 0.12, 0.5)) * 9 : 0; return { sx: Math.sin(t * 90) * sh, sy: Math.cos(t * 77) * sh, z: t < 1.9 ? lerp(1.0, 1.1, seg(t, 0, 1.9)) : 1 }; },
    draw(t) {
      if (t < 1.9) {
        table(560, '#b8834e');
        shape(xf(rectP(-240, -120, 480, 240), { x: 260, y: 760, r: -0.05 }), { wash: '#fdf8ec', line: INK, w: 1.4, curve: 0, id: 'paper5' });
        shape(jitter(ell(240, 760, 160, 80, 20), 12, 'ph5'), { fill: '#d8e070', op: 225, bleed: 0.1, tex: 0.7, border: 0.55, curve: 0.6, id: 'phos5', boil: false });
        const tipX = 250, tipY = 610, ang = -0.75, L = 300;
        const ex = tipX + Math.cos(ang) * L, ey = tipY + Math.sin(ang) * L;
        shape([[tipX, tipY - 7], [ex, ey - 7], [ex, ey + 7], [tipX, tipY + 7]], { wash: '#d9a86a', line: '#6a4a2a', w: 1.1, curve: 0, id: 'stick5' });
        shape(ell(tipX - 6, tipY, 24, 16, 14), { fill: '#ffd81a', op: 245, bleed: 0.03, tex: 0.5, line: '#8a6a10', w: 1.1, id: 'sulf5' });
        fist(ex, ey, ang, 1.1, { id: 'h5', sleeve: '#1f3a5a' });
        const fs = 80 * ease.elastic(seg(t, 0.12, 0.75));
        flame(tipX - 6, tipY - 6, fs, t, { id: 'lap' });
        sparks(t, 0.12, 12, 51, null, tipX, tipY - 20).forEach((sp, j) => sparkLine(sp, 'ls' + j));
        smoke(tipX, tipY - 120, t, 0.5, 3, 'sm5');
      } else if (t < 4.7) {
        box(-20, -20, 580, 1000, { wash: '#2f4a5a', id: 'bg5' });
        for (let i = 0; i < 8; i++) path([[i * 76 - 10, -10], [i * 76, 980]], 'HB', '#25404e', 2, { id: 'bgl' + i });
        box(-20, 880, 580, 100, { wash: '#6a4a2a', id: 'tb5' });
        const th0 = 0.17, th1 = -0.2;
        const th = t < 2.55 ? th0 + Math.sin(t * 3) * 0.01 : spring(t, 2.55, th0, th1, 10, 3.0);
        const b = balance(th);
        const drop = ease.in(seg(t, 2.1, 2.5)), bounce = Math.abs(Math.sin(seg(t, 2.5, 2.8) * Math.PI)) * 14 * (1 - seg(t, 2.5, 2.8));
        vial(b.lx, lerp(-60, b.ly - 2, drop) - bounce, 'vial5');
      } else {
        lettersP(150, 360, 1.05, ease.io(seg(t, 4.75, 5.3)), 'bigP');
        if (t > 5.3) cross(205, 485, 230, ease.out(seg(t, 5.3, 5.75)), '#d42a1a', 'xP');
        if (t > 5.8) qmark(330, 380, 1.15, ease.io(seg(t, 5.8, 6.35)), 'bigQ');
      }
    },
    post(t, tq, O) {
      if (t < 1.9) {
        const k = seg(t, 0.12, 0.4);
        if (t > 0.12) { O.glow(244, 520, 280, WARM, 0.6 * k); O.flash('#fff2c8', 0.55 * (1 - seg(t, 0.12, 0.45))); }
        sparks(tq, 0.12, 12, 51, null, 250, 590).forEach((sp) => O.glow(sp.x, sp.y, 16, '#ffb040', 0.9 * sp.fade));
        const p = pop(t, 0.18, 0.3);
        O.text('ЛАП!', 300, 250, { font: 'rub', size: 124, color: '#ff6a10', outline: INK, outlineW: 7, scale: p.s, alpha: p.a, rot: -0.12 + Math.sin(t * 20) * 0.02 * (1 - seg(t, 0.2, 0.8)) });
      } else if (t < 4.7) {
        O.glow(270, 300, 400, '#ffe2a0', 0.25);
        const th = t < 2.55 ? 0.17 : spring(t, 2.55, 0.17, -0.2, 10, 3.0);
        const lx = 270 - Math.cos(th) * 190, ly = 360 - Math.sin(th) * 190 + 170;
        const rx = 270 + Math.cos(th) * 190, ry = 360 + Math.sin(th) * 190 + 170;
        const drop = ease.in(seg(t, 2.1, 2.5));
        O.glow(lx, lerp(-60, ly - 2, drop) - 30, 110, '#fff6a0', 0.8);
        for (let i = 0; i < 4; i++) O.glow(rx - 30 + i * 20, ry - 30 - (i % 2) * 20, 10, '#ffffff', 0.5 + 0.5 * Math.sin(t * 6 + i * 2));
      }
    },
  },
  // 6 ──────────────────────────────────────────────────────────────
  {
    name: '6 · Уокер, 1826', dur: 11.0,
    cam: (t) => {
      if (t < 3.6) return { x: 270, y: 480, z: lerp(1.0, 1.08, seg(t, 0, 3.6)) };
      if (t < 5.6) return { x: 300, y: 480, z: lerp(1.0, 1.15, seg(t, 3.6, 5.6)) };
      if (t < 8.0) { const sh = t > 7.25 && t < 7.6 ? (1 - seg(t, 7.25, 7.6)) * 7 : 0; return { sx: Math.sin(t * 90) * sh, sy: Math.cos(t * 70) * sh }; }
      return { x: 270, y: 480, z: lerp(1.0, 1.06, seg(t, 8, 11)) };
    },
    draw(t) {
      if (t < 3.6) {
        box(-20, -20, 580, 700, { wash: '#2f5a4a', id: 'phw' });
        for (let i = 0; i < 9; i++) path([[i * 66, -10], [i * 66, 680]], 'HB', '#244a3a', 1.6, { id: 'phl' + i });
        shelf(190, 'shelf1', '#6a3a1e'); shelf(330, 'shelf2', '#6a3a1e');
        const cols = ['#2f8a5e', '#ffb81a', '#c8323a', '#2c5aa0', '#8a4ab0', '#1f8f88'];
        cols.forEach((c, i) => jar(50 + i * 88, 190, 46 + (i % 3) * 8, 64 + (i % 2) * 18, c, 'jar' + i));
        cols.slice(0, 5).forEach((c, i) => jar(80 + i * 100, 330, 40 + (i % 2) * 10, 56 + (i % 3) * 10, cols[(i + 3) % 6], 'jbr' + i));
        // hanging scale
        line(470, 360, 470, 420, 'HB', INK, 1.0, 'hs1');
        shape(ell(470, 430, 26, 7, 14), { wash: '#c9963e', line: INK, w: 1.0, id: 'hs2' });
        const w = t * TAU * 0.9;
        const stirX = 372 + Math.cos(w) * 30, stirY = 548 + Math.sin(w) * 9;
        const wk = person(230, 470, 1.02, {
          id: 'walker', t, deferArms: true, hairStyle: 'bald', hair: '#d8d0c4', sideburns: '#c9c0b4', coat: '#2a5a3a', collar: 'white', apron: true, age: true, iris: '#5a4a2a',
          pose: { tilt: 0.1 + Math.sin(w) * 0.03, turn: 0.4, look: [4 + Math.cos(w) * 2, 4.5], lean: 6 + Math.cos(w) * 3, frown: 0.3, nod: 5 },
          arms: [{ side: 'R', to: [stirX, stirY], hand: 'fist', front: true, item: (hx, hy) => {
            const bx = 372 + Math.cos(w + 0.5) * 22, by = 650 + Math.sin(w + 0.5) * 5;
            shape([[bx - 4, by], [hx - 4, hy], [hx + 4, hy], [bx + 4, by]], { wash: '#c79f68', line: '#6a4a2a', w: 1.0, curve: 0, id: 'stir' });
          } }],
        });
        table(660, '#7a4a22');
        shape(ell(372, 650, 72, 52, 20, 0, Math.PI).concat([[300, 650], [444, 650]]), { fill: '#e2dccc', op: 235, bleed: 0.03, tex: 0.35, line: INK, w: 1.4, curve: 0.4, id: 'bowl' });
        path([[310, 664], [330, 690]], 'HB', '#ffffff', 1.8, { id: 'bowlh' });
        shape(ell(372, 650, 72, 14, 20), { fill: '#8a5a32', op: 240, bleed: 0.02, tex: 0.4, line: INK, w: 1.1, id: 'mix', boil: false });
        path(ell(372, 650, 40 + Math.sin(t * 3) * 4, 7, 14, w, w + 4), 'HB', '#c09060', 1.2, { id: 'swirl', curve: 0.6 });
        wk.drawArms();
        candle(70, 660, t, 'c6');
      } else if (t < 5.6) {
        box(-20, -20, 580, 1000, { wash: '#4a7a62', id: 'bgB' });
        shelf(250, 'bsB', '#8a5a3a'); shelf(560, 'bsB2', '#8a5a3a');
        ['#ffd86a', '#ff8a7a', '#8ac8ff', '#c8a0ff', '#8affc0'].forEach((c, i) => { jar(60 + i * 110, 250, 56, 80, c, 'jB' + i); jar(40 + i * 120, 560, 60, 90, ['#8ac8ff', '#ffd86a', '#8affc0', '#ff8a7a', '#c8a0ff'][i], 'jC' + i); });
        const k = seg(t, 3.9, 5.3);
        shape([[40, 900], [330, 430], [346, 440], [56, 910]], { fill: '#c79f68', op: 240, bleed: 0.02, tex: 0.4, line: '#6a4a2a', w: 1.3, curve: 0, id: 'bigstick' });
        path([[60, 880], [334, 446]], 'HB', '#f2d7a8', 1.4, { id: 'bsh' });
        const col = mixHex('#5a3018', '#c8a070', k);
        shape(jitter(ell(344, 420, 42 - 6 * k, 34 - 4 * k, 18), 7 * k, 'drop'), { fill: col, op: 248, bleed: 0.03, tex: 0.2 + 0.7 * k, border: 0.6, line: INK, w: 1.3, curve: 0.55, id: 'drop', boil: false });
        if (k < 0.6) {
          const dl = 40 * (1 - k) + Math.sin(t * 8) * 3;
          shape([[328, 448], [360, 448], [346, 474 + dl]], { fill: col, op: 245, line: INK, w: 1.0, curve: 0.6, id: 'drip', boil: false });
          path([[322, 402], [338, 392]], 'HB', '#ffffff', 3 * (1 - k / 0.6), { id: 'hlw' });
        }
        if (k > 0.45) for (let i = 0; i < 7; i++) line(316 + i * 8, 400 + (i % 2) * 10, 322 + i * 8, 434 - (i % 2) * 8, 'HB', '#6b4a28', 0.8, 'cr' + i);
        for (let i = 0; i < 4; i++) {
          const y0 = 350 - ((t * 40 + i * 25) % 80);
          path([[290 + i * 26, y0 + 30], [296 + i * 26, y0 + 15], [290 + i * 26, y0]], 'HB', '#a08a70', 1.1, { id: 'dry' + i, curve: 0.8 });
        }
      } else if (t < 8.0) {
        stoneWall(40, 560, 'hw');
        box(110, 110, 320, 280, { wash: '#1e1410', line: INK, w: 1.6, id: 'hearthHole' });
        shape([[90, 110], [450, 110], [470, 80], [70, 80]], { wash: '#6a5a4a', line: INK, w: 1.3, curve: 0, id: 'mantel' });
        for (let i = 0; i < 3; i++) shape(xf(rectP(-60, -10, 120, 20), { x: 230 + i * 50, y: 370 - i * 8, r: (i - 1) * 0.3 }), { wash: '#5a3418', line: INK, w: 1.0, curve: 0.2, id: 'log' + i });
        flame(220, 360, 38, t, { id: 'hf1' }); flame(290, 366, 32, t + 0.5, { id: 'hf2', salt: 3 }); flame(340, 362, 24, t + 0.9, { id: 'hf3', salt: 5 });
        box(-20, 560, 580, 140, { fill: '#9a9088', op: 235, bleed: 0.03, tex: 0.65, border: 0.4, line: INK, w: 1.6, id: 'hstone' });
        box(-20, 700, 580, 300, { wash: '#5a4232', id: 'floor' });
        for (let i = 0; i < 5; i++) path([[-10, 730 + i * 50], [560, 732 + i * 50]], 'HB', '#3a2a1e', 1.0, { id: 'fl' + i });
        const r = t > 5.9 && t < 7.25 ? 0.5 - 0.5 * Math.cos((t - 5.9) * TAU * 1.6) : 0;
        const tipX = 300 + 90 * r, tipY = 568;
        const ang = Math.PI + 0.45, L = 260;
        const ex = tipX + Math.cos(ang) * L, ey = tipY + Math.sin(ang) * L;
        for (let i = 0; i < Math.floor(seg(t, 5.9, 7.25) * 6); i++) line(296 + i * 4, 576 + i * 3, 400 - i * 3, 574 + i * 3, 'HB', '#4a4038', 0.9, 'hs' + i);
        shape([[tipX, tipY - 5], [ex, ey - 5], [ex, ey + 5], [tipX, tipY + 5]], { wash: '#c79f68', line: '#6a4a2a', w: 1.0, curve: 0, id: 'hstick' });
        shape(ell(tipX + 4, tipY, 14, 10, 14), { fill: '#c8a070', op: 240, line: INK, w: 1.0, id: 'htip' });
        fist(ex, ey, ang, 0.95, { id: 'whh', sleeve: '#2a5a3a' });
        if (t >= 7.25) { flame(tipX + 4, tipY - 8, 50 * ease.elastic(seg(t, 7.25, 7.8)), t, { id: 'wf' }); sparks(t, 7.25, 10, 61, null, tipX, tipY - 10).forEach((sp, j) => sparkLine(sp, 'ws' + j)); }
      } else {
        box(-20, -20, 580, 1000, { wash: '#2f5a4a', id: 'phw2' });
        shelf(150, 'sh3', '#6a3a1e');
        ['#2f8a5e', '#ffb81a', '#c8323a', '#2c5aa0', '#8a4ab0'].forEach((c, i) => jar(40 + i * 110, 150, 50, 70, c, 'jd' + i));
        const lt = t - 8.0;
        const shock = ease.out(seg(lt, 0.15, 0.35));
        const settle = smooth(lt, 1.2, 2.2);
        person(250, 540, 1.55, {
          id: 'walker2', t, hairStyle: 'bald', hair: '#d8d0c4', sideburns: '#c9c0b4', coat: '#2a5a3a', collar: 'white', apron: true, age: true, iris: '#5a4a2a',
          pose: { eyes: shock > 0.3 ? 'wide' : 'open', brow: shock * (1 - 0.3 * settle), mouth: shock * (0.75 - 0.3 * settle), nod: -10 * shock + 4 * settle, lean: -8 * shock, tilt: -0.06 * shock + 0.05 * settle, turn: 0.25, look: [5, -2 + 2 * settle] },
          arms: [{ side: 'R', to: [436, 790 - 20 * shock], hand: 'fist', front: true, item: () => {
            shape([[430, 640 - 20 * shock], [438, 640 - 20 * shock], [446, 820 - 20 * shock], [430, 820 - 20 * shock]], { wash: '#c79f68', line: '#6a4a2a', w: 1.0, curve: 0, id: 'wstick' });
          } }],
        });
        flame(434, 632 - 20 * shock, 46, t, { id: 'wf2' });
        if (t > 9.0) lettersP(40, 110, 0.62, ease.io(seg(t, 9.0, 9.45)), 'P6');
        if (t > 9.45) cross(156, 186, 110, ease.out(seg(t, 9.45, 9.85)), '#d42a1a', 'x6');
      }
    },
    post(t, tq, O) {
      if (t < 3.6) {
        O.grad('#fff2d8', '#c89a6a', 0.3, 'multiply');
        O.glow(70, 575, 110, WARM, 0.55 + 0.08 * Math.sin(t * 15));
        const p = pop(t, 0.15); O.text('1826', 34, 72, { font: 'rub', size: 74, align: 'left', scale: p.s, alpha: p.a, color: '#fff3d6', outline: INK, outlineW: 8 });
        O.motes(t, 12, 60, 100, 420, 500, '#fff6d8', 2.2, 0.45, 8, 6);
      } else if (t < 5.6) {
        O.tint('#d8f0e0', 0.25, 'screen');
        O.glow(344, 420, 240, '#fff0c8', 0.45);
      } else if (t < 8.0) {
        O.grad('#ffd8a0', '#8a5a3a', 0.35, 'multiply');
        O.glow(280, 330, 240, WARM, 0.5 + 0.1 * Math.sin(t * 11));
        if (t > 7.25) { O.glow(304, 540, 220, WARM, 0.75 * seg(t, 7.25, 7.5)); O.flash('#fff0c0', 0.5 * (1 - seg(t, 7.25, 7.6))); }
        sparks(tq, 7.25, 10, 61, null, 300, 558).forEach((sp) => O.glow(sp.x, sp.y, 14, '#ffb040', 0.9 * sp.fade));
      } else {
        O.grad('#ffe0b0', '#6a4a3a', 0.35, 'multiply');
        O.glow(434, 600, 300, WARM, 0.6 + 0.1 * Math.sin(t * 13));
        O.glow(300, 520, 260, '#ffb060', 0.25);
      }
    },
  },
  // 7 ──────────────────────────────────────────────────────────────
  {
    name: '7 · Құм қағаз, Сориа 1830, монтаж', dur: 11.0,
    cam: (t) => (t < 2.8 ? { z: lerp(1.0, 1.08, seg(t, 0, 2.8)) } : t < 6.2 ? { x: 270, y: 480, z: lerp(1.0, 1.08, seg(t, 2.8, 6.2)) } : { z: 1.04 }),
    draw(t) {
      if (t < 2.8) {
        table(-20, '#a8743e', 'tb7');
        shape(xf(rectP(-200, -80, 400, 160), { x: 265, y: 640, r: 0.03 }), { fill: '#d9a85a', op: 240, bleed: 0.02, tex: 0.95, border: 0.6, line: INK, w: 1.4, curve: 0, id: 'sand' });
        for (let i = 0; i < 70; i++) circ(80 + rnd(i, 1) * 370, 570 + rnd(i, 2) * 140, 1.4 + rnd(i, 3) * 1.8, { wash: i % 3 ? '#7a5a22' : '#f4dca0', id: 'gr' + i, boil: false });
        strike(t, 420, 600, 130, 640, 0.5, 1.5, true, { id: 'sA', ang: -0.5, fsize: 30, sleeve: '#2c5aa0' });
        if (t > 1.5) smoke(130, 560, t, 1.6, 2, 'sm7');
      } else if (t < 6.2) {
        box(-20, -20, 580, 720, { wash: '#3a4a7a', id: 'sbg' });
        windowBox(360, 80, 140, 180, true, 'swin', '#a8d8f0');
        shelf(330, 'ssh', '#5a3a22');
        for (let i = 0; i < 4; i++) bottle(330 + i * 55, 330, 34, 70, ['#2f8a5e', '#c8323a', '#ffb81a', '#8a4ab0'][i], 'sb' + i);
        const cy = lerp(500, 690, ease.io(seg(t, 3.8, 4.7)));
        const seeGlow = smooth(t, 3.2, 3.6);
        const so = person(160, 420, 0.98, {
          id: 'soria', t, deferArms: true, hairStyle: 'wavy', hair: '#2a160c', coat: '#1f3f8a', collar: 'cravat', tie: '#c8323a', skin: '#f5c8a4', iris: '#3a2a1a',
          pose: { tilt: 0.08 + 0.05 * seeGlow, turn: 0.45, look: [4, lerp(1, 5, ease.io(seg(t, 3.8, 4.7)))], eyes: seeGlow > 0.5 && t < 4.8 ? 'wide' : 'open', brow: 0.6 * seeGlow, nod: 4 },
          arms: [{ side: 'R', to: [360, cy - 150], hand: 'fist', front: true, item: (hx, hy) => {
            path([[372, cy - 10], [hx - 6, hy + 6]], 'pen', '#3a3d44', 2.4, { id: 'tg1' });
            path([[388, cy - 10], [hx + 6, hy + 6]], 'pen', '#3a3d44', 2.4, { id: 'tg2' });
          } }],
        });
        table(700, '#8a5a32');
        shape(ell(380, 700, 92, 58, 20, 0, Math.PI).concat([[288, 700], [472, 700]]), { fill: '#e2dccc', op: 235, bleed: 0.03, tex: 0.35, line: INK, w: 1.4, curve: 0.4, id: 'bowl7' });
        shape(ell(380, 700, 92, 17, 20), { fill: '#a07040', op: 240, bleed: 0.02, tex: 0.4, line: INK, w: 1.1, id: 'mix7', boil: false });
        if (t < 4.75) shape(jitter(ell(380, cy, 20, 14, 9), 8, 'wp'), { fill: '#fbf8e2', op: 245, bleed: 0.04, tex: 0.3, line: INK, w: 1.1, curve: 0.2, id: 'wp' });
        so.drawArms();
        if (t > 4.7 && t < 5.5) for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 6); const r0 = 20 + 70 * seg(t, 4.7, 5.3); line(380 + Math.cos(a) * r0, 690 + Math.sin(a) * r0 * 0.6, 380 + Math.cos(a) * (r0 + 18), 690 + Math.sin(a) * (r0 + 18) * 0.6, 'HB', '#d8ffd0', 1.4, 'spl' + i); }
      } else {
        const sh = Math.floor((t - 6.2) / 1.6), lt = (t - 6.2) - sh * 1.6;
        if (sh === 0) { boot(); strike(lt, 500, 662, 150, 664, 0.1, 0.6, true, { id: 'sb', ang: -0.6, fsize: 32, sleeve: '#2f7a4a' }); }
        else if (sh === 1) { bricks(); strike(lt, 460, 560, 120, 566, 0.1, 0.6, true, { id: 'sw', ang: -0.55, fsize: 32, sleeve: '#2f7a4a' }); }
        else {
          planks(380, '#c08a50', 'pl7');
          box(-20, -20, 580, 400, { wash: '#4a6a8a', id: 'wl7' });
          shape(ell(420, 330, 50, 14, 16), { fill: '#e8e2d8', op: 230, line: INK, w: 1.2, id: 'cup' });
          box(370, 250, 100, 80, { fill: '#e8e2d8', op: 230, line: INK, w: 1.2, id: 'cupb' });
          path(ell(478, 290, 18, 22, 12, -1.4, 1.4), 'pen', INK, 2, { id: 'cuph' });
          strike(lt, 460, 560, 120, 570, 0.1, 0.6, true, { id: 'st', ang: -0.55, fsize: 32, sleeve: '#2f7a4a' });
        }
      }
    },
    post(t, tq, O) {
      if (t < 2.8) { if (t > 1.5) O.glow(150, 600, 200, WARM, 0.6 * seg(t, 1.5, 1.7)); }
      else if (t < 6.2) {
        O.glow(430, 170, 240, '#e8f6ff', 0.3);
        const p = pop(t, 2.95); O.text('1830', 506, 80, { font: 'rub', size: 74, align: 'right', scale: p.s, alpha: p.a, color: '#fff3d6', outline: INK, outlineW: 8 });
        const cy = lerp(500, 690, ease.io(seg(t, 3.8, 4.7)));
        if (t < 4.75) { O.glow(380, cy, 110, '#eaffd0', 0.85); O.glow(380, cy, 40, '#ffffff', 0.7); }
        else { O.glow(380, 690, 150, '#d8ffc0', 0.6 * (1 - seg(t, 5.0, 6.2)) + 0.25); O.flash('#f0ffe0', 0.3 * (1 - seg(t, 4.75, 5.1))); }
        O.motes(t, 10, 300, 500, 160, 200, '#eaffd0', 2, 0.6, 20, 9);
      } else {
        const sh = Math.floor((t - 6.2) / 1.6), lt = (t - 6.2) - sh * 1.6;
        if (lt > 0.6) { O.glow(160, 560, 200, WARM, 0.65 * seg(lt, 0.6, 0.75)); O.flash('#fff0c0', 0.4 * (1 - seg(lt, 0.6, 0.9))); }
      }
    },
    fadeIn: 0.12,
  },
  // 8 ──────────────────────────────────────────────────────────────
  {
    name: '8 · Улы бу, рентген', dur: 7.4,
    bg: (t) => (t < 3.7 ? PAPER : '#0e1a30'),
    cam: (t) => (t < 3.7 ? { x: 270, y: 480, z: lerp(1.0, 1.07, seg(t, 0, 3.7)) } : { x: 270, y: 500, z: lerp(1.0, 1.12, seg(t, 3.7, 7.4)) }),
    draw(t) {
      if (t < 3.7) {
        box(-20, -20, 580, 720, { wash: '#6a5a4a', id: 'wk' });
        windowBox(40, 40, 120, 160, true, 'wkw', '#f2e8c0');
        // drying racks with matches in the background
        for (let r = 0; r < 2; r++) {
          box(200, 60 + r * 120, 320, 10, { wash: '#4a3020', line: INK, w: 1.0, id: 'rk' + r });
          for (let i = 0; i < 14; i++) { line(212 + i * 22, 70 + r * 120, 212 + i * 22, 130 + r * 120, 'HB', '#d9b878', 1.6, 'rm' + r + i); circ(212 + i * 22, 132 + r * 120, 3.5, { wash: '#f4f0e0', id: 'rh' + r + i }); }
        }
        const dipA = (tt) => Math.max(smooth(tt, 0.6, 1.2) * (1 - smooth(tt, 1.6, 2.2)), smooth(tt, 2.6, 3.0) * (1 - smooth(tt, 3.2, 3.6)));
        const d = dipA(t), d2 = dipA(t - 0.5);
        const by = lerp(560, 640, d);
        // second worker (behind)
        const p2 = person(430, 470, 0.74, {
          id: 'w2', t, deferArms: true, female: true, hairStyle: 'scarf', scarf: '#2f6a9a', hair: '#3a2210', coat: '#7a3a4a', iris: '#4a3020',
          pose: { worry: 0.6, tilt: 0.12 + 0.05 * d2, nod: 6 + 6 * d2, look: [-2, 5], turn: -0.3 },
          arms: [{ side: 'L', to: [380, lerp(600, 660, d2)], hand: 'fist', front: true, bend: -1 }],
        });
        const cough = Math.sin(Math.PI * seg(t, 2.2, 2.6));
        const p1 = person(200, 430, 0.92, {
          id: 'w1', t, deferArms: true, female: true, hairStyle: 'scarf', scarf: '#c8582a', hair: '#4a2a10', coat: '#4a5a2a', collar: 'white', iris: '#5a3a1a',
          pose: { worry: 0.8, tilt: 0.1 + 0.06 * d - 0.08 * cough, nod: 6 + 8 * d - 8 * cough, look: [2, 5 - 4 * cough], eyes: cough > 0.3 ? 'squint' : 'open', mouth: 0.3 * cough, turn: 0.2 },
          arms: [{ side: 'L', to: [128, by - 2], hand: 'fist', front: true, bend: -1 }, { side: 'R', to: [412, by - 2], hand: 'fist', front: true }],
        });
        table(690, '#7a4a22');
        box(90, 700, 360, 70, { wash: '#5a3a22', line: INK, w: 1.4, id: 'tray' });
        box(102, 708, 336, 40, { fill: '#fbfaf2', op: 245, bleed: 0.02, tex: 0.35, border: 0.25, id: 'paste' });
        for (let i = 0; i < 5; i++) path([[120 + i * 64, 724], [150 + i * 64, 720]], 'HB', '#c8c8b8', 1.0, { id: 'pst' + i });
        box(120, by - 10, 300, 14, { wash: '#c9963e', line: INK, w: 1.2, id: 'frame' });
        const dipped = t > 1.0;
        for (let i = 0; i < 9; i++) match(140 + i * 32, by + 70, -Math.PI / 2, 66, { id: 'dm' + i, head: dipped ? '#f6f4ea' : '#d9b87a', headScale: 0.85 });
        p2.drawArms(); p1.drawArms();
        for (let j = 0; j < 5; j++) {
          const ph = (t * 0.5 + j * 0.2) % 1; const pts = [];
          for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([lerp(150 + j * 60, 208, u * u) + Math.sin(u * 7 + t * 3 + j) * 16 * (1 - u), lerp(700, 476, u)]); }
          path(partial(pts, 0.25 + 0.75 * ph), 'charcoal', '#e8f0f6', 1.5, { id: 'vap' + j, curve: 0.7 });
        }
      } else {
        xray(t, 3.7);
      }
    },
    post(t, tq, O) {
      if (t < 3.7) {
        O.grad('#fff2d8', '#a88a6a', 0.3, 'multiply');
        O.glow(100, 120, 220, '#fff4d0', 0.4);
        O.glow(220, 600, 220, '#e8f4ff', 0.28);
        O.motes(t, 18, 120, 420, 300, 300, '#f4fbff', 3, 0.55, 20, 11);
      } else {
        O.glow(280, 560, 300, '#5fb0ff', 0.3);
        O.glow(280, 560, 120, '#bfe4ff', 0.15);
        O.vignette(0.6, '3,8,20');
        for (let i = 0; i < 6; i++) O.glowS(540, ((t * 300 + i * 320) % 1920), 60, '#5fb0ff', 0.05);
      }
    },
  },
  // 9 ──────────────────────────────────────────────────────────────
  {
    name: '9 · «Фосфорлы жақ»', dur: 6.2,
    bg: (t) => (t < 2.6 ? '#0e1a30' : PAPER),
    cam: (t) => {
      if (t < 2.6) { const sh = t > 0.28 && t < 0.6 ? (1 - seg(t, 0.28, 0.6)) * 10 : 0; return { y: 500, z: 1.12, sx: Math.sin(t * 95) * sh, sy: Math.cos(t * 83) * sh }; }
      return { x: 268, y: lerp(640, 620, seg(t, 2.6, 6.2)), z: lerp(1.75, 1.9, seg(t, 2.6, 6.2)) };
    },
    draw(t) {
      if (t < 2.6) xray(10, 0);
      else { factoryBG(t); const g = girlPose(t + 3, 0); girl(t, 270, 640, 1.3, 0.8 + 0.2 * pulse(t), g); }
    },
    post(t, tq, O) {
      if (t < 2.6) {
        O.glow(280, 560, 300, '#5fb0ff', 0.25); O.vignette(0.65, '3,8,20');
        const k = seg(t, 0.12, 0.3);
        if (t > 0.12) O.stamp('ФОСФОРЛЫ\nЖАҚ', 270, 470, { size: 70, rot: -0.12, scale: lerp(2.2, 1, ease.in(k)), alpha: k * 1.2, color: '#e4302a' });
      } else {
        nightPost(O, t); girlGlowPost(O, t, 1.25);
        questionMark(O, t, 2.75, ease.io(seg(t, 3.6, 4.4)));
      }
    },
    fadeIn: 0.1,
    fadeColor: '#fff',
  },
  // 10 ─────────────────────────────────────────────────────────────
  {
    name: '10 · Қызыл фосфор, Швеция', dur: 8.2,
    cam: (t) => (t < 4.2 ? { x: 270, y: 480, z: lerp(1.0, 1.08, seg(t, 0, 4.2)) } : { x: 270, y: 480, z: lerp(1.04, 1.0, seg(t, 4.2, 8.2)) }),
    draw(t) {
      if (t < 4.2) {
        box(-20, -20, 580, 1000, { wash: '#f0dcb0', id: 'bg10' });
        box(-20, 560, 580, 420, { wash: '#2f6a8a', id: 'cloth' });
        for (let i = 0; i < 8; i++) path([[i * 72, 560], [i * 72 - 40, 980]], 'HB', '#1f4a62', 1.2, { id: 'clf' + i });
        shape(ell(270, 540, 196, 62, 26), { fill: '#f4f0e8', op: 240, bleed: 0.02, tex: 0.2, line: INK, w: 1.5, id: 'saucer' });
        shape(ell(270, 538, 146, 42, 26), { line: '#a0988a', w: 1.1, id: 'saucer2' });
        const heap = [[110, 545], [150, 490], [205, 438], [262, 414], [322, 432], [380, 482], [430, 545], [380, 568], [270, 576], [160, 568]];
        shape(heap, { fill: '#c42a1e', op: 248, bleed: 0.05, tex: 0.9, border: 0.6, scatter: true, curve: 0.55, id: 'heap', boil: false });
        shape([[150, 520], [200, 456], [250, 430], [240, 500], [190, 540]], { fill: '#ff6a4a', op: 120, bleed: 0.1, tex: 0.5, curve: 0.6, id: 'heaphi', boil: false });
        for (let i = 0; i < 60; i++) { const a = rnd(i, 11), b = rnd(i, 12); const x = 140 + a * 270, yTop = 545 - (1 - Math.pow((x - 270) / 140, 2)) * 120; circ(x, lerp(yTop + 10, 560, b), 1.4 + rnd(i, 13) * 2.2, { wash: i % 3 ? '#7a1208' : '#ff7a5a', id: 'rg' + i, boil: false }); }
        // spoon
        shape(xf([[0, -6], [150, -4], [150, 4], [0, 6]], { x: 380, y: 470, r: -0.5 }), { wash: '#b8bcc4', line: INK, w: 1.1, curve: 0, id: 'spn' });
        if (t > 1.0) check(70, 718, 46, ease.out(seg(t, 1.0, 1.35)), '#1f9a3e', 'c1');
        if (t > 2.1) check(70, 808, 46, ease.out(seg(t, 2.1, 2.45)), '#1f9a3e', 'c2');
      } else {
        box(-20, -20, 580, 720, { wash: '#c98a4a', id: 'swall' });
        for (let i = 0; i < 9; i++) path([[i * 66, -10], [i * 66 + 4, 700]], 'HB', '#8a5a2a', 1.4, { id: 'swl' + i });
        box(40, 84, 76, 50, { wash: '#1f5ab5', line: INK, w: 1.1, id: 'flag' });
        box(62, 84, 12, 50, { wash: '#ffcc1a', id: 'fl1' }); box(40, 103, 76, 12, { wash: '#ffcc1a', id: 'fl2' });
        line(38, 80, 38, 240, 'pen', '#4a3020', 2.4, 'pole');
        shelf(250, 'ssh10', '#5a3a1e');
        for (let i = 0; i < 6; i++) { box(260 + (i % 3) * 82, 250 - 26 - Math.floor(i / 3) * 26, 76, 24, { wash: i % 2 ? '#ffcc1a' : '#1f5ab5', line: INK, w: 0.9, id: 'stk' + i }); }
        const k = ease.io(seg(t, 5.0, 7.6));
        const bx = 156 + 228 * k;
        const nodB = Math.sin(t * 2.2) * 2;
        const b1 = person(110, 430, 0.76, {
          id: 'bro1', t, deferArms: true, hairStyle: 'short', hair: '#9a6a2a', mustache: '#8a5a22', coat: '#1f3a6a', collar: 'white', skin: '#f6c8a4', iris: '#3a6a9a',
          pose: { turn: 0.5, tilt: 0.12, look: [5, 5], frown: 0.4, nod: 5 },
          arms: [{ side: 'R', to: [bx + 64, 694 + Math.sin(t * 9) * 3 * (k > 0 && k < 1 ? 1 : 0)], hand: 'fist', front: true, item: (hx, hy) => {
            path([[bx + 4, 786], [hx + 8, hy + 8]], 'pen', '#6a3a1a', 3.6, { id: 'pbr' });
            shape([[bx - 4, 790], [bx + 12, 770], [bx + 20, 780], [bx + 6, 798]], { wash: '#8a2a1a', line: INK, w: 0.9, id: 'bris' });
          } }],
        });
        const b2 = person(432, 430, 0.76, {
          id: 'bro2', t, deferArms: true, hairStyle: 'short', hair: '#5a3a22', beard: '#5a3a22', coat: '#7a2a2a', collar: 'white', skin: '#f2c09a', iris: '#3a2a1a',
          pose: { turn: -0.45, smile: 0.8, look: [-5, 4], nod: 4 + nodB, tilt: -0.08 },
          arms: [{ side: 'L', to: [392, 700], hand: 'open', front: true, bend: -1, handAng: 0.3 }],
        });
        table(700, '#9a6a3a');
        box(150, 620, 240, 150, { wash: '#f2e2b0', line: INK, w: 1.5, id: 'bx' });
        box(190, 650, 160, 90, { fill: '#1f5ab5', op: 230, bleed: 0.02, tex: 0.35, id: 'bxl' });
        circ(270, 695, 24, { wash: '#ffcc1a', line: INK, w: 0.9, id: 'bxc' });
        box(150, 770, 240, 36, { wash: '#e0c890', line: INK, w: 1.4, id: 'side' });
        if (k > 0) box(156, 778, 228 * k, 20, { fill: '#8a2a1a', op: 250, bleed: 0.02, tex: 0.9, border: 0.4, id: 'strip', boil: false });
        b1.drawArms(); b2.drawArms();
        // paint pot
        shape(ell(470, 800, 30, 10, 14), { wash: '#8a2a1a', line: INK, w: 1.0, id: 'pot' });
        box(440, 800, 60, 46, { wash: '#6a6a72', line: INK, w: 1.2, id: 'potb' });
      }
    },
    post(t, tq, O) {
      if (t < 4.2) {
        O.glow(270, 300, 400, '#fff2c8', 0.2);
        const p0 = pop(t, 0.2); O.text('Қызыл фосфор', 270, 300, { size: 68, scale: p0.s, alpha: p0.a, color: '#b01a10', outline: '#fff3d6', outlineW: 6 });
        const p1 = pop(t, 1.0); O.text('Улы емес', 112, 716, { size: 52, align: 'left', scale: p1.s, alpha: p1.a, color: '#fff8e8', outline: '#1f4a62', outlineW: 6 });
        const p2 = pop(t, 2.1); O.text('Өздігінен тұтанбайды', 112, 806, { size: 50, align: 'left', scale: p2.s, alpha: p2.a, color: '#fff8e8', outline: '#1f4a62', outlineW: 6 });
      } else {
        O.grad('#fff0d0', '#c08a5a', 0.25, 'multiply');
        const p = pop(t, 4.35); O.text('ШВЕЦИЯ', 132, 112, { font: 'rub', size: 62, align: 'left', scale: p.s, alpha: p.a, color: '#ffcc1a', outline: '#1f3a8a', outlineW: 9 });
      }
    },
  },
  // 11 ─────────────────────────────────────────────────────────────
  {
    name: '11 · Қауіпсіз сіріңке', dur: 5.6,
    cam: (t) => (t < 2.2 ? { z: lerp(1.0, 1.05, seg(t, 0, 2.2)) } : { z: lerp(1.05, 1.0, seg(t, 2.2, 5.6)) }),
    draw(t) {
      if (t < 2.2) {
        planks(-20, '#c08a50', 'pl11');
        shape(ell(400, 300, 60, 18, 16), { fill: '#e8e2d8', op: 230, line: INK, w: 1.2, id: 'cup11' });
        strike(t, 450, 600, 130, 606, 0.3, 1.0, false, { id: 's11a', ang: -0.55, lift: 30, sleeve: '#2c5aa0' });
        if (t > 1.0) path([[130, 612], [450, 606]], 'HB', '#7a5a3a', 1.2, { id: 'scr11' });
        if (t > 1.25) cross(270, 360, 130, ease.out(seg(t, 1.25, 1.7)), '#e0261a', 'x11');
      } else {
        table(330, '#c08a50', 't11');
        box(70, 470, 400, 200, { wash: '#f6e6b8', line: INK, w: 1.6, id: 'bx11' });
        box(120, 500, 300, 140, { fill: '#e0402a', op: 235, bleed: 0.02, tex: 0.35, id: 'bx11l' });
        circ(270, 570, 40, { wash: '#fff2c8', line: INK, w: 1.0, id: 'bx11c' });
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(270 + Math.cos(a) * 46, 570 + Math.sin(a) * 46, 270 + Math.cos(a) * 60, 570 + Math.sin(a) * 60, 'HB', '#fff2c8', 2, 'ray' + i); }
        box(70, 670, 400, 48, { fill: '#8a2a1a', op: 250, bleed: 0.02, tex: 0.9, border: 0.4, line: INK, w: 1.4, id: 'strip11', boil: false });
        strike(t, 440, 690, 110, 694, 2.45, 3.0, true, { id: 's11b', ang: -0.55, fsize: 34, sleeve: '#2c5aa0' });
        if (t > 3.3) check(440, 300, 110, ease.out(seg(t, 3.3, 3.7)), '#1f9a3e', 'c11');
        if (t > 3.0) smoke(110, 610, t, 3.1, 2, 'sm11');
      }
    },
    post(t, tq, O) {
      if (t >= 3.0) { O.glow(120, 620, 220, WARM, 0.65 * seg(t, 3.0, 3.2)); O.flash('#fff0c0', 0.4 * (1 - seg(t, 3.0, 3.35))); }
      const p = pop(t, 4.0, 0.4);
      O.text('ҚАУІПСІЗ\nСІРІҢКЕ', 270, 170, { font: 'rub', size: 72, scale: p.s, alpha: p.a, color: '#1fa84a', outline: '#fff8e8', outlineW: 12, rot: -0.04 });
    },
  },
  // 12 ─────────────────────────────────────────────────────────────
  {
    name: '12 · Бүгін → Брандтың жарығы', dur: 8.4,
    cam: (t) => ({ x: 270, y: 480, z: lerp(1.0, 1.06, seg(t, 0, 8.4)) }),
    draw(t) {
      const gk = ease.io(seg(t, 2.6, 3.5));
      const outer = mixHex('#ff6a1a', '#1fe060', gk), inner = mixHex('#ffe05a', '#d0ffe0', gk);
      const fk = ease.io(seg(t, 3.6, 5.2));
      box(-20, -20, 580, 720, { wash: '#e8e0f0', id: 'mwall' });
      // modern room: window blinds + plant
      box(330, 60, 180, 240, { wash: '#a8d0f0', line: INK, w: 1.3, id: 'mwin' });
      for (let i = 0; i < 10; i++) line(330, 70 + i * 23, 510, 70 + i * 23, 'HB', '#f2f2f2', 2.2, 'bl' + i);
      shape([[60, 520], [100, 520], [92, 600], [68, 600]], { wash: '#e05a3a', line: INK, w: 1.2, curve: 0.1, id: 'pot12' });
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35 + Math.sin(t + i) * 0.03; shape(xf(ell(0, -40, 12, 40, 12), { x: 80, y: 520, r: a + Math.PI / 2 }), { fill: '#2f9a4a', op: 230, line: INK, w: 1.0, id: 'lf' + i }); }
      if (t < 4.2) {
        table(700, '#8fb3cf', 't12');
        box(390, 770, 120, 70, { wash: '#22262e', line: INK, w: 1.3, id: 'phone' });
        box(397, 776, 106, 58, { wash: '#4a8acf', id: 'scr' });
        // mug with steam
        box(420, 640, 70, 60, { fill: '#ffcc1a', op: 240, line: INK, w: 1.3, id: 'mug' });
        path(ell(494, 670, 14, 18, 12, -1.4, 1.4), 'pen', INK, 2, { id: 'mugh' });
        smoke(445, 630, t, 0, 2, 'stm', '#c8c8d0');
        box(40, 740, 300, 80, { wash: '#fbf6ee', line: INK, w: 1.4, id: 'mbox' });
        box(46, 820, 288, 22, { fill: '#8a2a1a', op: 250, bleed: 0.02, tex: 0.9, line: INK, w: 1.1, id: 'mstrip', boil: false });
        box(110, 755, 160, 50, { wash: '#1fb3a5', id: 'mlab' });
        const lift = ease.io(seg(t, 1.3, 2.3));
        let hx, hy;
        if (t < 1.3) { const k = ease.io(seg(t, 0.35, 1.1)); hx = lerp(320, 70, k); hy = 832; }
        else { hx = lerp(70, 270, lift); hy = lerp(832, 520, lift); }
        const ang = lerp(-0.45, Math.PI / 2 - 0.2, ease.io(seg(t, 1.3, 2.3)));
        const L = 200; const fx = hx + Math.cos(ang) * L, fy = hy + Math.sin(ang) * L;
        match(hx, hy, ang, L, { id: 'm12' });
        fist(fx, fy, ang, 0.95, { id: 'h12', sleeve: '#1fa0b0', skin: '#e2a47e' });
        if (t > 1.1) flame(hx - 2, hy - 6, (34 + 10 * gk) * ease.elastic(seg(t, 1.1, 1.7)) * (1 - fk), t, { id: 'f12', outer, inner });
      }
      if (t > 3.6) flask(270, lerp(520, 480, fk), lerp(0.06, 1.05, fk), { id: 'fk12', t });
    },
    post(t, tq, O) {
      const gk = ease.io(seg(t, 2.6, 3.5));
      const fk = ease.io(seg(t, 3.6, 5.2));
      O.grad('#2a3a9a', '#4a3a8a', 0.9 * ease.io(seg(t, 3.0, 4.4)), 'multiply');
      if (t > 1.1) {
        const col = mixHex('#ffa030', '#3dff7a', gk);
        const y = t < 4.2 ? lerp(470, 480, fk) : 480;
        O.glow(270, y, lerp(180, 320, fk), col, 0.62 + 0.15 * pulse(t, 0.9));
        if (fk > 0) O.glow(270, 500, 120, '#d8ffe4', 0.5 * fk);
      }
      if (fk > 0) O.motes(t, 22, 40, 150, 460, 700, '#b8ffcf', 2.6, 0.7 * fk, 14, 12);
      const p1 = pop(t, 5.4, 0.4);
      O.text('Пікір қалдырыңыз!', 270, 130, { font: 'rub', size: 44, scale: p1.s, alpha: p1.a, color: '#fff3d6', outline: '#1d2440', outlineW: 8 });
    },
  },
];

// screen position of the factory sign (it lives in world space)
function signPos(O) { const [sx, sy] = O.toS(69, 315); return [sx / 2, sy / 2]; }
