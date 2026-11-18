/* ===== Ядро: навигация, тіл, мұғалім панелі, анимация құралдары ===== */
(function () {
'use strict';
const D = window.Deck = window.D = { lang: 'kk', slides: [], idx: -1, step: 0, scale: 1, state: {}, sound: false, gloss: [], cvs: [] };

/* ---------- кішкентай құралдар ---------- */
window.$ = (s, r) => (r || document).querySelector(s);
window.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
window.L = (kk, ru) => '<span class="kk">' + kk + '</span><span class="ru">' + ru + '</span>';
window.T = (kk, ru) => (D.lang === 'kk' ? kk : ru);
const SUBS = '₀₁₂₃₄₅₆₇₈₉', SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻' };
/* F — HTML формула: H2O → H<sub>2</sub>O, Cu^{2+} → Cu<sup>2+</sup>; U — Unicode (canvas үшін) */
window.F = s => s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>').replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>');
window.U = s => s.replace(/\^\{([^}]+)\}/g, (m, a) => Array.from(a).map(c => SUPS[c] || c).join('')).replace(/([A-Za-z\)\]])(\d+)/g, (m, a, b) => a + Array.from(b).map(d => SUBS[+d]).join(''));
window.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
window.lerp = (a, b, t) => a + (b - a) * t;
window.rnd = (a, b) => a + Math.random() * (b - a);
window.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
window.ease = {
  out: (t) => 1 - Math.pow(1 - t, 3),
  inout: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  lin: (t) => t
};
D.chapters = [
  { k: ['Кіріспе', 'Введение'], c: '--c0' },
  { k: ['Құрылым', 'Строение'], c: '--c1' },
  { k: ['Физикалық қасиеттер', 'Физические свойства'], c: '--c2' },
  { k: ['Химиялық қасиеттер', 'Химические свойства'], c: '--c3' },
  { k: ['Қорытпалар', 'Сплавы'], c: '--c4' },
  { k: ['Металл алу', 'Получение металлов'], c: '--c5' },
  { k: ['Қазақстан', 'Казахстан'], c: '--c6' },
  { k: ['Қорытынды', 'Итоги'], c: '--gold' }
];
D.col = { e: '#ff8a1f', ion: '#3b82f6', ink: '#14213d', ink2: '#4b5a78', card: '#ffffff', line: '#dde5f3', ok: '#16a34a', bad: '#e11d48', gold: '#f5b81c' };
D.refreshColors = function () {
  const cs = getComputedStyle(document.documentElement);
  ['ink', 'ink2', 'card', 'line'].forEach(k => { D.col[k] = cs.getPropertyValue('--' + k).trim() || D.col[k]; });
};

/* ---------- таймерлер мен твиндер ---------- */
let timers = [], tweens = [];
D.later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
function clearTimers() { timers.forEach(clearTimeout); timers = []; tweens.length = 0; }
D.tween = function (dur, fn, o) {
  o = o || {};
  const tw = { t: -(o.delay || 0), dur, fn, ease: o.ease || ease.out, done: o.done };
  tweens.push(tw); return tw;
};
function updTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i]; tw.t += dt;
    if (tw.t < 0) continue;
    const p = clamp(tw.t / tw.dur, 0, 1);
    tw.fn(tw.ease(p), p);
    if (p >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
  }
}

/* ---------- Canvas көмекшісі ---------- */
D.cv = function (host, w, h) {
  const c = document.createElement('canvas');
  c.style.width = w + 'px'; c.style.height = h + 'px';
  host.appendChild(c);
  const o = {
    c, w, h, x: c.getContext('2d'), r: 1,
    fit() { const r = clamp((window.devicePixelRatio || 1) * D.scale, 1, 3); this.r = r; c.width = Math.round(w * r); c.height = Math.round(h * r); },
    begin() { this.x.setTransform(this.r, 0, 0, this.r, 0, 0); this.x.clearRect(0, 0, w, h); return this.x; },
    p(e) { const b = c.getBoundingClientRect(); return { x: (e.clientX - b.left) * w / b.width, y: (e.clientY - b.top) * h / b.height }; }
  };
  o.fit(); D.cvs.push(o); return o;
};
D.drag = function (o, h) {
  let on = false;
  o.c.addEventListener('pointerdown', e => { on = true; try { o.c.setPointerCapture(e.pointerId); } catch (_) {} h.down && h.down(o.p(e), e); e.preventDefault(); });
  o.c.addEventListener('pointermove', e => { if (on) h.move && h.move(o.p(e), e); else h.hover && h.hover(o.p(e), e); });
  const up = e => { if (!on) return; on = false; h.up && h.up(o.p(e), e); };
  o.c.addEventListener('pointerup', up); o.c.addEventListener('pointercancel', up);
};

