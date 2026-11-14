// 12 scenes of the script "Сіріңке тарихы". Each scene: dur (s), draw(t) — brush layer (world coords 540x960),
// post(t, tq, O) — overlays (glow, text), cam(t) — camera, bg(t) — paper colour.
/* global B, W, H, INK, PAPER, TAU, clamp, lerp, seg, ease, rnd, mixHex, xf, ell, jitter, partial,
   shape, path, line, circ, box, rectP, check, cross, flame, match, matchbox, fist, person, flask, pop */

const NIGHT = '#56649c';
const GREEN = '#5dff8f';
const WARM = '#ffb347';

// ---------- shared pieces ----------
function factoryBG() {
  // left building + chimney
  box(-20, 300, 175, 520, { wash: '#8f8b96', line: INK, w: 1.2, id: 'fb1' });
  box(56, 120, 38, 190, { wash: '#7d7984', line: INK, w: 1.2, id: 'ch1' });
  box(48, 112, 54, 16, { wash: '#6f6b76', line: INK, w: 1.0, id: 'ch1t' });
  // right saw-tooth factory
  shape([[320, 820], [320, 430], [370, 370], [370, 430], [420, 370], [420, 430], [470, 370], [470, 430], [560, 370], [560, 820]], { wash: '#9b97a3', line: INK, w: 1.2, curve: 0, id: 'fb2' });
  box(430, 220, 32, 160, { wash: '#7d7984', line: INK, w: 1.2, id: 'ch2' });
  // windows
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
    const lit = (r + c) % 3 !== 1;
    box(18 + c * 66, 340 + r * 92, 38, 52, { wash: lit ? '#f3d37a' : '#5d5a66', line: INK, w: 0.9, id: `w${r}${c}` });
  }
  for (let c = 0; c < 3; c++) box(338 + c * 66, 470, 40, 54, { wash: '#f3d37a', line: INK, w: 0.9, id: `wr${c}` });
  // smoke
  for (let k = 0; k < 2; k++) {
    const pts = []; const x0 = k ? 446 : 75, y0 = k ? 215 : 110;
    for (let i = 0; i < 9; i++) pts.push([x0 + i * 9 + Math.sin(i * 0.9 + K.t * 1.5 + k) * 10, y0 - i * 13]);
    path(pts, 'charcoal', '#b9b5c0', 1.6, { id: 'smk' + k, curve: 0.8 });
  }
  // moon
  circ(452, 120, 30, { wash: '#f7f0d2', id: 'moon' });
  // ground
  box(-20, 800, 580, 200, { wash: '#6e6a70', id: 'grnd' });
}
function girl(x, y, s, glow) {
  person(x, y, s, { id: 'girl', hairStyle: 'bun', hair: '#6a4630', coat: '#5a4a52', collar: 'shawl', shawl: '#7b5d4c', expr: 'worry', jawGlow: glow, skin: '#eac3a0' });
}
const pulse = (t, f = 1.1) => 0.5 + 0.5 * Math.sin(t * TAU * f);
function girlGlowPost(O, t, k = 1) {
  const p = pulse(t);
  O.glow(270, 676, 95, GREEN, (0.3 + 0.3 * p) * k);
  O.glow(270, 682, 42, '#b8ffd0', (0.25 + 0.3 * p) * k);
}
function nightPost(O, t) {
  O.tint(NIGHT, 1);
  O.glow(452, 120, 110, '#fff4c8', 0.45);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) if ((r + c) % 3 !== 1) O.glow(37 + c * 66, 366 + r * 92, 34, '#ffd27a', 0.5);
  for (let c = 0; c < 3; c++) O.glow(358 + c * 66, 497, 34, '#ffd27a', 0.5);
}
function questionMark(O, t, t0, green = 0) {
  const p = pop(t, t0, 0.4); if (!p.a) return;
  const col = mixHex('#f2e8d2', '#7dffa6', green);
  O.text('?', 440, 230, { size: 230, color: col, scale: p.s, alpha: p.a, rot: 0.12 + Math.sin(t * 2) * 0.03, outline: '#1d2440', outlineW: 6, glow: green > 0 ? '#4dff88' : null, glowSize: 40 * green });
}
function table(y, col = '#c39b6c', id = 'tbl') {
  box(-20, y, 580, 1000 - y, { wash: col, line: INK, w: 1.4, id });
  for (let i = 0; i < 5; i++) path([[-10, y + 30 + i * 46], [180, y + 34 + i * 46 + (i % 2) * 6], [560, y + 26 + i * 46]], 'HB', mixHex(col, '#3b2414', 0.45), 0.8, { id: id + 'g' + i, curve: 0.6 });
}
function moss(x, y, s = 1, id = 'moss') {
  shape(ell(x, y, 120 * s, 42 * s, 22), { fill: '#7f8a4c', op: 215, bleed: 0.18, tex: 0.75, border: 0.3, line: '#4a5226', w: 1.0, curve: 0.6, id });
  for (let i = 0; i < 26; i++) {
    const a = rnd(i, 3) * TAU, rr = Math.sqrt(rnd(i, 4)) * 110 * s;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.36;
    const b = rnd(i, 5) * TAU;
    path([[px, py], [px + Math.cos(b) * 18 * s, py + Math.sin(b) * 7 * s - 4]], 'HB', i % 2 ? '#3e4a20' : '#8a6a3a', 0.9, { id: id + 'f' + i, curve: 0.3 });
  }
}
function steel(x, y, s = 1, id = 'st') { // C-shaped fire striker, open towards the hand (right)
  const c = ell(x, y, 52 * s, 18 * s, 22, 0.55, TAU - 0.55);
  path(c, 'pen', '#3e434c', 4.2, { id, curve: 0.6 });
  path(ell(x, y, 46 * s, 13 * s, 16, 0.9, TAU - 0.9), 'HB', '#9aa0a8', 1.2, { id: id + 'hl', curve: 0.6 });
}
function flint(x, y, id = 'flint') {
  const pts = jitter(ell(x, y, 34, 24, 9), 14, id);
  shape(pts, { fill: '#9a9ea4', op: 220, bleed: 0.04, tex: 0.6, line: INK, w: 1.3, curve: 0.15, id });
  path([[x - 14, y - 6], [x + 6, y - 12]], 'HB', '#ffffff', 1.4, { id: id + 'h' });
}
function sparkLine(x, y, vx, vy, id) {
  const l = Math.hypot(vx, vy) || 1;
  path([[x, y], [x - vx / l * 18, y - vy / l * 18]], 'pen', '#ff8c1a', 2.8, { id });
}
// ballistic sparks: returns list of {x,y,vx,vy,alive}
function sparks(t, t0, n, salt, target) {
  const out = []; const dt = t - t0; if (dt < 0 || dt > 0.75) return out;
  const g = 1200, x0 = 232, y0 = 470;
  for (let i = 0; i < n; i++) {
    let vx = -120 + rnd(i, salt) * 300, vy = -60 + rnd(i, salt + 1) * 380;
    const life = 0.25 + rnd(i, salt + 2) * 0.3;
    if (target && i === 0) { vx = (target[0] - x0) / 0.5; vy = (target[1] - y0 - 0.5 * g * 0.25) / 0.5; }
    const L = target && i === 0 ? 0.5 : life;
    if (dt > L) continue;
    out.push({ x: x0 + vx * dt, y: y0 + vy * dt + 0.5 * g * dt * dt, vx, vy: vy + g * dt, main: target && i === 0 });
  }
  return out;
}
function lettersP(x, y, s, prog, id = 'P', col = INK) {
  const pts = [[0, 230], [0, 0], [62, 0], [100, 28], [104, 74], [70, 112], [2, 116]].map(([a, b]) => [x + a * s, y + b * s]);
  path(partial(pts, prog), 'charcoal', col, 5.2 * s, { id, curve: 0.35 });
}
function qmark(x, y, s, prog, id = 'q', col = INK) {
  const pts = [[0, 40], [20, 6], [62, -4], [96, 20], [98, 62], [66, 92], [52, 118], [52, 158]].map(([a, b]) => [x + a * s, y + b * s]);
  path(partial(pts, clamp(prog / 0.85)), 'charcoal', col, 5.2 * s, { id, curve: 0.5 });
  if (prog > 0.9) circ(x + 52 * s, y + 205 * s, 9 * s, { wash: col, id: id + 'd' });
}
function balance(theta, vialIn, id = 'bal') {
  const px = 270, py = 360, L = 190;
  // stand
  shape(ell(px, 860, 120, 26, 20), { wash: '#8a6a3a', line: INK, w: 1.3, id: id + 'base' });
  box(px - 9, py, 18, 500, { wash: '#a8834e', line: INK, w: 1.3, id: id + 'post' });
  shape([[px - 22, py + 10], [px + 22, py + 10], [px, py - 22]], { wash: '#8a6a3a', line: INK, w: 1.2, curve: 0, id: id + 'piv' });
  const c = Math.cos(theta), s = Math.sin(theta);
  const lx = px - c * L, ly = py - s * L, rx = px + c * L, ry = py + s * L;
  shape([[lx - s * 6, ly + c * 6 - 12], [rx - s * 6, ry + c * 6 - 12], [rx + s * 6, ry - c * 6 - 12], [lx + s * 6, ly - c * 6 - 12]].map(([a, b]) => [a, b + 6]), { wash: '#a8834e', line: INK, w: 1.3, curve: 0, id: id + 'beam' });
  const pans = [[lx, ly], [rx, ry]];
  pans.forEach(([ex, ey], k) => {
    const panY = ey + 170;
    path([[ex, ey], [ex - 56, panY]], 'HB', INK, 1.0, { id: id + 'sa' + k });
    path([[ex, ey], [ex + 56, panY]], 'HB', INK, 1.0, { id: id + 'sb' + k });
    shape(ell(ex, panY + 4, 66, 16, 18, 0, Math.PI).concat([[ex - 66, panY], [ex + 66, panY]]), { wash: '#c9a057', line: INK, w: 1.3, curve: 0.4, id: id + 'pan' + k });
    if (k === 1) { // coins
      const rows = [5, 4, 3, 2, 1]; let n = 0;
      rows.forEach((cnt, r) => {
        for (let j = 0; j < cnt; j++) {
          const cx = ex + (j - (cnt - 1) / 2) * 22, cy = panY - 6 - r * 14;
          shape(ell(cx, cy, 13, 6, 12), { wash: n % 2 ? '#f0c24a' : '#e3ad2f', line: '#7a5a12', w: 0.9, id: id + 'c' + n }); n++;
        }
      });
    }
  });
  return { lx, ly: ly + 170, rx, ry: ry + 170, vialIn };
}
function vial(x, y, id = 'vial') { // bottom-centre at (x,y)
  box(x - 16, y - 76, 32, 76, { fill: '#f7f2b8', op: 150, bleed: 0.02, tex: 0.2, line: INK, w: 1.4, id });
  box(x - 18, y - 90, 36, 14, { wash: '#8a5a3a', line: INK, w: 1.1, id: id + 'cork' });
}
function jar(x, y, w, h, col, id) {
  box(x - w / 2, y - h, w, h, { fill: col, op: 150, bleed: 0.03, tex: 0.35, line: INK, w: 1.1, id });
  box(x - w / 2 - 3, y - h - 12, w + 6, 12, { wash: '#6d5a4a', line: INK, w: 1.0, id: id + 'l' });
  box(x - w / 4, y - h * 0.65, w / 2, h * 0.3, { wash: '#f4ecd8', id: id + 'lab' });
}
function stoneWall(y0, y1, id = 'sw') {
  let n = 0;
  for (let r = 0; r * 70 + y0 < y1; r++) for (let c = -1; c < 6; c++) {
    const x = c * 110 + (r % 2) * 55, y = y0 + r * 70;
    const col = ['#a9a39a', '#9c958c', '#b5aea4', '#8f8a83'][n % 4];
    shape(jitter(rectP(x + 4, y + 4, 102, 62), 6, id + n), { wash: col, line: INK, w: 1.0, curve: 0.25, id: id + n }); n++;
  }
}
function bricks(id = 'br') {
  let n = 0;
  for (let r = 0; r < 14; r++) for (let c = -1; c < 5; c++) {
    const x = c * 120 + (r % 2) * 60, y = 40 + r * 64;
    const col = ['#b5583f', '#a54d36', '#c0654a', '#9a4632'][(n * 7) % 4];
    shape(jitter(rectP(x + 4, y + 4, 112, 56), 5, id + n), { wash: col, line: '#5a2a1c', w: 0.9, curve: 0.2, id: id + n }); n++;
  }
}
function planks(y0, col = '#b98a5a', id = 'pl') {
  box(-20, y0, 580, 1000 - y0, { wash: col, id });
  for (let i = 0; i < 6; i++) path([[-10, y0 + i * 70], [560, y0 + i * 70 + 4]], 'HB', INK, 1.1, { id: id + 'l' + i });
  for (let i = 0; i < 10; i++) {
    const yy = y0 + 20 + i * 34; const pts = [];
    for (let k = 0; k < 6; k++) pts.push([-10 + k * 115, yy + Math.sin(k * 1.3 + i) * 6]);
    path(pts, 'HB', mixHex(col, '#3b2414', 0.5), 0.7, { id: id + 'g' + i, curve: 0.7 });
  }
}
function boot() {
  box(-20, 700, 580, 300, { wash: '#a58a6a', id: 'floor7' });
  const b = [[40, 90], [230, 90], [236, 400], [300, 450], [430, 490], [510, 540], [522, 640], [30, 640], [36, 360]];
  shape(b, { fill: '#5a3a26', op: 235, bleed: 0.04, tex: 0.5, border: 0.4, line: INK, w: 1.8, curve: 0.3, id: 'boot' });
  box(24, 86, 216, 30, { wash: '#4a2e1e', line: INK, w: 1.4, id: 'btop' });
  path([[236, 400], [300, 450], [380, 470]], 'HB', '#2e2018', 1.4, { id: 'bseam' });
  for (let i = 0; i < 5; i++) { circ(250 + i * 30, 430 + i * 9, 4, { wash: '#c9b28a', id: 'lace' + i }); }
  box(20, 640, 510, 40, { wash: '#2e2018', line: INK, w: 1.6, id: 'sole' });
  box(40, 680, 150, 30, { wash: '#2e2018', line: INK, w: 1.4, id: 'heel' });
}
// match struck along a surface: head moves from (x0,y0) to (x1,y1) between ta..tb, ignites at tb if `fire`
function strike(t, x0, y0, x1, y1, ta, tb, fire, o = {}) {
  const k = ease.io(seg(t, ta, tb));
  const after = seg(t, tb, tb + 0.5);
  const hx = lerp(x0, x1, k) + (o.liftX || 0) * ease.out(after), hy = lerp(y0, y1, k) - (o.lift ?? 60) * ease.out(after);
  const ang = o.ang ?? -0.35;
  const L = o.len ?? 190;
  const fx = hx + Math.cos(ang) * L, fy = hy + Math.sin(ang) * L;
  match(hx, hy, ang, L, { id: o.id || 'sm', burnt: false });
  fist(fx, fy, ang, o.hs ?? 0.9, { id: (o.id || 'sm') + 'h', sleeve: o.sleeve || '#5b6b8a' });
  let fs = 0;
  if (fire && t >= tb) fs = (o.fsize || 26) * ease.elastic(seg(t, tb, tb + 0.6));
  if (fs > 0) flame(hx - 4, hy - 6, fs, t, { id: (o.id || 'sm') + 'f' });
  return { hx, hy, fs };
}

