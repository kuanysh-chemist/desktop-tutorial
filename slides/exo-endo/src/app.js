(function () {
'use strict';

/* ================= helpers ================= */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
var rand = function (a, b) { return a + Math.random() * (b - a); };
var html = document.documentElement;
var store = {
  get: function (k, d) { try { var v = localStorage.getItem('exoendo8:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem('exoendo8:' + k, JSON.stringify(v)); } catch (e) {} }
};
function T3(kk, ru, en) { return { kk: kk, ru: ru, en: en }; }
var S = { lang: store.get('lang', 'kk'), theme: store.get('theme', 'dark'), sound: store.get('sound', true), i: 0, scale: 1 };
if (['kk', 'ru', 'en'].indexOf(S.lang) < 0) S.lang = 'kk';
if (['dark', 'light'].indexOf(S.theme) < 0) S.theme = 'dark';
function L(o) { if (o && typeof o === 'object') return o[S.lang] != null ? o[S.lang] : o.kk; return o; }
var reduced = false;
try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
function fmtNum(v, digits) {
  var s = v.toFixed(digits || 0);
  return S.lang === 'en' ? s : s.replace('.', ',');
}

/* ================= texts ================= */
var UI = {
  prev: T3('Артқа (←)', 'Назад (←)', 'Back (←)'),
  next: T3('Алға (→)', 'Далее (→)', 'Next (→)'),
  theme: T3('Ашық / қараңғы фон', 'Светлый / тёмный фон', 'Light / dark theme'),
  sound: T3('Дыбыс қосу / өшіру', 'Звук вкл. / выкл.', 'Sound on / off'),
  timer: T3('Таймер', 'Таймер', 'Timer'),
  scores: T3('Ұпай тақтасы', 'Таблица баллов', 'Scoreboard'),
  notes: T3('Мұғалім жазбалары (N)', 'Заметки учителя (N)', 'Teacher notes (N)'),
  menu: T3('Слайдтар', 'Слайды', 'Slides'),
  full: T3('Толық экран (F)', 'Полный экран (F)', 'Full screen (F)'),
  timeUp: T3('Уақыт бітті!', 'Время вышло!', "Time's up!"),
  addTeam: T3('Топ қосу', 'Добавить группу', 'Add team'),
  removeTeam: T3('Топты алу', 'Убрать группу', 'Remove team'),
  reset: T3('Нөлдеу', 'Сбросить', 'Reset'),
  resetConfirm: T3('Барлық ұпайды нөлдейміз бе?', 'Обнулить все баллы?', 'Reset all points?'),
  team: T3('{n}-топ', 'Группа {n}', 'Team {n}'),
  playAgain: T3('Қайта ойнау', 'Сыграть ещё', 'Play again'),
  restart: T3('Қайта бастау', 'Начать заново', 'Restart'),
  nextQ: T3('Келесі сұрақ ▸', 'Следующий вопрос ▸', 'Next question ▸'),
  finish: T3('Нәтижені көру ▸', 'Посмотреть результат ▸', 'See the result ▸'),
  question: T3('Сұрақ', 'Вопрос', 'Question'),
  kJ: T3('кДж', 'кДж', 'kJ'),
  gameWin: T3('Керемет! Барлығы дұрыс!', 'Отлично! Всё верно!', 'Brilliant! All correct!'),
  gameWinErr: T3('Жарайсыңдар! Қате саны: {e}', 'Молодцы! Ошибок: {e}', 'Well done! Mistakes: {e}'),
  gameStat: T3('Орналастырылды: {a} / {b} · Қате: {e}', 'Разложено: {a} / {b} · Ошибок: {e}', 'Placed: {a} / {b} · Mistakes: {e}'),
  exoT: T3('🔥 Экзотермиялық реакция', '🔥 Экзотермическая реакция', '🔥 Exothermic reaction'),
  endoT: T3('❄️ Эндотермиялық реакция', '❄️ Эндотермическая реакция', '❄️ Endothermic reaction'),
  zeroT: T3('Жылу эффектісі жоқ (ΔH = 0)', 'Теплового эффекта нет (ΔH = 0)', 'No heat effect (ΔH = 0)'),
  optional: T3('қосымша', 'дополнительно', 'optional'),
  keys: T3(
    '<kbd>→</kbd> <kbd>Space</kbd> <kbd>PageDown</kbd> — келесі қадам · <kbd>↓</kbd> — келесі слайд · <kbd>←</kbd> — артқа · <kbd>N</kbd> — жазбалар · <kbd>T</kbd> — таймер · <kbd>S</kbd> — ұпай · <kbd>M</kbd> — слайдтар · <kbd>F</kbd> — толық экран · <kbd>Esc</kbd> — жабу',
    '<kbd>→</kbd> <kbd>Space</kbd> <kbd>PageDown</kbd> — следующий шаг · <kbd>↓</kbd> — следующий слайд · <kbd>←</kbd> — назад · <kbd>N</kbd> — заметки · <kbd>T</kbd> — таймер · <kbd>S</kbd> — баллы · <kbd>M</kbd> — слайды · <kbd>F</kbd> — полный экран · <kbd>Esc</kbd> — закрыть',
    '<kbd>→</kbd> <kbd>Space</kbd> <kbd>PageDown</kbd> — next step · <kbd>↓</kbd> — next slide · <kbd>←</kbd> — back · <kbd>N</kbd> — notes · <kbd>T</kbd> — timer · <kbd>S</kbd> — scores · <kbd>M</kbd> — slides · <kbd>F</kbd> — full screen · <kbd>Esc</kbd> — close'
  )
};
var TITLE = T3('Экзо- және эндотермиялық реакциялар · 8 сынып', 'Экзо- и эндотермические реакции · 8 класс', 'Exothermic & endothermic reactions · Grade 8');
var STAGES = {
  1: T3('I. Ұйымдастыру кезеңі · 2 мин', 'I. Организационный момент · 2 мин', 'I. Organisation · 2 min'),
  2: T3('II. Білімді өзектендіру · 5 мин', 'II. Актуализация знаний · 5 мин', 'II. Activating prior knowledge · 5 min'),
  3: T3('III. «Қара жәшік» әдісі · 5 мин', 'III. Метод «Чёрный ящик» · 5 мин', 'III. “Black box” method · 5 min'),
  4: T3('IV. Жаңа тақырыпты түсіндіру · 8 мин', 'IV. Объяснение новой темы · 8 мин', 'IV. New material · 8 min'),
  5: T3('V. Графиктік талдау · 7 мин', 'V. Графический анализ процессов · 7 мин', 'V. Graph analysis · 7 min'),
  6: T3('VI. Бекіту. Есеп шығару · 10 мин', 'VI. Закрепление. Решение задач · 10 мин', 'VI. Practice. Problem solving · 10 min'),
  7: T3('VII. Қорытындылау · 3 мин', 'VII. Подведение итогов · 3 мин', 'VII. Summary · 3 min'),
  8: T3('VIII. Рефлексия · 2 мин', 'VIII. Рефлексия · 2 мин', 'VIII. Reflection · 2 min'),
  9: T3('IX. Үй тапсырмасы · 1 мин', 'IX. Домашнее задание · 1 мин', 'IX. Homework · 1 min')
};
var STAGE_MIN = { 1: 2, 2: 5, 3: 5, 4: 8, 5: 7, 6: 10, 7: 3, 8: 2, 9: 1 };
var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
var LANG_HOOKS = [];

/* ================= sound (Web Audio, offline) ================= */
var SFX = (function () {
  var ac = null, noiseBuf = null;
  function ctx() {
    if (!ac) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, t0, dur, type, vol, f2) {
    var a = ac, now = a.currentTime + t0;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol || 0.1, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + dur + 0.05);
  }
  function noise(t0, dur, vol, type, f1, f2, q) {
    var a = ac, now = a.currentTime + t0;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var src = a.createBufferSource(); src.buffer = noiseBuf;
    var fl = a.createBiquadFilter(); fl.type = type || 'bandpass'; fl.Q.value = q || 1;
    fl.frequency.setValueAtTime(f1, now);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + Math.min(0.08, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(fl); fl.connect(g); g.connect(a.destination);
    src.start(now); src.stop(now + dur + 0.05);
  }
  var lib = {
    pop: function () { tone(540, 0, 0.09, 'sine', 0.07, 820); },
    flip: function () { noise(0, 0.18, 0.05, 'bandpass', 1800, 4000, 2); },
    ok: function () { [523, 659, 784].forEach(function (f, i) { tone(f, i * 0.08, 0.24, 'triangle', 0.1); }); tone(1047, 0.24, 0.35, 'sine', 0.06); },
    bad: function () { tone(220, 0, 0.18, 'sawtooth', 0.05, 150); tone(170, 0.12, 0.22, 'square', 0.035, 110); },
    whoosh: function () { noise(0, 0.32, 0.035, 'bandpass', 500, 2600, 0.8); },
    coin: function () { tone(988, 0, 0.08, 'square', 0.05); tone(1319, 0.07, 0.28, 'square', 0.05); },
    bell: function () { [0, 0.55, 1.1].forEach(function (t) { tone(880, t, 1.1, 'sine', 0.16); tone(1760, t, 0.7, 'sine', 0.05); }); },
    win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.1, 0.4, 'triangle', 0.09); }); tone(1568, 0.55, 0.6, 'sine', 0.06); },
    fire: function () {
      noise(0, 1.8, 0.06, 'lowpass', 900, 260, 0.7);
      for (var i = 0; i < 14; i++) noise(rand(0, 1.6), 0.03, 0.09, 'highpass', 2500, null, 0.5);
    },
    ice: function () { [1568, 2093, 2637, 3136, 2637].forEach(function (f, i) { tone(f, i * 0.13, 0.55, 'sine', 0.045); }); noise(0, 1.2, 0.02, 'highpass', 5000, 8000, 0.5); },
    reveal: function () { tone(392, 0, 0.3, 'sine', 0.07, 784); tone(587, 0.1, 0.35, 'triangle', 0.05); },
    tick: function () { tone(1250, 0, 0.03, 'square', 0.025); }
  };
  return {
    play: function (n) {
      if (!S.sound) return;
      try { if (!ctx()) return; if (lib[n]) lib[n](); } catch (e) {}
    }
  };
})();
function sfx(n) { SFX.play(n); }

/* ================= formulas: digits after letters → subscript ================= */
function subify(root) {
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (n) {
    var t = n.nodeValue;
    if (!/[A-Za-z\)\]]\d/.test(t)) return;
    if (n.parentNode && n.parentNode.nodeName === 'SUB') return;
    var span = document.createElement('span');
    span.innerHTML = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>');
    var frag = document.createDocumentFragment();
    while (span.firstChild) frag.appendChild(span.firstChild);
    n.parentNode.replaceChild(frag, n);
  });
}
function subifyAll(root) { $$('.f', root || document).forEach(subify); }

