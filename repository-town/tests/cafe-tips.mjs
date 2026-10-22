// Café: skim milk orders must be made with the skim jug, and quick service earns a $1 tip that
// moves from the customer's wallet to the visitor's; slow service earns none.
//   node tests/cafe-tips.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {useCafe,queueCafeCustomer} from '../src/world/workplay.js';
import {orderRecipe} from '../src/world/work-recipes.js';

const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
function shift(){
 const t=new TownLife({homes,minute:10*60,seed:5});t.playerAt='cafe';t.place('cafe').till=200;
 for(const v of t.villagers)if(v.work==='cafe'){v.step={kind:'work',at:'cafe'};v.path=[];}
 const r=t.startJob('cafe-all-rounder');assert(r.ok,r.message);
 for(const g of ['coffee','milk','oatmilk','tea','bread','eggs','veg','pie','fruit'])t.place('cafe').stock[g]=50;
 return t;
}
const serve=(t,o)=>{
 const r=orderRecipe(o);if(r.hasMilk)assert(useCafe(t,'milk',o.milk).ok);
 for(const step of r.steps){const station=step[3]||(['food','oven'].includes(r.kind)?'kitchen':'barista');assert(useCafe(t,'prepare',station).mini);assert(useCafe(t,'finish-step',step[0],.9).ok);}
 assert(useCafe(t,'collect').ok);return useCafe(t,'deliver',o.table);
};
const customer=(t,v)=>{v.wallet=60;v.path=[];v.inside=true;v.step={kind:'eatout',at:'cafe',queue:{joined:1}};return v;};

// 1. Some customers ask for skim; the dairy jug is refused for them.
{
 const t=shift();let skim=null;
 for(const v of t.villagers.filter(v=>v.work!=='cafe')){customer(t,v);const o=queueCafeCustomer(t,v);if(!o)continue;if(o.milk==='skim'&&orderRecipe(o).hasMilk){skim=o;break;}o.state='cancelled';delete v.step.workTicket;}
 assert(skim,'a customer orders a milk drink with skim');assert(/skim milk/.test(orderRecipe(skim).name));
 assert(useCafe(t,'take',skim.customer).ok);assert(!useCafe(t,'milk','dairy').ok,'full-cream jug refused for a skim ticket');assert(useCafe(t,'milk','skim').ok);
}

// 2. Quick service: $1 tip from the customer to the visitor; total money unchanged.
{
 const t=shift(),v=customer(t,t.villagers.find(v=>v.work!=='cafe')),o=queueCafeCustomer(t,v);assert(useCafe(t,'take',v.id).ok);
 const before=v.wallet,mine=t.civic.player.wallet,price=orderRecipe(o).price,till=t.place('cafe').till;
 const r=serve(t,o);assert(r.ok&&/\$1 tip/.test(r.message),r.message);
 assert.equal(v.wallet,before-price-1);assert.equal(t.civic.player.wallet,mine+1);assert.equal(t.civic.workplay.cafe.tips,1);
 assert.equal(Math.round((t.place('cafe').till-till)*100),Math.round((price-Math.round(price*t.civic.taxRate*100)/100)*100),'the café still takes the full price');
}

// 3. Slow service: no tip.
{
 const t=shift(),v=customer(t,t.villagers.find(v=>v.work!=='cafe')),o=queueCafeCustomer(t,v);assert(useCafe(t,'take',v.id).ok);
 o.created-=Math.ceil((o.patience||90)/2)+1;const mine=t.civic.player.wallet,r=serve(t,o);
 assert(r.ok&&!/tip/.test(r.message));assert.equal(t.civic.player.wallet,mine);
}
console.log('PASS: skim orders need the skim jug; quick service tips $1 customer → visitor with the café paid in full; slow service earns no tip');
