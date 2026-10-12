/* Petits outils d'interface : création d'éléments, boutons, fenêtres superposées, dialogues, notifications. */
"use strict";

function el(tag, attrs, ...enfants) {
  const [nom, ...classes] = tag.split(".");
  const e = document.createElement(nom || "div");
  if (classes.length) e.className = classes.join(" ");
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "style" && typeof v === "object") { for (const [a, b] of Object.entries(v)) { if (a.startsWith("--")) e.style.setProperty(a, b); else e.style[a] = b; } }
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
      else if (k === "html") e.innerHTML = v;
      else if (k === "texte") e.textContent = v;
      else if (k in e && k !== "list" && typeof v !== "string") e[k] = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const c of enfants.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return e;
}

/* ---------- iPhone : interface compacte (menu en bas, vue journée, fenêtres en plein écran) */
/* IPHONE : le téléphone lui-même (les cahiers manuscrits n'y sont pas proposés) ; ecranCompact() : petit écran, y compris un iPad en Slide Over */
const IPHONE = /iPhone|iPod/.test(navigator.userAgent) || (/Android/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent));
function ecranCompact() { return IPHONE || window.innerWidth < 600 || Math.min(window.innerWidth, window.innerHeight) < 500; }
function majCompact() {
  const c = ecranCompact();
  document.body.classList.toggle("tel", c);
  document.body.classList.toggle("iphone", IPHONE);
  return c;
}
function messageCahierIphone() {
  return informer("Cahier manuscrit", "Les cahiers manuscrits s'ouvrent et se créent sur l'iPad (Apple Pencil) ou sur le PC. Sur l'iPhone, tu peux utiliser les notes texte.");
}

/* bouton arrondi : styles ghost, primary, danger, tab, tab_on */
function bouton(texte, action, style = "ghost", extra = {}) {
  const b = el("button.btn." + style, Object.assign({type: "button"}, extra), texte);
  b.addEventListener("click", (e) => { e.stopPropagation(); if (action) action(e); });
  return b;
}
function petit(texte, action, style = "ghost") { const b = bouton(texte, action, style); b.classList.add("petit"); return b; }

function caseACocher(valeur, onChange, libelle) {
  const c = el("span.case" + (valeur ? ".on" : ""), {role: "checkbox", "aria-checked": String(!!valeur), tabindex: 0}, el("span.coche", {texte: "✓"}));
  const basculer = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const v = !c.classList.contains("on");
    c.classList.toggle("on", v);
    c.setAttribute("aria-checked", String(v));
    if (onChange) onChange(v);
  };
  c.addEventListener("click", basculer);
  c.valeur = () => c.classList.contains("on");
  if (!libelle) return c;
  const l = el("label.case-texte", null, c, el("span", {texte: libelle}));
  l.addEventListener("click", (e) => { if (e.target !== c && !c.contains(e.target)) basculer(e); });
  l.valeur = c.valeur;
  return l;
}

function pastille(col, taille = 10) {
  return el("span.pastille", {style: {background: col, width: taille + "px", height: taille + "px"}});
}

function etiquette(texte) { return el("div.etiquette", {texte: texte.toUpperCase()}); }

/* champ de formulaire avec titre */
function champ(titre, controle, classe = "") {
  return el("label.champ" + (classe ? "." + classe : ""), null, etiquette(titre), controle);
}
function entree(valeur = "", attrs = {}) { return el("input.saisie", Object.assign({type: "text", value: valeur ?? "", autocomplete: "off"}, attrs)); }
function zoneTexte(valeur = "", hauteur = 110) {
  const t = el("textarea.saisie", {rows: 4, style: {height: hauteur + "px"}});
  t.value = valeur || "";
  return t;
}
function liste(options, choix) {
  const s = el("select.saisie");
  for (const [v, t] of options) {
    const o = el("option", {value: v, texte: t});
    if (v === choix) o.selected = true;
    s.append(o);
  }
  return s;
}

/* ---------- fenêtres superposées (dans la page, comme sur le PC) */
const Pile = [];

class Superpose {
  constructor(opts = {}) {
    this.voile = el("div.voile" + (opts.transparent ? ".leger" : ""));
    this.carte = el("div.carte-modale" + (opts.classe ? "." + opts.classe : ""));
    this.corps = this.carte;
    this.voile.append(this.carte);
    this.voile.addEventListener("pointerdown", (e) => { if (e.target === this.voile) this._clicVoile = true; });
    this.voile.addEventListener("click", (e) => { if (e.target === this.voile && this._clicVoile) this.clicVoile(); this._clicVoile = false; });
    this.estModal = opts.modal !== false;
    Pile.push(this);
  }
  montrer() {
    document.body.append(this.voile);
    requestAnimationFrame(() => this.voile.classList.add("visible"));
    const f = this.carte.querySelector("[autofocus]");
    if (f && !("ontouchstart" in window)) setTimeout(() => f.focus(), 60);
    return this;
  }
  clicVoile() { this.fermer(); }
  fermer() {
    const i = Pile.indexOf(this);
    if (i >= 0) Pile.splice(i, 1);
    this.voile.classList.remove("visible");
    this.voile.classList.add("sortie");
    setTimeout(() => this.voile.remove(), 160);
    if (this.apres) this.apres();
    if (window.app) setTimeout(() => window.app.sync && window.app.sync.tic(), 200);
  }
  touche(e) {
    if (e.key === "Escape") { this.fermer(); return true; }
    return false;
  }
}

