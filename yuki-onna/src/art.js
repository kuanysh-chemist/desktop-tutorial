// Art: characters, props, environments. Local coordinates; caller sets transform.

// ---------- Yuki-onna, standing (origin at feet, ~1000 units tall) ----------
function yuki(g, t, o = {}) {
  const wind = o.wind ?? 1, riseA = o.rise ?? 0, rise = riseA * .25, glow = o.glow ?? 0, sil = o.silhouette, rim = o.rim ?? .6;
  const kim = sil || o.kimono || '#e8eef0', shade = sil || '#8fb3b8', hairC = sil || '#07090b';
  const fl = (k, a = 1) => fbm(t * 1.3 + k) * a * wind;
  g.save();
  // --- storm mane: hair radiating upward and outward when her anger rises
  if (riseA > .02) {
    g.strokeStyle = hairC; g.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const a = -Math.PI / 2 + ((i * .618) % 1 - .5) * 3.1, L = (420 + 620 * hash(i * 3.7)) * E.o(riseA), w0 = 30 - (i % 6) * 3.5;
      let x = (hash(i) - .5) * 60, y = -900;
      for (let k = 1; k <= 14; k++) {
        const u = k / 14, ang = a + Math.sin(u * 3.2 + t * 2.4 + i) * .42 * u + fbm(t * .9 + i * .7) * .35 * u - .25 * wind * u;
        const nx = x + Math.cos(ang) * L / 14, ny = y + Math.sin(ang) * L / 14;
        g.lineWidth = Math.max(1, w0 * (1 - u * .92)); g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke(); x = nx; y = ny;
      }
    }
  }
  // --- hair mass behind (streams with wind)
  g.fillStyle = hairC;
  g.beginPath();
  const hx = 0, hy = -885;
  g.moveTo(hx + 44, hy - 30);
  const N = 14;
  const len = lerp(640, 900, rise);
  for (let i = 0; i <= N; i++) { // right/back edge going down then streaming left
    const k = i / N, y = hy + k * len * lerp(1, .15, rise) - k * k * len * rise * .9;
    const x = hx + 60 + k * 40 - k * k * 260 * wind - k * k * 520 * rise + fl(i * .7 + 3, 26 * k) + Math.sin(k * 5 + t * 2) * 10 * k;
    g.lineTo(x, y);
  }
  for (let i = N; i >= 0; i--) {
    const k = i / N, y = hy + k * len * lerp(1, .15, rise) - k * k * len * rise * .9 + 30 * k;
    const x = hx - 50 - k * 50 - k * k * 330 * wind - k * k * 380 * rise + fl(i * .6 + 9, 30 * k) - lerp(0, 220, rise) * Math.sin(k * 3);
    g.lineTo(x, y);
  }
  g.closePath(); g.fill();
  // flying strands
  g.strokeStyle = hairC; g.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const k0 = .25 + (i % 8) / 10, w = 2 + (i % 3);
    g.lineWidth = w; g.beginPath();
    const sx = hx - 30 + (i % 5) * 18, sy = hy + 40 + i * 22 * (1 - rise * .7);
    g.moveTo(sx, sy);
    const ex = sx - 240 * wind * k0 - 380 * rise - 60 * (i % 4) + fl(i * 1.9, 60), ey = sy + 160 * (1 - rise) - 420 * rise * k0 + fl(i * 2.3 + 1, 50);
    g.quadraticCurveTo(lerp(sx, ex, .5) + fl(i + 5, 50), lerp(sy, ey, .5) - 40, ex, ey); g.stroke();
  }
  // --- sleeves
  const sw = (side) => {
    g.beginPath();
    const s = side, x0 = s * 105, y0 = -790;
    g.moveTo(x0, y0);
    g.quadraticCurveTo(x0 + s * 90, y0 + 40, x0 + s * 100 + fl(side * 4 + 1, 25), -520);
    g.quadraticCurveTo(x0 + s * 110 + fl(side * 4 + 2, 40) - 60 * wind, -420, x0 + s * 30 - 90 * wind * (s < 0 ? 1.2 : .6) + fl(side * 4 + 3, 40), -380 + fl(side + 7, 20));
    g.quadraticCurveTo(x0 - s * 10, -470, x0 - s * 40, -560);
    g.closePath();
  };
  // --- body
  const body = new Path2D();
  body.moveTo(-36, -835); body.lineTo(-112, -790);
  body.quadraticCurveTo(-120, -560, -100, -470);
  body.quadraticCurveTo(-115, -220, -125, -10);
  body.quadraticCurveTo(-160 - 120 * wind + fl(11, 30), 10, -230 * wind - 60 + fl(12, 40), 6 + fl(13, 8)); // trailing hem
  body.quadraticCurveTo(-60, 22, 0, 12); body.quadraticCurveTo(70, 20, 125, 4);
  body.quadraticCurveTo(110, -260, 98, -480);
  body.quadraticCurveTo(122, -620, 112, -790); body.lineTo(36, -835); body.closePath();
  const gr = g.createLinearGradient(-160, 0, 160, 0);
  gr.addColorStop(0, sil || '#ffffff'); gr.addColorStop(.45, kim); gr.addColorStop(1, shade);
  g.fillStyle = sil || gr; g.fill(body);
  sw(-1); g.fill(); sw(1); g.fillStyle = sil || shade; g.fill(); g.fillStyle = sil || gr;
  if (!sil) {
    // folds
    g.strokeStyle = 'rgba(70,110,118,.35)'; g.lineWidth = 3;
    [[-40, -470, -60, -20], [20, -480, 40, -10], [70, -470, 95, -30]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 10, (b + d) / 2, c, d); g.stroke(); });
    // obi
    g.fillStyle = '#b9ccd0'; g.beginPath(); g.moveTo(-108, -620); g.lineTo(110, -620); g.lineTo(104, -530); g.lineTo(-104, -530); g.closePath(); g.fill();
    g.fillStyle = P.red; g.fillRect(-104, -580, 208, 6);
    // collar with red under-collar
    g.strokeStyle = P.red; g.lineWidth = 7; g.beginPath(); g.moveTo(-36, -832); g.lineTo(8, -660); g.lineTo(44, -830); g.stroke();
    g.strokeStyle = '#f6fbfb'; g.lineWidth = 10; g.beginPath(); g.moveTo(-48, -826); g.lineTo(10, -640); g.stroke();
    // hands
    g.fillStyle = P.skin; g.beginPath(); g.ellipse(-8, -505, 30, 16, .2, 0, 6.28); g.fill();
    // rim light (moon side)
    g.save(); g.clip(body); g.strokeStyle = `rgba(210,250,255,${rim})`; g.lineWidth = 8; g.filter = 'blur(3px)'; g.translate(-6, 0); g.stroke(body); g.restore();
  }
  // --- head
  g.fillStyle = sil || P.skin; g.beginPath(); g.ellipse(0, -885, 42, 54, 0, 0, 6.28); g.fill();
  g.fillStyle = hairC; // fringe & side curtains
  g.beginPath(); g.moveTo(-50, -880); g.quadraticCurveTo(-52, -955, 0, -945); g.quadraticCurveTo(52, -950, 50, -870);
  g.quadraticCurveTo(40, -905, 18, -915); g.quadraticCurveTo(-10, -900, -20, -860); g.quadraticCurveTo(-38, -840, -50, -800); g.closePath(); g.fill();
  if (!sil) {
    g.fillStyle = '#b4172a'; g.beginPath(); g.ellipse(6, -847, 8, 3.5, 0, 0, 6.28); g.fill();
    g.strokeStyle = '#1b1d22'; g.lineWidth = 3; g.beginPath(); g.moveTo(-12, -880); g.lineTo(2, -877); g.moveTo(16, -877); g.lineTo(30, -880); g.stroke();
  }
  if (glow > 0) {
    g.globalCompositeOperation = 'lighter';
    [[-5, -878], [23, -878]].forEach(([x, y]) => { const r = g.createRadialGradient(x, y, 0, x, y, 60 * glow + 6); r.addColorStop(0, `rgba(200,255,255,${glow})`); r.addColorStop(.2, `rgba(90,220,230,${glow * .6})`); r.addColorStop(1, 'rgba(0,80,90,0)'); g.fillStyle = r; g.fillRect(x - 70, y - 70, 140, 140); });
    g.globalCompositeOperation = 'source-over';
  }
  g.restore();
}

