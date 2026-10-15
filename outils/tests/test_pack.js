// Étape 3 : paquet d'autocollants (chargement à la demande, rendu, contraintes)
const { ouvrir, donneesBase, verif, bilan, capture } = require('./h.js');
const fs = require('fs');
(async () => {
  // 1. sans autocollant du paquet : rien n'est chargé au démarrage
  let A = await ouvrir('iPad Pro 11', donneesBase());
  const req = [];
  A.page.on('request', r => { if (r.url().includes('pack_ac')) req.push(r.url()); });
  await A.page.waitForTimeout(800);
  verif(await A.page.evaluate(() => !PackAC.pret && JX.autocollants.length === 166), 'démarrage : paquet non chargé, 166 autocollants');
  await A.page.evaluate(() => new Boutique(window.app).montrer());
  await A.page.waitForFunction(() => PackAC.pret, null, { timeout: 5000 });
  await A.page.waitForTimeout(400);
  verif(req.length === 1, 'ouverture de la boutique : paquet téléchargé une fois (' + req.join() + ')');
  const st = await A.page.evaluate(() => {
    const ids = JX.autocollants.map(a => a[0]);
    const r = { n: ids.length, uniques: new Set(ids).size, trop: [], couleurs: [], themes: {}, rar: {} };
    for (const id of ids) {
      const s = SPRITES[id];
      if (!s || s.rows.length > 24 || s.rows.some(x => x.length > 24 || x.length !== s.rows[0].length)) r.trop.push(id);
      for (const row of s.rows) for (const c of row) if (c !== '.' && !/^#[0-9a-f]{6}$/i.test(s.pal[c] || '')) { r.couleurs.push(id + ':' + c); break; }
      r.themes[themeAc(id)] = (r.themes[themeAc(id)] || 0) + 1; r.rar[rareteAc(id)] = (r.rar[rareteAc(id)] || 0) + 1;
    }
    return r;
  });
  verif(st.n >= 1000 && st.uniques === st.n, `catalogue : ${st.n} autocollants, ids uniques`);
  verif(!st.trop.length, 'toutes les grilles ≤ 24×24 et rectangulaires ' + st.trop.slice(0, 5));
  verif(!st.couleurs.length, 'toutes les lettres ont une couleur ' + st.couleurs.slice(0, 5));
  console.log('   thèmes', JSON.stringify(st.themes)); console.log('   raretés', JSON.stringify(st.rar));
  await capture(A.page, 'pack_boutique_ipad');
  // export pour comparaison avec le PC
  const dump = await A.page.evaluate(() => JX.autocollants.map(a => [a[0], a[1], a[2], a[3], SPRITES[a[0]].pal, SPRITES[a[0]].rows, (JX.effets || {})[a[0]] || '', rareteAc(a[0]), themeAc(a[0])]));
  fs.writeFileSync('/home/claude/tests/pack_js.json', JSON.stringify(dump));
  verif(!A.erreurs.length, 'aucune erreur de page ' + A.erreurs.join('\n'));
  await A.browser.close();
  // 2. une note contient un autocollant du paquet : chargé au démarrage et affiché
  const d = donneesBase();
  d.notes[0].autocollants.push({ id: 'z1', s: 'p_bolide_bleu', p: 'p1', x: 300, y: 800, t: 120, r: 30 });
  d.geos.pc.a['p_chat_tete_roux'] = 1;
  A = await ouvrir('iPad Pro 11', d);
  await A.page.waitForFunction(() => PackAC.pret, null, { timeout: 5000 });
  await A.page.evaluate(() => { window.app.aller('notes'); window.app.ecrans.notes.ouvrir('n1'); });
  await A.page.waitForTimeout(700);
  const img = await A.page.evaluate(() => { const z = document.querySelector('.ac-zone[data-id="z1"] img'); return z ? z.src.length : 0; });
  verif(img > 100, 'autocollant du paquet affiché dans le cahier');
  await capture(A.page, 'pack_note_ipad');
  verif(!A.erreurs.length, 'aucune erreur de page ' + A.erreurs.join('\n'));
  await A.browser.close();
  process.exit(bilan() ? 1 : 0);
})();
