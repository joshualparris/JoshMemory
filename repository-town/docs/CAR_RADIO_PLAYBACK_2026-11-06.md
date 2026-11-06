# Car radio playback repair

Public technical record. Scope: live car radio only; no recorded NPC audio or save schema change.

The previous player searched a community directory by name, discarded HTTP entries,
and attempted the first HTTPS result without checking codec/playlist compatibility.
The directory returned no entries for 2DU/Zoo FM or the exact ABC Western Plains
name; Triple M Sydney was HTTP-only there. Some other entries were HLS playlists
that Chromium cannot assign directly to an Audio element.

The player now uses pinned HTTPS broadcaster feeds, separate media per tuning
attempt, bounded 15-second start/buffering waits, alternate feeds where available,
real `playing` state, retry on the station label, and cancellation on tuning/off/exit.
HLS uses native browser support or the locally vendored Apache-2.0 hls.js 1.6.13
light build (loaded only when needed). Direct streams use native audio without
CORS-dependent WebAudio processing. The three original offline music stations,
volume preference and vehicle/ambience integration remain intact.

## Station provenance

- ABC: HTTPS StreamGuys endpoints, with Western Plains HLS backup from ABC Listen
  (`https://www.abc.net.au/listen/live/westernplains`). Its directory name is
  **ABC Radio Western Plains**.
- 2DU: `https://2du.com.au/` exposes `domainInfo.streamingLink` to its own player.
- Zoo FM: `https://zoofm.net.au/` exposes the equivalent field. Corrected the
  displayed frequency to 92.7 (93.5 is a different Dubbo station).
- Triple M Sydney: existing SCA feed `https://legacy.scahw.com.au/2mmm_128`
  redirects to SCA's HTTPS AAC server; verified media playback, not just HTTP 200.
- BBC World Service: BBC Media HTTPS MP3 feed. BBC Radio 1: worldwide BBC Media
  HLS endpoint, using the station's 96kbps audio variant.
- KEXP, FIP, Radio Paradise: their HTTPS StreamGuys / Radio France / Radio
  Paradise audio endpoints. RNZ: its current `stream-ice.radionz.co.nz` hostname,
  rather than the directory's TLS-invalid StreamGuys hostname.
- J-WAVE cannot be promised in-game internationally. Its official instructions
  (`https://www.j-wave.co.jp/jlc/listenplus/listen.html`) require regional Radiko
  listening. Replaced its slot with **Shonan Beach FM · Japan**, explicitly a
  different station. Official public streaming instructions:
  `https://www.beachfm.co.jp/news/18612/` and `https://www.beachfm.co.jp/radio/`.

## Verification

`node tests/car-radio-live.mjs` checks real failure modes using controlled media:
HTTPS catalogue, failed-first-source recovery, start timeout, stale event and HLS
import cancellation, volume, and never claiming LIVE from a play promise alone.

`node tests/car-radio-browser.mjs` runs actual browser gestures and unmocked live
feeds on desktop and Pixel 7 emulation. It requires `playing` plus decoded media
time advancing for every live station. `TOWN_URL` selects the exact hosted build;
`CHROME_PATH` optionally selects an installed Chromium executable.

Live broadcaster availability can vary by network, region or future broadcaster
changes. These tests prove playback at the tested location/time, not perpetual
service. Physical handset/speaker listening is a separate acceptance level.
