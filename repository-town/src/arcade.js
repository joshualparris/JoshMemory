import { runInteraction } from './ui/interactions.js';
import { setArchiveLoader } from './ui/archive.js';
const $ = id => document.getElementById(id);
const active = new Set();
const ctx = { activate: k => active.add(k), toggle: k => { if (active.has(k)) { active.delete(k); return false; } active.add(k); return true; } };
let entries = [], tab = 'games', request = 0, opener = null;
let archive;
setArchiveLoader(() => archive ||= fetch('repo-data.json').then(r => { if (!r.ok) throw Error('Archive unavailable'); return r.json(); }));
function renderPanel(content) {
  $('exhibit-title').textContent = content.title;
  $('body').innerHTML = content.body;
  $('actions').replaceChildren();
  for (const action of content.actions || []) {
    const el = document.createElement(action.url ? 'a' : 'button'); el.textContent = action.label;
    if (action.url) { el.href = action.url; el.target = '_blank'; el.rel = 'noopener'; }
    else el.onclick = async () => {
      const token = request;
      try {
        if (action.play) { startGame(action.play); return; }
        const next = await (action.run ? action.run() : content.onAnswer(action.answer));
        if (token === request && $('exhibit').open) renderPanel(next);
      } catch (e) { if (token === request) $('body').textContent = `Could not open this exhibit: ${e.message}`; }
    };
    $('actions').append(el);
  }
}
async function openEntry(entry, button) {
  opener = button;
  if (entry.act.do === 'game') return startGame({ id: entry.act.game, title: entry.act.title });
  const token = ++request;
  $('exhibit-title').textContent = entry.label; $('body').textContent = 'Opening…'; $('actions').replaceChildren(); $('exhibit').showModal();
  try { const content = await runInteraction(entry, ctx); if (token === request && $('exhibit').open) renderPanel(content); }
  catch (e) { if (token === request) $('body').textContent = `Could not open this exhibit: ${e.message}`; }
}
function startGame(game) { request++; $('exhibit').close(); $('game-title').textContent = game.title; $('game-frame').src = `games/${encodeURIComponent(game.id)}/index.html`; $('game').hidden = false; document.body.classList.add('playing'); $('game-exit').focus(); }
function stopGame() { $('game-frame').src = 'about:blank'; $('game').hidden = true; document.body.classList.remove('playing'); opener?.focus(); }
$('game-exit').onclick = stopGame;
$('close-exhibit').onclick = () => $('exhibit').close();
$('exhibit').addEventListener('close', () => { request++; opener?.focus(); });
function render() {
  const q = $('filter').value.trim().toLowerCase();
  const selected = entries.filter(e => (e.act.do === 'game') === (tab === 'games') && `${e.house} ${e.label} ${e.act.title || ''} ${e.act.do}`.toLowerCase().includes(q));
  $('count').textContent = `${selected.length} ${tab === 'games' ? 'games' : 'exhibits'}${q ? ' found' : ' available'}`;
  $('cards').replaceChildren();
  for (const e of selected) {
    const card = document.createElement('article');
    const tag = document.createElement('p'); tag.className = 'tag'; tag.textContent = e.house;
    const title = document.createElement('h2'); title.textContent = e.act.title || e.label;
    const desc = document.createElement('p'); desc.textContent = e.act.do === 'game' ? e.act.text : `${e.roomName} · ${e.act.do}`;
    const button = document.createElement('button'); button.textContent = e.act.do === 'game' ? '▶ Play' : 'Explore'; button.onclick = () => openEntry(e, button);
    card.append(tag, title, desc, button); $('cards').append(card);
  }
}
$('filter').oninput = render;
for (const name of ['games', 'toys']) $(name + '-tab').onclick = () => { tab = name; for (const t of ['games', 'toys']) $(t+'-tab').setAttribute('aria-pressed',String(t === tab)); render(); };
try {
  const response = await fetch('houses.json'); if (!response.ok) throw Error(`HTTP ${response.status}`);
  const { houses } = await response.json();
  entries = houses.flatMap(h => h.int.rooms.flatMap((r, ri) => r.props.flatMap((p, pi) => p[2]?.do ? [{ key: `${h.coordinate}:${ri}:${pi}`, label: p[1], act: p[2], house: `${h.coordinate} · ${h.name}`, roomName: r.name }] : [])));
  render();
} catch (e) { $('count').textContent = `The library could not load: ${e.message}. Please reload to retry.`; }
