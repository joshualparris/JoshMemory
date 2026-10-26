import { createKit, ROOM } from './interior-kit.js';

// The Post Office, laid out like a small country post office:
//   • A full-width service counter at the back with scales, a stamp drawer, a card reader and a parcel hatch;
//     the sorting frames, mail trolley and parcel cage sit behind it.
//   • A wall of numbered PO boxes on the left, a letter slot box by the door, a packing bench with tape and
//     envelopes on the right, a rack of cards and stationery and a noticeboard of postal rates.
export const POST_LAYOUT = Object.freeze({
  counterZ: -5.5, staff: { x: 0.8, z: -6.7 }, staffUse: { x: 0.8, z: -4.3 },
  queue: { x: -1.7, z: -2.0 }, collection: { x: -2.9, z: -4.2 },
  loweredDesk: { x: 3.25, z: -4.25 }, entrance: { x: 0, z: 5.7 },
  staffBoundary: { z: -5.5, left: [-6.9, -4.4], right: [4.4, 6.9] },
});

export function buildPostInterior(site, makeLabel, roomTitle = 'Post office') {
  const k = createKit(site, makeLabel, roomTitle);
  const { THREE, group, box, cyl, ball, solid, text, add, model } = k;
  const { W, BACK, EDGE } = ROOM;
  const CZ = POST_LAYOUT.counterZ;
  group.add(new THREE.HemisphereLight(0xffffff, 0x77695a, 2.0));
  const RED = 0xc43c32, CREAM = 0xf0e8d8, WOODD = 0x5a4332, GREY = 0x8d949a, YEL = 0xe8b830, BLUE = 0x3f6fa0;
  k.shell({ wall: 0xe8e0cf, ceiling: 0xf3efe6, floor: 0xb5ab98 });
  for (let i = 0; i < 14; i++) for (let j = 0; j < 9; j++) box(0.96, 0.012, 1.9, -6.5 + i, 0.004, -11.4 + j * 1.9, (i + j) % 2 ? 0xb5ab98 : 0xa89e8b);   // lino tile
  box(W - 0.5, 0.9, 0.06, 0, 0.45, BACK + 0.15, RED);                                                               // red dado at the back
  for (const sx of [-EDGE + 0.15, EDGE - 0.15]) box(0.06, 0.9, 17.4, sx, 0.45, -3, RED);
  box(2.2, 0.03, 1.2, 0, 0.02, 5.0, 0x4a4038);
  for (const [x, z] of [[-4, 0], [4, 0], [-4, -4], [4, -4]]) box(1.6, 0.05, 0.4, x, 3.75, z, 0xfafafa, { e: 0xffffff });   // fluoro panels

  // Public approach: high-contrast door mat, tactile-style cues and a generous centre route.
  // These are visual guidance, NOT an AS1428/NCC access certification.
  box(2.1, 0.018, 0.75, 0, 0.035, 5.15, 0x54595c);
  for(const z of [4.25, 3.95, 3.65])box(2.0,0.012,0.08,0,0.045,z,0xe7ca62);
  for(const x of [-1.5,1.5])box(0.05,0.012,6.6,x,0.037,0.22,0xc6c4b8);
  text('POST OFFICE · SERVICE COUNTER',0,3.25,4.7,'room');
  // Two low queue rails; no counter-crossing shortcut through the secure sort area.
  for(const x of [-2.9,-0.5])for(const z of [-2.9,-1.0]){
    cyl(0.10,0.12,0.06,x,0.04,z,0x90999f,{},12);
    cyl(0.045,0.045,0.92,x,0.49,z,0x697681,{},12);
    blocker(0.20,0.20,x,z);
  }
  for(const z of [-2.9,-1.0])box(2.4,0.045,0.045,-1.7,0.89,z,RED);
  text('Queue here',-1.6,1.9,-1.3);
  // ── counter ──
  solid(8.8, 1.05, 0.9, 0, 0.52, CZ, 0xcfd2d4); box(8.9, 0.06, 1.0, 0, 1.08, CZ, CREAM); box(8.8, 0.5, 0.06, 0, 0.3, CZ + 0.47, RED);
  box(8.8, 0.7, 0.04, 0, 1.55, CZ - 0.25, 0xcfe8ee, { a: 0.35 });                                                  // security screen
  for (const x of [-3, -0.5, 2.0, 4.2]) box(0.05, 0.7, 0.05, x, 1.55, CZ - 0.25, GREY);
  for (const x of [-2.2, 1.0, 3.2]) { box(0.36, 0.2, 0.4, x, 1.2, CZ + 0.1, 0x2d3036); box(0.3, 0.14, 0.02, x, 1.24, CZ + 0.32, 0x8fc4e8, { e: 0x4f94c8 }); }   // POS terminals
  box(0.5, 0.05, 0.4, -1.4, 1.14, CZ + 0.1, GREY); box(0.18, 0.18, 0.18, -1.4, 1.26, CZ + 0.1, 0xe8e8e8);           // parcel scales
  box(0.3, 0.1, 0.22, 0.2, 1.15, CZ + 0.15, YEL); for (let i = 0; i < 8; i++) box(0.04, 0.02, 0.05, -0.1 + i * 0.07, 1.22, CZ + 0.12, [RED, BLUE, 0xffffff, 0x5f9a54][i % 4]);
  box(0.5, 0.35, 0.02, -3.6, 1.35, CZ + 0.4, RED); text('Parcels', -3.6, 1.35, CZ + 0.45);
  text(site.name, 0, 3.5, CZ - 0.4, 'room'); text('Letters · Parcels · Bills', 0, 2.0, CZ - 0.1);

  // Accessible-height writing/presentation shelf in front of the existing high counter.
  box(1.65,0.065,0.48,3.3,0.81,CZ+0.72,CREAM);
  box(1.42,0.35,0.06,3.3,0.61,CZ+0.91,RED);
  text('COLLECT PARCELS',-2.5,2.55,CZ+0.37,'prop');
  text('SEND / PAY',0.6,2.55,CZ+0.37,'prop');
  text('LOWER SHELF',3.4,2.15,CZ+0.37,'prop');
  // Staff-only partitions extend the counter to side walls, leaving the public door clear.
  for(const x of [-5.65,5.65]){
    solid(2.48,1.12,0.14,x,0.56,CZ,0x89949e);
    box(2.43,0.045,0.18,x,1.12,CZ,RED);
  }
  // Label/receipt printers, scales and barcode scanners physically at the point of service.
  for(const x of [-2.5,0.9]){
    box(0.38,0.24,0.4,x,1.25,CZ-0.20,0x42494f);
    box(0.30,0.03,0.11,x,1.39,CZ-0.06,0xf0e6d6);
  }
  box(0.25,0.38,0.12,0.2,1.32,CZ-0.33,0x343d46);
  // ── behind the counter: sorting frames, parcel cage, mail trolley, safe ──
  for (const x of [-4.5, -2.5, 4.5]) { solid(1.8, 1.8, 0.5, x, 0.9, BACK + 0.45, WOODD); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) box(0.24, 0.3, 0.3, x - 0.75 + c * 0.3, 0.3 + r * 0.4, BACK + 0.62, [CREAM, 0xe8d0a8, 0xd8c098][(r + c) % 3]); }
  for (let i = 0; i < 12; i++) box(0.5, 0.25 + (i % 3) * 0.08, 0.4, 1.0 + (i % 4) * 0.55, 0.14 + Math.floor(i / 4) * 0.4, BACK + 0.9, [0xc8a070, 0xd9b888, 0xb89260][i % 3]);  // parcels on shelves
  box(2.6, 1.5, 0.06, 1.8, 0.75, BACK + 0.4, GREY, { a: 0.6 });
  solid(1.0, 0.7, 0.8, -6.0, 0.35, -8.0, 0xe4a830); box(0.9, 0.3, 0.7, -6.0, 0.9, -8.0, 0xc43c32); for (let i = 0; i < 4; i++) cyl(0.05, 0.05, 0.1, -6.3 + i * 0.2, 0.05, -7.5, 0x222222, {}, 8);   // mail trolley and bags
  solid(0.9, 1.0, 0.8, 6.0, 0.5, -9.5, 0x4a5058); box(0.4, 0.4, 0.04, 6.0, 0.7, -9.08, 0xd8c070);               // safe

  // Three discrete back-of-house dispatch functions and paper-based exception handling.
  for(const [x,name,col] of [[-3.5,'LETTERS',BLUE],[0,'PARCELS',RED],[3.45,'HOLD / RETURN',YEL]]){
    box(2.1,0.43,0.075,x,2.75,BACK+0.25,col);
    text(name,x,2.75,BACK+0.38,'prop');
    box(1.72,0.055,0.65,x,1.18,-9.4,GREY);
    for(let j=0;j<3;j++)box(0.43,0.21,0.36,x-0.50+j*0.5,1.32,-9.4,[0xdbb78b,0xe2c9a8,0xb5a58a][j]);
  }
  box(0.48,0.62,0.05,5.7,2.0,-8.1,0xf4f2e8);
  text('STAFF SORTING / DISPATCH',2.8,3.45,-7.6,'prop');
  for(const y of [0.38,0.83,1.28])box(1.38,0.055,0.5,-5.9,y,-10.3,0x737e88);
  // ── PO boxes on the left wall ──
  solid(0.5, 2.4, 6.0, -EDGE + 0.4, 1.2, -1.0, 0xaeb5ba);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) { box(0.04, 0.2, 0.4, -EDGE + 0.62, 0.35 + r * 0.26, -3.7 + c * 0.45, 0xc9ced2); box(0.02, 0.05, 0.05, -EDGE + 0.65, 0.4 + r * 0.26, -3.55 + c * 0.45, YEL); }
  text('PO Boxes', -EDGE + 0.8, 2.75, -1.0);
  // ── letter slot box, packing bench, stationery rack, noticeboard ──
  solid(0.7, 1.2, 0.7, 5.8, 0.6, 5.1, RED); box(0.5, 0.05, 0.04, 5.8, 1.0, 4.74, 0x1a1a1a); box(0.5, 0.06, 0.4, 5.8, 1.22, 5.1, 0x9a2a22);
  solid(2.4, 0.9, 0.8, 5.0, 0.45, -0.4, WOODD); box(2.5, 0.05, 0.9, 5.0, 0.92, -0.4, 0xd9c8a8);
  cyl(0.1, 0.1, 0.06, 4.4, 1.0, -0.4, 0xc8a070, {}, 14); for (let i = 0; i < 4; i++) box(0.3, 0.02, 0.22, 5.2 + (i % 2) * 0.4, 0.97 + Math.floor(i / 2) * 0.03, -0.35, [CREAM, 0xe8d8b0][i % 2]);
  for (const [x, y] of [[4.0, 0.6], [4.0, 0.2]]) box(0.5, 0.35, 0.3, x, y + 0.1, -0.4 - 0.2, 0x3a3f44, { e: 0x000000 });
  solid(0.4, 1.6, 1.2, 6.45, 0.8, 2.8, 0x7a5a3a); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) box(0.08, 0.2, 0.18, 6.22, 0.5 + i * 0.35, 2.4 + j * 0.28, [RED, BLUE, 0xe8c040, 0x5f9a54][(i + j) % 4]);
  model('pictureframe_large_A', -2.0, 5.78, Math.PI, { h: 0.8 }, 2.0);
  box(2.4, 1.2, 0.06, 3.0, 2.4, 5.8, 0xc8a878); text('Postal rates · Lodge by 4pm', 3.0, 2.4, 5.7);

  // These are truthful informational interactions; no imaginary paid parcel transaction.
  add('queue','Customer queue','info','Use the marked queue; service is provided by an on-duty counter worker.',-1.7,-2.0);
  add('collection','Parcel collection','info','Collect items from a staffed service window; parcel sorting and dispatch areas are staff only.',-2.9,-4.2);
  add('lower-counter','Lower service shelf','info','Lower-height parcel presentation and form-writing shelf. This fictional fitout has not been independently accessibility-certified.',3.25,-4.25);
  add('postage','Postage guide','info','Select packing and postage service before handing an item to the counter; this game does not quote current postal rates.',2.7,2.0);
  add('letterbox','Street letter box','info','Prepaid stamped letters can be posted in the red street box; check the local clearance label.',4.7,3.85);
  add('tracking','Delivery enquiry','info','Staff can assist with a parcel enquiry. There is no live Australia Post tracking connection in this game.',1.0,-4.2);
  add('counter', 'Postal counter', 'civic-ledger', 'Post a parcel, pay a bill or open the Town Ledger. Parcels are collected from doorsteps at seven each evening.', POST_LAYOUT.staffUse.x, POST_LAYOUT.staffUse.z);
  add('boxes', 'PO boxes', 'info', 'Rows of locked boxes for farms and businesses without a street address. The postie sorts the morning mail into them.', -3.6, -1.0);
  add('parcels', 'Parcel shelves', 'info', 'Parcels wait here until collected. The post office keeps twelve in stock and the posties carry them out round the town.', -2.2, -4.3);
  add('packing', 'Packing bench', 'info', 'Boxes, tape and padded bags for sending something. The slot box by the door is cleared twice a day.', 3.4, -0.4);
  return k.finish({ staff: { pos: POST_LAYOUT.staff, use: POST_LAYOUT.staffUse }, postLayout: POST_LAYOUT });
}
