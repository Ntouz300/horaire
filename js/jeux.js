/* Géos (monnaie virtuelle), mini-jeux de casino, boutique et autocollants des notes.
   Mêmes règles, mêmes gains et mêmes dessins que sur le PC (constantes JX produites par le même fichier de référence). */
"use strict";

/* <JX> */
const JX = {"sprites": {"etoile": {"pal": {"O": "#7a4a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#f0a500"}, "rows": [".....OO.....", ".....OYO....", "....OYYO....", "OOOOOYWYOOOO", "OYYYYWYYYYDO", ".OYYYYYYYDO.", "..OYYYYYDO..", "..OYYYYYDO..", ".OYYYOOYYDO.", ".OYYO..OYDO.", "OYDO....ODDO", "OOO......OOO"]}, "etoiles": {"pal": {"O": "#5a3a8a", "Y": "#ffe066", "P": "#ff8fd1", "C": "#7fd3ff"}, "rows": ["..O.........", ".OYO.....O..", "OYYYO...OPO.", ".OYO...OPPPO", "..O.....OPO.", ".........O..", "....O.......", "...OCO......", "..OCCCO.....", "...OCO...O..", "....O...OYO.", ".........O.."]}, "coeur": {"pal": {"O": "#6b0f1f", "R": "#ff3b5c", "W": "#ffd0d8", "D": "#c81e3c"}, "rows": ["............", "..OOO..OOO..", ".ORRRO.ORRRO", "ORWWRROORRRD", "ORWRRRRRRRRD", "ORRRRRRRRRRD", ".ORRRRRRRRD.", "..ORRRRRRD..", "...ORRRRD...", "....ORRD....", ".....OD.....", "............"]}, "coeurs": {"pal": {"O": "#7a1040", "P": "#ff7ab8", "R": "#ff3b5c", "W": "#ffe0ef"}, "rows": [".OO.OO......", "OPWOPPO.....", "OPPPPPO.....", ".OPPPO......", "..OPO.OO.OO.", "...O.ORWORRO", ".....ORRRRRO", "......ORRRO.", ".......ORO..", "........O...", "............", "............"]}, "soleil": {"pal": {"O": "#a35a00", "Y": "#ffd23f", "R": "#ff9f1c", "W": "#fff3b0", "D": "#f0a500"}, "rows": [".....R......", ".R...R...R..", "..R.....R...", "....OOOO....", "...OYWYYO...", "RR.OYYYYO.RR", "...OYYYYO...", "...OYYYDO...", "....OOOO....", "..R.....R...", ".R...R...R..", ".....R......"]}, "lune": {"pal": {"O": "#3b3f6b", "Y": "#fff0a8", "D": "#e3c860", "S": "#ffffff"}, "rows": ["....OOOO....", "..OOYYYO....", ".OYYYOO.....", ".OYYO.......", "OYYDO....S..", "OYYDO...SSS.", "OYYDO....S..", "OYYYDO......", ".OYYYDOO....", ".OOYYYYYOOO.", "...OOYYYYO..", ".....OOOO..."]}, "nuage": {"pal": {"O": "#5b7290", "W": "#ffffff", "B": "#d8e6f5"}, "rows": ["............", "............", "....OOO.....", "...OWWWO....", "..OWWWWWOO..", ".OOWWWWWWWO.", "OWWWWWWWWWWO", "OWWWWWWWWWBO", "OBWWWWWWWBBO", ".OBBBBBBBBO.", "..OOOOOOOO..", "............"]}, "eclair": {"pal": {"O": "#6b4a00", "Y": "#ffe14d", "W": "#fffbe0"}, "rows": ["......OOOO..", ".....OYYO...", "....OYWO....", "...OYYO.....", "..OYYOOOOO..", ".OYYYYYYYO..", ".OOOOOYYO...", "....OYYO....", "...OYYO.....", "..OYYO......", "..OYO.......", "..OO........"]}, "arcenciel": {"pal": {"R": "#ff4d4d", "A": "#ff9f1c", "Y": "#ffe14d", "G": "#3ddc84", "B": "#3aa0ff", "V": "#9b5cff", "W": "#ffffff"}, "rows": ["............", "...RRRRRR...", "..RAAAAAAR..", ".RAYYYYYYAR.", "RAYGGGGGGYAR", "RAYGBBBBGYAR", "RAYGBVVBGYAR", "RAYGBV.VBGYA", "WWWGBV..WWWW", "WWWWW...WWWW", ".WWW.....WW.", "............"]}, "fleur": {"pal": {"O": "#7a1f5c", "P": "#ff8fd1", "Y": "#ffd23f", "G": "#3ba55c", "D": "#1f6b38"}, "rows": ["....OOO.....", "...OPPPO....", ".OOOPPPOOO..", "OPPPOYOPPPO.", "OPPPYYYPPPO.", ".OOOOYOOOO..", "...OPPPO....", "....OOO.....", ".....G..DD..", "..DD.G.DGD..", "..DGDGDD....", ".....G......"]}, "chat": {"pal": {"O": "#3a2a1e", "A": "#ffa94d", "W": "#fff4e6", "P": "#ff8fa3", "K": "#1a1a1a"}, "rows": ["O.........O.", "OO.......OO.", "OAO.....OAO.", "OAAOOOOOAAO.", "OAAAAAAAAAO.", "OAKAAAAAKAO.", "OAKAAAAAKAO.", "OAAAWPWAAAO.", ".OAAWWWAAO..", "..OOAAAOO...", "....OOO.....", "............"]}, "chien": {"pal": {"O": "#3a2a1e", "B": "#c98b52", "D": "#7a4a24", "W": "#fff4e6", "K": "#1a1a1a", "P": "#ff6b81"}, "rows": [".OO.....OO..", "ODDO...ODDO.", "ODDOOOOODDO.", "ODDBBBBBDDO.", "ODBKBBBKBDO.", ".OBBBBBBBO..", ".OBBWWWBBO..", ".OBWWKWWBO..", "..OWWWWWO...", "..OOWPWOO...", "....OPO.....", ".....O......"]}, "renard": {"pal": {"O": "#4a1e00", "A": "#ff7a1a", "W": "#ffffff", "K": "#1a1a1a"}, "rows": ["O.........O.", "OO.......OO.", "OAO.....OAO.", "OAAOOOOOAAO.", "OAAAAAAAAAO.", "OWAKAAAKAWO.", "OWWAAAAAWWO.", ".OWWWWWWWO..", "..OWWWWWO...", "...OWKWO....", "....OOO.....", "............"]}, "hibou": {"pal": {"O": "#2e1f12", "B": "#8b5a2b", "L": "#c08a52", "W": "#ffffff", "K": "#1a1a1a", "Y": "#ffb703"}, "rows": [".O.......O..", ".OO.....OO..", ".OBOOOOOBO..", "OBWWWBWWWBO.", "OBWKWBWKWBO.", "OBWWWYWWWBO.", "OBBBBYBBBBO.", "OBLBLBLBLBO.", "OBBLBLBLBBO.", ".OBBBBBBBO..", "..OYO.OYO...", "............"]}, "grenouille": {"pal": {"O": "#123d1c", "G": "#4cd964", "D": "#2a9d4b", "W": "#ffffff", "K": "#1a1a1a", "P": "#ff8fa3"}, "rows": ["............", ".OOO...OOO..", "OWWWO.OWWWO.", "OWKWOOOWKWO.", "OGGGGGGGGGO.", "OGGGGGGGGGO.", "OGPGGGGGPGO.", "OGOGGGGGOGO.", ".OGOOOOOGO..", ".ODGGGGGDO..", "OGOOOOOOOGO.", "OO.......OO."]}, "poisson": {"pal": {"O": "#0b3d5c", "B": "#3aa0ff", "L": "#9ad4ff", "W": "#ffffff", "K": "#1a1a1a", "Y": "#ffd23f"}, "rows": ["............", "....OOOO....", "..OOBBBBOO..", ".OBBLBBBBO.O", "OBWKBLBBBBOO", "OBBBBBLBBBBO", "OBBBBBBLBBBO", ".OBBBBBBBBOO", "..OOBBBBOO.O", "....OYYO....", ".....OO.....", "............"]}, "papillon": {"pal": {"O": "#2a1d3a", "P": "#c084fc", "M": "#f472b6", "Y": "#fde047", "K": "#1a1a1a"}, "rows": ["..O.....O...", "...O...O....", "OOO.O.O.OOO.", "OPPOOKOOPPO.", "OPYPMKMPYPO.", "OPPPMKMPPPO.", ".OPPOKOPPO..", ".OMMOKOMMO..", "OMYMOKOMYMO.", "OMMO.K.OMMO.", ".OO.....OO..", "............"]}, "champignon": {"pal": {"O": "#4a0f0f", "R": "#e63946", "W": "#ffffff", "C": "#f5e6c8", "K": "#1a1a1a"}, "rows": ["....OOOO....", "..OORRRROO..", ".ORRWWRRRRO.", ".ORWWWRRWRO.", "ORRWWRRWWWRO", "ORRRRRRRWWRO", "OOOOOOOOOOOO", "...OCCCCO...", "...OCCCCO...", "...OCCCCO...", "...OCCCCO...", "....OOOO...."]}, "gateau": {"pal": {"O": "#4a2a14", "C": "#ffe0ef", "P": "#ff8fd1", "B": "#c98b52", "Y": "#ffd23f", "R": "#e63946"}, "rows": [".....Y......", ".....R......", ".....O......", "..OOOOOOO...", ".OCCCCCCCO..", ".OPCPCPCPO..", ".OBBBBBBBO..", ".OCCCCCCCO..", ".OBBBBBBBO..", ".OBBBBBBBO..", "OOOOOOOOOOO.", "............"]}, "fusee": {"pal": {"O": "#1f2a44", "W": "#eef3ff", "R": "#ff4d4d", "B": "#3aa0ff", "Y": "#ffd23f", "A": "#ff9f1c"}, "rows": [".....OO.....", "....ORRO....", "....OWWO....", "...OWBBWO...", "...OWBBWO...", "...OWWWWO...", "..OROWWORO..", ".ORRWWWWRRO.", ".OO.OOOO.OO.", ".....YY.....", "....YAAY....", ".....AA....."]}, "pouce": {"pal": {"O": "#5a3a1a", "S": "#ffd6a5", "D": "#e8a96b", "B": "#3aa0ff"}, "rows": ["....OO......", "...OSSO.....", "...OSSO.....", "..OSSO......", "OOOSSOOOOO..", "OBOSSSSSSSO.", "OBOSSSSSSDO.", "OBOSSSSSSO..", "OBOSSSSSSDO.", "OBOSSSSSSO..", "OOOODDDDO...", "....OOOO...."]}, "sourire": {"pal": {"O": "#7a4a00", "Y": "#ffd23f", "K": "#3a2400", "P": "#ff8fa3", "W": "#fff6c2"}, "rows": ["....OOOO....", "..OOYYYYOO..", ".OYWYYYYYYO.", ".OYYKYYKYYO.", "OYYYKYYKYYYO", "OYYYYYYYYYYO", "OYPYYYYYYPYO", "OYYKYYYYKYYO", ".OYYKKKKYYO.", ".OYYYYYYYYO.", "..OOYYYYOO..", "....OOOO...."]}, "trophee": {"pal": {"O": "#5a3a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#e0a100", "B": "#7a4a24"}, "rows": ["OOOOOOOOOOOO", "OYYWYYYYYYDO", "OYOWYYYYYDOO", "OYOYYYYYYDYO", ".OOYYYYYYDO.", "...OYYYYDO..", "....OYYDO...", ".....OYO....", ".....OYO....", "....OYYDO...", "...OBBBBBO..", "...OOOOOOO.."]}, "couronne": {"pal": {"O": "#5a3a00", "Y": "#ffd23f", "D": "#e0a100", "R": "#e63946", "B": "#3aa0ff", "W": "#fff6c2"}, "rows": ["............", "O....O....O.", "OO..OYO..OO.", "OYO.OYO.OYO.", "OYYOYYYOYYO.", "OYWYYYYYYDO.", "OYYYYYYYYDO.", "OYRYYBYYRDO.", "OYYYYYYYYDO.", "ODDDDDDDDDO.", "OOOOOOOOOOO.", "............"]}, "cristal": {"pal": {"O": "#1d3557", "B": "#48cae4", "L": "#ade8f4", "W": "#ffffff", "D": "#0077b6"}, "rows": ["............", "...OOOOOO...", "..OLWLLBBO..", ".OLWLLBBBDO.", "OOOOOOOOOOOO", "OLLBBBBBBDDO", ".OLLBBBBBDO.", "..OLBBBBDO..", "...OLBBDO...", "....OLDO....", ".....OO.....", "............"]}, "cerise": {"pal": {"O": "#4a0f0f", "R": "#e63946", "W": "#ffd0d8", "G": "#3ba55c", "D": "#1f6b38"}, "rows": ["........DD..", ".......DGGD.", "......D.DD..", ".....D..D...", "....D....D..", "..OOO...OOO.", ".ORRRO.ORRRO", "ORWRRROWRRRO", "ORRRRROORRRO", "ORRRRRO.OOO.", ".OOOOO......", "............"]}, "citron": {"pal": {"O": "#6b5a00", "Y": "#ffe14d", "W": "#fffbe0", "D": "#e0c200", "G": "#3ba55c"}, "rows": ["............", "........GG..", "....OOOOG...", "..OOYYYYOO..", ".OYWWYYYYYO.", "OYWYYYYYYYDO", "OYYYYYYYYYDO", "OYYYYYYYYDDO", ".OYYYYYYDDO.", "..OODDDDOO..", "....OOOO....", "............"]}, "raisin": {"pal": {"O": "#2a0f3a", "V": "#9b5cff", "L": "#c9a8ff", "G": "#3ba55c"}, "rows": [".....GG.....", "....G.......", "..OO.OO.OO..", ".OLVOLVOLVO.", ".OVVOVVOVVO.", "..OOLVOLVO..", "...OVVOVVO..", "....OOLVO...", ".....OVVO...", "......OO....", "............", "............"]}, "cloche": {"pal": {"O": "#5a3a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#e0a100"}, "rows": [".....OO.....", "....OYYO....", "...OYWYYO...", "..OYWYYYDO..", "..OYWYYYDO..", "..OYYYYYDO..", ".OYYYYYYYDO.", ".OYYYYYYYDO.", "OYYYYYYYYYDO", "OOOOOOOOOOOO", ".....OO.....", "............"]}, "sept": {"pal": {"O": "#5a0000", "R": "#ff3b3b", "W": "#ffd0d0"}, "rows": ["............", "OOOOOOOOOOO.", "ORWWWWWWWRO.", "ORRRRRRRRRO.", "OOOOOOORRO..", "......ORRO..", ".....ORRO...", ".....ORRO...", "....ORRO....", "....ORRO....", "....OOOO....", "............"]}, "geo": {"pal": {"O": "#6b4a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#e0a100", "B": "#b07800"}, "rows": ["....OOOO....", "..OOYYYYOO..", ".OYWYYYYYDO.", ".OWYYOOYYDO.", "OYYYOWDOYYDO", "OYYOWWDDOYDO", "OYYODDDBOYDO", "OYYYODBOYYDO", ".OYYYOOYYDO.", ".OYYYYYYDBO.", "..OOBBBBOO..", "....OOOO...."]}}, "autocollants": [["etoile", "Étoile", 150, "Étoiles et ciel"], ["etoiles", "Constellation", 300, "Étoiles et ciel"], ["soleil", "Soleil", 250, "Étoiles et ciel"], ["lune", "Lune", 250, "Étoiles et ciel"], ["nuage", "Nuage", 200, "Étoiles et ciel"], ["eclair", "Éclair", 300, "Étoiles et ciel"], ["arcenciel", "Arc-en-ciel", 600, "Étoiles et ciel"], ["coeur", "Cœur", 150, "Cœurs et fleurs"], ["coeurs", "Deux cœurs", 300, "Cœurs et fleurs"], ["fleur", "Fleur", 300, "Cœurs et fleurs"], ["sourire", "Sourire", 200, "Cœurs et fleurs"], ["chat", "Chat", 800, "Animaux"], ["chien", "Chien", 800, "Animaux"], ["renard", "Renard", 1000, "Animaux"], ["hibou", "Hibou", 1000, "Animaux"], ["grenouille", "Grenouille", 900, "Animaux"], ["poisson", "Poisson", 700, "Animaux"], ["papillon", "Papillon", 900, "Animaux"], ["champignon", "Champignon", 500, "Objets"], ["gateau", "Gâteau", 600, "Objets"], ["pouce", "Bravo", 400, "Objets"], ["fusee", "Fusée", 1500, "Objets"], ["trophee", "Trophée", 2500, "Objets"], ["cristal", "Cristal", 5000, "Objets"], ["couronne", "Couronne", 10000, "Objets"]], "geos": {"depart": 500, "plafond": 50000, "mise_min": 10, "mise_max": 1000, "mises": [10, 50, 100, 500, 1000], "max_visibles": 3, "delai": [9, 22], "duree": 45, "valeur": [8, 40], "gros": [80, 160], "p_gros": 0.08, "echeance": 10}, "jeux": [["roulette", "Roulette", "Couleur ×2 · douzaine ×3 · numéro ×36"], ["machine", "Machine à sous", "Trois pareils jusqu'à ×100 · deux cerises ×3"], ["pile", "Pile ou face", "Bonne face : ×1,9"], ["des", "Dés", "Plus haut ou plus bas que 7 : ×2,28 · sept : ×5,7"], ["blackjack", "Blackjack", "Victoire ×2 · blackjack ×2,5 · égalité : mise rendue"], ["grattage", "Grattage", "Trois symboles pareils : jusqu'à ×50"]], "pile": 1.9, "des": {"bas": 2.28, "sept": 5.7, "haut": 2.28}, "rouges": [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], "roulette": {"couleur": 2, "douzaine": 3, "numero": 36}, "rouleaux": [["cerise", 7], ["citron", 6], ["raisin", 5], ["cloche", 3], ["etoile", 2], ["sept", 1]], "machine": {"sept": 100, "etoile": 50, "cloche": 20, "raisin": 12, "citron": 8, "cerise": 4}, "cerises": {"2": 3}, "grattage": [[50, 0.002, "couronne"], [10, 0.01, "trophee"], [5, 0.04, "cristal"], [3, 0.05, "etoile"], [2, 0.1, "coeur"], [1, 0.2, "champignon"]], "grattage_autres": ["lune", "nuage", "fusee", "fleur"], "bj": {"blackjack": 2.5, "gagne": 2, "egalite": 1}};
/* </JX> */
Object.assign(SPRITES, JX.sprites);
const GJ = JX.geos;
ICONES.jeux = [["r", 4, 4, 20, 20, 4], ["d", 8.6, 8.6, 1.5], ["d", 15.4, 8.6, 1.5], ["d", 12, 12, 1.5], ["d", 8.6, 15.4, 1.5], ["d", 15.4, 15.4, 1.5]];
const AC_TAILLE = 90;              // taille d'un autocollant sur une page de cahier (unités de page : 1000 = largeur)
const AC_TAILLE_TEXTE = 56;        // sur une note texte (pixels, × taille du texte)

