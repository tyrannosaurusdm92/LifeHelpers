var THREE = { AnimationMixer, BoxBufferGeometry, CatmullRomCurve3, Clock, Color, DirectionalLight, DoubleSide, Euler, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PointLight, Quaternion, Scene, Shape, ShapeBufferGeometry, SkeletonHelper, SphereBufferGeometry, TextureLoader, TubeBufferGeometry, Vector3, WebGLRenderer, sRGBEncoding };

// The protected FBX/BIN are the original SmellyCat cat asset lineage, but this viewer no
// longer preserves SmellyCat's crude movement controller. It keeps the source rig/animations
// while layering Onyx-specific body morphs, feline gait blending, idle life and jump posing.

const INCH_M = 0.0254;
const FOOT_M = 0.3048;

// Real-world calibration. Three/Ammo world units are meters.
// The FBX Cat mesh has an internal ~100x node scale; a root scale of ~0.000775
// maps its nose -> tail-base span to the midpoint of Onyx's measured 22-25 in range.
const ONYX_REAL = {
  weightLb: 27,
  weightKg: 27 * 0.45359237,
  noseToTailBaseIn: 23.5,
  tailIn: 14.5,
  normalOverallIn: 38,
  stretchedOverallIn: 41,
  shoulderHeightIn: 14,
  chestWidthIn: 11,
  curledLengthIn: 19.5,
  curledWidthIn: 13.5
};

// This is a measured CALIBRATION ROOM, not a claim about the dimensions of the
// user's real room. It gives the viewer a human/cat-scale space instead of the
// previous enormous 8 m x 8 m blank box.
const ROOM_REAL = {
  widthFt: 12,
  depthFt: 14,
  heightFt: 8,
  wallThicknessIn: 4.5,
  floorThicknessIn: 6
};

const USER_SCALE_REFERENCE = {
  heightIn: 64, // 5 ft 4 in
  weightLb: 500,
  note: 'Long torso; wheelchair is custom-sized. Photos are a visual sanity check, not a source of invented chair dimensions.'
};

const MODEL = {
  name: 'Onyx',
  path: './models/fbx/cat.fbx',
  position: { x: 0, y: 0.24, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 0.000775003,
  animationName: 5
};

// Movement recovery pass. The older dossier-documented viewer is retained as a motion donor.
// `recovered` normalizes its frame-dependent movement math to a 60 Hz reference without
// reintroducing its rigid jump. `enhanced` preserves the newer faster gait/clip behavior for
// side-by-side inspection. Recovered is the default so the donor movement is actually back.
const MOVEMENT_PROFILES = {
  recovered: {
    id: 'recovered',
    label: 'Recovered classic motion',
    walkSpeed: (25 / 60 / 2.2) * 2.5,
    runSpeed: (25 / 60 / 2.2) * 2.5 * 1.5,
    backwardSpeed: (25 / 60 / 2.2) * 2.5,
    turnSpeed: 0.1 * 60,
    runUsesWalkClip: true,
    proceduralGait: 'legacy'
  },
  enhanced: {
    id: 'enhanced',
    label: 'Enhanced living motion',
    walkSpeed: 0.70,
    runSpeed: 1.65,
    backwardSpeed: 0.42,
    turnSpeed: 1.85,
    runUsesWalkClip: false,
    proceduralGait: 'enhanced'
  }
};
let movementProfile = 'recovered';
function getMovementProfile() { return MOVEMENT_PROFILES[movementProfile] || MOVEMENT_PROFILES.recovered; }

const viewer = document.getElementById('viewer');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');

const DOSSIER = window.ONYX_DOSSIER_RUNTIME || {};
const BEHAVIOR_GRAPH = DOSSIER.onyx_behavior_graph_needs_free || { states: {}, events: {}, initial_state: 'loaf' };
const CAMERA_SPEC = DOSSIER.onyx_camera_2_5d || { presets: [] };
const CORE_TRAITS = ((DOSSIER.traits || {}).core_traits || []).map((trait) => trait.id || trait.name || String(trait));
const ANIMATION_FEATURES = DOSSIER.onyx_animation_features || { animation_library: {} };
const ACTION_LIBRARY = ANIMATION_FEATURES.animation_library || {};
const PROFILE_SPEC = DOSSIER.onyx_profile || {};
const PROGRESSION = window.ONYX_PROGRESSION_RUNTIME || null;
const PERSONALITY_IDLE_WEIGHTS = ((PROFILE_SPEC.behavior || {}).idle_state_weights) || {};
const QUERY_PARAMS = new URLSearchParams(window.location && window.location.search ? window.location.search : '');
const VIEWER_PROFILE_KEY = ['william','jasper'].includes(String(QUERY_PARAMS.get('profileKey') || '').toLowerCase()) ? String(QUERY_PARAMS.get('profileKey')).toLowerCase() : 'william';
let cameraMode = 'inspection';
let cameraPresetId = (CAMERA_SPEC.presets && CAMERA_SPEC.presets[0] && CAMERA_SPEC.presets[0].id) || 'home_left';
let behaviorState = BEHAVIOR_GRAPH.initial_state || 'loaf';
let behaviorAutoEnabled = false;
let behaviorRemaining = 12;
let eyeDepthStrength = 1;
let backendConnected = false;
let backendLastStatus = null;
let dossierAction = 'none';
let dossierActionStartedAt = 0;
let forceBlinkUntil = 0;
let professorClipboard = null;

let scene, renderer, camera, clock;
let physicsWorld, transformAux1;
let physicsAvailable = false;
let fallbackVerticalVelocity = 0;
const rigidBodies = [];
let controls = null;
let catMixer = null;
let catObject = null;
let onyxBones = null;
let onyxBelly = null;
let onyxMorphStack = null;
let onyxFaceDetails = null;
let onyxWhiskers = null;
let onyxEyeStates = [];
let measurementGuides = null;
let measurementsVisible = true;
let skeletonHelper = null;
let skeletonVisible = false;
let wireframeVisible = false;
let correctionsEnabled = true;
let rotay = 2;
let space = false;
let shiftIsUp = true;
let idle = true;
let currentMovementMode = 'idle';
let jumpCooldown = 0;
const jumpState = {
  phase: 'grounded',
  timer: 0,
  launched: false,
  lastVerticalVelocity: 0
};
let catClips = [];
let catAction = null;
let catWalkAction = null;
let catRunAction = null;
let lastAutoGait = 'walk';
let currentClipIndex = MODEL.animationName;
let animationMode = 'auto';
let animationPaused = false;
let animationSpeed = 1;
let animationStepSeconds = 0;
const gravityConstant = -9.8;
const tmpPos = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

const additiveBoneFrame = new Map();

function restoreAdditiveBoneFrame() {
  additiveBoneFrame.forEach((quat, bone) => {
    if (bone && bone.quaternion) bone.quaternion.copy(quat);
  });
  additiveBoneFrame.clear();
}

function captureAdditiveBoneFrame() {
  if (!onyxBones) return;
  const seen = new Set();
  Object.values(onyxBones).forEach((bone) => {
    if (!bone || seen.has(bone)) return;
    seen.add(bone);
    additiveBoneFrame.set(bone, bone.quaternion.clone());
  });
}

function fail(error) {
  console.error(error);
  statusEl.textContent = 'Could not load Onyx.';
  errorEl.style.display = 'block';
  errorEl.textContent = `Onyx viewer error:\n\n${error?.stack || error}`;
}

let viewerBootStarted = false;
let animationLoopStarted = false;

function startViewer(AmmoLib, physicsNote) {
  // Hard single-instance guard. The bundled Emscripten Ammo object is a synchronous
  // thenable rather than a normal Promise. Older repair code could start once from its
  // success callback and then start AGAIN when `.catch` was called on the non-Promise
  // return value. That produced two full-screen canvases: the visible first canvas was
  // frozen while the global controls/render loop pointed at the second canvas off-screen.
  if (viewerBootStarted) return;
  viewerBootStarted = true;

  try {
    if (AmmoLib) {
      window.Ammo = AmmoLib;
      physicsAvailable = true;
    } else {
      physicsAvailable = false;
      window.Ammo = null;
    }
    init();
    if (!animationLoopStarted) {
      animationLoopStarted = true;
      animate();
    }
    if (physicsNote && statusEl) statusEl.dataset.physicsNote = physicsNote;
  } catch (error) {
    viewerBootStarted = false;
    fail(error);
  }
}

// IMPORTANT: defer boot until this entire classic script has evaluated, then assimilate
// Ammo's Emscripten thenable through a native Promise. Promise.resolve() gives us a real
// Promise chain even when Ammo invokes its own `.then()` callback synchronously.
function bootViewer() {
  if (!window.THREE || typeof window.FBXLoader !== 'function') {
    fail(new Error('Three.js or FBXLoader did not load. The recovered viewer requires the bundled classic runtime.'));
    return;
  }

  if (typeof window.Ammo === 'function') {
    try {
      const ammoResult = window.Ammo();
      if (ammoResult && typeof ammoResult.then === 'function') {
        Promise.resolve(ammoResult).then(
          (AmmoLib) => startViewer(AmmoLib, ''),
          (error) => {
            console.warn('Ammo.js initialization failed; continuing in inspection-safe no-physics mode.', error);
            startViewer(null, 'physics unavailable; inspection-safe mode');
          }
        );
      } else {
        startViewer(ammoResult || window.Ammo, '');
      }
    } catch (error) {
      console.warn('Ammo.js initialization threw; continuing in inspection-safe no-physics mode.', error);
      startViewer(null, 'physics unavailable; inspection-safe mode');
    }
    return;
  }

  console.warn('Ammo.js is unavailable; continuing in inspection-safe no-physics mode.');
  startViewer(null, 'physics unavailable; inspection-safe mode');
}

// setTimeout guarantees every declaration below has been initialized before init().
window.setTimeout(bootViewer, 0);

function init() {
  initScene();
  initRenderer();
  if (physicsAvailable) initPhysics();
  createBlankRoom();
  loadCat(MODEL);
  bindInspectionUI();
  window.addEventListener('resize', onResize, false);
  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyR') resetCat();
    if (event.code === 'KeyM') toggleMeasurementGuides();
    if (event.code === 'KeyB') toggleCorrections();
    if (event.code === 'KeyK') toggleSkeleton();
    if (event.code === 'KeyV') toggleWireframe();
    if (event.code === 'KeyP') toggleAnimationPause();
    if (event.code === 'Period' && animationPaused) requestAnimationStep();
  });
}

function initScene() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 1.2, -1.5);

  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdedede);

  // Same basic light types as the original game, made brighter so a black cat is readable.
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x686868, 1.0);
  hemiLight.position.set(0, 3, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.82);
  dirLight.position.set(-2.5, 5, -3);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.top = 6;
  dirLight.shadow.camera.bottom = -6;
  dirLight.shadow.camera.left = -6;
  dirLight.shadow.camera.right = 6;
  scene.add(dirLight);

  const fill = new THREE.PointLight(0xffffff, 0.32, 10, 2);
  fill.position.set(2.5, 3, 2.5);
  scene.add(fill);
}

function initRenderer() {
  // The viewer owns exactly one renderer canvas. This also makes recovery deterministic if
  // a browser extension or a previous failed initialization left a stale canvas behind.
  while (viewer.firstChild) viewer.removeChild(viewer.firstChild);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Onyx 3D cat viewer');
  viewer.appendChild(renderer.domElement);
}

function initPhysics() {
  const Ammo = window.Ammo;
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const broadphase = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
  transformAux1 = new Ammo.btTransform();
}

function createRigidBody(threeObject, physicsShape, mass, pos, quat, addVisual = true) {
  const Ammo = window.Ammo;
  threeObject.position.copy(pos);
  threeObject.quaternion.copy(quat);

  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

  const motionState = new Ammo.btDefaultMotionState(transform);
  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);
  threeObject.userData.physicsBody = body;

  if (addVisual) scene.add(threeObject);
  if (mass > 0) rigidBodies.push(threeObject);

  body.setActivationState(4);
  physicsWorld.addRigidBody(body);
  return body;
}

function createRoomBox(name, sx, sy, sz, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz), material);
  mesh.name = name;
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  tmpPos.set(x, y, z);
  tmpQuat.set(0, 0, 0, 1);
  if (!physicsAvailable || !window.Ammo || !physicsWorld) {
    mesh.position.copy(tmpPos);
    mesh.quaternion.copy(tmpQuat);
    scene.add(mesh);
    return;
  }
  const Ammo = window.Ammo;
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
  shape.setMargin(0.05);
  createRigidBody(mesh, shape, 0, tmpPos, tmpQuat, true);
}

function addMeasurementBox(group, name, sx, sy, sz, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  group.add(mesh);
  return mesh;
}

