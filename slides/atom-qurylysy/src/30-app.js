/* kuanysh.chemist · Атом құрылысы — deck + slide modules */
const slides = $$('.slide');
const byId = {}; slides.forEach((s, i) => { byId[s.dataset.id] = i; });
const hooks = {};
const reg = (id, h) => { hooks[id] = h; };
const tickers = [];
let cur = -1, step = 0;
const stepsOf = (s) => +s.dataset.steps || 0;
const isActive = (id) => cur >= 0 && slides[cur].dataset.id === id;
const setI = (el, arr) => { el['_p_data-i'] = arr; el.innerHTML = tr(arr); };
const SECS = [
  ['Кіріспе', 'Введение', 'Intro'], ['Атом мен молекула', 'Атом и молекула', 'Atom & molecule'], ['Атом модельдері', 'Модели атома', 'Atomic models'],
  ['Атом құрылысы', 'Строение атома', 'Inside the atom'], ['Кесте мен формулалар', 'Таблица и формулы', 'Table & formulas'], ['Изотоптар', 'Изотопы', 'Isotopes'],
  ['Ойын мен тест', 'Игры и тест', 'Games & quiz'], ['Қорытынды', 'Итоги', 'Wrap-up']
];

/* ================= deck ================= */
function applySteps(s, k) { $$('[data-step]', s).forEach(el => el.classList.toggle('shown', +el.dataset.step <= k)); }
function comet(dir) {
  if (reduceMotion) return;
  const el = $('#comet'); el.classList.remove('go', 'rev'); void el.offsetWidth;
  if (dir < 0) el.classList.add('rev');
  el.style.top = rnd(7, 16).toFixed(1) + '%'; el.classList.add('go');
}
let lastSec = -1;
function updateChrome() {
  const s = slides[cur], n = slides.length;
  $('#curNum').textContent = cur + 1; $('#totNum').textContent = n;
  $('#progBar').style.width = ((cur + 1) / n * 100).toFixed(2) + '%';
  $('#btnPrev').disabled = cur === 0 && step === 0;
  $('#btnNext').disabled = cur === n - 1 && step >= stepsOf(s);
  const sec = +s.dataset.sec;
  $('#secNum').textContent = (sec >= 1 && sec <= 6) ? sec : (sec === 0 ? '★' : '✓');
  $('#secName').textContent = tr(SECS[sec]);
  if (sec !== lastSec) { const chip = $('#secChip'); chip.classList.remove('anim'); void chip.offsetWidth; chip.classList.add('anim'); lastSec = sec; }
  $('#app').style.setProperty('--cur', cur);
  $('.bg-floaters').style.setProperty('--cur', cur);
  const k = stepsOf(s), hint = $('#stepHint');
  if (k) {
    $('#stepDots').innerHTML = Array.from({ length: k + 1 }, (_, i) => '<i class="' + (i <= step ? 'on' : '') + '"></i>').join('');
    hint.classList.toggle('show', step < k);
  } else hint.classList.remove('show');
}
function go(n, o = {}) {
  n = clamp(n, 0, slides.length - 1);
  if (n === cur && !o.force) return;
  const dir = n >= cur ? 1 : -1;
  const prev = cur >= 0 ? slides[cur] : null, next = slides[n];
  if (prev && prev !== next) { prev.classList.remove('active', 'in'); hooks[prev.dataset.id]?.leave?.(prev); }
  cur = n;
  slides.forEach((s, i) => { if (i !== n) s.classList.toggle('past', i < n); });
  next.classList.remove('past', 'in'); next.classList.add('active'); void next.offsetWidth; next.classList.add('in');
  if (next.scrollTop) next.scrollTop = 0;
  step = o.atEnd ? stepsOf(next) : 0;
  applySteps(next, step);
  hooks[next.dataset.id]?.enter?.(next, { fromEnd: !!o.atEnd });
  if (step) hooks[next.dataset.id]?.step?.(next, step, { instant: true, dir: 1 });
  updateChrome();
  if (!o.silent) { sfx.whoosh(); comet(dir); }
  try { history.replaceState(null, '', '#slide-' + (n + 1)); } catch (e) { /* sandboxed history */ }
}
function setStep(k) {
  const s = slides[cur]; k = clamp(k, 0, stepsOf(s));
  if (k === step) return;
  const d = k > step ? 1 : -1; step = k;
  applySteps(s, step); hooks[s.dataset.id]?.step?.(s, step, { dir: d });
  sfx.pop(d > 0 ? 1.1 : 0.9); updateChrome();
}
function next() { const s = slides[cur]; if (step < stepsOf(s)) setStep(step + 1); else if (cur < slides.length - 1) go(cur + 1); }
function prev() { if (step > 0) setStep(step - 1); else if (cur > 0) go(cur - 1, { atEnd: true }); }

/* ================= chrome controls ================= */
$('#btnNext').addEventListener('click', next);
$('#btnPrev').addEventListener('click', prev);
$('#stepHint').addEventListener('click', next);
$$('[data-setlang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setlang)));
const btnSound = $('#btnSound');
const syncSound = () => btnSound.classList.toggle('is-off', sfx.muted);
btnSound.addEventListener('click', () => { sfx.toggle(); syncSound(); });
let toastT = 0;
function showToast(html, ms = 6000) {
  const t = $('#toast'); t.innerHTML = html; t.hidden = false;
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms);
}
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
function fsFail() {
  showToast(tr(['Бұл терезе толық экранға рұқсат бермеді. Пернетақтадағы <kbd>F11</kbd> пернесін басыңыз (Mac-та: <kbd>Ctrl</kbd> + <kbd>Cmd</kbd> + <kbd>F</kbd>).',
    'Это окно не разрешает полноэкранный режим. Нажмите <kbd>F11</kbd> (на Mac: <kbd>Ctrl</kbd> + <kbd>Cmd</kbd> + <kbd>F</kbd>).',
    'This window does not allow full screen. Press <kbd>F11</kbd> (on a Mac: <kbd>Ctrl</kbd> + <kbd>Cmd</kbd> + <kbd>F</kbd>).']));
}
function toggleFull() {
  const d = document, el = d.documentElement;
  sfx.click();
  try {
    if (!fsEl()) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req || (d.fullscreenEnabled === false && !d.webkitFullscreenEnabled)) { fsFail(); return; }
      const p = req.call(el, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(fsFail);
    } else {
      const ex = d.exitFullscreen || d.webkitExitFullscreen;
      const p = ex && ex.call(d); if (p && p.catch) p.catch(() => {});
    }
  } catch (e) { fsFail(); }
}
const syncFull = () => { document.documentElement.classList.toggle('is-full', !!fsEl()); if (fsEl()) $('#toast').hidden = true; };
document.addEventListener('fullscreenchange', syncFull);
document.addEventListener('webkitfullscreenchange', syncFull);
$('#btnFull').addEventListener('click', toggleFull);
$('#titleFull').addEventListener('click', toggleFull);
$('#brandBadge').addEventListener('click', (e) => { e.preventDefault(); go(0); });
const ov = $('#overview');
function buildOverview() {
  $('#ovGrid').innerHTML = slides.map((s, i) => '<button type="button" class="ov-item' + (i === cur ? ' cur' : '') + '" data-go="' + i + '" style="--i:' + i + '"><b>' + (i + 1) + '</b><span>' + s.getAttribute('data-title').split('|')[LI()] + '</span></button>').join('');
}
function openOverview() { buildOverview(); ov.hidden = false; sfx.click(); const c = $('.ov-item.cur', ov); if (c) c.focus(); }
function closeOverview() { ov.hidden = true; }
$('#btnMenu').addEventListener('click', openOverview);
$('#ovClose').addEventListener('click', closeOverview);
ov.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) { closeOverview(); go(+b.dataset.go); } else if (e.target === ov) closeOverview(); });
onLang(() => { if (cur >= 0) updateChrome(); if (!ov.hidden) buildOverview(); });