/* ---------- сурет салу құралдары ---------- */
window.G = {
  rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); },
  shade(hex, k) { // k>0 ашық, k<0 күңгірт
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = k >= 0 ? 255 : 0, a = Math.abs(k);
    r = Math.round(lerp(r, f, a)); g = Math.round(lerp(g, f, a)); b = Math.round(lerp(b, f, a));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  },
  ball(x, px, py, r, col, alpha) {
    const g = x.createRadialGradient(px - r * .35, py - r * .4, r * .1, px, py, r * 1.05);
    g.addColorStop(0, G.shade(col, .55)); g.addColorStop(.55, col); g.addColorStop(1, G.shade(col, -.35));
    if (alpha != null) x.globalAlpha = alpha;
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill();
    if (alpha != null) x.globalAlpha = 1;
  },
  ion(x, px, py, r, sign, col) {
    G.ball(x, px, py, r, col || D.col.ion);
    x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = Math.max(2, r * .16); x.lineCap = 'round';
    const k = r * .38; x.beginPath(); x.moveTo(px - k, py); x.lineTo(px + k, py);
    if (sign !== '-') { x.moveTo(px, py - k); x.lineTo(px, py + k); } x.stroke();
  },
  e(x, px, py, r) {
    r = r || 4.5;
    x.fillStyle = 'rgba(255,138,31,.28)'; x.beginPath(); x.arc(px, py, r * 2, 0, 6.2832); x.fill();
    x.fillStyle = '#ff8a1f'; x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill();
    x.fillStyle = '#ffd9a8'; x.beginPath(); x.arc(px - r * .3, py - r * .3, r * .38, 0, 6.2832); x.fill();
  },
  txt(x, s, px, py, o) {
    o = o || {};
    x.font = (o.weight || 800) + ' ' + (o.size || 18) + 'px Nunito, "Segoe UI", system-ui, sans-serif';
    x.fillStyle = o.color || D.col.ink; x.textAlign = o.align || 'center'; x.textBaseline = o.base || 'middle';
    if (o.stroke) { x.lineWidth = o.sw || 4; x.strokeStyle = o.stroke; x.lineJoin = 'round'; x.strokeText(s, px, py); }
    x.fillText(s, px, py);
  },
  arrow(x, x1, y1, x2, y2, col, w) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7 + (w || 3);
    x.strokeStyle = col; x.fillStyle = col; x.lineWidth = w || 3; x.lineCap = 'round';
    x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2 - Math.cos(a) * h * .6, y2 - Math.sin(a) * h * .6); x.stroke();
    x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - h * Math.cos(a - .45), y2 - h * Math.sin(a - .45)); x.lineTo(x2 - h * Math.cos(a + .45), y2 - h * Math.sin(a + .45)); x.closePath(); x.fill();
  }
};
/* металдардың түстері */
window.MET = { Li: '#c7ced8', Na: '#cfd6e0', K: '#c3cad6', Mg: '#d3d9e2', Al: '#b9c7d6', Ti: '#9aa6b5', Cr: '#a9b4c2', Mn: '#a4a0b0', Fe: '#8d99ab', Co: '#8a96b4', Ni: '#b4bcc6', Cu: '#d98324', Zn: '#a9bccb', Ag: '#dde4ee', Sn: '#c4c9d1', W: '#7e8896', Pt: '#d0d6de', Au: '#f2c230', Hg: '#c8d0da', Pb: '#7d8696', Ga: '#c0c8d2', Os: '#6b7c93' };

