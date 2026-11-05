// Physical, explicitly fictional railway connector between the real OSM
// Narromine Main Western Line geometry and the invented Repository Town.
// Narromine OSM segments are unchanged. Because the game's road journey is
// compressed ~40 km -> 2.5 km, this off-map railway ALIGNMENT is illustrative,
// not a mapped ARTC/CRN route or a claim about a real train service.
// All coordinates are game-world metres, x east, z south.
import {RAIL} from './narromine-layout.js';
import {RAIL_Z,RAIL_GAUGE} from './rail-corridor.js';

export const REGIONAL_RAIL_GEOMETRY=Object.freeze({
  gauge:RAIL_GAUGE, mainWest:-398, mainEast:398, mainZ:RAIL_Z,
  loopRadius:180, approachTurnRadius:300,
  lineSpeedKmh:40, loopSpeedKmh:35,
  // Existing Repo main railhead is at .222+.11/2 = .277 m.
  townRailTop:.277, narromineRailTop:.49,
});

const pair=p=>Object.freeze([+p[0].toFixed(5),+p[1].toFixed(5)]);
const point=(x,z)=>pair([x,z]);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export const polylineMetres=pts=>pts.slice(1).reduce((n,p,i)=>n+distance(pts[i],p),0);
const {mainWest:west,mainEast:east,mainZ:z,loopRadius:R,approachTurnRadius:turnR}=REGIONAL_RAIL_GEOMETRY;

// Derive the connection point and eastbound tangent from the current actual
// OSM Main Western line, rather than storing another guessed coordinate.
const osmEast=RAIL[7]?.pts.at(-1),osmBefore=RAIL[7]?.pts.at(-2);
if(!osmEast||!osmBefore)throw Error('Main Western Line east-end geometry is unavailable');
const start=point(...osmEast), heading=Math.atan2(osmEast[1]-osmBefore[1],osmEast[0]-osmBefore[0]);
if(!(heading>0&&heading<.8&&start[0]<west-500))
  throw Error('OSM rail end moved: cannot safely extrapolate game connector');

function makeConnector(){
  const pts=[start];
  // First use a true 300m-radius horizontal turn from the mapped eastbound
  // tangent onto the compressed corridor. It stays on the northern side of
  // the nearby highway and avoids fabricating a new railway level crossing.
  const n=Math.ceil(turnR*heading/8);
  for(let i=1;i<=n;i++){
    const a=heading*(1-i/n);
    pts.push(point(start[0]+turnR*(Math.sin(heading)-Math.sin(a)),
      start[1]+turnR*(Math.cos(a)-Math.cos(heading))));
  }
  const arcEnd=pts.at(-1),remaining=west-arcEnd[0],m=Math.ceil(remaining/14);
  if(remaining<800)throw Error('Too little corridor to align railway safely');
  // Gentle, flat-ended S transition. Both ends have zero first and second
  // derivative: no unnatural kink at the Repository Town straight.
  for(let i=1;i<=m;i++){
    const t=i/m, smooth=t*t*t*(10+t*(-15+6*t));
    pts.push(point(arcEnd[0]+remaining*t,arcEnd[1]+(z-arcEnd[1])*smooth));
  }
  pts[pts.length-1]=point(west,z);
  return Object.freeze(pts);
}
export const REGIONAL_RAIL_CONNECTOR=makeConnector();
/** Rail-head elevation in metres. The real mapped Narromine rails are .49m
 * over datum, while Repository Town's existing running rails are .277m.
 * Carry the locomotive and wagons smoothly down to the already-built gauge
 * and avoid hovering wheels when they run the fictional balloon loop.
 * No change to rail surveying or to the OSM terrain elevation is asserted.
 */
export function railTopAtGamePoint(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return REGIONAL_RAIL_GEOMETRY.narromineRailTop;
 const startX=REGIONAL_RAIL_CONNECTOR[0][0],endX=REGIONAL_RAIL_CONNECTOR.at(-1)[0];
 if(x<=startX)return REGIONAL_RAIL_GEOMETRY.narromineRailTop;
 if(x>=endX)return REGIONAL_RAIL_GEOMETRY.townRailTop;
 const t=(x-startX)/(endX-startX);
 return REGIONAL_RAIL_GEOMETRY.narromineRailTop+
   (REGIONAL_RAIL_GEOMETRY.townRailTop-REGIONAL_RAIL_GEOMETRY.narromineRailTop)*t;
}


