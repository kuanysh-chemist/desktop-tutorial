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
            <div class="r ctr" style="gap:12px"><span style="font-size:50px;font-weight:900;line-height:1;color:#3b82f6">90+</span><span class="sm" style="line-height:1.15">${L('металл — барлық 118 элементтің ішінде', 'металлов среди 118 элементов')}</span></div>
            <div class="r wrap" style="gap:6px;margin-top:8px"><span class="chip" style="font-size:13px;padding:3px 10px;border-color:#3b82f6"><i class="dot" style="background:#3b82f6;width:10px;height:10px"></i>${L('Металдар', 'Металлы')}</span>
            <span class="chip" style="font-size:13px;padding:3px 10px;border-color:#8b5cf6"><i class="dot" style="background:#8b5cf6;width:10px;height:10px"></i>${L('Жартылай металл', 'Металлоиды')}</span>
            <span class="chip" style="font-size:13px;padding:3px 10px;border-color:#f59e0b"><i class="dot" style="background:#f59e0b;width:10px;height:10px"></i>${L('Бейметалл', 'Неметаллы')}</span></div>
          </div>
        </div>
        <div class="panel" style="width:496px;height:378px;--d:.2s" data-a="r"><div id="atHost"></div>
          <div class="abs sm" style="left:0;right:0;top:12px;text-align:center">${L('Атомды бас — сыртқы электрон кетеді', 'Нажми на атом — внешний электрон уйдёт')}</div></div>
      </div>
      <div class="key" data-a style="--d:.5s;margin-top:16px"><span class="lb">${L('Негізгі ой', 'Главное')}</span>
        <span class="t">${L('Металдың сыртқы деңгейінде электрон аз (көбіне <b>1–3</b>), атом радиусы <b>үлкен</b>. Электрондар ядроға әлсіз тартылады, сондықтан <span class="eo">оңай кетеді</span>.', 'На внешнем уровне у металлов мало электронов (обычно <b>1–3</b>), а радиус атома <b>большой</b>. Электроны слабо притягиваются к ядру и <span class="eo">легко отрываются</span>.')}</span></div>`,
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
            G.txt(x, t.s, 0, 1, { size: 13, color: f > .3 ? '#fff' : D.col.ink2, weight: 900 }); x.restore();
          });
          if (prog > .75) { // B–At диагоналі
            x.save(); x.setLineDash([7, 6]); x.lineWidth = 3.5; x.strokeStyle = '#e11d48'; x.globalAlpha = clamp((prog - .75) * 4, 0, 1);
            x.beginPath(); x.moveTo(ox + 12 * cs, oy + 1 * cs + 2); x.lineTo(ox + 17 * cs, oy + 6 * cs + 2); x.stroke(); x.restore();
            G.txt(x, 'B', ox + 12.5 * cs + 16, oy + 1 * cs + 16, { size: 13, color: '#fff', weight: 900 });
          }
          /* атомдар */
          x = at.begin();
          ATOMS.forEach((a, i) => {
            const cx = 86 + i * 162, cy = 168, s = st[i], tt = now;
            const R = [22, 41, 60];
            x.lineWidth = 2; x.strokeStyle = D.col.line;
            R.forEach(r => { x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.stroke(); });
            G.ball(x, cx, cy, 15, s.p > .5 ? '#60a5fa' : '#ef4444');
            G.txt(x, '+' + (a.z - (s.p > .5 ? a.sh[2] : 0)), cx, cy + 1, { size: 13, color: '#fff', weight: 900 });
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
            G.txt(x, T(a.n[0], a.n[1]), cx, 306, { size: 16, color: D.col.ink2, weight: 800 });
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
  t: ['Иондар «электрондық газда»', 'Ионы в «электронном газе»'],
  note: ['Атомдар сыртқы электрондарын беріп, катионға айналады. Бұл электрондар бүкіл кристалға ортақ және иондар арасында еркін қозғалады. Кристалл торының түйіндерінде атомдар мен иондар кезектеседі: электрондар үнемі бір бөлшектен екіншісіне өтіп тұрады. Байланыс бағытсыз — бұл пластикалық қасиеттің кілті. Ұқсату: иондар — балдағы моншақтар; бал (электрондар) оларды жабыстырып тұр, бірақ моншақтар жылжи алады.',
    'Атомы металла отдают внешние электроны и превращаются в катионы. Эти электроны становятся общими для всего кристалла и свободно перемещаются между ионами. В узлах решётки чередуются атомы и ионы: электроны постоянно переходят от одних к другим. Связь ненаправленная — ключ к пластичности. Аналогия: ионы — шарики в мёде; мёд (электроны) склеивает их, но шарики могут сдвигаться.'],
  fact: ['<p>Ғарышта, вакуумда екі таза металл бөлшегі бір-біріне тиіп кетсе, <b>жабысып қалады</b> (суық дәнекерлеу). Электрондық газ екі бөліктің арасында бірден ортақ болып кетеді.</p>',
    '<p>В космосе, в вакууме, две чистые металлические детали при контакте могут <b>намертво слипнуться</b> (холодная сварка): электронный газ сразу становится общим для обеих.</p>'],
  bridge: ['Бұл байланыс кристалды қалай құрайды? Тор түзілуін көрейік', 'Как эта связь строит кристалл? Посмотрим, как возникает решётка'],
  html: () => `
    <div class="r" style="gap:20px">
      <div style="width:640px" class="c">
        <div class="panel" style="width:640px;height:392px" data-a="l"><div id="bondHost"></div>
          <div class="abs r" style="left:16px;bottom:14px;gap:10px">
            <button class="btn sm" id="bRel"></button><button class="btn sm ghost" id="bHon"></button>
          </div>
          <div class="abs chip k" id="bTag" style="right:16px;top:14px"></div>
        </div>
        <div class="card" data-a style="--d:.35s"><span class="t2">${L('<b>Ұқсату:</b> иондар — балдағы моншақтар. Бал — электрондар: оларды жабыстырып тұр, бірақ моншақтар жылжи алады.', '<b>Аналогия:</b> ионы — шарики в мёде. Мёд — электроны: он склеивает их, но шарики могут сдвигаться.')}</span></div>
      </div>
      <div class="c f1" style="gap:14px">
        <div class="card" data-a="r" style="--d:.15s"><div class="t">${L('Атомдар сыртқы электрондарын береді → <b class="io">катиондар</b>. Бұл электрондар — бүкіл кристалға <b class="eo">ортақ</b>.', 'Атомы отдают внешние электроны → <b class="io">катионы</b>. Эти электроны становятся <b class="eo">общими</b> для всего кристалла.')}</div></div>
        <div style="text-align:center;--d:.3s" data-a="pop"><span class="eq big">Me⁰ ⇄ Me<sup>n+</sup> + n e⁻</span></div>
        <div class="key" data-a="r" style="--d:.45s;flex-direction:column;align-items:flex-start;gap:8px"><span class="lb">${L('Анықтама', 'Определение')}</span>
          <span class="t">${L('<b>Металдық байланыс</b> — оң иондар мен олардың арасындағы ортақ еркін электрондар арасындағы байланыс.', '<b>Металлическая связь</b> — связь между положительными ионами металла посредством обобществлённых свободных электронов.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const cv = D.cv($('#bondHost', root), 640, 392);
    const cols = 7, rows = 5, x0 = 70, y0 = 46, dx = 71, dy = 54;
    const atoms = [], es = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) atoms.push({ x: x0 + dx * i + 35, y: y0 + dy * j + 28, ion: false, ph: rnd(0, 6.28) });
    atoms.forEach((a, k) => es.push({ a, ang: rnd(0, 6.28), free: false, x: 0, y: 0, vx: 0, vy: 0 }));
    let released = false, honey = false, glow = 0, t = 0;
    const R = { x: 44, y: 34, w: 552, h: 280 };
    const sync = () => {
      $('#bRel', root).innerHTML = released ? T('↺ Қайта бастау', '↺ Сначала') : T('⚡ Электрондарды жіберу', '⚡ Отпустить электроны');
      $('#bHon', root).innerHTML = honey ? T('Бал үлгісін жасыру', 'Скрыть модель с мёдом') : T('🍯 Бал үлгісі', '🍯 Модель с мёдом');
      $('#bTag', root).innerHTML = released ? T('Иондар + электрондық газ', 'Ионы + электронный газ') : T('Бейтарап атомдар', 'Нейтральные атомы');
    };
    $('#bRel', root).onclick = () => {
      if (!released) {
        released = true;
        es.forEach((e, i) => D.later(() => { e.free = true; e.x = e.a.x + Math.cos(e.ang) * 18; e.y = e.a.y + Math.sin(e.ang) * 18; const a = rnd(0, 6.28); e.vx = Math.cos(a) * 60; e.vy = Math.sin(a) * 60; D.later(() => { e.a.ion = true; }, 120); }, i * 45));
        D.beep('ok');
      } else { released = false; honey = false; es.forEach(e => { e.free = false; e.a.ion = false; }); }
      sync();
    };
    $('#bHon', root).onclick = () => { if (!released) { $('#bRel', root).click(); } honey = !honey; sync(); D.beep('pop'); };
    return {
      lang: sync,
      enter() { released = false; honey = false; es.forEach(e => { e.free = false; e.a.ion = false; }); sync(); },
      tick(dt) {
        t += dt; const x = cv.begin();
        glow += ((released ? 1 : 0) - glow) * Math.min(1, dt * 3);
        const live = es.filter(e => e.free).length / es.length;
        G.rr(x, R.x, R.y, R.w, R.h, 26); x.fillStyle = 'rgba(255,138,31,' + (.10 * glow * (.8 + .2 * Math.sin(t * 3))) + ')'; x.fill();
        if (honey) { const g = x.createLinearGradient(0, R.y, 0, R.y + R.h); g.addColorStop(0, 'rgba(245,184,28,.55)'); g.addColorStop(1, 'rgba(217,130,20,.55)'); G.rr(x, R.x, R.y, R.w, R.h, 26); x.fillStyle = g; x.fill(); x.strokeStyle = 'rgba(180,100,10,.6)'; x.lineWidth = 3; x.stroke(); }
        atoms.forEach(a => {
          const px = a.x + Math.sin(t * 2 + a.ph) * 1.6, py = a.y + Math.cos(t * 2.3 + a.ph) * 1.6;
          if (a.ion) G.ion(x, px, py, 21, '+', honey ? '#2b6fe0' : D.col.ion); else G.ball(x, px, py, 21, '#94a3b8');
        });
        es.forEach(e => {
          if (!e.free) { e.ang += dt * 2.2; G.e(x, e.a.x + Math.cos(e.ang) * 31, e.a.y + Math.sin(e.ang) * 31, 4.4); }
          else {
            if (Math.random() < dt * 1.2) { const a = rnd(0, 6.28), s = rnd(35, 95); e.vx = Math.cos(a) * s; e.vy = Math.sin(a) * s; }
            e.x += e.vx * dt; e.y += e.vy * dt;
            if (e.x < R.x + 8) { e.x = R.x + 8; e.vx = Math.abs(e.vx); } if (e.x > R.x + R.w - 8) { e.x = R.x + R.w - 8; e.vx = -Math.abs(e.vx); }
            if (e.y < R.y + 8) { e.y = R.y + 8; e.vy = Math.abs(e.vy); } if (e.y > R.y + R.h - 8) { e.y = R.y + R.h - 8; e.vy = -Math.abs(e.vy); }
            G.e(x, e.x, e.y, 4.4);
          }
        });
        if (live > .95) G.txt(x, T('электрондық газ', 'электронный газ'), 470, 328, { size: 17, color: '#d97706', weight: 900 });
      }
    };
  }
});