/* ---------- электрондық газ симуляторы (бірнеше слайдта қолданылады) ---------- */
D.Sea = function (o) {
  this.x0 = o.x; this.y0 = o.y; this.w = o.w; this.h = o.h;
  this.cols = o.cols; this.rows = o.rows; this.n = o.n; this.col = o.col || D.col.ion;
  this.free = o.free !== false;          // электрондар бос ма
  this.ions = []; this.es = [];
  const dx = this.w / this.cols, dy = this.h / this.rows; this.dx = dx; this.dy = dy;
  this.ir = Math.min(dx, dy) * .36;
  for (let j = 0; j < this.rows; j++) for (let i = 0; i < this.cols; i++)
    this.ions.push({ bx: this.x0 + dx * (i + .5), by: this.y0 + dy * (j + .5), ph: rnd(0, 6.28), on: true });
  for (let k = 0; k < this.n; k++) this.es.push({ x: rnd(this.x0, this.x0 + this.w), y: rnd(this.y0, this.y0 + this.h), vx: 0, vy: 0, a: 1 });
  this.t = 0; this.temp = .25; this.field = 0; this.fk = 1; this.speed = 55;
  this.avgDrift = 0;
};
D.Sea.prototype.update = function (dt) {
  this.t += dt;
  const nu = 1.2 + this.temp * 7;               // соқтығысу жиілігі (Друде)
  let sum = 0, n = 0;
  for (const e of this.es) {
    e.vx += this.field * this.fk * dt * 260;
    if (Math.random() < nu * dt) {
      const a = rnd(0, 6.28), s = this.speed * (.55 + this.temp * 1.2) * rnd(.5, 1.3);
      e.vx = Math.cos(a) * s; e.vy = Math.sin(a) * s;
    }
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (e.y < this.y0 + 4) { e.y = this.y0 + 4; e.vy = Math.abs(e.vy); }
    if (e.y > this.y0 + this.h - 4) { e.y = this.y0 + this.h - 4; e.vy = -Math.abs(e.vy); }
    if (e.x > this.x0 + this.w) e.x -= this.w; else if (e.x < this.x0) e.x += this.w;
    sum += e.vx; n++;
  }
  this.avgDrift = n ? sum / n : 0;
};
D.Sea.prototype.draw = function (x, o) {
  o = o || {};
  const amp = 1 + this.temp * 5.5;
  for (const p of this.ions) {
    const px = p.bx + Math.sin(this.t * 7 + p.ph) * amp, py = p.by + Math.cos(this.t * 6 + p.ph * 1.7) * amp;
    if (o.hot) { x.fillStyle = 'rgba(239,68,68,' + (this.temp * .35) + ')'; x.beginPath(); x.arc(px, py, this.ir * 1.35, 0, 6.28); x.fill(); }
    G.ion(x, px, py, this.ir, '+', this.col);
  }
  for (const e of this.es) G.e(x, e.x, e.y, o.er || 4);
};

/* ---------- конфетти ---------- */
let fxs = [];
const fx = () => $('#fx').getContext('2d');
D.confetti = function (px, py, n) {
  const cols = ['#ff8a1f', '#3b82f6', '#16a34a', '#ec4899', '#f5b81c', '#8b5cf6'];
  for (let i = 0; i < (n || 70); i++) fxs.push({ x: px, y: py, vx: rnd(-260, 260), vy: rnd(-520, -120), r: rnd(4, 9), c: pick(cols), a: rnd(0, 6), va: rnd(-8, 8), life: rnd(1.1, 2) });
};
function updFx(dt) {
  const c = $('#fx'), x = fx(); x.clearRect(0, 0, c.width, c.height);
  fxs = fxs.filter(p => p.life > 0);
  for (const p of fxs) {
    p.life -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
    x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = clamp(p.life * 2, 0, 1);
    x.fillStyle = p.c; x.fillRect(-p.r, -p.r * .5, p.r * 2, p.r); x.restore();
  }
}
/* стейдждегі координаттар (элемент бойынша) */
D.at = function (el) { const s = $('#stage').getBoundingClientRect(), b = el.getBoundingClientRect(); return { x: (b.left + b.width / 2 - s.left) / D.scale, y: (b.top + b.height / 2 - s.top) / D.scale }; };

/* ---------- дыбыс ---------- */
let actx = null;
D.beep = function (type) {
  if (!D.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [[660, .09], [880, .12]], no: [[220, .16]], pop: [[520, .05]], win: [[523, .1], [659, .1], [784, .1], [1047, .2]] }[type] || [[440, .05]];
    let t = actx.currentTime;
    seq.forEach(([f, d]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type === 'no' ? 'sawtooth' : 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d); t += d;
    });
  } catch (_) {}
};

