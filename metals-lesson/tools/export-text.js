// Слайдтардың барлық мәтінін (қазақша + орысша) JSON-ға жинау.
// node tools/export-text.js index.html <бастап> <дейін> <шығыс.json>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [file, a, b, out] = process.argv.slice(2); const from = +a, to = +b;
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 720 } });
  await pg.addInitScript(() => { window.__NOBOOT = true; });
  await pg.goto('file://' + path.resolve(file)); await pg.waitForTimeout(400);
  await pg.evaluate(() => {
    window.__rec = {}; window.__ctx = null;
    const note = (kk, ru) => { const id = window.__ctx || (Deck.cur() && Deck.cur().id); if (!id || typeof kk !== 'string' || typeof ru !== 'string') return; (window.__rec[id] = window.__rec[id] || new Map()).set(kk, ru); };
    const L0 = window.L, T0 = window.T;
    window.L = (kk, ru) => { note(kk, ru); return L0(kk, ru); }; window.T = (kk, ru) => { note(kk, ru); return T0(kk, ru); };
    Deck.slides.forEach(s => { const h = s.html; if (typeof h === 'function') s.html = function () { window.__ctx = s.id; try { return h.apply(this, arguments); } finally { window.__ctx = null; } }; });
    Deck.start();
  });
  const total = await pg.evaluate(() => Deck.slides.length);
  for (let i = from - 1; i < Math.min(to, total); i++) {
    await pg.evaluate(k => Deck.go(k), i); await pg.waitForTimeout(900);
    const id = await pg.evaluate(() => Deck.cur().id);
    const n = await pg.evaluate(() => { const els = [...document.querySelectorAll('.slide.active .sb *')].filter(e => (e.tagName === 'BUTTON' || e.onclick || e.tagName === 'INPUT') && !e.classList.contains('hn') && !e.disabled); return els.length; });
    for (let k = 0; k < n; k++) {
      await pg.evaluate(({ k, i }) => {
        const els = [...document.querySelectorAll('.slide.active .sb *')].filter(e => (e.tagName === 'BUTTON' || e.onclick || e.tagName === 'INPUT') && !e.classList.contains('hn') && !e.disabled);
        const e = els[k]; if (!e) return;
        if (e.tagName === 'INPUT') { const mn = +e.min || 0, mx = +e.max || 100; [mx, mn, (mn + mx) / 2].forEach(v => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }); }
        else { try { e.click(); } catch (_) {} }
        if (Deck.cur().id !== Deck.slides[i].id) Deck.go(i);
      }, { k, i });
      await pg.waitForTimeout(260);
    }
    await pg.waitForTimeout(300);
  }
  const data = await pg.evaluate(({ from, to }) => {
    Deck.state = {}; /* зерттеу кезінде басылған болжамды тазалау */
    const res = [];
    Deck.slides.forEach((s, i) => {
      if (i + 1 < from || i + 1 > to) return;
      const f = typeof s.fact === 'function' ? s.fact() : s.fact;
      res.push({ n: i + 1, id: s.id, chapter: Deck.chapters[s.ch].k, title: s.t, bridge: s.bridge || null, fact: f || null, note: s.note || null, ans: s.ans || null, texts: [...(window.__rec[s.id] || new Map()).entries()] });
    });
    return res;
  }, { from, to });
  fs.writeFileSync(out, JSON.stringify(data, null, 1)); console.log('slides', data.length, 'strings', data.reduce((t, d) => t + d.texts.length, 0));
  await br.close();
})();
