import { JSDOM } from "jsdom";
import fs from "fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("index.html", "utf-8");
const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only" });

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; },
};

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

test("main.js loads without throwing", async () => {
  await import("./src/main.js");
});

test("index.html exposes the elements main.js binds to", () => {
  for (const id of ["app", "narrative", "new-game-btn", "load-btn", "save-btn",
                    "char-creation", "game-screen", "actions"]) {
    assert.ok(document.getElementById(id), `missing #${id} in index.html`);
  }
});

test("clicking New Game reveals character creation", async () => {
  document.getElementById("new-game-btn").click();
  await delay(50);
  const creation = document.getElementById("char-creation");
  assert.ok(creation, "#char-creation missing");
  assert.ok(creation.innerHTML.trim().length > 0,
    "character creation rendered no content after New Game");
});

test("every recipe references real items", async () => {
  const [{ ITEMS }, { RECIPES }] = await Promise.all([
    import("./src/data/items.js"),
    import("./src/data/recipes.js"),
  ]);
  const ids = new Set(Object.values(ITEMS).map((i) => i.id));
  assert.ok(ids.size > 0, "ITEMS is empty");
  for (const r of Object.values(RECIPES)) {
    assert.ok(ids.has(r.resultItemId),
      `recipe ${r.id} produces unknown item "${r.resultItemId}"`);
    for (const req of r.requires ?? []) {
      assert.ok(ids.has(req.itemId),
        `recipe ${r.id} requires unknown item "${req.itemId}"`);
    }
  }
});

test("item ids are unique and well formed", async () => {
  const { ITEMS } = await import("./src/data/items.js");
  const seen = new Set();
  for (const [key, item] of Object.entries(ITEMS)) {
    assert.ok(item.id, `item "${key}" has no id`);
    assert.ok(item.name, `item "${item.id}" has no name`);
    assert.ok(!seen.has(item.id), `duplicate item id "${item.id}"`);
    seen.add(item.id);
  }
});

test("every npc stands in a real location", async () => {
  const [{ LOCATIONS }, { NPCS }] = await Promise.all([
    import("./src/data/locations.js"),
    import("./src/data/npcs.js"),
  ]);
  const ids = new Set(Object.values(LOCATIONS).map((l) => l.id));
  assert.ok(ids.size > 0, "LOCATIONS is empty");
  for (const npc of Object.values(NPCS)) {
    assert.ok(ids.has(npc.locationId),
      `npc ${npc.id} is at unknown location "${npc.locationId}"`);
  }
});

test("every travel link points at a real location", async () => {
  const { LOCATIONS } = await import("./src/data/locations.js");
  const ids = new Set(Object.values(LOCATIONS).map((l) => l.id));
  for (const loc of Object.values(LOCATIONS)) {
    for (const dest of loc.travel ?? []) {
      assert.ok(ids.has(dest),
        `location ${loc.id} travels to unknown "${dest}"`);
    }
  }
});

test("every companion is recruited somewhere real", async () => {
  const [{ LOCATIONS }, { COMPANIONS }] = await Promise.all([
    import("./src/data/locations.js"),
    import("./src/data/companions.js"),
  ]);
  const ids = new Set(Object.values(LOCATIONS).map((l) => l.id));
  for (const c of Object.values(COMPANIONS)) {
    assert.ok(ids.has(c.recruitLocationId),
      `companion ${c.id} recruits at unknown "${c.recruitLocationId}"`);
  }
});

test("encounter enemies have usable combat stats", async () => {
  const { ENCOUNTERS } = await import("./src/data/locations.js");
  for (const e of Object.values(ENCOUNTERS)) {
    assert.ok(e.enemy, `encounter ${e.id} has no enemy`);
    assert.ok(e.enemy.hp > 0, `encounter ${e.id} enemy hp must be > 0`);
    assert.ok(e.enemy.ac > 0, `encounter ${e.id} enemy ac must be > 0`);
    assert.ok(e.enemy.name, `encounter ${e.id} enemy has no name`);
  }
});

test("spell and class ids are unique and well formed", async () => {
  const [{ SPELLS }, { CLASSES }] = await Promise.all([
    import("./src/data/spells.js"),
    import("./src/data/classes.js"),
  ]);
  for (const [label, coll] of [["spell", SPELLS], ["class", CLASSES]]) {
    const seen = new Set();
    for (const entry of Object.values(coll)) {
      assert.ok(entry.id, `${label} missing id`);
      assert.ok(entry.name, `${label} ${entry.id} missing name`);
      assert.ok(!seen.has(entry.id), `duplicate ${label} id "${entry.id}"`);
      seen.add(entry.id);
    }
  }
});

test("quests have distinct, non-empty stage descriptions", async () => {
  const { QUESTS } = await import("./src/data/quests.js");
  for (const q of Object.values(QUESTS)) {
    assert.ok(q.stages?.length > 0, `quest ${q.id} has no stages`);
    // Stages are plain strings, not objects.
    for (const stage of q.stages) {
      assert.equal(typeof stage, "string", `quest ${q.id} stage is not a string`);
      assert.ok(stage.trim().length > 0, `quest ${q.id} has an empty stage`);
    }
    assert.equal(new Set(q.stages).size, q.stages.length,
      `quest ${q.id} repeats a stage description`);
  }
});

test("save round-trips through storage", async () => {
  const { saveGame, loadGame, hasSave, deleteSave, SAVE_VERSION } =
    await import("./src/core/storage.js");
  global.localStorage.clear();
  assert.equal(hasSave(), false, "expected no save initially");

  saveGame({ hp: 12, location: "market_square" });
  assert.equal(hasSave(), true, "save was not written");

  const loaded = loadGame();
  assert.equal(loaded.incompatible, false);
  assert.equal(loaded.state.hp, 12);
  assert.equal(loaded.state.location, "market_square");
  assert.ok(loaded.savedAt, "savedAt not recorded");

  deleteSave();
  assert.equal(hasSave(), false, "deleteSave did not clear the save");
  assert.equal(loadGame(), null);
  assert.equal(typeof SAVE_VERSION, "number");
});

test("a save from another version is reported incompatible", async () => {
  const { loadGame } = await import("./src/core/storage.js");
  global.localStorage.setItem(
    "chronicles_sword_coast_save",
    JSON.stringify({ version: 999, savedAt: "x", state: { hp: 1 } })
  );
  const loaded = loadGame();
  assert.equal(loaded.incompatible, true);
  assert.equal(loaded.foundVersion, 999);
  global.localStorage.clear();
});

test("corrupt save data does not throw", async () => {
  const { loadGame } = await import("./src/core/storage.js");
  for (const junk of ["{not json", "null", '"a string"', "[]"]) {
    global.localStorage.setItem("chronicles_sword_coast_save", junk);
    const result = loadGame();
    assert.ok(result === null || typeof result === "object",
      `loadGame returned something unusable for ${junk}`);
  }
  global.localStorage.clear();
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL ${name}\n       ${e.message}`);
  }
}
console.log(failed ? `\n${failed}/${tests.length} failing` : `\n${tests.length} passing`);
process.exit(failed ? 1 : 0);
