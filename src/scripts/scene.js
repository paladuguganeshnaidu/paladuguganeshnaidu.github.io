const host=document.querySelector('#ai-scene');
if(host){const start=async()=>{let THREE;try{THREE=await import('three')}catch{document.querySelector('#scene-shell')?.classList.add('fallback');return}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{document.querySelector('#scene-shell')?.classList.add('fallback');return}
const canvas=renderer.domElement;canvas.className='global-canvas';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100);camera.position.z=18;
scene.add(new THREE.HemisphereLight(0xffffff,0xa7b399,3));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(5,8,10);scene.add(sun);
const world=new THREE.Group();scene.add(world);const objects=[];const palette=[0xb4c7a0,0xd0bfe0,0xe3c2aa,0xadc8d8,0xc5d5b3];
function label(text){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#fafbf4';ctx.beginPath();ctx.roundRect(0,0,512,128,25);ctx.fill();ctx.fillStyle='#59634f';ctx.font='500 44px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,80);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));sp.scale.set(1.9,.48,1);return sp}
const names=['PyTorch','Ollama','Vector DB','RAG','FastAPI','MCP','Docker','LOMVREN','Agents','Evaluation'];
for(let i=0;i<names.length;i++){const group=new THREE.Group();const material=new THREE.MeshStandardMaterial({color:palette[i%5],roughness:.55,metalness:.16});const geo=i%3===0?new THREE.BoxGeometry(.66,.66,.66):i%3===1?new THREE.IcosahedronGeometry(.5,0):new THREE.CylinderGeometry(.45,.45,.5,24);const mesh=new THREE.Mesh(geo,material);group.add(mesh);const tag=label(names[i]);tag.position.y=-.72;group.add(tag);const a=i*Math.PI*2/names.length;group.userData={angle:a,mesh,index:i};world.add(group);objects.push(group)}
const core=new THREE.Mesh(new THREE.BoxGeometry(1.7,.28,1.7),new THREE.MeshStandardMaterial({color:0x889b77,metalness:.5,roughness:.35}));world.add(core);core.rotation.set(.6,.3,.2);
const chip=new THREE.Mesh(new THREE.BoxGeometry(.7,.18,.7),new THREE.MeshStandardMaterial({color:0xd7dfc7,metalness:.4,roughness:.45}));chip.position.y=.22;core.add(chip);
for(let i=0;i<16;i++){const pin=new THREE.Mesh(new THREE.BoxGeometry(.08,.1,.22),new THREE.MeshStandardMaterial({color:0xb5c79e}));pin.position.set((i%4-.5)*.35-.35,0,i<8?.92:-.92);core.add(pin)}
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.6,.012,8,100),new THREE.MeshBasicMaterial({color:0xa6b797,transparent:true,opacity:.6}));ring.rotation.x=1.05;world.add(ring);
const lines=[];for(let i=0;i<names.length;i++){const geom=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const line=new THREE.Line(geom,new THREE.LineBasicMaterial({color:palette[i%5],transparent:true,opacity:.3}));world.add(line);lines.push(line)}
let raf=0,last=0,mouse={x:0,y:0},smoothScroll=0;const motionOff=()=>reduced.matches||document.body.classList.contains('motion-paused');
const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};resize();
function draw(time=0){raf=0;if(document.hidden)return;if(!motionOff()&&time-last<32){raf=requestAnimationFrame(draw);return}last=time;
const y=scrollY;const hero=document.querySelector('.home-hero');const rect=host.parentElement.getBoundingClientRect();const onHero=y<innerHeight*.75;
canvas.style.opacity=onHero?'1':'.17';const visibleHeight=2*Math.tan(34*Math.PI/360)*camera.position.z,visibleWidth=visibleHeight*camera.aspect;
world.position.x=onHero?((rect.left+rect.width/2)/innerWidth-.5)*visibleWidth:visibleWidth*.16;world.position.y=onHero?(.5-(rect.top+rect.height/2)/innerHeight)*visibleHeight:0;
const infra=document.querySelector('#infrastructure');let assembly=0;if(infra){const r=infra.getBoundingClientRect();assembly=Math.max(0,Math.min(1,(innerHeight*.75-r.top)/(r.height*.8)));document.querySelector('.infra-visual')?.style.setProperty('--assembly',assembly.toFixed(3))}
smoothScroll+=(y-smoothScroll)*.1;const t=motionOff()?0:time*.00012;world.rotation.y=mouse.x*.07+smoothScroll*.00015;world.rotation.x=mouse.y*.035;
for(const group of objects){const {angle,index,mesh}=group.userData;const a=angle+t;const radius=innerWidth<700?2.45:3.65;const orbit=new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*2.8,Math.sin(a*2));const target=new THREE.Vector3((index%3-1)*2,(1-Math.floor(index/3))*1.5,0);group.position.copy(orbit.lerp(target,assembly*.9));mesh.rotation.set(t*2+angle,t+angle,t*.5);const pos=lines[index].geometry.attributes.position;pos.setXYZ(1,group.position.x,group.position.y,group.position.z);pos.needsUpdate=true;}
ring.rotation.z=t;core.rotation.y=.3+t;renderer.render(scene,camera);if(!motionOff())raf=requestAnimationFrame(draw)}
function restart(){if(raf)cancelAnimationFrame(raf);draw(performance.now())}
addEventListener('resize',()=>{resize();if(motionOff())restart()},{passive:true});addEventListener('scroll',()=>{if(motionOff())restart()},{passive:true});addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth-.5;mouse.y=e.clientY/innerHeight-.5},{passive:true});document.addEventListener('visibilitychange',restart);document.addEventListener('motionchange',restart);reduced.addEventListener('change',restart);restart();};
if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:1200});else setTimeout(start,150);}
