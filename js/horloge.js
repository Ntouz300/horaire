/* Horloge, chronomètre, minuterie, Pomodoro, alarmes (moteur + panneau), comme sur le PC. */
"use strict";

const mono = () => performance.now() / 1000;

class Outils {
  constructor(app) {
    this.app = app;
    this.chMarche = false; this.chT0 = 0; this.chCumul = 0; this.tours = [];
    this.miTotal = 300; this.miReste = 300; this.miFin = 0; this.miMarche = false; this.miNom = "";
    this.poPhase = "travail"; this.poMarche = false; this.poFin = 0; this.poReste = null; this.poCycles = 0; this.poCat = "etude";
    this.derniereMinute = null; this.snoozes = [];
    // la minuterie et le Pomodoro survivent à la fermeture de l'app (heure de fin mémorisée)
    const e = Stock.lire("horaire_outils", null);
    if (e) {
      const now = Date.now();
      if (e.miMarche && e.miFinMs) { this.miMarche = true; this.miFin = mono() + (e.miFinMs - now) / 1000; this.miTotal = e.miTotal; this.miNom = e.miNom || ""; }
      if (e.poMarche && e.poFinMs) { this.poMarche = true; this.poFin = mono() + (e.poFinMs - now) / 1000; this.poPhase = e.poPhase; this.poCycles = e.poCycles || 0; this.poCat = e.poCat || "etude"; }
      if (e.chMarche && e.chDebutMs) { this.chMarche = true; this.chT0 = mono() - (now - e.chDebutMs) / 1000; this.chCumul = e.chCumul || 0; }
    }
    setInterval(() => this.tic(), 100);
  }
  memoriser() {
    const now = Date.now();
    Stock.ecrire("horaire_outils", {
      miMarche: this.miMarche, miFinMs: this.miMarche ? now + (this.miFin - mono()) * 1000 : 0, miTotal: this.miTotal, miNom: this.miNom,
      poMarche: this.poMarche, poFinMs: this.poMarche ? now + (this.poFin - mono()) * 1000 : 0, poPhase: this.poPhase, poCycles: this.poCycles, poCat: this.poCat,
      chMarche: this.chMarche, chDebutMs: this.chMarche ? now - (mono() - this.chT0) * 1000 : 0, chCumul: this.chCumul,
    });
  }
  poConf() { const d = this.app.donnees; if (!d) return {travail: 25, pause: 5, longue: 15, cycles: 4}; return d.pomodoro = d.pomodoro || {travail: 25, pause: 5, longue: 15, cycles: 4}; }
  poDuree(ph) { return 60 * (this.poConf()[ph || this.poPhase] || 25); }
  chTemps() { return this.chCumul + (this.chMarche ? mono() - this.chT0 : 0); }
  chBasculer() { if (this.chMarche) { this.chCumul = this.chTemps(); this.chMarche = false; } else { this.chT0 = mono(); this.chMarche = true; } this.memoriser(); }
  chTour() { const t = this.chTemps(); if (t <= 0) return; const p = this.tours.length ? this.tours[this.tours.length - 1][0] : 0; this.tours.push([t, t - p]); }
  chReset() { this.chMarche = false; this.chCumul = 0; this.tours = []; this.memoriser(); }
  miTemps() { return this.miMarche ? Math.max(0, this.miFin - mono()) : this.miReste; }
  miRegler(sec, nom = "") { this.miTotal = this.miReste = Math.max(1, sec); this.miMarche = false; this.miNom = nom; this.memoriser(); }
  miBasculer() {
    if (this.miMarche) { this.miReste = this.miTemps(); this.miMarche = false; }
    else { if (this.miReste <= 0) this.miReste = this.miTotal; this.miFin = mono() + this.miReste; this.miMarche = true; }
    this.memoriser();
  }
  miAjouter(s) { if (this.miMarche) this.miFin += s; else this.miReste += s; this.miTotal = Math.max(this.miTotal, this.miTemps()); this.memoriser(); }
  miReset() { this.miMarche = false; this.miReste = this.miTotal; this.memoriser(); }
  poTemps() { return this.poMarche ? Math.max(0, this.poFin - mono()) : (this.poReste !== null ? this.poReste : this.poDuree()); }
  poBasculer() { if (this.poMarche) { this.poReste = this.poTemps(); this.poMarche = false; } else { this.poFin = mono() + this.poTemps(); this.poMarche = true; } this.memoriser(); }
  poReset() { this.poMarche = false; this.poReste = null; this.poPhase = "travail"; this.poCycles = 0; this.memoriser(); }
  poPasser(fini) {
    if (this.poPhase === "travail") {
      if (fini) this.noterEtude(this.poDuree("travail") / 60);
      this.poCycles++;
      this.poPhase = this.poCycles % (this.poConf().cycles || 4) === 0 ? "longue" : "pause";
    } else this.poPhase = "travail";
    this.poReste = null;
    if (this.poMarche) this.poFin = mono() + this.poDuree();
    this.memoriser();
  }
  noterEtude(min) {
    const d = this.app.donnees;
    if (!d) return;
    (d.etude_log = d.etude_log || []).push({date: iso(aujourdhui()), cat: this.poCat, min: Math.round(min)});
    this.app.sauver();
  }
  tic() {
    try {
      this.verifier();
      if (this.app.fenHorloge) this.app.fenHorloge.rafraichir();
    } catch (e) { /* ne jamais arrêter la boucle */ }
  }
  verifier() {
    if (this.miMarche && this.miTemps() <= 0) {
      this.miMarche = false; this.miReste = 0; this.memoriser();
      this.alerte("Minuterie terminée", this.miNom || `${fmtHms(this.miTotal)} écoulées`, "minuterie");
    }
    if (this.poMarche && this.poTemps() <= 0) {
      const fin = this.poPhase;
      this.poPasser(true);
      if (fin === "travail") this.alerte("Pomodoro terminé", `Bravo ! Pause de ${Math.floor(this.poDuree() / 60)} min.`, "pomodoro");
      else this.alerte("Fin de la pause", "On s'y remet : nouvelle période de travail.", "pomodoro");
    }
    const now = new Date();
    const cle = iso(now) + " " + now.toTimeString().slice(0, 5);
    if (cle !== this.derniereMinute) { this.derniereMinute = cle; this.verifierAlarmes(now); }
    for (const it of this.snoozes.slice()) if (mono() >= it[0]) { this.snoozes.splice(this.snoozes.indexOf(it), 1); this.alerte(it[1], it[2], "alarme"); }
  }
  verifierAlarmes(now) {
    const d = this.app.donnees;
    if (!d) return;
    const hhmm = now.toTimeString().slice(0, 5);
    let changer = false;
    for (const a of d.alarmes || []) {
      if (!a.actif || a.heure !== hhmm) continue;
      if (a.repeter === "semaine" && jourSemaine(now) >= 5) continue;
      this.alerte("Alarme  " + fmt(a.heure), a.label || "Alarme", "alarme");
      if ((a.repeter || "une") === "une") { a.actif = false; changer = true; }
    }
    if (changer) this.app.sauver();
    const avant = parseInt(this.app.reglages.rappel_cours || 0);
    if (avant) {
      const m = now.getHours() * 60 + now.getMinutes();
      for (const b of this.app.blocsDe(aujourdhui())) {
        const cat = CATS[b.cat];
        if (cat && cat[2] && toMin(b.debut) - avant === m) this.alerte(`Cours dans ${avant} min`, (b.titre || cat[1]) + (b.lieu ? "  ·  " + b.lieu : ""), "rappel");
      }
    }
  }
  resume() {
    const m = [];
    if (this.miMarche) m.push("Minuterie " + fmtHms(this.miTemps()));
    if (this.poMarche) m.push((this.poPhase === "travail" ? "Pomodoro " : "Pause ") + fmtHms(this.poTemps()));
    if (this.chMarche) m.push("Chrono " + fmtHms(this.chTemps()));
    return m.join("   ·   ");
  }
  alerte(titre, message, genre) {
    const actions = [];
    if (genre === "alarme") actions.push(["Rappel dans 5 min", () => this.snoozes.push([mono() + 300, titre, message])]);
    if (genre === "minuterie") actions.push(["+1 min", () => { this.miRegler(60, this.miNom); this.miBasculer(); }]);
    Notifs.montrer(titre, message, genre, actions);
  }
}

