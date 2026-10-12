/* Objets 3D (STL, 3MF) : lecture des fichiers, bibliothèque et visionneuse WebGL.
   Les fichiers sont rangés avec les PDF (donnees.fichiers, type « 3d ») et voyagent par la même synchro.
   Même fonctionnement que sur le PC (onglet « 3D »). */
"use strict";

const LIMITE_SYNC_3D = 25 * 1024 * 1024;      // au-delà, le fichier reste sur l'appareil (forfait Firebase gratuit)
const COULEURS_3D = [["", "Couleurs du fichier"], ["#8fa3b8", "Gris bleu"], ["#e67e22", "Orange"], ["#27ae60", "Vert"],
  ["#c0392b", "Rouge"], ["#f1c40f", "Jaune"], ["#ecf0f1", "Blanc"], ["#34495e", "Ardoise"]];
const GRIS_3D = [0x8f, 0xa3, 0xb8];

function est3D(f) { return !!f && f.type === "3d"; }
function objets3D(d) { return ((d && d.fichiers) || []).filter(est3D); }
function format3D(nom) { const m = /\.(stl|3mf)$/i.exec(nom || ""); return m ? m[1].toLowerCase() : ""; }

/* ---------- lecture STL (binaire ou texte) */
function estTexteSTL(u8) {
  const d = new TextDecoder().decode(u8.subarray(0, Math.min(u8.length, 1024)));
  return /^\s*solid/.test(d) && /facet|endsolid/.test(d);
}
function lireSTL(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8.length >= 84) {
    const n = dv.getUint32(80, true);
    if (84 + 50 * n === u8.length || (n > 0 && 84 + 50 * n <= u8.length && !estTexteSTL(u8))) {
      const pos = new Float32Array(n * 9);
      for (let i = 0, o = 96; i < n; i++, o += 50) for (let k = 0; k < 9; k++) pos[i * 9 + k] = dv.getFloat32(o + 4 * k, true);
      return {pos, col: null};
    }
  }
  const t = new TextDecoder().decode(u8), re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g, v = [];
  let m;
  while ((m = re.exec(t))) v.push(+m[1], +m[2], +m[3]);
  const n = Math.floor(v.length / 9);
  if (!n) throw new Error("fichier STL illisible");
  return {pos: Float32Array.from(v.length === n * 9 ? v : v.slice(0, n * 9)), col: null};
}

