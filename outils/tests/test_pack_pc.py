# Étape 3 (PC) : paquet décodé à la demande, identique à l'iPad
import json, sys, time
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, capture, donnees_base
d = donnees_base()
H = charger(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/pc/horaire_v32.py", d)
verif(not H.PACK_AC["pret"] and len(H.JX["autocollants"]) == 166, "chargement du module : paquet non décodé, 166 autocollants")
t = time.time(); H.charger_pack(); dt_ = time.time() - t
verif(H.PACK_AC["pret"] and len(H.JX["autocollants"]) == 1016, f"charger_pack : 1016 autocollants en {dt_*1000:.0f} ms")
pc = [[a[0], a[1], a[2], a[3], H.SPRITES[a[0]]["pal"], H.SPRITES[a[0]]["rows"], (H.JX.get("effets") or {}).get(a[0], ""), H.rarete_ac(a[0]), H.theme_ac(a[0])] for a in H.JX["autocollants"]]
js = json.load(open("/home/claude/tests/pack_js.json"))
diff = [i for i, (a, b) in enumerate(zip(pc, js)) if json.dumps(a, sort_keys=True, ensure_ascii=False) != json.dumps(b, sort_keys=True, ensure_ascii=False)]
verif(len(pc) == len(js) and not diff, f"PC = iPad : mêmes ids, noms, prix, rangées, dessins, effets, raretés, thèmes ({len(pc)} / {len(js)}, {len(diff)} différences)")
# note qui contient un autocollant du paquet (nouveau module, paquet non chargé)
d2 = donnees_base()
d2["notes"][0]["autocollants"].append({"id": "z1", "s": "p_bolide_bleu", "p": "p1", "x": 300, "y": 800, "t": 120, "r": 30})
H = charger(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/pc/horaire_v32.py", d2)
app = H.App()
verif(H.PACK_AC["pret"], "démarrage avec une note qui l'utilise : paquet décodé")
pomper(app, .8)
app.ouvrir_notes("n1"); pomper(app, 1.2)
ed = app.ecrans["notes"].ed
fe = ed.feuilles["p1"]
verif(bool(fe["cv"].find_withtag("ac_z1")), "autocollant du paquet dessiné dans le cahier")
ed.choisir_ac("z1"); pomper(app, .3)
capture("pack_note_pc")
sys.exit(bilan())
