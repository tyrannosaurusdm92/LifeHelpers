'use strict';
const assert=require('node:assert/strict');
require('../js/onyx/games/virtual/onyx-animation-controller.js');
const a=globalThis.OnyxAnimationController;
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name)}
check('Six authored views',()=>{const c=a.create();for(const dir of ['north','south','east','west','north_east','south_west']){const s=c.setDirection(dir);assert.ok(s.col>=0&&s.col<30);}});
check('Stationary gait freezes',()=>{const c=a.create();c.setAction('walk');c.tick(80,25);const phase=c.getFrame().phase;c.tick(200,0);assert.equal(c.getFrame().phase,phase)});
check('Travel advances gait',()=>{const c=a.create();c.setAction('walk');const f=c.getFrame().phase;c.tick(20,18);assert.notEqual(c.getFrame().phase,f)});
check('Reduced motion',()=>{const c=a.create({reducedMotion:true});c.setAction('run');c.tick(80,30);assert.equal(c.getFrame().phase,0)});
check('Pause freezes',()=>{const c=a.create();c.setAction('action');c.tick(30);const old=c.getFrame().elapsedMs;c.setPaused(true);c.tick(120);assert.equal(c.getFrame().elapsedMs,old)});
check('Weighted idle',()=>{const c=a.create({profile:{weights:{idle:[1,0,0,0,0]}}});c.tick(1200);assert.equal(c.getFrame().phase,0)});
check('Side-preserving north/south',()=>{const c=a.create();c.setDirection('west');assert.equal(c.setDirection('north').authoredFacing,'north_west');assert.equal(c.setDirection('south').authoredFacing,'south_west')});
check('Invalid frame time',()=>{const c=a.create();c.tick(NaN,20);assert.equal(c.getFrame().elapsedMs,0)});
console.log('Pass 35',passed,'checks passed');
