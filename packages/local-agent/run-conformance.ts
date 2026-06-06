// F7 적합성 러너 CLI — 노드를 부팅해 선언 계약(신호·verb·ACK)을 실행 검사.
// 실행: pnpm --filter @station/local-agent conformance [MCU|VPU|LPU|ACU|all]
import type { MockSource } from "@station/node-kit";
import type { ConformanceSuite } from "@station/contracts";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";
import mcuSuite from "@station/contracts/profiles/conformance/conformance.mcu.json" with { type: "json" };
import acuSuite from "@station/contracts/profiles/conformance/conformance.acu.json" with { type: "json" };
import { runConformance, formatReport } from "./src/index";

const SOURCES: Record<string, () => MockSource> = {
  MCU: () => new McuSource(),
  VPU: () => new VpuSource(),
  LPU: () => new LpuSource(),
  ACU: () => new AcuSource(),
};
// 스위트 보유 노드(없으면 신호/명령을 manifest 에서 파생도 가능 — 여기선 정의된 것만).
const SUITES: Record<string, ConformanceSuite> = {
  MCU: mcuSuite as ConformanceSuite,
  ACU: acuSuite as ConformanceSuite,
};

const arg = (process.argv[2] ?? "all").toUpperCase();
const targets = arg === "ALL" ? Object.keys(SUITES) : [arg];

let allPass = true;
for (const node of targets) {
  const suite = SUITES[node];
  const make = SOURCES[node];
  if (!suite || !make) {
    console.log(`(스위트/소스 없음: ${node})`);
    continue;
  }
  const report = await runConformance(make(), suite);
  console.log(formatReport(report) + "\n");
  allPass &&= report.pass;
}
process.exit(allPass ? 0 : 1);
