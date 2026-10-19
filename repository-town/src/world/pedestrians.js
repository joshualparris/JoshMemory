// Shared physical space for town villagers, independent of rendering/frame rate.
export const PERSONAL_SPACE = 1.35;
const EPS = 1e-7;

// Reserve distinct stopping places along the frontage, not the doorway centre.
// A reservation lasts only as long as the visit (step.target), so leaving frees it.
export function pedestrianDestination(person, target, people) {
  for (let slot = 0; slot <= people.length * 2; slot++) {
    const offset = slot ? Math.ceil(slot / 2) * (PERSONAL_SPACE * 2 + .1) * (slot % 2 ? 1 : -1) : 0;
    const p = { x: target.x + offset, z: target.z };
    if (people.every(other => other === person || other.inside ||
      (!other.step?.target || Math.hypot(p.x - other.step.target.x, p.z - other.step.target.z) >= PERSONAL_SPACE - EPS) &&
      Math.hypot(p.x - other.x, p.z - other.z) >= PERSONAL_SPACE - EPS)) return p;
  }
  return { ...target };
}

function clearMove(person, x, z, blockers) {
  const dx = x - person.x, dz = z - person.z, length2 = dx * dx + dz * dz;
  return blockers.every(other => {
    if (other === person || other.inside) return true;
    const ox = person.x - other.x, oz = person.z - other.z;
    const start = ox * ox + oz * oz;
    // Allow an old overlapping save/spawn to separate, but never move deeper in.
    if (start < PERSONAL_SPACE ** 2 - EPS) return ox * dx + oz * dz >= -EPS &&
      (x - other.x) ** 2 + (z - other.z) ** 2 > start + EPS;
    const t = length2 ? Math.max(0, Math.min(1, -(ox * dx + oz * dz) / length2)) : 0;
    return (ox + t * dx) ** 2 + (oz + t * dz) ** 2 >= PERSONAL_SPACE ** 2 - EPS;
  });
}

// Find a short route around a crowd using a local half-metre grid. All edges
// are swept-circle checked. If space is unavailable, wait rather than overlap.
function detour(person, goal, blockers) {
  const start={x:person.x,z:person.z,i:0,j:0,g:0,parent:null};
  const side=n=>((n.x-start.x)*(goal.z-start.z)-(n.z-start.z)*(goal.x-start.x))*.0001;
  const open=[start], best=new Map([['0,0',0]]);
  for(let expanded=0;open.length && expanded<600;expanded++) {
    open.sort((a,b)=>(a.g+Math.hypot(a.x-goal.x,a.z-goal.z)+side(a))-(b.g+Math.hypot(b.x-goal.x,b.z-goal.z)+side(b)));
    const n=open.shift();
    if(n.parent && clearMove(n,goal.x,goal.z,blockers)) {
      const route=[];let p=n;while(p.parent){route.unshift({x:p.x,z:p.z});p=p.parent;}return route;
    }
    for(const [di,dj] of [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]]) {
      const i=n.i+di,j=n.j+dj;if(Math.abs(i)>16||Math.abs(j)>16)continue;
      const x=start.x+i*.5,z=start.z+j*.5,g=n.g+Math.hypot(di,dj)*.5,key=i+','+j;
      if(g>=(best.get(key)??Infinity)||!clearMove(n,x,z,blockers))continue;
      best.set(key,g);open.push({x,z,i,j,g,parent:n});
    }
  }
  return [];
}

export function movePedestrian(person, distance, people, obstacles = []) {
  const blockers=[...people.filter(p=>p!==person&&!p.inside),...obstacles];
  if(person.crowdWait>0){person.crowdWait=Math.max(0,person.crowdWait-distance);return;}
  let attempts=Math.ceil(distance/.2)+16;
  while(distance>EPS && person.path.length && attempts-->0) {
    let goal=person.path[0];
    const occupied=blockers.some(o=>Math.hypot(o.x-goal.x,o.z-goal.z)<PERSONAL_SPACE-EPS);
    // Route corners are navigation hints, not destinations: don't insist on
    // touching a corner occupied by somebody waiting outside a shop.
    if(occupied && person.path.length>1 && Math.hypot(person.x-goal.x,person.z-goal.z)<3){person.path.shift();continue;}
    if(occupied && person.path.length===1 && blockers.some(o=>!o.path?.length&&Math.hypot(o.x-goal.x,o.z-goal.z)<PERSONAL_SPACE-EPS)) {
      goal=pedestrianDestination(person,goal,people);
      person.path[0]=goal;if(person.step)person.step.target=goal;
    }
    if(person.detourGoal!==goal){person.detourPath=[];person.detourGoal=goal;}
    let target=person.detourPath?.[0]||goal;
    let dx=target.x-person.x,dz=target.z-person.z,d=Math.hypot(dx,dz);
    if(d<EPS){if(person.detourPath?.length)person.detourPath.shift();else person.path.shift();continue;}
    let stride=Math.min(distance,d),x=person.x+dx/d*stride,z=person.z+dz/d*stride;
    if(!clearMove(person,x,z,blockers)) {
      person.detourPath=detour(person,goal,blockers);
      if(!person.detourPath.length){person.crowdWait=1.5;break;}
      target=person.detourPath[0];dx=target.x-person.x;dz=target.z-person.z;d=Math.hypot(dx,dz);
      stride=Math.min(distance,d);x=person.x+dx/d*stride;z=person.z+dz/d*stride;
      if(!clearMove(person,x,z,blockers))break;
    }
    person.x=x;person.z=z;person.heading=Math.atan2(dx,dz);distance-=stride;
    if(stride>=d-EPS){if(person.detourPath?.length)person.detourPath.shift();else person.path.shift();}
  }
}
