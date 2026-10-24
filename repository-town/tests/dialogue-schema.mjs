// RTD-009 / RTAC-003: schema SHAPE and safe descriptors, not the future director.
// Fixture clip text is intentionally not a purported verified ElevenLabs recording.
import assert from 'node:assert/strict';
import {
  DIALOGUE_SCHEMA_VERSION,DIALOGUE_TOPICS,DIALOGUE_CONDITIONS,
  DIALOGUE_EFFECT_ACTIONS,validateDialogueDefinition,assertDialogueDefinition,
} from '../src/dialogue/schema.js';

const fixture = () => ({
  schemaVersion:1,actorKey:'named:rowan',displayName:'Rowan',startNode:'greet',
  nodes:[{
    id:'greet',topic:'introduction',priority:100,
    conditions:[{type:'location-visited',placeId:'town-square',not:true,onUnknown:'deny'}],
    choices:[{
      id:'ask-directions',label:'Could you show me the way?',priority:40,
      conditions:[{type:'time-window',startMinute:420,endMinute:1320}],
      response:{kind:'recorded',clip:{
        provider:'fixture',actorKey:'named:rowan',event:'help',
        clipId:'fixture.rowan.help',transcript:'A sample script for tests only.',
      }},
      nextNode:'second',
      effects:[{actionId:'dialogue.flag.set',flag:'asked-rowan-directions',value:true}],
    },{
      id:'farewell',label:'Goodbye',priority:0,conditions:[],
      response:{kind:'none'},nextNode:null,effects:[],
    }],
  },{
    id:'second',topic:'directions',priority:40,conditions:[],choices:[{
      id:'return',label:'Another question',priority:0,conditions:[],
      response:{kind:'text',text:'Text-only test response, not an MP3.'},
      nextNode:'greet',effects:[],
    }],
  }],
});

