/* Documents PDF dans les notes : stockage sur l'appareil, transfert par la synchro (Firebase /h/<clé>/f/<id>),
   affichage avec pdf.js et import (.pdf, .zip exporté de GoodNotes). Même fonctionnement que sur le PC. */
"use strict";

const MORCEAU_PDF = 700000;          // caractères base64 par morceau envoyé à Firebase (< 10 Mo par valeur)

/* ---------- base64 et empreinte */
function versBase64(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function depuisBase64(b) {
  const s = atob(b), u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}
async function empreinte(u8) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", u8));
  return Array.from(h.subarray(0, 10), b => b.toString(16).padStart(2, "0")).join("");
}
function nomPropre(s) { return String(s || "").normalize("NFC"); }

/* ---------- stockage local (base séparée : les PDF ne sont jamais chargés au démarrage) */
const Fichiers = {
  db: null, enCours: new Map(), _att: null,
  async ouvrir() {
    if (this.db) return this.db;
    this.db = await new Promise((ok, ko) => {
      const r = indexedDB.open("horaire_fichiers", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("pdf");
      r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
    });
    return this.db;
  },
  async lireLocal(id) {
    try {
      const db = await this.ouvrir();
      return await new Promise((ok) => { const r = db.transaction("pdf").objectStore("pdf").get(id); r.onsuccess = () => ok(r.result ? new Uint8Array(r.result) : null); r.onerror = () => ok(null); });
    } catch (e) { return null; }
  },
  async ecrireLocal(id, u8) {
    try {
      const db = await this.ouvrir();
      await new Promise((ok) => { const tx = db.transaction("pdf", "readwrite"); tx.objectStore("pdf").put(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength), id); tx.oncomplete = ok; tx.onerror = ok; });
    } catch (e) { /* */ }
  },
  async effacerLocal(id) {
    try { const db = await this.ouvrir(); db.transaction("pdf", "readwrite").objectStore("pdf").delete(id); } catch (e) { /* */ }
  },
  async idsLocaux() {
    try { const db = await this.ouvrir(); return await new Promise((ok) => { const r = db.transaction("pdf").objectStore("pdf").getAllKeys(); r.onsuccess = () => ok(r.result || []); r.onerror = () => ok([]); }); } catch (e) { return []; }
  },
  urlDistant(id) {
    const s = window.app && app.sync;
    return s && s.configuree() ? s.cfg.url.replace(/\/+$/, "") + "/h/" + s.cfg.cle + "/f/" + id + ".json" : null;
  },
  meta(id) { return ((window.app && app.donnees && app.donnees.fichiers) || []).find(f => f.id === id) || null; },
  /* contenu d'un PDF : sur l'appareil, sinon téléchargé une fois depuis la synchro */
  obtenir(id) {
    if (this.enCours.has(id)) return this.enCours.get(id);
    const p = (async () => {
      const local = await this.lireLocal(id);
      if (local) return local;
      const url = this.urlDistant(id);
      if (!url) throw new Error("Ce fichier est sur l'autre appareil : active la synchronisation pour le recevoir.");
      const r = await fetch(url);
      if (!r.ok) throw new Error("Téléchargement impossible (" + r.status + ").");
      const j = await r.json();
      if (!j) throw new Error("Ce fichier n'est pas encore arrivé : ouvre l'appli sur l'appareil qui l'a importé.");
      const morceaux = Array.isArray(j) ? j : Object.keys(j).sort((a, b) => a - b).map(k => j[k]);
      const u8 = depuisBase64(morceaux.join(""));
      await this.ecrireLocal(id, u8);
      return u8;
    })();
    this.enCours.set(id, p);
    p.catch(() => this.enCours.delete(id));
    return p;
  },
  /* envoi vers la synchro (une seule fois par document) ; réessayé plus tard si hors ligne */
  aEnvoyer() { return Stock.lire("horaire_pdf_a_envoyer", []); },
  marquer(id, envoye) {
    const l = this.aEnvoyer().filter(x => x !== id);
    if (!envoye) l.push(id);
    Stock.ecrire("horaire_pdf_a_envoyer", l);
  },
  async envoyer(id) {
    const url = this.urlDistant(id);
    if (!url || navigator.onLine === false) { this.marquer(id, false); return false; }
    try {
      const u8 = await this.lireLocal(id);
      if (!u8) { this.marquer(id, true); return false; }
      const b = versBase64(u8), corps = {};
      for (let i = 0, k = 0; i < b.length; i += MORCEAU_PDF, k++) corps[k] = b.slice(i, i + MORCEAU_PDF);
      const r = await fetch(url, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(corps)});
      if (!r.ok) throw new Error(String(r.status));
      this.marquer(id, true);
      return true;
    } catch (e) { this.marquer(id, false); return false; }
  },
  async relancer() {
    if (this._att) return;
    this._att = true;
    try { for (const id of this.aEnvoyer()) if (this.meta(id)) await this.envoyer(id); else this.marquer(id, true); } finally { this._att = null; }
  },
  async supprimer(id) {
    this.marquer(id, true);
    await this.effacerLocal(id);
    const url = this.urlDistant(id);
    if (url) fetch(url, {method: "DELETE"}).catch(() => {});
  },
  /* ménage : PDF locaux qui ne sont plus utilisés par aucun document. Il ne supprime jamais rien tant que les données ne sont pas
     chargées et fiables (stockage dégradé, premier chargement, liste vide) : sinon une lecture ratée au démarrage viderait les PDF
     de l'appareil et les pages deviendraient blanches. */
  async menage() {
    const d = window.app && app.donnees;
    if (!d || !app.interfacePrete || Stock.degrade || app.premierChargement) return;
    const utilises = new Set((d.fichiers || []).map(f => f.id));
    for (const n of d.notes || []) for (const p of n.pages || []) if (p.pdf) utilises.add(p.pdf[0]);
    const locaux = await this.idsLocaux();
    if (!utilises.size && locaux.length) { Stock.journal("ménage des PDF ignoré", "aucun fichier connu alors que " + locaux.length + " sont sur l'appareil"); return; }
    for (const id of locaux) if (!utilises.has(id)) this.effacerLocal(id);
  },
};
setInterval(() => { if (window.app && app.sync && app.sync.configuree() && Fichiers.aEnvoyer().length) Fichiers.relancer(); }, 30000);

