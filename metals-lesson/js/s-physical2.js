/* ===== 2-тарау: Физикалық қасиеттер (2-бөлім) ===== */

/* ---------- Тығыздық ---------- */
Deck.add({
  id: 'density', ch: 2, time: 4,
  t: ['Тығыздық: жеңіл және ауыр металдар', 'Плотность: лёгкие и тяжёлые металлы'],
  note: ['Металды таңдап, суға түсіріңіз: Li мен Na суда жүзеді (бірақ сумен қатты әрекеттеседі!). Тығыздық атом массасына, атом радиусына және қаптама тығыздығына байланысты. Литийдің атомы жеңіл, радиусы үлкен — ол судан жеңіл. Осмийдің атомы ауыр және қаптамасы өте тығыз. Жеңіл Al, Mg, Ti — авиация мен ғарыш металдары. Қызық: қолдың ұзындығы 10 см алтын кубтың массасы шамамен 19 кг.',
    'Выберите металл и бросьте его в воду: Li и Na плавают (но бурно реагируют с водой!). Плотность зависит от массы атома, его радиуса и плотности упаковки. У лития лёгкий атом и большой радиус — он легче воды. У осмия тяжёлый атом и очень плотная упаковка. Лёгкие Al, Mg, Ti — металлы авиации и космоса. Кубик золота с ребром 10 см весит около 19 кг.'],
  fact: ['<p>Қорғасын сынапта <b>жүзеді</b>! Қорғасынның тығыздығы 11,34 г/см³, ал сынаптікі — 13,53 г/см³.</p>', '<p>Свинец в ртути <b>плавает</b>! Плотность свинца 11,34 г/см³, а ртути — 13,53 г/см³.</p>'],
  bridge: ['Тығыздықтан кейін — металды қыздырсақ не болады?', 'После плотности — что будет, если металл нагревать?'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:690px;height:468px" data-a="l">
        <div class="abs r" id="dnChips" style="left:12px;top:10px;gap:4px;z-index:3"></div>
        <div id="dnHost" style="position:absolute;left:0;top:62px"></div>
        <div class="abs" style="right:12px;top:68px;z-index:3"><button class="btn sm ghost" id="dnClr"></button></div>
      </div>
      <div class="c f1" style="gap:10px">
        <div class="card" data-a="r" style="--d:.1s"><div class="lbl" style="margin-bottom:6px">${L('Тығыздық, г/см³', 'Плотность, г/см³')}</div><div id="dnBars" style="position:relative"></div></div>
        <div class="card tint" data-a="r" style="--d:.25s"><div class="r ctr sb2"><span class="t2">${L('10 см-лік куб массасы:', 'Масса куба 10 см:')}</span><span class="bigN num" id="dnMass" style="font-size:38px;color:var(--ac)">—</span></div></div>
        <div class="key" data-a="r" style="--d:.4s"><span class="lb">${L('Неге?', 'Почему?')}</span><span class="t" style="font-size:17px">${L('Тығыздық атом массасына, радиусына және қаптама тығыздығына байланысты. <b>Al, Mg, Ti</b> — авиация металдары.', 'Плотность зависит от массы атома, его радиуса и плотности упаковки. <b>Al, Mg, Ti</b> — металлы авиации.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const W = 690, H = 406, SURF = 116, BOT = 372, SZ = 50;
    const cv = D.cv($('#dnHost', root), W, H);
    const M = [['Li', .53], ['Na', .97], ['Mg', 1.74], ['Al', 2.70], ['Ti', 4.51], ['Fe', 7.87], ['Cu', 8.96], ['Pb', 11.34], ['Au', 19.32], ['Os', 22.59]];
    const chips = $('#dnChips', root); chips.innerHTML = M.map(m => `<button class="dnc noswipe" data-s="${m[0]}" style="--mc:${MET[m[0]]}"><i></i><b>${m[0]}</b></button>`).join('');
    const bars = $('#dnBars', root);
    bars.innerHTML = M.map(m => `<div class="r ctr dnr" data-s="${m[0]}" style="gap:8px;margin:2.5px 0"><b style="width:26px;font-size:15px">${m[0]}</b><div class="bar" style="flex:1;height:13px"><i style="background:${m[1] < 5 ? '#22c55e' : '#f97316'};width:${Math.sqrt(m[1] / 22.59) * 100}%;transition-delay:${M.indexOf(m) * .05}s"></i></div><span class="num sm" style="width:46px;text-align:right;font-size:14px">${String(m[1]).replace('.', ',')}</span></div>`).join('') +
      `<div class="abs" style="left:calc(34px + (100% - 34px - 54px) * .4725);top:-4px;bottom:-2px;border-left:3px dashed var(--bad);pointer-events:none"></div>
       <div class="abs sm" style="right:0;bottom:-20px;font-size:13px;color:var(--bad)">${L('5 г/см³: жеңіл | ауыр', '5 г/см³: лёгкие | тяжёлые')}</div>`;
    const blocks = [], parts = []; let t = 0, sel = null;
    const mass = $('#dnMass', root);
    const sync = () => { $('#dnClr', root).textContent = T('Тазалау', 'Очистить'); };
    $('#dnClr', root).onclick = () => { blocks.length = 0; };
    const drop = sym => {
      const m = M.find(q => q[0] === sym); sel = m;
      const n = blocks.length % 10, bx = 70 + n * 56 + rnd(-6, 6);
      blocks.push({ s: sym, rho: m[1], x: bx, y: -SZ - 4, vy: 0, rest: false, in: false });
      mass.innerHTML = String(m[1]).replace('.', ',') + ' ' + T('кг', 'кг');
      $$('.dnr', root).forEach(r => r.classList.toggle('sel', r.dataset.s === sym));
      D.beep('pop');
    };
    $$('.dnc', root).forEach(b => b.onclick = () => drop(b.dataset.s));
    return {
      lang: sync,
      enter() { blocks.length = 0; sel = null; mass.textContent = '—'; $$('.dnr', root).forEach(r => r.classList.remove('sel')); sync(); $$('#dnBars .bar i', root).forEach(i => { const w = i.style.width; i.style.width = '0'; D.later(() => i.style.width = w, 300); }); },
      tick(dt) {
        t += dt; const x = cv.begin();
        /* су */
        const g = x.createLinearGradient(0, SURF, 0, BOT); g.addColorStop(0, 'rgba(96,165,250,.55)'); g.addColorStop(1, 'rgba(37,99,235,.75)');
        x.beginPath(); x.moveTo(24, SURF); for (let i = 0; i <= 64; i++) x.lineTo(24 + i * 10, SURF + Math.sin(t * 2.4 + i * .5) * 2.6); x.lineTo(W - 24, BOT); x.lineTo(24, BOT); x.closePath(); x.fillStyle = g; x.fill();
        x.strokeStyle = D.col.ink2; x.lineWidth = 5; x.lineJoin = 'round'; x.beginPath(); x.moveTo(24, 20); x.lineTo(24, BOT + 4); x.lineTo(W - 24, BOT + 4); x.lineTo(W - 24, 20); x.stroke();
        G.txt(x, T('су (1 г/см³)', 'вода (1 г/см³)'), W - 120, SURF + 20, { size: 15, color: '#1e3a8a', weight: 900 });
        blocks.forEach(b => {
          if (b.rest) return;
          if (!b.in && b.y + SZ >= SURF) { b.in = true; for (let k = 0; k < 14; k++) parts.push({ x: b.x + SZ / 2, y: SURF, vx: rnd(-90, 90), vy: rnd(-260, -80), l: .7 }); b.vy *= .45; }
          if (!b.in) b.vy += 1500 * dt;
          else if (b.rho >= 1) b.vy += (1100 * (1 - 1 / b.rho) - 7 * b.vy) * dt;
          else { const ty = SURF - SZ * (1 - b.rho); b.vy += (-190 * (b.y - ty) - 5.2 * b.vy) * dt; }
          b.y += b.vy * dt;
          if (b.in && b.rho >= 1) { const under = blocks.filter(o => o !== b && o.rest && Math.abs(o.x - b.x) < SZ * .9).length; const fl = BOT - SZ * (under + 1); if (b.y >= fl) { b.y = fl; b.vy = 0; b.rest = true; } }
        });
        blocks.forEach(b => {
          x.save(); x.translate(b.x + SZ / 2, b.y + SZ / 2);
          G.rr(x, -SZ / 2, -SZ / 2, SZ, SZ, 9); const c = MET[b.s], gg = x.createLinearGradient(-SZ / 2, -SZ / 2, SZ / 2, SZ / 2); gg.addColorStop(0, G.shade(c, .4)); gg.addColorStop(1, G.shade(c, -.25)); x.fillStyle = gg; x.fill(); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 2; x.stroke();
          G.txt(x, b.s, 0, -3, { size: 20, color: '#14213d', weight: 900 }); G.txt(x, String(b.rho).replace('.', ','), 0, 15, { size: 11, color: '#14213d', weight: 800 }); x.restore();
        });
        for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.l -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.l <= 0) { parts.splice(i, 1); continue; } x.fillStyle = 'rgba(191,219,254,' + p.l + ')'; x.beginPath(); x.arc(p.x, p.y, 3, 0, 6.283); x.fill(); }
        if (!blocks.length) G.txt(x, T('↑ Металды таңда — суға түседі', '↑ Выбери металл — он упадёт в воду'), W / 2, 62, { size: 20, color: D.col.ink2, weight: 900 });
      }
    };
  }
});

