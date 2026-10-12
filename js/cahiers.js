/* Notes façon GoodNotes : bibliothèque (dossiers, favoris), cahiers à pages, outils d'écriture à l'Apple Pencil. */
"use strict";

/* ---------- papier et encre */
const PAPIER_COUL = {
  blanc: {fond: "#ffffff", ligne: "#d6dce6", marge: "#f2b8c0", encre: "#1d2433"},
  creme: {fond: "#fbf6e9", ligne: "#e2d6bb", marge: "#efb7a6", encre: "#2b2118"},
  sombre: {fond: "#1b1f27", ligne: "#2f3644", marge: "#5a2f3a", encre: "#e8eef8"},
};
function papierClair(pc) { const [r, g, b] = rgb(pc.fond); return 0.299 * r + 0.587 * g + 0.114 * b > 140; }
function couleursPapier(nom) {
  if (PAPIER_COUL[nom]) return PAPIER_COUL[nom];
  const fond = T.SOMBRE ? T.SURFACE2 : "#fffefb";
  return {fond, ligne: mix(fond, T.SOMBRE ? .16 : .13, T.INK), marge: mix(fond, .3, T.DANGER), encre: T.INK};
}
const ENCRES = ["", "#1f6feb", "#e5484d", "#2f9e44", "#f08c00", "#9c36b5", "#0c8599", "#fab005"];
const OUTILS_NOTES = [["plume", "Plume", "plume"], ["bille", "Stylo bille", "stylo"], ["surligneur", "Surligneur", "surligneur"],
  ["gomme", "Gomme", "gomme"], ["lasso", "Lasso", "lasso"], ["forme", "Formes", "forme"], ["texte", "Texte", "texte"]];
const EPAISSEURS = {plume: [1.6, 3, 5.5], bille: [1.4, 2.4, 4], surligneur: [12, 20, 30], forme: [1.6, 3, 5], gomme: [10, 22, 44]};

/* fond d'une page (coordonnées page : 1000 × h) */
function dessinerFond(ctx, page, k, pc) {
  const L = PAGE_L * k, H = page.h * k;
  if (page.f === "pdf" && page.pdf) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, L, H);
    const t = ctx.getTransform ? ctx.getTransform().a : 1;
    const img = Rendu.image(page.pdf[0], page.pdf[1], L * t);
    if (img) ctx.drawImage(img, 0, 0, L, H);
    else {
      ctx.fillStyle = "#8a94a6"; ctx.font = `${Math.max(9, Math.round(24 * k))}px sans-serif`; ctx.textAlign = "center";
      ctx.fillText(Rendu.erreur(page.pdf[0]) ? "PDF indisponible" : "Chargement du PDF…", L / 2, H / 2); ctx.textAlign = "start";
    }
    return;
  }
  ctx.fillStyle = pc.fond; ctx.fillRect(0, 0, L, H);
  ctx.lineWidth = Math.max(1, k * 1.4);
  const ligne = (x0, y0, x1, y1, c) => { ctx.strokeStyle = c || pc.ligne; ctx.beginPath(); ctx.moveTo(x0 * k, y0 * k); ctx.lineTo(x1 * k, y1 * k); ctx.stroke(); };
  const f = page.f || "ligne";
  if (f === "ligne") {
    for (let y = 130; y < page.h - 30; y += 52) ligne(40, y, PAGE_L - 40, y);
    ligne(110, 0, 110, page.h, pc.marge);
  } else if (f === "carreau") {
    for (let y = 40; y < page.h; y += 40) ligne(0, y, PAGE_L, y);
    for (let x = 40; x < PAGE_L; x += 40) ligne(x, 0, x, page.h);
  } else if (f === "points") {
    ctx.fillStyle = pc.ligne;
    const r = Math.max(1, 2.2 * k);
    for (let y = 40; y < page.h; y += 40) for (let x = 40; x < PAGE_L; x += 40) { ctx.beginPath(); ctx.arc(x * k, y * k, r, 0, 7); ctx.fill(); }
  } else if (f === "cornell") {
    ligne(0, 150, PAGE_L, 150, pc.marge);
    ligne(290, 150, 290, page.h - 280, pc.marge);
    ligne(0, page.h - 280, PAGE_L, page.h - 280, pc.marge);
    for (let y = 202; y < page.h - 290; y += 52) ligne(300, y, PAGE_L - 30, y);
    ctx.fillStyle = pc.marge; ctx.font = `${Math.round(22 * k)}px ${getComputedStyle(document.documentElement).getPropertyValue("--f-corps")}`;
    ctx.fillText("Questions / mots-clés", 24 * k, 186 * k); ctx.fillText("Résumé", 24 * k, (page.h - 246) * k);
  }
}
/* un trait : plume (pression), bille / forme (largeur fixe), surligneur (transparent) */
function tracer(ctx, tr, k, encre, clair) {
  const p = tr.p || [];
  if (!p.length) return;
  let col = estHex(tr.c) ? tr.c : encre;
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (tr.o) { ctx.globalAlpha = clair ? .38 : .42; if (clair) ctx.globalCompositeOperation = "multiply"; }
  const ep = (tr.e || 3) * k;
  const fixe = tr.o || tr.k === "b" || tr.k === "f";
  if (p.length <= 3) {
    ctx.beginPath(); ctx.arc(p[0] * k, p[1] * k, Math.max(.7, ep * (fixe ? .5 : (.35 + (p[2] ?? 50) / 110) / 2)), 0, 7); ctx.fill();
  } else if (fixe) {
    ctx.lineWidth = ep;
    ctx.beginPath(); ctx.moveTo(p[0] * k, p[1] * k);
    for (let i = 3; i < p.length; i += 3) ctx.lineTo(p[i] * k, p[i + 1] * k);
    ctx.stroke();
  } else {
    for (let i = 3; i < p.length; i += 3) {
      ctx.lineWidth = Math.max(.8, ep * (.35 + (p[i - 1] + p[i + 2]) / 220));
      ctx.beginPath(); ctx.moveTo(p[i - 3] * k, p[i - 2] * k); ctx.lineTo(p[i] * k, p[i + 1] * k); ctx.stroke();
    }
  }
  ctx.restore();
}
function lignesTexte(ctx, t, larg) {
  const out = [];
  for (const par of String(t || "").split("\n")) {
    let cur = "";
    for (const mot of par.split(" ")) {
      const essai = cur ? cur + " " + mot : mot;
      if (ctx.measureText(essai).width > larg && cur) { out.push(cur); cur = mot; } else cur = essai;
    }
    out.push(cur);
  }
  return out;
}
function dessinerTexte(ctx, tx, k, encre) {
  const s = (tx.s || 28) * k;
  ctx.save();
  ctx.fillStyle = estHex(tx.c) ? tx.c : encre;
  ctx.font = `${Math.round(s)}px ${getComputedStyle(document.documentElement).getPropertyValue("--f-corps")}`;
  ctx.textBaseline = "top";
  lignesTexte(ctx, tx.t, (tx.w || 420) * k).forEach((l, i) => ctx.fillText(l, tx.x * k, tx.y * k + i * s * 1.3));
  ctx.restore();
}
function hauteurTexte(tx) { const n = String(tx.t || "").split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length * (tx.s || 28) * .5 / (tx.w || 420))), 0); return n * (tx.s || 28) * 1.3; }
function dessinerPage(ctx, page, k, pc, sel) {
  dessinerFond(ctx, page, k, pc);
  const surPdf = page.f === "pdf" && page.pdf, clair = surPdf || papierClair(pc), encre = surPdf ? "#1b1f24" : pc.encre;
  for (const tr of page.traits) tracer(ctx, tr, k, encre, clair);
  for (const tx of page.textes || []) dessinerTexte(ctx, tx, k, encre);
  if (sel) {
    const b = sel.boite;
    ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = T.ACCENT; ctx.lineWidth = 2;
    ctx.strokeRect(b[0] * k - 6, b[1] * k - 6, (b[2] - b[0]) * k + 12, (b[3] - b[1]) * k + 12); ctx.restore();
  }
}
/* miniature d'une page (image) */
function canvasPage(page, papier, largeur) {
  const k = largeur / PAGE_L, cv = el("canvas.mini-page"), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(largeur * dpr); cv.height = Math.round(page.h * k * dpr);
  cv.style.width = largeur + "px"; cv.style.height = Math.round(page.h * k) + "px";
  const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
  dessinerPage(ctx, page, k, couleursPapier(papier));
  if (page.f === "pdf" && page.pdf) {
    const fin = Rendu.surPret((id, idx) => {
      if (!cv.isConnected && cv._vu) { fin(); return; }
      if (id !== page.pdf[0] || idx !== page.pdf[1]) return;
      fin(); ctx.clearRect(0, 0, largeur, page.h * k); dessinerPage(ctx, page, k, couleursPapier(papier));
    });
    requestAnimationFrame(() => { cv._vu = true; });
    setTimeout(fin, 120000);
  }
  return cv;
}