/* ---------- pdf.js (chargé à la demande) */
let _pdfjs = null;
function pdfjs() {
  if (!_pdfjs) {
    _pdfjs = import(new URL("js/vendor/pdf.min.mjs", location.href).href).then(m => {
      m.GlobalWorkerOptions.workerSrc = new URL("js/vendor/pdf.worker.min.mjs", location.href).href;
      return m;
    });
    _pdfjs.catch(() => { _pdfjs = null; });
  }
  return _pdfjs;
}
function optionsPdf(u8) {
  return {data: u8.slice(), standardFontDataUrl: new URL("js/vendor/standard_fonts/", location.href).href,
    wasmUrl: new URL("js/vendor/wasm/", location.href).href, isEvalSupported: false};
}

/* rendu des pages : file d'attente (la dernière demande d'abord), cache limité en pixels */
const Rendu = {
  docs: new Map(),           // id → Promise<PDFDocumentProxy>
  cache: new Map(),          // "id:idx" → [{w, cv}]  (du plus petit au plus grand)
  pixels: 0, MAX: 26e6,
  file: [], actif: false, ecoutes: new Set(), erreurs: new Map(),
  doc(id) {
    if (!this.docs.has(id)) {
      let tache = null;
      const p = Promise.all([pdfjs(), Fichiers.obtenir(id)]).then(([m, u8]) => { tache = m.getDocument(optionsPdf(u8)); return tache.promise; });
      p.catch(() => this.docs.delete(id));
      p.fermer = () => { p.then(() => tache && tache.destroy()).catch(() => {}); };
      this.docs.set(id, p);
      if (this.docs.size > 5) { const [k, v] = this.docs.entries().next().value; this.docs.delete(k); v.fermer(); }
    }
    return this.docs.get(id);
  },
  /* image déjà prête (la plus proche de la largeur voulue) ; lance le rendu si elle manque ou est trop petite */
  image(id, idx, w) {
    w = Math.max(60, Math.round(w));
    const l = this.cache.get(id + ":" + idx) || [];
    const bonne = l.find(x => x.w >= w * .9 && x.w <= w * 2.2);
    if (!bonne) this.demander(id, idx, w);
    else this.toucher(id + ":" + idx);
    return bonne ? bonne.cv : (l.length ? l[l.length - 1].cv : null);
  },
  erreur(id) { return this.erreurs.get(id) || ""; },
  demander(id, idx, w) {
    const cle = id + ":" + idx;
    if (this.file.some(x => x.cle === cle && Math.abs(x.w - w) < w * .1)) return;
    this.file = this.file.filter(x => x.cle !== cle);
    this.file.push({cle, id, idx, w});
    this.suivant();
  },
  rendreMaintenant(id, idx, w) {
    return new Promise((ok, ko) => { this.file.push({cle: id + ":" + idx, id, idx, w: Math.round(w), ok, ko}); this.suivant(); });
  },
  async suivant() {
    if (this.actif || !this.file.length) return;
    this.actif = true;
    const t = this.file.pop();
    try {
      const doc = await this.doc(t.id);
      const page = await doc.getPage(t.idx + 1);
      const v1 = page.getViewport({scale: 1}), vp = page.getViewport({scale: t.w / v1.width});
      const cv = document.createElement("canvas");
      cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
      await page.render({canvasContext: ctx, viewport: vp}).promise;
      page.cleanup();
      this.ranger(t.cle, t.w, cv);
      this.erreurs.delete(t.id);
      if (t.ok) t.ok(cv);
      for (const f of this.ecoutes) { try { f(t.id, t.idx); } catch (e) { /* */ } }
    } catch (e) {
      this.erreurs.set(t.id, String(e && e.message || e));
      if (t.ko) t.ko(e);
      for (const f of this.ecoutes) { try { f(t.id, t.idx); } catch (er) { /* */ } }
    }
    this.actif = false;
    setTimeout(() => this.suivant(), 0);
  },
  ranger(cle, w, cv) {
    const l = (this.cache.get(cle) || []).filter(x => Math.abs(x.w - w) > w * .1);
    l.push({w, cv}); l.sort((a, b) => a.w - b.w);
    this.cache.delete(cle); this.cache.set(cle, l);
    this.pixels += cv.width * cv.height;
    // on libère les images les plus anciennes au-delà du plafond (mémoire de l'iPad)
    for (const [k, li] of this.cache) {
      if (this.pixels <= this.MAX || k === cle) continue;
      for (const x of li) { this.pixels -= x.cv.width * x.cv.height; x.cv.width = x.cv.height = 0; }
      this.cache.delete(k);
    }
  },
  toucher(cle) { const l = this.cache.get(cle); if (l) { this.cache.delete(cle); this.cache.set(cle, l); } },
  surPret(f) { this.ecoutes.add(f); return () => this.ecoutes.delete(f); },
};