// ---------- traveller in straw rain-cape (mino) and kasa hat ----------
function traveller(g, t, o = {}) {
  const ph = o.phase ?? 0, old = o.old, bend = o.bend ?? .1, col = o.col || '#17110d', snow = o.snow || '#dfe9e6';
  g.save(); g.rotate(bend * .3);
  const step = Math.sin(t * 4.2 + ph), step2 = Math.sin(t * 4.2 + ph + Math.PI);
  // legs
  g.strokeStyle = col; g.lineWidth = 26; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-14, -300); g.lineTo(-14 + step * 50, -20 - Math.max(0, step) * 25); g.stroke();
  g.beginPath(); g.moveTo(14, -300); g.lineTo(14 + step2 * 50, -20 - Math.max(0, step2) * 25); g.stroke();
  // mino cape: shaggy
  g.fillStyle = col; g.beginPath(); g.moveTo(-70, -640);
  const r = rng(old ? 3 : 4);
  for (let i = 0; i <= 18; i++) { const k = i / 18; g.lineTo(-70 - k * 95 + (r() - .5) * 14, -640 + k * 380); }
  for (let i = 0; i <= 16; i++) { const k = i / 16; g.lineTo(-165 + k * 330, -255 + (i % 2) * 22 + Math.sin(t * 6 + i) * 4); }
  for (let i = 18; i >= 0; i--) { const k = i / 18; g.lineTo(70 + k * 95 + (r() - .5) * 14, -640 + k * 380); }
  g.closePath(); g.fill();
  // straw texture strokes
  g.strokeStyle = 'rgba(120,95,60,.25)'; g.lineWidth = 2;
  for (let i = 0; i < 22; i++) { const x = -140 + i * 13; g.beginPath(); g.moveTo(x * .5, -620); g.lineTo(x + Math.sin(i) * 5, -262); g.stroke(); }
  // head + kasa
  g.fillStyle = col; g.beginPath(); g.arc(0, -665, 36, 0, 6.28); g.fill();
  g.beginPath(); g.moveTo(-140, -672); g.quadraticCurveTo(0, -790, 140, -672); g.quadraticCurveTo(0, -700, -140, -672); g.fill();
  // snow on hat and shoulders
  g.fillStyle = snow; g.beginPath(); g.moveTo(-120, -684); g.quadraticCurveTo(0, -792, 120, -684); g.quadraticCurveTo(0, -762, -120, -684); g.fill();
  g.globalAlpha = .8; g.beginPath(); g.moveTo(-80, -635); g.quadraticCurveTo(-40, -655, -10, -640); g.quadraticCurveTo(-50, -630, -80, -625); g.fill(); g.globalAlpha = 1;
  if (old) { // axe over shoulder
    g.strokeStyle = '#2a1d14'; g.lineWidth = 12; g.beginPath(); g.moveTo(40, -420); g.lineTo(150, -760); g.stroke();
    g.fillStyle = '#596468'; g.beginPath(); g.moveTo(140, -770); g.lineTo(205, -750); g.lineTo(190, -705); g.lineTo(150, -735); g.closePath(); g.fill();
  }
  g.restore();
}

