/* ===== 2-тарау: Физикалық қасиеттер (1-бөлім) ===== */

/* ---------- Қасиеттер картасы ---------- */
Deck.add({
  id: 'hub', ch: 2, time: 1,
  t: ['Барлық қасиеттердің түбі — бір', 'У всех свойств один корень'],
  note: ['Бұл — қасиеттер картасы. Барлық физикалық қасиет екі нәрседен шығады: электрондық газ және кристалл тор. Әр түйінді басып, сәйкес экранға өтуге болады. Тізбек: пластикалық → электр және жылу өткізгіштік → жылтыр → тығыздық → балқу → қаттылық → магниттік қасиет.',
    'Это карта свойств. Все физические свойства вытекают из двух вещей: электронного газа и кристаллической решётки. Нажав на узел, можно перейти на нужный экран. Порядок: пластичность → тепло- и электропроводность → блеск → плотность → плавление → твёрдость → магнитные свойства.'],
  bridge: ['Бастайық: металл неге иіледі, ал тұз неге сынады?', 'Начнём: почему металл гнётся, а соль раскалывается?'],
  html: () => {
    const N = [
      ['plastic', 'hammer', 'Пластикалық', 'Пластичность', '--c2'], ['conduct', 'bolt', 'Электр- және жылуөткізгіштік', 'Электро- и теплопроводность', '--c1'],
      ['luster', 'sun', 'Металдық жылтыр', 'Металлический блеск', '--c6'], ['density', 'scale', 'Тығыздық', 'Плотность', '--c4'],
      ['melting', 'thermo', 'Балқу температурасы', 'Температура плавления', '--c5'], ['hardness', 'gear', 'Қаттылық', 'Твёрдость', '--c3'], ['magnet', 'magnet', 'Магниттік қасиет', 'Магнитные свойства', '--c0']];
    const cx = 606, cy = 258, rx = 440, ry = 208;
    let lines = '', nodes = '';
    N.forEach((n, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 7, px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a);
      lines += `<line class="hl" x1="${cx}" y1="${cy}" x2="${px.toFixed(0)}" y2="${py.toFixed(0)}" style="stroke:var(${n[4]})"/>`;
      nodes += `<button class="hn" data-go="${n[0]}" data-a="pop" style="left:${(px - 108).toFixed(0)}px;top:${(py - 34).toFixed(0)}px;--nc:var(${n[4]});--d:${.25 + i * .09}s"><span class="hi">${ico(n[1], 26)}</span><span class="hx">${L(n[2], n[3])}</span></button>`;
    });
    return `<svg width="1212" height="546" style="position:absolute;left:0;top:0">${lines}</svg>
      <div class="abs" id="hubC" data-a="z" style="left:${cx - 120}px;top:${cy - 120}px;width:240px;height:240px;border-radius:50%;overflow:hidden;background:var(--card);border:5px solid var(--c1);box-shadow:var(--shadow)"></div>
      <div class="abs t" data-a style="--d:.5s;left:${cx - 150}px;top:${cy + 128}px;width:300px;text-align:center;font-size:19px;font-weight:900;line-height:1.2">${L('Электрондық газ<br>+ кристалл тор', 'Электронный газ<br>+ кристаллическая решётка')}</div>${nodes}`;
  },
  init(root) {
    const cv = D.cv($('#hubC', root), 240, 240), sea = new D.Sea({ x: 16, y: 20, w: 208, h: 190, cols: 4, rows: 3, n: 16 });
    sea.speed = 60; sea.temp = .15;
    $$('.hn', root).forEach(b => b.onclick = () => D.go(D.byId(b.dataset.go)));
    return { tick(dt) { sea.update(dt); sea.draw(cv.begin(), { er: 4 }); } };
  }
});

