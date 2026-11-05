// DANDALOO-001/1.1: non-mutating evidence of mapped-road static contacts.
// Reproduces the sampling/probe contract from road-drive-collisions-browser.mjs.
// No collision bypasses or changes to game geometry, roads, gates or buildings.
import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { CORE_ROADS } from '../src/world/masterplan-model.js';
import { PLAN_ROADS } from '../src/world/masterplan-built.js';
import { HIGHWAY, STREETS, RAIL, BUILDINGS, FILL_HOUSES, FILL_SHOPS,
  DETAILED, polyRect, boundaryColliders } from '../src/world/narromine-layout.js';
import { NARROMINE_TREES } from '../src/world/narromine-trees-data.js';
import { NARROMINE_FURNITURE } from '../src/world/narromine-furniture-data.js';
import { buildDisjointRoadSurfaces } from '../src/world/narromine-road-surfaces.js';

const base = process.env.TOWN_URL || 'http://127.0.0.1:8091/';
const dir = 'test-results/narromine-road-contact-evidence';
const historic = 239;
const radius = 1.12;
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const originalBase = process.env.AUDIT_PINNED_BASELINE || '11bbf2c53164c5e21a24ed9b8173e07b90148dfc';
fs.mkdirSync(dir, { recursive: true });
assert(/^[a-f0-9]{40}$/.test(sourceSha), 'pin a complete source SHA');
const roads = [
  ...CORE_ROADS.map((r) => ({ id: r.id, name: r.name || r.id, kind: 'core', width: r.width, a: r.a, b: r.b })),
  ...PLAN_ROADS.map((r) => ({ id: r.id, name: r.name || r.id, kind: 'plan', width: r.width, a: r.a, b: r.b })),
  ...STREETS.map((r, i) => ({ id: 'narromine-' + i + ':' + r.name, name: r.name, kind: 'mapped', roadKind: r.kind, width: r.width, pts: r.pts })),
];
const round = (x) => +x.toFixed(2);
const fingerprint = (b) => ['x0','x1','z0','z1'].map((k) => Number(b[k]).toFixed(3)).join('|');
const catalog = new Map();
function index(b, source, sourceType, sourceConfidence = 'high_model_identity') {
  if (!b || !['x0','x1','z0','z1'].every((k) => Number.isFinite(b[k]))) return;
  const key = fingerprint(b);
  if (!catalog.has(key)) catalog.set(key, []);
  catalog.get(key).push({ source, sourceType, sourceConfidence });
}
for (const b of BUILDINGS) index(polyRect(b.pts), 'osm:' + b.osmIndex, 'mapped_osm_building');
for (let i = 0; i < FILL_HOUSES.length; i++)
  index(FILL_HOUSES[i].rect, 'microsoft_footprint:' + i, 'traced_footprint_estimated_height');
for (const s of FILL_SHOPS) index(s.rect, 'poi_estimated_shop:' + s.name, 'unverified_poi_shop');
for (const d of DETAILED) for (const part of [...(d.parts || []), ...(d.verandahs || [])])
  index(polyRect(part.pts), 'detailed:' + d.id + '/' + part.name, 'detailed_survey_interpretation');
for (const [i, b] of boundaryColliders().entries()) index(b, 'narromine_boundary:' + i, 'game_boundary');
for (let i = 0; i < NARROMINE_TREES.length; i++) {
  const [x, z, h] = NARROMINE_TREES[i];
  const tr = Math.min(.45, .12 + h * .015) + .1;
  index({ x0:x-tr, x1:x+tr, z0:z-tr, z1:z+tr }, 'lidar_tree_trunk:' + i, 'lidar_derived_tree');
}
for (let i = 0; i < NARROMINE_FURNITURE.poles.length; i++) {
  const [x, z] = NARROMINE_FURNITURE.poles[i];
  index({ x0:x-.25, x1:x+.25, z0:z-.25, z1:z+.25 }, 'osm_power_pole:' + i, 'mapped_pole');
}
for (let i = 0; i < NARROMINE_FURNITURE.towers.length; i++) {
  const [x, z] = NARROMINE_FURNITURE.towers[i];
  index({ x0:x-2.6, x1:x+2.6, z0:z-2.6, z1:z+2.6 }, 'osm_power_tower:' + i, 'mapped_power_tower');
}
function pointSegmentDistance(x,z,a,b) {
  const dx=b[0]-a[0],dz=b[1]-a[1],len=dx*dx+dz*dz || 1;
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/len));
  return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
}
const railwaySegments = RAIL.flatMap((r) => r.pts.slice(1).map((b,i) => [r.pts[i], b]));
const nearRail = (x,z) => railwaySegments.some(([a,b]) => pointSegmentDistance(x,z,a,b) < 9);

