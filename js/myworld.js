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

function makeFaceTexture(asset, image){
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = faceBg[asset.group] || '#f2f2f2';
  ctx.fillRect(0,0,size,size);

  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.fillRect(10,10,size-20,size-20);

  const max = 196;
  const scale = Math.min(max/image.width, max/image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  const x = (size-w)/2;
  const y = (size-h)/2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(22,22,size-44,size-44,18);
  ctx.clip();
  ctx.fillStyle = '#fff';
  ctx.fillRect(22,22,size-44,size-44);
  ctx.drawImage(image,x,y,w,h);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),4);
  return tex;
}

function fallbackTexture(asset){
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = faceBg[asset.group] || '#eeeeee';
  ctx.fillRect(0,0,256,256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function getTexture(asset){
  if(textureCache.has(asset.file)) return Promise.resolve(textureCache.get(asset.file));
  return new Promise(resolve=>{
    textureLoader.load(
      asset.file,
      image=>{
        const tex = makeFaceTexture(asset,image);
        textureCache.set(asset.file,tex);
        resolve(tex);
      },
      undefined,
      ()=>{
        const tex = fallbackTexture(asset);
        textureCache.set(asset.file,tex);
        resolve(tex);
      }
    );
  });
}

const textures = await Promise.all(assets.map(getTexture));

const renderer = new THREE.WebGLRenderer({
  antialias:!mobile,
  alpha:false,
  powerPreference:'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,mobile ? 1.1 : 1.4));
renderer.setSize(host.clientWidth,host.clientHeight,false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x07080c,1);
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07080c,mobile ? .018 : .014);

const camera = new THREE.PerspectiveCamera(
  mobile ? 46 : 42,
  host.clientWidth/Math.max(1,host.clientHeight),
  .1,
  120
);
camera.position.set(0,0,mobile ? 22 : 18);

scene.add(new THREE.HemisphereLight(0xebe8ff,0x0d1115,2.2));

const key = new THREE.DirectionalLight(0xffffff,2.6);
key.position.set(5,8,9);
scene.add(key);

const lilac = new THREE.PointLight(0x8f7cf6,26,34,2);
lilac.position.set(-8,4,6);
scene.add(lilac);

const mint = new THREE.PointLight(0x73c7b3,18,30,2);
mint.position.set(8,-5,3);
scene.add(mint);

const peach = new THREE.PointLight(0xf2b89e,10,24,2);
peach.position.set(0,8,-8);
scene.add(peach);

const field = new THREE.Group();
scene.add(field);

const cubes = [];
const cols = 10;
const rows = 5;
const width = mobile ? 15.5 : 22;
const height = mobile ? 10.5 : 13.2;
const depth = mobile ? 8.5 : 12.5;

function seeded(index){
  const x = Math.sin(index*12.9898)*43758.5453;
  return x-Math.floor(x);
}

for(let i=0;i<cubeCount;i++){
  const nx = seeded(i+1);
  const ny = seeded(i+51);
  const nz = seeded(i+101);
  const x = (nx-.5)*width;
  const y = (ny-.5)*height;
  const z = (nz-.5)*depth;

  const size = mobile ? .64 + seeded(i+151)*.16 : .78 + seeded(i+151)*.22;
  const group = new THREE.Group();
  group.position.set(x,y,z);
  group.rotation.set(
    seeded(i+201)*Math.PI,
    seeded(i+251)*Math.PI,
    seeded(i+301)*Math.PI
  );

  const materials = [];
  for(let face=0;face<6;face++){
    const asset = assets[(i*5 + face*2 + Math.floor(i/7))%assets.length];
    materials.push(new THREE.MeshStandardMaterial({
      map:textures[assets.indexOf(asset)],
      color:0xffffff,
      roughness:.3,
      metalness:.08
    }));
  }

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size,size,size),
    materials
  );
  group.add(mesh);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({
      color:0x11131a,
      transparent:true,
      opacity:.34
    })
  );
  group.add(edge);

  group.userData = {
    base:new THREE.Vector3(x,y,z),
    seed:i*0.73,
    index:i,
    size,
    phaseX:seeded(i+401)*Math.PI*2,
    phaseY:seeded(i+451)*Math.PI*2,
    phaseZ:seeded(i+501)*Math.PI*2,
    driftX:.06 + seeded(i+551)*.08,
    driftY:.05 + seeded(i+601)*.075,
    driftZ:.045 + seeded(i+651)*.065,
    homeRotation:group.rotation.clone(),
    hover:0
  };

  field.add(group);
  cubes.push(group);
}

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .05;
controls.enablePan = false;
controls.enableZoom = true;
controls.rotateSpeed = mobile ? .38 : .50;
controls.zoomSpeed = .62;
controls.minDistance = mobile ? 14 : 11;
controls.maxDistance = mobile ? 34 : 32;
controls.target.set(0,0,0);