/* ================= stage scaling ================= */
var stage = $('#stage'), viewport = $('#viewport'), bar = $('#bar');
function fit() {
  var W = window.innerWidth, H = window.innerHeight - bar.offsetHeight;
  var s = Math.min(W / 1600, H / 900);
  S.scale = s;
  var x = (W - 1600 * s) / 2, y = (H - 900 * s) / 2;
  stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
}

/* ================= particles: background & confetti ================= */
var BG = { c: $('#bgCanvas'), ctx: null, w: 0, h: 0, mode: '', parts: [], dpr: 1 };
BG.ctx = BG.c.getContext('2d');
function bgResize() {
  BG.dpr = Math.min(1.5, window.devicePixelRatio || 1);
  BG.w = window.innerWidth; BG.h = window.innerHeight;
  BG.c.width = BG.w * BG.dpr; BG.c.height = BG.h * BG.dpr;
  BG.ctx.setTransform(BG.dpr, 0, 0, BG.dpr, 0, 0);
  FXC.c.width = BG.w * BG.dpr; FXC.c.height = BG.h * BG.dpr;
  FXC.ctx.setTransform(BG.dpr, 0, 0, BG.dpr, 0, 0);
}
function bgPart(i, init) {
  var w = BG.w, h = BG.h;
  if (BG.mode === 'fireice') {
    if (i % 2 === 0) return { k: 'e', x: rand(0, w * 0.46), y: init ? rand(0, h) : h + 10, vx: rand(-0.25, 0.25), vy: -rand(0.5, 1.6), r: rand(1.2, 3.4), ph: rand(0, 6.28) };
    return { k: 's', x: rand(w * 0.54, w), y: init ? rand(0, h) : -10, vx: rand(-0.3, 0.3), vy: rand(0.35, 1.1), r: rand(1.4, 3.8), ph: rand(0, 6.28) };
  }
  return { k: 'b', x: rand(0, w), y: init ? rand(0, h) : h + 20, vx: rand(-0.12, 0.12), vy: -rand(0.12, 0.38), r: rand(3, 9), warm: i % 2 === 0, a: rand(0.05, 0.16) };
}
function bgSetMode(m) {
  if (m === BG.mode) return;
  BG.mode = m; BG.parts = [];
  var n = m === 'fireice' ? (reduced ? 30 : 96) : (reduced ? 10 : 26);
  for (var i = 0; i < n; i++) BG.parts.push(bgPart(i, true));
}
function bgLoop() {
  var c = BG.ctx, light = S.theme === 'light';
  c.clearRect(0, 0, BG.w, BG.h);
  for (var i = 0; i < BG.parts.length; i++) {
    var p = BG.parts[i];
    p.ph = (p.ph || 0) + 0.04;
    p.x += p.vx + (p.k === 's' ? Math.sin(p.ph) * 0.35 : 0);
    p.y += p.vy;
    if (p.k === 'e') {
      if (p.y < -10) BG.parts[i] = bgPart(i, false);
      var fl = 0.6 + Math.sin(p.ph * 3) * 0.4;
      c.fillStyle = 'rgba(255,' + (90 + (p.r * 30 | 0)) + ',30,' + (0.18 * fl) + ')';
      c.beginPath(); c.arc(p.x, p.y, p.r * 3.2, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(255,' + (170 + (p.r * 20 | 0)) + ',80,' + (0.85 * fl) + ')';
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
    } else if (p.k === 's') {
      if (p.y > BG.h + 10) BG.parts[i] = bgPart(i, false);
      c.fillStyle = light ? 'rgba(30,150,230,.55)' : 'rgba(215,245,255,.85)';
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
    } else {
      if (p.y < -20) BG.parts[i] = bgPart(i, false);
      c.strokeStyle = p.warm ? 'rgba(255,140,60,' + p.a + ')' : 'rgba(80,190,255,' + p.a + ')';
      c.lineWidth = 2;
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.stroke();
    }
  }
  if (!document.hidden) requestAnimationFrame(bgLoop); else BG.sleeping = true;
}
document.addEventListener('visibilitychange', function () { if (!document.hidden && BG.sleeping) { BG.sleeping = false; requestAnimationFrame(bgLoop); } });

var FXC = { c: $('#fxCanvas'), ctx: null, parts: [], running: false };
FXC.ctx = FXC.c.getContext('2d');
var PAL = {
  confetti: ['#ff7a2f', '#ffd23f', '#3cc4ff', '#a98bff', '#2ee59d', '#ff5d9e'],
  fire: ['#ffd23f', '#ffb02e', '#ff7a1f', '#ff3d3d'],
  ice: ['#ffffff', '#c7f2ff', '#8fe6ff', '#3cc4ff']
};
function burst(x, y, opt) {
  opt = opt || {};
  var kind = opt.kind || 'confetti', n = opt.n || 50, pal = PAL[kind];
  for (var i = 0; i < n; i++) {
    var a = rand(0, 6.283), sp = rand(2, opt.power || 9);
    FXC.parts.push({
      x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === 'fire' ? 3 : 4),
      g: kind === 'fire' ? -0.05 : (kind === 'ice' ? 0.06 : 0.22), life: 1, decay: rand(0.008, 0.018),
      rot: rand(0, 6.28), vr: rand(-0.25, 0.25), w: rand(6, 12), h: rand(4, 8),
      col: pal[(Math.random() * pal.length) | 0], kind: kind
    });
  }
  if (!FXC.running) { FXC.running = true; requestAnimationFrame(fxLoop); }
}
function burstAt(el, opt) {
  if (!el) return;
  var r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, opt);
}
function fxLoop() {
  var c = FXC.ctx;
  c.clearRect(0, 0, BG.w, BG.h);
  FXC.parts = FXC.parts.filter(function (p) { return p.life > 0 && p.y < BG.h + 40; });
  FXC.parts.forEach(function (p) {
    p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
    c.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
    c.fillStyle = p.col;
    if (p.kind === 'confetti') {
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
    } else {
      c.beginPath(); c.arc(p.x, p.y, p.h / 2 + 1, 0, 6.283); c.fill();
    }
  });
  c.globalAlpha = 1;
  if (FXC.parts.length) requestAnimationFrame(fxLoop); else { FXC.running = false; c.clearRect(0, 0, BG.w, BG.h); }
}

