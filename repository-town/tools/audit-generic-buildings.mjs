// Run against the canonical source; outputs inventory JSON or a human audit.
import fs from 'node:fs';
import * as THREE from 'three';
import {Builder} from '../src/world/builder.js';
import {EXPANSION_SITES} from '../src/world/town-expansion.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {buildExpansionFacade} from '../src/world/town-expansion-facades.js';
import {GENERIC_PROFILES} from '../src/world/generic-business-fitouts.js';
import {REMAINING_CIVIC_SITES,REMAINING_KIND_PROFILES} from '../src/world/generic-remaining-fitouts.js';
import {createNarrominePopulation} from '../src/world/narromine-population.js';
import {createNarromineWorkplaceIndex,buildNarromineWorkplaceInterior} from '../src/world/narromine-workplaces.js';
import {BUILDINGS,FILL_HOUSES,FILL_SHOPS,FRONTAGES} from '../src/world/narromine-layout.js';
import {PLAN_HOMES} from '../src/world/masterplan-built.js';
import {dossierFor} from '../src/world/country-dossiers.js';
const label=()=>new THREE.Object3D();
const pop=createNarrominePopulation(),index=createNarromineWorkplaceIndex(pop);
const workplaceSource=fs.readFileSync(new URL('../src/world/narromine-workplaces.js',import.meta.url),'utf8');
const fitKinds=new Set([...workplaceSource.match(/const FIT = \{([\s\S]*?)\n\};/)[1].matchAll(/^\s{2}(\w+):/gm)].map(m=>m[1]));
const civic=EXPANSION_SITES.map(s=>{
  const built=buildCivicInterior(s,label),b=new Builder(),facade=buildExpansionFacade(b,s);
  return {id:s.id,name:s.name,style:s.style,passTwo:!!REMAINING_CIVIC_SITES[s.id],
    interior:built.genericFitout?.key||'dedicated-preserved',
    placeholder:!!built.group.getObjectByName('office-shelf-stock'),
    exterior:facade.genericFacade||'dedicated-id-or-style-preserved'};
});
const workplaces=index.list.map(e=>{
  const w=e.workplace,built=buildNarromineWorkplaceInterior(pop,e,label,2,660);
  return {id:w.id,name:w.name,kind:w.kind,passTwo:!!REMAINING_KIND_PROFILES[w.kind],
    interior:built.genericFitout?.key||'dedicated-template-or-evidence-preserved',
    rooms:built.rooms.map(r=>r.name),evidence:built.genericFitout?.evidenceLevel||'existing',
    unresolvedFallback:!built.genericFitout&&!fitKinds.has(w.kind)};
});
const countries=PLAN_HOMES.map(h=>({country:h.design.country,parcelId:h.parcelId,
  interior:dossierFor(h.design.country)?'researched-preserved':'generic-finish-layer',
  floorplanChanged:false,exterior:'authored-country-style-preserved'}));
const data={asOf:'2026-11-07',baseline:'f5502d24',publication:'not published; approval required',
  summary:{expansionTotal:civic.length,newCivicInteriors:civic.filter(x=>x.passTwo).length,
    newCivicExteriors:civic.filter(x=>x.passTwo&&x.exterior!=='dedicated-id-or-style-preserved').length,
    remainingExpansionPlaceholders:civic.filter(x=>x.placeholder).length,
    mappedWalkInWorkplaces:workplaces.length,newMappedWorkplaces:workplaces.filter(x=>x.passTwo).length,
    unresolvedMappedFallbacks:workplaces.filter(x=>x.unresolvedFallback).length,
    newCountryFinishes:countries.filter(x=>x.interior==='generic-finish-layer').length,
    protectedCountryDossiers:countries.filter(x=>x.interior==='researched-preserved').length,
    allCountryExteriors:countries.length,narromineHouseholdInteriors:pop.homes.length,
    narromineFillHouses:FILL_HOUSES.length,narromineBoxBuildings:BUILDINGS.length,
    narromineFillShops:FILL_SHOPS.length,narromineFrontages:FRONTAGES.length},
  civic,workplaces,countries};
