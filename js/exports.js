/* Exports des notes : PDF (vectoriel, même rendu que le PC), PNG, Markdown (.md) et texte (.txt).
   Les pages issues d'un PDF importé gardent le PDF d'origine en fond (assemblé avec pdf-lib). */
"use strict";

const A4_L = 595.28, ECH_PDF = A4_L / PAGE_L;
const CP1252 = {"€": 128, "‚": 130, "ƒ": 131, "„": 132, "…": 133, "†": 134, "‡": 135, "ˆ": 136, "‰": 137, "Š": 138, "‹": 139, "Œ": 140, "Ž": 142,
  "‘": 145, "’": 146, "“": 147, "”": 148, "•": 149, "–": 150, "—": 151, "˜": 152, "™": 153, "š": 154, "›": 155, "œ": 156, "ž": 158, "Ÿ": 159};

function pdfChaine(str) {
  let o = "";
  for (const ch of String(str || "")) {
    let c = ch.codePointAt(0);
    if (c === 9) c = 32;
    if (c < 32) continue;
    if (c >= 128 && !(c >= 160 && c <= 255)) c = CP1252[ch] || 63;
    if (c === 40 || c === 41 || c === 92) o += "\\" + String.fromCharCode(c);
    else if (c < 128) o += String.fromCharCode(c);
    else o += "\\" + c.toString(8).padStart(3, "0");
  }
  return o;
}
function f2(v) { return (Math.round(v * 100) / 100).toString(); }
function rgbPdf(hex) { const [r, g, b] = rgb(estHex(hex) ? hex : "#000000"); return `${f2(r / 255)} ${f2(g / 255)} ${f2(b / 255)}`; }

/* découpe d'un texte en lignes (largeur estimée : 0,5 × taille par caractère, comme hauteurTexte) */
function lignesEstimees(t, taille, largeur) {
  const out = [], max = Math.max(1, Math.floor(largeur / (taille * .5)));
  for (const par of String(t || "").split("\n")) {
    let cur = "";
    for (const mot of par.split(" ")) {
      const essai = cur ? cur + " " + mot : mot;
      if (essai.length > max && cur) { out.push(cur); cur = mot; } else cur = essai;
    }
    out.push(cur);
  }
  return out;
}
function cerclePdf(cx, cy, r) {
  const c = r * .5523;
  return `${f2(cx + r)} ${f2(cy)} m ${f2(cx + r)} ${f2(cy + c)} ${f2(cx + c)} ${f2(cy + r)} ${f2(cx)} ${f2(cy + r)} c ${f2(cx - c)} ${f2(cy + r)} ${f2(cx - r)} ${f2(cy + c)} ${f2(cx - r)} ${f2(cy)} c ` +
    `${f2(cx - r)} ${f2(cy - c)} ${f2(cx - c)} ${f2(cy - r)} ${f2(cx)} ${f2(cy - r)} c ${f2(cx + c)} ${f2(cy - r)} ${f2(cx + r)} ${f2(cy - c)} ${f2(cx + r)} ${f2(cy)} c f`;
}

