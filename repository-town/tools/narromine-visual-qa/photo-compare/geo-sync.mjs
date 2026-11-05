// Exact bidirectional coordinate synchronization between Real Narromine (WGS84 / Street View)
// and Repository Town Narromine (world X, Y, Z, yaw, pitch, FOV), plus the 8 priority
// Narromine photo-comparison locations and Google Maps Street View API Call & Cost Ledger.
import {
  NARROMINE_GEO_ANCHOR,
  NARROMINE_WORLD_OFFSET,
  REPO_TOWN_ROOT,
  compassCardinalFromHeading,
  compassHeadingToYaw,
  geoToWorldCoords,
  worldToGeoCoords,
  yawToCompassHeading,
  yawTowards,
} from '../locations.mjs';

export {
  NARROMINE_GEO_ANCHOR,
  NARROMINE_WORLD_OFFSET,
  REPO_TOWN_ROOT,
  compassCardinalFromHeading,
  compassHeadingToYaw,
  geoToWorldCoords,
  worldToGeoCoords,
  yawToCompassHeading,
  yawTowards,
};

/**
 * Converts vertical/horizontal camera FOV (degrees, 20..120) to Google Street View zoom level.
 * In Google Maps JS StreetViewPanorama: fov ≈ 180 / (2 ^ zoom) -> zoom = log2(180 / fov).
 */
export function fovToStreetViewZoom(fovDeg = 72) {
  const clamped = Math.max(15, Math.min(135, Number(fovDeg) || 72));
  return Number(Math.log2(180 / clamped).toFixed(3));
}

/**
 * Converts Google Street View zoom level to camera FOV degrees.
 */
export function streetViewZoomToFov(zoom = 1.322) {
  const z = Math.max(0, Math.min(4, Number(zoom) || 1.322));
  return Number((180 / Math.pow(2, z)).toFixed(1));
}

/**
 * Converts a Repository Town camera pose { x, z, y, eyeHeightM, yawRad, pitchRad, fovDeg }
 * into an exact Real-World / Street View pose { lat, lon, headingDeg, cardinal, pitchDeg, fovDeg, zoom, eyeHeightM }.
 */
export function syncPoseFromGameToReal({
  x,
  z,
  eyeHeightM = 1.65,
  yawRad = 0,
  pitchRad = 0,
  fovDeg = 72,
}) {
  const { lat, lon } = worldToGeoCoords(x, z);
  const headingDeg = yawToCompassHeading(yawRad);
  const cardinal = compassCardinalFromHeading(headingDeg);
  const pitchDeg = Number(((Number(pitchRad || 0) * 180) / Math.PI).toFixed(2));
  const cleanFov = Number((Number(fovDeg) || 72).toFixed(1));
  const zoom = fovToStreetViewZoom(cleanFov);
  return {
    x: Number(Number(x).toFixed(3)),
    z: Number(Number(z).toFixed(3)),
    lat,
    lon,
    eyeHeightM: Number(Number(eyeHeightM || 1.65).toFixed(2)),
    yawRad: Number(Number(yawRad || 0).toFixed(6)),
    pitchRad: Number(Number(pitchRad || 0).toFixed(6)),
    headingDeg,
    cardinal,
    pitchDeg,
    fovDeg: cleanFov,
    zoom,
  };
}

/**
 * Converts a Real-World / Street View pose { lat, lon, headingDeg, pitchDeg, fovDeg, zoom, eyeHeightM }
 * into an exact Repository Town camera pose { x, z, eyeHeightM, yawRad, pitchRad, fovDeg, lat, lon, headingDeg, cardinal, pitchDeg, zoom }.
 */
