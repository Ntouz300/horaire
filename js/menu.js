/* Menu de l'application : barre de navigation, Accueil, Notes, Résultats, gestion des horaires (comme sur le PC). */
"use strict";

const MOIS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/* ---------- personnalisation du menu (réglage synchronisé « menu ») */
const APPS_MENU = [["accueil", "Accueil"], ["horaire", "Horaire"], ["notes", "Notes"], ["resultats", "Résultats"], ["objets3d", "3D"], ["transferts", "Transferts"], ["youtube", "YouTube"], ["musique", "Musique"], ["horloge", "Horloge"]];
const SECTIONS_ACCUEIL = [["maintenant", "En ce moment"], ["applications", "Applications"], ["examen", "Prochain examen"],
  ["avenir", "À venir"], ["notes", "Notes récentes"], ["horaires", "Mes horaires"]];
const SECTIONS_LARGES = ["maintenant", "applications"];
function configMenu(reg) {
  const m = reg && typeof reg.menu === "object" && reg.menu ? reg.menu : {};
  const ordre = (Array.isArray(m.apps) ? m.apps : []).filter(k => APPS_MENU.some(a => a[0] === k));
  for (const [k] of APPS_MENU) if (!ordre.includes(k)) ordre.push(k);
  const sec = (Array.isArray(m.sections) ? m.sections : []).filter(k => SECTIONS_ACCUEIL.some(a => a[0] === k));
  for (const [k] of SECTIONS_ACCUEIL) if (!sec.includes(k)) sec.push(k);
  return {apps: ordre.filter(k => k !== "accueil").concat([]), caches: (Array.isArray(m.caches) ? m.caches : []).filter(k => k !== "accueil"),
    compact: !!m.compact, sections: sec, sections_off: Array.isArray(m.sections_off) ? m.sections_off : [],
    fond: ["uni", "degrade", "motif"].includes(m.fond) ? m.fond : "degrade", depart: ["accueil", "horaire", "notes", "resultats"].includes(m.depart) ? m.depart : "accueil",
    salut: m.salut !== false};
}
function appsVisibles(cfg) { return ["accueil"].concat(cfg.apps.filter(k => !cfg.caches.includes(k))); }
function nomApp(k) { return (APPS_MENU.find(a => a[0] === k) || ["", k])[1]; }

function couleurApp(page) {
  const cats = (THEMES[T.REG_THEME] || THEMES.nuit).cats;
  return {horaire: T.ACCENT, notes: cats.meca, resultats: cats.perso, horloge: cats.travail, objets3d: cats.graph, transferts: cats.info, youtube: cats.ethique, musique: cats.travail, accueil: T.ACCENT}[page] || T.ACCENT;
}
/* icône d'une page ; en thème Minecraft, le sticker pixel-art correspondant */
function iconePage(page, taille = 22) {
  const j = iconesJeu();
  if (j && j.ligne && j.page[page]) return icone(j.page[page], taille);
  if (j && j.page[page]) {
    return el("img.ico-pixel", {src: spriteURL(j.page[page], 4), alt: "", style: {width: taille + "px", height: taille + "px"}});
  }
  return icone(page, taille);
}
function initiales(nom) {
  const lettres = nom.split(/\s+/).filter(m => m && !/^\d/.test(m)).map(m => m[0]).join("").slice(0, 2).toUpperCase();
  const chiffres = (nom.match(/\d/g) || []).join("").slice(-2);
  return (lettres + chiffres) || nom.slice(0, 3).toUpperCase();
}
function plageHoraire(h) {
  const a = isoDate(h.debut), b = finHoraire(h);
  return a.getFullYear() === b.getFullYear() ? `${dateCourte(a)} – ${dateCourte(b)} ${b.getFullYear()}` : `${dateCourte(a)} ${a.getFullYear()} – ${dateCourte(b)} ${b.getFullYear()}`;
}
function salutation() {
  const h = new Date().getHours();
  return h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
}
function fmtPct(x) { return x.toFixed(1).replace(".", ",") + " %"; }
function bilanCours(ses, cle) {
  const evals = ses.echeances.filter(e => e.cours === cle && (num(e.poids) || 0) > 0)
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || (a.quoi || "").localeCompare(b.quoi || ""));
  const total = evals.reduce((s, e) => s + num(e.poids), 0);
  const notees = evals.filter(e => num(e.resultat) !== null);
  const corrige = notees.reduce((s, e) => s + num(e.poids), 0);
  const acquis = notees.reduce((s, e) => s + num(e.poids) * num(e.resultat) / 100, 0);
  return {evals, total, corrige, acquis, moyenne: corrige ? acquis / corrige * 100 : null};
}
function moyenneGenerale(ses) {
  const m = COURS_KEYS.map(k => bilanCours(ses, k).moyenne).filter(x => x !== null);
  return m.length ? [m.reduce((a, b) => a + b, 0) / m.length, m.length] : [null, 0];
}
function barreProgres(frac, col, classe = "") {
  return el("div.prog-barre" + classe, null, el("span", {style: {width: Math.max(0, Math.min(1, frac)) * 100 + "%", background: col}}));
}

