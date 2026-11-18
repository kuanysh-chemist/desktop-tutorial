/* ===== 0-тарау: Кіріспе (титул, жұмбақ, мақсаттар) ===== */

/* 1. Титул */
Deck.add({
  id: 'title', ch: 0, bare: true, time: 1,
  t: ['Металдар. Қорытпалар', 'Металлы. Сплавы'],
  note: ['Сабақ тақырыбы: «Металдар. Металдардың қорытпалары». Демонстрациялар: № 4 «Металдардың кристалл торларының модельдері» және № 5 «Металдар мен қорытпалар». Сайт: ←/→ немесе саусақпен сырғыту; F — толық экран; L — тіл; T — осы панель; M — мәзір.',
    'Тема урока: «Металлы. Сплавы металлов». Демонстрации № 4 «Модели кристаллических решёток металлов» и № 5 «Металлы и сплавы». Управление: ←/→ или свайп; F — полный экран; L — язык; T — эта панель; M — меню.'],
  bridge: ['Алдымен тарихтағы бір жұмбақ', 'Сначала — историческая загадка'],
  html: () => `
    <div class="abs" style="left:58px;top:58px;width:650px">
      <span class="chip k" data-a="pop" style="--d:.1s;font-size:17px">${L('ХИМИЯ · 9-СЫНЫП', 'ХИМИЯ · 9 КЛАСС')}</span>
      <h1 class="tt1" data-a style="--d:.2s">${L('Металдар.<br>Қорытпалар', 'Металлы.<br>Сплавы')}</h1>
      <p class="t2" data-a style="--d:.45s;max-width:560px;margin:0 0 18px">${L('Бір электрон газынан Қазақстан металлургиясына дейінгі жол', 'Путь от электронного газа до металлургии Казахстана')}</p>
      <div class="r wrap" data-a style="--d:.6s;gap:10px;max-width:600px">
        <span class="chip">${ico('atom', 20)} ${L('Құрылым', 'Строение')}</span><span class="chip">${ico('bolt', 20)} ${L('Қасиеттер', 'Свойства')}</span>
        <span class="chip">${ico('layers', 20)} ${L('Қорытпалар', 'Сплавы')}</span><span class="chip">${ico('factory', 20)} ${L('Металл алу', 'Получение')}</span>
        <span class="chip">${ico('mountain', 20)} ${L('Қазақстан', 'Казахстан')}</span>
      </div>
      <div style="margin-top:30px;--d:.85s" data-a="pop"><button class="btn" id="goBtn" style="font-size:22px;padding:14px 30px">${L('Бастаймыз', 'Начинаем')} →</button></div>
    </div>
    <div class="abs" id="hero" style="right:26px;top:20px;width:560px;height:566px" data-a="z"></div>`,
  init(root) {
    const cv = D.cv($('#hero', root), 560, 566);
    const sea = new D.Sea({ x: 80, y: 120, w: 400, h: 330, cols: 6, rows: 5, n: 44 });
    sea.temp = .2; sea.speed = 70;
    const coins = ['Fe', 'Cu', 'Au', 'Al', 'Ag', 'Zn', 'Ti', 'Na'].map((s, i) => ({ s, a: i / 8 * 6.283, sp: (i % 2 ? 1 : -1) * rnd(.12, .22) }));
    $('#goBtn', root).onclick = () => D.next();
    return {
      tick(dt, t) {
        sea.update(dt); const x = cv.begin();
        G.rr(x, 36, 62, 488, 440, 40); x.globalAlpha = .7; x.fillStyle = D.col.card; x.fill(); x.globalAlpha = 1;
        x.lineWidth = 3; x.strokeStyle = D.col.line; x.stroke();
        sea.draw(x, { er: 4.5 });
        G.txt(x, 'Me⁰ ⇄ Meⁿ⁺ + ne⁻', 280, 92, { size: 26, color: D.col.ink2, weight: 900 });
        coins.forEach(c => {
          c.a += c.sp * dt;
          const px = 280 + Math.cos(c.a) * 255, py = 283 + Math.sin(c.a) * 245;
          G.ball(x, px, py, 27, MET[c.s]); G.txt(x, c.s, px, py + 1, { size: 20, color: '#14213d', weight: 900 });
        });
      }
    };
  }
});