/* ================= count-up numbers ================= */
function countUp(el) {
  var to = parseFloat(el.getAttribute('data-count'));
  if (isNaN(to)) return;
  var t0 = performance.now(), dur = 900;
  function step(t) {
    var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(to * e);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ================= thermometer component ================= */
function thermoBuild(el) {
  var min = +el.getAttribute('data-min'), max = +el.getAttribute('data-max'), t0 = +el.getAttribute('data-t0');
  el._min = min; el._max = max;
  var ticks = '';
  for (var v = min; v <= max; v += 10) { var y = thermoY(el, v); ticks += '<line x1="50" x2="60" y1="' + y + '" y2="' + y + '"/>'; }
  el.innerHTML = '<svg viewBox="0 0 80 300" aria-hidden="true"><rect class="th-glass" x="24" y="6" width="24" height="240" rx="12"/><circle class="th-glass" cx="36" cy="262" r="29"/>' +
    '<g class="th-ticks">' + ticks + '</g><rect class="th-liq" x="30" width="12" rx="6"/><circle class="th-bulb" cx="36" cy="262" r="21"/></svg>' +
    '<div class="th-val"><span class="tv">' + t0 + '</span> °C</div>';
  thermoDraw(el, t0);
}
function thermoY(el, v) { return 236 - (v - el._min) / (el._max - el._min) * 214; }
function thermoDraw(el, v) {
  el._v = v;
  var y = thermoY(el, v), liq = $('.th-liq', el), bulb = $('.th-bulb', el);
  liq.setAttribute('y', y); liq.setAttribute('height', 262 - y);
  var hue = v <= 20 ? 205 - clamp((v - 6) / 14, 0, 1) * 160 : 45 - clamp((v - 20) / 38, 0, 1) * 45;
  var col = 'hsl(' + hue + ',88%,56%)';
  liq.setAttribute('fill', col); bulb.setAttribute('fill', col);
  $('.tv', el).textContent = Math.round(v);
}
function thermoSet(el, to, dur) {
  if (el._raf) cancelAnimationFrame(el._raf);
  var from = el._v, t0 = performance.now();
  if (!dur) { thermoDraw(el, to); return; }
  function step(t) {
    var k = clamp((t - t0) / dur, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    thermoDraw(el, from + (to - from) * e);
    if (k < 1) el._raf = requestAnimationFrame(step);
  }
  el._raf = requestAnimationFrame(step);
}

/* ================= energy diagram component ================= */
var DL = {
  energy: T3('Энергия', 'Энергия', 'Energy'),
  prog: T3('Реакция барысы', 'Ход реакции', 'Reaction progress'),
  react: T3('Реагенттер', 'Реагенты', 'Reactants'),
  prod: T3('Өнімдер', 'Продукты', 'Products'),
  peak: T3('Активтелген күй', 'Активированное состояние', 'Activated state'),
  rel: T3('энергия бөлінеді', 'энергия выделяется', 'energy released'),
  abs: T3('энергия сіңіріледі', 'энергия поглощается', 'energy absorbed')
};
var DIAG_TPL =
  '<g class="ed-ax"><path class="ed-axis" d="M90 520V44" marker-end="url(#mInk)"/><path class="ed-axis" d="M72 500H872" marker-end="url(#mInk)"/>' +
  '<text class="ed-axlbl e-lbl" transform="translate(54 272) rotate(-90)" text-anchor="middle"></text><text class="ed-axlbl p-lbl" x="866" y="538" text-anchor="end"></text></g>' +
  '<g class="g-lv"><path class="ed-lvl lvR"/></g>' +
  '<g class="g-ea"><path class="ea-ln"/><path class="ea-ar"/><text class="ea-t">Eₐ</text></g>' +
  '<path class="ed-curve"/>' +
  '<g class="g-pk"><circle class="ed-pk" r="9"/><text class="ed-sm pk-lbl" text-anchor="middle"></text></g>' +
  '<g class="g-lbl"><text class="ed-lbl r-lbl" text-anchor="middle"></text><text class="ed-lbl p2-lbl" text-anchor="middle"></text><text class="ed-val rv" text-anchor="middle"></text><text class="ed-val pv" text-anchor="middle"></text></g>' +
  '<g class="g-dh"><path class="dh-ar"/><text class="dh-t" text-anchor="end"></text><text class="dh-s" text-anchor="end"></text></g>';
function diagRender(svg) {
  var er = +svg.getAttribute('data-er'), ep = +svg.getAttribute('data-ep'), ea = +(svg.getAttribute('data-ea') || 150);
  var live = svg.classList.contains('live');
  var Y = function (e) { return 500 - e * 0.52; };
  var yR = Y(er), yP = Y(ep), yK = Y(Math.max(er, ep) + ea);
  var type = er > ep ? 'exo' : (er < ep ? 'endo' : 'zero');
  if (!svg._b) { svg.innerHTML = DIAG_TPL; svg._b = true; }
  svg.classList.remove('k-exo', 'k-endo', 'k-zero'); svg.classList.add('k-' + type);
  var q = function (c) { return svg.querySelector(c); };
  var set = function (el, attrs) { for (var k in attrs) el.setAttribute(k, attrs[k]); };
  q('.ed-curve').setAttribute('d', 'M110 ' + yR + ' L250 ' + yR + ' C322 ' + yR + ' 398 ' + yK + ' 470 ' + yK + ' C542 ' + yK + ' 588 ' + yP + ' 640 ' + yP + ' L860 ' + yP);
  q('.lvR').setAttribute('d', 'M250 ' + yR + 'H840');
  set(q('.ed-pk'), { cx: 470, cy: yK });
  set(q('.pk-lbl'), { x: 470, y: yK - 22 });
  q('.ea-ln').setAttribute('d', 'M286 ' + yK + 'H462');
  q('.ea-ar').setAttribute('d', 'M296 ' + (yR - 4) + 'V' + (yK + 10));
  set(q('.ea-t'), { x: 282, y: (yR + yK) / 2 + 10, 'text-anchor': 'end' });
  set(q('.r-lbl'), { x: 112, y: yR + 40, 'text-anchor': 'start' });
  set(q('.p2-lbl'), { x: 750, y: yP > yR ? yP + 40 : yP - 20 });
  set(q('.rv'), { x: 178, y: yR + 34 });
  set(q('.pv'), { x: 726, y: yP + 34 });
  var dy = Math.abs(yR - yP);
  q('.dh-ar').setAttribute('d', 'M822 ' + yR + 'V' + (yP + (yP > yR ? -10 : 10)));
  var mid = (yR + yP) / 2;
  set(q('.dh-t'), { x: 808, y: mid + (dy < 60 ? -18 : 4) });
  set(q('.dh-s'), { x: 808, y: mid + (dy < 60 ? 6 : 30) });
  svg._type = type;
  diagText(svg);
}
function diagText(svg) {
  var q = function (c) { return svg.querySelector(c); };
  if (!q('.e-lbl')) return;
  var er = +svg.getAttribute('data-er'), ep = +svg.getAttribute('data-ep');
  q('.e-lbl').textContent = L(DL.energy);
  q('.p-lbl').textContent = L(DL.prog) + ' →';
  var live0 = svg.classList.contains('live');
  q('.r-lbl').textContent = L(DL.react) + (live0 ? ' · ' + er + ' ' + L(UI.kJ) : '');
  q('.p2-lbl').textContent = L(DL.prod) + (live0 ? ' · ' + ep + ' ' + L(UI.kJ) : '');
  q('.pk-lbl').textContent = L(DL.peak);
  var live = svg.classList.contains('live');
  q('.rv').textContent = live ? er + ' ' + L(UI.kJ) : '';
  q('.pv').textContent = live ? ep + ' ' + L(UI.kJ) : '';
  var t = svg._type;
  q('.dh-t').textContent = t === 'exo' ? 'ΔH < 0' : (t === 'endo' ? 'ΔH > 0' : '');
  q('.dh-s').textContent = t === 'exo' ? L(DL.rel) : (t === 'endo' ? L(DL.abs) : '');
}
function diagDraw(svg) {
  svg.classList.remove('drawn', 'show-levels', 'show-ea', 'show-dh');
  var c = svg.querySelector('.ed-curve'), len = 1400;
  try { len = c.getTotalLength() + 4; } catch (e) {}
  c.style.transition = 'none';
  c.style.strokeDasharray = len; c.style.strokeDashoffset = len;
  void c.getBoundingClientRect();
  setTimeout(function () {
    c.style.transition = 'stroke-dashoffset 1.9s cubic-bezier(.45,0,.2,1)';
    c.style.strokeDashoffset = 0;
    svg.classList.add('drawn');
  }, 350);
}

/* ================= navigation ================= */
var slides = $$('.slide'), N = slides.length;
var FX = {}, SL = {};
function later(s, fn, ms) { var id = setTimeout(fn, ms); (s._timers = s._timers || []).push(id); return id; }

function go(n, first) {
  n = clamp(n, 0, N - 1);
  var nw = slides[n], old = slides[S.i];
  if (old && old !== nw) { var oid = old.getAttribute('data-id'); if (SL[oid] && SL[oid].leave) SL[oid].leave(old); }
  slides.forEach(function (s, k) { s.classList.toggle('before', k < n); if (k !== n) s.classList.remove('active'); });
  (nw._timers || []).forEach(clearTimeout); nw._timers = [];
  $$('.frag', nw).forEach(function (f) { f.classList.remove('on'); });
  $$('[data-step]', nw).forEach(function (b) { b.classList.remove('done'); });
  $$('[data-toggle].open', nw).forEach(function (x) { x.classList.remove('open'); });
  var id = nw.getAttribute('data-id');
  if (SL[id] && SL[id].reset) SL[id].reset(nw);
  nw.classList.remove('shown');
  void nw.offsetWidth;
  nw.classList.add('active', 'shown');
  S.i = n;
  if (SL[id] && SL[id].enter) SL[id].enter(nw);
  bgSetMode(nw.getAttribute('data-amb') || 'calm');
  updateChrome();
  if (!first && old !== nw) sfx('whoosh');
}
function next() {
  var s = slides[S.i];
  var f = $$('.frag:not(.on)', s)[0];
  if (f) reveal(f);
  else if (S.i < N - 1) go(S.i + 1);
}
function prev() { if (S.i > 0) go(S.i - 1); }
function reveal(f) {
  if (f.classList.contains('on')) return;
  f.classList.add('on');
  sfx(f.classList.contains('flip') ? 'flip' : 'pop');
  var s = f.closest('.slide'), fx = f.getAttribute('data-fx');
  if (fx && FX[fx]) FX[fx](f, s);
  $$('[data-count]', f).forEach(countUp);
  if (f.hasAttribute('data-count')) countUp(f);
  updateStepBtns(s);
}
function revealTo(target) {
  var s = target.closest('.slide');
  var fr = $$('.frag', s);
  for (var i = 0; i < fr.length; i++) {
    if (!fr[i].classList.contains('on')) reveal(fr[i]);
    if (fr[i] === target) break;
  }
}
function updateStepBtns(s) {
  $$('[data-step]', s).forEach(function (b) {
    var c = b.closest('[data-steps]');
    if (c && !$$('.frag:not(.on)', c).length) b.classList.add('done');
  });
}

/* ================= chrome: bar, notes, menu ================= */
function updateChrome() {
  $$('.dn').forEach(function (b, k) { b.classList.toggle('cur', k === S.i); b.classList.toggle('done', k < S.i); });
  $('.c-cur').textContent = S.i + 1;
  $('.c-all').textContent = N;
  $('#bPrev').disabled = S.i === 0;
  $('#bNext').disabled = S.i === N - 1 && !$$('.frag:not(.on)', slides[S.i]).length;
  try { history.replaceState(null, '', '#' + (S.i + 1)); } catch (e) {}
  renderNotes();
  $$('.mi').forEach(function (m, k) { m.classList.toggle('cur', k === S.i); });
}
function renderNotes() {
  var p = $('#notesPanel');
  if (p.hidden) return;
  var s = slides[S.i], st = +s.getAttribute('data-stage');
  $('.np-stage', p).textContent = '📝 ' + L(STAGES[st]);
  $('.np-num', p).textContent = (S.i + 1) + ' / ' + N;
  var n = $('.notes', s);
  $('.np-body', p).innerHTML = n ? n.innerHTML : '';
}
function slideTitle(s) {
  var parts = (s.getAttribute('data-t') || '').split('|');
  return parts[{ kk: 0, ru: 1, en: 2 }[S.lang]] || parts[0];
}
function buildMenu() {
  var g = $('.menu-grid');
  g.innerHTML = '';
  slides.forEach(function (s, k) {
    var b = document.createElement('button');
    b.className = 'mi' + (k === S.i ? ' cur' : '');
    var st = +s.getAttribute('data-stage');
    var opt = (($('.notes', s) || {}).textContent || '').indexOf('⭐') >= 0;
    b.innerHTML = '<span class="mn">' + (k + 1) + '</span><span>' + slideTitle(s) +
      '<span class="mst">' + ROMAN[st] + ' · ' + STAGE_MIN[st] + ' ' + (S.lang === 'en' ? 'min' : 'мин') + (opt ? ' · ⭐ ' + L(UI.optional) : '') + '</span></span>';
    b.addEventListener('click', function () { closeAll(); go(k); });
    g.appendChild(b);
  });
}
function buildDots() {
  var box = $('.dots-nav'), prevSt = 0;
  box.innerHTML = '';
  slides.forEach(function (s, k) {
    var b = document.createElement('button');
    b.className = 'dn'; b.innerHTML = '<i></i>';
    var st = +s.getAttribute('data-stage');
    if (k && st !== prevSt) b.classList.add('sep');
    prevSt = st;
    if ((($('.notes', s) || {}).textContent || '').indexOf('⭐') >= 0) b.classList.add('opt');
    b.addEventListener('click', function () { go(k); });
    box.appendChild(b);
  });
  dotsTitles();
}
function dotsTitles() {
  $$('.dn').forEach(function (b, k) {
    var opt = b.classList.contains('opt') ? ' (⭐ ' + L(UI.optional) + ')' : '';
    var t = (k + 1) + '. ' + slideTitle(slides[k]) + opt;
    b.title = t; b.setAttribute('aria-label', t);
  });
}
function openPanel(id) {
  var p = $('#' + id);
  p.hidden = false;
  if (id === 'notesPanel') renderNotes();
  if (id === 'menuModal') buildMenu();
  if (id === 'scoresModal') renderTeams();
  if (id === 'timerPanel') tmOpen();
  syncToolBtns();
}
function closePanel(id) { $('#' + id).hidden = true; syncToolBtns(); }
function togglePanel(id) { if ($('#' + id).hidden) openPanel(id); else closePanel(id); }
function closeAll() { ['notesPanel', 'menuModal', 'scoresModal'].forEach(function (id) { $('#' + id).hidden = true; }); syncToolBtns(); }
function syncToolBtns() {
  $('#bNotes').classList.toggle('on', !$('#notesPanel').hidden);
  $('#bTimer').classList.toggle('on', !$('#timerPanel').hidden);
  $('#bScores').classList.toggle('on', !$('#scoresModal').hidden);
  $('#bMenu').classList.toggle('on', !$('#menuModal').hidden);
}

/* ================= language & theme ================= */
function applyLang() {
  html.lang = S.lang;
  $$('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === S.lang); });
  $$('[data-ui]').forEach(function (el) { var o = UI[el.getAttribute('data-ui')]; if (o) el.textContent = L(o); });
  $$('[data-ui-html]').forEach(function (el) { var o = UI[el.getAttribute('data-ui-html')]; if (o) el.innerHTML = L(o); });
  $$('[data-tip]').forEach(function (el) { var o = UI[el.getAttribute('data-tip')]; if (o) { el.title = L(o); el.setAttribute('aria-label', L(o)); } });
  document.title = L(TITLE);
  LANG_HOOKS.forEach(function (f) { f(); });
  renderNotes();
  if (!$('#menuModal').hidden) buildMenu();
}
function setLang(l) { if (l === S.lang) return; S.lang = l; store.set('lang', l); applyLang(); sfx('pop'); }
function applyTheme() { html.setAttribute('data-theme', S.theme); }

/* ================= timer ================= */
var TM = { total: 300, left: 300, run: false, last: 0, iv: 0 };
var RING = 2 * Math.PI * 52;
function tmFmt(sec) { sec = Math.max(0, Math.ceil(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
function tmRender() {
  var p = $('#timerPanel');
  $('.tm-time', p).textContent = tmFmt(TM.left);
  $('.tm-fg', p).style.strokeDashoffset = RING * (1 - TM.left / TM.total);
  p.classList.toggle('running', TM.run);
  p.classList.toggle('late', TM.left > 0 && TM.left <= 60 && TM.total > 60);
  $('.bt-time').textContent = (TM.run || (TM.left < TM.total && TM.left > 0)) ? tmFmt(TM.left) : '';
  $$('.tm-presets button').forEach(function (b) { b.classList.toggle('cur', +b.getAttribute('data-min') * 60 === TM.total); });
}
function tmSet(min) { TM.total = TM.left = min * 60; TM.run = false; clearInterval(TM.iv); $('#timerPanel').classList.remove('done'); tmRender(); }
function tmTick() {
  var now = performance.now();
  TM.left -= (now - TM.last) / 1000; TM.last = now;
  if (TM.left <= 0) {
    TM.left = 0; TM.run = false; clearInterval(TM.iv);
    var p = $('#timerPanel'); p.hidden = false; syncToolBtns();
    p.classList.remove('done'); void p.offsetWidth; p.classList.add('done');
    sfx('bell');
  }
  tmRender();
}
function tmToggle() {
  if (TM.left <= 0) { tmSet(TM.total / 60); }
  TM.run = !TM.run;
  $('#timerPanel').classList.remove('done');
  clearInterval(TM.iv);
  if (TM.run) { TM.last = performance.now(); TM.iv = setInterval(tmTick, 200); sfx('tick'); }
  tmRender();
}
function tmOpen() {
  if (!TM.run && TM.left === TM.total) tmSet(STAGE_MIN[+slides[S.i].getAttribute('data-stage')] || 5);
  tmRender();
}
function tmInit() {
  var box = $('.tm-presets');
  [1, 2, 3, 5, 7, 8, 10].forEach(function (m) {
    var b = document.createElement('button'); b.setAttribute('data-min', m); b.textContent = m + "'";
    b.addEventListener('click', function () { tmSet(m); sfx('pop'); });
    box.appendChild(b);
  });
  $$('[data-tm]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-tm');
      if (a === 'toggle') tmToggle();
      else if (a === 'reset') { tmSet(TM.total / 60); }
      else if (a === 'plus') { TM.left += 60; TM.total = Math.max(TM.total, TM.left); $('#timerPanel').classList.remove('done'); tmRender(); }
      else if (a === 'minus') { TM.left = Math.max(0, TM.left - 60); tmRender(); }
    });
  });
  // drag panel by header
  var p = $('#timerPanel'), h = $('.panel-h', p), d = null;
  h.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;
    var r = p.getBoundingClientRect();
    d = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    h.setPointerCapture(e.pointerId);
  });
  h.addEventListener('pointermove', function (e) {
    if (!d) return;
    var x = clamp(e.clientX - d.dx, 0, window.innerWidth - p.offsetWidth), y = clamp(e.clientY - d.dy, 0, window.innerHeight - p.offsetHeight);
    p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.right = 'auto';
  });
  h.addEventListener('pointerup', function () { d = null; });
  tmSet(5);
}

/* ================= scoreboard ================= */
var COLORS = ['#ff7a2f', '#3cc4ff', '#2ee59d', '#a98bff', '#ffc531', '#ff5d9e', '#2dd4bf', '#94a3b8'];
var teams = store.get('teams', null);
if (!Array.isArray(teams) || !teams.length) teams = [{ n: '', s: 0 }, { n: '', s: 0 }];
function teamName(i) { return teams[i].n || L(UI.team).replace('{n}', i + 1); }
function saveTeams() { store.set('teams', teams); renderMini(); }
function renderMini() {
  var m = $('.mini-scores');
  var any = teams.some(function (t) { return t.s > 0; });
  m.innerHTML = any ? teams.map(function (t, i) { return '<span class="ms" style="background:' + COLORS[i % 8] + '">' + t.s + '</span>'; }).join('') : '';
}
function renderTeams() {
  var box = $('.teams');
  box.innerHTML = '';
  var max = Math.max.apply(null, teams.map(function (t) { return t.s; }));
  teams.forEach(function (t, i) {
    var el = document.createElement('div');
    el.className = 'team' + (max > 0 && t.s === max ? ' lead' : '');
    el.style.setProperty('--tc', COLORS[i % 8]);
    el.innerHTML = '<span class="crown">👑</span><input maxlength="24" aria-label="name"><div class="sc">' + t.s + '</div><div class="tbr"><button class="minus" aria-label="-1">−</button><button class="plus">+1</button></div>';
    var inp = $('input', el);
    inp.value = t.n; inp.placeholder = L(UI.team).replace('{n}', i + 1);
    inp.addEventListener('input', function () { t.n = inp.value.trim(); saveTeams(); });
    $('.plus', el).addEventListener('click', function () {
      t.s++; saveTeams(); sfx('coin');
      var sc = $('.sc', el); sc.textContent = t.s; sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump');
      var f = document.createElement('span'); f.className = 'plus1'; f.textContent = '+1'; el.appendChild(f);
      setTimeout(function () { f.remove(); }, 900);
      burstAt(sc, { n: 18, power: 6 });
      updateLead();
    });
    $('.minus', el).addEventListener('click', function () { if (t.s > 0) { t.s--; saveTeams(); $('.sc', el).textContent = t.s; sfx('pop'); updateLead(); } });
    box.appendChild(el);
  });
}
function updateLead() {
  var max = Math.max.apply(null, teams.map(function (t) { return t.s; }));
  $$('.team').forEach(function (el, i) { el.classList.toggle('lead', max > 0 && teams[i].s === max); });
}
function scInit() {
  $$('[data-sc]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-sc');
      if (a === 'add' && teams.length < 8) teams.push({ n: '', s: 0 });
      if (a === 'remove' && teams.length > 1) teams.pop();
      if (a === 'reset') { if (!window.confirm(L(UI.resetConfirm))) return; teams.forEach(function (t) { t.s = 0; }); }
      saveTeams(); renderTeams(); sfx('pop');
    });
  });
  LANG_HOOKS.push(function () { if (!$('#scoresModal').hidden) renderTeams(); });
  renderMini();
}