/* ---------- Пластикалық пен морттық ---------- */
Deck.add({
  id: 'plastic', ch: 2, time: 4,
  t: ['Металл иіледі, ал тұз сынады', 'Металл гнётся, а соль раскалывается'],
  note: ['Тәжірибе: мыс сым иіледі, тұз кристалы соққыдан сынады. Металда соққыдан қабаттар сырғиды, бірақ электрондық газ иондарды ұстап тұра береді. Иондық кристалда қабат жылжығанда бірдей зарядты иондар қарсы тұрады, тебіліс туады, кристалл сынады. Морт металдар да бар: сурьма, висмут, марганец, шойын — себебі күрделі тор, ГПУ құрылымы немесе қабаттардың сырғуына кедергі жасайтын қоспалар.',
    'Опыт: медная проволока гнётся, кристаллик соли раскалывается под ударом. В металле слои сдвигаются, но электронный газ продолжает связывать ионы. В ионном кристалле при сдвиге одноимённые ионы оказываются друг напротив друга и отталкиваются — кристалл раскалывается. Хрупкие металлы тоже бывают: сурьма, висмут, марганец, чугун — из-за сложной решётки, ГПУ-строения или примесей, мешающих скольжению слоёв.'],
  fact: ['<p>Алтынды қалыңдығы шамамен <b>0,1 мкм</b> жапыраққа дейін соғуға болады: ол жарықты өткізеді! 1 г алтыннан шамамен <b>жарты шаршы метр</b> жапырақ шығады.</p>',
    '<p>Золото можно раскатать в лист толщиной около <b>0,1 мкм</b>: он просвечивает! Из 1 г золота получается примерно <b>полквадратного метра</b> листа.</p>'],
  bridge: ['Электрондық газ қозғалғыш болса, ток та өте ме? Тексерейік', 'Если электронный газ подвижен — потечёт ли ток? Проверим'],
  html: () => `
    <div class="r" style="gap:20px">
      <div class="c f1"><div class="panel" style="height:340px" data-a="l"><div id="plM"></div><div class="abs chip k" style="left:14px;top:12px">${L('Металл', 'Металл')}</div></div>
        <div class="card" data-a style="--d:.3s"><b class="ok">${L('Пластикалық', 'Пластичный')}</b> <span class="t2">${L('— қабаттар сырғиды, электрондық газ иондарды ұстап тұр.', '— слои сдвигаются, электронный газ удерживает ионы.')}</span></div></div>
      <div class="c f1"><div class="panel" style="height:340px" data-a="r"><div id="plI"></div><div class="abs chip" style="left:14px;top:12px;border-color:var(--bad)">${L('Тұз (NaCl) — иондық кристалл', 'Соль (NaCl) — ионный кристалл')}</div></div>
        <div class="card" data-a style="--d:.4s"><b class="bad">${L('Морт', 'Хрупкий')}</b> <span class="t2">${L('— бірдей иондар қарсы келіп, тебіледі де, кристалл сынады.', '— одноимённые ионы оказываются рядом, отталкиваются, кристалл раскалывается.')}</span></div></div>
    </div>
    <div class="r ctr jc" style="gap:16px;margin-top:14px"><button class="btn" id="plHit" style="font-size:22px;padding:12px 34px">${L('💥 Соққы!', '💥 Удар!')}</button>
      <div class="chip" data-a style="--d:.6s">${L('Морт металдар да бар:', 'Хрупкие металлы тоже есть:')} <b>Sb · Bi · Mn · ${L('шойын', 'чугун')}</b></div></div>`,
  init(root) {
    const W = 590, H = 340, cols = 8, rows = 5, sp = 56, x0 = (W - (cols - 1) * sp) / 2, y0 = 66;
    const cm = D.cv($('#plM', root), W, H), ci = D.cv($('#plI', root), W, H);
    const els = Array.from({ length: 26 }, () => ({ x: rnd(x0, x0 + (cols - 1) * sp), y: rnd(y0, y0 + (rows - 1) * sp), vx: rnd(-50, 50), vy: rnd(-50, 50) }));
    const S = { m: 0, i: 0, cr: 0, done: false, run: false };
    let t = 0;
    const btn = $('#plHit', root);
    const sync = () => { btn.innerHTML = S.done ? T('↺ Қайта', '↺ Заново') : T('💥 Соққы!', '💥 Удар!'); };
    btn.onclick = () => {
      if (S.run) return;
      if (S.done) { S.m = S.i = S.cr = 0; S.done = false; sync(); return; }
      S.run = true; D.beep('pop');
      D.tween(1.1, v => { S.m = v; }, { ease: ease.inout });
      D.tween(2.1, v => { S.i = Math.min(1, v / .42); S.cr = clamp((v - .42) / .58, 0, 1); }, { ease: ease.lin, done: () => { S.run = false; S.done = true; sync(); D.beep('no'); } });
    };
    return {
      lang: sync,
      enter() { S.m = S.i = S.cr = 0; S.done = false; S.run = false; sync(); },
      tick(dt) {
        t += dt;
        /* металл */
        let x = cm.begin();
        const sh = ease.inout(S.m) * sp;
        if (S.m > 0 && S.m < 1) { G.rr(x, x0 - 28, y0 + sp * 1.5 - 14, (cols - 1) * sp + 56, 28, 14); x.fillStyle = 'rgba(255,138,31,.25)'; x.fill(); }
        else if (S.m >= 1) { G.rr(x, x0 - 20, y0 + sp * 1.5 - 9, (cols - 1) * sp + 40 + sh, 18, 9); x.fillStyle = 'rgba(255,138,31,' + (.22 + .12 * Math.sin(t * 4)) + ')'; x.fill(); }
        els.forEach(e => {
          if (Math.random() < dt * 1.3) { const a = rnd(0, 6.28), s = rnd(25, 80); e.vx = Math.cos(a) * s; e.vy = Math.sin(a) * s; }
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (e.x < x0 - 20 || e.x > x0 + (cols - 1) * sp + 20 + sh) e.vx *= -1; if (e.y < y0 - 20 || e.y > y0 + (rows - 1) * sp + 20) e.vy *= -1;
        });
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) G.ion(x, x0 + i * sp + (j < 2 ? sh : 0), y0 + j * sp, 17, '+');
        els.forEach(e => G.e(x, e.x, e.y, 4));
        if (S.m >= 1) G.txt(x, T('электрондық газ ұстап тұр', 'электронный газ удерживает'), W / 2, 318, { size: 17, color: '#d97706', weight: 900 });
        /* иондық кристалл */
        x = ci.begin();
        const shI = ease.inout(S.i) * sp / 2, c = ease.out(S.cr);
        const cx0 = W / 2, cy0 = y0 + sp * 1.5;
        const drawIons = (j0, j1, ox) => { for (let j = j0; j < j1; j++) for (let i = 0; i < cols; i++) { const px = x0 + i * sp + ox, py = y0 + j * sp; ((i + j) % 2 ? G.ion(x, px, py, 17, '-', '#16a34a') : G.ion(x, px, py, 17, '+')); } };
        drawIons(2, rows, 0);
        x.save(); x.translate(cx0, cy0); x.rotate(-c * .14); x.translate(-cx0 + c * 92, -cy0 - c * 34); drawIons(0, 2, shI); x.restore();
        if (S.i > .35 && S.cr < .05) { for (let i = 0; i < cols; i++) { const px = x0 + i * sp + shI / 2, py = cy0; x.fillStyle = 'rgba(225,29,72,' + (.5 + .5 * Math.sin(t * 25)) + ')'; x.beginPath(); x.moveTo(px - 8, py - 5); x.lineTo(px + 2, py - 1); x.lineTo(px - 3, py + 2); x.lineTo(px + 8, py + 6); x.lineTo(px, py + 1); x.lineTo(px + 4, py - 2); x.closePath(); x.fill(); } G.txt(x, T('+ ⟷ +  тебіліс!', '+ ⟷ +  отталкивание!'), W / 2, 318, { size: 18, color: '#e11d48', weight: 900 }); }
        if (S.cr > 0) { x.strokeStyle = '#e11d48'; x.lineWidth = 3.5; x.beginPath(); x.moveTo(x0 - 24, cy0 + 4); for (let i = 0; i <= cols * 2; i++) x.lineTo(x0 - 24 + i * 29, cy0 + (i % 2 ? -6 : 8)); x.stroke(); }
      }
    };
  }
});