/* 2. Жұмбақ */
(function () {
  const soldier = (x, y, sick, i, cmd) => {
    const skin = sick ? '#b8d58c' : '#f1c79a';
    return `<g transform="translate(${x} ${y})"><g class="${sick ? 'sway' : 'bob'}" style="animation-delay:${-i * .5}s">
      <path d="M-20 14q20-10 40 0l4 50h-48z" fill="${cmd ? '#c0392b' : '#a58a5c'}"/>${cmd ? '<path d="M-20 14q-12 20-8 50l12-6z" fill="#e74c3c"/>' : ''}
      <circle cx="0" cy="0" r="16" fill="${skin}"/>
      <path d="M-17 -3q0-20 17-20t17 20z" fill="${cmd ? '#f5b81c' : '#8d99a6'}"/>${cmd ? '<path d="M0 -23q10-16 22-8" stroke="#c0392b" stroke-width="6" fill="none" stroke-linecap="round"/>' : ''}
      ${sick ? '<path d="M-8 0q2.500 3 5 0M3 0q2.500 3 5 0" stroke="#33422a" stroke-width="2" fill="none"/><path d="M-6 8q2-3 4 0t4 0t4 0" stroke="#33422a" stroke-width="2" fill="none"/><path d="M17 -6q4 6 0 9q-4-3 0-9z" fill="#7ec8f5"/>' :
        '<circle cx="-6" cy="-1" r="2" fill="#2b1d12"/><circle cx="6" cy="-1" r="2" fill="#2b1d12"/><path d="M-6 6q6 6 12 0" stroke="#a24b3a" stroke-width="2.200" fill="none" stroke-linecap="round"/>'}
      ${cmd ? '<path d="M24 22l-8 14h22l-8-14z" fill="#e8edf5" stroke="#b6c1d1" stroke-width="2"/><rect x="26" y="34" width="4" height="8" fill="#b6c1d1"/><path d="M14 48h28" stroke="#b6c1d1" stroke-width="4" stroke-linecap="round"/><g class="spark"><path d="M34 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/></g>' :
        '<path d="M16 38h30q-2 14-15 14t-15-14z" fill="#b5812a"/><ellipse cx="31" cy="38" rx="15" ry="4" fill="#d9a441"/>'}
    </g></g>`;
  };
  const scene = `<svg viewBox="0 0 700 330" width="700" height="330" style="display:block">
    <defs><linearGradient id="skyH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#ffefd2"/></linearGradient></defs>
    <rect width="700" height="330" fill="url(#skyH)"/><circle cx="590" cy="70" r="40" fill="#ffb347" opacity=".9"/><circle cx="590" cy="70" r="58" fill="#ffb347" opacity=".25"/>
    <path d="M0 210q120-50 260-10t260 0 180-20v160H0z" fill="#e8c98d"/><path d="M0 250q160-30 330 0t370-10v90H0z" fill="#d9b574"/>
    <g class="wv"><path d="M-40 292q35-14 70 0t70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0v50h-770z" fill="#5ab0e8" opacity=".85"/></g>
    <g class="wv2"><path d="M-40 306q35-10 70 0t70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0v40h-770z" fill="#3b8fd1" opacity=".9"/></g>
    ${[0, 1, 2, 3, 4].map(i => soldier(70 + i * 88, 205 + (i % 2) * 8, true, i)).join('')}
    ${soldier(545, 190, false, 2, true)}
    <rect x="16" y="14" width="250" height="34" rx="17" fill="rgba(20,33,61,.85)"/><text x="141" y="37" text-anchor="middle" font-size="17" font-weight="900" fill="#fff" font-family="Nunito,sans-serif" class="sceneLbl"></text>
  </svg>`;
  Deck.add({
    id: 'hook', ch: 0, time: 3,
    t: ['Жұмбақ: күміс кубогы', 'Загадка серебряного кубка'],
    note: ['Қызықтыру сәті. Балалардан болжам айтқызыңыз, дұрыс жауапты бірден айтпаңыз — ол «Металдық жылтыр» экранындағы «Сен білесің бе?» карточкасында ашылады (күмістің бактерицидтік қасиеті). Бұл — аңыз ретінде жиі айтылатын тарихи оқиға, ал күмістің микробтарды жоятыны — дәлелденген ғылыми факт.',
      'Момент интереса. Попросите учеников высказать гипотезы, не называйте ответ — он раскрывается на экране «Металлический блеск» в карточке «А вы знали?» (бактерицидность серебра). Сюжет — популярное историческое предание; а то, что серебро убивает микробов, — доказанный научный факт.'],
    ans: ['Дұрыс жауап: күмістің бактерицидтік қасиеті бар — ол судағы микроорганизмдерді жояды және жараның іріңдемей жазылуына көмектеседі.', 'Ответ: серебро обладает бактерицидным действием — убивает микроорганизмы в воде и помогает ранам заживать без нагноения.'],
    bridge: ['Бүгін металдардың құпиясын ашамыз', 'Сегодня раскроем секреты металлов'],
    html: () => `
      <div class="r" style="height:540px;gap:22px;padding-top:6px">
        <div class="c" style="width:700px">
          <div class="panel" data-a="z" style="height:330px">${scene}</div>
          <div class="card t" data-a style="--d:.3s;font-size:20px;line-height:1.38">${L(
            '<b>Б.з.б. IV ғасыр.</b> А. Македонскийдің әскері Үндістанға бет алды. Инд жағасында сарбаздар арасында асқазан-ішек індеті тарады. Бірақ қолбасшылардың бірде-біреуі ауырмады! Сарбаздар <b>жез</b> ыдыспен, ал қолбасшылар <b>күміс</b> ыдыспен ішіп-жеді.',
            '<b>IV век до н. э.</b> Армия А. Македонского идёт в Индию. На берегу Инда среди воинов быстро распространилась кишечная эпидемия, но ни один полководец не заболел! Простые воины ели из <b>латунной</b> посуды, а командиры — из <b>серебряной</b>.')}</div>
        </div>
        <div class="c f1" style="gap:14px">
          <div class="card tint" data-a="r" style="--d:.2s">
            <span class="lbl">${L('Сұрақ', 'Вопрос')}</span>
            <h3 style="margin:4px 0 12px;font-size:28px">${L('Қолбасшылар неге ауырмады?', 'Почему полководцы не заболели?')}</h3>
            <div class="c" id="hOpts" style="gap:10px">
              <button class="btn ghost hopt" data-k="a">${L('А) Олар жақсырақ тамақ жеді', 'А) Они лучше питались')}</button>
              <button class="btn ghost hopt" data-k="b">${L('Ә) Ыдыс металының әсері болды', 'Б) Дело в металле посуды')}</button>
              <button class="btn ghost hopt" data-k="c">${L('Б) Олар өзен суын ішпеді', 'В) Они не пили речную воду')}</button>
            </div>
          </div>
          <div class="key" id="hFeed" style="opacity:0;transform:translateY(12px);transition:all .4s">
            <span class="lb">${L('Болжам', 'Гипотеза')}</span><span class="t" id="hTxt"></span>
          </div>
        </div>
      </div>`,
    init(root) {
      const msg = {
        a: ['Қызықты болжам! Бірақ ойлан: бәрі бір өзеннен су ішті ғой. Сабақ барысында шынайы себепті тексереміз.', 'Интересная гипотеза! Но подумай: все пили из одной реки. В ходе урока проверим настоящую причину.'],
        b: ['Дұрыс бағыт! Ыдыстағы металл маңызды болуы мүмкін. Қай қасиеті екенін сабақта анықтаймыз.', 'Верное направление! Металл посуды может быть важен. Какое именно свойство — выясним на уроке.'],
        c: ['Болуы мүмкін. Бірақ сарбаздар да, қолбасшылар да су ішкен. Нақты жауапты сабақта табамыз.', 'Возможно. Но и воины, и командиры пили воду. Точный ответ найдём на уроке.']
      };
      $$('.hopt', root).forEach(b => b.onclick = () => {
        D.state.hook = b.dataset.k;
        $$('.hopt', root).forEach(x => x.classList.toggle('on', x === b));
        const m = msg[b.dataset.k]; $('#hTxt', root).innerHTML = L(m[0], m[1]);
        const f = $('#hFeed', root); f.style.opacity = 1; f.style.transform = 'none'; D.beep('pop');
      });
      const setLbl = () => { $('.sceneLbl', root).textContent = T('б.з.б. IV ғасыр · Инд өзені', 'IV в. до н. э. · река Инд'); };
      setLbl();
      return { lang: setLbl, enter: setLbl };
    }
  });
})();

