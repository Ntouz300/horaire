/* Horaire Automne 2026 — version iPad : constantes, thèmes, outils, données.
   Même modèle de données que l'application PC (horaire_automne_2026.json, version 4). */
"use strict";

const APP_TITLE = "Horaire Automne 2026";
const SESSION_DEBUT = new Date(2026, 7, 31);   // lundi de la semaine 1
const SESSION_SEMAINES = 17;
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const _CATS_SOMBRE = {info: "#3cc4c9", graph: "#6ea3ff", meca: "#f0a541", ethique: "#ff7a8d", travail: "#b496ff", etude: "#8ea3c0", perso: "#5fcf84"};
const _CATS_CLAIR = {info: "#0b8a90", graph: "#2f64d8", meca: "#b36a00", ethique: "#d03a52", travail: "#7a52cc", etude: "#5f7390", perso: "#1f8a4a"};
const _CATS_NEON = {info: "#2de2e6", graph: "#7b8cff", meca: "#ffb547", ethique: "#ff3f8e", travail: "#c86bff", etude: "#9a8fc7", perso: "#3dffa8"};
const _CATS_CAFE = {info: "#6cc4b4", graph: "#8fb0e8", meca: "#e3a35c", ethique: "#e8798a", travail: "#c49be0", etude: "#a8968a", perso: "#9ccc7a"};
const _CATS_TERM = {info: "#39ff7a", graph: "#4fd2ff", meca: "#ffc23d", ethique: "#ff6b8b", travail: "#c99cff", etude: "#79a88a", perso: "#d4ff5f"};
const _CATS_PAPIER = {info: "#1f7f7a", graph: "#3a5fb0", meca: "#b8741a", ethique: "#b8344f", travail: "#7650a8", etude: "#7a6a58", perso: "#4f8a3a"};

const _CATS_ARC = {info: "#00a3b8", graph: "#2f5bff", meca: "#f06a00", ethique: "#e0145e", travail: "#9b2fe0", etude: "#13a04a", perso: "#c99600"};
const _CATS_OBS = {info: "#4fc3b5", graph: "#7f9cf5", meca: "#e0a458", ethique: "#e8738a", travail: "#b794f6", etude: "#9aa3b2", perso: "#78c38a"};
const _CATS_MC = {info: "#4aedd9", graph: "#5b8cff", meca: "#f5c82e", ethique: "#ff4a3a", travail: "#b070ff", etude: "#c9c9c9", perso: "#2ee66b"};

