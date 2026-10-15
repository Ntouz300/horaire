// Étape 2 : note synchronisée ou non (iPad / iPhone) avec un faux Firebase
const { ouvrir, donneesBase, verif, bilan, capture, audit } = require('./h.js');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs');
const URL = 'http://localhost:8790', CLE = 'TESTCLE' + Array.from({ length: 19 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
const serveur = () => fetch(URL + '/__racine').then(r => r.json()).then(r => (r.h && r.h[CLE] && r.h[CLE].v) || {});
const journal = () => fs.readFileSync('/home/claude/tests/fakefb_journal.jsonl', 'utf8');
const attendre = (ms) => new Promise(r => setTimeout(r, ms));

async function creerNote(page, titre, sync) {
  await page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.bibliotheque(); new NouveauDocument(window.app.ecrans.notes).montrer(); });
  await page.waitForTimeout(300);
  await page.locator('.carte-modale .choix-type', { hasText: 'Note texte' }).click().catch(() => {});
  await page.locator('.carte-modale input.saisie').first().fill(titre);
  const coche = await page.evaluate(() => document.querySelector('.nd-sync .case').classList.contains('on'));
  if (coche !== sync) await page.locator('.nd-sync .case-texte').click();
  const aide = await page.locator('.nd-sync-aide').textContent();
  await page.locator('.carte-modale button', { hasText: 'Créer' }).click();
  await page.waitForTimeout(300);
  return { coche, aide, id: await page.evaluate((t) => window.app.donnees.notes.find(n => n.titre === t).id, titre) };
}

