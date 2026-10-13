'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/onyx/onyx-core/shared-shells.js'), 'utf8');
const frame = {srcdoc: ''};
const baseURI = 'https://example.github.io/LifeHelpers/OurSpace/';
const sandbox = {
  document: {baseURI, getElementById(id) {return id === 'happyHomeFullscreenFrame' ? frame : null;}},
  TextEncoder, TextDecoder, Uint8Array, WeakSet, console,
  atob: encoded => Buffer.from(encoded, 'base64').toString('binary'),
  btoa: binary => Buffer.from(binary, 'binary').toString('base64')
};
sandbox.window = sandbox;
vm.runInNewContext(source, sandbox, {timeout: 3000});
sandbox.OnyxFullscreenShells.load('health');

const shell = frame.srcdoc;
assert(shell.includes('<base href="' + baseURI + '">'));
assert(shell.includes('id="happyHomeRoomFrame"'));
assert(shell.includes('id="catActor"'));
assert(shell.includes('id="professorActor"'));
assert(shell.includes('href="css/onyx/games/virtual/happy-home-shell_happy_home.css"'));
assert(shell.includes('src="js/onyx/games/virtual/happy-home-onyx-spatial-runtime.js"'));

const bootstrap = shell.match(/const e="([A-Za-z0-9+/=]+)";try\{f\.srcdoc/);
assert(bootstrap, 'nested finished-room bootstrap');
const room = Buffer.from(bootstrap[1], 'base64').toString('utf8');
assert(room.includes('<base href="' + baseURI + '">'));
assert(room.includes('id="world"'));
assert(room.includes('id="runtimeAssetLayer"'));
assert(room.includes('href="css/onyx/games/virtual/happy-home-editor.css"'));
assert(room.includes('src="js/onyx/games/virtual/happy-home-editor.js"'));
assert(room.includes('src="js/onyx/games/virtual/happy-home-inventory-room-bridge.js"'));
assert(room.includes('assets/video/games/virtual/room/sunset.mp4'));

for (const [name, doc] of [['shell', shell], ['room', room]]) {
  const stale = [...doc.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="((?:js|css)\/(?:games|happy-home)\/[^"]+)"/g)];
  assert.equal(stale.length, 0, name + ' still requests renamed code or CSS');
}
const known = new Set(JSON.parse(fs.readFileSync(path.join(root, 'json/frontend-manifest.json'), 'utf8')).files.map(file => file.path));
for (const [name, doc] of [['shell', shell], ['room', room]]) {
  for (const match of doc.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="((?:js|css)\/[^"]+)"/g)) {
    if (match[1].includes('/onyx-base-')) continue; // Pass 23 modules postdate the package manifest.
    assert(known.has(match[1]), name + ' references missing file: ' + match[1]);
  }
}
const scripts = [...shell.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
const index = name => scripts.indexOf('js/onyx/games/virtual/onyx-base-' + name + '.js');
for (const name of ['physics', 'sprites', 'gait', 'flipbook', 'profiles', 'navigation']) {
  assert(index(name) >= 0 && index(name) < index('runtime'), name + ' must precede motion runtime');
}
assert(index('sequences') > index('eat_drink'));
assert(index('happy-home-bridge') > index('sequences'));

const virtual = path.join(root, 'js/onyx/games/virtual');
const sequenceCalls = [];
const sequenceMotion = {
  getState: () => ({x: 100, y: 100}),
  getWorld: () => ({}),
  drink: options => {sequenceCalls.push(options); return {ok: true};}
};
const seqBox = {OnyxBaseMotion: sequenceMotion, OnyxBasePhysics: {clearApproach: () => true}};
seqBox.window = seqBox;
vm.runInNewContext(fs.readFileSync(path.join(virtual, 'onyx-base-sequences.js'), 'utf8'), seqBox);
assert(seqBox.OnyxBaseSequences.drinkAt({x: 100, y: 100}).ok);
assert.equal(sequenceCalls[0].mode, 'drink');

const capturedWorlds = [];
const actor = {
  version: '23.0',
  setWorld: world => {capturedWorlds.push(world); return {ok: true};},
  getState: () => ({x: 600, y: 680, z: 0}),
  setPosition: () => ({ok: true}),
  setMood() {},
  on: () => () => {},
  stop() {}
};
const zone = (id, type) => ({properties: {id, role: 'placed-furniture', interactiveType: type}, geometry: {
  type: 'Polygon', coordinates: [[[100, 600], [220, 600], [220, 700], [100, 700], [100, 600]]]
}});
const bridgeBox = {
  OnyxBaseMotion: actor,
  OnyxRoomSpatial: {W: 1916, H: 821, canWalkPoint: () => true,
    allFeatures: () => [zone('bowl', 'bowl'), zone('toy', 'toy'), zone('bed', 'bed')]},
  OnyxImperialExpedition: {getState: () => ({cat: {x: .5, y: .7}})},
  document: {querySelectorAll: () => [], addEventListener() {}},
  performance: {now: () => 100},
  requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  addEventListener() {}, dispatchEvent() {},
  CustomEvent: class {}
};
bridgeBox.window = bridgeBox;
vm.runInNewContext(fs.readFileSync(path.join(virtual, 'onyx-base-happy-home-bridge.js'), 'utf8'), bridgeBox);
assert(bridgeBox.OnyxHappyHomeMotion.refreshRoom().ok);
assert.equal(capturedWorlds.at(-1).obstacles.length, 1);
assert.equal(capturedWorlds.at(-1).obstacles[0].id, 'bed');

const placed = [
  {id: 'bowl', name: 'Bowl', interactiveType: 'bowl', x: 450, y: 650, w: 110, h: 80,
    contents: {food: {itemId: 'food-1', servings: 2}}},
  {id: 'fountain', name: 'Fountain', interactiveType: 'fountain', x: 650, y: 650, w: 100, h: 80, fountainOn: true},
  {id: 'toy', name: 'Mouse', interactiveType: 'toy', x: 750, y: 650, w: 100, h: 80},
  {id: 'bed', name: 'Bed', interactiveType: 'bed', x: 850, y: 620, w: 180, h: 100}
];
const used = [], saved = [];
const playBridge = {
  interact(kind, target, options) {
    used.push({kind, x: target.x, y: target.y, mode: options.mode});
    if (kind === 'eat') options.onBite();
    return {ok: true};
  },
  start: () => ({ok: true}),
  getWorld: () => ({}),
  getState: () => ({x: 800, y: 710}),
  action(name, options) {used.push({kind: name, hold: options.hold}); return {ok: true};}
};
const roomFrame = {contentWindow: {postMessage() {}}, addEventListener() {}};
const decorPanel = {querySelectorAll: () => [], classList: {contains: () => false}};
const inventoryBox = {innerHTML: ''};
const inventoryDocument = {
  getElementById: id => ({happyHomeRoomFrame: roomFrame, inventoryOwnedGrid: inventoryBox})[id] || null,
  querySelector: selector => selector === '[data-panel="decor"]' ? decorPanel : null,
  createElement: () => ({style: {}, setAttribute() {}, append() {}}),
  body: {append() {}}
};
const inventoryBoxContext = {
  document: inventoryDocument,
  localStorage: {getItem: () => JSON.stringify(placed), setItem: (key, value) => saved.push(JSON.parse(value))},
  HappyHomeStore: {getInventory: () => ({})},
  OnyxRoomSpatial: {getZone: id => ({geometry: {coordinates: id.includes('bowl') ? [505, 694] : [700, 694]}}),
    setDynamicPlacements() {}},
  OnyxHappyHomeMotion: playBridge,
  OnyxBasePhysics: {occupied: () => false},
  OnyxBaseSequences: {approach: (target, action) => action()},
  addEventListener() {}, setTimeout: () => 1, clearTimeout() {}, Date, Math, console
};
inventoryBoxContext.window = inventoryBoxContext;
vm.runInNewContext(fs.readFileSync(path.join(virtual, 'happy-home-inventory-placement.js'), 'utf8'), inventoryBoxContext);
const placement = inventoryBoxContext.HappyHomeInventoryPlacement;
assert(placement.useWithOnyx('bowl').ok);
assert.equal(used[0].kind, 'eat');
assert.equal(used[0].x, 505);
assert.equal(saved.at(-1).find(item => item.id === 'bowl').contents.food.servings, 1);
assert(placement.useWithOnyx('fountain').ok);
assert.equal(used[1].kind, 'drink');
assert.equal(used[1].mode, 'drink');
assert(placement.useWithOnyx('toy').ok);
assert.equal(used[2].kind, 'toy');
assert(placement.useWithOnyx('bed').ok);
assert.equal(used.at(-1).kind, 'sleep');
assert.equal(used.at(-1).hold, true);

console.log('PASS: finished room resources, Onyx load order, drink/feeding, furniture collision and interactions');

