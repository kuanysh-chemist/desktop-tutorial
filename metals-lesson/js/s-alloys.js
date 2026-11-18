/* ===== 4-тарау: Қорытпалар ===== */

/* ---------- Қорытпа деген не (Демонстрация № 5) ---------- */
Deck.add({
  id: 'alloy', ch: 4, time: 4,
  t: ['Қорытпа деген не және оны қалай алады', 'Что такое сплав и как его получают'],
  note: ['Демонстрация № 5: «Металдар мен қорытпалар». Мыс, жез, қола; алюминий және дюралюминий; темір, болат және шойын үлгілерін салыстырыңыз: түсі, жылтыры, қаттылығы (үлгілерді бір-бірімен сызу), бірдей өлшемді үлгілердің массасы. Қорытпа — қоспа, жаңа химиялық зат емес: құрамын өзгертіп, қажетті қасиет таңдауға болады. Қорытпалар ежелден белгілі: қола дәуірі (б.з.д. шамамен 3000 ж.). Бүгін қорытпаның мыңдаған маркасы қолданылады.',
    'Демонстрация № 5: «Металлы и сплавы». Сравните образцы меди, латуни, бронзы; алюминия и дюралюминия; железа, стали и чугуна: цвет, блеск, твёрдость (царапаем образцы друг другом), масса одинаковых по размеру образцов. Сплав — смесь, а не новое химическое вещество: состав можно менять, подбирая нужные свойства. Сплавы известны с древности: бронзовый век (около 3000 лет до н. э.). Сегодня используется много тысяч марок сплавов.'],
  fact: ['<p>Қола дәуірі шамамен <b>б.з.д. 3000 жылдан</b> басталды: адамдар мысқа қалайы қосып, құралдар мен қарудың берігін жасады. Қазір қорытпаның <b>мыңдаған маркасы</b> бар.</p>', '<p>Бронзовый век начался примерно <b>3000 лет до н. э.</b>: люди добавляли к меди олово и получали прочные орудия и оружие. Сегодня известны <b>тысячи марок</b> сплавов.</p>'],
  bridge: ['Қорытпа ішінде атомдар қалай орналасады?', 'Как устроены атомы внутри сплава?'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:640px;height:456px" data-a="l"><div id="alHost"></div>
        <div class="abs r" style="left:14px;bottom:12px;gap:10px;z-index:3"><button class="btn sm" id="alPlay"></button><span class="chip" style="font-size:16px">${L('Демонстрация № 5', 'Демонстрация № 5')}</span></div></div>
      <div class="c f1" style="gap:10px">
        <div class="card tint" data-a="r" style="--d:.1s"><div class="t" style="font-size:20px">${L('<b>Қорытпа</b> — екі не одан көп металдың (немесе металл мен көміртек сияқты бейметалдың) балқымасы қатқанда түзілетін, <b>металдық қасиеті бар зат</b>.', '<b>Сплав</b> — вещество с металлическими свойствами, полученное при затвердевании расплава двух или более металлов (или металла и неметалла, например углерода).')}</div></div>
        <div class="c" id="alSteps" style="gap:8px">${[['Негізгі металды балқыту', 'Расплавить основной металл', 'flame'], ['Басқа компоненттерді қосу', 'Добавить другие компоненты', 'layers'], ['Біртекті болғанша араластыру', 'Перемешать до однородности', 'gear'], ['Суыту — кристалдану', 'Охладить — кристаллизация', 'thermo']].map((s, i) => `<div class="card alstep" data-i="${i}" data-a="r" style="--d:${.2 + i * .08}s;padding:8px 14px;cursor:pointer"><div class="r ctr" style="gap:10px"><span class="sn" style="margin:0;width:34px;height:34px;font-size:17px">${i + 1}</span><span class="t2" style="font-weight:800">${L(s[0], s[1])}</span></div></div>`).join('')}</div>
        <div class="key" data-a="r" style="--d:.6s"><span class="lb">${L('Маңызды', 'Важно')}</span><span class="t" style="font-size:18px">${L('Қорытпа — <b>қоспа</b>, жаңа химиялық зат емес: құрамын өзгертіп, қасиетті таңдаймыз.', 'Сплав — это <b>смесь</b>, а не новое вещество: меняя состав, подбираем свойства.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const W = 640, H = 396, cv = D.cv($('#alHost', root), W, H);
    const DUR = [3.2, 3.2, 3.4, 4.5], NAMES = [['1. Мыс балқуда…', '1. Медь плавится…'], ['2. Қалайы қосамыз', '2. Добавляем олово'], ['3. Араластырамыз', '3. Перемешиваем'], ['4. Суытамыз: кристалдар өседі', '4. Остываем: растут кристаллы']];
    let ph = 0, pp = 0, auto = false, t = 0; const seeds = Array.from({ length: 30 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), c: rnd(-.12, .12) })); const pel = [];
    const steps = $$('.alstep', root), btn = $('#alPlay', root);
    const sync = () => { steps.forEach((s, i) => { s.style.outline = i === ph ? '4px solid var(--ac)' : 'none'; }); btn.textContent = auto ? T('■ Тоқтату', '■ Стоп') : T('▶ Бастау', '▶ Запустить'); };
    const setPh = i => { ph = i; pp = 0; pel.length = 0; if (i === 1) for (let k = 0; k < 7; k++) pel.push({ x: 270 + rnd(-30, 80), y: -20 - k * 40, vy: 0, in: false }); sync(); D.beep('pop'); };
    steps.forEach(s => s.onclick = () => { auto = false; setPh(+s.dataset.i); });
    btn.onclick = () => { auto = !auto; if (auto) setPh(0); sync(); };
    return {
      lang: sync, enter() { auto = true; setPh(0); },
      tick(dt) {
        t += dt; pp += dt / DUR[ph]; if (pp >= 1) { pp = 1; if (auto && ph < 3) setPh(ph + 1); else if (ph === 3 && auto && pp >= 1) { auto = false; sync(); } }
        const x = cv.begin(), cx = 320, top = 150, bot = 300;
        G.txt(x, T(NAMES[ph][0], NAMES[ph][1]), 320, 34, { size: 24, color: D.col.ink, weight: 900 });
        const mix = ph < 2 ? 0 : ph === 2 ? pp : 1;
        const cu = [217, 131, 36], br = [196, 142, 60], cm = cu.map((v, i) => lerp(v, br[i], mix)), ml = clamp(pp * 1.2, 0, 1);
        if (ph < 3) {
          const g = x.createRadialGradient(cx, bot + 40, 10, cx, bot + 40, 240); g.addColorStop(0, 'rgba(249,115,22,.55)'); g.addColorStop(1, 'rgba(249,115,22,0)'); x.fillStyle = g; x.fillRect(0, 150, W, 246);
          x.beginPath(); x.moveTo(cx - 105, top); x.lineTo(cx + 105, top); x.lineTo(cx + 75, bot); x.lineTo(cx - 75, bot); x.closePath(); x.fillStyle = 'rgba(100,116,139,.35)'; x.fill();
          x.save(); x.clip();
          const lv = ph === 0 ? lerp(bot - 18, top + 70, ease.out(ml)) : top + 70;
          if (ph === 0 && ml < 1) { for (let i = 0; i < 3; i++) { const s = 1 - ml; G.rr(x, cx - 60 + i * 42, bot - 18 - 36 * s - (i === 1 ? 24 * s : 0), 38 * s + 6, 36 * s + 6, 8); x.fillStyle = G.shade('#d98324', i * .08); x.fill(); } }
          if (ml > .02 || ph > 0) { x.beginPath(); x.moveTo(cx - 110, lv); for (let k = 0; k <= 14; k++) x.lineTo(cx - 110 + k * 15.7, lv + Math.sin(t * 3 + k) * 2.6); x.lineTo(cx + 110, bot); x.lineTo(cx - 110, bot); x.closePath(); const gg = x.createLinearGradient(0, lv, 0, bot); gg.addColorStop(0, 'rgb(' + cm.map(Math.round).join(',') + ')'); gg.addColorStop(1, 'rgb(' + cm.map(v => Math.round(v * .7)).join(',') + ')'); x.fillStyle = gg; x.fill(); if (ph === 2) { for (let k = 0; k < 40; k++) { const a = k * .7 + t * (2 + k % 3) * (1 + (1 - pp)), r = 12 + k * 2; x.fillStyle = (k % 2 ? 'rgba(203,213,225,' : 'rgba(217,131,36,') + (1 - mix) * .8 + ')'; x.beginPath(); x.arc(cx + Math.cos(a) * r * 1.4, lv + 34 + Math.sin(a) * r * .5, 3.4, 0, 6.283); x.fill(); } } }
          x.restore();
          x.strokeStyle = '#475569'; x.lineWidth = 8; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - 105, top); x.lineTo(cx - 75, bot); x.lineTo(cx + 75, bot); x.lineTo(cx + 105, top); x.stroke();
          for (const p of pel) { if (!p.in) { p.vy += 900 * dt; p.y += p.vy * dt; if (p.y > top + 66) { p.in = true; } } if (p.y > 0 && !p.in) G.ball(x, p.x, p.y, 10, '#c7ced8'); }
          if (ph === 1) G.txt(x, 'Sn', 540, 120, { size: 28, color: '#64748b', weight: 900 });
          if (ph === 2) { const a = t * 4; x.strokeStyle = '#334155'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx + 50 + Math.cos(a) * 36, 40); x.lineTo(cx + Math.cos(a) * 36, top + 110 + Math.sin(a) * 8); x.stroke(); }
        } else {
          /* құю + кристалдану */
          const mx = 130, my = 250, mw = 380, mh = 110;
          const pour = clamp(pp / .25, 0, 1), cool = clamp((pp - .2) / .8, 0, 1);
          G.rr(x, mx - 14, my - 8, mw + 28, mh + 22, 14); x.fillStyle = '#64748b'; x.fill();
          G.rr(x, mx, my, mw, mh, 8); x.fillStyle = '#334155'; x.fill();
          const hotc = [255, 150, 50], coldc = [196, 142, 60];
          const CW = 5, nx = Math.floor(mw / CW), ny = Math.floor(mh / CW), R = ease.out(cool) * .42;
          for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
            let md = 9, ci = 0; seeds.forEach((s, k) => { const dx = (i + .5) / nx * 3.5 - s.x * 3.5, dy = (j + .5) / ny - s.y; const d = Math.hypot(dx, dy); if (d < md) { md = d; ci = k; } });
            const gr = md < R, k = seeds[ci].c;
            const hot = 1 - cool; const base = hotc.map((v, q) => lerp(coldc[q], v, hot));
            x.fillStyle = gr ? 'rgb(' + base.map(v => Math.round(clamp(v * (1 + k), 0, 255))).join(',') + ')' : 'rgb(' + hotc.map((v, q) => Math.round(lerp(v, 255, 0) * (.85 + hot * .15))).join(',') + ')';
            if (pour > 0 && (i / nx) < pour * 1.05) x.fillRect(mx + i * CW, my + j * CW, CW + .6, CW + .6);
            if (gr && j % 1 === 0) { const edge = md > R - .018; if (edge) { x.fillStyle = 'rgba(30,20,10,.35)'; x.fillRect(mx + i * CW, my + j * CW, CW + .6, CW + .6); } }
          }
          /* ағын */
          x.save(); x.translate(180, 56); x.rotate(.7 * (1 - clamp(pp * 4, 0, 1)) - .3); x.beginPath(); x.moveTo(-60, 0); x.lineTo(60, 0); x.lineTo(40, 70); x.lineTo(-40, 70); x.closePath(); x.fillStyle = '#64748b'; x.fill(); x.restore();
          if (pp < .3) { x.strokeStyle = 'rgb(255,150,50)'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(225, 100); x.lineTo(mx + pour * 330, my + 4); x.stroke(); }
          /* термометр */
          const Tc = Math.round(lerp(1100, 20, cool)); G.txt(x, Tc + ' °C', 560, 200, { size: 22, color: Tc > 400 ? '#ea580c' : '#2563eb', weight: 900 });
          if (cool > .8) G.txt(x, T('Қорытпа дайын: түйірлі құрылым', 'Сплав готов: зернистая структура'), 320, 392, { size: 18, color: D.col.ink, weight: 900 });
        }
      }
    };
  }
});

