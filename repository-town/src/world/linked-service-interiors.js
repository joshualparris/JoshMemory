// Dedicated fictional civic rooms recovered in scope from unmerged PR #442.
// Do not import #442's conflicting second farm/vet/brewery economy: the current
// linked-industries.js already owns animal welfare, invoices and deliveries.
// Every room is interpretive. Real-world designs/certifications are not implied.
import { buildInterior } from './interior.js';

export const LINKED_SERVICE_INTERIORS = Object.freeze(['vet']);
const ROOMS = {
  vet: [
    {name:'Veterinary reception',w:12,d:11,props:[
      ['counter','Animal intake and appointment desk',{do:'info',title:'Animal care',text:'Fictional stock and veterinary cases are tracked by the existing town economy; treatment uses actual stocked supplies and paid appointments.'}],
      ['bookshelf','Farm animal records',{do:'info',title:'Farm animal records',text:'The existing herd register tracks health, care and the vet cases recorded for each farm.'}],['chair','Waiting chair'],['pottedTree','Reception plant']]},
    {name:'Veterinary examination room',w:11,d:10,props:[
      ['table','Animal examination table',{do:'info',title:'Veterinary care room',text:'Animal examination and treatment in Repository Town is fictional, not real clinical advice or an actual local premises.'}],
      ['cabinet','Medicines and sterile instruments',{do:'info',title:'Treatment inventory',text:'Each simulated animal treatment consumes a finite veterinary kit and invoices the farm; no free medicine is generated here.'}],['microscope','Diagnostic microscope',{do:'info',title:'Diagnostic workbench',text:'A fictional diagnostic station for the town animals, not an actual test or medical advice.'}],['chair','Consultation seat']]},
    {name:'Veterinary medicines and clean storage',w:10,d:9,props:[
      ['fridge','Temperature-controlled medicine storage',{do:'info',title:'Refrigerated supplies',text:'Simulated medicines are checked and stored away from public waiting areas.'}],['cabinet','Clean treatment kits',{do:'info',title:'Sterile stores',text:'The town economy counts each remaining veterinary treatment kit; restocking is a separate paid supply process.'}],
      ['shelf','Sample container rack',{do:'info',title:'Sample handling',text:'These sample jars are fictional scene furniture; no real patient information is represented.'}],['filingCabinet','Supply and appointment records',{do:'info',title:'Case records',text:'View the simulated business or farm ledger for actual appointment and treatment records.'}]]}
  ]
};
export function buildLinkedServiceInterior(site, makeLabel) {
  const rooms=ROOMS[site.id];
  if(!rooms)return null;
  const built=buildInterior({
    coordinate:site.id.toUpperCase(),repo:'RepositoryTown-'+site.id,
    name:site.name,noBedroom:true,
    int:{nonResidential:true,layout:'row',floor:0xa79b88,walls:0xd9d8cf,doors:0x685d50,
      ceiling:0xf4f1e9,light:0xffeed5,rooms}
  },makeLabel);
  built.linkedServiceLayout={id:site.id,interpretive:true};
  return built;
}
