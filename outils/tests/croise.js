const { ouvrir, donneesBase, verif, bilan, capture } = require('./h.js');
const fs = require('fs');
(async () => {
  const CLE = process.argv[2], c = JSON.parse(fs.readFileSync('croise.json'));
  const { browser, page, erreurs } = await ouvrir('iPad Pro 11', donneesBase({ geos: {} }));
  await page.evaluate(([u, k]) => window.app.sync.configurer(u, k), ['http://localhost:8790', CLE]);
  await page.waitForTimeout(4000);
  const r = await page.evaluate((id) => ({ info: Creations.info[id], peut: Creations.peutCreer(window.app.donnees), inv: Geos.inventaire(window.app.donnees)[id], fx: JX.effets[id] || '', sp: !!SPRITES[id], rows: SPRITES[id] && SPRITES[id].rows, pal: SPRITES[id] && SPRITES[id].pal }), c.id);
  verif(r.info && r.info.prix === c.prix && r.info.rar === c.rar && r.sp && r.inv === 1, 'iPad : autocollant créé sur le PC reçu (même prix, même rareté, dessin)');
  verif(JSON.stringify(r.rows) === JSON.stringify(c.rows) && JSON.stringify(Object.entries(r.pal).sort()) === JSON.stringify(Object.entries(c.pal).sort()), `dessin relu identique sur l'iPad (${Object.keys(c.pal).length} couleurs, ${c.rows[0].length}×${c.rows.length})`);
  verif(!r.peut, 'iPad : limite du jour atteinte (création faite sur le PC)');
  verif((c.rar === 'commun') === !r.fx, 'iPad : animation selon la rareté (' + c.rar + ' -> ' + (r.fx || 'aucune') + ')');
  verif(await page.evaluate(() => JSON.stringify(window.app.donnees.reglages.ac_favoris)) === '["p_bolide_bleu"]', 'iPad : favori posé sur le PC reçu');
  verif(!erreurs.length, 'aucune erreur ' + erreurs.join('\n'));
  await browser.close();
  process.exit(bilan() ? 1 : 0);
})();