/* ---------- lecture d'un .zip (sans bibliothèque) */
async function lireZip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let fin = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  if (fin < 0) throw new Error("Archive .zip illisible.");
  const nb = dv.getUint16(fin + 10, true);
  let p = dv.getUint32(fin + 16, true);
  const out = [], dec = new TextDecoder("utf-8");
  for (let k = 0; k < nb; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const meth = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const ln = dv.getUint16(p + 28, true), lx = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const nom = dec.decode(u8.subarray(p + 46, p + 46 + ln)).normalize("NFC");
    p += 46 + ln + lx + lc;
    if (nom.endsWith("/")) continue;
    const d0 = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    const brut = u8.subarray(d0, d0 + csize);
    out.push({nom, lire: async () => {
      if (meth === 0) return brut.slice();
      if (meth !== 8) throw new Error("Compression non prise en charge : " + nom);
      const flux = new Blob([brut]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Uint8Array(await new Response(flux).arrayBuffer());
    }});
  }
  return out;
}

/* ---------- import */
const COULEURS_GN = {blue: "#2980b9", red: "#c0392b", green: "#27ae60", yellow: "#f1c40f", orange: "#e67e22", purple: "#8e44ad", pink: "#d35490", gray: "#7f8c8d", black: "#2c3e50"};
function couleurGoodNotes(c) { return estHex(c) ? c : COULEURS_GN[c] || ""; }

/* dossier (créé au besoin) */
function dossierNomme(d, nom, couleur) {
  let x = (d.dossiers || []).find(f => f.nom === nom);
  if (!x) { x = {id: newId(), nom, couleur: couleur || COUVERTURES[(d.dossiers || []).length % COUVERTURES.length]}; d.dossiers.push(x); }
  return x.id;
}

/* un PDF : copié dans les données de l'appli (reste lisible même si l'original disparaît), enregistré dans la liste des fichiers
   et marqué à envoyer à l'autre appareil. Renvoie son identifiant et la taille de chaque page. */