export function syncPoseFromRealToGame({
  lat,
  lon,
  headingDeg = 0,
  pitchDeg = 0,
  fovDeg = null,
  zoom = null,
  eyeHeightM = 1.65,
}) {
  const { x, z } = geoToWorldCoords(lat, lon);
  const normHeading = Number(((((Number(headingDeg) || 0) % 360) + 360) % 360).toFixed(2));
  const yawRad = compassHeadingToYaw(normHeading);
  const cardinal = compassCardinalFromHeading(normHeading);
  const cleanPitchDeg = Number(Math.max(-75, Math.min(75, Number(pitchDeg) || 0)).toFixed(2));
  const pitchRad = Number(((cleanPitchDeg * Math.PI) / 180).toFixed(6));
  const resolvedFov =
    fovDeg !== null && fovDeg !== undefined
      ? Number(Math.max(20, Math.min(115, Number(fovDeg) || 72)).toFixed(1))
      : zoom !== null && zoom !== undefined
      ? streetViewZoomToFov(zoom)
      : 72;
  const resolvedZoom = fovToStreetViewZoom(resolvedFov);

  return {
    x,
    z,
    lat: Number(Number(lat).toFixed(7)),
    lon: Number(Number(lon).toFixed(7)),
    eyeHeightM: Number(Number(eyeHeightM || 1.65).toFixed(2)),
    yawRad,
    pitchRad,
    headingDeg: normHeading,
    cardinal,
    pitchDeg: cleanPitchDeg,
    fovDeg: resolvedFov,
    zoom: resolvedZoom,
  };
}

/**
 * Builds an official zero-cost ($0.00 USD) Google Maps Street View browser URL synced to the exact pose.
 */
export function buildGoogleMapsStreetViewUrl({
  lat,
  lon,
  headingDeg = 0,
  pitchDeg = 0,
  fovDeg = 72,
}) {
  const params = new URLSearchParams({
    api: '1',
    map_action: 'pano',
    viewpoint: `${Number(lat).toFixed(7)},${Number(lon).toFixed(7)}`,
    heading: String(Number(headingDeg || 0).toFixed(2)),
    pitch: String(Number(pitchDeg || 0).toFixed(2)),
    fov: String(Math.max(15, Math.min(110, Number(fovDeg || 72))).toFixed(1)),
  });
  return `https://www.google.com/maps/@?${params.toString()}`;
}

/**
 * Official Google Maps Platform Pricing & Transparent Per-Call Cost Model.
 * - Dynamic Street View SKU (Maps JavaScript API `new google.maps.StreetViewPanorama`):
 *   $14.00 USD per 1,000 panorama instantiations = $0.0140 USD (~$0.0215 AUD) per instantiation.
 * - `conservativeUsd` also tracks $0.0140 USD for every location/pano jump (`setPosition`,
 *   `getPanorama`, `pano_changed`) so the user always sees both the official SKU cost and
 *   the worst-case per-jump cost clearly on every API call.
 */
export const STREET_VIEW_API_PRICING = Object.freeze({
  currencyRateAudPerUsd: 1.535,
  monthlyFreeCreditUsd: 200.0,
  defaultSessionBudgetCapUsd: 0.5,
  operations: Object.freeze({
    maps_js_script_load: Object.freeze({
      operation: 'maps_js_script_load',
      label: 'Maps JavaScript API Bootstrap Script Load',
      sku: 'Maps JS Bootstrap',
      billedUsd: 0.0,
      conservativeUsd: 0.0,
      explanation: 'Loading the Maps JS script tag itself is $0.00; billing starts when StreetViewPanorama is instantiated.',
    }),
    streetview_panorama_instantiate: Object.freeze({
      operation: 'streetview_panorama_instantiate',
      label: 'new google.maps.StreetViewPanorama() Instantiation',
      sku: 'Dynamic Street View ($14.00 / 1,000 loads)',
      billedUsd: 0.014,
      conservativeUsd: 0.014,
      explanation: 'Official Google Maps Platform Dynamic Street View SKU: $0.0140 USD (1.4¢ USD / ~2.15¢ AUD) per panorama load.',
    }),
    streetview_get_panorama_by_location: Object.freeze({
      operation: 'streetview_get_panorama_by_location',
      label: 'StreetViewService.getPanorama({ location }) Lookup',
      sku: 'StreetViewService Panorama Metadata Request',
      billedUsd: 0.0,
      conservativeUsd: 0.014,
      explanation: 'Metadata lookup via StreetViewService in JS API ($0.00 billed separately when tied to an active StreetViewPanorama; $0.0140 USD worst-case if counted as a panorama load).',
    }),
    streetview_set_position: Object.freeze({
      operation: 'streetview_set_position',
      label: 'StreetViewPanorama.setPosition(lat, lng)',
      sku: 'Dynamic Street View Position Update',
      billedUsd: 0.0,
      conservativeUsd: 0.014,
      explanation: 'Moving an existing StreetViewPanorama to a new coordinate ($0.00 under single-instance session rules; $0.0140 USD worst-case if counted as a new panorama load).',
    }),
    streetview_pano_changed: Object.freeze({
      operation: 'streetview_pano_changed',
      label: 'StreetViewPanorama User Step / Pano Changed',
      sku: 'Dynamic Street View Panorama Step',
      billedUsd: 0.0,
      conservativeUsd: 0.014,
      explanation: 'Stepping to an adjacent Street View panorama ID ($0.00 in-session; $0.0140 USD worst-case estimate).',
    }),
    streetview_set_pov: Object.freeze({
      operation: 'streetview_set_pov',
      label: 'StreetViewPanorama.setPov / setZoom (Heading/Pitch/FOV)',
      sku: 'Client-Side Panorama Orientation',
      billedUsd: 0.0,
      conservativeUsd: 0.0,
      explanation: 'Rotating heading/pitch/FOV inside an already-loaded panorama is $0.0000 USD.',
    }),
  }),
});

