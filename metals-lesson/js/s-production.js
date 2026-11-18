/* ===== 5-тарау: Металл алу ===== */

/* ---------- Рудадан металға ---------- */
Deck.add({
  id: 'ore', ch: 5, time: 5,
  t: ['Рудадан металға: төрт қадам', 'От руды к металлу: четыре шага'],
  note: ['Мақсат 9.4.2.6. Руда — металл қосылыстары (оксидтер, сульфидтер, карбонаттар) бар тау жынысы. 1) Өндіру; 2) Байыту: бос жынысты бөлу (флотация, магниттік сепарация) → концентрат; 3) Тотықсыздандыру: Mⁿ⁺ + ne⁻ → M⁰; 4) Рафинирлеу: қоспалардан тазарту, көбіне электролизбен. Өздігінен кесек (самородок) түрінде тек аз белсенді металдар кездеседі: Au, Pt, кейде Ag және Cu. Металл неғұрлым белсенді болса, оны тотықсыздандыру соғұрлым қиын: сілтілік металдар мен алюминийді тек балқымаларды электролиздеп алады. Ақпарат бойынша әдістерді қатарға байланыстырыңыз.',
    'Цель 9.4.2.6. Руда — горная порода с соединениями металла (оксиды, сульфиды, карбонаты). 1) Добыча; 2) Обогащение: отделение пустой породы (флотация, магнитная сепарация) → концентрат; 3) Восстановление: Mⁿ⁺ + ne⁻ → M⁰; 4) Рафинирование: очистка от примесей, часто электролизом. Самородками встречаются только малоактивные металлы: Au, Pt, иногда Ag и Cu. Чем активнее металл, тем труднее его восстановить: щелочные металлы и алюминий получают только электролизом расплавов. Свяжите методы с рядом активности.'],
  bridge: ['Металлургияның басты пеші — домна', 'Главная металлургическая «кухня»: доменная печь'],
  html: () => `
    <div class="r" style="gap:12px">${[['Өндіру', 'Добыча', 'mine'], ['Байыту', 'Обогащение', 'flot'], ['Тотықсыздану', 'Восстановление', 'red'], ['Тазарту', 'Рафинирование', 'ref']].map((s, i) => `<div class="card" data-a="pop" style="--d:${.08 + i * .1}s;width:293px;padding:10px 12px"><div class="r ctr" style="gap:8px;margin-bottom:4px"><span class="sn" style="margin:0;width:32px;height:32px;font-size:17px">${i + 1}</span><b style="font-size:20px">${L(s[0], s[1])}</b></div><div class="cvh oc" data-k="${s[2]}"></div></div>`).join('')}</div>
    <div class="r" style="gap:14px;margin-top:12px">
      <div class="card" data-a="l" style="--d:.5s;width:318px"><div class="lbl" style="margin-bottom:8px">${L('Тотықсыздандыру тәсілдері', 'Способы восстановления')}</div><div class="c" id="orM" style="gap:6px"></div></div>
      <div class="c f1" style="gap:10px"><div class="card tint" data-a="r" style="--d:.6s" id="orInfo"></div>
        <div class="card" data-a="r" style="--d:.7s"><div class="r ctr sb2" style="margin-bottom:6px"><span class="lbl">${L('Металл белсенділігі', 'Активность металла')}</span><span class="sm">${L('белсенділік артады → тотықсыздандыру қиындайды', 'активность растёт → восстановить труднее')}</span></div>
          <div class="r" id="orL" style="gap:4px"></div><div class="r" style="gap:4px;margin-top:4px" id="orZ"></div></div></div>
    </div>`,
  init(root) {
    const cvs = $$('.oc', root).map(h => ({ k: h.dataset.k, cv: D.cv(h, 269, 128), s: {} }));
    const LAD = ['Li', 'K', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Cr', 'Fe', 'Sn', 'Pb', 'Cu', 'Hg', 'Ag', 'Pt', 'Au'];
    const METH = [
      { k: 'pyro', n: ['Пирометаллургия', 'Пирометаллургия'], red: ['C, CO (жоғары t°)', 'C, CO (высокая t°)'], eq: 'Fe2O3 + 3CO → 2Fe + 3CO2', m: ['Zn', 'Cr', 'Fe', 'Sn', 'Pb', 'Cu'] },
      { k: 'metal', n: ['Металлотермия', 'Металлотермия'], red: ['Al, Mg (белсенді металл)', 'Al, Mg (активный металл)'], eq: 'Cr2O3 + 2Al → 2Cr + Al2O3 ; TiCl4 + 2Mg → Ti + 2MgCl2', m: ['Cr'] },
      { k: 'hydrogen', n: ['Сутектермия', 'Водородотермия'], red: ['H₂', 'H₂'], eq: 'WO3 + 3H2 → W + 3H2O', m: [] },
      { k: 'hydro', n: ['Гидрометаллургия', 'Гидрометаллургия'], red: ['ерітінді + белсендірек металл немесе ток', 'раствор + более активный металл или ток'], eq: 'CuSO4 + Fe → FeSO4 + Cu', m: ['Cu'] },
      { k: 'electro', n: ['Электрометаллургия', 'Электрометаллургия'], red: ['электр тогы (электролиз)', 'электрический ток (электролиз)'], eq: '2Al2O3 → 4Al + 3O2 (балқыма / расплав)', m: ['Li', 'K', 'Ca', 'Na', 'Mg', 'Al'] }
    ];
    let cur = 0, t = 0;
    const M = $('#orM', root), info = $('#orInfo', root), lad = $('#orL', root);
    const render = () => {
      M.innerHTML = METH.map((m, i) => `<button class="chip btn2 ${i === cur ? 'on' : ''}" data-i="${i}" style="justify-content:flex-start;font-size:17px;border-radius:14px">${T(m.n[0], m.n[1])}</button>`).join('');
      $$('button', M).forEach(b => b.onclick = () => { cur = +b.dataset.i; render(); D.beep('pop'); });
      const m = METH[cur];
      info.innerHTML = `<div class="r ctr sb2"><h3 style="font-size:22px">${T(m.n[0], m.n[1])}</h3><span class="chip k">${T('Тотықсыздандырғыш', 'Восстановитель')}: ${T(m.red[0], m.red[1])}</span></div><div class="eq" style="margin-top:8px;font-size:21px;white-space:normal">${F(m.eq)}</div>`;
      lad.innerHTML = LAD.map(e => `<span class="ladc ${m.m.includes(e) ? 'on' : ''}" style="--lc:${MET[e] || '#94a3b8'}">${e}</span>`).join('');
      $('#orZ', root).innerHTML = [['Электролиз', 'Электролиз', 6, '#ef4444'], ['Пиро-/металлотермия', 'Пиро-/металлотермия', 6, '#f97316'], ['Өздігінен / оңай', 'Самородные / легко', 4, '#16a34a']].map(z => `<span class="sm" style="flex:${z[2]};text-align:center;border-top:5px solid ${z[3]};padding-top:3px;font-size:15px">${T(z[0], z[1])}</span>`).join('');
    };
    render();
    const draw = {
      mine(x, s, dt) { s.r = s.r || Array.from({ length: 5 }, (_, i) => ({ x: i * 62, k: i % 3, a: rnd(-.3, .3) })); x.fillStyle = '#94a3b8'; x.fillRect(0, 96, 269, 14); x.fillStyle = '#64748b'; x.fillRect(0, 110, 269, 18); for (let i = 0; i < 15; i++) { x.fillStyle = '#475569'; x.beginPath(); x.arc((i * 18 + t * 40) % 280, 103, 4, 0, 6.28); x.fill(); }
        s.r.forEach(r => { r.x += dt * 44; if (r.x > 290) { r.x = -40; r.k = (r.k + 1) % 3; } x.save(); x.translate(r.x, 70); x.rotate(r.a); G.rr(x, -22, -22, 44, 36, 12); x.fillStyle = '#9aa3b2'; x.fill(); x.fillStyle = ['#d98324', '#38a7f0', '#1e293b'][r.k]; [[-8, -8], [6, 0], [-4, 6]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 5, 0, 6.28); x.fill(); }); x.restore(); });
        x.fillStyle = D.col.ink2; x.font = '800 13px Nunito,sans-serif'; x.textAlign = 'center'; x.fillText(T('руда = металл қосылыстары + жыныс', 'руда = соединения металла + порода'), 134, 18); },
      flot(x, s, dt) { s.p = s.p || Array.from({ length: 22 }, () => ({ x: rnd(30, 240), y: rnd(40, 120), ore: Math.random() < .45, v: rnd(20, 40) }));
        G.rr(x, 20, 24, 229, 98, 10); x.fillStyle = 'rgba(96,165,250,.28)'; x.fill(); x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(20, 24, 229, 14);
        s.p.forEach(p => { if (p.ore) { p.y -= p.v * dt; if (p.y < 40) { p.y = 120; p.x = rnd(30, 240); } x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 2; x.beginPath(); x.arc(p.x, p.y - 5, 6, 0, 6.28); x.stroke(); x.fillStyle = '#d98324'; x.beginPath(); x.arc(p.x, p.y, 3.5, 0, 6.28); x.fill(); } else { p.y += p.v * .6 * dt; if (p.y > 118) { p.y = 44; p.x = rnd(30, 240); } x.fillStyle = '#6b7280'; x.beginPath(); x.arc(p.x, p.y, 3.4, 0, 6.28); x.fill(); } });
        x.fillStyle = D.col.ink2; x.font = '800 13px Nunito,sans-serif'; x.textAlign = 'center'; x.fillText(T('пайдалы минерал көбікке жабысады', 'нужный минерал всплывает с пеной'), 134, 14); },
      red(x, s, dt) { s.n = s.n || 0; s.e = s.e || []; s.pop = s.pop || 0; s.sp = (s.sp || 0) + dt; if (s.sp > .55 && s.n < 2) { s.sp = 0; s.e.push({ x: 20, y: rnd(40, 90) }); } s.e.forEach(e => { e.x += 130 * dt; e.y += (64 - e.y) * dt * 3; }); const hit = s.e.filter(e => e.x > 118); if (hit.length) { s.n += hit.length; s.e = s.e.filter(e => e.x <= 118); }
        if (s.n >= 2) { s.pop += dt; if (s.pop > 1.4) { s.n = 0; s.pop = 0; } }
        const atom = s.n >= 2; atom ? G.ball(x, 134, 64, 24, '#94a3b8') : G.ion(x, 134, 64, 24, '+'); G.txt(x, atom ? 'M⁰' : 'Mⁿ⁺', 134, 64, { size: 17, color: atom ? '#14213d' : '#fff', weight: 900 });
        s.e.forEach(e => G.e(x, e.x, e.y, 5)); G.txt(x, 'Mⁿ⁺ + n e⁻ → M⁰', 134, 112, { size: 17, color: D.col.ink, weight: 900 }); G.txt(x, T('ион + электрон → атом', 'ион + электроны → атом'), 134, 14, { size: 15, color: D.col.ink2, weight: 800 }); },
      ref(x, s, dt) { s.p = s.p || Array.from({ length: 14 }, (_, i) => ({ u: i / 14 })); s.g = ((s.g || 0) + dt * .12) % 1;
        G.rr(x, 18, 30, 233, 88, 8); x.fillStyle = 'rgba(56,167,240,.25)'; x.fill(); G.rr(x, 30, 22, 26, 96, 4); x.fillStyle = '#9a6b3a'; x.fill(); G.rr(x, 213 - s.g * 14, 22, 8 + s.g * 14, 96, 4); x.fillStyle = '#d98324'; x.fill();
        s.p.forEach(p => { p.u = (p.u + dt * .25) % 1; const px = lerp(62, 208 - s.g * 14, p.u), py = 40 + ((p.u * 7 + s.p.indexOf(p) * .37) % 1) * 70; x.fillStyle = '#3b82f6'; x.beginPath(); x.arc(px, py, 4.4, 0, 6.28); x.fill(); });
        G.txt(x, T('анод (қоспалы)', 'анод (с примесями)'), 44, 14, { size: 14, color: D.col.ink2, weight: 800 }); G.txt(x, T('катод: таза Cu', 'катод: чистая Cu'), 214, 14, { size: 14, color: D.col.ink2, weight: 800 }); G.txt(x, 'Cu²⁺ + 2e⁻ → Cu⁰  (99,99 %)', 134, 122, { size: 16, color: D.col.ink, weight: 900 }); }
    };
    return {
      lang: render, enter() { cur = 0; render(); },
      tick(dt) { t += dt; cvs.forEach(c => { const x = c.cv.begin(); draw[c.k](x, c.s, dt); }); }
    };
  }
});