function onPolygon(pts,x,z) {
  let inside=false;
  for (let i=0,j=pts.length-1;i<pts.length;j=i++) {
    const [xi,zi]=pts[i], [xj,zj]=pts[j];
    if ((zi>z)!==(zj>z) && x<(xj-xi)*(z-zi)/(zj-zi)+xi) inside=!inside;
  }
  return inside;
}
// Recreate the renderer's segment classification (mapped gravel segments are
// still passable road ribbons), including its highway cut-out and kerb fillets.
const nearLine=(lines,x,z,m)=>lines.some((pts)=>pts.some((b,i)=>i>0 &&
  pointSegmentDistance(x,z,pts[i-1],b)<m));
const surfaceStreets=STREETS.flatMap((st)=>{
  const runs=[];let cur=null;
  for(let i=1;i<st.pts.length;i++) {
    const a=st.pts[i-1],b=st.pts[i];
    const unpaved=nearLine(NARROMINE_FURNITURE.unpaved,(a[0]+b[0])/2,(a[1]+b[1])/2,3);
    if(!cur || cur.unpaved!==unpaved){cur={unpaved,pts:[a]};runs.push(cur);}
    cur.pts.push(b);
  }
  return runs.map((r)=>({...st,kind:r.unpaved?'track':st.kind,pts:r.pts}));
});
const modeledSurfaces=buildDisjointRoadSurfaces(surfaceStreets,{highway:HIGHWAY});
const roadSurfaceQuads=[...modeledSurfaces.asphalt,...modeledSurfaces.fillets].map((p)=>{
  const b=polyRect(p.pts);
  return {...p,b};
});
const tileSize=32,tiles=new Map();
for(let i=0;i<roadSurfaceQuads.length;i++){
  const {b}=roadSurfaceQuads[i];
  for(let gx=Math.floor(b.x0/tileSize);gx<=Math.floor(b.x1/tileSize);gx++)
    for(let gz=Math.floor(b.z0/tileSize);gz<=Math.floor(b.z1/tileSize);gz++){
      const key=gx+','+gz;
      if(!tiles.has(key)) tiles.set(key,[]);
      tiles.get(key).push(i);
    }
}
function surfaceAt(x,z) {
  for(const id of tiles.get(Math.floor(x/tileSize)+','+Math.floor(z/tileSize)) || []){
    const {b,pts,kind}=roadSurfaceQuads[id];
    if(x>=b.x0 && x<=b.x1 && z>=b.z0 && z<=b.z1 && onPolygon(pts,x,z))
      return kind==='track'?'modelled_unsealed_track':'modelled_paved_carriageway';
  }
  return 'not_in_rendered_carriageway_polygon';
}
function classify(hit) {
  const collider=hit.collider;
  const sources=catalog.get(fingerprint(collider)) || [];
  const rail=nearRail(hit.x,hit.z);
  let status = 'UNATTRIBUTED_STATIC_COLLIDER';
  if(sources.some((s)=>s.sourceType.includes('building')||s.sourceType.includes('footprint')||s.sourceType.includes('shop')||s.sourceType.includes('interpretation')))
    status=collider.poly ? 'MODELLED_BUILDING_POLYGON_CONTACT' : 'MODELLED_BUILDING_AABB_CONTACT_REVIEW';
  else if(sources.some((s)=>s.sourceType.includes('tree')||s.sourceType.includes('pole')||s.sourceType.includes('tower')))
    status='MODELLED_STREET_OBJECT_CONTACT_REVIEW';
  else if(sources.some((s)=>s.sourceType==='game_boundary')) status='GAME_BOUNDARY_CONTACT_REVIEW';
  if(rail) status+=';RAIL_PROXIMITY_PROTECT';
  const modelledSurface = surfaceAt(hit.x,hit.z);
  return {...hit,sourceCandidates:sources,colliderSource:sources.length===1?sources[0].source:sources.length>1?'AMBIGUOUS':'UNMATCHED',
    sourceConfidence:sources.length===1?'high_model_identity_not_field_verified':sources.length?'ambiguous_model_identity':'unknown',
    collisionGeometry:collider.poly?'polygon_narrowphase':'axis_aligned_bounds',
    surfaceClassification:modelledSurface,railProximity:rail,reviewStatus:status,
    siteTruth:'UNVERIFIED_no_field_survey_or_safety_clearance',isProvenFalsePositive:false};
}
const csvCell = (v) => '"'+String(v==null?'':v).replace(/"/g,'""')+'"';
const headers = ['sourceSha','device','road','roadName','kind','roadKind','width','x','z','lateral','samplePosition',
  'surfaceClassification','colliderSource','sourceConfidence','collisionGeometry','railProximity','reviewStatus',
  'x0','x1','z0','z1','colliderHasPoly','colliderTop','sourceCandidates','siteTruth'];
function csvRow(h,device) {
  const a={...h,device,sourceSha,colliderHasPoly:!!h.collider.poly,colliderTop:h.collider.top,
    x0:h.collider.x0,x1:h.collider.x1,z0:h.collider.z0,z1:h.collider.z1,
    sourceCandidates:h.sourceCandidates.map((s)=>s.source).join('|')};
  return headers.map((k)=>csvCell(a[k])).join(',');
}
const reports=[];
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try {
  for(const [device,config] of [['desktop',{viewport:{width:1280,height:800}}],['pixel7',{...devices['Pixel 7']}]]) {
    const context=await browser.newContext(config), page=await context.newPage(),errors=[];
    page.on('pageerror',(err)=>errors.push(err.message));
    page.on('crash',()=>errors.push('PAGE_CRASH'));
    try {
      await page.goto(base,{waitUntil:'domcontentloaded',timeout:110000});
      await page.waitForFunction(()=>window.__town && document.getElementById('loading')?.hidden,null,{timeout:110000});
      const result=await page.evaluate((roads)=>{
        const hits=[];let sampled=0,onRoad=0;
        for(const road of roads) {
          const pts=road.pts || [[road.a.x,road.a.z],[road.b.x,road.b.z]];
          for(let i=1;i<pts.length;i++) {
            const [ax,az]=pts[i-1],[bx,bz]=pts[i],dist=Math.hypot(bx-ax,bz-az);
            if(dist<.001)continue;
            const perp=[-(bz-az)/dist,(bx-ax)/dist],steps=Math.ceil(dist/3);
            for(let s=0;s<=steps;s++) {
              const t=s/steps;
              for(const lateral of [0,-1.6,1.6]) {
                const x=ax+(bx-ax)*t+perp[0]*lateral,z=az+(bz-az)*t+perp[1]*lateral;
                sampled++;
                if(!window.__town.onRoad(x,z))continue;
                onRoad++;
                const c=window.__town.probeStatic(x,z,1.12);
                if(c) hits.push({road:road.id,roadName:road.name,kind:road.kind,roadKind:road.roadKind||'',
                  width:road.width,x:+x.toFixed(2),z:+z.toFixed(2),lateral,
                  samplePosition:lateral===0?'mapped_centreline':'centreline_offset',
                  collider:{x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,top:c.top??null,poly:c.poly??null}});
              }
            }
          }
        }
        return {sampled,onRoad,hits,time:window.__town.state().time};
      },roads);
      const rows=result.hits.map(classify);
      const group=(arr,key)=>Object.entries(arr.reduce((acc,h)=>{const k=key(h);acc[k]=(acc[k]||0)+1;return acc;},{}))
        .sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
      const mapped=rows.filter((h)=>h.kind==='mapped'),core=rows.filter((h)=>h.kind==='core'),plan=rows.filter((h)=>h.kind==='plan');
      const summary={sourceSha,baselineSha:originalBase,device,browser:'Chromium Playwright',deviceMode:device==='pixel7'?'Pixel 7 browser emulation; not physical Android':'desktop 1280x800',
        historicalMappedContacts:historic,historicalSource:'PR #371, GitHub issue #398, source not this run',
        countDeltaFromHistorical:mapped.length-historic,sampledAll:result.sampled,onRoadSamples:result.onRoad,
        totalContacts:rows.length,mappedContacts:mapped.length,coreContacts:core.length,planContacts:plan.length,
        byRoad:group(rows,(h)=>h.road),byColliderSource:group(rows,(h)=>h.colliderSource),
        byModelSurface:group(rows,(h)=>h.surfaceClassification),byCollisionShape:group(rows,(h)=>h.collisionGeometry),
        byReviewStatus:group(rows,(h)=>h.reviewStatus),nearRailCount:rows.filter((h)=>h.railProximity).length,
        noModelledSurfaceCount:rows.filter((h)=>h.surfaceClassification==='not_in_rendered_carriageway_polygon').length,
        unmappedSourceCount:rows.filter((h)=>h.colliderSource==='UNMATCHED').length,
        appTime:result.time,errors,confidence:'collision from running game verified; real-world obstacle cause UNVERIFIED',
        observationsOnly:true};
      fs.writeFileSync(dir+'/'+device+'.json',JSON.stringify({summary,contacts:rows},null,2));
      fs.writeFileSync(dir+'/'+device+'.csv',[headers.join(','),...rows.map((h)=>csvRow(h,device))].join('\n')+'\n');
      await page.screenshot({path:dir+'/'+device+'-startup.png',fullPage:false});
      // Diagnostic eye-height frames for worst affected mapped-road sites; these
      // are teleported camera poses, not proof of a completed physical drive.
      const diagnosticRoads=group(mapped,(h)=>h.road).slice(0,5);
      for(let i=0;i<diagnosticRoads.length;i++) {
        const h=mapped.find((p)=>p.road===diagnosticRoads[i].name);
        await page.evaluate(({x,z})=>window.__town.place(x,z,0),{x:h.x,z:h.z});
        await page.waitForTimeout(260);
        await page.screenshot({path:dir+'/'+device+'-road-'+(i+1)+'.png'});
      }
      reports.push({summary,contacts:rows.map((h)=>({road:h.road,x:h.x,z:h.z,lat:h.lateral,source:h.colliderSource,status:h.reviewStatus}))});
      console.log('ROAD-EVIDENCE '+device+' SHA='+sourceSha+' total='+rows.length+' mapped='+mapped.length+
        ' core='+core.length+' plan='+plan.length+' (historic mapped='+historic+' delta='+summary.countDeltaFromHistorical+')');
      console.log('TOP-ROADS '+device+' '+JSON.stringify(summary.byRoad.slice(0,18)));
      console.log('SOURCE-GROUPS '+device+' '+JSON.stringify(summary.byColliderSource.slice(0,24)));
      assert.equal(errors.length,0,'WebGL runtime errors '+device+': '+errors.join('; '));
      assert.equal(core.length,0,'known core roads should remain clear');
      assert.equal(plan.length,0,'known planned roads should remain clear');
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  fs.writeFileSync(dir+'/summary.json',JSON.stringify(reports.map((r)=>r.summary),null,2));
}
assert.equal(reports.length,2,'desktop and Pixel7 both completed');
const signature=(rows)=>rows.map((r)=>[r.road,r.x,r.z,r.lat,r.source].join('|')).sort().join('\n');
assert.equal(signature(reports[0].contacts),signature(reports[1].contacts),
  'static road-contact probes must agree between desktop and Pixel7 browser emulation');
console.log('ROAD-EVIDENCE PASS desktop and Pixel7 reproducible; no geometry/collision edits');
