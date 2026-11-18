const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const S = process.argv[3]; const b = await chromium.launch();
  const mk = async (w, h, dpr) => { const pg = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr || 1 }); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto('file://' + path.resolve(process.argv[2])); await pg.waitForTimeout(500); return pg; };
  let pg = await mk(1280, 720);
  await pg.evaluate(() => Deck.go(Deck.byId('luster'))); await pg.waitForTimeout(1600); await pg.click('#factTab'); await pg.waitForTimeout(700); await pg.screenshot({ path: S + '/ui_fact.png' });
  await pg.evaluate(() => Deck.go(Deck.byId('steel'))); await pg.waitForTimeout(1200); await pg.keyboard.press('t'); await pg.waitForTimeout(700); await pg.screenshot({ path: S + '/ui_teacher.png' });
  await pg.click('#teacher .tt button[data-t=gloss]'); await pg.waitForTimeout(400); await pg.screenshot({ path: S + '/ui_gloss.png' });
  await pg.keyboard.press('Escape'); await pg.keyboard.press('m'); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/ui_menu.png' });
  await pg.keyboard.press('Escape');
  await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; Deck.refreshColors(); Deck.go(Deck.byId('conduct')); }); await pg.waitForTimeout(1500); await pg.screenshot({ path: S + '/ui_dark1.png' });
  await pg.evaluate(() => Deck.go(Deck.byId('density'))); await pg.waitForTimeout(800); await pg.click('.dnc[data-s=Au]'); await pg.click('.dnc[data-s=Li]'); await pg.click('.dnc[data-s=Fe]'); await pg.waitForTimeout(1800); await pg.screenshot({ path: S + '/ui_dark2.png' });
  console.log('desktop errors', pg.errs.length);
  const pm = await mk(390, 844, 2); await pm.evaluate(() => Deck.go(Deck.byId('bond'))); await pm.waitForTimeout(1500); await pm.screenshot({ path: S + '/ui_mobile.png' }); console.log('mobile errors', pm.errs.length);
  const pt = await mk(844, 390, 2); await pt.evaluate(() => Deck.go(Deck.byId('map'))); await pt.waitForTimeout(1500); await pt.screenshot({ path: S + '/ui_phone_land.png' });
  await b.close();
})();
