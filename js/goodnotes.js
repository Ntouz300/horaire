/* Fichiers GoodNotes (.goodnotes) : lecture et écriture. Même fonctionnement que sur le PC.
   Format observé : archive zip ; index.events.pb (document, gabarits, pages), notes/<id> (calque d'encre de chaque page),
   attachments/<id> (PDF du papier). Chaque fichier est une suite de messages protobuf préfixés par leur longueur.
   La géométrie des traits est dans un bloc compressé Apple LZ4 (« bv41 ») au format « tpl » (signature de types + données). */
"use strict";

/* ---------- protobuf minimal */
function pbVarint(b, i) {
  let r = 0, s = 0, c;
  do { c = b[i++]; r += (c & 0x7f) * Math.pow(2, s); s += 7; } while (c >= 0x80);
  return [r, i];
}
function pbLire(b) {
  const out = [];
  let i = 0;
  while (i < b.length) {
    let k; [k, i] = pbVarint(b, i);
    const f = Math.floor(k / 8), t = k & 7;
    let v;
    if (t === 0) [v, i] = pbVarint(b, i);
    else if (t === 1) { v = b.subarray(i, i + 8); i += 8; }
    else if (t === 5) { v = b.subarray(i, i + 4); i += 4; }
    else if (t === 2) { let n; [n, i] = pbVarint(b, i); v = b.subarray(i, i + n); i += n; }
    else throw new Error("protobuf : type " + t);
    out.push([f, t, v]);
  }
  return out;
}
function pbChamps(b) { const o = {}; for (const [f, , v] of pbLire(b)) if (!(f in o)) o[f] = v; return o; }
function pbTous(b, f) { return pbLire(b).filter(x => x[0] === f).map(x => x[2]); }
function pbDelimites(b) {
  const out = [];
  let i = 0;
  while (i < b.length) { let n; [n, i] = pbVarint(b, i); out.push(b.subarray(i, i + n)); i += n; }
  return out;
}
const _dec = new TextDecoder();
function pbTexte(v) { return v ? _dec.decode(v) : ""; }
function pbF32(v) { return new DataView(v.buffer, v.byteOffset, 4).getFloat32(0, true); }

/* ---------- blocs Apple LZ4 (bv41 compressé, bv4- brut, bv4$ fin) */
function lz4Bloc(src, taille) {
  const dst = new Uint8Array(taille);
  let i = 0, o = 0;
  while (i < src.length) {
    const tok = src[i++];
    let l = tok >> 4;
    if (l === 15) { let c; do { c = src[i++]; l += c; } while (c === 255); }
    dst.set(src.subarray(i, i + l), o); i += l; o += l;
    if (i >= src.length) break;
    const off = src[i] | (src[i + 1] << 8); i += 2;
    let m = tok & 15;
    if (m === 15) { let c; do { c = src[i++]; m += c; } while (c === 255); }
    m += 4;
    for (let k = 0; k < m; k++) { dst[o] = dst[o - off]; o++; }
  }
  return dst.subarray(0, o);
}
function bv41(b) {
  const morceaux = [], dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let i = 0, total = 0;
  while (i + 4 <= b.length) {
    const mg = String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
    if (mg === "bv4$") break;
    if (mg === "bv41") { const u = dv.getUint32(i + 4, true), c = dv.getUint32(i + 8, true); morceaux.push(lz4Bloc(b.subarray(i + 12, i + 12 + c), u)); i += 12 + c; }
    else if (mg === "bv4-") { const u = dv.getUint32(i + 4, true); morceaux.push(b.subarray(i + 8, i + 8 + u)); i += 8 + u; }
    else throw new Error("bloc compressé inconnu");
  }
  for (const m of morceaux) total += m.length;
  const out = new Uint8Array(total);
  let o = 0;
  for (const m of morceaux) { out.set(m, o); o += m.length; }
  return out;
}
function estBv4(v) { return v && v.length > 4 && v[0] === 0x62 && v[1] === 0x76 && v[2] === 0x34; }