function createMeasurementGuides(roomWidth, roomDepth, roomHeight) {
  const group = new THREE.Group();
  group.name = 'real-world measurement guides';

  const minor = new THREE.MeshBasicMaterial({ color: 0x767676, transparent: true, opacity: 0.22, depthWrite: false });
  const major = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.44, depthWrite: false });
  const reference = new THREE.MeshBasicMaterial({ color: 0x171717, transparent: true, opacity: 0.72, depthWrite: false });
  const thin = 0.006;
  const gridY = 0.004;
  const halfW = roomWidth * 0.5;
  const halfD = roomDepth * 0.5;

  // One-foot floor grid. Every 5 ft is stronger, so the room can be read at a glance.
  const widthFeet = Math.round(ROOM_REAL.widthFt);
  const depthFeet = Math.round(ROOM_REAL.depthFt);
  for (let i = 0; i <= widthFeet; i++) {
    const x = -halfW + i * FOOT_M;
    const mat = (i % 5 === 0 || i === widthFeet) ? major : minor;
    addMeasurementBox(group, `floor-grid-x-${i}ft`, thin, 0.003, roomDepth, x, gridY, 0, mat);
  }
  for (let i = 0; i <= depthFeet; i++) {
    const z = -halfD + i * FOOT_M;
    const mat = (i % 5 === 0 || i === depthFeet) ? major : minor;
    addMeasurementBox(group, `floor-grid-z-${i}ft`, roomWidth, 0.003, thin, 0, gridY, z, mat);
  }

  // Compact wall ruler on the west wall, one tick per foot.
  for (let i = 1; i <= Math.floor(ROOM_REAL.heightFt); i++) {
    const y = i * FOOT_M;
    const len = i % 5 === 0 ? 0.72 : 0.48;
    addMeasurementBox(group, `wall-height-${i}ft`, 0.008, 0.009, len, -halfW + 0.006, y, -halfD + 0.50, i % 5 === 0 ? major : minor);
  }

  // A 5'4" human-height reference on the wall. This uses the user's stated height,
  // but does NOT invent a body width or wheelchair footprint from body weight.
  const userHeight = USER_SCALE_REFERENCE.heightIn * INCH_M;
  addMeasurementBox(group, 'user-height-reference-5ft4', 0.010, 0.018, 0.92, -halfW + 0.008, userHeight, -halfD + 0.70, reference);

  // Onyx shoulder-height reference (midpoint 14 in) next to the human marker.
  const onyxShoulder = ONYX_REAL.shoulderHeightIn * INCH_M;
  addMeasurementBox(group, 'onyx-shoulder-height-reference-14in', 0.010, 0.014, 0.66, -halfW + 0.010, onyxShoulder, -halfD + 1.18, reference);

  // Onyx's normal overall-length reference bar (38 in midpoint) on the floor.
  const onyxLength = ONYX_REAL.normalOverallIn * INCH_M;
  const barZ = -halfD + 0.37;
  const barX = -halfW + 0.36 + onyxLength * 0.5;
  addMeasurementBox(group, 'onyx-normal-length-reference-38in', onyxLength, 0.010, 0.022, barX, 0.012, barZ, reference);
  addMeasurementBox(group, 'onyx-length-start-tick', 0.012, 0.012, 0.16, barX - onyxLength * 0.5, 0.013, barZ, reference);
  addMeasurementBox(group, 'onyx-length-end-tick', 0.012, 0.012, 0.16, barX + onyxLength * 0.5, 0.013, barZ, reference);

  group.visible = measurementsVisible;
  scene.add(group);
  measurementGuides = group;
}

function toggleMeasurementGuides() {
  measurementsVisible = !measurementsVisible;
  if (measurementGuides) measurementGuides.visible = measurementsVisible;
  refreshInspectionUI();
}

function createBlankRoom() {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xbfc1c4, roughness: 0.95, metalness: 0 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e6, roughness: 1, metalness: 0 });

  // Interior clear dimensions are exact and expressed in real-world units.
  // World scale: 1 Three.js unit = 1 meter.
  const roomWidth = ROOM_REAL.widthFt * FOOT_M;
  const roomDepth = ROOM_REAL.depthFt * FOOT_M;
  const roomHeight = ROOM_REAL.heightFt * FOOT_M;
  const wallThickness = ROOM_REAL.wallThicknessIn * INCH_M;
  const floorThickness = ROOM_REAL.floorThicknessIn * INCH_M;
  const halfW = roomWidth * 0.5;
  const halfD = roomDepth * 0.5;

  // Floor top is exactly y=0. Walls sit OUTSIDE the measured clear room, so the
  // dimension labels describe usable interior space rather than center-to-center walls.
  createRoomBox('floor', roomWidth + wallThickness * 2, floorThickness, roomDepth + wallThickness * 2,
    0, -floorThickness * 0.5, 0, floorMat);
  createRoomBox('wall-north', roomWidth + wallThickness * 2, roomHeight, wallThickness,
    0, roomHeight * 0.5, -(halfD + wallThickness * 0.5), wallMat);
  createRoomBox('wall-south', roomWidth + wallThickness * 2, roomHeight, wallThickness,
    0, roomHeight * 0.5, halfD + wallThickness * 0.5, wallMat);
  createRoomBox('wall-west', wallThickness, roomHeight, roomDepth,
    -(halfW + wallThickness * 0.5), roomHeight * 0.5, 0, wallMat);
  createRoomBox('wall-east', wallThickness, roomHeight, roomDepth,
    halfW + wallThickness * 0.5, roomHeight * 0.5, 0, wallMat);

  createMeasurementGuides(roomWidth, roomDepth, roomHeight);
}


function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothBell(value, center, halfWidth) {
  const t = clamp01(1 - Math.abs(value - center) / halfWidth);
  return t * t * (3 - 2 * t);
}

function getSkinInfluence(catMesh, vertexIndex, boneIndex) {
  if (!catMesh || !catMesh.geometry || !catMesh.geometry.attributes || boneIndex < 0) return 0;
  const skinIndex = catMesh.geometry.attributes.skinIndex;
  const skinWeight = catMesh.geometry.attributes.skinWeight;
  if (!skinIndex || !skinWeight) return 0;
  const indices = [skinIndex.getX(vertexIndex), skinIndex.getY(vertexIndex), skinIndex.getZ(vertexIndex), skinIndex.getW(vertexIndex)];
  const weights = [skinWeight.getX(vertexIndex), skinWeight.getY(vertexIndex), skinWeight.getZ(vertexIndex), skinWeight.getW(vertexIndex)];
  let result = 0;
  for (let i = 0; i < 4; i++) if (indices[i] === boneIndex) result += weights[i];
  return result;
}

function sumSkinInfluence(catMesh, vertexIndex, boneIndices) {
  let total = 0;
  for (let i = 0; i < boneIndices.length; i++) {
    if (boneIndices[i] >= 0) total += getSkinInfluence(catMesh, vertexIndex, boneIndices[i]);
  }
  return total;
}

function buildOnyxMorphStack(catMesh) {
  const geometry = catMesh && catMesh.geometry;
  const position = geometry && geometry.attributes && geometry.attributes.position;
  if (!position) return null;

  const bones = catMesh.skeleton ? catMesh.skeleton.bones : [];
  const boneIndex = (name) => bones.findIndex((bone) => bone.name === name);
  const noseBoneIndex = boneIndex('Nose');
  const mouthBoneIndex = boneIndex('Mouth');
  const headBoneIndex = boneIndex('Head');
  const torsoBones = ['Hip', 'Spine001', 'Spine002', 'Spine003', 'Spine004'].map(boneIndex);
  const legBones = [
    'Thigh_Back_L', 'Calf_back_L', 'Thigh_Back_R', 'Calf_back_R',
    'Thigh_front_L', 'Calf_Front_L', 'Thigh_front_R', 'Calf_Front_R'
  ].map(boneIndex);

  // Preserve exact source vertex order. Every body-shape change in this pass is a named
  // sparse delta layer over the protected SmellyCat/Onyx base; no remesh, re-index, UV
  // rewrite, or skin/skeleton replacement is performed.
  const base = new Float32Array(position.array);
  const anatomy = new Float32Array(base.length);
  const carriage = new Float32Array(base.length);
  const chestFlow = new Float32Array(base.length);
  const pouch = new Float32Array(base.length);
  const face = new Float32Array(base.length);

  for (let i = 0; i < position.count; i++) {
    const o = i * 3;
    const bx = base[o];
    const by = base[o + 1]; // longitudinal bind axis: head negative, rear/tail positive
    const bz = base[o + 2]; // vertical bind-mesh axis

    const noseW = getSkinInfluence(catMesh, i, noseBoneIndex);
    const mouthW = getSkinInfluence(catMesh, i, mouthBoneIndex);
    const headW = getSkinInfluence(catMesh, i, headBoneIndex);
    const torsoInfluence = sumSkinInfluence(catMesh, i, torsoBones);
    const legInfluence = sumSkinInfluence(catMesh, i, legBones);
    const limbLimiter = Math.max(0.44, 1 - Math.min(1, legInfluence * 1.18));

    // Layer 1: Onyx's large, long, substantial frame. Keep mass but stop the front half
    // from ballooning into the abrupt chest/shoulder bulge seen in the previous pass.
    let x = bx, y = by, z = bz;
    const shoulder = smoothBell(by, -1.60, 1.62) * smoothBell(bz, 1.78, 1.48);
    x *= 1 + 0.092 * shoulder;

    const torsoMass = smoothBell(by, 0.20, 2.45) * smoothBell(bz, 1.43, 1.55);
    x *= 1 + 0.042 * torsoMass;

    anatomy[o] = x - bx;
    anatomy[o + 1] = y - by;
    anatomy[o + 2] = z - bz;

    // Layer 2: long/low hindquarter carriage. SmellyCat's source silhouette rises sharply
    // toward the rump. Onyx carries his body lower and slinks; lower the dorsal pelvis and
    // rear torso without shortening the legs or shrinking his substantial hindquarters.
    const cx0 = x, cy0 = y, cz0 = z;
    const rearTorso = smoothBell(by, 2.25, 2.05) * smoothBell(bz, 1.92, 1.72);
    const rearDorsal = smoothBell(by, 2.05, 2.35) * smoothBell(bz, 2.72, 1.22);
    const backBridge = smoothBell(by, 0.88, 3.08) * smoothBell(bz, 2.46, 1.26);
    const rearSupport = (0.76 + Math.min(0.24, torsoInfluence * 0.36)) * limbLimiter;

    z -= 0.305 * rearTorso * rearSupport;
    z -= 0.090 * rearDorsal * rearSupport;
    z -= 0.060 * backBridge * limbLimiter;
    y += 0.072 * rearTorso * rearSupport;
    x *= 1 + 0.026 * rearTorso * rearSupport;

    carriage[o] = x - cx0;
    carriage[o + 1] = y - cy0;
    carriage[o + 2] = z - cz0;

    // Layer 3: smoother chest/sternum/neck transition. This replaces the previous tight,
    // deep chest bell that created a pinched shelf between face/neck/chest from oblique views.
    const chx0 = x, chy0 = y, chz0 = z;
    const chestBody = smoothBell(by, -1.18, 1.64) * smoothBell(bz, 0.98, 1.22);
    const sternum = smoothBell(by, -1.18, 1.55) * smoothBell(bz, 0.48, 0.76);
    const neckBridge = smoothBell(by, -2.38, 1.24) * smoothBell(bz, 2.22, 1.18);

    x *= 1 + 0.052 * chestBody;
    z -= 0.047 * chestBody;
    z -= 0.042 * sternum * limbLimiter;
    x *= 1 + 0.026 * neckBridge;
    // Scapular/serratus bridge: keep shoulder volume high on the thorax but taper it
    // smoothly into neck and ribcage rather than producing the old shelf-like chest.
    const scapularFlow = smoothBell(by, -1.48, 1.72) * smoothBell(bz, 2.48, 0.96) * limbLimiter;
    const pectoralFlow = smoothBell(by, -1.55, 1.36) * smoothBell(bz, 0.86, 0.72) * limbLimiter;
    x *= 1 + 0.020 * scapularFlow;
    z -= 0.032 * scapularFlow;
    y += 0.018 * scapularFlow;
    x *= 1 + 0.018 * pectoralFlow;
    z -= 0.028 * pectoralFlow;

    chestFlow[o] = x - chx0;
    chestFlow[o + 1] = y - chy0;
    chestFlow[o + 2] = z - chz0;

    // Layer 4: primordial pouch. Keep the tum prominent, connected and gravity-biased.
    const px0 = x, py0 = y, pz0 = z;
    const bellyY = smoothBell(by, 0.70, 1.56);
    const bellyZ = smoothBell(bz, 0.63, 0.72);
    const bellySide = clamp01((1.31 - Math.abs(bx)) / 0.84);
    const torsoSupport = 0.86 + Math.min(0.14, torsoInfluence * 0.22);
    const pw = bellyY * bellyZ * (0.70 + 0.30 * bellySide) * limbLimiter * torsoSupport;

    z -= 0.62 * pw;
    x *= 1 + 0.112 * pw;
    y += 0.070 * pw;
    pouch[o] = x - px0;
    pouch[o + 1] = y - py0;
    pouch[o + 2] = z - pz0;

    // Layer 5: feline face cleanup. Reduce the over-expanded muzzle from the first pass,
    // project the whisker pads/chin forward more coherently, and keep a domestic-cat taper.
    const fx0 = x, fy0 = y, fz0 = z;
    const headShape = headW * clamp01((bz - 1.96) / 1.62);
    x *= 1 + 0.034 * headShape;

    const upperCheekTaper = headW * smoothBell(bz, 3.18, 0.72);
    x *= 1 - 0.018 * upperCheekTaper;

    const muzzlePads = Math.max(mouthW, noseW * 0.64) * smoothBell(bz, 2.36, 0.61);
    x *= 1 + 0.066 * muzzlePads;
    y -= 0.034 * muzzlePads;

    if (noseW > 0) {
      const tip = noseW * clamp01((-4.10 - by) / 0.76) * smoothBell(bz, 2.68, 0.62);
      y -= 0.115 * tip;
      x *= 1 - 0.040 * tip;
      z += 0.018 * tip;
    }

    if (mouthW > 0) {
      const chin = mouthW * smoothBell(bz, 2.18, 0.43);
      y -= 0.056 * chin;
      z -= 0.052 * chin;
      x *= 1 + 0.030 * chin;
    }

    face[o] = x - fx0;
    face[o + 1] = y - fy0;
    face[o + 2] = z - fz0;
  }

  return {
    mesh: catMesh,
    base,
    layers: {
      primaryAnatomy: anatomy,
      hindquarterCarriage: carriage,
      chestFlow: chestFlow,
      primordialPouch: pouch,
      faceCorrections: face
    },
    weights: {
      primaryAnatomy: 1,
      hindquarterCarriage: 1,
      chestFlow: 1,
      primordialPouch: 1,
      faceCorrections: 1
    }
  };
}

