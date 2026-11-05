// Exact track-link regression: only the OSM endpoints are factual geography.
// Route between towns, broad return loop, speed and track works are explicitly
// imagined Repository Town infrastructure because game distance is compressed.
import assert from 'node:assert/strict';
import {RAIL} from '../src/world/narromine-layout.js';
import {RAIL_Z,RAIL_GAUGE,RAIL_CROSSINGS} from '../src/world/rail-corridor.js';
import {buildRailNetwork,createTrainPath} from '../src/world/narromine-rail-network.js';
import {REGIONAL_RAIL_GEOMETRY as C, REGIONAL_RAIL_CONNECTOR as link,
  REPO_RAIL_EAST_ARC as east,REPO_RAIL_NORTH_RETURN as north,
  REPO_RAIL_WEST_ARC as west,REPO_RAIL_OVAL as oval,
  REPO_RAIL_MAIN_APPROACH as townApproach,REPO_RAIL_LOOP_TURNOUT_X as turnoutX,
  REPO_RAIL_GAME_WAYS as extra,polylineMetres as length,railTopAtGamePoint} from '../src/world/town-rail-continuation-route.js';
const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const close=(a,b,msg)=>assert(d(a,b)<.002,msg+': '+a+' vs '+b);
assert.equal(C.gauge,1.435);
assert.equal(RAIL_GAUGE,C.gauge);
assert.equal(C.loopRadius,180,'minimum 180m turnout radius for modest freight speeds');
assert(C.lineSpeedKmh<=40&&C.loopSpeedKmh<=40);
assert.equal(C.mainZ,RAIL_Z);
assert.equal(C.mainWest,-398);
assert.equal(C.mainEast,398);
assert.equal(railTopAtGamePoint(-5000,-780),C.narromineRailTop,
 'OSM railway wheel alignment must remain untouched');
assert.equal(railTopAtGamePoint(-398,RAIL_Z),C.townRailTop,
 'fictional town running rail head must meet existing .277m tracks');
assert.equal(railTopAtGamePoint(0,RAIL_Z-360),C.townRailTop,
 'return loop wheels must not hover above its running rails');
assert(railTopAtGamePoint(-2100,-70)<C.narromineRailTop&&
  railTopAtGamePoint(-2100,-70)>C.townRailTop,
 'intermediate connector uses a smooth descending rail-head profile');

close(link[0],RAIL[7].pts.at(-1),'actual OSM railway endpoint');
close(link.at(-1),[C.mainWest,RAIL_Z],'mapped line arrives at Repo Town');
close(east[0],[C.mainEast,RAIL_Z],'east turn starts exactly at existing running rail');
close(east.at(-1),north[0],'north return connects to eastern curve');
close(north.at(-1),west[0],'west return connects to western curve');
close(west.at(-1),oval[0],'west curve reconnects to main line');
close(oval.at(-1),oval[0],'oval is a CLOSED physical railway');
const lengths=[link,east,north,west,oval].map(length);
assert(lengths[0]>2750&&lengths[0]<3100,'compressed link has known finite length');
assert(Math.abs(lengths[1]-Math.PI*C.loopRadius)<1,'accurate eastern half-circle radius');
assert(Math.abs(lengths[3]-Math.PI*C.loopRadius)<1,'accurate western half-circle radius');
assert.equal(turnoutX,-298,'loop turnout is independently separated from connector by 100m');
assert(Math.abs(lengths[4]-(696+2*Math.PI*C.loopRadius+696))<2,'full 180m-radius balloon-loop length');
for(const pts of [link,east,north,west,oval])
 for(let i=1;i<pts.length;i++){
  const step=d(pts[i-1],pts[i]);
  assert(step>.001&&step<800,'nonzero linear track spans; no geometry spikes');
 }
for(let i=1;i<link.length;i++)assert(d(link[i-1],link[i])<18,'freight connector sampled <=18m');
// Stay north of the highway x -2870..-400 at z=-7, with a clear verge.
// No hidden unprotected level crossing was introduced by the new geometry.
const corridor=link.filter(p=>p[0]>=-2870&&p[0]<=-400);
assert(corridor.length>100);
assert(Math.max(...corridor.map(p=>p[1]))<=-24,'rail must remain >=17m north of highway');
assert(north.every(p=>p[1]===RAIL_Z-2*C.loopRadius));
assert(!RAIL_CROSSINGS.some(c=>Math.abs(north[0][1]-c.z)<8),
 'return leg cannot intersect any of six existing railway crossings');
assert.equal(extra.length,3);
assert(extra.every(w=>w.gameOnly&&w.limitKmh<=40));
close(townApproach[0],link.at(-1),'existing main rail continues from connector');
close(townApproach.at(-1),oval[0],'balloon return has a separate turnout');
assert.equal(d(link.at(-1),oval[0]),100,'distinct connector and return turnout');
// Graph must really allow a train to enter from the existing OSM railway
// and traverse the closed oval, not merely have scenery meeting at endpoints.
const net=buildRailNetwork([...RAIL,...extra]);
const nid=p=>net.nodes.find(v=>Math.hypot(v.x-p[0],v.z-p[1])<.002)?.id;
const mainEntry=nid(link.at(-1)),balloonTurnout=nid(oval[0]);
assert.equal(net.adj.get(mainEntry).size,2,
  'connector must meet exactly one onward rail, not fuse with the returning curve');
assert.equal(net.adj.get(balloonTurnout).size,3,
  'return loop joins the existing main at a REAL directed turnout, not at a false snap');
const last=RAIL[7].pts.slice(-4).map(nid);
assert(last.every(Number.isInteger));
const trace=createTrainPath(net,last,670);
const start=trace.pointAt(trace.s);
let entered=false,onNorth=false,returned=false,blocked=null;
for(let i=0;i<7000;i++){
 const result=trace.move(2,121,'straight');if(result.blocked){blocked=result.blocked;break;}
 const pos=trace.pointAt(trace.s);
 entered||=pos.x>C.mainWest&&Math.abs(pos.z-RAIL_Z)<4;
 onNorth||=pos.z<RAIL_Z-300&&pos.x>-500&&pos.x<500;
 returned||=onNorth&&pos.x>C.mainWest+50&&Math.abs(pos.z-RAIL_Z)<4;
}
assert.equal(blocked,null,'driver must never find an unmodelled dead end');
assert(entered&&onNorth&&returned,'freight must actually circulate and return to main line');
const linkWayIndex=RAIL.length;
assert(net.nodes.some(n=>n.x>C.mainEast+140&&n.z<RAIL_Z-90));
assert.equal(net.limitKmh(nid(link[0]),nid(link[1])),40,'route speed uses fictional speed label');
console.log('PASS connected real OSM eastern rail endpoint, smooth game connector, full 180m-radius closed Repository Town loop, graph train traversal and 1435mm gauge; original six crossings untouched');