/* contenu PDF d'une page de cahier (fond, surligneur, encre, textes) */
function opsPage(page, pc) {
  const H = page.h * ECH_PDF, X = x => f2(x * ECH_PDF), Y = y => f2(H - y * ECH_PDF), o = [];
  const pdfFond = page.f === "pdf" && page.pdf;
  if (!pdfFond) {
    o.push(`${rgbPdf(pc.fond)} rg 0 0 ${f2(A4_L)} ${f2(H)} re f`);
    o.push(`${f2(1.4 * ECH_PDF)} w 0 J`);
    const ligne = (x0, y0, x1, y1, c) => o.push(`${rgbPdf(c || pc.ligne)} RG ${X(x0)} ${Y(y0)} m ${X(x1)} ${Y(y1)} l S`);
    const f = page.f || "ligne";
    if (f === "ligne") {
      for (let y = 130; y < page.h - 30; y += 52) ligne(40, y, PAGE_L - 40, y);
      ligne(110, 0, 110, page.h, pc.marge);
    } else if (f === "carreau") {
      for (let y = 40; y < page.h; y += 40) ligne(0, y, PAGE_L, y);
      for (let x = 40; x < PAGE_L; x += 40) ligne(x, 0, x, page.h);
    } else if (f === "points") {
      o.push(`${rgbPdf(pc.ligne)} rg`);
      for (let y = 40; y < page.h; y += 40) for (let x = 40; x < PAGE_L; x += 40) o.push(cerclePdf(x * ECH_PDF, H - y * ECH_PDF, 2.2 * ECH_PDF));
    } else if (f === "cornell") {
      ligne(0, 150, PAGE_L, 150, pc.marge);
      ligne(290, 150, 290, page.h - 280, pc.marge);
      ligne(0, page.h - 280, PAGE_L, page.h - 280, pc.marge);
      for (let y = 202; y < page.h - 290; y += 52) ligne(300, y, PAGE_L - 30, y);
      o.push(`BT /F1 ${f2(22 * ECH_PDF)} Tf ${rgbPdf(pc.marge)} rg ${X(24)} ${Y(186)} Td (${pdfChaine("Questions / mots-clés")}) Tj ET`);
      o.push(`BT /F1 ${f2(22 * ECH_PDF)} Tf ${rgbPdf(pc.marge)} rg ${X(24)} ${Y(page.h - 246)} Td (${pdfChaine("Résumé")}) Tj ET`);
    }
  }
  const clair = pdfFond || papierClair(pc), encre = pdfFond ? "#1b1f24" : pc.encre;
  const traits = page.traits || [];
  for (const passe of [1, 0]) {
    for (const tr of traits) {
      if (!!tr.o !== !!passe) continue;
      const p = tr.p || [];
      if (!p.length) continue;
      const col = rgbPdf(estHex(tr.c) ? tr.c : encre), e = tr.e || 3, fixe = tr.o || tr.k === "b" || tr.k === "f";
      o.push("q 1 J 1 j" + (tr.o ? (clair ? " /GM gs" : " /GN gs") : ""));
      o.push(`${col} RG ${col} rg`);
      if (p.length <= 3) {
        o.push(cerclePdf(p[0] * ECH_PDF, H - p[1] * ECH_PDF, Math.max(.5, e * (fixe ? .5 : (.35 + (p[2] ?? 50) / 110) / 2)) * ECH_PDF));
      } else if (fixe) {
        let s = `${f2(e * ECH_PDF)} w ${X(p[0])} ${Y(p[1])} m`;
        for (let i = 3; i < p.length; i += 3) s += ` ${X(p[i])} ${Y(p[i + 1])} l`;
        o.push(s + " S");
      } else {
        let lw = -1, s = "";
        for (let i = 3; i < p.length; i += 3) {
          const w = Math.round(Math.max(.4, e * (.35 + (p[i - 1] + p[i + 2]) / 220) * ECH_PDF) * 20) / 20;
          if (w !== lw) { if (s) o.push(s + " S"); s = `${f2(w)} w ${X(p[i - 3])} ${Y(p[i - 2])} m`; lw = w; }
          s += ` ${X(p[i])} ${Y(p[i + 1])} l`;
        }
        if (s) o.push(s + " S");
      }
      o.push("Q");
    }
  }
  for (const tx of page.textes || []) {
    const s = tx.s || 28;
    lignesEstimees(tx.t, s, tx.w || 420).forEach((l, i) => {
      if (l) o.push(`BT /F1 ${f2(s * ECH_PDF)} Tf ${rgbPdf(estHex(tx.c) ? tx.c : encre)} rg ${X(tx.x)} ${Y(tx.y + i * s * 1.3 + s * .78)} Td (${pdfChaine(l)}) Tj ET`);
    });
  }
  return o.join("\n");
}