/* ---------- géométrie */
function boiteTrait(tr) {
  const p = tr.p; let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (let i = 0; i < p.length; i += 3) { a = Math.min(a, p[i]); b = Math.min(b, p[i + 1]); c = Math.max(c, p[i]); d = Math.max(d, p[i + 1]); }
  return [a, b, c, d];
}
function distSeg(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2)) : 0;
  return Math.hypot(px - x0 - t * dx, py - y0 - t * dy);
}
/* gribouillis pour effacer : allers-retours amples, dans un sens ou dans l'autre */
function allersRetours(vals, seuil) {
  let dir = 0, ext = vals[0], n = 0;
  for (const v of vals) {
    if (!dir) { if (Math.abs(v - ext) >= seuil) { dir = Math.sign(v - ext); ext = v; } continue; }
    if ((v - ext) * dir > 0) ext = v;
    else if ((ext - v) * dir >= seuil) { n++; dir = -dir; ext = v; }
  }
  return n;
}
function estGribouillis(pts) {
  if (pts.length / 3 < 8) return false;
  const xs = [], ys = [];
  for (let i = 0; i < pts.length; i += 3) { xs.push(pts[i]); ys.push(pts[i + 1]); }
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  if (Math.max(w, h) < 20 || Math.max(w, h) > 800) return false;
  if (allersRetours(xs, Math.max(10, .35 * w)) >= 3) return true;
  const rv = allersRetours(ys, Math.max(10, .45 * h));
  return rv >= 4 && w / (rv + 1) <= .6 * h;   // zigzag serré, pas une écriture ondulée
}
/* largeur réellement occupée par un texte tapé (pas toute la boîte) */
function largeurTexte(t) {
  const lignes = String(t.t || "").split("\n"), s = t.s || 28;
  return Math.min(t.w || 420, Math.max(20, ...lignes.map(l => l.length * s * .55)));
}
function croise(tr, scr) {
  const q = scr.p;
  for (let i = 0; i < q.length; i += 3) {
    if (touche(tr, q[i], q[i + 1], 4)) return true;
    if (i) {   // points intermédiaires : un geste rapide laisse de grands segments
      const dx = q[i] - q[i - 3], dy = q[i + 1] - q[i - 2], n = Math.floor(Math.hypot(dx, dy) / 4);
      for (let j = 1; j < n; j++) if (touche(tr, q[i - 3] + dx * j / n, q[i - 2] + dy * j / n, 4)) return true;
    }
  }
  return false;
}
function effacerSousGribouillis(page, scr) {
  const [x0, y0, x1, y1] = boiteTrait(scr), m = 12;
  let change = false;
  const gardes = page.traits.filter(tr => {
    if (tr === scr) return true;
    const q = tr.p, n = q.length / 3;
    let dedans = 0;
    for (let i = 0; i < q.length; i += 3) if (q[i] >= x0 - m && q[i] <= x1 + m && q[i + 1] >= y0 - m && q[i + 1] <= y1 + m) dedans++;
    if (n && dedans >= .5 * n && croise(tr, scr)) { change = true; return false; }
    return true;
  });
  const textes = (page.textes || []).filter(t => {
    const tw = largeurTexte(t), th = hauteurTexte(t);
    const ox = Math.max(0, Math.min(x1 + m, t.x + tw) - Math.max(x0 - m, t.x)), oy = Math.max(0, Math.min(y1 + m, t.y + th) - Math.max(y0 - m, t.y));
    if (ox * oy >= .4 * tw * th) { change = true; return false; }
    return true;
  });
  if (change) { page.traits = gardes; page.textes = textes; }
  return change;
}
function toucheTexte(tx, x, y, r) {
  const w = tx.w || 420, h = hauteurTexte(tx);
  const cx = Math.min(Math.max(x, tx.x), tx.x + w), cy = Math.min(Math.max(y, tx.y), tx.y + h);
  return Math.hypot(x - cx, y - cy) < r;
}
function touche(tr, x, y, r) {
  const p = tr.p, m = r + (tr.e || 3) / 2;
  if (p.length <= 3) return Math.hypot(p[0] - x, p[1] - y) < m;
  for (let i = 3; i < p.length; i += 3) if (distSeg(x, y, p[i - 3], p[i - 2], p[i], p[i + 1]) < m) return true;
  return false;
}
function dansPoly(x, y, poly) {
  let dedans = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}
/* reconnaissance de forme : ligne, rectangle, ellipse, triangle */
function reconnaitreForme(p) {
  const n = p.length / 3;
  if (n < 3) return null;
  const x0 = p[0], y0 = p[1], x1 = p[p.length - 3], y1 = p[p.length - 2];
  let [a, b, c, d] = boiteTrait({p});
  const diag = Math.hypot(c - a, d - b) || 1;
  // ligne : tous les points proches du segment début → fin
  let maxd = 0;
  for (let i = 0; i < p.length; i += 3) maxd = Math.max(maxd, distSeg(p[i], p[i + 1], x0, y0, x1, y1));
  if (maxd < Math.max(12, diag * .07) && Math.hypot(x1 - x0, y1 - y0) > 20) return [x0, y0, 50, x1, y1, 50];
  if (Math.hypot(x1 - x0, y1 - y0) > diag * .35) return null;     // pas fermée
  const cx = (a + c) / 2, cy = (b + d) / 2, rx = Math.max(1, (c - a) / 2), ry = Math.max(1, (d - b) / 2);
  let eEll = 0, eRect = 0;
  for (let i = 0; i < p.length; i += 3) {
    const u = (p[i] - cx) / rx, v = (p[i + 1] - cy) / ry;
    eEll += Math.abs(Math.hypot(u, v) - 1);
    eRect += Math.min(Math.abs(Math.abs(u) - 1), Math.abs(Math.abs(v) - 1));
  }
  const pts = [];
  if (eEll < eRect) {
    for (let i = 0; i <= 64; i++) { const t = i / 64 * Math.PI * 2; pts.push(cx + rx * Math.cos(t), cy + ry * Math.sin(t), 50); }
  } else pts.push(a, b, 50, c, b, 50, c, d, 50, a, d, 50, a, b, 50);
  return pts;
}

/* ---------- application « Notes » */
/* glisser-déposer (doigt, Apple Pencil, souris) : maintenir ~0,35 s (souris : glisser) puis lâcher sur un élément [data-depot] */
function glissable(elem, etiquette, deposer) {
  let minuterie = null, x0 = 0, y0 = 0, actif = false, fantome = null, cible = null, id = null;
  const placer = (x, y) => {
    fantome.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    const s = document.elementFromPoint(x, y), c = s && s.closest("[data-depot]");
    const n = c && c !== elem ? c : null;
    if (n !== cible) { if (cible) cible.classList.remove("depot-sur"); cible = n; if (cible) cible.classList.add("depot-sur"); }
  };
  const activer = (x, y) => {
    actif = true;
    fantome = el("div.fantome-glisse", {texte: etiquette()});
    document.body.append(fantome); document.body.classList.add("glisse-en-cours");
    try { elem.setPointerCapture(id); } catch (e) { /* */ }
    placer(x, y);
  };
  const nettoyer = () => {
    clearTimeout(minuterie); minuterie = null;
    if (fantome) fantome.remove();
    if (cible) cible.classList.remove("depot-sur");
    if (actif) { elem._glisse = true; setTimeout(() => { elem._glisse = false; }, 80); }
    document.body.classList.remove("glisse-en-cours");
    fantome = null; cible = null; actif = false; id = null;
  };
  elem.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    id = e.pointerId; x0 = e.clientX; y0 = e.clientY;
    if (e.pointerType !== "mouse") minuterie = setTimeout(() => { minuterie = null; activer(x0, y0); }, 350);
  });
  elem.addEventListener("pointermove", (e) => {
    if (e.pointerId !== id) return;
    if (actif) { placer(e.clientX, e.clientY); return; }
    const d = Math.hypot(e.clientX - x0, e.clientY - y0);
    if (e.pointerType === "mouse" && (e.buttons & 1) && d > 6) activer(e.clientX, e.clientY);
    else if (d > 10) { clearTimeout(minuterie); minuterie = null; }
  });
  elem.addEventListener("pointerup", (e) => {
    if (e.pointerId !== id) return;
    const c = actif && cible ? cible.dataset.depot : null;
    nettoyer();
    if (c) deposer(c);
  });
  elem.addEventListener("pointercancel", nettoyer);
  elem.addEventListener("touchmove", (e) => { if (actif) e.preventDefault(); }, {passive: false});
  elem.addEventListener("click", (e) => { if (elem._glisse) { e.stopPropagation(); e.preventDefault(); } }, true);
}

class PageNotes {
  constructor(app) {
    this.app = app;
    const r = Stock.lire("horaire_notes_ui", {});
    this.filtre = ""; this.q = ""; this.tri = r.tri || "maj"; this.vue = r.vue || "grille";
    this.doc = null;           // id du document ouvert
    this.sale = false;
    this.el = el("div.ecran.ecran-notes2");
    this.ed = null;
  }
  memoUI() { Stock.ecrire("horaire_notes_ui", {tri: this.tri, vue: this.vue}); }
  note(id) { return this.app.donnees.notes.find(n => n.id === (id || this.doc)) || null; }
  rafraichir() {
    if (this.doc && !this.note()) this.doc = null;
    if (this.doc) { if (this.ed) this.ed.rafraichirDistant(); else this.ouvrir(this.doc); return; }
    this.bibliotheque();
  }
  enregistrer() { if (this.ed) this.ed.enregistrer(); }