/* ================= slide controllers ================= */
// black box
function bbReset(s) {
  var box = $('.bbox', s), th = $('.thermo', s);
  box.classList.remove('reacting', 'ready', 'open');
  if (th && th._min != null) thermoSet(th, +th.getAttribute('data-t0'), 0);
}
FX.bbStart = function (f, s) {
  var box = $('.bbox', s), th = $('.thermo', s);
  box.classList.remove('reacting'); void box.offsetWidth;
  box.classList.add('reacting'); box._t = performance.now();
  thermoSet(th, +th.getAttribute('data-t1'), 2600);
  sfx(box.getAttribute('data-type') === 'exo' ? 'fire' : 'ice');
  later(s, function () { box.classList.add('ready'); }, 1700);
};
FX.bbOpen = function (f, s) {
  var box = $('.bbox', s);
  var wait = Math.max(0, 2300 - (performance.now() - (box._t || 0)));
  later(s, function () {
    box.classList.add('open'); sfx('reveal');
    var exo = box.getAttribute('data-type') === 'exo';
    burstAt($('.bb-svg', s), { kind: exo ? 'fire' : 'ice', n: 60, power: 8 });
  }, wait);
};
SL.bb1 = { reset: bbReset };
SL.bb2 = { reset: bbReset };

// bonds
FX.bond1 = function (f, s) { var svg = $('.bond-svg', s); svg.classList.remove('st2'); svg.classList.add('st1'); svg._t = performance.now(); sfx('ice'); };
FX.bond2 = function (f, s) {
  var svg = $('.bond-svg', s);
  var wait = Math.max(0, 1500 - (performance.now() - (svg._t || 0)));
  later(s, function () {
    svg.classList.add('st2'); sfx('fire');
    later(s, function () { var r = svg.getBoundingClientRect(); burst(r.left + r.width * 0.74, r.top + r.height * 0.5, { kind: 'fire', n: 50 }); }, 1100);
  }, wait);
};
SL.bonds = { reset: function (s) { $('.bond-svg', s).classList.remove('st1', 'st2'); } };

