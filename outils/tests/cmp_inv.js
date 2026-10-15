const { ouvrir, donneesBase } = require('./h.js');
const fs = require('fs');
(async () => {
  const C = JSON.parse(fs.readFileSync('inv_cmp.json'));
  const { browser, page } = await ouvrir('iPad Pro 11', donneesBase());
  await page.evaluate(() => PackAC.charger());
  const js = await page.evaluate((C) => C.cas.map(c => listeInventaire(C.d, c, (() => { const a = {}; for (const e of Object.values(C.d.geos)) for (const [k, v] of Object.entries(e.a || {})) a[k] = (a[k] || 0) + v; return a; })()).map(x => x.s)), C);
  console.log(JSON.stringify(js) === JSON.stringify(C.pc) ? 'inventaire PC = iPad (' + C.cas.length + ' filtres)' : 'DIFFÉRENT\n' + JSON.stringify(js) + '\n' + JSON.stringify(C.pc));
  await browser.close();
})();
