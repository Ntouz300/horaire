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
  ["gomme", "Gomme", "gomme"], ["lasso", "Lasso", "lasso"], ["forme", "Formes", "forme"], ["texte", "Texte", "texte"],
  ["note", "Note adhésive", "note"], ["laser", "Pointeur laser", "laser"], ["main", "Main (déplacer le canevas)", "main"]];
const STYLES_TRAIT = [["", "Uni"], ["t", "Tirets"], ["p", "Pointillés"]];
/* menu des formes (v29/v27) : « auto » reconnaît la forme dessinée à main levée ; les autres tracent la forme exacte du point de départ au point d'arrivée */
const FORMES_MENU = [["auto", "Automatique", "forme"], ["ligne", "Ligne", "f_ligne"], ["rect", "Rectangle", "f_rect"], ["ellipse", "Ellipse", "f_ellipse"], ["triangle", "Triangle", "f_triangle"]];
Object.assign(ICONES, {f_ligne: [["l", 5, 19, 19, 5]], f_rect: [["r", 4, 6, 20, 18, 1]], f_ellipse: [["c", 12, 12, 8]], f_triangle: [["p", 1, 12, 4, 20, 19, 4, 19]]});
const TENIR_MS = 550;          // crayon / doigt / souris immobile pendant ce temps à la fin d'un trait : le trait devient une ligne droite
const UNITE_MM = PAGE_L / 210;                 // une page fait 210 mm de large (A4)
const COULEURS_NOTE = ["#fff3a3", "#ffd6e7", "#cfeeff", "#d6f5c6", "#ffe0b8"];
const MAX_ONGLETS = 8;
const EPAISSEURS = {plume: [1.6, 3, 5.5], bille: [1.4, 2.4, 4], surligneur: [12, 20, 30], forme: [1.6, 3, 5], gomme: [10, 22, 44]};