function fmtGeos(n) { return String(Math.max(0, Math.floor(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
/* version courte pour la barre de navigation : 9 999, puis 12,3k, puis 1,2M */
function fmtGeosCourt(n) {
  n = Math.max(0, Math.floor(Number(n) || 0));
  if (n < 10000) return fmtGeos(n);
  if (n < 1e6) return (Math.floor(n / 100) / 10).toString().replace(".", ",") + "k";
  return (Math.floor(n / 1e5) / 10).toString().replace(".", ",") + "M";
}
function fmtMult(x) { return "×" + String(x).replace(".", ","); }
function alea(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
function aleaReel() { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
function imgSprite(nom, k = 3, classe = "") { return el("img.ico-pixel" + classe, {src: spriteURL(nom, k), alt: "", draggable: "false"}); }
function nomAutocollant(s) { const a = JX.autocollants.find(x => x[0] === s); return a ? a[1] : s; }
function animationsJeux(app) { return (app || window.app).reglages.jeux_anim !== false && !(typeof Decor !== "undefined" && Decor.reduit); }

/* ---------- comptes : un compteur par appareil (section gx_<appareil>), que seul cet appareil modifie */
const Geos = {
  id(app) { return String(app.sync.cfg.appareil || "ipad"); },
  compte(app) {
    const d = app.donnees;
    if (!d.geos || typeof d.geos !== "object" || Array.isArray(d.geos)) d.geos = {};
    const id = this.id(app);
    return (d.geos[id] = normaliserCompteGeo(d.geos[id]));
  },
  solde(d) {
    let s = GJ.depart;                                   // bonus de bienvenue, compté une seule fois
    for (const e of Object.values((d && d.geos) || {})) if (e && typeof e === "object") s += entierPositif(e.g) - entierPositif(e.d);
    return Math.max(0, s);
  },
  jour() { return iso(new Date()); },
  /* géos ramassés aujourd'hui, tous appareils confondus (remis à zéro à minuit, heure locale) */
  ramasses(d) {
    const j = this.jour(); let s = 0;
    for (const e of Object.values((d && d.geos) || {})) if (e && e.j === j) s += entierPositif(e.r);
    return s;
  },
  plafondAtteint(d) { return this.ramasses(d) >= GJ.plafond; },
  /* ajoute des géos ; « ramasse » : compte dans le plafond du jour. Renvoie ce qui a vraiment été ajouté. */
  gagner(app, n, ramasse) {
    n = entierPositif(n);
    if (!n || !app.donnees) return 0;
    if (ramasse) {
      n = Math.min(n, GJ.plafond - this.ramasses(app.donnees));
      if (n <= 0) return 0;
    }
    const e = this.compte(app);
    if (ramasse) { const j = this.jour(); if (e.j !== j) { e.j = j; e.r = 0; } e.r += n; }
    e.g += n;
    app.sauver();
    this.maj(app);
    return n;
  },
  /* retire une mise ou un achat ; refusé si le solde ne suffit pas (le solde ne devient jamais négatif) */
  depenser(app, n) {
    n = entierPositif(n);
    if (!n || !app.donnees || n > this.solde(app.donnees)) return false;
    this.compte(app).d += n;
    app.sauver();
    this.maj(app);
    return true;
  },
  achats(d) {
    const out = {};
    for (const e of Object.values((d && d.geos) || {})) for (const [k, v] of Object.entries((e && e.a) || {})) out[k] = (out[k] || 0) + entierPositif(v);
    return out;
  },
  colles(d) {
    const out = {};
    for (const n of (d && d.notes) || []) for (const a of autocollantsNote(n)) out[a.s] = (out[a.s] || 0) + 1;
    return out;
  },
  /* inventaire = autocollants achetés (tous appareils) − autocollants collés sur des notes */
  inventaire(d) {
    const a = this.achats(d), c = this.colles(d), out = {};
    for (const [k, v] of Object.entries(a)) out[k] = Math.max(0, v - (c[k] || 0));
    return out;
  },
  acheter(app, s) {
    const art = JX.autocollants.find(x => x[0] === s);
    if (!art || !this.depenser(app, art[2])) return false;
    const e = this.compte(app);
    e.a[s] = (e.a[s] || 0) + 1;
    app.sauver();
    return true;
  },
  /* met à jour tous les compteurs affichés */
  maj(app) {
    if (!app || !app.donnees) return;
    const t = fmtGeos(this.solde(app.donnees));
    document.querySelectorAll(".geos-solde").forEach(x => { x.textContent = t; });
    const c = fmtGeosCourt(this.solde(app.donnees));
    document.querySelectorAll(".geos-court").forEach(x => { x.textContent = c; x.parentNode.title = `${t} géos : touche pour ouvrir la boutique`; });
    if (app.ecrans && app.ecrans.jeux && app.page === "jeux") app.ecrans.jeux.majEntete();
  },
  pulser() {
    if (!animationsJeux()) return;
    document.querySelectorAll(".rail-geos, .geo").forEach(b => { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); });
  },
};

/* ---------- sons des jeux (Web Audio, coupés par le réglage « Son » de Mini-jeux) */
const SonJeux = {
  jouer(genre) {
    const app = window.app;
    if (!app || app.reglages.jeux_son === false || !Son.ctx) return;
    const c = Son.ctx, t0 = c.currentTime;
    const notes = {geo: [[1320, .07], [1760, .1]], gain: [[660, .09], [880, .09], [1100, .09], [1320, .16]], perte: [[300, .12], [220, .2]], tic: [[1400, .025]], achat: [[880, .08], [1320, .12]]}[genre] || [];
    let t = t0;
    for (const [f, d] of notes) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = genre === "perte" ? "square" : "triangle"; o.frequency.value = f;
      const v = genre === "perte" ? .05 : genre === "tic" ? .06 : .14;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
      t += d * .9;
    }
  },
};

/* ---------- géos qui apparaissent dans l'appli (discrets : petits, quelques-uns à la fois, léger scintillement) */
const Apparitions = {
  app: null, liste: [], t: null,
  CIBLES: ".carte, .bloc, .tuile, .feuille, .chip, .doc-texte-ed, .panneau-jour, .ech-ligne, .an-doc, .acc-maint, .jx-tuile",
  demarrer(app) { this.app = app; this.planifier(); },
  planifier() {
    clearTimeout(this.t);
    const [a, b] = GJ.delai;
    this.t = setTimeout(() => this.essayer(), (a + aleaReel() * (b - a)) * 1000);
  },
  actif() {
    const app = this.app;
    return !!(app && app.interfacePrete && app.donnees && app.reglages.geos_apparition !== false && !document.hidden && !Pile.length && !Geos.plafondAtteint(app.donnees));
  },
  essayer() {
    try {
      this.liste = this.liste.filter(b => b.isConnected);
      if (this.actif() && this.liste.length < GJ.max_visibles) this.creer();
    } catch (e) { Stock.journal("apparition d'un géo", e); }
    this.planifier();
  },
  position() {
    const ecran = document.querySelector(".ecran:not([hidden])");
    if (!ecran) return null;
    const W = innerWidth, H = innerHeight, rail = document.querySelector(".rail"), rr = rail ? rail.getBoundingClientRect() : null;
    const zones = [...ecran.querySelectorAll(this.CIBLES)].map(x => x.getBoundingClientRect())
      .filter(r => r.width >= 40 && r.height >= 30 && r.right > 20 && r.bottom > 20 && r.left < W - 20 && r.top < H - 20);
    if (!zones.length) zones.push(ecran.getBoundingClientRect());
    for (let essai = 0; essai < 8; essai++) {
      const r = zones[alea(zones.length)];
      const x0 = Math.max(r.left, 14) + 10, x1 = Math.min(r.right, W - 14) - 10, y0 = Math.max(r.top, 14) + 10, y1 = Math.min(r.bottom, H - 14) - 10;
      if (x1 <= x0 || y1 <= y0) continue;
      const x = x0 + aleaReel() * (x1 - x0), y = y0 + aleaReel() * (y1 - y0);
      if (rr && x > rr.left - 12 && x < rr.right + 12 && y > rr.top - 12 && y < rr.bottom + 12) continue;      // jamais sur la barre de navigation
      if (this.liste.some(b => Math.hypot(b._x - x, b._y - y) < 60)) continue;
      return {x, y};
    }
    return null;
  },
  creer() {
    const p = this.position();
    if (!p) return;
    const gros = aleaReel() < GJ.p_gros, [a, b] = gros ? GJ.gros : GJ.valeur;
    const v = a + alea(b - a + 1);
    const g = el("button.geo-pick" + (gros ? ".gros" : "") + (animationsJeux(this.app) ? "" : ".calme"), {type: "button", title: "Géo : touche-le pour le ramasser", "aria-label": "Ramasser un géo",
      style: {left: p.x + "px", top: p.y + "px"}}, imgSprite("geo", 2));
    g._v = v; g._x = p.x; g._y = p.y;
    g.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); this.ramasser(g); });
    g.addEventListener("click", (e) => e.stopPropagation());
    document.body.append(g);
    this.liste.push(g);
    g._t = setTimeout(() => this.retirer(g, true), GJ.duree * 1000);
  },
  retirer(g, fondu) {
    clearTimeout(g._t);
    this.liste = this.liste.filter(x => x !== g);
    if (!g.isConnected) return;
    if (fondu && animationsJeux(this.app)) { g.classList.add("part"); setTimeout(() => g.remove(), 400); } else g.remove();
  },
  ramasser(g) {
    if (g._pris) return;
    g._pris = true;
    const n = Geos.gagner(this.app, g._v, true);
    this.retirer(g, false);
    if (n > 0) { gainVolant(g._x, g._y, n); SonJeux.jouer("geo"); Geos.pulser(); }
    else Notifs.bulle("Plafond du jour atteint : les géos reviennent demain.");
  },
  vider() { for (const g of this.liste.slice()) this.retirer(g, false); },
};
/* « +25 » qui monte et s'efface à l'endroit du géo ramassé */
function gainVolant(x, y, n, classe = "") {
  if (!animationsJeux()) return;
  const b = el("div.geo-volant" + classe, {"aria-hidden": "true", style: {left: x + "px", top: y + "px"}}, imgSprite("geo", 2), el("b", {texte: "+" + fmtGeos(n)}));
  document.body.append(b);
  setTimeout(() => b.remove(), 1100);
}

/* ---------- boutique */
class Boutique extends Modal {
  constructor(app) {
    super("Boutique", "Achète des autocollants avec tes géos, puis colle-les dans tes notes.", {classe: "large"});
    this.app = app;
    this.carte.classList.add("boutique");
    this.zone = el("div.bq-zone");
    this.carte.append(this.zone);
    this.barre([], [bouton("Fermer", () => this.fermer(), "primary")]);
    this.dessiner();
  }
  dessiner() {
    const app = this.app, d = app.donnees, solde = Geos.solde(d), inv = Geos.inventaire(d), ach = Geos.achats(d), ram = Geos.ramasses(d);
    const z = this.zone; z.innerHTML = "";
    z.append(el("div.bq-tete", null,
      el("div.bq-solde", null, imgSprite("geo", 3), el("b.geos-solde", {texte: fmtGeos(solde)}), el("span.muted", {texte: "géos"})),
      el("div.bq-jour.petit.muted", {texte: `Ramassés aujourd'hui : ${fmtGeos(ram)} / ${fmtGeos(GJ.plafond)}`}),
      ram >= GJ.plafond ? el("div.bq-plafond.petit", {texte: "Plafond du jour atteint : les géos ne réapparaîtront que demain."}) : null));
    const rangees = [];
    for (const a of JX.autocollants) if (!rangees.includes(a[3])) rangees.push(a[3]);
    for (const r of rangees) {
      const g = el("div.bq-grille");
      for (const [s, nom, prix, rr] of JX.autocollants) {
        if (rr !== r) continue;
        const possede = ach[s] || 0, libre = inv[s] || 0;
        const b = bouton("", () => {
          if (!Geos.acheter(app, s)) { this.erreur(`Il manque ${fmtGeos(prix - Geos.solde(app.donnees))} géos pour « ${nom} ».`); return; }
          this.erreur(""); SonJeux.jouer("achat"); Notifs.bulle(`« ${nom} » ajouté à ton inventaire.`); this.dessiner();
        }, prix <= solde ? "primary" : "ghost");
        b.classList.add("petit", "bq-prix");
        b.append(imgSprite("geo", 1), el("span", {texte: fmtGeos(prix)}));
        if (prix > solde) b.classList.add("trop-cher");
        g.append(el("div.carte.bq-art", null, imgSprite(s, 4, ".bq-img"), el("b", {texte: nom}),
          el("span.petit.muted", {texte: possede ? `${libre} dans l'inventaire · ${possede - libre} collé${possede - libre > 1 ? "s" : ""}` : "Pas encore à toi"}), b));
      }
      z.append(etiquette(r), g);
    }
  }
}

/* inventaire : choisir un autocollant à coller (répond l'id, ou null) */
function choisirAutocollant(app) {
  return new Promise((res) => {
    const m = new Modal("Mes autocollants", "Choisis un autocollant : il se pose sur la note, puis glisse-le où tu veux.");
    const inv = Geos.inventaire(app.donnees), g = el("div.bq-grille.ac-choix");
    let fait = false;
    const finir = (v) => { if (!fait) { fait = true; res(v); } };
    for (const [s, nom] of JX.autocollants) {
      if (!inv[s]) continue;
      g.append(el("button.carte.bq-art.ac-pick", {type: "button", onclick: () => { finir(s); m.fermer(); }}, imgSprite(s, 4, ".bq-img"), el("b", {texte: nom}), el("span.petit.muted", {texte: `× ${inv[s]}`})));
    }
    if (!g.children.length) m.carte.append(el("p.muted", {texte: "Ton inventaire est vide. Achète des autocollants dans la boutique avec tes géos."}));
    else m.carte.append(g);
    m.barre([bouton("Boutique", () => { finir(null); m.fermer(); new Boutique(app).montrer(); }, "ghost")], [bouton("Fermer", () => { finir(null); m.fermer(); }, "primary")]);
    const vieux = m.fermer.bind(m);
    m.fermer = () => { vieux(); finir(null); };
    m.montrer();
  });
}
function boutonAutocollants(action) {
  const b = bouton("", action, "ghost", {title: "Coller un autocollant"});
  b.classList.add("btn-ico", "btn-ac");
  b.append(imgSprite("etoile", 2), el("span", {texte: "Autocollants"}));
  return b;
}

/* ---------- autocollants posés sur une note : {id, s, p (id de page ; "" pour une note texte), x, y, t} */
function normaliserAutocollant(a) {
  if (!a || typeof a !== "object" || typeof a.s !== "string") return null;
  const r = (v) => Math.round((Number(v) || 0) * 10) / 10;
  return {id: String(a.id || newId()), s: a.s, p: String(a.p || ""), x: r(a.x), y: r(a.y), t: Math.max(30, Math.min(400, Math.round(Number(a.t) || AC_TAILLE)))};
}
function autocollantsNote(n) {
  if (!n || !Array.isArray(n.autocollants)) return [];
  const ids = new Set((n.pages || []).map(p => p.id));
  return n.autocollants.filter(a => a && SPRITES[a.s] && (n.type === "cahier" ? ids.has(a.p) : !a.p));
}
/* zone glissable d'un autocollant (doigt, Apple Pencil ou souris) ; un appui le choisit (bouton ✕ pour le retirer) */
function zoneAutocollant(a, rappels) {
  const x = el("button.ac-x", {type: "button", title: "Retirer (il retourne dans l'inventaire)", "aria-label": "Retirer l'autocollant"}, "✕");
  const z = el("div.ac-zone", {"data-id": a.id}, imgSprite(a.s, 4, ".ac-img"), x);
  z._ac = a;
  x.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); rappels.retirer(z._ac); });
  let g = null;
  z.addEventListener("pointerdown", (e) => {
    if (e.button > 0 || e.target === x) return;
    e.preventDefault(); e.stopPropagation();
    try { z.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    g = {id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: z._ac.x, y0: z._ac.y, deplace: false};
    rappels.debut(g);
    z.classList.add("saisi");
  });
  z.addEventListener("pointermove", (e) => {
    if (!g || g.id !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (!g.deplace && Math.hypot(dx, dy) <= 6) return;
    g.deplace = true;
    rappels.bouge(z._ac, g, dx, dy);
  });
  const fin = (e, annule) => {
    if (!g || g.id !== e.pointerId) return;
    const gg = g; g = null;
    z.classList.remove("saisi");
    try { z.releasePointerCapture(e.pointerId); } catch (er) { /* */ }
    rappels.fin(z._ac, gg, annule);
  };
  z.addEventListener("pointerup", (e) => fin(e, false));
  z.addEventListener("pointercancel", (e) => fin(e, true));
  z.addEventListener("lostpointercapture", (e) => fin(e, false));
  z.addEventListener("contextmenu", (e) => e.preventDefault());
  return z;
}

/* ---------- application « Mini-jeux » */
const SYMBOLES_ROULEAU = JX.rouleaux.map(r => r[0]);
function tirerRouleau() {
  let t = alea(JX.rouleaux.reduce((s, r) => s + r[1], 0));
  for (const [s, w] of JX.rouleaux) { if (t < w) return s; t -= w; }
  return JX.rouleaux[0][0];
}
function gainMachine(r) {
  if (r[0] === r[1] && r[1] === r[2]) return JX.machine[r[0]] || 0;
  return JX.cerises[String(r.filter(s => s === "cerise").length)] || 0;
}
function couleurRoulette(n) { return n === 0 ? "vert" : JX.rouges.includes(n) ? "rouge" : "noir"; }
function carteHasard() { return {r: 1 + alea(13), c: alea(4)}; }
function valeurMain(m) {
  let t = 0, as = false;
  for (const c of m) { t += Math.min(10, c.r); if (c.r === 1) as = true; }
  return as && t + 10 <= 21 ? t + 10 : t;
}
const RANGS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "R"], ENSEIGNES = ["♠", "♥", "♦", "♣"];
function carteGrattage() {
  let r = aleaReel(), gagnant = null;
  for (const [m, p, s] of JX.grattage) { if (r < p) { gagnant = [m, s]; break; } r -= p; }
  const tous = JX.grattage.map(g => g[2]).concat(JX.grattage_autres);
  const cases = gagnant ? [gagnant[1], gagnant[1], gagnant[1]] : [];
  const compte = {};
  while (cases.length < 6) {
    const choix = tous.filter(s => (!gagnant || s !== gagnant[1]) && (compte[s] || 0) < 2);
    const s = choix[alea(choix.length)];
    compte[s] = (compte[s] || 0) + 1; cases.push(s);
  }
  for (let i = cases.length - 1; i > 0; i--) { const j = alea(i + 1); [cases[i], cases[j]] = [cases[j], cases[i]]; }
  return {cases, mult: gagnant ? gagnant[0] : 0, symbole: gagnant ? gagnant[1] : ""};
}