/* ---------- 6. Кристалл тор қалай түзіледі (Демонстрация № 4) ---------- */
Deck.add({
  id: 'lattice', ch: 1, time: 3,
  t: ['Кристалл тор қалай түзіледі', 'Как образуется кристаллическая решётка'],
  note: ['Демонстрация № 4: «Металдардың кристалл торларының модельдері». Көрсету кезінде ОЦК, ГЦК, ГПУ шар-таяқшалы модельдерін көрсетіңіз. Шарларды (моншақ, апельсин) қорапқа салуға болады: екінші қабат бірінші қабаттың шұңқырларына өзі отырады.',
    'Демонстрация № 4: «Модели кристаллических решёток металлов». Во время показа продемонстрируйте шаростержневые модели ОЦК, ГЦК, ГПУ. Можно уложить шарики (бусины, апельсины) в коробку: второй слой сам ложится в лунки первого.'],
  bridge: ['Қай тор түрлері бар? Үшеуін 3D-да айналдырып көрейік', 'Какие бывают решётки? Покрутим три типа в 3D'],
  html: () => `
    <div class="r" style="gap:20px">
      <div class="panel" style="width:720px;height:440px" data-a="l"><div id="latHost"></div>
        <div class="abs chip k" id="latTag" style="left:16px;top:14px"></div>
        <div class="abs" style="left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:10px"><button class="btn sm ghost" id="latPlay"></button></div>
      </div>
      <div class="c f1" style="gap:12px" id="latSteps">
        <div class="card step" data-s="0" data-a="r" style="--d:.1s"><div class="r ctr"><span class="sn">1</span><div><b class="ac">${L('Иондану', 'Ионизация')}</b><div class="t2">${L('Балқыма қатқанда атомдар сыртқы электрондарын береді.', 'При кристаллизации расплава атомы отдают внешние электроны.')}</div></div></div></div>
        <div class="card step" data-s="1" data-a="r" style="--d:.2s"><div class="r ctr"><span class="sn">2</span><div><b class="ac">${L('Электрондық газ', 'Электронный газ')}</b><div class="t2">${L('Бос электрондар иондар арасын толтырып, оларды «жабыстырады».', 'Свободные электроны заполняют пространство между ионами и «склеивают» их.')}</div></div></div></div>
        <div class="card step" data-s="2" data-a="r" style="--d:.3s"><div class="r ctr"><span class="sn">3</span><div><b class="ac">${L('Тығыз қаптама', 'Плотная упаковка')}</b><div class="t2">${L('Байланыс бағытсыз, сондықтан иондар шарлар сияқты барынша тығыз орналасады.', 'Связь ненаправленная, поэтому ионы укладываются максимально плотно, как шары в коробке.')}</div></div></div></div>
        <div class="key" data-a="pop" style="--d:.5s"><span class="lb">${L('Есте сақта', 'Запомни')}</span><span class="t" style="font-size:19px">${L('Тордың ең кіші қайталанатын бөлігі — <b>элементар ұяшық</b>. Металдарда үш негізгі түрі бар: ОЦК, ГЦК, ГПУ.', 'Наименьший повторяющийся фрагмент — <b>элементарная ячейка</b>. У металлов три главных типа: ОЦК, ГЦК, ГПУ.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const cv = D.cv($('#latHost', root), 720, 440);
    const cols = 9, rows = 6, sp = 56, ox = 360 - (cols - 1) * sp / 2, oy = 70;
    const P = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const tx = ox + i * sp + (j % 2 ? sp / 2 : 0) - (j % 2 ? sp / 4 : 0), ty = oy + 18 + j * sp * .87 + 6;
      P.push({ x: rnd(40, 680), y: rnd(70, 400), vx: rnd(-80, 80), vy: rnd(-80, 80), tx, ty, e: { ang: rnd(0, 6.28), x: 0, y: 0, vx: 0, vy: 0 }, ion: false, free: false });
    }
    let phase = 0, play = false, t = 0, settle = 0;
    const steps = $$('.step', root);
    const sync = () => {
      steps.forEach(s => s.style.outline = +s.dataset.s === phase ? '4px solid var(--ac)' : 'none');
      $('#latPlay', root).innerHTML = play ? T('■ Тоқтату', '■ Стоп') : T('▶ Анимацияны қосу', '▶ Запустить анимацию');
      $('#latTag', root).innerHTML = [T('Балқыма: атомдар қозғалыста', 'Расплав: атомы в движении'), T('Атомдар → иондар, электрондар босады', 'Атомы → ионы, электроны освобождаются'), T('Иондар тор түйіндеріне орналасады', 'Ионы занимают узлы решётки')][phase];
    };
    const setPhase = p => {
      phase = p; settle = 0;
      if (p === 0) P.forEach(a => { a.ion = false; a.free = false; });
      if (p >= 1) P.forEach((a, i) => D.later(() => { a.free = true; a.e.x = a.x + 14; a.e.y = a.y; const g = rnd(0, 6.28); a.e.vx = Math.cos(g) * 70; a.e.vy = Math.sin(g) * 70; D.later(() => { a.ion = true; }, 100); }, p === 1 ? i * 25 : 0));
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
        if (phase === 2 && settle > .8) { G.rr(x, ox - 40, oy - 12 + 18, (cols - 1) * sp + 80, rows * sp * .87 + 30, 30); x.strokeStyle = 'rgba(59,130,246,.35)'; x.lineWidth = 4; x.setLineDash([10, 8]); x.stroke(); x.setLineDash([]); }
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
  const INFO = {
    bcc: { n: ['ОЦК', 'ОЦК'], full: ['көлемдік центрленген куб', 'объёмно-центрированная кубическая'], nb: 8, pk: 68, o: ['Центрде 1 атом (оранж). Төбелерде 8 атом.', 'В центре куба — 1 атом (оранжевый), в вершинах — 8.'], ex: ['Fe (α)', 'Cr', 'W', 'Mo', 'Na', 'K', 'Li'] },
    fcc: { n: ['ГЦК', 'ГЦК'], full: ['жақтары центрленген куб', 'гранецентрированная кубическая'], nb: 12, pk: 74, o: ['Төбелерде 8 атом және 6 жақтың ортасында 6 атом (оранж).', '8 атомов в вершинах и 6 в центрах граней (оранжевые).'], ex: ['Cu', 'Al', 'Ag', 'Au', 'Ni', 'Pb', 'Pt'] },
    hcp: { n: ['ГПУ', 'ГПУ'], full: ['гексагоналды тығыз қапталған', 'гексагональная плотноупакованная'], nb: 12, pk: 74, o: ['Алты қырлы призма. Ортаңғы қабатта 3 атом (оранж), қабаттар АВАВ.', 'Шестигранная призма. В среднем слое 3 атома (оранжевые), слои чередуются АВАВ.'], ex: ['Mg', 'Zn', 'Ti', 'Co', 'Be', 'Cd'] }
  };
  Deck.add({
    id: 'cells', ch: 1, time: 4,
    t: ['Металл торларының үш түрі', 'Три типа решёток металлов'],
    note: ['Оранжевпен ұяшықты ерекшелейтін атомдар көрсетілген: ОЦК-те куб центрі, ГЦК-те жақтардың центрлері, ГПУ-да ортаңғы қабат. Сырғытқышпен атомдарды үлкейтіп, олардың бір-біріне тиетінін көрсетіңіз — сонда толтыру тығыздығы (68 % және 74 %) көрінеді. 3D-ұяшықты тышқанмен немесе саусақпен айналдыруға болады.',
      'Оранжевым выделены атомы, которые отличают ячейку: центр куба в ОЦК, центры граней в ГЦК, средний слой в ГПУ. Ползунком увеличивайте атомы до касания — так видна плотность упаковки (68 % и 74 %). Ячейку можно вращать мышью или пальцем.'],
    fact: ['<p>Темір <b>қыздырғанда торын өзгертеді</b>: 912 °C-тан төмен ол ОЦК (α-темір), одан жоғары ГЦК (γ-темір). Болатты шынықтыру осы құбылысқа негізделген.</p>',
      '<p>Железо <b>меняет решётку при нагревании</b>: ниже 912 °C оно ОЦК (α-железо), выше — ГЦК (γ-железо). На этом основана закалка стали.</p>'],
    bridge: ['Тор түрі металдың қасиетіне қалай әсер етеді?', 'Как тип решётки влияет на свойства металла?'],
    html: () => `
      <div class="r" style="gap:20px">
        <div class="panel" style="width:600px;height:480px" data-a="z"><div id="cellHost"></div>
          <div class="abs" style="left:16px;top:14px"><div class="tabs noswipe" id="cellTabs"><button data-k="bcc" class="on">${L('ОЦК', 'ОЦК')}</button><button data-k="fcc">${L('ГЦК', 'ГЦК')}</button><button data-k="hcp">${L('ГПУ', 'ГПУ')}</button></div></div>
          <div class="abs" style="left:24px;right:24px;bottom:14px"><div class="r ctr sm" style="gap:12px"><span>${L('Атом өлшемі', 'Размер атомов')}</span><input type="range" id="cellSize" min="0" max="100" value="40" style="flex:1"><span id="cellSz" class="num" style="min-width:48px;text-align:right"></span></div></div>
        </div>
        <div class="c f1" style="gap:12px" id="cellInfo"></div>
      </div>`,
    init(root) {
      const cv = D.cv($('#cellHost', root), 600, 480);
      let kind = 'bcc', yaw = .6, pitch = .45, size = .4, auto = true, pop = 1, dragging = false, last = null;
      const info = $('#cellInfo', root);
      const render = () => {
        const f = INFO[kind];
        info.innerHTML = `
          <div class="card tint"><div class="r ctr sb2"><h3>${L(f.n[0], f.n[1])}</h3><span class="sm">${L(f.full[0], f.full[1])}</span></div><div class="t2" style="margin-top:6px">${L(f.o[0], f.o[1])}</div></div>
          <div class="r" style="gap:12px">
            <div class="card f1" style="text-align:center"><div class="lbl">${L('Көрші атом', 'Соседей')}</div><div class="bigN" style="color:var(--c1)">${f.nb}</div></div>
            <div class="card f1" style="text-align:center"><div class="lbl">${L('Көлем толуы', 'Заполнено')}</div><div class="bigN" style="color:var(--c2)">${f.pk}<small>%</small></div></div>
          </div>
          <div class="card"><div class="lbl" style="margin-bottom:8px">${L('Мысалдар', 'Примеры')}</div><div class="r wrap" style="gap:8px">${f.ex.map(e => `<span class="chip k">${e}</span>`).join('')}</div></div>
          <div class="key"><span class="lb">${L('Ой', 'Мысль')}</span><span class="t" style="font-size:19px">${kind === 'bcc' ? L('Тығыздығы аздау — қабаттар қиын сырғиды.', 'Упаковка менее плотная — слоям труднее скользить.') : kind === 'fcc' ? L('Тығыз қабаттар оңай сырғиды — металл <b>иілгіш</b>.', 'Плотные слои легко скользят — металл <b>пластичный</b>.') : L('Қабаттар тек бір жазықтықта сырғиды — металл <b>морттау</b>.', 'Слои скользят лишь в одной плоскости — металл <b>хрупче</b>.')}</span></div>`;
      };
      const setKind = k => { kind = k; pop = 0; D.tween(.6, v => { pop = v; }, { ease: ease.back }); $$('#cellTabs button', root).forEach(b => b.classList.toggle('on', b.dataset.k === k)); render(); D.beep('pop'); };
      $$('#cellTabs button', root).forEach(b => b.onclick = () => setKind(b.dataset.k));
      const sz = $('#cellSize', root), szl = $('#cellSz', root);
      sz.oninput = () => { size = sz.value / 100; };
      D.drag(cv, { down(p) { dragging = true; auto = false; last = p; }, move(p) { if (last) { yaw += (p.x - last.x) * .01; pitch = clamp(pitch + (p.y - last.y) * .01, -1.3, 1.3); last = p; } }, up() { dragging = false; last = null; D.later(() => { auto = true; }, 1800); } });
      render();
      return {
        lang: render,
        enter() { kind = 'bcc'; setKind('bcc'); },
        tick(dt) {
          if (auto) yaw += dt * .55;
          const x = cv.begin(), S = 205, cx = 300, cy = 236, c = CELLS[kind];
          const r = lerp(.06, TOUCH[kind], size);
          szl.textContent = size > .985 ? T('тиеді', 'касание') : Math.round(size * 100) + '%';
          const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
          const prj = p => { const x1 = p[0] * cyw + p[2] * syw, z1 = -p[0] * syw + p[2] * cyw, y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp, f = 5 / (5 + z2); return { x: cx + x1 * S * f * pop, y: cy + y2 * S * f * pop, d: z2, f }; };
          x.strokeStyle = 'rgba(100,116,139,.55)'; x.lineWidth = 2.2;
          c.E.forEach(e => { const a = prj(e[0]), b = prj(e[1]); x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); });
          c.A.map(a => ({ a, q: prj(a.p) })).sort((u, v) => v.q.d - u.q.d).forEach(({ a, q }) => {
            const rr = r * S * q.f * pop; G.ball(x, q.x, q.y, rr, a.sp ? '#ff8a1f' : '#6d8fe0');
          });
        }
      };
    }
  });
})();

/* ---------- 8. Құрылым → қасиет ---------- */
Deck.add({
  id: 'struct', ch: 1, time: 3,
  t: ['Тор түрі қасиетті қалай өзгертеді', 'Как тип решётки влияет на свойства'],
  note: ['Натрий мен вольфрам мысалы: екеуінде де ОЦК торы, бірақ W 3422 °C-та, ал Na 98 °C-та балқиды. Яғни тор түрі қасиеттің жалғыз себебі емес. Қасиет екі нәрсеге тәуелді: тор түрі (қабаттардың сырғу жеңілдігі) және металдық байланыстың беріктігі (атом қанша электрон береді және ол қаншалықты кішкентай).',
    'Пример с натрием и вольфрамом: у обоих ОЦК-решётка, но W плавится при 3422 °C, а Na — при 98 °C. Тип решётки — не единственная причина свойств. Свойства зависят от двух вещей: типа решётки (как легко сдвигаются слои) и прочности металлической связи (сколько электронов отдаёт атом и насколько он мал).'],
  bridge: ['Енді әр қасиетті жеке көрейік: бәрінің түбі — электрондық газ', 'Теперь разберём каждое свойство: у всех корень — электронный газ'],
  html: () => `
    <div class="r" style="gap:16px">${[
      ['fcc', 'ГЦК', 'Cu · Al · Au · Ag', 'Ең иілгіш: созылады, жұқа фольга мен сым болады', 'Самые пластичные: ковка, фольга, проволока', '12', 'сырғу жүйесі', 'систем скольжения'],
      ['bcc', 'ОЦК', 'Fe · Cr · W · Mo', 'Берік, қатты, қиын балқиды; қатты суықта морттанады', 'Прочные, твёрдые, тугоплавкие; на холоде хрупче', '↓', 'сырғу қиынырақ', 'скольжение труднее'],
      ['hcp', 'ГПУ', 'Mg · Zn · Ti', 'Тығыз, бірақ бөлме температурасында нашар соғылады', 'Плотные, но при комнатной температуре куются плохо', '3', 'сырғу жүйесі', 'системы скольжения']
    ].map((c, i) => `<div class="card" data-a="pop" style="--d:${.1 + i * .12}s;width:384px"><div class="r ctr sb2"><h3 style="color:var(--ac)">${c[1]}</h3><span class="chip k">${c[2]}</span></div>
      <div class="cvh" data-k="${c[0]}" style="margin:8px 0 4px"></div><div class="t2" style="min-height:76px">${L(c[3], c[4])}</div>
      <div class="r ctr" style="gap:8px"><span class="bigN" style="font-size:36px;color:var(--c2)">${c[5]}</span><span class="sm">${L(c[6], c[7])}</span></div></div>`).join('')}</div>
    <div class="r" style="gap:16px;margin-top:14px">
      <div class="card f1" data-a="l" style="--d:.5s"><div class="r ctr" style="gap:20px"><div style="width:268px"><div class="lbl">${L('Тор бірдей — қасиет әртүрлі!', 'Решётка одна — свойства разные!')}</div><div class="t2" style="margin-top:6px">${L('Na мен W — екеуі де ОЦК. Балқу температурасын салыстыр:', 'Na и W — оба ОЦК. Сравни температуры плавления:')}</div></div>
        <div class="f1 c" style="gap:8px"><div class="r ctr" style="gap:10px"><b style="width:30px">Na</b><div class="bar" style="flex:1"><i id="barNa" style="background:#f59e0b"></i></div><b class="num" style="width:78px;text-align:right">98 °C</b></div>
        <div class="r ctr" style="gap:10px"><b style="width:30px">W</b><div class="bar" style="flex:1"><i id="barW" style="background:#ef4444"></i></div><b class="num" style="width:78px;text-align:right">3422 °C</b></div></div></div></div>
      <div class="key" data-a="r" style="--d:.7s;width:430px"><span class="lb">${L('Қорытынды', 'Вывод')}</span><span class="t" style="font-size:18px">${L('Қасиет екі нәрсеге байланысты: <b>тор түріне</b> және <b>байланыс беріктігіне</b> (қанша электрон, қандай радиус).', 'Свойства зависят от <b>типа решётки</b> и от <b>прочности связи</b> (сколько электронов отдаёт атом, какой радиус).')}</span></div>
    </div>`,
  init(root) {
    const cvs = $$('.cvh', root).map(h => ({ k: h.dataset.k, cv: D.cv(h, 340, 118) }));
    let t = 0;
    return {
      enter() { t = 0; const a = $('#barNa', root), b = $('#barW', root); a.style.width = '0'; b.style.width = '0'; D.later(() => { a.style.width = (98 + 60) / 3500 * 100 + '%'; b.style.width = (3422 + 60) / 3500 * 100 + '%'; }, 900); },
      tick(dt) {
        t += dt;
        cvs.forEach(({ k, cv }) => {
          const x = cv.begin(), sp = 40, rows = 4, cols = 8, r = 15;
          const cyc = (t * (k === 'fcc' ? .5 : k === 'bcc' ? .3 : .4)) % 1;
          let shift = 0;
          if (k === 'fcc') shift = ease.inout(cyc) * sp;
          else if (k === 'bcc') shift = (cyc < .5 ? ease.inout(cyc * 2) * .5 : .5 - 0) * sp * .5 + Math.sin(t * 30) * (cyc < .5 ? 1.5 : 0);
          else shift = ease.inout(Math.min(1, cyc * 1.3)) * sp * .9;
          for (let j = 0; j < rows; j++) for (let i = -1; i < cols + 1; i++) {
            const top = j < 2, px = 22 + i * sp + (j % 2 ? sp / 2 : 0) + (top ? shift % sp : 0), py = 20 + j * 28;
            if (px < 6 || px > 334) continue;
            G.ball(x, px, py, r, top ? '#6d8fe0' : '#93a8d8');
          }
          x.fillStyle = D.col.line; x.globalAlpha = .6; x.fillRect(6, 48, 328, 3); x.globalAlpha = 1;
          if (k === 'bcc') G.txt(x, '⚡', 316, 58, { size: 16 });
          if (k === 'hcp') { G.arrow(x, 310, 30, 310, 6, '#ef4444', 3); G.txt(x, '✕', 310, 100, { size: 15, color: '#ef4444' }); }
        });
      }
    };
  }
});
