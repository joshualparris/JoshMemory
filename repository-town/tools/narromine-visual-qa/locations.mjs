// Deterministic camera, viewport, and daylight specification for Narromine Visual QA.
// Uses existing world coordinates from src/world/narromine-layout.js without modifying
// any scene, building, or gameplay files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_TOWN_ROOT = path.resolve(__dirname, '../..');

/**
 * Computes the game's player yaw (radians) so the camera at (x, z) faces (targetX, targetZ).
 * In Repository Town (src/main.js), forward vector is (-Math.sin(yaw), 0, -Math.cos(yaw)).
 */
export function yawTowards(x, z, targetX, targetZ) {
  const dx = targetX - x;
  const dz = targetZ - z;
  if (Math.hypot(dx, dz) < 1e-6) return 0;
  return Number(Math.atan2(-dx, -dz).toFixed(6));
}

/**
 * Converts a player yaw (radians) into compass heading degrees (0 = N, 90 = E, 180 = S, 270 = W)
 * matching src/ui/compass.js (where -Z is geographic north and +X is east).
 */
export function yawToCompassHeading(yaw) {
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  const deg = ((Math.atan2(fx, -fz) * 180) / Math.PI % 360 + 360) % 360;
  return Number(deg.toFixed(2));
}

export function compassCardinalFromHeading(heading) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round((((heading % 360) + 360) % 360) / 45) % 8];
}

export const VIEWPORTS = Object.freeze({
  desktop: Object.freeze({
    id: 'desktop',
    label: 'Desktop (1280×800)',
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  }),
  mobile: Object.freeze({
    id: 'mobile',
    label: 'Mobile (393×852)',
    width: 393,
    height: 852,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  }),
});

export const LIGHTING_PRESETS = Object.freeze({
  morning: Object.freeze({
    id: 'morning',
    label: 'Morning (08:00)',
    minute: 8 * 60,
    timeLabel: '08:00',
    weather: 'clear',
    description: 'Low eastern sun with long westward morning shadows along Dandaloo Street',
  }),
  midday: Object.freeze({
    id: 'midday',
    label: 'Midday (12:30)',
    minute: 12 * 60 + 30,
    timeLabel: '12:30',
    weather: 'clear',
    description: 'High overhead northern sun with compact midday verandah shadows',
  }),
  'late-afternoon': Object.freeze({
    id: 'late-afternoon',
    label: 'Late Afternoon (16:45)',
    minute: 16 * 60 + 45,
    timeLabel: '16:45',
    weather: 'clear',
    description: 'Warm western sun illuminating west-facing Dandaloo Street elevations',
  }),
});