/* ---------- Қорытпа құрылымы ---------- */
Deck.add({
  id: 'astruct', ch: 4, time: 3,
  t: ['Қорытпада атомдар қалай орналасады', 'Как атомы располагаются в сплаве'],
  note: ['Сұр шарлар — негізгі металдың атомдары, оранж — орынбасушы атомдар, қара кішкентай — көміртек атомдары. Орынбасу қатты ерітіндісі: екінші металдың атомдары негізгі металдың атомдарын тор түйіндерінде ауыстырады; атомдар көлемі жақын (жез Cu–Zn, мельхиор Cu–Ni). Ену қатты ерітіндісі: кішкентай атомдар (C, N, H) металл атомдарының арасындағы қуыстарға орналасады (болат Fe–C). Тағы екі түрі: интерметаллидтер (тұрақты құрамды қосылыстар, мысалы CuZn, Mg₂Pb) және әртүрлі металл кристалдарының механикалық қоспасы (қалайы–қорғасын дәнекері).',
    'Серые шары — атомы основного металла, оранжевые — замещающие атомы, тёмные маленькие — атомы углерода. Твёрдый раствор замещения: атомы второго металла заменяют часть атомов основного в узлах решётки; атомы близки по размеру (латунь Cu–Zn, мельхиор Cu–Ni). Твёрдый раствор внедрения: маленькие атомы (C, N, H) встраиваются в пустоты между атомами металла (сталь Fe–C). Ещё два типа: интерметаллиды (соединения металлов постоянного состава, например CuZn, Mg₂Pb) и механические смеси кристалликов разных металлов (припой Sn–Pb).'],
  bridge: ['Енді басты сұрақ: қорытпа неге берік?', 'Главный вопрос: почему сплав прочнее?'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:700px;height:420px" data-a="l"><div id="asHost"></div>
        <div class="abs" style="left:14px;top:12px;z-index:3"><div class="tabs sm noswipe" id="asTabs"><button data-k="sub" class="on">${L('Орынбасу', 'Замещение')}</button><button data-k="int">${L('Ену', 'Внедрение')}</button></div></div>
        <div class="abs" style="right:14px;top:12px;z-index:3"><button class="btn sm ghost" id="asRe"></button></div></div>
      <div class="c f1" style="gap:10px" id="asInfo"></div>
    </div>`,
  init(root) {
    const W = 700, H = 420, cv = D.cv($('#asHost', root), W, H);
    const cols = 10, rows = 6, sp = 56, ox = (W - (cols - 1) * sp) / 2, oy = 88;
    let kind = 'sub', t = 0, prog = 0; const info = $('#asInfo', root);
    const subs = [[1, 1], [3, 2], [5, 1], [7, 3], [2, 4], [6, 4], [8, 2], [4, 0]], gaps = [[1, 1], [3, 2], [5, 1], [7, 3], [2, 4], [6, 3], [8, 1], [4, 2]];
    const INF = {
      sub: ['Орынбасу қатты ерітіндісі', 'Твёрдый раствор замещения', 'Екінші металдың атомдары тор түйіндерінде негізгі атомдарды ауыстырады. Атомдар көлемі жақын.', 'Атомы второго металла заменяют часть атомов основного в узлах решётки. Атомы близки по размеру.', ['жез Cu–Zn', 'мельхиор Cu–Ni'], ['латунь Cu–Zn', 'мельхиор Cu–Ni']],
      int: ['Ену қатты ерітіндісі', 'Твёрдый раствор внедрения', 'Кішкентай атомдар (C, N, H) металл атомдарының арасындағы қуыстарға орналасады.', 'Маленькие атомы (C, N, H) встраиваются в пустоты между атомами металла.', ['болат Fe–C'], ['сталь Fe–C']]
    };
    const render = () => {
      const f = INF[kind];
      info.innerHTML = `<div class="card tint"><h3 style="font-size:23px">${L(f[0], f[1])}</h3><div class="t2" style="margin-top:6px">${L(f[2], f[3])}</div><div class="r wrap" style="gap:8px;margin-top:10px">${f[4].map((q, i) => `<span class="chip k">${L(q, f[5][i])}</span>`).join('')}</div></div>
        <div class="card"><div class="lbl" style="margin-bottom:8px">${L('Тағы екі түрі', 'Ещё два типа')}</div>
          <div class="t2" style="font-size:17px;margin-bottom:6px"><b>${L('Интерметаллид', 'Интерметаллид')}</b> — ${L('тұрақты құрамды қосылыс (CuZn, Mg₂Pb)', 'соединение постоянного состава (CuZn, Mg₂Pb)')}</div>
          <div class="t2" style="font-size:17px"><b>${L('Механикалық қоспа', 'Механическая смесь')}</b> — ${L('әртүрлі кристалдар араласқан (дәнекер Sn–Pb)', 'кристаллики разных металлов (припой Sn–Pb)')}</div></div>
        <div class="key"><span class="lb">${L('Ой', 'Мысль')}</span><span class="t" style="font-size:18px">${L('Бөтен атом торды бұрмалайды — ол келесі экранда қасиетке әсер етеді.', 'Чужой атом искажает решётку — это влияет на свойства (следующий экран).')}</span></div>`;
      $('#asRe', root).textContent = T('↺ Қайталау', '↺ Повторить'); $$('#asTabs button', root).forEach(b => b.classList.toggle('on', b.dataset.k === kind));
    };
    const play = () => { prog = 0; D.tween(3.4, v => { prog = v; }, { ease: ease.lin }); };
    $$('#asTabs button', root).forEach(b => b.onclick = () => { kind = b.dataset.k; render(); play(); D.beep('pop'); });
    $('#asRe', root).onclick = play; render();
    return {
      lang: render, enter() { kind = 'sub'; render(); play(); },
      tick(dt) {
        t += dt; const x = cv.begin();
        const list = kind === 'sub' ? subs : gaps;
        const dist = (i, j) => { let dx = 0, dy = 0; if (kind === 'int') list.forEach((g, k) => { const a = clamp((prog * 8 - k) , 0, 1); const gx = g[0] + .5, gy = g[1] + .5, ddx = i - gx, ddy = j - gy, d = Math.hypot(ddx, ddy); if (d < 1.6 && d > .01) { const f = (1.6 - d) * .22 * a; dx += ddx / d * f; dy += ddy / d * f; } }); return [dx, dy]; };
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const [dx, dy] = dist(i, j); let px = ox + (i + dx) * sp, py = oy + (j + dy) * sp, col = '#94a3b8', r = 20;
          if (kind === 'sub') { const k = list.findIndex(s => s[0] === i && s[1] === j); if (k >= 0) { const a = clamp(prog * 8 - k, 0, 1); if (a > 0) { col = '#ff8a1f'; r = 20 + Math.sin(a * Math.PI) * 6; } } }
          G.ball(x, px, py, r, col);
        }
        if (kind === 'int') list.forEach((g, k) => { const a = clamp(prog * 8 - k, 0, 1); if (a <= 0) return; const gx = ox + (g[0] + .5) * sp, gy = oy + (g[1] + .5) * sp; const sx = gx + (1 - ease.out(a)) * 120, sy = gy - (1 - ease.out(a)) * 80; G.ball(x, sx, sy, 9, '#1e293b'); G.txt(x, 'C', sx, sy, { size: 10, color: '#fff', weight: 900 }); });
        G.txt(x, kind === 'sub' ? T('Cu (сұр) + Zn (оранж)', 'Cu (серый) + Zn (оранжевый)') : T('Fe (сұр) + C (қара)', 'Fe (серый) + C (чёрный)'), W / 2, 398, { size: 17, color: D.col.ink2, weight: 900 });
      }
    };
  }
});

/* ---------- Қорытпа неге берік ---------- */
Deck.add({
  id: 'astrong', ch: 4, time: 4,
  t: ['Бөтен атом — қабат жолындағы «тас»', 'Чужой атом — «камень» на пути слоёв'],
  note: ['Таза металда барлық атом бірдей, қабаттар бір-бірінің үстінен оңай сырғиды — металл жұмсақ. Басқа өлшемді атом торды бұрмалайды: көрші қатарлар иіледі де, қабатты жылжыту қиындайды. Бұрмалану неғұрлым күшті болса, қаттылық пен беріктік соғұрлым жоғары. Дәл сол бұрмаланулар электрондардың қозғалысына да кедергі келтіреді — сондықтан қорытпалар ток нашар өткізеді. Мысал: мыс жұмсақ, бірақ 10 % қалайы қосқанда қола 2–3 есе қатты. Таза темір жұқа сымда қолмен иіледі, ал 0,8 % көміртегі бар болат серіппе мен құрал жасауға жарайды. Ұқсату: тегіс едендегі жәшік оңай сырғиды, шегелер қағылған едендегі — қиын.',
    'В чистом металле все атомы одинаковы, и слои легко скользят — металл мягкий. Атом другого размера искажает решётку: соседние ряды изгибаются, и сдвинуть слой труднее. Чем сильнее искажения — тем выше твёрдость и прочность. Те же искажения мешают движению электронов — поэтому сплавы хуже проводят ток. Пример: медь мягкая, но если добавить 10 % олова, получится бронза, в 2–3 раза твёрже. Чистое железо в тонкой проволоке гнётся руками, а сталь с 0,8 % углерода идёт на пружины и инструменты. Аналогия: по гладкому полу ящик скользит легко, по полу с вбитыми гвоздями — с трудом.'],
  bridge: ['Енді таза металл мен қорытпаны жүйелі салыстырайық', 'Теперь сравним чистый металл и сплав по пунктам'],
  html: () => `
    <div class="r" style="gap:16px">
      <div class="c f1"><div class="panel" style="height:292px" data-a="l"><div id="stP"></div><div class="abs chip k" style="left:12px;top:10px">${L('Таза металл', 'Чистый металл')}</div><div class="abs t2 num" id="stPr" style="right:14px;top:12px;font-weight:900"></div></div></div>
      <div class="c f1"><div class="panel" style="height:292px" data-a="r"><div id="stA"></div><div class="abs chip" style="left:12px;top:10px;border-color:var(--c4);background:color-mix(in srgb,var(--c4) 14%,var(--card))">${L('Қорытпа (Cu + Sn)', 'Сплав (Cu + Sn)')}</div><div class="abs t2 num" id="stAr" style="right:14px;top:12px;font-weight:900"></div></div></div>
    </div>
    <div class="card" data-a style="--d:.3s;margin-top:12px"><div class="r ctr" style="gap:16px"><b class="t2" style="white-space:nowrap">${L('Күш: итеру', 'Сила: толкаем')}</b><input type="range" id="stF" min="0" max="100" value="0" class="f1"><b class="num" id="stFv" style="width:40px">0</b><button class="btn sm ghost" id="stRes">↺</button></div></div>
    <div class="r" style="gap:16px;margin-top:12px"><div class="key f1" data-a style="--d:.45s"><span class="lb">${L('Қорытынды', 'Вывод')}</span><span class="t" style="font-size:18px">${L('Бұрмаланған тор → қабат қиын сырғиды → қорытпа <b>қатты және берік</b>. Бірақ электрондар да <b>шашырайды</b> → ток нашар өтеді.', 'Искажённая решётка → слой трудно сдвинуть → сплав <b>твёрже и прочнее</b>. Но электроны тоже <b>рассеиваются</b> → ток проходит хуже.')}</span></div>
      <div class="card" data-a="r" style="--d:.55s;width:370px"><div class="t2" style="font-size:17px">${L('<b>Мысал:</b> Cu + 10 % Sn = қола, мыстан <b>2–3 есе</b> қатты.', '<b>Пример:</b> Cu + 10 % Sn = бронза, в <b>2–3 раза</b> твёрже меди.')}</div></div></div>`,
  init(root) {
    const W = 592, H = 292, cp = D.cv($('#stP', root), W, H), ca = D.cv($('#stA', root), W, H);
    const cols = 8, rows = 4, sp = 60, ox = (W - (cols - 1) * sp) / 2 + 0, oy = 74; let F = 0, t = 0;
    const fv = $('#stFv', root), sl = $('#stF', root);
    sl.oninput = () => { F = +sl.value; fv.textContent = F; };
    $('#stRes', root).onclick = () => { F = 0; sl.value = 0; fv.textContent = 0; };
    const THR = { p: 18, a: 64 };
    const drawL = (cv, alloy) => {
      const x = cv.begin(), shift = clamp((F - THR[alloy ? 'a' : 'p']) / 36, 0, 1) * sp * 1.0;
      const fx = 3, fy = 1; /* бөтен атом орны */
      for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) {
        let px = ox + i * sp + (j < 2 ? shift : 0), py = oy + j * sp * .9, r = 22, col = j < 2 ? '#6d8fe0' : '#93a8d8';
        if (alloy) {
          const dx = i - fx, dy = j - fy, d = Math.hypot(dx, dy);
          if (i === fx && j === fy) { r = 30; col = '#ff8a1f'; }
          else if (d < 2.3) { const k = (2.3 - d) * 6; px += dx / (d || 1) * k * .6; py += dy / (d || 1) * k * .6; }
        }
        if (px < -30 || px > W + 30) continue; G.ball(x, px, py, r, col);
      }
      x.strokeStyle = 'rgba(244,63,94,.5)'; x.setLineDash([8, 7]); x.lineWidth = 3; x.beginPath(); x.moveTo(8, oy + sp * 1.45); x.lineTo(W - 8, oy + sp * 1.45); x.stroke(); x.setLineDash([]);
      if (shift > 2) { G.arrow(x, 40, oy - 34, 40 + clamp(shift, 20, 120), oy - 34, '#f43f5e', 5); }
      const ok = shift > 4; const pr = $(alloy ? '#stAr' : '#stPr', root); pr.innerHTML = ok ? '<span class="bad">' + T('сырғыды!', 'сдвинулся!') + '</span>' : '<span class="ok">' + T('орнында', 'на месте') + '</span>';
      /* электрон жолы */
      const ey = 262, ex = ((t * (alloy ? 90 : 190)) % (W + 40)) - 20; let eyy = ey;
      if (alloy) { const dd = Math.abs(ex - 180); if (dd < 90) eyy = ey - Math.sin((1 - dd / 90) * Math.PI) * 26 * Math.sign(Math.sin(ex * .1)); eyy += Math.sin(ex * .07) * 4; }
      x.strokeStyle = 'rgba(255,138,31,.3)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, ey); x.lineTo(W, ey); x.stroke(); G.e(x, ex, eyy, 5);
      G.txt(x, alloy ? T('электрон шашырайды → ток аз', 'электрон рассеивается → ток слабее') : T('электрон еркін өтеді → ток көп', 'электрон проходит свободно → ток больше'), W / 2, 282, { size: 16, color: D.col.ink2, weight: 900 });
    };
    return { enter() { F = 0; sl.value = 0; fv.textContent = 0; }, tick(dt) { t += dt; drawL(cp, false); drawL(ca, true); } };
  }
});

/* ---------- Таза металл мен қорытпа ---------- */
Deck.add({
  id: 'compare', ch: 4, time: 3,
  t: ['Қорытпа таза металдан несімен ерекшеленеді', 'Чем сплав отличается от чистого металла'],
  note: ['Қорытынды: қорытпаны таза металда жоқ қасиеттер үйлесімін алу үшін жасайды. Балқу: таза металл тұрақты температурада балқиды (Sn 232 °C, Pb 327 °C), қорытпа төменірек және температура аралығында (дәнекер Sn–Pb ≈ 183 °C). Электр өткізгіштік: сымдар таза мыстан жасалады, себебі қорытпада тор бұрмаланған. Коррозия: темір тот басады, ал тот баспайтын болат (Fe + Cr + Ni) тот баспайды. Түсі: жез сары, мельхиор күміс түсті.',
    'Вывод: сплав создают, чтобы получить нужное сочетание свойств, которого нет у чистого металла. Плавление: чистый металл — при постоянной температуре (Sn 232 °C, Pb 327 °C), сплав — обычно ниже и в интервале температур (припой Sn–Pb ≈ 183 °C). Электропроводность: провода из чистой меди, т.к. в сплаве решётка искажена. Коррозия: железо ржавеет, нержавеющая сталь (Fe + Cr + Ni) не ржавеет. Цвет: латунь жёлтая, мельхиор серебристый.'],
  fact: ['<p>Тот баспайтын болаттың бетінде хромның <b>өздігінен қалпына келетін</b> оксид қабықшасы бар: сызылса да, ауа оттегімен қайта түзіледі. Ал Үндістандағы Дели темір бағанасы <b>1600 жылдан астам</b> тот баспай тұр!</p>', '<p>На нержавеющей стали есть оксидная плёнка хрома, которая <b>сама восстанавливается</b> после царапины. А железная колонна в Дели стоит <b>более 1600 лет</b> и почти не ржавеет!</p>'],
  bridge: ['Темір қорытпаларының екі негізгі түрі: шойын мен болат', 'Два главных сплава железа: чугун и сталь'],
  html: () => {
    const R = [
      ['Қаттылық, беріктік', 'Твёрдость, прочность', 30, 82], ['Пластикалық', 'Пластичность', 84, 52], ['Электр өткізгіштік', 'Электропроводность', 92, 38],
      ['Балқу температурасы', 'Плавление', null, null, 'Тұрақты t° (Sn 232 °C)', 'При постоянной t° (Sn 232 °C)', 'Төмен, аралықта (Sn–Pb ≈ 183 °C)', 'Ниже, в интервале (Sn–Pb ≈ 183 °C)'],
      ['Коррозияға төзімділік', 'Стойкость к коррозии', null, null, 'Темір тот басады', 'Железо ржавеет', 'Тот баспайтын болат: Fe + Cr + Ni', 'Нержавеющая сталь: Fe + Cr + Ni'],
      ['Түсі', 'Цвет', null, null, 'Металдың өз түсі', 'Свой цвет металла', 'Өзгереді: жез сары, мельхиор күміс', 'Меняется: латунь жёлтая, мельхиор серебристый'],
      ['Құрамы', 'Состав', null, null, 'Бір элемент', 'Один элемент', 'Екі не одан көп; құрамын өзгертуге болады', 'Два и более; состав можно менять']];
    return `<div style="display:grid;grid-template-columns:230px 1fr 1fr;gap:14px 14px;align-items:center"><div></div>
      <div class="chip" data-a style="justify-content:center;font-size:19px;padding:7px"><i class="dot" style="background:#94a3b8"></i>${L('Таза металл', 'Чистый металл')}</div><div class="chip k" data-a style="justify-content:center;font-size:19px;padding:7px;--ac:var(--c4)"><i class="dot" style="background:var(--c4)"></i>${L('Қорытпа', 'Сплав')}</div>
      ${R.map((r, i) => `<div class="t2" data-a style="font-weight:900;color:var(--ink);--d:${.1 + i * .1}s">${L(r[0], r[1])}</div>` +
        (r[2] != null ? `<div data-a style="--d:${.15 + i * .1}s"><div class="bar" style="height:26px"><i class="cmpb" data-w="${r[2]}" style="background:#94a3b8"></i></div></div><div data-a style="--d:${.2 + i * .1}s"><div class="bar" style="height:26px"><i class="cmpb" data-w="${r[3]}" style="background:var(--c4)"></i></div></div>`
          : `<div class="card" data-a style="--d:${.15 + i * .1}s;padding:6px 12px"><span class="t2" style="font-size:17px">${L(r[4], r[5])}</span></div><div class="card tint" data-a style="--d:${.2 + i * .1}s;padding:6px 12px;--ac:var(--c4)"><span class="t2" style="font-size:17px;color:var(--ink)">${L(r[6], r[7])}</span></div>`)).join('')}</div>`;
  },
  init(root) { return { enter() { $$('.cmpb', root).forEach(b => { b.style.width = '0'; }); D.later(() => $$('.cmpb', root).forEach((b, i) => { b.style.transitionDelay = i * .08 + 's'; b.style.width = b.dataset.w + '%'; }), 500); } }; }
});

/* ---------- Шойын мен болат ---------- */
Deck.add({
  id: 'steel', ch: 4, time: 5,
  t: ['Шойын мен болат: көміртек шешеді', 'Чугун и сталь: решает углерод'],
  note: ['Мақсат 9.1.4.4. Шойында көміртегі көп (2,14–6,67 %, көбіне 2–4 %): ол қатты әрі морт темір карбиді Fe₃C және графит қосындыларын түзеді, олар металл негізді үзеді. Болатта көміртек аз (≤ 2,14 %, көбіне 0,1–1,5 %) — темірдің пластикалығы сақталады, бірақ беріктігі артады. Шойын ≈ 1150–1200 °C-та балқиды, қалыпқа жақсы құйылады; болат ≈ 1450–1520 °C. Шойынды доманда темір кенінен алады; болатты шойыннан (артық С-ны жағып) немесе металл сынығынан алады. Тот баспайтын болатта кемінде 10,5–12 % хром бар: ол бетінде тығыз оксид қабықшасын түзеді.',
    'Мақсат 9.1.4.4. В чугуне много углерода (2,14–6,67 %, обычно 2–4 %): он образует твёрдый и хрупкий карбид железа Fe₃C и включения графита, которые разрывают металлическую основу. В стали углерода мало (до 2,14 %, обычно 0,1–1,5 %) — сохраняется пластичность железа, но прочность выше. Чугун плавится при ≈ 1150–1200 °C, хорошо заполняет формы; сталь — ≈ 1450–1520 °C. Чугун получают в доменной печи из железной руды; сталь — из чугуна (выжигают лишний C) или из металлолома. Нержавеющая сталь содержит не менее 10,5–12 % хрома: он образует на поверхности плотную оксидную плёнку.'],
  ans: ['Болат: көміртек ≤ 2,14 % — берік, серпімді, соғылады. Шойын: 2,14–6,67 % — қатты, бірақ морт. Негізгі себеп: шойында көп Fe₃C және графит.', 'Сталь: углерод ≤ 2,14 % — прочная, упругая, куётся. Чугун: 2,14–6,67 % — твёрдый, но хрупкий. Причина: в чугуне много Fe₃C и графита.'],
  fact: ['<p>Шығыстың даңқты <b>булат</b> (дамаск) болаты — көміртегі мол тигельді болат: оның қылышы өткір де, иілгіш те болған деген аңыз бар. Қазақстанда шойын мен болатты толық циклмен <b>Теміртаудағы Qarmet</b> шығарады.</p>', '<p>Знаменитый <b>булат</b> (дамасская сталь) — тигельная сталь с высоким содержанием углерода: клинки из неё славились остротой и гибкостью. В Казахстане полный цикл чугун → сталь выпускает <b>Qarmet в Темиртау</b>.</p>'],
  bridge: ['Енді басқа қорытпаларды көрейік: қола, жез, дюралюминий…', 'Теперь другие сплавы: бронза, латунь, дюралюминий…'],
  html: () => `
    <div class="r" style="gap:16px">
      <div class="c" style="width:640px;gap:10px">
        <div class="card" data-a="l"><div class="r ctr" style="gap:12px"><b class="t2" style="white-space:nowrap">${L('Көміртек, %', 'Углерод, %')}</b><div style="flex:1;position:relative"><div class="zbar"><i style="width:32.1%;background:var(--c4)"></i><i style="width:67.9%;background:#475569"></i></div><input type="range" id="stC" min="0" max="667" value="80" style="position:absolute;left:0;top:-9px;background:transparent" class="plain"></div><b class="num" id="stCv" style="font-size:26px;width:78px">0,8</b></div>
          <div class="r sb2 sm" style="margin-top:6px"><span>0</span><span style="margin-left:6%">${L('БОЛАТ ≤ 2,14', 'СТАЛЬ ≤ 2,14')}</span><span>${L('ШОЙЫН 2,14–6,67', 'ЧУГУН 2,14–6,67')}</span><span>6,67</span></div></div>
        <div class="panel" style="height:292px;--d:.2s" data-a="l"><div id="stHost"></div></div>
      </div>
      <div class="c f1" style="gap:10px"><div class="card tint" data-a="r" id="stBox" style="--d:.2s"></div>
        <div class="card" data-a="r" style="--d:.35s"><div class="lbl" style="margin-bottom:6px">${L('Қасиеттер', 'Свойства')}</div>
          ${[['Қаттылық', 'Твёрдость', 'h', '#8b5cf6'], ['Пластикалық', 'Пластичность', 'p', '#16a34a']].map(m => `<div class="r ctr" style="gap:10px;margin:5px 0"><span class="sm" style="width:110px">${L(m[0], m[1])}</span><div class="bar f1" style="height:16px"><i id="g${m[2]}" style="background:${m[3]};transition:width .3s"></i></div></div>`).join('')}</div>
      </div>
    </div>`,
  init(root) {
    const W = 640, H = 292, cv = D.cv($('#stHost', root), W, H), sl = $('#stC', root), cvv = $('#stCv', root), box = $('#stBox', root), gh = $('#gh', root), gp = $('#gp', root);
    let C = .8, t = 0; const cols = 10, rows = 4, sp = 56, ox = 64, oy = 58;
    const gaps = []; for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) gaps.push([i, j]);
    const order = gaps.map((g, k) => ({ g, k, r: (k * 37) % gaps.length })).sort((a, b) => a.r - b.r).map(o => o.g);
    const cracks = Array.from({ length: 6 }, (_, i) => ({ x: rnd(80, 560), y: rnd(60, 200), a: rnd(-1, 1), l: rnd(40, 90) }));
    const zone = () => C < .02 ? 0 : C <= 2.14 ? 1 : 2;
    const ROWS = {
      0: [['Таза темір', 'Чистое железо'], ['Жұмсақ, иілгіш: қолмен иіледі.', 'Мягкое, гнётся руками.']],
      1: [['Болат', 'Сталь'], null], 2: [['Шойын', 'Чугун'], null]
    };
    const render = () => {
      const z = zone();
      const rows_ = [
        [['Көміртек', 'Углерод'], ['≤ 2,14 % (көбіне 0,1–1,5 %)', 'до 2,14 % (обычно 0,1–1,5 %)'], ['2,14–6,67 % (көбіне 2–4 %)', '2,14–6,67 % (обычно 2–4 %)']],
        [['Қоспалар', 'Примеси'], ['легірлеуші: Cr, Ni, Mn, V, Mo, W', 'легирующие: Cr, Ni, Mn, V, Mo, W'], ['Si, Mn, S, P', 'Si, Mn, S, P']],
        [['Қасиеті', 'Свойства'], ['берік, серпімді, соғылады, шынығады', 'прочная, упругая, куётся, закаливается'], ['қатты, бірақ морт: жарылады', 'твёрдый, но хрупкий: раскалывается']],
        [['Балқу', 'Плавление'], ['≈ 1450–1520 °C', '≈ 1450–1520 °C'], ['≈ 1150–1200 °C, құйылады', '≈ 1150–1200 °C, хорошо льётся']],
        [['Қолдану', 'Применение'], ['рельс, арматура, құбыр, құрал, пышақ', 'рельсы, арматура, трубы, инструменты, ножи'], ['табаға, батарея, ванна, станина, люк', 'сковороды, батареи, ванны, станины, люки']]];
      const name = z === 0 ? T('Таза темір', 'Чистое железо') : z === 1 ? T('Болат', 'Сталь') : T('Шойын', 'Чугун');
      box.innerHTML = `<div class="r ctr sb2"><h3 style="color:${z === 2 ? '#475569' : 'var(--c4)'}">${name}</h3><span class="chip k">${T('Fe + C', 'Fe + C')}</span></div>` +
        (z === 0 ? `<div class="t2" style="margin-top:6px">${T('Көміртек жоқ: таза темір жұмсақ, иілгіш.', 'Углерода нет: чистое железо мягкое, пластичное.')}</div>` :
          rows_.map(r => `<div class="r" style="gap:8px;margin:4px 0;align-items:baseline"><b class="sm" style="width:88px;flex:none">${T(r[0][0], r[0][1])}</b><span class="t2" style="font-size:17px;line-height:1.25">${T(r[z][0], r[z][1])}</span></div>`).join(''));
    };
    const upd = () => { C = sl.value / 100; cvv.textContent = C.toFixed(2).replace('.', ',').replace(/0$/, ''); gh.style.width = clamp(C / 6.67 * 100 * 1.0 + 8, 0, 100) + '%'; gp.style.width = clamp(100 - C / 6.67 * 100 * 1.25 - 2, 4, 100) + '%'; render(); };
    sl.oninput = upd;
    return {
      lang: render, enter() { sl.value = 80; upd(); },
      tick(dt) {
        t += dt; const x = cv.begin(), z = zone(), n = Math.floor(C / 6.67 * 27);
        const cr = z === 2 ? clamp((C - 2.14) / 2, 0, 1) : 0;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) G.ball(x, ox + i * sp + (j % 2 ? 0 : 0), oy + j * sp * .9, 21, z === 2 ? '#8896ab' : '#9fb0c9');
        for (let k = 0; k < n; k++) { const g = order[k]; if (!g) break; const px = ox + (g[0] + .5) * sp, py = oy + (g[1] + .5) * sp * .9; G.ball(x, px, py, z === 2 ? 11 : 8, z === 2 ? '#0f172a' : '#1e293b'); }
        if (z === 2) { x.strokeStyle = 'rgba(225,29,72,' + cr + ')'; x.lineWidth = 3; cracks.forEach((c, i) => { if (i / 6 > cr + .2) return; x.beginPath(); x.moveTo(c.x, c.y); for (let s = 1; s <= 5; s++) x.lineTo(c.x + Math.cos(c.a + (s % 2 ? .6 : -.6)) * c.l * s / 5, c.y + Math.sin(c.a + (s % 2 ? .6 : -.6)) * c.l * s / 5 + s * 2); x.stroke(); }); G.txt(x, 'Fe₃C + ' + T('графит', 'графит'), 520, 276, { size: 17, color: '#be123c', weight: 900 }); }
        G.txt(x, T('Fe атомдары (сұр) + C атомдары (қара)', 'Атомы Fe (серые) + атомы C (чёрные)'), 190, 22, { size: 17, color: D.col.ink2, weight: 900 });
        G.txt(x, z === 0 ? T('таза темір', 'чистое железо') : z === 1 ? T('болат: көміртек аз — пластикалық сақталады', 'сталь: C мало — пластичность сохраняется') : T('шойын: C көп — морт', 'чугун: C много — хрупкий'), 320, 276, { size: 17, color: z === 2 ? '#be123c' : '#15803d', weight: 900 });
      }
    };
  }
});

/* ---------- Қорытпалар карточкалары ---------- */
Deck.add({
  id: 'acards', ch: 4, time: 4,
  t: ['Қорытпа vs таза металл', 'Сплавы против чистых металлов'],
  note: ['Карточканы басып аударыңыз: артықшылығы, кемшілігі және қолданылуы. Артықшылық пен кемшілік — таза негізгі металмен салыстырғанда. Сыныпқа сұрақ: сымдарды неге таза мыстан жасайды, жезден емес? (Жауабы: қорытпада тор бұрмаланған, электрондар шашырайды — ток нашар өтеді.)',
    'Нажмите на карточку, чтобы перевернуть: плюсы, минусы и применение — относительно чистого основного металла. Вопрос классу: почему провода делают из чистой меди, а не из латуни? (Ответ: в сплаве решётка искажена, электроны рассеиваются — ток проходит хуже.)'],
  ans: ['Сымдар таза мыстан жасалады: қорытпада (жез, қола) кристалл тордың бұрмалануы электрондарды шашыратады, сондықтан электр өткізгіштігі төмен.', 'Провода делают из чистой меди: в сплавах (латунь, бронза) искажённая решётка рассеивает электроны, поэтому электропроводность ниже.'],
  fact: ['<p>Париж-2024 Олимпиадасы медалдарының ортасына <b>Эйфель мұнарасының</b> түпнұсқа темірінен кесілген алтыбұрышты бөлік салынған. Темір бұл мұнарада жүз жылдан астам тұр.</p>', '<p>В центр медалей Олимпиады-2024 в Париже вставлен шестиугольный фрагмент <b>оригинального железа Эйфелевой башни</b>, простоявшего там больше ста лет.</p>'],
  bridge: ['Бәрін сынап көрейік: өз қорытпаңды жасап ал!', 'Проверим себя: сделай свой сплав!'],
  html: () => {
    const A = [
      ['Болат', 'Сталь', 'Fe + C (≤ 2,14 %) + Cr, Ni…', '#64748b', 'Таза темірден бірнеше есе берік әрі қатты; шынығады; тот баспайтын болат тот баспайды.', 'В разы прочнее и твёрже железа; закаливается; нержавеющая сталь не ржавеет.', 'Көміртекті болат тот басады; С көп болса морт болады.', 'Углеродистая сталь ржавеет; с ростом C хрупче.', 'көпір, рельс, машина, ыдыс', 'мосты, рельсы, машины, посуда'],
      ['Шойын', 'Чугун', 'Fe + C (2,14–6,67 %) + Si, Mn', '#334155', 'Ең арзан; қалыпқа тамаша құйылады; қатты, дірілді басады.', 'Самый дешёвый; отлично льётся; твёрдый, гасит вибрации.', 'Морт: соғылмайды, иілмейді, соққыдан жарылады.', 'Хрупкий: не куётся, не гнётся, раскалывается.', 'табаға, батарея, станок корпусы', 'сковороды, батареи, корпуса станков'],
      ['Қола', 'Бронза', 'Cu + Sn (~20 % дейін)', '#b7791f', 'Мыстан әлдеқайда қатты әрі берік, тозуға төзімді, жақсы құйылады.', 'Намного твёрже и прочнее меди, износостойкая, хорошо льётся.', 'Жезден қымбат (қалайы қымбат); ток нашар өткізеді.', 'Дороже латуни (олово дорогое); хуже проводит ток.', 'ескерткіш, қоңырау, мойынтірек, медаль', 'памятники, колокола, подшипники, медали'],
      ['Жез', 'Латунь', 'Cu + Zn (10–45 %)', '#e6b422', 'Мыстан берік әрі арзан, әдемі «алтын» түсті, оңай өңделеді.', 'Прочнее и дешевле меди, красивый «золотой» цвет, легко обрабатывается.', 'Теңіз суында мырышын жоғалтып бұзылады; ток нашар өткізеді.', 'В морской воде теряет цинк и разрушается; хуже проводит ток.', 'кран, есік тұтқасы, гильза, саксофон', 'краны, дверные ручки, гильзы, саксофоны'],
      ['Дюралюминий', 'Дюралюминий', 'Al + Cu (~4 %) + Mg + Mn', '#94a3b8', 'Таза Al-дан бірнеше есе берік, жеңілдігі сол (2,8 г/см³).', 'В несколько раз прочнее Al при почти той же лёгкости (2,8 г/см³).', 'Коррозияға төзімсіз (таза Al қабатымен жабады), нашар дәнекерленеді.', 'Хуже противостоит коррозии, плохо сваривается.', 'ұшақ, зымыран, вагон, велосипед', 'самолёты, ракеты, вагоны, велосипеды'],
      ['Мельхиор', 'Мельхиор', 'Cu + Ni (5–30 %) + Fe, Mn', '#cbd5e1', 'Күміс түсті, коррозияға өте төзімді (теңіз суында да), мыстан берік.', 'Серебристый, очень стойкий к коррозии (в т.ч. в морской воде), прочнее меди.', 'Мыстан қымбат (никель қымбат); ток нашар өткізеді.', 'Дороже меди (никель дорогой); плохо проводит ток.', 'ас құралдары, монета, кеме бөлшектері', 'столовые приборы, монеты, детали кораблей']];
    return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;height:420px">${A.map((a, i) => `<div class="flip" data-a="pop" style="--d:${.08 + i * .08}s"><div class="fl"><div class="ff" style="background:linear-gradient(135deg,${G.shade(a[3], .35)},${a[3]} 55%,${G.shade(a[3], -.3)})"><div class="fnm">${L(a[0], a[1])}</div><div class="fco">${a[2]}</div><div class="fhint">${L('басып аудар ↻', 'нажми, чтобы перевернуть ↻')}</div></div>
      <div class="fb"><div><b class="ok">✓</b> ${L(a[4], a[5])}</div><div><b class="bad">✕</b> ${L(a[6], a[7])}</div><div class="chip k" style="font-size:16px;margin-top:2px">${L(a[8], a[9])}</div></div></div></div>`).join('')}</div>
      <div class="chip k" data-a style="--d:.8s;margin-top:12px;font-size:17px">${L('Сұрақ: сымдарды неге таза мыстан жасайды, жезден емес?', 'Вопрос: почему провода делают из чистой меди, а не из латуни?')}</div>`;
  },
  init(root) { $$('.flip', root).forEach(f => f.onclick = () => { f.classList.toggle('on'); D.beep('pop'); }); return { enter() { $$('.flip', root).forEach(f => f.classList.remove('on')); } }; }
});

