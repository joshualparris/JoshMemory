// Run: node tests/economy-realism.mjs
// Real modules; no browser-only globals or secrets.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=n=>readFileSync(new URL('../'+n,import.meta.url),'utf8');
const js=s=>s.replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'');
const {TownMoney}=new Function(js(file('world/money.js'))+'\nreturn {TownMoney};')();
const {TownFinance}=new Function(js(file('world/finance.js'))+'\nreturn {TownFinance};')();
const {TownLife}=new Function('TownMoney','TownFinance',js(file('world/life.js'))+'\nreturn {TownLife};')(TownMoney,TownFinance);
const homes=Array.from({length:188},(_,i)=>({
 coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),
 name:'Home '+i,door:{x:i%26*26,z:Math.floor(i/26)*46}
}));
const l=new TownLife({homes}),f=l.finance,m=l.money;
const baseline=f.moneySupply();
assert.equal(f.bankCapital,5000);
assert(f.audit().depositsBacked);
assert.equal(f.audit().moneySupply,baseline);
const prePlayer=m.total,preCouncil=l.treasury;
const fromEnergy=f.playerEnergy;
assert.equal(f.eat('bread').ok,false,'No eating unpurchased goods');
const purchased=l.payPlayerPurchase('store','bread');
assert(purchased.ok,'Purchase should deduct finite money');
assert.equal(m.playerBag.bread,1);
assert(f.eat('bread').ok,'Owned food should restore energy');
assert.equal(m.playerBag.bread,0);
assert.equal(f.eat('bread').ok,false,'Food cannot be eaten twice');
assert(f.playerEnergy>=fromEnergy);
assert.equal(f.moneySupply(),baseline);
// Household bills, enterprise rates, and NPC rent settle into the council, but
// cannot produce new money or send an account negative.
l.day=2;
const bBefore=l.treasury;
f.dailyClose();const afterFirstClose=f.moneySupply();
assert.equal(afterFirstClose,baseline,'Daily transfer accounting must conserve funds');
assert(l.treasury>bBefore,'Council must collect taxes/rent/rates');
assert.equal(m.total,prePlayer-5-10,'Player pays $5 bread and $10 daily housing/power');
assert.equal(f.daily.rates>0,true);
assert.equal(f.daily.utilities>0,true);
assert.equal(f.playerEnergy<=100,true);
const rent=l.treasury;
f.dailyClose();
assert.equal(l.treasury,rent,'Daily close must be idempotent');
assert.equal(f.moneySupply(),baseline);
// Real employer pay, including PAYG tax to council, is a pure transfer.
const baker=l.villagers.find(v=>v.work==='bakery');
const wageBefore=baker.wallet,govBefore=f.federalTreasury;
l.pay(baker);
assert.equal(baker.wallet-wageBefore,41,'$45 baker wage should pay $41 net');
assert.equal(f.federalTreasury-govBefore,4,'$4 PAYG must go to Commonwealth');
assert.equal(f.moneySupply(),baseline);
// Credit union requires a completed paid shift, teller hours and bank capital.
// Seed the employment history rather than faking an actual salary transfer.
l.minute=600;assert.equal(f.borrow(100).ok,false,'Loans require employment');
m.completedJobs['2:bakery-assistant']=24;m.earned=24;
const capital=f.bankCapital,checking=m.checking;
const loan=f.borrow(100);
assert(loan.ok,loan.message);
assert.equal(f.bankCapital,capital-100);
assert.equal(m.checking,checking+100);
assert.equal(f.audit().loanPrincipal,100);
assert.equal(f.moneySupply(),baseline,'Credit must come from existing bank capital');
// State-funded education and health wages are not charged to local council.
const teacher=l.villagers.find(v=>v.work==='school');
if(teacher){const before=f.stateTreasury,council=l.treasury;const wallet=teacher.wallet;
 l.pay(teacher);assert.equal(f.stateTreasury,before-60);assert.equal(l.treasury,council);
 assert.equal(teacher.wallet-wallet,54);
 assert.equal(f.moneySupply(),baseline);}

assert.equal(f.borrow(100).ok,false,'No stacking member loans');
assert.equal(f.repay(1000000).ok,false,'Overdraft cannot repay');
l.day+=31;f.accrueLoan();
assert(f.audit().interestAccrued>=1,'Loan should accrue some interest');
const due=f.audit().loanPrincipal+f.audit().interestAccrued;
const repayment=f.repay(due);
assert(repayment.ok,repayment.message);
assert.equal(f.loan,null,'Fully repaid loan must close');
assert.equal(f.bankCapital>capital-100,true,'Bank receives actual repayments');
assert.equal(f.moneySupply(),baseline,'Repayment and interest transfer must conserve funds');
// A new renter starting with no money accrues liabilities, not a negative wallet.
const noCash=new TownLife({homes}),poor=noCash.finance;
noCash.money.cash=0;noCash.money.checking=0;noCash.money.bankVault=noCash.money.savings;
noCash.day=2;poor.dailyClose();
assert.equal(poor.playerRentArrears,8);
assert.equal(poor.playerUtilityArrears,2);
assert.equal(noCash.money.checking,0);
const snap=l.snapshot(),restored=new TownLife({homes});restored.restore(snap);
assert.equal(restored.finance.bankCapital,f.bankCapital);
assert.equal(restored.finance.playerRentArrears,f.playerRentArrears);
assert.equal(restored.finance.playerMeals,1);
assert.equal(restored.finance.loan,null);
assert.equal(restored.finance.moneySupply(),f.moneySupply());
assert.equal(restored.finance.audit().depositsBacked,true);
// Old saves get the one-time starting banking capital and no loan.
const old={...snap};delete old.finance;
const legacy=new TownLife({homes});legacy.restore(old);
assert.equal(legacy.finance.bankCapital,5000);
assert.equal(legacy.finance.loan,null);
const oldDay={...old,day:50};
const upgrade=new TownLife({homes});upgrade.restore(oldDay);
assert.equal(upgrade.finance.lastClosedDay,50,'Migrated old saves must not be charged 49 earlier days');
upgrade.day=51;upgrade.finance.dailyClose();
assert.equal(upgrade.finance.playerRentArrears,0);
assert.equal(upgrade.finance.playerUtilityArrears,0);
assert.equal(upgrade.money.total,oldDay.money.cash+oldDay.money.checking+oldDay.money.savings-10);
// Grants transfer money from higher-level government accounts into council.
const grantsTown=new TownLife({homes}),grantFinance=grantsTown.finance;
grantsTown.day=7;grantFinance.lastClosedDay=6;
const fBefore=grantFinance.federalTreasury,sBefore=grantFinance.stateTreasury;
const gBefore=grantFinance.moneySupply();grantFinance.dailyClose();
assert.equal(grantFinance.federalTreasury,fBefore-350);
assert.equal(grantFinance.stateTreasury,sBefore-200);
assert.equal(grantFinance.daily.grants,550);
assert.equal(grantFinance.moneySupply(),gBefore);

console.log('PASS: financial conservation incl Commonwealth/NSW/council, taxes, credit, bills, purchases, payroll and saves');
