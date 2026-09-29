import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("PWA SVG uses the header's original Lucide Orbit paths", () => {
  const source = readFileSync("node_modules/lucide-react/dist/esm/icons/orbit.js", "utf8");
  const svg = readFileSync("public/fieldwork-icon.svg", "utf8");
  const paths = [...source.matchAll(/d: "([^"]+)"/g)];
  assert.equal(paths.length, 2);
  for (const [, path] of paths) assert.ok(svg.includes(`d="${path}"`));
  assert.ok(svg.includes('stroke-width="2.2"'));
  for (const circle of ['cx="12" cy="12" r="3"', 'cx="19" cy="5" r="2"', 'cx="5" cy="19" r="2"']) {
    assert.ok(svg.includes(circle));
  }
  for (const file of ["src/components/SpecialHeader.tsx", "src/pages/authentication/LoginPage.tsx", "index.html"]) {
    assert.ok(readFileSync(file, "utf8").includes("/fieldwork-icon.svg"));
  }
});

test("Installed-app PNGs have the expected dimensions", () => {
  for (const [file, size] of [["apple-touch-icon.png", 180], ["fieldwork-192.png", 192], ["fieldwork-512.png", 512]]) {
    const bytes = readFileSync(`public/${file}`);
    assert.equal(bytes.readUInt32BE(16), size);
    assert.equal(bytes.readUInt32BE(20), size);
  }
});
