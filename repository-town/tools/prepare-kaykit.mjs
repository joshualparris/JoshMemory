/**
 * Prepare KayKit Adventurers for Repository Town.
 * Run from repository-town/ with:
 * node tools/prepare-kaykit.mjs /path/to/KayKit-Character-Pack-Adventures-1.0
 *
 * Four animation-free bodies share an animated donor clip set. Do not
 * dispose keyframe accessors when deleting animations: surviving animations
 * may still refer to the same buffers, which previously caused corrupt GLBs.
 */
import {NodeIO} from '@gltf-transform/core';
import {prune,dedup} from '@gltf-transform/functions';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const source=process.argv[2];
if(!source)throw new Error('Usage: node tools/prepare-kaykit.mjs <source-checkout>');
const from=path.join(source,'addons/kaykit_character_pack_adventures/Characters/gltf');
const out=path.resolve('src/assets/people');
await mkdir(out,{recursive:true});
const io=new NodeIO();
const names=['Knight','Barbarian','Mage','Rogue','Rogue_Hooded'];
const weapon=/^(?:sword|shield|axe|dagger|crossbow|arrow|quiver|bow|wand|staff|weapon|mace|hammer)(?:_|\\b)/i;
const clipPatterns={
 Idle:[/^idle(?:[_ .-]?[ab])?$/i,/^idle/i],
 Walk:[/^walk(?:ing)?(?:[_ .-]?[ab])?$/i,/walk/i],
 Run:[/^run(?:ning)?(?:[_ .-]?[ab])?$/i,/run/i],
 Talk:[/talk/i,/interact/i,/wave/i],
 Sit:[/sitt?ing/i,/sit/i],
};
const candidates=(clips,regexes,used)=>{
 for(const regex of regexes){
  const clip=clips.find(a=>!used.has(a)&&regex.test(a.getName()));
  if(clip)return clip;
 }
 return null;
};
let total=0,keptNames=[],report=[];
for(const [i,name] of names.entries()){
 const src=path.join(from,name+'.glb');
 const doc=await io.read(src);
 const root=doc.getRoot();
 const original=await stat(src);
 const animations=[...root.listAnimations()];
 const chosen=new Map(),used=new Set();
 if(i===0){
  for(const [role,patterns] of Object.entries(clipPatterns)){
   const clip=candidates(animations,patterns,used);
   if(clip){chosen.set(role,clip);used.add(clip);}
  }
  assert(chosen.has('Idle')&&chosen.has('Walk'), 'Donor needs real Idle and Walk clips. Available: '+animations.map(a=>a.getName()).join(', '));
 } 
 // Remove meshes on weapon attachments; do NOT delete handslot bones or
 // skeleton joints because the remaining walk/idle clips target those nodes.
 let removedWeapons=0;
 for(const node of root.listNodes()){
  if(weapon.test(node.getName())&&node.getMesh()){
   node.setMesh(null);removedWeapons++;
  }
 }
 const orphanSamplers=new Set();
 for(const animation of animations){
  if(chosen.size&&[...chosen.values()].includes(animation))continue;
  for(const sampler of animation.listSamplers())orphanSamplers.add(sampler);
  animation.dispose();
 }
 // Dispose only samplers not referenced by any *surviving* animation.
 // Their shared input/output accessors stay alive until graph-based pruning
 // determines which ones are genuinely unused. Never dispose accessors here.
 const survivorSamplers=new Set(root.listAnimations().flatMap(a=>a.listSamplers()));
 for(const sampler of orphanSamplers)if(!survivorSamplers.has(sampler))sampler.dispose();
 for(const [role,anim] of chosen)anim.setName(role);
 await doc.transform(prune({keepLeaves:true,keepAttributes:true,keepExtras:true}),dedup());
 const dest=path.join(out,'kaykit-'+name.toLowerCase().replaceAll('_','-')+'.glb');
 await io.write(dest,doc);
 // Round-trip validation is mandatory: metadata alone does not prove valid
 // keyframe buffer references after pruning.
 const checked=await io.read(dest);
 const clips=checked.getRoot().listAnimations();
 if(i===0){
  assert(clips.some(a=>a.getName()==='Idle')&&clips.some(a=>a.getName()==='Walk'),'Donor animation lost');
  for(const a of clips){
   assert(a.listChannels().length>0,'Empty '+a.getName());
   for(const c of a.listChannels()){
    const sampler=c.getSampler();
    assert(sampler&&sampler.getInput()&&sampler.getOutput()&&c.getTargetNode(),
      'Missing sampler or keyframe buffer in '+a.getName());
    assert(sampler.getInput().getCount()>0&&sampler.getOutput().getCount()>0,
      'Empty keyframe buffer in '+a.getName());
   }
  }
  keptNames=clips.map(a=>a.getName());
 }else assert.equal(clips.length,0,'Body unexpectedly stores duplicate animations');
 assert(checked.getRoot().listSkins().length>0,'Character skeleton lost: '+name);
 assert(checked.getRoot().listMeshes().length>0,'Character mesh lost: '+name);
 const bytes=(await stat(dest)).size;total+=bytes;
 assert(bytes<1_800_000,'Body unexpectedly large: '+name+' '+bytes);
 report.push({name,file:path.basename(dest),bytes,sourceBytes:original.size,keptAnimations:clips.map(a=>a.getName()),removedWeaponNodes:removedWeapons,skins:checked.getRoot().listSkins().length});
 console.log(name,original.size,'=>',bytes,'bytes; removed weapons',removedWeapons,'; clips',clips.map(a=>a.getName()).join(','));
}
assert(total<6_000_000,'Mobile character pack over 6 MB: '+total);
const manifest={
 license:'CC0-1.0',author:'Kay Lousberg / KayKit',
 source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',
 sourceCommit:'672074b73ba276876a19e8816ecdc5241817ab47',
 implementation:'Five identical-rig fantasy/storybook bodies, no carried weapons. Only Knight stores shared animation clips.',
 bodyAssets:report,sharedAnimationsFile:report[0].file,sharedClips:keptNames,
 totalBytes:total
};
await writeFile(path.join(out,'kaykit-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('PASS KayKit GLB asset validation; total',total,'bytes; clips',keptNames);