/* assemblage d'un fichier PDF à partir de pages {w, h, ops} */
function assemblerPdf(pages) {
  const objs = [];
  const kids = pages.map((_, i) => `${7 + i * 2} 0 R`).join(" ");
  objs.push("<< /Type /Catalog /Pages 2 0 R >>");
  objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Type /ExtGState /CA 0.38 /ca 0.38 /BM /Multiply >>");
  objs.push("<< /Type /ExtGState /CA 0.42 /ca 0.42 >>");
  pages.forEach((p, i) => {
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f2(p.w)} ${f2(p.h)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << /GM 5 0 R /GN 6 0 R >> >> /Contents ${8 + i * 2} 0 R >>`);
    objs.push(`<< /Length ${p.ops.length} >>\nstream\n${p.ops}\nendstream`);
  });
  let s = "%PDF-1.4\n";
  const offs = [];
  objs.forEach((o, i) => { offs.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(v => String(v).padStart(10, "0") + " 00000 n \n").join("");
  s += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
  return u;
}

let _pdfLib = null;
function pdfLib() {
  if (!_pdfLib) _pdfLib = new Promise((ok, ko) => {
    if (window.PDFLib) return ok(window.PDFLib);
    const sc = document.createElement("script");
    sc.src = "js/vendor/pdf-lib.min.js";
    sc.onload = () => ok(window.PDFLib); sc.onerror = () => { _pdfLib = null; ko(new Error("Module PDF introuvable (connexion ?)")); };
    document.head.append(sc);
  });
  return _pdfLib;
}

/* PDF d'un cahier ; les pages PDF importées gardent l'original dessous */
async function pdfCahier(n, pages) {
  const pc = couleursPapier(n.papier);
  const brut = assemblerPdf(pages.map(p => ({w: A4_L, h: p.h * ECH_PDF, ops: opsPage(p, pc)})));
  if (!pages.some(p => p.f === "pdf" && p.pdf)) return brut;
  const L = await pdfLib();
  const out = await L.PDFDocument.create(), notes = await L.PDFDocument.load(brut), sources = new Map();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i], w = A4_L, h = p.h * ECH_PDF, np = out.addPage([w, h]);
    if (p.f === "pdf" && p.pdf) {
      if (!sources.has(p.pdf[0])) sources.set(p.pdf[0], await L.PDFDocument.load(await Fichiers.obtenir(p.pdf[0]), {ignoreEncryption: true}));
      const [fond] = await out.embedPdf(sources.get(p.pdf[0]), [p.pdf[1]]);
      np.drawPage(fond, {x: 0, y: 0, width: w, height: h});
    }
    const [ann] = await out.embedPdf(notes, [i]);
    np.drawPage(ann, {x: 0, y: 0, width: w, height: h});
  }
  return await out.save();
}

/* PDF d'une note texte (A4, marges de 2 cm) */
function pdfNoteTexte(n) {
  const H = 841.89, M = 56, larg = A4_L - 2 * M, pages = [];
  let ops = [], y = H - M;
  const nouvelle = () => { pages.push({w: A4_L, h: H, ops: ops.join("\n")}); ops = []; y = H - M; };
  const ligne = (t, taille, gras, couleur) => {
    if (y - taille < M) nouvelle();
    y -= taille * 1.25;
    if (t) ops.push(`BT /${gras ? "F2" : "F1"} ${taille} Tf ${couleur || "0.1 0.1 0.12"} rg ${M} ${f2(y)} Td (${pdfChaine(t)}) Tj ET`);
  };
  for (const l of lignesEstimees(n.titre || "Sans titre", 18 * 1.04, larg)) ligne(l, 18, true);
  ligne((n.maj || "").replace("T", " "), 9, false, "0.45 0.47 0.5");
  y -= 8;
  for (const l of lignesEstimees(n.texte || "", 11 * 1.04, larg)) ligne(l, 11, false);
  nouvelle();
  return assemblerPdf(pages);
}

/* Markdown et texte */
function nomFichierSur(t) { return String(t || "").replace(/[\\/:*?"<>|\n\r\t]+/g, "-").replace(/^[\s.-]+|[\s.]+$/g, "").slice(0, 80) || "Note"; }
function texteNote(n, md) {
  const titre = n.titre || "Sans titre", L = [];
  L.push(md ? "# " + titre : titre, ...(md ? [] : ["=".repeat(Math.min(60, titre.length))]), "");
  if ((n.texte || "").trim()) L.push(n.texte.trim(), "");
  if (n.type === "cahier") {
    const fichiers = (window.app && app.donnees.fichiers) || [];
    n.pages.forEach((p, i) => {
      L.push(md ? `## Page ${i + 1}` : `Page ${i + 1}`, ...(md ? [] : ["-".repeat(String(i + 1).length + 5)]), "");
      const tx = (p.textes || []).filter(t => (t.t || "").trim()).sort((a, b) => a.y - b.y || a.x - b.x);
      for (const t of tx) L.push(t.t.trim(), "");
      let rem = "";
      if (p.pdf) { const f = fichiers.find(x => x.id === p.pdf[0]); rem = `Page ${p.pdf[1] + 1} du PDF « ${f ? f.nom : "document"} »${(p.traits || []).length ? ", avec des annotations à la main" : ""} : voir l'export PDF.`; }
      else if ((p.traits || []).length) rem = "Écriture à la main ou dessin : voir l'export PDF.";
      else if (!tx.length) rem = "Page vide";
      if (rem) L.push(md ? `_(${rem})_` : `(${rem})`, "");
    });
  }
  return L.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/* PNG d'une page de cahier */
async function pngPage(page, papier, largeur) {
  if (page.f === "pdf" && page.pdf) await Rendu.rendreMaintenant(page.pdf[0], page.pdf[1], largeur);
  const k = largeur / PAGE_L, cv = document.createElement("canvas");
  cv.width = largeur; cv.height = Math.round(page.h * k);
  dessinerPage(cv.getContext("2d"), page, k, couleursPapier(papier));
  return await new Promise(ok => cv.toBlob(ok, "image/png"));
}