/* ---------- thème Hollow Knight : geo, jauge de masques, carte des horaires (mêmes calculs que sur le PC) */
function themeHK() { return T.DECOR === "hollow"; }
/* geo : 10 par échéance terminée dans l'horaire actif (calculé, rien de nouveau n'est enregistré) */
function geoHoraire(ses) { return ((ses && ses.echeances) || []).filter(e => e.fait).length * 10; }
function geoPastille(app) {
  return el("div.geo", {title: "10 geo par échéance terminée dans cet horaire"}, icone("hk_geo", 18), el("b", {texte: String(geoHoraire(app.ses))}), el("span", {texte: "geo"}));
}
function masqueSVG(plein, taille) {
  const p = [];
  for (let i = 0; i < MASQUE_HK.length; i += 2) p.push(MASQUE_HK[i] + " " + MASQUE_HK[i + 1]);
  const yeux = plein ? '<circle cx="9.2" cy="11.4" r="1.65"/><circle cx="14.8" cy="11.4" r="1.65"/>' : "";
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" class="${plein ? "plein" : "vide"}" aria-hidden="true"><path d="M${p.join(" L")} Z" stroke-width="1.4" stroke-linejoin="round"/>${yeux}</svg>`;
}
/* 5 masques : la part de l'objectif atteinte (arrondie au masque près) */
function nbMasques(frac) { return Math.max(0, Math.min(5, Math.round((Number(frac) || 0) * 5))); }
function jaugeMasques(frac, taille = 20, titre = "") {
  const n = nbMasques(frac);
  const s = el("span.masques", {title: titre || `${n} masque${n > 1 ? "s" : ""} sur 5`});
  s.innerHTML = Array.from({length: 5}, (_, i) => masqueSVG(i < n, taille)).join("");
  return s;
}
function graineTexte(t) { let h = 2166136261; for (const ch of String(t)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return h || 1; }
function aleaGraine(g) { let x = (g >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
/* contour bosselé d'une salle de la carte (super-ellipse + petits écarts tirés de l'id) */
function contourSalle(cx, cy, w, h, graine) {
  const a = aleaGraine(graine), pts = [];
  for (let k = 0; k < 32; k++) {
    const t = k / 32 * 2 * Math.PI, c = Math.cos(t), s = Math.sin(t);
    pts.push([cx + (w / 2 - 4) * Math.sign(c) * Math.pow(Math.abs(c), .45) + (a() - .5) * 6,
      cy + (h / 2 - 4) * Math.sign(s) * Math.pow(Math.abs(s), .45) + (a() - .5) * 6]);
  }
  return pts;
}
/* disposition des salles : colonnes en serpentin (gauche → droite, puis droite → gauche) */
function dispositionCarte(n, cols, largeur, hauteurLigne) {
  const out = [], lc = largeur / cols;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), k = i % cols, col = r % 2 ? cols - 1 - k : k;
    out.push([col * lc + lc / 2, r * hauteurLigne + hauteurLigne / 2, lc - 30, hauteurLigne - 44]);
  }
  return out;
}
/* chemins entre salles voisines : d'un bord à l'autre (même rangée) ou du bas vers le haut (rangée suivante) */
function cheminsCarte(pos) {
  const out = [];
  for (let i = 0; i + 1 < pos.length; i++) {
    const [x0, y0, w0, h0] = pos[i], [x1, y1, w1, h1] = pos[i + 1];
    if (Math.abs(y0 - y1) < 1) {
      const sg = x1 > x0 ? 1 : -1, xa = x0 + sg * (w0 / 2 - 2), xb = x1 - sg * (w1 / 2 - 2);
      out.push([xa, y0, (xa + xb) / 2, y0 + 16, xb, y1]);
    } else {
      const ya = y0 + h0 / 2 - 2, yb = y1 - h1 / 2 + 2;
      out.push([x0, ya, x0 + (x0 < 300 ? -24 : 24), (ya + yb) / 2, x1, yb]);
    }
  }
  return out;
}
function carteHoraires(app, apres) {
  const hs = listeHoraires(app.donnees), tel = document.body.classList.contains("tel");
  const cols = Math.max(1, Math.min(hs.length, tel ? 2 : 3)), LW = 600, LH = tel ? 230 : 172;
  const pos = dispositionCarte(hs.length, cols, LW, LH), H = Math.ceil(hs.length / cols) * LH;
  let svg = `<svg class="ch-fond" viewBox="0 0 ${LW} ${H}" preserveAspectRatio="none" aria-hidden="true">`;
  for (const [xa, ya, qx, qy, xb, yb] of cheminsCarte(pos)) {           // chemins en pointillés d'une salle à la suivante
    svg += `<path d="M${xa} ${ya} Q${qx} ${qy} ${xb} ${yb}" fill="none" stroke="rgba(232,226,208,.34)" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  }
  hs.forEach((h, i) => {
    const [cx, cy, w, hh] = pos[i], actif = h.id === HID;
    const d = "M" + contourSalle(cx, cy, w, hh, graineTexte(h.id)).map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z";
    if (actif) svg += `<path d="${d}" fill="none" stroke="rgba(201,168,92,.16)" stroke-width="7" vector-effect="non-scaling-stroke"/>`;
    svg += `<path d="${d}" fill="${actif ? "rgba(201,168,92,.08)" : "rgba(232,226,208,.035)"}" stroke="${actif ? "#c9a85c" : "rgba(232,226,208,.5)"}" stroke-width="${actif ? 2 : 1.4}" vector-effect="non-scaling-stroke"/>`;
  });
  svg += "</svg>";
  const z = el("div.carte-hk", {style: {aspectRatio: `${LW} / ${H}`}, html: svg});
  hs.forEach((h, i) => {
    const [cx, cy, w, hh] = pos[i], actif = h.id === HID;
    const mod = boutonIcone("crayon", "", () => { if (apres) apres(); new HoraireEditeur(app, h).montrer(); }, "tab");
    mod.classList.add("petit", "ch-mod");
    const b = el("div.ch-salle", {role: "button", tabindex: "0", title: actif ? `${h.nom} (horaire affiché)` : `Aller à ${h.nom}`,
      style: {left: (cx - w / 2) / LW * 100 + "%", top: (cy - hh / 2) / H * 100 + "%", width: w / LW * 100 + "%", height: hh / H * 100 + "%"},
      onclick: (e) => { if (mod.contains(e.target)) return; if (apres) apres(); app.choisirHoraire(h.id); }},
      actif ? el("span.ch-ici", null, icone("hk_banc", 12), "VOUS ÊTES ICI") : null,
      el("b", {texte: h.nom}), el("span.petit", {texte: plageHoraire(h)}), el("span.petit", {texte: `${h.nb} semaines`}), mod);
    z.append(b);
  });
  return el("div", null, z, el("div.ch-legende", {texte: "CARTE DES HORAIRES · TOUCHE UNE SALLE POUR T'Y RENDRE"}));
}

