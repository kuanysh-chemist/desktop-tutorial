// «Сера, которая становится резиной» — pilot: engraving (story) → blue grid with HUD (mechanism) → engraving.
// 1080×1920, 60 fps. Engravings: img/A.jpg, B.jpg, C.jpg (Canva AI, style card 26). Grid: style card 21.
window.DURATION = 46;
window.FONTS = ['600 50px Corm', 'italic 600 50px CormI', '700 50px CormSC', '500 30px Mono', '700 40px Man', '800 90px Unb'];

const IMG = {};
['A', 'B', 'C'].forEach(k => { const im = new Image(); im.src = `img/${k}.jpg`; IMG[k] = im; });
window.ASSETS = Promise.all(Object.values(IMG).map(im => im.decode()));

const TLX = window.TL || [];
const T = { AB: 9.3, toGrid: 14.55, gridIn: 15.25, toC: 33.0, cIn: 33.55, title: 42.5 };

// ---------------- engraving shots ----------------
// cover-draw an engraving zoomed by z around image point (fx, fy), placed at screen centre-ish (sx, sy)
function engr(img, z, fx, fy, sx = W / 2, sy = H / 2, g = ctx) {
  reset(g); g.imageSmoothingQuality = 'high';
  g.drawImage(img, sx - fx * z, sy - fy * z, img.width * z, img.height * z);
  return p => [sx + (p[0] - fx) * z, sy + (p[1] - fy) * z]; // image → screen mapper
}
// warm flickering lamp light: glow on the flame + soft breathing light over the scene
function lampLight(t, m, flame, k = 1) {
  const fl = .82 + .1 * noise1(t * 7.3) + .08 * noise1(t * 17.1);
  const [x, y] = m(flame);
  radialGlow(ctx, x, y - 10, 520, `rgba(255,170,70,${.20 * fl * k})`, 'screen');
  radialGlow(ctx, x, y - 6, 90, `rgba(255,230,160,${.55 * fl * k})`, 'screen');
  return fl;
}
// heat shimmer / vapour wisps rising from a point (image coords), drawn as soft sepia strands
function wisps(t, m, p, { n = 7, rise = 380, col = '240,225,200', a = .16, spread = 40, seed = 1, z = 1 } = {}) {
  reset(ctx); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(6px)'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = (t * .32 + hash(i * 7 + seed)) % 1, [x0, y0] = m(p);
    ctx.strokeStyle = `rgba(${col},${a * Math.sin(ph * Math.PI)})`; ctx.lineWidth = (10 + 14 * hash(i + seed)) * z;
    ctx.beginPath();
    for (let s = 0; s <= 12; s++) {
      const u = s / 12, yy = y0 - (ph * rise + u * 160) * z, xx = x0 + (hash(i * 3 + seed) - .5) * spread * z + 26 * z * Math.sin(u * 5 + t * 1.3 + i) * (u + ph);
      s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  }
  reset(ctx);
}
// dust motes floating in the lamplight
function motes(t, n = 40, seed = 3) {
  reset(ctx); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const x = (hash(i + seed) * W + t * 9 * (hash(i * 5) - .3) + 30 * Math.sin(t * .4 + i)) % W, y = (hash(i * 3 + seed) * H - t * 12 * hash(i * 7)) % H;
    const a = .25 * (.5 + .5 * Math.sin(t * 1.7 + i * 2.1)), r = 1.2 + 2.2 * hash(i * 11);
    ctx.fillStyle = `rgba(255,225,170,${a})`; ctx.beginPath(); ctx.arc((x + W) % W, (y + H) % H, r, 0, Math.PI * 2); ctx.fill();
  }
  reset(ctx);
}
// paper look on top of the engravings: warm grade + subtle vignette (grain comes from post)
function paper(k = 1) { grade(`rgba(255,236,200,${.06 * k})`, 'multiply'); }

