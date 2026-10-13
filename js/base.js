/* Horaire Automne 2026 — version iPad : constantes, thèmes, outils, données.
   Même modèle de données que l'application PC (horaire_automne_2026.json, version 4). */
"use strict";

let APP_TITLE = "Horaire Automne 2026";
let SESSION_DEBUT = new Date(2026, 7, 31);   // lundi de la semaine 1 de l'horaire actif (voir activerHoraire)
let SESSION_SEMAINES = 17;
const HORAIRE_PRINCIPAL = {id: "aut26", nom: "Automne 2026", debut: "2026-08-31", nb: 17};
let HID = "aut26";                             // horaire actif
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
  hollow: {"nom": "Hollow Knight", "sombre": true, "titres": "serif", "decor": "hollow", "BG": "#0b0d12", "SURFACE": "#12161e", "SURFACE2": "#1a1f29", "SURFACE3": "#252b37", "INK": "#e8e2d0", "MUTED": "#979eab", "RULE": "#232a36", "GRID": "#161b23", "TODAY_BG": "#16212a", "ACCENT": "#c9a85c", "LUEUR": "#9fd8d0", "DANGER": "#e8875a", "TINT": 0.8, "SCROLL": "#2a3240", "LINE2": "#323a48", "cats": {"info": "#8fc9e8", "graph": "#a9b4e6", "meca": "#d9a066", "ethique": "#d98a9a", "travail": "#b9a3dc", "etude": "#9aa3b2", "perso": "#9fd8b8"}},
  rocket: {"nom": "Rocket League", "sombre": true, "titres": "sport", "BG": "#070d1c", "SURFACE": "#0e1630", "SURFACE2": "#152045", "SURFACE3": "#1e2c5c", "INK": "#eef3ff", "MUTED": "#8fa0c8", "RULE": "#1c2a55", "GRID": "#121c3c", "TODAY_BG": "#16224a", "ACCENT": "#1fa2ff", "DANGER": "#ff5a1f", "TINT": 0.74, "SCROLL": "#25356a", "LINE2": "#2b3d78", "cats": {"info": "#1fa2ff", "graph": "#7c5cff", "meca": "#ff7a1a", "ethique": "#ff3d6e", "travail": "#ffd23f", "etude": "#7f93c4", "perso": "#2ee6a6"}},
  sakura: {"nom": "Sakura", "sombre": false, "BG": "#fbf0f3", "SURFACE": "#ffffff", "SURFACE2": "#fdf3f6", "SURFACE3": "#f7dfe7", "INK": "#3b2530", "MUTED": "#9a7383", "RULE": "#f1d9e2", "GRID": "#f7e8ee", "TODAY_BG": "#fde2ea", "ACCENT": "#e75a8a", "DANGER": "#d6334b", "TINT": 0.72, "SCROLL": "#efc6d4", "LINE2": "#e9c3d1", "cats": {"info": "#2a9d8f", "graph": "#5b7bd5", "meca": "#e07a3f", "ethique": "#d6336c", "travail": "#9b59b6", "etude": "#7d8597", "perso": "#5aa55a"}},
  synthwave: {"nom": "Synthwave", "sombre": true, "titres": "sport", "BG": "#14081f", "SURFACE": "#1d0d2e", "SURFACE2": "#281241", "SURFACE3": "#371a58", "INK": "#fdeaff", "MUTED": "#b08ccc", "RULE": "#33184f", "GRID": "#220f36", "TODAY_BG": "#2e1149", "ACCENT": "#ff7a45", "DANGER": "#ff3b6b", "TINT": 0.74, "SCROLL": "#4a2275", "LINE2": "#4a2a75", "cats": {"info": "#3df2ff", "graph": "#a970ff", "meca": "#ffb84d", "ethique": "#ff4fa3", "travail": "#ff7a45", "etude": "#9a86c7", "perso": "#5cffb0"}},
};
const PALETTE_AUTO = ["#f5d061", "#ff9f6b", "#6be0c0", "#e58cff", "#7fd3ff", "#ff8fb1", "#b6e36b", "#ffc46b", "#8fa8ff", "#f27474"];
const FORMES = [["Carré", 0.0], ["Léger", 0.55], ["Arrondi", 1.0], ["Très arrondi", 1.6]];
const TAILLES = [["Petit", 90], ["Normal", 100], ["Grand", 115], ["Très grand", 130]];
const ACCENTS = ["#5b9bff", "#3cc4c9", "#4fd1a1", "#f0a541", "#ff7a8d", "#a78bfa", "#e879f9", "#f2d35b"];
const DEFAUT_REGLAGES = {theme: "nuit", accent: "", forme: 2, texte: 100, h_debut: 7, h_fin: 22, notes_blocs: true,
  plein_ecran: true, horloge: true, secondes: true, son: true, rappel_cours: 0,
  prenom: "Antoine", objectif: 70, icones_theme: true, reduire_effets: false, son_ambiance: false, volume_ambiance: 60, brume: "normale"};
