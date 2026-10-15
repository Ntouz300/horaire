const { ouvrir, donneesBase, verif, bilan, capture, audit } = require('./h.js');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  for (const p of ['iPad Pro 11', 'iPad Pro 11 landscape', 'iPhone 13', 'iPhone 13 landscape', 'iPhone SE', 'iPhone SE landscape']) {
    const { page, erreurs, ctx } = await ouvrir(p, donneesBase(), { browser });
    await page.evaluate(() => { window.app.aller('jeux'); new AtelierAc(window.app).montrer(); });
    await page.waitForSelector('.at-toile'); await page.waitForTimeout(600);
    const au = await audit(page, '.carte-modale.atelier');
    verif(!au.petits.filter(x => !/bq-x/.test(x)).length && !au.coupes.length, p + ' : cibles ≥ 44 px, rien de coupé ' + au.petits.concat(au.coupes).slice(0, 6).join(';'));
    const ok = await page.evaluate(() => { const r = document.querySelector('.carte-modale.atelier').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; });
    verif(ok, p + ' : fenêtre dans l\'écran');
    await capture(page, 'atelier_couleurs_' + p.replace(/ /g, '_'));
    verif(!erreurs.length, p + ' : aucune erreur ' + erreurs.join('\n'));
    await ctx.close();
  }
  await browser.close();
  process.exit(bilan() ? 1 : 0);
})();
