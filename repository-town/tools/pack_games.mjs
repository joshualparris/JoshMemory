// Packs every game in data/games.json into games/<id>/ so it plays inside the town,
// online and offline (file://). Reads local clones of the game repositories.
//   node tools/pack_games.mjs [--only id,id] [--sources dir,dir]
//
// Kinds:
//   static  a folder with an index.html. Copied as-is, then made file://-safe:
//           module scripts are bundled inline, local data files are served from an
//           in-page fetch shim, and cross-app network widgets are removed.
//   vite    a Vite project. Built in a scratch copy with base "./", then packed as static.
//   python  a terminal text adventure. Runs in Brython with a replayed input() terminal.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import * as esbuild from 'esbuild';
import { TOWN } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const only = opt('--only')?.split(',');
const SOURCES = (opt('--sources') || process.env.GAME_SOURCES || '/home/user').split(',');
const OUT = path.join(TOWN, 'games');
const manifest = JSON.parse(fs.readFileSync(path.join(TOWN, 'data', 'games.json'), 'utf8'));

// Cross-app widgets (network bar, podcast launchers) need their home site and are not the game.
const WIDGET = /(parris-network|portal-adapter|podcast-launcher|podcast-player|podcast-controls|offline-podcast-launcher)[^"']*/i;
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.vscode', '.idea', '__pycache__', 'coverage', '.next', 'test-results']);
const TEXT_EXT = new Set(['.json', '.txt', '.md', '.csv', '.yaml', '.yml', '.tsv', '.xml', '.svg', '.glsl', '.ink', '.js', '.mjs', '.html']);
const MAX_FILE = 12 * 1024 * 1024, MAX_SHIM = 8 * 1024 * 1024;

function findClone(repo) {
  const [owner, name] = repo.split('/');
  for (const base of SOURCES) {
    for (const cand of [name, `${owner}__${name}`]) {
      for (const entry of fs.existsSync(base) ? fs.readdirSync(base) : []) {
        if (entry.toLowerCase() !== cand.toLowerCase()) continue;
        const dir = path.join(base, entry);
        try {
          const url = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin']).toString().trim().toLowerCase().replace(/\.git$/, '');
          if (url.endsWith(`github.com/${repo}`.toLowerCase())) return dir;
        } catch { /* not a clone */ }
      }
    }
  }
  return null;
}

function copyTree(from, to, filter = () => true) {
  let bytes = 0;
  (function walk(rel) {
    for (const e of fs.readdirSync(path.join(from, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && filter(r, true)) walk(r); continue; }
      if (!e.isFile() || !filter(r, false)) continue;
      const size = fs.statSync(path.join(from, r)).size;
      if (size > MAX_FILE) continue;
      fs.mkdirSync(path.dirname(path.join(to, r)), { recursive: true });
      fs.copyFileSync(path.join(from, r), path.join(to, r));
      bytes += size;
    }
  })('');
  return bytes;
}

// The game runtime (tools/game_runtime.js) goes first in every packed page. It carries the
// game's small text files, because browsers refuse fetch() on file:// pages, and for games
// marked inlineImages, their images as data URIs (file:// images cannot become WebGL textures).
const RUNTIME_SRC = fs.readFileSync(path.join(TOWN, 'tools', 'game_runtime.js'), 'utf8');
const IMAGE_EXT = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
function runtimeFor(dir, { inlineImages = false } = {}) {
  const files = {}, images = {};
  let total = 0, imageTotal = 0;
  (function walk(rel) {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = path.posix.join(rel, e.name);
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(r); continue; }
      const ext = path.extname(e.name).toLowerCase();
      const size = fs.statSync(path.join(dir, r)).size;
      if (inlineImages && IMAGE_EXT[ext] && size <= 2e6 && imageTotal + size <= 16e6) { images[r] = `data:${IMAGE_EXT[ext]};base64,${fs.readFileSync(path.join(dir, r)).toString('base64')}`; imageTotal += size; continue; }
      if (!TEXT_EXT.has(ext) || /\.(js|mjs|html)$/i.test(e.name) && !/(content|data|story|levels?|scenes?|seed)/i.test(r)) continue;
      if (total + size > MAX_SHIM) continue;
      files[r] = fs.readFileSync(path.join(dir, r), 'utf8');
      total += size;
    }
  })('');
  const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `<script>${RUNTIME_SRC.replace('var F = __FILES__;', () => `var F = ${json(files)};`).replace('var IMG = __IMAGES__;', () => `var IMG = ${json(images)};`)}</script>`;
}

