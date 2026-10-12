/* Transferts PC ↔ iPad : les fichiers restent sur le PC, qui les sert sur le réseau local ; rien ne passe par le nuage.
   Safari interdit à l'appli (HTTPS) de parler directement au PC (HTTP local) : on ouvre donc la page de transfert du PC dans Safari.
   Seule la fiche « transferts » est synchronisée (écrite par le PC) : adresse du PC et fichiers en attente,
   chaque fiche étant retirée par le PC dès que l'iPad a téléchargé le fichier. */
"use strict";

const TYPES_TRANSFERT = {pdf: "PDF", jpg: "Image", jpeg: "Image", png: "Image", txt: "Texte", zip: "Archive",
  stl: "3D", "3mf": "3D", obj: "3D", step: "3D", stp: "3D", amf: "3D", gcode: "Impression 3D", bgcode: "Impression 3D"};

/* fiche synchronisée, lue sans jamais la modifier ici (seul le PC l'écrit) */
function ficheTransferts(d) {
  const f = d && d.transferts && typeof d.transferts === "object" ? d.transferts : {};
  const pc = f.pc && typeof f.pc === "object" && typeof f.pc.url === "string" && /^http:\/\/[^/]+\/[^/]+\/$/.test(f.pc.url) ? f.pc : null;
  const attente = (Array.isArray(f.attente) ? f.attente : []).filter(x => x && x.id && x.nom);
  return {pc, enLigne: !!pc && (Number(pc.jusqua) || 0) > Date.now(), attente};
}

class PageTransferts {
  constructor(app) { this.app = app; this.el = el("div.ecran.ecran-transferts"); this._minuterie = null; }

  rafraichir() {
    clearTimeout(this._minuterie);
    const z = this.el; z.innerHTML = "";
    const {pc, enLigne, attente} = ficheTransferts(this.app.donnees);
    z.append(el("header.res-entete.tr-entete", null,
      el("div", null, el("div.mono.muted", {texte: "PC ↔ iPad"}), el("h1.page-h1", {texte: "Transferts"}),
        el("div.petit.muted", {texte: attente.length ? `${attente.length} fichier${attente.length > 1 ? "s" : ""} en attente sur le PC` : "Aucun fichier en attente"}))));
    z.append(this.carteConnexion(pc, enLigne));
    if (attente.length) {
      z.append(el("div.etiquette", {texte: "EN ATTENTE SUR LE PC"}));
      const c = el("div.carte.tr-liste");
      for (const x of attente.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))) c.append(this.ligne(x, pc, enLigne));
      z.append(c);
    }
    z.append(el("p.petit.muted.tr-note", {texte: "Les fichiers restent sur l'appareil qui les a : rien n'est stocké dans le nuage. "
      + "PDF, JPG, PNG, TXT, ZIP et fichiers 3D (STL, 3MF, OBJ, STEP, AMF, GCODE, BGCODE), 500 Mo au plus par fichier. "
      + "Une fois téléchargé, un fichier disparaît de cette liste (il reste sur le PC)."}));
    // la connexion annoncée par le PC expire si l'appli PC est fermée sans prévenir : on se remet à jour à l'échéance
    if (enLigne) this._minuterie = setTimeout(() => { if (!this.el.hidden) this.rafraichir(); }, Math.min(2147483647, Number(pc.jusqua) - Date.now() + 500));
  }

  carteConnexion(pc, enLigne) {
    const c = el("div.carte.tr-connexion");
    if (enLigne) {
      c.append(el("div.mono.muted", {texte: "CONNEXION AVEC LE PC"}),
        el("div.tr-etat.on", {texte: "PC « " + (pc.nom || "PC") + " » joignable"}),
        el("p.petit.muted", {texte: "L'iPad doit être sur le même Wi-Fi que le PC. La page s'ouvre dans Safari."}),
        el("div.tr-actions", null,
          lienBouton("Ouvrir la page du PC", pc.url, "primary"),
          lienBouton("Envoyer des fichiers au PC", pc.url + "#envoi", "ghost")));
    } else {
      c.append(el("div.mono.muted", {texte: "CONNEXION AVEC LE PC"}),
        el("div.tr-etat", {texte: "PC non joignable"}),
        el("p.petit.muted", {texte: "Sur le PC : ouvre l'appli Horaire → Transferts → « Activer ». Le PC doit rester allumé, avec l'appli ouverte, sur le même Wi-Fi que l'iPad."}));
    }
    return c;
  }

  ligne(x, pc, enLigne) {
    const ext = String(x.type || "").toLowerCase();
    const d = isoDate(String(x.date || "").slice(0, 10));
    const sous = [TYPES_TRANSFERT[ext] || "Fichier", tailleLisible(Number(x.taille) || 0), d ? `${dateCourte(d)} ${String(x.date).slice(11, 16)}` : ""].filter(Boolean).join(" · ");
    return el("div.tr-ligne", null,
      el("span.tr-type.mono", {texte: ext.toUpperCase() || "?"}),
      el("div.tr-infos", null, el("div.tr-nom", {texte: x.nom}), el("div.petit.muted", {texte: sous})),
      enLigne ? lienBouton("Télécharger", pc.url + "f/" + encodeURIComponent(x.id), "primary petit")
        : el("span.petit.muted", {texte: "PC hors ligne"}));
  }
}

/* un lien qui a l'air d'un bouton : ouvre la page du PC dans Safari (un lien est plus fiable qu'un window.open dans l'appli d'écran d'accueil) */
function lienBouton(texte, url, style) {
  return el("a.btn." + style.split(" ").join("."), {href: url, target: "_blank", rel: "noopener"}, texte);
}
