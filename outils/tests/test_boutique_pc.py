# Étapes 4 et 5 (PC) : boutique du jour, achat soldé, minuit, inventaire (recherche, favoris, tris, filtres)
import json, sys
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, capture, donnees_base
T0 = None
import faulthandler; faulthandler.dump_traceback_later(60, exit=True)
d = donnees_base()
d["geos"]["pc"]["a"] = {"etoile": 3, "coeur": 1, "s_coeur_bleu": 1, "p_chat_tete_roux": 2, "p_bolide_bleu": 1, "p_gemme_rubis": 1, "p_couronne_arc": 1}
H = charger("/home/claude/pc/horaire_v31.py", d)
T0 = H._utc_ms(2026, 10, 15, 16)
decal = {"v": 0}
H.maintenant_ms = lambda: T0 + decal["v"]
app = H.App(); pomper(app, 1)
b = H.Boutique(app); pomper(app, 1.5)
B = b.B
verif(len(B["articles"]) == 50 and len([a for a in B["articles"] if a["rar"] != "commun"]) >= 3, "50 articles, ≥ 3 rares")
print("   jour", b.jour, H.jour_toronto(T0)); verif(b.jour == "2026-10-15" and "12 h 00 min" in b.lbl_renouv.cget("text"), "jour de Toronto et compte à rebours : " + b.lbl_renouv.cget("text"))
noms_js = json.load(open("/home/claude/tests/boutique_js_noms.json")) if False else None
capture("boutique_pc")
inv = H.geos_inventaire(app.donnees)
a = next(x for x in B["articles"] if x["pct"] and not inv.get(x["s"]))
s0 = H.geos_solde(app.donnees)
b.acheter(a); pomper(app, .3)
verif(s0 - H.geos_solde(app.donnees) == a["final"] and a["final"] < a["prix"], f"achat soldé −{a['pct']} % : payé {s0 - H.geos_solde(app.donnees)} au lieu de {a['prix']}")
verif(not H.geos_acheter(app, a["s"], a["final"]), "rachat refusé")
avant = [x["s"] for x in b.B["articles"]]
decal["v"] = 12 * 3600000 + 60000
b._tic(); pomper(app, .5)
verif(b.jour == "2026-10-16" and [x["s"] for x in b.B["articles"]] != avant, "après minuit (Toronto) : nouvelle boutique")
decal["v"] = 0
b.clore(); pomper(app, .3)
iv = H.Inventaire(app); pomper(app, 1)
noms = [x["nom"] for x in iv.liste]
verif([x["rar"] for x in iv.liste] == sorted([x["rar"] for x in iv.liste], key=lambda r: H.ORDRE_RARETE[r]), "tri par rareté : " + ", ".join(noms))
capture("inventaire_pc")
iv._poser("tri", "nom"); pomper(app, .2)
noms = [x["nom"] for x in iv.liste]
verif([H.cle_tri(n) for n in noms] == sorted(H.cle_tri(n) for n in noms), "tri par nom : " + ", ".join(noms))
verif(next(x for x in iv.liste if x["nom"] == "Étoile")["n"] == 3, "nombre d'exemplaires (Étoile × 3)")
iv.v_q.set("animaux"); pomper(app, .5)
verif([x["nom"] for x in iv.liste] == ["Chat roux"], "recherche par thème")
iv.v_q.set("bolide"); pomper(app, .5)
verif([x["nom"] for x in iv.liste] == ["Bolide bleu"], "recherche par nom")
iv._favori("p_bolide_bleu"); iv.v_q.set(""); pomper(app, .5)
iv._poser("fav", True); pomper(app, .2)
verif([x["nom"] for x in iv.liste] == ["Bolide bleu"], "filtre Favoris")
verif(app.donnees["reglages"].get("ac_favoris") == ["p_bolide_bleu"], "favori dans reglages.ac_favoris")
sec = H.sections_de(app.donnees)["reglages"]
verif("ac_favoris" in sec and "inv_tri" not in sec, "favoris synchronisés, tri local")
iv._poser("fav", False); iv._poser("rar", "tres_rare"); pomper(app, .2)
verif([x["nom"] for x in iv.liste] == ["Couronne arc-en-ciel"], "filtre par rareté")
iv._poser("rar", ""); iv._poser("theme", "Trésors"); pomper(app, .2)
verif(len(iv.liste) == 2, "filtre par thème (Trésors)")
# comparaison avec l'iPad sur plusieurs filtres
cas = [{"q": "", "fav": False, "theme": "", "rar": "", "tri": t} for t in ("rarete", "nom")] + [{"q": "ro", "fav": False, "theme": "", "rar": "", "tri": "nom"}]
dd = json.loads(json.dumps(app.donnees))
json.dump({"d": {"reglages": dd["reglages"], "geos": dd["geos"], "notes": []}, "cas": cas, "pc": [[x["s"] for x in H.liste_inventaire(dd, c, H.geos_inventaire(dd))] for c in cas]},
          open("/home/claude/tests/inv_cmp.json", "w"), ensure_ascii=False)
# mode « choisir »
iv.clore(); pomper(app, .2)
app.after(800, lambda: [w for w in app.winfo_children()] and None)
res = {}
vus = []
_m = H.Inventaire.montrer
H.Inventaire.montrer = lambda self: (vus.append(self), _m(self))
def choisir_plus_tard():
    vus[-1]._prendre("p_gemme_rubis")
app.after(700, choisir_plus_tard)
verif(H.choisir_autocollant(app) == "p_gemme_rubis", "mode « choisir » : renvoie l'autocollant cliqué")
sys.exit(bilan())
