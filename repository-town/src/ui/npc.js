// House residents you can talk to. With a Groq API key (kept only in this browser)
// they answer through Groq's chat API; without one, or offline, they answer from
// the house's own facts. Keys are never part of the site or its data files.
import { repoInfo } from './archive.js';

const KEY_STORE = 'repository-town.groq-keys';
const CHAT_STORE = 'repository-town.npc-chats';
const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

export function getKeys() { return read(KEY_STORE, []).filter((k) => /^gsk_\w{20,}$/.test(k)); }
export function setKeys(text) {
  const keys = [...new Set(String(text).split(/[\s,;]+/).filter((k) => /^gsk_\w{20,}$/.test(k)))];
  write(KEY_STORE, keys);
  return keys.length;
}

// "#groq=gsk_a,gsk_b" in the address sets the keys once, then is removed from the address.
export function takeKeysFromHash() {
  const m = location.hash.match(/groq=([^&]+)/);
  if (!m) return 0;
  const n = setKeys(decodeURIComponent(m[1]));
  try { history.replaceState(null, '', location.pathname + location.search); } catch { /* file:// */ }
  return n;
}

let next = 0;
// Tries each key in turn: a rate-limited or rejected key hands over to the next one.
async function groq(messages) {
  const keys = getKeys();
  if (!keys.length) throw Object.assign(new Error('no key'), { code: 'nokey' });
  let last;
  for (const model of MODELS) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[(next + i) % keys.length];
      let res;
      try {
        res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({ model, messages, max_tokens: 260, temperature: 0.8 }),
        });
      } catch (e) { throw Object.assign(new Error('offline'), { code: 'offline' }); }
      if (res.ok) {
        next = (next + i) % keys.length;
        const j = await res.json();
        return j.choices?.[0]?.message?.content?.trim() || '…';
      }
      last = res.status;
      if (res.status === 404 || res.status === 400) break; // model unavailable: try the next model
    }
  }
  throw Object.assign(new Error(`Groq answered ${last}`), { code: last === 401 ? 'badkey' : 'busy' });
}

const NAMES = ['Ada', 'Bram', 'Cleo', 'Dorian', 'Edie', 'Finn', 'Greta', 'Hugo', 'Iris', 'Jasper', 'Kit', 'Lena', 'Milo', 'Nell', 'Otis', 'Pip', 'Quinn', 'Rosa', 'Sol', 'Tess', 'Uma', 'Vic', 'Wren', 'Xavi', 'Yara', 'Zed'];
export function residentName(coordinate) {
  const n = coordinate.charCodeAt(0) - 65 + parseInt(coordinate.slice(1), 10) * 7;
  return NAMES[n % NAMES.length];
}

// Everything the resident knows: the house's own facts, plus the README when readable.
async function factsFor(house) {
  const rooms = house.int.rooms.map((r) => r.name).filter(Boolean);
  const exhibits = house.int.rooms.flatMap((r) => r.props.filter((p) => p[1] && p[2]?.do).map((p) => `${p[1]} (${r.name})`));
  const games = house.int.rooms.flatMap((r) => r.props.filter((p) => p[2]?.do === 'game').map((p) => p[2].title));
  const data = house.repo ? await repoInfo(house.repo).catch(() => null) : null;
  const readme = data?.readme ? data.readme.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').slice(0, 2500) : '';
  return { rooms, exhibits, games, readme, live: (house.links || []).map((l) => l.url) };
}

function systemPrompt(house, name, f) {
  return [
    `You are ${name}, the resident of house ${house.coordinate} on ${house.street} in Repository Town, a walkable 3D town where every house is one of Josh Parris's GitHub repositories.`,
    house.repo ? `Your house is the repository ${house.repo} (${house.kind}). ${house.summary}` : `${house.summary} You may not reveal what the project is.`,
    `Rooms: ${f.rooms.join(', ')}.`,
    `Exhibits visitors can use with the hand button or E: ${f.exhibits.slice(0, 40).join('; ')}.`,
    f.games.length ? `Playable games in this house's arcade: ${f.games.join(', ')}.` : '',
    f.live.length ? `Links: ${f.live.join(', ')}.` : '',
    f.readme ? `The repository README (trimmed):\n${f.readme}` : '',
    'Stay in character as a friendly local. Answer in at most three short sentences, plain text, no markdown. Point visitors to rooms and exhibits by name. Only state facts given here; if you do not know, say so and suggest the README on the bookshelf.',
  ].filter(Boolean).join('\n');
}