  /* ----- bibliothèque */
  bibliotheque() {
    this.ed = null; this.doc = null; this.sale = false;
    const z = this.el; z.innerHTML = "";
    z.classList.remove("doc-ouvert");
    const side = el("aside.carte.nt-carnets"), main = el("section.nb-main");
    z.append(side, main);
    this.cote(side);
    this.recherche = el("input.saisie.nt-recherche", {type: "search", placeholder: "Rechercher", value: this.q, autocomplete: "off",
      oninput: () => { this.q = this.recherche.value; this.grille(); }});
    const tri = liste([["maj", "Modifiés récemment"], ["titre", "Titre (A → Z)"], ["cree", "Création"]], this.tri);
    tri.classList.add("nb-tri");
    tri.addEventListener("change", () => { this.tri = tri.value; this.memoUI(); this.grille(); });
    const vue = boutonIcone(this.vue === "grille" ? "liste" : "grille", "", () => { this.vue = this.vue === "grille" ? "liste" : "grille"; this.memoUI(); this.bibliotheque(); }, "ghost");
    this.titreFiltre = el("h1.page-h1");
    main.append(el("header.nb-tete", null, this.titreFiltre, el("span.espace"),
      el("div.nt-recherche-zone.nb-rech", null, icone("recherche", 18), this.recherche), tri, vue,
      boutonIcone("exporter", "Importer", () => this.importer(), "ghost"),
      boutonIcone("plus", "Nouveau", () => new NouveauDocument(this).montrer(), "primary")));
    this.zoneDocs = el("div.nb-docs" + (this.vue === "liste" ? ".liste-docs" : ""));
    main.append(this.zoneDocs);
    this.grille();
  }
  /* ranger : un dossier dans un autre (ou à la racine), un document dans un dossier */
  deplacerDossier(d, cle) {
    const ds = this.app.donnees.dossiers || [], cible = cle && cle.startsWith("d:") ? ds.find(x => x.id === cle.slice(2)) : null;
    if (cle !== "racine" && !cible) return;
    if (cible && (cible.id === d.id || cible.nom.startsWith(d.nom + " › "))) { informer("Déplacement impossible", "Un dossier ne peut pas aller dans lui-même ni dans un de ses sous-dossiers."); return; }
    const base = d.nom.split(" › ").pop(), avant = cible ? cible.nom + " › " : "";
    let nv = avant + base, i = 2;
    while (ds.some(x => x.nom === nv && x.id !== d.id && !x.nom.startsWith(d.nom + " › "))) nv = avant + base + " (" + i++ + ")";
    if (nv === d.nom) return;
    const ancien = d.nom;
    for (const x of ds) if (x.nom === ancien || x.nom.startsWith(ancien + " › ")) x.nom = nv + x.nom.slice(ancien.length);
    this.app.sauver(); this.bibliotheque();
  }
  rangerNote(n, cle) {
    if (cle === "racine") n.dossier = ""; else if (cle && cle.startsWith("d:")) n.dossier = cle.slice(2); else return;
    this.app.sauver(); this.bibliotheque();
  }
  cote(c) {
    const notes = this.app.donnees.notes, dossiers = this.app.donnees.dossiers || [];
    const semaine = iso(ajouterJours(aujourdhui(), -7));
    const item = (cle, nom, nb, visuel) => c.append(el("button.nt-carnet" + (this.filtre === cle ? ".actif" : ""), {type: "button", onclick: () => { this.filtre = cle; this.bibliotheque(); }},
      visuel, el("span.nt-nom", {texte: nom}), el("span.mono.muted", {texte: String(nb)})));
    c.append(el("h2.nt-h", {texte: "Notes"}));
    c.append(el("div.etiquette", {texte: "BIBLIOTHÈQUE"}));
    item("", "Tous les documents", notes.length, icone("notes", 18));
    c.lastChild.dataset.depot = "racine";
    item("*", "Favoris", notes.filter(n => n.epingle).length, icone("etoile", 18));
    item("~", "Récents", notes.filter(n => (n.maj || "") >= semaine).length, icone("horloge", 18));
    c.append(el("div.nb-sous", null, el("div.etiquette", {texte: "DOSSIERS"}), el("button.nb-mini", {type: "button", title: "Nouveau dossier", onclick: () => new EditeurDossier(this, null).montrer()}, icone("plus", 16))));
    // « Éthique › Cours 3 » s'affiche « Cours 3 », en retrait sous « Éthique »
    for (const d of dossiers.slice().sort((x, y) => x.nom.localeCompare(y.nom, "fr"))) {
      const parts = d.nom.split(" › ");
      const b = el("button.nt-carnet" + (this.filtre === "d:" + d.id ? ".actif" : ""), {type: "button", title: d.nom, style: {paddingLeft: (parts.length > 1 ? 10 + 16 * (parts.length - 1) : 10) + "px"}, onclick: () => { this.filtre = "d:" + d.id; this.bibliotheque(); }},
        el("span.dossier-ico", {style: {"--c": d.couleur}}), el("span.nt-nom", {texte: parts[parts.length - 1]}), el("span.mono.muted", {texte: String(notes.filter(n => n.dossier === d.id).length)}));
      b.dataset.depot = "d:" + d.id;
      glissable(b, () => "📁 " + parts[parts.length - 1], (cle) => this.deplacerDossier(d, cle));
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!b._glisse && !document.body.classList.contains("glisse-en-cours")) new EditeurDossier(this, d).montrer(); });
      const mod = el("span.nb-mod", {title: "Modifier", onclick: (e) => { e.stopPropagation(); new EditeurDossier(this, d).montrer(); }}, icone("crayon", 14));
      b.append(mod);
      c.append(b);
    }
    if (!dossiers.length) c.append(el("div.petit.muted.nb-aide", {texte: "Range tes cahiers dans des dossiers (bouton +)."}));
    c.append(el("div.etiquette", {texte: "MATIÈRES"}));
    for (const [k, v] of Object.entries(CATS)) {
      const nb = notes.filter(n => n.cours === k).length;
      if (v[2] || nb) item("m:" + k, v[1], nb, T.REG_THEME === "minecraft" ? el("img.ico-pixel", {src: spriteURL(iconeCat(k), 2), style: {width: "16px", height: "16px"}}) : pastille(couleur(k), 10));
    }
  }
  filtrees() {
    const f = this.filtre, q = this.q.trim().toLowerCase(), semaine = iso(ajouterJours(aujourdhui(), -7));
    const out = this.app.donnees.notes.filter(n => {
      if (f === "*" && !n.epingle) return false;
      if (f === "~" && (n.maj || "") < semaine) return false;
      if (f.startsWith("d:") && n.dossier !== f.slice(2)) return false;
      if (f.startsWith("m:") && n.cours !== f.slice(2)) return false;
      if (q) {
        const txt = ((n.titre || "") + "\n" + (n.texte || "") + "\n" + (n.pages || []).map(p => (p.textes || []).map(t => t.t).join(" ")).join(" ")).toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
    if (this.tri === "titre") out.sort((a, b) => (a.titre || "").localeCompare(b.titre || "", "fr"));
    else if (this.tri === "cree") out.sort((a, b) => this.app.donnees.notes.indexOf(b) - this.app.donnees.notes.indexOf(a));
    else out.sort((a, b) => (b.maj || "").localeCompare(a.maj || ""));
    return out;
  }
  grille() {
    const f = this.filtre, dossiers = this.app.donnees.dossiers || [];
    this.titreFiltre.textContent = f === "*" ? "Favoris" : f === "~" ? "Récents" : f.startsWith("d:") ? ((dossiers.find(d => d.id === f.slice(2)) || {}).nom || "Dossier")
      : f.startsWith("m:") ? (CATS[f.slice(2)] || ["", "Matière"])[1] : "Tous les documents";
    const z = this.zoneDocs; z.innerHTML = "";
    const docs = this.filtrees();
    if (!docs.length) {
      z.append(el("div.nt-vide", null, el("span.badge.grand", {style: {"--c": couleurApp("notes")}}, iconePage("notes", 40)),
        el("h2", {texte: this.q ? "Aucun résultat" : "Aucun document ici"}),
        el("div.muted", {texte: "Crée un cahier pour écrire à l'Apple Pencil, ou une note texte."}),
        boutonIcone("plus", "Nouveau", () => new NouveauDocument(this).montrer(), "primary")));
      return;
    }
    for (const n of docs) z.append(this.carte(n));
  }
  carte(n) {
    const col = CATS[n.cours] ? couleur(n.cours) : T.MUTED;
    const d = isoDate((n.maj || "").slice(0, 10));
    const vignette = el("div.doc-vignette");
    if (n.type === "cahier" && n.couverture) {
      vignette.append(el("div.couverture", {style: {"--c": n.couverture}}, el("span.cv-dos"), el("span.cv-etiquette", {texte: n.titre || "Sans titre"})));
    } else if (n.type === "cahier") {
      vignette.append(canvasPage(n.pages[0], n.papier, this.vue === "liste" ? 64 : 150));
    } else {
      const pc = couleursPapier(n.papier);
      vignette.append(el("div.doc-texte", {style: {background: pc.fond, color: pc.encre}}, el("b", {texte: n.titre || "Sans titre"}), el("span", {texte: (n.texte || "").slice(0, 260)})));
    }
    const plus = el("button.doc-plus", {type: "button", title: "Options", onclick: (e) => { e.stopPropagation(); new InfosDocument(this, n).montrer(); }}, "⋯");
    const c = el("div.doc", {onclick: () => this.ouvrir(n.id)}, vignette,
      el("div.doc-info", null,
        el("div.doc-titre", null, n.epingle ? el("span.nt-epi", null, icone("etoile", 13)) : null, el("b", {texte: n.titre || "Sans titre"})),
        el("div.doc-sous", null, pastille(col, 7), el("span", {texte: [n.type === "cahier" ? `${n.pages.length} page${n.pages.length > 1 ? "s" : ""}` : "Texte", d ? dateCourte(d) : ""].filter(Boolean).join(" · ")}))),
      plus);
    glissable(c, () => n.titre || "Sans titre", (cle) => this.rangerNote(n, cle));
    c.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!c._glisse && !document.body.classList.contains("glisse-en-cours")) new InfosDocument(this, n).montrer(); });
    return c;
  }
  importer() {
    const inp = el("input", {type: "file", multiple: true, accept: ".pdf,.zip,.json,application/pdf,application/zip,application/json", style: {display: "none"}});
    inp.addEventListener("change", async () => {
      const fs = Array.from(inp.files || []); inp.remove();
      if (!fs.length) return;
      const m = new Modal("Importation", "Les PDF deviennent des cahiers où tu peux écrire par-dessus.");
      const barre = el("div.import-barre", null, el("span")), txt = el("p.petit.muted", {texte: "Lecture des fichiers…"});
      m.carte.append(barre, txt);
      m.clicVoile = () => {};
      m.montrer();
      try {
        const b = await importerFichiers(this.app, fs, (i, n, nom) => { barre.firstChild.style.width = (n ? 100 * i / n : 0) + "%"; txt.textContent = nom ? `${i + 1} / ${n} — ${nom}` : "Terminé."; });
        m.fermer();
        const lignes = [];
        if (b.notes) lignes.push(`${b.notes} cahier${b.notes > 1 ? "s" : ""} créé${b.notes > 1 ? "s" : ""} à partir de PDF.`);
        if (b.modeles) lignes.push(`${b.modeles} modèle${b.modeles > 1 ? "s" : ""} de page ajouté${b.modeles > 1 ? "s" : ""}.`);
        if (this.app.sync.configuree() && b.notes) lignes.push("Les PDF partent vers l'autre appareil en arrière-plan (garde l'appli ouverte quelques minutes).");
        if (b.erreurs.length) lignes.push("Problèmes :\n" + b.erreurs.slice(0, 8).join("\n"));
        this.bibliotheque();
        informer("Importation", lignes.join("\n\n") || "Rien à importer.");
      } catch (e) { m.fermer(); informer("Importation", "Erreur : " + (e && e.message || e)); }
    });
    document.body.append(inp);
    inp.click();
  }
  creer(opts) {
    const n = normaliserNote(Object.assign({id: newId(), maj: nowIsoMinutes(), cours: this.filtre.startsWith("m:") ? this.filtre.slice(2) : "",
      dossier: this.filtre.startsWith("d:") ? this.filtre.slice(2) : "", epingle: this.filtre === "*"}, opts));
    if (n.type === "cahier") n.pages = [pageVide(n.fond)];
    this.app.donnees.notes.unshift(n);
    this.app.sauver();
    this.ouvrir(n.id);
    return n;
  }
  ouvrir(id) {
    const n = this.note(id);
    if (!n) return this.bibliotheque();
    this.doc = id;
    const z = this.el; z.innerHTML = ""; z.classList.add("doc-ouvert");
    this.ed = n.type === "cahier" ? new EditeurCahier(this, n) : new EditeurTexte(this, n);
    z.append(this.ed.el);
    this.ed.apresAffichage && this.ed.apresAffichage();
  }
  fermerDoc() { if (this.ed) this.ed.enregistrer(); if (this.ed && this.ed.detruire) this.ed.detruire(); this.bibliotheque(); }
  supprimer(n) {
    return dialogue("Supprimer", `Supprimer « ${n.titre || "Sans titre"} » ?`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]]).then(ok => {
      if (!ok) return false;
      const l = this.app.donnees.notes, i = l.indexOf(n);
      if (i >= 0) l.splice(i, 1);
      const ids = new Set((n.pages || []).filter(p => p.pdf).map(p => p.pdf[0]));
      for (const id of ids) {
        if (l.some(x => (x.pages || []).some(p => p.pdf && p.pdf[0] === id))) continue;
        this.app.donnees.fichiers = (this.app.donnees.fichiers || []).filter(f => f.id !== id);
        Fichiers.supprimer(id);
      }
      if (this.doc === n.id) { this.ed = null; this.doc = null; this.sale = false; }
      this.app.sauver();
      this.bibliotheque();
      return true;
    });
  }
  dupliquer(n) {
    const c = clone(n); c.id = newId(); c.titre = (n.titre || "Sans titre") + " (copie)"; c.maj = nowIsoMinutes();
    for (const p of c.pages) p.id = newId();
    const l = this.app.donnees.notes; l.splice(l.indexOf(n) + 1, 0, c);
    this.app.sauver(); this.bibliotheque();
  }
}

