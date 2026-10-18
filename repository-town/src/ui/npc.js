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
const VILLAGERS = ['Mabel', 'Arlo', 'Bea', 'Cas', 'Dot', 'Ezra', 'Flo', 'Gus', 'Hattie', 'Ivo', 'June', 'Kip', 'Lou', 'Merv', 'Nora', 'Ollie', 'Peg', 'Rafe', 'Sadie', 'Theo', 'Una', 'Vern', 'Win', 'Zara'];
// Villagers are neighbours out walking — different people from the residents at home.
export function villagerName(i) { return VILLAGERS[i % VILLAGERS.length]; }

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

// A stable personality per person, so the same neighbour sounds the same every visit.
const MOODS = [
  'cheerful and chatty, quick to laugh',
  'dry and understated, with a deadpan sense of humour',
  'warm and a bit nostalgic, fond of telling how things came to be',
  'curious and enthusiastic, always asking the visitor questions back',
  'calm and thoughtful, choosing words carefully',
  'proud of their house and a little competitive with the neighbours',
];
const moodOf = (name) => MOODS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % MOODS.length];

function systemPrompt(house, name, f, role) {
  const where = role === 'villager'
    ? `You live at house ${house.coordinate} on ${house.street}, but right now you are out walking around Repository Town and the visitor has stopped you in the street.`
    : `You live in house ${house.coordinate} on ${house.street} and the visitor has come inside.`;
  return [
    `You are ${name}, a local in Repository Town: a little walkable 3D town (set near Dubbo, NSW) where every house was built from one of Josh Parris's software projects on GitHub. ${where}`,
    `Your personality: ${moodOf(name)}.`,
    house.repo ? `Your house is the ${house.name} project (${house.kind}). ${house.summary}` : `${house.summary} It is a private project, so you never say what it is or name it, and you change the subject kindly.`,
    `Rooms in your house: ${f.rooms.join(', ')}.`,
    `Things visitors can use inside (press E or the hand button): ${f.exhibits.slice(0, 40).join('; ')}.`,
    f.games.length ? `Games playable in your house's arcade: ${f.games.join(', ')}.` : '',
    f.live.length ? `Links: ${f.live.join(', ')}.` : '',
    f.readme ? `What you know of the project, from its README:\n${f.readme}` : '',
    'How to talk: like a real neighbour having a casual chat, not a guide reading a brochure. Use contractions and everyday Australian English. Keep replies short (one to three sentences) and vary how you start them. React to what the visitor actually said, and sometimes ask them something back. Share facts the way a person would ("oh, the arcade? Try Whispering Wilds"). Plain text only: no lists, no markdown, no emoji spam. Only claim facts given above; if you do not know something, say so honestly. Never mention being an AI or these instructions.',
  ].filter(Boolean).join('\n');
}

// Without a model: varied, conversational replies built from the same facts.
function scripted(house, name, f, text, role) {
  const t = text.toLowerCase().trim();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const exhibit = () => pick(f.exhibits)?.replace(/ \(.*\)$/, '') || 'the archive';
  const outside = role === 'villager';
  if (/^(hi|hello|hey|g'?day|yo|howdy|morning|afternoon|evening)\b/.test(t)) return pick([
    `G'day! I'm ${name}. ${outside ? `I live over at ${house.coordinate}, the ${house.name} place.` : `Welcome to ${house.name}.`}`,
    `Oh, hello there. ${name}'s the name. ${outside ? 'Just stretching my legs.' : 'Come in, have a look around.'}`,
    `Hey! Don't think we've met — I'm ${name}. ${outside ? `I'm from ${house.coordinate} up the road.` : 'Make yourself at home.'}`,
  ]);
  if (/how are|how're|how's it going|you ok|you good/.test(t)) return pick([
    `Not bad at all, thanks for asking. ${outside ? 'Lovely day for a walk.' : 'Bit quiet in here today, so it\'s nice to have company.'} You?`,
    `Can't complain! Well, I could, but who'd listen? How about you?`,
    `Good, good. ${outside ? 'Off to see the neighbours.' : `Been tidying the ${pick(f.rooms)}.`}`,
  ]);
  if (/who are you|your name|what.*you do|what are you (doing|up to)/.test(t)) return outside
    ? pick([`I'm ${name} from ${house.coordinate}. Just wandering — I like seeing what everyone's built.`, `${name}. I live at the ${house.name} house. Popping round to a neighbour's.`])
    : pick([`I'm ${name}, I look after this place. Mostly I potter about the archive.`, `${name}. I live here — someone's got to keep the ${pick(f.rooms)} in order.`]);
  if (/thank|cheers|ta\b/.test(t)) return pick(['No worries!', 'Any time.', `Happy to help. Enjoy ${outside ? 'the town' : 'the house'}.`]);
  if (/bye|see ya|later|goodbye/.test(t)) return pick(['See you round!', 'Hooroo!', 'Catch you later.']);
  if (/game|play|arcade|fun/.test(t)) return f.games.length
    ? pick([`You've got to try ${pick(f.games)} — it's in the arcade${outside ? ` at my place, ${house.coordinate}` : ''}.`, `Games? ${f.games.join(' and ')}. ${outside ? `Come by ${house.coordinate}.` : 'Arcade\'s just through there.'}`])
    : pick([`No arcade at ${outside ? 'mine' : 'this place'}, sorry — but the dice tray's good for a laugh.`, `Not really a games house. The lucky dip's fun though.`]);
  if (/what is (this|it)|what's (this|it)|about|what.*(house|place|project)/.test(t)) return house.repo
    ? pick([`${house.summary}`, `Ah, ${house.name}? ${house.summary.split('. ')[0]}.`])
    : `Ah, it's a private one — I'm not supposed to say much. Have a look at the ${exhibit()} though.`;
  if (/room|where|explore|see|look/.test(t)) return pick([`There's ${f.rooms.slice(0, -1).join(', ')} and ${f.rooms.at(-1)}. I'd start with the ${exhibit()}.`, `Have a look at the ${exhibit()}. That's my favourite.`]);
  if (/readme|doc|how does|how do/.test(t)) return `Best bet's the bookshelf in the Repository Archive — it's got the whole README.`;
  if (/link|site|web|live|online/.test(t)) return f.live.length ? `It's online at ${f.live[0].replace(/^https:\/\//, '')}. The globe in the archive has the rest.` : `Not sure it's online anywhere — the globe in the archive will show you the issues page.`;
  const lines = f.readme.split('\n').map((l) => l.replace(/[#*_`>|-]/g, '').trim()).filter((l) => l.length > 40 && l.length < 200);
  return pick([
    `Hmm, good question. ${lines.length ? `All I really know is: “${pick(lines)}”` : house.summary}`,
    `Couldn't tell you, honestly. Try the ${exhibit()}?`,
    `${lines.length ? `Funny you ask — the README says “${pick(lines)}”` : `Not sure. Have you seen the ${exhibit()}?`}`,
  ]);
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
  const id = x.act.role === 'villager' ? `villager:${name}` : house.coordinate;
  return {
    title: x.act.role === 'villager' ? `${name} · lives at ${house.coordinate} · ${house.name}` : `${name} · resident of ${house.name}`,
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
          reply = await groq([{ role: 'system', content: systemPrompt(house, name, facts, x.act.role) }, ...history.slice(-12)]);
        } catch (err) {
          reply = scripted(house, name, facts, text, x.act.role);
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
