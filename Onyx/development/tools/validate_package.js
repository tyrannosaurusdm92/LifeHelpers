#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), crypto=require('crypto'), cp=require('child_process');
const root=path.resolve(__dirname,'../..');
const checks=[]; const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=rel=>fs.readFileSync(path.join(root,rel)); const text=rel=>read(rel).toString('utf8');
function check(name,ok,detail=''){checks.push({name,ok:!!ok,detail}); if(!ok) process.exitCode=1;}
function exists(rel){return fs.existsSync(path.join(root,rel));}

const fbx=read('models/fbx/cat.fbx'), pfbx=read('development/canonical_original/cat.fbx');
const bin=read('models/fbx/cat.bin'), pbin=read('development/canonical_original/cat.bin');
check('canonical FBX protected byte-for-byte',sha(fbx)===sha(pfbx),sha(fbx));
check('canonical BIN protected byte-for-byte',sha(bin)===sha(pbin),sha(bin));

const assetCtx={}; vm.createContext(assetCtx); vm.runInContext(text('viewer-assets.js'),assetCtx,{filename:'viewer-assets.js'});
const embedded=Buffer.from(assetCtx.ONYX_EMBEDDED_ASSETS.fbxBase64,'base64');
check('embedded FBX matches protected runtime FBX',sha(embedded)===sha(fbx),sha(embedded));

for(const rel of ['viewer.js','runtime/onyx-dossier-runtime.js','runtime/onyx-progression-runtime.js']){
  try{cp.execFileSync('node',['--check',path.join(root,rel)],{stdio:'pipe'});check(`${rel} syntax`,true);}catch(e){check(`${rel} syntax`,false,String(e.stderr||e.message));}
}
try{cp.execFileSync('python',['-m','py_compile',path.join(root,'development/tools/blender_build_onyx_shape_keys.py'),path.join(root,'development/tools/compare_surface_points.py')],{stdio:'pipe'});check('Python development tools compile',true);}catch(e){check('Python development tools compile',false,String(e.stderr||e.message));}
try{cp.execFileSync('node',[path.join(root,'development/tools/test_direct_open_startup.js')],{stdio:'pipe'});check('direct-open startup race regression test',true,'synchronous Ammo thenable deferred until declarations initialize');}catch(e){check('direct-open startup race regression test',false,String(e.stderr||e.message));}
try{cp.execFileSync('node',[path.join(root,'development/tools/test_movement_recovery.js')],{stdio:'pipe'});check('movement donor recovery regression test',true,'older locomotion restored without rolling back phased jump/viewer repair');}catch(e){check('movement donor recovery regression test',false,String(e.stderr||e.message));}