/* ---------- barre de navigation */
class Rail {
  constructor(app) {
    this.app = app;
    this.logo = el("button.rail-logo", {type: "button", onclick: () => new ChoixHoraire(app).montrer()});
    this.items = {};
    const cfg = configMenu(app.reglages);
    const haut = el("div.rail-items");
    const vis = appsVisibles(cfg);
    // iPhone : les 4 premières applications du menu vont dans la barre du bas, les autres dans « Plus »
    this.horsBarre = vis.slice(4);
    vis.forEach((cle, i) => { haut.append(this.items[cle] = this.item(cle, nomApp(cle))); if (i >= 4) this.items[cle].classList.add("hors-barre"); });
    this.btnPlus = el("button.rail-item.rail-plus", {type: "button", onclick: () => new MenuPlus(app, this).montrer()},
      el("span.rail-ico", null, icone("liste", 24)), el("span.rail-lbl", {texte: "Plus"}));
    haut.append(this.btnPlus);
    this.items.reglages = this.item("reglages", "Réglages");
    this.lblSync = el("div.rail-sync", {onclick: () => app.ouvrirSynchro()});
    this.el = el("nav.rail" + (cfg.compact ? ".compact" : ""), null, this.logo, haut, el("div.espace"), this.lblSync,
      el("button.rail-item.rail-perso", {type: "button", title: "Personnaliser le menu", onclick: () => new PersonnaliserMenu(app).montrer()}, el("span.rail-ico", null, icone("grille", 20)), el("span.rail-lbl", {texte: "Menu"})),
      this.items.reglages);
    this.maj();
  }
  item(cle, titre) {
    return el("button.rail-item", {type: "button", "data-p": cle, onclick: () => {
      if (cle === "horloge") this.app.ouvrirHorloge();
      else if (cle === "reglages") new Reglages(this.app).montrer();
      else this.app.aller(cle);
    }}, el("span.rail-ico"), el("span.rail-lbl", {texte: titre}));
  }
  maj() {
    document.documentElement.style.setProperty("--c-notes", couleurApp("notes"));
    const h = metaHoraire(this.app.donnees, HID);
    this.logo.innerHTML = "";
    this.logo.append(el("span.logo-carre", {texte: initiales(h.nom)}), el("span.logo-nom", {texte: h.nom}));
    this.logo.title = h.nom;
    for (const [cle, b] of Object.entries(this.items)) {
      const actif = this.app.page === cle;
      b.classList.toggle("actif", actif);
      b.style.setProperty("--c", couleurApp(cle));
      const ic = b.querySelector(".rail-ico");
      ic.innerHTML = "";
      ic.append(iconePage(cle, 24));
    }
    this.btnPlus.classList.toggle("actif", this.horsBarre.includes(this.app.page));
    this.btnPlus.style.setProperty("--c", T.ACCENT);
  }
}

/* iPhone : tout ce qui ne tient pas dans la barre du bas (autres applications, horaire actif, menu, réglages, synchro) */
class MenuPlus extends Modal {
  constructor(app, rail) {
    super("Plus", null, {classe: "menu-plus"});
    const h = metaHoraire(app.donnees, HID);
    const ligne = (ico, titre, sous, action, col) => el("button.mp-ligne", {type: "button", style: {"--c": col || T.ACCENT}, onclick: () => { this.fermer(); action(); }},
      el("span.badge", null, ico), el("span.mp-txt", null, el("b", {texte: titre}), sous ? el("span.petit.muted", {texte: sous}) : null), el("span.mp-fleche", null, icone("fleche", 18)));
    const g = el("div.mp-liste");
    for (const cle of rail.horsBarre) {
      g.append(ligne(iconePage(cle, 24), nomApp(cle), cle === app.page ? "Ouvert" : "", () => cle === "horloge" ? app.ouvrirHorloge() : app.aller(cle), couleurApp(cle)));
    }
    g.append(ligne(el("span.logo-carre.mini", {texte: initiales(h.nom)}), "Horaire : " + h.nom, "Changer d'horaire ou de session", () => new ChoixHoraire(app).montrer()),
      ligne(icone("grille", 22), "Personnaliser le menu", "Ordre des applications de la barre du bas", () => new PersonnaliserMenu(app).montrer(), T.MUTED),
      ligne(icone("reglages", 22), "Réglages", "Thème, texte, heures affichées…", () => new Reglages(app).montrer(), T.MUTED),
      ligne(el("span.mp-sync", {texte: "●", style: {color: (rail.lblSync.style.color || T.MUTED)}}), "Synchronisation", (rail.lblSync.title || "État de la synchro"), () => app.ouvrirSynchro(), T.MUTED));
    this.carte.append(g);
    this.barre([], [bouton("Fermer", () => this.fermer())]);
  }
}

