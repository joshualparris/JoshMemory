// The Pages /latest/ QA site is independently built, verified and published.
// It is NOT a file in the stable production backup release.json. Before allowing
// the stable mirror to preserve it, independently verify every game asset in
// its own release manifest and the narrowly permitted photo-comparison extras.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const SHA256=/^[a-f0-9]{64}$/;
const SHA40=/^[a-f0-9]{40}$/;
const safeRelative=(name)=>typeof name==='string'&&name.length>0&&
  !name.includes('\\')&&!name.startsWith('/')&&!name.includes('//')&&
  name.split('/').every(s=>s&&s!=='.'&&s!=='..');
const digest=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

export function verifyIndependentPagesPreview(site, trackedPaths, expectedScreenshotCount=48) {
  if(!Array.isArray(trackedPaths))throw Error('Preview audit needs tracked paths');
  const listed=trackedPaths.filter(p=>p.startsWith('latest/'));
  const previewRoot=path.join(site,'latest');
  if(!listed.length) {
    if(fs.existsSync(previewRoot))throw Error('Pages preview exists but is not tracked: latest/');
    return {preserve:false,checked:0};
  }
  const tracked=new Set(listed);
  if(!tracked.has('latest/release.json'))throw Error('Independently published preview has no tracked release.json');
  const release=JSON.parse(fs.readFileSync(path.join(previewRoot,'release.json'),'utf8'));
  if(!SHA40.test(release.sourceCommit)||!SHA256.test(release.contentHash)||
      !release.files||typeof release.files!=='object'||Array.isArray(release.files)||
      Object.keys(release.files).length<1)
    throw Error('Invalid independent latest/ release manifest');
  const expected=new Set(['latest/release.json']);
  for(const [relative,hash] of Object.entries(release.files)){
    if(!safeRelative(relative)||!SHA256.test(hash))throw Error('Unsafe preview manifest entry: '+relative);
    const name='latest/'+relative;
    if(!tracked.has(name))throw Error('Missing tracked preview asset: '+name);
    if(digest(path.join(previewRoot,...relative.split('/')))!==hash)
      throw Error('Independent preview game asset changed: '+name);
    expected.add(name);
  }
  // This separate QA publish workflow appends only report/index HTML and a
  // fixed set of 48 game-only screenshot PNGs after the release manifest was
  // generated. The global git-clean precondition protects their committed bytes.
  let screenshotCount=0;
  const extraHTML=new Set();
  for(const name of tracked){
    if(expected.has(name))continue;
    const html=/^latest\/photo-compare\/(index|report)\.html$/.test(name);
    const screenshot=/^latest\/photo-compare\/screenshots\/[A-Za-z0-9_.-]+\.png$/.test(name);
    if(!html&&!screenshot)throw Error('Unknown Pages-only file outside approved QA preview: '+name);
    const file=path.join(site,...name.split('/'));
    if(!fs.statSync(file).isFile()||fs.statSync(file).size===0)
      throw Error('Empty or invalid preview comparison asset: '+name);
    if(html){
      const content=fs.readFileSync(file,'utf8');
      if(/AIza[0-9A-Za-z_-]{35}/.test(content))throw Error('Preview contains hard-coded Google API key: '+name);
      extraHTML.add(name);
    }
    if(screenshot)screenshotCount++;
  }
  if(screenshotCount!==expectedScreenshotCount||extraHTML.size!==2)
    throw Error('Incomplete independent photo comparison workspace: '+screenshotCount+' PNG / '+extraHTML.size+' HTML');
  return {preserve:true,sourceCommit:release.sourceCommit,checked:expected.size-1,
    screenshotCount,contentHash:release.contentHash};
}
