/* ===== 1-тарау: Құрылым ===== */

/* ---------- 4. Периодтық жүйедегі орны ---------- */
(function () {
  const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
  const NONM = new Set([1, 2, 6, 7, 8, 9, 10, 15, 16, 17, 18, 34, 35, 36, 53, 54, 86]), META = new Set([5, 14, 32, 33, 51, 52, 85]);
  function pos(z) {
    if (z === 1) return [0, 0]; if (z === 2) return [0, 17];
    if (z <= 4) return [1, z - 3]; if (z <= 10) return [1, 12 + (z - 5)];
    if (z <= 12) return [2, z - 11]; if (z <= 18) return [2, 12 + (z - 13)];
    if (z <= 36) return [3, z - 19]; if (z <= 54) return [4, z - 37];
    if (z <= 56) return [5, z - 55]; if (z <= 71) return [7.3, 2 + (z - 57)];
    if (z <= 86) return [5, 3 + (z - 72)];
    if (z <= 88) return [6, z - 87]; if (z <= 103) return [8.3, 2 + (z - 89)];
    return [6, 3 + (z - 104)];
  }
  const tiles = SYM.map((s, i) => { const z = i + 1, p = pos(z); return { s, z, r: p[0], c: p[1], k: NONM.has(z) ? 'n' : META.has(z) ? 'm' : 'M' }; });
  const KC = { M: '#3b82f6', m: '#8b5cf6', n: '#f59e0b' };
  const ATOMS = [
    { s: 'Na', z: 11, sh: [2, 8, 1], n: ['Натрий', 'Натрий'] },
    { s: 'Mg', z: 12, sh: [2, 8, 2], n: ['Магний', 'Магний'] },
    { s: 'Al', z: 13, sh: [2, 8, 3], n: ['Алюминий', 'Алюминий'] }
  ];
  Deck.add({
    id: 'position', ch: 1, time: 3,
    t: ['Периодтық жүйедегі металдар', 'Металлы в периодической системе'],
    note: ['Металдар — 118 элементтің 90-ынан астамы: олар В–At диагоналінен сол жақта және төмен орналасқан. Оранж түсті нүктелер — сыртқы (валенттік) электрондар. Ерекшеліктер: Sn және Pb-ның сыртқы деңгейінде 4 электрон, Bi-де 5. Атомға басқанда сыртқы электрондар кетеді — катион түзіледі. «Сен білесің бе?» карточкасын оқулықтан берілген күйінде көрсетіңіз; қорғасын мен таллий — улы металдар, сондықтан оларды «миға қажет» деп емес, «мида кездеседі» деп түсіндірген дұрыс.',
      'Металлы — более 90 из 118 элементов: они расположены левее и ниже диагонали B–At. Оранжевые точки — внешние (валентные) электроны. Исключения: у Sn и Pb на внешнем уровне 4 электрона, у Bi — 5. По клику на атом внешние электроны уходят — образуется катион. Карточку «А вы знали?» приводим как в учебнике; свинец и таллий — токсичные металлы, поэтому лучше говорить не «нужны мозгу», а «встречаются в мозге».'],
    fact: ['<p>Біздің миымызға қандай металдар қажет екен? Сонымен миымызда салыстырмалы түрде алтынның, таллийдің, қорғасынның т.б. кейбір элементтердің мөлшері басқа мүшелермен салыстырғанда едәуір артық болады екен.</p><p class="src">Оқулықтан алынған дерек. Қорғасын мен таллий — улы металдар.</p>',
      '<p>Какие металлы нужны нашему мозгу? Оказывается, в мозге относительно больше золота, таллия, свинца и некоторых других элементов, чем в других органах.</p><p class="src">Факт из учебника. Свинец и таллий — токсичные металлы.</p>'],
    bridge: ['Неге металдың сыртқы электрондары «қашқақ»? Енді байланысты қарайық', 'Почему внешние электроны «убегают»? Посмотрим на связь'],
    html: () => `
      <div class="r" style="gap:16px">
        <div class="panel" style="width:700px;height:378px" data-a="l"><div id="ptHost"></div>
          <div class="abs" style="left:112px;top:12px;width:340px">
            <div class="r ctr" style="gap:12px"><span style="font-size:50px;font-weight:900;line-height:1;color:#3b82f6">90+</span><span class="sm" style="line-height:1.15">${L('металл — 118 элементтің ішінде', 'металлов среди 118 элементов')}</span></div>
            <div class="r wrap" style="gap:6px;margin-top:8px"><span class="chip" style="font-size:15px;padding:3px 10px;border-color:#3b82f6"><i class="dot" style="background:#3b82f6;width:10px;height:10px"></i>${L('Металдар', 'Металлы')}</span>
            <span class="chip" style="font-size:15px;padding:3px 10px;border-color:#8b5cf6"><i class="dot" style="background:#8b5cf6;width:10px;height:10px"></i>${L('Жартылай металл', 'Металлоиды')}</span>
            <span class="chip" style="font-size:15px;padding:3px 10px;border-color:#f59e0b"><i class="dot" style="background:#f59e0b;width:10px;height:10px"></i>${L('Бейметалл', 'Неметаллы')}</span></div>
          </div>
        </div>
        <div class="panel" style="width:496px;height:378px;--d:.2s" data-a="r"><div id="atHost"></div>
          <div class="abs sm" style="left:0;right:0;top:12px;text-align:center">${L('Атомды бас: сыртқы электрондар кетеді', 'Нажми на атом — внешний электрон уйдёт')}</div></div>
      </div>
      <div class="key" data-a style="--d:.5s;margin-top:16px"><span class="lb">${L('Негізгі ой', 'Главное')}</span>
        <span class="t">${L('Металл атомының сыртқы қабатында электрон аз (көбіне <b>1–3</b>), ал атом радиусы <b>үлкен</b>. Электрондар ядроға әлсіз тартылады, сондықтан <span class="eo">оңай кетеді</span>.', 'На внешнем уровне у металлов мало электронов (обычно <b>1–3</b>), а радиус атома <b>большой</b>. Электроны слабо притягиваются к ядру и <span class="eo">легко отрываются</span>.')}</span></div>`,
    init(root) {
      const pt = D.cv($('#ptHost', root), 700, 378), at = D.cv($('#atHost', root), 496, 378);
      let prog = 0, t0 = 0;
      const cs = 36, ox = 28, oy = 18;
      const st = ATOMS.map(() => ({ p: 0, on: false }));
      at.c.addEventListener('click', e => {
        const p = at.p(e), i = Math.floor(p.x / (496 / 3)); if (i < 0 || i > 2) return;
        const s = st[i]; s.on = !s.on; D.tween(1.1, v => { s.p = s.on ? v : 1 - v; }, { ease: ease.out }); D.beep(s.on ? 'pop' : 'ok');
      });
      pt.c.style.cursor = at.c.style.cursor = 'pointer';
      return {
        enter() { prog = 0; t0 = 0; st.forEach(s => { s.p = 0; s.on = false; }); },
        tick(dt, now) {
          t0 += dt; prog = clamp((t0 - .5) / 2.6, 0, 1);
          let x = pt.begin();
          tiles.forEach(t => {
            const f = clamp(prog * 1.9 - (t.c + t.r) / 26, 0, 1), px = ox + t.c * cs, py = oy + t.r * cs;
            const base = f > 0 ? KC[t.k] : '#cbd5e1';
            const sc = t.k === 'M' ? 1 + Math.sin(f * Math.PI) * .18 : 1;
            x.save(); x.translate(px + 16, py + 16); x.scale(sc, sc);
            G.rr(x, -16, -16, 32, 32, 7); x.fillStyle = f > 0 ? base : D.col.line; x.globalAlpha = f > 0 ? .55 + .45 * f : 1; x.fill(); x.globalAlpha = 1;
            G.txt(x, t.s, 0, 1, { size: 15, color: f > .3 ? '#fff' : D.col.ink2, weight: 900 }); x.restore();
          });
          if (prog > .75) { // B–At диагоналі
            x.save(); x.setLineDash([7, 6]); x.lineWidth = 3.5; x.strokeStyle = '#e11d48'; x.globalAlpha = clamp((prog - .75) * 4, 0, 1);
            x.beginPath(); x.moveTo(ox + 12 * cs, oy + 1 * cs + 2); x.lineTo(ox + 17 * cs, oy + 6 * cs + 2); x.stroke(); x.restore();
            G.txt(x, 'B', ox + 12.5 * cs + 16, oy + 1 * cs + 16, { size: 15, color: '#fff', weight: 900 });
          }
          /* атомдар */
          x = at.begin();
          ATOMS.forEach((a, i) => {
            const cx = 86 + i * 162, cy = 168, s = st[i], tt = now;
            const R = [22, 41, 60];
            x.lineWidth = 2; x.strokeStyle = D.col.line;
            R.forEach(r => { x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.stroke(); });
            G.ball(x, cx, cy, 15, s.p > .5 ? '#60a5fa' : '#ef4444');
            G.txt(x, '+' + (a.z - (s.p > .5 ? a.sh[2] : 0)), cx, cy + 1, { size: 15, color: '#fff', weight: 900 });
            a.sh.forEach((n, ring) => {
              for (let k = 0; k < n; k++) {
                const outer = ring === 2;
                const ang = k / n * 6.283 + tt * (1.5 - ring * .5) * (ring % 2 ? -1 : 1) + i;
                let rr = R[ring], al = 1;
                if (outer) { rr = R[2] + s.p * 70; al = 1 - s.p; }
                if (al <= 0) continue;
                x.globalAlpha = al; outer ? G.e(x, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 5.5) : G.ball(x, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 4.6, '#7aa7ff'); x.globalAlpha = 1;
              }
            });
            if (s.p > .5) { x.strokeStyle = 'rgba(59,130,246,' + (s.p * .6) + ')'; x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, 70, 0, 6.283); x.stroke(); }
            G.txt(x, a.s + (s.p > .5 ? ['⁺', '²⁺', '³⁺'][a.sh[2] - 1] : ''), cx, 270, { size: 34, color: s.p > .5 ? D.col.ion : D.col.ink, weight: 900 });
            G.txt(x, T(a.n[0], a.n[1]), cx, 306, { size: 17, color: D.col.ink2, weight: 800 });
            G.txt(x, a.sh.join(' · ') + '  e⁻', cx, 332, { size: 18, color: '#ff8a1f', weight: 900 });
          });
        }
      };
    }
  });
})();