/* fichiers à livrer : [{nom, blob}] */
async function construireExport(n, format, pages) {
  const base = nomFichierSur(n.titre);
  if (format === "md") return [{nom: base + ".md", blob: new Blob([texteNote(n, true)], {type: "text/markdown"})}];
  if (format === "txt") return [{nom: base + ".txt", blob: new Blob([texteNote(n, false)], {type: "text/plain"})}];
  if (format === "pdf") return [{nom: base + ".pdf", blob: new Blob([n.type === "cahier" ? await pdfCahier(n, pages) : pdfNoteTexte(n)], {type: "application/pdf"})}];
  const out = [];
  for (let i = 0; i < pages.length; i++) out.push({nom: pages.length > 1 ? `${base} - p${n.pages.indexOf(pages[i]) + 1}.png` : base + ".png", blob: await pngPage(pages[i], n.papier, 1600)});
  return out;
}

/* partage (feuille de partage de l'iPad : Fichiers, AirDrop, Mail…) ou téléchargement */
async function livrer(fichiers) {
  const files = fichiers.map(f => new File([f.blob], f.nom, {type: f.blob.type || "application/octet-stream"}));
  if (navigator.canShare && navigator.share) {
    try { if (navigator.canShare({files})) { await navigator.share({files}); return "partage"; } } catch (e) { if (e && e.name === "AbortError") return "annule"; }
  }
  for (const f of files) {
    const u = URL.createObjectURL(f), a = el("a", {href: u, download: f.name});
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  }
  return "telecharge";
}
function tailleLisible(o) { return o > 1048576 ? (o / 1048576).toFixed(1).replace(".", ",") + " Mo" : Math.max(1, Math.round(o / 1024)) + " Ko"; }

class ExportNote extends Modal {
  constructor(n, pageCourante) {
    super("Exporter", n.titre || "Sans titre");
    this.n = n; this.page = pageCourante; this.format = "pdf"; this.toutes = true; this.fichiers = null;
    this.zone = el("div"); this.carte.append(this.zone);
    this.dessiner();
  }
  dessiner() {
    const z = this.zone; z.innerHTML = "";
    const cahier = this.n.type === "cahier";
    const formats = [["pdf", "PDF"], ...(cahier ? [["png", "Image PNG"]] : []), ["md", "Markdown (.md)"], ["txt", "Texte (.txt)"]];
    const f = el("div.rapides");
    for (const [v, t] of formats) f.append(petit(t, () => { this.format = v; this.dessiner(); }, this.format === v ? "tab_on" : "ghost"));
    z.append(etiquette("Format"), f);
    if (cahier && (this.format === "pdf" || this.format === "png")) {
      const p = el("div.rapides");
      p.append(petit(`Toutes les pages (${this.n.pages.length})`, () => { this.toutes = true; this.dessiner(); }, this.toutes ? "tab_on" : "ghost"),
        petit("Page actuelle", () => { this.toutes = false; this.dessiner(); }, this.toutes ? "ghost" : "tab_on"));
      z.append(etiquette("Pages"), p);
    }
    const aide = {pdf: "Garde l'écriture à la main en vectoriel, et les PDF importés en fond.", png: "Une image par page (1600 px de large).",
      md: "Le texte tapé, page par page (l'écriture à la main n'est pas convertie en texte).", txt: "Le texte tapé, sans mise en forme."}[this.format];
    z.append(el("p.petit.muted", {texte: aide}));
    this.etat = el("div.petit.muted");
    z.append(this.etat, el("div.barre-actions", null, el("div.g"), el("div.d", null, bouton("Annuler", () => this.fermer()), bouton("Exporter", () => this.valider(), "primary"))));
  }
  async valider() {
    if (this.occupe) return;
    this.occupe = true;
    this.etat.textContent = "Préparation…";
    try {
      const pages = this.n.type === "cahier" ? (this.toutes ? this.n.pages : [this.page || this.n.pages[0]]) : [];
      this.fichiers = await construireExport(this.n, this.format, pages);
    } catch (e) { this.occupe = false; this.etat.textContent = "Erreur : " + (e && e.message || e); return; }
    this.occupe = false;
    const z = this.zone; z.innerHTML = "";
    const tot = this.fichiers.reduce((a, f) => a + f.blob.size, 0);
    z.append(el("p", {texte: this.fichiers.length > 1 ? `${this.fichiers.length} fichiers prêts (${tailleLisible(tot)}).` : `« ${this.fichiers[0].nom} » est prêt (${tailleLisible(tot)}).`}),
      el("p.petit.muted", {texte: "Choisis « Enregistrer dans Fichiers », AirDrop, Mail… dans la feuille de partage."}),
      el("div.barre-actions", null, el("div.g"), el("div.d", null, bouton("Fermer", () => this.fermer()),
        bouton("Partager / Enregistrer", async () => { const r = await livrer(this.fichiers); if (r !== "annule") this.fermer(); }, "primary"))));
  }
}
