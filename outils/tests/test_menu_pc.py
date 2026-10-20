# v33 (PC) : menu du haut des notes réduit
import json, sys
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, ev, capture, pomper
H = charger("/home/claude/pc/horaire_v33.py")
app = H.App(); pomper(app, 1)
app.ouvrir_notes("n1"); pomper(app, 1.2)
ed = app.ecrans["notes"].ed
fe = ed.feuilles["p1"]; cv = fe["cv"]
vis = lambda w: bool(w.winfo_ismapped())
verif(vis(ed.tete), "normal : en-tête visible")
capture("menu_normal_pc")
y0, r0 = cv.winfo_rooty(), ed.rang1.winfo_rooty()
H.basculer_menu_notes(ed); pomper(app, .8)
verif(not vis(ed.tete) and vis(ed.rang1) and vis(ed.rang2), "réduit : en-tête masqué, rangées d'outils visibles")
verif(r0 - ed.rang1.winfo_rooty() > 30, f"place libérée : {r0 - ed.rang1.winfo_rooty()} px")
verif(abs(cv.winfo_rooty() - y0) <= 1, f"la page reste à la même place à l'écran ({y0} → {cv.winfo_rooty()})")
capture("menu_reduit_pc")
# outils en mode réduit : trait, annuler
n0 = len(ed.n["pages"][0]["traits"])
ed.choisir_outil("bille") if hasattr(ed, "choisir_outil") else None
k, ox, oy = fe["k"], fe.get("ox", 0), fe.get("oy", 0)
pts = [(300 * k + ox + i * 10, 500 * k + oy + i * 4) for i in range(12)]
ed.appui(fe, ev(cv, *pts[0]))
for i, p in enumerate(pts[1:]):
    ed.bouge(fe, ev(cv, *p))
    if i == 5:
        g0 = (cv.winfo_rooty(), ed.rang1.winfo_rooty())
        H.basculer_menu_notes(ed)                 # demandé pendant le trait
        app.update()
        reduit_pendant = not vis(ed.tete)
        g1 = (cv.winfo_rooty(), ed.rang1.winfo_rooty())
ed.relache(fe, ev(cv, *pts[-1])); app.update()
verif(reduit_pendant and g0 == g1, "pendant un trait : rien ne bouge, la bascule attend")
pomper(app, 1)
verif(vis(ed.tete), "après le trait : la bascule a lieu (menu rétabli)")
verif(len(ed.n["pages"][0]["traits"]) == n0 + 1, "le trait est enregistré")
H.basculer_menu_notes(ed); pomper(app, .6)
ed.annuler(); app.update()
verif(len(ed.n["pages"][0]["traits"]) == n0, "réduit : annuler fonctionne")
# molette : même distance qu'avant (3 crans de 24 px)
c = ed.zone.canvas; y1 = c.canvasy(0); ed._molette(1); app.update()
verif(c.canvasy(0) - y1 == 72, f"molette : 72 px par cran (comme avant) : {c.canvasy(0) - y1}")
ed._molette(-1); app.update()
# frappe dans une zone de texte et sélection au lasso : rien ne bouge
pos = lambda: (cv.winfo_rooty(), ed.rang1.winfo_rooty(), ed.rang2.winfo_rooty(), c.winfo_height())
p0 = pos()
ed.ouvrir_texte(fe, 200, 900); pomper(app, .3)
w = ed.texte_ouvert
if hasattr(w, "insert"):
    for ch in "Bonjour":
        w.insert("end", ch); app.update()
verif(pos() == p0, "frappe : rien ne bouge")
ed.fermer_texte() if hasattr(ed, "fermer_texte") else fe["cv"].focus_set()
pomper(app, .3)
ed.selectionner(fe, [100, 200, 900, 200, 900, 700, 100, 700]); pomper(app, .3)
verif(pos() == p0 and ed.sel, "sélection au lasso : rien ne bouge")
ed.deselect(); pomper(app, .2)
# réglage local, enregistré, jamais synchronisé
app.sauver()
d = json.load(open(H.DATA_FILE, encoding="utf-8"))
verif(d["reglages"].get("menu_notes_reduit") is True and "menu_notes_reduit" not in H.sections_de(app.donnees)["reglages"], "réglage enregistré localement, absent des sections synchronisées")
# conservé à la réouverture
app.ouvrir_notes("n2"); pomper(app, .8); app.ouvrir_notes("n1"); pomper(app, .8)
verif(not vis(app.ecrans["notes"].ed.tete), "conservé à la réouverture du cahier")
# note texte
app.ouvrir_notes("n2"); pomper(app, .8)
et = app.ecrans["notes"].ed
verif(not vis(et.tete) and vis(et.b_menu), "note texte réduite : en-tête masqué, bouton visible")
capture("menu_reduit_texte_pc")
H.basculer_menu_notes(et); pomper(app, .5)
verif(vis(et.tete), "note texte : rétabli")
sys.exit(bilan())
