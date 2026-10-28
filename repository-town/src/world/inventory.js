// The player's inventory: equipment (a torch, so far) alongside the goods already carried in the
// player's bag. State lives on life.civic.player so it saves with the game:
//   items: [{ id, type }], equipped: item id or null, torchOn: boolean.
// Pure rules here; ui/inventory-panel.js shows them and main.js draws the torch light.
export const ITEM_TYPES = Object.freeze({
  torch: { name: 'Torch', icon: '🔦', equip: true,
    about: 'A rechargeable LED torch. Equip it, then switch it on (F, or the button here) to light the way at night and in dark rooms.' },
});

const state = (me) => { me.items ??= []; me.equipped ??= null; me.torchOn ??= false; return me; };
export function items(me) { return state(me).items; }
export function hasItem(me, type) { return items(me).some((i) => i.type === type); }
export function addItem(me, type) {
  if (!ITEM_TYPES[type]) throw new Error('Unknown item ' + type);
  const s = state(me);
  // A persisted sequence avoids reusing an identity after dropping an item.
  const used = new Set([...s.items, ...(s.groundItems || [])].map(i => i.id));
  s.itemSequence = Number.isSafeInteger(s.itemSequence) && s.itemSequence >= 0 && s.itemSequence < Number.MAX_SAFE_INTEGER ? s.itemSequence : 0;
  let id; do { id = `${type}:guest:${++s.itemSequence}`; } while (used.has(id));
  s.items.push({ id, type });
  return id;
}
export function equip(me, id) {
  const s = state(me), it = s.items.find((i) => i.id === id);
  if (!it || !ITEM_TYPES[it.type].equip) return `You can't hold that.`;
  s.equipped = id;
  return `You're holding the ${ITEM_TYPES[it.type].name.toLowerCase()}.`;
}
export function unequip(me) { const s = state(me); s.equipped = null; s.torchOn = false; return 'Your hands are free.'; }
export function equippedType(me) { const s = state(me); return s.items.find((i) => i.id === s.equipped)?.type || null; }
export function toggleTorch(me) {
  const s = state(me);
  if (equippedType(s) !== 'torch') return hasItem(s, 'torch') ? 'Equip the torch first (open your bag).' : "You don't have a torch.";
  s.torchOn = !s.torchOn;
  return s.torchOn ? 'Torch on.' : 'Torch off.';
}
export function torchLit(me) { const s = state(me); return s.torchOn && equippedType(s) === 'torch'; }
// Dropping requires a validated world destination; inventory alone must never delete an item.
export function dropItem() { return 'Choose a clear world position before dropping an item.'; }
