import {JOB_BOARD} from '../world/money.js';

// The Town Hall hosts a small community bank counter. It is intentionally a
// fully reserved custodial bank: withdrawals and payments cannot create cash.
// No loans, interest or central-bank money creation are claimed.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dollar=n=>'$'+Number(n||0).toLocaleString('en-AU',{maximumFractionDigits:0});
export const accountSummary=life=>({cash:life.money.cash,everyday:life.money.checking,
 savings:life.money.savings,total:life.money.total,method:life.money.payment});
export function walletPanel(life){
 const m=life.money,finance=life.finance,receipt=m.receipts.slice(0,9).map(x=>'<tr><td>Day '+x.day+'</td><td>'+esc(x.description)+'</td><td>'+dollar(x.amount)+'</td></tr>').join('');
 const bag=Object.entries(m.playerBag).filter(([k,n])=>n>0).map(([k,n])=>esc(k)+' × '+n).join(', ')||'None yet';
 return {
  title:'💳 Wallet & money',wide:true,
  body:'<p><b>Cash:</b> '+dollar(m.cash)+' · <b>Everyday account:</b> '+dollar(m.checking)+
    ' · <b>Savings:</b> '+dollar(m.savings)+'</p><p><b>Total money:</b> '+dollar(m.total)+
    ' · <b>Paying by:</b> '+esc(m.payment==='card'?'card (everyday account)':'cash')+
    ' · <b>Job income:</b> '+dollar(m.earned)+' · <b>Purchases:</b> '+dollar(m.spent)+'</p>'+
    '<p><b>Owned groceries:</b> '+bag+'</p><p><b>Energy:</b> '+finance.playerEnergy+'/100 · <b>Rent overdue:</b> '+dollar(finance.playerRentArrears)+' · <b>Power overdue:</b> '+dollar(finance.playerUtilityArrears)+'</p>'+
    '<p class="dim">Player starts with $60 cash, $100 everyday and $40 savings. Buying actually deducts funds. Banking and paid jobs are available in town. Money is fictional game currency, saved only on this device.</p>'+
    '<h3>Recent transactions</h3><table class="ledger"><tr><th>When</th><th>Memo</th><th>Change</th></tr>'+receipt+'</table>',
  actions:[
    {label:m.payment==='card'?'Pay cash at shops instead':'Pay by card at shops instead',
      run:()=>{m.setPayment(m.payment==='card'?'cash':'card');return walletPanel(life)}},
    {label:'💼 See available paid jobs',run:()=>jobBoardPanel(life)},
    {label:'📊 Town budgets and accounts',run:()=>townBudgetPanel(life)},
    ...Object.keys(m.playerBag).filter(k=>m.playerBag[k]>0&&['bread','pie','eggs','milk','veg','fruit','lamb'].includes(k)).slice(0,5).map(food=>({
      label:'🍽 Eat '+food,run:()=>{
        const done=finance.eat(food),p=walletPanel(life);
        p.body='<p><b>'+esc(done.message)+'</b></p>'+p.body;return p
      }
    })),
  ]
 };
}
export function bankPanel(life){
 const m=life.money,open=life.open(life.place('hall'));
 return {title:'🏦 Town Community Bank',wide:true,
  body:'<p><b>Teller window:</b> '+(open?'Open (09:00–17:00)':'Closed (09:00–17:00)')+'</p>'+
    '<p><b>Cash in your pocket:</b> <span data-money="cash">'+dollar(m.cash)+'</span>'+
    ' · <b>Everyday:</b> <span data-money="checking">'+dollar(m.checking)+'</span>'+
    ' · <b>Savings:</b> <span data-money="savings">'+dollar(m.savings)+'</span></p>'+
    '<p><b>Bank-held cash backing your accounts:</b> <span data-money="vault">'+dollar(m.bankVault)+'</span>. '+
    'This simple bank keeps customer deposits fully backed: depositing moves cash into an account; withdrawing moves it back. Moving money into savings does not create more money.</p>'+
    '<p class="dim">This is a fictional, fully backed credit union with limited member loans paid from existing bank capital. Borrowing accrues interest; there are no mortgages, credit cards or uninsured lending. Deposits and withdrawals need funds and an open teller.</p>',
  mount:container=>{
    const form=document.createElement('form');
    form.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:14px 0;';
    const operation=document.createElement('select');operation.setAttribute('aria-label','Bank transaction');
    for(const [v,label]of [['deposit','Deposit cash'],['withdraw','Withdraw cash'],['save','Transfer everyday to savings'],['unsave','Transfer savings to everyday']]){
      const o=document.createElement('option');o.value=v;o.textContent=label;operation.append(o)
    }
    const amount=document.createElement('input');amount.type='number';amount.min='1';amount.max='1000000';amount.step='1';amount.value='10';amount.required=true;amount.setAttribute('aria-label','Whole Town Dollars');
    const button=document.createElement('button');button.type='submit';button.textContent='Confirm transaction';button.disabled=!open;
    const notice=document.createElement('p');notice.setAttribute('role','status');
    form.append(operation,amount,button);container.append(form,notice);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!life.open(life.place('hall'))){notice.textContent='The bank teller is closed.';return;}
      const result=m.bank(operation.value,Number(amount.value),life.day);
      notice.textContent=result.message;
      for(const [key,value]of Object.entries({cash:m.cash,checking:m.checking,savings:m.savings,vault:m.bankVault})){
        const el=container.querySelector('[data-money="'+key+'"]');if(el)el.textContent=dollar(value);
      }
    });
  },
  actions:[{label:'💳 View wallet and transactions',run:()=>walletPanel(life)},{label:'🏦 Member loans and repayments',run:()=>loanPanel(life)}]
 };
}
export function jobBoardPanel(life,go){
 const m=life.money, rows=JOB_BOARD.map(j=>{
  const p=life.place(j.site),worked=!!m.completedJobs[life.day+':'+j.id];
  return '<tr><td>'+esc(j.name)+'</td><td>'+esc(p.name)+'</td><td>'+j.minutes+' town min</td><td>'+dollar(j.pay)+'</td><td>'+(worked?'Done today':life.open(p)?'Open':'Closed')+'</td></tr>';
 }).join('');
 return {title:'💼 Town job board',wide:true,
 body:'<p>Earn real in-game wages by spending town time at a workplace. Staff must be present. '+
 'You may finish two paid shifts per town day, at most one of each type. Every wage is debited from a business or council account and deposited into your everyday bank account.</p>'+
 '<table class="ledger"><tr><th>Job</th><th>Workplace</th><th>Time</th><th>Wage</th><th>Status</th></tr>'+rows+'</table>'+
 '<p class="dim">A job only progresses while you remain inside the workplace with a supervisor on shift. If you leave, the timer pauses.</p>',
 actions:JOB_BOARD.map(j=>({label:'Visit '+life.place(j.site).name+' for '+j.name,
    run:()=>{if(go)go(j.site);return null}}))}
}
export function jobPanel(life,site){
 const m=life.money,defs=JOB_BOARD.filter(j=>j.site===site),active=m.current(life.day);
 const p=life.place(site),working=life.villagers.filter(v=>v.work===site&&v.step?.kind==='work'&&!v.path?.length);
 let body='<p><b>Employer:</b> '+esc(p.name)+' · <b>Town time:</b> '+esc(life.time())+
  ' · <b>Supervisor(s) present:</b> '+esc(working.map(w=>w.name).join(', ')||'none')+'</p>';
 if(active)body+='<p><b>Current shift:</b> '+esc(m.jobById(active.id)?.name||active.id)+
  ' · '+Math.floor(active.worked)+' / '+active.required+' town minutes worked · <b>Pay:</b> '+dollar(active.pay)+
  '. Time counts only while physically working at the right location; the town clock stays at 1× while clocked in.</p>'+
  '<p><b>Duties:</b> '+(m.jobById(active.id)?.tasks||[]).map(k=>(active.doneTasks||[]).includes(k)?'✅ '+esc(k.replace(/-/g,' ')):'☐ '+esc(k.replace(/-/g,' '))).join(' · ')+'</p>';
 else body+='<p>No active shift. Choose work below. Pay is limited by the employer’s actual cash and operating account.</p>';
 body+='<p>Shifts completed today: '+m.workedToday(life.day)+' / 2. Unfinished shifts can be resumed today without restarting the timer.</p>';
 const actions=[];
 for(const job of defs)actions.push({
  label:job.name+' · '+job.minutes+' min · pays '+dollar(job.pay),
  run:()=>{const result=m.startJob(life,job.id,site);const p=jobPanel(life,site);p.body='<p><b>'+esc(result.message)+'</b></p>'+p.body;return p}
 });
 if(active&&active.site===site)actions.unshift({label:active.worked>=active.required?'✅ Clock out and collect '+dollar(active.pay):'Refresh worked time',
  run:()=>{
    const result=active.worked>=active.required?m.finishJob(life,site):{message:'Keep working here. '+Math.ceil(active.required-active.worked)+' minutes remaining.'};
    const p=jobPanel(life,site);p.body='<p><b>'+esc(result.message)+'</b></p>'+p.body;return p;
  }});
 if(active)actions.push({label:'Cancel unfinished shift (no wages)',run:()=>{
   const result=m.abandonJob(life);const p=jobPanel(life,site);
   p.body='<p><b>'+esc(result.message)+'</b></p>'+p.body;return p;
 }});
 actions.push({label:'💳 Check my wallet',run:()=>walletPanel(life)});
 return {title:'💼 Work at '+p.name,body,actions,wide:true};
}


