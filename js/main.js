/* Application : état, mise en page, en-tête, barre d'outils, navigation, enregistrement. */
"use strict";

const LEFT = 58, PAD = 8;

class App {
  constructor() {
    window.app = this;
    this.donnees = null;
    const local = Stock.lire("horaire_donnees", null);
    if (local) this.donnees = normaliser(local);
    this.reglagesLocaux = Stock.lire("horaire_reglages_locaux", {});
    this.premierChargement = false;
    this.undo = []; this.selId = null; this.pressePapier = null; this.drag = null;
    this.vue = this.reglagesLocaux.vue === "jour" ? "jour" : "semaine";
    this.onglet = "taches"; this.fEch = "avenir"; this.fNote = ""; this.qNote = "";
    this.cacherSaute = false;
    this.dernierClicVide = null;
    this.sem = bornerLundi(aujourdhui());
    const a = aujourdhui();
    this.jourVue = memeJour(this.sem, lundiDe(a)) ? jourSemaine(a) : 0;
    this.sync = new Synchro(this);
    this.outils = new Outils(this);
    this.lireLien();
    if (this.donnees) this.demarrerInterface();
    else this.ecranAccueil();
    this.sync.demarrer();
    document.addEventListener("keydown", (e) => this.clavier(e));
    window.addEventListener("resize", () => this.redessinerBientot());
    setInterval(() => this.ticSeconde(), 1000);
    setInterval(() => this.ticMinute(), 60000);
  }

  get reglages() { return this.donnees ? this.donnees.reglages : DEFAUT_REGLAGES; }

