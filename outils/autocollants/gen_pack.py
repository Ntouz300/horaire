# Générateur du paquet d'autocollants v31/v29 (≥ 1000 au total) : formes de base × variantes de couleurs.
# Sortie : pack.json (même contenu pour l'iPad et le PC), format de sprite compact « palette;largeur:pixels ».
import json, re, sys, hashlib, random
sys.path.insert(0, "/home/claude/gen")
from formes import F

FIXES = {"W": "#ffffff", "w": "#e3e8f0", "D": "#2b2b33", "G": "#7d8798", "g": "#c4ccd8", "Y": "#ffd23f", "y": "#fff2a8",
         "O": "#f28c28", "o": "#ffc27a", "d": "#c45f12", "R": "#e5484d", "r": "#a3262f", "P": "#ff9fc6", "m": "#e8739c",
         "E": "#3fbf5a", "e": "#23843b", "N": "#9a6332", "n": "#5e3a1c", "T": "#e9c690", "C": "#7fd3ff", "V": "#a259e6",
         "v": "#cfa8ff", "S": "#f5d6b4", "U": "#2d8cff", "u": "#9fd0ff", "Q": "#f2c230", "q": "#b8860b", "K": "#1b1d27"}


def hx(c):
    return [int(c[i:i + 2], 16) for i in (1, 3, 5)]


