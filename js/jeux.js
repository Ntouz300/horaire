/* Géos (monnaie virtuelle), mini-jeux de casino, boutique et autocollants des notes.
   Mêmes règles, mêmes gains et mêmes dessins que sur le PC (constantes JX produites par le même fichier de référence). */
"use strict";

/* <JX> */
const JX = {"sprites": {"etoile": {"pal": {"O": "#7a4a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#f0a500"}, "rows": [".....OO.....", ".....OYO....", "....OYYO....", "OOOOOYWYOOOO", "OYYYYWYYYYDO", ".OYYYYYYYDO.", "..OYYYYYDO..", "..OYYYYYDO..", ".OYYYOOYYDO.", ".OYYO..OYDO.", "OYDO....ODDO", "OOO......OOO"]}, "etoiles": {"pal": {"O": "#5a3a8a", "Y": "#ffe066", "P": "#ff8fd1", "C": "#7fd3ff"}, "rows": ["..O.........", ".OYO.....O..", "OYYYO...OPO.", ".OYO...OPPPO", "..O.....OPO.", ".........O..", "....O.......", "...OCO......", "..OCCCO.....", "...OCO...O..", "....O...OYO.", ".........O.."]}, "coeur": {"pal": {"O": "#6b0f1f", "R": "#ff3b5c", "W": "#ffd0d8", "D": "#c81e3c"}, "rows": ["............", "..OOO..OOO..", ".ORRRO.ORRRO", "ORWWRROORRRD", "ORWRRRRRRRRD", "ORRRRRRRRRRD", ".ORRRRRRRRD.", "..ORRRRRRD..", "...ORRRRD...", "....ORRD....", ".....OD.....", "............"]}, "coeurs": {"pal": {"O": "#7a1040", "P": "#ff7ab8", "R": "#ff3b5c", "W": "#ffe0ef"}, "rows": [".OO.OO......", "OPWOPPO.....", "OPPPPPO.....", ".OPPPO......", "..OPO.OO.OO.", "...O.ORWORRO", ".....ORRRRRO", "......ORRRO.", ".......ORO..", "........O...", "............", "............"]}, "soleil": {"pal": {"O": "#a35a00", "Y": "#ffd23f", "R": "#ff9f1c", "W": "#fff3b0", "D": "#f0a500"}, "rows": [".....R......", ".R...R...R..", "..R.....R...", "....OOOO....", "...OYWYYO...", "RR.OYYYYO.RR", "...OYYYYO...", "...OYYYDO...", "....OOOO....", "..R.....R...", ".R...R...R..", ".....R......"]}, "lune": {"pal": {"O": "#3b3f6b", "Y": "#fff0a8", "D": "#e3c860", "S": "#ffffff"}, "rows": ["....OOOO....", "..OOYYYO....", ".OYYYOO.....", ".OYYO.......", "OYYDO....S..", "OYYDO...SSS.", "OYYDO....S..", "OYYYDO......", ".OYYYDOO....", ".OOYYYYYOOO.", "...OOYYYYO..", ".....OOOO..."]}, "nuage": {"pal": {"O": "#5b7290", "W": "#ffffff", "B": "#d8e6f5"}, "rows": ["............", "............", "....OOO.....", "...OWWWO....", "..OWWWWWOO..", ".OOWWWWWWWO.", "OWWWWWWWWWWO", "OWWWWWWWWWBO", "OBWWWWWWWBBO", ".OBBBBBBBBO.", "..OOOOOOOO..", "............"]}, "eclair": {"pal": {"O": "#6b4a00", "Y": "#ffe14d", "W": "#fffbe0"}, "rows": ["......OOOO..", ".....OYYO...", "....OYWO....", "...OYYO.....", "..OYYOOOOO..", ".OYYYYYYYO..", ".OOOOOYYO...", "....OYYO....", "...OYYO.....", "..OYYO......", "..OYO.......", "..OO........"]}, "arcenciel": {"pal": {"R": "#ff4d4d", "A": "#ff9f1c", "Y": "#ffe14d", "G": "#3ddc84", "B": "#3aa0ff", "V": "#9b5cff", "W": "#ffffff"}, "rows": ["............", "...RRRRRR...", "..RAAAAAAR..", ".RAYYYYYYAR.", "RAYGGGGGGYAR", "RAYGBBBBGYAR", "RAYGBVVBGYAR", "RAYGBV.VBGYA", "WWWGBV..WWWW", "WWWWW...WWWW", ".WWW.....WW.", "............"]}, "fleur": {"pal": {"O": "#7a1f5c", "P": "#ff8fd1", "Y": "#ffd23f", "G": "#3ba55c", "D": "#1f6b38"}, "rows": ["....OOO.....", "...OPPPO....", ".OOOPPPOOO..", "OPPPOYOPPPO.", "OPPPYYYPPPO.", ".OOOOYOOOO..", "...OPPPO....", "....OOO.....", ".....G..DD..", "..DD.G.DGD..", "..DGDGDD....", ".....G......"]}, "chat": {"pal": {"O": "#3a2a1e", "A": "#ffa94d", "W": "#fff4e6", "P": "#ff8fa3", "K": "#1a1a1a"}, "rows": ["O.........O.", "OO.......OO.", "OAO.....OAO.", "OAAOOOOOAAO.", "OAAAAAAAAAO.", "OAKAAAAAKAO.", "OAKAAAAAKAO.", "OAAAWPWAAAO.", ".OAAWWWAAO..", "..OOAAAOO...", "....OOO.....", "............"]}, "chien": {"pal": {"O": "#3a2a1e", "B": "#c98b52", "D": "#7a4a24", "W": "#fff4e6", "K": "#1a1a1a", "P": "#ff6b81"}, "rows": [".OO.....OO..", "ODDO...ODDO.", "ODDOOOOODDO.", "ODDBBBBBDDO.", "ODBKBBBKBDO.", ".OBBBBBBBO..", ".OBBWWWBBO..", ".OBWWKWWBO..", "..OWWWWWO...", "..OOWPWOO...", "....OPO.....", ".....O......"]}, "renard": {"pal": {"O": "#4a1e00", "A": "#ff7a1a", "W": "#ffffff", "K": "#1a1a1a"}, "rows": ["O.........O.", "OO.......OO.", "OAO.....OAO.", "OAAOOOOOAAO.", "OAAAAAAAAAO.", "OWAKAAAKAWO.", "OWWAAAAAWWO.", ".OWWWWWWWO..", "..OWWWWWO...", "...OWKWO....", "....OOO.....", "............"]}, "hibou": {"pal": {"O": "#2e1f12", "B": "#8b5a2b", "L": "#c08a52", "W": "#ffffff", "K": "#1a1a1a", "Y": "#ffb703"}, "rows": [".O.......O..", ".OO.....OO..", ".OBOOOOOBO..", "OBWWWBWWWBO.", "OBWKWBWKWBO.", "OBWWWYWWWBO.", "OBBBBYBBBBO.", "OBLBLBLBLBO.", "OBBLBLBLBBO.", ".OBBBBBBBO..", "..OYO.OYO...", "............"]}, "grenouille": {"pal": {"O": "#123d1c", "G": "#4cd964", "D": "#2a9d4b", "W": "#ffffff", "K": "#1a1a1a", "P": "#ff8fa3"}, "rows": ["............", ".OOO...OOO..", "OWWWO.OWWWO.", "OWKWOOOWKWO.", "OGGGGGGGGGO.", "OGGGGGGGGGO.", "OGPGGGGGPGO.", "OGOGGGGGOGO.", ".OGOOOOOGO..", ".ODGGGGGDO..", "OGOOOOOOOGO.", "OO.......OO."]}, "poisson": {"pal": {"O": "#0b3d5c", "B": "#3aa0ff", "L": "#9ad4ff", "W": "#ffffff", "K": "#1a1a1a", "Y": "#ffd23f"}, "rows": ["............", "....OOOO....", "..OOBBBBOO..", ".OBBLBBBBO.O", "OBWKBLBBBBOO", "OBBBBBLBBBBO", "OBBBBBBLBBBO", ".OBBBBBBBBOO", "..OOBBBBOO.O", "....OYYO....", ".....OO.....", "............"]}, "papillon": {"pal": {"O": "#2a1d3a", "P": "#c084fc", "M": "#f472b6", "Y": "#fde047", "K": "#1a1a1a"}, "rows": ["..O.....O...", "...O...O....", "OOO.O.O.OOO.", "OPPOOKOOPPO.", "OPYPMKMPYPO.", "OPPPMKMPPPO.", ".OPPOKOPPO..", ".OMMOKOMMO..", "OMYMOKOMYMO.", "OMMO.K.OMMO.", ".OO.....OO..", "............"]}, "champignon": {"pal": {"O": "#4a0f0f", "R": "#e63946", "W": "#ffffff", "C": "#f5e6c8", "K": "#1a1a1a"}, "rows": ["....OOOO....", "..OORRRROO..", ".ORRWWRRRRO.", ".ORWWWRRWRO.", "ORRWWRRWWWRO", "ORRRRRRRWWRO", "OOOOOOOOOOOO", "...OCCCCO...", "...OCCCCO...", "...OCCCCO...", "...OCCCCO...", "....OOOO...."]}, "gateau": {"pal": {"O": "#4a2a14", "C": "#ffe0ef", "P": "#ff8fd1", "B": "#c98b52", "Y": "#ffd23f", "R": "#e63946"}, "rows": [".....Y......", ".....R......", ".....O......", "..OOOOOOO...", ".OCCCCCCCO..", ".OPCPCPCPO..", ".OBBBBBBBO..", ".OCCCCCCCO..", ".OBBBBBBBO..", ".OBBBBBBBO..", "OOOOOOOOOOO.", "............"]}, "fusee": {"pal": {"O": "#1f2a44", "W": "#eef3ff", "R": "#ff4d4d", "B": "#3aa0ff", "Y": "#ffd23f", "A": "#ff9f1c"}, "rows": [".....OO.....", "....ORRO....", "....OWWO....", "...OWBBWO...", "...OWBBWO...", "...OWWWWO...", "..OROWWORO..", ".ORRWWWWRRO.", ".OO.OOOO.OO.", ".....YY.....", "....YAAY....", ".....AA....."]}, "pouce": {"pal": {"O": "#5a3a1a", "S": "#ffd6a5", "D": "#e8a96b", "B": "#3aa0ff"}, "rows": ["....OO......", "...OSSO.....", "...OSSO.....", "..OSSO......", "OOOSSOOOOO..", "OBOSSSSSSSO.", "OBOSSSSSSDO.", "OBOSSSSSSO..", "OBOSSSSSSDO.", "OBOSSSSSSO..", "OOOODDDDO...", "....OOOO...."]}, "sourire": {"pal": {"O": "#7a4a00", "Y": "#ffd23f", "K": "#3a2400", "P": "#ff8fa3", "W": "#fff6c2"}, "rows": ["....OOOO....", "..OOYYYYOO..", ".OYWYYYYYYO.", ".OYYKYYKYYO.", "OYYYKYYKYYYO", "OYYYYYYYYYYO", "OYPYYYYYYPYO", "OYYKYYYYKYYO", ".OYYKKKKYYO.", ".OYYYYYYYYO.", "..OOYYYYOO..", "....OOOO...."]}, "trophee": {"pal": {"O": "#5a3a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#e0a100", "B": "#7a4a24"}, "rows": ["OOOOOOOOOOOO", "OYYWYYYYYYDO", "OYOWYYYYYDOO", "OYOYYYYYYDYO", ".OOYYYYYYDO.", "...OYYYYDO..", "....OYYDO...", ".....OYO....", ".....OYO....", "....OYYDO...", "...OBBBBBO..", "...OOOOOOO.."]}, "couronne": {"pal": {"O": "#5a3a00", "Y": "#ffd23f", "D": "#e0a100", "R": "#e63946", "B": "#3aa0ff", "W": "#fff6c2"}, "rows": ["............", "O....O....O.", "OO..OYO..OO.", "OYO.OYO.OYO.", "OYYOYYYOYYO.", "OYWYYYYYYDO.", "OYYYYYYYYDO.", "OYRYYBYYRDO.", "OYYYYYYYYDO.", "ODDDDDDDDDO.", "OOOOOOOOOOO.", "............"]}, "cristal": {"pal": {"O": "#1d3557", "B": "#48cae4", "L": "#ade8f4", "W": "#ffffff", "D": "#0077b6"}, "rows": ["............", "...OOOOOO...", "..OLWLLBBO..", ".OLWLLBBBDO.", "OOOOOOOOOOOO", "OLLBBBBBBDDO", ".OLLBBBBBDO.", "..OLBBBBDO..", "...OLBBDO...", "....OLDO....", ".....OO.....", "............"]}, "cerise": {"pal": {"O": "#4a0f0f", "R": "#e63946", "W": "#ffd0d8", "G": "#3ba55c", "D": "#1f6b38"}, "rows": ["........DD..", ".......DGGD.", "......D.DD..", ".....D..D...", "....D....D..", "..OOO...OOO.", ".ORRRO.ORRRO", "ORWRRROWRRRO", "ORRRRROORRRO", "ORRRRRO.OOO.", ".OOOOO......", "............"]}, "citron": {"pal": {"O": "#6b5a00", "Y": "#ffe14d", "W": "#fffbe0", "D": "#e0c200", "G": "#3ba55c"}, "rows": ["............", "........GG..", "....OOOOG...", "..OOYYYYOO..", ".OYWWYYYYYO.", "OYWYYYYYYYDO", "OYYYYYYYYYDO", "OYYYYYYYYDDO", ".OYYYYYYDDO.", "..OODDDDOO..", "....OOOO....", "............"]}, "raisin": {"pal": {"O": "#2a0f3a", "V": "#9b5cff", "L": "#c9a8ff", "G": "#3ba55c"}, "rows": [".....GG.....", "....G.......", "..OO.OO.OO..", ".OLVOLVOLVO.", ".OVVOVVOVVO.", "..OOLVOLVO..", "...OVVOVVO..", "....OOLVO...", ".....OVVO...", "......OO....", "............", "............"]}, "cloche": {"pal": {"O": "#5a3a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#e0a100"}, "rows": [".....OO.....", "....OYYO....", "...OYWYYO...", "..OYWYYYDO..", "..OYWYYYDO..", "..OYYYYYDO..", ".OYYYYYYYDO.", ".OYYYYYYYDO.", "OYYYYYYYYYDO", "OOOOOOOOOOOO", ".....OO.....", "............"]}, "sept": {"pal": {"O": "#5a0000", "R": "#ff3b3b", "W": "#ffd0d0"}, "rows": ["............", "OOOOOOOOOOO.", "ORWWWWWWWRO.", "ORRRRRRRRRO.", "OOOOOOORRO..", "......ORRO..", ".....ORRO...", ".....ORRO...", "....ORRO....", "....ORRO....", "....OOOO....", "............"]}, "geo": {"pal": {"O": "#6b4a00", "Y": "#ffd23f", "W": "#fff6c2", "D": "#e0a100", "B": "#b07800"}, "rows": ["....OOOO....", "..OOYYYYOO..", ".OYWYYYYYDO.", ".OWYYOOYYDO.", "OYYYOWDOYYDO", "OYYOWWDDOYDO", "OYYODDDBOYDO", "OYYYODBOYYDO", ".OYYYOOYYDO.", ".OYYYYYYDBO.", "..OOBBBBOO..", "....OOOO...."]}, "geo_hk": {"pal": {"K": "#0b0d12", "B": "#bcd3e6", "L": "#e4eff8", "W": "#ffffff", "S": "#6f88a3"}, "rows": ["....KKK.........", "..KKKLKKKKKKKK..", "..KLWLLBKLLLLK..", ".KKLWLBBLWWLBKK.", ".KLLLBBSLLLBBSK.", ".KKLBBSSLLBBSKK.", "KKLSBSSWLSBSSKKK", "KLWLLSWWLBSLLLBK", "KLWLBBLLBBSWWBBK", "KLLBBSLBBSSLBBSK", "KLBBSSLBSSSBBSSK", "KKBSWWLBLWLBSSKK", ".KKLLLBBLWBBBKK.", "..KLLBBSLBBBSK..", "..KKBBSSBBBSKK..", "...KKKKKKKKKK..."]}, "piece": {"pal": {"O": "O", "D": "D", "A": "A", "L": "L", "W": "W"}, "rows": [".....OO.....", "...OOLDOO...", "..OLLAADDO..", ".OLLWAAAADO.", ".OLAADDAADO.", "OLAADLLDAADO", "ODAADLLDAADO", ".ODAADDAADO.", ".ODAAAAAADO.", "..ODDAADDO..", "...OODDOO...", ".....OO....."]}, "hkc_banc": {"pal": {"K": "#0b0d12", "M": "#3a4256", "W": "#c9c2ae", "L": "#ece6d4", "D": "#7a7462"}, "rows": ["........................", "........................", "........................", "........................", ".......KKKKKKKKKK.......", "......KWWWWWWWWWWK......", ".....KWWWWWWWWWWWWK.....", "....KWWWWMMMWMMMWWWK....", "...KWWWMWMMMWMMMWWWWK...", "..KWWWMMWMMMWMMMWMWWWK..", "..KWWMMMWMMMWMMMWMMWWK..", "..KWWWWWWWWWWWWWWWWWWK..", "..KKKKKKKKKKKKKKKKKKKK..", ".KLLLLLLLLLLLLLLLLLLLLK.", ".KLLLLLLLLLLLLLLLLLLLLK.", ".KDDDDDDDDDDDDDDDDDDDDK.", "..KKMMKKKKKKKKKKKKMMKK..", "...KMMK..........KMMK...", "...KMMK..........KMMK...", "...KMMK..........KMMK...", "..KMMMMK........KMMMMK..", "...KKKK..........KKKK...", "........................", "........................"]}, "hkc_lanterne": {"pal": {"K": "#0b0d12", "M": "#2f3646", "D": "#4c5568", "V": "#9fd8e6", "J": "#e8fbff", "W": "#ffffff", "G": "#1d3a46", "H": "#2f6274"}, "rows": ["..........KKKKK.........", ".........KMMMMMK........", "........KMMMMMMMK.......", ".......KGMVVVVVMK.......", "......KGGMVVVVVMGK......", "......KGHMVJJJVMGK......", ".....KGGHMVJWJVMGGK.....", ".....KGGHMVJJJVMGGK.....", "......KGHMVJJJVMGK......", "......KGGMVVVVVMGK......", ".......KGMVVVVVMK.......", "........KMMMMMMMK.......", ".........KKMMMKK........", "..........KMDMK.........", "..........KMDMK.........", "..........KMDMK.........", "..........KMDMK.........", "..........KMDMK.........", "..........KMDMK.........", "..........KMDMK.........", ".........KKMDMKK........", "........KMMMMMMMK.......", "........KMMMMMMMK.......", ".........KKKKKKK........"]}, "hkc_cristal": {"pal": {"K": "#0b0d12", "B": "#4fb6e8", "L": "#a8e2fb", "D": "#2a6fa8", "W": "#ffffff", "R": "#3a3f4c"}, "rows": ["........................", "........................", "...........KK...........", "..........KLBK..........", ".........KLLBBK.........", ".........KLLBBK.........", "........KWWLBBBK........", ".......KLWWLBBBBKKK.....", ".......KLWWLBBBBKBDK....", ".....KKKLWWLBBBBBBDK....", "....KBDKLWWLBBBBBBDDK...", "...KBBDDLWWLBBBBBBDDK...", "...KBBDDLLLLBBBBBBDDDK..", "..KBBBDDLLLLBBBBBBDDDK..", "..KBBBDDDLLLBBBBBBDDDK..", "..KBBBDDDLLLBBBBBBDDDK..", "..KBBBDDDLLLBBBBBBDDDK..", "..KBBBDDDLLLBBBBBBDDK...", "...KBBDDDLLLBBBBBBDDK...", "...KBBDDDLLLBBBBBBDDK...", "...KBBDDDKKKKKKBBBDDKK..", "..KRRRRRRRRRRRRRRRRRRRK.", "..KRRRRRRRRRRRRRRRRRRRK.", "...KKKKKKKKKKKKKKKKKKK.."]}, "hkc_champignon": {"pal": {"K": "#0b0d12", "C": "#e07a3c", "D": "#9c4422", "P": "#ffd2a8", "T": "#e8e2d0", "S": "#a9a290"}, "rows": ["........................", "........................", ".......KKKKKKKKKK.......", ".....KKCCCCPPCCCCKK.....", "....KCCCCCCPPCCCCCCK....", "...KCCPPCCCCCCCCCCCCK...", "..KCCCPPCCCCCCCPPCCCCK..", "..KCCCCCCCCCCCCPPCCCCK..", "..KCCCCCPPCCCCCCCCCCCK..", "..KCCCCCPPCCCCCCCCCCCK..", "..KDDDDDDDDDDDDDDDDDDK..", "..KDDDDDDDDDDDDDDDDDDK..", "...KKKKKKKTTTSSKKKKKK...", ".........KTTTSSK........", ".........KTTTSSK........", ".........KTTTSSK........", ".........KTTTSSK........", ".........KTTTSSK........", ".........KTTTSSK........", ".........KTTTSSK........", "........KKTTTSSKK.......", ".......KSSSSSSSSSK......", ".......KSSSSSSSSSK......", "........KKKKKKKKK......."]}, "hkc_coquille": {"pal": {"K": "#0b0d12", "B": "#d9c9a4", "D": "#8a7350", "L": "#f4ead2", "W": "#ffffff", "P": "#5a5f6e"}, "rows": ["........................", "........................", ".........KKKKKK.........", ".......KKBBBBBBKK.......", ".....KKBBBBBBBBBBKK.....", "....KBBBBBDDDBBBBBBK....", "...KBBBLDDLBBDDBBBBBK...", "...KBBLDWLLLBBBDBBBBK...", "..KBBBDLLLDDDBBBDBBBBK..", "..KBBDBLDDLBBDDBBDBBBK..", "..KBBDBBDBBBBBDBBDBBBK..", "..KBBDBDBBDDDBDBBDBBBK..", "..KBBDBDBBDBBBDBBDBBDK..", "..KBBDBDDBDDBDDBBDBDBK..", "..KBBDBBDBBBDBBBDBBDBK..", "..KBBDBBDDBBBBBDBBBDBK..", "...KBBDBBBDDDDDBBBDBK...", "...KBBBDBBBBBBBBBDBBK...", "....KBBBDDBBBBBDDBBKK...", "...KPPPPPPPPPPPPPPPPPK..", "...KPPPPPPPPPPPPPPPPPK..", "....KKKKKKKKKKKKKKKKK...", "........................", "........................"]}, "hkc_epines": {"pal": {"K": "#0b0d12", "V": "#3e5a47", "D": "#2a3c31", "P": "#c9d8c4"}, "rows": [".....................KK.", "....................KVVK", "...................KVVVK", "..................KVPPK.", "................KKVVVK..", ".......K.......KPPVVK...", ".KKKK.KPK......KVVVK....", "KDDDDKKPKK....KVVVK.....", "KDDDDDDPPPKKKKVVVK......", ".KKKDDDDPPVVVVVVK.......", "....KKKDPPVVVVPK........", "...K.KVDDDVVVKPK........", "..KPKVVVDDDKKKPK........", "...KPVVVKDDK..K.........", "..KVVVKKKDDDK...........", "..KVVK.KPPPDDKK.........", ".KVVVK..KKKDDDDKK.......", "KVVVK......KKDDDDKKK....", "KVVK.........KDPDDDDKK..", "VVVK..........KPDDDDDDK.", "VVK...........KPKKKDDDK.", "KK.............K...KKK..", "........................", "........................"]}, "hkc_cle": {"pal": {"K": "#0b0d12", "B": "#b8c4d6", "L": "#eef3fa"}, "rows": ["........................", "........................", ".....KKKK...............", "...KKLLLLKK.............", "..KLLLLLBBBK............", "..KLLLLBBBBK............", ".KLLLKKKKBBBK...........", ".KLLLK..KBBBK...........", ".KLLBK..KBBBK...........", ".KLBBKKKKBBBK...........", "..KBBBBBBBBBK...........", "..KBBBBBBBBBBK..........", "...KKBBBBKKBBBK.........", ".....KKKK..KBBBK........", "............KBBBK.......", ".............KBBBK......", "..............KBBBK.....", "..............KBBBBK....", ".............KBBBBBBK...", "............KBBBKKBBBK..", "............KBBK.KBBBK..", ".............KK.KBBBK...", "...............KBBBK....", "...............KBBK....."]}, "hkc_fiole": {"pal": {"K": "#0b0d12", "C": "#8a6a4a", "V": "#cfe3ec", "B": "#3aa7e8", "D": "#1f6db0", "L": "#9fdcff", "W": "#ffffff"}, "rows": ["........................", "..........KKKKK.........", ".........KCCCCCK........", ".........KCCCCCK........", ".........KVVVVVK........", ".........KVVVVVK........", ".........KVVVVVK........", ".........KVVVVVK........", "........KVVVVVVK........", ".......KVVVVVVVVK.......", "......KVVVVVVVVVVK......", ".....KVVWWWVVVVVVVK.....", "....KVVBWWWBBBBDDVVK....", "....KVBBBBBBBBBDDDVK....", "....KVBBBBBBBBBDDDVK....", "....KVBBBBBBBBBDDDVK....", "....KVBBBBBBBBBDDDVK....", "....KVVBBBBBBBWDDVVK....", ".....KVBBBLBBBBDDVK.....", "......KVBBBBBBBDVK......", ".......KVVBBBBVVK.......", "........KVVVVVVK........", ".........KKKKKK.........", "........................"]}, "hkc_cocon": {"pal": {"K": "#0b0d12", "F": "#59617a", "C": "#3a4058", "D": "#2a2f42", "B": "#4fc3ff", "W": "#d8f3ff"}, "rows": ["..........KFFK..........", "..........KFFK..........", "..........KFFK..........", "..........KFFK..........", "........KKDDCCKK........", ".......KCDDCCCCCK.......", "......KCDDCCCCBBDK......", ".....KCDDCCCCBWBBCK.....", ".....KDDCBBCCBBBBCK.....", ".....KDCBWBBDDBBCCK.....", "....KDCCBBBBDCCCCCDK....", "....KCCCCBBDCBBCCDDK....", "....KCCCCDDCBWBBDDCK....", "....KCCCDDCCBBBBDCCK....", "....KCCDDCBBCBBDCCCK....", "....KCDDCBWBBDDCCCCK....", ".....KDCCBBBBDCCCCK.....", ".....KCCCCBBBBCCCCK.....", ".....KCCCCDBWBBCCDK.....", "......KCCDDBBBBCDK......", ".......KDDCCBBCDK.......", "........KKCCCCKK........", "..........KKKK..........", "........................"]}, "hkc_luciole": {"pal": {"K": "#0b0d12", "G": "#1d3a46", "H": "#2c5e6c", "A": "#d8f0f6", "J": "#f2fdff", "M": "#2f3646", "W": "#ffffff"}, "rows": ["........................", ".........KKKKKK.........", ".......KKGGGGGGKK.......", ".....KKGGGGGGGGGGKK.....", "....KGGGGGGGGGGGGGGK....", "...KGGGGHMHHHHMHGGGGK...", "...KGGGHHMMHHMMHHGGGK...", "..KGGGAAAHMHHMHAAAGGGK..", "..KGAAAAAAMMMMAAAAAAGK..", ".KGGAAAAAAMMMMAAAAAAGGK.", ".KGGAAAAAAMMMMAAAAAAGGK.", ".KGGGHAAAHHJJHHAAAHGGGK.", ".KGGGHAAAAJJJJAAAAHGGGK.", ".KGGGAAAAAJJJJAAAAAGGGK.", ".KGGGAAAAAJJJJAAAAAGGGK.", "..KGGHAAAAJWJJAAAAHGGK..", "..KGGGHHHHJJWJHHHHGGGK..", "...KGGGHHHJJJJHHHGGGK...", "...KGGGGHHHJJHHHGGGGK...", "....KGGGGGGGGGGGGGGK....", ".....KKGGGGGGGGGGKK.....", ".......KKGGGGGGKK.......", ".........KKKKKK.........", "........................"]}, "hkc_scarabee": {"pal": {"K": "#0b0d12", "M": "#2f3646", "C": "#5a6a8a", "L": "#9fb0cc"}, "rows": ["........................", "........K......K........", ".......KMK....KMK.......", ".......KMMKKKKMMK.......", "........KMKMMKMK........", "........KMMMMMMK........", ".......KMMMMMMMMK.......", "...KK..KMMMMMMMMK..KK...", "..KMMK..KCCCCCCK..KMMK..", "...KMMKKCCCMMCCCKKMMK...", "....KMMCLLLMMCCCCMMK....", ".....KKCLLLMMCCCCKK.....", ".....KCCLLLMMCCCCCK.....", "..KKKKCCLLLMMCCCCCKKKK..", ".KMMMMCCLLLMMCCCCCMMMMK.", ".KMMMMCCCCCMMCCCCCMMMMK.", "..KKKKCCCCCMMCCCCCKKKK..", ".....KCCCCCMMCCCCCK.....", ".....KMCCCCMMCCCCMK.....", "....KMMCCCCMMCCCCMMK....", "...KMMKKCCCMMCCCKKMMK...", "....KK..KCCMMCCK..KK....", ".........KKKKKK.........", "........................"]}, "hkc_parchemin": {"pal": {"K": "#0b0d12", "P": "#e8dcbc", "R": "#c9b88e", "D": "#8a7a58", "T": "#5c6478", "X": "#b0303a"}, "rows": ["........................", "........................", "........................", "........................", "...KKKKKKKKKKKKKKKKKK...", "..KRRPPPPPPPPPPPPPPRRK..", "..KDDPPPPPPPPPPPPPPDDK..", ".KRDDRPPPPPPTTPPPPRDDRK.", ".KRDDRPTTPPPTTPXPXRDDRK.", ".KRDDRPPPTTPTTPPXPRDDRK.", ".KRDDRPPPPTTPPPPTPRDDRK.", ".KRDDRPPPPTTPPPPTPRDDRK.", ".KRDDRPPPPTTPPPPTPRDDRK.", ".KRDDRPPPPTTPPPPTPRDDRK.", ".KRDDRPPPPPTTTTTTPRDDRK.", ".KRDDRPPPPPPPPPPPPRDDRK.", "..KDDPPPPPPPPPPPPPPDDK..", "..KRRPPPPPPPPPPPPPPRRK..", "...KPPPPPPPPPPPPPPPPK...", "....KKKKKKKKKKKKKKKK....", "........................", "........................", "........................", "........................"]}, "hkc_cloche": {"pal": {"K": "#0b0d12", "M": "#3a4256", "B": "#a9b6c9", "L": "#e1e8f2", "D": "#6b7890"}, "rows": ["...........KKK..........", "..........KMMMK.........", "..........KMMMK.........", "........KKKMMMKK........", ".......KBBBBBBBBK.......", ".......KBBBBBBBBK.......", ".......KLLBBBBBBK.......", "......KBLLBBBBBBBK......", "......KBLLBBBBBBBK......", "......KLLLBBBBBBBK......", "......KLLBBBBBBBBK......", "......KLLBBBBBBBBK......", ".....KBLLBBBBBBBBBK.....", ".....KBLLBBBBBBBBBK.....", ".....KLLLBBBBBBBBBK.....", "....KBLLBBBBBBBBBBBK....", "...KBBLBBBBBBBBBBBBBK...", "..KBBBBBBBBBBBBBBBBBBK..", "..KDDDDDDDDDDDDDDDDDDDK.", "..KDDDDDDDDMMDDDDDDDDDK.", "...KKKKKKKMMMMKKKKKKKK..", "..........KMMK..........", "...........KK...........", "........................"]}, "hkc_amulette": {"pal": {"K": "#0b0d12", "C": "#59617a", "O": "#8590a8", "B": "#2a3045", "P": "#7a5cc9", "L": "#c9b6ff"}, "rows": ["...........KK...........", "..........KCCK..........", ".........KCCCCK.........", "........KCCKKCCK........", "........KCCKKCCK........", "........KKCCCCKK........", ".......KOOOCOOOOK.......", "......KOOBBBBBBOOK......", ".....KCOBBBBBBBBOCK.....", "....KOOBBBBPPBBBBOOK....", "...KOOBBBBPPPPBBBBOOK...", "...KOBBBBPPLLPPBBBBOK...", "...KOBBBPPLLLLPPBBBOK...", "...KOBBPPLLLLLLPPBBOK...", "...KCBBPPLLLLLLPPBBCK...", "...KOBBBPPLLLLPPBBBOK...", "...KOBBBBPPLLPPBBBBOK...", "...KOOBBBBPPPPBBBBOOK...", "....KOOBBBBPPBBBBOOK....", ".....KCOBBBBBBBBOCK.....", "......KOOBBBBBBOOK......", ".......KOOOOCOOOK.......", "........KKKKKKKK........", "........................"]}, "hkc_bulle_cri": {"pal": {"K": "#0b0d12", "R": "#ff4d6d", "S": "#ff9fb2", "W": "#ffffff"}, "rows": ["...........KK...........", "..........KRRK..........", ".....K....KRRK....K.....", "....KRKK.KRRRRK.KKRK....", "....KRRRKKRSSRKKRRRK....", "....KRRRRRRSSRRRRRRK....", "....KRRSSRSSSSRSSRRK....", "....KRRSSSWWWWSSSRRK....", "..KKKRRSWWWWWWWWSRRKKK..", ".KRRRRWWWWWWWWWWWWRRRRK.", "KRRRSSWWWKWKWKWWWWSSRRRK", ".KRRRSWWWKWKWKWWWWSRRRK.", "..KKRRWWWKWKWKWWWWRRKK..", "...KRRWWWWWWWWWWWWRRK...", "...KRRWWWKWKWKWWWWRRK...", "..KRRSSSWWWWWWWWSSSRRK..", "..KRRRRRRSWWWWSRRRRRRK..", ".KRRRRRRRSSSSSSRRRRRRRK.", "..KKKKKRRSSRRSSRRKKKKK..", "......KRRSRRRRSRRK......", ".......KRRRKKRRRK.......", ".......KRRK..KRRK.......", ".......KRK....KRK.......", "........K......K........"]}, "hkc_bulle_question": {"pal": {"K": "#0b0d12", "H": "#22324a", "W": "#f4f8ff", "B": "#3a6fd8"}, "rows": ["......KKKHHHHHHKKK......", ".....KHHHHHHHHHHHHK.....", "....KHHHHHHHHHHHHHHK....", "...KHHHHWWWWWWWWHHHHK...", "..KHHHWWWWWWWWWWWWHHHK..", ".KHHHWWWWWWWWWWWWWWHHHK.", ".KHHWWWWWWWWWWWWWWWWHHK.", ".KHWWWWWWWWWWWWWWWWWWHK.", "KHHWWBBBWBBBWBBBWWWWWHHK", "KHHWWWWBWWWBWWWBWWWWWHHK", "KHHWWWBBWWBBWWBBWWWWWHHK", "KHHWWWWWWWWWWWWWWWWWWHHK", "KHHWWWBWWWBWWWBWWWWWWHHK", "KHHHWWWWWWWWWWWWWWWWHHHK", ".KHHHWWWWWWWWWWWWWWHHHK.", ".KHHHHWWWWWWWWWWWWHHHHK.", ".KHHHHWWWWWWWWWWHHHHHHK.", "..KHHHWWWHHHHHHHHHHHHK..", "...KHHWWHHHHHHHHHHHHK...", "....KWWHHHHHHHHHHHHK....", "....KWHHHHHHHHHHHHK.....", ".....KKKKHHHHHHKKK......", ".........KKKKKK.........", "........................"]}, "hkc_coeur_bulle": {"pal": {"K": "#0b0d12", "H": "#4a2236", "W": "#fff4f7", "R": "#ff5c8a", "P": "#ffc2d4"}, "rows": ["......KKKHHHHHHKKK......", ".....KHHHHHHHHHHHHK.....", "....KHHHHHHHHHHHHHHK....", "...KHHHWWWWWWWWWWHHHK...", "..KHHHWWWWWWWWWWWWHHHK..", ".KHHWWWWWRRWWRRWWWWWHHK.", ".KHHWWWRRRRRRRRRRWWWHHK.", ".KHWWWWRRRRRRRRRRWWWWHK.", "KHHWWWWRRRPRRRRRRWWWWHHK", "KHHWWWWRRPRRRRRRRWWWWHHK", "KHHWWWWRRRRRRRRRRWWWWHHK", "KHHWWWWWRRRRRRRRWWWWWHHK", "KHHWWWWWWRRRRRRWWWWWWHHK", "KHHHWWWWWWRRRRWWWWWWHHHK", ".KHHWWWWWWWWWWWWWWWWHHK.", ".KHHHHWWWWWWWWWWWWHHHHK.", ".KHHHHHWWWWWWWWWWHHHHHK.", "..KHHHHHHHHHHHHWWWHHHK..", "...KHHHHHHHHHHHHWWHHK...", "....KHHHHHHHHHHHHWHK....", ".....KHHHHHHHHHHHHWK....", "......KKKHHHHHHKKKK.....", ".........KKKKKK.........", "........................"]}, "hkc_lanterne_halo": {"pal": {"K": "#0b0d12", "M": "#2f3646", "V": "#9fd8e6", "J": "#e8fbff", "W": "#ffffff", "G": "#16303a", "H": "#24515e", "I": "#3a8094"}, "rows": ["...KGGGGGHHHHHHGGGGGK...", "..KGGGGHHHHHHHHHHGGGGK..", "..KGGGHHHMMMMMMMHHGGGK..", ".KGGGHHHMMMMMMMMMHHGGGK.", "KGGGHHHIMVVVVVVVMHHHGGGK", "KGGGHHHIMVVVVVVVMHHHGGGK", "KGGHHHIIMVJJJJJVMIHHHGGK", "KGGHHHIIMVJWWWJVMIHHHGGK", "KGGHHHIIMVJWWWJVMIHHHGGK", "KGGHHHIIMVJWWWJVMIHHHGGK", "KGGHHHIIMVJJJJJVMIHHHGGK", "KGGHHHIIMVJJJJJVMIHHHGGK", "KGGGHHHIMVVVVVVVMHHHGGGK", "KGGGHHHIMVVVVVVVMHHHGGGK", ".KGGGHHHMMMMMMMMMHHGGGK.", "..KGGGHHHHHMMMHHHHGGGK..", "..KGGGGHHHHMMMHHHGGGGK..", "...KGGGGGHHMMMHGGGGGK...", "....KKGGGGGMMMGGGGKK....", "......KGGGGMMMGGGK......", ".......KKKKMMMKKK.......", ".........KKMMMKK........", "........KMMMMMMMK.......", "........KMMMMMMMK......."]}, "hkc_cristal_rose": {"pal": {"K": "#0b0d12", "P": "#ff7ac8", "L": "#ffc4ea", "D": "#b03a8a", "W": "#ffffff", "R": "#3a3f4c", "H": "#3a1f36"}, "rows": [".......KKKKKKKKKK.......", "......KHHHHHHHHHHK......", "....KKHHHHHLPHHHHHKK....", "...KHHHHHHHLPHHHHHHHK...", "..KHHHHHHHLLPPHHHHHHHK..", "..KHHHHHHWWLPPPHHHHHHK..", ".KHHHHHHHWWLPPPHHHHHHHK.", "KHHHHHHHLWWLPPPPHHPDHHHK", "KHHHPDHHLWWLPPPPHPPDHHHK", "KHHHPDDHLWWLPPPPPPPDHHHK", "KHHPPDDDLWWLPPPPPPPDDHHK", "KHHPPDDDLWWLPPPPPPPDDHHK", "KHPPPDDDLLLLPPPPPPPDDDHK", "KHPPPDDDLLLLPPPPPPPDDDHK", "KHPPPDDDDLLLPPPPPPPDDDHK", "KHHPPDDDDLLLPPPPPPPDDHHK", "KHHPPDDDDLLLPPPPPPPDDHHK", ".KHPPDDDDLLLPPPPPPPDDHK.", "..KPPDDDDLLLPPPPPPPDDK..", "..KHPDDDDLLLPPPPPPPDHK..", "..KKPDDDDHHHHHHPPPPDKKK.", ".KRRRRRRRRRRRRRRRRRRRRRK", ".KRRRRRRRRRRRRRRRRRRRRRK", "..KKKKKKKKKKKKKKKKKKKKK."]}, "hkc_fleur": {"pal": {"K": "#0b0d12", "H": "#26304a", "P": "#f2f4fb", "C": "#b9c6e6", "W": "#ffffff", "T": "#7a8aa8", "F": "#9aa8c4"}, "rows": [".....KHHHHHHHHHHHHK.....", "....KHHHHHHHHHHHHHHK....", "...KHHHHHHHHHHHHHHHHK...", "..KHHHHHHHHHHHHHHHHHHK..", ".KHHHHHHHHPPPPHHHHHHHHK.", ".KHHHHHHHHPPPPHHHHHHHHK.", ".KHHHHHHPHPPPPHPHHHHHHK.", "KHHHHHPPPPHPPHPPPPHHHHHK", "KHHHHHPPPPPCCPPPPPHHHHHK", "KHHHHHPPPPCWCCPPPPHHHHHK", "KHHHHHHPPHCCCCHPPHHHHHHK", "KHHHHHHHHPPCCPPHHHHHHHHK", "KHHHHHHPPPPHHPPPPHHHHHHK", ".KHHHHHPPPPHHPPPPHHHHHK.", ".KHHHHHHPPPHHPPPHHHHHHK.", ".KHHHHHHHHHTTHHHHHHHHHK.", "..KHHHHHHHHTTHHHHHHHHK..", "...KHHHHHHHTTHHHHHHHK...", "....KHFFFFFTTHHHHHHK....", ".....KFFFFFTTHHHHHK.....", "......KKKHHTTFFFFFK.....", ".........KKTTFFFFFK.....", "..........KTTKKKKK......", "...........KK..........."]}}, "autocollants": [["etoile", "Étoile", 150, "Étoiles et ciel"], ["etoiles", "Constellation", 300, "Étoiles et ciel"], ["soleil", "Soleil", 250, "Étoiles et ciel"], ["lune", "Lune", 250, "Étoiles et ciel"], ["nuage", "Nuage", 200, "Étoiles et ciel"], ["eclair", "Éclair", 300, "Étoiles et ciel"], ["arcenciel", "Arc-en-ciel", 600, "Étoiles et ciel"], ["coeur", "Cœur", 150, "Cœurs et fleurs"], ["coeurs", "Deux cœurs", 300, "Cœurs et fleurs"], ["fleur", "Fleur", 300, "Cœurs et fleurs"], ["sourire", "Sourire", 200, "Cœurs et fleurs"], ["chat", "Chat", 800, "Animaux"], ["chien", "Chien", 800, "Animaux"], ["renard", "Renard", 1000, "Animaux"], ["hibou", "Hibou", 1000, "Animaux"], ["grenouille", "Grenouille", 900, "Animaux"], ["poisson", "Poisson", 700, "Animaux"], ["papillon", "Papillon", 900, "Animaux"], ["champignon", "Champignon", 500, "Objets"], ["gateau", "Gâteau", 600, "Objets"], ["pouce", "Bravo", 400, "Objets"], ["fusee", "Fusée", 1500, "Objets"], ["trophee", "Trophée", 2500, "Objets"], ["cristal", "Cristal", 5000, "Objets"], ["couronne", "Couronne", 10000, "Objets"], ["hkc_banc", "Banc", 400, "Hollow Knight"], ["hkc_epines", "Épines", 400, "Hollow Knight"], ["hkc_champignon", "Champignon", 450, "Hollow Knight"], ["hkc_lanterne", "Lanterne", 500, "Hollow Knight"], ["hkc_coquille", "Coquille", 500, "Hollow Knight"], ["hkc_cristal", "Cristal bleu", 600, "Hollow Knight"], ["hkc_parchemin", "Carte", 650, "Hollow Knight"], ["hkc_cle", "Clé", 700, "Hollow Knight"], ["hkc_scarabee", "Scarabée", 750, "Hollow Knight"], ["hkc_fiole", "Fiole", 800, "Hollow Knight"], ["hkc_cloche", "Cloche", 850, "Hollow Knight"], ["hkc_luciole", "Luciole", 900, "Hollow Knight"], ["hkc_cocon", "Cocon", 1000, "Hollow Knight"], ["hkc_amulette", "Amulette", 1500, "Hollow Knight"], ["hkc_bulle_cri", "Cri !!!", 3000, "Hollow Knight · rares"], ["hkc_bulle_question", "Bulle ???", 3000, "Hollow Knight · rares"], ["hkc_coeur_bulle", "Merci", 4000, "Hollow Knight · rares"], ["hkc_lanterne_halo", "Lanterne lumineuse", 5000, "Hollow Knight · rares"], ["hkc_cristal_rose", "Cristal rose", 6500, "Hollow Knight · rares"], ["hkc_fleur", "Fleur délicate", 8000, "Hollow Knight · rares"]], "geos": {"depart": 500, "plafond": 50000, "mise_min": 10, "mise_max": 10000, "mises": [10, 50, 100, 500, 1000, 5000, 10000], "max_visibles": 3, "delai": [9, 22], "duree": 45, "valeur": [8, 40], "gros": [80, 160], "p_gros": 0.08, "echeance": 10, "ajouts": [50, 100, 500, 1000, 5000], "delai_jeux": [4, 10], "delai_autres": [30, 75], "max_visibles_jeux": 4}, "jeux": [["roulette", "Roulette", "Couleur ×2 · douzaine ×3 · numéro ×36"], ["machine", "Machine à sous", "Trois pareils jusqu'à ×100 · deux cerises ×3"], ["pile", "Pile ou face", "Bonne face : ×1,9"], ["des", "Dés", "Plus haut ou plus bas que 7 : ×2,28 · sept : ×5,7"], ["blackjack", "Blackjack", "Victoire ×2 · blackjack ×2,5 · égalité : mise rendue"], ["grattage", "Grattage", "Trois symboles pareils : jusqu'à ×50"], ["roue", "Roue de la fortune", "Douze cases, de ×0 à ×5"], ["plinko", "Plinko", "La bille rebondit : jusqu'à ×29"], ["keno", "Keno", "Choisis 1 à 5 numéros sur 40 : jusqu'à ×300"], ["course", "Course de chevaux", "Six chevaux, cote de ×3,1 à ×15,8"], ["tirbut", "Tir au but", "Trompe le gardien : ×1,45"], ["mines", "Mines", "Évite les mines, encaisse quand tu veux"], ["fusee", "Fusée", "Choisis où descendre : ×1,5 à ×10"], ["hilo", "Plus haut, plus bas", "Devine la carte suivante"], ["baccara", "Baccara", "Joueur ou banquier ×1,95 · égalité ×8"], ["sicbo", "Grand ou petit", "Trois dés : ×1,95 · triple ×30"], ["poker", "Poker express", "Cinq cartes : paire de valets ×2 à quinte royale ×1000"], ["bataille", "Bataille", "Carte la plus forte : ×1,95"], ["ppc", "Pierre, papier, ciseaux", "Victoire ×1,9 · égalité : mise rendue"], ["coffres", "Trois coffres", "Un coffre ×2,5, un ×0,4, un vide"], ["mystere", "Chiffre mystère", "Trouve le nombre de 1 à 10 : ×9,5"], ["flechettes", "Fléchettes", "Vise le centre : jusqu'à ×12"], ["craps", "Craps", "Ligne de passe : ×2"], ["seuil", "Sous le seuil", "Dé de 1 à 100 : plus le seuil est bas, plus ça paie"], ["tour", "La tour", "Une porte piégée sur trois à chaque étage"], ["couleur", "Couleur de la carte", "Rouge ou noir ×1,95 · enseigne ×3,8"]], "pile": 1.9, "des": {"bas": 2.28, "sept": 5.7, "haut": 2.28}, "rouges": [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], "roulette": {"couleur": 2, "douzaine": 3, "numero": 36}, "rouleaux": [["cerise", 7], ["citron", 6], ["raisin", 5], ["cloche", 3], ["etoile", 2], ["sept", 1]], "machine": {"sept": 100, "etoile": 50, "cloche": 20, "raisin": 12, "citron": 8, "cerise": 4}, "cerises": {"2": 3}, "grattage": [[50, 0.002, "couronne"], [10, 0.01, "trophee"], [5, 0.04, "cristal"], [3, 0.05, "etoile"], [2, 0.1, "coeur"], [1, 0.2, "champignon"]], "grattage_autres": ["lune", "nuage", "fusee", "fleur"], "bj": {"blackjack": 2.5, "gagne": 2, "egalite": 1}, "effets": {"hkc_bulle_cri": "pulse", "hkc_bulle_question": "scintille", "hkc_coeur_bulle": "pulse", "hkc_lanterne_halo": "brille", "hkc_cristal_rose": "scintille", "hkc_fleur": "brille"}, "piece_mix": {"O": ["#000000", 0.62], "D": ["#000000", 0.28], "A": ["", 0], "L": ["#ffffff", 0.45], "W": ["#ffffff", 0.85]}, "jeux_ico": {"roulette": "cristal", "machine": "sept", "pile": "PIECE", "des": "sourire", "blackjack": "couronne", "grattage": "trophee", "roue": "soleil", "plinko": "hkc_luciole", "keno": "etoiles", "course": "renard", "tirbut": "pouce", "mines": "hkc_epines", "fusee": "fusee", "hilo": "hkc_parchemin", "baccara": "coeurs", "sicbo": "hkc_amulette", "poker": "couronne", "bataille": "eclair", "ppc": "nuage", "coffres": "hkc_cle", "mystere": "hkc_bulle_question", "flechettes": "hkc_cristal", "craps": "raisin", "seuil": "lune", "tour": "hkc_lanterne", "couleur": "coeur"}, "roue": [0, 1.5, 0, 0.5, 2, 0, 1.2, 0.5, 0, 1, 0, 5], "plinko": {"rangs": 8, "risques": {"bas": [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6], "moyen": [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13], "haut": [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29]}}, "keno": {"total": 40, "tires": 10, "gains": {"1": {"1": 3.8}, "2": {"1": 1, "2": 9.5}, "3": {"2": 4, "3": 32}, "4": {"2": 1.8, "3": 10, "4": 70}, "5": {"2": 1, "3": 3.6, "4": 25, "5": 300}}}, "course": [["Éclair", 0.3, 3.1], ["Tonnerre", 0.22, 4.3], ["Comète", 0.18, 5.2], ["Brume", 0.14, 6.7], ["Lueur", 0.1, 9.5], ["Ombre", 0.06, 15.8]], "tirbut": 1.45, "mines": {"cases": 25, "choix": [3, 5, 10], "marge": 0.97}, "fusee": {"cibles": [1.5, 2, 3, 5, 10], "marge": 0.96, "max": 1000}, "hilo": {"marge": 0.95}, "baccara": {"joueur": 1.95, "banquier": 1.95, "egalite": 8, "rendu_egalite": 1}, "sicbo": {"petit": 1.95, "grand": 1.95, "triple": 30}, "poker": {"royale": 1000, "quinte_flush": 300, "carre": 100, "full": 40, "couleur": 25, "quinte": 20, "brelan": 10, "deux_paires": 5.5, "paire_valets": 2}, "bataille": 1.95, "ppc": 1.9, "coffres": [2.5, 0.4, 0], "mystere": 9.5, "flechettes": [["Centre", 0.02, 12], ["Anneau 1", 0.1, 3], ["Anneau 2", 0.2, 1.5], ["Anneau 3", 0.3, 0.3], ["Raté", 0.38, 0]], "craps": 2, "seuil": {"seuils": [5, 10, 25, 50, 75, 90], "marge": 97}, "tour": {"etages": 8, "portes": 3, "marge": 0.97}, "couleur": {"couleur": 1.95, "enseigne": 3.8}};
/* </JX> */
Object.assign(SPRITES, JX.sprites);
const GJ = JX.geos;
ICONES.jeux = [["r", 4, 4, 20, 20, 4], ["d", 8.6, 8.6, 1.5], ["d", 15.4, 8.6, 1.5], ["d", 12, 12, 1.5], ["d", 8.6, 15.4, 1.5], ["d", 15.4, 15.4, 1.5]];
const AC_TAILLE = 90;              // taille d'un autocollant sur une page de cahier (unités de page : 1000 = largeur)
const AC_TAILLE_TEXTE = 56;        // sur une note texte (pixels, × taille du texte)

