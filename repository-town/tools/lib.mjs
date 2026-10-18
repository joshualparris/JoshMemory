// Shared brief loading, validation and public sanitising for build and checks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { PROPS } from '../src/world/props.js';
import { STYLES, FEATURE_NAMES } from '../src/world/exterior.js';
import { BEHAVIOUR_NAMES } from '../src/ui/interactions.js';
import { buildInterior } from '../src/world/interior.js';
import { Builder } from '../src/world/builder.js';
import { buildExterior } from '../src/world/exterior.js';

export const TOWN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(TOWN, '..');
export const LAYOUTS = ['row', 'deep', 'hub', 'grid', 'L', 'gallery'];

export function loadInventory() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'repository-town.json'), 'utf8'));
}

// In-game Repository Archive data (README, files, docs, live sites) from tools/repo_data.py.
export function loadRepoData() {
  const f = path.join(TOWN, 'data', 'repo-data.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}

export function loadBriefs() {
  const dir = path.join(TOWN, 'briefs');
  const out = new Map();
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    for (const b of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      if (out.has(b.repo)) throw new Error(`${b.repo} briefed twice (${f})`);
      out.set(b.repo, { ...b, _file: f });
    }
  }
  return out;
}

const hex = (v, fallback) => (typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : v ?? fallback);

// Every house ends with the same Repository Archive room: six exhibits that open the
// repository itself. It is generated, so it is excluded from the uniqueness gate.
export function archiveRoom(repo, data, briefLinks) {
  const live = [...(data?.live || []), ...briefLinks.map((l) => l.url).filter((u) => !/github\.com\//.test(u))].filter((u, k, a) => a.indexOf(u) === k);
  const act = (kind, title) => ({ do: kind, title, repo, ...(kind === 'live' ? { urls: live } : {}) });
  return {
    name: 'Repository Archive', archive: true, w: 11, d: 10, floor: 0x6d5a48, walls: 0xd9d2c3,
    props: [
      ['computer', 'Source code', act('source', 'Source code')],
      ['bookshelf', 'README', act('readme', 'README')],
      ['terminal', 'File browser', act('files', 'Files')],
      ['globe', live.length ? 'Live site' : 'Issues', act('live', live.length ? 'Live site' : 'Issues and activity')],
      ['noticeBoard', 'Latest commit', act('commits', 'Latest commit')],
      ['cardCatalog', 'Documentation', act('docs', 'Documentation')],
      ['treasureChest', 'Lucky dip', act('lucky', 'Lucky dip')],
      ['crystal', 'README fortune', act('fortune', 'README fortune')],
      ['diceTable', 'Dice tray', { do: 'dice', title: 'Dice tray', sides: 20, set: true, text: 'Pick any die and roll. Advantage rolls two d20s and keeps the higher.' }],
    ],
  };
}

// Plain furniture that suits play becomes a toy, using the house's own content:
// card decks hold its exhibits, map wheels its rooms, crystal balls its README.
const TOY_TYPES = {
  light: ['lamp', 'lantern', 'torch', 'candles', 'fireplace', 'campfire'],
  music: ['speaker', 'radio', 'vinyl', 'guitar', 'microphone', 'clock'],
  arcade: ['arcadeCabinet', 'pinball'],
  cards: ['cardTable', 'boardGame', 'chessboard'],
  coin: ['coinStack', 'cashRegister', 'safe', 'piggyBank'],
  fortune: ['crystal', 'mirror', 'scrollRack', 'bookStack'],
  wheel: ['mapTable', 'signpost', 'pinMap'],
  dice: ['diceTable', 'trophyCase', 'trophy'],
  tally: ['coffeeMachine', 'waterCooler', 'toyBlocks', 'rockingHorse', 'balloons'],
};
const TOY_OF = Object.fromEntries(Object.entries(TOY_TYPES).flatMap(([k, list]) => list.map((t) => [t, k])));
const MAX_TOYS = 6;
const seeded = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 13), 1597334677)) >>> 0) / 4294967296; };
const SCALE = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659];