// ---------- kneeling silhouette (for shoji shadows) ----------
function kneeler(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s); g.rotate(o.bend || 0);
  g.beginPath();
  g.moveTo(-120, 0); g.quadraticCurveTo(-130, -120, -70, -170); // back/hips
  g.quadraticCurveTo(-60, -300, -40, -380); // back
  g.quadraticCurveTo(0, -420, 50, -380); // shoulders
  g.quadraticCurveTo(70, -300, 80, -200); g.quadraticCurveTo(120, -120, 140, 0); g.closePath(); g.fill();
  // head
  g.beginPath(); g.ellipse(5, -440, 42, 50, 0, 0, 6.28); g.fill();
  if (o.hair === 'long') { g.beginPath(); g.moveTo(-30, -470); g.quadraticCurveTo(-80, -380, -70, -230); g.quadraticCurveTo(-40, -300, -15, -400); g.fill(); }
  if (o.hair === 'bun') { g.beginPath(); g.arc(-30, -480, 22, 0, 6.28); g.fill(); }
  if (o.baby) { g.beginPath(); g.ellipse(70, -250, 55, 40, -.3, 0, 6.28); g.fill(); g.beginPath(); g.arc(105, -290, 24, 0, 6.28); g.fill(); }
  if (o.beard) { g.beginPath(); g.moveTo(30, -420); g.quadraticCurveTo(60, -380, 40, -350); g.quadraticCurveTo(25, -380, 20, -400); g.fill(); }
  g.restore();
}

// ---------- hut, exterior (origin ground centre, ~760 wide) ----------
function hutExterior(g, t, o = {}) {
  const glow = o.glow ?? 1, door = o.door ?? 0;
  g.save();
  // walls
  g.fillStyle = '#21160f'; g.fillRect(-340, -330, 680, 330);
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 4;
  for (let x = -330; x < 340; x += 34) { g.beginPath(); g.moveTo(x, -330); g.lineTo(x, 0); g.stroke(); }
  g.fillStyle = '#2d1f15'; g.fillRect(-350, -340, 700, 22); g.fillRect(-350, -170, 700, 14);
  // window
  const wx = 120, wy = -260, ww = 150, wh = 110;
  const flick = .85 + .15 * noise1(t * 7);
  if (glow > 0) {
    g.fillStyle = mixColor('#3b2a1e', '#ffbf6b', glow * flick); g.fillRect(wx, wy, ww, wh);
    g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(wx + ww / 2, wy + wh / 2, 10, wx + ww / 2, wy + wh / 2, 380);
    rg.addColorStop(0, `rgba(255,150,60,${.45 * glow * flick})`); rg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = rg; g.fillRect(wx - 400, wy - 400, ww + 800, wh + 800); g.restore();
  } else { g.fillStyle = '#1a2a2c'; g.fillRect(wx, wy, ww, wh); }
  g.strokeStyle = '#1a100a'; g.lineWidth = 6; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(wx + i * ww / 4, wy); g.lineTo(wx + i * ww / 4, wy + wh); g.stroke(); }
  g.beginPath(); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke(); g.strokeRect(wx, wy, ww, wh);
  // door (sliding)
  const dx = -200, dw = 150, dh = 250;
  g.fillStyle = door > 0 ? mixColor('#120c08', '#ff9a4a', door * .8) : '#120c08'; g.fillRect(dx, -dh, dw, dh);
  g.fillStyle = '#3a281b'; g.fillRect(dx + dw * door, -dh, dw, dh);
  g.strokeStyle = '#1b120c'; g.lineWidth = 5; g.strokeRect(dx + dw * door, -dh, dw, dh);
  // roof (thatch) with heavy snow
  g.fillStyle = '#2a2016'; g.beginPath(); g.moveTo(-430, -300); g.lineTo(-210, -560); g.lineTo(210, -560); g.lineTo(430, -300); g.closePath(); g.fill();
  g.fillStyle = '#1b140e'; g.beginPath(); g.moveTo(-150, -560); g.lineTo(0, -680); g.lineTo(150, -560); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(90,70,45,.5)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = -420 + i * 21; g.beginPath(); g.moveTo(x, -300); g.lineTo(x * .5, -560); g.stroke(); }
  g.fillStyle = P.snow; g.beginPath(); g.moveTo(-445, -300); g.quadraticCurveTo(-330, -460, -215, -575); g.lineTo(215, -575); g.quadraticCurveTo(330, -460, 445, -300);
  g.quadraticCurveTo(420, -330, 380, -350); g.quadraticCurveTo(300, -390, 200, -480); g.lineTo(-200, -480); g.quadraticCurveTo(-300, -390, -380, -350); g.quadraticCurveTo(-420, -330, -445, -300); g.fill();
  g.beginPath(); g.moveTo(-160, -575); g.lineTo(0, -705); g.lineTo(160, -575); g.closePath(); g.fill();
  g.fillStyle = P.snowShade; g.globalAlpha = .6; g.beginPath(); g.moveTo(-445, -300); g.quadraticCurveTo(-420, -320, -380, -335); g.lineTo(380, -335); g.quadraticCurveTo(420, -320, 445, -300); g.quadraticCurveTo(0, -280, -445, -300); g.fill(); g.globalAlpha = 1;
  // icicles
  g.fillStyle = 'rgba(220,240,240,.8)'; for (let i = 0; i < 18; i++) { const x = -400 + i * 47; const l = 14 + hash(i) * 30; g.beginPath(); g.moveTo(x - 4, -300); g.lineTo(x + 4, -300); g.lineTo(x, -300 + l); g.fill(); }
  // snow drift
  g.fillStyle = P.snow; g.beginPath(); g.moveTo(-480, 10); g.quadraticCurveTo(-380, -60, -300, -30); g.quadraticCurveTo(0, -10, 300, -40); g.quadraticCurveTo(400, -60, 490, 10); g.closePath(); g.fill();
  g.restore();
}