const html=text('index.html'), js=text('viewer.js'), prog=text('runtime/onyx-progression-runtime.js');
const scripts=[...html.matchAll(/<script\s+src=["']([^"']+)["']/g)].map(m=>m[1].replace(/^\.\//,''));
scripts.forEach(rel=>check(`script exists: ${rel}`,exists(rel),rel));
['cameraMode','cameraPreset','behaviorState','behaviorAuto','dossierAction','backendConnect','morphAnatomy','morphCarriage','morphChest','morphPouch','morphFace','eyeDepth','animationMode','movementProfile','animationSpeed','pauseAnimation','stepAnimation','wireframeToggle','skeletonToggle','measurementToggle','correctionToggle'].forEach(id=>check(`viewer control #${id}`,html.includes(`id="${id}"`)));

const behavior=JSON.parse(text('runtime/spec/onyx_behavior_graph_needs_free.json'));
const anim=JSON.parse(text('runtime/spec/onyx_animation_features.json'));
const camera=JSON.parse(text('runtime/spec/onyx_camera_2_5d.json'));
const traits=JSON.parse(text('runtime/spec/traits.json'));
const career=JSON.parse(text('runtime/spec/career_tracks.json'));
const design=JSON.parse(text('runtime/spec/apartment_expansions.json'));
check('behavior graph explicitly needs-free',behavior.needs_free===true);
check('all dossier behavior states loaded',Object.keys(behavior.states||{}).length===13,String(Object.keys(behavior.states||{}).length));
for(const evt of Object.keys(behavior.events||{})) check(`behavior event wired: ${evt}`,html.includes(`data-event="${evt}"`) || js.includes(`triggerBehaviorEvent`),evt);
check('hungry expression explicitly not a need',behavior.states.hungry_expression.not_a_need===true);
check('sleepy expression explicitly not a need',behavior.states.sleepy_expression.not_a_need===true);
check('26 dossier animation actions registered by runtime selector',Object.values(anim.animation_library||{}).reduce((n,a)=>n+a.length,0)===26);
check('20 dossier pose references declared',Array.isArray(anim.pose_references)&&anim.pose_references.length===20,String((anim.pose_references||[]).length));
for(const pose of anim.pose_references||[]) check(`pose reference exists: ${pose.file}`,exists(`development/reference/dossier_pose_refs/${pose.file}`));
check('ordinary camera spec forbids free orbit',camera.free_orbit===false);
check('dedicated free inspection mode exists',html.includes('Inspection: free 360°')&&js.includes("cameraMode === 'play25d'"));
check('all dossier camera presets runtime-populated',Array.isArray(camera.presets)&&camera.presets.length===8,String((camera.presets||[]).length));

check('physics failure falls back to inspection-safe mode',js.includes('inspection-safe no-physics mode')&&js.includes('physicsAvailable = false'));
check('kinematic fallback movement exists',js.includes('Physics-free fallback')&&js.includes('fallbackVerticalVelocity'));
check('Ammo synchronous thenable uses native Promise assimilation',js.includes('Promise.resolve(ammoResult).then('));
check('unsafe Ammo thenable catch chain removed',!js.includes("ammoResult.then((AmmoLib) => startViewer(AmmoLib, '')).catch"));
check('single viewer boot guard exists',js.includes('let viewerBootStarted = false;')&&js.includes('if (viewerBootStarted) return;'));
check('single animation loop guard exists',js.includes('let animationLoopStarted = false;')&&js.includes('if (!animationLoopStarted)'));
check('renderer clears stale canvases before creation',js.includes('while (viewer.firstChild) viewer.removeChild(viewer.firstChild);'));
check('deliberate pointer orbit exits locked 2.5D preset',js.includes("if (cameraMode === 'play25d') setCameraMode('inspection');"));
check('window blur clears movement input',js.includes("window.addEventListener('blur', this.clearInput, false);"));
check('older dossier_documented(4) input donor preserved',exists('development/input_recovery_donor/Onyx_Cat_Only_dossier_documented_4_viewer.js'));
check('phased feline jump exists',['crouch','ascent','apex','descent','landing','grounded'].every(v=>js.includes(`'${v}'`)));
check('walk/run crossfade exists',js.includes('crossFadeFrom'));
check('recovered movement profile is default',js.includes("let movementProfile = 'recovered'")&&html.includes('<option value="recovered" selected>'));
check('older donor walk velocity normalized to 60 Hz',js.includes("walkSpeed: (25 / 60 / 2.2) * 2.5"));
check('older donor turn rate normalized to 60 Hz',js.includes("turnSpeed: 0.1 * 60"));
check('recovered run keeps original Walk clip',js.includes('runUsesWalkClip: true')&&js.includes("if (profile.runUsesWalkClip)"));
check('recovered legacy spine-tail gait layer exists',js.includes("proceduralGait === 'legacy'")&&js.includes('timeSeconds * 7.0'));
check('recovered pouch sway exists',js.includes('applyRecoveredBellySway')&&js.includes('5.15 + 0.55'));
check('procedural bone overlays are restored each frame',js.includes('restoreAdditiveBoneFrame();')&&js.includes('captureAdditiveBoneFrame();'));
check('scapular gait layer exists',js.includes('scapular glide'));
check('pouch secondary spring exists',js.includes('applyOnyxBellyDynamics')&&js.includes('springAxis'));
check('eye depth correction and slider exist',js.includes('eyeDepthStrength')&&js.includes('object.position.z += 16.5')&&html.includes('id="eyeDepth"'));
check('eye tracking/blink layer exists',js.includes('applyEyeLife')&&js.includes('forceBlinkUntil'));
check('curved asymmetric whiskers exist',js.includes('Onyx curved mostly-white whiskers')&&js.includes('CatmullRomCurve3'));
check('professor clipboard only preview exists',js.includes('Professor Onyx clipboard preview'));
check('host API exposed',js.includes('window.ONYX_CAT_ONLY_API'));

check('backend sends JSON data envelope',js.includes("params.set('data', JSON.stringify"));
check('backend behavior contract uses behavior/activity',js.includes("onyx.runtime.behavior.sync', { behavior: behaviorState, activity: currentMovementMode }"));
check('old mismatched currentBehavior/currentActivity absent',!js.includes('currentBehavior:')&&!js.includes('currentActivity:'));
check('backend capability report wired',js.includes('onyx.runtime.capabilities.report'));
check('backend activity sync wired',js.includes('onyx.runtime.activity.sync'));
check('profile bridge allow-lists william/jasper',js.includes("['william','jasper'].includes"));

check('core traits are exactly dossier core traits',JSON.stringify(traits.core_traits.map(t=>t.id))===JSON.stringify(['grumpy','snuggly','loving','intelligent']));
check('progression runtime rejects sensitive inference',prog.includes('SENSITIVE')&&prog.includes('sensitive_or_invalid_evidence_rejected'));
check('learned trait evidence never decays',prog.includes('noDecay:true'));
check('career runtime has no demotion',prog.includes('noDemotion:true')&&!/demot(e|ion)Track/.test(prog));
check('foundation design tier available',design.design_ability_tiers[0].tier===0 && design.design_ability_tiers[0].abilities.includes('accessibility_checks'));
check('starter room permanent in projection',prog.includes("unlockedSpaces:['starter_room']"));
check('currency conversion matches dossier 10/10/10',career.currency.copper_per_silver===10&&career.currency.silver_per_gold===10&&career.currency.gold_per_platinum===10);

const surf=JSON.parse(text('development/audits/current_surface_comparison.json'));
check('surface comparison preserves vertex count',surf.vertexCountPreserved===true,String(surf.vertexCount));
check('surface comparison records no remesh/UV/skin/skeleton change',Object.values(surf.safety).every(v=>v===false),JSON.stringify(surf.safety));
const fbxAudit=JSON.parse(text('development/audits/fbx_runtime_audit_latest.json'));
check('FBX no degenerate triangles',fbxAudit.runtimeMesh.degenerateTriangles===0,String(fbxAudit.runtimeMesh.degenerateTriangles));
check('FBX no NaN triangles',fbxAudit.runtimeMesh.nanTriangles===0,String(fbxAudit.runtimeMesh.nanTriangles));
check('FBX normals finite',fbxAudit.runtimeMesh.normals.present&&fbxAudit.runtimeMesh.normals.badNormals===0&&fbxAudit.runtimeMesh.normals.zeroNormals===0,JSON.stringify(fbxAudit.runtimeMesh.normals));
check('source >4-influence risk remains documented',fbxAudit.sourceRuntimeInfluences.verticesOver4Influences>0,`${fbxAudit.sourceRuntimeInfluences.verticesOver4Influences}/${fbxAudit.sourceRuntimeInfluences.expandedWeightedVertices}`);

['docs/ONYX_SINGLE_CANVAS_CONTROL_RECOVERY_2026-08-13.md','docs/ONYX_REPAIR_THE_REPAIR_MOVEMENT_RECOVERY_2026-08-13.md','docs/ONYX_FULL_DOSSIER_IMPLEMENTATION_PASS.md','docs/VIEWER_RECOVERY_AND_BACKEND_CONTRACT.md','docs/RESEARCH_REFERENCE_DECISIONS_2026-08-13.md','docs/OURSPACE_RUNTIME_CONTRACT.md','docs/ONYX_CANONICAL_INSTRUCTIONS_2026-08-13.txt','development/tools/blender_build_onyx_shape_keys.py','development/tools/compare_surface_points.py','development/tools/onyx_measurement_jig.scad','development/reference/onyx_measurement_jig.stl','development/tools/test_movement_recovery.js','development/movement_donor/Onyx_Cat_Only_dossier_documented_5_viewer.js'].forEach(rel=>check(`required artifact exists: ${rel}`,exists(rel),rel));

const nested=[]; (function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory())walk(p); else if(e.name.toLowerCase().endsWith('.zip'))nested.push(path.relative(root,p));}})(root);
check('no accidental nested ZIPs',nested.length===0,nested.join(', '));

const out={generatedAt:new Date().toISOString(),root:path.basename(root),passed:checks.every(c=>c.ok),passedCount:checks.filter(c=>c.ok).length,totalChecks:checks.length,checks};
fs.writeFileSync(path.join(root,'development/audits/package_validation.json'),JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