/* ---------- données « tpl » : v = 2 octets, u / f = 4 octets, A(x) = nombre (4 octets) + éléments, S(...) = suite */
function tplLire(d) {
  const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
  let j = 8; while (d[j]) j++;
  const sig = _dec.decode(d.subarray(8, j));
  const arbre = (s) => {
    const out = [];
    for (let k = 0; k < s.length;) {
      const c = s[k];
      if ("vuf".includes(c)) { out.push(c); k++; }
      else { let p = 1, m = k + 2; while (p) { if (s[m] === "(") p++; else if (s[m] === ")") p--; m++; } out.push([c, arbre(s.slice(k + 2, m - 1))]); k = m; }
    }
    return out;
  };
  let i = j + 1;
  const lire = (e) => {
    if (e === "v") { const v = dv.getUint16(i, true); i += 2; return v; }
    if (e === "u" || e === "f") { const v = dv.getFloat32(i, true); i += 4; return v; }
    const [c, sub] = e;
    if (c === "S") return sub.map(lire);
    const n = dv.getUint32(i, true); i += 4;
    const out = new Array(n);
    for (let k = 0; k < n; k++) out[k] = sub.length === 1 ? lire(sub[0]) : sub.map(lire);
    return out;
  };
  return {sig, vals: arbre(sig).map(lire)};
}
const SIG_TRAIT = "vuA(v)A(S(uu))A(S(uuuu))vA(f)";

