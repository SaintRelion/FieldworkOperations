import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
test("release worker uses network-first pages without precaching HTML", () => {
  const worker = read("../dist/sw.js");
  assert.match(worker, /NetworkFirst/);
  assert.match(worker, /app-pages/);
  assert.doesNotMatch(worker, /url:["']index\.html["']/);
  assert.doesNotMatch(worker, /createHandlerBoundToURL/);
  assert.doesNotMatch(worker, /importScripts\(["']\/sw-update\.js/);
});
test("registration does not poll or force navigation", () => {
  const registration = read("../src/app/pwa.ts");
  assert.doesNotMatch(registration, /setInterval|visibilitychange|location\.reload|registration\.update/);
  assert.doesNotMatch(read("../public/sw-update.js"), /client\.navigate|addEventListener/);
});