/* ---------- Балқу температурасы ---------- */
Deck.add({
  id: 'melting', ch: 2, time: 4,
  t: ['Металдардың балқу температурасы', 'Температура плавления металлов'],
  note: ['Температураны сырғытқышпен көтеріңіз: әр металл өз балқу температурасына жеткенде ериді. Сынап бөлме температурасында сұйық, галлий қолда ериді (36 °C), вольфрам — қыздыру шамының қылы (3422 °C). Балқыту үшін металдық байланысты әлсірету керек: ол атом көп электрон беріп, радиусы кіші болғанда күшті. Na-да 1 электрон ғана, W-де байланысқа көп электрон қатысады. Шкала −60 °C-тан басталады: сынап көрінсін деп.',
    'Поднимайте температуру ползунком: каждый металл плавится, когда достигает своей температуры плавления. Ртуть жидкая при комнатной температуре, галлий плавится в руке (36 °C), вольфрам — нить ламп накаливания (3422 °C). Чтобы расплавить металл, нужно ослабить металлическую связь: она прочнее, когда атом отдаёт больше электронов и имеет меньший радиус. У Na — 1 электрон, у W — много электронов участвуют в связи. Шкала начинается от −60 °C, чтобы показать ртуть.'],
  fact: ['<p>Галлий <b>қолда ериді</b> (балқу t° = 30 °C), ал сынап бөлме температурасында сұйық. Вольфрам 3422 °C-та ғана балқиды, сондықтан ол — қыздыру шамының қылы.</p>', '<p>Галлий <b>плавится в руке</b> (30 °C), а ртуть жидкая при комнатной температуре. Вольфрам плавится лишь при 3422 °C — поэтому из него делают нити ламп накаливания.</p>'],
  bridge: ['Қыздырдық, енді — металды сызып көрейік: қайсысы қатты?', 'Нагрели — теперь поцарапаем: какой металл твёрже?'],
  html: () => `
    <div class="panel" style="height:276px" data-a="z"><div id="meHost"></div></div>
    <div class="r" style="gap:16px;margin-top:12px">
      <div class="card f1" data-a style="--d:.3s"><div class="r ctr" style="gap:14px"><span class="bigN num" id="meT" style="min-width:210px;font-size:46px;color:var(--c5)">20 °C</span>
        <input type="range" id="meS" min="0" max="1000" value="150" class="f1"></div>
        <div class="r ctr" style="gap:10px;margin-top:10px"><button class="btn sm" id="mePlay"></button><button class="btn sm ghost" id="meHand"></button><button class="btn sm ghost" id="meRoom"></button><span class="sm f1" style="text-align:right" id="meMsg"></span></div></div>
      <div class="key" data-a="r" style="--d:.5s;width:420px"><span class="lb">${L('Неге?', 'Почему?')}</span><span class="t" style="font-size:17px">${L('Балқыту үшін металдық байланысты әлсірету керек. Ол атом <b>көп электрон</b> беріп, радиусы <b>кіші</b> болса, күштірек.', 'Чтобы расплавить, надо ослабить связь. Она прочнее, когда атом отдаёт <b>больше электронов</b> и имеет <b>меньший радиус</b>.')}</span></div>
    </div>`,
  init(root) {
    const W = 1212, H = 276, cv = D.cv($('#meHost', root), W, H);
    const M = [['Hg', -39], ['Ga', 30], ['Na', 98], ['Sn', 232], ['Pb', 327], ['Al', 660], ['Cu', 1085], ['Fe', 1538], ['Cr', 1907], ['W', 3422]];
    const slider = $('#meS', root), Tv = $('#meT', root), msg = $('#meMsg', root);
    let Tcur = 20, t = 0, hand = false, playing = null;
    const toT = s => -60 + 3560 * s * s, toS = T_ => Math.sqrt((T_ + 60) / 3560);
    const setT = T_ => { Tcur = T_; slider.value = Math.round(toS(T_) * 1000); show(); };
    const show = () => { Tv.textContent = Math.round(Tcur) + ' °C'; };
    const sync = () => { $('#mePlay', root).textContent = playing ? T('■ Тоқтату', '■ Стоп') : T('▶ Қыздыру', '▶ Нагревать'); $('#meHand', root).textContent = T('✋ Қол: 36 °C', '✋ Рука: 36 °C'); $('#meRoom', root).textContent = T('Бөлме: 20 °C', 'Комната: 20 °C'); };
    slider.oninput = () => { Tcur = toT(slider.value / 1000); hand = false; msg.textContent = ''; show(); };
    $('#mePlay', root).onclick = () => { if (playing) { playing.t = 99; playing = null; sync(); return; } hand = false; msg.textContent = ''; const from = toS(Tcur); playing = D.tween(10 * (1 - from) + .5, v => { const s = lerp(from, 1, v); Tcur = toT(s); slider.value = Math.round(s * 1000); show(); }, { ease: ease.lin, done: () => { playing = null; sync(); } }); sync(); };
    $('#meHand', root).onclick = () => { playing = null; hand = true; setT(36); msg.textContent = T('Қолда галлий ериді, ал Na мен Sn — жоқ!', 'В руке плавится галлий, а Na и Sn — нет!'); D.beep('ok'); sync(); };
    $('#meRoom', root).onclick = () => { playing = null; hand = false; msg.textContent = ''; setT(20); sync(); };
    return {
      lang: sync, enter() { Tcur = 20; slider.value = Math.round(toS(20) * 1000); hand = false; playing = null; msg.textContent = ''; show(); sync(); },
      tick(dt) {
        t += dt; const x = cv.begin();
        /* топтастыру */
        G.rr(x, 30, 22, 6 * 118 - 10, 30, 15); x.fillStyle = 'rgba(34,197,94,.18)'; x.fill(); G.txt(x, T('Оңай балқитындар (< 1000 °C)', 'Легкоплавкие (< 1000 °C)'), 30 + (6 * 118 - 10) / 2, 37, { size: 16, color: '#15803d', weight: 900 });
        G.rr(x, 30 + 6 * 118, 22, 4 * 118 - 10, 30, 15); x.fillStyle = 'rgba(239,68,68,.16)'; x.fill(); G.txt(x, T('Қиын балқитындар (> 1000 °C)', 'Тугоплавкие (> 1000 °C)'), 30 + 6 * 118 + (4 * 118 - 10) / 2, 37, { size: 16, color: '#b91c1c', weight: 900 });
        M.forEach((m, i) => {
          const cx = 30 + i * 118 + 54, base = 200, liquid = Tcur >= m[1], over = clamp((Tcur - m[1]) / 1800, 0, 1), c = MET[m[0]];
          const heatK = clamp(Tcur / 1600, 0, 1);
          x.fillStyle = 'rgba(249,115,22,' + (heatK * .22) + ')'; x.beginPath(); x.arc(cx, base - 30, 62, 0, 6.283); x.fill();
          /* кеселер */
          x.beginPath(); x.moveTo(cx - 44, base - 70); x.lineTo(cx + 44, base - 70); x.lineTo(cx + 32, base); x.lineTo(cx - 32, base); x.closePath(); x.fillStyle = '#64748b'; x.fill(); x.strokeStyle = '#334155'; x.lineWidth = 3; x.stroke();
          if (!liquid) { G.rr(x, cx - 28, base - 66, 56, 38, 8); const g = x.createLinearGradient(cx - 28, base - 66, cx + 28, base - 28); g.addColorStop(0, G.shade(c, .45)); g.addColorStop(1, G.shade(c, -.25)); x.fillStyle = g; x.fill(); x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 2; x.stroke(); }
          else {
            const lv = base - 56, hotc = [Math.round(lerp(255, 255, over)), Math.round(lerp(190, 120, over)), Math.round(lerp(120, 30, over))];
            x.beginPath(); x.moveTo(cx - 40, lv); for (let k = 0; k <= 8; k++) x.lineTo(cx - 40 + k * 10, lv + Math.sin(t * 5 + k + i) * 2.4); x.lineTo(cx + 30, base - 3); x.lineTo(cx - 30, base - 3); x.closePath();
            const g = x.createLinearGradient(0, lv, 0, base); g.addColorStop(0, G.shade(c, .35)); g.addColorStop(1, 'rgb(' + hotc.join(',') + ')'); x.fillStyle = g; x.fill();
            for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(cx - 20 + k * 20 + Math.sin(t * 3 + k) * 4, lv + 14 + Math.sin(t * 4 + i + k) * 5, 3, 0, 6.283); x.fill(); }
          }
          G.txt(x, m[0], cx, base + 24, { size: 26, color: D.col.ink, weight: 900 });
          G.txt(x, m[1] + ' °C', cx, base + 48, { size: 15, color: D.col.ink2, weight: 800 });
          G.txt(x, liquid ? T('сұйық', 'жидкий') : T('қатты', 'твёрдый'), cx, base - 86, { size: 15, color: liquid ? '#ea580c' : '#475569', weight: 900 });
          if (hand && m[0] === 'Ga') { x.fillStyle = '#f3cca0'; x.strokeStyle = '#c99a6e'; x.lineWidth = 3; G.rr(x, cx - 38, 96, 76, 34, 16); x.fill(); x.stroke(); for (let k = 0; k < 4; k++) { G.rr(x, cx - 36 + k * 19, 70 + (k === 1 || k === 2 ? -8 : 0), 15, 40, 7); x.fill(); x.stroke(); } G.txt(x, '36 °C', cx, 118, { size: 14, color: '#7c2d12', weight: 900 }); }
        });
      }
    };
  }
});