async function preparerPdf(app, u8, nom) {
  const m = await pdfjs();
  const id = await empreinte(u8);
  const tache = m.getDocument(optionsPdf(u8));
  const tailles = [];
  try {
    const doc = await tache.promise;
    for (let i = 1; i <= doc.numPages; i++) { const v = (await doc.getPage(i)).getViewport({scale: 1}); tailles.push([Math.round(v.width * 100) / 100, Math.round(v.height * 100) / 100]); }
  } finally { tache.destroy(); }
  const d = app.donnees;
  await Fichiers.ecrireLocal(id, u8);
  if (!(await Fichiers.lireLocal(id))) throw new Error("copie impossible dans la mémoire de l'iPad (espace plein ?)");
  if (!d.fichiers.some(f => f.id === id)) {
    d.fichiers.push({id, nom: nomPropre(nom), taille: u8.length, n: Math.ceil(Math.ceil(u8.length / 3) * 4 / MORCEAU_PDF), pages: tailles, ajout: nowIsoMinutes()});
    Fichiers.marquer(id, false);
  }
  return {id, tailles};
}
function pagesPdf(id, tailles) {
  return tailles.map(([w, h], i) => ({id: newId(), f: "pdf", h: Math.round(PAGE_L * h / w), pdf: [id, i], traits: [], textes: []}));
}
/* un PDF → un cahier dont chaque page a le PDF en fond */
async function importerPdf(app, u8, nom, dossier, couverture) {
  const {id, tailles} = await preparerPdf(app, u8, nom);
  const n = normaliserNote({id: newId(), type: "cahier", titre: nomPropre(nom).replace(/\.pdf$/i, ""), dossier: dossier || "", fond: "blanc", papier: "blanc",
    couverture: couverture || "", fichier: id, maj: nowIsoMinutes(), pages: pagesPdf(id, tailles)});
  app.donnees.notes.unshift(n);
  nouvelleNote(app, n.id);
  return n;
}