function deepFreeze(value) {
  if(value&&typeof value==='object'){
    for(const item of Object.values(value))deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}
function reject(update,path,expectedCode,{options={allowFixtureClips:true}}={}){
  const d=fixture();
  update(d);
  const r=validateDialogueDefinition(d,options);
  assert.equal(r.ok,false,'invalid fixture was accepted: '+path);
  assert(r.errors.some(e=>e.path.includes(path)&&(expectedCode===undefined||e.code===expectedCode)),
    'error must identify '+path+' / '+expectedCode+': '+JSON.stringify(r.errors));
  assert.throws(()=>assertDialogueDefinition(d,options),TypeError);
}
assert.equal(DIALOGUE_SCHEMA_VERSION,1);
for(const set of [DIALOGUE_TOPICS,DIALOGUE_CONDITIONS,DIALOGUE_EFFECT_ACTIONS]){
  assert(Object.isFrozen(set));assert.equal(new Set(set).size,set.length);
}
assert(DIALOGUE_TOPICS.includes('quest'));
assert(DIALOGUE_EFFECT_ACTIONS.includes('quest.advance'));
assert(!DIALOGUE_EFFECT_ACTIONS.includes('runJavascript'));

const valid=deepFreeze(fixture()),baseline=JSON.stringify(valid);
assert.equal(validateDialogueDefinition(valid,{allowFixtureClips:true}).ok,true);
assert.equal(assertDialogueDefinition(valid,{allowFixtureClips:true}),valid);
assert.equal(JSON.stringify(valid),baseline,'validator must not mutate caller or execute effects');
assert.equal(validateDialogueDefinition(valid).ok,false,'fixture clips rejected outside explicit test mode');
const worker={
  schemaVersion:1,actorKey:'worker:27',displayName:'Errol',startNode:'work',
  nodes:[{id:'work',topic:'work',priority:5,conditions:[
    {type:'worker-on-duty',actorKey:'worker:27'},
    {type:'shop-open',placeId:'town-hall'},
    {type:'money-at-least',amount:0},
  ],choices:[{
    id:'work-question',label:'May I ask about work?',priority:1,
    conditions:[{type:'inventory-at-least',itemId:'paper',quantity:1}],
    response:{kind:'text',text:'This is only a worker schema sample.'},
    nextNode:null,effects:[{actionId:'trade.offer',itemId:'paper'}],
  }]}],
};
const household={
  schemaVersion:1,actorKey:'resident:A8',startNode:'home',
  nodes:[{id:'home',topic:'relationship',priority:0,conditions:[
    {type:'relationship-at-least',actorKey:'named:rowan',value:0},
    {type:'npc-near',actorKey:'worker:27',maxDistanceMeters:18.5},
    {type:'flag',flag:'met-neighbour',equals:true},
    {type:'quest-stage',questId:'neighbour-help',operator:'gte',value:1},
  ],choices:[{id:'welcome',label:'Hello',priority:-10,conditions:[],
    response:{kind:'none'},nextNode:null,
    effects:[{actionId:'quest.accept',questId:'neighbour-help'},
      {actionId:'quest.advance',questId:'neighbour-help',toStage:2},
      {actionId:'quest.complete',questId:'neighbour-help'},
      {actionId:'repair.offer',serviceId:'clock'},
      {actionId:'relationship.propose',actorKey:'named:rowan',delta:1}],
  }]}],
};
assert.equal(validateDialogueDefinition(worker).ok,true,'valid worker key/conditions');
assert.equal(validateDialogueDefinition(household).ok,true,'valid resident and all typed actions');

reject(d=>{d.schemaVersion=2},'schemaVersion','schema-version');
reject(d=>{d.actorKey='Rowan'},'actorKey','actor-key');
reject(d=>{d.actorKey='resident:A11'},'actorKey','actor-key');
reject(d=>{d.nodes[0].topic='script'},'topic','topic');
reject(d=>{d.nodes[0].priority=Infinity},'priority','integer');
reject(d=>{d.nodes[0].choices[0].priority=101},'priority','integer');
reject(d=>{d.nodes[0].choices[0].label=''},'label','string');
reject(d=>{d.nodes[0].choices[0].nextNode='javascript:alert(1)'},'nextNode','id');
reject(d=>{d.nodes[0].choices[0].response.clip.actorKey='named:kit'},'clip.actorKey','speaker-mismatch');
reject(d=>{d.nodes[0].choices[0].response.clip.provider='malicious-url'},'clip.provider','clip-provider');
reject(d=>{d.nodes[0].choices[0].response.clip.event='purchase-success'},'clip.event','clip-event');
reject(d=>{d.nodes[0].choices[0].response.clip.transcript=''},'clip.transcript','string');
reject(d=>{d.nodes[0].choices[0].response.clip.sha256='bad-sha'},'clip.sha256','sha256');
reject(d=>{d.nodes[0].choices[0].response.text='Wrong actor is speaking'},'response.text','unknown-field');
reject(d=>{d.nodes[0].conditions[0].onUnknown='allow'},'onUnknown','unknown-state');
reject(d=>{d.nodes[0].conditions[0].type='eval';d.nodes[0].conditions[0].code='doBadStuff()'},'type','condition');
reject(d=>{d.nodes[0].choices[0].conditions[0].startMinute=1440},'startMinute','integer');
reject(d=>{d.nodes[0].choices[0].effects[0].actionId='eval';d.nodes[0].choices[0].effects[0].code='process.exit(1)'},'actionId','effect-action');
reject(d=>{d.nodes[0].choices[0].effects[0].script='steal data'},'script','unknown-field');
reject(d=>{d.nodes[0].choices[0].effects[0]={actionId:'quest.advance',questId:'test'}},'toStage','required');
reject(d=>{d.nodes[0].choices[0].effects[0]={actionId:'relationship.propose',actorKey:'named:rowan',delta:200}},'delta','integer');
reject(d=>{d.nodes[0].choices[0].effects[0]={actionId:'relationship.propose',actorKey:'named:rowan',delta:0}},'delta','zero-delta');
reject(d=>{d.nodes[0].choices[0].effects[0]={actionId:'dialogue.flag.set',flag:'abc',value:'yes'}},'value','boolean');
reject(d=>{d.nodes[0].choices[0].effects[0]=()=>42},'effects[0]','object');
reject(d=>{d.nodes[0].choices[0].conditions=[];d.nodes[0].choices[0].conditions.push({type:'money-at-least',amount:-1})},'amount','integer');
reject(d=>{Object.defineProperty(d.nodes[0].choices[0].response.clip,'transcript',{get(){throw Error('unexpected getter execution');},enumerable:true})},'clip','object');

// RTD-012 has not implemented graph reachability or target resolution;
// only the shape of nextNode is checked at RTD-009.
const unresolved=fixture();
unresolved.nodes[0].choices[0].nextNode='not-yet-authored';
assert(validateDialogueDefinition(unresolved,{allowFixtureClips:true}).ok,
  'future RTD-012, not RTD-009, owns link resolution');
console.log('PASS RTD-009 / RTAC-003: 3 actor namespaces, clip ownership, typed conditions, '+
  '7 allowlisted descriptor actions, immutable schema input and negative injection cases; '+
  'no gameplay effect executed, no real clip claimed');