/* ---------- lecture 3MF (zip + XML ; composants, transformations, couleurs de base) */
function matrice3MF(s) {
  const v = String(s || "").trim().split(/\s+/).map(Number);
  return v.length === 12 && v.every(isFinite) ? v : [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
}
function composer3MF(a, b) {      // applique a puis b (vecteurs ligne, comme la norme 3MF)
  const c = new Array(12);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  for (let j = 0; j < 3; j++) c[9 + j] = a[9] * b[j] + a[10] * b[3 + j] + a[11] * b[6 + j] + b[9 + j];
  return c;
}
function rgb3MF(s) {
  const m = /^#?([0-9a-f]{6})/i.exec(String(s || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function attrLocal(e, nom) { for (const a of e.attributes) if (a.localName === nom) return a.value; return null; }
function analyserModele3MF(x) {
  const T = (n, tag) => n.getElementsByTagNameNS("*", tag);
  const couleurs = new Map();
  for (const b of T(x, "basematerials")) couleurs.set(b.getAttribute("id"), Array.from(T(b, "base"), e => rgb3MF(e.getAttribute("displaycolor"))));
  for (const g of T(x, "colorgroup")) couleurs.set(g.getAttribute("id"), Array.from(T(g, "color"), e => rgb3MF(e.getAttribute("color"))));
  const objets = new Map();
  for (const o of T(x, "object")) {
    const ent = {mesh: null, comps: []}, pid = o.getAttribute("pid"), pidx = +(o.getAttribute("pindex") || 0);
    const ms = T(o, "mesh")[0];
    if (ms) {
      const vs = T(ms, "vertex"), v = new Float32Array(vs.length * 3);
      for (let i = 0; i < vs.length; i++) { const e = vs[i]; v[i * 3] = +e.getAttribute("x"); v[i * 3 + 1] = +e.getAttribute("y"); v[i * 3 + 2] = +e.getAttribute("z"); }
      const ts = T(ms, "triangle"), t = new Uint32Array(ts.length * 3);
      let tc = null;
      const defaut = pid && couleurs.has(pid) ? couleurs.get(pid)[pidx] : null;
      for (let i = 0; i < ts.length; i++) {
        const e = ts[i];
        t[i * 3] = +e.getAttribute("v1"); t[i * 3 + 1] = +e.getAttribute("v2"); t[i * 3 + 2] = +e.getAttribute("v3");
        const p = e.getAttribute("pid") || pid, p1 = e.getAttribute("p1");
        const c = p && couleurs.has(p) ? couleurs.get(p)[p1 !== null ? +p1 : pidx] : defaut;
        if (c) { if (!tc) tc = new Int16Array(ts.length * 3).fill(-1); tc[i * 3] = c[0]; tc[i * 3 + 1] = c[1]; tc[i * 3 + 2] = c[2]; }
      }
      ent.mesh = {v, t, tc};
    }
    for (const c of T(o, "component")) ent.comps.push({oid: c.getAttribute("objectid"), m: matrice3MF(c.getAttribute("transform")), chemin: attrLocal(c, "path")});
    objets.set(o.getAttribute("id"), ent);
  }
  const items = Array.from(T(x, "item"), it => ({oid: it.getAttribute("objectid"), m: matrice3MF(it.getAttribute("transform")), chemin: attrLocal(it, "path")}));
  return {objets, items};
}
async function lire3MF(u8) {
  const ents = await lireZip(u8);
  const parNom = new Map(ents.map(e => [e.nom.replace(/^\/+/, "").toLowerCase(), e]));
  let racine = "3d/3dmodel.model";
  const rels = parNom.get("_rels/.rels");
  if (rels) { const m = /Target="\/?([^"]+\.model)"/i.exec(new TextDecoder().decode(await rels.lire())); if (m) racine = m[1].toLowerCase(); }
  if (!parNom.has(racine)) { racine = [...parNom.keys()].find(k => k.endsWith(".model")); if (!racine) throw new Error("aucun modèle 3D dans ce 3MF"); }
  const docs = new Map();
  const doc = async (chemin) => {
    chemin = String(chemin || "").replace(/^\/+/, "").toLowerCase();
    if (docs.has(chemin)) return docs.get(chemin);
    const e = parNom.get(chemin);
    const r = e ? analyserModele3MF(new DOMParser().parseFromString(new TextDecoder().decode(await e.lire()), "application/xml")) : null;
    docs.set(chemin, r);
    return r;
  };
  const morceaux = [];
  let aCouleur = false, total = 0;
  const emettre = async (d, oid, m, prof) => {
    const o = d && d.objets.get(oid);
    if (!o || prof > 20) return;
    if (o.mesh && o.mesh.t.length) {
      const {v, t, tc} = o.mesh, n = t.length / 3, pos = new Float32Array(n * 9), col = new Uint8Array(n * 3);
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < 3; k++) {
          const j = t[i * 3 + k] * 3, x = v[j], y = v[j + 1], z = v[j + 2], o9 = i * 9 + k * 3;
          pos[o9] = x * m[0] + y * m[3] + z * m[6] + m[9];
          pos[o9 + 1] = x * m[1] + y * m[4] + z * m[7] + m[10];
          pos[o9 + 2] = x * m[2] + y * m[5] + z * m[8] + m[11];
        }
        const c = tc && tc[i * 3] >= 0 ? [tc[i * 3], tc[i * 3 + 1], tc[i * 3 + 2]] : GRIS_3D;
        col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      }
      if (tc) aCouleur = true;
      morceaux.push([pos, col]); total += n;
    }
    for (const c of o.comps) await emettre(c.chemin ? await doc(c.chemin) : d, c.oid, composer3MF(c.m, m), prof + 1);
  };
  const r = await doc(racine);
  if (!r) throw new Error("modèle 3MF illisible");
  const items = r.items.length ? r.items : [...r.objets.keys()].map(oid => ({oid, m: matrice3MF(""), chemin: null}));
  for (const it of items) await emettre(it.chemin ? await doc(it.chemin) : r, it.oid, it.m, 0);
  if (!total) throw new Error("ce 3MF ne contient aucun triangle");
  const pos = new Float32Array(total * 9), col = aCouleur ? new Uint8Array(total * 3) : null;
  let o = 0;
  for (const [p, c] of morceaux) { pos.set(p, o * 9); if (col) col.set(c, o * 3); o += p.length / 9; }
  return {pos, col};
}
async function lireObjet3D(u8, format) {
  const g = format === "3mf" ? await lire3MF(u8) : lireSTL(u8);
  g.n = g.pos.length / 9;
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < g.pos.length; i += 3) for (let k = 0; k < 3; k++) { const x = g.pos[i + k]; if (isFinite(x)) { if (x < mn[k]) mn[k] = x; if (x > mx[k]) mx[k] = x; } }
  if (!isFinite(mn[0])) throw new Error("aucune coordonnée valide");
  g.min = mn; g.max = mx;
  return g;
}
function dims3D(g) { return [0, 1, 2].map(k => Math.round((g.max[k] - g.min[k]) * 100) / 100); }

