// Pub meals are made from real deliveries. No infinite prepared meals.
import { receipt } from './jobs.js';

export const PUB_MENU=Object.freeze([
{id:'lamb-roast',name:'Roast lamb and vegetables',price:24,ingredients:{lamb:2,veg:2},hunger:62},
{id:'lamb-pie',name:'Meat pie and vegetables',price:18,ingredients:{pie:1,veg:1},hunger:50},
{id:'pie-roll',name:'Meat pie and bread',price:14,ingredients:{pie:1,bread:1},hunger:48},
{id:'lamb-sandwich',name:'Hot lamb sandwich',price:17,ingredients:{lamb:1,bread:2},hunger:45},
{id:'garden-plate',name:'Garden vegetable plate',price:15,ingredients:{veg:2},hunger:36},
{id:'veg-sandwich',name:'Vegetable sandwich',price:12,ingredients:{veg:1,bread:2},hunger:40},
{id:'bread-side',name:'Side of bread',price:5,ingredients:{bread:1},hunger:19},
]);
export function pubAvailable(pub,item){
 return Object.entries(item.ingredients).every(([g,n])=>(pub.stock[g]||0)>=n);
}
export function orderPub(t,id){
 const item=PUB_MENU.find(x=>x.id===id),p=t.place('pub'),me=t.civic.player;
 if(!item)return 'That dish is not on the pub menu.';
 if(!t.open(p))return 'The Merged Branch is closed. It opens at 11:00.';
 if(!pubAvailable(p,item))return item.name+' is sold out until the next delivery.';
 if(me.wallet<item.price)return 'You need $'+item.price+' but only have $'+me.wallet+'.';
 for(const [good,n] of Object.entries(item.ingredients))p.stock[good]-=n;
 me.wallet-=item.price;
 t.sale(p,item.price);
 receipt(t,'purchase',item.name+' at The Merged Branch',-item.price);
 me.hunger=Math.max(0,(me.hunger??0)-item.hunger);
 me.lastAte=item.name+' (Day '+t.day+' '+t.time()+')';
 t.stats.meals++;
 t.stats.sold[id]=(t.stats.sold[id]||0)+1;
 t.rubbish(1);
 t.log('The visitor ordered '+item.name+' at The Merged Branch.');
 return 'Served '+item.name+' for $'+item.price+'. Hunger: '+Math.round(me.hunger)+'%.';
}