/* ---------- canevas infini : espace sans limite, vue {x, y, z} (coin haut-gauche en unités canevas, zoom) */
const CANEVAS_PAS = 40, CANEVAS_ZOOM = [0.1, 4];
function vueDefaut() { return {x: -60, y: -60, z: 1}; }
/* boîte englobant tout le contenu d'une page, ou null si elle est vide */
function boiteContenu(page) {
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9, n = 0;
  for (const tr of page.traits || []) {
    if (!tr.p || tr.p.length < 3) continue;
    const q = boiteTrait(tr), m = (tr.e || 3) / 2;
    a = Math.min(a, q[0] - m); b = Math.min(b, q[1] - m); c = Math.max(c, q[2] + m); d = Math.max(d, q[3] + m); n++;
  }
  for (const tx of page.textes || []) {
    const m = tx.bg ? 14 : 0;
    a = Math.min(a, tx.x - m); b = Math.min(b, tx.y - m); c = Math.max(c, tx.x + (tx.w || 420) + m); d = Math.max(d, tx.y + hauteurBloc(tx) + m); n++;
  }
  return n ? [a, b, c, d] : null;
}
/* points ou quadrillage discrets, tracés seulement dans la zone visible */
function fondCanevas(ctx, pc, W, H, v, mode) {
  if (mode === "aucun") return;
  let pas = CANEVAS_PAS * v.z;
  while (pas < 14) pas *= 5;
  const x0 = ((-v.x * v.z) % pas + pas) % pas, y0 = ((-v.y * v.z) % pas + pas) % pas;
  ctx.fillStyle = pc.ligne; ctx.strokeStyle = pc.ligne; ctx.lineWidth = 1;
  if (mode === "grille") {
    ctx.beginPath();
    for (let x = x0; x < W; x += pas) { ctx.moveTo(Math.round(x) + .5, 0); ctx.lineTo(Math.round(x) + .5, H); }
    for (let y = y0; y < H; y += pas) { ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(W, Math.round(y) + .5); }
    ctx.stroke();
  } else {
    ctx.beginPath();
    for (let y = y0; y < H; y += pas) for (let x = x0; x < W; x += pas) ctx.rect(Math.round(x) - 1, Math.round(y) - 1, 2.2, 2.2);
    ctx.fill();
  }
}
/* copie « ajustée » d'une page canevas : tout le contenu mis à l'échelle dans une page ordinaire (miniatures, exports) */
function pageCanevasAjustee(page) {
  const b = boiteContenu(page);
  const out = Object.assign({}, page, {f: "blanc", h: PAGE_H});
  if (!b) return Object.assign(out, {traits: [], textes: []});
  const marge = 50, w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]);
  const e = Math.min(1, (PAGE_L - 2 * marge) / w, (PAGE_H - 2 * marge) / h);
  const dx = marge - b[0] * e + (PAGE_L - 2 * marge - w * e) / 2, dy = marge - b[1] * e;
  out.traits = (page.traits || []).filter(t => t.p && t.p.length >= 3).map(t => Object.assign({}, t, {e: (t.e || 3) * e, p: t.p.map((v, i) => i % 3 === 2 ? v : Math.round((v * e + (i % 3 === 0 ? dx : dy)) * 10) / 10)}));
  out.textes = (page.textes || []).map(t => Object.assign({}, t, {x: t.x * e + dx, y: t.y * e + dy, w: (t.w || 420) * e, s: (t.s || 28) * e}));
  return out;
}

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
  if (f === "canevas") {
    ctx.fillStyle = pc.ligne;
    const r = Math.max(1, 2.2 * k);
    for (let y = 40; y < page.h; y += 40) for (let x = 40; x < PAGE_L; x += 40) { ctx.beginPath(); ctx.arc(x * k, y * k, r, 0, 7); ctx.fill(); }
  } else if (f === "ligne") {
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
/* tirets et pointillés (v29/v27) : le motif est réparti régulièrement le long du trait et ajusté pour que le trait commence et finisse
   sur un tiret (ou un point). Même calcul sur le PC (motif_trait) : mêmes tirets, mêmes points, à l'écran comme dans les PDF.
   Renvoie {tirets: [[x, y, x, y…], …]} ou {points: [[x, y], …], r} en unités de page. */
function motifTrait(p, e, d) {
  const n = p.length / 3, L = [0];
  for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(p[3 * i] - p[3 * i - 3], p[3 * i + 1] - p[3 * i - 2]));
  const total = L[n - 1];
  const pt = (s) => {                                     // point à l'abscisse curviligne s (recherche par dichotomie)
    let a = 0, b = n - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (L[m] <= s) a = m; else b = m; }
    const t = L[b] > L[a] ? (s - L[a]) / (L[b] - L[a]) : 0;
    return [p[3 * a] + (p[3 * b] - p[3 * a]) * t, p[3 * a + 1] + (p[3 * b + 1] - p[3 * a + 1]) * t, a, b];
  };
  if (d === "p") {
    let pas = Math.max(e * 2.4, e + 4.5);
    const nb = Math.max(1, Math.round(total / pas)); pas = total / nb;
    const points = [];
    for (let j = 0; j <= nb; j++) { const q = pt(Math.min(total, j * pas)); points.push([q[0], q[1]]); }
    return {points, r: Math.max(.9, e * .62)};
  }
  let a = Math.max(Math.max(e * 3, 8) - e, .5), g = Math.max(e * 2, 5) + e;   // longueurs tracées (les bouts ronds ajoutent e/2 de chaque côté)
  const nb = Math.max(1, Math.round((total + g) / (a + g))), f = (total + g) / (nb * (a + g));
  a *= f; g *= f;
  const tirets = [];
  for (let j = 0; j < nb; j++) {
    const s0 = j * (a + g), s1 = Math.min(total, s0 + a), q0 = pt(s0), q1 = pt(s1), l = [q0[0], q0[1]];
    for (let i = q0[3]; i <= q1[2]; i++) if (L[i] > s0 && L[i] < s1) l.push(p[3 * i], p[3 * i + 1]);
    l.push(q1[0], q1[1]);
    tirets.push(l);
  }
  return {tirets};
}
/* aperçu d'un style de trait (le vrai rendu, sur une petite vague) */
function apercuTrait(d, e) {
  const W = 96, H = 26, dpr = Math.min(2, window.devicePixelRatio || 1), cv = el("canvas.trait-apercu-cv", {width: W * dpr, height: H * dpr, style: {width: W + "px", height: H + "px"}});
  const p = []; for (let i = 0; i <= 40; i++) { const x = 6 + i * 2.1; p.push(x, 13 + Math.sin(i / 40 * Math.PI * 2) * 6, 50); }
  const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
  tracer(ctx, {c: T.ACCENT, e, k: "b", d: d || undefined, p}, 1, T.ACCENT);
  return cv;
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
  if (tr.k === "c") ctx.globalAlpha = .62;
  const fixe = tr.o || tr.k === "b" || tr.k === "f" || tr.k === "c" || !!tr.d;
  if ((tr.d === "t" || tr.d === "p") && p.length > 3) {         // tirets / pointillés réguliers
    const m = motifTrait(p, tr.e || 3, tr.d);
    if (m.points) { for (const [x, y] of m.points) { ctx.beginPath(); ctx.arc(x * k, y * k, m.r * k, 0, 7); ctx.fill(); } }
    else {
      ctx.lineWidth = ep; ctx.beginPath();
      for (const l of m.tirets) { ctx.moveTo(l[0] * k, l[1] * k); for (let i = 2; i < l.length; i += 2) ctx.lineTo(l[i] * k, l[i + 1] * k); if (l.length === 4 && l[0] === l[2] && l[1] === l[3]) ctx.lineTo(l[0] * k + .01, l[1] * k); }
      ctx.stroke();
    }
  } else if (p.length <= 3) {
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
function hauteurBloc(tx) { return tx.bg ? Math.max(hauteurTexte(tx), (tx.w || 260) * .62) : hauteurTexte(tx); }
const OPACITE_POSTIT = .35;                     // post-it rendu translucide par un appui
function dessinerTexte(ctx, tx, k, encre) {
  const s = (tx.s || 28) * k;
  ctx.save();
  if (tx.bg && tx.tr) ctx.globalAlpha = OPACITE_POSTIT;
  if (tx.bg) {                                            // note adhésive : carré coloré avec une ombre douce
    const m = 14 * k, w = (tx.w || 260) * k, h = hauteurBloc(tx) * k;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.22)"; ctx.shadowBlur = 10 * k; ctx.shadowOffsetY = 4 * k;
    ctx.fillStyle = tx.bg; ctx.fillRect(tx.x * k - m, tx.y * k - m, w + 2 * m, h + 2 * m); ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,.06)"; ctx.fillRect(tx.x * k - m, tx.y * k - m, w + 2 * m, 10 * k);
  }
  ctx.fillStyle = estHex(tx.c) ? tx.c : encre;
  ctx.font = `${Math.round(s)}px ${getComputedStyle(document.documentElement).getPropertyValue("--f-corps")}`;
  ctx.textBaseline = "top";
  lignesTexte(ctx, tx.t, (tx.w || 420) * k).forEach((l, i) => ctx.fillText(l, tx.x * k, tx.y * k + i * s * 1.3));
  ctx.restore();
}
function hauteurTexte(tx) { const n = String(tx.t || "").split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length * (tx.s || 28) * .5 / (tx.w || 420))), 0); return n * (tx.s || 28) * 1.3; }
function dessinerPage(ctx, page, k, pc, sel) {
  if (page.f === "canevas") page = pageCanevasAjustee(page), page.f = "canevas";      // miniatures : le contenu entier, à l'échelle
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
/* forme exacte entre deux points (menu des formes) */
function formeExacte(m, x0, y0, x1, y1) {
  const a = Math.min(x0, x1), b = Math.min(y0, y1), c = Math.max(x0, x1), d = Math.max(y0, y1), r = (v) => Math.round(v * 10) / 10;
  if (m === "ligne") return [r(x0), r(y0), 50, r(x1), r(y1), 50];
  if (m === "rect") return [a, b, 50, c, b, 50, c, d, 50, a, d, 50, a, b, 50].map(r);
  if (m === "triangle") return [(a + c) / 2, b, 50, c, d, 50, a, d, 50, (a + c) / 2, b, 50].map(r);
  const pts = [], cx = (a + c) / 2, cy = (b + d) / 2, rx = (c - a) / 2, ry = (d - b) / 2;
  for (let i = 0; i <= 64; i++) { const t = i / 64 * Math.PI * 2; pts.push(r(cx + rx * Math.cos(t)), r(cy + ry * Math.sin(t)), 50); }
  return pts;
}
/* triangle le plus proche d'un tracé fermé : sommets = point le plus loin du centre, puis le plus loin de lui, puis le plus loin de ce côté */
function triangleDe(p) {
  const n = p.length / 3; let cx = 0, cy = 0;
  for (let i = 0; i < p.length; i += 3) { cx += p[i] / n; cy += p[i + 1] / n; }
  const loin = (fx) => { let best = 0, dm = -1; for (let i = 0; i < p.length; i += 3) { const d = fx(p[i], p[i + 1]); if (d > dm) { dm = d; best = i; } } return [p[best], p[best + 1]]; };
  const A = loin((x, y) => Math.hypot(x - cx, y - cy)), B = loin((x, y) => Math.hypot(x - A[0], y - A[1]));
  const C = loin((x, y) => distSeg(x, y, A[0], A[1], B[0], B[1]));
  let e = 0;
  for (let i = 0; i < p.length; i += 3) e += Math.min(distSeg(p[i], p[i + 1], A[0], A[1], B[0], B[1]), distSeg(p[i], p[i + 1], B[0], B[1], C[0], C[1]), distSeg(p[i], p[i + 1], C[0], C[1], A[0], A[1]));
  return {pts: [A, B, C], e: e / n};
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
  const tri = triangleDe(p), eTri = tri.e / ((rx + ry) / 2) * n;      // même échelle que eEll / eRect (somme des écarts relatifs)
  const pts = [];
  if (eTri < eEll * .8 && eTri < eRect * .8) {
    const [A, B, C] = tri.pts, r = (v) => Math.round(v * 10) / 10;
    return [r(A[0]), r(A[1]), 50, r(B[0]), r(B[1]), 50, r(C[0]), r(C[1]), 50, r(A[0]), r(A[1]), 50];
  }
  if (eEll < eRect) {
    for (let i = 0; i <= 64; i++) { const t = i / 64 * Math.PI * 2; pts.push(Math.round((cx + rx * Math.cos(t)) * 10) / 10, Math.round((cy + ry * Math.sin(t)) * 10) / 10, 50); }
  } else pts.push(a, b, 50, c, b, 50, c, d, 50, a, d, 50, a, b, 50);
  return pts;
}

/* ---------- application « Notes » */
/* retire toute case d'aperçu restée à l'écran (filet de sécurité : appelé à chaque fin de geste, et avant d'en créer une autre) */
function purgerGlisse() {
  document.querySelectorAll(".fantome-glisse").forEach(n => n.remove());
  document.querySelectorAll(".depot-sur").forEach(n => n.classList.remove("depot-sur"));
  if (!(window.app && app.drag && app.drag.moved)) document.body.classList.remove("glisse-en-cours");
}
/* glisser-déposer (doigt, Apple Pencil, souris) : maintenir ~0,35 s (souris : glisser) puis lâcher sur un élément [data-depot].
   L'aperçu est retiré dans tous les cas : dépôt réussi ou refusé, relâchement hors zone, geste interrompu (appel, changement
   d'appli, onglet ou fenêtre, crayon qui quitte l'écran, élément redessiné pendant le geste, touche Échap). */
function glissable(elem, etiquette, deposer) {
  let minuterie = null, x0 = 0, y0 = 0, actif = false, fantome = null, cible = null, id = null, veille = null;
  const globaux = [];
  const ecouter = (o, ev, f, opts) => { o.addEventListener(ev, f, opts); globaux.push([o, ev, f, opts]); };
  const cibleSous = (x, y) => { const s = document.elementFromPoint(x, y), c = s && s.closest("[data-depot]"); return c && c !== elem ? c : null; };
  const placer = (x, y) => {
    if (!fantome) return;
    fantome.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    const n = cibleSous(x, y);
    if (n !== cible) { if (cible) cible.classList.remove("depot-sur"); cible = n; if (cible) cible.classList.add("depot-sur"); }
  };
  const nettoyer = () => {
    clearTimeout(minuterie); minuterie = null; clearInterval(veille); veille = null;
    for (const [o, ev, f, opts] of globaux.splice(0)) o.removeEventListener(ev, f, opts);
    if (actif) { elem._glisse = true; setTimeout(() => { elem._glisse = false; }, 80); }
    try { if (id !== null && elem.hasPointerCapture && elem.hasPointerCapture(id)) elem.releasePointerCapture(id); } catch (e) { /* */ }
    fantome = null; cible = null; actif = false; id = null;
    purgerGlisse();
  };
  // fin du geste vue de la fenêtre : marche même si l'élément a été redessiné ou a perdu la capture du pointeur
  const fin = (e) => {
    if (id !== null && e.pointerId !== undefined && e.pointerId !== id) return;
    const c = actif && e.type === "pointerup" ? (cibleSous(e.clientX, e.clientY) || cible) : null;
    const cle = c ? c.dataset.depot : null;
    nettoyer();
    if (cle) { try { deposer(cle); } catch (er) { Stock.journal("dépôt", er); } }
  };
  const annuler = () => nettoyer();
  const activer = (x, y) => {
    purgerGlisse();
    actif = true;
    fantome = el("div.fantome-glisse", {texte: etiquette()});
    document.body.append(fantome); document.body.classList.add("glisse-en-cours");
    try { elem.setPointerCapture(id); } catch (e) { /* */ }
    ecouter(window, "pointerup", fin, true);
    ecouter(window, "pointercancel", annuler, true);
    ecouter(window, "blur", annuler);
    ecouter(window, "pagehide", annuler);
    ecouter(document, "visibilitychange", () => { if (document.hidden) nettoyer(); });
    ecouter(window, "keydown", (e) => { if (e.key === "Escape") nettoyer(); }, true);
    ecouter(window, "contextmenu", annuler, true);
    ecouter(window, "touchcancel", annuler, true);
    ecouter(elem, "lostpointercapture", () => { if (actif && !document.body.contains(elem)) nettoyer(); });
    ecouter(window, "pointermove", (e) => { if (e.pointerType === "mouse" && e.buttons === 0) nettoyer(); }, true);   // bouton relâché hors de la fenêtre
    veille = setInterval(() => { if (!fantome || !document.body.contains(fantome) || !document.body.contains(elem)) nettoyer(); }, 250);
    placer(x, y);
  };
  elem.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    purgerGlisse();
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
  elem.addEventListener("pointerup", (e) => { if (!actif) { clearTimeout(minuterie); minuterie = null; id = null; } });
  elem.addEventListener("pointercancel", nettoyer);
  elem.addEventListener("touchmove", (e) => { if (actif) e.preventDefault(); }, {passive: false});
  elem.addEventListener("click", (e) => { if (elem._glisse) { e.stopPropagation(); e.preventDefault(); } }, true);
}

function cls(e, c) { e.classList.add(c); return e; }
class PageNotes {
  constructor(app) {
    this.app = app;
    const r = Stock.lire("horaire_notes_ui", {});
    this.filtre = ""; this.q = ""; this.tri = r.tri || "maj"; this.vue = r.vue || "grille";
    this.doc = null;           // id du document ouvert
    this.sale = false;
    this.el = el("div.ecran.ecran-notes2");
    this.ed = null;
    this.modeSel = false;      // sélection de plusieurs documents
    this.selection = new Set();
    this.ancre = null;         // dernier document coché (Maj + clic : sélectionner une plage)
    this.vues = new Map();     // id de note → position de la vue (mémoire de session : une note ne se recentre pas toute seule)
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
    const vue = boutonIcone(this.vue === "grille" ? "liste" : "grille", "", () => { this.vue = this.vue === "grille" ? "liste" : "grille"; this.memoUI(); this.bibliotheque(); }, "ghost"); vue.classList.add("nb-vue");
    this.titreFiltre = el("h1.page-h1");
    main.append(this.barreSync());
    main.append(el("header.nb-tete", null, this.titreFiltre, el("span.espace"),
      el("div.nt-recherche-zone.nb-rech", null, icone("recherche", 18), this.recherche), tri, vue,
      cls(boutonIcone("coche", this.modeSel ? "Terminé" : "Sélectionner", () => this.basculerSelection(), this.modeSel ? "primary" : "ghost"), "nb-selectionner"),
      (this.app.presseNotes || []).length ? cls(boutonIcone("coller", `Coller (${this.app.presseNotes.length})`, () => this.coller(), "ghost"), "nb-coller") : null,
      cls(boutonIcone("exporter", "Importer", () => this.importer(), "ghost"), "nb-importer"),
      cls(this.boutonVocauxDossier(), "nb-vocaux"),
      cls(boutonIcone("plus", "Nouveau", () => new NouveauDocument(this).montrer(), "primary"), "nb-nouveau")));
    this.barreSel = this.modeSel ? el("div.carte.nb-selbar") : null;
    if (this.barreSel) main.append(this.barreSel);
    this.zoneDocs = el("div.nb-docs" + (this.vue === "liste" ? ".liste-docs" : "") + (this.modeSel ? ".en-selection" : ""));
    main.append(this.zoneDocs);
    this.grille();
  }

  /* ----- synchronisation des notes : automatique (toutes) ou manuelle (interrupteur par note) */
  barreSync() {
    const app = this.app, r = app.reglages, mode = modeNotes(r), force = r.fb_notes_manuel === true;
    const poser = (v) => { if (force && v === "auto") { Notifs.bulle("Le réglage « Notes en synchronisation manuelle par défaut » (Économie Firebase) garde le mode manuel sur cet appareil."); return; }
      app.donnees.reglages.notes_sync = v; app.sauver(); this.bibliotheque(); };
    const nbLoc = (app.donnees.notes || []).filter(n => noteLocale(r, n.id)).length;
    return el("div.nb-sync", null, el("span.nb-sync-lbl", null, icone("transferts", 16), el("span", {texte: "Synchronisation"})),
      el("div.seg", null, petit("Automatique", () => poser("auto"), mode === "auto" ? "tab_on" : "tab"), petit("Manuelle", () => poser("manuel"), mode === "manuel" ? "tab_on" : "tab")),
      el("span.petit.muted.nb-sync-aide", {texte: mode === "auto" ? "Toutes les notes sont synchronisées." : `Touche « Synchronisée » sur une note pour la garder sur cet appareil.${nbLoc ? ` ${nbLoc} note${nbLoc > 1 ? "s" : ""} sur cet appareil seulement.` : ""}`}));
  }
  basculerSyncNote(n) {
    if (n.sync === 0) { this.changerSyncNote(n, true); return; }
    const app = this.app, r = app.donnees.reglages, l = Array.isArray(r.notes_locales) ? r.notes_locales.slice() : [];
    const i = l.indexOf(n.id);
    if (i >= 0) l.splice(i, 1); else l.push(n.id);
    r.notes_locales = l;
    app.enregistrerLocal();
    if (i >= 0) app.sync.localChange();                  // de nouveau synchronisée : envoyée tout de suite
    Notifs.bulle(i >= 0 ? `« ${n.titre || "Sans titre"} » est synchronisée.` : `« ${n.titre || "Sans titre"} » reste sur cet appareil.`);
    this.bibliotheque();
  }

  /* choix « Synchroniser cette note » changé plus tard (options de la note, interrupteur de la carte) */
  changerSyncNote(n, oui) {
    const app = this.app, avant = !noteHorsSync(app, n.id);
    poserSyncNote(app, n, oui);
    app.sauver();
    if (oui && !avant) app.sync.localChange();             // de nouveau synchronisée : envoyée tout de suite
    if (oui !== avant) Notifs.bulle(oui ? `« ${n.titre || "Sans titre"} » est synchronisée.` :
      `« ${n.titre || "Sans titre"} » reste sur cet appareil. Une copie déjà envoyée reste sur les autres appareils, sans les modifications suivantes.`);
    this.bibliotheque();
  }

  /* ----- sélection de plusieurs documents (supprimer, dupliquer, copier, déplacer, matière, favori, exporter) */
  basculerSelection(actif) {
    this.modeSel = actif === undefined ? !this.modeSel : actif;
    if (!this.modeSel) { this.selection.clear(); this.ancre = null; }
    this.bibliotheque();
  }
  selectionnes() { return this.filtrees().filter(n => this.selection.has(n.id)); }
  clicCarte(n, e) {
    const plage = e && e.shiftKey && this.ancre, ajout = e && (e.metaKey || e.ctrlKey);
    if (!this.modeSel && !plage && !ajout) return this.ouvrir(n.id);
    if (plage) {
      const docs = this.filtrees(), a = docs.findIndex(x => x.id === this.ancre), b = docs.findIndex(x => x.id === n.id);
      if (a >= 0 && b >= 0) for (const x of docs.slice(Math.min(a, b), Math.max(a, b) + 1)) this.selection.add(x.id);
    } else if (this.selection.has(n.id)) this.selection.delete(n.id);
    else this.selection.add(n.id);
    this.ancre = n.id;
    if (!this.modeSel) { this.modeSel = true; this.bibliotheque(); return; }
    this.majSelection();
  }
  majSelection() {
    for (const [id, c] of this.cartes || []) {
      const on = this.selection.has(id);
      c.classList.toggle("choisi", on);
      c.setAttribute("aria-selected", String(on));
    }
    const b = this.barreSel;
    if (!b) return;
    const l = this.selectionnes(), k = l.length, docs = this.filtrees(), tous = docs.length > 0 && k === docs.length;
    const fav = k && l.every(n => n.epingle);
    b.innerHTML = "";
    const act = (ico, texte, f, style = "ghost") => { const x = boutonIcone(ico, texte, f, style); x.disabled = !k; return x; };
    b.append(el("b.nb-selcompte", {texte: k ? `${k} sélectionné${k > 1 ? "s" : ""}` : "Touche des documents pour les sélectionner"}),
      petit(tous ? "Tout désélectionner" : "Tout sélectionner", () => this.toutSelectionner(!tous), "ghost"),
      el("span.espace"),
      act("page-plus", "Dupliquer", () => this.dupliquerSelection()),
      act("pages", "Copier", () => this.copierSelection()),
      act("dossier", "Déplacer…", () => this.deplacerSelection()),
      act("livre", "Matière…", () => this.matiereSelection()),
      act("etoile", fav ? "Retirer des favoris" : "Favori", () => this.favoriSelection(!fav)),
      act("exporter", "Exporter…", () => this.exporterSelection()),
      act("corbeille", "Supprimer", () => this.supprimerSelection(), "danger"));
  }
  toutSelectionner(oui) {
    this.selection.clear();
    if (oui) for (const n of this.filtrees()) this.selection.add(n.id);
    this.majSelection();
  }
  finAction(msg) {
    this.modeSel = false; this.selection.clear(); this.ancre = null;
    this.app.sauver(); this.bibliotheque();
    if (msg) Notifs.bulle(msg);
  }
  async supprimerSelection() {
    const l = this.selectionnes();
    if (!l.length) return;
    const noms = l.slice(0, 5).map(n => "• " + (n.titre || "Sans titre")).join("\n") + (l.length > 5 ? `\n… et ${l.length - 5} autre${l.length > 6 ? "s" : ""}` : "");
    const ok = await dialogue("Supprimer", `Supprimer ${l.length > 1 ? "ces " + l.length + " documents" : "ce document"} ?\n\n${noms}`,
      [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]]);
    if (!ok) return;
    for (const n of l) this.retirer(n);
    this.finAction(`${l.length} document${l.length > 1 ? "s supprimés" : " supprimé"}`);
  }
  dupliquerSelection() {
    const l = this.selectionnes();
    for (const n of l) this.copieDe(n);
    this.finAction(`${l.length} document${l.length > 1 ? "s dupliqués" : " dupliqué"}`);
  }
  copierSelection() {
    const l = this.selectionnes();
    if (!l.length) return;
    this.app.presseNotes = l.map(n => clone(n));
    this.finAction(`${l.length} document${l.length > 1 ? "s copiés" : " copié"} : ouvre un dossier, puis « Coller »`);
  }
  /* colle les documents copiés dans le dossier affiché (ou hors dossier) : de nouveaux documents, indépendants des originaux */
  coller() {
    const l = this.app.presseNotes || [];
    if (!l.length) return;
    const dossier = this.filtre.startsWith("d:") ? this.filtre.slice(2) : "";
    const notes = this.app.donnees.notes, ajout = [];
    for (const m of l) {
      const c = clone(m);
      c.id = newId(); c.dossier = dossier; c.maj = nowIsoMinutes();
      for (const p of c.pages || []) p.id = newId();
      if (notes.some(x => (x.dossier || "") === dossier && (x.titre || "") === (c.titre || ""))) c.titre = (c.titre || "Sans titre") + " (copie)";
      ajout.push(c);
    }
    notes.unshift(...ajout);
    this.finAction(`${ajout.length} document${ajout.length > 1 ? "s collés" : " collé"}`);
  }
  async deplacerSelection() {
    const l = this.selectionnes();
    if (!l.length) return;
    const ds = (this.app.donnees.dossiers || []).slice().sort((x, y) => x.nom.localeCompare(y.nom, "fr"));
    const commun = l.every(n => n.dossier === l[0].dossier) ? l[0].dossier || "" : null;
    const v = await choisirOption("Déplacer", `${l.length} document${l.length > 1 ? "s" : ""}`, "Vers le dossier",
      [["", "Aucun dossier"]].concat(ds.map(d => [d.id, d.nom])), commun ?? "");
    if (v === null) return;
    for (const n of l) n.dossier = v;
    this.finAction(`${l.length} document${l.length > 1 ? "s déplacés" : " déplacé"}`);
  }
  async matiereSelection() {
    const l = this.selectionnes();
    if (!l.length) return;
    const commun = l.every(n => n.cours === l[0].cours) && CATS[l[0].cours] ? l[0].cours : "";
    const v = await choisirOption("Matière", `${l.length} document${l.length > 1 ? "s" : ""}`, "Matière",
      [["", "Sans matière"]].concat(Object.keys(CATS).map(k => [k, CATS[k][1]])), commun);
    if (v === null) return;
    for (const n of l) n.cours = v;
    this.finAction(`Matière changée pour ${l.length} document${l.length > 1 ? "s" : ""}`);
  }
  favoriSelection(oui) {
    const l = this.selectionnes();
    for (const n of l) n.epingle = oui;
    this.finAction(oui ? `${l.length} document${l.length > 1 ? "s ajoutés" : " ajouté"} aux favoris` : `${l.length} document${l.length > 1 ? "s retirés" : " retiré"} des favoris`);
  }
  exporterSelection() {
    const l = this.selectionnes();
    if (l.length) new ExportPlusieurs(l).montrer();
  }
  /* glisser plusieurs documents sélectionnés sur un dossier */
  rangerSelection(cle) {
    const l = this.selectionnes();
    if (cle === "racine") for (const n of l) n.dossier = ""; else if (cle && cle.startsWith("d:")) for (const n of l) n.dossier = cle.slice(2); else return;
    this.finAction(`${l.length} document${l.length > 1 ? "s rangés" : " rangé"}`);
  }
  /* clavier (iPad avec clavier, souris) : ⌘/Ctrl + A, C, V, D ; Suppr ; Échap */
  clavier(e) {
    const mod = e.ctrlKey || e.metaKey, k = (e.key || "").toLowerCase();
    if (mod && k === "a") { this.selection.clear(); for (const n of this.filtrees()) this.selection.add(n.id); if (!this.modeSel) { this.modeSel = true; this.bibliotheque(); } else this.majSelection(); return true; }
    if (mod && k === "c" && this.modeSel && this.selection.size) { this.copierSelection(); return true; }
    if (mod && k === "v" && (this.app.presseNotes || []).length) { this.coller(); return true; }
    if (mod && k === "d" && this.modeSel && this.selection.size) { this.dupliquerSelection(); return true; }
    if (!mod && (k === "delete" || k === "backspace") && this.modeSel && this.selection.size) { this.supprimerSelection(); return true; }
    if (!mod && k === "escape" && this.modeSel) { this.basculerSelection(false); return true; }
    return false;
  }
  /* messages vocaux du dossier affiché (ou tous les messages hors dossier) */
  boutonVocauxDossier() {
    const ds = this.app.donnees.dossiers || [], d = this.filtre.startsWith("d:") ? ds.find(x => x.id === this.filtre.slice(2)) : null;
    return boutonVocaux(this.app, d ? {dossier: d.id} : {}, d ? `Dossier : ${d.nom}` : "Tous les messages", () => this.enregistrer());
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
      if (v[2] || nb) item("m:" + k, v[1], nb, iconesJeu() ? visuelCat(k, 16) : pastille(couleur(k), 10));
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
    const visibles = new Set(docs.map(n => n.id));
    for (const id of [...this.selection]) if (!visibles.has(id)) this.selection.delete(id);
    this.cartes = new Map();
    if (!docs.length) {
      z.append(el("div.nt-vide", null, el("span.badge.grand", {style: {"--c": couleurApp("notes")}}, iconePage("notes", 40)),
        el("h2", {texte: this.q ? "Aucun résultat" : "Aucun document ici"}),
        el("div.muted", {texte: IPHONE ? "Crée une note texte. Les cahiers manuscrits se créent sur l'iPad ou le PC." : "Crée un cahier pour écrire à l'Apple Pencil, ou une note texte."}),
        boutonIcone("plus", "Nouveau", () => new NouveauDocument(this).montrer(), "primary")));
      return;
    }
    for (const n of docs) z.append(this.carte(n));
    this.majSelection();
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
    // chevron : replie / déplie le contenu (l'aperçu) sans toucher au document ; il ne déclenche ni l'ouverture ni le glisser-déposer
    const repliee = this.estRepliee(n.id);
    const chev = el("button.doc-chev", {type: "button", title: repliee ? "Déplier le contenu" : "Replier le contenu", "aria-expanded": String(!repliee),
      "aria-label": repliee ? "Déplier le contenu" : "Replier le contenu"}, icone("bas", 18));
    for (const ev of ["pointerdown", "pointerup", "touchstart", "mousedown"]) chev.addEventListener(ev, (e) => e.stopPropagation());
    chev.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); this.basculerRepli(n, c, chev); });
    chev.addEventListener("contextmenu", (e) => { e.stopPropagation(); e.preventDefault(); });
    const surIpad = IPHONE && n.type === "cahier";       // cahier manuscrit : visible sur iPhone, mais il s'ouvre sur l'iPad ou le PC
    let bSync = null;
    if (modeNotes(this.app.reglages) === "manuel" || n.sync === 0) {
      const loc = noteHorsSync(this.app, n.id);
      bSync = el("button.doc-sync" + (loc ? ".local" : ""), {type: "button", role: "switch", "aria-checked": String(!loc),
        title: loc ? "Non synchronisée : reste sur cet appareil (touche pour la synchroniser)" : "Synchronisée (touche pour la garder sur cet appareil)"},
        el("span.doc-sync-pt"), el("span", {texte: loc ? "Sur cet appareil" : "Synchronisée"}));
      for (const ev of ["pointerdown", "pointerup", "touchstart", "mousedown"]) bSync.addEventListener(ev, (e) => e.stopPropagation());
      bSync.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); this.basculerSyncNote(n); });
    }
    const c = el("div.doc" + (repliee ? ".repliee" : "") + (surIpad ? ".sur-ipad" : ""), {onclick: (e) => this.clicCarte(n, e)}, el("div.doc-contenu", null, vignette),
      el("div.doc-info", null,
        el("div.doc-titre", null, chev, n.epingle ? el("span.nt-epi", null, icone("etoile", 13)) : null, el("b", {texte: n.titre || "Sans titre"})),
        el("div.doc-sous", null, pastille(col, 7), el("span", {texte: [n.type === "cahier" ? `${n.pages.length} page${n.pages.length > 1 ? "s" : ""}` : "Texte", d ? dateCourte(d) : "", surIpad ? "iPad / PC" : ""].filter(Boolean).join(" · ")})), bSync),
      plus);
    if (this.modeSel) c.append(el("span.doc-coche", {"aria-hidden": "true"}, icone("coche", 16)));
    this.cartes.set(n.id, c);
    const groupe = () => this.modeSel && this.selection.has(n.id) && this.selection.size > 1;
    glissable(c, () => groupe() ? `${this.selection.size} documents` : n.titre || "Sans titre", (cle) => groupe() ? this.rangerSelection(cle) : this.rangerNote(n, cle));
    c.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!c._glisse && !document.body.classList.contains("glisse-en-cours")) new InfosDocument(this, n).montrer(); });
    return c;
  }
  estRepliee(id) { const l = this.app.reglages.notes_repliees; return Array.isArray(l) && l.includes(id); }
  /* l'état replié / déplié de chaque document est un réglage propre à l'appareil (REG_LOCAUX), gardé après un redémarrage */
  basculerRepli(n, c, chev) {
    const reg = this.app.reglages, l = Array.isArray(reg.notes_repliees) ? reg.notes_repliees.slice() : [];
    const etait = l.includes(n.id);
    reg.notes_repliees = etait ? l.filter(x => x !== n.id) : l.concat(n.id);
    this.app.enregistrerLocal();
    c.classList.toggle("repliee", !etait);
    const t = etait ? "Replier le contenu" : "Déplier le contenu";
    chev.title = t; chev.setAttribute("aria-label", t); chev.setAttribute("aria-expanded", String(etait));
  }
  /* iPhone : seuls les fichiers texte deviennent des notes (un PDF ou une image deviendrait un cahier, qui ne s'ouvre pas ici) */
  importerTexteIphone(cible) {
    const inp = el("input", {type: "file", multiple: true, accept: ".txt,text/plain", style: {display: "none"}});
    inp.addEventListener("change", async () => {
      const fichiers = Array.from(inp.files || []); inp.remove();
      if (!fichiers.length) return;
      const textes = fichiers.filter(f => /\.txt$/i.test(f.name)), autres = fichiers.filter(f => !/\.txt$/i.test(f.name));
      try {
        const b = textes.length ? await importerDocuments(this.app, textes, null, cible) : {notes: 0, erreurs: []};
        const lignes = [];
        if (b.notes) lignes.push(`${b.notes} note${b.notes > 1 ? "s" : ""} importée${b.notes > 1 ? "s" : ""}.`);
        const err = (b.erreurs || []).concat(autres.map(f => f.name + " : sur l'iPhone, seuls les fichiers TXT s'importent (les PDF et images deviennent des cahiers : importe-les sur l'iPad ou le PC)."));
        if (err.length) lignes.push("Problèmes :\n" + err.slice(0, 8).join("\n"));
        this.bibliotheque();
        informer("Importation", lignes.join("\n\n") || "Rien à importer.");
      } catch (e) { Stock.journal("importation", e); informer("Importation", "Erreur : " + (e && e.message || e)); }
    });
    document.body.append(inp);
    inp.click();
  }
  /* importer des documents : dans le dossier affiché (ou à la racine), ou dans un fichier précis (cible = {note}) */
  importer(cible) {
    cible = cible || {dossier: this.filtre.startsWith("d:") ? this.filtre.slice(2) : ""};
    const dansFichier = !!cible.note;
    if (IPHONE && !dansFichier) return this.importerTexteIphone(cible);
    const inp = el("input", {type: "file", multiple: true, accept: dansFichier ? FORMATS_DOCUMENT : ".pdf,.zip,.json,.goodnotes,.txt,.jpg,.jpeg,.png,application/pdf,application/zip,application/json,application/octet-stream,text/plain,image/jpeg,image/png", style: {display: "none"}});
    inp.addEventListener("change", async () => {
      const fs = Array.from(inp.files || []); inp.remove();
      if (!fs.length) return;
      const dossier = cible.dossier ? (this.app.donnees.dossiers.find(d => d.id === cible.dossier) || {}).nom : "";
      const m = new Modal("Importation", dansFichier ? `Les pages sont ajoutées à « ${cible.note.titre || "Sans titre"} ». PDF, images (JPG, PNG) et texte (TXT), ${moTexte(TAILLE_MAX_IMPORT)} au plus par document.`
        : (dossier ? `Dans le dossier « ${dossier} ». ` : "") + "Les PDF et les images deviennent des cahiers où tu peux écrire par-dessus, les fichiers TXT des notes texte ; les fichiers GoodNotes gardent leurs traits modifiables.");
      const barre = el("div.import-barre", null, el("span")), txt = el("p.petit.muted", {texte: "Lecture des fichiers…"});
      m.carte.append(barre, txt);
      m.clicVoile = () => {};
      m.montrer();
      try {
        const progres = (i, n, nom) => { barre.firstChild.style.width = (n ? 100 * i / n : 0) + "%"; txt.textContent = nom ? `${i + 1} / ${n} — ${nom}` : "Terminé."; };
        const b = dansFichier ? await importerDocuments(this.app, fs, progres, cible) : await importerFichiers(this.app, fs, progres, cible);
        m.fermer();
        const lignes = [];
        if (b.pages) lignes.push(`${b.pages} page${b.pages > 1 ? "s" : ""} ajoutée${b.pages > 1 ? "s" : ""} à « ${cible.note.titre || "Sans titre"} ».`);
        if (b.notes) lignes.push(`${b.notes} document${b.notes > 1 ? "s" : ""} importé${b.notes > 1 ? "s" : ""}.`);
        if (b.modeles) lignes.push(`${b.modeles} modèle${b.modeles > 1 ? "s" : ""} de page ajouté${b.modeles > 1 ? "s" : ""}.`);
        if (this.app.sync.configuree() && b.notes) lignes.push("Les PDF partent vers l'autre appareil en arrière-plan (garde l'appli ouverte quelques minutes).");
        if (b.erreurs.length) lignes.push("Problèmes :\n" + b.erreurs.slice(0, 8).join("\n"));
        if (dansFichier && this.doc === cible.note.id) this.ouvrir(cible.note.id); else this.bibliotheque();
        informer("Importation", lignes.join("\n\n") || "Rien à importer.");
      } catch (e) { m.fermer(); Stock.journal("importation", e); informer("Importation", "Erreur : " + (e && e.message || e)); }
    });
    document.body.append(inp);
    inp.click();
  }
  creer(opts) {
    if (IPHONE && opts && opts.type === "cahier") { messageCahierIphone(); return null; }
    const n = normaliserNote(Object.assign({id: newId(), maj: nowIsoMinutes(), cours: this.filtre.startsWith("m:") ? this.filtre.slice(2) : "",
      dossier: this.filtre.startsWith("d:") ? this.filtre.slice(2) : "", epingle: this.filtre === "*"}, opts));
    if (n.type === "cahier") n.pages = [pageVide(n.fond)];
    const choix = n.sync;                                  // v31/v29 : choix de la fenêtre « Nouveau » (true / false) ; absent = règle habituelle
    delete n.sync;
    if (choix === false) n.sync = 0;
    this.app.donnees.notes.unshift(n);
    if (choix === undefined) nouvelleNote(this.app, n.id);
    this.app.sauver();
    this.ouvrir(n.id);
    return n;
  }
  onglets() {
    const reg = this.app.reglages, ids = new Set(this.app.donnees.notes.map(n => n.id));
    let l = Array.isArray(reg.onglets_notes) ? reg.onglets_notes.filter(x => ids.has(x)) : [];
    if (l.length !== (reg.onglets_notes || []).length) reg.onglets_notes = l;
    return l;
  }
  barreOnglets() {
    const l = this.onglets();
    if (l.length < 2) return null;
    const b = el("div.doc-onglets");
    for (const id of l) {
      const n = this.note(id);
      b.append(el("div.onglet" + (id === this.doc ? ".on" : ""), {title: n.titre || "Sans titre", onclick: () => { if (id !== this.doc) this.changerDoc(id); }},
        el("span.onglet-titre", {texte: n.titre || "Sans titre"}),
        el("button.onglet-x", {type: "button", title: "Fermer l'onglet", onclick: (e) => { e.stopPropagation(); this.fermerOnglet(id); }}, "✕")));
    }
    return b;
  }
  changerDoc(id) { if (this.ed) { this.ed.enregistrer(); if (this.ed.detruire) this.ed.detruire(); } this.ouvrir(id); }
  fermerOnglet(id) {
    const l = this.onglets().filter(x => x !== id);
    this.app.reglages.onglets_notes = l; this.app.sauver();
    if (id !== this.doc) { const b = this.el.querySelector(".doc-onglets"), nb = this.barreOnglets(); if (b) { if (nb) b.replaceWith(nb); else b.remove(); } return; }
    if (l.length) this.changerDoc(l[l.length - 1]); else this.fermerDoc();
  }
  ouvrir(id) {
    const n = this.note(id);
    if (!n) return this.bibliotheque();
    if (IPHONE && n.type === "cahier") {                 // les cahiers manuscrits restent sur l'iPad et le PC
      if (this.doc === id) { this.ed = null; this.doc = null; }
      if (!this.el.querySelector(".nb-docs")) this.bibliotheque();
      messageCahierIphone();
      return;
    }
    this.doc = id;
    const l = this.onglets().filter(x => x !== id);
    const i = (this.app.reglages.onglets_notes || []).indexOf(id);
    if (i >= 0) l.splice(Math.min(i, l.length), 0, id); else l.push(id);
    this.app.reglages.onglets_notes = l.slice(-MAX_ONGLETS);
    const z = this.el; z.innerHTML = ""; z.classList.add("doc-ouvert");
    this.ed = n.type === "cahier" ? new EditeurCahier(this, n) : new EditeurTexte(this, n);
    const ong = this.barreOnglets();
    if (ong) z.append(ong);
    z.classList.toggle("menu-notes-reduit", menuNotesReduit(this.app));
    z.append(this.ed.el);
    this.ed.apresAffichage && this.ed.apresAffichage();
  }
  fermerDoc() { if (this.ed) this.ed.enregistrer(); if (this.ed && this.ed.detruire) this.ed.detruire(); this.bibliotheque(); }
  supprimer(n) {
    return dialogue("Supprimer", `Supprimer « ${n.titre || "Sans titre"} » ?`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]]).then(ok => {
      if (!ok) return false;
      this.retirer(n);
      this.app.sauver();
      this.bibliotheque();
      return true;
    });
  }
  /* retire un document (sans demander) ; le PDF d'origine part s'il ne sert plus, ni à un document ni à des documents copiés */
  retirer(n) {
    const l = this.app.donnees.notes, i = l.indexOf(n);
    enterrerNote(this.app, n.id);                           // suppression voulue : trace synchronisée, elle part vers le serveur
    if (i >= 0) l.splice(i, 1);
    const ids = new Set((n.pages || []).filter(p => p.pdf).map(p => p.pdf[0]));
    const encore = l.concat(this.app.presseNotes || []);
    for (const id of ids) {
      if (encore.some(x => (x.pages || []).some(p => p.pdf && p.pdf[0] === id))) continue;
      this.app.donnees.fichiers = (this.app.donnees.fichiers || []).filter(f => f.id !== id);
      Fichiers.supprimer(id);
    }
    this.selection.delete(n.id);
    if (this.doc === n.id) { this.ed = null; this.doc = null; this.sale = false; }
  }
  copieDe(n) {
    const c = clone(n); c.id = newId(); c.titre = (n.titre || "Sans titre") + " (copie)"; c.maj = nowIsoMinutes();
    for (const p of c.pages || []) p.id = newId();
    const l = this.app.donnees.notes; l.splice(l.indexOf(n) + 1, 0, c);
    return c;
  }
  dupliquer(n) { this.copieDe(n); this.app.sauver(); this.bibliotheque(); }
}

