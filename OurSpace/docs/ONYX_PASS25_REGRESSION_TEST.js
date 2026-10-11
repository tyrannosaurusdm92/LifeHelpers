/* OurSpace Pass 25 / Node.js regression checks.
   Run from OurSpace: node docs/ONYX_PASS25_REGRESSION_TEST.js
   No DOM or backend required. */
"use strict";
const assert=require("node:assert/strict");
require("../js/onyx/games/virtual/onyx-base-runtime.js");
const m=globalThis.OnyxBaseMotion;
let passed=0;
function test(name,run){run();console.log("PASS",name);passed++;}
const room=(obstacles=[],platforms=[])=>m.setWorld({width:700,height:700,obstacles,platforms,canOccupy:null});
function steps(n=30,dt=1/60){for(let i=0;i<n;i++)m.step(dt);}
function reset(x=200,y=200){m.stop();room();assert.equal(m.setPosition(x,y).ok,true);}
test("Eight compass directions",()=>assert.equal(Object.keys(m.directions).length,8));
test("Walk uses actual ground displacement",()=>{reset(300,300);m.steer(1,0);steps(12);assert.ok(m.getState().x>300);assert.ok(m.getState().travel>0);});
test("Walk/run keep a normalized diagonal",()=>{reset(300,300);m.steer(1,1,"run");steps(20);const s=m.getState();assert.ok(s.x>300&&s.y>300);assert.equal(s.dir,"south_east");});
test("Wall blocks movement",()=>{reset(340,300);room([{x:370,y:250,w:30,h:110,height:100}]);m.steer(1,0);steps(70);assert.ok(m.getState().x<=358.01);});
test("Vertical jump returns to ground",()=>{reset();assert.equal(m.jump("jump_up",{dx:0,dy:0}).ok,true);steps(15);assert.ok(m.getState().z>0);steps(45);assert.equal(m.getState().z,0);assert.equal(m.getState().job,null);});
test("Airborne movement cannot be replaced by stretch",()=>{reset();m.jump("jump_across",{x:300,y:200});assert.equal(m.perform("stretch").ok,false);m.stop();assert.equal(m.getState().z,0);});
test("Jump lands on supported elevated platform",()=>{reset(300,300);room([],[{x:350,y:240,w:130,h:160,z:48}]);const result=m.jump("jump_up",{x:420,y:300,floor:48});assert.equal(result.ok,true);steps(48);assert.equal(m.getState().floor,48);});
test("Unsafe landing is rejected",()=>{reset(300,300);room([{x:450,y:270,w:60,h:60,height:100}]);assert.equal(m.jump("jump_across",{x:470,y:300}).ok,false);});
test("Rest activity completes",()=>{reset();m.perform("loaf",{durationMs:450});steps(32);assert.equal(m.getState().job,null);});
test("Moving a bowl cancels held feeding",()=>{reset();const bowl={x:210,y:210};assert.equal(m.interact("eat",bowl,{hold:true}).ok,true);bowl.x=420;steps(2);assert.equal(m.getState().job,null);});
test("Manual takeover clears navigation",()=>{reset(150,150);assert.equal(m.navigateTo(450,150).ok,true);m.steer(0,1);assert.equal(m.getState().nav,null);});
test("Invalid positions do not corrupt state",()=>{reset();const prior=m.getState().x;assert.equal(m.setPosition(NaN,20).ok,false);assert.equal(m.getState().x,prior);});
console.log("PASS",passed,"total checks");
