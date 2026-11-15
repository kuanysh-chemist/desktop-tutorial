// Characters v2: articulated arms (2-bone IK), hands, idle motion (breathing, blinking, saccades),
// head tilt / turn / nod, expressive face with eyes, lips, shading.
/* global B, INK, TAU, K, clamp, lerp, hash, xf, ell, shape, path, mixHex */

// ---------- hands ----------
// hand(x, y, ang, s, o): (x,y) = grip centre, ang = direction from the hand towards the forearm.
function hand(x, y, ang, s = 1, o = {}) {
  const skin = o.skin || '#f0b994';
  const id = 'hd' + (o.id || '');
  const R = (pts) => xf(pts, { x, y, s, r: ang + Math.PI });
  const shade = mixHex(skin, '#8a4a30', 0.35);
  if (o.type === 'open') { // flat hand, fingers forward
    shape(R([[-30, -20], [0, -24], [16, -18], [18, 18], [0, 24], [-30, 20]]), { fill: skin, op: 235, bleed: 0.03, tex: 0.2, border: 0.2, line: INK, w: 1.4, curve: 0.5, id: id + 'p', solid: true });
    const fingers = [[-15, 30, 5.5], [-5, 40, 6], [5, 42, 6], [15, 36, 5.5]];
    fingers.forEach(([oy, len, w], i) => {
      const spread = (i - 1.5) * 0.08 + (o.curl || 0) * 0.0;
      const ax = 14, ay = oy * 1.05;
      const ex = ax + Math.cos(spread) * len, ey = ay + Math.sin(spread) * len;
      shape(R([[ax, ay - w], [ex, ey - w * 0.8], [ex + w * 0.8, ey], [ex, ey + w * 0.8], [ax, ay + w]]), { fill: skin, op: 235, bleed: 0.02, tex: 0.15, border: 0.15, line: INK, w: 1.1, curve: 0.45, id: id + 'f' + i, solid: true });
      path(R([[ex - 9, ey - 3], [ex - 3, ey - 3]]), 'HB', shade, 0.7, { id: id + 'n' + i });
    });
    shape(R([[-14, -22], [8, -38], [22, -44], [26, -36], [6, -20]]), { fill: skin, op: 235, line: INK, w: 1.2, curve: 0.5, id: id + 'th', solid: true });
    return;
  }
  // fist / grip
  const f = [[-30, -20], [-8, -27], [16, -26], [34, -16], [38, 2], [34, 22], [12, 30], [-18, 27], [-32, 12]];
  shape(R(f), { fill: skin, op: 238, bleed: 0.03, tex: 0.2, border: 0.2, line: INK, w: 1.6, curve: 0.55, id: id + 'f', solid: true });
  // shadow on lower part of fist
  shape(R([[-26, 14], [10, 22], [32, 16], [30, 26], [8, 30], [-18, 27]]), { fill: shade, op: 90, bleed: 0.1, tex: 0.1, curve: 0.5, id: id + 'sh', boil: false });
  // knuckles + finger creases
  for (let i = 0; i < 4; i++) {
    const yy = -18 + i * 11;
    path(R([[18, yy], [36, yy + 1.5]]), 'HB', INK, 1.0, { id: id + 'c' + i });
    path(R([[30, yy - 4], [37, yy + 2]]), 'HB', shade, 0.7, { id: id + 'k' + i });
  }
  // thumb wrapped over the fingers
  shape(R([[-22, -24], [2, -34], [22, -30], [26, -22], [6, -20], [-14, -16]]), { fill: mixHex(skin, '#ffffff', 0.08), op: 238, line: INK, w: 1.3, curve: 0.55, id: id + 't', solid: true });
  path(R([[16, -31], [22, -26]]), 'HB', shade, 0.8, { id: id + 'tn' });
}