function toyAct(type, kind, ctx) {
  const name = PROPS[type].label;
  switch (kind) {
    case 'light': return { do: 'toggle', title: name, on: `The ${name.toLowerCase()} glows warm across ${ctx.room}.`, off: `The ${name.toLowerCase()} goes dark.` };
    case 'music': { const r = seeded(ctx.repo + type); return { do: 'play', title: name, notes: Array.from({ length: 6 }, () => SCALE[Math.floor(r() * SCALE.length)]), text: `A six-note tune written for ${ctx.name}. Every house plays a different one.` }; }
    case 'arcade': return { do: 'arcade', title: name, text: `Insert a coin and play a round of ${ctx.name}: The Game. Beat your best score.` };
    case 'cards': return ctx.labels.length >= 3 ? { do: 'draw', title: name, cards: ctx.labels, text: `A deck made from this house's exhibits. Draw a card to choose where to go next.` } : null;
    case 'coin': return { do: 'coin', title: name, text: `Heads you open the README next, tails you open the file browser.` };
    case 'fortune': return { do: 'fortune', title: name, repo: ctx.repo };
    case 'wheel': return ctx.rooms.length >= 3 ? { do: 'spin', title: name, options: ctx.rooms, text: 'Spin to pick the next room to explore.' } : null;
    case 'dice': return { do: 'dice', title: name, sides: 20, set: true, text: `Roll for ${ctx.name}. Advantage keeps the higher of two d20s.` };
    case 'tally': return { do: 'count', title: name, unit: type === 'coffeeMachine' ? 'Cups poured' : type === 'waterCooler' ? 'Glasses' : 'Played with', text: `Keep coming back — the ${name.toLowerCase()} keeps count.` };
    default: return null;
  }
}

function addToys(rooms, repo, name) {
  const labels = rooms.flatMap((r) => r.props.filter((p) => Array.isArray(p) && p[1]).map((p) => p[1]));
  const roomNames = rooms.map((r) => r.name);
  let n = 0;
  return rooms.map((r) => ({
    ...r,
    props: r.props.map((p) => {
      const [type, label, act] = typeof p === 'string' ? [p] : p;
      const kind = TOY_OF[type];
      if (act?.do || !kind || n >= MAX_TOYS) return p;
      const toy = toyAct(type, kind, { repo, name, room: r.name, labels, rooms: roomNames });
      if (!toy) return p;
      n++;
      return [type, label || PROPS[type].label, { ...(act || {}), ...toy, toy: true }];
    }),
  }));
}

// Games that tools/pack_games.mjs packed into games/<id>/, by repository.
export function loadGames() {
  const f = path.join(TOWN, 'data', 'games.json');
  if (!fs.existsSync(f)) return new Map();
  const byRepo = new Map();
  for (const g of JSON.parse(fs.readFileSync(f, 'utf8')).games) {
    if (!fs.existsSync(path.join(TOWN, 'games', g.id, 'index.html'))) continue;
    if (!byRepo.has(g.repo)) byRepo.set(g.repo, []);
    byRepo.get(g.repo).push(g);
  }
  return byRepo;
}

const PLAY_TEXT = {
  python: 'A text adventure running real Python. Type commands at the prompt; your progress saves automatically.',
  static: 'The real game, running inside Repository Town.',
  vite: 'The real game, built from its repository and running inside Repository Town.',
};

// Houses with playable games get an Arcade: one cabinet per game. Generated like the archive.
export function arcadeRoom(games) {
  const side = Math.min(16, Math.max(8, 6 + games.length * 0.75));
  return {
    name: games.length > 1 ? 'Arcade' : 'Game Room', archive: true, w: side, d: side, floor: 0x2a2440, walls: 0x3b3366,
    props: games.map((g) => ['arcadeCabinet', `▶ ${g.title}`, { do: 'game', title: g.title, game: g.id, text: (g.about || PLAY_TEXT[g.kind]) + (g.online && !g.about ? ' It loads parts from the internet, so it needs a connection.' : ''), c: 0x2b2b6e, a: 0x7fe0ff, at: 'wall' }]),
  };
}