const SCENES = [
  // 1 ──────────────────────────────────────────────────────────────
  {
    name: '1 · Жарқыраған жақ', dur: 6.6,
    cam: (t) => { const k = ease.io(seg(t, 1.8, 5.0)); return { x: 270, y: lerp(480, 610, k), z: lerp(1, 2.05, k) }; },
    draw(t) { factoryBG(); girl(270, 610, 1.25, 0.6 + 0.4 * pulse(t)); },
    post(t, tq, O) { nightPost(O, t); girlGlowPost(O, t); questionMark(O, t, 4.4); },
    fadeIn: 0,
  },
  // 2 ──────────────────────────────────────────────────────────────
  {
    name: '2 · Брандтың колбасы → сіріңке', dur: 5.0,
    cam: (t) => { const k = ease.io(seg(t, 3.3, 4.9)); return { x: 270, y: lerp(480, 548, k), z: lerp(1, 1.65, k) }; },
    draw(t) {
      table(640, '#8f6f52');
      const k = ease.io(seg(t, 1.6, 3.3));
      const s = lerp(1, 0.06, k);
      if (t < 3.25) flask(270, lerp(520, 420, k), s, { lop: 210 });
      if (t >= 3.15) {
        const g = ease.out(seg(t, 3.25, 4.3));
        match(270, 420, Math.PI / 2, 270, { grow: g, headScale: ease.back(seg(t, 3.15, 3.5)) * 2.0, thick: 1.6, id: 'm2' });
      }
    },
    post(t, tq, O) {
      O.tint(NIGHT, 1);
      const k = ease.io(seg(t, 1.6, 3.3));
      const y = lerp(470, 420, k);
      const r = lerp(260, 34, k);
      const fadeAfter = 1 - 0.85 * seg(t, 3.3, 4.3);
      O.glow(270, y, r, GREEN, (0.55 + 0.2 * pulse(t, 0.9)) * fadeAfter);
      O.glow(270, y, r * 0.45, '#c9ffdc', 0.45 * fadeAfter);
    },
    fadeColor: '#1d2440',
  },
  // 3 ──────────────────────────────────────────────────────────────
  {
    name: '3 · Шақпақ тас', dur: 7.2,
    draw(t) {
      if (t < 4.3) {
        moss(288, 812, 1, 'mossA');
        // left hand + flint
        fist(196, 522, Math.PI * 0.8, 1.05, { id: 'lh', sleeve: '#7a6248' });
        flint(214, 470);
        // right hand + steel, striking at 0.9 / 2.1 / 3.3
        const strikes = [0.9, 2.1, 3.3];
        let k = 0; for (const ts of strikes) { k = Math.max(k, ease.in(seg(t, ts - 0.3, ts)) * (1 - ease.out(seg(t, ts + 0.05, ts + 0.45)))); }
        const hx = lerp(450, 342, k), hy = lerp(380, 470, k);
        steel(hx - 66, hy, 1.1, 'steel');
        fist(hx, hy, -0.25, 1.05, { id: 'rh', sleeve: '#7a6248' });
        strikes.forEach((ts, si) => {
          for (const sp of sparks(t, ts, 8, si * 10 + 1, si === 2 ? [288, 790] : null)) sparkLine(sp.x, sp.y, sp.vx, sp.vy, 'sp' + si + Math.round(sp.vx));
        });
        const e = ease.out(seg(t, 3.82, 4.3));
        if (e > 0) {
          circ(288, 790, 6 + 14 * e, { fill: '#d8452a', op: 230, bleed: 0.25, tex: 0.3, id: 'emb', boil: false });
          circ(288, 790, 3 + 6 * e, { wash: '#ffc04a', id: 'emb2' });
        }
        if (t > 4.0) {
          const pts = []; const h = 170 * seg(t, 4.0, 4.3);
          for (let i = 0; i <= 8; i++) pts.push([288 + Math.sin(i * 0.9 + t * 4) * 7 * (i / 8), 782 - h * i / 8]);
          path(pts, 'HB', '#8d8d8d', 1.0, { id: 'smA', curve: 0.8 });
        }
      } else {
        person(140, 500, 0.95, { id: 'blower', hairStyle: 'short', hair: '#3a2a1e', coat: '#6b5a3e', collar: 'white', expr: 'blow' });
        moss(372, 800, 1.1, 'mossB');
        const e = seg(t, 4.3, 7.2);
        circ(378, 782, 16 + 12 * e, { fill: '#d8452a', op: 235, bleed: 0.25, tex: 0.3, id: 'embB', boil: false });
        circ(378, 782, 7 + 7 * e, { wash: '#ffc04a', id: 'embB2' });
        for (let j = 0; j < 3; j++) { // breath lines
          const ph = (t * 1.4 + j * 0.33) % 1; const pts = [];
          for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([lerp(160, 352, u), lerp(548 + j * 12, 760 + j * 6, u) + Math.sin(u * 8 + t * 6 + j) * 6]); }
          const pp = partial(pts, 0.3 + 0.7 * ph);
          path(pp.slice(Math.min(pp.length - 2, Math.floor(ph * 3))), '2B', '#7f95a8', 1.5, { id: 'air' + j, curve: 0.7 });
        }
        for (let j = 0; j < 2; j++) {
          const pts = []; for (let i = 0; i <= 9; i++) pts.push([382 + i * 12 + Math.sin(i * 0.8 + t * 3 + j) * 8, 770 - i * 24 - j * 10]);
          path(pts, 'charcoal', '#9a9a9a', 1.3, { id: 'smB' + j, curve: 0.8 });
        }
        if (t > 6.3) flame(380, 768, 26 * ease.elastic(seg(t, 6.3, 6.9)), t, { id: 'mf' });
      }
    },
    post(t, tq, O) {
      if (t < 4.3) {
        [0.9, 2.1, 3.3].forEach((ts, si) => {
          const d = t - ts; if (d >= 0 && d < 0.25) O.glow(232, 470, 90, '#ffcf6a', 0.9 * (1 - d / 0.25));
          for (const sp of sparks(tq, ts, 8, si * 10 + 1, si === 2 ? [288, 790] : null)) O.glow(sp.x, sp.y, 16, '#ffb040', 0.9);
        });
        const e = seg(t, 3.82, 4.3); if (e > 0) O.glow(288, 790, 50 + 30 * e, '#ff8a3a', 0.55 * e);
      } else {
        const e = seg(t, 4.3, 7.2);
        O.glow(378, 782, 70 + 60 * e, '#ff7a2a', 0.45 + 0.35 * e * (0.7 + 0.3 * Math.sin(t * 9)));
        if (t > 6.3) O.glow(380, 730, 130, WARM, 0.55);
      }
    },
  },
  // 4 ──────────────────────────────────────────────────────────────
  {
    name: '4 · Бойль, 1680', dur: 6.2,
    draw(t) {
      person(385, 318, 1.1, { id: 'boyle', hairStyle: 'curly', hair: '#a08a6a', coat: '#2f3a4a', collar: 'band', expr: 'focus', skin: '#ecc9a8' });
      table(640, '#c9a57a');
      shape(xf(rectP(-150, -95, 300, 190), { x: 230, y: 790, r: -0.06 }), { wash: '#fbf6ea', line: INK, w: 1.3, curve: 0, id: 'paper' });
      shape(jitter(ell(215, 795, 92, 52, 18), 10, 'ph'), { fill: '#e2dfa4', op: 210, bleed: 0.12, tex: 0.65, border: 0.5, curve: 0.6, id: 'phos', boil: false });
      // rubbing
      const r = t > 3.0 ? 0.5 - 0.5 * Math.cos((t - 3.0) * TAU * 1.5) : 0;
      const tipX = 318 - 150 * r, tipY = 768 + 18 * r;
      // scratch marks
      const nS = Math.floor(seg(t, 3.0, 6.2) * 10);
      for (let i = 0; i < nS; i++) line(160 + rnd(i, 7) * 40, 778 + i * 3, 300 + rnd(i, 8) * 20, 772 + i * 3, 'HB', '#9a8a5a', 0.7, 'scr' + i);
      const ang = -0.62, L = 210; // stick toward the hand (up-right)
      const ex = tipX + Math.cos(ang) * L, ey = tipY + Math.sin(ang) * L;
      shape([[tipX, tipY - 4], [ex, ey - 4], [ex, ey + 4], [tipX, tipY + 4]], { wash: '#d9b47a', line: '#7a5a3a', w: 0.9, curve: 0, id: 'stick' });
      shape(ell(tipX - 4, tipY, 15, 10, 14), { fill: '#f2d02e', op: 240, bleed: 0.04, tex: 0.5, line: '#8a6a10', w: 1.0, id: 'sulf' });
      fist(ex, ey, ang, 0.85, { id: 'bh', sleeve: '#2f3a4a', skin: '#ecc9a8' });
      // labels' arrows
      const a1 = ease.out(seg(t, 1.1, 1.6)), a2 = ease.out(seg(t, 1.9, 2.4));
      if (a1 > 0) path(partial([[96, 880], [120, 850], [160, 820]], a1), 'HB', INK, 1.4, { id: 'ar1' });
      if (a2 > 0) path(partial([[420, 900], [380, 860], [328, 790]], a2), 'HB', INK, 1.4, { id: 'ar2' });
    },
    post(t, tq, O) {
      const y = pop(t, 0.15); O.text('1680', 34, 92, { font: 'rub', size: 74, align: 'left', scale: y.s, alpha: y.a, color: INK });
      const p1 = pop(t, 1.2); O.text('фосфор', 92, 905, { size: 46, scale: p1.s, alpha: p1.a, color: '#4a5a1a', rot: -0.06 });
      const p2 = pop(t, 2.0); O.text('күкірт', 440, 925, { size: 46, scale: p2.s, alpha: p2.a, color: '#8a6a10', rot: 0.04 });
      if (t > 3.0) O.glow(230, 790, 90, '#fff6b0', 0.12 + 0.1 * Math.sin(t * 20));
    },
  },
  // 5 ──────────────────────────────────────────────────────────────
  {
    name: '5 · Лап! Фосфор қымбат', dur: 6.6,
    cam: (t) => { const sh = t > 0.12 && t < 0.5 ? (1 - seg(t, 0.12, 0.5)) * 8 : 0; return { sx: Math.sin(t * 90) * sh, sy: Math.cos(t * 77) * sh }; },
    draw(t) {
      if (t < 1.9) {
        table(560, '#c9a57a');
        shape(xf(rectP(-240, -120, 480, 240), { x: 260, y: 760, r: -0.05 }), { wash: '#fbf6ea', line: INK, w: 1.3, curve: 0, id: 'paper5' });
        shape(jitter(ell(240, 760, 160, 80, 20), 12, 'ph5'), { fill: '#e2dfa4', op: 210, bleed: 0.12, tex: 0.65, border: 0.5, curve: 0.6, id: 'phos5', boil: false });
        const tipX = 250, tipY = 610, ang = -0.75, L = 420;
        const ex = tipX + Math.cos(ang) * L, ey = tipY + Math.sin(ang) * L;
        shape([[tipX, tipY - 7], [ex, ey - 7], [ex, ey + 7], [tipX, tipY + 7]], { wash: '#d9b47a', line: '#7a5a3a', w: 1.0, curve: 0, id: 'stick5' });
        shape(ell(tipX - 6, tipY, 24, 16, 14), { fill: '#f2d02e', op: 240, bleed: 0.04, tex: 0.5, line: '#8a6a10', w: 1.0, id: 'sulf5' });
        const fs = 80 * ease.elastic(seg(t, 0.12, 0.75));
        flame(tipX - 6, tipY - 6, fs, t, { id: 'lap' });
      } else if (t < 4.7) {
        const drop = ease.in(seg(t, 2.1, 2.5));
        const th = t < 2.55 ? 0.17 : lerp(0.17, -0.2, ease.back(seg(t, 2.55, 3.4)));
        const b = balance(th);
        vial(b.lx, lerp(-60, b.ly - 2, drop), 'vial5');
      } else {
        lettersP(150, 360, 1.05, ease.io(seg(t, 4.75, 5.3)), 'bigP');
        if (t > 5.3) cross(205, 485, 230, ease.out(seg(t, 5.3, 5.75)), '#c0392b', 'xP');
        if (t > 5.8) qmark(330, 380, 1.15, ease.io(seg(t, 5.8, 6.35)), 'bigQ');
      }
    },
    post(t, tq, O) {
      if (t < 1.9) {
        const k = seg(t, 0.12, 0.4);
        if (t > 0.12) { O.glow(244, 540, 260, WARM, 0.55 * k); O.flash('#fff2c8', 0.5 * (1 - seg(t, 0.12, 0.45))); }
        const p = pop(t, 0.18, 0.3);
        O.text('ЛАП!', 300, 250, { font: 'rub', size: 120, color: '#ee6a24', outline: INK, outlineW: 6, scale: p.s, alpha: p.a, rot: -0.12 });
      } else if (t < 4.7) {
        const drop = ease.in(seg(t, 2.1, 2.5));
        const th = t < 2.55 ? 0.17 : lerp(0.17, -0.2, ease.back(seg(t, 2.55, 3.4)));
        const lx = 270 - Math.cos(th) * 190, ly = 360 - Math.sin(th) * 190 + 170;
        O.glow(lx, lerp(-60, ly - 2, drop) - 38, 90, '#fff3a0', 0.7);
      }
    },
  },
  // 6 ──────────────────────────────────────────────────────────────
  {
    name: '6 · Уокер, 1826', dur: 11.0,
    draw(t) {
      if (t < 3.6) {
        // shelves with jars
        for (const sy of [190, 330]) box(-20, sy, 580, 10, { wash: '#a87d55', line: INK, w: 1.0, id: 'shelf' + sy });
        const cols = ['#6c9a8b', '#c9a227', '#8c3b3b', '#4b6b9a', '#9b7bb0', '#5c8a4a'];
        cols.forEach((c, i) => jar(50 + i * 88, 190, 46 + (i % 3) * 8, 64 + (i % 2) * 18, c, 'jar' + i));
        cols.slice(0, 5).forEach((c, i) => jar(80 + i * 100, 330, 40 + (i % 2) * 10, 56 + (i % 3) * 10, cols[(i + 3) % 6], 'jbr' + i));
        person(240, 480, 1.0, { id: 'walker', hairStyle: 'bald', hair: '#c9c2b8', sideburns: '#bdb5aa', coat: '#3d4b3f', collar: 'white', apron: true, expr: 'focus' });
        table(660, '#8b6440');
        // mortar bowl + stirring
        const w = t * TAU * 0.9;
        shape(ell(372, 650, 70, 50, 20, 0, Math.PI).concat([[302, 650], [442, 650]]), { fill: '#d9d2c4', op: 220, bleed: 0.03, tex: 0.3, line: INK, w: 1.3, curve: 0.4, id: 'bowl' });
        shape(ell(372, 650, 70, 14, 20), { wash: '#9a7a5c', line: INK, w: 1.1, id: 'mix' });
        const bx = 372 + Math.cos(w + 0.4) * 26, by = 650 + Math.sin(w + 0.4) * 6;
        const fx = 372 + Math.cos(w) * 34, fy = 520 + Math.sin(w) * 10;
        shape([[bx - 4, by], [fx - 4, fy], [fx + 4, fy], [bx + 4, by]], { wash: '#c79f68', line: '#6a4a2a', w: 0.9, curve: 0, id: 'stir' });
        fist(fx, fy, 2.6, 0.75, { id: 'wh', sleeve: '#3d4b3f' });
      } else if (t < 5.6) {
        const k = seg(t, 3.9, 5.3);
        shape([[40, 900], [330, 430], [346, 440], [56, 910]], { wash: '#c79f68', line: '#6a4a2a', w: 1.2, curve: 0, id: 'bigstick' });
        const col = mixHex('#6b4428', '#b89b72', k);
        shape(jitter(ell(344, 420, 40 - 6 * k, 32 - 4 * k, 18), 6 * k, 'drop'), { fill: col, op: 245, bleed: 0.04, tex: 0.2 + 0.6 * k, border: 0.6, line: INK, w: 1.2, curve: 0.55, id: 'drop', boil: false });
        if (k < 0.6) {
          shape([[330, 446], [358, 446], [346, 470 + 40 * (1 - k)]], { fill: col, op: 245, line: INK, w: 1.0, curve: 0.6, id: 'drip', boil: false });
          path([[326, 404], [338, 396]], 'HB', '#ffffff', 2.4 * (1 - k / 0.6), { id: 'hlw' });
        }
        if (k > 0.5) for (let i = 0; i < 5; i++) line(320 + i * 9, 404 + (i % 2) * 8, 326 + i * 9, 430 - (i % 2) * 6, 'HB', '#6b5030', 0.7, 'cr' + i);
        for (let i = 0; i < 3; i++) { // drying shimmer lines
          const y0 = 350 - ((t * 40 + i * 25) % 70);
          path([[300 + i * 30, y0 + 30], [306 + i * 30, y0 + 15], [300 + i * 30, y0]], 'HB', '#b0a090', 0.9, { id: 'dry' + i, curve: 0.8 });
        }
      } else if (t < 8.0) {
        stoneWall(40, 560, 'hw');
        box(120, 120, 300, 260, { wash: '#2a221e', line: INK, w: 1.4, id: 'hearthHole' });
        flame(220, 360, 34, t, { id: 'hf1' }); flame(300, 368, 28, t + 0.5, { id: 'hf2', salt: 3 });
        box(-20, 560, 580, 140, { fill: '#8e8880', op: 230, bleed: 0.03, tex: 0.6, border: 0.4, line: INK, w: 1.5, id: 'hstone' });
        box(-20, 700, 580, 300, { wash: '#6a5a4a', id: 'floor' });
        const r = t > 5.9 && t < 7.25 ? 0.5 - 0.5 * Math.cos((t - 5.9) * TAU * 1.6) : 0;
        const tipX = 300 + 90 * r, tipY = 568;
        const ang = Math.PI + 0.45, L = 260;
        const ex = tipX + Math.cos(ang) * L, ey = tipY + Math.sin(ang) * L;
        for (let i = 0; i < Math.floor(seg(t, 5.9, 7.25) * 6); i++) line(296 + i * 4, 576 + i * 3, 400 - i * 3, 574 + i * 3, 'HB', '#5a5048', 0.8, 'hs' + i);
        shape([[tipX, tipY - 5], [ex, ey - 5], [ex, ey + 5], [tipX, tipY + 5]], { wash: '#c79f68', line: '#6a4a2a', w: 1.0, curve: 0, id: 'hstick' });
        shape(ell(tipX + 4, tipY, 14, 10, 14), { fill: '#b89b72', op: 240, line: INK, w: 1.0, id: 'htip' });
        fist(ex, ey, ang, 0.9, { id: 'whh', sleeve: '#3d4b3f' });
        if (t >= 7.25) flame(tipX + 4, tipY - 8, 50 * ease.elastic(seg(t, 7.25, 7.8)), t, { id: 'wf' });
      } else {
        person(250, 540, 1.55, { id: 'walker2', hairStyle: 'bald', hair: '#c9c2b8', sideburns: '#bdb5aa', coat: '#3d4b3f', collar: 'white', apron: true, expr: 'surprised' });
        shape([[430, 640], [436, 640], [450, 960], [430, 960]], { wash: '#c79f68', line: '#6a4a2a', w: 1.0, curve: 0, id: 'wstick' });
        fist(440, 830, Math.PI / 2 + 0.15, 1.0, { id: 'wh2', sleeve: '#3d4b3f' });
        flame(433, 630, 46, t, { id: 'wf2' });
        if (t > 9.0) lettersP(40, 110, 0.62, ease.io(seg(t, 9.0, 9.45)), 'P6');
        if (t > 9.45) cross(156, 186, 110, ease.out(seg(t, 9.45, 9.85)), '#c0392b', 'x6');
      }
    },
    post(t, tq, O) {
      if (t < 3.6) { const p = pop(t, 0.15); O.text('1826', 34, 72, { font: 'rub', size: 74, align: 'left', scale: p.s, alpha: p.a, color: INK, outline: PAPER, outlineW: 6 }); }
      else if (t >= 5.6 && t < 8.0) {
        O.glow(260, 340, 200, WARM, 0.45 + 0.1 * Math.sin(t * 11));
        if (t > 7.25) { const r = 0; O.glow(304 + r, 540, 200, WARM, 0.7 * seg(t, 7.25, 7.5)); O.flash('#fff0c0', 0.45 * (1 - seg(t, 7.25, 7.6))); }
      } else if (t >= 8.0) {
        O.glow(433, 580, 260, WARM, 0.55 + 0.1 * Math.sin(t * 13));
      }
    },
  },
  // 7 ──────────────────────────────────────────────────────────────
  {
    name: '7 · Құм қағаз, Сориа 1830, монтаж', dur: 11.0,
    draw(t) {
      if (t < 2.8) {
        table(470, '#b48a5e');
        shape(xf(rectP(-200, -80, 400, 160), { x: 265, y: 640, r: 0.03 }), { fill: '#c9a46a', op: 230, bleed: 0.02, tex: 0.95, border: 0.6, line: INK, w: 1.3, curve: 0, id: 'sand' });
        for (let i = 0; i < 40; i++) circ(80 + rnd(i, 1) * 370, 570 + rnd(i, 2) * 140, 1.6 + rnd(i, 3) * 1.6, { wash: '#7a5a32', id: 'gr' + i, boil: false });
        strike(t, 420, 600, 130, 640, 0.5, 1.5, true, { id: 'sA', ang: -0.5, fsize: 30 });
      } else if (t < 6.2) {
        person(160, 420, 0.95, { id: 'soria', hairStyle: 'wavy', hair: '#2a1c14', coat: '#31456b', collar: 'cravat', expr: 'focus', skin: '#efcfb0' });
        table(700, '#a07650');
        const cy = lerp(500, 690, ease.io(seg(t, 3.8, 4.7)));
        shape(ell(380, 700, 90, 56, 20, 0, Math.PI).concat([[290, 700], [470, 700]]), { fill: '#d9d2c4', op: 220, bleed: 0.03, tex: 0.3, line: INK, w: 1.3, curve: 0.4, id: 'bowl7' });
        shape(ell(380, 700, 90, 17, 20), { wash: '#a28462', line: INK, w: 1.1, id: 'mix7' });
        if (t < 4.75) shape(jitter(ell(380, cy, 20, 14, 9), 8, 'wp'), { fill: '#f6f3dc', op: 240, bleed: 0.04, tex: 0.3, line: INK, w: 1.1, curve: 0.2, id: 'wp' });
        // tongs + hand
        const fy = cy - 150;
        path([[372, cy - 10], [350, fy + 10]], 'pen', '#3a3d44', 2.2, { id: 'tg1' });
        path([[388, cy - 10], [362, fy + 10]], 'pen', '#3a3d44', 2.2, { id: 'tg2' });
        fist(356, fy, -2.2, 0.8, { id: 'sh', sleeve: '#31456b', skin: '#efcfb0' });
        if (t > 4.7 && t < 5.4) for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.15 + 0.7 * i / 4); const r0 = 20 + 60 * seg(t, 4.7, 5.2); line(380 + Math.cos(a) * r0, 690 + Math.sin(a) * r0 * 0.6, 380 + Math.cos(a) * (r0 + 16), 690 + Math.sin(a) * (r0 + 16) * 0.6, 'HB', INK, 1.0, 'spl' + i); }
      } else {
        const sh = Math.floor((t - 6.2) / 1.6), lt = (t - 6.2) - sh * 1.6;
        if (sh === 0) { boot(); strike(lt, 500, 662, 150, 664, 0.1, 0.6, true, { id: 'sb', ang: -0.6, fsize: 32, sleeve: '#4a5a3a' }); }
        else if (sh === 1) { bricks(); strike(lt, 460, 560, 120, 566, 0.1, 0.6, true, { id: 'sw', ang: -0.55, fsize: 32, sleeve: '#4a5a3a' }); }
        else { table(380, '#b98a5a'); planks(380); strike(lt, 460, 560, 120, 570, 0.1, 0.6, true, { id: 'st', ang: -0.55, fsize: 32, sleeve: '#4a5a3a' }); }
      }
    },
    post(t, tq, O) {
      if (t < 2.8) { if (t > 1.5) O.glow(150, 600, 170, WARM, 0.55 * seg(t, 1.5, 1.7)); }
      else if (t < 6.2) {
        const p = pop(t, 2.95); O.text('1830', 506, 80, { font: 'rub', size: 74, align: 'right', scale: p.s, alpha: p.a, color: INK });
        const cy = lerp(500, 690, ease.io(seg(t, 3.8, 4.7)));
        if (t < 4.75) { O.glow(380, cy, 90, '#f2ffd8', 0.75); O.glow(380, cy, 34, '#ffffff', 0.6); }
        else O.glow(380, 690, 120, '#e8ffd0', 0.5 * (1 - seg(t, 5.0, 6.2)) + 0.2);
      } else {
        const sh = Math.floor((t - 6.2) / 1.6), lt = (t - 6.2) - sh * 1.6;
        if (lt > 0.6) { O.glow(160, 560, 180, WARM, 0.6 * seg(lt, 0.6, 0.75)); O.flash('#fff0c0', 0.35 * (1 - seg(lt, 0.6, 0.9))); }
      }
    },
    fadeIn: 0.12,
  },
  // 8 ──────────────────────────────────────────────────────────────
  {
    name: '8 · Улы бу, рентген', dur: 7.4,
    bg: (t) => (t < 3.7 ? PAPER : '#16243a'),
    draw(t) {
      if (t < 3.7) {
        person(430, 470, 0.72, { id: 'w2', hairStyle: 'scarf', scarf: '#6f7d8a', hair: '#3a2a20', coat: '#5b5048', expr: 'worry' });
        person(200, 430, 0.92, { id: 'w1', hairStyle: 'scarf', scarf: '#8a6f5a', hair: '#4a3020', coat: '#6b5b4b', collar: 'white', expr: 'worry' });
        table(690, '#8f6f52');
        box(90, 700, 360, 70, { wash: '#6a4a32', line: INK, w: 1.3, id: 'tray' });
        box(102, 708, 336, 40, { fill: '#f7f5ec', op: 240, bleed: 0.02, tex: 0.3, border: 0.2, id: 'paste' });
        const d = Math.max(ease.io(seg(t, 0.6, 1.2)) * (1 - ease.io(seg(t, 1.6, 2.2))), ease.io(seg(t, 2.6, 3.0)) * (1 - ease.io(seg(t, 3.2, 3.6))));
        const by = lerp(560, 640, d);
        box(120, by - 10, 300, 14, { wash: '#a8834e', line: INK, w: 1.1, id: 'frame' });
        const dipped = t > 1.0;
        for (let i = 0; i < 9; i++) match(140 + i * 32, by + 70, -Math.PI / 2, 66, { id: 'dm' + i, head: dipped ? '#f1efe4' : '#d9c39a', headScale: 0.8 });
        fist(126, by - 4, 2.3, 0.7, { id: 'dh1', sleeve: '#6b5b4b' });
        fist(416, by - 4, 0.75, 0.7, { id: 'dh2', sleeve: '#6b5b4b' });
        for (let j = 0; j < 4; j++) { // vapour toward the face
          const ph = (t * 0.5 + j * 0.25) % 1; const pts = [];
          for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([lerp(160 + j * 70, 206, u * u) + Math.sin(u * 7 + t * 3 + j) * 14 * (1 - u), lerp(700, 476, u)]); }
          path(partial(pts, 0.3 + 0.7 * ph), 'charcoal', '#a7b4c2', 1.6, { id: 'vap' + j, curve: 0.7 });
        }
      } else {
        xray(t, 3.7);
      }
    },
    post(t, tq, O) {
      if (t >= 3.7) { O.glow(280, 560, 260, '#6fb7ff', 0.25); O.vignette(0.55, '5,10,20'); }
    },
  },
  // 9 ──────────────────────────────────────────────────────────────
  {
    name: '9 · «Фосфорлы жақ»', dur: 6.2,
    bg: (t) => (t < 2.6 ? '#16243a' : PAPER),
    cam: (t) => {
      if (t < 2.6) { const sh = t > 0.28 && t < 0.6 ? (1 - seg(t, 0.28, 0.6)) * 10 : 0; return { sx: Math.sin(t * 95) * sh, sy: Math.cos(t * 83) * sh }; }
      return { x: 270, y: 590, z: 1.75 };
    },
    draw(t) {
      if (t < 2.6) xray(10, 0);
      else { factoryBG(); girl(270, 610, 1.25, 0.75 + 0.25 * pulse(t)); }
    },
    post(t, tq, O) {
      if (t < 2.6) {
        O.glow(280, 560, 260, '#6fb7ff', 0.2); O.vignette(0.6, '5,10,20');
        const k = seg(t, 0.12, 0.3);
        if (t > 0.12) O.stamp('ФОСФОРЛЫ\nЖАҚ', 270, 470, { size: 70, rot: -0.12, scale: lerp(2.2, 1, ease.in(k)), alpha: k * 1.2 });
      } else {
        nightPost(O, t); girlGlowPost(O, t, 1.25);
        const g = ease.io(seg(t, 3.6, 4.4));
        questionMark(O, t, 2.75, g);
      }
    },
    fadeIn: 0.1,
    fadeColor: '#fff',
  },
  // 10 ─────────────────────────────────────────────────────────────
  {
    name: '10 · Қызыл фосфор, Швеция', dur: 8.2,
    draw(t) {
      if (t < 4.2) {
        shape(ell(270, 520, 190, 60, 26), { wash: '#ece7dc', line: INK, w: 1.4, id: 'saucer' });
        shape(ell(270, 518, 140, 40, 26), { line: '#9a948a', w: 1.0, id: 'saucer2' });
        const heap = [[110, 525], [150, 470], [205, 418], [262, 396], [322, 412], [380, 462], [430, 525], [380, 548], [270, 556], [160, 548]];
        shape(heap, { fill: '#a3322a', op: 240, bleed: 0.06, tex: 0.9, border: 0.6, scatter: true, curve: 0.55, id: 'heap', boil: false });
        for (let i = 0; i < 46; i++) { const a = rnd(i, 11), b = rnd(i, 12); const x = 140 + a * 270, yTop = 525 - (1 - Math.pow((x - 270) / 140, 2)) * 120; circ(x, lerp(yTop + 10, 540, b), 1.5 + rnd(i, 13) * 2, { wash: i % 3 ? '#6e1d17' : '#c9584a', id: 'rg' + i, boil: false }); }
        if (t > 1.0) check(70, 720, 46, ease.out(seg(t, 1.0, 1.35)), '#2f8a3e', 'c1');
        if (t > 2.1) check(70, 810, 46, ease.out(seg(t, 2.1, 2.45)), '#2f8a3e', 'c2');
      } else {
        // flag
        box(40, 84, 76, 50, { wash: '#2f6db5', line: INK, w: 1.1, id: 'flag' });
        box(62, 84, 12, 50, { wash: '#f4c430', id: 'fl1' }); box(40, 103, 76, 12, { wash: '#f4c430', id: 'fl2' });
        person(115, 430, 0.74, { id: 'bro1', hairStyle: 'short', hair: '#8a6a3a', mustache: '#7a5a32', coat: '#3b4a5a', collar: 'white', expr: 'focus' });
        person(430, 430, 0.74, { id: 'bro2', hairStyle: 'short', hair: '#5a4030', beard: '#5a4030', coat: '#5b4a3a', collar: 'white', expr: 'smile' });
        table(700, '#b48a5e');
        box(150, 620, 240, 150, { wash: '#e9d9a8', line: INK, w: 1.4, id: 'bx' });
        box(190, 650, 160, 90, { fill: '#2f6db5', op: 210, bleed: 0.02, tex: 0.3, id: 'bxl' });
        circ(270, 695, 24, { wash: '#f4c430', id: 'bxc' });
        box(150, 770, 240, 36, { wash: '#d6c08c', line: INK, w: 1.3, id: 'side' });
        const k = ease.io(seg(t, 5.0, 7.6));
        if (k > 0) box(156, 778, 228 * k, 20, { fill: '#7d2a1e', op: 245, bleed: 0.02, tex: 0.85, border: 0.4, id: 'strip', boil: false });
        const bx = 156 + 228 * k;
        path([[bx + 4, 786], [bx + 60, 700]], 'pen', '#6a4a2a', 3.2, { id: 'pbr' });
        shape([[bx - 4, 790], [bx + 12, 770], [bx + 20, 780], [bx + 6, 798]], { wash: '#7d2a1e', line: INK, w: 0.9, id: 'bris' });
        fist(bx + 66, 690, -0.9, 0.7, { id: 'broh', sleeve: '#5b4a3a' });
      }
    },
    post(t, tq, O) {
      if (t < 4.2) {
        const p0 = pop(t, 0.2); O.text('Қызыл фосфор', 270, 300, { size: 64, scale: p0.s, alpha: p0.a, color: '#7d2a1e' });
        const p1 = pop(t, 1.0); O.text('Улы емес', 112, 718, { size: 50, align: 'left', scale: p1.s, alpha: p1.a });
        const p2 = pop(t, 2.1); O.text('Өздігінен тұтанбайды', 112, 808, { size: 50, align: 'left', scale: p2.s, alpha: p2.a });
      } else {
        const p = pop(t, 4.35); O.text('ШВЕЦИЯ', 132, 112, { font: 'rub', size: 62, align: 'left', scale: p.s, alpha: p.a, color: '#2f6db5' });
      }
    },
  },
  // 11 ─────────────────────────────────────────────────────────────
  {
    name: '11 · Қауіпсіз сіріңке', dur: 5.6,
    draw(t) {
      if (t < 2.2) {
        planks(300, '#b98a5a', 'pl11');
        strike(t, 450, 600, 130, 606, 0.3, 1.0, false, { id: 's11a', ang: -0.55, lift: 30, sleeve: '#5b6b8a' });
        if (t > 1.0) path([[130, 612], [450, 606]], 'HB', '#7a5a3a', 1.0, { id: 'scr11' });
        if (t > 1.25) cross(270, 360, 130, ease.out(seg(t, 1.25, 1.7)), '#c0392b', 'x11');
      } else {
        table(330, '#c39b6c');
        box(70, 470, 400, 200, { wash: '#e9d9a8', line: INK, w: 1.5, id: 'bx11' });
        box(120, 500, 300, 140, { fill: '#c2453a', op: 210, bleed: 0.02, tex: 0.3, id: 'bx11l' });
        circ(270, 570, 40, { wash: '#f5e7c2', id: 'bx11c' });
        box(70, 670, 400, 48, { fill: '#7d2a1e', op: 245, bleed: 0.02, tex: 0.85, border: 0.4, line: INK, w: 1.3, id: 'strip11', boil: false });
        strike(t, 440, 690, 110, 694, 2.45, 3.0, true, { id: 's11b', ang: -0.55, fsize: 34, sleeve: '#5b6b8a' });
        if (t > 3.3) check(440, 300, 110, ease.out(seg(t, 3.3, 3.7)), '#2f8a3e', 'c11');
      }
    },
    post(t, tq, O) {
      if (t >= 3.0 && t >= 2.2) { O.glow(120, 620, 200, WARM, 0.6 * seg(t, 3.0, 3.2)); O.flash('#fff0c0', 0.35 * (1 - seg(t, 3.0, 3.35))); }
      const p = pop(t, 4.0, 0.4);
      O.text('ҚАУІПСІЗ\nСІРІҢКЕ', 270, 170, { font: 'rub', size: 70, scale: p.s, alpha: p.a, color: '#2f8a3e', outline: PAPER, outlineW: 10, rot: -0.04 });
    },
  },
  // 12 ─────────────────────────────────────────────────────────────
  {
    name: '12 · Бүгін → Брандтың жарығы', dur: 8.4,
    draw(t) {
      const gk = ease.io(seg(t, 2.6, 3.5));
      const outer = mixHex('#e8692a', '#2fd36b', gk), inner = mixHex('#ffd25a', '#c8ffd8', gk);
      const fk = ease.io(seg(t, 3.6, 5.2));
      if (t < 4.2) {
        table(700, '#9fb3bf');
        // modern phone & mug hints
        box(390, 770, 120, 70, { wash: '#2b2f36', line: INK, w: 1.2, id: 'phone' });
        box(397, 776, 106, 58, { wash: '#5d7a8f', id: 'scr' });
        box(40, 740, 300, 80, { wash: '#f1ece2', line: INK, w: 1.3, id: 'mbox' });
        box(46, 820, 288, 22, { fill: '#7d2a1e', op: 245, bleed: 0.02, tex: 0.85, line: INK, w: 1.1, id: 'mstrip', boil: false });
        box(110, 755, 160, 50, { wash: '#2fb3a5', id: 'mlab' });
        const lift = ease.io(seg(t, 1.3, 2.3));
        let hx, hy;
        if (t < 1.3) { const k = ease.io(seg(t, 0.35, 1.1)); hx = lerp(320, 70, k); hy = 832; }
        else { hx = lerp(70, 270, lift); hy = lerp(832, 520, lift); }
        const ang = lerp(-0.45, Math.PI / 2 - 0.2, ease.io(seg(t, 1.3, 2.3)));
        const L = 200; const fx = hx + Math.cos(ang) * L, fy = hy + Math.sin(ang) * L;
        match(hx, hy, ang, L, { id: 'm12' });
        fist(fx, fy, ang, 0.9, { id: 'h12', sleeve: '#2c8c99', skin: '#e2b48e' });
        if (t > 1.1) flame(hx - 2, hy - 6, (34 + 10 * gk) * ease.elastic(seg(t, 1.1, 1.7)) * (1 - fk), t, { id: 'f12', outer, inner });
      }
      if (t > 3.6) flask(270, lerp(520, 480, fk), lerp(0.06, 1.05, fk), { id: 'fk12' });
    },
    post(t, tq, O) {
      const gk = ease.io(seg(t, 2.6, 3.5));
      const fk = ease.io(seg(t, 3.6, 5.2));
      O.tint(NIGHT, ease.io(seg(t, 3.0, 4.4)));
      if (t > 1.1) {
        const col = mixHex('#ffb347', '#5dff8f', gk);
        const y = t < 4.2 ? lerp(470, 480, fk) : 480;
        O.glow(270, y, lerp(170, 300, fk), col, 0.6 + 0.15 * pulse(t, 0.9));
        if (fk > 0) O.glow(270, 500, 110, '#c9ffdc', 0.45 * fk);
      }
      const p1 = pop(t, 5.4, 0.4);
      O.text('Пікір қалдырыңыз!', 270, 130, { font: 'rub', size: 44, scale: p1.s, alpha: p1.a, color: '#f2e8d2', outline: '#1d2440', outlineW: 8 });
      const words = ['Тұз?', 'Шыны?', 'Сабын?']; const xs = [170, 300, 390], ys = [760, 835, 910];
      words.forEach((w, i) => { const p = pop(t, 6.0 + i * 0.35, 0.35); O.text(w, xs[i], ys[i], { size: 70, scale: p.s, alpha: p.a, color: '#bfffd2', outline: '#1d2440', outlineW: 7, rot: (i - 1) * 0.06, glow: '#3dff7a', glowSize: 18 }); });
    },
  },
];

