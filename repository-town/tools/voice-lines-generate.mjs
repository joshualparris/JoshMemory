#!/usr/bin/env node
// Default: no-charge dry run. Paid calls need explicit flags plus a scoped character cap.
import {readFile,mkdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await readFile(join(root,'voice-lines/roster.json'),'utf8'));
const argv=process.argv.slice(2),has=name=>argv.includes('--'+name);
function value(name,def){const i=argv.indexOf('--'+name);return i<0?def:argv[i+1];}
function positive(x,label){const n=Number(x);if(!Number.isSafeInteger(n)||n<1)throw Error('Invalid '+label);return n;}
if(has('help')){console.log('Dry run: node tools/voice-lines-generate.mjs [--kind named_street_actor|worker|unassigned_house_resident_alias|assigned_house_resident_alias] [--actor worker:0] [--limit N]');console.log('Paid calls: additionally --generate --confirm-paid-batch --approved-budget-chars N and ELEVENLABS_API_KEY.');process.exit(0);}
for(const x of argv)if(x.startsWith('--')&&!['--kind','--actor','--limit','--generate','--confirm-paid-batch','--approved-budget-chars'].includes(x))throw Error('Unknown flag '+x);
const kind=value('kind',null),actor=value('actor',null);
if(kind&&!['named_street_actor','worker','unassigned_house_resident_alias','assigned_house_resident_alias'].includes(kind))throw Error('Unknown actor kind');
const limit=value('limit',null)===null?Infinity:positive(value('limit',null),'limit');
const proposed=catalog.missingAudioScripts.filter(x=>(!kind||x.kind===kind)&&(!actor||x.actorKey===actor)).slice(0,limit);
if(!proposed.length)throw Error('No matching actors');
if(proposed.some(x=>x.recordingStatus!=='scripted_not_generated'))throw Error('Unsafe script status');
const total=proposed.reduce((n,x)=>n+x.text.length,0);
console.log(JSON.stringify({mode:has('generate')?'PAID REQUEST':'NO-COST DRY RUN',lines:proposed.length,characters:total,uniqueVoices:new Set(proposed.map(x=>x.voiceId)).size},null,2));
if(!has('generate')){console.log('No credits spent and no files written.');process.exit(0);}
if(!has('confirm-paid-batch'))throw Error('Explicit --confirm-paid-batch required');
const ceiling=value('approved-budget-chars',null);
if(ceiling===null||total>positive(ceiling,'approved-budget-chars'))throw Error('Proposed characters exceed or lack an approved budget ceiling');
const key=process.env.ELEVENLABS_API_KEY;
if(!key)throw Error('ELEVENLABS_API_KEY is required for approved batch');
if(typeof fetch!=='function')throw Error('Node 18+ required');
const output=join(root,'voice-lines/generated'),manifestPath=join(root,'voice-lines/generated-manifest.json');
await mkdir(output,{recursive:true});
let clips=[];try{clips=JSON.parse(await readFile(manifestPath,'utf8')).clips||[];}catch(e){if(e.code!=='ENOENT')throw e;}
const completed=new Set(clips.map(x=>x.clipId));
for(const row of proposed){
 if(completed.has(row.clipId)){console.log('Skip existing '+row.actorKey);continue;}
 const filename=join(output,row.clipId+'.mp3');
 try{await access(filename);throw Error('Refusing to overwrite unknown file '+filename);}catch(e){if(e.code!=='ENOENT')throw e;}
 // Single call only. No automatic paid retries or duplicate charges.
 const response=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(row.voiceId),{
   method:'POST',headers:{'xi-api-key':key,'Accept':'audio/mpeg','Content-Type':'application/json'},
   body:JSON.stringify({text:row.text,model_id:'eleven_multilingual_v2'})
 });
 if(!response.ok)throw Error('ElevenLabs HTTP '+response.status+' for '+row.actorKey+'. No retry.');
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<200||response.headers.get('content-type')?.includes('application/json'))throw Error('Invalid audio for '+row.actorKey);
 await writeFile(filename,bytes,{flag:'wx'});
 const clip={actorKey:row.actorKey,clipId:row.clipId,voiceId:row.voiceId,text:row.text,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,filename:'generated/'+row.clipId+'.mp3',status:'pending_transcript_and_listening_review'};
 clips.push(clip);completed.add(row.clipId);
 await writeFile(manifestPath,JSON.stringify({schemaVersion:1,clips},null,2)+'\n',{mode:0o600});
 console.log('Saved '+row.actorKey+' (requires listening, caption, licence and game playback checks)');
}
console.log('Batch submitted. Not imported or deployed.');