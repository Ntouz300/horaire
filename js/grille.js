/* Grille horaire : dessin, glisser-déposer (Apple Pencil, doigt, souris, trackpad), étirer, créer, copier / coller. */
"use strict";

const PAS = 15;

function disposer(blocs) {
  const items = blocs.map(b => ({b, s: toMin(b.debut), e: toMin(b.fin)})).sort((a, b) => a.s - b.s || b.e - a.e);
  const out = []; let groupe = [], fin = -1;
  const fermer = () => {
    const cols = [];
    for (const it of groupe) {
      let c = cols.findIndex(last => last <= it.s);
      if (c < 0) { c = cols.length; cols.push(0); }
      cols[c] = it.e; it.col = c;
    }
    for (const it of groupe) { it.ncol = cols.length; out.push(it); }
  };
  for (const it of items) {
    if (it.s >= fin && groupe.length) { fermer(); groupe = []; }
    groupe.push(it); fin = Math.max(fin, it.e);
  }
  if (groupe.length) fermer();
  return out;
}

function esc(t) { return String(t ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c])); }

Object.assign(App.prototype, {
  joursVus() { return this.vue === "jour" ? [this.jourVue] : [0, 1, 2, 3, 4, 5, 6]; },
  y(min) { return PAD + (min - T.H_DEBUT * 60) / 60 * this.hour; },
  minY(y, pas = PAS) { const m = T.H_DEBUT * 60 + (y - PAD) / this.hour * 60; return Math.round(m / pas) * pas; },
  jourX(x) { const j = this.joursVus(); const ci = Math.floor((x - LEFT) / this.colw); return j[Math.max(0, Math.min(ci, j.length - 1))]; },
  blocsVisibles() { return this.blocsVue().filter(b => !(this.cacherSaute && b.statut === "saute")); },

  ajusterHeures() {
    let hd = T.REG_HD, hf = T.REG_HF;
    for (const b of this.blocsVue()) {
      const a = toMin(b.debut), e = toMin(b.fin);
      if (e > a) { hd = Math.min(hd, Math.floor(a / 60)); hf = Math.max(hf, Math.ceil(e / 60)); }
    }
    T.H_DEBUT = Math.max(0, hd); T.H_FIN = Math.min(24, Math.max(hf, hd + 6));
  },

  creneauxLibres(jour, depuis) {
    const occ = this.blocsVue().filter(b => b.jour === jour && b.statut !== "saute").map(b => [toMin(b.debut), toMin(b.fin)]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let t = Math.max(T.H_DEBUT * 60, depuis || 0);
    const lib = [];
    for (const [a, b] of occ) { if (a > t) lib.push([t, Math.min(a, T.H_FIN * 60)]); t = Math.max(t, b); }
    if (t < T.H_FIN * 60) lib.push([t, T.H_FIN * 60]);
    return lib.filter(([a, b]) => b > a);
  },

  dessinerGrille() {
    if (!this.interfacePrete) return;
    this.ajusterHeures();
    const jours = this.joursVus(), n = jours.length;
    const TOP = Math.round(76 * T.TXT);
    const ch = Math.max(this.gScroll.clientHeight - TOP, 260);
    this.hour = Math.max(40, Math.min(n > 1 ? 76 : 90, (ch - 2 * PAD) / (T.H_FIN - T.H_DEBUT)));
    const cw = Math.max(this.gScroll.clientWidth, 400);
    const colw = this.colw = Math.max(n > 1 ? (window.innerWidth < 900 ? 92 : 104) : 260, (cw - LEFT - 4) / n);
    const totalW = LEFT + n * colw + 4, totalH = this.y(T.H_FIN * 60) + PAD;
    const a = aujourdhui();
    const dAuj = joursEntre(this.sem, a);
    const idxAuj = dAuj >= 0 && dAuj <= 6 ? dAuj : null;
    const colAuj = jours.indexOf(idxAuj);
    const blocs = this.blocsVisibles();
    const r = (x) => Math.round(x * T.RAD);

    // en-tête
    let h = "";
    for (let ci = 0; ci < n; ci++) {
      const i = jours[ci], d = ajouterJours(this.sem, i), x = LEFT + ci * colw, est = i === idxAuj;
      const mins = blocs.filter(b => b.jour === i && b.statut !== "saute").reduce((s, b) => s + Math.max(0, toMin(b.fin) - toMin(b.debut)), 0);
      const titre = n > 1 ? JOURS[i].toUpperCase() : `${JOURS[i].toUpperCase()} ${d.getDate()} ${MOIS[d.getMonth()].toUpperCase()}`;
      const sous = n > 1 ? dateCourte(d) : quand(d).replace(/^./, c => c.toUpperCase());
      const evs = this.echeancesDu(d);
      let pills = "";
      const montrer = n === 1 ? evs : evs.slice(0, 1);
      montrer.forEach((e0) => {
        const col = couleur(e0.cours);
        const reste = n > 1 && evs.length > 1 ? evs.length - 1 : 0;
        let t = (e0.quoi || "") + (reste ? `  +${reste}` : "");
        if (n === 1 && CATS[e0.cours] && e0.cours !== "perso") t = `${CATS[e0.cours][1]} · ${t}`;
        pills += `<span class="pill-ech" style="color:${col};background:${mix(col, T.TINT, est ? T.TODAY_BG : T.SURFACE)}">${esc(t)}</span>`;
      });
      h += `<div class="jour-tete${est ? " auj" : ""}" data-ci="${ci}" style="left:${x}px;width:${colw}px">
        <div class="jt-ligne"><span class="jt-nom">${esc(titre)}</span>${mins ? `<span class="jt-dur">${fmtDuree(mins)}${n === 1 ? "  occupées" : ""}</span>` : ""}</div>
        <div class="jt-date">${esc(sous)}</div>${pills ? `<div class="jt-pills">${pills}</div>` : ""}</div>`;
    }
    this.gEnt.style.width = totalW + "px";
    this.gEnt.style.height = TOP + "px";
    this.gEnt.innerHTML = `<div class="coin"></div>` + h;

    // corps
    let c = "";
    if (colAuj >= 0) c += `<div class="fond-auj" style="left:${LEFT + colAuj * colw + 3}px;width:${colw - 6}px;height:${totalH}px"></div>`;
    for (let hh = T.H_DEBUT; hh <= T.H_FIN; hh++) {
      const yy = this.y(hh * 60);
      c += `<div class="ligne-h" style="top:${yy}px;width:${totalW - LEFT - 4}px"></div><div class="lbl-h" style="top:${yy}px">${hh} h</div>`;
      if (hh < T.H_FIN) c += `<div class="ligne-demi" style="top:${yy + this.hour / 2}px;width:${totalW - LEFT - 4}px"></div>`;
    }
    if (n === 1) {
      for (const [a0, b0] of this.creneauxLibres(jours[0])) {
        if (b0 - a0 < 30) continue;
        const y0 = this.y(a0) + 3, y1 = this.y(b0) - 3;
        if (y1 - y0 < 14) continue;
        c += `<div class="libre" style="left:${LEFT + 8}px;width:${colw - 16}px;top:${y0}px;height:${y1 - y0}px">Libre  ·  ${fmt(hm(a0))} – ${fmt(hm(b0))}  ·  ${fmtDuree(b0 - a0)}   (touche pour ajouter)</div>`;
      }
    }
    for (let ci = 0; ci < n; ci++) {
      const i = jours[ci];
      for (const it of disposer(blocs.filter(b => b.jour === i))) {
        if (it.e <= T.H_DEBUT * 60 || it.s >= T.H_FIN * 60) continue;
        c += this.htmlBloc(it, ci, i === idxAuj ? T.TODAY_BG : T.SURFACE);
      }
    }
    if (colAuj >= 0) {
      const now = new Date(), m = now.getHours() * 60 + now.getMinutes();
      if (m > T.H_DEBUT * 60 && m < T.H_FIN * 60) {
        const x0 = LEFT + colAuj * colw, yy = this.y(m);
        c += `<div class="maintenant" style="left:${x0}px;width:${colw - 4}px;top:${yy}px">${n === 1 ? `<span>${now.toTimeString().slice(0, 5)}</span>` : ""}</div>`;
      }
    }
    this.gCorps.style.width = totalW + "px";
    this.gCorps.style.height = totalH + "px";
    this.gCorps.innerHTML = c;
    void r;
  },

  htmlBloc(it, ci, bg) {
    const b = it.b;
    const col = couleur(CATS[b.cat] ? b.cat : "perso");
    const w = (this.colw - 8) / it.ncol;
    const x0 = LEFT + ci * this.colw + 4 + it.col * w, x1 = x0 + w - 4;
    const y0 = this.y(Math.max(it.s, T.H_DEBUT * 60)) + 1;
    const y1 = Math.max(y0 + 22, this.y(Math.min(it.e, T.H_FIN * 60)) - 1);
    const st = b.statut || "";
    let fill, line, txt, cls = "";
    if (st === "saute") { fill = mix(col, .94, T.SURFACE); line = T.RULE; txt = T.MUTED; cls = " saute"; }
    else if (st === "possible") { fill = mix(col, Math.min(.95, T.TINT + .06), T.SURFACE); line = col; txt = T.INK; cls = " possible"; }
    else { fill = mix(col, T.TINT, T.SURFACE); line = mix(col, .45, T.SURFACE); txt = T.INK; }
    if (b.id === this.selId) cls += " choisi";
    const etiq = st === "possible" ? "POSSIBLE" : st === "saute" ? "JE SAUTE" : (TYPE_TAG[b.type] || "");
    let lignes = `<div class="b-heure" style="color:${st === "saute" ? T.MUTED : col}">${fmt(b.debut)}–${fmt(b.fin)}${etiq ? "  " + etiq : ""}</div>`;
    lignes += `<div class="b-titre" style="color:${txt}">${esc(b.titre || "Sans titre")}</div>`;
    if (b.lieu) lignes += `<div class="b-lieu">${esc(b.lieu)}</div>`;
    if (b.note && this.reglages.notes_blocs !== false) {
      const note = this.vue !== "jour" ? b.note.replace(/\n/g, " ") : b.note;
      const lim = this.vue !== "jour" ? 90 : 600;
      lignes += `<div class="b-note">${esc(note.slice(0, lim) + (note.length > lim ? "…" : ""))}</div>`;
    }
    const sticker = T.REG_THEME === "minecraft" && y1 - y0 >= 48 && x1 - x0 >= 90
      ? `<img class="b-sticker" alt="" src="${spriteURL(iconeCat(b.cat || "perso"), 2)}">` : "";
    return `<div class="bloc${cls}" data-id="${esc(b.id)}" style="left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px;background:${fill};border-color:${line};--bg:${bg}">
      ${b.fait ? `<span class="b-fait" style="color:${col}">✓</span>` : ""}${lignes}${sticker}<div class="poignee"></div></div>`;
  },

  /* ---------- interactions */
  installerGrille() {
    const g = this.gCorps, sc = this.gScroll;
    g.addEventListener("pointerdown", (e) => this.appui(e));
    window.addEventListener("pointermove", (e) => this.mouvement(e), {passive: false});
    window.addEventListener("pointerup", (e) => this.relache(e));
    window.addEventListener("pointercancel", (e) => this.annulerGlisse(e));
    // Apple Pencil : jamais de défilement quand le crayon touche la grille (le crayon déplace les blocs)
    sc.addEventListener("touchstart", (e) => {
      if (Array.from(e.changedTouches).some(t => t.touchType === "stylus") && g.contains(e.target)) e.preventDefault();
    }, {passive: false});
    // doigt : après un appui long, le glissement déplace le bloc au lieu de défiler
    sc.addEventListener("touchmove", (e) => { if (this.drag && (this.drag.arme || this.drag.immediat)) e.preventDefault(); }, {passive: false});
    sc.addEventListener("contextmenu", (e) => e.preventDefault());
    this.gEnt.addEventListener("click", (e) => {
      const t = e.target.closest(".jour-tete");
      if (!t) return;
      const ci = parseInt(t.dataset.ci);
      if (e.target.closest(".pill-ech")) { this.montrer("ech"); document.body.classList.add("carnet-ouvert"); return; }
      if (this.vue === "semaine") this.changerVue("jour", this.joursVus()[ci]);
    });
  },

  pointGrille(e) {
    const r = this.gCorps.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  },

  appui(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (this.drag) return;
    const [x, y] = this.pointGrille(e);
    const blocEl = e.target.closest(".bloc");
    const immediat = e.pointerType !== "touch";
    const d = {id: e.pointerId, type: e.pointerType, px: e.clientX, py: e.clientY, moved: false, immediat, arme: false, cx: e.clientX, cy: e.clientY};
    if (blocEl) {
      const b = this.blocParId(blocEl.dataset.id);
      if (!b) return;
      const h = blocEl.offsetHeight, ry = y - blocEl.offsetTop;
      const zone = e.pointerType === "touch" ? 18 : 12;
      d.mode = (e.target.classList.contains("poignee") || ry >= h - zone) && h > 34 ? "etirer" : "deplacer";
      Object.assign(d, {b, el: blocEl, s0: toMin(b.debut), e0: toMin(b.fin), jour0: b.jour || 0, dm: this.minY(y, 1) - toMin(b.debut), offBas: this.y(toMin(b.fin)) - y});
    } else {
      if (x <= LEFT) return;
      const jour = this.jourX(x);
      d.mode = "creer";
      d.jour0 = jour;
      d.m0 = Math.max(T.H_DEBUT * 60, Math.min(Math.floor(this.minY(y, 1) / 30) * 30, T.H_FIN * 60 - 30));
      d.clic = [x, y];
    }
    this.drag = d;
    if (!immediat) {
      d.timer = setTimeout(() => {
        if (this.drag !== d || d.moved) return;
        d.arme = true;
        if (d.el) d.el.classList.add("souleve");
        else this.fantome(d.jour0, d.m0, d.m0 + 30, "Nouveau bloc");
        if (navigator.vibrate) try { navigator.vibrate(15); } catch (er) { /* */ }
      }, 380);
    } else if (e.pointerType === "pen" || e.pointerType === "mouse") {
      try { this.gCorps.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    }
  },

  mouvement(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    d.cx = e.clientX; d.cy = e.clientY;
    const dist = Math.hypot(e.clientX - d.px, e.clientY - d.py);
    if (!d.immediat && !d.arme) {
      if (dist > 10) { clearTimeout(d.timer); this.drag = null; }   // c'est un défilement
      return;
    }
    if (!d.moved) {
      if (dist < (d.arme ? 3 : 5)) return;
      d.moved = true;
      document.body.classList.add("glisse-en-cours", "glisse-" + d.mode);
      if (d.el) d.el.classList.add("en-glisse");
      this.autoDefilement();
    }
    e.preventDefault();
    this.majCible(e.altKey || e.ctrlKey || e.metaKey);
  },

  majCible(copie) {
    const d = this.drag;
    if (!d) return;
    const r = this.gCorps.getBoundingClientRect();
    const x = d.cx - r.left, y = d.cy - r.top;
    const jour = this.jourX(x);
    if (d.mode === "deplacer") {
      const dur = d.e0 - d.s0;
      let s = this.minY(y, 1) - d.dm;
      s = Math.round(s / PAS) * PAS;
      s = Math.max(T.H_DEBUT * 60, Math.min(s, T.H_FIN * 60 - dur));
      d.cible = [jour, s, s + dur];
      d.copie = copie;
      this.fantome(jour, s, s + dur, copie ? "Copie" : (d.b.titre || ""));
    } else if (d.mode === "etirer") {
      const fin = Math.max(d.s0 + PAS, Math.min(this.minY(y + d.offBas), T.H_FIN * 60));
      d.cible = [d.jour0, d.s0, fin];
      this.fantome(d.jour0, d.s0, fin, d.b.titre || "");
    } else {
      const m = this.minY(y);
      let [a, b] = [d.m0, Math.max(T.H_DEBUT * 60, Math.min(m, T.H_FIN * 60))].sort((p, q) => p - q);
      if (b - a < 30) b = a + 30;
      b = Math.min(b, T.H_FIN * 60);
      d.cible = [d.jour0, a, b];
      this.fantome(d.jour0, a, b, "Nouveau bloc");
    }
  },

  autoDefilement() {
    const pas = () => {
      const d = this.drag;
      if (!d || !d.moved) return;
      const r = this.gScroll.getBoundingClientRect();
      let dx = 0, dy = 0;
      const m = 48;
      if (d.cy < r.top + m + 70) dy = -Math.ceil((r.top + m + 70 - d.cy) / 6);
      else if (d.cy > r.bottom - m) dy = Math.ceil((d.cy - (r.bottom - m)) / 6);
      if (d.cx < r.left + m + LEFT) dx = -Math.ceil((r.left + m + LEFT - d.cx) / 6);
      else if (d.cx > r.right - m) dx = Math.ceil((d.cx - (r.right - m)) / 6);
      if (dx || dy) { this.gScroll.scrollBy(dx, dy); this.majCible(d.copie); }
      requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  },

  fantome(jour, s, e, titre) {
    let f = this.gCorps.querySelector(".fantome");
    if (!f) { f = el("div.fantome"); this.gCorps.append(f); }
    const ci = Math.max(0, this.joursVus().indexOf(jour));
    const x0 = LEFT + ci * this.colw + 4;
    Object.assign(f.style, {left: x0 + "px", width: (this.colw - 12) + "px", top: this.y(s) + "px", height: Math.max(16, this.y(e) - this.y(s)) + "px"});
    f.textContent = `${fmt(hm(s))} – ${fmt(hm(e))}` + (titre ? `   ${titre}` : "");
  },

  finGlisse() {
    document.body.classList.remove("glisse-en-cours", "glisse-deplacer", "glisse-etirer", "glisse-creer");
    const f = this.gCorps.querySelector(".fantome");
    if (f) f.remove();
    const s = this.gCorps.querySelector(".souleve, .en-glisse");
    if (s) s.classList.remove("souleve", "en-glisse");
  },

  annulerGlisse(e) {
    const d = this.drag;
    if (!d || (e && e.pointerId !== d.id)) return;
    clearTimeout(d.timer);
    // le système a pris le geste (défilement) : on abandonne, sauf si le bloc était déjà soulevé
    if (d.arme && !d.moved && d.el) { this.drag = null; this.finGlisse(); this.choisir(d.b.id); return; }
    this.drag = null;
    this.finGlisse();
  },

  relache(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    clearTimeout(d.timer);
    this.drag = null;
    this.finGlisse();
    if (!d.moved) {
      if (d.mode === "creer") {
        const m = Math.max(T.H_DEBUT * 60, Math.min(d.m0, T.H_FIN * 60 - 60));
        this.dernierClicVide = {jour: d.jour0, m};
        if (this.pressePapier) { if (this.selId) { this.selId = null; this.dessinerGrille(); this.majSelection(); } this.menuVide(e, d.jour0, m); return; }
        if (this.selId) { this.selId = null; this.dessinerGrille(); this.majSelection(); if (!d.arme) return; }
        new Editeur(this, null, {jour: d.jour0, debut: hm(m), fin: hm(Math.min(m + 90, T.H_FIN * 60))}).montrer();
      } else if (this.selId === d.b.id && !d.arme) {
        new Editeur(this, d.b).montrer();
      } else {
        this.choisir(d.b.id);
      }
      return;
    }
    const cible = d.cible;
    if (!cible) return;
    const [jour, s, f] = cible;
    if (d.mode === "creer") { new Editeur(this, null, {jour, debut: hm(s), fin: hm(f)}).montrer(); return; }
    if (jour === d.jour0 && s === d.s0 && f === d.e0) { this.choisir(d.b.id); return; }
    this.snapBlocs();
    const blocs = this.blocsEdit();
    const cb = blocs.find(x => x.id === d.b.id);
    if (!cb) return;
    if (d.mode === "deplacer" && (d.copie || e.altKey || e.ctrlKey || e.metaKey)) {
      const neuf = Object.assign(clone(cb), {id: newId(), jour, debut: hm(s), fin: hm(f), fait: false});
      blocs.push(neuf); this.selId = neuf.id;
    } else {
      Object.assign(cb, {jour, debut: hm(s), fin: hm(f)}); this.selId = cb.id;
    }
    this.sauver();
    this.dessinerTout();
  },

  choisir(id) {
    this.selId = id;
    this.gCorps.querySelectorAll(".bloc.choisi").forEach(x => x.classList.remove("choisi"));
    const b = this.gCorps.querySelector(`.bloc[data-id="${CSS.escape(id)}"]`);
    if (b) b.classList.add("choisi");
    this.majSelection();
  },

  menuVide(e, jour, m) {
    const old = document.querySelector(".menu-vide");
    if (old) old.remove();
    const src = this.pressePapier;
    const menu = el("div.menu-vide", null,
      el("div.mv-titre", {texte: `${JOURS[jour]} · ${fmt(hm(m))}`}),
      petit(`Coller « ${tronquer(src.titre, 22)} » ici`, () => { menu.remove(); this.collerBloc({jour, m}); }, "primary"),
      petit("Nouveau bloc ici", () => { menu.remove(); new Editeur(this, null, {jour, debut: hm(m), fin: hm(Math.min(m + 90, T.H_FIN * 60))}).montrer(); }));
    document.body.append(menu);
    const w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = Math.min(window.innerWidth - w - 10, Math.max(10, e.clientX - w / 2)) + "px";
    menu.style.top = Math.min(window.innerHeight - h - 10, e.clientY + 12) + "px";
    setTimeout(() => {
      const fermer = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); window.removeEventListener("pointerdown", fermer, true); } };
      window.addEventListener("pointerdown", fermer, true);
    }, 0);
  },

  /* barre d'actions du bloc choisi (remplace le clic droit / les raccourcis du PC) */
  majSelection() {
    const bar = this.barreSel;
    if (!bar) return;
    bar.innerHTML = "";
    const b = this.selId ? this.blocParId(this.selId) : null;
    if (!b && this.selId) this.selId = null;
    if (b) {
      bar.append(pastille(couleur(b.cat), 9), el("span.bs-titre", {texte: `${b.titre || "Sans titre"}  ·  ${JOURS[b.jour].slice(0, 3).toLowerCase()}. ${fmt(b.debut)}–${fmt(b.fin)}`}),
        petit("Modifier", () => new Editeur(this, b).montrer(), "primary"),
        petit("Copier", () => this.copierBloc()), petit("Couper", () => this.copierBloc(true)),
        petit("Dupliquer", () => this.dupliquerBloc()),
        this.pressePapier ? petit("Coller après", () => this.collerBloc()) : null,
        petit("Supprimer", () => this.supprimerBloc(), "danger"),
        this.undo.length ? petit("Annuler", () => this.annuler()) : null,
        el("span.bs-x", {texte: "✕", onclick: () => { this.selId = null; this.dessinerGrille(); this.majSelection(); }}));
    } else if (this.pressePapier || this.undo.length) {
      if (this.pressePapier) bar.append(el("span.bs-info.muted", {texte: `Presse-papiers : « ${tronquer(this.pressePapier.titre, 28)} » — touche une case vide pour coller`}));
      if (this.undo.length) bar.append(petit("Annuler", () => this.annuler()));
      if (this.pressePapier) bar.append(el("span.bs-x", {texte: "✕", onclick: () => { this.pressePapier = null; this.majSelection(); }}));
    }
    bar.classList.toggle("visible", !!bar.childNodes.length);
  },

  /* ---------- annuler, presse-papiers */
  snapBlocs() {
    const k = iso(this.sem), s = this.donnees.semaines[k];
    this.undo.push([k, s && s.blocs ? clone(s.blocs) : null]);
    if (this.undo.length > 40) this.undo.splice(0, this.undo.length - 40);
  },
  annuler() {
    if (!this.undo.length) { Notifs.bulle("Rien à annuler"); return; }
    const [k, prev] = this.undo.pop();
    const s = this.donnees.semaines[k] = this.donnees.semaines[k] || {};
    if (prev === null) { delete s.blocs; if (!Object.keys(s).length) delete this.donnees.semaines[k]; }
    else s.blocs = prev;
    this.sem = isoDate(k) || this.sem;
    this.selId = null;
    this.sauver(); this.dessinerTout();
    Notifs.bulle("Action annulée");
  },
  copierBloc(couper) {
    const b = this.selId && this.blocParId(this.selId);
    if (!b) { Notifs.bulle("Touche d'abord un bloc"); return; }
    this.pressePapier = clone(b);
    Notifs.bulle(couper ? "Coupé" : `« ${b.titre || ""} » copié`);
    if (couper) this.supprimerBloc(); else this.majSelection();
  },
  collerBloc(pos) {
    const src = this.pressePapier;
    if (!src) { Notifs.bulle("Rien à coller : copie d'abord un bloc"); return; }
    const dur = Math.max(PAS, toMin(src.fin) - toMin(src.debut));
    let jour, s;
    const b = this.selId && this.blocParId(this.selId);
    if (pos) { jour = pos.jour; s = pos.m; }
    else if (b) { jour = b.jour || 0; s = toMin(b.fin); }
    else if (this.dernierClicVide) { jour = this.dernierClicVide.jour; s = this.dernierClicVide.m; }
    else { jour = this.vue === "jour" ? this.jourVue : src.jour || 0; s = toMin(src.debut); }
    s = Math.max(T.H_DEBUT * 60, Math.min(s, T.H_FIN * 60 - dur));
    this.snapBlocs();
    const neuf = Object.assign(clone(src), {id: newId(), jour, debut: hm(s), fin: hm(s + dur), fait: false});
    this.blocsEdit().push(neuf);
    this.selId = neuf.id;
    this.sauver(); this.dessinerTout();
    Notifs.bulle("Bloc collé");
  },
  dupliquerBloc() {
    const b = this.selId && this.blocParId(this.selId);
    if (!b) { Notifs.bulle("Touche d'abord un bloc"); return; }
    this.pressePapier = clone(b);
    this.snapBlocs();
    const neuf = Object.assign(clone(b), {id: newId(), jour: Math.min((b.jour || 0) + 1, 6), fait: false});
    this.blocsEdit().push(neuf);
    this.selId = neuf.id;
    this.sauver(); this.dessinerTout();
    Notifs.bulle("Bloc dupliqué (jour suivant)");
  },
  supprimerBloc() {
    const b = this.selId && this.blocParId(this.selId);
    if (!b) return;
    this.snapBlocs();
    const blocs = this.blocsEdit();
    const i = blocs.findIndex(x => x.id === b.id);
    if (i >= 0) blocs.splice(i, 1);
    this.selId = null;
    this.sauver(); this.dessinerTout();
    Notifs.bulle("Bloc supprimé (Annuler pour revenir)");
  },
  nouveauBloc() {
    const n = joursEntre(this.sem, aujourdhui());
    new Editeur(this, null, {jour: n >= 0 && n <= 6 ? n : 0, debut: "09:00", fin: "10:30"}).montrer();
  },
});
