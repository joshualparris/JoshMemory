# Repository Town soundscape and vehicle garage (27 October 2026)

## Implementation
Repo Town's canonical `main` gains a fully original and reproducible **WebAudio soundscape**. No third-party track or recording was embedded, and there are no runtime generative-AI costs. No commercial sound catalogue has been licensed.

- **Driving sounds**: `src/ui/vehicle-audio.js` continuously synthesises engine exhaust pulse, fundamental/subharmonic, intake tone, road/tyre noise and speed-sensitive air noise. Engine pitch is derived from the same RPM/automatic gear state as the dashboard; shift events momentarily dip the tone. Different tone profiles cover economical inline-four, diesel, V6, V8, parallel-cylinder-style single and four-cylinder bike. The vehicle sound is part of the existing effect volume and respects the global audio switch.
- **Street ambience**: existing weather-sensitive wind, birds, crickets, rain, shop interior sound and conversation sources retained; busy outdoor areas gain human speech-band crowd wash. New sheep bleats and cow lows are emitted only near the physical sheep/dairy farm sites and diminish with distance. Crossing click is emitted only within 24 model metres of the real `SIGNAL_CROSSINGS` and only while pedestrian walk phase is active.
- **Player soundtrack**: original browser-synthesised folk, jazz, ambient, rock, synthwave, classical, funk, lo-fi, cinematic and industrial pulse arrangements. Player Soundscape / Audio Mix panel provides a track selector, **Next**/**Previous**, adaptive-by-venue default, and persistent individual volume sliders. All motifs are written directly in `src/ui/soundtrack.js`; they are not copies of published sound recordings.
- **Cheat garage**: select one of 10 model types from the CHEAT123 menu: hatch, sedan, ute, van, truck, Ferrari 488-inspired fictional supercar, touring coupe, muscle coupe, 650cc road motorbike or 125cc scooter. Vehicles have differentiated body geometries, tank capacities, theoretical top speeds, automatic gears, RPM ranges and acceleration. Motorbikes have two inline wheels, narrow riding posture and a single front headlight rather than a miniature car body. The Ferrari-inspired supercar is *not* a licensed manufacturer 3D model or Ferrari endorsement.
- **Town vs maximum speed**: all vehicles observe 50 km/h by default. Cheat-spawned vehicles alone expose a **closed-course speed override** for speed performance tests. The override does not turn fictional pedestrian streets into a safe racetrack. Collision motion is swept in substeps to reduce tunnelling at higher speeds.
- **Instruments and fuel**: the displayed gear, RPM, model and tank capacity are driven by vehicle state and per-model specifications instead of an invented tachometer. Fuel can be topped up to the actual in-game tank capacity for the model.

## References and assumptions
Ferrari's published 488 GTB performance is **over 330 km/h** and approximately **3.0 seconds 0–100 km/h**, with a seven-speed dual-clutch V8. These figures informed the fictional high-performance supercar dynamics; the vehicle is *not* a verified reproduction of the Ferrari 488's engine maps, tyre grip, stability control or 3D body.

Source: [Ferrari 488 GTB technical specifications](https://www.motorshow.me/uploadImages/GalleryDocs/Doc5936.pdf) and [Ferrari manufacturer release on 488 Pista](https://www.ferrari.com/content/dam/ferrari-fcom/old/pdf/cs_ferrari_488_pista_geneva_gbr.pdf).

The other vehicle figures are *gameplay estimates* for relative acceleration, top speed, shift points and RPM; they are **not vehicle-specific certified numbers**. Detailed ADR compliance, aerodynamic/tyre limits, gear torque modelling, traction, braking distances, sound pressure levels, acoustic recordings and exhaust realism remain unverified.

## Release acceptance
- `node tests/vehicle-audio-models.mjs` — 10 models, dimensions, acceleration, top speed, automatic gears, tank and audio pitch.
- `node tests/soundscape-tracks.mjs` — 10 distinct original profiles, selection wrap, real crossing phase and pitch-speed coupling.
- `node tests/driving-instruments.mjs` — existing instrument values now use per-model tank and real gear.
- `node tests/soundscape-cheat-browser.mjs` — browser desktop/Android player settings and cheat selection.
- `npm run build:release` — full release and privacy gate.
- Check actual hosted `release.json.sourceCommit` and a real browser for playable acceptance; **do not claim the new soundscape is live solely because the source is committed**.

## Limitations
Realistic sound reproduction ultimately needs properly recorded and licensed sound samples, measured engine dynamics, separate acoustic zones, headphone spatialisation and mobile listening tests. This release uses **original procedural synthesis** to avoid rights, costs, download failures and WebAudio autoplay violations. Speech-band chatter is nonverbal background synthesis, **not recorded conversations** or NPC spoken dialogue.
