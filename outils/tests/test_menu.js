// v31 : menu du haut des notes réduit (iPad : cahier et note texte ; iPhone : note texte)
const { ouvrir, donneesBase, verif, bilan, capture, audit } = require('./h.js');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const boite = (page, s) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null; }, s);
const posPage = (page) => page.evaluate(() => { const f = document.querySelector('.cahier .feuille, .doc-texte-ed'); const r = f.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y)]; });
const etatBarres = (page) => page.evaluate(() => [...document.querySelectorAll('.cahier .cah-outils, .cahier .cah-options, .cah-pages, .cahier .feuille, .nt-outils, .doc-texte-ed')].map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(','); }).join('|'));
(async () => {
  const browser = await chromium.launch();
  for (const profil of ['iPad Pro 11', 'iPad Pro 11 landscape']) {
    console.log('\n== ' + profil);
    const d = donneesBase();
    d.notes.push({ id: 'n3', titre: 'Autre cahier', type: 'cahier', fond: 'ligne', papier: 'blanc', maj: '2026-10-15T00:00', pages: [{ id: 'q1', f: 'ligne', h: 1414, traits: [], textes: [] }] });
    const { page, erreurs, ctx } = await ouvrir(profil, d, { browser });
    await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n3'); window.app.ecrans.notes.changerDoc('n1'); });
    await page.waitForTimeout(800);
    const tag = profil.replace(/ /g, '_');
    verif(!!(await boite(page, '.cahier header.doc-barre')) && !!(await boite(page, '.doc-onglets')), 'normal : en-tête et onglets visibles');
    let au = await audit(page, '.cahier .cah-barre');
    verif(!au.petits.length, 'normal : cibles ≥ 44 px dans la barre d\'outils ' + au.petits.join(';'));
    await capture(page, 'menu_normal_' + tag);
    const p0 = await posPage(page), outils0 = await boite(page, '.cahier .cah-outils');
    await page.click('.cah-menu-bascule');
    await page.waitForTimeout(900);
    const p1 = await posPage(page);
    verif(!(await boite(page, '.cahier header.doc-barre')) && !(await boite(page, '.doc-onglets')), 'réduit : en-tête du document et onglets masqués');
    verif(!!(await boite(page, '.cahier .cah-outils')) && !!(await boite(page, '.cahier .cah-options')) && !!(await boite(page, '.cah-menu-bascule')), 'réduit : outils, réglages et bouton visibles');
    const libere = outils0[1] - (await boite(page, '.cahier .cah-outils'))[1];
    verif(libere > 40, `place libérée : ${libere} px`);
    verif(Math.abs(p1[1] - p0[1]) <= 1 && p1[0] === p0[0], `la page reste à la même place à l'écran (${p0} → ${p1})`);
    au = await audit(page, '.cahier .cah-barre');
    verif(!au.petits.length && !au.coupes.length, 'réduit : cibles ≥ 44 px, rien de coupé ' + au.petits.concat(au.coupes).join(';'));
    verif(await page.evaluate(() => document.querySelector('.cah-menu-bascule').getAttribute('aria-label')) === 'Rétablir le menu', 'libellé « Rétablir le menu »');
    await capture(page, 'menu_reduit_' + tag);
    // outils en mode réduit : bille + trait, annuler, autocollants
    await page.click('.cahier .cah-outils button[aria-label="Stylo bille"], .cahier .cah-outils button[title="Stylo bille"], .cahier .cah-outils button[title="Bille"]').catch(() => {});
    await page.evaluate(() => { const ed = window.app.ecrans.notes.ed; ed.outil = 'bille'; ed.dessinerOutils(); });
    const n0 = await page.evaluate(() => window.app.ecrans.notes.ed.n.pages[0].traits.length);
    const fb = await boite(page, '.cahier .feuille');
    const avant = await etatBarres(page);
    await page.mouse.move(fb[0] + 200, fb[1] + 200); await page.mouse.down();
    let pendant = '';
    for (let i = 1; i <= 15; i++) { await page.mouse.move(fb[0] + 200 + i * 12, fb[1] + 200 + i * 5); if (i === 8) { pendant = await etatBarres(page); await page.evaluate(() => document.querySelector('.cah-menu-bascule').click()); } }
    await page.waitForTimeout(300);
    const pendant2 = await etatBarres(page), reduitPendant = await page.evaluate(() => document.querySelector('.cahier').classList.contains('menu-reduit'));
    await page.mouse.up();
    verif(pendant === avant && pendant2 === avant && reduitPendant, 'pendant un trait : rien ne bouge, la bascule demandée attend la fin du trait');
    await page.waitForTimeout(1200);
    verif(await page.evaluate(() => !document.querySelector('.cahier').classList.contains('menu-reduit')), 'après le trait : la bascule a lieu (menu rétabli)');
    verif(await page.evaluate((n0) => window.app.ecrans.notes.ed.n.pages[0].traits.length === n0 + 1, n0), 'le trait est enregistré');
    await page.click('.cah-menu-bascule'); await page.waitForTimeout(800);          // de nouveau réduit
    await page.evaluate(() => window.app.ecrans.notes.ed.annuler()); await page.waitForTimeout(150);
    verif(await page.evaluate((n0) => window.app.ecrans.notes.ed.n.pages[0].traits.length === n0, n0), 'réduit : annuler fonctionne');
    await page.click('.cahier .cah-outils button[title="Rétablir"]');
    verif(await page.evaluate((n0) => window.app.ecrans.notes.ed.n.pages[0].traits.length === n0 + 1, n0), 'réduit : rétablir (bouton) fonctionne');
    // frappe dans une zone de texte : rien ne bouge
    await page.evaluate(() => { const ed = window.app.ecrans.notes.ed; ed.outil = 'texte'; ed.dessinerOutils(); });
    const av2 = await etatBarres(page);
    await page.mouse.click(fb[0] + 150, fb[1] + 600); await page.waitForTimeout(200);
    await page.keyboard.type('Bonjour le menu réduit', { delay: 15 });
    const pend2 = await etatBarres(page);
    await page.mouse.click(fb[0] + 600, fb[1] + 900); await page.waitForTimeout(300);
    verif(av2 === pend2, 'frappe : rien ne bouge');
    // lasso : sélection, rien ne bouge
    await page.evaluate(() => { const ed = window.app.ecrans.notes.ed; ed.outil = 'lasso'; ed.dessinerOutils(); ed.selectionner(ed.feuilles.get('p1'), [100, 200, 900, 200, 900, 700, 100, 700]); });
    await page.waitForTimeout(200);
    verif(await etatBarres(page) === av2 && await page.evaluate(() => !!window.app.ecrans.notes.ed.sel), 'sélection au lasso : rien ne bouge');
    await page.evaluate(() => window.app.ecrans.notes.ed.deselect());
    // autocollants
    await page.click('.cahier .cah-outil-ac');
    await page.waitForSelector('.inventaire', { timeout: 5000 });
    verif(true, 'réduit : le bouton Autocollants ouvre l\'inventaire');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    // réglage local, conservé, jamais synchronisé
    const loc = await page.evaluate(() => ({ r: window.app.reglages.menu_notes_reduit, sync: 'menu_notes_reduit' in sectionsDe(window.app.donnees).reglages, local: REG_LOCAUX.includes('menu_notes_reduit') }));
    verif(loc.r === true && !loc.sync && loc.local, 'réglage local (REG_LOCAUX), absent des données synchronisées');
    await page.reload(); await page.waitForFunction(() => window.app && window.app.interfacePrete);
    await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n1'); }); await page.waitForTimeout(700);
    verif(await page.evaluate(() => document.querySelector('.cahier').classList.contains('menu-reduit') && !document.querySelector('.cahier header.doc-barre').offsetHeight), 'conservé après rechargement');
    // note texte sur iPad
    await page.evaluate(() => window.app.ecrans.notes.changerDoc('n2')); await page.waitForTimeout(500);
    verif(!(await boite(page, '.doc-vue header.doc-barre')) && !!(await boite(page, '.nt-outils .cah-menu-bascule')), 'note texte : en-tête masqué, bouton visible');
    await capture(page, 'menu_reduit_texte_' + tag);
    verif(!erreurs.length, 'aucune erreur de page ' + erreurs.join('\n'));
    await ctx.close();
  }
  for (const profil of ['iPhone 13', 'iPhone 13 landscape', 'iPhone SE', 'iPhone SE landscape']) {
    console.log('\n== ' + profil);
    const { page, erreurs, ctx } = await ouvrir(profil, donneesBase(), { browser });
    await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n2'); }); await page.waitForTimeout(700);
    const tag = profil.replace(/ /g, '_');
    await capture(page, 'menu_normal_' + tag);
    let au = await audit(page, '.doc-vue');
    verif(!au.petits.length && !au.coupes.length, 'normal : cibles ≥ 44 px, rien de coupé ' + au.petits.concat(au.coupes).slice(0, 4).join(';'));
    const t0 = await boite(page, '.doc-texte-ed');
    await page.click('.cah-menu-bascule'); await page.waitForTimeout(600);
    const t1 = await boite(page, '.doc-texte-ed');
    au = await audit(page, '.doc-vue');
    verif(!(await boite(page, '.doc-vue header.doc-barre')) && !au.petits.length && !au.coupes.length, 'réduit : en-tête masqué, cibles ≥ 44 px, rien de coupé ' + au.petits.concat(au.coupes).slice(0, 4).join(';'));
    verif(t1[3] > t0[3] || t1[1] < t0[1], `place libérée pour la note (${t0[1]} → ${t1[1]})`);
    const nb = await boite(page, '.nt-outils'), bb = await boite(page, '.cah-menu-bascule');
    verif(bb[0] + bb[2] <= nb[0] + nb[2] + 1 && bb[2] >= 44, 'bouton dans la barre, 44 px');
    await capture(page, 'menu_reduit_' + tag);
    verif(!erreurs.length, 'aucune erreur ' + erreurs.join('\n'));
    await ctx.close();
  }
  await browser.close();
  process.exit(bilan() ? 1 : 0);
})();