/* ---------- petites matrices 4×4 (colonnes, comme WebGL) */
const M4 = {
  perspective(f, a, n, l) { const t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (l + n) / (n - l), -1, 0, 0, 2 * l * n / (n - l), 0]; },
  vue(oeil, cible, haut) {
    const sous = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], norm = (a) => { const l = Math.hypot(...a) || 1; return a.map(x => x / l); };
    const croix = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], pt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const z = norm(sous(oeil, cible)), x = norm(croix(haut, z)), y = croix(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -pt(x, oeil), -pt(y, oeil), -pt(z, oeil), 1];
  },
  mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
};
const VUES_3D = {iso: [-Math.PI / 4, 0.6155], face: [-Math.PI / 2, 0], dessus: [-Math.PI / 2, Math.PI / 2 - 0.001], cote: [0, 0]};

/* ---------- moteur de rendu WebGL */
class Rendu3D {
  constructor(canvas, capture = false) {
    this.cv = canvas;
    const gl = this.gl = canvas.getContext("webgl", {antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: capture});
    if (!gl) throw new Error("WebGL n'est pas disponible sur cet appareil.");
    const prog = (vs, fs) => {
      const p = gl.createProgram();
      for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); gl.attachShader(p, sh); }
      gl.linkProgram(p);
      return p;
    };
    this.pm = prog(`attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; uniform mat4 uMVP; uniform mat3 uNM; uniform vec3 uCol; uniform float uForce;
      varying vec3 vC; varying vec3 vN; void main(){ gl_Position = uMVP * vec4(aP, 1.0); vN = uNM * aN; vC = mix(aC, uCol, uForce); }`,
      `precision mediump float; varying vec3 vC; varying vec3 vN;
      void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
        float d = 0.30 + 0.62 * max(dot(n, normalize(vec3(0.7, 0.45, 0.75))), 0.0) + 0.18 * max(dot(n, normalize(vec3(-0.8, -0.2, 0.4))), 0.0);
        gl_FragColor = vec4(min(vC * d, 1.0), 1.0); }`);
    this.pl = prog(`attribute vec3 aP; uniform mat4 uMVP; void main(){ gl_Position = uMVP * vec4(aP, 1.0); }`,
      `precision mediump float; uniform vec4 uCol; void main(){ gl_FragColor = uCol; }`);
    this.geo = null; this.bufs = []; this.couleur = ""; this.plateau = true; this.fond = [0, 0, 0, 0]; this.lignes = [0.5, 0.55, 0.6];
    this.yaw = VUES_3D.iso[0]; this.pitch = VUES_3D.iso[1]; this.dist = 100; this.cible = [0, 0, 0]; this.fov = 0.6;
  }
  liberer() { const gl = this.gl; for (const b of this.bufs) gl.deleteBuffer(b); this.bufs = []; this.geo = null; }
  charger(g) {
    const gl = this.gl;
    this.liberer();
    const n = g.n, p = g.pos, nor = new Int8Array(n * 9), col = new Uint8Array(n * 9);
    for (let i = 0; i < n; i++) {
      const o = i * 9;
      const ux = p[o + 3] - p[o], uy = p[o + 4] - p[o + 1], uz = p[o + 5] - p[o + 2], vx = p[o + 6] - p[o], vy = p[o + 7] - p[o + 1], vz = p[o + 8] - p[o + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz);
      if (l > 0) { nx = nx / l * 127; ny = ny / l * 127; nz = nz / l * 127; } else { nx = 0; ny = 0; nz = 127; }
      const c = g.col ? [g.col[i * 3], g.col[i * 3 + 1], g.col[i * 3 + 2]] : GRIS_3D;
      for (let k = 0; k < 3; k++) { nor[o + k * 3] = nx; nor[o + k * 3 + 1] = ny; nor[o + k * 3 + 2] = nz; col[o + k * 3] = c[0]; col[o + k * 3 + 1] = c[1]; col[o + k * 3 + 2] = c[2]; }
    }
    const tampon = (d) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); this.bufs.push(b); return b; };
    this.bP = tampon(p); this.bN = tampon(nor); this.bC = tampon(col);
    // plateau quadrillé sous l'objet
    const t = Math.max(g.max[0] - g.min[0], g.max[1] - g.min[1]), pas = t > 400 ? 50 : t > 120 ? 20 : 10;
    const x0 = Math.floor((g.min[0] - t * 0.25) / pas) * pas, x1 = Math.ceil((g.max[0] + t * 0.25) / pas) * pas;
    const y0 = Math.floor((g.min[1] - t * 0.25) / pas) * pas, y1 = Math.ceil((g.max[1] + t * 0.25) / pas) * pas, z = g.min[2];
    const l = [];
    for (let x = x0; x <= x1 + 1e-6; x += pas) l.push(x, y0, z, x, y1, z);
    for (let y = y0; y <= y1 + 1e-6; y += pas) l.push(x0, y, z, x1, y, z);
    this.bG = tampon(new Float32Array(l)); this.nG = l.length / 3;
    this.geo = g; this.n = n;
    this.centre = [0, 1, 2].map(k => (g.min[k] + g.max[k]) / 2);
    this.rayon = Math.max(1e-6, Math.hypot(g.max[0] - g.min[0], g.max[1] - g.min[1], g.max[2] - g.min[2]) / 2);
    this.recadrer();
  }
  recadrer(vue) {
    const v = VUES_3D[vue || "iso"];
    this.yaw = v[0]; this.pitch = v[1];
    this.cible = this.centre ? this.centre.slice() : [0, 0, 0];
    this.dist = (this.rayon || 1) / Math.sin(this.fov / 2) * 1.08;
  }
  axes() {
    const cp = Math.cos(this.pitch), e = [Math.cos(this.yaw) * cp, Math.sin(this.yaw) * cp, Math.sin(this.pitch)];
    const droite = [-Math.sin(this.yaw), Math.cos(this.yaw), 0];
    const haut = [e[1] * droite[2] - e[2] * droite[1], e[2] * droite[0] - e[0] * droite[2], e[0] * droite[1] - e[1] * droite[0]];
    return {e, droite, haut};
  }
  orbiter(dx, dy) { this.yaw -= dx * 0.008; this.pitch = Math.max(-1.5697, Math.min(1.5697, this.pitch + dy * 0.008)); }
  deplacer(dx, dy, h) {
    const {droite, haut} = this.axes(), s = 2 * this.dist * Math.tan(this.fov / 2) / Math.max(1, h);
    for (let k = 0; k < 3; k++) this.cible[k] += (-dx * droite[k] + dy * haut[k]) * s;
  }
  zoomer(f) { const r = this.rayon || 1; this.dist = Math.max(r * 0.05, Math.min(r * 30, this.dist * f)); }
  dessiner() {
    const gl = this.gl, cv = this.cv;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(...this.fond);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!this.geo) return;
    gl.enable(gl.DEPTH_TEST);
    const {e} = this.axes(), oeil = [0, 1, 2].map(k => this.cible[k] + e[k] * this.dist);
    const r = this.rayon, proj = M4.perspective(this.fov, cv.width / Math.max(1, cv.height), Math.max(this.dist - r * 3, this.dist * 0.01, 1e-4), this.dist + r * 4);
    const vue = M4.vue(oeil, this.cible, [0, 0, 1]), mvp = M4.mul(proj, vue);
    gl.useProgram(this.pm);
    const u = (n) => gl.getUniformLocation(this.pm, n);
    gl.uniformMatrix4fv(u("uMVP"), false, new Float32Array(mvp));
    gl.uniformMatrix3fv(u("uNM"), false, new Float32Array([vue[0], vue[1], vue[2], vue[4], vue[5], vue[6], vue[8], vue[9], vue[10]]));
    const forcee = rgb3MF(this.couleur) || (this.geo.col ? null : GRIS_3D);
    gl.uniform3fv(u("uCol"), new Float32Array((forcee || GRIS_3D).map(x => x / 255)));
    gl.uniform1f(u("uForce"), forcee ? 1 : 0);
    const attr = (prog, nom, buf, taille, type, norm) => {
      const a = gl.getAttribLocation(prog, nom);
      if (a < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, taille, type, norm, 0, 0);
    };
    attr(this.pm, "aP", this.bP, 3, gl.FLOAT, false);
    attr(this.pm, "aN", this.bN, 3, gl.BYTE, true);
    attr(this.pm, "aC", this.bC, 3, gl.UNSIGNED_BYTE, true);
    gl.drawArrays(gl.TRIANGLES, 0, this.n * 3);
    for (const nom of ["aN", "aC"]) { const a = gl.getAttribLocation(this.pm, nom); if (a >= 0) gl.disableVertexAttribArray(a); }
    if (this.plateau) {
      gl.useProgram(this.pl);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.pl, "uMVP"), false, new Float32Array(mvp));
      gl.uniform4fv(gl.getUniformLocation(this.pl, "uCol"), new Float32Array([...this.lignes, 0.6]));
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      attr(this.pl, "aP", this.bG, 3, gl.FLOAT, false);
      gl.drawArrays(gl.LINES, 0, this.nG);
      gl.disable(gl.BLEND);
    }
  }
}