/* ---------- import de documents : PDF, images (JPG, PNG) et texte (TXT), dans un dossier ou dans un fichier */
const TAILLE_MAX_IMPORT = 20 * 1024 * 1024;        // taille maximale d'un document importé (au-delà, la synchro deviendrait trop lente)
const FORMATS_DOCUMENT = ".pdf,.txt,.jpg,.jpeg,.png,application/pdf,text/plain,image/jpeg,image/png";
function moTexte(o) { return (Math.round(o / 104857.6) / 10).toString().replace(".", ",") + " Mo"; }
function genreDocument(nom, u8) {
  if (u8 && u8.length > 3) {
    if (u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46) return "pdf";
    if (u8[0] === 0xFF && u8[1] === 0xD8) return "image";
    if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E) return "image";
  }
  if (/\.pdf$/i.test(nom)) return "pdf";
  if (/\.(jpe?g|png)$/i.test(nom)) return "image";
  if (/\.txt$/i.test(nom)) return "texte";
  return "";
}
function messageFormat(nom) {
  if (/\.docx?$/i.test(nom)) return nom + " : les documents Word ne sont pas pris en charge (exporte-les d'abord en PDF).";
  return nom + " : format non pris en charge (PDF, JPG, PNG ou TXT).";
}
/* une image → un PDF d'une page (la photo est redressée selon son orientation et réduite à 2400 px au plus) */
async function imageEnPdf(u8) {
  const {PDFDocument} = await pdfLib();
  const doc = await PDFDocument.create();
  let img;
  if (u8[0] === 0x89 && u8[1] === 0x50) img = await doc.embedPng(u8);
  else {
    const bmp = await createImageBitmap(new Blob([u8]));
    const e = Math.min(1, 2400 / Math.max(bmp.width, bmp.height)), cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(bmp.width * e)); cv.height = Math.max(1, Math.round(bmp.height * e));
    const c = cv.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height); c.drawImage(bmp, 0, 0, cv.width, cv.height);
    if (bmp.close) bmp.close();
    const blob = await new Promise(r => cv.toBlob(r, "image/jpeg", .9));
    if (!blob) throw new Error("image illisible");
    img = await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
  }
  const L = 595.28, h = Math.max(120, Math.min(3000, L * img.height / img.width));
  doc.addPage([L, h]).drawImage(img, {x: 0, y: 0, width: L, height: h});
  return new Uint8Array(await doc.save());
}
/* un texte → une ou plusieurs pages avec des zones de texte */
function pagesTexte(texte) {
  const pages = [], bloc = {s: 28, w: 920}, max = PAGE_H - 120;
  let cur = [], haut = 0;
  const vider = () => { if (cur.length) pages.push({id: newId(), f: "blanc", h: PAGE_H, traits: [], textes: [{id: newId(), x: 40, y: 50, w: bloc.w, t: cur.join("\n"), c: "", s: bloc.s}]}); cur = []; haut = 0; };
  for (const ligne of String(texte).replace(/\r\n?/g, "\n").split("\n")) {
    const h = hauteurTexte({t: ligne || " ", s: bloc.s, w: bloc.w});
    if (haut + h > max && cur.length) vider();
    cur.push(ligne); haut += h;
  }
  vider();
  return pages.length ? pages : [{id: newId(), f: "blanc", h: PAGE_H, traits: [], textes: []}];
}
async function lireDocument(f) {
  try { return new Uint8Array(await f.arrayBuffer()); }
  catch (e) { throw new Error("lecture impossible (permission refusée ou fichier déplacé)"); }
}
/* importe des documents (plusieurs à la fois) : cible = {dossier: id} → nouveaux documents dans ce dossier ; cible = {note: n} → pages ajoutées à ce fichier */
function messageErreurImport(e) {
  const m = String(e && e.message || e);
  if (/Invalid PDF|Missing PDF|InvalidPDF|PDF header|XRef|Unexpected server response/i.test(m) || (e && e.name === "InvalidPDFException")) return "fichier PDF illisible ou abîmé.";
  if (/password/i.test(m)) return "PDF protégé par un mot de passe.";
  if (/decode|image/i.test(m)) return "image illisible.";
  return m;
}
async function importerDocuments(app, fichiers, progres, cible) {
  cible = cible || {};
  const bilan = {notes: 0, pages: 0, erreurs: []};
  const liste = Array.from(fichiers);
  for (let i = 0; i < liste.length; i++) {
    const f = liste[i], nom = nomPropre(f.name);
    if (progres) progres(i, liste.length, nom);
    try {
      if (f.size > TAILLE_MAX_IMPORT) { bilan.erreurs.push(`${nom} : trop lourd (${moTexte(f.size)}, maximum ${moTexte(TAILLE_MAX_IMPORT)}).`); continue; }
      const u8 = await lireDocument(f);
      const genre = genreDocument(nom, u8);
      if (!genre) { bilan.erreurs.push(messageFormat(nom)); continue; }
      const titre = nom.replace(/\.[^.]+$/, "");
      if (genre === "texte") {
        const texte = new TextDecoder("utf-8").decode(u8).replace(/^\uFEFF/, "");
        if (cible.note) {
          if (cible.note.type === "cahier") { const pg = pagesTexte(texte); cible.note.pages.push(...pg); bilan.pages += pg.length; }
          else cible.note.texte = ((cible.note.texte || "") + (cible.note.texte ? "\n\n" : "") + texte).slice(0, 2e6);
          cible.note.maj = nowIsoMinutes();
        } else {
          app.donnees.notes.unshift(normaliserNote({id: newId(), type: "texte", titre, texte: texte.slice(0, 2e6), dossier: cible.dossier || "", maj: nowIsoMinutes()}));
          bilan.notes++;
        }
        continue;
      }
      if (cible.note && cible.note.type !== "cahier") { bilan.erreurs.push(`${nom} : ce document est une note texte (importe un fichier TXT, ou crée un cahier).`); continue; }
      const pdf = genre === "image" ? await imageEnPdf(u8) : u8;
      if (pdf.length > TAILLE_MAX_IMPORT) { bilan.erreurs.push(`${nom} : trop lourd après conversion (${moTexte(pdf.length)}, maximum ${moTexte(TAILLE_MAX_IMPORT)}).`); continue; }
      if (cible.note) {
        const {id, tailles} = await preparerPdf(app, pdf, nom);
        const pg = pagesPdf(id, tailles); cible.note.pages.push(...pg); cible.note.maj = nowIsoMinutes(); bilan.pages += pg.length;
      } else {
        await importerPdf(app, pdf, genre === "image" ? titre + ".pdf" : nom, cible.dossier || "", "");
        bilan.notes++;
      }
    } catch (e) { bilan.erreurs.push(`${nom} : ${messageErreurImport(e)}`); Stock.journal("import " + nom, e); }
  }
  if (progres) progres(liste.length, liste.length, "");
  app.sauver();
  Fichiers.relancer();
  return bilan;
}

