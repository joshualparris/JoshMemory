// Synthetic Narromine citizens and trip intentions. All names, occupancy and rosters are fictional.
// Building centroids and public POIs are mapped: NEVER equate a mapped building with its real resident.
// Public business labels are from the game's dated OSM export and may change in real life.
import { PLACES, STREETS } from './narromine-layout.js';
import { NARROMINE_FOOTPRINTS } from './narromine-footprints-data.js';
import { townWeekday } from './town-calendar.js';

const WORK_KINDS = new Set(['supermarket','school','hospital','post_office','townhall','government',
  'doctors','pharmacy','restaurant','cafe','bakery','agrarian','shop','farm','car_repair','industrial']);
const ROLES = {
  supermarket:'grocery team member', school:'education worker', hospital:'healthcare worker',
  post_office:'postal retail worker', townhall:'council staff member', government:'community service worker',
  doctors:'medical practice worker', pharmacy:'pharmacy team member', restaurant:'hospitality worker',
  cafe:'cafe worker', bakery:'baker', agrarian:'agricultural supplies worker',
  car_repair:'automotive tradesperson', industrial:'production worker', farm:'farm worker', shop:'retail worker'
};
const GIVEN=['Amelia','Oliver','Grace','Henry','Mia','Noah','Sophie','Jack','Ella','Liam','Ruby','Thomas',
  'Chloe','Lucas','Isla','Daniel','Matilda','Ethan','Zoe','Samuel','Harper','Benjamin','Ava','Cooper',
  'Freya','James','Tahlia','William','Hannah','Leo','Alice','Hudson','Layla','Charlie','Imogen','Max'];
const FAMILIES=['Parker','Murray','Ellis','Collins','Reid','Walker','Harris','Turner','Fletcher','Bennett',
  'Cooper','Ward','Baker','Martin','Watson','Lee','Murphy','Dawson','Brooks','Ross','Clarke','West',
  'Wilson','Smith','Grant','Miller','Adams','Ryan','Hill','King','Bell','Hughes','Price','Young','Carter'];