const isNarrow = () => window.innerWidth <= 820;
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target, tag = (t.tagName || '').toLowerCase();
  if (!ov.hidden) { if (e.key === 'Escape') { closeOverview(); e.preventDefault(); } return; }
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  if (typing && e.key !== 'PageDown' && e.key !== 'PageUp') return;
  const onBtn = tag === 'button' || (t.getAttribute && t.getAttribute('role') === 'button');
  switch (e.key) {
    case 'ArrowRight': case 'PageDown': next(); e.preventDefault(); break;
    case 'ArrowLeft': case 'PageUp': prev(); e.preventDefault(); break;
    case ' ': if (onBtn) return; next(); e.preventDefault(); break;
    case 'ArrowDown': if (isNarrow()) return; next(); e.preventDefault(); break;
    case 'ArrowUp': if (isNarrow()) return; prev(); e.preventDefault(); break;
    case 'Home': go(0); e.preventDefault(); break;
    case 'End': go(slides.length - 1); e.preventDefault(); break;
    case 'f': case 'F': case 'а': case 'А': toggleFull(); break;
    case 'm': case 'M': case 'ь': case 'Ь': openOverview(); break;
    default: hooks[slides[cur].dataset.id]?.key?.(e);
  }
});
(() => {
  let sx = 0, sy = 0, st = 0, on = false;
  const deck = $('#deck');
  deck.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || e.target.closest('canvas, input, .ptable, .pt-wrap, .bin, .b-stage, .q-opts')) { on = false; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = performance.now(); on = true;
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (!on) return; on = false;
    const tt = e.changedTouches[0], dx = tt.clientX - sx, dy = tt.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && performance.now() - st < 700) { if (dx < 0) next(); else prev(); }
  }, { passive: true });
})();
window.addEventListener('hashchange', () => { const m = /^#slide-(\d+)$/.exec(location.hash); if (m) go(+m[1] - 1); });

/* ================= 1 · title ================= */
const avTitle = new AtomView($('#cvTitle'), { faces: true, faceMax: 14, pad: 0.1, nucFrac: 0.3, speed: 0.8, maxRn: 0.12 });
reg('title', { enter() { avTitle.set(0, 0, 0, { instant: true }); avTitle.set(6, 6, 6, { stagger: 0.09, delay: 0.7, z: 6 }); } });

/* ================= 2 · map ================= */
(() => {
  const path = $('#mapPath'), trav = $('#mapTraveler'); let L = 0, t0 = 0;
  reg('map', { enter() { t0 = performance.now(); } });
  tickers.push(() => {
    if (!isActive('map')) return;
    if (!L) L = path.getTotalLength();
    const u = reduceMotion ? 0 : (((performance.now() - t0) / 1000 - 1.2) / 13);
    const p = path.getPointAtLength(clamp(u - Math.floor(Math.max(u, 0)), 0, 1) * L);
    trav.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + (p.y - 34).toFixed(1) + ')');
  });
  $$('[data-goto]').forEach(n => {
    const f = () => { const i = byId[n.dataset.goto]; if (i != null) go(i); };
    n.addEventListener('click', f);
    n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
  });
})();

/* ================= 3 · zoom ================= */
(() => {
  const zs = $$('#lens .zscene'), rungs = $$('#ladder .rung'), ring = $('#zoomRing');
  function zoomTo(k, o = {}) {
    zs.forEach((z, i) => { z.classList.toggle('on', i === k); z.classList.toggle('gone', i < k); });
    rungs.forEach((r, i) => { r.classList.toggle('on', i === k); r.classList.toggle('done', i < k); });
    if (!o.instant) { ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go'); }
  }
  reg('zoom', { enter(s, o) { zoomTo(o.fromEnd ? 3 : 0, { instant: true }); }, step(s, k, o) { zoomTo(k, o); } });
  rungs.forEach(r => r.addEventListener('click', () => { if (isActive('zoom')) setStep(+r.dataset.zstep); }));
})();

/* ================= 5 · thomson ================= */
(() => {
  const RZ = [[150, 150, 145, 125], [215, 112, 258, 112], [282, 150, 318, 200], [118, 205, 102, 218], [185, 190, 205, 200], [250, 196, 290, 290], [312, 212, 150, 298], [212, 232, 225, 330]];
  $('#thomRaisins').innerHTML = RZ.map(([cx, cy, ax, ay], i) =>
    '<g class="rz" style="--i:' + i + ';--cx:' + cx + 'px;--cy:' + cy + 'px;--ax:' + ax + 'px;--ay:' + ay + 'px">' +
    '<g class="raisin"><ellipse rx="14" ry="10" fill="#5B2A3C" stroke="' + INK + '" stroke-width="3" transform="rotate(' + ((i * 47) % 180) + ')"/><ellipse cx="-4" cy="-3" rx="4" ry="2.4" fill="#fff" opacity=".5"/></g>' +
    '<g class="elec"><g class="elec-in"><circle r="17" fill="#FFC21A" stroke="' + INK + '" stroke-width="5"/><path d="M-7 0 H7" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/></g></g></g>').join('');
  const svg = $('#thomSvg'); let tm = 0;
  const set = (on) => svg.classList.toggle('atom-mode', on);
  reg('thomson', { enter() { set(false); clearTimeout(tm); tm = setTimeout(() => { if (isActive('thomson')) { set(true); sfx.pop(1.3); } }, 1900); }, leave() { clearTimeout(tm); } });
  $('#thomToggle').addEventListener('click', () => { clearTimeout(tm); set(!svg.classList.contains('atom-mode')); sfx.pop(1.2); });
})();

/* ================= 6 · rutherford gold-foil simulation ================= */
(() => {
  const cv = $('#cvRuth'), c = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, g = null, parts = [], hits = [], nuclei = [], acc = 0, burst = 0, running = true, lastBoing = 0;
  const cnt = [0, 0, 0];
  const COL = ['#3DD68C', '#FFC21A', '#FF4D5E'];
  function size() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return false;
    const d = Math.min(2, window.devicePixelRatio || 1);
    if (w !== W || h !== H || d !== dpr) { W = w; H = h; dpr = d; cv.width = Math.round(w * d); cv.height = Math.round(h * d); build(); }
    return true;
  }
  function build() {
    const R = Math.min(W * 0.36, H * 0.42), cx = W * 0.62, cy = H * 0.45, s = R * 0.2, v = R * 0.85;
    g = { R, cx, cy, s, v, K: v * v * 0.005 * s };
    nuclei = [];
    for (let col = 0; col < 2; col++) { const x = cx + (col ? s * 0.5 : -s * 0.5); for (let y = cy - R * 0.52 + (col ? s / 2 : 0); y <= cy + R * 0.52; y += s) nuclei.push({ x, y }); }
    parts = []; hits = [];
  }
  function spawn() { if (!g) return; parts.push({ x: g.cx - g.R + 4, y: g.cy + rnd(-0.44, 0.44) * g.R, vx: g.v * rnd(0.97, 1.03), vy: 0, tr: [] }); }
  function counters() {
    cnt.forEach((n, i) => { $('#rxC' + (i + 1)).textContent = n; });
  }
  function bump(k) { const el = $('#rxR' + (k + 1)); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function reset() { cnt[0] = cnt[1] = cnt[2] = 0; parts = []; hits = []; counters(); }
  function update(dt) {
    if (running) acc += dt * 7;
    while (acc >= 1) { acc -= 1; spawn(); }
    if (burst > 0) { const k = Math.min(burst, 2); for (let i = 0; i < k; i++) spawn(); burst -= k; }
    for (const p of parts) {
      let near = Infinity;
      for (const n of nuclei) { const d = Math.abs(p.x - n.x) + Math.abs(p.y - n.y); if (d < near) near = d; }
      const sub = near < g.s * 0.35 ? 220 : 8, h = dt / sub;
      for (let i = 0; i < sub; i++) {
        let ax = 0, ay = 0;
        for (const n of nuclei) {
          const dx = p.x - n.x, dy = p.y - n.y, r2 = dx * dx + dy * dy + 0.04;
          if (r2 > g.s * g.s * 1.4) continue;
          const inv = g.K / (r2 * Math.sqrt(r2)); ax += dx * inv; ay += dy * inv;
        }
        p.vx += ax * h; p.vy += ay * h; p.x += p.vx * h; p.y += p.vy * h;
      }
      p.tr.push(p.x, p.y); if (p.tr.length > 28) p.tr.splice(0, 2);
      const dx = p.x - g.cx, dy = p.y - g.cy;
      if (dx * dx + dy * dy > g.R * g.R) {
        p.dead = true;
        const ang = Math.abs(Math.atan2(p.vy, p.vx)) * 180 / Math.PI, k = ang < 10 ? 0 : ang < 90 ? 1 : 2;
        cnt[k]++; hits.push({ x: p.x, y: p.y, k, t: 0 }); if (hits.length > 700) hits.shift();
        if (k) bump(k);
        if (k === 2 && performance.now() - lastBoing > 350) { sfx.boing(); lastBoing = performance.now(); }
        counters();
      }
    }
    parts = parts.filter(p => !p.dead);
    for (const hh of hits) hh.t += dt;
  }
  function draw() {
    const { R, cx, cy, s } = g;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const fs = Math.max(11, R * 0.07);
    // magnified gold atoms (mostly empty space)
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
    c.fillStyle = 'rgba(242,183,5,.10)'; c.fillRect(cx - s * 1.05, cy - R, s * 2.1, R * 2);
    for (const n of nuclei) {
      c.beginPath(); c.arc(n.x, n.y, s * 0.47, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.035)'; c.fill();
      c.setLineDash([3, 5]); c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1; c.stroke(); c.setLineDash([]);
    }
    c.restore();
    for (const n of nuclei) {
      c.beginPath(); c.arc(n.x, n.y, Math.max(3, s * 0.07), 0, Math.PI * 2); c.fillStyle = '#F2B705'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#fff'; c.stroke();
    }
    // screen ring with entry slit
    c.save(); c.lineWidth = Math.max(6, R * 0.05); c.strokeStyle = 'rgba(61,214,140,.18)';
    c.beginPath(); c.arc(cx, cy, R, Math.PI + 0.13, Math.PI * 3 - 0.13); c.stroke(); c.restore();
    for (const hh of hits) {
      const f = Math.exp(-hh.t * 2.4);
      c.beginPath(); c.arc(hh.x, hh.y, 2.6 + f * 9, 0, Math.PI * 2);
      c.fillStyle = COL[hh.k]; c.globalAlpha = 0.35 + f * 0.65; c.fill(); c.globalAlpha = 1;
    }
    // source box + beam
    const bw = R * 0.3, bh = R * 0.34, bx = Math.max(R * 0.08, cx - R - R * 0.5 - bw / 2);
    c.fillStyle = 'rgba(255,122,69,.10)'; c.fillRect(bx + bw, cy - R * 0.45, R * 0.4, R * 0.9);
    c.fillStyle = '#5A607A'; c.strokeStyle = '#fff'; c.lineWidth = 2;
    c.beginPath(); if (c.roundRect) c.roundRect(bx, cy - bh / 2, bw, bh, 8); else c.rect(bx, cy - bh / 2, bw, bh); c.fill(); c.stroke();
    c.fillStyle = '#FF7A45'; c.font = '800 ' + (fs * 1.5) + 'px Rubik, Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('α', bx + bw / 2, cy + 1);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '800 ' + fs + 'px Nunito, Segoe UI, sans-serif';
    c.textBaseline = 'alphabetic';
    wrapText(tr(['α-бөлшектер көзі', 'Источник α-частиц', 'α-particle source']), bx + bw / 2, cy - bh / 2 - fs * 0.8, Math.min(bw * 2.1, (cx - R) - 8), fs * 1.15);
    c.fillStyle = '#F2B705';
    c.fillText(tr(['Алтын фольга', 'Золотая фольга', 'Gold foil']), cx, cy + R * 0.66);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '700 ' + (fs * 0.85) + 'px Nunito, Segoe UI, sans-serif';
    c.fillText(tr(['(атомдар үлкейтілген)', '(атомы увеличены)', '(atoms magnified)']), cx, cy + R * 0.66 + fs * 1.15);
    c.fillStyle = 'rgba(61,214,140,.9)'; c.font = '800 ' + fs + 'px Nunito, Segoe UI, sans-serif'; c.textAlign = 'left';
    c.fillText(tr(['Экран', 'Экран', 'Screen']), cx + R * 0.74, cy - R * 0.8);
    // particles
    for (const p of parts) {
      const t = p.tr;
      for (let i = 2; i < t.length; i += 2) {
        c.strokeStyle = 'rgba(255,122,69,' + (i / t.length * 0.7).toFixed(3) + ')'; c.lineWidth = 2.6;
        c.beginPath(); c.moveTo(t[i - 2], t[i - 1]); c.lineTo(t[i], t[i + 1]); c.stroke();
      }
      c.beginPath(); c.arc(p.x, p.y, 4, 0, Math.PI * 2); c.fillStyle = '#FF7A45'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#FFE1D3'; c.stroke();
    }
  }
  function wrapText(txt, x, y, maxW, lh) {
    const words = txt.split(' '); let line = '', lines = [];
    for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    lines.push(line);
    lines.forEach((l, i) => c.fillText(l, x, y - (lines.length - 1 - i) * lh));
  }
  tickers.push((dt) => { if (!isActive('ruth-exp') || !size()) return; if (!reduceMotion) update(dt); draw(); });
  const playBtn = $('#rxPlay');
  function syncPlay() {
    setI($('span', playBtn), running ? ['Тоқтату', 'Пауза', 'Pause'] : ['Жалғастыру', 'Продолжить', 'Resume']);
    $('svg', playBtn).innerHTML = running ? '<path d="M8 5v14M16 5v14"/>' : '<path d="M7 5l12 7-12 7z"/>';
  }
  playBtn.addEventListener('click', () => { running = !running; syncPlay(); sfx.click(); });
  $('#rxBurst').addEventListener('click', () => { burst += 30; sfx.zap(); });
  $('#rxReset').addEventListener('click', () => { reset(); sfx.click(); });
  reg('ruth-exp', { enter() { running = true; syncPlay(); } });
})();

/* ================= 9 · particle cards ================= */
(() => {
  const cards = $$('.pcard');
  const flip = (cd, v) => { const on = v ?? !cd.classList.contains('flipped'); cd.classList.toggle('flipped', on); cd.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  cards.forEach(cd => {
    cd.addEventListener('click', () => { flip(cd); sfx.flip(); });
    cd.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(cd); sfx.flip(); } });
  });
  $('#flipAll').addEventListener('click', () => { const any = cards.some(c => !c.classList.contains('flipped')); cards.forEach((c, i) => setTimeout(() => { flip(c, any); sfx.flip(); }, i * 160)); });
  reg('cards', { enter() { cards.forEach(c => flip(c, false)); } });
})();