// Answers without a model, from the same facts.
function scripted(house, name, f, text) {
  const t = text.toLowerCase();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  if (/^(hi|hello|hey|g'?day|yo)\b/.test(t)) return `G'day, I'm ${name}. Welcome to ${house.name}! Ask me what this place is, what's here, or about the games.`;
  if (/game|play|arcade/.test(t)) return f.games.length ? `Head to the arcade: ${f.games.join(', ')}. Walk up to a cabinet and press Play.` : `No arcade games here, but the dice tray and lucky dip in the Repository Archive are fun.`;
  if (/room|where|explore|see|what.*here/.test(t)) return `This house has ${f.rooms.join(', ')}. Try ${pick(f.exhibits) || 'the exhibits'}.`;
  if (/readme|doc|how/.test(t)) return `The bookshelf in the Repository Archive has the whole README. The card catalogue lists the docs.`;
  if (/link|site|web|live/.test(t)) return f.live.length ? `You can visit it at ${f.live[0]} — the globe in the archive has every link.` : `The globe in the archive will take you to the issues page.`;
  const lines = f.readme.split('\n').map((l) => l.replace(/[#*_`>|-]/g, '').trim()).filter((l) => l.length > 40 && l.length < 220);
  return pick([house.summary, ...(lines.length ? [`From the README: “${pick(lines)}”`] : [])]);
}

const chats = read(CHAT_STORE, {});
const saveChats = () => {
  for (const k of Object.keys(chats)) chats[k] = chats[k].slice(-20);
  write(CHAT_STORE, chats);
};

function render(log, history, name) {
  log.innerHTML = history.map((m) => `<p class="${m.role === 'user' ? 'you' : 'npc'}"><b>${m.role === 'user' ? 'You' : esc(name)}:</b> ${esc(m.content)}</p>`).join('') || `<p class="dim">Say hello to ${esc(name)}.</p>`;
  log.scrollTop = log.scrollHeight;
}

// The behaviour behind every resident: a chat panel mounted into the exhibit panel.
export function npcBehaviour(x, ctx) {
  const house = ctx.house;
  const name = x.act.name || residentName(house.coordinate);
  const id = house.coordinate;
  return {
    title: `${name} · resident of ${house.name}`,
    body: `<div class="chat"><div class="chat-log" aria-live="polite"></div>
      <form class="chat-form"><input class="chat-input" autocomplete="off" placeholder="Talk to ${esc(name)}…" aria-label="Message"><button>Send</button></form>
      <p class="chat-brain dim"></p></div>`,
    wide: true,
    mount(root) {
      const log = root.querySelector('.chat-log'), form = root.querySelector('.chat-form'), input = root.querySelector('.chat-input'), brain = root.querySelector('.chat-brain');
      const history = chats[id] || (chats[id] = []);
      const showBrain = () => {
        const n = getKeys().length;
        brain.innerHTML = n
          ? `Thinking with Groq (${n} key${n > 1 ? 's' : ''} on this device). <a href="#" class="chat-forget">Forget keys</a>`
          : `Simple replies. To let residents really think, paste a Groq API key (kept only on this device): <input class="chat-key" placeholder="gsk_…" aria-label="Groq API key"> <button type="button" class="chat-save">Save</button>`;
        brain.querySelector('.chat-save')?.addEventListener('click', () => { setKeys(brain.querySelector('.chat-key').value); showBrain(); });
        brain.querySelector('.chat-forget')?.addEventListener('click', (e) => { e.preventDefault(); write(KEY_STORE, []); showBrain(); });
      };
      showBrain();
      render(log, history, name);
      let facts = null;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        history.push({ role: 'user', content: text });
        render(log, history, name);
        log.insertAdjacentHTML('beforeend', `<p class="npc dim thinking">${esc(name)} is thinking…</p>`);
        facts = facts || await factsFor(house);
        let reply;
        try {
          reply = await groq([{ role: 'system', content: systemPrompt(house, name, facts) }, ...history.slice(-12)]);
        } catch (err) {
          reply = scripted(house, name, facts, text);
          if (err.code === 'badkey') reply += ' (Groq rejected the saved key.)';
          else if (err.code === 'offline') reply += ' (Offline, so a simple reply.)';
          else if (err.code === 'busy') reply += ' (Groq is busy right now, so a simple reply.)';
        }
        history.push({ role: 'assistant', content: reply });
        saveChats();
        render(log, history, name);
        input.focus({ preventScroll: true });
      });
      setTimeout(() => input.focus({ preventScroll: true }), 50);
    },
  };
}
