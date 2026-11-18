const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await pg.goto('file://' + path.resolve(process.argv[2])); await pg.waitForTimeout(500);
  await pg.evaluate(() => Deck.setLang('ru')); const n = await pg.evaluate(() => Deck.slides.length); const out = [];
  for (let i = 0; i < n; i++) {
    await pg.evaluate(k => Deck.go(k), i); await pg.waitForTimeout(1300);
    out.push(await pg.evaluate(() => { const st = document.getElementById('stage').getBoundingClientRect(), sc = Deck.scale; let m = 0, who = '';
      Deck.cur().el.querySelectorAll('.sb *').forEach(el => { if (el.tagName === 'CANVAS' || el.closest('svg')) return; const r = el.getBoundingClientRect(); if (!r.width) return; const bt = (r.bottom - st.top) / sc; if (bt > m && (el.textContent || '').trim()) { m = bt; who = (el.textContent || '').trim().slice(0, 24); } });
      return Deck.cur().id + ' ' + Math.round(m) + ' ' + who; }));
  }
  console.log(out.join('\n')); await b.close();
})();
