import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js';

const host = document.getElementById('world-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 700px)').matches;

const assets = [
  {file:'logos/Deepseek%20logo.jpg', group:'AI'},
  {file:'logos/claude.jpg', group:'AI'},
  {file:'logos/copilot.png', group:'DEV'},
  {file:'logos/Antigravity.jpg', group:'AI'},
  {file:'logos/nmap.jpg', group:'SEC'},
  {file:'logos/burpsuite.jpg', group:'SEC'},
  {file:'logos/kali.jpg', group:'SEC'},
  {file:'logos/metasploit.jpg', group:'SEC'},
  {file:'logos/Gobuster.jpg', group:'SEC'},
  {file:'logos/fuzz.jpg', group:'SEC'},
  {file:'logos/certifications/cisco-c-essentials-1.png', group:'CRED'},
  {file:'logos/certifications/cisco-ethical-hacker.png', group:'CRED'},
  {file:'logos/certifications/cisco-introduction-to-cybersecurity.png', group:'CRED'},
  {file:'logos/certifications/ibm-cybersecurity-fundamentals.png', group:'CRED'},
  {file:'logos/certifications/isc2-candidate.png', group:'CRED'},
  {file:'logos/certifications/mongodb-crud-operations.png', group:'CRED'},
  {file:'logos/certifications/redhat-python-programming.png', group:'CRED'},
  {file:'logos/certifications/redhat-getting-started-linux.png', group:'CRED'}
];

const faceBg = {AI:'#efebff',DEV:'#eaf5ff',SEC:'#e8f6f0',CRED:'#fff0e7'};
const cubeCount = 50;
const textureLoader = new THREE.ImageLoader();
const textureCache = new Map();
const materialCache = new Map();

const renderer = new THREE.WebGLRenderer({
  antialias: !mobile,
  alpha: false,
  powerPreference: 'high-performance'
});

const pixelRatio = mobile ? 1.1 : 1.4;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatio));
renderer.setSize(host.clientWidth, host.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setClearColor(0x07080c, 1);
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07080c, mobile ? .018 : .014);

const camera = new THREE.PerspectiveCamera(
  mobile ? 46 : 42,
  host.clientWidth / Math.max(1, host.clientHeight),
  .1,
  120
);
camera.position.set(0, 0, mobile ? 22 : 18);

scene.add(new THREE.HemisphereLight(0xebe8ff, 0x0d1115, 2.2));

const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(5, 8, 9);
scene.add(key);

const lilac = new THREE.PointLight(0x8f7cf6, 26, 34, 2);
lilac.position.set(-8, 4, 6);
scene.add(lilac);

const mint = new THREE.PointLight(0x73c7b3, 18, 30, 2);
mint.position.set(8, -5, 3);
scene.add(mint);

const peach = new THREE.PointLight(0xf2b89e, 10, 24, 2);
peach.position.set(0, 8, -8);
scene.add(peach);

const field = new THREE.Group();
scene.add(field);

const cubeSize = mobile ? .78 : .94;
const gapX = mobile ? .48 : .62;
const gapY = mobile ? .34 : .46;
const width = (cubeSize + gapX) * 9;
const height = (cubeSize + gapY) * 4;

const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry);
const cubes = [];

function seeded(index) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function makeFaceTexture(asset, image) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = faceBg[asset.group] || '#f2f2f2';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255,255,255,.74)';
  ctx.fillRect(9, 9, size - 18, size - 18);

  const max = 196;
  const scale = Math.min(max / image.width, max / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(22, 22, size - 44, size - 44, 18);
  ctx.clip();
  ctx.fillStyle = '#fff';
  ctx.fillRect(22, 22, size - 44, size - 44);
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
  return texture;
}

function fallbackTexture(asset) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = faceBg[asset.group] || '#eeeeee';
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function materialFor(index) {
  if (materialCache.has(index)) return materialCache.get(index);

  const asset = assets[index];
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: .3,
    metalness: .08
  });

  material.userData.assetIndex = index;
  materialCache.set(index, material);
  return material;
}

function applyTexture(index, texture) {
  const material = materialFor(index);
  material.map = texture;
  material.needsUpdate = true;
}

function loadAsset(index) {
  const asset = assets[index];
  if (textureCache.has(asset.file)) {
    applyTexture(index, textureCache.get(asset.file));
    return;
  }

  textureLoader.load(
    asset.file,
    image => {
      const texture = makeFaceTexture(asset, image);
      textureCache.set(asset.file, texture);
      applyTexture(index, texture);
    },
    undefined,
    () => {
      const texture = fallbackTexture(asset);
      textureCache.set(asset.file, texture);
      applyTexture(index, texture);
    }
  );
}

