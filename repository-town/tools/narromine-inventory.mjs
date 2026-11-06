// Reproducible Narromine inventory from mapped sources; no external requests, no photo downloads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NARROMINE_OSM } from '../src/world/narromine-osm-data.js';
import { NARROMINE_BUILDINGS } from '../src/world/narromine-buildings-data.js';
import { NARROMINE_LIDAR } from '../src/world/narromine-lidar-data.js';
const makeInventory = function makeInventory(osm,sites,lidar,prior=null,ownership=null){
const R=6371008.8*Math.PI/180,lonScale=R*Math.cos(osm.anchor.lat*Math.PI/180);
const rnd=(a,n=3)=>Number(a.toFixed(n)), geo=p=>[rnd(osm.anchor.lat-p[1]/R,7),rnd(osm.anchor.lon+p[0]/lonScale,7)],loc=p=>[(p[1]-osm.anchor.lon)*lonScale,-(p[0]-osm.anchor.lat)*R];
const center=pts=>pts.reduce((sum,p)=>[sum[0]+p[0]/pts.length,sum[1]+p[1]/pts.length],[0,0]);
const within=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
const heading=pts=>{let best=0,head=null;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz);if(d>best){best=d;head=rnd((Math.atan2(dx,-dz)*180/Math.PI+360)%180,1);}}return head;};
const fingerprint=pts=>{let h=2166136261,s=pts.map(p=>p.map(v=>rnd(v,1)).join(',')).sort().join(';');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,'0');};
const old=new Map((prior?.buildings||[]).filter(b=>b.sourceType==='osm').map(b=>[b.geometryFingerprint,b.id]));let next=1;for(const b of prior?.buildings||[]){let m=/^NR-OSM-(\d+)$/.exec(b.id);if(m)next=Math.max(next,Number(m[1])+1);}
const used=new Set();
const osmRecords=osm.buildings.map((b,i)=>{const p=b.pts,fp=fingerprint(p),id=old.get(fp)||(prior?'NR-OSM-'+String(next++).padStart(4,'0'):'NR-OSM-'+String(i+1).padStart(4,'0'));
if(used.has(id))throw Error('Duplicate OSM ID '+id);used.add(id);
const c=center(p),other=sites.filter(s=>within(c,s.boundary.map(loc))).map(s=>s.id),h=lidar['osm:'+i]||null,replacement=ownership?.osmReplacement?.[String(i)]||null;
return {id,sourceType:'osm',osmIndex:i,osmWayId:b.osmWayId||null,geometryFingerprint:fp,name:b.name||null,kind:b.kind||null,amenity:b.amenity||null,footprintLocal:p,footprintGeo:p.map(geo),centreGeo:geo(c),orientationDeg:heading(p),storeys:b.levels||null,roofType:null,
heightEvidence:h?{surveyYear:h[0],groundAHDm:h[1],eaveProxyM:h[2],ridgeProxyM:h[3],medianRoofM:h[4],points:h[5],density:h[6]}:null,
facade:{materials:[],colours:[],windows:null,doors:null,verandahs:null,signs:[]},photoReferences:[],provenance:[{source:'OpenStreetMap',licence:'ODbL 1.0'},...(h?[{source:'NSW Spatial Services LiDAR',licence:'CC BY 4.0'}]:[])],
rendering:{status:'Mapped',tier:'C',mode:replacement?'replaced by bespoke builder':(other.length?'covered by detailed site':'mapped extrusion'),siteIds:other,...(replacement?{renderer:[replacement.renderer],owner:replacement.owner,replacedBy:{precinct:replacement.precinct,mechanism:replacement.mechanism}}:{})},visualQa:{status:'not-reviewed'},uncertainty:['Street-level appearance and roof type unknown',...(h?[]:['No LiDAR measurement available'])],nextActions:['Obtain licensed ground-level photos','Check roof geometry and facade','Capture in-game viewpoint and compare']};});
const detailed=sites.map(s=>{const own=ownership?.detailedSites?.[s.id]||null;let parts=s.parts.map(p=>{let h=lidar[s.id+'|'+p.name]||null;return {name:p.name,footprintGeo:p.pts,storeys:p.storeys||null,roofType:p.roof||null,wallHeightM:p.wall||null,heightEvidence:h?{surveyYear:h[0],groundAHDm:h[1],eaveProxyM:h[2],ridgeProxyM:h[3],medianRoofM:h[4],points:h[5],density:h[6]}:null};});
let verandahs=s.verandahs.map(v=>{let h=lidar[s.id+'|'+v.name]||null;return {name:v.name,heightEvidence:h?{surveyYear:h[0],groundAHDm:h[1],eaveProxyM:h[2],ridgeProxyM:h[3],medianRoofM:h[4],points:h[5],density:h[6]}:null};});
const features=s.parts.flatMap(p=>p.features||[]);let cols=[...new Set(s.parts.map(p=>p.wallColour).filter(Number.isInteger).map(n=>'#'+n.toString(16).padStart(6,'0')))];
let c=center(s.boundary.map(loc));
return {id:'NR-SITE-'+s.id,siteId:s.id,sourceType:'detailed',name:s.name,address:s.address||null,lot:s.lot||null,footprintLocal:s.boundary.map(loc).map(p=>p.map(x=>rnd(x,2))),footprintGeo:s.boundary,centreGeo:geo(c),orientationDeg:heading(s.boundary.map(loc)),storeys:parts.length?Math.max(...parts.map(x=>x.storeys||0))||null:null,roofType:[...new Set(parts.map(x=>x.roofType).filter(Boolean))].join(', ')||null,parts,verandahs,
heightEvidence:null,facade:{materials:[],colours:cols,windows:features.filter(f=>f.kind==='window').length||null,doors:features.filter(f=>['door','archdoor'].includes(f.kind)).length||null,verandahs:s.verandahs.length,signs:features.filter(f=>f.kind==='sign').flatMap(f=>f.text||[])},photoReferences:[],
provenance:[{source:'NSW Spatial Services aerial/cadastre',licence:'CC BY 4.0'},{source:'Existing design notes',licence:'Photography rights unverified'},...(parts.some(p=>p.heightEvidence)||verandahs.some(v=>v.heightEvidence)?[{source:'NSW Spatial Services LiDAR',licence:'CC BY 4.0'}]:[])],
rendering:{status:'Modelled',tier:'A candidate',mode:s.id==='dandaloo-76'?'Kierath custom passage builder':'detailed site builder',siteIds:[],...(own?{renderer:own.renderers,owner:own.owner}:{})},visualQa:{status:'not-reviewed'},uncertainty:['No permission-checked ground-level photos catalogued','Current facade accuracy not visually reviewed',...(own?.uncertainty||[])],nextActions:['Acquire permitted multi-angle imagery','Verify entrance, roofline and shop signage','Compare against game screenshot']};});
const cells=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++){let n=osmRecords.filter(b=>{let [la,lo]=b.centreGeo;return la>=osm.bbox.minlat+(osm.bbox.maxlat-osm.bbox.minlat)*r/4&&la<(r===3?osm.bbox.maxlat+1e-7:osm.bbox.minlat+(osm.bbox.maxlat-osm.bbox.minlat)*(r+1)/4)&&lo>=osm.bbox.minlon+(osm.bbox.maxlon-osm.bbox.minlon)*c/4&&lo<(c===3?osm.bbox.maxlon+1e-7:osm.bbox.minlon+(osm.bbox.maxlon-osm.bbox.minlon)*(c+1)/4)}).length;cells.push({row:r,col:c,footprints:n,reviewCoverage:n<3});}
const missingPrior=(prior?.buildings||[]).filter(b=>b.sourceType==='osm'&&!osmRecords.some(n=>n.geometryFingerprint===b.geometryFingerprint)).map(b=>b.id);
return {schemaVersion:1,baselineDate:'2026-11-04',scope:'Current OSM export only; does NOT prove every real building in Narromine is mapped',licensing:'No unlicensed photo pixels or Street View downloads included',coordinateSystem:{source:'OSM local metres x east z south',anchor:osm.anchor},bbox:osm.bbox,counts:{osmFootprints:osmRecords.length,detailedSites:detailed.length,registerRecords:osmRecords.length+detailed.length,osmWithLidar:osmRecords.filter(x=>x.heightEvidence).length,detailedPartsWithLidar:detailed.reduce((n,s)=>n+s.parts.filter(x=>x.heightEvidence).length,0),detailedVerandahsWithLidar:detailed.reduce((n,s)=>n+s.verandahs.filter(x=>x.heightEvidence).length,0),roadSegments:osm.roads.length,namedPlaces:osm.places.length,photoReferences:0,visuallyVerified:0,rendererOwnedSites:detailed.filter(x=>x.rendering.renderer?.length).length,rendererReplacedOsm:osmRecords.filter(x=>x.rendering.mode==='replaced by bespoke builder').length},coverageAudit:{grid4x4:cells,missingPriorIds:missingPrior,knownGaps:['OSM footprint coverage incomplete; unrepresented real buildings need independent surveying','Game has procedural filler houses and shops without verified mapped geometry','No permission-cleared ground-level photography registered','2011 height data may not reflect 2026 buildings','Some OSM footprints are overlaid by a traced detailed site, not additional separate verified buildings','Other Narromine precincts beyond export bounding box require a separate import'],nextSurvey:['Compare NSW aerial with OSM extent block-by-block','Survey missing buildings without naming private residents','Extend coverage to aerodrome and other missing areas']},buildings:[...osmRecords,...detailed]};
};
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'data','narromine-building-inventory.json');
const prior=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
const ownershipFile=path.join(root,'data','narromine-renderer-ownership.json');
const ownership=JSON.parse(fs.readFileSync(ownershipFile,'utf8'));
// The renderer-ownership register must stay in lock-step with the source data.
for(const [id] of Object.entries(ownership.detailedSites||{})) if(!NARROMINE_BUILDINGS.some(s=>s.id===id)) throw Error('Unknown detailed site in renderer ownership: '+id);
for(const id of NARROMINE_BUILDINGS.map(s=>s.id)) if(!(ownership.detailedSites||{})[id]) throw Error('Detailed site missing from renderer ownership: '+id);
for(const [idx] of Object.entries(ownership.osmReplacement||{})){const n=Number(idx);if(!Number.isInteger(n)||n<0||n>=NARROMINE_OSM.buildings.length)throw Error('Unknown OSM index in renderer ownership: '+idx);}
const inventory=makeInventory(NARROMINE_OSM,NARROMINE_BUILDINGS,NARROMINE_LIDAR.heights,prior,ownership);
const references=JSON.parse(fs.readFileSync(path.join(root,'data','narromine-photo-references.json'),'utf8'));
const ids=new Set(inventory.buildings.map(b=>b.id));
for(const ref of references.records){
 if(!ref.reviewed||!ref.sourceUrl?.startsWith('https://commons.wikimedia.org/wiki/File:')||!/^CC BY 3\.0/.test(ref.licenceOrPermission)) throw Error('Reference metadata not reviewed: '+ref.id);
 for(const id of ref.buildingIds)if(!ids.has(id))throw Error('Unknown photo building ID: '+id);
}
for(const building of inventory.buildings){
 building.photoReferences=references.records.filter(r=>r.buildingIds.includes(building.id)).map(r=>r.id);
 if(building.photoReferences.length)building.uncertainty=building.uncertainty.map(v=>v==='No permission-checked ground-level photos catalogued'?'Only historical 2017 licensed imagery linked; more angles and present-day façade validation needed':v);
}
inventory.counts.photoReferences=references.records.length;
inventory.coverageAudit.knownGaps=inventory.coverageAudit.knownGaps.map(g=>g==='No permission-cleared ground-level photography registered'?'Only two 2017 permission-reviewed photo records are catalogued (one building-linked); current façade coverage remains unverified':g);
const out=JSON.stringify(inventory,null,2)+'\n';
if(process.argv.includes('--check')){
 if(!prior||fs.readFileSync(file,'utf8')!==out){console.error('Narromine inventory outdated; run node tools/narromine-inventory.mjs');process.exit(1)}
 console.log('PASS Narromine inventory',inventory.counts.registerRecords,'records');
}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,out);console.log('Generated',file)}