function applyOnyxMorphLayers(enabled = correctionsEnabled) {
  if (!onyxMorphStack || !onyxMorphStack.mesh) return;
  const geometry = onyxMorphStack.mesh.geometry;
  const position = geometry.attributes.position;
  const base = onyxMorphStack.base;
  const names = Object.keys(onyxMorphStack.layers);

  for (let i = 0; i < position.count; i++) {
    const o = i * 3;
    let x = base[o], y = base[o + 1], z = base[o + 2];
    if (enabled) {
      for (let l = 0; l < names.length; l++) {
        const name = names[l];
        const delta = onyxMorphStack.layers[name];
        const weight = onyxMorphStack.weights[name];
        x += delta[o] * weight;
        y += delta[o + 1] * weight;
        z += delta[o + 2] * weight;
      }
    }
    position.setXYZ(i, x, y, z);
  }

  position.needsUpdate = true;
  if (geometry.computeVertexNormals) geometry.computeVertexNormals();
  if (geometry.attributes.normal) geometry.attributes.normal.needsUpdate = true;
  if (geometry.computeBoundingBox) geometry.computeBoundingBox();
  if (geometry.computeBoundingSphere) geometry.computeBoundingSphere();
}

function applyOnyxMorphology(catMesh) {
  onyxMorphStack = buildOnyxMorphStack(catMesh);
  applyOnyxMorphLayers(true);
}

function addOnyxFaceDetails(catMesh) {
  if (!catMesh || !catMesh.skeleton) return;
  const noseBone = catMesh.skeleton.bones.find((bone) => bone.name === 'Nose');
  const mouthBone = catMesh.skeleton.bones.find((bone) => bone.name === 'Mouth');
  if (!noseBone || !mouthBone) return;

  // Rounded triangular nose cap. This supplements the mesh sculpt with a tiny satin-black
  // surface so the nose reads as a distinct feline plane instead of disappearing into fur.
  const noseShape = new THREE.Shape();
  noseShape.moveTo(0, 0.13);
  noseShape.bezierCurveTo(-0.055, 0.13, -0.17, 0.075, -0.18, 0.015);
  noseShape.bezierCurveTo(-0.17, -0.055, -0.070, -0.125, 0, -0.125);
  noseShape.bezierCurveTo(0.070, -0.125, 0.17, -0.055, 0.18, 0.015);
  noseShape.bezierCurveTo(0.17, 0.075, 0.055, 0.13, 0, 0.13);
  const noseGeometry = new THREE.ShapeBufferGeometry(noseShape, 3);
  const noseMaterial = new THREE.MeshStandardMaterial({
    color: 0x050403,
    roughness: 0.48,
    metalness: 0,
    side: THREE.DoubleSide
  });
  const nosePad = new THREE.Mesh(noseGeometry, noseMaterial);
  nosePad.name = 'Onyx sculpted nose pad';
  nosePad.rotation.x = Math.PI / 2;
  nosePad.position.set(0, 0.485, 0.075);
  nosePad.scale.set(0.84, 0.84, 0.84);
  nosePad.frustumCulled = false;
  noseBone.add(nosePad);

  // Subtle feline "W" mouth: central philtrum plus two curved lip creases.
  const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0706 });
  const makeMouthCurve = (points, name, radius) => {
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.55);
    const tube = new THREE.TubeBufferGeometry(curve, 10, radius, 4, false);
    const mesh = new THREE.Mesh(tube, mouthMaterial);
    mesh.name = name;
    mesh.frustumCulled = false;
    mouthBone.add(mesh);
  };
  makeMouthCurve([
    new THREE.Vector3(0, 0.445, 0.105),
    new THREE.Vector3(0, 0.462, 0.020),
    new THREE.Vector3(0, 0.450, -0.055)
  ], 'Onyx philtrum', 0.006);
  makeMouthCurve([
    new THREE.Vector3(0, 0.448, -0.045),
    new THREE.Vector3(-0.085, 0.455, -0.095),
    new THREE.Vector3(-0.190, 0.435, -0.115),
    new THREE.Vector3(-0.305, 0.390, -0.060)
  ], 'Onyx left mouth crease', 0.0065);
  makeMouthCurve([
    new THREE.Vector3(0, 0.448, -0.045),
    new THREE.Vector3(0.085, 0.455, -0.095),
    new THREE.Vector3(0.190, 0.435, -0.115),
    new THREE.Vector3(0.305, 0.390, -0.060)
  ], 'Onyx right mouth crease', 0.0065);
}

function addOnyxWhiskers(catMesh) {
  if (!catMesh || !catMesh.skeleton) return;
  const noseBone = catMesh.skeleton.bones.find((bone) => bone.name === 'Nose');
  if (!noseBone) return;

  const whiskerGroup = new THREE.Group();
  whiskerGroup.name = 'Onyx curved mostly-white whiskers';

  const white = new THREE.MeshBasicMaterial({ color: 0xf5f3ea });
  const pale = new THREE.MeshBasicMaterial({ color: 0xd9d6cc });
  const dark = new THREE.MeshBasicMaterial({ color: 0x363633 });
  const roots = [-0.31, -0.235, -0.155, -0.075, 0.015, 0.105, 0.195, 0.275];
  const lengths = [1.20, 1.36, 1.53, 1.67, 1.72, 1.61, 1.46, 1.28];
  const curls = [-0.24, -0.18, -0.11, -0.035, 0.055, 0.13, 0.205, 0.27];

  [-1, 1].forEach((side) => {
    roots.forEach((rootZ, index) => {
      const length = lengths[index] * (side < 0 ? 0.992 : 1.008);
      const curl = curls[index];
      const asym = side < 0
        ? (index % 2 ? -0.030 : 0.014)
        : (index % 2 ? 0.022 : -0.012);
      const rootX = side * (0.17 + index * 0.011);
      const droop = 0.018 + index * 0.004;
      const points = [
        new THREE.Vector3(rootX, 0.405, rootZ * 0.54),
        new THREE.Vector3(side * 0.42, 0.55, rootZ * 0.78 - 0.015),
        new THREE.Vector3(side * 0.78, 0.72, rootZ + curl * 0.18),
        new THREE.Vector3(side * 1.12, 0.86, rootZ * 1.18 + curl * 0.58 + asym - droop),
        new THREE.Vector3(side * length, 0.96 + 0.038 * index, rootZ * 1.34 + curl + asym - droop * 2.2)
      ];
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.47);
      const radius = 0.0068 + (index % 3) * 0.00045;
      const tube = new THREE.TubeBufferGeometry(curve, 16, radius, 5, false);
      const material = (index === 0 && side < 0) || (index === 7 && side > 0)
        ? dark
        : ((index === 1 || index === 6) ? pale : white);
      const whisker = new THREE.Mesh(tube, material);
      whisker.name = `${side < 0 ? 'L' : 'R'} curved whisker ${index + 1}`;
      whisker.frustumCulled = false;
      whiskerGroup.add(whisker);
    });
  });

  noseBone.add(whiskerGroup);
  onyxWhiskers = whiskerGroup;
}

function captureOnyxBelly(catMesh) {
  const position = catMesh && catMesh.geometry && catMesh.geometry.attributes && catMesh.geometry.attributes.position;
  if (!position) return null;
  const vertices = [];
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const w = smoothBell(y, 0.72, 1.35) * smoothBell(z, 0.30, 0.82) * clamp01((1.30 - Math.abs(x)) / 0.82);
    if (w > 0.035) vertices.push({ i, x, y, z, w });
  }
  return {
    mesh: catMesh,
    vertices,
    state: {
      lateral: 0, lateralV: 0,
      foreAft: 0, foreAftV: 0,
      vertical: 0, verticalV: 0,
      phase: 0
    }
  };
}

function applyRecoveredBellySway(timeSeconds, movementMode) {
  if (!onyxBelly || !onyxBelly.mesh || !onyxBelly.vertices.length) return;
  const position = onyxBelly.mesh.geometry.attributes.position;
  if (!position) return;
  const moving = movementMode === 'walk' || movementMode === 'run' || movementMode === 'backward' || movementMode === 'turn';
  const sway = moving ? Math.sin(timeSeconds * 5.15 + 0.55) : 0;
  const counter = moving ? Math.sin(timeSeconds * 10.30 + 1.4) : 0;
  const foreAft = moving ? Math.sin(timeSeconds * 5.15 - 0.75) : 0;
  onyxBelly.vertices.forEach((v) => {
    position.setXYZ(
      v.i,
      v.x + sway * 0.072 * v.w + counter * 0.012 * v.w,
      v.y + foreAft * 0.026 * v.w,
      v.z - Math.abs(counter) * 0.010 * v.w
    );
  });
  position.needsUpdate = true;
}

function springAxis(state, valueKey, velocityKey, target, stiffness, damping, delta) {
  const displacement = target - state[valueKey];
  state[velocityKey] += displacement * stiffness * delta;
  state[velocityKey] *= Math.exp(-damping * delta);
  state[valueKey] += state[velocityKey] * delta;
}

function applyOnyxBellyDynamics(delta, movementMode) {
  if (!onyxBelly || !onyxBelly.mesh || !onyxBelly.vertices.length) return;
  const position = onyxBelly.mesh.geometry.attributes.position;
  if (!position) return;

  const state = onyxBelly.state;
  const isRun = movementMode === 'run';
  const isWalk = movementMode === 'walk' || movementMode === 'backward' || movementMode === 'turn';
  const moving = isRun || isWalk;
  const rate = isRun ? 10.8 : 6.0;
  if (moving) state.phase += delta * rate;

  const lateralAmp = isRun ? 0.095 : (isWalk ? 0.064 : 0);
  const foreAmp = isRun ? 0.040 : (isWalk ? 0.024 : 0);
  const verticalAmp = isRun ? 0.024 : (isWalk ? 0.010 : 0);
  const targetLateral = moving ? Math.sin(state.phase + 0.55) * lateralAmp : 0;
  const targetFore = moving ? Math.sin(state.phase - 0.80) * foreAmp : 0;
  const targetVertical = moving ? -Math.abs(Math.sin(state.phase * 2 + 1.35)) * verticalAmp : 0;

  springAxis(state, 'lateral', 'lateralV', targetLateral, isRun ? 54 : 42, isRun ? 8.4 : 9.2, delta);
  springAxis(state, 'foreAft', 'foreAftV', targetFore, isRun ? 48 : 38, isRun ? 8.8 : 9.6, delta);
  springAxis(state, 'vertical', 'verticalV', targetVertical, isRun ? 52 : 40, isRun ? 9.0 : 10.0, delta);

  onyxBelly.vertices.forEach((v) => {
    position.setXYZ(
      v.i,
      v.x + state.lateral * v.w,
      v.y + state.foreAft * v.w,
      v.z + state.vertical * v.w
    );
  });
  position.needsUpdate = true;
}