/* ---------- aperçus (rendus une fois sur l'appareil, gardés localement) */
const Apercus3D = {
  cle: (id) => "horaire_3d_apercu_" + id,
  lire(id) { return Stock.lire(this.cle(id), null); },
  file: Promise.resolve(), moteur: null,
  depuisGeo(id, g) {
    try {
      if (!this.moteur) { const c = el("canvas", {width: 320, height: 240}); this.moteur = new Rendu3D(c, true); }
      const r = this.moteur;
      r.couleur = ""; r.plateau = false; r.charger(g); r.dist *= 0.92; r.dessiner();
      const url = r.cv.toDataURL("image/png");
      r.liberer();
      Stock.ecrire(this.cle(id), url);
      return url;
    } catch (e) { return null; }
  },
  /* fabrique l'aperçu si le fichier est déjà sur l'appareil (jamais de téléchargement ici) */
  demander(f, rappel) {
    this.file = this.file.then(async () => {
      if (this.lire(f.id)) return rappel(this.lire(f.id));
      const u8 = await Fichiers.lireLocal(f.id);
      if (!u8) return;
      try { const url = this.depuisGeo(f.id, await lireObjet3D(u8, f.format)); if (url) rappel(url); } catch (e) { /* */ }
    });
  },
  oublier(id) { Stock.ecrire(this.cle(id), null); },
};

