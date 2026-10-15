const { ouvrir, donneesBase } = require('./h.js');
const fs = require('fs');
(async () => {
  const { browser, page } = await ouvrir('iPad Pro 11', donneesBase());
  await page.evaluate(() => PackAC.charger());
  const E = JSON.parse(fs.readFileSync('cmp_entrees.json'));
  const js = await page.evaluate((E) => ({ b: E.jours.map(boutiqueDuJour), j: E.inst.map(t => jourToronto(t)), f: E.inst.map(t => finJourToronto(t)),
    l: E.jours.map(lundiToronto), a: Array.from({ length: 200 }, (_, i) => new AleaFixe(hacheFnv('x' + i)).suivant()) }), E);
  const pc = JSON.parse(fs.readFileSync('cmp_pc.json'));
  const tri = (o) => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v);
  for (const k of ['a', 'j', 'f', 'l', 'b']) console.log(k, tri(js[k]) === tri(pc[k]) ? 'IDENTIQUE' : 'DIFFÉRENT', js[k].length);
  // contrôles
  let ok = true;
  for (const b of js.b) {
    const ids = new Set(b.articles.map(a => a.s)), rares = b.articles.filter(a => a.rar !== 'commun').length;
    const pj = b.articles.filter(a => a.raison === 'jour').map(a => a.pct), ps = b.articles.filter(a => a.raison === 'semaine').map(a => a.pct);
    if (b.articles.length !== 50 || ids.size !== 50 || rares < 3 || b.pctJour < 10 || b.pctJour > 60 || b.pctSemaine < 30 || b.pctSemaine > 65
      || b.articles.some(a => a.pct && a.final !== Math.max(1, Math.floor((a.prix * (100 - a.pct) + 50) / 100)))) { ok = false; console.log('KO', b.jour); }
  }
  console.log('contrôles 50 articles / ≥ 3 rares / rabais dans les bornes :', ok ? 'OK' : 'ÉCHEC', '(' + js.b.length + ' jours)');
  const ex = js.b[0];
  console.log('exemple', ex.jour, 'semaine', ex.semaine, ex.themeSemaine, ex.pctSemaine + '%', 'jour', ex.pctJour + '% ×' + ex.nbJour, 'rares', ex.articles.filter(a => a.rar !== 'commun').length);
  await browser.close();
})();