function captureOnyxBones(catMesh) {
  if (!catMesh || !catMesh.skeleton) return null;
  const byName = {};
  catMesh.skeleton.bones.forEach((bone) => { if (!byName[bone.name]) byName[bone.name] = bone; });
  return {
    spine1: byName.Spine001 || null,
    spine2: byName.Spine002 || null,
    spine3: byName.Spine003 || null,
    spine4: byName.Spine004 || null,
    neck2: byName.Neck002 || null,
    head: byName.Head || null,
    mouth: byName.Mouth || null,
    hip: byName.Hip || null,
    shoulderL: byName.Shoulder_front_L || null,
    shoulderR: byName.Shoulder_front_R || null,
    earL: byName.Ear || null,
    earR: byName.Ear006 || null,
    frontThighL: byName.Thigh_front_L || null,
    frontThighR: byName.Thigh_front_R || null,
    frontCalfL: byName.Calf_Front_L || null,
    frontCalfR: byName.Calf_Front_R || null,
    backThighL: byName.Thigh_Back_L || null,
    backThighR: byName.Thigh_Back_R || null,
    backCalfL: byName.Calf_back_L || null,
    backCalfR: byName.Calf_back_R || null,
    tail: byName.Tail || null,
    tail1: byName.Tail001 || null,
    tail2: byName.Tail002 || null,
    tail3: byName.Tail003 || null
  };
}

function addBoneEuler(bone, x = 0, y = 0, z = 0) {
  if (!bone) return;
  const q = new THREE.Quaternion();
  q.setFromEuler(new THREE.Euler(x, y, z));
  bone.quaternion.multiply(q);
}

function applyOnyxSecondaryMotion(timeSeconds, movementMode) {
  if (!onyxBones) return;
  const profile = getMovementProfile();
  const isRun = movementMode === 'run';
  const isGait = isRun || movementMode === 'walk' || movementMode === 'backward' || movementMode === 'turn';

  // Keep the newer "living" idle layer even in recovered mode. The locomotion portion below
  // is what changes: recovered mode restores the older viewer's restrained spine/tail motion
  // instead of layering extra limb/scapular rotations over the already-complete 258-track FBX.
  if (!isGait && jumpState.phase === 'grounded') {
    const breath = Math.sin(timeSeconds * 2.05);
    const slow = Math.sin(timeSeconds * 0.63);
    addBoneEuler(onyxBones.spine2, breath * 0.004, 0, slow * 0.006);
    addBoneEuler(onyxBones.spine3, -breath * 0.006, 0, -slow * 0.005);
    addBoneEuler(onyxBones.neck2, 0, slow * 0.011, breath * 0.003);
    addBoneEuler(onyxBones.head, 0, Math.sin(timeSeconds * 0.47 + 0.8) * 0.014, 0);
    const earTwitch = Math.pow(Math.max(0, Math.sin(timeSeconds * 0.31 + 2.2)), 18) * 0.085;
    addBoneEuler(onyxBones.earL, earTwitch, 0, -earTwitch * 0.35);
    addBoneEuler(onyxBones.earR, -earTwitch * 0.72, 0, earTwitch * 0.28);
    addBoneEuler(onyxBones.tail2, 0, 0, Math.sin(timeSeconds * 0.92) * 0.014);
    addBoneEuler(onyxBones.tail3, 0, 0, Math.sin(timeSeconds * 1.07 + 0.75) * 0.020);
    return;
  }

  if (!isGait) return;

  if (profile.proceduralGait === 'legacy') {
    // Exact donor style from Onyx_Cat_Only_dossier_documented(5): the embedded Walk animation
    // supplies the body/legs; procedural motion only adds a tiny spinal counter-motion and tail.
    const gait = timeSeconds * 7.0;
    addBoneEuler(onyxBones.spine2, 0, 0, Math.sin(gait) * 0.018);
    addBoneEuler(onyxBones.spine3, 0, 0, Math.sin(gait + Math.PI) * 0.014);
    addBoneEuler(onyxBones.tail, 0, 0, Math.sin(timeSeconds * 3.1) * 0.035);
    addBoneEuler(onyxBones.tail1, 0, 0, Math.sin(timeSeconds * 3.1 + 0.55) * 0.025);
    return;
  }

  const gait = timeSeconds * (isRun ? 10.2 : 6.15);
  addBoneEuler(onyxBones.spine2, 0, Math.sin(gait) * (isRun ? 0.010 : 0.006), Math.sin(gait) * (isRun ? 0.032 : 0.020));
  addBoneEuler(onyxBones.spine3, 0, -Math.sin(gait) * (isRun ? 0.008 : 0.005), Math.sin(gait + Math.PI) * (isRun ? 0.026 : 0.016));
  addBoneEuler(onyxBones.hip, Math.sin(gait + 0.6) * (isRun ? 0.016 : 0.009), 0, -Math.sin(gait) * (isRun ? 0.018 : 0.010));
  addBoneEuler(onyxBones.neck2, 0, 0, -Math.sin(gait) * (isRun ? 0.010 : 0.007));
  addBoneEuler(onyxBones.head, 0, 0, -Math.sin(gait) * (isRun ? 0.008 : 0.005));

  const fore = Math.sin(gait);
  // Enhanced profile retains the restrained alternating scapular glide layer from the newer build.
  addBoneEuler(onyxBones.frontThighL, fore * (isRun ? 0.020 : 0.012), 0, 0);
  addBoneEuler(onyxBones.frontThighR, -fore * (isRun ? 0.020 : 0.012), 0, 0);
  addBoneEuler(onyxBones.shoulderL, fore * (isRun ? 0.040 : 0.026), 0, fore * (isRun ? 0.020 : 0.012));
  addBoneEuler(onyxBones.shoulderR, -fore * (isRun ? 0.040 : 0.026), 0, -fore * (isRun ? 0.020 : 0.012));

  addBoneEuler(onyxBones.tail, 0, 0, Math.sin(timeSeconds * (isRun ? 4.1 : 2.8)) * (isRun ? 0.044 : 0.033));
  addBoneEuler(onyxBones.tail1, 0, 0, Math.sin(timeSeconds * (isRun ? 4.1 : 2.8) + 0.55) * (isRun ? 0.034 : 0.025));
  addBoneEuler(onyxBones.tail2, 0, 0, Math.sin(timeSeconds * (isRun ? 4.3 : 3.0) + 0.95) * (isRun ? 0.026 : 0.019));
}

function applyOnyxJumpPose() {
  if (!onyxBones || jumpState.phase === 'grounded') return;
  const phase = jumpState.phase;
  let rearThigh = 0, rearCalf = 0, frontThigh = 0, frontCalf = 0, spine = 0;

  if (phase === 'crouch') {
    const t = clamp01(1 - jumpState.timer / 0.14);
    rearThigh = 0.34 * t; rearCalf = -0.44 * t;
    frontThigh = 0.19 * t; frontCalf = -0.27 * t; spine = 0.035 * t;
  } else if (phase === 'ascent') {
    rearThigh = -0.19; rearCalf = 0.22;
    frontThigh = 0.10; frontCalf = -0.08; spine = -0.025;
  } else if (phase === 'apex') {
    rearThigh = 0.24; rearCalf = -0.34;
    frontThigh = 0.22; frontCalf = -0.31; spine = -0.015;
  } else if (phase === 'descent') {
    rearThigh = 0.12; rearCalf = -0.20;
    frontThigh = -0.17; frontCalf = 0.14; spine = 0.012;
  } else if (phase === 'landing') {
    const t = clamp01(jumpState.timer / 0.16);
    rearThigh = 0.31 * t; rearCalf = -0.40 * t;
    frontThigh = 0.25 * t; frontCalf = -0.32 * t; spine = 0.040 * t;
  }

  addBoneEuler(onyxBones.backThighL, rearThigh, 0, 0);
  addBoneEuler(onyxBones.backThighR, rearThigh, 0, 0);
  addBoneEuler(onyxBones.backCalfL, rearCalf, 0, 0);
  addBoneEuler(onyxBones.backCalfR, rearCalf, 0, 0);
  addBoneEuler(onyxBones.frontThighL, frontThigh, 0, 0);
  addBoneEuler(onyxBones.frontThighR, frontThigh, 0, 0);
  addBoneEuler(onyxBones.frontCalfL, frontCalf, 0, 0);
  addBoneEuler(onyxBones.frontCalfR, frontCalf, 0, 0);
  addBoneEuler(onyxBones.spine2, 0, 0, spine);
  addBoneEuler(onyxBones.spine3, 0, 0, -spine * 0.65);
}

function setAnimationClip(index, fadeSeconds = 0.22) {
  if (!catMixer || !catClips[index]) return;
  if (currentClipIndex === index && catAction) return;

  const previous = catAction;
  const next = catMixer.clipAction(catClips[index]);
  next.enabled = true;
  next.setEffectiveWeight(1);
  next.setEffectiveTimeScale(1);
  next.reset();
  next.play();
  if (previous && previous !== next) next.crossFadeFrom(previous, fadeSeconds, true);

  currentClipIndex = index;
  catAction = next;
  if (index === 5) catWalkAction = next;
  if (index === 0) catRunAction = next;
  refreshInspectionUI();
}

function chooseAutoAnimation() {
  if (animationMode !== 'auto' || jumpState.phase !== 'grounded') return;
  const profile = getMovementProfile();
  if (profile.runUsesWalkClip) {
    if (currentClipIndex !== 5 || lastAutoGait !== 'walk') setAnimationClip(5, 0.18);
    lastAutoGait = 'walk';
    return;
  }
  if (currentMovementMode === 'run') {
    if (lastAutoGait !== 'run') setAnimationClip(0, 0.24);
    lastAutoGait = 'run';
  } else if (currentMovementMode === 'walk' || currentMovementMode === 'backward' || currentMovementMode === 'turn') {
    if (lastAutoGait !== 'walk') setAnimationClip(5, 0.26);
    lastAutoGait = 'walk';
  }
}

function setMovementProfile(profileId) {
  if (!MOVEMENT_PROFILES[profileId]) profileId = 'recovered';
  movementProfile = profileId;
  lastAutoGait = '';
  if (animationMode === 'auto') chooseAutoAnimation();
  refreshInspectionUI();
}

function setAnimationMode(mode) {
  animationMode = mode;
  if (mode === 'walk') setAnimationClip(5);
  if (mode === 'run') setAnimationClip(0);
  refreshInspectionUI();
}

function toggleAnimationPause() {
  animationPaused = !animationPaused;
  refreshInspectionUI();
}

function requestAnimationStep() {
  animationStepSeconds += 1 / 30;
}

function setWireframeVisible(visible) {
  wireframeVisible = !!visible;
  if (catObject) {
    catObject.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => { if ('wireframe' in material) material.wireframe = wireframeVisible; });
    });
  }
  refreshInspectionUI();
}

function toggleWireframe() { setWireframeVisible(!wireframeVisible); }

function toggleSkeleton() {
  skeletonVisible = !skeletonVisible;
  if (skeletonHelper) skeletonHelper.visible = skeletonVisible;
  refreshInspectionUI();
}


function applyEyeLife(timeSeconds) {
  const phase = (timeSeconds + 1.37) % 5.4;
  const blinkClosed = performance.now() < forceBlinkUntil || phase < 0.095 || (phase > 0.155 && phase < 0.215);
  const lookYaw = Math.sin(timeSeconds * 0.37) * 0.045;
  const lookPitch = Math.sin(timeSeconds * 0.29 + 1.2) * 0.022;
  onyxEyeStates.forEach((state, index) => {
    if (!state.object) return;
    if (state.originalQuaternion) {
      state.object.quaternion.copy(state.originalQuaternion);
      if (!blinkClosed) {
        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(lookPitch, lookYaw + (index ? 0.004 : -0.004), 0));
        state.object.quaternion.multiply(q);
      }
    }
    const material = state.object.material;
    if (material && material.color) material.color.setHex(blinkClosed ? 0x020202 : 0xffffff);
    if (material && 'emissiveIntensity' in material) material.emissiveIntensity = blinkClosed ? 0 : 0.92;
  });
  if (onyxWhiskers) {
    onyxWhiskers.rotation.z = Math.sin(timeSeconds * 0.83) * 0.010;
    onyxWhiskers.rotation.y = Math.sin(timeSeconds * 0.51 + 0.8) * 0.006;
  }
}

function applyEyeDepthCorrection() {
  onyxEyeStates.forEach((state) => {
    if (!state.object) return;
    state.object.position.copy(state.originalPosition);
    state.object.scale.copy(state.originalScale);
    if (!correctionsEnabled) return;
    const strength = Math.max(0, Math.min(1.25, eyeDepthStrength));
    // Keep the corneal footprint close to canonical while shortening the sphere inside
    // the skull and shifting its center toward the facial surface.
    state.object.position.z += 16.5 * strength;
    state.object.position.x *= 1 + 0.008 * strength;
    state.object.scale.x *= 1 + 0.040 * strength;
    state.object.scale.y *= 1 + 0.030 * strength;
    state.object.scale.z *= Math.max(0.28, 1 - 0.58 * strength);
  });
}

function setCorrectionsEnabled(enabled) {
  correctionsEnabled = !!enabled;
  applyOnyxMorphLayers(correctionsEnabled);
  if (onyxBelly) onyxBelly = captureOnyxBelly(onyxBelly.mesh);
  if (onyxWhiskers) onyxWhiskers.visible = correctionsEnabled;
  if (catObject) {
    catObject.traverse((object) => {
      if (
        object.name === 'Onyx sculpted nose pad' ||
        object.name === 'Onyx philtrum' ||
        object.name === 'Onyx left mouth crease' ||
        object.name === 'Onyx right mouth crease'
      ) object.visible = correctionsEnabled;
    });
  }
  applyEyeDepthCorrection();
  refreshInspectionUI();
}

