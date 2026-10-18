import assert from "node:assert/strict";
import {chromium} from "playwright";
import AxeBuilder from "@axe-core/playwright";

const browser=await chromium.launch({headless:true});
const base="http://127.0.0.1:8123";
let failures=0;
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:820},deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  const response=await page.goto(base,{waitUntil:"networkidle"});
  assert.equal(response.status(),200,"home page HTTP");
  assert.match(await page.title(),/The Undercity/);
  await page.locator('[data-act="intro"]').first().click();
  await page.locator('[data-act="origin"]').first().click();
  await page.locator('[data-act="faction"]').first().click();
  await page.locator('[data-act="escape"]').first().click();
  await page.locator("main h1").first().waitFor();
  // Choosing an action must navigate into a visible, clearly announced outcome
  // without requiring a manual upward scroll (especially at mobile widths).
  const firstResult=page.locator("#action-result");
  await firstResult.waitFor({state:"visible"});
  assert.equal(await firstResult.getAttribute("role"),"region");
  assert.match(await firstResult.innerText(),/Your action has resolved/i);
  const receipt=await page.evaluate(()=>{
   const card=document.querySelector("#action-result"),header=document.querySelector("header");
   const rect=card.getBoundingClientRect();
   return {top:rect.top,headerBottom:header.getBoundingClientRect().bottom,
    focus:document.activeElement?.id,viewport:window.innerHeight};
  });
  assert.equal(receipt.focus,"action-result","result is keyboard/screen-reader focus after escape");
  assert.ok(receipt.top>=receipt.headerBottom-4,"result starts beneath sticky header: "+JSON.stringify(receipt));
  assert.ok(receipt.top<receipt.viewport*.8,"result is visible without scrolling: "+JSON.stringify(receipt));
  await page.locator('[data-act="dismiss"]').first().click();
  assert.equal(await page.locator("#action-result").count(),0);
  const preview=page.locator('details.story-preview[open]').first();
  const beforeBrowse=await page.locator('#topstats').innerText();
  await preview.locator('[data-act="back-stories"]').click();
  assert.equal(await page.locator('details.story-preview[open]').count(),0,"free back returns to previews");
  assert.equal(await page.locator('#topstats').innerText(),beforeBrowse,"browsing spends no actions or currency");
  await page.locator('details.story-preview summary').first().click();
  assert.equal(await page.locator('details.story-preview[open]').count(),1,"one story open at a time");
  const choices=page.locator('main button[data-act="choose"]:not([disabled])');
  assert.ok(await choices.count()>0,"starting district has playable story choices");
  const playedId=await choices.first().locator("xpath=ancestor::article").getAttribute("data-story-id");
  await choices.first().scrollIntoViewIfNeeded();
  await choices.first().click();
  await firstResult.waitFor({state:"visible"});
  const resultView=await page.evaluate(()=>{
   const el=document.querySelector("#action-result");
   return {top:el.getBoundingClientRect().top,headerBottom:document.querySelector("header").getBoundingClientRect().bottom,
    focus:document.activeElement?.id,viewport:innerHeight,scroll:scrollY};
  });
  assert.equal(resultView.focus,"action-result","chosen branch receives focus");
  assert.ok(resultView.top>=resultView.headerBottom-4,"branch result is not obscured: "+JSON.stringify(resultView));
  assert.ok(resultView.top<resultView.viewport*.8,"branch result appears on screen: "+JSON.stringify(resultView));
  assert.match(await firstResult.innerText(),/You chose:/,"player sees which branch was played");
  assert.match(await firstResult.innerText(),/What changed/i,"quality and action deltas shown");
  await page.locator('[data-act="dismiss"]').first().click();
  assert.equal(await page.locator("#action-result").count(),0);
  const returned=await page.evaluate(()=>({id:document.activeElement?.dataset.storyId,top:document.activeElement?.getBoundingClientRect().top,headerBottom:document.querySelector("header").getBoundingClientRect().bottom}));
  assert.ok(returned.id,"Continue restores keyboard focus to a story, including after one-off stories disappear");
  if(await page.locator('article[data-story-id="'+playedId+'"]').count())assert.equal(returned.id,playedId,"repeatable story remains the reading return point");
  assert.ok(returned.top>=returned.headerBottom-4&&returned.top<820,"returned story is visible beneath header");
  // A Read card tap from the bottom of the mobile page must present the
  // actual selected opportunity, not merely scroll to the district hero.
  const handCard=page.locator('aside.aside-right button[data-act="card"]').first();
  assert.ok(await handCard.count()>0,"opening hand has opportunity cards");
  await handCard.click();
  const openCard=page.locator("#open-storylet");
  await openCard.waitFor({state:"visible"});
  const cardView=await page.evaluate(()=>{
   const el=document.querySelector("#open-storylet");
   return {top:el.getBoundingClientRect().top,headerBottom:document.querySelector("header").getBoundingClientRect().bottom,
    focus:document.activeElement?.id,viewport:innerHeight};
  });
  assert.equal(cardView.focus,"open-storylet","Read card moves keyboard focus to actual card");
  assert.ok(cardView.top>=cardView.headerBottom-4,"open card clears header: "+JSON.stringify(cardView));
  assert.ok(cardView.top<cardView.viewport*.8,"selected card is visible: "+JSON.stringify(cardView));
  assert.match(await openCard.innerText(),/Opportunity card/i);
  await page.locator('#open-storylet button[data-act="dismiss"]').click();
  assert.equal(await openCard.count(),0,"putting card away restores the district");
  if(width===390){
   const dims=await page.evaluate(()=>({w:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(dims.w<=dims.viewport+2,"mobile horizontal overflow: "+JSON.stringify(dims));
  }
  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  const severe=axe.violations.filter(v=>v.impact==="critical"||v.impact==="serious");
  for(const v of axe.violations)console.log("AXE "+width+"px "+v.impact+" "+v.id+" ("+v.nodes.length+" nodes): "+v.help);
  assert.equal(severe.length,0,"serious accessibility violations at "+width+"px");
  assert.deepEqual(errors,[],"runtime JavaScript errors at "+width+"px");
  console.log("BROWSER PASS "+width+"px · outcomes, opportunity cards, auto-scroll, keyboard focus, continue, 0 JS errors, WCAG A/AA");
  await context.close();
 }
 const cmsContext=await browser.newContext({viewport:{width:1280,height:820}});
 const cmsPage=await cmsContext.newPage();
 const cmsErrors=[];
 cmsPage.on("pageerror",err=>cmsErrors.push(err.message));
 const cmsResponse=await cmsPage.goto(base+"/tools/cms/",{waitUntil:"networkidle"});
 assert.equal(cmsResponse.status(),200,"Narrative Studio HTML must load");
 assert.match(await cmsPage.title(),/QBN Studio/);
 await cmsPage.locator("#new-story").click();
 await cmsPage.locator("#editor").waitFor({state:"visible"});
 assert.deepEqual(cmsErrors,[],"Narrative Studio browser errors");
 const ai= cmsPage.locator("#groq-studio");
 assert.equal(await ai.isVisible(),true,"Groq panel should mount in the editor");
 assert.equal(await cmsPage.locator("#groq-mode option").count(),14,"every writing workflow must be available");
 assert.equal(await cmsPage.locator("#groq-apply").isDisabled(),true,"nothing may apply before preview");
 assert.ok((await cmsPage.locator("#groq-access").getAttribute("type"))==="password","do not show the access code");
 console.log("BROWSER PASS QBN Groq partner · 14 AI tasks, protected access-code field, preview-only default");
 // This uses a test-only mock, never a real Groq API key or the live provider.
 await cmsPage.route("https://qbn-studio-ai.parris-neathaustralia.workers.dev/v1/assist",async route=>{
  const sent=route.request().postDataJSON();
  assert.equal(sent.game,"undercity");
  if(sent.mode==="repair"){
   assert.ok(Array.isArray(sent.context.qa_errors),"the browser should send its current QA error list");
   const draft=sent.context.active_story;
   const proposal={...draft,title:"The Automatically Repaired Ledger",
     description:"At the registry, a witness demands that you record every household whose light has been taken, despite the Council's threats.",
     pitch:"A contested household record becomes a test of courage and civic duty.",
     choices:draft.choices.map((c,i)=>({...c,
       label:i===0?"Record the names before the officials arrive":"Protect the witnesses from the Council",
       stat:i===0?"observation":"persuasion",difficulty:6,mode:"broad",action_cost:1,
       success:{title:"A protected testimony",text:"The families' names survive in a record that the Council cannot quietly burn.",effects:[{type:"quality",id:"observation",amount:1}]},
       failure:{title:"The seal closes",text:"The clerk seizes the register, but a frightened neighbour keeps a careful copy.",effects:[{type:"menace",id:"suspicion",amount:1}]}
     }))};
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
     summary:"Fixed all draft fields and valid effects",proposal,issues:[],notes:[],model:"openai/gpt-oss-120b"})});
   return;
  }
  assert.equal(sent.mode,"pitch");
  assert.equal(route.request().headers()["x-studio-access"],"test-only");
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
   summary:"A witness must choose whom their testimony protects.",
   proposal:{title:"The Lantern of Absent Names",description:"At the registry a witness fears her testimony will endanger every family whose lamp has gone dark.",pitch:"An original public-record mystery with consequences.",choices:[]},
   issues:[],notes:["A later letter can acknowledge the witness."],model:"openai/gpt-oss-120b"
  })});
 });
 await cmsPage.locator("#groq-access").fill("test-only");
 await cmsPage.locator("#groq-generate").click();
 await cmsPage.locator("#groq-review").waitFor({state:"visible"});
 assert.match(await cmsPage.locator("#groq-summary").textContent(),/witness/);
 assert.equal(await cmsPage.locator("#groq-apply").isEnabled(),true,"reviewed proposal becomes manually applicable");
 cmsPage.once("dialog",dialog=>dialog.accept());
 await cmsPage.locator("#groq-apply").click();
 assert.match(await cmsPage.locator("#editor-title").textContent(),/Lantern of Absent Names/);
 console.log("BROWSER PASS Groq mock · request, preview, explicit confirmation, draft update without a live key");
 assert.equal(await cmsPage.locator("#groq-qa-fix").count(),1);
 await cmsPage.locator("#groq-qa-fix").click();
 await cmsPage.waitForFunction(()=>document.querySelector("#groq-feedback")?.textContent?.includes("0 blocking issue(s)"),{timeout:30000});
 assert.match(await cmsPage.locator("#editor-title").textContent(),/Automatically Repaired Ledger/);
 const fixed=await cmsPage.evaluate(()=>{
  const drafts=JSON.parse(localStorage.getItem("qbn.studio.undercity.v1")||"[]");
  return drafts[0];
 });
 assert.equal(fixed.choices.length,2);
 assert.equal(fixed.choices[0].success.effects[0].type,"quality");
 assert.equal(fixed.choices[0].success.effects[0].amount,1);
 assert.ok(Object.values(fixed.qa).every(v=>v===false),"AI must not self approve");
 await cmsPage.locator("#groq-undo").click();
 assert.match(await cmsPage.locator("#editor-title").textContent(),/Lantern of Absent Names/);
 console.log("BROWSER PASS Groq Auto Fix · Quality Gates shortcut, schema repair, QA=0, local backup/undo");



 // Exact mobile bug report: AI/QA could be satisfied while the pitch-stage
 // gate still rejected the draft. The repair must write pitch AND unlock stage.
 await cmsPage.locator("#new-story").click();
 await cmsPage.locator('[data-path="title"]').fill("The Silent Landlord");
 await cmsPage.locator('[data-path="description"]').fill(
  "A landlord offers to erase the arrears of a struggling household, provided the tenant gives him the names of their neighbours.");
 await cmsPage.locator('[data-path="choices.0.label"]').fill("Publish the threatened neighbours' names");
 await cmsPage.locator('[data-path="choices.1.label"]').fill("Protect the neighbours and challenge the debt");
 assert.equal(await cmsPage.locator('[data-path="pitch"]').inputValue(),"");
 assert.match(await cmsPage.locator("#qa-results").innerText(),/pitch/i,
  "a missing pitch must appear in Quality Gates before advancing");
 await cmsPage.locator("#go-next").click();
 assert.match(await cmsPage.locator('[data-path="pitch"]').inputValue(),/Premise:/);
 assert.match(await cmsPage.locator("#editor-subtitle").innerText(),/midflight/);
 console.log("BROWSER PASS Pitch stage · Advance automatically fills empty pitch and opens Structure");

 // Final-stage user report: an empty reviewer used to trap an otherwise
 // complete draft at Peer review. Solo creator approval must remain honest.
 await cmsPage.evaluate(()=>{
  const storageKey="qbn.studio.undercity.v1";
  const drafts=JSON.parse(localStorage.getItem(storageKey)||"[]");
  const item=drafts.find(d=>d.title==="The Silent Landlord");
  if(!item)throw Error("Expected fixture draft in browser storage");
  item.status="review";item.author="Solo game creator";item.reviewer="";
  item.pitch="A landlord offers a dangerous compromise, forcing the player to protect tenants or expose the forged household registry.";
  item.choices.forEach((c,i)=>{
   c.label=i===0?"Publish the threatened neighbours' names":"Protect the neighbours and confront the landlord";
   c.success={title:"The tenants remember",text:"A courageous neighbour secures the household accounts before anyone can erase their names.",effects:[]};
   c.failure={title:"An uneasy silence",text:"The landlord threatens witnesses, but the oldest tenant hides a copy of the true ledger.",effects:[]};
  });
  localStorage.setItem(storageKey,JSON.stringify(drafts));
 });
 await cmsPage.reload({waitUntil:"networkidle"});
 await cmsPage.locator('[data-open]').filter({hasText:"The Silent Landlord"}).first().click();
 assert.equal(await cmsPage.locator("#solo-approve").isVisible(),true);
 assert.equal(await cmsPage.locator("#download-publish").isDisabled(),true);
 cmsPage.once("dialog",dialog=>dialog.accept());
 await cmsPage.locator("#go-next").click();
 assert.match(await cmsPage.locator("#editor-subtitle").innerText(),/approved/);
 assert.equal(await cmsPage.locator("#download-publish").isEnabled(),true);
 const soloState=await cmsPage.evaluate(()=>{
  const drafts=JSON.parse(localStorage.getItem("qbn.studio.undercity.v1")||"[]");
  return drafts.find(d=>d.title==="The Silent Landlord");
 });
 assert.equal(soloState.review_mode,"solo-creator");
 assert.equal(soloState.creator_approval.independent_human_review,false);
 assert.equal(soloState.reviewer,"");
 assert.ok(!soloState.qa.peer);
 console.log("BROWSER PASS Solo review · peer-review blocker removed with explicit creator consent and honest export provenance");
 // One-tap path should complete an unfinished Pitch draft and record real AI
 // assistance only because a mock Groq generation succeeded.
 await cmsPage.locator("#new-story").click();
 await cmsPage.locator("#groq-access").fill("test-only");
 cmsPage.once("dialog",dialog=>dialog.accept());
 await cmsPage.locator("#groq-fasttrack").click();
 await cmsPage.waitForFunction(()=>{
  const subtitles=document.querySelector("#editor-subtitle")?.textContent||"";
  return subtitles.includes("approved")&&
   document.querySelector("#groq-feedback")?.textContent?.includes("SOLO CREATOR");
 },{timeout:30000});
 const completed=await cmsPage.evaluate(()=>{
  const drafts=JSON.parse(localStorage.getItem("qbn.studio.undercity.v1")||"[]");
  return drafts.find(d=>d.title==="The Automatically Repaired Ledger"&&d.review_mode==="solo-creator");
 });
 assert.ok(completed,"one-tap repair must create an exportable creator-approved draft");
 assert.equal(completed.creator_approval.ai_assistance,"groq");
 assert.equal(completed.creator_approval.independent_human_review,false);
 assert.equal(completed.qa.peer,false);
 assert.equal(await cmsPage.locator("#download-publish").isEnabled(),true);
 console.log("BROWSER PASS Groq one-tap · autofill, schema QA, creator confirmation, approved JSON without invented peer");

 console.log("BROWSER PASS Narrative Studio · editor creates draft and loads without JavaScript errors");
 await cmsContext.close();
}finally{await browser.close();}