  /* lien scanné depuis le PC : #k=CLE&u=URL */
  lireLien() {
    const h = location.hash.replace(/^#/, "");
    if (!h) return;
    const p = new URLSearchParams(h);
    const k = p.get("k"), u = p.get("u");
    if (k && u) {
      this.sync.configurer(u, k);
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  /* ---------- démarrage */
  ecranAccueil() {
    appliquerCategories(categoriesDefaut());
    appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, this.reglagesLocaux));
    const zone = document.getElementById("app");
    zone.innerHTML = "";
    const configuree = this.sync.configuree();
    const carte = el("div.accueil", null,
      el("h1", {texte: APP_TITLE}),
      el("p.muted", {texte: configuree ? "Connexion à ton horaire…" : "Relie cet iPad à ton PC pour retrouver ton horaire."}));
    if (!configuree) {
      const url = entree("https://horaire-antoine-default-rtdb.firebaseio.com");
      const cle = entree("", {placeholder: "XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XX", autocapitalize: "characters"});
      const err = el("div.erreur");
      carte.append(
        el("ol.etapes", null,
          el("li", {texte: "Sur le PC, ouvre l'horaire et clique sur « iPad »."}),
          el("li", {texte: "Active la synchronisation, puis scanne le QR code avec l'appareil photo de l'iPad."}),
          el("li", {texte: "Ou écris la clé ci-dessous (tu peux l'écrire à l'Apple Pencil)."})),
        champ("Adresse de la base Firebase", url), champ("Clé secrète", cle), err,
        bouton("Relier", () => { const e = this.sync.configurer(url.value, cle.value); err.textContent = e || ""; if (!e) this.ecranAccueil(); }, "primary"));
    } else {
      this.lblAccueil = el("p.muted.etat-accueil", {texte: "En attente des données…"});
      carte.append(this.lblAccueil, petit("Utiliser une autre clé", () => { this.sync.oublier(); this.ecranAccueil(); }));
    }
    zone.append(carte);
  }
  attenteDonnees() {
    if (this.lblAccueil) this.lblAccueil.textContent = "Aucune donnée sur le serveur pour l'instant : ouvre l'horaire sur ton PC (bouton « iPad » → Activer).";
  }

  demarrerInterface() {
    this.donnees = normaliser(this.donnees);
    for (const k of REG_LOCAUX) if (k in this.reglagesLocaux) this.donnees.reglages[k] = this.reglagesLocaux[k];
    appliquerCategories(this.donnees.categories);
    appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, this.donnees.reglages));
    this.construire();
    this.dessinerTout();
    this.enregistrerLocal();
  }

  /* ---------- enregistrement */
  enregistrerLocal() {
    if (!this.donnees) return;
    const ok = Stock.ecrire("horaire_donnees", this.donnees);
    const loc = {};
    for (const k of REG_LOCAUX) if (k in this.donnees.reglages) loc[k] = this.donnees.reglages[k];
    this.reglagesLocaux = loc;
    Stock.ecrire("horaire_reglages_locaux", loc);
    return ok;
  }
  sauver() {
    const ok = this.enregistrerLocal();
    this.statut(ok ? `Enregistré à ${new Date().toTimeString().slice(0, 5)}` : "Mémoire de l'iPad pleine");
    this.sync.localChange();
  }
  changement() { this.sauver(); this.dessinerTout(); }
  statut(t) { if (this.lblSave) this.lblSave.textContent = t; }

  /* ---------- synchro */
  peutAppliquerDistant() {
    if (this.drag && this.drag.moved) return false;
    return !Pile.some(p => p.estModal);
  }
  apresDistant(noms) {
    if (!this.interfacePrete) {
      this.demarrerInterface();
      return;
    }
    this.enregistrerLocal();
    this.statut(`Mis à jour depuis le PC à ${new Date().toTimeString().slice(0, 5)}`);
    if (this.selId && !this.blocParId(this.selId)) this.selId = null;
    if (noms.has("categories") || noms.has("reglages")) {
      appliquerCategories(this.donnees.categories);
      appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, this.donnees.reglages));
      this.construire();
    }
    this.dessinerTout();
    if (noms.has("alarmes") && this.fenHorloge) this.fenHorloge.dessinerAlarmes();
  }
  majEtatSynchro() {
    const s = this.sync;
    if (this.lblAccueil && s.etat === "erreur") this.lblAccueil.textContent = "Erreur : " + s.detail;
    if (!this.lblSync) return;
    let txt, col;
    if (!s.configuree()) { txt = "● non reliée au PC"; col = "var(--muted)"; }
    else if (s.etat === "connectée") {
      txt = Object.keys(s.enVol).length ? "● envoi…" : s.detail ? "● " + s.detail : "● synchronisé";
      col = s.detail ? "var(--muted)" : couleur("perso");
    } else { txt = "● " + s.etat; col = s.etat === "erreur" ? "var(--danger)" : "var(--muted)"; }
    this.lblSync.textContent = txt;
    this.lblSync.style.color = col;
    if (this.fenSync) this.fenSync.majEtat();
  }

  /* ---------- mise en page */
  construire() {
    this.interfacePrete = true;
    const zone = document.getElementById("app");
    zone.innerHTML = "";
    document.body.classList.toggle("sans-horloge", this.reglages.horloge === false);
    // en-tête
    this.lblSemaine = el("div.mono.muted.petit-titre");
    this.barreSession = el("div.barre-session");
    this.lblHeure = el("span.heure", {onclick: () => this.ouvrirHorloge()});
    this.lblSec = el("span.sec", {onclick: () => this.ouvrirHorloge()});
    this.lblDate = el("div.mono.muted");
    this.lblMaint = el("div.maint");
    this.lblEnsuite = el("div.ensuite");
    this.lblOutils = el("div.outils-actifs", {onclick: () => this.ouvrirHorloge()});
    this.chips = {};
    const stats = el("div.stats");
    for (const [cle, label, cat] of [["cours", "COURS", "info"], ["opt", "OPTIONNEL", "meca"], ["travail", "TRAVAIL", "travail"], ["etude", "ÉTUDE", "etude"]]) {
      const v = el("div.chip-val");
      const c = el("div.chip", null, v, el("div.chip-lbl", null, pastille(couleur(cat), 7), label));
      this.chips[cle] = [c, v];
      stats.append(c);
    }
    const entete = el("header.entete", null,
      el("div.titre-zone", null, this.lblSemaine, el("h1", {texte: APP_TITLE}), this.barreSession),
      el("div.horloge-zone", null,
        el("div", null, el("div.ligne-heure", null, this.lblHeure, this.lblSec), this.lblDate),
        el("div.info-maint", null, this.lblMaint, this.lblEnsuite, this.lblOutils)),
      stats);
    // barre d'outils
    this.lblSave = el("span.mono.muted.lbl-save");
    this.lblSync = el("span.mono.lbl-sync", {onclick: () => this.ouvrirSynchro()});
    this.btnCarnet = bouton("Carnet", () => document.body.classList.toggle("carnet-ouvert"), "ghost");
    this.btnCarnet.classList.add("btn-carnet");
    const outils = el("div.barre-outils", null,
      bouton("+  Ajouter un bloc", () => this.nouveauBloc(), "primary"),
      bouton("Horloge", () => this.ouvrirHorloge()),
      bouton("Matières", () => new Matieres(this).montrer()),
      bouton("Réglages", () => new Reglages(this).montrer()),
      caseACocher(this.cacherSaute, (v) => { this.cacherSaute = v; this.dessinerGrille(); }, "Cacher les blocs « je saute »"),
      el("div.espace"), this.lblSync, this.lblSave,
      bouton("Exporter", () => this.exporter()), bouton("Importer", () => this.importer()), this.btnCarnet);
    // barre de la semaine
    this.vues = {};
    const bs = el("div.barre-semaine");
    for (const [cle, titre] of [["semaine", "Semaine"], ["jour", "Journée"]]) {
      const b = bouton(titre, () => this.changerVue(cle), cle === this.vue ? "tab_on" : "tab");
      this.vues[cle] = b; bs.append(b);
    }
    this.selSem = el("select.saisie.sel-semaine", {onchange: () => this.allerSemaine(lundiSemaine(parseInt(this.selSem.value)))});
    this.remplirSemaines();
    this.lblCrit = el("span.lbl-crit");
    this.lblSemInfo = el("span.muted.petit");
    bs.append(bouton("‹", () => this.precedent(), "ghost fleche"), this.selSem, bouton("›", () => this.suivant(), "ghost fleche"),
      bouton("Aujourd'hui", () => this.allerAujourdhui()), this.lblCrit, this.lblSemInfo, el("div.espace"),
      bouton("Semaine…", () => new OptionsSemaine(this).montrer()));
    // grille
    this.gScroll = el("div.grille-scroll");
    this.gEnt = el("div.grille-entete");
    this.gCorps = el("div.grille-corps");
    this.gScroll.append(this.gEnt, this.gCorps);
    this.pj = el("aside.panneau-jour");
    this.legende = el("div.legende");
    this.barreSel = el("div.barre-selection");
    const grilleCarte = el("section.carte.grille-carte", null, bs,
      el("div.grille-zone", null, this.gScroll, this.pj), this.legende, this.barreSel);
    // carnet
    this.pages = {}; this.onglets = {};
    const tabs = el("div.onglets");
    for (const [cle, titre] of [["taches", "Tâches"], ["ech", "Échéances"], ["notes", "Notes"]]) {
      const b = bouton(titre, () => this.montrer(cle), "tab");
      this.onglets[cle] = b; tabs.append(b);
      this.pages[cle] = el("div.page");
    }
    const carnet = el("aside.carte.carnet", null, tabs, this.pages.taches, this.pages.ech, this.pages.notes);
    this.pageTaches(this.pages.taches);
    this.pageEcheances(this.pages.ech);
    this.pageNotes(this.pages.notes);
    zone.append(entete, outils, el("main.principal", null, grilleCarte, carnet), el("div.voile-carnet", {onclick: () => document.body.classList.remove("carnet-ouvert")}));
    this.montrer(this.onglet);
    this.installerGrille();
    this.majHorloge(true);
    this.majEtatSynchro();
  }

  remplirSemaines() {
    const aujIdx = Math.floor(joursEntre(SESSION_DEBUT, bornerLundi(aujourdhui())) / 7);
    const crit = new Set(this.donnees.critiques || []), rel = new Set(this.donnees.relaches || []);
    this.selSem.innerHTML = "";
    for (let i = 0; i < SESSION_SEMAINES; i++) {
      const l = lundiSemaine(i), k = iso(l);
      this.selSem.append(el("option", {value: String(i), texte: `Semaine ${i + 1}  ·  ${plageSemaine(l)}` + (i === aujIdx ? "  ·  actuelle" : "") + (crit.has(k) ? "  ⚠" : "") + (rel.has(k) ? "  ☀" : "")}));
    }
  }

  montrer(cle) {
    this.onglet = cle;
    for (const [k, p] of Object.entries(this.pages)) {
      p.hidden = k !== cle;
      this.onglets[k].className = "btn " + (k === cle ? "tab_on" : "tab");
    }
  }

  /* ---------- semaines : données */
  entreeSemaine() { return this.donnees.semaines[iso(this.sem)]; }
  semaineModifiee() { const s = this.entreeSemaine(); return !!(s && s.blocs); }
  blocsVue() { const s = this.entreeSemaine(); return s && s.blocs ? s.blocs : this.donnees.modele; }
  blocsEdit() {
    const k = iso(this.sem);
    const s = this.donnees.semaines[k] = this.donnees.semaines[k] || {};
    if (!s.blocs) s.blocs = clone(this.donnees.modele);
    return s.blocs;
  }
  tachesVue() { const s = this.entreeSemaine(); return (s && s.taches) || []; }
  tachesEdit() {
    const k = iso(this.sem);
    const s = this.donnees.semaines[k] = this.donnees.semaines[k] || {};
    if (!s.taches) s.taches = [];
    return s.taches;
  }
  blocsDe(d) {
    const s = this.donnees.semaines[iso(lundiDe(d))];
    const src = s && s.blocs ? s.blocs : this.donnees.modele;
    return src.filter(b => b.jour === jourSemaine(d) && b.statut !== "saute").sort((a, b) => toMin(a.debut) - toMin(b.debut));
  }
  blocParId(id) { return this.blocsVue().find(b => b.id === id) || null; }
  echeancesDu(d) {
    const k = iso(d);
    return this.donnees.echeances.filter(e => e.date === k && !e.fait).sort((a, b) => (a.heure || "99").localeCompare(b.heure || "99"));
  }
  idxSem() { return Math.floor(joursEntre(SESSION_DEBUT, this.sem) / 7); }

  /* ---------- navigation */
  allerSemaine(d) {
    const n = bornerLundi(d);
    if (!memeJour(n, this.sem)) { this.sem = n; this.selId = null; this.naviguer(); }
  }
  dateVue() { return ajouterJours(this.sem, this.jourVue); }
  allerJour(d) {
    const l = bornerLundi(d);
    if (!memeJour(lundiDe(d), l)) d = d < l ? l : ajouterJours(l, 6);
    this.sem = l; this.jourVue = jourSemaine(d);
    this.naviguer();
  }
  precedent() { this.vue === "jour" ? this.allerJour(ajouterJours(this.dateVue(), -1)) : this.allerSemaine(ajouterJours(this.sem, -7)); }
  suivant() { this.vue === "jour" ? this.allerJour(ajouterJours(this.dateVue(), 1)) : this.allerSemaine(ajouterJours(this.sem, 7)); }
  allerAujourdhui() { this.vue === "jour" ? this.allerJour(aujourdhui()) : this.allerSemaine(aujourdhui()); }
  naviguer() {
    this.majBarreSemaine();
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => this.dessinerSemaine());
  }
  changerVue(vue, jour) {
    if (jour !== undefined) this.jourVue = jour;
    else if (vue === "jour" && this.vue !== "jour") {
      const a = aujourdhui();
      if (memeJour(lundiDe(a), this.sem)) this.jourVue = jourSemaine(a);
    }
    this.vue = vue;
    this.donnees.reglages.vue = vue;
    this.enregistrerLocal();
    for (const [k, b] of Object.entries(this.vues)) b.className = "btn " + (k === vue ? "tab_on" : "tab");
    this.gScroll.scrollLeft = 0;
    this.dessinerTout();
  }

  /* ---------- dessin */
  dessinerTout() {
    if (!this.interfacePrete) return;
    this.dessinerSemaine();
    this.dessinerEcheances();
    this.dessinerNotes();
  }
  dessinerSemaine() {
    this.majBarreSemaine();
    this.dessinerStats();
    this.dessinerGrille();
    this.dessinerPanneauJour();
    this.dessinerLegende();
    this.dessinerTaches();
    this.majSelection();
  }
  redessinerBientot() {
    clearTimeout(this._rt);
    this._rt = setTimeout(() => { if (this.interfacePrete) this.dessinerGrille(); }, 80);
  }

  majBarreSemaine() {
    const idx = this.idxSem();
    if (this.selSem.value !== String(idx)) this.selSem.value = String(idx);
    let nEch = 0;
    for (let i = 0; i < 7; i++) nEch += this.echeancesDu(ajouterJours(this.sem, i)).length;
    const k = iso(this.sem);
    const crit = (this.donnees.critiques || []).includes(k), rel = (this.donnees.relaches || []).includes(k);
    this.lblCrit.textContent = rel ? "☀ Semaine de relâche" : crit ? "⚠ Période critique" : "";
    this.lblCrit.style.color = rel ? "var(--accent)" : "var(--critique)";
    const m = [this.semaineModifiee() ? "Modifiée" : "Semaine type"];
    if (nEch) m.push(`${nEch} échéance${nEch > 1 ? "s" : ""}`);
    this.lblSemInfo.textContent = m.join("  ·  ");
  }

  dessinerStats() {
    let cours = 0, opt = 0, travail = 0, etude = 0;
    for (const b of this.blocsVue()) {
      const d = Math.max(0, toMin(b.fin) - toMin(b.debut));
      if (b.statut === "saute") continue;
      const cat = CATS[b.cat];
      if (cat && cat[2]) { if (b.statut === "possible") opt += d; else cours += d; }
      else if (b.cat === "travail") travail += d;
      else if (b.cat === "etude") etude += d;
    }
    this.chips.cours[1].textContent = fmtDuree(cours);
    this.chips.travail[1].textContent = fmtDuree(travail);
    this.chips.etude[1].textContent = fmtDuree(etude);
    this.chips.opt[1].textContent = "+" + fmtDuree(opt);
    this.chips.opt[0].hidden = !opt;
    const rel = (this.donnees.relaches || []).includes(iso(this.sem));
    this.lblSemaine.textContent = `SEMAINE ${this.idxSem() + 1} SUR ${SESSION_SEMAINES}  ·  ${plageSemaine(this.sem).toUpperCase()}  ·  ${rel ? "RELÂCHE" : "TEMPS COMPLET"}`;
    // barre de la session
    const b = this.barreSession;
    b.innerHTML = "";
    const debut = SESSION_DEBUT, fin = ajouterJours(lundiSemaine(SESSION_SEMAINES - 1), 6);
    const total = joursEntre(debut, fin) + 1;
    const frac = Math.max(0, Math.min(1, (joursEntre(debut, aujourdhui()) + 1) / total));
    for (const l of this.donnees.critiques || []) {
      const d = isoDate(l);
      if (d) b.append(el("span.crit", {style: {left: (joursEntre(debut, d) / total * 100) + "%", width: (7 / total * 100) + "%"}}));
    }
    if (frac > 0) b.append(el("span.prog", {style: {width: (frac * 100) + "%"}}));
    b.append(el("span.repere", {style: {left: (joursEntre(debut, this.sem) / total * 100) + "%"}}));
  }

  dessinerLegende() {
    const lg = this.legende;
    lg.innerHTML = "";
    const util = new Set(this.blocsVue().map(b => b.cat));
    for (const [k, v] of Object.entries(CATS)) if (util.has(k)) lg.append(el("span.leg", null, pastille(couleur(k)), v[1]));
    lg.append(el("span.leg-aide.muted", {texte: "Pencil ou souris : glisser pour déplacer  ·  Doigt : maintenir puis glisser  ·  Bord du bas : durée"}));
  }

  /* ---------- horloge du bandeau */
  ticSeconde() {
    if (!this.interfacePrete) return;
    this.majHorloge(false);
  }
  ticMinute() {
    if (!this.interfacePrete || (this.drag && this.drag.moved) || Pile.some(p => p.estModal)) return;
    this.dessinerStats(); this.dessinerGrille(); this.dessinerEcheances(); this.dessinerPanneauJour();
  }
  majHorloge(force) {
    const now = new Date();
    if (this.reglages.horloge === false) return;
    this.lblHeure.textContent = now.toTimeString().slice(0, 5);
    this.lblSec.textContent = this.reglages.secondes !== false ? ":" + String(now.getSeconds()).padStart(2, "0") : "";
    this.lblDate.textContent = `${JOURS[jourSemaine(now)].toUpperCase()} ${now.getDate()} ${MOIS[now.getMonth()].toUpperCase()}`;
    if (force || now.getSeconds() === 0 || !this._maintInit) { this._maintInit = true; this.majMaintenant(now); }
    this.lblOutils.textContent = this.outils.resume();
  }
  majMaintenant(now) {
    const m = now.getHours() * 60 + now.getMinutes();
    const blocs = this.blocsDe(aujourdhui());
    const enCours = blocs.find(b => toMin(b.debut) <= m && m < toMin(b.fin));
    const prochain = blocs.find(b => toMin(b.debut) > m);
    const nom = (b) => (b.titre || "Sans titre") + (b.lieu ? ` (${b.lieu})` : "");
    let ens = "";
    if (enCours) {
      this.lblMaint.textContent = "En cours : " + nom(enCours);
      this.lblMaint.style.color = couleur(enCours.cat);
      const reste = toMin(enCours.fin) - m;
      ens = reste >= 60 ? `Se termine dans ${fmtDuree(reste)}` : `Se termine dans ${reste} min`;
    } else { this.lblMaint.textContent = "Temps libre"; this.lblMaint.style.color = ""; }
    if (prochain) {
      const dans = toMin(prochain.debut) - m;
      ens = (ens ? ens + "   ·   " : "") + `Ensuite : ${nom(prochain)} à ${fmt(prochain.debut)} (dans ${dans < 60 ? dans + " min" : fmtDuree(dans)})`;
    } else if (!enCours) ens = "Plus rien de prévu aujourd'hui";
    const a = aujourdhui();
    const exams = this.donnees.echeances.filter(e => !e.fait && ["intra", "final"].includes(e.type) && isoDate(e.date) && isoDate(e.date) >= a)
      .sort((x, y) => x.date.localeCompare(y.date));
    this.lblEnsuite.textContent = ens;
    if (exams.length) {
      const e = exams[0];
      this.lblEnsuite.append(el("br"), `Prochain examen : ${CATS[e.cours] ? CATS[e.cours][1] : ""} ${e.quoi || ""} — ${quand(isoDate(e.date))}`);
    }
  }

  /* ---------- clavier (clavier physique de l'iPad) */
  saisieActive() {
    const a = document.activeElement;
    return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT" || a.isContentEditable);
  }
  clavier(e) {
    const top = Pile[Pile.length - 1];
    if (top) { if (top.touche(e)) e.preventDefault(); return; }
    if (this.saisieActive() || !this.interfacePrete) return;
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (mod) {
      const a = {c: () => this.copierBloc(), x: () => this.copierBloc(true), v: () => this.collerBloc(), d: () => this.dupliquerBloc(), z: () => this.annuler()}[k];
      if (a) { e.preventDefault(); a(); }
      if (k === "arrowleft") { e.preventDefault(); this.precedent(); }
      if (k === "arrowright") { e.preventDefault(); this.suivant(); }
      return;
    }
    const act = {s: () => this.changerVue("semaine"), j: () => this.changerVue("jour"), t: () => this.allerAujourdhui(),
      n: () => this.nouveauBloc(), h: () => this.ouvrirHorloge(), arrowleft: () => this.precedent(), arrowright: () => this.suivant(),
      pageup: () => this.precedent(), pagedown: () => this.suivant(), delete: () => this.supprimerBloc(), backspace: () => this.supprimerBloc()}[k];
    if (act) { e.preventDefault(); act(); }
  }

  /* ---------- export / import */
  exporter() {
    const blob = new Blob([JSON.stringify(this.donnees, null, 2)], {type: "application/json"});
    const nom = `horaire_copie_${iso(aujourdhui())}.json`;
    const fichier = new File([blob], nom, {type: "application/json"});
    if (navigator.canShare && navigator.canShare({files: [fichier]})) {
      navigator.share({files: [fichier], title: nom}).catch(() => {});
      return;
    }
    const a = el("a", {href: URL.createObjectURL(blob), download: nom});
    document.body.append(a); a.click(); a.remove();
  }
  importer() {
    const inp = el("input", {type: "file", accept: ".json,application/json"});
    inp.addEventListener("change", async () => {
      const f = inp.files[0];
      if (!f) return;
      let st;
      try { st = normaliser(JSON.parse(await f.text())); } catch (e) { informer(APP_TITLE, "Ce fichier ne peut pas être lu."); return; }
      if (await dialogue("Importer un horaire", "Remplacer tout ton horaire actuel par celui de ce fichier ?\nLe PC sera aussi mis à jour.",
        [["Annuler", false, "ghost"], ["Remplacer", true, "primary"]])) {
        const loc = {};
        for (const k of REG_LOCAUX) if (k in this.donnees.reglages) loc[k] = this.donnees.reglages[k];
        st.reglages = Object.assign({}, st.reglages, loc);
        this.donnees = st;
        appliquerCategories(st.categories);
        appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, st.reglages));
        this.sauver();
        this.construire(); this.dessinerTout();
      }
    });
    inp.click();
  }
}
