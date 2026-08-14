#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

(async () => {
  const root = path.resolve(__dirname, '../..');
  const source = fs.readFileSync(path.join(root, 'viewer.js'), 'utf8');

  const scheduled = [];
  class DummyVector3 { constructor(){ this.x=0; this.y=0; this.z=0; } }
  class DummyClass {}
  const document = {
    getElementById(){ return null; },
    querySelectorAll(){ return []; }
  };
  const context = {
    console,
    document,
    URLSearchParams,
    setTimeout(fn){ scheduled.push(fn); return scheduled.length; },
    clearTimeout(){},
    atob(){ return ''; },
    Blob: function(){},
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    Math,
    Date,
    JSON,
    performance: { now: () => 0 },
    requestAnimationFrame(){},
  };
  context.window = context;
  context.location = { search: '', protocol: 'file:' };
  context.addEventListener = () => {};
  context.THREE = {};
  for (const name of ['AnimationMixer','BoxBufferGeometry','CatmullRomCurve3','Clock','Color','DirectionalLight','Euler','Group','HemisphereLight','Mesh','MeshBasicMaterial','MeshStandardMaterial','PerspectiveCamera','PointLight','Quaternion','Scene','Shape','ShapeBufferGeometry','SkeletonHelper','SphereBufferGeometry','TextureLoader','TubeBufferGeometry','WebGLRenderer']) context[name] = DummyClass;
  context.Vector3 = DummyVector3;
  context.DoubleSide = 2;
  context.PCFSoftShadowMap = 2;
  context.sRGBEncoding = 3001;
  context.FBXLoader = function(){};

  // Reproduce the direct-open Emscripten behavior exactly: .then() invokes the
  // success callback synchronously and DOES NOT return a normal Promise.
  context.Ammo = function(){
    return {
      then(resolve){ resolve({}); return undefined; }
    };
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'viewer.js' });
  if (scheduled.length !== 1) throw new Error(`Expected one deferred viewer boot; got ${scheduled.length}`);

  let starts = 0;
  let bindRan = false;
  context.init = function(){ starts += 1; context.bindMorphInspectionSliders(); bindRan = true; };
  context.animate = function(){};

  scheduled[0]();
  // Promise.resolve(AmmoThenable) assimilates the synchronous thenable and the
  // native Promise callback runs as a microtask. Give it two turns to settle.
  await Promise.resolve();
  await Promise.resolve();

  if (!bindRan) throw new Error('Deferred startup callback did not reach morph inspection binding.');
  if (starts !== 1) throw new Error(`Viewer started ${starts} times; expected exactly one.`);
  if (!source.includes('while (viewer.firstChild) viewer.removeChild(viewer.firstChild);')) {
    throw new Error('Single-canvas stale-renderer cleanup is missing.');
  }
  if (source.includes("ammoResult.then((AmmoLib) => startViewer(AmmoLib, '')).catch")) {
    throw new Error('Unsafe Ammo thenable .catch chain is still present.');
  }

  console.log('PASS: direct-open synchronous Ammo thenable starts exactly one viewer and one renderer canvas.');
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
