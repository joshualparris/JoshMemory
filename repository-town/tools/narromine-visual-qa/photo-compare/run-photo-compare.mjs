#!/usr/bin/env node
// Automated runner for the Narromine Real-World Photo Matching & Visual Fidelity System.
// Captures HUD-clean screenshots across the 8 priority Narromine locations, audits
// photo provenance, builds the architectural discrepancy register, and generates the
// interactive comparison workspace HTML report.
import fs from 'node:fs';
import path from 'node:path';
import { runNarromineVisualQa } from '../run.mjs';
import {
  NARROMINE_PHOTO_LOCATIONS,
  REPO_TOWN_ROOT,
  STREET_VIEW_API_PRICING,
} from './geo-sync.mjs';
import { auditPhotoProvenance } from './photo-provenance.mjs';
import { buildPrioritisedFidelityBacklog } from './discrepancy-register.mjs';
import { generatePhotoCompareWorkspaceHtml } from './workspace-report.mjs';

function parseArgs(argv) {
  const args = {
    outDir: path.join(REPO_TOWN_ROOT, 'test-results', 'narromine-photo-compare'),
    locations: null,
    viewports: null,
    times: null,
    sampleFrames: 10,
    build: false,
    embedLocalReferences: true,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out-dir' && argv[i + 1]) args.outDir = path.resolve(argv[++i]);
    else if (a === '--locations' && argv[i + 1]) args.locations = argv[++i];
    else if (a === '--viewports' && argv[i + 1]) args.viewports = argv[++i];
    else if (a === '--times' && argv[i + 1]) args.times = argv[++i];
    else if (a === '--sample-frames' && argv[i + 1]) args.sampleFrames = Number(argv[++i]);
    else if (a === '--build') args.build = true;
    else if (a === '--no-embed') args.embedLocalReferences = false;
  }
  return args;
}

export async function runNarrominePhotoCompare(options = {}) {
  const outDir = path.resolve(
    options.outDir || path.join(REPO_TOWN_ROOT, 'test-results', 'narromine-photo-compare')
  );
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Audit local & external photo provenance without fabricating any missing files
  const provenance = auditPhotoProvenance(REPO_TOWN_ROOT);
  const provenancePath = path.join(outDir, 'photo-provenance.json');
  fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2));

  // 2. Build prioritised architectural discrepancy backlog
  const backlog = buildPrioritisedFidelityBacklog();
  const discrepancyPath = path.join(outDir, 'discrepancy-register.json');
  fs.writeFileSync(discrepancyPath, JSON.stringify(backlog, null, 2));

  // 3. Run HUD-clean WebGL captures across the 8 priority Narromine locations
  const qaResult = await runNarromineVisualQa({
    outDir,
    customLocations: NARROMINE_PHOTO_LOCATIONS,
    locations: options.locations || null,
    viewports: options.viewports || null,
    times: options.times || null,
    sampleFrames: options.sampleFrames || 10,
    hideHud: true,
    build: options.build || false,
    url: options.url || null,
  });

  // 4. Generate the interactive Photo-Matching & Street View Comparison Workspace HTML
  const workspaceHtml = generatePhotoCompareWorkspaceHtml({
    manifest: qaResult.manifest,
    locations: NARROMINE_PHOTO_LOCATIONS,
    provenance,
    backlog,
    outDir,
    liveGameUrl: options.liveGameUrl || '/index.html',
    embedLocalReferences: options.embedLocalReferences !== false,
  });

  const reportPath = path.join(outDir, 'report.html');
  const indexHtmlPath = path.join(outDir, 'index.html');
  fs.writeFileSync(reportPath, workspaceHtml, 'utf8');
  fs.writeFileSync(indexHtmlPath, workspaceHtml, 'utf8');

  return {
    ...qaResult,
    provenance,
    backlog,
    provenancePath,
    discrepancyPath,
    reportPath,
    indexHtmlPath,
    pricing: STREET_VIEW_API_PRICING,
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(new URL(import.meta.url).pathname);

if (isMain) {
  const args = parseArgs(process.argv);
  console.log(
    '[narromine-photo-compare] Capturing HUD-clean views across 8 priority Narromine locations...'
  );
  runNarrominePhotoCompare(args)
    .then((res) => {
      const hp = res.backlog.highestPriorityBuilding;
      console.log('══════════════════════════════════════════════════════════════════════');
      console.log(`Narromine Photo-Matching & Fidelity System Complete — ${res.manifest.summary.passed ? 'PASS' : 'ISSUES'}`);
      console.log(`  Commit SHA:          ${res.manifest.commitSha} (${res.manifest.fullCommitSha})`);
      console.log(`  Captures:            ${res.manifest.summary.passedCaptures}/${res.manifest.summary.totalCaptures} passed (HUD hidden)`);
      console.log(`  Local Photo Audit:   ${res.provenance.summary.verifiedLocalFiles} local CC-BY files, ${res.provenance.summary.verifiedExternalCommonsUrls} Commons URLs, ${res.provenance.summary.missingFromFedoraFilesystem} missing remote session frames`);
      console.log(`  Discrepancies:       ${res.backlog.summaryCounts.totalDiscrepancies} recorded (${res.backlog.summaryCounts.verifiedMismatches} verified, ${res.backlog.summaryCounts.likelyMismatches} likely, ${res.backlog.summaryCounts.insufficientEvidence} insufficient evidence)`);
      console.log(`  Highest Priority:    ${hp ? `${hp.buildingName} (${hp.buildingId} · Impact ${hp.maxVisualImpactScore}/10)` : 'N/A'}`);
      console.log(`  Workspace Report:    ${res.reportPath}`);
      console.log(`  Discrepancy JSON:    ${res.discrepancyPath}`);
      console.log(`  Provenance JSON:     ${res.provenancePath}`);
      console.log('══════════════════════════════════════════════════════════════════════');
    })
    .catch((err) => {
      console.error('[narromine-photo-compare] Fatal error:', err);
      process.exit(1);
    });
}
