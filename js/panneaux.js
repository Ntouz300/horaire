/* Carnet (tâches, échéances, notes) et panneau de la vue Journée. */
"use strict";

Object.assign(App.prototype, {
  /* ---------- tâches (propres à chaque semaine) */
  pageTaches(p) {
    this.inTache = entree("", {placeholder: "Nouvelle tâche…", enterkeyhint: "done"});
    this.inTache.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); this.ajouterTache(); } });
    this.lblTaches = el("span.muted.petit");
    this.listeTaches = el("div.liste");
    p.append(el("div.ligne-ajout", null, this.inTache, bouton("Ajouter", () => this.ajouterTache())),
      el("div.ligne-info", null, this.lblTaches, petit("Reporter ›", () => this.reporterTaches())), this.listeTaches);
  },
  ajouterTache() {
    const t = this.inTache.value.trim();
    if (!t) return;
    this.tachesEdit().push({id: newId(), texte: t, fait: false, cours: "", date: "", note: ""});
    this.inTache.value = "";
    this.sauver(); this.dessinerTaches();
  },
  async reporterTaches() {
    if (this.idxSem() >= SESSION_SEMAINES - 1) { informer("Reporter les tâches", "C'est la dernière semaine de la session."); return; }
    const aFaire = this.tachesVue().filter(t => !t.fait);
    if (!aFaire.length) { informer("Reporter les tâches", "Aucune tâche à reporter cette semaine."); return; }
    const k = iso(ajouterJours(this.sem, 7));
    const s = this.ses.semaines[k] = this.ses.semaines[k] || {};
    s.taches = (s.taches || []).concat(aFaire);
    const lst = this.tachesEdit();
    const gard = lst.filter(t => t.fait);
    lst.length = 0; lst.push(...gard);
    this.sauver(); this.dessinerTaches();
  },
  dessinerTaches() {
    const lst = this.listeTaches;
    lst.innerHTML = "";
    const taches = this.tachesVue();
    const rest = taches.filter(t => !t.fait).length;
    this.lblTaches.textContent = taches.length ? `${rest} à faire sur ${taches.length}` : "Tâches de la semaine du " + plageSemaine(this.sem);
    if (!taches.length) lst.append(el("div.vide", {texte: "Rien pour l'instant. Ajoute une tâche ci-dessus,\nelle restera dans cette semaine.\nTouche une tâche pour y ajouter une note."}));
    for (const t of taches) {
      const fait = !!t.fait;
      const d = isoDate(t.date);
      const m = [];
      if (CATS[t.cours] && t.cours !== "perso") m.push(CATS[t.cours][1]);
      if (d) m.push(`pour le ${dateCourte(d)} (${quand(d)})`);
      const retard = d && d < aujourdhui() && !fait;
      const corps = el("div.corps", {onclick: () => new TacheEditeur(this, t).montrer()},
        el("div" + (fait ? ".barre.muted" : ""), {texte: t.texte || ""}),
        m.length ? el("div.petit", {texte: m.join("  ·  "), style: {color: retard ? "var(--danger)" : CATS[t.cours] ? couleur(t.cours) : "var(--muted)"}}) : null,
        t.note ? el("div.petit.muted", {texte: "✎ " + tronquer(t.note.split(/\s+/).join(" "), 90)}) : null);
      lst.append(el("div.rangee", null,
        caseACocher(fait, (v) => { t.fait = v; this.sauver(); this.dessinerTaches(); }), corps,
        el("span.croix", {texte: "✕", onclick: () => { const l = this.tachesEdit(); const i = l.indexOf(t); if (i >= 0) l.splice(i, 1); this.sauver(); this.dessinerTaches(); }})));
    }
  },

  /* ---------- échéances */
  pageEcheances(p) {
    this.filtresEch = {};
    const seg = el("div.segments");
    for (const [cle, titre] of [["avenir", "À venir"], ["passees", "Terminées"], ["toutes", "Toutes"], ["resultats", "Résultats"]]) {
      const b = petit(titre, () => { this.fEch = cle; this.dessinerEcheances(); }, cle === this.fEch ? "tab_on" : "tab");
      this.filtresEch[cle] = b; seg.append(b);
    }
    this.lblProchaine = el("div.petit.prochaine");
    this.listeEch = el("div.liste");
    p.append(bouton("+  Nouvelle échéance", () => new EcheanceEditeur(this).montrer(), "primary"), seg, this.lblProchaine, this.listeEch);
  },
  dessinerEcheances() {
    if (!this.listeEch) return;
    for (const [k, b] of Object.entries(this.filtresEch)) b.className = "btn petit " + (k === this.fEch ? "tab_on" : "tab");
    const lst = this.listeEch;
    lst.innerHTML = "";
    const a = aujourdhui(), toutes = this.ses.echeances;
    const cle = (e) => (e.date || "9999-99-99") + (e.heure || "");
    const aVenir = toutes.filter(e => !e.fait).sort((x, y) => cle(x).localeCompare(cle(y)));
    const faites = toutes.filter(e => e.fait).sort((x, y) => cle(y).localeCompare(cle(x)));
    const proch = aVenir.find(e => isoDate(e.date) && isoDate(e.date) >= a);
    this.lblProchaine.textContent = proch ? `Prochaine : ${proch.quoi || ""}  ·  ${quand(isoDate(proch.date))}` : "Aucune échéance à venir.";
    this.lblProchaine.style.color = proch ? "var(--accent)" : "var(--muted)";
    if (this.fEch === "resultats") { this.dessinerResultats(lst); return; }
    const groupes = [];
    if (this.fEch === "passees") groupes.push(["Terminées", faites]);
    else {
      const j = (e) => joursEntre(a, isoDate(e.date));
      groupes.push(["En retard", aVenir.filter(e => isoDate(e.date) && j(e) < 0)], ["Dans les 7 prochains jours", aVenir.filter(e => isoDate(e.date) && j(e) >= 0 && j(e) <= 7)],
        ["Plus tard", aVenir.filter(e => isoDate(e.date) && j(e) > 7)], ["Sans date", aVenir.filter(e => !isoDate(e.date))]);
      if (this.fEch === "toutes") groupes.push(["Terminées", faites]);
    }
    let vide = true;
    for (const [titre, items] of groupes) {
      if (!items.length) continue;
      vide = false;
      lst.append(el("div.etiquette.groupe", {texte: titre.toUpperCase(), style: {color: titre === "En retard" ? "var(--danger)" : ""}}));
      for (const e of items) lst.append(this.ligneEch(e));
    }
    if (vide) lst.append(el("div.vide", {texte: this.fEch === "passees" ? "Aucune échéance terminée." : "Ajoute tes examens, travaux et quiz pour voir\nle compte à rebours et les retrouver dans la grille."}));
  },
  dessinerResultats(p) {
    p.append(el("div.petit.muted", {texte: "Entre ta note (en %) dans une échéance pour voir ta moyenne pondérée par cours.", style: {margin: "4px 0 8px"}}));
    for (const k of COURS_KEYS) {
      const evals = this.ses.echeances.filter(e => e.cours === k && num(e.poids));
      if (!evals.length) continue;
      const col = couleur(k);
      const total = evals.reduce((s, e) => s + num(e.poids), 0);
      const notees = evals.filter(e => num(e.resultat) !== null);
      const pn = notees.reduce((s, e) => s + num(e.poids), 0);
      const acq = notees.reduce((s, e) => s + num(e.poids) * num(e.resultat) / 100, 0);
      const base = Math.max(total, 100);
      const moy = pn ? (acq / pn * 100).toFixed(1).replace(".", ",") + " %" : "—";
      const barre = el("div.barre-res", null,
        pn ? el("span", {style: {width: (pn / base * 100) + "%", background: mix(col, .55, T.SURFACE2)}}) : null,
        acq ? el("span", {style: {width: (acq / base * 100) + "%", background: col}}) : null);
      const c = el("div.carte-res", null,
        el("div.res-haut", null, pastille(col, 9), el("b", {texte: CATS[k][1]}), el("span.res-moy", {texte: moy, style: {color: pn ? col : "var(--muted)"}})),
        barre,
        el("div.petit.muted", {texte: pn ? `Évalué : ${fmtG(pn)} % sur ${fmtG(total)} %   ·   Points acquis : ${acq.toFixed(1)}`.replace(/\./g, ",") : `${evals.length} évaluations (${fmtG(total)} %) · aucune note entrée`}));
      if (pn && total > pn) {
        const besoin = (60 - acq) / (total - pn) * 100;
        if (besoin > 0 && besoin <= 100) c.append(el("div.petit.muted", {texte: `Pour finir à 60 % : environ ${Math.round(besoin)} % sur le reste`}));
      }
      p.append(c);
    }
  },
  ligneEch(e) {
    const a = aujourdhui();
    const col = couleur(CATS[e.cours] ? e.cours : "perso");
    const fait = !!e.fait, d = isoDate(e.date);
    const n = d ? joursEntre(a, d) : null;
    const urgent = n !== null && !fait && n <= 7;
    const typeNom = (TYPES_ECH.find(t => t[0] === e.type) || [0, ""])[1];
    const coursNom = CATS[e.cours] && e.cours !== "perso" ? CATS[e.cours][1] : "";
    const txt = d ? `${JOURS[jourSemaine(d)].slice(0, 3).toLowerCase()}. ${dateCourte(d)}` + (e.heure ? ` à ${fmt(e.heure)}` : "") + `  ·  ${quand(d)}` : "date à préciser";
    const corps = el("div.corps", {onclick: () => new EcheanceEditeur(this, e).montrer()},
      el("b" + (fait ? ".barre.muted" : ""), {texte: e.quoi || ""}),
      el("div.petit", null, coursNom ? el("span", {texte: coursNom, style: {color: fait ? "var(--muted)" : col}}) : null,
        typeNom ? el("span.muted", {texte: (coursNom ? " · " : "") + typeNom}) : null),
      el("div.mono.petit", {texte: txt, style: {color: urgent ? "var(--danger)" : "var(--muted)"}}),
      e.note ? el("div.petit.muted", {texte: "✎ " + tronquer(e.note.split(/\s+/).join(" "), 70)}) : null);
    return el("div.rangee", null,
      caseACocher(fait, (v) => { e.fait = v; this.sauver(); this.dessinerTout(); }), corps,
      e.poids ? el("span.mono.muted.poids", {texte: `${e.poids} %`}) : null);
  },

  /* ---------- notes */
  pageNotes(p) {
    this.inNote = entree(this.qNote, {placeholder: "Rechercher…", type: "search"});
    this.inNote.addEventListener("input", () => { this.qNote = this.inNote.value; clearTimeout(this._qj); this._qj = setTimeout(() => this.dessinerNotes(), 180); });
    this.segNotes = el("div.segments.enroule");
    this.listeNotes = el("div.liste");
    p.append(el("div.ligne-ajout", null, this.inNote, bouton("+  Note", () => this.ouvrirNotes("texte"), "primary"),
      IPHONE ? null : bouton("✍", () => this.ouvrirNotes("cahier"), "ghost", {title: "Cahier manuscrit (Apple Pencil)"})), this.segNotes, this.listeNotes);
  },
  ouvrirNotes(x) {
    document.body.classList.remove("carnet-ouvert");
    this.aller("notes");
    const pn = this.ecrans.notes;
    if (x === "texte" || x === "cahier") pn.creer({type: x, titre: x === "cahier" ? "Cahier sans titre" : "", fond: "ligne", papier: "auto", couverture: ""});
    else pn.ouvrir(x);
  },
  dessinerNotes() {
    if (!this.listeNotes) return;
    if (this.fNote && !CATS[this.fNote]) this.fNote = "";
    this.segNotes.innerHTML = "";
    for (const [cle, titre] of [["", "Tout"], ...COURS_KEYS.map(k => [k, CATS[k][1]]), ["perso", "Autre"]]) {
      this.segNotes.append(petit(tronquer(titre, 14), () => { this.fNote = cle; this.dessinerNotes(); }, cle === this.fNote ? "tab_on" : "tab"));
    }
    const lst = this.listeNotes;
    lst.innerHTML = "";
    const q = this.qNote.trim().toLowerCase();
    const notes = this.donnees.notes.filter(n => (!this.fNote || n.cours === this.fNote) && (!q || (n.titre || "").toLowerCase().includes(q) || (n.texte || "").toLowerCase().includes(q)));
    const tri = (x, y) => (y.maj || "").localeCompare(x.maj || "");
    const ord = notes.filter(n => n.epingle).sort(tri).concat(notes.filter(n => !n.epingle).sort(tri));
    if (!ord.length) lst.append(el("div.vide", {texte: (q || this.fNote) ? "Aucune note ne correspond." : "Aucune note pour l'instant.\nTouche « + Note » pour écrire un résumé de cours,\nou « ✍ » pour écrire à l'Apple Pencil."}));
    for (const n of ord) {
      const col = CATS[n.cours] ? couleur(n.cours) : "var(--muted)";
      const d = isoDate((n.maj || "").slice(0, 10));
      const sous = [CATS[n.cours] ? CATS[n.cours][1] : "", d ? dateCourte(d) : ""].filter(Boolean).join(" · ");
      const ext = (n.texte || "").split(/\s+/).join(" ").trim();
      const manus = n.type === "cahier";
      const row = el("div.rangee.note", {onclick: () => this.ouvrirNotes(n.id)},
        pastille(col, 9),
        el("div.corps", null, el("b", {texte: (n.epingle ? "★ " : "") + (manus ? "✍ " : "") + (n.titre || "")}),
          sous ? el("div.petit", {texte: sous, style: {color: col}}) : null,
          ext ? el("div.petit.muted", {texte: tronquer(ext, 110)}) : null,
          manus && n.pages[0] && n.pages[0].traits.length ? canvasPage(n.pages[0], n.papier, 120) : null));
      lst.append(row);
    }
  },

  /* ---------- vue journée : panneau de droite */
  dessinerPanneauJour() {
    const p = this.pj;
    document.body.classList.toggle("vue-jour", this.vue === "jour");
    if (this.vue !== "jour") { p.innerHTML = ""; return; }
    p.innerHTML = "";
    const d = this.dateVue(), a = aujourdhui(), jour = this.jourVue;
    const blocs = this.blocsVue().filter(b => b.jour === jour && b.statut !== "saute").sort((x, y) => toMin(x.debut) - toMin(y.debut));
    const titre = (t, col) => p.append(el("div.etiquette.groupe", {texte: t.toUpperCase(), style: {color: col || ""}}));
    p.append(el("h3", {texte: `${JOURS[jourSemaine(d)]} ${d.getDate()} ${MOIS[d.getMonth()]}`}),
      el("div.petit.muted", {texte: quand(d).replace(/^./, c => c.toUpperCase()) + ((this.ses.critiques || []).includes(iso(this.sem)) ? "  ·  période critique" : "")}));
    const tot = {cours: 0, etude: 0, travail: 0, autre: 0};
    for (const b of blocs) {
      const m = Math.max(0, toMin(b.fin) - toMin(b.debut)), cat = CATS[b.cat];
      tot[cat && cat[2] ? "cours" : ["etude", "travail"].includes(b.cat) ? b.cat : "autre"] += m;
    }
    let libres = this.creneauxLibres(jour);
    const lt = libres.reduce((s, [x, y]) => s + y - x, 0);
    const g = el("div.bilan");
    for (const [lbl, val, col] of [["COURS", tot.cours, COURS_KEYS.length ? couleur(COURS_KEYS[0]) : T.ACCENT], ["ÉTUDE", tot.etude, couleur("etude")], ["TRAVAIL", tot.travail, couleur("travail")], ["LIBRE", lt, T.MUTED]]) {
      g.append(el("div", null, el("div.chip-val", {texte: fmtDuree(val)}), el("div.chip-lbl", null, pastille(col, 7), lbl)));
    }
    p.append(g);
    if (memeJour(d, a)) {
      const now = new Date(), m = now.getHours() * 60 + now.getMinutes();
      const ec = blocs.find(b => toMin(b.debut) <= m && m < toMin(b.fin)), pr = blocs.find(b => toMin(b.debut) > m);
      if (ec || pr) {
        titre("En ce moment");
        if (ec) p.append(this.ligneBloc(ec, `encore ${fmtDuree(toMin(ec.fin) - m)}`));
        if (pr) p.append(this.ligneBloc(pr, `dans ${fmtDuree(toMin(pr.debut) - m)}`));
      }
      libres = this.creneauxLibres(jour, m);
    }
    titre("Programme");
    if (!blocs.length) p.append(el("div.petit.muted", {texte: "Rien de prévu : journée libre !"}));
    for (const b of blocs) p.append(this.ligneBloc(b));
    const vrais = libres.filter(([x, y]) => y - x >= 30);
    titre("Créneaux libres");
    if (!vrais.length) p.append(el("div.petit.muted", {texte: "Aucun créneau de 30 min ou plus."}));
    for (const [x, y] of vrais) {
      p.append(el("div.rangee.libre-ligne", {onclick: () => new Editeur(this, null, {jour, debut: hm(x), fin: hm(Math.min(y, x + 120)), cat: "etude"}).montrer()},
        el("span", {texte: `${fmt(hm(x))} – ${fmt(hm(y))}`}), el("span.mono.muted", {texte: fmtDuree(y - x)})));
    }
    const evs = this.echeancesDu(d);
    const proch = this.ses.echeances.filter(e => !e.fait && isoDate(e.date) && joursEntre(d, isoDate(e.date)) > 0 && joursEntre(d, isoDate(e.date)) <= 7).sort((x, y) => x.date.localeCompare(y.date));
    titre("Échéances du jour", evs.length ? "var(--danger)" : null);
    if (!evs.length) p.append(el("div.petit.muted", {texte: "Aucune."}));
    for (const e of evs) p.append(this.ligneEch(e));
    if (proch.length) { titre("Dans les 7 jours suivants"); for (const e of proch.slice(0, 6)) p.append(this.ligneEch(e)); }
    const taches = this.tachesVue().filter(t => !t.fait);
    if (taches.length) { titre("Tâches de la semaine"); for (const t of taches.slice(0, 8)) p.append(el("div.petit", {texte: "•  " + (t.texte || "")})); }
  },
  ligneBloc(b, extra) {
    const col = couleur(CATS[b.cat] ? b.cat : "perso");
    let txt = (b.titre || "Sans titre") + (b.lieu ? `  ·  ${b.lieu}` : "");
    if (b.statut === "possible") txt += "  (optionnel)";
    return el("div.rangee.ligne-bloc", {onclick: () => new Editeur(this, b).montrer()},
      el("span.barre-col", {style: {background: col}}),
      el("div.corps", null, el("div.mono.petit", {texte: `${fmt(b.debut)} – ${fmt(b.fin)}` + (extra ? `  ·  ${extra}` : ""), style: {color: col}}), el("b", {texte: txt})));
  },
});