// ---------- fire ----------
function fire(g, t, x, y, s, o = {}) {
  const it = o.intensity ?? 1, cold = o.cold ?? 0, lean = o.lean ?? 0;
  if (it <= .01) return;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.globalCompositeOperation = 'lighter';
  const glowR = 420 * (.6 + .4 * it) * (1 + .06 * noise1(t * 9));
  const rg = g.createRadialGradient(0, -40, 0, 0, -40, glowR);
  const c1 = `rgba(${Math.round(lerp(255, 90, cold))},${Math.round(lerp(140, 200, cold))},${Math.round(lerp(50, 255, cold))},${.55 * it})`;
  rg.addColorStop(0, c1); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(-glowR, -glowR - 40, glowR * 2, glowR * 2);
  const cols = cold > .5 ? ['#0b3a6a', '#2f86c9', '#9be7ff', '#ffffff'] : ['#8a1a0a', '#e2471b', '#ffa233', '#fff1b0'];
  for (let L = 0; L < 4; L++) {
    const sc = (1 - L * .2) * it;
    for (let k = 0; k < 5; k++) {
      const ph = k * 1.7 + L * .9, hh = (150 + 70 * noise1(t * 3.1 + ph)) * sc, ww = (38 - L * 6) * sc;
      const bx = (k - 2) * 26 * sc, sway = (noise1(t * 2.3 + ph * 2) * 30 + lean * 80) * sc;
      g.fillStyle = cols[L]; g.globalAlpha = .55;
      g.beginPath(); g.moveTo(bx - ww, 0);
      g.bezierCurveTo(bx - ww, -hh * .4, bx + sway - ww * .4, -hh * .6, bx + sway * 1.4, -hh);
      g.bezierCurveTo(bx + sway + ww * .4, -hh * .6, bx + ww, -hh * .4, bx + ww, 0); g.closePath(); g.fill();
    }
  }
  // sparks
  g.globalAlpha = 1;
  for (let i = 0; i < 14 * it; i++) {
    const life = (t * .7 + hash(i * 3.1)) % 1, sx = (hash(i) - .5) * 120 + noise1(t + i) * 40 + lean * 200 * life, sy = -life * 420;
    g.fillStyle = cold > .5 ? `rgba(180,240,255,${1 - life})` : `rgba(255,200,120,${1 - life})`;
    g.fillRect(sx, sy, 4, 4);
  }
  g.restore();
}

// ---------- red umbrella (wagasa), local origin = handle bottom ----------
function wagasa(g, t, s, o = {}) {
  const tilt = o.tilt ?? -.15;
  g.save(); g.scale(s, s); g.rotate(tilt);
  g.strokeStyle = '#2b1a10'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -330); g.stroke();
  const R = 260, h = 90;
  const gr = g.createRadialGradient(0, -360, 10, 0, -340, R);
  gr.addColorStop(0, '#ff6a4a'); gr.addColorStop(.6, '#d0261c'); gr.addColorStop(1, '#8e1010');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-R, -330);
  for (let i = 0; i <= 16; i++) { const a = i / 16; g.lineTo(-R + a * 2 * R, -330 + Math.sin(a * Math.PI * 16) * 6 + (i % 2 ? 10 : 0)); }
  g.quadraticCurveTo(R * .5, -330 - h * 1.3, 0, -330 - h * 1.25); g.quadraticCurveTo(-R * .5, -330 - h * 1.3, -R, -330); g.fill();
  g.strokeStyle = 'rgba(80,10,10,.6)'; g.lineWidth = 3;
  for (let i = 0; i <= 12; i++) { const a = i / 12; g.beginPath(); g.moveTo(0, -330 - h * 1.2); g.quadraticCurveTo(lerp(-R, R, a) * .7, -330 - h * .9, lerp(-R, R, a), -330); g.stroke(); }
  g.fillStyle = P.snow; g.globalAlpha = .85; g.beginPath(); g.moveTo(-R * .7, -380); g.quadraticCurveTo(0, -330 - h * 1.4, R * .7, -380); g.quadraticCurveTo(0, -330 - h * 1.05, -R * .7, -380); g.fill();
  g.restore();
}