// X-ray of the lower face (profile): light lines on dark blue, a falling tooth and darkening jaw bone.
function xray(t, t0) {
  const lt = t - t0;
  const L = '#cfe3ef';
  // soft-tissue profile (faint)
  path([[330, 120], [352, 230], [368, 300], [414, 392], [374, 432], [390, 474], [376, 500], [392, 534], [372, 610], [300, 676], [236, 700], [210, 900]], 'HB', '#7b97b0', 1.1, { id: 'soft', curve: 0.6 });
  // skull base + maxilla
  path([[110, 300], [180, 250], [290, 240], [350, 300], [370, 380], [360, 440]], '2B', L, 1.6, { id: 'skull', curve: 0.6 });
  path([[214, 418], [300, 424], [352, 440], [364, 470], [330, 478], [240, 478]], '2B', L, 1.5, { id: 'max', curve: 0.6 });
  // mandible
  const necro = ease.io(clamp((lt - 1.5) / 2.2));
  const jaw = [[184, 410], [170, 470], [176, 540], [196, 594], [250, 616], [322, 622], [356, 606], [368, 576], [356, 540], [340, 530], [240, 532], [222, 500], [214, 450], [198, 424]];
  shape(jaw, { fill: mixHex('#d6e6f0', '#8a8f86', necro * 0.6), op: 200, bleed: 0.04, tex: 0.3, border: 0.6, line: L, w: 1.6, curve: 0.7, id: 'mand', boil: false });
  // teeth
  for (let i = 0; i < 6; i++) {
    const x = 246 + i * 18;
    shape(rectP(x, 478, 15, 26).map(([a, b]) => [a, b]), { wash: '#eef6fb', line: L, w: 1.0, curve: 0.5, id: 'ut' + i });
    if (i === 3) {
      const f = ease.in(clamp((lt - 0.6) / 0.9));
      const tooth = xf(rectP(-7, -13, 15, 26), { x: x + 7 + f * 40, y: 515 + f * 480, r: f * 2.4 });
      shape(tooth, { wash: '#eef6fb', line: L, w: 1.0, curve: 0.5, id: 'ft' });
    } else shape(rectP(x, 504, 15, 24), { wash: '#eef6fb', line: L, w: 1.0, curve: 0.5, id: 'lt' + i });
  }
  // necrotic dark patches
  if (necro > 0) {
    [[300, 580, 34], [252, 570, 26], [334, 560, 20], [220, 540, 18]].forEach(([x, y, r], i) => {
      const rr = r * clamp(necro * 1.4 - i * 0.12);
      if (rr > 1) shape(jitter(ell(x, y, rr * 1.2, rr * 0.8, 14), rr * 0.4, 'nc' + i), { fill: '#2a2622', op: 235, bleed: 0.15, tex: 0.5, curve: 0.6, id: 'nc' + i, boil: false });
    });
  }
}
