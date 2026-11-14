// Timeline + compositor. Brush layer is redrawn 12 times a second ("on twos", hand-drawn feel),
// overlays (glows, text, fades) are composited at full 24 fps.
/* global brush, B, W, H, D, K, PAPER, SCENES, clamp, lerp, seg, ease, makeGrain, TAU */
const FPS = 24, DFPS = 12;

const Engine = {
  ready: false,
  async init(parent) {
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-99999px;top:0';
    document.body.appendChild(host);
    this.bcanvas = brush.createCanvas(W, H, { pixelDensity: D, parent: host });
    brush.scaleBrushes(3.4);
    brush.angleMode(brush.DEGREES);
    this.cache = document.createElement('canvas'); this.cache.width = W * D; this.cache.height = H * D;
    this.cctx = this.cache.getContext('2d');
    this.out = document.createElement('canvas'); this.out.width = W * D; this.out.height = H * D;
    this.out.id = 'out';
    (parent || document.body).appendChild(this.out);
    this.ctx = this.out.getContext('2d');
    this.grain = makeGrain(W * D / 2, H * D / 2);
    this.speckle = makeSpeckle(900, 400);
    const ff = [
      ['Cav', 'caveat-latin-700-normal.woff2', 'U+0000-00FF,U+2010-2027'],
      ['Cav', 'caveat-cyrillic-700-normal.woff2', 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'],
      ['Cav', 'caveat-cyrillic-ext-700-normal.woff2', 'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F'],
      ['Rub', 'rubik-latin-900-normal.woff2', 'U+0000-00FF,U+2010-2027'],
      ['Rub', 'rubik-cyrillic-900-normal.woff2', 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'],
      ['Rub', 'rubik-cyrillic-ext-900-normal.woff2', 'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F'],
    ];
    for (const [fam, file, range] of ff) {
      const f = new FontFace(fam, `url(fonts/${file})`, { unicodeRange: range, weight: '400 900' });
      await f.load(); document.fonts.add(f);
    }
    // starts (seconds) of each scene
    let acc = 0; this.starts = SCENES.map((s) => { const a = acc; acc += s.dur; return a; });
    this.total = acc;
    this.lastKey = null;
    this.ready = true;
  },
  locate(T) {
    let i = SCENES.length - 1;
    for (let k = 0; k < SCENES.length; k++) if (T < this.starts[k] + SCENES[k].dur) { i = k; break; }
    return { i, t: Math.max(0, T - this.starts[i]) };
  },
  cam(scene, tq) {
    const c = Object.assign({ x: W / 2, y: H / 2, z: 1, sx: 0, sy: 0 }, scene.cam ? scene.cam(tq) : {});
    return c;
  },
  drawBrush(i, t) {
    const scene = SCENES[i];
    const di = Math.floor(t * DFPS + 1e-6);
    const key = i + ':' + di;
    if (key === this.lastKey) return;
    this.lastKey = key;
    const tq = di / DFPS;
    K.boil = di % 3; K.t = tq;
    const c = this.cam(scene, tq);
    brush.clear(scene.bg ? scene.bg(tq) : PAPER);
    brush.push();
    brush.scale(c.z, c.z);
    brush.translate(-c.x + c.sx / c.z, -c.y + c.sy / c.z);
    scene.draw(tq);
    brush.pop();
    brush.render();
    this.cctx.clearRect(0, 0, W * D, H * D);
    this.cctx.drawImage(this.bcanvas, 0, 0, W * D, H * D);
    this._cam = c; this._tq = tq;
  },
  render(T) {
    T = clamp(T, 0, this.total - 1e-4);
    const { i, t } = this.locate(T);
    const scene = SCENES[i];
    this.drawBrush(i, t);
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.cache, 0, 0);
    const O = makeOverlay(ctx, this._cam, this);
    if (scene.post) scene.post(t, this._tq, O);
    // paper grain + vignette
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.16;
    ctx.drawImage(this.grain, 0, 0, W * D, H * D);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1;
    const vg = ctx.createRadialGradient(W, H, H * 0.55, W, H, H * 1.25);
    vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, 'rgba(205,192,172,1)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W * D, H * D);
    ctx.globalCompositeOperation = 'source-over';
    // scene transitions
    const fin = scene.fadeIn ?? 0.18;
    let fade = 0, fcol = scene.fadeColor || PAPER;
    if (fin > 0 && t < fin) fade = 1 - t / fin;
    if (i === 0 && t < 0.6) { fade = 1 - t / 0.6; fcol = '#000'; }
    const left = this.total - T;
    if (i === SCENES.length - 1 && left < 0.7) { fade = 1 - left / 0.7; fcol = '#000'; }
    if (fade > 0) { ctx.globalAlpha = clamp(fade); ctx.fillStyle = fcol; ctx.fillRect(0, 0, W * D, H * D); ctx.globalAlpha = 1; }
    return { scene: i, t };
  },
};

function makeSpeckle(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); let seed = 777; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.fillStyle = '#000';
  for (let i = 0; i < 2600; i++) { g.globalAlpha = 0.25 + r() * 0.75; g.beginPath(); g.arc(r() * w, r() * h, 0.6 + Math.pow(r(), 3) * 5, 0, TAU); g.fill(); }
  return c;
}

