// Mapillary proxy for Narromine comparison. The token lives only in the Vercel environment
// (MAPILLARY_TOKEN, "sensitive"); it never reaches the browser or this public repository.
// Mapillary imagery is CC BY-SA 4.0 (credit the photographer and Mapillary).
//   GET /api/mapillary?kind=images&lat=-32.2343&lng=148.2391&r=60   nearest street-level photos
//   GET /api/mapillary?kind=features&lat=..&lng=..&r=150            detected objects (poles, signs, lights...)
// Only small boxes inside the Narromine area are served, so the endpoint can't be used as a general proxy.
const AREA = { minLat: -32.30, maxLat: -32.18, minLng: 148.15, maxLng: 148.33 };
const FIELDS = {
  images: 'id,captured_at,compass_angle,computed_compass_angle,geometry,computed_geometry,thumb_1024_url,thumb_2048_url,creator,sequence,is_pano',
  features: 'id,object_value,geometry,first_seen_at,last_seen_at',
};
export default async function handler(req, res) {
  const send = (code, body, cache = 'no-store') => { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', cache); res.end(JSON.stringify(body)); };
  const token = String(process.env.MAPILLARY_TOKEN || '').trim();
  if (!token) return send(503, { error: 'MAPILLARY_TOKEN is not set in this deployment.' });
  const url = new URL(req.url, 'http://local'), kind = url.searchParams.get('kind') || 'images';
  const lat = Number(url.searchParams.get('lat')), lng = Number(url.searchParams.get('lng')), r = Math.min(300, Math.max(10, Number(url.searchParams.get('r')) || 60));
  if (!FIELDS[kind] || !Number.isFinite(lat) || !Number.isFinite(lng)) return send(400, { error: 'Use kind=images|features with numeric lat and lng.' });
  if (lat < AREA.minLat || lat > AREA.maxLat || lng < AREA.minLng || lng > AREA.maxLng) return send(400, { error: 'Only the Narromine area is served.' });
  const dLat = r / 111320, dLng = r / (111320 * Math.cos(lat * Math.PI / 180));
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].map(v => v.toFixed(6)).join(',');
  const api = `https://graph.mapillary.com/${kind === 'images' ? 'images' : 'map_features'}?fields=${FIELDS[kind]}&bbox=${bbox}&limit=${kind === 'images' ? 200 : 500}`;
  try {
    const r2 = await fetch(api, { headers: { Authorization: 'OAuth ' + token } });
    const body = await r2.json();
    if (!r2.ok) return send(502, { error: 'Mapillary refused the request', status: r2.status, detail: body?.error?.message || null });
    const data = (body.data || []).map(d => ({ ...d, distance: d.computed_geometry || d.geometry ? Math.round(Math.hypot(((d.computed_geometry || d.geometry).coordinates[1] - lat) * 111320, ((d.computed_geometry || d.geometry).coordinates[0] - lng) * 111320 * Math.cos(lat * Math.PI / 180))) : null }))
      .sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    return send(200, { kind, lat, lng, r, count: data.length, licence: 'Mapillary imagery CC BY-SA 4.0', data }, 'public, max-age=3600');
  } catch (e) { return send(502, { error: 'Mapillary request failed', detail: String(e.message || e) }); }
}