function tube(x1, y1, w1, x2, y2, w2) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  return [[x1 + nx * w1, y1 + ny * w1], [x2 + nx * w2, y2 + ny * w2], [x2 - nx * w2, y2 - ny * w2], [x1 - nx * w1, y1 - ny * w1]];
}
function ik(sx, sy, hx, hy, L1, L2, bend) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
  const maxd = L1 + L2 - 0.5;
  if (d > maxd) { hx = sx + dx / d * maxd; hy = sy + dy / d * maxd; d = maxd; }
  d = Math.max(d, Math.abs(L1 - L2) + 1);
  const a = Math.atan2(hy - sy, hx - sx);
  const A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const ea = a + bend * A;
  return { ex: sx + Math.cos(ea) * L1, ey: sy + Math.sin(ea) * L1, hx, hy };
}
// Arm from shoulder (sx,sy) to hand grip (tx,ty). bend: +1 / -1 elbow side.
function arm(sx, sy, tx, ty, s, o = {}) {
  const id = 'arm' + (o.id || '');
  const sleeve = o.sleeve || '#3c5a8a';
  const reach = 22 * s;
  const L1 = 118 * s, L2 = 104 * s;
  // solve for the wrist so the hand lands on the target
  const dx0 = tx - sx, dy0 = ty - sy, d0 = Math.hypot(dx0, dy0) || 1;
  const wx0 = tx - dx0 / d0 * reach, wy0 = ty - dy0 / d0 * reach;
  const { ex, ey, hx: wx, hy: wy } = ik(sx, sy, wx0, wy0, L1, L2, o.bend ?? 1);
  const fa = Math.atan2(wy - ey, wx - ex);
  const hx = wx + Math.cos(fa) * reach, hy = wy + Math.sin(fa) * reach;
  const up = tube(sx, sy, 34 * s, ex, ey, 26 * s), fo = tube(ex, ey, 26 * s, wx, wy, 21 * s);
  const ea = [(up[1][0] + fo[0][0]) / 2, (up[1][1] + fo[0][1]) / 2], eb = [(up[2][0] + fo[3][0]) / 2, (up[2][1] + fo[3][1]) / 2];
  const poly = [up[0], ea, fo[1], fo[2], eb, up[3]];
  shape(poly, { fill: sleeve, op: 232, bleed: 0.04, tex: 0.45, border: 0.3, line: INK, w: 1.5, curve: 0.35, id: id + 's', solid: true });
  // shading along the lower edge of the sleeve
  shape([up[3], eb, fo[2], [lerp(fo[2][0], fo[1][0], 0.35), lerp(fo[2][1], fo[1][1], 0.35)], [lerp(eb[0], ea[0], 0.35), lerp(eb[1], ea[1], 0.35)], [lerp(up[3][0], up[0][0], 0.35), lerp(up[3][1], up[0][1], 0.35)]], { fill: mixHex(sleeve, '#000000', 0.35), op: 110, bleed: 0.06, tex: 0.2, curve: 0.3, id: id + 'sh', boil: false });
  // elbow folds
  for (let i = 0; i < 2; i++) {
    const k = 0.35 + i * 0.25;
    path([[lerp(ex, ea[0], k), lerp(ey, ea[1], k)], [lerp(ex, eb[0], k * 0.6), lerp(ey, eb[1], k * 0.6)]], 'HB', mixHex(sleeve, '#000000', 0.5), 1.0, { id: id + 'fo' + i, curve: 0.5 });
  }
  // cuff
  const cf = tube(wx - Math.cos(fa) * 16 * s, wy - Math.sin(fa) * 16 * s, 23 * s, wx + Math.cos(fa) * 2 * s, wy + Math.sin(fa) * 2 * s, 23 * s);
  shape(cf, { wash: o.cuff || mixHex(sleeve, '#000000', 0.25), line: INK, w: 1.2, curve: 0.15, id: id + 'c' });
  if (o.item) o.item(hx, hy, fa);
  hand(hx, hy, o.handAng ?? fa + Math.PI, s * (o.handScale ?? 0.95), { id: o.id, skin: o.skin, type: o.hand });
  return { ex, ey, wx, wy, hx, hy, fa };
}

// Arm entering from off-screen: sleeve from (x,y) backwards along `ang`, with a soft bend.
function fist(x, y, ang, s = 1, o = {}) {
  const sleeve = o.sleeve || '#3c5a8a';
  const c = Math.cos(ang), sn = Math.sin(ang);
  const wx = x + c * 26 * s, wy = y + sn * 26 * s;
  const bend = o.bend ?? 0.18;
  const ex = wx + Math.cos(ang + bend) * 150 * s, ey = wy + Math.sin(ang + bend) * 150 * s;
  const sx = ex + Math.cos(ang - bend * 0.5) * 200 * s, sy = ey + Math.sin(ang - bend * 0.5) * 200 * s;
  const fo = tube(wx, wy, 22 * s, ex, ey, 28 * s), up = tube(ex, ey, 28 * s, sx, sy, 34 * s);
  const poly = [fo[0], [(fo[1][0] + up[0][0]) / 2, (fo[1][1] + up[0][1]) / 2], up[1], up[2], [(fo[2][0] + up[3][0]) / 2, (fo[2][1] + up[3][1]) / 2], fo[3]];
  shape(poly, { fill: sleeve, op: 232, bleed: 0.04, tex: 0.45, border: 0.3, line: INK, w: 1.5, curve: 0.35, id: 'fsl' + (o.id || ''), solid: true });
  shape([fo[3], fo[2], up[3], up[2], [lerp(up[2][0], up[1][0], 0.35), lerp(up[2][1], up[1][1], 0.35)], [lerp(fo[3][0], fo[0][0], 0.35), lerp(fo[3][1], fo[0][1], 0.35)]], { fill: mixHex(sleeve, '#000000', 0.35), op: 100, bleed: 0.06, tex: 0.2, curve: 0.3, id: 'fss' + (o.id || ''), boil: false });
  for (let i = 0; i < 3; i++) {
    const k = 0.25 + i * 0.12;
    path([[lerp(wx, ex, k + 0.3) + (-sn) * 14 * s, lerp(wy, ey, k + 0.3) + c * 14 * s], [lerp(wx, ex, k + 0.36) - (-sn) * 6 * s, lerp(wy, ey, k + 0.36) - c * 6 * s]], 'HB', mixHex(sleeve, '#000000', 0.5), 1.0, { id: 'ffd' + i + (o.id || ''), curve: 0.4 });
  }
  const cf = tube(wx, wy, 23 * s, wx + c * 18 * s, wy + sn * 18 * s, 24 * s);
  shape(cf, { wash: o.cuff || mixHex(sleeve, '#000000', 0.25), line: INK, w: 1.2, curve: 0.15, id: 'fcf' + (o.id || '') });
  hand(x, y, ang, s, { id: o.id, skin: o.skin, type: o.hand });
}