const THEMES = {
  nuit: {nom: "Nuit", sombre: true, BG: "#0a1019", SURFACE: "#121b29", SURFACE2: "#1a2638", SURFACE3: "#243349", INK: "#e8eef8", MUTED: "#8997ae", RULE: "#222f44", GRID: "#1a2536", TODAY_BG: "#172338", ACCENT: "#5b9bff", DANGER: "#ff7085", TINT: .78, SCROLL: "#31425e", LINE2: "#3b4c68", cats: _CATS_SOMBRE},
  charbon: {nom: "Charbon", sombre: true, BG: "#0e0f11", SURFACE: "#18191c", SURFACE2: "#222427", SURFACE3: "#2e3135", INK: "#ebecee", MUTED: "#979ca5", RULE: "#2a2c30", GRID: "#212225", TODAY_BG: "#20242b", ACCENT: "#6ea3ff", DANGER: "#ff7a85", TINT: .78, SCROLL: "#3a3d44", LINE2: "#454951", cats: _CATS_SOMBRE},
  minuit: {nom: "Minuit", sombre: true, BG: "#0c0a16", SURFACE: "#151225", SURFACE2: "#1e1a33", SURFACE3: "#2a2447", INK: "#ece9f8", MUTED: "#968fb5", RULE: "#272142", GRID: "#1c1830", TODAY_BG: "#1f1a38", ACCENT: "#a78bfa", DANGER: "#ff7a95", TINT: .78, SCROLL: "#352d58", LINE2: "#3d3563", cats: _CATS_SOMBRE},
  foret: {nom: "Forêt", sombre: true, BG: "#09110f", SURFACE: "#101b18", SURFACE2: "#182823", SURFACE3: "#21372f", INK: "#e5f1ed", MUTED: "#86a39a", RULE: "#1d3029", GRID: "#15241f", TODAY_BG: "#14271f", ACCENT: "#4fd1a1", DANGER: "#ff7b86", TINT: .78, SCROLL: "#2a453b", LINE2: "#335247", cats: _CATS_SOMBRE},
  clair: {nom: "Clair", sombre: false, BG: "#e9eef5", SURFACE: "#ffffff", SURFACE2: "#f0f3f8", SURFACE3: "#dfe6f0", INK: "#16233b", MUTED: "#5d6c84", RULE: "#d6deea", GRID: "#e6ebf3", TODAY_BG: "#e8f0fd", ACCENT: "#2563d6", DANGER: "#d6334b", TINT: .85, SCROLL: "#c3cfdf", LINE2: "#b9c5d8", cats: _CATS_CLAIR},
  neon: {nom: "Néon", sombre: true, BG: "#0b0414", SURFACE: "#140922", SURFACE2: "#1f1036", SURFACE3: "#2d184d", INK: "#f8ecff", MUTED: "#a990c8", RULE: "#2b1747", GRID: "#1c0e31", TODAY_BG: "#25103f", ACCENT: "#ff3fa4", DANGER: "#ff5470", TINT: .72, SCROLL: "#3d2166", LINE2: "#4a2a75", cats: _CATS_NEON},
  cafe: {nom: "Espresso", sombre: true, BG: "#120d0a", SURFACE: "#1c1511", SURFACE2: "#271d17", SURFACE3: "#35281f", INK: "#f3e9df", MUTED: "#ab9a89", RULE: "#2f241c", GRID: "#241b15", TODAY_BG: "#2a1f17", ACCENT: "#e3a35c", DANGER: "#ff7b6b", TINT: .78, SCROLL: "#45362a", LINE2: "#52412f", cats: _CATS_CAFE},
  terminal: {nom: "Terminal", sombre: true, mono: true, BG: "#020503", SURFACE: "#060e08", SURFACE2: "#0b170e", SURFACE3: "#122615", INK: "#c8ffd8", MUTED: "#5f9a70", RULE: "#11301a", GRID: "#0a1c0f", TODAY_BG: "#0c2213", ACCENT: "#39ff7a", DANGER: "#ff5f5f", TINT: .8, SCROLL: "#1b3d24", LINE2: "#1f4a2a", cats: _CATS_TERM},
  papier: {nom: "Papier", sombre: false, BG: "#ebe3d5", SURFACE: "#fbf7ef", SURFACE2: "#f3ecdf", SURFACE3: "#e7dccb", INK: "#2b2118", MUTED: "#7b6b5a", RULE: "#e0d5c3", GRID: "#ece3d4", TODAY_BG: "#f6ead3", ACCENT: "#c2552d", DANGER: "#c0392b", TINT: .84, SCROLL: "#d6c8b3", LINE2: "#cdbda5", cats: _CATS_PAPIER},
  arcenciel: {nom: "Arc-en-ciel", sombre: false, BG: "#efe6ff", SURFACE: "#ffffff", SURFACE2: "#fdf1ff", SURFACE3: "#ffe3f3", INK: "#2a1050", MUTED: "#7a5ea8", RULE: "#e6d4ff", GRID: "#f1e6ff", TODAY_BG: "#fff2a8", ACCENT: "#ff2d95", DANGER: "#e0102f", TINT: .5, SCROLL: "#d9b8ff", LINE2: "#c9a8f5", cats: _CATS_ARC},
  obsidienne: {nom: "Obsidienne", sombre: true, BG: "#050506", SURFACE: "#0e0e11", SURFACE2: "#16161b", SURFACE3: "#202027", INK: "#f1ede4", MUTED: "#8f8b82", RULE: "#1c1c22", GRID: "#121216", TODAY_BG: "#18160f", ACCENT: "#d6b36a", DANGER: "#ff7a7a", TINT: .8, SCROLL: "#2b2b33", LINE2: "#34343d", cats: _CATS_OBS},
  minecraft: {nom: "Minecraft", sombre: true, mono: true, bloc: true, BG: "#1b140e", SURFACE: "#2a1f15", SURFACE2: "#37291b", SURFACE3: "#4a3824", INK: "#f4ecd8", MUTED: "#b3a283", RULE: "#4a3824", GRID: "#241b12", TODAY_BG: "#26391a", ACCENT: "#5fbf3a", DANGER: "#ff5555", TINT: .72, SCROLL: "#5a4630", LINE2: "#5d472e", cats: _CATS_MC},
};
const PALETTE_AUTO = ["#f5d061", "#ff9f6b", "#6be0c0", "#e58cff", "#7fd3ff", "#ff8fb1", "#b6e36b", "#ffc46b", "#8fa8ff", "#f27474"];
const FORMES = [["Carré", 0.0], ["Léger", 0.55], ["Arrondi", 1.0], ["Très arrondi", 1.6]];
const TAILLES = [["Petit", 90], ["Normal", 100], ["Grand", 115], ["Très grand", 130]];
const ACCENTS = ["#5b9bff", "#3cc4c9", "#4fd1a1", "#f0a541", "#ff7a8d", "#a78bfa", "#e879f9", "#f2d35b"];
const DEFAUT_REGLAGES = {theme: "nuit", accent: "", forme: 2, texte: 100, h_debut: 7, h_fin: 22, notes_blocs: true,
  plein_ecran: true, horloge: true, secondes: true, son: true, rappel_cours: 0};
