import * as THREE from 'three';
import { JOB_BOARD } from './jobs.js';

// Each step is an object the player must approach in 3D and use repeatedly.
// The stage is stored on the current paid shift, not on a disposable popup.
const STATIONS={
  store:[[-4.45,-2.6],[1.25,2.45],[4.55,-3.5]],
  bakery:[[-3.1,-2.5],[0.8,-2],[3.2,-3.1]],
  garden:[[-3.3,-2.5],[0.2,-2.4],[3.3,-2.5]],
  depot:[[-3.2,-2.4],[0.4,-2.6],[3.3,-2.5]],
  post:[[-3,-2.5],[0,-2.4],[3.1,-2.5]],
  hall:[[-3,-2.5],[0,-2.4],[3.1,-2.5]]
};
const CAPTIONS={
  'check-expiry':['Inspect date on carton','Separate old carton','Record the dated batch'],
  'refill-shelves':['Take box from delivery trolley','Put goods on lower shelf','Fill upper shelf'],
  'count-stock':['Count left-hand shelf','Count right-hand shelf','Record the inventory'],
  'wash-hands':['Turn on handwash tap','Wash hands','Dry hands'],
  'prep-bench':['Clean preparation bench','Lay out trays','Prepare dough'],
  cooling:['Check hot trays','Move tray onto rack','Pack cooled bread'],
  'water-plants':['Fill watering can','Water first crop row','Water second crop row'],
  'weed-beds':['Pull weeds from bed one','Clear bed two','Put weeds in green bin'],
  'pack-produce':['Pick produce','Fill crate','Stack packed crate'],
  'sort-freight':['Collect incoming parcel','Sort parcel by destination','Place parcel on correct pallet'],
  'verify-manifest':['Read consignment label','Check freight manifest','Mark item received'],
  'stack-parcels':['Lift small parcel','Place parcel safely','Secure the stack'],
  'sort-mail':['Collect unsorted mail','Sort first delivery round','Sort second delivery round'],
  'label-parcels':['Check delivery address','Attach destination label','Put parcel in dispatch tub'],
  'prepare-route':['Check delivery sheet','Load mail bag','Ready delivery round'],
  'clean-floors':['Collect cleaning equipment','Mop first section','Mop second section'],
  'file-records':['Collect office files','Sort files by date','File in cabinet'],
  'inspect-lighting':['Inspect first fixture','Check second fixture','Record fault-free inspection']
};
const cube=(group,color,w,h,d,x,y,z)=>{
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
 m.position.set(x,y,z);group.add(m);return m;
};
export function installPhysicalJobs(built,site,makeLabel,life){
 const def=JOB_BOARD.find(d=>d.site===site.id);
 if(!def)return;
 const stations=STATIONS[site.id]||STATIONS.hall;
 const root=new THREE.Group();root.name='Hands-on workplace stations';built.group.add(root);
 const actors=[];
 def.tasks.forEach((task,index)=>{
   const [x,z]=stations[index],g=new THREE.Group();
   g.position.set(x,0,z);root.add(g);
   // A small equipment trolley with physical products that change as work progresses.
   cube(g,0x554b40,.92,.72,.62,0,.36,0);
   cube(g,0xd6b780,.98,.10,.68,0,.76,0);
   const pieces=[];
   for(let n=0;n<3;n++){
     const isStore=site.id==='store',colour=isStore?([0xb88945,0x4c8d65,0x477ba2][n]):[0xc18c53,0x8aaf77,0x9f9d87][n];
     const item=cube(g,colour,.22,.27,.25,(n-1)*.26,.99,0);
     pieces.push(item);
   }
   const tag=makeLabel(task.replace(/-/g,' '),'interactive');
   tag.position.set(x,1.94,z);tag.userData.labelKind='interactive';built.group.add(tag);
   built.interactables.push({
     key:'job:'+site.id+':'+task,label:'Work: '+task.replace(/-/g,' '),
     type:'civic',room:0,roomName:site.name,pos:new THREE.Vector3(x,0,z),
     act:{do:'physical-job',task,civicId:site.id}
   });
   actors.push({task,pieces});
 });
 built.workStationVisuals=()=> {
   const shift=life.jobsReport().active;
   for(const a of actors){
     const step=shift?.site===site.id?(shift.tasks.includes(a.task)?3:(shift.progress?.[a.task]||0)):0;
     a.pieces.forEach((mesh,n)=>{
       // Products travel off the trolley into a visible destination display.
       mesh.position.set((n-1)*.26,.99,0);
       if(n<step){mesh.position.set((n-1)*.27,1.25,.42);mesh.rotation.y=Math.PI/2;}
       else mesh.rotation.y=0;
     });
   }
 };
 built.workStationVisuals();
}
export function usePhysicalJob(life,task){
 const shift=life.jobsReport().active;
 if(!shift)return {ok:false,message:'Start a paid shift at the workplace counter first.'};
 const def=JOB_BOARD.find(d=>d.id===shift.id);
 if(!def?.tasks.includes(task))return {ok:false,message:'This station is not part of your current shift.'};
 if(shift.tasks.includes(task))return {ok:false,message:'This duty has already been completed.'};
 const stage=shift.progress?.[task]||0,steps=CAPTIONS[task]||[];
 if(stage<2){
   // Actual task state belongs to the shift, and persists in the save.
   const active=life.civic.jobs.active;active.progress??={};
   active.progress[task]=stage+1;
   return {ok:true,message:steps[stage]+'. '+(3-stage-1)+' step(s) remaining. Use this station again.'};
 }
 const r=life.doTask(task);
 if(r.ok){
   life.civic.jobs.active.progress??={};
   life.civic.jobs.active.progress[task]=3;
   if(task==='refill-shelves'){
     const store=life.place('store');
     if(store){
       // Store stock is the total owned quantity. Display stock is a subset
       // of that total, so moving cartons out of the storeroom creates no goods.
       store.displayStock??={};
       let moved=0;
       for(const good of ['flour','tea','coffee','bread','eggs','milk']){
         const total=Math.max(0,Math.floor(store.stock?.[good]||0));
         const displayed=Math.min(total,Math.max(0,Math.floor(store.displayStock[good]??Math.min(2,total))));
         const capacity=Math.min(total,Math.max(3,Math.ceil((store.target?.[good]||8)*.55)));
         const put=Math.min(3,Math.max(0,capacity-displayed),Math.max(0,total-displayed));
         store.displayStock[good]=displayed+put;moved+=put;
       }
       store.shelfRefills=(store.shelfRefills||0)+1;
       r.message='Moved '+moved+' units from storeroom to sales shelves without creating extra inventory. '+r.message;
     }
   }
 }
 return {...r,message:r.ok?steps[2]+'. '+r.message:r.message};
}
