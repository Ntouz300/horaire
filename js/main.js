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
    this.compact = majCompact();
    // sur iPhone, la journée est la vue par défaut (la semaine reste disponible)
    this.vue = this.reglagesLocaux.vue === "jour" || (IPHONE && this.reglagesLocaux.vue !== "semaine") ? "jour" : "semaine";
    this.onglet = "taches"; this.fEch = "avenir"; this.fNote = ""; this.qNote = "";
    this.page = "accueil";
    this.cacherSaute = false;
    this.dernierClicVide = null;
    this.sem = bornerLundi(aujourdhui());
    const a = aujourdhui();
    this.jourVue = memeJour(this.sem, lundiDe(a)) ? jourSemaine(a) : 0;
    this.sync = new Synchro(this);
    Stock.avantVider.push(() => {                       // l'appli passe en arrière-plan ou se ferme : rien ne doit rester en attente
      if (this.ecrans && this.ecrans.notes) this.ecrans.notes.enregistrer();
      this.enregistrerLocal();
    });
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
  /* données de l'horaire actif (modele, semaines, echeances, critiques, relaches, imports) */
  get ses() { return donneesHoraire(this.donnees, HID); }

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
    activerHoraire(metaHoraire(this.donnees, this.donnees.reglages.horaire || "aut26"));
    if (!this.interfacePrete) this.page = configMenu(this.donnees.reglages).depart;
    this.sem = bornerLundi(aujourdhui());
    this.jourVue = memeJour(this.sem, lundiDe(aujourdhui())) ? jourSemaine(aujourdhui()) : 0;
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
    if (this.page === "notes" && this.ecrans && (this.ecrans.notes.sale || (this.ecrans.notes.ed && (this.ecrans.notes.ed.geste || this.ecrans.notes.ed.texteOuvert)))) return false;
    return !Pile.some(p => p.estModal);
  }
  apresDistant(noms) {
    if (!this.interfacePrete) {
      this.demarrerInterface();
      return;
    }
    this.enregistrerLocal();
    menageVocaux(this, noms);
    this.statut(`Mis à jour depuis le PC à ${new Date().toTimeString().slice(0, 5)}`);
    let actif = this.donnees.reglages.horaire || "aut26";
    if (!listeHoraires(this.donnees).some(h => h.id === actif)) actif = this.donnees.reglages.horaire = "aut26";
    const h = metaHoraire(this.donnees, actif);
    const changeHoraire = h.id !== HID || joursEntre(isoDate(h.debut), SESSION_DEBUT) !== 0 || h.nb !== SESSION_SEMAINES || "Horaire " + h.nom !== APP_TITLE;
    if (changeHoraire) { activerHoraire(h); this.sem = bornerLundi(this.sem); }
    if (this.selId && !this.blocParId(this.selId)) this.selId = null;
    if (noms.has("categories") || noms.has("reglages") || changeHoraire) {
      appliquerCategories(this.donnees.categories);
      appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, this.donnees.reglages));
      this.construire();
      return;
    }
    this.dessinerTout();
    if (this.page !== "horaire") this.ecrans[this.page].rafraichir();
    if (noms.has("horaires")) this.rail.maj();
    if (noms.has("alarmes") && this.fenHorloge) this.fenHorloge.dessinerAlarmes();
  }
  majEtatSynchro() {
    const s = this.sync;
    if (this.lblAccueil && s.etat === "erreur") this.lblAccueil.textContent = "Erreur : " + s.detail;
    if (!this.lblSync) return;
    let txt, col;
    const rail = this.rail && this.rail.lblSync;
    if (!s.configuree()) { txt = "● non reliée au PC"; col = "var(--muted)"; }
    else if (s.etat === "connectée") {
      txt = Object.keys(s.enVol).length ? "● envoi…" : s.detail ? "● " + s.detail : "● synchronisé";
      col = s.detail ? "var(--muted)" : couleur("perso");
    } else { txt = "● " + s.etat; col = s.etat === "erreur" ? "var(--danger)" : "var(--muted)"; }
    this.lblSync.textContent = txt;
    this.lblSync.style.color = col;
    if (rail) { rail.textContent = "●"; rail.title = txt.replace("● ", ""); rail.style.color = col; }
    if (this.fenSync) this.fenSync.majEtat();
  }

  /* ---------- mise en page */
  construire() {
    this.interfacePrete = true;
    const zone = document.getElementById("app");
    zone.innerHTML = "";
    document.body.classList.toggle("sans-horloge", this.reglages.horloge === false);
    document.title = APP_TITLE;
    this.rail = new Rail(this);
    const H = el("div.ecran.ecran-horaire");
    this.ecrans = {horaire: {el: H}, accueil: new PageAccueil(this), notes: new PageNotes(this), resultats: new PageResultats(this), objets3d: new Page3D(this), transferts: new PageTransferts(this),
      youtube: new PageLien(this, "youtube"), musique: new PageLien(this, "musique")};
    zone.append(el("div.coque", null, this.rail.el, el("div.pages", null, ...Object.values(this.ecrans).map(e => e.el))));
    this.construireHoraire(H);
    this.aller(this.page);
  }

  /* change de page dans le menu */
  aller(page) {
    if (!this.ecrans || !this.ecrans[page]) page = "accueil";
    if (page !== "notes" && this.page === "notes" && this.ecrans) this.ecrans.notes.enregistrer();
    this.page = page;
    for (const [k, e] of Object.entries(this.ecrans)) e.el.hidden = k !== page;
    document.body.dataset.page = page;
    if (page !== "horaire") document.body.classList.remove("carnet-ouvert");
    this.rail.maj();
    if (page === "horaire") this.dessinerTout();
    else this.ecrans[page].rafraichir();
  }
  choisirHoraire(id) {
    const h = metaHoraire(this.donnees, id);
    this.donnees.reglages.horaire = h.id;
    activerHoraire(h);
    this.sem = bornerLundi(aujourdhui());
    this.jourVue = memeJour(this.sem, lundiDe(aujourdhui())) ? jourSemaine(aujourdhui()) : 0;
    this.selId = null; this.undo = [];
    this.sauver();
    this.page = "horaire";
    this.construire();
  }

  construireHoraire(zone) {
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
    const outils = this.compact
      // iPhone : l'essentiel dans la barre, le reste dans « Options »
      ? el("div.barre-outils", null,
        bouton("+  Bloc", () => this.nouveauBloc(), "primary"), this.btnCarnet,
        bouton("Options", () => this.optionsHoraire(), "ghost"), el("div.espace"), this.lblSync, this.lblSave)
      : el("div.barre-outils", null,
        bouton("+  Ajouter un bloc", () => this.nouveauBloc(), "primary"),
        bouton(metaHoraire(this.donnees, HID).nom + "  ▾", () => new ChoixHoraire(this).montrer()),
        bouton("Matières", () => new Matieres(this).montrer()),
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
    // iPhone, vue journée : « Résumé » montre le panneau du jour (bilan, créneaux libres, échéances) à la place de la grille
    this.btnResume = bouton("Résumé", () => { document.body.classList.toggle("voir-resume"); this.btnResume.className = "btn btn-resume " + (document.body.classList.contains("voir-resume") ? "tab_on" : "ghost"); if (!document.body.classList.contains("voir-resume")) this.dessinerGrille(); }, "ghost");
    this.btnResume.classList.add("btn-resume");
    document.body.classList.remove("voir-resume");
    const cl = (b, c) => { b.classList.add(c); return b; };
    bs.append(cl(bouton("‹", () => this.precedent(), "ghost fleche"), "bs-prec"), this.selSem, cl(bouton("›", () => this.suivant(), "ghost fleche"), "bs-suiv"),
      cl(bouton("Aujourd'hui", () => this.allerAujourdhui()), "bs-auj"), this.lblCrit, this.lblSemInfo, el("div.espace"), this.btnResume,
      cl(bouton("Semaine…", () => new OptionsSemaine(this).montrer()), "bs-optsem"));
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
    const fermerCarnet = bouton("✕", () => document.body.classList.remove("carnet-ouvert"), "ghost", {title: "Fermer", "aria-label": "Fermer le carnet"});
    fermerCarnet.classList.add("carnet-fermer");
    tabs.append(fermerCarnet);
    const carnet = el("aside.carte.carnet", null, tabs, this.pages.taches, this.pages.ech, this.pages.notes);
    this.pageTaches(this.pages.taches);
    this.pageEcheances(this.pages.ech);
    this.pageNotes(this.pages.notes);
    zone.append(entete, outils, el("main.principal", null, grilleCarte, carnet), el("div.voile-carnet", {onclick: () => document.body.classList.remove("carnet-ouvert")}));
    this.montrer(this.onglet);
    this.installerGrille();
    this.installerBalayage();
    this.majHorloge(true);
    this.majEtatSynchro();
  }

  /* iPhone, vue journée : un glissement horizontal du doigt passe au jour précédent / suivant (jamais pendant un déplacement de bloc) */
  installerBalayage() {
    let d = null;
    this.gScroll.addEventListener("touchstart", (e) => {
      d = this.compact && this.vue === "jour" && e.touches.length === 1 && !e.target.closest(".bloc")
        ? {x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now()} : null;
    }, {passive: true});
    this.gScroll.addEventListener("touchend", (e) => {
      if (!d || (this.drag && (this.drag.arme || this.drag.moved))) { d = null; return; }
      const t = e.changedTouches[0], dx = t.clientX - d.x, dy = t.clientY - d.y;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 45 && Date.now() - d.t < 700 && this.gScroll.scrollWidth <= this.gScroll.clientWidth + 2) {
        if (dx < 0) this.suivant(); else this.precedent();
      }
      d = null;
    }, {passive: true});
  }

  /* iPhone : options de l'horaire qui ne tiennent pas dans la barre */
  optionsHoraire() {
    const m = new Modal("Options de l'horaire", null);
    const act = (texte, f, style = "ghost") => bouton(texte, () => { m.fermer(); f(); }, style);
    m.carte.append(el("div.opt-horaire", null,
      act("Horaire : " + metaHoraire(this.donnees, HID).nom + "  ▾", () => new ChoixHoraire(this).montrer()),
      act("Matières", () => new Matieres(this).montrer()),
      act("Options de la semaine…", () => new OptionsSemaine(this).montrer()),
      act("Exporter", () => this.exporter()), act("Importer", () => this.importer()),
      act("Synchronisation", () => this.ouvrirSynchro())),
      el("div.champ", null, caseACocher(this.cacherSaute, (v) => { this.cacherSaute = v; this.dessinerGrille(); }, "Cacher les blocs « je saute »")));
    m.barre([], [bouton("Fermer", () => m.fermer())]);
    m.montrer();
  }

  remplirSemaines() {
    const aujIdx = Math.floor(joursEntre(SESSION_DEBUT, bornerLundi(aujourdhui())) / 7);
    const crit = new Set(this.ses.critiques || []), rel = new Set(this.ses.relaches || []);
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
  entreeSemaine() { return this.ses.semaines[iso(this.sem)]; }
  semaineModifiee() { const s = this.entreeSemaine(); return !!(s && s.blocs); }
  blocsVue() { const s = this.entreeSemaine(); return s && s.blocs ? s.blocs : this.ses.modele; }
  blocsEdit() {
    const k = iso(this.sem);
    const s = this.ses.semaines[k] = this.ses.semaines[k] || {};
    if (!s.blocs) s.blocs = clone(this.ses.modele);
    return s.blocs;
  }
  tachesVue() { const s = this.entreeSemaine(); return (s && s.taches) || []; }
  tachesEdit() {
    const k = iso(this.sem);
    const s = this.ses.semaines[k] = this.ses.semaines[k] || {};
    if (!s.taches) s.taches = [];
    return s.taches;
  }
  blocsDe(d) {
    const h = horairePour(this.donnees, d, HID);
    if (!h) return [];
    const ses = donneesHoraire(this.donnees, h.id);
    const s = ses.semaines[iso(lundiDe(d))];
    const src = s && s.blocs ? s.blocs : ses.modele;
    return src.filter(b => b.jour === jourSemaine(d) && b.statut !== "saute").sort((a, b) => toMin(a.debut) - toMin(b.debut));
  }
  blocParId(id) { return this.blocsVue().find(b => b.id === id) || null; }
  echeancesDu(d) {
    const k = iso(d);
    return this.ses.echeances.filter(e => e.date === k && !e.fait).sort((a, b) => (a.heure || "99").localeCompare(b.heure || "99"));
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
    if (!this.interfacePrete || this.page !== "horaire") return;
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
    this._rt = setTimeout(() => {
      const c = majCompact();
      if (c !== this.compact) {                     // passage petit écran ↔ grand écran (Slide Over, rotation) : on refait l'interface
        this.compact = c;
        if (this.interfacePrete) { if (this.ecrans && this.ecrans.notes) this.ecrans.notes.enregistrer(); this.construire(); }
        return;
      }
      if (this.interfacePrete && this.page === "horaire") this.dessinerGrille();
    }, 80);
  }

  majBarreSemaine() {
    const idx = this.idxSem();
    if (this.selSem.value !== String(idx)) this.selSem.value = String(idx);
    let nEch = 0;
    for (let i = 0; i < 7; i++) nEch += this.echeancesDu(ajouterJours(this.sem, i)).length;
    const k = iso(this.sem);
    const crit = (this.ses.critiques || []).includes(k), rel = (this.ses.relaches || []).includes(k);
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
    const rel = (this.ses.relaches || []).includes(iso(this.sem));
    this.lblSemaine.textContent = `SEMAINE ${this.idxSem() + 1} SUR ${SESSION_SEMAINES}  ·  ${plageSemaine(this.sem).toUpperCase()}  ·  ${rel ? "RELÂCHE" : "TEMPS COMPLET"}`;
    // barre de la session
    const b = this.barreSession;
    b.innerHTML = "";
    const debut = SESSION_DEBUT, fin = ajouterJours(lundiSemaine(SESSION_SEMAINES - 1), 6);
    const total = joursEntre(debut, fin) + 1;
    const frac = Math.max(0, Math.min(1, (joursEntre(debut, aujourdhui()) + 1) / total));
    for (const l of this.ses.critiques || []) {
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
    if (T.REG_THEME === "minecraft" && iconesJeu()) lg.append(barreObjets());
    lg.append(el("span.leg-aide.muted", {texte: "Pencil ou souris : glisser pour déplacer  ·  Doigt : maintenir puis glisser  ·  Bord du bas : durée"}));
  }

  /* ---------- horloge du bandeau */
  ticSeconde() {
    if (!this.interfacePrete) return;
    if (this.page === "accueil") this.ecrans.accueil.tic();
    this.majHorloge(false);
  }
  ticMinute() {
    if (!this.interfacePrete || (this.drag && this.drag.moved) || Pile.some(p => p.estModal)) return;
    if (this.page === "accueil") this.ecrans.accueil.rafraichir();
    if (this.page !== "horaire") return;
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
    const exams = this.ses.echeances.filter(e => !e.fait && ["intra", "final"].includes(e.type) && isoDate(e.date) && isoDate(e.date) >= a)
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
    if (this.page === "notes" && this.interfacePrete && !this.saisieActive() && this.ecrans.notes && !this.ecrans.notes.doc) {
      if (this.ecrans.notes.clavier(e)) e.preventDefault();
      return;
    }
    if (this.saisieActive() || !this.interfacePrete || this.page !== "horaire") return;
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
        const gardees = new Set((st.notes || []).map(n => n.id));
        for (const n of this.donnees.notes || []) if (!gardees.has(n.id)) this.sync.marquerSuppression(n.id);     // remplacement voulu
        this.donnees = st;
        activerHoraire(metaHoraire(st, st.reglages.horaire || "aut26"));
        appliquerCategories(st.categories);
        appliquerReglages(Object.assign({}, DEFAUT_REGLAGES, st.reglages));
        this.sauver();
        this.construire(); this.dessinerTout();
      }
    });
    inp.click();
  }
}
