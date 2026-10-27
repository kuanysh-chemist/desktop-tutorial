// Scenes, transitions, subtitles. renderAt(t) draws one frame.
const DT = 1 / 60;
const END = 84.0;

// ---------- shared world pieces ----------
function forestSet(seed, n, { dMin = 900, dMax = 7000, corridor = 260, spread = 1400, ground = 420, hMin = 900, hMax = 1700 } = {}) {
  const r = rng(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, D = lerp(dMin, dMax, Math.pow(r(), .8));
    arr.push({ D, x: side * (corridor + r() * spread), y: ground, h: lerp(hMin, hMax, r()), v: Math.floor(r() * 4) });
  }
  return arr.sort((a, b) => b.D - a.D);
}
function pineFor(D, camz, v, tone) { // pick sprite by depth (colour + DOF blur baked)
  const d = D - camz;
  const fogK = clamp((d - 600) / 5000);
  const col = mixColor(tone[0], tone[1], fogK), snow = mixColor('#dbe7e4', tone[1], fogK * .7);
  const b = d < 500 ? 6 : d > 3500 ? 2 : 0;
  const key = `pine_${tone[0]}_${Math.round(fogK * 8)}_${v}_${b}`;
  return pineSprite(key, 600, col, snow, 11 + v * 7, b);
}
function drawForest(g, set, cam, tone, { minD = 60, alpha = 1, smearK = 0, camPrev = null } = {}) {
  for (const p of set) {
    const d = p.D - cam.z; if (d < minD) continue;
    const s = camT(cam, p.D, g);
    const spr = pineFor(p.D, cam.z, p.v, tone);
    const sc = p.h / 600;
    const fade = clamp((d - minD) / 250) * alpha;
    if (smearK && camPrev && d < 900) {
      const a = proj(cam, p.x, p.y, p.D), b = proj(camPrev, p.x, p.y, p.D);
      const dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy);
      const n = Math.min(6, 1 + Math.floor(L / 10));
      for (let i = 0; i < n; i++) { const k = i / n; g.setTransform(1, 0, 0, 1, -dx * k * smearK, -dy * k * smearK); g.translate(W / 2, H / 2); g.rotate(cam.roll || 0); g.scale(s, s); g.translate(-cam.x, -cam.y); drawSpr(g, spr, p.x, p.y, sc, fade / (i ? n * .6 : 1)); }
    } else drawSpr(g, spr, p.x, p.y, sc, fade);
  }
  reset(g);
}
function groundPlane(g, cam, y, colTop, colBot, D0 = 20000) {
  reset(g);
  const hz = proj(cam, cam.x, y, D0)[1];
  g.fillStyle = vgrad(g, hz, H, [[0, colTop], [1, colBot]]);
  g.save(); g.translate(W / 2, H / 2); g.rotate(cam.roll || 0); g.translate(-W / 2, -H / 2);
  g.fillRect(-400, hz, W + 800, H - hz + 600); g.restore();
}
function fogBand(g, cam, D, y, hgt, col, a) {
  const s = camT(cam, D, g);
  g.fillStyle = vgrad(g, y - hgt, y + hgt, [[0, rgba(col, 0)], [.5, rgba(col, a)], [1, rgba(col, 0)]]);
  g.fillRect(cam.x - W / s, y - hgt, W * 2 / s, hgt * 2); reset(g);
}
function mountains(g, cam, D, key, col, snow, seed, y = 300, w = 9000, h = 2600, blur = 0) {
  const spr = ridgeSprite(key, 2400, 700, col, snow, seed, .52, blur);
  camT(cam, D, g); g.drawImage(spr.c, -w / 2 + 0, y - h * .82, w, h * .82 * 700 / 700); reset(g);
}

const FOREST1 = forestSet(5, 70, { dMin: 700, dMax: 9000, corridor: 220, spread: 1500 });
const FOREST4 = forestSet(9, 34, { dMin: 2300, dMax: 6500, corridor: -300, spread: 3800, ground: 330 });
const FOREST7 = forestSet(13, 40, { dMin: 2000, dMax: 7000, corridor: 380, spread: 2400, ground: 350 });
const FOREST13 = forestSet(21, 44, { dMin: 1500, dMax: 7000, corridor: 0, spread: 4200, ground: 360, hMin: 500, hMax: 1100 });
const SNOW = {
  dive: new Snow(1100, 1, { wind: [-120, 160], depth: 2600, size: 3.2 }),
  ecu: new Snow(220, 2, { wind: [-90, 70], depth: 1800, near: 60, size: 3 }),
  storm: new Snow(1300, 3, { wind: [-700, 260], depth: 3000, size: 2.8, sway: 70 }),
  gentle: new Snow(500, 4, { wind: [-40, 110], depth: 2500, size: 3, sway: 30 }),
  room: new Snow(180, 5, { wind: [260, 60], depth: 1500, size: 2.2, sway: 60 }),
};
const TONE_NIGHT = ['#0a1c1f', '#21474b'], TONE_DUSK = ['#2d4448', '#9fb4b4'];

// ---------- interior pieces (screen-space-ish, drawn through camera at given depths) ----------
function woodWall(g, cam, D, warm, cold, light) {
  camT(cam, D, g);
  const x0 = cam.x - 2600, w = 5200;
  g.fillStyle = mixColor(cold, warm, light); g.fillRect(x0, -1400, w, 2000);
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(x0 / 90) * 90 + i * 90;
    g.fillStyle = `rgba(0,0,0,${.18 + .12 * hash(i * 7.3 + Math.floor(x0 / 90))})`; g.fillRect(x, -1400, 4, 2000);
    g.fillStyle = `rgba(255,255,255,${.025 * hash(i * 3.1)})`; g.fillRect(x + 10, -1400, 30, 2000);
  }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0, -620, w, 40); g.fillRect(x0, 520, w, 70);
  reset(g);
}
function floorPlane(g, cam, y, warm, cold, light, Dw = 1500) {
  groundPlane(g, cam, y, mixColor(cold, warm, light * .8), mixColor('#05090a', '#1a0d07', light), Dw);
}
function hearth(g, t, cam, D, x, y, it, cold, lean = 0) {
  const s = camT(cam, D, g);
  // sunken hearth frame
  g.fillStyle = '#1a110b'; g.beginPath(); g.moveTo(x - 330, y + 10); g.lineTo(x + 330, y + 10); g.lineTo(x + 420, y + 120); g.lineTo(x - 420, y + 120); g.closePath(); g.fill();
  g.fillStyle = '#0d0907'; g.beginPath(); g.moveTo(x - 270, y + 20); g.lineTo(x + 270, y + 20); g.lineTo(x + 330, y + 100); g.lineTo(x - 330, y + 100); g.closePath(); g.fill();
  // embers
  g.fillStyle = mixColor('#200a05', '#ff5a1a', it * .8 + .1); g.beginPath(); g.ellipse(x, y + 60, 160, 26, 0, 0, 6.28); g.fill();
  // hanging hook & kettle
  g.strokeStyle = '#120c08'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, -1400); g.lineTo(x, y - 260); g.stroke();
  const ky = y - 190;
  g.fillStyle = '#100c0a'; g.beginPath(); g.moveTo(x - 80, ky - 30); g.quadraticCurveTo(x - 92, ky + 55, x - 40, ky + 70); g.lineTo(x + 40, ky + 70); g.quadraticCurveTo(x + 92, ky + 55, x + 80, ky - 30); g.quadraticCurveTo(x, ky - 60, x - 80, ky - 30); g.fill();
  g.beginPath(); g.moveTo(x + 78, ky); g.quadraticCurveTo(x + 130, ky - 10, x + 140, ky - 50); g.lineTo(x + 126, ky - 50); g.quadraticCurveTo(x + 115, ky - 18, x + 76, ky + 20); g.fill();
  g.fillRect(x - 12, ky - 72, 24, 20); g.lineWidth = 6; g.strokeStyle = '#100c0a'; g.beginPath(); g.moveTo(x - 70, ky - 34); g.quadraticCurveTo(x, ky - 130, x + 70, ky - 34); g.stroke();
  g.strokeStyle = `rgba(255,170,90,${.55 * it})`; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 86, ky + 10); g.quadraticCurveTo(x - 80, ky + 60, x - 40, ky + 68); g.lineTo(x + 30, ky + 68); g.stroke();
  // steam
  g.save(); g.filter = 'blur(14px)'; for (let i = 0; i < 5; i++) { const u = ((t * .35 + i * .2) % 1); g.fillStyle = `rgba(230,220,210,${.16 * (1 - u) * it})`; g.beginPath(); g.ellipse(x + 135 + Math.sin(u * 6 + i) * 30 + u * 60, ky - 60 - u * 300, 30 + u * 60, 24 + u * 40, 0, 0, 6.28); g.fill(); } g.restore();
  reset(g);
  camT(cam, D, g); fire(g, t, x, y + 50, .55, { intensity: it, cold, lean }); reset(g);
}
function sleeper(g, cam, D, x, y, light, flip = 1) {
  camT(cam, D, g);
  g.save(); g.translate(x, y); g.scale(flip, 1);
  g.fillStyle = mixColor('#0c1416', '#3a2216', light); g.beginPath(); g.moveTo(-300, 0); g.quadraticCurveTo(-260, -120, -60, -110); g.quadraticCurveTo(160, -150, 300, -20); g.lineTo(300, 0); g.closePath(); g.fill();
  g.fillStyle = mixColor('#0a1012', '#2a1810', light); g.beginPath(); g.ellipse(-330, -40, 55, 45, 0, 0, 6.28); g.fill();
  g.strokeStyle = `rgba(255,150,70,${.6 * light})`; g.lineWidth = 6; g.beginPath(); g.moveTo(-260, -100); g.quadraticCurveTo(-60, -125, 120, -120); g.stroke();
  g.restore(); reset(g);
}

