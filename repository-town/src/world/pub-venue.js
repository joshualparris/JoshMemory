// Fictional service/qualification records. No real credentials or town asset data.
export function pubVenue(life){
 life.civic ||= {};
 const s=life.civic.pubVenue ||= {version:1,staff:{},gasSource:'lpg',naturalAvailable:true,gasM3:0,lpgDepotKg:450,delivery:null,deliveries:[],mobileUp:true,radioUp:true,tvUp:true,handsetWh:12,radioWh:8,selfExcluded:false,kenoTraining:true,kenoPicks:[],kenoDraw:[],kenoRound:0,kenoNext:0,kenoPending:null,kenoMatches:null,kenoSession:0,alcoholDay:0,alcoholDrinks:0};
 s.alcoholDay ??= 0;s.alcoholDrinks ??= 0;
 for(const v of life.villagers||[])if(v.work==='pub'&&!s.staff[String(v.id)])s.staff[String(v.id)]={name:v.name,rsaUntil:1826,rcgUntil:1826,kenoInduction:true,actualCredential:false};
 return s;
}
export function validPubVenue(s){
 if(!s||s.version!==1||!s.staff||typeof s.staff!=='object'||Array.isArray(s.staff)||Object.keys(s.staff).length>50)return false;
 for(const v of Object.values(s.staff))if(!v||typeof v.name!=='string'||v.name.length>100||!Number.isInteger(v.rsaUntil)||!Number.isInteger(v.rcgUntil)||typeof v.kenoInduction!=='boolean'||v.actualCredential!==false)return false;
 if(!['lpg','natural'].includes(s.gasSource))return false;
 for(const k of ['naturalAvailable','mobileUp','radioUp','tvUp','selfExcluded','kenoTraining'])if(typeof s[k]!=='boolean')return false;
 for(const k of ['alcoholDay','alcoholDrinks'])if(s[k]!==undefined&&(!Number.isFinite(s[k])||s[k]<0||s[k]>1e9))return false;
 for(const k of ['gasM3','lpgDepotKg','handsetWh','radioWh','kenoRound','kenoNext','kenoSession'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1e9)return false;
 if(s.lpgDepotKg>450||s.handsetWh>12||s.radioWh>8)return false;
 const numbers=(a,max)=>Array.isArray(a)&&a.length<=max&&new Set(a).size===a.length&&a.every(x=>Number.isInteger(x)&&x>=1&&x<=80);
 if(!numbers(s.kenoPicks,10)||!numbers(s.kenoDraw,20)||(s.kenoPending!==null&&!numbers(s.kenoPending,10)))return false;
 if(s.kenoMatches!==null&&(!Number.isInteger(s.kenoMatches)||s.kenoMatches<0||s.kenoMatches>10))return false;
 if(s.delivery!==null&&(!s.delivery||!['lpg','conversion'].includes(s.delivery.kind)||!Number.isFinite(s.delivery.due)||!Number.isFinite(s.delivery.kg)||s.delivery.kg<0||s.delivery.kg>90))return false;
 return Array.isArray(s.deliveries)&&s.deliveries.length<=20&&s.deliveries.every(x=>typeof x==='string'&&x.length<300);
}
export function pubQualifiedStaff(life,kind='rsa'){
 const s=pubVenue(life);return (life.villagers||[]).filter(v=>v.work==='pub'&&v.step?.at==='pub'&&['work','preopen'].includes(v.step.kind)&&!(v.path?.length)&&s.staff[v.id]&&s.staff[v.id][kind+'Until']>(life.day||1)&&(kind!=='rcg'||s.staff[v.id].kenoInduction));
}
export function pubStaffRefusal(life,kind='rsa'){
 if(!Array.isArray(life.villagers))return null; // pure utility fixtures have no workforce
 return pubQualifiedStaff(life,kind).length?null:'Service refused: no on-site worker with a current simulated '+kind.toUpperCase()+' endorsement'+(kind==='rcg'?' and Keno induction':'')+'.';
}
const now=t=>(t.day||1)*1440+(t.minute||0);
export function pubVenueTick(life,minutes,power){
 const s=pubVenue(life),u=life.civic.pubUtilities;
 if(power){s.handsetWh=Math.min(12,s.handsetWh+.003*minutes);s.radioWh=Math.min(8,s.radioWh+.002*minutes)}else{s.handsetWh=Math.max(0,s.handsetWh-.0008*minutes);s.radioWh=Math.max(0,s.radioWh-.001*minutes)}
 if(s.delivery&&now(life)>=s.delivery.due){const d=s.delivery;s.delivery=null;if(d.kind==='conversion'){s.gasSource='natural';u.lpgValve=false;s.deliveries.unshift('Gasfitter scenario conversion completed; gas stays isolated until deliberately reopened.')}else{u.lpgKg+=d.kg;s.deliveries.unshift(d.kg+' kg LPG delivered from finite depot inventory.')}s.deliveries=s.deliveries.slice(0,20)}
 if(s.kenoPending&&now(life)>=s.kenoNext){const draw=Array.from({length:80},(_,i)=>i+1);for(let i=0;i<20;i++){const j=i+Math.floor((life.rand?.()??.5)*(80-i));[draw[i],draw[j]]=[draw[j],draw[i]]}s.kenoDraw=draw.slice(0,20).sort((a,b)=>a-b);s.kenoMatches=s.kenoPending.filter(x=>s.kenoDraw.includes(x)).length;s.kenoPending=null;s.kenoRound++}
}
export function pubVenueAction(life,action){
 const s=pubVenue(life),u=life.civic.pubUtilities;
 if(action==='order-lpg'){if(s.delivery)return 'A service order is already in progress.';if(u.lpgKg>45)return 'Delivery refused: a 45 kg exchange would exceed the 90 kg scenario capacity.';if(s.lpgDepotKg<45)return 'The regional depot has no remaining exchange cylinders.';s.lpgDepotKg-=45;s.delivery={kind:'lpg',kg:45,due:now(life)+120};return '45 kg reserved from regional depot; arrival in 120 town minutes. Timed logistics, not a surveyed truck route.'}
 if(action==='convert-gas'){if(s.delivery)return 'A service order is already in progress.';if(s.gasSource==='natural')return 'Appliances are already on the natural-gas scenario.';u.lpgValve=false;s.delivery={kind:'conversion',kg:0,due:now(life)+60};return 'Gas isolated for 60-minute gasfitter conversion scenario. LPG and natural-gas injectors are not interchangeable.'}
 const toggles={natural:'naturalAvailable',mobile:'mobileUp',radio:'radioUp',tv:'tvUp',exclude:'selfExcluded',kenoTraining:'kenoTraining'};
 if(toggles[action]){s[toggles[action]]=!s[toggles[action]];if(action==='exclude'&&s.selfExcluded)s.kenoPending=null;return action+' scenario changed.'}
 const m=/^(rsa|rcg):(.+)$/.exec(action);if(m&&s.staff[m[2]]){const p=s.staff[m[2]],k=m[1]+'Until';p[k]=p[k]>(life.day||1)?0:(life.day||1)+1825;return 'Fictional '+m[1].toUpperCase()+' record updated for '+p.name+'. No genuine qualification is issued.'}
 return 'Unknown venue action.';
}
export function kenoTicket(life,power,network){
 const s=pubVenue(life),o=life.civic.pubStandards;
 if(!o?.verifiedAdult)return 'Adult ID must be checked before the Keno demonstration.';
 if(o.intoxicated||o.alarm||o.gasLeak||s.selfExcluded)return 'Keno unavailable: intoxication, emergency or self-exclusion.';
 if(!power||!network)return 'Keno terminal needs mains electricity and the operator network.';
 const refusal=pubStaffRefusal(life,'rcg');if(refusal||!s.kenoTraining)return refusal||'Operator induction is not recorded.';
 if(s.kenoPending)return 'A ticket is already waiting for the next draw.';
 if(s.kenoSession>=5)return 'Five-round session limit reached. Take a break; no autoplay or repeat tickets.';
 if(s.kenoPicks.length<1)return 'Select between one and ten distinct numbers.';
 s.kenoPending=[...s.kenoPicks];s.kenoSession++;s.kenoNext=(Math.floor(now(life)/3)+1)*3;return 'Free demonstration ticket recorded for the next three-minute draw. No money, prizes or gambling account.';
}

export function drinkPubBeer(life,good){const me=life.civic.player,s=pubVenue(life),o=life.civic.pubStandards;if(!(me.bag[good]>0))return 'You have no carried beer to drink.';if(!o?.verifiedAdult)return 'Adult ID has not been checked in this scenario.';if(o.intoxicated)return 'Choose water instead; the patron is flagged intoxicated.';if(s.alcoholDay!==life.day){s.alcoholDay=life.day;s.alcoholDrinks=0}const ml=good==='pub_beer'?425:375,standard=ml*.048*.789/10;me.bag[good]--;s.alcoholDrinks+=standard;if(s.alcoholDrinks>=4)o.intoxicated=true;return 'Consumed '+ml+' mL at fictional 4.8% ABV: '+standard.toFixed(2)+' Australian standard drinks. Session '+s.alcoholDrinks.toFixed(2)+'. This is not a BAC or fitness-to-drive estimate; the game applies a conservative service cap.';}