const RAW_LOCATIONS = [
  {
    id: 'royal-hotel-dandaloo',
    order: 1,
    title: 'Royal Hotel — Dandaloo Street',
    shortLabel: '1. Royal Hotel',
    category: 'landmark-hotel',
    street: 'Dandaloo Street',
    buildingIds: ['NR-SITE-royal-hotel'],
    detailedId: 'royal-hotel',
    placeName: 'Royal Hotel',
    camera: { x: -4825.5, z: -545.0 },
    target: { x: -4804.4, z: -542.0 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    description:
      'West side of Dandaloo Street facing ENE toward the 1890 single-storey Royal Hotel street verandah, ground-floor pub frontage, beer garden tables, and pitched hip roof.',
  },
  {
    id: 'narromine-hotel-corner',
    order: 2,
    title: 'Narromine Hotel — street-facing corner',
    shortLabel: '2. Narromine Hotel',
    category: 'landmark-hotel',
    street: 'Dandaloo Street & Derribong Avenue',
    buildingIds: ['NR-SITE-narromine-hotel'],
    detailedId: 'narromine-hotel',
    placeName: 'Narromine Hotel',
    camera: { x: -4795.0, z: -692.0 },
    target: { x: -4820.5, z: -712.5 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    description:
      'South-east corner approach across the Dandaloo Street and Derribong Avenue intersection looking NW at the 1901 Narromine (Federal) Hotel corner verandahs and iron-lace friezes.',
  },
  {
    id: 'post-office-entrance',
    order: 3,
    title: 'Post Office — front entrance',
    shortLabel: '3. Post Office',
    category: 'civic-landmark',
    street: '74 Dandaloo Street (corner Nymagee Street)',
    buildingIds: ['NR-SITE-narromine-post-office'],
    detailedId: 'narromine-post-office',
    placeName: 'Narromine Post Office',
    camera: { x: -4783.5, z: -960.5 },
    target: { x: -4791.22, z: -947.5 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    description:
      'North-east approach on Nymagee/Dandaloo Street looking SSW at the Narromine Post Office public entrance steps, doorway, red postbox, and corner awnings without triggering indoor entry.',
  },
  {
    id: 'coles-kieraths-dandaloo',
    order: 4,
    title: "Coles and Kierath's Dandaloo frontage",
    shortLabel: "4. Coles & Kierath's",
    category: 'retail-precinct',
    street: '82 Dandaloo Street',
    buildingIds: ['NR-SITE-dandaloo-82'],
    detailedId: 'dandaloo-82',
    placeName: 'Coles',
    camera: { x: -4764.5, z: -898.0 },
    target: { x: -4794.0, z: -892.0 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    description:
      "Eastern side of Dandaloo Street looking WNW across the carriageway toward the Kierath, Nelson & Co. street awning, arcade entrance forecourt, and Coles pitched gable halls.",
  },
  {
    id: 'kieraths-arcade-courtyard',
    order: 5,
    title: "Kierath's arcade — pedestrian courtyard",
    shortLabel: "5. Kierath's Courtyard",
    category: 'retail-arcade',
    street: "Kierath's Shopping Square (pedestrian route)",
    buildingIds: ['NR-SITE-dandaloo-82'],
    detailedId: 'dandaloo-82',
    placeName: 'Coles',
    camera: { x: -4806.5, z: -916.6 },
    target: { x: -4828.0, z: -922.0 },
    minExpectedTriangles: 1500,
    minExpectedDrawCalls: 5,
    description:
      "Inside the open-air pedestrian courtyard of Kierath's Shopping Square looking WSW between the ten individual brick shop bays toward the arched rear canopy.",
  },
  {
    id: 'ordinary-narromine-street',
    order: 6,
    title: 'A representative ordinary Narromine street',
    shortLabel: '6. Ordinary Street (Nymagee St)',
    category: 'residential-street',
    street: 'Nymagee Street (west of Dandaloo Street)',
    buildingIds: [],
    detailedId: null,
    placeName: null,
    camera: { x: -4902.0, z: -977.5 },
    target: { x: -4945.0, z: -984.0 },
    minExpectedTriangles: 1200,
    minExpectedDrawCalls: 5,
    description:
      'Representative Narromine residential streetscape along Nymagee Street looking WNW, showing kerbed footpaths, LiDAR-measured OSM residential footprints on the south side, and generic residential infill houses on the north side.',
  },
];

export const NARROMINE_QA_LOCATIONS = Object.freeze(
  RAW_LOCATIONS.map((loc) => {
    const yawRad = yawTowards(loc.camera.x, loc.camera.z, loc.target.x, loc.target.z);
    const headingDeg = yawToCompassHeading(yawRad);
    const cardinal = compassCardinalFromHeading(headingDeg);
    return Object.freeze({
      ...loc,
      camera: Object.freeze({
        x: loc.camera.x,
        z: loc.camera.z,
        yawRad,
        headingDeg,
        cardinal,
      }),
      target: Object.freeze({ ...loc.target }),
      buildingIds: Object.freeze([...loc.buildingIds]),
    });
  })
);

/**
 * Loads verified, licensed reference photo metadata from data/narromine-photo-references.json.
 * Never fabricates reference images: if no reviewed licensed record matches a location's
 * buildingIds, returns null for referencePhoto.
 */
export function loadLicensedPhotoReferences(repoTownRoot = REPO_TOWN_ROOT) {
  const refPath = path.join(repoTownRoot, 'data', 'narromine-photo-references.json');
  try {
    const raw = JSON.parse(fs.readFileSync(refPath, 'utf8'));
    const records = Array.isArray(raw.records) ? raw.records : [];
    return {
      policy: raw.policy || '',
      baselineDate: raw.baselineDate || null,
      records: records.filter(
        (r) => r && r.reviewed === true && r.locallyOwnedFile && r.licenceOrPermission
      ),
    };
  } catch {
    return { policy: '', baselineDate: null, records: [] };
  }
}

export function resolveReferencePhotoForLocation(location, photoCatalogue) {
  if (!photoCatalogue || !Array.isArray(photoCatalogue.records) || !location.buildingIds?.length) {
    return null;
  }
  const match = photoCatalogue.records.find(
    (r) =>
      Array.isArray(r.buildingIds) &&
      r.buildingIds.some((id) => location.buildingIds.includes(id))
  );
  if (!match) return null;
  return {
    id: match.id,
    buildingIds: match.buildingIds,
    creator: match.creator || null,
    captureDate: match.captureDate || null,
    sourceUrl: match.sourceUrl || null,
    licenceOrPermission: match.licenceOrPermission,
    locallyOwnedFile: match.locallyOwnedFile,
  };
}
