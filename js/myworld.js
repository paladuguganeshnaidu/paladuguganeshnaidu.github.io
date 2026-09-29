import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js';

const host = document.getElementById('world-canvas');
const loading = document.getElementById('world-loading');
const selectedName = document.getElementById('world-selected-name');
const selectedCopy = document.getElementById('world-selected-copy');
const selectedMeta = document.getElementById('world-selected-meta');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 700px)').matches;

const logoAssets = [
  { name:'DeepSeek', file:'logos/Deepseek%20logo.jpg', group:'AI / GENAI' },
  { name:'Claude', file:'logos/claude.jpg', group:'AI / GENAI' },
  { name:'GitHub Copilot', file:'logos/copilot.png', group:'ENGINEERING' },
  { name:'Antigravity', file:'logos/Antigravity.jpg', group:'AI / TOOLS' },
  { name:'Nmap', file:'logos/nmap.jpg', group:'SECURITY' },
  { name:'Burp Suite', file:'logos/burpsuite.jpg', group:'SECURITY' },
  { name:'Kali Linux', file:'logos/kali.jpg', group:'SECURITY' },
  { name:'Metasploit', file:'logos/metasploit.jpg', group:'SECURITY' },
  { name:'Gobuster', file:'logos/Gobuster.jpg', group:'SECURITY' },
  { name:'FFUF', file:'logos/fuzz.jpg', group:'SECURITY' },
  { name:'Cisco C Essentials', file:'logos/certifications/cisco-c-essentials-1.png', group:'CREDENTIAL' },
  { name:'Cisco Ethical Hacker', file:'logos/certifications/cisco-ethical-hacker.png', group:'CREDENTIAL' },
  { name:'Cisco Intro to Cybersecurity', file:'logos/certifications/cisco-introduction-to-cybersecurity.png', group:'CREDENTIAL' },
  { name:'IBM Cybersecurity Fundamentals', file:'logos/certifications/ibm-cybersecurity-fundamentals.png', group:'CREDENTIAL' },
  { name:'ISC2 Candidate', file:'logos/certifications/isc2-candidate.png', group:'CREDENTIAL' },
  { name:'MongoDB CRUD Operations', file:'logos/certifications/mongodb-crud-operations.png', group:'CREDENTIAL' },
  { name:'Red Hat Python', file:'logos/certifications/redhat-python-programming.png', group:'CREDENTIAL' },
  { name:'Red Hat Linux', file:'logos/certifications/redhat-getting-started-linux.png', group:'CREDENTIAL' }
];

const facePalette = {
  'AI / GENAI':'#eee9ff',
  'AI / TOOLS':'#f1edff',
  ENGINEERING:'#e9f4ff',
  SECURITY:'#e8f7f1',
  CREDENTIAL:'#fff0e7'
};

const worldCopy = {
  'AI / GENAI':'Models, local inference and GenAI workflows.',
  'AI / TOOLS':'The experimental tools I use while building.',
  ENGINEERING:'Software engineering, APIs and developer workflow.',
  SECURITY:'Security tooling, recon and offensive-security practice.',
  CREDENTIAL:'Public learning and certification records.'
};

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: !mobile,
    alpha: false,
    powerPreference: 'high-performance'
  });
} catch (error) {
  host.innerHTML = '<div class="world-fallback">WebGL is unavailable on this device. <a href="work.html">Open the standard portfolio</a>.</div>';
  throw error;
}

const maxPixelRatio = mobile ? 1.15 : 1.45;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
renderer.setSize(host.clientWidth, host.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.setClearColor(0x08090d, 1);
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x08090d, mobile ? 0.032 : 0.024);

const camera = new THREE.PerspectiveCamera(
  mobile ? 48 : 44,
  Math.max(.1, host.clientWidth / Math.max(1, host.clientHeight)),
  .1,
  100
);
camera.position.set(0, 0, mobile ? 16.8 : 13.8);

const world = new THREE.Group();
world.rotation.set(-0.05, 0.18, 0);
scene.add(world);

// Light only: no background geometry, so the world remains a cube-only installation.
scene.add(new THREE.HemisphereLight(0xe7e3ff, 0x10151a, 2.2));

const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(5, 8, 9);
scene.add(key);

