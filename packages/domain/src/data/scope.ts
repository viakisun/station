/* ============================================================
   [SWC-DOMAIN / WR-MVP-1] 상업 SaaS 스코프 fixture (stub)
   ORG-VIA → PRJ → SITE → RBT. 기존 control.ts 10 로봇은 SITE-JINJU-01에
   1:1 보존 매핑하고, 2번째 프로젝트(Sangju)는 경량 mock 로봇으로 채운다.
   TODO(SWT-DOMAIN-001): 실 멀티사이트 데이터·robot↔site 정합은 후속.
   ============================================================ */
import type { Project, Site, ScopeRobot } from "../types";
import { CONTROL } from "./control";

export const PROJECTS: Project[] = [
  { id: "PRJ-JINJU-DEMO-2026", name: "Jinju 생육분석 데모", orgId: "ORG-VIA", siteIds: ["SITE-JINJU-01"] },
  { id: "PRJ-SANGJU-GROWTH-2026", name: "Sangju 생육 파일럿", orgId: "ORG-VIA", siteIds: ["SITE-SANGJU-01"] },
];

export const SITES: Site[] = [
  { id: "SITE-JINJU-01", name: "Jinju Smart-Farm Testbed", projectId: "PRJ-JINJU-DEMO-2026" },
  { id: "SITE-SANGJU-01", name: "Sangju Hub Greenhouse", projectId: "PRJ-SANGJU-GROWTH-2026" },
];

// 기존 10 로봇 → SITE-JINJU-01 (control.ts 값 보존, siteId만 부여).
const JINJU_ROBOTS: ScopeRobot[] = CONTROL.robots.map((r) => ({
  id: r.id,
  type: r.type,
  state: r.state,
  battery: r.battery,
  siteId: "SITE-JINJU-01",
}));

// Sangju 경량 mock (2번째 프로젝트가 비지 않게).
const SANGJU_ROBOTS: ScopeRobot[] = [
  { id: "RBT-THIN-0011", type: "thin", state: "working", battery: 72, siteId: "SITE-SANGJU-01" },
  { id: "RBT-THIN-0012", type: "thin", state: "ready", battery: 90, siteId: "SITE-SANGJU-01" },
  { id: "RBT-PINCH-0013", type: "pinch", state: "idle", battery: 55, siteId: "SITE-SANGJU-01" },
];

export const SCOPE_ROBOTS: ScopeRobot[] = [...JINJU_ROBOTS, ...SANGJU_ROBOTS];
