import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { CAFE_MENU, cafeAvailable } from '../src/world/cafe-menu.js';

const homes = [];
for (let r=0;r<7;r++) for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'Home',
    door:{x:(c-12.5)*26,z:r*46-157}});
const t=new TownLife({homes,minute:8*60,seed:20261020});
const cafe=t.place('cafe'),p=t.civic.player;
const barista=t.villagers.find(v=>v.work==='cafe');
barista.step={kind:'work',at:'cafe'}; barista.path=[];
assert.equal(CAFE_MENU.length,16);
assert.equal(new Set(CAFE_MENU.map(i=>i.id)).size,CAFE_MENU.length);
assert(CAFE_MENU.every(i=>i.price>0 && Object.keys(i.ingredients).length>0));
p.wallet=100;
p.hunger=80;
Object.assign(cafe.stock,{coffee:5,milk:5,bread:5,eggs:5,veg:5,pie:3,fruit:5,tea:5});
const order=CAFE_MENU.find(i=>i.id==='flat-white');
assert(cafeAvailable(cafe,order));
const wallet=p.wallet,stock={...cafe.stock},sales=t.stats.meals;
assert.match(t.orderCafe('flat-white'),/Served Flat white/);
assert.equal(p.wallet,wallet-order.price);
assert.equal(cafe.stock.coffee,stock.coffee-1);
assert.equal(cafe.stock.milk,stock.milk-1);
assert(p.hunger<80);
assert.equal(t.stats.meals,sales+1);
p.wallet=0;
const before={...cafe.stock};
assert.match(t.orderCafe('latte'),/need \$5/);
assert.deepEqual(cafe.stock,before,'unaffordable purchases must not consume stock');
p.wallet=100;
cafe.stock.coffee=0;
const w=p.wallet;
assert.match(t.orderCafe('espresso'),/sold out/);
assert.equal(p.wallet,w,'sold-out order cannot charge money');
assert.match(t.orderCafe('not-real'),/not on the cafe menu/);
t.minute=17*60;
assert.match(t.orderCafe('toast'),/closed/);
console.log('Café menu, purchase, stock, wallet, hunger and refusal checks passed.');