/* anneau de 60 points (secondes, minuterie, pomodoro) */
class Anneau {
  constructor(taille, point) {
    const ns = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(ns, "svg");
    this.svg.setAttribute("viewBox", `0 0 ${taille} ${taille}`);
    this.svg.setAttribute("class", "anneau");
    this.svg.style.width = taille + "px"; this.svg.style.height = taille + "px";
    const c = taille / 2, r = c - point;
    this.points = [];
    for (let i = 0; i < 60; i++) {
      const a = Math.PI / 2 - 2 * Math.PI * i / 60;
      const p = document.createElementNS(ns, "circle");
      p.setAttribute("cx", (c + r * Math.cos(a)).toFixed(2)); p.setAttribute("cy", (c - r * Math.sin(a)).toFixed(2));
      p.setAttribute("r", point / 2);
      this.svg.append(p); this.points.push(p);
    }
    this.point = point;
    this.zone = el("div.anneau-zone", {style: {width: taille + "px", height: taille + "px"}}, this.svg,
      el("div.anneau-txt", null, this.t0 = el("div.a-haut"), this.t1 = el("div.a-centre"), this.t2 = el("div.a-bas")));
    this.etat = null;
  }
  regler(n, on, actif = -1) {
    const k = n + on + actif;
    if (k === this.etat) return;
    this.etat = k;
    this.points.forEach((p, i) => {
      p.setAttribute("fill", i < n || i === actif ? on : T.SURFACE3);
      p.setAttribute("r", i === actif ? this.point / 2 + 2 : this.point / 2);
    });
  }
  textes(h, c, b, col) { this.t0.textContent = h; this.t1.textContent = c; this.t1.style.color = col || ""; this.t2.textContent = b; }
}