/* ---------- Электр және жылу өткізгіштік ---------- */
Deck.add({
  id: 'conduct', ch: 2, time: 5,
  t: ['Электр- және жылуөткізгіштік', 'Электро- и теплопроводность'],
  note: ['Электр: кернеу қосылғанда бос электрондар бағытталып қозғалады — ток пайда болады. Температураны көтергенде иондар қатты тербеліп, электрондарға кедергі жасайды, сондықтан металдың электр өткізгіштігі азаяды (кернеу қосып, сырғытқышты жылжытыңыз). Жылу: жылдам электрондар энергияны ыстық жерден суық жерге тасымалдайды — мыс таяқша тез қызады, ағаш — жоқ. Күміс — ең жақсы өткізгіш, бірақ тым қымбат, сондықтан сымдар мыстан және алюминийден жасалады. Қолданылуы: мыс және алюминий сымдар, мыс радиаторлар, кастрюльдер.',
    'Электричество: при напряжении свободные электроны движутся направленно — возникает ток. При нагревании ионы колеблются сильнее и мешают электронам, поэтому электропроводность падает (включите напряжение и двигайте ползунок). Тепло: быстрые электроны переносят энергию от горячего участка к холодному — медный стержень прогревается быстро, деревянный нет. Серебро — лучший проводник, но дорогое, поэтому провода делают из меди и алюминия. Применение: провода, медные радиаторы, кастрюли.'],
  fact: ['<p>Мыс сымда электрондардың орташа жылдамдығы (дрейф) — секундына <b>миллиметрдің үлесі</b>, ал сигнал жарық жылдамдығының жартысынан астам жылдамдықпен тарайды. Ток бұрыш бұрғанда электрондар бәрі бірден қозғала бастайды!</p>',
    '<p>Скорость дрейфа электронов в медном проводе — доли <b>миллиметра в секунду</b>, а сигнал распространяется со скоростью больше половины скорости света. При включении тока электроны начинают двигаться <b>все сразу</b>!</p>'],
  bridge: ['Электрондар тек ток тасымалдамайды — жарықты да «басқарады»', 'Электроны не только несут ток — они «управляют» и светом'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:790px;height:440px" data-a="l">
        <div class="abs" style="left:14px;top:12px;z-index:3"><div class="tabs noswipe" id="cdTabs"><button data-m="e" class="on">${L('⚡ Электр', '⚡ Электричество')}</button><button data-m="h">${L('🔥 Жылу', '🔥 Тепло')}</button></div></div>
        <div id="cdHost" style="position:absolute;left:0;top:56px"></div>
        <div class="abs r ctr" id="cdCtl" style="left:18px;right:18px;bottom:12px;gap:14px"></div>
      </div>
      <div class="c f1" style="gap:12px">
        <div class="card" data-a="r" style="--d:.2s" id="cdRank"><div class="lbl" style="margin-bottom:6px">${L('Электр өткізгіштік (Ag = 100)', 'Электропроводность (Ag = 100)')}</div>
          ${[['Ag', 100, '#cbd5e1'], ['Cu', 95, '#d98324'], ['Au', 65, '#f2c230'], ['Al', 60, '#9fb3c8'], ['Fe', 16, '#8d99ab']].map((r, i) => `<div class="r ctr" style="gap:8px;margin:3px 0"><b style="width:28px">${r[0]}</b><div class="bar" style="flex:1;height:14px"><i class="rk" data-w="${r[1]}" style="background:${r[2]};transition-delay:${i * .12}s"></i></div><span class="num sm" style="width:30px;text-align:right">${r[1]}</span></div>`).join('')}</div>
        <div class="key" data-a="r" style="--d:.4s"><span class="lb">${L('Неге?', 'Почему?')}</span><span class="t" style="font-size:18px" id="cdWhy"></span></div>
      </div>
    </div>`,
  init(root) {
    const W = 790, H = 336, cv = D.cv($('#cdHost', root), W, H);
    const sea = new D.Sea({ x: 118, y: 96, w: 540, h: 150, cols: 12, rows: 4, n: 50 });
    sea.speed = 55;
    let mode = 'e', on = false, temp = 0, cur = 0, t = 0, heat = false;
    const N = 44, mT = new Float32Array(N), wT = new Float32Array(N), drops = [8, 18, 28, 38].map(c => ({ c, y: 0, vy: 0, fall: false }));
    const ctl = $('#cdCtl', root), why = $('#cdWhy', root);
    const showCtl = () => {
      if (mode === 'e') {
        ctl.innerHTML = `<button class="btn sm ${on ? 'on' : ''}" id="cdOn">${on ? T('⏻ Кернеу қосулы', '⏻ Напряжение вкл.') : T('⏻ Кернеуді қосу', '⏻ Включить напряжение')}</button><span class="sm">${T('Температура', 'Температура')}</span><input type="range" id="cdT" min="0" max="100" value="${Math.round(temp * 100)}" style="flex:1"><b class="num" id="cdTv" style="width:70px">${Math.round(20 + temp * 380)} °C</b>`;
        $('#cdOn', ctl).onclick = () => { on = !on; D.beep('pop'); showCtl(); };
        $('#cdT', ctl).oninput = e => { temp = e.target.value / 100; sea.temp = temp; $('#cdTv', ctl).textContent = Math.round(20 + temp * 380) + ' °C'; };
        why.innerHTML = L('Қызғанда иондар қатты тербеліп, электрондарға <b>бөгет жасайды</b> — ток азаяды.', 'При нагревании ионы сильнее колеблются и <b>мешают</b> электронам — ток уменьшается.');
      } else {
        ctl.innerHTML = `<button class="btn sm ${heat ? 'on' : ''}" id="cdHeat">${heat ? T('🔥 Қыздырылуда', '🔥 Нагревается') : T('🔥 Қыздыру', '🔥 Нагреть')}</button><button class="btn sm ghost" id="cdRes">${T('↺ Қайта', '↺ Заново')}</button><span class="sm f1" style="text-align:right">${T('Мұздай ұшы → қызыл: қызу қалай тарайды?', 'Как быстро тепло дойдёт до дальнего конца?')}</span>`;
        $('#cdHeat', ctl).onclick = () => { heat = !heat; D.beep('pop'); showCtl(); };
        $('#cdRes', ctl).onclick = () => { mT.fill(0); wT.fill(0); heat = false; drops.forEach(d => { d.f0 = d.f1 = null; }); showCtl(); };
        why.innerHTML = L('Жылдам <b>электрондар</b> энергияны ыстық жерден суыққа тез тасымалдайды. Ағашта бос электрон жоқ.', 'Быстрые <b>электроны</b> переносят энергию от горячего к холодному. В дереве свободных электронов нет.');
      }
    };
    $$('#cdTabs button', root).forEach(b => b.onclick = () => { mode = b.dataset.m; $$('#cdTabs button', root).forEach(x => x.classList.toggle('on', x === b)); showCtl(); D.beep('pop'); });
    const hot = v => { v = clamp(v, 0, 1); const a = [147, 197, 253], b = [252, 211, 77], c = [239, 68, 68]; const f = v < .5 ? [a, b, v * 2] : [b, c, (v - .5) * 2]; return 'rgb(' + f[0].map((q, i) => Math.round(lerp(q, f[1][i], f[2]))).join(',') + ')'; };
    const diffuse = (arr, D_, dt, src) => { const n = Math.max(1, Math.ceil(D_ * dt / .4)), h = dt / n; for (let s = 0; s < n; s++) { if (src) { arr[0] = 1; arr[1] = 1; } const nx = arr.slice(); for (let i = 0; i < N; i++) { const l = arr[Math.max(0, i - 1)], r = arr[Math.min(N - 1, i + 1)]; nx[i] = arr[i] + D_ * h * (l + r - 2 * arr[i]); } arr.set(nx); } };
    showCtl();
    return {
      lang: showCtl,
      enter() { mode = 'e'; on = false; temp = 0; sea.temp = 0; sea.field = 0; heat = false; mT.fill(0); wT.fill(0); drops.forEach(d => { d.f0 = d.f1 = null; }); $$('#cdTabs button', root).forEach(x => x.classList.toggle('on', x.dataset.m === 'e')); showCtl(); $$('.rk', root).forEach(r => r.style.width = '0'); D.later(() => $$('.rk', root).forEach(r => r.style.width = r.dataset.w + '%'), 400); },
      tick(dt) {
        t += dt; const x = cv.begin();
        if (mode === 'e') {
          sea.field = on ? 1 : 0; sea.update(dt);
          cur += ((on ? clamp(sea.avgDrift / 200, 0, 1.2) : 0) - cur) * Math.min(1, dt * 4);
          /* сым корпусы */
          G.rr(x, 104, 82, 568, 178, 26); x.fillStyle = 'rgba(148,163,184,.18)'; x.fill(); x.strokeStyle = D.col.line; x.lineWidth = 3; x.stroke();
          /* батарея */
          G.rr(x, 22, 128, 64, 80, 10); x.fillStyle = '#334155'; x.fill(); G.rr(x, 22, 128, 64, 28, 10); x.fillStyle = '#ef4444'; x.fill();
          G.txt(x, '−', 54, 142, { size: 28, color: '#fff', weight: 900 }); G.txt(x, '+', 54, 190, { size: 28, color: '#fff', weight: 900 });
          x.strokeStyle = '#64748b'; x.lineWidth = 5; x.beginPath(); x.moveTo(86, 168); x.lineTo(104, 168); x.moveTo(672, 168); x.lineTo(700, 168); x.stroke();
          /* шам */
          const br = clamp(cur, 0, 1); x.fillStyle = 'rgba(253,224,71,' + (br * .45) + ')'; x.beginPath(); x.arc(730, 168, 48, 0, 6.283); x.fill();
          x.fillStyle = br > .05 ? 'rgba(254,240,138,' + (.35 + br * .65) + ')' : '#e2e8f0'; x.strokeStyle = '#94a3b8'; x.lineWidth = 3; x.beginPath(); x.arc(730, 168, 26, 0, 6.283); x.fill(); x.stroke();
          x.strokeStyle = br > .05 ? '#f59e0b' : '#94a3b8'; x.lineWidth = 3; x.beginPath(); x.moveTo(720, 178); x.lineTo(724, 164); x.lineTo(730, 174); x.lineTo(736, 164); x.lineTo(740, 178); x.stroke();
          /* электрондық газ */
          sea.draw(x, { hot: true });
          /* амперметр */
          const gx = 400, gy = 306; x.fillStyle = D.col.card; x.strokeStyle = D.col.line; x.lineWidth = 3; x.beginPath(); x.arc(gx, gy, 42, Math.PI, 0); x.lineTo(gx + 42, gy + 20); x.lineTo(gx - 42, gy + 20); x.closePath(); x.fill(); x.stroke();
          const ang = Math.PI + clamp(cur, 0, 1.1) * Math.PI * .9; x.strokeStyle = '#e11d48'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + Math.cos(ang) * 34, gy + Math.sin(ang) * 34); x.stroke();
          G.txt(x, 'I', gx, gy + 10, { size: 16, weight: 900 });
          G.txt(x, on ? T('Ток бар: электрондар бағытталып қозғалады →', 'Ток идёт: электроны движутся направленно →') : T('Кернеу жоқ: электрондар ретсіз қозғалады', 'Напряжения нет: движение хаотичное'), 400, 70, { size: 18, color: on ? '#16a34a' : D.col.ink2, weight: 900 });
        } else {
          if (heat) { mT[0] = mT[1] = 1; wT[0] = wT[1] = 1; }
          diffuse(mT, 700, dt, heat); diffuse(wT, 9, dt, heat);
          const rods = [{ a: mT, y: 70, n: T('Мыс (металл)', 'Медь (металл)'), metal: 1 }, { a: wT, y: 214, n: T('Ағаш', 'Дерево'), metal: 0 }];
          rods.forEach((r, ri) => {
            const cw = 15, x0 = 98;
            G.txt(x, r.n, 98, r.y - 18, { size: 17, align: 'left', color: D.col.ink, weight: 900 });
            for (let i = 0; i < N; i++) { x.fillStyle = hot(r.a[i]); x.fillRect(x0 + i * cw, r.y, cw + 1, 54); }
            if (r.metal) { for (let i = 0; i < N; i += 2) for (let k = 0; k < 2; k++) { const am = 1 + r.a[i] * 3; G.ball(x, x0 + i * cw + 7 + Math.sin(t * 9 + i + k) * am, r.y + 14 + k * 26 + Math.cos(t * 8 + i) * am, 5.5, '#6d8fe0'); } }
            else { x.strokeStyle = 'rgba(120,80,40,.35)'; x.lineWidth = 2; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(x0, r.y + 10 + k * 12); x.bezierCurveTo(x0 + 200, r.y + 4 + k * 12, x0 + 400, r.y + 16 + k * 12, x0 + N * cw, r.y + 8 + k * 12); x.stroke(); } }
            G.rr(x, x0 - 2, r.y - 2, N * cw + 4, 58, 8); x.strokeStyle = D.col.ink2; x.lineWidth = 3; x.stroke();
            /* жалын */
            if (heat) { for (let k = 0; k < 3; k++) { const fh = 34 + Math.sin(t * 14 + k * 2) * 10, fx = 62 + k * 7; x.fillStyle = ['#f97316', '#fbbf24', '#fef08a'][k]; x.beginPath(); x.moveTo(fx - 14 + k * 4, r.y + 54); x.quadraticCurveTo(fx + 4, r.y + 54 - fh, fx + 14 - k * 4, r.y + 54); x.fill(); } }
            /* балауыз тамшылары */
            drops.forEach((d, di) => {
              const lt = r.a[d.c]; const key = di + ri * 10; d['f' + ri] = d['f' + ri] || { y: 0, vy: 0, fall: false };
              const f = d['f' + ri]; if (lt > .42 && !f.fall) { f.fall = true; D.beep('pop'); } if (f.fall) { f.vy += 900 * dt; f.y += f.vy * dt; }
              if (f.y < 120) { x.fillStyle = f.fall ? '#ef4444' : '#f59e0b'; x.beginPath(); x.arc(x0 + d.c * cw + 7, r.y + 62 + f.y, 7, 0, 6.283); x.fill(); }
            });
          });
          G.txt(x, T('Балауыз тамшылары қызған жерде түседі', 'Капли воска падают там, где нагрелось'), 400, 312, { size: 16, color: D.col.ink2 });
        }
      }
    };
  }
});

/* ---------- Металдық жылтыр мен түс ---------- */
Deck.add({
  id: 'luster', ch: 2, time: 4,
  t: ['Металдық жылтыр мен түс', 'Металлический блеск и цвет'],
  note: ['Бос электрондар түскен жарықтың басым бөлігін шағылыстырады, сондықтан металл жылтырайды және мөлдір емес. Көпшілік металдар күміс-ақ немесе сұр: олар барлық түсті бірдей шағылыстырады. Алтын (сары) және мыс (қызыл) көк сәулелердің бір бөлігін жұтады. Ұнтақ түрінде көпшілігі қара немесе қою сұр (жарық шашырайды); тек алюминий мен магний жылтырын сақтайды. Көрсету: мыс пластинка, алюминий фольга, темір ұнтағы (қара) және алюминий ұнтағы (жылтыр).',
    'Свободные электроны отражают почти весь падающий свет — поверхность блестит, металл непрозрачен. Большинство металлов серебристо-белые или серые: они одинаково отражают все лучи. Золото (жёлтое) и медь (красноватая) часть синих лучей поглощают. В порошке большинство металлов чёрные или тёмно-серые (свет рассеивается); блеск сохраняют алюминий и магний. Показать: медная пластинка, алюминиевая фольга, железный порошок (тёмный) и алюминиевая пудра (блестящая).'],
  fact: () => {
    const g = D.state.hook, mine = { a: ['А) тамақ', 'А) питание'], b: ['Ә) ыдыс металы', 'Б) металл посуды'], c: ['Б) өзен суы', 'В) речная вода'] }[g];
    const own = mine ? '<p class="src"><b>' + L('Сенің болжамың: ', 'Твоя гипотеза: ') + L(mine[0], mine[1]) + '</b></p>' : '';
    return ['<p><b>Б.з.б. IV ғасырда А. Македонскийдің әскері Үндістанға бет алады. Инд өзенінің жағасында әскерлердің арасында асқазан-ішек ауруы (індет) жылдам тарай бастайды, бірақ әскери қолбасшылардың бірде-біреуі ауырмайды. Қарапайым әскерлер жезден жасалған ыдысты, ал командирлер күміс ыдысты пайдаланатын болатын.</b></p><p>Себебі күміс судағы микроорганизмдерді залалсыздандыратын бактерицидтік қасиетке ие және ол жаралардың іріңдемей жылдам жазылуына көмектеседі.</p>' + own,
      '<p><b>В IV веке до н. э. армия А. Македонского направляется в Индию. На берегу Инда среди воинов быстро распространяется кишечная эпидемия, но ни один из полководцев не заболевает. Простые воины пользовались посудой из латуни, а командиры — серебряной.</b></p><p>Дело в том, что серебро обладает бактерицидным действием: обеззараживает микроорганизмы в воде и помогает ранам заживать без нагноения.</p>' + own];
  },
  ans: ['Жұмбақтың жауабы осы экрандағы «Сен білесің бе?» карточкасында: күмістің бактерицидтік қасиеті бар.', 'Ответ на загадку — в карточке «А вы знали?» на этом экране: серебро обладает бактерицидным действием.'],
  bridge: ['Енді қарапайым нәрсе: металдың нақты салмағы қандай?', 'Теперь про вес: какой металл лёгкий, а какой тяжёлый?'],
  html: () => `
    <div class="r" style="gap:18px">
      <div class="panel" style="width:680px;height:440px" data-a="l"><div id="luHost"></div>
        <div class="abs r wrap" style="left:14px;top:12px;gap:8px;max-width:640px"><div class="tabs noswipe" id="luMet">${['Ag', 'Al', 'Mg', 'Cu', 'Au', 'Fe'].map((m, i) => `<button data-m="${m}" class="${i === 0 ? 'on' : ''}">${m}</button>`).join('')}</div></div>
        <div class="abs r ctr" style="left:14px;bottom:12px;gap:12px"><button class="btn sm ghost" id="luPow"></button><span class="sm" id="luNote"></span></div>
      </div>
      <div class="c f1" style="gap:12px">
        <div class="card" data-a="r" style="--d:.15s"><div class="t2"><b class="ac">${L('Блеск.', 'Блеск.')}</b> ${L('Бос электрондар жарықты шағылыстырады — бет жылтырайды, металл мөлдір емес.', 'Свободные электроны отражают свет — поверхность блестит, металл непрозрачен.')}</div></div>
        <div class="card" data-a="r" style="--d:.25s"><div class="t2"><b class="ac">${L('Түс.', 'Цвет.')}</b> ${L('Көбі күміс-ақ, себебі барлық сәулені бірдей шағылыстырады. <b>Au</b> мен <b>Cu</b> көк сәулені жұтады.', 'Большинство серебристо-белые: отражают все лучи одинаково. <b>Au</b> и <b>Cu</b> поглощают часть синих лучей.')}</div></div>
        <div class="key" data-a="r" style="--d:.4s"><span class="lb">${L('Қолдану', 'Применение')}</span><span class="t" style="font-size:18px">${L('Күміс — ең жақсы шағылыстырғыш: айнаға жағады. Al ұнтағы — құбыр бояуы «күміс бояу».', 'Серебро — лучший отражатель: зеркала. Алюминиевый порошок — основа «серебрянки» для труб.')}</span></div>
      </div>
    </div>`,
  init(root) {
    const W = 680, H = 440, cv = D.cv($('#luHost', root), W, H);
    const SP = [[148, 0, 211], [75, 0, 230], [0, 130, 255], [20, 200, 80], [255, 230, 0], [255, 140, 0], [255, 40, 40]];
    const RF = { Ag: [.97, .97, .97, .97, .97, .97, .97], Al: [.9, .9, .9, .9, .9, .9, .9], Mg: [.92, .92, .92, .92, .92, .92, .92], Fe: [.62, .62, .62, .62, .62, .62, .62], Cu: [.45, .45, .5, .55, .75, .93, .97], Au: [.38, .38, .45, .6, .9, .95, .97] };
    const BASE = { Ag: '#dde4ee', Al: '#b9c7d6', Mg: '#d3d9e2', Fe: '#8d99ab', Cu: '#d98324', Au: '#f2c230' };
    const POW = { Ag: .6, Al: .85, Mg: .85, Fe: .12, Cu: .15, Au: .35 };
    let met = 'Ag', pow = false, t = 0;
    const sync = () => { $('#luPow', root).innerHTML = pow ? T('Монолит етіп көрсету', 'Показать монолитом') : T('Ұнтақ етіп көрсету', 'Показать порошком'); $('#luNote', root).textContent = pow ? (POW[met] > .5 ? T('Жылтырын сақтайды!', 'Блеск сохраняется!') : T('Ұнтақ қара — жарық шашырайды', 'Порошок тёмный — свет рассеивается')) : ''; };
    $$('#luMet button', root).forEach(b => b.onclick = () => { met = b.dataset.m; $$('#luMet button', root).forEach(x => x.classList.toggle('on', x === b)); sync(); D.beep('pop'); });
    $('#luPow', root).onclick = () => { pow = !pow; sync(); D.beep('pop'); };
    return {
      lang: sync, enter() { sync(); },
      tick(dt) {
        t += dt; const x = cv.begin(); const sx = 340, sy = 330;
        /* шам */
        G.ball(x, 78, 96, 20, '#fde047'); x.fillStyle = 'rgba(253,224,71,.25)'; x.beginPath(); x.arc(78, 96, 38 + Math.sin(t * 3) * 3, 0, 6.283); x.fill();
        G.txt(x, T('жарық көзі', 'источник света'), 78, 140, { size: 14, color: D.col.ink2 });
        /* бет */
        G.rr(x, 160, sy, 360, 44, 14); const gr = x.createLinearGradient(160, sy, 520, sy + 44); gr.addColorStop(0, G.shade(BASE[met], .35)); gr.addColorStop(.5, BASE[met]); gr.addColorStop(1, G.shade(BASE[met], -.25)); x.fillStyle = pow ? G.shade(BASE[met], -.82 + POW[met] * .8) : gr; x.fill();
        if (pow) for (let i = 0; i < 70; i++) { const px = 168 + (i * 53 % 344), py = sy + 4 + (i * 29 % 34); x.fillStyle = G.shade(BASE[met], -.7 + POW[met] * .6 + (i % 3) * .08); x.beginPath(); x.arc(px, py, 2.4, 0, 6.283); x.fill(); }
        let ar = 0, ag = 0, ab = 0, tot = 0;
        SP.forEach((c, i) => {
          const off = (i - 3) * 9, ref = RF[met][i] * (pow ? POW[met] : 1);
          x.lineWidth = 5; x.lineCap = 'round';
          x.strokeStyle = 'rgb(' + c.join(',') + ')'; x.globalAlpha = .95;
          x.beginPath(); x.moveTo(100, 112 + off * .4); x.lineTo(sx + off, sy); x.stroke();
          const abs = 1 - ref; if (abs > .02) { x.globalAlpha = abs; x.fillStyle = 'rgb(' + c.join(',') + ')'; x.beginPath(); x.arc(sx + off, sy - 2, 3 + abs * 5, 0, 6.283); x.fill(); }
          if (!pow) { x.globalAlpha = ref; x.beginPath(); x.moveTo(sx + off, sy); x.lineTo(580 + off * .4, 112 + (i - 3) * 3.6); x.strokeStyle = 'rgb(' + c.join(',') + ')'; x.stroke(); }
          else { for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + rnd(-1.15, 1.15) + Math.sin(t * 2 + i + k) * .12, L_ = 70 + k * 22; x.globalAlpha = ref * .6; x.lineWidth = 3; x.beginPath(); x.moveTo(sx + off + k * 3, sy); x.lineTo(sx + off + k * 3 + Math.cos(a) * L_, sy + Math.sin(a) * L_); x.stroke(); } }
          x.globalAlpha = 1; ar += c[0] * ref; ag += c[1] * ref; ab += c[2] * ref; tot += ref;
        });
        /* көрінетін түс */
        G.txt(x, T('көз көретін түс', 'цвет, который видит глаз'), 588, 244, { size: 14, color: D.col.ink2 });
        G.ball(x, 588, 292, 36, pow ? G.shade(BASE[met], -(1 - POW[met]) * .9) : BASE[met]);
        G.txt(x, met, sx, sy + 24, { size: 22, color: pow ? '#fff' : '#14213d', weight: 900 });
      }
    };
  }
});