// Converts a brief plus its inventory row into the runtime house shape.
export function toHouse(brief, row, streets, repoData = {}, games = new Map()) {
  const e = brief.ext, i = brief.int;
  const rooms = [...addToys(i.rooms, row.repo, row.repo.split('/')[1]), archiveRoom(row.repo, repoData[row.repo], brief.links || []), ...(games.has(row.repo) ? [arcadeRoom(games.get(row.repo))] : [])];
  return {
    coordinate: row.coordinate,
    repo: row.repo,
    name: row.repo.split('/')[1],
    visibility: row.visibility,
    street: streets[parseInt(row.coordinate.slice(1), 10) - 1],
    kind: brief.kind,
    summary: brief.summary,
    links: [{ label: 'GitHub repository', url: `https://github.com/${row.repo}` }, ...(brief.links || [])],
    ext: { style: e.style, walls: hex(e.walls, 0xd8cfc0), roof: hex(e.roof, 0x7a4a3a), trim: hex(e.trim, 0xf2efe6), door: hex(e.door, 0x6b4a2e), features: e.features || [] },
    int: {
      layout: i.layout, floor: hex(i.floor, 0xb89a74), walls: hex(i.walls, 0xe8e0d0), light: hex(i.light, 0xffe6c0), doors: hex(i.doors, 0x7a5a3c), ceiling: hex(i.ceiling, 0xf2efe8), height: i.height,
      rooms: rooms.map((r) => ({ ...r, floor: r.floor ? hex(r.floor) : undefined, walls: r.walls ? hex(r.walls) : undefined, props: r.props.map((p) => (typeof p === 'string' ? [p] : [p[0], p[1], p[2] ? { ...p[2], c: p[2].c ? hex(p[2].c) : undefined, a: p[2].a ? hex(p[2].a) : undefined } : undefined])) })),
    },
  };
}

// A bare repository name is identifying when it is not an ordinary word or a public repo name.
export function isDistinctiveName(name, publicNames) {
  return name.length >= 4 && (/[A-Z].*[A-Z]|\d|-/.test(name) || name.length >= 9) && !publicNames.has(name.toLowerCase());
}

// Public READMEs can mention private repositories; the public archive redacts them.
export function redactPrivate(text, inventory) {
  const re = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const publicNames = new Set(inventory.projects.filter((p) => p.visibility === 'public').map((p) => p.repo.split('/')[1].toLowerCase()));
  let out = text;
  for (const p of inventory.projects.filter((x) => x.visibility === 'private')) {
    out = out.replace(new RegExp(`(https://)?(www\\.)?(github\\.com/)?${re(p.repo)}(?![A-Za-z0-9_-])`, 'gi'), 'a private repository');
    const name = p.repo.split('/')[1];
    if (isDistinctiveName(name, publicNames)) out = out.replace(new RegExp(`(?<![A-Za-z0-9])${re(name)}(?![A-Za-z0-9])`, 'gi'), 'a private project');
  }
  return out;
}

// Private repositories keep their architecture but lose every identifying string.
export function sanitise(house) {
  if (house.visibility === 'public') return house;
  const generic = 'This exhibit belongs to a private project, so its details are withheld from the public town.';
  return {
    ...house,
    repo: null,
    name: `Private house ${house.coordinate}`,
    kind: 'Private project',
    summary: 'This house belongs to a private repository. Its architecture is real; names and details are withheld from the public town.',
    links: [],
    int: {
      ...house.int,
      rooms: house.int.rooms.map((r, ri) => ({
        ...r,
        name: r.archive ? r.name : `Room ${ri + 1}`,
        props: r.props.map(([type, , act]) => (act?.do
          ? [type, PROPS[type].label, { do: 'toggle', title: PROPS[type].label, on: generic, off: 'Switched off.', at: act.at, c: act.c, a: act.a }]
          : [type, undefined, act?.at ? { at: act.at, c: act.c, a: act.a } : act?.c ? { c: act.c, a: act.a } : undefined])),
      })),
    },
  };
}

const designed = (h) => h.int.rooms.filter((r) => !r.archive);
const propTypes = (h) => designed(h).flatMap((r) => r.props.map((p) => p[0]));
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n); };

