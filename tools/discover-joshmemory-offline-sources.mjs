import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile('docs/podcasts.html','utf8');
const match = html.match(/const podcasts=(\[[\s\S]*?\]);\nconst cats=/);
if(!match) throw new Error('Could not extract podcast catalogue');
const podcasts = vm.runInNewContext(match[1], Object.create(null));

const norm = (s='') => String(s)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[’‘]/g,"'")
  .replace(/&/g,' and ')
  .replace(/[^a-z0-9]+/g,' ')
  .trim();

const tokens = s => new Set(norm(s).split(' ').filter(x=>x.length>1));
const overlap = (a,b) => {
  const A=tokens(a), B=tokens(b);
  if(!A.size || !B.size) return 0;
  let common=0; for(const x of A) if(B.has(x)) common++;
  return common / Math.max(A.size,B.size);
};
const showBase = by => String(by||'').split('·')[0].replace(/\s*#\d+\s*$/,'').trim();

async function searchEpisode(p){
  const term = encodeURIComponent(`${p.n} ${showBase(p.by)}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=podcast&entity=podcastEpisode&limit=50&country=US`;
  const res = await fetch(url, {headers:{'user-agent':'JoshMemory-offline-source-audit/1.0'}});
  if(!res.ok) throw new Error(`Apple search ${res.status}`);
  const data = await res.json();
  const ranked=(data.results||[])
    .filter(x=>x.episodeUrl && x.trackName)
    .map(x=>{
      const titleExact=norm(x.trackName)===norm(p.n);
      const titleScore=titleExact?1:overlap(x.trackName,p.n);
      const showScore=Math.max(overlap(x.collectionName||'',showBase(p.by)), overlap(x.artistName||'',showBase(p.by)));
      const score=titleScore*0.82+showScore*0.18;
      return {x,titleExact,titleScore,showScore,score};
    })
    .sort((a,b)=>b.score-a.score);
  const best=ranked[0];
  if(!best) return null;
  return {
    query:url,
    title:p.n,
    by:p.by,
    currentRoute:p.audio?'audio':p.episode?'spotifyEpisode':p.id?'spotifyShow':p.embed?'embed':p.youtube?'youtube':p.external?'external':'unknown',
    currentAudio:p.audio||null,
    spotifyEpisode:p.episode||null,
    spotifyShow:p.id||null,
    matchedTitle:best.x.trackName,
    matchedShow:best.x.collectionName||best.x.artistName||'',
    episodeUrl:best.x.episodeUrl,
    feedUrl:best.x.feedUrl||null,
    trackViewUrl:best.x.trackViewUrl||null,
    releaseDate:best.x.releaseDate||null,
    titleExact:best.titleExact,
    titleScore:Number(best.titleScore.toFixed(3)),
    showScore:Number(best.showScore.toFixed(3)),
    score:Number(best.score.toFixed(3)),
    autoSafe:best.titleExact && best.showScore>=0.35
  };
}

const results=[];
for(const [i,p] of podcasts.entries()){
  if(p.audio){
    results.push({title:p.n,by:p.by,currentRoute:'audio',currentAudio:p.audio,alreadyDirect:true,autoSafe:true});
    continue;
  }
  try {
    const r=await searchEpisode(p);
    results.push(r || {title:p.n,by:p.by,currentRoute:p.episode?'spotifyEpisode':p.id?'spotifyShow':p.embed?'embed':p.youtube?'youtube':p.external?'external':'unknown',notFound:true,autoSafe:false});
  } catch(e) {
    results.push({title:p.n,by:p.by,error:String(e),autoSafe:false});
  }
  if((i+1)%10===0) console.log('searched',i+1,'of',podcasts.length);
  await new Promise(r=>setTimeout(r,120));
}
const safe=results.filter(r=>r.autoSafe && r.episodeUrl && !r.alreadyDirect);
const report={
  generatedAt:new Date().toISOString(),
  total:podcasts.length,
  alreadyDirect:results.filter(r=>r.alreadyDirect).length,
  appleCandidates:results.filter(r=>r.episodeUrl).length,
  autoSafeCandidates:safe.length,
  unmatched:results.filter(r=>r.notFound).length,
  results
};
await mkdir('docs/research',{recursive:true});
await writeFile('docs/research/offline-podcast-source-candidates.json',JSON.stringify(report,null,2));
console.log('SUMMARY',JSON.stringify({total:report.total,alreadyDirect:report.alreadyDirect,appleCandidates:report.appleCandidates,autoSafeCandidates:report.autoSafeCandidates,unmatched:report.unmatched}));
for(const r of safe) console.log('SAFE',JSON.stringify({title:r.title,show:r.matchedShow,url:r.episodeUrl,feed:r.feedUrl,score:r.score}));
