const { ouvrir, donneesBase, verif, bilan } = require('./h.js');
(async () => {
  for (const p of ['iPad Pro 11', 'iPhone 13']) {
    const { browser, page, erreurs } = await ouvrir(p, donneesBase());
    const pages = await page.evaluate(() => Object.keys(window.app.ecrans));
    for (const x of pages) { await page.evaluate((x) => window.app.aller(x), x); await page.waitForTimeout(400); }
    verif(!erreurs.length, p + ' : pages ' + pages.join(', ') + ' sans erreur ' + erreurs.join('\n'));
    await browser.close();
  }
  process.exit(bilan() ? 1 : 0);
})();