const HOME_FIXTURES = Object.freeze({
  kitchen:['fridge','freezer','hob','oven','sink','pantry','bench','bin'],
  bathroom:['toilet','shower','washbasin','mirror'],
  bedroom:['bed','wardrobe','bedside table','lamp'],
  living:['sofa','table','chair'],
  laundry:['washing machine','laundry tub'],
  dining:['dining table','chairs']
});
const dist = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
function nearestNode(nodes,x,z) {
  let index=-1,d2=Infinity;
  for(let i=0;i<nodes.length;i++){
    const d=(nodes[i].x-x)**2+(nodes[i].z-z)**2;
    if(d<d2){d2=d;index=i;}
  }
  return {node:index,distance:Math.sqrt(d2)};
}
function streetNear(x,z) {
  let best=Infinity,name='unnamed mapped road';
  for(const street of STREETS) {
    if(!street.name || ['track','service'].includes(street.kind))continue;
    for(let i=1;i<street.pts.length;i++){
      const [ax,az]=street.pts[i-1], [bx,bz]=street.pts[i];
      const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;
      const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2));
      const d=Math.hypot(x-ax-t*dx,z-az-t*dz);
      if(d<best){best=d;name=street.name;}
    }
  }
  return name;
}
function buildHomes(nodes, limit) {
  const candidates=[];
  for(let i=0;i<NARROMINE_FOOTPRINTS.length;i++){
    const [x,z,w,d]=NARROMINE_FOOTPRINTS[i],area=w*d;
    // Heuristic, not verified residential zoning. Exclude tiny sheds and large commercial sheds.
    if(w<7||w>28||d<6||d>30||area<70||area>480)continue;
    if(PLACES.some(p=>dist({x,z},p)<28))continue;
    const near=nearestNode(nodes,x,z);
    if(near.distance>105)continue;
    candidates.push({footprintIndex:i,x,z,area,node:near.node});
  }
  // Spatially spread the household sample, not a synthetic cluster around the first tiles.
  const take=Math.min(limit,candidates.length), homes=[];
  for(let i=0;i<take;i++)homes.push(candidates[Math.floor((i+0.5)*candidates.length/take)]);
  return homes.map((h,i)=>Object.freeze({
    id:'NR-H-'+String(i+1).padStart(4,'0'),
    footprintIndex:h.footprintIndex,x:h.x,z:h.z,area:h.area,node:h.node,
    street:streetNear(h.x,h.z),addressNumber:null,
    label:'Mapped building near '+streetNear(h.x,h.z)+' (fictional occupancy)',
    residenceVerified:false,layoutVerified:false
  }));
}
function makeInterior(memberCount, area){
  // Furnishing SPECIFICATION only: not yet a generated walkable interior.
  const bedrooms=Math.min(4,Math.max(1,Math.ceil(memberCount/2),area>160?2:1));
  const rooms=[{type:'kitchen',fixtures:HOME_FIXTURES.kitchen},
    {type:'bathroom',fixtures:HOME_FIXTURES.bathroom},
    {type:'living',fixtures:HOME_FIXTURES.living},
    {type:'dining',fixtures:HOME_FIXTURES.dining},
    {type:'laundry',fixtures:HOME_FIXTURES.laundry}];
  for(let i=0;i<bedrooms;i++)rooms.push({type:'bedroom',fixtures:HOME_FIXTURES.bedroom,bedSpaces:i===0?2:2});
  return Object.freeze({interpretive:true,physicalInteriorBuilt:false,rooms:Object.freeze(rooms)});
}
function shiftFor(kind,index) {
  if(kind==='supermarket')return [{start:360,end:840},{start:540,end:1020},{start:780,end:1260}][index%3];
  if(kind==='hospital')return [{start:420,end:900},{start:900,end:1380}][index%2];
  if(kind==='bakery')return {start:300,end:780};
  if(kind==='cafe')return {start:390,end:870};
  if(kind==='school')return {start:480,end:960};
  if(kind==='post_office')return {start:540,end:1020};
  if(kind==='townhall'||kind==='government')return {start:510,end:990};
  return {start:480+(index%3)*30,end:960+(index%3)*30};
}
function worksDay(person,day) {
  const dow=townWeekday(day), kind=person.work.kind;
  if(kind==='hospital')return (day+person.seed)%5!==0;
  if(['school','government','townhall','post_office','doctors'].includes(kind))return dow>=1&&dow<=5;
  if(dow===0||dow===6)return (person.seed+dow)%3===0;
  return (dow+person.seed)%8!==0;
}
function travelMinutes(a,b) {
  return Math.max(8,Math.min(40,Math.round(dist(a,b)/125 + 6)));
}
function tripAt(person,day,minute,coles) {
  const m=((Math.trunc(minute)%1440)+1440)%1440, shift=person.shift;
  const commute=travelMinutes(person.home,person.work), workday=worksDay(person,day);
  if(workday){
    const start=shift.start-commute, end=shift.end;
    if(m>=start && m<shift.start)return {reason:'commute to work',from:person.home,to:person.work,windowEnd:shift.start};
    const groceryDay=townWeekday(day)===2||townWeekday(day)===4;
    // Staff can shop after work, never before they have finished a shift.
    if(groceryDay&&coles&&end<1180){
      if(m>=end&&m<end+22)return {reason:'groceries at Coles',from:person.work,to:coles,windowEnd:end+22};
      if(m>=end+22&&m<end+22+commute)return {reason:'taking groceries home',from:coles,to:person.home,windowEnd:end+22+commute};
    }else if(m>=end&&m<end+commute)return {reason:'returning home',from:person.work,to:person.home,windowEnd:end+commute};
  } else if(coles && townWeekday(day)===6) {
    const start=570+(person.seed%5)*18;
    if(m>=start&&m<start+22)return {reason:'weekly grocery shop',from:person.home,to:coles,windowEnd:start+22};
    if(m>=start+22&&m<start+48)return {reason:'returning from Coles',from:coles,to:person.home,windowEnd:start+48};
  }
  return null;
}
function activityAt(person,day,minute,coles) {
  const m=((Math.trunc(minute)%1440)+1440)%1440;
  const trip=tripAt(person,day,m,coles);
  if(trip)return {kind:'travelling',detail:trip.reason,destination:trip.to.id};
  if(m<360||m>=1320)return {kind:'sleeping',detail:'at home',destination:person.home.id};
  if(m<420)return {kind:'breakfast',detail:'preparing food at home',destination:person.home.id};
  if(worksDay(person,day)&&m>=person.shift.start&&m<person.shift.end)
    return {kind:'working',detail:person.role+' at '+person.work.name,destination:person.work.id};
  if(m>=1080&&m<1200)return {kind:'dinner',detail:'cooking and eating at home',destination:person.home.id};
  return {kind:'home',detail:'rest, errands or leisure (simplified)',destination:person.home.id};
}
// A* on the same routable OSM graph as the traffic renderer. Routes fail closed, never random-walk.
function routeBetween(nodes,adj,start,goal) {
  if(!Number.isInteger(start)||!Number.isInteger(goal)||!nodes[start]||!nodes[goal])return null;
  if(start===goal)return [start];
  const distance=new Float64Array(nodes.length).fill(Infinity);
  const previous=new Int32Array(nodes.length).fill(-1);
  const heap=[],push=(node,priority)=>{
    let i=heap.length;heap.push({node,priority});
    while(i>0){let p=(i-1)>>1;if(heap[p].priority<=priority)break;heap[i]=heap[p];i=p;}heap[i]={node,priority};
  };
  const pop=()=>{
    const top=heap[0], last=heap.pop();
    if(heap.length){let i=0;while(i*2+1<heap.length){
      let child=i*2+1;if(child+1<heap.length&&heap[child+1].priority<heap[child].priority)child++;
      if(heap[child].priority>=last.priority)break;
      heap[i]=heap[child];i=child;
    }heap[i]=last;
    }
    return top;
  };
  distance[start]=0;push(start,dist(nodes[start],nodes[goal]));
  while(heap.length){
    const {node,priority}=pop();
    if(priority>distance[node]+dist(nodes[node],nodes[goal])+1e-6)continue;
    if(node===goal){
      const path=[];for(let at=goal;at>=0;at=previous[at])path.push(at);
      return path.reverse();
    }
    for(const edge of adj.get(node)||[]){
      const alt=distance[node]+(edge.len||dist(nodes[node],nodes[edge.to]));
      if(alt+1e-6>=distance[edge.to])continue;
      distance[edge.to]=alt;previous[edge.to]=node;
      push(edge.to,alt+dist(nodes[edge.to],nodes[goal]));
    }
  }
  return null;
}
export function createNarromineCitizens({nodes,adj,limit=900}){
  if(!Array.isArray(nodes)||!(adj instanceof Map)||nodes.length<2)throw new Error('A routable Narromine road graph is required');
  const homes=buildHomes(nodes,limit);
  const workplaces=PLACES.filter(p=>WORK_KINDS.has(p.kind)).map((p,i)=>{
    const nearest=nearestNode(nodes,p.x,p.z);
    return Object.freeze({id:'NR-W-'+String(i+1).padStart(3,'0'),name:p.name,kind:p.kind,
      address:p.address||null,x:p.x,z:p.z,node:nearest.node,roadAccessMetres:nearest.distance,
      actualStaffUnknown:true,interiorWorkstationsVerified:false});
  }).filter(p=>p.roadAccessMetres<145);
  if(!homes.length||!workplaces.length)throw new Error('Missing mapped homes or reachable workplaces');
  const coles=workplaces.find(w=>/coles/i.test(w.name))||workplaces.find(w=>w.kind==='supermarket')||null;
  const households=Object.freeze(homes.map((home,i)=>{
    const familySize=1+(i%5===0?2:i%3===0?1:0);
    const surname=FAMILIES[(i*11+Math.floor(i/35))%FAMILIES.length];
    return Object.freeze({id:'NR-HH-'+String(i+1).padStart(4,'0'),home,
      members:Object.freeze(Array.from({length:familySize},(_,j)=>Object.freeze({
        id:'NR-P-'+String(i+1).padStart(4,'0')+'-'+String(j+1),
        name:GIVEN[(i*7+j*13)%GIVEN.length]+' '+surname,
        relation:j===0?'primary driver':j===1?'family member':'dependent',
        age:j===0?21+(i%43):j===1?22+(i%38):5+(i%13)
      }))),
      vehicle:Object.freeze({id:'NR-CAR-'+String(i+1).padStart(4,'0'),ownerHouseholdId:'NR-HH-'+String(i+1).padStart(4,'0'),
        modelIndex:[0,1,2,3,4,5,6,7][i%8],vehicleType:'household vehicle',registration:null}),
      interior:makeInterior(familySize,home.area),foodSource:coles?.name||null,
      occupancyFictional:true
    });
  }));
  const citizens=Object.freeze(households.map((h,i)=>{
    const work=workplaces[(i*17+Math.floor(i/9))%workplaces.length];
    return Object.freeze({id:h.members[0].id,name:h.members[0].name,age:h.members[0].age,
      householdId:h.id,home:h.home,work,role:ROLES[work.kind]||'local worker',
      shift:Object.freeze(shiftFor(work.kind,i)),vehicle:h.vehicle,seed:i,
      fictional:true,actualEmploymentUnknown:true});
  }));
  return Object.freeze({
    households,citizens,workplaces,coles,
    tripAt:(person,day,minute)=>tripAt(person,day,minute,coles),
    stateAt:(person,day,minute)=>activityAt(person,day,minute,coles),
    route:(from,to)=>routeBetween(nodes,adj,from,to),
    chooseTrip({day=1,minute=480,serial=0,activeIds=new Set(),excludedIds=new Set(),fromNode}){
      const count=citizens.length,start=((serial*59+Math.floor(minute)*17+Math.trunc(day)*31)%count+count)%count;
      for(let j=0;j<count;j++){
        const citizen=citizens[(start+j*37)%count];
        if(activeIds.has(citizen.id)||excludedIds.has(citizen.id))continue;
        const trip=tripAt(citizen,day,minute,coles);
        if(!trip||trip.to.node===fromNode)continue;
        const route=routeBetween(nodes,adj,fromNode,trip.to.node);
        if(route&&route.length>1)return {citizen,trip,route};
      }
      return null;
    }
  });
}
