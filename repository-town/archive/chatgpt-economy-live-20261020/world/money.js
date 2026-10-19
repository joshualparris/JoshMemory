// Repository Town financial system. Money never appears from a shop purchase,
// a withdrawal, a shift or a delivery without a matching source. All values
// are integer Town Dollars. Entirely local, fictional and not real banking.
export const STARTING_FUNDS=Object.freeze({cash:60,checking:100,savings:40});
export const JOB_BOARD=Object.freeze([
  {id:'bakery-assistant',tasks:['wash-hands','prep-bench','cooling'],site:'bakery',name:'Bakery assistant',minutes:35,pay:24,description:'Help shape, tray and pack baked goods'},
  {id:'farm-hand',tasks:['water-plants','weed-beds','pack-produce'],site:'garden',name:'Market Garden hand',minutes:45,pay:30,description:'Water, weed and collect produce'},
  {id:'depot-sorter',tasks:['sort-freight','verify-manifest','stack-parcels'],site:'depot',name:'Rail Depot parcel sorter',minutes:40,pay:28,description:'Sort incoming freight and secure parcels'},
  {id:'store-stocker',tasks:['check-expiry','refill-shelves','count-stock'],site:'store',name:'General Store shelf stocker',minutes:35,pay:24,description:'Count stock, check dates and refill shelves'},
  {id:'post-assistant',tasks:['sort-mail','label-parcels','prepare-route'],site:'post',name:'Post Office assistant',minutes:30,pay:22,description:'Sort letters into the delivery rounds'},
  {id:'civic-cleaner',tasks:['clean-floors','file-records','inspect-lighting'],site:'hall',name:'Town Hall caretaker',minutes:35,pay:25,description:'Tidy public areas and inspect facilities'}
]);
const goodAmount=n=>Number.isSafeInteger(n)&&n>0&&n<=1000000;
const trunc=n=>Number.isSafeInteger(n)&&n>=0?n:0;
const text=s=>String(s||'').slice(0,125);