const REG_LOCAUX = ["vue", "plein_ecran", "texte", "horaire", "page", "vue3d", "onglets_notes", "canevas_vues", "canevas_fond", "notes_repliees", "transferts_actif", "transferts_port", "icones_theme", "reduire_effets", "son_ambiance", "volume_ambiance", "brume"];   // réglages propres à l'appareil
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
  T.REG_ICONES = reg.icones_theme !== false;
  T.MONO = !!t.mono;
  T.TITRES = t.titres || "";
  for (const k of ["BG", "SURFACE", "SURFACE2", "SURFACE3", "INK", "MUTED", "RULE", "GRID", "TODAY_BG", "DANGER", "TINT", "SCROLL", "LINE2"]) T[k] = t[k];
  T.SOMBRE = t.sombre;
  T.LUEUR = t.LUEUR || t.ACCENT;
  T.DECOR = t.decor || "";
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
    "--scroll": T.SCROLL, "--critique": T.CRITIQUE, "--lueur": T.LUEUR, "--rad": String(T.RAD), "--txt": String(T.TXT)};
  for (const [k, x] of Object.entries(v)) st.setProperty(k, x);
  document.documentElement.classList.toggle("mono", T.MONO);
  document.documentElement.classList.toggle("titres-serif", T.TITRES === "serif");
  document.documentElement.classList.toggle("titres-sport", T.TITRES === "sport");
  document.documentElement.classList.toggle("clair", !T.SOMBRE);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", T.BG);
  document.documentElement.dataset.brume = ["aucune", "legere", "normale", "dense"].includes(reg.brume) ? reg.brume : "normale";
  if (typeof Decor !== "undefined") Decor.appliquer(reg);
  if (typeof Ambiance !== "undefined") Ambiance.appliquer(reg);
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