/* ---------- lecture d'une page (calque d'encre) */
function hexCouleur(c) { return "#" + c.slice(0, 3).map(x => Math.max(0, Math.min(255, Math.round(x * 255))).toString(16).padStart(2, "0")).join(""); }
function gnCouleur(v) {
  const c = [0, 0, 0, 0];
  if (v) for (const [f, t, x] of pbLire(v)) if (t === 5 && f >= 1 && f <= 4) c[f - 1] = pbF32(x);
  return c;
}
function gnPoint(v) { const q = {}; for (const [f, t, x] of pbLire(v)) if (t === 5) q[f] = pbF32(x); return [q[1] || 0, q[2] || 0]; }
function quadPts(p0, c, p1, n = 6) {
  const out = [];
  for (let k = 1; k <= n; k++) { const t = k / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, d = t * t; out.push([a * p0[0] + b * c[0] + d * p1[0], a * p0[1] + b * c[1] + d * p1[1]]); }
  return out;
}
function gnObjetsPage(b) {
  const ordre = new Map(), objets = [];
  for (const m of pbDelimites(b)) {
    const f = pbChamps(m);
    if (!f[7]) { if (f[1]) ordre.set(pbTexte(f[1]), typeof f[9] === "number" ? f[9] : 0); continue; }
    const g = pbChamps(f[7]);
    if (g[14] || !estBv4(g[2])) continue;                       // 14 : objet effacé
    const id = pbTexte(g[1]), col = g[4] ? gnCouleur(g[4]) : [0, 0, 0, 1];
    const o = {id, col, c: hexCouleur(col), a: col[3] || 1};
    if (g[9] && g[9].length) {                                   // forme : ligne brisée, rectangle ou ellipse
      let larg = 2;
      for (const [ff, t, x] of pbLire(g[9])) if (ff === 15 && t === 5) larg = pbF32(x);
      for (const [ff, , x] of pbLire(g[9])) {
        if (ff === 1) objets.push(Object.assign({}, o, {k: "ligne", pts: pbTous(x, 1).map(gnPoint), larg}));
        else if (ff === 2 || ff === 3) {
          const [centre, t] = pbTous(x, 1).concat(pbTous(x, 2)).map(gnPoint);
          objets.push(Object.assign({}, o, {k: ff === 2 ? "ellipse" : "rect", centre, t: t || [0, 0], larg}));
        }
      }
      continue;
    }
    const {sig, vals} = tplLire(bv41(g[2]));
    if (sig === SIG_TRAIT) {
      const [, larg, , depart, segs] = vals;
      if (!depart.length) continue;
      let pts = [depart[0]];
      for (const s of segs) pts = pts.concat(quadPts(pts[pts.length - 1], [s[0], s[1]], [s[2], s[3]]));
      objets.push(Object.assign({}, o, {k: "plume", pts, larg}));
    } else if (sig.startsWith("vA(v)A(u)A(u)") || sig.startsWith("vuA(v)A(u)A(u)")) {   // crayon (largeur variable)
      const decal = sig.startsWith("vu") ? 1 : 0, debut = vals[2 + decal], ctr = vals[6 + decal];
      if (!debut || debut.length < 2) continue;
      const pts = [[debut[0], debut[1]]];
      for (let i = 0; i + 1 < ctr.length; i += 2) pts.push([ctr[i], ctr[i + 1]]);
      objets.push(Object.assign({}, o, {k: "crayon", pts, larg: Math.max(1, (debut[2] || .5) * 3)}));
    }
  }
  objets.sort((a, b) => (ordre.get(a.id) || 0) - (ordre.get(b.id) || 0));
  return objets;
}
/* identifiant + 1 (le calque d'encre d'une page a l'identifiant de la page + 1) */
function uuidPlus(u, n = 1) {
  const h = u.replace(/-/g, "");
  let v = BigInt("0x" + h) + BigInt(n);
  const s = v.toString(16).toUpperCase().padStart(32, "0").slice(-32);
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
async function lireGoodnotes(u8) {
  const ents = await lireZip(u8), par = new Map(ents.map(e => [e.nom, e]));
  if (!par.has("index.events.pb")) throw new Error("ce fichier n'est pas un document GoodNotes");
  let titre = "", gabarits = {}, pages = [];
  for (const m of pbDelimites(await par.get("index.events.pb").lire())) {
    for (const [f, t, v] of pbLire(m)) {
      if (t !== 2) continue;
      if (f === 30) { const g = pbChamps(v); if (g[2]) titre = pbTexte(pbChamps(g[2])[1]); }
      else if (f === 2 && v.length > 60) {
        const g = pbChamps(v);
        if (g[8] && g[2]) gabarits[pbTexte(g[2])] = {taille: gnPoint(g[8]), pdf: pbTexte(g[4]), nom: pbTexte(g[9])};
      } else if (f === 54) {
        const g = pbChamps(v);
        pages.push({id: pbTexte(g[2]), ordre: g[4] ? pbTexte(pbChamps(g[4])[1]) : "", gabarit: g[3] ? pbTexte(pbChamps(g[3])[1]) : ""});
      }
    }
  }
  pages.sort((a, b) => (a.ordre < b.ordre ? -1 : a.ordre > b.ordre ? 1 : 0));
  for (const p of pages) {
    const ent = par.get("notes/" + uuidPlus(p.id));
    p.objets = ent ? gnObjetsPage(await ent.lire()) : [];
    const gb = gabarits[p.gabarit] || {};
    p.taille = gb.taille && gb.taille[0] > 10 ? gb.taille : [612, 792];
    const att = gb.pdf ? par.get("attachments/" + gb.pdf) : null;
    p.fond = att ? await att.lire() : null;
    p.nomFond = gb.nom || "";
  }
  return {titre, pages};
}

/* ---------- import : un document GoodNotes devient un cahier modifiable (traits vectoriels) */
function cercleFerme(c, t, n = 48) {
  const out = [];
  for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n; out.push([c[0] + t[0] / 2 * Math.cos(a), c[1] + t[1] / 2 * Math.sin(a)]); }
  return out;
}
function objetVersTrait(o, s) {
  let pts = o.pts, k = "b";
  if (o.k === "rect") { const [cx, cy] = o.centre, [w, h] = o.t; pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2], [cx - w / 2, cy - h / 2]]; k = "f"; }
  else if (o.k === "ellipse") { pts = cercleFerme(o.centre, o.t); k = "f"; }
  else if (o.k === "ligne") k = "f";
  else if (o.k === "crayon") k = "c";
  const p = [];
  for (const [x, y] of pts) p.push(Math.round(x * s * 10) / 10, Math.round(y * s * 10) / 10, 50);
  const tr = {c: o.c === "#000000" ? "#1b1f24" : o.c, e: Math.round(Math.max(.6, o.larg * s) * 100) / 100, k, p};
  if (o.a < .9) tr.o = 1;                                   // transparent : surligneur
  return tr;
}
async function importerGoodnotes(app, u8, nom) {
  const doc = await lireGoodnotes(u8), d = app.donnees;
  const titre = (doc.titre || nomPropre(nom).replace(/\.goodnotes$/i, "")).trim() || "GoodNotes";
  const pages = [];
  for (const p of doc.pages) {
    const [W, H] = p.taille, s = PAGE_L / W, h = Math.round(PAGE_L * H / W);
    const page = {id: newId(), f: "blanc", h, traits: p.objets.map(o => objetVersTrait(o, s)), textes: []};
    if (p.fond) {                                           // papier du gabarit (PDF) gardé comme fond
      const id = await empreinte(p.fond);
      if (!d.fichiers.some(f => f.id === id)) {
        await Fichiers.ecrireLocal(id, p.fond);
        d.fichiers.push({id, nom: (p.nomFond || "Papier GoodNotes") + ".pdf", taille: p.fond.length, n: Math.ceil(Math.ceil(p.fond.length / 3) * 4 / MORCEAU_PDF), pages: [[W, H]], ajout: nowIsoMinutes()});
        Fichiers.marquer(id, false);
      }
      page.f = "pdf"; page.pdf = [id, 0];
    }
    pages.push(page);
  }
  if (!pages.length) throw new Error("aucune page lisible");
  const n = normaliserNote({id: newId(), type: "cahier", titre, dossier: "", fond: "carreau", papier: "blanc", maj: nowIsoMinutes(), pages});
  d.notes.unshift(n);
  return n;
}

