// Isolated metadata adapter: authoritative game poses and Narromine's OSM projection.
import { NARROMINE_QA_LOCATIONS } from '../locations.mjs';
import { OSM, OFFSET, REGION } from '../../../src/world/narromine-layout.js';
const RAD = Math.PI / 180, EARTH = 6371008.8;
const COS = Math.cos(OSM.anchor.lat * RAD);
export const worldToGeo = (x, z) => ({
  lat: OSM.anchor.lat - (z - OFFSET.z) / (RAD * EARTH),
  lng: OSM.anchor.lon + (x - OFFSET.x) / (RAD * EARTH * COS),
});
export const geoToWorld = (lat, lng) => ({
  x: OFFSET.x + (lng - OSM.anchor.lon) * RAD * EARTH * COS,
  z: OFFSET.z - (lat - OSM.anchor.lat) * RAD * EARTH,
});
export const presetData = () => ({
  anchor: { ...OSM.anchor },
  offset: { ...OFFSET },
  region: { ...REGION },
  presets: NARROMINE_QA_LOCATIONS.map(loc => ({
    id: loc.id,
    title: loc.title,
    description: loc.description,
    camera: { x: loc.camera.x, z: loc.camera.z, heading: loc.camera.headingDeg },
    target: { ...loc.target },
    geo: worldToGeo(loc.camera.x, loc.camera.z),
  })),
});