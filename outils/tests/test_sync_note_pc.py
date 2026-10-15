# Étape 2 (PC) : note synchronisée ou non, avec le faux Firebase ; test croisé avec les notes envoyées par l'iPad
import json, os, sys, urllib.request
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, capture

URL, CLE = "http://localhost:8790", "TESTCLEABCDEFGHJKLMNPQRSTU"
ids = json.load(open("/home/claude/tests/ids_sync.json"))


def serveur():
    r = json.loads(urllib.request.urlopen(URL + "/__racine").read())
    return ((r.get("h") or {}).get(CLE) or {}).get("v") or {}


H = charger(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/pc/horaire_v31.py")
with open(H.SYNC_FILE, "w", encoding="utf-8") as f:
    json.dump({"actif": True, "url": URL, "cle": CLE, "appareil": "pc-test01", "base": {}, "tl": {}, "supprimees": []}, f)
app = H.App()
pomper(app, 4)
pn = app.ecrans["notes"] if "notes" in app.ecrans else None
app.aller("notes")
pomper(app, .5)
pn = app.ecrans["notes"]
notes = {n["id"]: n for n in app.donnees["notes"]}
verif(ids["S"] in notes and ids["L"] in notes, "PC : reçoit les notes synchronisées de l'iPad")
verif(notes.get(ids["S"], {}).get("titre") == "Changé sur B", "PC : version la plus récente du serveur")
# fenêtre Nouveau : case cochée par défaut
nd = []
app.after(300, lambda: (nd.append(app._pile[-1] if app._pile else None)))
H.NouveauDocument.montrer_orig = H.NouveauDocument.montrer
H.NouveauDocument.montrer = lambda self: nd.append(self)
d = H.NouveauDocument(pn)
pomper(app, .3)
verif(bool(d.v_sync.get()), "fenêtre Nouveau : « Synchroniser cette note » cochée par défaut")
d.v_titre.set("Privée PC")
d.type = "texte"
d.v_sync.set(False)
d.dessiner()
d.valider()
pomper(app, .5)
d = H.NouveauDocument(pn)
d.v_titre.set("Partagée PC")
d.type = "texte"
d.valider()
pomper(app, 4)
nP = next(n for n in app.donnees["notes"] if n.get("titre") == "Privée PC")
nQ = next(n for n in app.donnees["notes"] if n.get("titre") == "Partagée PC")
verif(nP.get("sync") == 0 and "sync" not in nQ, "champ sync = 0 sur la note privée, absent sur l'autre")
v = serveur()
verif(("n_" + nQ["id"]) in v, "PC : la note synchronisée est envoyée")
verif(("n_" + nP["id"]) not in v, "PC : la note non synchronisée n'est pas envoyée")
verif(nP["id"] not in open("/home/claude/tests/fakefb_journal.jsonl").read(), "aucun envoi ne contient l'id de la note privée")
verif(nP["id"] not in json.loads(v["notes"]["j"]), "liste « notes » du serveur sans la note privée")
verif(json.load(open(H.DATA_FILE, encoding="utf-8")) and any(n.get("sync") == 0 for n in json.load(open(H.DATA_FILE, encoding="utf-8"))["notes"]),
      "champ sync = 0 enregistré dans le fichier")
pn.bibliotheque()
pomper(app, .5)
capture("pc_sync_biblio")
# changer d'avis dans les options
pn.changer_sync_note(nP, True)
pomper(app, 3)
v = serveur()
verif(("n_" + nP["id"]) in v and "sync" not in nP, "rendue synchronisée : envoyée, champ retiré")
pn.changer_sync_note(nQ, False)
nQ["titre"] = "Local PC seulement"
app.sauver()
app.synchro.local_change()
pomper(app, 3)
v = serveur()
verif(json.loads(v["n_" + nQ["id"]]["j"])["titre"] == "Partagée PC", "rendue privée : la modification n'est plus envoyée")
json.dump({"P": nP["id"], "Q": nQ["id"]}, open("/home/claude/tests/ids_sync_pc.json", "w"))
sys.exit(bilan())