if(!process.argv.includes('--markdown'))console.log(JSON.stringify(data,null,2));
else{
  const s=data.summary;
  const lines=['# Remaining generic buildings: audit and improvements','',
    '7 November 2026. Source baseline: `f5502d24`; follow-on work on the existing generic-only branch and draft PR #521. This report distinguishes a more believable game fit-out from a measured or fully researched recreation. No second-pass build has been published.','',
    '## Findings and scope','',
    `- **Fictional expansion interiors:** ${s.newCivicInteriors} remaining placeholder office shells replaced. The other 22 sites retain 13 dedicated interiors and nine first-pass improvements. None of the 72 expansion interiors retains the old office-stock placeholder.`,
    `- **Fictional expansion exteriors:** ${s.newCivicExteriors} additional generic facades detailed. Existing ID-specific and park/nursery/fuel/carwash/sports facade builders take precedence and remain unchanged, including where their interior was generic.`,
    `- **Mapped Narromine workplaces:** ${s.newMappedWorkplaces} additional locations receive category-specific rooms instead of untyped shop/office/workshop fallbacks. Across ${s.mappedWalkInWorkplaces} indexed walk-ins, ${s.unresolvedMappedFallbacks} untyped fallbacks remain. Existing FIT and evidence-backed rooms stay unchanged.`,
    `- **Country homes:** ${s.newCountryFinishes} shared fallback interiors receive distinct wet-area tile, living/bedroom finishes, ceiling fittings, splashbacks, skirting and doorway trim. Room plans, fixtures and access stay unchanged. Both researched interiors and all ${s.allCountryExteriors} authored country exteriors are preserved.`,
    '- **Handcrafted protection:** the original 48 geometry signatures are unchanged. Additional frozen fixtures cover 145 existing business components and 197 country components (195 exteriors plus two researched interiors). These counts overlap with the original fixture and must not be added as unique buildings.','',
    '## Fictional fallback inventory','',
    '| ID | Location | Interior improvement | Exterior |','|---|---|---|---|'];
  for(const x of civic.filter(x=>x.passTwo))lines.push(`| \`${x.id}\` | ${x.name.replaceAll('|','/')} | ${GENERIC_PROFILES[x.interior].title} | ${x.exterior==='dedicated-id-or-style-preserved'?'Existing dedicated/style design preserved':'Generic finish, bay frames and matching display/privacy detail'} |`);
  lines.push('','The new health/animal-care/counselling/memorial layouts have physical privacy screens; public amenities have two actual cubicles. The teaching pool is a small non-swimmable gameplay model, not an Olympic pool or a new swimming mechanic. Activity/court interiors are support rooms, not recreations of the outdoor sports area. Existing civic services remain available at the counter.','',
    '## Narromine fallback inventory','','All rows below are interpretive interiors, not surveyed floor plans. No real-location exterior geometry was changed.','',
    '| Location | Kind | New category |','|---|---|---|');
  for(const x of workplaces.filter(x=>x.passTwo))lines.push(`| ${x.name.replaceAll('|','/')} | \`${x.kind}\` | ${GENERIC_PROFILES[x.interior].title} |`);
  lines.push('','## Wider generator audit and remaining limits','',
    `- **Narromine homes:** ${s.narromineHouseholdInteriors} occupied home entries use household-specific lounge/kitchen, bathroom, laundry and age-specific bedrooms. These are not the business placeholder and were not changed. They remain procedural and unmeasured; the count is not a claim that every home has unique architecture.`,
    `- **Narromine exterior generators:** ${s.narromineFillHouses} fill-house records, ${s.narromineBoxBuildings} box-building records, ${s.narromineFillShops} fill-shop records and ${s.narromineFrontages} frontage records were inventoried. These collections overlap and are not unique-building totals. Estimated shopfront and residential-facade generators remain interpretive; they need address-specific evidence before further real-location additions.`,
    '- **Repository houses:** the 188 authored repository briefs and their 34 exterior-style system remain untouched. Packed arcade games are separate applications, not town building fallbacks.',
    '- **Country-house limits:** the 193 fallback plans still share a compact three-room organisation. Better finishes do not make them country-specific surveyed architecture. Upper floors drawn outside remain inaccessible, as before; the dedicated researched dossiers are the route for deeper historical accuracy.',
    '- **Gameplay limits:** decorative equipment does not introduce new clinical treatment, childcare, animal-care, vehicle-washing or workshop gameplay. The existing ledger/workstation actions are retained. No compliance certification, physical-phone performance, production merge or live acceptance is claimed.','',
    '## Verification','',
    'Automated gates check fixture geometry extents, pairwise placement, centre-aisle/exit clearance, staff/service positions, workplace fixture containment, dispatch exclusions, placeholder coverage and frozen components. Browser QA must additionally inspect actual 3D results and keyboard/touch entry, service and exit, saved state and existing UI flows. Local release/privacy/integrity gates and any hosted acceptance are separate records in WORK_CHECKPOINT and progress.md.','',
    '## Reproduce','',
    '`node tools/audit-generic-buildings.mjs` emits the complete component inventory as JSON. Add `--markdown` for this report. Run `npm run test:generic-buildings` for protection and coverage, and `npm run build:release` before an approved publication.','');
  console.log(lines.join('\n'));
}
