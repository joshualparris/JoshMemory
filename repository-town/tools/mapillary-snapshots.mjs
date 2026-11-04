// Saves the nearest Mapillary street-level photos (CC BY-SA 4.0) for each Narromine review spot into
// docs/mapillary/, with a credits README (photographer, capture date, Mapillary link). Reference for
// comparing Repository Town's Narromine with the real town.
//   MAPILLARY_TOKEN=... node tools/mapillary-snapshots.mjs [perSpot=2]
import fs from 'node:fs';
import { worldToGeo } from '../src/world/narromine-railway-evidence.js';
const token = process.env.MAPILLARY_TOKEN; if (!token) throw new Error('Set MAPILLARY_TOKEN');
const perSpot = Number(process.argv[2]) || 2, dir = 'docs/mapillary';
// The ten spots in docs/NARROMINE_STREETVIEW_REVIEW.md (game x, z).
const SPOTS = [
  ['01-hotel', 'Dandaloo St at the Narromine Hotel', -4813, -700], ['02-post-office', 'Dandaloo St at the post office', -4808, -860],
  ['03-dandaloo-north', 'Dandaloo St north block', -4813, -1050], ['04-burraway', "Burraway St by Monaghan's Butchery", -4680, -815],
  ['05-station-crossing', 'Station and Dandaloo St level crossing', -4790, -790], ['06-residential', 'Residential street west of Dandaloo St', -4950, -650],
  ['07-silo-crossing', 'Silo Access Road crossing', -5488, -850], ['08-manildra-crossing', 'Manildra Street level crossing', -4052, -395],
  ['09-highway-entry', 'Mitchell Highway entering from Dubbo', -4400, -120], ['10-backstreet', 'Back street east of Dandaloo St', -4600, -950],
];
fs.mkdirSync(dir, { recursive: true });
const rows = [];
for (const [slug, label, x, z] of SPOTS) {
  const [lat, lng] = worldToGeo([x, z]), d = 80 / 111320, e = 80 / (111320 * Math.cos(lat * Math.PI / 180));
  const url = `https://graph.mapillary.com/images?fields=id,captured_at,compass_angle,computed_geometry,thumb_1024_url,creator&bbox=${lng - e},${lat - d},${lng + e},${lat + d}&limit=50`;
  const body = await (await fetch(url, { headers: { Authorization: 'OAuth ' + token } })).json();
  const imgs = (body.data || []).map(i => ({ ...i, dist: Math.hypot((i.computed_geometry.coordinates[1] - lat) * 111320, (i.computed_geometry.coordinates[0] - lng) * 111320 * Math.cos(lat * Math.PI / 180)) }))
    .sort((a, b) => a.dist - b.dist).slice(0, perSpot);
  if (!imgs.length) { rows.push(`| ${label} | (no Mapillary photo within 80 m) | | | |`); continue; }
  for (const i of imgs) {
    const file = `${slug}-${i.id}.jpg`;
    fs.writeFileSync(`${dir}/${file}`, Buffer.from(await (await fetch(i.thumb_1024_url)).arrayBuffer()));
    const date = new Date(i.captured_at).toISOString().slice(0, 10), who = i.creator?.username || 'Mapillary contributor';
    rows.push(`| ${label} | ![${label}](${file}) | ${who} | ${date} | [${i.id}](https://www.mapillary.com/app/?pKey=${i.id}) · ${Math.round(i.dist)} m away, facing ${Math.round(i.compass_angle)}° |`);
  }
  console.log(slug, imgs.length);
}
fs.writeFileSync(`${dir}/README.md`, `# Mapillary reference photos of Narromine

Street-level photos from [Mapillary](https://www.mapillary.com), licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Each photo is credited to its
photographer below. They are kept here as references for making Repository Town's Narromine true to
life, for the review spots in [NARROMINE_STREETVIEW_REVIEW.md](../NARROMINE_STREETVIEW_REVIEW.md).
Regenerate with \`MAPILLARY_TOKEN=... node tools/mapillary-snapshots.mjs\`.

| Spot | Photo | Photographer | Captured | Mapillary image |
|---|---|---|---|---|
${rows.join('\n')}
`);
