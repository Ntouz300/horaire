const { ouvrir, donneesBase } = require('./h.js');
const fs = require('fs');
(async () => {
  const C = JSON.parse(fs.readFileSync('atelier_pc.json'));
  const { browser, page } = await ouvrir('iPad Pro 11', donneesBase());
  const js = await page.evaluate((C) => ({
    sp: C.grilles.map(g => spriteDeGrille(g, 16)), pal: paletteDuJour('2026-10-15')[1], coul: Array.from({ length: 25 }, (_, i) => i * 15).flatMap(h => Array.from({ length: 11 }, (_, j) => couleurLibre(h, j * 10))),
    rar: Array.from({ length: 1000 }, (_, x) => Creations.rarete(x / 1000)),
    prix: ['commun', 'rare', 'tres_rare'].flatMap(r => Array.from({ length: 997 }, (_, x) => Creations.prix(r, x / 997))),
    palj: Array.from({ length: 120 }, (_, i) => paletteDuJour(decalerJour('2026-01-01', i))[0]),
    norm: [
      { n: 'a', sp: 'A112233;3:AAAAAAAAA', rar: 'rare', prix: 3000, j: '2026-10-15' },
      { n: 'a', sp: 'A112233;3:AAAAAAAAA', rar: 'rare', prix: 2990, j: '2026-10-15' },
      { n: 'a', sp: 'A112233;30:AAA', rar: 'commun', prix: 1000, j: '2026-10-15' },
      { n: 'a', sp: 'A112233;2:900A', rar: 'commun', prix: 1000, j: '2026-10-15' },
      { n: 'x'.repeat(60), sp: 'A112233B445566;4:AABBAABBAABBAABB', rar: 'tres_rare', prix: 9000, j: '2026-10-16', t: 5 }].map(x => normaliserCreation('c_abcd1234', x)),
  }), C);
  for (const k of ['sp', 'coul', 'pal', 'rar', 'prix', 'palj', 'norm']) console.log(k, JSON.stringify(js[k]) === JSON.stringify(k === 'pal' ? C.pal : C[k]) ? 'IDENTIQUE' : 'DIFFÉRENT ' + JSON.stringify(js[k]).slice(0, 200) + ' / ' + JSON.stringify(C[k]).slice(0, 200));
  await browser.close();
})();
