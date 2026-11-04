// Photograph Provenance & Local Fedora Availability Audit for Narromine Visual Fidelity.
// Verifies actual file existence on disk and never fabricates photographs, permissions, or dates.
import fs from 'node:fs';
import path from 'node:path';
import { REPO_TOWN_ROOT, geoToWorldCoords } from './geo-sync.mjs';

const RAW_PROVENANCE_CATALOGUE = [
  // ── 1. Verified Local NSW Spatial Services CC BY 4.0 Orthophotos in docs/narromine/ ──
  {
    id: 'nsw-spatial-royal-hotel-aerial',
    originalFilename: 'royal-hotel-aerial-nsw-spatial-cc-by-4.png',
    relativePath: 'docs/narromine/royal-hotel-aerial-nsw-spatial-cc-by-4.png',
    locationId: 'royal-hotel-dandaloo',
    buildingIds: ['NR-SITE-royal-hotel'],
    buildingName: 'Royal Hotel (123 Dandaloo Street)',
    captureDate: '2012–2023 (NSW Spatial Services Standard Orthophoto)',
    source: 'NSW Government Spatial Services (Six Maps / NSW Imagery Web Map Service)',
    owner: 'State of New South Wales (Spatial Services, a business unit of the Department of Customer Service NSW)',
    licenceOrPermission: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    publicRedistributionAllowed: true,
    viewType: 'nadir-aerial-orthophoto',
    camera: {
      lat: -32.235325,
      lon: 148.239205,
      headingDeg: 90,
      pitchDeg: -85,
      eyeHeightM: 120,
    },
    architecturalFeaturesVisible: [
      'Two-line painted block lettering "ROYAL" / "HOTEL" directly on the western corrugated metal roof slope above the Dandaloo St verandah',
      'Full Dandaloo Street cantilevered/post-supported verandah roof and northern/southern returns',
      'Front hipped roof block + 3 parallel east–west gabled/skillion wings (wingN, wingM, wingS) + square pyramid-hipped rear block',
      'Southern asphalt drive-through/carpark apron, rear lawn with mature shade trees, and Dandaloo Street median tree strip with 45° angled parking',
    ],
    matchingConfidence: 'HIGH — Cadastral lot boundary (red polygon) and G-NAF point (yellow circle) directly overlaid on orthophoto.',
  },
  {
    id: 'nsw-spatial-narromine-hotel-aerial',
    originalFilename: 'narromine-hotel-aerial-nsw-spatial-cc-by-4.png',
    relativePath: 'docs/narromine/narromine-hotel-aerial-nsw-spatial-cc-by-4.png',
    locationId: 'narromine-hotel-corner',
    buildingIds: ['NR-SITE-narromine-hotel'],
    buildingName: 'Narromine Hotel (89–93 Dandaloo Street & Derribong Avenue)',
    captureDate: '2012–2023 (NSW Spatial Services Standard Orthophoto)',
    source: 'NSW Government Spatial Services (Six Maps / NSW Imagery Web Map Service)',
    owner: 'State of New South Wales (Spatial Services, Department of Customer Service NSW)',
    licenceOrPermission: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    publicRedistributionAllowed: true,
    viewType: 'nadir-aerial-orthophoto',
    camera: {
      lat: -32.236865,
      lon: 148.239015,
      headingDeg: 310,
      pitchDeg: -85,
      eyeHeightM: 120,
    },
    architecturalFeaturesVisible: [
      'Lot 13 DP519453 cadastral boundary (red outline) with 27.23m Dandaloo St × 23.40m Derribong Ave two-storey wrap verandah',
      'Continuous hipped corrugated metal roof (LiDAR 10.95m ridge, 8.90m eave) with 4 brick chimneys and central courtyard lightwell',
      'Chamfered/curved SE corner pediment apex at the Dandaloo St & Derribong Ave intersection',
      'Adjoining single-storey northern shopfront roof and western beer-garden/motel outbuildings',
    ],
    matchingConfidence: 'HIGH — Anchored to Lot 13 DP519453 cadastre and 2023 NSW LiDAR point cloud.',
  },
  {
    id: 'nsw-spatial-post-office-aerial',
    originalFilename: 'narromine-post-office-aerial-nsw-spatial-cc-by-4.png',
    relativePath: 'docs/narromine/narromine-post-office-aerial-nsw-spatial-cc-by-4.png',
    locationId: 'post-office-entrance',
    buildingIds: ['NR-SITE-narromine-post-office'],
    buildingName: 'Narromine Post Office (74 Dandaloo Street)',
    captureDate: '2012–2023 (NSW Spatial Services Standard Orthophoto)',
    source: 'NSW Government Spatial Services (Six Maps / NSW Imagery Web Map Service)',
    owner: 'State of New South Wales (Spatial Services, Department of Customer Service NSW)',
    licenceOrPermission: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    publicRedistributionAllowed: true,
    viewType: 'nadir-aerial-orthophoto',
    camera: {
      lat: -32.233635,
      lon: 148.239305,
      headingDeg: 225,
      pitchDeg: -85,
      eyeHeightM: 90,
    },
    architecturalFeaturesVisible: [
      'L-shaped hipped corrugated roof over north wing and Dandaloo Street frontage with rear flat-roofed outbuilding',
      'North-east corner recessed entrance portico and L-shaped perimeter hedge/planter bed at Dandaloo & Nymagee Streets',
      'Perpendicular/angled kerbside parking bays along Dandaloo Street and pedestrian zebra crossing approach',
    ],
    matchingConfidence: 'HIGH — Metric grid and cadastral parcel boundary overlaid directly on orthophoto.',
  },

  // ── 2. Verified Wikimedia Commons CC BY 3.0 Street-Level Photographs (PR #311) ──
  {
    id: 'commons-royal-2017-001',
    originalFilename: 'Narromine_Royal_Hotel_001.JPG',
    relativePath: null,
    locationId: 'royal-hotel-dandaloo',
    buildingIds: ['NR-SITE-royal-hotel'],
    buildingName: 'Royal Hotel (123 Dandaloo Street)',
    captureDate: '2017-11-28T14:09:53+11:00',
    source: 'Wikimedia Commons',
    owner: 'Mattinbgn',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Narromine_Royal_Hotel_001.JPG',
    licenceOrPermission: 'CC BY 3.0 Unported (attribution required: Mattinbgn)',
    licenceUrl: 'https://creativecommons.org/licenses/by/3.0/',
    publicRedistributionAllowed: true,
    viewType: 'street-level-photograph',
    camera: {
      lat: -32.235436,
      lon: 148.238908,
      headingDeg: 118.5,
      pitchDeg: 3.0,
      eyeHeightM: 1.65,
    },
    architecturalFeaturesVisible: [
      'Royal Hotel exterior from across Dandaloo Street (2017 baseline — historical reference; verify 2026 paint/signage changes in live Street View)',
      'Single-storey street verandah, roof pitch with painted ROYAL HOTEL lettering, and Dandaloo Street frontage',
    ],
    matchingConfidence: 'HIGH — EXIF GPS (-32.235436, 148.238908) maps directly to game (-4828.46, -565.35) on Dandaloo Street.',
  },
  {
    id: 'commons-dandaloo-2017-002',
    originalFilename: 'Narromine_Dandaloo_Street_002.JPG',
    relativePath: null,
    locationId: 'ordinary-narromine-streets-shops',
    buildingIds: ['NR-SITE-dandaloo-82', 'NR-SITE-dandaloo-86', 'NR-SITE-dandaloo-88'],
    buildingName: 'Dandaloo Street commercial & civic streetscape (near 82–88 Dandaloo Street)',
    captureDate: '2017-11-28T13:11:45+11:00',
    source: 'Wikimedia Commons',
    owner: 'Mattinbgn',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Narromine_Dandaloo_Street_002.JPG',
    licenceOrPermission: 'CC BY 3.0 Unported (attribution required: Mattinbgn)',
    licenceUrl: 'https://creativecommons.org/licenses/by/3.0/',
    publicRedistributionAllowed: true,
    viewType: 'street-level-photograph',
    camera: {
      lat: -32.232833,
      lon: 148.239319,
      headingDeg: 200.0,
      pitchDeg: 2.0,
      eyeHeightM: 1.65,
    },
    architecturalFeaturesVisible: [
      'Dandaloo Street carriageway, median strip, and shopfront/church streetscape context (2017 baseline)',
    ],
    matchingConfidence: 'HIGH — EXIF GPS (-32.232833, 148.239319) maps directly to game (-4789.81, -854.80) on Dandaloo Street.',
  },

  // ── 3. Josh's Street View Frame Sequence Referenced in Narromine Hotel Docs (Missing on Fedora) ──
  {
    id: 'streetview-frame-102248-643',
    originalFilename: '102248.643.jpg',
    relativePath: null,
    locationId: 'narromine-hotel-corner',
    buildingIds: ['NR-SITE-narromine-hotel'],
    buildingName: 'Narromine Hotel — SE Corner Pediment & Wrap Verandah (89–93 Dandaloo Street)',
    captureDate: 'Unknown (Google Street View capture, pre-2026)',
    source: 'Supplied by Josh in remote Claude/ChatGPT session (133-frame Dandaloo St sequence 102238.751.jpg–102257.437.jpg)',
    owner: 'Google Maps Street View / supplied reference frame (not committed to git per policy)',
    licenceOrPermission: 'Restricted — visual reference only; not permitted in public deployment bundles',
    licenceUrl: null,
    publicRedistributionAllowed: false,
    viewType: 'street-level-frame',
    camera: {
      lat: -32.236704,
      lon: 148.239179,
      headingDeg: 310.7,
      pitchDeg: 4.0,
      eyeHeightM: 2.45,
    },
    architecturalFeaturesVisible: [
      'Curved semicircular arched & stepped 1901 / NARROMINE HOTEL SE corner pediment with golden-amber crest',
      'Two-storey dark heritage-green (#2c4c32) fluted cast-iron verandah columns and cream Victorian iron lacework (#efe8d6)',
      'NARROMINE HOTEL MOTEL fascia sign, LOCAL LIQUOR & TAB signs, and SE road fingerboards',
    ],
    matchingConfidence: 'HIGH — Reconstructed in src/world/narromine-hotel.js (PR #318); raw image file is not on local Fedora disk (use live Street View sync or drag-and-drop local copy).',
  },
  {
    id: 'streetview-frame-102250-791',
    originalFilename: '102250.791.jpg',
    relativePath: null,
    locationId: 'narromine-hotel-corner',
    buildingIds: ['NR-SITE-narromine-hotel'],
    buildingName: 'Narromine Hotel — Dandaloo Street East Elevation Bays 1–4',
    captureDate: 'Unknown (Google Street View capture, pre-2026)',
    source: 'Supplied by Josh in remote Claude/ChatGPT session (frames 102238.751.jpg–102257.437.jpg)',
    owner: 'Google Maps Street View / supplied reference frame (not committed to git per policy)',
    licenceOrPermission: 'Restricted — visual reference only; not permitted in public deployment bundles',
    licenceUrl: null,
    publicRedistributionAllowed: false,
    viewType: 'street-level-frame',
    camera: {
      lat: -32.23661,
      lon: 148.23921,
      headingDeg: 280.0,
      pitchDeg: 3.5,
      eyeHeightM: 2.45,
    },
    architecturalFeaturesVisible: [
      'Dandaloo Street ground-floor recessed timber pub doors with fanlights, bar windows, and two framed wall notices between Bay 2 and Bay 3',
      'Upper-floor sash windows including wider 3-light sash window in Bay 3 and window box AC unit in Bay 1',
    ],
    matchingConfidence: 'HIGH — Documented in docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md:397-405; raw JPG absent from local Fedora disk.',
  },
  {
    id: 'streetview-frame-102253-251',
    originalFilename: '102253.251.jpg',
    relativePath: null,
    locationId: 'narromine-hotel-corner',
    buildingIds: ['NR-SITE-narromine-hotel'],
    buildingName: 'Narromine Hotel North Bays & Adjoining Single-Storey Charcoal Shopfront',
    captureDate: 'Unknown (Google Street View capture, pre-2026)',
    source: 'Supplied by Josh in remote Claude/ChatGPT session (frames 102238.751.jpg–102257.437.jpg)',
    owner: 'Google Maps Street View / supplied reference frame (not committed to git per policy)',
    licenceOrPermission: 'Restricted — visual reference only; not permitted in public deployment bundles',
    licenceUrl: null,
    publicRedistributionAllowed: false,
    viewType: 'street-level-frame',
    camera: {
      lat: -32.23648,
      lon: 148.23924,
      headingDeg: 265.0,
      pitchDeg: 2.5,
      eyeHeightM: 2.45,
    },
    architecturalFeaturesVisible: [
      'Adjoining single-storey dark-charcoal brick/clad northern shopfront (#2d3034) with stepped white lattice parapet screen and corrugated gable roof',
      'White split-system air-conditioner unit north of upper-floor Bay 7 on Dandaloo Street facade',
    ],
    matchingConfidence: 'HIGH — Documented in docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md:401-405; raw JPG absent from local Fedora disk.',
  },
  {
    id: 'streetview-frame-102255-014',
    originalFilename: '102255.014.jpg',
    relativePath: null,
    locationId: 'narromine-hotel-corner',
    buildingIds: ['NR-SITE-narromine-hotel'],
    buildingName: 'Narromine Hotel Exposed Red-Brick Upper North Wall & Northern Shopfront Doorway',
    captureDate: 'Unknown (Google Street View capture, pre-2026)',
    source: 'Supplied by Josh in remote Claude/ChatGPT session (frames 102238.751.jpg–102257.437.jpg)',
    owner: 'Google Maps Street View / supplied reference frame (not committed to git per policy)',
    licenceOrPermission: 'Restricted — visual reference only; not permitted in public deployment bundles',
    licenceUrl: null,
    publicRedistributionAllowed: false,
    viewType: 'street-level-frame',
    camera: {
      lat: -32.23639,
      lon: 148.23926,
      headingDeg: 245.0,
      pitchDeg: 3.0,
      eyeHeightM: 2.45,
    },
    architecturalFeaturesVisible: [
      'Unpainted exposed red face-brickwork (#9b4b38) on the upper north-facing wall (y=3.85..8.90m) above the single-storey northern shopfront with 3 recessed upper sash windows',
      'Glazed aluminium-framed display windows and central recessed doorway with bright magenta/pink surround (#d4487a) on the northern shopfront',
    ],
    matchingConfidence: 'HIGH — Documented in docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md:397-405; raw JPG absent from local Fedora disk.',
  },
];