class PageJeux {
  constructor(app) { this.app = app; this.el = el("div.ecran.ecran-defile.ecran-jeux"); this.etats = {roulette: {histo: []}}; this.occupe = false; this.msg = null; }
  get reg() { return this.app.reglages; }
  jeu() { const j = this.reg.jeux_choix; return JX.jeux.some(x => x[0] === j) ? j : "roulette"; }
  mise() { const m = parseInt(this.reg.jeux_mise); return isNaN(m) ? 50 : Math.max(GJ.mise_min, Math.min(GJ.mise_max, m)); }
  regler(k, v) { this.reg[k] = v; this.app.enregistrerLocal(); }
  rafraichir() {
    if (this.occupe) { this.majEntete(); return; }
    const z = this.el, app = this.app;
    z.innerHTML = "";
    this.lblSolde = el("b.geos-solde", {texte: fmtGeos(Geos.solde(app.donnees))});
    this.lblJour = el("div.petit.muted.jx-jour");
    z.append(el("header.jx-entete", null,
      el("div", null, el("div.mono.muted", {texte: "CASINO DES GÉOS"}), el("h1.page-h1", {texte: "Mini-jeux"}), this.lblJour),
      el("div.jx-porte", null, el("div.jx-solde", null, imgSprite("geo", 3), this.lblSolde, el("span.muted", {texte: "géos"})),
        boutonIcone("etoile", "Boutique", () => new Boutique(app).montrer(), "primary"))));
    // mise
    this.zMise = el("div.carte.jx-mise");
    z.append(this.zMise);
    this.dessinerMise();
    // choix du jeu
    const choix = el("div.jx-choix");
    for (const [k, nom, desc] of JX.jeux) {
      choix.append(el("button.carte.jx-tuile" + (k === this.jeu() ? ".on" : ""), {type: "button", onclick: () => { if (this.occupe) return; this.regler("jeux_choix", k); this.msg = null; this.rafraichir(); }},
        el("span.jx-tuile-ico", null, imgSprite({roulette: "cristal", machine: "sept", pile: "geo", des: "sourire", blackjack: "couronne", grattage: "trophee"}[k], 3)),
        el("b", {texte: nom}), el("span.petit.muted", {texte: desc})));
    }
    z.append(choix);
    // zone de jeu
    this.zJeu = el("section.carte.jx-zone");
    this.zMsg = el("div.jx-msg");
    z.append(this.zJeu);
    this["jeu_" + this.jeu()](this.zJeu);
    this.zJeu.append(this.zMsg);
    if (this.msg) this.message(...this.msg);
    // options propres à cet appareil
    const opt = el("div.jx-options");
    opt.append(caseACocher(this.reg.jeux_son !== false, (v) => this.regler("jeux_son", v), "Son"),
      caseACocher(this.reg.jeux_anim !== false, (v) => this.regler("jeux_anim", v), "Animations"),
      caseACocher(this.reg.geos_apparition !== false, (v) => { this.regler("geos_apparition", v); if (!v) Apparitions.vider(); }, "Géos qui apparaissent dans l'appli"));
    z.append(opt, el("p.petit.muted.jx-pied", {texte: `Les géos apparaissent un peu partout dans l'appli (cases de l'horaire, notes, panneaux) : touche-les pour les ramasser. Au plus ${fmtGeos(GJ.plafond)} géos ramassés par jour ; les gains des jeux ne comptent pas dans ce plafond. Mise de ${GJ.mise_min} à ${fmtGeos(GJ.mise_max)} géos.`}));
    this.majEntete();
  }
  majEntete() {
    if (!this.lblSolde || !this.app.donnees) return;
    this.lblSolde.textContent = fmtGeos(Geos.solde(this.app.donnees));
    const r = Geos.ramasses(this.app.donnees);
    this.lblJour.textContent = r >= GJ.plafond ? `Plafond du jour atteint (${fmtGeos(GJ.plafond)} géos ramassés) : retour des géos demain.` : `Ramassés aujourd'hui : ${fmtGeos(r)} / ${fmtGeos(GJ.plafond)}`;
  }
  dessinerMise() {
    const z = this.zMise, m = this.mise();
    z.innerHTML = "";
    const val = el("b.jx-mise-val", {texte: fmtGeos(m)});
    const rapides = el("div.rapides");
    for (const v of GJ.mises) rapides.append(petit(fmtGeos(v), () => { this.regler("jeux_mise", v); this.dessinerMise(); }, v === m ? "tab_on" : "ghost"));
    const curseur = el("input.jx-curseur", {type: "range", min: String(GJ.mise_min), max: String(GJ.mise_max), step: "10", value: String(m),
      oninput: (e) => { val.textContent = fmtGeos(e.target.value); }, onchange: (e) => { this.regler("jeux_mise", parseInt(e.target.value)); this.dessinerMise(); }});
    z.append(el("div.jx-mise-tete", null, el("span.etiquette", {texte: "MISE"}), val, imgSprite("geo", 1)), rapides, curseur);
  }
  /* débite la mise ; 0 si refusée */
  miser() {
    const m = this.mise(), s = Geos.solde(this.app.donnees);
    if (m < GJ.mise_min || m > GJ.mise_max) { this.message(`La mise doit être entre ${GJ.mise_min} et ${fmtGeos(GJ.mise_max)} géos.`, "refus"); return 0; }
    if (m > s) { this.message(`Solde insuffisant : il te reste ${fmtGeos(s)} géos (mise : ${fmtGeos(m)}).`, "refus"); return 0; }
    if (!Geos.depenser(this.app, m)) return 0;
    this.majEntete();
    return m;
  }
  /* paie le résultat (mult = 0 : perdu) et l'annonce */
  payer(mise, mult, detail = "") {
    const gain = Math.floor(mise * mult + 1e-9);
    if (gain > 0) Geos.gagner(this.app, gain, false);
    this.majEntete();
    if (gain > mise) { this.message(`Gagné : +${fmtGeos(gain)} géos (${fmtMult(mult)})` + (detail ? ` · ${detail}` : ""), "gagne"); SonJeux.jouer("gain"); Geos.pulser(); }
    else if (gain === mise) { this.message("Égalité : mise rendue" + (detail ? ` · ${detail}` : ""), "egal"); }
    else if (gain > 0) { this.message(`+${fmtGeos(gain)} géos (${fmtMult(mult)})` + (detail ? ` · ${detail}` : ""), "egal"); }
    else { this.message(`Perdu : −${fmtGeos(mise)} géos` + (detail ? ` · ${detail}` : ""), "perdu"); SonJeux.jouer("perte"); }
  }
  message(t, genre = "") {
    this.msg = [t, genre];
    if (!this.zMsg) return;
    this.zMsg.className = "jx-msg " + genre;
    this.zMsg.textContent = t;
  }
  /* animation : f(i) toutes les « pas » ms pendant « duree » ms, puis fin() ; immédiate si les animations sont coupées */
  animer(duree, pas, f, fin) {
    if (!animationsJeux(this.app)) { fin(); return; }
    this.occupe = true;
    const t0 = performance.now();
    let i = 0;
    const tic = () => {
      const ecoule = performance.now() - t0;
      if (ecoule >= duree) { this.occupe = false; fin(); return; }
      f(i++, ecoule); setTimeout(tic, pas * (1 + i / 30));
    };
    tic();
  }
  boutonsJeu(liste) { return el("div.jx-actions", null, liste.map(([t, f, s]) => { const b = bouton(t, () => { if (!this.occupe) f(); }, s || "ghost"); return b; })); }

