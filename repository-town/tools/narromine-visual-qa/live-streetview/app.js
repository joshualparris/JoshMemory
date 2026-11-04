// Local interactive, one-panorama Street View comparison; no Google tile scraping.
// Billing unit: Dynamic Street View panorama instantiation, not panning/zooming.
// USD 14 per 1,000 in first paid tier after 5,000 free monthly SKU events (global).
// The final account invoice may differ due to other usage, pricing tiers, or taxes.
const $ = id => document.getElementById(id);
const RATE_USD = 14 / 1000;
const MONTHLY_FREE_EVENTS = 5000;
const STORAGE_KEY = 'repo-town-narromine-streetview-cost-events-v1';
const MAX_LOCAL_EVENTS = 400;
const RAD = Math.PI / 180;
const state = {
  meta: null, selected: null, panorama: null, loading: false, googleReady: false,
  notes: [], hudHidden: false, events: [], sdkScript: null,
};
try {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(raw)) state.events = raw.filter(x => x && x.timestamp && x.kind).slice(-MAX_LOCAL_EVENTS);
} catch { /* storage optional */ }
function status(message, isError = false) {
  $('status').textContent = message;
  $('status').style.color = isError ? '#ffb5af' : '#cfe7fa';
}
function log(kind, label, potentialUsd = 0, billableEvent = false) {
  const record = {
    timestamp: new Date().toISOString(), kind, label, billableEvent,
    publishedFirstTierUsd: potentialUsd,
    amountActuallyBilledUsd: null,
  };
  state.events.push(record);
  state.events = state.events.slice(-MAX_LOCAL_EVENTS);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events)); }
  catch { /* private mode: current page still shows calls */ }
  renderBilling(record);
}
function renderBilling(latest = null) {
  const panoramaCount = state.events.filter(x => x.billableEvent).length;
  const gross = panoramaCount * RATE_USD;
  $('cost-summary').textContent = 'This browser logged ' + panoramaCount +
    ' panorama instantiation' + (panoramaCount === 1 ? '' : 's') +
    ' · published first-tier gross estimate US$' + gross.toFixed(3);
  $('cost-last').textContent = latest
    ? 'Last operation: ' + latest.kind + ' — ' + latest.label +
      ' · first-tier potential US$' + Number(latest.publishedFirstTierUsd).toFixed(3)
    : 'No API operations in this session yet.';
  const list = $('api-events');
  list.replaceChildren();
  for (const e of state.events.slice(-25).reverse()) {
    const item = document.createElement('li');
    item.textContent = e.timestamp.slice(11, 19) + ' UTC · ' + e.kind + ': ' +
      e.label + ' · potential US$' + Number(e.publishedFirstTierUsd || 0).toFixed(3);
    list.appendChild(item);
  }
  if (!state.events.length) {
    const item = document.createElement('li');
    item.textContent = 'No Google operations recorded.';
    list.appendChild(item);
  }
}
function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
function currentPreset() {
  return state.meta?.presets.find(p => p.id === $('location').value) || state.meta?.presets[0];
}
function browserGame() {
  try { return $('game-frame').contentWindow?.__town || null; }
  catch { return null; }
}
function gamePose(x, z, heading) {
  const town = browserGame();
  if (!town || !Number.isFinite(x) || !Number.isFinite(z)) {
    status('The local game is still loading; try again when Repository Town is ready.', true);
    return false;
  }
  const yaw = -Number(heading || 0) * RAD;
  town.life?.speed?.(0);
  town.place(x, z, yaw);
  town.life?.setTime?.(Number($('time').value));
  $('game-meta').textContent = 'Game (x ' + x.toFixed(1) + ', z ' + z.toFixed(1) +
    ') · looking ' + Number(heading || 0).toFixed(1) + '° · local simulated time';
  return true;
}
function worldToGeo(x, z) {
  const { anchor, offset } = state.meta;
  const cos = Math.cos(anchor.lat * RAD);
  return { lat: anchor.lat - (z - offset.z) / (RAD * 6371008.8),
    lng: anchor.lon + (x - offset.x) / (RAD * 6371008.8 * cos) };
}
function geoToWorld(lat, lng) {
  const { anchor, offset } = state.meta;
  const cos = Math.cos(anchor.lat * RAD);
  return { x: offset.x + (lng - anchor.lon) * RAD * 6371008.8 * cos,
    z: offset.z - (lat - anchor.lat) * RAD * 6371008.8 };
}
function panoramaPosition() {
  if (!state.panorama) return null;
  const pos = state.panorama.getPosition();
  return pos ? { lat: pos.lat(), lng: pos.lng() } : null;
}
function panoramaPov() {
  if (!state.panorama) return null;
  const v = state.panorama.getPov();
  return v ? { heading: v.heading, pitch: v.pitch } : null;
}
function mapsLink() {
  const preset = currentPreset();
  const pos = panoramaPosition() || preset?.geo;
  if (!pos) return;
  const pov = panoramaPov() || { heading: preset.camera.heading };
  const url = new URL('https://www.google.com/maps/@');
  url.searchParams.set('api', '1');
  url.searchParams.set('map_action', 'pano');
  url.searchParams.set('viewpoint', pos.lat.toFixed(6) + ',' + pos.lng.toFixed(6));
  url.searchParams.set('heading', Number(pov.heading || 0).toFixed(1));
  $('maps-link').href = url.toString();
}
function cameraFromPanorama(onlyHeading = false) {
  const preset = currentPreset();
  if (!preset || !state.panorama) {
    status('Load Street View first to match its actual camera direction.', true);
    return false;
  }
  const pov = panoramaPov();
  const geo = panoramaPosition();
  if (!pov || !geo) return false;
  if (onlyHeading) {
    const s = browserGame()?.state?.();
    if (s?.pos) return gamePose(s.pos.x, s.pos.z, pov.heading);
    return gamePose(preset.camera.x, preset.camera.z, pov.heading);
  }
  const w = geoToWorld(geo.lat, geo.lng);
  const r = state.meta.region;
  if (w.x < r.x0 || w.x > r.x1 || w.z < r.z0 || w.z > r.z1) {
    status('Street View is outside the mapped Narromine area; not teleporting game.', true);
    return false;
  }
  return gamePose(w.x, w.z, pov.heading);
}
function refreshPanoramaMetadata() {
  const pos = panoramaPosition();
  const pov = panoramaPov();
  if (!pos) return;
  const pano = state.panorama.getPano() || 'not available';
  $('panorama-meta').textContent = 'Google panorama ' + pano +
    ' · ' + pos.lat.toFixed(6) + ', ' + pos.lng.toFixed(6) +
    ' · ' + Number(pov?.heading || 0).toFixed(1) + '°';
  mapsLink();
}
function moveExistingPanorama() {
  const preset = currentPreset();
  if (!preset) return;
  gamePose(preset.camera.x, preset.camera.z, preset.camera.heading);
  if (state.panorama) {
    // These update an existing viewer; they do not instantiate another billed
    // Dynamic Street View panorama under Google's current FAQ.
    log('VIEW CHANGE', 'Request existing Street View viewer to change landmark; no new panorama object', 0, false);
    state.panorama.setPosition(preset.geo);
    log('VIEW CHANGE', 'Request existing viewer to face the landmark heading', 0, false);
    state.panorama.setPov({ heading: preset.camera.heading, pitch: 0 });
  }
  status('Camera reset to ' + preset.title + '. No additional panorama viewer created.');
}
function loadGoogleSdk(key) {
  if (state.googleReady) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' +
      encodeURIComponent(key) + '&v=weekly&loading=async';
    script.onload = () => {
      if (!window.google?.maps?.StreetViewPanorama) return reject(new Error('Google Street View API unavailable'));
      state.googleReady = true; resolve();
    };
    script.onerror = () => reject(new Error('Cannot load Google Maps JavaScript API. Check key restrictions, billing and internet connection.'));
    document.head.appendChild(script);
    state.sdkScript = script;
  });
}
async function connectGoogle(event) {
  event.preventDefault();
  const key = $('api-key').value.trim();
  if (!key || state.loading || state.panorama) return;
  // One consent before any request to Google, including loading the JavaScript
  // library. No SDK, StreetViewService or panorama is initialised on page load.
  const notice = 'This will request the Google Maps JavaScript SDK and create ONE Google StreetViewPanorama viewer.\n\n' +
    'Published Dynamic Street View rate: US$0.014 for the first paid tier after ' +
    MONTHLY_FREE_EVENTS.toLocaleString() + ' free events per month (global pricing).\n' +
    'Estimated gross if already past the free allowance: US$0.014.\n' +
    'Exact account charge is NOT available to this page; Google Cloud billing determines whether this request is free or paid.\n\nContinue?';
  if (!confirm(notice)) return;
  state.loading = true;
  $('connect').disabled = true;
  $('connect').textContent = 'Connecting…';
  try {
    log('SDK LOAD', 'User requested Google Maps JavaScript SDK; no Map() instantiated', 0, false);
    await loadGoogleSdk(key);
    const preset = currentPreset();
    if (!preset) throw new Error('No location preset available');
    log('PANORAMA CREATED',
      'One Dynamic Street View panorama instantiated; successful load counts one billable SKU event (free allowance may apply)',
      RATE_USD, true);
    // Deliberately instantiate exactly once. Reuse for all landmarks and rotations.
    state.panorama = new google.maps.StreetViewPanorama($('streetview'), {
      position: preset.geo, pov: { heading: preset.camera.heading, pitch: 0 },
      zoom: 1, addressControl: true, linksControl: true, panControl: true,
      enableCloseButton: false, showRoadLabels: true,
    });
    $('google-placeholder').hidden = true;
    state.panorama.addListener('pano_changed', () => {
      refreshPanoramaMetadata();
      status('Street View image changed inside the existing viewer. No additional viewer creation charge.');
    });
    state.panorama.addListener('position_changed', refreshPanoramaMetadata);
    state.panorama.addListener('pov_changed', () => {
      refreshPanoramaMetadata();
      if ($('follow-rotation').checked) cameraFromPanorama(true);
    });
    state.panorama.addListener('status_changed', () => {
      const s = state.panorama.getStatus?.();
      if (s && s !== google.maps.StreetViewStatus.OK) status('Street View status: ' + String(s), true);
    });
    refreshPanoramaMetadata();
    gamePose(preset.camera.x, preset.camera.z, preset.camera.heading);
    $('connect').textContent = 'Viewer connected (one session)';
    status('Live Street View viewer ready. One panorama creation recorded; rotations and jumps reuse it.');
  } catch (error) {
    state.googleReady = false;
    status(error.message || String(error), true);
    $('connect').disabled = false;
    $('connect').textContent = 'Retry loading Street View';
    log('ERROR', 'Google SDK/viewer failed: ' + (error.message || error), 0, false);
  } finally {
    $('api-key').value = '';
    state.loading = false;
  }
}
function addNote() {
  const description = $('note').value.trim();
  if (!description) { status('Write an observation first.', true); return; }
  const preset = currentPreset();
  const game = browserGame()?.state?.();
  const record = {
    id: 'observation-' + (state.notes.length + 1), createdAt: new Date().toISOString(),
    locationId: preset?.id || null, title: preset?.title || '',
    feature: $('category').value, evidence: $('confidence').value,
    description, gamePosition: game?.pos || null,
    panoramaId: state.panorama?.getPano() || null,
    panoramaPosition: panoramaPosition(), panoramaPov: panoramaPov(),
    referenceType: 'Live Google Street View inspection; corroborate with independently permitted sources',
  };
  state.notes.push(record);
  $('note').value = '';
  const list = $('note-list');
  if (state.notes.length === 1) list.replaceChildren();
  const li = document.createElement('li');
  li.textContent = record.title + ' — ' + record.feature + ': ' + record.description +
    ' [' + record.evidence + ']';
  list.appendChild(li);
  status('Architectural observation added to local report; Google image not saved.');
}
async function saveGameScreenshot() {
  try {
    const game = $('game-frame').contentDocument;
    const canvas = game?.getElementById('scene');
    if (!canvas) throw new Error('Game WebGL canvas not ready');
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob || blob.size < 5000) throw new Error('WebGL screenshot unavailable: browser did not preserve the drawn frame');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repo-town-game-only-' + (currentPreset()?.id || 'narromine') + '.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('Saved GAME canvas only, never Google's panorama.');
  } catch (e) {
    status('Could not capture game canvas: ' + e.message +
      '. Use a game-only screenshot from the existing Playwright QA pipeline.', true);
  }
}
async function bootstrap() {
  renderBilling();
  $('api-form').addEventListener('submit', connectGoogle);
  $('match-preset').addEventListener('click', moveExistingPanorama);
  $('match-heading').addEventListener('click', () => {
    if (state.panorama) {
      // Explicitly report the SDK's local camera read. No new billed event.
      log('VIEW READ', 'Read Street View camera heading from existing viewer', 0, false);
      cameraFromPanorama(true);
    } else status('Load Street View first.', true);
  });
  $('follow-position').addEventListener('click', () => {
    if (state.panorama) {
      log('VIEW READ', 'Read existing Street View camera position/heading to match game', 0, false);
      cameraFromPanorama();
    } else status('Load Street View first.', true);
  });
  $('time').addEventListener('change', () => {
    const t = browserGame();
    if (t?.life?.setTime) t.life.setTime(Number($('time').value));
    status('Updated game clock only; no Google API request.');
  });
  $('location').addEventListener('change', moveExistingPanorama);
  $('toggle-hud').addEventListener('click', () => {
    try {
      const doc = $('game-frame').contentDocument;
      state.hudHidden = !state.hudHidden;
      for (const id of ['hud', 'game-compass', 'minimap', 'touch', 'prompt']) {
        const el = doc?.getElementById(id);
        if (el) el.style.display = state.hudHidden ? 'none' : '';
      }
      $('toggle-hud').textContent = state.hudHidden ? 'Show game HUD' : 'Hide game HUD';
    } catch { status('Could not control local game overlay.', true); }
  });
  $('add-note').addEventListener('click', addNote);
  $('export-json').addEventListener('click', () => {
    const data = {
      schemaVersion: 1, exportedAt: new Date().toISOString(),
      project: 'RepoTown / Narromine live Street View comparison',
      photosStored: false, apiKeyStored: false,
      note: 'Google's actual invoice is not observable here. Rates are first-tier published USD estimates only.',
      monthlyFreeTierEvents: MONTHLY_FREE_EVENTS,
      publishedFirstPaidRateUsd: RATE_USD,
      locallyObservedGoogleActions: state.events,
      observations: state.notes,
    };
    download('narromine-streetview-observations.json', JSON.stringify(data, null, 2),
      'application/json; charset=utf-8');
    status('Exported observations and local API cost ledger; no Google images or credentials included.');
  });
  $('export-game-image').addEventListener('click', saveGameScreenshot);
  try {
    const response = await fetch('/_streetview/api/presets', { cache: 'no-store' });
    if (!response.ok) throw new Error('Local location service returned ' + response.status);
    state.meta = await response.json();
    const list = $('location'); list.replaceChildren();
    for (const preset of state.meta.presets) {
      const option = document.createElement('option');
      option.value = preset.id; option.textContent = preset.title; list.appendChild(option);
    }
    state.selected = state.meta.presets[0]?.id || null;
    $('game-frame').addEventListener('load', () => {
      setTimeout(() => {
        const p = currentPreset();
        if (p) gamePose(p.camera.x, p.camera.z, p.camera.heading);
      }, 1800);
    });
    const p = currentPreset();
    if (p) {
      gamePose(p.camera.x, p.camera.z, p.camera.heading);
      mapsLink();
    }
    status('Six Narromine camera presets loaded locally. Google has NOT been contacted. Paste your key and explicitly connect when ready.');
  } catch (e) { status('Could not load local camera presets: ' + e.message, true); }
}
bootstrap();