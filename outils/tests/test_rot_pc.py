# Étape 1 (PC) : rotation d'un autocollant et de la sélection au lasso, annulation en une étape
import math, sys, json
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, ev, capture, pomper

H = charger(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/pc/horaire_v31.py")
app = H.App()
pomper(app, 1)
app.ouvrir_notes("n1")
pomper(app, 1.2)
ed = app.ecrans["notes"].ed
fe = ed.feuilles["p1"]
cv, k, ox, oy = fe["cv"], fe["k"], fe.get("ox", 0), fe.get("oy", 0)
P = lambda x, y: (x * k + ox, y * k + oy)


def geste(points):
    x, y = points[0]
    ed.appui(fe, ev(cv, x, y))
    for (x, y) in points[1:]:
        ed.bouge(fe, ev(cv, x, y))
    ed.relache(fe, ev(cv, x, y))
    app.update()


def arc(cx, cy, hx, hy, deg, n=12):
    a0, R = math.atan2(hy - cy, hx - cx), math.hypot(hx - cx, hy - cy)
    return [(hx, hy)] + [(cx + R * math.cos(a0 + math.radians(deg) * i / n), cy + R * math.sin(a0 + math.radians(deg) * i / n)) for i in range(1, n + 1)]


ac = lambda i: next(a for a in ed.n["autocollants"] if a["id"] == i)
# 1. choisir a1 puis tourner au glisser
cx, cy = P(500, 330)
geste([(cx, cy)])
verif(getattr(ed, "ac_choisi", None) == "a1", "autocollant choisi au clic")
q = fe.get("acx")
verif(q and "r" in q[1], "poignée de rotation dessinée")
hx, hy = q[1]["r"]
n0 = len(ed.histo)
geom0 = cv.winfo_width(), cv.winfo_height()
geste(arc(cx, cy, hx, hy, 90))
verif(abs((ac("a1").get("r") or 0) - 90) < .01, f"rotation au glisser : r = {ac('a1').get('r')}")
verif(len(ed.histo) == n0 + 1, "un glisser = une étape d'annulation")
verif((cv.winfo_width(), cv.winfo_height()) == geom0, "la page ne change pas de taille")
pomper(app, .3)
capture("pc_rot_ac")
ed.annuler(); app.update()
verif("r" not in ac("a1"), "annuler : angle revenu à 0 (champ absent)")
# 2. boutons ↻ ↻ ↺
ed.choisir_ac("a1"); app.update()
ed.tourner_autocollant(15); ed.tourner_autocollant(15); ed.tourner_autocollant(-15)
verif(ac("a1").get("r") == 15, f"boutons : r = {ac('a1').get('r')}")
for _ in range(3):
    ed.annuler()
verif("r" not in ac("a1"), "trois annulations → 0")
# 3. lasso mixte puis poignée de rotation de la sélection
ed.choisir_ac(None)
avant = json.dumps({"p": ed.n["pages"][0], "a": ed.n["autocollants"]}, sort_keys=True)
ed.selectionner(fe, [100, 200, 900, 200, 900, 700, 100, 700]); app.update()
s = ed.sel
verif((len(s["traits"]), len(s["textes"]), len(s.get("acs") or [])) == (1, 1, 2), "lasso : 1 trait, 1 texte, 2 autocollants")
q = ed.poignee_rot_sel(fe)
verif(q is not None, "poignée de rotation de la sélection")
b = s["boite"]
scx, scy = P((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)
n1 = len(ed.histo)
geste(arc(scx, scy, q[0], q[1], 90, 16))
verif(all(a.get("r") == 90 for a in ed.n["autocollants"]), "autocollants de la sélection : r = 90")
A = json.loads(avant)
p0, p1 = A["p"]["traits"][0]["p"], ed.n["pages"][0]["traits"][0]["p"]
d = lambda p: math.hypot(p[0] - p[9], p[1] - p[10])
verif(p0[:2] != p1[:2] and abs(d(p0) - d(p1)) < .3, "points du trait tournés (rotation rigide)")
verif(len(ed.histo) == n1 + 1, "rotation de la sélection = une étape d'annulation")
pomper(app, .3)
bs = ed.barre_sel; bs.update_idletasks()
b = ed.sel["boite"]; X, Y = cv.winfo_rootx(), cv.winfo_rooty()
by0, by1 = bs.winfo_rooty(), bs.winfo_rooty() + bs.winfo_height()
verif(by1 <= Y + b[1] * k + oy - 60 or by0 >= Y + b[3] * k + oy + 20, f"la barre ne cache pas la sélection ni ses poignées ({by0}-{by1})")
capture("pc_rot_sel")
ed.annuler(); app.update()
verif(json.dumps({"p": ed.n["pages"][0], "a": ed.n["autocollants"]}, sort_keys=True) == avant, "une annulation restaure tout")
# 4. boutons Tourner de la sélection
ed.selectionner(fe, [100, 200, 900, 200, 900, 700, 100, 700])
ed.tourner_sel(15)
verif(all(a.get("r") == 15 for a in ed.n["autocollants"]), "bouton ↻ de la sélection : 15°")
ed.annuler()
# 5. comparaison du calcul avec l'iPad : rotation de 37° du jeu de départ
ed.selectionner(fe, [100, 200, 900, 200, 900, 700, 100, 700])
ed.appliquer_rotation(ed.origine_sel(), 37)
open("/home/claude/tests/rot_pc.json", "w").write(json.dumps({"p": ed.n["pages"][0], "a": ed.n["autocollants"]}, sort_keys=True))
ed.annuler()
# 6. note texte
app.ouvrir_notes("n2")
pomper(app, 1)
et = app.ecrans["notes"].ed
et.choisir_ac("b1"); app.update()
cvb = et.ac_vues["b1"]
S = int(cvb.cget("width"))
hx, hy = cvb._x["r"]
c2 = S / 2
pts = arc(c2, c2, hx, hy, -45)
et._ac_appui("b1", ev(cvb, *pts[0]))
for p in pts[1:]:
    et._ac_bouge("b1", ev(cvb, *p))
et._ac_relache("b1", ev(cvb, *pts[-1]))
app.update()
r = et._ac("b1").get("r")
verif(r is not None and abs(r - 315) < .01, f"note texte : rotation au glisser (r = {r})")
et.tourner_autocollant(15)
verif(et._ac("b1").get("r") == 330, "note texte : bouton ↻")
pomper(app, .3)
capture("pc_rot_texte")
et.annuler_ac(); et.annuler_ac()
verif("r" not in et._ac("b1"), "note texte : deux annulations → 0")
# 7. enregistrement : le champ r passe dans le JSON
et.choisir_ac("b1"); et.tourner_autocollant(30); et.enregistrer(); app.sauver()
d = json.load(open(H.DATA_FILE, encoding="utf-8"))
n2 = next(n for n in d["notes"] if n["id"] == "n2")
verif(n2["autocollants"][0].get("r") == 30, "r = 30 enregistré dans le fichier")
sys.exit(bilan())