/* ---------- 5. Металдық байланыс ---------- */
Deck.add({
  id: 'bond', ch: 1, time: 4,
  t: ['Металдық байланыс қалай түзіледі', 'Как возникает металлическая связь'],
  note: ['Үш қадам. 1) Металл атомының сыртқы қабатында электрон аз (көбіне 1–3). 2) Атом электронын жібереді де, оң зарядты ионға (катионға) айналады. 3) Босаған электрондар бүкіл кристалға ортақ: олар иондардың арасында еркін жүріп, иондарды бір-біріне «жабыстырып» ұстап тұрады — бұл металдық байланыс. Кристалл торының түйіндерінде атомдар мен иондар кезектесіп тұрады, электрондар үнемі бір бөлшектен екіншісіне өтіп отырады. Байланыс бағытсыз — бұл пластикалық қасиеттің кілті. Ұқсату: иондар — балдағы моншақтар; бал (электрондар) оларды жабыстырып тұр, бірақ моншақтар жылжи алады.',
    'Три шага. 1) На внешнем уровне атома металла мало электронов (обычно 1–3). 2) Атом отдаёт электроны и превращается в положительный ион (катион). 3) Освободившиеся электроны становятся общими для всего кристалла: они свободно перемещаются между ионами и «склеивают» их — это металлическая связь. В узлах решётки чередуются атомы и ионы, электроны постоянно переходят от одних к другим. Связь ненаправленная — ключ к пластичности. Аналогия: ионы — шарики в мёде; мёд (электроны) склеивает их, но шарики могут сдвигаться.'],
  fact: ['<p>Ғарышта, ауасыз кеңістікте екі таза металл бөлшегі бір-біріне тиіп кетсе, <b>жабысып қалады</b> (суық дәнекерлеу). Себебі олардың электрондық газы бірден ортақ болып кетеді.</p>',
    '<p>В космосе, в безвоздушном пространстве, две чистые металлические детали при контакте могут <b>намертво слипнуться</b> (холодная сварка): их электронный газ сразу становится общим.</p>'],
  bridge: ['Енді бұл байланыс кристалды қалай құрайтынын көрейік', 'Теперь посмотрим, как эта связь строит кристалл'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="c" style="width:690px;gap:10px">
        <div class="panel" style="width:690px;height:404px" data-a="l"><div id="bondHost"></div></div>
        <div class="r" style="gap:10px"><button class="btn" id="bdPlay"></button><button class="btn ghost" id="bdHon"></button></div>
      </div>
      <div class="c f1" style="gap:10px" id="bdSteps">
        ${[['Атомдар', 'Атомы', 'Металл атомының сыртқы қабатында электрон аз болады (көбіне 1–3).', 'На внешнем уровне атома металла мало электронов (обычно 1–3).'],
          ['Иондар', 'Ионы', 'Атом электронын жібереді де, оң зарядты ионға (катионға) айналады.', 'Атом отдаёт электроны и становится положительным ионом (катионом).'],
          ['Электрондық газ', 'Электронный газ', 'Босаған электрондар иондардың арасында еркін жүреді және оларды бір-біріне тартып ұстап тұрады. Мұны <b>металдық байланыс</b> дейді.', 'Освободившиеся электроны свободно движутся между ионами и удерживают их вместе. Это и есть <b>металлическая связь</b>.']
        ].map((s, i) => `<div class="card bdst" data-i="${i}" data-a="r" style="--d:${.1 + i * .12}s;padding:12px 16px;cursor:pointer"><div class="r" style="gap:12px;align-items:flex-start"><span class="sn" style="margin:0;flex:none">${i + 1}</span><div><b class="ac" style="font-size:22px">${L(s[0], s[1])}</b><div class="t2" style="font-size:20px;line-height:1.3;margin-top:2px">${L(s[2], s[3])}</div></div></div></div>`).join('')}
        <div class="card" data-a="r" style="--d:.5s;padding:10px 16px"><div class="r ctr jc" style="gap:14px"><span class="eq big">Me⁰ → Me<sup>n+</sup> + n e⁻</span></div><div class="sm" style="text-align:center;margin-top:6px;font-size:17px">${L('Me — металл, n — берілген электрон саны', 'Me — металл, n — число отданных электронов')}</div></div>
      </div>
    </div>`,
  init(root) {
    const W = 690, H = 404, cv = D.cv($('#bondHost', root), W, H);
    const cols = 7, rows = 4, x0 = 51, y0 = 130, dx = 98, dy = 62;
    const atoms = [], es = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) atoms.push({ x: x0 + dx * i, y: y0 + dy * j, ion: false, ph: rnd(0, 6.28) });
    atoms.forEach(a => es.push({ a, ang: rnd(0, 6.28), free: false, x: 0, y: 0, vx: 0, vy: 0 }));
    const R = { x: 6, y: 78, w: W - 12, h: 270 };
    let phase = 0, honey = false, glow = 0, t = 0, auto = false;
    const steps = $$('.bdst', root), play = $('#bdPlay', root), hon = $('#bdHon', root);
    const CAP = [['1. Атомдардың сыртқы электрондары бар', '1. У атомов есть внешние электроны'], ['2. Электрондар кетеді, атомдар иондарға айналады', '2. Электроны уходят, атомы становятся ионами'], ['3. Электрондық газ иондарды ұстап тұр', '3. Электронный газ удерживает ионы']];
    const sync = () => {
      steps.forEach((s, i) => { s.style.outline = i === phase ? '4px solid var(--ac)' : 'none'; s.style.opacity = i <= phase ? 1 : .55; });
      play.textContent = auto ? T('■ Тоқтату', '■ Стоп') : T('▶ Автоойнату', '▶ Автозапуск');
      hon.textContent = honey ? T('Балды жасыру', 'Скрыть мёд') : T('🍯 Бал үлгісі', '🍯 Модель с мёдом'); hon.disabled = phase < 2;
    };
    const setPhase = p => {
      if (p === phase && p !== 0) { sync(); return; }
      phase = p; honey = false;
      if (p === 0) es.forEach(e => { e.free = false; e.a.ion = false; });
      else if (p >= 1) es.forEach((e, i) => { if (e.free) return; D.later(() => { e.free = true; e.x = e.a.x + Math.cos(e.ang) * 34; e.y = e.a.y + Math.sin(e.ang) * 34; const a = rnd(0, 6.28); e.vx = Math.cos(a) * 60; e.vy = Math.sin(a) * 60; D.later(() => { e.a.ion = true; }, 150); }, i * 45); });
      sync(); D.beep('pop');
    };
    steps.forEach(s => s.onclick = () => { auto = false; setPhase(+s.dataset.i); });
    play.onclick = () => { auto = !auto; if (auto) { setPhase(0); D.later(() => auto && setPhase(1), 2200); D.later(() => auto && setPhase(2), 5200); D.later(() => { auto = false; sync(); }, 9000); } sync(); };
    hon.onclick = () => { honey = !honey; sync(); D.beep('pop'); };
    return {
      lang: sync,
      enter() { auto = true; phase = -1; setPhase(0); D.later(() => auto && setPhase(1), 2200); D.later(() => auto && setPhase(2), 5200); D.later(() => { auto = false; sync(); }, 9000); },
      tick(dt) {
        t += dt; const x = cv.begin();
        glow += ((phase >= 2 ? 1 : 0) - glow) * Math.min(1, dt * 3);
        G.txt(x, T(CAP[phase][0], CAP[phase][1]), W / 2, 34, { size: 22, color: D.col.ink, weight: 900 });
        G.rr(x, R.x, R.y, R.w, R.h, 26); x.fillStyle = 'rgba(255,138,31,' + (.12 * glow * (.8 + .2 * Math.sin(t * 3))) + ')'; x.fill();
        if (honey) { const g = x.createLinearGradient(0, R.y, 0, R.y + R.h); g.addColorStop(0, 'rgba(245,184,28,.6)'); g.addColorStop(1, 'rgba(217,130,20,.6)'); G.rr(x, R.x, R.y, R.w, R.h, 26); x.fillStyle = g; x.fill(); x.strokeStyle = 'rgba(180,100,10,.7)'; x.lineWidth = 3; x.stroke(); }
        atoms.forEach(a => {
          const px = a.x + Math.sin(t * 2 + a.ph) * 1.6, py = a.y + Math.cos(t * 2.3 + a.ph) * 1.6;
          if (a.ion) G.ion(x, px, py, 24, '+', honey ? '#2b6fe0' : D.col.ion); else G.ball(x, px, py, 24, '#94a3b8');
        });
        es.forEach(e => {
          if (!e.free) { e.ang += dt * 2.2; G.e(x, e.a.x + Math.cos(e.ang) * 36, e.a.y + Math.sin(e.ang) * 36, 5); }
          else {
            if (Math.random() < dt * 1.2) { const a = rnd(0, 6.28), s = rnd(35, 95); e.vx = Math.cos(a) * s; e.vy = Math.sin(a) * s; }
            e.x += e.vx * dt; e.y += e.vy * dt;
            if (e.x < R.x + 8) { e.x = R.x + 8; e.vx = Math.abs(e.vx); } if (e.x > R.x + R.w - 8) { e.x = R.x + R.w - 8; e.vx = -Math.abs(e.vx); }
            if (e.y < R.y + 8) { e.y = R.y + 8; e.vy = Math.abs(e.vy); } if (e.y > R.y + R.h - 8) { e.y = R.y + R.h - 8; e.vy = -Math.abs(e.vy); }
            G.e(x, e.x, e.y, 5);
          }
        });
        if (phase >= 2) { const near = es.filter(e => e.free).slice(0, 10); x.strokeStyle = 'rgba(255,138,31,.55)'; x.lineWidth = 2; x.setLineDash([4, 5]); near.forEach(e => { let best = null, bd = 1e9; atoms.forEach(a => { const d = Math.hypot(a.x - e.x, a.y - e.y); if (d < bd) { bd = d; best = a; } }); if (best && bd < 110) { x.beginPath(); x.moveTo(e.x, e.y); x.lineTo(best.x, best.y); x.stroke(); } }); x.setLineDash([]); }
        /* белгілер */
        const lg = [['#94a3b8', T('атом', 'атом')], ['#3b82f6', T('ион (+)', 'ион (+)')], ['#ff8a1f', T('электрон (e⁻)', 'электрон (e⁻)')]];
        lg.forEach((l, i) => { const lx = 40 + i * 215; if (i === 1) G.ion(x, lx, 376, 13, '+'); else if (i === 2) G.e(x, lx, 376, 7); else G.ball(x, lx, 376, 13, l[0]); G.txt(x, l[1], lx + 24, 377, { size: 19, color: D.col.ink, weight: 800, align: 'left' }); });
      }
    };
  }
});

/* ---------- 6. Кристалл тор қалай түзіледі (Демонстрация № 4) ---------- */
Deck.add({
  id: 'lattice', ch: 1, time: 3,
  t: ['Кристалл тор қалай түзіледі', 'Как образуется кристаллическая решётка'],
  note: ['Демонстрация № 4: «Металдардың кристалл торларының модельдері». Көрсету кезінде кубтық көлемді орталықтанған, кубтық бүйірлі орталықтанған және гексагоналды торлардың шар-таяқшалы модельдерін көрсетіңіз. Шарларды (моншақ, апельсин) қорапқа салуға болады: екінші қабат бірінші қабаттың шұңқырларына өзі отырады.',
    'Демонстрация № 4: «Модели кристаллических решёток металлов». Во время показа продемонстрируйте шаростержневые модели ОЦК, ГЦК, ГПУ. Можно уложить шарики (бусины, апельсины) в коробку: второй слой сам ложится в лунки первого.'],
  bridge: ['Қандай тор түрлері бар? Үшеуін 3D-да айналдырып көрейік', 'Какие бывают решётки? Покрутим три типа в 3D'],
  html: () => `
    <div class="r" style="gap:20px">
      <div class="panel" style="width:720px;height:440px" data-a="l"><div id="latHost"></div>
        <div class="abs chip k" id="latTag" style="left:16px;top:14px;font-size:18px"></div>
        <div class="abs" style="left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:10px"><button class="btn sm ghost" id="latPlay"></button></div>
      </div>
      <div class="c f1" style="gap:12px" id="latSteps">
        <div class="card step" data-s="0" data-a="r" style="--d:.1s"><div class="r ctr"><span class="sn">1</span><div><b class="ac" style="font-size:22px">${L('Иондану', 'Ионизация')}</b><div class="t2" style="font-size:20px">${L('Балқыма қатқанда атомдар сыртқы электрондарын береді.', 'Когда расплав застывает, атомы отдают внешние электроны.')}</div></div></div></div>
        <div class="card step" data-s="1" data-a="r" style="--d:.2s"><div class="r ctr"><span class="sn">2</span><div><b class="ac" style="font-size:22px">${L('Электрондық газ', 'Электронный газ')}</b><div class="t2" style="font-size:20px">${L('Бос электрондар иондардың арасын толтырып, оларды «жабыстырады».', 'Свободные электроны заполняют пространство между ионами и «склеивают» их.')}</div></div></div></div>
        <div class="card step" data-s="2" data-a="r" style="--d:.3s"><div class="r ctr"><span class="sn">3</span><div><b class="ac" style="font-size:22px">${L('Тығыз орналасу', 'Плотная упаковка')}</b><div class="t2" style="font-size:20px">${L('Байланыс бағытсыз болғандықтан, иондар қораптағы шарлар сияқты барынша тығыз жиналады.', 'Связь ненаправленная, поэтому ионы укладываются как можно плотнее — как шары в коробке.')}</div></div></div></div>
        <div class="key" data-a="pop" style="--d:.5s"><span class="lb">${L('Есте сақта', 'Запомни')}</span><span class="t" style="font-size:19px">${L('Тордың ең кішкентай қайталанатын бөлігі — <b>элементар ұяшық</b>. Металдарда негізінен үш түрлі ұяшық кездеседі (келесі экран).', 'Наименьший повторяющийся фрагмент решётки — <b>элементарная ячейка</b>. У металлов три главных типа ячеек (следующий экран).')}</span></div>
      </div>
    </div>`,
  init(root) {
    const cv = D.cv($('#latHost', root), 720, 440);
    const cols = 9, rows = 6, sp = 56, ox = 360 - (cols - 1) * sp / 2, oy = 70;
    const P = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const tx = ox + i * sp + (j % 2 ? sp / 4 : 0) - sp / 8, ty = oy + 18 + j * sp * .87 + 6;
      P.push({ x: rnd(40, 680), y: rnd(70, 400), vx: rnd(-80, 80), vy: rnd(-80, 80), tx, ty, e: { ang: rnd(0, 6.28), x: 0, y: 0, vx: 0, vy: 0 }, ion: false, free: false });
    }
    let phase = 0, play = false, t = 0, settle = 0;
    const steps = $$('.step', root);
    const sync = () => {
      steps.forEach(s => s.style.outline = +s.dataset.s === phase ? '4px solid var(--ac)' : 'none');
      $('#latPlay', root).innerHTML = play ? T('■ Тоқтату', '■ Стоп') : T('▶ Анимацияны қосу', '▶ Запустить анимацию');
      $('#latTag', root).innerHTML = [T('Балқыма: атомдар еркін қозғалады', 'Расплав: атомы движутся свободно'), T('Атомдар иондарға айналады, электрондар босайды', 'Атомы становятся ионами, электроны освобождаются'), T('Иондар тор түйіндеріне орналасады', 'Ионы занимают узлы решётки')][phase];
    };
    const setPhase = p => {
      phase = p; settle = 0;
      if (p === 0) P.forEach(a => { a.ion = false; a.free = false; });
      if (p >= 1) P.forEach((a, i) => D.later(() => { if (a.free) return; a.free = true; a.e.x = a.x + 14; a.e.y = a.y; const g = rnd(0, 6.28); a.e.vx = Math.cos(g) * 70; a.e.vy = Math.sin(g) * 70; D.later(() => { a.ion = true; }, 100); }, p === 1 ? i * 25 : 0));
      sync(); D.beep('pop');
    };
    steps.forEach(s => s.onclick = () => { play = false; setPhase(+s.dataset.s); });
    $('#latPlay', root).onclick = () => {
      play = !play; sync();
      if (play) { setPhase(0); D.later(() => play && setPhase(1), 1800); D.later(() => play && setPhase(2), 4600); D.later(() => { play = false; sync(); }, 9000); }
    };
    return {
      lang: sync,
      enter() { play = false; phase = 0; P.forEach(a => { a.ion = false; a.free = false; a.x = rnd(40, 680); a.y = rnd(70, 400); }); sync(); },
      tick(dt) {
        t += dt; const x = cv.begin(); if (phase === 2) settle = Math.min(1, settle + dt * .5);
        if (phase === 2 && settle > .8) { G.rr(x, ox - 40, oy + 6, (cols - 1) * sp + 80, rows * sp * .87 + 30, 30); x.strokeStyle = 'rgba(59,130,246,.35)'; x.lineWidth = 4; x.setLineDash([10, 8]); x.stroke(); x.setLineDash([]); }
        P.forEach(a => {
          if (phase < 2) {
            a.x += a.vx * dt; a.y += a.vy * dt;
            if (a.x < 30 || a.x > 690) a.vx *= -1; if (a.y < 62 || a.y > 410) a.vy *= -1;
            if (Math.random() < dt) { a.vx = rnd(-90, 90); a.vy = rnd(-90, 90); }
          } else { const k = 1 - Math.exp(-dt * 3.2); a.x += (a.tx - a.x) * k; a.y += (a.ty - a.y) * k; }
          if (a.ion) G.ion(x, a.x, a.y, 20, '+'); else G.ball(x, a.x, a.y, 20, '#94a3b8');
          const e = a.e;
          if (!a.free) { e.ang += dt * 3; G.e(x, a.x + Math.cos(e.ang) * 28, a.y + Math.sin(e.ang) * 28, 4); }
          else {
            if (Math.random() < dt * 1.5) { const g = rnd(0, 6.28), s = rnd(40, 100); e.vx = Math.cos(g) * s; e.vy = Math.sin(g) * s; }
            e.x += e.vx * dt; e.y += e.vy * dt;
            if (e.x < 25 || e.x > 695) e.vx *= -1; if (e.y < 60 || e.y > 415) e.vy *= -1;
            G.e(x, e.x, e.y, 4);
          }
        });
      }
    };
  }
});

/* ---------- 7. Үш тор түрі (3D) ---------- */
(function () {
  function cell(kind) {
    const A = [], E = [];
    if (kind === 'bcc' || kind === 'fcc') {
      const c = []; for (const x of [-.5, .5]) for (const y of [-.5, .5]) for (const z of [-.5, .5]) { c.push([x, y, z]); A.push({ p: [x, y, z] }); }
      for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { let d = 0; for (let k = 0; k < 3; k++) if (c[i][k] !== c[j][k]) d++; if (d === 1) E.push([c[i], c[j]]); }
      if (kind === 'bcc') A.push({ p: [0, 0, 0], sp: 1 });
      else [[.5, 0, 0], [-.5, 0, 0], [0, .5, 0], [0, -.5, 0], [0, 0, .5], [0, 0, -.5]].forEach(p => A.push({ p, sp: 1 }));
    } else {
      const a = .66, h = 1.633 * a, top = [], bot = [];
      for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; top.push([Math.cos(an) * a, h / 2, Math.sin(an) * a]); bot.push([Math.cos(an) * a, -h / 2, Math.sin(an) * a]); }
      top.concat(bot).forEach(p => A.push({ p })); A.push({ p: [0, h / 2, 0] }, { p: [0, -h / 2, 0] });
      for (let k = 0; k < 6; k++) { E.push([top[k], top[(k + 1) % 6]], [bot[k], bot[(k + 1) % 6]], [top[k], bot[k]]); }
      [30, 150, 270].forEach(d => { const an = d * Math.PI / 180, r = a / Math.sqrt(3); A.push({ p: [Math.cos(an) * r, 0, Math.sin(an) * r], sp: 1 }); });
    }
    return { A, E };
  }
  const CELLS = { bcc: cell('bcc'), fcc: cell('fcc'), hcp: cell('hcp') };
  const TOUCH = { bcc: .433, fcc: .3536, hcp: .33 };
  Deck.cell3d = { CELLS, TOUCH };
  Deck.add({
    id: 'cells', ch: 1, time: 4,
    t: ['Металл кристалл торларының үш түрі', 'Три типа кристаллических решёток металлов'],
    note: ['Оқулықтағы сурет бойынша үш тор: а) кубтық көлемді орталықтанған (ОЦК), б) кубтық бүйірлі орталықтанған (ГЦК), в) гексагоналды (ГПУ). Қызғылт сары атомдар торды бір-бірінен ерекшелейді: көлемді орталықтанған торда — кубтың ортасындағы атом, бүйірлі орталықтанған торда — беттердің ортасындағы 6 атом, гексагоналды торда — ортаңғы қабаттағы 3 атом. Төмендегі сырғытқышпен атомдарды үлкейтіп, бір-біріне тигізіңіз: сонда көлемнің қаншасы атоммен толатыны көрінеді (68 % және 74 %). Ұяшықтарды тышқанмен немесе саусақпен айналдыруға болады. Металдар тізімі — оқулықтан (кейбір металдар, мысалы никель, температураға қарай торын өзгертеді; магний де гексагоналды тор түзеді).',
      'Три решётки по рисунку учебника: а) объёмно-центрированная кубическая (ОЦК), б) гранецентрированная кубическая (ГЦК), в) гексагональная плотноупакованная (ГПУ). Оранжевым выделены атомы, которые отличают ячейку: центр куба в ОЦК, центры граней в ГЦК, средний слой в ГПУ. Ползунком увеличивайте атомы до касания — так видна плотность упаковки (68 % и 74 %). Ячейки можно вращать мышью или пальцем. Списки металлов — из учебника (у некоторых металлов, например никеля, решётка зависит от температуры; магний тоже имеет ГПУ-решётку).'],
    fact: ['<p>Темір <b>қыздырғанда торын өзгертеді</b>: 912 °C-тан төмен ол кубтық көлемді орталықтанған (α-темір), одан жоғары — кубтық бүйірлі орталықтанған (γ-темір) тор түзеді. Болатты шынықтыру осы құбылысқа негізделген.</p>',
      '<p>Железо <b>меняет решётку при нагревании</b>: ниже 912 °C оно ОЦК (α-железо), выше — ГЦК (γ-железо). На этом основана закалка стали.</p>'],
    bridge: ['Тор түрі металдың қасиетіне қалай әсер етеді?', 'Как тип решётки влияет на свойства металла?'],
    html: () => `
      <div class="r" style="gap:14px">${['bcc', 'fcc', 'hcp'].map((k, i) => { const f = Deck.LAT[k]; return `<div class="card" data-a="pop" style="--d:${.08 + i * .12}s;width:390px;height:482px;padding:12px 16px">
        <div class="r ctr" style="gap:12px"><span class="sn" style="margin:0;width:44px;height:44px;font-size:24px;text-transform:lowercase">${L(f.letter, k === 'bcc' ? 'а' : k === 'fcc' ? 'б' : 'в')}</span><h3 style="font-size:28px;color:var(--ac)">${L(f.s[0], f.s[1])}</h3></div>
        <div class="cvh cc" data-k="${k}" style="margin:2px 0"></div>
        <div class="t2" style="font-size:19px;font-weight:800;color:var(--ink);line-height:1.25;min-height:48px">${L(f.full[0] + ' тор', f.full[1] + ' решётка')}</div>
        <div class="t2" style="font-size:19px;line-height:1.25;min-height:50px"><span class="eo">●</span> ${L(f.odd[0], f.odd[1])}</div>
        <div class="r" style="gap:8px;margin:6px 0"><span class="chip" style="font-size:18px">${L('Көрші атом: ', 'Соседей: ')}<b>${f.nb}</b></span><span class="chip" style="font-size:18px">${L('Толу: ', 'Занято: ')}<b>${f.pk} %</b></span></div>
        <div class="r wrap" style="gap:6px">${f.ex.map(e => `<span class="chip k" style="font-size:18px;padding:3px 10px">${e}</span>`).join('')}</div></div>`; }).join('')}</div>
      <div class="r ctr" style="gap:16px;margin-top:10px;padding:0 6px"><span class="t2" style="font-size:19px;white-space:nowrap">${L('Атом өлшемі:', 'Размер атомов:')}</span><input type="range" id="cellSize" min="0" max="100" value="40" style="flex:1"><b class="num" id="cellSz" style="min-width:84px;font-size:20px"></b></div>`,
    init(root) {
      const cvs = $$('.cc', root).map(h => ({ k: h.dataset.k, cv: D.cv(h, 358, 190) }));
      let yaw = .6, pitch = .45, size = .4, auto = true, drag = null;
      const sz = $('#cellSize', root), szl = $('#cellSz', root);
      sz.oninput = () => { size = sz.value / 100; };
      cvs.forEach(c => D.drag(c.cv, { down(p) { auto = false; drag = p; }, move(p) { if (drag) { yaw += (p.x - drag.x) * .012; pitch = clamp(pitch + (p.y - drag.y) * .012, -1.3, 1.3); drag = p; } }, up() { drag = null; D.later(() => { auto = true; }, 2000); } }));
      return {
        tick(dt) {
          if (auto) yaw += dt * .6;
          szl.textContent = size > .985 ? T('тиеді', 'касание') : Math.round(size * 100) + ' %';
          const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
          cvs.forEach(({ k, cv }) => {
            const x = cv.begin(), S = 140, cx = 179, cy = 98, c = CELLS[k], r = lerp(.06, TOUCH[k], size);
            const prj = p => { const x1 = p[0] * cyw + p[2] * syw, z1 = -p[0] * syw + p[2] * cyw, y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp, f = 5 / (5 + z2); return { x: cx + x1 * S * f, y: cy + y2 * S * f, d: z2, f }; };
            x.strokeStyle = 'rgba(100,116,139,.6)'; x.lineWidth = 2;
            c.E.forEach(e => { const a = prj(e[0]), b = prj(e[1]); x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); });
            c.A.map(a => ({ a, q: prj(a.p) })).sort((u, v) => v.q.d - u.q.d).forEach(({ a, q }) => G.ball(x, q.x, q.y, r * S * q.f, a.sp ? '#ff8a1f' : '#6d8fe0'));
          });
        }
      };
    }
  });
})();

/* ---------- 8. Құрылым → қасиет ---------- */
Deck.add({
  id: 'struct', ch: 1, time: 3,
  t: ['Тор түрі металдың қасиетін қалай өзгертеді', 'Как тип решётки влияет на свойства металла'],
  note: ['Үш карточканың әрқайсысында атом қабаттарының сырғуы көрсетілген. Тығыз қапталған торда (бүйірлі куб) қабаттар оңай сырғиды — металл иілгіш. Көлемді орталықтанған торда сырғу қиынырақ — металл берік, қатты, қиын балқиды. Гексагоналды торда қабаттар тек бір жазықтықта сырғиды — бөлме температурасында металл нашар соғылады. Натрий мен вольфрам мысалы: екеуінде де көлемді орталықтанған тор, бірақ W 3422 °C-та, ал Na 98 °C-та балқиды. Демек, тор түрі қасиеттің жалғыз себебі емес: қасиет тор түріне де, металдық байланыстың беріктігіне де (атом қанша электрон береді, атомның радиусы қандай) байланысты.',
    'В каждой карточке показано скольжение слоёв атомов. В плотноупакованной решётке (ГЦК) слои скользят легко — металл пластичный. В ОЦК скольжение труднее — металл прочный, твёрдый, тугоплавкий. В ГПУ слои скользят лишь в одной плоскости — металл при комнатной температуре плохо куётся. Пример с натрием и вольфрамом: у обоих ОЦК-решётка, но W плавится при 3422 °C, а Na — при 98 °C. Тип решётки — не единственная причина свойств: они зависят и от типа решётки, и от прочности металлической связи (сколько электронов отдаёт атом, каков его радиус).'],
  bridge: ['Енді әр қасиетті жеке көрейік: бәрінің түбі — электрондық газ', 'Теперь разберём каждое свойство: у всех корень — электронный газ'],
  html: () => `
    <div class="r" style="gap:14px">${[
      ['fcc', Deck.LAT.fcc.s, 'Cu · Al · Au · Ag', 'Атом қабаттары өте тығыз орналасқан және бір-бірінің үстімен оңай сырғиды. Сондықтан металл иіледі, созылады.', 'Слои атомов уложены очень плотно и легко скользят друг по другу. Поэтому металл гнётся и вытягивается.', 'Қабаттар оңай сырғиды', 'Слои скользят легко', 'ok'],
      ['bcc', Deck.LAT.bcc.s, 'Fe · Cr · W · Mo', 'Қабаттар сәл сирегірек орналасқан, сырғу қиынырақ. Бұл металдар берік, қатты және қиын балқиды.', 'Слои уложены чуть реже, скользить им труднее. Эти металлы прочные, твёрдые и тугоплавкие.', 'Қабаттар қиын сырғиды', 'Слои скользят трудно', 'mid'],
      ['hcp', Deck.LAT.hcp.s, 'Be · Ti · Zn · Cd', 'Қабаттар тек бір бағытта сырғиды. Сондықтан бөлме температурасында мұндай металдар нашар соғылады.', 'Слои скользят лишь в одном направлении, поэтому такие металлы при комнатной температуре плохо куются.', 'Тек бір бағытта', 'Только в одном направлении', 'bad']
    ].map((c, i) => `<div class="card" data-a="pop" style="--d:${.08 + i * .12}s;width:390px;padding:12px 16px"><div class="r ctr sb2"><h3 style="font-size:25px;color:var(--ac);white-space:nowrap">${L(c[1][0], c[1][1])}</h3><span class="chip k" style="font-size:17px;padding:3px 9px;white-space:nowrap">${c[2]}</span></div>
      <div class="cvh sl" data-k="${c[0]}" style="margin:4px 0 2px"></div>
      <div class="chip" style="font-size:17px;margin-bottom:6px"><b class="${c[7] === 'ok' ? 'ok' : c[7] === 'bad' ? 'bad' : 'ac'}">${c[7] === 'ok' ? '✓' : c[7] === 'bad' ? '✕' : '≈'}</b> ${L(c[5], c[6])}</div>
      <div class="t2" style="font-size:19px;line-height:1.28;min-height:100px">${L(c[3], c[4])}</div></div>`).join('')}</div>
    <div class="r" style="gap:14px;margin-top:10px">
      <div class="card f1" data-a="l" style="--d:.5s;padding:12px 18px"><div class="lbl" style="margin-bottom:4px;font-size:17px">${L('Тор бірдей, қасиет әртүрлі!', 'Решётка одна, а свойства разные!')}</div>
        <div class="t2" style="font-size:19px;line-height:1.28;margin-bottom:4px">${L('Na мен W — екеуінің торы бірдей (көлемді куб). Бірақ балқу температурасы мүлде басқа:', 'У Na и W решётка одна (ОЦК). Но температуры плавления совсем разные:')}</div>
        <div class="r ctr" style="gap:10px"><b style="width:34px;font-size:20px">Na</b><div class="bar" style="flex:1;height:20px"><i id="barNa" style="background:#f59e0b"></i></div><b class="num" style="width:96px;text-align:right;font-size:20px">98 °C</b></div>
        <div class="r ctr" style="gap:10px;margin-top:4px"><b style="width:34px;font-size:20px">W</b><div class="bar" style="flex:1;height:20px"><i id="barW" style="background:#ef4444"></i></div><b class="num" style="width:96px;text-align:right;font-size:20px">3422 °C</b></div></div>
      <div class="key" data-a="r" style="--d:.7s;width:450px;flex-direction:column;align-items:flex-start;gap:4px;padding:10px 16px"><span class="lb">${L('Қорытынды', 'Вывод')}</span><span class="t" style="font-size:18px;line-height:1.28">${L('Металдың қасиеті екі нәрсеге байланысты: <b>тор түріне</b> және <b>металдық байланыстың беріктігіне</b>. Натрийде атом тек 1 электрон береді — байланыс әлсіз. Вольфрамда байланыс өте мықты.', 'Свойства зависят от <b>типа решётки</b> и от <b>прочности металлической связи</b>. У натрия атом отдаёт всего 1 электрон — связь слабая. У вольфрама связь очень прочная.')}</span></div>
    </div>`,
  init(root) {
    const cvs = $$('.sl', root).map(h => ({ k: h.dataset.k, cv: D.cv(h, 358, 112) }));
    let t = 0;
    return {
      enter() { t = 0; const a = $('#barNa', root), b = $('#barW', root); a.style.width = '0'; b.style.width = '0'; D.later(() => { a.style.width = (98 + 60) / 3500 * 100 + '%'; b.style.width = (3422 + 60) / 3500 * 100 + '%'; }, 900); },
      tick(dt) {
        t += dt;
        cvs.forEach(({ k, cv }) => {
          const x = cv.begin(), sp = 40, rows = 4, cols = 9, r = 14;
          const cyc = (t * (k === 'fcc' ? .55 : k === 'bcc' ? .35 : .45)) % 1;
          let shift;
          if (k === 'fcc') shift = ease.inout(Math.min(1, cyc * 1.2)) * sp;
          else if (k === 'bcc') shift = (cyc < .55 ? ease.inout(cyc / .55) * .45 : .45 - ease.inout((cyc - .55) / .45) * .45) * sp + (cyc < .55 ? Math.sin(t * 35) * 1.4 : 0);
          else shift = ease.inout(Math.min(1, cyc * 1.3)) * sp * .85;
          for (let j = 0; j < rows; j++) for (let i = -1; i < cols + 1; i++) {
            const top = j < 2, px = 20 + i * sp + (j % 2 ? sp / 2 : 0) + (top ? shift : 0), py = 16 + j * 26;
            if (px < 4 || px > 354) continue; G.ball(x, px, py, r, top ? '#6d8fe0' : '#93a8d8');
          }
          x.setLineDash([6, 5]); x.strokeStyle = 'rgba(239,68,68,.65)'; x.lineWidth = 3; x.beginPath(); x.moveTo(4, 43); x.lineTo(354, 43); x.stroke(); x.setLineDash([]);
          const pw = k === 'fcc' ? 1 : k === 'bcc' ? .5 : .7;
          G.arrow(x, 8, 106, 8 + 70 * pw + 20, 106, '#ef4444', 4);
          if (k === 'hcp') { G.txt(x, '↕ ✕', 330, 92, { size: 20, color: '#ef4444', weight: 900 }); }
        });
      }
    };
  }
});
