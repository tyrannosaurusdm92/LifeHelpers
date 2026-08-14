var THREE = { AnimationMixer, BoxBufferGeometry, CatmullRomCurve3, Clock, Color, DirectionalLight, DoubleSide, Euler, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PointLight, Quaternion, Scene, Shape, ShapeBufferGeometry, SphereBufferGeometry, TextureLoader, TubeBufferGeometry, Vector3, WebGLRenderer, sRGBEncoding };

// This viewer intentionally follows SmellyCat's original cat-loading and movement approach:
// FBXLoader -> external skin texture replacement -> embedded animation index 5 ->
// Ammo btBoxShape rigid body -> ThirdPersonControls-style velocity/turning/camera update.

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

const viewer = document.getElementById('viewer');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');

let scene, renderer, camera, clock;
let physicsWorld, transformAux1;
const rigidBodies = [];
let controls = null;
let catMixer = null;
let catObject = null;
let onyxBones = null;
let onyxBelly = null;
let measurementGuides = null;
let measurementsVisible = true;
let rotay = 2;
let space = false;
let shiftIsUp = true;
let idle = true;
let stillJumping = 0;
const gravityConstant = -9.8;
const tmpPos = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

function fail(error) {
  console.error(error);
  statusEl.textContent = 'Could not load Onyx.';
  errorEl.style.display = 'block';
  errorEl.textContent = `Onyx viewer error:\n\n${error?.stack || error}`;
}

if (typeof window.Ammo !== 'function') {
  fail(new Error('Ammo.js did not load.'));
} else {
  window.Ammo().then((AmmoLib) => {
    window.Ammo = AmmoLib;
    init();
    animate();
  }).catch(fail);
}

function init() {
  initScene();
  initRenderer();
  initPhysics();
  createBlankRoom();
  loadCat(MODEL);
  window.addEventListener('resize', onResize, false);
  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyR') resetCat();
    if (event.code === 'KeyM') toggleMeasurementGuides();
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
  const Ammo = window.Ammo;
  const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz), material);
  mesh.name = name;
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  tmpPos.set(x, y, z);
  tmpQuat.set(0, 0, 0, 1);
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

