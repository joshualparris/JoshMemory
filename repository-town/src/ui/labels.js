import * as THREE from 'three';

// Text sprites drawn to canvas. Sizes are tuned per kind so room names read from
// the doorway while prop labels stay small enough not to clutter the view.
const STYLE = {
  house: { font: 'bold 44px system-ui', bg: '#101a2cee', fg: '#ffffff', scale: 0.0075 },
  street: { font: 'bold 40px system-ui', bg: '#1f5135ee', fg: '#ffffff', scale: 0.012 },
  room: { font: 'bold 36px system-ui', bg: '#00000099', fg: '#fff6d8', scale: 0.0062 },
  interactive: { font: 'bold 30px system-ui', bg: '#0f4a6add', fg: '#ffffff', scale: 0.0052 },
  prop: { font: '28px system-ui', bg: '#2a2a2acc', fg: '#f2f2f2', scale: 0.0046 },
};

export function makeLabel(text, kind = 'prop') {
  const st = STYLE[kind] || STYLE.prop;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = st.font;
  const shown = text.length > 48 ? text.slice(0, 47) + '…' : text;
  const w = Math.ceil(ctx.measureText(shown).width) + 36, h = 64;
  c.width = w; c.height = h;
  ctx.font = st.font;
  ctx.fillStyle = st.bg;
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 14); ctx.fill();
  if (kind === 'interactive') { ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.fillStyle = st.fg; ctx.textBaseline = 'middle';
  ctx.fillText(shown, 18, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, depthTest: true }));
  sprite.scale.set(w * st.scale, h * st.scale, 1);
  sprite.userData.text = text;
  return sprite;
}

export function disposeLabel(sprite) {
  sprite.material.map?.dispose();
  sprite.material.dispose();
}
