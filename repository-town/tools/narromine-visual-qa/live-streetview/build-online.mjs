#!/usr/bin/env node
// Publishes the existing, separately maintained comparison page alongside the
// local compiled game in a DEDICATED comparison deployment. Never touches
// production Repository Town's normal build command or checked-in game assets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { presetData } from './presets.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const TOWN = path.resolve(DIR, '../../..');

export function buildOnline({ publicRoot = path.join(TOWN, 'dist/public') } = {}) {
  if (!fs.existsSync(path.join(publicRoot, 'index.html'))) {
    throw new Error('dist/public/index.html is required. Run node tools/build.mjs first.');
  }
  const out = path.join(publicRoot, '_streetview');
  const apiDir = path.join(out, 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  for (const file of ['index.html', 'app.js', 'styles.css']) {
    fs.copyFileSync(path.join(DIR, file), path.join(out, file));
  }
  const presets = presetData();
  if (!Array.isArray(presets.presets) || presets.presets.length !== 6) {
    throw new Error('Expected six real Narromine landmark camera presets');
  }
  fs.writeFileSync(path.join(apiDir, 'presets.json'), JSON.stringify(presets, null, 2) + '\n');
  // This public bundle contains only the standalone UI, the user's normal
  // public game, and publicly sourced camera metadata; NEVER include keys.
  for (const file of ['index.html', 'app.js', 'styles.css', 'api/presets.json']) {
    const contents=fs.readFileSync(path.join(out, file), 'utf8');
    if (/AIza[0-9A-Za-z_-]{30,}/.test(contents)) {
      throw new Error('Refusing to deploy Google API credentials in '+file);
    }
  }
  return { out, cameraPresets: presets.presets.length, files: 4 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result=buildOnline();
  console.log('Published online comparison UI to '+result.out+' ('+result.cameraPresets+' landmarks, '+result.files+' files).');
  console.log('No Google credentials or Google imagery in generated comparison files.');
}