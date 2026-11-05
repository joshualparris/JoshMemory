// Centre paint is drawn by two sources: explicit OSM-tagged lanes and the
// illustrative main-road fallback. Never put their white surfaces on top of each other.
// All coordinates are in Narromine world x/z metres (same as STREETS and furniture.laned).
export function nearMappedLanePaint(laneRuns, x, z, tolerance = 3) {
  if (!(tolerance > 0) || !Number.isFinite(x) || !Number.isFinite(z)) return false;
  for (const points of laneRuns || []) {
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const lengthSquared = dx * dx + dz * dz;
      if (!(lengthSquared > 0)) continue;
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / lengthSquared));
      const ex = x - a[0] - t * dx, ez = z - a[1] - t * dz;
      if (ex * ex + ez * ez < tolerance * tolerance) return true;
    }
  }
  return false;
}

export function shouldDrawInferredCentreDash(kind, x, z, laneRuns) {
  // Existing trunk ways are split one-way carriageways, not two-way centre-lined roads.
  if (kind !== 'primary' && kind !== 'secondary') return false;
  // Check EACH candidate dash position, not only the first point of the entire road.
  return !nearMappedLanePaint(laneRuns, x, z);
}