/* ---------- import */
async function importer3D(app, fichiers, progres) {
  const d = app.donnees, bilan = {objets: 0, gros: 0, erreurs: []}, taches = [];
  for (const f of fichiers) {
    const nom = nomPropre(f.name);
    if (/\.zip$/i.test(nom)) {
      const u8 = new Uint8Array(await f.arrayBuffer());
      for (const e of await lireZip(u8)) {
        const fin = e.nom.split("/").pop();
        if (format3D(fin) && !e.nom.split("/").some(x => x.startsWith("__MACOSX") || x.startsWith("."))) taches.push({nom: fin, lire: e.lire});
      }
    } else if (format3D(nom)) taches.push({nom, lire: async () => new Uint8Array(await f.arrayBuffer())});
    else bilan.erreurs.push(nom + " : seuls les fichiers .stl, .3mf (ou un .zip qui en contient) sont acceptés");
  }
  for (let i = 0; i < taches.length; i++) {
    const t = taches[i];
    if (progres) progres(i, taches.length, t.nom);
    try {
      const u8 = await t.lire(), format = format3D(t.nom), g = await lireObjet3D(u8, format), id = await empreinte(u8);
      await Fichiers.ecrireLocal(id, u8);
      if (!d.fichiers.some(x => x.id === id)) {
        const gros = u8.length > LIMITE_SYNC_3D;
        const ent = {id, nom: t.nom, taille: u8.length, n: Math.ceil(Math.ceil(u8.length / 3) * 4 / MORCEAU_PDF), pages: [], ajout: nowIsoMinutes(),
          type: "3d", format, triangles: g.n, dims: dims3D(g)};
        if (gros) { ent.local = true; bilan.gros++; } else Fichiers.marquer(id, false);
        d.fichiers.push(ent);
      }
      Apercus3D.depuisGeo(id, g);
      bilan.objets++;
    } catch (e) { bilan.erreurs.push(t.nom + " : " + (e && e.message || e)); }
  }
  if (progres) progres(taches.length, taches.length, "");
  app.sauver();
  Fichiers.relancer();
  return bilan;
}

function nombreFr(n) { return Number(n || 0).toLocaleString("fr-CA"); }
function mmFr(x) { return (Math.round(x * 10) / 10).toLocaleString("fr-CA"); }

