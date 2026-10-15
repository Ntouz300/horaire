// Étapes 4 et 5 : boutique du jour et inventaire (iPad / iPhone)
const { ouvrir, donneesBase, verif, bilan, capture, audit } = require('./h.js');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const T0 = Date.UTC(2026, 9, 15, 16, 0);           // 15 oct. 2026, 12 h à Toronto
const avant = `window.maintenantMs = () => (window.__dt || 0) + ${T0};`;
(async () => {
  const browser = await chromium.launch();
  const profils = ['iPad Pro 11', 'iPad Pro 11 landscape', 'iPhone 13', 'iPhone 13 landscape', 'iPhone SE', 'iPhone SE landscape'];
  let listeA = null;
  for (const profil of profils) {
    console.log('\n== ' + profil);
    const d = donneesBase();
    d.geos.pc.a = { etoile: 3, coeur: 1, s_coeur_bleu: 1, p_chat_tete_roux: 2, p_bolide_bleu: 1, p_gemme_rubis: 1, p_couronne_arc: 1 };
    const { page, erreurs, ctx } = await ouvrir(profil, d, { browser });
    await page.evaluate(avant);
    await page.evaluate(() => new Boutique(window.app).montrer());
    await page.waitForFunction(() => document.querySelectorAll('.boutique .bq-art').length >= 50, null, { timeout: 8000 });
    const info = await page.evaluate(() => ({ n: document.querySelectorAll('.boutique .bq-art').length, rares: document.querySelectorAll('.boutique .bq-art.rare').length,
      ids: [...document.querySelectorAll('.boutique .bq-art img.bq-img')].map(i => i.closest('.bq-art').querySelector('b').textContent),
      renouv: document.querySelector('.bq-renouv').textContent, b: document.querySelector('.bq-rabais').textContent }));
    verif(info.n === 50 && info.rares >= 3, `50 articles dont ${info.rares} rares`);
    verif(/dans 12 h 00 min/.test(info.renouv), 'compte à rebours : ' + info.renouv);
    if (!listeA) listeA = info.ids.join('|'); else verif(info.ids.join('|') === listeA, 'même boutique que sur l\'autre appareil');
    await page.waitForTimeout(500);
    const au = await audit(page, '.carte-modale.boutique');
    verif(!au.petits.filter(x => !/bq-x|seg/.test(x)).length, 'cibles ≥ 44 px ' + au.petits.slice(0, 5).join(';'));
    verif(!au.coupes.length, 'aucun texte coupé / débordement ' + au.coupes.slice(0, 5).join(';'));
    const tag = profil.replace(/ /g, '_');
    await capture(page, 'boutique_' + tag);
    if (profil === 'iPad Pro 11') {
      // achat d'un article soldé au prix affiché
      const r = await page.evaluate(() => {
        const B = boutiqueDuJour(jourToronto()), inv = Geos.inventaire(window.app.donnees);
        const a = B.articles.find(x => x.pct && !inv[x.s]);
        const s0 = Geos.solde(window.app.donnees);
        const ok = Geos.acheter(window.app, a.s, a.final);
        return { a, ok, diff: s0 - Geos.solde(window.app.donnees), deux: Geos.acheter(window.app, a.s, a.final) };
      });
      verif(r.ok && r.diff === r.a.final && r.a.final < r.a.prix, `achat soldé : −${r.a.pct} % → payé ${r.diff} au lieu de ${r.a.prix}`);
      verif(!r.deux, 'rachat refusé (déjà dans l\'inventaire)');
      // passage de minuit (heure de Toronto) : la boutique change d'elle-même
      await page.evaluate(() => { window.__dt = 12 * 3600000 + 60000; window.__boutique = document.querySelector('.boutique'); });
      await page.evaluate(() => { const B = [...document.querySelectorAll('.carte-modale.boutique')].pop(); });
      await page.evaluate(() => { for (const m of window.app.__modales || []) 0; });
      await page.waitForTimeout(200);
      const avantNoms = info.ids.join('|');
      await page.evaluate(() => { const c = document.querySelector('.boutique'); c.__b && 0; });
      await page.evaluate(() => { const ev = new Event('x'); });
      // forcer le tic de la minuterie
      await page.evaluate(() => { document.querySelectorAll('.boutique').forEach(() => 0); });
      await page.waitForTimeout(21000);
      const apres = await page.evaluate(() => [...document.querySelectorAll('.boutique .bq-art b')].map(b => b.textContent).join('|'));
      verif(apres !== avantNoms, 'après minuit (Toronto) : nouvelle boutique affichée');
      await page.evaluate(() => { window.__dt = 0; });
      await page.keyboard.press('Escape');
      // inventaire : recherche, favoris, tri
      await page.evaluate(() => new Inventaire(window.app).montrer());
      await page.waitForSelector('.inventaire .inv-art');
      let noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      const rars = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art')].map(c => c.classList.contains('tres-rare') ? 0 : c.classList.contains('rare') ? 1 : 2));
      verif(rars.every((v, i) => !i || rars[i - 1] <= v), 'tri par rareté (très rare → rare → commun) : ' + noms.join(', '));
      await page.selectOption('.inventaire select[aria-label="Trier"]', 'nom');
      await page.waitForTimeout(100);
      noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      const cle = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      verif(noms.every((v, i) => !i || cle(noms[i - 1]) <= cle(v)), 'tri par nom (A → Z) : ' + noms.join(', '));
      const nb = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art')].find(c => c.querySelector('b').textContent === 'Étoile').querySelector('.inv-nb').textContent);
      verif(nb === '× 3', 'nombre d\'exemplaires affiché (Étoile × 3)');
      await page.fill('.inventaire input[type="search"]', 'animaux');
      await page.waitForTimeout(300);
      noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      verif(noms.length === 1 && noms[0] === 'Chat roux', 'recherche par thème (« animaux ») : ' + noms.join(', '));
      await page.fill('.inventaire input[type="search"]', 'bolide');
      await page.waitForTimeout(300);
      noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      verif(noms.join() === 'Bolide bleu', 'recherche par nom (« bolide »)');
      await page.click('.inventaire .inv-etoile');
      await page.fill('.inventaire input[type="search"]', '');
      await page.waitForTimeout(300);
      await page.click('.inventaire .seg button:has-text("Favoris")');
      noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      verif(noms.join() === 'Bolide bleu', 'filtre Favoris');
      verif(await page.evaluate(() => JSON.stringify(window.app.donnees.reglages.ac_favoris)) === '["p_bolide_bleu"]', 'favori enregistré dans reglages.ac_favoris');
      verif(await page.evaluate(() => 'ac_favoris' in sectionsDe(window.app.donnees).reglages && !('inv_tri' in sectionsDe(window.app.donnees).reglages)), 'favoris synchronisés, tri local');
      await page.click('.inventaire .seg button:has-text("Tous")');
      await page.selectOption('.inventaire select[aria-label="Rareté"]', 'tres_rare');
      noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      verif(noms.join() === 'Couronne arc-en-ciel', 'filtre par rareté');
      await page.selectOption('.inventaire select[aria-label="Rareté"]', '');
      await page.selectOption('.inventaire select[aria-label="Thème"]', 'Trésors');
      noms = await page.evaluate(() => [...document.querySelectorAll('.inventaire .inv-art b')].map(b => b.textContent));
      verif(noms.length === 2, 'filtre par thème (Trésors) : ' + noms.join(', '));
      await page.selectOption('.inventaire select[aria-label="Thème"]', '');
      await capture(page, 'inventaire_' + tag);
    }
    if (profil !== 'iPad Pro 11') {
      await page.keyboard.press('Escape');
      await page.evaluate(() => new Inventaire(window.app).montrer());
      await page.waitForSelector('.inventaire .inv-art');
      await page.waitForTimeout(200);
      const au2 = await audit(page, '.carte-modale.inventaire');
      verif(!au2.petits.filter(x => !/bq-x/.test(x)).length, 'inventaire : cibles ≥ 44 px ' + au2.petits.slice(0, 5).join(';'));
      verif(!au2.coupes.length, 'inventaire : aucun texte coupé ' + au2.coupes.slice(0, 5).join(';'));
      await capture(page, 'inventaire_' + tag);
    }
    verif(!erreurs.length, 'aucune erreur de page ' + erreurs.join('\n'));
    await ctx.close();
  }
  await browser.close();
  process.exit(bilan() ? 1 : 0);
})();
