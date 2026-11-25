/* kuanysh.chemist · Атом құрылысы — core engine */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const INK = '#1E1A3D';

const store = {
  get(k, d) { try { const v = localStorage.getItem('kc-atom-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('kc-atom-' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};

/* ================= i18n ================= */
const LANGS = ['kk', 'ru', 'en'];
let lang = store.get('lang', 'kk');
if (!LANGS.includes(lang)) lang = 'kk';
const LI = () => LANGS.indexOf(lang);
const tr = (a) => Array.isArray(a) ? (a[LI()] ?? a[0]) : a;
const langListeners = [];
const onLang = (fn) => langListeners.push(fn);
const decimal = (s) => lang === 'en' ? String(s) : String(s).replace('.', ',');

function splitChars(el) {
  const txt = el.textContent;
  let i = 0;
  el.innerHTML = txt.split(' ').map(w => '<span class="w">' + Array.from(w).map(ch => '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>').join('') + '</span>').join(' ');
}
function parts(el, attr) {
  const key = '_p_' + attr;
  if (!el[key]) el[key] = el.getAttribute(attr).split('|');
  return el[key];
}
function applyLang(initial) {
  const root = document.documentElement;
  root.lang = lang; root.dataset.lang = lang;
  $$('[data-i]').forEach(el => {
    const p = parts(el, 'data-i');
    el.innerHTML = p[LI()] ?? p[0];
    if (el.hasAttribute('data-split')) splitChars(el);
    if (!initial && !el.closest('svg') && el.closest('.slide.active')) { el.classList.remove('lang-fade'); void el.offsetWidth; el.classList.add('lang-fade'); }
  });
  $$('[data-i-title]').forEach(el => { const p = parts(el, 'data-i-title'); el.title = p[LI()]; el.setAttribute('aria-label', p[LI()]); });
  $$('[data-i-aria]').forEach(el => { const p = parts(el, 'data-i-aria'); el.setAttribute('aria-label', p[LI()]); });
  $$('[data-setlang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.setlang === lang ? 'true' : 'false'));
  langListeners.forEach(f => f());
}
function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return;
  lang = l; store.set('lang', l); applyLang(false); sfx.click();
}

/* ================= sound (WebAudio, synthesized) ================= */
const sfx = (() => {
  let ctx = null, master = null, muted = store.get('muted', false);
  function ac() {
    if (muted) return null;
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function tone({ f = 440, f2 = null, t = 0.15, type = 'sine', g = 0.25, at = 0, attack = 0.006 }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at, o = c.createOscillator(), v = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + t);
    v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + attack); v.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
    o.connect(v); v.connect(master); o.start(t0); o.stop(t0 + t + 0.05);
  }
  function noise({ t = 0.3, f1 = 500, f2 = 2400, q = 1.4, g = 0.16, at = 0, type = 'bandpass' }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at, len = Math.ceil(c.sampleRate * t), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f1, t0); fl.frequency.exponentialRampToValueAtTime(f2, t0 + t * 0.8);
    const v = c.createGain(); v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + t * 0.35); v.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
    s.connect(fl); fl.connect(v); v.connect(master); s.start(t0); s.stop(t0 + t + 0.05);
  }
  let lastPop = 0;
  return {
    whoosh() { noise({ t: 0.38, f1: 380, f2: 2600, g: 0.12 }); },
    pop(k = 1) { const n = performance.now(); if (n - lastPop < 40) return; lastPop = n; tone({ f: 620 * k, f2: 260 * k, t: 0.13, g: 0.22 }); },
    click() { tone({ f: 1250, f2: 900, t: 0.05, type: 'triangle', g: 0.12 }); },
    flip() { noise({ t: 0.22, f1: 1800, f2: 600, g: 0.1, type: 'bandpass' }); tone({ f: 500, f2: 900, t: 0.12, type: 'triangle', g: 0.08 }); },
    success() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ f, t: 0.22, type: 'triangle', g: 0.18, at: i * 0.08 })); },
    error() { tone({ f: 240, f2: 170, t: 0.22, type: 'square', g: 0.06 }); tone({ f: 200, f2: 140, t: 0.26, type: 'square', g: 0.06, at: 0.12 }); },
    boing() { tone({ f: 180, f2: 520, t: 0.18, type: 'sine', g: 0.2 }); tone({ f: 520, f2: 300, t: 0.2, type: 'sine', g: 0.12, at: 0.16 }); },
    fanfare() { [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone({ f, t: 0.3, type: 'triangle', g: 0.17, at: i * 0.1 })); },
    zap() { tone({ f: 1500, f2: 300, t: 0.1, type: 'sawtooth', g: 0.05 }); },
    toggle() { muted = !muted; store.set('muted', muted); if (!muted) this.click(); return muted; },
    get muted() { return muted; }
  };
})();