// ---------- ECU: Yuki's eyes. local: centre between eyes; eyes at ±330 ----------
function eyesECU(g, t, o = {}) {
  const glow = o.glow ?? 0, open = o.open ?? 1, warm = o.warm ?? 0, look = o.look ?? 0;
  // skin
  const sk = g.createLinearGradient(0, -540, 0, 540);
  sk.addColorStop(0, mixColor('#c9d6d6', '#f0d9cc', warm)); sk.addColorStop(.5, mixColor('#e9efee', '#f6e6dc', warm)); sk.addColorStop(1, mixColor('#b8c9ca', '#e2c3b3', warm));
  g.fillStyle = sk; g.fillRect(-2600, -1700, 5200, 3400);
  // nose bridge & socket shading
  g.save(); g.filter = 'blur(30px)';
  g.fillStyle = mixColor('#7f9ea2', '#b58f80', warm); g.globalAlpha = .45;
  g.beginPath(); g.ellipse(-330, 10, 290, 150, 0, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(330, 10, 290, 150, 0, 0, 6.28); g.fill();
  g.globalAlpha = .35; g.beginPath(); g.ellipse(-60, 260, 50, 260, 0, 0, 6.28); g.fill();
  g.restore();
  // brows
  g.strokeStyle = '#1b2226'; g.lineCap = 'round';
  [-1, 1].forEach(s => { for (let i = 0; i < 26; i++) { const k = i / 25; g.lineWidth = 5 - k * 3; g.beginPath(); const x = s * (110 + k * 400), y = -230 - Math.sin(k * Math.PI) * 50 + k * 30; g.moveTo(x, y); g.lineTo(x + s * 26, y - 6 + (i % 3) * 3); g.stroke(); } });
  [-1, 1].forEach(s => {
    const cx = s * 330, cy = 0, ew = 205, eh = 92 * open;
    g.save(); g.translate(cx, cy);
    // eye white clip
    const eye = new Path2D();
    eye.moveTo(-ew * s, 10); eye.bezierCurveTo(-ew * .55 * s, -eh * 1.15, ew * .45 * s, -eh * 1.2, ew * s, -6);
    eye.bezierCurveTo(ew * .5 * s, eh * .95, -ew * .5 * s, eh * .9, -ew * s, 10); eye.closePath();
    g.fillStyle = mixColor('#dfe9ea', '#efe9e2', warm); g.fill(eye);
    g.save(); g.clip(eye);
    // iris
    const ix = look * 40, ir = 88;
    const gi = g.createRadialGradient(ix, 0, 5, ix, 0, ir);
    const ic = glow > 0 ? mixColor('#4d6670', '#9ff6ff', glow) : '#4d6670';
    gi.addColorStop(0, '#0d1418'); gi.addColorStop(.32, '#0d1418'); gi.addColorStop(.36, ic); gi.addColorStop(.8, mixColor('#2c3e46', '#3fc2d6', glow)); gi.addColorStop(1, '#10181c');
    g.fillStyle = gi; g.beginPath(); g.arc(ix, 0, ir, 0, 6.28); g.fill();
    // iris fibres
    g.strokeStyle = `rgba(${glow > .3 ? '200,255,255' : '160,190,200'},.28)`; g.lineWidth = 2;
    for (let a = 0; a < 6.28; a += .16) { g.beginPath(); g.moveTo(ix + Math.cos(a) * 34, Math.sin(a) * 34); g.lineTo(ix + Math.cos(a + .1) * 80, Math.sin(a + .1) * 80); g.stroke(); }
    // upper lid shadow on eyeball
    const sh = g.createLinearGradient(0, -eh, 0, eh * .2); sh.addColorStop(0, 'rgba(20,30,35,.55)'); sh.addColorStop(1, 'rgba(20,30,35,0)'); g.fillStyle = sh; g.fillRect(-ew, -eh * 1.2, ew * 2, eh * 1.4);
    // highlights
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(ix - 30, -30, 18, 13, -.4, 0, 6.28); g.fill();
    g.globalAlpha = .6; g.beginPath(); g.arc(ix + 34, 30, 7, 0, 6.28); g.fill(); g.globalAlpha = 1;
    g.restore();
    // lids & lashes
    g.strokeStyle = '#0c1012'; g.lineWidth = 11;
    g.beginPath(); g.moveTo(-ew * s, 10); g.bezierCurveTo(-ew * .55 * s, -eh * 1.15, ew * .45 * s, -eh * 1.2, ew * s, -6); g.stroke();
    g.lineWidth = 3; g.globalAlpha = .6; g.beginPath(); g.moveTo(-ew * .8 * s, 18); g.bezierCurveTo(-ew * .4 * s, eh * .92, ew * .4 * s, eh * .9, ew * .95 * s, 0); g.stroke(); g.globalAlpha = 1;
    // crease
    g.lineWidth = 3; g.globalAlpha = .4; g.beginPath(); g.moveTo(-ew * .8 * s, -eh * .7 - 20); g.bezierCurveTo(-ew * .3 * s, -eh * 1.55 - 10, ew * .4 * s, -eh * 1.5, ew * .9 * s, -eh * .55); g.stroke(); g.globalAlpha = 1;
    // lashes
    g.lineWidth = 4;
    for (let i = 0; i < 18; i++) {
      const k = i / 17, u = k * 2 - 1;
      const px = u * ew * s * .95, py = -Math.sqrt(Math.max(0, 1 - u * u)) * eh * 1.05 + (u * s > 0 ? -6 * u * s : 10 * -u * s);
      g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + s * u * 20, py - 26, px + s * (10 + 40 * Math.max(0, u * s)), py - 30 - 20 * Math.max(0, u * s)); g.stroke();
    }
    // frost on lashes
    if (o.frost) { g.fillStyle = `rgba(235,255,255,${o.frost})`; for (let i = 0; i < 12; i++) { const u = (i / 11) * 2 - 1; g.beginPath(); g.arc(u * ew * s * .9, -Math.sqrt(1 - u * u) * eh - 28, 4 + hash(i + s) * 4, 0, 6.28); g.fill(); } }
    g.restore();
    // glow
    if (glow > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      const r = g.createRadialGradient(cx + look * 40, 0, 0, cx + look * 40, 0, 360);
      r.addColorStop(0, `rgba(140,240,255,${.55 * glow})`); r.addColorStop(.3, `rgba(60,180,200,${.25 * glow})`); r.addColorStop(1, 'rgba(0,40,50,0)');
      g.fillStyle = r; g.fillRect(cx - 400, -400, 800, 800); g.restore();
    }
  });
  // melting snowflake / droplet on right lashes
  if (o.drop != null) {
    const d = o.drop; g.save(); g.translate(240, -70 + d * d * 160);
    if (d < .35) { g.strokeStyle = 'rgba(245,255,255,.95)'; g.lineWidth = 3; const r = 22 * (1 - d / .35 * .6); for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(k * 1.047) * r, Math.sin(k * 1.047) * r); g.stroke(); } }
    else { const gr = g.createRadialGradient(-4, -4, 1, 0, 0, 14); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(160,210,220,.5)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 11, 15, 0, 0, 6.28); g.fill(); }
    g.restore();
  }
  // hair strands across face: thin, tapered, a few soft (closer to lens)
  g.strokeStyle = '#06080a'; g.lineCap = 'round';
  for (let i = 0; i < 22; i++) {
    const left = i < 14, j = left ? i : i - 14, sway = fbm(t * .55 + i * 1.3) * 55;
    const x0 = left ? -1150 + j * 22 : 1150 - j * 26, y0 = -600 + j * 12;
    const x3 = left ? -560 + j * 34 + sway : 760 - j * 30 + sway, y3 = 600;
    const soft = i % 5 === 0;
    g.save(); if (soft) g.filter = 'blur(6px)';
    for (let k = 0; k < 3; k++) { // taper by drawing narrower over the lower part
      g.lineWidth = (soft ? 9 : 3.2) * (1 - k * .3); g.globalAlpha = .9;
      g.beginPath(); g.moveTo(x0, y0 + k * 300);
      g.bezierCurveTo(lerp(x0, x3, .3) + (left ? 250 : -200), y0 + 260, lerp(x0, x3, .7) + sway * .5, 220, x3, y3); g.stroke();
    }
    g.restore();
  }
}