/* ---------- l'onglet « 3D » */
class Page3D {
  constructor(app) {
    this.app = app; this.el = el("div.ecran.ecran-3d"); this.ouvert = null; this.vue = null;
  }
  /* préférences d'affichage propres à l'appareil (réglage local « vue3d », jamais synchronisé) */
  get ui() {
    const reg = this.app.reglages;
    let r = reg.vue3d;
    if (!r || typeof r !== "object") r = reg.vue3d = {};
    if (!r.couleurs || typeof r.couleurs !== "object") r.couleurs = {};
    if (typeof r.plateau !== "boolean") r.plateau = true;
    if (r.tri !== "nom") r.tri = "ajout";
    return r;
  }
  memo() { this.app.sauver(); }
  objet(id) { return objets3D(this.app.donnees).find(f => f.id === id) || null; }
  rafraichir() {
    if (this.ouvert && this.objet(this.ouvert)) { if (this.lblNom) this.lblNom.textContent = this.objet(this.ouvert).nom; return; }
    this.bibliotheque();
  }
  fermerVue() { if (this.vue) { this.vue.detruire(); this.vue = null; } this.ouvert = null; this.lblNom = null; }

  bibliotheque() {
    this.fermerVue();
    const z = this.el; z.innerHTML = ""; z.classList.remove("o3-ouvert");
    let l = objets3D(this.app.donnees).slice();
    if (this.ui.tri === "nom") l.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    else l.sort((a, b) => (b.ajout || "").localeCompare(a.ajout || ""));
    const tris = el("div.rapides");
    for (const [k, t] of [["ajout", "Récents"], ["nom", "Nom"]]) tris.append(petit(t, () => { this.ui.tri = k; this.memo(); this.bibliotheque(); }, this.ui.tri === k ? "tab_on" : "ghost"));
    z.append(el("header.res-entete.o3-entete", null,
      el("div", null, el("div.mono.muted", {texte: "STL · 3MF"}), el("h1.page-h1", {texte: "Objets 3D"}),
        el("div.petit.muted", {texte: l.length ? `${l.length} objet${l.length > 1 ? "s" : ""}` : "Aucun objet pour l'instant"})),
      el("div.o3-actions", null, tris, boutonIcone("plus", "Importer", () => this.importer(), "primary"))));
    if (!l.length) {
      z.append(el("div.carte.o3-vide", null, el("div.o3-vide-ico", null, icone("cube", 44)),
        el("p", {texte: "Importe des fichiers .stl ou .3mf (ou un .zip qui en contient) pour les voir en 3D."}),
        el("p.petit.muted", {texte: "Ils se synchronisent avec le PC. Les fichiers de plus de 25 Mo restent sur l'appareil qui les a importés."}),
        bouton("Importer des fichiers", () => this.importer(), "primary")));
      return;
    }
    const g = el("div.o3-grille");
    for (const f of l) g.append(this.carte(f));
    z.append(g);
  }
  carte(f) {
    const vis = el("div.o3-apercu", null, icone("cube", 40));
    const mettre = (url) => { vis.innerHTML = ""; vis.append(el("img", {src: url, alt: ""})); };
    const a = Apercus3D.lire(f.id);
    if (a) mettre(a); else Apercus3D.demander(f, mettre);
    const plus = el("button.o3-plus", {type: "button", title: "Options", onclick: (e) => { e.stopPropagation(); this.options(f); }}, icone("crayon", 16));
    const infos = [String(f.format || "").toUpperCase(), tailleLisible(f.taille), f.triangles ? nombreFr(f.triangles) + " triangles" : ""].filter(Boolean).join(" · ");
    const dims = Array.isArray(f.dims) && f.dims.length === 3 ? f.dims.map(mmFr).join(" × ") + " mm" : "";
    return el("div.carte.o3-carte", {role: "button", tabindex: 0, title: f.nom, onclick: () => this.ouvrir(f.id), onkeydown: (e) => { if (e.key === "Enter") this.ouvrir(f.id); }},
      vis, plus, el("div.o3-nom", {texte: f.nom.replace(/\.(stl|3mf)$/i, "")}), el("div.petit.muted.mono", {texte: infos}),
      dims ? el("div.petit.muted", {texte: dims}) : null,
      f.local ? el("div.o3-badge", {texte: "Trop gros pour la synchro"}) : null);
  }
  options(f) {
    const m = new Modal(f.nom, `${String(f.format || "").toUpperCase()} · ${tailleLisible(f.taille)}`);
    m.carte.append(el("div.o3-opts", null,
      bouton("Renommer", async () => { m.fermer(); const v = await demanderTexte("Renommer", "NOM", f.nom); if (v) { f.nom = v; this.app.sauver(); this.rafraichir(); } }, "ghost"),
      bouton("Exporter le fichier", async () => {
        try { const u8 = await Fichiers.obtenir(f.id); m.fermer(); await livrer([{nom: f.nom, blob: new Blob([u8], {type: "application/octet-stream"})}]); }
        catch (e) { m.erreur(e.message || String(e)); }
      }, "ghost"),
      bouton("Supprimer", async () => {
        m.fermer();
        if (!await dialogue("Supprimer cet objet?", `« ${f.nom} » sera retiré de l'ordinateur et de l'iPad.`, [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]])) return;
        this.app.donnees.fichiers = this.app.donnees.fichiers.filter(x => x.id !== f.id);
        Fichiers.supprimer(f.id); Apercus3D.oublier(f.id);
        this.app.sauver(); this.bibliotheque();
      }, "danger")));
    m.barre([], [bouton("Fermer", () => m.fermer(), "primary")]);
    m.montrer();
  }
  importer() {
    const inp = el("input", {type: "file", multiple: true, style: {display: "none"}});
    document.body.append(inp);
    inp.addEventListener("change", async () => {
      const fs = Array.from(inp.files || []); inp.remove();
      if (!fs.length) return;
      const m = new Modal("Importation", "Lecture des modèles 3D…");
      const barre = el("div.import-barre", null, el("span")), txt = el("p.petit.muted", {texte: "Lecture des fichiers…"});
      m.carte.append(barre, txt); m.clicVoile = () => {}; m.montrer();
      try {
        const b = await importer3D(this.app, fs, (i, n, nom) => { barre.firstChild.style.width = (n ? 100 * i / n : 0) + "%"; txt.textContent = nom ? `${i + 1} / ${n} — ${nom}` : "Terminé."; });
        m.fermer();
        const lignes = [];
        if (b.objets) lignes.push(`${b.objets} objet${b.objets > 1 ? "s" : ""} 3D ajouté${b.objets > 1 ? "s" : ""}.`);
        if (b.gros) lignes.push(`${b.gros} fichier${b.gros > 1 ? "s" : ""} de plus de 25 Mo reste${b.gros > 1 ? "nt" : ""} seulement sur cet appareil.`);
        if (this.app.sync.configuree() && b.objets > b.gros) lignes.push("Les fichiers partent vers l'autre appareil en arrière-plan.");
        if (b.erreurs.length) lignes.push("Problèmes :\n" + b.erreurs.slice(0, 8).join("\n"));
        if (lignes.length) informer("Importation terminée", lignes.join("\n\n"));
      } catch (e) { m.fermer(); informer("Importation impossible", e.message || String(e)); }
      this.bibliotheque();
    });
    inp.click();
  }

  /* ----- visionneuse */
  async ouvrir(id) {
    const f = this.objet(id);
    if (!f) return;
    this.fermerVue();
    this.ouvert = id;
    const z = this.el; z.innerHTML = ""; z.classList.add("o3-ouvert");
    this.lblNom = el("div.o3-titre", {texte: f.nom});
    const info = el("div.o3-info.mono.petit");
    const cv = el("canvas.o3-canvas");
    const etat = el("div.o3-etat", {texte: "Chargement…"});
    const scene = el("div.o3-scene", null, cv, etat, el("div.o3-aide.petit", {texte: "Un doigt : tourner · Deux doigts : zoomer et déplacer · Toucher deux fois : recadrer"}));
    const vues = el("div.rapides");
    for (const [k, t] of [["iso", "3D"], ["face", "Face"], ["cote", "Côté"], ["dessus", "Dessus"]]) vues.append(petit(t, () => { if (this.vue) { this.vue.r.recadrer(k); this.vue.peindre(); } }));
    const coul = el("div.o3-couleurs");
    const choix = this.ui.couleurs[id] || "";
    for (const [c, t] of COULEURS_3D) {
      const b = el("button.o3-pastille" + (c === choix ? ".on" : ""), {type: "button", title: t, style: {background: c || "conic-gradient(#e67e22, #27ae60, #2980b9, #8e44ad, #e67e22)"},
        onclick: () => { this.ui.couleurs[id] = c; if (!c) delete this.ui.couleurs[id]; this.memo(); coul.querySelectorAll(".on").forEach(x => x.classList.remove("on")); b.classList.add("on"); if (this.vue) { this.vue.r.couleur = c; this.vue.peindre(); } }});
      coul.append(b);
    }
    const plat = caseACocher(this.ui.plateau, (v) => { this.ui.plateau = v; this.memo(); if (this.vue) { this.vue.r.plateau = v; this.vue.peindre(); } }, "Plateau");
    z.append(el("header.o3-barre", null, boutonIcone("retour", "Objets", () => this.bibliotheque(), "ghost"), this.lblNom, el("div.espace"),
      vues, coul, plat, boutonIcone("exporter", "Options", () => this.options(f), "ghost")), scene, info);
    try {
      if (f.local && !(await Fichiers.lireLocal(id))) throw new Error("Ce fichier fait plus de 25 Mo : il ne passe pas par la synchro et reste sur l'appareil qui l'a importé.");
      const u8 = await Fichiers.obtenir(id);
      if (this.ouvert !== id) return;
      const g = await lireObjet3D(u8, f.format);
      if (this.ouvert !== id) return;
      this.vue = new Vue3D(cv, g, {couleur: choix, plateau: this.ui.plateau});
      etat.remove();
      const d = dims3D(g);
      info.textContent = `${d.map(mmFr).join(" × ")} mm  ·  ${nombreFr(g.n)} triangles  ·  ${tailleLisible(f.taille)}`;
      if (!Apercus3D.lire(id)) { Apercus3D.depuisGeo(id, g); }
    } catch (e) { etat.textContent = e.message || String(e); etat.classList.add("erreur"); }
  }
}

