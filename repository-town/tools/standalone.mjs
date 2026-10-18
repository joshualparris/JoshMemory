// Bundles a build into one self-contained HTML file that runs offline from file://.
//   node tools/standalone.mjs public|private out.html
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { TOWN } from './lib.mjs';

const target = process.argv[2] || 'public';
const out = path.resolve(process.argv[3] || path.join(TOWN, 'dist', `Repository-Town-${target}.html`));
const dir = path.join(TOWN, 'dist', target);
const esbuild = process.env.ESBUILD || 'esbuild';
const bundle = execFileSync(esbuild, [path.join(dir, 'main.js'), '--bundle', '--format=iife', '--minify', `--alias:three=${path.join(TOWN, 'vendor', 'three.module.min.js')}`, `--alias:three/addons/utils/BufferGeometryUtils.js=${path.join(TOWN, 'vendor', 'BufferGeometryUtils.js')}`], { maxBuffer: 64 * 1024 * 1024 }).toString();
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'styles.css'), 'utf8');
const data = fs.readFileSync(path.join(dir, 'houses.json'), 'utf8');
const archive = fs.readFileSync(path.join(dir, 'repo-data.json'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="styles.css">/, `<style>${css}</style>`)
  .replace(/<script type="importmap">[\s\S]*?<\/script>/, '')
  .replace(/<script type="module" src="main.js"><\/script>/, () => `<script>window.__HOUSES__=${data.replace(/</g, '\\u003c')};window.__REPO_DATA__=${archive.replace(/</g, '\\u003c')};</script>\n<script>${bundle.replace(/<\/script/gi, '<\\/script')}</script>`);
fs.writeFileSync(out, html);
console.log(`${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);
