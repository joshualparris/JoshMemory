// Evidence-grounded Architectural Discrepancy Register & Prioritised Fidelity Backlog
// for Narromine buildings across the 8 priority locations.
// Categorises findings strictly as:
//   - "Verified mismatch"
//   - "Likely mismatch"
//   - "Insufficient evidence"
// Never claims a mismatch merely because a scene differs from a photo taken in a different year.

export const DISCREPANCY_CLASSIFICATIONS = Object.freeze([
  'Verified mismatch',
  'Likely mismatch',
  'Insufficient evidence',
]);

export const ARCHITECTURAL_DISCREPANCIES = Object.freeze([
  // ── 1. ROYAL HOTEL (123 Dandaloo Street — NR-SITE-royal-hotel) — HIGHEST PRIORITY ──
  {
    id: 'DISC-NR-001',
    locationId: 'royal-hotel-dandaloo',
    buildingId: 'NR-SITE-royal-hotel',
    buildingName: 'Royal Hotel',
    address: '123 Dandaloo Street',
    category: 'signage-lettering',
    classification: 'Verified mismatch',
    severity: 'CRITICAL',
    visualImpactScore: 10,
    realPhotoRef:
      'nsw-spatial-royal-hotel-aerial (docs/narromine/royal-hotel-aerial-nsw-spatial-cc-by-4.png) & commons-royal-2017-001',
    inGameScreenshotRef: 'screenshots/royal-hotel-dandaloo__desktop__midday.png',
    observedDiscrepancy:
      'In the NSW Spatial Services CC BY 4.0 orthophoto, "ROYAL" / "HOTEL" is painted in large two-line dark block capitals directly across the west-facing corrugated metal roof slope above the Dandaloo Street verandah (spanning ~11m north-south). On current main, a tiny unreadable dark rectangular board sits near the upper ridge and is partially clipped/occluded by the LiDAR roof slope.',
    evidenceAndUncertainty:
      'Directly visible in docs/narromine/royal-hotel-aerial-nsw-spatial-cc-by-4.png (verified local CC BY 4.0 file). Exact letter stroke width (~0.28m) and two-line stacked layout ("ROYAL" above "HOTEL") are unambiguous in the orthophoto.',
    suggestedCorrection:
      'Place a roof-aligned decal/plane tilted to match the western hip roof pitch (normal facing west-southwest toward Dandaloo Street, offset +0.06m above the corrugated roof surface to prevent z-fighting) with bold dark-charcoal two-line block lettering "ROYAL" / "HOTEL" spanning ~10.5m × 3.2m.',
    responsibleFiles: ['src/world/narromine-royal-hotel.js', 'src/world/narromine.js', 'src/world/narromine-buildings-data.js'],
    claimedByOtherAgent: false,
    resolutionStatus: 'VERIFIED COMPLETE (src/world/narromine-royal-hotel.js)',
    agentClaimRef:
      'RESOLVED in src/world/narromine-royal-hotel.js (feat/narromine-royal-hotel-and-86-88-realism-20261104): two-line ROYAL / HOTEL roof sign tilted to exact 2023 LiDAR 0.464 rad western hip slope (+0.09m along normal) in the 8.51° cadastral street frame.',
  },
  {
    id: 'DISC-NR-002',
    locationId: 'royal-hotel-dandaloo',
    buildingId: 'NR-SITE-royal-hotel',
    buildingName: 'Royal Hotel',
    address: '123 Dandaloo Street',
    category: 'windows',
    classification: 'Verified mismatch',
    severity: 'HIGH',
    visualImpactScore: 9,
    realPhotoRef:
      'nsw-spatial-royal-hotel-aerial & commons-royal-2017-001 (File:Narromine_Royal_Hotel_001.JPG)',
    inGameScreenshotRef: 'screenshots/royal-hotel-dandaloo__desktop__midday.png',
    observedDiscrepancy:
      'The Dandaloo Street ground-floor elevation of the Royal Hotel previously used generic uniform grey square window quads and a single brown door from landmarkFacadeSpec("royal-hotel") without pub fascia signage, window sills/architraves, twin pub entrance doors, or verandah fascia lettering.',
    evidenceAndUncertainty:
      'The 20.44m Dandaloo Street frontage (aligned to the 8.51° NSW cadastre frontage) and 2023 LiDAR eave/ridge heights are surveyed; window/door bay positions and fascia typography are marked as estimated in NARROMINE_ROYAL_HOTEL_PROVENANCE.',
    suggestedCorrection:
      'Replace the uniform 5-window placeholder array on the Royal Hotel west elevation with proportioned heritage pub sash windows, moulded sills, dual pub entrance doors with fanlights, brick pilasters, paved concrete footpath, and a verandah fascia board ("ROYAL HOTEL · EST. 1890") + blade sign.',
    responsibleFiles: ['src/world/narromine-royal-hotel.js', 'src/world/narromine-facade-profiles.js', 'src/world/narromine.js'],
    claimedByOtherAgent: false,
    resolutionStatus: 'VERIFIED COMPLETE (src/world/narromine-royal-hotel.js)',
    agentClaimRef:
      'RESOLVED in src/world/narromine-royal-hotel.js (feat/narromine-royal-hotel-and-86-88-realism-20261104).',
  },
  {
    id: 'DISC-NR-003',
    locationId: 'royal-hotel-dandaloo',
    buildingId: 'NR-SITE-royal-hotel',
    buildingName: 'Royal Hotel',
    address: '123 Dandaloo Street',
    category: 'streetscape-kerbs',
    classification: 'Verified mismatch',
    severity: 'MEDIUM',
    visualImpactScore: 7,
    realPhotoRef: 'nsw-spatial-royal-hotel-aerial (docs/narromine/royal-hotel-aerial-nsw-spatial-cc-by-4.png)',
    inGameScreenshotRef: 'screenshots/royal-hotel-dandaloo__desktop__midday.png',
    observedDiscrepancy:
      'The NSW Spatial Services orthophoto shows a planted central median strip with street trees and white 45° angled kerbside parking bays along Dandaloo Street in front of the Royal Hotel, plus a southern asphalt drive-through/carpark apron with rooftop AC condensers on the southern verandah step-down.',
    evidenceAndUncertainty:
      'Directly visible in docs/narromine/royal-hotel-aerial-nsw-spatial-cc-by-4.png. Lot-internal southern covered deck, 2 white rooftop AC condenser units, fenced beer-garden patio, paved footpath, and road-to-kerb asphalt forecourt are now built in src/world/narromine-royal-hotel.js; carriageway median islands/angled parking lines at z=-555..-520 remain coordinated with PR #336.',
    suggestedCorrection:
      'Lot-internal southern covered deck, 2 rooftop AC condenser units, beer-garden patio, and concrete footpath completed in src/world/narromine-royal-hotel.js; extend PR #336 Dandaloo Streetscape median islands and angled parking bays south to z=-520.',
    responsibleFiles: ['src/world/narromine-royal-hotel.js', 'src/world/narromine-dandaloo-streetscape.js'],
    claimedByOtherAgent: true,
    resolutionStatus: 'PARTIALLY COMPLETE (lot-internal complete in narromine-royal-hotel.js; road median in PR #336)',
    agentClaimRef: 'Lot-internal features RESOLVED in src/world/narromine-royal-hotel.js; carriageway median/parking coordinated with PR #336.',
  },

  // ── 2. COLES & KIERATH'S SHOPPING SQUARE (82 Dandaloo Street — NR-SITE-dandaloo-82) ──
  {
    id: 'DISC-NR-004',
    locationId: 'coles-external-frontage',
    buildingId: 'NR-SITE-dandaloo-82',
    buildingName: 'Coles Supermarket (82 Dandaloo Street)',
    address: '82 Dandaloo Street (Western Carpark Frontage)',
    category: 'doors-entrances',
    classification: 'Verified mismatch',
    severity: 'HIGH',
    visualImpactScore: 9,
    realPhotoRef: '2023 NSW LiDAR + OpenStreetMap Coles POI + rear carpark Click & Collect geometry',
    inGameScreenshotRef: 'screenshots/coles-external-frontage__desktop__midday.png',
    observedDiscrepancy:
      'On current main, the Coles north and south halls (x = -4852.5 .. -4806.8, z = -916.4 .. -868.2) render as solid brick extrusions with a rear "coles" sign, trolley bay, and red Click & Collect bays, but lack a glazed automatic sliding entrance airlock on the western carpark frontage and cannot be entered on foot.',
    evidenceAndUncertainty:
      'Trolley bay (-4846.5, -905..-899) and Click & Collect bays (-4862..-4856) mark the western customer entry apron. Exact internal aisle layout is estimated, so any interior should be tagged accordingly.',
    suggestedCorrection:
      'Add a glazed supermarket entrance vestibule and automatic sliding doors adjacent to the western trolley bay (-4846.5, z ≈ -902) with walkable entry transition.',
    responsibleFiles: ['src/world/narromine-kieraths.js', 'src/world/narromine.js', 'src/world/narromine-layout.js'],
    claimedByOtherAgent: true,
    agentClaimRef:
      'PR #319 (feat/narromine-postal-resident-20261104, OPEN) — RTD-068 grounded postal resident and walkable Coles.',
  },
  {
    id: 'DISC-NR-005',
    locationId: 'kieraths-street-frontage',
    buildingId: 'NR-SITE-dandaloo-82',
    buildingName: "Kierath's Shopping Square (Dandaloo Street Frontage)",
    address: '82 Dandaloo Street',
    category: 'verandahs-columns-awnings',
    classification: 'Likely mismatch',
    severity: 'MEDIUM',
    visualImpactScore: 7,
    realPhotoRef: '2023 NSW LiDAR (awning 3.25m) & commons-dandaloo-2017-002 streetscape context',
    inGameScreenshotRef: 'screenshots/kieraths-street-frontage__desktop__midday.png',
    observedDiscrepancy:
      'The Dandaloo Street east elevation of Kierath, Nelson & Co. (x = -4790.0, z = -910.5 .. -868.2) displays the white "KIERATH, NELSON & CO. PTY. LTD." fascia board and dark glazed rectangles, but the transition between the 3.25m cantilevered street awning and the open-air arcade mouth (around the circular front kiosk) has a simplified flat soffit without recessed shopfront signboards or under-awning lighting.',
    evidenceAndUncertainty:
      'LiDAR confirms the 3.25m street awning height and open-air courtyard route; individual Dandaloo Street shop tenancy signs change over time and require live Street View verification before hardcoding business names.',
    suggestedCorrection:
      'Refine the Dandaloo Street under-awning shopfront mullions, transoms, and arcade throat framing around KIERATHS_KIOSK without inventing unverified tenant names.',
    responsibleFiles: ['src/world/narromine-kieraths.js', 'src/world/narromine-kieraths-data.js'],
    claimedByOtherAgent: true,
    agentClaimRef:
      "PR #309 (feat/kieraths-live-courtyard-geometry-20261104, OPEN) — Rebuild Kierath's live 3D arcade from plan-derived shop footprints and courtyard.",
  },
  {
    id: 'DISC-NR-006',
    locationId: 'kieraths-courtyard-shopfronts',
    buildingId: 'NR-SITE-dandaloo-82',
    buildingName: "Kierath's Shopping Square (Internal Courtyard)",
    address: '82 Dandaloo Street',
    category: 'footprint-height',
    classification: 'Insufficient evidence',
    severity: 'LOW',
    visualImpactScore: 4,
    realPhotoRef: 'Plan-derived shop footprints & rear arch photo notes in narromine-kieraths.js',
    inGameScreenshotRef: 'screenshots/kieraths-courtyard-shopfronts__desktop__midday.png',
    observedDiscrepancy:
      'The 10 internal brick shop bays along the open-air diagonal courtyard use uniform brick colour (0x995741), uniform 3.75m height, and generic blank white fascias because Google Street View cars do not drive through the pedestrian-only internal arcade.',
    evidenceAndUncertainty:
      'Open-air passage geometry, round front kiosk, and rear arched canopy ("KIERATH\'S SHOPPING SQUARE" + historical "LIQUORLAND" shutter) are grounded in plan/photo notes, but individual internal shop tenancy signage and exact mullion spacings lack licensed walk-through photography.',
    suggestedCorrection:
      'Retain neutral unbranded fascias on the 10 internal arcade bays until walk-through photographs or tenancy plans are supplied.',
    responsibleFiles: ['src/world/narromine-kieraths.js'],
    claimedByOtherAgent: true,
    agentClaimRef: "PR #309 (feat/kieraths-live-courtyard-geometry-20261104, OPEN).",
  },

  // ── 3. NARROMINE POST OFFICE (74 Dandaloo Street — NR-SITE-narromine-post-office) ──
  {
    id: 'DISC-NR-007',
    locationId: 'post-office-entrance',
    buildingId: 'NR-SITE-narromine-post-office',
    buildingName: 'Narromine Post Office',
    address: '74 Dandaloo Street (corner Nymagee Street)',
    category: 'roof',
    classification: 'Verified mismatch',
    severity: 'MEDIUM',
    visualImpactScore: 6,
    realPhotoRef:
      'nsw-spatial-post-office-aerial (docs/narromine/narromine-post-office-aerial-nsw-spatial-cc-by-4.png)',
    inGameScreenshotRef: 'screenshots/post-office-entrance__desktop__midday.png',
    observedDiscrepancy:
      'In docs/narromine/narromine-post-office-aerial-nsw-spatial-cc-by-4.png, the Narromine Post Office has a continuous L-shaped hipped corrugated metal roof with distinct diagonal hip ridges meeting over the north wing and Dandaloo Street wing, plus a prominent cantilevered corner awning wrapping the NE entrance. In-game, the roof renders as a low flat/shallow-capped extrusion above the brick parapet.',
    evidenceAndUncertainty:
      'Directly visible in the verified local NSW Spatial Services CC BY 4.0 orthophoto (docs/narromine/narromine-post-office-aerial-nsw-spatial-cc-by-4.png) and 2023 LiDAR heights.',
    suggestedCorrection:
      'Add hipped corrugated metal roof planes with diagonal hip ridges over the north wing and Dandaloo Street front part of narromine-post-office matching the orthophoto ridge geometry.',
    responsibleFiles: ['src/world/narromine-post-office-roof.js', 'src/world/narromine.js'],
    claimedByOtherAgent: false,
    resolutionStatus: 'VERIFIED COMPLETE (src/world/narromine-post-office-roof.js)',
    agentClaimRef:
      'RESOLVED in src/world/narromine-post-office-roof.js (feat/narromine-post-office-roof-20261105): the two intersecting per-wing hip roofs and stepped fascia boxes are replaced by one L-shaped hipped roof (six planar facets, NE hip, inner valley, ridges meeting at one point) at 2023 LiDAR eave 9.54 m / ridge 10.40 m, with hip-end insets measured on the orthophoto. PR #319 merged as #354 without touching the exterior roof.',
  },

  // ── 4. NARROMINE HOTEL (116 Dandaloo Street — NR-SITE-narromine-hotel) ──
  {
    id: 'DISC-NR-008',
    locationId: 'narromine-hotel-corner',
    buildingId: 'NR-SITE-narromine-hotel',
    buildingName: 'Narromine Hotel',
    address: '116 Dandaloo Street & Derribong Avenue',
    category: 'footprint-height',
    classification: 'Insufficient evidence',
    severity: 'LOW',
    visualImpactScore: 3,
    realPhotoRef:
      'nsw-spatial-narromine-hotel-aerial (docs/narromine/narromine-hotel-aerial-nsw-spatial-cc-by-4.png) & frames 102238–102257 notes',
    inGameScreenshotRef: 'screenshots/narromine-hotel-corner__desktop__midday.png',
    observedDiscrepancy:
      'Following the merge of PR #318 (src/world/narromine-hotel.js), the Dandaloo Street and Derribong Avenue street elevations, 1901 SE corner pediment, 14 heritage-green fluted columns, Victorian iron lacework, 4 chimneys, exposed red-brick upper north wall (102255.014.jpg), and charcoal northern shopfront (102253.251.jpg) are reconstructed to high fidelity. Only the rear western courtyard motel/outbuilding elevations (west building & north-west outbuilding) rely on LiDAR/aerial massing without street-level facade photography.',
    evidenceAndUncertainty:
      'NSW Spatial Services orthophoto confirms the footprints and roof pitches of the western courtyard outbuildings, but they are occluded from public streets.',
    suggestedCorrection:
      'No street-frontage geometry changes required unless rear courtyard photographs become available; keep PR #318 street facades preserved.',
    responsibleFiles: ['src/world/narromine-hotel.js'],
    claimedByOtherAgent: false,
    agentClaimRef: 'PR #318 merged to main (d9fbf9c8).',
  },

  // ── 5. RAILWAY STATION PRECINCT (Derribong Avenue — NR-OSM-0030 / osm:29) ──
  {
    id: 'DISC-NR-009',
    locationId: 'railway-station-platform',
    buildingId: 'NR-OSM-0030',
    buildingName: 'Narromine Railway Station',
    address: 'Derribong Avenue (Narromine Station Access)',
    category: 'materials-colours',
    classification: 'Likely mismatch',
    severity: 'LOW',
    visualImpactScore: 4,
    realPhotoRef: 'Narromine LEP 2011 Item I11 + 2023 NSW LiDAR (eave 3.45m, ridge 5.85m) + OSM osm:29',
    inGameScreenshotRef: 'screenshots/railway-station-platform__desktop__midday.png',
    observedDiscrepancy:
      'The 1883 station building (osm:29), goods shed (osm:28), relay hut (osm:198), 142m side platform, cantilevered platform awning, and NSW TrainLink coach stop are reconstructed to surveyed LiDAR/OSM dimensions (merged PR #312/#316), but window/door bay spacing and heritage paint shades are tagged "estimated" pending close-range platform-side photographs.',
    evidenceAndUncertainty:
      'Footprint (32.16m × 9.10m) and LiDAR heights (3.45m eave, 5.85m ridge) are surveyed; exact window bay count along the platform elevation awaits live Street View / platform photo verification.',
    suggestedCorrection:
      'Compare live Street View from Derribong Avenue (camera preset 7) against src/world/narromine-railway-precinct.js to verify forecourt window bay spacing and TrainLink sign placement.',
    responsibleFiles: ['src/world/narromine-railway-precinct.js', 'src/world/narromine-railway-evidence.js'],
    claimedByOtherAgent: false,
    agentClaimRef: 'PR #312 & PR #316 merged to main.',
  },

  // ── 6. ORDINARY NARROMINE STREETS & DANDALOO RETAIL STRIP (76–88 Dandaloo St & Nymagee St) ──
  {
    id: 'DISC-NR-010',
    locationId: 'ordinary-narromine-streets-shops',
    buildingId: 'NR-SITE-dandaloo-86',
    buildingName: '86–88 Dandaloo Street & Unmapped Dandaloo/Burraway Retail Frontages',
    address: '76–88 Dandaloo Street & Nymagee Street',
    category: 'materials-colours',
    classification: 'Likely mismatch',
    severity: 'HIGH',
    visualImpactScore: 8,
    realPhotoRef: 'commons-dandaloo-2017-002 (File:Narromine_Dandaloo_Street_002.JPG, GPS -32.232833, 148.239319)',
    inGameScreenshotRef: 'screenshots/ordinary-narromine-streets-shops__desktop__midday.png',
    observedDiscrepancy:
      'Unmapped commercial lots along Dandaloo and Burraway Streets (FILL_SHOPS) and unmapped residential lots along Nymagee Street (FILL_HOUSES) use procedural stand-in boxes with estimated shopfront profiles (src/world/narromine-facade-profiles.js), and 86 Dandaloo Street ("Church, denomination unverified") uses uniform beige walls without window tracery or brick/render material differentiation.',
    evidenceAndUncertainty:
      'OSM provides POI pins and street centerlines, and 2011/2023 LiDAR provides heights for mapped buildings, but FILL_SHOPS and FILL_HOUSES footprints are procedural stand-ins until traced from NSW Spatial Services cadastre/orthophoto and verified in live Street View.',
    suggestedCorrection:
      'Use the Live Street View Comparison Workspace at camera preset 8 (-32.232833, 148.239319) to audit 76, 86, and 88 Dandaloo Street and replace procedural FILL_SHOPS along Dandaloo Street with cadastre-traced, LiDAR-heighted building parts.',
    responsibleFiles: ['src/world/narromine-royal-hotel.js', 'src/world/narromine-buildings-data.js', 'src/world/narromine-facade-profiles.js', 'src/world/narromine-layout.js'],
    claimedByOtherAgent: false,
    resolutionStatus: 'PARTIALLY COMPLETE (86 & 88 Dandaloo St reconstructed in src/world/narromine-royal-hotel.js; unmapped FILL_SHOPS/FILL_HOUSES remain open)',
    agentClaimRef:
      '86 Dandaloo St (steep 9.35m LiDAR brick church with buttresses, lancets, cross finial & arched doorway) and 88 Dandaloo St (His & Hers Clip Joint shopfront, 4.98m parapet, 3.25m cantilevered awning & glazing) RESOLVED in src/world/narromine-royal-hotel.js; remaining unmapped FILL_SHOPS/FILL_HOUSES stay open for Phase B/C.',
  },
]);

