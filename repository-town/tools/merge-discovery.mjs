import fs from 'node:fs';
const exhibits = JSON.parse(fs.readFileSync(new URL('../data/discovery-games.json', import.meta.url), 'utf8'));

// Preserve the previous playtest's toys without replacing the latest designed rooms,
// archive or playable arcade cabinets. Data contains public-safe exhibit text only.
export function mergeDiscovery(house) {
  const additions = structuredClone(exhibits[house.coordinate] || []);
  if (!additions.length) return house;
  const rooms = house.int.rooms.map(r => ({ ...r, props: r.props.map(p => structuredClone(p)) }));
  const extra = [];
  for (const prop of additions) {
    const room = rooms.find(r => r.props.some(p => p[0] === prop[0] && p[1] === prop[1] && (!p[2]?.do || p[2]?.toy)));
    if (room) {
      const i = room.props.findIndex(p => p[0] === prop[0] && p[1] === prop[1] && (!p[2]?.do || p[2]?.toy));
      room.props[i] = [prop[0], prop[1], { ...room.props[i][2], ...prop[2] }];
    } else extra.push(prop);
  }
  if (extra.length) rooms.push({ name: 'Discovery games', archive: true, w: 9, d: 9, floor: 0x6d5a48, walls: 0xd9d2c3, props: extra });
  // Keep the earlier replacement of empty Issues walls with useful project guides.
  for (const room of rooms) for (const p of room.props) {
    if (p[2]?.url && /\/issues\/?$/.test(p[2].url)) {
      p[2].url = p[2].url.replace(/\/issues\/?$/, '#readme');
      if (/issues/i.test(p[1] || '')) p[1] = 'Project guide';
      if (/issues/i.test(p[2].title || '')) p[2].title = 'Project guide';
    }
  }
  return { ...house, int: { ...house.int, rooms } };
}