// Q / ΔH
function qMode(s, m) {
  var v = $('.qviz', s);
  v.classList.remove('m-exo', 'm-endo'); v.classList.add('m-' + m);
  $$('[data-qmode]', s).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-qmode') === m); });
}
SL.qdh = {
  reset: function (s) { var v = $('.qviz', s); v.classList.remove('m-exo', 'm-endo'); $$('[data-qmode]', s).forEach(function (b) { b.classList.remove('on'); }); },
  enter: function (s) { later(s, function () { qMode(s, 'exo'); }, 900); }
};

// thermochemical equation
FX.teqHl = function (f, s) {
  var t = $('.teq', s); t.classList.remove('hl-st', 'hl-q', 'hl-std');
  var h = f.getAttribute('data-hl'); if (h && h !== 'none') t.classList.add('hl-' + h);
};
SL.thermoeq = { reset: function (s) { $('.teq', s).classList.remove('hl-st', 'hl-q', 'hl-std'); } };

// calorimeter (v2): steps 1–6, exo / endo modes
var CAL = { mode: 'exo' };
var CAL_T2 = { exo: 31.5, endo: 12 };
var CAL_L = {
  stir: T3('Араластырғыш', 'Мешалка', 'Stirrer'),
  lid: T3('Қақпақ', 'Крышка', 'Lid'),
  gap: T3('Ауа қабаты', 'Воздушная прослойка', 'Air gap'),
  gapS: T3('жылуды өткізбейді', 'не пропускает тепло', 'keeps the heat in'),
  outer: T3('Сыртқы ыдыс', 'Внешний сосуд', 'Outer vessel'),
  water: T3('Су', 'Вода', 'Water'),
  therm: T3('Термометр', 'Термометр', 'Thermometer'),
  inner: T3('Ішкі ыдыс', 'Внутренний сосуд', 'Inner vessel'),
  ch: T3('Реакциялық ыдыс', 'Реакционный сосуд', 'Reaction vessel'),
  chS: T3('реакция осында жүреді', 'здесь идёт реакция', 'the reaction happens here'),
  sup: T3('Тығын тіреуіш', 'Пробковая подставка', 'Cork support')
};
var JU = T3('Дж', 'Дж', 'J'), KGU = T3('кг', 'кг', 'kg');
function calSlide() { return $('[data-id="calor"]'); }
function calTy(T) { return 166 - T * 3; }
function calTherm(s, T) {
  s._calT = T;
  var y = calTy(T), liq = $('.cth-liq', s);
  liq.setAttribute('y', y); liq.setAttribute('height', 458 - y);
  $('.cth-tag', s).setAttribute('transform', 'translate(0 ' + (y - 106) + ')');
  $('.cth-val', s).textContent = fmtNum(T, 1) + ' °C';
}
function calTween(s, to, dur, cb) {
  if (s._calRaf) cancelAnimationFrame(s._calRaf);
  var from = s._calT, t0 = performance.now();
  function step(t) {
    var k = clamp((t - t0) / dur, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    calTherm(s, from + (to - from) * e);
    if (k < 1) s._calRaf = requestAnimationFrame(step); else { s._calRaf = 0; if (cb) cb(); }
  }
  s._calRaf = requestAnimationFrame(step);
}
function calTicks(s) {
  var h = '';
  for (var T = 0; T <= 40; T += 5) {
    var y = calTy(T);
    h += '<line x1="' + (T % 10 ? 482 : 475) + '" x2="491" y1="' + y + '" y2="' + y + '"/>';
    if (T % 10 === 0) h += '<text x="469" y="' + (y + 5) + '" text-anchor="end">' + T + '</text>';
  }
  $('.cth-ticks', s).innerHTML = h;
}
function calLabels(s) { $$('.cal-lbls [data-k]', s).forEach(function (t) { t.textContent = L(CAL_L[t.getAttribute('data-k')]); }); }
function calFormula(s) {
  var ex = CAL.mode === 'exo', dt = Math.abs(CAL_T2[CAL.mode] - 20), Q = Math.round(4200 * 0.1 * dt);
  var w = L(T3('су', 'воды', 'water'));
  $('.cal-q', s).innerHTML =
    '<div class="cq-h">' + L(T3('Жылу мөлшері:', 'Количество теплоты:', 'Amount of heat:')) + '</div>' +
    '<div class="cq-f">Q = c · m · Δt = 4200 · ' + fmtNum(0.1, 1) + ' · ' + fmtNum(dt, 1) + ' = ' + Q + ' ' + L(JU) + ' ≈ ' + fmtNum(Q / 1000, 1) + ' ' + L(UI.kJ) + '</div>' +
    '<div class="cq-l">c(' + w + ') = 4200 ' + L(JU) + '/(' + L(KGU) + '·°C), m(' + w + ') = ' + fmtNum(0.1, 1) + ' ' + L(KGU) + '</div>' +
    '<div class="cq-r ' + (ex ? 'exo' : 'endo') + '">' + L(ex
      ? T3('Су жылыды → реакцияда жылу <b>бөлінді</b> → <b>экзо</b>', 'Вода нагрелась → теплота <b>выделилась</b> → <b>экзо</b>', 'The water warmed up → heat was <b>released</b> → <b>exo</b>')
      : T3('Су суыды → реакция жылу <b>сіңірді</b> → <b>эндо</b>', 'Вода остыла → теплота <b>поглотилась</b> → <b>эндо</b>', 'The water cooled down → heat was <b>absorbed</b> → <b>endo</b>')) + '</div>';
}
function calRead(s) {
  var n = s._calStep || 0, t2 = CAL_T2[CAL.mode], done = n >= 5 && s._calDone, dt = t2 - 20;
  $('.cr-t1', s).textContent = n >= 1 ? fmtNum(20, 1) + ' °C' : '—';
  $('.cr-t2', s).textContent = done ? fmtNum(t2, 1) + ' °C' : '—';
  var d = $('.cr-dt', s);
  d.textContent = done ? (dt > 0 ? '+' : '−') + fmtNum(Math.abs(dt), 1) + ' °C' : '—';
  d.className = 'cr-dt' + (done ? (dt > 0 ? ' up' : ' down') : '');
  calFormula(s);
}
function calStop(s) {
  if (s._calRaf) { cancelAnimationFrame(s._calRaf); s._calRaf = 0; }
  if (s._calPlay) { clearInterval(s._calPlay); s._calPlay = 0; }
}
function calReset(s) {
  calStop(s);
  var w = $('.cal2', s);
  for (var k = 1; k <= 6; k++) w.classList.remove('cs' + k);
  w.classList.remove('mode-exo', 'mode-endo'); w.classList.add('mode-' + CAL.mode);
  $$('[data-calmode]', s).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-calmode') === CAL.mode); });
  s._calStep = 0; s._calDone = false;
  calTherm(s, 20);
  calRead(s);
}
function calRestart(s) {
  $$('.frag', s).forEach(function (f) { f.classList.remove('on'); });
  $$('[data-step]', s).forEach(function (b) { b.classList.remove('done'); });
  calReset(s);
}
function calPlay(s) {
  if (s._calPlay) { clearInterval(s._calPlay); s._calPlay = 0; return; }
  var tick = function () {
    var f = $$('.frag:not(.on)', s)[0];
    if (!f) { clearInterval(s._calPlay); s._calPlay = 0; return; }
    reveal(f);
  };
  tick();
  s._calPlay = setInterval(tick, 2700);
}
FX.cal = function (f, s) {
  var n = +f.getAttribute('data-s'), w = $('.cal2', s);
  for (var k = 1; k <= n; k++) w.classList.add('cs' + k);
  s._calStep = Math.max(s._calStep || 0, n);
  var t2 = CAL_T2[CAL.mode];
  if (n === 2) { sfx(CAL.mode === 'exo' ? 'fire' : 'ice'); calTween(s, 20 + (t2 - 20) * 0.55, 2600); }
  if (n === 3) calTween(s, 20 + (t2 - 20) * 0.92, 2400);
  if (n === 5) calTween(s, t2, 1500, function () {
    s._calDone = true; calRead(s); sfx('ok');
    burstAt($('.cth-tag', s), { kind: CAL.mode === 'exo' ? 'fire' : 'ice', n: 30, power: 6 });
  });
  calRead(s);
};
SL.calor = { reset: calReset, leave: calStop };

// diagrams
FX.diag = function (f, s) {
  var svg = $('.ediag', s); svg.classList.add('show-' + f.getAttribute('data-show'));
  if (f.getAttribute('data-show') === 'dh') { var a = svg.querySelector('.dh-ar'); burstAt(a, { kind: svg._type === 'exo' ? 'fire' : 'ice', n: 30, power: 6 }); }
};
SL.pairs = {
  reset: function (s) {
    $$('.pg', s).forEach(function (c) { c.classList.remove('open'); });
    $$('.ediag', s).forEach(function (svg) { svg.classList.remove('show-levels', 'show-ea', 'show-dh', 'drawn'); });
  },
  enter: function (s) {
    $$('.ediag', s).forEach(function (svg) { diagDraw(svg); });
    later(s, function () { $$('.ediag', s).forEach(function (svg) { svg.classList.add('show-levels'); }); }, 2300);
  }
};
SL.diag1 = SL.diag2 = {
  reset: function (s) { $('.ediag', s).classList.remove('show-levels', 'show-ea', 'show-dh', 'drawn'); },
  enter: function (s) { diagDraw($('.ediag', s)); }
};

// builder
function bldUpdate() {
  var er = +$('#sEr').value, ep = +$('#sEp').value, svg = $('#bldDiag');
  $('#oEr').textContent = er; $('#oEp').textContent = ep;
  svg.setAttribute('data-er', er); svg.setAttribute('data-ep', ep);
  diagRender(svg);
  var dh = ep - er;
  $('#bDhCalc').textContent = ep + ' − ' + er;
  $('#bDh').textContent = (dh > 0 ? '+' : (dh < 0 ? '−' : '')) + Math.abs(dh);
  var t = $('#bType');
  t.className = 'bld-type ' + (dh < 0 ? 'exo' : (dh > 0 ? 'endo' : 'zero'));
  t.textContent = L(dh < 0 ? UI.exoT : (dh > 0 ? UI.endoT : UI.zeroT));
}

// summary
FX.sumbox = function (f) { burstAt($('.sb-ico', f), { kind: f.classList.contains('exo') ? 'fire' : 'ice', n: 30, power: 6 }); };

// thanks
SL.thanks = {
  enter: function (s) {
    later(s, function () {
      sfx('win');
      burst(window.innerWidth * 0.2, window.innerHeight * 0.55, { n: 90, power: 12 });
      burst(window.innerWidth * 0.8, window.innerHeight * 0.55, { n: 90, power: 12 });
    }, 700);
  }
};

/* ---------- choose (exo / endo buttons) ---------- */
function choosePick(btn) {
  var row = btn.closest('.choose');
  if (row.classList.contains('ok')) return;
  if (btn.getAttribute('data-pick') === row.getAttribute('data-answer')) {
    row.classList.add('ok'); btn.classList.add('sel'); sfx('ok');
    burstAt(btn, { kind: row.getAttribute('data-answer') === 'exo' ? 'fire' : 'ice', n: 26, power: 6 });
    var s = row.closest('.slide');
    if ($$('.choose', s).every(function (r) { return r.classList.contains('ok'); })) later(s, function () { sfx('win'); burstAt(s, { n: 120, power: 14 }); }, 500);
  } else {
    btn.classList.remove('no'); void btn.offsetWidth; btn.classList.add('no'); sfx('bad');
  }
}
function chooseShowAll(s) {
  $$('.choose', s).forEach(function (r) {
    r.classList.add('ok');
    $$('.pick', r).forEach(function (p) { p.classList.toggle('sel', p.getAttribute('data-pick') === r.getAttribute('data-answer')); p.classList.remove('no'); });
  });
  sfx('reveal');
}
function chooseReset(s) {
  $$('.choose', s).forEach(function (r) { r.classList.remove('ok'); $$('.pick', r).forEach(function (p) { p.classList.remove('sel', 'no'); }); });
  sfx('pop');
}

/* ---------- drag & drop game ---------- */
var GAME = [
  { e: '🔥', t: T3('Ағаштың жануы', 'Горение древесины', 'Burning wood'), a: 'exo' },
  { f: 'CaCO3 → CaO + CO2', t: T3('әктастың айырылуы', 'разложение известняка', 'decomposing limestone'), a: 'endo' },
  { e: '🔥', t: T3('Табиғи газдың жануы', 'Горение природного газа', 'Burning natural gas'), a: 'exo' },
  { e: '🌿', t: T3('Фотосинтез', 'Фотосинтез', 'Photosynthesis'), a: 'endo' },
  { f: 'HCl + NaOH → NaCl + H2O', t: T3('бейтараптану', 'нейтрализация', 'neutralisation'), a: 'exo' },
  { f: 'Cu(OH)2 → CuO + H2O', t: T3('қыздырғанда айырылады', 'разлагается при нагревании', 'decomposes on heating'), a: 'endo' },
  { e: '💧', t: T3('Сутектің жануы', 'Горение водорода', 'Burning hydrogen'), a: 'exo' },
  { e: '⚡', t: T3('Судың электролизі', 'Электролиз воды', 'Electrolysis of water'), a: 'endo' },
  { f: 'H2 + Cl2 → 2HCl + 184 {kJ}', a: 'exo' },
  { f: 'N2 + O2 → 2NO − 180 {kJ}', a: 'endo' },
  { e: '🏃', t: T3('Тыныс алу (глюкозаның тотығуы)', 'Дыхание (окисление глюкозы)', 'Respiration (glucose oxidation)'), a: 'exo' },
  { e: '🍋', t: T3('Ас содасы + лимон қышқылы', 'Пищевая сода + лимонная кислота', 'Baking soda + citric acid'), a: 'endo' }
];
var G = { placed: 0, err: 0, sel: null, drag: null };
function gameCardHTML(it) {
  var h = '';
  if (it.e) h += '<span class="dc-e">' + it.e + '</span>';
  if (it.f) h += '<span class="f">' + it.f.replace('{kJ}', L(UI.kJ)) + '</span>';
  if (it.t) h += it.f ? '<small>' + L(it.t) + '</small>' : '<span>' + L(it.t) + '</span>';
  return h;
}
function gameChipText(it) { return it.t && !it.f ? L(it.t) : it.f.replace('{kJ}', L(UI.kJ)); }
function gameInit() {
  var s = $('[data-id="game"]'), deck = $('.deck', s);
  var order = GAME.map(function (_, i) { return i; });
  for (var i = order.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = order[i]; order[i] = order[j]; order[j] = t; }
  deck.innerHTML = '';
  order.forEach(function (k) {
    var c = document.createElement('div');
    c.className = 'dcard'; c.setAttribute('data-k', k); c.setAttribute('data-a', GAME[k].a);
    c.innerHTML = gameCardHTML(GAME[k]);
    deck.appendChild(c);
  });
  $$('.bk-items', s).forEach(function (b) { b.innerHTML = ''; });
  $$('.bk-n', s).forEach(function (b) { b.textContent = '0'; });
  $('.game-layout', s).classList.remove('won');
  G.placed = 0; G.err = 0; G.sel = null;
  subifyAll(deck);
  gameStat();
}
function gameStat() {
  var s = $('[data-id="game"]');
  $('.game-stat', s).textContent = L(UI.gameStat).replace('{a}', G.placed).replace('{b}', GAME.length).replace('{e}', G.err);
}
function gameLang() {
  var s = $('[data-id="game"]');
  $$('.dcard', $('.deck', s)).forEach(function (c) { c.innerHTML = gameCardHTML(GAME[+c.getAttribute('data-k')]); subify(c); });
  $$('.bk-chip', s).forEach(function (c) { c.innerHTML = gameChipText(GAME[+c.getAttribute('data-k')]); subify(c); });
  gameStat();
  if ($('.game-layout', s).classList.contains('won')) gameWinText();
}
function gameWinText() {
  var s = $('[data-id="game"]');
  $('.gw-title', s).textContent = G.err ? L(UI.gameWinErr).replace('{e}', G.err) : L(UI.gameWin);
}
function gameDrop(card, basket) {
  var s = basket.closest('.slide');
  var k = +card.getAttribute('data-k');
  if (basket.getAttribute('data-basket') === card.getAttribute('data-a')) {
    card.classList.remove('sel', 'dragging'); card.classList.add('gone');
    setTimeout(function () { card.remove(); }, 300);
    var chip = document.createElement('div'); chip.className = 'bk-chip'; chip.setAttribute('data-k', k);
    chip.innerHTML = gameChipText(GAME[k]); subify(chip);
    $('.bk-items', basket).appendChild(chip);
    var n = $('.bk-n', basket); n.textContent = +n.textContent + 1;
    G.placed++; sfx('ok');
    burstAt(basket, { kind: basket.getAttribute('data-basket') === 'exo' ? 'fire' : 'ice', n: 26, power: 6 });
    if (G.placed === GAME.length) {
      later(s, function () { $('.game-layout', s).classList.add('won'); gameWinText(); sfx('win'); burst(window.innerWidth / 2, window.innerHeight / 2, { n: 160, power: 15 }); }, 500);
    }
  } else {
    G.err++; sfx('bad');
    card.classList.remove('dragging', 'sel', 'bad'); void card.offsetWidth; card.classList.add('bad');
    basket.classList.remove('wrong'); void basket.offsetWidth; basket.classList.add('wrong');
    setTimeout(function () { basket.classList.remove('wrong'); card.classList.remove('bad'); }, 700);
  }
  G.sel = null;
  gameStat();
}
function gameBind() {
  var s = $('[data-id="game"]'), deck = $('.deck', s), layer = $('#fxLayer');
  function basketAt(x, y) {
    var hit = null;
    $$('.basket', s).forEach(function (b) { var r = b.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hit = b; });
    return hit;
  }
  deck.addEventListener('pointerdown', function (e) {
    var c = e.target.closest('.dcard'); if (!c || c.classList.contains('gone')) return;
    e.preventDefault();
    var r = c.getBoundingClientRect();
    G.drag = { c: c, x0: e.clientX, y0: e.clientY, ox: (e.clientX - r.left) / S.scale, oy: (e.clientY - r.top) / S.scale, moved: false, ghost: null };
    try { c.setPointerCapture(e.pointerId); } catch (err) {}
  });
  deck.addEventListener('pointermove', function (e) {
    var d = G.drag; if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) > 10) {
      d.moved = true;
      var g = d.c.cloneNode(true); g.classList.add('ghost'); g.classList.remove('sel');
      g.style.width = d.c.offsetWidth + 'px';
      layer.appendChild(g); d.ghost = g; d.c.classList.add('dragging');
    }
    if (d.moved) {
      var sr = stage.getBoundingClientRect();
      d.ghost.style.left = ((e.clientX - sr.left) / S.scale - d.ox) + 'px';
      d.ghost.style.top = ((e.clientY - sr.top) / S.scale - d.oy) + 'px';
      var b = basketAt(e.clientX, e.clientY);
      $$('.basket', s).forEach(function (x) { x.classList.toggle('hover', x === b); });
    }
  });
  function end(e, cancel) {
    var d = G.drag; if (!d) return;
    G.drag = null;
    $$('.basket', s).forEach(function (x) { x.classList.remove('hover'); });
    if (d.ghost) d.ghost.remove();
    if (d.moved) {
      var b = cancel ? null : basketAt(e.clientX, e.clientY);
      if (b) gameDrop(d.c, b); else d.c.classList.remove('dragging');
    } else if (!cancel) {
      var was = d.c.classList.contains('sel');
      $$('.dcard.sel', deck).forEach(function (x) { x.classList.remove('sel'); });
      if (!was) { d.c.classList.add('sel'); G.sel = d.c; sfx('pop'); } else G.sel = null;
    }
  }
  deck.addEventListener('pointerup', function (e) { end(e, false); });
  deck.addEventListener('pointercancel', function (e) { end(e, true); });
  $$('.basket', s).forEach(function (b) {
    b.addEventListener('click', function () { if (G.sel && G.sel.isConnected) gameDrop(G.sel, b); });
  });
  LANG_HOOKS.push(gameLang);
}

