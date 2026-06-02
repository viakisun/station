/* ============================================================
   목업 스크린샷 캡처 (단계 4 수행 완료 보고서용)
   prod 서버(console:3001 · field:3002 · hub:3000)가 기동된 상태를 가정.
   실행: node scripts/capture-screenshots.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "reports", "screenshots");

const CONSOLE = "http://localhost:7331";
const FIELD = "http://localhost:7332";
const HUB = "http://localhost:7330";

const CTX = encodeURIComponent(
  JSON.stringify({ origin: "ops", robot_id: "RBT-THIN-0001", work_session_id: "WKS-20260601-00045" }),
);

const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 1024, height: 768 };
const HUBVP = { width: 1280, height: 800 };

const TARGETS = [
  // ---- Ops ----
  ["ops", "01-control-dashboard", CONSOLE + "/control", DESKTOP],
  ["ops", "02-control-map", CONSOLE + "/control/map", DESKTOP],
  ["ops", "03-control-workplan", CONSOLE + "/control/work-plan", DESKTOP],
  ["ops", "04-incident-dashboard", CONSOLE + "/incident", DESKTOP],
  ["ops", "05-incident-detail", CONSOLE + "/incident/INC-20260601-0229", DESKTOP],
  ["ops", "06-incident-cause", CONSOLE + "/incident/INC-20260601-0229/cause", DESKTOP],
  ["ops", "07-incident-recurrence", CONSOLE + "/incident/recurrence", DESKTOP],
  ["ops", "08-incident-close", CONSOLE + "/incident/INC-20260601-0229/close", DESKTOP],
  // ---- Build ----
  ["build", "01-firmware-dashboard", CONSOLE + "/firmware", DESKTOP],
  ["build", "02-release-approve-pass", CONSOLE + "/firmware/FW-CAM-2.4.2/approve", DESKTOP],
  ["build", "03-release-approve-blocked", CONSOLE + "/firmware/FW-EEP-3.1.0/approve", DESKTOP],
  ["build", "04-deploy-plan", CONSOLE + "/firmware/FW-CAM-2.4.2/deploy-plan", DESKTOP],
  ["build", "05-rollback", CONSOLE + "/firmware/FW-CAM-2.4.2/rollback", DESKTOP],
  ["build", "06-audit-home", CONSOLE + "/audit", DESKTOP],
  ["build", "07-audit-approve", CONSOLE + "/audit/approve", DESKTOP],
  ["build", "08-compatibility", CONSOLE + "/firmware/compatibility", DESKTOP],
  ["build", "09-ota-monitor", CONSOLE + "/firmware/ota", DESKTOP],
  // ---- Build 신규/미캡처 ----
  ["build", "10-onboard", CONSOLE + "/audit/onboard", DESKTOP],
  ["build", "11-capability", CONSOLE + "/audit/capability", DESKTOP],
  ["build", "12-protocol", CONSOLE + "/audit/protocol", DESKTOP],
  ["build", "13-conformance", CONSOLE + "/audit/conformance", DESKTOP],
  ["build", "14-audit-package", CONSOLE + "/audit/package", DESKTOP],
  ["build", "15-firmware-register", CONSOLE + "/firmware/register", DESKTOP],
  ["build", "16-static-analysis", CONSOLE + "/firmware/static-analysis", DESKTOP],
  // ---- Ops 신규/미캡처 ----
  ["ops", "09-registry", CONSOLE + "/control/registry", DESKTOP],
  ["ops", "10-twin", CONSOLE + "/control/twin", DESKTOP],
  ["ops", "11-incident-stream", CONSOLE + "/incident/stream", DESKTOP],
  ["ops", "12-incident-action", CONSOLE + "/incident/INC-20260601-0229/action", DESKTOP],
  // ---- Field ----
  ["field", "01-hmi-home", FIELD + "/hmi", TABLET],
  ["field", "02-operate", FIELD + "/hmi/operate", TABLET],
  ["field", "03-operate-handoff", FIELD + "/hmi/operate?ctx=" + CTX, TABLET],
  ["field", "04-calibrate", FIELD + "/hmi/calibrate", TABLET],
  ["field", "05-estop", FIELD + "/hmi/estop", TABLET],
  ["field", "06-telemetry", FIELD + "/telemetry", TABLET],
  ["field", "07-gateway", FIELD + "/telemetry/gateway", TABLET],
  // ---- Hub ----
  ["hub", "00-landing", HUB + "/", HUBVP],
];

const run = async () => {
  const browser = await chromium.launch();
  let ok = 0;
  const fails = [];
  for (const [product, name, url, viewport] of TARGETS) {
    const dir = join(OUT, product);
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1.5 });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1300); // 애니메이션/타이머 안정화
      // 콘텐츠 실제 높이로 crop — 셸이 100vh라 짧은 화면은 빈 여백이 크게 남는다.
      // <main>의 자식(실제 콘텐츠) 바닥 + 좌측 nav 바닥 중 큰 값까지만 잘라 빈 띠 제거.
      const contentH = await page.evaluate(() => {
        // 셸이 100vh라 짧은 화면은 콘텐츠 아래 빈 띠가 크게 남고, 맨 아래 이벤트 바가 따로 붙는다.
        // 실제로 칠해진 leaf 요소들의 y구간을 모아, "콘텐츠 → 큰 빈 간격" 첫 지점에서 자른다.
        const vh = window.innerHeight;
        const GAP = 80; // 이보다 큰 수직 공백이 나오면 그 위에서 컷
        const ivs = [];
        for (const el of document.body.querySelectorAll("*")) {
          if (el.children.length) continue; // leaf만(실제 렌더 원자: 텍스트·아이콘·인풋)
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh) continue;
          ivs.push([Math.max(0, r.top), Math.min(vh, r.bottom)]);
        }
        if (!ivs.length) return null;
        ivs.sort((a, b) => a[0] - b[0]);
        let curBot = ivs[0][1];
        for (let i = 1; i < ivs.length; i++) {
          const [t, btm] = ivs[i];
          if (t > curBot + GAP) break; // 첫 큰 공백 → 여기까지가 콘텐츠
          if (btm > curBot) curBot = btm;
        }
        return curBot > 120 ? Math.ceil(curBot) : null;
      });
      const vh = viewport.height;
      const clip =
        contentH && contentH > 0 && contentH <= vh
          ? { clip: { x: 0, y: 0, width: viewport.width, height: Math.min(contentH + 16, vh) } }
          : { fullPage: true };
      await page.screenshot({ path: join(dir, name + ".png"), ...clip });
      ok++;
      console.log("✓", product + "/" + name);
    } catch (e) {
      fails.push(product + "/" + name + " :: " + e.message);
      console.log("✗", product + "/" + name, e.message);
    } finally {
      await page.close();
    }
  }
  await browser.close();
  console.log(`\n${ok}/${TARGETS.length} captured` + (fails.length ? `\nFAILS:\n${fails.join("\n")}` : ""));
  if (fails.length) process.exitCode = 1;
};

run();