/* ---------- Қаттылық ---------- */
Deck.add({
  id: 'hardness', ch: 2, time: 4,
  t: ['Қаттылық: кім кімді сызады?', 'Твёрдость: кто кого поцарапает?'],
  note: ['Құралды (тырнақ, тиын, шыны, хром) және сынаманы таңдап, «Сыз» батырмасын басыңыз: қаттырақ зат жұмсақ затты сызады. Мохс шкаласы: тальк 1 … алмаз 10; тырнақ ≈ 2,5, шыны ≈ 5,5. Хром — ең қатты металл (8,5), шыныны сызады. Вольфрам — 7,5. Оларды құралдық болатқа қосады. Қаттылық металдық байланыс беріктігіне (электрон саны көп, радиус кіші) және қабаттардың сырғуына тәуелді. Сондықтан қорытпалар таза металдан қаттырақ. Na мен K пышақпен кесіледі, қорғасын қағазға із қалдырады.',
    'Выберите инструмент (ноготь, монета, стекло, хром) и образец, нажмите «Царапать»: более твёрдое вещество царапает более мягкое. Шкала Мооса: тальк 1 … алмаз 10; ноготь ≈ 2,5, стекло ≈ 5,5. Хром — самый твёрдый металл (8,5), царапает стекло. Вольфрам — 7,5. Их добавляют в стали для инструментов. Твёрдость растёт вместе с прочностью металлической связи (больше электронов, меньше радиус) и с тем, насколько трудно слоям сдвигаться. Поэтому сплавы обычно твёрже чистых металлов. Na и K режутся ножом, свинец оставляет след на бумаге.'],
  ans: ['Тырнақ (2,5): K, Na, Pb-ны сызады; Al (2,8) және одан қаттыны сызбайды. Мыс тиын (3): Al-ды сызады; Cu-мен тең. Шыны (5,5): Fe-ге дейін сызады; W (7,5) және Cr (8,5)-ті сызбайды. Хром (8,5): барлығын сызады, тек өзін (теңдік).', 'Ноготь (2,5): царапает K, Na, Pb; не царапает Al (2,8) и твёрже. Медная монета (3): царапает Al; с Cu — равны. Стекло (5,5): царапает вплоть до Fe; не царапает W (7,5) и Cr (8,5). Хром (8,5): царапает всё, кроме самого себя (равенство).'],
  bridge: ['Енді көзге көрінбейтін күш: магнит қай металды тартады?', 'Теперь невидимая сила: какие металлы притягивает магнит?'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="c" style="width:700px;gap:10px">
        <div class="panel" style="height:292px" data-a="l"><div id="haHost"></div></div>
        <div class="r" style="gap:14px">
          <div class="card f1" data-a style="--d:.2s"><div class="lbl" style="margin-bottom:6px">${L('1. Құрал', '1. Инструмент')}</div><div class="tabs sm noswipe" id="haTool"></div></div>
        </div>
        <div class="card" data-a style="--d:.3s"><div class="lbl" style="margin-bottom:6px">${L('2. Сынама (Мохс бойынша)', '2. Образец (по шкале Мооса)')}</div><div class="tabs sm noswipe" id="haSamp"></div></div>
      </div>
      <div class="c f1" style="gap:12px">
        <div class="card tint" data-a="r" style="--d:.2s;min-height:120px"><div class="r ctr" style="gap:12px"><button class="btn" id="haGo" style="font-size:22px">${L('Сыз!', 'Царапать!')}</button><div class="t2" id="haRes" style="font-weight:800"></div></div></div>
        <div class="card" data-a="r" style="--d:.3s"><div class="t2">${L('<b>Қатты металдар:</b> Cr (8,5), W (7,5) — болатқа қосады.<br><b>Жұмсақтар:</b> Na, K — пышақпен кесіледі; Pb қағазға із қалдырады.', '<b>Твёрдые:</b> Cr (8,5), W (7,5) — добавки в стали.<br><b>Мягкие:</b> Na, K режутся ножом; Pb оставляет след на бумаге.')}</div></div>
        <div class="key" data-a="r" style="--d:.45s"><span class="lb">${L('Неге?', 'Почему?')}</span><span class="t" style="font-size:17px">${L('Қаттылық байланыс беріктігі мен қабаттардың сырғуына байланысты. Сондықтан <b>қорытпалар</b> көбіне таза металдан қаттырақ.', 'Твёрдость растёт с прочностью связи и трудностью сдвига слоёв. Поэтому <b>сплавы</b> обычно твёрже чистых металлов.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const W = 700, H = 292, cv = D.cv($('#haHost', root), W, H);
    const S = [['K', .4, 'K'], ['Na', .5, 'Na'], ['Pb', 1.5, 'Pb'], ['Al', 2.8, 'Al'], ['Cu', 3, 'Cu'], ['Fe', 4, 'Fe'], ['W', 7.5, 'W'], ['Cr', 8.5, 'Cr']];
    const TL = [['nail', 2.5, ['Тырнақ', 'Ноготь']], ['coin', 3, ['Мыс тиын', 'Монета Cu']], ['glass', 5.5, ['Шыны', 'Стекло']], ['chrome', 8.5, ['Хром', 'Хром']]];
    let tool = null, samp = null, t = 0, anim = null; const scr = {};
    const tb = $('#haTool', root), sb = $('#haSamp', root), res = $('#haRes', root);
    const fmt = v => String(v).replace('.', ',');
    const render = () => {
      tb.innerHTML = TL.map(q => `<button data-k="${q[0]}" class="${tool === q[0] ? 'on' : ''}">${T(q[2][0], q[2][1])} · ${fmt(q[1])}</button>`).join('');
      sb.innerHTML = S.map(q => `<button data-k="${q[0]}" class="${samp === q[0] ? 'on' : ''}">${q[0]} · ${fmt(q[1])}</button>`).join('');
      $$('button', tb).forEach(b => b.onclick = () => { tool = b.dataset.k; render(); });
      $$('button', sb).forEach(b => b.onclick = () => { samp = b.dataset.k; render(); });
    };
    const go = () => {
      if (!tool || !samp) { res.innerHTML = T('Алдымен құрал мен сынаманы таңда.', 'Сначала выбери инструмент и образец.'); D.beep('no'); return; }
      const tl = TL.find(q => q[0] === tool), sp = S.find(q => q[0] === samp), nm = T(tl[2][0], tl[2][1]);
      const r = tl[1] > sp[1] ? 1 : tl[1] < sp[1] ? -1 : 0;
      anim = { t: 0, r, sp: sp[0] }; D.later(() => {
        if (r > 0) { (scr[sp[0]] = scr[sp[0]] || []).push(rnd(60, 150)); }
        res.innerHTML = r > 0 ? `<span class="ok">${T('Сызды!', 'Царапает!')}</span> ${nm} (${fmt(tl[1])}) &gt; ${sp[0]} (${fmt(sp[1])})` : r < 0 ? `<span class="bad">${T('Сызбайды.', 'Не царапает.')}</span> ${nm} (${fmt(tl[1])}) &lt; ${sp[0]} (${fmt(sp[1])})` : `<span class="ac">${T('Тең қаттылық: із қалмайды.', 'Равная твёрдость: следа нет.')}</span> ${nm} (${fmt(tl[1])}) = ${sp[0]} (${fmt(sp[1])})`;
        D.beep(r > 0 ? 'ok' : 'no');
      }, 1000);
    };
    $('#haGo', root).onclick = go; render();
    return {
      lang: render,
      enter() { tool = 'nail'; samp = 'Al'; for (const k in scr) delete scr[k]; anim = null; res.innerHTML = T('Тырнақ Al-ды сыза ала ма? Басып көр!', 'Сможет ли ноготь поцарапать Al? Нажми и проверь!'); render(); },
      tick(dt) {
        t += dt; const x = cv.begin();
        const sp = S.find(q => q[0] === samp), tl = TL.find(q => q[0] === tool);
        /* сынама блогы */
        const bx = 140, by = 84, bw = 420, bh = 112, c = samp ? MET[samp] : '#ccc';
        if (samp) {
          G.rr(x, bx, by, bw, bh, 20); const g = x.createLinearGradient(bx, by, bx + bw, by + bh); g.addColorStop(0, G.shade(c, .45)); g.addColorStop(.5, c); g.addColorStop(1, G.shade(c, -.3)); x.fillStyle = g; x.fill(); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 3; x.stroke();
          G.txt(x, samp, bx + bw - 44, by + bh - 28, { size: 40, color: 'rgba(20,33,61,.8)', weight: 900 });
          (scr[samp] || []).forEach((yy, i) => { x.strokeStyle = 'rgba(20,33,61,.55)'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx + 30, by + 20 + (i * 23) % 80); x.lineTo(bx + bw - 90, by + 20 + (i * 23) % 80 + (i % 2 ? 5 : -5)); x.stroke(); });
        }
        /* құрал */
        let tx = 600, ty = 40, press = 0;
        if (anim) { anim.t += dt; const p = clamp(anim.t / 1.1, 0, 1); tx = lerp(600, 190, ease.inout(p)); ty = lerp(40, by + 28 + ((scr[samp] || []).length % 4) * 23, ease.out(Math.min(1, p * 2.5))); press = Math.sin(p * Math.PI);
          if (p >= 1) { anim = null; } if (anim && anim.r > 0 && p > .1) { for (let k = 0; k < 2; k++) { x.fillStyle = G.shade(c, -.3); x.beginPath(); x.arc(tx + 20 + rnd(0, 30), ty + rnd(-6, 6) + 18, rnd(1.5, 3), 0, 6.283); x.fill(); } } if (anim && anim.r < 0 && p > .3 && p < .8) { tx += Math.sin(p * 60) * 5; ty -= 8; G.txt(x, '✕', tx, ty - 28, { size: 26, color: '#e11d48', weight: 900 }); } }
        x.save(); x.translate(tx, ty);
        if (tool === 'nail') { x.rotate(.5); G.rr(x, -8, -4, 52, 15, 7); x.fillStyle = '#f3cca0'; x.fill(); x.strokeStyle = '#c99a6e'; x.lineWidth = 2; x.stroke(); G.rr(x, 32, -2, 12, 11, 4); x.fillStyle = '#fff'; x.globalAlpha = .6; x.fill(); x.globalAlpha = 1; }
        else if (tool === 'coin') { G.ball(x, 10, 10, 20, '#d98324'); x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 2; x.beginPath(); x.arc(10, 10, 13, 0, 6.283); x.stroke(); G.txt(x, '₸', 10, 11, { size: 16, color: 'rgba(0,0,0,.45)' }); }
        else if (tool === 'glass') { x.rotate(.35); G.rr(x, -6, -6, 48, 22, 4); x.fillStyle = 'rgba(147,197,253,.75)'; x.fill(); x.strokeStyle = '#3b82f6'; x.lineWidth = 3; x.stroke(); }
        else if (tool === 'chrome') { x.rotate(.4); G.rr(x, -6, -6, 56, 20, 5); const gg = x.createLinearGradient(0, -6, 0, 14); gg.addColorStop(0, '#f1f5f9'); gg.addColorStop(.5, '#94a3b8'); gg.addColorStop(1, '#cbd5e1'); x.fillStyle = gg; x.fill(); x.strokeStyle = '#475569'; x.lineWidth = 2; x.stroke(); }
        x.restore();
        /* Мохс шкаласы */
        const sx0 = 40, sx1 = 660, sy = 262; x.strokeStyle = D.col.line; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(sx0, sy); x.lineTo(sx1, sy); x.stroke();
        const gx = v => sx0 + (v / 10) * (sx1 - sx0);
        for (let i = 0; i <= 10; i++) { x.fillStyle = D.col.ink3 || D.col.ink2; G.txt(x, String(i), gx(i), sy + 16, { size: 12, color: D.col.ink2, weight: 800 }); }
        S.forEach(q => { const on = q[0] === samp; x.fillStyle = on ? '#f97316' : MET[q[0]]; x.strokeStyle = on ? '#9a3412' : 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.beginPath(); x.arc(gx(q[1]), sy, on ? 8 : 5.5, 0, 6.283); x.fill(); x.stroke(); });
        if (tl) { x.fillStyle = '#3b82f6'; x.beginPath(); x.moveTo(gx(tl[1]), sy - 8); x.lineTo(gx(tl[1]) - 7, sy - 22); x.lineTo(gx(tl[1]) + 7, sy - 22); x.closePath(); x.fill(); }
        G.txt(x, T('Мохс шкаласы', 'Шкала Мооса'), 350, 226, { size: 14, color: D.col.ink2, weight: 900 });
      }
    };
  }
});

/* ---------- Магниттік қасиет ---------- */
Deck.add({
  id: 'magnet', ch: 2, time: 4,
  t: ['Магниттік қасиеттер', 'Магнитные свойства'],
  note: ['Тәжірибе: магнит темір қыстырғышты және никель тиынды тартады, бірақ алюминий фольганы мен мыс сымды тартпайды. Осыған металл сынығын сұрыптау негізделген. Fe, Co, Ni (және Gd) — ферромагнетиктер: олардың ішінде домендер бар, онда атомдардың магнит моменттері бір бағытта. Сыртқы өрісте домендер бірдей бұрылады — металл магниттеледі. Fe, Co, Ni атомдарында жұпталмаған d-электрондар көп. 770 °C-тан (Кюри нүктесі) жоғары темір ферромагнетизмін жоғалтады. Экранның оң жағында домендерді көріңіз.',
    'Опыт: магнит притягивает железную скрепку и никелевую монету, но не алюминиевую фольгу и медную проволоку. На этом основана сортировка металлолома. Fe, Co, Ni (и Gd) — ферромагнетики: внутри есть домены, где магнитные моменты атомов направлены одинаково. Во внешнем поле домены поворачиваются одинаково — металл намагничивается. У атомов Fe, Co, Ni много неспаренных d-электронов. Выше 770 °C (точка Кюри) железо теряет ферромагнетизм. Справа видны домены.'],
  fact: ['<p>Жердің ішкі қабаттары негізінен <b>темір мен никельден</b> тұрады. Жердің магнит өрісі сұйық темір-никель ядросындағы қозғалыстардан пайда болады, сондықтан компас жұмыс істейді.</p>', '<p>Недра Земли — в основном <b>железо и никель</b>. Магнитное поле планеты порождается движением жидкого железо-никелевого ядра — поэтому работает компас.</p>'],
  bridge: ['Физикалық қасиеттерді қайталайық: тор түрін анықта', 'Повторим физические свойства: определи тип решётки'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:740px;height:440px" data-a="l"><div id="mgHost"></div>
        <div class="abs sm" style="left:16px;top:12px">${L('Магнитті сүйреп, заттарға жақындат', 'Двигай магнит и подноси к предметам')}</div></div>
      <div class="c f1" style="gap:12px">
        <div class="panel" style="height:198px;--d:.15s" data-a="r"><div id="mgDom"></div><div class="abs chip k" style="left:10px;top:8px;font-size:14px;padding:2px 10px">${L('Домендер (Fe ішінде)', 'Домены (внутри Fe)')}</div></div>
        <div class="card" data-a="r" style="--d:.25s"><div class="r ctr" style="gap:10px"><span class="sm">${L('Температура', 'Температура')}</span><input type="range" id="mgT" min="20" max="1000" value="20" style="flex:1"><b class="num" id="mgTv" style="width:76px"></b></div>
          <div class="sm" id="mgMsg" style="margin-top:6px;min-height:22px"></div></div>
        <div class="key" data-a="r" style="--d:.4s"><span class="lb">${L('Неге?', 'Почему?')}</span><span class="t" style="font-size:17px">${L('Fe, Co, Ni атомдарында жұпталмаған <b>d-электрондар</b> көп, олардың магниттік моменттері параллель болады. Cu, Al, Au — тартылмайды.', 'У Fe, Co, Ni много неспаренных <b>d-электронов</b>, их моменты «договариваются» быть параллельными. Cu, Al, Au не притягиваются.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const W = 740, H = 440, cv = D.cv($('#mgHost', root), W, H), dv = D.cv($('#mgDom', root), 380, 198);
    const items = [['Fe', 'clip', 1], ['Ni', 'coin', 1], ['Co', 'ball', 1], ['Al', 'foil', 0], ['Cu', 'wire', 0], ['Au', 'ring', 0]];
    let objs, mag, temp = 20, t = 0, ptr = null, doms;
    const msg = $('#mgMsg', root), tv = $('#mgTv', root), ts = $('#mgT', root);
    const reset = () => {
      objs = items.map((it, i) => ({ k: it[0], shape: it[1], f: it[2], x: 90 + i * 112, y: 360, vx: 0, vy: 0, att: false, dx: 0, dy: 0, fall: false, msgT: 0 }));
      mag = { x: 370, y: 130 }; temp = 20; ts.value = 20; sync();
      doms = Array.from({ length: 6 * 9 }, () => ({ a: rnd(0, 6.28) }));
    };
    const sync = () => { tv.textContent = Math.round(temp) + ' °C'; msg.innerHTML = temp > 770 ? '<span class="bad">' + T('Кюри нүктесінен (770 °C) жоғары: магниттік қасиет жоғалды!', 'Выше точки Кюри (770 °C): ферромагнетизм исчез!') + '</span>' : T('Кюри нүктесі: 770 °C', 'Точка Кюри: 770 °C'); };
    ts.oninput = () => { temp = +ts.value; if (temp > 770) objs.forEach(o => { if (o.att) { o.att = false; o.fall = true; } }); sync(); };
    D.drag(cv, { down(p) { ptr = p; }, move(p) { ptr = p; }, up() { ptr = null; }, hover(p) { ptr = p; } });
    reset();
    return {
      lang: sync, enter() { reset(); },
      tick(dt) {
        t += dt; const x = cv.begin(), hotOk = temp <= 770;
        if (ptr) { mag.x += (ptr.x - mag.x) * Math.min(1, dt * 9); mag.y += (ptr.y - 40 - mag.y) * Math.min(1, dt * 9); }
        mag.x = clamp(mag.x, 40, W - 40); mag.y = clamp(mag.y, 50, 380);
        /* үстел */
        G.rr(x, 20, 392, W - 40, 30, 12); x.fillStyle = '#c9a77c'; x.fill();
        let near = 0;
        objs.forEach(o => {
          const dx = mag.x - o.x, dy = mag.y + 40 - o.y, d = Math.hypot(dx, dy);
          if (o.f && hotOk && !o.att && !o.fall) {
            if (d < 190) { const a = 1900 / (d + 30); o.vx += dx / d * a * dt * 8; o.vy += dy / d * a * dt * 8; near = Math.max(near, 1 - d / 190); }
            if (d < 34) { o.att = true; o.dx = o.x - mag.x; o.dy = o.y - mag.y; o.vx = o.vy = 0; D.beep('pop'); }
          } else if (!o.f && d < 120) o.msgT = 1.2;
          if (o.att) { o.x = mag.x + o.dx; o.y = mag.y + o.dy; near = 1; } else {
            o.vy += 900 * dt * (o.f && hotOk && d < 190 ? .1 : 1); o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= .94; o.vy *= .94;
            const floor = 392 - 14; if (o.y > floor) { o.y = floor; o.vy = 0; o.fall = false; } o.x = clamp(o.x, 30, W - 30);
          }
          o.msgT = Math.max(0, o.msgT - dt);
        });
        objs.forEach(o => {
          x.save(); x.translate(o.x, o.y); const c = MET[o.k];
          if (o.shape === 'clip') { x.strokeStyle = '#9aa7b8'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(-12, 8); x.lineTo(-12, -10); x.arc(-5, -10, 7, Math.PI, 0); x.lineTo(2, 12); x.arc(9, 12, 7, Math.PI, 0, true); x.lineTo(16, -6); x.stroke(); }
          else if (o.shape === 'coin') { G.ball(x, 0, 0, 17, '#b4bcc6'); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 11, 0, 6.283); x.stroke(); }
          else if (o.shape === 'ball') { G.ball(x, 0, 0, 14, '#7e8db4'); }
          else if (o.shape === 'foil') { G.rr(x, -20, -10, 40, 20, 4); x.fillStyle = '#d6dee8'; x.fill(); x.strokeStyle = '#9aa7b8'; x.lineWidth = 2; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.moveTo(-14, -4); x.lineTo(10, 4); x.stroke(); }
          else if (o.shape === 'wire') { x.strokeStyle = '#d98324'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i < 3; i++) x.arc(-12 + i * 12, 0, 6, Math.PI, 0, i % 2 === 1); x.stroke(); }
          else if (o.shape === 'ring') { x.strokeStyle = '#f2c230'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 11, 0, 6.283); x.stroke(); G.ball(x, 0, -14, 5, '#f43f5e'); }
          x.restore();
          G.txt(x, o.k, o.x, o.att ? o.y + 26 : 392 + 12, { size: 14, color: o.att ? D.col.ink : '#3b2a14', weight: 900 });
          if (o.msgT > 0) { x.globalAlpha = Math.min(1, o.msgT); G.txt(x, T('тартылмайды ✕', 'не тянется ✕'), o.x, o.y - 30, { size: 14, color: '#e11d48', weight: 900 }); x.globalAlpha = 1; }
        });
        /* магнит (тұяқ тәрізді) */
        x.save(); x.translate(mag.x, mag.y); x.lineWidth = 16; x.lineCap = 'butt';
        x.strokeStyle = '#ef4444'; x.beginPath(); x.arc(0, 0, 28, Math.PI, Math.PI * 1.5); x.stroke(); x.strokeStyle = '#3b82f6'; x.beginPath(); x.arc(0, 0, 28, Math.PI * 1.5, Math.PI * 2); x.stroke();
        x.strokeStyle = '#ef4444'; x.beginPath(); x.moveTo(-28, 0); x.lineTo(-28, 38); x.stroke(); x.strokeStyle = '#3b82f6'; x.beginPath(); x.moveTo(28, 0); x.lineTo(28, 38); x.stroke();
        x.fillStyle = '#e5e7eb'; x.fillRect(-36, 38, 16, 10); x.fillRect(20, 38, 16, 10); x.restore();
        G.txt(x, 'N', mag.x - 28, mag.y + 22, { size: 13, color: '#fff' }); G.txt(x, 'S', mag.x + 28, mag.y + 22, { size: 13, color: '#fff' });
        if (near > 0 && hotOk) { x.strokeStyle = 'rgba(59,130,246,' + near * .3 + ')'; x.lineWidth = 2; for (let k = 1; k < 4; k++) { x.beginPath(); x.arc(mag.x, mag.y + 40, 40 + k * 28 + Math.sin(t * 4) * 3, Math.PI * .1, Math.PI * .9); x.stroke(); } }
        /* домендер */
        const dx = dv.begin(), field = hotOk ? near : 0;
        doms.forEach((d, i) => {
          const c = i % 9, r = Math.floor(i / 9), px = 36 + c * 38, py = 46 + r * 22;
          if (field > .15) { let da = (0 - d.a); da = Math.atan2(Math.sin(da), Math.cos(da)); d.a += da * Math.min(1, dt * (2 + field * 5)); }
          else if (!hotOk) d.a += rnd(-6, 6) * dt * 8; else d.a += rnd(-1, 1) * dt * 1.2;
          dx.save(); dx.translate(px, py); dx.rotate(d.a); dx.fillStyle = hotOk ? (field > .15 ? '#3b82f6' : '#8b9db8') : '#f59e0b'; dx.beginPath(); dx.moveTo(-14, -3); dx.lineTo(6, -3); dx.lineTo(6, -8); dx.lineTo(16, 0); dx.lineTo(6, 8); dx.lineTo(6, 3); dx.lineTo(-14, 3); dx.closePath(); dx.fill(); dx.restore();
        });
        G.txt(dx, !hotOk ? T('ретсіз: ферромагнетизм жоғалды', 'хаос: ферромагнетизм пропал') : field > .15 ? T('бір бағытта → магниттелген', 'все в одну сторону → намагничен') : T('ретсіз → магниттелмеген', 'хаотично → не намагничен'), 190, 184, { size: 14, color: D.col.ink2, weight: 900 });
      }
    };
  }
});