// Finds a root-absolute URL inside a folder by dropping leading segments until a file matches.
function locate(dir, url) {
  const parts = url.split('/').filter(Boolean);
  for (let i = 0; i < parts.length; i++) { const rel = parts.slice(i).join('/'); if (fs.existsSync(path.join(dir, rel))) return rel; }
  return null;
}

const escScript = (s) => s.replace(/<\/script/gi, '<\\/script');

async function bundle(entry, dir) {
  const r = await esbuild.build({
    entryPoints: [entry], bundle: true, format: 'esm', write: false, outdir: path.join(os.tmpdir(), 'pack-out'), absWorkingDir: dir, logLevel: 'silent',
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.gif': 'dataurl', '.webp': 'dataurl', '.svg': 'dataurl', '.mp3': 'file', '.ogg': 'file', '.wav': 'file', '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl', '.txt': 'text', '.md': 'text' },
    external: ['http:*', 'https:*'], assetNames: 'packed-assets/[name]-[hash]',
  });
  const js = r.outputFiles.filter((f) => f.path.endsWith('.js')).map((f) => f.text).join('\n');
  const css = r.outputFiles.filter((f) => f.path.endsWith('.css')).map((f) => f.text).join('\n');
  for (const f of r.outputFiles.filter((f) => !/\.(js|css)$/.test(f.path))) { fs.mkdirSync(path.join(dir, 'packed-assets'), { recursive: true }); fs.writeFileSync(path.join(dir, 'packed-assets', path.basename(f.path)), f.contents); }
  return { js, css };
}

