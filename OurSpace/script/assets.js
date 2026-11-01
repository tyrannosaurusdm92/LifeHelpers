/* Locally bundled art. Seven transparent flying/landing bird atlases and
   exactly 21 cat-attached contact images. No solo feather assets exist. */
(function (WW) {
  'use strict';
  class AssetLibrary {
    constructor() {
      this.images = new Map(); this.states = new Map(); this.errors = [];
      this.total = 0; this.loaded = 0; this.failed = 0;
      this.wasStarted = false; this.wasmStatus = 'fallback';
      this.wasmExports = null; this.startTime = 0;
      this.listeners = new Set();
    }
    imagePath(key) { return '../../assets/' + key + '.png'; }
    fileKeys() {
      const keys = [];
      for (const species of Object.keys(WW.birdFrames.species)) {
        keys.push('bird-' + species);
      }
      const layers = {1:[1,2,3,5,6,7,8,10],2:[1,2,3,4],3:[1,2,3,4],4:[1,2,3,4],
        5:[1,2,3,4,5],6:[1,2,3],7:[1,2],8:[1]};
      for (const [biome, nums] of Object.entries(layers))
        for (const layer of nums) keys.push(`nature-${String(biome).padStart(2,'0')}-${layer}`);
      keys.push('tree-slender','tree-canopy');
      for(const cat of ['onyx','callie','harvey'])
        for(const species of Object.keys(WW.birdFrames.species))
          keys.push('cat-contact-'+cat+'-'+species);
      return keys;
    }
    onProgress(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
    announce() {
      const result = {loaded:this.loaded, total:this.total, failed:this.failed, errors:[...this.errors]};
      for (const cb of this.listeners) { try { cb(result); } catch (err) { console.warn(err); } }
    }
    async preload() {
      if (this.wasStarted) return this.ready;
      this.wasStarted = true; this.startTime = performance.now();
      const keys = this.fileKeys(); this.total = keys.length; this.announce();
      const jobs = keys.map(key => this.loadImage(key));
      this.ready = Promise.allSettled(jobs).then(() => {
        this.announce(); return {loaded:this.loaded, failed:this.failed};
      });
      return this.ready;
    }
    loadImage(key) {
      if (this.images.has(key)) return Promise.resolve(this.images.get(key));
      if (this.states.has(key)) return this.states.get(key);
      const promise = new Promise(resolve => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { this.loaded++; this.images.set(key,img); this.announce(); resolve(img); };
        img.onerror = () => {
          this.failed++; this.errors.push(this.imagePath(key)); this.announce(); resolve(null);
        };
        img.src = this.imagePath(key);
      });
      this.states.set(key, promise);
      return promise;
    }
    get(key) { return this.images.get(key) || null; }
    has(key) { return this.images.has(key); }
    bird(species) { return this.get(`bird-${species}`); }
    catContact(cat,species) { return this.get(`cat-contact-${cat}-${species}`); }
    layer(nature, id) { return this.get(`nature-${String(nature).padStart(2,'0')}-${id}`); }
    tree(kind = 'canopy') { return this.get(`tree-${kind}`); }
    dimensions(key) {
      const im = this.get(key);
      return im ? {width:im.naturalWidth, height:im.naturalHeight} : null;
    }
    async loadWasm(noise) {
      // Browsers block fetch(file://); the identical JS math remains fully usable.
      if (location.protocol === 'file:') return false;
      if (typeof WebAssembly !== 'object' || typeof fetch !== 'function') return false;
      try {
        const url = '../../script/terrain-kernel.wasm';
        let instance;
        if (WebAssembly.instantiateStreaming) {
          try {
            const result = await WebAssembly.instantiateStreaming(fetch(url), {});
            instance = result.instance;
          } catch (_) {
            const result = await WebAssembly.instantiate(await (await fetch(url)).arrayBuffer(), {});
            instance = result.instance;
          }
        } else {
          const result = await WebAssembly.instantiate(await (await fetch(url)).arrayBuffer(), {});
          instance = result.instance;
        }
        if (!noise.setWasm(instance)) return false;
        this.wasmStatus = 'accelerated'; this.wasmExports = instance.exports;
        return true;
      } catch (err) {
        this.wasmStatus = 'fallback';
        console.info('Outdoor scenery using JS terrain fallback:', err.message);
        return false;
      }
    }
    collectUsedLayers(world) {
      const found = new Set();
      for (const x of world.route) {
        const biome = world.biomeMap.get(x); if (!biome) continue;
        const layerMap = {1:[1,2,3,5,8],2:[1,2,3,4],3:[1,2,3,4],4:[1,2,3,4],
          5:[1,2,3,4],6:[1,2,3],7:[1,2],8:[1]};
        for (const n of layerMap[biome.nature] || []) found.add('nature-' + String(biome.nature).padStart(2,'0') + '-' + n);
      }
      return found;
    }
    report() {
      return {ready: this.loaded + this.failed === this.total, loaded: this.loaded,
        total: this.total, failed: this.failed, errors: this.errors,
        wasmStatus: this.wasmStatus, birdFrames: 7*33,
        catContactFrames: 3*7, separateFeatherAssets:0, source: 'Living bird atlases, user contact frames + VanaVie'};
    }
  }
  WW.AssetLibrary = AssetLibrary;
})(window.WanderingWorld = window.WanderingWorld || {});
