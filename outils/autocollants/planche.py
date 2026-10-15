import json, re, sys
from PIL import Image, ImageDraw
P = json.load(open(sys.argv[1]))
def dep(v):
    p, f = v.split(";"); pal = {p[i]: "#" + p[i+1:i+7] for i in range(0, len(p), 7)}
    k = f.index(":"); w = int(f[:k]); x = re.sub(r"(\d+)(\D)", lambda m: m.group(2) * int(m.group(1)), f[k+1:])
    return pal, [x[i:i+w] for i in range(0, len(x), w)]
theme = sys.argv[2]
items = [x for x in P["liste"] if x[4] == theme]
S, C = 4, 16
cols = 16; rows = (len(items) + cols - 1) // cols
im = Image.new("RGB", (cols * 100, rows * 100), "#cfd6e3")
d = ImageDraw.Draw(im)
for i, it in enumerate(items):
    pal, g = dep(P["sprites"][it[0]])
    ox, oy = (i % cols) * 100 + 4, (i // cols) * 100 + 4
    if it[5] != "commun": d.rectangle([ox-3, oy-3, ox+93, oy+93], outline="#d4a000" if it[5]=="rare" else "#c000ff", width=3)
    for y, r in enumerate(g):
        for x, c in enumerate(r):
            if c != ".": d.rectangle([ox + x*S, oy + y*S, ox + x*S + S - 1, oy + y*S + S - 1], fill=pal[c])
im.save(sys.argv[3])
print(len(items))