// =========================== SCENES ===========================
// S1 0–5: dive through blizzard forest; breath ribbon overtakes camera
function cam1(t) { const k = seg(t, 0, 5.4); return { x: 90 * Math.sin(t * .8) - 60, y: -120 + 40 * k, z: 3400 * E.o(k * .92 + .08) - 600, roll: lerp(-.09, .04, E.io(k)) }; }
function scene1(t) {
  const c = cam1(t), cp = cam1(t - DT);
  sky(ctx, '#040d10', '#12363a', [W * .72, H * .2, 700, 'rgba(120,200,200,.22)']);
  mountains(ctx, c, 22000, 'm1a', '#0e2b2f', '#3f6f70', 31, 520, 40000, 9000);
  fogBand(ctx, c, 12000, 300, 900, '#3a7070', .35);
  groundPlane(ctx, c, 420, '#2a4c4e', '#c7d8d4');
  drawForest(ctx, FOREST1, c, TONE_NIGHT, { minD: 80, smearK: 1, camPrev: cp });
  SNOW.dive.draw(ctx, t, c, cp, { focus: 900, dofK: 12, color: '232,246,244' });
  // breath ribbon (screen space)
  const p = seg(t, 1.3, 3.9);
  if (p > 0 && p < 1) {
    reset(ctx); ctx.globalCompositeOperation = 'screen';
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; const x = lerp(-300, W * .52, u) + Math.sin(u * 5 + t * 3) * 120 * (1 - u), y = lerp(H + 260, H * .46, Math.pow(u, .8)) + Math.cos(u * 4 + t * 2) * 80 * (1 - u); pts.push([x, y]); }
    const head = E.io(p) * 1.15, tail = Math.max(0, head - .55);
    for (let L = 0; L < 4; L++) {
      ctx.filter = `blur(${[40, 20, 8, 3][L]}px)`;
      ctx.strokeStyle = `rgba(225,250,250,${[.18, .22, .28, .4][L] * Math.sin(p * Math.PI)})`; ctx.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) { const u = i / 40; if (u < tail || u > head) continue; ctx.lineWidth = [260, 150, 70, 18][L] * (1 - u * .8) * clamp((u - tail) * 6); ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
    }
    reset(ctx);
  }
  post(t, { vig: .65 });
}

// S2 5–12: lips ECU, finger "hush"
function scene2(t) {
  const k = seg(t, 5, 12.2);
  const sc = lerp(.95, 1.12, E.io(k)) * (1 + .004 * Math.sin(t * 1.7));
  reset(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2 + lerp(40, -30, k), H / 2 + 80 + lerp(20, -10, k)); ctx.rotate(lerp(-.03, .015, E.io(k))); ctx.scale(sc, sc);
  lipsECU(ctx, t, { part: .25 + .12 * Math.sin(t * 1.3), finger: seg(t, 8.15, 9.0), breath: seg(t, 5.1, 7.6) });
  reset(ctx);
  // cold light grade
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(196,222,224)'; ctx.fillRect(0, 0, W, H); reset(ctx);
  const c = { x: 0, y: 0, z: 0, roll: 0 }, cp = { x: 8, y: -3, z: 0, roll: 0 };
  SNOW.ecu.draw(ctx, t, c, cp, { focus: 3000, dofK: 22, maxBlur: 30, color: '240,250,250', alpha: .8 });
  post(t, { vig: .6 });
}

// S3 12–20.4: snow → 雪女 → snow → her silhouette on ridge
let GLYPH_PTS = null, FIG_PTS = null;
const FIG3 = { x: 1290, y: 905, s: .58 };
function ensurePts() {
  if (GLYPH_PTS) return;
  GLYPH_PTS = samplePoints(g => { g.fillStyle = '#fff'; g.font = '800 470px ShipporiB1'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('雪女', W / 2, H / 2 - 60); }, 1800, 3, W, H, 3);
  FIG_PTS = samplePoints(g => { g.translate(FIG3.x, FIG3.y); g.scale(FIG3.s, FIG3.s); yuki(g, 18.5, { silhouette: '#fff', wind: 1.1 }); }, 1800, 4, W, H, 2);
}
function cam3(t) { const k = E.io(seg(t, 18.2, 20.6)); return { x: lerp(0, 260, k), y: lerp(0, -40, k), z: lerp(0, 220, k), roll: lerp(0, -.035, k) }; }
function scene3(t) {
  ensurePts();
  const c = cam3(t), cp = cam3(t - DT);
  sky(ctx, '#071417', '#1b4144', [W * .3, H * .3, 900, 'rgba(110,180,185,.18)']);
  mountains(ctx, c, 12000, 'm3a', '#122f33', '#4f7c7c', 41, 380, 22000, 5200);
  fogBand(ctx, c, 6000, 250, 500, '#4a8282', .3);
  mountains(ctx, c, 3000, 'm3b', '#0b1d20', '#8fb3b0', 43, 330, 6400, 1300);
  // foreground ridge she stands on (screen-anchored at depth 1000)
  camT(c, 1000, ctx);
  ctx.fillStyle = '#0a1b1e'; ctx.beginPath(); ctx.moveTo(-1400, 700); ctx.lineTo(-1400, 470); ctx.quadraticCurveTo(-300, 330, 330, 365); ctx.quadraticCurveTo(700, 380, 1400, 520); ctx.lineTo(1400, 700); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(220,235,232,.85)'; ctx.beginPath(); ctx.moveTo(-1400, 470); ctx.quadraticCurveTo(-300, 330, 330, 365); ctx.quadraticCurveTo(700, 380, 1400, 520); ctx.lineTo(1400, 545); ctx.quadraticCurveTo(700, 410, 330, 395); ctx.quadraticCurveTo(-300, 370, -1400, 500); ctx.fill();
  reset(ctx);
  // solid figure (after morph)
  const figA = seg(t, 17.9, 18.9);
  if (figA > 0) {
    camT(c, 1000, ctx); ctx.translate(FIG3.x - W / 2, FIG3.y - H / 2); ctx.scale(FIG3.s, FIG3.s);
    ctx.globalAlpha = figA; yuki(ctx, t, { wind: 1.1, glow: .5 * figA, rim: .9 }); reset(ctx);
  }
  // title glyph solid
  const ga = seg(t, 13.7, 14.3) * (1 - seg(t, 15.9, 16.5));
  if (ga > 0) {
    reset(ctx); ctx.globalAlpha = ga; ctx.font = '800 470px ShipporiB1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(160,240,245,.9)'; ctx.shadowBlur = 40; ctx.fillStyle = '#eef9f8'; ctx.fillText('雪女', W / 2, H / 2 - 60);
    ctx.shadowBlur = 0; ctx.font = '600 54px CormorantSC'; ctx.letterSpacing = `${lerp(8, 34, E.o(seg(t, 14, 16.3)))}px`; ctx.fillStyle = '#cfeef0';
    ctx.fillText('ЮКИ-ОННА', W / 2, H / 2 + 250); ctx.letterSpacing = '0px'; reset(ctx);
  }
  // particles: scatter → glyph → figure
  const r = rng(99);
  reset(ctx); ctx.lineCap = 'round';
  for (let i = 0; i < GLYPH_PTS.length; i++) {
    const d0 = r() * .5, d1 = r() * .5, sx = r() * W * 1.4 - W * .2, sy = r() * H, sw = (r() - .5) * 600;
    const [gx, gy] = GLYPH_PTS[i], [fx, fy] = FIG_PTS[i];
    const k1 = E.io(seg(t, 12.1 + d0, 13.6 + d0)), k2 = E.io(seg(t, 15.9 + d1 * .8, 17.7 + d1));
    let x, y;
    if (k2 <= 0) { x = lerp(sx, gx, k1) + Math.sin(k1 * Math.PI) * sw; y = lerp(sy, gy, k1) + Math.sin(k1 * Math.PI) * sw * .3; }
    else { x = lerp(gx, fx, k2) - Math.sin(k2 * Math.PI) * (300 + sw); y = lerp(gy, fy, k2) - Math.sin(k2 * Math.PI) * 160; }
    const jit = (k1 >= 1 && k2 <= 0) ? 1.5 : 0;
    x += Math.sin(t * 3 + i) * jit; y += Math.cos(t * 2.6 + i * 1.3) * jit;
    const fade = (1 - seg(t, 18.0, 19.0)) * (k2 > 0 ? 1 : lerp(.55, .9, k1)) * (1 - ga * .7);
    const mv = Math.abs(Math.sin(k1 * Math.PI)) + Math.abs(Math.sin(k2 * Math.PI));
    ctx.strokeStyle = `rgba(235,250,250,${fade.toFixed(3)})`; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + mv * 14 + .1, y + mv * 3); ctx.stroke();
  }
  SNOW.storm.draw(ctx, t, c, cp, { focus: 1000, dofK: 10, alpha: lerp(.35, 1, seg(t, 16, 18)) });
  post(t, { vig: .6 });
}

