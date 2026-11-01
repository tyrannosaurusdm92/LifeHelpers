/* Deterministic, toroidal world model. One long landscape with a quiet seam. */
(function (WW) {
  'use strict';
  const U = WW.util;
  class World {
    constructor(config) {
      this.configure(config);
    }
    configure(config) {
      this.config = config;
      this.seed = config.seed || 604203;
      this.length = Number(config.worldLength) || 46080;
      this.route = config.route.slice();
      this.chapterWidth = this.length / this.route.length;
      this.transitionWidth = U.clamp(Number(config.transitionWidth) || 660, 40, this.chapterWidth * .6);
      this.biomes = config.biomes.slice();
      this.biomeMap = new Map(this.biomes.map(b => [b.id, b]));
      this.noise = new U.PeriodicNoise(this.seed);
      this.random = new U.PRNG(this.seed);
      this.items = [];
      this.populate();
    }
    chapterAt(worldX) {
      const x = U.modulo(worldX, this.length);
      const index = Math.floor(x / this.chapterWidth);
      const local = x - index * this.chapterWidth;
      return {x, index, local, name:this.route[index],
        progress:local / this.chapterWidth};
    }
    biomeAt(worldX) {
      const chapter = this.chapterAt(worldX);
      return this.biomeMap.get(chapter.name) || this.biomes[0];
    }
    blendAt(worldX) {
      const ch = this.chapterAt(worldX);
      const nextIndex = (ch.index + 1) % this.route.length;
      const t = U.smoothstep(this.chapterWidth - this.transitionWidth,
        this.chapterWidth, ch.local);
      return {a:this.biomeMap.get(ch.name), b:this.biomeMap.get(this.route[nextIndex]), t,
        chapterIndex:ch.index, local:ch.local, worldX:ch.x};
    }
    blendColor(worldX, key) {
      const {a,b,t} = this.blendAt(worldX);
      return U.colorMix(a[key], b[key], t);
    }
    blendNumber(worldX, key) {
      const {a,b,t} = this.blendAt(worldX);
      return U.lerp(a[key] || 0,b[key] || 0,t);
    }
    groundHeight(worldX) {
      const x = U.modulo(worldX, this.length) / this.length;
      // All basis periods are whole-number cycles; h(0) === h(worldLength).
      const n = this.noise.octave(x, 0.31, 5, 1307);
      const m = this.noise.octave(x, 0.74, 3, 701);
      const waves = Math.sin(U.TAU * x * 7 + .3) * .0065 + Math.sin(U.TAU * x * 19) * .0033;
      const slow = Math.sin(U.TAU * x * 3 + 1.5) * .009;
      return U.clamp(.785 + (n - .5) * .065 + (m - .5) * .036 + waves + slow, .71, .86);
    }
    groundY(worldX, height) { return this.groundHeight(worldX) * height; }
    groundSlope(worldX) {
      return (this.groundHeight(worldX + 5) - this.groundHeight(worldX - 5)) / 10;
    }
    waterline(worldX) {
      const ch = this.chapterAt(worldX);
      const biome = this.biomeMap.get(ch.name);
      const wave = this.noise.sample(ch.x/this.length, .34, 32, 32, 72);
      return biome.water > .8 && wave > .3 ? .81 : null;
    }
    forEachSection(fn) {
      for (let i = 0; i < this.route.length; i++) {
        const biome = this.biomeMap.get(this.route[i]);
        fn({index:i, biome, x0:i*this.chapterWidth, x1:(i+1)*this.chapterWidth});
      }
    }
    // The objects are decoration only. No hitboxes or game interactions.
    populate() {
      this.items.length = 0;
      const rng = new U.PRNG(this.seed ^ 0x9b3e71);
      this.forEachSection(({index,biome,x0,x1}) => {
        const sectionRng = rng.fork(index + '-' + biome.id);
        const treeCount = Math.round(this.chapterWidth / 175 * biome.treeDensity);
        const shrubs = Math.round(this.chapterWidth / 95 * (.36 + biome.treeDensity * .35));
        const flowers = Math.round(this.chapterWidth / 82 * biome.flowers);
        const stones = Math.round(this.chapterWidth / 320 * (1.25 - biome.treeDensity * .38));
        const grasses = Math.round(this.chapterWidth / 38 * (1.5 - biome.treeDensity * .2));
        const pools = Math.round(this.chapterWidth / 1200 * biome.water);
        const create = (type,n,sizeMin,sizeMax,depthMin,depthMax) => {
          for (let j = 0; j < n; j++) {
            const x = x0 + sectionRng.between(0,this.chapterWidth);
            const depth = sectionRng.between(depthMin,depthMax);
            const size = sectionRng.between(sizeMin,sizeMax);
            const selection = sectionRng.next();
            const item = {x:U.modulo(x,this.length), type, depth,size,seed:sectionRng.int(1,1e9),
              variant:sectionRng.int(0,6), flip:sectionRng.bool(), tint:sectionRng.next(),
              bend:sectionRng.between(.3,2.5), seedPhase:sectionRng.between(0,U.TAU),
              quantity:sectionRng.int(2,9),spread:sectionRng.between(6,48),
              hue:sectionRng.between(-.1,.1), selection,
              biome:biome.id, chapter:index};
            this.items.push(item);
          }
        };
        create('tree', treeCount, .60,1.75, .48,1);
        create('shrub', shrubs, .55,1.8, .6,1.25);
        create('flowers', flowers, .7,1.3, .65,1.35);
        create('rock', stones, .65,2.15, .72,1.3);
        create('grass', grasses, .5,1.25, .75,1.4);
        create('pond', pools, .75,2.4, .78,1.05);
        create('reed', Math.round(pools*5), .55,1.5, .8,1.2);
        create('log', Math.round(treeCount*.12), .8,1.4, .7,1.2);
        create('mushroom', Math.round(treeCount*.45), .7,1.2, .85,1.2);
        if (biome.id==='standingstones') create('monolith', sectionRng.int(6,10),.8,1.7,.8,1);
        if (biome.id==='seabright') create('seagrass', sectionRng.int(13,30),.6,1.6,.8,1.3);
      });
      this.items.sort((a,b) => a.x-b.x || a.type.localeCompare(b.type));
      this.counts = this.items.reduce((counts,item) => {
        counts[item.type] = (counts[item.type] || 0)+1; return counts;
      }, {});
    }
    objectsNear(cameraX, width, padding = 180, predicate = null) {
      const result = [];
      const start = U.modulo(cameraX-padding,this.length);
      const end = start + width + padding*2;
      const append = (low,high) => {
        const first = U.binSearchFirst(this.items,low);
        for (let i = first; i < this.items.length && this.items[i].x <= high; i++) {
          const o = this.items[i];
          if (!predicate || predicate(o)) {
            const screenX = U.wrapDelta(o.x,U.modulo(cameraX,this.length),this.length);
            if (screenX >= -padding && screenX <= width+padding) result.push({item:o,screenX});
          }
        }
      };
      if (end <= this.length) append(start,end);
      else { append(start,this.length); append(0,end-this.length); }
      // When the visible start crosses wrap, objectsNear runs a wrapped range.
      result.sort((a,b) => a.item.depth-b.item.depth || a.screenX-b.screenX);
      return result;
    }
    nearestTree(worldX,radius=120) {
      let best = null, dist = Infinity;
      const candidate = this.items;
      const first = U.binSearchFirst(candidate, U.modulo(worldX,this.length) - radius);
      // Search a small, local segment; a periodic fallback handles seam cases.
      for (let k = Math.max(0,first-4);k < Math.min(candidate.length,first+80);k++) {
        const item = candidate[k]; if (item.type!=='tree') continue;
        const d = Math.abs(U.wrapDelta(item.x,worldX,this.length));
        if (d < dist && d < radius) { best=item; dist=d; }
      }
      if (!best) {
        for (let i=0;i<Math.min(24,candidate.length);i++) {
          for (const item of [candidate[i], candidate[candidate.length-1-i]]) {
            if (item.type!=='tree') continue;
            const d=Math.abs(U.wrapDelta(item.x,worldX,this.length));
            if (d < dist && d < radius) {best=item;dist=d;}
          }
        }
      }
      return best;
    }
    birdFriendly(worldX) {
      const {a,b,t} = this.blendAt(worldX);
      return Math.max(.18, 1 - U.lerp(a.water,b.water,t)*.2);
    }
    getWeatherAt(worldX) {
      // Continuous deterministic conditions: low-frequency rain + mist.
      const x = U.modulo(worldX,this.length)/this.length;
      const v = this.noise.octave(x,.817,3,935);
      const chance = this.blendNumber(worldX,'water')*.22+.13;
      const rain = U.smoothstep(.68-chance*.3,.83-chance*.22,v);
      const mist = this.blendNumber(worldX,'mist');
      const wind = .35+this.noise.sample(x,.34,16,16,237)*.55;
      return {rain,wind,mist,cloud:.2+v*.45};
    }
    inspect() {
      return {length:this.length,chapters:this.route.length,chapterWidth:this.chapterWidth,
        seam:{first:this.route[0],last:this.route.at(-1),heightError:Math.abs(this.groundHeight(0)-this.groundHeight(this.length))},
        counts:{...this.counts},repeatable:true};
    }
  }
  WW.World = World;
})(window.WanderingWorld = window.WanderingWorld || {});