// ---------- ECU: lips and finger. local: centre of mouth ----------
function lipsECU(g, t, o = {}) {
  const part = o.part ?? .2, fing = o.finger ?? 0;
  const sk = g.createLinearGradient(0, -540, 0, 540);
  sk.addColorStop(0, '#d9e3e2'); sk.addColorStop(.5, '#eef3f1'); sk.addColorStop(1, '#b3c4c5');
  g.fillStyle = sk; g.fillRect(-2600, -1700, 5200, 3400);
  g.save(); g.filter = 'blur(40px)'; g.fillStyle = 'rgba(110,140,145,.45)';
  g.beginPath(); g.ellipse(0, -420, 260, 120, 0, 0, 6.28); g.fill(); // nose shadow
  g.beginPath(); g.ellipse(0, 330, 420, 120, 0, 0, 6.28); g.fill(); // chin crease
  g.beginPath(); g.ellipse(-760, 120, 260, 520, .2, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(760, 120, 260, 520, -.2, 0, 6.28); g.fill();
  g.restore();
  // nostrils & philtrum (soft)
  g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(80,95,100,.5)'; g.beginPath(); g.ellipse(-95, -470, 50, 22, .3, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(95, -470, 50, 22, -.3, 0, 6.28); g.fill();
  g.filter = 'blur(26px)'; g.fillStyle = 'rgba(120,140,145,.22)'; g.beginPath(); g.ellipse(0, -290, 60, 130, 0, 0, 6.28); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(0, -300, 22, 110, 0, 0, 6.28); g.fill();
  g.fillStyle = 'rgba(240,170,170,.18)'; g.beginPath(); g.ellipse(-620, -260, 260, 160, 0, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(620, -260, 260, 160, 0, 0, 6.28); g.fill();
  g.restore();
  const w = 300, p = part * 40;
  // mouth interior
  g.fillStyle = '#2a0608'; g.beginPath(); g.moveTo(-w * .92, 0); g.quadraticCurveTo(0, -p * .4, w * .92, 0); g.quadraticCurveTo(0, p * 1.4, -w * .92, 0); g.fill();
  // upper lip
  const up = g.createLinearGradient(0, -140, 0, 0); up.addColorStop(0, '#9d1325'); up.addColorStop(1, '#c71d2e');
  g.fillStyle = up; g.beginPath(); g.moveTo(-w, 4);
  g.bezierCurveTo(-w * .7, -60, -w * .35, -150, -60, -128); g.quadraticCurveTo(-20, -115, 0, -98); g.quadraticCurveTo(20, -115, 60, -128);
  g.bezierCurveTo(w * .35, -150, w * .7, -60, w, 4); g.quadraticCurveTo(0, -p * .4 - 6, -w, 4); g.fill();
  // lower lip
  const lo = g.createLinearGradient(0, 0, 0, 170); lo.addColorStop(0, '#d42536'); lo.addColorStop(1, '#8b1020');
  g.fillStyle = lo; g.beginPath(); g.moveTo(-w * .96, 6); g.quadraticCurveTo(0, p * 1.4 + 8, w * .96, 6);
  g.bezierCurveTo(w * .7, 120, w * .3, 175, 0, 172); g.bezierCurveTo(-w * .3, 175, -w * .7, 120, -w * .96, 6); g.fill();
  // gloss
  g.fillStyle = 'rgba(255,235,235,.45)'; g.beginPath(); g.ellipse(-60, 95, 90, 22, -.05, 0, 6.28); g.fill();
  g.fillStyle = 'rgba(255,255,255,.65)'; g.beginPath(); g.ellipse(-70, 90, 34, 8, -.05, 0, 6.28); g.fill();
  g.strokeStyle = 'rgba(60,5,10,.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-w * .95, 4); g.quadraticCurveTo(0, p * .5, w * .95, 4); g.stroke();
  // breath vapour
  if (o.breath) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 7; i++) { const k = (o.breath + i * .13) % 1; const x = fbm(i * 3 + t) * 80 + k * 200, y = 40 - k * 260; g.globalAlpha = (1 - k) * .28 * Math.min(1, o.breath * 4); g.filter = `blur(${20 + k * 40}px)`; g.fillStyle = '#eefcff'; g.beginPath(); g.ellipse(x, y, 120 + k * 260, 60 + k * 120, 0, 0, 6.28); g.fill(); }
    g.restore();
  }
  // hair strands framing the face
  g.strokeStyle = '#05070a'; g.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1, sw = fbm(t * .5 + i * 1.7) * 50; g.lineWidth = 3 + (i % 4) * 3; g.beginPath(); g.moveTo(side * (700 + i * 18), -700); g.bezierCurveTo(side * (560 + i * 10) + sw, -200, side * (520 + i * 14) + sw, 200, side * (600 + i * 22) + sw * 1.5, 700); g.stroke(); }
  // finger (index) rising to lips: "hush"
  if (fing > 0) {
    const y = lerp(1100, 0, E.o(fing));
    finger(g, 60, y + 1300, 30, y - 170, 170, '#eef1ee', '#8fa3a5');
  }

}

