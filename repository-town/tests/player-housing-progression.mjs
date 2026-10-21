// Regression for fresh-save shelter, signed-tenancy bills and sleeping rights.
// All housing money and sleep consequences use the normal TownLife simulation.
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({
 coordinate:String.fromCharCode(65+c)+(r+1),name:'House',
 door:{x:(c-12.5)*26,z:r*46-157}
});
const fresh=()=>new TownLife({homes,minute:18*60,seed:26021});
const candidate=life=>{
 const p=Object.values(life.civic.property.parcels).find(p=>p.kind==='house'&&!p.tenant)||
   Object.values(life.civic.property.parcels).find(p=>p.kind==='house');
 assert(p,'must have an eligible house');
 p.owner='Town Property Cooperative';p.tenant=null;p.occupied=false;
 return p;
};
let t=fresh();
assert.match(t.sleepHome('A1'),/belongs to someone else|Rent or buy/);
const beginning=t.civic.player.wallet+t.civic.player.bank;
for(let i=0;i<900;i++)t.tick(.5); // Pass midnight without signing a lease.
assert.equal(t.civic.finance.visitorPaid,0,'no unauthorised housing or utility bills');
assert.equal(t.civic.finance.rentArrears,0,'no phantom rent arrears');
assert.equal(t.civic.finance.powerArrears,0,'no phantom electricity arrears');
assert.equal(t.civic.player.wallet+t.civic.player.bank,beginning,'no invisible player charges');
// Lease one actually vacant home, pay a real bond, then use its bed.
t=fresh();const p=candidate(t);t.civic.player.wallet=1200;
const pre=t.civic.player.wallet+t.civic.player.bank;
assert.match(t.leaseProperty(p.id),/Lease signed/);
assert.equal(t.civic.property.playerLease,p.id);
assert.equal(pre-(t.civic.player.wallet+t.civic.player.bank),p.rent*28,'lease bond escrowed once');
assert.match(t.sleepHome(p.address),/You slept/);
assert(t.civic.finance.visitorPaid>0,'signed lease billed rent and electricity');
const snapshot=JSON.parse(JSON.stringify(t.snapshot())),loaded=fresh();
assert(loaded.restore(snapshot),'signed occupancy survives save and restore');
assert.equal(loaded.civic.property.playerLease,p.id);
loaded.minute=19*60;
assert.match(loaded.sleepHome(p.address),/You slept/);
// Lease termination revokes bed access immediately.
assert.match(loaded.endLease(),/Lease ended/);
assert.match(loaded.sleepHome(p.address),/belongs to someone else|Rent or buy/);
// Settlement grants occupancy if vacant; a continuing tenant retains their right.
t=fresh();const owned=candidate(t);owned.listed=true;t.civic.player.wallet=12000;
assert.match(t.buyProperty(owned.id),/Settlement complete/);
assert.match(t.sleepHome(owned.address),/You slept/);
owned.tenant='Existing resident';
assert.match(t.sleepHome(owned.address),/belongs to someone else|Rent or buy/);
console.log('PASS: no phantom daily rent, signed bond, home sleep, saved lease, revoked access, vacant-owner access and tenanted-owner privacy');
