/* ============================================================
   컨소시엄 기관 레지스트리 + 가공 벤더명(VND-*) → ORG-* alias
   (Organization 타입은 schema/organization 에서 생성)
   ============================================================ */
import type { Organization } from "./generated/organization";

export const ORGANIZATIONS: Record<string, Organization> = {
  "ORG-VIA": {
    orgId: "ORG-VIA",
    name: "비아",
    role: "통합 플랫폼(Local Agent·계약) + HMI · Telemetry · 관제(Ops)",
    ownsNodes: ["Telemetry"],
    platform: true,
  },
  "ORG-AGE": {
    orgId: "ORG-AGE",
    name: "에이지로보틱스",
    role: "모바일 베이스(MCU) — 구동·조향·충전·비상정지·엔코더",
    ownsNodes: ["MCU"],
  },
  "ORG-META": {
    orgId: "ORG-META",
    name: "메타파머스",
    role: "VPU·ACU + 작업모듈(매니퓰레이터 + 적과/적심 EE) — 로봇 지능+조작 일체",
    ownsNodes: ["VPU", "ACU"],
    vendorAliases: ["VND-OPTI", "VND-ARM", "VND-GREEN"],
  },
  "ORG-DAEDONG": {
    orgId: "ORG-DAEDONG",
    name: "대동로보틱스",
    role: "측위(LPU) — LPS·맵",
    ownsNodes: ["LPU"],
    vendorAliases: ["VND-NAVI"],
  },
  "ORG-KIRO": { orgId: "ORG-KIRO", name: "KIRO", role: "적심 EE 변형 (메타 작업모듈군 협력 공급)", ownsNodes: [] },
  "ORG-NAS": { orgId: "ORG-NAS", name: "국립농업과학원", role: "적과 EE 변형 (협력 공급)", ownsNodes: [] },
};

/** 기존 목업 가공 벤더명(release.ts) → 실제 컨소시엄 기관 */
export const VENDOR_TO_ORG: Record<string, string> = {
  "VND-OPTI": "ORG-META", // OptiVision 비전 → 메타 VPU
  "VND-ARM": "ORG-META", // ArmTech 매니퓰레이터 → 메타 WorkModule
  "VND-GREEN": "ORG-META", // GreenEdge 엔드이펙터 → 메타 WorkModule(KIRO/농과원 변형)
  "VND-NAVI": "ORG-DAEDONG", // NaviCore 항법/측위 → 대동 LPU
};

export function vendorToOrg(vendorId: string): string | undefined {
  return VENDOR_TO_ORG[vendorId];
}

export function getOrganization(orgId: string): Organization | undefined {
  return ORGANIZATIONS[orgId];
}