function applyOnyxMorphology(catMesh) {
  const geometry = catMesh.geometry;
  const position = geometry && geometry.attributes && geometry.attributes.position;
  if (!position) return;

  const bones = catMesh.skeleton ? catMesh.skeleton.bones : [];
  const boneIndex = (name) => bones.findIndex((bone) => bone.name === name);
  const noseBoneIndex = boneIndex('Nose');
  const mouthBoneIndex = boneIndex('Mouth');
  const headBoneIndex = boneIndex('Head');

  // This pass separates Onyx's "muscle" from his "weight", similar to the useful idea
  // behind pet body sculpting systems: strong forequarters do NOT require a pinched waist,
  // and a low primordial pouch should add lower-abdominal mass rather than lengthening legs.
  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i);
    let y = position.getY(i); // longitudinal axis: head negative, rear/tail positive
    let z = position.getZ(i); // vertical axis in bind mesh

    const noseW = getSkinInfluence(catMesh, i, noseBoneIndex);
    const mouthW = getSkinInfluence(catMesh, i, mouthBoneIndex);
    const headW = getSkinInfluence(catMesh, i, headBoneIndex);

    // Wide shoulders and a broad-ish chest, but still close-coated rather than fluffy.
    const shoulderY = smoothBell(y, -1.55, 1.45);
    const shoulderZ = smoothBell(z, 1.75, 1.30);
    const shoulder = shoulderY * shoulderZ;
    x *= 1 + 0.125 * shoulder;

    const chestY = smoothBell(y, -1.35, 1.15);
    const chestZ = smoothBell(z, 0.82, 0.92);
    const chest = chestY * chestZ;
    x *= 1 + 0.080 * chest;
    z -= 0.080 * chest;

    // THE TUM. The earlier pass over-selected low leg vertices because its vertical mask
    // rewarded everything below the belly. This is now a true abdominal BAND centered on
    // the underside of the torso. It hangs down, widens, and drifts slightly rearward.
    const bellyY = smoothBell(y, 0.62, 1.42);
    const bellyZ = smoothBell(z, 0.66, 0.66); // targets actual underside ~0.0-1.3, not legs
    const bellySide = clamp01((1.28 - Math.abs(x)) / 0.80);
    const pouch = bellyY * bellyZ * (0.72 + 0.28 * bellySide);
    z -= 0.58 * pouch;
    x *= 1 + 0.105 * pouch;
    y += 0.055 * pouch;

    // Add a little mid-body substance. Do NOT carve the waist down again.
    const torsoMass = smoothBell(y, 0.15, 2.15) * smoothBell(z, 1.42, 1.35);
    x *= 1 + 0.025 * torsoMass;

    // Slightly broader tom-cat skull without making the entire face spherical.
    const headShape = headW * clamp01((z - 2.00) / 1.55);
    x *= 1 + 0.048 * headShape;

    // Whisker pads / muzzle: Onyx's real face has substantial rounded pads around a much
    // smaller black nose. Use the actual Mouth/Nose skin weights instead of a coarse box.
    const muzzlePads = Math.max(mouthW, noseW * 0.62) * smoothBell(z, 2.34, 0.55);
    x *= 1 + 0.105 * muzzlePads;

    // Protrude the nose bridge/tip slightly, but narrow the very tip so it reads feline
    // rather than as a broad dog snout. Head points toward negative Y in this mesh.
    if (noseW > 0) {
      const tip = noseW * clamp01((-4.12 - y) / 0.72) * smoothBell(z, 2.68, 0.58);
      y -= 0.105 * tip;
      x *= 1 - 0.050 * tip;
      z += 0.020 * tip;
    }

    // Give the lower muzzle/chin its own mass and a visible mouth shelf.
    if (mouthW > 0) {
      const chin = mouthW * smoothBell(z, 2.20, 0.38);
      y -= 0.050 * chin;
      z -= 0.065 * chin;
      x *= 1 + 0.045 * chin;
    }

    position.setXYZ(i, x, y, z);
  }

  position.needsUpdate = true;
  if (geometry.computeVertexNormals) geometry.computeVertexNormals();
  if (geometry.attributes.normal) geometry.attributes.normal.needsUpdate = true;
  if (geometry.computeBoundingBox) geometry.computeBoundingBox();
  if (geometry.computeBoundingSphere) geometry.computeBoundingSphere();
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
  nosePad.scale.set(0.92, 0.92, 0.92);
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
  ], 'Onyx philtrum', 0.008);
  makeMouthCurve([
    new THREE.Vector3(0, 0.448, -0.045),
    new THREE.Vector3(-0.085, 0.455, -0.095),
    new THREE.Vector3(-0.190, 0.435, -0.115),
    new THREE.Vector3(-0.305, 0.390, -0.060)
  ], 'Onyx left mouth crease', 0.009);
  makeMouthCurve([
    new THREE.Vector3(0, 0.448, -0.045),
    new THREE.Vector3(0.085, 0.455, -0.095),
    new THREE.Vector3(0.190, 0.435, -0.115),
    new THREE.Vector3(0.305, 0.390, -0.060)
  ], 'Onyx right mouth crease', 0.009);
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
  const roots = [-0.28, -0.19, -0.10, -0.015, 0.075, 0.165, 0.25];
  const lengths = [1.25, 1.42, 1.58, 1.68, 1.62, 1.48, 1.30];
  const curls = [-0.20, -0.15, -0.08, 0.00, 0.08, 0.17, 0.24];

  [-1, 1].forEach((side) => {
    roots.forEach((rootZ, index) => {
      const length = lengths[index];
      const curl = curls[index];
      const asym = side < 0 ? (index % 2 ? -0.025 : 0.015) : (index % 2 ? 0.020 : -0.010);
      const rootX = side * (0.17 + index * 0.012);
      const points = [
        new THREE.Vector3(rootX, 0.405, rootZ * 0.54),
        new THREE.Vector3(side * 0.42, 0.55, rootZ * 0.78 - 0.015),
        new THREE.Vector3(side * 0.78, 0.72, rootZ + curl * 0.18),
        new THREE.Vector3(side * 1.12, 0.86, rootZ * 1.18 + curl * 0.58 + asym),
        new THREE.Vector3(side * length, 0.96 + 0.04 * index, rootZ * 1.34 + curl + asym)
      ];
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.47);
      const tube = new THREE.TubeBufferGeometry(curve, 14, 0.0085, 5, false);
      const material = (index === 0 && side < 0) || (index === 6 && side > 0) ? dark : (index === 1 ? pale : white);
      const whisker = new THREE.Mesh(tube, material);
      whisker.name = `${side < 0 ? 'L' : 'R'} curved whisker ${index + 1}`;
      whisker.frustumCulled = false;
      whiskerGroup.add(whisker);
    });
  });

  noseBone.add(whiskerGroup);
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
  return { mesh: catMesh, vertices };
}

