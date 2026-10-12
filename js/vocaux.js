/* Messages vocaux, onglets YouTube et Musique.
   - Enregistrement avec le micro de l'iPad (MediaRecorder, M4A / AAC ; pas de WebM/Opus, peu fiable sur iOS).
   - Le son reste sur l'appareil qui l'a enregistré ou importé (base IndexedDB « horaire_vocaux »), jamais dans Firebase.
     Seules les fiches (nom, durée, date, appareil…) sont synchronisées : une section « vx_<id> » par message.
   - YouTube et Apple Music s'ouvrent dans le navigateur (jamais intégrés, aucun identifiant demandé ni gardé). */
"use strict";

const VOCAL_MAX_S = 600;                       // 10 minutes
const VOCAL_MAX_O = 20 * 1024 * 1024;          // 20 Mo
const FORMATS_AUDIO = {mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg", webm: "audio/webm"};

/* ---------- stockage du son sur cet appareil */
const SonsLocaux = {
  db: null,
  async ouvrir() {
    if (this.db) return this.db;
    this.db = await new Promise((ok, ko) => {
      const r = indexedDB.open("horaire_vocaux", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("audio");
      r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); r.onblocked = () => ko(new Error("base bloquée"));
    });
    this.db.onclose = () => { this.db = null; };
    return this.db;
  },
  async lire(id) {
    try {
      const db = await this.ouvrir();
      return await new Promise((ok) => { const r = db.transaction("audio").objectStore("audio").get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); });
    } catch (e) { return null; }
  },
  /* renvoie true seulement une fois la transaction terminée */
  async ecrire(id, buf) {
    const db = await this.ouvrir();
    await new Promise((ok, ko) => {
      const tx = db.transaction("audio", "readwrite");
      tx.objectStore("audio").put(buf, id);
      tx.oncomplete = () => ok(); tx.onerror = () => ko(tx.error || new Error("écriture refusée")); tx.onabort = () => ko(tx.error || new Error("écriture annulée"));
    });
    this._ids = null;
    return true;
  },
  async effacer(id) {
    try { const db = await this.ouvrir(); db.transaction("audio", "readwrite").objectStore("audio").delete(id); } catch (e) { /* */ }
    this._ids = null;
  },
  async ids() {
    if (this._ids) return this._ids;
    try {
      const db = await this.ouvrir();
      this._ids = new Set(await new Promise((ok) => { const r = db.transaction("audio").objectStore("audio").getAllKeys(); r.onsuccess = () => ok(r.result || []); r.onerror = () => ok([]); }));
    } catch (e) { this._ids = new Set(); }
    return this._ids;
  },
};