/* ---------- Тапсырма: тор түрін анықта ---------- */
Deck.add({
  id: 'qlat', ch: 2, time: 4,
  t: ['Тапсырма: тор түрін анықта', 'Задание: определи тип решётки'],
  note: ['Подсказка: пластикалық → ГЦК; берік және қиын балқитын → ОЦК; тығыз қапталса да нашар соғылады → ГПУ. Г металы — тұзақ: тор ОЦК, W сияқты, бірақ қасиеті керісінше. Себебін талқылаңыз: 1 валенттік электрон, үлкен радиус → әлсіз металдық байланыс.',
    'Подсказка: пластичность → ГЦК; прочность и тугоплавкость → ОЦК; плохая ковкость при плотной упаковке → ГПУ. Металл Г — ловушка: решётка ОЦК, как у вольфрама, но свойства противоположные. Обсудить, почему (1 валентный электрон, большой радиус → слабая металлическая связь).'],
  ans: ['А — ГЦК (мыс Cu). Б — ОЦК (вольфрам W). В — ГПУ (магний Mg). Г — ОЦК (натрий Na): тор ОЦК, бірақ байланыс әлсіз, себебі 1 электрон.', 'А — ГЦК (медь Cu). Б — ОЦК (вольфрам W). В — ГПУ (магний Mg). Г — ОЦК (натрий Na): решётка ОЦК, но связь слабая, т.к. всего 1 электрон.'],
  bridge: ['Физикалық қасиеттер бітті. Енді химия: металдар реакцияда не істейді?', 'С физикой всё. Теперь химия: что металлы делают в реакциях?'],
  html: () => {
    const Q = [
      ['А', 'Сарғыш-қызыл, өте иілгіш, жұқа сымға созылады, электр өткізгіштігі бойынша екінші. Әр атомның 12 көршісі бар, қабаттары АВСАВС.', 'Жёлто-красный, очень пластичный, вытягивается в тончайшую проволоку, второй по электропроводности. У каждого атома 12 соседей, слои АВСАВС.', 'fcc', 'Cu — мыс', 'Cu — медь'],
      ['Б', 'Күміс-ақ, өте қатты, 3422 °C-та балқиды, аязда морт болады. Әр атомның 8 көршісі бар.', 'Серебристо-белый, очень твёрдый, плавится при 3422 °C, на морозе становится хрупким. У каждого атома 8 соседей.', 'bcc', 'W — вольфрам', 'W — вольфрам'],
      ['В', 'Жеңіл (1,74 г/см³), бөлме температурасында нашар соғылады, оңай жарылады. Қабаттары АВАВ.', 'Лёгкий (1,74 г/см³), при комнатной температуре плохо куётся и легко трескается. Слои чередуются АВАВ.', 'hcp', 'Mg — магний', 'Mg — магний'],
      ['Г', 'Жұмсақ, пышақпен кесіледі, 98 °C-та балқиды, судан жеңіл. 8 көршісі бар.', 'Мягкий, режется ножом, плавится при 98 °C, легче воды. 8 ближайших соседей.', 'bcc', 'Na — натрий (тұзақ! 1 электрон → әлсіз байланыс)', 'Na — натрий (ловушка! 1 электрон → слабая связь)']
    ];
    return `<div class="r wrap sb2" style="margin-bottom:6px" data-a><span class="chip k">${L('Кеңес:', 'Подсказка:')} ${L('иілгіш → ГЦК · берік, қиын балқитын → ОЦК · тығыз, бірақ морт → ГПУ', 'пластичный → ГЦК · прочный, тугоплавкий → ОЦК · плотный, но хрупкий → ГПУ')}</span><span class="chip" id="qlSc"></span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${Q.map((q, i) => `<div class="card ql" data-i="${i}" data-a="pop" style="--d:${.1 + i * .1}s"><div class="r ctr" style="gap:12px;align-items:flex-start"><span class="sn" style="margin:0;flex:none">${q[0]}</span><div class="t" style="font-size:18px;line-height:1.3">${L(q[1], q[2])}</div></div>
      <div class="r" style="gap:8px;margin-top:10px">${['fcc', 'bcc', 'hcp'].map(k => `<button class="btn ghost sm qb" data-k="${k}">${k === 'fcc' ? L('ГЦК', 'ГЦК') : k === 'bcc' ? L('ОЦК', 'ОЦК') : L('ГПУ', 'ГПУ')}</button>`).join('')}<span class="ans f1" style="align-self:center;font-weight:900;font-size:17px"></span></div></div>`).join('')}</div>`;
  },
  init(root) {
    const Q = [['fcc', 'Cu — мыс', 'Cu — медь'], ['bcc', 'W — вольфрам', 'W — вольфрам'], ['hcp', 'Mg — магний', 'Mg — магний'], ['bcc', 'Na — натрий (тұзақ! 1 электрон → әлсіз байланыс)', 'Na — натрий (ловушка! 1 электрон → слабая связь)']];
    let score = 0, solved = new Set();
    const sc = $('#qlSc', root), upd = () => { sc.innerHTML = T('Дұрыс: ', 'Верно: ') + '<b>' + score + ' / 4</b>'; };
    $$('.ql', root).forEach(card => {
      const i = +card.dataset.i, ans = $('.ans', card);
      $$('.qb', card).forEach(b => b.onclick = () => {
        if (solved.has(i)) return;
        if (b.dataset.k === Q[i][0]) {
          solved.add(i); score++; b.classList.add('on'); b.style.background = 'var(--ok)'; ans.innerHTML = '<span class="ok">✓ ' + L(Q[i][1], Q[i][2]) + '</span>';
          $$('.qb', card).forEach(x => x.disabled = true); card.style.borderColor = 'var(--ok)'; const p = D.at(b); D.confetti(p.x, p.y, 40); D.beep('ok'); upd();
          if (solved.size === 4) { D.later(() => D.confetti(640, 300, 120), 300); D.beep('win'); }
        } else { b.classList.add('shake'); b.style.background = 'var(--bad)'; b.style.color = '#fff'; D.beep('no'); setTimeout(() => { b.classList.remove('shake'); b.style.background = ''; b.style.color = ''; }, 600); }
      });
    });
    upd();
    return { lang: upd, enter() { score = 0; solved.clear(); upd(); $$('.ql', root).forEach(c => { c.style.borderColor = ''; $('.ans', c).innerHTML = ''; $$('.qb', c).forEach(b => { b.disabled = false; b.classList.remove('on'); b.style.background = ''; }); }); } };
  }
});
