import * as THREE from 'three';
import { CollisionWorld } from './engine/collision.js';
import { Input } from './engine/input.js';
import { Player } from './engine/player.js';
import { loadSave, writeSave, clearSave } from './engine/save.js';
import { buildTown, streetSigns, lotPosition } from './world/town.js';
import { buildInterior } from './world/interior.js';
import { animate } from './world/builder.js';
import { makeLabel, disposeLabel } from './ui/labels.js';
import { runInteraction, esc } from './ui/interactions.js';
import { setArchiveLoader } from './ui/archive.js';
import { mountNPCChat } from './ui/npc-chat.js';
import { placeTownNPCs, placeHouseGuide, animateNPCs } from './world/npcs.js';

const $ = (id) => document.getElementById(id);
const status = (t) => { $('status').textContent = t; };
const fail = (e) => { $('loading').hidden = false; $('loading').classList.add('error'); $('loading-text').textContent = 'Could not start: ' + (e?.message || e); console.error(e); };
addEventListener('error', (e) => fail(e.error || e.message));
addEventListener('unhandledrejection', (e) => fail(e.reason));

const SKY = 0x96c9f0, INDOOR = 0x1a1612;

async function start() {
  // The standalone single-file build embeds the data so it runs from file:// with no server.
  const data = window.__HOUSES__ || await (await fetch('houses.json')).json();
  // Archive contents (READMEs, file lists) are large, so they load on first use.
  let archive = null;
  setArchiveLoader(() => (archive = archive || (window.__REPO_DATA__ ? Promise.resolve(window.__REPO_DATA__) : fetch('repo-data.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})))));
  const houses = data.houses;
  const byCoord = new Map(houses.map((h) => [h.coordinate, h]));

  const touch = matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1 : 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.domElement.id = 'scene';
  document.body.prepend(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); status('Graphics paused by the device. Reload to continue.'); });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  const fog = new THREE.Fog(SKY, 60, 170);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.15, 185);
  const sky = new THREE.Group();
  sky.add(new THREE.HemisphereLight(0xffffff, 0x6e856e, 2.1));
  const sun = new THREE.DirectionalLight(0xffe7bf, 2.0); sun.position.set(-70, 110, 55); sky.add(sun);
  scene.add(sky);

  const town = buildTown(scene, houses, data.streets);
  const streetNPCs = placeTownNPCs(town.group, town.lots, makeLabel);
  streetSigns(town.group, data.streets, makeLabel);
  const half = { x: town.bounds.width / 2, z: town.bounds.depth / 2 };
  const edges = [
    { x0: -half.x - 5, x1: half.x + 5, z0: -half.z - 5, z1: -half.z }, { x0: -half.x - 5, x1: half.x + 5, z0: half.z, z1: half.z + 5 },
    { x0: -half.x - 5, x1: -half.x, z0: -half.z, z1: half.z }, { x0: half.x, x1: half.x + 5, z0: -half.z, z1: half.z },
  ];
  const townWorld = new CollisionWorld([...town.colliders, ...edges]);

  const input = new Input(renderer.domElement, $('touch'));
  const captureButton = $('btn-capture');
  captureButton.hidden = input.touch || typeof renderer.domElement.requestPointerLock !== 'function';
  const syncMouseCapture = (captured) => {
    captureButton.setAttribute('aria-pressed', String(captured));
    captureButton.textContent = captured ? '🔓 Mouse captured (Esc)' : '🎯 Capture mouse';
    captureButton.title = captured ? 'Press Esc or L to release the mouse' : 'Capture the mouse to look without holding the button (L)';
  };
  input.onCaptureChange = (captured) => {
    syncMouseCapture(captured);
    status(captured ? 'Mouse captured — move to look freely. Esc or L releases it.' : 'Mouse released — select Capture mouse or press L to resume.');
  };
  input.onCaptureError = () => status('Browser could not capture the mouse. Try clicking Capture mouse again.');
  captureButton.onclick = () => { captureButton.blur(); input.toggleMouseCapture(); };
  syncMouseCapture(false);
  if (input.touch) $('touch').hidden = false;
  const player = new Player(camera);
  const npcChat = mountNPCChat(document);

  let interactionRequest = 0;
  let mode = 'town', inside = null, world = townWorld, overview = false;
  const active = new Set();
  const visited = new Set();
  const houseLabels = new Map();
  let nearHouse = null, nearThing = null, nearNPC = null, houseGuide = null, panelOpen = null, cardTimer = 0;

  // ── Movement between town and houses ─────────────────────────────────────
  function frontOf(coord) {
    const l = town.lots.get(coord);
    return { x: l.doorPos.x, z: l.doorPos.z + 9, yaw: 0 };
  }
  function travel(coord) {
    if (!town.lots.has(coord)) return false;
    if (mode === 'house') leave(false);
    closePanel(); npcChat.close(); $('npc-roster').hidden = true;
    const f = frontOf(coord);
    player.place(f.x, f.z, f.yaw);
    // Clear any M key queued during a slow frame so search cannot reopen overview.
    input.pressed.delete('map');
    setOverview(false);
    status(`Standing outside ${coord}.`);
    return true;
  }
  function enter(coord) {
    const h = byCoord.get(coord);
    const built = buildInterior(h, makeLabel);
    inside = { house: h, ...built };
    scene.add(built.group);
    town.group.visible = false;
    scene.background.set(INDOOR); scene.fog = null;
    world = new CollisionWorld(built.colliders);
    player.place(built.spawn.x, built.spawn.z, 0);
    houseGuide = placeHouseGuide(inside, makeLabel);
    mode = 'house';
    $('btn-exit').hidden = false;
    visited.add(coord);
    closePanel();
    status(`Inside ${h.coordinate} · ${h.name}. Walk back through the front door to leave.`);
    showCard(h, true);
    cardTimer = 6;
  }
  function leave(placeOutside = true) {
    if (!inside) return;
    closePanel(); npcChat.close(); houseGuide = null;
    const coord = inside.house.coordinate;
    scene.remove(inside.group);
    inside.group.traverse((o) => { if (o.isSprite) disposeLabel(o); else if (o.geometry && o.geometry.type !== 'BoxGeometry') o.geometry.dispose(); });
    inside = null; mode = 'town'; world = townWorld;
    $('btn-exit').hidden = true;
    town.group.visible = true; scene.background.set(SKY); scene.fog = fog;
    if (placeOutside) { const l = town.lots.get(coord); player.place(l.doorPos.x, l.doorPos.z + 4, Math.PI); }
    // Close the door behind the player so the doorway does not re-trigger.
    const d = town.doors.find((d) => d.userData.coordinate === coord); if (d) d.userData.open = 0;
    status(`Back on the street at ${coord}.`);
  }

  // ── Overview (bird's-eye) ────────────────────────────────────────────────
  function setOverview(on) {
    if (on) input.releaseMouse();
    overview = on && mode === 'town';
    $('btn-map').setAttribute('aria-pressed', String(overview));
    scene.fog = overview || mode === 'house' ? null : fog;
    camera.far = overview ? 600 : 185; camera.updateProjectionMatrix();
    if (overview) status('Tap or click a house to travel there.');
  }
  renderer.domElement.addEventListener('click', (e) => {
    if (!overview) return;
    const ndc = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3(); ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit);
    let best = null, bd = 1e9;
    for (const [c, l] of town.lots) { const d = Math.hypot(l.lot.x - hit.x, l.lot.z - hit.z); if (d < bd) { bd = d; best = c; } }
    if (best && bd < 16) travel(best);
  });

  // ── HUD ──────────────────────────────────────────────────────────────────
  const list = $('house-list');
  for (const h of houses) { const o = document.createElement('option'); o.value = `${h.coordinate} · ${h.name}`; list.append(o); }
  $('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('search').value.trim().toLowerCase(); if (!q) return;
    const code = q.split(' ')[0].toUpperCase();
    const h = byCoord.get(code) || houses.find((h) => h.name.toLowerCase() === q) || houses.find((h) => h.name.toLowerCase().includes(q) || `${h.coordinate} · ${h.name}`.toLowerCase() === q);
    if (h) { travel(h.coordinate); $('search').blur(); } else status(`No house matches "${$('search').value}".`);
  });
  $('btn-map').onclick = () => setOverview(!overview);
  $('btn-help').onclick = () => { input.releaseMouse(); $('help').hidden = !$('help').hidden; };
  $('btn-npcs').onclick = () => { $('npc-roster').hidden = !$('npc-roster').hidden; input.reset(); };
  $('npc-roster-close').onclick = () => { $('npc-roster').hidden = true; };
  $('help-close').onclick = () => { $('help').hidden = true; };
  $('btn-exit').onclick = () => { stopGame(); if (mode === 'house') { closePanel(); leave(); save(); status('Exited safely.'); } };
  $('btn-unstuck').onclick = () => { closePanel(); if (mode === 'house' && inside) { leave(); } else { spawn(); } save(); status('Moved to safety. Your progress is preserved.'); };
  $('btn-reset').onclick = () => { clearSave(); if (mode === 'house') leave(false); spawn(); status('Position reset.'); };
  $('panel-close').onclick = () => closePanel();

  function showCard(h, insideNow = false) {
    const links = (h.links || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(' · ');
    $('card').innerHTML = `<h2>${esc(h.coordinate)} · ${esc(h.name)}</h2><p class="kind">${esc(h.kind)} · ${esc(h.street)}</p><p>${esc(h.summary)}</p>${links ? `<p>${links}</p>` : ''}${insideNow ? '' : '<p class="dim">Walk to the door to go inside.</p>'}`;
    $('card').hidden = false;
  }
  function openPanel(content, thing) {
    input.releaseMouse();
    panelOpen = { content, thing };
    $('panel').classList.toggle('wide', !!content.wide);
    $('panel-body').scrollTop = 0; $('panel').scrollTop = 0;
    $('panel-title').textContent = content.title;
    $('panel-body').innerHTML = content.body;
    const actions = $('panel-actions'); actions.innerHTML = '';
    for (const a of content.actions || []) {
      if (a.url) { const el = document.createElement('a'); el.href = a.url; el.target = '_blank'; el.rel = 'noopener'; el.textContent = a.label; el.className = 'btn-link'; actions.append(el); }
      else { const el = document.createElement('button'); el.textContent = a.label; el.onclick = () => (a.play ? startGame(a.play) : openPanel(a.run ? a.run() : content.onAnswer(a.answer), thing));
        if (a.play) el.className = 'play'; actions.append(el); }
    }
    $('panel').hidden = false;
    $('card').hidden = true;
  }
  // Games run full-screen in an iframe from games/<id>/; the town pauses underneath.
  let playing = null;
  function startGame(g) {
    closePanel(); npcChat.close(); $('npc-roster').hidden = true;
    input.reset();
    playing = g;
    if (document.pointerLockElement) document.exitPointerLock();
    $('game-title').textContent = g.title;
    $('game-frame').src = `games/${encodeURIComponent(g.id)}/index.html`;
    $('game').hidden = false;
    document.body.classList.add('playing');
    $('game-frame').focus();
    status(`Playing ${g.title}.`);
  }
  function stopGame() {
    if (!playing) return;
    $('game-frame').src = 'about:blank';
    $('game').hidden = true;
    document.body.classList.remove('playing');
    status(`Back from ${playing.title}.`);
    playing = null;
    input.reset();
    $('game-exit').blur();
  }
  $('game-exit').onclick = () => stopGame();

  function closePanel() { interactionRequest++; input.reset(); panelOpen = null; $('panel').hidden = true; }

  const ctx = {
    activate: (k) => active.add(k),
    toggle: (k) => { if (active.has(k)) { active.delete(k); return false; } active.add(k); return true; },
  };
  // Chooses the exhibit the player is looking at, not merely the closest one,
  // so neighbouring exhibits can each be selected by facing them.
  function pickNear(at = player.pos, fwd = player.forward()) {
    let pick = null, best = Infinity;
    for (const x of inside.interactables) {
      tmp.copy(x.pos).sub(at); tmp.y = 0; const d = tmp.length();
      if (d > 2.6) continue;
      const dot = d < 0.01 ? 1 : tmp.normalize().dot(fwd);
      if (dot < 0.2 && d > 1.2) continue;
      const score = d - 1.6 * dot;
      if (score < best) { best = score; pick = x; }
    }
    return pick;
  }
  function use() {
    if (nearNPC) { input.releaseMouse(); closePanel(); $('npc-roster').hidden=true; npcChat.show(nearNPC.npc, nearNPC.house || null); input.reset(); return; }
    if (mode === 'house' && nearThing) {
      const thing = nearThing, request = ++interactionRequest, house = inside;
      Promise.resolve(runInteraction(thing, ctx)).then((content) => { if (request === interactionRequest && inside === house && mode === 'house') openPanel(content, thing); })
        .catch((e) => { if (request === interactionRequest && inside === house) openPanel({ title: thing.label, body: `<p>Couldn't open this exhibit: ${esc(e.message)}</p>` }, thing); });
      return;
    }
    if (mode === 'town' && nearHouse) showCard(nearHouse.house);
  }

  function pickNPC(list, maxDistance=3.6) {
    const facing=player.forward(); let best=null,score=Infinity;
    for(const x of list) {
      const dx=x.pos.x-player.pos.x,dz=x.pos.z-player.pos.z,d=Math.hypot(dx,dz);
      if(d>maxDistance)continue;
      const dot=d<.1?1:(dx*facing.x+dz*facing.z)/d;
      if(dot<-.2&&d>1.6)continue;
      const rank=d-.6*dot;if(rank<score){score=rank;best=x;}
    }
    return best;
  }

  // ── Persistence ──────────────────────────────────────────────────────────
  function spawn() { player.place(0, lotPosition('M4').z + 16, Math.PI); player.yaw = Math.PI / 2; }
  const saved = loadSave();
  if (saved?.pos) {
    for (const c of saved.visited || []) visited.add(c);
    if (saved.inside && byCoord.has(saved.inside)) { enter(saved.inside); player.place(saved.pos.x, saved.pos.z, saved.yaw); }
    else player.place(saved.pos.x, saved.pos.z, saved.yaw);
    if (world.hits(player.pos.x, player.pos.z, player.radius)) { if (mode === 'house') leave(false); spawn(); }
    status('Welcome back — your position was restored.');
  } else { spawn(); status('Welcome! Walk up to any front door to go inside.'); }
  let saveTimer = 0;
  const save = () => writeSave({ pos: { x: player.pos.x, z: player.pos.z }, yaw: player.yaw, inside: inside?.house.coordinate || null, visited: [...visited] });
  addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  addEventListener('pagehide', save);

  // ── Minimap ──────────────────────────────────────────────────────────────
  const mm = $('minimap'), mctx = mm.getContext('2d');
  function drawMap() {
    const W = mm.width, H = mm.height; mctx.clearRect(0, 0, W, H);
    if (mode === 'house') {
      const b = inside.bounds, s = Math.min((W - 20) / (b.x1 - b.x0), (H - 20) / (b.z1 - b.z0));
      const tx = (x) => 10 + (x - b.x0) * s, tz = (z) => 10 + (z - b.z0) * s;
      mctx.fillStyle = '#c9bfa8';
      for (const r of inside.rooms) mctx.fillRect(tx(r.x0) + 1, tz(r.z0) + 1, (r.x1 - r.x0) * s - 2, (r.z1 - r.z0) * s - 2);
      mctx.fillStyle = '#7fe0ff'; for (const x of inside.interactables) mctx.fillRect(tx(x.pos.x) - 2, tz(x.pos.z) - 2, 4, 4);
      drawArrow(tx(player.pos.x), tz(player.pos.z));
      return;
    }
    const sx = (W - 10) / town.bounds.width, sz = (H - 10) / town.bounds.depth;
    for (const [c, l] of town.lots) { mctx.fillStyle = visited.has(c) ? '#7fe0ff' : `hsl(${l.lot.row * 45},45%,62%)`; mctx.fillRect(5 + (l.lot.x + town.bounds.width / 2) * sx - 3, 5 + (l.lot.z + town.bounds.depth / 2) * sz - 2, 6, 4); }
    drawArrow(5 + (player.pos.x + town.bounds.width / 2) * sx, 5 + (player.pos.z + town.bounds.depth / 2) * sz);
  }
  function drawArrow(x, y) {
    mctx.save(); mctx.translate(x, y); mctx.rotate(-player.yaw); mctx.fillStyle = '#ff5050';
    mctx.beginPath(); mctx.moveTo(0, -6); mctx.lineTo(4, 4); mctx.lineTo(-4, 4); mctx.fill(); mctx.restore();
  }

  // ── Frame loop ───────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let mapTimer = 0, frames = 0, fpsTimer = 0, fps = 0;
  const tmp = new THREE.Vector3();
  function frame() {
    // Up to 0.15 s per frame keeps walking real-time on slow phones; collision subdivides the step.
    const raw = clock.getDelta(), dt = Math.min(raw, 0.15), t = clock.elapsedTime;
    frames++; fpsTimer += raw; if (fpsTimer > 1) { fps = frames / fpsTimer; frames = 0; fpsTimer = 0; }
    // While a game is open the town neither renders nor reacts, so the game gets the whole device.
    if (playing) {
      if (input.consume('back')) stopGame();
      input.takeLook(); for (const k of ['use', 'jump', 'map']) input.consume(k);
      requestAnimationFrame(frame);
      return;
    }
    if (input.consume('map')) setOverview(!overview);
    if (input.consume('back')) { if (npcChat.isOpen()) npcChat.close(); else if (!$('npc-roster').hidden) $('npc-roster').hidden=true; else if (panelOpen) closePanel(); else if (!$('help').hidden) $('help').hidden = true; else setOverview(false); }
    if (overview) {
      camera.position.set(player.pos.x, 150, player.pos.z + 95); camera.lookAt(player.pos.x, 0, player.pos.z);
      input.takeLook(); input.consume('jump');
    } else if (panelOpen || npcChat.isOpen() || !$('npc-roster').hidden || !$('help').hidden) { input.reset(); }
    else player.update(dt, input, world);

    if (mode === 'town') {
      nearNPC=pickNPC(streetNPCs); animateNPCs(streetNPCs,t,player.pos,dt,npcChat.isOpen()?npcChat.active():null);
      nearHouse = null; let best = 6;
      for (const l of town.lots.values()) { const d = Math.hypot(l.doorPos.x - player.pos.x, l.doorPos.z - player.pos.z); if (d < best) { best = d; nearHouse = l; } }
      for (const d of town.doors) {
        const dist = Math.hypot(d.userData.centre.x - player.pos.x, d.userData.centre.z - player.pos.z);
        const residentNearby=streetNPCs.some(n=>n.npc.coordinate===d.userData.coordinate && Math.hypot(n.pos.x-d.userData.centre.x,n.pos.z-d.userData.centre.z)<2.8);
        const target = dist < 3.2 || residentNearby ? 1 : 0; d.userData.open += (target - d.userData.open) * Math.min(1, dt * 5); d.rotation.y = d.userData.open * 1.55;
      }
      for (const z of town.doorZones) {
        if (player.pos.x > z.x0 && player.pos.x < z.x1 && player.pos.z > z.z0 && player.pos.z < z.z1) {
          const d = town.doors.find((d) => d.userData.coordinate === z.coordinate);
          if (d.userData.open > 0.6) { enter(z.coordinate); break; }
        }
      }
      if (nearHouse && $('card').dataset.coord !== nearHouse.house.coordinate) { showCard(nearHouse.house); $('card').dataset.coord = nearHouse.house.coordinate; }
      if (!nearHouse && $('card').dataset.coord) { $('card').hidden = true; delete $('card').dataset.coord; }
      // House name boards are created only near the player to keep GPU memory low on phones.
      for (const [c, l] of town.lots) {
        const d = Math.hypot(l.doorPos.x - player.pos.x, l.doorPos.z - player.pos.z), has = houseLabels.get(c);
        if (d < 55 && !has) { const s = makeLabel(`${c} · ${l.house.name}`, 'house'); s.position.set(l.doorPos.x, 3.4, l.doorPos.z + 1.1); town.group.add(s); houseLabels.set(c, s); }
        else if (d > 70 && has) { town.group.remove(has); disposeLabel(has); houseLabels.delete(c); }
      }
      $('prompt').hidden = (!nearNPC && !nearHouse) || !!panelOpen || npcChat.isOpen() || !$('npc-roster').hidden;
      if (nearNPC) $('prompt').textContent = `${input.touch ? 'Tap ✋' : 'Press E'} — 💬 Talk to ${nearNPC.npc.name}`;
      else if (nearHouse) $('prompt').textContent = `${nearHouse.house.coordinate} · ${nearHouse.house.name} — walk through the door to enter`;
      if (input.consume('use')) use();
    } else {
      for (const d of inside.doors) {
        const dist = Math.hypot(d.userData.centre.x - player.pos.x, d.userData.centre.z - player.pos.z);
        const target = dist < 2.8 ? 1 : 0; d.userData.open += (target - d.userData.open) * Math.min(1, dt * 5); d.rotation.y = d.userData.baseRot + d.userData.open * 1.5;
      }
      const ex = inside.exitZone;
      // Generous exit area: the doorway plus the last 1.3 m inside it, centred on the actual door.
      if (Math.abs(player.pos.x - (ex.x0 + ex.x1) / 2) < 1.55 && player.pos.z > inside.rooms[0].z1 - 1.3 && player.pos.z < ex.z1 + 0.5) leave();
      else {
        nearThing = pickNear();
        nearNPC=houseGuide?pickNPC([houseGuide],2.75):null;
        if(nearNPC && nearThing && Math.hypot(nearNPC.pos.x-player.pos.x,nearNPC.pos.z-player.pos.z)>1.9)nearNPC=null;
        if(houseGuide)animateNPCs([houseGuide],t,player.pos,dt,npcChat.isOpen()?npcChat.active():null);
        $('prompt').hidden = (!nearNPC && !nearThing) || !!panelOpen || npcChat.isOpen() || !$('npc-roster').hidden;
        if (nearNPC) $('prompt').textContent = `${input.touch ? 'Tap ✋' : 'Press E'} — 💬 Talk to ${nearNPC.npc.name}`;
        else if (nearThing) $('prompt').textContent = `${input.touch ? 'Tap ✋' : 'Press E'} — ${nearThing.label}`;
        if (input.consume('use')) use();
        animate(inside.dynamics, t, active);
        if (cardTimer > 0 && (cardTimer -= dt) <= 0) $('card').hidden = true;
        // Labels hide when the player is right on top of them so they never fill the screen.
        for (const s of inside.group.children) if (s.isSprite) s.visible = Math.hypot(s.position.x - player.pos.x, s.position.z - player.pos.z) > (s.userData.labelKind === 'room' ? 2.6 : 1.3);
      }
    }
    if (mode === 'town') input.consume('use');
    mapTimer += dt; if (mapTimer > 0.2) { drawMap(); mapTimer = 0; }
    saveTimer += dt; if (saveTimer > 3) { save(); saveTimer = 0; }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  // Test hook: lets the browser test suite drive real gameplay deterministically.
  window.__town = {
    houses: houses.map((h) => ({ coordinate: h.coordinate, name: h.name })),
    npcs: streetNPCs.map(x => ({id:x.npc.id,name:x.npc.name,coordinate:x.npc.coordinate})),
    npcChat: () => ({open:npcChat.isOpen(),id:npcChat.active()}),
    talkTo: (id) => npcChat.show(id),
    travel,
    state: () => ({
      mode, coordinate: inside?.house.coordinate || null, pos: { x: player.pos.x, z: player.pos.z }, yaw: player.yaw, eye: player.eye, y: player.y, fps,
      rooms: inside?.rooms.length || 0, props: inside?.placedProps.length || 0,
      interactables: inside ? inside.interactables.map((x) => ({ key: x.key, label: x.label, title: x.act.title || x.label, do: x.act.do, room: x.roomName })) : [],
      near: nearThing?.key || null, nearHouse: nearHouse?.house.coordinate || null,
      panel: panelOpen ? { title: $('panel-title').textContent, text: $('panel-body').textContent, links: [...$('panel-actions').querySelectorAll('a')].map((a) => a.href), buttons: [...$('panel-actions').querySelectorAll('button')].map((b) => b.textContent) } : null,
      active: [...active], playing: playing?.id || null, gameSrc: playing ? $('game-frame').getAttribute('src') : null, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    }),
    // Stands the player 1.6 m in front of an exhibit, facing it, so the test then presses Use.
    approach(key) {
      const x = inside?.interactables.find((i) => i.key === key); if (!x) return false;
      const c = new THREE.Vector3((inside.rooms[x.room].x0 + inside.rooms[x.room].x1) / 2, 0, (inside.rooms[x.room].z0 + inside.rooms[x.room].z1) / 2);
      const dir = c.clone().sub(x.pos); dir.y = 0; if (dir.length() < 0.01) dir.set(0, 0, 1); dir.normalize();
      for (const dist of [1.6, 1.9, 1.3, 2.2]) {
        for (const turn of [0, 0.5, -0.5, 1, -1]) {
          const v = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), turn);
          const p = x.pos.clone().addScaledVector(v, dist);
          const yaw = Math.atan2(-(x.pos.x - p.x), -(x.pos.z - p.z));
          const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
          if (!world.hits(p.x, p.z, player.radius + 0.05) && pickNear(p, fwd) === x) { player.place(p.x, p.z, yaw); return true; }
        }
      }
      return false;
    },
    // Stands just inside the entrance facing the exit door.
    toExit() { if (!inside) return false; player.place(inside.spawn.x, inside.spawn.z, Math.PI); return true; },
    place(x, z, yaw) { player.place(x, z, yaw); },
    probe(x, z) { return world.hits(x, z, player.radius); },
    play() { const b = $('panel-actions').querySelector('button.play'); if (b) b.click(); return !!b; },
    stopGame: () => stopGame(),
    answer(i) { const b = $('panel-actions').querySelectorAll('button')[i]; if (b) b.click(); return !!b; },
    closePanel,
  };

  $('loading').hidden = true;
  requestAnimationFrame(frame);
}

start().catch(fail);

