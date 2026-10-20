import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

export function stampRelease(town, output, commit) {
  commit ||= process.env.TOWN_SOURCE_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT;
  commit ||= execFileSync('git', ['rev-parse', 'HEAD'], {cwd: town, encoding: 'utf8'}).trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('A full source commit is required for a release');
  const hosting = JSON.parse(fs.readFileSync(path.join(town, 'deploy/hosting.json'), 'utf8'));
  const files = {};
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && file !== path.join(output,'release.json')) {
        files[path.relative(output, file).split(path.sep).join('/')] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      }
    }
  }
  walk(output);
  const contentHash = crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex');
  // Canonical repository identity is maintainer metadata; the public inventory
  // still classifies that project as private. Publish only the approved host map.
  const {source, ...publicHosting} = hosting;
  const manifest = {schemaVersion: 1, sourceCommit: commit, contentHash, ...publicHosting, files};
  fs.writeFileSync(path.join(output, 'release.json'), JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