/* ---------- quiz ---------- */
var QUIZ = [
  { q: T3('Экзотермиялық реакция кезінде…', 'При экзотермической реакции…', 'In an exothermic reaction…'),
    o: [T3('жылу бөлінеді', 'теплота выделяется', 'heat is released'), T3('жылу сіңіріледі', 'теплота поглощается', 'heat is absorbed'), T3('энергия өзгермейді', 'энергия не меняется', 'energy does not change')], a: 0 },
  { q: T3('ΔH > 0 болса, реакция…', 'Если ΔH > 0, реакция…', 'If ΔH > 0, the reaction is…'),
    o: [T3('экзотермиялық', 'экзотермическая', 'exothermic'), T3('эндотермиялық', 'эндотермическая', 'endothermic'), T3('мүлдем жүрмейді', 'вообще не протекает', 'impossible')], a: 1 },
  { q: T3('Қай реакция эндотермиялық?', 'Какая реакция эндотермическая?', 'Which reaction is endothermic?'),
    o: [{ f: 'CH4 + 2O2 → CO2 + 2H2O' }, { f: 'HCl + NaOH → NaCl + H2O' }, { f: 'CaCO3 → CaO + CO2' }], a: 2 },
  { q: T3('Диаграммада өнімдер реагенттерден төмен орналасса, реакция…', 'Если на диаграмме продукты ниже реагентов, реакция…', 'If the products are below the reactants on the diagram, the reaction is…'),
    o: [T3('экзотермиялық', 'экзотермическая', 'exothermic'), T3('эндотермиялық', 'эндотермическая', 'endothermic'), T3('жылу эффектісі нөлге тең', 'с нулевым тепловым эффектом', 'one with zero heat effect')], a: 0, img: true },
  { q: T3('1 моль көміртек жанғанда 394 кДж жылу бөлінеді. 2 моль жанғанда қанша жылу бөлінеді?', 'При сгорании 1 моль углерода выделяется 394 кДж. Сколько теплоты выделится при сгорании 2 моль?', 'Burning 1 mol of carbon releases 394 kJ. How much heat do 2 mol release?'),
    o: [{ n: '394' }, { n: '197' }, { n: '788' }], a: 2 }
];
var QZ = { i: 0, ans: [] };
function qzRender() {
  var s = $('[data-id="quiz"]'), w = $('.quiz-wrap', s);
  $('.qz-dots', s).innerHTML = QUIZ.map(function (q, i) {
    var c = QZ.ans[i] == null ? '' : (QZ.ans[i] === q.a ? 'ok' : 'no');
    return '<i class="' + c + (i === QZ.i ? ' cur' : '') + '"></i>';
  }).join('');
  if (QZ.i >= QUIZ.length) {
    w.classList.add('done');
    var score = QZ.ans.filter(function (a, i) { return a === QUIZ[i].a; }).length;
    $('.qz-stars', s).textContent = '★★★★★'.slice(0, score) + '☆☆☆☆☆'.slice(0, 5 - score);
    $('.qz-score', s).textContent = score + ' / ' + QUIZ.length;
    $('.qz-msg', s).textContent = L(score === 5 ? T3('Керемет! Сен — нағыз химиксің! 🧪', 'Блестяще! Настоящий химик! 🧪', 'Brilliant! A true chemist! 🧪')
      : score >= 3 ? T3('Жақсы нәтиже! 👍', 'Хороший результат! 👍', 'Good result! 👍')
      : T3('Тақырыпты тағы бір қайталайық 💪', 'Давай ещё раз повторим тему 💪', "Let's review the topic once more 💪"));
    return;
  }
  w.classList.remove('done');
  var it = QUIZ[QZ.i], card = $('.qz-card', s), ans = QZ.ans[QZ.i];
  card.classList.toggle('answered', ans != null);
  $('.qz-num', s).textContent = L(UI.question) + ' ' + (QZ.i + 1) + ' / ' + QUIZ.length;
  var q = $('.qz-q', s);
  q.innerHTML = (it.img ? '<svg class="ediag thumb qz-img" data-er="520" data-ep="200" data-ea="170" data-thumb="1" viewBox="0 0 900 560"></svg>' : '') + '<span class="f-free">' + L(it.q) + '</span>';
  if (it.img) diagRender($('.qz-img', q));
  var opts = $('.qz-opts', s);
  opts.innerHTML = '';
  it.o.forEach(function (o, k) {
    var b = document.createElement('button'); b.className = 'qopt';
    var label = o.f ? '<span class="f">' + o.f + '</span>' : (o.n ? '<span class="f">' + o.n + ' ' + L(UI.kJ) + '</span>' : L(o));
    b.innerHTML = '<span class="ql">' + 'ABC'[k] + '</span><span>' + label + '</span>';
    if (ans != null) { if (k === it.a) b.classList.add('ok'); else if (k === ans) b.classList.add('no'); }
    b.addEventListener('click', function () {
      if (QZ.ans[QZ.i] != null) return;
      QZ.ans[QZ.i] = k;
      var right = k === it.a;
      sfx(right ? 'ok' : 'bad');
      if (right) burstAt(b, { n: 40, power: 9 });
      qzRender();
    });
    opts.appendChild(b);
  });
  subifyAll(opts);
  $('.qz-next', s).textContent = L(QZ.i === QUIZ.length - 1 ? UI.finish : UI.nextQ);
}
function qzInit() {
  var s = $('[data-id="quiz"]');
  $('.qz-next', s).addEventListener('click', function () {
    QZ.i++; qzRender(); sfx('pop');
    if (QZ.i >= QUIZ.length) {
      var score = QZ.ans.filter(function (a, i) { return a === QUIZ[i].a; }).length;
      sfx(score >= 3 ? 'win' : 'reveal');
      if (score >= 3) burst(window.innerWidth / 2, window.innerHeight * 0.45, { n: 140, power: 14 });
    }
  });
  LANG_HOOKS.push(qzRender);
  qzRender();
}