// ---------- person ----------
// Bust in 3/4-front view. Head centre at local (0,0), head ~120x152, shoulders at (±112, 150).
// opt: id, t, skin, hair, hairStyle(bun|curly|bald|short|wavy|scarf), coat, collar(white|shawl|cravat|band|hoodie),
//      shawl, scarf, apron, mustache, beard, sideburns, iris, female, age, buttons, jawGlow,
//      pose: { tilt, turn(-1..1), nod, lean, look:[x,y], mouth(0..1), smile(-1..1), brow(-1..1), worry(0..1),
//              frown(0..1), eyes:'open'|'closed'|'wide'|'squint', blow(0..1) },
//      arms: [{ side:'L'|'R', to:[wx,wy], hand:'fist'|'open', front, bend, handAng }]
function person(x, y, s, opt = {}) {
  const id = opt.id || 'p';
  const P = opt.pose || {};
  const t = opt.t ?? K.t;
  const sd0 = hash(id) % 97;
  const skin = opt.skin || '#f0bb94';
  const skinSh = mixHex(skin, '#9a4a2a', 0.32);
  const coat = opt.coat || '#2f5a8a';
  const hair = opt.hair || '#4a2a18';
  const hairHi = mixHex(hair, '#ffffff', 0.35);
  const br = Math.sin(t * TAU * 0.26 + sd0);
  const tilt = P.tilt || 0, lean = P.lean || 0, nod = (P.nod || 0) - br * 1.3, turn = P.turn || 0;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const Hl = (p) => { const dx = p[0], dy = p[1] - 95; return [dx * ct - dy * st + lean, dx * st + dy * ct + 95 + nod]; };
  const H = (pts) => xf(pts.map(Hl), { x, y, s });
  const F = (pts, k = 1) => H(pts.map(([a, b]) => [a + turn * 14 * k, b]));
  const Bd = (pts) => xf(pts.map(([a, b]) => [a, b - br * 1.6 * (b < 260 ? 1 : 0.4)]), { x, y, s });

  // blinking & saccades
  const period = 2.7 + (sd0 % 10) * 0.17, ph = (t + sd0 * 0.37) % period;
  const blink = ph < 0.14 ? 1 - Math.abs(ph - 0.07) / 0.07 : 0;
  let open = P.eyes === 'closed' ? 0 : 1 - blink;
  if (P.eyes === 'squint') open *= 0.45;
  const wide = P.eyes === 'wide' ? 1.35 : 1;
  const sacc = Math.floor((t + sd0) / 1.3);
  const look = P.look || [Math.sin(sacc * 12.9898) * 1.6, Math.cos(sacc * 78.233) * 1.0];

  // --- hair behind the head
  if (opt.hairStyle === 'curly') {
    shape(H([[-82, -70], [-96, 10], [-110, 90], [-102, 175], [-64, 196], [-40, 120], [40, 120], [64, 196], [102, 175], [110, 90], [96, 10], [82, -70], [40, -114], [-40, -114]]), { fill: hair, op: 225, bleed: 0.1, tex: 0.65, border: 0.45, curve: 0.6, id: id + 'wig', solid: true });
  }
  if (opt.hairStyle === 'bun') {
    shape(H(ell(30, -94, 36, 30, 18)), { fill: hair, op: 230, bleed: 0.05, tex: 0.55, border: 0.4, line: INK, w: 1.2, id: id + 'bun', solid: true });
    for (let i = 0; i < 3; i++) path(H(ell(30, -94, 30 - i * 8, 22 - i * 6, 10, 0.4 + i, 3.6 + i)), 'HB', hairHi, 0.8, { id: id + 'bunl' + i, curve: 0.7 });
  }
  if (opt.hairStyle === 'scarf') {
    shape(H([[-82, -40], [-96, 40], [-82, 122], [-42, 152], [42, 152], [82, 122], [96, 40], [82, -40], [52, -102], [0, -118], [-52, -102]]), { fill: opt.scarf || '#9a5a3a', op: 228, bleed: 0.06, tex: 0.5, line: INK, w: 1.3, curve: 0.6, id: id + 'scb', solid: true });
  }

  // --- body
  const body = [[-178, 340], [-166, 196], [-116, 136], [-36, 106], [36, 106], [116, 136], [166, 196], [178, 340]];
  shape(Bd(body), { fill: coat, op: 230, bleed: 0.06, tex: 0.5, border: 0.35, line: INK, w: 1.6, curve: 0.45, id: id + 'body', solid: true });
  shape(Bd([[60, 120], [116, 136], [166, 196], [178, 340], [90, 340], [100, 220]]), { fill: mixHex(coat, '#000000', 0.4), op: 110, bleed: 0.1, tex: 0.3, curve: 0.45, id: id + 'bsh', boil: false });
  path(Bd([[-120, 230], [-100, 280], [-110, 330]]), 'HB', mixHex(coat, '#000000', 0.5), 1.0, { id: id + 'fold1', curve: 0.6 });
  path(Bd([[120, 220], [104, 270], [118, 330]]), 'HB', mixHex(coat, '#000000', 0.5), 1.0, { id: id + 'fold2', curve: 0.6 });
  if (opt.buttons !== false && opt.collar !== 'shawl' && !opt.apron) {
    path(Bd([[4, 150], [0, 240], [6, 340]]), 'HB', mixHex(coat, '#000000', 0.55), 1.2, { id: id + 'open', curve: 0.4 });
    for (let i = 0; i < 3; i++) shape(Bd(ell(-12, 196 + i * 46, 6, 6, 10)), { wash: opt.buttonColor || '#d9b45a', line: INK, w: 0.8, id: id + 'bt' + i });
  }
  if (opt.apron) {
    shape(Bd([[-86, 196], [86, 196], [100, 340], [-100, 340]]), { fill: '#f5efe2', op: 215, bleed: 0.03, tex: 0.25, line: INK, w: 1.2, curve: 0.2, id: id + 'apr', solid: true });
    path(Bd([[-86, 196], [-60, 150], [-30, 112]]), 'HB', INK, 1.1, { id: id + 'aps1' });
    path(Bd([[86, 196], [60, 150], [30, 112]]), 'HB', INK, 1.1, { id: id + 'aps2' });
    shape(Bd([[-40, 250], [40, 250], [40, 296], [-40, 296]]), { line: '#9a8a70', w: 1.0, curve: 0.1, id: id + 'pkt' });
  }

  // --- arms behind the head layer
  const shoulders = { L: Bd([[-112, 152]])[0], R: Bd([[112, 152]])[0] };
  const drawArms = (front) => (opt.arms || []).forEach((a, i) => {
    if (!!a.front !== front) return;
    const sh = shoulders[a.side || 'R'];
    arm(sh[0], sh[1], a.to[0], a.to[1], s, { id: id + 'a' + i, sleeve: a.sleeve || coat, skin, hand: a.hand, bend: a.bend ?? (a.side === 'L' ? -1 : 1), handAng: a.handAng, handScale: a.handScale, item: a.item });
  });
  if (!opt.deferArms) drawArms(false);

  // --- neck (top follows the head)
  const nk = [...H([[-25, 62], [25, 62]]), ...Bd([[29, 120], [-29, 120]])];
  shape(nk, { fill: skin, op: 225, bleed: 0.04, tex: 0.2, border: 0.1, curve: 0.2, id: id + 'neck', solid: true });
  shape([...H([[-25, 62], [25, 62]]), ...H([[26, 84], [-26, 84]])], { fill: skinSh, op: 120, bleed: 0.08, tex: 0.1, curve: 0.3, id: id + 'nsh', boil: false });
  path([H([[-25, 62]])[0], Bd([[-29, 118]])[0]], 'HB', INK, 1.1, { id: id + 'nl' });
  path([H([[25, 62]])[0], Bd([[29, 118]])[0]], 'HB', INK, 1.1, { id: id + 'nr' });

  // collars
  if (opt.collar === 'band') {
    shape(Bd([[-74, 112], [74, 112], [96, 178], [0, 200], [-96, 178]]), { fill: '#fbf8f0', op: 225, bleed: 0.03, tex: 0.15, line: INK, w: 1.3, curve: 0.35, id: id + 'band', solid: true });
    path(Bd([[0, 116], [0, 196]]), 'HB', '#b8b0a0', 0.9, { id: id + 'bandl' });
    for (let i = 0; i < 3; i++) path(Bd([[-80 + i * 10, 150 + i * 8], [-30 + i * 6, 170 + i * 6]]), 'HB', '#b8b0a0', 0.7, { id: id + 'bf' + i });
  } else if (opt.collar === 'cravat') {
    shape(Bd([[-50, 106], [50, 106], [22, 150], [0, 196], [-22, 150]]), { fill: '#fbf6ea', op: 225, bleed: 0.03, tex: 0.1, line: INK, w: 1.2, curve: 0.4, id: id + 'crv', solid: true });
    shape(Bd([[-18, 120], [18, 120], [10, 140], [-10, 140]]), { wash: opt.tie || '#a8323a', line: INK, w: 1.0, curve: 0.4, id: id + 'tie' });
    shape(Bd([[-64, 110], [-28, 196], [-44, 320], [-96, 300], [-104, 170]]), { fill: mixHex(coat, '#000000', 0.2), op: 170, bleed: 0.04, tex: 0.3, line: INK, w: 1.2, curve: 0.3, id: id + 'lap1', solid: true });
    shape(Bd([[64, 110], [28, 196], [44, 320], [96, 300], [104, 170]]), { fill: mixHex(coat, '#000000', 0.2), op: 170, bleed: 0.04, tex: 0.3, line: INK, w: 1.2, curve: 0.3, id: id + 'lap2', solid: true });
  } else if (opt.collar === 'shawl') {
    const sc = opt.shawl || '#8a4a3a';
    shape(Bd([[-156, 214], [-104, 130], [-30, 112], [0, 176], [30, 112], [104, 130], [156, 214], [62, 256], [0, 236], [-62, 256]]), { fill: sc, op: 228, bleed: 0.05, tex: 0.6, border: 0.4, line: INK, w: 1.3, curve: 0.4, id: id + 'shawl', solid: true, hatch: [6, 55, { rand: 0.2 }], hcolor: mixHex(sc, '#000000', 0.5), hw: 0.6 });
    for (let i = 0; i < 4; i++) path(Bd([[-120 + i * 26, 236 + (i % 2) * 6], [-118 + i * 26, 262]]), 'HB', mixHex(sc, '#000000', 0.5), 0.9, { id: id + 'fr' + i });
  } else if (opt.collar === 'white') {
    shape(Bd([[-44, 106], [0, 150], [44, 106], [54, 124], [0, 170], [-54, 124]]), { fill: '#fbf8f0', op: 220, bleed: 0.03, tex: 0.1, line: INK, w: 1.2, curve: 0.3, id: id + 'wc', solid: true });
  } else if (opt.collar === 'hoodie') {
    shape(Bd([[-96, 118], [0, 152], [96, 118], [76, 172], [0, 190], [-76, 172]]), { fill: mixHex(coat, '#000000', 0.18), op: 215, bleed: 0.05, tex: 0.3, line: INK, w: 1.2, curve: 0.5, id: id + 'hood', solid: true });
    path(Bd([[-20, 170], [-24, 240]]), 'HB', '#f2efe6', 1.6, { id: id + 'str1' });
    path(Bd([[20, 170], [24, 240]]), 'HB', '#f2efe6', 1.6, { id: id + 'str2' });
  }
  if (opt.hairStyle === 'curly') {
    for (const sx of [-1, 1]) shape(H([[sx * 60, 0], [sx * 98, 20], [sx * 112, 100], [sx * 104, 184], [sx * 72, 206], [sx * 58, 120]]), { fill: hair, op: 232, bleed: 0.08, tex: 0.65, border: 0.45, line: INK, w: 1.1, curve: 0.6, id: id + 'lobe' + sx, solid: true });
  }

  // --- head
  const puff = P.blow || 0;
  const head = [];
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * TAU, sn = Math.sin(a), lower = Math.max(0, sn);
    const pf = 1 + 0.13 * puff * Math.exp(-Math.pow((sn - 0.45) * 3, 2));
    head.push([Math.cos(a) * 60 * (1 - 0.2 * lower * lower) * pf, sn * 76 - 4]);
  }
  const earX = 60 - Math.abs(turn) * 4;
  shape(F([...ell(-earX, 4, 10, 16, 12)], -0.35), { fill: skin, op: 228, line: INK, w: 1.1, id: id + 'e1', solid: true, bleed: 0.03 });
  shape(F([...ell(earX, 4, 10, 16, 12)], -0.35), { fill: skin, op: 228, line: INK, w: 1.1, id: id + 'e2', solid: true, bleed: 0.03 });
  path(F(ell(-earX - 1, 4, 5, 9, 8, -1.2, 1.4), -0.35), 'HB', skinSh, 0.9, { id: id + 'ei1' });
  path(F(ell(earX + 1, 4, 5, 9, 8, 1.7, 4.4), -0.35), 'HB', skinSh, 0.9, { id: id + 'ei2' });
  shape(H(head), { fill: skin, op: 228, bleed: 0.04, tex: 0.25, border: 0.12, line: INK, w: 1.6, curve: 0.5, id: id + 'head', solid: true });
  // form shading (light from the upper left)
  const shadeSide = [];
  for (let i = 0; i <= 12; i++) { const a = -1.25 + i / 12 * 2.6; shadeSide.push([Math.cos(a) * 58 * (1 - 0.2 * Math.max(0, Math.sin(a)) ** 2), Math.sin(a) * 74 - 4]); }
  shadeSide.push([24 + turn * 10, 50], [30 + turn * 10, 0], [26 + turn * 10, -50]);
  shape(H(shadeSide), { fill: skinSh, op: 95, bleed: 0.12, tex: 0.15, border: 0.1, curve: 0.5, id: id + 'fsh', boil: false });

  if (opt.jawGlow > 0) {
    const jaw = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.06 + Math.PI * 0.88 * i / 14; jaw.push([Math.cos(a) * 57 * (1 - 0.2 * Math.sin(a) ** 2), Math.sin(a) * 71 - 4]); }
    jaw.push([-34, 34], [0, 40], [34, 34]);
    shape(H(jaw), { fill: '#3dff7a', op: Math.round(90 + 150 * opt.jawGlow), bleed: 0.08, tex: 0.35, border: 0.3, curve: 0.5, id: id + 'jaw', boil: false });
  }
  // cheeks
  const blushOp = 60 + 110 * puff;
  shape(F(ell(-34, 28, 14, 9, 12)), { fill: '#ee7a6a', op: blushOp, bleed: 0.2, tex: 0.1, id: id + 'bl1', boil: false });
  shape(F(ell(34, 28, 14, 9, 12)), { fill: '#ee7a6a', op: blushOp, bleed: 0.2, tex: 0.1, id: id + 'bl2', boil: false });

  // --- hair in front
  const hs = opt.hairStyle;
  if (hs === 'bun' || hs === 'short' || hs === 'wavy') {
    const fr = hs === 'bun'
      ? [[-64, 12], [-68, -40], [-46, -80], [0, -90], [46, -80], [68, -40], [64, 12], [54, -28], [22, -56], [2, -50], [-20, -58], [-54, -30]]
      : hs === 'wavy'
        ? [[-64, -2], [-72, -48], [-44, -88], [8, -98], [54, -84], [72, -46], [66, -4], [58, -34], [40, -48], [20, -42], [0, -60], [-20, -48], [-44, -54], [-58, -30]]
        : [[-64, -6], [-68, -46], [-40, -84], [8, -92], [50, -80], [68, -44], [64, -6], [54, -36], [30, -58], [-6, -62], [-40, -52], [-56, -30]];
    shape(H(fr), { fill: hair, op: 235, bleed: 0.05, tex: 0.55, border: 0.35, line: INK, w: 1.4, curve: 0.5, id: id + 'hair', solid: true });
    for (let i = 0; i < 8; i++) {
      const xx = -50 + i * 14;
      path(H([[xx, -78 + Math.abs(i - 3.5) * 3], [xx - 6 + (i < 4 ? -4 : 4), -46 + Math.abs(i - 3.5) * 2]]), 'HB', i % 2 ? INK : hairHi, i % 2 ? 0.7 : 1.1, { id: id + 'hs' + i, curve: 0.5 });
    }
  } else if (hs === 'curly') {
    shape(H([[-66, -10], [-72, -56], [-36, -98], [10, -104], [54, -90], [74, -50], [66, -10], [44, -52], [0, -66], [-42, -56]]), { fill: hair, op: 232, bleed: 0.06, tex: 0.65, line: INK, w: 1.3, curve: 0.6, id: id + 'hairf', solid: true });
    const curls = [[-82, 20], [-94, 60], [-98, 100], [-90, 142], [-78, 180], [82, 20], [94, 60], [98, 100], [90, 142], [78, 180], [-62, -72], [-32, -98], [6, -102], [42, -94], [66, -68], [-74, -30], [74, -30]];
    curls.forEach((c, i) => {
      const sp = []; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU * 1.6 + i; const rr = 4 + k * 0.9; sp.push([c[0] + Math.cos(a) * rr + Math.sin(t * 2 + i) * 1.2, c[1] + Math.sin(a) * rr]); }
      path(H(sp), 'HB', i % 3 ? INK : hairHi, i % 3 ? 0.9 : 1.2, { id: id + 'curl' + i, curve: 0.8 });
    });
  } else if (hs === 'bald') {
    shape(H([[-62, -10], [-68, -42], [-54, -50], [-48, 0]]), { fill: hair, op: 220, line: INK, w: 1.0, id: id + 'bh1', solid: true, curve: 0.6 });
    shape(H([[62, -10], [68, -42], [54, -50], [48, 0]]), { fill: hair, op: 220, line: INK, w: 1.0, id: id + 'bh2', solid: true, curve: 0.6 });
    path(H([[-30, -64], [-12, -72], [8, -72]]), 'HB', '#ffffff', 2.2, { id: id + 'shine' });
  } else if (hs === 'scarf') {
    const sc = opt.scarf || '#9a5a3a';
    shape(H([[-76, 12], [-80, -40], [-52, -94], [0, -110], [52, -94], [80, -40], [76, 12], [62, -40], [32, -66], [0, -70], [-32, -66], [-62, -40]]), { fill: sc, op: 235, bleed: 0.05, tex: 0.5, line: INK, w: 1.4, curve: 0.55, id: id + 'scf', solid: true });
    for (let i = 0; i < 4; i++) path(H([[-56 + i * 30, -90 + Math.abs(i - 1.5) * 8], [-60 + i * 34, -60]]), 'HB', mixHex(sc, '#000000', 0.45), 0.9, { id: id + 'scfd' + i, curve: 0.5 });
    shape(H([[-32, -66], [0, -70], [32, -66], [26, -50], [0, -55], [-26, -50]]), { fill: hair, op: 220, id: id + 'scfh', solid: true, curve: 0.5 });
  }
  if (opt.sideburns) {
    shape(H([[-60, -10], [-58, 32], [-47, 36], [-49, -6]]), { fill: opt.sideburns, op: 220, line: INK, w: 0.9, id: id + 'sb1', solid: true, curve: 0.4 });
    shape(H([[60, -10], [58, 32], [47, 36], [49, -6]]), { fill: opt.sideburns, op: 220, line: INK, w: 0.9, id: id + 'sb2', solid: true, curve: 0.4 });
  }

  // --- face
  const browCol = mixHex(hair, '#000000', 0.35);
  const by = -25 - (P.brow || 0) * 8;
  const wv = (P.worry || 0) * 8, fr = (P.frown || 0) * 5;
  path(F([[-40, by + 3 + wv * 0.25], [-27, by - 2], [-12, by - wv + fr]]), '2B', browCol, 2.2, { id: id + 'br1' });
  path(F([[12, by - wv + fr], [27, by - 2], [40, by + 3 + wv * 0.25]]), '2B', browCol, 2.2, { id: id + 'br2' });
  for (const sx of [-1, 1]) {
    const cx = sx * 24, cy = -3;
    const hh = 7 * open * wide, hw = 13 * (wide > 1 ? 1.08 : 1);
    if (P.blow > 0.5 || open < 0.12) {
      path(F([[cx - 12, cy - 1], [cx, cy + 3], [cx + 12, cy - 1]]), '2B', INK, 1.7, { id: id + 'eyc' + sx, curve: 0.5 });
      continue;
    }
    const up = [[cx - hw, cy], [cx - hw * 0.5, cy - hh * 0.95], [cx + hw * 0.4, cy - hh], [cx + hw, cy - 1]];
    const lo = [[cx + hw, cy - 1], [cx + hw * 0.4, cy + hh * 0.75], [cx - hw * 0.5, cy + hh * 0.7]];
    shape(F([...up, ...lo.slice(1)]), { wash: '#fdfaf3', curve: 0.5, id: id + 'scl' + sx });
    if (open > 0.3) {
      const ir = 6.2 * Math.min(1, open * 1.2) * (wide > 1 ? 0.92 : 1);
      const ix = cx + look[0], iy = cy + look[1] + (1 - open) * 2;
      shape(F(ell(ix, iy, ir, ir * Math.min(1, hh / 6.5), 14)), { wash: opt.iris || '#6a4024', id: id + 'iri' + sx });
      shape(F(ell(ix, iy, ir * 0.48, ir * 0.48, 10)), { wash: '#140a06', id: id + 'pup' + sx });
      shape(F(ell(ix + 2, iy - 2.2, 1.6, 1.6, 8)), { wash: '#ffffff', id: id + 'hl' + sx });
    }
    path(F(up), '2B', INK, 2.0, { id: id + 'lid' + sx, curve: 0.5 });
    path(F(lo), 'HB', '#8a5a48', 0.8, { id: id + 'llid' + sx, curve: 0.5 });
    if (opt.female) for (let k = 0; k < 3; k++) path(F([[cx + sx * (hw - 2 - k * 4), cy - hh * 0.8 + k], [cx + sx * (hw + 3 - k * 3), cy - hh - 3 + k * 1.5]]), 'HB', INK, 1.0, { id: id + 'ls' + sx + k });
    path(F([[cx - hw * 0.8, cy - hh - 5], [cx, cy - hh - 7], [cx + hw * 0.8, cy - hh - 5]]), 'HB', skinSh, 0.8, { id: id + 'crs' + sx, curve: 0.5 });
  }
  // nose
  path(F([[5, -10], [9, 12], [6, 24], [-3, 25]], 1.25), 'HB', INK, 1.3, { id: id + 'nose', curve: 0.6 });
  shape(F(ell(-5, 24, 2.6, 1.8, 8), 1.25), { wash: '#8a4a38', id: id + 'ns1' });
  shape(F(ell(7, 24, 2.6, 1.8, 8), 1.25), { wash: '#8a4a38', id: id + 'ns2' });
  shape(F([[8, -2], [14, 14], [10, 26], [4, 22]], 1.25), { fill: skinSh, op: 90, bleed: 0.1, tex: 0.1, curve: 0.5, id: id + 'nsh', boil: false });
  // mouth
  const m = clamp(P.mouth || 0), sm = P.smile || 0;
  const my = 49;
  if (P.blow > 0.3) {
    shape(F(ell(5, my, 7, 7, 12)), { wash: '#4a1714', line: INK, w: 1.2, id: id + 'mo' });
    shape(F(ell(5, my, 10, 10, 12)), { line: '#c46a5a', w: 1.4, id: id + 'lipo' });
  } else {
    if (m > 0.06) {
      const oh = 3 + m * 13, ow = 12 + m * 3;
      shape(F(ell(0, my + oh * 0.45, ow, oh, 16)), { wash: '#4a1714', line: INK, w: 1.3, id: id + 'mo' });
      shape(F([[-ow * 0.75, my + 0.5], [ow * 0.75, my + 0.5], [ow * 0.6, my + 3.5], [-ow * 0.6, my + 3.5]]), { wash: '#fbf7ef', curve: 0.3, id: id + 'teeth' });
      if (m > 0.35) shape(F(ell(0, my + oh * 0.95, ow * 0.6, oh * 0.35, 10)), { wash: '#c25a58', id: id + 'tng' });
    } else {
      path(F([[-15, my - sm * 5], [-6, my + 1 + sm * 1.5], [6, my + 1 + sm * 1.5], [15, my - sm * 5]]), '2B', '#5a2a22', 1.6, { id: id + 'mo', curve: 0.6 });
    }
    shape(F(ell(0, my + 7 + m * 13, 10, 3.6, 10)), { fill: '#d97a6c', op: 150, bleed: 0.1, tex: 0.1, id: id + 'llip', boil: false });
    if (sm > 0.2) { path(F([[-20, my - 8], [-17, my - 2]]), 'HB', skinSh, 0.9, { id: id + 'dim1' }); path(F([[20, my - 8], [17, my - 2]]), 'HB', skinSh, 0.9, { id: id + 'dim2' }); }
  }
  if (opt.age) {
    for (let i = 0; i < 2; i++) path(F([[-22, -46 - i * 7], [0, -48 - i * 7], [22, -46 - i * 7]]), 'HB', skinSh, 0.8, { id: id + 'wr' + i, curve: 0.6 });
    path(F([[-14, 30], [-20, 46]]), 'HB', skinSh, 0.9, { id: id + 'nl1' });
    path(F([[18, 30], [22, 46]]), 'HB', skinSh, 0.9, { id: id + 'nl2' });
  }
  if (opt.mustache) {
    shape(F([[-32, my - 6], [-15, my - 16], [0, my - 12], [15, my - 16], [32, my - 6], [15, my - 9], [0, my - 7], [-15, my - 9]]), { fill: opt.mustache, op: 240, line: INK, w: 1.1, curve: 0.5, id: id + 'mst', solid: true });
  }
  if (opt.beard) {
    shape(F([[-52, 28], [-38, 68], [0, 86], [38, 68], [52, 28], [30, 56], [12, my + 10], [-12, my + 10], [-30, 56]]), { fill: opt.beard, op: 228, line: INK, w: 1.1, curve: 0.55, id: id + 'brd', solid: true });
    for (let i = 0; i < 5; i++) path(F([[-30 + i * 15, 62 + Math.abs(i - 2) * -3], [-28 + i * 14, 76 - Math.abs(i - 2) * 4]]), 'HB', mixHex(opt.beard, '#000000', 0.4), 0.8, { id: id + 'bdl' + i });
  }

  if (opt.deferArms) return { shoulders, drawArms: () => { drawArms(false); drawArms(true); } };
  drawArms(true);
  return { shoulders };
}