// S4 20.4–27: travellers reach the hut by the river; lateral track
function cam4(t) { const k = seg(t, 20.0, 27.0); return { x: lerp(-1000, 560, E.s(k)), y: -110 + 15 * Math.sin(t), z: lerp(-100, 260, k), roll: .02 * Math.sin(t * .6) }; }
const TRUNKS = [-1350, -250, 820, 1900].map((x, i) => ({ x, D: 430 + (i % 2) * 120 }));
function scene4(t) {
  const c = cam4(t), cp = cam4(t - DT);
  sky(ctx, '#040c0e', '#163538', [W * .6, H * .12, 800, 'rgba(140,200,200,.16)']);
  mountains(ctx, c, 14000, 'm4a', '#0f2a2e', '#4e7b7b', 51, 380, 26000, 6000);
  groundPlane(ctx, c, 330, '#3d5d5f', '#d6e2de');
  drawForest(ctx, FOREST4, c, TONE_NIGHT);
  fogBand(ctx, c, 2600, 250, 260, '#6a9a98', .25);
  // river
  camT(c, 1650, ctx);
  ctx.fillStyle = '#071214'; ctx.beginPath(); ctx.moveTo(c.x - 3000, 360); ctx.quadraticCurveTo(c.x, 330, c.x + 3000, 372); ctx.lineTo(c.x + 3000, 470); ctx.quadraticCurveTo(c.x, 440, c.x - 3000, 470); ctx.fill();
  ctx.strokeStyle = 'rgba(160,210,210,.25)'; ctx.lineWidth = 3;
  for (let i = 0; i < 26; i++) { const x = Math.floor(c.x / 200) * 200 - 2400 + i * 200 + ((t * 120) % 200), y = 380 + (i % 4) * 22; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70, y); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,170,90,.35)'; ctx.fillRect(820 + Math.sin(t * 3) * 8, 395, 120, 6); ctx.fillRect(840, 420, 80, 5);
  reset(ctx);
  // hut
  const doorK = seg(t, 25.2, 25.6) * (1 - seg(t, 26.2, 26.6));
  camT(c, 1500, ctx); ctx.translate(820, 330); hutExterior(ctx, t, { glow: 1, door: doorK }); reset(ctx);
  // travellers walking to the door
  const lt = t - 20.4;
  [[0, true, 0], [1, false, 1.4]].forEach(([i, old, ph]) => {
    const x = -560 + 190 * Math.min(lt, 5.1) - i * 170, a = 1 - seg(t, 25.7 + i * .25, 26.1 + i * .25);
    if (a <= 0) return;
    camT(c, 1380, ctx); ctx.translate(x, 330); ctx.scale(.42, .42); ctx.globalAlpha = a;
    traveller(ctx, t, { old, phase: ph, bend: old ? .2 : .08 }); reset(ctx);
    camT(c, 1380, ctx); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, 335, 60, 8, 0, 0, 6.28); ctx.fill(); reset(ctx);
  });
  SNOW.storm.draw(ctx, t, c, cp, { focus: 1400, dofK: 10 });
  // foreground trunks (DOF + motion smear)
  layerFX(g => {
    for (const tr of TRUNKS) {
      camT(c, tr.D, g); const x = tr.x, wd = 95;
      g.fillStyle = '#081113'; g.beginPath(); g.moveTo(x - wd, 1400); g.bezierCurveTo(x - wd * .7, 300, x - wd * .55, -400, x - wd * .5, -1600); g.lineTo(x + wd * .5, -1600); g.bezierCurveTo(x + wd * .55, -400, x + wd * .7, 300, x + wd, 1400); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 6; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x - wd * .4 + k * 18, -1600); g.lineTo(x - wd * .5 + k * 22, 1400); g.stroke(); }
      g.fillStyle = 'rgba(215,235,235,.55)'; g.beginPath(); g.moveTo(x - wd * .5, -1600); g.bezierCurveTo(x - wd * .55, -400, x - wd * .7, 300, x - wd, 1400); g.lineTo(x - wd * .7, 1400); g.bezierCurveTo(x - wd * .45, 300, x - wd * .35, -400, x - wd * .32, -1600); g.fill();
    }
  }, { blur: 22, alpha: .82, smear: [-(proj(c, 0, 0, 400)[0] - proj(cp, 0, 0, 400)[0]) * 1.2, 0] });
  post(t, { vig: .6 });
}