/* ---------- nouveau document / infos / dossier */
class NouveauDocument extends Modal {
  constructor(pn) {
    super("Nouveau", IPHONE ? "Une note texte (les cahiers manuscrits se créent sur l'iPad ou le PC)." : "Un cahier pour écrire à l'Apple Pencil, ou une note texte.");
    this.pn = pn;
    this.type = IPHONE ? "texte" : "cahier"; this.fond = "ligne"; this.papier = "blanc"; this.couv = COUVERTURES[Math.floor(Math.random() * COUVERTURES.length)];
    this.titre = entree("", {placeholder: "Titre (facultatif)"});
    // v31/v29 : « Synchroniser cette note » (oui par défaut ; non si « Notes en synchronisation manuelle par défaut » est activé ici)
    this.sync = caseACocher(pn.app.reglages.fb_notes_manuel !== true, () => this.aideSync(), "Synchroniser cette note");
    this.syncAide = el("div.petit.muted.nd-sync-aide");
    this.zone = el("div");
    this.carte.append(this.zone);
    this.barre([boutonIcone("dossier", "Nouveau dossier", () => { this.fermer(); new EditeurDossier(pn, null).montrer(); }, "ghost")],
      [bouton("Annuler", () => this.fermer()), bouton("Créer", () => this.valider(), "primary")]);
    this.dessiner();
  }
  dessiner() {
    const z = this.zone; z.innerHTML = "";
    const types = el("div.choix-types");
    for (const [v, t, d] of (IPHONE ? [["texte", "Note texte", "Les cahiers manuscrits se créent sur l'iPad ou le PC"]] : [["cahier", "Cahier", "Pages à écrire à la main"], ["texte", "Note texte", "Clavier ou Scribble"]])) {
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
    z.append(el("div.champ.nd-sync", null, this.sync, this.syncAide));
    this.aideSync();
  }
  aideSync() {
    this.syncAide.textContent = this.sync.valeur() ? "Envoyée sur tes autres appareils." : "Reste sur cet appareil : jamais envoyée à Firebase.";
  }
  valider() {
    const titre = this.titre.value.trim() || (this.type === "cahier" ? "Cahier sans titre" : "");
    this.fermer();
    this.pn.creer({type: this.type, titre, fond: this.fond, papier: this.papier, couverture: this.type === "cahier" ? this.couv : "", sync: this.sync.valeur()});
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
    this.sync = caseACocher(!noteHorsSync(pn.app, n.id), null, "Synchroniser cette note");
    this.carte.append(champ("Titre", this.titre), el("div.grille2", null, champ("Matière", this.cours), champ("Dossier", this.dossier)), el("div.champ", null, this.fav),
      el("div.champ", null, this.sync));
    this.zone = el("div"); this.carte.append(this.zone);
    this.dessiner();
    this.barre([bouton("Supprimer", () => { this.fermer(); pn.supprimer(n); }, "danger"), bouton("Dupliquer", () => { this.fermer(); pn.dupliquer(n); }),
      bouton("Exporter", () => { this.fermer(); new ExportNote(n, null).montrer(); }), bouton("Importer…", () => { this.fermer(); pn.importer({note: n}); })],
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
    const oui = this.sync.valeur();
    this.fermer();
    if (oui !== !noteHorsSync(this.pn.app, n.id)) { this.pn.changerSyncNote(n, oui); if (this.pn.doc === n.id && this.pn.ed) this.pn.ouvrir(n.id); return; }
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
    this.barre(d ? [bouton("Supprimer", () => this.supprimer(), "danger"), bouton("Importer…", () => { this.fermer(); pn.importer({dossier: d.id}); })] : [], [bouton("Annuler", () => this.fermer()), bouton(d ? "Enregistrer" : "Créer", () => this.valider(), "primary")]);
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
/* ---------- menu du haut des notes réduit (v33/v31) : réglage local « menu_notes_reduit » (REG_LOCAUX, jamais synchronisé).
   Réduit : l'en-tête du document (retour, miniatures, titre, page n / m, état, zoom, Page, micro, exporter, réglages, favori)
   et la barre d'onglets sont masqués ; restent les outils, leurs réglages, Autocollants, annuler / rétablir et ce bouton.
   La bascule n'a lieu qu'entre deux gestes ; la page reste à la même place à l'écran (défilement compensé). */
function menuNotesReduit(app) { return !!(app && app.reglages && app.reglages.menu_notes_reduit === true); }
function boutonMenuNotes(ed) {
  const b = el("button.cah-outil.cah-menu-bascule", {type: "button"});
  const maj = () => {
    const r = menuNotesReduit(ed.pn.app);
    b.title = r ? "Rétablir le menu" : "Réduire le menu";
    b.setAttribute("aria-label", b.title); b.setAttribute("aria-pressed", String(r));
    b.innerHTML = ""; b.append(icone(r ? "bas" : "haut", 20));
  };
  b.addEventListener("click", () => basculerMenuNotes(ed, maj));
  maj();
  return b;
}
function basculerMenuNotes(ed, maj, essais = 0) {
  const occupe = ed.geste || ed.pince || ed.acGeste || ed.selGeste || (ed.actif && Date.now() - ed.actif < 250);
  if (occupe && essais < 40) { setTimeout(() => basculerMenuNotes(ed, maj, essais + 1), 150); return; }   // jamais pendant un geste
  if (ed.texteOuvert) ed.texteOuvert.blur();            // zone de texte du cahier : la frappe se termine d'abord
  const app = ed.pn.app, r = !menuNotesReduit(app), z = ed.pagesZone, t0 = z ? z.getBoundingClientRect().top : 0;
  app.reglages.menu_notes_reduit = r;
  app.enregistrerLocal();
  ed.el.classList.toggle("menu-reduit", r);
  ed.pn.el.classList.toggle("menu-notes-reduit", r);
  if (z) { const t1 = z.getBoundingClientRect().top; if (t1 !== t0) z.scrollTop += t1 - t0; }
  maj();
}

class EditeurTexte {
  constructor(pn, n) {
    this.pn = pn; this.n = n;
    const pc = couleursPapier(n.papier);
    this.titre = el("input.nt-titre", {type: "text", value: n.titre || "", placeholder: "Titre", oninput: () => this.modifie()});
    this.texte = el("textarea.nt-texte", {placeholder: "Écris ici… (Scribble : tu peux aussi écrire au crayon dans ce champ)", oninput: () => this.modifie()});
    this.texte.value = n.texte || "";
    this.etat = el("span.mono.muted.nt-etat", {texte: ""});
    this.el = el("div.doc-vue" + (menuNotesReduit(pn.app) ? ".menu-reduit" : ""), null,
      el("header.doc-barre", null, boutonIcone("retour", "Bibliothèque", () => pn.fermerDoc(), "tab"), el("span.espace"), this.etat,
        boutonIcone("etoile", "", () => { n.epingle = !n.epingle; this.modifie(true); this.majFav(); }, "ghost"),
        boutonVocaux(pn.app, {note: n.id}, `Note : ${n.titre || "Sans titre"}`, () => this.enregistrer()),
        boutonIcone("reglages", "", () => { this.enregistrer(); new InfosDocument(pn, n).montrer(); }, "ghost"),
        boutonIcone("exporter", "", () => { this.enregistrer(); new ExportNote(n, null).montrer(); }, "ghost")),
      el("div.cah-barre.nt-outils", null, el("div.cah-outils", null, boutonAutocollants(() => this.ajouterAutocollant()), el("span.cah-sep"),
        el("button.cah-outil", {type: "button", title: "Annuler (autocollants)", "aria-label": "Annuler", onclick: () => this.annulerAc()}, icone("annuler", 20)),
        el("button.cah-outil", {type: "button", title: "Rétablir (autocollants)", "aria-label": "Rétablir", onclick: () => this.refaireAc()}, icone("refaire", 20))),
        boutonMenuNotes(this)),
      el("section.carte.doc-texte-ed", {style: {background: pc.fond, color: pc.encre}}, this.titre, el("div.nt-sep"), this.texte));
    // thème Hollow Knight : les notes au papier par défaut prennent l'allure d'un journal ancien
    if (themeHK() && !PAPIER_COUL[n.papier]) {
      const sec = this.el.querySelector(".doc-texte-ed"), d = n.maj ? isoDate(String(n.maj).slice(0, 10)) : null;
      sec.classList.add("journal-hk"); sec.style.background = ""; sec.style.color = "";
      sec.querySelector(".nt-sep").replaceWith(ornementHK(".jr-orn"));
      sec.prepend(el("div.mono.jr-tete", {texte: "JOURNAL" + (d ? " · " + dateCourte(d).toUpperCase() : "")}));
    }
    // autocollants : posés sur la feuille (position relative à la feuille, la même sur tous les appareils)
    this.calque = el("div.ac-calque");
    const feuille = this.el.querySelector(".doc-texte-ed");
    feuille.append(this.calque);
    feuille.addEventListener("pointerdown", () => { if (this.acChoisi) this.choisirAc(null); });
    this.acZones = new Map();
    this.histoAc = []; this.refaitAc = [];
    this.barreAc = el("div.cah-sel.nt-sel", {hidden: true});         // barre flottante de l'autocollant choisi (ne déplace rien)
    this.el.append(this.barreAc);
    this._clavierAc = (e) => { if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "d" && this.acChoisi && this.el.isConnected) { e.preventDefault(); this.dupliquerAc(); } };
    document.addEventListener("keydown", this._clavierAc);
    this.majFav();
    requestAnimationFrame(() => this.majAutocollants());
  }
  async ajouterAutocollant() {
    this.enregistrer();
    const s = await choisirAutocollant(this.pn.app);
    if (!s) return;
    if (!Array.isArray(this.n.autocollants)) this.n.autocollants = [];
    const a = {id: newId(), s, p: "", x: 500 + (alea(161) - 80), y: 420 + (alea(161) - 80), t: AC_TAILLE};
    this.snapAc();
    this.n.autocollants.push(a);
    this.choisirAc(a.id); this.modifie(true); Geos.maj(this.pn.app);
  }
  /* ----- autocollants : choix, duplication, annuler / rétablir (v30/v28) */
  choisirAc(id) {
    this.acChoisi = id;
    this.majAutocollants();
    if (!id) { this.barreAc.hidden = true; return; }
    remplirBarreAc(this.barreAc, {dupliquer: () => this.dupliquerAc(), retirer: () => { const a = (this.n.autocollants || []).find(x => x.id === this.acChoisi); if (a) this.rappelsAc().retirer(a); },
      fermer: () => this.choisirAc(null), tourner: (d) => this.tournerAc(d)});
    this.placerBarreAc();
  }
  /* barre de l'autocollant choisi : en bas si elle ne le cache pas, sinon juste sous lui, sinon juste au-dessus (jamais par-dessus) */
  placerBarreAc() {
    const b = this.barreAc, z = this.acZones.get(this.acChoisi);
    b.classList.remove("pres"); b.style.top = "";
    if (b.hidden || !z) return;
    eviterRecouvrement(b, [z, z.querySelector(".ac-rot")]);
    if (!b.classList.contains("en-haut")) return;
    b.classList.remove("en-haut");
    const c = this.el.getBoundingClientRect(), r = z.getBoundingClientRect(), h = b.offsetHeight, m = 30;
    let top = r.bottom + m - c.top;
    if (top + h > c.height - 8) top = r.top - m - h - c.top;
    if (top < 0) top = Math.max(0, c.height - h - 8);
    b.classList.add("pres"); b.style.top = Math.round(top) + "px";
  }
  dupliquerAc() {
    const a = (this.n.autocollants || []).find(x => x.id === this.acChoisi);
    if (!a) return;
    this.snapAc();
    const c = copieAutocollant(a, 20, [1000, 1000]);
    this.n.autocollants.push(c);
    this.choisirAc(c.id); this.modifie(true);
  }
  /* tourner l'autocollant choisi de d degrés (bouton ↺ / ↻ : pas de 15°) ; une étape d'annulation */
  tournerAc(d) {
    const a = (this.n.autocollants || []).find(x => x.id === this.acChoisi);
    if (!a) return;
    this.snapAc(); poserAngleAc(a, (a.r || 0) + d); this.majAutocollants(); this.modifie(true);
    requestAnimationFrame(() => this.placerBarreAc());
  }
  snapAc() { this.histoAc.push(clone(this.n.autocollants || [])); if (this.histoAc.length > 60) this.histoAc.shift(); this.refaitAc = []; }
  annulerAc() { const h = this.histoAc.pop(); if (!h) return; this.refaitAc.push(clone(this.n.autocollants || [])); this.n.autocollants = h; this.choisirAc(null); this.modifie(true); }
  refaireAc() { const h = this.refaitAc.pop(); if (!h) return; this.histoAc.push(clone(this.n.autocollants || [])); this.n.autocollants = h; this.choisirAc(null); this.modifie(true); }
  majAutocollants() {
    const liste = autocollantsNote(this.n);
    for (const [id, z] of this.acZones) if (!liste.some(a => a.id === id)) { z.remove(); this.acZones.delete(id); }
    for (const a of liste) {
      let z = this.acZones.get(a.id);
      if (!z) { z = zoneAutocollant(a, this.rappelsAc()); z.classList.add("ac-texte"); this.calque.append(z); this.acZones.set(a.id, z); }
      z._ac = a;
      const taille = Math.round(AC_TAILLE_TEXTE * T.TXT * (a.t || AC_TAILLE) / AC_TAILLE);
      z.style.cssText = `left:${a.x / 10}%;top:${a.y / 10}%;width:${taille}px;height:${taille}px;--ac-r:${a.r || 0}deg`;
      z.classList.toggle("choisi", this.acChoisi === a.id);
    }
  }
  rappelsAc() {
    return {
      debut: (g) => { this.acGeste = g; this.snapAc(); g.snap = this.histoAc.length; },
      bouge: (a, g, dx, dy) => {
        const r = this.calque.getBoundingClientRect();
        a.x = Math.round(Math.max(0, Math.min(1000, g.x0 + dx / Math.max(1, r.width) * 1000)) * 10) / 10;
        a.y = Math.round(Math.max(0, Math.min(1000, g.y0 + dy / Math.max(1, r.height) * 1000)) * 10) / 10;
        this.majAutocollants();
      },
      taille: (a, t) => { a.t = t; this.majAutocollants(); },
      rot: (a, r) => { poserAngleAc(a, r); this.majAutocollants(); },
      fin: (a, g, annule) => {
        this.acGeste = null;
        if (g.deplace && annule) { a.x = g.x0; a.y = g.y0; }
        if (g.deplace && !annule) this.modifie(true);
        if (g.deplace && this.acChoisi === a.id) requestAnimationFrame(() => this.placerBarreAc());
        if ((!g.deplace || annule) && this.histoAc.length === g.snap) this.histoAc.pop();     // rien n'a changé : pas d'étape d'annulation
        if (g.taille) { this.majAutocollants(); return; }
        if (!g.deplace) { this.choisirAc(this.acChoisi === a.id ? null : a.id); return; }
        this.majAutocollants();
      },
      retirer: (a) => { this.snapAc(); this.n.autocollants = (this.n.autocollants || []).filter(x => x.id !== a.id); this.choisirAc(null); this.modifie(true); Geos.maj(this.pn.app); },
    };
  }
  detruire() { document.removeEventListener("keydown", this._clavierAc); }
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
    else this.majAutocollants();
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
    this.style = r.style && typeof r.style === "object" ? r.style : {};          // style de trait par outil ("" | "t" | "p")
    this.epPerso = r.epPerso && typeof r.epPerso === "object" ? r.epPerso : {};  // épaisseur réglée au curseur (mm × UNITE_MM)
    this.noteCoul = r.noteCoul || COULEURS_NOTE[0];
    this.laserDelai = [500, 1000, 2000, 4000].includes(r.laserDelai) ? r.laserDelai : 1000;   // durée avant que le trait du laser s'estompe (ms)
    this.formeMode = FORMES_MENU.some(f => f[0] === r.forme) ? r.forme : "auto";
    this.filtreMini = "";
    this.histo = []; this.refait = [];
    this.editees = new Set();   // pages modifiées par l'utilisateur pendant cette ouverture
    this.sel = null;        // {page, traits:Set, textes:Set, boite}
    this.feuilles = new Map();   // id page → {div, cv, ctx, k}
    this.finRendu = Rendu.surPret((id, idx) => {
      for (const f of this.feuilles.values()) if (f.page.pdf && f.page.pdf[0] === id && f.page.pdf[1] === idx && f.alloue) this.peindre(f.page.id);
    });
    this.espace = false;
    this._clavier = (e) => {
      const cible = e.target && e.target.tagName;
      if (e.code !== "Space" || cible === "TEXTAREA" || cible === "INPUT") return;
      this.espace = e.type === "keydown";
      if (e.type === "keydown" && !e.repeat && this.feuilles && [...this.feuilles.values()].some(f => f.canevas)) e.preventDefault();
      this.el.classList.toggle("espace-presse", this.espace);
    };
    document.addEventListener("keydown", this._clavier); document.addEventListener("keyup", this._clavier);
    this._clavierD = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.key.toLowerCase() !== "d" || !this.el || !this.el.isConnected) return;
      const cible = e.target && e.target.tagName; if (cible === "TEXTAREA" || cible === "INPUT") return;
      if (this.acChoisi) { e.preventDefault(); this.dupliquerAc(); } else if (this.sel) { e.preventDefault(); this.dupliquerSel(); }
    };
    document.addEventListener("keydown", this._clavierD);
    this.construire();
  }
  memo() {
    Stock.ecrire("horaire_outils_notes", {outil: this.outil, couleurs: this.couleurs, coul: this.coul, epIdx: this.epIdx, gommePrecise: this.gommePrecise,
      doigt: this.doigt, zoom: this.zoom, miniatures: this.miniatures, style: this.style, epPerso: this.epPerso, noteCoul: this.noteCoul, laserDelai: this.laserDelai, forme: this.formeMode});
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
      boutonVocaux(this.pn.app, {note: n.id}, `Note : ${n.titre || "Sans titre"}`, () => this.enregistrer()),
      boutonIcone("exporter", "", () => { this.enregistrer(); new ExportNote(this.n, this.pageCourante).montrer(); }, "ghost"),
      boutonIcone("reglages", "", () => { this.enregistrer(); new InfosDocument(this.pn, n).montrer(); }, "ghost"));
    this.barreOutils = el("div.cah-outils");
    this.optOutil = el("div.cah-options");
    this.barreSel = el("div.cah-sel", {hidden: true});
    this.pagesZone = el("div.cah-pages");
    // dernière activité (crayon, doigt, souris, molette) : rien ne se réaffiche par-dessus une saisie en cours
    const actif = () => { this.actif = Date.now(); };
    for (const ev of ["pointerdown", "pointermove", "touchstart", "wheel", "keydown"]) this.pagesZone.addEventListener(ev, actif, {passive: true, capture: true});
    this.piste = el("div.cah-piste");
    this.pagesZone.append(this.piste);
    this.mini = el("aside.cah-mini");
    // v33/v31 : bouton « Réduire le menu » au bout de la rangée 1, hors de la partie qui défile (toujours visible)
    this.el = el("div.doc-vue.cahier" + (this.miniatures ? ".avec-mini" : "") + (menuNotesReduit(this.pn.app) ? ".menu-reduit" : ""), null, tete,
      el("div.cah-barre", null, el("div.cah-ligne1", null, this.barreOutils, boutonMenuNotes(this)), this.optOutil),
      el("div.cah-corps", null, this.mini, this.pagesZone, this.barreSel));
    if ((n.texte || "").trim()) this.piste.append(el("details.cah-texte", null, el("summary", {texte: "Texte tapé de cette note"}),
      Object.assign(el("textarea.saisie", {rows: 4, oninput: (e) => { this.n.texte = e.target.value; this.modifie(); }}), {value: n.texte})));
    this.dessinerOutils();
    this.installerPinch();
  }
  apresAffichage() {
    this.construirePages();
    this.dessinerMiniatures();
    this.pagesZone.addEventListener("scroll", () => { if (!this._rafN) this._rafN = requestAnimationFrame(() => { this._rafN = 0; this.majNumero(); this.memoPosition(); }); }, {passive: true});
  }
  detruire() { this.memoPosition(); this.enregistrerVue(); document.removeEventListener("keydown", this._clavierD); document.removeEventListener("keydown", this._clavier); document.removeEventListener("keyup", this._clavier); if (this._rafL) cancelAnimationFrame(this._rafL); if (this._ro) this._ro.disconnect(); if (this._io) this._io.disconnect(); if (this._io2) this._io2.disconnect(); if (this.finRendu) this.finRendu(); }

  /* ----- barre d'outils */
  dessinerOutils() {
    this.pagesZone.classList.toggle("sans-postit", this.outil === "gomme");        // la gomme efface un post-it au lieu de le saisir
    this.pagesZone.classList.toggle("outil-main", this.outil === "main");
    const b = this.barreOutils; b.innerHTML = "";
    for (const [k, t, ico] of OUTILS_NOTES) {
      if (k === "forme") {
        const ic = FORMES_MENU.find(f => f[0] === this.formeMode)[2], bf = el("button.cah-outil.cah-outil-formes" + (this.outil === k ? ".on" : ""),
          {type: "button", title: "Formes (touche encore pour choisir la forme)", "aria-label": "Formes", "aria-haspopup": "menu",
           onclick: () => { if (this.outil === "forme") { this.menuFormes(bf); return; } this.outil = k; this.deselect(); this.memo(); this.dessinerOutils(); }}, icone(ic, 22), el("span.cah-caret"));
        b.append(bf);
        continue;
      }
      b.append(el("button.cah-outil" + (this.outil === k ? ".on" : ""), {type: "button", title: t, "aria-label": t, onclick: () => { this.outil = k; if (k !== "lasso") this.deselect(); this.memo(); this.dessinerOutils(); }}, icone(ico, 22)));
    }
    // autocollants : dans la même section que les outils de dessin (ouvre l'inventaire, puis l'autocollant se pose sur la page)
    b.append(el("span.cah-sep"), boutonOutilAutocollants(() => this.ajouterAutocollant()));
    b.append(el("span.cah-sep"));
    b.append(el("button.cah-outil", {type: "button", title: "Annuler", "aria-label": "Annuler", onclick: () => this.annuler()}, icone("annuler", 20)),
      el("button.cah-outil", {type: "button", title: "Rétablir", "aria-label": "Rétablir", onclick: () => this.refaire()}, icone("refaire", 20)));
    const defile = b.scrollLeft;   // la rangée garde sa position de défilement (rien ne bouge en changeant d'outil)
    requestAnimationFrame(() => { b.scrollLeft = defile; });
    const o = this.optOutil; o.innerHTML = "";
    if (["plume", "bille", "surligneur", "forme", "texte"].includes(this.outil)) {
      this.couleurs.forEach((c, i) => {
        const s = el("span.sw.encre" + (c === this.coul ? ".on" : ""), {style: {background: c || this.pc().encre}, title: "Touche deux fois pour changer cette couleur",
          onclick: () => { if (this.coul === c && i > 0) this.changerCouleur(i); else { this.coul = c; this.memo(); this.dessinerOutils(); if (this.sel) this.recolorer(); } }});
        o.append(s);
      });
      o.append(el("button.sw.sw-plus", {type: "button", title: "Couleur personnalisée", onclick: () => this.changerCouleur(Math.max(1, this.couleurs.indexOf(this.coul)) || 7)}, icone("plus", 14)));
    }
    if (this.outil === "note") {
      COULEURS_NOTE.forEach(c => o.append(el("span.sw" + (c === this.noteCoul ? ".on" : ""), {style: {background: c}, onclick: () => { this.noteCoul = c; this.memo(); this.dessinerOutils(); }})));
      o.append(el("span.petit.muted.cah-aide", {texte: "Touche la page pour coller une note adhésive."}));
    }
    if (this.outil === "laser") {
      o.append(el("span.petit.muted.cah-aide", {texte: "Montre sans écrire : le trait s'estompe tout seul après"}));
      for (const d of [500, 1000, 2000, 4000]) o.append(petit((d / 1000).toString().replace(".", ",") + " s", () => { this.laserDelai = d; this.memo(); this.dessinerOutils(); }, this.laserDelai === d ? "tab_on" : "ghost"));
    }
    if (this.outil === "main") o.append(el("span.petit.muted.cah-aide", {texte: "Glisse pour déplacer le canevas (ou la barre d'espace, le clic du milieu, un doigt)."}));
    if (this.n.pages.some(p => p.f === "canevas")) {
      o.append(el("span.cah-sep"));
      const modes = {points: "Points", grille: "Grille", aucun: "Sans fond"}, cur = this.fondCanevas();
      o.append(petit("Fond : " + modes[cur], () => { const suite = {points: "grille", grille: "aucun", aucun: "points"}[cur]; this.pn.app.reglages.canevas_fond = suite; this.pn.app.enregistrerLocal(); this.dessinerOutils(); for (const f of this.feuilles.values()) if (f.canevas) { f.aDessiner = true; this.peindre(f.page.id); } }, "ghost"),
        petit("Recentrer", () => { for (const f of this.feuilles.values()) if (f.canevas) this.recentrerCanevas(f); }, "ghost"));
    }
    if (EPAISSEURS[this.outil]) {
      o.append(el("span.cah-sep"));
      EPAISSEURS[this.outil].forEach((e, i) => o.append(el("button.cah-ep" + (this.epIdx[this.outil] === i ? ".on" : ""), {type: "button", title: "Épaisseur",
        onclick: () => { this.epIdx[this.outil] = i; this.memo(); this.dessinerOutils(); }}, el("span", {style: {width: Math.min(26, 4 + e * (this.outil === "surligneur" || this.outil === "gomme" ? .55 : 2.2)) + "px", height: Math.min(26, 4 + e * (this.outil === "surligneur" || this.outil === "gomme" ? .55 : 2.2)) + "px"}}))));
      const st = this.style[this.outil] || "", perso = this.epIdx[this.outil] === 3;
      o.append(el("button.cah-ep.cah-trait" + (perso || st ? ".on" : ""), {type: "button", title: "Réglages du trait (style, épaisseur en mm)", onclick: () => this.reglagesTrait()},
        el("span.mono", {texte: (perso ? (Math.round(this.epaisseur() / UNITE_MM * 10) / 10).toString().replace(".", ",") + " mm" : "mm") + (st === "t" ? " ‒ ‒" : st === "p" ? " ···" : "")})));
    }
    if (this.outil === "gomme") {
      o.append(el("span.cah-sep"), petit(this.gommePrecise ? "Gomme précise" : "Trait entier", () => { this.gommePrecise = !this.gommePrecise; this.memo(); this.dessinerOutils(); }, "ghost"));
    }
    if (this.outil === "forme") o.append(el("span.petit.muted.cah-aide", {texte: this.formeMode === "auto" ? "Dessine une ligne, un cercle, un rectangle ou un triangle : il devient parfait." : `${FORMES_MENU.find(f => f[0] === this.formeMode)[1]} : glisse du premier coin au coin opposé.`}));
    if (this.outil === "lasso") o.append(el("span.petit.muted.cah-aide", {texte: "Entoure des traits pour les déplacer, recolorer, dupliquer ou supprimer."}));
    if (this.outil === "texte") o.append(el("span.petit.muted.cah-aide", {texte: "Touche la page pour ajouter une zone de texte."}));
    // réglage du doigt (pour tous les outils) : au bout de la rangée des réglages
    o.append(el("span.espace"), petit("Doigt : " + (this.doigt ? "écrit" : "défile"), () => { this.doigt = !this.doigt; this.memo(); this.dessinerOutils(); this.majToucher(); }, this.doigt ? "tab_on" : "ghost"));
    requestAnimationFrame(() => { for (const r of [b, o]) r.classList.toggle("deborde", r.scrollWidth > r.clientWidth + 1); });   // rangée qui défile : bord estompé
  }
  /* menu des formes : flottant (aucun changement de mise en page), fermé par un choix ou un appui ailleurs */
  menuFormes(btn) {
    if (this._menuF) { this._menuF.fermer(); return; }
    const r = btn.getBoundingClientRect(), m = el("div.cah-menu-formes", {role: "menu"});
    const fermer = () => { m.remove(); document.removeEventListener("pointerdown", dehors, true); this._menuF = null; };
    const dehors = (e) => { if (!m.contains(e.target) && e.target !== btn && !btn.contains(e.target)) fermer(); };
    for (const [v, t, ic] of FORMES_MENU) m.append(el("button.cah-forme" + (this.formeMode === v ? ".on" : ""), {type: "button", role: "menuitem",
      onclick: () => { this.formeMode = v; this.memo(); fermer(); this.dessinerOutils(); }}, icone(ic, 22), el("span", {texte: t})));
    m.style.left = Math.max(8, Math.min(innerWidth - 220, r.left)) + "px"; m.style.top = (r.bottom + 6) + "px";
    document.body.append(m);
    document.addEventListener("pointerdown", dehors, true);
    this._menuF = {fermer};
  }
  async changerCouleur(i) {
    const r = await choisirCouleur(this.couleurs[i] || "#1f6feb", "Couleur du stylo");
    if (r) { this.couleurs[i] = r; this.coul = r; this.memo(); this.dessinerOutils(); }
  }
  epaisseur(outil = this.outil) {
    if (this.epIdx[outil] === 3 && this.epPerso[outil]) return this.epPerso[outil];
    return (EPAISSEURS[outil] || [3])[Math.min(2, this.epIdx[outil] ?? 1)];
  }
  /* réglages du trait (comme GoodNotes) : style uni / tirets / pointillés, épaisseur en mm */
  reglagesTrait() {
    const outil = this.outil, m = new Modal("Réglages du trait", OUTILS_NOTES.find(o => o[0] === outil)[1]);
    const styles = el("div.trait-styles");
    const dessiner = () => {
      styles.innerHTML = "";
      if (outil === "surligneur") return;
      for (const [v, t] of STYLES_TRAIT) {
        const ap = apercuTrait(v, outil === "surligneur" ? 12 : 3);
        styles.append(el("button.trait-style" + ((this.style[outil] || "") === v ? ".on" : ""), {type: "button", onclick: () => { this.style[outil] = v; this.memo(); dessiner(); this.dessinerOutils(); }}, ap, el("span", {texte: t})));
      }
    };
    dessiner();
    const mm = (u) => (Math.round(u / UNITE_MM * 10) / 10).toFixed(1).replace(".", ",") + " mm";
    const val = el("span.mono", {texte: mm(this.epaisseur(outil))});
    const max = outil === "surligneur" || outil === "gomme" ? 12 : 3;
    const curseur = el("input.trait-curseur", {type: "range", min: "0.1", max: String(max), step: "0.1", value: String(Math.round(this.epaisseur(outil) / UNITE_MM * 10) / 10),
      oninput: (e) => { this.epPerso[outil] = Math.round(parseFloat(e.target.value) * UNITE_MM * 100) / 100; this.epIdx[outil] = 3; val.textContent = mm(this.epPerso[outil]); this.memo(); }});
    m.carte.append(styles, el("div.trait-ligne", null, etiquette("Épaisseur du stylo"), val), curseur);
    m.barre([], [bouton("OK", () => { m.fermer(); this.dessinerOutils(); }, "primary")]);
    m.apres = () => this.dessinerOutils();
    m.montrer();
  }

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
      const f = {page: p, div, cv, ctx: cv.getContext("2d"), k: W / PAGE_L, aDessiner: true, alloue: false, ox: 0, oy: 0, dpr: 1};
      if (p.f === "canevas") { f.canevas = true; f.vue = this.vueCanevas(p); div.classList.add("canevas"); }
      this.feuilles.set(p.id, f);
      this.dimensionner(f, W);
      this.installer(f);
      this._io.observe(div); this._io2.observe(div);
    });
    this.el.querySelector(".cah-zoom").textContent = Math.round(this.zoom * 100) + " %";
    this.majToucher(); this.majNumero();
    if (!this._ro) { this._ro = new ResizeObserver(() => this.redimensionnerBientot()); this._ro.observe(this.pagesZone); }
  }
  /* taille affichée seulement ; la toile (pixels) est allouée au moment de peindre */
  dimensionner(f, W) {
    if (f.canevas) { this.dimCanevas(f); return; }
    f.k = W / PAGE_L;
    f.cv.style.width = W + "px"; f.cv.style.height = f.page.h * f.k + "px";
    f.aDessiner = true;
  }
  taille(f) { return f.canevas ? {W: f.W, H: f.H} : {W: f.k * PAGE_L, H: f.page.h * f.k}; }
  allouer(f) {
    const {W, H} = this.taille(f);
    const dpr = Math.min(window.devicePixelRatio || 1, Math.sqrt(12e6 / (W * H)));   // au plus 12 Mpx par page
    const w = Math.round(W * dpr), h = Math.round(H * dpr);
    if (f.cv.width !== w || f.cv.height !== h) { f.cv.width = w; f.cv.height = h; }
    f.dpr = dpr;
    f.ctx.setTransform(dpr, 0, 0, dpr, dpr * f.ox, dpr * f.oy);       // pour un canevas : le décalage de la vue
    f.alloue = true;
  }

  /* ----- canevas infini : une « feuille » est une fenêtre sur l'espace, qu'on déplace et qu'on zoome */
  vueCanevas(p) {
    const reg = this.pn.app.reglages;
    if (!reg.canevas_vues || typeof reg.canevas_vues !== "object") reg.canevas_vues = {};
    let v = reg.canevas_vues[p.id];
    if (!v || !isFinite(v.x) || !isFinite(v.y) || !isFinite(v.z)) v = reg.canevas_vues[p.id] = vueDefaut();
    v.z = Math.max(CANEVAS_ZOOM[0], Math.min(CANEVAS_ZOOM[1], v.z));
    return v;
  }
  fondCanevas() { const m = this.pn.app.reglages.canevas_fond; return m === "grille" || m === "aucun" ? m : "points"; }
  dimCanevas(f) {
    const pz = this.pagesZone;
    f.W = Math.max(320, Math.min(2400, pz.clientWidth - 28));
    f.H = Math.max(360, pz.clientHeight - 30);
    f.cv.style.width = f.W + "px"; f.cv.style.height = f.H + "px";
    this.appliquerVue(f, true);
  }
  appliquerVue(f, maintenant) {
    f.k = f.vue.z; f.ox = -f.vue.x * f.vue.z; f.oy = -f.vue.y * f.vue.z;
    f.aDessiner = true;
    if (maintenant) { if (this.visible(f) || !f.alloue) this.peindre(f.page.id); return; }
    if (!f._raf) f._raf = requestAnimationFrame(() => { f._raf = 0; if (this.feuilles.get(f.page.id) === f) this.peindre(f.page.id); });
  }
  memoVue() {
    this._vueSale = true;
    clearTimeout(this._tv); this._tv = setTimeout(() => this.enregistrerVue(), 500);
  }
  enregistrerVue() { clearTimeout(this._tv); if (this._vueSale) { this._vueSale = false; this.pn.app.enregistrerLocal(); } }
  zoomerCanevas(f, z, px, py) {
    const v = f.vue;
    z = Math.max(CANEVAS_ZOOM[0], Math.min(CANEVAS_ZOOM[1], z));
    const wx = v.x + px / v.z, wy = v.y + py / v.z;
    v.z = Math.round(z * 1000) / 1000; v.x = wx - px / v.z; v.y = wy - py / v.z;
    this.appliquerVue(f); this.memoVue();
  }
  recentrerCanevas(f) {
    const b = boiteContenu(f.page), v = f.vue;
    if (!b) Object.assign(v, vueDefaut());
    else {
      const z = Math.max(CANEVAS_ZOOM[0], Math.min(1.5, Math.min((f.W - 80) / Math.max(1, b[2] - b[0]), (f.H - 80) / Math.max(1, b[3] - b[1]))));
      v.z = Math.round(z * 1000) / 1000; v.x = (b[0] + b[2]) / 2 - f.W / 2 / v.z; v.y = (b[1] + b[3]) / 2 - f.H / 2 / v.z;
    }
    this.appliquerVue(f); this.memoVue();
  }
  /* démarre un panoramique / un pincement ; renvoie true si le geste est pris en charge ici (sinon l'outil écrit) */
  debutCanevas(f, e) {
    const r = f.cv.getBoundingClientRect();
    if (e.pointerType === "touch") {
      f.ptrs.set(e.pointerId, {x: e.clientX, y: e.clientY});
      if (f.ptrs.size === 2) {                                   // deux doigts : zoom + déplacement (le trait en cours est abandonné)
        if (this.geste && this.geste.f === f) { this.geste = null; clearTimeout(this._live); this.peindre(f.page.id); }
        f.pan = null;
        const [a, b] = [...f.ptrs.values()];
        f.pinch = {d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: f.vue.z, m0: {x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top}, v0: {x: f.vue.x, y: f.vue.y}};
        return true;
      }
      if (f.ptrs.size > 2) return true;
    }
    const main = this.outil === "main" || this.espace || e.button === 1 || (e.pointerType === "touch" && !this.doigt);
    if (!main) return false;
    e.preventDefault();
    try { f.cv.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    f.pan = {id: e.pointerId, x: e.clientX, y: e.clientY};
    f.cv.classList.add("deplace");
    return true;
  }
  bougeCanevas(f, e) {
    if (e.pointerType === "touch" && f.ptrs.has(e.pointerId)) f.ptrs.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (f.pinch) {
      if (f.ptrs.size < 2) return true;
      e.preventDefault();
      const r = f.cv.getBoundingClientRect(), [a, b] = [...f.ptrs.values()], P = f.pinch, v = f.vue;
      const z = Math.max(CANEVAS_ZOOM[0], Math.min(CANEVAS_ZOOM[1], P.z0 * Math.hypot(a.x - b.x, a.y - b.y) / P.d0));
      const m = {x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top};
      const wx = P.v0.x + P.m0.x / P.z0, wy = P.v0.y + P.m0.y / P.z0;      // le point de l'espace sous les doigts au départ le reste
      v.z = Math.round(z * 1000) / 1000; v.x = wx - m.x / v.z; v.y = wy - m.y / v.z;
      this.appliquerVue(f); this.memoVue();
      return true;
    }
    if (f.pan && f.pan.id === e.pointerId) {
      e.preventDefault();
      const dx = e.clientX - f.pan.x, dy = e.clientY - f.pan.y;
      f.pan.x = e.clientX; f.pan.y = e.clientY;
      f.vue.x -= dx / f.vue.z; f.vue.y -= dy / f.vue.z;
      this.appliquerVue(f); this.memoVue();
      return true;
    }
    return false;
  }
  finCanevas(f, e) {
    const etait = f.ptrs.delete(e.pointerId);
    if (f.pinch) { if (f.ptrs.size < 2) f.pinch = null; return true; }
    if (f.pan && f.pan.id === e.pointerId) { f.pan = null; f.cv.classList.remove("deplace"); this.enregistrerVueBientot(); return true; }
    return etait && e.pointerType === "touch" && !this.doigt && !this.geste;
  }
  enregistrerVueBientot() { this.memoVue(); }
  installerCanevas(f) {
    f.ptrs = new Map(); f.pan = null; f.pinch = null;
    f.cv.style.touchAction = "none";
    f.cv.addEventListener("wheel", (e) => {                      // molette ou Ctrl + molette (pincement du pavé tactile) : zoom autour du pointeur
      e.preventDefault();
      const r = f.cv.getBoundingClientRect();
      this.zoomerCanevas(f, f.vue.z * Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0016)), e.clientX - r.left, e.clientY - r.top);
    }, {passive: false});
    f.cv.addEventListener("lostpointercapture", (e) => { if (f.pan && f.pan.id === e.pointerId) { f.pan = null; f.cv.classList.remove("deplace"); } });
  }
  peindreCanevas(f) {
    if (!f.alloue) this.allouer(f);
    f.aDessiner = false;
    const ctx = f.ctx, dpr = f.dpr, v = f.vue, p = f.page, pc = this.pc();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, f.W, f.H);
    ctx.fillStyle = pc.fond; ctx.fillRect(0, 0, f.W, f.H);
    fondCanevas(ctx, pc, f.W, f.H, v, this.fondCanevas());
    ctx.setTransform(dpr, 0, 0, dpr, dpr * f.ox, dpr * f.oy);       // à partir d'ici : coordonnées de l'espace × zoom
    const k = v.z, m = 40 / k, X0 = v.x - m, Y0 = v.y - m, X1 = v.x + f.W / k + m, Y1 = v.y + f.H / k + m, clair = papierClair(pc);
    let dessines = 0;
    for (const tr of p.traits) {                                   // seulement ce qui est à l'écran
      const b = boiteTrait(tr), e = (tr.e || 3) / 2;
      if (b[2] + e < X0 || b[0] - e > X1 || b[3] + e < Y0 || b[1] - e > Y1) continue;
      tracer(ctx, tr, k, pc.encre, clair); dessines++;
    }
    for (const tx of p.textes || []) {
      if (tx.x + (tx.w || 420) + 14 < X0 || tx.x - 14 > X1 || tx.y + hauteurBloc(tx) + 14 < Y0 || tx.y - 14 > Y1) continue;
      dessinerTexte(ctx, tx, k, pc.encre); dessines++;
    }
    if (this.sel && this.sel.page === p) {
      const b = this.sel.boite;
      ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = T.ACCENT; ctx.lineWidth = 2;
      ctx.strokeRect(b[0] * k - 6, b[1] * k - 6, (b[2] - b[0]) * k + 12, (b[3] - b[1]) * k + 12); ctx.restore();
    }
    f.dessines = dessines;
  }
  liberer(f) { if (!f.alloue) return; f.cv.width = 0; f.cv.height = 0; f.alloue = false; f.aDessiner = true; }
  /* marges libres tout autour de la page : on la pousse à gauche, à droite, en haut ou en bas, elle ne se recentre jamais.
     Seule la première mise en place la centre (ou la remet là où elle était, si cette note a déjà été ouverte). */
  marges() {
    const pz = this.pagesZone, libre = !this.n.pages.every(p => p.f === "canevas");
    const mh = libre ? Math.round(pz.clientWidth * 0.85) : 0, mv = libre ? Math.round(pz.clientHeight * 0.5) : 0;
    const avL = parseFloat(this.piste.style.paddingLeft) || 14, avT = parseFloat(this.piste.style.paddingTop) || 10;
    if (this._place && Math.abs(avL - (14 + mh)) < 1 && Math.abs(avT - (10 + mv)) < 1) return;
    const st = this.piste.style;
    st.paddingLeft = (14 + mh) + "px"; st.paddingRight = (46 + mh) + "px"; st.paddingTop = (10 + mv) + "px"; st.paddingBottom = (60 + mv) + "px";
    if (this._place) { pz.scrollLeft += 14 + mh - avL; pz.scrollTop += 10 + mv - avT; return; }
    const v = this.pn.vues && this.pn.vues.get(this.n.id), f = v && this.feuilles.get(v.p);
    if (f) {                       // la page de référence revient exactement au même endroit de l'écran
      const r = f.div.getBoundingClientRect(), z = pz.getBoundingClientRect();
      pz.scrollLeft += r.left - z.left - v.x; pz.scrollTop += r.top - z.top - v.y;
    } else { pz.scrollLeft = Math.max(0, (pz.scrollWidth - pz.clientWidth) / 2); pz.scrollTop = mv; }
    this._place = true;
  }
  /* position de la vue gardée en mémoire (par note, le temps de la session) : si l'éditeur est refait, rien ne bouge */
  memoPosition() {
    if (!this._place || !this.pn.vues || !this.feuilles.size) return;
    const z = this.pagesZone.getBoundingClientRect(), cy = z.top + z.height / 2;
    let ref = null;
    for (const f of this.feuilles.values()) { const r = f.div.getBoundingClientRect(); if (!ref || (r.top <= cy && r.bottom >= cy)) { ref = {f, r}; if (r.top <= cy && r.bottom >= cy) break; } }
    if (ref && ref.r.width) this.pn.vues.set(this.n.id, {p: ref.f.page.id, x: ref.r.left - z.left, y: ref.r.top - z.top});
  }
  /* jamais de redimensionnement pendant un trait, un pincement ou le glisser d'un autocollant : on attend la fin */
  redimensionnerBientot() {
    clearTimeout(this._rz);
    this._rz = setTimeout(() => {
      if (this.geste || this.pince || this.acGeste || this.selGeste || (this.actif && Date.now() - this.actif < 250 && this._place)) return this.redimensionnerBientot();
      this.redimensionner();
    }, 120);
  }
  redimensionner() {
    const W = this.largeurBase() * this.zoom;
    this.marges();
    for (const f of this.feuilles.values()) { if (f.canevas) this.dimCanevas(f); else if (Math.abs(f.k * PAGE_L - W) > 1) this.dimensionner(f, W); }
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
    if (f.canevas) { this.peindreCanevas(f); this.majPostits(f); this.majAutocollants(f); this.majPoigneeSel(f); this.majRotSel(f); return; }
    if (!f.alloue || f.aDessiner) this.allouer(f);
    f.aDessiner = false;
    const W = f.k * PAGE_L, H = f.page.h * f.k;
    f.ctx.clearRect(0, 0, W, H);
    dessinerPage(f.ctx, f.page, f.k, this.pc(), this.sel && this.sel.page === f.page ? this.sel : null);
    this.majPostits(f);
    this.majAutocollants(f);
    this.majPoigneeSel(f);
    this.majRotSel(f);
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
    for (const f of this.feuilles.values()) f.div.classList.toggle("marquee", !!f.page.mp);
    if (!this.miniatures) return;
    const nb = this.n.pages.filter(p => p.mp).length;
    m.append(el("div.mini-filtre", null, petit("Toutes", () => { this.filtreMini = ""; this.dessinerMiniatures(); }, this.filtreMini ? "ghost" : "tab_on"),
      petit(`★ ${nb}`, () => { this.filtreMini = "mp"; this.dessinerMiniatures(); }, this.filtreMini ? "tab_on" : "ghost")));
    this.n.pages.forEach((p, i) => {
      if (this.filtreMini && !p.mp) return;
      const marque = el("span.mini-marque" + (p.mp ? ".on" : ""), {title: p.mp ? "Retirer le marque-page" : "Ajouter un marque-page",
        onclick: (e) => { e.stopPropagation(); this.marquer(p); }}, icone("marque", 16));
      const b = el("button.mini" + (this.pageCourante === p ? ".on" : ""), {type: "button", "data-p": p.id, onclick: () => this.allerPage(p.id)},
        canvasPage(p, this.n.papier, 110), el("span.mono", {texte: String(i + 1)}), marque);
      m.append(b);
    });
    if (this.filtreMini && !nb) m.append(el("div.petit.muted", {texte: "Aucune page marquée."}));
    if (!this.filtreMini) {
      const fond = this.n.fond === "pdf" ? "blanc" : this.n.fond;
      m.append(el("button.mini.mini-ajout", {type: "button", title: "Ajouter une page à la fin", onclick: () => this.ajouterPage(this.n.pages.length, fond)}, icone("plus", 22)));
    }
  }
  marquer(p) { if (p.mp) delete p.mp; else p.mp = 1; this.modifie(); this.dessinerMiniatures(); }
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
    if (Array.isArray(this.n.autocollants)) this.n.autocollants = this.n.autocollants.filter(a => a.p !== p.id);   // ses autocollants retournent dans l'inventaire
    this.apresPages();
  }
  apresPages(aller) {
    this.histo = []; this.refait = []; this.deselect();
    this.construirePages(); this.dessinerMiniatures(); this.modifie();
    if (aller) setTimeout(() => this.allerPage(aller), 50);
  }

  /* ----- saisie au crayon */
  majToucher() { for (const f of this.feuilles.values()) f.cv.style.touchAction = f.canevas || this.doigt ? "none" : "pan-x pan-y"; }
  point(f, e) {
    const r = f.cv.getBoundingClientRect();
    let pr = e.pointerType === "pen" ? e.pressure : .5;
    if (!pr) pr = .5;
    return [Math.round((e.clientX - r.left - f.ox) / f.k * 10) / 10, Math.round((e.clientY - r.top - f.oy) / f.k * 10) / 10, Math.round(pr * 100)];
  }
  installer(f) {
    const cv = f.cv;
    cv.addEventListener("touchstart", (e) => { if (this.doigt || Array.from(e.changedTouches).some(t => t.touchType === "stylus")) e.preventDefault(); }, {passive: false});
    cv.addEventListener("touchmove", (e) => { if (this.geste) e.preventDefault(); }, {passive: false});
    cv.addEventListener("pointerdown", (e) => this.appui(f, e));
    cv.addEventListener("pointermove", (e) => this.bouge(f, e));
    cv.addEventListener("pointerup", (e) => this.relache(f, e));
    cv.addEventListener("pointercancel", (e) => this.relache(f, e));
    if (f.canevas) this.installerCanevas(f);
  }
  appui(f, e) {
    if (this.acChoisi) this.choisirAc(null);
    if (f.canevas && this.debutCanevas(f, e)) return;
    if (e.pointerType === "touch" && !this.doigt) return;
    if (this.outil === "main") return;
    if (this.pince) return;
    if (this.geste || this.texteOuvert) { if (this.texteOuvert) this.texteOuvert.blur(); return; }
    e.preventDefault();
    try { f.cv.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    const [x, y, pr] = this.point(f, e);
    const outil = (e.button === 5 || (e.buttons & 32)) ? "gomme" : this.outil;
    this.geste = {f, id: e.pointerId, outil, x0: x, y0: y, type: e.pointerType};
    if (outil === "gomme") { this.snap(f.page); this.gommer(f, x, y); return; }
    if (outil === "texte") { this.geste = null; this.ouvrirTexte(f, x, y); return; }
    if (outil === "note") { this.geste = null; this.ouvrirTexte(f, x, y, {bg: this.noteCoul}); return; }
    if (outil === "laser") { this.geste.laser = true; this.laser(f, x, y, pr, true); return; }
    if (outil === "lasso") {
      if (this.sel && this.sel.page === f.page && this.dansBoite(x, y)) { this.snap(f.page); this.geste.deplace = true; return; }
      this.deselect(); this.geste.poly = [x, y]; return;
    }
    const surl = outil === "surligneur";
    const tr = {c: this.coul, e: this.epaisseur(), p: [x, y, pr]};
    if (surl) tr.o = 1;
    if (outil === "bille") tr.k = "b";
    if (outil === "forme") { tr.k = "f"; if (this.formeMode !== "auto") { this.geste.exacte = true; tr.p = formeExacte(this.formeMode, x, y, x, y); } }
    if (!surl && this.style[outil]) tr.d = this.style[outil];
    this.geste.trait = tr;
  }
  bouge(f, e) {
    if (f.canevas && this.bougeCanevas(f, e)) return;
    const g = this.geste;
    if (!g || g.id !== e.pointerId || g.f !== f) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of evs.length ? evs : [e]) {
      const [x, y, pr] = this.point(f, ev);
      if (g.outil === "gomme") { this.gommer(f, x, y); continue; }
      if (g.laser) { this.laser(f, x, y, pr); continue; }
      if (g.poly) { g.poly.push(x, y); continue; }
      if (g.deplace) { this.deplacerSel(x - g.x0, y - g.y0); g.x0 = x; g.y0 = y; continue; }
      if (g.trait && g.exacte) {                         // forme du menu : du point de départ au point courant
        g.trait.p = formeExacte(this.formeMode, g.x0, g.y0, x, y); g.x1 = x; g.y1 = y;
        clearTimeout(this._live); this._live = setTimeout(() => { this.peindre(f.page.id); tracer(f.ctx, g.trait, f.k, this.pc().encre); }, 16);
        continue;
      }
      if (g.trait && g.droit) {                          // ligne droite : seule l'extrémité suit le pointeur
        const t = g.trait.p; t[3] = x; t[4] = y; t[5] = pr;
        clearTimeout(this._live); this._live = setTimeout(() => { this.peindre(f.page.id); const pc = this.pc(); tracer(f.ctx, g.trait, f.k, pc.encre, papierClair(pc)); }, 16);
        continue;
      }
      if (g.trait) {
        const t = g.trait.p, n = t.length;
        if (Math.hypot(x - t[n - 3], y - t[n - 2]) < 1) continue;
        t.push(x, y, pr);
        if (g.outil !== "forme" && (g.ax === undefined || Math.hypot(ev.clientX - g.ax, ev.clientY - g.ay) > 4)) {
          g.ax = ev.clientX; g.ay = ev.clientY;       // le pointeur bouge : on attend qu'il s'immobilise
          clearTimeout(this._tenir); this._tenir = setTimeout(() => this.redresser(f, g), TENIR_MS);
        }
        // trait en direct (sans tout redessiner)
        if (!g.trait.o && !g.trait.d) tracer(f.ctx, {c: g.trait.c, e: g.trait.e, k: g.trait.k, p: t.slice(-6)}, f.k, this.pc().encre);
        else if (g.trait.d) { clearTimeout(this._live); this._live = setTimeout(() => { this.peindre(f.page.id); tracer(f.ctx, g.trait, f.k, this.pc().encre); }, 16); }
        else { clearTimeout(this._live); this._live = setTimeout(() => { this.peindre(f.page.id); const pc = this.pc(); tracer(f.ctx, g.trait, f.k, pc.encre, papierClair(pc)); }, 16); }
      }
    }
    if (g.poly) { this.peindre(f.page.id); const c = f.ctx, k = f.k; c.save(); c.setLineDash([5, 5]); c.strokeStyle = T.ACCENT; c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.poly[0] * k, g.poly[1] * k); for (let i = 2; i < g.poly.length; i += 2) c.lineTo(g.poly[i] * k, g.poly[i + 1] * k); c.stroke(); c.restore(); }
    if (g.deplace) this.peindre(f.page.id);
    if (g.outil === "plume" && g.trait && g.trait.p.length > 6 && f.div.offsetHeight && e.clientY > f.cv.getBoundingClientRect().bottom - 40 && f.page === this.n.pages[this.n.pages.length - 1]) { /* bas de la dernière page : rien */ }
  }
  /* ligne droite façon GoodNotes : le trait est tenu immobile à la fin → segment parfaitement droit (si le tracé ressemblait à une ligne) */
  redresser(f, g) {
    if (this.geste !== g || !g.trait || g.droit || g.exacte) return;
    const t = g.trait.p, n = t.length, x0 = t[0], y0 = t[1], x1 = t[n - 3], y1 = t[n - 2], l = Math.hypot(x1 - x0, y1 - y0);
    if (n < 9 || l < 15) return;
    let dev = 0;
    for (let i = 0; i < n; i += 3) dev = Math.max(dev, distSeg(t[i], t[i + 1], x0, y0, x1, y1));
    if (dev > Math.max(20, l * .3)) return;
    g.trait.p = [x0, y0, t[2], x1, y1, t[n - 1]]; g.droit = true;
    this.peindre(f.page.id); const pc = this.pc(); tracer(f.ctx, g.trait, f.k, pc.encre, papierClair(pc));
  }
  relache(f, e) {
    if (f.canevas && this.finCanevas(f, e)) return;
    const g = this.geste;
    if (!g || g.id !== e.pointerId) return;
    clearTimeout(this._live); clearTimeout(this._tenir);
    this.geste = null;
    if (g.outil === "gomme") { this.peindre(f.page.id); this.modifie(); return; }
    if (g.laser) { this.laserFin(f); return; }
    if (g.poly) { this.selectionner(f, g.poly); return; }
    if (g.deplace) { this.modifie(); this.dessinerMiniatures(); return; }
    if (g.trait) {
      this.snap(f.page);
      if (g.outil === "forme" && !g.exacte) { const pts = reconnaitreForme(g.trait.p); if (pts) g.trait.p = pts; }
      if (g.exacte && (g.x1 === undefined || Math.hypot(g.x1 - g.x0, g.y1 - g.y0) < 3)) { this.peindre(f.page.id); return; }      // simple appui : rien
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
    const p = f.page, traits = new Set(), textes = new Set(), acs = new Set();
    if (poly.length >= 6) {
      for (const tr of p.traits) {
        let dedans = 0, n = 0;
        for (let i = 0; i < tr.p.length; i += 3) { n++; if (dansPoly(tr.p[i], tr.p[i + 1], poly)) dedans++; }
        if (n && dedans / n >= .5) traits.add(tr);
      }
      for (const tx of p.textes || []) if (dansPoly(tx.x + 10, tx.y + 10, poly)) textes.add(tx);
      for (const a of autocollantsNote(this.n)) if (a.p === p.id && dansPoly(a.x, a.y, poly)) acs.add(a);
    }
    if (!traits.size && !textes.size && !acs.size) { this.deselect(); this.peindre(p.id); return; }
    if (this.acChoisi) this.choisirAc(null);
    this.sel = {page: p, traits, textes, acs, boite: null};
    this.majBoite();
    this.peindre(p.id);
    const b = this.barreSel; b.innerHTML = ""; b.hidden = false;
    const groupe = (nom, ...bs) => el("span.sel-groupe", null, el("span.petit.muted", {texte: nom}), ...bs);
    const pb = (t, titre, f) => { const x = petit(t, f); x.title = titre; x.setAttribute("aria-label", titre); return x; };
    const nb = traits.size + textes.size + acs.size;
    b.append(el("span.petit.sel-nb", {texte: `${nb} élément${nb > 1 ? "s" : ""}`}),
      groupe("Taille", pb("−", "Réduire la sélection", () => this.echelleSel(1 / 1.2)), pb("+", "Agrandir la sélection", () => this.echelleSel(1.2))),
      groupe("Tourner", pb("↺", "Tourner de 15° vers la gauche", () => this.tournerSel(-15)), pb("↻", "Tourner de 15° vers la droite", () => this.tournerSel(15))),
      textes.size ? groupe("Texte", pb("A−", "Texte plus petit", () => this.texteSel(1 / 1.15)), pb("A+", "Texte plus grand", () => this.texteSel(1.15))) : null,
      traits.size ? groupe("Trait", pb("−", "Traits plus fins", () => this.traitSel(1 / 1.25)), pb("+", "Traits plus épais", () => this.traitSel(1.25))) : null,
      pb("Couleur", "Mettre la couleur actuelle", () => this.recolorer()), pb("Dupliquer", "Dupliquer", () => this.dupliquerSel()),
      cls(pb("Supprimer", "Supprimer", () => this.supprimerSel()), "danger"),
      el("button.bs-x.sel-x", {type: "button", title: "Fermer", "aria-label": "Tout désélectionner", texte: "✕", onclick: () => { this.deselect(); this.peindre(p.id); }}));
    this.eviterBarre();
  }
  majBoite() {
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (const tr of this.sel.traits) { const q = boiteTrait(tr), m = (tr.e || 3) / 2; a = Math.min(a, q[0] - m); b = Math.min(b, q[1] - m); c = Math.max(c, q[2] + m); d = Math.max(d, q[3] + m); }
    for (const tx of this.sel.textes) { a = Math.min(a, tx.x); b = Math.min(b, tx.y); c = Math.max(c, tx.x + (tx.w || 420)); d = Math.max(d, tx.y + hauteurTexte(tx)); }
    for (const x of this.sel.acs || []) { const m = demiAc(x); a = Math.min(a, x.x - m); b = Math.min(b, x.y - m); c = Math.max(c, x.x + m); d = Math.max(d, x.y + m); }
    this.sel.boite = [a, b, c, d];
  }
  /* actions sur la sélection : tout est annulable (snap), la barre ne bouge pas */
  echelleSel(fac) {
    const s = this.sel; if (!s) return;
    this.snap(s.page);
    const o = this.origineSel();
    this.appliquerEchelle(o, fac);
    this.majBoite(); this.peindre(s.page.id); this.modifie();
  }
  /* état de départ de la sélection (pour une mise à l'échelle sans erreur cumulée pendant le glisser de la poignée) */
  origineSel() {
    const s = this.sel, b = s.boite;
    return {cx: (b[0] + b[2]) / 2, cy: (b[1] + b[3]) / 2,
      traits: [...s.traits].map(tr => ({tr, p: tr.p.slice(), e: tr.e || 3})), textes: [...s.textes].map(tx => ({tx, x: tx.x, y: tx.y, w: tx.w || 420, s: tx.s || 28})),
      acs: [...(s.acs || [])].map(a => ({a, x: a.x, y: a.y, t: a.t || AC_TAILLE, r: a.r || 0}))};
  }
  /* tourner la sélection de « deg » degrés (sens horaire) autour du centre de son cadre, depuis l'état de départ « o » (v31/v29) :
     les points des traits tournent ; un texte garde son sens de lecture, son centre tourne ; un autocollant tourne (champ « r »).
     Même calcul que le PC (appliquer_rotation). */
  appliquerRotation(o, deg) {
    const r = (v) => Math.round(v * 10) / 10, cx = o.cx, cy = o.cy, t = deg * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
    const tourne = (x, y) => [cx + (x - cx) * c - (y - cy) * sn, cy + (x - cx) * sn + (y - cy) * c];
    for (const {tr, p} of o.traits) for (let i = 0; i < p.length; i += 3) { const [x, y] = tourne(p[i], p[i + 1]); tr.p[i] = r(x); tr.p[i + 1] = r(y); }
    for (const q of o.textes) {
      const h = hauteurTexte(q.tx), [x, y] = tourne(q.x + q.w / 2, q.y + h / 2);
      q.tx.x = r(x - q.w / 2); q.tx.y = r(y - h / 2);
    }
    for (const q of o.acs) { const [x, y] = tourne(q.x, q.y); q.a.x = r(x); q.a.y = r(y); poserAngleAc(q.a, q.r + deg); }
  }
  tournerSel(deg) {
    const s = this.sel; if (!s) return;
    this.snap(s.page);
    this.appliquerRotation(this.origineSel(), deg);
    this.majBoite(); this.peindre(s.page.id); this.modifie(); this.eviterBarre();
  }
  /* poignée de rotation de la sélection (au-dessus du milieu du cadre) : l'angle suit le pointeur autour du centre ;
     aimantée tous les 15° ; un glisser = une seule étape d'annulation ; rien d'autre ne bouge pendant le geste */
  majRotSel(f) {
    let h = f.selRot;
    if (!this.sel || this.sel.page !== f.page || !this.sel.boite) { if (h) h.hidden = true; return; }
    if (!h) {
      h = f.selRot = el("button.sel-rot", {type: "button", title: "Glisser pour tourner la sélection (aimanté tous les 15°)", "aria-label": "Tourner la sélection"});
      f.div.append(h);
      let g = null;
      h.addEventListener("pointerdown", (e) => {
        if (!this.sel) return;
        e.preventDefault(); e.stopPropagation();
        try { h.setPointerCapture(e.pointerId); } catch (er) { /* */ }
        const r = f.cv.getBoundingClientRect(), o = this.origineSel();
        const sx = r.left + (f.ox || 0) + o.cx * f.k, sy = r.top + (f.oy || 0) + o.cy * f.k;
        this.snap(this.sel.page);
        g = {id: e.pointerId, o, sx, sy, a0: Math.atan2(e.clientY - sy, e.clientX - sx), deg: 0, snap: this.histo.length, bx: h.style.left, by: h.style.top};
        this.selGeste = g;
      });
      h.addEventListener("pointermove", (e) => {
        if (!g || g.id !== e.pointerId) return;
        e.preventDefault();
        let d = (Math.atan2(e.clientY - g.sy, e.clientX - g.sx) - g.a0) * 180 / Math.PI;
        d = ((d + 540) % 360) - 180;
        g.deg = Math.round(aimanterAngle(d) * 10) / 10;
        if (this._rafRot) return;
        this._rafRot = requestAnimationFrame(() => { this._rafRot = 0; if (!g || !this.sel) return; this.appliquerRotation(g.o, g.deg); this.majBoite(); g.fixe = 1; this.peindre(f.page.id); g.fixe = 0; });
      });
      const fin = (e) => {
        if (!g || g.id !== e.pointerId) return;
        const gg = g; g = null; this.selGeste = null;
        cancelAnimationFrame(this._rafRot); this._rafRot = 0;
        try { h.releasePointerCapture(e.pointerId); } catch (er) { /* */ }
        if (!this.sel) return;
        if (Math.abs(gg.deg) < .05) { if (this.histo.length === gg.snap) this.histo.pop(); this.appliquerRotation(gg.o, 0); }
        else { this.appliquerRotation(gg.o, gg.deg); this.modifie(); }
        this.majBoite(); this.peindre(f.page.id); this.eviterBarre();
      };
      h.addEventListener("pointerup", fin); h.addEventListener("pointercancel", fin); h.addEventListener("lostpointercapture", fin);
    }
    // pendant le glisser, la poignée reste sous le doigt (le cadre droit change de taille en tournant)
    if (this.selGeste && this.selGeste.fixe) { h.hidden = false; return; }
    const b = this.sel.boite;
    h.style.left = (((b[0] + b[2]) / 2) * f.k + (f.ox || 0)) + "px"; h.style.top = (b[1] * f.k + (f.oy || 0) - 40) + "px";
    h.hidden = false;
  }
  /* agrandir / réduire autour du centre : traits (et épaisseurs), textes, autocollants ; même calcul que le PC (echelle_depuis) */
  appliquerEchelle(o, fac) {
    const r = (v) => Math.round(v * 10) / 10, cx = o.cx, cy = o.cy;
    for (const {tr, p, e} of o.traits) { for (let i = 0; i < p.length; i += 3) { tr.p[i] = r(cx + (p[i] - cx) * fac); tr.p[i + 1] = r(cy + (p[i + 1] - cy) * fac); } tr.e = Math.round(Math.max(.3, Math.min(80, e * fac)) * 100) / 100; }
    for (const q of o.textes) { q.tx.x = r(cx + (q.x - cx) * fac); q.tx.y = r(cy + (q.y - cy) * fac); q.tx.w = r(Math.max(40, q.w * fac)); q.tx.s = Math.round(Math.max(8, Math.min(200, q.s * fac))); }
    for (const q of o.acs) { q.a.x = r(cx + (q.x - cx) * fac); q.a.y = r(cy + (q.y - cy) * fac); q.a.t = Math.round(Math.max(AC_MIN, Math.min(AC_MAX, q.t * fac))); }
  }
  /* poignée de redimensionnement de la sélection (coin bas-droit du cadre) : même flèche que celle d'un autocollant ;
     un glisser = une seule étape d'annulation */
  majPoigneeSel(f) {
    let h = f.selPoignee;
    if (!this.sel || this.sel.page !== f.page || !this.sel.boite) { if (h) h.hidden = true; return; }
    if (!h) {
      h = f.selPoignee = el("button.sel-poignee", {type: "button", title: "Glisser pour agrandir ou réduire la sélection", "aria-label": "Redimensionner la sélection"});
      f.div.append(h);
      let g = null;
      h.addEventListener("pointerdown", (e) => {
        if (!this.sel) return;
        e.preventDefault(); e.stopPropagation();
        try { h.setPointerCapture(e.pointerId); } catch (er) { /* */ }
        const r = f.cv.getBoundingClientRect(), o = this.origineSel();
        const sx = r.left + (f.ox || 0) + o.cx * f.k, sy = r.top + (f.oy || 0) + o.cy * f.k;
        this.snap(this.sel.page);
        g = {id: e.pointerId, o, sx, sy, d0: Math.max(8, Math.hypot(e.clientX - sx, e.clientY - sy)), fac: 1, snap: this.histo.length};
        this.selGeste = g;
      });
      h.addEventListener("pointermove", (e) => {
        if (!g || g.id !== e.pointerId) return;
        e.preventDefault();
        g.fac = Math.max(.1, Math.min(10, Math.hypot(e.clientX - g.sx, e.clientY - g.sy) / g.d0));
        if (this._rafSel) return;
        this._rafSel = requestAnimationFrame(() => { this._rafSel = 0; if (!g || !this.sel) return; this.appliquerEchelle(g.o, g.fac); this.majBoite(); this.peindre(f.page.id); });
      });
      const fin = (e) => {
        if (!g || g.id !== e.pointerId) return;
        const gg = g; g = null; this.selGeste = null;
        cancelAnimationFrame(this._rafSel); this._rafSel = 0;
        try { h.releasePointerCapture(e.pointerId); } catch (er) { /* */ }
        if (!this.sel) return;
        if (Math.abs(gg.fac - 1) < .005) { if (this.histo.length === gg.snap) this.histo.pop(); this.appliquerEchelle(gg.o, 1); }
        else { this.appliquerEchelle(gg.o, gg.fac); this.modifie(); }
        this.majBoite(); this.peindre(f.page.id); this.eviterBarre();
      };
      h.addEventListener("pointerup", fin); h.addEventListener("pointercancel", fin); h.addEventListener("lostpointercapture", fin);
    }
    const b = this.sel.boite;
    h.style.left = ((b[2]) * f.k + (f.ox || 0) + 6) + "px"; h.style.top = ((b[3]) * f.k + (f.oy || 0) + 6) + "px";
    h.hidden = false;
  }
  texteSel(fac) {
    const s = this.sel; if (!s || !s.textes.size) return;
    this.snap(s.page);
    for (const tx of s.textes) tx.s = Math.round(Math.max(8, Math.min(200, (tx.s || 28) * fac)));
    this.majBoite(); this.peindre(s.page.id); this.modifie();
  }
  traitSel(fac) {
    const s = this.sel; if (!s || !s.traits.size) return;
    this.snap(s.page);
    for (const tr of s.traits) tr.e = Math.round(Math.max(.3, Math.min(80, (tr.e || 3) * fac)) * 100) / 100;
    this.majBoite(); this.peindre(s.page.id); this.modifie();
  }
  dansBoite(x, y) { const b = this.sel.boite; return x >= b[0] - 12 && x <= b[2] + 12 && y >= b[1] - 12 && y <= b[3] + 12; }
  deplacerSel(dx, dy) {
    for (const tr of this.sel.traits) for (let i = 0; i < tr.p.length; i += 3) { tr.p[i] = Math.round((tr.p[i] + dx) * 10) / 10; tr.p[i + 1] = Math.round((tr.p[i + 1] + dy) * 10) / 10; }
    for (const tx of this.sel.textes) { tx.x += dx; tx.y += dy; }
    for (const a of this.sel.acs || []) { a.x = Math.round((a.x + dx) * 10) / 10; a.y = Math.round((a.y + dy) * 10) / 10; }
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
    const ac2 = [...(s.acs || [])].map(a => copieAutocollant(a, 30));
    p.traits.push(...tr2); p.textes = (p.textes || []).concat(tx2);
    if (ac2.length) { if (!Array.isArray(this.n.autocollants)) this.n.autocollants = []; this.n.autocollants.push(...ac2); }
    this.sel = {page: p, traits: new Set(tr2), textes: new Set(tx2), acs: new Set(ac2), boite: null};
    this.majBoite(); this.peindre(p.id); this.modifie();
  }
  supprimerSel() {
    const s = this.sel, p = s.page;
    this.snap(p);
    p.traits = p.traits.filter(t => !s.traits.has(t));
    p.textes = (p.textes || []).filter(t => !s.textes.has(t));
    if (s.acs && s.acs.size) this.n.autocollants = (this.n.autocollants || []).filter(a => !s.acs.has(a));
    this.deselect(); this.peindre(p.id); this.modifie();
  }
  deselect() { const had = this.sel; this.sel = null; this.barreSel.hidden = true; if (had) this.peindre(had.page.id); for (const f of this.feuilles.values()) { if (f.selPoignee) f.selPoignee.hidden = true; if (f.selRot) f.selRot.hidden = true; } }

  /* ----- zones de texte */
  /* ----- pointeur laser (« baguette magique ») : traînée lisse qui s'estompe toute seule ; rien n'est enregistré ni synchronisé */
  laser(f, x, y, pr, nouveau) {
    if (!f.laser || f.laser.cv.width !== f.cv.width || f.laser.cv.height !== f.cv.height) {
      const anciens = f.laser ? f.laser.traits : [];
      if (f.laser) f.laser.cv.remove();
      const cv = el("canvas.cah-laser");
      cv.width = f.cv.width; cv.height = f.cv.height; cv.style.width = f.cv.style.width; cv.style.height = f.cv.style.height;
      f.div.append(cv);
      f.laser = {cv, ctx: cv.getContext("2d"), traits: anciens, courant: null};
    }
    let tr = f.laser.courant;
    if (nouveau || !tr) { tr = {pts: [], fini: false}; f.laser.traits.push(tr); f.laser.courant = tr; }
    const d = tr.pts[tr.pts.length - 1];
    if (d && Math.hypot(x - d.x, y - d.y) < 1.2 / Math.max(.3, f.k)) return;          // anti-tremblement
    tr.pts.push({x, y, p: Math.max(.2, Math.min(1, (pr || 50) / 100)), t: performance.now()});
    this.lancerLaser();
  }
  laserFin(f) { if (f.laser && f.laser.courant) { f.laser.courant.fini = true; f.laser.courant = null; } this.lancerLaser(); }
  lancerLaser() { if (!this._rafL) this._rafL = requestAnimationFrame(() => this.animerLaser()); }
  animerLaser() {
    this._rafL = 0;
    const t = performance.now(), D = this.laserDelai, F = 450;
    let reste = false;
    for (const f of this.feuilles.values()) {
      const L = f.laser;
      if (!L) continue;
      for (const tr of L.traits) tr.pts = tr.pts.filter(q => t - q.t < D + F);              // les points éteints disparaissent par la queue
      L.traits = L.traits.filter(tr => tr.pts.length || !tr.fini);
      const c = L.ctx;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, L.cv.width, L.cv.height);
      if (!L.traits.length && !L.courant) { L.cv.remove(); f.laser = null; continue; }
      reste = true;
      const sc = L.cv.width / (parseFloat(f.cv.style.width) || 1);
      c.setTransform(sc * f.k, 0, 0, sc * f.k, sc * f.ox, sc * f.oy);                       // unités de la page ou du canevas
      c.lineCap = "round"; c.lineJoin = "round";
      for (const tr of L.traits) this.tracerLaser(c, tr, t, D, F);
    }
    if (reste) this._rafL = requestAnimationFrame(() => this.animerLaser());
  }
  /* courbes quadratiques entre les milieux des points (tracé lisse), largeur selon la pression, opacité par paliers selon l'âge */
  tracerLaser(c, tr, t, D, F) {
    const P = tr.pts, n = P.length, PALIERS = 8;
    if (!n) return;
    const alpha = (q) => { const age = t - q.t, a = age <= D ? 1 : Math.max(0, 1 - (age - D) / F); return Math.ceil(a * PALIERS) / PALIERS; };
    const larg = (q) => 2.6 + 6.4 * q.p;
    const milieu = (a, b) => ({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});
    const segments = [];
    if (n === 1) segments.push({q: P[0], a: P[0], b: P[0], c: P[0]});
    else for (let i = 0; i < n; i++) {
      const debut = i === 0 ? P[0] : milieu(P[i - 1], P[i]), fin = i === n - 1 ? P[n - 1] : milieu(P[i], P[i + 1]);
      segments.push({q: P[i], a: debut, b: P[i], c: fin});
    }
    for (const passe of [0, 1]) {                                                           // 0 : halo, 1 : cœur
      c.strokeStyle = passe ? "rgb(255, 59, 48)" : "rgb(255, 110, 90)";
      for (const sg of segments) {
        const a = alpha(sg.q);
        if (a <= 0) continue;
        c.globalAlpha = passe ? a : a * .26;
        c.lineWidth = larg(sg.q) * (passe ? 1 : 2.4);
        c.beginPath(); c.moveTo(sg.a.x, sg.a.y); c.quadraticCurveTo(sg.b.x, sg.b.y, sg.c.x, sg.c.y); c.stroke();
        if (sg.a === sg.c) { c.beginPath(); c.arc(sg.a.x, sg.a.y, larg(sg.q) / 2, 0, 7); c.fillStyle = c.strokeStyle; c.fill(); }
      }
    }
    const tete = P[n - 1];
    if (!tr.fini && alpha(tete) > 0) { c.globalAlpha = 1; c.fillStyle = "rgba(255, 228, 220, .95)"; c.beginPath(); c.arc(tete.x, tete.y, larg(tete) * .42, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  }
  ouvrirTexte(f, x, y, opts = {}) {
    const p = f.page, ox = f.ox || 0, oy = f.oy || 0;
    let tx = opts.existant || (p.textes || []).find(t => x >= t.x - 14 && x <= t.x + (t.w || 420) + 14 && y >= t.y - 14 && y <= t.y + hauteurBloc(t) + 14);
    const nouveau = !tx;
    if (nouveau) {
      if (opts.bg) tx = {id: newId(), x: f.canevas ? x - 40 : Math.max(24, Math.min(x - 40, PAGE_L - 300)), y: f.canevas ? y - 30 : Math.max(24, y - 30), w: 260, t: "", c: "#2b2b2b", s: 24, bg: opts.bg};
      else tx = {id: newId(), x: f.canevas ? x : Math.max(10, Math.min(x, PAGE_L - 200)), y: f.canevas ? y - 14 : Math.max(10, y - 14), w: f.canevas ? 520 : Math.min(520, PAGE_L - 30 - x), t: "", c: this.coul, s: 28};
    }
    this.snap(p);
    if (!nouveau) { p.textes = p.textes.filter(t => t !== tx); this.peindre(p.id); }
    const pc = this.pc();
    const ta = el("textarea.cah-zone-texte" + (tx.bg ? ".note-adh" : ""), {style: {left: tx.x * f.k + ox + "px", top: tx.y * f.k + oy + "px", width: Math.max(160, (tx.w || 420) * f.k) + "px",
      fontSize: (tx.s || 28) * f.k + "px", color: estHex(tx.c) ? tx.c : pc.encre, background: tx.bg || "", minHeight: tx.bg ? (tx.w || 260) * .62 * f.k + "px" : ""}});
    ta.value = tx.t || "";
    f.div.append(ta);
    this.texteOuvert = ta;
    const ajuster = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", ajuster);
    ta.addEventListener("blur", () => {
      tx.t = ta.value.replace(/\s+$/, "");
      ta.remove(); this.texteOuvert = null;
      if (tx.t || tx.bg) { p.textes = (p.textes || []).concat([tx]); }
      this.peindre(p.id); this.modifie();
    });
    setTimeout(() => { ta.focus(); ajuster(); }, 20);
  }

  /* ----- autocollants (achetés dans la boutique avec des géos) : posés sur une page, glissés au doigt, au crayon ou à la souris */
  async ajouterAutocollant() {
    this.enregistrer();
    const s = await choisirAutocollant(this.pn.app);
    if (!s) return;
    const p = this.pageCourante || this.n.pages[0], f = p && this.feuilles.get(p.id);
    if (!f) return;
    const z = this.pagesZone.getBoundingClientRect(), r = f.cv.getBoundingClientRect(), m = AC_TAILLE / 2;
    let x = (z.left + z.width / 2 - r.left - (f.ox || 0)) / f.k, y = (z.top + z.height / 2 - r.top - (f.oy || 0)) / f.k;
    if (!f.canevas) { x = Math.max(m, Math.min(PAGE_L - m, x)); y = Math.max(m, Math.min(p.h - m, y)); }
    if (!Array.isArray(this.n.autocollants)) this.n.autocollants = [];
    const a = {id: newId(), s, p: p.id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, t: AC_TAILLE};
    this.snap(p);
    this.n.autocollants.push(a);
    this.choisirAc(a.id); this.modifie(); Geos.maj(this.pn.app);
  }
  /* autocollant choisi (v30/v28) : cadre, ✕, poignée de taille et barre flottante (Dupliquer, Retirer) ; null = aucun */
  choisirAc(id) {
    if (id && this.sel) this.deselect();
    this.acChoisi = id;
    for (const x of this.feuilles.values()) this.majAutocollants(x);
    if (!id) { if (!this.sel) this.barreSel.hidden = true; return; }
    remplirBarreAc(this.barreSel, {dupliquer: () => this.dupliquerAc(), fermer: () => this.choisirAc(null), tourner: (d) => this.tournerAc(d),
      retirer: () => { const a = (this.n.autocollants || []).find(x => x.id === this.acChoisi), f = a && this.feuilles.get(a.p); if (f) this.rappelsAc(f).retirer(a); }});
    this.eviterBarre();
  }
  /* la barre flottante ne cache ni l'autocollant choisi ni la poignée de la sélection */
  eviterBarre() {
    const el = [];
    for (const f of this.feuilles.values()) {
      if (this.acChoisi && f.acZones && f.acZones.get(this.acChoisi)) { const z = f.acZones.get(this.acChoisi); el.push(z, z.querySelector(".ac-rot")); }
      if (f.selPoignee && !f.selPoignee.hidden) el.push(f.selPoignee);
      if (f.selRot && !f.selRot.hidden) el.push(f.selRot);
    }
    eviterRecouvrement(this.barreSel, el);
  }
  /* dupliquer l'autocollant choisi : copie décalée de 20, même image et même taille, nouvel id ; elle devient l'autocollant choisi */
  dupliquerAc() {
    const a = (this.n.autocollants || []).find(x => x.id === this.acChoisi), f = a && this.feuilles.get(a.p);
    if (!f) return;
    this.snap(f.page);
    const c = copieAutocollant(a, 20, f.canevas ? null : [PAGE_L, f.page.h]);
    this.n.autocollants.push(c);
    this.choisirAc(c.id); this.modifie();
  }
  /* tourner l'autocollant choisi de d degrés (bouton ↺ / ↻ : pas de 15°) ; une étape d'annulation */
  tournerAc(d) {
    const a = (this.n.autocollants || []).find(x => x.id === this.acChoisi), f = a && this.feuilles.get(a.p);
    if (!f) return;
    this.snap(f.page); poserAngleAc(a, (a.r || 0) + d); this.majAutocollants(f); this.modifie();
    requestAnimationFrame(() => this.eviterBarre());
  }
  majAutocollants(f) {
    const liste = autocollantsNote(this.n).filter(a => a.p === f.page.id);
    if (!f.acZones) f.acZones = new Map();
    for (const [id, z] of f.acZones) if (!liste.some(a => a.id === id)) { z.remove(); f.acZones.delete(id); }
    for (const a of liste) {
      let z = f.acZones.get(a.id);
      if (!z) { z = zoneAutocollant(a, this.rappelsAc(f)); f.div.append(z); f.acZones.set(a.id, z); }
      z._ac = a;
      const t = a.t * f.k;
      z.style.cssText = `left:${(a.x - a.t / 2) * f.k + (f.ox || 0)}px;top:${(a.y - a.t / 2) * f.k + (f.oy || 0)}px;width:${t}px;height:${t}px;--ac-r:${a.r || 0}deg`;
      z.classList.toggle("choisi", this.acChoisi === a.id);
    }
  }
  rappelsAc(f) {
    return {
      debut: (g) => { this.acGeste = g; this.snap(f.page); g.snap = this.histo.length; },
      bouge: (a, g, dx, dy) => {
        let x = g.x0 + dx / f.k, y = g.y0 + dy / f.k;
        if (!f.canevas) { const m = a.t / 2; x = Math.max(m, Math.min(PAGE_L - m, x)); y = Math.max(m, Math.min(f.page.h - m, y)); }
        a.x = Math.round(x * 10) / 10; a.y = Math.round(y * 10) / 10;
        this.majAutocollants(f);
      },
      taille: (a, t) => {
        a.t = t;
        if (!f.canevas) { const m = t / 2; a.x = Math.max(m, Math.min(PAGE_L - m, a.x)); a.y = Math.max(m, Math.min(f.page.h - m, a.y)); }
        this.majAutocollants(f);
      },
      rot: (a, r) => { poserAngleAc(a, r); this.majAutocollants(f); },
      fin: (a, g, annule) => {
        this.acGeste = null;
        if (g.deplace && annule) { a.x = g.x0; a.y = g.y0; }
        if (g.deplace && !annule) this.modifie();
        if (g.deplace) requestAnimationFrame(() => this.eviterBarre());
        if ((!g.deplace || annule) && this.histo.length === g.snap) this.histo.pop();      // rien n'a changé : pas d'étape d'annulation
        if (g.taille) { this.majAutocollants(f); return; }
        if (!g.deplace) { this.choisirAc(this.acChoisi === a.id ? null : a.id); return; }
        this.majAutocollants(f);
      },
      retirer: (a) => { this.snap(f.page); this.n.autocollants = (this.n.autocollants || []).filter(x => x.id !== a.id); this.choisirAc(null); this.modifie(); Geos.maj(this.pn.app); },
    };
  }

  /* ----- post-it : se déplace en le glissant (doigt, Apple Pencil ou souris, sans lasso) ; un appui le rend translucide, un second le rétablit ;
     un double appui ouvre l'édition du texte */
  boitePostit(f, t) {
    const m = 14 * f.k, w = (t.w || 260) * f.k, h = hauteurBloc(t) * f.k;
    return {x: t.x * f.k + f.ox - m, y: t.y * f.k + f.oy - m, w: w + 2 * m, h: h + 2 * m};
  }
  majPostits(f) {
    const liste = (f.page.textes || []).filter(t => t.bg && t.id);
    if (!f.zones) f.zones = new Map();
    for (const [id, z] of f.zones) if (!liste.some(t => t.id === id) || z._tx.id !== id) { z.remove(); f.zones.delete(id); }
    for (const t of liste) {
      let z = f.zones.get(t.id);
      if (!z) { z = el("div.postit-zone"); this.brancherPostit(f, z); f.div.append(z); f.zones.set(t.id, z); }
      z._tx = t;
      const b = this.boitePostit(f, t);
      z.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;
      z.classList.toggle("translucide", !!t.tr);
    }
  }
  brancherPostit(f, z) {
    z.addEventListener("pointerdown", (e) => {
      if (e.button > 0 || this.pince) return;
      e.preventDefault(); e.stopPropagation();
      if (this.texteOuvert) { this.texteOuvert.blur(); return; }
      if (this.postit) return;
      try { z.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      const tx = z._tx;
      this.postit = {id: e.pointerId, f, z, tx, sx: e.clientX, sy: e.clientY, x0: tx.x, y0: tx.y, deplace: false};
      z.classList.add("saisi");
    });
    z.addEventListener("pointermove", (e) => {
      const g = this.postit;
      if (!g || g.id !== e.pointerId || g.z !== z) return;
      e.preventDefault();
      const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
      if (!g.deplace) {
        if (Math.hypot(dx, dy) <= 8) return;                       // en dessous du seuil : c'est un appui, pas un déplacement
        g.deplace = true; this.snap(f.page);
      }
      const t = g.tx, k = f.k;
      let nx = g.x0 + dx / k, ny = g.y0 + dy / k;
      if (!f.canevas) {                                            // reste dans la page
        nx = Math.max(14, Math.min(PAGE_L - (t.w || 260) - 14, nx)); ny = Math.max(14, Math.min(f.page.h - hauteurBloc(t) - 14, ny));
      }
      t.x = Math.round(nx * 10) / 10; t.y = Math.round(ny * 10) / 10;
      if (!g.raf) g.raf = requestAnimationFrame(() => { g.raf = 0; if (this.postit === g) this.peindre(f.page.id); });
    });
    const fin = (e, annule) => {
      const g = this.postit;
      if (!g || g.id !== e.pointerId || g.z !== z) return;
      this.postit = null; z.classList.remove("saisi");
      try { z.releasePointerCapture(e.pointerId); } catch (er) { /* */ }
      cancelAnimationFrame(g.raf);
      if (annule) { if (g.deplace) { g.tx.x = g.x0; g.tx.y = g.y0; } this.peindre(f.page.id); return; }
      if (g.deplace) { this.peindre(f.page.id); this.modifie(); this.dessinerMiniatures(); return; }
      this.toucherPostit(f, g.tx);
    };
    z.addEventListener("pointerup", (e) => fin(e, false));
    z.addEventListener("pointercancel", (e) => fin(e, true));
    z.addEventListener("lostpointercapture", (e) => fin(e, true));
    z.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  annulerPostit() {
    const g = this.postit;
    if (!g) return;
    this.postit = null; g.z.classList.remove("saisi"); cancelAnimationFrame(g.raf);
    if (g.deplace) { g.tx.x = g.x0; g.tx.y = g.y0; }
    this.peindre(g.f.page.id);
  }
  /* un appui : bascule la transparence ; deux appuis rapprochés : annule ce basculement et ouvre l'édition */
  toucherPostit(f, tx) {
    const maintenant = performance.now(), d = this.dernierTap;
    if (d && d.tx === tx && maintenant - d.t < 380) {
      this.dernierTap = null;
      if (d.avant) tx.tr = 1; else delete tx.tr;
      this.peindre(f.page.id); this.modifie();
      this.ouvrirTexte(f, tx.x + 4, tx.y + 4, {existant: tx});
      return;
    }
    this.dernierTap = {tx, t: maintenant, avant: !!tx.tr};
    if (tx.tr) delete tx.tr; else tx.tr = 1;
    this.peindre(f.page.id); this.modifie();
  }

  /* ----- annuler / rétablir (par page) */
  /* une étape d'annulation = la page (traits, textes) + les autocollants de la note (v30/v28) */
  snap(p) { this.editees.add(p.id); this.histo.push({p, traits: clone(p.traits), textes: clone(p.textes || []), ac: clone(this.n.autocollants || [])}); if (this.histo.length > 60) this.histo.shift(); this.refait = []; }
  /* une page que l'utilisateur a lui-même vidée reçoit un marqueur : sans lui, une page vide n'est jamais envoyée par-dessus un contenu */
  majVides() {
    for (const p of this.n.pages) {
      if (!this.editees.has(p.id)) continue;
      if (!p.traits.length && !(p.textes || []).length) p.vide = 1; else delete p.vide;
    }
  }
  annuler() {
    const h = this.histo.pop(); if (!h) return;
    this.editees.add(h.p.id);
    this.refait.push({p: h.p, traits: clone(h.p.traits), textes: clone(h.p.textes || []), ac: clone(this.n.autocollants || [])});
    this.restaurer(h);
  }
  refaire() {
    const h = this.refait.pop(); if (!h) return;
    this.editees.add(h.p.id);
    this.histo.push({p: h.p, traits: clone(h.p.traits), textes: clone(h.p.textes || []), ac: clone(this.n.autocollants || [])});
    this.restaurer(h);
  }
  restaurer(h) {
    h.p.traits = h.traits; h.p.textes = h.textes;
    if (h.ac) this.n.autocollants = h.ac;
    this.acChoisi = null; this.deselect(); this.peindre(h.p.id);
    if (h.ac) for (const x of this.feuilles.values()) if (x.page !== h.p) this.majAutocollants(x);
    this.modifie();
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
      if (e.target.closest && e.target.closest(".feuille.canevas")) return;          // le canevas gère son propre zoom
      if (this.postit) this.annulerPostit();
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
    this.majVides();
    this.pn.sale = true; this.etat.textContent = "Modification…";
    clearTimeout(this._j); this._j = setTimeout(() => this.enregistrer(), 900);
  }
  enregistrer() {
    clearTimeout(this._j);
    this.enregistrerVue();
    if (this.texteOuvert) this.texteOuvert.blur();
    if (!this.pn.sale) return;
    this.pn.sale = false;
    this.n.maj = nowIsoMinutes();
    this.pn.app.sauver();
    this.etat.textContent = "Enregistré ✓";
    clearTimeout(this._jm); this._jm = setTimeout(() => this.majMiniatures(), 200);
  }
  /* miniatures : seules les vignettes des pages modifiées sont redessinées, sur place (même taille), et jamais pendant une saisie */
  majMiniatures() {
    clearTimeout(this._jm);
    if (!this.miniatures) return;
    if (this.geste || this.pince || this.selGeste || this.acGeste || (this.actif && Date.now() - this.actif < 700)) { this._jm = setTimeout(() => this.majMiniatures(), 400); return; }
    for (const b of this.mini.querySelectorAll(".mini[data-p]")) {
      const p = this.n.pages.find(x => x.id === b.dataset.p), c = b.querySelector("canvas");
      if (p && c && this.editees.has(p.id)) c.replaceWith(canvasPage(p, this.n.papier, 110));
    }
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
