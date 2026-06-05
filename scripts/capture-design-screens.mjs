/* ============================================================
   디자인 핸드오프 스크린샷 캡처 — 신구조(hub/ops/build/field).
   docs/design/screens/*.png 를 갱신한다.
   전제: `pnpm dev`로 4앱이 떠 있어야 함(hub:7330·ops:7331·field:7332·build:7333).
   실행: node scripts/capture-design-screens.mjs
   참고: 구 scripts/capture.mjs는 폐구조(console 7331) 기준이라 동작 안 함.
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs/design/screens");
mkdirSync(OUT, { recursive: true });

const D = [1440, 900]; // desktop (ops/build/hub)
const T = [1024, 768]; // tablet (field touch)
// [port, route, slug, [w,h]]
const SHOTS = [
  [7330, "/", "hub-home", D],
  [7331, "/fleet", "ops-fleet", D],
  [7331, "/command", "ops-command", D],
  [7331, "/robot", "ops-robot", D],
  [7331, "/telemetry", "ops-telemetry", D],
  [7331, "/hmi-mirror", "ops-hmi-mirror", D],
  [7333, "/agent", "build-agent", D],
  [7333, "/agent-status", "build-agent-status", D],
  [7333, "/firmware", "build-firmware", D],
  [7333, "/manifests", "build-manifests", D],
  [7333, "/conformance", "build-conformance", D],
  [7332, "/hmi", "field-hmi", T],
  [7332, "/safety", "field-safety", T],
  [7332, "/telemetry", "field-telemetry", T],
];

const browser = await chromium.launch();
for (const [port, route, slug, [w, h]] of SHOTS) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const url = `http://localhost:${port}${route}`;
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, `${slug}.png`) });
    console.log(`OK  ${slug.padEnd(20)} ${resp?.status()}  ${url}`);
  } catch (e) {
    console.log(`ERR ${slug.padEnd(20)} ${e.message}  ${url}`);
  }
  await page.close();
}
await browser.close();
console.log("done ->", OUT);