/* ---------- Мини-ойын: Қорытпа шебері ---------- */
Deck.add({
  id: 'agame', ch: 4, time: 5,
  t: ['Ойын: Қорытпа шебері', 'Игра: Мастер сплавов'],
  note: ['Оқушылар тапсырмаға сай элементтерді таңдап, «Балқыту» батырмасын басады. Дұрыс рецептер: қола — Cu + Sn; жез — Cu + Zn; болат — Fe + C; дюралюминий — Al + Cu + Mg + Mn; мельхиор — Cu + Ni; тот баспайтын болат — Fe + C + Cr + Ni. Қате болса, ойын кеңес береді. Ойынды жұппен немесе командамен ойнатуға болады.',
    'Ученики выбирают элементы по заданию и нажимают «Плавить». Верные рецепты: бронза — Cu + Sn; латунь — Cu + Zn; сталь — Fe + C; дюралюминий — Al + Cu + Mg + Mn; мельхиор — Cu + Ni; нержавеющая сталь — Fe + C + Cr + Ni. При ошибке игра даёт подсказку. Можно играть парами или командами.'],
  ans: ['1 Қола: Cu + Sn · 2 Жез: Cu + Zn · 3 Болат: Fe + C · 4 Дюралюминий: Al + Cu + Mg + Mn · 5 Мельхиор: Cu + Ni · 6 Тот баспайтын болат: Fe + C + Cr + Ni.', '1 Бронза: Cu + Sn · 2 Латунь: Cu + Zn · 3 Сталь: Fe + C · 4 Дюралюминий: Al + Cu + Mg + Mn · 5 Мельхиор: Cu + Ni · 6 Нержавеющая сталь: Fe + C + Cr + Ni.'],
  bridge: ['Ал бүгінгі ғылым қандай жаңа қорытпалар ойлап тапты?', 'А какие новые сплавы придумала современная наука?'],
  html: () => `
    <div class="r" style="gap:16px">
      <div class="c" style="width:470px;gap:10px">
        <div class="card tint" data-a="l"><div class="r ctr sb2"><span class="lbl">${L('Тапсырма', 'Задание')} <b id="agN" class="num"></b></span><span class="chip" id="agStars" style="font-size:18px"></span></div><div class="t" id="agTask" style="margin-top:6px;font-size:21px"></div></div>
        <div class="card" data-a="l" style="--d:.15s"><div class="lbl" style="margin-bottom:8px">${L('Элементтер сөресі (таңда)', 'Полка элементов (выбери)')}</div><div class="r wrap" id="agShelf" style="gap:8px"></div></div>
        <div class="r" style="gap:10px"><button class="btn" id="agGo" style="flex:1;justify-content:center;font-size:21px">${L('🔥 Балқыту', '🔥 Плавить')}</button><button class="btn ghost" id="agClr">${L('Тазалау', 'Очистить')}</button></div>
        <div class="key" id="agMsg" style="opacity:0;transition:opacity .3s"><span class="lb" id="agLb"></span><span class="t" id="agTx" style="font-size:18px"></span></div>
      </div>
      <div class="panel f1" style="height:468px" data-a="r"><div id="agHost"></div></div>
    </div>`,
  init(root) {
    const W = 690, H = 468, cv = D.cv($('#agHost', root), W, H);
    const EL = ['Cu', 'Zn', 'Sn', 'Ni', 'Fe', 'C', 'Al', 'Mg', 'Mn', 'Cr'], COL = { Cu: '#d98324', Zn: '#a9bccb', Sn: '#c4c9d1', Ni: '#b4bcc6', Fe: '#8d99ab', C: '#1e293b', Al: '#b9c7d6', Mg: '#d3d9e2', Mn: '#a4a0b0', Cr: '#a9b4c2' };
    const LV = [
      { n: ['Қола', 'Бронза'], t: ['Қоңырау құю керек: мыстан қатты, берік және жақсы құйылатын қорытпа.', 'Нужно отлить колокол: сплав твёрже меди, прочный и хорошо льётся.'], r: ['Cu', 'Sn'], c: '#b7791f' },
      { n: ['Жез', 'Латунь'], t: ['Саксофон мен есік тұтқасы үшін: «алтын» түсті, мыстан арзан.', 'Для саксофона и дверных ручек: «золотого» цвета, дешевле меди.'], r: ['Cu', 'Zn'], c: '#e6b422' },
      { n: ['Болат', 'Сталь'], t: ['Рельс пен көпір үшін: берік әрі серпімді темір қорытпасы.', 'Для рельсов и мостов: прочный и упругий сплав железа.'], r: ['Fe', 'C'], c: '#64748b' },
      { n: ['Дюралюминий', 'Дюралюминий'], t: ['Ұшақ үшін: алюминийден берік, бірақ жеңіл (4 элемент).', 'Для самолёта: прочнее алюминия, но лёгкий (4 элемента).'], r: ['Al', 'Cu', 'Mg', 'Mn'], c: '#94a3b8' },
      { n: ['Мельхиор', 'Мельхиор'], t: ['Монета үшін: күміс түсті, тот баспайды (мыс негізінде).', 'Для монеты: серебристый, не корродирует (на основе меди).'], r: ['Cu', 'Ni'], c: '#cbd5e1' },
      { n: ['Тот баспайтын болат', 'Нержавеющая сталь'], t: ['Асүй құралы үшін: темір + көміртек және тот баспау үшін 2 қоспа.', 'Для кухонных приборов: железо + углерод и две добавки против ржавчины.'], r: ['Fe', 'C', 'Cr', 'Ni'], c: '#9fb0c9' }
    ];
    let lv = 0, sel = new Set(), tries = 0, melt = 0, state = 'idle', score = 0, t = 0; const pel = [];
    const shelf = $('#agShelf', root), msg = $('#agMsg', root);
    const feed = (lb, tx, ok) => { $('#agLb', root).textContent = lb; $('#agLb', root).style.background = ok ? 'var(--ok)' : 'var(--bad)'; $('#agTx', root).innerHTML = tx; msg.style.opacity = 1; msg.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)'; };
    const draw = () => {
      const L_ = LV[lv]; $('#agN', root).textContent = (lv + 1) + ' / ' + LV.length; $('#agTask', root).innerHTML = '<b class="ac">' + T(L_.n[0], L_.n[1]) + '.</b> ' + T(L_.t[0], L_.t[1]);
      $('#agStars', root).textContent = '★ ' + score;
      shelf.innerHTML = EL.map(e => `<button class="agE ${sel.has(e) ? 'on' : ''}" data-e="${e}" style="--ec:${COL[e]}">${e}</button>`).join('');
      $$('.agE', root).forEach(b => b.onclick = () => { const e = b.dataset.e; if (state === 'melting') return; if (sel.has(e)) sel.delete(e); else { sel.add(e); for (let i = 0; i < 4; i++) pel.push({ e, x: 220 + rnd(-90, 90), y: -rnd(20, 80), vy: 0, in: false }); } state = 'idle'; melt = 0; draw(); D.beep('pop'); });
    };
    $('#agClr', root).onclick = () => { sel.clear(); pel.length = 0; state = 'idle'; melt = 0; msg.style.opacity = 0; draw(); };
    $('#agGo', root).onclick = () => {
      if (!sel.size) { feed(T('Кеңес', 'Подсказка'), T('Алдымен сөреден элементтерді таңда.', 'Сначала выбери элементы на полке.'), false); D.beep('no'); return; }
      const need = LV[lv].r, ok = need.length === sel.size && need.every(e => sel.has(e)); state = 'melting'; melt = 0; tries++;
      D.tween(2.6, v => { melt = v; }, { ease: ease.lin, done: () => {
        if (ok) { const st = tries === 1 ? 3 : tries === 2 ? 2 : 1; score += st; state = 'done'; $('#agStars', root).textContent = '★ ' + score; const pt = D.at($('#agGo', root)); D.confetti(pt.x, pt.y, 80); D.beep('win');
          feed(T('Дұрыс!', 'Верно!'), T('Сен ' + LV[lv].n[0] + ' жасадың! ' + '★'.repeat(st) + (lv < LV.length - 1 ? ' Келесі тапсырма…' : ' Ойын аяқталды!'), 'Ты получил(а) ' + LV[lv].n[1] + '! ' + '★'.repeat(st) + (lv < LV.length - 1 ? ' Следующее задание…' : ' Игра окончена!')), true);
          D.later(() => { if (lv < LV.length - 1) { lv++; sel.clear(); pel.length = 0; tries = 0; state = 'idle'; melt = 0; msg.style.opacity = 0; draw(); } }, 2600);
        } else { state = 'idle'; melt = 0; const miss = need.filter(e => !sel.has(e)), extra = [...sel].filter(e => !need.includes(e));
          feed(T('Әлі емес', 'Пока нет'), (miss.length ? T('Жетіспейді: ', 'Не хватает: ') + '<b>' + miss.length + '</b> ' + T('элемент. ', 'элемент(а). ') : '') + (extra.length ? T('Артық: ', 'Лишнее: ') + '<b>' + extra.join(', ') + '</b>. ' : '') + T('Негізгі металл: ' + need[0], 'Основной металл: ' + need[0]), false); D.beep('no'); }
      } });
      D.beep('pop');
    };
    draw();
    return {
      lang() { draw(); }, enter() { lv = 0; sel.clear(); pel.length = 0; tries = 0; score = 0; state = 'idle'; melt = 0; msg.style.opacity = 0; draw(); },
      tick(dt) {
        t += dt; const x = cv.begin(), cx = W / 2, top = 190, bot = 400, hot = state === 'melting' ? 1 : 0;
        const g = x.createRadialGradient(cx, bot + 60, 10, cx, bot + 60, 280); g.addColorStop(0, 'rgba(249,115,22,' + (.25 + hot * .5) + ')'); g.addColorStop(1, 'rgba(249,115,22,0)'); x.fillStyle = g; x.fillRect(0, 180, W, 288);
        G.txt(x, T('Қорытпа қазаны', 'Тигель для сплава'), cx, 40, { size: 20, color: D.col.ink2, weight: 900 });
        x.beginPath(); x.moveTo(cx - 150, top); x.lineTo(cx + 150, top); x.lineTo(cx + 110, bot); x.lineTo(cx - 110, bot); x.closePath(); x.fillStyle = 'rgba(100,116,139,.3)'; x.fill();
        x.save(); x.clip();
        const n = sel.size, L_ = LV[lv], lvl = lerp(bot, top + 70, clamp(n / 3, 0, 1) * .9 + (n ? .1 : 0)) ;
        if (n) { const mixc = [...sel].reduce((a, e) => { const c = parseInt(COL[e].slice(1), 16); return [a[0] + (c >> 16), a[1] + ((c >> 8) & 255), a[2] + (c & 255)]; }, [0, 0, 0]).map(v => v / n);
          const res = state === 'done' || (state === 'melting' && melt > .6) ? parseInt(L_.c.slice(1), 16) : null; const col = res != null ? [res >> 16, (res >> 8) & 255, res & 255] : mixc;
          x.beginPath(); x.moveTo(cx - 160, lvl); for (let k = 0; k <= 16; k++) x.lineTo(cx - 160 + k * 20, lvl + Math.sin(t * 3 + k) * 2.4); x.lineTo(cx + 160, bot); x.lineTo(cx - 160, bot); x.closePath();
          const gg = x.createLinearGradient(0, lvl, 0, bot); gg.addColorStop(0, 'rgb(' + col.map(v => Math.round(clamp(v + 30 * hot, 0, 255))).join(',') + ')'); gg.addColorStop(1, 'rgb(' + col.map(v => Math.round(v * .7)).join(',') + ')'); x.fillStyle = gg; x.fill();
          if (hot) for (let k = 0; k < 18; k++) { const a = k * 1.3 + t * 3; x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(cx + Math.cos(a) * (30 + k * 6), lvl + 30 + Math.sin(a * 1.3) * 12, 3, 0, 6.283); x.fill(); } }
        x.restore();
        x.strokeStyle = '#475569'; x.lineWidth = 9; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - 150, top); x.lineTo(cx - 110, bot); x.lineTo(cx + 110, bot); x.lineTo(cx + 150, top); x.stroke();
        for (let i = pel.length - 1; i >= 0; i--) { const p = pel[i]; if (!sel.has(p.e)) { pel.splice(i, 1); continue; } if (!p.in) { p.vy += 900 * dt; p.y += p.vy * dt; if (p.y > top + 60) p.in = true; } if (!p.in) G.ball(x, p.x, p.y, 11, COL[p.e]); }
        [...sel].forEach((e, i) => { const px = 90 + i * 78, py = 120; G.ball(x, px, py, 22, COL[e]); G.txt(x, e, px, py + 1, { size: 17, color: e === 'C' ? '#fff' : '#14213d', weight: 900 }); });
        if (state === 'done') { const L2 = LV[lv]; G.rr(x, cx - 110, 420, 220, 34, 10); const mg = x.createLinearGradient(cx - 110, 0, cx + 110, 0); mg.addColorStop(0, G.shade(L2.c, .4)); mg.addColorStop(.5, L2.c); mg.addColorStop(1, G.shade(L2.c, -.3)); x.fillStyle = mg; x.fill(); G.txt(x, T(L2.n[0], L2.n[1]), cx, 438, { size: 18, color: '#14213d', weight: 900 }); }
        if (!n) G.txt(x, T('← элементтерді таңда', '← выбери элементы'), cx, 300, { size: 20, color: D.col.ink2, weight: 900 });
      }
    };
  }
});