export function createApiCostLedger(options = {}) {
  const rateAud = Number(options.currencyRateAudPerUsd || STREET_VIEW_API_PRICING.currencyRateAudPerUsd);
  const budgetCapUsd = Number(
    options.budgetCapUsd ?? STREET_VIEW_API_PRICING.defaultSessionBudgetCapUsd
  );
  const state = {
    sessionStartedAt: new Date().toISOString(),
    budgetCapUsd,
    rateAud,
    totalCalls: 0,
    billableInstantiations: 0,
    panoLocationCalls: 0,
    povCalls: 0,
    cumulativeBilledUsd: 0,
    cumulativeConservativeUsd: 0,
    cumulativeBilledAud: 0,
    cumulativeConservativeAud: 0,
    calls: [],
  };

  function recordCall(operation, details = {}) {
    const spec =
      STREET_VIEW_API_PRICING.operations[operation] ||
      STREET_VIEW_API_PRICING.operations.streetview_set_position;
    const billedUsd = Number(spec.billedUsd.toFixed(4));
    const conservativeUsd = Number(spec.conservativeUsd.toFixed(4));
    const billedAud = Number((billedUsd * rateAud).toFixed(4));
    const conservativeAud = Number((conservativeUsd * rateAud).toFixed(4));

    // Check budget cap before allowing a paid or location-changing call
    if (
      conservativeUsd > 0 &&
      state.cumulativeConservativeUsd + conservativeUsd > state.budgetCapUsd + 1e-6 &&
      !details.forceOverrideBudget
    ) {
      return {
        blockedByBudget: true,
        budgetCapUsd: state.budgetCapUsd,
        cumulativeConservativeUsd: state.cumulativeConservativeUsd,
        message: `⛔ API CALL BLOCKED BY BUDGET GUARD: Calling ${spec.label} (+$${conservativeUsd.toFixed(
          4
        )} USD) would exceed session cap of $${state.budgetCapUsd.toFixed(2)} USD.`,
      };
    }

    state.totalCalls += 1;
    if (operation === 'streetview_panorama_instantiate') state.billableInstantiations += 1;
    if (
      operation === 'streetview_get_panorama_by_location' ||
      operation === 'streetview_set_position' ||
      operation === 'streetview_pano_changed'
    ) {
      state.panoLocationCalls += 1;
    }
    if (operation === 'streetview_set_pov') state.povCalls += 1;

    state.cumulativeBilledUsd = Number((state.cumulativeBilledUsd + billedUsd).toFixed(4));
    state.cumulativeConservativeUsd = Number(
      (state.cumulativeConservativeUsd + conservativeUsd).toFixed(4)
    );
    state.cumulativeBilledAud = Number((state.cumulativeBilledUsd * rateAud).toFixed(4));
    state.cumulativeConservativeAud = Number(
      (state.cumulativeConservativeUsd * rateAud).toFixed(4)
    );

    const coordSummary =
      details.lat !== undefined && details.lon !== undefined
        ? `(${Number(details.lat).toFixed(6)}, ${Number(details.lon).toFixed(6)})`
        : '';

    const bannerMessage =
      `⚡ GOOGLE API CALL #${state.totalCalls}: ${spec.label} ${coordSummary} · ` +
      `This Call: $${billedUsd.toFixed(4)} USD billed SKU ($${conservativeUsd.toFixed(
        4
      )} USD worst-case / ~$${conservativeAud.toFixed(4)} AUD) · ` +
      `Session Total: $${state.cumulativeBilledUsd.toFixed(4)} USD billed ($${state.cumulativeConservativeUsd.toFixed(
        4
      )} USD worst-case / ~$${state.cumulativeConservativeAud.toFixed(4)} AUD)`;

    const entry = {
      callNumber: state.totalCalls,
      timestamp: new Date().toISOString(),
      operation: spec.operation,
      label: spec.label,
      sku: spec.sku,
      billedUsd,
      conservativeUsd,
      billedAud,
      conservativeAud,
      cumulativeBilledUsd: state.cumulativeBilledUsd,
      cumulativeConservativeUsd: state.cumulativeConservativeUsd,
      cumulativeBilledAud: state.cumulativeBilledAud,
      cumulativeConservativeAud: state.cumulativeConservativeAud,
      coordinates: {
        lat: details.lat ?? null,
        lon: details.lon ?? null,
        x: details.x ?? null,
        z: details.z ?? null,
        headingDeg: details.headingDeg ?? null,
        pitchDeg: details.pitchDeg ?? null,
        fovDeg: details.fovDeg ?? null,
      },
      reason: details.reason || 'user-triggered',
      explanation: spec.explanation,
      bannerMessage,
      blockedByBudget: false,
    };

    state.calls.push(entry);
    return entry;
  }

  return {
    state,
    recordCall,
    setBudgetCapUsd(newCapUsd) {
      state.budgetCapUsd = Math.max(0.01, Number(newCapUsd) || 0.5);
      return state.budgetCapUsd;
    },
  };
}

