/* [SWC-HUB] Landing 데이터 도출 — 핵심 수치는 계약 SSOT 에서 자동 계산(수기 아님).
   org·노드·전송·의존엣지·org별 verb·검증은 실 데이터(ORGANIZATIONS·INTERFACES·COMMAND_VERBS·domain).
   readiness 상태/채널/할당은 서사용 큐레이션 오버레이(모델은 docs/01-integration-orchestration.md). */
import { ORGANIZATIONS, ALL_INTERFACES, COMMAND_VERBS, ifpFor } from "@station/contracts";

export type Channel = "stable" | "beta" | "canary" | "draft";
export type Readiness = "verified" | "in_progress" | "blocked";

const NODE_ORDER = ["MCU", "LPU", "VPU", "ACU", "Telemetry"] as const;
const ORG_OF_NODE: Record<string, string> = {};
for (const o of Object.values(ORGANIZATIONS)) for (const n of o.ownsNodes ?? []) ORG_OF_NODE[n] = o.orgId;

/** 컨소시엄 기관 — 실 레지스트리. */
export const orgs = Object.values(ORGANIZATIONS);

/** 통합 미들웨어가 흡수하는 노드 — kind·소유 org·전송(IF-P 에서 자동). */
export const nodes = NODE_ORDER.map((kind) => ({
  kind,
  ownerOrg: ORG_OF_NODE[kind] ?? "—",
  ownerName: ORGANIZATIONS[ORG_OF_NODE[kind] ?? ""]?.name ?? "—",
  transport: ifpFor(kind)?.transport ?? "—",
}));

/** IF-L 논리 의존(provider→consumer) — "누구 작업이 누구로 흐르나" 자동 도출. */
export const dependencies = ALL_INTERFACES.filter((i) => i.class === "IF-L" && i.provider !== "Agent").map((i) => ({
  id: i.id,
  from: i.provider,
  to: i.consumer,
  carries: [...(i.carries?.signals ?? []), ...(i.carries?.commands ?? [])][0] ?? i.note ?? "",
}));

/** org 별 소유 command verb 수 — 계약에서 집계. */
export const verbsByOrg = (() => {
  const m: Record<string, number> = {};
  for (const v of Object.values(COMMAND_VERBS)) m[v.ownerOrg] = (m[v.ownerOrg] ?? 0) + 1;
  return m;
})();

/** 적과/적심 로봇 개념도 — 노드별 로봇 부위 역할(시각화 라벨). */
export const robotRole: Record<string, string> = {
  MCU: "모바일 베이스 · 구동/조향/E-stop",
  LPU: "측위 · LiDAR/맵",
  VPU: "EE 카메라(비전·RGB/NIR)",
  ACU: "매니퓰레이터 + 적과/적심 EE",
  Telemetry: "통신 모듈 · LTE/5G 업링크",
};

/** 미들웨어 실측 요약(P0~P4 + 리그). */
export const fabric = {
  nodeCount: nodes.length,
  transports: [...new Set(nodes.map((n) => n.transport))].filter((t) => t !== "—"),
  ifpCount: ALL_INTERFACES.filter((i) => i.class === "IF-P").length,
  ifCount: ALL_INTERFACES.length,
  verbCount: Object.keys(COMMAND_VERBS).length,
  conformance: ["TS-MCU", "TS-ACU"], // run-conformance 실행 시 PASS
};

/** 대상 로봇 통합 readiness — 큐레이션 오버레이(검증=conformance 보유 노드). */
export interface ArtifactReadiness {
  artifact: string;
  kind: "node" | "module";
  ownerOrg: string;
  ownerName: string;
  readiness: Readiness;
  channel: Channel;
  nextOwner?: string; // 막힌 경우 다음 책임자
}

export const targetRobot = {
  id: "RBT-THIN-0001",
  blueprint: "blueprint.greenhouse-thin",
  label: "온실 적과 로봇",
  targetChannel: "beta" as Channel,
};

export const readiness: ArtifactReadiness[] = [
  { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "stable" },
  { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "verified", channel: "beta" },
  { artifact: "VPU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "beta" },
  { artifact: "ACU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "blocked", channel: "draft", nextOwner: "메타파머스 — ACU conformance(TS-ACU) 재검증" },
  { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
  { artifact: "manipulator EE", kind: "module", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "beta" },
  { artifact: "thinning EE", kind: "module", ownerOrg: "ORG-NAS", ownerName: "국립농업과학원", readiness: "in_progress", channel: "draft", nextOwner: "국립농업과학원 — EE 변형 납품·conformance" },
];

export const readinessSummary = {
  verified: readiness.filter((r) => r.readiness === "verified").length,
  total: readiness.length,
  blocked: readiness.filter((r) => r.readiness === "blocked"),
};

/** 통합 라이프사이클 — ready→…→publish. */
export const lifecycle = [
  { step: "ready", label: "납품 준비", desc: "노드/모듈 매니페스트·계약 제출" },
  { step: "test", label: "통합 테스트", desc: "합류·IF-P/L 흡수·신호 흐름" },
  { step: "verify", label: "검증", desc: "conformance(F7) 통과" },
  { step: "deploy", label: "배포", desc: "OTA·gate(G2/G6) 통과" },
  { step: "audit", label: "감사", desc: "audit 패키지 승인(G5)" },
  { step: "publish", label: "발행", desc: "stable / beta 채널 승급" },
] as const;
