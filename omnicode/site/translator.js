'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const items = [];
  let selected = -1, active = false, controller = null, start = 0;
  const state = $('translation-status');
  const runButton = $('translate-run');
  const stopButton = $('translate-stop');
  function fileDownload(name, type, content) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const safeText = (id, value) => { $(id).textContent = value; };
  function selectStage(index) {
    if (!items[index]) return;
    selected = index;
    const stage = items[index];
    for (const button of $('language-stream').querySelectorAll('[data-index]')) {
      button.classList.toggle('selected', Number(button.dataset.index) === index);
      button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index));
    }
    safeText('selected-language', String(stage.index).padStart(2, '0') + ' / 50  ·  ' + stage.language.toUpperCase());
    safeText('selected-file', stage.filename);
    const proof = stage.status === 'executed';
    safeText('selected-proof', proof ? 'EXECUTED ✓' : 'SOURCE ONLY');
    $('selected-proof').className = proof ? 'proof-green' : 'proof-amber';
    safeText('selected-code', stage.source);
    safeText('editor-line-numbers', stage.source.split('\n').map((_, i) => i + 1).join('\n'));
    safeText('selected-exec-badge', proof ? '✓ VERIFIED OUTPUT' : 'NOT EXECUTED');
    $('selected-exec-badge').className = proof ? 'proof-green' : 'proof-amber';
    safeText('selected-expected', stage.expectedOutput);
    safeText('selected-actual', proof ? stage.actualOutput : 'Not measured');
    safeText('selected-explanation', proof
      ? `${stage.language} ran on the server (${(stage.durationMs || 0).toFixed(3)} ms) and its actual output matched the canonical specification. ${stage.proof === 'befunge-subset' ? 'Only a limited straight-line Befunge interpreter is implemented.' : ''}`
      : `The ${stage.language} code was generated from the canonical specification. No ${stage.language} compiler or runtime was invoked, so its output is a prediction, not a verified result.`);
    $('copy-source').disabled = false;
    $('download-source').disabled = false;
  }
  function addStage(stage) {
    items.push(stage);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-row' + (stage.status === 'executed' ? ' executed' : '');
    button.dataset.index = String(items.length - 1);
    button.setAttribute('aria-label', `${stage.index}: ${stage.language}, ${stage.status}`);
    const number = document.createElement('span'); number.className = 'language-row-number'; number.textContent = String(stage.index).padStart(2, '0');
    const name = document.createElement('span'); name.className = 'language-row-name'; name.textContent = stage.language;
    const ext = document.createElement('span'); ext.className = 'language-row-ext'; ext.textContent = '.' + stage.extension;
    const status = document.createElement('span'); status.className = 'language-row-status'; status.textContent = stage.status === 'executed' ? '✓ RAN' : '→ CODE';
    button.append(number, name, ext, status);
    button.addEventListener('click', () => selectStage(items.indexOf(stage)));
    $('language-stream').append(button);
    if (selected === -1 || selected === items.length - 2) selectStage(items.length - 1);
    safeText('translation-count', `${items.length} / 50 translated`);
    safeText('translation-proof', `${items.filter(x => x.status === 'executed').length} executed`);
    safeText('translation-rail-label', `${items.length} / 50`);
    $('translation-progress').setAttribute('aria-valuenow', String(items.length));
    $('translation-bar').style.width = `${items.length * 2}%`;
    $('language-stream').scrollTop = $('language-stream').scrollHeight;
  }
  function reset() {
    items.length = 0; selected = -1;
    $('language-stream').replaceChildren();
    safeText('translation-count', '0 / 50 translated');
    safeText('translation-proof', '0 executed');
    safeText('translation-rail-label', 'STREAM STARTING');
    $('translation-progress').setAttribute('aria-valuenow', '0');
    $('translation-bar').style.width = '0%';
    safeText('selected-code', '// Translating…');
    safeText('editor-line-numbers', '1');
    safeText('selected-file', 'omni_stage.*');
    safeText('selected-language', 'GENERATING SOURCE');
    safeText('selected-proof', 'WAITING');
    safeText('selected-expected', '—');
    safeText('selected-actual', '—');
    $('copy-source').disabled = $('download-source').disabled = $('export-translations').disabled = true;
  }
  async function run(event) {
    if (event) event.preventDefault();
    if (active) return;
    const value = $('translation-input').value.trim();
    if (!/^[a-zA-Z0-9._@+\-]{1,70}$/.test(value)) {
      state.textContent = 'Invalid demo input. Use 1–70 ASCII letters, digits or . _ @ + -'; return;
    }
    reset(); active = true; controller = new AbortController(); start = performance.now();
    runButton.disabled = true; stopButton.disabled = false;
    state.textContent = 'Connecting to the source generator…';
    try {
      const response = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }), signal: controller.signal, cache: 'no-store'
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'API unavailable' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      if (!response.body) throw new Error('This browser does not support streaming responses');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', doneEvent = false;
      async function parseLine(line) {
        if (!line.trim()) return;
        const part = JSON.parse(line);
        if (part.type === 'start') state.textContent = 'Live — translating languages on the server…';
        if (part.type === 'stage') addStage(part);
        if (part.type === 'done') doneEvent = true;
        safeText('translation-elapsed', ((performance.now() - start) / 1000).toFixed(1) + ' s elapsed');
      }
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        let newline;
        while ((newline = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
          await parseLine(line);
        }
      }
      if (buffer.trim()) await parseLine(buffer);
      if (!doneEvent || items.length !== 50) throw Error('Incomplete stream: only ' + items.length + ' of 50 languages received');
      state.textContent = 'Finished — 50 sources generated; 3 program outputs verified.';
      $('export-translations').disabled = false;
    } catch (error) {
      state.textContent = error.name === 'AbortError' ? `Stopped after ${items.length} translations` : 'Translation failed: ' + error.message;
    } finally {
      active = false; runButton.disabled = false; stopButton.disabled = true;
      safeText('translation-elapsed', ((performance.now() - start) / 1000).toFixed(1) + ' s total');
    }
  }
  $('translation-form').addEventListener('submit', run);
  stopButton.addEventListener('click', () => controller?.abort());
  $('copy-source').addEventListener('click', async () => {
    if (selected < 0) return;
    try { await navigator.clipboard.writeText(items[selected].source); $('copy-source').textContent = 'Copied ✓'; }
    catch { $('copy-source').textContent = 'Copy blocked'; }
    setTimeout(() => { $('copy-source').textContent = 'Copy code'; }, 1200);
  });
  $('download-source').addEventListener('click', () => { if (selected >= 0) fileDownload(items[selected].filename, 'text/plain', items[selected].source); });
  $('export-translations').addEventListener('click', () => { if (items.length === 50) fileDownload('omnicode-50-targets.json', 'application/json', JSON.stringify({ spec: 'EMIT(value)', generated: items }, null, 2)); });
  // An actual request starts shortly after the DOM is ready so the live lab is
  // visible without having to hunt for a second button.
  setTimeout(run, 800);
})();
