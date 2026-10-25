// The Merged Branch: invented Repository Town history, not a real NSW heritage record.
export const PUB_HISTORY=Object.freeze({
 id:'B:pub',gridAddress:'N8-S',originalConstructionYear:1911,firstTradingYear:1912,
 originalName:'Branch Line Hotel',currentName:'The Merged Branch',architecturalPeriod:'Federation-era country NSW hotel',
 fictional:true,originalPermitRecord:null,originalCodeEdition:null,formalHeritageListing:null,
 timeline:Object.freeze([
 Object.freeze({year:1911,event:'Federation-era brick country pub constructed'}),
 Object.freeze({year:1912,event:'The Branch Line Hotel begins trading'}),
 Object.freeze({year:1958,event:'Timber front bar renewed'}),
 Object.freeze({year:1988,event:'Refrigeration and rear service spaces modernised'}),
 Object.freeze({year:2019,event:'Renamed The Merged Branch'}),
 Object.freeze({year:2026,event:'Fictional kitchen and WC utilities pilot; not a certified alteration'})
 ]),
 unresolved:Object.freeze(['Exterior suggests an upper floor, but the upstairs plan is not modelled','Exterior 14 × 11 m and interior 14 × 18 m differ','No original council permit, heritage listing or licence is claimed'])
});
export function pubAgeAt(year=2026){return Number.isInteger(year)&&year>=1911?year-1911:null;}
export function pubHistoryDescription(){
 return 'Built in 1911 as the Branch Line Hotel; opened in 1912. The long timber bar was renewed in 1958, '+
 'the cold store modernised in 1988, and the pub renamed The Merged Branch in 2019. '+
 'At 2026 it is 115 years old. Upstairs windows suggest an old second level, but it is not modelled or approved. '+
 'The current kitchen and WC are a fictional gameplay pilot, not a certified renovation. This is Repository Town history, not a real heritage record.';
}