/* 3. Мақсаттар */
Deck.add({
  id: 'goals', ch: 0, time: 1,
  t: ['Бүгін нені білеміз?', 'Что мы узнаем сегодня'],
  note: ['Оқу мақсаттарының кодтары: 9.1.4.1, 9.2.1.2, 9.1.4.3, 9.1.4.4, 9.4.2.5, 9.4.2.6. Сабақ соңында («Қорытынды» экраны) оқушылар қайсысына қол жеткізгенін өздері белгілейді.',
    'Коды целей обучения: 9.1.4.1, 9.2.1.2, 9.1.4.3, 9.1.4.4, 9.4.2.5, 9.4.2.6. В конце урока (экран «Итог») ученики сами отмечают, какие цели достигнуты.'],
  bridge: ['Бәрі атомнан басталады — периодтық жүйеден бастайық', 'Всё начинается с атома — идём в таблицу Менделеева'],
  html: () => {
    const G6 = [
      ['9.1.4.1', 'atom', 'Металдардың қасиетін металдық байланыс пен кристалл тор арқылы түсіндіреміз', 'Объясняем свойства металлов через металлическую связь и кристаллическую решётку'],
      ['9.2.1.2', 'bolt', 'Физикалық және химиялық қасиеттерін сипаттаймыз. Неге металдар тек тотықсыздандырғыш?', 'Описываем физические и химические свойства. Почему металлы — только восстановители?'],
      ['9.1.4.3', 'layers', 'Қорытпа деген не және ол неге таза металдан артық?', 'Что такое сплав и чем он лучше чистого металла?'],
      ['9.1.4.4', 'scale', 'Шойын мен болатты құрамы мен қасиеті бойынша салыстырамыз', 'Сравниваем чугун и сталь по составу и свойствам'],
      ['9.4.2.5', 'mountain', 'Қазақстандағы кен орындарын, өндіру тәсілдерін және экологияға әсерін атаймыз', 'Называем месторождения Казахстана, способы добычи и влияние на экологию'],
      ['9.4.2.6', 'factory', 'Рудадан металл алу жолын сипаттаймыз', 'Описываем путь от руды к металлу']
    ];
    return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;height:360px;margin-top:6px">` +
      G6.map((g, i) => `<div class="card goal" data-a="pop" style="--d:${.1 + i * .09}s"><div class="gh"><span class="chip k">${g[0]}</span><span class="gi">${ico(g[1], 30)}</span></div><div class="t">${L(g[2], g[3])}</div></div>`).join('') +
      `</div><div class="key" data-a style="--d:.8s;margin-top:16px"><span class="lb">${L('Қысқаша', 'Коротко')}</span><span class="t">${L('Негізгі сұрақ: <b>металдың құрылымы оның қасиетін қалай анықтайды</b> және қасиеттерді қорытпамен қалай жақсартуға болады?', 'Главный вопрос: <b>как строение металла определяет его свойства</b> и как улучшить свойства с помощью сплавов?')}</span></div>`;
  }
});
