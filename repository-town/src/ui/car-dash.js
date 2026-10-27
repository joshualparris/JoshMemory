// Driving dashboard: shown only while the player drives. Speedometer (km/h), automatic gear and
// tachometer, fuel and coolant-temperature gauges, odometer, warning lights and a car radio whose
// stations are synthesised in the browser (no streams, no recorded music, no network).
const TANK_L = 60, LIMIT_KMH = 50;
const STATIONS = [
  { id: 'off', name: 'Radio off' },
  { id: 'fm', name: '97.3 Town FM', rds: 'Easy listening from the Town Hall studio', tempo: 92, scale: [0, 4, 7, 9, 12, 16], wave: 'triangle' },
  { id: 'country', name: '88.1 Wheatbelt Country', rds: 'Country hour for the farms and the mill', tempo: 108, scale: [0, 2, 4, 7, 9, 12], wave: 'sawtooth' },
  { id: 'jazz', name: '102.5 Late Lane Jazz', rds: 'Cool jazz after work', tempo: 76, scale: [0, 3, 5, 6, 7, 10, 12], wave: 'sine' },
  { id: 'news', name: '612 AM Town News', rds: '', news: true },
];

export function createCarDash({ getVehicle, isDriving, getDay, getLog }) {
  const el = document.createElement('div');
  el.id = 'car-dash'; el.hidden = true;
  el.innerHTML = `
    <div class="cd-gauge cd-speed"><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M12 72 A50 50 0 1 1 108 72" class="cd-arc"/><line id="cd-needle" x1="60" y1="70" x2="60" y2="26"/></svg>
      <b id="cd-kmh">0</b><small>km/h</small><span id="cd-limit" title="Town speed limit">${LIMIT_KMH}</span></div>
    <div class="cd-mid">
      <div class="cd-row"><span id="cd-gear">P</span><span id="cd-rpm">0 rpm</span></div>
      <div class="cd-bar" title="Fuel"><i>⛽</i><meter id="cd-fuel" min="0" max="${TANK_L}" low="9" optimum="${TANK_L}"></meter><em id="cd-fuel-l"></em></div>
      <div class="cd-bar" title="Engine temperature"><i>🌡️</i><meter id="cd-temp" min="40" max="130" high="110" optimum="90"></meter><em id="cd-temp-c"></em></div>
      <div class="cd-row cd-small"><span id="cd-odo"></span><span id="cd-lights"></span></div>
    </div>
    <div class="cd-radio"><button id="cd-prev" aria-label="Previous station">⏮</button>
      <div><b id="cd-station">Radio off</b><marquee id="cd-rds" scrollamount="3"></marquee></div>
      <button id="cd-next" aria-label="Next station">⏭</button></div>`;
  document.body.appendChild(el);
  const style = document.createElement('style');
  style.textContent = `
#car-dash{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);z-index:30;display:flex;gap:10px;align-items:stretch;
  background:rgba(12,16,24,.86);color:#e8eef6;border:1px solid #3a4558;border-radius:14px;padding:8px 10px;font:12px system-ui,sans-serif;max-width:calc(100vw - 32px);box-sizing:border-box}
#car-dash[hidden]{display:none}
#car-dash .cd-gauge{position:relative;width:110px;text-align:center}
#car-dash svg{width:110px;height:72px}#car-dash .cd-arc{fill:none;stroke:#506080;stroke-width:6;stroke-dasharray:3 2}
#cd-needle{stroke:#ff6a3d;stroke-width:3;stroke-linecap:round;transform-origin:60px 70px;transition:transform .1s}
#cd-kmh{position:absolute;left:0;right:0;top:40px;font-size:22px}#car-dash .cd-gauge small{position:absolute;left:0;right:0;top:64px;opacity:.7}
#cd-limit{position:absolute;right:-4px;top:0;width:24px;height:24px;line-height:20px;border:3px solid #d22;border-radius:50%;background:#fff;color:#000;font-weight:700;font-size:11px}
#cd-limit.over{animation:cdflash .6s infinite alternate}@keyframes cdflash{to{background:#d22;color:#fff}}
#car-dash .cd-mid{display:flex;flex-direction:column;gap:4px;justify-content:center;min-width:130px}
#car-dash .cd-row{display:flex;justify-content:space-between;gap:8px}#cd-gear{font-weight:700;font-size:16px;color:#7fd17f}
#car-dash .cd-bar{display:flex;align-items:center;gap:4px}#car-dash meter{flex:1;height:10px}#car-dash em{font-style:normal;min-width:36px;text-align:right}
#car-dash .cd-small{opacity:.8;font-size:11px}#cd-lights{color:#ffb020}
#car-dash .cd-radio{display:flex;align-items:center;gap:4px;width:170px}#car-dash .cd-radio>div{flex:1;overflow:hidden}
#cd-station{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#9fd3ff}#cd-rds{display:block;opacity:.75}
#car-dash button{background:#24304a;color:#fff;border:1px solid #445;border-radius:8px;min-width:34px;min-height:34px;font-size:14px}
@media (max-width:620px){#car-dash{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 64px);flex-wrap:wrap;justify-content:center;font-size:11px}
 #car-dash .cd-gauge,#car-dash svg{width:90px}#car-dash svg{height:60px}#cd-kmh{top:30px;font-size:18px}#car-dash .cd-gauge small{top:52px}
 #car-dash .cd-radio{width:100%}}`;
  document.head.appendChild(style);
  const $ = (id) => el.querySelector('#' + id);

  // Coolant warms towards ~90 °C with running time and load, cools when parked; a worn engine runs hotter.
  let temp = 40, station = 0, audio = null, nextNote = 0, beat = 0, newsAt = 0, lastReg = null;
  function ensureAudio() {
    if (audio) return audio;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctx = new AC(), master = ctx.createGain(); master.gain.value = 0.18; master.connect(ctx.destination);
    const engine = ctx.createOscillator(), eg = ctx.createGain(), lp = ctx.createBiquadFilter();
    engine.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 380; eg.gain.value = 0;
    engine.connect(lp).connect(eg).connect(master); engine.start();
    audio = { ctx, master, engine, eg };
    return audio;
  }
  function note(freq, at, len, wave, vol) {
    const { ctx, master } = audio, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave; o.frequency.value = freq; g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, at + len);
    o.connect(g).connect(master); o.start(at); o.stop(at + len + 0.05);
  }
  function playRadio() {
    const s = STATIONS[station]; if (!audio || !s.tempo) return;
    const { ctx } = audio, step = 60 / s.tempo / 2;
    if (nextNote < ctx.currentTime) nextNote = ctx.currentTime + 0.05;
    // Schedule a little ahead: a walking bass on the beat and a melody drawn from the station's scale.
    while (nextNote < ctx.currentTime + 0.3) {
      const root = 110 * Math.pow(2, [0, 5, 7, 3][Math.floor(beat / 16) % 4] / 12);
      if (beat % 2 === 0) note(root, nextNote, step * 1.8, 'sine', 0.35);
      const hash = Math.sin(beat * 12.9898 + station * 78.233) * 43758.5453, r = hash - Math.floor(hash);
      if (r > 0.3) note(root * 2 * Math.pow(2, s.scale[Math.floor(r * 97) % s.scale.length] / 12), nextNote, step * (r > 0.8 ? 2 : 1), s.wave, 0.18);
      if (beat % 4 === 2) note(2400, nextNote, 0.03, 'square', 0.04);
      nextNote += step; beat++;
    }
  }
  function tune(delta) {
    station = (station + delta + STATIONS.length) % STATIONS.length;
    const s = STATIONS[station];
    if (station) ensureAudio()?.ctx.resume();
    window.speechSynthesis?.cancel(); newsAt = 0;
    $('cd-station').textContent = s.name; $('cd-rds').textContent = s.rds || '';
  }
  $('cd-prev').onclick = () => tune(-1); $('cd-next').onclick = () => tune(1);
  addEventListener('keydown', (e) => { if (isDriving() && e.code === 'KeyR' && !e.target.closest?.('input,textarea')) tune(e.shiftKey ? -1 : 1); });

  function update(dt) {
    const v = isDriving() ? getVehicle() : null;
    el.hidden = !v;
    if (audio) audio.eg.gain.setTargetAtTime(v ? 0.16 : 0, audio.ctx.currentTime, 0.1);
    if (!v) {
      temp = Math.max(40, temp - dt * 0.6);
      if (station) { window.speechSynthesis?.cancel(); station = 0; tune(0); }
      lastReg = null; return;
    }
    if (v.registration !== lastReg) { lastReg = v.registration; temp = Math.max(temp, 45); }
    const ms = Math.abs(v.speed || 0), kmh = Math.round(ms * 3.6);
    // Four-speed automatic: shift points by road speed, rpm rises through each gear.
    const gears = [0, 15, 28, 40, 999], g = (v.speed || 0) < -0.05 ? 'R' : ms < 0.05 ? 'N' : String(gears.findIndex((t) => kmh < t));
    const lo = g === 'R' || g === 'N' ? 0 : gears[Number(g) - 1], hi = g === 'R' || g === 'N' ? 15 : Math.min(gears[Number(g)], 60);
    const rpm = Math.round(g === 'N' ? 800 : 900 + (kmh - lo) / Math.max(1, hi - lo) * 2600);
    const worn = (v.condition || 100) < 75 ? 12 : 0;
    temp += ((90 + worn + ms * 0.4) - temp) * Math.min(1, dt * 0.05);
    $('cd-kmh').textContent = kmh;
    $('cd-needle').style.transform = `rotate(${-120 + Math.min(120, kmh) * 2}deg)`;
    $('cd-limit').classList.toggle('over', kmh > LIMIT_KMH);
    $('cd-gear').textContent = g; $('cd-rpm').textContent = `${rpm} rpm`;
    $('cd-fuel').value = v.fuel || 0; $('cd-fuel-l').textContent = `${Math.round(v.fuel || 0)} L`;
    $('cd-temp').value = temp; $('cd-temp-c').textContent = `${Math.round(temp)}°C`;
    $('cd-odo').textContent = `${(v.odometer || 0).toFixed(1)} km · ${v.registration}`;
    const warn = [];
    if ((v.fuel || 0) < 9) warn.push('⛽ low fuel');
    if (temp > 105) warn.push('🌡️ hot');
    if (getDay() > v.regoUntil) warn.push('rego expired');
    if (getDay() > v.serviceDue) warn.push('🔧 service');
    if (!v.roadworthy || (v.condition || 100) < 60) warn.push('⚠️ unroadworthy');
    $('cd-lights').textContent = warn.join(' ');
    if (audio) audio.engine.frequency.setTargetAtTime(rpm / 60 * 1.5, audio.ctx.currentTime, 0.08);
    playRadio();
    // The news station reads the latest town log lines aloud (browser speech, where available).
    const s = STATIONS[station];
    if (s.news && performance.now() > newsAt) {
      const line = (getLog() || [])[0] || 'All quiet in Repository Town.';
      $('cd-rds').textContent = line; newsAt = performance.now() + 20000;
      if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance('Town news. ' + line); u.lang = 'en-AU'; u.rate = 1; speechSynthesis.speak(u); }
    }
  }
  return { update, tune, get station() { return STATIONS[station].name; }, el };
}