export class TownMoney {
 constructor(){
  this.cash=STARTING_FUNDS.cash;
  this.checking=STARTING_FUNDS.checking;
  this.savings=STARTING_FUNDS.savings;
  this.bankVault=this.checking+this.savings; // cash backing customer deposits
  this.payment='card';
  this.playerBag={};
  this.receipts=[];
  this.activeJob=null;
  this.completedJobs={};
  this.earned=0;this.spent=0;
 }
 get total(){return this.cash+this.checking+this.savings}
 get available(){return this.payment==='cash'?this.cash:this.checking}
 log(day,type,description,amount){
  this.receipts.unshift({day:trunc(day)||1,type:text(type),description:text(description),
    amount:Number.isSafeInteger(amount)?amount:0,cash:this.cash,checking:this.checking,savings:this.savings});
  if(this.receipts.length>65)this.receipts.length=65;
 }
 setPayment(method){if(method!=='card'&&method!=='cash')return false;this.payment=method;return true}
 bank(action,amount,day){
  if(!goodAmount(amount))return {ok:false,message:'Enter a positive whole-dollar amount.'};
  if(action==='deposit'){
   if(this.cash<amount)return {ok:false,message:'You do not have that much cash.'};
   this.cash-=amount;this.checking+=amount;this.bankVault+=amount;
  }else if(action==='withdraw'){
   if(this.checking<amount||this.bankVault<amount)return {ok:false,message:'Insufficient funds in your everyday account.'};
   this.checking-=amount;this.cash+=amount;this.bankVault-=amount;
  }else if(action==='save'){
   if(this.checking<amount)return {ok:false,message:'Not enough in your everyday account.'};
   this.checking-=amount;this.savings+=amount;
  }else if(action==='unsave'){
   if(this.savings<amount)return {ok:false,message:'Not enough in savings.'};
   this.savings-=amount;this.checking+=amount;
  }else return {ok:false,message:'Unknown bank transaction.'};
  this.log(day,'bank',action+' $'+amount,0);
  const movement={deposit:['player.cash','player.checking'],withdraw:['player.checking','player.cash'],
    save:['player.checking','player.savings'],unsave:['player.savings','player.checking']}[action];
  if(movement)this.finance?.record(movement[0],movement[1],amount,'bank '+action);
  return {ok:true,message:{
   deposit:'Deposited',withdraw:'Withdrew',save:'Moved to savings',unsave:'Moved to everyday account'
  }[action]+' $'+amount+'.'};
 }
 purchase(day,cost,business,item){
  if(!goodAmount(cost)||!business)return {ok:false,message:'Invalid purchase.'};
  if(this.available<cost)return {ok:false,message:'You need $'+cost+' but only have $'+this.available+
    ' available by '+(this.payment==='cash'?'cash':'card')+'. Visit the Town Bank or earn wages.'};
  if(this.payment==='cash'){
   this.cash-=cost;business.till=trunc(business.till)+cost;
  }else{
   if(this.bankVault<cost)return {ok:false,message:'The bank cannot settle this transaction.'};
   this.checking-=cost;this.bankVault-=cost;
   business.operating=trunc(business.operating)+cost;
  }
  business.grossSales=trunc(business.grossSales)+cost;
  this.playerBag[item]=(this.playerBag[item]||0)+1;
  this.spent+=cost;
  this.log(day,'purchase',item+' at '+business.name+' ('+this.payment+')',-cost);
  this.finance?.record(this.payment==='cash'?'player.cash':'player.checking',
    this.payment==='cash'?'register:'+business.id:'business:'+business.id,cost,'retail '+item);
  return {ok:true,message:'Paid $'+cost+' by '+(this.payment==='cash'?'cash':'card')+'.'};
 }
 // Shops keep register cash and operating capital distinct. Paying invoices
 // first uses the till, then the operating balance; never creates wages.
 static debitBusiness(business,amount){
  if(!goodAmount(amount))return false;
  if(trunc(business.till)+trunc(business.operating)<amount)return false;
  const cash=Math.min(trunc(business.till),amount);
  business.till-=cash;
  business.operating-=amount-cash;
  return true;
 }
 // Wages originate in the hiring enterprise or the funded council budget.
 creditPay(day,amount,description){
  if(!goodAmount(amount))return false;
  this.checking+=amount;this.bankVault+=amount;this.earned+=amount;
  this.log(day,'pay',description,amount);return true;
 }
 jobById(id){return JOB_BOARD.find(j=>j.id===id)||null}
 current(day){
  if(this.activeJob&&this.activeJob.day!==day)this.activeJob=null;
  return this.activeJob;
 }
 workedToday(day){
  return Object.keys(this.completedJobs).filter(k=>k.startsWith(day+':')).length;
 }
 startJob(life,id,atSite){
  const job=this.jobById(id),p=job?life.place(job.site):null;
  if(!job||!p)return {ok:false,message:'That job is not available.'};
  if(atSite!==job.site)return {ok:false,message:'Apply at the actual workplace.'};
  if(this.current(life.day))return {ok:false,message:'Finish your current shift before applying again.'};
  if(life.finance?.playerEnergy<25)return {ok:false,message:'You need a proper meal and some energy before starting physical work.'};
  if(this.completedJobs[life.day+':'+id])return {ok:false,message:'You have already worked this job today.'};
  if(this.workedToday(life.day)>=2)return {ok:false,message:'You have already completed two shifts today. Rest until tomorrow.'};
  if(!life.open(p))return {ok:false,message:'The workplace is currently closed.'};
  const supervisor=life.villagers.some(v=>v.work===job.site&&v.step?.kind==='work'&&!v.path?.length);
  if(!supervisor)return {ok:false,message:'There is no supervisor on shift. Try during staffed hours.'};
  const funds=life.isPublicPayroll(job.site)?life.treasury:trunc(p.till)+trunc(p.operating);
  if(funds<job.pay)return {ok:false,message:'This employer does not have enough funds for a paid shift.'};
  this.activeJob={id,site:job.site,day:life.day,worked:0,required:job.minutes,pay:job.pay,doneTasks:[],lastTaskAt:0};
  this.log(life.day,'employment','Started '+job.name,0);
  return {ok:true,message:job.name+' started. Work on site for '+job.minutes+' town minutes; then collect your pay.'};
 }
 tickJob(life,townMinutes,atSite){
  const job=this.current(life.day);
  if(!job||!Number.isFinite(townMinutes)||townMinutes<=0)return false;
  if(atSite!==job.site||!life.open(life.place(job.site)))return false;
  const supervisor=life.villagers.some(v=>v.work===job.site&&v.step?.kind==='work'&&!v.path?.length);
  if(!supervisor)return false;
  job.worked=Math.min(job.required,job.worked+townMinutes);
  return job.worked>=job.required;
 }
 performTask(life,atSite,taskKey){
  const shift=this.current(life.day);
  if(!shift||shift.site!==atSite)return {ok:false,message:'Clock in at this workplace before taking on duties.'};
  const def=this.jobById(shift.id);
  if(!def?.tasks?.includes(taskKey))return {ok:false,message:'That task is not part of your current job.'};
  if(shift.doneTasks.includes(taskKey))return {ok:false,message:'This duty is already checked off.'};
  if(!life.open(life.place(atSite)))return {ok:false,message:'The work site is closed.'};
  const supervisor=life.villagers.some(v=>v.work===atSite&&v.step?.kind==='work'&&!v.path?.length);
  if(!supervisor)return {ok:false,message:'Wait for a supervisor to be present.'};
  const now=life.day*1440+life.minute;
  if(shift.lastTaskAt&&now-shift.lastTaskAt<5)
    return {ok:false,message:'Work on this duty for at least five town minutes before the next task.'};
  shift.doneTasks.push(taskKey);
  shift.lastTaskAt=now;
  this.log(life.day,'work','Completed '+taskKey+' for '+def.name,0);
  return {ok:true,message:'Completed '+taskKey.replace(/-/g,' ')+'. '+shift.doneTasks.length+'/'+def.tasks.length+' duties done.'};
 }
 abandonJob(life){
  const shift=this.current(life.day);
  if(!shift)return {ok:false,message:'No active paid shift to abandon.'};
  this.log(life.day,'employment','Abandoned '+this.jobById(shift.id)?.name,0);
  this.activeJob=null;
  return {ok:true,message:'Shift abandoned. No wage paid. You can apply again today.'};
 }
 finishJob(life,atSite){
  const task=this.current(life.day);
  if(!task)return {ok:false,message:'You have no active shift.'};
  const work=this.jobById(task.id);
  if(!work||atSite!==work.site)return {ok:false,message:'Return to your workplace to clock out.'};
  if(task.worked+0.001<task.required)return {ok:false,message:'You have worked '+Math.floor(task.worked)+' of '+task.required+' town minutes.'};
  if((task.doneTasks||[]).length<3)return {ok:false,message:'Complete the remaining workplace duties before clocking out ('+(task.doneTasks||[]).length+'/3 done).'};
  const p=life.place(work.site),beforeTill=p.till||0,beforeOperating=p.operating||0;
  if(life.isPublicPayroll(work.site)){
   if(life.treasury<work.pay)return {ok:false,message:'Council payroll is temporarily short of funds.'};
   life.treasury-=work.pay;
  }else if(!TownMoney.debitBusiness(p,work.pay)){
   return {ok:false,message:'The employer cannot fund the shift. It remains payable.'};
  }
  this.creditPay(life.day,work.pay,work.name+' wages');
  if(life.isPublicPayroll(work.site)){
    life.finance?.record('council','player.checking',work.pay,'public wages: '+work.name);
    life.finance.daily.councilSpending+=work.pay;
    life.finance.lifetime.councilSpending+=work.pay;
  }else{
    const fromRegister=beforeTill-(p.till||0),fromOperating=beforeOperating-(p.operating||0);
    if(fromRegister>0)life.finance?.record('register:'+p.id,'player.checking',fromRegister,'earned '+work.name);
    if(fromOperating>0)life.finance?.record('business:'+p.id,'player.checking',fromOperating,'earned '+work.name);
    p.payrollPaid=(p.payrollPaid||0)+work.pay;
  }
  const tax=life.finance?.taxPlayerWage(work.pay)||0;
  if(tax)life.log('PAYG income tax withheld from player wages: $'+tax+'.');
  this.completedJobs[life.day+':'+work.id]=work.pay;
  this.activeJob=null;
  if(life.stats)life.stats.playerWages=(life.stats.playerWages||0)+work.pay;
  life.log('The player completed a shift as '+work.name+' and was paid $'+work.pay+' from '+p.name+'.');
  return {ok:true,message:'Shift finished. Gross pay $'+work.pay+', tax $'+tax+', net pay $'+(work.pay-tax)+' deposited into your everyday account.'};
 }
 snapshot(){return{
  version:1,cash:this.cash,checking:this.checking,savings:this.savings,bankVault:this.bankVault,
  payment:this.payment,playerBag:{...this.playerBag},receipts:this.receipts.slice(0,65),
  activeJob:this.activeJob?{...this.activeJob}:null,completedJobs:{...this.completedJobs},
  earned:this.earned,spent:this.spent
 }}
 restore(s){
  if(!s||s.version!==1)return;
  for(const field of ['cash','checking','savings','earned','spent']){
   if(Number.isSafeInteger(s[field])&&s[field]>=0&&s[field]<=100000000)this[field]=s[field];
  }
  // No independent bank-vault value from the browser is trusted: preserve
  // the balance-sheet identity with the sum of customer liabilities.
  this.bankVault=this.checking+this.savings;
  if(s.payment==='card'||s.payment==='cash')this.payment=s.payment;
  this.playerBag={};for(const [k,v]of Object.entries(s.playerBag||{})){
   if(/^[a-z]+$/.test(k)&&Number.isSafeInteger(v)&&v>=0&&v<=100000)this.playerBag[k]=v;
  }
  this.receipts=Array.isArray(s.receipts)?s.receipts.filter(v=>v&&typeof v==='object').slice(0,65):[];
  this.completedJobs={};
  for(const [k,v]of Object.entries(s.completedJobs||{})){
   if(/^\d{1,5}:[a-z-]+$/.test(k)&&goodAmount(v))this.completedJobs[k]=v;
  }
  if(s.activeJob&&this.jobById(s.activeJob.id)&&
      Number.isSafeInteger(s.activeJob.day)&&s.activeJob.day>=1&&
      Number.isFinite(s.activeJob.worked)&&s.activeJob.worked>=0){
   const def=this.jobById(s.activeJob.id);
   this.activeJob={id:def.id,site:def.site,day:s.activeJob.day,
    worked:Math.min(def.minutes,s.activeJob.worked),required:def.minutes,pay:def.pay,
    doneTasks:[...new Set((Array.isArray(s.activeJob.doneTasks)?s.activeJob.doneTasks:[]).filter(t=>def.tasks.includes(t)))],
    lastTaskAt:Number.isFinite(s.activeJob.lastTaskAt)?s.activeJob.lastTaskAt:0};
  }else this.activeJob=null;
 }
}
