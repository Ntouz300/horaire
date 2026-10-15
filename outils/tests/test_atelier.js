// Étape 6 : atelier d'autocollants (iPad / iPhone) avec faux Firebase pour la limite par compte
const { ouvrir, donneesBase, verif, bilan, capture, audit } = require('./h.js');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const URL = 'http://localhost:8790', CLE = 'ATELIER' + Array.from({ length: 19 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
const T0 = Date.UTC(2026, 9, 15, 16, 0);
const horloge = `window.__dt = window.__dt || 0; window.maintenantMs = () => ${T0} + window.__dt;`;

async function dessiner(page) {
  const b = await page.locator('.at-toile').boundingBox();
  const k = b.width / 16;
  await page.mouse.move(b.x + 3 * k, b.y + 3 * k); await page.mouse.down();
  for (let i = 3; i < 13; i++) await page.mouse.move(b.x + i * k + k / 2, b.y + 3 * k + k / 2);
  await page.mouse.up();
  await page.locator('.at-coul').nth(2).click();
  await page.locator('.at-outils button:has-text("Gros crayon")').click();
  await page.mouse.move(b.x + 4 * k, b.y + 8 * k); await page.mouse.down();
  for (let i = 4; i < 12; i++) await page.mouse.move(b.x + i * k + k / 2, b.y + 8 * k + k / 2);
  await page.mouse.up();
}

(async () => {
  const browser = await chromium.launch();
  // ---- A (iPad)
  const A = await ouvrir('iPad Pro 11', donneesBase(), { browser });
  await A.page.evaluate(horloge);
  await A.page.evaluate(([u, c]) => window.app.sync.configurer(u, c), [URL, CLE]);
  await A.page.waitForTimeout(2500);
  await A.page.evaluate(() => window.app.aller('jeux'));
  await A.page.waitForTimeout(400);
  await A.page.locator('button:has-text("Créer un autocollant")').click();
  await A.page.waitForSelector('.at-toile');
  await A.page.waitForTimeout(400);
  const pal = await A.page.evaluate(() => paletteDuJour()[0]);
  verif(!!pal, 'palette du jour : ' + pal);
  const au = await audit(A.page, '.carte-modale.atelier');
  verif(!au.petits.filter(x => !/bq-x/.test(x)).length, 'atelier : cibles ≥ 44 px ' + au.petits.slice(0, 6).join(';'));
  verif(!au.coupes.length, 'atelier : aucun texte coupé ' + au.coupes.slice(0, 5).join(';'));
  await dessiner(A.page);
  await capture(A.page, 'atelier_dessin_ipad');
  await A.page.fill('.atelier input.saisie', 'Mon dragon');
  await A.page.evaluate(() => { window.aleaReel = (() => { const v = [0.3, 0.5]; let i = 0; return () => v[i++ % 2]; })(); });   // rare, prix au milieu
  await A.page.locator('.atelier button:has-text("Créer l\'autocollant")').click();
  await A.page.waitForSelector('.at-resultat');
  const c = await A.page.evaluate(() => { const [k, c] = Object.entries(Creations.info)[0]; return Object.assign({ k, inv: Geos.inventaire(window.app.donnees)[k], fx: !!document.querySelector('.at-resultat .ac-fx-brille'), cj: Geos.compte(window.app).cj }, c); });
  verif(c.rar === 'rare' && c.prix >= 3000 && c.prix <= 6000 && c.prix % 10 === 0, `rareté et prix : ${c.rar}, ${c.prix}`);
  verif(c.fx, 'animation « brille » visible pour un rare');
  verif(c.inv === 1 && c.cj === '2026-10-15' && c.j === '2026-10-15', 'dans l\'inventaire ; cj = jour de Toronto');
  await capture(A.page, 'atelier_resultat_ipad');
  // vente : jamais sans confirmation
  const s0 = await A.page.evaluate(() => Geos.solde(window.app.donnees));
  await A.page.locator('.at-choix button:has-text("Vendre pour")').click();
  await A.page.waitForSelector('.dialogue');
  verif(await A.page.evaluate(() => Geos.solde(window.app.donnees)) === s0, 'clic sur « Vendre » : rien n\'est vendu avant la confirmation');
  const msg = await A.page.locator('.dialogue .message').textContent();
  verif(/Rare/.test(msg) && msg.includes(c.prix.toLocaleString('fr-CA').replace(/\s/g, ' ').slice(0, 1)), 'prix et rareté affichés avant la vente');
  await capture(A.page, 'atelier_confirmation_ipad');
  await A.page.locator('.dialogue button:has-text("Annuler")').click();
  verif(await A.page.evaluate(() => Geos.solde(window.app.donnees)) === s0, 'annuler : rien n\'est vendu');
  // limite : une seule création par jour
  verif(await A.page.evaluate(() => Creations.creer(window.app, 'x', 'A112233;3:AAAAAAAAA') === null), 'deuxième création le même jour : refusée');
  await A.page.locator('.atelier .barre-actions button:has-text("Fermer")').click();
  await A.page.waitForTimeout(300);
  await A.page.locator('button:has-text("Créer un autocollant")').click();
  await A.page.waitForSelector('.at-limite');
  const lim = await A.page.locator('.at-temps').textContent();
  verif(/Prochain autocollant dans 12 h 00 min/.test(lim), 'atelier : temps restant affiché (' + lim + ')');
  await capture(A.page, 'atelier_limite_ipad');
  await A.page.locator('.atelier .barre-actions button:has-text("Fermer")').click();
  await A.page.waitForTimeout(2500);
  // ---- B (iPhone, même compte) : la limite vaut aussi pour lui
  const B = await ouvrir('iPhone 13', donneesBase({ geos: {} }), { browser });
  await B.page.evaluate(horloge);
  await B.page.evaluate(([u, cl]) => window.app.sync.configurer(u, cl), [URL, CLE]);
  await B.page.waitForTimeout(3500);
  const b = await B.page.evaluate((k) => ({ peut: Creations.peutCreer(window.app.donnees), a: !!Creations.info[k], inv: Geos.inventaire(window.app.donnees)[k] }), c.k);
  verif(!b.peut && b.a && b.inv === 1, 'autre appareil : création reçue, limite déjà atteinte pour le compte');
  await B.page.evaluate(() => { window.app.aller('jeux'); new AtelierAc(window.app).montrer(); });
  await B.page.waitForSelector('.at-limite');
  await capture(B.page, 'atelier_limite_iphone');
  // vente confirmée sur B (le jour même)
  const sb0 = await B.page.evaluate(() => Geos.solde(window.app.donnees));
  await B.page.evaluate(() => [...document.querySelectorAll('.carte-modale')].forEach(() => 0));
  await B.page.locator('.atelier .bq-vendre').click();
  await B.page.locator('.dialogue button:has-text("Vendre pour")').click();
  await B.page.waitForTimeout(300);
  const sb = await B.page.evaluate((k) => ({ s: Geos.solde(window.app.donnees), inv: Geos.inventaire(window.app.donnees)[k] || 0 }), c.k);
  verif(sb.s - sb0 === c.prix && sb.inv === 0, `vente confirmée : +${sb.s - sb0}, retiré de l'inventaire`);
  // ---- lendemain (simulé) : vente refusée, nouvelle création permise
  await A.page.evaluate(() => { window.__dt = 13 * 3600000; });
  const d2 = await A.page.evaluate(() => {
    window.aleaReel = (() => { const v = [0.05, 0.99]; let i = 0; return () => v[i++ % 2]; })();
    const x = Creations.creer(window.app, 'Demain', 'A112233B445566;4:AABBAABBAABBAABB');
    return x;
  });
  verif(d2 && d2.j === '2026-10-16' && d2.rar === 'tres_rare' && d2.prix >= 6000 && d2.prix <= 9000, 'le lendemain : nouvelle création permise ' + JSON.stringify(d2 && [d2.j, d2.rar, d2.prix, d2.v]));
  await A.page.evaluate(() => { window.__dt = 13 * 3600000 + 24 * 3600000; });
  const refus = await A.page.evaluate((k) => ({ v: Creations.vendre(window.app, k), inv: Geos.inventaire(window.app.donnees)[k] }), d2.id);
  verif(refus.v === 0 && refus.inv === 1, JSON.stringify(refus) + ' ' + 'vente refusée le lendemain de la création (reste dans l\'inventaire)');
  await A.page.evaluate(() => new Inventaire(window.app).montrer());
  await A.page.waitForSelector('.inventaire .inv-art');
  verif(await A.page.locator('.inventaire .inv-art:has-text("Vente fermée")').count() === 1, 'inventaire : « Vente fermée » affiché');
  verif(await A.page.locator('.inventaire .inv-art .ac-fx-scintille').count() >= 1, 'animation « scintille » pour un très rare');
  await capture(A.page, 'atelier_inventaire_ipad');
  // prix stable après réouverture
  const avant = await A.page.evaluate((k) => Creations.info[k].prix, d2.id);
  await A.page.evaluate(() => window.app.sauver && window.app.sauver());
  await A.page.waitForTimeout(800);
  await A.page.reload();
  await A.page.waitForFunction(() => window.app && window.app.interfacePrete);
  await A.page.waitForTimeout(500);
  verif(await A.page.evaluate((k) => Creations.info[k] && Creations.info[k].prix, d2.id) === avant, 'prix identique après réouverture');
  // tirage : 50 / 40 / 10 sur 200 000 tirages ; prix dans la fourchette
  const st = await A.page.evaluate(() => {
    const n = { commun: 0, rare: 0, tres_rare: 0 }; let hors = 0;
    for (let i = 0; i < 200000; i++) { const r = Creations.rarete(aleaReel()); n[r]++; const p = Creations.prix(r, aleaReel()); if (p < CREATION_PRIX[r][0] || p > CREATION_PRIX[r][1] || p % 10) hors++; }
    return { n, hors };
  });
  const pc = (x) => x / 2000;
  verif(Math.abs(pc(st.n.commun) - 50) < 0.6 && Math.abs(pc(st.n.rare) - 40) < 0.6 && Math.abs(pc(st.n.tres_rare) - 10) < 0.4 && !st.hors,
    `200 000 tirages : commun ${pc(st.n.commun)} %, rare ${pc(st.n.rare)} %, très rare ${pc(st.n.tres_rare)} %, prix hors fourchette : ${st.hors}`);
  verif(!A.erreurs.length && !B.erreurs.length, 'aucune erreur de page ' + A.erreurs.concat(B.erreurs).join('\n'));
  // iPhone SE : atelier sans débordement
  const S = await ouvrir('iPhone SE', donneesBase(), { browser });
  await S.page.evaluate(() => { window.app.aller('jeux'); new AtelierAc(window.app).montrer(); });
  await S.page.waitForSelector('.at-toile'); await S.page.waitForTimeout(500);
  const au2 = await audit(S.page, '.carte-modale.atelier');
  verif(!au2.petits.filter(x => !/bq-x/.test(x)).length && !au2.coupes.length, 'iPhone SE : atelier sans débordement, cibles ≥ 44 px ' + au2.petits.concat(au2.coupes).slice(0, 5).join(';'));
  await capture(S.page, 'atelier_iphone_se');
  await browser.close();
  process.exit(bilan() ? 1 : 0);
})();