// ---------- fingers pulling a red thread through indigo cloth (local: centre) ----------
function finger(g, x1, y1, x2, y2, w, skin, shade, nail = true) {
  const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
  g.save(); g.translate(x1, y1); g.rotate(ang);
  const gr = g.createLinearGradient(0, -w / 2, 0, w / 2); gr.addColorStop(0, shade); gr.addColorStop(.3, skin); gr.addColorStop(.55, skin); gr.addColorStop(1, shade);
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - w * .5, -w * .48); g.bezierCurveTo(L + w * .15, -w * .45, L + w * .15, w * .45, L - w * .5, w * .5); g.lineTo(0, w / 2); g.closePath(); g.fill();
  if (nail) { const ng = g.createLinearGradient(L - w * .9, 0, L, 0); ng.addColorStop(0, 'rgba(230,200,200,.95)'); ng.addColorStop(1, 'rgba(250,230,228,.95)'); g.fillStyle = ng; g.beginPath(); g.moveTo(L - w * .85, -w * .34); g.quadraticCurveTo(L + w * .05, -w * .38, L + w * .02, 0); g.quadraticCurveTo(L + w * .05, w * .2, L - w * .85, w * .05); g.quadraticCurveTo(L - w * .95, -w * .15, L - w * .85, -w * .34); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(L - w * .45, -w * .2, w * .25, w * .06, 0, 0, 6.28); g.fill(); }
  g.strokeStyle = 'rgba(70,60,60,.28)'; g.lineWidth = 3;
  [L * .42, L * .46, L * .74].forEach(k => { g.beginPath(); g.moveTo(k, -w * .35); g.quadraticCurveTo(k + 8, 0, k, w * .3); g.stroke(); });
  g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.ellipse(L * .5, -w * .22, L * .4, w * .08, 0, 0, 6.28); g.fill();
  g.restore();
}
function handsSew(g, t, o = {}) {
  const snap = o.snap ?? 0, tens = o.tension ?? 0, warm = o.warm ?? 1;
  const cg = g.createLinearGradient(-900, -500, 900, 500); cg.addColorStop(0, '#22355a'); cg.addColorStop(1, '#0c1526');
  g.fillStyle = cg; g.fillRect(-1300, -800, 2600, 1600);
  // weave + folds
  g.strokeStyle = 'rgba(170,200,240,.07)'; g.lineWidth = 2;
  for (let i = -60; i < 60; i++) { g.beginPath(); g.moveTo(-1300, i * 14); g.lineTo(1300, i * 14 + 30); g.stroke(); }
  g.save(); g.filter = 'blur(40px)'; g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(-200, 380, 900, 90, -.08, 0, 6.28); g.fill(); g.fillStyle = 'rgba(120,150,210,.18)'; g.beginPath(); g.ellipse(-300, -300, 900, 110, -.1, 0, 6.28); g.fill(); g.restore();
  // existing sashiko stitches
  g.strokeStyle = '#b8231b'; g.lineWidth = 6; g.setLineDash([30, 22]); g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-1300, 160 + i * 90); g.quadraticCurveTo(-800, 140 + i * 90, -420, 120 + i * 90); g.stroke(); }
  g.setLineDash([]);
  const skin = mixColor('#c9d9db', '#f2d9c8', warm), shade = mixColor('#7d9599', '#c79a84', warm);
  const ax = -420, ay = 120; // thread exits the cloth
  const bx = lerp(250, 330, tens), by = lerp(-90, -150, tens); // pinch point
  // needle hole
  g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(ax, ay, 12, 6, 0, 0, 6.28); g.fill();
  g.lineCap = 'round';
  const glowThread = () => { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,90,60,.35)'; g.lineWidth = 18; g.filter = 'blur(6px)'; g.stroke(); g.restore(); };
  if (snap <= 0) {
    g.strokeStyle = '#ee2a1e'; g.lineWidth = 7; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, lerp(120, (ay + by) / 2, tens) + Math.sin(t * 30) * 3 * tens, bx, by); g.stroke(); glowThread();
  } else {
    const k = E.o(Math.min(1, snap * 1.3)), mx = (ax + bx) / 2, my = (ay + by) / 2;
    g.strokeStyle = '#ee2a1e'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(lerp(mx - 60, ax + 90, k), lerp(my, ay + 120, k), lerp(mx - 30, ax + 150, k) + Math.sin(snap * 22) * 40 * (1 - k), lerp(my, ay + 200, k)); g.stroke(); glowThread();
    g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(lerp(mx + 60, bx - 60, k), lerp(my, by + 140, k), lerp(mx + 30, bx - 40, k) - Math.sin(snap * 25) * 40 * (1 - k), lerp(my, by + 260, k)); g.stroke(); glowThread();
    if (snap < .3) { g.save(); g.globalCompositeOperation = 'lighter'; const r = g.createRadialGradient(mx, my, 0, mx, my, 160); r.addColorStop(0, `rgba(255,210,190,${1 - snap / .3})`); r.addColorStop(1, 'rgba(255,0,0,0)'); g.fillStyle = r; g.fillRect(mx - 170, my - 170, 340, 340); g.restore(); }
  }
  // hand from the right: back of hand, index over thread, thumb under
  g.save(); g.translate(bx - 300, by + 20);
  g.save(); g.filter = 'blur(2px)'; const hg = g.createLinearGradient(500, -300, 900, 300); hg.addColorStop(0, skin); hg.addColorStop(1, shade);
  g.fillStyle = hg; g.beginPath(); g.moveTo(560, -260); g.bezierCurveTo(800, -330, 1100, -200, 1200, 0); g.lineTo(1200, 500); g.bezierCurveTo(900, 420, 650, 260, 520, 120); g.closePath(); g.fill(); g.restore();
  finger(g, 1000, 60, 330, 60, 120, skin, shade); // thumb (under)
  finger(g, 900, -300, 340, -10, 104, skin, shade); // index (over, pinching)
  finger(g, 940, -170, 500, 120, 96, skin, shade, false); // middle, curled behind
  g.restore();
}