// Overlay helpers. World coords -> screen via the brush camera; screen coords are logical px (540x960).
function makeOverlay(ctx, cam, eng) {
  const toS = (x, y) => [((x - cam.x) * cam.z + W / 2 + cam.sx) * D, ((y - cam.y) * cam.z + H / 2 + cam.sy) * D];
  const O = {
    toS,
    tint(color, alpha = 1, mode = 'multiply') {
      if (alpha <= 0) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = mode; ctx.globalAlpha = clamp(alpha); ctx.fillStyle = color; ctx.fillRect(0, 0, W * D, H * D); ctx.restore();
    },
    vignette(alpha = 0.6, color = '0,0,0') {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createRadialGradient(W, H, H * 0.35, W, H, H * 1.1);
      g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${alpha})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W * D, H * D); ctx.restore();
    },
    glowS(sx, sy, r, color, alpha = 0.6, mode = 'screen') { // screen-space (device px)
      if (alpha <= 0 || r <= 0) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = mode; ctx.globalAlpha = clamp(alpha);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, color); g.addColorStop(0.35, color + 'aa'); g.addColorStop(1, color + '00');
      ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, 2 * r, 2 * r); ctx.restore();
    },
    glow(x, y, r, color, alpha = 0.6, mode = 'screen') { const [sx, sy] = toS(x, y); O.glowS(sx, sy, r * cam.z * D, color, alpha, mode); },
    flash(color, alpha) { O.tint(color, alpha, 'screen'); },
    // text in screen space (logical px)
    text(str, x, y, o = {}) {
      const a = o.alpha ?? 1; if (a <= 0) return;
      const sc = o.scale ?? 1; if (sc <= 0) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(x * D, y * D); ctx.rotate(o.rot || 0); ctx.scale(sc, sc);
      ctx.globalAlpha = clamp(a);
      ctx.font = `${o.weight || 700} ${(o.size || 48) * D}px ${o.font === 'rub' ? 'Rub' : 'Cav'}`;
      ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      const lines = String(str).split('\n'); const lh = (o.size || 48) * D * (o.lh || 1.05);
      lines.forEach((ln, k) => {
        const yy = (k - (lines.length - 1) / 2) * lh;
        if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = (o.glowSize || 30) * D; }
        if (o.outline) { ctx.lineJoin = 'round'; ctx.lineWidth = (o.outlineW || 8) * D; ctx.strokeStyle = o.outline; ctx.strokeText(ln, 0, yy); }
        ctx.fillStyle = o.color || '#2b2420'; ctx.fillText(ln, 0, yy);
        if (o.glow) { ctx.shadowBlur = 0; ctx.fillText(ln, 0, yy); }
      });
      ctx.restore();
    },
    // rubber stamp: red text inside a border, with ink speckle
    stamp(str, x, y, o = {}) {
      const a = o.alpha ?? 1, sc = o.scale ?? 1; if (a <= 0) return;
      const size = (o.size || 64) * D;
      const tmp = document.createElement('canvas'); tmp.width = 1000 * D / 2 * 2; tmp.height = 600 * D / 2 * 2;
      const g = tmp.getContext('2d');
      g.font = `900 ${size}px Rub`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const lines = String(str).split('\n'); const lh = size * 1.05;
      const wmax = Math.max(...lines.map((l) => g.measureText(l).width));
      const bw = wmax + size * 0.8, bh = lh * lines.length + size * 0.5;
      const cx = tmp.width / 2, cy = tmp.height / 2;
      g.fillStyle = o.color || '#c4312f'; g.strokeStyle = o.color || '#c4312f';
      lines.forEach((ln, k) => g.fillText(ln, cx, cy + (k - (lines.length - 1) / 2) * lh));
      g.lineWidth = size * 0.11; g.lineJoin = 'round';
      g.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
      g.lineWidth = size * 0.04; g.strokeRect(cx - bw / 2 + size * 0.16, cy - bh / 2 + size * 0.16, bw - size * 0.32, bh - size * 0.32);
      g.globalCompositeOperation = 'destination-out';
      g.drawImage(eng.speckle, 0, 0, tmp.width, tmp.height);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(x * D, y * D); ctx.rotate(o.rot || 0); ctx.scale(sc, sc);
      ctx.globalAlpha = clamp(a); ctx.globalCompositeOperation = o.mode || 'source-over';
      ctx.drawImage(tmp, -tmp.width / 2, -tmp.height / 2);
      ctx.restore();
    },
  };
  return O;
}

// pop-in animation helper for overlays
function pop(t, t0, dur = 0.35) {
  if (t < t0) return { a: 0, s: 0 };
  const k = clamp((t - t0) / dur);
  return { a: clamp(k * 3), s: ease.back(k) };
}