/* ================= 11 · passport ================= */
(() => {
  const hls = $$('#ppSvg .pp-hl'), cos = $$('#ppSvg .callout'); let timer = 0, idx = 0, token = 0;
  const show = (k) => { hls.forEach(h => h.classList.toggle('on', +h.dataset.hl === k)); cos.forEach(c => c.classList.toggle('on', +c.dataset.co === k)); };
  reg('passport', {
    enter() { const my = ++token; clearInterval(timer); show(-1); idx = 0; setTimeout(() => { if (my !== token) return; show(0); timer = setInterval(() => { idx = (idx + 1) % 4; show(idx); }, 2200); }, 2300); },
    leave() { token++; clearInterval(timer); }
  });
  cos.forEach(c => {
    const f = () => { token++; clearInterval(timer); show(+c.dataset.co); sfx.click(); };
    c.addEventListener('click', f); c.addEventListener('keydown', (e) => { if (e.key === 'Enter') f(); });
  });
})();

/* ================= 13 · carbon ================= */
(() => {
  const av = new AtomView($('#cvCarbon'), { pad: 0.1, maxRn: 0.11 });
  const ST = [[0, 0, 0], [6, 0, 0], [6, 0, 6], [6, 6, 6]];
  const chip = (sel, v) => { const el = $(sel), b = $('b', el); if (b.textContent !== String(v)) { b.textContent = v; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } };
  const set = (k, inst) => { const [p, n, e] = ST[k]; av.set(p, n, e, { stagger: inst ? 0 : 0.11, instant: inst, z: 6 }); chip('#ccP', p); chip('#ccN', n); chip('#ccE', e); };
  reg('carbon', { enter(s, o) { set(o.fromEnd ? 3 : 0, true); }, step(s, k, o) { set(k, !!o.instant); } });
})();

