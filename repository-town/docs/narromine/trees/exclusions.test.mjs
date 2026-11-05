// Historical regression metadata only: do not reproduce the unwanted letter.
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertResearchOnly } from './verify.mjs';

test('PR #458 historical correspondence filename is rejected without reading its body', () => {
 assert.throws(() => assertResearchOnly([{name:'COUNCIL_DATA_REQUEST.md'}]), /Excluded correspondence deliverable/);
});
test('renaming the historical deliverable does not evade its status marker', () => {
 assert.throws(() => assertResearchOnly([{name:'APPENDIX.md',content:'Ready-to-send draft'}]), /Excluded correspondence content/);
});
test('nested correspondence deliverable is rejected', () => {
 assert.throws(() => assertResearchOnly([{name:'appendices/council-enquiry-draft.txt'}]), /Excluded correspondence deliverable/);
});
test('source research about Council records is allowed', () => {
 assert.doesNotThrow(() => assertResearchOnly([{name:'SOURCES.md',content:'Council tree policy and GIS records: historical evidence, not individual tree coordinates.'}]));
});
