// Étape 1 : rotation des autocollants et de la sélection au lasso (iPad / iPhone)
const { ouvrir, donneesBase, verif, bilan, capture, audit } = require('./h.js');

async function glisserAutour(page, h, cx, cy, deg, pas = 12) {
  const a0 = Math.atan2(h.y - cy, h.x - cx), R = Math.hypot(h.x - cx, h.y - cy);
  await page.mouse.move(h.x, h.y); await page.mouse.down();
  for (let i = 1; i <= pas; i++) { const a = a0 + deg * Math.PI / 180 * i / pas; await page.mouse.move(cx + R * Math.cos(a), cy + R * Math.sin(a)); await page.waitForTimeout(20); }
}
const centre = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
const positions = (page) => page.evaluate(() => {
  const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(','); };
  return [q('.cahier .cah-outils'), q('.cahier .cah-options'), q('.cah-pages'), q('.cah-feuille') , q('.doc-entete, .cah-entete, .cahier header')].join(' | ');
});

(async () => {
  for (const profil of ['iPad Pro 11', 'iPad Pro 11 landscape']) {
    console.log('\n== ' + profil);
    const { browser, page, erreurs } = await ouvrir(profil, donneesBase());
    await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n1'); });
    await page.waitForTimeout(700);
    const p0 = await positions(page);
    // 1. choisir l'autocollant a1
    const za = await page.locator('.ac-zone[data-id="a1"]').boundingBox();
    await page.mouse.click(za.x + za.width / 2, za.y + za.height / 2);
    await page.waitForTimeout(200);
    const rotBox = await page.locator('.ac-zone.choisi .ac-rot').boundingBox();
    verif(rotBox && rotBox.width >= 44 && rotBox.height >= 44, 'poignée de rotation visible, 44 px');
    const nh = await page.evaluate(() => window.app.ecrans.notes.ed.histo.length);
    // 2. rotation libre au glisser (≈ 90°, aimantée)
    const c = centre(za);
    await glisserAutour(page, centre(rotBox), c.x, c.y, 90);
    const pendant = await positions(page);
    await page.mouse.up(); await page.waitForTimeout(250);
    let r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants.find(a => a.id === 'a1').r);
    verif(Math.abs(r - 90) < 0.01, 'autocollant tourné à 90° (aimanté) : r = ' + r);
    verif(pendant === p0, 'rien ne bouge pendant la rotation');
    verif(await page.evaluate((nh) => window.app.ecrans.notes.ed.histo.length === nh + 1, nh), 'un glisser = une étape d\'annulation');
    const tr = await page.evaluate(() => getComputedStyle(document.querySelector('.ac-zone[data-id="a1"]')).transform);
    verif(tr && tr !== 'none', 'rotation affichée (CSS ' + tr.slice(0, 30) + ')');
    await capture(page, `rot_ac_${profil.replace(/ /g, '_')}`);
    await page.evaluate(() => window.app.ecrans.notes.ed.annuler()); await page.waitForTimeout(150);
    r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants.find(a => a.id === 'a1').r);
    verif(r === undefined, 'annuler : angle revenu à 0 (champ absent)');
    // 3. bouton ↻ (15°)
    await page.mouse.click(za.x + za.width / 2, za.y + za.height / 2); await page.waitForTimeout(150);
    await page.locator('.cah-sel button[title^="Tourner de 15° vers la droite"]').click(); await page.waitForTimeout(100);
    await page.locator('.cah-sel button[title^="Tourner de 15° vers la droite"]').click(); await page.waitForTimeout(100);
    await page.locator('.cah-sel button[title^="Tourner de 15° vers la gauche"]').click(); await page.waitForTimeout(100);
    r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants.find(a => a.id === 'a1').r);
    verif(r === 15, 'boutons ↻ ↻ ↺ : 15° (r = ' + r + ')');
    const aud = await audit(page, '.cah-sel');
    verif(!aud.petits.length, 'barre de l\'autocollant : cibles ≥ 44 px ' + aud.petits.join(';'));
    for (let i = 0; i < 3; i++) await page.evaluate(() => window.app.ecrans.notes.ed.annuler());
    r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants.find(a => a.id === 'a1').r);
    verif(r === undefined, 'trois annulations : retour à 0');
    // 4. lasso mixte (traits, texte, autocollants) puis rotation par la poignée
    const avant = await page.evaluate(() => {
      const ed = window.app.ecrans.notes.ed; ed.choisirAc(null);
      ed.outil = 'lasso'; ed.dessinerOutils();
      const f = ed.feuilles.get('p1');
      ed.selectionner(f, [100, 200, 900, 200, 900, 700, 100, 700]);
      return JSON.stringify({ p: ed.n.pages[0], a: ed.n.autocollants });
    });
    const nb = await page.evaluate(() => { const s = window.app.ecrans.notes.ed.sel; return [s.traits.size, s.textes.size, s.acs.size]; });
    verif(nb.join() === '1,1,2', 'lasso : 1 trait, 1 texte, 2 autocollants (' + nb + ')');
    const nh2 = await page.evaluate(() => window.app.ecrans.notes.ed.histo.length);
    const sr = await page.locator('.sel-rot').boundingBox();
    verif(sr && sr.width >= 44, 'poignée de rotation de la sélection, 44 px');
    const ctr = await page.evaluate(() => { const ed = window.app.ecrans.notes.ed, f = ed.feuilles.get('p1'), b = ed.sel.boite, r = f.cv.getBoundingClientRect();
      return { x: r.left + (f.ox || 0) + (b[0] + b[2]) / 2 * f.k, y: r.top + (f.oy || 0) + (b[1] + b[3]) / 2 * f.k }; });
    const ps0 = await positions(page);
    await glisserAutour(page, centre(sr), ctr.x, ctr.y, 90, 16);
    const ps1 = await positions(page);
    await page.mouse.up(); await page.waitForTimeout(300);
    verif(ps0 === ps1, 'rien ne bouge pendant la rotation de la sélection');
    const apres = await page.evaluate(() => { const ed = window.app.ecrans.notes.ed; return { tr: ed.n.pages[0].traits[0].p, tx: ed.n.pages[0].textes[0], a: ed.n.autocollants }; });
    const A = JSON.parse(avant);
    // contrôle : le premier point du trait a tourné de 90° autour du centre de la boîte de départ
    const b0 = await page.evaluate((A) => {
      const ed = window.app.ecrans.notes.ed; return null; }, A);
    verif(apres.a.every(a => a.r === 90), 'autocollants de la sélection : r = 90');
    verif(apres.tr[0] !== A.p.traits[0].p[0] || apres.tr[1] !== A.p.traits[0].p[1], 'points du trait tournés');
    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
    // distances conservées entre points du trait (rotation rigide)
    verif(Math.abs(dist(apres.tr[0], apres.tr[1], apres.tr[9], apres.tr[10]) - dist(A.p.traits[0].p[0], A.p.traits[0].p[1], A.p.traits[0].p[9], A.p.traits[0].p[10])) < 0.3, 'rotation rigide (distances conservées)');
    verif(await page.evaluate((n) => window.app.ecrans.notes.ed.histo.length === n + 1, nh2), 'rotation de la sélection = une étape d\'annulation');
    await capture(page, `rot_sel_${profil.replace(/ /g, '_')}`);
    await page.evaluate(() => window.app.ecrans.notes.ed.annuler()); await page.waitForTimeout(200);
    const restaure = await page.evaluate(() => { const ed = window.app.ecrans.notes.ed; return JSON.stringify({ p: ed.n.pages[0], a: ed.n.autocollants }); });
    verif(restaure === avant, 'une annulation restaure traits, textes et autocollants');
    // 5. boutons Tourner de la sélection
    await page.evaluate(() => { const ed = window.app.ecrans.notes.ed, f = ed.feuilles.get('p1'); ed.selectionner(f, [100, 200, 900, 200, 900, 700, 100, 700]); });
    await page.locator('.cah-sel button[title="Tourner de 15° vers la droite"]').click(); await page.waitForTimeout(100);
    const r15 = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants.map(a => a.r));
    verif(r15.every(x => x === 15), 'bouton ↻ de la sélection : 15°');
    const aud2 = await audit(page, '.cah-sel');
    verif(!aud2.petits.length, 'barre de sélection : cibles ≥ 44 px ' + aud2.petits.join(';'));
    await page.evaluate(() => window.app.ecrans.notes.ed.annuler());
    // 6. note texte
    await page.evaluate(() => { window.app.ecrans.notes.fermerDoc(); window.app.ecrans.notes.ouvrir('n2'); });
    await page.waitForTimeout(600);
    const zb = await page.locator('.ac-zone[data-id="b1"]').boundingBox();
    await page.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2); await page.waitForTimeout(150);
    const rb = await page.locator('.ac-zone.choisi .ac-rot').boundingBox();
    const cb = centre(zb);
    await glisserAutour(page, centre(rb), cb.x, cb.y, -45);
    await page.mouse.up(); await page.waitForTimeout(200);
    r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants[0].r);
    verif(Math.abs(r - 315) < 0.01, 'note texte : rotation au glisser (−45° → r = ' + r + ')');
    await page.locator('.nt-sel button[title="Tourner de 15° vers la droite"]').click();
    r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants[0].r);
    verif(r === 330, 'note texte : bouton ↻ (r = ' + r + ')');
    await capture(page, `rot_texte_${profil.replace(/ /g, '_')}`);
    await page.evaluate(() => { const ed = window.app.ecrans.notes.ed; ed.annulerAc(); ed.annulerAc(); });
    r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants[0].r);
    verif(r === undefined, 'note texte : deux annulations → 0');
    verif(!erreurs.length, 'aucune erreur de page ' + erreurs.join('\n'));
    await browser.close();
  }
  // iPhone : note texte (barre sur une ou deux lignes, cibles)
  for (const profil of ['iPhone 13', 'iPhone SE']) {
    console.log('\n== ' + profil);
    const { browser, page, erreurs } = await ouvrir(profil, donneesBase());
    await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n2'); });
    await page.waitForTimeout(700);
    const zb = await page.locator('.ac-zone[data-id="b1"]').boundingBox();
    await page.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2); await page.waitForTimeout(200);
    await page.locator('.nt-sel button[title="Tourner de 15° vers la droite"]').click();
    const r = await page.evaluate(() => window.app.ecrans.notes.ed.n.autocollants[0].r);
    verif(r === 15, 'iPhone : bouton ↻ (r = ' + r + ')');
    const aud = await audit(page, '.nt-sel');
    verif(!aud.petits.length && !aud.coupes.length, 'iPhone : barre sans débordement, cibles ≥ 44 px ' + aud.petits.concat(aud.coupes).join(';'));
    await capture(page, `rot_${profil.replace(/ /g, '_')}`);
    verif(!erreurs.length, 'aucune erreur de page ' + erreurs.join('\n'));
    await browser.close();
  }
  process.exit(bilan() ? 1 : 0);
})();
