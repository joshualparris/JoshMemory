import assert from 'node:assert/strict';
import {MUSIC_TRACKS,musicTrackAt,musicProfile} from '../src/ui/soundtrack.js';
import {SIGNAL_CROSSINGS,crossingState} from '../src/world/traffic-signals.js';
import {vehicleAudioParameters} from '../src/ui/vehicle-audio.js';
assert(MUSIC_TRACKS.length>=10);
assert.equal(new Set(MUSIC_TRACKS.map(x=>x.id)).size,MUSIC_TRACKS.length);
assert.equal(new Set(MUSIC_TRACKS.map(x=>x.name)).size,MUSIC_TRACKS.length);
for(const track of MUSIC_TRACKS) {
 assert(track.bpm>50&&track.bpm<160&&track.volume>0,'playable original track '+track.name);
 assert(['sine','square','triangle','sawtooth'].includes(track.type));
 assert(track.style);
}
assert.equal(musicTrackAt(-1).id,MUSIC_TRACKS.at(-1).id,'previous wraps');
assert.equal(musicTrackAt(MUSIC_TRACKS.length).id,MUSIC_TRACKS[0].id,'next wraps');
assert.equal(musicProfile('sheep',1,true).style,'folk','farm interiors retain adaptive profile');
assert.equal(SIGNAL_CROSSINGS.length>0,true,'crossing clicks require real game signal');
assert.equal(crossingState(51/3,3).pedestrians,'walk');
assert.equal(crossingState(2,3).pedestrians,'wait');
const idle=vehicleAudioParameters({model:'sedan',speed:0,rpm:800,gear:'N'});
const high=vehicleAudioParameters({model:'sedan',speed:12,rpm:5000,gear:'3'});
assert(high.frequency>idle.frequency*3,'faster RPM gives higher engine pitch');
assert(high.wind>idle.wind,'speed increases wind noise');
console.log('PASS: 10 unique original tracks, genre/skip wrap, crossing phase and engine pitch physics');