// ---------- camellia on snow (local: flower centre) ----------
function camellia(g, t, o = {}) {
  const fr = o.frost ?? 0, sway = Math.sin(t * .8) * .02;
  g.save(); g.rotate(sway);
  // leaves
  [[-260, 80, -.6], [250, 60, .5], [-120, 230, -.2], [180, 220, .3]].forEach(([x, y, a], i) => {
    g.save(); g.translate(x, y); g.rotate(a);
    const lg = g.createLinearGradient(-200, 0, 200, 0); lg.addColorStop(0, '#0d2a20'); lg.addColorStop(.5, '#1d4a37'); lg.addColorStop(1, '#0a2018');
    g.fillStyle = lg; g.beginPath(); g.moveTo(-210, 0); g.quadraticCurveTo(0, -120, 210, 0); g.quadraticCurveTo(0, 120, -210, 0); g.fill();
    g.strokeStyle = 'rgba(160,220,190,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-200, 0); g.lineTo(200, 0); g.stroke();
    g.fillStyle = 'rgba(200,255,230,.18)'; g.beginPath(); g.ellipse(-30, -30, 110, 18, -.1, 0, 6.28); g.fill();
    if (fr > 0) { g.fillStyle = `rgba(235,250,250,${fr * .8})`; for (let k = 0; k < 30; k++) { g.beginPath(); g.arc((hash(k + i * 50) - .5) * 360, (hash(k * 3 + i) - .5) * 120 * (1 - Math.abs(hash(k + i * 50) - .5)), 2 + hash(k) * 5, 0, 6.28); g.fill(); } }
    g.restore();
  });
  // petals
  for (let L = 0; L < 3; L++) {
    const n = 6 - L, R = 230 - L * 70;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.28 + L * .5 + .2;
      g.save(); g.rotate(a);
      const pg = g.createRadialGradient(0, 0, 10, 0, R * .5, R);
      pg.addColorStop(0, '#6e0c12'); pg.addColorStop(.5, L === 2 ? '#d42a24' : '#c4211b'); pg.addColorStop(1, '#ff5a40');
      g.fillStyle = pg; g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(-R * .7, R * .25, -R * .6, R * 1.0, 0, R * .98); g.bezierCurveTo(R * .6, R * 1.0, R * .7, R * .25, 0, 0); g.fill();
      g.strokeStyle = 'rgba(80,0,10,.35)'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(0, R * .15); g.quadraticCurveTo(k * R * .12, R * .6, k * R * .2, R * .92); g.stroke(); }
      g.restore();
    }
  }
  // stamens
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28, r = 40 + (i % 3) * 12; g.strokeStyle = '#f2e0a0'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r - 10); g.stroke(); g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r - 10, 6, 0, 6.28); g.fill(); }
  // snow on petals
  g.save(); g.filter = 'blur(3px)'; g.fillStyle = 'rgba(240,250,250,.7)'; [[-120, -120, 26, .3], [95, -150, 16, -.4]].forEach(([x, y, r, a]) => { g.beginPath(); g.moveTo(x - r * 1.8, y); g.quadraticCurveTo(x - r, y - r * 1.1, x, y - r * .7); g.quadraticCurveTo(x + r * 1.2, y - r * .9, x + r * 1.7, y + r * .2); g.quadraticCurveTo(x, y + r * .6, x - r * 1.8, y); g.fill(); }); g.restore();
  g.restore();
}