/* ---------- page d'accueil */
class PageAccueil {
  constructor(app) {
    this.app = app;
    this.el = el("div.ecran.ecran-defile.ecran-accueil");
  }
  tic() {
    if (this.lblH) this.lblH.textContent = new Date().toTimeString().slice(0, 5);
  }
  rafraichir() {
    const app = this.app, now = new Date(), a = aujourdhui();
    const h = metaHoraire(app.donnees, HID);
    const z = this.el;
    z.innerHTML = "";
    const idx = Math.floor(joursEntre(SESSION_DEBUT, lundiDe(a)) / 7);
    const sous = idx >= 0 && idx < SESSION_SEMAINES ? `${h.nom}  ·  semaine ${idx + 1} sur ${SESSION_SEMAINES}`
      : idx < 0 ? `${h.nom}  ·  commence ${quand(SESSION_DEBUT)}` : `${h.nom}  ·  terminé`;
    const prenom = String(app.reglages.prenom ?? DEFAUT_REGLAGES.prenom ?? "").trim();
    this.lblH = el("div.acc-heure", {texte: now.toTimeString().slice(0, 5), onclick: () => app.ouvrirHorloge()});
    const res = app.outils.resume();
    const cfg = configMenu(app.reglages);
    z.append(el("header.acc-entete.fond-" + cfg.fond, null,
      el("div", null,
        el("div.mono.muted", {texte: `${JOURS[jourSemaine(now)]} ${now.getDate()} ${MOIS_LONG[now.getMonth()]} ${now.getFullYear()}`.toUpperCase()}),
        el("h1.acc-salut", {texte: cfg.salut ? salutation() + (prenom ? `, ${prenom}` : "") : h.nom}),
        el("div.muted", {texte: sous})),
      el("div.acc-droite", null, this.lblH, res ? el("div.mono", {texte: res, style: {color: couleurApp("horloge")}}) : null,
        themeHK() ? el("div", null, geoPastille(app)) : null,
        petit("Personnaliser", () => new PersonnaliserMenu(app).montrer(), "tab"))));
    let paire = null;
    for (const s of cfg.sections) {
      if (cfg.sections_off.includes(s)) continue;
      const bloc = this.section(s, now, cfg);
      if (!bloc) continue;
      if (SECTIONS_LARGES.includes(s)) { paire = null; z.append(bloc); continue; }
      if (!paire) { paire = el("div.acc-bas"); z.append(paire); paire.append(bloc); }
      else { paire.append(bloc); paire = null; }
    }
  }
  section(s, now, cfg) {
    if (s === "maintenant") return this.maintenant(now);
    if (s === "applications") {
      const visibles = appsVisibles(cfg);
      const tuiles = el("div.acc-tuiles");
      const t = this.tuiles(now).filter(x => visibles.includes(x[0])).sort((a, b) => visibles.indexOf(a[0]) - visibles.indexOf(b[0]));
      for (const x of t) tuiles.append(this.tuile(...x));
      tuiles.style.setProperty("--n", String(Math.max(1, Math.min(4, t.length))));
      return el("div", null, el("div.etiquette.acc-titre", {texte: "APPLICATIONS"}), tuiles);
    }
    if (s === "avenir") return this.aVenir();
    if (s === "horaires") return this.horaires();
    if (s === "examen") return this.examen();
    if (s === "notes") return this.notesRecentes();
    return null;
  }
  examen() {
    const a = aujourdhui();
    const ex = this.app.ses.echeances.filter(e => !e.fait && ["intra", "final"].includes(e.type) && isoDate(e.date) && isoDate(e.date) >= a)
      .sort((x, y) => x.date.localeCompare(y.date))[0];
    const c = el("section.carte.acc-carte.acc-examen");
    c.append(el("h2", {texte: "Prochain examen"}));
    if (!ex) { c.append(el("div.muted", {texte: "Aucun examen à venir dans cet horaire."})); return c; }
    const d = isoDate(ex.date), j = joursEntre(a, d), col = couleur(CATS[ex.cours] ? ex.cours : "perso");
    c.style.setProperty("--c", col);
    c.append(el("div.ex-ligne", null, el("div.ex-jours", null, el("b", {texte: String(j)}), el("span", {texte: j > 1 ? "jours" : "jour"})),
      el("div", null, el("div.ex-titre", {texte: `${CATS[ex.cours] ? CATS[ex.cours][1] + " · " : ""}${ex.quoi || "Examen"}`}),
        el("div.petit.muted", {texte: `${JOURS[jourSemaine(d)]} ${d.getDate()} ${MOIS_LONG[d.getMonth()]}` + (ex.heure ? ` à ${fmt(ex.heure)}` : "") + (ex.poids ? `  ·  ${ex.poids} %` : "")}))));
    c.addEventListener("click", () => new EcheanceEditeur(this.app, ex).montrer());
    return c;
  }
  notesRecentes() {
    const app = this.app;
    const c = el("section.carte.acc-carte");
    c.append(el("div.ac-tete", null, el("h2", {texte: "Notes récentes"}), petit("Bibliothèque", () => app.aller("notes"), "tab")));
    const ns = app.donnees.notes.slice().sort((x, y) => (y.maj || "").localeCompare(x.maj || "")).slice(0, 4);
    if (!ns.length) { c.append(el("div.muted", {texte: "Aucune note pour l'instant."})); return c; }
    const g = el("div.acc-notes");
    for (const n of ns) {
      const v = el("div.an-vig");
      if (n.type === "cahier" && n.couverture) v.append(el("div.couverture", {style: {"--c": n.couverture}}, el("span.cv-dos")));
      else if (n.type === "cahier") v.append(canvasPage(n.pages[0], n.papier, 84));
      else { const pc = couleursPapier(n.papier); v.append(el("div.doc-texte", {style: {background: pc.fond, color: pc.encre}}, el("span", {texte: (n.texte || "").slice(0, 120)}))); }
      g.append(el("button.an-doc", {type: "button", onclick: () => app.ouvrirNotes(n.id)}, v, el("span.an-titre", {texte: n.titre || "Sans titre"})));
    }
    c.append(g);
    return c;
  }
  maintenant(now) {
    const app = this.app, m = now.getHours() * 60 + now.getMinutes();
    const blocs = app.blocsDe(aujourdhui());
    const enCours = blocs.find(b => toMin(b.debut) <= m && m < toMin(b.fin));
    const prochain = blocs.find(b => toMin(b.debut) > m);
    const b = enCours || prochain;
    const col = b ? couleur(CATS[b.cat] ? b.cat : "perso") : T.ACCENT;
    const c = el("section.carte.acc-maint", {style: {"--c": col}, onclick: () => app.aller("horaire")});
    const txt = el("div.am-txt"), droite = el("div.am-droite");
    c.append(el("span.am-barre"), txt, droite);
    if (!b) {
      const demain = app.blocsDe(ajouterJours(aujourdhui(), 1));
      txt.append(el("div.mono.muted", {texte: "AUJOURD'HUI"}), el("div.am-titre", {texte: "Plus rien de prévu"}),
        el("div.muted", {texte: demain.length ? `Demain : ${demain[0].titre || "Sans titre"} à ${fmt(demain[0].debut)}` : "Profites-en pour souffler."}));
      return c;
    }
    const cat = CATS[b.cat] ? CATS[b.cat][1] : "Perso";
    txt.append(el("div.mono", {texte: (enCours ? "EN CE MOMENT" : "PROCHAIN") + "  ·  " + cat.toUpperCase(), style: {color: col}}),
      el("div.am-titre", {texte: b.titre || "Sans titre"}),
      el("div.muted", {texte: `${fmt(b.debut)} – ${fmt(b.fin)}` + (b.lieu ? `   ·   ${b.lieu}` : "")}));
    if (enCours) {
      const deb = toMin(b.debut), fin = toMin(b.fin), reste = fin - m;
      txt.append(barreProgres((m - deb) / Math.max(1, fin - deb), col, ".am-prog"));
      droite.append(el("div.am-grand", {texte: reste >= 60 ? fmtDuree(reste) : reste + " min"}), el("div.petit.muted", {texte: "avant la fin"}));
    } else {
      const dans = toMin(b.debut) - m;
      droite.append(el("div.am-grand", {texte: dans < 60 ? dans + " min" : fmtDuree(dans)}), el("div.petit.muted", {texte: "avant le début"}));
    }
    return c;
  }
  tuiles(now) {
    const app = this.app, ses = app.ses, a = aujourdhui();
    const idx = Math.floor(joursEntre(SESSION_DEBUT, lundiDe(a)) / 7);
    const semaine = idx >= 0 && idx < SESSION_SEMAINES ? `Semaine ${idx + 1}/${SESSION_SEMAINES}` : metaHoraire(app.donnees, HID).nom;
    const s = ses.semaines[iso(bornerLundi(a))];
    const blocs = s && s.blocs ? s.blocs : ses.modele;
    const cours = blocs.filter(b => !["saute", "possible"].includes(b.statut) && CATS[b.cat] && CATS[b.cat][2])
      .reduce((t, b) => t + Math.max(0, toMin(b.fin) - toMin(b.debut)), 0);
    const debut = SESSION_DEBUT, fin = ajouterJours(lundiSemaine(SESSION_SEMAINES - 1), 6);
    const frac = (joursEntre(debut, a) + 1) / (joursEntre(debut, fin) + 1);
    const notes = app.donnees.notes;
    const recente = notes.slice().sort((x, y) => (y.maj || "").localeCompare(x.maj || ""))[0];
    const [moy, n] = moyenneGenerale(ses);
    const res = app.outils.resume();
    const als = (app.donnees.alarmes || []).filter(x => x.actif).sort((x, y) => (x.heure || "").localeCompare(y.heure || ""));
    return [
      ["horaire", "Horaire", semaine, `${fmtDuree(cours)} de cours cette semaine`, frac],
      ["notes", "Notes", `${notes.length} note${notes.length > 1 ? "s" : ""}`, recente ? "Dernière : " + (recente.titre || "Sans titre") : "Écris ta première note", null],
      ["resultats", "Résultats", moy !== null ? fmtPct(moy) : "—", n ? `Moyenne sur ${n} cours` : "Entre tes premiers résultats", null],
      ["objets3d", "3D", (() => { const k = objets3D(app.donnees).length; return `${k} objet${k > 1 ? "s" : ""}`; })(), "Visionneuse STL et 3MF", null],
      ["transferts", "Transferts", ficheTransferts(app.donnees).enLigne ? "PC joignable" : "PC hors ligne", "Fichiers entre le PC et l'iPad", null],
      ["youtube", "YouTube", "Navigateur", "S'ouvre dans le navigateur", null],
      ["musique", "Musique", "Apple Music", "S'ouvre dans le navigateur", null],
      ["horloge", "Horloge", res ? res.split("   ·   ")[0] : "Concentration", als.length ? `Prochaine alarme : ${fmt(als[0].heure)}` : "Pomodoro, minuterie, alarmes", null],
    ];
  }
  tuile(page, titre, grand, sous, frac) {
    const col = couleurApp(page);
    const t = el("button.carte.tuile", {type: "button", style: {"--c": col},
      onclick: () => page === "horloge" ? this.app.ouvrirHorloge() : this.app.aller(page)},
      el("div.tu-haut", null, el("span.badge", null, iconePage(page, 26)), el("span.tu-fleche", null, icone("fleche", 20))),
      el("div.etiquette.tu-titre", {texte: titre.toUpperCase()}), el("div.tu-grand", {texte: grand}), el("div.tu-sous", {texte: sous}),
      frac !== null ? barreProgres(frac, col) : null);
    return t;
  }
  aVenir() {
    const app = this.app, a = aujourdhui();
    const c = el("section.carte.acc-carte");
    c.append(el("div.ac-tete", null, el("h2", {texte: "À venir"}), petit("Tout voir", () => { app.aller("horaire"); app.montrer("ech"); document.body.classList.add("carnet-ouvert"); }, "tab")));
    const evs = app.ses.echeances.filter(e => !e.fait && isoDate(e.date) && isoDate(e.date) >= a)
      .sort((x, y) => x.date.localeCompare(y.date) || (x.heure || "99").localeCompare(y.heure || "99")).slice(0, 6);
    if (!evs.length) c.append(el("div.muted", {texte: "Aucune échéance à venir. 🎉"}));
    for (const e of evs) {
      const d = isoDate(e.date), col = couleur(CATS[e.cours] ? e.cours : "perso");
      const court = CATS[e.cours] ? CATS[e.cours][1] : "";
      const typ = (TYPES_ECH.find(x => x[0] === e.type) || ["", ""])[1];
      const sous = [court, typ, quand(d) + (e.heure ? ` à ${fmt(e.heure)}` : "")].filter(Boolean).join("  ·  ");
      c.append(el("div.ech-ligne", {style: {"--c": col}, onclick: () => new EcheanceEditeur(app, e).montrer()},
        el("div.ech-date", null, el("b", {texte: String(d.getDate())}), el("span", {texte: MOIS[d.getMonth()].replace(".", "").toUpperCase()})),
        el("div.ech-corps", null, el("b", {texte: e.quoi || "Échéance"}), el("div.petit.muted", {texte: sous})),
        e.poids ? el("span.ech-poids", {texte: `${e.poids} %`}) : null));
    }
    return c;
  }
  horaires() {
    const app = this.app;
    const c = el("section.carte.acc-carte", null, el("h2", {texte: "Mes horaires"}),
      el("div.petit.muted", {texte: "Une session par horaire : chacune garde ses cours, ses semaines et ses échéances."}));
    for (const h of listeHoraires(app.donnees)) c.append(ligneHoraire(app, h));
    c.append(el("div.ac-pied", null, boutonIcone("plus", "Nouvel horaire", () => new HoraireEditeur(app, null).montrer(), "primary")));
    return c;
  }
}
function boutonIcone(ico, texte, action, style = "ghost") {
  const b = bouton("", action, style);
  b.classList.add("btn-ico");
  b.append(icone(ico, 18));
  if (texte) b.append(el("span", {texte}));
  return b;
}
function ligneHoraire(app, h, apres) {
  const actif = h.id === HID;
  const mod = boutonIcone("crayon", "", () => { if (apres) apres(); new HoraireEditeur(app, h).montrer(); }, "tab");
  return el("div.ligne-horaire" + (actif ? ".actif" : ""), {onclick: (e) => { if (mod.contains(e.target)) return; if (apres) apres(); app.choisirHoraire(h.id); }},
    el("span.lh-badge", {texte: initiales(h.nom)}),
    el("div.lh-corps", null, el("b", {texte: h.nom}), el("div.petit.muted", {texte: `${plageHoraire(h)}  ·  ${h.nb} semaines`})),
    actif ? el("span.mono.lh-actif", {texte: "ACTIF"}) : null, mod);
}

