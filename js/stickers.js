/* Stickers du thème Minecraft : pixel-art 8x8 dessiné en code (mêmes images que sur le PC). */
"use strict";
const SPRITES = {"creeper": {"pal": {"g": "#5fbf3a", "d": "#3d8f27", "k": "#101010"}, "rows": ["gdggggdg", "gkkggkkg", "gkkggkkg", "gggkkggg", "ggkkkkgg", "ggkkkkgg", "ggkggkgg", "dgggggdg"]}, "diamant": {"pal": {"C": "#1a8f94", "c": "#4aedd9", "w": "#d9fffb", "d": "#2fb5b5"}, "rows": ["..CCCC..", ".CwwccC.", "CwcccccC", "CcccccdC", ".CcccdC.", "..CcdC..", "...CC...", "........"]}, "emeraude": {"pal": {"C": "#0f7a3a", "c": "#2ee66b", "w": "#c8ffd8", "d": "#1fb653"}, "rows": ["..CCCC..", ".CwwccC.", "CwcccccC", "CcccccdC", ".CcccdC.", "..CcdC..", "...CC...", "........"]}, "coeur": {"pal": {"R": "#8a1010", "r": "#e22b2b", "w": "#ff9a9a"}, "rows": [".RR..RR.", "RrwrrrrR", "RrrrrrrR", "RrrrrrrR", ".RrrrrR.", "..RrrR..", "...RR...", "........"]}, "epee": {"pal": {"s": "#eef3f5", "b": "#9fb0b8", "g": "#d9b02e", "h": "#7a4b1e"}, "rows": ["......ss", ".....sbs", "....sbs.", ".g.sbs..", "..gbs...", "..hg....", ".hh.g...", "h......."]}, "pioche": {"pal": {"c": "#7fe8e0", "h": "#7a4b1e", "d": "#2fb5b5"}, "rows": ["..cccc..", ".cddddc.", "cd..h.dc", "...h....", "...h....", "...h....", "...h....", "...h...."]}, "livre": {"pal": {"D": "#4a2f14", "b": "#8b5a2b", "P": "#f1e6c8"}, "rows": [".DDDDDD.", "DbbbbbbD", "DbPPPPbD", "DbPPPPbD", "DbPPPPbD", "DbbbbbbD", ".DDDDDD.", "........"]}, "tnt": {"pal": {"D": "#7a1010", "r": "#d83a2a", "w": "#f4efe6", "k": "#222222"}, "rows": ["DDDDDDDD", "rrrrrrrr", "wwwwwwww", "wkwkkwkw", "wwwwwwww", "rrrrrrrr", "DDDDDDDD", "........"]}, "herbe": {"pal": {"G": "#3f8f24", "g": "#5fbf3a", "b": "#8b5a2b", "B": "#6e4520"}, "rows": ["GGGGGGGG", "GgGGgGGG", "gGgggGgg", "bbbbbbbb", "bBbbbbBb", "bbbBbbbb", "bbbbbbBb", "BBBBBBBB"]}};
const ICONE_CAT = {"info": "creeper", "graph": "diamant", "meca": "pioche", "ethique": "coeur", "travail": "epee", "etude": "livre", "perso": "emeraude"};
const ICONES_AUTRES = ["tnt", "herbe", "creeper", "diamant", "livre"];
const BARRE_OBJETS = ["epee", "pioche", "herbe", "tnt", "creeper", "diamant", "emeraude", "livre", "coeur"];
const _spriteCache = {};
function spriteURL(nom, k) {
  const cle = nom + "@" + k;
  if (_spriteCache[cle]) return _spriteCache[cle];
  const s = SPRITES[nom]; if (!s) return "";
  const cv = document.createElement("canvas"); cv.width = cv.height = 8 * k;
  const g = cv.getContext("2d");
  s.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") { g.fillStyle = s.pal[ch]; g.fillRect(x * k, y * k, k, k); } }));
  return (_spriteCache[cle] = cv.toDataURL("image/png"));
}
function iconeCat(cle) {
  if (ICONE_CAT[cle]) return ICONE_CAT[cle];
  let s = 0; for (const ch of cle) s += ch.codePointAt(0);
  return ICONES_AUTRES[s % ICONES_AUTRES.length];
}
function barreObjets() {
  const b = document.createElement("div"); b.className = "hotbar";
  BARRE_OBJETS.forEach((n, i) => { const c = document.createElement("span"); c.className = "slot" + (i === 0 ? " sel" : ""); const im = document.createElement("img"); im.src = spriteURL(n, 3); im.alt = ""; c.append(im); b.append(c); });
  return b;
}