function applyOnyxBellySway(timeSeconds, moving) {
  if (!onyxBelly || !onyxBelly.mesh || !onyxBelly.vertices.length) return;
  const position = onyxBelly.mesh.geometry.attributes.position;
  if (!position) return;
  const sway = moving ? Math.sin(timeSeconds * 5.15 + 0.55) : 0;
  const counter = moving ? Math.sin(timeSeconds * 10.30 + 1.4) : 0;
  const foreAft = moving ? Math.sin(timeSeconds * 5.15 - 0.75) : 0;
  onyxBelly.vertices.forEach((v) => {
    // A low pouch lags behind the torso: more lateral sway at the lowest/central vertices,
    // a tiny fore-aft lag, and almost no vertical bounce. It is intentionally soft rather
    // than gelatinous; Fancy Feast may be dramatic, physics still gets standards.
    const x = v.x + sway * 0.072 * v.w + counter * 0.012 * v.w;
    const y = v.y + foreAft * 0.026 * v.w;
    const z = v.z - Math.abs(counter) * 0.010 * v.w;
    position.setXYZ(v.i, x, y, z);
  });
  position.needsUpdate = true;
}

function captureOnyxBones(catMesh) {
  if (!catMesh || !catMesh.skeleton) return null;
  const byName = {};
  catMesh.skeleton.bones.forEach((bone) => { if (!byName[bone.name]) byName[bone.name] = bone; });
  return {
    spine2: byName.Spine002 || null,
    spine3: byName.Spine003 || null,
    tail: byName.Tail || null,
    tail1: byName.Tail001 || null
  };
}

function applyOnyxSecondaryMotion(timeSeconds, moving) {
  if (!onyxBones || !moving) return;
  const gait = timeSeconds * 7.0;
  const q = new THREE.Quaternion();

  // Small spinal counter-motion keeps the walk feline instead of rigid. The amplitude is
  // deliberately restrained because the embedded FBX already contains the primary gait.
  if (onyxBones.spine2) {
    q.setFromEuler(new THREE.Euler(0, 0, Math.sin(gait) * 0.018));
    onyxBones.spine2.quaternion.multiply(q);
  }
  if (onyxBones.spine3) {
    q.setFromEuler(new THREE.Euler(0, 0, Math.sin(gait + Math.PI) * 0.014));
    onyxBones.spine3.quaternion.multiply(q);
  }
  if (onyxBones.tail) {
    q.setFromEuler(new THREE.Euler(0, 0, Math.sin(timeSeconds * 3.1) * 0.035));
    onyxBones.tail.quaternion.multiply(q);
  }
  if (onyxBones.tail1) {
    q.setFromEuler(new THREE.Euler(0, 0, Math.sin(timeSeconds * 3.1 + 0.55) * 0.025));
    onyxBones.tail1.quaternion.multiply(q);
  }
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
        // The original eye spheres sit too far back inside the facial shell. Bring them
        // forward a fraction of their radius and enlarge them slightly, preserving the
        // green-yellow iris while avoiding a cartoonishly huge eye.
        object.position.z += 4.2;
        object.position.x *= 1.012;
        object.scale.x *= 1.105;
        object.scale.y *= 1.070;
        object.scale.z *= 1.085;
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
    const clip = gltf.animations[model.animationName];
    if (!clip) throw new Error(`Expected embedded animation index ${model.animationName}, but it was not found.`);
    const action = mixer.clipAction(clip);
    action.play();
    catMixer = mixer;

    // Physics is calibrated in SI units too: 27 lb = ~12.25 kg. The collision
    // box follows Onyx's real BODY dimensions; the tail is intentionally excluded.
    const catMass = ONYX_REAL.weightKg;
    const catShape = new Ammo.btBoxShape(new Ammo.btVector3(
      (ONYX_REAL.chestWidthIn * INCH_M) * 0.5,
      0.225, // calibrated FBX root -> paw-floor offset at MODEL.scale ~= 0.223 m
      (ONYX_REAL.noseToTailBaseIn * INCH_M) * 0.5
    ));
    catShape.setMargin(0.01);
    gltf.name = 'thecat';
    const body = createRigidBody(gltf, catShape, catMass, gltf.position, gltf.quaternion, true);
    body.setFriction(0.5);

    catObject = gltf;
    controls = new ThirdPersonControls(gltf, renderer.domElement);
    statusEl.textContent = `Onyx loaded at real scale · ~${ONYX_REAL.normalOverallIn} in normal overall length · ${ROOM_REAL.widthFt} × ${ROOM_REAL.depthFt} × ${ROOM_REAL.heightFt} ft calibration room · animation: ${clip.name || 'index 5'}`;
  } catch (error) {
    fail(error);
  }
}

