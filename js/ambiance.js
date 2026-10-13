/* Sons d'ambiance du thème Hollow Knight : vent sourd de caverne et gouttes d'eau avec écho.
   Le son est calculé en code (même algorithme que sur le PC), aucun fichier audio n'est téléchargé.
   Réglages propres à l'appareil : son_ambiance (coupé par défaut) et volume_ambiance (30 / 60 / 90). */
"use strict";

const SR_AMB = 22050, DUREE_AMB = 20;
function ambianceEchantillons(sr = SR_AMB, duree = DUREE_AMB) {
  const rnd = aleaGraine(graineTexte("caverne"));
  const L = sr * duree, X = sr;
  const vent = new Float32Array(L + X);
  let a1 = 0, a2 = 0;
  const k1 = 1 - Math.exp(-2 * Math.PI * 180 / sr), k2 = 1 - Math.exp(-2 * Math.PI * 420 / sr), w = 2 * Math.PI / L;
  for (let i = 0; i < L + X; i++) {
    a1 += (rnd() * 2 - 1 - a1) * k1;
    a2 += (a1 - a2) * k2;
    vent[i] = a2 * (.55 + .25 * Math.sin(w * 2 * i + .3) + .2 * Math.sin(w * 5 * i + 1.7));
  }
  for (let i = 0; i < X; i++) { const t = i / X; vent[i] = vent[i] * t + vent[L + i] * (1 - t); }   // raccord : la fin rejoint le début
  let pic = 1e-9;
  for (let i = 0; i < L; i++) pic = Math.max(pic, Math.abs(vent[i]));
  const out = new Float32Array(L);
  for (let i = 0; i < L; i++) out[i] = vent[i] / pic * .42;
  // gouttes : petite note qui monte vite et s'éteint, avec l'écho de la caverne
  const echos = [[0, 1], [Math.floor(.13 * sr), .34], [Math.floor(.29 * sr), .17], [Math.floor(.47 * sr), .08]];
  let t = .4;
  while (t < duree - .3) {
    const f0 = 650 + rnd() * 1500, a = .18 + rnd() * .32;
    const n0 = Math.floor(t * sr), n = Math.floor(.12 * sr);
    let ph = 0;
    for (let j = 0; j < n; j++) {
      const tt = j / sr;
      ph += 2 * Math.PI * f0 * (1 + 2.2 * Math.min(1, tt / .05)) / sr;
      const v = a * Math.sin(ph) * Math.exp(-tt * 38) * Math.min(1, j / 40);
      for (const [d, g] of echos) out[(n0 + j + d) % L] += v * g;
    }
    t += .45 + rnd() * 2.1;
  }
  pic = 0;
  for (let i = 0; i < L; i++) pic = Math.max(pic, Math.abs(out[i]));
  if (pic > .95) for (let i = 0; i < L; i++) out[i] *= .95 / pic;
  return out;
}

const Ambiance = {
  ctx: null, src: null, gain: null, veut: false, volume: 60, _ecoute: false,

  appliquer(reg) {
    const t = THEMES[reg.theme] || THEMES.nuit;
    this.veut = t.decor === "hollow" && reg.son_ambiance === true;
    this.volume = [30, 60, 90].includes(+reg.volume_ambiance) ? +reg.volume_ambiance : 60;
    if (!this._ecoute) {
      this._ecoute = true;
      // iPad / iPhone : le son ne peut démarrer qu'après un geste (toucher, clic, touche)
      const geste = () => { if (this.veut) this.demarrer(); };
      addEventListener("pointerdown", geste, {passive: true});
      addEventListener("keydown", geste, {passive: true});
      document.addEventListener("visibilitychange", () => {
        if (!this.ctx) return;
        if (document.hidden) this.ctx.suspend().catch(() => {});
        else if (this.veut) this.ctx.resume().catch(() => {});
      });
    }
    if (this.veut) this.demarrer(); else this.arreter();
  },
  demarrer() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (!this.src) {
        const ech = ambianceEchantillons();
        const buf = this.ctx.createBuffer(1, ech.length, SR_AMB);
        buf.getChannelData(0).set(ech);
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0;
        this.gain.connect(this.ctx.destination);
        this.src = this.ctx.createBufferSource();
        this.src.buffer = buf; this.src.loop = true;
        this.src.connect(this.gain);
        this.src.start();
      }
      if (this.ctx.state !== "running" && !document.hidden) this.ctx.resume().catch(() => {});
      const g = this.gain.gain, t = this.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(this.volume / 100, t + 1.2);   // montée douce
    } catch (e) { console.warn("ambiance", e); }
  },
  arreter() {
    if (!this.src) return;
    const src = this.src, ctx = this.ctx, g = this.gain.gain, t = ctx.currentTime;
    this.src = null;
    try { g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + .5); src.stop(t + .55); } catch (e) { /* déjà arrêté */ }
  },
  joue() { return !!(this.src && this.ctx && this.ctx.state === "running"); },
};