function fmtGeos(n) { return String(Math.max(0, Math.floor(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
/* version courte pour la barre de navigation : 9 999, puis 12,3k, puis 1,2M */
function fmtGeosCourt(n) {
  n = Math.max(0, Math.floor(Number(n) || 0));
  if (n < 10000) return fmtGeos(n);
  if (n < 1e6) return (Math.floor(n / 100) / 10).toString().replace(".", ",") + "k";
  return (Math.floor(n / 1e5) / 10).toString().replace(".", ",") + "M";
}
function fmtMult(x) { return "×" + String(x).replace(".", ","); }
function alea(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
function aleaReel() { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
function imgSprite(nom, k = 3, classe = "") { return el("img.ico-pixel" + classe, {src: spriteURL(nom, k), alt: "", draggable: "false"}); }
/* ---------- monnaie : géo (thème Hollow Knight) ou pièce aux couleurs du thème (autres thèmes) ; les données restent les mêmes */
function monnaieHK() { return T.DECOR === "hollow"; }
function M(f) { const hk = monnaieHK(); return {p: hk ? "géos" : "pièces", s: hk ? "géo" : "pièce", P: hk ? "Géos" : "Pièces", S: hk ? "Géo" : "Pièce"}[f]; }
function melangeHex(a, b, t) {          // même calcul que sur le PC
  const c = (h) => [1, 3, 5].map(i => parseInt(String(h).slice(i, i + 2), 16));
  const x = c(a), y = c(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
function spriteGeo() {
  if (monnaieHK()) return "geo_hk";
  const acc = /^#[0-9a-f]{6}$/i.test(T.ACCENT || "") ? T.ACCENT.toLowerCase() : "#5b9bff";
  const nom = "piece_" + acc.slice(1);
  if (!SPRITES[nom]) {
    const pal = {};
    for (const [k, [cible, t]] of Object.entries(JX.piece_mix)) pal[k] = cible ? melangeHex(acc, cible, t) : acc;
    SPRITES[nom] = {pal, rows: JX.sprites.piece.rows};
  }
  return nom;
}
function imgGeo(k = 2, classe = "") { const i = imgSprite(spriteGeo(), k, ".geo-ico" + classe); i.dataset.k = String(k); return i; }
function nomAutocollant(s) { const a = JX.autocollants.find(x => x[0] === s); return a ? a[1] : s; }
function animationsJeux(app) { return (app || window.app).reglages.jeux_anim !== false && !(typeof Decor !== "undefined" && Decor.reduit); }
function regEco(cle) { const a = window.app; return !!(a && a.reglages && a.reglages[cle] === true); }

/* ---------- comptes : un compteur par appareil (section gx_<appareil>), que seul cet appareil modifie */
const Geos = {
  id(app) { return String(app.sync.cfg.appareil || "ipad"); },
  compte(app) {
    const d = app.donnees;
    if (!d.geos || typeof d.geos !== "object" || Array.isArray(d.geos)) d.geos = {};
    const id = this.id(app);
    return (d.geos[id] = normaliserCompteGeo(d.geos[id]));
  },
  solde(d) {
    let s = GJ.depart;                                   // bonus de bienvenue, compté une seule fois
    for (const e of Object.values((d && d.geos) || {})) if (e && typeof e === "object") s += entierPositif(e.g) - entierPositif(e.d);
    return Math.max(0, s);
  },
  jour() { return iso(new Date()); },
  /* géos ramassés aujourd'hui, tous appareils confondus (remis à zéro à minuit, heure locale) */
  ramasses(d) {
    const j = this.jour(); let s = 0;
    for (const e of Object.values((d && d.geos) || {})) if (e && e.j === j) s += entierPositif(e.r);
    return s;
  },
  plafondAtteint(d) { return this.ramasses(d) >= GJ.plafond; },
  /* ajoute des géos ; « ramasse » : compte dans le plafond du jour. Renvoie ce qui a vraiment été ajouté. */
  gagner(app, n, ramasse) {
    n = entierPositif(n);
    if (!n || !app.donnees) return 0;
    if (ramasse) {
      n = Math.min(n, GJ.plafond - this.ramasses(app.donnees));
      if (n <= 0) return 0;
    }
    const e = this.compte(app);
    if (ramasse) { const j = this.jour(); if (e.j !== j) { e.j = j; e.r = 0; } e.r += n; }
    e.g += n;
    app.sauver();
    this.maj(app);
    return n;
  },
  /* retire une mise ou un achat ; refusé si le solde ne suffit pas (le solde ne devient jamais négatif) */
  depenser(app, n) {
    n = entierPositif(n);
    if (!n || !app.donnees || n > this.solde(app.donnees)) return false;
    this.compte(app).d += n;
    app.sauver();
    this.maj(app);
    return true;
  },
  achats(d) {
    const out = {};
    for (const e of Object.values((d && d.geos) || {})) for (const [k, v] of Object.entries((e && e.a) || {})) out[k] = (out[k] || 0) + entierPositif(v);
    return out;
  },
  colles(d) {
    const out = {};
    for (const n of (d && d.notes) || []) for (const a of autocollantsNote(n)) out[a.s] = (out[a.s] || 0) + 1;
    return out;
  },
  /* inventaire = autocollants achetés (tous appareils) − autocollants collés sur des notes */
  inventaire(d) {
    const a = this.achats(d), c = this.colles(d), out = {};
    for (const [k, v] of Object.entries(a)) out[k] = Math.max(0, v - (c[k] || 0));
    return out;
  },
  acheter(app, s) {
    const art = JX.autocollants.find(x => x[0] === s);
    if (!art || !this.depenser(app, art[2])) return false;
    const e = this.compte(app);
    e.a[s] = (e.a[s] || 0) + 1;
    app.sauver();
    return true;
  },
  /* met à jour tous les compteurs affichés */
  maj(app) {
    if (!app || !app.donnees) return;
    const t = fmtGeos(this.solde(app.donnees));
    document.querySelectorAll(".geos-solde").forEach(x => { x.textContent = t; });
    const c = fmtGeosCourt(this.solde(app.donnees));
    document.querySelectorAll(".geos-court").forEach(x => { x.textContent = c; x.parentNode.title = `${t} ${M("p")} : touche pour ouvrir la boutique`; });
    if (app.ecrans && app.ecrans.jeux && app.page === "jeux") app.ecrans.jeux.majEntete();
  },
  /* thème changé : géo ↔ pièce partout (images et libellés) */
  majVisuel(reg) {
    const nom = spriteGeo();
    document.querySelectorAll("img.geo-ico").forEach(i => { i.src = spriteURL(nom, parseInt(i.dataset.k) || 2); });
    document.querySelectorAll(".geos-nom").forEach(x => { x.textContent = M(x.dataset.f || "p"); });
    document.documentElement.classList.toggle("monnaie-piece", !monnaieHK());
    const r = reg || (window.app && window.app.reglages);
    document.documentElement.classList.toggle("jeux-calmes", !!(r && (r.jeux_anim === false || r.reduire_effets === true)));
  },
  /* « un seul envoi par partie » : le compteur n'est envoyé qu'à la fin de la partie */
  enPartie: false,
  debutPartie() { this.enPartie = true; this.t0 = Date.now(); },
  partieEnCours() { if (this.enPartie && Date.now() - (this.t0 || 0) > 600000) this.enPartie = false; return this.enPartie; },     // jamais plus de 10 min
  finPartie(app) { if (!this.enPartie) return; this.enPartie = false; if (app && app.sync) app.sync.localChange(); },
  pulser() {
    if (!animationsJeux()) return;
    document.querySelectorAll(".rail-geos, .geo").forEach(b => { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); });
  },
};

/* ---------- sons des jeux (Web Audio, coupés par le réglage « Son » de Mini-jeux) */
const SonJeux = {
  jouer(genre) {
    const app = window.app;
    if (!app || app.reglages.jeux_son === false || !Son.ctx) return;
    const c = Son.ctx, t0 = c.currentTime;
    const notes = {geo: [[1320, .07], [1760, .1]], gain: [[660, .09], [880, .09], [1100, .09], [1320, .16]], perte: [[300, .12], [220, .2]], tic: [[1400, .025]], achat: [[880, .08], [1320, .12]]}[genre] || [];
    let t = t0;
    for (const [f, d] of notes) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = genre === "perte" ? "square" : "triangle"; o.frequency.value = f;
      const v = genre === "perte" ? .05 : genre === "tic" ? .06 : .14;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
      t += d * .9;
    }
  },
};

/* ---------- géos qui apparaissent dans l'appli (discrets : petits, quelques-uns à la fois, léger scintillement) */
const Apparitions = {
  app: null, liste: [], t: null,
  CIBLES: ".carte, .bloc, .tuile, .feuille, .chip, .doc-texte-ed, .panneau-jour, .ech-ligne, .an-doc, .acc-maint, .jx-tuile",
  demarrer(app) { this.app = app; this.planifier(); },
  planifier() {
    clearTimeout(this.t);
    const [a, b] = this.app && this.app.page === "jeux" ? GJ.delai_jeux : GJ.delai_autres;
    this.t = setTimeout(() => this.essayer(), (a + aleaReel() * (b - a)) * 1000);
  },
  actif() {
    const app = this.app;
    return !!(app && app.interfacePrete && app.donnees && app.reglages.geos_apparition !== false && !document.hidden && !Pile.length && !Geos.plafondAtteint(app.donnees));
  },
  essayer() {
    try {
      this.liste = this.liste.filter(b => b.isConnected);
      if (this.actif() && this.liste.length < (this.app.page === "jeux" ? GJ.max_visibles_jeux : GJ.max_visibles)) this.creer();
    } catch (e) { Stock.journal("apparition d'un géo", e); }
    this.planifier();
  },
  position() {
    const ecran = document.querySelector(".ecran:not([hidden])");
    if (!ecran) return null;
    const W = innerWidth, H = innerHeight, rail = document.querySelector(".rail"), rr = rail ? rail.getBoundingClientRect() : null;
    const zones = [...ecran.querySelectorAll(this.CIBLES)].map(x => x.getBoundingClientRect())
      .filter(r => r.width >= 40 && r.height >= 30 && r.right > 20 && r.bottom > 20 && r.left < W - 20 && r.top < H - 20);
    if (!zones.length) zones.push(ecran.getBoundingClientRect());
    for (let essai = 0; essai < 8; essai++) {
      const r = zones[alea(zones.length)];
      const x0 = Math.max(r.left, 14) + 10, x1 = Math.min(r.right, W - 14) - 10, y0 = Math.max(r.top, 14) + 10, y1 = Math.min(r.bottom, H - 14) - 10;
      if (x1 <= x0 || y1 <= y0) continue;
      const x = x0 + aleaReel() * (x1 - x0), y = y0 + aleaReel() * (y1 - y0);
      if (rr && x > rr.left - 12 && x < rr.right + 12 && y > rr.top - 12 && y < rr.bottom + 12) continue;      // jamais sur la barre de navigation
      if (this.liste.some(b => Math.hypot(b._x - x, b._y - y) < 60)) continue;
      return {x, y};
    }
    return null;
  },
  creer() {
    const p = this.position();
    if (!p) return;
    const gros = aleaReel() < GJ.p_gros, [a, b] = gros ? GJ.gros : GJ.valeur;
    const v = a + alea(b - a + 1);
    const g = el("button.geo-pick" + (gros ? ".gros" : "") + (animationsJeux(this.app) ? "" : ".calme"), {type: "button", title: `${M("S")} : touche pour ramasser`, "aria-label": `Ramasser : ${M("s")}`,
      style: {left: p.x + "px", top: p.y + "px"}}, imgGeo(2));
    g._v = v; g._x = p.x; g._y = p.y;
    g.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); this.ramasser(g); });
    g.addEventListener("click", (e) => e.stopPropagation());
    document.body.append(g);
    this.liste.push(g);
    g._t = setTimeout(() => this.retirer(g, true), GJ.duree * 1000);
  },
  retirer(g, fondu) {
    clearTimeout(g._t);
    this.liste = this.liste.filter(x => x !== g);
    if (!g.isConnected) return;
    if (fondu && animationsJeux(this.app)) { g.classList.add("part"); setTimeout(() => g.remove(), 400); } else g.remove();
  },
  ramasser(g) {
    if (g._pris) return;
    g._pris = true;
    const n = Geos.gagner(this.app, g._v, true);
    this.retirer(g, false);
    if (n > 0) { gainVolant(g._x, g._y, n); SonJeux.jouer("geo"); Geos.pulser(); }
    else Notifs.bulle(`Plafond du jour atteint : retour des ${M("p")} demain.`);
  },
  vider() { for (const g of this.liste.slice()) this.retirer(g, false); },
};
/* « +25 » qui monte et s'efface à l'endroit du géo ramassé */
function gainVolant(x, y, n, classe = "") {
  if (!animationsJeux()) return;
  const b = el("div.geo-volant" + classe, {"aria-hidden": "true", style: {left: x + "px", top: y + "px"}}, imgGeo(2), el("b", {texte: "+" + fmtGeos(n)}));
  document.body.append(b);
  setTimeout(() => b.remove(), 1100);
}

/* ---------- boutique */
function effetAutocollant(s) { return (JX.effets || {})[s] || ""; }
const NOM_EFFET = {brille: "brillance", scintille: "scintillement", pulse: "pulsation"};
/* image d'autocollant ; les rares ont un effet animé (coupé par « Réduire les effets » ou les animations des mini-jeux) */
function imgAutocollant(s, k, classe) {
  const fx = effetAutocollant(s), im = imgSprite(s, k, classe);
  if (!fx) return im;
  const url = spriteURL(s, k);
  return el("span.ac-fx.ac-fx-" + fx, {style: {"--ac-masque": `url("${url}")`}}, im);
}
class Boutique extends Modal {
  constructor(app) {
    super("Boutique", "Achète des autocollants, puis colle-les dans tes notes.", {classe: "large"});
    this.app = app;
    this.carte.classList.add("boutique");
    this.zone = el("div.bq-zone");
    this.carte.append(this.zone);
    this.barre([], [bouton("Fermer", () => this.fermer(), "primary")]);
    this.dessiner();
  }
  dessiner() {
    const app = this.app, d = app.donnees, solde = Geos.solde(d), inv = Geos.inventaire(d), ach = Geos.achats(d), ram = Geos.ramasses(d);
    const z = this.zone; z.innerHTML = "";
    z.append(el("div.bq-tete", null,
      el("div.bq-solde", null, imgGeo(3), el("b.geos-solde", {texte: fmtGeos(solde)}), el("span.muted.geos-nom", {texte: M("p")})),
      el("div.bq-jour.petit.muted", {texte: `Récolte du jour : ${fmtGeos(ram)} / ${fmtGeos(GJ.plafond)}`}),
      ram >= GJ.plafond ? el("div.bq-plafond.petit", {texte: `Plafond du jour atteint : retour des ${M("p")} demain.`}) : null));
    const rangees = [];
    for (const a of JX.autocollants) if (!rangees.includes(a[3])) rangees.push(a[3]);
    for (const r of rangees) {
      const g = el("div.bq-grille");
      for (const [s, nom, prix, rr] of JX.autocollants) {
        if (rr !== r) continue;
        const possede = ach[s] || 0, libre = inv[s] || 0, fx = effetAutocollant(s);
        const b = bouton("", () => {
          if (!Geos.acheter(app, s)) { this.erreur(`Il manque ${fmtGeos(prix - Geos.solde(app.donnees))} ${M("p")} pour « ${nom} ».`); return; }
          this.erreur(""); SonJeux.jouer("achat"); Notifs.bulle(`« ${nom} » ajouté à ton inventaire.`); this.dessiner();
        }, prix <= solde ? "primary" : "ghost");
        b.classList.add("petit", "bq-prix");
        b.title = `Acheter « ${nom} » pour ${fmtGeos(prix)} ${M("p")}`;
        b.append(imgGeo(1), el("span", {texte: fmtGeos(prix)}));
        if (prix > solde) b.classList.add("trop-cher");
        g.append(el("div.carte.bq-art" + (fx ? ".rare" : ""), null, imgAutocollant(s, 4, ".bq-img"), el("b", {texte: nom}),
          fx ? el("span.bq-rare.petit", {texte: "Rare · " + NOM_EFFET[fx]}) : null,
          el("span.petit.muted", {texte: possede ? `${libre} dans l'inventaire · ${possede - libre} collé${possede - libre > 1 ? "s" : ""}` : "Pas encore à toi"}), b));
      }
      z.append(etiquette(r), g);
    }
  }
}

/* inventaire : choisir un autocollant à coller (répond l'id, ou null) */
function choisirAutocollant(app) {
  return new Promise((res) => {
    const m = new Modal("Mes autocollants", "Choisis un autocollant : il se pose sur la note, puis glisse-le où tu veux.");
    const inv = Geos.inventaire(app.donnees), g = el("div.bq-grille.ac-choix");
    let fait = false;
    const finir = (v) => { if (!fait) { fait = true; res(v); } };
    for (const [s, nom] of JX.autocollants) {
      if (!inv[s]) continue;
      g.append(el("button.carte.bq-art.ac-pick", {type: "button", onclick: () => { finir(s); m.fermer(); }}, imgAutocollant(s, 4, ".bq-img"), el("b", {texte: nom}), el("span.petit.muted", {texte: `× ${inv[s]}`})));
    }
    if (!g.children.length) m.carte.append(el("p.muted", {texte: `Ton inventaire est vide. Achète des autocollants dans la boutique avec tes ${M("p")}.`}));
    else m.carte.append(g);
    m.barre([bouton("Boutique", () => { finir(null); m.fermer(); new Boutique(app).montrer(); }, "ghost")], [bouton("Fermer", () => { finir(null); m.fermer(); }, "primary")]);
    const vieux = m.fermer.bind(m);
    m.fermer = () => { vieux(); finir(null); };
    m.montrer();
  });
}
function boutonAutocollants(action) {
  const b = bouton("", action, "ghost", {title: "Coller un autocollant"});
  b.classList.add("btn-ico", "btn-ac");
  b.append(imgSprite("etoile", 2), el("span", {texte: "Autocollants"}));
  return b;
}

/* ---------- autocollants posés sur une note : {id, s, p (id de page ; "" pour une note texte), x, y, t} */
function normaliserAutocollant(a) {
  if (!a || typeof a !== "object" || typeof a.s !== "string") return null;
  const r = (v) => Math.round((Number(v) || 0) * 10) / 10;
  return {id: String(a.id || newId()), s: a.s, p: String(a.p || ""), x: r(a.x), y: r(a.y), t: Math.max(30, Math.min(400, Math.round(Number(a.t) || AC_TAILLE)))};
}
function autocollantsNote(n) {
  if (!n || !Array.isArray(n.autocollants)) return [];
  const ids = new Set((n.pages || []).map(p => p.id));
  return n.autocollants.filter(a => a && SPRITES[a.s] && (n.type === "cahier" ? ids.has(a.p) : !a.p));
}
/* zone glissable d'un autocollant (doigt, Apple Pencil ou souris) ; un appui le choisit (bouton ✕ pour le retirer) */
function zoneAutocollant(a, rappels) {
  const x = el("button.ac-x", {type: "button", title: "Retirer (il retourne dans l'inventaire)", "aria-label": "Retirer l'autocollant"}, "✕");
  const fx = effetAutocollant(a.s);
  const z = el("div.ac-zone" + (fx ? ".ac-fx.ac-fx-" + fx : ""), {"data-id": a.id, style: fx ? {"--ac-masque": `url("${spriteURL(a.s, 4)}")`} : {}}, imgSprite(a.s, 4, ".ac-img"), x);
  z._ac = a;
  x.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); rappels.retirer(z._ac); });
  let g = null;
  z.addEventListener("pointerdown", (e) => {
    if (e.button > 0 || e.target === x) return;
    e.preventDefault(); e.stopPropagation();
    try { z.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    g = {id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: z._ac.x, y0: z._ac.y, deplace: false};
    rappels.debut(g);
    z.classList.add("saisi");
  });
  z.addEventListener("pointermove", (e) => {
    if (!g || g.id !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (!g.deplace && Math.hypot(dx, dy) <= 6) return;
    g.deplace = true;
    rappels.bouge(z._ac, g, dx, dy);
  });
  const fin = (e, annule) => {
    if (!g || g.id !== e.pointerId) return;
    const gg = g; g = null;
    z.classList.remove("saisi");
    try { z.releasePointerCapture(e.pointerId); } catch (er) { /* */ }
    rappels.fin(z._ac, gg, annule);
  };
  z.addEventListener("pointerup", (e) => fin(e, false));
  z.addEventListener("pointercancel", (e) => fin(e, true));
  z.addEventListener("lostpointercapture", (e) => fin(e, false));
  z.addEventListener("contextmenu", (e) => e.preventDefault());
  return z;
}

/* ---------- application « Mini-jeux » */
const SYMBOLES_ROULEAU = JX.rouleaux.map(r => r[0]);
function tirerRouleau() {
  let t = alea(JX.rouleaux.reduce((s, r) => s + r[1], 0));
  for (const [s, w] of JX.rouleaux) { if (t < w) return s; t -= w; }
  return JX.rouleaux[0][0];
}
function gainMachine(r) {
  if (r[0] === r[1] && r[1] === r[2]) return JX.machine[r[0]] || 0;
  return JX.cerises[String(r.filter(s => s === "cerise").length)] || 0;
}
function couleurRoulette(n) { return n === 0 ? "vert" : JX.rouges.includes(n) ? "rouge" : "noir"; }
function carteHasard() { return {r: 1 + alea(13), c: alea(4)}; }
function valeurMain(m) {
  let t = 0, as = false;
  for (const c of m) { t += Math.min(10, c.r); if (c.r === 1) as = true; }
  return as && t + 10 <= 21 ? t + 10 : t;
}
const RANGS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "R"], ENSEIGNES = ["♠", "♥", "♦", "♣"];
function carteGrattage() {
  let r = aleaReel(), gagnant = null;
  for (const [m, p, s] of JX.grattage) { if (r < p) { gagnant = [m, s]; break; } r -= p; }
  const tous = JX.grattage.map(g => g[2]).concat(JX.grattage_autres);
  const cases = gagnant ? [gagnant[1], gagnant[1], gagnant[1]] : [];
  const compte = {};
  while (cases.length < 6) {
    const choix = tous.filter(s => (!gagnant || s !== gagnant[1]) && (compte[s] || 0) < 2);
    const s = choix[alea(choix.length)];
    compte[s] = (compte[s] || 0) + 1; cases.push(s);
  }
  for (let i = cases.length - 1; i > 0; i--) { const j = alea(i + 1); [cases[i], cases[j]] = [cases[j], cases[i]]; }
  return {cases, mult: gagnant ? gagnant[0] : 0, symbole: gagnant ? gagnant[1] : ""};
}

class PageJeux {
  constructor(app) { this.app = app; this.el = el("div.ecran.ecran-defile.ecran-jeux"); this.etats = {roulette: {histo: []}}; this.occupe = false; this.msg = null; }
  get reg() { return this.app.reglages; }
  jeu() { const j = this.reg.jeux_choix; return JX.jeux.some(x => x[0] === j) && typeof this["jeu_" + j] === "function" ? j : "roulette"; }
  mise() { const m = parseInt(this.reg.jeux_mise); return isNaN(m) ? 50 : Math.max(GJ.mise_min, Math.min(GJ.mise_max, m)); }
  regler(k, v) { this.reg[k] = v; this.app.enregistrerLocal(); }
  rafraichir() {
    if (this.occupe) { this.majEntete(); return; }
    const z = this.el, app = this.app;
    z.innerHTML = "";
    this.lblSolde = el("b.geos-solde", {texte: fmtGeos(Geos.solde(app.donnees))});
    this.lblJour = el("div.petit.muted.jx-jour");
    z.append(el("header.jx-entete", null,
      el("div.jx-titre-bloc", null, el("div.mono.muted", {texte: `CASINO DES ${M("P").toUpperCase()}`}), el("h1.page-h1", {texte: "Mini-jeux"}), this.lblJour),
      el("div.jx-porte", null, el("div.jx-solde", null, imgGeo(3), this.lblSolde, el("span.muted.geos-nom", {texte: M("p")})),
        boutonIcone("etoile", "Boutique", () => new Boutique(app).montrer(), "primary"))));
    // mise
    this.zMise = el("div.carte.jx-mise");
    z.append(this.zMise);
    this.dessinerMise();
    // choix du jeu
    const choix = el("div.jx-choix");
    for (const [k, nom, desc] of JX.jeux) {
      const ico = JX.jeux_ico[k] === "PIECE" ? spriteGeo() : JX.jeux_ico[k];
      choix.append(el("button.carte.jx-tuile" + (k === this.jeu() ? ".on" : ""), {type: "button", title: nom, onclick: () => { if (this.occupe) return; this.regler("jeux_choix", k); this.msg = null; this.rafraichir(); }},
        el("span.jx-tuile-ico", null, k === "pile" ? imgGeo(3) : imgSprite(ico, 3)),
        el("b.jx-tuile-nom", {texte: nom}), el("span.petit.muted", {texte: desc})));
    }
    z.append(choix);
    // zone de jeu
    const [, nomJeu, descJeu] = JX.jeux.find(x => x[0] === this.jeu());
    this.zJeu = el("section.carte.jx-zone");
    this.zMsg = el("div.jx-msg");
    z.append(this.zJeu);
    this.zJeu.append(el("div.jx-zone-tete", null, el("h2.jx-zone-titre", {texte: nomJeu}), el("span.petit.muted", {texte: descJeu})));
    this["jeu_" + this.jeu()](this.zJeu);
    this.zJeu.append(this.zMsg);
    if (this.msg) this.message(...this.msg);
    // options propres à cet appareil
    const opt = el("div.jx-options");
    opt.append(caseACocher(this.reg.jeux_son !== false, (v) => this.regler("jeux_son", v), "Son"),
      caseACocher(this.reg.jeux_anim !== false, (v) => { this.regler("jeux_anim", v); Geos.majVisuel(); }, "Animations"),
      caseACocher(this.reg.geos_apparition !== false, (v) => { this.regler("geos_apparition", v); if (!v) Apparitions.vider(); }, `${M("P")} qui apparaissent dans l'appli`));
    z.append(opt, el("p.petit.muted.jx-pied", {texte: `Les ${M("p")} apparaissent un peu partout dans l'appli (plus souvent ici, dans Mini-jeux) : touche-les pour les ramasser. Au plus ${fmtGeos(GJ.plafond)} ramassés par jour ; les gains des jeux ne comptent pas dans ce plafond. Mise de ${GJ.mise_min} à ${fmtGeos(GJ.mise_max)}.`}));
    this.majEntete();
  }
  majEntete() {
    if (!this.lblSolde || !this.app.donnees) return;
    this.lblSolde.textContent = fmtGeos(Geos.solde(this.app.donnees));
    const r = Geos.ramasses(this.app.donnees);
    this.lblJour.textContent = r >= GJ.plafond ? `Plafond du jour atteint (${fmtGeos(GJ.plafond)}) : retour des ${M("p")} demain.` : `Récolte du jour : ${fmtGeos(r)} / ${fmtGeos(GJ.plafond)}`;
    if (this.lblMiseInfo) this.majInfoMise();
  }
  /* mise : boutons de valeur fixe, boutons d'ajout (+50, +100…), Tout miser, Effacer, curseur */
  poserMise(v) {
    v = Math.max(GJ.mise_min, Math.min(GJ.mise_max, Math.round(Number(v) || 0)));
    this.regler("jeux_mise", v);
    this.dessinerMise();
  }
  majInfoMise() {
    const m = this.mise(), s = Geos.solde(this.app.donnees);
    this.lblMiseInfo.textContent = m > s ? `Au-dessus de ton solde (${fmtGeos(s)}) : la mise sera refusée.` : "";
  }
  dessinerMise() {
    const z = this.zMise, m = this.mise();
    z.innerHTML = "";
    const val = el("b.jx-mise-val", {texte: fmtGeos(m)});
    const fixes = el("div.rapides.jx-fixes");
    for (const v of GJ.mises) fixes.append(petit(fmtGeos(v), () => this.poserMise(v), v === m ? "tab_on" : "ghost"));
    const ajouts = el("div.rapides.jx-ajouts");
    for (const v of GJ.ajouts) ajouts.append(petit("+" + fmtGeos(v), () => this.poserMise(this.mise() + v), "ghost"));
    ajouts.append(petit("Tout miser", () => this.poserMise(Math.min(GJ.mise_max, Math.max(GJ.mise_min, Geos.solde(this.app.donnees)))), "ghost"),
      petit("Effacer", () => this.poserMise(GJ.mise_min), "ghost"));
    const curseur = el("input.jx-curseur", {type: "range", min: String(GJ.mise_min), max: String(GJ.mise_max), step: "10", value: String(m), "aria-label": "Mise",
      oninput: (e) => { val.textContent = fmtGeos(e.target.value); }, onchange: (e) => this.poserMise(parseInt(e.target.value))});
    this.lblMiseInfo = el("div.petit.jx-mise-info");
    z.append(el("div.jx-mise-tete", null, el("span.etiquette", {texte: "MISE"}), val, imgGeo(1), el("span.petit.muted.jx-mise-lim", {texte: `${GJ.mise_min} à ${fmtGeos(GJ.mise_max)}`})),
      el("div.petit.muted.jx-sous", {texte: "Valeur"}), fixes, el("div.petit.muted.jx-sous", {texte: "Ajouter"}), ajouts, curseur, this.lblMiseInfo);
    this.majInfoMise();
  }
  /* débite la mise ; 0 si refusée */
  miser() {
    const m = this.mise(), s = Geos.solde(this.app.donnees);
    if (m < GJ.mise_min || m > GJ.mise_max) { this.message(`La mise doit être entre ${GJ.mise_min} et ${fmtGeos(GJ.mise_max)}.`, "refus"); return 0; }
    if (m > s) { this.message(`Solde insuffisant : il te reste ${fmtGeos(s)} ${M("p")} (mise : ${fmtGeos(m)}).`, "refus"); return 0; }
    if (regEco("fb_jeu_unique")) Geos.debutPartie();
    if (!Geos.depenser(this.app, m)) { Geos.finPartie(this.app); return 0; }
    this.majEntete();
    return m;
  }
  /* paie le résultat (mult = 0 : perdu) et l'annonce */
  payer(mise, mult, detail = "") {
    const gain = Math.floor(mise * mult + 1e-9);
    if (gain > 0) Geos.gagner(this.app, gain, false);
    Geos.finPartie(this.app);
    this.majEntete();
    if (gain > mise) { this.message(`Gagné : +${fmtGeos(gain)} ${M("p")} (${fmtMult(mult)})` + (detail ? ` · ${detail}` : ""), "gagne"); SonJeux.jouer("gain"); Geos.pulser(); }
    else if (gain === mise) { this.message("Égalité : mise rendue" + (detail ? ` · ${detail}` : ""), "egal"); }
    else if (gain > 0) { this.message(`+${fmtGeos(gain)} ${M("p")} (${fmtMult(mult)})` + (detail ? ` · ${detail}` : ""), "egal"); }
    else { this.message(`Perdu : −${fmtGeos(mise)} ${M("p")}` + (detail ? ` · ${detail}` : ""), "perdu"); SonJeux.jouer("perte"); }
  }
  message(t, genre = "") {
    this.msg = [t, genre];
    if (!this.zMsg) return;
    this.zMsg.className = "jx-msg " + genre;
    this.zMsg.textContent = t;
  }
  /* animation : f(i) toutes les « pas » ms pendant « duree » ms, puis fin() ; immédiate si les animations sont coupées */
  animer(duree, pas, f, fin) {
    if (!animationsJeux(this.app)) { fin(); return; }
    this.occupe = true;
    const t0 = performance.now();
    let i = 0;
    const tic = () => {
      const ecoule = performance.now() - t0;
      if (ecoule >= duree) { this.occupe = false; fin(); return; }
      f(i++, ecoule); setTimeout(tic, pas * (1 + i / 30));
    };
    tic();
  }
  boutonsJeu(liste) { return el("div.jx-actions", null, liste.map(([t, f, s]) => { const b = bouton(t, () => { if (!this.occupe) f(); }, s || "ghost"); return b; })); }

  /* ----- roulette (0 à 36) */
  jeu_roulette(z) {
    const st = this.etats.roulette;
    const roue = el("div.jx-roue." + (st.dernier !== undefined ? couleurRoulette(st.dernier) : "vert"), null, el("b", {texte: st.dernier !== undefined ? String(st.dernier) : "–"}));
    const histo = el("div.jx-histo", null, st.histo.map(n => el("span." + couleurRoulette(n), {texte: String(n)})));
    const num = el("select.saisie.jx-num");
    for (let i = 0; i <= 36; i++) num.append(el("option", {value: String(i), texte: String(i), selected: i === (st.numero || 0)}));
    num.addEventListener("change", () => { st.numero = parseInt(num.value); });
    const g = JX.roulette;
    z.append(el("div.jx-scene", null, roue, histo),
      this.boutonsJeu([[`Rouge ${fmtMult(g.couleur)}`, () => this.roulette("couleur", "rouge"), "jx-rouge"], [`Noir ${fmtMult(g.couleur)}`, () => this.roulette("couleur", "noir"), "jx-noir"]]),
      this.boutonsJeu([[`1 – 12 ${fmtMult(g.douzaine)}`, () => this.roulette("douzaine", 1)], [`13 – 24 ${fmtMult(g.douzaine)}`, () => this.roulette("douzaine", 2)], [`25 – 36 ${fmtMult(g.douzaine)}`, () => this.roulette("douzaine", 3)]]),
      el("div.jx-actions", null, el("span.petit.muted", {texte: "Numéro"}), num, bouton(`Miser sur ce numéro ${fmtMult(g.numero)}`, () => { if (!this.occupe) this.roulette("numero", parseInt(num.value)); }, "ghost")));
    this.roue = roue;
  }
  roulette(type, val) {
    const m = this.miser(); if (!m) return;
    const n = alea(37), st = this.etats.roulette;
    const montrer = (k) => { this.roue.className = "jx-roue " + couleurRoulette(k); this.roue.firstChild.textContent = String(k); };
    this.message("La bille roule…", "");
    this.animer(1300, 70, () => { montrer(alea(37)); SonJeux.jouer("tic"); }, () => {
      montrer(n);
      st.dernier = n; st.histo = [n].concat(st.histo).slice(0, 10);
      const ok = type === "couleur" ? couleurRoulette(n) === val : type === "douzaine" ? n >= 1 && Math.ceil(n / 12) === val : n === val;
      const nom = `${n} ${couleurRoulette(n)}`;
      this.payer(m, ok ? JX.roulette[type] : 0, nom);
      this.rafraichir();
    });
  }

  /* ----- machine à sous (trois rouleaux) */
  jeu_machine(z) {
    const st = this.etats.machine = this.etats.machine || {r: ["sept", "sept", "sept"]};
    this.rouleaux = st.r.map(s => el("div.jx-rouleau", null, imgSprite(s, 5)));
    const table = el("div.jx-table");
    for (const [s, mult] of Object.entries(JX.machine).sort((a, b) => b[1] - a[1])) table.append(el("span", null, imgSprite(s, 1), imgSprite(s, 1), imgSprite(s, 1), el("b", {texte: fmtMult(mult)})));
    for (const [n, mult] of Object.entries(JX.cerises)) table.append(el("span", null, ...Array.from({length: +n}, () => imgSprite("cerise", 1)), el("i.petit.muted", {texte: "(sans triple)"}), el("b", {texte: fmtMult(mult)})));
    z.append(el("div.jx-scene", null, el("div.jx-machine", null, this.rouleaux)), this.boutonsJeu([["Tourner", () => this.machine(), "primary"]]), table);
  }
  machine() {
    const m = this.miser(); if (!m) return;
    const r = [tirerRouleau(), tirerRouleau(), tirerRouleau()], st = this.etats.machine;
    const poser = (i, s) => { const im = this.rouleaux[i].firstChild; im.src = spriteURL(s, 5); };
    this.message("Les rouleaux tournent…", "");
    this.rouleaux.forEach(x => x.classList.add("tourne"));
    let arretes = 0;
    this.animer(1500, 60, (i, t) => {
      for (let k = 0; k < 3; k++) {
        if (k < arretes) continue;
        if (t > 650 + k * 330) { poser(k, r[k]); this.rouleaux[k].classList.remove("tourne"); arretes = k + 1; SonJeux.jouer("tic"); }
        else poser(k, SYMBOLES_ROULEAU[alea(SYMBOLES_ROULEAU.length)]);
      }
    }, () => {
      st.r = r;
      this.payer(m, gainMachine(r));
      this.rafraichir();
    });
  }

  /* ----- pile ou face */
  jeu_pile(z) {
    const st = this.etats.pile = this.etats.pile || {cote: "pile"};
    this.piece = el("div.jx-piece", null, el("b", {texte: st.cote === "pile" ? "PILE" : "FACE"}));
    z.append(el("div.jx-scene", null, this.piece), this.boutonsJeu([[`Pile ${fmtMult(JX.pile)}`, () => this.pile("pile"), "primary"], [`Face ${fmtMult(JX.pile)}`, () => this.pile("face"), "primary"]]));
  }
  pile(choix) {
    const m = this.miser(); if (!m) return;
    const res = alea(2) ? "pile" : "face", st = this.etats.pile;
    this.message("La pièce tourne…", "");
    this.piece.classList.add("tourne");
    this.animer(1000, 90, (i) => { this.piece.firstChild.textContent = i % 2 ? "PILE" : "FACE"; }, () => {
      st.cote = res;
      this.payer(m, res === choix ? JX.pile : 0, res === "pile" ? "Pile" : "Face");
      this.rafraichir();
    });
  }

  /* ----- dés : plus haut ou plus bas que 7 (deux dés) */
  de(v) {
    const pips = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]}[v] || [];
    return el("div.jx-de", null, Array.from({length: 9}, (_, i) => el("span" + (pips.includes(i) ? ".pip" : ""))));
  }
  jeu_des(z) {
    const st = this.etats.des = this.etats.des || {d: [3, 4]};
    this.zDes = el("div.jx-des", null, this.de(st.d[0]), this.de(st.d[1]));
    const g = JX.des;
    z.append(el("div.jx-scene", null, this.zDes, el("div.jx-total", {texte: `Total : ${st.d[0] + st.d[1]}`})),
      this.boutonsJeu([[`Plus bas (2 – 6) ${fmtMult(g.bas)}`, () => this.des("bas"), "primary"], [`Sept ${fmtMult(g.sept)}`, () => this.des("sept")], [`Plus haut (8 – 12) ${fmtMult(g.haut)}`, () => this.des("haut"), "primary"]]));
  }
  des(choix) {
    const m = this.miser(); if (!m) return;
    const d = [1 + alea(6), 1 + alea(6)], t = d[0] + d[1], st = this.etats.des;
    this.message("Les dés roulent…", "");
    this.animer(900, 80, () => { this.zDes.replaceChildren(this.de(1 + alea(6)), this.de(1 + alea(6))); SonJeux.jouer("tic"); }, () => {
      st.d = d;
      const ok = choix === "bas" ? t < 7 : choix === "haut" ? t > 7 : t === 7;
      this.payer(m, ok ? JX.des[choix] : 0, `total ${t}`);
      this.rafraichir();
    });
  }

  /* ----- blackjack simplifié (paquet infini, le croupier tire jusqu'à 17) */
  carte(c, cachee) {
    if (cachee) return el("div.jx-carte.dos");
    return el("div.jx-carte" + (c.c === 1 || c.c === 2 ? ".rouge" : ""), null, el("b", {texte: RANGS[c.r]}), el("span", {texte: ENSEIGNES[c.c]}));
  }
  jeu_blackjack(z) {
    const st = this.etats.blackjack;
    const enCours = st && !st.fini, cacher = enCours && !st.revele;
    const ligne = (titre, main, cache) => el("div.jx-main", null, el("div.petit.muted", {texte: titre + (main.length ? `  ·  ${cache ? "?" : valeurMain(main)}` : "")}),
      el("div.jx-cartes", null, main.map((c, i) => this.carte(c, cache && i === 1))));
    z.append(el("div.jx-scene.jx-table-bj", null, ligne("Croupier", st ? st.croupier : [], cacher), ligne("Toi", st ? st.joueur : [], false)));
    if (cacher) z.append(this.boutonsJeu([["Tirer", () => this.bjTirer(), "primary"], ["Rester", () => this.bjRester()]]), el("div.petit.muted", {texte: `Mise en jeu : ${fmtGeos(st.mise)}`}));
    else if (enCours) z.append(el("div.petit.muted.jx-attente", {texte: "Le croupier joue…"}));
    else z.append(this.boutonsJeu([[`Distribuer (mise ${fmtGeos(this.mise())})`, () => this.bjDistribuer(), "primary"]]),
      el("div.petit.muted", {texte: `Victoire ${fmtMult(JX.bj.gagne)} · blackjack ${fmtMult(JX.bj.blackjack)} · égalité : mise rendue. Le croupier tire jusqu'à 17.`}));
  }
  bjDistribuer() {
    const m = this.miser(); if (!m) return;
    const st = this.etats.blackjack = {mise: m, joueur: [carteHasard(), carteHasard()], croupier: [carteHasard(), carteHasard()], fini: false};
    this.message("À toi de jouer : tirer ou rester ?", "");
    if (valeurMain(st.joueur) === 21 || valeurMain(st.croupier) === 21) { this.bjFin(); return; }
    this.rafraichir();
  }
  bjTirer() {
    const st = this.etats.blackjack; if (!st || st.fini) return;
    st.joueur.push(carteHasard()); SonJeux.jouer("tic");
    if (valeurMain(st.joueur) > 21) { this.bjFin(); return; }
    if (valeurMain(st.joueur) === 21) { this.bjRester(); return; }
    this.rafraichir();
  }
  bjRester() {
    const st = this.etats.blackjack; if (!st || st.fini) return;
    st.revele = true;
    const anim = animationsJeux(this.app);
    const suite = () => { if (anim) { this.occupe = true; setTimeout(tirer, 450); } else tirer(); };
    const tirer = () => {                                   // le croupier retourne sa carte, puis tire jusqu'à 17
      this.occupe = false;
      if (valeurMain(st.croupier) >= 17) { this.bjFin(); return; }
      st.croupier.push(carteHasard()); SonJeux.jouer("tic");
      this.rafraichir();
      suite();
    };
    this.rafraichir();
    suite();
  }
  bjFin() {
    const st = this.etats.blackjack;
    st.fini = true;
    const j = valeurMain(st.joueur), c = valeurMain(st.croupier);
    const bjJ = j === 21 && st.joueur.length === 2, bjC = c === 21 && st.croupier.length === 2;
    let mult, detail;
    if (bjJ || bjC) { mult = bjJ && bjC ? JX.bj.egalite : bjJ ? JX.bj.blackjack : 0; detail = bjJ && bjC ? "deux blackjacks" : bjJ ? "blackjack !" : "blackjack du croupier"; }
    else if (j > 21) { mult = 0; detail = `tu dépasses 21 (${j})`; }
    else if (c > 21) { mult = JX.bj.gagne; detail = `le croupier dépasse 21 (${c})`; }
    else if (j > c) { mult = JX.bj.gagne; detail = `${j} contre ${c}`; }
    else if (j === c) { mult = JX.bj.egalite; detail = `${j} partout`; }
    else { mult = 0; detail = `${j} contre ${c}`; }
    this.payer(st.mise, mult, detail);
    this.rafraichir();
  }

  /* ----- carte à gratter : six cases, trois symboles pareils = gain */
  jeu_grattage(z) {
    const st = this.etats.grattage;
    const table = el("div.jx-table");
    for (const [mult, , s] of JX.grattage) table.append(el("span", null, imgSprite(s, 1), imgSprite(s, 1), imgSprite(s, 1), el("b", {texte: fmtMult(mult)})));
    if (!st) {
      z.append(el("div.jx-scene", null, el("div.jx-ticket.vide", null, el("b", {texte: "Carte à gratter"}), el("span.petit.muted", {texte: "Trois symboles pareils : tu gagnes leur multiplicateur."}))),
        this.boutonsJeu([[`Acheter une carte (mise ${fmtGeos(this.mise())})`, () => this.gratterAcheter(), "primary"]]), table);
      return;
    }
    const grille = el("div.jx-ticket");
    st.cases.forEach((s, i) => grille.append(this.caseGrattage(st, i)));
    const actions = st.fini ? [[`Nouvelle carte (mise ${fmtGeos(this.mise())})`, () => this.gratterAcheter(), "primary"]] : [["Tout gratter", () => { st.vus = st.vus.map(() => true); this.gratterFin(); }]];
    z.append(el("div.jx-scene", null, grille, el("div.petit.muted", {texte: st.fini ? "" : "Gratte les cases au doigt, au crayon ou à la souris."})), this.boutonsJeu(actions), table);
  }
  caseGrattage(st, i) {
    const c = el("div.jx-case", null, imgSprite(st.cases[i], 4));
    if (st.vus[i]) { if (st.fini && st.symbole === st.cases[i]) c.classList.add("gagnante"); return c; }
    const cv = el("canvas.jx-couche", {width: 120, height: 120});
    const g = cv.getContext("2d");
    const fond = g.createLinearGradient(0, 0, 120, 120); fond.addColorStop(0, "#b9c0c9"); fond.addColorStop(.5, "#e3e7ec"); fond.addColorStop(1, "#9aa3ae");
    g.fillStyle = fond; g.fillRect(0, 0, 120, 120);
    g.fillStyle = "rgba(255,255,255,.35)"; for (let k = 0; k < 14; k++) g.fillRect(alea(120), alea(120), 3, 3);
    c.append(cv);
    const grille = new Array(36).fill(false);
    let actif = false, bouge = false;
    const gratter = (e) => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 120, y = (e.clientY - r.top) / r.height * 120;
      g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.globalCompositeOperation = "source-over";
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) if (Math.hypot(a * 20 + 10 - x, b * 20 + 10 - y) < 18) grille[b * 6 + a] = true;
      if (grille.filter(Boolean).length >= 18) this.gratterCase(st, i);
    };
    cv.addEventListener("pointerdown", (e) => { e.preventDefault(); actif = true; bouge = false; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ } gratter(e); });
    cv.addEventListener("pointermove", (e) => { if (!actif) return; e.preventDefault(); bouge = true; gratter(e); });
    cv.addEventListener("pointerup", () => { if (actif && !bouge) this.gratterCase(st, i); actif = false; });
    cv.addEventListener("pointercancel", () => { actif = false; });
    return c;
  }
  gratterCase(st, i) {
    if (st.vus[i] || st.fini) return;
    st.vus[i] = true; SonJeux.jouer("tic");
    if (st.vus.every(Boolean)) { this.gratterFin(); return; }
    const c = this.zJeu && this.zJeu.querySelectorAll(".jx-case")[i], couche = c && c.querySelector(".jx-couche");   // la case se découvre ; on continue à gratter les autres
    if (couche) couche.remove(); else this.rafraichir();
  }
  gratterAcheter() {
    const m = this.miser(); if (!m) return;
    this.etats.grattage = Object.assign(carteGrattage(), {mise: m, vus: new Array(6).fill(false), fini: false});
    this.message("Gratte les six cases.", "");
    this.rafraichir();
  }
  gratterFin() {
    const st = this.etats.grattage;
    if (!st || st.fini) return;
    st.fini = true;
    this.payer(st.mise, st.mult, st.mult ? `3 × ${nomAutocollant(st.symbole)}` : "pas de triple");
    this.rafraichir();
  }

  /* =============================== 20 nouveaux jeux (v24) =============================== */
  /* rangée de boutons de choix : [[texte, valeur, style]] → f(valeur) */
  choix(liste, f) { return this.boutonsJeu(liste.map(([t, v, st]) => [t, () => f(v), st || "primary"])); }
  tableGains(lignes) { return el("div.jx-table.jx-table-texte", null, lignes.map(([a, b]) => el("span", null, el("i", {texte: a}), el("b", {texte: b})))); }
  finir(m, mult, detail) { this.payer(m, mult, detail); this.rafraichir(); }

  /* ----- roue de la fortune : douze cases équiprobables */
  jeu_roue(z) {
    const st = this.etats.roue = this.etats.roue || {i: 0};
    this.rcases = el("div.jx-roue-cases", null, JX.roue.map((m, i) => el("span.jx-rcase" + (i === st.i ? ".on" : "") + (m >= 2 ? ".haut" : m === 0 ? ".zero" : ""), {texte: fmtMult(m)})));
    z.append(el("div.jx-scene", null, this.rcases), this.boutonsJeu([["Faire tourner", () => this.tournerRoue(), "primary"]]));
  }
  tournerRoue() {
    const m = this.miser(); if (!m) return;
    const n = JX.roue.length, cible = alea(n), st = this.etats.roue;
    let pos = st.i;
    this.message("La roue tourne…");
    this.animer(1500, 45, () => { pos = (pos + 1) % n; this.rcases.querySelectorAll(".jx-rcase").forEach((c, j) => c.classList.toggle("on", j === pos)); SonJeux.jouer("tic"); },
      () => { st.i = cible; this.finir(m, JX.roue[cible], "case " + fmtMult(JX.roue[cible])); });
  }

  /* ----- plinko : la bille rebondit sur huit rangées (gauche ou droite à chaque clou) */
  jeu_plinko(z) {
    const st = this.etats.plinko = this.etats.plinko || {risque: "moyen", fin: -1};
    const R = JX.plinko.rangs, t = JX.plinko.risques[st.risque], pas = 100 / (R + 2);
    const pl = el("div.jx-plinko");
    for (let r = 0; r < R; r++) for (let j = 0; j <= r; j++) pl.append(el("i.jx-clou", {style: {left: (50 + (j - r / 2) * pas) + "%", top: ((r + 1) / (R + 2) * 100) + "%"}}));
    this.plBille = el("b.jx-bille", {style: {left: (st.fin >= 0 ? 50 + (st.fin - R / 2) * pas : 50) + "%", top: (st.fin >= 0 ? (R + 1) / (R + 2) * 100 : 2) + "%"}});
    pl.append(this.plBille);
    const cases = el("div.jx-pl-cases", null, t.map((mm, i) => el("span" + (i === st.fin ? ".on" : "") + (mm >= 2 ? ".haut" : mm < 1 ? ".bas" : ""), {texte: fmtMult(mm)})));
    const risques = el("div.rapides.jx-risques", null, el("span.petit.muted", {texte: "Risque"}),
      ...[["bas", "Bas"], ["moyen", "Moyen"], ["haut", "Élevé"]].map(([k, n]) => petit(n, () => { if (this.occupe) return; st.risque = k; st.fin = -1; this.rafraichir(); }, k === st.risque ? "tab_on" : "ghost")));
    z.append(risques, el("div.jx-scene.jx-scene-plinko", null, pl, cases), this.boutonsJeu([["Lâcher la bille", () => this.plinko(), "primary"]]));
  }
  plinko() {
    const m = this.miser(); if (!m) return;
    const st = this.etats.plinko, R = JX.plinko.rangs, pas = 100 / (R + 2);
    const chemin = Array.from({length: R}, () => alea(2));
    const fin = chemin.reduce((a, b) => a + b, 0);
    let k = 0;
    this.message("La bille tombe…");
    this.animer(R * 150 + 100, 150, (i) => {
      if (i >= R) return;
      k += chemin[i];
      Object.assign(this.plBille.style, {left: (50 + (k - (i + 1) / 2) * pas) + "%", top: ((i + 1.5) / (R + 2) * 100) + "%"});
      SonJeux.jouer("tic");
    }, () => { st.fin = fin; this.finir(m, JX.plinko.risques[st.risque][fin], "case " + (fin + 1)); });
  }

  /* ----- keno : 1 à 5 numéros sur 40, dix numéros tirés */
  jeu_keno(z) {
    const st = this.etats.keno = this.etats.keno || {choix: [], tires: []};
    const K = JX.keno;
    const g = el("div.jx-keno");
    for (let n = 1; n <= K.total; n++) {
      const pris = st.choix.includes(n), tire = st.tires.includes(n);
      g.append(el("button.jx-kn" + (pris ? ".pris" : "") + (tire ? ".tire" : "") + (pris && tire ? ".touche" : ""), {type: "button", texte: String(n), "aria-pressed": pris ? "true" : "false",
        onclick: () => { if (this.occupe) return; if (pris) st.choix = st.choix.filter(x => x !== n); else if (st.choix.length < 5) st.choix.push(n); st.tires = []; this.rafraichir(); }}));
    }
    const k = st.choix.length, t = K.gains[String(k)] || {};
    z.append(el("div.jx-scene", null, g, el("div.petit.muted", {texte: k ? `${k} numéro${k > 1 ? "s" : ""} choisi${k > 1 ? "s" : ""} (5 au plus)` : "Touche 1 à 5 numéros."})),
      this.boutonsJeu([["Tirer dix numéros", () => this.keno(), "primary"], ["Au hasard", () => { if (this.occupe) return; const l = []; while (l.length < 5) { const n = 1 + alea(K.total); if (!l.includes(n)) l.push(n); } st.choix = l; st.tires = []; this.rafraichir(); }], ["Effacer", () => { st.choix = []; st.tires = []; this.rafraichir(); }]]),
      k ? this.tableGains(Object.entries(t).sort((a, b) => b[0] - a[0]).map(([h, mm]) => [`${h} trouvé${h > 1 ? "s" : ""}`, fmtMult(mm)])) : el("span"));
  }
  keno() {
    const st = this.etats.keno, K = JX.keno;
    if (!st.choix.length) { this.message("Choisis d'abord 1 à 5 numéros.", "refus"); return; }
    const m = this.miser(); if (!m) return;
    const sac = Array.from({length: K.total}, (_, i) => i + 1);
    for (let i = sac.length - 1; i > 0; i--) { const j = alea(i + 1); [sac[i], sac[j]] = [sac[j], sac[i]]; }
    const tires = sac.slice(0, K.tires), h = st.choix.filter(n => tires.includes(n)).length;
    st.tires = [];
    this.message("Tirage…");
    this.animer(1200, 110, (i) => { if (i < tires.length) { st.tires = tires.slice(0, i + 1); const b = this.zJeu.querySelectorAll(".jx-kn")[tires[i] - 1]; if (b) b.classList.add("tire"); SonJeux.jouer("tic"); } },
      () => { st.tires = tires; this.finir(m, (K.gains[String(st.choix.length)] || {})[String(h)] || 0, `${h} trouvé${h > 1 ? "s" : ""} sur ${st.choix.length}`); });
  }

  /* ----- course de chevaux */
  jeu_course(z) {
    const st = this.etats.course = this.etats.course || {pos: JX.course.map(() => 0), gagnant: -1};
    this.pistes = JX.course.map(([nom, , mult], i) => el("div.jx-piste" + (i === st.gagnant ? ".gagnant" : ""), null, el("span.jx-piste-nom", {texte: `${i + 1}. ${nom}`}),
      el("div.jx-piste-voie", null, el("i.jx-cheval", {style: {left: `calc(${st.pos[i]}% - ${st.pos[i] * .22}px)`}, texte: String(i + 1)})), el("b.jx-piste-cote", {texte: fmtMult(mult)})));
    z.append(el("div.jx-scene.jx-course", null, this.pistes), el("div.petit.muted", {texte: "Parie sur un cheval :"}),
      this.choix(JX.course.map(([nom, , mult], i) => [`${i + 1}. ${nom} ${fmtMult(mult)}`, i, "ghost"]), (i) => this.course(i)));
  }
  course(choixCheval) {
    const m = this.miser(); if (!m) return;
    const st = this.etats.course;
    let t = aleaReel(), g = 0;
    for (let i = 0; i < JX.course.length; i++) { if (t < JX.course[i][1]) { g = i; break; } t -= JX.course[i][1]; }
    const fins = JX.course.map((_, i) => i === g ? 100 : 62 + aleaReel() * 33);
    st.gagnant = -1;
    this.message("Ils sont partis !");
    const pose = (f) => this.pistes.forEach((p, i) => { const v = fins[i] * f; p.querySelector(".jx-cheval").style.left = `calc(${v}% - ${v * .22}px)`; });
    this.animer(1800, 60, (i, ec) => { pose(Math.min(1, ec / 1800) * (.9 + .1 * Math.sin(i))); }, () => {
      st.pos = fins; st.gagnant = g;
      this.finir(m, g === choixCheval ? JX.course[choixCheval][2] : 0, `${JX.course[g][0]} gagne`);
    });
  }

  /* ----- tir au but : le gardien plonge au hasard */
  jeu_tirbut(z) {
    const st = this.etats.tirbut = this.etats.tirbut || {tir: -1, gardien: 1};
    const zones = ["Gauche", "Centre", "Droite"];
    const but = el("div.jx-but", null, zones.map((n, i) => el("div.jx-but-zone" + (i === st.gardien ? ".gardien" : "") + (i === st.tir ? ".tir" : ""), null,
      i === st.gardien ? el("span.jx-gardien", {texte: "▮"}) : null, i === st.tir ? el("span.jx-ballon", {texte: "●"}) : null)));
    z.append(el("div.jx-scene", null, but), this.choix(zones.map((n, i) => [`${n} ${fmtMult(JX.tirbut)}`, i]), (i) => this.tirbut(i)));
  }
  tirbut(tir) {
    const m = this.miser(); if (!m) return;
    const st = this.etats.tirbut, g = alea(3);
    this.message("Le gardien s'élance…");
    this.animer(800, 120, (i) => { st.gardien = i % 3; st.tir = -1; const zs = this.zJeu.querySelectorAll(".jx-but-zone"); zs.forEach((x, j) => x.classList.toggle("gardien", j === i % 3)); }, () => {
      st.tir = tir; st.gardien = g;
      this.finir(m, tir !== g ? JX.tirbut : 0, tir !== g ? "but !" : "arrêt du gardien");
    });
  }

  /* ----- mines : 25 cases, encaisser quand on veut */
  multMines(k, mines) { return Math.floor(JX.mines.marge * comb(25, k) / comb(25 - mines, k) * 100 + 1e-9) / 100; }
  jeu_mines(z) {
    const st = this.etats.mines = this.etats.mines || {mines: 3, vus: [], pieges: [], fini: true, mise: 0};
    const grille = el("div.jx-mines");
    for (let i = 0; i < 25; i++) {
      const vu = st.vus.includes(i), piege = st.pieges.includes(i), montre = vu || (st.fini && st.pieges.length);
      grille.append(el("button.jx-mn" + (vu ? ".vu" : "") + (montre && piege ? ".mine" : montre && st.fini && !vu ? ".cache" : ""), {type: "button",
        texte: montre ? (piege ? "✹" : "◆") : "", "aria-label": "Case " + (i + 1), onclick: () => this.minesCase(i)}));
    }
    const k = st.vus.length;
    const actions = st.fini
      ? [[`Commencer (mise ${fmtGeos(this.mise())})`, () => this.minesDebut(), "primary"]]
      : [[k ? `Encaisser ${fmtMult(this.multMines(k, st.mines))} (${fmtGeos(Math.floor(st.mise * this.multMines(k, st.mines)))})` : "Touche une case", () => { if (k) this.minesEncaisser(); }, k ? "primary" : "ghost"]];
    const nb = el("div.rapides.jx-risques", null, el("span.petit.muted", {texte: "Mines"}),
      ...JX.mines.choix.map(n => petit(String(n), () => { if (!st.fini) return; st.mines = n; st.pieges = []; st.vus = []; this.rafraichir(); }, n === st.mines ? "tab_on" : "ghost")));
    z.append(nb, el("div.jx-scene", null, grille, el("div.petit.muted", {texte: st.fini ? `Prochaine case sûre : ${fmtMult(this.multMines(1, st.mines))}` : `Suivante : ${fmtMult(this.multMines(k + 1, st.mines))}`})), this.boutonsJeu(actions));
  }
  minesDebut() {
    const st = this.etats.mines;
    const m = this.miser(); if (!m) return;
    const l = [];
    while (l.length < st.mines) { const n = alea(25); if (!l.includes(n)) l.push(n); }
    Object.assign(st, {pieges: l, vus: [], fini: false, mise: m});
    this.message("Trouve les cases sûres, puis encaisse.");
    this.rafraichir();
  }
  minesCase(i) {
    const st = this.etats.mines;
    if (st.fini || st.vus.includes(i) || this.occupe) return;
    st.vus.push(i);
    if (st.pieges.includes(i)) { st.fini = true; this.finir(st.mise, 0, "une mine !"); return; }
    SonJeux.jouer("tic");
    if (st.vus.length === 25 - st.mines) { this.minesEncaisser(); return; }
    this.rafraichir();
  }
  minesEncaisser() {
    const st = this.etats.mines;
    if (st.fini || !st.vus.length) return;
    st.fini = true;
    this.finir(st.mise, this.multMines(st.vus.length, st.mines), `${st.vus.length} case${st.vus.length > 1 ? "s" : ""} sûre${st.vus.length > 1 ? "s" : ""}`);
  }

  /* ----- fusée : choisir où descendre avant l'explosion */
  jeu_fusee(z) {
    const st = this.etats.fusee = this.etats.fusee || {cible: 2, val: 1, explose: false};
    this.fuVal = el("b.jx-fusee-val" + (st.explose ? ".explose" : ""), {texte: fmtMult(st.val.toFixed(2))});
    const cibles = el("div.rapides.jx-risques", null, el("span.petit.muted", {texte: "Descendre à"}),
      ...JX.fusee.cibles.map(c => petit(fmtMult(c), () => { if (this.occupe) return; st.cible = c; this.rafraichir(); }, c === st.cible ? "tab_on" : "ghost")));
    z.append(cibles, el("div.jx-scene.jx-fusee", null, imgSprite("fusee", 5, ".jx-fusee-img" + (st.explose ? ".explose" : "")), this.fuVal,
      el("div.petit.muted", {texte: `Chances d'atteindre ${fmtMult(st.cible)} : ${Math.round(JX.fusee.marge / st.cible * 1000) / 10} %`.replace(".", ",")})),
      this.boutonsJeu([[`Décoller (gain ${fmtMult(st.cible)})`, () => this.fusee(), "primary"]]));
  }
  fusee() {
    const m = this.miser(); if (!m) return;
    const st = this.etats.fusee, cible = st.cible;
    const crash = Math.min(JX.fusee.max, Math.max(1, Math.floor(JX.fusee.marge / (1 - aleaReel()) * 100) / 100));
    const ok = crash >= cible, haut = ok ? cible : crash;
    st.explose = false;
    this.message("Décollage…");
    this.animer(400 + Math.min(1800, Math.log(haut) * 900), 50, (i, ec) => {
      const f = Math.min(1, ec / (400 + Math.min(1800, Math.log(haut) * 900)));
      this.fuVal.textContent = fmtMult((Math.exp(Math.log(haut) * f)).toFixed(2));
    }, () => { st.val = haut; st.explose = !ok; this.finir(m, ok ? cible : 0, ok ? `descendu à ${fmtMult(cible)} (explosion à ${fmtMult(crash.toFixed(2))})` : `explosion à ${fmtMult(crash.toFixed(2))}`); });
  }

  /* ----- plus haut, plus bas (as = 1, roi = 13 ; égalité perdue) */
  multHilo(p) { return p > 0 ? Math.floor(JX.hilo.marge / p * 100) / 100 : 0; }
  jeu_hilo(z) {
    const st = this.etats.hilo = this.etats.hilo || {c: carteHasard(), avant: null};
    const r = st.c.r, ph = (13 - r) / 13, pb = (r - 1) / 13;
    z.append(el("div.jx-scene", null, el("div.jx-cartes", null, st.avant ? this.carte(st.avant) : null, st.avant ? el("span.jx-fleche", {texte: "→"}) : null, this.carte(st.c))),
      this.boutonsJeu([[ph ? `Plus haut ${fmtMult(this.multHilo(ph))}` : "Plus haut : impossible", () => { if (ph) this.hilo("haut"); }, ph ? "primary" : "ghost"],
        [pb ? `Plus bas ${fmtMult(this.multHilo(pb))}` : "Plus bas : impossible", () => { if (pb) this.hilo("bas"); }, pb ? "primary" : "ghost"]]),
      el("div.petit.muted", {texte: "As = 1, valet = 11, dame = 12, roi = 13. Une carte égale fait perdre."}));
  }
  hilo(sens) {
    const st = this.etats.hilo, r = st.c.r, p = sens === "haut" ? (13 - r) / 13 : (r - 1) / 13, mult = this.multHilo(p);
    const m = this.miser(); if (!m) return;
    const n = carteHasard();
    this.message("Carte suivante…");
    this.animer(500, 100, () => {}, () => {
      const ok = sens === "haut" ? n.r > r : n.r < r;
      st.avant = st.c; st.c = n;
      this.finir(m, ok ? mult : 0, `${RANGS[r]} puis ${RANGS[n.r]}`);
    });
  }

  /* ----- baccara simplifié : deux cartes chacun, total modulo 10 */
  jeu_baccara(z) {
    const st = this.etats.baccara;
    const val = (c) => c.r >= 10 ? 0 : c.r, tot = (mn) => mn.reduce((a, c) => a + val(c), 0) % 10;
    const ligne = (t, mn) => el("div.jx-main", null, el("div.petit.muted", {texte: t + (mn ? "  ·  " + tot(mn) : "")}), el("div.jx-cartes", null, (mn || []).map(c => this.carte(c))));
    const b = JX.baccara;
    z.append(el("div.jx-scene.jx-table-bj", null, ligne("Joueur", st && st.j), ligne("Banquier", st && st.b)),
      this.choix([[`Joueur ${fmtMult(b.joueur)}`, "joueur"], [`Banquier ${fmtMult(b.banquier)}`, "banquier"], [`Égalité ${fmtMult(b.egalite)}`, "egalite", "ghost"]], (c) => this.baccara(c)),
      el("div.petit.muted", {texte: "Total des deux cartes, sans la dizaine (10 et figures = 0). En cas d'égalité, les paris Joueur et Banquier sont rendus."}));
  }
  baccara(pari) {
    const m = this.miser(); if (!m) return;
    const j = [carteHasard(), carteHasard()], b = [carteHasard(), carteHasard()];
    const val = (c) => c.r >= 10 ? 0 : c.r, tj = (val(j[0]) + val(j[1])) % 10, tb = (val(b[0]) + val(b[1])) % 10;
    const res = tj > tb ? "joueur" : tb > tj ? "banquier" : "egalite";
    this.message("Distribution…");
    this.animer(600, 120, () => SonJeux.jouer("tic"), () => {
      this.etats.baccara = {j, b};
      const mult = pari === res ? JX.baccara[pari] : res === "egalite" && JX.baccara.rendu_egalite ? 1 : 0;
      this.finir(m, mult, `${tj} contre ${tb}`);
    });
  }

  /* ----- grand ou petit : trois dés */
  jeu_sicbo(z) {
    const st = this.etats.sicbo = this.etats.sicbo || {d: [2, 4, 5]};
    this.zDes = el("div.jx-des", null, st.d.map(v => this.de(v)));
    const g = JX.sicbo;
    z.append(el("div.jx-scene", null, this.zDes, el("div.jx-total", {texte: `Total : ${st.d[0] + st.d[1] + st.d[2]}`})),
      this.choix([[`Petit (4 – 10) ${fmtMult(g.petit)}`, "petit"], [`Grand (11 – 17) ${fmtMult(g.grand)}`, "grand"], [`Triple ${fmtMult(g.triple)}`, "triple", "ghost"]], (c) => this.sicbo(c)),
      el("div.petit.muted", {texte: "Un triple (trois dés pareils) fait perdre les paris Petit et Grand."}));
  }
  sicbo(pari) {
    const m = this.miser(); if (!m) return;
    const d = [1 + alea(6), 1 + alea(6), 1 + alea(6)], t = d[0] + d[1] + d[2], triple = d[0] === d[1] && d[1] === d[2];
    this.message("Les dés roulent…");
    this.animer(900, 80, () => { this.zDes.replaceChildren(this.de(1 + alea(6)), this.de(1 + alea(6)), this.de(1 + alea(6))); SonJeux.jouer("tic"); }, () => {
      this.etats.sicbo.d = d;
      const ok = pari === "triple" ? triple : !triple && (pari === "petit" ? t <= 10 : t >= 11);
      this.finir(m, ok ? JX.sicbo[pari] : 0, triple ? `triple ${d[0]}` : `total ${t}`);
    });
  }

  /* ----- poker express : cinq cartes, sans échange */
  mainPoker(cs) {
    const rs = cs.map(c => c.r === 1 ? 14 : c.r).sort((a, b) => a - b), couleur = cs.every(c => c.c === cs[0].c);
    const cpt = {}; for (const r of rs) cpt[r] = (cpt[r] || 0) + 1;
    const n = Object.values(cpt).sort((a, b) => b - a);
    const uniq = Object.keys(cpt).length === 5;
    const suite = uniq && (rs[4] - rs[0] === 4 || rs.join() === "2,3,4,5,14");
    if (suite && couleur) return rs[0] === 10 ? "royale" : "quinte_flush";
    if (n[0] === 4) return "carre";
    if (n[0] === 3 && n[1] === 2) return "full";
    if (couleur) return "couleur";
    if (suite) return "quinte";
    if (n[0] === 3) return "brelan";
    if (n[0] === 2 && n[1] === 2) return "deux_paires";
    if (n[0] === 2 && Object.entries(cpt).some(([r, k]) => k === 2 && +r >= 11)) return "paire_valets";
    return "";
  }
  jeu_poker(z) {
    const st = this.etats.poker;
    const noms = {royale: "Quinte royale", quinte_flush: "Quinte flush", carre: "Carré", full: "Full", couleur: "Couleur", quinte: "Quinte", brelan: "Brelan", deux_paires: "Deux paires", paire_valets: "Paire de valets ou mieux"};
    z.append(el("div.jx-scene", null, el("div.jx-cartes.jx-cartes5", null, st ? st.cs.map(c => this.carte(c)) : Array.from({length: 5}, () => this.carte(null, true))),
      el("div.jx-total", {texte: st ? (noms[st.main] || "Rien") : "Cinq cartes"})),
      this.boutonsJeu([[`Distribuer (mise ${fmtGeos(this.mise())})`, () => this.poker(), "primary"]]),
      this.tableGains(Object.entries(JX.poker).map(([k, v]) => [noms[k], fmtMult(v)])));
    this.nomsPoker = noms;
  }
  poker() {
    const m = this.miser(); if (!m) return;
    const pris = new Set(), cs = [];
    while (cs.length < 5) { const k = alea(52); if (pris.has(k)) continue; pris.add(k); cs.push({r: 1 + (k % 13), c: Math.floor(k / 13)}); }
    const main = this.mainPoker(cs);
    this.message("Distribution…");
    this.animer(600, 110, () => SonJeux.jouer("tic"), () => { this.etats.poker = {cs, main}; this.finir(m, JX.poker[main] || 0, this.nomsPoker[main] || "rien"); });
  }

  /* ----- bataille : la carte la plus forte (as le plus fort) */
  jeu_bataille(z) {
    const st = this.etats.bataille;
    z.append(el("div.jx-scene.jx-table-bj", null,
      el("div.jx-main", null, el("div.petit.muted", {texte: "Toi"}), el("div.jx-cartes", null, st ? this.carte(st.t) : this.carte(null, true))),
      el("div.jx-main", null, el("div.petit.muted", {texte: "Croupier"}), el("div.jx-cartes", null, st ? this.carte(st.c) : this.carte(null, true)))),
      this.boutonsJeu([[`Retourner les cartes ${fmtMult(JX.bataille)}`, () => this.bataille(), "primary"]]), el("div.petit.muted", {texte: "Égalité : mise rendue."}));
  }
  bataille() {
    const m = this.miser(); if (!m) return;
    const t = carteHasard(), c = carteHasard(), v = (x) => x.r === 1 ? 14 : x.r;
    this.animer(500, 120, () => SonJeux.jouer("tic"), () => { this.etats.bataille = {t, c}; this.finir(m, v(t) > v(c) ? JX.bataille : v(t) === v(c) ? 1 : 0, `${RANGS[t.r]} contre ${RANGS[c.r]}`); });
  }

  /* ----- pierre, papier, ciseaux */
  jeu_ppc(z) {
    const st = this.etats.ppc;
    const N = ["Pierre", "Papier", "Ciseaux"], S = ["●", "▭", "✂"];
    z.append(el("div.jx-scene", null, el("div.jx-ppc", null, el("span", {texte: st ? S[st.t] : "?"}), el("i", {texte: "contre"}), el("span", {texte: st ? S[st.a] : "?"}))),
      this.choix(N.map((n, i) => [`${S[i]} ${n}`, i]), (i) => this.ppc(i)), el("div.petit.muted", {texte: `Victoire ${fmtMult(JX.ppc)} · égalité : mise rendue.`}));
  }
  ppc(t) {
    const m = this.miser(); if (!m) return;
    const a = alea(3), N = ["pierre", "papier", "ciseaux"], r = (t - a + 3) % 3;
    this.animer(600, 120, () => SonJeux.jouer("tic"), () => { this.etats.ppc = {t, a}; this.finir(m, r === 1 ? JX.ppc : r === 0 ? 1 : 0, `${N[t]} contre ${N[a]}`); });
  }

  /* ----- trois coffres */
  jeu_coffres(z) {
    const st = this.etats.coffres;
    const g = el("div.jx-coffres", null, [0, 1, 2].map(i => el("button.jx-coffre" + (st && st.choix === i ? ".choisi" : "") + (st ? ".ouvert" : ""), {type: "button", "aria-label": "Coffre " + (i + 1),
      onclick: () => { if (!this.occupe) this.coffres(i); }}, imgSprite("hkc_cle", 3), el("b", {texte: st ? fmtMult(st.v[i]) : "?"}))));
    z.append(el("div.jx-scene", null, g, el("div.petit.muted", {texte: "Touche un coffre : un contient ×2,5, un ×0,4, un est vide."})));
  }
  coffres(i) {
    const m = this.miser(); if (!m) return;
    const v = JX.coffres.slice();
    for (let k = v.length - 1; k > 0; k--) { const j = alea(k + 1); [v[k], v[j]] = [v[j], v[k]]; }
    this.animer(500, 120, () => SonJeux.jouer("tic"), () => { this.etats.coffres = {v, choix: i}; this.finir(m, v[i], "coffre " + (i + 1)); });
  }

  /* ----- chiffre mystère (1 à 10) */
  jeu_mystere(z) {
    const st = this.etats.mystere;
    z.append(el("div.jx-scene", null, el("div.jx-gros-chiffre", {texte: st ? String(st.n) : "?"})),
      this.choix(Array.from({length: 10}, (_, i) => [String(i + 1), i + 1, "ghost"]), (n) => this.mystere(n)),
      el("div.petit.muted", {texte: `Trouve le nombre exact : ${fmtMult(JX.mystere)}`}));
  }
  mystere(c) {
    const m = this.miser(); if (!m) return;
    const n = 1 + alea(10);
    this.animer(700, 70, () => { const x = this.zJeu.querySelector(".jx-gros-chiffre"); if (x) x.textContent = String(1 + alea(10)); }, () => { this.etats.mystere = {n}; this.finir(m, n === c ? JX.mystere : 0, `c'était ${n}`); });
  }

  /* ----- fléchettes */
  jeu_flechettes(z) {
    const st = this.etats.flechettes;
    const cible = el("div.jx-cible", null, el("i.a3"), el("i.a2"), el("i.a1"), el("i.c"), st ? el("b.jx-dard", {style: {left: st.x + "%", top: st.y + "%"}}) : null);
    z.append(el("div.jx-scene", null, cible), this.boutonsJeu([["Lancer", () => this.flechettes(), "primary"]]),
      this.tableGains(JX.flechettes.map(([n, , mm]) => [n, fmtMult(mm)])));
  }
  flechettes() {
    const m = this.miser(); if (!m) return;
    let t = aleaReel(), k = JX.flechettes.length - 1;
    for (let i = 0; i < JX.flechettes.length; i++) { if (t < JX.flechettes[i][1]) { k = i; break; } t -= JX.flechettes[i][1]; }
    const bornes = [[0, .1], [.12, .3], [.32, .55], [.57, .85], [.88, .98]][k], r = bornes[0] + aleaReel() * (bornes[1] - bornes[0]), a = aleaReel() * Math.PI * 2;
    this.animer(500, 100, () => {}, () => { this.etats.flechettes = {x: 50 + 50 * r * Math.cos(a), y: 50 + 50 * r * Math.sin(a)}; this.finir(m, JX.flechettes[k][2], JX.flechettes[k][0].toLowerCase()); });
  }

  /* ----- craps : ligne de passe */
  jeu_craps(z) {
    const st = this.etats.craps || {lancers: []};
    this.zDes = el("div.jx-des", null, (st.lancers.length ? st.lancers[st.lancers.length - 1] : [3, 4]).map(v => this.de(v)));
    z.append(el("div.jx-scene", null, this.zDes, el("div.jx-histo.jx-histo-craps", null, st.lancers.map(l => el("span", {texte: String(l[0] + l[1])})))),
      this.boutonsJeu([[`Lancer (gain ${fmtMult(JX.craps)})`, () => this.craps(), "primary"]]),
      el("div.petit.muted", {texte: "7 ou 11 au premier lancer : gagné. 2, 3 ou 12 : perdu. Sinon ce total devient le point : il faut le refaire avant un 7."}));
  }
  craps() {
    const m = this.miser(); if (!m) return;
    const L = [], de = () => [1 + alea(6), 1 + alea(6)];
    let l = de(), s = l[0] + l[1], gagne = null; L.push(l);
    if ([7, 11].includes(s)) gagne = true; else if ([2, 3, 12].includes(s)) gagne = false;
    const point = s;
    while (gagne === null) { l = de(); L.push(l); const t = l[0] + l[1]; if (t === point) gagne = true; else if (t === 7) gagne = false; }
    this.message(gagne === null ? "" : "Les dés roulent…");
    this.animer(Math.min(3000, 380 * L.length), 380, (i) => { if (i < L.length) { this.zDes.replaceChildren(this.de(L[i][0]), this.de(L[i][1])); SonJeux.jouer("tic"); } },
      () => { this.etats.craps = {lancers: L}; this.finir(m, gagne ? JX.craps : 0, L.length === 1 ? `${point} au premier lancer` : `point ${point}, ${L.length} lancers`); });
  }

  /* ----- sous le seuil : dé de 1 à 100 */
  multSeuil(s) { return Math.floor(JX.seuil.marge * 100 / s) / 100; }
  jeu_seuil(z) {
    const st = this.etats.seuil;
    z.append(el("div.jx-scene", null, el("div.jx-gros-chiffre", {texte: st ? String(st.n) : "–"})), el("div.petit.muted", {texte: "Gagné si le dé (1 à 100) fait au plus :"}),
      this.choix(JX.seuil.seuils.map(s => [`≤ ${s}  ${fmtMult(this.multSeuil(s))}`, s, "ghost"]), (s) => this.seuil(s)));
  }
  seuil(s) {
    const m = this.miser(); if (!m) return;
    const n = 1 + alea(100);
    this.animer(700, 60, () => { const x = this.zJeu.querySelector(".jx-gros-chiffre"); if (x) x.textContent = String(1 + alea(100)); }, () => { this.etats.seuil = {n}; this.finir(m, n <= s ? this.multSeuil(s) : 0, `${n} (seuil ${s})`); });
  }

  /* ----- la tour : une porte piégée sur trois par étage */
  multTour(k) { return Math.floor(JX.tour.marge * Math.pow(1.5, k) * 100 + 1e-9) / 100; }
  jeu_tour(z) {
    const st = this.etats.tour = this.etats.tour || {etage: 0, fini: true, mise: 0, pieges: [], choix: []};
    const E = JX.tour.etages, t = el("div.jx-tour");
    for (let e = E - 1; e >= 0; e--) {
      const actif = !st.fini && e === st.etage, passe = e < st.etage || (st.fini && e <= st.etage && st.choix[e] !== undefined);
      t.append(el("div.jx-etage" + (actif ? ".actif" : ""), null, el("span.jx-etage-mult", {texte: fmtMult(this.multTour(e + 1))}),
        ...[0, 1, 2].map(d => {
          const ch = st.choix[e] === d, piege = st.pieges[e] === d, montre = passe || (st.fini && st.pieges.length && e <= st.etage);
          return el("button.jx-door" + (ch ? ".choisie" : "") + (montre && piege ? ".piege" : ""), {type: "button", "aria-label": `Étage ${e + 1}, porte ${d + 1}`,
            onclick: () => { if (actif) this.tourPorte(d); }, texte: montre && piege ? "✹" : ch ? "✓" : ""});
        })));
    }
    const k = st.etage;
    const actions = st.fini ? [[`Commencer (mise ${fmtGeos(this.mise())})`, () => this.tourDebut(), "primary"]]
      : [[k ? `Encaisser ${fmtMult(this.multTour(k))} (${fmtGeos(Math.floor(st.mise * this.multTour(k)))})` : "Choisis une porte", () => { if (k) this.tourEncaisser(); }, k ? "primary" : "ghost"]];
    z.append(el("div.jx-scene", null, t), this.boutonsJeu(actions));
  }
  tourDebut() {
    const m = this.miser(); if (!m) return;
    Object.assign(this.etats.tour, {etage: 0, fini: false, mise: m, pieges: Array.from({length: JX.tour.etages}, () => alea(3)), choix: []});
    this.message("Choisis une porte à chaque étage.");
    this.rafraichir();
  }
  tourPorte(d) {
    const st = this.etats.tour;
    if (st.fini || this.occupe) return;
    st.choix[st.etage] = d;
    if (st.pieges[st.etage] === d) { st.fini = true; this.finir(st.mise, 0, `piège à l'étage ${st.etage + 1}`); return; }
    SonJeux.jouer("tic");
    st.etage++;
    if (st.etage >= JX.tour.etages) { this.tourEncaisser(); return; }
    this.rafraichir();
  }
  tourEncaisser() {
    const st = this.etats.tour;
    if (st.fini || !st.etage) return;
    st.fini = true;
    this.finir(st.mise, this.multTour(st.choix.length), `${st.choix.length} étage${st.choix.length > 1 ? "s" : ""}`);
  }

  /* ----- couleur de la carte */
  jeu_couleur(z) {
    const st = this.etats.couleur, g = JX.couleur;
    z.append(el("div.jx-scene", null, el("div.jx-cartes", null, st ? this.carte(st.c) : this.carte(null, true))),
      this.choix([[`Rouge ${fmtMult(g.couleur)}`, "rouge", "jx-rouge"], [`Noir ${fmtMult(g.couleur)}`, "noir", "jx-noir"]], (c) => this.couleur(c)),
      this.choix(ENSEIGNES.map((e, i) => [`${e} ${fmtMult(g.enseigne)}`, i, "ghost"]), (c) => this.couleur(c)));
  }
  couleur(pari) {
    const m = this.miser(); if (!m) return;
    const c = carteHasard(), rouge = c.c === 1 || c.c === 2;
    const ok = pari === "rouge" ? rouge : pari === "noir" ? !rouge : c.c === pari;
    this.animer(500, 110, () => SonJeux.jouer("tic"), () => { this.etats.couleur = {c}; this.finir(m, ok ? (typeof pari === "number" ? JX.couleur.enseigne : JX.couleur.couleur) : 0, `${RANGS[c.r]} ${ENSEIGNES[c.c]}`); });
  }
}
function comb(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