const REG_LOCAUX = ["vue", "plein_ecran", "texte"];
const CATS_BASE = {
  info: ["Informatique (6GEN248)", "Informatique", true], graph: ["Sciences graphiques (6DDG100)", "Sc. graphiques", true],
  meca: ["Mécanique (6GMC108)", "Mécanique", true], ethique: ["Ingénierie et éthique (6GIN275)", "Éthique", true],
  travail: ["Travail", "Travail", false], etude: ["Étude", "Étude", false], perso: ["Perso", "Perso", false],
};
const TYPES = [["cours", "Cours"], ["lab", "Lab"], ["td", "T.D."], ["autre", "Autre"]];
const TYPE_TAG = {cours: "", lab: "LAB", td: "T.D.", autre: ""};
const STATUTS = [["", "Obligatoire"], ["possible", "Possible (optionnel)"], ["vais", "J'y vais cette semaine"], ["saute", "Je saute cette semaine"]];
const TYPES_ECH = [["intra", "Examen intra"], ["final", "Examen final"], ["travail", "Travail / TP"], ["quiz", "Quiz"],
  ["lab", "Laboratoire"], ["projet", "Projet"], ["expose", "Présentation orale"], ["autre", "Autre"]];

/* état du thème courant (rempli par appliquerReglages) */
const T = {CRITIQUE: "#ff6fd8", RAD: 1, TXT: 1, H_DEBUT: 7, H_FIN: 22, REG_THEME: "nuit", MONO: false};
let CATS = {};            // cle -> [nom, court, cours?]
let COURS_KEYS = [];
let CAT_COUL = {};
let COULEURS = {};