class FenetreHorloge extends Superpose {
  constructor(app, page = "horloge") {
    super({modal: false, classe: "horloge"});
    this.app = app; this.o = app.outils;
    this.onglets = {}; this.pages = {};
    const tabs = el("div.onglets", null);
    for (const [cle, titre] of [["horloge", "Horloge"], ["chrono", "Chronomètre"], ["minuterie", "Minuterie"], ["pomodoro", "Pomodoro"], ["alarmes", "Alarmes"]]) {
      const b = bouton(titre, () => this.montrerPage(cle), "tab");
      this.onglets[cle] = b; tabs.append(b);
      this.pages[cle] = el("div.page-horloge");
    }
    tabs.append(el("span.croix.grande", {texte: "✕", onclick: () => this.fermer()}));
    const corps = el("div.corps-horloge", null, Object.values(this.pages));
    this.carte.append(tabs, corps);
    this.pageHorloge(this.pages.horloge); this.pageChrono(this.pages.chrono); this.pageMinuterie(this.pages.minuterie);
    this.pagePomodoro(this.pages.pomodoro); this.pageAlarmes(this.pages.alarmes);
    this.montrerPage(page);
  }
  fermer() { super.fermer(); this.app.fenHorloge = null; }
  touche(e) {
    if (e.key === "Escape") { this.fermer(); return true; }
    if (e.key === " " && !this.app.saisieActive()) {
      ({chrono: () => this.o.chBasculer(), minuterie: () => this.o.miBasculer(), pomodoro: () => this.o.poBasculer()}[this.page] || (() => {}))();
      this.rafraichir(); return true;
    }
    return false;
  }
  montrerPage(cle) {
    this.page = cle;
    for (const [k, p] of Object.entries(this.pages)) { p.hidden = k !== cle; this.onglets[k].className = "btn " + (k === cle ? "tab_on" : "tab"); }
    if (cle === "pomodoro") this.statsEtude();
    this._hMin = null;
    this.rafraichir();
  }
  boutons(p, specs) {
    const bar = el("div.boutons-horloge");
    const out = specs.map(([t, fn, st]) => { const b = bouton(t, () => { fn(); this.rafraichir(); }, st); bar.append(b); return b; });
    p.append(bar);
    return out;
  }
  pageHorloge(p) {
    this.anH = new Anneau(Math.min(300, window.innerHeight * .36), 8);
    this.lblHInfo = el("div.h-info");
    this.frise = el("div.frise");
    p.append(this.anH.zone, this.lblHInfo, this.frise);
  }
  pageChrono(p) {
    this.lblCh = el("div.chrono-grand");
    this.lblChTour = el("div.mono.muted");
    p.append(this.lblCh, this.lblChTour);
    this.bCh = this.boutons(p, [["Démarrer", () => this.o.chBasculer(), "primary"], ["Tour", () => this.o.chTour(), "ghost"], ["Réinitialiser", () => this.o.chReset(), "ghost"]]);
    this.bCh[0].classList.add("large-fixe");
    p.append(el("div.petit.muted.centre", {texte: "Clavier : barre d'espace = démarrer / pause"}));
    this.listeTours = el("div.liste.tours");
    p.append(this.listeTours);
    this.nbTours = -1;
  }
  pageMinuterie(p) {
    this.anM = new Anneau(Math.min(250, window.innerHeight * .3), 7);
    const pr = el("div.presets-min");
    for (const m of [1, 5, 10, 15, 25, 30, 45, 60]) pr.append(petit(`${m} min`, () => { this.o.miRegler(m * 60, this.miNom.value.trim()); this.rafraichir(); }));
    this.miDuree = entree("", {placeholder: "20 ou 1:30", inputmode: "numeric", style: {width: "110px"}});
    this.miNom = entree("", {placeholder: "Nom (ex. : Lessive)", style: {width: "170px"}});
    this.lblMiAide = el("div.petit.muted.centre", {texte: "Durée (ex. : 20, 1:30, 1:00:00) puis un nom facultatif"});
    p.append(this.anM.zone, pr, el("div.ligne-min", null, this.miDuree, this.miNom, petit("Régler", () => this.miPerso())), this.lblMiAide);
    this.bMi = this.boutons(p, [["Démarrer", () => this.o.miBasculer(), "primary"], ["+1 min", () => this.o.miAjouter(60), "ghost"], ["Réinitialiser", () => this.o.miReset(), "ghost"]]);
    this.bMi[0].classList.add("large-fixe");
  }
  miPerso() {
    const t = this.miDuree.value.trim().replace("h", ":").replace("m", "");
    const parts = t ? t.split(":").map(Number) : [];
    if (!parts.length || parts.some(isNaN)) { this.lblMiAide.textContent = "Durée invalide. Exemples : 20 (minutes), 1:30, 1:00:00"; this.lblMiAide.style.color = "var(--danger)"; return; }
    const sec = parts.length === 1 ? parts[0] * 60 : parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
    this.o.miRegler(sec, this.miNom.value.trim());
    this.lblMiAide.textContent = "Durée (ex. : 20, 1:30, 1:00:00) puis un nom facultatif"; this.lblMiAide.style.color = "";
    this.rafraichir();
  }
  pagePomodoro(p) {
    this.anP = new Anneau(Math.min(230, window.innerHeight * .28), 7);
    const keys = COURS_KEYS.concat(["etude", "perso"].filter(k => CATS[k]));
    this.cbPo = liste(keys.map(k => [k, CATS[k][1]]), keys.includes(this.o.poCat) ? this.o.poCat : keys[0]);
    this.o.poCat = this.cbPo.value;
    this.cbPo.addEventListener("change", () => { this.o.poCat = this.cbPo.value; this.o.memoriser(); });
    const conf = el("div.conf-po");
    for (const [cle, lbl, vals] of [["travail", "Travail", [15, 20, 25, 30, 40, 45, 50, 60]], ["pause", "Pause", [3, 5, 10, 15]], ["longue", "Longue pause", [10, 15, 20, 30]]]) {
      const s = liste(vals.map(v => [String(v), String(v)]), String(this.o.poConf()[cle]));
      s.addEventListener("change", () => { this.o.poConf()[cle] = parseInt(s.value); if (!this.o.poMarche) this.o.poReste = null; this.app.sauver(); this.rafraichir(); });
      conf.append(el("span.muted.petit", {texte: lbl}), s);
    }
    p.append(this.anP.zone, el("div.ligne-min", null, el("span.muted", {texte: "J'étudie :"}), this.cbPo), conf);
    this.bPo = this.boutons(p, [["Démarrer", () => this.o.poBasculer(), "primary"], ["Passer", () => this.o.poPasser(), "ghost"], ["Réinitialiser", () => this.o.poReset(), "ghost"]]);
    this.bPo[0].classList.add("large-fixe");
    this.stats = el("div.stats-etude");
    p.append(this.stats);
  }
  statsEtude() {
    const fr = this.stats;
    fr.innerHTML = "";
    const l = lundiDe(aujourdhui()), tot = {};
    for (const x of this.app.donnees.etude_log || []) {
      const d = isoDate(x.date);
      if (d && d >= l && d <= ajouterJours(l, 6)) tot[x.cat] = (tot[x.cat] || 0) + (parseInt(x.min) || 0);
    }
    const total = Object.values(tot).reduce((a, b) => a + b, 0);
    fr.append(el("div.etiquette", {texte: `Étudié cette semaine avec le Pomodoro : ${fmtDuree(total)}`.toUpperCase()}));
    const mx = Math.max(1, ...Object.values(tot));
    for (const [k, m] of Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
      fr.append(el("div.ligne-stat", null, el("span.ls-nom", {texte: CATS[k] ? CATS[k][1] : "Autre"}),
        el("span.ls-barre", null, el("span", {style: {width: (m / mx * 100) + "%", background: couleur(k)}})), el("span.mono.muted", {texte: fmtDuree(m)})));
    }
  }
  pageAlarmes(p) {
    this.alH = el("input.saisie", {type: "time", value: "07:00", style: {width: "120px"}});
    this.alL = entree("", {placeholder: "Libellé (ex. : Réveil)", style: {width: "180px"}});
    this.repVals = [["une", "Une fois"], ["tous", "Tous les jours"], ["semaine", "Lun. au ven."]];
    this.alR = liste(this.repVals, "une");
    this.lblAl = el("div.petit.muted", {texte: "Heure, libellé, répétition. L'alarme sonne quand l'app est ouverte."});
    this.bRappel = {};
    const rl = el("div.rapides");
    for (const [v, t] of [[0, "Désactivé"], [5, "5 min"], [10, "10 min"], [15, "15 min"], [30, "30 min"]]) {
      const b = petit(t, () => this.rappel(v)); this.bRappel[v] = b; rl.append(b);
    }
    this.listeAl = el("div.liste");
    p.append(etiquette("Nouvelle alarme"), el("div.ligne-min.gauche", null, this.alH, this.alL, this.alR, petit("Ajouter", () => this.alAjouter(), "primary")), this.lblAl,
      etiquette("Rappel avant chaque cours"), rl, etiquette("Mes alarmes"), this.listeAl);
    this.rappel(parseInt(this.app.reglages.rappel_cours || 0), false);
    this.dessinerAlarmes();
  }
  rappel(v, sauver = true) {
    this.app.donnees.reglages.rappel_cours = v;
    for (const [k, b] of Object.entries(this.bRappel)) b.className = "btn petit " + (parseInt(k) === v ? "primary" : "ghost");
    if (sauver) this.app.sauver();
  }
  alAjouter() {
    const h = parseTime(this.alH.value);
    if (!h) { this.lblAl.textContent = "Heure invalide. Exemple : 07:30"; this.lblAl.style.color = "var(--danger)"; return; }
    (this.app.donnees.alarmes = this.app.donnees.alarmes || []).push({id: newId(), heure: h, label: this.alL.value.trim(), actif: true, repeter: this.alR.value});
    this.alL.value = "";
    this.lblAl.textContent = "Alarme ajoutée. Elle sonne quand l'app est ouverte (sur l'iPad ou sur le PC)."; this.lblAl.style.color = "";
    this.app.sauver(); this.dessinerAlarmes();
  }
  dessinerAlarmes() {
    const l = this.listeAl;
    l.innerHTML = "";
    const als = (this.app.donnees.alarmes || []).slice().sort((a, b) => (a.heure || "").localeCompare(b.heure || ""));
    if (!als.length) l.append(el("div.vide", {texte: "Aucune alarme."}));
    const noms = Object.fromEntries(this.repVals);
    for (const a of als) {
      l.append(el("div.rangee", null, caseACocher(!!a.actif, (v) => { a.actif = v; this.app.sauver(); this.dessinerAlarmes(); }),
        el("span.al-heure", {texte: fmt(a.heure), style: {color: a.actif ? "" : "var(--muted)"}}),
        el("div.corps", null, el("b", {texte: a.label || "Alarme"}), el("div.petit.muted", {texte: noms[a.repeter] || ""})),
        el("span.croix", {texte: "✕", onclick: () => { const L = this.app.donnees.alarmes; L.splice(L.indexOf(a), 1); this.app.sauver(); this.dessinerAlarmes(); }})));
    }
  }
  texteBouton(b, t) { if (b.textContent !== t) b.textContent = t; }
  rafraichir() {
    const o = this.o, now = new Date(), pg = this.page;
    if (pg === "horloge") {
      const s = now.getSeconds();
      this.anH.regler(s + 1, T.ACCENT, s);
      this.anH.textes(JOURS[jourSemaine(now)].toUpperCase(), now.toTimeString().slice(0, 5), ":" + String(s).padStart(2, "0"));
      if (this._hMin !== now.getMinutes()) {
        this._hMin = now.getMinutes();
        const sem = Math.floor(joursEntre(SESSION_DEBUT, lundiDe(aujourdhui())) / 7) + 1;
        let t = `${now.getDate()} ${MOIS[now.getMonth()]} ${now.getFullYear()}`;
        if (sem >= 1 && sem <= SESSION_SEMAINES) t += `   ·   semaine ${sem} de la session`;
        this.lblHInfo.textContent = t + "\n" + (this.app.lblEnsuite ? this.app.lblEnsuite.textContent.split("Prochain examen")[0] : "");
        this.frise.innerHTML = "";
        const a = T.H_DEBUT * 60, b = T.H_FIN * 60;
        const piste = el("div.piste");
        for (const bl of this.app.blocsDe(aujourdhui())) {
          const s0 = Math.max(a, toMin(bl.debut)), e0 = Math.min(b, toMin(bl.fin));
          if (e0 <= s0) continue;
          piste.append(el("span", {style: {left: ((s0 - a) / (b - a) * 100) + "%", width: ((e0 - s0) / (b - a) * 100) + "%", background: couleur(bl.cat)}}));
        }
        const m = now.getHours() * 60 + now.getMinutes();
        if (m >= a && m <= b) piste.append(el("i", {style: {left: ((m - a) / (b - a) * 100) + "%"}}));
        this.frise.append(piste, el("div.frise-lbl.mono.muted", null, el("span", {texte: `${T.H_DEBUT} h`}), el("span", {texte: "ta journée"}), el("span", {texte: `${T.H_FIN} h`})));
      }
    } else if (pg === "chrono") {
      const t = o.chTemps();
      this.lblCh.textContent = fmtHms(t, true);
      this.lblChTour.textContent = o.tours.length ? `Tour ${o.tours.length + 1}   ${fmtHms(t - o.tours[o.tours.length - 1][0], true)}` : " ";
      this.texteBouton(this.bCh[0], o.chMarche ? "Pause" : t ? "Reprendre" : "Démarrer");
      if (o.tours.length !== this.nbTours) {
        this.nbTours = o.tours.length;
        this.listeTours.innerHTML = "";
        const d = o.tours.map(x => x[1]), best = Math.min(...d), pire = Math.max(...d);
        for (let i = o.tours.length - 1; i >= 0; i--) {
          const [tot, du] = o.tours[i];
          const col = o.tours.length > 1 && du === best ? couleur("perso") : o.tours.length > 1 && du === pire ? "var(--danger)" : "";
          this.listeTours.append(el("div.rangee", null, el("span.mono.muted", {texte: `Tour ${i + 1}`}), el("b", {texte: fmtHms(du, true), style: {color: col}}), el("span.mono.muted.droite", {texte: fmtHms(tot, true)})));
        }
      }
    } else if (pg === "minuterie") {
      const t = o.miTemps(), frac = o.miTotal ? t / o.miTotal : 0;
      const col = o.miMarche && t <= 10 ? T.DANGER : T.ACCENT;
      this.anM.regler(Math.ceil(frac * 60), col);
      this.anM.textes(o.miNom ? o.miNom.toUpperCase() : "MINUTERIE", fmtHms(Math.ceil(t)), `sur ${fmtHms(o.miTotal)}`, o.miMarche && t <= 10 ? col : "");
      this.texteBouton(this.bMi[0], o.miMarche ? "Pause" : t > 0 && t < o.miTotal ? "Reprendre" : "Démarrer");
    } else if (pg === "pomodoro") {
      const t = o.poTemps(), tot = o.poDuree();
      const col = o.poPhase === "travail" ? T.ACCENT : couleur("perso");
      this.anP.regler(tot ? Math.ceil(t / tot * 60) : 0, col);
      const n = o.poConf().cycles || 4, f = o.poCycles % n;
      this.anP.textes({travail: "CONCENTRATION", pause: "PAUSE", longue: "LONGUE PAUSE"}[o.poPhase], fmtHms(Math.ceil(t)), "●".repeat(f) + "○".repeat(n - f) + `   ·   ${o.poCycles} terminé(s)`);
      this.texteBouton(this.bPo[0], o.poMarche ? "Pause" : t < tot ? "Reprendre" : "Démarrer");
      if (this._cyc !== o.poCycles) { this._cyc = o.poCycles; this.statsEtude(); }
    }
  }
}

Object.assign(App.prototype, {
  ouvrirHorloge(page) {
    if (!this.donnees) return;
    if (this.fenHorloge) { if (page) this.fenHorloge.montrerPage(page); return; }
    this.fenHorloge = new FenetreHorloge(this, page || "horloge");
    this.fenHorloge.montrer();
  },
});