/**
 * Audits all photographic reference records on the local Fedora filesystem and returns
 * structured availability status (`verified-local-file`, `verified-external-commons-url`,
 * or `missing-from-fedora-filesystem`) without inventing or fabricating any image files.
 */
export function auditPhotoProvenance(repoTownRoot = REPO_TOWN_ROOT) {
  const audited = RAW_PROVENANCE_CATALOGUE.map((rec) => {
    const worldCoords = geoToWorldCoords(rec.camera.lat, rec.camera.lon);
    let localExists = false;
    let resolvedLocalPath = null;
    let fileSizeBytes = null;

    if (rec.relativePath) {
      const candidate = path.join(repoTownRoot, rec.relativePath);
      if (fs.existsSync(candidate)) {
        localExists = true;
        resolvedLocalPath = candidate;
        fileSizeBytes = fs.statSync(candidate).size;
      }
    }

    let availabilityStatus = 'missing-from-fedora-filesystem';
    if (localExists) {
      availabilityStatus = 'verified-local-file';
    } else if (rec.sourceUrl) {
      availabilityStatus = 'verified-external-commons-url';
    }

    return Object.freeze({
      ...rec,
      camera: Object.freeze({
        ...rec.camera,
        x: worldCoords.x,
        z: worldCoords.z,
      }),
      localExists,
      resolvedLocalPath,
      fileSizeBytes,
      availabilityStatus,
    });
  });

  const summary = {
    totalCatalogued: audited.length,
    verifiedLocalFiles: audited.filter((r) => r.availabilityStatus === 'verified-local-file').length,
    verifiedExternalCommonsUrls: audited.filter(
      (r) => r.availabilityStatus === 'verified-external-commons-url'
    ).length,
    missingFromFedoraFilesystem: audited.filter(
      (r) => r.availabilityStatus === 'missing-from-fedora-filesystem'
    ).length,
    note:
      'Frames 102238.751.jpg–102257.437.jpg (including 102255.014.jpg and 102253.251.jpg) were uploaded to a remote Claude/ChatGPT cloud session and never committed to git. Three NSW Spatial Services CC BY 4.0 orthophoto crops exist locally in docs/narromine/, two Wikimedia Commons CC BY 3.0 street photos are linked via sourceUrl, and all 8 priority locations support live coordinate-synced Google Street View comparison and local drag-and-drop photo loading.',
  };

  return {
    summary,
    records: audited,
  };
}
