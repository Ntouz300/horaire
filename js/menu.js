/* Menu de l'application : barre de navigation, Accueil, Notes, Résultats, gestion des horaires (comme sur le PC). */
"use strict";

const MOIS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function couleurApp(page) {
  const cats = (THEMES[T.REG_THEME] || THEMES.nuit).cats;
  return {horaire: T.ACCENT, notes: cats.meca, resultats: cats.perso, horloge: cats.travail, accueil: T.ACCENT}[page] || T.ACCENT;
}
/* icône d'une page ; en thème Minecraft, le sticker pixel-art correspondant */
function iconePage(page, taille = 22) {
  if (T.REG_THEME === "minecraft" && ICONE_PAGE[page]) {
    return el("img.ico-pixel", {src: spriteURL(ICONE_PAGE[page], 4), alt: "", style: {width: taille + "px", height: taille + "px"}});
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

/* ---------- barre de navigation */
class Rail {
  constructor(app) {
    this.app = app;
    this.logo = el("button.rail-logo", {type: "button", onclick: () => new ChoixHoraire(app).montrer()});
    this.items = {};
    const haut = el("div.rail-items");
    for (const [cle, titre] of [["accueil", "Accueil"], ["horaire", "Horaire"], ["notes", "Notes"], ["resultats", "Résultats"], ["horloge", "Horloge"]]) {
      haut.append(this.items[cle] = this.item(cle, titre));
    }
    this.items.reglages = this.item("reglages", "Réglages");
    this.lblSync = el("div.rail-sync", {onclick: () => app.ouvrirSynchro()});
    this.el = el("nav.rail", null, this.logo, haut, el("div.espace"), this.lblSync, this.items.reglages);
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
    for (const [cle, b] of Object.entries(this.items)) {
      const actif = this.app.page === cle;
      b.classList.toggle("actif", actif);
      b.style.setProperty("--c", couleurApp(cle));
      const ic = b.querySelector(".rail-ico");
      ic.innerHTML = "";
      ic.append(iconePage(cle, 24));
    }
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
    z.append(el("header.acc-entete", null,
      el("div", null,
        el("div.mono.muted", {texte: `${JOURS[jourSemaine(now)]} ${now.getDate()} ${MOIS_LONG[now.getMonth()]} ${now.getFullYear()}`.toUpperCase()}),
        el("h1.acc-salut", {texte: salutation() + (prenom ? `, ${prenom}` : "")}),
        el("div.muted", {texte: sous})),
      el("div.acc-droite", null, this.lblH, res ? el("div.mono", {texte: res, style: {color: couleurApp("horloge")}}) : null)));
    z.append(this.maintenant(now));
    z.append(el("div.etiquette.acc-titre", {texte: "APPLICATIONS"}));
    const tuiles = el("div.acc-tuiles");
    for (const t of this.tuiles(now)) tuiles.append(this.tuile(...t));
    z.append(tuiles);
    z.append(el("div.acc-bas", null, this.aVenir(), this.horaires()));
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

/* ---------- application « Notes » */
class PageNotes {
  constructor(app) {
    this.app = app;
    this.carnet = ""; this.sel = null; this.sale = false; this.q = ""; this.croquis = null;
    this.colCarnets = el("aside.carte.nt-carnets");
    this.selCarnet = el("select.saisie.nt-sel-carnet", {onchange: () => this.choisirCarnet(this.selCarnet.value)});
    this.recherche = el("input.saisie.nt-recherche", {type: "search", placeholder: "Rechercher dans les notes", autocomplete: "off",
      oninput: () => { this.q = this.recherche.value; this.liste(); }});
    this.lblCompte = el("div.etiquette");
    this.lst = el("div.liste.nt-liste");
    this.colListe = el("section.carte.nt-col-liste", null, el("div.nt-tete-liste", null, el("div.nt-recherche-zone", null, icone("recherche", 18), this.recherche),
      boutonIcone("plus", "", () => this.nouvelle(), "primary")), this.selCarnet, this.lblCompte, this.lst);
    this.ed = el("section.carte.nt-editeur");
    this.el = el("div.ecran.ecran-notes", null, this.colCarnets, this.colListe, this.ed);
  }
  note() { return this.app.donnees.notes.find(n => n.id === this.sel) || null; }
  rafraichir() {
    this.carnets(); this.liste();
    const n = this.note();
    if (!n || !this.vTitre) { this.editeur(); return; }
    if (this.vTitre.value.trim() !== (n.titre || "").trim() || this.vTexte.value !== (n.texte || "")) this.editeur();
    else { this.lblEtat.textContent = this.etat(n); this.majEpingle(n); }
  }
  carnets() {
    const c = this.colCarnets, notes = this.app.donnees.notes;
    c.innerHTML = "";
    c.append(el("h2.nt-h", {texte: "Notes"}), boutonIcone("plus", "Nouvelle note", () => this.nouvelle(), "primary"));
    this.selCarnet.innerHTML = "";
    const ajouter = (cle, nom, nb, visuel) => {
      c.append(el("button.nt-carnet" + (this.carnet === cle ? ".actif" : ""), {type: "button", onclick: () => this.choisirCarnet(cle)},
        visuel, el("span.nt-nom", {texte: nom}), el("span.mono.muted", {texte: String(nb)})));
      this.selCarnet.append(el("option", {value: cle, texte: `${nom} (${nb})`, selected: this.carnet === cle}));
    };
    c.append(el("div.etiquette", {texte: "CARNETS"}));
    ajouter("", "Toutes les notes", notes.length, icone("notes", 18));
    ajouter("*", "Épinglées", notes.filter(n => n.epingle).length, icone("etoile", 18));
    c.append(el("div.etiquette", {texte: "MATIÈRES"}));
    for (const [k, v] of Object.entries(CATS)) {
      const nb = notes.filter(n => n.cours === k).length;
      if (v[2] || nb) ajouter(k, v[1], nb, T.REG_THEME === "minecraft" ? el("img.ico-pixel", {src: spriteURL(iconeCat(k), 2), style: {width: "16px", height: "16px"}}) : pastille(couleur(k), 10));
    }
    ajouter("-", "Sans matière", notes.filter(n => !CATS[n.cours]).length, pastille(T.MUTED, 10));
  }
  choisirCarnet(cle) { this.carnet = cle; this.carnets(); this.liste(); }
  filtrees() {
    const q = this.q.trim().toLowerCase(), c = this.carnet;
    const out = this.app.donnees.notes.filter(n => {
      if (c === "*" && !n.epingle) return false;
      if (c === "-" && CATS[n.cours]) return false;
      if (!["", "*", "-"].includes(c) && n.cours !== c) return false;
      return !q || ((n.titre || "") + "\n" + (n.texte || "")).toLowerCase().includes(q);
    });
    out.sort((a, b) => (b.epingle ? 1 : 0) - (a.epingle ? 1 : 0) || (b.maj || "").localeCompare(a.maj || ""));
    return out;
  }
  liste() {
    const notes = this.filtrees();
    this.lblCompte.textContent = `${notes.length} NOTE${notes.length > 1 ? "S" : ""}`;
    this.lst.innerHTML = "";
    if (!notes.length) this.lst.append(el("div.vide", {texte: "Aucune note ici."}));
    for (const n of notes) {
      const col = CATS[n.cours] ? couleur(n.cours) : T.MUTED;
      const d = isoDate((n.maj || "").slice(0, 10));
      const extrait = (n.texte || "").split(/\s+/).join(" ").slice(0, 140) || (n.dessin ? "Note manuscrite" : "Pas de texte");
      this.lst.append(el("button.nt-carte" + (n.id === this.sel ? ".actif" : ""), {type: "button", onclick: () => this.ouvrir(n.id)},
        el("div.nt-l1", null, el("b", {texte: (n.titre || "Sans titre") + (n.dessin ? "  ✍" : "")}), n.epingle ? el("span.nt-epi", null, icone("etoile", 14)) : null),
        el("div.nt-extrait", {texte: extrait}),
        el("div.nt-l3", null, pastille(col, 8), el("span", {texte: CATS[n.cours] ? CATS[n.cours][1] : "Sans matière"}), el("span.espace"), d ? el("span.mono", {texte: dateCourte(d)}) : null)));
    }
  }
  ouvrir(id) { this.enregistrer(); this.sel = id; this.liste(); this.editeur(); }
  nouvelle() {
    this.enregistrer();
    const n = {id: newId(), titre: "", texte: "", cours: CATS[this.carnet] ? this.carnet : "", epingle: this.carnet === "*", maj: nowIsoMinutes()};
    this.app.donnees.notes.unshift(n);
    this.sel = n.id; this.q = ""; this.recherche.value = "";
    this.app.sauver();
    this.carnets(); this.liste(); this.editeur();
    if (this.vTitre && !("ontouchstart" in window)) this.vTitre.focus();
  }
  etat(n) { const d = isoDate((n.maj || "").slice(0, 10)); return d ? `Modifiée le ${dateCourte(d)} à ${(n.maj || "").slice(11, 16)}` : ""; }
  majEpingle(n) {
    this.bEpi.classList.toggle("on", !!n.epingle);
    this.bEpi.querySelector("span:last-child").textContent = n.epingle ? "Épinglée" : "Épingler";
  }
  editeur() {
    const z = this.ed, n = this.note();
    z.innerHTML = ""; this.vTitre = this.vTexte = null; this.croquis = null;
    if (!n) {
      z.append(el("div.nt-vide", null, el("span.badge.grand", {style: {"--c": couleurApp("notes")}}, iconePage("notes", 40)),
        el("h2", {texte: "Choisis une note ou crée-en une"}), el("div.muted", {texte: "Tes notes se synchronisent avec le PC. Écris au clavier ou à l'Apple Pencil."}),
        boutonIcone("plus", "Nouvelle note", () => this.nouvelle(), "primary")));
      return;
    }
    const cours = liste([["", "Sans matière"]].concat(Object.keys(CATS).map(k => [k, CATS[k][1]])), CATS[n.cours] ? n.cours : "");
    cours.classList.add("nt-cours");
    cours.addEventListener("change", () => this.modifie());
    this.cours = cours;
    this.bEpi = boutonIcone("etoile", n.epingle ? "Épinglée" : "Épingler", () => this.epingler(), "ghost");
    this.bEpi.classList.add("nt-btn-epi");
    this.bEpi.classList.toggle("on", !!n.epingle);
    this.lblEtat = el("span.mono.muted.nt-etat", {texte: this.etat(n)});
    const suppr = boutonIcone("corbeille", "", () => this.supprimer(), "danger");
    this.vTitre = el("input.nt-titre", {type: "text", value: n.titre || "", placeholder: "Titre", oninput: () => this.modifie()});
    this.vTexte = el("textarea.nt-texte", {placeholder: "Écris ici… (Scribble : tu peux aussi écrire au crayon dans ce champ)", oninput: () => this.modifie()});
    this.vTexte.value = n.texte || "";
    this.zoneDessin = el("div.zone-dessin.nt-dessin");
    const bMain = boutonIcone("crayon", "Écrire à la main", () => { bMain.hidden = true; this.ouvrirDessin(n); }, "ghost");
    z.append(el("div.nt-barre", null, cours, this.bEpi, bMain, el("span.espace"), this.lblEtat, suppr), this.vTitre, el("div.nt-sep"),
      this.zoneDessin, this.vTexte);
    if (n.dessin && n.dessin.traits && n.dessin.traits.length) { bMain.hidden = true; this.ouvrirDessin(n); }
  }
  ouvrirDessin(n) {
    if (this.croquis) return;
    this.croquis = new Croquis(this.zoneDessin, clone(n.dessin));
    const marquer = () => setTimeout(() => this.modifie(), 30);
    this.zoneDessin.addEventListener("pointerup", marquer);
    this.zoneDessin.addEventListener("click", marquer);
  }
  modifie() {
    this.sale = true;
    if (this.lblEtat) this.lblEtat.textContent = "Modification…";
    clearTimeout(this._job);
    this._job = setTimeout(() => this.enregistrer(), 700);
  }
  enregistrer() {
    clearTimeout(this._job);
    if (!this.sale) return;
    this.sale = false;
    const n = this.note();
    if (!n || !this.vTitre) return;
    n.titre = this.vTitre.value.trim();
    n.texte = this.vTexte.value.replace(/\n+$/, "");
    n.cours = this.cours.value;
    if (this.croquis) {
      const ds = this.croquis.donnees();
      if (ds.traits.length) n.dessin = ds; else delete n.dessin;
    }
    n.maj = nowIsoMinutes();
    this.app.sauver();
    if (this.lblEtat) this.lblEtat.textContent = "Enregistrée ✓";
    this.liste(); this.carnets();
  }
  epingler() {
    const n = this.note();
    if (!n) return;
    this.enregistrer();
    n.epingle = !n.epingle; n.maj = nowIsoMinutes();
    this.app.sauver();
    this.majEpingle(n); this.liste(); this.carnets();
  }
  async supprimer() {
    const n = this.note();
    if (!n) return;
    if (!await dialogue("Supprimer la note", `Supprimer « ${n.titre || "Sans titre"} » ?`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    this.sale = false; clearTimeout(this._job);
    const l = this.app.donnees.notes, i = l.indexOf(n);
    if (i >= 0) l.splice(i, 1);
    this.sel = null;
    this.app.sauver();
    this.rafraichir();
  }
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
    const grille = el("div.res-grille");
    if (!COURS_KEYS.length) z.append(el("div.muted", {texte: "Aucune matière marquée « cours ». Ajoute tes cours dans Horaire → Matières."}));
    for (const [k, b] of bilans) grille.append(this.cours(k, b));
    z.append(grille);
  }
  cours(k, b) {
    const col = couleur(k), obj = this.objectif();
    const c = el("section.carte.res-cours", {style: {"--c": col}});
    const visuel = T.REG_THEME === "minecraft" ? el("img.ico-pixel", {src: spriteURL(iconeCat(k), 3), style: {width: "24px", height: "24px"}}) : pastille(col, 12);
    c.append(el("div.rc-haut", null, visuel, el("div.rc-noms", null, el("h2", {texte: CATS[k][1]}), el("div.petit.muted", {texte: CATS[k][0]})),
      el("div.rc-moy", {texte: b.moyenne !== null ? fmtPct(b.moyenne) : "—", style: {color: b.moyenne !== null ? col : "var(--muted)"}})));
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
    for (const h of listeHoraires(app.donnees)) this.carte.append(ligneHoraire(app, h, () => this.fermer()));
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