  /* ----- roulette (0 à 36) */
  jeu_roulette(z) {
    const st = this.etats.roulette;
    const roue = el("div.jx-roue." + (st.dernier !== undefined ? couleurRoulette(st.dernier) : "vert"), null, el("b", {texte: st.dernier !== undefined ? String(st.dernier) : "–"}));
    const histo = el("div.jx-histo", null, st.histo.map(n => el("span." + couleurRoulette(n), {texte: String(n)})));
    const num = el("select.saisie.jx-num");
    for (let i = 0; i <= 36; i++) num.append(el("option", {value: String(i), texte: String(i), selected: i === (st.numero || 0)}));
    num.addEventListener("change", () => { st.numero = parseInt(num.value); });
    const g = JX.roulette;
    z.append(el("div.jx-scene", null, roue, histo),
      this.boutonsJeu([[`Rouge ${fmtMult(g.couleur)}`, () => this.roulette("couleur", "rouge"), "jx-rouge"], [`Noir ${fmtMult(g.couleur)}`, () => this.roulette("couleur", "noir"), "jx-noir"]]),
      this.boutonsJeu([[`1 – 12 ${fmtMult(g.douzaine)}`, () => this.roulette("douzaine", 1)], [`13 – 24 ${fmtMult(g.douzaine)}`, () => this.roulette("douzaine", 2)], [`25 – 36 ${fmtMult(g.douzaine)}`, () => this.roulette("douzaine", 3)]]),
      el("div.jx-actions", null, el("span.petit.muted", {texte: "Numéro"}), num, bouton(`Miser sur ce numéro ${fmtMult(g.numero)}`, () => { if (!this.occupe) this.roulette("numero", parseInt(num.value)); }, "ghost")));
    this.roue = roue;
  }
  roulette(type, val) {
    const m = this.miser(); if (!m) return;
    const n = alea(37), st = this.etats.roulette;
    const montrer = (k) => { this.roue.className = "jx-roue " + couleurRoulette(k); this.roue.firstChild.textContent = String(k); };
    this.message("La bille roule…", "");
    this.animer(1300, 70, () => { montrer(alea(37)); SonJeux.jouer("tic"); }, () => {
      montrer(n);
      st.dernier = n; st.histo = [n].concat(st.histo).slice(0, 10);
      const ok = type === "couleur" ? couleurRoulette(n) === val : type === "douzaine" ? n >= 1 && Math.ceil(n / 12) === val : n === val;
      const nom = `${n} ${couleurRoulette(n)}`;
      this.payer(m, ok ? JX.roulette[type] : 0, nom);
      this.rafraichir();
    });
  }