/* ================= 14 · periodic table ================= */
(() => {
  const pt = $('#ptable');
  let html = '';
  for (let z = 1; z <= 118; z++) { const p = ptPos(z); html += '<button type="button" class="el ' + block(z) + '" data-z="' + z + '" style="grid-row:' + p.r + ';grid-column:' + p.c + ';--k:' + z + '"><span class="z">' + z + '</span><span class="sy">' + SYM[z - 1] + '</span></button>'; }
  html += '<div class="pt-lab" style="grid-row:9;grid-column:1 / span 3">Ce – Lu</div><div class="pt-lab" style="grid-row:10;grid-column:1 / span 3">Th – Lr</div>';
  pt.innerHTML = html;
  const av = new AtomView($('#cvTable'), { pad: 0.05, nucFrac: 0.36 });
  let sel = 6, inited = false;
  function render() {
    const z = sel, A = massNum(z), n = A - z, sh = shellsFor(z, z), box = $('#ptSym');
    box.textContent = SYM[z - 1]; box.style.setProperty('--bg', 'var(--' + block(z) + '-block)');
    $('#ptName').textContent = elName(z);
    $('#ptMeta').textContent = '№ ' + z + ' · Ar = ' + arShow(z);
    $('#ptP').textContent = z; $('#ptN').textContent = n; $('#ptE').textContent = z;
    $('#ptCalc').innerHTML = '<b>n<sup>0</sup></b> = ' + A + ' − ' + z + ' = <b>' + n + '</b><br>' + tr(['Электрон қабаттары', 'Электронные слои', 'Electron shells']) + ': <b>' + sh.join(' · ') + '</b>';
    $$('.el.sel', pt).forEach(b => b.classList.remove('sel'));
    const b = $('.el[data-z="' + z + '"]', pt); if (b) { b.classList.add('sel'); b.setAttribute('aria-label', elName(z)); }
  }
  function select(z, o = {}) {
    sel = z; const A = massNum(z), n = A - z, total = z + n + z;
    av.set(z, n, z, { stagger: o.instant ? 0 : Math.min(0.035, 1.3 / total), instant: !!o.instant, z });
    render(); if (!o.silent) sfx.pop(1.25 - Math.min(z, 100) / 200);
  }
  pt.addEventListener('click', (e) => { const b = e.target.closest('.el'); if (b) select(+b.dataset.z); });
  onLang(render);
  reg('table', { enter() { if (!inited) { inited = true; select(sel, { silent: true }); } } });
})();