// Makes a copied static game folder file://-safe in place.
async function makePlayable(dir, entry = 'index.html', opts = {}) {
  const htmlPath = path.join(dir, entry);
  const htmlDir = path.dirname(htmlPath);
  // Commented-out markup (old <script type="module"> blocks) must not be treated as live.
  let html = fs.readFileSync(htmlPath, 'utf8').replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
  html = html.replace(/<script\b[^>]*\bsrc=["'][^"']*["'][^>]*>\s*<\/script>/gi, (tag) => (WIDGET.test(tag) ? '' : tag));
  // Scripts that use import/export but are loaded as classic scripts (opts.moduleScripts).
  for (const src of opts.moduleScripts || []) html = html.replace(new RegExp(`<script\\s+src=["']${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`), `<script type="module" src="${src}"`);
  html = html.replace(/<link\b[^>]*href=["'][^"']*(parris-network|portal-adapter)[^"']*["'][^>]*>/gi, '');
  // file:// pages have an opaque origin, so CORS-mode (crossorigin) loads of local files fail.
  html = html.replace(/(<(?:link|script)\b[^>]*?)\s+crossorigin(=["'][^"']*["'])?/gi, '$1');
  // Root-absolute paths ("/assets/x.js", "/games/x/a.png") point at a site root that a packed
  // folder does not have: make them relative to the file they actually name here.
  html = html.replace(/\b(src|href)=(["'])(\/(?!\/)[^"']+)\2/gi, (all, attr, q, url) => {
    const rel = locate(dir, url.replace(/[?#].*$/, ''));
    return rel ? `${attr}=${q}${path.relative(htmlDir, path.join(dir, rel)).split(path.sep).join('/')}${url.match(/[?#].*$/)?.[0] || ''}${q}` : all;
  });
  // Module scripts: bundle each into an inline module (imports cannot load from file://).
  const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  let n = 0;
  for (const m of tags) {
    const attrs = m[1];
    if (!/type=["']module["']/i.test(attrs)) continue;
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (src && /^https?:/i.test(src)) continue;
    let entryFile;
    if (src) {
      const clean = src.replace(/[?#].*$/, '');
      entryFile = clean.startsWith('/') ? path.join(dir, locate(dir, clean) || clean) : path.join(htmlDir, clean);
      if (!fs.existsSync(entryFile)) { const alt = path.join(htmlDir, path.basename(clean)); if (fs.existsSync(alt)) entryFile = alt; else { html = html.replace(m[0], ''); continue; } }
    } else {
      if (!/\bimport\b/.test(m[2])) continue;
      entryFile = path.join(htmlDir, `__inline_module_${n++}.mjs`);
      fs.writeFileSync(entryFile, m[2]);
    }
    const { js, css } = await bundle(entryFile, htmlDir);
    html = html.replace(m[0], () => `${css ? `<style>${css}</style>` : ''}<script type="module">${escScript(js)}</script>`);
  }
  for (const f of fs.readdirSync(htmlDir).filter((f) => f.startsWith('__inline_module_'))) fs.rmSync(path.join(htmlDir, f));
  const shim = runtimeFor(htmlDir, opts);
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (h) => h + shim) : shim + html;
  fs.writeFileSync(htmlPath, html);
}

function run(cmd, argv, cwd) {
  execFileSync(cmd, argv, { cwd, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024, env: { ...process.env, CI: '1', PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1', PUPPETEER_SKIP_DOWNLOAD: '1' }, timeout: 15 * 60 * 1000 });
}

async function packVite(g, clone, out) {
  const work = path.join(os.tmpdir(), 'town-game-build', g.id);
  fs.rmSync(work, { recursive: true, force: true });
  copyTree(clone, work);
  const pkgDir = path.join(work, g.pkg || '');
  const lock = fs.existsSync(path.join(pkgDir, 'package-lock.json'));
  const install = (cmd) => run('npm', [cmd, '--no-audit', '--no-fund', '--ignore-scripts', '--loglevel=error'], pkgDir);
  // A lockfile that has drifted from package.json makes `npm ci` refuse; install resolves it.
  try { install(lock ? 'ci' : 'install'); } catch (e) { if (!lock) throw e; install('install'); }
  // Projects whose vite.config sets `root` (client/ apps) build from the package folder so
  // their PostCSS/Tailwind config at the package root still applies.
  const root = g.configRoot ? pkgDir : path.join(work, g.root || g.pkg || '');
  // Path-based routers cannot match a page opened from a folder; hash routing can.
  if (g.hashRouter) {
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); continue; }
        if (!/\.(jsx|tsx|js|ts)$/.test(e.name)) continue;
        const src = fs.readFileSync(p, 'utf8');
        if (!src.includes('BrowserRouter')) continue;
        fs.writeFileSync(p, src.replace(/\bBrowserRouter\b/g, 'HashRouter').replace(/(<HashRouter\b[^>]*?)\s+basename=(\{[^}]*\}|"[^"]*"|'[^']*')/g, '$1'));
      }
    })(path.join(root, 'src'));
  }
  const dist = path.join(work, '__town_dist');
  // Relative base so the build works from any folder; the project's own config still applies.
  run(path.join(pkgDir, 'node_modules', '.bin', 'vite'), ['build', '--base', './', '--outDir', dist, '--emptyOutDir', ...(g.config ? ['--config', path.join(work, g.config)] : [])], root);
  copyTree(dist, out);
  fs.rmSync(work, { recursive: true, force: true });
}

const PY_RUNTIME = path.join(OUT, '_python');
function ensurePythonRuntime() {
  fs.mkdirSync(PY_RUNTIME, { recursive: true });
  const bry = path.join(TOWN, 'node_modules', 'brython');
  for (const f of ['brython.min.js', 'brython_stdlib.js']) fs.copyFileSync(path.join(bry, f), path.join(PY_RUNTIME, f));
  fs.copyFileSync(path.join(TOWN, 'tools', 'python_terminal.html'), path.join(PY_RUNTIME, 'terminal.html'));
}

function packPython(g, clone, out) {
  ensurePythonRuntime();
  const sources = {};
  for (const f of g.files || [g.main]) {
    if (!f) continue;
    const abs = path.join(clone, f);
    if (fs.statSync(abs).isDirectory()) {
      (function walk(rel) { for (const e of fs.readdirSync(path.join(clone, rel), { withFileTypes: true })) { const r = path.posix.join(rel, e.name); if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(r); } else if (r.endsWith('.py')) sources[r] = fs.readFileSync(path.join(clone, r), 'utf8'); } })(f);
    } else sources[f] = fs.readFileSync(abs, 'utf8');
  }
  const data = {};
  for (const d of g.data || []) {
    (function walk(rel) { for (const e of fs.readdirSync(path.join(clone, rel), { withFileTypes: true })) { const r = path.posix.join(rel, e.name); if (e.isDirectory()) walk(r); else if (TEXT_EXT.has(path.extname(r))) data[r] = fs.readFileSync(path.join(clone, r), 'utf8'); } })(d);
  }
  // Brython cannot compile source holding characters outside the BMP (emoji), so they
  // become \U escapes, which mean the same thing inside string literals.
  for (const k of Object.keys(sources)) sources[k] = sources[k].replace(/[\u{10000}-\u{10FFFF}]/gu, (c) => `\\U${c.codePointAt(0).toString(16).padStart(8, '0')}`);
  // Brython mis-compiles __future__ imports; the annotations they defer are hints only.
  for (const k of Object.keys(sources)) sources[k] = sources[k].replace(/^from __future__ import [^\n]*$/gm, '');
  let main = g.main;
  if (g.run) { main = '__town_main__.py'; sources[main] = g.run; }
  const game = { title: g.title, main, module: null, path: g.pythonPath || [], sources, data };
  const tpl = fs.readFileSync(path.join(TOWN, 'tools', 'python_terminal.html'), 'utf8');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), tpl.replace('/*GAME*/null', () => JSON.stringify(game).replace(/</g, '\\u003c')).replace(/RUNTIME\//g, '../_python/'));
}

const results = [];
for (const g of manifest.games) {
  if (only && !only.includes(g.id)) continue;
  const out = path.join(OUT, g.id);
  const t0 = Date.now();
  try {
    const clone = findClone(g.repo);
    if (!clone) throw new Error('no local clone');
    fs.rmSync(out, { recursive: true, force: true });
    if (g.kind === 'static') {
      const src = path.join(clone, g.dir || '');
      copyTree(src, out, (r, isDir) => !(isDir && (g.exclude || []).includes(r)));
      for (const [from, to] of Object.entries(g.extra || {})) copyTree(path.join(clone, from), path.join(out, to));
      await makePlayable(out, g.entry || 'index.html', g);
    } else if (g.kind === 'vite') {
      await packVite(g, clone, out);
      await makePlayable(out, 'index.html', g);
    } else if (g.kind === 'python') packPython(g, clone, out);
    else throw new Error('unknown kind ' + g.kind);
    let size = 0; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else size += fs.statSync(p).size; } })(out);
    results.push(`✓ ${g.id} (${g.kind}) ${(size / 1e6).toFixed(1)} MB ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  } catch (e) {
    fs.rmSync(out, { recursive: true, force: true });
    results.push(`✗ ${g.id} (${g.kind}): ${String(e.stderr || e.message).split('\n').filter(Boolean).slice(-3).join(' | ').slice(0, 400)}`);
  }
  console.log(results[results.length - 1]);
}
console.log(`\n${results.filter((r) => r.startsWith('✓')).length}/${results.length} games packed`);
