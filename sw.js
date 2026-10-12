/* Service worker : l'app s'ouvre même sans Internet (les données restent sur l'iPad et se synchronisent au retour). */
const VERSION = "horaire-v17";
const FICHIERS = ["./", "index.html", "app.css?v=17", "manifest.webmanifest", "icones/icone-180.png", "icones/icone-192.png", "icones/icone-512.png",
  "js/base.js?v=17", "js/stickers.js?v=17", "js/icones.js?v=17", "js/ui.js?v=17", "js/sync.js?v=17", "js/main.js?v=17", "js/grille.js?v=17", "js/panneaux.js?v=17", "js/editeurs.js?v=17",
  "js/horloge.js?v=17", "js/dessin.js?v=17", "js/menu.js?v=17", "js/cahiers.js?v=17", "js/pdfs.js?v=17", "js/exports.js?v=17", "js/objets3d.js?v=17", "js/transferts.js?v=17", "js/goodnotes.js?v=17",
  "js/vendor/pdf.min.mjs", "js/vendor/pdf.worker.min.mjs"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (/firebaseio\.com|firebasedatabase\.app/.test(u.hostname)) return;   // la synchro passe toujours par le réseau
  if (u.origin === location.origin) {
    // réseau d'abord (mises à jour), cache si hors ligne
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: false}).then(r => r || caches.match("index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(rr => { const c = rr.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return rr; })));
  }
});
