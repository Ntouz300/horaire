# réécrit le bloc <PACK_AC> du fichier PC avec pack_z.txt
import sys, re
p = sys.argv[1]; s = open(p, encoding='utf-8').read(); z = open('/home/claude/gen/pack_z.txt').read()
lignes = "\n".join('    "%s"' % z[i:i+110] for i in range(0, len(z), 110))
a = s.index('# <PACK_AC>\n'); b = s.index('# </PACK_AC>')
s = s[:a] + '# <PACK_AC>\nPACK_AC_Z = (\n' + lignes + ')\n' + s[b:]
open(p, 'w', encoding='utf-8').write(s); print('PC : bloc PACK_AC remplacé', len(z))
