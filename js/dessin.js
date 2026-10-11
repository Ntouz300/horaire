/* Notes manuscrites à l'Apple Pencil : pression, surligneur, gomme, rejet de la paume. */
"use strict";

const COULEURS_ENCRE = ["", "#ff5c7a", "#5b9bff", "#4fd1a1", "#f2d35b", "#b496ff"];

function tracerTrait(ctx, tr, k, encre) {
  const p = tr.p || [];
  let col = tr.c || encre;
  if (!estHex(col)) col = encre;
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (tr.o) ctx.globalAlpha = .38;
  const ep = (tr.e || 3) * k;
  if (p.length <= 3) {
    const r = Math.max(.6, ep * (.35 + (p[2] ?? 50) / 110)) / 2;
    ctx.beginPath(); ctx.arc(p[0] * k, p[1] * k, r, 0, Math.PI * 2); ctx.fill();
  } else if (tr.o) {
    ctx.lineWidth = ep;
    ctx.beginPath(); ctx.moveTo(p[0] * k, p[1] * k);
    for (let i = 3; i < p.length; i += 3) ctx.lineTo(p[i] * k, p[i + 1] * k);
    ctx.stroke();
  } else {
    for (let i = 3; i < p.length; i += 3) {
      const x0 = p[i - 3] * k, y0 = p[i - 2] * k, x1 = p[i] * k, y1 = p[i + 1] * k;
      ctx.lineWidth = Math.max(.8, ep * (.35 + (p[i - 1] + p[i + 2]) / 220));
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }
  ctx.restore();
}

function miniatureDessin(d) {
  const W = 260, lw = d.l || 1000, k = W / lw, H = Math.min(120, Math.max(40, (d.h || 600) * k));
  const cv = el("canvas.mini-dessin", {width: W * 2, height: H * 2, style: {width: W + "px", height: H + "px"}});
  const ctx = cv.getContext("2d");
  ctx.scale(2, 2);
  const encre = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#e8eef8";
  for (const tr of d.traits || []) tracerTrait(ctx, tr, k, encre);
  return cv;
}

class Croquis {
  constructor(zone, dessin) {
    this.zone = zone;
    this.d = dessin && dessin.traits ? dessin : {l: 1000, h: 700, traits: []};
    this.d.l = 1000;
    this.outil = "stylo"; this.couleur = ""; this.epaisseur = 3.2;
    this.doigt = false; this.penVu = false;
    this.histo = []; this.refait = [];
    this.trait = null; this.pointeur = null;
    const barre = el("div.barre-dessin");
    this.bOutils = {};
    for (const [k, t] of [["stylo", "✎ Stylo"], ["surligneur", "▮ Surligneur"], ["gomme", "⌫ Gomme"]]) {
      const b = petit(t, () => { this.outil = k; this.majBarre(); }); this.bOutils[k] = b; barre.append(b);
    }
    this.bCoul = [];
    for (const c of COULEURS_ENCRE) {
      const s = el("span.sw.encre", {style: {background: c || "var(--ink)"}, onclick: () => { this.couleur = c; if (this.outil === "gomme") this.outil = "stylo"; this.majBarre(); }});
      s.dataset.c = c; this.bCoul.push(s); barre.append(s);
    }
    this.ep = el("input.ep", {type: "range", min: "1", max: "12", step: "0.2", value: String(this.epaisseur)});
    this.ep.addEventListener("input", () => { this.epaisseur = parseFloat(this.ep.value); });
    this.bDoigt = petit("Doigt : non", () => { this.doigt = !this.doigt; this.majBarre(); });
    barre.append(this.ep, petit("↶", () => this.annuler()), petit("↷", () => this.refaire()), this.bDoigt,
      petit("+ Page", () => { this.d.h += 600; this.taille(); }), petit("Effacer", () => { if (this.d.traits.length) { this.histo.push(clone(this.d.traits)); this.d.traits = []; this.peindre(); } }, "danger"));
    this.cv = el("canvas.croquis");
    this.cadre = el("div.cadre-croquis", null, this.cv);
    zone.innerHTML = "";
    zone.append(barre, this.cadre, el("div.petit.muted", {texte: "Écris avec l'Apple Pencil ; la paume et le doigt font défiler (sauf si « Doigt : oui »)."}));
    this.ctx = this.cv.getContext("2d");
    this.majBarre();
    this.installer();
    requestAnimationFrame(() => this.taille());
    this._ro = new ResizeObserver(() => this.taille());
    this._ro.observe(this.cadre);
  }
  donnees() { return {l: this.d.l, h: Math.round(this.d.h), traits: this.d.traits}; }
  majBarre() {
    for (const [k, b] of Object.entries(this.bOutils)) b.className = "btn petit " + (k === this.outil ? "primary" : "ghost");
    for (const s of this.bCoul) s.classList.toggle("on", s.dataset.c === this.couleur && this.outil !== "gomme");
    this.bDoigt.textContent = "Doigt : " + (this.doigt ? "oui" : "non");
    this.cv.style.touchAction = this.doigt ? "none" : "pan-y";
  }
  taille() {
    const w = this.cadre.clientWidth;
    if (!w) return;
    this.k = w / this.d.l;
    const h = Math.round(this.d.h * this.k), dpr = window.devicePixelRatio || 1;
    this.cv.style.width = w + "px"; this.cv.style.height = h + "px";
    this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.peindre();
  }
  encre() { return getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#e8eef8"; }
  peindre() {
    const c = this.ctx, w = this.cv.width, h = this.cv.height;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.restore();
    // lignes de cahier
    const k = this.k;
    c.save(); c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--grid").trim(); c.lineWidth = 1;
    for (let y = 60; y < this.d.h; y += 60) { c.beginPath(); c.moveTo(0, y * k + .5); c.lineTo(this.d.l * k, y * k + .5); c.stroke(); }
    c.restore();
    const encre = this.encre();
    for (const tr of this.d.traits) tracerTrait(c, tr, k, encre);
    if (this.trait) tracerTrait(c, this.trait, k, encre);
  }
  installer() {
    const cv = this.cv;
    cv.addEventListener("touchstart", (e) => {
      if (Array.from(e.changedTouches).some(t => t.touchType === "stylus") || this.doigt) e.preventDefault();
    }, {passive: false});
    cv.addEventListener("touchmove", (e) => { if (this.trait || this.gommeActive) e.preventDefault(); }, {passive: false});
    cv.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") this.penVu = true;
      if (e.pointerType === "touch" && !this.doigt) return;         // rejet de la paume / défilement au doigt
      if (this.pointeur !== null) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      this.pointeur = e.pointerId;
      const [x, y, p] = this.point(e);
      if (this.outil === "gomme" || e.button === 5 || (e.buttons & 32)) {
        this.gommeActive = true; this.histo.push(clone(this.d.traits)); this.refait = []; this.gommer(x, y);
        return;
      }
      this.trait = {c: this.couleur, e: this.outil === "surligneur" ? this.epaisseur * 4 : this.epaisseur, p: [x, y, p]};
      if (this.outil === "surligneur") this.trait.o = 1;
      this.peindre();
    });
    cv.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.pointeur) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) {
        const [x, y, p] = this.point(ev);
        if (this.gommeActive) { this.gommer(x, y); continue; }
        if (!this.trait) continue;
        const t = this.trait.p, n = t.length;
        if (Math.hypot(x - t[n - 3], y - t[n - 2]) < 1.2) continue;
        t.push(x, y, p);
      }
      if (this.trait) this.peindre();
      if (y0bas(this, e)) { this.d.h += 300; this.taille(); }
    });
    const fin = (e) => {
      if (e.pointerId !== this.pointeur) return;
      this.pointeur = null;
      if (this.gommeActive) { this.gommeActive = false; return; }
      if (this.trait) {
        this.histo.push(clone(this.d.traits)); this.refait = [];
        this.d.traits.push(this.trait);
        this.trait = null;
        this.peindre();
      }
    };
    cv.addEventListener("pointerup", fin);
    cv.addEventListener("pointercancel", fin);
  }
  point(e) {
    const r = this.cv.getBoundingClientRect();
    const x = (e.clientX - r.left) / this.k, y = (e.clientY - r.top) / this.k;
    let p = e.pointerType === "pen" ? e.pressure : e.pointerType === "touch" ? .5 : (e.pressure || .5);
    if (!p) p = .5;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(p * 100)];
  }
  gommer(x, y) {
    const r = 14;
    const avant = this.d.traits.length;
    this.d.traits = this.d.traits.filter(tr => {
      const p = tr.p;
      for (let i = 0; i < p.length; i += 3) if (Math.hypot(p[i] - x, p[i + 1] - y) < r + (tr.e || 3)) return false;
      return true;
    });
    if (this.d.traits.length !== avant) this.peindre();
  }
  annuler() { if (!this.histo.length) return; this.refait.push(clone(this.d.traits)); this.d.traits = this.histo.pop(); this.peindre(); }
  refaire() { if (!this.refait.length) return; this.histo.push(clone(this.d.traits)); this.d.traits = this.refait.pop(); this.peindre(); }
}
function y0bas(c, e) {
  const r = c.cv.getBoundingClientRect();
  return c.trait && e.clientY > r.bottom - 30;
}
