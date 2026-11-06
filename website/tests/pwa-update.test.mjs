import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
const source = readFileSync(new URL("../public/sw-update.js", import.meta.url), "utf8");
async function activate(active) {
  let callback, completion;
  const visited = [];
  runInNewContext(source, { self: {
    registration: { active, scope: "https://app.example/" },
    addEventListener(_event, handler) { callback = handler; },
    clients: { async matchAll(options) {
      assert.equal(options.includeUncontrolled, true);
      return ["https://app.example/intern?workspace=demo", "https://other.example/"].map(url => ({
        url, async navigate(target) { visited.push(target); },
      }));
    } },
  } });
  callback({ waitUntil(promise) { completion = promise; } });
  await completion;
  return visited;
}
test("release refreshes legacy tabs at the existing URL within app scope", async () => {
  assert.deepEqual(await activate({}), ["https://app.example/intern?workspace=demo"]);
});
test("first installation does not reload the page", async () => {
  assert.deepEqual(await activate(null), []);
});
