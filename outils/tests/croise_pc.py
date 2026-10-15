import json, sys, random
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, donnees_base
CLE = sys.argv[1]
H = charger("/home/claude/pc/horaire_v31.py", donnees_base())
json.dump({"actif": True, "url": "http://localhost:8790", "cle": CLE, "appareil": "pc-croise", "base": {}, "tl": {}, "supprimees": []}, open(H.SYNC_FILE, "w"))
app = H.App(); pomper(app, 3)
c = H.creer_autocollant(app, "Créé sur le PC", "A112233B445566;4:AABBAABBAABBAABB")
H.basculer_favori(app, "p_bolide_bleu")
pomper(app, 4)
json.dump(c, open("/home/claude/tests/croise.json", "w"))
verif(c is not None, "PC : autocollant créé et envoyé")
sys.exit(bilan())