for (let i = 0; i < cubeCount; i++) {
  const col = i % 10;
  const row = Math.floor(i / 10);

  const baseX = (col - 4.5) * (cubeSize + gapX);
  const baseY = (2 - row) * (cubeSize + gapY);
  const baseZ = (seeded(i + 91) - .5) * (mobile ? 9.5 : 13.5);

  const cube = new THREE.Mesh(
    cubeGeometry,
    Array.from({length: 6}, (_, face) => materialFor((i * 5 + face * 2 + Math.floor(i / 7)) % assets.length))
  );

  cube.position.set(
    baseX + (seeded(i + 10) - .5) * .42,
    baseY + (seeded(i + 20) - .5) * .38,
    baseZ
  );

  cube.rotation.set(
    seeded(i + 30) * Math.PI,
    seeded(i + 40) * Math.PI,
    seeded(i + 50) * Math.PI
  );

  cube.userData = {
    base: cube.position.clone(),
    homeRotation: cube.rotation.clone(),
    seed: i * .73,
    phaseX: seeded(i + 60) * Math.PI * 2,
    phaseY: seeded(i + 70) * Math.PI * 2,
    phaseZ: seeded(i + 80) * Math.PI * 2,
    driftX: .06 + seeded(i + 90) * .08,
    driftY: .05 + seeded(i + 100) * .075,
    driftZ: .045 + seeded(i + 110) * .065,
    hover: 0,
    index: i
  };

  field.add(cube);

  const edge = new THREE.LineSegments(
    edgeGeometry,
    new THREE.LineBasicMaterial({
      color: 0x11131a,
      transparent: true,
      opacity: .34
    })
  );
  cube.add(edge);

  cubes.push(cube);
}

for (let index = 0; index < assets.length; index++) {
  loadAsset(index);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .05;
controls.enablePan = false;
controls.enableZoom = true;
controls.rotateSpeed = mobile ? .38 : .50;
controls.zoomSpeed = .62;
controls.minDistance = mobile ? 14 : 11;
controls.maxDistance = mobile ? 34 : 32;
controls.target.set(0, 0, 0);

const pointer = new THREE.Vector2(99, 99);
const smoothPointer = new THREE.Vector2(99, 99);
const raycaster = new THREE.Raycaster();
const projected = new THREE.Vector3();
let hovered = null;

function setPointer(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
}

function findCube(intersections) {
  if (!intersections.length) return null;
  let object = intersections[0].object;
  while (object && object.userData.index === undefined && object.parent) {
    object = object.parent;
  }
  return object?.userData.index !== undefined ? object : null;
}

function updateHover() {
  raycaster.setFromCamera(pointer, camera);
  const hit = findCube(raycaster.intersectObjects(cubes, true));

  if (hit === hovered) return;

  hovered = hit;
  renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
}

renderer.domElement.addEventListener('pointermove', event => {
  setPointer(event.clientX, event.clientY);
  updateHover();
}, {passive: true});

renderer.domElement.addEventListener('pointerleave', () => {
  pointer.set(99, 99);
  hovered = null;
  renderer.domElement.style.cursor = 'grab';
}, {passive: true});

renderer.domElement.addEventListener('dblclick', () => {
  controls.reset();
}, {passive: true});

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  smoothPointer.lerp(pointer, .09);
  controls.update();

  if (!reduceMotion) {
    field.rotation.y = Math.sin(elapsed * .055) * .055;
    field.rotation.x = Math.cos(elapsed * .047) * .035;
  }

  for (const cube of cubes) {
    const data = cube.userData;

    if (!reduceMotion) {
      cube.position.x = data.base.x + Math.sin(elapsed * data.driftX + data.phaseX) * .95;
      cube.position.y = data.base.y + Math.cos(elapsed * data.driftY + data.phaseY) * .72;
      cube.position.z = data.base.z + Math.sin(elapsed * data.driftZ + data.phaseZ) * .82;

      cube.rotation.x = data.homeRotation.x + Math.sin(elapsed * .22 + data.phaseX) * .20;
      cube.rotation.y = data.homeRotation.y + Math.cos(elapsed * .19 + data.phaseY) * .24;
      cube.rotation.z = data.homeRotation.z + Math.sin(elapsed * .17 + data.phaseZ) * .15;
    }

    projected.copy(cube.position).project(camera);

    const dx = smoothPointer.x - projected.x;
    const dy = smoothPointer.y - projected.y;
    const distance = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - distance / .72);

    data.hover += ((hovered === cube ? 1 : 0) - data.hover) * .11;

    const magnetic = influence * (reduceMotion ? 0 : .12);
    cube.position.x += dx * magnetic;
    cube.position.y -= dy * magnetic;
    cube.position.z += influence * (reduceMotion ? 0 : .25);

    const targetScale = 1 + data.hover * .08;
    const nextScale = cube.scale.x + (targetScale - cube.scale.x) * .10;
    cube.scale.setScalar(nextScale);
  }

  renderer.render(scene, camera);
}

function resize() {
  const width = host.clientWidth;
  const height = host.clientHeight;

  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatio));
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize, {passive: true});
resize();

document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : animate);
});

renderer.setAnimationLoop(animate);