function toggleCorrections() { setCorrectionsEnabled(!correctionsEnabled); }


const MORPH_INSPECTION_CONTROLS = {
  morphAnatomy: ['primaryAnatomy', 'morphAnatomyValue'],
  morphCarriage: ['hindquarterCarriage', 'morphCarriageValue'],
  morphChest: ['chestFlow', 'morphChestValue'],
  morphPouch: ['primordialPouch', 'morphPouchValue'],
  morphFace: ['faceCorrections', 'morphFaceValue']
};

function bindMorphInspectionSliders() {
  Object.keys(MORPH_INSPECTION_CONTROLS).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
      const [layerName, valueId] = MORPH_INSPECTION_CONTROLS[id];
      const value = Math.max(0, Number(input.value) || 0);
      if (onyxMorphStack && onyxMorphStack.weights && layerName in onyxMorphStack.weights) {
        onyxMorphStack.weights[layerName] = value;
        applyOnyxMorphLayers(correctionsEnabled);
        if (onyxBelly) onyxBelly = captureOnyxBelly(onyxBelly.mesh);
      }
      const out = document.getElementById(valueId);
      if (out) out.textContent = `${value.toFixed(2)}×`;
    });
  });
}

function refreshMorphInspectionSliders() {
  Object.keys(MORPH_INSPECTION_CONTROLS).forEach((id) => {
    const input = document.getElementById(id);
    const [layerName, valueId] = MORPH_INSPECTION_CONTROLS[id];
    const value = onyxMorphStack && onyxMorphStack.weights && layerName in onyxMorphStack.weights
      ? onyxMorphStack.weights[layerName]
      : Number(input && input.value) || 1;
    if (input) input.value = String(value);
    const out = document.getElementById(valueId);
    if (out) out.textContent = `${value.toFixed(2)}×`;
  });
}


function getBehaviorDefinition(stateId) {
  return (BEHAVIOR_GRAPH.states || {})[stateId] || null;
}

function pickWeightedState(next) {
  // Graph transitions remain authoritative; the dossier's Onyx-specific idle preferences
  // modulate only states that already appear in the allowed transition set. This preserves
  // context gates while making him sleep/loaf/sit/groom/wander in Onyx-like proportions.
  const entries = Object.entries(next || {})
    .filter(([id, weight]) => getBehaviorDefinition(id) && Number(weight) > 0)
    .map(([id, weight]) => {
      const personality = Number(PERSONALITY_IDLE_WEIGHTS[id]);
      const multiplier = Number.isFinite(personality) ? (0.72 + personality * 1.75) : 1;
      return [id, Number(weight) * multiplier];
    });
  if (!entries.length) return 'loaf';
  const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  let roll = Math.random() * total;
  for (const [id, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return id;
  }
  return entries[entries.length - 1][0];
}

function resetBehaviorTimer() {
  const def = getBehaviorDefinition(behaviorState);
  const range = def && def.duration_seconds;
  behaviorRemaining = Array.isArray(range) && range.length >= 2
    ? Number(range[0]) + Math.random() * Math.max(0, Number(range[1]) - Number(range[0]))
    : 12;
}

function setBehaviorState(stateId, source = 'preview') {
  if (!getBehaviorDefinition(stateId)) stateId = BEHAVIOR_GRAPH.initial_state || 'loaf';
  behaviorState = stateId;
  resetBehaviorTimer();
  const select = document.getElementById('behaviorState');
  if (select) select.value = behaviorState;
  const meta = document.getElementById('behaviorMeta');
  const def = getBehaviorDefinition(behaviorState) || {};
  if (meta) {
    const noNeed = def.not_a_need ? ' · expression only, not a need' : '';
    meta.textContent = `${behaviorState.replaceAll('_',' ')} · ${source}${noNeed} · core traits: ${CORE_TRAITS.join(', ') || 'dossier-defined'}`;
  }
  if (backendConnected) syncBehaviorToBackend().catch(() => {});
}

function triggerBehaviorEvent(eventId) {
  const eventDef = (BEHAVIOR_GRAPH.events || {})[eventId];
  if (eventDef && eventDef.state) setBehaviorState(eventDef.state, `event: ${eventId}`);
}

function updateBehaviorState(delta) {
  if (!behaviorAutoEnabled || currentMovementMode !== 'idle' || jumpState.phase !== 'grounded') return;
  behaviorRemaining -= delta;
  if (behaviorRemaining > 0) return;
  const def = getBehaviorDefinition(behaviorState) || {};
  setBehaviorState(pickWeightedState(def.next), 'needs-free auto');
}

function applyBehaviorPose(timeSeconds) {
  if (!onyxBones || currentMovementMode !== 'idle' || jumpState.phase !== 'grounded') return;
  const sway = Math.sin(timeSeconds * 0.8);
  if (behaviorState === 'sit') {
    addBoneEuler(onyxBones.backThighL, 0.20, 0, 0); addBoneEuler(onyxBones.backThighR, 0.20, 0, 0);
    addBoneEuler(onyxBones.backCalfL, -0.28, 0, 0); addBoneEuler(onyxBones.backCalfR, -0.28, 0, 0);
    addBoneEuler(onyxBones.hip, 0.07, 0, 0);
  } else if (behaviorState === 'sleep' || behaviorState === 'sleepy_expression') {
    addBoneEuler(onyxBones.neck2, 0.14, 0.05, 0.08); addBoneEuler(onyxBones.head, 0.18, 0.08, 0.10);
    addBoneEuler(onyxBones.backThighL, 0.18, 0, 0); addBoneEuler(onyxBones.backThighR, 0.16, 0, 0);
    addBoneEuler(onyxBones.tail1, 0, 0, 0.10); addBoneEuler(onyxBones.tail2, 0, 0, 0.12);
  } else if (behaviorState === 'groom') {
    addBoneEuler(onyxBones.head, 0.08, 0.22 + sway * 0.04, 0.14);
    addBoneEuler(onyxBones.frontThighL, -0.20, 0, 0.12); addBoneEuler(onyxBones.frontCalfL, 0.28, 0, 0);
  } else if (behaviorState === 'pet_lean' || behaviorState === 'snuggle') {
    addBoneEuler(onyxBones.neck2, 0, 0.10, 0.07); addBoneEuler(onyxBones.head, 0.02, 0.14, 0.10);
    addBoneEuler(onyxBones.spine2, 0, 0, 0.025);
  } else if (behaviorState === 'play') {
    addBoneEuler(onyxBones.head, -0.03, sway * 0.10, 0); addBoneEuler(onyxBones.tail2, 0, 0, sway * 0.10);
    addBoneEuler(onyxBones.frontThighL, -0.08, 0, 0); addBoneEuler(onyxBones.frontThighR, 0.05, 0, 0);
  } else if (behaviorState === 'meow' || behaviorState === 'yowl' || behaviorState === 'hungry_expression') {
    const open = behaviorState === 'yowl' ? 0.22 : 0.12;
    addBoneEuler(onyxBones.head, -0.05, 0, 0); addBoneEuler(onyxBones.mouth, open, 0, 0);
    addBoneEuler(onyxBones.earL, 0, 0, -0.04); addBoneEuler(onyxBones.earR, 0, 0, 0.035);
  } else if (behaviorState === 'professor') {
    // The dossier's one upright exception. Keep this conservative and cat-sized: hindquarter
    // settle + spinal lift, with no human clothing or body replacement.
    addBoneEuler(onyxBones.hip, -0.16, 0, 0);
    addBoneEuler(onyxBones.spine2, -0.15, 0, 0); addBoneEuler(onyxBones.spine3, -0.18, 0, 0);
    addBoneEuler(onyxBones.backThighL, 0.34, 0, 0); addBoneEuler(onyxBones.backThighR, 0.34, 0, 0);
    addBoneEuler(onyxBones.frontThighL, -0.28, 0, 0.08); addBoneEuler(onyxBones.frontThighR, -0.28, 0, -0.08);
    addBoneEuler(onyxBones.head, 0, sway * 0.025, 0);
  } else if (behaviorState === 'loaf') {
    addBoneEuler(onyxBones.backThighL, 0.07, 0, 0); addBoneEuler(onyxBones.backThighR, 0.07, 0, 0);
    addBoneEuler(onyxBones.frontCalfL, -0.04, 0, 0); addBoneEuler(onyxBones.frontCalfR, -0.04, 0, 0);
  }
}

function flattenDossierActions() {
  const actions = [];
  Object.entries(ACTION_LIBRARY || {}).forEach(([family, items]) => {
    (items || []).forEach((item) => {
      const name = typeof item === 'string' ? item : item.name;
      if (!name) return;
      actions.push({ family, name, description: typeof item === 'string' ? '' : (item.description || '') });
    });
  });
  return actions;
}

function normalizeActionName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function setDossierAction(name, source = 'manual preview') {
  dossierAction = name || 'none';
  dossierActionStartedAt = performance.now() * 0.001;
  const select = document.getElementById('dossierAction'); if (select) select.value = dossierAction;
  const meta = document.getElementById('dossierActionMeta');
  const entry = flattenDossierActions().find((item) => item.name === dossierAction);
  if (meta) meta.textContent = entry
    ? `${entry.family} · ${entry.name} · ${source} · ${entry.description}`
    : 'No dossier action overlay active. Behavior, gait, breathing, eyes, whiskers, and pouch dynamics remain available.';

  const key = normalizeActionName(dossierAction);
  if (key === 'walk' || key === 'leash walk') setAnimationMode('walk');
  if (key === 'climb and jump') space = true;
  if (key === 'sit stay come') setBehaviorState('sit', 'dossier action');
  if (key === 'loaf') setBehaviorState('loaf', 'dossier action');
  if (key === 'sleep and wake') setBehaviorState('sleep', 'dossier action');
  if (key === 'snuggle') setBehaviorState('snuggle', 'dossier action');
  if (key === 'pet response') setBehaviorState('pet_lean', 'dossier action');
  if (key === 'meow and yowl') setBehaviorState('meow', 'dossier action');
  if (key === 'professor') setBehaviorState('professor', 'dossier action');
  if (key === 'groom and scratch') setBehaviorState('groom', 'dossier action');
  if (key === 'play and investigate') setBehaviorState('play', 'dossier action');
  if (key === 'slow blink') forceBlinkUntil = performance.now() + 820;
  if (backendConnected) backendJsonp('onyx.runtime.activity.sync', { activity: `preview:${dossierAction}`, activityState: { family: entry ? entry.family : '', source }, autonomous: false }).catch(() => null);
}

function stopDossierAction() {
  dossierAction = 'none';
  dossierActionStartedAt = 0;
  if (professorClipboard) professorClipboard.visible = false;
  const select = document.getElementById('dossierAction'); if (select) select.value = 'none';
  const meta = document.getElementById('dossierActionMeta'); if (meta) meta.textContent = 'No dossier action overlay active. Behavior, gait, breathing, eyes, whiskers, and pouch dynamics remain available.';
}

function applyDossierActionPose(timeSeconds) {
  if (!onyxBones || dossierAction === 'none' || currentMovementMode !== 'idle' || jumpState.phase !== 'grounded') return;
  const key = normalizeActionName(dossierAction);
  const t = timeSeconds - dossierActionStartedAt;
  const slow = Math.sin(t * 1.35), quick = Math.sin(t * 5.4), alternate = Math.sin(t * 7.2);

  if (key === 'stretch') {
    addBoneEuler(onyxBones.spine2, -0.10, 0, 0.02); addBoneEuler(onyxBones.spine3, 0.13, 0, -0.02);
    addBoneEuler(onyxBones.frontThighL, -0.30, 0, 0); addBoneEuler(onyxBones.frontThighR, -0.30, 0, 0);
    addBoneEuler(onyxBones.backThighL, 0.18, 0, 0); addBoneEuler(onyxBones.backThighR, 0.18, 0, 0);
    addBoneEuler(onyxBones.neck2, -0.08, 0, 0); addBoneEuler(onyxBones.head, -0.08, 0, 0);
  } else if (key === 'knead') {
    addBoneEuler(onyxBones.frontThighL, -0.10 + alternate * 0.08, 0, 0);
    addBoneEuler(onyxBones.frontThighR, -0.10 - alternate * 0.08, 0, 0);
    addBoneEuler(onyxBones.frontCalfL, 0.06 - alternate * 0.05, 0, 0);
    addBoneEuler(onyxBones.frontCalfR, 0.06 + alternate * 0.05, 0, 0);
    addBoneEuler(onyxBones.spine2, slow * 0.007, 0, 0);
  } else if (key === 'slow blink') {
    if ((t % 2.7) < 0.75) forceBlinkUntil = Math.max(forceBlinkUntil, performance.now() + 120);
  } else if (key === 'purr') {
    addBoneEuler(onyxBones.spine2, quick * 0.0045, 0, quick * 0.002);
    addBoneEuler(onyxBones.neck2, quick * 0.003, 0, 0);
  } else if (key === 'thinking thoughtful') {
    addBoneEuler(onyxBones.head, 0.015, 0.13 + slow * 0.035, 0.08);
    addBoneEuler(onyxBones.earL, 0.02, 0, -0.045); addBoneEuler(onyxBones.earR, -0.01, 0, 0.025);
  } else if (key === 'listening caring') {
    addBoneEuler(onyxBones.neck2, 0.02, slow * 0.025, 0.035);
    addBoneEuler(onyxBones.head, 0.025, slow * 0.020, 0.025);
    addBoneEuler(onyxBones.earL, 0, 0.025, -0.018); addBoneEuler(onyxBones.earR, 0, -0.025, 0.018);
    if ((t % 4.5) > 3.65) forceBlinkUntil = Math.max(forceBlinkUntil, performance.now() + 95);
  } else if (key === 'judgmental refusal') {
    addBoneEuler(onyxBones.head, 0.015, 0.18, -0.045);
    addBoneEuler(onyxBones.earL, -0.05, 0, 0.04); addBoneEuler(onyxBones.earR, -0.045, 0, -0.04);
    addBoneEuler(onyxBones.tail3, 0, 0, quick * 0.055);
  } else if (key === 'service alert') {
    addBoneEuler(onyxBones.neck2, -0.04, 0, 0); addBoneEuler(onyxBones.head, -0.07, slow * 0.018, 0);
    addBoneEuler(onyxBones.earL, 0.03, 0, -0.02); addBoneEuler(onyxBones.earR, 0.03, 0, 0.02);
  } else if (key === 'eat and drink') {
    addBoneEuler(onyxBones.neck2, 0.22, 0, 0); addBoneEuler(onyxBones.head, 0.25 + quick * 0.012, 0, 0);
    addBoneEuler(onyxBones.mouth, 0.035 + Math.max(0, quick) * 0.025, 0, 0);
  } else if (key === 'furniture entry and exit') {
    addBoneEuler(onyxBones.backThighL, 0.13, 0, 0); addBoneEuler(onyxBones.backThighR, 0.13, 0, 0);
    addBoneEuler(onyxBones.frontThighL, -0.09, 0, 0); addBoneEuler(onyxBones.frontThighR, -0.09, 0, 0);
    addBoneEuler(onyxBones.spine2, 0.035, 0, 0);
  } else if (key === 'purchase and layout reactions') {
    addBoneEuler(onyxBones.head, 0, slow * 0.14, -0.025); addBoneEuler(onyxBones.neck2, 0, slow * 0.065, 0);
    addBoneEuler(onyxBones.tail2, 0, 0, quick * 0.035);
  } else if (key === 'clothing preview') {
    addBoneEuler(onyxBones.head, 0, slow * 0.045, 0); addBoneEuler(onyxBones.tail1, 0, 0, slow * 0.03);
  } else if (key === 'tablet bird watching') {
    addBoneEuler(onyxBones.head, -0.035, 0.14 + slow * 0.075, 0);
    addBoneEuler(onyxBones.neck2, -0.025, 0.09 + slow * 0.035, 0);
    addBoneEuler(onyxBones.earL, 0.015, 0.035, -0.015); addBoneEuler(onyxBones.earR, 0.015, -0.035, 0.015);
  }
}

function createProfessorClipboard() {
  if (professorClipboard || !scene) return;
  const group = new THREE.Group(); group.name = 'Professor Onyx clipboard preview';
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x8b6b49, roughness: 0.88, metalness: 0 });
  const clipMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.55, metalness: 0.35 });
  const board = new THREE.Mesh(new THREE.BoxBufferGeometry(0.12, 0.008, 0.17), boardMat);
  const clip = new THREE.Mesh(new THREE.BoxBufferGeometry(0.048, 0.012, 0.018), clipMat); clip.position.set(0, 0.010, -0.067);
  group.add(board); group.add(clip); group.visible = false; scene.add(group); professorClipboard = group;
}

