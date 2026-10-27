// Dashboard values come from the driven car, never from an invented HUD counter.
// Game-world metres per second become Australian km/h; 30 L is the existing refuelling capacity.
export const FUEL_CAPACITY_L = 30;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const finite = (n, otherwise=0) => Number.isFinite(n) ? n : otherwise;

// Illustrative coolant model, not a real car engineering or maintenance diagnostic.
// Warms up while the engine runs, settles around normal operating temperature,
// and runs somewhat hotter under load or when the simulated vehicle is worn.
export function updateCoolantTemperature(previous, dt, speedMs, condition=100) {
  const old = clamp(finite(previous, 22), -10, 125);
  const load = clamp(Math.abs(finite(speedMs))/13, 0, 1);
  const wear = clamp(100-finite(condition,100), 0, 100);
  const target = 88 + 6*load + 0.12*wear;
  const delta = clamp(finite(dt),0,1.0);
  return Math.round((old + (target-old)*(1-Math.exp(-delta/38)))*10)/10;
}

export function vehicleTelemetry(vehicle) {
  if (!vehicle) return null;
  const speedMs=finite(vehicle.speed),fuel=clamp(finite(vehicle.fuel),0,FUEL_CAPACITY_L);
  const temp=clamp(finite(vehicle.coolantTemp,22),-10,125);
  const speedKmh=Math.round(Math.abs(speedMs)*3.6);
  return {
    registration:String(vehicle.registration||''),
    model:String(vehicle.model||'car'),
    speedKmh,
    speedMs,
    direction:speedMs < -.12?'R':'D',
    rpm:Math.round((825+Math.abs(speedMs)*135)/50)*50, // approximate tachometer, not simulated engine revolutions
    fuelLitres:Math.round(fuel*10)/10,
    fuelPercent:Math.round(100*fuel/FUEL_CAPACITY_L),
    lowFuel:fuel<=4.5,
    coolantC:Math.round(temp),
    coolantPercent:Math.round(100*clamp((temp-40)/80,0,1)),
    hotEngine:temp>=108,
    odometerKm:Math.round(finite(vehicle.odometer)*10)/10,
    conditionPercent:Math.round(clamp(finite(vehicle.condition,100),0,100)),
    approximateRangeKm:Math.floor(fuel/3), // existing engine consumes 0.003 L per metre = 3 L per km
  };
}