def mix(c, d, t):
    a, b = hx(c), hx(d)
    return "#" + "".join("%02x" % round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def trio(c):
    return c, mix(c, "#000000", .3), mix(c, "#ffffff", .4)


# couleurs : clé -> (masculin, féminin, hex)
COUL = {
    "rouge": ("rouge", "rouge", "#e5484d"), "orange": ("orange", "orange", "#f28c28"), "jaune": ("jaune", "jaune", "#ffd23f"),
    "lime": ("lime", "lime", "#9be34a"), "vert": ("vert", "verte", "#3fbf5a"), "menthe": ("menthe", "menthe", "#5fe0b0"),
    "turquoise": ("turquoise", "turquoise", "#2ec4c4"), "ciel": ("bleu ciel", "bleu ciel", "#6cc4ff"), "bleu": ("bleu", "bleue", "#2d8cff"),
    "marine": ("marine", "marine", "#2f4f9e"), "violet": ("violet", "violette", "#8b5cf6"), "lavande": ("lavande", "lavande", "#b9a2ff"),
    "rose": ("rose", "rose", "#ff7ab6"), "framboise": ("framboise", "framboise", "#d63d7a"), "brun": ("brun", "brune", "#9a6332"),
    "beige": ("beige", "beige", "#e0c49a"), "gris": ("gris", "grise", "#8a94a8"), "noir": ("noir", "noire", "#3a3f4b"),
    "blanc": ("blanc", "blanche", "#eef1f6"), "corail": ("corail", "corail", "#ff7a5c"), "kaki": ("kaki", "kaki", "#8a8f3c"),
    # pelages
    "roux": ("roux", "rousse", "#e8833a"), "creme": ("crème", "crème", "#f3d9a6"), "caramel": ("caramel", "caramel", "#c98a4b"),
    "chocolat": ("chocolat", "chocolat", "#6b4226"), "cendre": ("cendré", "cendrée", "#a7a9b4"), "sable": ("sable", "sable", "#d9b77a"),
    "charbon": ("charbon", "charbon", "#4a4d57"), "neige": ("de neige", "de neige", "#f5f7fb"), "fauve": ("fauve", "fauve", "#c7913f"),
    # métaux (fiches communes : fer, acier, bronze, cuivre ; les finitions rares sont à part)
    "fer": ("de fer", "de fer", "#8c96a6"), "acier": ("d'acier", "d'acier", "#b4bfcd"), "bronze": ("de bronze", "de bronze", "#c07a3e"),
    "cuivre": ("de cuivre", "de cuivre", "#d9824f"), "obsidienne": ("d'obsidienne", "d'obsidienne", "#3b3550"),
    "bois": ("de bois", "de bois", "#a8743f"), "os": ("d'os", "d'os", "#e8dfc8"), "sang": ("écarlate", "écarlate", "#b3202f"),
    "jade": ("de jade", "de jade", "#3fae86"), "ambre": ("ambré", "ambrée", "#e99a2c"), "saphir": ("saphir", "saphir", "#2f62d9"),
    "rubis": ("rubis", "rubis", "#d92b4b"), "emeraude": ("émeraude", "émeraude", "#22b573"), "amethyste": ("améthyste", "améthyste", "#9b4fe0"),
    "topaze": ("topaze", "topaze", "#ffb627"), "aigue": ("aigue-marine", "aigue-marine", "#5fd6e6"), "quartz": ("de quartz rose", "de quartz rose", "#f4a6c8"),
    "onyx": ("d'onyx", "d'onyx", "#2d2b38"), "perle": ("nacré", "nacrée", "#f1eef7"), "citrine": ("citrine", "citrine", "#f4d548"),
    "pourpre": ("pourpre", "pourpre", "#7b2d8e"), "glace": ("glacé", "glacée", "#b8ecff"),
}

# finitions rares et très rares : clé -> (masculin, féminin, (A, a, L) ou procédé spécial)
FIN = {
    "dore": ("doré", "dorée", ("#f2c230", "#b8860b", "#fff1a8")),
    "argent": ("argenté", "argentée", ("#c9d3df", "#7c8796", "#ffffff")),
    "givre": ("givré", "givrée", ("#9fe3ff", "#3f93c8", "#ffffff")),
    "feu": ("de feu", "de feu", "feu"),
    "neon": ("néon", "néon", ("#39ff88", "#12a858", "#c8ffe0")),
    "ombre": ("des ombres", "des ombres", ("#4b3f73", "#241d3d", "#8c7fc4")),
    "arc": ("arc-en-ciel", "arc-en-ciel", "arc"),
    "cosmique": ("cosmique", "cosmique", "cosmique"),
    "prisme": ("prismatique", "prismatique", "prisme"),
}

ARC = ["#ff4d5e", "#ff9a3c", "#ffd84a", "#57d36b", "#3fa7ff", "#9b6cff"]
FEU = ["#ffe066", "#ffb02e", "#ff7a1a", "#f24a1d", "#c22a1a", "#8c1a14"]
PRISME = ["#ff8ad8", "#b48cff", "#7fb6ff", "#7fffe0", "#c6ff7f", "#ffe17f"]


def contour(rows):
    w = max(len(r) for r in rows)
    g = ["." * (w + 2)] + ["." + r.ljust(w, ".") + "." for r in rows] + ["." * (w + 2)]
    H, W = len(g), w + 2
    out = [list(r) for r in g]
    for y in range(H):
        for x in range(W):
            if g[y][x] != ".":
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and g[Y][X] != ".":
                    out[y][x] = "K"
                    break
    out = ["".join(r) for r in out]
    # rogner les bords vides
    while out and set(out[0]) == {"."}:
        out.pop(0)
    while out and set(out[-1]) == {"."}:
        out.pop()
    while all(r[0] == "." for r in out):
        out = [r[1:] for r in out]
    while all(r[-1] == "." for r in out):
        out = [r[:-1] for r in out]
    return out


LETTRES_LIBRES = [c for c in "ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" if c not in FIXES and c not in "AaLBbMK"]


def peindre(base, prim, sec, fin=None, graine=0):
    """Grille finale (lettres) + palette {lettre: hex}."""
    rows = contour(F[base])
    pal = {}
    A, a, L = prim
    B, b, M = sec
    var = {"A": A, "a": a, "L": L, "B": B, "b": b, "M": M}
    grille = [list(r) for r in rows]
    H = len(grille)
    special = fin if isinstance(fin, str) else None
    libres = list(LETTRES_LIBRES)
    cache = {}

    def lettre_pour(hexa):
        if hexa not in cache:
            cache[hexa] = libres.pop(0)
            pal[cache[hexa]] = hexa
        return cache[hexa]
    rnd = random.Random(graine)
    for y, r in enumerate(grille):
        for x, c in enumerate(r):
            if c == ".":
                continue
            if c in var:
                if special in ("arc", "feu", "prisme") and c in "AaL":
                    bande = (FEU if special == "feu" else ARC if special == "arc" else PRISME)[min(5, y * 6 // max(1, H))]
                    col = bande if c == "A" else mix(bande, "#000000", .3) if c == "a" else mix(bande, "#ffffff", .45)
                    r[x] = lettre_pour(col)
                elif special == "cosmique" and c in "AaL":
                    base_c = ["#241a4d", "#3a2470", "#2a2f7a"][(x + y) // 3 % 3]
                    col = "#ffffff" if rnd.random() < .09 else ("#ffd9ff" if rnd.random() < .05 else base_c)
                    if c == "L" and col == base_c:
                        col = "#6c4fc7"
                    r[x] = lettre_pour(col)
                else:
                    r[x] = c
                    pal[c] = var[c]
            else:
                pal[c] = FIXES[c]
    rows = ["".join(r) for r in grille]
    return rows, pal


def compacter(rows, pal):
    w = len(rows[0])
    p = "".join(k + v[1:] for k, v in sorted(pal.items()))
    pix = "".join(rows)
    pix = re.sub(r"(.)\1{2,}", lambda m: str(len(m.group(0))) + m.group(1), pix)
    return p + ";" + str(w) + ":" + pix


# ------------------------------------------------------------------ catalogue
# entrée : (base, nom, genre, défaut secondaire, thème, rangée, couleurs communes, prix commun, finitions rares, finitions très rares)
CAT = []


def cat(base, nom, genre, theme, rangee, communs, prix, rares=(), tres=(), sec="#ffffff", prim_def=None):
    CAT.append(dict(base=base, nom=nom, genre=genre, theme=theme, rangee=rangee, communs=communs, prix=prix, rares=rares, tres=tres,
                    sec=sec, prim_def=prim_def))


RL, ER = "Style Rocket League", "Style Elden Ring"
EQUIPES = ["bleu", "orange", "rouge", "vert", "jaune", "violet", "rose", "noir", "blanc", "turquoise", "lime", "gris"]
cat("bolide", "Bolide", "m", RL, RL + " · voitures", EQUIPES, 260, ("dore", "argent", "neon"), ("arc",), sec="#ffffff")
cat("fourgon", "Break de match", "m", RL, RL + " · voitures", EQUIPES, 240, ("dore", "argent", "feu"), ("cosmique",), sec="#ffd23f")
cat("plat", "Bolide plat", "m", RL, RL + " · voitures", EQUIPES, 280, ("dore", "givre", "neon"), ("prisme",), sec="#2b2b33")
cat("ballon_match", "Ballon de match", "m", RL, RL + " · terrain", ["bleu", "orange", "vert", "violet", "rouge", "jaune"], 180, ("dore", "feu"), ("cosmique",))
cat("boost", "Bidon de boost", "m", RL, RL + " · terrain", ["orange", "bleu", "violet", "vert", "rose", "rouge", "turquoise"], 150, ("neon",), ())
cat("pastille", "Pastille de boost", "f", RL, RL + " · terrain", ["orange", "bleu", "vert", "violet"], 120, ("dore",), ())
cat("cage", "Cage de but", "f", RL, RL + " · terrain", ["bleu", "orange", "vert", "rouge"], 160, (), ())
cat("coupe", "Coupe de saison", "f", RL, RL + " · trophées", ["bronze", "acier", "cuivre"], 300, ("dore", "argent"), ("arc",))
cat("jante", "Jante", "f", RL, RL + " · voitures", ["bleu", "orange", "rouge", "vert", "noir", "violet", "jaune"], 130, ("dore", "neon"), ())
cat("antenne", "Fanion d'antenne", "m", RL, RL + " · voitures", ["bleu", "orange", "rouge", "vert", "jaune", "violet", "rose", "turquoise"], 90, (), ())
cat("damier", "Drapeau à damier", "m", RL, RL + " · terrain", ["gris"], 120, (), ())
cat("chrono", "Chrono de match", "m", RL, RL + " · terrain", ["bleu", "orange"], 140, (), ())
cat("explosion", "Explosion de but", "f", RL, RL + " · rares", ["orange", "bleu", "violet", "vert"], 220, ("feu", "givre"), ("arc", "cosmique"))
cat("bouclier_but", "Écusson d'équipe", "m", RL, RL + " · trophées", ["bleu", "orange", "vert", "violet", "rouge"], 170, ("dore",), (), sec="#2b2b33")
cat("casquette", "Casquette de pilote", "f", RL, RL + " · voitures", ["bleu", "orange", "rouge", "vert", "noir"], 110, (), (), sec="#2b2b33")
cat("drapeau", "Fanion d'équipe", "m", RL, RL + " · terrain", ["bleu", "orange", "rouge", "vert", "violet", "jaune"], 100, (), (), sec="#ffffff")
cat("mega_boost", "Méga boost", "m", RL, RL + " · rares", [], 0, ("feu", "neon", "givre"), ("arc",))

ARMES = ["fer", "acier", "bronze", "obsidienne", "sang", "jade"]
cat("epee", "Épée longue", "f", ER, ER + " · armes", [], 0, (), ())
cat("epee_lame", "Épée de chevalier", "f", ER, ER + " · armes", ARMES, 220, ("dore", "givre", "ombre"), ("cosmique",))
cat("katana", "Lame courbe", "f", ER, ER + " · armes", ["acier", "sang", "obsidienne", "jade"], 260, ("givre", "feu"), (), sec="#d92b4b")
cat("hache", "Hache de guerre", "f", ER, ER + " · armes", ["fer", "acier", "bronze", "obsidienne"], 200, ("dore",), ())
cat("marteau", "Grand marteau", "m", ER, ER + " · armes", ["fer", "bronze", "obsidienne"], 210, ("ombre",), ())
cat("lance", "Lance", "f", ER, ER + " · armes", ["fer", "acier", "bronze"], 170, ("dore",), ())
cat("dague", "Dague", "f", ER, ER + " · armes", ["acier", "sang", "bronze", "jade"], 150, ("ombre",), ())
cat("arc", "Arc long", "m", ER, ER + " · armes", ["bois", "os", "obsidienne"], 180, ("givre",), ())
cat("baton", "Bâton de sorcier", "m", ER, ER + " · magie", ["saphir", "amethyste", "rubis", "emeraude", "topaze", "glace"], 240, ("ombre", "dore"), ("cosmique",))
cat("sceau", "Sceau sacré", "m", ER, ER + " · magie", ["topaze", "saphir", "rubis"], 260, ("dore",), ("prisme",))
cat("rond", "Bouclier rond", "m", ER, ER + " · armures", ["bois", "fer", "bronze", "obsidienne", "cuivre"], 190, ("dore",), (), sec="#c22a1a")
cat("ecu", "Écu à blason", "m", ER, ER + " · armures", ["acier", "bronze", "fer", "obsidienne", "os"], 200, ("argent",), (), sec="#2f62d9")
cat("heaume", "Heaume", "m", ER, ER + " · armures", ["fer", "acier", "bronze", "obsidienne", "cuivre"], 230, ("dore", "ombre"), ())
cat("heaume_cornes", "Heaume à cornes", "m", ER, ER + " · armures", ["fer", "bronze", "obsidienne"], 260, ("givre",), ())
cat("gantelet", "Gantelet", "m", ER, ER + " · armures", ["fer", "acier", "bronze"], 160, ("dore",), ())
cat("fiole", "Fiole", "f", ER, ER + " · objets", ["rubis", "saphir", "emeraude", "amethyste", "topaze", "ambre", "aigue"], 140, ("dore",), ("prisme",))
cat("bague", "Bague", "f", ER, ER + " · objets", ["rubis", "saphir", "emeraude", "amethyste", "topaze", "onyx"], 200, ("givre",), ("cosmique",))
cat("rune", "Pierre runique", "f", ER, ER + " · magie", ["topaze", "saphir", "rubis", "emeraude", "amethyste"], 160, ("dore",), ())
cat("arbre_dore", "Arbre doré", "m", ER, ER + " · rares", [], 0, (), ("dore",))
cat("flamme_grace", "Lueur dorée", "f", ER, ER + " · rares", [], 0, ("dore",), ())
cat("lanterne", "Lanterne de voyage", "f", ER, ER + " · objets", ["bronze", "fer", "cuivre"], 150, ("givre",), ())
cat("cle", "Clé ancienne", "f", ER, ER + " · objets", ["bronze", "fer", "os"], 120, ("dore",), ())
cat("parchemin", "Parchemin scellé", "m", ER, ER + " · objets", ["gris"], 110, (), ())
cat("bougie", "Bougie votive", "f", ER, ER + " · objets", ["gris"], 90, (), ())
cat("crane", "Crâne de pierre", "m", ER, ER + " · objets", ["gris"], 130, (), ())
cat("dragon", "Dragon ancien", "m", ER, ER + " · rares", ["rouge", "vert", "noir"], 450, ("dore", "givre", "ombre"), ("cosmique",), sec="#e9c690")
cat("couronne_epines", "Couronne du seigneur", "f", ER, ER + " · rares", [], 0, ("dore", "argent", "ombre"), ("prisme",), sec="#d92b4b")

AN = "Animaux"
PELAGES = ["roux", "gris", "noir", "creme", "caramel", "chocolat", "cendre", "neige"]
cat("chat_tete", "Chat", "m", AN, AN + " · chats et chiens", PELAGES, 120, ("dore",), ("cosmique",))
cat("chat_assis", "Chat assis", "m", AN, AN + " · chats et chiens", ["roux", "gris", "noir", "creme", "caramel", "neige"], 130, (), ())
cat("chien_tete", "Chien", "m", AN, AN + " · chats et chiens", ["caramel", "chocolat", "creme", "noir", "gris", "fauve", "sable", "neige"], 120, ("dore",), ())
cat("lapin", "Lapin", "m", AN, AN + " · forêt", ["gris", "creme", "neige", "chocolat", "caramel"], 110, (), ("arc",))
cat("souris", "Souris", "f", AN, AN + " · forêt", ["gris", "creme", "chocolat"], 90, (), ())
cat("ours", "Ours", "m", AN, AN + " · forêt", ["brun", "chocolat", "creme", "noir"], 140, ("givre",), ())
cat("panda", "Panda", "m", AN, AN + " · forêt", ["gris"], 160, (), ())
cat("renard", "Renard", "m", AN, AN + " · forêt", ["roux", "neige", "charbon"], 150, ("feu",), ())
cat("loup", "Loup", "m", AN, AN + " · forêt", ["gris", "charbon", "neige"], 150, ("ombre",), ())
cat("herisson", "Hérisson", "m", AN, AN + " · forêt", ["chocolat", "gris"], 120, (), ())
cat("ecureuil", "Écureuil", "m", AN, AN + " · forêt", ["roux", "gris"], 120, (), ())
cat("raton", "Raton", "m", AN, AN + " · forêt", ["gris"], 130, (), ())
cat("cochon", "Cochon", "m", AN, AN + " · ferme", ["rose"], 100, (), ())
cat("vache", "Vache", "f", AN, AN + " · ferme", ["gris"], 100, (), ())
cat("mouton", "Mouton", "m", AN, AN + " · ferme", ["charbon", "creme", "chocolat"], 100, ("dore",), ())
cat("poussin", "Poussin", "m", AN, AN + " · ferme", ["jaune", "creme"], 80, (), ())
cat("canard", "Canard", "m", AN, AN + " · ferme", ["jaune", "neige", "vert"], 90, (), ())
cat("cheval", "Cheval", "m", AN, AN + " · ferme", ["caramel", "chocolat", "neige", "noir"], 150, (), ())
cat("poisson", "Poisson", "m", AN, AN + " · mer", ["orange", "bleu", "jaune", "rouge", "violet", "vert", "rose", "turquoise"], 90, ("dore",), ("arc",), sec="#ffffff")
cat("baleine", "Baleine", "f", AN, AN + " · mer", ["bleu", "marine", "gris"], 150, (), ())
cat("pieuvre", "Pieuvre", "f", AN, AN + " · mer", ["rose", "violet", "rouge", "orange"], 120, (), ("cosmique",))
cat("crabe", "Crabe", "m", AN, AN + " · mer", ["rouge", "orange", "bleu"], 100, (), ())
cat("tortue", "Tortue", "f", AN, AN + " · mer", ["vert", "menthe", "kaki"], 120, (), (), sec="#9a6332", prim_def=None)
cat("meduse", "Méduse", "f", AN, AN + " · mer", ["rose", "lavande", "ciel", "menthe"], 110, ("neon",), ())
cat("dauphin", "Dauphin", "m", AN, AN + " · mer", ["ciel", "gris"], 140, (), ())
cat("etoile_mer", "Étoile de mer", "f", AN, AN + " · mer", ["orange", "rose", "violet", "jaune"], 80, (), ())
cat("oiseau", "Oiseau", "m", AN, AN + " · oiseaux", ["bleu", "rouge", "jaune", "vert", "rose", "orange", "turquoise", "violet"], 90, (), (), sec="#ffffff")
cat("hibou", "Hibou", "m", AN, AN + " · oiseaux", ["brun", "gris", "neige"], 130, ("givre",), ())
cat("pingouin", "Manchot", "m", AN, AN + " · oiseaux", ["gris"], 120, (), ())
cat("perroquet", "Perroquet", "m", AN, AN + " · oiseaux", ["rouge", "vert", "bleu"], 140, (), (), sec="#ffd23f")
cat("flamant", "Flamant", "m", AN, AN + " · oiseaux", ["rose"], 130, (), ())
cat("papillon", "Papillon", "m", AN, AN + " · insectes", ["bleu", "orange", "violet", "rose", "jaune", "turquoise"], 100, ("dore",), ("prisme",), sec="#ffffff")
cat("abeille", "Abeille", "f", AN, AN + " · insectes", ["jaune"], 90, (), ())
cat("coccinelle", "Coccinelle", "f", AN, AN + " · insectes", ["rouge", "orange", "jaune"], 90, (), ())
cat("escargot", "Escargot", "m", AN, AN + " · insectes", ["corail", "violet", "turquoise"], 90, (), ())
cat("licorne", "Licorne", "f", AN, AN + " · créatures", ["neige", "lavande", "rose"], 400, ("dore",), ("arc", "cosmique"), sec="#ff7ab6")
cat("bebe_dragon", "Bébé dragon", "m", AN, AN + " · créatures", ["vert", "violet", "rouge", "turquoise"], 350, ("givre", "dore"), ("cosmique",), sec="#ffd23f")
cat("phenix", "Phénix", "m", AN, AN + " · créatures", [], 0, ("feu", "givre"), ("arc",))

SP = "Sport"
cat("ballon_soccer", "Ballon de soccer", "m", SP, SP + " · ballons", ["gris"], 100, ("dore",), ())
cat("ballon_rayures", "Ballon de plage", "m", SP, SP + " · ballons", ["rouge", "bleu", "vert", "jaune", "rose"], 80, (), ())
cat("ballon_basket", "Ballon de basket", "m", SP, SP + " · ballons", ["orange"], 100, (), ("feu",))
cat("ballon_foot", "Ballon de football", "m", SP, SP + " · ballons", ["brun"], 100, (), ())
cat("balle_baseball", "Balle de baseball", "f", SP, SP + " · ballons", ["gris"], 90, (), ())
cat("balle_tennis", "Balle de tennis", "f", SP, SP + " · ballons", ["lime", "jaune", "rose"], 80, (), ())
cat("ballon_volley", "Ballon de volley", "m", SP, SP + " · ballons", ["bleu", "rouge", "vert"], 90, (), (), sec="#ffd23f")
cat("boule_bowling", "Boule de quilles", "f", SP, SP + " · ballons", ["bleu", "rouge", "violet", "noir", "vert"], 100, ("argent",), ("cosmique",))
cat("boule_billard", "Boule de billard", "f", SP, SP + " · ballons", ["jaune", "bleu", "rouge", "violet", "orange", "vert", "brun", "noir"], 90, (), ())
cat("hockey", "Bâton et rondelle", "m", SP, SP + " · équipement", ["gris"], 110, (), ())
cat("raquette", "Raquette", "f", SP, SP + " · équipement", ["rouge", "bleu", "vert", "violet"], 100, (), ())
cat("sifflet", "Sifflet", "m", SP, SP + " · équipement", ["rouge", "bleu", "jaune", "vert"], 80, ("argent",), ())
cat("medaille", "Médaille", "f", SP, SP + " · podium", ["bronze", "acier", "cuivre"], 200, ("dore", "argent"), ("prisme",), sec="#2d8cff")
cat("chaussure", "Chaussure de course", "f", SP, SP + " · équipement", ["rouge", "bleu", "vert", "rose", "noir", "orange", "violet"], 110, ("neon",), (), sec="#ffffff")
cat("gant_boxe", "Gant de boxe", "m", SP, SP + " · équipement", ["rouge", "bleu", "noir", "vert"], 110, ("dore",), ())
cat("haltere", "Haltère", "m", SP, SP + " · équipement", ["noir", "rouge", "bleu"], 90, (), ())
cat("planche", "Planche à roulettes", "f", SP, SP + " · glisse", ["rouge", "bleu", "vert", "violet", "orange", "noir"], 120, ("neon",), ("arc",), sec="#ffd23f")
cat("surf", "Planche de surf", "f", SP, SP + " · glisse", ["turquoise", "orange", "rose", "jaune", "bleu", "lime"], 110, (), (), sec="#ffffff")
cat("velo", "Vélo", "m", SP, SP + " · glisse", ["rouge", "bleu", "vert"], 140, (), ())
cat("frisbee", "Disque volant", "m", SP, SP + " · équipement", ["rouge", "bleu", "jaune", "vert"], 70, (), ())
cat("patin", "Patin", "m", SP, SP + " · glisse", ["blanc", "noir", "rose"], 110, (), ())
cat("podium", "Podium", "m", SP, SP + " · podium", ["gris"], 150, (), ())

ES = "Espace"
cat("planete_anneau", "Planète à anneau", "f", ES, ES + " · planètes", ["orange", "bleu", "violet", "vert", "rose", "jaune", "turquoise", "rouge"], 130, ("dore",), ("cosmique",), sec="#ffd23f")
cat("planete", "Planète", "f", ES, ES + " · planètes", ["bleu", "rouge", "vert", "violet", "orange", "turquoise", "beige", "rose"], 110, ("givre",), ("prisme",))
cat("croissant_lune", "Croissant de lune", "m", ES, ES + " · planètes", ["jaune", "blanc", "lavande"], 90, ("argent",), ())
cat("comete", "Comète", "f", ES, ES + " · ciel", ["ciel", "jaune", "rose", "menthe"], 110, ("feu",), (), sec="#ffffff")
cat("fusee", "Fusée", "f", ES, ES + " · vaisseaux", ["rouge", "bleu", "vert", "violet", "orange", "noir"], 140, ("argent",), ("arc",))
cat("soucoupe", "Soucoupe", "f", ES, ES + " · vaisseaux", ["gris", "vert", "violet", "rose", "turquoise", "orange"], 140, ("neon",), ("cosmique",))
cat("satellite", "Satellite", "m", ES, ES + " · vaisseaux", ["gris"], 130, (), ())
cat("etoile_filante", "Étoile filante", "f", ES, ES + " · ciel", ["jaune", "rose", "ciel", "menthe"], 100, ("dore",), ("arc",), sec="#ffffff")
cat("asteroide", "Astéroïde", "m", ES, ES + " · ciel", ["gris"], 80, (), ())
cat("extraterrestre", "Petit visiteur", "m", ES, ES + " · vaisseaux", ["vert", "violet", "turquoise", "rose", "lime", "orange"], 120, ("neon",), ())
cat("trou_noir", "Trou noir", "m", ES, ES + " · rares", [], 0, (), ("cosmique",))
cat("galaxie", "Galaxie spirale", "f", ES, ES + " · rares", [], 0, ("givre",), ("cosmique", "arc"))
cat("telescope", "Télescope", "m", ES, ES + " · ciel", ["bleu", "rouge", "brun"], 120, (), ())
cat("astronaute_casque", "Casque spatial", "m", ES, ES + " · vaisseaux", ["ciel", "violet", "orange"], 160, ("dore",), ())

NO = "Nourriture"
cat("beigne", "Beigne", "m", NO, NO + " · sucreries", ["rose", "chocolat", "blanc", "jaune", "menthe", "lavande", "framboise", "caramel"], 80, ("dore",), ("arc",), sec="#ffffff")
cat("cupcake", "Petit gâteau", "m", NO, NO + " · sucreries", ["rose", "blanc", "chocolat", "menthe", "lavande", "jaune"], 90, (), (), sec="#ff9fc6")
cat("sucette", "Suçon", "m", NO, NO + " · sucreries", ["rose", "turquoise", "jaune", "violet", "orange", "vert"], 70, (), ("arc",), sec="#ffffff")
cat("bonbon", "Bonbon", "m", NO, NO + " · sucreries", ["rouge", "vert", "violet", "jaune", "bleu", "rose"], 60, (), ())
cat("glace", "Cornet de crème glacée", "m", NO, NO + " · sucreries", ["rose", "menthe", "chocolat", "blanc", "lavande", "jaune", "framboise", "orange"], 80, (), (), sec="#6b4226")
cat("pizza", "Pointe de pizza", "f", NO, NO + " · repas", ["gris"], 90, (), ())
cat("burger", "Burger", "m", NO, NO + " · repas", ["gris"], 90, (), ())
cat("frites", "Frites", "f", NO, NO + " · repas", ["gris"], 80, (), ())
cat("sushi", "Sushi", "m", NO, NO + " · repas", ["orange", "rouge", "jaune", "vert"], 80, (), ())
cat("onigiri", "Boule de riz", "f", NO, NO + " · repas", ["gris"], 70, (), ())
cat("hotdog", "Hot-dog", "m", NO, NO + " · repas", ["gris"], 80, (), ())
cat("croissant", "Croissant", "m", NO, NO + " · repas", ["gris"], 70, (), ())
cat("fromage", "Pointe de fromage", "f", NO, NO + " · repas", ["gris"], 70, (), ())
cat("oeuf", "Œuf au plat", "m", NO, NO + " · repas", ["gris"], 60, (), ())
cat("carotte", "Carotte", "f", NO, NO + " · fruits et légumes", ["gris"], 60, (), ())
cat("brocoli", "Brocoli", "m", NO, NO + " · fruits et légumes", ["gris"], 60, (), ())
cat("pomme", "Pomme", "f", NO, NO + " · fruits et légumes", ["rouge", "vert", "jaune"], 60, ("dore",), ())
cat("pasteque", "Tranche de melon d'eau", "f", NO, NO + " · fruits et légumes", ["gris"], 70, (), ())
cat("cerises", "Cerises", "f", NO, NO + " · fruits et légumes", ["rouge", "framboise"], 60, (), ())
cat("fraise", "Fraise", "f", NO, NO + " · fruits et légumes", ["rouge"], 60, (), ())
cat("tasse", "Tasse", "f", NO, NO + " · boissons", ["rouge", "bleu", "jaune", "vert", "rose", "blanc"], 70, (), ())
cat("boisson", "Boisson pétillante", "f", NO, NO + " · boissons", ["rouge", "orange", "vert", "violet", "bleu", "rose"], 70, (), (), sec="#ffffff")
cat("verre_jus", "Verre de jus", "m", NO, NO + " · boissons", ["orange", "violet", "rose", "jaune"], 60, (), ())
cat("gateau", "Gâteau de fête", "m", NO, NO + " · sucreries", ["rose", "chocolat", "blanc", "menthe"], 110, ("dore",), (), sec="#ff7ab6")
cat("biscuit", "Biscuit", "m", NO, NO + " · sucreries", ["gris"], 60, (), ())
cat("macaron", "Macaron", "m", NO, NO + " · sucreries", ["rose", "menthe", "lavande", "jaune", "chocolat", "framboise", "ciel", "orange"], 70, ("dore",), ())

MU = "Musique et loisirs"
cat("note", "Double croche", "f", MU, MU + " · musique", ["violet", "bleu", "rose", "noir", "turquoise", "orange"], 70, ("dore",), ("arc",))
cat("croche", "Croche", "f", MU, MU + " · musique", ["violet", "bleu", "rose", "noir", "vert", "rouge"], 60, (), ())
cat("guitare", "Guitare", "f", MU, MU + " · musique", ["rouge", "bleu", "caramel", "noir"], 140, ("dore",), ("feu",))
cat("tambour", "Tambour", "m", MU, MU + " · musique", ["rouge", "bleu"], 100, (), ())
cat("piano", "Clavier de piano", "m", MU, MU + " · musique", ["gris"], 110, (), ())
cat("micro", "Micro", "m", MU, MU + " · musique", ["noir", "rouge", "bleu"], 90, ("dore",), ())
cat("casque_audio", "Casque d'écoute", "m", MU, MU + " · musique", ["noir", "blanc", "rouge", "bleu", "rose", "vert"], 120, ("neon",), (), sec="#3a3f4b")
cat("cassette", "Cassette", "f", MU, MU + " · musique", ["orange", "bleu", "rose", "noir"], 90, (), ())
cat("vinyle", "Disque vinyle", "m", MU, MU + " · musique", ["rouge", "bleu", "jaune", "vert"], 100, ("dore",), ())
cat("manette", "Manette de jeu", "f", MU, MU + " · jeux", ["gris", "noir", "bleu", "rouge", "violet", "blanc"], 130, ("dore",), ("arc",))
cat("de", "Dé", "m", MU, MU + " · jeux", ["blanc", "rouge", "bleu", "vert", "violet", "jaune"], 60, (), ())
cat("carte_jeu", "As", "m", MU, MU + " · jeux", ["rouge", "noir"], 70, (), ())
cat("casse_tete", "Pièce de casse-tête", "f", MU, MU + " · jeux", ["rouge", "bleu", "vert", "jaune", "violet", "orange"], 60, (), ())
cat("ballon_fete", "Ballon de fête", "m", MU, MU + " · fête", ["rouge", "bleu", "vert", "jaune", "rose", "violet", "orange", "turquoise"], 50, ("dore",), ())
cat("micro_etoile", "Étoile de scène", "f", MU, MU + " · fête", ["gris"], 90, (), ())

ME = "Météo et saisons"
cat("feuille", "Feuille", "f", ME, ME + " · automne", ["rouge", "orange", "jaune", "vert", "brun", "framboise"], 50, ("dore",), ())
cat("citrouille", "Citrouille", "f", ME, ME + " · automne", ["gris"], 90, (), ())
cat("sapin", "Sapin décoré", "m", ME, ME + " · hiver", ["vert", "menthe", "blanc"], 110, (), ())
cat("bonhomme_neige", "Bonhomme de neige", "m", ME, ME + " · hiver", ["rouge", "bleu", "vert"], 110, (), ())
cat("cadeau", "Cadeau", "m", ME, ME + " · fêtes", ["rouge", "bleu", "vert", "violet", "rose", "jaune", "turquoise", "orange"], 80, ("dore",), (), sec="#ffd23f")
cat("flocon", "Flocon", "m", ME, ME + " · hiver", ["ciel", "blanc", "lavande", "menthe"], 60, ("givre",), ())
cat("parapluie", "Parapluie", "m", ME, ME + " · pluie", ["rouge", "bleu", "jaune", "vert", "rose", "violet"], 80, (), ())
cat("fleur", "Fleur", "f", ME, ME + " · printemps", ["rose", "rouge", "violet", "bleu", "orange", "blanc", "lavande", "corail", "jaune", "turquoise"], 60, ("dore",), ("arc",))
cat("tulipe", "Tulipe", "f", ME, ME + " · printemps", ["rouge", "rose", "jaune", "violet", "orange", "blanc"], 60, (), ())
cat("cactus", "Cactus", "m", ME, ME + " · été", ["gris"], 70, (), ())
cat("champignon", "Champignon", "m", ME, ME + " · automne", ["rouge", "orange", "violet", "bleu", "brun", "rose"], 70, (), ("prisme",))
cat("soleil_visage", "Soleil souriant", "m", ME, ME + " · été", ["gris"], 90, (), ())
cat("nuage_pluie", "Nuage de pluie", "m", ME, ME + " · pluie", ["gris"], 70, (), ())
cat("arc_en_ciel", "Arc-en-ciel", "m", ME, ME + " · pluie", ["gris"], 120, (), ())
cat("eclair", "Éclair", "m", ME, ME + " · pluie", ["jaune", "ciel", "violet"], 70, ("neon",), ())
cat("bonnet", "Tuque", "f", ME, ME + " · hiver", ["rouge", "bleu", "vert", "violet", "rose", "orange"], 70, (), (), sec="#ffffff")

TR = "Trésors"
GEMMES = ["rubis", "saphir", "emeraude", "amethyste", "topaze", "aigue", "quartz", "onyx", "citrine", "pourpre"]
cat("gemme", "Gemme", "f", TR, TR + " · gemmes", GEMMES, 300, ("givre",), ("prisme", "cosmique"))
cat("cristaux", "Amas de cristaux", "m", TR, TR + " · gemmes", ["amethyste", "aigue", "quartz", "emeraude"], 260, (), ("arc",))
cat("piece", "Pièce ancienne", "f", TR, TR + " · or", ["cuivre", "bronze"], 150, ("dore", "argent"), ())
cat("lingot", "Lingot", "m", TR, TR + " · or", ["cuivre"], 300, ("dore", "argent"), ("prisme",))
cat("coffre", "Coffre au trésor", "m", TR, TR + " · or", ["gris"], 400, (), ())
cat("couronne", "Couronne", "f", TR, TR + " · or", ["bronze", "cuivre"], 500, ("dore", "argent", "givre"), ("arc", "cosmique"))
cat("sac_pieces", "Sac de pièces", "m", TR, TR + " · or", ["gris"], 350, (), ())
cat("diamant", "Diamant", "m", TR, TR + " · gemmes", ["glace", "quartz", "citrine"], 450, ("givre",), ("prisme", "arc"))
cat("tresor_carte", "Carte au trésor", "f", TR, TR + " · or", ["gris"], 200, (), ())
cat("trefle", "Trèfle à quatre feuilles", "m", TR, TR + " · porte-bonheur", ["vert", "menthe"], 150, ("dore",), ("arc",))

# prix : commun = prix de base ± 30 % (au pas de 10) ; rare 1500–6000 ; très rare 12000–25000 (déterministes)
def h(s):
    return int(hashlib.sha1(s.encode()).hexdigest()[:8], 16)


ACCORDS_ART = {"de ", "d'"}


def nom_variante(nom, genre, adj):
    return nom + " " + adj


def construire():
    sprites, liste, effets, vus = {}, [], {}, set()
    for c in CAT:
        base, nom, genre = c["base"], c["nom"], c["genre"]
        sec = trio(c["sec"])
        items = []
        for k in c["communs"]:
            m, fe, hexa = COUL[k]
            items.append(("c", k, (m if genre == "m" else fe), trio(hexa)))
        for k in c["rares"]:
            m, fe, x = FIN[k]
            items.append(("r", k, (m if genre == "m" else fe), x))
        for k in c["tres"]:
            m, fe, x = FIN[k]
            items.append(("t", k, (m if genre == "m" else fe), x))
        if not items:
            continue
        for rar, k, adj, x in items:
            sid = "p_" + base + "_" + k
            assert sid not in vus, sid
            vus.add(sid)
            if isinstance(x, str):
                prim, fin = trio("#888888"), x
            else:
                prim, fin = x, None
            # une variante « neige / blanc / perle » garde un contour lisible ; « gris » sur une forme à couleurs fixes = couleur d'origine
            rows, pal = peindre(base, prim, sec, fin, h(sid))
            sprites[sid] = compacter(rows, pal)
            nm = nom if (k == "gris" and c["communs"] == ["gris"]) or adj in nom else nom_variante(nom, genre, adj)
            if rar == "c":
                p = max(40, int(round(c["prix"] * (0.8 + (h(sid) % 50) / 100) / 10)) * 10)
            elif rar == "r":
                p = 1500 + (h(sid) % 46) * 100
            else:
                p = 12000 + (h(sid) % 131) * 100
            liste.append([sid, nm, p, c["rangee"], c["theme"], {"c": "commun", "r": "rare", "t": "tres_rare"}[rar]])
            if rar in "rt":
                effets[sid] = "brille" if rar == "r" else "scintille"
    return sprites, liste, effets


if __name__ == "__main__":
    sprites, liste, effets = construire()
    noms = [x[1] for x in liste]
    import collections
    dbl = [n for n, k in collections.Counter(noms).items() if k > 1]
    print("autocollants :", len(liste), "doublons de noms :", dbl[:20])
    print(collections.Counter(x[5] for x in liste))
    print(collections.Counter(x[4] for x in liste))
    json.dump({"sprites": sprites, "liste": liste, "effets": effets}, open("/home/claude/gen/pack_brut.json", "w"), ensure_ascii=False)
