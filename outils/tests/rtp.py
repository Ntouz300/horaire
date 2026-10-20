# RTP des mini-jeux (v31/v29) : les règles et gains des 26 jeux sont inchangés depuis v29 (bloc JX identique, vérifié) ;
# leur maximum de base reste 99,06 % (plinko risque haut, calcul exact v29). Seul change le gain d'autocollants, recalculé ici
# exactement sur le nouveau catalogue (1016 autocollants), pour chaque mise possible.
import sys, json
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger
H = charger("/home/claude/pc/horaire_v33.py")
H.charger_pack()
JX = H.JX
cat = JX["autocollants"]
N = len(cat)
BASE_MAX = 99.06
def terme(m):
    """Valeur moyenne gagnée en autocollants (au prix plein) par partie, en % de la mise."""
    return 100 * sum(min(JX["ac_max"], JX["ac_gain"] * m / a[2]) * a[2] for a in cat) / N / m
pire = 0
for m in sorted(set(range(H.GJ["mise_min"], 201, 10)) | set(H.GJ["mises"]) | {H.GJ["mise_max"]}):
    t = terme(m); pire = max(pire, t)
    if m in H.GJ["mises"]:
        print(f"mise {m:>6} : gain d'autocollants {t:.4f} % de la mise -> RTP max {BASE_MAX + t:.2f} %")
print(f"catalogue {N} autocollants, prix {min(a[2] for a in cat)}–{max(a[2] for a in cat)} ; terme max {pire:.4f} % (borne théorique {100*JX['ac_gain']:.2f} %)")
print("RTP maximum tous jeux :", f"{BASE_MAX + pire:.2f} %", "< 100 %" if BASE_MAX + pire < 100 else "≥ 100 % !")
# en valeur de revente (75 %, doublons seulement) le terme est encore plus bas
