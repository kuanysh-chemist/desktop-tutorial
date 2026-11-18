// Мәтін/элемент шектен шығуын тексеру (kk және ru): node tools/overflow.js index.html
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await pg.goto('file://' + path.resolve(process.argv[2])); await pg.waitForTimeout(500);
  const n = await pg.evaluate(() => Deck.slides.length); let bad = 0;
  for (const lang of ['kk', 'ru']) {
    await pg.evaluate(l => Deck.setLang(l), lang);
    for (let i = 0; i < n; i++) {
      await pg.evaluate(k => Deck.go(k), i); await pg.waitForTimeout(1700);
      const res = await pg.evaluate(() => {
        const st = document.getElementById('stage').getBoundingClientRect(), sc = Deck.scale, out = [];
        const s = Deck.cur(); const root = s.el;
        root.querySelectorAll('*').forEach(el => {
          if (el.closest('canvas') || el.tagName === 'CANVAS' || el.closest('svg') && el.tagName !== 'svg') return;
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return;
          const bottom = (r.bottom - st.top) / sc, right = (r.right - st.left) / sc;
          const txt = (el.childElementCount === 0 ? el.textContent : '').trim().slice(0, 40);
          if (el.closest('.flip') && !el.classList.contains('flip')) return;
          if (bottom > 664 && txt) out.push('BOTTOM ' + Math.round(bottom) + ' ' + el.className + ' "' + txt + '"');
          if (right > 1262 && txt) out.push('RIGHT ' + Math.round(right) + ' ' + el.className + ' "' + txt + '"');
          if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 3 && txt) out.push('CLIP-X ' + el.className + ' "' + txt + '"');
          if (el.scrollHeight > el.clientHeight + 3 && (cs.overflowY === 'hidden') && txt) out.push('CLIP-Y ' + el.className + ' "' + txt + '"');
        });
        return out;
      });
      if (res.length) { bad += res.length; console.log('[' + lang + '] #' + (i + 1) + ' ' + (await pg.evaluate(() => Deck.cur().id))); res.slice(0, 6).forEach(x => console.log('   ' + x)); }
    }
  }
  console.log('issues:', bad); await b.close();
})();