/* ---------- plusieurs horaires (sessions) */
function sessionVide() { return {modele: [], semaines: {}, echeances: [], critiques: [], relaches: [], imports: []}; }
function listeHoraires(d) {
  const hs = [], vus = new Set();
  for (const h of (d && Array.isArray(d.horaires) ? d.horaires : [])) {
    if (!h || typeof h !== "object" || !h.id || vus.has(h.id) || !isoDate(h.debut)) continue;
    vus.add(h.id);
    let nb = parseInt(h.nb); if (isNaN(nb)) nb = 15;
    hs.push({id: String(h.id), nom: String(h.nom || "Horaire"), debut: h.debut, nb: Math.max(1, Math.min(60, nb))});
  }
  if (!vus.has("aut26")) hs.unshift(Object.assign({}, HORAIRE_PRINCIPAL));
  return hs;
}
function metaHoraire(d, id) { const hs = listeHoraires(d); return hs.find(h => h.id === id) || hs[0]; }
function donneesHoraire(d, id) {
  if (id === "aut26") return d;
  let s = d["h_" + id];
  if (!s || typeof s !== "object") s = d["h_" + id] = sessionVide();
  const v = sessionVide();
  for (const k of Object.keys(v)) if (Array.isArray(v[k]) ? !Array.isArray(s[k]) : (!s[k] || typeof s[k] !== "object" || Array.isArray(s[k]))) s[k] = v[k];
  return s;
}
function toutesSessions(d) { return [d].concat(Object.keys(d).filter(k => k.startsWith("h_") && d[k] && typeof d[k] === "object").map(k => d[k])); }
function finHoraire(h) { return ajouterJours(isoDate(h.debut), 7 * (h.nb - 1) + 6); }
function activerHoraire(h) {
  HID = h.id;
  SESSION_DEBUT = lundiDe(isoDate(h.debut));
  SESSION_SEMAINES = h.nb;
  APP_TITLE = "Horaire " + h.nom;
  document.title = APP_TITLE;
}
function horairePour(d, jour, prefere) {
  const hs = listeHoraires(d).sort((a, b) => (a.id === prefere ? 0 : 1) - (b.id === prefere ? 0 : 1));
  return hs.find(h => isoDate(h.debut) <= jour && jour <= finHoraire(h)) || null;
}
function normaliserHoraire(v) {
  const out = sessionVide();
  if (!v || typeof v !== "object") return out;
  for (const k of ["modele", "echeances", "critiques", "relaches", "imports"]) if (Array.isArray(v[k])) out[k] = v[k];
  if (v.semaines && typeof v.semaines === "object" && !Array.isArray(v.semaines)) out.semaines = v.semaines;
  for (const e of out.echeances) if (e && e.resultat === undefined) e.resultat = "";
  return out;
}