  /* ----- machine à sous (trois rouleaux) */
  jeu_machine(z) {
    const st = this.etats.machine = this.etats.machine || {r: ["sept", "sept", "sept"]};
    this.rouleaux = st.r.map(s => el("div.jx-rouleau", null, imgSprite(s, 5)));
    const table = el("div.jx-table");
    for (const [s, mult] of Object.entries(JX.machine).sort((a, b) => b[1] - a[1])) table.append(el("span", null, imgSprite(s, 1), imgSprite(s, 1), imgSprite(s, 1), el("b", {texte: fmtMult(mult)})));
    for (const [n, mult] of Object.entries(JX.cerises)) table.append(el("span", null, ...Array.from({length: +n}, () => imgSprite("cerise", 1)), el("i.petit.muted", {texte: "(sans triple)"}), el("b", {texte: fmtMult(mult)})));
    z.append(el("div.jx-scene", null, el("div.jx-machine", null, this.rouleaux)), this.boutonsJeu([["Tourner", () => this.machine(), "primary"]]), table);
  }
  machine() {
    const m = this.miser(); if (!m) return;
    const r = [tirerRouleau(), tirerRouleau(), tirerRouleau()], st = this.etats.machine;
    const poser = (i, s) => { const im = this.rouleaux[i].firstChild; im.src = spriteURL(s, 5); };
    this.message("Les rouleaux tournent…", "");
    this.rouleaux.forEach(x => x.classList.add("tourne"));
    let arretes = 0;
    this.animer(1500, 60, (i, t) => {
      for (let k = 0; k < 3; k++) {
        if (k < arretes) continue;
        if (t > 650 + k * 330) { poser(k, r[k]); this.rouleaux[k].classList.remove("tourne"); arretes = k + 1; SonJeux.jouer("tic"); }
        else poser(k, SYMBOLES_ROULEAU[alea(SYMBOLES_ROULEAU.length)]);
      }
    }, () => {
      st.r = r;
      this.payer(m, gainMachine(r));
      this.rafraichir();
    });
  }

