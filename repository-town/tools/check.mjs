// Brief validation + uniqueness gate report. Exit code 1 when any brief fails.
import { loadBriefs, loadInventory, validate } from './lib.mjs';

const inventory = loadInventory();
const { errors, report } = validate(loadBriefs(), inventory);
console.log(`Briefs: ${report.briefed}/${inventory.projects.length} · valid: ${report.valid} · exterior styles used: ${report.styles}`);
if (report.worstOverlap.a) console.log(`Most similar prop vocabularies: ${Math.round(report.worstOverlap.score * 100)}% (${report.worstOverlap.a} ↔ ${report.worstOverlap.b})`);
const missing = errors.filter((e) => e.endsWith('missing brief'));
const other = errors.filter((e) => !e.endsWith('missing brief'));
if (other.length) console.log('\nErrors:\n' + other.join('\n'));
if (missing.length) console.log(`\n${missing.length} repositories still need a brief.`);
process.exit(errors.length ? 1 : 0);