/* ---------- petits outils */
function appareilIci() { return IPHONE ? "iPhone" : "iPad"; }
function fmtDureeAudio(s) {
  if (!(s > 0)) return "—";
  s = Math.round(s);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
function extAudio(nom) { const m = /\.([a-z0-9]+)$/i.exec(String(nom || "")); return m ? m[1].toLowerCase() : ""; }
function nomSansExt(nom) { return String(nom || "").replace(/\.[a-z0-9]{1,5}$/i, "").trim() || "Message vocal"; }
function nomVocalDefaut() {
  const d = new Date();
  return `Message vocal ${dateCourte(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function moTexte(o) { return (o / 1048576).toFixed(1).replace(".", ",").replace(",0", "") + " Mo"; }
/* le contenu correspond-il à l'extension ? (vérification légère des signatures) */
function verifierAudio(ext, u8) {
  const s = (a, b) => String.fromCharCode.apply(null, Array.from(u8.subarray(a, b)));
  if (u8.length < 12) return false;
  if (ext === "wav") return s(0, 4) === "RIFF" && s(8, 12) === "WAVE";
  if (ext === "mp3") return s(0, 3) === "ID3" || (u8[0] === 0xFF && (u8[1] & 0xE0) === 0xE0);
  if (ext === "m4a") return s(4, 8) === "ftyp";
  if (ext === "ogg") return s(0, 4) === "OggS";
  if (ext === "webm") return u8[0] === 0x1A && u8[1] === 0x45 && u8[2] === 0xDF && u8[3] === 0xA3;
  return false;
}
/* durée d'un WAV lue dans son en-tête (0 si illisible) */
function dureeWav(u8) {
  try {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let i = 12, debit = 0;
    while (i + 8 <= u8.length) {
      const id = String.fromCharCode(u8[i], u8[i + 1], u8[i + 2], u8[i + 3]), n = dv.getUint32(i + 4, true);
      if (id === "fmt ") debit = dv.getUint32(i + 16, true);
      if (id === "data") return debit ? Math.min(n, u8.length - i - 8) / debit : 0;
      i += 8 + n + (n & 1);
    }
  } catch (e) { /* */ }
  return 0;
}
/* durée annoncée par le lecteur du système (0 si inconnue, par ex. un WebM enregistré sans durée) */
function dureeAudio(blob) {
  return new Promise((ok) => {
    let fini = false;
    const u = URL.createObjectURL(blob), a = new Audio();
    const fin = (d) => { if (fini) return; fini = true; try { URL.revokeObjectURL(u); } catch (e) { /* */ } ok(isFinite(d) && d > 0 ? d : 0); };
    a.preload = "metadata";
    a.onloadedmetadata = () => fin(a.duration);
    a.onerror = () => fin(0);
    setTimeout(() => fin(0), 5000);
    a.src = u;
  });
}
function messageMicro(e) {
  const n = e && e.name;
  if (n === "NotAllowedError" || n === "SecurityError") return "L'accès au micro a été refusé. Autorise le micro pour Safari (Réglages de l'iPad → Safari → Microphone), puis réessaie.";
  if (n === "NotFoundError" || n === "OverconstrainedError") return "Aucun micro n'a été trouvé sur cet appareil.";
  if (n === "NotReadableError") return "Le micro est déjà utilisé par une autre application.";
  return "Le micro n'a pas pu être ouvert (" + String(e && (e.message || e.name) || e) + ").";
}

/* ---------- enregistrement (micro) */
class Enregistreur {
  /* M4A (AAC) seulement : pas de WebM/Opus, peu fiable sur iOS */
  static format() {
    if (typeof window.MediaRecorder !== "function" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
    for (const t of ["audio/mp4;codecs=mp4a.40.2", "audio/mp4"]) { try { if (MediaRecorder.isTypeSupported(t)) return t; } catch (e) { /* */ } }
    return null;
  }
  static raisonIndisponible() {
    if (!window.isSecureContext) return "L'enregistrement demande une connexion sécurisée (https).";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof window.MediaRecorder !== "function") return "Cet appareil ou ce navigateur ne permet pas d'enregistrer le son.";
    return "Ce navigateur n'enregistre pas en M4A (AAC), le seul format retenu pour l'iPad.";
  }
  constructor(surTic, surFin) { this.surTic = surTic; this.surFin = surFin; this.actif = false; }
  async demarrer() {
    const mime = Enregistreur.format();
    if (!mime) throw new Error(Enregistreur.raisonIndisponible());
    let flux;
    try { flux = await navigator.mediaDevices.getUserMedia({audio: true}); } catch (e) { throw new Error(messageMicro(e)); }
    this.flux = flux; this.morceaux = []; this.octets = 0; this.raison = ""; this.mime = mime;
    let rec;
    try { rec = new MediaRecorder(flux, {mimeType: mime, audioBitsPerSecond: 64000}); } catch (e) { this.couper(); throw new Error("L'enregistrement n'a pas pu démarrer (" + (e.message || e) + ")."); }
    this.rec = rec;
    rec.ondataavailable = (e) => {
      if (!e.data || !e.data.size) return;
      this.morceaux.push(e.data); this.octets += e.data.size;
      if (this.octets >= VOCAL_MAX_O - 256 * 1024) this.arreter("taille");
    };
    rec.onstop = () => this.fin();
    rec.onerror = (e) => { this.raison = "erreur"; this.erreur = (e && e.error && e.error.message) || "erreur du micro"; this.arreter("erreur"); };
    this.t0 = performance.now(); this.actif = true;
    rec.start(1000);
    this.job = setInterval(() => {
      const s = this.duree();
      if (this.surTic) this.surTic(s, this.octets);
      if (s >= VOCAL_MAX_S) this.arreter("duree");
    }, 250);
  }
  duree() { return this.actif ? (performance.now() - this.t0) / 1000 : (this.dureeFinale || 0); }
  arreter(raison) {
    if (!this.actif) return;
    this.dureeFinale = Math.min(VOCAL_MAX_S, (performance.now() - this.t0) / 1000);
    this.actif = false;
    if (!this.raison) this.raison = raison || "";
    clearInterval(this.job);
    try { if (this.rec && this.rec.state !== "inactive") this.rec.stop(); else this.fin(); } catch (e) { this.fin(); }
  }
  couper() { try { for (const t of this.flux.getTracks()) t.stop(); } catch (e) { /* */ } }
  fin() {
    if (this._fini) return;
    this._fini = true;
    this.couper();
    const blob = new Blob(this.morceaux || [], {type: "audio/mp4"});
    if (this.surFin) this.surFin(blob, this.dureeFinale || 0, this.raison);
  }
}

/* ---------- lecture (un seul son à la fois) */
const Lecteur = {
  audio: null, id: null, url: null, ecoutes: new Set(), erreur: "",
  etat(id) {
    const a = this.audio, moi = a && this.id === id;
    return {joue: !!(moi && !a.paused && !a.ended), t: moi ? a.currentTime || 0 : 0, d: moi && isFinite(a.duration) ? a.duration : 0};
  },
  prevenir() { for (const f of this.ecoutes) { try { f(this.id); } catch (e) { /* */ } } },
  arreter() {
    if (this.audio) { try { this.audio.pause(); } catch (e) { /* */ } }
    if (this.url) { URL.revokeObjectURL(this.url); this.url = null; }
    this.audio = null; this.id = null;
    this.prevenir();
  },
  async basculer(v) {
    if (this.audio && this.id === v.id) {
      if (this.audio.paused || this.audio.ended) { try { await this.audio.play(); } catch (e) { return this.echec(e); } } else this.audio.pause();
      this.prevenir();
      return null;
    }
    this.arreter();
    const buf = await SonsLocaux.lire(v.id);
    if (!buf) return "Le son de ce message n'est pas sur cet appareil.";
    const a = new Audio();
    this.url = URL.createObjectURL(new Blob([buf], {type: FORMATS_AUDIO[v.format] || "audio/mp4"}));
    this.audio = a; this.id = v.id;
    for (const ev of ["play", "pause", "ended", "timeupdate", "loadedmetadata"]) a.addEventListener(ev, () => { if (this.audio === a) this.prevenir(); });
    a.addEventListener("error", () => { if (this.audio === a) { this.arreter(); this.signaler("Ce format ne peut pas être lu sur cet appareil."); } });
    a.src = this.url;
    try { await a.play(); } catch (e) { return this.echec(e); }
    this.prevenir();
    return null;
  },
  echec(e) {
    const msg = e && e.name === "NotSupportedError" ? "Ce format ne peut pas être lu sur cet appareil." : "La lecture n'a pas pu démarrer (" + String(e && (e.message || e.name) || e) + ").";
    this.arreter();
    return msg;
  },
  signaler(msg) { this.erreur = msg; if (this.surErreur) this.surErreur(msg); },
  chercher(id, frac) {
    const a = this.audio;
    if (!a || this.id !== id || !isFinite(a.duration) || !a.duration) return;
    a.currentTime = Math.max(0, Math.min(1, frac)) * a.duration;
    this.prevenir();
  },
};

/* ---------- données */
function listeVocaux(app) { if (!Array.isArray(app.donnees.vocaux)) app.donnees.vocaux = []; return app.donnees.vocaux; }
function vocauxDe(app, cible) {
  const l = listeVocaux(app);
  if (cible && cible.note) return l.filter(v => v.note === cible.note);
  if (cible && cible.bloc) return l.filter(v => v.bloc === cible.bloc);
  if (cible && cible.dossier) return l.filter(v => v.dossier === cible.dossier);
  return l;
}
function champsCible(cible) {
  return {note: (cible && cible.note) || "", dossier: (cible && cible.dossier) || "", bloc: (cible && cible.bloc) || "", horaire: (cible && cible.bloc) ? (cible.horaire || HID) : ""};
}
function nouvelleFiche(app, cible, o) {
  return Object.assign({id: newId(), nom: "Message vocal", duree: 0, date: nowIsoMinutes(), appareil: appareilIci(), src: app.sync ? app.sync.cfg.appareil : "",
    format: "m4a", taille: 0}, champsCible(cible), o);
}
/* un message supprimé sur l'autre appareil : on efface aussi le son d'ici */
function menageVocaux(app, noms) {
  const ids = new Set(listeVocaux(app).map(v => v.id));
  for (const n of noms) if (n.startsWith("vx_") && !ids.has(n.slice(3))) SonsLocaux.effacer(n.slice(3));
}

/* importe des fichiers audio ; renvoie {ajoutes, erreurs} */
async function importerAudios(app, fichiers, cible) {
  const ajoutes = [], erreurs = [];
  for (const f of fichiers) {
    const ext = extAudio(f.name);
    if (!FORMATS_AUDIO[ext]) { erreurs.push(`« ${f.name} » : format non pris en charge (MP3, M4A, WAV, OGG ou WebM).`); continue; }
    if (f.size > VOCAL_MAX_O) { erreurs.push(`« ${f.name} » fait ${moTexte(f.size)} : la limite est de ${moTexte(VOCAL_MAX_O)}.`); continue; }
    if (!f.size) { erreurs.push(`« ${f.name} » est vide.`); continue; }
    let buf;
    try { buf = await f.arrayBuffer(); } catch (e) { erreurs.push(`« ${f.name} » n'a pas pu être lu.`); continue; }
    const u8 = new Uint8Array(buf);
    if (!verifierAudio(ext, u8)) { erreurs.push(`« ${f.name} » ne semble pas être un fichier ${ext.toUpperCase()} valide.`); continue; }
    let duree = ext === "wav" ? dureeWav(u8) : 0;
    if (!duree) duree = await dureeAudio(new Blob([buf], {type: FORMATS_AUDIO[ext]}));
    if (duree > VOCAL_MAX_S + 1) { erreurs.push(`« ${f.name} » dure ${fmtDureeAudio(duree)} : la limite est de 10 minutes.`); continue; }
    const v = nouvelleFiche(app, cible, {nom: nomSansExt(f.name), duree: Math.round(duree), format: ext, taille: f.size});
    try { await SonsLocaux.ecrire(v.id, buf); } catch (e) { erreurs.push(`« ${f.name} » : la mémoire de l'appareil est pleine.`); continue; }
    listeVocaux(app).push(v);
    ajoutes.push(v);
  }
  if (ajoutes.length) app.sauver();
  return {ajoutes, erreurs};
}