/* ---------- self assessment ---------- */
var AS_MSG = [
  [0, T3('Шеңберлерді басып, ұпайыңды белгіле', 'Нажимай на кружки и отмечай баллы', 'Tap the circles to mark your points')],
  [1, T3('Тақырыпты қайталау керек 💪', 'Нужно повторить тему 💪', 'Time to review the topic 💪')],
  [4, T3('Жаман емес — тағы қайтала 📚', 'Неплохо — повтори ещё 📚', 'Not bad — review once more 📚')],
  [7, T3('Жақсы! 👍', 'Хорошо! 👍', 'Good job! 👍')],
  [9, T3('Тамаша! 🌟', 'Превосходно! 🌟', 'Excellent! 🌟')]
];
function asInit() {
  var s = $('[data-id="assess"]');
  $$('.as-row[data-max]', s).forEach(function (row) {
    var max = +row.getAttribute('data-max'), box = $('.dots', row);
    row._v = 0;
    for (var i = 1; i <= max; i++) {
      (function (v) {
        var d = document.createElement('button'); d.className = 'dot'; d.setAttribute('aria-label', String(v));
        d.addEventListener('click', function () { row._v = row._v === v ? v - 1 : v; asRender(); sfx('pop'); });
        box.appendChild(d);
      })(i);
    }
  });
  $('[data-as-reset]', s).addEventListener('click', function () { $$('.as-row[data-max]', s).forEach(function (r) { r._v = 0; }); asRender(); sfx('pop'); });
  LANG_HOOKS.push(asRender);
  asRender();
}
function asRender() {
  var s = $('[data-id="assess"]'), total = 0;
  $$('.as-row[data-max]', s).forEach(function (row) {
    total += row._v;
    $$('.dot', row).forEach(function (d, i) { d.classList.toggle('on', i < row._v); });
  });
  var prevTotal = s._total || 0; s._total = total;
  $('.as-num b', s).textContent = total;
  var fg = $('.g-fg', s);
  fg.style.strokeDashoffset = 502.65 * (1 - total / 10);
  fg.style.stroke = total >= 7 ? 'var(--good)' : total >= 4 ? 'var(--warn)' : 'var(--bad)';
  var msg = AS_MSG[0][1];
  AS_MSG.forEach(function (m) { if (total >= m[0]) msg = m[1]; });
  $('.as-msg', s).textContent = L(msg);
  if (total === 10 && prevTotal < 10) { sfx('win'); burstAt($('.gauge', s), { n: 100, power: 12 }); }
}