/* zone interactive : rotation, zoom, déplacement (doigt, Apple Pencil, souris, trackpad) */
class Vue3D {
  constructor(cv, g, opts) {
    this.cv = cv; this.r = new Rendu3D(cv); this.r.couleur = opts.couleur || ""; this.r.plateau = opts.plateau !== false;
    this.r.charger(g);
    this.pts = new Map(); this.base = null; this.tap = 0; this.aFaire = false;
    const ajuster = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
      if (w && h && (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr))) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      this.peindre();
    };
    this.ro = new ResizeObserver(ajuster); this.ro.observe(cv);
    ajuster();
    const etat = () => {
      const l = [...this.pts.values()];
      if (!l.length) return null;
      const x = l.reduce((a, p) => a + p.x, 0) / l.length, y = l.reduce((a, p) => a + p.y, 0) / l.length;
      return {x, y, d: l.length > 1 ? Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y) : 0, n: l.length};
    };
    this.on = [];
    const ec = (cible, type, fn, o) => { cible.addEventListener(type, fn, o); this.on.push([cible, type, fn, o]); };
    ec(cv, "pointerdown", (e) => {
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* */ }
      this.pts.set(e.pointerId, {x: e.clientX, y: e.clientY, b: e.button, maj: e.shiftKey});
      if (this.pts.size === 1) { const t = performance.now(); if (t - this.tap < 320) { this.r.recadrer(); this.peindre(); this.tap = 0; } else this.tap = t; }
      this.base = etat();
    });
    ec(cv, "pointermove", (e) => {
      const p = this.pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      const g2 = etat(), b = this.base;
      if (!b || !g2 || g2.n !== b.n) { this.base = g2; return; }
      const dx = g2.x - b.x, dy = g2.y - b.y;
      if (g2.n === 1) {
        if (p.b === 1 || p.b === 2 || p.maj) this.r.deplacer(dx, dy, cv.clientHeight); else this.r.orbiter(dx, dy);
      } else {
        if (b.d > 0 && g2.d > 0) this.r.zoomer(b.d / g2.d);
        this.r.deplacer(dx, dy, cv.clientHeight);
      }
      if (Math.abs(dx) + Math.abs(dy) > 4) this.tap = 0;
      this.base = g2;
      this.peindre();
    });
    const fin = (e) => { this.pts.delete(e.pointerId); this.base = etat(); };
    ec(cv, "pointerup", fin); ec(cv, "pointercancel", fin);
    ec(cv, "wheel", (e) => {
      e.preventDefault();
      if (e.shiftKey) this.r.deplacer(-e.deltaX || -e.deltaY, 0, cv.clientHeight);
      else this.r.zoomer(Math.exp(Math.max(-0.5, Math.min(0.5, e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)))));
      this.peindre();
    }, {passive: false});
    ec(cv, "contextmenu", (e) => e.preventDefault());
    for (const t of ["gesturestart", "gesturechange"]) ec(cv, t, (e) => e.preventDefault());
  }
  peindre() {
    if (this.aFaire) return;
    this.aFaire = true;
    requestAnimationFrame(() => { this.aFaire = false; if (this.r) this.r.dessiner(); });
  }
  detruire() {
    for (const [c, t, f, o] of this.on) c.removeEventListener(t, f, o);
    if (this.ro) this.ro.disconnect();
    if (this.r) { this.r.liberer(); const x = this.r.gl.getExtension("WEBGL_lose_context"); if (x) x.loseContext(); }
    this.r = null;
  }
}
