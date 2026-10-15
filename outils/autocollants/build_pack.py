# Produit le paquet d'autocollants final, identique pour les deux versions :
#  - iPad : js/pack_ac.json (fichier séparé, chargé à la demande)
#  - PC   : constante PACK_AC_Z = base64(zlib(mêmes octets)) dans horaire_vN.py, décodée à la demande
import json, zlib, base64, sys, collections
sys.path.insert(0, "/home/claude/gen")
from gen_pack import construire

sprites, liste, effets = construire()
groupes = collections.OrderedDict()
for sid, nom, prix, rangee, theme, rar in liste:
    groupes.setdefault((theme, rangee, rar), []).append([sid, nom, prix, sprites[sid]])
# thème des autocollants déjà présents (rangée -> thème) : pour le filtre par thème de l'inventaire
THEMES_BASE = {"Hollow Knight": "Hollow Knight", "Hollow Knight · rares": "Hollow Knight", "Hollow Knight · petites bêtes": "Hollow Knight",
               "Hollow Knight · petites bêtes rares": "Hollow Knight", "Étoiles et ciel": "Espace", "Animaux": "Animaux", "Objets": "Classiques",
               "Cœurs et fleurs": "Classiques", "Petits cœurs": "Classiques", "Petites étoiles": "Classiques", "Formes": "Classiques",
               "Symboles": "Classiques", "Visages": "Classiques", "Fruits et collations": "Nourriture", "École": "Classiques",
               "Nature": "Météo et saisons", "Mots": "Classiques"}
P = {"v": 1, "g": [[t, r, k, l] for (t, r, k), l in groupes.items()], "themes": THEMES_BASE}
octets = json.dumps(P, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
open("/home/claude/horaire/js/pack_ac.json", "wb").write(octets)
z = base64.b64encode(zlib.compress(octets, 9)).decode("ascii")
open("/home/claude/gen/pack_z.txt", "w").write(z)
print("pack_ac.json :", len(octets), "octets ; PC (zlib+base64) :", len(z), "octets ;", len(liste), "autocollants")
