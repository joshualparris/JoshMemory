import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../src/ui/loading-screen.js', import.meta.url), 'utf8');
function setup(timing = true) {
  const nodes = new Map(), listeners = {}, frames = new Map(), intervals = new Map();
  let time = 0, nextId = 0, observer;
  function element() {
    return {textContent: '', hidden: false, dataset: {}, children: [], attrs: {}, callbacks: {},
      classList: {add() {}}, append(...children) { this.children.push(...children); },
      setAttribute(key, value) { this.attrs[key] = value; }, removeAttribute(key) { delete this.attrs[key]; },
      addEventListener(key, fn) { this.callbacks[key] = fn; }};
  }
  const document = {getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); }, createElement: element};
  const window = {};
  const location = {href: 'https://example.test/town/', reload() { location.reloaded = true; }};
  const context = {
    window, document, location, URL, performance: {now: () => time}, console,
    setTimeout(fn) { queueMicrotask(fn); return ++nextId; }, clearTimeout() {},
    setInterval(fn) { const id = ++nextId; intervals.set(id, fn); return id; }, clearInterval(id) { intervals.delete(id); },
    requestAnimationFrame(fn) { const id = ++nextId; frames.set(id, fn); queueMicrotask(fn); return id; }, cancelAnimationFrame(id) { frames.delete(id); },
    addEventListener(name, fn) { listeners[name] = fn; },
    PerformanceObserver: timing ? class { constructor(callback) { this.callback = callback; observer = this; } observe() {} disconnect() { this.disconnected = true; } } : undefined,
  };
  vm.runInNewContext(code, context);
  return {api: window.TownLoading, nodes, listeners, location, intervals, observer,
    elapsed(ms) { time += ms; for (const fn of intervals.values()) fn(); },
    resources(entries) { observer.callback({getEntries: () => entries}); }};
}
const s = setup(), api = s.api;
assert.equal(api.snapshot().completed, 0);
s.elapsed(15000);
assert.equal(api.snapshot().completed, 0, 'a long wait never invents progress');
assert.equal(s.nodes.get('loading-slow').hidden, false);
s.resources([{name: 'https://example.test/vendor/engine.js?token=private', encodedBodySize: 2048}]);
assert.equal(api.snapshot().downloads, 1);
assert.equal(api.snapshot().knownBytes, 2048);
assert.equal(s.nodes.get('loading-file').textContent, 'vendor/engine.js', 'never display query strings');
await assert.rejects(api.stage('town'), /out of sequence/);
await assert.rejects(api.finish(), /before its final stage/);
const ids = Array.from(api.snapshot().stages, x => x.id);
for (const [index, id] of ids.slice(1).entries()) {
  s.elapsed(20); await api.stage(id);
  assert.equal(api.snapshot().completed, index + 1);
  assert.equal(s.nodes.get('loading-progress').value, index + 1);
}
api.assets('start', '/models/a.gltf'); api.assets('progress', '/models/a.gltf', 0, 1);
assert.equal(api.snapshot().assets.pending.length, 1, 'onStart/progress does not complete a pending request');
await api.finish();
assert.equal(api.snapshot().completed, 12);
assert.equal(s.nodes.get('loading').hidden, true);
assert.equal(s.nodes.get('loading-background').hidden, false, 'optional downloads never hold up play');
assert.equal(s.intervals.size, 0, 'elapsed ticker stops after startup');
assert.equal(s.observer.disconnected, true);
api.assets('end', '/models/a.gltf'); api.assets('progress', '/models/a.gltf', 1, 1);
assert.equal(s.nodes.get('loading-background').hidden, true);
api.assets('start', '/models/b.gltf'); api.assets('error', '/models/b.gltf');
assert.equal(api.snapshot().assets.failed.length, 1);
assert.match(s.nodes.get('loading-background-text').textContent, /fallback/);
s.nodes.get('loading-background-close').callbacks.click();
api.assets('progress', '/models/b.gltf', 2, 2);
assert.equal(s.nodes.get('loading-background').hidden, true, 'dismiss stays dismissed');
const failure = setup();
await failure.api.stage('data'); failure.api.fail('HTTP 503 loading town data');
await failure.api.finish(); await failure.api.stage('graphics');
assert.equal(failure.api.snapshot().completed, 1);
assert.equal(failure.nodes.get('loading').hidden, false);
assert.equal(failure.nodes.get('loading-retry').hidden, false);
assert.match(failure.nodes.get('loading-error').textContent, /503/);
failure.nodes.get('loading-retry').callbacks.click();
assert.equal(failure.location.reloaded, true);
const moduleFailure = setup();
moduleFailure.listeners.error({target: {tagName: 'SCRIPT', type: 'module', src: 'https://example.test/main.js'}});
assert.equal(moduleFailure.api.snapshot().failed, true, 'module dependency failures visible before main executes');
const noTiming = setup(false); noTiming.elapsed(1000);
assert.match(noTiming.nodes.get('loading-network').textContent, /unavailable/);
const source = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.deepEqual([...source.matchAll(/await loading\?\.stage\('([^']+)'\)/g)].map(x => x[1]), ids.slice(1));
assert.ok(source.indexOf('renderFrame();', source.indexOf("stage('frame')")) < source.indexOf('await loading.finish()'));
const html = fs.readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
assert.ok(html.indexOf('src="ui/loading-screen.js"') < html.indexOf('src="main.js"'));
const loadingCss = fs.readFileSync(new URL('../src/ui/loading-screen.css', import.meta.url), 'utf8');
assert.ok(loadingCss.includes('#loading[hidden] { display: none !important; }'),
  'the overlay must actually hide when the game is ready despite author display rules');
console.log('PASS startup progress: real ordered stages, no timer progress, sanitized resource names, pending/background success/failure, retry, pre-module errors, timing fallback, cleanup and first-frame gate');
