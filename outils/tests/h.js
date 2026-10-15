// outillage commun des tests Playwright (iPad / iPhone)
const { chromium, devices } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs');
const OUT = '/home/claude/tests/captures';
fs.mkdirSync(OUT, { recursive: true });

function donneesBase(extra = {}) {
  const page = { id: 'p1', f: 'ligne', h: 1414, traits: [
    { c: '#1b1b1b', e: 3, p: [200, 300, 50, 260, 320, 50, 320, 300, 50, 380, 340, 50] },
  ], textes: [{ id: 't1', x: 200, y: 380, w: 300, t: 'Bonjour', c: '#1b1b1b', s: 28 }] };
  const d = {
    version: 4, modele: [], semaines: {}, echeances: [], notes: [
      { id: 'n1', titre: 'Cahier test', type: 'cahier', fond: 'ligne', papier: 'blanc', maj: '2026-10-15T00:00', pages: [page],
        autocollants: [{ id: 'a1', s: 'etoile', p: 'p1', x: 500, y: 330, t: 90 }, { id: 'a2', s: 'coeur', p: 'p1', x: 700, y: 600, t: 90 }] },
      { id: 'n2', titre: 'Note texte', type: 'texte', texte: 'Du texte', maj: '2026-10-15T00:00', autocollants: [{ id: 'b1', s: 'etoile', p: '', x: 500, y: 400, t: 90 }] },
    ],
    reglages: { theme: 'nuit' }, geos: { pc: { g: 100000, d: 0, j: '', r: 0, a: { etoile: 1, coeur: 2 }, v: {} } },
  };
  return Object.assign(d, extra);
}

async function ouvrir(profil, donnees, opts = {}) {
  const browser = opts.browser || await chromium.launch();
  const dev = typeof profil === 'string' ? devices[profil] : profil;
  const ctx = await browser.newContext(Object.assign({}, dev, opts.ctx || {}));
  await ctx.addInitScript(([d, loc, avant]) => {
    if (!sessionStorage.getItem('_init')) {
      localStorage.clear();
      localStorage.setItem('horaire_donnees', JSON.stringify(d));
      localStorage.setItem('horaire_reglages_locaux', loc || '{}');
      sessionStorage.setItem('_init', '1');
      indexedDB.deleteDatabase && 0;
    }
    if (avant) { try { (0, eval)(avant); } catch (e) { console.error(e); } }
  }, [donnees, opts.locaux || '{}', opts.avant || '']);
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(String(e && e.stack || e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push('console: ' + m.text()); });
  await page.goto('http://localhost:8765/index.html?t=' + Date.now());
  await page.waitForFunction(() => window.app && window.app.interfacePrete, null, { timeout: 20000 });
  await page.waitForTimeout(300);
  return { browser, ctx, page, erreurs };
}

let nbOk = 0, nbKo = 0;
function verif(cond, msg) { if (cond) { nbOk++; console.log('  ✓ ' + msg); } else { nbKo++; console.log('  ✗ ÉCHEC : ' + msg); } }
function bilan() { console.log(`\n${nbOk} réussis, ${nbKo} échecs`); return nbKo; }
async function capture(page, nom) { await page.screenshot({ path: `${OUT}/${nom}.png` }); }
// audit : texte coupé et cibles < 44 px parmi les boutons visibles d'un conteneur
async function audit(page, sel) {
  return page.evaluate((sel) => {
    const out = { petits: [], coupes: [] };
    const root = document.querySelector(sel) || document.body;
    for (const b of root.querySelectorAll('button, .btn, input, select, .sw')) {
      const r = b.getBoundingClientRect(), st = getComputedStyle(b);
      if (!r.width || !r.height || st.visibility === 'hidden' || b.closest('[hidden]')) continue;
      if (r.bottom < 0 || r.top > innerHeight) continue;
      if (r.width < 43.5 || r.height < 43.5) out.petits.push((b.className || b.tagName) + ' ' + (b.textContent || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    for (const e of root.querySelectorAll('*')) {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const st = getComputedStyle(e);
      if (st.display === 'none' || e.closest('[hidden]')) continue;
      if ((e.scrollWidth > e.clientWidth + 1 && (st.overflow === 'hidden' || st.textOverflow === 'ellipsis' || st.overflowX === 'hidden')) ) out.coupes.push((e.className || e.tagName) + ' « ' + e.textContent.trim().slice(0, 30) + ' »');
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.cah-rang, .deborde, .cah-pages, .jx-flux')) out.coupes.push('hors écran : ' + (e.className || e.tagName) + ' « ' + e.textContent.trim().slice(0, 30) + ' »');
    }
    return out;
  }, sel);
}
module.exports = { chromium, devices, ouvrir, donneesBase, verif, bilan, capture, audit, OUT };
