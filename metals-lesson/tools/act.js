// Әрекеттерді орындап скриншот алу: node tools/act.js <html> <out> <slideId> "click:#id|wait:1500|shot:name|eval:code"...
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [file, out, id, ...steps] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await pg.goto('file://' + path.resolve(file)); await pg.waitForTimeout(500);
  await pg.evaluate(i => Deck.go(isNaN(+i) ? Deck.byId(i) : +i), id); await pg.waitForTimeout(900);
  for (const s of steps) {
    const [k, ...r] = s.split(':'); const v = r.join(':');
    if (k === 'click') await pg.click(v); else if (k === 'wait') await pg.waitForTimeout(+v); else if (k === 'shot') await pg.screenshot({ path: path.join(out, v + '.png') });
    else if (k === 'eval') await pg.evaluate(v); else if (k === 'key') await pg.keyboard.press(v);
    else if (k === 'move') { const [x, y] = v.split(',').map(Number); await pg.mouse.move(x, y); }
    else if (k === 'down') await pg.mouse.down(); else if (k === 'up') await pg.mouse.up();
  }
  console.log('errors:', errs.length); errs.forEach(e => console.log(e)); await b.close();
})();