/* ---------- слайд тіркеу ---------- */
D.add = function (def) { D.slides.push(def); };
D.cur = () => D.slides[D.idx];
D.byId = (id) => D.slides.findIndex(s => s.id === id);

function buildSlides() {
  const host = $('#slides'); let html = '';
  D.slides.forEach((s, i) => {
    const ch = D.chapters[s.ch];
    s.i = i;
    html += '<section class="slide' + (s.bare ? ' bare' : '') + '" id="s-' + s.id + '" style="--ac:var(' + ch.c + ')" aria-label="' + s.t[0] + '">' +
      (s.bare ? '' : '<div class="sh"><span class="kick">' + L(ch.k[0], ch.k[1]) + '</span><h2>' + L(s.t[0], s.t[1]) + '</h2></div>') +
      '<div class="sb">' + (typeof s.html === 'function' ? s.html() : (s.html || '')) + '</div></section>';
  });
  host.innerHTML = html;
  D.slides.forEach(s => { s.el = $('#s-' + s.id); });
}

/* ---------- қадамдар (data-step) ---------- */
function applySteps() {
  const s = D.cur(); if (!s) return;
  $$('[data-step]', s.el).forEach(e => e.classList.toggle('on', +e.dataset.step <= D.step));
  s.h && s.h.step && s.h.step(D.step);
}

/* ---------- ауысу ---------- */
D.go = function (i, dir) {
  i = clamp(i, 0, D.slides.length - 1);
  if (i === D.idx) return;
  dir = dir || (i > D.idx ? 1 : -1);
  const prev = D.cur(), nxt = D.slides[i];
  closeFact(); closeMenu();
  if (prev) {
    prev.h && prev.h.leave && prev.h.leave();
    prev.el.classList.remove('active', 'in-r', 'in-l'); prev.el.classList.add('out');
    const pe = prev.el; setTimeout(() => pe.classList.remove('out'), 260);
  }
  clearTimers();
  D.idx = i; D.step = dir < 0 ? (nxt.steps || 0) : 0;
  nxt.el.classList.remove('out'); nxt.el.classList.add('active', dir > 0 ? 'in-r' : 'in-l');
  if (!nxt.inited) {
    nxt.inited = true;
    try { nxt.h = (nxt.init && nxt.init($('.sb', nxt.el), D)) || {}; } catch (err) { console.error('init ' + nxt.id, err); nxt.h = {}; }
  }
  applySteps();
  try { nxt.h.enter && nxt.h.enter(); } catch (err) { console.error('enter ' + nxt.id, err); }
  refreshUI();
  try { history.replaceState(null, '', '#' + nxt.id); } catch (_) {}
};
D.next = function () { const s = D.cur(); if (s && D.step < (s.steps || 0)) { D.step++; applySteps(); D.beep('pop'); } else D.go(D.idx + 1, 1); };
D.prev = function () { if (D.step > 0) { D.step--; applySteps(); } else D.go(D.idx - 1, -1); };

/* ---------- UI жаңарту ---------- */
let progEls = [];
function buildProg() {
  const p = $('#prog'); p.innerHTML = ''; progEls = [];
  D.chapters.forEach((c, ci) => {
    const idxs = D.slides.map((s, i) => s.ch === ci ? i : -1).filter(i => i >= 0);
    if (!idxs.length) return;
    const el = document.createElement('i'); el.style.flex = idxs.length; el.title = c.k[0] + ' / ' + c.k[1];
    el.innerHTML = '<b style="background:var(' + c.c + ')"></b>';
    el.onclick = () => D.go(idxs[0]);
    p.appendChild(el); progEls.push({ el, idxs });
  });
}
function refreshUI() {
  const s = D.cur(); if (!s) return;
  document.documentElement.style.setProperty('--ac', 'var(' + D.chapters[s.ch].c + ')');
  $('#stage').style.setProperty('--ac', 'var(' + D.chapters[s.ch].c + ')');
  progEls.forEach(({ el, idxs }) => {
    const done = idxs.filter(i => i <= D.idx).length;
    $('b', el).style.width = (done / idxs.length * 100) + '%';
  });
  $('#cnt').textContent = (D.idx + 1) + ' / ' + D.slides.length;
  $('#bPrev').disabled = D.idx === 0; $('#bNext').disabled = D.idx === D.slides.length - 1;
  const br = s.bridge; $('#bridgeBtn').innerHTML = br && D.idx < D.slides.length - 1 ? '<span class="ar">→</span>' + L(br[0], br[1]) : '';
  const f = typeof s.fact === 'function' ? s.fact() : s.fact;
  const tab = $('#factTab'); tab.classList.toggle('show', !!f); tab.classList.remove('wig');
  if (f) D.later(() => tab.classList.add('wig'), 2200);
  renderTeacher();
  $$('#menuBody button').forEach(b => b.classList.toggle('on', +b.dataset.i === D.idx));
}