// Work stations physically present in the 3D world. These require clock-in,
// a valid supervisor, and unique tasks at least five town minutes apart.
export function workTaskPanel(life,site,taskKey){
 const m=life.money,task=m.current(life.day),job=task?m.jobById(task.id):null;
 const eligible=!!(job&&job.site===site&&job.tasks.includes(taskKey));
 const done=!!task?.doneTasks?.includes(taskKey);
 return {
  title:'🧰 '+esc(taskKey.replace(/-/g,' ')),
  body:'<p>Workplace: '+esc(life.place(site)?.name||site)+
    '</p><p>'+(eligible?(done?'This duty has been completed.':
    'Perform this real work duty to progress towards your pay. Each distinct task counts once and must be separated by at least five town minutes.'):
    'Clock into a paid shift here first. You must perform the assigned workplace duties as well as complete the shift time.')+'</p>',
  actions:[
    ...(eligible&&!done?[{label:'Complete '+taskKey.replace(/-/g,' '),run:()=>{
      const result=m.performTask(life,site,taskKey);
      const p=jobPanel(life,site);p.body='<p><b>'+esc(result.message)+'</b></p>'+p.body;return p;
    }}]:[]),
    {label:'💼 Work shift progress',run:()=>jobPanel(life,site)}
  ]
 };
}