const lavender = new THREE.PointLight(0x8f7cf6, 22, 30, 2);
lavender.position.set(-7, 3, 5);
scene.add(lavender);

const mint = new THREE.PointLight(0x73c7b3, 18, 28, 2);
mint.position.set(8, -4, 3);
scene.add(mint);

const peach = new THREE.PointLight(0xf2b89e, 8, 22, 2);
peach.position.set(0, 7, -6);
scene.add(peach);

// 50 cubes = 5 columns × 5 rows × 2 depth layers.
const CUBE_COUNT = 50;
const COLS = 5;
const ROWS = 5;
const LAYERS = 2;
const cubeSize = mobile ? 1.02 : 1.18;
const gap = mobile ? 0.25 : 0.30;
const step = cubeSize + gap;
const cubeGroup = new THREE.Group();
world.add(cubeGroup);

const loader = new THREE.ImageLoader();
const textureCache = new Map();
const materialCache = new Map();
const cubeMeshes = [];

function canvasTextureFor(asset, image) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = facePalette[asset.group] || '#f2f2f5';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255,255,255,.42)';
  ctx.fillRect(10, 10, size - 20, size - 20);

  const maxW = 196;
  const maxH = 170;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  const x = (size - w) / 2;
  const y = 24 + (maxH - h) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(28, 20, size - 56, 178, 18);
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(28, 20, size - 56, 178);
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();

  ctx.fillStyle = 'rgba(25,27,32,.78)';
  ctx.font = '600 13px Inter,Arial,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(asset.name, size / 2, 226);

  ctx.fillStyle = 'rgba(25,27,32,.42)';
  ctx.font = '500 8px JetBrains Mono,monospace';
  ctx.fillText(asset.group, size / 2, 242);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
  texture.needsUpdate = true;
  return texture;
}

function fallbackTexture(asset) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = facePalette[asset.group] || '#eeeeee';
  ctx.fillRect(0,0,256,256);
  ctx.fillStyle = '#202124';
  ctx.font = '700 27px Inter,Arial,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(asset.name, 128, 118);
  ctx.font = '600 10px JetBrains Mono,monospace';
  ctx.fillText(asset.group, 128, 151);
  return new THREE.CanvasTexture(canvas);
}

function loadFaceTexture(asset) {
  if (textureCache.has(asset.file)) return Promise.resolve(textureCache.get(asset.file));

  return new Promise(resolve => {
    loader.load(
      asset.file,
      image => {
        const texture = canvasTextureFor(asset, image);
        textureCache.set(asset.file, texture);
        resolve(texture);
      },
      undefined,
      () => {
        const texture = fallbackTexture(asset);
        textureCache.set(asset.file, texture);
        resolve(texture);
      }
    );
  });
}

function materialFor(asset) {
  const key = asset.file;
  if (materialCache.has(key)) return materialCache.get(key);
  const placeholder = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: .26,
    metalness: .08
  });
  materialCache.set(key, placeholder);
  return placeholder;
}

const textures = await Promise.all(logoAssets.map(loadFaceTexture));

logoAssets.forEach((asset, index) => {
  materialCache.set(asset.file, new THREE.MeshStandardMaterial({
    map: textures[index],
    color: 0xffffff,
    roughness: .28,
    metalness: .06
  }));
});

function faceMaterialForCube(cubeIndex, faceIndex) {
  const assetIndex = (cubeIndex * 5 + faceIndex * 3 + Math.floor(cubeIndex / 5)) % logoAssets.length;
  return materialFor(logoAssets[assetIndex]);
}

function createCube(index) {
  const layerIndex = Math.floor(index / 25);
  const localIndex = index % 25;
  const row = Math.floor(localIndex / COLS);
  const col = localIndex % COLS;

  const x = (col - 2) * step + (layerIndex ? 0.12 : -0.12);
  const y = (2 - row) * step + (layerIndex ? -0.10 : 0.10);
  const z = (layerIndex - 0.5) * (cubeSize + 0.72);

  const group = new THREE.Group();
  group.position.set(x, y, z);

  const materials = [];
  for (let face = 0; face < 6; face++) {
    materials.push(faceMaterialForCube(index, face));
  }

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
    materials
  );

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({
      color: 0x171923,
      transparent: true,
      opacity: .46
    })
  );

  group.add(mesh);
  group.add(edge);

  group.userData = {
    index,
    base: new THREE.Vector3(x, y, z),
    hover: 0,
    spin: (index % 7) * .14,
    seed: index * 0.73,
    category: logoAssets[(index * 5) % logoAssets.length].group
  };

  cubeGroup.add(group);
  cubeMeshes.push(group);
}

