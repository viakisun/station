/* ============================================================
   [SWC-DOMAIN / WR-MVP-1·MVP-3] 상업 SaaS 스코프 fixture (stub)
   ORG-VIA → PRJ(시나리오) → SITE → RBT. 6개 실 시나리오.
   라이브 로봇 = 생육분석(RBT-SCAN-0001, growth-scan = scan→OBS) — fleet-manager 참조.
   TODO(SWT-DOMAIN-001): 실 멀티사이트 데이터·robot↔site 정합은 후속.
   ============================================================ */
import type { Project, Site, ScopeRobot } from "../types";

export const PROJECTS: Project[] = [
  { id: "PRJ-GIMJE-TOMATO-2026", name: "김제 스마트팜 혁신밸리 · 토마토 적과적심", orgId: "ORG-VIA", siteIds: ["SITE-GIMJE-01"] },
  { id: "PRJ-NIAS-GROWTH-2026", name: "국립농업과학원 첨단온실 · 생육 분석", orgId: "ORG-VIA", siteIds: ["SITE-NIAS-01"] },
  { id: "PRJ-BUYEO-CARRY-2026", name: "부여 달콤농장 · 추종형 이송로봇", orgId: "ORG-VIA", siteIds: ["SITE-BUYEO-01"] },
  { id: "PRJ-SANGJU-SCOUT-2026", name: "상주 단감 · 예찰로봇", orgId: "ORG-VIA", siteIds: ["SITE-SANGJU-01"] },
  { id: "PRJ-YEONGJU-SPRAY-2026", name: "영주 사과 · 방제로봇", orgId: "ORG-VIA", siteIds: ["SITE-YEONGJU-01"] },
  { id: "PRJ-GIMJE-WEED-2026", name: "김제 농가 · 고추 제초로봇", orgId: "ORG-VIA", siteIds: ["SITE-GIMJE-02"] },
];

export const SITES: Site[] = [
  { id: "SITE-GIMJE-01", name: "김제 스마트팜 혁신밸리", projectId: "PRJ-GIMJE-TOMATO-2026" },
  { id: "SITE-NIAS-01", name: "국립농업과학원 첨단온실", projectId: "PRJ-NIAS-GROWTH-2026" },
  { id: "SITE-BUYEO-01", name: "부여 달콤농장", projectId: "PRJ-BUYEO-CARRY-2026" },
  { id: "SITE-SANGJU-01", name: "상주 단감원", projectId: "PRJ-SANGJU-SCOUT-2026" },
  { id: "SITE-YEONGJU-01", name: "영주 사과원", projectId: "PRJ-YEONGJU-SPRAY-2026" },
  { id: "SITE-GIMJE-02", name: "김제 고추 농가", projectId: "PRJ-GIMJE-WEED-2026" },
];

export const SCOPE_ROBOTS: ScopeRobot[] = [
  // 김제 토마토 적과적심
  { id: "RBT-THIN-0001", type: "적과", state: "working", battery: 78, siteId: "SITE-GIMJE-01" },
  { id: "RBT-THIN-0002", type: "적과", state: "ready", battery: 95, siteId: "SITE-GIMJE-01" },
  { id: "RBT-PINCH-0003", type: "적심", state: "paused", battery: 41, siteId: "SITE-GIMJE-01" },
  // 국립농업과학원 생육분석 (RBT-SCAN-0001 = 라이브)
  { id: "RBT-SCAN-0001", type: "생육분석", state: "working", battery: 84, siteId: "SITE-NIAS-01" },
  { id: "RBT-SCAN-0002", type: "생육분석", state: "idle", battery: 90, siteId: "SITE-NIAS-01" },
  // 부여 추종형 이송
  { id: "RBT-CARRY-0001", type: "이송", state: "working", battery: 63, siteId: "SITE-BUYEO-01" },
  { id: "RBT-CARRY-0002", type: "이송", state: "charging", battery: 22, siteId: "SITE-BUYEO-01" },
  // 상주 단감 예찰
  { id: "RBT-SCOUT-0001", type: "예찰", state: "working", battery: 71, siteId: "SITE-SANGJU-01" },
  // 영주 사과 방제
  { id: "RBT-SPRAY-0001", type: "방제", state: "ready", battery: 88, siteId: "SITE-YEONGJU-01" },
  { id: "RBT-SPRAY-0002", type: "방제", state: "fault", battery: 35, siteId: "SITE-YEONGJU-01" },
  // 김제 고추 제초
  { id: "RBT-WEED-0001", type: "제초", state: "idle", battery: 100, siteId: "SITE-GIMJE-02" },
];