/**
 * Generates a prioritised photographic-fidelity backlog sorted by visualImpactScore (descending)
 * and grouped by building, identifying the #1 highest-priority building for architectural correction.
 */
export function buildPrioritisedFidelityBacklog(discrepancies = ARCHITECTURAL_DISCREPANCIES) {
  const sorted = [...discrepancies].sort(
    (a, b) => b.visualImpactScore - a.visualImpactScore || a.id.localeCompare(b.id)
  );

  const byBuilding = new Map();
  for (const d of sorted) {
    if (!byBuilding.has(d.buildingId)) {
      byBuilding.set(d.buildingId, {
        buildingId: d.buildingId,
        buildingName: d.buildingName,
        address: d.address,
        locationId: d.locationId,
        maxVisualImpactScore: 0,
        verifiedCount: 0,
        likelyCount: 0,
        insufficientEvidenceCount: 0,
        items: [],
      });
    }
    const group = byBuilding.get(d.buildingId);
    group.maxVisualImpactScore = Math.max(group.maxVisualImpactScore, d.visualImpactScore);
    if (d.classification === 'Verified mismatch') group.verifiedCount += 1;
    else if (d.classification === 'Likely mismatch') group.likelyCount += 1;
    else group.insufficientEvidenceCount += 1;
    group.items.push(d);
  }

  const buildingPriorityList = [...byBuilding.values()].sort(
    (a, b) =>
      b.maxVisualImpactScore - a.maxVisualImpactScore ||
      b.verifiedCount - a.verifiedCount ||
      a.buildingId.localeCompare(b.buildingId)
  );

  return {
    highestPriorityBuilding: buildingPriorityList[0] || null,
    summaryCounts: {
      totalDiscrepancies: sorted.length,
      verifiedMismatches: sorted.filter((d) => d.classification === 'Verified mismatch').length,
      likelyMismatches: sorted.filter((d) => d.classification === 'Likely mismatch').length,
      insufficientEvidence: sorted.filter((d) => d.classification === 'Insufficient evidence')
        .length,
    },
    buildingPriorityList,
    discrepancies: sorted,
  };
}