/* ================= confetti ================= */
const confetti = (() => {
  const cv = $('#confetti'), c = cv.getContext('2d');
  const COLS = ['#FF4D5E', '#3DD68C', '#FFC21A', '#6A4BFF', '#2F8CFF', '#FF8A3D'];
  let parts = [], raf = 0, W = 0, H = 0, dpr = 1, last = 0;
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  function burst(o = {}) {
    if (reduceMotion) return;
    size();
    const x = (o.x ?? 0.5) * W, y = (o.y ?? 0.45) * H, n = o.count ?? 140, pw = o.power ?? 1;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), sp = rnd(3, 14) * pw;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rnd(3, 9) * pw, r: rnd(4, 9), rot: rnd(0, 6), vr: rnd(-0.25, 0.25), col: COLS[i % COLS.length], shape: i % 4, life: rnd(1.7, 2.8) });
    }
    if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
  }
  function loop(now) {
    const dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016; last = now; const f = dt * 60;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    parts = parts.filter(p => (p.life -= dt) > 0 && p.y < H + 60);
    for (const p of parts) {
      p.vx *= Math.pow(0.985, f); p.vy = p.vy * Math.pow(0.985, f) + 0.32 * f; p.x += p.vx * f; p.y += p.vy * f; p.rot += p.vr * f;
      c.save(); c.globalAlpha = Math.min(1, p.life * 1.4); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
      if (p.shape === 0) { c.fillRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1); }
      else if (p.shape === 1) { c.beginPath(); c.arc(0, 0, p.r * 0.7, 0, 7); c.fill(); }
      else if (p.shape === 2) { c.beginPath(); c.arc(0, 0, p.r * 0.85, 0, 7); c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); }
      else { c.beginPath(); c.moveTo(0, -p.r); c.lineTo(p.r * 0.9, p.r * 0.7); c.lineTo(-p.r * 0.9, p.r * 0.7); c.closePath(); c.fill(); }
      c.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop); else { raf = 0; c.clearRect(0, 0, W, H); }
  }
  return { burst };
})();