// irregular ink-bleed circle used to reveal one picture inside another
function inkPath(g, x, y, r, seed) {
  g.beginPath();
  for (let i = 0; i <= 72; i++) {
    const a = i / 72 * Math.PI * 2, rr = r * (1 + .07 * noise1(a * 3 + seed) + .035 * noise1(a * 11 + seed * 2));
    i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  g.closePath();
}
// Scenes draw on ctx, so: snapshot the current frame, draw the inner scene, keep it in a buffer, restore the
// snapshot and composite the inner scene through the mask.
function revealInside(drawInner, x, y, r, seed, edgeCol) {
  const snap = BUF[3].getContext('2d'), g = BUF[2].getContext('2d');
  reset(snap); snap.clearRect(0, 0, W, H); snap.drawImage(cv, 0, 0);
  reset(ctx); ctx.clearRect(0, 0, W, H); drawInner();
  reset(g); g.clearRect(0, 0, W, H); g.drawImage(cv, 0, 0);
  g.globalCompositeOperation = 'destination-in'; inkPath(g, x, y, r, seed); g.fillStyle = '#000'; g.fill(); reset(g);
  reset(ctx); ctx.clearRect(0, 0, W, H); ctx.drawImage(BUF[3], 0, 0); ctx.drawImage(BUF[2], 0, 0);
  if (edgeCol) { reset(ctx); ctx.filter = 'blur(10px)'; ctx.strokeStyle = edgeCol; ctx.lineWidth = 22; inkPath(ctx, x, y, r, seed); ctx.stroke(); reset(ctx); }
}

function shotA(t) {
  // slow push from the whole lab towards the flask; the crystals start to glow and melt as the flame works
  const k = E.io(seg(t, 0, T.AB + .5)), z = lerp(1.07, 1.30, k), fx = lerp(540, 532, k), fy = lerp(955, 900, k);
  const m = engr(IMG.A, z, fx, fy, W / 2, lerp(H / 2, H / 2 - 40, k));
  reset(ctx); ctx.fillStyle = '#1a120b'; // (no edge visible: zoom ≥ 1.07 crops the deckled border)
  const fl = lampLight(t, m, [532, 1092], 1);
  const melt = E.io(seg(t, 4.6, 8.2)); // "тает и легко течёт": the yellow pool brightens, liquid gleam
  const [cx, cy] = m([532, 942]);
  radialGlow(ctx, cx, cy, 120 * z, `rgba(255,214,60,${(.12 + .3 * melt) * fl})`, 'screen');
  reset(ctx); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = melt * .5;
  ctx.fillStyle = 'rgba(255,240,170,.6)'; ctx.beginPath(); ctx.ellipse(cx - 22 * z + 8 * Math.sin(t * 2), cy - 6 * z, 34 * z, 6 * z, -.15, 0, Math.PI * 2); ctx.fill(); reset(ctx);
  wisps(t, m, [532, 690], { n: 6, a: .10 + .08 * melt, z, seed: 2 });
  motes(t, 36, 3); paper();
}
function shotB(t, dive = 0) {
  // he tilts the flask: the dark mass clings to the glass; a viscous drip stretches very slowly
  // dive (0..1) = the camera plunges into the dark mass in the flask (transition to the grid)
  const k = E.io(seg(t, T.AB - .4, T.toGrid)), z = lerp(1.12, 1.36, k) * (1 + dive * 3.2), fx = lerp(lerp(540, 520, k), 545, dive), fy = lerp(lerp(930, 760, k), 640, dive);
  const m = engr(IMG.B, z, fx, fy, W / 2, H / 2);
  const fl = lampLight(t, m, [528, 1125], .95);
  const [mx, my] = m([540, 620]);
  radialGlow(ctx, mx, my, 150 * z, `rgba(200,70,20,${.16 * fl})`, 'screen');
  wisps(t, m, [560, 470], { n: 6, a: .12, z, seed: 5 });
  motes(t, 30, 9); paper();
}
function shotC(t) {
  // the rubbery strand; steam from the bucket; slow push to the strand
  const k = E.io(seg(t, T.toC, DURATION)), z = lerp(1.18, 1.10, k), fx = lerp(520, 540, k), fy = lerp(820, 900, k);
  const m = engr(IMG.C, z, fx, fy, W / 2, H / 2);
  // strand gleam: a highlight travelling down the stretched sulfur on "резина"
  const sh = seg(t, 36.8, 38.6);
  if (sh > 0 && sh < 1) {
    const [ax, ay] = m([800, 240]), [bx, by] = m([505, 1240]), px = lerp(ax, bx, sh), py = lerp(ay, by, sh);
    radialGlow(ctx, px, py, 120 * z, `rgba(255,200,110,${.45 * Math.sin(sh * Math.PI)})`, 'screen');
  }
  radialGlow(ctx, ...m([480, 1300]), 260 * z, 'rgba(170,200,210,.10)', 'screen');
  wisps(t, m, [490, 1290], { n: 9, rise: 520, col: '235,240,240', a: .17, spread: 260, z, seed: 11 });
  motes(t, 30, 21); paper();
}

// ---------------- blue grid (style card 21) ----------------
const BLUE = { bg0: '#0E1F48', bg1: '#040A20', line: 'rgba(120,155,255,', txt: '#8FA3D6', hi: '#F5A524', red: '#FF5A4E', cyan: '#6FD3FF', word: '#C9D3F0' };
function gridBG(t, zoom = 1, cx = W / 2, cy = 820) {
  reset(ctx);
  const gr = ctx.createRadialGradient(W / 2, 760, 60, W / 2, 900, 1250); gr.addColorStop(0, BLUE.bg0); gr.addColorStop(1, BLUE.bg1);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const s = 54 * zoom, ox = (cx - W / 2) * 0 + ((W / 2 - cx * zoom) % s + s) % s, oy = ((cy - cy * zoom) % s + s) % s;
  for (let i = -1, x = ox - s; x < W + s; x += s, i++) { ctx.fillStyle = BLUE.line + (i % 4 === 0 ? .13 : .06) + ')'; ctx.fillRect(Math.round(x), 0, 1, H); }
  for (let j = -1, y = oy - s; y < H + s; y += s, j++) { ctx.fillStyle = BLUE.line + (j % 4 === 0 ? .13 : .06) + ')'; ctx.fillRect(0, Math.round(y), W, 1); }
  radialGlow(ctx, W / 2, 820, 700, 'rgba(60,110,255,.10)', 'screen');
}
// atom sprites: glossy spheres from sulfur yellow to polymeric dark red-brown (baked once, 9 steps)
const ATOM_COLS = ['#F2C531', '#F0B52A', '#EC9C25', '#E28422', '#D46B20', '#C4561E', '#B2461C', '#9C3A1A', '#873118'];
function atomSpr(i) {
  return bake('atom' + i, 132, 132, 66, 66, g => {
    const c = ATOM_COLS[i], gr = g.createRadialGradient(48, 44, 4, 66, 66, 62);
    gr.addColorStop(0, '#FFF8D8'); gr.addColorStop(.18, mixColor(c, '#ffffff', .35)); gr.addColorStop(.62, c); gr.addColorStop(1, mixColor(c, '#1a0c04', .65));
    g.fillStyle = gr; g.beginPath(); g.arc(66, 66, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(46, 40, 16, 10, -.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(120,190,255,.35)'; g.lineWidth = 3; g.beginPath(); g.arc(66, 66, 59, .3, 1.9); g.stroke(); // cool rim light from the grid
  });
}
function drawAtom(x, y, r, col01, a = 1) {
  const f = clamp(col01) * (ATOM_COLS.length - 1), i = Math.floor(f), u = f - i;
  drawSpr(ctx, atomSpr(i), x, y, r / 60, a * (1 - u));
  if (u > 0 && i + 1 < ATOM_COLS.length) drawSpr(ctx, atomSpr(i + 1), x, y, r / 60, a * u);
}
// S8 crown: 8 atoms on a circle, alternating up/down; rotate (ax, ay) and project with mild perspective
function crown(i, R, ax, ay, az) {
  const a = i / 8 * Math.PI * 2, h = R * .32 * (i % 2 ? 1 : -1);
  let x = Math.cos(a) * R, y = Math.sin(a) * R, z = h;
  let c = Math.cos(az), s = Math.sin(az); [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(ax); s = Math.sin(ax); [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ay); s = Math.sin(ay); [x, z] = [x * c + z * s, -x * s + z * c];
  return [x, y, z];
}
// 16 rings; rings 0..11 become 3 chains of 32 atoms, rings 12..15 stay rings (not every ring opens)
const NR = 16, CHAIN_OF = r => r < 12 ? Math.floor(r / 4) : -1;
const RING = Array.from({ length: NR }, (_, r) => {
  const col = r % 4, row = Math.floor(r / 4);
  return { bx: 170 + col * 247 + (hash(r * 3) - .5) * 90, by: 450 + row * 190 + (hash(r * 5) - .5) * 60, ph: hash(r * 7) * 6.28, dir: row % 2 ? 1 : -1,
    tb: 25.55 + (r < 12 ? hash(r * 13) * 1.35 : 99), spin: .35 + .3 * hash(r * 17) };
});
// main ring for the close-up: ring 5 sits near the centre of the field
const HERO = 5;
// time warp: motion slows down as the melt becomes viscous (integral of speed → smooth, no jumps)
function speedAt(t) { return t < 28.8 ? 1 : lerp(1, .12, E.io(seg(t, 28.8, 31.5))); }
function phaseAt(t) { let p = 0; for (let x = 15; x < t; x += 1 / 30) p += speedAt(x) / 30; return p; }
// chain path k: a meandering curve across the field; s in [0,1]
function chainPt(k, s, ph) {
  const x0 = 540 + [-60, 40, 10][k], y0 = 800 + [-250, -40, 170][k], ang = [-.12, .24, -.14][k];
  const L = 980, u = (s - .5) * L, wob = 105 * Math.sin(s * 7.5 + k * 2 + ph * .6) + 60 * Math.sin(s * 15 + k + ph * .9);
  return [x0 + Math.cos(ang) * u - Math.sin(ang) * wob, y0 + Math.sin(ang) * u + Math.cos(ang) * wob];
}

function gridScene(t) {
  const ph = phaseAt(t);
  // camera: start on the hero ring at 3.2×, pull back to the whole melt on "Кольца скользят", drift slowly
  const pull = E.io(seg(t, 19.0, 20.6)), zoom = lerp(3.0, 1, pull) * lerp(1, 1.06, seg(t, 20.6, 33));
  const hero = RING[HERO], hx = hero.bx, hy = hero.by;
  const cx = lerp(hx, 540, pull), cy = lerp(hy, 820, pull);
  const S = p => [W / 2 + (p[0] - cx) * zoom, 820 + (p[1] - cy) * zoom];
  gridBG(t, zoom, cx, cy);

  const melted = seg(t, 19.6, 21.0), polym = E.io(seg(t, 25.5, 28.0)), dark = E.io(seg(t, 28.3, 32.0));
  const atoms = [], bonds = [];
  const others = E.o(seg(t, 19.2, 20.4));
  const chainAtoms = [[], [], []];
  for (let r = 0; r < NR; r++) {
    const R0 = RING[r], isHero = r === HERO;
    const vis = isHero ? 1 : others;
    if (vis <= 0) continue;
    // liquid flow: rows shear past each other once melted (solid → still)
    const flow = melted * R0.dir * 70 * Math.sin(ph * .55 + R0.ph), bob = melted * 18 * Math.sin(ph * 1.3 + R0.ph * 2);
    const rx = R0.bx + flow, ry = R0.by + bob;
    const ax = .55 + .2 * Math.sin(ph * .5 + R0.ph), ay = ph * R0.spin + R0.ph, az = ph * .2;
    const u = CHAIN_OF(r) < 0 ? 0 : E.io(seg(t, R0.tb, R0.tb + 1.1)); // ring → chain morph
    const base = atoms.length;
    for (let i = 0; i < 8; i++) {
      const pop = isHero ? E.back(seg(t, 15.45 + i * .11, 15.75 + i * .11)) : 1; // atoms of the hero ring pop in one by one
      const [x, y, z] = crown(i, 44, ax, ay, az);
      let px = rx + x, py = ry + y, pz = z;
      if (u > 0) {
        const k = CHAIN_OF(r), j = (r % 4) * 8 + i, s = (j + .5) / 32;
        const [qx, qy] = chainPt(k, s, ph), zig = (j % 2 ? 1 : -1) * 11;
        px = lerp(px, qx + zig * .7, u); py = lerp(py, qy - zig * .7, u); pz = lerp(pz, zig, u);
        chainAtoms[k][j] = atoms.length;
      }
      atoms.push({ p: S([px, py]), z: pz, r: 11.5 * zoom * Math.max(0, pop), pop: clamp(pop), a: vis, col: (polym * .45 + dark * .55) * (CHAIN_OF(r) < 0 ? .55 : 1), ring: r, i, u });
    }
    // ring bonds; the closing bond (7–0) snaps when the ring opens
    for (let i = 0; i < 8; i++) {
      const a = base + i, b = base + (i + 1) % 8;
      if (i === 7 && u > 0) continue;
      const al = vis * Math.min(atoms[a].pop, atoms[b].pop); if (al > 0) bonds.push([a, b, al]);
    }
  }
  // inter-ring links inside a chain appear once neighbours have arrived ("сцепляются")
  chainAtoms.forEach(arr => { for (let j = 7; j < 31; j += 8) { const a = arr[j], b = arr[j + 1]; if (a == null || b == null) continue; const lk = Math.min(atoms[a].u, atoms[b].u); if (lk > .85) bonds.push([a, b, seg(lk, .85, 1)]); } });

  // bonds under atoms
  reset(ctx); ctx.lineCap = 'round';
  for (const [a, b, al] of bonds) {
    const A = atoms[a], B = atoms[b];
    ctx.strokeStyle = `rgba(255,214,120,${.55 * al})`; ctx.lineWidth = 7 * zoom; ctx.beginPath(); ctx.moveTo(...A.p); ctx.lineTo(...B.p); ctx.stroke();
    ctx.strokeStyle = `rgba(255,248,220,${.35 * al})`; ctx.lineWidth = 3 * zoom; ctx.stroke();
  }
  atoms.slice().sort((p, q) => p.z - q.z).forEach(A => drawAtom(A.p[0], A.p[1], A.r * (1 + A.z / 400), A.col, A.a));

  // sparks where rings snap open
  for (let r = 0; r < 12; r++) {
    const R0 = RING[r], sp = seg(t, R0.tb - .05, R0.tb + .45);
    if (sp <= 0 || sp >= 1) continue;
    const idx = atoms.findIndex(A => A.ring === r && A.i === 0); if (idx < 0) continue;
    const [x, y] = atoms[idx].p;
    radialGlow(ctx, x, y, 90 * (1 - sp * .5), `rgba(255,250,220,${.9 * (1 - sp)})`, 'screen');
    reset(ctx); ctx.strokeStyle = `rgba(255,240,200,${1 - sp})`; ctx.lineWidth = 3;
    for (let q = 0; q < 6; q++) { const a = q / 6 * 6.28 + r, d0 = 14 + sp * 40, d1 = d0 + 18 * (1 - sp); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0); ctx.lineTo(x + Math.cos(a) * d1, y + Math.sin(a) * d1); ctx.stroke(); }
    reset(ctx);
  }
  // hero labels during the close-up
  const lab = seg(t, 16.4, 16.9) * (1 - seg(t, 18.9, 19.4));
  if (lab > 0) {
    const [x, y] = S([hx, hy]);
    reset(ctx); ctx.globalAlpha = lab; ctx.font = '500 44px Mono'; ctx.textAlign = 'center'; ctx.fillStyle = BLUE.word; ctx.fillText('S₈', x, y + 16);
    const c8 = seg(t, 17.1, 17.5);
    ctx.globalAlpha = lab * c8; ctx.font = '700 40px Man'; ctx.fillStyle = BLUE.hi; ctx.fillText('8 атомов', x, y + 230);
    ctx.strokeStyle = `rgba(245,165,36,${.6 * lab * c8})`; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(x, y, 178, 0, Math.PI * 2); ctx.stroke();
    reset(ctx);
  }
  hud(t);
}

function fmtNum(v, d) { return v.toFixed(d).replace('.', ','); }
function hud(t) {
  reset(ctx);
  // top-left: series tag + progress
  ctx.font = '500 30px Mono'; ctx.fillStyle = '#E8EEFF'; ctx.fillText('kuanysh.chem', 60, 120);
  ctx.fillStyle = BLUE.txt; ctx.fillText(' · сера', 60 + ctx.measureText('kuanysh.chem').width, 120);
  ctx.fillStyle = 'rgba(143,163,214,.25)'; ctx.fillRect(60, 140, 300, 4); ctx.fillStyle = BLUE.cyan; ctx.fillRect(60, 140, 300 * seg(t, T.gridIn, T.toC), 4);
  // top-right: live variables
  const temp = track([[15, 25], [19.6, 25], [21.0, 120], [23.3, 120], [24.7, 160], [28.6, 165], [31.6, 190]], t);
  const vLog = track([[15, Math.log10(.007)], [29.6, Math.log10(.007)], [32.0, Math.log10(93)]], t);
  const ringsPct = Math.round(lerp(100, 25, E.io(seg(t, 25.5, 28.0))));
  const rows = [
    ['температура', `${Math.round(temp)} °C`, temp >= 159 ? BLUE.red : BLUE.hi],
    ['состояние', t < 20.9 ? 'твёрдая' : 'жидкая', BLUE.word],
    ['вязкость', t < 20.9 ? '—' : `${fmtNum(Math.pow(10, vLog), vLog < -1 ? 3 : vLog < 1 ? 2 : 0)} Па·с`, vLog > -1 ? BLUE.red : BLUE.hi],
    ['кольца S₈', `${ringsPct} %`, ringsPct < 100 ? BLUE.red : BLUE.hi],
  ];
  ctx.textAlign = 'right';
  rows.forEach(([k, v, c], i) => {
    const y = 124 + i * 52; ctx.font = '500 34px Mono'; ctx.fillStyle = c; ctx.fillText(v, 1020, y);
    const vw = ctx.measureText(v).width; ctx.fillStyle = BLUE.txt; ctx.fillText(k + ': ', 1020 - vw, y);
  });
  reset(ctx);
  // temperature scale at the bottom with events
  const sx0 = 110, sx1 = 970, sy = 1400, X = v => lerp(sx0, sx1, (v - 20) / 180);
  ctx.fillStyle = 'rgba(232,238,255,.85)'; ctx.fillRect(sx0, sy, sx1 - sx0, 2);
  ctx.font = '500 28px Mono'; ctx.textAlign = 'center';
  for (let v = 20; v <= 200; v += 10) { const big = v % 40 === 0; ctx.fillStyle = 'rgba(232,238,255,.85)'; ctx.fillRect(X(v), sy - (big ? 14 : 8), 2, big ? 28 : 16); if (big) { ctx.fillStyle = BLUE.txt; ctx.fillText(String(v), X(v), sy + 48); } }
  const ev = (v, label, t0, col) => { const a = seg(t, t0, t0 + .4); if (a <= 0) return; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(X(v) - 1, sy - 70, 2, 56); ctx.font = '700 30px Man'; ctx.fillText(label, X(v), sy - 82); ctx.globalAlpha = 1; };
  ev(115, '115° тает', 20.7, BLUE.cyan);
  ev(159, '159° кольца рвутся', 24.7, BLUE.red);
  // slider
  ctx.fillStyle = temp >= 159 ? BLUE.red : BLUE.hi; ctx.beginPath(); ctx.moveTo(X(temp), sy - 6); ctx.lineTo(X(temp) - 14, sy - 30); ctx.lineTo(X(temp) + 14, sy - 30); ctx.closePath(); ctx.fill();
  radialGlow(ctx, X(temp), sy, 60, rgba(temp >= 159 ? BLUE.red : BLUE.hi, .35), 'screen');
  // viscosity bar (log scale) with ×10 000 badge
  reset(ctx);
  const by = 1512, bw = 860, frac = seg(vLog, Math.log10(.007), Math.log10(93));
  if (t > 20.9) {
    ctx.font = '500 28px Mono'; ctx.fillStyle = BLUE.txt; ctx.fillText('вязкость (лог. шкала)', sx0, by - 14);
    ctx.fillStyle = 'rgba(143,163,214,.18)'; ctx.fillRect(sx0, by, bw, 14);
    const g = ctx.createLinearGradient(sx0, 0, sx0 + bw, 0); g.addColorStop(0, BLUE.hi); g.addColorStop(1, BLUE.red);
    ctx.fillStyle = g; ctx.fillRect(sx0, by, 14 + (bw - 14) * frac, 14);
    const bd = E.back(seg(t, 31.45, 31.85));
    if (bd > 0) {
      ctx.save(); ctx.translate(sx0 + bw - 110, by - 26); ctx.scale(bd, bd);
      ctx.fillStyle = BLUE.red; roundRect(ctx, -110, -30, 220, 56, 14); ctx.fill();
      ctx.font = '800 34px Unb'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('×10 000', 0, 9); ctx.restore();
    }
  }
  reset(ctx);
  // the big word of each beat (stellan-style), between scale and captions
  bigWord(t, 'КОЛЬЦА', 16.45, 19.5);
  bigWord(t, 'ЦЕПИ', 27.7, 32.9, BLUE.red);
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function bigWord(t, word, t0, t1, col = BLUE.word) {
  const a = E.o(seg(t, t0, t0 + .35)) * (1 - E.io(seg(t, t1 - .4, t1))); if (a <= 0) return;
  reset(ctx); ctx.globalAlpha = a; ctx.font = '800 110px Unb'; ctx.textAlign = 'center'; ctx.letterSpacing = `${lerp(30, 6, E.o(seg(t, t0, t0 + .6)))}px`;
  ctx.fillStyle = col; ctx.shadowColor = rgba(col.length === 7 ? col : '#C9D3F0', .5); ctx.shadowBlur = 30;
  ctx.fillText(word, W / 2, 1290 + (1 - a) * 30); reset(ctx);
}

// ---------------- transitions ----------------
function toGrid(t) { // dive into the dark mass of the flask; the grid opens out of it through an ink-edged hole
  const k = seg(t, T.toGrid, T.gridIn), dive = E.i(k);
  shotB(t, dive);
  grade(`rgba(70,15,5,${dive * .7})`, 'multiply');
  const r = E.i(seg(k, .35, 1)) * 1300;
  if (r > 1) revealInside(() => gridScene(t), W / 2, H / 2 - 120, r, 4, `rgba(111,211,255,${.8 * (1 - k)})`);
  if (k > .3) { const f = pulse(k, .3, .55, .9); radialGlow(ctx, W / 2, H / 2 - 120, 500, `rgba(150,220,255,${.35 * f})`, 'screen'); }
}
function toC(t) { // the grid shrinks into the stretched strand; the engraving returns around it
  const k = seg(t, T.toC, T.cIn);
  shotC(t);
  const r = (1 - E.io(k)) * 1400;
  if (r > 1) revealInside(() => gridScene(t), 520, 900, r, 9, `rgba(255,200,120,${.7 * (1 - k)})`);
  radialGlow(ctx, 520, 900, 420, `rgba(255,220,170,${.4 * pulse(k, 0, .7, 1)})`, 'screen');
}

// ---------------- titles & captions ----------------
function engrCaps(t) {
  captions(t, TLX.filter(L => ['L01', 'L02', 'L03', 'L04', 'L09', 'L10'].includes(L.id)),
    { font: 'Corm', weight: '600', size: 70, color: '#FFF4E0', bottom: 330, maxW: .86, backing: .85, emph: { 'смола.': 'accent', 'резина.': 'accent', 'гуще?': 'accent' }, accent: '#F2B14A' });
}
function gridCaps(t) {
  captions(t, TLX.filter(L => ['L05', 'L06', 'L07', 'L08'].includes(L.id)),
    { font: 'Man', weight: '700', size: 48, color: '#E8EEFF', bottom: 250, maxW: .84, backing: .0, emph: { 'восемь': 'accent', 'рвутся': 'accent', 'цепи.': 'accent', 'тысяч': 'accent' }, accent: BLUE.hi });
}
function titleCard(t) {
  const a = E.io(seg(t, T.title, T.title + 1.0)); if (a <= 0) return;
  reset(ctx); ctx.fillStyle = vgrad(ctx, H * .45, H, [[0, 'rgba(20,12,6,0)'], [.45, `rgba(20,12,6,${.75 * a})`], [1, `rgba(12,7,3,${.92 * a})`]]); ctx.fillRect(0, H * .45, W, H * .55);
  titleReveal('СЕРА', W / 2, 1460, t, T.title + .2, { font: '700 190px CormSC', color: '#F6E3B8', dur: 1.1, stagger: .09, track0: 4, track1: 30, glow: 'rgba(255,190,80,.45)' });
  const b = E.o(seg(t, T.title + 1.0, T.title + 1.8));
  reset(ctx); ctx.globalAlpha = b; ctx.textAlign = 'center'; ctx.font = 'italic 600 50px CormI'; ctx.fillStyle = '#E9D7B4';
  ctx.fillText('кольца, цепи и резина', W / 2, 1600);
  ctx.font = '500 26px Mono'; ctx.fillStyle = 'rgba(233,215,180,.75)'; ctx.fillText('S · 16 · KUANYSH CHEMISTRY', W / 2, 1680); reset(ctx);
}

// ---------------- film ----------------
const film = makeRenderer([
  [0, T.AB, t => shotA(t)],
  [T.AB, T.toGrid, t => {
    // the picture changes through an ink bleed that spreads from the flask
    const k = seg(t, T.AB, T.AB + 1.1);
    shotA(t);
    if (k > 0) revealInside(() => shotB(t), 540, 700, E.io(k) * 1500, 2, `rgba(60,25,10,${.6 * (1 - k)})`);
  }],
  [T.toGrid, T.gridIn, toGrid],
  [T.gridIn, T.toC, gridScene],
  [T.toC, T.cIn, toC],
  [T.cIn, DURATION, shotC],
], {
  overlays: t => { post(t, { vig: t > T.gridIn && t < T.toC ? .45 : .62, grain: t > T.gridIn && t < T.toC ? .035 : .07 }); },
  texts: t => {
    if (t < T.gridIn + .2 || t > T.toC) engrCaps(t); else gridCaps(t);
    titleCard(t);
    const fade = seg(t, DURATION - 1.0, DURATION); if (fade > 0) { reset(ctx); ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  },
});
window.renderAt = film;
