// Dedicated fictional civic rooms recovered in scope from unmerged PR #442.
// Do not import #442's conflicting second farm/vet/brewery economy: the current
// linked-industries.js already owns animal welfare, invoices and deliveries.
// Every room is interpretive. Real-world designs/certifications are not implied.
import { buildInterior } from './interior.js';

export const LINKED_SERVICE_INTERIORS = Object.freeze(['vet', 'hardware']);
const ROOMS = {
  vet: [
    {name:'Veterinary reception',w:12,d:11,props:[
      ['counter','Animal intake and appointment desk',{do:'info',title:'Animal care',text:'Fictional stock and veterinary cases are tracked by the existing town economy; treatment uses actual stocked supplies and paid appointments.'}],
      ['bookshelf','Farm animal records'],['chair','Waiting chair'],['pottedTree','Reception plant']]},
    {name:'Veterinary examination room',w:11,d:10,props:[
      ['table','Animal examination table',{do:'info',title:'Veterinary care room',text:'Animal examination and treatment in Repository Town is fictional, not real clinical advice or an actual local premises.'}],
      ['cabinet','Medicines and sterile instruments'],['microscope','Diagnostic microscope'],['chair','Consultation seat']]},
    {name:'Veterinary medicines and clean storage',w:10,d:9,props:[
      ['fridge','Temperature-controlled medicine storage'],['cabinet','Clean treatment kits'],
      ['shelf','Sample container rack'],['filingCabinet','Supply and appointment records']]}
  ],
  hardware: [
    {name:'Trade hardware counter',w:12,d:11,props:[
      ['counter','Building-materials order desk',{do:'info',title:'Hardware orders',text:'The town trades and construction system pays for actual stock of timber, cement and fixings; this showroom does not create free supplies.'}],
      ['cashRegister','Trade counter till'],['bookshelf','Supplier catalogues'],['chair','Customer chair']]},
    {name:'Timber and building supplies',w:12,d:10,props:[
      ['shelf','Timber and sheet stock'],['crates','Bagged cement and fixings'],
      ['trolley','Material hand trolley'],['workbench','Hand tool demonstrations']]},
    {name:'Warehouse and goods receiving',w:11,d:10,props:[
      ['crates','Delivery pallets'],['shelf','Hardware stock bins'],
      ['trolley','Warehouse pallet trolley'],['filingCabinet','Supplier invoices']]}
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