(async () => {
  const browser = await chromium.launch();
  // Appareil A (iPad)
  const A = await ouvrir('iPad Pro 11', donneesBase(), { browser });
  // la case est présente, cochée par défaut, et la fenêtre reste propre
  await A.page.evaluate(() => { window.app.aller('notes'); new NouveauDocument(window.app.ecrans.notes).montrer(); });
  await A.page.waitForTimeout(300);
  verif(await A.page.evaluate(() => document.querySelector('.nd-sync .case').classList.contains('on')), 'case « Synchroniser cette note » cochée par défaut');
  await capture(A.page, 'sync_nouveau_ipad');
  const au = await audit(A.page, '.carte-modale');
  verif(!au.coupes.length, 'fenêtre Nouveau : aucun texte coupé ' + au.coupes.join(';'));
  await A.page.evaluate(() => document.querySelector('.carte-modale button.bs-x, .carte-modale [aria-label="Fermer"]') ? 0 : 0);
  await A.page.keyboard.press('Escape'); await A.page.waitForTimeout(200);
  await A.page.evaluate(() => { const m = document.querySelector('.voile, .modal-voile'); if (m) m.remove(); });
  const S = await creerNote(A.page, 'Note partagée', true);
  const L = await creerNote(A.page, 'Note privée', false);
  verif(L.aide.includes('jamais envoyée'), 'texte d\'aide de « Non » : ' + L.aide);
  const nL = await A.page.evaluate((id) => window.app.donnees.notes.find(n => n.id === id), L.id);
  const nS = await A.page.evaluate((id) => window.app.donnees.notes.find(n => n.id === id), S.id);
  verif(nL.sync === 0, 'note non synchronisée : champ sync = 0');
  verif(!('sync' in nS), 'note synchronisée : champ absent (rétrocompatible)');
  await A.page.evaluate(([u, c]) => window.app.sync.configurer(u, c), [URL, CLE]);
  await A.page.waitForTimeout(3500);
  let v = await serveur();
  verif(!!v['n_' + S.id], 'la note synchronisée est sur le serveur');
  verif(!v['n_' + L.id], 'la note non synchronisée n\'est pas sur le serveur');
  verif(!journal().includes(L.id), 'aucun envoi ne contient l\'id de la note non synchronisée');
  verif(v.notes && !JSON.parse(v.notes.j).includes(L.id), 'liste « notes » du serveur sans la note privée');
  // carte : étiquette « Sur cet appareil » même en mode automatique
  await A.page.evaluate(() => { window.app.ecrans.notes.fermerDoc(); window.app.ecrans.notes.bibliotheque(); });
  await A.page.waitForTimeout(300);
  verif(await A.page.locator('.doc-sync.local').count() === 1, 'carte de la note privée : interrupteur « Sur cet appareil »');
  await capture(A.page, 'sync_biblio_ipad');
  // Appareil B : même clé
  const B = await ouvrir('iPhone 13', donneesBase({ notes: [] }), { browser });
  await B.page.evaluate(([u, c]) => window.app.sync.configurer(u, c), [URL, CLE]);
  await B.page.waitForTimeout(3500);
  let idsB = await B.page.evaluate(() => window.app.donnees.notes.map(n => n.id));
  verif(idsB.includes(S.id) && !idsB.includes(L.id), 'appareil B : reçoit la note partagée, pas la privée');
  // changer d'avis : la note privée devient synchronisée (options de la note)
  await A.page.evaluate((id) => { const pn = window.app.ecrans.notes; new InfosDocument(pn, pn.note(id)).montrer(); }, L.id);
  await A.page.waitForTimeout(300);
  verif(!(await A.page.evaluate(() => [...document.querySelectorAll('.carte-modale .case')].pop().classList.contains('on'))), 'options : case décochée pour la note privée');
  await capture(A.page, 'sync_options_ipad');
  await A.page.locator('.carte-modale .case-texte', { hasText: 'Synchroniser cette note' }).click();
  await A.page.locator('.carte-modale button', { hasText: 'Enregistrer' }).click();
  await A.page.waitForTimeout(3000);
  v = await serveur();
  verif(!!v['n_' + L.id], 'note rendue synchronisée : envoyée au serveur');
  verif(await A.page.evaluate((id) => !('sync' in window.app.donnees.notes.find(n => n.id === id)), L.id), 'champ sync retiré');
  idsB = await B.page.evaluate(() => window.app.donnees.notes.map(n => n.id));
  verif(idsB.includes(L.id), 'appareil B : la reçoit');
  // et l'inverse : la note partagée devient privée ; sa modification n'est plus envoyée, B garde l'ancienne copie
  await A.page.evaluate((id) => { const pn = window.app.ecrans.notes; pn.changerSyncNote(pn.note(id), false); }, S.id);
  await A.page.evaluate((id) => { const n = window.app.donnees.notes.find(x => x.id === id); n.titre = 'Titre local seulement'; n.maj = '2026-10-15T09:00'; window.app.sauver(); window.app.sync.localChange(); }, S.id);
  await A.page.waitForTimeout(3000);
  v = await serveur();
  verif(JSON.parse(v['n_' + S.id].j).titre === 'Note partagée', 'note rendue privée : la modification n\'est pas envoyée');
  verif(await B.page.evaluate((id) => window.app.donnees.notes.find(n => n.id === id).titre, S.id) === 'Note partagée', 'appareil B : garde l\'ancienne copie');
  // B modifie sa copie : A n'est pas écrasé
  await B.page.evaluate((id) => { const n = window.app.donnees.notes.find(x => x.id === id); n.titre = 'Changé sur B'; n.maj = '2026-10-15T10:00'; window.app.sauver(); window.app.sync.localChange(); }, S.id);
  await attendre(3000);
  verif(await A.page.evaluate((id) => window.app.donnees.notes.find(n => n.id === id).titre, S.id) === 'Titre local seulement', 'A : la note privée n\'est pas remplacée par le serveur');
  verif(!A.erreurs.length && !B.erreurs.length, 'aucune erreur de page ' + A.erreurs.concat(B.erreurs).join('\n'));
  fs.writeFileSync('/home/claude/tests/ids_sync.json', JSON.stringify({ S: S.id, L: L.id, CLE }));
  await browser.close();
  process.exit(bilan() ? 1 : 0);
})();