// A broad-radius (180 m) fictional "balloon" oval at the far, empty end of
// Repository Town. The SOUTH leg is the already-built main line and must NOT
// be redrawn (avoids coplanar flicker). The north leg stays well clear of the
// existing 6 road crossings and the separately buffered shunting siding.
function arc(cx,cz,from,to,steps){
  return Object.freeze(Array.from({length:steps+1},(_,i)=>{
    const a=from+(to-from)*i/steps;
    return point(cx+R*Math.cos(a),cz+R*Math.sin(a));
  }));
}
const centerZ=z-R,steps=Math.ceil(Math.PI*R/7);
export const REPO_RAIL_EAST_ARC=arc(east,centerZ,Math.PI/2,-Math.PI/2,steps);
// The connector reaches the pre-existing main at x=-398; a *different*
// correctly spaced turnout at x=-298 allows the balloon track to rejoin.
// Older geometry made the arc and connector run 0.5m apart and the OSM snap
// mistakenly fused them, despite no physical switch there.
export const REPO_RAIL_LOOP_TURNOUT_X=west+100;
export const REPO_RAIL_NORTH_RETURN=Object.freeze([point(east,z-2*R),point(REPO_RAIL_LOOP_TURNOUT_X,z-2*R)]);
export const REPO_RAIL_WEST_ARC=arc(REPO_RAIL_LOOP_TURNOUT_X,centerZ,-Math.PI/2,-3*Math.PI/2,steps);
export const REPO_RAIL_MAIN_APPROACH=Object.freeze([point(west,z),point(REPO_RAIL_LOOP_TURNOUT_X,z)]);
export const REPO_RAIL_OVAL=Object.freeze([
  point(REPO_RAIL_LOOP_TURNOUT_X,z),point(east,z),
  ...REPO_RAIL_EAST_ARC.slice(1),
  ...REPO_RAIL_NORTH_RETURN.slice(1),
  ...REPO_RAIL_WEST_ARC.slice(1),
]);
export const REPO_RAIL_ADDITIONS=Object.freeze([
  Object.freeze({id:'east-turn',pts:REPO_RAIL_EAST_ARC,railTop:REGIONAL_RAIL_GEOMETRY.townRailTop}),
  Object.freeze({id:'return-north',pts:REPO_RAIL_NORTH_RETURN,railTop:REGIONAL_RAIL_GEOMETRY.townRailTop}),
  Object.freeze({id:'west-turn',pts:REPO_RAIL_WEST_ARC,railTop:REGIONAL_RAIL_GEOMETRY.townRailTop}),
  Object.freeze({id:'narromine-link',pts:REGIONAL_RAIL_CONNECTOR,
    railTopAt:(i,n)=>REGIONAL_RAIL_GEOMETRY.narromineRailTop+
      (REGIONAL_RAIL_GEOMETRY.townRailTop-REGIONAL_RAIL_GEOMETRY.narromineRailTop)*i/(n-1)}),
]);
// These game-only lines are inserted into the train's track graph after the
// untouched OSM ways; speed and provenance are explicit, not falsely OSM-tagged.
export const REPO_RAIL_GAME_WAYS=Object.freeze([
  Object.freeze({pts:REGIONAL_RAIL_CONNECTOR,name:'Imagined Narromine–Repository Town connector (compressed map)',
    gameOnly:true,limitKmh:REGIONAL_RAIL_GEOMETRY.lineSpeedKmh}),
  Object.freeze({pts:REPO_RAIL_MAIN_APPROACH,
    name:'Repository Town main-line approach to separated balloon turnout',
    gameOnly:true,limitKmh:REGIONAL_RAIL_GEOMETRY.lineSpeedKmh}),
  Object.freeze({pts:REPO_RAIL_OVAL,name:'Repository Town fictional return loop',
    gameOnly:true,limitKmh:REGIONAL_RAIL_GEOMETRY.loopSpeedKmh}),
]);
