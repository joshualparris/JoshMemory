import {WIDTH,HEIGHT,ITEMS,BUILDINGS,CONTRACTS,DIRS,depositAt,cellAt,newGame,edit,rotate,step,power,hydrate,serialize,inspect,unlocked} from "./core.mjs";

const STORAGE="iron-and-logic-save-v1";
const INTRO="iron-and-logic-intro-v1";
const $=id=>document.getElementById(id);
const safeText=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let state=(()=>{try{return hydrate(localStorage.getItem(STORAGE))||newGame();}catch{return newGame();}})();
let selectedTool="belt",direction=1,selected=null,undoStack=[],lastStage=state.stage,toastTimer=null;
const directions=["NORTH ↑","EAST →","SOUTH ↓","WEST ←"];
const arrows=["↑","→","↓","←"];
const money=n=>"$"+Math.floor(n).toLocaleString("en-AU");
function persist(){try{localStorage.setItem(STORAGE,serialize(state));$("saveStatus").textContent="✓ Autosaved · tick "+state.ticks.toLocaleString();}catch{$("saveStatus").textContent="Autosave unavailable — use Export save."}}
function toast(message,bad=false){
 const el=$("toast");el.textContent=message;el.style.borderColor=bad?"#f79d94":"#6ce5ba";
 el.classList.add("show");if(toastTimer)clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}