for (let i = 0; i < CUBE_COUNT; i++) {
  createCube(i);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .065;
controls.enablePan = false;
controls.enableZoom = true;
controls.minDistance = mobile ? 12 : 9;
controls.maxDistance = mobile ? 24 : 22;
controls.rotateSpeed = mobile ? .42 : .56;
controls.zoomSpeed = .75;
controls.target.set(0, 0, 0);
controls.saveState();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(99, 99);
let hovered = null;

function setPointer(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
}

function updateInspector(cube) {
  if (!cube) {
    selectedName.textContent = 'MY WORLD';
    selectedCopy.textContent = 'AI systems, security, engineering and the credentials behind the work.';
    selectedMeta.textContent = '50 CUBES · 6 LOGO FACES EACH';
    return;
  }

  const idx = cube.userData.index;
  const heroAsset = logoAssets[(idx * 5) % logoAssets.length];
  selectedName.textContent = heroAsset.name;
  selectedCopy.textContent = worldCopy[heroAsset.group] || 'A part of the engineering stack behind the work.';
  selectedMeta.textContent = heroAsset.group + ' · CUBE ' + String(idx + 1).padStart(2, '0');
}

function updateHover() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(cubeMeshes, true);

  let next = null;
  if (hits.length) {
    let object = hits[0].object;
    while (object && !object.userData?.index && object.parent) {
      object = object.parent;
    }
    next = object?.userData?.index !== undefined ? object : null;
  }

  if (next !== hovered) {
    hovered = next;
    updateInspector(hovered);
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
  }
}

renderer.domElement.addEventListener('pointermove', event => {
  setPointer(event.clientX, event.clientY);
  if (!event.isPrimary) return;
  updateHover();
}, { passive: true });

renderer.domElement.addEventListener('pointerleave', () => {
  pointer.set(99, 99);
  hovered = null;
  updateInspector(null);
}, { passive: true });

renderer.domElement.addEventListener('dblclick', () => {
  controls.reset();
}, { passive: true });

const pointerTarget = new THREE.Vector2();
const pointerSmooth = new THREE.Vector2();

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  pointerSmooth.lerp(pointerTarget.copy(pointer), .12);
  if (!reduceMotion) {
    cubeGroup.rotation.y += 0.00045;
    cubeGroup.rotation.x = Math.sin(elapsed * .18) * .012;
  }

  cubeMeshes.forEach(cube => {
    const data = cube.userData;

    const worldPos = cube.position.clone();
    const screenPoint = worldPos.project(camera);

    const dx = pointerSmooth.x - screenPoint.x;
    const dy = pointerSmooth.y - screenPoint.y;
    const distance = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - distance / 0.85);

    data.hover += ((hovered === cube ? 1 : 0) - data.hover) * .10;

    const hoverLift = data.hover * .15;
    const float = reduceMotion ? 0 : Math.sin(elapsed * .7 + data.seed) * .018;
    const magneticX = reduceMotion ? 0 : dx * influence * .07;
    const magneticY = reduceMotion ? 0 : dy * influence * .07;

    cube.position.x = data.base.x + magneticX;
    cube.position.y = data.base.y - magneticY + hoverLift + float;
    cube.position.z = data.base.z + influence * .16;

    const targetScale = 1 + data.hover * .075;
    const scaleNow = cube.scale.x + (targetScale - cube.scale.x) * .10;
    cube.scale.setScalar(scaleNow);

    if (!reduceMotion) {
      cube.rotation.x += 0.00045 + data.spin * .00002;
      cube.rotation.y += 0.00062 + data.spin * .00003;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

function resize() {
  const width = host.clientWidth;
  const height = host.clientHeight;

  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize, { passive: true });
resize();

document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : animate);
});

updateInspector(null);
loading?.classList.add('hidden');
renderer.setAnimationLoop(animate);
