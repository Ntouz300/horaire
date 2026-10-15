# Outils de développement (non chargés par l'appli)

- `autocollants/` : générateur du paquet `js/pack_ac.json` (v29) et du bloc `PACK_AC_Z` du fichier PC.
  `formes.py` (dessins de base) → `gen_pack.py` (variantes, raretés, prix) → `build_pack.py` (écrit `js/pack_ac.json` et `pack_z.txt`)
  → `integrer_pc.py <horaire_vN.py>` (remplace le bloc `# <PACK_AC>` du PC). `planche.py` : planche de contrôle visuel.
  Les chemins sont ceux de la session (/home/claude/gen, /home/claude/horaire) : les adapter.
- `tests/` : tests Playwright (iPad/iPhone, serveur local `python3 -m http.server 8765`) et Tk (PC, xvfb + Python uv 3.12),
  faux Firebase `fakefb.js` (port 8790), comparaisons PC ↔ iPad (`cmp_*`), RTP du gain d'autocollants (`rtp.py`).