/* ---------- «Сен білесің бе?» ---------- */
function openFact() {
  const s = D.cur(); const f = typeof s.fact === 'function' ? s.fact() : s.fact; if (!f) return;
  $('#factBody').innerHTML = L(f[0], f[1]); $('#fact').classList.add('open'); D.beep('pop');
}
function closeFact() { $('#fact').classList.remove('open'); }
D.refreshFact = function () { if ($('#fact').classList.contains('open')) openFact(); };

/* ---------- мұғалім панелі ---------- */
let tTab = 'note';
function renderTeacher() {
  const s = D.cur(); if (!s) return;
  $$('#teacher .tt button').forEach(b => b.classList.toggle('on', b.dataset.t === tTab));
  const body = $('#tBody'); let h = '';
  const none = '<p class="none">' + L('Бұл экранға жазба жоқ.', 'Для этого экрана заметок нет.') + '</p>';
  if (tTab === 'note') {
    h = '<p><b>' + L(s.t[0], s.t[1]) + '</b></p>' + (s.note ? '<p>' + L(s.note[0], s.note[1]) + '</p>' : none);
  } else if (tTab === 'ans') {
    h = s.ans ? '<p>' + L(s.ans[0], s.ans[1]) + '</p>' : '<p class="none">' + L('Бұл экранда тапсырма жауабы жоқ.', 'На этом экране нет ответов к заданиям.') + '</p>';
  } else {
    h = '<input id="gq" placeholder="' + T('Термин іздеу…', 'Поиск термина…') + '" value="' + (D._gq || '') + '"><dl id="gl">' + glossHTML(D._gq || '') + '</dl>';
  }
  body.innerHTML = h;
  const gq = $('#gq'); if (gq) gq.oninput = () => { D._gq = gq.value; $('#gl').innerHTML = glossHTML(gq.value); };
}
function glossHTML(q) {
  q = (q || '').toLowerCase().trim();
  return D.gloss.filter(g => !q || (g[0] + g[1] + g[2] + g[3]).toLowerCase().includes(q))
    .map(g => '<dt>' + L(g[0], g[1]) + '</dt><dd>' + L(g[2], g[3]) + '</dd>').join('') || '<p class="none">—</p>';
}
function toggleTeacher(force) {
  const t = $('#teacher'), open = force != null ? force : !t.classList.contains('open');
  t.classList.toggle('open', open); $('#ustaBtn').classList.toggle('on', open); if (open) renderTeacher();
}

/* ---------- мәзір ---------- */
function buildMenu() {
  let h = '';
  D.chapters.forEach((c, ci) => {
    const items = D.slides.filter(s => s.ch === ci); if (!items.length) return;
    h += '<div class="mc" style="--cc:var(' + c.c + ')"><span class="lbl">' + L(c.k[0], c.k[1]) + '</span><div class="ml">' +
      items.map(s => '<button data-i="' + s.i + '"><b>' + (s.i + 1) + '</b>' + L(s.t[0], s.t[1]) + '</button>').join('') + '</div></div>';
  });
  $('#menuBody').innerHTML = h;
  $$('#menuBody button').forEach(b => b.onclick = () => D.go(+b.dataset.i));
}
function closeMenu() { $('#menu').classList.remove('open'); }
function toggleMenu() { $('#menu').classList.toggle('open'); }

