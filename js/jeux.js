/* Géos (monnaie virtuelle), mini-jeux de casino, boutique et autocollants des notes.
   Mêmes règles, mêmes gains et mêmes dessins que sur le PC (constantes JX produites par le même fichier de référence). */
"use strict";

/* <JX> */
const JX = {"sprites":{"etoile":"O7a4a00Yffd23fWfff6c2Df0a500;12:5.OO10.OYO8.OYYO4.5OYWY5O4YW4YDO.O7YDO3.O5YDO4.O5YDO3.O3YOOYYDO..OYYO..OYDO.OYDO4.ODD4O6.3O","etoiles":"O5a3a8aYffe066Pff8fd1C7fd3ff;12:..O10.OYO5.O..O3YO3.OPO..OYO3.O3PO..O5.OPO10.O6.O10.OCO8.O3CO8.OCO3.O6.O3.OYO10.O..","coeur":"O6b0f1fRff3b5cWffd0d8Dc81e3c;12:14.3O..3O3.O3RO.O3ROORWWRROO3RDORW8RDO10RD.O8RD3.O6RD5.O4RD7.ORRD9.OD17.","coeurs":"O7a1040Pff7ab8Rff3b5cWffe0ef;12:.OO.OO6.OPWOPPO5.O5PO6.O3PO8.OPO.OO.OO4.O.ORWORRO5.O5RO6.O3RO8.ORO10.O27.","soleil":"Oa35a00Yffd23fRff9f1cWfff3b0Df0a500;12:5.R7.R3.R3.R4.R5.R7.4O7.OYWYYO3.RR.O4YO.RR3.O4YO6.O3YDO7.4O6.R5.R4.R3.R3.R7.R6.","lune":"O3b3f6bYfff0a8De3c860Sffffff;12:4.4O6.OO3YO5.O3YOO6.OYYO7.OYYDO4.S..OYYDO3.3S.OYYDO4.S..O3YDO7.O3YDOO5.OO5Y3O4.OO4YO7.4O3.","nuage":"O5b7290WffffffBd8e6f5;12:28.3O8.O3WO6.O5WOO3.OO7WO.O10WOO9WBOOB7WBBO.O8BO3.8O14.","eclair":"O6b4a00Yffe14dWfffbe0;12:6.4O7.OYYO7.OYWO7.OYYO7.OYY5O3.O7YO3.5OYYO7.OYYO7.OYYO7.OYYO8.OYO9.OO8.","arcenciel":"Rff4d4dAff9f1cYffe14dG3ddc84B3aa0ffV9b5cffWffffff;12:15.6R5.R6AR3.RA6YAR.RAY6GYARRAYG4BGYARRAYGBVVBGYARRAYGBV.VBGYA3WGBV..9W3.4W.3W5.WW13.","fleur":"O7a1f5cPff8fd1Yffd23fG3ba55cD1f6b38;12:4.3O8.O3PO5.3O3P3O..O3POYO3PO.O3P3Y3PO..4OY4O5.O3PO8.3O10.G..DD4.DD.G.DGD4.DGDGDD9.G6.","chat":"O3a2a1eAffa94dWfff4e6Pff8fa3K1a1a1a;12:O9.O.OO7.OO.OAO5.OAO.OAA5OAAO.O9AO.OAK5AKAO.OAK5AKAO.O3AWPW3AO..OAA3WAAO4.OO3AOO7.3O17.","chien":"O3a2a1eBc98b52D7a4a24Wfff4e6K1a1a1aPff6b81;12:.OO5.OO..ODDO3.ODDO.ODD5ODDO.ODD5BDDO.ODBK3BKBDO..O7BO3.OBB3WBBO3.OBWWKWWBO4.O5WO5.OOWPWOO7.OPO10.O6.","renard":"O4a1e00Aff7a1aWffffffK1a1a1a;12:O9.O.OO7.OO.OAO5.OAO.OAA5OAAO.O9AO.OWAK3AKAWO.OWW5AWWO..O7WO4.O5WO6.OWKWO8.3O17.","hibou":"O2e1f12B8b5a2bLc08a52WffffffK1a1a1aYffb703;12:.O7.O3.OO5.OO3.OB5OBO..OB3WB3WBO.OBWKWBWKWBO.OB3WY3WBO.O4BY4BO.OBLBLBLBLBO.OBBLBLBLBBO..O7BO4.OYO.OYO15.","grenouille":"O123d1cG4cd964D2a9d4bWffffffK1a1a1aPff8fa3;12:13.3O3.3O..O3WO.O3WO.OWKW3OWKWO.O9GO.O9GO.OGP5GPGO.OGO5GOGO..OG5OGO3.OD5GDO..OG7OGO.OO7.OO.","poisson":"O0b3d5cB3aa0ffL9ad4ffWffffffK1a1a1aYffd23f;12:16.4O6.OO4BOO3.OBBL4BO.OOBWKBL4B3O5BL4BOO6BL3BO.O8BOO..OO4BOO.O4.OYYO9.OO17.","papillon":"O2a1d3aPc084fcMf472b6Yfde047K1a1a1a;12:..O5.O6.O3.O4.3O.O.O.3O.OPPOOKOOPPO.OPYPMKMPYPO.O3PMKM3PO..OPPOKOPPO3.OMMOKOMMO..OMYMOKOMYMO.OMMO.K.OMMO..OO5.OO14.","champignon":"O4a0f0fRe63946WffffffCf5e6c8K1a1a1a;12:4.4O6.OO4ROO3.ORRWW4RO..OR3WRRWRO.ORRWWRR3WROO7RWWR13O3.O4CO6.O4CO6.O4CO6.O4CO7.4O4.","gateau":"O4a2a14Cffe0efPff8fd1Bc98b52Yffd23fRe63946;12:5.Y11.R11.O8.7O4.O7CO3.OPCPCPCPO3.O7BO3.O7CO3.O7BO3.O7BO..11O13.","fusee":"O1f2a44Weef3ffRff4d4dB3aa0ffYffd23fAff9f1c;12:5.OO9.ORRO8.OWWO7.OWBBWO6.OWBBWO6.O4WO5.OROWWORO3.ORR4WRRO..OO.4O.OO6.YY9.YAAY9.AA5.","pouce":"O5a3a1aSffd6a5De8a96bB3aa0ff;12:4.OO9.OSSO8.OSSO7.OSSO6.3OSS5O..OBO7SO.OBO6SDO.OBO6SO..OBO6SDO.OBO6SO..4O4DO7.4O4.","sourire":"O7a4a00Yffd23fK3a2400Pff8fa3Wfff6c2;12:4.4O6.OO4YOO3.OYW6YO..OYYKYYKYYO.O3YKYYK3YOO10YOOYP6YPYOOYYK4YKYYO.OYY4KYYO..O8YO3.OO4YOO6.4O4.","trophee":"O5a3a00Yffd23fWfff6c2De0a100B7a4a24;12:13OYYW6YDOOYOW5YD3OYO6YDYO.OO6YDO4.O4YDO6.OYYDO8.OYO9.OYO8.OYYDO6.O5BO5.7O..","couronne":"O5a3a00Yffd23fDe0a100Re63946B3aa0ffWfff6c2;12:12.O4.O4.O.OO..OYO..OO.OYO.OYO.OYO.OYYO3YOYYO.OYW6YDO.O8YDO.OYRYYBYYRDO.O8YDO.O9DO.11O13.","cristal":"O1d3557B48cae4Lade8f4WffffffD0077b6;12:15.6O5.OLWLLBBO3.OLWLL3BDO.13OLL6BDDO.OLL5BDO3.OL4BDO5.OLBBDO7.OLDO9.OO17.","cerise":"O4a0f0fRe63946Wffd0d8G3ba55cD1f6b38;12:8.DD9.DGGD7.D.DD7.D..D7.D4.D4.3O3.3O..O3RO.O3ROORW3ROW3ROO5ROO3ROO5RO.3O..5O18.","citron":"O6b5a00Yffe14dWfffbe0De0c200G3ba55c;12:20.GG6.4OG5.OO4YOO3.OYWW5YO.OYW7YDOO9YDOO8YDDO.O6YDDO3.OO4DOO6.4O16.","raisin":"O2a0f3aV9b5cffLc9a8ffG3ba55c;12:5.GG9.G9.OO.OO.OO3.OLVOLVOLVO..OVVOVVOVVO3.OOLVOLVO5.OVVOVVO6.OOLVO8.OVVO9.OO28.","cloche":"O5a3a00Yffd23fWfff6c2De0a100;12:5.OO9.OYYO7.OYWYYO5.OYW3YDO4.OYW3YDO4.O5YDO3.O7YDO..O7YDO.O9YD13O5.OO17.","sept":"O5a0000Rff3b3bWffd0d0;12:12.11O.OR7WRO.O9RO.7ORRO8.ORRO7.ORRO8.ORRO7.ORRO8.ORRO8.4O16.","geo":"O6b4a00Yffd23fWfff6c2De0a100Bb07800;12:4.4O6.OO4YOO3.OYW5YDO..OWYYOOYYDO.O3YOWDOYYDOOYYOWWDDOYDOOYYO3DBOYDOO3YODBOYYDO.O3YOOYYDO..O6YDBO3.OO4BOO6.4O4.","geo_hk":"K0b0d12Bbcd3e6Le4eff8WffffffS6f88a3;16:4.3K11.3KL8K4.KLWLLBK4LK3.KKLWLBBLWWLBKK..K3LBBS3LBBSK..KKLBBSSLLBBSKK.KKLSBSSWLSBSS4KLWLLSWWLBS3LBKKLWLBBLLBBSWWBBKKLLBBSLBBSSLBBSKKLBBSSLB3SBBSS3KBSWWLBLWLBSSKK.KK3LBBLW3BKK3.KLLBBSL3BSK4.KKBBSS3BSKK5.10K3.","piece":{"pal":{"O":"O","D":"D","A":"A","L":"L","W":"W"},"rows":[".....OO.....","...OOLDOO...","..OLLAADDO..",".OLLWAAAADO.",".OLAADDAADO.","OLAADLLDAADO","ODAADLLDAADO",".ODAADDAADO.",".ODAAAAAADO.","..ODDAADDO..","...OODDOO...",".....OO....."]},"hkc_banc":"K0b0d12M3a4256Wc9c2aeLece6d4D7a7462;24:103.10K13.K10WK11.K12WK9.K4W3MW3M3WK7.K3WMW3MW3M4WK5.K3WMMW3MW3MWM3WK4.KWW3MW3MW3MWMMWWK4.K18WK4.20K3.K20LK..K20LK..K20DK3.KKMM12KMMKK5.KMMK10.KMMK6.KMMK10.KMMK6.KMMK10.KMMK5.K4MK8.K4MK5.4K10.4K51.","hkc_lanterne":"K0b0d12M2f3646D4c5568V9fd8e6Je8fbffWffffffG1d3a46H2f6274;24:10.5K18.K5MK16.K7MK14.KGM5VMK13.KGGM5VMGK12.KGHMV3JVMGK11.KGGHMVJWJVMGGK10.KGGHMV3JVMGGK11.KGHMV3JVMGK12.KGGM5VMGK13.KGM5VMK15.K7MK16.KK3MKK18.KMDMK19.KMDMK19.KMDMK19.KMDMK19.KMDMK19.KMDMK19.KMDMK18.KKMDMKK16.K7MK15.K7MK16.7K8.","hkc_cristal":"K0b0d12B4fb6e8La8e2fbD2a6fa8WffffffR3a3f4c;24:59.KK21.KLBK19.KLLBBK18.KLLBBK17.KWWL3BK15.KLWWL4B3K12.KLWWL4BKBDK9.3KLWWL6BDK8.KBDKLWWL6BDDK6.KBBDDLWWL6BDDK6.KBBDD4L6B3DK4.K3BDD4L6B3DK4.K3B3D3L6B3DK4.K3B3D3L6B3DK4.K3B3D3L6B3DK4.K3B3D3L6BDDK6.KBB3D3L6BDDK6.KBB3D3L6BDDK6.KBB3D6K3BDDKK4.K19RK3.K19RK4.19K..","hkc_champignon":"K0b0d12Ce07a3cD9c4422Pffd2a8Te8e2d0Sa9a290;24:55.10K12.KK4CPP4CKK9.K6CPP6CK7.KCCPP12CK5.K3CPP7CPP4CK4.K12CPP4CK4.K5CPP11CK4.K5CPP11CK4.K18DK4.K18DK5.7K3TSS6K12.K3TSSK17.K3TSSK17.K3TSSK17.K3TSSK17.K3TSSK17.K3TSSK17.K3TSSK16.KK3TSSKK14.K9SK13.K9SK14.9K7.","hkc_coquille":"K0b0d12Bd9c9a4D8a7350Lf4ead2WffffffP5a5f6e;24:57.6K16.KK6BKK12.KK10BKK9.K5B3D6BK7.K3BLDDLBBDD5BK6.KBBLDW3L3BD4BK5.K3BD3L3D3BD4BK4.KBBDBLDDLBBDDBBD3BK4.KBBDBBD5BDBBD3BK4.KBBDBDBB3DBDBBD3BK4.KBBDBDBBD3BDBBDBBDK4.KBBDBDDBDDBDDBBDBDBK4.KBBDBBD3BD3BDBBDBK4.KBBDBBDD5BD3BDBK5.KBBD3B5D3BDBK6.K3BD9BDBBK7.K3BDD5BDDBBKK6.K17PK5.K17PK6.17K51.","hkc_epines":"K0b0d12V3e5a47D2a3c31Pc9d8c4;24:21.KK21.KVVK19.K3VK18.KVPPK17.KK3VK9.K7.KPPVVK4.4K.KPK6.K3VK4.K4DKKPKK4.K3VK5.K6D3P4K3VK7.3K4DPP6VK11.3KDPP4VPK11.K.KV3D3VKPK10.KPK3V3D3KPK11.KP3VKDDK..K11.K3V3K3DK13.KVVK.K3PDDKK10.K3VK..3K4DKK7.K3VK6.KK4D3K4.KVVK9.KDP4DKK..3VK10.KP6DK.VVK11.KP3K3DK.KK13.K3.3K50.","hkc_cle":"K0b0d12Bb8c4d6Leef3fa;24:53.4K18.KK4LKK15.K5L3BK14.K4L4BK13.K3L4K3BK12.K3LK..K3BK12.KLLBK..K3BK12.KLBB4K3BK13.K9BK13.K10BK13.KK4BKK3BK14.4K..K3BK20.K3BK20.K3BK20.K3BK19.K4BK17.K6BK15.K3BKK3BK14.KBBK.K3BK15.KK.K3BK18.K3BK19.KBBK5.","hkc_fiole":"K0b0d12C8a6a4aVcfe3ecB3aa7e8D1f6db0L9fdcffWffffff;24:34.5K18.K5CK17.K5CK17.K5VK17.K5VK17.K5VK17.K5VK16.K6VK15.K8VK13.K10VK11.KVV3W7VK9.KVVB3W4BDDVVK8.KV9B3DVK8.KV9B3DVK8.KV9B3DVK8.KV9B3DVK8.KVV7BWDDVVK9.KV3BL4BDDVK11.KV7BDVK13.KVV4BVVK15.K6VK17.6K33.","hkc_cocon":"K0b0d12F59617aC3a4058D2a2f42B4fc3ffWd8f3ff;24:10.KFFK20.KFFK20.KFFK20.KFFK18.KKDDCCKK15.KCDD5CK13.KCDD4CBBDK11.KCDD4CBWBBCK10.KDDCBBCC4BCK10.KDCBWBBDDBBCCK9.KDCC4BD5CDK8.K4CBBDCBBCCDDK8.K4CDDCBWBBDDCK8.K3CDDCC4BDCCK8.KCCDDCBBCBBD3CK8.KCDDCBWBBDD4CK9.KDCC4BD4CK10.K4C4B4CK10.K4CDBWBBCCDK11.KCCDD4BCDK13.KDDCCBBCDK15.KK4CKK18.4K34.","hkc_luciole":"K0b0d12G1d3a46H2c5e6cAd8f0f6Jf2fdffM2f3646Wffffff;24:33.6K16.KK6GKK12.KK10GKK9.K14GK7.K4GHM4HMH4GK6.K3GHHMMHHMMHH3GK5.K3G3AHMHHMH3A3GK4.KG6A4M6AGK3.KGG6A4M6AGGK..KGG6A4M6AGGK..K3GH3AHHJJHH3AH3GK..K3GH4A4J4AH3GK..K3G5A4J5A3GK..K3G5A4J5A3GK3.KGGH4AJWJJ4AHGGK4.K3G4HJJWJ4H3GK5.K3G3H4J3H3GK6.K4G3HJJ3H4GK7.K14GK9.KK10GKK12.KK6GKK16.6K33.","hkc_scarabee":"K0b0d12M2f3646C5a6a8aL9fb0cc;24:32.K6.K15.KMK4.KMK14.KMM4KMMK15.KMKMMKMK16.K6MK15.K8MK10.KK..K8MK..KK5.KMMK..K6CK..KMMK5.KMMKK3CMM3CKKMMK7.KMMC3LMM4CMMK9.KKC3LMM4CKK10.KCC3LMM5CK7.4KCC3LMM5C4K3.K4MCC3LMM5C4MK..K4M5CMM5C4MK3.4K5CMM5C4K7.K5CMM5CK10.KM4CMM4CMK9.KMM4CMM4CMMK7.KMMKK3CMM3CKKMMK7.KK..KCCMMCCK..KK13.6K33.","hkc_parchemin":"K0b0d12Pe8dcbcRc9b88eD8a7a58T5c6478Xb0303a;24:99.18K5.KRR14PRRK4.KDD14PDDK3.KRDDR6PTT4PRDDRK..KRDDRPTT3PTTPXPXRDDRK..KRDDR3PTTPTTPPXPRDDRK..KRDDR4PTT4PTPRDDRK..KRDDR4PTT4PTPRDDRK..KRDDR4PTT4PTPRDDRK..KRDDR4PTT4PTPRDDRK..KRDDR5P6TPRDDRK..KRDDR12PRDDRK3.KDD14PDDK4.KRR14PRRK5.K16PK7.16K100.","hkc_cloche":"K0b0d12M3a4256Ba9b6c9Le1e8f2D6b7890;24:11.3K20.K3MK19.K3MK17.3K3MKK15.K8BK14.K8BK14.KLL6BK13.KBLL7BK12.KBLL7BK12.K3L7BK12.KLL8BK12.KLL8BK11.KBLL9BK10.KBLL9BK10.K3L9BK9.KBLL11BK7.KBBL13BK5.K18BK4.K19DK3.K8DMM9DK4.7K4M8K12.KMMK21.KK35.","hkc_amulette":"K0b0d12C59617aO8590a8B2a3045P7a5cc9Lc9b6ff;24:11.KK21.KCCK19.K4CK17.KCCKKCCK16.KCCKKCCK16.KK4CKK15.K3OC4OK13.KOO6BOOK11.KCO8BOCK9.KOO4BPP4BOOK7.KOO4B4P4BOOK6.KO4BPPLLPP4BOK6.KO3BPP4LPP3BOK6.KOBBPP6LPPBBOK6.KCBBPP6LPPBBCK6.KO3BPP4LPP3BOK6.KO4BPPLLPP4BOK6.KOO4B4P4BOOK7.KOO4BPP4BOOK9.KCO8BOCK11.KOO6BOOK13.K4OC3OK15.8K32.","hkc_bulle_cri":"K0b0d12Rff4d6dSff9fb2Wffffff;24:11.KK21.KRRK15.K4.KRRK4.K9.KRKK.K4RK.KKRK8.K3RKKRSSRKK3RK8.K6RSS6RK8.KRRSSR4SRSSRRK8.KRR3S4W3SRRK6.3KRRS8WSRR3K3.K4R12W4RK.K3RSS3WKWKWK4WSS3RK.K3RS3WKWKWK4WS3RK3.KKRR3WKWKWK4WRRKK5.KRR12WRRK6.KRR3WKWKWK4WRRK5.KRR3S8W3SRRK4.K6RS4WS6RK3.K7R6S7RK3.5KRRSSRRSSRR5K8.KRRS4RSRRK13.K3RKK3RK14.KRRK..KRRK14.KRK4.KRK15.K6.K8.","hkc_bulle_question":"K0b0d12H22324aWf4f8ffB3a6fd8;24:6.3K6H3K11.K12HK9.K14HK7.K4H8W4HK5.K3H12W3HK3.K3H14W3HK..KHH16WHHK..KH18WHK.KHHWW3BW3BW3B5WHHKKHH4WB3WB3WB5WHHKKHH3WBBWWBBWWBB5WHHKKHH18WHHKKHH3WB3WB3WB6WHHKK3H16W3HK.K3H14W3HK..K4H12W4HK..K4H10W6HK3.K3H3W12HK5.KHHWW12HK7.KWW12HK8.KW12HK10.4K6H3K15.6K33.","hkc_coeur_bulle":"K0b0d12H4a2236Wfff4f7Rff5c8aPffc2d4;24:6.3K6H3K11.K12HK9.K14HK7.K3H10W3HK5.K3H12W3HK3.KHH5WRRWWRR5WHHK..KHH3W10R3WHHK..KH4W10R4WHK.KHH4W3RP6R4WHHKKHH4WRRP7R4WHHKKHH4W10R4WHHKKHH5W8R5WHHKKHH6W6R6WHHKK3H6W4R6W3HK.KHH16WHHK..K4H12W4HK..K5H10W5HK3.K12H3W3HK5.K12HWWHHK7.K12HWHK9.K12HWK10.3K6H4K14.6K33.","hkc_lanterne_halo":"K0b0d12M2f3646V9fd8e6Je8fbffWffffffG16303aH24515eI3a8094;24:3.K5G6H5GK5.K4G10H4GK4.K3G3H7MHH3GK3.K3G3H9MHH3GK.K3G3HIM7VM3H3GKK3G3HIM7VM3H3GKKGG3HIIMV5JVMI3HGGKKGG3HIIMVJ3WJVMI3HGGKKGG3HIIMVJ3WJVMI3HGGKKGG3HIIMVJ3WJVMI3HGGKKGG3HIIMV5JVMI3HGGKKGG3HIIMV5JVMI3HGGKK3G3HIM7VM3H3GKK3G3HIM7VM3H3GK.K3G3H9MHH3GK3.K3G5H3M4H3GK4.K4G4H3M3H4GK5.K5GHH3MH5GK7.KK5G3M4GKK10.K4G3M3GK13.4K3M3K16.KK3MKK16.K7MK15.K7MK7.","hkc_cristal_rose":"K0b0d12Pff7ac8Lffc4eaDb03a8aWffffffR3a3f4cH3a1f36;24:7.10K13.K10HK10.KK5HLP5HKK7.K7HLP7HK5.K7HLLPP7HK4.K6HWWL3P6HK3.K7HWWL3P7HK.K7HLWWL4PHHPD3HKK3HPDHHLWWL4PHPPD3HKK3HPDDHLWWL7PD3HKKHHPP3DLWWL7PDDHHKKHHPP3DLWWL7PDDHHKKH3P3D4L7P3DHKKH3P3D4L7P3DHKKH3P4D3L7P3DHKKHHPP4D3L7PDDHHKKHHPP4D3L7PDDHHK.KHPP4D3L7PDDHK3.KPP4D3L7PDDK4.KHP4D3L7PDHK4.KKP4D6H4PD3K..K21RK.K21RK..21K.","hkc_fleur":"K0b0d12H26304aPf2f4fbCb9c6e6WffffffT7a8aa8F9aa8c4;24:5.K12HK9.K14HK7.K16HK5.K18HK3.K8H4P8HK..K8H4P8HK..K6HPH4PHP6HK.K5H4PHPPH4P5HKK5H5PCC5P5HKK5H4PCWCC4P5HKK6HPPH4CHPP6HKK8HPPCCPP8HKK6H4PHH4P6HK.K5H4PHH4P5HK..K6H3PHH3P6HK..K9HTT9HK3.K8HTT8HK5.K7HTT7HK7.KH5FTT6HK9.K5FTT5HK11.3KHHTT5FK14.KKTT5FK15.KTT5K17.KK11.","hkp_coccinelle":"K0b0d12H232a3bWf2f4fbRc8414bD7d2232Le8737bBd9c9a4T8a7350;20:4.K3.K16.K.K8.BB6.5K6.4B4.K5HK5.4B4.KWWHWWK6.BB5.KWKHWKK6.T7.K3HK6.T6.3KRKR3K3.T6.K4RK4RK..T5.KRL3RKRRDDRKT6.KRLDDRKRRDDRKK6.KRRDDRK5RK7.K5RK5RK7.K5RKRDDRRK8.KRDDRKRDDRK9.KRDDRK4RK10.KKRRKRRKK12.7K13.K..K..K12.K3.K3.K9.","hkp_escargot":"K0b0d12Cb9c6e6E7a8aa8Pf2f4fbM9aa8c4WffffffB8a7350Lf4ead2;20:22.K..K16.K..K15.KWK.KWK5.4K4.3K.3K3.KK4CKK3.K3MK3.KCC4ECCK..K4MK.KCEE3KECCK..KMWMMK.KCEKCCKECCK..K4MK.KCEKCKKECCK3.K3MK.KCE3KEECCK3.K3MK4BC3ECCK3.KK3MB4LB4CK3.K5MBLLKLB4K3.K6MB4LB4MK..K6M6B5MK..17K82.","hkp_fourmi":"K0b0d12A5a3a2eN8c5a44Wf2f4fbF6fae6aG3f7a4a;20:8.GG16.G3FG14.G5FG12.GFFG4FG10.G3FG4FG10.G4FGFFG12.GG3FGG15.GGKG12.K.K3.KK13.KK..KK13.KAAKKAAK12.KAWAAWAK12.K6AK13.K4AK15.KANK.4K10.KANNAK4AK8.K.KAAKAANNAAK7.K.KK.K5AK9.K..K.5K13.K.K..K8.","hkp_grillon":"K0b0d12V4e7a4aU75a86bWf2f4fbOa8673aYd9a05bSe8e2cf;20:K17.K..K15.K4.K5.4K4.K6.K..KK4UKK.K8.KK8UK10.KUWWUUWWUK10.KUWKUUWKUK11.K6UK13.K4UK3.KS6.4K4V4KS6.K3YK6VKS6.KY3OYK4VKS7.KYOKOY6S8.KY3OYK3VK10.K3YK4VK11.3K6VK12.KVVKKVVK11.KVK4.KVK9.KVK6.KVK8.KK8.KK4.","hkp_chenille":"K0b0d12Ca3b86aE6f8a45Wf2f4fbGc9d3e8B6a4a8aPf4ead2;20:24.K4.K15.K..K15.KKCCKK13.K6CK11.4KCC4K10.KGWGKKGWGK10.KGKGCCGKGK10.4KCC4K11.KCCEECCK13.K4CK11.K9BK8.KB4PK4PBK7.KBPKKPKPKKPB6K..KB4PK4PBKCCKCCK.K11BKCEKCECK.11KCCEKCCEK3.KCCKCCK4CK3CK4.KEEKEE9K6.KK.KK11.","hkp_libellule":"K0b0d12T3fa7b0U7fd6d9WffffffIcfe9f2J9cc6e8Mc99be0;20:8.4K15.K4TK9.3K.KWWTTWWK.3K3.KIJIKKWKTTW3KIJIK.KIIJJIKK4TKKIJJIIKKIJJMIIKKTTKKIIMJJIKKIIJJMIIKTTKIIMJJIIK.KIIJJIIKTTKIIJJIIK3.KK3IKKUUKK3IKK3.KIJJIIKKTTKKIIJJIK.KIJMJIIKKUUKKIIJMJIKKIJJIIK.KTTK.KIIJJIK.5K..KUUK..5K10.KTTK16.KUUK16.KTTK17.KUK17.KTK17.KK28.","hkp_verluisant":"K0b0d12H2a3346N3c4862Wf2f4fbYfff1a8Gffd75eOe8a93a;20:22.K3.K16.K.K16.5K14.K5HK13.KHWHWHK13.KHKHKHK13.K5HK14.K3N3K13.K3HKNNKK12.K5HNNKK..YY7.K7HNKYGGY7.KK6HK4GY8.KK3NKGGOOGY9.K3HKG3OGY9.K3NKGGOGGY10.4K4GY16.YGY43.","s_coeur_bleu":";11:..KK3.KK3.KBBK.KBBK.KBbBBK4BKKBb7BKK9BK.K7BK3.K5BK5.K3BK7.KBK9.K5.","s_coeur_vert":";11:..KK3.KK3.KVVK.KVVK.KVvVVK4VKKVv7VKK9VK.K7VK3.K5VK5.K3VK7.KVK9.K5.","s_coeur_violet":";11:..KK3.KK3.KPPK.KPPK.KPpPPK4PKKPp7PKK9PK.K7PK3.K5PK5.K3PK7.KPK9.K5.","s_coeur_orange":";11:..KK3.KK3.KOOK.KOOK.KOoOOK4OKKOo7OKK9OK.K7OK3.K5OK5.K3OK7.KOK9.K5.","s_coeur_jaune":";11:..KK3.KK3.KYYK.KYYK.KYyYYK4YKKYy7YKK9YK.K7YK3.K5YK5.K3YK7.KYK9.K5.","s_coeur_rose":";11:..KK3.KK3.KMMK.KMMK.KMmMMK4MKKMm7MKK9MK.K7MK3.K5MK5.K3MK7.KMK9.K5.","s_coeur_turquoise":";11:..KK3.KK3.KTTK.KTTK.KTtTTK4TKKTt7TKK9TK.K7TK3.K5TK5.K3TK7.KTK9.K5.","s_coeur_gris":";11:..KK3.KK3.KGGK.KGGK.KGgGGK4GKKGg7GKK9GK.K7GK3.K5GK5.K3GK7.KGK9.K5.","s_coeur_blanc":";11:..KK3.KK3.KwwK.KwwK.KwWwwK4wKKwW7wKK9wK.K7wK3.K5wK5.K3wK7.KwK9.K5.","s_coeur_brise":";11:..KK3.KK3.KRRK.KRRK.KRrRRKRKRRKKRr3RK3RKK4RK4RK.K4RKRRK3.KRRKRRK5.KRKRK7.KRK9.K5.","s_coeur_arc":";11:..KK3.KK3.KRRK.KOOK.KRrRRK4OKK9YKK9VK.K7BK3.K5BK5.K3PK7.KPK9.K5.","s_etoile_bleue":";11:5.K9.KBK7.K3BK4.3KBbB3K.K4Bb4BK.K7BK3.K5BK4.K5BK3.K3BK3BK..KBBK.KBBK3.KK3.KK..","s_etoile_verte":";11:5.K9.KVK7.K3VK4.3KVvV3K.K4Vv4VK.K7VK3.K5VK4.K5VK3.K3VK3VK..KVVK.KVVK3.KK3.KK..","s_etoile_rose":";11:5.K9.KMK7.K3MK4.3KMmM3K.K4Mm4MK.K7MK3.K5MK4.K5MK3.K3MK3MK..KMMK.KMMK3.KK3.KK..","s_etoile_violette":";11:5.K9.KPK7.K3PK4.3KPpP3K.K4Pp4PK.K7PK3.K5PK4.K5PK3.K3PK3PK..KPPK.KPPK3.KK3.KK..","s_etoile_rouge":";11:5.K9.KRK7.K3RK4.3KRrR3K.K4Rr4RK.K7RK3.K5RK4.K5RK3.K3RK3RK..KRRK.KRRK3.KK3.KK..","s_etoile_orange":";11:5.K9.KOK7.K3OK4.3KOoO3K.K4Oo4OK.K7OK3.K5OK4.K5OK3.K3OK3OK..KOOK.KOOK3.KK3.KK..","s_etoile_turquoise":";11:5.K9.KTK7.K3TK4.3KTtT3K.K4Tt4TK.K7TK3.K5TK4.K5TK3.K3TK3TK..KTTK.KTTK3.KK3.KK..","s_etoile_argent":";11:5.K9.KgK7.K3gK4.3KgWg3K.K4gW4gK.K7gK3.K5gK4.K5gK3.K3gK3gK..KggK.KggK3.KK3.KK..","s_rond":";10:3.4K5.K4RK3.KRr4RK.KRr6RKK8RKK8RKK8RK.K6RK3.K4RK5.4K3.","s_carre":";10:.8K.Kbb6BKKb7BKK8BKK8BKK8BKK8BKK8BKK8BK.8K.","s_triangle":";11:5.K9.KVK7.KVvVK6.K3VK5.K5VK4.K5VK3.K7VK..K7VK.K9VK.9K.","s_losange":";11:5.K9.KYK7.KYyYK5.KYy3YK3.K7YK.K9YK.K7YK3.K5YK5.K3YK7.KYK9.K5.","s_hexagone":";11:3.5K5.K5PK3.KPp5PK.KPp7PKK9PKK9PK.K7PK3.K5PK5.5K3.","s_anneau":";10:3.4K5.K4OK3.KOo4OK.KOoOKK3OKKOOK..KOOKKOOK..KOOKK3OKK3OK.K6OK3.K4OK5.4K3.","s_coche":";12:4.4K6.KK4VKK3.K8VK..K5VWVVK.K5VWW3VKKVVWVWW4VKKVV3W5VKK3VW6VK.K8VK..K8VK3.KK4VKK6.4K4.","s_croix":";12:4.4K6.KK4RKK3.K8RK..KRW3RWRRK.K3RWRW4RKK4RW5RKK3RWRW4RKKRRW3RW3RK.K8RK..K8RK3.KK4RKK6.4K4.","s_exclam":";12:4.4K6.KK4OKK3.K8OK..K3OWW3OK.K4OWW4OKK4OWW4OKK10OKK4OWW4OK.K8OK..K8OK3.KK4OKK6.4K4.","s_interro":";12:4.4K6.KK4BKK3.K8BK..K3BWW3BK.K3BWBBW3BKK5BW4BKK10BKK5BW4BK.K8BK..K8BK3.KK4BKK6.4K4.","s_plus":";12:4.4K6.KK4VKK3.K8VK..K3VW4VK.K4VW5VKKVV5W3VKK4VW5VKK4VW5VK.K8VK..K8VK3.KK4VKK6.4K4.","s_moins":";12:4.4K6.KK4RKK3.K8RK..K8RK.K10RKKRR5W3RKK10RKK10RK.K8RK..K8RK3.KK4RKK6.4K4.","s_egal":";12:4.4K6.KK4PKK3.K8PK..K8PK.KPP5W3PKK10PKKPP5W3PKK10PK.K8PK..K8PK3.KK4PKK6.4K4.","s_fl_droite":";12:4.4K6.KK4BKK3.K8BK..K3BW4BK.K5BW4BKKBB5W3BKK5BW4BKK4BW5BK.K8BK..K8BK3.KK4BKK6.4K4.","s_fl_gauche":";12:4.4K6.KK4BKK3.K8BK..K3BW4BK.K3BW6BKKBB5W3BKK3BW6BKK4BW5BK.K8BK..K8BK3.KK4BKK6.4K4.","s_fl_haut":";12:4.4K6.KK4TKK3.K8TK..K3TW4TK.K3T3W4TKKTTWTWTW3TKK4TW5TKK4TW5TK.K8TK..K8TK3.KK4TKK6.4K4.","s_fl_bas":";12:4.4K6.KK4TKK3.K8TK..K3TW4TK.K4TW5TKKTTWTWTW3TKK3T3W4TKK4TW5TK.K8TK..K8TK3.KK4TKK6.4K4.","s_info":";12:4.4K6.KK4NKK3.K8NK..K3NW4NK.K10NKK3NWW5NKK4NW5NKK3N3W4NK.K8NK..K8NK3.KK4NKK6.4K4.","s_pause":";12:4.4K6.KK4GKK3.K8GK..K8GK.K3GWGW4GKK3GWGW4GKK3GWGW4GKK3GWGW4GK.K8GK..K8GK3.KK4GKK6.4K4.","s_lecture":";12:4.4K6.KK4VKK3.K8VK..KVVW5VK.K3VWW5VKK3V3W4VKK3VWW5VKK3VW6VK.K8VK..K8VK3.KK4VKK6.4K4.","s_note_mus":";8:5.KK5.KPPK3.K3PK3.KPKPK3.KPKK3.KKPK3.K3PK..KPpPPK..K3PK4.3K4.","s_ampoule":";10:3.4K5.K4YK3.KYy4YK.KYy6YKK8YK.K6YK3.K4YK4.K4gK4.K4GK5.KggK7.KK4.","s_cadenas":";10:3.4K5.K4gK3.Kg4KgK..Kg4KgK.K8LKKL6YLKKLYYXXYYLKKLYYXXYYLKKL6YLKK8LK.8K.","s_cle":";13:..3K9.K3YK7.KYYKYY6K.KYK.K7YKKYYKYY3KYKYK.K3YK..KYKYK..3K4.K.K.","s_drapeau":";9:.7K.KG6RKKGRr4RKKG6RKKG6RKKG6K.KGK6.KGK6.KGK7.K7.","s_punaise":";10:3.4K5.K4RK3.KRr4RK..K6RK3.K4RK3.K6RK3.3KgKK6.KgK7.KgK8.K4.","s_goutte":";9:4.K7.KBK6.KBK5.K3BK3.KBb3BK.KBb5BKK7BKK7BK.K5BK3.K3BK5.3K3.","s_flamme":";10:4.K8.KRK.K4.KRRKKRK3.K3RKRRK.KRROO3RKKRR4ORRKKRROYYORRKKRO4YORK.KO4YOK3.K4OK5.4K3.","s_flocon":";11:5.K7.K.KbK.K3.KbKKbKKbK3.KbKbKbK3.3K3b3K.K4bW4bK.3K3b3K3.KbKbKbK3.KbKKbKKbK3.K.KbK.K7.K5.","s_eclair_bleu":";9:5.3K5.K3BK3.K3BK3.K3BKK..K6BK..KK3BK3.K3BK3.KBBKK3.KBKK6.K7.","s_visage_content":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KYyYXYYX3YKK3YXYYX3YKK10YKKYYX4YXYYK.KYY4XYYK..K8YK3.KK4YKK6.4K4.","s_visage_rire":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KYyX4YXYYKK3YXYYX3YKKYYX4YXYYKKYY6XYYK.KYX4RXYK..KYY4XYYK3.KK4YKK6.4K4.","s_visage_clin":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KYyYX6YKK3YXY3XYYKK10YKKYYX4YXYYK.KYY4XYYK..K8YK3.KK4YKK6.4K4.","s_visage_surpris":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KYyYXYYX3YKK3YXYYX3YKK10YKK4YXX4YK.KYYXYYXYYK..K3YXX3YK3.KK4YKK6.4K4.","s_visage_triste":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KYyYXYYX3YKK3YXYYX3YKK7YbYYKK3Y4X3YK.KYX4YXYK..K8YK3.KK4YKK6.4K4.","s_visage_fache":";12:4.4K6.KK4YKK3.K8YK..KYX4YXYK.KYyYXYYX3YKK3YXYYX3YKKYO6YOYKK10YK.KYY4XYYK..K8YK3.KK4YKK6.4K4.","s_visage_dodo":";12:4.4K.KK3.KK4YKbbK.K8YK..KYy6YK.KYy8YKKYYXXYYXXYYKK10YKK10YK.K3YXX3YK..K8YK3.KK4YKK6.4K4.","s_visage_amoureux":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KYyRYRRYRYYKK3YRYYR3YKK10YKKYYX4YXYYK.KYY4XYYK..K8YK3.KK4YKK6.4K4.","s_visage_cool":";12:4.4K6.KK4YKK3.K8YK..KYy6YK.KY8XYKKYYXXYYXXYYKK10YKK6YX3YK.KYY3X3YK..K8YK3.KK4YKK6.4K4.","s_visage_pensif":";12:4.4K6.KK4YKK3.K8YK..KYy4YXXK.KYyYXYYX3YKK3YXYYX3YKK10YKK10YK.K3Y3XYYK..K8YK3.KK4YKK6.4K4.","s_pomme":";10:5.K7.KKCK5.KVVCKK3.K3RCRRK.KRr6RKKRr6RKK8RKK8RK.K6RK3.KRRKRRK4.KK.KK..","s_pomme_verte":";10:5.K7.KKCK5.KEECKK3.K3VCVVK.KVv6VKKVv6VKK8VKK8VK.K6VK3.KVVKVVK4.KK.KK..","s_poire":";10:4.K8.KCK7.KCEK5.K3YK5.KYyYK4.KYy3YK..K7YK.K7YK.K7YK..K5YK4.5K3.","s_orange":";10:4.KK7.KEEK5.K4OK3.KOo4OK.KOo6OKK8OKK8OK.K6OK3.K4OK5.4K3.","s_fraise":";10:..5K4.KEVEVEK..K3REERRK.KRrRRy3RKKRy4RyRKK3Ry4RK.K4RyRK3.KRyRRK5.KRRK7.KK4.","s_banane":";9:7.K7.KCK5.KYYK4.KYYK..3K3YK.K6YK.KYy3YK3.K3YK5.3K4.","s_pasteque":";12:.10K.K10RKKRX3RXRRXRK.K3RX4RK3.K6RK5.K4WK7.KVVK9.KK5.","s_carotte":";11:7.K.K7.KVKVK7.KVVK6.KOOVK5.K3OK5.KOoOK5.K3OK5.K3OK5.KOOKK5.KOKK8.K9.","s_peche":";10:4.KK7.KEEK5.KMMOOK3.KMmM3OK.KMmMM4OKK4M4OKK3M5OK.KMM4OK3.K4OK5.4K3.","s_cerises2":";10:5.KK7.KEEK5.KEKEK4.KEK.KEK..KEK..KEK.K3RKK3RKKRrRKKRrRKK3RKK3RK.3K..3K.","s_beigne":";10:3.4K5.K4MK3.KMm4MK.K3MY4MKK3MKK3MKKMMcKKccMKK8cK.K6cK3.K4cK5.4K3.","s_glace":";10:3.4K5.K4mK3.KmW4mK.K8mKK8mK.K6cK..KcCcCccK3.K4cK4.KcCccK5.KccK6.KccK7.KK4.","s_cupcake":";10:4.K8.KRKK5.K4mK3.KmW4mK.K8mKK8MK.KbBbBbBK..KbBbBbBK3.KbBbBK5.4K3.","s_biscuit":";10:3.4K5.K4cK3.KcCccCcK.K8cKKcC4cCcKK3cC4cKK6cCcK.KcC5cK..K4cKK4.4K3.","s_bonbon":";12:.K..3K..K..KMKK3MKKMK.KMMKMmMMKMMKK10MKKMMK4MKMMKKMKK3MKKMK..K..3K..K..","s_sucette":";8:..4K3.K4MK.KMmWWMMKKMWMMWMKKMMWWMMK.K4MK3.KKWK5.KWK5.KWK6.K3.","s_pizza":";10:.8K.K8cKKYR4YRYK.K3YRYYK..KYR4YK3.K3YRK4.K4YK5.KYYK6.KYK8.K5.","s_tasse":";10:..K.K6.KwKwK5.KKwKwK3.K6WKK.KW4b3WKKW4bWKWKKW4b3WKK6WKK..K4WK5.4K4.","s_crayon":";12:9.KK9.KmmK7.K3mK6.KYYmK6.K3YK6.K3YK6.K3YK6.K3YK6.KSSYK6.KSXSK7.KXKK9.K10.","s_regle":";12:.10K.K10YKKYXYXYXYXYYKKYX3YX4YKK10YK.10K.","s_gomme":";10:3.6K3.K6mK.K7mKK6BmK.KBb5BK.K6BK3.6K3.","s_ciseaux":";10:.K6.K.KgK4.KgK.KgK..KgK3.KgKKgK5.KggK6.KggK5.KRKKRK3.KRKRRKRK..KRRKKRRK3.KK..KK..","s_cahier":";9:.7K.K7BKKBb5BKKB5WBKK7BKK7BKK7BKK7BKK7BKK7BK.7K.","s_livre_ouvert":";11:.4K.4K.K4WK4WKKWGGWCWGGWKK4WC4WKKWGGWCWGGWKK4WC4WKKWGGWCWGGWKK4WC4WKK9CK.9K.","s_calculatrice":";9:.7K.K7GKKG5vGKK7GKKGWGWGWGKK7GKKGWGWGWGKK7GKKGWGWGOGKK7GK.7K.","s_sac":";10:3.3K6.K3RK4.KR3KRK..K7RK.KRr5RK.KRR3YRRK.KRRYRYRRK.K7RK.K7RK..7K..","s_reveil":";10:.KK4.KK.KRR4KRRKKRK4RKRK.KR4WRK.KRWWX3WRKKRWWX3WRKKRWW3XWRKKR6WRK.KR4WRK3.K4RK3.KR4KRK3.K4.K..","s_eprouvette":";6:.KK3.KggK..KgKgK.KgKgK.KgKgK.KgVgK.KgvVgKKgVVgK.KggK3.KK..","s_palette":";10:..6K3.K6cK.KcRccB3cKK8cKKcYccVKKcKK4cK.KcKKcPccKKcK..K6cK3.6K..","s_globe":";10:3.4K5.K4BK3.KBVV3BK.KB3VBBVBKKBBVBBVVBKK5BVVBKKBV6BK.KBVV3BK3.K4BK4.KKCCKK3.K6CK3.6K..","s_feuille":";9:6.KK5.KKVVK3.K4VK..KVVvVVK.KVVv3VK.KVv3VK.K5VK..K3VKK3.KCKK6.K7.","s_erable":";11:5.K8.KKRKK5.KRKRKRK3.KK5RKK.KRK5RKRKK9RK.K7RK3.K5RK5.KKCKK7.KCK9.K5.","s_sapin":";9:4.K7.KVK5.K3VK3.KVVvVVK3.K3VK3.K5VK.K3Vv3VK.3KC3K4.KCK7.K4.","s_tulipe":";7:.K.K.K.KMKMKMKK5MKKMm3MKK5MK.K3MK..KKVKK.KVKVKVK.K3VK3.KVK5.K3.","s_marguerite":";7:3.K5.KWK3.K3WK.KWWYWWK.K3WK3.KWK4.KVK3.KVVK4.KVK5.K3.","s_cactus":";8:3.K5.KKVK3.KVKVVKK.K4VKVK.K5VK..KVVKK..KKVVKK.K6CK.K4CK3.4K..","s_trefle":";9:..KK.KK3.KVVKVVK.K7VKK7VK.K5VK.K7VKK3VE3VK.KVVEVVK3.KKEKK6.KEK7.K3.","s_pluie":";10:3.KK7.KwwK.K3.KwWwwKwK.K8wKK8wK.K6gK..KBKKBKKBKKBKKBKKBK..K..K..K..","s_parapluie":";10:4.KK6.KKPPKK3.K6PK.KPp6PKK8PKKPKKg3KPK.K.KgK..K3.KKgK5.KgKgK6.KgK8.K6.","s_champi_bleu":";10:3.4K5.K4BK3.KBWBBWBK.K8BKKBW4BWBK.3KZZ3K4.KZZK5.K4ZK5.4K3.","s_mot_aplus":";11:.9K.K9VKKVVW6VKKVWVWVVWVVKKV3WV3WVKKVWVWVVWVVKKVWVW5VKK9VK.9K.","s_mot_ok":";11:.9K.K9BKKBBWBBWBWBKKBWBWBWBWBKKBWBWBWWBBKKBWBWBWBWBKKBBWBBWBWBKK9BK.9K.","s_mot_top":";15:.13K.K13OKKO3WOOWOOWWOOKKOOWOOWOWOWOWOKKOOWOOWOWOWWOOKKOOWOOWOWOW3OKKOOW3OWOOW3OKK13OK.13K.","s_mot_wow":";19:.17K.K17PKKPW3PWPPWPPW3PWPKKPW3PWPWPWPW3PWPKKPWPWPWPWPWPWPWPWPKKPWWPWWPWPWPWWPWWPKKPW3PWPPWPPW3PWPKK17PK.17K.","s_mot_go":";11:.9K.K9VKKVVWWVVWVVKKVW3VWVWVKKVWVWVWVWVKKVWVWVWVWVKKVVWWVVWVVKK9VK.9K.","s_mot_100":";15:.13K.K13RKKRRWRR3WR3WRKKRWWRRWRWRWRWRKKRRWRRWRWRWRWRKKRRWRRWRWRWRWRKKR3WR3WR3WRKK13RK.13K.","s_mot_oui":";15:.13K.K13VKKVVWVVWVWV3WVKKVWVWVWVWVVWVVKKVWVWVWVWVVWVVKKVWVWVWVWVVWVVKKVVWVV3WV3WVKK13VK.13K.","s_mot_non":";17:.15K.K15RKKRWRRWRRWRRWRRWRKKRWWRWRWRWRWWRWRKKRWRWWRWRWRWRWWRKKRWRRWRWRWRWRRWRKKRWRRWRRWRRWRRWRKK15RK.15K.","s_mot_vu":";11:.9K.K9TKKTWTWTWTWTKKTWTWTWTWTKKTWTWTWTWTKKTWTWTWTWTKKTTWTT3WTKK9TK.9K.","s_mot_bien":";20:.18K.K18YKKYXXYY3XY3XYXYYXYKKYXYXYYXYYX3YXXYXYKKYXX3YXYYXXYYXYXXYKKYXYXYYXYYX3YXYYXYKKYXXYY3XY3XYXYYXYKK18YK.18K.","s_mot_lun":";16:.14K.K14NKKNW3NWNWNWNNWNKKNW3NWNWNWWNWNKKNW3NWNWNWNWWNKKNW3NWNWNWNNWNKKN3WN3WNWNNWNKK14NK.14K.","s_mot_mar":";17:.15K.K15NKKNW3NWNNWNNWWNNKKNWWNWWNWNWNWNWNKKNWNWNWN3WNWWNNKKNW3NWNWNWNWNWNKKNW3NWNWNWNWNWNKK15NK.15K.","s_mot_mer":";17:.15K.K15NKKNW3NWN3WNWWNNKKNWWNWWNW3NWNWNKKNWNWNWNWWNNWWNNKKNW3NWNW3NWNWNKKNW3NWN3WNWNWNKK15NK.15K.","s_mot_jeu":";15:.13K.K13NKK3NWN3WNWNWNKK3NWNW3NWNWNKK3NWNWWNNWNWNKKNWNWNW3NWNWNKKNNWNN3WN3WNKK13NK.13K.","s_mot_ven":";16:.14K.K14NKKNWNWN3WNWNNWNKKNWNWNW3NWWNWNKKNWNWNWWNNWNWWNKKNWNWNW3NWNNWNKKNNWNN3WNWNNWNKK14NK.14K."},"autocollants":[["etoile","Étoile",150,"Étoiles et ciel"],["etoiles","Constellation",300,"Étoiles et ciel"],["soleil","Soleil",250,"Étoiles et ciel"],["lune","Lune",250,"Étoiles et ciel"],["nuage","Nuage",200,"Étoiles et ciel"],["eclair","Éclair",300,"Étoiles et ciel"],["arcenciel","Arc-en-ciel",600,"Étoiles et ciel"],["coeur","Cœur",150,"Cœurs et fleurs"],["coeurs","Deux cœurs",300,"Cœurs et fleurs"],["fleur","Fleur",300,"Cœurs et fleurs"],["sourire","Sourire",200,"Cœurs et fleurs"],["chat","Chat",800,"Animaux"],["chien","Chien",800,"Animaux"],["renard","Renard",1000,"Animaux"],["hibou","Hibou",1000,"Animaux"],["grenouille","Grenouille",900,"Animaux"],["poisson","Poisson",700,"Animaux"],["papillon","Papillon",900,"Animaux"],["champignon","Champignon",500,"Objets"],["gateau","Gâteau",600,"Objets"],["pouce","Bravo",400,"Objets"],["fusee","Fusée",1500,"Objets"],["trophee","Trophée",2500,"Objets"],["cristal","Cristal",5000,"Objets"],["couronne","Couronne",10000,"Objets"],["hkc_banc","Banc",400,"Hollow Knight"],["hkc_epines","Épines",400,"Hollow Knight"],["hkc_champignon","Champignon",450,"Hollow Knight"],["hkc_lanterne","Lanterne",500,"Hollow Knight"],["hkc_coquille","Coquille",500,"Hollow Knight"],["hkc_cristal","Cristal bleu",600,"Hollow Knight"],["hkc_parchemin","Carte",650,"Hollow Knight"],["hkc_cle","Clé",700,"Hollow Knight"],["hkc_scarabee","Scarabée",750,"Hollow Knight"],["hkc_fiole","Fiole",800,"Hollow Knight"],["hkc_cloche","Cloche",850,"Hollow Knight"],["hkc_luciole","Luciole",900,"Hollow Knight"],["hkc_cocon","Cocon",1000,"Hollow Knight"],["hkc_amulette","Amulette",1500,"Hollow Knight"],["hkc_bulle_cri","Cri !!!",3000,"Hollow Knight · rares"],["hkc_bulle_question","Bulle ???",3000,"Hollow Knight · rares"],["hkc_coeur_bulle","Merci",4000,"Hollow Knight · rares"],["hkc_lanterne_halo","Lanterne lumineuse",5000,"Hollow Knight · rares"],["hkc_cristal_rose","Cristal rose",6500,"Hollow Knight · rares"],["hkc_fleur","Fleur délicate",8000,"Hollow Knight · rares"],["hkp_coccinelle","Coccinelle voyageuse",1200,"Hollow Knight · petites bêtes"],["hkp_escargot","Escargot postier",1300,"Hollow Knight · petites bêtes"],["hkp_fourmi","Fourmi porteuse",1400,"Hollow Knight · petites bêtes"],["hkp_grillon","Grillon musicien",1600,"Hollow Knight · petites bêtes"],["hkp_chenille","Chenille lectrice",1800,"Hollow Knight · petites bêtes"],["hkp_libellule","Libellule irisée",7000,"Hollow Knight · petites bêtes rares"],["hkp_verluisant","Ver luisant",9000,"Hollow Knight · petites bêtes rares"]],"geos":{"depart":500,"plafond":50000,"mise_min":10,"mise_max":10000,"mises":[10,50,100,500,1000,5000,10000],"max_visibles":3,"delai":[9,22],"duree":45,"valeur":[8,40],"gros":[80,160],"p_gros":0.08,"echeance":10,"ajouts":[50,100,500,1000,5000],"delai_jeux":[4,10],"delai_autres":[30,75],"max_visibles_jeux":4},"jeux":[["roulette","Roulette","Couleur ×2 · douzaine ×3 · numéro ×36"],["machine","Machine à sous","Trois pareils jusqu'à ×100 · deux cerises ×3"],["pile","Pile ou face","Bonne face : ×1,9"],["des","Dés","Plus haut ou plus bas que 7 : ×2,28 · sept : ×5,7"],["blackjack","Blackjack","Victoire ×2 · blackjack ×2,5 · égalité : mise rendue"],["grattage","Grattage","Trois symboles pareils : jusqu'à ×50"],["roue","Roue de la fortune","Douze cases, de ×0 à ×5"],["plinko","Plinko","La bille rebondit : jusqu'à ×29"],["keno","Keno","Choisis 1 à 5 numéros sur 40 : jusqu'à ×300"],["course","Course de chevaux","Six chevaux, cote de ×3,1 à ×15,8"],["tirbut","Tir au but","Trompe le gardien : ×1,45"],["mines","Mines","Évite les mines, encaisse quand tu veux"],["fusee","Fusée","Choisis où descendre : ×1,5 à ×10"],["hilo","Plus haut, plus bas","Devine la carte suivante"],["baccara","Baccara","Joueur ou banquier ×1,95 · égalité ×8"],["sicbo","Grand ou petit","Trois dés : ×1,95 · triple ×30"],["poker","Poker express","Cinq cartes : paire de valets ×2 à quinte royale ×1000"],["bataille","Bataille","Carte la plus forte : ×1,95"],["ppc","Pierre, papier, ciseaux","Victoire ×1,9 · égalité : mise rendue"],["coffres","Trois coffres","Un coffre ×2,5, un ×0,4, un vide"],["mystere","Chiffre mystère","Trouve le nombre de 1 à 10 : ×9,5"],["flechettes","Fléchettes","Vise le centre : jusqu'à ×12"],["craps","Craps","Ligne de passe : ×2"],["seuil","Sous le seuil","Dé de 1 à 100 : plus le seuil est bas, plus ça paie"],["tour","La tour","Une porte piégée sur trois à chaque étage"],["couleur","Couleur de la carte","Rouge ou noir ×1,95 · enseigne ×3,8"]],"pile":1.9,"des":{"bas":2.28,"sept":5.7,"haut":2.28},"rouges":[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],"roulette":{"couleur":2,"douzaine":3,"numero":36},"rouleaux":[["cerise",7],["citron",6],["raisin",5],["cloche",3],["etoile",2],["sept",1]],"machine":{"sept":100,"etoile":50,"cloche":20,"raisin":12,"citron":8,"cerise":4},"cerises":{"2":3},"grattage":[[50,0.002,"couronne"],[10,0.01,"trophee"],[5,0.04,"cristal"],[3,0.05,"etoile"],[2,0.1,"coeur"],[1,0.2,"champignon"]],"grattage_autres":["lune","nuage","fusee","fleur"],"bj":{"blackjack":2.5,"gagne":2,"egalite":1},"effets":{"hkc_bulle_cri":"pulse","hkc_bulle_question":"scintille","hkc_coeur_bulle":"pulse","hkc_lanterne_halo":"brille","hkc_cristal_rose":"scintille","hkc_fleur":"brille","hkp_libellule":"scintille","hkp_verluisant":"brille"},"piece_mix":{"O":["#000000",0.62],"D":["#000000",0.28],"A":["",0],"L":["#ffffff",0.45],"W":["#ffffff",0.85]},"jeux_ico":{"roulette":"cristal","machine":"sept","pile":"PIECE","des":"sourire","blackjack":"couronne","grattage":"trophee","roue":"soleil","plinko":"hkc_luciole","keno":"etoiles","course":"renard","tirbut":"pouce","mines":"hkc_epines","fusee":"fusee","hilo":"hkc_parchemin","baccara":"coeurs","sicbo":"hkc_amulette","poker":"couronne","bataille":"eclair","ppc":"nuage","coffres":"hkc_cle","mystere":"hkc_bulle_question","flechettes":"hkc_cristal","craps":"raisin","seuil":"lune","tour":"hkc_lanterne","couleur":"coeur"},"roue":[0,1.5,0,0.5,2,0,1.2,0.5,0,1,0,5],"plinko":{"rangs":8,"risques":{"bas":[5.6,2.1,1.1,1,0.5,1,1.1,2.1,5.6],"moyen":[13,3,1.3,0.7,0.4,0.7,1.3,3,13],"haut":[29,4,1.5,0.3,0.2,0.3,1.5,4,29]}},"keno":{"total":40,"tires":10,"gains":{"1":{"1":3.8},"2":{"1":1,"2":9.5},"3":{"2":4,"3":32},"4":{"2":1.8,"3":10,"4":70},"5":{"2":1,"3":3.6,"4":25,"5":300}}},"course":[["Éclair",0.3,3.1],["Tonnerre",0.22,4.3],["Comète",0.18,5.2],["Brume",0.14,6.7],["Lueur",0.1,9.5],["Ombre",0.06,15.8]],"tirbut":1.45,"mines":{"cases":25,"choix":[3,5,10],"marge":0.97},"fusee":{"cibles":[1.5,2,3,5,10],"marge":0.96,"max":1000},"hilo":{"marge":0.95},"baccara":{"joueur":1.95,"banquier":1.95,"egalite":8,"rendu_egalite":1},"sicbo":{"petit":1.95,"grand":1.95,"triple":30},"poker":{"royale":1000,"quinte_flush":300,"carre":100,"full":40,"couleur":25,"quinte":20,"brelan":10,"deux_paires":5.5,"paire_valets":2},"bataille":1.95,"ppc":1.9,"coffres":[2.5,0.4,0],"mystere":9.5,"flechettes":[["Centre",0.02,12],["Anneau 1",0.1,3],["Anneau 2",0.2,1.5],["Anneau 3",0.3,0.3],["Raté",0.38,0]],"craps":2,"seuil":{"seuils":[5,10,25,50,75,90],"marge":97},"tour":{"etages":8,"portes":3,"marge":0.97},"couleur":{"couleur":1.95,"enseigne":3.8},"ps":"K1b1d27Wffffffwdfe6f0g9aa3b5G5c6475X2b2b33Re5484drff9a9eDa3262fOf28c28offc27aYffd23fyfff2a8Ld99a00V3fbf5ava6eab0E23843bB3b82f6ba8ccffN1e4fa8T19b5b0t9be6e2Pa259e6pdcc0ffMff6fb1mffc6e2C8b5a2bcc98b52Sf5d6b4Zf4ead2","simples":[["Petits cœurs",50,[["coeur_bleu","Cœur bleu"],["coeur_vert","Cœur vert"],["coeur_violet","Cœur violet"],["coeur_orange","Cœur orange"],["coeur_jaune","Cœur jaune"],["coeur_rose","Cœur rose"],["coeur_turquoise","Cœur turquoise"],["coeur_gris","Cœur gris"],["coeur_blanc","Cœur blanc"]]],["Petits cœurs",60,[["coeur_brise","Cœur brisé"]]],["Petits cœurs",80,[["coeur_arc","Cœur arc-en-ciel"]]],["Petites étoiles",50,[["etoile_bleue","Étoile bleue"],["etoile_verte","Étoile verte"],["etoile_rose","Étoile rose"],["etoile_violette","Étoile violette"],["etoile_rouge","Étoile rouge"],["etoile_orange","Étoile orange"],["etoile_turquoise","Étoile turquoise"],["etoile_argent","Étoile argent"]]],["Formes",40,[["rond","Rond"],["carre","Carré"],["triangle","Triangle"],["losange","Losange"],["hexagone","Hexagone"],["anneau","Anneau"]]],["Symboles",60,[["coche","Coche"],["croix","Croix"],["exclam","Attention"],["interro","Question"],["plus","Plus"],["moins","Moins"],["egal","Égal"],["fl_droite","Flèche droite"],["fl_gauche","Flèche gauche"],["fl_haut","Flèche haut"],["fl_bas","Flèche bas"],["info","Info"],["pause","Pause"],["lecture","Lecture"]]],["Symboles",70,[["note_mus","Note de musique"]]],["Symboles",80,[["ampoule","Ampoule"],["cadenas","Cadenas"]]],["Symboles",70,[["cle","Petite clé"],["drapeau","Drapeau"]]],["Symboles",60,[["punaise","Punaise"],["goutte","Goutte"]]],["Symboles",70,[["flamme","Flamme"],["flocon","Flocon"],["eclair_bleu","Éclair bleu"]]],["Visages",70,[["visage_content","Content"],["visage_rire","Fou rire"],["visage_clin","Clin d'œil"],["visage_surpris","Surpris"],["visage_triste","Triste"],["visage_fache","Fâché"],["visage_dodo","Endormi"],["visage_amoureux","Amoureux"],["visage_cool","Cool"],["visage_pensif","Pensif"]]],["Fruits et collations",90,[["pomme","Pomme"],["pomme_verte","Pomme verte"],["poire","Poire"],["orange","Orange"],["fraise","Fraise"],["banane","Banane"],["pasteque","Pastèque"],["carotte","Carotte"],["peche","Pêche"],["cerises2","Deux cerises"],["beigne","Beigne"],["glace","Cornet de glace"],["cupcake","Petit gâteau"],["biscuit","Biscuit"],["bonbon","Bonbon"],["sucette","Sucette"],["pizza","Pizza"],["tasse","Tasse"]]],["École",110,[["crayon","Crayon"],["regle","Règle"],["gomme","Gomme"],["ciseaux","Ciseaux"],["cahier","Cahier"],["livre_ouvert","Livre ouvert"],["calculatrice","Calculatrice"],["sac","Sac à dos"],["reveil","Réveil"],["eprouvette","Éprouvette"],["palette","Palette"],["globe","Globe"]]],["Nature",80,[["feuille","Feuille"],["erable","Feuille d'érable"],["sapin","Sapin"],["tulipe","Tulipe"],["marguerite","Marguerite"],["cactus","Cactus"],["trefle","Trèfle"],["pluie","Nuage de pluie"],["parapluie","Parapluie"],["champi_bleu","Champignon bleu"]]],["Mots",60,[["mot_aplus","A+"],["mot_ok","OK"],["mot_top","Top"],["mot_wow","Wow"],["mot_go","Go"],["mot_100","Cent"],["mot_oui","Oui"],["mot_non","Non"],["mot_vu","Vu"],["mot_bien","Bien"],["mot_lun","Lundi"],["mot_mar","Mardi"],["mot_mer","Mercredi"],["mot_jeu","Jeudi"],["mot_ven","Vendredi"]]]],"ac_gain":0.004,"ac_max":0.01,"ac_revente":0.75};
/* </JX> */
/* sprite compacté « palette;largeur:pixels » (palette : lettre + 6 chiffres hex, vide = palette partagée ; pixels : rangées à la suite,
   « 3K » = KKK) -> {pal, rows} ; même algorithme que deplier_sprite (PC) */
