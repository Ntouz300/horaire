const { ouvrir, donneesBase } = require('./h.js');
const fs = require('fs');
(async () => {
  const { browser, page } = await ouvrir('iPad Pro 11', donneesBase());
  await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n1'); });
  await page.waitForTimeout(600);
  const js = await page.evaluate(() => { const ed = window.app.ecrans.notes.ed, f = ed.feuilles.get('p1');
    ed.selectionner(f, [100, 200, 900, 200, 900, 700, 100, 700]); ed.appliquerRotation(ed.origineSel(), 37);
    return { p: ed.n.pages[0], a: ed.n.autocollants }; });
  const pc = JSON.parse(fs.readFileSync('rot_pc.json'));
  const tri = (o) => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v);
  console.log(tri(js) === tri(pc) ? 'IDENTIQUE' : 'DIFFÉRENT\n' + tri(js) + '\n' + tri(pc));
  await browser.close();
})();
