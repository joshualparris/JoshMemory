// Visual identity contract: one immutable id produces one persistent person, and the
// appearance/outfit record is varied enough that a crowd is not a set of recoloured clones.
import assert from 'node:assert/strict';
import {
  identityFor, appearanceSignature, describeIdentity, outfitFor, outfitContext,
  occupationLabel, hashString, blend,
} from '../src/world/resident-identity.js';

const people = [
  { id: 'nr-1', name: 'Ada Whitfield', age: 34, gender: 'female', job: 'registered nurse', workplaceKind: 'hospital' },
  { id: 'nr-2', name: 'Tom Fraser', age: 41, gender: 'male', job: 'diesel mechanic', workplaceKind: 'car_repair' },
  { id: 'nr-3', name: 'Esme Carter', age: 8, gender: 'female', job: 'student', workplaceKind: 'school', role: 'child' },
  { id: 'nr-4', name: 'June Whitlock', age: 73, gender: 'female', job: 'retired' },
  { id: 'nr-5', name: 'Sam Okafor', age: 31, gender: 'male', job: 'police officer', workplaceKind: 'police' },
];

// Deterministic: same id + known facts = exactly the same person on every load.
for (const person of people) {
  const a = identityFor(person.id, person);
  const b = identityFor(person.id, person);
  assert.deepEqual(a, b, person.id + ' identity must be deterministic');
  assert.equal(a.id, person.id);
  assert.equal(a.name, person.name);
  assert.equal(a.age, person.age);
  assert.equal(a.gender, person.gender);
  assert.ok(a.body.height > .45 && a.body.height < 2.2, 'height is human: ' + a.body.height);
  assert.ok(a.face.jaw > .85 && a.face.jaw < 1.2, 'jaw variation is bounded');
  assert.ok(a.skin.base >= 0 && a.skin.base <= 0xffffff);
  assert.ok(a.hair.base >= 0 && a.hair.base <= 0xffffff);
  assert.ok(a.clothing.shirt >= 0 && a.clothing.shirt <= 0xffffff);
  assert.match(describeIdentity(a), new RegExp(person.name.split(' ')[0]));
  assert.equal(appearanceSignature(a), appearanceSignature(identityFor(person.id, person)));
}

// Children and older people are visibly different, not just scaled adults.
const child = identityFor('child:8', { age: 8, gender: 'female', job: 'student' });
const adult = identityFor('adult:35', { age: 35, gender: 'female', job: 'teacher' });
const senior = identityFor('senior:79', { age: 79, gender: 'male', job: 'retired' });
assert.ok(child.body.height < adult.body.height * .8, 'child height below adult');
assert.equal(child.accessories.facialHair, 'none', 'children have no facial hair');
assert.ok(child.face.width >= adult.face.width * .98, 'children keep a larger head relative to body');
assert.ok(senior.face.wrinkles > 0, 'older faces carry age detail');
assert.ok([0xb9b5ae, 0xf0ece4].includes(senior.hair.base), 'older hair is grey/white in the sampled range');

// A population sample must be materially diverse, not eight repeated tokens.
const sample = Array.from({ length: 500 }, (_, i) => identityFor('sample:' + i, { age: 18 + (i % 70), job: ['teacher', 'nurse', 'mechanic', 'farmer', 'student'][i % 5] }));
const signatures = new Set(sample.map(appearanceSignature));
assert.ok(signatures.size >= 495, '500 identities produce at least 495 distinct signatures: ' + signatures.size);
assert.ok(new Set(sample.map((x) => x.skin.base)).size >= 8, 'at least 8 skin tones');
assert.ok(new Set(sample.map((x) => x.hair.style)).size >= 8, 'at least 8 hairstyles');
assert.ok(new Set(sample.map((x) => x.body.build)).size >= 5, 'at least 5 body builds');
assert.ok(new Set(sample.map((x) => x.face.shape)).size >= 5, 'at least 5 face shapes');
assert.ok(new Set(sample.map((x) => x.clothing.shirt)).size >= 10, 'many clothing palettes');
const heights = sample.map((x) => x.body.height).sort((a, b) => a - b);
assert.ok(heights.at(-1) - heights[0] > .35, 'adult height range spans > 35 cm');

// Occupations are derived from known game facts only.
assert.equal(occupationLabel({ job: 'baker' }), 'baker');
assert.equal(occupationLabel({ workplaceKind: 'supermarket' }), 'supermarket team member');
assert.equal(occupationLabel({ age: 9 }), 'student');
assert.equal(occupationLabel({ age: 72 }), 'retired');

// Activity clothing is different in bed, at work, in rain and at night.
const identity = identityFor('outfit:1', { age: 38, gender: 'female', job: 'supermarket team member', workplaceKind: 'supermarket' });
const sleep = outfitFor(identity, { activity: 'asleep', minute: 23 * 60, weather: 'sunny' });
const work = outfitFor(identity, { activity: 'work shift', minute: 10 * 60, weather: 'sunny', jobKind: 'supermarket' });
const rain = outfitFor(identity, { activity: 'walk', minute: 10 * 60, weather: 'rainy' });
const night = outfitFor(identity, { activity: 'home', minute: 21 * 60 + 30, weather: 'cloudy' });
const exercise = outfitFor(identity, { activity: 'jog', minute: 7 * 60, weather: 'sunny' });
assert.equal(sleep.sleep, true, 'sleep clothing is flagged');
assert.equal(sleep.top.style, 'pyjama');
assert.equal(work.uniform, 'coles', 'supermarket work gets the store uniform');
assert.equal(work.top.colour, 0xc8202a, 'supermarket uniform is the Coles red');
assert.equal(work.badge, true, 'work outfit carries the badge');
assert.equal(rain.outer.kind, 'raincoat');
assert.equal(rain.umbrella, true);
assert.equal(exercise.bottom.kind, 'shorts');
assert.notEqual(sleep.key, work.key);
assert.notEqual(work.key, rain.key);
assert.notEqual(night.key, sleep.key);
assert.equal(outfitFor(identity, { activity: 'asleep', minute: 23 * 60, weather: 'sunny' }).key, sleep.key, 'outfit keys are stable');

// The context classifier does not treat every mention of "work" as clothing.
assert.equal(outfitContext({ job: 'builder' }, { activity: 'walking home', minute: 9 * 60 }).mode, 'home');
assert.equal(outfitContext({ job: 'builder' }, { activity: 'work shift', minute: 9 * 60 }).mode, 'work');
assert.equal(outfitContext({ job: 'builder' }, { activity: 'breakfast', minute: 7 * 60 }).mode, 'home');
assert.equal(outfitContext({ job: 'builder' }, { activity: 'asleep', minute: 1 * 60 }).mode, 'sleep');

// Hash and colour helpers are stable/pure.
assert.equal(hashString('same'), hashString('same'));
assert.notEqual(hashString('same'), hashString('different'));
assert.equal(blend(0x000000, 0xffffff, .5), 0x808080);
assert.equal(blend(0xff0000, 0x0000ff, 1), 0x0000ff);
console.log(`PASS resident identity: ${people.length} fixtures, ${signatures.size}/500 unique signatures, ` +
  `${new Set(sample.map((x) => x.skin.base)).size} skin tones, ${new Set(sample.map((x) => x.hair.style)).size} hairstyles, ` +
  `${new Set(sample.map((x) => x.body.build)).size} builds, ${(heights.at(-1) - heights[0]).toFixed(2)} m adult height range; activity outfits differ.`);
