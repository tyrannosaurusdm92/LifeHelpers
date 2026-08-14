#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const current = fs.readFileSync(path.join(root, 'viewer.js'), 'utf8');
const donor = fs.readFileSync(path.join(root, 'development/movement_donor/Onyx_Cat_Only_dossier_documented_5_viewer.js'), 'utf8');
function assert(ok, msg){ if(!ok) throw new Error(msg); }
assert(donor.includes('this.movementSpeed = 25;'), 'Older donor movementSpeed=25 not found.');
assert(donor.includes('physicsWorld.stepSimulation(delta * 2.5, 10);'), 'Older donor 2.5x physics step not found.');
assert(donor.includes('rotay -= 0.1;') && donor.includes('rotay += 0.1;'), 'Older donor +/-0.1 frame steering not found.');
assert(donor.includes('timeSeconds * 7.0'), 'Older donor restrained gait phase not found.');
assert(donor.includes('timeSeconds * 5.15 + 0.55'), 'Older donor pouch phase not found.');
assert(current.includes("let movementProfile = 'recovered';"), 'Recovered profile is not default.');
assert(current.includes('walkSpeed: (25 / 60 / 2.2) * 2.5'), '60 Hz normalized donor walk speed missing.');
assert(current.includes('turnSpeed: 0.1 * 60'), '60 Hz normalized donor turn rate missing.');
assert(current.includes('runUsesWalkClip: true'), 'Recovered run must keep Walk clip like donor.');
assert(current.includes("proceduralGait === 'legacy'"), 'Recovered legacy gait overlay missing.');
assert(current.includes('applyRecoveredBellySway'), 'Recovered belly sway missing.');
assert(current.includes('restoreAdditiveBoneFrame();') && current.includes('captureAdditiveBoneFrame();'), 'Per-frame additive bone reset missing.');
assert(current.includes('applyOnyxJumpPose();'), 'New phased feline jump must remain preserved.');
assert(current.includes('physicsAvailable'), 'Viewer recovery/physics fallback must remain preserved.');
console.log('PASS: older dossier-documented movement is restored as the default recovered profile while newer jump/viewer/body systems remain available.');