/* ================= event wiring ================= */
function bindEvents() {
  $('#bNext').addEventListener('click', next);
  $('#bPrev').addEventListener('click', prev);
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  $('#bTheme').addEventListener('click', function () { S.theme = S.theme === 'dark' ? 'light' : 'dark'; store.set('theme', S.theme); applyTheme(); sfx('pop'); });
  $('#bSound').addEventListener('click', function () { S.sound = !S.sound; store.set('sound', S.sound); $('#bSound').classList.toggle('mute', !S.sound); sfx('pop'); });
  $('#bSound').classList.toggle('mute', !S.sound);
  $('#bTimer').addEventListener('click', function () { togglePanel('timerPanel'); });
  $('#bScores').addEventListener('click', function () { togglePanel('scoresModal'); });
  $('#bNotes').addEventListener('click', function () { togglePanel('notesPanel'); });
  $('#bMenu').addEventListener('click', function () { togglePanel('menuModal'); });
  $('#bFull').addEventListener('click', toggleFull);
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closePanel(b.getAttribute('data-close')); }); });
  $$('.modal').forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) closePanel(m.id); }); });

  // stage-level delegation
  stage.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest('[data-reveal]'))) { var tg = $(el.getAttribute('data-reveal'), el.closest('.slide')); if (tg) revealTo(tg); return; }
    if ((el = t.closest('[data-step]'))) {
      var c = el.closest('[data-steps]'); var f = c && $$('.frag:not(.on)', c)[0];
      if (f) reveal(f); return;
    }
    if ((el = t.closest('[data-open-scores]'))) { openPanel('scoresModal'); return; }
    if ((el = t.closest('[data-pairrev]'))) {
      var pc = el.closest('.pg'), on = !pc.classList.contains('open'), dg = $('.ediag', pc);
      pc.classList.toggle('open', on); dg.classList.toggle('show-dh', on);
      if (on) { sfx('ok'); burstAt(el, { kind: dg._type === 'exo' ? 'fire' : 'ice', n: 30, power: 7 }); } else sfx('pop');
      return;
    }
    if ((el = t.closest('[data-pick]'))) { choosePick(el); return; }
    if ((el = t.closest('[data-showall]'))) { chooseShowAll(el.closest('.slide')); return; }
    if ((el = t.closest('[data-resetchoose]'))) { chooseReset(el.closest('.slide')); return; }
    if ((el = t.closest('[data-toggle-hint]'))) { $('.q6-list', el.closest('.slide')).classList.toggle('hint'); sfx('pop'); return; }
    if ((el = t.closest('[data-qmode]'))) { qMode(el.closest('.slide'), el.getAttribute('data-qmode')); sfx(el.getAttribute('data-qmode') === 'exo' ? 'fire' : 'ice'); return; }
    if ((el = t.closest('[data-calmode]'))) { CAL.mode = el.getAttribute('data-calmode'); calRestart(el.closest('.slide')); sfx(CAL.mode === 'exo' ? 'fire' : 'ice'); return; }
    if ((el = t.closest('[data-calplay]'))) { calPlay(el.closest('.slide')); return; }
    if ((el = t.closest('[data-calreset]'))) { calRestart(el.closest('.slide')); sfx('pop'); return; }
    if ((el = t.closest('[data-pre]'))) {
      var v = el.getAttribute('data-pre').split(','); $('#sEr').value = v[0]; $('#sEp').value = v[1]; bldUpdate(); sfx('pop'); return;
    }
    if ((el = t.closest('[data-game-reset]'))) { gameInit(); sfx('reveal'); return; }
    if ((el = t.closest('[data-quiz-reset]'))) { QZ = { i: 0, ans: [] }; qzRender(); sfx('reveal'); return; }
    if ((el = t.closest('.flip'))) {
      if (el.classList.contains('on')) { el.classList.remove('on'); sfx('flip'); }
      else { el.classList.add('on'); sfx('flip'); $$('[data-count]', el).forEach(countUp); }
      updateStepBtns(el.closest('.slide'));
      return;
    }
    if ((el = t.closest('[data-toggle]'))) { el.classList.toggle('open'); sfx('pop'); return; }
  });
  // mouse clicks should not leave focus on buttons (so Space/Enter on a remote keeps navigating)
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b && e.detail > 0) b.blur(); });

  ['sEr', 'sEp'].forEach(function (id) { $('#' + id).addEventListener('input', bldUpdate); });

  // keyboard
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) { if (e.key === 'Escape') e.target.blur(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, code = e.code, h = true;
    if ((k === ' ' || k === 'Enter') && (tag === 'button' || tag === 'a')) return;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') next();
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') prev();
    else if (k === 'ArrowDown') go(S.i + 1);
    else if (k === 'ArrowUp') go(S.i - 1);
    else if (k === 'Home') go(0);
    else if (k === 'End') go(N - 1);
    else if (code === 'KeyN') togglePanel('notesPanel');
    else if (code === 'KeyT') togglePanel('timerPanel');
    else if (code === 'KeyS') togglePanel('scoresModal');
    else if (code === 'KeyM') togglePanel('menuModal');
    else if (code === 'KeyF') toggleFull();
    else if (k === 'Escape') { closeAll(); closePanel('timerPanel'); }
    else h = false;
    if (h) e.preventDefault();
  });

  // touch swipe
  var sw = null;
  viewport.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    if (e.target.closest('button,input,a,label,.noswipe,[data-toggle],.flip,.dcard,.qopt')) return;
    sw = { x: e.clientX, y: e.clientY, t: Date.now() };
  });
  viewport.addEventListener('pointerup', function (e) {
    if (!sw) return;
    var dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 90 && Date.now() - sw.t < 900) { if (dx < 0) next(); else prev(); }
    sw = null;
  });

  window.addEventListener('resize', function () { fit(); bgResize(); });
  // the stage must never scroll (focus or dragging can scroll overflow:hidden boxes)
  function unscroll(el) { if (el.scrollLeft || el.scrollTop) { el.scrollLeft = 0; el.scrollTop = 0; } }
  viewport.addEventListener('scroll', function () { unscroll(viewport); });
  $$('.slide, .body').forEach(function (el) { el.addEventListener('scroll', function () { unscroll(el); }); });
  window.addEventListener('scroll', function () { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); });
  window.addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n >= 1 && n <= N && n - 1 !== S.i) go(n - 1); });
}
function toggleFull() {
  var d = document, el = d.documentElement;
  var isFull = d.fullscreenElement || d.webkitFullscreenElement;
  try {
    if (!isFull) { (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
    else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
  } catch (e) {}
}

/* ================= init ================= */
function init() {
  applyTheme();
  $$('.thermo').forEach(thermoBuild);
  $$('.ediag').forEach(function (svg) { diagRender(svg); });
  LANG_HOOKS.push(function () { $$('.ediag').forEach(diagText); bldUpdate(); if (slides[S.i].getAttribute('data-id') === 'calor') {} });
  subifyAll();
  tmInit(); scInit(); gameInit(); gameBind(); qzInit(); asInit();
  var cs = calSlide(); calTicks(cs); calLabels(cs); calReset(cs);
  LANG_HOOKS.push(function () { var c = calSlide(); calLabels(c); calTherm(c, c._calT); calRead(c); dotsTitles(); });
  buildDots();
  bldUpdate();
  bindEvents();
  applyLang();
  fit(); bgResize();
  var start = parseInt((location.hash || '').slice(1), 10);
  S.i = 0;
  go(start >= 1 && start <= N ? start - 1 : 0, true);
  requestAnimationFrame(bgLoop);
}
init();
})();
