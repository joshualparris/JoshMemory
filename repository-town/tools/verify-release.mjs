// Compare all deployed file bytes with the approved release before retiring a host.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]||'dist/public');
const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8'));
const files={};
for(const name of Object.keys(release.files)) {
  const file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep))throw Error('Invalid release path');
  const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(sha!==release.files[name])throw Error('Release file changed: '+name);
  files[name]=sha;
}
if(crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex')!==release.contentHash)throw Error('Release fingerprint mismatch');
console.log(`Verified ${Object.keys(files).length} files for source ${release.sourceCommit}`);
