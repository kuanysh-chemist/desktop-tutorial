/* ===== 3-тарау: Химиялық қасиеттер ===== */

/* ---------- Тек тотықсыздандырғыштар ---------- */
Deck.add({
  id: 'reducer', ch: 3, time: 4,
  t: ['Металдар — тек тотықсыздандырғыштар', 'Металлы — только восстановители'],
  note: ['Негізгі мақсат 9.2.1.2. Реакцияларда металл атомдары тек электрон береді және тотығады: Me⁰ − ne⁻ → Meⁿ⁺. Неге? Сыртқы деңгейде электрон аз (1–3), радиус үлкен, электртерістілік төмен: 1–3 электронды беру 5–7 электронды қабылдаудан оңай. Сондықтан металдарда теріс тотығу дәрежесі болмайды. Оқушыларға Mg және Fe үшін электрондық баланс жаздырыңыз: Fe⁰ − 2e⁻ → Fe²⁺, Fe⁰ − 3e⁻ → Fe³⁺. Белсенділік қатары: тотықсыздандыру қабілеті солдан оңға қарай кемиді.',
    'Ключевая цель 9.2.1.2. В реакциях атомы металлов только отдают электроны и окисляются: Me⁰ − ne⁻ → Meⁿ⁺. Почему? Электронов на внешнем уровне мало (1–3), радиус велик, электроотрицательность низкая: отдать 1–3 электрона легче, чем принять 5–7. Поэтому у металлов не бывает отрицательных степеней окисления. Попросите записать электронный баланс для Mg и Fe: Fe⁰ − 2e⁻ → Fe²⁺, Fe⁰ − 3e⁻ → Fe³⁺. Ряд активности: восстановительная способность уменьшается слева направо.'],
  ans: ['Электрондық баланс: Mg⁰ − 2e⁻ → Mg²⁺; Fe⁰ − 2e⁻ → Fe²⁺; Fe⁰ − 3e⁻ → Fe³⁺. Теріс тотығу дәрежесі жоқ, себебі металл электрон қабылдамайды.', 'Электронный баланс: Mg⁰ − 2e⁻ → Mg²⁺; Fe⁰ − 2e⁻ → Fe²⁺; Fe⁰ − 3e⁻ → Fe³⁺. Отрицательных степеней окисления нет: металл не принимает электроны.'],
  fact: ['<p>Натрий мен калийді <b>керосиннің астында</b> сақтайды: ауада олар бірден тотығады, ал сумен жарылыспен әрекеттеседі.</p>', '<p>Натрий и калий хранят <b>под слоем керосина</b>: на воздухе они мгновенно окисляются, а с водой реагируют бурно.</p>'],
  bridge: ['Енді көрейік: металдар нені тотықсыздандырады?', 'Теперь посмотрим: что именно восстанавливают металлы?'],
  html: () => `
    <div class="r" style="gap:16px">
      <div class="panel" style="width:590px;height:322px" data-a="l">
        <div class="abs" style="left:12px;top:10px;z-index:3"><div class="tabs sm noswipe" id="rdTabs"><button data-i="0" class="on">Na</button><button data-i="1">Mg</button><button data-i="2">Al</button></div></div>
        <div id="rdA" style="position:absolute;left:0;top:48px"></div>
        <div class="abs r ctr" style="left:14px;right:14px;bottom:12px;gap:12px;z-index:3"><button class="btn sm" id="rdGive"></button><span class="eq" id="rdEq" style="font-size:22px"></span></div>
      </div>
      <div class="panel" style="width:606px;height:322px;--d:.15s" data-a="r"><div id="rdS"></div></div>
    </div>
    <div class="card" data-a style="--d:.5s;margin-top:14px"><div class="r ctr sb2" style="margin-bottom:8px"><span class="lbl">${L('Металдардың белсенділік қатары', 'Электрохимический ряд активности металлов')}</span><span class="sm">${L('тотықсыздандыру қабілеті кемиді →', 'восстановительная способность убывает →')}</span></div>
      <div class="r" id="rdSeries" style="gap:6px;justify-content:space-between"></div>
      <div class="r" style="margin-top:8px;gap:10px"><span class="chip k">${L('H₂-ден сол жақтағы металдар қышқылдан сутекті ығыстырады', 'Металлы левее H₂ вытесняют водород из кислот')}</span><span class="chip">${L('Әр металл тұз ерітіндісінен өзінен оң жақтағы металды ығыстырады', 'Каждый металл вытесняет из солей те, что правее него')}</span></div></div>`,
  init(root) {
    const A = [{ s: 'Na', z: 11, sh: [2, 8, 1] }, { s: 'Mg', z: 12, sh: [2, 8, 2] }, { s: 'Al', z: 13, sh: [2, 8, 3] }];
    const ca = D.cv($('#rdA', root), 590, 214), cs = D.cv($('#rdS', root), 606, 322);
    const ser = 'Li K Ba Ca Na Mg Al Zn Fe Ni Sn Pb H₂ Cu Hg Ag Pt Au'.split(' ');
    $('#rdSeries', root).innerHTML = ser.map((m, i) => `<span class="sch ${m === 'H₂' ? 'h2' : ''}" style="--sc:hsl(${lerp(8, 215, i / 17)} 78% 52%);animation-delay:${i * .08}s">${m}</span>`).join('');
    let cur = 0, p = 0, outs = [], tseesaw = 0, t = 0;
    const eqs = [['Na⁰ − 1e⁻ → Na⁺', '+1'], ['Mg⁰ − 2e⁻ → Mg²⁺', '+2'], ['Al⁰ − 3e⁻ → Al³⁺', '+3']];
    const sync = () => { $('#rdGive', root).textContent = p > 0 ? T('↺ Қайта', '↺ Заново') : T('⚡ Электрон беру', '⚡ Отдать электроны'); $('#rdEq', root).textContent = p > .1 ? eqs[cur][0] : A[cur].s + '⁰ → ?'; };
    $$('#rdTabs button', root).forEach(b => b.onclick = () => { cur = +b.dataset.i; p = 0; outs = []; $$('#rdTabs button', root).forEach(x => x.classList.toggle('on', x === b)); sync(); });
    $('#rdGive', root).onclick = () => {
      if (p > 0) { p = 0; outs = []; sync(); return; }
      const n = A[cur].sh[2]; outs = Array.from({ length: n }, (_, k) => ({ k, p: 0 }));
      outs.forEach((o, k) => D.tween(1.4, v => { o.p = v; }, { delay: k * .5, ease: ease.inout }));
      D.tween(.1 + n * .5, v => { p = Math.max(p, v * .99 + .01); }, { ease: ease.lin, done: () => { p = 1; sync(); } });
      sync(); D.beep('pop');
    };
    return {
      lang: sync,
      enter() { cur = 0; p = 0; outs = []; tseesaw = 0; $$('#rdTabs button', root).forEach(x => x.classList.toggle('on', x.dataset.i === '0')); sync(); D.tween(1.6, v => { tseesaw = v; }, { ease: ease.back, delay: .5 }); },
      tick(dt) {
        t += dt; let x = ca.begin(); const a = A[cur], cx = 130, cy = 98, R = [24, 46, 68];
        x.lineWidth = 2; x.strokeStyle = D.col.line; R.forEach(r => { x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.stroke(); });
        const lost = outs.filter(o => o.p > .02).length;
        const done = outs.length && outs.every(o => o.p >= 1);
        G.ball(x, cx, cy, 15, done ? '#60a5fa' : '#ef4444'); G.txt(x, '+' + (a.z - (done ? a.sh[2] : 0)), cx, cy + 1, { size: 14, color: '#fff', weight: 900 });
        a.sh.forEach((n, ring) => {
          for (let k = 0; k < n; k++) {
            const ang = k / n * 6.283 + t * (1.5 - ring * .5) * (ring % 2 ? -1 : 1);
            if (ring < 2) { G.ball(x, cx + Math.cos(ang) * R[ring], cy + Math.sin(ang) * R[ring], 4.6, '#7aa7ff'); continue; }
            const o = outs[k]; let px = cx + Math.cos(ang) * R[2], py = cy + Math.sin(ang) * R[2], al = 1;
            if (o && o.p > 0) { const e = o.p; px = lerp(px, 520 - k * 18, e); py = lerp(py, 70 + k * 40, e); al = 1 - Math.max(0, e - .8) * 5; }
            x.globalAlpha = clamp(al, 0, 1); G.e(x, px, py, 5.5); x.globalAlpha = 1;
          }
        });
        if (done) { x.strokeStyle = 'rgba(59,130,246,.5)'; x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, 78, 0, 6.283); x.stroke(); }
        G.txt(x, a.s + (done ? ['⁺', '²⁺', '³⁺'][a.sh[2] - 1] : '⁰'), cx, 186, { size: 28, color: done ? D.col.ion : D.col.ink, weight: 900 });
        G.txt(x, T('Тотығу дәрежесі:', 'Степень окисления:'), 340, 70, { size: 17, color: D.col.ink2, weight: 800, align: 'left' });
        G.txt(x, '0' + (lost ? '  →  ' + eqs[cur][1] : ''), 340, 112, { size: 44, color: lost ? '#f97316' : D.col.ink, weight: 900, align: 'left' });
        G.txt(x, lost ? T('электрон беру = тотығу', 'отдал электроны = окислился') : T('сыртқы электрон: ' + a.sh[2], 'внешних электронов: ' + a.sh[2]), 340, 156, { size: 17, color: D.col.ink2, weight: 900, align: 'left' });
        /* таразы */
        x = cs.begin(); const px = 303, py = 190, th = lerp(0, .2, clamp(tseesaw, 0, 1.2));
        x.fillStyle = '#64748b'; x.beginPath(); x.moveTo(px, py - 6); x.lineTo(px - 34, py + 66); x.lineTo(px + 34, py + 66); x.closePath(); x.fill();
        x.save(); x.translate(px, py - 6); x.rotate(th);
        G.rr(x, -230, -7, 460, 14, 7); x.fillStyle = '#334155'; x.fill();
        [[-230, 3, '#16a34a'], [230, 6, '#ef4444']].forEach(([bx, nn, col]) => {
          x.save(); x.translate(bx, 0); x.rotate(-th); x.strokeStyle = '#64748b'; x.lineWidth = 3; x.beginPath(); x.moveTo(-46, 46); x.lineTo(0, 0); x.lineTo(46, 46); x.stroke();
          G.rr(x, -56, 46, 112, 12, 6); x.fillStyle = col; x.fill();
          for (let k = 0; k < nn; k++) G.e(x, -30 + (k % 3) * 30 + (nn === 3 ? 0 : 0), 34 - Math.floor(k / 3) * 17, 6);
          x.restore();
        });
        x.restore();
        G.txt(x, T('Беру: 1–3 e⁻', 'Отдать: 1–3 e⁻'), 130, 36, { size: 20, color: '#16a34a', weight: 900 }); G.txt(x, T('оңай', 'легко'), 130, 62, { size: 17, color: '#16a34a', weight: 800 });
        G.txt(x, T('Қабылдау: 5–7 e⁻', 'Принять: 5–7 e⁻'), 480, 36, { size: 20, color: '#ef4444', weight: 900 }); G.txt(x, T('қиын', 'трудно'), 480, 62, { size: 17, color: '#ef4444', weight: 800 });
        G.txt(x, T('Сондықтан металдарда теріс тотығу дәрежесі болмайды', 'Поэтому у металлов нет отрицательных степеней окисления'), 303, 306, { size: 17, color: D.col.ink, weight: 900 });
      }
    };
  }
});