/* ================= 15 · build an atom ================= */
(() => {
  const S = { p: 0, n: 0, e: 0 }, LIM = { p: 36, n: 50, e: 40 };
  const stage = $('#bStage'), av = new AtomView($('#cvBuild'), { pad: 0.07, nucFrac: 0.36 });
  const MISSIONS = [{ p: 1, n: 0, e: 1 }, { p: 2, n: 2, e: 2 }, { p: 6, n: 6, e: 6 }, { p: 1, n: 1, e: 1 }, { p: 3, n: 4, e: 3 }, { p: 8, n: 8, e: 8 }, { p: 11, n: 12, e: 11 }];
  let mi = 0, free = false, winT = 0; const done = new Set();
  const local = (x, y) => { const r = av.cv.getBoundingClientRect(); return { x: (x - r.left) * (av.W / r.width), y: (y - r.top) * (av.H / r.height) }; };
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return local(r.left + r.width / 2, r.top + r.height / 2); };
  function apply(from) { av.set(S.p, S.n, S.e, { from: from || 'edge', z: S.p }); render(); check(); }
  function add(t, d, from) {
    const v = clamp(S[t] + d, 0, LIM[t]);
    if (v === S[t]) { sfx.error(); return; }
    S[t] = v; apply(from);
    if (d > 0) sfx.pop(t === 'e' ? 1.45 : t === 'p' ? 1 : 0.78); else sfx.click();
  }
  function render() {
    const { p, n, e } = S;
    $('#bP').textContent = p; $('#bN').textContent = n; $('#bE').textContent = e;
    $('#bEmpty').hidden = p + n + e > 0;
    const st = [];
    if (!p) {
      $('#bNuc').textContent = '?';
      $('#bName').textContent = tr(['Әзірге элемент жоқ', 'Пока нет элемента', 'No element yet']);
      $('#bSub').textContent = tr(['Элементті протон саны анықтайды. Протон қос!', 'Элемент определяется числом протонов. Добавь протон!', 'The number of protons decides the element. Add a proton!']);
    } else {
      const A = p + n;
      $('#bNuc').innerHTML = nucHTML(A, p, SYM[p - 1]);
      $('#bName').textContent = isoName(p, A);
      $('#bSub').innerHTML = tr(['Массалық сан', 'Массовое число', 'Mass number']) + ': A = ' + p + ' + ' + n + ' = <b>' + A + '</b>';
      const q = p - e;
      if (q === 0) st.push('<span class="status ok">✓ ' + tr(['Бейтарап атом', 'Нейтральный атом', 'Neutral atom']) + '</span>');
      else st.push('<span class="status ion">' + tr(['Ион, заряды', 'Ион, заряд', 'Ion, charge']) + ' ' + (q > 0 ? '+' : '−') + Math.abs(q) + '</span>', '<span class="status warn">' + (q > 0 ? tr(['электрон жетпейді', 'не хватает электронов', 'missing electrons']) : tr(['электрон артық', 'лишние электроны', 'extra electrons'])) + '</span>');
    }
    if (e && !p) st.push('<span class="status warn">' + tr(['Ядро жоқ — электрондар ұшып кетеді!', 'Нет ядра — электроны разлетятся!', 'No nucleus, the electrons fly away!']) + '</span>');
    $('#bStatus').innerHTML = st.join('');
  }
  const star = (on) => '<svg viewBox="0 0 24 24" class="' + (on ? 'on' : '') + '"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>';
  function mRender() {
    if (free) {
      $('#mTitle').textContent = tr(['Еркін режим', 'Свободный режим', 'Free play']);
      $('#mTarget').textContent = tr(['Кез келген атомды құрастыр!', 'Собери любой атом!', 'Build any atom you like!']);
    } else {
      const m = MISSIONS[mi];
      $('#mTitle').textContent = tr(['Тапсырма', 'Задание', 'Mission']) + ' ' + (mi + 1) + '/' + MISSIONS.length;
      $('#mTarget').innerHTML = tr(['Құрастыр:', 'Собери:', 'Build:']) + ' ' + nucHTML(m.p + m.n, m.p, SYM[m.p - 1]) + ' <b>' + isoName(m.p, m.p + m.n) + '</b> (' + tr(['бейтарап атом', 'нейтральный атом', 'neutral atom']) + ')';
    }
    $('#mStars').innerHTML = MISSIONS.map((m, i) => star(done.has(i))).join('');
  }
  function check() {
    if (free) return;
    const m = MISSIONS[mi];
    if (S.p === m.p && S.n === m.n && S.e === m.e) {
      done.add(mi); mRender();
      const box = $('#mission'); box.classList.remove('win'); void box.offsetWidth; box.classList.add('win');
      $('#mTarget').innerHTML = '<b>' + tr(['Керемет! Тапсырма орындалды!', 'Отлично! Задание выполнено!', 'Great! Mission complete!']) + '</b>';
      sfx.success();
      const r = stage.getBoundingClientRect(); confetti.burst({ x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight, count: 110 });
      clearTimeout(winT); winT = setTimeout(() => { mi = (mi + 1) % MISSIONS.length; box.classList.remove('win'); mRender(); }, 2600);
    }
  }
  $$('[data-inc]', $('.b-grid')).forEach(b => b.addEventListener('click', () => add(b.dataset.inc, 1, centerOf($('.bin-ball[data-src="' + b.dataset.inc + '"]')))));
  $$('[data-dec]', $('.b-grid')).forEach(b => b.addEventListener('click', () => add(b.dataset.dec, -1)));
  $('#bClear').addEventListener('click', () => { S.p = S.n = S.e = 0; apply(); sfx.click(); });
  $('#mSkip').addEventListener('click', () => { clearTimeout(winT); $('#mission').classList.remove('win'); if (free) free = false; else mi = (mi + 1) % MISSIONS.length; mRender(); sfx.click(); });
  $('#mFree').addEventListener('click', () => { clearTimeout(winT); free = true; mRender(); sfx.click(); });
  // drag & tap from the particle balls
  $$('.bin-ball').forEach(ball => {
    const t = ball.dataset.src;
    ball.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(t, 1, centerOf(ball)); } });
    ball.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { ball.setPointerCapture(e.pointerId); } catch (err) { /* capture unsupported */ }
      const sx = e.clientX, sy = e.clientY; let fly = null, moved = false;
      const inside = (x, y) => { const r = stage.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < r.width / 2; };
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
          moved = true; fly = document.createElement('div'); fly.className = 'fly-ball';
          fly.style.background = t === 'p' ? 'var(--proton)' : t === 'n' ? 'var(--neutron)' : 'var(--electron)';
          fly.style.color = t === 'p' ? '#fff' : INK; fly.innerHTML = ball.innerHTML; document.body.appendChild(fly);
        }
        if (fly) { fly.style.left = ev.clientX + 'px'; fly.style.top = ev.clientY + 'px'; stage.classList.toggle('over', inside(ev.clientX, ev.clientY)); }
      };
      const up = (ev) => {
        ball.removeEventListener('pointermove', move); ball.removeEventListener('pointerup', up); ball.removeEventListener('pointercancel', up);
        stage.classList.remove('over');
        if (!moved) { add(t, 1, centerOf(ball)); return; }
        if (fly) fly.remove();
        if (ev.type === 'pointerup' && inside(ev.clientX, ev.clientY)) add(t, 1, local(ev.clientX, ev.clientY));
      };
      ball.addEventListener('pointermove', move); ball.addEventListener('pointerup', up); ball.addEventListener('pointercancel', up);
    });
  });
  onLang(() => { render(); mRender(); });
  render(); mRender();
})();

/* ================= 16 · isotopes ================= */
(() => {
  const views = [1, 2, 3].map(i => new AtomView($('#cvIso' + i), { faces: true, faceMax: 6, pad: 0.04, nucFrac: 0.34, maxRn: 0.2 }));
  reg('isotopes', { enter() { views.forEach((v, i) => { v.set(0, 0, 0, { instant: true }); v.set(1, i, 1, { stagger: 0.28, delay: 0.7 + i * 0.35, z: 1 }); }); } });
})();

