# Étape 6 (PC) : atelier, limite par compte (création faite sur l'« iPad » via le faux Firebase), tirage, prix, vente, lendemain
import json, sys, random, subprocess, urllib.request
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, capture, donnees_base
URL = "http://localhost:8790"
CLE = "PCATELIER" + "".join(random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ") for _ in range(17))
H = charger("/home/claude/pc/horaire_v31.py", donnees_base())
T0 = H._utc_ms(2026, 10, 15, 16)
dec = {"v": 0}
H.maintenant_ms = lambda: T0 + dec["v"]
# 1. création sur le PC
app = H.App(); pomper(app, 1)
verif(H.peut_creer(app.donnees), "peut créer (aucune création aujourd'hui)")
at = H.AtelierAcPC(app); pomper(app, .8)
cv = at.toile
for x in range(3, 13):
    at._appui(type("E", (), {"x": x * at.K + 5, "y": 3 * at.K + 5})())
at.choisir_couleur(4); at.choisir_outil("gros")
for x in range(4, 12):
    at._bouge(type("E", (), {"x": x * at.K + 5, "y": 8 * at.K + 5})())
at.v_nom.set("Mon robot")
pomper(app, .2)
capture("atelier_dessin_pc")
vals = iter([0.05, 0.5])
H._ALEA.random = lambda: next(vals)
at.creer(); pomper(app, .5)
k, c = next(iter(H.CREATIONS.items()))
verif(c["rar"] == "tres_rare" and 6000 <= c["prix"] <= 9000 and c["prix"] % 10 == 0, f"très rare, prix {c['prix']}")
verif(H.effet_autocollant(k) == "scintille", "animation « scintille » pour un très rare")
e = H.geos_compte(app)
verif(e.get("cj") == "2026-10-15" and e["a"].get(k) == 1, "cj = jour de Toronto, dans l'inventaire")
capture("atelier_resultat_pc")
verif(H.creer_autocollant(app, "x", "A112233;3:AAAAAAAAA") is None, "deuxième création refusée le même jour")
# vente : confirmation obligatoire (on annule, puis on confirme)
s0 = H.geos_solde(app.donnees)
reponses = iter([False, True])
H.dialogue = lambda *a, **kw: next(reponses)
verif(H.confirmer_vente_creation(app, k) == 0 and H.geos_solde(app.donnees) == s0, "annulation : rien n'est vendu")
dec["v"] = 13 * 3600000                    # lendemain (Toronto)
verif(H.confirmer_vente_creation(app, k) == 0 and H.geos_inventaire(app.donnees).get(k) == 1, "lendemain : vente refusée, reste dans l'inventaire")
verif(H.peut_creer(app.donnees), "lendemain : nouvelle création permise")
dec["v"] = 0
H.dialogue = lambda *a, **kw: True
verif(H.confirmer_vente_creation(app, k) == c["prix"] and H.geos_solde(app.donnees) - s0 == c["prix"] and not H.geos_inventaire(app.donnees).get(k),
      f"vente confirmée le jour même : +{c['prix']}")
at.clore(); pomper(app, .3)
# 2. tirage 50 / 40 / 10 et prix
H._ALEA = random.SystemRandom()
n = {"commun": 0, "rare": 0, "tres_rare": 0}; hors = 0
for _ in range(200000):
    r = H.creation_rarete(H._ALEA.random()); n[r] += 1
    p = H.creation_prix(r, H._ALEA.random())
    hors += not (H.CREATION_PRIX[r][0] <= p <= H.CREATION_PRIX[r][1] and p % 10 == 0)
pc_ = {k2: v / 2000 for k2, v in n.items()}
verif(abs(pc_["commun"] - 50) < .6 and abs(pc_["rare"] - 40) < .6 and abs(pc_["tres_rare"] - 10) < .4 and not hors, f"200 000 tirages : {pc_}, hors fourchette {hors}")
# 3. identité des calculs avec l'iPad
grilles = []
rnd = random.Random(7)
for _ in range(40):
    g = [rnd.choice([-1, -1, -1, rnd.randrange(8)]) for _ in range(256)]
    grilles.append(g)
pal = H.palette_du_jour("2026-10-15")[1]
json.dump({"grilles": grilles, "pal": pal, "sp": [H.sprite_de_grille(g, pal, 16) for g in grilles],
           "rar": [H.creation_rarete(x / 1000) for x in range(1000)], "prix": [H.creation_prix(r, x / 997) for r in ("commun", "rare", "tres_rare") for x in range(997)],
           "palj": [H.palette_du_jour(H.decaler_jour("2026-01-01", i))[0] for i in range(120)],
           "norm": [H.normaliser_creation("c_abcd1234", x) for x in (
               {"n": "a", "sp": "A112233;3:AAAAAAAAA", "rar": "rare", "prix": 3000, "j": "2026-10-15"},
               {"n": "a", "sp": "A112233;3:AAAAAAAAA", "rar": "rare", "prix": 2990, "j": "2026-10-15"},
               {"n": "a", "sp": "A112233;30:AAA", "rar": "commun", "prix": 1000, "j": "2026-10-15"},
               {"n": "a", "sp": "A112233;2:900A", "rar": "commun", "prix": 1000, "j": "2026-10-15"},
               {"n": "x" * 60, "sp": "A112233B445566;4:AABBAABBAABBAABB", "rar": "tres_rare", "prix": 9000, "j": "2026-10-16", "t": 5})]},
          open("/home/claude/tests/atelier_pc.json", "w"))
# 4. limite par compte : l'« iPad » a créé aujourd'hui (via le faux Firebase), le PC le voit
H2 = H
cfg = {"actif": True, "url": URL, "cle": CLE, "appareil": "pc-test02", "base": {}, "tl": {}, "supprimees": []}
body = json.dumps({"gx_ipad-zz": {"j": json.dumps({"g": 0, "d": 0, "j": "", "r": 0, "a": {"c_ipad1234": 1}, "v": {}, "cj": "2026-10-15",
                   "cr": {"c_ipad1234": {"n": "Fait sur l'iPad", "sp": "A112233;3:AAAAAAAAA", "rar": "rare", "prix": 4000, "j": "2026-10-15", "t": 1}}},
                   separators=(",", ":")), "t": 1, "par": "ipad-zz"}}).encode()
urllib.request.urlopen(urllib.request.Request(URL + f"/h/{CLE}/v.json", data=body, method="PATCH", headers={"Content-Type": "application/json"}))
H3 = charger("/home/claude/pc/horaire_v31.py", donnees_base())
H3.maintenant_ms = lambda: T0
json.dump(cfg, open(H3.SYNC_FILE, "w"))
app.destroy()
app3 = H3.App(); pomper(app3, 4)
verif("c_ipad1234" in H3.CREATIONS and not H3.peut_creer(app3.donnees), "création faite sur un autre appareil reçue : limite atteinte sur le PC")
at3 = H3.AtelierAcPC(app3); pomper(app3, .5)
verif(any("Prochain autocollant dans 12 h 00 min" in str(lb.cget("text")) for lb, _ in at3.temps), "atelier PC : temps restant affiché")
capture("atelier_limite_pc")
sys.exit(bilan())