/* ---------- Бүгінгі ғылым ---------- */
Deck.add({
  id: 'science', ch: 4, time: 3,
  t: ['Ғылым бүгін: жаңа қорытпалар', 'Наука сегодня: новые сплавы'],
  note: ['Дереккөздер: Berkeley Lab (2022) — CrCoNi қорытпасы туралы; Nature (2023), «Strong and ductile titanium–oxygen–iron alloys by additive manufacturing». Жоғары энтропиялы қорытпа: бір негізгі металдың орнына бірнеше металл тең үлеспен. CrCoNi 2022 жылы материалдардың ішіндегі ең жоғары үзілуге төзімділікті көрсетті және аязда (−253 °C) бұрынғыдан да берік әрі пластикалық болды. Қазақстан титан губкасын шығарады (ӨКТМК, Өскемен) — соңғы бөліммен байланыс.',
    'Источники: Berkeley Lab (2022) о сплаве CrCoNi; Nature (2023), «Strong and ductile titanium–oxygen–iron alloys by additive manufacturing». Высокоэнтропийный сплав: вместо одного основного металла — смесь нескольких в равных долях. CrCoNi в 2022 году показал самую высокую вязкость разрушения, когда-либо измеренную у материала, и на холоде (−253 °C) стал ещё прочнее и пластичнее. Казахстан выпускает титановую губку (УКТМК, Усть-Каменогорск) — связь с последним блоком.'],
  fact: ['<p>iPhone 15 Pro корпусы <b>титан қорытпасынан</b> жасалған: жеңіл және берік. Ал «Терминатор-2» фильміндегі сұйық металл — ойдан шыққан, бірақ галлий қорытпасы <b>галинстан</b> бөлме температурасында шынымен сұйық!</p>', '<p>Корпус iPhone 15 Pro сделан из <b>титанового сплава</b>: лёгкий и прочный. А «жидкий металл» из «Терминатора-2» — вымысел, но галлиевый сплав <b>галинстан</b> и правда жидкий при комнатной температуре!</p>'],
  bridge: ['Қорытпаларды білдік. Ал металдың өзі рудадан қалай алынады?', 'Про сплавы поняли. А как сам металл получают из руды?'],
  html: () => `
    <div class="r" style="gap:14px">${[
      ['Жоғары энтропиялы қорытпалар', 'Высокоэнтропийные сплавы', '5 және одан көп металл тең үлеспен', '5 и более металлов в равных долях', 'CrCoNi (хром–кобальт–никель) 2022 жылы ең жоғары үзілуге төзімділікті көрсетті; −253 °C-та әлі берік әрі пластикалық.', 'Сплав CrCoNi в 2022 году показал рекордную вязкость разрушения; при −253 °C стал ещё прочнее и пластичнее.', 'sci1'],
      ['Титан–оттек–темір', '3D-басып шығару, 2023', 'Титан–кислород–железо', '3D-печать, 2023', 'Оттек пен темір әдетте титанның «зиянды» қоспасы. Ғалымдар одан 3D-принтерде берік әрі пластикалық қорытпа басып шығарды (Nature).', 'Кислород и железо обычно считают «вредными» примесями титана. Учёные напечатали из них на 3D-принтере прочный и пластичный сплав (Nature).', 'sci2'],
      ['Al–Li қорытпалары', 'ұшақ және зымыран', 'Сплавы Al–Li', 'самолёты и ракеты', 'Литий — ең жеңіл металл. 1–2 % литий алюминий қорытпасын жеңіл әрі қатаң етеді: ұшақ қабығы мен зымыран бактарына жарайды.', 'Литий — самый лёгкий металл. Добавка 1–2 % лития делает сплав легче и жёстче: обшивка самолётов, баки ракет.', 'sci3']
    ].map((c, i) => `<div class="card" data-a="pop" style="--d:${.1 + i * .12}s;width:390px"><h3 style="font-size:22px;color:var(--ac)">${L(c[0], c[2])}</h3><span class="chip" style="margin:6px 0 4px;font-size:16px">${L(c[1], c[3])}</span><div class="cvh sc" data-k="${c[6]}" style="margin:6px 0"></div><div class="t2" style="font-size:17px;line-height:1.35">${L(c[4], c[5])}</div></div>`).join('')}</div>
    <div class="key" data-a style="--d:.6s;margin-top:14px"><span class="lb">${L('Қызық', 'Интересно')}</span><span class="t" style="font-size:19px">${L('Қазір жаңа қорытпаларды <b>жасанды интеллект</b> іздейді: компьютер миллиондаған құрамды қарап шығып, ең перспективтілерін ұсынады.', 'Сегодня новые сплавы ищет <b>искусственный интеллект</b>: компьютер перебирает миллионы составов и предлагает самые перспективные.')}</span><span id="sciAI" style="flex:none;font-family:monospace;font-weight:900;color:var(--ac);font-size:18px;width:130px;text-align:right"></span></div>`,
  init(root) {
    const cvs = $$('.sc', root).map(h => ({ k: h.dataset.k, cv: D.cv(h, 350, 130) })); let t = 0; const ai = $('#sciAI', root);
    const PAL = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];
    return {
      tick(dt) {
        t += dt; ai.textContent = (Math.floor((t * 91237) % 9999999) + 1000000).toLocaleString('en-US').replace(/,/g, ' ');
        cvs.forEach(({ k, cv }) => {
          const x = cv.begin();
          if (k === 'sci1') {
            for (let j = 0; j < 5; j++) for (let i = 0; i < 14; i++) { const h = ((Math.floor(Math.sin(i * 12.9 + j * 78.2 + Math.floor(t * 1.2) * 3.1) * 43758.5) % 5) + 5) % 5; const c = PAL[h]; G.ball(x, 28 + i * 24, 22 + j * 24, 10, c); }
          } else if (k === 'sci2') {
            const lay = Math.floor((t * 3) % 8); for (let j = 0; j < lay; j++) for (let i = 0; i < 12; i++) G.ball(x, 60 + i * 20 + (j % 2) * 10, 112 - j * 13, 8, i === 4 + (j % 3) ? '#ff8a1f' : '#94a3b8');
            const lx = 60 + ((t * 120) % 240); x.strokeStyle = '#ef4444'; x.lineWidth = 3; x.beginPath(); x.moveTo(lx, 6); x.lineTo(lx, 112 - lay * 13); x.stroke(); x.fillStyle = 'rgba(239,68,68,.35)'; x.beginPath(); x.arc(lx, 112 - lay * 13, 8, 0, 6.283); x.fill(); G.txt(x, T('лазер', 'лазер'), lx, 14, { size: 14, color: '#ef4444', weight: 900 });
          } else {
            const tilt = Math.sin(t * 1.4) * .04 + .13; x.save(); x.translate(175, 74); x.fillStyle = '#64748b'; x.beginPath(); x.moveTo(0, 0); x.lineTo(-20, 54); x.lineTo(20, 54); x.closePath(); x.fill(); x.rotate(-tilt);
            G.rr(x, -140, -6, 280, 10, 5); x.fillStyle = '#334155'; x.fill(); [[-110, 'Al', '#b9c7d6', 40], [110, 'Al–Li', '#9fd0e8', 34]].forEach(([bx, nm, c, hh]) => { x.save(); x.translate(bx, 0); x.rotate(tilt); G.rr(x, -34, -hh - 6, 68, hh, 6); x.fillStyle = c; x.fill(); G.txt(x, nm, 0, -hh / 2 - 6, { size: 17, color: '#14213d', weight: 900 }); x.restore(); }); x.restore();
            G.txt(x, T('Al–Li жеңілірек', 'Al–Li легче'), 175, 14, { size: 16, color: D.col.ink2, weight: 900 });
          }
        });
      }
    };
  }
});
