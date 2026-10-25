import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=file=>JSON.parse(readFileSync(new URL(file,import.meta.url),'utf8'));
const a=load('../dist/public/houses.json');
const b=load('../dist/private/houses.json');
const expected={A3:'Elizabeth Farm',N3:'Monticello',T2:'Vaucluse House',I7:'Fallingwater'};
assert.equal(a.houses.length,b.houses.length,'No home removed');
for(const [id,name] of Object.entries(expected)){
 const publicH=a.houses.find(h=>h.coordinate===id);
 const privateH=b.houses.find(h=>h.coordinate===id);
 assert(publicH&&privateH,id+' preserved in both builds');
 assert.equal(publicH.name,name,'Public heritage name at '+id);
 assert.equal(publicH.repo,null,'No private GitHub link at '+id);
 assert.equal(publicH.heritage,true,'Heritage flag '+id);
 assert(publicH.links.length===2&&publicH.links.every(l=>l.url.startsWith('https://')&&!l.url.includes('github.com/')));
 assert(!JSON.stringify(publicH).includes(privateH.name),'Private project name must not appear at '+id);
 assert(!JSON.stringify(publicH).includes(privateH.repo),'Private slug must not appear at '+id);
 assert(publicH.int.rooms.some(r=>r.props.some(p=>p[2]?.do==='npc')),'Guide available at '+id);
 assert(publicH.int.rooms.some(r=>r.props.some(p=>p[2]?.do==='link')),'Official source link at '+id);
 assert.notEqual(privateH.name,name,'Private local edition unchanged at '+id);
 console.log('PASS public house',id,name,'rooms',publicH.int.rooms.length);
}
const publicMemorial=a.houses.find(h=>h.coordinate==='C2');
const privateMemorial=b.houses.find(h=>h.coordinate==='C2');
assert.deepEqual(publicMemorial.name,privateMemorial.name);
assert.deepEqual(publicMemorial.ext,privateMemorial.ext);
console.log('PASS memorial C2 unchanged; public housing privacy and layout verified.');