/* exporte des messages (feuille de partage de l'iPad, sinon téléchargement) */
async function exporterVocaux(liste) {
  const ici = await SonsLocaux.ids(), fichiers = [], ailleurs = [], vus = new Set();
  for (const v of liste) {
    if (!ici.has(v.id)) { ailleurs.push(v); continue; }
    const buf = await SonsLocaux.lire(v.id);
    if (!buf) { ailleurs.push(v); continue; }
    let base = nomFichierSur(v.nom), nom = base + "." + (v.format || "m4a"), i = 2;
    while (vus.has(nom.toLowerCase())) nom = `${base} (${i++}).${v.format || "m4a"}`;
    vus.add(nom.toLowerCase());
    fichiers.push({nom, blob: new Blob([buf], {type: FORMATS_AUDIO[v.format] || "audio/mp4"})});
  }
  const res = fichiers.length ? await livrer(fichiers) : "";
  return {res, n: fichiers.length, ailleurs};
}

/* ---------- fenêtre « Messages vocaux » d'une note, d'un dossier ou d'un bloc de l'horaire */
class FenetreVocaux extends Modal {
  constructor(app, cible, libelle) {
    super("Messages vocaux", libelle || "Tous les messages", {classe: "vocaux"});
    this.app = app; this.cible = cible || {};
    this.choisis = new Set();
    this.rec = null;
    this.zoneRec = el("div.carte.vx-rec");
    this.lblRec = el("span.mono.vx-chrono");
    this.liste = el("div.vx-liste");
    this.btnExport = boutonIcone("exporter", "Exporter", () => this.exporter(), "ghost");
    this.entreeFichier = el("input", {type: "file", multiple: true, hidden: true, accept: "audio/*,.mp3,.m4a,.wav,.ogg,.webm",
      onchange: () => { const fs = Array.from(this.entreeFichier.files || []); this.entreeFichier.value = ""; if (fs.length) this.importer(fs); }});
    this.carte.append(this.zoneRec,
      el("div.vx-outils", null, boutonIcone("plus", "Importer…", () => this.entreeFichier.click(), "ghost"), this.btnExport, el("span.espace"),
        el("span.petit.muted.vx-nb")),
      this.liste, this.entreeFichier,
      el("p.petit.muted.vx-note", {texte: "Le son reste sur l'appareil qui l'a enregistré ou importé : seuls le nom, la durée, la date et l'appareil sont synchronisés. "
        + "10 minutes et 20 Mo au plus par message. Import : MP3, M4A, WAV, OGG ou WebM."}));
    this.barre([], [bouton("Fermer", () => this.fermer(), "primary")]);
    this.ecoute = () => this.majLecture();
    Lecteur.ecoutes.add(this.ecoute);
    Lecteur.surErreur = (m) => this.erreur(m);
    this.dessinerRec();
    this.dessiner();
  }
  fermer() {
    if (this.rec && this.rec.actif) { this._fermerApres = true; this.rec.arreter("fermeture"); return; }
    Lecteur.ecoutes.delete(this.ecoute);
    Lecteur.arreter();
    super.fermer();
    if (this.apresFermer) this.apresFermer();
  }
  dessinerRec() {
    const z = this.zoneRec; z.innerHTML = "";
    if (this.rec && this.rec.actif) {
      z.classList.add("en-cours");
      z.append(el("span.vx-point"), el("div.vx-rec-txt", null, el("b", {texte: "Enregistrement…"}), this.lblRec),
        el("span.espace"), bouton("Arrêter", () => this.rec.arreter("bouton"), "danger"));
      this.majChrono(0, 0);
      return;
    }
    z.classList.remove("en-cours");
    const dispo = !!Enregistreur.format();
    z.append(el("span.badge.vx-badge", null, icone("micro", 22)),
      el("div.vx-rec-txt", null, el("b", {texte: "Nouveau message"}),
        el("span.petit.muted", {texte: dispo ? "Touche « Enregistrer », parle, puis « Arrêter »." : Enregistreur.raisonIndisponible()})),
      el("span.espace"), bouton("Enregistrer", () => this.enregistrer(), dispo ? "primary" : "ghost"));
  }
  majChrono(s, octets) {
    this.lblRec.textContent = `${fmtDureeAudio(Math.floor(s)).replace("—", "0:00")} / 10:00` + (octets ? `  ·  ${tailleLisible(octets)}` : "");
  }
  async enregistrer() {
    this.erreur("");
    if (!Enregistreur.format()) { informer("Enregistrement indisponible", Enregistreur.raisonIndisponible() + " Tu peux toujours importer un fichier audio."); return; }
    Lecteur.arreter();
    const r = new Enregistreur((s, o) => this.majChrono(s, o), (blob, duree, raison) => this.termine(blob, duree, raison));
    this.rec = r;
    try { await r.demarrer(); } catch (e) { this.rec = null; this.dessinerRec(); informer("Enregistrement impossible", String(e.message || e)); return; }
    this.dessinerRec();
  }
  async termine(blob, duree, raison) {
    this.rec = null;
    this.dessinerRec();
    let msg = "";
    if (raison === "duree") msg = "La limite de 10 minutes est atteinte : l'enregistrement a été arrêté et gardé.";
    if (raison === "taille") msg = "La limite de 20 Mo est atteinte : l'enregistrement a été arrêté et gardé.";
    if (!blob.size || duree < 0.3) {
      if (raison === "erreur") informer("Enregistrement", "Le micro s'est arrêté : rien n'a été enregistré.");
      else this.erreur("Rien n'a été enregistré.");
    } else if (blob.size > VOCAL_MAX_O) {
      informer("Enregistrement trop gros", `L'enregistrement fait ${moTexte(blob.size)} : la limite est de ${moTexte(VOCAL_MAX_O)}. Il n'a pas été gardé.`);
    } else {
      const v = nouvelleFiche(this.app, this.cible, {nom: nomVocalDefaut(), duree: Math.max(1, Math.round(duree)), format: "m4a", taille: blob.size});
      try {
        await SonsLocaux.ecrire(v.id, await blob.arrayBuffer());
        listeVocaux(this.app).push(v);
        this.app.sauver();
        Notifs.bulle(`Enregistré : ${v.nom} (${fmtDureeAudio(v.duree)})`);
        this.dernier = v.id;
      } catch (e) { informer("Enregistrement", "Le message n'a pas pu être gardé : la mémoire de l'appareil est pleine."); }
    }
    if (msg) informer("Enregistrement", msg);
    if (this._fermerApres) { this._fermerApres = false; this.fermer(); return; }
    this.dessiner();
  }
  async importer(fs) {
    this.erreur("");
    const {ajoutes, erreurs} = await importerAudios(this.app, fs, this.cible);
    this.dessiner();
    if (ajoutes.length) Notifs.bulle(`${ajoutes.length} fichier${ajoutes.length > 1 ? "s" : ""} importé${ajoutes.length > 1 ? "s" : ""}`);
    if (erreurs.length) informer("Importer", erreurs.join("\n"));
  }
  async exporter() {
    const l = vocauxDe(this.app, this.cible).filter(v => this.choisis.has(v.id));
    if (!l.length) { this.erreur("Coche d'abord un ou plusieurs messages."); return; }
    this.erreur("");
    const {n, ailleurs} = await exporterVocaux(l);
    if (ailleurs.length) {
      informer("Exporter", (n ? `${n} message${n > 1 ? "s" : ""} exporté${n > 1 ? "s" : ""}. ` : "")
        + `${ailleurs.length} message${ailleurs.length > 1 ? "s sont" : " est"} sur un autre appareil (${[...new Set(ailleurs.map(v => v.appareil || "autre appareil"))].join(", ")}) : exporte-${ailleurs.length > 1 ? "les" : "le"} depuis là-bas.`);
    }
  }
  async dessiner() {
    const l = vocauxDe(this.app, this.cible).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const ici = await SonsLocaux.ids();
    for (const id of [...this.choisis]) if (!l.some(v => v.id === id)) this.choisis.delete(id);
    const z = this.liste; z.innerHTML = "";
    this.lignes = new Map();
    this.carte.querySelector(".vx-nb").textContent = l.length ? `${l.length} message${l.length > 1 ? "s" : ""}` : "";
    this.btnExport.querySelector("span:last-child").textContent = this.choisis.size ? `Exporter (${this.choisis.size})` : "Exporter";
    if (!l.length) { z.append(el("div.muted.vx-vide", {texte: "Aucun message vocal ici pour l'instant."})); return; }
    for (const v of l) z.append(this.ligne(v, ici.has(v.id)));
    this.majLecture();
  }
  ligne(v, local) {
    const case_ = caseACocher(this.choisis.has(v.id), (on) => { if (on) this.choisis.add(v.id); else this.choisis.delete(v.id); this.btnExport.querySelector("span:last-child").textContent = this.choisis.size ? `Exporter (${this.choisis.size})` : "Exporter"; });
    const jouer = el("button.vx-jouer", {type: "button", disabled: !local, title: local ? "Lecture / pause" : "Le son est sur un autre appareil",
      onclick: async () => { this.erreur(""); const err = await Lecteur.basculer(v); if (err) this.erreur(err); }}, icone("lecture", 20));
    const barre = el("div.vx-barre", null, el("span"));
    barre.addEventListener("click", (e) => { const r = barre.getBoundingClientRect(); Lecteur.chercher(v.id, (e.clientX - r.left) / Math.max(1, r.width)); });
    const temps = el("span.mono.petit.muted.vx-temps", {texte: fmtDureeAudio(v.duree)});
    const d = isoDate(String(v.date).slice(0, 10));
    const sous = [fmtDureeAudio(v.duree), d ? `${dateCourte(d)} ${String(v.date).slice(11, 16)}` : "", v.appareil || "", (v.format || "").toUpperCase(),
      local ? "" : `fichier sur ${v.appareil === "PC" ? "le PC" : v.appareil ? "l'" + v.appareil : "un autre appareil"}`].filter(Boolean).join("  ·  ");
    const ligne = el("div.vx-ligne" + (local ? "" : ".ailleurs") + (this.dernier === v.id ? ".nouveau" : ""), null, case_, jouer,
      el("div.vx-infos", null, el("div.vx-nom", {texte: v.nom}), el("div.petit.muted", {texte: sous}), local ? el("div.vx-prog", null, barre, temps) : null),
      boutonIcone("crayon", "", () => this.renommer(v), "ghost"),
      boutonIcone("corbeille", "", () => this.supprimer(v, local), "ghost"));
    this.lignes.set(v.id, {jouer, barre, temps, v});
    return ligne;
  }
  majLecture() {
    if (!this.lignes) return;
    for (const [id, x] of this.lignes) {
      const e = Lecteur.etat(id), d = e.d || x.v.duree || 0;
      x.jouer.innerHTML = ""; x.jouer.append(icone(e.joue ? "pause" : "lecture", 20));
      x.jouer.classList.toggle("on", e.joue);
      x.barre.firstChild.style.width = (d ? Math.min(1, e.t / d) * 100 : 0) + "%";
      x.temps.textContent = Lecteur.id === id ? `${fmtDureeAudio(Math.floor(e.t)).replace("—", "0:00")} / ${fmtDureeAudio(d)}` : fmtDureeAudio(x.v.duree);
    }
  }
  async renommer(v) {
    const nom = await demanderTexte("Renommer", "Nom du message", v.nom);
    if (!nom || nom === v.nom) return;
    v.nom = nom; this.app.sauver(); this.dessiner();
  }
  async supprimer(v, local) {
    const ok = await dialogue("Supprimer", `Supprimer « ${v.nom} » ?` + (local ? "" : `\n\nLe son est sur ${v.appareil === "PC" ? "le PC" : "un autre appareil"} : il y sera effacé à la prochaine synchronisation.`),
      [["Annuler", false, "ghost"], ["Supprimer", true, "danger"]]);
    if (!ok) return;
    if (Lecteur.id === v.id) Lecteur.arreter();
    const l = listeVocaux(this.app), i = l.findIndex(x => x.id === v.id);
    if (i >= 0) l.splice(i, 1);
    this.choisis.delete(v.id);
    await SonsLocaux.effacer(v.id);
    this.app.sauver();
    this.dessiner();
  }
}
/* bouton « micro » des éditeurs : ouvre les messages vocaux d'une cible */
function boutonVocaux(app, cible, libelle, avant) {
  const nb = el("span.vx-compte");
  const maj = () => { const k = vocauxDe(app, cible).length; nb.textContent = k ? String(k) : ""; };
  const b = boutonIcone("micro", "", () => {
    if (avant) avant();
    const f = new FenetreVocaux(app, cible, libelle);
    f.apresFermer = maj;
    f.montrer();
  }, "ghost");
  b.title = "Messages vocaux";
  b.classList.add("btn-vocaux");
  b.append(nb);
  maj();
  return b;
}