/* ================= cartoon characters ================= */
const PAL = { proton: ['#FF4D5E', '#C8283A'], neutron: ['#3DD68C', '#1D9A5C'], electron: ['#FFC21A', '#D69A00'] };
function chrInner(type) {
  const [c, d] = PAL[type];
  let s = '';
  if (type === 'electron') {
    const b = 'M-58 -6 L-92 -30 L-84 -4 L-122 -22 L-108 8 L-138 0';
    s += '<g class="bolt"><path d="' + b + '" fill="none" stroke="' + INK + '" stroke-width="19" stroke-linejoin="round" stroke-linecap="round"/><path d="' + b + '" fill="none" stroke="#FFE36E" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/></g>';
    s += '<path d="M-72 30 H-112 M-74 48 H-98" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" opacity=".45"/>';
  }
  if (type === 'proton') {
    const arm = (side) => {
      const k = side === 'l' ? 1 : -1, p = 'M' + (-50 * k) + ' 18 Q' + (-98 * k) + ' 28 ' + (-92 * k) + ' -26';
      return '<g class="arm-' + side + '"><path d="' + p + '" fill="none" stroke="' + INK + '" stroke-width="28" stroke-linecap="round"/><path d="' + p + '" fill="none" stroke="' + c + '" stroke-width="15" stroke-linecap="round"/><circle cx="' + (-92 * k) + '" cy="-32" r="16" fill="' + c + '" stroke="' + INK + '" stroke-width="6"/></g>';
    };
    s += arm('l') + arm('r');
  }
  s += '<g class="body' + (type === 'electron' ? ' jitter' : '') + '">';
  s += '<circle r="60" fill="' + d + '"/><circle cx="-6" cy="-6" r="54" fill="' + c + '"/><circle r="60" fill="none" stroke="' + INK + '" stroke-width="7"/>';
  s += '<ellipse cx="-27" cy="-33" rx="15" ry="9" fill="#fff" opacity=".75" transform="rotate(-35 -27 -33)"/>';
  if (type === 'proton') {
    s += '<path d="M-34 -32 Q-22 -42 -10 -34 M10 -34 Q22 -42 34 -32" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
    s += '<g class="blink"><ellipse cx="-20" cy="-13" rx="9" ry="11" fill="#fff" stroke="' + INK + '" stroke-width="4"/><ellipse cx="20" cy="-13" rx="9" ry="11" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="-18" cy="-11" r="5" fill="' + INK + '"/><circle cx="22" cy="-11" r="5" fill="' + INK + '"/></g>';
    s += '<path d="M-31 9 Q0 54 31 9 Z" fill="#fff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="M-26 16 H26" stroke="' + INK + '" stroke-width="3"/>';
  } else if (type === 'neutron') {
    s += '<path d="M-31 -10 Q-21 -1 -11 -10 M11 -10 Q21 -1 31 -10" fill="none" stroke="' + INK + '" stroke-width="5.5" stroke-linecap="round"/>';
    s += '<ellipse cx="-35" cy="9" rx="9" ry="5" fill="#FF9DB0" opacity=".9"/><ellipse cx="35" cy="9" rx="9" ry="5" fill="#FF9DB0" opacity=".9"/>';
    s += '<path d="M-12 21 Q0 29 12 21" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
  } else {
    s += '<path d="M-37 -33 L-11 -21 M37 -33 L11 -21" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<g class="blink"><ellipse cx="-20" cy="-6" rx="9" ry="10" fill="#fff" stroke="' + INK + '" stroke-width="4"/><ellipse cx="20" cy="-6" rx="9" ry="10" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="-17" cy="-4" r="5" fill="' + INK + '"/><circle cx="17" cy="-4" r="5" fill="' + INK + '"/></g>';
    s += '<path d="M-16 29 Q0 16 16 29" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
  }
  s += '</g>';
  const sign = type === 'proton' ? '+' : type === 'neutron' ? '0' : '−';
  s += '<g transform="translate(48 -50)"><circle r="18" fill="#fff" stroke="' + INK + '" stroke-width="5"/><text y="' + (type === 'neutron' ? 8.5 : 10) + '" text-anchor="middle" font-size="' + (type === 'neutron' ? 24 : 30) + '" fill="' + INK + '">' + sign + '</text></g>';
  return s;
}
const chrSVG = (type) => '<svg viewBox="-115 -115 230 230" aria-hidden="true">' + chrInner(type) + '</svg>';
function fillChars(root = document) {
  $$('[data-chr]', root).forEach(el => {
    const t = el.getAttribute('data-chr');
    if (el instanceof SVGElement) el.innerHTML = chrInner(t); else el.innerHTML = chrSVG(t);
    $$('.blink', el).forEach(b => { b.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's'; });
  });
}

/* ================= SVG orbiters (electrons on ellipses) ================= */
const orbiters = [];
function scanOrbiters() {
  $$('[data-orbit]').forEach(el => {
    const v = el.getAttribute('data-orbit').split(',').map(Number);
    orbiters.push({ el, a: v[0], b: v[1], tilt: v[2] * Math.PI / 180, period: v[3], phase: v[4] || 0, cx: v[5] || 0, cy: v[6] || 0, slide: el.closest('.slide') });
  });
}
function tickOrbiters(t) {
  for (const o of orbiters) {
    if (o.slide && !o.slide.classList.contains('active')) continue;
    const th = o.phase + (reduceMotion ? 0 : t * 2 * Math.PI / o.period);
    const x = o.a * Math.cos(th), y = o.b * Math.sin(th), ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
    o.el.setAttribute('transform', 'translate(' + (o.cx + x * ct - y * st).toFixed(2) + ' ' + (o.cy + x * st + y * ct).toFixed(2) + ')');
  }
}