// S5 27–32.5: shadow theatre, fire dies
function scene5(t) {
  const k = seg(t, 27, 32.5);
  const c = { x: lerp(-40, 60, E.io(k)), y: lerp(10, -20, k), z: lerp(0, 140, E.io(k)), roll: lerp(.01, -.012, k) };
  const fireI = (1 - E.io(seg(t, 30.1, 31.4))) * (1 + .25 * seg(t, 27.6, 27.9) * (1 - seg(t, 27.9, 28.6)));
  const light = clamp(fireI);
  const doorOpen = E.o(seg(t, 27.45, 27.75));
  woodWall(ctx, c, 1500, '#6b3a1f', '#0e2427', light);
  // moonlight from the door (left)
  if (doorOpen > 0) {
    reset(ctx); ctx.globalCompositeOperation = 'screen';
    const gr = ctx.createLinearGradient(0, 0, W * .7, H * .4); gr.addColorStop(0, `rgba(110,190,200,${.45 * doorOpen})`); gr.addColorStop(1, 'rgba(0,40,50,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(380, 0); ctx.lineTo(1300, H); ctx.lineTo(0, H); ctx.fill(); reset(ctx);
  }
  // shadows on the wall
  const sh = (draw, a) => layerFX(draw, { blur: 7, alpha: a * clamp(light * 1.3), comp: 'multiply' });
  sh(g => { camT(c, 1500, g); g.fillStyle = '#1a0a04'; g.save(); g.translate(-760, 420); g.scale(2.1, 1.9); g.beginPath(); g.moveTo(-300, 0); g.quadraticCurveTo(-260, -150, -60, -140); g.quadraticCurveTo(160, -180, 300, -20); g.lineTo(300, 0); g.fill(); g.beginPath(); g.ellipse(-340, -60, 70, 60, 0, 0, 6.28); g.fill(); g.restore();
    g.save(); g.translate(760, 430); g.scale(-1.9, 1.7); g.beginPath(); g.moveTo(-300, 0); g.quadraticCurveTo(-260, -150, -60, -140); g.quadraticCurveTo(160, -180, 300, -20); g.lineTo(300, 0); g.fill(); g.beginPath(); g.ellipse(-340, -60, 70, 60, 0, 0, 6.28); g.fill(); g.restore(); }, .8);
  const yk = seg(t, 27.6, 29.6);
  if (yk > 0) sh(g => { camT(c, 1500, g); g.translate(lerp(-1700, -560, E.o(yk)), 600); const ss = lerp(1.0, 1.42, E.io(yk)); g.scale(-ss, ss); g.rotate(.28 * E.io(seg(t, 28.6, 29.8))); yuki(g, t, { silhouette: '#120604', wind: .4 + .4 * fireI }); }, .95);
  floorPlane(ctx, c, 560, '#4a2a17', '#0c1a1c', light, 1500);
  // sleepers
  sleeper(ctx, c, 1150, -620, 420, light, 1);
  sleeper(ctx, c, 1150, 640, 420, light, -1);
  hearth(ctx, t, c, 900, 0, 330, fireI, 0, doorOpen * (1 - seg(t, 28.5, 29.5)) * .8 + seg(t, 30, 30.6) * (1 - seg(t, 31, 31.5)) * .6);
  // breath across the room
  const br = seg(t, 29.9, 31.0);
  if (br > 0 && br < 1) {
    reset(ctx); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(30px)';
    for (let i = 0; i < 6; i++) { const u = (br * 1.2 - i * .06); if (u < 0 || u > 1) continue; ctx.fillStyle = `rgba(210,245,250,${.25 * Math.sin(u * Math.PI)})`; ctx.beginPath(); ctx.ellipse(lerp(200, W * .45, u), lerp(H * .42, H * .62, u) + Math.sin(i + t * 4) * 30, 260 * (1 - u * .5), 70, .3, 0, 6.28); ctx.fill(); }
    reset(ctx);
  }
  SNOW.room.draw(ctx, t, c, { ...c, x: c.x - 4 }, { focus: 1000, dofK: 8, alpha: doorOpen * .8 });
  // cold grade as fire dies
  reset(ctx); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mixColor('#ffffff', '#6fa6b0', 1 - light); ctx.fillRect(0, 0, W, H); reset(ctx);
  post(t, { vig: .7 });
}

// S6 32.5–42: eyes ECU, the glow fades — mercy
function scene6(t, still) {
  const k = seg(t, 32.4, 42.2);
  const sc = lerp(.78, .98, E.io(k));
  reset(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 + lerp(60, -40, k), H / 2 + lerp(10, -10, k)); ctx.rotate(lerp(-.035, .02, E.io(k))); ctx.scale(sc, sc);
  const blink = t > 34.42 && t < 34.62 ? 1 - Math.sin(seg(t, 34.42, 34.62) * Math.PI) * .95 : 1;
  const close = 1 - E.i(seg(t, 40.7, 41.5)) * .95;
  const glow = still ? 1 : (1 - E.io(seg(t, 35.8, 39.8))) * (.85 + .15 * Math.sin(t * 6));
  eyesECU(ctx, t, { glow, open: blink * close, warm: still ? 0 : seg(t, 37, 40.5) * .35, frost: still ? .8 : .8 * (1 - seg(t, 36, 39)), drop: still ? null : seg(t, 37.4, 39.4), look: Math.sin(t * .3) * .3 });
  reset(ctx);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(165,205,212)'; ctx.fillRect(0, 0, W, H); reset(ctx);
  if (!still) {
    // reveal from darkness: glow first, then the face
    const rv = E.io(seg(t, 32.5, 34.0));
    if (rv < 1) {
      const gr = ctx.createRadialGradient(W / 2, H / 2, lerp(0, 900, rv), W / 2, H / 2, lerp(200, 1600, rv));
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(0,0,0,${(1 - rv) * .85})`; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      [[W / 2 - 330 * sc, H / 2], [W / 2 + 330 * sc, H / 2]].forEach(([x, y]) => { const r = ctx.createRadialGradient(x, y, 0, x, y, 160); r.addColorStop(0, `rgba(150,245,255,${(1 - rv) * .9})`); r.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = r; ctx.fillRect(x - 170, y - 170, 340, 340); });
      reset(ctx);
    }
    const c = { x: 0, y: 0, z: 0 }; SNOW.ecu.draw(ctx, t, c, { x: 6, y: -2, z: 0 }, { focus: 3000, dofK: 22, maxBlur: 30, alpha: .7 });
    post(t, { vig: .65 });
  }
}

// S7 42–46.6: snowy road at blue hour, red umbrella
function cam7(t) {
  const k = E.io(seg(t, 42.0, 44.6)), p = E.i(seg(t, 45.55, 46.6));
  const base = { x: lerp(120, -20, k), y: lerp(-620, -60, k), z: lerp(-150, 180, seg(t, 42, 45.6)), roll: lerp(.05, -.01, k) };
  // push into the umbrella canopy
  return { x: lerp(base.x, -62, p), y: lerp(base.y, 145, p), z: lerp(base.z, 1380, p), roll: base.roll * (1 - p) };
}
function scene7(t) {
  const c = cam7(t), cp = cam7(t - DT);
  sky(ctx, '#7f9898', '#c7d3cf', [W * .5, H * .55, 900, 'rgba(255,220,190,.25)']);
  mountains(ctx, c, 16000, 'm7a', '#8ea4a3', '#e4ecea', 61, 360, 30000, 6500, 2);
  groundPlane(ctx, c, 350, '#c9d6d3', '#eef3f1');
  drawForest(ctx, FOREST7, c, TONE_DUSK);
  fogBand(ctx, c, 2600, 260, 300, '#d8e2e0', .45);
  // road ruts
  reset(ctx); ctx.strokeStyle = 'rgba(120,140,140,.35)'; ctx.lineWidth = 3;
  for (const off of [-60, 60]) { ctx.beginPath(); for (let D = 6000; D > 300; D -= 100) { const p = proj(c, off + Math.sin(D / 900) * 120, 350, D); if (D === 6000) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); ctx.lineWidth = 1 + 600 / D * 2; } ctx.stroke(); }
  // him, arriving from the right
  const lt = t - 42;
  const mx = lerp(620, 150, E.o(seg(lt, 0, 3.2)));
  camT(c, 1560, ctx); ctx.translate(mx, 350); ctx.scale(.3, .3); traveller(ctx, t * (lt < 3.2 ? 1 : 0) + (lt >= 3.2 ? 3.2 + 42 : 0), { phase: 0, col: '#2a2420', snow: '#f2f6f4' }); reset(ctx);
  // her with umbrella
  camT(c, 1500, ctx); ctx.translate(-80, 350); ctx.scale(.3, .3); yuki(ctx, t, { wind: .25, kimono: '#f0f2f0' });
  ctx.translate(18, -520); wagasa(ctx, t, 1.05, { tilt: -.12 + .03 * Math.sin(t) }); reset(ctx);
  SNOW.gentle.draw(ctx, t, c, cp, { focus: 1500, dofK: 12, color: '250,252,252' });
  // foreground snowy branch the camera cranes past
  layerFX(g => {
    camT(c, 430, g); g.translate(-520, -560);
    g.strokeStyle = '#1d1712'; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(-900, -60); g.quadraticCurveTo(-200, 40, 520, 120); g.stroke();
    g.lineWidth = 4; g.strokeStyle = '#13261d';
    for (let i = 0; i < 140; i++) { const u = i / 140, bx = lerp(-880, 500, u), by = lerp(-55, 115, u) + Math.sin(u * 3) * 20, a = (i % 2 ? 1 : -1) * (.5 + hash(i) * .6) + 1.4, L = 90 + hash(i * 3) * 70; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); g.stroke(); }
    g.fillStyle = '#f4f8f7'; for (let i = 0; i < 9; i++) { const u = i / 9, bx = lerp(-860, 450, u), by = lerp(-80, 95, u); g.beginPath(); g.ellipse(bx, by, 90 + hash(i) * 40, 34, .12, 0, 6.28); g.fill(); }
  }, { blur: 12, smear: [0, (proj(c, 0, 0, 430)[1] - proj(cp, 0, 0, 430)[1]) * 1.5] });
  post(t, { vig: .45, grain: .05 });
}

// S8 46.6–52: shoji shadow-play of the years
function scene8(t) {
  const k = seg(t, 46.6, 52.2);
  const c = { x: lerp(-60, 80, E.io(k)), y: 0, z: lerp(0, 120, k), roll: lerp(-.01, .008, k) };
  reset(ctx); ctx.fillStyle = '#120804'; ctx.fillRect(0, 0, W, H);
  const flick = .92 + .08 * noise1(t * 5);
  // paper
  camT(c, 1000, ctx);
  const pg = ctx.createRadialGradient(0, 0, 100, 0, 0, 1300); pg.addColorStop(0, mixColor('#7a3a14', '#ffcf86', flick)); pg.addColorStop(1, '#8a3e14');
  ctx.fillStyle = pg; ctx.fillRect(-1300, -800, 2600, 1600);
  reset(ctx);
  // shadows
  const states = [46.6, 47.9, 49.2, 50.5];
  const st = t < 47.9 ? 0 : t < 49.2 ? 1 : t < 50.5 ? 2 : 3;
  const fadeIn = seg(t, states[st], states[st] + .22);
  const drawState = (g, s) => {
    camT(c, 1000, g); g.fillStyle = '#2a0e03';
    kneeler(g, -360, 360, .78, { hair: 'long', flip: false });
    kneeler(g, 340, 360, .8 + (s >= 3 ? -.04 : 0), { hair: 'bun', flip: true, bend: [0, 0, .08, .18][s], beard: s >= 3 });
    if (s === 1) kneeler(g, -360, 360, .78, { hair: 'long', baby: true });
    if (s === 2) { kneeler(g, -90, 360, .36, { hair: 'bun' }); kneeler(g, 80, 360, .3, { hair: 'long', flip: true }); }
    if (s === 3) { kneeler(g, -130, 360, .5, { hair: 'bun' }); kneeler(g, 40, 360, .44, { hair: 'long', flip: true }); kneeler(g, 170, 360, .3, { hair: 'bun', flip: true }); }
    // camellia branch shadow
    g.strokeStyle = '#2a0e03'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(1300, -700); g.quadraticCurveTo(900, -420, 760, -150); g.stroke();
    g.lineWidth = 7; g.beginPath(); g.moveTo(980, -480); g.quadraticCurveTo(820, -520, 700, -470); g.stroke();
    [[760, -150], [700, -470], [880, -330], [1040, -560]].forEach(([x, y], i) => { if (i <= s) { g.beginPath(); for (let p = 0; p < 5; p++) { const a = p / 5 * 6.28; g.ellipse(x + Math.cos(a) * 26, y + Math.sin(a) * 26, 26, 18, a, 0, 6.28); } g.fill(); } else { g.beginPath(); g.ellipse(x, y, 14, 20, .4, 0, 6.28); g.fill(); } });
    for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(940 - i * 30, -420 + i * 40, 50, 18, -.7 + i * .1, 0, 6.28); g.fill(); }
    if (s === 3) for (let i = 0; i < 4; i++) { const u = ((t - 50.5) * .5 + i * .25) % 1; g.beginPath(); g.ellipse(760 - u * 120 + Math.sin(u * 9) * 30, -150 + u * 700, 16, 10, u * 6, 0, 6.28); g.fill(); }
  };
  if (st > 0 && fadeIn < 1) layerFX(g => drawState(g, st - 1), { blur: 6, alpha: .82 * (1 - fadeIn), comp: 'multiply' });
  layerFX(g => drawState(g, st), { blur: 6, alpha: .82 * (st === 0 ? seg(t, 46.6, 47.0) : fadeIn), comp: 'multiply' });
  // paper fibres + kumiko lattice
  camT(c, 1000, ctx);
  ctx.strokeStyle = 'rgba(255,240,210,.06)'; ctx.lineWidth = 2;
  for (let i = 0; i < 70; i++) { const y = -800 + hash(i) * 1600, x = -1300 + hash(i * 3) * 2600; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y + 10, x + 90, y - 5); ctx.stroke(); }
  ctx.fillStyle = '#1a0c05';
  for (let x = -1300; x <= 1300; x += 260) ctx.fillRect(x - 9, -800, 18, 1600);
  for (let y = -800; y <= 800; y += 200) ctx.fillRect(-1300, y - 8, 2600, 16);
  ctx.fillRect(-1300, -800, 2600, 70); ctx.fillRect(-1300, 700, 2600, 120);
  reset(ctx);
  // light pulses with each year
  const pulse = Math.max(...states.slice(1).map(s => Math.exp(-Math.pow((t - s) * 7, 2))));
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,190,110,${.18 * pulse})`; ctx.fillRect(0, 0, W, H); reset(ctx);
  SNOW.gentle.draw(ctx, t, { x: 0, y: 0, z: 0 }, { x: 2, y: -2, z: 0 }, { focus: 2200, dofK: 18, maxBlur: 26, color: '255,225,190', alpha: .7 });
  post(t, { vig: .7 });
}

// S9 52–59: by the fire; he remembers
function seatedYuki(g, t, o = {}) {
  const sew = o.sew ?? 1, warm = o.light ?? 1;
  const kim = mixColor('#5c6f78', '#cdbfb2', warm * .7), shade = mixColor('#1d2a30', '#5a4234', warm * .7);
  // hair down the back
  g.fillStyle = '#07090b'; g.beginPath(); g.moveTo(40, -560); g.quadraticCurveTo(140, -400, 160, -120); g.quadraticCurveTo(110, -200, 60, -380); g.closePath(); g.fill();
  // body kneeling, facing left
  const gr = g.createLinearGradient(-200, 0, 200, 0); gr.addColorStop(0, mixColor('#9fb1b6', '#ffd3a8', warm)); gr.addColorStop(.4, kim); gr.addColorStop(1, shade);
  g.fillStyle = gr; g.beginPath(); g.moveTo(-40, -520); g.quadraticCurveTo(-90, -470, -120, -330); g.quadraticCurveTo(-220, -140, -260, 0); g.lineTo(220, 0); g.quadraticCurveTo(200, -200, 120, -330); g.quadraticCurveTo(110, -470, 60, -520); g.closePath(); g.fill();
  // head (profile left)
  g.fillStyle = mixColor('#c5d0d2', '#ffd9bf', warm); g.beginPath(); g.moveTo(-20, -650); g.quadraticCurveTo(-58, -640, -62, -600); g.lineTo(-74, -585); g.lineTo(-60, -575); g.quadraticCurveTo(-64, -560, -56, -552); g.quadraticCurveTo(-60, -535, -40, -525); g.quadraticCurveTo(0, -520, 30, -540); g.quadraticCurveTo(60, -600, 30, -650); g.closePath(); g.fill();
  g.fillStyle = '#07090b'; g.beginPath(); g.moveTo(-40, -640); g.quadraticCurveTo(-10, -700, 50, -660); g.quadraticCurveTo(70, -600, 40, -540); g.quadraticCurveTo(30, -600, -5, -625); g.quadraticCurveTo(-25, -615, -40, -640); g.fill();
  g.strokeStyle = '#2a1a16'; g.lineWidth = 3; g.beginPath(); g.moveTo(-50, -600); g.lineTo(-36, -598); g.stroke();
  // cloth on lap + sewing arm
  g.fillStyle = '#1d2b45'; g.beginPath(); g.ellipse(-120, -250, 150, 50, -.1, 0, 6.28); g.fill();
  const hy = -300 - Math.max(0, Math.sin(t * 2.2)) * 160 * sew;
  g.strokeStyle = kim; g.lineWidth = 50; g.lineCap = 'round'; g.beginPath(); g.moveTo(20, -460); g.quadraticCurveTo(-60, -340, -130, hy + 20); g.stroke();
  g.fillStyle = mixColor('#c5d0d2', '#ffd9bf', warm); g.beginPath(); g.ellipse(-150, hy, 30, 20, 0, 0, 6.28); g.fill();
  g.strokeStyle = '#ff2a1c'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-150, hy); g.quadraticCurveTo(-200, (hy - 250) / 2 + 40, -170, -255); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,90,60,.4)'; g.lineWidth = 10; g.filter = 'blur(4px)'; g.stroke(); g.restore();
}
function scene9(t) {
  const k = seg(t, 51.7, 59.1);
  const c = { x: lerp(-180, 60, E.io(k)), y: lerp(-40, -90, k), z: lerp(0, 160, E.io(k)), roll: lerp(.025, -.01, k) };
  const blue = Math.max(Math.exp(-Math.pow((t - 56.0) * 6, 2)), Math.exp(-Math.pow((t - 56.35) * 8, 2)) * .7);
  const fireI = (1 - .35 * seg(t, 57.0, 58.6)) * (1 - .6 * blue);
  woodWall(ctx, c, 1800, '#5c3019', '#0e2427', fireI * (1 - blue));
  // shelf & hanging herbs on wall
  camT(c, 1800, ctx); ctx.fillStyle = 'rgba(20,10,6,.85)'; ctx.fillRect(500, -380, 700, 26);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(560 + i * 110, -354); ctx.lineTo(530 + i * 110, -170); ctx.lineTo(600 + i * 110, -170); ctx.fill(); }
  reset(ctx);
  floorPlane(ctx, c, 560, '#4a2a17', '#0c1a1c', fireI * (1 - blue), 1800);
  hearth(ctx, t, c, 1150, -180, 330, fireI, blue);
  // her
  camT(c, 1250, ctx); ctx.translate(380, 470); ctx.scale(.9, .9); seatedYuki(ctx, t, { sew: 1 - seg(t, 58.0, 58.4), light: fireI * (1 - blue) }); reset(ctx);
  // him, foreground OTS (out of focus)
  layerFX(g => {
    camT(c, 820, g); g.translate(-420, 470); g.scale(1.1, 1.1); g.fillStyle = '#0a0705';
    g.beginPath(); g.moveTo(-500, 400); g.quadraticCurveTo(-420, 60, -120, 20); g.quadraticCurveTo(80, 10, 200, 120); g.lineTo(260, 400); g.fill();
    g.beginPath(); g.ellipse(-60, -120, 120, 150, .15, 0, 6.28); g.fill(); g.beginPath(); g.arc(-70, -290, 40, 0, 6.28); g.fill();
    g.strokeStyle = `rgba(255,150,80,${.7 * fireI * (1 - blue)})`; g.lineWidth = 10; g.beginPath(); g.ellipse(-60, -120, 120, 150, .15, -.9, .9); g.stroke();
  }, { blur: 18 });
  // warm grade / blue flash
  reset(ctx); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mixColor('#ffe2c4', '#7fb4c4', blue); ctx.fillRect(0, 0, W, H); reset(ctx);
  // memory flash-frames of her eyes
  if ((t > 55.93 && t < 56.03) || (t > 56.27 && t < 56.36)) { ctx.save(); scene6(39.0, true); ctx.restore(); reset(ctx); ctx.fillStyle = 'rgba(160,240,255,.25)'; ctx.fillRect(0, 0, W, H); }
  post(t, { vig: .7 });
}