const pointer = new THREE.Vector2(99,99);
const smoothPointer = new THREE.Vector2(99,99);
const raycaster = new THREE.Raycaster();
let hovered = null;

function setPointer(clientX,clientY){
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX-rect.left)/rect.width)*2-1;
  pointer.y = -((clientY-rect.top)/rect.height)*2+1;
}

function findCube(intersects){
  if(!intersects.length) return null;
  let object = intersects[0].object;
  while(object && object.userData.index === undefined && object.parent) object=object.parent;
  return object?.userData.index !== undefined ? object : null;
}

function updateHover(){
  raycaster.setFromCamera(pointer,camera);
  const hit = findCube(raycaster.intersectObjects(cubes,true));
  hovered = hit;
  renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
}

renderer.domElement.addEventListener('pointermove',e=>{
  setPointer(e.clientX,e.clientY);
  updateHover();
},{passive:true});

renderer.domElement.addEventListener('pointerleave',()=>{
  pointer.set(99,99);
  hovered=null;
},{passive:true});

renderer.domElement.addEventListener('dblclick',()=>{
  controls.reset();
});

const clock = new THREE.Clock();

function animate(){
  const t = clock.getElapsedTime();

  smoothPointer.lerp(pointer,.09);
  controls.update();

  if(!reduceMotion){
    field.rotation.y = Math.sin(t*.055)*.055;
    field.rotation.x = Math.cos(t*.047)*.035;
  }

  cubes.forEach(cube=>{
    const d=cube.userData;

    if(!reduceMotion){
      cube.position.x = d.base.x + Math.sin(t*d.driftX+d.phaseX)*.95;
      cube.position.y = d.base.y + Math.cos(t*d.driftY+d.phaseY)*.72;
      cube.position.z = d.base.z + Math.sin(t*d.driftZ+d.phaseZ)*.82;

      cube.rotation.x = d.homeRotation.x + Math.sin(t*.22+d.phaseX)*.20;
      cube.rotation.y = d.homeRotation.y + Math.cos(t*.19+d.phaseY)*.24;
      cube.rotation.z = d.homeRotation.z + Math.sin(t*.17+d.phaseZ)*.15;
    }

    const screen=cube.position.clone().project(camera);
    const dx=smoothPointer.x-screen.x;
    const dy=smoothPointer.y-screen.y;
    const distance=Math.hypot(dx,dy);
    const influence=Math.max(0,1-distance/.72);

    d.hover += ((hovered===cube?1:0)-d.hover)*.11;
    const magnetic=influence*(reduceMotion?0:.12);

    cube.position.x += dx*magnetic;
    cube.position.y -= dy*magnetic;
    cube.position.z += influence*(reduceMotion?0:.25);

    const scale=1+d.hover*.08;
    cube.scale.x += (scale-cube.scale.x)*.10;
    cube.scale.y=cube.scale.x;
    cube.scale.z=cube.scale.x;
  });

  renderer.render(scene,camera);
}

function resize(){
  const w=host.clientWidth;
  const h=host.clientHeight;
  camera.aspect=w/Math.max(1,h);
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,mobile ? 1.1 : 1.4));
  renderer.setSize(w,h,false);
}

window.addEventListener('resize',resize,{passive:true});
resize();

document.addEventListener('visibilitychange',()=>{
  renderer.setAnimationLoop(document.hidden ? null : animate);
});

renderer.setAnimationLoop(animate);
