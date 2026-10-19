// Run with: node tests/npc-no-pin.mjs
// Static browser contract: no player PIN, no secret in the bundle.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const at = path => readFileSync(new URL(path, import.meta.url), "utf8");
const npc = at("../src/ui/npc-chat.js");
for (const html of ["../src/index.html", "../src/people.html"]) {
  const page = at(html);
  assert.doesNotMatch(page, /id=["']npc-code["']|class=["']npc-access["']/i);
  assert.match(page, /no access code required/i);
  assert.match(page, /id=["']npc-form["']/i);
}
assert.match(npc, /repository-town-no-code-ai\.parris-neathaustralia\.workers\.dev/);
assert.doesNotMatch(npc, /x-npc-code|sessionStorage|(?:pin\.value)|(?:getAccessCode)/);
assert.match(npc, /syncNpcViewport/);
assert.match(npc, /houseAwareReply/);
assert.match(npc, /AI unavailable/);
assert.match(npc, /credentials:\s*['"]omit['"]/);
const worker = at("../deploy/cloudflare-ai-worker.js");
assert.match(worker, /env\.GROQ_API_KEY/);
assert.doesNotMatch(worker, /process\.env\.GROQ_API_KEY\s*=\s*["']/);
console.log("No-PIN browser chat contract, Android viewport and secret-handling source checks passed.");
