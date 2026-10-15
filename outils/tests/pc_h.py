# outillage commun des tests PC (Tkinter sous xvfb)
import importlib.util, json, os, sys, tempfile, types, subprocess, time

OK = [0, 0]


def verif(c, msg):
    OK[0 if c else 1] += 1
    print(("  ✓ " if c else "  ✗ ÉCHEC : ") + msg, flush=True)


def bilan():
    print(f"\n{OK[0]} réussis, {OK[1]} échecs", flush=True)
    return OK[1]


def donnees_base():
    page = {"id": "p1", "f": "ligne", "h": 1414, "traits": [
        {"c": "#1b1b1b", "e": 3, "p": [200, 300, 50, 260, 320, 50, 320, 300, 50, 380, 340, 50]}],
        "textes": [{"id": "t1", "x": 200, "y": 380, "w": 300, "t": "Bonjour", "c": "#1b1b1b", "s": 28}]}
    return {"version": 4, "modele": [], "semaines": {}, "echeances": [], "notes": [
        {"id": "n1", "titre": "Cahier test", "type": "cahier", "fond": "ligne", "papier": "blanc", "maj": "2026-10-15T00:00", "pages": [page],
         "autocollants": [{"id": "a1", "s": "etoile", "p": "p1", "x": 500, "y": 330, "t": 90}, {"id": "a2", "s": "coeur", "p": "p1", "x": 700, "y": 600, "t": 90}]},
        {"id": "n2", "titre": "Note texte", "type": "texte", "texte": "Du texte", "maj": "2026-10-15T00:00",
         "autocollants": [{"id": "b1", "s": "etoile", "p": "", "x": 500, "y": 400, "t": 90}]}],
        "reglages": {"theme": "nuit", "plein_ecran": 0}, "geos": {"pc": {"g": 100000, "d": 0, "j": "", "r": 0, "a": {"etoile": 1, "coeur": 2}, "v": {}}}}


def charger(fichier, donnees=None):
    home = tempfile.mkdtemp()
    os.environ["HOME"] = home
    with open(os.path.join(home, "horaire_automne_2026.json"), "w", encoding="utf-8") as f:
        json.dump(donnees or donnees_base(), f)
    spec = importlib.util.spec_from_file_location("H", fichier)
    H = importlib.util.module_from_spec(spec)
    sys.modules["H"] = H
    spec.loader.exec_module(H)
    return H


def ev(w, x, y, **kw):
    """Faux événement Tk (coordonnées du widget w)."""
    w.update_idletasks()
    return types.SimpleNamespace(x=x, y=y, x_root=w.winfo_rootx() + x, y_root=w.winfo_rooty() + y, widget=w, state=0, delta=0, **kw)


def capture(nom):
    subprocess.run(["import", "-window", "root", f"/home/claude/tests/captures/{nom}.png"], check=False)


def pomper(app, s=0.3):
    t = time.time() + s
    while time.time() < t:
        app.update()
        time.sleep(0.01)