class Modal extends Superpose {
  constructor(titre, sousTitre, opts = {}) {
    super(opts);
    this.carte.append(el("h2.titre-modal", {texte: titre}));
    if (sousTitre) this.carte.append(el("div.sous-titre", {texte: sousTitre}));
    this.err = el("div.erreur");
  }
  barre(gauche = [], droite = []) {
    this.carte.append(this.err, el("div.barre-actions", null, el("div.g", null, gauche), el("div.d", null, droite)));
  }
  touche(e) {
    if (e.key === "Escape") { this.fermer(); return true; }
    if (e.key === "Enter" && this.valider && e.target.tagName !== "TEXTAREA" && !e.isComposing) { this.valider(); return true; }
    return false;
  }
  erreur(t) { this.err.textContent = t || ""; }
}

function dialogue(titre, message, boutons) {
  return new Promise((res) => {
    const m = new Modal(titre, null, {classe: "dialogue"});
    m.carte.append(el("p.message", {texte: message}));
    const d = boutons.map(([t, v, s]) => bouton(t, () => { res(v); m.fermer(); }, s));   // res(v) AVANT fermer() (qui répond null)
    m.barre([], d);
    m.clicVoile = () => { m.fermer(); res(null); };
    const vieux = m.fermer.bind(m);
    m.fermer = () => { vieux(); res(null); };
    m.montrer();
  });
}
function informer(titre, message) { return dialogue(titre, message, [["OK", true, "primary"]]); }
/* petite fenêtre de saisie d'un texte (nom d'un modèle, etc.) ; répond null si annulée */
function demanderTexte(titre, etiq, valeur) {
  return new Promise((res) => {
    const m = new Modal(titre, null, {classe: "dialogue"});
    const e = entree(valeur || "", {autofocus: true});
    m.carte.append(champ(etiq, e));
    let fait = false;
    const finir = (v) => { if (!fait) { fait = true; res(v); } };
    m.valider = () => { const v = e.value.trim(); if (!v) { m.erreur("Donne un nom."); return; } finir(v); m.fermer(); };
    m.barre([], [bouton("Annuler", () => { finir(null); m.fermer(); }, "ghost"), bouton("OK", () => m.valider(), "primary")]);
    const vieux = m.fermer.bind(m);
    m.fermer = () => { vieux(); finir(null); };
    m.montrer();
  });
}

/* ---------- notifications (en bas à droite, avec son) */
const Son = {
  ctx: null,
  debloquer() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === "suspended") this.ctx.resume();
    } catch (e) { /* */ }
  },
  bip(genre) {
    if (!this.ctx || !(window.app && window.app.reglages.son !== false)) return;
    const t0 = this.ctx.currentTime;
    const notes = genre === "rappel" ? [660, 880] : [880, 1100, 880];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * .18);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + i * .18 + .02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * .18 + .16);
      o.connect(g).connect(this.ctx.destination);
      o.start(t0 + i * .18); o.stop(t0 + i * .18 + .17);
    });
  },
};
["pointerdown", "keydown"].forEach(ev => window.addEventListener(ev, () => Son.debloquer(), {capture: true, passive: true}));

const Notifs = {
  zone: null,
  montrer(titre, message, genre, actions = []) {
    if (!this.zone) { this.zone = el("div.zone-notifs"); document.body.append(this.zone); }
    const carte = el("div.notif", null, el("div.notif-titre", {texte: titre}), el("div.notif-msg", {texte: message}));
    const bar = el("div.notif-actions");
    let sons = 0, job = null;
    const fermer = () => { clearTimeout(job); carte.classList.add("sortie"); setTimeout(() => carte.remove(), 200); };
    for (const [t, fn] of actions) bar.append(petit(t, () => { fn(); fermer(); }));
    bar.append(petit("OK", fermer, "primary"));
    carte.append(bar);
    this.zone.append(carte);
    const sonner = () => {
      if (!carte.isConnected || sons >= 8) return;
      sons++; Son.bip(genre);
      if (genre === "alarme" || genre === "minuterie") job = setTimeout(sonner, 2600);
    };
    sonner();
    setTimeout(fermer, 90000);
    if (navigator.vibrate) try { navigator.vibrate(200); } catch (e) { /* */ }
  },
  bulle(texte) {
    const b = el("div.bulle", {texte});
    document.body.append(b);
    requestAnimationFrame(() => b.classList.add("visible"));
    setTimeout(() => { b.classList.remove("visible"); setTimeout(() => b.remove(), 300); }, 1800);
  },
};

function tronquer(t, n) { t = String(t || ""); return t.length > n ? t.slice(0, n) + "…" : t; }
