/**
 * Temporary, read-only public test harness for the EXACT Lantern Point world
 * modules on a pinned GitHub commit. Does NOT replace the full Repo Town build.
 * No app secrets, no real land claims. Disable/remove when production is ready.
 */
const PIN = '25c350123f4b1aef235b076af2dc7e8bde825f8a';
const MODULES = new Set([
  'lantern-point.js','lantern-point-layout.js','lantern-road-view.js',
  'lantern-citizens.js','lantern-architecture.js','npc-wardrobe.js',
  'resident-figure.js','resident-identity.js'
]);
const HTML=String.raw\`<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lantern Point · isolated 3D module test</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#102a31;color:#eaf8f5;font:14px/1.5 system-ui,Arial,sans-serif}
header{padding:12px 16px;background:#122f38;border-bottom:1px solid #5e8385}header strong{display:block;font-size:17px}
header small{display:block;color:#b4e1d6}#viewport{height:calc(100dvh - 183px);min-height:280px;position:relative}
canvas{width:100%;height:100%;display:block;touch-action:none}#hud{position:absolute;left:10px;top:10px;background:#13252cdd;padding:10px 13px;border-radius:9px;max-width:380px}
.controls{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;background:#173842;align-items:center}
button{font:inherit;background:#266b71;border:1px solid #76a7a1;color:white;padding:10px 15px;border-radius:8px;cursor:pointer}
button:focus-visible{outline:3px solid #f7d78a}#legend{font-size:12px;color:#d4e5e1}
#touch{display:none;position:absolute;bottom:14px;left:14px;gap:8px}#touch button{width:52px;height:50px}
@media(pointer:coarse){#touch{display:flex}}
</style>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js"}}</script></head>
<body><header><strong>Lantern Point · realistic-road prototype</strong>
<small>Isolated rendering test of branch 25c35012 · NOT merged Repository Town · Fictional NSW-inspired village</small></header>
<main><div id="viewport"><canvas id="view" aria-label="3D Lantern Point with sealed curved road, houses and simulated residents"></canvas>
<div id="hud" role="status">Loading Three.js and Lantern Point module…</div>
<div id="touch"><button data-dir="left">◀</button><button data-dir="up">▲</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div></div>
<div class="controls"><button id="to-village">Village</button><button id="to-bend">Curved road</button><button id="to-entry">Town-side entrance</button>
<button id="drive" aria-pressed="false">Walk / Drive</button><span id="legend">WASD/arrow keys: move · V: switch walk/drive · simulated residents load from read-only Parristan API</span></div></main>
<script type="module">
import * as THREE from 'three';
import {buildLanternPoint} from '/world/lantern-point.js';
import {onLanternRoad,LANTERN_ROAD} from '/world/lantern-point-layout.js';
const canvas=document.getElementById('view'),hud=document.getElementById('hud');
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb3c9d0);scene.fog=new THREE.Fog(0xb3c9d0,300,900);
const camera=new THREE.PerspectiveCamera(60,1,.1,1500),renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));renderer.shadowMap.enabled=false;
scene.add(new THREE.HemisphereLight(0xffffff,0x688373,2));
const sun=new THREE.DirectionalLight(0xffedd2,2.7);sun.position.set(-200,380,-150);scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),new THREE.MeshLambertMaterial({color:0x9cab77}));ground.rotation.x=-Math.PI/2;ground.position.y=-.21;scene.add(ground);
const lantern=buildLanternPoint(scene);
const player=new THREE.Group();
const cap=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.1,3,8),new THREE.MeshLambertMaterial({color:0x156b8b}));
cap.position.y=1.2;player.add(cap);scene.add(player);
let x=0,z=2810,driving=false,frames=0,prev=performance.now();
const pressed=new Set(),touch=new Set();
addEventListener('keydown',e=>{if(['w','a','s','d','ArrowUp','ArrowLeft','ArrowRight','ArrowDown','v'].includes(e.key)){e.preventDefault();pressed.add(e.key);if(e.key==='v')toggleDrive();}});
addEventListener('keyup',e=>pressed.delete(e.key));
addEventListener('blur',()=>{pressed.clear();touch.clear()});
document.querySelectorAll('[data-dir]').forEach(b=>{const k=b.dataset.dir;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(k)});b.addEventListener('pointerup',()=>touch.delete(k));b.addEventListener('pointercancel',()=>touch.delete(k))});
function toggleDrive(){driving=!driving;document.getElementById('drive').setAttribute('aria-pressed',String(driving));document.getElementById('drive').textContent=driving?'Driving (left-hand lanes)':'Walking';}
document.getElementById('drive').onclick=toggleDrive;
document.getElementById('to-village').onclick=()=>{x=0;z=2810};
document.getElementById('to-bend').onclick=()=>{x=170;z=665};
document.getElementById('to-entry').onclick=()=>{x=338;z=550};
function render(time){
 const dt=Math.max(.001,Math.min(.04,(time-prev)/1000));prev=time;
 const dx=(pressed.has('d')||pressed.has('ArrowRight')||touch.has('right')?1:0)-(pressed.has('a')||pressed.has('ArrowLeft')||touch.has('left')?1:0);
 const dz=(pressed.has('w')||pressed.has('ArrowUp')||touch.has('up')?1:0)-(pressed.has('s')||pressed.has('ArrowDown')||touch.has('down')?1:0);
 const length=Math.hypot(dx,dz)||1,speed=driving?18:4.5;
 const nx=x+dx/length*speed*dt,nz=z+dz/length*speed*dt;
 if(!driving||onLanternRoad(nx,nz)){x=nx;z=nz;}
 player.position.set(x,0,z);lantern.update({x,z},false,dt,time/1000);
 const cx=x+65,cz=z+93;
 camera.position.lerp(new THREE.Vector3(cx,75,cz),Math.min(1,dt*3));
 camera.lookAt(x,2,z);
 const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h&&(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio()))){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 renderer.render(scene,camera);frames++;
 if(frames%45===0){const info=lantern.status();hud.textContent='Region: '+(z>2600?'Lantern Point':'South road')+' · '+Math.round(x)+', '+Math.round(z)+' · '+(driving?'Driving':'Walking')+' · On road: '+onLanternRoad(x,z)+' · NPCs: '+info.citizens+' · Renderer: '+info.renderSystem+(info.error?' · API: '+info.error:'');}
 requestAnimationFrame(render);
}
const first=lantern.status();window.__lanternPreview={
 place(a,b){x=a;z=b},get state(){return {x,z,driving,onRoad:onLanternRoad(x,z),...lantern.status()}},
 view:()=>lantern.status(),moduleSha:'25c35012',scene,lantern
};
requestAnimationFrame(render);
</script></body></html>\`;
export default {
  async fetch(request){
    const url=new URL(request.url),name=url.pathname.split('/').at(-1);
    if(url.pathname.startsWith('/world/') && MODULES.has(name)){
      const raw='https://raw.githubusercontent.com/joshualparris/JoshMemory/'+PIN+'/repository-town/src/world/'+name;
      const response=await fetch(raw,{headers:{'user-agent':'Parristan-Lantern-Preview/1.0'}});
      if(!response.ok)return new Response('Source unavailable: '+response.status,{status:502});
      return new Response(response.body,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public,max-age=300','x-content-type-options':'nosniff','access-control-allow-origin':'*'}});
    }
    if(url.pathname==='/'||url.pathname==='/index.html')return new Response(HTML,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
    if(url.pathname==='/health')return Response.json({ok:true,fictional:true,branchSha:PIN,isolatedPreview:true});
    return new Response('Not found',{status:404});
  }
};