// S10 59–63: the red thread snaps; frost
function scene10(t) {
  const k = seg(t, 59, 63);
  const sc = lerp(.9, 1.06, E.io(k)) * (1 + (t > 60.18 && t < 60.4 ? .012 * Math.sin((t - 60.18) * 90) : 0));
  reset(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 + lerp(30, -20, k), H / 2 + 20); ctx.rotate(lerp(.03, -.01, k)); ctx.scale(sc, sc);
  const warm = 1 - E.io(seg(t, 60.3, 62.2));
  handsSew(ctx, t, { tension: E.io(seg(t, 59.1, 60.15)), snap: t >= 60.18 ? seg(t, 60.18, 61.1) : 0, warm });
  reset(ctx);
  // warm firelight → ice
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mixColor('#9fd0dc', '#ffcf9a', warm); ctx.fillRect(0, 0, W, H); reset(ctx);
  ctx.globalCompositeOperation = 'screen'; const gl = ctx.createRadialGradient(W * .2, H, 0, W * .2, H, 1400); gl.addColorStop(0, `rgba(255,120,50,${.35 * warm})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); reset(ctx);
  post(t, { vig: .65 });
}

// S11+12 63–73: her storm, the children, and she melts into the blizzard
let FIG_LOCAL = null;
function ensureFigLocal() {
  if (FIG_LOCAL) return;
  // sample her silhouette in local coords (feet origin), scale .5 into a 600x620 canvas
  const pts = samplePoints(g => { g.translate(300, 600); g.scale(.55, .55); yuki(g, 68.6, { silhouette: '#fff', wind: .7, rise: .15 }); }, 1600, 7, 600, 620, 2);
  FIG_LOCAL = pts.map(([x, y]) => [(x - 300) / .55, (y - 600) / .55]);
}
function cam11(t) {
  const a = E.io(seg(t, 63, 65.7)), b = E.io(seg(t, 65.6, 67.6)), d = E.i(seg(t, 71.0, 73.1));
  let x = lerp(lerp(-120, -60, a), 760, b), y = lerp(lerp(-60, -140, a), 110, b), z = lerp(lerp(0, 260, a), 180, b), roll = lerp(-.04, .015, a) * (1 - b);
  // after the pan: settle back to her for the dissolve, then dolly to the door
  const back = E.io(seg(t, 68.2, 69.4));
  x = lerp(x, -200, back); y = lerp(y, -120, back); z = lerp(z, 120, back);
  x = lerp(x, -1180, d); y = lerp(y, -120, d); z = lerp(z, 1240, d);
  return { x, y, z, roll };
}
function scene11(t) {
  ensureFigLocal();
  const c = cam11(t), cp = cam11(t - DT);
  const rise = E.o(seg(t, 63.4, 64.9)) * (1 - E.io(seg(t, 65.6, 67.2)) * .85);
  const glow = 1 - E.io(seg(t, 65.8, 67.4)) * .9;
  const doorOpen = E.o(seg(t, 68.7, 69.3));
  woodWall(ctx, c, 1700, '#3a2218', '#0d2427', .08);
  // door on back wall (left)
  camT(c, 1690, ctx);
  const dx = -1300, dw = 260, dTop = -460, dBot = 520;
  const og = ctx.createLinearGradient(0, dTop, 0, dBot); og.addColorStop(0, '#9ccfd3'); og.addColorStop(1, '#e8f3f1');
  ctx.fillStyle = og; ctx.fillRect(dx, dTop, dw, dBot - dTop);
  ctx.fillStyle = '#1b130d'; ctx.fillRect(dx + dw * doorOpen, dTop, dw, dBot - dTop);
  ctx.strokeStyle = '#0d0907'; ctx.lineWidth = 14; ctx.strokeRect(dx - 7, dTop - 7, dw * 2 + 14, dBot - dTop + 14);
  reset(ctx);
  // light shaft from door
  if (doorOpen > 0) { const p0 = proj(c, dx, dTop, 1690), p1 = proj(c, dx + dw, dBot, 1690); reset(ctx); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(30px)'; ctx.fillStyle = `rgba(150,220,230,${.35 * doorOpen})`; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p0[1]); ctx.lineTo(p1[0] + 700, H + 100); ctx.lineTo(p0[0] + 200, H + 100); ctx.fill(); reset(ctx); }
  floorPlane(ctx, c, 560, '#2a1a12', '#0b1a1c', .15, 1700);
  // children under the red quilt (warm embers nearby)
  const kidFocus = E.io(seg(t, 65.6, 67.2)) * (1 - seg(t, 68.2, 69.0));
  layerFX(g => {
    camT(c, 1350, g); g.translate(820, 360);
    g.save(); g.globalCompositeOperation = 'lighter'; const eg = g.createRadialGradient(-280, 40, 0, -280, 40, 600); eg.addColorStop(0, 'rgba(255,90,30,.35)'); eg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = eg; g.fillRect(-900, -500, 1400, 1000); g.restore();
    g.scale(1.35, 1.35);
    g.fillStyle = '#d9d0c4'; g.fillRect(-330, -10, 640, 60);
    [-200, -20, 150].forEach((x, i) => { const y = -34 + i * 4, r = 46 - i * 5;
      g.fillStyle = '#f2dccb'; g.beginPath(); g.ellipse(x, y + 8, r * .92, r * .78, 0, 0, 6.28); g.fill();
      g.fillStyle = '#0b0807'; g.beginPath(); g.ellipse(x, y - 6, r, r * .62, 0, 3.14, 6.28); g.fill(); g.beginPath(); g.ellipse(x - r * .4, y, r * .5, r * .5, 0, 0, 6.28); g.fill();
      g.strokeStyle = '#5a3a30'; g.lineWidth = 2.5; g.beginPath(); g.arc(x + r * .25, y + 12, 7, .2, 2.9); g.stroke(); g.beginPath(); g.arc(x - r * .05, y + 12, 7, .2, 2.9); g.stroke(); });
    const qg = g.createLinearGradient(0, -60, 0, 60); qg.addColorStop(0, '#f0452f'); qg.addColorStop(1, '#8e1612');
    g.fillStyle = qg; g.beginPath(); g.moveTo(-330, 0); g.quadraticCurveTo(-200, -60, 0, -26); g.quadraticCurveTo(200, -66, 330, 0); g.lineTo(340, 60); g.lineTo(-340, 60); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,215,170,.35)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(-320 + i * 55, 55); g.lineTo(-290 + i * 55, 5); g.lineTo(-260 + i * 55, 55); g.stroke(); }
    g.save(); g.globalCompositeOperation = 'lighter'; const wg = g.createRadialGradient(-150, 0, 0, -150, 0, 420); wg.addColorStop(0, 'rgba(255,110,40,.28)'); wg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = wg; g.fillRect(-600, -400, 1000, 800); g.restore();
  }, { blur: lerp(10, 0, kidFocus) });
  // Minokichi on the floor (foreground right)
  layerFX(g => { camT(c, 1000, g); g.fillStyle = '#9fd3da'; kneeler(g, 306, 522, .95, { flip: true, hair: 'bun', bend: -.12 }); g.fillStyle = '#070505'; kneeler(g, 300, 520, .95, { flip: true, hair: 'bun', bend: -.12 }); }, { blur: lerp(3, 12, kidFocus) });
  // her — dissolving from the feet up during 69–71.6
  const dis = seg(t, 69.0, 71.6);
  const line = lerp(60, -1150, E.io(dis)); // local y above which she remains
  layerFX(g => {
    camT(c, 1300, g); g.translate(-200, 520); g.scale(.86, .86);
    if (dis > 0) { g.beginPath(); g.rect(-1400, -2600, 2800, 2600 + line); g.clip(); }
    yuki(g, t, { wind: .7 + rise * .6, rise, glow, rim: .8 });
  }, { blur: lerp(0, 10, kidFocus) });
  // dissolve particles → out the door
  if (dis > 0) {
    reset(ctx); ctx.lineCap = 'round';
    const r = rng(5);
    for (let i = 0; i < FIG_LOCAL.length; i++) {
      const [lx, ly] = FIG_LOCAL[i], j = r();
      const rel = (ly - 60) / -1210; // 0 at feet → 1 at head
      const t0 = 69.0 + rel * 2.6 * .95 + j * .15;
      if (t < t0) continue;
      const u = (t - t0) / 2.4; if (u > 1) continue;
      const wx0 = -200 + lx * .86, wy0 = 520 + ly * .86;
      const tx = dx + dw * .5 + (j - .5) * 200, ty = lerp(dTop, dBot, .3 + j * .4);
      const e = E.i(clamp(u * 1.1));
      const wx = lerp(wx0, tx, e) + Math.sin(u * 7 + i) * 90 * (1 - e) + fbm(i + t) * 40, wy = lerp(wy0, ty, e) - Math.sin(u * Math.PI) * 260 * j;
      const Dp = lerp(1300, 1690, e);
      const a = proj(c, wx, wy, Dp), b = proj(cp, wx - 14 * e, wy, Dp);
      ctx.strokeStyle = `rgba(235,252,252,${(1 - u) * .9})`; ctx.lineWidth = 3 * a[2];
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0] + .1, b[1]); ctx.stroke();
    }
    reset(ctx);
  }
  SNOW.room.draw(ctx, t, c, cp, { focus: 1300, dofK: 8, alpha: .35 + rise * .6 + doorOpen * .4 });
  // cold grade
  reset(ctx); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#86b9c2'; ctx.fillRect(0, 0, W, H); reset(ctx);
  post(t, { vig: .7 });
}

// S13 73–76.6: wide, hut in the storm; a white figure on the ridge
function cam13(t) { const k = E.o(seg(t, 72.8, 76.8)); return { x: lerp(-200, 40, k), y: lerp(-40, -200, k), z: lerp(700, 0, k), roll: lerp(.03, 0, k) }; }
function scene13(t) {
  const c = cam13(t), cp = cam13(t - DT);
  sky(ctx, '#06100f', '#1d3d3f', [W * .5, H * .25, 900, 'rgba(160,210,210,.14)']);
  mountains(ctx, c, 16000, 'm13a', '#122c30', '#527f7f', 71, 360, 30000, 7000);
  mountains(ctx, c, 6500, 'm13b', '#0d2125', '#7aa3a1', 73, 360, 12000, 2500);
  groundPlane(ctx, c, 360, '#4b6b6c', '#dde7e3');
  drawForest(ctx, FOREST13, c, TONE_NIGHT);
  fogBand(ctx, c, 3000, 280, 300, '#7aa8a6', .25);
  camT(c, 2700, ctx); ctx.translate(-420, 360); ctx.scale(.75, .75); hutExterior(ctx, t, { glow: 1 }); reset(ctx);
  // the ridge and her
  camT(c, 3200, ctx);
  ctx.fillStyle = '#0b1c1f'; ctx.beginPath(); ctx.moveTo(500, 400); ctx.quadraticCurveTo(900, 120, 1300, 140); ctx.quadraticCurveTo(1700, 160, 2400, 400); ctx.fill();
  ctx.fillStyle = 'rgba(220,235,232,.8)'; ctx.beginPath(); ctx.moveTo(600, 330); ctx.quadraticCurveTo(900, 120, 1300, 140); ctx.quadraticCurveTo(1700, 160, 2300, 360); ctx.quadraticCurveTo(1700, 190, 1300, 165); ctx.quadraticCurveTo(900, 150, 600, 330); ctx.fill();
  const fa = seg(t, 73.6, 74.4) * (1 - seg(t, 75.6, 76.3));
  if (fa > 0) { ctx.translate(1300, 142); ctx.scale(.2, .2); ctx.globalAlpha = fa; yuki(ctx, t, { wind: 1.3, glow: .8 }); }
  reset(ctx);
  SNOW.storm.draw(ctx, t, c, cp, { focus: 1200, dofK: 10, alpha: 1 });
  post(t, { vig: .7 });
}

// S14 76.6–84: camellia and the broken red thread
function scene14(t) {
  const k = seg(t, 76.6, 84);
  const sc = lerp(.92, 1.08, E.io(k));
  sky(ctx, '#8aa5a6', '#d9e4e1');
  reset(ctx); ctx.translate(W / 2, H / 2); ctx.rotate(lerp(.04, -.02, E.io(k))); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
  // snow surface with sparkles
  const sg = ctx.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#b5c9c8'); sg.addColorStop(1, '#f1f6f4'); ctx.fillStyle = sg; ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.save(); ctx.filter = 'blur(25px)'; ctx.fillStyle = 'rgba(110,145,150,.35)';
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(hash(i) * W, hash(i * 7) * H, 300, 70, .1, 0, 6.28); ctx.fill(); } ctx.restore();
  for (let i = 0; i < 160; i++) { const x = hash(i * 1.7) * W, y = hash(i * 2.3) * H, tw = Math.max(0, Math.sin(t * 3 + i * 1.1)); ctx.fillStyle = `rgba(255,255,255,${.85 * tw * tw})`; ctx.fillRect(x, y, 3, 3); }
  // red thread (broken) lying in the snow
  ctx.strokeStyle = 'rgba(60,80,85,.25)'; ctx.lineWidth = 9; ctx.filter = 'blur(4px)';
  const thread = () => { ctx.beginPath(); ctx.moveTo(-100, H * .82); ctx.bezierCurveTo(W * .25, H * .7, W * .3, H * .95, W * .47, H * .66); };
  ctx.save(); ctx.translate(6, 8); thread(); ctx.stroke(); ctx.restore(); ctx.filter = 'none';
  ctx.strokeStyle = '#d0221a'; ctx.lineWidth = 5; thread(); ctx.stroke();
  ctx.save(); ctx.translate(W * .56, H * .52); ctx.scale(.9, .9); camellia(ctx, t, { frost: E.io(seg(t, 77.9, 79.6)) }); ctx.restore();
  reset(ctx);
  // frost wave crossing
  const fw = seg(t, 77.6, 79.8);
  if (fw > 0 && fw < 1) { ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(50px)'; const x = lerp(-600, W + 600, E.io(fw)); const gr = ctx.createLinearGradient(x - 500, 0, x + 300, 0); gr.addColorStop(0, 'rgba(230,250,250,0)'); gr.addColorStop(.7, 'rgba(230,250,250,.55)'); gr.addColorStop(1, 'rgba(230,250,250,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); reset(ctx); }
  SNOW.gentle.draw(ctx, t, { x: 0, y: 0, z: 0 }, { x: 0, y: -3, z: 0 }, { focus: 1000, dofK: 14, maxBlur: 24, color: '255,255,255', alpha: .9 });
  // title
  const ta = seg(t, 80.6, 81.6) * (1 - seg(t, 83.0, 83.8));
  if (ta > 0) {
    reset(ctx); ctx.globalAlpha = ta; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 150px ShipporiB1'; ctx.fillStyle = '#1b2b2e'; ctx.shadowColor = 'rgba(255,255,255,.8)'; ctx.shadowBlur = 20;
    ctx.fillText('雪', 300, H * .36); ctx.fillText('女', 300, H * .36 + 160);
    ctx.shadowBlur = 0; ctx.font = '600 40px CormorantSC'; ctx.letterSpacing = '20px'; ctx.fillStyle = '#2c4144'; ctx.fillText('ЮКИ-ОННА', 310, H * .36 + 300); ctx.letterSpacing = '0px';
    reset(ctx);
  }
  post(t, { vig: .5, grain: .05 });
}

// =========================== timeline ===========================
const SCENES = [
  [0, 5.0, scene1], [5.0, 12.0, scene2], [12.0, 20.4, scene3], [20.4, 27.0, scene4], [27.0, 32.5, scene5],
  [32.5, 42.0, t => scene6(t)], [42.0, 46.6, scene7], [46.6, 52.0, scene8], [52.0, 59.0, scene9], [59.0, 63.0, scene10],
  [63.0, 73.0, scene11], [73.0, 76.6, scene13], [76.6, END + 1, scene14],
];
const DISSOLVES = [[51.7, 52.2, 7, 8]]; // [t0,t1, fromIdx, toIdx]

function pulse(t, a, peak, b) { return t < a || t > b ? 0 : t < peak ? E.io(seg(t, a, peak)) : 1 - E.io(seg(t, peak, b)); }
function overlays(t) {
  // frost on the lens
  const f1 = pulse(t, 3.3, 5.0, 6.5), f2 = pulse(t, 60.4, 63.0, 63.8);
  if (f1 > 0) frost(f1, f1 * f1 * .62);
  if (f2 > 0) frost(f2, f2 * f2 * .5);
  // white-outs
  const wh = Math.max(pulse(t, 11.45, 12.0, 12.9), pulse(t, 41.2, 42.0, 42.9), pulse(t, 76.15, 76.6, 77.4) * .92);
  if (wh > 0) { reset(ctx); ctx.fillStyle = `rgba(240,250,250,${wh})`; ctx.fillRect(0, 0, W, H); }
  // blizzard gusts
  const gu = Math.max(pulse(t, 19.9, 20.4, 20.9), pulse(t, 72.5, 73.0, 73.5));
  if (gu > 0) {
    reset(ctx); ctx.fillStyle = `rgba(215,235,235,${gu * .85})`; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `rgba(255,255,255,${gu * .8})`; ctx.lineCap = 'round';
    for (let i = 0; i < 160; i++) { const y = hash(i) * H, x = ((hash(i * 3) * W * 2 - t * 3000 * (1 + hash(i * 5))) % (W * 2) + W * 2) % (W * 2) - W * .4; ctx.lineWidth = 2 + hash(i * 7) * 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 300 + hash(i) * 400, y - 40); ctx.stroke(); }
    reset(ctx);
  }
  // sliding door wipe (dark wood panel), fully covering at 27.0
  const pw = seg(t, 26.55, 27.45);
  if (pw > 0 && pw < 1) {
    const L = W + 60 - (W * 2.5) * E.io(pw), PW = W * 1.3;
    reset(ctx);
    const smear = 50 * Math.sin(pw * Math.PI);
    ctx.filter = `blur(${smear * .4}px)`;
    ctx.fillStyle = '#2a1b12'; ctx.fillRect(L, 0, PW, H);
    for (let i = 0; i < 14; i++) { ctx.fillStyle = `rgba(0,0,0,${.25 + .2 * hash(i)})`; ctx.fillRect(L + i * PW / 14, 0, 6, H); }
    ctx.fillStyle = '#140d08'; ctx.fillRect(L, 0, 40, H); ctx.fillRect(L + PW - 40, 0, 40, H); ctx.fillRect(L, H * .5 - 20, PW, 40);
    reset(ctx);
  }
  // fire died → darkness, then eyes
  const bl = pulse(t, 31.9, 32.5, 32.6);
  if (bl > 0) { reset(ctx); ctx.fillStyle = `rgba(0,0,0,${bl})`; ctx.fillRect(0, 0, W, H); }
  const endFade = seg(t, 83.0, 84.0);
  if (endFade > 0) { reset(ctx); ctx.fillStyle = `rgba(0,0,0,${E.io(endFade)})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- kinetic subtitles ----------
const EMPH = { 'дыханием.': 'ice', 'никому': 'blow', 'застыла.': 'ice', 'рассказал.': 'red', 'остановилось.': 'stop', 'она.': 'redEnd', 'я»,': 'ice' };
function subtitles(t) {
  const on = TL.some((L, i) => t > L.words[0][1] - .3 && t < L.end + 1.2);
  if (on) { reset(ctx); ctx.fillStyle = vgrad(ctx, H - 330, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.42)']]); ctx.fillRect(0, H - 330, W, 330); }
  for (let li = 0; li < TL.length; li++) {
    const L = TL[li], next = TL[li + 1];
    const tIn = L.words[0][1] - .12, tOut = Math.min(L.end + .9, next ? next.start - .05 : 999);
    if (t < tIn || t > tOut + .5) continue;
    const yuki = L.who === 'y', isLast = L.id === 'L17';
    const size = yuki ? 62 : 56;
    ctx.font = `${yuki ? 'italic 500' : '500'} ${size}px ${yuki ? 'CormorantI' : 'Corm'}`;
    const sp = ctx.measureText(' ').width;
    const widths = L.words.map(([w]) => ctx.measureText(w).width);
    const total = widths.reduce((a, b) => a + b, 0) + sp * (widths.length - 1);
    let x = W / 2 - total / 2; const y = H - 118 - (isLast ? 0 : 0);
    const out = seg(t, tOut, tOut + .5);
    L.words.forEach(([w, wt], i) => {
      const a = E.o(seg(t, wt - .06, wt + .32));
      if (a <= 0) { x += widths[i] + sp; return; }
      const em = EMPH[w];
      reset(ctx); ctx.font = `${yuki ? 'italic 500' : '500'} ${size}px ${yuki ? 'CormorantI' : 'Corm'}`; ctx.textBaseline = 'alphabetic';
      let dy = (1 - a) * 16 - out * 14, alpha = a * (1 - out), blur = (1 - a) * 8 + out * 6, dx = 0;
      let col = yuki ? '#c9f2f6' : '#f3f0e8';
      if (em === 'ice') col = mixColor('#f3f0e8', '#9feef6', seg(t, wt, wt + .5));
      if (em === 'red' || em === 'redEnd') col = mixColor('#f3f0e8', '#ff5340', seg(t, wt + .1, wt + .6));
      if (em === 'blow') { const bk = E.i(seg(t, wt + .9, wt + 2.0)); dx = bk * 220; alpha *= 1 - bk; blur += bk * 10; }
      if (em === 'stop' && t > wt + .7) alpha *= 1 - seg(t, wt + .7, wt + .75) * .6;
      ctx.globalAlpha = alpha; if (blur > .3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
      ctx.shadowColor = yuki || em === 'ice' ? 'rgba(80,220,235,.65)' : 'rgba(0,0,0,.85)'; ctx.shadowBlur = yuki || em === 'ice' ? 22 : 14;
      ctx.fillStyle = col; ctx.fillText(w, x + dx, y + dy);
      if (em === 'ice') { // crystal sparkle
        ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(230,255,255,${alpha * Math.max(0, Math.sin((t - wt) * 4))})`; ctx.lineWidth = 1.2; ctx.globalAlpha *= .5;
        for (let s = 0; s < 3; s++) { const sx = x + widths[i] * (.2 + s * .3), sy = y - size * .7 + s * 8; for (let q = 0; q < 3; q++) { const an = q * Math.PI / 3; ctx.beginPath(); ctx.moveTo(sx - Math.cos(an) * 9, sy - Math.sin(an) * 9); ctx.lineTo(sx + Math.cos(an) * 9, sy + Math.sin(an) * 9); ctx.stroke(); } }
      }
      if (em === 'blow') { // the word turns to snow dust
        const bk = seg(t, wt + .8, wt + 2.2); ctx.filter = 'none'; ctx.shadowBlur = 0;
        for (let q = 0; q < 50; q++) { const u = clamp(bk * 1.4 - hash(q) * .4); if (u <= 0 || u >= 1) continue; ctx.fillStyle = `rgba(240,250,250,${(1 - u) * .9})`; ctx.fillRect(x + hash(q * 3) * widths[i] + u * 380, y - hash(q * 5) * size * .8 - u * 60 * hash(q * 7), 3, 3); }
      }
      x += widths[i] + sp;
    });
    reset(ctx);
  }
}

// ---------- frame ----------
function sceneAt(t) { for (let i = 0; i < SCENES.length; i++) if (t < SCENES[i][1]) return i; return SCENES.length - 1; }
window.renderAt = function (t) {
  reset(ctx); ctx.clearRect(0, 0, W, H);
  const d = DISSOLVES.find(([a, b]) => t >= a && t < b);
  if (d) {
    SCENES[d[2]][2](t); const g = BUF[1].getContext('2d'); reset(g); g.clearRect(0, 0, W, H); g.drawImage(cv, 0, 0);
    reset(ctx); SCENES[d[3]][2](t); reset(ctx); ctx.globalAlpha = 1 - E.io(seg(t, d[0], d[1])); ctx.drawImage(BUF[1], 0, 0); reset(ctx);
  } else SCENES[sceneAt(t)][2](t);
  overlays(t);
  subtitles(t);
  reset(ctx);
};
window.READY = document.fonts.ready.then(() => Promise.all(['500 50px Corm', 'italic 500 50px CormorantI', '600 50px CormorantSC', '800 50px ShipporiB1'].map(f => document.fonts.load(f, 'Аа雪女'))));