function updateProfessorClipboard() {
  if (!professorClipboard || !catObject) return;
  const show = behaviorState === 'professor' || normalizeActionName(dossierAction) === 'professor';
  professorClipboard.visible = show;
  if (!show) return;
  const yaw = catObject.rotation.y || 0;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  professorClipboard.position.copy(catObject.position)
    .add(forward.multiplyScalar(0.11)).add(right.multiplyScalar(0.055));
  professorClipboard.position.y += 0.29;
  professorClipboard.rotation.set(0.20, yaw, -0.12);
}

function refreshProgressionSummary() {
  const el = document.getElementById('progressionMeta');
  if (!el) return;
  if (!PROGRESSION) { el.textContent = 'Progression runtime unavailable; dossier data remains loaded.'; return; }
  const state = PROGRESSION.snapshot(), currency = PROGRESSION.currencyBreakdown();
  const learned = Object.entries(state.learnedTraitEvidence || {}).filter(([,v]) => Number(v.points||0)>0).map(([id,v]) => `${id}:${v.stage}`).join(', ');
  el.textContent = `needs-free ✓ · core traits: ${(state.coreTraits||[]).join(', ')} · learned evidence: ${learned || 'none yet'} · design tier ${state.designTier} · spaces ${(state.unlockedSpaces||[]).length} · wallet ${currency.platinum}p ${currency.gold}g ${currency.silver}s ${currency.copper}c`;
}

function getCameraPreset(id) {
  return (CAMERA_SPEC.presets || []).find((preset) => preset.id === id) || (CAMERA_SPEC.presets || [])[0] || null;
}

function setCameraMode(mode) {
  cameraMode = mode === 'play25d' ? 'play25d' : 'inspection';
  const select = document.getElementById('cameraMode'); if (select) select.value = cameraMode;
  if (controls) controls.isDragging = false;
}

function setCameraPreset(id) {
  if (getCameraPreset(id)) cameraPresetId = id;
  const select = document.getElementById('cameraPreset'); if (select) select.value = cameraPresetId;
}