function record(){undoStack.push(serialize(state));if(undoStack.length>25)undoStack.shift();}
function undo(){
 if(!undoStack.length){toast("Nothing to undo.",true);return;}
 const previous=hydrate(undoStack.pop());if(previous){state=previous;lastStage=state.stage;persist();render();}
}
function choose(type){
 selectedTool=type;renderTools();$("removeTool").classList.toggle("active",selectedTool==="remove");
 $("tip").textContent=type==="remove"?"Click a building to dismantle it and recover half the purchase price.":type==="drill"?"Drills must be placed on the brown or grey ore deposits.":BUILDINGS[type]?.detail||"Choose a tool.";
}
function renderTools(){
 const keys=Object.keys(BUILDINGS);
 $("tools").innerHTML=keys.map((type,i)=>{
 const b=BUILDINGS[type],locked=!unlocked(state,type);
 return '<button class="tool '+(selectedTool===type?"active":"")+'" data-tool="'+type+'" '+(locked?"disabled":"")+' title="'+safeText(b.detail)+'">'
 +'<span class="toolicon">'+b.icon+'</span><span class="toolkey">'+(i+1)+'</span>'
 +'<span class="toolname">'+safeText(b.name)+'</span>'
 +'<span class="toolcost">'+(locked?"🔒 Contract "+String(b.unlock).padStart(2,"0"):money(b.cost))+'</span></button>';
 }).join("");
 $("dirLabel").textContent=directions[direction];
}
const itemLabel=item=>({iron_ore:"Fe",copper_ore:"Cu",iron_plate:"Fe",copper_plate:"Cu",gear:"⚙",circuit:"⌘",science:"⬡"}[item]||"?");
function renderBoard(){
 const supply=power(state);
 const dim=supply.demand>supply.supply;
 const html=[];
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const c=cellAt(state,x,y),ore=depositAt(x,y);
   const selectedClass=selected?.x===x&&selected?.y===y?" selected":"";
   const typeClass=c?" "+c.type:ore?" ore ore-"+(ore==="iron_ore"?"iron":"copper"):"";
   const light=dim&&c&&BUILDINGS[c.type]?.power?" unpowered":"";
   const name=c?c.type==="dock"?"Shipping dock":BUILDINGS[c.type]?.name||c.type:ore?ITEMS[ore].name+" deposit":"Empty floor";
   const caption=c?inspect(state,x,y):name;
   let inner="";
   if(c){
     inner='<span class="machine" aria-hidden="true">'+(c.type==="dock"?"▣":BUILDINGS[c.type]?.icon||"?")+'</span>';
     if(c.type!=="dock"&&c.type!=="solar")inner+='<span class="arrow" aria-hidden="true">'+arrows[c.dir]+'</span>';
     if(c.out)inner+='<span class="cargo '+c.out+'" title="'+safeText(ITEMS[c.out]?.name)+'">'+itemLabel(c.out)+'</span>';
     if(c.job)inner+='<span class="tile-progress" style="width:'+Math.max(0,Math.floor(100*(c.job.total-c.job.remaining)/c.job.total))+'%"></span>';
   }else if(ore){inner='<span class="oremark">'+(ore==="iron_ore"?"Fe":"Cu")+'</span>';}
   html.push('<button class="tile'+typeClass+selectedClass+light+'" type="button" role="gridcell" data-x="'+x+'" data-y="'+y+'" aria-label="Column '+(x+1)+', row '+(y+1)+': '+safeText(name)+'" title="'+safeText(caption)+'">'+inner+'</button>');
 }
 $("board").innerHTML=html.join("");
}
function mission(){
 const c=CONTRACTS[state.stage];
 $("stageNumber").textContent=String(Math.min(state.stage+1,CONTRACTS.length)).padStart(2,"0")+" / 06";
 if(!c){
  $("contractTitle").textContent="Industrial Mastery";
  $("contractBrief").textContent="You completed all six contracts. Freeplay continues: optimise throughput, build a larger factory and break your records.";
  $("objectives").innerHTML='<p class="reward">🏆 CAMPAIGN COMPLETE</p>';
  $("reward").textContent="Infinite freeplay unlocked · No time limit";
  $("chapterFill").style.width="100%";
  return;
 }
 $("contractTitle").textContent=c.name;
 $("contractBrief").textContent=c.brief;
 $("reward").textContent="+ "+money(c.reward)+" contract bonus";
 $("chapterFill").style.width=(100*state.stage/CONTRACTS.length)+"%";
 $("objectives").innerHTML=Object.entries(c.need).map(([item,need])=>{
 const count=Math.min(need,state.stageProgress[item]||0),pct=Math.round(100*count/need);
 return '<div class="objective"><div class="objective-head"><span>'+safeText(ITEMS[item].name)+'</span><strong>'+count+' / '+need+'</strong></div><div class="progress" role="progressbar" aria-valuenow="'+count+'" aria-valuemin="0" aria-valuemax="'+need+'"><span style="width:'+pct+'%"></span></div></div>';
 }).join("");
}
function stats(){
 $("credits").textContent=money(state.credits);
 const p=power(state);
 $("power").textContent=p.demand+" / "+p.supply;
 $("power").parentElement.classList.toggle("power-warning",p.demand>p.supply);
 $("shift").textContent=String(Math.floor(state.ticks/100)).padStart(2,"0")+":"+String(state.ticks%100).padStart(2,"0");
 $("simState").textContent=state.paused?"PAUSED":p.demand>p.supply?"BROWNOUT · ADD SOLAR":"FACTORY ONLINE";
 $("floorSummary").textContent=state.victory?"FREEPLAY UNLOCKED":(state.paused?"SIMULATION PAUSED":"LIVE SIMULATION");
 $("pauseButton").textContent=state.paused?"▶ Resume":"Ⅱ Pause";
 $("speedButton").textContent=state.speed+"× speed";
 $("undoButton").disabled=undoStack.length===0;
 $("production").innerHTML=Object.entries(ITEMS).map(([name,item])=>
  '<div class="telemetry"><span>'+safeText(item.name)+'</span><strong>'+(state.stats.delivered[name]||0).toLocaleString()+'</strong></div>'
 ).join("")+'<div class="telemetry"><span>Lifetime revenue</span><strong>'+money(state.stats.earned)+'</strong></div><div class="telemetry"><span>Machines built</span><strong>'+state.stats.built+'</strong></div>';
 $("campaign").innerHTML=CONTRACTS.map((contract,i)=>
 '<div class="campaign-item '+(i<state.stage?"complete":i===state.stage?"current":"")+'"><div class="campaign-number">'+(i<state.stage?"✓":String(i+1).padStart(2,"0"))+'</div><div class="campaign-name">'+safeText(contract.name)+'</div></div>'
 ).join("");
 $("events").innerHTML=state.events.slice(0,5).map(e=>'<li>'+safeText(e)+'</li>').join("");
}
function inspector(){
 if(!selected)return;
 const {x,y}=selected,c=cellAt(state,x,y),ore=depositAt(x,y);
 $("inspectHeading").textContent=c?(c.type==="dock"?"Shipping dock":BUILDINGS[c.type]?.name||c.type):ore?ITEMS[ore].name+" deposit":"Vacant construction site";
 $("inspectText").textContent=inspect(state,x,y);
 $("selectedCoords").textContent="GRID X"+String(x+1).padStart(2,"0")+" · Y"+String(y+1).padStart(2,"0")+(c&&c.type!=="dock"?" · Right-click to rotate":"");
}
function render(){renderBoard();renderTools();mission();stats();inspector();}
function interact(x,y){
 selected={x,y};
 if(selectedTool==="remove"){
   record();const result=edit(state,x,y,"remove",direction);
   if(!result.ok){undoStack.pop();toast(result.error,true);}else{toast("Dismantled · 50% refunded");persist();}
 }else if(!cellAt(state,x,y)){
   record();const result=edit(state,x,y,selectedTool,direction);
   if(!result.ok){undoStack.pop();toast(result.error,true);}
   else{persist();toast(BUILDINGS[selectedTool].name+" installed · "+money(BUILDINGS[selectedTool].cost));}
 }else{
   $("tip").textContent=inspect(state,x,y);
 }
 render();
}
$("board").addEventListener("click",ev=>{const tile=ev.target.closest("[data-x][data-y]");if(tile)interact(Number(tile.dataset.x),Number(tile.dataset.y));});
$("board").addEventListener("contextmenu",ev=>{
 const tile=ev.target.closest("[data-x][data-y]");if(!tile)return;
 ev.preventDefault();const x=Number(tile.dataset.x),y=Number(tile.dataset.y);selected={x,y};
 record();const result=rotate(state,x,y);
 if(!result.ok){undoStack.pop();toast(result.error,true);}
 else{persist();toast("Rotated output to "+directions[cellAt(state,x,y).dir]);}
 render();
});
$("tools").addEventListener("click",ev=>{const b=ev.target.closest("[data-tool]");if(b)choose(b.dataset.tool);});
$("rotateTool").addEventListener("click",()=>{direction=(direction+1)%4;renderTools();});
$("removeTool").addEventListener("click",()=>choose("remove"));
$("undoButton").addEventListener("click",undo);
$("pauseButton").addEventListener("click",()=>{state.paused=!state.paused;persist();stats();});
$("speedButton").addEventListener("click",()=>{state.speed=state.speed===1?2:state.speed===2?4:1;persist();stats();});
$("helpButton").addEventListener("click",()=>$("guide").showModal());
$("closeGuide").addEventListener("click",()=>$("guide").close());
$("startPlaying").addEventListener("click",()=>$("guide").close());
$("guide").addEventListener("click",ev=>{if(ev.target===$("guide"))$("guide").close();});
$("saveButton").addEventListener("click",()=>{
 const blob=new Blob([serialize(state)],{type:"application/json"}),url=URL.createObjectURL(blob);
 const link=document.createElement("a");link.href=url;link.download="iron-and-logic-tick-"+state.ticks+".json";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Factory save exported.");
});
$("importButton").addEventListener("click",()=>$("saveInput").click());
$("saveInput").addEventListener("change",async ev=>{
 const file=ev.target.files?.[0];if(!file)return;
 try{const imported=hydrate(await file.text());if(!imported)throw Error("Invalid or incompatible save.");
   if(!confirm("Replace your current factory with the imported save?"))return;
   state=imported;lastStage=state.stage;undoStack=[];persist();render();toast("Factory restored.");}
 catch(err){toast(err.message,true);}finally{ev.target.value="";}
});
$("newButton").addEventListener("click",()=>{
 if(!confirm("Start a fresh factory? Your current autosave will be replaced. Export it first if you want to keep it."))return;
 state=newGame();lastStage=0;undoStack=[];selected=null;selectedTool="belt";persist();render();toast("Fresh campaign started.");
});
document.addEventListener("keydown",ev=>{
 if(ev.altKey||ev.ctrlKey||ev.metaKey||["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;
 if(ev.key==="Escape"&&$("guide").open){$("guide").close();return;}
 if($("guide").open)return;
 const number=Number(ev.key);
 if(Number.isInteger(number)&&number>=1&&number<=8){choose(Object.keys(BUILDINGS)[number-1]);return;}
 if(ev.key.toLowerCase()==="r"){direction=(direction+1)%4;renderTools();}
 if(ev.key.toLowerCase()==="z"){undo();}
 if(ev.key==="Delete"||ev.key==="Backspace"){choose("remove");}
 if(ev.code==="Space"){ev.preventDefault();state.paused=!state.paused;persist();stats();}
});
setInterval(()=>{
 if(!state.paused){
  for(let i=0;i<state.speed;i++)step(state);
  if(lastStage!==state.stage){
    lastStage=state.stage;toast(state.victory?"🏆 All six contracts complete!":'✓ Contract complete! New technology unlocked.');persist();
  }
  if(state.ticks%25===0)persist();
 }
 render();
},370);
render();
try{if(!localStorage.getItem(INTRO)){$("guide").showModal();localStorage.setItem(INTRO,"shown");}}catch{}