/* ================= 18 · trainer ================= */
(() => {
  const EL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 35, 47, 53, 79, 82];
  const ISO = [[1, 1], [1, 2], [1, 3], [6, 12], [6, 13], [6, 14], [8, 16], [8, 18], [11, 23], [12, 24], [12, 26], [13, 27], [17, 35], [17, 37], [19, 40], [20, 40], [26, 56], [27, 60], [38, 90], [53, 127], [53, 131], [92, 235], [92, 238]];
  const slide = slides[byId.trainer];
  let mode = 'el', q = null, score = 0, streak = 0, solved = false, usedSol = false, fb = null;
  const ids = ['inP', 'inN', 'inE'];
  const ans = () => ({ p: q.z, n: q.A - q.z, e: q.z });
  const record = () => { const a = ans(); return nucHTML(q.A, q.z, SYM[q.z - 1]) + ' (' + a.p + '<span class="tp">p<sup>+</sup></span>, ' + a.n + '<span class="tn">n<sup>0</sup></span>) ' + a.e + '<span class="te">e<sup>−</sup></span>'; };
  function setFb(kind, fn) { fb = fn ? { kind, fn } : null; const el = $('#trFb'); el.className = 'tr-fb' + (kind ? ' ' + kind : ''); el.innerHTML = fn ? fn() : ''; }
  function card(anim) {
    const el = $('#trCard');
    if (q.iso) el.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center">' + nucHTML(q.A, q.z, SYM[q.z - 1]) + '<div class="iso-name">' + isoName(q.z, q.A) + '</div></div>';
    else el.innerHTML = '<div class="pcell" style="--bg:var(--' + block(q.z) + '-block)"><span class="c-sym">' + SYM[q.z - 1] + '</span><span class="c-z">' + q.z + '</span><span class="c-ar">' + arShow(q.z) + '</span><span class="c-name">' + elName(q.z) + '</span></div>';
    if (anim) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }
  }
  function fresh() {
    let n;
    do {
      if (mode === 'el') { const z = EL[Math.floor(Math.random() * EL.length)]; n = { z, A: massNum(z) }; }
      else { const [z, A] = ISO[Math.floor(Math.random() * ISO.length)]; n = { z, A, iso: true }; }
    } while (q && n.z === q.z && n.A === q.A);
    q = n; solved = false; usedSol = false;
    ids.forEach(id => { $('#' + id).value = ''; });
    $$('.tr-row', slide).forEach(r => r.classList.remove('ok', 'no'));
    setFb('', null); card(true);
  }
  function scoreUI() { $('#trScore').textContent = score; $('#trStreak').textContent = streak; }
  const hintText = () => mode === 'el'
    ? tr(['Кеңес: <b>p⁺ = №</b>, <b>e⁻ = p⁺</b>, <b>n⁰ = Ar − №</b> (Ar-ды дөңгелекте).', 'Подсказка: <b>p⁺ = №</b>, <b>e⁻ = p⁺</b>, <b>n⁰ = Ar − №</b> (округли Ar).', 'Hint: <b>p⁺ = №</b>, <b>e⁻ = p⁺</b>, <b>n⁰ = Ar − №</b> (round Ar).'])
    : tr(['Кеңес: төменгі сан — №, жоғарғы — A. <b>n⁰ = A − №</b>.', 'Подсказка: нижнее число — №, верхнее — A. <b>n⁰ = A − №</b>.', 'Hint: the bottom number is №, the top is A. <b>n⁰ = A − №</b>.']);
  function solution() {
    const a = ans(), top = q.iso ? 'A' : 'Ar';
    const note = q.iso ? '' : ' <small>(Ar = ' + arShow(q.z) + ' ≈ ' + q.A + ')</small>';
    return '<div class="sol"><span><span class="tp">p<sup>+</sup></span> = № = ' + a.p + '</span><span><span class="te">e<sup>−</sup></span> = <span class="tp">p<sup>+</sup></span> = ' + a.e + '</span><span><span class="tn">n<sup>0</sup></span> = ' + top + ' − № = ' + q.A + ' − ' + q.z + ' = ' + a.n + note + '</span></div>';
  }
  function checkIt() {
    const a = ans(); let ok = true;
    [['p', '.rp', 'inP'], ['n', '.rn', 'inN'], ['e', '.re', 'inE']].forEach(([k, sel, id]) => {
      const row = $(sel, slide), v = $('#' + id).value, good = v !== '' && +v === a[k];
      row.classList.remove('ok', 'no'); void row.offsetWidth; row.classList.add(good ? 'ok' : 'no');
      $('.m-ok', row).style.display = good ? '' : 'none'; $('.m-no', row).style.display = good ? 'none' : '';
      if (!good) ok = false;
    });
    if (ok) {
      if (!solved) { solved = true; if (!usedSol) { score++; streak++; } }
      sfx.success();
      const r = $('#trCard').getBoundingClientRect(); confetti.burst({ x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight, count: streak >= 3 ? 160 : 90 });
      setFb('good', () => '<b>' + tr(['Дұрыс! Жарайсың!', 'Верно! Молодец!', 'Correct! Well done!']) + '</b> ' + record() + (streak >= 3 ? ' · ' + tr(['Қатарынан ', 'Подряд ', 'Streak: ']) + streak + '!' : ''));
    } else {
      streak = 0; sfx.error();
      setFb('bad', () => '<b>' + tr(['Қате бар — қызыл өрістерді тексер.', 'Есть ошибка — проверь красные поля.', 'Not quite. Check the red boxes.']) + '</b><br>' + hintText());
    }
    scoreUI();
  }
  $$('[data-tstep]', slide).forEach(b => b.addEventListener('click', () => {
    const [id, d] = b.dataset.tstep.split(':'), inp = $('#' + id);
    inp.value = clamp((+inp.value || 0) + (+d), 0, 300); sfx.click();
    inp.closest('.tr-row').classList.remove('ok', 'no');
  }));
  ids.forEach(id => $('#' + id).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkIt(); } }));
  $('#trCheck').addEventListener('click', checkIt);
  $('#trHint').addEventListener('click', () => { setFb('', hintText); sfx.click(); });
  $('#trSol').addEventListener('click', () => { usedSol = true; setFb('', solution); sfx.flip(); });
  $('#trNext').addEventListener('click', () => { fresh(); sfx.whoosh(); });
  $$('.tabs [data-mode]', slide).forEach(b => b.addEventListener('click', () => {
    if (mode === b.dataset.mode) return;
    mode = b.dataset.mode; $$('.tabs [data-mode]', slide).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    q = null; fresh(); sfx.click();
  }));
  onLang(() => { if (q) card(false); if (fb) setFb(fb.kind, fb.fn); });
  fresh(); scoreUI();
})();

