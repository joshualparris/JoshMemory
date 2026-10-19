// Read-only inventory. Run: GH_TOKEN=... GITHUB_REPOSITORY=owner/repo node tools/integration-report.mjs
// Optionally add exact branch names as command-line arguments. Never merges or deletes.
import { execFileSync } from 'node:child_process';
const repo=process.env.GITHUB_REPOSITORY||'joshualparris/JoshMemory';
const api=(path)=>JSON.parse(execFileSync('gh',['api',path],{encoding:'utf8',maxBuffer:8e6}));
const all=api('/repos/'+repo+'/branches?per_page=100').map(x=>x.name);
const names=process.argv.slice(2).length?process.argv.slice(2):
 all.filter(x=>/^(audit\/repository-town|feat\/(town|living|all-tall)|fix\/(farmhouse|town|traffic)|integration\/(town|government)|repository-town)/.test(x));
const encode=(x)=>encodeURIComponent(x).replace(/%2F/gi,'%2F');
console.log('| Branch | Ahead | Behind | Verdict | Unique files |');
console.log('|---|---:|---:|---|---:|');
for(const name of names){
 try{
  const c=api('/repos/'+repo+'/compare/'+encode('main')+'...'+encode(name));
  const verdict=c.ahead_by===0?'already in main':c.behind_by===0?'candidate (review/tests needed)':'diverged (manual conflict review)';
  const files=(c.files||[]).filter(f=>f.filename.startsWith('repository-town/')).length;
  console.log('| '+name.replace(/[|]/g,'')+' | '+c.ahead_by+' | '+c.behind_by+' | '+verdict+' | '+files+' |');
 }catch(e){console.log('| '+name+' | — | — | review API error | — |');process.exitCode=1;}
}