/* ---------- onglets YouTube et Musique : s'ouvrent dans le navigateur (jamais intégrés) */
const LIENS_EXTERNES = {
  youtube: {titre: "YouTube", sur: "VIDÉOS", url: "https://www.youtube.com/",
    texte: "YouTube ne peut pas s'afficher dans l'appli (il bloque l'intégration) : il s'ouvre dans ton navigateur.",
    note: "Ta connexion à YouTube, s'il y en a une, se fait dans le navigateur : l'appli ne demande ni ne garde aucun identifiant."},
  musique: {titre: "Musique", sur: "APPLE MUSIC", url: "https://music.apple.com/",
    texte: "Apple Music s'ouvre dans ton navigateur (music.apple.com). La lecture et les contrôles se font là-bas.",
    note: "Pas de lecture ni de contrôle depuis l'appli. La connexion à ton compte se fait sur le site d'Apple : l'appli ne demande ni ne garde aucun identifiant."},
};
class PageLien {
  constructor(app, cle) { this.app = app; this.cle = cle; this.el = el("div.ecran.ecran-lien"); }
  rafraichir() {
    const x = LIENS_EXTERNES[this.cle], z = this.el;
    z.innerHTML = "";
    z.append(el("header.res-entete.tr-entete", null,
      el("div", null, el("div.mono.muted", {texte: x.sur}), el("h1.page-h1", {texte: x.titre}), el("div.petit.muted", {texte: "S'ouvre dans le navigateur"}))));
    const a = lienBouton("Ouvrir dans le navigateur", x.url, "primary");
    a.rel = "noopener noreferrer";
    z.append(el("div.carte.lien-carte", {style: {"--c": couleurApp(this.cle)}},
      el("span.badge.lien-badge", null, iconePage(this.cle, 30)),
      el("div.lien-txt", null, el("h2", {texte: x.titre}), el("p.muted", {texte: x.texte}), el("div.lien-actions", null, a), el("div.mono.petit.muted.lien-url", {texte: x.url.replace(/^https:\/\//, "").replace(/\/$/, "")}))));
    z.append(el("p.petit.muted.tr-note", {texte: x.note}));
  }
}