function deplierSprite(v, ps) {
  if (typeof v !== "string") return v;
  const [p, f] = v.split(";"), pal = p ? {} : ps;
  for (let i = 0; i < p.length; i += 7) pal[p[i]] = "#" + p.slice(i + 1, i + 7);
  const k = f.indexOf(":"), w = +f.slice(0, k), x = f.slice(k + 1).replace(/(\d+)(\D)/g, (_, n, c) => c.repeat(+n)), rows = [];
  for (let i = 0; i < x.length; i += w) rows.push(x.slice(i, i + w));
  return {pal, rows};
}
JX.ps = deplierSprite(JX.ps + ";1:.").pal;
for (const k of Object.keys(JX.sprites)) JX.sprites[k] = deplierSprite(JX.sprites[k], JX.ps);
/* autocollants simples (communs, peu chers) : rangées [nom, prix, [[id, nom], …]] -> mêmes entrées [id, nom, prix, rangée] que les autres */
JX.autocollants = JX.simples.flatMap(([rg, prix, l]) => l.map(([i, n]) => ["s_" + i, n, prix, rg])).concat(JX.autocollants);
Object.assign(SPRITES, JX.sprites);
const GJ = JX.geos;
ICONES.jeux = [["r", 4, 4, 20, 20, 4], ["d", 8.6, 8.6, 1.5], ["d", 15.4, 8.6, 1.5], ["d", 12, 12, 1.5], ["d", 8.6, 15.4, 1.5], ["d", 15.4, 15.4, 1.5]];
const AC_TAILLE = 90;              // taille d'un autocollant sur une page de cahier (unités de page : 1000 = largeur)
const AC_TAILLE_TEXTE = 56;        // sur une note texte (pixels, × taille du texte)
const AC_MIN = 30, AC_MAX = 400;    // taille d'un autocollant (champ « t », mêmes bornes que normaliserAutocollant)

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
  vendus(d) {
    const out = {};
    for (const e of Object.values((d && d.geos) || {})) for (const [k, v] of Object.entries((e && e.v) || {})) out[k] = (out[k] || 0) + entierPositif(v);
    return out;
  },
  /* inventaire (v29/v27) = autocollants obtenus (achetés ou gagnés, tous appareils) − doublons revendus.
     Coller un autocollant ne le retire plus : il se réutilise à l'infini. */
  inventaire(d) {
    const a = this.achats(d), v = this.vendus(d), out = {};
    for (const [k, n] of Object.entries(a)) { const x = Math.max(0, n - (v[k] || 0)); if (x) out[k] = x; }
    return out;
  },
  /* revendre un doublon (on garde toujours au moins un exemplaire) : 75 % du prix, en géos */
  revendre(app, s) {
    const art = JX.autocollants.find(x => x[0] === s);
    if (!art || (this.inventaire(app.donnees)[s] || 0) < 2) return 0;
    const e = this.compte(app);
    e.v[s] = (e.v[s] || 0) + 1;
    return this.gagner(app, Math.floor(art[2] * JX.ac_revente), false) || (app.sauver(), 0);
  },
  /* autocollant gagné aux mini-jeux : un autocollant tiré au hasard, avec une chance « gain × mise / prix » (au plus ac_max) ;
     la valeur moyenne gagnée vaut donc ac_gain × mise : le retour de chaque jeu reste sous 100 % */
  tirageAutocollant(app, mise) {
    const l = JX.autocollants, art = l[alea(l.length)];
    if (!art || !(mise > 0) || aleaReel() >= Math.min(JX.ac_max, JX.ac_gain * mise / art[2])) return null;
    const e = this.compte(app), deja = (this.inventaire(app.donnees)[art[0]] || 0) > 0;
    e.a[art[0]] = (e.a[art[0]] || 0) + 1;
    app.sauver();
    return {s: art[0], nom: art[1], doublon: deja};
  },
  acheter(app, s) {
    const art = JX.autocollants.find(x => x[0] === s);
    if (!art || (this.inventaire(app.donnees)[s] || 0) > 0 || !this.depenser(app, art[2])) return false;
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
    /* croix en haut : toujours visible, même si la feuille est coupée par la barre de Safari */
    const x = el("button.bq-x", {type: "button", "aria-label": "Fermer", texte: "✕"});
    x.addEventListener("click", (e) => { e.preventDefault(); this.fermer(); });
    this.carte.append(x);
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
        const possede = inv[s] || 0, fx = effetAutocollant(s), revente = Math.floor(prix * JX.ac_revente);
        if (possede) {
          const etat = el("span.petit.muted", {texte: possede > 1 ? `À toi · ${possede - 1} doublon${possede > 2 ? "s" : ""}` : "À toi · utilisable à l'infini"});
          const vendre = possede > 1 ? bouton("", () => {
            const g = Geos.revendre(app, s);
            if (!g) return;
            SonJeux.jouer("achat"); Notifs.bulle(`Doublon de « ${nom} » revendu : +${fmtGeos(g)} ${M("p")}.`); this.dessiner();
          }, "ghost") : null;
          if (vendre) { vendre.classList.add("petit", "bq-prix", "bq-vendre"); vendre.title = `Revendre un doublon pour ${fmtGeos(revente)} ${M("p")} (75 % du prix)`; vendre.append(el("span", {texte: "Revendre"}), imgGeo(1), el("span", {texte: "+" + fmtGeos(revente)})); }
          g.append(el("div.carte.bq-art.possede" + (fx ? ".rare" : ""), null, imgAutocollant(s, 4, ".bq-img"), el("b", {texte: nom}),
            fx ? el("span.bq-rare.petit", {texte: "Rare · " + NOM_EFFET[fx]}) : null, etat, vendre || el("span.bq-coche.petit", {texte: "✓ Dans l'inventaire"})));
          continue;
        }
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
          el("span.petit.muted", {texte: "Pas encore à toi"}), b));
      }
      z.append(etiquette(r), g);
    }
  }
}

