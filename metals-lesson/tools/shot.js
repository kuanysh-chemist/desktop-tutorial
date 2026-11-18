// Скриншот + қате тексеру: node tools/shot.js <файл.html> <шығыс-папка> [слайд-id,...] [kk|ru] [dark]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [file, out, ids, lang, theme] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await pg.goto('file://' + path.resolve(file)); await pg.waitForTimeout(600);
  if (lang === 'ru') await pg.click('#lang button[data-l=ru]');
  if (theme === 'dark') await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; Deck.refreshColors(); });
  const total = await pg.evaluate(() => Deck.slides.length);
  const list = ids && ids !== 'all' ? ids.split(',') : Array.from({ length: total }, (_, i) => i);
  for (const id of list) {
    await pg.evaluate(i => { const n = isNaN(+i) ? Deck.byId(i) : +i; Deck.go(n); }, id);
    await pg.waitForTimeout(1500);
    await pg.screenshot({ path: path.join(out, String(id).padStart(2, '0') + '.png') });
  }
  console.log('slides:', total, 'errors:', errs.length); errs.forEach(e => console.log(e));
  await b.close();
})();