/* ================= chemistry data ================= */
const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const ARS = '1.008 4.0026 6.94 9.0122 10.81 12.011 14.007 15.999 18.998 20.180 22.990 24.305 26.982 28.085 30.974 32.06 35.45 39.948 39.098 40.078 44.956 47.867 50.942 51.996 54.938 55.845 58.933 58.693 63.546 65.38 69.723 72.630 74.922 78.971 79.904 83.798 85.468 87.62 88.906 91.224 92.906 95.95 [98] 101.07 102.91 106.42 107.87 112.41 114.82 118.71 121.76 127.60 126.90 131.29 132.91 137.33 138.91 140.12 140.91 144.24 [145] 150.36 151.96 157.25 158.93 162.50 164.93 167.26 168.93 173.05 174.97 178.49 180.95 183.84 186.21 190.23 192.22 195.08 196.97 200.59 204.38 207.2 208.98 [209] [210] [222] [223] [226] [227] 232.04 231.04 238.03 [237] [244] [243] [247] [247] [251] [252] [257] [258] [259] [266] [267] [268] [269] [270] [269] [278] [281] [282] [285] [286] [289] [290] [293] [294] [294]'.split(' ');
const NAME_RU = 'Водород Гелий Литий Бериллий Бор Углерод Азот Кислород Фтор Неон Натрий Магний Алюминий Кремний Фосфор Сера Хлор Аргон Калий Кальций Скандий Титан Ванадий Хром Марганец Железо Кобальт Никель Медь Цинк Галлий Германий Мышьяк Селен Бром Криптон Рубидий Стронций Иттрий Цирконий Ниобий Молибден Технеций Рутений Родий Палладий Серебро Кадмий Индий Олово Сурьма Теллур Йод Ксенон Цезий Барий Лантан Церий Празеодим Неодим Прометий Самарий Европий Гадолиний Тербий Диспрозий Гольмий Эрбий Тулий Иттербий Лютеций Гафний Тантал Вольфрам Рений Осмий Иридий Платина Золото Ртуть Таллий Свинец Висмут Полоний Астат Радон Франций Радий Актиний Торий Протактиний Уран Нептуний Плутоний Америций Кюрий Берклий Калифорний Эйнштейний Фермий Менделевий Нобелий Лоуренсий Резерфордий Дубний Сиборгий Борий Хассий Мейтнерий Дармштадтий Рентгений Коперниций Нихоний Флеровий Московий Ливерморий Теннессин Оганесон'.split(' ');
const NAME_EN = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(' ');
const KK_OVR = { 1: 'Сутегі', 6: 'Көміртегі', 8: 'Оттегі', 16: 'Күкірт', 26: 'Темір', 29: 'Мыс', 30: 'Мырыш', 33: 'Күшән', 47: 'Күміс', 50: 'Қалайы', 79: 'Алтын', 80: 'Сынап', 82: 'Қорғасын' };
const elName = (z) => lang === 'en' ? NAME_EN[z - 1] : lang === 'ru' ? NAME_RU[z - 1] : (KK_OVR[z] || NAME_RU[z - 1]);
const arRaw = (z) => ARS[z - 1];
const arNum = (z) => parseFloat(arRaw(z).replace(/[\[\]]/g, ''));
const massNum = (z) => Math.round(arNum(z));
const arShow = (z) => decimal(arRaw(z));
function ptPos(z) {
  if (z === 1) return { r: 1, c: 1 };
  if (z === 2) return { r: 1, c: 18 };
  if (z <= 10) return { r: 2, c: z <= 4 ? z - 2 : z + 8 };
  if (z <= 18) return { r: 3, c: z <= 12 ? z - 10 : z };
  if (z <= 36) return { r: 4, c: z - 18 };
  if (z <= 54) return { r: 5, c: z - 36 };
  if (z <= 56) return { r: 6, c: z - 54 };
  if (z === 57) return { r: 6, c: 3 };
  if (z <= 71) return { r: 9, c: z - 54 };
  if (z <= 86) return { r: 6, c: z - 68 };
  if (z <= 88) return { r: 7, c: z - 86 };
  if (z === 89) return { r: 7, c: 3 };
  if (z <= 103) return { r: 10, c: z - 86 };
  return { r: 7, c: z - 100 };
}
function block(z) { const p = ptPos(z); if (p.r >= 9) return 'f'; if (z === 2 || p.c <= 2) return 's'; if (p.c >= 13) return 'p'; return 'd'; }
const ORDER = [[1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6], [5, 2], [4, 10], [5, 6], [6, 2], [4, 14], [5, 10], [6, 6], [7, 2], [5, 14], [6, 10], [7, 6]];
const SHELL_EXC = { 24: [2, 8, 13, 1], 29: [2, 8, 18, 1], 41: [2, 8, 18, 12, 1], 42: [2, 8, 18, 13, 1], 44: [2, 8, 18, 15, 1], 45: [2, 8, 18, 16, 1], 46: [2, 8, 18, 18], 47: [2, 8, 18, 18, 1], 57: [2, 8, 18, 18, 9, 2], 58: [2, 8, 18, 19, 9, 2], 64: [2, 8, 18, 25, 9, 2], 78: [2, 8, 18, 32, 17, 1], 79: [2, 8, 18, 32, 18, 1], 89: [2, 8, 18, 32, 18, 9, 2], 90: [2, 8, 18, 32, 18, 10, 2], 91: [2, 8, 18, 32, 20, 9, 2], 92: [2, 8, 18, 32, 21, 9, 2], 93: [2, 8, 18, 32, 22, 9, 2], 96: [2, 8, 18, 32, 25, 9, 2], 103: [2, 8, 18, 32, 32, 8, 3] };
function shellsFor(e, z) {
  if (e <= 0) return [];
  if (z && z === e && SHELL_EXC[z]) return SHELL_EXC[z].slice();
  const sh = []; let left = e;
  for (const [n, cap] of ORDER) { if (left <= 0) break; const k = Math.min(cap, left); sh[n - 1] = (sh[n - 1] || 0) + k; left -= k; }
  for (let i = 0; i < sh.length; i++) sh[i] = sh[i] || 0;
  return sh;
}
const nucHTML = (A, Z, sym) => '<span class="nuc"><span class="nn"><i>' + A + '</i><i>' + Z + '</i></span>' + sym + '</span>';
const H_ISO = { 1: ['Протий', 'Протий', 'Protium'], 2: ['Дейтерий', 'Дейтерий', 'Deuterium'], 3: ['Тритий', 'Тритий', 'Tritium'] };
const isoName = (z, A) => (z === 1 && H_ISO[A]) ? tr(H_ISO[A]) : elName(z) + '-' + A;

