/* ============================================================
   목업 스크린샷 한 방 캡처 — 빌드 → 서버 기동 → 대기 → 캡처 → 종료
   사용:
     pnpm capture                 # 클린 재빌드 후 전수 캡처(가장 안전)
     pnpm capture --skip-build    # 이미 빌드돼 있으면 빌드 생략하고 캡처만
     pnpm capture --keep-alive    # 캡처 후 서버를 끄지 않고 그대로 둠

   stale .next 청크로 인덱스 라우트가 500을 내는 일을 막기 위해 기본은
   .next를 지우고 새로 빌드한다(--skip-build로 생략 가능).
   ============================================================ */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const SKIP_BUILD = args.has("--skip-build");
const KEEP = args.has("--keep-alive");

// 포트는 capture-screenshots.mjs와 일치해야 한다(console 7331 · field 7332 · hub 7330).
const APPS = [
  { name: "console", pkg: "@station/console", port: 7331, probe: "/audit" },
  { name: "field", pkg: "@station/field", port: 7332, probe: "/hmi" },
  { name: "hub", pkg: "@station/hub", port: 7330, probe: "/" },
];

const run = (cmd, cargs) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, cargs, { cwd: ROOT, stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${cargs.join(" ")} → exit ${code}`))));
    p.on("error", rej);
  });

const servers = [];
const stopServers = () => {
  for (const s of servers) {
    try {
      process.kill(-s.pid); // detached → 프로세스 그룹째 종료(pnpm + next)
    } catch {}
    try {
      s.kill("SIGTERM");
    } catch {}
  }
};
process.on("SIGINT", () => {
  stopServers();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stopServers();
  process.exit(143);
});

const waitReady = async (url, timeoutMs = 90000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return true;
    } catch {}
    await sleep(700);
  }
  return false;
};

try {
  if (!SKIP_BUILD) {
    console.log("▸ clean .next");
    for (const a of APPS) rmSync(join(ROOT, "apps", a.name, ".next"), { recursive: true, force: true });
    console.log("▸ build");
    await run("pnpm", ["build"]);
  }

  console.log("▸ start servers");
  for (const a of APPS) {
    const p = spawn("pnpm", ["--filter", a.pkg, "exec", "next", "start", "-p", String(a.port)], {
      cwd: ROOT,
      stdio: "ignore",
      detached: true,
    });
    servers.push(p);
  }
  for (const a of APPS) {
    const ok = await waitReady(`http://localhost:${a.port}${a.probe}`);
    if (!ok) throw new Error(`${a.name} 가 :${a.port} 에서 기동되지 않음`);
    console.log(`  ✓ ${a.name} :${a.port}`);
  }

  console.log("▸ capture");
  await run("node", ["scripts/capture-screenshots.mjs"]);
  console.log("✓ done");
} catch (e) {
  console.error("✗", e.message);
  process.exitCode = 1;
} finally {
  if (KEEP) {
    console.log("▸ 서버를 그대로 둠 (--keep-alive) — 포트 7330/7331/7332");
  } else {
    stopServers();
    console.log("▸ servers stopped");
  }
}