/* ---------- notes : cahiers à pages (façon GoodNotes) */
const PAGE_L = 1000, PAGE_H = 1414;
const FONDS = [["ligne", "Lignes"], ["carreau", "Quadrillé"], ["points", "Points"], ["blanc", "Blanc"], ["cornell", "Cornell"], ["canevas", "Canevas infini"]];
const PAPIERS = [["auto", "Selon le thème"], ["blanc", "Blanc"], ["creme", "Crème"], ["sombre", "Sombre"]];
const COUVERTURES = ["#3d5a80", "#c0392b", "#e67e22", "#f1c40f", "#27ae60", "#16a085", "#2980b9", "#8e44ad", "#d35490", "#5d4037", "#2c3e50", "#7f8c8d"];
function pageVide(f, id) { return {id: id || newId(), f: f || "ligne", h: PAGE_H, traits: [], textes: []}; }
/* documents PDF importés (métadonnées seulement ; le contenu voyage à part) */
function normaliserFichiers(l) {
  const out = [], vus = new Set();
  for (const f of Array.isArray(l) ? l : []) {
    if (!f || typeof f.id !== "string" || vus.has(f.id)) continue;
    vus.add(f.id);
    out.push({id: f.id, nom: String(f.nom || "Document.pdf"), taille: Number(f.taille) || 0, n: Number(f.n) || 0,
      pages: Array.isArray(f.pages) ? f.pages.filter(x => Array.isArray(x)).map(x => [Number(x[0]) || 612, Number(x[1]) || 792]) : [], ajout: String(f.ajout || "")});
    for (const k of ["type", "format", "triangles", "dims", "local", "apercu"]) if (f[k] !== undefined && f[k] !== null && f[k] !== "") out[out.length - 1][k] = f[k];   // fichiers 3D (STL, 3MF)
  }
  return out;
}
/* modèles de pages (fond + contenu), réutilisables dans tous les cahiers */
function normaliserModeles(l) {
  const out = [], vus = new Set();
  for (const m of Array.isArray(l) ? l : []) {
    if (!m || typeof m !== "object") continue;
    const id = typeof m.id === "string" && m.id ? m.id : newId();
    if (vus.has(id)) continue;
    vus.add(id);
    out.push({id, nom: String(m.nom || "Modèle").slice(0, 60), f: FONDS.some(x => x[0] === m.f) ? m.f : "ligne",
      h: Math.max(400, Math.min(4000, Number(m.h) || PAGE_H)), traits: Array.isArray(m.traits) ? m.traits : [], textes: Array.isArray(m.textes) ? m.textes : []});
  }
  return out;
}
function pageDepuisModele(m) {
  return {id: newId(), f: m.f, h: m.h, traits: clone(m.traits || []), textes: clone(m.textes || []).map(t => Object.assign(t, {id: newId()}))};
}
function normaliserNote(n) {
  n = Object.assign({titre: "", texte: "", cours: "", epingle: false, dossier: "", type: "", couverture: "", fond: "ligne", papier: "auto"}, n || {});
  if (!n.id) n.id = newId();
  if (!n.maj) n.maj = nowIsoMinutes();
  if (!Array.isArray(n.pages)) n.pages = [];
  if (n.dessin && Array.isArray(n.dessin.traits) && n.dessin.traits.length && !n.pages.length) {
    n.pages = [{id: "p1", f: "ligne", h: Math.max(PAGE_H, Math.round(n.dessin.h || PAGE_H)), traits: n.dessin.traits, textes: []}];
  }
  delete n.dessin;
  if (!n.type) n.type = n.pages.length ? "cahier" : "texte";
  n.pages = n.pages.filter(p => p && p.id).map(p => {
    const q = {id: String(p.id), f: p.f || "ligne", h: p.h || PAGE_H, traits: Array.isArray(p.traits) ? p.traits : [], textes: Array.isArray(p.textes) ? p.textes : []};
    if (Array.isArray(p.pdf) && typeof p.pdf[0] === "string") q.pdf = [p.pdf[0], Number(p.pdf[1]) || 0];   // page d'un PDF importé
    if (p.mp) q.mp = 1;                                                                                     // marque-page
    if (p.vide) q.vide = 1;                                                                                 // page vidée volontairement (voir pageVideSuspecte)
    return q;
  });
  if (n.type === "cahier" && !n.pages.length) n.pages.push(pageVide(n.fond, "p1"));
  return n;
}
function normaliserDossiers(l) {
  const out = [], vus = new Set();
  for (const x of Array.isArray(l) ? l : []) if (x && x.id && !vus.has(x.id)) { vus.add(x.id); out.push({id: String(x.id), nom: String(x.nom || "Dossier"), couleur: estHex(x.couleur) ? x.couleur : COUVERTURES[0]}); }
  return out;
}

/* ---------- données */
/* traces des notes supprimées exprès : {id: moment (ms)}. Elles empêchent une note supprimée de revenir
   (appareil fermé au moment de la suppression, pages restées sur le serveur…). Gardées un an. */
