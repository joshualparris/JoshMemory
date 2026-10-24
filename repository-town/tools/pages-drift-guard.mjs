// Pure source-continuity check for pinned historical Pages-only code.
export function orderedSubset(oldText,newText) {
  const oldLines=oldText.replace(/\r\n/g,'\n').split('\n');
  const newLines=newText.replace(/\r\n/g,'\n').split('\n');
  let i=0;
  for(const line of newLines)if(line===oldLines[i])i++;
  return i===oldLines.length;
}
export function supersedesPagesOnlyCode(name,oldText,newText) {
  if(name==='ui/npc-chat.js') {
    const previousFocus="    if(!window.matchMedia('(pointer: coarse)').matches)input.focus();";
    const recordedFocus="    if(!window.matchMedia('(pointer: coarse)').matches&&!activities.querySelector('.npc-recorded-conversation'))input.focus();";
    if(!oldText.includes(previousFocus)||!newText.includes(recordedFocus))return false;
    oldText=oldText.replace(previousFocus,recordedFocus);
  } else if(name!=='ui/voicebank.js') return false;
  return orderedSubset(oldText,newText);
}