/* ================= 19 · quiz ================= */
(() => {
  const Q = [
    { q: ['Атомның ортасында не орналасқан?', 'Что находится в центре атома?', 'What is at the centre of an atom?'],
      o: [['Ядро', 'Ядро', 'The nucleus'], ['Электрон', 'Электрон', 'An electron'], ['Молекула', 'Молекула', 'A molecule'], ['Бос кеңістік', 'Пустота', 'Empty space']],
      x: ['Атомның ортасында — ядро.', 'В центре атома — ядро.', 'The nucleus is at the centre.'] },
    { q: ['Протонның заряды қандай?', 'Какой заряд у протона?', 'What is the charge of a proton?'],
      o: [['+1', '+1', '+1'], ['−1', '−1', '−1'], ['0', '0', '0'], ['+2', '+2', '+2']],
      x: ['Протон: p⁺, заряды +1.', 'Протон: p⁺, заряд +1.', 'Proton: p⁺, charge +1.'] },
    { q: ['Қай бөлшектің заряды жоқ?', 'У какой частицы нет заряда?', 'Which particle has no charge?'],
      o: [['Нейтрон', 'Нейтрон', 'Neutron'], ['Протон', 'Протон', 'Proton'], ['Электрон', 'Электрон', 'Electron'], ['Ядро', 'Ядро', 'Nucleus']],
      x: ['Нейтрон бейтарап: n⁰, заряды 0.', 'Нейтрон нейтрален: n⁰, заряд 0.', 'The neutron is neutral: n⁰, charge 0.'] },
    { q: ['Атом ядросы неден тұрады?', 'Из чего состоит ядро атома?', 'What is the nucleus made of?'],
      o: [['Протондар мен нейтрондардан', 'Из протонов и нейтронов', 'Protons and neutrons'], ['Протондар мен электрондардан', 'Из протонов и электронов', 'Protons and electrons'], ['Тек электрондардан', 'Только из электронов', 'Only electrons'], ['Молекулалардан', 'Из молекул', 'Molecules']],
      x: ['Ядро = p⁺ + n⁰.', 'Ядро = p⁺ + n⁰.', 'Nucleus = p⁺ + n⁰.'] },
    { q: ['«Мейізді кекс» моделін кім ұсынды?', 'Кто предложил модель «пудинг с изюмом»?', 'Who proposed the “plum pudding” model?'],
      o: [['Дж. Томсон', 'Дж. Томсон', 'J. J. Thomson'], ['Э. Резерфорд', 'Э. Резерфорд', 'E. Rutherford'], ['Д. Менделеев', 'Д. Менделеев', 'D. Mendeleev'], ['Демокрит', 'Демокрит', 'Democritus']],
      x: ['Томсон атомды мейізді кекске ұқсатты.', 'Томсон сравнил атом с кексом с изюмом.', 'Thomson compared the atom to a plum pudding.'] },
    { q: ['α-бөлшектердің көбі фольгадан тура өтті. Бұл нені білдіреді?', 'Большинство α-частиц прошли сквозь фольгу. Что это значит?', 'Most α-particles went straight through the foil. What does it mean?'],
      o: [['Атомның көп бөлігі бос', 'Атом в основном пустой', 'The atom is mostly empty'], ['Атом өте қатты', 'Атом очень твёрдый', 'The atom is very hard'], ['Алтын — металл', 'Золото — металл', 'Gold is a metal'], ['Электрондар ауыр', 'Электроны тяжёлые', 'Electrons are heavy']],
      x: ['Соқпай өтті → атомның іші бос.', 'Ни во что не врезались → атом почти пустой.', 'They hit nothing → the atom is mostly empty.'] },
    { q: ['Натрий: № 11. Атомында неше электрон бар?', 'Натрий: № 11. Сколько в атоме электронов?', 'Sodium: № 11. How many electrons?'],
      o: [['11', '11', '11'], ['12', '12', '12'], ['23', '23', '23'], ['22', '22', '22']],
      x: ['№ = p⁺ = e⁻ = 11.', '№ = p⁺ = e⁻ = 11.', '№ = p⁺ = e⁻ = 11.'] },
    { q: ['Алюминий: № 13, Ar = 27. Нейтрон саны қанша?', 'Алюминий: № 13, Ar = 27. Сколько нейтронов?', 'Aluminium: № 13, Ar = 27. How many neutrons?'],
      o: [['14', '14', '14'], ['13', '13', '13'], ['27', '27', '27'], ['40', '40', '40']],
      x: ['n⁰ = Ar − № = 27 − 13 = 14.', 'n⁰ = Ar − № = 27 − 13 = 14.', 'n⁰ = Ar − № = 27 − 13 = 14.'] },
    { q: ['Бір элементтің изотоптары немен ерекшеленеді?', 'Чем отличаются изотопы одного элемента?', 'How do isotopes of one element differ?'],
      o: [['Нейтрон санымен', 'Числом нейтронов', 'Number of neutrons'], ['Протон санымен', 'Числом протонов', 'Number of protons'], ['Электрон санымен', 'Числом электронов', 'Number of electrons'], ['Реттік нөмірімен', 'Порядковым номером', 'Atomic number']],
      x: ['Изотоптарда протон саны бірдей, нейтрон саны әртүрлі.', 'У изотопов число протонов одинаковое, а нейтронов — разное.', 'Isotopes have the same number of protons but different numbers of neutrons.'] },
    { q: ['Тритий ³₁H ядросында неше нейтрон бар?', 'Сколько нейтронов в ядре трития ³₁H?', 'How many neutrons are in a tritium ³₁H nucleus?'],
      o: [['2', '2', '2'], ['1', '1', '1'], ['3', '3', '3'], ['0', '0', '0']],
      x: ['n⁰ = 3 − 1 = 2.', 'n⁰ = 3 − 1 = 2.', 'n⁰ = 3 − 1 = 2.'] }
  ];
  const box = $('#quizBox');
  const S = { phase: 'start', i: 0, perms: [], picked: [], score: 0 };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const starSVG = (on, i) => '<svg viewBox="0 0 24 24" class="' + (on ? 'on' : '') + '" style="--i:' + i + '"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>';
  const chars = '<div class="chr-row">' + ['proton', 'neutron', 'electron'].map((t, i) => '<span class="chr bob" style="animation-delay:-' + (i * 0.7) + 's">' + chrSVG(t) + '</span>').join('') + '</div>';
  function start() { S.phase = 'q'; S.i = 0; S.score = 0; S.picked = []; S.perms = Q.map(() => shuffle([0, 1, 2, 3])); render(true); sfx.whoosh(); }
  function render(anim) {
    if (S.phase === 'start') {
      box.innerHTML = '<div class="q-start">' + chars + '<h3>' + tr(['10 сұрақ — 10 ұпай!', '10 вопросов — 10 баллов!', '10 questions, 10 points!']) + '</h3><p>' + tr(['Бір жауапты таңда. 1–4 пернелері де жұмыс істейді.', 'Выбери один ответ. Работают и клавиши 1–4.', 'Pick one answer. Keys 1–4 work too.']) + '</p><button class="btn" type="button" id="qStart">' + tr(['Бастау', 'Начать', 'Start']) + ' →</button></div>';
      $('#qStart').addEventListener('click', start);
    } else if (S.phase === 'q') {
      const q = Q[S.i], perm = S.perms[S.i], picked = S.picked[S.i];
      const answered = picked != null;
      const dots = Q.map((_, i) => '<i class="' + (i === S.i ? 'cur' : S.picked[i] == null ? '' : S.picked[i] === 0 ? 'ok' : 'no') + '"></i>').join('');
      box.innerHTML = '<div class="q-top"><div class="q-dots">' + dots + '</div><div class="q-score">' + tr(['Ұпай', 'Очки', 'Score']) + ': ' + S.score + ' / ' + Q.length + '</div></div>' +
        '<p class="q-text">' + (S.i + 1) + '. ' + tr(q.q) + '</p>' +
        '<div class="q-opts">' + perm.map((oi, k) => {
          let cls = 'q-opt'; if (answered) { if (oi === 0) cls += ' ok'; else if (oi === picked) cls += ' no'; else cls += ' dim'; }
          return '<button type="button" class="' + cls + '" data-oi="' + oi + '" style="--i:' + k + '"' + (answered ? ' disabled' : '') + '><span class="ltr">' + 'ABCD'[k] + '</span><span>' + tr(q.o[oi]) + '</span></button>';
        }).join('') + '</div>' +
        (answered ? '<div class="q-exp"><span class="chr">' + chrSVG(picked === 0 ? 'proton' : 'electron') + '</span><span><b>' + (picked === 0 ? tr(['Дұрыс!', 'Верно!', 'Correct!']) : tr(['Қате.', 'Неверно.', 'Not quite.'])) + '</b> ' + tr(q.x) + '</span></div>' +
          '<div class="q-foot"><button class="btn" type="button" id="qNext">' + (S.i < Q.length - 1 ? tr(['Келесі сұрақ', 'Следующий вопрос', 'Next question']) : tr(['Нәтижені көру', 'Посмотреть результат', 'See my result'])) + ' →</button></div>' : '');
      $$('.q-opt', box).forEach(b => b.addEventListener('click', () => pick(+b.dataset.oi)));
      const nb = $('#qNext'); if (nb) nb.addEventListener('click', advance);
    } else {
      const s = S.score, stars = s >= 9 ? 3 : s >= 6 ? 2 : 1;
      const msg = s >= 9 ? ['Керемет! Сен — нағыз химиксің!', 'Великолепно! Ты настоящий химик!', 'Amazing! You are a real chemist!'] : s >= 6 ? ['Жақсы! Аздап қайталасаң — мінсіз.', 'Хорошо! Чуть повтори — и будет идеально.', 'Good! A bit more practice and it\'s perfect.'] : ['Тақырыпты қайтала — сен үлгересің!', 'Повтори тему — у тебя получится!', 'Review the topic, you can do it!'];
      box.innerHTML = '<div class="q-result">' + chars + '<div class="big-score">' + s + ' / ' + Q.length + '</div><div class="big-stars">' + [0, 1, 2].map(i => starSVG(i < stars, i)).join('') + '</div><h3>' + tr(msg) + '</h3><button class="btn yellow" type="button" id="qAgain">' + tr(['Қайта бастау', 'Пройти заново', 'Try again']) + '</button></div>';
      $('#qAgain').addEventListener('click', start);
    }
    if (anim) { box.classList.remove('fresh'); void box.offsetWidth; box.classList.add('fresh'); }
    else box.classList.remove('fresh');
  }
  function pick(oi) {
    if (S.phase !== 'q' || S.picked[S.i] != null) return;
    S.picked[S.i] = oi;
    if (oi === 0) { S.score++; sfx.success(); const b = $('.q-opt[data-oi="0"]', box).getBoundingClientRect(); confetti.burst({ x: (b.left + b.width / 2) / innerWidth, y: (b.top + b.height / 2) / innerHeight, count: 70, power: 0.8 }); }
    else sfx.error();
    render(false);
  }
  function advance() {
    if (S.i < Q.length - 1) { S.i++; render(true); sfx.whoosh(); }
    else { S.phase = 'end'; render(true); if (S.score >= 6) { sfx.fanfare(); confetti.burst({ count: 200, power: 1.2 }); } else sfx.pop(); }
  }
  reg('quiz', {
    key(e) {
      if (S.phase !== 'q') return;
      const map = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 }, k = map[e.key.toLowerCase()];
      if (k != null && S.picked[S.i] == null) { pick(S.perms[S.i][k]); e.preventDefault(); }
      else if (e.key === 'Enter' && S.picked[S.i] != null) { advance(); e.preventDefault(); }
    }
  });
  onLang(() => render(false));
  render(false);
})();