  /* ----- pile ou face */
  jeu_pile(z) {
    const st = this.etats.pile = this.etats.pile || {cote: "pile"};
    this.piece = el("div.jx-piece", null, el("b", {texte: st.cote === "pile" ? "PILE" : "FACE"}));
    z.append(el("div.jx-scene", null, this.piece), this.boutonsJeu([[`Pile ${fmtMult(JX.pile)}`, () => this.pile("pile"), "primary"], [`Face ${fmtMult(JX.pile)}`, () => this.pile("face"), "primary"]]));
  }
  pile(choix) {
    const m = this.miser(); if (!m) return;
    const res = alea(2) ? "pile" : "face", st = this.etats.pile;
    this.message("La pièce tourne…", "");
    this.piece.classList.add("tourne");
    this.animer(1000, 90, (i) => { this.piece.firstChild.textContent = i % 2 ? "PILE" : "FACE"; }, () => {
      st.cote = res;
      this.payer(m, res === choix ? JX.pile : 0, res === "pile" ? "Pile" : "Face");
      this.rafraichir();
    });
  }

  /* ----- dés : plus haut ou plus bas que 7 (deux dés) */
  de(v) {
    const pips = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]}[v] || [];
    return el("div.jx-de", null, Array.from({length: 9}, (_, i) => el("span" + (pips.includes(i) ? ".pip" : ""))));
  }
  jeu_des(z) {
    const st = this.etats.des = this.etats.des || {d: [3, 4]};
    this.zDes = el("div.jx-des", null, this.de(st.d[0]), this.de(st.d[1]));
    const g = JX.des;
    z.append(el("div.jx-scene", null, this.zDes, el("div.jx-total", {texte: `Total : ${st.d[0] + st.d[1]}`})),
      this.boutonsJeu([[`Plus bas (2 – 6) ${fmtMult(g.bas)}`, () => this.des("bas"), "primary"], [`Sept ${fmtMult(g.sept)}`, () => this.des("sept")], [`Plus haut (8 – 12) ${fmtMult(g.haut)}`, () => this.des("haut"), "primary"]]));
  }
  des(choix) {
    const m = this.miser(); if (!m) return;
    const d = [1 + alea(6), 1 + alea(6)], t = d[0] + d[1], st = this.etats.des;
    this.message("Les dés roulent…", "");
    this.animer(900, 80, () => { this.zDes.replaceChildren(this.de(1 + alea(6)), this.de(1 + alea(6))); SonJeux.jouer("tic"); }, () => {
      st.d = d;
      const ok = choix === "bas" ? t < 7 : choix === "haut" ? t > 7 : t === 7;
      this.payer(m, ok ? JX.des[choix] : 0, `total ${t}`);
      this.rafraichir();
    });
  }

  /* ----- blackjack simplifié (paquet infini, le croupier tire jusqu'à 17) */
  carte(c, cachee) {
    if (cachee) return el("div.jx-carte.dos");
    return el("div.jx-carte" + (c.c === 1 || c.c === 2 ? ".rouge" : ""), null, el("b", {texte: RANGS[c.r]}), el("span", {texte: ENSEIGNES[c.c]}));
  }
  jeu_blackjack(z) {
    const st = this.etats.blackjack;
    const enCours = st && !st.fini, cacher = enCours && !st.revele;
    const ligne = (titre, main, cache) => el("div.jx-main", null, el("div.petit.muted", {texte: titre + (main.length ? `  ·  ${cache ? "?" : valeurMain(main)}` : "")}),
      el("div.jx-cartes", null, main.map((c, i) => this.carte(c, cache && i === 1))));
    z.append(el("div.jx-scene.jx-table-bj", null, ligne("Croupier", st ? st.croupier : [], cacher), ligne("Toi", st ? st.joueur : [], false)));
    if (cacher) z.append(this.boutonsJeu([["Tirer", () => this.bjTirer(), "primary"], ["Rester", () => this.bjRester()]]), el("div.petit.muted", {texte: `Mise en jeu : ${fmtGeos(st.mise)} géos`}));
    else if (enCours) z.append(el("div.petit.muted.jx-attente", {texte: "Le croupier joue…"}));
    else z.append(this.boutonsJeu([[`Distribuer (${fmtGeos(this.mise())} géos)`, () => this.bjDistribuer(), "primary"]]),
      el("div.petit.muted", {texte: `Victoire ${fmtMult(JX.bj.gagne)} · blackjack ${fmtMult(JX.bj.blackjack)} · égalité : mise rendue. Le croupier tire jusqu'à 17.`}));
  }
  bjDistribuer() {
    const m = this.miser(); if (!m) return;
    const st = this.etats.blackjack = {mise: m, joueur: [carteHasard(), carteHasard()], croupier: [carteHasard(), carteHasard()], fini: false};
    this.message("À toi de jouer : tirer ou rester ?", "");
    if (valeurMain(st.joueur) === 21 || valeurMain(st.croupier) === 21) { this.bjFin(); return; }
    this.rafraichir();
  }
  bjTirer() {
    const st = this.etats.blackjack; if (!st || st.fini) return;
    st.joueur.push(carteHasard()); SonJeux.jouer("tic");
    if (valeurMain(st.joueur) > 21) { this.bjFin(); return; }
    if (valeurMain(st.joueur) === 21) { this.bjRester(); return; }
    this.rafraichir();
  }
  bjRester() {
    const st = this.etats.blackjack; if (!st || st.fini) return;
    st.revele = true;
    const anim = animationsJeux(this.app);
    const suite = () => { if (anim) { this.occupe = true; setTimeout(tirer, 450); } else tirer(); };
    const tirer = () => {                                   // le croupier retourne sa carte, puis tire jusqu'à 17
      this.occupe = false;
      if (valeurMain(st.croupier) >= 17) { this.bjFin(); return; }
      st.croupier.push(carteHasard()); SonJeux.jouer("tic");
      this.rafraichir();
      suite();
    };
    this.rafraichir();
    suite();
  }
  bjFin() {
    const st = this.etats.blackjack;
    st.fini = true;
    const j = valeurMain(st.joueur), c = valeurMain(st.croupier);
    const bjJ = j === 21 && st.joueur.length === 2, bjC = c === 21 && st.croupier.length === 2;
    let mult, detail;
    if (bjJ || bjC) { mult = bjJ && bjC ? JX.bj.egalite : bjJ ? JX.bj.blackjack : 0; detail = bjJ && bjC ? "deux blackjacks" : bjJ ? "blackjack !" : "blackjack du croupier"; }
    else if (j > 21) { mult = 0; detail = `tu dépasses 21 (${j})`; }
    else if (c > 21) { mult = JX.bj.gagne; detail = `le croupier dépasse 21 (${c})`; }
    else if (j > c) { mult = JX.bj.gagne; detail = `${j} contre ${c}`; }
    else if (j === c) { mult = JX.bj.egalite; detail = `${j} partout`; }
    else { mult = 0; detail = `${j} contre ${c}`; }
    this.payer(st.mise, mult, detail);
    this.rafraichir();
  }

  /* ----- carte à gratter : six cases, trois symboles pareils = gain */
  jeu_grattage(z) {
    const st = this.etats.grattage;
    const table = el("div.jx-table");
    for (const [mult, , s] of JX.grattage) table.append(el("span", null, imgSprite(s, 1), imgSprite(s, 1), imgSprite(s, 1), el("b", {texte: fmtMult(mult)})));
    if (!st) {
      z.append(el("div.jx-scene", null, el("div.jx-ticket.vide", null, el("b", {texte: "Carte à gratter"}), el("span.petit.muted", {texte: "Trois symboles pareils : tu gagnes leur multiplicateur."}))),
        this.boutonsJeu([[`Acheter une carte (${fmtGeos(this.mise())} géos)`, () => this.gratterAcheter(), "primary"]]), table);
      return;
    }
    const grille = el("div.jx-ticket");
    st.cases.forEach((s, i) => grille.append(this.caseGrattage(st, i)));
    const actions = st.fini ? [[`Nouvelle carte (${fmtGeos(this.mise())} géos)`, () => this.gratterAcheter(), "primary"]] : [["Tout gratter", () => { st.vus = st.vus.map(() => true); this.gratterFin(); }]];
    z.append(el("div.jx-scene", null, grille, el("div.petit.muted", {texte: st.fini ? "" : "Gratte les cases au doigt, au crayon ou à la souris."})), this.boutonsJeu(actions), table);
  }
  caseGrattage(st, i) {
    const c = el("div.jx-case", null, imgSprite(st.cases[i], 4));
    if (st.vus[i]) { if (st.fini && st.symbole === st.cases[i]) c.classList.add("gagnante"); return c; }
    const cv = el("canvas.jx-couche", {width: 120, height: 120});
    const g = cv.getContext("2d");
    const fond = g.createLinearGradient(0, 0, 120, 120); fond.addColorStop(0, "#b9c0c9"); fond.addColorStop(.5, "#e3e7ec"); fond.addColorStop(1, "#9aa3ae");
    g.fillStyle = fond; g.fillRect(0, 0, 120, 120);
    g.fillStyle = "rgba(255,255,255,.35)"; for (let k = 0; k < 14; k++) g.fillRect(alea(120), alea(120), 3, 3);
    c.append(cv);
    const grille = new Array(36).fill(false);
    let actif = false, bouge = false;
    const gratter = (e) => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 120, y = (e.clientY - r.top) / r.height * 120;
      g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.globalCompositeOperation = "source-over";
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) if (Math.hypot(a * 20 + 10 - x, b * 20 + 10 - y) < 18) grille[b * 6 + a] = true;
      if (grille.filter(Boolean).length >= 18) this.gratterCase(st, i);
    };
    cv.addEventListener("pointerdown", (e) => { e.preventDefault(); actif = true; bouge = false; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ } gratter(e); });
    cv.addEventListener("pointermove", (e) => { if (!actif) return; e.preventDefault(); bouge = true; gratter(e); });
    cv.addEventListener("pointerup", () => { if (actif && !bouge) this.gratterCase(st, i); actif = false; });
    cv.addEventListener("pointercancel", () => { actif = false; });
    return c;
  }
  gratterCase(st, i) {
    if (st.vus[i] || st.fini) return;
    st.vus[i] = true; SonJeux.jouer("tic");
    if (st.vus.every(Boolean)) { this.gratterFin(); return; }
    const c = this.zJeu && this.zJeu.querySelectorAll(".jx-case")[i], couche = c && c.querySelector(".jx-couche");   // la case se découvre ; on continue à gratter les autres
    if (couche) couche.remove(); else this.rafraichir();
  }
  gratterAcheter() {
    const m = this.miser(); if (!m) return;
    this.etats.grattage = Object.assign(carteGrattage(), {mise: m, vus: new Array(6).fill(false), fini: false});
    this.message("Gratte les six cases.", "");
    this.rafraichir();
  }
  gratterFin() {
    const st = this.etats.grattage;
    if (!st || st.fini) return;
    st.fini = true;
    this.payer(st.mise, st.mult, st.mult ? `3 × ${nomAutocollant(st.symbole)}` : "pas de triple");
    this.rafraichir();
  }
}