function backendJsonp(action, data = {}) {
  return new Promise((resolve, reject) => {
    const endpoint = window.ONYX_BACKEND_ENDPOINT;
    if (!endpoint) return reject(new Error('Backend endpoint is not configured.'));
    const callback = `__onyxBackend_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => cleanup(new Error('Backend request timed out.')), 10000);
    function cleanup(error, value) {
      clearTimeout(timer); delete window[callback]; if (script.parentNode) script.parentNode.removeChild(script);
      error ? reject(error) : resolve(value);
    }
    window[callback] = (payload) => cleanup(null, payload);
    const params = new URLSearchParams({ action, callback, runtimeMode: 'full_3d', profileKey: VIEWER_PROFILE_KEY });
    // The attached backend parses a JSON `data` envelope before routing runtime actions.
    // Keep frontend fields aligned with that contract instead of inventing parallel names.
    params.set('data', JSON.stringify(Object.assign({ runtimeMode: 'full_3d', profileKey: VIEWER_PROFILE_KEY }, data || {})));
    script.onerror = () => cleanup(new Error('Backend script request failed.'));
    script.src = `${endpoint}?${params.toString()}`;
    document.head.appendChild(script);
  });
}

async function checkBackend() {
  const status = document.getElementById('backendStatus'); const dot = document.getElementById('backendDot');
  if (status) status.textContent = 'checking…'; if (dot) dot.className = 'status-dot';
  try {
    const result = await backendJsonp('onyx.runtime.health');
    backendConnected = !!(result && result.ok !== false);
    backendLastStatus = result;
    if (backendConnected) {
      // Report only capabilities this viewer actually proves. WebGL1 is sufficient here;
      // omit webgl2 rather than falsely reporting it as required/unsupported.
      await backendJsonp('onyx.runtime.capabilities.report', { capabilities: { webgl: !!renderer, threejs: true, ammoPhysics: physicsAvailable } }).catch(() => null);
      await backendJsonp('onyx.runtime.mode.select', { mode: 'full_3d', behavior: behaviorState }).catch(() => null);
    }
    if (status) status.textContent = backendConnected ? 'connected · runtime contract matched' : `replied: ${result && result.error ? result.error : 'not ready'}`;
    if (dot) dot.className = `status-dot ${backendConnected ? 'ok' : 'bad'}`;
  } catch (error) {
    backendConnected = false; backendLastStatus = { ok:false, error:String(error) };
    if (status) status.textContent = 'offline / unavailable'; if (dot) dot.className = 'status-dot bad';
  }
}

async function syncBehaviorToBackend() {
  if (!backendConnected) return null;
  return backendJsonp('onyx.runtime.behavior.sync', { behavior: behaviorState, activity: currentMovementMode });
}

function bindInspectionUI() {
  const mode = document.getElementById('animationMode');
  const movement = document.getElementById('movementProfile');
  const speed = document.getElementById('animationSpeed');
  const pause = document.getElementById('pauseAnimation');
  const step = document.getElementById('stepAnimation');
  const wire = document.getElementById('wireframeToggle');
  const skeleton = document.getElementById('skeletonToggle');
  const compare = document.getElementById('correctionToggle');
  const measure = document.getElementById('measurementToggle');
  const resetCamera = document.getElementById('resetCamera');
  const referencePose = document.getElementById('referencePose');
  const referencePoseImage = document.getElementById('referencePoseImage');
  if (mode) mode.addEventListener('change', () => setAnimationMode(mode.value));
  if (movement) movement.addEventListener('change', () => setMovementProfile(movement.value));
  if (speed) speed.addEventListener('input', () => {
    animationSpeed = Math.max(0.05, Math.min(1.5, Number(speed.value) || 1));
    refreshInspectionUI();
  });
  if (pause) pause.addEventListener('click', toggleAnimationPause);
  if (step) step.addEventListener('click', requestAnimationStep);
  if (wire) wire.addEventListener('click', toggleWireframe);
  if (skeleton) skeleton.addEventListener('click', toggleSkeleton);
  if (compare) compare.addEventListener('click', toggleCorrections);
  if (measure) measure.addEventListener('click', toggleMeasurementGuides);
  if (resetCamera) resetCamera.addEventListener('click', () => { if (controls) controls.resetCamera(); });
  if (referencePose && referencePoseImage) {
    (ANIMATION_FEATURES.pose_references || []).forEach((pose) => {
      const option = document.createElement('option');
      option.value = `./development/reference/dossier_pose_refs/${pose.file}`;
      option.textContent = `${String(pose.number).padStart(2,'0')} · ${pose.name}`;
      referencePose.appendChild(option);
    });
    const contact = document.createElement('option'); contact.value = './development/reference/dossier_pose_refs/animation_contact_sheet.jpg'; contact.textContent = 'Contact sheet · all dossier poses'; referencePose.appendChild(contact);
    referencePose.addEventListener('change', () => {
      const src = referencePose.value;
      referencePoseImage.src = src || '';
      referencePoseImage.style.display = src ? 'block' : 'none';
    });
  }
  const cameraModeEl = document.getElementById('cameraMode');
  const cameraPresetEl = document.getElementById('cameraPreset');
  if (cameraPresetEl) {
    (CAMERA_SPEC.presets || []).forEach((preset) => {
      const option = document.createElement('option'); option.value = preset.id; option.textContent = `${preset.id.replaceAll('_',' ')} · ${preset.purpose || ''}`; cameraPresetEl.appendChild(option);
    });
    cameraPresetEl.value = cameraPresetId;
    cameraPresetEl.addEventListener('change', () => setCameraPreset(cameraPresetEl.value));
  }
  if (cameraModeEl) cameraModeEl.addEventListener('change', () => setCameraMode(cameraModeEl.value));
  const behaviorStateEl = document.getElementById('behaviorState');
  if (behaviorStateEl) {
    Object.keys(BEHAVIOR_GRAPH.states || {}).forEach((stateId) => {
      const option = document.createElement('option'); option.value = stateId; option.textContent = stateId.replaceAll('_',' '); behaviorStateEl.appendChild(option);
    });
    behaviorStateEl.value = behaviorState;
    behaviorStateEl.addEventListener('change', () => setBehaviorState(behaviorStateEl.value, 'manual preview'));
  }
  const behaviorAuto = document.getElementById('behaviorAuto');
  if (behaviorAuto) behaviorAuto.addEventListener('click', () => {
    behaviorAutoEnabled = !behaviorAutoEnabled; behaviorAuto.setAttribute('aria-pressed', String(behaviorAutoEnabled));
    behaviorAuto.textContent = behaviorAutoEnabled ? 'Auto context: on' : 'Auto context'; resetBehaviorTimer();
  });
  document.querySelectorAll('.behavior-event').forEach((button) => button.addEventListener('click', () => triggerBehaviorEvent(button.dataset.event)));
  const dossierActionEl = document.getElementById('dossierAction');
  if (dossierActionEl) {
    flattenDossierActions().forEach((entry) => {
      const option = document.createElement('option'); option.value = entry.name; option.textContent = `${entry.family}: ${entry.name}`; dossierActionEl.appendChild(option);
    });
    dossierActionEl.addEventListener('change', () => setDossierAction(dossierActionEl.value, 'selector'));
  }
  const dossierActionPlay = document.getElementById('dossierActionPlay'); if (dossierActionPlay) dossierActionPlay.addEventListener('click', () => setDossierAction(dossierActionEl ? dossierActionEl.value : dossierAction, 'preview button'));
  const dossierActionStop = document.getElementById('dossierActionStop'); if (dossierActionStop) dossierActionStop.addEventListener('click', stopDossierAction);
  refreshProgressionSummary();
  const backendConnect = document.getElementById('backendConnect'); if (backendConnect) backendConnect.addEventListener('click', checkBackend);
  const eyeDepth = document.getElementById('eyeDepth');
  if (eyeDepth) eyeDepth.addEventListener('input', () => {
    eyeDepthStrength = Math.max(0, Math.min(1.25, Number(eyeDepth.value) || 0)); applyEyeDepthCorrection();
    const out = document.getElementById('eyeDepthValue'); if (out) out.textContent = `${eyeDepthStrength.toFixed(2)}×`;
  });
  bindMorphInspectionSliders();
  setBehaviorState(behaviorState, 'dossier initial');
  refreshInspectionUI();
}

function refreshInspectionUI() {
  const mode = document.getElementById('animationMode');
  const movement = document.getElementById('movementProfile');
  const movementMeta = document.getElementById('movementProfileMeta');
  const speed = document.getElementById('animationSpeed');
  const speedValue = document.getElementById('animationSpeedValue');
  const pause = document.getElementById('pauseAnimation');
  const wire = document.getElementById('wireframeToggle');
  const skeleton = document.getElementById('skeletonToggle');
  const compare = document.getElementById('correctionToggle');
  const measure = document.getElementById('measurementToggle');
  const clipName = document.getElementById('clipName');
  if (mode) mode.value = animationMode;
  if (movement) movement.value = movementProfile;
  if (movementMeta) movementMeta.textContent = getMovementProfile().label;
  if (speed) speed.value = String(animationSpeed);
  if (speedValue) speedValue.textContent = `${animationSpeed.toFixed(2)}×`;
  if (pause) pause.textContent = animationPaused ? 'Play' : 'Pause';
  if (wire) wire.setAttribute('aria-pressed', String(wireframeVisible));
  if (skeleton) skeleton.setAttribute('aria-pressed', String(skeletonVisible));
  if (compare) {
    compare.setAttribute('aria-pressed', String(correctionsEnabled));
    compare.textContent = correctionsEnabled ? 'Corrected Onyx' : 'SmellyCat base (canonical)';
  }
  if (measure) measure.setAttribute('aria-pressed', String(measurementsVisible));
  if (clipName) {
    const clip = catClips[currentClipIndex];
    clipName.textContent = clip ? (clip.name || `clip ${currentClipIndex}`) : 'loading';
  }
  const cameraModeEl = document.getElementById('cameraMode'); if (cameraModeEl) cameraModeEl.value = cameraMode;
  const cameraPresetEl = document.getElementById('cameraPreset'); if (cameraPresetEl) cameraPresetEl.value = cameraPresetId;
  const eyeDepth = document.getElementById('eyeDepth'); if (eyeDepth) eyeDepth.value = String(eyeDepthStrength);
  const eyeDepthValue = document.getElementById('eyeDepthValue'); if (eyeDepthValue) eyeDepthValue.textContent = `${eyeDepthStrength.toFixed(2)}×`;
  refreshMorphInspectionSliders();
}

function loadCat(model) {
  const Ammo = window.Ammo;
  const loader = new FBXLoader();
  const textureLoader = new THREE.TextureLoader();

  try {
    if (!window.ONYX_EMBEDDED_ASSETS) throw new Error('Embedded Onyx assets are missing.');
    const binary = atob(window.ONYX_EMBEDDED_ASSETS.fbxBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const gltf = loader.parse(bytes.buffer, '');

    const urls = window.ONYX_EMBEDDED_ASSETS.textureDataUrls || {};
    const furAlbedo = textureLoader.load(urls.furAlbedo || window.ONYX_EMBEDDED_ASSETS.textureDataUrl);
    const eyeAlbedo = urls.eyeSphereAlbedo ? textureLoader.load(urls.eyeSphereAlbedo) : null;
    const eyeEmissive = urls.eyeSphereEmissive ? textureLoader.load(urls.eyeSphereEmissive) : null;

    const maxAnisotropy = renderer.capabilities && renderer.capabilities.getMaxAnisotropy
      ? Math.min(8, renderer.capabilities.getMaxAnisotropy())
      : 1;
    [furAlbedo, eyeAlbedo, eyeEmissive]
      .filter(Boolean)
      .forEach((texture) => {
        texture.anisotropy = maxAnisotropy;
        // These are authored color images. Marking them sRGB prevents the old gamma-output
        // renderer from lifting near-black texels into charcoal gray.
        if ('encoding' in texture) texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
      });

    gltf.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;

      // Rendering-fix pass: the FBX Cat mesh has one active geometry group and it uses
      // material index 0 ("skin"). Previous detail compositing painted paw/ear colors into
      // the wrong UV regions. Use the corrected neutral-black fur albedo only, keep the
      // surface fully opaque/double-sided, and avoid aggressive normal/roughness maps that
      // produced silver-white specular streaks along the back, shoulder, head and spine.
      if (object.name === 'Cat') {
        const bodyMaterial = new THREE.MeshStandardMaterial({
          name: 'Onyx sleek black fur',
          color: 0xf2f2f2,
          map: furAlbedo,
          roughness: 0.94,
          metalness: 0,
          skinning: !!object.isSkinnedMesh,
          side: THREE.DoubleSide
        });
        bodyMaterial.transparent = false;
        bodyMaterial.opacity = 1;
        bodyMaterial.alphaTest = 0;
        bodyMaterial.depthWrite = true;
        bodyMaterial.depthTest = true;
        bodyMaterial.dithering = true;
        if ('shadowSide' in bodyMaterial) bodyMaterial.shadowSide = THREE.DoubleSide;
        object.material = bodyMaterial;
      }

      // Sphere and Sphere001 are the two actual rendered eyes. The empty "eye" mesh in
      // this FBX has zero vertices, so these sphere materials are the reliable eye route.
      // The corrected eye texture expands the supplied green-yellow iris across the sphere
      // UV and uses capped emissive light so the eyes remain visible without white bloom.
      if ((object.name === 'Sphere.001' || object.name === 'Sphere001' || object.name === 'Sphere') && eyeAlbedo) {
        // Preserve the exact canonical transform so the viewer can compare source geometry
        // against the current correction layer without reloading the FBX.
        onyxEyeStates.push({
          object,
          originalPosition: object.position.clone(),
          originalScale: object.scale.clone(),
          originalQuaternion: object.quaternion.clone()
        });
        // The first correction made the spheres larger in depth, which left too much of
        // each eyeball intersecting the skull. Keep the visible corneal footprint, move the
        // eye centre forward substantially, and compress only the skull-depth axis.
        object.position.z += 16.5 * eyeDepthStrength;
        object.position.x *= 1 + 0.008 * eyeDepthStrength;
        object.scale.x *= 1 + 0.040 * eyeDepthStrength;
        object.scale.y *= 1 + 0.030 * eyeDepthStrength;
        object.scale.z *= Math.max(0.28, 1 - 0.58 * eyeDepthStrength);
        const eyeMaterial = new THREE.MeshStandardMaterial({
          name: 'Onyx green-yellow eye',
          color: 0xffffff,
          map: eyeAlbedo,
          roughness: 0.2,
          metalness: 0,
          skinning: !!object.isSkinnedMesh,
          emissive: 0x819600,
          emissiveMap: eyeEmissive || null,
          side: THREE.DoubleSide
        });
        if ('emissiveIntensity' in eyeMaterial) eyeMaterial.emissiveIntensity = 0.92;
        eyeMaterial.transparent = false;
        eyeMaterial.opacity = 1;
        eyeMaterial.alphaTest = 0;
        eyeMaterial.depthWrite = true;
        eyeMaterial.depthTest = true;
        object.material = eyeMaterial;
        object.renderOrder = 2;
      }
    });

    const catMesh = gltf.getObjectByName('Cat');
    if (catMesh) {
      applyOnyxMorphology(catMesh);
      addOnyxFaceDetails(catMesh);
      addOnyxWhiskers(catMesh);
      onyxBelly = captureOnyxBelly(catMesh);
      onyxBones = captureOnyxBones(catMesh);
    }

    if (model.position) gltf.position.copy(new THREE.Vector3(model.position.x, model.position.y, model.position.z));
    if (model.scale) gltf.scale.copy(new THREE.Vector3(model.scale, model.scale, model.scale));
    if (model.rotation) gltf.rotation.copy(new THREE.Euler(model.rotation.x, model.rotation.y, model.rotation.z));

    const mixer = new THREE.AnimationMixer(gltf);
    catMixer = mixer;
    catClips = gltf.animations || [];
    const clip = catClips[model.animationName];
    if (!clip) throw new Error(`Expected embedded animation index ${model.animationName}, but it was not found.`);
    currentClipIndex = model.animationName;
    catWalkAction = mixer.clipAction(catClips[5]);
    catRunAction = mixer.clipAction(catClips[0]);
    catWalkAction.enabled = true;
    catRunAction.enabled = true;
    catWalkAction.setEffectiveWeight(1);
    catRunAction.setEffectiveWeight(0);
    catWalkAction.play();
    catRunAction.play();
    catAction = catWalkAction;
    lastAutoGait = 'walk';

    // Physics is calibrated in SI units too: 27 lb = ~12.25 kg. The collision
    // box follows Onyx's real BODY dimensions; the tail is intentionally excluded.
    // Inspection is deliberately resilient: if Ammo cannot initialize, the visual cat
    // still loads and uses deterministic kinematic movement/jump fallbacks.
    gltf.name = 'thecat';
    if (physicsAvailable && window.Ammo && physicsWorld) {
      const Ammo = window.Ammo;
      const catMass = ONYX_REAL.weightKg;
      const catShape = new Ammo.btBoxShape(new Ammo.btVector3(
        (ONYX_REAL.chestWidthIn * INCH_M) * 0.5,
        0.225, // calibrated FBX root -> paw-floor offset at MODEL.scale ~= 0.223 m
        (ONYX_REAL.noseToTailBaseIn * INCH_M) * 0.5
      ));
      catShape.setMargin(0.01);
      const body = createRigidBody(gltf, catShape, catMass, gltf.position, gltf.quaternion, true);
      body.setFriction(0.5);
    } else {
      scene.add(gltf);
      gltf.userData.physicsBody = null;
    }

    catObject = gltf;
    createProfessorClipboard();
    controls = new ThirdPersonControls(gltf, renderer.domElement);
    skeletonHelper = new THREE.SkeletonHelper(gltf);
    skeletonHelper.name = 'Onyx skeleton inspection helper';
    skeletonHelper.visible = skeletonVisible;
    scene.add(skeletonHelper);
    refreshInspectionUI();
    statusEl.textContent = `Onyx loaded at real scale · ~${ONYX_REAL.normalOverallIn} in normal overall length · ${ROOM_REAL.widthFt} × ${ROOM_REAL.depthFt} × ${ROOM_REAL.heightFt} ft calibration room · animation: ${clip.name || 'index 5'} · movement: ${getMovementProfile().label} · ${physicsAvailable ? 'physics active' : 'inspection-safe kinematic mode'}`;
  } catch (error) {
    fail(error);
  }
}

function resetCat() {
  if (!catObject) return;
  if (physicsAvailable && catObject.userData.physicsBody && window.Ammo) {
    const Ammo = window.Ammo;
    const body = catObject.userData.physicsBody;
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0.24, 0));
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    body.setWorldTransform(transform);
    body.getMotionState().setWorldTransform(transform);
    body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
    body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
    body.activate();
  } else {
    catObject.position.set(0, 0.24, 0);
    catObject.quaternion.set(0, 0, 0, 1);
    fallbackVerticalVelocity = 0;
  }
  jumpState.phase = 'grounded';
  jumpState.timer = 0;
  jumpState.launched = false;
  jumpState.lastVerticalVelocity = 0;
  rotay = 2;
  if (controls && controls.resetCamera) controls.resetCamera();
}

function ThirdPersonControls(object, domElement) {
  this.object = object;
  this.domElement = domElement;
  // Travel/turn values come from the selected movement recovery profile.
  this.moveForward = false;
  this.moveBackward = false;
  this.moveLeft = false;
  this.moveRight = false;

  // Inspection camera: full 360-degree yaw, direct top-down and underside access,
  // pointer capture (so dragging never "sticks"), and wheel zoom.
  this.orbitYaw = Math.PI * 1.5;
  this.orbitPitch = 0.2;
  this.orbitDistance = 1.75;
  this.minOrbitDistance = 0.48;
  this.maxOrbitDistance = 6.0;
  this.rotateSpeed = 0.0075;
  this.zoomSpeed = 0.00135;
  this.isDragging = false;
  this.activePointerId = null;
  this.lastPointerX = 0;
  this.lastPointerY = 0;

  this.domElement.setAttribute('tabindex', 0);
  this.domElement.style.touchAction = 'none';

  this.handleResize = () => {};

  this.resetCamera = () => {
    this.orbitYaw = Math.PI * 1.5;
    this.orbitPitch = 0.2;
    this.orbitDistance = 1.75;
  };

  this.clampPitch = () => {
    const verticalLimit = Math.PI / 2 - 0.006;
    this.orbitPitch = Math.max(-verticalLimit, Math.min(verticalLimit, this.orbitPitch));
  };

  this.onPointerDown = (event) => {
    event.preventDefault();
    // A deliberate drag always means "inspect Onyx". Never silently discard the drag
    // because a camera preset happened to be active.
    if (cameraMode === 'play25d') setCameraMode('inspection');
    this.isDragging = true;
    this.activePointerId = event.pointerId;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.domElement.focus();
    if (this.domElement.setPointerCapture) this.domElement.setPointerCapture(event.pointerId);
  };

  this.onPointerMove = (event) => {
    if (!this.isDragging || event.pointerId !== this.activePointerId) return;
    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.orbitYaw -= dx * this.rotateSpeed;
    this.orbitPitch -= dy * this.rotateSpeed;
    this.clampPitch();
  };

  this.finishPointer = (event) => {
    if (event.pointerId !== this.activePointerId) return;
    this.isDragging = false;
    this.activePointerId = null;
    if (this.domElement.releasePointerCapture) {
      try { this.domElement.releasePointerCapture(event.pointerId); } catch (error) {}
    }
  };

  this.onWheel = (event) => {
    event.preventDefault();
    if (cameraMode === 'play25d') setCameraMode('inspection');
    this.orbitDistance *= Math.exp(event.deltaY * this.zoomSpeed);
    this.orbitDistance = Math.max(this.minOrbitDistance, Math.min(this.maxOrbitDistance, this.orbitDistance));
  };

  this.onKeyDown = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': event.preventDefault(); this.moveForward = true; break;
      case 'ArrowLeft':
      case 'KeyA': event.preventDefault(); this.moveRight = true; break;
      case 'ArrowDown':
      case 'KeyS': event.preventDefault(); this.moveBackward = true; break;
      case 'ArrowRight':
      case 'KeyD': event.preventDefault(); this.moveLeft = true; break;
      case 'ShiftLeft':
      case 'ShiftRight': event.preventDefault(); shiftIsUp = false; break;
      case 'Space': event.preventDefault(); space = true; break;
    }
  };

  this.onKeyUp = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': this.moveForward = false; break;
      case 'ArrowLeft':
      case 'KeyA': this.moveRight = false; break;
      case 'ArrowDown':
      case 'KeyS': this.moveBackward = false; break;
      case 'ArrowRight':
      case 'KeyD': this.moveLeft = false; break;
      case 'ShiftLeft':
      case 'ShiftRight': shiftIsUp = true; break;
    }
  };

  this.update = (delta) => {
    const Ammo = window.Ammo;
    let velox = 0;
    let veloz = 0;
    let turning = false;

    const movement = getMovementProfile();
    // The recovered profile reproduces the donor viewer's quick steering, but in time-based
    // units instead of frame-dependent +/-0.1 radians per rendered frame.
    if (this.moveLeft) {
      rotay -= movement.turnSpeed * delta;
      turning = true;
    }
    if (this.moveRight) {
      rotay += movement.turnSpeed * delta;
      turning = true;
    }

    if (this.moveBackward) {
      currentMovementMode = 'backward';
      veloz = -movement.backwardSpeed * Math.cos(rotay);
      velox = -movement.backwardSpeed * Math.sin(rotay);
    } else if (this.moveForward) {
      const running = !shiftIsUp;
      const speed = running ? movement.runSpeed : movement.walkSpeed;
      currentMovementMode = running ? 'run' : 'walk';
      veloz = speed * Math.cos(rotay);
      velox = speed * Math.sin(rotay);
    } else if (turning) {
      currentMovementMode = 'turn';
    } else {
      currentMovementMode = 'idle';
    }

    const body = this.object.userData.physicsBody;
    const currentVelocity = physicsAvailable && body && body.getLinearVelocity ? body.getLinearVelocity() : null;
    let verticalVelocity = currentVelocity && currentVelocity.y ? currentVelocity.y() : fallbackVerticalVelocity;
    if (!Number.isFinite(verticalVelocity)) verticalVelocity = 0;

    jumpCooldown = Math.max(0, jumpCooldown - delta);
    if (space) {
      const nearFloor = this.object.position.y < 0.34;
      if (jumpCooldown <= 0 && nearFloor && jumpState.phase === 'grounded') {
        jumpState.phase = 'crouch';
        jumpState.timer = 0.14;
        jumpState.launched = false;
        jumpCooldown = 0.62;
      }
      space = false;
    }

    if (jumpState.phase === 'crouch') {
      currentMovementMode = 'jump';
      jumpState.timer -= delta;
      verticalVelocity = 0;
      if (jumpState.timer <= 0 && !jumpState.launched) {
        verticalVelocity = 3.25;
        jumpState.phase = 'ascent';
        jumpState.launched = true;
      }
    } else if (jumpState.phase !== 'grounded') {
      currentMovementMode = 'jump';
    }
    idle = currentMovementMode === 'idle';
    if (physicsAvailable && body && window.Ammo && physicsWorld) {
      const Ammo = window.Ammo;
      body.setLinearVelocity(new Ammo.btVector3(velox, verticalVelocity, veloz));
      physicsWorld.stepSimulation(delta, 8);

      for (let i = 0; i < rigidBodies.length; i++) {
        const objThree = rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        objPhys.setActivationState(4);
        const ms = objPhys.getMotionState();
        if (!ms) continue;
        ms.getWorldTransform(transformAux1);
        const p = transformAux1.getOrigin();
        const q = transformAux1.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        if (objThree.name !== 'thecat') objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
      const postVelocity = body.getLinearVelocity ? body.getLinearVelocity() : null;
      const postVy = postVelocity && postVelocity.y ? postVelocity.y() : 0;
      jumpState.lastVerticalVelocity = Number.isFinite(postVy) ? postVy : 0;
    } else {
      // Physics-free fallback keeps the inspection viewer useful on browsers/devices where
      // Ammo cannot initialize. It preserves the same phase-based feline jump pose timing.
      this.object.position.x += velox * delta;
      this.object.position.z += veloz * delta;
      if (jumpState.phase !== 'grounded') {
        fallbackVerticalVelocity = verticalVelocity - 9.8 * delta;
        this.object.position.y += fallbackVerticalVelocity * delta;
        if (this.object.position.y <= MODEL.position.y) {
          this.object.position.y = MODEL.position.y;
          fallbackVerticalVelocity = 0;
        }
      } else {
        fallbackVerticalVelocity = 0;
        this.object.position.y = MODEL.position.y;
      }
      jumpState.lastVerticalVelocity = fallbackVerticalVelocity;
    }
    if (jumpState.phase === 'ascent' && jumpState.lastVerticalVelocity < 0.65) jumpState.phase = 'apex';
    if (jumpState.phase === 'apex' && jumpState.lastVerticalVelocity < -0.20) jumpState.phase = 'descent';
    if (jumpState.phase === 'descent' && this.object.position.y < 0.335) {
      jumpState.phase = 'landing';
      jumpState.timer = 0.16;
    }
    if (jumpState.phase === 'landing') {
      jumpState.timer -= delta;
      if (jumpState.timer <= 0) {
        jumpState.phase = 'grounded';
        jumpState.launched = false;
      }
    }

    this.object.rotation.y = rotay;

    const target = new THREE.Vector3(
      this.object.position.x,
      this.object.position.y + (ONYX_REAL.shoulderHeightIn * INCH_M) * 0.72,
      this.object.position.z
    );
    if (cameraMode === 'play25d') {
      const preset = getCameraPreset(cameraPresetId) || { yaw_degrees: -18, pitch_degrees: 18, zoom: 'room and Onyx visible' };
      const yaw = THREE.MathUtils ? THREE.MathUtils.degToRad(Number(preset.yaw_degrees) || 0) : (Number(preset.yaw_degrees) || 0) * Math.PI / 180;
      const pitch = THREE.MathUtils ? THREE.MathUtils.degToRad(Number(preset.pitch_degrees) || 0) : (Number(preset.pitch_degrees) || 0) * Math.PI / 180;
      const distance = String(preset.zoom || '').includes('whole') ? 3.65 : String(preset.zoom || '').includes('medium') ? 1.55 : 1.25;
      const cp = Math.cos(pitch), sp = Math.sin(pitch), sy = Math.sin(yaw), cy = Math.cos(yaw);
      camera.position.copy(target).add(new THREE.Vector3(sy * cp * distance, sp * distance, cy * cp * distance));
      camera.lookAt(target);
    } else {
      const cp = Math.cos(this.orbitPitch);
      const sp = Math.sin(this.orbitPitch);
      const sy = Math.sin(this.orbitYaw);
      const cy = Math.cos(this.orbitYaw);
      const offset = new THREE.Vector3(
        sy * cp * this.orbitDistance,
        sp * this.orbitDistance,
        cy * cp * this.orbitDistance
      );
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
    }
  };

  this.domElement.addEventListener('contextmenu', (event) => event.preventDefault(), false);
  this.domElement.addEventListener('pointerdown', this.onPointerDown, false);
  this.domElement.addEventListener('pointermove', this.onPointerMove, false);
  this.domElement.addEventListener('pointerup', this.finishPointer, false);
  this.domElement.addEventListener('pointercancel', this.finishPointer, false);
  this.domElement.addEventListener('lostpointercapture', () => {
    this.isDragging = false;
    this.activePointerId = null;
  }, false);
  this.clearInput = () => {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isDragging = false;
    this.activePointerId = null;
    shiftIsUp = true;
  };

  this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
  window.addEventListener('keydown', this.onKeyDown, false);
  window.addEventListener('keyup', this.onKeyUp, false);
  window.addEventListener('blur', this.clearInput, false);
  this.handleResize();
}

function viewerHealth() {
  return {
    ok: !!(renderer && catObject),
    catLoaded: !!catObject,
    physicsAvailable,
    webgl: !!renderer,
    threejs: !!window.THREE,
    fbxLoader: typeof window.FBXLoader === 'function',
    backendConnected,
    profileKey: VIEWER_PROFILE_KEY,
    cameraMode,
    behaviorState,
    dossierAction,
    movementProfile,
    correctionsEnabled,
    canonicalProtected: true,
    needsFree: true,
    canvasCount: viewer ? viewer.querySelectorAll('canvas').length : 0,
    controlsAttached: !!controls,
    position: catObject ? { x: catObject.position.x, y: catObject.position.y, z: catObject.position.z } : null
  };
}

window.ONYX_CAT_ONLY_API = {
  version: '2026-08-13-single-canvas-input-recovery',
  health: viewerHealth,
  setBehaviorState,
  triggerBehaviorEvent,
  setDossierAction,
  stopDossierAction,
  setCameraMode,
  setCameraPreset,
  setAnimationMode,
  setMovementProfile,
  checkBackend,
  resetCat,
  progression: PROGRESSION
};

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  // Undo the previous frame's procedural bone layer before controls/mixer evaluation. This
  // prevents idle, behavior and dossier poses from accumulating quaternion rotations forever.
  restoreAdditiveBoneFrame();

  if (controls) {
    controls.update(delta);
    chooseAutoAnimation();

    const gaitMoving = currentMovementMode === 'walk' || currentMovementMode === 'run' ||
      currentMovementMode === 'backward' || currentMovementMode === 'turn';
    let mixerDelta = 0;
    const autoShouldAdvance = animationMode === 'auto' && gaitMoving && jumpState.phase === 'grounded';
    const manualShouldAdvance = animationMode !== 'auto';
    if (!animationPaused && (autoShouldAdvance || manualShouldAdvance)) mixerDelta += delta * animationSpeed;
    if (animationStepSeconds > 0) {
      mixerDelta += animationStepSeconds;
      animationStepSeconds = 0;
    }
    // update(0) is intentional while idle: it re-evaluates the held FBX pose before we apply
    // this frame's non-destructive procedural layer.
    if (catMixer) catMixer.update(mixerDelta);
    captureAdditiveBoneFrame();

    const motionTime = performance.now() * 0.001;
    if (correctionsEnabled) {
      applyOnyxSecondaryMotion(motionTime, currentMovementMode);
      applyOnyxJumpPose();
      updateBehaviorState(delta);
      applyBehaviorPose(motionTime);
      applyDossierActionPose(motionTime);
      updateProfessorClipboard();
      applyEyeLife(motionTime);
      if (movementProfile === 'recovered') applyRecoveredBellySway(motionTime, currentMovementMode);
      else applyOnyxBellyDynamics(delta, currentMovementMode);
    }
  } else if (physicsAvailable && physicsWorld) {
    physicsWorld.stepSimulation(delta, 8);
  }
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (controls) controls.handleResize();
}