const TOMBE_JOURS = 365;
function normaliserTombes(t) {
  const out = {}, limite = Date.now() - TOMBE_JOURS * 86400000;
  for (const [k, v] of Object.entries(t && typeof t === "object" && !Array.isArray(t) ? t : {})) {
    const n = Math.round(Number(v));
    if (k && isFinite(n) && n > limite) out[k] = n;
  }
  return out;
}
function noteEnterree(d, id) { return !!id && !!d && !!d.notes_supprimees && id in d.notes_supprimees; }
/* suppression voulue d'une note : trace synchronisée (nx_<id>) + suppression envoyée au serveur */
function enterrerNote(app, id) {
  if (!id) return;
  if (!app.donnees.notes_supprimees || typeof app.donnees.notes_supprimees !== "object") app.donnees.notes_supprimees = {};
  app.donnees.notes_supprimees[id] = Date.now();
  app.sync.marquerSuppression(id);
}
/* messages vocaux : seules les fiches sont dans les données (le son reste sur l'appareil qui l'a créé) */
function normaliserVocaux(l) {
  const out = [], vus = new Set();
  for (const v of Array.isArray(l) ? l : []) {
    if (!v || typeof v !== "object" || !v.id || vus.has(String(v.id))) continue;
    vus.add(String(v.id));
    out.push(Object.assign({}, v, {id: String(v.id), nom: String(v.nom || "Message vocal"), duree: Math.max(0, Math.round(Number(v.duree) || 0)),
      date: String(v.date || ""), appareil: String(v.appareil || ""), format: String(v.format || "").toLowerCase(), taille: Math.max(0, Math.round(Number(v.taille) || 0))}));
  }
  return out;
}
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
  out.notes = out.notes.filter(n => n && typeof n === "object").map(normaliserNote);
  out.dossiers = normaliserDossiers(out.dossiers);
  out.fichiers = normaliserFichiers(out.fichiers);
  out.modeles = normaliserModeles(out.modeles);
  out.vocaux = normaliserVocaux(out.vocaux);
  out.notes_supprimees = normaliserTombes(out.notes_supprimees);
  out.notes = out.notes.filter(n => !(n.id in out.notes_supprimees));      // une note supprimée exprès ne revient jamais
  out.horaires = listeHoraires(out);
  const ids = new Set(out.horaires.map(h => h.id));
  for (const k of Object.keys(out)) {
    if (!k.startsWith("h_")) continue;
    if (ids.has(k.slice(2))) out[k] = normaliserHoraire(out[k]); else delete out[k];
  }
  return out;
}

/* ---------- garde-fous contre les pages blanches */
/* une page n'est « vide volontairement » que si l'utilisateur l'a vidée (marqueur vide:1 dans sa section) */
function contenuPage(v) { return v ? (Array.isArray(v.traits) ? v.traits.length : 0) + (Array.isArray(v.textes) ? v.textes.length : 0) : 0; }
function pageVideSansAccord(v) { return !!v && typeof v === "object" && contenuPage(v) === 0 && !v.vide; }
/* une section distante qui viderait une page (ou ferait disparaître toutes les pages d'un cahier) sans que l'autre appareil l'ait voulu */
function videDistantSuspect(d, nom, valeur) {
  if (!valeur || typeof valeur !== "object") return false;
  if (nom.startsWith("np_")) {
    const [, nid, pid] = nom.split("_");
    const n = (d.notes || []).find(x => x.id === nid), p = n && (n.pages || []).find(x => x.id === pid);
    return !!p && contenuPage(p) > 0 && pageVideSansAccord(valeur);
  }
  if (nom.startsWith("n_")) {
    const n = (d.notes || []).find(x => x.id === nom.slice(2));
    return !!n && n.type === "cahier" && (n.pages || []).length > 0 && valeur.type === "cahier" && !(valeur.pages || []).length;
  }
  return false;
}
function sectionDeNote(nom) { return nom === "notes" || nom.startsWith("n_") || nom.startsWith("np_"); }