/* inventaire : choisir un autocollant à coller (répond l'id, ou null) */
function choisirAutocollant(app) {
  return new Promise((res) => {
    const m = new Modal("Mes autocollants", "Choisis un autocollant : il se pose sur la note (il reste dans ton inventaire), puis glisse-le où tu veux.");
    const inv = Geos.inventaire(app.donnees), g = el("div.bq-grille.ac-choix");
    let fait = false;
    const finir = (v) => { if (!fait) { fait = true; res(v); } };
    for (const [s, nom] of JX.autocollants) {
      if (!inv[s]) continue;
      g.append(el("button.carte.bq-art.ac-pick", {type: "button", onclick: () => { finir(s); m.fermer(); }}, imgAutocollant(s, 4, ".bq-img"), el("b", {texte: nom})));
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
/* même bouton, au format des outils de dessin (barre d'outils du cahier) */
function boutonOutilAutocollants(action) {
  return el("button.cah-outil.cah-outil-ac", {type: "button", title: "Autocollants", "aria-label": "Autocollants", onclick: action}, imgSprite("etoile", 2, ".cah-ac-img"));
}

/* copie d'un autocollant posé (v30/v28) : même image « s », même taille « t », même page, nouvel id, décalée de « d » ; n'achète rien */
function copieAutocollant(a, d, borne) {
  const c = Object.assign({}, a, {id: newId(), x: Math.round((a.x + d) * 10) / 10, y: Math.round((a.y + d) * 10) / 10});
  if (borne) { const m = (c.t || AC_TAILLE) / 2; c.x = Math.max(m, Math.min(borne[0] - m, c.x)); c.y = Math.max(m, Math.min(borne[1] - m, c.y)); }
  return c;
}
/* une barre flottante ne cache jamais ce qu'on manipule : si elle recouvre un des éléments donnés (autocollant choisi, poignée),
   elle passe en haut de la zone (classe « en-haut ») ; sinon elle reste en bas. Même règle sur le PC (barre_eviter). */
function eviterRecouvrement(barre, elems) {
  barre.classList.remove("en-haut");
  if (barre.hidden) return;
  const b = barre.getBoundingClientRect(), m = 16;
  for (const e of elems) {
    if (!e || e.hidden || !e.isConnected) continue;
    const r = e.getBoundingClientRect();
    if (r.right + m > b.left && r.left - m < b.right && r.bottom + m > b.top && r.top - m < b.bottom) { barre.classList.add("en-haut"); return; }
  }
}
/* barre flottante d'un autocollant choisi : Dupliquer, Retirer, fermer (mêmes boutons sur le PC) */
function remplirBarreAc(b, actions) {
  b.innerHTML = "";
  const pb = (t, titre, f, style) => { const x = petit(t, f, style || "ghost"); x.title = titre; x.setAttribute("aria-label", titre); return x; };
  b.append(el("span.petit.sel-nb", {texte: "Autocollant"}),
    pb("Dupliquer", "Dupliquer l'autocollant (Ctrl+D)", actions.dupliquer),
    pb("Retirer", "Retirer de la note (il reste dans l'inventaire)", actions.retirer, "danger"),
    el("button.bs-x.sel-x", {type: "button", title: "Fermer", "aria-label": "Désélectionner l'autocollant", texte: "✕", onclick: actions.fermer}));
  b.hidden = false;
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
  const x = el("button.ac-x", {type: "button", title: "Retirer de la note (il reste dans l'inventaire)", "aria-label": "Retirer l'autocollant"}, "✕");
  const fx = effetAutocollant(a.s);
  const poignee = el("button.ac-taille", {type: "button", title: "Glisser pour changer la taille", "aria-label": "Changer la taille de l'autocollant"});
  const z = el("div.ac-zone" + (fx ? ".ac-fx.ac-fx-" + fx : ""), {"data-id": a.id, style: fx ? {"--ac-masque": `url("${spriteURL(a.s, 4)}")`} : {}}, imgSprite(a.s, 4, ".ac-img"), x, poignee);
  z._ac = a;
  x.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); rappels.retirer(z._ac); });
  /* poignée (coin bas-droit, visible quand l'autocollant est choisi) : la taille suit la distance au centre */
  let gt = null;
  poignee.addEventListener("pointerdown", (e) => {
    e.preventDefault(); e.stopPropagation();
    try { poignee.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    const r = z.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    gt = {id: e.pointerId, cx, cy, d0: Math.max(8, Math.hypot(e.clientX - cx, e.clientY - cy)), t0: z._ac.t, x0: z._ac.x, y0: z._ac.y, deplace: false, taille: true};
    rappels.debut(gt);
  });
  poignee.addEventListener("pointermove", (e) => {
    if (!gt || gt.id !== e.pointerId) return;
    e.preventDefault();
    const t = Math.round(Math.max(AC_MIN, Math.min(AC_MAX, gt.t0 * Math.hypot(e.clientX - gt.cx, e.clientY - gt.cy) / gt.d0)));
    if (t !== z._ac.t) { gt.deplace = true; rappels.taille(z._ac, t); }
  });
  const finT = (e) => { if (!gt || gt.id !== e.pointerId) return; const g = gt; gt = null; try { poignee.releasePointerCapture(e.pointerId); } catch (er) { /* */ } rappels.fin(z._ac, g, false); };
  poignee.addEventListener("pointerup", finT); poignee.addEventListener("pointercancel", finT); poignee.addEventListener("lostpointercapture", finT);
  let g = null;
  z.addEventListener("pointerdown", (e) => {
    if (e.button > 0 || e.target === x || e.target === poignee) return;
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
    const ac = Geos.tirageAutocollant(this.app, mise);
    if (ac) {
      Notifs.bulle(`Autocollant gagné : « ${ac.nom} » !` + (ac.doublon ? " Doublon : tu peux le revendre à la boutique." : " Il est dans ton inventaire."));
      SonJeux.jouer("achat");
    }
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