/* ---------- couleurs */
function rgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function hex(c) { return "#" + c.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join(""); }
function mix(a, t, b = "#ffffff") { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v * (1 - t) + y[i] * t)); }
function encreSur(c) { const [r, g, b] = rgb(c); return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#07111f" : "#ffffff"; }
function couleur(cat) { return COULEURS[cat] || COULEURS.perso || T.MUTED; }
function estHex(s) { return /^#[0-9a-fA-F]{6}$/.test(s || ""); }
function hsvHex(h, s, v) {
  h = ((h % 1) + 1) % 1; s = Math.max(0, Math.min(1, s)); v = Math.max(0, Math.min(1, v));
  const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
  return hex([r * 255, g * 255, b * 255]);
}
function hexHsv(c) {
  const [r, g, b] = rgb(c).map(x => x / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [((h / 6) + 1) % 1, mx ? d / mx : 0, mx];
}

function categoriesDefaut() {
  return Object.entries(CATS_BASE).map(([k, v]) => ({cle: k, nom: v[0], court: v[1], cours: v[2], couleur: ""}));
}
function appliquerCategories(liste) {
  CATS = {}; CAT_COUL = {};
  for (const c of liste || []) {
    CATS[c.cle] = [c.nom || c.court || "Sans nom", c.court || c.nom || "Sans nom", !!c.cours];
    if (estHex(c.couleur)) CAT_COUL[c.cle] = c.couleur.toLowerCase();
  }
  if (!CATS.perso) CATS.perso = ["Perso", "Perso", false];
  COURS_KEYS = Object.keys(CATS).filter(k => CATS[k][2]);
}
function couleurDefaut(k, theme) {
  const t = theme || THEMES[T.REG_THEME] || THEMES.nuit;
  if (t.cats[k]) return t.cats[k];
  let s = 0; for (const ch of k) s += ch.codePointAt(0);
  return PALETTE_AUTO[s % PALETTE_AUTO.length];
}
function R(x) { return Math.round(x * T.RAD); }

function appliquerReglages(reg) {
  const t = THEMES[reg.theme] || THEMES.nuit;
  T.REG_THEME = THEMES[reg.theme] ? reg.theme : "nuit";
  T.MONO = !!t.mono;
  for (const k of ["BG", "SURFACE", "SURFACE2", "SURFACE3", "INK", "MUTED", "RULE", "GRID", "TODAY_BG", "DANGER", "TINT", "SCROLL", "LINE2"]) T[k] = t[k];
  T.SOMBRE = t.sombre;
  T.CRITIQUE = t.sombre ? "#ff6fd8" : "#c0268f";
  const acc = reg.accent || t.ACCENT;
  T.ACCENT = acc; T.ACCENT_HOVER = mix(acc, .22); T.ACCENT_INK = encreSur(acc);
  T.RAD = (FORMES[parseInt(reg.forme ?? 2)] || FORMES[2])[1];
  if (t.bloc) T.RAD = 0;          // thème « blocs » : coins carrés quel que soit le réglage de forme
  T.TXT = Math.max(.8, Math.min(1.4, (parseInt(reg.texte) || 100) / 100));
  let hd = parseInt(reg.h_debut ?? 7), hf = parseInt(reg.h_fin ?? 22);
  if (isNaN(hd)) hd = 7; if (isNaN(hf)) hf = 22;
  hd = Math.max(0, Math.min(hd, 12)); hf = Math.max(hd + 6, Math.min(hf, 24));
  T.H_DEBUT = hd; T.H_FIN = hf; T.REG_HD = hd; T.REG_HF = hf;
  COULEURS = {};
  for (const k of Object.keys(CATS)) COULEURS[k] = CAT_COUL[k] || couleurDefaut(k, t);
  const st = document.documentElement.style;
  const v = {"--bg": T.BG, "--surface": T.SURFACE, "--surface2": T.SURFACE2, "--surface3": T.SURFACE3, "--ink": T.INK,
    "--muted": T.MUTED, "--rule": T.RULE, "--grid": T.GRID, "--today": T.TODAY_BG, "--accent": T.ACCENT,
    "--accent-hover": T.ACCENT_HOVER, "--accent-ink": T.ACCENT_INK, "--danger": T.DANGER, "--line2": T.LINE2,
    "--scroll": T.SCROLL, "--critique": T.CRITIQUE, "--rad": String(T.RAD), "--txt": String(T.TXT)};
  for (const [k, x] of Object.entries(v)) st.setProperty(k, x);
  document.documentElement.classList.toggle("mono", T.MONO);
  document.documentElement.classList.toggle("clair", !T.SOMBRE);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", T.BG);
}

/* ---------- dates et heures */
function toMin(s) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "")); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0; }
function hm(m) { m = Math.round(m); return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
function fmt(s) { const m = toMin(s), h = Math.floor(m / 60), mm = m % 60; return mm ? `${h} h ${String(mm).padStart(2, "0")}` : `${h} h`; }
function fmtDuree(min) { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`; }
function newId() { const a = new Uint8Array(4); crypto.getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, "0")).join(""); }
function parseTime(s) {
  s = String(s || "").trim().replace(/\s/g, "");
  const m = /^([01]?\d|2[0-3])[:hH]?([0-5]\d)?$/.exec(s);
  return m ? String(parseInt(m[1])).padStart(2, "0") + ":" + (m[2] || "00") : null;
}
function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function isoDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}
function parseDate(s) {
  s = String(s || "").trim();
  let d = isoDate(s);
  if (d) return iso(d);
  let m = /^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?$/.exec(s);
  if (m) { d = new Date(m[3] ? +m[3] : new Date().getFullYear(), +m[2] - 1, +m[1]); if (d.getDate() === +m[1]) return iso(d); }
  return null;
}
function aujourdhui() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function ajouterJours(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function joursEntre(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); }
function jourSemaine(d) { return (d.getDay() + 6) % 7; }   // lundi = 0
function lundiDe(d) { return ajouterJours(d, -jourSemaine(d)); }
function lundiSemaine(i) { return ajouterJours(SESSION_DEBUT, 7 * i); }
function bornerLundi(d) {
  const a = lundiSemaine(0), b = lundiSemaine(SESSION_SEMAINES - 1), l = lundiDe(d);
  return l < a ? a : l > b ? b : l;
}
function memeJour(a, b) { return a && b && a.getTime() === b.getTime(); }
function dateCourte(d) { return `${d.getDate()} ${MOIS[d.getMonth()]}`; }
function plageSemaine(l) {
  const dim = ajouterJours(l, 6);
  return l.getMonth() === dim.getMonth() ? `${l.getDate()} – ${dim.getDate()} ${MOIS[dim.getMonth()]}` : `${dateCourte(l)} – ${dateCourte(dim)}`;
}
function quand(d) {
  const n = joursEntre(aujourdhui(), d);
  if (n === 0) return "aujourd'hui";
  if (n === 1) return "demain";
  if (n === -1) return "hier";
  return n > 0 ? `dans ${n} jours` : `il y a ${-n} jours`;
}
function fmtHms(sec, centiemes) {
  sec = Math.max(0, sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  let b = h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  if (centiemes) b += "." + String(Math.floor((sec - Math.floor(sec)) * 100)).padStart(2, "0");
  return b;
}
function nowIsoMinutes() { const d = new Date(); return iso(d) + "T" + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function clone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
function num(x) { const v = parseFloat(String(x ?? "").replace(",", ".")); return isNaN(v) ? null : v; }
function fmtG(x) { return String(+x.toFixed(6)); }

/* JSON canonique (clés triées) : sert à comparer les sections entre deux appareils */
function canon(v) {
  if (Array.isArray(v)) return "[" + v.map(x => x === undefined ? "null" : canon(x)).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
  }
  return JSON.stringify(v === undefined ? null : v);
}

/* ---------- données */
function normaliser(d) {
  d = d && typeof d === "object" ? d : {};
  const out = {version: 4, modele: [], semaines: {}, echeances: [], notes: [], reglages: {}, categories: categoriesDefaut(),
    alarmes: [], etude_log: [], critiques: [], relaches: [], imports: [], pomodoro: {travail: 25, pause: 5, longue: 15, cycles: 4}};
  for (const [k, v] of Object.entries(d)) out[k] = v;
  for (const k of ["modele", "echeances", "notes", "alarmes", "etude_log", "critiques", "relaches", "imports"]) if (!Array.isArray(out[k])) out[k] = [];
  if (!out.semaines || typeof out.semaines !== "object") out.semaines = {};
  if (!Array.isArray(out.categories) || !out.categories.length) out.categories = categoriesDefaut();
  if (!out.reglages || typeof out.reglages !== "object") out.reglages = {};
  if (!out.pomodoro || typeof out.pomodoro !== "object") out.pomodoro = {travail: 25, pause: 5, longue: 15, cycles: 4};
  return out;
}

function sectionsDe(d) {
  const out = {};
  for (const [k, v] of Object.entries(d)) {
    if (k === "semaines") {
      for (const [l, s] of Object.entries(v || {})) if (s && Object.keys(s).length) out["s_" + l] = s;
    } else if (k === "reglages") {
      const r = {};
      for (const [a, b] of Object.entries(v || {})) if (!REG_LOCAUX.includes(a)) r[a] = b;
      out[k] = r;
    } else out[k] = v;
  }
  return out;
}
function poserSection(d, nom, valeur) {
  if (nom.startsWith("s_")) {
    const l = nom.slice(2);
    if (valeur === null) delete d.semaines[l]; else d.semaines[l] = valeur;
  } else if (nom === "reglages") {
    const locaux = {};
    for (const k of REG_LOCAUX) if (k in d.reglages) locaux[k] = d.reglages[k];
    const nv = Object.assign({}, valeur || {}, locaux);
    for (const k of Object.keys(d.reglages)) delete d.reglages[k];
    Object.assign(d.reglages, nv);
  } else if (valeur === null) {
    if (!["modele", "echeances", "notes", "categories"].includes(nom)) delete d[nom];
  } else d[nom] = valeur;
}

/* stockage local de l'iPad */
const Stock = {
  lire(k, defaut) { try { const v = localStorage.getItem(k); return v === null ? defaut : JSON.parse(v); } catch (e) { return defaut; } },
  ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  effacer(k) { try { localStorage.removeItem(k); } catch (e) { /* rien */ } },
};
