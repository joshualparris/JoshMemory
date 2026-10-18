// Interaction behaviours. Each returns panel content {title, body, actions}
// and may mutate per-exhibit state (counter, step, quiz answer).
// `ctx.activate(key)` turns on the exhibit's animation; `ctx.toggle(key)` flips it.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const state = new Map();
let audio = null;

function tone(notes) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audio.currentTime;
    notes.forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = f; o.type = 'triangle';
      g.gain.setValueAtTime(0.0001, t0 + i * 0.22); g.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.22 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.22 + 0.4);
      o.connect(g).connect(audio.destination); o.start(t0 + i * 0.22); o.stop(t0 + i * 0.22 + 0.45);
    });
    return true;
  } catch { return false; }
}

const linkButton = (url, text = 'Open ↗') => (url ? [{ label: text, url }] : []);

export const BEHAVIOURS = {
  info: (x) => ({ title: x.act.title || x.label, body: `<p>${esc(x.act.text)}</p>`, actions: linkButton(x.act.url) }),
  link: (x) => ({ title: x.act.title || x.label, body: `<p>${esc(x.act.text)}</p>`, actions: linkButton(x.act.url, x.act.button || 'Open ↗') }),
  toggle: (x, ctx) => {
    const on = ctx.toggle(x.key);
    return { title: x.act.title || x.label, body: `<p>${esc(on ? x.act.on || x.act.text : x.act.off || 'Switched off.')}</p>`, actions: linkButton(x.act.url) };
  },
  play: (x) => {
    const ok = tone(x.act.notes || [262, 330, 392, 523]);
    return { title: x.act.title || x.label, body: `<p>${esc(x.act.text)}</p>${ok ? '' : '<p><em>Audio is unavailable in this browser.</em></p>'}`, actions: linkButton(x.act.url) };
  },
  dice: (x) => {
    const sides = x.act.sides || 20;
    const roll = 1 + Math.floor(Math.random() * sides);
    const s = state.get(x.key) || []; s.unshift(roll); state.set(x.key, s.slice(0, 5));
    return { title: x.act.title || x.label, body: `<p class="big">🎲 d${sides}: <strong data-result="${roll}">${roll}</strong></p><p>${esc(x.act.text)}</p><p class="dim">Recent: ${s.slice(0, 5).join(', ')}</p>`, actions: linkButton(x.act.url) };
  },
  count: (x) => {
    const n = (state.get(x.key) || 0) + 1; state.set(x.key, n);
    return { title: x.act.title || x.label, body: `<p class="big">${esc(x.act.unit || 'Count')}: <strong data-result="${n}">${n}</strong></p><p>${esc(x.act.text)}</p>`, actions: linkButton(x.act.url) };
  },
  steps: (x) => {
    const list = x.act.steps || [];
    const i = state.has(x.key) ? (state.get(x.key) + 1) % list.length : 0; state.set(x.key, i);
    return { title: `${x.act.title || x.label} · ${i + 1}/${list.length}`, body: `<p data-result="${i}">${esc(list[i])}</p><p class="dim">Use again for the next step.</p>`, actions: linkButton(x.act.url) };
  },
  quiz: (x) => ({
    title: x.act.title || x.label,
    body: `<p>${esc(x.act.q)}</p>`,
    actions: (x.act.options || []).map((o, i) => ({ label: o, answer: i })),
    onAnswer: (i) => ({ title: x.act.title || x.label, body: `<p class="big">${i === x.act.answer ? '✅ Correct.' : '❌ Not quite.'}</p><p>${esc(x.act.explain || '')}</p>`, actions: linkButton(x.act.url), result: i === x.act.answer }),
  }),
};

export const BEHAVIOUR_NAMES = Object.keys(BEHAVIOURS);

export function runInteraction(x, ctx) {
  const fn = BEHAVIOURS[x.act.do];
  if (!fn) throw new Error('Unknown interaction ' + x.act.do);
  if (x.act.do !== 'toggle') ctx.activate(x.key);
  return fn(x, ctx);
}

export { esc };
