// TownFinance: finite-money public finance, households, utilities and member credit.
// Monetary transfers post equal debit/credit entries. All rates are fictional
// Town Dollars chosen for a 24-minute game day, not real Australian rates.
const valid=n=>Number.isSafeInteger(n)&&n>0&&n<=100000;
const clamp=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e9?n:0;
export const ECONOMIC_RATES=Object.freeze({
  householdRent:8,householdPower:2,npcRent:5,
  businessRates:2,businessUtilities:3,payrollTaxPercent:10,
  annualLoanRatePercent:8,loanTermDays:30
});
const FOOD=Object.freeze({bread:25,pie:35,eggs:20,milk:15,veg:23,fruit:21,lamb:30});
export class TownFinance {
 constructor(life){
  this.life=life;
  this.bankCapital=5000; // pre-seeded cooperative equity; not conjured on each loan
  this.federalTreasury=25000; // Commonwealth tax / grant budget
  this.stateTreasury=15000; // NSW public health and education wages
  this.playerRentArrears=0;this.playerUtilityArrears=0;
  this.playerEnergy=75;this.playerMeals=0;
  this.loan=null;this.lastClosedDay=0;
  this.entries=[];this.sequence=0;
  this.daily={rates:0,utilities:0,rent:0,tax:0,councilSpending:0,stateSpending:0,grants:0,unpaidBills:0,interest:0};
  this.lifetime={...this.daily};
 }
 keyBalance(key){
  const l=this.life,m=l.money;
  if(key==='player.checking')return m.checking;
  if(key==='player.cash')return m.cash;
  if(key==='player.savings')return m.savings;
  if(key==='council')return l.treasury;
  if(key==='federal')return this.federalTreasury;
  if(key==='state')return this.stateTreasury;
  if(key==='bank.capital')return this.bankCapital;
  if(key.startsWith('business:')){
   const p=l.place(key.slice(9));return p?p.operating:undefined;
  }
  if(key.startsWith('register:')){
   const p=l.place(key.slice(9));return p?p.till:undefined;
  }
  if(key.startsWith('npc:')){
   const v=l.villagers.find(v=>String(v.id)===key.slice(4));
   return v?.wallet;
  }
  return undefined;
 }
 setBalance(key,value){
  const l=this.life,m=l.money;
  if(key==='player.checking'){m.checking=value;m.bankVault=m.checking+m.savings;return}
  if(key==='player.cash'){m.cash=value;return}
  if(key==='player.savings'){m.savings=value;m.bankVault=m.checking+m.savings;return}
  if(key==='council'){l.treasury=value;return}
  if(key==='federal'){this.federalTreasury=value;return}
  if(key==='state'){this.stateTreasury=value;return}
  if(key==='bank.capital'){this.bankCapital=value;return}
  if(key.startsWith('business:')){l.place(key.slice(9)).operating=value;return}
  if(key.startsWith('register:')){l.place(key.slice(9)).till=value;return}
  if(key.startsWith('npc:')){l.villagers.find(v=>String(v.id)===key.slice(4)).wallet=value}
 }
 record(from,to,amount,memo){
  this.entries.unshift({id:++this.sequence,day:this.life.day,time:this.life.minute,
    debit:String(from).slice(0,60),credit:String(to).slice(0,60),
    amount,memo:String(memo).slice(0,125)});
  if(this.entries.length>220)this.entries.length=220;
 }
 transfer(from,to,amount,memo){
  if(!valid(amount)||from===to)return {ok:false,reason:'Invalid transfer'};
  const before=this.keyBalance(from),target=this.keyBalance(to);
  if(!Number.isSafeInteger(before)||!Number.isSafeInteger(target)||before<amount)
    return {ok:false,reason:'Insufficient funds or missing account'};
  if(target+amount>1e9)return {ok:false,reason:'Account maximum exceeded'};
  this.setBalance(from,before-amount);
  this.setBalance(to,target+amount);
  this.record(from,to,amount,memo);
  return {ok:true,amount};
 }
 // A transfer may use business till or operating account but cannot overdraft.
 fromBusiness(site,to,amount,memo){
  if(!valid(amount))return false;
  const p=this.life.place(site);if(!p)return false;
  const available=clamp(p.operating)+clamp(p.till);
  if(available<amount)return false;
  const part=Math.min(clamp(p.operating),amount);
  if(part&&!this.transfer('business:'+site,to,part,memo).ok)return false;
  if(amount>part&&!this.transfer('register:'+site,to,amount-part,memo).ok)return false;
  return true;
 }
 incomeTax(gross){
  return valid(gross)?Math.floor(gross*ECONOMIC_RATES.payrollTaxPercent/100):0;
 }
 taxPlayerWage(gross){
  const amount=this.incomeTax(gross);
  if(!amount)return 0;
  if(this.transfer('player.checking','federal',amount,'Commonwealth PAYG on player wages').ok){
   this.addRevenue('tax',amount);return amount;
  }return 0;
 }
 taxNpcWage(worker,gross){
  const amount=this.incomeTax(gross);
  if(!amount)return 0;
  if(this.transfer('npc:'+worker.id,'federal',amount,'Commonwealth PAYG '+worker.name).ok){
   this.addRevenue('tax',amount);return amount;
  }return 0;
 }
 addRevenue(type,amount){
  this.daily[type]=(this.daily[type]||0)+amount;
  this.lifetime[type]=(this.lifetime[type]||0)+amount;
 }
 chargeHousehold(){
  const settle=(due,field,category)=>{
    let remaining=this[field]+due;
    let paid=0;
    for(const account of ['player.checking','player.cash']){
      const balance=this.keyBalance(account);
      const amount=Math.min(remaining,balance);
      if(amount>0&&this.transfer(account,'council',amount,'household '+category).ok){
        remaining-=amount;paid+=amount;
      }
    }
    this[field]=remaining;
    this.addRevenue(category,paid);
    if(remaining>0)this.daily.unpaidBills+=remaining;
  };
  settle(ECONOMIC_RATES.householdRent,'playerRentArrears','rent');
  settle(ECONOMIC_RATES.householdPower,'playerUtilityArrears','utilities');
  this.playerEnergy=Math.max(0,this.playerEnergy-17);
  if(this.playerEnergy<30)this.life.log('Your energy is low. Eat food you have bought, or visit the shop.');
 }