/* ---------- Бейметалдармен және сумен әрекеттесу ---------- */
Deck.add({
  id: 'rxn', ch: 3, time: 5,
  t: ['Оттегімен, бейметалмен және сумен', 'С кислородом, неметаллами и водой'],
  note: ['Барлық реакцияда металл — тотықсыздандырғыш: тотығу дәрежесі 0-ден +n-ге артады. Оттегімен оксидтер түзіледі. Al мықты Al₂O₃ қабықшасымен жабылады, ол әрі қарай тотығудан қорғайды. Алтын мен платина оттегімен әрекеттеспейді. Галогендермен — галогенидтер, күкіртпен — сульфидтер, азотпен — нитридтер, сутекпен (белсенді металдар) — гидридтер. Сумен: сілтілік және сілтілік-жер металдар қалыпты жағдайда (сілті + H₂), орташа белсенділер қыздырғанда (оксид + H₂), Cu, Ag, Au сумен әрекеттеспейді. Na суға салғанда фенолфталеин қызыл-күлгін түске боялады — сілті түзілді.',
    'Во всех реакциях металл — восстановитель: степень окисления металла повышается от 0 до +n. С кислородом образуются оксиды. Al покрывается прочной плёнкой Al₂O₃, которая защищает его от дальнейшего окисления. Золото и платина с кислородом не реагируют. С галогенами — галогениды, с серой — сульфиды, с азотом — нитриды, с водородом (активные металлы) — гидриды. С водой: щелочные и щёлочноземельные металлы — при обычных условиях (щёлочь + H₂), металлы средней активности — при нагревании (оксид + H₂), Cu, Ag, Au с водой не реагируют. Фенолфталеин в воде с Na становится малиновым — образовалась щёлочь.'],
  fact: ['<p>Магний жарқылы — ескі <b>фотожарқылдың</b> негізі: алғашқы фотографтар магний ұнтағын жағып, түсірілім үшін жарық алған.</p>', '<p>Вспышка магния — основа старых <b>фотовспышек</b>: первые фотографы поджигали магниевый порошок, чтобы осветить сцену.</p>'],
  bridge: ['Ал қышқыл мен тұз ерітіндісінде не болады? Зертханаға барайық', 'А что в кислотах и растворах солей? Идём в лабораторию'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:640px;height:456px" data-a="l">
        <div class="abs" style="left:12px;top:10px;z-index:3"><div class="tabs sm noswipe" id="rxTabs"><button data-k="o2" class="on">${L('🔥 Оттегімен', '🔥 С кислородом')}</button><button data-k="cl" class="">${L('💨 Хлормен', '💨 С хлором')}</button><button data-k="h2o" class="">${L('💧 Сумен', '💧 С водой')}</button></div></div>
        <div id="rxHost" style="position:absolute;left:0;top:52px"></div>
        <div class="abs" style="left:14px;bottom:12px;z-index:3"><button class="btn" id="rxGo"></button></div>
      </div>
      <div class="c f1" style="gap:10px" id="rxInfo"></div>
    </div>`,
  init(root) {
    const W = 640, H = 340, cv = D.cv($('#rxHost', root), W, H);
    let tab = 'o2', t = 0, S = {}, parts = [];
    const INFO = {
      o2: { eq: ['2Mg + O2 → 2MgO', '4Al + 3O2 → 2Al2O3', '2Cu + O2 →(t) 2CuO'], n: ['Оксидтер түзіледі. Al мықты Al₂O₃ қабықшасымен қорғалады. Au және Pt оттегімен әрекеттеспейді.', 'Образуются оксиды. Al покрыт прочной плёнкой Al₂O₃. Au и Pt с кислородом не реагируют.'] },
      cl: { eq: ['2Na + Cl2 → 2NaCl', 'Fe + S →(t) FeS', '3Ca + N2 → Ca3N2', '2Na + H2 → 2NaH'], n: ['Галогенидтер, сульфидтер, нитридтер, гидридтер түзіледі. NaCl — иондық кристалл.', 'Галогениды, сульфиды, нитриды, гидриды. NaCl — ионный кристалл.'] },
      h2o: { eq: ['2Na + 2H2O → 2NaOH + H2↑', 'Mg + 2H2O →(t) Mg(OH)2 + H2↑', '3Fe + 4H2O(бу) → Fe3O4 + 4H2', 'Cu, Ag, Au + H2O ✕'], n: ['Белсенді металдар сумен қалыпты жағдайда әрекеттеседі: сілті + H₂. Фенолфталеин қызыл-күлгін түске боялады.', 'Активные металлы реагируют с водой при обычных условиях: щёлочь + H₂. Фенолфталеин становится малиновым.'] }
    };
    const info = $('#rxInfo', root), btn = $('#rxGo', root);
    const reset = () => {
      parts = [];
      S = tab === 'o2' ? { p: 0, run: false } : tab === 'cl' ? { p: 0, run: false, na: -60, gas: 1, cr: 0 } : { p: 0, run: false, x: 320, y: 120, vx: 0, trail: [], pink: 0, drop: 0 };
    };
    const render = () => {
      const f = INFO[tab];
      info.innerHTML = `<div class="card tint" style="padding:14px 18px"><div class="lbl" style="margin-bottom:6px">${L('Теңдеулер', 'Уравнения')}</div>${f.eq.map(e => `<div class="eq" style="display:block;margin:5px 0;font-size:21px;padding:6px 12px">${F(e.replace('→(t)', '→<small> t </small>→').replace('(бу)', T('(бу)', '(пар)')))}</div>`).join('')}</div>
        <div class="card"><div class="t2">${L(f.n[0], f.n[1])}</div></div>
        <div class="key"><span class="lb">${L('Қорытынды', 'Вывод')}</span><span class="t" style="font-size:18px">${L('Барлығында металл — <b>тотықсыздандырғыш</b>: <b>0 → +n</b>.', 'Везде металл — <b>восстановитель</b>: <b>0 → +n</b>.')}</span></div>`;
      btn.textContent = tab === 'o2' ? T('🔥 Магнийді қыздыру', '🔥 Нагреть магний') : T('⬇ Na салу', '⬇ Опустить Na');
      $$('#rxTabs button', root).forEach(b => b.classList.toggle('on', b.dataset.k === tab));
    };
    $$('#rxTabs button', root).forEach(b => b.onclick = () => { tab = b.dataset.k; reset(); render(); D.beep('pop'); });
    btn.onclick = () => {
      if (S.run) { reset(); render(); return; }
      S.run = true; D.beep('pop');
      if (tab === 'o2') D.tween(5, v => { S.p = v; }, { ease: ease.lin, done: () => { btn.textContent = T('↺ Қайта', '↺ Заново'); } });
      else if (tab === 'cl') D.tween(6, v => { S.p = v; }, { ease: ease.lin, done: () => { btn.textContent = T('↺ Қайта', '↺ Заново'); } });
      else D.tween(7, v => { S.p = v; }, { ease: ease.lin, done: () => { btn.textContent = T('↺ Қайта', '↺ Заново'); } });
    };
    reset(); render();
    const flame = (x, fx, fy, k, big) => { for (let i = 0; i < 3; i++) { const h = (34 + Math.sin(t * 15 + i * 2) * 9) * big; x.fillStyle = ['rgba(59,130,246,.85)', '#fb923c', '#fde68a'][i]; x.beginPath(); x.moveTo(fx - (13 - i * 3) * big, fy); x.quadraticCurveTo(fx + Math.sin(t * 9 + i) * 3, fy - h * (1 - i * .25), fx + (13 - i * 3) * big, fy); x.fill(); } };
    return {
      lang: render,
      enter() { tab = 'o2'; reset(); render(); },
      tick(dt) {
        t += dt; const x = cv.begin(), p = S.p;
        if (tab === 'o2') {
          G.rr(x, 8, 0, W - 16, H - 4, 24); const bgg = x.createLinearGradient(0, 0, 0, H); bgg.addColorStop(0, '#0b1224'); bgg.addColorStop(1, '#1e293b'); x.fillStyle = bgg; x.fill();
          /* горелка */
          G.rr(x, 290, 288, 60, 40, 8); x.fillStyle = '#475569'; x.fill(); G.rr(x, 312, 232, 16, 60, 4); x.fillStyle = '#64748b'; x.fill();
          if (S.run) flame(x, 320, 232, 1, 1.7);
          /* щипцы + лента */
          const burn = clamp((p - .12) / .55, 0, 1), flash = p > .22 && p < .75, ashp = clamp((p - .6) / .4, 0, 1);
          x.strokeStyle = '#64748b'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(470, 40); x.lineTo(352, 160); x.stroke();
          x.lineWidth = 5; x.beginPath(); x.moveTo(500, 50); x.lineTo(354, 170); x.stroke();
          if (p < .7) { const L_ = 96 * (1 - burn * .85); x.strokeStyle = p > .08 ? 'rgb(' + Math.round(lerp(200, 255, burn)) + ',' + Math.round(lerp(210, 120, burn)) + ',' + Math.round(lerp(220, 40, burn)) + ')' : '#cbd5e1'; x.lineWidth = 7; x.beginPath(); x.moveTo(348, 166); for (let i = 1; i <= 8; i++) x.lineTo(348 - i * L_ / 8, 166 + 18 + Math.sin(i * 1.4) * 8); x.stroke(); }
          if (flash) { const k = .6 + Math.sin(t * 40) * .4, g = x.createRadialGradient(300, 190, 5, 300, 190, 200 * k + 60); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + t * .5; x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.beginPath(); x.moveTo(300 + Math.cos(a) * 30, 190 + Math.sin(a) * 30); x.lineTo(300 + Math.cos(a) * (120 + k * 60), 190 + Math.sin(a) * (120 + k * 60)); x.stroke(); }
            if (Math.random() < .8) parts.push({ x: 300 + rnd(-30, 30), y: 190, vx: rnd(-140, 140), vy: rnd(-200, 60), l: .9, c: '#fff' }); }
          /* күл */
          G.rr(x, 220, 296, 160, 30, 15); x.fillStyle = '#94a3b8'; x.fill();
          for (let i = 0; i < 60 * ashp; i++) { x.fillStyle = '#f8fafc'; x.beginPath(); x.arc(250 + (i * 37 % 100), 296 - (i * 13 % 7), 3.4, 0, 6.283); x.fill(); }
          if (ashp > .5) G.txt(x, T('MgO — ақ ұнтақ', 'MgO — белый порошок'), 300, 322, { size: 19, color: '#f1f5f9', weight: 900 });
          if (!S.run) G.txt(x, T('Mg лентасын қыздырамыз', 'Нагреем ленту магния'), 300, 40, { size: 20, color: '#cbd5e1', weight: 900 });
          if (S.run && p < .25) G.txt(x, T('Қыздырамыз…', 'Нагреваем…'), 300, 40, { size: 20, color: '#cbd5e1', weight: 900 });
          if (flash) G.txt(x, '2Mg + O₂ → 2MgO', 300, 40, { size: 26, color: '#fb923c', weight: 900, stroke: 'rgba(15,23,42,.9)' });
        } else if (tab === 'cl') {
          /* колба */
          const fx = 280;
          x.beginPath(); x.moveTo(fx - 26, 70); x.lineTo(fx + 26, 70); x.lineTo(fx + 26, 130); x.lineTo(fx + 110, 300); x.lineTo(fx - 110, 300); x.lineTo(fx - 26, 130); x.closePath();
          x.save(); x.clip(); const gas = clamp(1 - p * 1.1, 0, 1); x.fillStyle = 'rgba(190,220,40,' + (.5 * gas) + ')'; x.fillRect(0, 70, W, 240);
          for (let i = 0; i < 10; i++) { x.fillStyle = 'rgba(160,200,20,' + (.25 * gas) + ')'; x.beginPath(); x.arc(fx + Math.sin(t + i) * 60, 150 + (i * 31 % 130) + Math.cos(t * .8 + i) * 10, 26, 0, 6.283); x.fill(); }
          if (S.run && p > .12) { const g = x.createRadialGradient(fx, 270, 5, fx, 270, 130); g.addColorStop(0, 'rgba(255,230,80,' + (.9 * (1 - p)) + ')'); g.addColorStop(1, 'rgba(255,140,0,0)'); x.fillStyle = g; x.fillRect(0, 130, W, 190); }
          x.restore(); x.strokeStyle = D.col.ink2; x.lineWidth = 5; x.lineJoin = 'round'; x.beginPath(); x.moveTo(fx - 26, 70); x.lineTo(fx - 26, 130); x.lineTo(fx - 110, 300); x.lineTo(fx + 110, 300); x.lineTo(fx + 26, 130); x.lineTo(fx + 26, 70); x.stroke();
          G.txt(x, 'Cl₂', fx, 150, { size: 20, color: 'rgba(100,130,0,.9)', weight: 900 });
          /* натрий */
          let ny = S.run ? lerp(-30, 258, ease.out(clamp(p / .12, 0, 1))) : 18; if (!(S.run && p > .2)) { G.ball(x, fx, ny, 15, MET.Na); G.txt(x, 'Na', fx, ny, { size: 15, color: '#14213d', weight: 900 }); }
          if (S.run && p > .12 && p < .8) { for (let i = 0; i < 4; i++) parts.push({ x: fx + rnd(-40, 40), y: 270 + rnd(-10, 10), vx: rnd(-50, 50), vy: rnd(-160, -40), l: .8, c: pick(['#fde047', '#fb923c', '#fff']) }); }
          /* NaCl кристалдары */
          const cr = clamp((p - .3) / .5, 0, 1);
          for (let i = 0; i < 36 * cr; i++) { x.fillStyle = '#f8fafc'; x.strokeStyle = '#cbd5e1'; x.lineWidth = 1; const q = fx - 70 + (i * 29 % 140), r = 290 - Math.floor(i / 12) * 8; x.fillRect(q, r, 8, 8); x.strokeRect(q, r, 8, 8); }
          /* тор */
          if (cr > .4) { x.globalAlpha = clamp((cr - .4) * 2, 0, 1); G.rr(x, 470, 80, 150, 168, 18); x.fillStyle = D.col.card; x.fill(); x.strokeStyle = D.col.line; x.lineWidth = 3; x.stroke(); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const px = 500 + i * 38, py = 120 + j * 36; (i + j) % 2 ? G.ball(x, px, py, 13, '#22c55e') : G.ball(x, px, py, 9, '#3b82f6'); } G.txt(x, T('NaCl торы', 'решётка NaCl'), 545, 232, { size: 17, color: D.col.ink, weight: 900 }); x.globalAlpha = 1; }
          G.txt(x, !S.run ? T('Хлор газына натрий саламыз', 'Опустим натрий в хлор') : p < .8 ? '2Na + Cl₂ → 2NaCl' : T('Ақ кристалдар: NaCl', 'Белые кристаллы: NaCl'), 300, 36, { size: 21, color: S.run && p < .8 ? '#ea580c' : D.col.ink2, weight: 900 });
        } else {
          /* стакан */
          const bx = 130, bw = 380, by = 90, bh = 220;
          x.fillStyle = 'rgba(96,165,250,.45)'; G.rr(x, bx, by + 30, bw, bh - 30, 18); x.fill();
          x.save(); G.rr(x, bx, by + 30, bw, bh - 30, 18); x.clip();
          const k = clamp(S.pink, 0, 1); x.fillStyle = 'rgba(219,39,119,' + (k * .85) + ')'; x.fillRect(bx, by, bw, bh);
          S.trail.forEach(tp => { const g = x.createRadialGradient(tp.x, tp.y, 2, tp.x, tp.y, 40); g.addColorStop(0, 'rgba(219,39,119,' + (.65 * tp.a) + ')'); g.addColorStop(1, 'rgba(219,39,119,0)'); x.fillStyle = g; x.fillRect(tp.x - 40, tp.y - 40, 80, 80); });
          x.restore();
          x.strokeStyle = D.col.ink2; x.lineWidth = 5; x.lineJoin = 'round'; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx, by + bh - 18); x.quadraticCurveTo(bx, by + bh, bx + 18, by + bh); x.lineTo(bx + bw - 18, by + bh); x.quadraticCurveTo(bx + bw, by + bh, bx + bw, by + bh - 18); x.lineTo(bx + bw, by); x.stroke();
          const sy = by + 30; x.strokeStyle = 'rgba(30,58,138,.5)'; x.lineWidth = 2; x.beginPath(); for (let i = 0; i <= 38; i++) x.lineTo(bx + i * 10, sy + Math.sin(t * 3 + i * .6) * 2); x.stroke();
          if (S.run && p < .85) {
            if (S.drop < 1) { S.drop = Math.min(1, S.drop + dt * 2.2); S.y = lerp(20, sy - 8, ease.out(S.drop)); S.x = 320; }
            else { S.vx += rnd(-1, 1) * 900 * dt; S.vx = clamp(S.vx, -260, 260) * .985; S.x += S.vx * dt; if (S.x < bx + 24 || S.x > bx + bw - 24) S.vx *= -1; S.x = clamp(S.x, bx + 24, bx + bw - 24); S.y = sy - 8 + Math.sin(t * 20) * 1.6; S.pink = Math.min(1, S.pink + dt * .11); S.trail.push({ x: S.x, y: S.y + 10, a: 1 }); if (S.trail.length > 30) S.trail.shift(); S.trail.forEach(tp => tp.a *= .985); for (let i = 0; i < 2; i++) parts.push({ x: S.x + rnd(-8, 8), y: S.y + 10, vx: rnd(-20, 20), vy: rnd(-120, -40), l: .6, c: 'rgba(255,255,255,.9)' }); }
            const sz = 14 * (1 - clamp((p - .5) / .35, 0, 1) * .8); G.ball(x, S.x, S.y, sz, MET.Na);
          } else if (!S.run) { G.ball(x, 320, 20, 14, MET.Na); G.txt(x, 'Na', 320, 20, { size: 14, color: '#14213d', weight: 900 }); }
          if (S.pink > .3) G.txt(x, T('Фенолфталеин қызыл-күлгін → сілті (NaOH)', 'Фенолфталеин малиновый → щёлочь (NaOH)'), 320, 336, { size: 17, color: '#be185d', weight: 900 });
          else G.txt(x, !S.run ? T('Суға фенолфталеин тамызылған', 'В воду добавлен фенолфталеин') : '2Na + 2H₂O → 2NaOH + H₂↑', 320, 40, { size: 20, color: S.run ? '#ea580c' : D.col.ink2, weight: 900 });
        }
        for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.l -= dt; q.vy += 500 * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.l <= 0) { parts.splice(i, 1); continue; } x.globalAlpha = clamp(q.l * 1.6, 0, 1); x.fillStyle = q.c; x.beginPath(); x.arc(q.x, q.y, 2.6, 0, 6.283); x.fill(); x.globalAlpha = 1; }
      }
    };
  }
});

/* ---------- Виртуалды зертхана ---------- */
Deck.add({
  id: 'lab', ch: 3, time: 6,
  t: ['Виртуалды зертхана: металл + ерітінді', 'Виртуальная лаборатория: металл + раствор'],
  note: ['Пробиркалық сынақ: металл мен ерітіндіні таңдап, «Салу» батырмасын басыңыз. Реакция тек белсенділік қатарына сай жүреді: H₂-ден сол жақтағы металдар қышқылдан сутекті ығыстырады; белсенді металл өзінен оң жақтағы металды тұз ерітіндісінен ығыстырады. Темір шеге мыс купоросында қызыл мыспен қапталады. «Тексер» тапсырмасы: мырыш — CuSO₄ ерітіндісінде, мыс — ZnSO₄ ерітіндісінде. Реакция тек бірінші пробиркада жүреді: Zn + CuSO₄ → ZnSO₄ + Cu; Zn⁰ − 2e⁻ → Zn²⁺, Cu²⁺ + 2e⁻ → Cu⁰. Мыс аз белсенді, мырышты ығыстыра алмайды. Ерекше жағдайлар: азот қышқылы мен концентрлі күкірт қышқылы басқаша әрекеттеседі (сутек бөлінбейді); амфотерлі Al мен Zn сілтімен де әрекеттеседі.',
    'Пробирочный опыт: выберите металл и раствор, нажмите «Опустить». Реакция идёт только по ряду активности: металлы левее H₂ вытесняют водород из кислот; более активный металл вытесняет менее активный из раствора соли. Железный гвоздь в растворе медного купороса покрывается красной медью. Задание «Проверь себя»: цинк — в раствор CuSO₄, медь — в раствор ZnSO₄. Реакция идёт только в первой пробирке: Zn + CuSO₄ → ZnSO₄ + Cu; Zn⁰ − 2e⁻ → Zn²⁺, Cu²⁺ + 2e⁻ → Cu⁰. Медь менее активна, цинк не вытесняет. Особые случаи: азотная и концентрированная серная кислоты реагируют иначе (водород не выделяется); амфотерные Al и Zn реагируют и со щелочами.'],
  ans: ['Zn + CuSO₄ → ZnSO₄ + Cu↓ (реакция бар). Cu + ZnSO₄ → реакция жүрмейді. Баланс: Zn⁰ − 2e⁻ → Zn²⁺; Cu²⁺ + 2e⁻ → Cu⁰.', 'Zn + CuSO₄ → ZnSO₄ + Cu↓ (реакция идёт). Cu + ZnSO₄ → реакция не идёт. Баланс: Zn⁰ − 2e⁻ → Zn²⁺; Cu²⁺ + 2e⁻ → Cu⁰.'],
  fact: ['<p>Ақтоғайда мыс рудасын <b>күкірт қышқылымен шаймалап</b> (гидрометаллургия), содан кейін электролизбен мысты бөліп алады.</p>', '<p>На Актогае медную руду <b>выщелачивают серной кислотой</b> (гидрометаллургия), а затем выделяют медь электролизом.</p>'],
  bridge: ['Таза металдардың мүмкіндігі шектеулі. Қорытпа жасасақ ше?', 'У чистых металлов есть пределы. А если сделать сплав?'],
  html: () => `
    <div class="r" style="gap:16px">
      <div class="c" style="width:330px;gap:10px">
        <div class="card" data-a="l"><div class="lbl" style="margin-bottom:6px">${L('1. Металл', '1. Металл')}</div><div class="tabs sm noswipe" id="lbM"></div>
          <div class="lbl" style="margin:12px 0 6px">${L('2. Ерітінді', '2. Раствор')}</div><div class="tabs sm noswipe" id="lbS"></div>
          <div style="margin-top:14px"><button class="btn" id="lbGo" style="width:100%;justify-content:center">${L('⬇ Металды салу', '⬇ Опустить металл')}</button></div></div>
        <div class="card tint" data-a="l" style="--d:.2s"><div class="lbl" style="margin-bottom:6px">${L('Өзіңді тексер', 'Проверь себя')}</div><div class="t2" style="font-size:17px">${L('Қай пробиркада реакция жүреді?', 'В какой пробирке пойдёт реакция?')}</div>
          <div class="r" style="gap:8px;margin-top:8px"><button class="btn sm ghost" data-ch="1">Zn → CuSO₄</button><button class="btn sm ghost" data-ch="2">Cu → ZnSO₄</button></div></div>
      </div>
      <div class="panel" style="width:360px;height:462px" data-a="z"><div id="lbHost"></div></div>
      <div class="c f1" style="gap:10px">
        <div class="card" data-a="r" style="--d:.2s;min-height:178px"><div class="lbl" style="margin-bottom:6px">${L('Нәтиже', 'Результат')}</div><div id="lbRes"></div></div>
        <div class="card" data-a="r" style="--d:.35s"><div class="lbl" style="margin-bottom:6px">${L('Ерекше жағдайлар', 'Особые случаи')}</div>
          <div class="eq" style="display:block;font-size:17px;padding:5px 10px;margin:3px 0">${F('Cu + 4HNO3(конц) → Cu(NO3)2 + 2NO2↑ + 2H2O')}</div>
          <div class="eq" style="display:block;font-size:17px;padding:5px 10px;margin:3px 0">${F('2Al + 2NaOH + 6H2O → 2Na[Al(OH)4] + 3H2↑')}</div></div>
      </div>
    </div>`,
  init(root) {
    const W = 360, H = 462, cv = D.cv($('#lbHost', root), W, H);
    const MS = ['Mg', 'Zn', 'Fe', 'Cu', 'Ag'], IDX = { Mg: 0, Zn: 1, Fe: 2, Cu: 3, Ag: 4 };
    const SOL = { HCl: { name: 'HCl', cat: 'H', col: [250, 250, 225, .35] }, CuSO4: { name: 'CuSO₄', cat: 'Cu', col: [56, 167, 240, .6] }, ZnSO4: { name: 'ZnSO₄', cat: 'Zn', col: [235, 245, 250, .35] }, AgNO3: { name: 'AgNO₃', cat: 'Ag', col: [240, 245, 250, .35] } };
    const DEP = { Cu: '#b45309', Ag: '#e5e7eb', Zn: '#94a3b8' }, NEWSOL = { Fe: [190, 220, 150, .45], Cu: [120, 190, 235, .45], Mg: [240, 247, 250, .35], Zn: [240, 247, 250, .35] };
    const react = (m, sk) => { const s = SOL[sk]; if (s.cat === 'H') return IDX[m] <= 2; return IDX[m] < IDX[s.cat]; };
    const eqOf = (m, sk) => {
      const s = SOL[sk]; if (!react(m, sk)) return null;
      const OX = { Mg: ['Mg⁰ − 2e⁻ → Mg²⁺', 2], Zn: ['Zn⁰ − 2e⁻ → Zn²⁺', 2], Fe: ['Fe⁰ − 2e⁻ → Fe²⁺', 2], Cu: ['Cu⁰ − 2e⁻ → Cu²⁺', 2] };
      if (s.cat === 'H') return { eq: `${m} + 2HCl → ${m}Cl2 + H2↑`, ox: OX[m][0], rd: '2H⁺ + 2e⁻ → H₂⁰' };
      const an = sk === 'AgNO3' ? ['NO3', 1] : ['SO4', 1];
      if (s.cat === 'Ag') { const sa = m === 'Mg' ? 'Mg(NO3)2' : m + '(NO3)2'; return { eq: `${m} + 2AgNO3 → ${sa} + 2Ag↓`, ox: OX[m][0], rd: '2Ag⁺ + 2e⁻ → 2Ag⁰' }; }
      return { eq: `${m} + ${s.cat}SO4 → ${m}SO4 + ${s.cat}↓`, ox: OX[m][0], rd: `${s.cat}²⁺ + 2e⁻ → ${s.cat}⁰` };
    };
    let met = 'Zn', sol = 'CuSO4', run = false, p = 0, t = 0, strip = 0, shown = false; const parts = [];
    const tm = $('#lbM', root), ts = $('#lbS', root), res = $('#lbRes', root);
    const draw = () => {
      tm.innerHTML = MS.map(m => `<button data-m="${m}" class="${m === met ? 'on' : ''}">${m}</button>`).join('');
      ts.innerHTML = Object.keys(SOL).map(k => `<button data-s="${k}" class="${k === sol ? 'on' : ''}">${SOL[k].name}</button>`).join('');
      $$('button', tm).forEach(b => b.onclick = () => { met = b.dataset.m; clear(); draw(); });
      $$('button', ts).forEach(b => b.onclick = () => { sol = b.dataset.s; clear(); draw(); });
    };
    const clear = () => { run = false; p = 0; strip = 0; shown = false; parts.length = 0; res.innerHTML = '<p class="t2" style="margin:0">' + T('Металл мен ерітіндіні таңдап, «Металды салу» батырмасын бас.', 'Выбери металл и раствор и нажми «Опустить».') + '</p>'; };
    const showRes = () => {
      const e = eqOf(met, sol), nm = SOL[sol].name;
      res.innerHTML = e ? `<div class="ok" style="font-size:19px;margin-bottom:6px">✓ ${T('Реакция жүреді', 'Реакция идёт')}</div><div class="eq" style="display:block;font-size:19px;padding:6px 10px">${F(e.eq)}</div><div class="t2" style="margin-top:8px;font-size:17px"><div><b class="eo">${e.ox}</b></div><div><b class="io">${e.rd}</b></div></div>`
        : `<div class="bad" style="font-size:19px;margin-bottom:6px">✕ ${T('Реакция жүрмейді', 'Реакция не идёт')}</div><div class="t2" style="font-size:17px">${met === 'Ag' || met === 'Cu' && sol === 'HCl' ? T(met + ' белсенділік қатарында сутектен кейін тұр.', met + ' стоит в ряду активности после водорода.') : T(met + ' өзінен белсенді (немесе бірдей) металды ығыстыра алмайды.', met + ' не вытесняет более активный (или тот же) металл.')}</div>`;
    };
    $('#lbGo', root).onclick = () => { clear(); run = true; D.tween(8, v => { p = v; if (v > .25 && !shown) { shown = true; showRes(); D.beep(react(met, sol) ? 'ok' : 'no'); } }, { ease: ease.lin }); D.tween(1.2, v => { strip = v; }, { ease: ease.out }); };
    $$('[data-ch]', root).forEach(b => b.onclick = () => {
      const right = b.dataset.ch === '1'; D.beep(right ? 'win' : 'no');
      if (right) { const pt = D.at(b); D.confetti(pt.x, pt.y, 50); }
      met = b.dataset.ch === '1' ? 'Zn' : 'Cu'; sol = b.dataset.ch === '1' ? 'CuSO4' : 'ZnSO4'; clear(); draw(); $('#lbGo', root).click();
    });
    draw(); clear();
    return {
      lang() { draw(); if (shown) showRes(); else clear(); },
      enter() { met = 'Zn'; sol = 'CuSO4'; draw(); clear(); },
      tick(dt) {
        t += dt; const x = cv.begin(), tx = 110, tw = 140, top = 70, bot = 410, lv = 170;
        const r = react(met, sol), pr = run && r ? clamp(p / .9, 0, 1) : 0;
        /* ерітінді */
        const c0 = SOL[sol].col, c1 = r ? (sol === 'HCl' ? c0 : sol === 'CuSO4' ? NEWSOL[met] : sol === 'AgNO3' ? NEWSOL[met] : c0) : c0;
        const cc = c0.map((v, i) => lerp(v, c1[i], pr));
        x.beginPath(); x.moveTo(tx, top); x.lineTo(tx, bot - tw / 2); x.arc(tx + tw / 2, bot - tw / 2, tw / 2, Math.PI, 0, true); x.lineTo(tx + tw, top); x.closePath();
        x.save(); x.clip(); x.fillStyle = 'rgba(' + Math.round(cc[0]) + ',' + Math.round(cc[1]) + ',' + Math.round(cc[2]) + ',' + cc[3] + ')'; x.fillRect(tx, lv, tw, 300);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(tx + 8, lv + 6, 10, 200);
        /* металл жолақ */
        const sx = tx + tw / 2 - 14, drop = 28 + ease.out(strip) * 190 - 190 + (run ? 0 : -160) + 0;
        const stripTop = run ? lerp(-60, 118, ease.out(strip)) : -60;
        if (run || shown) {
          const sy0 = stripTop, sh = 230; G.rr(x, sx, sy0, 28, sh, 4); const g = x.createLinearGradient(sx, 0, sx + 28, 0); g.addColorStop(0, G.shade(MET[met], .3)); g.addColorStop(1, G.shade(MET[met], -.2)); x.fillStyle = g; x.fill();
          if (r && sol !== 'HCl') { const dep = DEP[SOL[sol].cat]; const n = Math.floor(pr * 90); for (let i = 0; i < n; i++) { const yy = sy0 + 60 + (i * 53 % (sh - 70)), xx = sx - 4 + (i * 17 % 36); if (yy < lv) continue; x.fillStyle = dep; x.beginPath(); x.arc(xx, yy, 2 + (i % 3), 0, 6.283); x.fill(); } }
          if (r && sol === 'HCl' && run && p < .85) { const rate = met === 'Mg' ? 7 : met === 'Zn' ? 3 : 1.5; if (Math.random() < rate * dt * 4) parts.push({ x: sx + rnd(-6, 34), y: sy0 + rnd(100, 220), vx: rnd(-8, 8), vy: -rnd(40, 70), l: 3, c: 'rgba(255,255,255,.9)', hz: 1 }); }
        }
        x.restore();
        for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.l -= dt; q.x += q.vx * dt + Math.sin(t * 8 + i) * .4; q.y += q.vy * dt; if (q.l <= 0 || q.y < lv - 20) { parts.splice(i, 1); continue; } x.fillStyle = q.c; x.strokeStyle = 'rgba(100,150,200,.7)'; x.lineWidth = 1.5; x.beginPath(); x.arc(q.x, q.y, 3.4, 0, 6.283); x.fill(); x.stroke(); }
        if (run && r && sol === 'HCl') G.txt(x, 'H₂↑', tx + tw / 2, lv - 36, { size: 20, color: '#2563eb', weight: 900 });
        x.strokeStyle = D.col.ink2; x.lineWidth = 5; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); x.moveTo(tx - 6, top); x.lineTo(tx, top); x.lineTo(tx, bot - tw / 2); x.arc(tx + tw / 2, bot - tw / 2, tw / 2, Math.PI, 0, true); x.lineTo(tx + tw, top); x.lineTo(tx + tw + 6, top); x.stroke();
        G.txt(x, SOL[sol].name, tx + tw / 2, 448, { size: 20, color: D.col.ink, weight: 900 }); G.txt(x, met, tx + tw / 2, 30, { size: 26, color: D.col.ink, weight: 900 });
        if (!run) { G.txt(x, '⬇', tx + tw / 2, 56, { size: 22, color: D.col.ink2 }); }
        if (r && run && sol === 'CuSO4' && pr > .5) G.txt(x, T('Cu бөлінді', 'выделилась Cu'), 300, 260, { size: 16, color: '#b45309', weight: 900 });
        if (r && run && sol === 'AgNO3' && pr > .5) G.txt(x, T('Ag бөлінді', 'выделилось Ag'), 300, 260, { size: 16, color: '#64748b', weight: 900 });
      }
    };
  }
});
