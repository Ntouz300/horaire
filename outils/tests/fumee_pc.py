import sys, traceback
sys.path.insert(0, "/home/claude/tests")
from pc_h import charger, verif, bilan, pomper, donnees_base
H = charger("/home/claude/pc/horaire_v33.py", donnees_base())
app = H.App(); pomper(app, 1)
err = []
app.report_callback_exception = lambda *a: err.append("".join(traceback.format_exception(*a)))
for p in list(app.ecrans.keys()) if hasattr(app, "ecrans") else []:
    try:
        app.aller(p); pomper(app, .6)
    except Exception as e:
        err.append(p + " : " + repr(e))
print("pages :", list(app.ecrans.keys()))
verif(not err, "toutes les pages s'ouvrent sans erreur " + "\n".join(err)[:2000])
sys.exit(bilan())