export function loanPanel(life){
 const f=life.finance,loan=f.loan,audit=f.audit(),m=life.money;
 const desc=loan?
  'Outstanding principal: '+dollar(loan.principal)+
  ' · Accrued interest: '+dollar(audit.interestAccrued)+
  ' · Due Day '+loan.due+(loan.lateDays?' · '+loan.lateDays+' days overdue':''):
  'No current loan.';
 const actions=[];
 if(!loan){
  for(const amount of [100,200,400])actions.push({label:'Apply for $'+amount+' funded loan',run:()=>{
    const result=f.borrow(amount);const p=loanPanel(life);
    p.body='<p><strong>'+esc(result.message)+'</strong></p>'+p.body;return p;
  }});
 }else{
  for(const amount of [25,100,loan.principal+audit.interestAccrued]){
   if(amount<=0)continue;
   actions.push({label:'Repay '+dollar(amount),run:()=>{
    const result=f.repay(amount),p=loanPanel(life);
    p.body='<p><strong>'+esc(result.message)+'</strong></p>'+p.body;return p;
   }});
  }
 }
 actions.push({label:'Back to bank',run:()=>bankPanel(life)});
 return {title:'🏦 Community bank lending',wide:true,
 body:'<p><strong>'+esc(desc)+'</strong></p>'+
  '<p><b>Bank capital available:</b> '+dollar(f.bankCapital)+
  ' · <b>Everyday account:</b> '+dollar(m.checking)+
  ' · <b>Member loan rate:</b> 8% per year; 30 town-day term.</p>'+
  '<p>Complete a paid shift to qualify. The bank lends from a finite $5,000 pre-funded capital pool, not newly minted currency. '+
  'Missed repayments remain overdue and prevent additional borrowing. Interest accrues but is paid only from actual account funds. '+
  'This is a simplified fictional credit union, not a real regulated Australian bank.</p>',
 actions};
}
export function townBudgetPanel(life){
 const f=life.finance,a=f.audit(),entries=a.currentEntries.slice(0,18);
 const rows=entries.map(x=>'<tr><td>Day '+x.day+'</td><td>'+esc(x.memo)+'</td><td>'+
  esc(x.debit)+' → '+esc(x.credit)+'</td><td>'+dollar(x.amount)+'</td></tr>').join('');
 const businesses=[...life.places.values()].filter(p=>p.kind!=='farmhouse').map(p=>({
  name:p.name,funds:(p.till||0)+(p.operating||0),daily:p.dailyExpenses||0,
  lifetime:p.lifetimeExpenses||0,unpaid:p.unpaidBills||0,
  grossRevenue:(p.grossSales||0)+(p.wholesaleRevenue||0),
  expenses:(p.costOfGoods||0)+(p.payrollPaid||0)+(p.lifetimeExpenses||0),
  profit:(p.grossSales||0)+(p.wholesaleRevenue||0)-(p.costOfGoods||0)-(p.payrollPaid||0)-(p.lifetimeExpenses||0)
 }));
 return {title:'📊 Town economic accounts',wide:true,
 body:'<p><b>Money held across the town:</b> '+dollar(a.moneySupply)+
 ' · <b>Council cash:</b> '+dollar(life.treasury)+
 ' · <b>Bank capital:</b> '+dollar(a.bankCapital)+
 ' · <b>Deposits backed:</b> '+(a.depositsBacked?'Yes':'NO — reconciliation failure')+'</p>'+
 '<h3>Government funding by tier</h3>'+
 '<p><b>Commonwealth:</b> '+dollar(a.federalTreasury)+' · <b>NSW:</b> '+dollar(a.stateTreasury)+
 ' · <b>Local council:</b> '+dollar(life.treasury)+'</p>'+
 '<p><b>PAYG income tax (Commonwealth):</b> '+dollar(f.daily.tax)+
 ' · <b>NSW health/school wages:</b> '+dollar(f.daily.stateSpending)+
 ' · <b>Council wages:</b> '+dollar(f.daily.councilSpending)+'</p>'+
 '<h3>Local council receipts</h3>'+
 '<p>Rates: '+dollar(f.daily.rates)+' · Utilities: '+dollar(f.daily.utilities)+
 ' · Housing rent: '+dollar(f.daily.rent)+' · Government grants: '+dollar(f.daily.grants)+'</p>'+
 '<p>Unpaid invoices/arrears outstanding: '+dollar(f.daily.unpaidBills)+
 ' · Player rent owed: '+dollar(f.playerRentArrears)+
 ' · Player power owed: '+dollar(f.playerUtilityArrears)+'</p>'+
 '<h3>Businesses: cash, operating costs and unpaid bills</h3>'+
 '<table class="ledger"><tr><th>Business</th><th>Funds</th><th>Gross revenue</th><th>Recorded costs</th><th>Operating result</th><th>Bills owed</th></tr>'+
 businesses.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+dollar(x.funds)+'</td><td>'+
 dollar(x.grossRevenue)+'</td><td>'+dollar(x.expenses)+'</td><td>'+dollar(x.profit)+'</td><td>'+dollar(x.unpaid)+'</td></tr>').join('')+'</table>'+
 '<h3>Double-entry transfers (new economic systems)</h3>'+
 '<table class="ledger"><tr><th>Day</th><th>Memo</th><th>From → To</th><th>Amount</th></tr>'+rows+'</table>'+
 '<p class="dim">The journal covers retail, payroll, wholesale, loan, Commonwealth PAYG tax and household flows. Business results include recorded revenue, wages, wholesale purchases, utilities and rates, but exclude opening-inventory valuation, depreciation and real production overheads.</p>',
 actions:[{label:'💳 My wallet',run:()=>walletPanel(life)}]};
}