/* ---------- тіл ---------- */
D.setLang = function (l) {
  D.lang = l; document.documentElement.lang = l;
  $$('#lang button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
  try { localStorage.setItem('metals.lang', l); } catch (_) {}
  const s = D.cur(); if (s && s.h && s.h.lang) s.h.lang();
  D.slides.forEach(x => { x.h && x.h.lang && x !== s && x.h.lang(); });
  refreshUI(); D.refreshFact();
  $$('#lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === l));
};

/* ---------- масштаб ---------- */
D.fit = function () {
  const fs = !!document.fullscreenElement;
  document.body.classList.toggle('fs', fs);
  const w = fs ? innerWidth : innerWidth - 32, h = fs ? innerHeight : innerHeight - 8;
  D.scale = Math.max(.2, Math.min(w / 1280, h / 720));
  $('#stage').style.transform = 'scale(' + D.scale + ')';
  D.cvs.forEach(c => c.fit());
};

/* ---------- іске қосу ---------- */
D.start = function () {
  buildSlides(); buildProg(); buildMenu();
  $('#ustaFace').innerHTML = $('#ustaBtn').innerHTML = window.USTA_SVG || '';
  try { const l = localStorage.getItem('metals.lang'); if (l === 'ru' || l === 'kk') D.lang = l; } catch (_) {}
  try { const th = localStorage.getItem('metals.theme'); if (th) document.documentElement.dataset.theme = th; } catch (_) {}
  D.refreshColors();
  D.fit(); addEventListener('resize', D.fit); document.addEventListener('fullscreenchange', D.fit);
  $$('#lang button').forEach(b => b.onclick = () => D.setLang(b.dataset.l));
  D.setLang(D.lang);
  $('#bPrev').onclick = D.prev; $('#bNext').onclick = D.next;
  $('#bridgeBtn').onclick = () => D.go(D.idx + 1, 1);
  $('#bMenu').onclick = toggleMenu;
  $('#menu').onclick = e => { if (e.target.id === 'menu') closeMenu(); };
  $('#ustaBtn').onclick = () => toggleTeacher();
  $$('#teacher .tt button').forEach(b => b.onclick = () => { tTab = b.dataset.t; renderTeacher(); });
  $('#factTab').onclick = () => { $('#fact').classList.contains('open') ? closeFact() : openFact(); };
  $('#factX').onclick = closeFact;
  $('#bFull').onclick = () => { try { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}); } catch (_) {} };
  $('#bSound').onclick = function () { D.sound = !D.sound; this.classList.toggle('on', D.sound); $('.w', this).style.opacity = D.sound ? 1 : .25; D.beep('ok'); };
  $('#bSound .w').style.opacity = .25;
  $('#bTheme').onclick = () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
    const nt = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = nt;
    try { localStorage.setItem('metals.theme', nt); } catch (_) {}
    D.refreshColors();
  };
  matchMedia('(prefers-color-scheme:dark)').addEventListener && matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => setTimeout(D.refreshColors, 50));

  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' && e.target.type !== 'range') return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown') { if (tag === 'input') return; D.next(); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { if (tag === 'input') return; D.prev(); e.preventDefault(); }
    else if (k === ' ' && tag !== 'button') { D.next(); e.preventDefault(); }
    else if (k === 'Home') D.go(0); else if (k === 'End') D.go(D.slides.length - 1);
    else if (k === 'f' || k === 'F') $('#bFull').click();
    else if (k === 'l' || k === 'L') D.setLang(D.lang === 'kk' ? 'ru' : 'kk');
    else if (k === 't' || k === 'T') toggleTeacher();
    else if (k === 'm' || k === 'M') toggleMenu();
    else if (k === 'Escape') { closeMenu(); closeFact(); toggleTeacher(false); }
  });
  /* сенсор: көлденең сырғыту */
  let sx = null, sy = 0;
  $('#stage').addEventListener('touchstart', e => { if (e.target.closest('canvas,input,.noswipe,#teacher,#menu,#fact')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $('#stage').addEventListener('touchend', e => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) dx < 0 ? D.next() : D.prev(); sx = null;
  }, { passive: true });

  addEventListener('hashchange', () => { const i = D.byId(location.hash.slice(1)); if (i >= 0 && i !== D.idx) D.go(i); });
  let last = performance.now();
  (function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!document.hidden) {
      updTweens(dt);
      const s = D.cur(); if (s && s.h && s.h.tick) { try { s.h.tick(dt, now / 1000); } catch (err) { console.error('tick ' + s.id, err); s.h.tick = null; } }
      updFx(dt);
    }
    requestAnimationFrame(frame);
  })(last);
  const start = D.byId(location.hash.slice(1));
  D.go(start >= 0 ? start : 0, 1);
};
})();