function sectionsDe(d) {
  const out = {};
  for (const [k, v] of Object.entries(d)) {
    if (k === "semaines") {
      for (const [l, s] of Object.entries(v || {})) if (s && Object.keys(s).length) out["s_" + l] = s;
    } else if (k === "reglages") {
      const r = {};
      for (const [a, b] of Object.entries(v || {})) if (!REG_LOCAUX.includes(a)) r[a] = b;
      out[k] = r;
    } else if (k === "notes") {
      // les notes : l'ordre, puis une section par note (sans le contenu des pages), puis une par page
      out.notes = (v || []).map(n => n.id);
      for (const n of v || []) {
        const m = {};
        for (const [a, b] of Object.entries(n)) if (a !== "pages") m[a] = b;
        m.pages = (n.pages || []).map(p => Object.assign({id: p.id, f: p.f, h: p.h}, p.pdf ? {pdf: p.pdf} : {}, p.mp ? {mp: 1} : {}));
        out["n_" + n.id] = m;
        for (const p of n.pages || []) out["np_" + n.id + "_" + p.id] = Object.assign({traits: p.traits || [], textes: p.textes || []}, p.vide ? {vide: 1} : {});
      }
    } else if (k === "notes_supprimees") {
      // une trace par note supprimée exprès : l'autre appareil saura que l'absence de la note est voulue
      for (const [id, t] of Object.entries(v || {})) out["nx_" + id] = {t};
    } else if (k === "vocaux") {
      // messages vocaux : une section par fiche (deux appareils peuvent en ajouter en même temps sans se gêner)
      for (const x of v || []) if (x && x.id) out["vx_" + x.id] = x;
    } else if (k.startsWith("h_") && v && typeof v === "object") {
      // autre horaire : une section pour l'horaire + une par semaine modifiée
      const r = {};
      for (const [a, b] of Object.entries(v)) if (a !== "semaines") r[a] = b;
      out[k] = r;
      for (const [l, sm] of Object.entries(v.semaines || {})) if (sm && Object.keys(sm).length) out["hs_" + k.slice(2) + "_" + l] = sm;
    } else out[k] = v;
  }
  return out;
}
function poserSection(d, nom, valeur) {
  if (nom === "notes") {
    if (!Array.isArray(valeur)) return;
    if (valeur.length && typeof valeur[0] === "object") { d.notes = valeur.map(normaliserNote); return; }   // ancien format
    const par = new Map((d.notes || []).map(n => [n.id, n]));
    const liste = valeur.filter(id => par.has(id)).map(id => par.get(id));        // l'ordre seulement : une note arrive par n_<id>
    for (const n of d.notes || []) if (!valeur.includes(n.id)) liste.push(n);    // supprimées seulement par n_<id>
    d.notes = liste;
  } else if (nom.startsWith("np_")) {
    const [, nid, pid] = nom.split("_");
    if (valeur === null || noteEnterree(d, nid)) return;                         // une page retirée l'est par n_<id> ; jamais de page d'une note supprimée
    d.notes = d.notes || [];
    const n = d.notes.find(x => x.id === nid);
    if (!n) return;                                                              // page sans sa note (reste d'une ancienne suppression) : ignorée
    n.pages = n.pages || [];
    let p = n.pages.find(x => x.id === pid);
    if (!p) { p = {id: pid, f: "ligne", h: PAGE_H}; n.pages.push(p); }
    if (contenuPage(p) > 0 && pageVideSansAccord(valeur)) return;                // jamais de page blanche non voulue
    p.traits = valeur.traits || []; p.textes = valeur.textes || [];
    if (valeur.vide && contenuPage(valeur) === 0) p.vide = 1; else delete p.vide;
  } else if (nom.startsWith("n_")) {
    const id = nom.slice(2);
    d.notes = d.notes || [];
    const i = d.notes.findIndex(x => x.id === id);
    if (valeur === null) { if (i >= 0) d.notes.splice(i, 1); return; }
    if (noteEnterree(d, id)) return;                                             // note supprimée exprès : elle ne revient pas
    const anc = i >= 0 ? d.notes[i] : null;
    const contenu = new Map(((anc && anc.pages) || []).map(p => [p.id, p]));
    const nv = Object.assign({}, valeur);
    if (valeur.type === "cahier" && !(valeur.pages || []).length && contenu.size) return;      // jamais un cahier sans page
    nv.pages = (valeur.pages || []).map(pm => { const c = contenu.get(pm.id); return Object.assign({traits: c ? c.traits || [] : [], textes: c ? c.textes || [] : []}, c && c.vide ? {vide: 1} : {}, pm); });
    if (i >= 0) d.notes[i] = nv; else d.notes.push(nv);
  } else if (nom.startsWith("nx_")) {
    const id = nom.slice(3);
    if (!d.notes_supprimees || typeof d.notes_supprimees !== "object") d.notes_supprimees = {};
    if (valeur && typeof valeur === "object") { d.notes_supprimees[id] = Math.round(Number(valeur.t) || 0); d.notes = (d.notes || []).filter(n => n.id !== id); }
    else delete d.notes_supprimees[id];
  } else if (nom.startsWith("vx_")) {
    const id = nom.slice(3);
    d.vocaux = Array.isArray(d.vocaux) ? d.vocaux : [];
    const i = d.vocaux.findIndex(x => x.id === id);
    if (valeur === null || typeof valeur !== "object") { if (i >= 0) d.vocaux.splice(i, 1); return; }
    const v = normaliserVocaux([Object.assign({}, valeur, {id})])[0];
    if (i >= 0) d.vocaux[i] = v; else d.vocaux.push(v);
  } else if (nom.startsWith("hs_")) {
    const i = nom.lastIndexOf("_"), id = nom.slice(3, i), l = nom.slice(i + 1);
    let ses = d["h_" + id];
    if (!ses || typeof ses !== "object") { if (valeur === null) return; ses = d["h_" + id] = sessionVide(); }
    ses.semaines = ses.semaines || {};
    if (valeur === null) delete ses.semaines[l]; else ses.semaines[l] = valeur;
  } else if (nom.startsWith("h_")) {
    if (valeur === null) { delete d[nom]; return; }
    const ancien = d[nom] && typeof d[nom] === "object" ? d[nom] : {};
    d[nom] = Object.assign(sessionVide(), valeur, {semaines: ancien.semaines || {}});
  } else if (nom.startsWith("s_")) {
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
/* Les données vivent dans IndexedDB (beaucoup plus de place que localStorage pour les cahiers manuscrits).
   Une copie en mémoire permet de lire tout de suite ; les écritures partent en arrière-plan.
   Règles de sûreté : une écriture n'est considérée comme faite qu'une fois la transaction terminée (sinon elle est
   retentée), la copie de secours localStorage n'est retirée qu'après, et chaque erreur est journalisée. */
const Stock = {
  cache: {}, db: null, attente: {}, _t: null, degrade: false, erreurs: [], avantVider: [],
  /* journal des erreurs de stockage et de synchro (console + les 60 dernières dans localStorage) */
  journal(contexte, err) {
    const e = {t: new Date().toISOString(), contexte, message: String(err && err.message || err)};
    this.erreurs.push(e); if (this.erreurs.length > 60) this.erreurs.shift();
    try { console.error("[horaire] " + contexte + " : " + e.message); } catch (x) { /* */ }
    try { localStorage.setItem("horaire_journal", JSON.stringify(this.erreurs)); } catch (x) { /* */ }
  },
  async ouvrirBase() {
    return await new Promise((ok, ko) => {
      const r = indexedDB.open("horaire", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); r.onblocked = () => ko(new Error("base bloquée"));
    });
  },
  async init() {
    // iOS ferme parfois la connexion IndexedDB au réveil de l'appli : on réessaie avant de renoncer
    for (let essai = 0; essai < 4 && !this.db; essai++) {
      try {
        const db = await this.ouvrirBase();
        const tout = await new Promise((ok, ko) => {
          const out = {}, tx = db.transaction("kv", "readonly"), st = tx.objectStore("kv"), c = st.openCursor();
          c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else ok(out); };
          c.onerror = () => ko(c.error); tx.onabort = () => ko(tx.error || new Error("lecture annulée"));
        });
        this.db = db; this.cache = tout;
        db.onclose = () => { this.db = null; this.journal("base fermée par le système", "reconnexion à la prochaine écriture"); };
        db.onversionchange = () => { try { db.close(); } catch (e) { /* */ } this.db = null; };
      } catch (e) {
        this.journal("ouverture du stockage (essai " + (essai + 1) + ")", e);
        await new Promise(r => setTimeout(r, 250 * (essai + 1)));
      }
    }
    if (!this.db) this.degrade = true;      // on continue avec localStorage, mais sans écraser ce qui est dans IndexedDB
    // reprise des anciennes données (localStorage)
    for (const k of ["horaire_donnees", "horaire_reglages_locaux", "horaire_synchro", "horaire_outils"]) {
      if (k in this.cache) continue;
      try { const v = localStorage.getItem(k); if (v !== null) { this.cache[k] = JSON.parse(v); this.planifier(k); } } catch (e) { this.journal("lecture de la copie de secours " + k, e); }
    }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* */ }
  },
  lire(k, defaut) { return k in this.cache ? clone(this.cache[k]) : defaut; },
  ecrire(k, v) {
    this.cache[k] = v;                 // la référence suffit : on écrit la dernière version au moment de vider
    if (!this.db) {
      if (!this.degrade) this.rouvrir();
      try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
    }
    this.planifier(k);
    return true;
  },
  async rouvrir() {
    if (this._rouvre) return;
    this._rouvre = true;
    try { this.db = await this.ouvrirBase(); for (const k of Object.keys(this.cache)) this.attente[k] = true; this.vider(); }
    catch (e) { this.journal("réouverture du stockage", e); }
    this._rouvre = false;
  },
  planifier(k) {
    this.attente[k] = true;
    clearTimeout(this._t);
    this._t = setTimeout(() => this.vider(), 250);
  },
  vider() {
    if (!this.db) return;
    const cles = Object.keys(this.attente);
    if (!cles.length) return;
    this.attente = {};
    const reessayer = (e, ctx) => {
      this.journal(ctx, e);
      for (const k of cles) this.attente[k] = true;
      clearTimeout(this._t); this._t = setTimeout(() => this.vider(), 2000);
    };
    try {
      const tx = this.db.transaction("kv", "readwrite"), st = tx.objectStore("kv");
      for (const k of cles) { if (k in this.cache) st.put(this.cache[k], k); else st.delete(k); }
      tx.oncomplete = () => { for (const k of cles) { try { localStorage.removeItem(k); } catch (e) { /* */ } } };
      tx.onerror = () => reessayer(tx.error, "écriture IndexedDB");
      tx.onabort = () => reessayer(tx.error || new Error("transaction annulée"), "écriture IndexedDB annulée");
    } catch (e) {
      // base fermée par le système ou objet non copiable : on garde une copie de secours et on réessaie
      for (const k of cles) { try { if (k in this.cache) localStorage.setItem(k, JSON.stringify(this.cache[k])); } catch (x) { /* */ } }
      reessayer(e, "écriture IndexedDB");
      this.db = null; this.rouvrir();
    }
  },
  effacer(k) { delete this.cache[k]; if (this.db) this.planifier(k); try { localStorage.removeItem(k); } catch (e) { /* */ } },
};
/* avant que l'appli soit suspendue ou fermée : terminer les saisies en cours (note tapée, trait) puis écrire tout de suite */
function enregistrerAvantFermeture() {
  for (const f of Stock.avantVider) { try { f(); } catch (e) { Stock.journal("enregistrement avant fermeture", e); } }
  Stock.vider();
}
window.addEventListener("pagehide", enregistrerAvantFermeture);
window.addEventListener("beforeunload", enregistrerAvantFermeture);
document.addEventListener("visibilitychange", () => { if (document.hidden) enregistrerAvantFermeture(); });
window.addEventListener("error", (e) => Stock.journal("erreur de l'appli", e.message + " (" + (e.filename || "").split("/").pop() + ":" + e.lineno + ")"));
window.addEventListener("unhandledrejection", (e) => Stock.journal("promesse rejetée", e.reason));
