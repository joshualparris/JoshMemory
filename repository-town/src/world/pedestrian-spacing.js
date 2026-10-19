// Shared real-world footprints for both simulation villagers and independently
// animated street NPCs. Never move only the meshes: positions are authoritative.
// One person uses roughly 0.58m of ground radius; greetings and queues keep
// their own space instead of stacking on one point outside a shop.
export const PEDESTRIAN_RADIUS = 0.61;
export const PEDESTRIAN_GAP = 1.28;

function fallbackDirection(a,b) {
  // Two NPCs can load at exactly the same position. A stable identity-based
  // angle prevents NaNs and random jitter across frames and game saves.
  const id=String(a.id)+'/'+String(b.id);
  let n=2166136261;
  for(const c of id){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}
  const angle=((n>>>0)%6283)/1000;
  return {x:Math.cos(angle),z:Math.sin(angle)};
}
function canPlace(item,x,z,world,r) {
  if(!Number.isFinite(x)||!Number.isFinite(z))return false;
  if(world?.hits?.(x,z,r))return false;
  const guard=item.guard;
  return !guard||guard(x,z);
}
function move(item,dx,dz,world) {
  if(item.fixed)return 0;
  const {pos}=item,oldX=pos.x,oldZ=pos.z;
  const r=item.radius??PEDESTRIAN_RADIUS;
  // Move without crossing walls, roadside vehicles, tables or door frames.
  const choices=[
    [dx,dz],[dx,0],[0,dz],
    [dz*.7,-dx*.7],[-dz*.7,dx*.7]
  ];
  for(const [x,z] of choices) {
    if(Math.hypot(x,z)<1e-7)continue;
    if(canPlace(item,oldX+x,oldZ+z,world,r)){
      pos.x=oldX+x;pos.z=oldZ+z;
      return Math.hypot(x,z);
    }
  }
  return 0;
}
// Positions are {id, pos:{x,z}, radius?, fixed?, guard?}.
// Deterministic ordering uses caller order; both stationary and moving people
// are included so standing workers aren't allowed to merge with visitors.
export function separatePedestrians(people,{world=null,gap=PEDESTRIAN_GAP,passes=5}={}) {
  const entries=people.filter(p=>p?.pos&&Number.isFinite(p.pos.x)&&Number.isFinite(p.pos.z));
  let corrected=0;
  for(let pass=0;pass<passes;pass++){
    let touched=false;
    for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
      const a=entries[i],b=entries[j];
      if(a.fixed&&b.fixed)continue;
      const target=Math.max(gap,(a.radius??PEDESTRIAN_RADIUS)+(b.radius??PEDESTRIAN_RADIUS)+.05);
      const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z;
      if(Math.abs(dx)>=target||Math.abs(dz)>=target)continue;
      const distance=Math.hypot(dx,dz);
      if(distance>=target-0.01)continue;
      const n=distance<1e-6?fallbackDirection(a,b):{x:dx/distance,z:dz/distance};
      // Split an overlap between free bodies; stationary visitors and people
      // chatting with the player can be respected with fixed=true.
      const push=Math.min(1.4,target-distance+0.015),share=a.fixed?1:b.fixed?0:.5;
      let moved=0;
      if(share<1)moved+=move(a,-n.x*push*(1-share),-n.z*push*(1-share),world);
      if(share>0)moved+=move(b,n.x*push*share,n.z*push*share,world);
      // If the near-side body is blocked by a wall, move the other instead.
      if(moved<push*.45){
        if(!a.fixed)moved+=move(a,-n.x*push*.9,-n.z*push*.9,world);
        if(moved<push*.45&&!b.fixed)moved+=move(b,n.x*push*.9,n.z*push*.9,world);
      }
      if(moved>1e-5){corrected++;touched=true;}
    }
    if(!touched)break;
  }
  return corrected;
}
