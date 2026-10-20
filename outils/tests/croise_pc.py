import json, sys, random
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, donnees_base
CLE = sys.argv[1]
H = charger("/home/claude/pc/horaire_v33.py", donnees_base())
json.dump({"actif": True, "url": "http://localhost:8790", "cle": CLE, "appareil": "pc-croise", "base": {}, "tl": {}, "supprimees": []}, open(H.SYNC_FILE, "w"))
app = H.App(); pomper(app, 3)
px = [None] * 256
for i in range(256):
    if (i % 16) in range(3, 13) and (i // 16) in range(2, 14):
        px[i] = H.couleur_libre(((i % 16) - 3) * 36, 50) if (i % 7) else "#ffffff"
sp = H.sprite_de_grille(px, 16)
c = H.creer_autocollant(app, "Couleurs libres du PC", sp)
c["rows"] = H.SPRITES[c["id"]]["rows"]; c["pal"] = H.SPRITES[c["id"]]["pal"]
H.basculer_favori(app, "p_bolide_bleu")
pomper(app, 4)
json.dump(c, open("/home/claude/tests/croise.json", "w"))
verif(c is not None, "PC : autocollant créé et envoyé")
sys.exit(bilan())
