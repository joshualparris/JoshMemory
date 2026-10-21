import fs from 'node:fs';
import path from 'node:path';
const sources=['src/world/visitor-payroll.js','src/world/work-contracts.js','src/world/occupation-work.js','src/world/delivery-work.js','src/world/store-batches.js','src/world/bakery-production.js','src/ui/latte-art.js','src/world/workplay.js','src/world/work-recipes.js','src/world/workplay-view.js','src/ui/work-panels.js','src/ui/soundtrack.js','src/main.js','src/engine/input.js','src/engine/player.js','src/ui/interactions.js','src/ui/townpanels.js','src/ui/economy-panels.js','src/world/life.js','src/world/property.js','src/world/seats.js','src/world/shop-interior.js','src/world/realty-interior.js','src/world/emergency-justice.js','src/world/trade-education.js','src/world/driving.js','src/world/interior.js','src/world/props.js'];
export function companionKnowledge(town){
  const result=[];
  for(const name of sources){const file=path.join(town,name);if(!fs.existsSync(file))continue;
    const lines=fs.readFileSync(file,'utf8').split('\n');
    for(let i=0;i<lines.length;i+=20)result.push({path:name,line:i+1,text:lines.slice(i,i+20).join('\n')});
  }
  return result;
}
