// Scans the public build for anything from a private repository: slugs, URLs,
// distinctive names, and every free-text string written in a private brief.
import fs from 'node:fs';
import path from 'node:path';
import { TOWN, loadBriefs, loadInventory, loadRepoData, isDistinctiveName } from './lib.mjs';
import { PROP_TYPES } from '../src/world/props.js';

const dir = path.join(TOWN, process.argv[2] || 'dist/public');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(html|js|json|css|txt|md)$/.test(f)) files.push(p); } })(dir);
const corpus = files.map((f) => [f, fs.readFileSync(f, 'utf8').toLowerCase()]);

const inventory = loadInventory();
const briefs = loadBriefs();
const publicNames = new Set(inventory.projects.filter((p) => p.visibility === 'public').map((p) => p.repo.split('/')[1].toLowerCase()));
// Strings a public brief also uses are already public; prop-type identifiers are engine vocabulary.
const briefStrings = (b) => {
  const out = [b.summary, b.kind, ...(b.links || []).map((l) => l.url)];
  for (const r of b.int.rooms) {
    out.push(r.name);
    for (const pr of r.props) if (Array.isArray(pr)) { out.push(pr[1]); const a = pr[2] || {}; out.push(a.title, a.text, a.on, a.q, a.url, a.explain, ...(a.steps || []), ...(a.options || [])); }
  }
  return out.filter((s) => typeof s === 'string').map((s) => s.trim().toLowerCase());
};
// Public READMEs are already public, so phrases they contain are not leaks.
const repoData = loadRepoData();
const publicArchive = inventory.projects.filter((p) => p.visibility === 'public').map((p) => JSON.stringify(repoData[p.repo] || '')).join('\n').toLowerCase();
const publicText = publicArchive + '\n' + inventory.projects.filter((p) => p.visibility === 'public' && briefs.get(p.repo)).flatMap((p) => briefStrings(briefs.get(p.repo))).join('\n');
const vocabulary = new Set(PROP_TYPES.map((t) => t.toLowerCase()));
const needles = [];
for (const p of inventory.projects.filter((p) => p.visibility === 'private')) {
  const name = p.repo.split('/')[1];
  needles.push({ text: p.repo.toLowerCase(), why: 'repository slug' });
  needles.push({ text: `github.com/${p.repo}`.toLowerCase(), why: 'repository URL' });
  // Bare names are only distinctive when they are not ordinary words or public repo names.
  const distinctive = isDistinctiveName(name, publicNames);
  if (distinctive && !vocabulary.has(name.toLowerCase())) needles.push({ text: name.toLowerCase(), why: 'repository name', word: true });
  const b = briefs.get(p.repo);
  if (!b) continue;
  const strings = briefStrings(b).filter((t) => !publicText.includes(t));
  for (const s of strings) if (s.length >= 14) needles.push({ text: s, why: `private brief text (${p.repo.split('/')[1]})` });
}

const leaks = [];
for (const n of needles) {
  for (const [f, body] of corpus) {
    // Bare names are checked in content files only; engine source uses generic identifiers.
    if (n.word && !/(houses\.json|repo-data\.json|\.html)$/.test(f)) continue;
    // Packed games are copies of public repositories (already published on GitHub): only
    // private slugs and URLs count there, not shared names or phrases.
    if (/[\\/]games[\\/]/.test(f) && !/^repository (slug|URL)/.test(n.why)) continue;
    const bounded = (t) => new RegExp(`${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9_-]|$)`).test(body);
    const hit = n.why.startsWith('repository slug') || n.why.startsWith('repository URL') ? bounded(n.text) : n.word ? new RegExp(`(^|[^a-z0-9])${n.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(body) : body.includes(n.text);
    if (hit) leaks.push(`${path.relative(TOWN, f)}: ${n.why} → "${n.text.slice(0, 60)}"`);
  }
}
console.log(`Scanned ${files.length} files in ${path.relative(TOWN, dir)} for ${needles.length} private markers.`);
if (leaks.length) { console.error(`LEAKS (${leaks.length}):\n` + [...new Set(leaks)].join('\n')); process.exit(1); }
console.log('No private repository data found in the public build.');