/* ---------- nouveau document / infos / dossier */
class NouveauDocument extends Modal {
  constructor(pn) {
    super("Nouveau", "Un cahier pour écrire à l'Apple Pencil, ou une note texte.");
    this.pn = pn;
    this.type = "cahier"; this.fond = "ligne"; this.papier = "blanc"; this.couv = COUVERTURES[Math.floor(Math.random() * COUVERTURES.length)];
    this.titre = entree("", {placeholder: "Titre (facultatif)"});
    this.zone = el("div");
    this.carte.append(this.zone);
    this.barre([boutonIcone("dossier", "Nouveau dossier", () => { this.fermer(); new EditeurDossier(pn, null).montrer(); }, "ghost")],
      [bouton("Annuler", () => this.fermer()), bouton("Créer", () => this.valider(), "primary")]);
    this.dessiner();
  }
  dessiner() {
    const z = this.zone; z.innerHTML = "";
    const types = el("div.choix-types");
    for (const [v, t, d] of [["cahier", "Cahier", "Pages à écrire à la main"], ["texte", "Note texte", "Clavier ou Scribble"]]) {
      types.append(el("button.choix-type" + (this.type === v ? ".on" : ""), {type: "button", onclick: () => { this.type = v; this.dessiner(); }},
        icone(v === "cahier" ? "crayon" : "notes", 26), el("b", {texte: t}), el("span.petit.muted", {texte: d})));
    }
    z.append(types, champ("Titre", this.titre));
    if (this.type === "cahier") {
      const modeles = el("div.modeles");
      for (const [v, t] of FONDS) {
        const b = el("button.modele" + (this.fond === v ? ".on" : ""), {type: "button", onclick: () => { this.fond = v; this.dessiner(); }},
          canvasPage(pageVide(v, "x"), this.papier, 74), el("span", {texte: t}));
        modeles.append(b);
      }
      const papiers = el("div.rapides");
      for (const [v, t] of PAPIERS) papiers.append(petit(t, () => { this.papier = v; this.dessiner(); }, this.papier === v ? "tab_on" : "ghost"));
      const couvs = el("div.accents");
      couvs.append(el("span.sw.plus" + (!this.couv ? ".on" : ""), {texte: "∅", title: "Sans couverture (aperçu de la page)", onclick: () => { this.couv = ""; this.dessiner(); }}));
      for (const c of COUVERTURES) couvs.append(el("span.sw" + (c === this.couv ? ".on" : ""), {style: {background: c}, onclick: () => { this.couv = c; this.dessiner(); }}));
      z.append(etiquette("Modèle de page"), modeles, etiquette("Papier"), papiers, etiquette("Couverture"), couvs);
    }
  }
  valider() {
    const titre = this.titre.value.trim() || (this.type === "cahier" ? "Cahier sans titre" : "");
    this.fermer();
    this.pn.creer({type: this.type, titre, fond: this.fond, papier: this.papier, couverture: this.type === "cahier" ? this.couv : ""});
  }
}
class InfosDocument extends Modal {
  constructor(pn, n) {
    super(n.type === "cahier" ? "Cahier" : "Note texte", `${n.type === "cahier" ? n.pages.length + " page" + (n.pages.length > 1 ? "s" : "") + " · " : ""}modifié le ${dateCourte(isoDate((n.maj || "").slice(0, 10)) || aujourdhui())}`);
    this.pn = pn; this.n = n; this.couv = n.couverture; this.papier = n.papier;
    this.titre = entree(n.titre || "");
    this.cours = liste([["", "Sans matière"]].concat(Object.keys(CATS).map(k => [k, CATS[k][1]])), CATS[n.cours] ? n.cours : "");
    this.dossier = liste([["", "Aucun dossier"]].concat((pn.app.donnees.dossiers || []).map(d => [d.id, d.nom])), n.dossier || "");
    this.fav = caseACocher(!!n.epingle, null, "Favori");
    this.carte.append(champ("Titre", this.titre), el("div.grille2", null, champ("Matière", this.cours), champ("Dossier", this.dossier)), el("div.champ", null, this.fav));
    this.zone = el("div"); this.carte.append(this.zone);
    this.dessiner();
    this.barre([bouton("Supprimer", () => { this.fermer(); pn.supprimer(n); }, "danger"), bouton("Dupliquer", () => { this.fermer(); pn.dupliquer(n); }),
      bouton("Exporter", () => { this.fermer(); new ExportNote(n, null).montrer(); })],
      [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
  }
  dessiner() {
    const z = this.zone; z.innerHTML = "";
    const papiers = el("div.rapides");
    for (const [v, t] of PAPIERS) papiers.append(petit(t, () => { this.papier = v; this.dessiner(); }, this.papier === v ? "tab_on" : "ghost"));
    z.append(etiquette("Papier"), papiers);
    if (this.n.type === "cahier") {
      const couvs = el("div.accents");
      couvs.append(el("span.sw.plus" + (!this.couv ? ".on" : ""), {texte: "∅", title: "Sans couverture", onclick: () => { this.couv = ""; this.dessiner(); }}));
      for (const c of COUVERTURES) couvs.append(el("span.sw" + (c === this.couv ? ".on" : ""), {style: {background: c}, onclick: () => { this.couv = c; this.dessiner(); }}));
      z.append(etiquette("Couverture"), couvs);
    }
  }
  valider() {
    const n = this.n;
    Object.assign(n, {titre: this.titre.value.trim(), cours: this.cours.value, dossier: this.dossier.value, epingle: this.fav.valeur(), couverture: this.couv, papier: this.papier, maj: nowIsoMinutes()});
    this.fermer();
    this.pn.app.sauver();
    if (this.pn.doc === n.id && this.pn.ed) this.pn.ouvrir(n.id); else this.pn.bibliotheque();
  }
}
class EditeurDossier extends Modal {
  constructor(pn, d) {
    super(d ? "Modifier le dossier" : "Nouveau dossier");
    this.pn = pn; this.d = d; this.couleur = d ? d.couleur : COUVERTURES[6];
    this.nom = entree(d ? d.nom : "", {placeholder: "Nom du dossier"});
    this.sws = el("div.accents");
    this.carte.append(champ("Nom", this.nom), etiquette("Couleur"), this.sws);
    this.dessiner();
    this.barre(d ? [bouton("Supprimer", () => this.supprimer(), "danger")] : [], [bouton("Annuler", () => this.fermer()), bouton(d ? "Enregistrer" : "Créer", () => this.valider(), "primary")]);
  }
  dessiner() {
    this.sws.innerHTML = "";
    for (const c of COUVERTURES) this.sws.append(el("span.sw" + (c === this.couleur ? ".on" : ""), {style: {background: c}, onclick: () => { this.couleur = c; this.dessiner(); }}));
  }
  valider() {
    const nom = this.nom.value.trim();
    if (!nom) { this.err.textContent = "Donne un nom au dossier."; return; }
    const app = this.pn.app, l = app.donnees.dossiers = app.donnees.dossiers || [];
    if (this.d) Object.assign(this.d, {nom, couleur: this.couleur});
    else { const d = {id: newId(), nom, couleur: this.couleur}; l.push(d); this.pn.filtre = "d:" + d.id; }
    this.fermer(); app.sauver(); this.pn.bibliotheque();
  }
  async supprimer() {
    if (!await dialogue("Supprimer le dossier", `Supprimer le dossier « ${this.d.nom} » ?\nLes documents qu'il contient sont gardés (sans dossier).`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    const app = this.pn.app;
    app.donnees.dossiers = (app.donnees.dossiers || []).filter(x => x !== this.d);
    for (const n of app.donnees.notes) if (n.dossier === this.d.id) n.dossier = "";
    if (this.pn.filtre === "d:" + this.d.id) this.pn.filtre = "";
    this.fermer(); app.sauver(); this.pn.bibliotheque();
  }
}

/* ---------- note texte */
class EditeurTexte {
  constructor(pn, n) {
    this.pn = pn; this.n = n;
    const pc = couleursPapier(n.papier);
    this.titre = el("input.nt-titre", {type: "text", value: n.titre || "", placeholder: "Titre", oninput: () => this.modifie()});
    this.texte = el("textarea.nt-texte", {placeholder: "Écris ici… (Scribble : tu peux aussi écrire au crayon dans ce champ)", oninput: () => this.modifie()});
    this.texte.value = n.texte || "";
    this.etat = el("span.mono.muted.nt-etat", {texte: ""});
    this.el = el("div.doc-vue", null,
      el("header.doc-barre", null, boutonIcone("retour", "Bibliothèque", () => pn.fermerDoc(), "tab"), el("span.espace"), this.etat,
        boutonIcone("etoile", "", () => { n.epingle = !n.epingle; this.modifie(true); this.majFav(); }, "ghost"),
        boutonIcone("reglages", "", () => { this.enregistrer(); new InfosDocument(pn, n).montrer(); }, "ghost"),
        boutonIcone("exporter", "", () => { this.enregistrer(); new ExportNote(n, null).montrer(); }, "ghost")),
      el("section.carte.doc-texte-ed", {style: {background: pc.fond, color: pc.encre}}, this.titre, el("div.nt-sep"), this.texte));
    this.majFav();
  }
  majFav() { const b = this.el.querySelectorAll(".doc-barre .btn")[1]; if (b) b.classList.toggle("fav-on", !!this.n.epingle); }
  modifie(tout) {
    this.pn.sale = true; this.etat.textContent = "Modification…";
    clearTimeout(this._j); this._j = setTimeout(() => this.enregistrer(), tout ? 10 : 700);
  }
  enregistrer() {
    clearTimeout(this._j);
    if (!this.pn.sale) return;
    this.pn.sale = false;
    this.n.titre = this.titre.value.trim(); this.n.texte = this.texte.value.replace(/\n+$/, ""); this.n.maj = nowIsoMinutes();
    this.pn.app.sauver();
    this.etat.textContent = "Enregistrée ✓";
  }
  rafraichirDistant() {
    const n = this.pn.note(this.n.id);
    if (!n) return this.pn.bibliotheque();
    if (n !== this.n || this.titre.value.trim() !== (n.titre || "").trim() || this.texte.value !== (n.texte || "")) this.pn.ouvrir(n.id);
  }
}

/* ---------- cahier à pages */
class EditeurCahier {
  constructor(pn, n) {
    this.pn = pn; this.n = n;
    const r = Stock.lire("horaire_outils_notes", {});
    this.outil = r.outil || "plume";
    this.couleurs = Array.isArray(r.couleurs) && r.couleurs.length === 8 ? r.couleurs : ENCRES.slice();
    this.coul = r.coul ?? "";
    this.epIdx = Object.assign({plume: 1, bille: 1, surligneur: 1, forme: 1, gomme: 1}, r.epIdx || {});
    this.gommePrecise = !!r.gommePrecise;
    this.doigt = !!r.doigt;
    this.zoom = r.zoom || 1;
    this.miniatures = !!r.miniatures;
    this.histo = []; this.refait = [];
    this.sel = null;        // {page, traits:Set, textes:Set, boite}
    this.feuilles = new Map();   // id page → {div, cv, ctx, k}
    this.finRendu = Rendu.surPret((id, idx) => {
      for (const f of this.feuilles.values()) if (f.page.pdf && f.page.pdf[0] === id && f.page.pdf[1] === idx && f.alloue) this.peindre(f.page.id);
    });
    this.construire();
  }
  memo() {
    Stock.ecrire("horaire_outils_notes", {outil: this.outil, couleurs: this.couleurs, coul: this.coul, epIdx: this.epIdx, gommePrecise: this.gommePrecise,
      doigt: this.doigt, zoom: this.zoom, miniatures: this.miniatures});
  }
  pc() { return couleursPapier(this.n.papier); }
  construire() {
    const n = this.n;
    this.lblPage = el("span.mono.muted.cah-num");
    this.etat = el("span.mono.muted.nt-etat");
    this.titre = el("input.cah-titre", {type: "text", value: n.titre || "", placeholder: "Sans titre", oninput: () => { this.n.titre = this.titre.value.trim(); this.modifie(); }});
    this.bMini = boutonIcone("pages", "", () => { this.miniatures = !this.miniatures; this.memo(); this.el.classList.toggle("avec-mini", this.miniatures); this.dessinerMiniatures(); }, "ghost");
    const tete = el("header.doc-barre", null, boutonIcone("retour", "", () => this.pn.fermerDoc(), "tab"), this.bMini, this.titre, this.lblPage, el("span.espace"), this.etat,
      boutonIcone("zoom-moins", "", () => this.setZoom(this.zoom / 1.2), "ghost"), el("span.mono.cah-zoom", {texte: ""}),
      boutonIcone("zoom-plus", "", () => this.setZoom(this.zoom * 1.2), "ghost"),
      boutonIcone("page-plus", "Page", () => this.menuPage(), "ghost"),
      boutonIcone("exporter", "", () => { this.enregistrer(); new ExportNote(this.n, this.pageCourante).montrer(); }, "ghost"),
      boutonIcone("reglages", "", () => { this.enregistrer(); new InfosDocument(this.pn, n).montrer(); }, "ghost"));
    this.barreOutils = el("div.cah-outils");
    this.optOutil = el("div.cah-options");
    this.barreSel = el("div.cah-sel", {hidden: true});
    this.pagesZone = el("div.cah-pages");
    this.piste = el("div.cah-piste");
    this.pagesZone.append(this.piste);
    this.mini = el("aside.cah-mini");
    this.el = el("div.doc-vue.cahier" + (this.miniatures ? ".avec-mini" : ""), null, tete, el("div.cah-barre", null, this.barreOutils, this.optOutil),
      el("div.cah-corps", null, this.mini, this.pagesZone, this.barreSel));
    if ((n.texte || "").trim()) this.piste.append(el("details.cah-texte", null, el("summary", {texte: "Texte tapé de cette note"}),
      Object.assign(el("textarea.saisie", {rows: 4, oninput: (e) => { this.n.texte = e.target.value; this.modifie(); }}), {value: n.texte})));
    this.dessinerOutils();
    this.installerPinch();
  }
  apresAffichage() {
    this.construirePages();
    this.dessinerMiniatures();
    this.pagesZone.addEventListener("scroll", () => { if (!this._rafN) this._rafN = requestAnimationFrame(() => { this._rafN = 0; this.majNumero(); }); }, {passive: true});
  }
  detruire() { if (this._ro) this._ro.disconnect(); if (this._io) this._io.disconnect(); if (this._io2) this._io2.disconnect(); if (this.finRendu) this.finRendu(); }

  /* ----- barre d'outils */
  dessinerOutils() {
    const b = this.barreOutils; b.innerHTML = "";
    for (const [k, t, ico] of OUTILS_NOTES) {
      b.append(el("button.cah-outil" + (this.outil === k ? ".on" : ""), {type: "button", title: t, onclick: () => { this.outil = k; if (k !== "lasso") this.deselect(); this.memo(); this.dessinerOutils(); }}, icone(ico, 22)));
    }
    b.append(el("span.cah-sep"));
    b.append(el("button.cah-outil", {type: "button", title: "Annuler", onclick: () => this.annuler()}, icone("annuler", 20)),
      el("button.cah-outil", {type: "button", title: "Rétablir", onclick: () => this.refaire()}, icone("refaire", 20)));
    const o = this.optOutil; o.innerHTML = "";
    if (["plume", "bille", "surligneur", "forme", "texte"].includes(this.outil)) {
      this.couleurs.forEach((c, i) => {
        const s = el("span.sw.encre" + (c === this.coul ? ".on" : ""), {style: {background: c || this.pc().encre}, title: "Touche deux fois pour changer cette couleur",
          onclick: () => { if (this.coul === c && i > 0) this.changerCouleur(i); else { this.coul = c; this.memo(); this.dessinerOutils(); if (this.sel) this.recolorer(); } }});
        o.append(s);
      });
    }
    if (EPAISSEURS[this.outil]) {
      o.append(el("span.cah-sep"));
      EPAISSEURS[this.outil].forEach((e, i) => o.append(el("button.cah-ep" + (this.epIdx[this.outil] === i ? ".on" : ""), {type: "button", title: "Épaisseur",
        onclick: () => { this.epIdx[this.outil] = i; this.memo(); this.dessinerOutils(); }}, el("span", {style: {width: Math.min(26, 4 + e * (this.outil === "surligneur" || this.outil === "gomme" ? .55 : 2.2)) + "px", height: Math.min(26, 4 + e * (this.outil === "surligneur" || this.outil === "gomme" ? .55 : 2.2)) + "px"}}))));
    }
    if (this.outil === "gomme") {
      o.append(el("span.cah-sep"), petit(this.gommePrecise ? "Gomme précise" : "Trait entier", () => { this.gommePrecise = !this.gommePrecise; this.memo(); this.dessinerOutils(); }, "ghost"));
    }
    if (this.outil === "forme") o.append(el("span.petit.muted.cah-aide", {texte: "Dessine une ligne, un cercle ou un rectangle : il devient parfait."}));
    if (this.outil === "lasso") o.append(el("span.petit.muted.cah-aide", {texte: "Entoure des traits pour les déplacer, recolorer, dupliquer ou supprimer."}));
    if (this.outil === "texte") o.append(el("span.petit.muted.cah-aide", {texte: "Touche la page pour ajouter une zone de texte."}));
    o.append(el("span.espace"), petit("Doigt : " + (this.doigt ? "écrit" : "défile"), () => { this.doigt = !this.doigt; this.memo(); this.dessinerOutils(); this.majToucher(); }, this.doigt ? "tab_on" : "ghost"));
  }
  async changerCouleur(i) {
    const r = await choisirCouleur(this.couleurs[i] || "#1f6feb", "Couleur du stylo");
    if (r) { this.couleurs[i] = r; this.coul = r; this.memo(); this.dessinerOutils(); }
  }
  epaisseur() { return (EPAISSEURS[this.outil] || [3])[this.epIdx[this.outil] ?? 1]; }

  /* ----- pages */
  largeurBase() { return Math.max(320, Math.min(this.pagesZone.clientWidth - 48, 900)); }
  construirePages() {
    for (const f of this.feuilles.values()) f.div.remove();
    this.feuilles.clear();
    if (this._io) this._io.disconnect();
    if (this._io2) this._io2.disconnect();
    const trouver = (t) => [...this.feuilles.values()].find(x => x.div === t);
    this._io = new IntersectionObserver((ents) => { for (const e of ents) if (e.isIntersecting) { const f = trouver(e.target); if (f && (f.aDessiner || !f.alloue)) this.peindre(f.page.id); } }, {root: this.pagesZone, rootMargin: "500px 300px"});
    this._io2 = new IntersectionObserver((ents) => { for (const e of ents) if (!e.isIntersecting) { const f = trouver(e.target); if (f) this.liberer(f); } }, {root: this.pagesZone, rootMargin: "2200px 1200px"});
    const W = this.largeurBase() * this.zoom;
    this.n.pages.forEach((p, i) => {
      const cv = el("canvas.cah-cv"), div = el("div.feuille", {"data-p": p.id}, cv, el("span.feuille-num", {texte: `${i + 1}`}));
      this.piste.append(div);
      const f = {page: p, div, cv, ctx: cv.getContext("2d"), k: W / PAGE_L, aDessiner: true, alloue: false};
      this.feuilles.set(p.id, f);
      this.dimensionner(f, W);
      this.installer(f);
      this._io.observe(div); this._io2.observe(div);
    });
    this.el.querySelector(".cah-zoom").textContent = Math.round(this.zoom * 100) + " %";
    this.majToucher(); this.majNumero();
    if (!this._ro) { this._ro = new ResizeObserver(() => { clearTimeout(this._rz); this._rz = setTimeout(() => this.redimensionner(), 120); }); this._ro.observe(this.pagesZone); }
  }
  /* taille affichée seulement ; la toile (pixels) est allouée au moment de peindre */
  dimensionner(f, W) {
    f.k = W / PAGE_L;
    f.cv.style.width = W + "px"; f.cv.style.height = f.page.h * f.k + "px";
    f.aDessiner = true;
  }
  allouer(f) {
    const W = f.k * PAGE_L, H = f.page.h * f.k;
    const dpr = Math.min(window.devicePixelRatio || 1, Math.sqrt(12e6 / (W * H)));   // au plus 12 Mpx par page
    const w = Math.round(W * dpr), h = Math.round(H * dpr);
    if (f.cv.width !== w || f.cv.height !== h) { f.cv.width = w; f.cv.height = h; }
    f.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    f.alloue = true;
  }
  liberer(f) { if (!f.alloue) return; f.cv.width = 0; f.cv.height = 0; f.alloue = false; f.aDessiner = true; }
  /* marges de chaque côté de la page : on la pousse à gauche ou à droite à la main, elle ne se recentre jamais */
  marges() {
    const pz = this.pagesZone, m = Math.round(pz.clientWidth * 0.6), avant = parseFloat(this.piste.style.paddingLeft) || 14;
    if (Math.abs(avant - (14 + m)) < 1) return;
    this.piste.style.paddingLeft = (14 + m) + "px"; this.piste.style.paddingRight = (46 + m) + "px";
    if (this._centre) pz.scrollLeft += 14 + m - avant;
    else if (pz.scrollWidth > pz.clientWidth) { pz.scrollLeft = (pz.scrollWidth - pz.clientWidth) / 2; this._centre = true; }
  }
  redimensionner() {
    const W = this.largeurBase() * this.zoom;
    this.marges();
    for (const f of this.feuilles.values()) if (Math.abs(f.k * PAGE_L - W) > 1) this.dimensionner(f, W);
    for (const f of this.feuilles.values()) if (this.visible(f) && f.aDessiner) this.peindre(f.page.id);
  }
  visible(f) { const r = f.div.getBoundingClientRect(), z = this.pagesZone.getBoundingClientRect(); return r.bottom > z.top - 500 && r.top < z.bottom + 500 && r.right > z.left - 300 && r.left < z.right + 300; }
  /* point de l'écran → (page, coordonnées dans la page) ; sert à garder ce point sous les doigts en zoomant */
  pointPage(x, y) {
    let best = null, dmin = 1e9;
    for (const f of this.feuilles.values()) {
      const r = f.div.getBoundingClientRect(), d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
      if (d < dmin) { dmin = d; best = {f, px: (x - r.left) / f.k, py: (y - r.top) / f.k}; }
      if (d === 0) break;
    }
    return best;
  }
  centreZone() { const z = this.pagesZone.getBoundingClientRect(); return {x: z.left + z.width / 2, y: z.top + z.height / 2}; }
  setZoom(z, ref, cible) {
    const ancien = this.zoom;
    this.zoom = Math.max(.5, Math.min(3, Math.round(z * 100) / 100));
    if (!ref) { const c = this.centreZone(); ref = this.pointPage(c.x, c.y); cible = c; }
    if (Math.abs(ancien - this.zoom) >= .005) {
      this.memo();
      const W = this.largeurBase() * this.zoom;
      for (const f of this.feuilles.values()) this.dimensionner(f, W);
      this.el.querySelector(".cah-zoom").textContent = Math.round(this.zoom * 100) + " %";
    }
    if (ref) {
      const pz = this.pagesZone, r = ref.f.div.getBoundingClientRect();
      pz.scrollLeft += r.left + ref.px * ref.f.k - cible.x;
      pz.scrollTop += r.top + ref.py * ref.f.k - cible.y;
    }
    for (const f of this.feuilles.values()) { if (this.visible(f)) { if (f.aDessiner) this.peindre(f.page.id); } else this.liberer(f); }
  }
  peindre(pid) {
    const f = this.feuilles.get(pid);
    if (!f) return;
    if (!f.alloue || f.aDessiner) this.allouer(f);
    f.aDessiner = false;
    const W = f.k * PAGE_L, H = f.page.h * f.k;
    f.ctx.clearRect(0, 0, W, H);
    dessinerPage(f.ctx, f.page, f.k, this.pc(), this.sel && this.sel.page === f.page ? this.sel : null);
  }
  majNumero() {
    const z = this.pagesZone.getBoundingClientRect();
    let cur = 0, i = 0;
    for (const f of this.feuilles.values()) { const r = f.div.getBoundingClientRect(); if (r.top < z.top + z.height / 2) cur = i; i++; }
    this.pageCourante = this.n.pages[cur];
    this.lblPage.textContent = `Page ${cur + 1} / ${this.n.pages.length}`;
    for (const m of this.mini.querySelectorAll(".mini")) m.classList.toggle("on", m.dataset.p === (this.pageCourante && this.pageCourante.id));
  }
  dessinerMiniatures() {
    const m = this.mini; m.innerHTML = "";
    if (!this.miniatures) return;
    this.n.pages.forEach((p, i) => {
      const b = el("button.mini" + (this.pageCourante === p ? ".on" : ""), {type: "button", "data-p": p.id, onclick: () => this.allerPage(p.id)},
        canvasPage(p, this.n.papier, 110), el("span.mono", {texte: String(i + 1)}));
      m.append(b);
    });
  }
  allerPage(pid) {
    const f = this.feuilles.get(pid);
    if (!f) return;
    const pz = this.pagesZone, r = f.div.getBoundingClientRect(), z = pz.getBoundingClientRect();
    pz.scrollTo({top: pz.scrollTop + r.top - z.top - 16, behavior: "smooth"});
  }
  menuPage() {
    const p = this.pageCourante || this.n.pages[0], idx = this.n.pages.indexOf(p), app = this.pn.app;
    const m = new Modal("Pages", `Page ${idx + 1} sur ${this.n.pages.length}`);
    const modeles = el("div.modeles");
    for (const [v, t] of FONDS) modeles.append(el("button.modele", {type: "button", onclick: () => { m.fermer(); this.ajouterPage(idx + 1, v); }}, canvasPage(pageVide(v, "x"), this.n.papier, 74), el("span", {texte: t})));
    for (const md of app.donnees.modeles || []) modeles.append(el("button.modele.perso", {type: "button", title: md.nom, onclick: () => { m.fermer(); this.ajouterPage(idx + 1, null, md); }},
      canvasPage(Object.assign(pageVide(md.f, "x"), {h: md.h, traits: md.traits, textes: md.textes}), this.n.papier, 74), el("span", {texte: md.nom})));
    m.carte.append(etiquette("Ajouter une page après celle-ci"), modeles);
    if (!(p.f === "pdf" && p.pdf)) {
      const fondPage = el("div.rapides");
      for (const [v, t] of FONDS) fondPage.append(petit(t, () => { this.snap(p); p.f = v; m.fermer(); this.peindre(p.id); this.dessinerMiniatures(); this.modifie(); }, p.f === v ? "tab_on" : "ghost"));
      m.carte.append(etiquette("Fond de cette page"), fondPage);
    }
    const gest = el("div.rapides");
    gest.append(petit("Enregistrer cette page comme modèle", async () => {
      const nom = await demanderTexte("Nouveau modèle", "Nom du modèle de page", "Modèle " + ((app.donnees.modeles || []).length + 1));
      if (!nom) return;
      app.donnees.modeles = (app.donnees.modeles || []).concat(normaliserModeles([{nom, f: p.f === "pdf" ? "blanc" : p.f, h: p.h, traits: clone(p.traits), textes: clone(p.textes || [])}]));
      app.sauver(); m.fermer(); this.menuPage();
    }, "ghost"), petit("Importer un modèle…", () => this.importerModele(() => { m.fermer(); this.menuPage(); }), "ghost"));
    if ((app.donnees.modeles || []).length) gest.append(petit("Exporter tous les modèles", () => livrer([{nom: "Modeles de pages.json", blob: fichierModeles(app.donnees.modeles)}]), "ghost"));
    m.carte.append(etiquette("Modèles de pages"), gest);
    for (const md of app.donnees.modeles || []) {
      m.carte.append(el("div.ligne-modele", null, el("span", {texte: md.nom}), el("span.espace"),
        petit("Exporter", () => livrer([{nom: nomFichierSur(md.nom) + ".json", blob: fichierModeles([md])}]), "ghost"),
        petit("Supprimer", async () => {
          if (!await dialogue("Supprimer le modèle", `Supprimer le modèle « ${md.nom} » ?`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
          app.donnees.modeles = app.donnees.modeles.filter(x => x !== md); app.sauver(); m.fermer(); this.menuPage();
        }, "ghost")));
    }
    m.barre([bouton("Supprimer la page", () => { m.fermer(); this.supprimerPage(p); }, "danger"), bouton("Dupliquer", () => { m.fermer(); const c = clone(p); c.id = newId(); this.n.pages.splice(idx + 1, 0, c); this.apresPages(c.id); })],
      [idx > 0 ? bouton("↑ Monter", () => { m.fermer(); this.n.pages.splice(idx, 1); this.n.pages.splice(idx - 1, 0, p); this.apresPages(p.id); }) : null,
        idx < this.n.pages.length - 1 ? bouton("↓ Descendre", () => { m.fermer(); this.n.pages.splice(idx, 1); this.n.pages.splice(idx + 1, 0, p); this.apresPages(p.id); }) : null,
        bouton("Fermer", () => m.fermer())].filter(Boolean));
    m.montrer();
  }
  importerModele(apres) {
    const inp = el("input", {type: "file", accept: ".json,application/json", style: {display: "none"}});
    inp.addEventListener("change", async () => {
      const f = inp.files && inp.files[0]; inp.remove();
      if (!f) return;
      try { const nb = importerModeles(this.pn.app, JSON.parse(await f.text())); informer("Modèles", `${nb} modèle${nb > 1 ? "s" : ""} ajouté${nb > 1 ? "s" : ""}.`); if (apres) apres(); }
      catch (e) { informer("Modèles", "Fichier illisible : " + (e && e.message || e)); }
    });
    document.body.append(inp); inp.click();
  }
  ajouterPage(i, f, modele) { const p = modele ? pageDepuisModele(modele) : pageVide(f || (this.n.fond === "pdf" ? "blanc" : this.n.fond)); this.n.pages.splice(i, 0, p); this.apresPages(p.id); }
  async supprimerPage(p) {
    if (this.n.pages.length <= 1) { informer("Pages", "Un cahier garde au moins une page."); return; }
    if ((p.traits.length || (p.textes || []).length) && !await dialogue("Supprimer la page", "Supprimer cette page et ce qui est écrit dessus ?", [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    this.n.pages.splice(this.n.pages.indexOf(p), 1);
    this.apresPages();
  }
  apresPages(aller) {
    this.histo = []; this.refait = []; this.deselect();
    this.construirePages(); this.dessinerMiniatures(); this.modifie();
    if (aller) setTimeout(() => this.allerPage(aller), 50);
  }

  /* ----- saisie au crayon */
  majToucher() { for (const f of this.feuilles.values()) f.cv.style.touchAction = this.doigt ? "none" : "pan-x pan-y"; }
  point(f, e) {
    const r = f.cv.getBoundingClientRect();
    let pr = e.pointerType === "pen" ? e.pressure : .5;
    if (!pr) pr = .5;
    return [Math.round((e.clientX - r.left) / f.k * 10) / 10, Math.round((e.clientY - r.top) / f.k * 10) / 10, Math.round(pr * 100)];
  }
  installer(f) {
    const cv = f.cv;
    cv.addEventListener("touchstart", (e) => { if (this.doigt || Array.from(e.changedTouches).some(t => t.touchType === "stylus")) e.preventDefault(); }, {passive: false});
    cv.addEventListener("touchmove", (e) => { if (this.geste) e.preventDefault(); }, {passive: false});
    cv.addEventListener("pointerdown", (e) => this.appui(f, e));
    cv.addEventListener("pointermove", (e) => this.bouge(f, e));
    cv.addEventListener("pointerup", (e) => this.relache(f, e));
    cv.addEventListener("pointercancel", (e) => this.relache(f, e));
  }
  appui(f, e) {
    if (e.pointerType === "touch" && !this.doigt) return;
    if (this.pince) return;
    if (this.geste || this.texteOuvert) { if (this.texteOuvert) this.texteOuvert.blur(); return; }
    e.preventDefault();
    try { f.cv.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    const [x, y, pr] = this.point(f, e);
    const outil = (e.button === 5 || (e.buttons & 32)) ? "gomme" : this.outil;
    this.geste = {f, id: e.pointerId, outil, x0: x, y0: y, type: e.pointerType};
    if (outil === "gomme") { this.snap(f.page); this.gommer(f, x, y); return; }
    if (outil === "texte") { this.geste = null; this.ouvrirTexte(f, x, y); return; }
    if (outil === "lasso") {
      if (this.sel && this.sel.page === f.page && this.dansBoite(x, y)) { this.snap(f.page); this.geste.deplace = true; return; }
      this.deselect(); this.geste.poly = [x, y]; return;
    }
    const surl = outil === "surligneur";
    const tr = {c: this.coul, e: this.epaisseur(), p: [x, y, pr]};
    if (surl) tr.o = 1;
    if (outil === "bille") tr.k = "b";
    if (outil === "forme") tr.k = "f";
    this.geste.trait = tr;
  }
  bouge(f, e) {
    const g = this.geste;
    if (!g || g.id !== e.pointerId || g.f !== f) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of evs.length ? evs : [e]) {
      const [x, y, pr] = this.point(f, ev);
      if (g.outil === "gomme") { this.gommer(f, x, y); continue; }
      if (g.poly) { g.poly.push(x, y); continue; }
      if (g.deplace) { this.deplacerSel(x - g.x0, y - g.y0); g.x0 = x; g.y0 = y; continue; }
      if (g.trait) {
        const t = g.trait.p, n = t.length;
        if (Math.hypot(x - t[n - 3], y - t[n - 2]) < 1) continue;
        t.push(x, y, pr);
        // trait en direct (sans tout redessiner)
        if (!g.trait.o) tracer(f.ctx, {c: g.trait.c, e: g.trait.e, k: g.trait.k, p: t.slice(-6)}, f.k, this.pc().encre);
        else { clearTimeout(this._live); this._live = setTimeout(() => { this.peindre(f.page.id); const pc = this.pc(); tracer(f.ctx, g.trait, f.k, pc.encre, papierClair(pc)); }, 16); }
      }
    }
    if (g.poly) { this.peindre(f.page.id); const c = f.ctx, k = f.k; c.save(); c.setLineDash([5, 5]); c.strokeStyle = T.ACCENT; c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.poly[0] * k, g.poly[1] * k); for (let i = 2; i < g.poly.length; i += 2) c.lineTo(g.poly[i] * k, g.poly[i + 1] * k); c.stroke(); c.restore(); }
    if (g.deplace) this.peindre(f.page.id);
    if (g.outil === "plume" && g.trait && g.trait.p.length > 6 && f.div.offsetHeight && e.clientY > f.cv.getBoundingClientRect().bottom - 40 && f.page === this.n.pages[this.n.pages.length - 1]) { /* bas de la dernière page : rien */ }
  }
  relache(f, e) {
    const g = this.geste;
    if (!g || g.id !== e.pointerId) return;
    clearTimeout(this._live);
    this.geste = null;
    if (g.outil === "gomme") { this.peindre(f.page.id); this.modifie(); return; }
    if (g.poly) { this.selectionner(f, g.poly); return; }
    if (g.deplace) { this.modifie(); this.dessinerMiniatures(); return; }
    if (g.trait) {
      this.snap(f.page);
      if (g.outil === "forme") { const pts = reconnaitreForme(g.trait.p); if (pts) g.trait.p = pts; }
      if ((g.outil === "plume" || g.outil === "bille") && estGribouillis(g.trait.p) && effacerSousGribouillis(f.page, g.trait)) {
        this.peindre(f.page.id); this.modifie(); return;
      }
      f.page.traits.push(g.trait);
      this.peindre(f.page.id);
      this.modifie();
    }
  }
  gommer(f, x, y) {
    const r = this.epaisseur() / 2, p = f.page;
    const avantTx = (p.textes || []).length;
    p.textes = (p.textes || []).filter(tx => !toucheTexte(tx, x, y, r));
    if (p.textes.length !== avantTx) this.peindre(p.id);
    if (!this.gommePrecise) {
      const avant = p.traits.length;
      p.traits = p.traits.filter(tr => !touche(tr, x, y, r));
      if (p.traits.length !== avant) this.peindre(p.id);
      return;
    }
    let change = false;
    const nouveaux = [];
    for (const tr of p.traits) {
      if (!touche(tr, x, y, r)) { nouveaux.push(tr); continue; }
      change = true;
      let cur = [];
      for (let i = 0; i < tr.p.length; i += 3) {
        if (Math.hypot(tr.p[i] - x, tr.p[i + 1] - y) < r + (tr.e || 3) / 2) { if (cur.length >= 6) nouveaux.push(Object.assign({}, tr, {p: cur})); cur = []; }
        else cur.push(tr.p[i], tr.p[i + 1], tr.p[i + 2]);
      }
      if (cur.length >= 6) nouveaux.push(Object.assign({}, tr, {p: cur}));
    }
    if (change) { p.traits = nouveaux; this.peindre(p.id); }
  }

  /* ----- lasso */
  selectionner(f, poly) {
    const p = f.page, traits = new Set(), textes = new Set();
    if (poly.length >= 6) {
      for (const tr of p.traits) {
        let dedans = 0, n = 0;
        for (let i = 0; i < tr.p.length; i += 3) { n++; if (dansPoly(tr.p[i], tr.p[i + 1], poly)) dedans++; }
        if (n && dedans / n >= .5) traits.add(tr);
      }
      for (const tx of p.textes || []) if (dansPoly(tx.x + 10, tx.y + 10, poly)) textes.add(tx);
    }
    if (!traits.size && !textes.size) { this.deselect(); this.peindre(p.id); return; }
    this.sel = {page: p, traits, textes, boite: null};
    this.majBoite();
    this.peindre(p.id);
    const b = this.barreSel; b.innerHTML = ""; b.hidden = false;
    b.append(el("span.petit", {texte: `${traits.size + textes.size} élément${traits.size + textes.size > 1 ? "s" : ""}`}),
      petit("Couleur actuelle", () => this.recolorer()), petit("Dupliquer", () => this.dupliquerSel()), petit("Supprimer", () => this.supprimerSel(), "danger"),
      el("span.bs-x", {texte: "✕", onclick: () => { this.deselect(); this.peindre(p.id); }}));
  }
  majBoite() {
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (const tr of this.sel.traits) { const q = boiteTrait(tr), m = (tr.e || 3) / 2; a = Math.min(a, q[0] - m); b = Math.min(b, q[1] - m); c = Math.max(c, q[2] + m); d = Math.max(d, q[3] + m); }
    for (const tx of this.sel.textes) { a = Math.min(a, tx.x); b = Math.min(b, tx.y); c = Math.max(c, tx.x + (tx.w || 420)); d = Math.max(d, tx.y + hauteurTexte(tx)); }
    this.sel.boite = [a, b, c, d];
  }
  dansBoite(x, y) { const b = this.sel.boite; return x >= b[0] - 12 && x <= b[2] + 12 && y >= b[1] - 12 && y <= b[3] + 12; }
  deplacerSel(dx, dy) {
    for (const tr of this.sel.traits) for (let i = 0; i < tr.p.length; i += 3) { tr.p[i] = Math.round((tr.p[i] + dx) * 10) / 10; tr.p[i + 1] = Math.round((tr.p[i + 1] + dy) * 10) / 10; }
    for (const tx of this.sel.textes) { tx.x += dx; tx.y += dy; }
    this.majBoite();
  }
  recolorer() {
    if (!this.sel) return;
    this.snap(this.sel.page);
    for (const tr of this.sel.traits) tr.c = this.coul;
    for (const tx of this.sel.textes) tx.c = this.coul;
    this.peindre(this.sel.page.id); this.modifie();
  }
  dupliquerSel() {
    const s = this.sel, p = s.page;
    this.snap(p);
    const tr2 = [...s.traits].map(t => { const c = clone(t); for (let i = 0; i < c.p.length; i += 3) { c.p[i] += 30; c.p[i + 1] += 30; } return c; });
    const tx2 = [...s.textes].map(t => Object.assign(clone(t), {id: newId(), x: t.x + 30, y: t.y + 30}));
    p.traits.push(...tr2); p.textes = (p.textes || []).concat(tx2);
    this.sel = {page: p, traits: new Set(tr2), textes: new Set(tx2), boite: null};
    this.majBoite(); this.peindre(p.id); this.modifie();
  }
  supprimerSel() {
    const s = this.sel, p = s.page;
    this.snap(p);
    p.traits = p.traits.filter(t => !s.traits.has(t));
    p.textes = (p.textes || []).filter(t => !s.textes.has(t));
    this.deselect(); this.peindre(p.id); this.modifie();
  }
  deselect() { const had = this.sel; this.sel = null; this.barreSel.hidden = true; if (had) this.peindre(had.page.id); }

  /* ----- zones de texte */
  ouvrirTexte(f, x, y) {
    const p = f.page;
    let tx = (p.textes || []).find(t => x >= t.x - 10 && x <= t.x + (t.w || 420) && y >= t.y - 10 && y <= t.y + hauteurTexte(t) + 10);
    const nouveau = !tx;
    if (nouveau) tx = {id: newId(), x: Math.max(10, Math.min(x, PAGE_L - 200)), y: Math.max(10, y - 14), w: Math.min(520, PAGE_L - 30 - x), t: "", c: this.coul, s: 28};
    this.snap(p);
    if (!nouveau) { p.textes = p.textes.filter(t => t !== tx); this.peindre(p.id); }
    const pc = this.pc();
    const ta = el("textarea.cah-zone-texte", {style: {left: tx.x * f.k + "px", top: tx.y * f.k + "px", width: Math.max(160, (tx.w || 420) * f.k) + "px",
      fontSize: (tx.s || 28) * f.k + "px", color: estHex(tx.c) ? tx.c : pc.encre}});
    ta.value = tx.t || "";
    f.div.append(ta);
    this.texteOuvert = ta;
    const ajuster = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", ajuster);
    ta.addEventListener("blur", () => {
      tx.t = ta.value.replace(/\s+$/, "");
      ta.remove(); this.texteOuvert = null;
      if (tx.t) { p.textes = (p.textes || []).concat([tx]); }
      this.peindre(p.id); this.modifie();
    });
    setTimeout(() => { ta.focus(); ajuster(); }, 20);
  }

  /* ----- annuler / rétablir (par page) */
  snap(p) { this.histo.push({p, traits: clone(p.traits), textes: clone(p.textes || [])}); if (this.histo.length > 60) this.histo.shift(); this.refait = []; }
  annuler() {
    const h = this.histo.pop(); if (!h) return;
    this.refait.push({p: h.p, traits: clone(h.p.traits), textes: clone(h.p.textes || [])});
    h.p.traits = h.traits; h.p.textes = h.textes; this.deselect(); this.peindre(h.p.id); this.modifie();
  }
  refaire() {
    const h = this.refait.pop(); if (!h) return;
    this.histo.push({p: h.p, traits: clone(h.p.traits), textes: clone(h.p.textes || [])});
    h.p.traits = h.traits; h.p.textes = h.textes; this.deselect(); this.peindre(h.p.id); this.modifie();
  }

  /* ----- pincer pour zoomer (deux doigts) */
  installerPinch() {
    const z = this.pagesZone, P = this.piste;
    const milieu = (t) => ({x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2});
    const ecart = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const debut = (m, d) => {
      const r = P.getBoundingClientRect();
      this.pince = {m0: m, d0: d, z0: this.zoom, s: 1, m, ref: this.pointPage(m.x, m.y)};
      P.style.transformOrigin = `${m.x - r.left}px ${m.y - r.top}px`;
      P.style.willChange = "transform";
    };
    const apercu = () => {
      if (this._rafP) return;
      this._rafP = requestAnimationFrame(() => {
        this._rafP = 0;
        const g = this.pince;
        if (g) P.style.transform = `translate(${g.m.x - g.m0.x}px, ${g.m.y - g.m0.y}px) scale(${g.s})`;
      });
    };
    const finir = () => {
      const g = this.pince;
      if (!g) return;
      this.pince = null;
      cancelAnimationFrame(this._rafP); this._rafP = 0;
      P.style.transform = ""; P.style.willChange = "";
      this.setZoom(g.z0 * g.s, g.ref, g.m);
    };
    z.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 2) return;
      if (this.geste && this.geste.type === "pen") return;            // le crayon écrit : on ne zoome pas
      if (this.geste) { const f = this.geste.f; this.geste = null; clearTimeout(this._live); if (f) this.peindre(f.page.id); }   // le 1er doigt n'écrit pas
      e.preventDefault();
      debut(milieu(e.touches), ecart(e.touches));
    }, {passive: false});
    z.addEventListener("touchmove", (e) => {
      const g = this.pince;
      if (!g || e.touches.length < 2) return;
      e.preventDefault();
      g.m = milieu(e.touches);
      g.s = Math.max(.5, Math.min(3, g.z0 * ecart(e.touches) / g.d0)) / g.z0;
      apercu();
    }, {passive: false});
    const fin = (e) => { if (this.pince && e.touches.length < 2) finir(); };
    z.addEventListener("touchend", fin, {passive: true});
    z.addEventListener("touchcancel", fin, {passive: true});
    for (const ev of ["gesturestart", "gesturechange"]) z.addEventListener(ev, (e) => e.preventDefault(), {passive: false});
    // trackpad / souris : ctrl + molette (pincer sur un trackpad)
    z.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const m = {x: e.clientX, y: e.clientY};
      if (!this.pince) debut(m, 1);
      const g = this.pince;
      g.s = Math.max(.5, Math.min(3, g.z0 * g.s * Math.exp(-e.deltaY * .01))) / g.z0;
      apercu();
      clearTimeout(this._tw); this._tw = setTimeout(finir, 160);
    }, {passive: false});
  }

  /* ----- enregistrement */
  modifie() {
    this.pn.sale = true; this.etat.textContent = "Modification…";
    clearTimeout(this._j); this._j = setTimeout(() => this.enregistrer(), 900);
  }
  enregistrer() {
    clearTimeout(this._j);
    if (this.texteOuvert) this.texteOuvert.blur();
    if (!this.pn.sale) return;
    this.pn.sale = false;
    this.n.maj = nowIsoMinutes();
    this.pn.app.sauver();
    this.etat.textContent = "Enregistré ✓";
    clearTimeout(this._jm); this._jm = setTimeout(() => this.dessinerMiniatures(), 200);
  }
  rafraichirDistant() {
    const n = this.pn.note(this.n.id);
    if (!n) return this.pn.bibliotheque();
    const memesPages = n.pages.length === this.n.pages.length && n.pages.every((p, i) => p.id === this.n.pages[i].id && p.f === this.n.pages[i].f && p.h === this.n.pages[i].h);
    this.n = n;
    this.titre.value = n.titre || "";
    if (!memesPages) { this.construirePages(); this.dessinerMiniatures(); return; }
    this.feuilles.forEach((f, id) => { f.page = n.pages.find(p => p.id === id); this.peindre(id); });
    this.dessinerMiniatures();
  }
}