/**
 * All 8 Priority Narromine Locations from Section 6 of the task specification:
 * 1. Royal Hotel — Dandaloo Street
 * 2. Narromine Hotel — corner façade and verandahs
 * 3. Narromine Post Office — entrance and architectural details
 * 4. Coles — external frontage and entrance
 * 5. Kierath's Shopping Square — street frontage
 * 6. Kierath's internal courtyard and shopfronts
 * 7. Railway station — building and platform
 * 8. Ordinary Narromine residential streets and shops
 */
const RAW_PHOTO_LOCATIONS = [
  {
    id: 'royal-hotel-dandaloo',
    order: 1,
    title: '1. Royal Hotel — Dandaloo Street',
    shortLabel: '1. Royal Hotel',
    street: '123 Dandaloo Street',
    buildingIds: ['NR-SITE-royal-hotel'],
    detailedId: 'royal-hotel',
    placeName: 'Royal Hotel',
    camera: { x: -4820.5, z: -543.0, pitchRad: 0.04, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4822.0, z: -545.0, pitchRad: 0.03, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4800.0, z: -542.4 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'HIGH (surveyed Lot/DP + NSW Spatial Services CC BY 4.0 orthophoto + Wikimedia Commons CC BY 3.0 GPS)',
    focalLengthNote: 'Game default 72° vertical FOV (~18mm eq); Street View car camera uses ~75° FOV at 2.45m roof pod height.',
    architecturalFocus: [
      'ROYAL / HOTEL two-line painted block lettering on western corrugated roof slope',
      '6-post single-storey bullnose/flat street verandah over Dandaloo Street footpath',
      'Symmetrical pub ground-floor sash windows and central timber doorway',
      'Multi-wing hipped and gabled roof complex (front + 3 E-W wings + rear block)',
    ],
    responsibleFiles: ['src/world/narromine.js', 'src/world/narromine-buildings-data.js', 'src/world/narromine-facade-profiles.js'],
    activeAgentClaims: ['PR #313 (fix/narromine-royal-hotel-roof-lettering-20261104) — Royal Hotel roof lettering'],
  },
  {
    id: 'narromine-hotel-corner',
    order: 2,
    title: '2. Narromine Hotel — corner façade and verandahs',
    shortLabel: '2. Narromine Hotel',
    street: '116 Dandaloo Street & Derribong Avenue',
    buildingIds: ['NR-SITE-narromine-hotel'],
    detailedId: 'narromine-hotel',
    placeName: 'Narromine Hotel',
    camera: { x: -4803.0, z: -703.0, pitchRad: 0.07, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4801.5, z: -701.5, pitchRad: 0.06, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4824.5, z: -721.5 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'HIGH (Lot 13 DP519453 cadastre + 2023 NSW LiDAR + NSW Spatial Services CC BY 4.0 orthophoto)',
    focalLengthNote: '72° FOV from SE intersection corner captures full 27.23m Dandaloo St × 23.40m Derribong Ave wrap verandah and 10.95m ridge.',
    architecturalFocus: [
      '1901 / NARROMINE HOTEL curved semicircular arched SE corner pediment & return parapet wings',
      'Two-storey heritage-green (#2c4c32) 14-column wrap verandah with cream Victorian cast-iron lacework (#efe8d6)',
      '4 corbelled red-brick chimneys with terracotta pots above 10.95m LiDAR hipped roof',
      'Exposed red face-brick upper north wall above dark-charcoal single-storey northern shopfront',
    ],
    responsibleFiles: ['src/world/narromine-hotel.js', 'src/world/narromine.js', 'src/world/narromine-buildings-data.js'],
    activeAgentClaims: ['PR #318 (claude/narromine-hotel, MERGED to main) — detailed Narromine Hotel builder'],
  },
  {
    id: 'post-office-entrance',
    order: 3,
    title: '3. Narromine Post Office — entrance and architectural details',
    shortLabel: '3. Post Office',
    street: '74 Dandaloo Street (corner Nymagee Street)',
    buildingIds: ['NR-SITE-narromine-post-office'],
    detailedId: 'narromine-post-office',
    placeName: 'Narromine Post Office',
    camera: { x: -4776.5, z: -956.5, pitchRad: 0.05, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4774.5, z: -958.0, pitchRad: 0.04, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4792.5, z: -942.0 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'HIGH (NSW Spatial Services CC BY 4.0 orthophoto + 2023 LiDAR + enterable doorway threshold)',
    focalLengthNote: 'Positioned 15m NE of the corner entrance steps so the full two-storey brick massing and portico columns remain uncropped.',
    architecturalFocus: [
      'Two-storey red/brown face-brick corner civic building with hipped corrugated roof',
      'North-east corner recessed entrance portico, concrete steps, handrails, and red Australia Post street posting box',
      'Upper-floor vertical window bays (4 north bays with AC hood units + 3 east bays) and Australia Post 2821 fascia band',
      'Corner hedge/planter bed along Nymagee & Dandaloo Street footpath alignment',
    ],
    responsibleFiles: ['src/world/narromine-post-office.js', 'src/world/narromine.js', 'src/world/narromine-buildings-data.js'],
    activeAgentClaims: ['PR #319 (feat/narromine-postal-resident-20261104) — Post Office NPC & daily routine'],
  },
  {
    id: 'coles-external-frontage',
    order: 4,
    title: '4. Coles — external frontage and entrance',
    shortLabel: '4. Coles Frontage',
    street: '82 Dandaloo Street (Western Carpark & Click-and-Collect Frontage)',
    buildingIds: ['NR-SITE-dandaloo-82'],
    detailedId: 'dandaloo-82',
    placeName: 'Coles',
    camera: { x: -4872.0, z: -896.5, pitchRad: 0.04, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4875.0, z: -896.5, pitchRad: 0.03, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4842.0, z: -896.5 },
    minExpectedTriangles: 1400,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'MEDIUM-HIGH (2023 LiDAR dual-hall footprint + rear carpark Click & Collect geometry)',
    focalLengthNote: 'Western carpark vantage looking East at the Coles supermarket gable sign, trolley bay, Click & Collect red bays, and rooftop plant.',
    architecturalFocus: [
      'Twin large-span supermarket halls (Coles north hall & Coles south hall, LiDAR ridge ~8.4m)',
      'White/red "coles" rear gable signage, rooftop mechanical plant enclosures, and Liquorland roller shutter bay',
      'Trolley return bay (-4846.5, -905..-899) and red Click & Collect customer parking bays (-4862..-4856)',
      'Walkable supermarket entrance doors and glazed automatic entry airlock (currently solid wall on main; claimed in PR #319)',
    ],
    responsibleFiles: ['src/world/narromine-kieraths.js', 'src/world/narromine.js', 'src/world/narromine-buildings-data.js'],
    activeAgentClaims: ['PR #319 (feat/narromine-postal-resident-20261104) — walkable Coles; PR #309 — Kierath/Coles precinct'],
  },
  {
    id: 'kieraths-street-frontage',
    order: 5,
    title: "5. Kierath's Shopping Square — street frontage",
    shortLabel: "5. Kierath's Street Frontage",
    street: '82 Dandaloo Street (East Street Frontage)',
    buildingIds: ['NR-SITE-dandaloo-82'],
    detailedId: 'dandaloo-82',
    placeName: "Kierath's Shopping Square",
    // Positioned west of the median palm tree (-4770.7, -896.0) and median statue (-4771.7, -889.0)
    camera: { x: -4776.5, z: -892.0, pitchRad: 0.03, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4778.0, z: -892.0, pitchRad: 0.03, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4802.0, z: -894.0 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'HIGH (2023 LiDAR 3.25m awning + unobstructed Dandaloo St carriageway vantage west of median palm)',
    focalLengthNote: 'Camera moved to x=-4776.5 (6m west of the median palm tree at -4770.7) so the entire Kierath, Nelson & Co. fascia and awning are unobstructed.',
    architecturalFocus: [
      'KIERATH, NELSON & CO. PTY. LTD. historic fascia signboard above Dandaloo Street cantilevered awning',
      '3.25m LiDAR-measured street verandah/awning and northern bullnose awning segment',
      'Open-air arcade forecourt entrance and circular glazed front kiosk (KIERATHS_KIOSK)',
      'Red-brick Dandaloo Street shopfront glazing and individual tenancy bays',
    ],
    responsibleFiles: ['src/world/narromine-kieraths.js', 'src/world/narromine-kieraths-data.js', 'src/world/narromine.js'],
    activeAgentClaims: ["PR #309 (feat/kieraths-live-courtyard-geometry-20261104) — Kierath's live 3D arcade geometry"],
  },
  {
    id: 'kieraths-courtyard-shopfronts',
    order: 6,
    title: "6. Kierath's internal courtyard and shopfronts",
    shortLabel: "6. Kierath's Courtyard",
    street: "Kierath's Shopping Square (Internal Pedestrian Arcade)",
    buildingIds: ['NR-SITE-dandaloo-82'],
    detailedId: 'dandaloo-82',
    placeName: "Kierath's Shopping Square",
    camera: { x: -4806.5, z: -916.6, pitchRad: 0.02, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4806.5, z: -916.6, pitchRad: 0.02, eyeHeightM: 1.65, fovDeg: 72 },
    target: { x: -4828.0, z: -922.0 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'MEDIUM-HIGH (internal pedestrian courtyard — not covered by road-based Street View car; verified against plan & rear arch photos)',
    focalLengthNote: 'Pedestrian eye height (1.65m) looking WSW down the diagonal tiled arcade passage toward the arched rear canopy.',
    architecturalFocus: [
      'Open-air diagonal paved pedestrian passage with flush tile banding (no solid roof box blocking sky)',
      '10 individual brick shop bays with dark aluminium mullions, glazed doors, and cantilevered white/grey awnings on steel posts',
      'Curved metal arched rear entrance canopy ("KIERATH\'S SHOPPING SQUARE" sign) opening to rear carpark',
    ],
    responsibleFiles: ['src/world/narromine-kieraths.js', 'src/world/narromine-kieraths-data.js'],
    activeAgentClaims: ["PR #309 (feat/kieraths-live-courtyard-geometry-20261104) — Kierath's courtyard & shopfronts"],
  },
  {
    id: 'railway-station-platform',
    order: 7,
    title: '7. Railway station — building and platform',
    shortLabel: '7. Railway Station',
    street: 'Derribong Avenue (Narromine Station Access)',
    buildingIds: ['NR-OSM-0030', 'NR-OSM-0029', 'NR-OSM-0199'],
    detailedId: null,
    placeName: 'Narromine Railway Station',
    camera: { x: -4722.0, z: -692.5, pitchRad: 0.03, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4724.0, z: -690.0, pitchRad: 0.02, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4708.8, z: -712.5 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'HIGH (Lot 4 DP 1012153 + 2023 NSW LiDAR eave 3.45m / ridge 5.85m + OSM footprints osm:29, osm:28, osm:198)',
    focalLengthNote: 'Forecourt vantage on Narromine Station Access looking SSE toward the 1883 heritage station building, platform awning, and Main Western Line tracks.',
    architecturalFocus: [
      '1883 heritage station building (osm:29, 32.16m × 9.10m, LiDAR eave 3.45m, hipped roof ridge 5.85m, brick chimneys)',
      '142m concrete-faced side platform with yellow tactile safety line, cantilevered platform awning, and double-sided NARROMINE station boards',
      'Eastern goods/parcels office (osm:28), Dandaloo St level-crossing relay hut (osm:198), and NSW TrainLink coach stop shelter',
    ],
    responsibleFiles: ['src/world/narromine-railway-precinct.js', 'src/world/narromine-railway-evidence.js', 'src/world/narromine.js'],
    activeAgentClaims: ['PR #312 & PR #316 (MERGED to main) — Narromine Railway Station precinct reconstruction'],
  },
  {
    id: 'ordinary-narromine-streets-shops',
    order: 8,
    title: '8. Ordinary Narromine residential streets and shops',
    shortLabel: '8. Ordinary Streets & Shops',
    street: 'Nymagee Street & 76–88 Dandaloo Street',
    buildingIds: ['NR-SITE-dandaloo-76', 'NR-SITE-dandaloo-86', 'NR-SITE-dandaloo-88'],
    detailedId: 'dandaloo-86',
    placeName: 'His and Hers Clip Joint',
    camera: { x: -4774.0, z: -852.0, pitchRad: 0.03, eyeHeightM: 1.65, fovDeg: 72 },
    streetViewCarCamera: { x: -4775.5, z: -852.0, pitchRad: 0.03, eyeHeightM: 2.45, fovDeg: 75 },
    target: { x: -4808.0, z: -852.0 },
    minExpectedTriangles: 1200,
    minExpectedDrawCalls: 5,
    cameraConfidence: 'HIGH (Dandaloo Street carriageway opposite 86–88 Dandaloo St, synced with Wikimedia Commons CC BY 3.0 File:Narromine_Dandaloo_Street_002.JPG)',
    focalLengthNote: 'Positioned on the eastern lane of Dandaloo Street (x=-4774.0, z=-852.0, 20m clear of the 86 Dandaloo St facade) looking West across Dandaloo Street toward 86 & 88 Dandaloo Street.',
    architecturalFocus: [
      '86 Dandaloo Street church & church hall (gabled roof, buttresses, porch) and 88 Dandaloo Street (His and Hers Clip Joint shopfront)',
      'Unmapped generic FILL_SHOPS along Dandaloo/Burraway Streets and FILL_HOUSES along Nymagee Street',
      'Disjoint asphalt carriageway, concrete kerbs, footpaths, and street tree spacing',
    ],
    responsibleFiles: ['src/world/narromine.js', 'src/world/narromine-layout.js', 'src/world/narromine-facade-profiles.js', 'src/world/narromine-road-surfaces.js'],
    activeAgentClaims: ['PR #310 (Phase A facade profiles, MERGED) & PR #311 (licensed photo catalogue, MERGED 4 Nov)'],
  },
];

export const NARROMINE_PHOTO_LOCATIONS = Object.freeze(
  RAW_PHOTO_LOCATIONS.map((loc) => {
    const yawRad = yawTowards(loc.camera.x, loc.camera.z, loc.target.x, loc.target.z);
    const synced = syncPoseFromGameToReal({
      x: loc.camera.x,
      z: loc.camera.z,
      eyeHeightM: loc.camera.eyeHeightM || 1.65,
      yawRad,
      pitchRad: loc.camera.pitchRad || 0,
      fovDeg: loc.camera.fovDeg || 72,
    });
    const carYawRad = yawTowards(
      loc.streetViewCarCamera.x,
      loc.streetViewCarCamera.z,
      loc.target.x,
      loc.target.z
    );
    const syncedCar = syncPoseFromGameToReal({
      x: loc.streetViewCarCamera.x,
      z: loc.streetViewCarCamera.z,
      eyeHeightM: loc.streetViewCarCamera.eyeHeightM || 2.45,
      yawRad: carYawRad,
      pitchRad: loc.streetViewCarCamera.pitchRad || 0,
      fovDeg: loc.streetViewCarCamera.fovDeg || 75,
    });
    const targetGeo = worldToGeoCoords(loc.target.x, loc.target.z);
    return Object.freeze({
      ...loc,
      camera: Object.freeze(synced),
      streetViewCarCamera: Object.freeze(syncedCar),
      target: Object.freeze({
        ...loc.target,
        lat: targetGeo.lat,
        lon: targetGeo.lon,
      }),
      googleMapsExternalUrl: buildGoogleMapsStreetViewUrl(synced),
      buildingIds: Object.freeze([...loc.buildingIds]),
      architecturalFocus: Object.freeze([...loc.architecturalFocus]),
      responsibleFiles: Object.freeze([...loc.responsibleFiles]),
      activeAgentClaims: Object.freeze([...loc.activeAgentClaims]),
    });
  })
);
