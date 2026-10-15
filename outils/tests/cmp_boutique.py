# compare la boutique du jour et les dates de Toronto PC <-> iPad (sur 400 jours, et des instants autour des changements d'heure)
import json, sys, subprocess
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan
H = charger("/home/claude/pc/horaire_v31.py")
H.charger_pack()
jours = [H.decaler_jour("2026-01-01", i) for i in range(0, 800, 2)]
inst = []
for y in (2026, 2027, 2028):
    for m, d in ((3, 8), (3, 9), (3, 14), (3, 13), (11, 1), (11, 7), (11, 6), (3, 12), (11, 5)):
        for h in range(0, 24):
            for mn in (0, 59):
                inst.append(H._utc_ms(y, m, d, h) + mn * 60000)
pc = {"b": [H.boutique_du_jour(j) for j in jours], "j": [H.jour_toronto(t) for t in inst], "f": [H.fin_jour_toronto(t) for t in inst],
      "l": [H.lundi_toronto(j) for j in jours], "a": [H.AleaFixe(H.hache_fnv("x" + str(i))).suivant() for i in range(200)]}
json.dump({"jours": jours, "inst": inst}, open("/home/claude/tests/cmp_entrees.json", "w"))
json.dump(pc, open("/home/claude/tests/cmp_pc.json", "w"), ensure_ascii=False, sort_keys=True)