 chargeBusiness(site){
  const p=this.life.place(site);
  if(!p||p.kind==='farmhouse'||['hall','school','clinic','post','depot','square'].includes(site))return;
  for(const [type,rate]of [['rates',ECONOMIC_RATES.businessRates],['utilities',ECONOMIC_RATES.businessUtilities]]){
   if(this.fromBusiness(site,'council',rate,p.name+' '+type+' Day '+this.life.day)){
    this.addRevenue(type,rate);
    p.dailyExpenses=(p.dailyExpenses||0)+rate;
    p.lifetimeExpenses=(p.lifetimeExpenses||0)+rate;
   }else{
    p.unpaidBills=(p.unpaidBills||0)+rate;
    this.daily.unpaidBills+=rate;
   }
  }
 }
 chargeNpcHouseholds(){
  for(const v of this.life.villagers){
   const due=ECONOMIC_RATES.npcRent+(v.housingArrears||0);
   const available=clamp(v.wallet);
   const paid=Math.min(available,due);
   if(paid&&this.transfer('npc:'+v.id,'council',paid,'household rent '+v.name).ok){
    this.addRevenue('rent',paid);
   }
   v.housingArrears=due-paid;
   if(v.housingArrears>0)this.daily.unpaidBills+=v.housingArrears;
  }
 }
 // Bank loans are *funded from existing bank equity*, not fabricated deposits.
 borrow(amount){
  const m=this.life.money;
  if(![100,200,400].includes(amount))return {ok:false,message:'Available loans are $100, $200 or $400.'};
  if(!this.life.open(this.life.place('hall')))return {ok:false,message:'The Town Hall bank is closed. Return during teller hours.'};
  if(this.loan?.principal>0)return {ok:false,message:'Repay the existing loan first.'};
  if(this.playerRentArrears||this.playerUtilityArrears)return {ok:false,message:'Clear overdue household bills first.'};
  if(Object.keys(m.completedJobs).length===0)return {ok:false,message:'Complete paid work before applying for credit.'};
  if(this.bankCapital<amount)return {ok:false,message:'The bank lacks lending capital.'};
  if(amount>200&&m.earned<50)return {ok:false,message:'A larger loan requires at least $50 of recorded earnings.'};
  if(!this.transfer('bank.capital','player.checking',amount,'secured member loan principal').ok)
    return {ok:false,message:'Loan could not be settled.'};
  this.loan={principal:amount,interestCents:0,opened:this.life.day,due:this.life.day+ECONOMIC_RATES.loanTermDays,lastAccrued:this.life.day,lateDays:0};
  return {ok:true,message:'Loan of $'+amount+' credited. Repay principal plus 8% annual interest by day '+this.loan.due+'.'};
 }
 accrueLoan(){
  const l=this.loan;if(!l||l.principal===0)return;
  if(this.life.day<=l.lastAccrued)return;
  const days=this.life.day-l.lastAccrued;
  // Hold interest in cents until paid; do not create money merely on accrual.
  l.interestCents=Math.round(l.interestCents+days*l.principal*ECONOMIC_RATES.annualLoanRatePercent/365);
  l.lastAccrued=this.life.day;
  if(this.life.day>l.due)l.lateDays=this.life.day-l.due;
 }
 repay(amount){
  if(!valid(amount))return {ok:false,message:'Enter a positive whole-dollar amount.'};
  if(!this.life.open(this.life.place('hall')))return {ok:false,message:'The teller is closed. Return during opening hours.'};
  if(!this.loan?.principal)return {ok:false,message:'No current loan.'};
  this.accrueLoan();
  const l=this.loan,interest=Math.ceil(l.interestCents/100);
  const due=l.principal+interest;
  const paid=Math.min(due,amount);
  if(paid>this.life.money.checking)return {ok:false,message:'Not enough money in your everyday account.'};
  if(!this.transfer('player.checking','bank.capital',paid,'loan payment').ok)
    return {ok:false,message:'Unable to settle the payment.'};
  const paidInterest=Math.min(interest,paid);
  l.interestCents=Math.max(0,l.interestCents-paidInterest*100);
  l.principal-=paid-paidInterest;
  this.daily.interest+=paidInterest;this.lifetime.interest+=paidInterest;
  if(!l.principal&&l.interestCents===0)this.loan=null;
  return {ok:true,message:'Paid $'+paid+' ($'+paidInterest+' interest; $'+(paid-paidInterest)+' principal).'};
 }
 eat(item){
  const bag=this.life.money.playerBag;
  if(!FOOD[item]||!Number.isSafeInteger(bag[item])||bag[item]<=0)return {ok:false,message:'You do not own that food.'};
  if(this.playerEnergy>=100)return {ok:false,message:'You are not hungry.'};
  bag[item]--;
  this.playerEnergy=Math.min(100,this.playerEnergy+FOOD[item]);
  this.playerMeals++;
  this.life.money.log(this.life.day,'meal','Ate '+item,0);
  return {ok:true,message:'Ate '+item+'. Energy now '+this.playerEnergy+'/100.'};
 }
 dailyClose(){
  if(this.lastClosedDay>=this.life.day)return;
  const start=Math.max(this.lastClosedDay+1,2); // Day 1 has starting funds, no rent before first night.
  for(let day=start;day<=this.life.day;day++){
   this.daily={rates:0,utilities:0,rent:0,tax:0,councilSpending:0,stateSpending:0,grants:0,unpaidBills:0,interest:0};
   this.chargeHousehold();
   this.chargeNpcHouseholds();
   for(const p of this.life.places.values()){p.dailyExpenses=0;this.chargeBusiness(p.id);}
   // Weekly intergovernmental transfers: federal/state grants fund council
   // services from pre-existing public money, not automatic minting.
   if(day%7===0){
     const federal=Math.min(350,this.federalTreasury);
     if(federal&&this.transfer('federal','council',federal,'Commonwealth local services grant').ok)this.addRevenue('grants',federal);
     const state=Math.min(200,this.stateTreasury);
     if(state&&this.transfer('state','council',state,'NSW local infrastructure grant').ok)this.addRevenue('grants',state);
   }
   this.accrueLoan();
  }
  this.lastClosedDay=this.life.day;
 }
 moneySupply(){
  const l=this.life;
  return l.money.total + l.treasury + this.federalTreasury+this.stateTreasury+this.bankCapital+
    l.villagers.reduce((n,v)=>n+clamp(v.wallet),0)+
    [...l.places.values()].reduce((n,p)=>n+clamp(p.operating)+clamp(p.till),0);
 }
 audit(){
  const m=this.life.money;
  return {moneySupply:this.moneySupply(),bankCapital:this.bankCapital,federalTreasury:this.federalTreasury,stateTreasury:this.stateTreasury,
   depositLiability:m.checking+m.savings,bankVault:m.bankVault,
   depositsBacked:m.bankVault===m.checking+m.savings,
   journalBalanced:this.entries.every(e=>e.amount>0&&e.debit!==e.credit),
   loanPrincipal:this.loan?.principal||0,interestAccrued:this.loan?Math.ceil(this.loan.interestCents/100):0,
   rentArrears:this.playerRentArrears,utilityArrears:this.playerUtilityArrears,
   energy:this.playerEnergy,day:this.lastClosedDay,daily:{...this.daily},
   currentEntries:this.entries.slice(0,30)};
 }
 snapshot(){return {version:2,bankCapital:this.bankCapital,federalTreasury:this.federalTreasury,stateTreasury:this.stateTreasury,playerRentArrears:this.playerRentArrears,
  playerUtilityArrears:this.playerUtilityArrears,playerEnergy:this.playerEnergy,playerMeals:this.playerMeals,
  loan:this.loan?{...this.loan}:null,lastClosedDay:this.lastClosedDay,
  sequence:this.sequence,entries:this.entries.slice(0,220),daily:{...this.daily},lifetime:{...this.lifetime}}}
 restore(s){
  if(!s||s.version!==2)return;
  for(const field of ['bankCapital','federalTreasury','stateTreasury','playerRentArrears','playerUtilityArrears','playerEnergy','playerMeals','lastClosedDay','sequence'])
   if(Number.isSafeInteger(s[field])&&s[field]>=0&&s[field]<=1e9)this[field]=s[field];
  this.playerEnergy=Math.min(100,this.playerEnergy);
  if(s.loan&&valid(s.loan.principal)&&Number.isSafeInteger(s.loan.interestCents)&&s.loan.interestCents>=0)
   this.loan={principal:s.loan.principal,interestCents:s.loan.interestCents,
    opened:clamp(s.loan.opened),due:clamp(s.loan.due),lastAccrued:clamp(s.loan.lastAccrued),lateDays:clamp(s.loan.lateDays)};
  else this.loan=null;
  if(Array.isArray(s.entries))this.entries=s.entries.filter(e=>e&&valid(e.amount)&&typeof e.debit==='string'&&typeof e.credit==='string').slice(0,220);
  for(const name of ['daily','lifetime'])if(s[name]&&typeof s[name]==='object'){
   this[name]={...this[name]};
   for(const field of Object.keys(this[name]))if(Number.isSafeInteger(s[name][field])&&s[name][field]>=0)this[name][field]=s[name][field];
  }
 }
}