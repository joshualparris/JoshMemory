import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { verifyIndependentPagesPreview } from '../tools/pages-independent-preview.mjs';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'town-pages-preview-'));
try{
 const game='latest/address-map.html',released='latest/release.json';
 const content='<h1>independent current QA preview</h1>';
 const save=(name,value)=>{const p=path.join(dir,...name.split('/'));fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,value);};
 save(game,content);
 const man={sourceCommit:'a'.repeat(40),contentHash:'b'.repeat(64),files:{'address-map.html':sha(content)}};
 save(released,JSON.stringify(man));
 const tracked=[game,released,'latest/photo-compare/report.html','latest/photo-compare/index.html'];
 save('latest/photo-compare/report.html','<h1>QA report</h1>');
 save('latest/photo-compare/index.html','<h1>QA comparison</h1>');
 for(let i=0;i<48;i++){
  const n='latest/photo-compare/screenshots/pose-'+String(i).padStart(2,'0')+'.png';
  tracked.push(n);save(n,'PNG-test-'+i);
 }
 const initial=verifyIndependentPagesPreview(dir,tracked);
 assert.equal(initial.preserve,true);
 assert.equal(initial.checked,1);
 assert.equal(initial.screenshotCount,48);
 assert.equal(verifyIndependentPagesPreview(path.join(dir,'missing'),[]).preserve,false);
 save(game,'tampered game asset');
 assert.throws(()=>verifyIndependentPagesPreview(dir,tracked),/game asset changed/);
 save(game,content);
 const withUnknown=[...tracked,'latest/unknown.js'];
 save('latest/unknown.js','alert(1)');
 assert.throws(()=>verifyIndependentPagesPreview(dir,withUnknown),/Unknown Pages-only file/);
 fs.rmSync(path.join(dir,'latest/unknown.js'));
 const missing=tracked.filter(n=>n!=='latest/photo-compare/screenshots/pose-00.png');
 assert.throws(()=>verifyIndependentPagesPreview(dir,missing),/Incomplete independent photo comparison/);
 save(released,JSON.stringify({...man,files:{'../secret.txt':sha('secret')}}));
 assert.throws(()=>verifyIndependentPagesPreview(dir,tracked),/Unsafe preview manifest entry/);
 save(released,JSON.stringify(man));
 save('latest/photo-compare/report.html','<script src="https://example.com/?key=AIza'+'A'.repeat(35)+'"></script>');
 assert.throws(()=>verifyIndependentPagesPreview(dir,tracked),/hard-coded Google API key/);
 console.log('PASS independent /latest/ preview retention: manifest SHA, safe paths, all 48 QA screenshots, unknown/tampered/missing/key refusal');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
