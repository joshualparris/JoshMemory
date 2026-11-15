'use strict';
const { translateOne, validate, specs } = require('../lib/languages');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-transform');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  let value;
  try { value = validate(req.body?.value); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  // Send a first event immediately, so browsers can prove this is a streamed run.
  res.write(JSON.stringify({ type: 'start', count: specs.length, actualRuntimes: 3,
    note: '50 generated programs; only JS, Brainfuck and a Befunge subset are executed on this host.' }) + '\n');
  for (let i = 0; i < specs.length; i++) {
    if (res.destroyed || res.writableEnded) return;
    const stage = translateOne(value, i); // generated and verified during the stream, not pre-recorded
    res.write(JSON.stringify({ type: 'stage', ...stage }) + '\n');
    await sleep(75);
  }
  res.end(JSON.stringify({ type: 'done', translated: 50, executed: 3, targetExecutionNotAttempted: 47 }) + '\n');
};
