// Original, real-time WebAudio synthesis; no sampled recordings or third-party rights.
// Distinct firing pulse, harmonic/filter tone, gear-change dip, intake and tyre/wind noise.
// One audio rig for the occupied vehicle only. Starts following a player sound gesture.
import {vehicleSpec,transmissionFor,clamp} from '../world/vehicle-dynamics.js';
const CYLINDER_PULSES={inline4:2,diesel:1.5,v6:3,v8:4,bike4:2,single:0.5};
export function vehicleAudioParameters(vehicle){
 if(!vehicle)return {active:false,frequency:0,volume:0,rpm:0,gear:'N',speedKmh:0};
 const spec=vehicleSpec(vehicle.model),speed=Number(vehicle.speed)||0;
 const trans=transmissionFor(vehicle.model,speed);
 const rpm=Number.isFinite(vehicle.rpm)?vehicle.rpm:trans.rpm;
 const kmh=Math.abs(speed)*3.6;
 return {active:true,model:vehicle.model,kind:spec.kind,tone:spec.tone,gear:vehicle.gear||trans.gear,
   rpm,speedKmh:kmh,frequency:rpm/60*(CYLINDER_PULSES[spec.tone]||2),
   pitch:clamp(rpm/spec.redline,.08,1),
   volume:clamp(.22+kmh/170,0,.84),
   wind:clamp(kmh/175,0,1),road:clamp(kmh/120,0,1),redline:spec.redline};
}
export function createVehicleAudio(ctx,output){
 const bus=ctx.createGain();bus.gain.value=.0;bus.connect(output);
 const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=480;
 const exhaust=ctx.createOscillator(),undertone=ctx.createOscillator(),harmonic=ctx.createOscillator();
 exhaust.type='sawtooth';undertone.type='triangle';harmonic.type='sine';
 const eg=ctx.createGain(),ug=ctx.createGain(),hg=ctx.createGain();eg.gain.value=.27;ug.gain.value=.28;hg.gain.value=.12;
 exhaust.connect(eg).connect(filter);undertone.connect(ug).connect(filter);harmonic.connect(hg).connect(filter);filter.connect(bus);
 const noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),samples=noise.getChannelData(0);
 for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1);
 const wind=ctx.createBufferSource(),windFilter=ctx.createBiquadFilter(),windGain=ctx.createGain();
 wind.buffer=noise;wind.loop=true;windFilter.type='bandpass';windFilter.frequency.value=470;windGain.gain.value=0;
 wind.connect(windFilter).connect(windGain).connect(output);
 const tyres=ctx.createBufferSource(),tyreFilter=ctx.createBiquadFilter(),tyreGain=ctx.createGain();
 tyres.buffer=noise;tyres.loop=true;tyreFilter.type='lowpass';tyreFilter.frequency.value=720;tyreGain.gain.value=0;
 tyres.connect(tyreFilter).connect(tyreGain).connect(output);
 for(const o of [exhaust,undertone,harmonic,wind,tyres])o.start();
 let lastGear='',lastModel='',lastActive=false;
 function update(vehicle){
   const p=vehicleAudioParameters(vehicle),at=ctx.currentTime;
   const target=(node,v,t=.09)=>node.gain.setTargetAtTime(v,at,t);
   if(!p.active){target(bus,0,.12);target(windGain,0);target(tyreGain,0);lastActive=false;return p;}
   const shift=lastActive&&lastModel===p.model&&lastGear!==p.gear;
   lastActive=true;lastGear=p.gear;lastModel=p.model;
   exhaust.frequency.setTargetAtTime(Math.max(24,p.frequency),at,.065);
   undertone.frequency.setTargetAtTime(Math.max(22,p.frequency/2),at,.09);
   harmonic.frequency.setTargetAtTime(Math.max(45,p.frequency*1.98),at,.065);
   const v8=p.tone==='v8',diesel=p.tone==='diesel',motorbike=p.kind==='bike';
   filter.frequency.setTargetAtTime((diesel?300:v8?1100:motorbike?1700:750)+p.pitch*(diesel?550:1750),at,.10);
   target(eg,diesel?.41:v8?.29:motorbike?.13:.20);
   target(ug,diesel?.4:v8?.28:.16);
   target(hg,motorbike?.20:.08);
   target(bus,p.volume*(shift?.37:1),shift?.035:.11);
   if(shift)target(bus,p.volume,.11);
   windFilter.frequency.setTargetAtTime(280+1100*p.wind,at,.12);
   target(windGain,p.wind*.095);
   tyreFilter.frequency.setTargetAtTime(500+1400*p.road,at,.12);
   target(tyreGain,p.road*.055);
   return {...p,shifted:shift};
 }
 return {update,dispose(){for(const o of [exhaust,undertone,harmonic,wind,tyres]){try{o.stop();}catch{}}bus.disconnect();windGain.disconnect();tyreGain.disconnect();}};
}