// Validates every brief and the uniqueness gate. Returns {errors, report}.
export function validate(briefs, inventory, repoData = loadRepoData(), games = loadGames()) {
  const errors = [];
  const houses = [];
  const err = (repo, msg) => errors.push(`${repo}: ${msg}`);
  for (const row of inventory.projects) {
    const b = briefs.get(row.repo);
    if (!b) { err(row.repo, 'missing brief'); continue; }
    const tag = row.repo;
    if (!b.summary || b.summary.length < 40) err(tag, 'summary shorter than 40 characters');
    if (!Array.isArray(b.evidence) || !b.evidence.length) err(tag, 'no evidence recorded');
    if (!b.kind) err(tag, 'missing kind');
    if (!STYLES[b.ext?.style]) err(tag, `unknown style ${b.ext?.style}`);
    for (const f of b.ext?.features || []) if (!FEATURE_NAMES.includes(f)) err(tag, `unknown feature ${f}`);
    if ((b.ext?.features || []).length < 2) err(tag, 'fewer than 2 exterior features');
    if (!LAYOUTS.includes(b.int?.layout)) err(tag, `unknown layout ${b.int?.layout}`);
    if ((b.int?.rooms || []).length < 2) err(tag, 'fewer than 2 rooms');
    let labelled = 0, acts = 0, total = 0;
    for (const r of b.int?.rooms || []) {
      if (!r.name) err(tag, 'room without a name');
      for (const p of r.props || []) {
        const [type, label, act] = typeof p === 'string' ? [p] : p;
        total++;
        if (!PROPS[type]) err(tag, `unknown prop ${type}`);
        if (label) labelled++;
        if (act?.do) {
          acts++;
          if (!BEHAVIOUR_NAMES.includes(act.do)) err(tag, `unknown interaction ${act.do}`);
          const text = act.text || act.on || act.q || (act.steps || []).join(' ');
          if (!text || text.length < 20) err(tag, `interaction on ${type} has too little content`);
          if (act.url && !/^https:\/\//.test(act.url)) err(tag, `interaction url must be https: ${act.url}`);
          if (act.do === 'quiz' && (!(act.options?.length >= 2) || !(act.answer >= 0 && act.answer < act.options.length))) err(tag, 'quiz needs options and a valid answer');
          if (act.do === 'steps' && !(act.steps?.length >= 2)) err(tag, 'steps needs at least 2 steps');
        }
      }
    }
    if (total < 8) err(tag, `only ${total} props (need ≥ 8)`);
    if (labelled < 4) err(tag, `only ${labelled} repository-specific labels (need ≥ 4)`);
    if (acts < 2) err(tag, `only ${acts} interactions (need ≥ 2)`);
    for (const l of b.links || []) if (!/^https:\/\//.test(l.url)) err(tag, `link must be https: ${l.url}`);
    if (errors.some((e) => e.startsWith(tag + ':'))) continue;
    const house = toHouse(b, row, inventory.grid.streetNames, repoData, games);
    // Dry-run construction catches room adjacency and "no space for prop" failures before the browser.
    try {
      buildInterior(house, () => new THREE.Object3D());
      const bld = new Builder();
      const fp = buildExterior(bld, house.ext, house.ext);
      if (fp.w > 17 || fp.d > 14) err(tag, `exterior ${fp.w}×${fp.d} exceeds lot`);
    } catch (e) { err(tag, `build failed: ${e.message}`); continue; }
    houses.push(house);
  }
  for (const repo of briefs.keys()) if (!inventory.projects.some((p) => p.repo === repo)) err(repo, 'brief has no inventory row');

  // Uniqueness gate: no two houses may share an exterior signature, an interior
  // signature, or a near-identical prop vocabulary.
  const extSig = new Map(), intSig = new Map();
  let worst = { score: 0 };
  for (const h of houses) {
    const e = [h.ext.style, [...h.ext.features].sort().join('+'), h.ext.walls, h.ext.roof].join('|');
    const i = [h.int.layout, designed(h).length, propTypes(h).sort().join('+')].join('|');
    if (extSig.has(e)) err(h.repo, `exterior identical to ${extSig.get(e)}`); else extSig.set(e, h.repo);
    if (intSig.has(i)) err(h.repo, `interior identical to ${intSig.get(i)}`); else intSig.set(i, h.repo);
  }
  for (let a = 0; a < houses.length; a++) for (let b = a + 1; b < houses.length; b++) {
    const s = jaccard(propTypes(houses[a]), propTypes(houses[b]));
    if (s > worst.score) worst = { score: s, a: houses[a].repo, b: houses[b].repo };
    if (s > 0.8) err(houses[a].repo, `prop vocabulary ${Math.round(s * 100)}% identical to ${houses[b].repo}`);
  }
  const styles = new Set(houses.map((h) => h.ext.style)).size;
  return { errors, houses, report: { briefed: briefs.size, valid: houses.length, styles, worstOverlap: worst } };
}
