// Exports auditable cadastral vs approximated arcade features for QGIS/geojson.io.
// Run: node tools/kieraths-phase1-geojson.mjs
// Prints FeatureCollection to stdout; redirect to a .geojson file if wanted.
// Pure offline export: NO external API requests and NO commercial imagery.
import { KIERATHS_PHASE1_GEOJSON, KIERATHS_PHASE1_TOPOLOGY } from '../src/world/narromine-kieraths-site-audit.js';
if (process.argv.includes('--summary')) {
  const counts = KIERATHS_PHASE1_GEOJSON.features.reduce((m, f) => {
    m[f.properties.confidence] = (m[f.properties.confidence] || 0) + 1;
    return m;
  }, {});
  console.log(JSON.stringify({ features: KIERATHS_PHASE1_GEOJSON.features.length,
    byConfidence: counts, topology: KIERATHS_PHASE1_TOPOLOGY }, null, 2));
} else {
  console.log(JSON.stringify(KIERATHS_PHASE1_GEOJSON, null, 2));
}