/* ================= 20 · homework ================= */
(() => {
  $('#hwChips').innerHTML = Array.from({ length: 15 }, (_, i) => '<div class="el-chip" style="--bg:var(--' + block(i + 1) + '-block);--i:' + i + '"><small>' + (i + 1) + '</small>' + SYM[i] + '</div>').join('');
  let timer = 0, k = -1;
  const show = (n) => { $$('#hwModel .mstep').forEach(gr => gr.classList.toggle('on', +gr.dataset.ms <= n)); $$('#hwSteps li').forEach((li, i) => li.classList.toggle('on', i === n)); };
  reg('homework', {
    enter() { clearInterval(timer); k = -1; show(-1); timer = setInterval(() => { k = k >= 6 ? -1 : k + 1; show(Math.min(k, 4)); if (k >= 0 && k <= 4) sfx.pop(0.9 + k * 0.12); }, 1300); },
    leave() { clearInterval(timer); }
  });
  if (reduceMotion) show(4);
})();

/* ================= 21 · reflection ================= */
(() => {
  const ON = ['#2FD46F', '#FFC21A', '#FF4D5E'], OFF = ['#3E4F44', '#5A5236', '#5A3438'];
  function set(k) {
    $$('.lamp').forEach((l, i) => { const gl = $('.glass', l); gl.setAttribute('fill', i === k ? ON[i] : OFF[i]); gl.style.filter = i === k ? 'drop-shadow(0 0 14px ' + ON[i] + ')' : 'none'; });
    $$('.rf-opt').forEach((b, i) => b.classList.toggle('on', i === k));
    if (k === 0) { sfx.success(); const r = $('.rf-opt[data-rf="0"]').getBoundingClientRect(); confetti.burst({ x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight, count: 90 }); }
    else if (k === 1) sfx.pop(1.2); else sfx.boing();
  }
  $$('.rf-opt').forEach(b => b.addEventListener('click', () => set(+b.dataset.rf)));
  $$('.lamp').forEach(l => { l.addEventListener('click', () => set(+l.dataset.lamp)); l.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(+l.dataset.lamp); } }); });
})();

/* ================= 22 · thanks ================= */
(() => {
  let tm = 0;
  reg('thanks', { enter() { clearTimeout(tm); tm = setTimeout(() => { if (isActive('thanks')) { confetti.burst({ count: 200, power: 1.2, y: 0.4 }); sfx.fanfare(); } }, 1100); }, leave() { clearTimeout(tm); } });
})();

/* ================= main loop + boot ================= */
let T = 0, lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now; T += dt;
  tickOrbiters(T);
  for (const v of AtomView.all) if (v.active) v.tick(dt);
  for (const f of tickers) f(dt, T);
  requestAnimationFrame(frame);
}
let booted = false;
function boot(data) {
  if (booted) return; booted = true;
  syncSound();
  let start = 0;
  const m = /^#slide-(\d+)$/.exec(location.hash); if (m) start = clamp(+m[1] - 1, 0, slides.length - 1);
  if (data && Number.isInteger(data.cur)) start = clamp(data.cur, 0, slides.length - 1);
  go(start, { silent: true, force: true });
  if (data && Number.isInteger(data.step)) { for (let i = 0; i < data.step; i++) next(); }
  requestAnimationFrame(frame);
}
fillChars();
applyLang(true);
scanOrbiters();
try { if (window.claude && window.claude.hot && typeof window.claude.hot.snapshot === 'function') window.claude.hot.snapshot(() => ({ cur, step })); } catch (e) { /* no hot reload */ }
if (window.claude && window.claude.hot && typeof window.claude.hot.ready === 'function') window.claude.hot.ready(boot);
else boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
