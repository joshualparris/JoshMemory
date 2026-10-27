// Engine, gearbox and road sound for the car the player drives, synthesised from the drivetrain
// (src/world/drivetrain.js): pitch follows engine revs, so it climbs through each gear and drops
// at every shift. Layers, as recorded engines decompose:
//  - combustion: a pulse train at the firing frequency (rpm/60 × cylinders/2) plus its half-order
//    (uneven firing gives the throb) through a low-pass that opens with throttle load;
//  - intake: band-passed noise at a multiple of the firing frequency, only under throttle;
//  - diesel clatter (diesels only): bright ticking noise that follows revs;
//  - tyres on bitumen and wind, both rising with road speed;
//  - starter crank and catch when the engine starts, a run-down when it is switched off,
//    and a soft driveline clunk at each gear change.
// Plays through the ambience effects channel, so the Sound toggle and audio mix apply.
import { drivetrainFor } from '../world/drivetrain.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function createEngineAudio(getOut) {
  let rig = null, phase = 'off', phaseTime = 0, lastReg = null, lastGear = 0;
  const state = { phase: 'off', firingHz: 0, rpm: 0, gear: 0, layers: {} };

  function build(out) {
    const { ctx, bus, noise } = out, g = (v = 0) => { const n = ctx.createGain(); n.gain.value = v; return n; };
    const master = g(0); master.connect(bus);
    const shaper = ctx.createWaveShaper(); const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(2.2 * x); } shaper.curve = curve;
    const body = ctx.createBiquadFilter(); body.type = 'lowpass'; body.Q.value = 2.5;
    const comb = g(0.0); comb.connect(body).connect(shaper).connect(master);
    const osc = (type, gain) => { const o = ctx.createOscillator(); o.type = type; const a = g(gain); o.connect(a).connect(comb); o.start(); return o; };
    const fire = osc('sawtooth', 0.55), half = osc('triangle', 0.5), second = osc('square', 0.12);
    const noiseLayer = (type, freq, q) => { const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const a = g(0); src.connect(f).connect(a).connect(master); src.start(); return { f, a }; };
    const intake = noiseLayer('bandpass', 400, 2.2), clatter = noiseLayer('bandpass', 2800, 3), tyres = noiseLayer('lowpass', 500, 0.7), wind = noiseLayer('highpass', 900, 0.5);
    const crank = ctx.createOscillator(); crank.type = 'sawtooth'; crank.frequency.value = 11; const crankGain = g(0); crank.connect(crankGain).connect(master); crank.start();
    return { ctx, master, comb, body, fire, half, second, intake, clatter, tyres, wind, crankGain };
  }

  function clunk() {
    const { ctx, master } = rig, o = ctx.createOscillator(), a = ctx.createGain(), t = ctx.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(0.35, t + 0.01); a.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(a).connect(master); o.start(t); o.stop(t + 0.2);
  }

  // vehicle: the driven car (with .drive from the drivetrain) or null when on foot.
  function update(dt, vehicle) {
    const out = getOut?.();
    if (!out) { if (rig) rig.master.gain.value = 0; state.phase = 'muted'; return state; }
    if (!rig || rig.ctx !== out.ctx) rig = build(out);
    const spec = drivetrainFor(vehicle?.model || 'hatch'), diesel = spec.fuel === 'diesel';
    if (vehicle && vehicle.registration !== lastReg) { phase = 'cranking'; phaseTime = 0; lastReg = vehicle.registration; }
    if (!vehicle && lastReg) { phase = 'stopping'; phaseTime = 0; lastReg = null; }
    // Start and stop sequences run on wall-clock time so slow frames don't stretch them.
    const now = performance.now() / 1000; phaseTime += Math.max(0, now - (state.clock ?? now)); state.clock = now;
    if (phase === 'cranking' && phaseTime > (diesel ? 0.9 : 0.6)) { phase = 'catch'; phaseTime = 0; }
    if (phase === 'catch' && phaseTime > 0.8) phase = 'running';
    if (phase === 'stopping' && phaseTime > 1.2) phase = 'off';

    const drive = vehicle?.drive || {}, speed = Math.abs(vehicle?.speed || 0), load = clamp(drive.load ?? 0, 0, 1);
    let rpm = drive.rpm || spec.idle;
    if (phase === 'cranking') rpm = 0;
    else if (phase === 'catch') rpm = spec.idle * (1 + 0.7 * Math.sin(Math.min(1, phaseTime / 0.8) * Math.PI));   // flare, then settle
    else if (phase === 'stopping') rpm = spec.idle * Math.max(0, 1 - phaseTime / 1.2);
    else if (phase === 'off') rpm = 0;
    const firingHz = rpm / 60 * spec.cylinders / 2, t = rig.ctx.currentTime, k = 0.04;
    const running = phase === 'running' || phase === 'catch' || (phase === 'stopping' && rpm > 50);
    rig.master.gain.setTargetAtTime(phase === 'off' ? 0 : 0.5, t, 0.08);
    rig.comb.gain.setTargetAtTime(running ? (0.18 + 0.32 * load) * (diesel ? 1.15 : 1) : 0, t, k);
    if (firingHz > 1) {
      rig.fire.frequency.setTargetAtTime(firingHz, t, k);
      rig.half.frequency.setTargetAtTime(firingHz / 2, t, k);
      rig.second.frequency.setTargetAtTime(firingHz * 2, t, k);
    }
    rig.body.frequency.setTargetAtTime((diesel ? 180 : 260) + (diesel ? 900 : 2200) * load + firingHz * 2, t, k);
    rig.intake.f.frequency.setTargetAtTime(Math.max(200, firingHz * 6), t, k);
    rig.intake.a.gain.setTargetAtTime(running ? 0.12 * load * load : 0, t, k);
    rig.clatter.f.frequency.setTargetAtTime(2400 + rpm * 0.3, t, k);
    rig.clatter.a.gain.setTargetAtTime(running && diesel ? 0.05 + 0.03 * (rpm / spec.redline) : 0, t, k);
    rig.tyres.f.frequency.setTargetAtTime(300 + speed * 45, t, 0.1);
    rig.tyres.a.gain.setTargetAtTime(vehicle ? clamp(speed / 14, 0, 1) * 0.28 : 0, t, 0.1);
    rig.wind.a.gain.setTargetAtTime(vehicle ? Math.pow(clamp(speed / 16, 0, 1), 2) * 0.16 : 0, t, 0.15);
    rig.crankGain.gain.setTargetAtTime(phase === 'cranking' ? 0.22 : 0, t, 0.03);
    if (vehicle && phase === 'running' && drive.gear && lastGear && drive.gear !== lastGear) clunk();
    lastGear = drive.gear || 0;
    Object.assign(state, { phase, firingHz: Math.round(firingHz * 10) / 10, rpm: Math.round(rpm), gear: drive.gear || 0,
      layers: { combustion: running, intake: running && load > 0.05, clatter: running && diesel, tyres: speed > 0.3, wind: speed > 5 } });
    return state;
  }
  return { update, get state() { return { ...state }; } };
}
