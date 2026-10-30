// vizavi-motion — kinetic typography: word-synced captions and title reveals.
// Needs core.js. Fonts must be loaded before rendering (see template.html: READY waits for document.fonts).

// ---------- word-synced captions ----------
// TL: [{id, who, start, end, words: [[word, time], ...]}] — produced by scripts/audio/vo.py (timeline.js).
// Each word rises in with blur→sharp at its spoken time; long lines wrap (≤ maxW of frame width).
// emph: {"word.": style} with style 'accent' (colour), 'cold' (icy + glow), 'blow' (word turns to dust), 'stop' (dims abruptly).
const CAPTION_DEFAULTS = {
  font: 'Corm', fontAlt: 'CormI', weight: '500', size: 56, sizeAlt: 62, color: '#f3f0e8', colorAlt: '#c9f2f6',
  accent: '#ff5340', cold: '#9feef6', maxW: .8, bottom: 118, backing: .58, emph: {}, altWho: 'y',
};
function captions(t, TL, opt = {}) {
  const o = { ...CAPTION_DEFAULTS, ...opt };
  const on = TL.some(L => t > L.words[0][1] - .3 && t < L.end + 1.2);
  // soft dark backing: keeps text readable on snow/sky/frost without a hard box
  if (on && o.backing > 0) { reset(ctx); ctx.fillStyle = vgrad(ctx, H - 300, H, [[0, 'rgba(0,0,0,0)'], [.55, `rgba(0,0,0,${o.backing * .55})`], [1, `rgba(0,0,0,${o.backing})`]]); ctx.fillRect(0, H - 300, W, 300); }
  for (let li = 0; li < TL.length; li++) {
    const L = TL[li], next = TL[li + 1];
    const tIn = L.words[0][1] - .12, tOut = Math.min(L.end + .9, next ? next.start - .05 : 1e9);
    if (t < tIn || t > tOut + .5) continue;
    const alt = L.who === o.altWho, size = alt ? o.sizeAlt : o.size;
    const font = `${alt ? 'italic ' : ''}${o.weight} ${size}px ${alt ? o.fontAlt : o.font}`;
    reset(ctx); ctx.font = font;
    const sp = ctx.measureText(' ').width, widths = L.words.map(([w]) => ctx.measureText(w).width);
    const rows = [[]]; let acc = 0;
    widths.forEach((wd, i) => { if (acc > 0 && acc + sp + wd > W * o.maxW) { rows.push([]); acc = 0; } rows[rows.length - 1].push(i); acc += (acc ? sp : 0) + wd; });
    const rowOf = [], xOf = [];
    rows.forEach((r, ri) => { const tw = r.reduce((a, i) => a + widths[i], 0) + sp * (r.length - 1); let xx = W / 2 - tw / 2; r.forEach(i => { rowOf[i] = ri; xOf[i] = xx; xx += widths[i] + sp; }); });
    const lh = size * 1.12, y0 = H - o.bottom - (rows.length - 1) * lh, out = seg(t, tOut, tOut + .5);
    L.words.forEach(([w, wt], i) => {
      const a = E.o(seg(t, wt - .06, wt + .32)); if (a <= 0) return;
      const x = xOf[i], y = y0 + rowOf[i] * lh, em = o.emph[w];
      reset(ctx); ctx.font = font;
      let dy = (1 - a) * 16 - out * 14, alpha = a * (1 - out), blur = (1 - a) * 8 + out * 6, dx = 0, col = alt ? o.colorAlt : o.color;
      if (em === 'cold') col = mixColor(col.length === 7 ? col : '#f3f0e8', o.cold, seg(t, wt, wt + .5));
      if (em === 'accent') col = mixColor(col.length === 7 ? col : '#f3f0e8', o.accent, seg(t, wt + .1, wt + .6));
      if (em === 'blow') { const bk = E.i(seg(t, wt + .9, wt + 2.0)); dx = bk * 220; alpha *= 1 - bk; blur += bk * 10; }
      if (em === 'stop' && t > wt + .7) alpha *= 1 - seg(t, wt + .7, wt + .75) * .6;
      ctx.globalAlpha = alpha; if (blur > .3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
      ctx.shadowColor = alt || em === 'cold' ? 'rgba(10,60,70,.95)' : 'rgba(0,0,0,.95)'; ctx.shadowBlur = 16;
      ctx.fillStyle = col; ctx.fillText(w, x + dx, y + dy);
      if (em === 'blow') { // word disperses into dust drifting with the wind
        const bk = seg(t, wt + .8, wt + 2.2); reset(ctx);
        for (let q = 0; q < 50; q++) { const u = clamp(bk * 1.4 - hash(q) * .4); if (u <= 0 || u >= 1) continue; ctx.fillStyle = `rgba(240,250,250,${(1 - u) * .9})`; ctx.fillRect(x + hash(q * 3) * widths[i] + u * 380, y - hash(q * 5) * size * .8 - u * 60 * hash(q * 7), 3, 3); }
      }
    });
    reset(ctx);
  }
}

// ---------- title reveals ----------
// Letters rise in one by one with blur→sharp and tracking that opens up. Returns nothing; draw at (x,y) centre.
function titleReveal(text, x, y, t, t0, { font = '600 120px CormSC', color = '#f4f1ea', dur = 1.2, stagger = .05, track0 = 2, track1 = 24, glow = 'rgba(0,0,0,0)', out = null } = {}) {
  reset(ctx); ctx.font = font; const chars = [...text];
  const trk = lerp(track0, track1, E.o(seg(t, t0, t0 + dur + chars.length * stagger)));
  const ws = chars.map(c => ctx.measureText(c).width), total = ws.reduce((a, b) => a + b, 0) + trk * (chars.length - 1);
  let xx = x - total / 2; const fade = out ? 1 - E.io(seg(t, out[0], out[1])) : 1;
  chars.forEach((c, i) => {
    const k = E.o(seg(t, t0 + i * stagger, t0 + i * stagger + dur * .6));
    if (k > 0) {
      reset(ctx); ctx.font = font; ctx.textBaseline = 'middle'; ctx.globalAlpha = k * fade; ctx.fillStyle = color;
      if (k < .99) ctx.filter = `blur(${((1 - k) * 10).toFixed(1)}px)`; ctx.shadowColor = glow; ctx.shadowBlur = 30;
      ctx.fillText(c, xx, y + (1 - k) * 40);
    }
    xx += ws[i] + trk;
  });
  reset(ctx);
}
// Text revealed through a moving soft mask (left→right wipe). p = 0..1
function maskReveal(text, x, y, p, { font = '500 64px Corm', color = '#f4f1ea', align = 'center', soft = 120 } = {}) {
  if (p <= 0) return;
  const g = BUF[0].getContext('2d'); reset(g); g.clearRect(0, 0, W, H); g.font = font; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = color; g.fillText(text, x, y);
  const w = g.measureText(text).width, x0 = align === 'center' ? x - w / 2 : x, edge = x0 + (w + soft) * p;
  g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(edge - soft, 0, edge, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); reset(ctx); ctx.drawImage(BUF[0], 0, 0);
}
