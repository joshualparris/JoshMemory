import {buildInterior} from './interior.js';

// Bespoke, connected non-residential rooms; never generic one-counter interiors
// and never misclassified as a private house with a generated bedroom.
const ROOMS={
 vet:[
  {name:'Veterinary reception',w:12,d:11,props:[['counter','Patient intake',{do:'info',text:'The vet records genuine farm-animal cases and charges each farm for care.'}],['bookshelf','Animal records'],['chair','Waiting bench']]},
  {name:'Animal examination room',w:11,d:10,props:[['table','Examination table'],['medicineCabinet','Veterinary medicines'],['heartMonitor','Care monitoring'],['scale','Animal scales']]},
  {name:'Sterile storage',w:10,d:9,props:[['cabinet','Clean veterinary kits'],['fridge','Cold storage'],['specimenJars','Diagnostic samples']]}
 ],
 hardware:[
  {name:'Trade hardware counter',w:12,d:11,props:[['counter','Materials ordering',{do:'info',text:'Physical freight deliveries and building-site orders control real stock.'}],['cashRegister','Trade till'],['toolWall','Hand tools']]},
  {name:'Timber and materials aisle',w:12,d:10,props:[['shelf','Timber bundles'],['partsBins','Fixings and fasteners'],['trolley','Material trolley']]},
  {name:'Goods-receiving warehouse',w:11,d:10,props:[['crates','Freight pallets'],['workbench','Workshop supplies'],['filingCabinet','Supplier invoices']]}
 ],
 brewery:[
  {name:'Brewery reception and quality desk',w:12,d:11,props:[['counter','Batch register',{do:'info',text:'Beer is brewed from actual malt, hops and yeast; fermentation takes three game days.'}],['filingCabinet','Production records'],['barrel','Empty kegs']]},
  {name:'Brewhouse',w:12,d:10,props:[['cauldron','Brewing kettle'],['workbench','Brewer station'],['waterCooler','Water treatment']]},
  {name:'Fermentation and keg storage',w:12,d:11,props:[['barrel','Fermenting vessel'],['barrel','Conditioning vessel'],['crates','Finished keg pallets']]}
 ],
 buildsite:[
  {name:'Builder site office',w:12,d:10,props:[['desk','Build plans',{do:'info',text:'Work advances only with a builder on shift, actual stocked materials and passed inspections.'}],['corkboard','Safety notices'],['filingCabinet','Supplier orders']]},
  {name:'Trade workshop',w:11,d:10,props:[['workbench','Carpenter workbench'],['toolWall','Trade tools'],['partsBins','Construction hardware']]},
  {name:'Construction storage',w:11,d:10,props:[['crates','Timber and cement delivery'],['trolley','Site transport'],['ladder','Access equipment']]}
 ]
};
export const LINKED_INTERIOR_IDS=Object.freeze(Object.keys(ROOMS));
export function buildIndustryInterior(site,makeLabel){
 const rooms=ROOMS[site.id];
 if(!rooms)return null;
 return buildInterior({coordinate:site.id.toUpperCase(),repo:'Town-'+site.id,name:site.name,
   int:{nonResidential:true,layout:'row',floor:0xa79b88,walls:0xd9d8cf,doors:0x685d50,
     ceiling:0xf4f1e9,light:0xffeed5,rooms}},makeLabel);
}
