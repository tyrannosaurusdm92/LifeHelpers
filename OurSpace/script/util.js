/* Wandering World — spatial mathematics, portable randomness and WASM acceleration.
   Adapted for a non-game renderer: no entity collision, levels or scoring. */
(function (WW) {
  'use strict';
  const TAU = Math.PI * 2;
  const ease = t => t * t * (3 - 2 * t);
  const smoother = t => t * t * t * (t * (t * 6 - 15) + 10);
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inverseLerp = (a, b, v) => b === a ? 0 : (v - a) / (b - a);
  const smoothstep = (a, b, x) => ease(clamp(inverseLerp(a, b, x), 0, 1));
  const modulo = (a, n) => ((a % n) + n) % n;
  const fract = x => x - Math.floor(x);
  const damp = (actual, target, lambda, dt) => lerp(actual, target, 1 - Math.exp(-lambda * dt));
  const wrapDelta = (a, b, limit) => modulo(a - b + limit / 2, limit) - limit / 2;
  const degToRad = x => x * Math.PI / 180;
  const sq = x => x * x;
  const hypot2 = (x, y) => Math.sqrt(x * x + y * y);
  const mix = (a, b, t) => Array.isArray(a) ? a.map((n, i) => lerp(n, b[i], t)) : lerp(a, b, t);
  const hexRgb = str => {
    const s = String(str || '#ffffff').replace('#', '');
    if (s.length === 3) return [0, 1, 2].map(i => parseInt(s[i] + s[i], 16));
    return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16) || 0);
  };
  const rgbHex = a => '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  const colorMix = (a, b, t) => rgbHex(mix(hexRgb(a), hexRgb(b), clamp(t, 0, 1)));
  const cssRgb = (hex, alpha = 1) => { const a = hexRgb(hex); return `rgba(${a[0]},${a[1]},${a[2]},${alpha})`; };
  const saturate = (hex, k) => {
    const [r, g, b] = hexRgb(hex), grey = r * .299 + g * .587 + b * .114;
    return rgbHex([lerp(grey, r, k), lerp(grey, g, k), lerp(grey, b, k)]);
  };
  function fnv1a(input) {
    const text = String(input);
    let value = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      value ^= text.charCodeAt(i);
      value = Math.imul(value, 0x01000193);
    }
    return value >>> 0;
  }
  function hash32(x) {
    x >>>= 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16;
    return x >>> 0;
  }
  function hash2(a, b, seed = 1) {
    return hash32((Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca77) ^ (seed >>> 0)) >>> 0);
  }
  function hashUnit(a, b, seed = 1) { return (hash2(a, b, seed) & 0xffff) / 65535; }
  class PRNG {
    constructor(seed) { this.seed = (typeof seed === 'string' ? fnv1a(seed) : seed) >>> 0 || 1234567; }
    next() {
      this.seed += 0x6d2b79f5;
      let t = this.seed;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 0x100000000;
    }
    between(a, b) { return lerp(a, b, this.next()); }
    int(a, b) { return Math.floor(this.between(a, b + 1)); }
    pick(a) { return a[Math.min(a.length - 1, Math.floor(this.next() * a.length))]; }
    bool(p = .5) { return this.next() < p; }
    sign() { return this.bool() ? -1 : 1; }
    gaussian(mean = 0, deviation = 1) {
      return mean + deviation * Math.sqrt(-2 * Math.log(Math.max(1e-8, this.next()))) * Math.cos(TAU * this.next());
    }
    fork(name) { return new PRNG(hash2(this.seed, fnv1a(name), 19832)); }
  }
  class PeriodicNoise {
    constructor(seed = 1) { this.seed = seed >>> 0; this.wasm = null; this.wasUsed = false; }
    setWasm(instance) {
      this.wasm = instance && instance.exports && typeof instance.exports.periodic_noise === 'function'
        ? instance.exports : null;
      return !!this.wasm;
    }
    sample(x, y = 0, cells = 64, period = cells, seedOffset = 0) {
      const seed = (this.seed + seedOffset) >>> 0;
      if (this.wasm) {
        this.wasUsed = true;
        return this.wasm.periodic_noise(x, y, cells, period, seed);
      }
      const gx = x * cells, gy = y * cells;
      const ax = Math.floor(gx), ay = Math.floor(gy);
      const u = ease(fract(gx)), v = ease(fract(gy));
      const px = modulo(ax, period), py = modulo(ay, period);
      const qx = (px + 1) % period, qy = (py + 1) % period;
      const a = lerp(hashUnit(px, py, seed), hashUnit(qx, py, seed), u);
      const b = lerp(hashUnit(px, qy, seed), hashUnit(qx, qy, seed), u);
      return lerp(a, b, v);
    }
    octave(x, y, octaves = 4, seedOffset = 0) {
      let value = 0, amp = 1, weight = 0, cells = 8;
      for (let i = 0; i < octaves; i++, cells *= 2) {
        value += this.sample(x, y, cells, cells, seedOffset + i * 127) * amp;
        weight += amp; amp *= .52;
      }
      return value / weight;
    }
    ridge(x, y, octaves = 4) { return 1 - Math.abs(this.octave(x, y, octaves) * 2 - 1); }
  }
  function binSearchFirst(list, target, get = v => v.x) {
    let l = 0, r = list.length;
    while (l < r) {
      let mid = (l + r) >>> 1;
      if (get(list[mid]) < target) l = mid + 1; else r = mid;
    }
    return l;
  }
  function chooseWeighted(rng, choices) {
    let total = 0;
    for (const [_, weight] of choices) total += Math.max(0, weight);
    let n = rng.next() * total;
    for (const [value, weight] of choices) {
      n -= Math.max(0, weight);
      if (n <= 0) return value;
    }
    return choices[choices.length - 1][0];
  }
  function drawRoundedRect(ctx, x, y, w, h, r = 3) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y); ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad); ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad); ctx.quadraticCurveTo(x, y, x + rad, y); ctx.closePath();
  }
  function pixelLine(ctx, x, y, ex, ey, color, width = 2) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'square';
    ctx.beginPath(); ctx.moveTo(Math.round(x), Math.round(y)); ctx.lineTo(Math.round(ex), Math.round(ey)); ctx.stroke();
  }
  function canvasGradient(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [pos, color] of stops) g.addColorStop(pos, color);
    return g;
  }
  function drawImage(ctx, image, x, y, width, height, opacity = 1, flipX = false) {
    if (!image || !image.complete || !image.naturalWidth) return;
    ctx.save(); ctx.globalAlpha *= opacity;
    if (flipX) { ctx.translate(Math.round(x + width), 0); ctx.scale(-1, 1); x = 0; }
    ctx.drawImage(image, Math.round(x), Math.round(y), Math.ceil(width), Math.ceil(height));
    ctx.restore();
  }
  function visibleToroidal(x, cameraX, worldSize, margin, width) {
    const delta = wrapDelta(x, modulo(cameraX, worldSize), worldSize);
    if (delta < -margin || delta > width + margin) return null;
    return delta;
  }
  function dynamicEvery(action, n, dt, holder, property) {
    holder[property] = (holder[property] || 0) + dt;
    let safety = 0;
    while (holder[property] >= n && safety++ < 20) { holder[property] -= n; action(); }
  }
  function loadFromStorage(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  }
  function saveToStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  WW.util = { TAU, ease, smoother, clamp, lerp, inverseLerp, smoothstep, modulo, fract, damp,
    wrapDelta, degToRad, sq, hypot2, mix, hexRgb, rgbHex, colorMix, cssRgb, saturate,
    fnv1a, hash32, hash2, hashUnit, PRNG, PeriodicNoise, binSearchFirst, chooseWeighted,
    drawRoundedRect, pixelLine, canvasGradient, drawImage, visibleToroidal,
    dynamicEvery, loadFromStorage, saveToStorage };
})(window.WanderingWorld = window.WanderingWorld || {});