/* ---------- application « Résultats » */
class PageResultats {
  constructor(app) { this.app = app; this.hid = null; this.el = el("div.ecran.ecran-defile.ecran-resultats"); }
  objectif() { const v = parseInt(this.app.reglages.objectif); return isNaN(v) ? 70 : Math.max(1, Math.min(100, v)); }
  rafraichir() {
    const app = this.app, z = this.el;
    if (!this.hid || !listeHoraires(app.donnees).some(h => h.id === this.hid)) this.hid = HID;
    const ses = donneesHoraire(app.donnees, this.hid);
    z.innerHTML = "";
    const chips = el("div.rapides.res-sessions");
    for (const h of listeHoraires(app.donnees)) chips.append(petit(h.nom, () => { this.hid = h.id; this.rafraichir(); }, h.id === this.hid ? "tab_on" : "ghost"));
    const obj = el("div.rapides.res-obj");
    for (const v of [60, 70, 75, 80, 85, 90]) obj.append(petit(`${v} %`, () => { app.reglages.objectif = v; app.sauver(); this.rafraichir(); }, v === this.objectif() ? "primary" : "ghost"));
    z.append(el("header.res-entete", null,
      el("div", null, el("div.mono.muted", {texte: "BULLETIN"}), el("h1.page-h1", {texte: "Résultats"}), chips),
      el("div.res-obj-zone", null, el("div.etiquette", {texte: "OBJECTIF PAR COURS"}), obj)));
    const bilans = COURS_KEYS.map(k => [k, bilanCours(ses, k)]);
    const [moy, n] = moyenneGenerale(ses);
    const corr = bilans.filter(([, b]) => b.total).map(([, b]) => b.corrige / b.total * 100);
    const restantes = bilans.reduce((s, [, b]) => s + b.evals.filter(e => num(e.resultat) === null).length, 0);
    const stats = el("div.res-stats");
    for (const [t, v, s, col] of [["Moyenne générale", moy !== null ? fmtPct(moy) : "—", n ? `sur ${n} cours notés` : "aucun résultat encore", couleurApp("resultats")],
      ["Matière corrigée", corr.length ? fmtPct(corr.reduce((a, b) => a + b, 0) / corr.length) : "—", "de la pondération, en moyenne", T.ACCENT],
      ["Évaluations restantes", String(restantes), "sans résultat pour l'instant", couleurApp("notes")]]) {
      stats.append(el("div.carte.res-stat", null, el("div.etiquette", {texte: t.toUpperCase()}), el("div.res-grand", {texte: v, style: {color: col}}), el("div.petit.muted", {texte: s})));
    }
    z.append(stats);
    if (themeHK()) stats.firstChild.append(jaugeMasques(moy !== null ? moy / this.objectif() : 0, 22, `Moyenne par rapport à l'objectif de ${this.objectif()} %`));
    const grille = el("div.res-grille");
    if (!COURS_KEYS.length) z.append(el("div.muted", {texte: "Aucune matière marquée « cours ». Ajoute tes cours dans Horaire → Matières."}));
    for (const [k, b] of bilans) grille.append(this.cours(k, b));
    z.append(grille);
  }
  cours(k, b) {
    const col = couleur(k), obj = this.objectif();
    const c = el("section.carte.res-cours", {style: {"--c": col}});
    const visuel = iconesJeu() ? visuelCat(k, 24) : pastille(col, 12);
    c.append(el("div.rc-haut", null, visuel, el("div.rc-noms", null, el("h2", {texte: CATS[k][1]}), el("div.petit.muted", {texte: CATS[k][0]})),
      el("div.rc-moy", {texte: b.moyenne !== null ? fmtPct(b.moyenne) : "—", style: {color: b.moyenne !== null ? col : "var(--muted)"}})));
    if (themeHK()) { const m = jaugeMasques(b.moyenne !== null ? b.moyenne / obj : 0, 16); m.classList.add("rc-masques"); c.append(m); }
    if (!b.evals.length) { c.append(el("div.petit.muted", {texte: "Aucune évaluation pondérée. Ajoute-les dans Horaire → Échéances (avec la pondération)."})); return c; }
    const base = Math.max(b.total, 100), perdu = b.corrige - b.acquis, reste = b.total - b.corrige;
    c.append(el("div.jauge", null, el("span.j-acq", {style: {width: b.acquis / base * 100 + "%"}}), el("span.j-perdu", {style: {left: b.acquis / base * 100 + "%", width: perdu / base * 100 + "%"}}),
      el("i.j-obj", {style: {left: obj / 100 * b.total / base * 100 + "%"}})));
    c.append(el("div.petit.muted", {texte: `Acquis ${fmtPct(b.acquis)}  ·  perdu ${fmtPct(perdu)}  ·  reste ${fmtPct(reste)} sur ${fmtPct(b.total)}`}));
    const cible = obj / 100 * b.total;
    let msg, mc = "var(--ink)";
    if (b.acquis >= cible) { msg = `Objectif de ${obj} % déjà assuré. 🎉`; mc = couleur("perso"); }
    else if (reste <= 0) { msg = `Objectif de ${obj} % non atteint (${fmtPct(b.acquis / b.total * 100)} final).`; mc = "var(--danger)"; }
    else {
      const besoin = (cible - b.acquis) / reste * 100;
      if (besoin > 100) { msg = `Il faudrait ${fmtPct(besoin)} sur le reste pour ${obj} % : objectif hors d'atteinte.`; mc = "var(--danger)"; }
      else msg = `Pour finir à ${obj} % : vise ${fmtPct(besoin)} sur ce qui reste.`;
    }
    c.append(el("div.rc-msg", {texte: msg, style: {color: mc}}));
    for (const e of b.evals) {
      const d = isoDate(e.date);
      const inp = el("input.saisie.rc-res", {type: "text", inputmode: "decimal", value: e.resultat || "", placeholder: "—"});
      const valider = () => {
        let v = inp.value.replace(/[^0-9.,]/g, "").replace(",", ".");
        if (v) { const f = parseFloat(v); v = isNaN(f) ? "" : String(+Math.max(0, Math.min(150, f)).toFixed(4)); }
        if (String(e.resultat || "") === v) return;
        e.resultat = v;
        if (v && !e.fait) e.fait = true;
        this.app.sauver();
        setTimeout(() => this.rafraichir(), 30);
      };
      inp.addEventListener("change", valider);
      inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter") inp.blur(); });
      c.append(el("div.rc-eval", null, el("span.mono.muted.rc-date", {texte: d ? dateCourte(d) : ""}), el("span.rc-nom", {texte: e.quoi || "Évaluation"}),
        el("span.mono.muted", {texte: `${e.poids} %`}), inp, el("span.mono.muted", {texte: "%"})));
    }
    return c;
  }
}

