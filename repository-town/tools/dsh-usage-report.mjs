#!/usr/bin/env node
// Deterministic DeepSeek-harness usage report from the DSH session transcripts.
// Read-only: decompresses ~/.dsh/sessions/**/session.v4.jsonl.zstd and reports per-call token
// usage (uncached input, cache-read input, output), cost at configurable prices, and a
// by-model / by-turn reconciliation. No network, no secrets, no session modification.
//
//   node tools/dsh-usage-report.mjs [--sessions <dir>] [--file <session.v4.jsonl.zstd>]
//        [--price-cached 0.003] [--price-uncached 0.15] [--price-output 0.60] [--peak]
//
// Defaults: sessions dir = <home>/.dsh/sessions; prices = DeepSeek Flash off-peak USD per 1M.
// Exit code 1 if a session's by-model or by-turn totals do not reconcile with its single-pass total.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const PEAK = argv.includes('--peak');
const factor = PEAK ? 2 : 1;
const PRICE = {
  cached: Number(arg('--price-cached', 0.003)) * factor,
  uncached: Number(arg('--price-uncached', 0.15)) * factor,
  output: Number(arg('--price-output', 0.6)) * factor,
};
const fmt = (n) => Math.round(n).toLocaleString('en-AU');
const zero = () => ({ calls: 0, uncached: 0, cached: 0, output: 0 });
const add = (a, b) => ({ calls: a.calls + b.calls, uncached: a.uncached + b.uncached, cached: a.cached + b.cached, output: a.output + b.output });
const tok = (u) => u.cached + u.uncached + u.output;
const cost = (u) => (u.cached / 1e6) * PRICE.cached + (u.uncached / 1e6) * PRICE.uncached + (u.output / 1e6) * PRICE.output;

function analyse(file) {
  const raw = zlib.zstdDecompressSync(fs.readFileSync(file)).toString('utf8');
  const records = raw.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  let current = 'unknown';
  const perModel = new Map(), turns = new Map();
  let total = zero();
  for (const r of records) {
    if (r.type === 'model/selection') {
      const d = r.data || {};
      current = [d.model || d.modelId || d.name, d.reasoningEffort || d.effort || d.thinking].filter(Boolean).join(' / ') || 'unknown';
      continue;
    }
    if (r.type !== 'assistant/message') continue;
    const u = r.data?.usage; if (!u) continue;
    const rec = { calls: 1, uncached: Number(u.inputTokens || 0), cached: Number(u.cacheReadTokens || 0), output: Number(u.outputTokens || 0) };
    total = add(total, rec);
    perModel.set(current, add(perModel.get(current) || zero(), rec));
    turns.set(`turn ${r.data.turn}`, add(turns.get(`turn ${r.data.turn}`) || zero(), rec));
  }
  const sum = (m) => [...m.values()].reduce(add, zero());
  const byModel = sum(perModel), byTurn = sum(turns);
  return { file, total, perModel, turns, byModel, byTurn };
}

function report(s) {
  const { total, perModel, turns, byModel, byTurn } = s;
  const ok = tok(total) === tok(byModel) && tok(total) === tok(byTurn) && Math.abs(cost(total) - cost(byModel)) < 1e-6;
  console.log(`\nSESSION ${s.file.replace(os.homedir(), '~')}`);
  console.log(`  calls ${fmt(total.calls)} | cached ${fmt(total.cached)} (${(100 * total.cached / Math.max(1, total.cached + total.uncached)).toFixed(1)}% of input) | uncached ${fmt(total.uncached)} | output ${fmt(total.output)}`);
  console.log(`  processed ${fmt(tok(total))} | cost $${cost(total).toFixed(6)} (${PEAK ? 'peak' : 'off-peak'})`);
  console.log(`  split cached $${((total.cached / 1e6) * PRICE.cached).toFixed(6)} | uncached $${((total.uncached / 1e6) * PRICE.uncached).toFixed(6)} | output $${((total.output / 1e6) * PRICE.output).toFixed(6)}`);
  console.log(`  reconcile ${ok ? 'OK' : 'MISMATCH'}: tokens total ${fmt(tok(total))} = model ${fmt(tok(byModel))} = turn ${fmt(tok(byTurn))}`);
  const topTurns = [...turns].sort((a, b) => cost(b[1]) - cost(a[1])).slice(0, 4);
  for (const [k, v] of topTurns) console.log(`    ${k}: $${cost(v).toFixed(6)} (${fmt(v.calls)} calls, uncached ${fmt(v.uncached)}, out ${fmt(v.output)})`);
  const topModels = [...perModel].sort((a, b) => cost(b[1]) - cost(a[1]));
  for (const [k, v] of topModels) console.log(`    ${k}: $${cost(v).toFixed(6)} (${fmt(v.calls)} calls)`);
  return ok;
}

let files;
if (arg('--file')) files = [arg('--file')];
else {
  const dir = path.resolve(arg('--sessions', path.join(os.homedir(), '.dsh', 'sessions')));
  if (!fs.existsSync(dir)) { console.error('Sessions dir not found:', dir); process.exit(2); }
  files = fs.readdirSync(dir, { recursive: true })
    .filter((f) => typeof f === 'string' && f.endsWith('session.v4.jsonl.zstd'))
    .map((f) => path.join(dir, f));
}
if (!files.length) { console.error('No session transcripts found.'); process.exit(2); }

let grand = zero(), allOk = true;
for (const f of files) {
  const s = analyse(f);
  allOk = report(s) && allOk;
  grand = add(grand, s.total);
}
console.log(`\nTOTAL ${files.length} session(s): ${fmt(tok(grand))} tokens | cached ${fmt(grand.cached)} (${(100 * grand.cached / Math.max(1, grand.cached + grand.uncached)).toFixed(1)}%) | $${cost(grand).toFixed(6)} (${PEAK ? 'peak' : 'off-peak'})`);
process.exit(allOk ? 0 : 1);