function resetCat() {
  if (!catObject || !catObject.userData.physicsBody) return;
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
  rotay = 2;
  if (controls && controls.resetCamera) controls.resetCamera();
}

function ThirdPersonControls(object, domElement) {
  this.object = object;
  this.domElement = domElement;
  this.movementSpeed = 25;
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
    this.orbitDistance *= Math.exp(event.deltaY * this.zoomSpeed);
    this.orbitDistance = Math.max(this.minOrbitDistance, Math.min(this.maxOrbitDistance, this.orbitDistance));
  };

  this.onKeyDown = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': this.moveForward = true; break;
      case 'ArrowLeft':
      case 'KeyA': this.moveRight = true; break;
      case 'ArrowDown':
      case 'KeyS': this.moveBackward = true; break;
      case 'ArrowRight':
      case 'KeyD': this.moveLeft = true; break;
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
    let actualMoveSpeed = delta * this.movementSpeed;
    if (!shiftIsUp) actualMoveSpeed = delta * this.movementSpeed * 1.5;

    let velox = 0;
    let veloz = 0;

    if (this.moveLeft) {
      idle = false;
      rotay -= 0.1;
    } else if (this.moveRight) {
      idle = false;
      rotay += 0.1;
    } else {
      idle = true;
    }

    if (this.moveBackward) {
      idle = false;
      veloz = -actualMoveSpeed * Math.cos(rotay) / 2.2;
      velox = -actualMoveSpeed * Math.sin(rotay) / 2.2;
    } else if (this.moveForward) {
      idle = false;
      veloz = actualMoveSpeed * Math.cos(rotay) / 2.2;
      velox = actualMoveSpeed * Math.sin(rotay) / 2.2;
    } else if (!this.moveLeft && !this.moveRight) {
      idle = true;
    }

    const body = this.object.userData.physicsBody;
    body.setLinearVelocity(new Ammo.btVector3(velox, 0, veloz));

    if (space) {
      if (stillJumping === 0) {
        stillJumping = 21;
        body.setLinearVelocity(new Ammo.btVector3(velox, 10, veloz));
      }
      space = false;
    }
    if (stillJumping !== 0) {
      stillJumping -= 1;
      if (stillJumping < 3) stillJumping = 0;
    }

    physicsWorld.stepSimulation(delta * 2.5, 10);

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

    this.object.rotation.y = rotay;

    const target = new THREE.Vector3(
      this.object.position.x,
      this.object.position.y + (ONYX_REAL.shoulderHeightIn * INCH_M) * 0.72,
      this.object.position.z
    );
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
  this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
  window.addEventListener('keydown', this.onKeyDown, false);
  window.addEventListener('keyup', this.onKeyUp, false);
  this.handleResize();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (controls) {
    // Original game advances the embedded Walk mixer only when not idle.
    const moving = !idle;
    if (moving && catMixer) catMixer.update(delta);
    const motionTime = performance.now() * 0.001;
    if (moving) applyOnyxSecondaryMotion(motionTime, true);
    applyOnyxBellySway(motionTime, moving);
    controls.update(delta);
  } else if (physicsWorld) {
    physicsWorld.stepSimulation(delta * 2.5, 10);
  }
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (controls) controls.handleResize();
}