/* ---------- export : un cahier devient un document GoodNotes (même structure que les fichiers de GoodNotes) */
function pbVarintE(n, out) {
  if (typeof n === "bigint") { while (n >= 128n) { out.push(Number(n & 127n) | 128); n >>= 7n; } out.push(Number(n)); return; }
  n = Math.max(0, Math.floor(n)); while (n >= 128) { out.push((n % 128) | 128); n = Math.floor(n / 128); } out.push(n);
}
class PB {
  constructor() { this.o = []; }
  cle(f, t) { pbVarintE(f * 8 + t, this.o); return this; }
  int(f, n) { this.cle(f, 0); pbVarintE(n, this.o); return this; }
  f32(f, x) { this.cle(f, 5); const b = new Uint8Array(4); new DataView(b.buffer).setFloat32(0, x, true); this.o.push(...b); return this; }
  f64(f, x) { this.cle(f, 1); const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, x, true); this.o.push(...b); return this; }
  octets(f, b) { this.cle(f, 2); pbVarintE(b.length, this.o); for (let i = 0; i < b.length; i++) this.o.push(b[i]); return this; }
  texte(f, s) { return this.octets(f, new TextEncoder().encode(s)); }
  msg(f, m) { return this.octets(f, m.fini()); }
  fini() { return Uint8Array.from(this.o); }
}
function pbDelimiter(msgs) { const o = []; for (const m of msgs) { pbVarintE(m.length, o); for (let i = 0; i < m.length; i++) o.push(m[i]); } return Uint8Array.from(o); }
function bv4Brut(d) {
  const o = new Uint8Array(8 + d.length + 4), dv = new DataView(o.buffer);
  o.set([0x62, 0x76, 0x34, 0x2d]); dv.setUint32(4, d.length, true); o.set(d, 8); o.set([0x62, 0x76, 0x34, 0x24], 8 + d.length);
  return o;
}
function tplTrait(larg, x0, y0, segs) {
  const sig = new TextEncoder().encode(SIG_TRAIT), n = segs.length;
  const taille = 8 + sig.length + 1 + 2 + 4 + 4 + 2 * (n + 1) + 4 + 8 + 4 + 16 * n + 2 + 4;
  const b = new Uint8Array(taille), dv = new DataView(b.buffer);
  b.set([0x74, 0x70, 0x6c, 0]); dv.setUint32(4, taille, true); b.set(sig, 8);
  let i = 8 + sig.length + 1;
  dv.setUint16(i, 2, true); i += 2; dv.setFloat32(i, larg, true); i += 4;
  dv.setUint32(i, n + 1, true); i += 4; dv.setUint16(i, 0, true); i += 2;
  for (let k = 0; k < n; k++) { dv.setUint16(i, 1, true); i += 2; }
  dv.setUint32(i, 1, true); i += 4; dv.setFloat32(i, x0, true); dv.setFloat32(i + 4, y0, true); i += 8;
  dv.setUint32(i, n, true); i += 4;
  for (const s of segs) { for (const v of s) { dv.setFloat32(i, v, true); i += 4; } }
  dv.setUint16(i, 1, true); i += 2; dv.setUint32(i, 0, true);
  return b;
}
function uuid() {
  const b = new Uint8Array(16); crypto.getRandomValues(b); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const GN_SITE = 3513188080847387400n;          // identifiant d'appareil (au-delà de 2^53 : BigInt)
function gnHorloge(n) { return new PB().int(1, 1).int(2, n); }
function couleurRGBA(hex, a) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "") || [0, "1b1f24"], v = parseInt(m[1], 16);
  return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255, a];
}
/* un trait de l'appli → un enregistrement GoodNotes (en-tête + corps) */
function gnEnregistrements(tr, s, ordre) {
  const id = uuid(), p = tr.p || [], pts = [];
  for (let i = 0; i + 1 < p.length; i += 3) pts.push([p[i] / s, p[i + 1] / s]);
  if (!pts.length) return [];
  if (pts.length === 1) pts.push([pts[0][0] + .1, pts[0][1]]);
  const segs = [];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; segs.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, b[0], b[1]]); }
  const larg = Math.max(.3, (tr.e || 3) / s * (tr.k === "b" || tr.k === "f" || tr.o ? 1 : .8));
  const col = couleurRGBA(tr.c, tr.o ? .35 : 1), cm = new PB();
  col.forEach((v, k) => { if (v) cm.f32(k + 1, v); });
  const tete = new PB().texte(1, id).msg(2, new PB().int(1, 3).int(2, (ordre * 2654435761) % 4294967296)).int(8, GN_SITE).int(9, 1120000 + ordre).int(14, 5381).int(16, 24);
  const corps = new PB().texte(1, id).octets(2, bv4Brut(tplTrait(larg, pts[0][0], pts[0][1], segs))).msg(4, cm).octets(6, new Uint8Array(0))
    .msg(7, new PB().msg(1, new PB().int(1, 200 + ordre % 50).int(2, (ordre * 40503) % 4294967296))).octets(9, new Uint8Array(0))
    .msg(15, new PB().int(1, 3).int(2, (ordre * 2246822519) % 4294967296)).octets(20, new Uint8Array(0)).int(21, 24);
  return [tete.fini(), new PB().msg(7, corps).fini()];
}
/* papier de la page (PDF d'une page) : le PDF importé, sinon un PDF généré avec le fond de l'appli */
async function papierPdf(page, W, H) {
  if (page.f === "pdf" && page.pdf) {
    try {
      const lib = await pdfLib(), src = await lib.PDFDocument.load(await Fichiers.obtenir(page.pdf[0]), {ignoreEncryption: true});
      const doc = await lib.PDFDocument.create(), [pg] = await doc.copyPages(src, [page.pdf[1] || 0]);
      doc.addPage(pg);
      return new Uint8Array(await doc.save());
    } catch (e) { /* papier simple à la place */ }
  }
  const vide = Object.assign({}, page, {traits: [], textes: [], f: page.f === "pdf" ? "blanc" : page.f});
  return assemblerPdf([{w: W, h: H, ops: opsPage(vide, couleursPapier("blanc"))}]);
}
function crc32(b) {
  let c, t = crc32.t || (crc32.t = Array.from({length: 256}, (_, n) => { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; }));
  c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function zipSimple(fichiers) {                                  // zip sans compression (stockés)
  const enc = new TextEncoder(), parts = [], cent = [];
  let off = 0;
  for (const [nom, data] of fichiers) {
    const n = enc.encode(nom), crc = crc32(data), h = new Uint8Array(30 + n.length), dv = new DataView(h.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(8, 0, true); dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, n.length, true); h.set(n, 30);
    parts.push(h, data);
    const c = new Uint8Array(46 + n.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, n.length, true); cv.setUint32(42, off, true); c.set(n, 46);
    cent.push(c); off += h.length + data.length;
  }
  const tc = cent.reduce((a, c) => a + c.length, 0), fin = new Uint8Array(22), fv = new DataView(fin.buffer);
  fv.setUint32(0, 0x06054b50, true); fv.setUint16(8, fichiers.length, true); fv.setUint16(10, fichiers.length, true); fv.setUint32(12, tc, true); fv.setUint32(16, off, true);
  return new Blob([...parts, ...cent, fin], {type: "application/octet-stream"});
}
async function exporterGoodnotes(n, pagesChoisies) {
  const pages = pagesChoisies || n.pages, docId = uuid(), maintenant = Date.now();
  const evenements = [], notes = [], attachs = [], fichiers = [];
  evenements.push(new PB().texte(1, docId).msg(30, new PB().texte(1, docId).msg(2, new PB().texte(1, n.titre || "Sans titre").msg(2, gnHorloge(1)))
    .texte(9, "auto").f64(10, maintenant).texte(11, uuid()).int(13, GN_SITE).int(14, 1724887926901).int(20, 24)).fini());
  let ordre = 0;
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i], W = A4_L, s = PAGE_L / W, H = pg.h / s;
    const attId = uuid(), gabId = uuid(), pageId = uuid(), calque = uuidPlus(pageId);
    const pdf = await papierPdf(pg, W, H);
    fichiers.push(["attachments/" + attId, pdf]); attachs.push(attId);
    evenements.push(new PB().texte(1, attId).msg(6, new PB().texte(1, attId).texte(2, attId).int(5, pdf.length).texte(6, docId).f64(10, maintenant).texte(11, uuid())
      .msg(12, new PB().int(1, 1).int(2, 1)).int(14, GN_SITE).int(15, 1724887926902).int(16, 24)).fini());
    evenements.push(new PB().texte(1, gabId).msg(2, new PB().texte(1, docId).texte(2, gabId).texte(4, attId).int(5, 1).int(6, 1).f64(7, 29.33333396911621)
      .msg(8, new PB().f32(1, W).f32(2, H)).texte(9, "Horaire_" + (pg.f || "blanc")).f64(10, maintenant).texte(11, uuid()).int(15, GN_SITE).int(16, 1724887926903).int(21, 24)).fini());
    const cle = String.fromCharCode(65 + Math.floor(i / 26)) + String.fromCharCode(97 + i % 26);
    evenements.push(new PB().texte(1, pageId).msg(54, new PB().texte(1, docId).texte(2, pageId).msg(3, new PB().texte(1, gabId).msg(2, gnHorloge(i + 1)))
      .msg(4, new PB().texte(1, cle).msg(2, gnHorloge(i + 1))).f64(10, maintenant).texte(11, uuid()).int(13, GN_SITE).int(14, 1724887926904 + i).int(15, 24)).fini());
    evenements.push(new PB().texte(1, calque).msg(102, new PB().texte(1, calque).f64(10, maintenant).texte(11, uuid()).int(13, GN_SITE).int(14, 1724887927576 + i).int(15, 24).texte(16, docId)).fini());
    const recs = [];
    for (const tr of pg.traits || []) recs.push(...gnEnregistrements(tr, s, ordre++));
    fichiers.push(["notes/" + calque, pbDelimiter(recs)]); notes.push(calque);
  }
  const index = (ids, dossier) => pbDelimiter(ids.map(id => new PB().texte(1, id).texte(2, dossier + "/" + id).fini()));
  fichiers.push(["schema.pb", new PB().int(1, 25).fini()], ["document.info.pb", new Uint8Array(0)], ["index.events.pb", pbDelimiter(evenements)],
    ["index.notes.pb", index(notes, "notes")], ["index.attachments.pb", index(attachs, "attachments")], ["index.search.pb", new Uint8Array(0)]);
  try {                                                          // miniature (1re page)
    const c = canvasPage(pages[0], "blanc", 400), b = await new Promise(r => c.toBlob(r, "image/jpeg", .85));
    if (b) fichiers.push(["thumbnail.jpg", new Uint8Array(await b.arrayBuffer())]);
  } catch (e) { /* */ }
  return zipSimple(fichiers);
}
