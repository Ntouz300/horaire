/* Synchronisation en temps réel avec Firebase Realtime Database (même algorithme que le PC). */
"use strict";

class Synchro {
  constructor(app) {
    this.app = app;
    const c = Stock.lire("horaire_synchro", null) || {};
    this.cfg = Object.assign({url: "", cle: "", appareil: "ipad-" + newId().slice(0, 6), base: {}, tl: {}, supprimees: []}, c);
    if (!Array.isArray(this.cfg.supprimees)) this.cfg.supprimees = [];
    if (!c.appareil) this.ecrireCfg();               // l'identifiant de l'appareil ne change plus (il porte le compteur de géos)
    this.distant = {};
    this.recuComplet = false;
    this.enVol = {};
    this.attente = [];
    this.etat = this.cfg.cle ? "connexion…" : "non configurée";
    this.detail = "";
    this.es = null;
    this.gen = 0;
    this.reessai = 0;
    this._timer = null;
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.verifierConnexion(true); });
    window.addEventListener("online", () => this.verifierConnexion(true));
    setInterval(() => this.tic(), 1000);
  }

  /* une note n'est retirée du serveur que si l'utilisateur l'a supprimée (jamais parce qu'elle manque ici par accident) */
  marquerSuppression(id) { if (id && !this.cfg.supprimees.includes(id)) { this.cfg.supprimees.push(id); this.ecrireCfg(); } }
  suppressionVoulue(nom) { return nom.startsWith("n_") && this.cfg.supprimees.includes(nom.slice(2)); }
  /* section (n_ ou np_) d'une note supprimée exprès, ici ou sur l'autre appareil (trace nx_<id>) */
  enterree(nom) {
    const id = nom.startsWith("n_") ? nom.slice(2) : nom.startsWith("np_") ? nom.split("_")[1] : null;
    return !!id && (noteEnterree(this.app.donnees, id) || !!this.distant["nx_" + id]);
  }

  configuree() { return !!(this.cfg.url && this.cfg.cle); }
  ecrireCfg() { Stock.ecrire("horaire_synchro", this.cfg); }
  urlBase() { return this.cfg.url.replace(/\/+$/, "") + "/h/" + this.cfg.cle + "/v"; }

  configurer(url, cle) {
    url = String(url || "").trim().replace(/\/+$/, "");
    cle = String(cle || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^https?:\/\/[a-z0-9.:-]+$/i.test(url)) return "Adresse de base invalide.";
    if (cle.length < 24) return "La clé doit contenir 26 caractères.";
    if (url !== this.cfg.url || cle !== this.cfg.cle) { this.cfg.base = {}; this.cfg.tl = {}; }
    this.cfg.url = url; this.cfg.cle = cle;
    this.ecrireCfg();
    this.demarrer();
    return null;
  }
  oublier() {
    this.fermer();
    this.cfg = {url: "", cle: "", appareil: this.cfg.appareil, base: {}, tl: {}, supprimees: []};
    this.ecrireCfg();
    this.etat = "non configurée";
    this.app.majEtatSynchro();
  }

  fermer() { this.gen++; if (this.es) { try { this.es.close(); } catch (e) { /* */ } } this.es = null; }

  demarrer() {
    if (!this.configuree()) return;
    this.fermer();
    const gen = ++this.gen;
    this.distant = {}; this.recuComplet = false;
    this.etat = "connexion…"; this.detail = "";
    this.app.majEtatSynchro();
    let es;
    try { es = new EventSource(this.urlBase() + ".json"); } catch (e) { this.etat = "erreur"; this.detail = "adresse invalide"; this.app.majEtatSynchro(); return; }
    this.es = es;
    this.dernierSignal = Date.now();
    const ok = () => gen === this.gen;
    es.onopen = () => { if (!ok()) return; this.dernierSignal = Date.now(); this.etat = "connectée"; this.detail = ""; this.app.majEtatSynchro(); };
    es.onerror = () => {
      if (!ok()) return;
      this.recuComplet = false;
      this.etat = navigator.onLine === false ? "hors ligne" : "reconnexion…";
      this.app.majEtatSynchro();
      if (es.readyState === 2) { setTimeout(() => { if (ok()) this.demarrer(); }, 4000); }
    };
    for (const ev of ["put", "patch"]) {
      es.addEventListener(ev, (m) => {
        if (!ok()) return;
        this.dernierSignal = Date.now();
        if (this.etat !== "connectée") { this.etat = "connectée"; this.detail = ""; this.app.majEtatSynchro(); }
        let msg; try { msg = JSON.parse(m.data); } catch (e) { return; }
        this.evenement(ev, msg);
      });
    }
    es.addEventListener("keep-alive", () => { if (ok()) this.dernierSignal = Date.now(); });
    for (const ev of ["cancel", "auth_revoked"]) {
      es.addEventListener(ev, () => {
        if (!ok()) return;
        this.etat = "erreur"; this.detail = "accès refusé par les règles Firebase";
        this.app.majEtatSynchro();
        this.fermer();
      });
    }
  }

  verifierConnexion(force) {
    if (!this.configuree()) return;
    const mort = !this.es || this.es.readyState === 2 || Date.now() - (this.dernierSignal || 0) > 75000;
    if (mort || (force && this.etat !== "connectée")) this.demarrer();
  }

  tic() {
    if (!this.configuree()) return;
    if (Date.now() - (this.dernierSignal || 0) > 75000 && this.etat !== "erreur") this.demarrer();
    if (this.reessai && Date.now() >= this.reessai && this.recuComplet) { this.reessai = 0; this.detail = ""; this.renvoyer(); }
    if (this.attente.length && this.app.peutAppliquerDistant()) this.appliquerAttente();
  }

  evenement(ev, msg) {
    const chemin = String(msg.path || "/").split("/").filter(Boolean);
    const data = msg.data === undefined ? null : msg.data;
    const touches = new Set();
    let instantane = false;
    if (!chemin.length) {
      if (ev === "put") {
        instantane = true;                // photo complète du serveur : une section absente n'est pas forcément une suppression
        const anciens = Object.keys(this.distant);
        this.distant = {};
        for (const [k, v] of Object.entries(data || {})) if (v && typeof v === "object") this.distant[k] = v;
        anciens.forEach(k => touches.add(k));
        Object.keys(this.distant).forEach(k => touches.add(k));
        if (!this.recuComplet) {
          this.recuComplet = true;
          if (this.app.donnees) Object.keys(sectionsDe(this.app.donnees)).forEach(k => touches.add(k));
          Object.keys(this.cfg.base).forEach(k => touches.add(k));
        }
      } else {
        for (const [k, v] of Object.entries(data || {})) {
          if (v === null) delete this.distant[k];
          else if (typeof v === "object") this.distant[k] = Object.assign(this.distant[k] || {}, v);
          touches.add(k);
        }
      }
    } else {
      const nom = chemin[0];
      touches.add(nom);
      if (chemin.length === 1) {
        if (ev === "put") { if (data === null) delete this.distant[nom]; else this.distant[nom] = data; }
        else this.distant[nom] = Object.assign(this.distant[nom] || {}, data || {});
      } else {
        const ent = this.distant[nom] = this.distant[nom] || {};
        if (ev === "put") ent[chemin[1]] = data;
        else if (ent[chemin[1]] && typeof ent[chemin[1]] === "object") Object.assign(ent[chemin[1]], data || {});
      }
    }
    if (!this.recuComplet) return;
    this.reconcilier(touches, instantane);
  }

  reconcilier(noms, instantane) {
    if (!this.app.donnees) {
      // premier lancement sur l'iPad : on prend tout ce qui vient du serveur
      if (!Object.keys(this.distant).length) { this.app.attenteDonnees(); return; }
      this.app.donnees = normaliser({});
      this.app.premierChargement = true;
    }
    const locales = sectionsDe(this.app.donnees);
    const aAppliquer = {}, aEnvoyer = [];
    const base = this.cfg.base, tl = this.cfg.tl;
    for (const nom of Array.from(noms).sort()) {
      const loc = nom in locales ? canon(locales[nom]) : null;
      const b = nom in base ? base[nom] : null;
      const rv = this.distant[nom];
      if (this.enterree(nom)) {
        // note supprimée exprès : jamais réappliquée ni renvoyée ; on la retire d'ici et ce qui en reste sur le serveur
        if (loc !== null) aAppliquer[nom] = null;
        if (rv) aEnvoyer.push(nom); else delete base[nom];
        continue;
      }
      if (nom.startsWith("np_") && loc === null && !this.distant["n_" + nom.split("_")[1]]) { delete base[nom]; continue; }   // page restée sans sa note : ignorée
      if (!rv || typeof rv.j !== "string") {
        if (nom.startsWith("np_") && loc !== null && this.distant["n_" + nom.split("_")[1]]) {
          aEnvoyer.push(nom);                // page disparue du serveur alors que sa note y est encore : on garde le contenu d'ici et on le renvoie
          continue;
        }
        if (b === null) { if (loc !== null && !this.app.premierChargement) aEnvoyer.push(nom); }
        else if (loc === b) {
          // absente du serveur : supprimée ailleurs… sauf si ce n'est qu'une photo du serveur et que c'est une note (on la garde et on la renvoie)
          if (instantane && sectionDeNote(nom) && nom !== "notes" && !this.suppressionVoulue(nom)) { if (loc !== null) aEnvoyer.push(nom); }
          else aAppliquer[nom] = null;
        }
        else if (loc !== null) aEnvoyer.push(nom);
        continue;
      }
      let valeur; try { valeur = JSON.parse(rv.j); } catch (e) { Stock.journal("section illisible " + nom, e); continue; }
      const r = canon(valeur);
      if (r === loc) { base[nom] = r; continue; }
      // une page vide ici (sans l'avoir voulu) ne remplace jamais une page remplie ailleurs : on récupère le contenu
      if (loc !== null && nom.startsWith("np_") && pageVideSansAccord(locales[nom]) && contenuPage(valeur) > 0) { aAppliquer[nom] = valeur; continue; }
      if (loc === b || loc === null || this.app.premierChargement) aAppliquer[nom] = valeur;
      else if (r === b) aEnvoyer.push(nom);
      else if ((rv.t || 0) >= (tl[nom] || 0)) aAppliquer[nom] = valeur;
      else aEnvoyer.push(nom);
    }
    if (this.app.premierChargement) this.app.premierChargement = false;
    // jamais de page blanche ni de cahier sans page venus de l'autre appareil par accident : on garde le contenu d'ici et on le renvoie
    for (const [nom, v] of Object.entries(aAppliquer)) {
      if (v !== null && videDistantSuspect(this.app.donnees, nom, v)) {
        Stock.journal("section distante vide refusée", nom);
        delete aAppliquer[nom]; aEnvoyer.push(nom);
      }
    }
    if (Object.keys(aAppliquer).length) {
      if (this.app.peutAppliquerDistant()) this.appliquer(aAppliquer);
      else this.attente.push(aAppliquer);
    }
    if (aEnvoyer.length) this.envoyer(aEnvoyer);
    this.ecrireCfg();
  }

  appliquer(sections) {
    const d = this.app.donnees;
    for (const [nom, v] of Object.entries(sections)) {
      poserSection(d, nom, v);
      if (v === null) delete this.cfg.base[nom]; else this.cfg.base[nom] = canon(v);
    }
    this.app.apresDistant(new Set(Object.keys(sections)));
  }

  appliquerAttente() {
    const tout = {};
    for (const s of this.attente) Object.assign(tout, s);
    this.attente = [];
    const locales = sectionsDe(this.app.donnees);
    const noms = new Set(Object.keys(tout));
    for (const n of Object.keys(locales)) if (canon(locales[n]) !== this.cfg.base[n]) noms.add(n);
    this.reconcilier(noms);
  }

  sale() {
    const locales = sectionsDe(this.app.donnees), base = this.cfg.base;
    const noms = new Set([...Object.keys(locales), ...Object.keys(base)]);
    return Array.from(noms).filter(n => (n in locales ? canon(locales[n]) : null) !== (n in base ? base[n] : null));
  }

  localChange() {
    if (!this.configuree() || !this.recuComplet || !this.app.donnees) return;
    const noms = this.sale();
    const now = Date.now();
    for (const n of noms) this.cfg.tl[n] = now;
    if (noms.length) { this.envoyer(noms); this.ecrireCfg(); }
  }
  renvoyer() { const n = this.sale(); if (n.length) this.envoyer(n); }

  envoyer(noms) {
    const locales = sectionsDe(this.app.donnees);
    const lot = {}, now = Date.now();
    for (const n of noms) {
      const ent = this.enterree(n);
      const j = ent ? null : n in locales ? canon(locales[n]) : null;                             // note supprimée exprès : seulement des suppressions
      if (j === null && n.startsWith("np_") && !ent) { delete this.cfg.base[n]; continue; }       // une page retirée l'est par n_<id> : jamais de suppression de contenu de page
      if (j === null && n.startsWith("n_") && !ent && !this.suppressionVoulue(n)) {
        this._ignorees = this._ignorees || new Set();
        if (!this._ignorees.has(n)) { this._ignorees.add(n); Stock.journal("suppression de note non voulue ignorée", n); }
        continue;
      }
      if (j !== null && n.startsWith("np_") && pageVideSansAccord(locales[n])) {                 // page blanche sans accord : ne jamais écraser un contenu du serveur
        const rv = this.distant[n];
        let plein = false;
        try { plein = !!(rv && typeof rv.j === "string" && contenuPage(JSON.parse(rv.j)) > 0); } catch (e) { /* */ }
        if (plein) { Stock.journal("envoi d'une page vide refusé", n); continue; }
      }
      if (n in this.enVol && this.enVol[n] === j) continue;
      this.enVol[n] = j;
      lot[n] = j === null ? null : {j, t: now, par: this.cfg.appareil};
    }
    if (!Object.keys(lot).length) return;
    const gen = this.gen;
    this.app.majEtatSynchro();
    fetch(this.urlBase() + ".json", {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify(lot)})
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(() => {
        for (const [n, v] of Object.entries(lot)) {
          const j = v ? v.j : null;
          if (this.enVol[n] === j) delete this.enVol[n];
          if (j === null) { delete this.cfg.base[n]; if (n.startsWith("n_")) this.cfg.supprimees = this.cfg.supprimees.filter(x => x !== n.slice(2)); } else this.cfg.base[n] = j;
        }
        this.ecrireCfg();
        this.app.majEtatSynchro();
      })
      .catch((e) => {
        Stock.journal("envoi vers le serveur", e);
        for (const n of Object.keys(lot)) delete this.enVol[n];
        if (gen === this.gen) { this.detail = "envoi en attente"; this.reessai = Date.now() + 5000; }
        this.app.majEtatSynchro();
      });
  }
}
