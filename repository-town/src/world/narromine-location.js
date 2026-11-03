// Narromine is a real NSW town. These are deliberately compressed, fictional
// game coordinates, NOT property boundaries, exact roads or surveyed positions.
// Repository Town's real-world anchor and all existing lot IDs stay unchanged.
export const NARROMINE_REAL=Object.freeze({
  name:'Narromine',state:'NSW',postcode:'2821',
  traditionalCountry:'Wiradjuri Country',
  relationship:'West of the fictional Repository Town site, near Minore',
  straightLineDistanceKmFromRepo:16.5,
  urbanCentrePopulation2021:3507,
  localityPopulation2021:4608,
  shirePopulation2021:6360,
  populationYear:2021,
  mapStatus:'representative, compressed, unsurveyed',
  sources:Object.freeze({
    absUrban:'https://www.abs.gov.au/census/find-census-data/quickstats/2021/UCL115111',
    council:'https://www.narromine.nsw.gov.au/',
    tourism:'https://narromineregion.com.au/things-to-see-and-do',
    museum:'https://narromineaviationmuseum.org.au/',
    flooding:'https://www.narromine.nsw.gov.au/development/flooding'
  })
});
export const NARROMINE_ROADS=Object.freeze([
  Object.freeze({id:'western-regional-link',name:'Fictional Mitchell Highway approach',x0:-2636,x1:-1330,z0:271,z1:283}),
  Object.freeze({id:'dandaloo-street',name:'Dandaloo Street (representative)',x0:-2635,x1:-2625,z0:105,z1:491}),
  Object.freeze({id:'railway-street',name:'Railway Street (representative)',x0:-2790,x1:-2530,z0:158,z1:168}),
  Object.freeze({id:'southern-town-link',name:'Town south link (representative)',x0:-2790,x1:-2530,z0:385,z1:395}),
  Object.freeze({id:'aerodrome-access',name:'Aviation precinct access',x0:-2580,x1:-2570,z0:385,z1:486}),
  Object.freeze({id:'aviation-road',name:'Aviation precinct access east',x0:-2577,x1:-2350,z0:478,z1:488})
]);
export function narromineRoadAllows(x,z){
  return Number.isFinite(x)&&Number.isFinite(z)&&NARROMINE_ROADS.some(r=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1);
}
// Points are footpath-side interaction locations. Their facade positions are
// distinct from the road; they are intentionally NOT addresses or geocodes.
export const NARROMINE_LANDMARKS=Object.freeze([
  Object.freeze({id:'history',name:'Narromine Library & Local History Room',x:-2641,z:210,buildingX:-2661,buildingZ:210,w:19,d:16,h:5.7,
    summary:'A place to explore local history and family stories. The real Narromine Library is on Dandaloo Street; this building is a simplified game interpretation.',
    source:'https://www.narromine.nsw.gov.au/community/local-history-room'}),
  Object.freeze({id:'keeping-place',name:'Narromine Aboriginal Keeping Place',x:-2641,z:245,buildingX:-2661,buildingZ:245,w:19,d:16,h:5,
    summary:'Narromine is on Wiradjuri Country. The real Keeping Place is associated with community-controlled cultural knowledge. This exterior-only representation does not recreate restricted artefacts, stories or sacred sites.',
    source:'https://narromineregion.com.au/things-to-see-and-do'}),
  Object.freeze({id:'dandaloo',name:'Dandaloo Street shops',x:-2619,z:318,buildingX:-2599,buildingZ:318,w:19,d:17,h:6.3,
    summary:'Dandaloo Street is a main commercial street. Shops and town life in this simulation are generic; they are not claims about individual businesses or their opening hours.',
    source:'https://narromineregion.com.au/things-to-see-and-do'}),
  Object.freeze({id:'visitor',name:'Narromine visitor information',x:-2641,z:317,buildingX:-2661,buildingZ:317,w:19,d:17,h:5.1,
    summary:'Explore the Narromine region, its heritage, aviation and the Macquarie–Wambuul landscape. The in-game information building is not a claim about the current location of a real visitor centre.',
    source:'https://narromineregion.com.au/' }),
  Object.freeze({id:'rail',name:'Narromine railway heritage',x:-2641,z:141,buildingX:-2662,buildingZ:141,w:19,d:14,h:5.5,
    summary:'Rail reached Narromine in the nineteenth century and shaped transport and agricultural freight. This is a symbolic rail heritage frontage, not a working rail crossing.',
    source:'https://arhsnsw.com.au/wp-content/uploads/2018/08/F-Narromine.pdf'}),
  Object.freeze({id:'hospital',name:'Narromine Health Service',x:-2619,z:204,buildingX:-2599,buildingZ:204,w:19,d:17,h:5.2,
    summary:'Narromine has local health services, while specialist healthcare may involve travel to Dubbo. This game facade does not promise a service, opening hour or emergency response.',
    source:'https://www.health.nsw.gov.au/'}),
  Object.freeze({id:'park',name:'Tom Perry Park',x:-2619,z:358,buildingX:-2599,buildingZ:358,w:17,d:15,h:1.1,
    summary:'A well-known Narromine recreation landmark with links to local cricketing history. This park is simplified and its layout is not an exact site plan.',
    source:'https://narromineregion.com.au/things-to-see-and-do'}),
  Object.freeze({id:'wetlands',name:'Narromine Wetlands',x:-2780,z:391,buildingX:-2802,buildingZ:418,w:44,d:44,h:0.1,
    summary:'Wetland habitat, birds and local water ecology are central to the region. Game water and paths are illustrative, not accurate flood or access maps.',
    source:'https://narromineregion.com.au/things-to-see-and-do'}),
  Object.freeze({id:'museum',name:'Narromine Aviation Museum',x:-2562,z:446,buildingX:-2542,buildingZ:446,w:29,d:19,h:7,
    summary:'Narromine has a major flying and gliding history. The museum interprets civil aviation and World War II training, including No. 5 Elementary Flying Training School.',
    source:'https://narromineaviationmuseum.org.au/'}),
  Object.freeze({id:'aerodrome',name:'Narromine Aerodrome',x:-2480,z:483,buildingX:-2479,buildingZ:506,w:54,d:21,h:5,
    summary:'A real aviation precinct with longstanding gliding and recreational flying associations. The game runway is visual scenery only, not a drivable or operational real-world airport layout.',
    source:'https://narromineaviationmuseum.org.au/'}),
  Object.freeze({id:'farms',name:'Macquarie Valley grain country',x:-2220,z:263,buildingX:-2220,buildingZ:235,w:30,d:18,h:5.6,
    summary:'Cropping, irrigation, livestock and grain handling have shaped the surrounding district. The farm and silos represent regional industry rather than a specific real business.',
    source:'https://www.narromine.nsw.gov.au/'})
]);
export function nearestNarromineLandmark(pos,range=6){
  if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.z)||!Number.isFinite(range)||range<0)return null;
  let nearest=null,best=range;
  for(const site of NARROMINE_LANDMARKS){
    const d=Math.hypot(site.x-pos.x,site.z-pos.z);
    if(d<best){nearest=site;best=d;}
  }
  return nearest;
}
export function inNarromine(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&x<-2490&&x>-2890&&z>90&&z<530;}