/* ================= particle sprites + AtomView renderer ================= */
const spriteCache = new Map();
function sprite(type, Rpx) {
  const R = Math.max(2, Math.round(Rpx / 2) * 2);
  const key = type + R;
  let s = spriteCache.get(key);
  if (s) return s;
  if (spriteCache.size > 260) spriteCache.clear();
  const lw = Math.max(1.6, R * 0.17), size = Math.ceil(2 * R + lw * 2 + 2), cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d'), m = size / 2;
  const [col, dark] = type === 'p' ? PAL.proton : type === 'n' ? PAL.neutron : PAL.electron;
  c.beginPath(); c.arc(m, m, R, 0, Math.PI * 2); c.fillStyle = dark; c.fill();
  c.beginPath(); c.arc(m - R * 0.1, m - R * 0.1, R * 0.88, 0, Math.PI * 2); c.fillStyle = col; c.fill();
  c.beginPath(); c.ellipse(m - R * 0.38, m - R * 0.42, R * 0.3, R * 0.18, -0.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.78)'; c.fill();
  c.beginPath(); c.arc(m, m, R, 0, Math.PI * 2); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
  s = { cv, size, R }; spriteCache.set(key, s);
  return s;
}

class AtomView {
  constructor(canvas, o = {}) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.o = Object.assign({ faces: false, faceMax: 14, signs: true, speed: 1, pad: 0.06, nucFrac: 0.34, halo: true, minE: 0.018, maxRn: 0.1 }, o);
    this.nuc = []; this.els = []; this.rn = 0; this.rnT = 0; this.er = 0; this.erT = 0;
    this.radii = []; this.radiiT = []; this.shells = []; this.phase = []; this.omega = [];
    this.t = Math.random() * 10; this.W = 0; this.H = 0; this.dpr = 1; this.zHint = 0;
    this.slide = canvas.closest('.slide');
    AtomView.all.push(this);
    if ('ResizeObserver' in window) new ResizeObserver(() => this.resize()).observe(canvas);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }
  get active() { return this.slide ? this.slide.classList.contains('active') : true; }
  get cx() { return this.W / 2; }
  get cy() { return this.H / 2; }
  resize() {
    const w = this.cv.clientWidth, h = this.cv.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w === this.W && h === this.H && dpr === this.dpr) return;
    const first = !this.W;
    this.W = w; this.H = h; this.dpr = dpr;
    this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    this.layout(first && this._instant);
    this.draw();
  }
  spawn(from) {
    if (from && typeof from === 'object') return { x: from.x, y: from.y };
    if (from === 'center') return { x: this.cx + rnd(-2, 2), y: this.cy + rnd(-2, 2) };
    const a = Math.random() * Math.PI * 2, R = Math.max(this.W, this.H) * 0.62;
    return { x: this.cx + Math.cos(a) * R, y: this.cy + Math.sin(a) * R };
  }
  counts() {
    let p = 0, n = 0; for (const q of this.nuc) if (!q.dying) { if (q.type === 'p') p++; else n++; }
    return { p, n, e: this.els.filter(x => !x.dying).length };
  }
  set(p, n, e, opt = {}) {
    const from = opt.from || 'edge', stagger = opt.stagger ?? 0, inst = !!opt.instant;
    let delay = opt.delay || 0;
    this.zHint = opt.z ?? p;
    this._instant = inst;
    const liveOf = (t) => this.nuc.filter(q => !q.dying && q.type === t);
    const addN = (type) => {
      const sp = this.spawn(from);
      const q = { type, x: sp.x, y: sp.y, vx: 0, vy: 0, s: inst ? 1 : 0, vs: 0, ts: 1, dying: false, seed: Math.random() * 100, delay: inst ? 0 : delay, blinkT: rnd(1, 5), slotR: 0, slotA: 0 };
      this.nuc.splice(Math.floor(Math.random() * (this.nuc.length + 1)), 0, q);
      delay += stagger;
    };
    let cp = liveOf('p').length, cn = liveOf('n').length;
    while (cp < p || cn < n) { if (cp < p) { addN('p'); cp++; } if (cn < n) { addN('n'); cn++; } }
    const kill = (type, k) => { const arr = liveOf(type); for (let i = 0; i < k && arr.length; i++) { const q = arr.splice(Math.floor(Math.random() * arr.length), 1)[0]; q.dying = true; q.ts = 0; q.delay = 0; } };
    if (cp > p) kill('p', cp - p);
    if (cn > n) kill('n', cn - n);
    const liveE = this.els.filter(x => !x.dying); let ce = liveE.length;
    while (ce < e) {
      const sp = this.spawn(from);
      this.els.push({ a: Math.atan2(sp.y - this.cy, sp.x - this.cx), r: Math.hypot(sp.x - this.cx, sp.y - this.cy), va: 0, vr: 0, s: inst ? 1 : 0, vs: 0, ts: 1, dying: false, delay: inst ? 0 : delay, shell: 0, slot: 0, count: 1 });
      delay += stagger; ce++;
    }
    for (let i = 0; i < ce - e; i++) { const x = liveE.pop(); if (!x) break; x.dying = true; x.ts = 0; x.delay = 0; }
    if (inst) { this.nuc = this.nuc.filter(q => !q.dying); this.els = this.els.filter(x => !x.dying); }
    this.layout(inst);
    if (inst) this.draw();
  }
  layout(instant) {
    if (!this.W) return;
    const liveN = this.nuc.filter(q => !q.dying), N = liveN.length;
    const liveE = this.els.filter(x => !x.dying), E = liveE.length;
    const shells = shellsFor(E, this.zHint), S = shells.length;
    const M = Math.min(this.W, this.H) / 2 * (1 - this.o.pad);
    const nucMax = S ? M * (S >= 5 ? this.o.nucFrac * 0.82 : this.o.nucFrac) : M * 0.6;
    const rn = Math.min(M * this.o.maxRn, nucMax / (Math.sqrt(Math.max(N, 1)) + 0.8));
    const Rn = N ? rn * (Math.sqrt(N) + 0.8) : 0;
    let er = Math.min(M * 0.065, Math.max(M * 0.05, rn * 0.72));
    let radii = [];
    if (S) {
      const rEnd = M - er * 1.1;
      let r1 = Math.max(Rn + Math.max(M * 0.13, er * 2.2), S === 1 ? M * 0.62 : M * 0.3);
      r1 = Math.min(r1, rEnd);
      const step = S > 1 ? Math.min((rEnd - r1) / (S - 1), M * 0.3) : 0;
      radii = shells.map((c, k) => r1 + k * step);
      shells.forEach((c, k) => { er = Math.min(er, (2 * Math.PI * radii[k] / c) * 0.36); });
      if (S > 1) er = Math.min(er, step * 0.42);
      er = Math.max(er, M * this.o.minE);
    }
    this.rnT = rn; this.erT = er; this.radiiT = radii; this.shells = shells;
    liveN.forEach((q, i) => { q.slotR = rn * Math.sqrt(i) * 1.02; q.slotA = i * 2.39996323; });
    let idx = 0;
    shells.forEach((c, k) => { for (let j = 0; j < c; j++) { const x = liveE[idx++]; x.shell = k; x.slot = j; x.count = c; } });
    for (let k = 0; k < S; k++) if (this.phase[k] == null) this.phase[k] = k * 0.9;
    if (instant || !this.rn) { this.rn = rn; this.er = er; this.radii = radii.slice(); }
    if (instant) {
      liveN.forEach(q => { q.x = this.cx + Math.cos(q.slotA) * q.slotR; q.y = this.cy + Math.sin(q.slotA) * q.slotR; q.s = 1; q.vx = q.vy = q.vs = 0; });
      liveE.forEach(x => { x.r = radii[x.shell]; x.a = this.phase[x.shell] + 2 * Math.PI * x.slot / x.count; x.s = 1; x.va = x.vr = x.vs = 0; });
    }
  }
  tick(dt) {
    if (!this.W) return;
    this.t += dt;
    const k = 1 - Math.exp(-dt * 5);
    this.rn += (this.rnT - this.rn) * k; this.er += (this.erT - this.er) * k;
    for (let i = 0; i < this.radiiT.length; i++) {
      if (this.radii[i] == null) this.radii[i] = i ? this.radii[i - 1] : this.radiiT[i] * 0.6;
      this.radii[i] += (this.radiiT[i] - this.radii[i]) * k;
    }
    this.radii.length = this.radiiT.length;
    const sp = reduceMotion ? 0 : this.o.speed;
    for (let i = 0; i < this.radiiT.length; i++) { this.omega[i] = sp * 1.15 / (1 + i * 0.45); this.phase[i] += dt * this.omega[i]; }
    const stiff = 120, damp = 12;
    for (const q of this.nuc) {
      if (q.delay > 0) { q.delay -= dt; continue; }
      if (!q.dying) {
        const w = this.rn * 0.07;
        const tx = this.cx + Math.cos(q.slotA) * q.slotR + (reduceMotion ? 0 : Math.sin(this.t * 2.1 + q.seed) * w);
        const ty = this.cy + Math.sin(q.slotA) * q.slotR + (reduceMotion ? 0 : Math.cos(this.t * 1.7 + q.seed) * w);
        q.vx += ((tx - q.x) * stiff - q.vx * damp) * dt; q.vy += ((ty - q.y) * stiff - q.vy * damp) * dt;
        q.x += q.vx * dt; q.y += q.vy * dt;
      }
      q.vs += ((q.ts - q.s) * 260 - q.vs * 14) * dt; q.s = Math.max(0, q.s + q.vs * dt);
      q.blinkT -= dt; if (q.blinkT < -0.14) q.blinkT = rnd(2, 6);
    }
    this.nuc = this.nuc.filter(q => !(q.dying && q.s < 0.04));
    for (const x of this.els) {
      if (x.delay > 0) { x.delay -= dt; continue; }
      if (!x.dying) {
        const R = this.radii[x.shell] ?? x.r;
        const ta = (this.phase[x.shell] || 0) + 2 * Math.PI * x.slot / x.count;
        const da = Math.atan2(Math.sin(ta - x.a), Math.cos(ta - x.a));
        x.va += (da * 70 - x.va * 12) * dt; x.a += (x.va + (this.omega[x.shell] || 0)) * dt;
        x.vr += ((R - x.r) * 90 - x.vr * 12) * dt; x.r += x.vr * dt;
      }
      x.vs += ((x.ts - x.s) * 260 - x.vs * 14) * dt; x.s = Math.max(0, x.s + x.vs * dt);
    }
    this.els = this.els.filter(x => !(x.dying && x.s < 0.04));
    this.draw();
  }
  draw() {
    if (!this.W) return;
    const c = this.ctx, cx = this.cx, cy = this.cy;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, this.W, this.H);
    if (this.radii.length) {
      c.save(); c.strokeStyle = 'rgba(30,26,61,.3)'; c.lineWidth = Math.max(1.5, Math.min(this.W, this.H) * 0.005);
      c.setLineDash([7, 9]); c.lineDashOffset = -this.t * 14;
      for (const R of this.radii) { c.beginPath(); c.arc(cx, cy, Math.max(1, R), 0, Math.PI * 2); c.stroke(); }
      c.restore();
    }
    const N = this.nuc.length;
    if (N && this.o.halo) {
      const Rn = this.rn * (Math.sqrt(N) + 0.8), g = c.createRadialGradient(cx, cy, Rn * 0.2, cx, cy, Rn * 2);
      g.addColorStop(0, 'rgba(255,210,63,.5)'); g.addColorStop(1, 'rgba(255,210,63,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, Rn * 2, 0, Math.PI * 2); c.fill();
    }
    const d2 = (q) => (q.x - cx) * (q.x - cx) + (q.y - cy) * (q.y - cy);
    const list = this.nuc.slice().sort((a, b) => d2(b) - d2(a));
    const faces = this.o.faces && N <= this.o.faceMax;
    for (const q of list) {
      if (q.delay > 0 || q.s <= 0.01) continue;
      const r = this.rn * q.s;
      this.ball(q.type, q.x, q.y, r);
      if (faces && r > 7) this.face(q.x, q.y, r, q.blinkT < 0);
      else if (this.o.signs && q.type === 'p' && r > 6) this.sign(q.x, q.y, r, '+', '#fff');
    }
    for (const x of this.els) {
      if (x.delay > 0 || x.s <= 0.01) continue;
      const ex = cx + Math.cos(x.a) * x.r, ey = cy + Math.sin(x.a) * x.r, er = this.er * x.s;
      if (!reduceMotion && x.r > 6 && !x.dying) {
        const span = Math.min(0.9, (er * 5) / x.r);
        c.save(); c.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
          c.strokeStyle = 'rgba(255,194,26,' + (0.5 * (1 - i / 5)).toFixed(3) + ')';
          c.lineWidth = er * 1.25 * (1 - i / 6);
          c.beginPath(); c.arc(cx, cy, x.r, x.a - span * (i + 1) / 5, x.a - span * i / 5); c.stroke();
        }
        c.restore();
      }
      this.ball('e', ex, ey, er);
      if (er > 7) this.sign(ex, ey, er, '−', INK);
    }
  }
  ball(type, x, y, r) {
    if (r < 0.6) return;
    const s = sprite(type, r * this.dpr), scale = (r * this.dpr) / s.R, size = s.size * scale / this.dpr;
    this.ctx.drawImage(s.cv, x - size / 2, y - size / 2, size, size);
  }
  face(x, y, r, blink) {
    const c = this.ctx; c.save(); c.fillStyle = INK; c.strokeStyle = INK; c.lineCap = 'round';
    const ex = r * 0.3, ey = -r * 0.1, er = r * 0.12;
    if (blink) { c.lineWidth = r * 0.08; c.beginPath(); c.moveTo(x - ex - er, y + ey); c.lineTo(x - ex + er, y + ey); c.moveTo(x + ex - er, y + ey); c.lineTo(x + ex + er, y + ey); c.stroke(); }
    else { c.beginPath(); c.ellipse(x - ex, y + ey, er * 0.8, er, 0, 0, Math.PI * 2); c.ellipse(x + ex, y + ey, er * 0.8, er, 0, 0, Math.PI * 2); c.fill(); }
    c.lineWidth = r * 0.085; c.beginPath(); c.arc(x, y + r * 0.08, r * 0.28, Math.PI * 0.2, Math.PI * 0.8); c.stroke();
    c.restore();
  }
  sign(x, y, r, ch, col) {
    const c = this.ctx, L = r * 0.42; c.save(); c.lineCap = 'round'; c.lineWidth = Math.max(1.5, r * 0.17); c.strokeStyle = col;
    c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y);
    if (ch === '+') { c.moveTo(x, y - L); c.lineTo(x, y + L); }
    c.stroke(); c.restore();
  }
}
AtomView.all = [];