/* fichiers choisis (.pdf, .zip GoodNotes, .json de modèles) */
async function importerFichiers(app, fichiers, progres, cible) {
  cible = cible || {};
  const d = app.donnees, bilan = {notes: 0, modeles: 0, erreurs: []};
  const taches = [];
  for (const f of fichiers) {
    const nom = nomPropre(f.name);
    let u8;
    try { u8 = await lireDocument(f); } catch (e) { bilan.erreurs.push(nom + " : " + e.message); continue; }
    if (!/\.(zip|json)$/i.test(nom) && u8.length > TAILLE_MAX_IMPORT) { bilan.erreurs.push(`${nom} : trop lourd (${moTexte(u8.length)}, maximum ${moTexte(TAILLE_MAX_IMPORT)}).`); continue; }
    if (/\.zip$/i.test(nom)) {
      const ents = await lireZip(u8);
      let couleurs = {};
      const meta = ents.find(e => e.nom.endsWith(".goodnotesmeta"));
      if (meta) { try { for (const it of JSON.parse(new TextDecoder().decode(await meta.lire())).items || []) couleurs[nomPropre(it.path)] = couleurGoodNotes(it.color); } catch (e) { /* */ } }
      const pdfs = ents.filter(e => /\.(pdf|goodnotes)$/i.test(e.nom) && !e.nom.split("/").some(x => x.startsWith("__MACOSX") || x.startsWith(".")));
      for (const e of pdfs) {
        const parts = e.nom.split("/"), fichier = parts.pop();
        // « Session 1/Éthique/Cours 3/x.pdf » → dossier « Éthique › Cours 3 » ; fichiers à la racine → « Session 1 »
        const sous = parts.length > 1 ? parts.slice(1) : parts;
        const nomDossier = sous.join(" › ") || nom.replace(/\.zip$/i, "");
        let coul = "";
        for (let i = parts.length; i > 0 && !coul; i--) { const c = couleurs[parts.slice(0, i).join("/")]; if (c && c !== COULEURS_GN.blue) coul = c; }
        coul = coul || couleurs[parts.join("/")] || "";
        taches.push({nom: fichier, lire: e.lire, dossier: nomDossier, couleur: coul, gn: /\.goodnotes$/i.test(fichier)});
      }
    } else if (/\.pdf$/i.test(nom)) {
      taches.push({nom, lire: async () => u8, dossier: "", couleur: ""});
    } else if (/\.(jpe?g|png|txt)$/i.test(nom)) {
      const r = await importerDocuments(app, [f], null, cible);
      bilan.notes += r.notes; bilan.erreurs.push(...r.erreurs);
    } else if (/\.goodnotes$/i.test(nom)) {
      taches.push({nom, lire: async () => u8, dossier: "", couleur: "", gn: true});
    } else if (/\.json$/i.test(nom)) {
      try { bilan.modeles += importerModeles(app, JSON.parse(new TextDecoder().decode(u8))); } catch (e) { bilan.erreurs.push(nom + " : " + e.message); }
    } else bilan.erreurs.push(messageFormat(nom));
  }
  for (let i = 0; i < taches.length; i++) {
    const t = taches[i];
    if (progres) progres(i, taches.length, t.nom);
    try {
      const brut = await t.lire();
      if (brut.length > TAILLE_MAX_IMPORT) throw new Error(`trop lourd (${moTexte(brut.length)}, maximum ${moTexte(TAILLE_MAX_IMPORT)})`);
      const n = t.gn ? await importerGoodnotes(app, brut, t.nom) : await importerPdf(app, brut, t.nom, cible.dossier || "", "");
      if (t.dossier) n.dossier = dossierNomme(d, t.dossier, t.couleur);
      bilan.notes++;
    } catch (e) { bilan.erreurs.push(t.nom + " : " + messageErreurImport(e)); }
  }
  if (progres) progres(taches.length, taches.length, "");
  app.sauver();
  Fichiers.relancer();
  return bilan;
}

/* modèles de pages : fichier .json « horaire-modeles » */
function importerModeles(app, j) {
  let l = [];
  if (j && Array.isArray(j.modeles)) l = j.modeles;
  else if (Array.isArray(j)) l = j;
  else if (j && (j.traits || j.f)) l = [j];
  else throw new Error("ce fichier ne contient pas de modèle de page");
  const nv = normaliserModeles(l.map(m => Object.assign({}, m, {id: newId()})));
  app.donnees.modeles = (app.donnees.modeles || []).concat(nv);
  app.sauver();
  return nv.length;
}
function fichierModeles(modeles) {
  const j = {type: "horaire-modeles", version: 1, modeles: modeles.map(m => ({nom: m.nom, f: m.f, h: m.h, traits: m.traits, textes: m.textes}))};
  return new Blob([JSON.stringify(j)], {type: "application/json"});
}
