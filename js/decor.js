/* Décor animé du thème Hollow Knight : caverne en couches (cité lointaine, rayons, racines, cristaux, brume),
   poussière lumineuse qui fuit le doigt / le crayon / la souris, parallaxe légère et transitions entre les pages.
   Images dessinées en code (dossier decor/, mêmes dessins que sur le PC) : aucune image tirée du jeu.
   « Réduire les effets » (réglage propre à l'appareil) ou le réglage d'accessibilité du système coupent l'animation. */
"use strict";

const Decor = {
  el: null, cv: null, actif: false, anime: false, reduit: false,
  parts: [], cible: [0, 0], pos: [0, 0], doigt: null, _raf: 0, _dernier: 0,

  appliquer(reg) {
    const t = THEMES[reg.theme] || THEMES.nuit;
    const veut = t.decor === "hollow";
    let mouvementReduit = false;
    try { mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* vieux Safari */ }
    this.reduit = reg.reduire_effets === true || mouvementReduit;
    const r = document.documentElement.classList;
    r.toggle("decor-hollow", veut);
    r.toggle("effets-reduits", veut && this.reduit);
    this.actif = veut;
    if (veut && !this.el) this.construire();
    if (this.el) this.el.hidden = !veut;
    if (veut && !this.reduit) this.demarrer(); else this.arreter();
  },

  construire() {
    const img = (cls, nom) => el("img.dc-img." + cls, {src: "decor/" + nom + ".webp?v=1", alt: "", draggable: "false", decoding: "async"});
    this.cv = el("canvas.dc-particules");
    this.el = el("div", {id: "decor", "aria-hidden": "true"},
      el("div.dc-couche.dc-fond", null, el("div.dc-ciel"), img("dc-rayons", "hk_rayons"), el("div.dc-loin")),
      el("div.dc-couche.dc-milieu", null, img("dc-racines.g", "hk_racines"), img("dc-racines.d", "hk_racines"),
        img("dc-cristaux.g", "hk_cristaux"), img("dc-cristaux.d", "hk_cristaux")),
      el("div.dc-couche.dc-devant", null, el("div.dc-brume.b1"), el("div.dc-brume.b2")),
      this.cv, el("div.dc-vignette"), el("div.dc-voile"));
    document.body.prepend(this.el);
    const bouge = (e) => {
      if (!this.anime) return;
      this.doigt = [e.clientX, e.clientY, performance.now()];
      if (e.pointerType === "mouse" && !document.body.classList.contains("tel")) {
        this.cible = [e.clientX / innerWidth - .5, e.clientY / innerHeight - .5];
      }
    };
    addEventListener("pointermove", bouge, {passive: true});
    addEventListener("pointerdown", bouge, {passive: true});
    addEventListener("resize", () => { if (this.anime) this.dimensionner(); }, {passive: true});
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); else if (this.actif && !this.reduit) this.demarrer(); });
  },

  /* ---------- poussière lumineuse */
  dimensionner() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = innerWidth, h = innerHeight;
    this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    this.cv.style.width = w + "px"; this.cv.style.height = h + "px";
    this.dpr = dpr;
    const tel = document.body.classList.contains("tel");
    const n = tel ? 16 : Math.round(Math.min(44, Math.max(22, w * h / 32000)));
    while (this.parts.length < n) this.parts.push(this.particule(true));
    this.parts.length = n;
    this.pas = tel ? 1000 / 24 : 1000 / 30;          // iPhone : moins d'images par seconde (batterie)
  },
  particule(partout) {
    const h = innerHeight;
    return {x: Math.random() * innerWidth, y: partout ? Math.random() * h : h + 10, r: .7 + Math.random() * 1.8,
      v: 6 + Math.random() * 14, ph: Math.random() * 6.28, a: .25 + Math.random() * .55, dx: 0, dy: 0};
  },
  sprite() {
    if (this._sprite) return this._sprite;
    const c = document.createElement("canvas"); c.width = c.height = 32;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(232,252,248,1)"); gr.addColorStop(.25, "rgba(176,232,224,.55)"); gr.addColorStop(1, "rgba(159,216,208,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    return (this._sprite = c);
  },
  image(t) {
    const g = this.cv.getContext("2d"), dpr = this.dpr, dt = Math.min(.1, (t - (this._t || t)) / 1000);
    this._t = t;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    const sp = this.sprite();
    const d = this.doigt && t - this.doigt[2] < 1200 ? this.doigt : null;
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      p.ph += dt * .8;
      p.y -= p.v * dt;
      p.x += Math.sin(p.ph) * 8 * dt;
      if (d) {                                       // la poussière s'écarte doucement du doigt, du crayon ou de la souris
        const ex = p.x - d[0], ey = p.y - d[1], dd = ex * ex + ey * ey;
        if (dd < 16000 && dd > 1) { const f = (1 - dd / 16000) * 90 / Math.sqrt(dd); p.dx += ex * f * dt; p.dy += ey * f * dt; }
      }
      p.x += p.dx * dt * 3; p.y += p.dy * dt * 3; p.dx *= .94; p.dy *= .94;
      if (p.y < -12 || p.x < -20 || p.x > innerWidth + 20) { this.parts[i] = this.particule(false); continue; }
      const scint = .65 + .35 * Math.sin(p.ph * 2.3 + i);
      const s = p.r * 7;
      g.globalAlpha = p.a * scint;
      g.drawImage(sp, p.x - s / 2, p.y - s / 2, s, s);
    }
    g.globalAlpha = 1;
    // parallaxe : la souris déplace un peu les couches (pas au doigt : l'écran défile)
    this.pos[0] += (this.cible[0] - this.pos[0]) * .06;
    this.pos[1] += (this.cible[1] - this.pos[1]) * .06;
    this.el.style.setProperty("--px", this.pos[0].toFixed(4));
    this.el.style.setProperty("--py", this.pos[1].toFixed(4));
  },
  boucle(t) {
    if (!this.anime) return;
    this._raf = requestAnimationFrame((x) => this.boucle(x));
    if (t - this._dernier < this.pas - 2) return;
    this._dernier = t;
    this.image(t);
  },
  demarrer() {
    if (this.anime || document.hidden) return;
    this.anime = true;
    this.dimensionner();
    this._t = 0;
    this._raf = requestAnimationFrame((x) => this.boucle(x));
  },
  pause() { this.anime = false; cancelAnimationFrame(this._raf); },
  arreter() {
    this.pause();
    if (this.cv) { const g = this.cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height); }
    if (this.el) { this.el.style.setProperty("--px", "0"); this.el.style.setProperty("--py", "0"); }
    this.cible = [0, 0]; this.pos = [0, 0];
  },

  /* ---------- passage d'une page à l'autre : fondu lent et brume qui traverse */
  transition(ecran) {
    if (!this.actif || this.reduit || !ecran) return;
    ecran.classList.remove("dc-entree");
    void ecran.offsetWidth;
    ecran.classList.add("dc-entree");
    const v = this.el.querySelector(".dc-voile");
    v.classList.remove("passe");
    void v.offsetWidth;
    v.classList.add("passe");
  },
};