/* ---------- Домна пеші мен конвертер ---------- */
Deck.add({
  id: 'blast', ch: 5, time: 5,
  t: ['Домна пеші: руда → шойын → болат', 'Доменная печь: руда → чугун → сталь'],
  note: ['Шихта: темір кені (окатыштар), кокс, флюс (әктас) — жоғарыдан салады. Тотықсыздану аймағында: C + O₂ → CO₂; CO₂ + C → 2CO; Fe₂O₃ + 3CO → 2Fe + 3CO₂. Балқу аймағында темір көміртекке қанығып, шойынға айналады. Фурмалар арқылы оттегімен байытылған ыстық ауа үрленеді. Қож (бос жыныстан түзілген силикаттар) жеңіл, үстінде жүзеді; шойын ауыр, төменде жиналады және лётка арқылы шығарылады. Шойынды оттек конвертеріне құйып, оттегімен үрлейді: артық көміртек жанады (2C + O₂ → 2CO), ал Si, Mn, P қожға өтеді. Болат алынады. Қазақстанда «кен → шойын → болат → прокат» толық циклі Теміртаудағы Qarmet комбинатында жұмыс істейді.',
    'Шихта: железная руда (окатыши), кокс, флюс (известняк) — загружают сверху. Зона восстановления: C + O₂ → CO₂; CO₂ + C → 2CO; Fe₂O₃ + 3CO → 2Fe + 3CO₂. В зоне плавления железо насыщается углеродом и превращается в чугун. Через фурмы вдувают горячий воздух, обогащённый кислородом. Шлак (силикаты из пустой породы) легче и всплывает; чугун тяжелее, собирается внизу и выпускается через лётку. Чугун переливают в кислородный конвертер и продувают кислородом: лишний углерод сгорает (2C + O₂ → 2CO), а Si, Mn, P переходят в шлак. Получается сталь. В Казахстане полный цикл «руда → чугун → сталь → прокат» работает на комбинате Qarmet в Темиртау.'],
  fact: ['<p>Домна пеші <b>10–15 жыл бойы тоқтамай</b> жұмыс істейді: күрделі жөндеуге дейін ол күндіз-түні шойын береді. Үлкен домна бір ағызғанда жүздеген тонна шойын шығара алады.</p>', '<p>Доменная печь работает <b>10–15 лет без остановки</b>: до капитального ремонта она круглосуточно выдаёт чугун. Большая домна за один выпуск даёт сотни тонн чугуна.</p>'],
  bridge: ['Қазақстанда металл қайда бар? Картаға көз салайық', 'А где в Казахстане есть металлы? Посмотрим на карту'],
  html: () => `
    <div class="r" style="gap:16px">
      <div class="panel" style="width:640px;height:484px" data-a="l"><div id="bfHost"></div>
        <div class="abs" style="left:12px;top:10px;z-index:3"><div class="tabs sm noswipe" id="bfTabs"><button data-k="f" class="on">${L('Домна пеші', 'Доменная печь')}</button><button data-k="c">${L('Конвертер', 'Конвертер')}</button></div></div>
        <div class="abs" style="right:12px;top:10px;z-index:3"><button class="btn sm" id="bfGo" style="display:none"></button></div></div>
      <div class="c f1" style="gap:8px" id="bfZ"></div>
    </div>`,
  init(root) {
    const W = 640, H = 484, cv = D.cv($('#bfHost', root), W, H); const cx = 300;
    const PR = [[44, 60], [130, 78], [255, 128], [335, 118], [392, 92], [452, 92]];
    const hw = y => { for (let i = 1; i < PR.length; i++) if (y <= PR[i][0]) { const a = PR[i - 1], b = PR[i], f = (y - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], f); } return PR[PR.length - 1][1]; };
    const Z = [
      { c: '#78350f', y0: 44, y1: 130, n: ['Шихта', 'Шихта'], d: ['Темір кені (окатыштар), кокс, флюс — жоғарыдан салады.', 'Железная руда (окатыши), кокс, флюс — загружают сверху.'], eq: '' },
      { c: '#ea580c', y0: 130, y1: 280, n: ['Тотықсыздану аймағы', 'Зона восстановления'], d: ['Оксид темірге дейін тотықсызданады.', 'Оксид восстанавливается до железа.'], eq: 'C + O2 → CO2;  CO2 + C → 2CO;  Fe2O3 + 3CO → 2Fe + 3CO2' },
      { c: '#dc2626', y0: 280, y1: 395, n: ['Балқу аймағы', 'Зона плавления'], d: ['Темір көміртекке қанығып, шойынға айналады.', 'Железо насыщается углеродом и превращается в чугун.'], eq: '' },
      { c: '#2563eb', y0: 365, y1: 395, n: ['Фурмалар', 'Фурмы'], d: ['Оттегімен байытылған ыстық ауа үрленеді.', 'Вдувают горячий воздух, обогащённый кислородом.'], eq: '' },
      { c: '#a3a3a3', y0: 405, y1: 428, n: ['Қож', 'Шлак'], d: ['Силикаттар: жеңіл, үстінде жүзеді.', 'Силикаты: легче, всплывает.'], eq: '' },
      { c: '#f97316', y0: 428, y1: 452, n: ['Шойын', 'Чугун'], d: ['Ауыр, төменде жиналады, лётка арқылы шығады.', 'Тяжелее, собирается внизу, выпускается через лётку.'], eq: '' }
    ];
    let tab = 'f', sel = -1, t = 0, blow = 0, carb = 4.3, tap = 0; const ch = [], gas = [], sparks = [];
    for (let i = 0; i < 70; i++) ch.push({ u: rnd(-.85, .85), y: rnd(44, 400), v: rnd(10, 20), k: i % 3 });
    for (let i = 0; i < 50; i++) gas.push({ u: rnd(-.8, .8), y: rnd(40, 380), v: rnd(60, 110) });
    const zl = $('#bfZ', root), go = $('#bfGo', root);
    const renderZ = () => {
      if (tab === 'f') zl.innerHTML = Z.map((z, i) => `<div class="card bfz ${i === sel ? 'sel' : ''}" data-i="${i}" style="padding:8px 14px;cursor:pointer;border-left:8px solid ${z.c}"><div class="r ctr sb2"><b style="font-size:18px">${T(z.n[0], z.n[1])}</b></div><div class="t2" style="font-size:17px;line-height:1.25">${T(z.d[0], z.d[1])}</div>${z.eq && i === sel ? `<div class="eq" style="margin-top:6px;font-size:17px;white-space:normal;padding:4px 8px">${F(z.eq)}</div>` : ''}</div>`).join('');
      else zl.innerHTML = `<div class="card tint"><h3 style="font-size:22px">${T('Оттек конвертері', 'Кислородный конвертер')}</h3><div class="t2" style="margin-top:6px">${T('Шойынды оттегімен үрлейді: артық көміртек жанады, Si, Mn, P қожға өтеді. Нәтиже — болат.', 'Чугун продувают кислородом: лишний углерод сгорает, Si, Mn, P переходят в шлак. Получается сталь.')}</div></div>
        <div class="card"><div class="eq" style="display:block;font-size:22px">${F('2C + O2 → 2CO↑')}</div><div class="t2" style="margin-top:8px;font-size:17px">${T('Si, Mn, P → қожға', 'Si, Mn, P → в шлак')}</div></div>
        <div class="card"><div class="lbl" style="margin-bottom:6px">${T('Көміртек құрамы', 'Содержание углерода')}</div><div class="bar" style="height:22px"><i id="bfC" style="background:linear-gradient(90deg,#16a34a,#475569)"></i></div><div class="r sb2 sm" style="margin-top:4px"><span>${T('болат', 'сталь')} ≤ 2,14 %</span><b class="num" id="bfCv"></b></div></div>
        <div class="key"><span class="lb">${T('Қорытынды', 'Итог')}</span><span class="t" style="font-size:18px">${T('Шойын (көп C, морт) → <b>болат</b> (аз C, берік).', 'Чугун (много C, хрупкий) → <b>сталь</b> (мало C, прочная).')}</span></div>`;
      $$('.bfz', zl).forEach(c => c.onclick = () => { sel = sel === +c.dataset.i ? -1 : +c.dataset.i; renderZ(); D.beep('pop'); });
      $$('#bfTabs button', root).forEach(b => b.classList.toggle('on', b.dataset.k === tab));
      go.style.display = tab === 'c' ? '' : 'none'; go.textContent = blow ? T('↺ Қайта', '↺ Заново') : T('💨 Оттегімен үрлеу', '💨 Продувка O₂');
    };
    $$('#bfTabs button', root).forEach(b => b.onclick = () => { tab = b.dataset.k; blow = 0; carb = 4.3; sel = -1; renderZ(); D.beep('pop'); });
    go.onclick = () => { if (blow) { blow = 0; carb = 4.3; } else { blow = 1; D.beep('pop'); } renderZ(); };
    renderZ();
    return {
      lang: renderZ, enter() { tab = 'f'; sel = -1; blow = 0; carb = 4.3; renderZ(); },
      tick(dt) {
        t += dt; const x = cv.begin();
        if (tab === 'f') {
          /* корпус */
          x.beginPath(); x.moveTo(cx - hw(44), 44); for (let y = 44; y <= 452; y += 8) x.lineTo(cx - hw(y), y); for (let y = 452; y >= 44; y -= 8) x.lineTo(cx + hw(y), y); x.closePath();
          const bg = x.createLinearGradient(0, 40, 0, 452); bg.addColorStop(0, '#1e293b'); bg.addColorStop(.6, '#3b2a22'); bg.addColorStop(1, '#4a2511'); x.fillStyle = bg; x.fill();
          x.save(); x.clip();
          /* қызу жарығы */
          const hg = x.createLinearGradient(0, 200, 0, 452); hg.addColorStop(0, 'rgba(239,68,68,0)'); hg.addColorStop(1, 'rgba(249,115,22,.45)'); x.fillStyle = hg; x.fillRect(0, 200, W, 252);
          /* ағып түсетін шихта */
          ch.forEach(p => { p.y += p.v * dt; if (p.y > 402) { p.y = 46; p.u = rnd(-.85, .85); } const px = cx + p.u * hw(p.y) * .92; const col = p.y < 130 ? ['#9a3412', '#0b0f19', '#f1f5f9'][p.k] : p.y < 280 ? ['#94a3b8', '#0b0f19', '#e2e8f0'][p.k] : ['#fb923c', '#1f2937', '#fde68a'][p.k]; x.fillStyle = col; x.beginPath(); x.arc(px, p.y, p.k === 1 ? 4.4 : 3.6, 0, 6.28); x.fill(); });
          /* газ */
          gas.forEach(g => { g.y -= g.v * dt; if (g.y < 36) { g.y = 386; g.u = rnd(-.8, .8); } const px = cx + g.u * hw(g.y) * .9 + Math.sin(t * 3 + g.u * 9) * 3; x.fillStyle = g.y > 340 ? 'rgba(186,230,253,.75)' : g.y > 150 ? 'rgba(251,146,60,.6)' : 'rgba(203,213,225,.5)'; x.beginPath(); x.arc(px, g.y, 2.6, 0, 6.28); x.fill(); });
          /* ошақ */
          x.fillStyle = '#d4d4d8'; x.fillRect(cx - 100, 404, 200, 26); x.fillStyle = '#f97316'; x.beginPath(); x.moveTo(cx - 100, 430); for (let k = 0; k <= 20; k++) x.lineTo(cx - 100 + k * 10, 430 + Math.sin(t * 3 + k) * 1.6); x.lineTo(cx + 100, 452); x.lineTo(cx - 100, 452); x.closePath(); x.fill();
          x.restore();
          x.strokeStyle = '#64748b'; x.lineWidth = 7; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - hw(44), 44); for (let y = 52; y <= 452; y += 8) x.lineTo(cx - hw(y), y); x.moveTo(cx + hw(44), 44); for (let y = 52; y <= 452; y += 8) x.lineTo(cx + hw(y), y); x.stroke();
          /* фурмалар */
          [-1, 1].forEach(s => { x.fillStyle = '#334155'; x.fillRect(cx + s * hw(380) - (s > 0 ? 0 : 36), 372, 36, 14); for (let k = 0; k < 3; k++) { const ax = cx + s * (hw(380) + 30 + k * 18 + ((t * 40) % 18)); G.arrow(x, ax + s * 20, 379, ax, 379, 'rgba(96,165,250,.9)', 3); } });
          G.txt(x, T('ыстық ауа', 'горячий воздух'), cx - hw(380) - 70, 398, { size: 15, color: '#3b82f6', weight: 900 }); G.txt(x, T('ыстық ауа', 'горячий воздух'), cx + hw(380) + 70, 398, { size: 15, color: '#3b82f6', weight: 900 });
          /* жоғарғы бөлік */
          x.fillStyle = '#475569'; G.rr(x, cx - 50, 26, 100, 20, 6); x.fill(); G.txt(x, T('шихта ↓', 'шихта ↓'), cx, 17, { size: 15, color: D.col.ink2, weight: 900 }); for (let k = 0; k < 4; k++) { const ay = 20 + k * 6 - ((t * 24) % 24); x.fillStyle = 'rgba(148,163,184,.55)'; x.beginPath(); x.arc(cx + 80 + k * 2, 10 + ay * .4, 6 + k, 0, 6.28); x.fill(); }
          G.txt(x, T('газ ↑', 'газ ↑'), cx + 100, 24, { size: 15, color: D.col.ink2, weight: 900, align: 'left' });
          /* лётка және науа */
          tap = (tap + dt) % 9; const pouring = tap > 5.8; x.fillStyle = '#334155'; x.fillRect(cx + 90, 436, 40, 10);
          if (pouring) { x.strokeStyle = '#f97316'; x.lineWidth = 6; x.beginPath(); x.moveTo(cx + 130, 441); x.lineTo(cx + 166, 441); x.lineTo(cx + 166, 470); x.stroke(); }
          G.rr(x, cx + 140, 460, 60, 24, 6); x.fillStyle = '#475569'; x.fill(); if (pouring) { x.fillStyle = '#f97316'; x.fillRect(cx + 146, 466 - clamp((tap - 5.8) * 3, 0, 6), 48, 8); }
          if (sel >= 0) { const z = Z[sel]; x.fillStyle = 'rgba(255,255,255,.16)'; x.fillRect(cx - 180, z.y0, 360, z.y1 - z.y0); x.strokeStyle = '#fff'; x.lineWidth = 3; x.setLineDash([8, 6]); x.strokeRect(cx - 180, z.y0, 360, z.y1 - z.y0); x.setLineDash([]); G.txt(x, T(z.n[0], z.n[1]), cx - 190, (z.y0 + z.y1) / 2, { size: 17, color: D.col.ink, weight: 900, align: 'right' }); }
          if (sel < 0) { G.txt(x, T('← аймақты таңда', 'выбери зону →'), 70, 250, { size: 16, color: D.col.ink2, weight: 800 }); }
        } else {
          /* конвертер */
          if (blow) carb = Math.max(.4, carb - dt * .6);
          const cy = 250; x.save(); x.translate(cx, cy);
          x.beginPath(); x.moveTo(-30, -190); x.lineTo(30, -190); x.bezierCurveTo(60, -130, 130, -80, 130, 20); x.bezierCurveTo(130, 120, 90, 170, 0, 170); x.bezierCurveTo(-90, 170, -130, 120, -130, 20); x.bezierCurveTo(-130, -80, -60, -130, -30, -190); x.closePath();
          x.fillStyle = '#475569'; x.fill(); x.save(); x.clip();
          const lv = -20; const g = x.createLinearGradient(0, lv, 0, 170); g.addColorStop(0, blow ? '#fbbf24' : '#f97316'); g.addColorStop(1, '#b91c1c'); x.fillStyle = g; x.beginPath(); x.moveTo(-140, lv); for (let k = 0; k <= 14; k++) x.lineTo(-140 + k * 20, lv + Math.sin(t * (blow ? 9 : 3) + k) * (blow ? 5 : 2)); x.lineTo(140, 200); x.lineTo(-140, 200); x.closePath(); x.fill();
          x.fillStyle = 'rgba(203,213,225,.55)'; x.fillRect(-140, lv - 8, 280, 12);
          if (blow) for (let k = 0; k < 26; k++) { x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(Math.sin(k * 3.1 + t * 2) * 40, 150 - ((t * 120 + k * 24) % 170), 3 + (k % 3), 0, 6.28); x.fill(); }
          x.restore(); x.restore();
          x.strokeStyle = '#334155'; x.lineWidth = 8; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - 30, cy - 190); x.bezierCurveTo(cx - 60, cy - 130, cx - 130, cy - 80, cx - 130, cy + 20); x.bezierCurveTo(cx - 130, cy + 120, cx - 90, cy + 170, cx, cy + 170); x.bezierCurveTo(cx + 90, cy + 170, cx + 130, cy + 120, cx + 130, cy + 20); x.bezierCurveTo(cx + 130, cy - 80, cx + 60, cy - 130, cx + 30, cy - 190); x.stroke();
          x.strokeStyle = '#94a3b8'; x.lineWidth = 10; x.beginPath(); x.moveTo(cx, 36); x.lineTo(cx, blow ? cy - 40 : cy - 110); x.stroke();
          if (blow) { for (let k = 0; k < 6; k++) { x.strokeStyle = 'rgba(96,165,250,.8)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 12 + k * 5, cy - 40); x.lineTo(cx - 40 + k * 16, cy + 10 + ((t * 150 + k * 20) % 30)); x.stroke(); } if (Math.random() < .9) sparks.push({ x: cx + rnd(-20, 20), y: cy - 190, vx: rnd(-90, 90), vy: -rnd(120, 280), l: 1 }); G.txt(x, 'CO↑', cx + 90, 70, { size: 18, color: '#ea580c', weight: 900 }); }
          for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.l -= dt; p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.l <= 0) { sparks.splice(i, 1); continue; } x.globalAlpha = clamp(p.l, 0, 1); x.fillStyle = '#fbbf24'; x.beginPath(); x.arc(p.x, p.y, 2.6, 0, 6.28); x.fill(); x.globalAlpha = 1; }
          G.txt(x, T('оттек түтігі', 'кислородная фурма'), cx + 70, 52, { size: 15, color: D.col.ink2, weight: 900, align: 'left' }); G.txt(x, carb > 2.14 ? T('шойын', 'чугун') : T('болат!', 'сталь!'), cx, cy + 60, { size: 26, color: '#fff', weight: 900, stroke: 'rgba(0,0,0,.35)' });
          const cb = $('#bfC', root), cv_ = $('#bfCv', root); if (cb) { cb.style.width = clamp(carb / 4.3 * 100, 4, 100) + '%'; cv_.textContent = 'C = ' + carb.toFixed(1).replace('.', ',') + ' %'; }
        }
      }
    };
  }
});
