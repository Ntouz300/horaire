/* Fenêtres de saisie : bloc, échéance, tâche, note, options de la semaine, matières, réglages, roue des couleurs. */
"use strict";

function grille2(...champs) { return el("div.grille2", null, champs); }
function heureInput(v) { return el("input.saisie", {type: "time", step: 300, value: v || "09:00"}); }
function dateInput(v) { return el("input.saisie", {type: "date", value: v || ""}); }
function rapides(cible, items) {
  return el("div.rapides", null, items.map(([t, j]) => petit(t, () => { cible.value = j === null ? "" : iso(ajouterJours(aujourdhui(), j)); })));
}

/* ---------- bloc */
class Editeur extends Modal {
  constructor(app, b, defauts) {
    super(b ? "Modifier le bloc" : "Nouveau bloc", `Semaine du ${plageSemaine(app.sem)}`);
    this.app = app; this.b = b;
    const v = b || Object.assign({titre: "", cat: "etude", type: "autre", lieu: "", statut: "", note: "", fait: false}, defauts || {});
    this.titre = entree(v.titre, {autofocus: !b, placeholder: "ex. : Étude Mécanique"});
    this.cat = el("select.saisie");
    this.remplirCats(v.cat);
    this.cat.addEventListener("change", () => {
      if (this.cat.value === "__nouv") {
        this.cat.value = this.catChoisie;
        new CategorieEditeur(app, null, (cle) => { app.categoriesChangees(); this.remplirCats(cle); }).montrer();
      } else this.catChoisie = this.cat.value;
    });
    this.type = liste(TYPES, TYPES.some(t => t[0] === v.type) ? v.type : "autre");
    this.jour = liste(JOURS.map((j, i) => [String(i), j]), String(v.jour || 0));
    this.lieu = entree(v.lieu, {placeholder: "ex. : P1-4270"});
    this.debut = heureInput(v.debut); this.fin = heureInput(v.fin || "10:00");
    this.statut = liste(STATUTS, STATUTS.some(s => s[0] === (v.statut || "")) ? (v.statut || "") : "");
    this.fait = caseACocher(!!v.fait, null, "Fait cette semaine");
    this.note = zoneTexte(v.note, 110);
    this.carte.append(champ("Titre", this.titre),
      grille2(champ("Matière / catégorie", this.cat), champ("Type", this.type)),
      grille2(champ("Jour", this.jour), champ("Local / lieu", this.lieu)),
      grille2(champ("Début", this.debut), champ("Fin", this.fin)),
      grille2(champ("Présence", this.statut), el("div.champ", null, etiquette("Suivi"), this.fait)),
      champ("Notes (devoirs, quoi apporter, rappel…)", this.note));
    this.barre(b ? [bouton("Supprimer", () => this.supprimer(), "danger"), bouton("Dupliquer", () => this.dupliquer()),
      boutonVocaux(app, {bloc: b.id, horaire: HID}, `Bloc : ${b.titre || "Sans titre"}`)] : [],
      [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
  }
  remplirCats(choix) {
    this.cat.innerHTML = "";
    for (const [k, c] of Object.entries(CATS)) this.cat.append(el("option", {value: k, texte: c[0]}));
    this.cat.append(el("option", {value: "__nouv", texte: "＋  Nouvelle matière…"}));
    this.catChoisie = CATS[choix] ? choix : "perso";
    this.cat.value = this.catChoisie;
  }
  valider() {
    const debut = parseTime(this.debut.value), fin = parseTime(this.fin.value);
    if (!debut || !fin) return this.erreur("Choisis une heure de début et de fin.");
    if (toMin(fin) <= toMin(debut)) return this.erreur("L'heure de fin doit être après l'heure de début.");
    const cat = this.catChoisie;
    const data = {titre: this.titre.value.trim() || CATS[cat][1], cat, type: this.type.value, jour: parseInt(this.jour.value),
      debut, fin, lieu: this.lieu.value.trim(), statut: this.statut.value, fait: this.fait.valeur(), note: this.note.value.replace(/\n+$/, "")};
    const app = this.app;
    app.snapBlocs();
    const blocs = app.blocsEdit();
    if (this.b) { const c = blocs.find(x => x.id === this.b.id); if (c) Object.assign(c, data); }
    else { const n = Object.assign({id: newId()}, data); blocs.push(n); app.selId = n.id; }
    this.fermer();
    app.changement();
  }
  dupliquer() { this.app.selId = this.b.id; this.fermer(); this.app.dupliquerBloc(); }
  async supprimer() {
    const ok = await dialogue("Supprimer ce bloc", `Supprimer « ${this.b.titre || ""} » de la semaine du ${plageSemaine(this.app.sem)} ?\n(Les autres semaines ne sont pas touchées.)`,
      [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]]);
    if (!ok) return;
    const app = this.app;
    app.snapBlocs();
    const blocs = app.blocsEdit(), i = blocs.findIndex(x => x.id === this.b.id);
    if (i >= 0) blocs.splice(i, 1);
    if (app.selId === this.b.id) app.selId = null;
    this.fermer();
    app.changement();
  }
}

/* ---------- échéance */
class EcheanceEditeur extends Modal {
  constructor(app, e, date) {
    super(e ? "Modifier l'échéance" : "Nouvelle échéance");
    this.app = app; this.e = e;
    const v = e || {quoi: "", type: "intra", cours: COURS_KEYS[0] || "perso", heure: "", poids: "", note: "", fait: false, date: iso(date || aujourdhui())};
    this.coursKeys = COURS_KEYS.concat(["perso"]);
    this.quoi = entree(v.quoi, {autofocus: true, placeholder: "ex. : Intra, TP 2"});
    this.type = liste(TYPES_ECH, TYPES_ECH.some(t => t[0] === v.type) ? v.type : "intra");
    this.cours = liste(this.coursKeys.map(k => [k, k === "perso" ? "Autre" : CATS[k][1]]), this.coursKeys.includes(v.cours) ? v.cours : this.coursKeys[0]);
    this.date = dateInput(v.date);
    this.heure = el("input.saisie", {type: "time", value: v.heure || ""});
    this.poids = entree(v.poids, {inputmode: "decimal", placeholder: "ex. : 30"});
    this.resultat = entree(v.resultat || "", {inputmode: "decimal", placeholder: "ex. : 85"});
    this.fait = caseACocher(!!v.fait, null, "Terminée");
    this.note = zoneTexte(v.note, 100);
    this.carte.append(champ("Titre", this.quoi), grille2(champ("Type", this.type), champ("Cours", this.cours)),
      grille2(champ("Date", this.date), champ("Heure (facultatif)", this.heure)),
      rapides(this.date, [["Aujourd'hui", 0], ["Demain", 1], ["Dans 1 semaine", 7], ["Dans 2 semaines", 14]]),
      grille2(champ("Pondération en % (facultatif)", this.poids), champ("Résultat obtenu en % (facultatif)", this.resultat)),
      el("div.champ", null, this.fait), champ("Notes (matière à étudier, local, matériel permis…)", this.note));
    this.barre(e ? [bouton("Supprimer", () => this.supprimer(), "danger")] : [],
      [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
  }
  valider() {
    const date = parseDate(this.date.value);
    if (!date) return this.erreur("Date invalide.");
    const heure = this.heure.value.trim();
    if (heure && !parseTime(heure)) return this.erreur("Heure invalide. Exemple : 13:30.");
    const poids = this.poids.value.replace(/[^0-9.,]/g, "").replace(",", ".");
    const res = this.resultat.value.replace(/[^0-9.,]/g, "").replace(",", ".");
    if ((poids && isNaN(parseFloat(poids))) || (res && isNaN(parseFloat(res)))) return this.erreur("Pondération ou résultat invalide. Exemple : 85 ou 72,5.");
    const data = {resultat: res, quoi: this.quoi.value.trim() || "Échéance", type: this.type.value, cours: this.cours.value, date,
      heure: heure ? parseTime(heure) : "", poids, note: this.note.value.replace(/\n+$/, ""), fait: res ? true : this.fait.valeur()};
    if (this.e) Object.assign(this.e, data);
    else this.app.ses.echeances.push(Object.assign({id: newId()}, data));
    this.fermer();
    this.app.changement();
  }
  async supprimer() {
    if (!await dialogue("Supprimer l'échéance", `Supprimer « ${this.e.quoi || ""} » ?`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    const l = this.app.ses.echeances, i = l.indexOf(this.e);
    if (i >= 0) l.splice(i, 1);
    this.fermer();
    this.app.changement();
  }
}

/* ---------- tâche */
class TacheEditeur extends Modal {
  constructor(app, t) {
    super("Tâche", `Semaine du ${plageSemaine(app.sem)}`);
    this.app = app; this.t = t;
    this.texte = entree(t.texte);
    this.cours = liste([["", "Aucune"]].concat(Object.keys(CATS).map(k => [k, CATS[k][1]])), CATS[t.cours] ? t.cours : "");
    this.date = dateInput(t.date);
    this.fait = caseACocher(!!t.fait, null, "Terminée");
    this.note = zoneTexte(t.note, 150);
    this.carte.append(champ("Titre", this.texte), grille2(champ("Matière", this.cours), champ("Pour le (facultatif)", this.date)),
      rapides(this.date, [["Aujourd'hui", 0], ["Demain", 1], ["Dans 1 sem.", 7], ["Aucune date", null]]),
      el("div.champ", null, this.fait), champ("Note (détails, liens, ce qu'il reste à faire…)", this.note));
    this.barre([bouton("Supprimer", () => this.supprimer(), "danger")], [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
  }
  valider() {
    const d = this.date.value.trim(), date = d ? parseDate(d) : "";
    if (d && !date) return this.erreur("Date invalide.");
    Object.assign(this.t, {texte: this.texte.value.trim() || "Tâche", cours: this.cours.value, date: date || "", fait: this.fait.valeur(), note: this.note.value.replace(/\n+$/, "")});
    this.fermer();
    this.app.changement();
  }
  supprimer() {
    const l = this.app.tachesEdit(), i = l.indexOf(this.t);
    if (i >= 0) l.splice(i, 1);
    this.fermer();
    this.app.changement();
  }
}

/* ---------- note (texte + écriture à l'Apple Pencil) */
class NoteEditeur extends Modal {
  constructor(app, n, manuscrite) {
    super(n ? "Modifier la note" : "Nouvelle note", null, {classe: "large"});
    this.app = app; this.n = n;
    const v = n || {titre: "", texte: "", cours: "", epingle: false};
    this.cles = [""].concat(COURS_KEYS, ["perso"]);
    this.titre = entree(v.titre, {autofocus: !n && !manuscrite});
    this.cours = liste(this.cles.map(k => [k, k === "" ? "Aucune" : k === "perso" ? "Autre" : CATS[k][1]]), this.cles.includes(v.cours) ? v.cours : "");
    this.epingle = caseACocher(!!v.epingle, null, "Épingler en haut de la liste");
    const aDessin = !!(v.dessin && v.dessin.traits && v.dessin.traits.length);
    this.texte = zoneTexte(v.texte, aDessin || manuscrite ? 90 : 260);
    this.zoneDessin = el("div.zone-dessin");
    this.dessin = null;
    const ouvrirDessin = () => {
      if (this.dessin) return;
      btnMain.hidden = true;
      this.dessin = new Croquis(this.zoneDessin, clone(v.dessin));
      this.texte.style.height = "90px";
    };
    const btnMain = bouton("✍  Écrire à la main (Apple Pencil)", ouvrirDessin);
    let info = "";
    const d = n ? isoDate((v.maj || "").slice(0, 10)) : null;
    if (d) info = `Dernière modification : ${dateCourte(d)} ${d.getFullYear()}`;
    this.carte.append(grille2(champ("Titre", this.titre), champ("Matière", this.cours)), el("div.champ", null, this.epingle),
      champ("Texte (Scribble : écris au crayon dans ce champ)", this.texte), btnMain, this.zoneDessin, el("div.petit.muted", {texte: info}));
    if (aDessin || manuscrite) setTimeout(ouvrirDessin, 0);
    this.barre(n ? [bouton("Supprimer", () => this.supprimer(), "danger")] : [], [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
  }
  clicVoile() { /* une note ne se ferme pas par accident pendant qu'on écrit */ }
  valider() {
    const data = {titre: this.titre.value.trim(), texte: this.texte.value.replace(/\n+$/, ""), cours: this.cours.value, epingle: this.epingle.valeur(), maj: nowIsoMinutes()};
    if (this.dessin) {
      const ds = this.dessin.donnees();
      if (ds.traits.length) data.dessin = ds;
      else if (this.n) delete this.n.dessin;
    }
    if (!data.titre) {
      const prem = data.texte.trim() ? data.texte.trim().split("\n")[0] : "";
      data.titre = prem.slice(0, 40) || (data.dessin ? "Note manuscrite" : "Sans titre");
    }
    if (this.n) Object.assign(this.n, data);
    else this.app.donnees.notes.push(Object.assign({id: newId()}, data));
    this.fermer();
    this.app.changement();
  }
  async supprimer() {
    if (!await dialogue("Supprimer la note", `Supprimer « ${this.n.titre || ""} » ?`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    const l = this.app.donnees.notes, i = l.indexOf(this.n);
    if (i >= 0) l.splice(i, 1);
    enterrerNote(this.app, this.n.id);
    this.fermer();
    this.app.changement();
  }
}

/* ---------- options de la semaine */
class OptionsSemaine extends Modal {
  constructor(app) {
    const modif = app.semaineModifiee();
    super("Options de la semaine", `Semaine du ${plageSemaine(app.sem)}  ·  ${modif ? "modifiée" : "semaine type"}`);
    this.app = app;
    const rel = (app.ses.relaches || []).includes(iso(app.sem));
    const actions = [
      ["Copier vers la semaine suivante", "Remplace l'horaire de la semaine suivante par celui-ci.", () => app.actionCopierSuivante(), "ghost"],
      ["Copier vers toutes les semaines suivantes", "Remplace l'horaire de toutes les semaines qui restent dans la session.", () => app.actionCopierToutes(), "ghost"],
      ["Utiliser comme semaine type", "Les semaines que tu n'as jamais modifiées prendront cet horaire.", () => app.actionModele(), "ghost"],
      rel ? ["Retirer le statut « relâche »", "Enlève seulement l'étiquette ; les blocs ne changent pas.", () => app.actionRelache(), "ghost"]
        : ["Marquer comme semaine de relâche", "Retire les cours de cette semaine (le reste est gardé).", () => app.actionRelache(), "ghost"],
    ];
    const crit = (app.ses.critiques || []).includes(iso(app.sem));
    actions.push([crit ? "Retirer « période critique »" : "Marquer comme période critique", "Affiche un avertissement sur cette semaine.", () => app.actionCritique(), "ghost"]);
    if (modif) actions.push(["Revenir à la semaine type", "Efface les changements de cette semaine seulement.", () => app.actionRevenir(), "danger"]);
    for (const [t, d, fn, st] of actions) this.carte.append(el("div.option", null, bouton(t, () => { this.fermer(); setTimeout(fn, 60); }, st), el("div.petit.muted", {texte: d})));
    this.barre([], [bouton("Fermer", () => this.fermer())]);
  }
}

Object.assign(App.prototype, {
  copiePropre() { const s = clone(this.blocsVue()); s.forEach(b => { b.fait = false; }); return s; },
  ecraser(cibles) {
    const src = this.copiePropre();
    for (const l of cibles) { const k = iso(l); this.ses.semaines[k] = this.ses.semaines[k] || {}; this.ses.semaines[k].blocs = clone(src); }
    this.changement();
  },
  nbModifiees(c) { return c.filter(l => (this.ses.semaines[iso(l)] || {}).blocs).length; },
  async actionCopierSuivante() {
    if (this.idxSem() >= SESSION_SEMAINES - 1) return informer("Copier la semaine", "C'est la dernière semaine de la session.");
    const c = ajouterJours(this.sem, 7);
    let msg = `Copier cet horaire vers la semaine du ${plageSemaine(c)} ?`;
    if (this.nbModifiees([c])) msg += "\nCette semaine contient déjà des changements, ils seront remplacés.";
    if (await dialogue("Copier la semaine", msg, [["Annuler", false, "ghost"], ["Copier", true, "primary"]])) this.ecraser([c]);
  },
  async actionCopierToutes() {
    const c = [];
    for (let i = this.idxSem() + 1; i < SESSION_SEMAINES; i++) c.push(lundiSemaine(i));
    if (!c.length) return informer("Copier la semaine", "C'est la dernière semaine de la session.");
    const nb = this.nbModifiees(c);
    let msg = `Copier cet horaire vers les ${c.length} semaines suivantes ?`;
    if (nb) msg += `\n${nb} d'entre elles contiennent déjà des changements, ils seront remplacés.`;
    if (await dialogue("Copier la semaine", msg, [["Annuler", false, "ghost"], ["Copier", true, "primary"]])) this.ecraser(c);
  },
  async actionModele() {
    if (await dialogue("Semaine type", "Utiliser l'horaire de cette semaine comme semaine type ?\nLes semaines jamais modifiées prendront cet horaire. Les semaines déjà modifiées ne changent pas.",
      [["Annuler", false, "ghost"], ["Utiliser", true, "primary"]])) { this.ses.modele = this.copiePropre(); this.changement(); }
  },
  async actionRelache() {
    const k = iso(this.sem), rel = this.ses.relaches = this.ses.relaches || [];
    if (rel.includes(k)) rel.splice(rel.indexOf(k), 1);
    else {
      if (!await dialogue("Semaine de relâche", `Retirer les cours de la semaine du ${plageSemaine(this.sem)} ?\nLe travail, l'étude et le reste sont gardés (les autres semaines ne changent pas).`,
        [["Annuler", false, "ghost"], ["Retirer les cours", true, "primary"]])) return;
      rel.push(k);
      const b = this.blocsEdit(), gard = b.filter(x => !(CATS[x.cat] && CATS[x.cat][2]));
      b.length = 0; b.push(...gard);
    }
    this.sauver(); this.remplirSemaines(); this.dessinerTout();
  },
  actionCritique() {
    const k = iso(this.sem), c = this.ses.critiques = this.ses.critiques || [];
    if (c.includes(k)) c.splice(c.indexOf(k), 1); else c.push(k);
    this.sauver(); this.remplirSemaines(); this.dessinerTout();
  },
  async actionRevenir() {
    if (!await dialogue("Revenir à la semaine type", `Effacer les changements de la semaine du ${plageSemaine(this.sem)} et revenir à la semaine type ?`,
      [["Annuler", false, "ghost"], ["Effacer", true, "danger"]])) return;
    const s = this.entreeSemaine();
    if (s) { delete s.blocs; if (!Object.keys(s).length) delete this.ses.semaines[iso(this.sem)]; }
    this.changement();
  },
  categoriesChangees() {
    appliquerCategories(this.donnees.categories);
    appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, this.donnees.reglages));
    this.sauver();
    this.construire(); this.dessinerTout();
  },
  appliquer(reg) {
    const r = this.donnees.reglages;
    for (const k of Object.keys(r)) delete r[k];
    Object.assign(r, reg);
    appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, r));
    this.sauver();
    this.construire(); this.dessinerTout();
  },
  ouvrirSynchro() { this.fenSync = new FenetreSynchro(this); this.fenSync.apres = () => { this.fenSync = null; }; this.fenSync.montrer(); },
});

/* ---------- matières */
class CategorieEditeur extends Modal {
  constructor(app, c, apres) {
    super(c ? "Modifier la matière" : "Nouvelle matière");
    this.app = app; this.c = c;
    this.suite = apres;
    const v = c || {nom: "", court: "", cours: true, couleur: ""};
    const util = new Set(app.donnees.categories.map(x => x.couleur || couleurDefaut(x.cle)));
    this.coul = v.couleur || (c ? couleurDefaut(c.cle) : (PALETTE_AUTO.find(p => !util.has(p)) || PALETTE_AUTO[0]));
    this.defautTheme = false;
    this.nom = entree(v.nom, {autofocus: true, placeholder: "ex. : Calcul II (MAT-1900)"});
    this.court = entree(v.court);
    this.genre = liste([["1", "Cours"], ["0", "Autre activité"]], v.cours ? "1" : "0");
    this.sw = el("span.sw-grand", {onclick: () => this.roue()});
    this.majSw();
    this.carte.append(champ("Nom complet (ex. : Calcul II (MAT-1900))", this.nom), grille2(champ("Nom court (affiché partout)", this.court), champ("Genre", this.genre)),
      etiquette("Couleur"), el("div.ligne-couleur", null, this.sw, petit("Roue des couleurs…", () => this.roue()),
        c ? petit("Couleur du thème", () => { this.coul = couleurDefaut(c.cle); this.defautTheme = true; this.majSw(); }) : null),
      el("div.petit.muted", {texte: "Un « cours » compte dans les heures de cours et apparaît dans les échéances et les notes."}));
    this.barre([], [bouton("Annuler", () => this.fermer()), bouton("Enregistrer", () => this.valider(), "primary")]);
  }
  majSw() { this.sw.style.background = this.coul; }
  async roue() { const r = await choisirCouleur(this.coul, "Couleur de la matière"); if (r) { this.coul = r; this.defautTheme = false; this.majSw(); } }
  valider() {
    let nom = this.nom.value.trim(), court = this.court.value.trim();
    if (!nom && !court) return this.erreur("Donne au moins un nom à la matière.");
    nom = nom || court; court = court || nom.slice(0, 18);
    const data = {nom, court, cours: this.genre.value === "1", couleur: this.defautTheme ? "" : this.coul};
    let cle;
    if (this.c) { Object.assign(this.c, data); cle = this.c.cle; }
    else {
      cle = "c" + newId();
      const cats = this.app.donnees.categories;
      const pos = cats.length && cats[cats.length - 1].cle === "perso" ? cats.length - 1 : cats.length;
      cats.splice(pos, 0, Object.assign({cle}, data));
    }
    this.fermer();
    if (this.suite) this.suite(cle);
  }
}

class Matieres extends Modal {
  constructor(app) {
    super("Matières et catégories", "Touche une pastille pour changer la couleur, ou « Modifier » pour renommer.");
    this.app = app; this.modifie = false;
    this.liste = el("div.liste-matieres");
    this.carte.append(this.liste);
    this.barre([bouton("+  Nouvelle matière", () => new CategorieEditeur(app, null, () => this.ok()).montrer(), "primary"),
      bouton("Réinitialiser les couleurs", () => { app.donnees.categories.forEach(c => { c.couleur = ""; }); this.ok(); })],
    [bouton("Fermer", () => this.fermer())]);
    this.dessiner();
  }
  usage(cle) {
    const d = this.app.donnees;
    let nb = 0, ne = 0;
    for (const ses of toutesSessions(d)) {
      nb += ses.modele.filter(b => b.cat === cle).length;
      for (const s of Object.values(ses.semaines)) nb += (s.blocs || []).filter(b => b.cat === cle).length;
      ne += ses.echeances.filter(e => e.cours === cle).length;
    }
    return [nb, ne, d.notes.filter(n => n.cours === cle).length];
  }
  dessiner() {
    appliquerCategories(this.app.donnees.categories);
    appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, this.app.donnees.reglages));
    this.liste.innerHTML = "";
    for (const c of this.app.donnees.categories) {
      this.liste.append(el("div.rangee", null,
        el("span.sw", {style: {background: couleur(c.cle)}, onclick: async () => { const r = await choisirCouleur(couleur(c.cle), "Couleur : " + c.court); if (r) { c.couleur = r; this.ok(); } }}),
        el("div.corps", null, el("div", null, el("b", {texte: c.court}), el("span.mono.petit", {texte: c.cours ? "  COURS" : "  ACTIVITÉ", style: {color: c.cours ? couleur(c.cle) : "var(--muted)"}})),
          c.nom !== c.court ? el("div.petit.muted", {texte: c.nom}) : null),
        petit("Modifier", () => new CategorieEditeur(this.app, c, () => this.ok()).montrer()),
        c.cle !== "perso" ? el("span.croix", {texte: "✕", onclick: () => this.supprimer(c)}) : null));
    }
  }
  ok() { this.modifie = true; this.dessiner(); }
  async supprimer(c) {
    const [b, e, n] = this.usage(c.cle);
    let msg = `Supprimer « ${c.court} » ?`;
    const m = [[b, "bloc"], [e, "échéance"], [n, "note"]].filter(x => x[0]).map(([x, mot]) => `${x} ${mot}${x > 1 ? "s" : ""}`);
    if (m.length) msg += "\n" + m.join(", ") + " l'utilisent : ils passeront dans « Perso ».";
    if (!await dialogue("Supprimer la matière", msg, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
    const d = this.app.donnees;
    for (const ses of toutesSessions(d)) {
      for (const lst of [ses.modele].concat(Object.values(ses.semaines).map(s => s.blocs || []))) for (const x of lst) if (x.cat === c.cle) x.cat = "perso";
      for (const x of ses.echeances) if (x.cours === c.cle) x.cours = "perso";
    }
    for (const x of d.notes) if (x.cours === c.cle) x.cours = "";
    d.categories = d.categories.filter(x => x !== c);
    this.ok();
  }
  fermer() { super.fermer(); if (this.modifie) setTimeout(() => this.app.categoriesChangees(), 40); }
}

/* ---------- roue des couleurs */
function choisirCouleur(initial, titre) {
  return new Promise((res) => {
    const m = new RoueCouleurs(initial, titre || "Choisir une couleur", res);
    m.montrer();
  });
}
class RoueCouleurs extends Modal {
  constructor(initial, titre, res) {
    super(titre);
    this.res = res; this.rendu = false;
    this.initial = estHex(initial) ? initial : "#5b9bff";
    [this.h, this.s, this.v] = hexHsv(this.initial);
    const TT = 236;
    this.T = TT;
    this.roue = el("canvas.roue", {width: TT * 2, height: TT * 2, style: {width: TT + "px", height: TT + "px"}});
    this.marq = el("span.marqueur");
    this.barreV = el("div.barre-lum");
    this.curseurV = el("span.curseur-lum");
    this.barreV.append(this.curseurV);
    this.apercu = el("div.apercu", null, el("span.avant", {texte: "avant", style: {background: this.initial, color: encreSur(this.initial)}}), this.nouv = el("span.nouv", {texte: "nouvelle"}));
    this.hex = entree("", {autocapitalize: "off", spellcheck: "false"});
    this.lblRgb = el("div.mono.petit.muted");
    const presets = el("div.presets");
    for (const c of ["#5b9bff", "#3cc4c9", "#4fd1a1", "#f0a541", "#ff7a8d", "#a78bfa", "#e879f9", "#f2d35b", "#ff4d4d", "#ff9f43", "#1dd1a1", "#00b8d4", "#2e86de", "#5f27cd", "#8395a7", "#ffffff"]) {
      presets.append(el("span.sw", {style: {background: c}, onclick: () => this.fixer(c)}));
    }
    const zoneRoue = el("div.zone-roue", null, el("div.roue-cadre", null, this.roue, this.marq), etiquette("Luminosité"), this.barreV);
    this.carte.append(el("div.roue-corps", null, zoneRoue, el("div.roue-droite", null, etiquette("Aperçu"), this.apercu, etiquette("Code hex"), this.hex, this.lblRgb, etiquette("Suggestions"), presets)));
    this.barre([], [bouton("Annuler", () => this.fermer()), bouton("Choisir", () => this.valider(), "primary")]);
    this.peindreRoue();
    const glisser = (cible, fn) => {
      cible.addEventListener("pointerdown", (e) => { try { cible.setPointerCapture(e.pointerId); } catch (er) { /* */ } fn(e); e.preventDefault(); });
      cible.addEventListener("pointermove", (e) => { if (cible.hasPointerCapture(e.pointerId)) fn(e); });
    };
    glisser(this.roue, (e) => {
      const r = this.roue.getBoundingClientRect(), c = r.width / 2;
      const dx = e.clientX - r.left - c, dy = e.clientY - r.top - c;
      this.h = ((Math.atan2(-dy, dx) / (2 * Math.PI)) + 1) % 1;
      this.s = Math.min(1, Math.hypot(dx, dy) / (c - 1));
      if (this.v < .08) this.v = 1;
      this.maj();
    });
    glisser(this.barreV, (e) => { const r = this.barreV.getBoundingClientRect(); this.v = Math.max(0, Math.min(1, (e.clientX - r.left - 9) / (r.width - 18))); this.maj(); });
    this.hex.addEventListener("input", () => { let t = this.hex.value.trim(); if (!t.startsWith("#")) t = "#" + t; if (estHex(t)) { [this.h, this.s, this.v] = hexHsv(t); this.maj(false); } });
    this.maj();
  }
  peindreRoue() {
    const cv = this.roue, ctx = cv.getContext("2d"), N = cv.width, c = (N - 1) / 2, r0 = N / 2 - 1;
    const img = ctx.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = x - c, dy = y - c, d = Math.hypot(dx, dy), a = r0 - d + .5;
      if (a <= 0) continue;
      const [rr, gg, bb] = rgb(hsvHex(((Math.atan2(-dy, dx) / (2 * Math.PI)) + 1) % 1, Math.min(1, d / r0), 1));
      const i = (y * N + x) * 4;
      img.data[i] = rr; img.data[i + 1] = gg; img.data[i + 2] = bb; img.data[i + 3] = Math.round(255 * Math.min(1, a));
    }
    ctx.putImageData(img, 0, 0);
  }
  couleur() { return hsvHex(this.h, this.s, this.v); }
  fixer(c) { [this.h, this.s, this.v] = hexHsv(c); this.maj(); }
  maj(hexAussi = true) {
    const col = this.couleur(), pur = hsvHex(this.h, this.s, 1), T2 = this.T / 2;
    const rr = this.s * (T2 - 1);
    Object.assign(this.marq.style, {left: (T2 + rr * Math.cos(this.h * 2 * Math.PI)) + "px", top: (T2 - rr * Math.sin(this.h * 2 * Math.PI)) + "px", background: pur});
    this.barreV.style.background = `linear-gradient(90deg, #000, ${pur})`;
    Object.assign(this.curseurV.style, {left: `calc(9px + ${this.v} * (100% - 18px))`, background: col});
    this.nouv.style.background = col; this.nouv.style.color = encreSur(col);
    const [r, g, b] = rgb(col);
    this.lblRgb.textContent = `R ${r}   V ${g}   B ${b}`;
    if (hexAussi) this.hex.value = col;
  }
  valider() { this.rendu = true; this.fermer(); this.res(this.couleur()); }
  fermer() { super.fermer(); if (!this.rendu) { this.rendu = true; this.res(null); } }
}

/* ---------- réglages */
class Reglages extends Modal {
  constructor(app) {
    super("Réglages", null, {classe: "large"});
    this.app = app;
    this.d = clone(Object.assign({}, DEFAUT_REGLAGES, app.donnees.reglages));
    const g = el("div.col"), dr = el("div.col");
    this.carte.append(el("div.reglages-corps", null, g, dr));
    g.append(etiquette("Thème"), this.themes = el("div.themes"), etiquette("Couleur d'accent"), this.accents = el("div.accents"),
      el("div.rapides", null, petit("Roue des couleurs…", async () => { const t = THEMES[this.d.theme] || THEMES.nuit; const r = await choisirCouleur(this.d.accent || t.ACCENT, "Couleur d'accent"); if (r) { this.d.accent = r; this.maj(); } }),
        petit("Selon le thème", () => { this.d.accent = ""; this.maj(); })),
      etiquette("Forme des angles"), this.pills("forme", FORMES.map((f, i) => [i, f[0]])),
      etiquette("Taille du texte (cet iPad)"), this.pills("texte", TAILLES.map(t => [t[1], t[0]])));
    this.hd = liste([5, 6, 7, 8, 9, 10, 11, 12].map(h => [String(h), h + " h"]), String(this.d.h_debut));
    this.hf = liste([15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(h => [String(h), h + " h"]), String(this.d.h_fin));
    this.cases = {};
    dr.append(etiquette("Matières et catégories"), this.sws = el("div.sws"), petit("Gérer les matières…", () => new Matieres(app).montrer()),
      etiquette("Grille horaire"), el("div.ligne-heures", null, "De", this.hd, "à", this.hf), etiquette("Options"));
    for (const [cle, t] of [["horloge", "Afficher l'horloge en haut"], ["secondes", "Afficher les secondes"], ["son", "Son pour les alarmes et minuteries"], ["notes_blocs", "Afficher les notes dans les blocs"], ["icones_theme", "Icônes des thèmes de jeu (Minecraft, Hollow Knight, Rocket League) — cet appareil"],
      ["reduire_effets", "Réduire les effets du décor (animation, parallaxe) — cet appareil"]]) {
      this.cases[cle] = caseACocher(cle === "reduire_effets" ? this.d[cle] === true : this.d[cle] !== false, null, t);
      dr.append(this.cases[cle]);
    }
    // thème Hollow Knight : brume et sons d'ambiance (propres à cet appareil)
    this.cases.son_ambiance = caseACocher(this.d.son_ambiance === true, null, "Sons d'ambiance de caverne (vent, gouttes d'eau)");
    g.append(etiquette("Décor Hollow Knight (cet appareil)"), el("div.petit.muted", {texte: "Brume"}),
      this.pills("brume", [["aucune", "Sans brume"], ["legere", "Légère"], ["normale", "Normale"], ["dense", "Dense"]]),
      this.cases.son_ambiance, el("div.petit.muted", {texte: "Volume de l'ambiance"}), this.pills("volume_ambiance", [[30, "Doux"], [60, "Moyen"], [90, "Fort"]]));
    this.vPrenom = entree(this.d.prenom || "", {placeholder: "Ton prénom", maxlength: "30"});
    dr.append(etiquette("Ton prénom (page d'accueil)"), this.vPrenom);
    dr.append(etiquette("Synchronisation avec le PC"), el("div.rapides", null, app.lblSync ? el("span.mono.petit", {texte: app.lblSync.textContent, style: {color: app.lblSync.style.color}}) : null,
      petit("Détails…", () => app.ouvrirSynchro())));
    this.barre([bouton("Tout réinitialiser", () => { this.d = clone(DEFAUT_REGLAGES); this.hd.value = "7"; this.hf.value = "22"; for (const [k, c] of Object.entries(this.cases)) { c.classList.toggle("on", ["reduire_effets", "son_ambiance"].includes(k) ? DEFAUT_REGLAGES[k] === true : DEFAUT_REGLAGES[k] !== false); } this.maj(); }, "danger")],
      [bouton("Annuler", () => this.fermer()), bouton("Appliquer", () => this.valider(), "primary")]);
    this.maj();
  }
  pills(groupe, items) {
    this.groupes = this.groupes || {};
    const fr = el("div.rapides");
    this.groupes[groupe] = items.map(([v, n]) => { const b = petit(n, () => { this.d[groupe] = v; this.maj(); }); b.dataset.v = String(v); fr.append(b); return b; });
    return fr;
  }
  maj() {
    for (const [g, bs] of Object.entries(this.groupes)) for (const b of bs) b.className = "btn petit " + (String(this.d[g]) === b.dataset.v ? "primary" : "ghost");
    this.themes.innerHTML = "";
    for (const [k, t] of Object.entries(THEMES)) {
      const acc = this.d.accent || t.ACCENT, cats = Object.values(t.cats);
      const v = el("div.vignette" + (this.d.theme === k ? ".on" : ""), {onclick: () => { this.d.theme = k; this.maj(); }, style: {"--a": acc}},
        el("div.vg-fond", {style: {background: t.BG}}, el("div.vg-carte", {style: {background: t.SURFACE, borderColor: t.RULE}},
          el("span.vg-a", {style: {background: acc}}), el("span.vg-l", {style: {background: t.MUTED}}),
          el("div.vg-blocs", null, cats.slice(0, 4).map(c => el("span", {style: {background: mix(c, t.TINT, t.SURFACE), borderColor: mix(c, .45, t.SURFACE)}}))))),
        el("div.vg-nom", {texte: t.nom}));
      this.themes.append(v);
    }
    this.accents.innerHTML = "";
    const acc = (this.d.accent || "").toLowerCase();
    for (const c of ACCENTS) this.accents.append(el("span.sw" + (c === acc ? ".on" : ""), {style: {background: c}, onclick: () => { this.d.accent = c; this.maj(); }}));
    const perso = acc && !ACCENTS.includes(acc);
    this.accents.append(el("span.sw.plus" + (perso ? ".on" : ""), {style: perso ? {background: acc} : {}, texte: perso ? "" : "+",
      onclick: async () => { const t = THEMES[this.d.theme] || THEMES.nuit; const r = await choisirCouleur(this.d.accent || t.ACCENT, "Couleur d'accent"); if (r) { this.d.accent = r; this.maj(); } }}));
    this.sws.innerHTML = "";
    for (const k of Object.keys(CATS)) this.sws.append(el("span.sw-ligne", null, pastille(couleur(k), 12), CATS[k][1]));
  }
  valider() {
    const hd = parseInt(this.hd.value), hf = parseInt(this.hf.value);
    if (hf < hd + 6) return this.erreur("La grille doit couvrir au moins 6 heures.");
    this.d.h_debut = hd; this.d.h_fin = hf;
    this.d.prenom = this.vPrenom.value.trim().slice(0, 30);
    for (const [k, c] of Object.entries(this.cases)) this.d[k] = c.valeur();
    const reg = clone(this.d);
    this.fermer();
    setTimeout(() => this.app.appliquer(reg), 60);
  }
}

/* ---------- synchronisation (vue iPad) */
class FenetreSynchro extends Modal {
  constructor(app) {
    super("Synchronisation avec le PC", "Chaque changement fait ici ou sur le PC apparaît sur l'autre appareil en quelques secondes.");
    this.app = app;
    const s = app.sync;
    this.etat = el("div.etat-sync");
    this.carte.append(this.etat);
    if (s.configuree()) {
      this.carte.append(champ("Base Firebase", el("div.mono.petit", {texte: s.cfg.url})),
        champ("Clé secrète", el("div.mono.cle", {texte: s.cfg.cle.replace(/(.{4})/g, "$1-").replace(/-$/, "")})),
        el("div.petit.muted", {texte: "Si la connexion coupe, tes changements restent sur l'iPad et partent dès le retour d'Internet."}));
    }
    this.barre(s.configuree() ? [bouton("Délier cet iPad", async () => {
      if (await dialogue("Délier cet iPad", "Arrêter la synchronisation sur cet iPad ? Ton horaire reste affiché ici.", [["Annuler", false, "ghost"], ["Délier", true, "danger"]])) { s.oublier(); this.fermer(); }
    }, "danger"), bouton("Reconnecter", () => s.demarrer())] : [], [bouton("Fermer", () => this.fermer())]);
    this.majEtat();
  }
  majEtat() {
    const s = this.app.sync;
    const col = s.etat === "connectée" ? couleur("perso") : s.etat === "erreur" ? T.DANGER : T.MUTED;
    this.etat.innerHTML = "";
    this.etat.append(pastille(col, 12), el("b", {texte: "Synchronisation " + s.etat + (s.detail ? "  ·  " + s.detail : "")}));
  }
}