/* ---------- horaires : choisir, créer, modifier */
class ChoixHoraire extends Modal {
  constructor(app) {
    super("Mes horaires", "Choisis l'horaire à afficher. Chaque horaire garde ses cours, semaines et échéances.");
    if (themeHK()) this.carte.append(carteHoraires(app, () => this.fermer()));
    else for (const h of listeHoraires(app.donnees)) this.carte.append(ligneHoraire(app, h, () => this.fermer()));
    this.barre([boutonIcone("plus", "Nouvel horaire", () => { this.fermer(); new HoraireEditeur(app, null).montrer(); }, "primary")], [bouton("Fermer", () => this.fermer())]);
  }
}
function proposerHoraire(d) {
  const der = listeHoraires(d).sort((a, b) => b.debut.localeCompare(a.debut))[0];
  const lundi = ajouterJours(lundiDe(ajouterJours(finHoraire(der), 1)), 7);
  const m = lundi.getMonth() + 1;
  return [(m <= 3 ? "Hiver " : m <= 7 ? "Été " : "Automne ") + lundi.getFullYear(), lundi, 15];
}
class HoraireEditeur extends Modal {
  constructor(app, h) {
    super(h ? "Modifier l'horaire" : "Nouvel horaire", h ? plageHoraire(h) : "Par exemple « Hiver 2027 » : une nouvelle session avec ses propres cours et semaines.");
    this.app = app; this.h = h;
    const [nom, lundi, nb] = h ? [h.nom, isoDate(h.debut), h.nb] : proposerHoraire(app.donnees);
    this.vNom = entree(nom);
    this.vLundi = el("input.saisie", {type: "date", value: iso(lundi)});
    this.vNb = liste(Array.from({length: 21}, (_, i) => [String(i + 6), String(i + 6)]), String(nb));
    this.carte.append(champ("Nom", this.vNom), el("div.grille2", null, champ("Premier lundi", this.vLundi), champ("Nombre de semaines", this.vNb)));
    this.depart = "travail";
    if (!h) {
      const src = metaHoraire(app.donnees, HID).nom;
      this.pills = {};
      const lp = el("div.rapides");
      for (const [v, t] of [["vide", "Horaire vide"], ["travail", "Garder travail et perso"], ["tout", "Copier la semaine type"]]) {
        lp.append(this.pills[v] = petit(t, () => this.choisirDepart(v), "tab"));
      }
      this.lblDep = el("div.petit.muted");
      this.textes = {vide: "Une grille vierge : tu ajoutes tes nouveaux cours.", travail: `Reprend les blocs de travail, d'étude et perso de « ${src} », sans les cours.`,
        tout: `Reprend toute la semaine type de « ${src} », cours compris.`};
      this.carte.append(etiquette("Pour commencer"), lp, this.lblDep);
      this.choisirDepart("travail");
    }
    const g = h && h.id !== "aut26" ? [bouton("Supprimer", () => this.supprimer(), "danger")] : [];
    this.barre(g, [bouton("Annuler", () => this.fermer()), bouton(h ? "Enregistrer" : "Créer l'horaire", () => this.valider(), "primary")]);
  }
  choisirDepart(v) {
    this.depart = v;
    for (const [k, b] of Object.entries(this.pills)) b.className = "btn petit " + (k === v ? "tab_on" : "tab");
    this.lblDep.textContent = this.textes[v];
  }
  valider() {
    const nom = this.vNom.value.trim(), d = isoDate(this.vLundi.value) || isoDate(parseDate(this.vLundi.value)), nb = parseInt(this.vNb.value);
    if (!nom) return this.erreurTxt("Donne un nom à l'horaire.");
    if (!d) return this.erreurTxt("Date invalide.");
    const app = this.app, lundi = iso(lundiDe(d));
    const hs = listeHoraires(app.donnees);
    if (!this.h) {
      const id = newId();
      hs.push({id, nom, debut: lundi, nb});
      const ses = sessionVide();
      const cours = new Set(Object.keys(CATS).filter(k => CATS[k][2]));
      if (this.depart === "tout") ses.modele = clone(app.ses.modele);
      else if (this.depart === "travail") ses.modele = clone(app.ses.modele.filter(b => !cours.has(b.cat)));
      for (const b of ses.modele) { b.id = newId(); if (b.statut === "saute") b.statut = ""; }
      app.donnees.horaires = hs;
      app.donnees["h_" + id] = ses;
      this.fermer();
      app.choisirHoraire(id);
    } else {
      for (const x of hs) if (x.id === this.h.id) Object.assign(x, {nom, debut: lundi, nb});
      app.donnees.horaires = hs;
      this.fermer();
      app.choisirHoraire(HID);
    }
  }
  erreurTxt(t) { this.err.textContent = t; }
  async supprimer() {
    const h = this.h, app = this.app;
    if (!await dialogue("Supprimer l'horaire", `Supprimer « ${h.nom} » et toutes ses semaines et échéances ?\nCette action ne peut pas être annulée (le PC sera aussi mis à jour).`,
      [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    app.donnees.horaires = listeHoraires(app.donnees).filter(x => x.id !== h.id);
    delete app.donnees["h_" + h.id];
    this.fermer();
    app.choisirHoraire(HID === h.id ? "aut26" : HID);
  }
}

/* ---------- personnaliser le menu */
class PersonnaliserMenu extends Modal {
  constructor(app) {
    super("Personnaliser le menu", "Choisis les applications, leur ordre et ce que montre la page d'accueil. Les réglages sont les mêmes sur le PC.", {classe: "large"});
    this.app = app;
    this.cfg = clone(configMenu(app.reglages));
    this.zone = el("div.perso-corps");
    this.carte.append(this.zone);
    this.barre([bouton("Par défaut", () => { this.cfg = configMenu({}); this.dessiner(); }, "ghost")],
      [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
    this.dessiner();
  }
  ligne(nom, visuel, actif, haut, bas, basculer, fixe) {
    return el("div.perso-ligne" + (actif ? "" : ".off"), null, visuel, el("span.perso-nom", {texte: nom}),
      fixe ? el("span.petit.muted", {texte: "toujours affiché"}) : caseACocher(actif, basculer),
      el("button.nb-mini", {type: "button", disabled: !haut, onclick: haut || null, title: "Monter"}, icone("haut", 16)),
      el("button.nb-mini", {type: "button", disabled: !bas, onclick: bas || null, title: "Descendre"}, icone("bas", 16)));
  }
  deplacer(l, i, d) { const x = l.splice(i, 1)[0]; l.splice(i + d, 0, x); this.dessiner(); }
  dessiner() {
    const c = this.cfg, z = this.zone; z.innerHTML = "";
    const g = el("div.col"), d = el("div.col");
    z.append(g, d);
    g.append(etiquette("Applications du menu"));
    if (document.body.classList.contains("tel")) g.append(el("div.petit.muted", {texte: "Sur l'iPhone, les 4 premières applications vont dans la barre du bas, les autres dans « Plus ».", style: {margin: "-2px 0 8px"}}));
    g.append(this.ligne("Accueil", el("span.perso-ico", null, iconePage("accueil", 20)), true, null, null, null, true));
    c.apps.forEach((k, i) => g.append(this.ligne(nomApp(k), el("span.perso-ico", {style: {color: couleurApp(k)}}, iconePage(k, 20)), !c.caches.includes(k),
      i > 0 ? () => this.deplacer(c.apps, i, -1) : null, i < c.apps.length - 1 ? () => this.deplacer(c.apps, i, 1) : null,
      (v) => { c.caches = c.caches.filter(x => x !== k).concat(v ? [] : [k]); this.dessiner(); })));
    g.append(etiquette("Barre de menu"));
    const st = el("div.rapides");
    st.append(petit("Icônes et noms", () => { c.compact = false; this.dessiner(); }, !c.compact ? "tab_on" : "ghost"),
      petit("Icônes seulement", () => { c.compact = true; this.dessiner(); }, c.compact ? "tab_on" : "ghost"));
    g.append(st, etiquette("Page au démarrage"));
    const dep = el("div.rapides");
    for (const k of ["accueil", "horaire", "notes", "resultats"]) dep.append(petit(nomApp(k), () => { c.depart = k; this.dessiner(); }, c.depart === k ? "tab_on" : "ghost"));
    g.append(dep);
    d.append(etiquette("Sections de l'accueil"));
    c.sections.forEach((k, i) => d.append(this.ligne((SECTIONS_ACCUEIL.find(x => x[0] === k) || ["", k])[1], null, !c.sections_off.includes(k),
      i > 0 ? () => this.deplacer(c.sections, i, -1) : null, i < c.sections.length - 1 ? () => this.deplacer(c.sections, i, 1) : null,
      (v) => { c.sections_off = c.sections_off.filter(x => x !== k).concat(v ? [] : [k]); this.dessiner(); })));
    d.append(etiquette("En-tête de l'accueil"));
    const f = el("div.rapides");
    for (const [v, t] of [["uni", "Uni"], ["degrade", "Dégradé"], ["motif", "Motif"]]) f.append(petit(t, () => { c.fond = v; this.dessiner(); }, c.fond === v ? "tab_on" : "ghost"));
    d.append(f, el("div.champ", null, caseACocher(c.salut, (v) => { c.salut = v; }, "Afficher la salutation (« Bonsoir, … »)")));
  }
  valider() {
    this.app.reglages.menu = this.cfg;
    this.fermer();
    this.app.sauver();
    this.app.construire();
  }
}
