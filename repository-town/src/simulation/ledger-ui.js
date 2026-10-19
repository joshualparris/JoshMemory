import { CREDIT, SITES } from "./town-system.js";

const tabs = ["Overview", "Economy", "Utilities", "Council", "Residents", "Events"];
const safe = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const number = value => Number(value || 0).toLocaleString("en-AU", {maximumFractionDigits: 1});
const money = value => number(value) + " " + CREDIT;
function table(rows) {
  return '<table class="living-table"><tbody>' + rows.map(([k,v]) => "<tr><th>" + safe(k) + "</th><td>" + safe(v) + "</td></tr>").join("") + "</tbody></table>";
}
function action(title, operation, arg, kind = "") {
  return '<button type="button" class="living-action ' + kind + '" data-op="' + safe(operation) + '" data-arg="' + safe(arg) + '">' + safe(title) + "</button>";
}
export function mountLivingTown(document, simulation) {
  const button = document.createElement("button");
  button.id = "btn-living-town";button.type="button";button.textContent="🏛️ Town Ledger";
  button.title = "Live civic services, economy, jobs and town decisions";
  document.querySelector("#hud .row").append(button);
  const clock = document.createElement("span");clock.id="living-clock";clock.setAttribute("aria-live","off");
  clock.style.cssText="padding:7px 3px;font-variant-numeric:tabular-nums;white-space:nowrap";
  button.after(clock);
  const style = document.createElement("style");
  style.textContent = [
    "#living-town[hidden]{display:none!important}",
    "#living-town{position:fixed;z-index:30;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(710px,calc(100vw - 20px));max-height:76dvh;display:flex;flex-direction:column;background:#0d1725f7;color:#f7fbff;border:1px solid #7194ae;border-radius:14px;box-shadow:0 14px 40px #0009;font:14px/1.4 system-ui,sans-serif;}",
    "#living-town-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #7194ae;gap:12px}",
    "#living-town-header h2{font-size:18px;margin:0}",
    "#living-town-tabs{display:flex;gap:5px;padding:8px 10px;overflow-x:auto;border-bottom:1px solid #33495e}",
    "#living-town-tabs button{white-space:nowrap;padding:6px 10px}",
    "#living-town-tabs button[aria-selected=true]{background:#315d77;border-color:#89d4fa}",
    "#living-town-body{overflow:auto;padding:12px 14px;min-height:140px;overscroll-behavior:contain}",
    "#living-town-body h3{font-size:15px;margin:12px 0 6px}",
    "#living-town-body p{margin:6px 0}",
    ".living-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:8px}",
    ".living-stat{background:#1d3145;border-radius:9px;padding:9px}",
    ".living-stat b{display:block;font-size:19px;color:#a9e6ff;font-variant-numeric:tabular-nums}",
    ".living-table{width:100%;border-collapse:collapse;font-size:13px}",
    ".living-table th{text-align:left;font-weight:500}",
    ".living-table td{text-align:right;font-variant-numeric:tabular-nums}",
    ".living-table td,.living-table th{padding:6px;border-bottom:1px solid #405268}",
    ".living-actions{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}",
    ".living-action{font-size:13px;padding:8px 9px}",
    ".living-warning{color:#ffd083}",
    "#living-town-message{font-size:12px;min-height:18px;color:#b1edd0;padding:0 14px 9px}",
    "#living-town ul{padding-left:20px}",
    "body.playing #living-town{display:none!important}",
    "@media(max-width:700px){#living-town{max-height:73dvh;bottom:10px}#living-town-body{padding:8px 10px}#living-town-header{padding:8px 10px}#living-town-header h2{font-size:16px}#living-town-tabs{padding:6px}#living-clock{display:none}}",
  ].join("\n");
  document.head.append(style);
  const panel = document.createElement("section");
  panel.id="living-town";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Living Town Ledger");
  panel.innerHTML = '<div id="living-town-header"><h2>🏛️ Living Town Ledger</h2><button type="button" id="living-close" aria-label="Close town ledger">✕</button></div><div id="living-town-tabs"></div><div id="living-town-body"></div><p id="living-town-message" role="status"></p>';
  document.body.append(panel);
  let tab = "Overview";
  const body = panel.querySelector("#living-town-body");
  const notice = panel.querySelector("#living-town-message");
  const tabNav = panel.querySelector("#living-town-tabs");
  tabNav.innerHTML = tabs.map(x => '<button type="button" data-tab="' + x + '" aria-selected="' + (x===tab) + '">' + x + "</button>").join("");
  const metric = (label,value) => '<div class="living-stat"><small>' + safe(label) + '</small><b>' + safe(value) + "</b></div>";
  const metrics = rows => '<div class="living-stats">' + rows.map(([name,value])=>metric(name,value)).join("") + "</div>";
  function render() {
    const s = simulation.snapshot(), supplies=s.supply, services=s.services;
    clock.textContent = "Day " + s.day + " · " + s.time;
    if (panel.hidden) return;
    for (const element of tabNav.querySelectorAll("button")) element.setAttribute("aria-selected",String(element.dataset.tab===tab));
    if (tab === "Overview") {
      body.innerHTML = metrics([
        ["Local time","Day "+s.day+" · "+s.time],["Weather",s.weather],
        ["Mayor",s.mayor],["Residents",s.population],["Town health",number(s.indicators.health)+"%"],
        ["Happiness",number(s.indicators.happiness)+"%"],["Environment",number(s.indicators.environment)+"%"],
        ["Town treasury",money(s.treasury)]
      ]) + "<h3>How the town connects</h3><p>Farm → depot → mill → bakery → market → homes. Homes send rubbish and recyclables to collection, recycling and landfill. The council pays wages and repairs networks using tax revenue.</p>" +
      "<h3>Today so far</h3>" + table([
        ["Harvested",s.stats.harvest+" produce units"],["Bread baked",s.stats.breadBaked+" loaves"],
        ["Truck deliveries",s.stats.deliveries],["Meals prepared",s.stats.meals],
        ["Recyclables recovered",s.stats.recycled],["Postal deliveries",s.stats.letters]
      ]) + "<p>The day/night cycle lasts 24 real minutes. Shops can run out of stock and public services can fail.</p>";
    } else if (tab === "Economy") {
      body.innerHTML = metrics([["Wallet",money(s.wallet)],["Bank",money(s.bankBalance)],["Tax rate",Math.round(s.taxRate*100)+"%"],["Shop funds",money(s.shopBalance)]]) +
        "<h3>Community bank</h3><div class=\"living-actions\">" + action("Deposit 20 TC","deposit",20) + action("Withdraw 20 TC","withdraw",20) + "</div>" +
        "<h3>Buy real market stock</h3>" + table(Object.entries({bread:5,vegetables:3,fruit:4,eggs:4,milk:4}).map(([item,price])=>[item + " · "+price+" TC",s.stores.market[item]||0])) +
        '<div class="living-actions">' + ["bread","vegetables","fruit","eggs","milk"].map(item=>action("Buy "+item,"buy",item)).join("") + "</div>" +
        "<h3>Your shopping bag</h3><p>Items bought are yours to keep or sell back. The shop buys back at a lower price.</p>" +
        table(Object.entries(s.stores.playerInventory || {}).map(([item,count])=>[item,count])) +
        '<div class="living-actions">' + ["bread","vegetables","fruit","eggs","milk"].filter(item=>(s.stores.playerInventory?.[item]||0)>0).map(item=>action("Sell "+item,"sell",item)).join("") + "</div>" +
        "<h3>Supply chain inventory</h3>" + table([
          ["Farm wheat",s.stores.farm.wheat],["Mill flour",s.stores.mill.flour],["Bakery bread",s.stores.bakery.bread],
          ["Foundry metal",s.stores.factory.metal],["Workshop parts",s.stores.factory.parts],
          ["Freight diesel",s.stores.depot.fuel],["Power fuel",s.stores.power.fuel]
        ]);
    } else if (tab === "Utilities") {
      body.innerHTML = metrics([
        ["Power",supplies.electricity+"/"+supplies.electricityDemand+" units/hour"],
        ["Water",supplies.water+"/"+supplies.waterDemand+" units/hour"],
        ["Wastewater",supplies.wastewater+" units held"],
        ["Rubbish backlog",s.stores.homes.rubbish+" items"],
      ]) + "<h3>Service condition</h3>" +
      table(Object.entries(services).map(([name,value])=>[name,value.toFixed(1)+"% "+(value<35?"⚠ OUTAGE":"")])) +
      "<h3>Circular economy</h3><p>Collect recyclables from households, earn credits and return materials to local industry.</p>" +
      '<div class="living-actions">' + action("Collect & sort recyclables","recycle",2) + "</div>" +
      "<h3>Disaster test</h3><p>Simulate a burst main, then inspect the next hourly report to see the impact. Repairing it needs council funds and spare parts.</p>" +
      '<div class="living-actions">' + action("Simulate burst water main","fault","water","living-warning") + action("Repair water supply","repair","water") + "</div>";
    } else if (tab === "Council") {
      body.innerHTML = metrics([["Mayor",s.mayor],["Public funds",money(s.treasury)],["Next election","Day "+s.electionDay],["Spare parts",s.stores.council.parts]]) +
      "<h3>Vote for mayor</h3><p>One vote per town day. Residents also participate in the seven-day election.</p>" +
      '<div class="living-actions">' + ["Rowan","Sage","Kit"].map(x=>action("Vote "+x,"vote",x)).join("") + "</div>" +
      "<h3>Public works</h3><p>Every repair costs 90 TC and two parts. Networks wear down gradually.</p>" +
      '<div class="living-actions">' + Object.keys(services).map(x=>action("Repair "+x,"repair",x)).join("") + "</div>" +
      "<h3>Budget priorities</h3>" + table(Object.entries(s.budgets).map(([k,v])=>[k,v+"%"])) +
      "<h3>Public buildings</h3><p>" + SITES.map(x=>x[2]+" "+safe(x[1])).join(" · ") + "</p>";
    } else if (tab === "Residents") {
      body.innerHTML = metrics([["Population",s.population],["Jobs",s.indicators.jobs],["Households",Math.ceil(s.population/2)],["Health",number(s.indicators.health)+"%"]]) +
        "<h3>Daily routines</h3><p>These are the town's simulated workforce schedules; the 3D NPC pathfinding is not yet coupled to them.</p>" +
        table(s.activities.slice(0,16).map(x=>[x.job,x.activity])) +
        "<h3>Post office</h3><p>Mail is delivered on the next town day during post rounds if roads and postal services are working.</p>" +
        '<div class="living-actions">' + action("Post letter to Rowan · 2 TC","post","Rowan") + "</div>";
    } else if (tab === "Events") {
      body.innerHTML = "<h3>Latest town events</h3>" + (s.events.length ? "<ul>" + s.events.slice(0,40).map(e=>"<li><small>Day "+e.day+" · "+safe(e.time)+"</small> — "+safe(e.message)+"</li>").join("")+"</ul>" : "<p>The log starts when the first workday event occurs.</p>");
    }
  }
  function invoke(op,arg) {
    const methods={buy:()=>simulation.buy(arg),sell:()=>simulation.sell(arg),recycle:()=>simulation.recycle(Number(arg)),
      repair:()=>simulation.repair(arg),fault:()=>simulation.reportFault(arg),
      vote:()=>simulation.vote(arg),deposit:()=>simulation.deposit(Number(arg)),
      withdraw:()=>simulation.withdraw(Number(arg)),post:()=>simulation.postLetter(arg)};
    if(!methods[op])return;
    const result=methods[op]();
    notice.textContent=result.message;
    notice.style.color=result.ok?"#b1edd0":"#ffd083";
    render();
  }
  tabNav.addEventListener("click",e=>{
    const b=e.target.closest("[data-tab]");if(!b)return;tab=b.dataset.tab;notice.textContent="";render();
  });
  body.addEventListener("click",e=>{
    const b=e.target.closest("[data-op]");if(!b)return;invoke(b.dataset.op,b.dataset.arg);
  });
  const close=()=>{panel.hidden=true;button.setAttribute("aria-expanded","false");};
  button.addEventListener("click",()=>{
    panel.hidden=!panel.hidden;button.setAttribute("aria-expanded",String(!panel.hidden));
    notice.textContent="";render();
  });
  panel.querySelector("#living-close").addEventListener("click",close);
  const onEscape = e=>{if(e.key==="Escape"&&!panel.hidden){close();e.stopPropagation();}};
  document.addEventListener("keydown",onEscape);
  render();
  return { render, close, isOpen:()=>!panel.hidden };
}
