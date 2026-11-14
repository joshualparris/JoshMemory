const stages = [
  { short: 'PY', language: 'Python', action: 'Input validation & normalisation' },
  { short: 'JAVA', language: 'Java', action: 'Extract email domain' },
  { short: 'C', language: 'C', action: 'Calculate FNV-1a checksum' },
  { short: 'PL', language: 'Perl', action: 'Mask the local part' },
  { short: 'PHP', language: 'PHP', action: 'Classify email provider' },
  { short: 'AWK', language: 'AWK', action: 'Parse domain suffix' },
  { short: 'JS', language: 'JavaScript (Node)', action: 'Calculate a demo fingerprint' },
  { short: 'SH', language: 'Bash', action: 'Format trace marker' },
  { short: 'GO', language: 'Go', action: 'Orchestrate + return JSON' },
];
const $ = (sel) => document.querySelector(sel);
function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = String(text);
  return element;
}
function renderArchitecture() {
  for (const [i, stage] of stages.entries()) {
    const card = el('div', 'stage');
    const top = el('div', 'stage-top');
    top.append(el('span', 'language-logo', stage.short), el('span', 'stage-number', String(i + 1).padStart(2, '0') + ' / 09'));
    card.append(top, el('h3', '', stage.language), el('p', '', stage.action));
    $('#stage-grid').append(card);
  }
}
let latestJSON = '';
async function fetchHealth() {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    if (!response.ok) throw Error('health unavailable');
    const status = await response.json();
    $('#runtime-tag').textContent = status.mode === 'polyglot-local' ? 'FULL 9-LANGUAGE RUNTIME' : 'HOSTED NODE.JS DEMO';
  } catch {
    $('#runtime-tag').textContent = 'API UNAVAILABLE';
  }
}
function renderResult(value) {
  const full = value.mode === 'polyglot-local';
  $('#response-summary').replaceChildren();
  const row = el('div', 'result-summary');
  for (const [label, content] of [['STATUS', 'ACCEPTED'], ['EXECUTED', value.languagesExecuted + (value.languagesExecuted === 1 ? ' language' : ' languages')], ['MODE', full ? 'Local polyglot' : 'Hosted Node demo']]) {
    const item = el('div', ''); item.append(el('small', '', label), el('strong', '', content)); row.append(item);
  }
  $('#response-summary').append(row);
  $('#response-json').textContent = latestJSON = JSON.stringify(value, null, 2);
  $('#result-mode').textContent = full ? 'POLYGLOT LOCAL' : 'NODE.JS ONLY';
  $('#trace-label').textContent = full ? '9 EXECUTED STAGES' : '1 EXECUTED STAGE · HOSTED DEMO';
  $('#trace-wrap').hidden = false;
  $('#trace-list').replaceChildren();
  for (const [i, stage] of (value.stages || []).entries()) {
    const item = el('div', 'trace-item');
    const detail = el('div', ''); detail.append(el('b', '', stage.language), el('p', '', stage.action + ' · ' + stage.result));
    item.append(el('span', 'trace-item-number', String(i + 1).padStart(2, '0')), detail); $('#trace-list').append(item);
  }
  $('#copy-json').disabled = false;
}
function setState(state, label, ms) {
  $('#state-led').className = 'state-led ' + state;
  $('#state-text').textContent = label;
  $('#execution-time').textContent = ms == null ? '—' : ms + ' ms';
}
$('#audit-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = $('#email').value.trim();
  if (!email) return;
  $('#run-button').disabled = true;
  setState('', 'Executing transaction…');
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let response;
    try { response = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }), signal: controller.signal }); }
    finally { clearTimeout(timer); }
    const body = await response.json();
    if (!response.ok) throw Error(body.error || 'Audit failed');
    renderResult(body);
    setState('success', 'Transaction completed', Math.round(performance.now() - start));
  } catch (error) {
    $('#response-json').textContent = '// ' + String(error.message || 'Unknown error');
    $('#result-mode').textContent = 'ERROR';
    $('#response-summary').replaceChildren(el('p', 'privacy', 'The transaction did not complete. No result was recorded.'));
    $('#trace-wrap').hidden = true;
    $('#copy-json').disabled = true;
    latestJSON = '';
    setState('error', 'Execution unsuccessful', Math.round(performance.now() - start));
  } finally { $('#run-button').disabled = false; }
});
for (const button of document.querySelectorAll('[data-email]')) button.addEventListener('click', () => { $('#email').value = button.dataset.email; $('#email').focus(); });
$('#copy-json').addEventListener('click', async () => {
  if (!latestJSON) return;
  try { await navigator.clipboard.writeText(latestJSON); $('#copy-json').textContent = 'Copied'; setTimeout(() => $('#copy-json').textContent = 'Copy JSON', 1500); }
  catch { $('#copy-json').textContent = 'Copy blocked'; }
});
renderArchitecture(); fetchHealth();
