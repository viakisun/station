/* ============================================================
   [SWC-RELEASES] 프로젝트별·릴리즈별 통합 Readiness — SSOT.
   릴리즈 = 한 로봇(blueprint)의 버전@채널 후보. 산출물(node/module)의 검증 상태·소유·차단을
   한 스냅샷으로 모은다. 혼합형 데이터:
   - 자동 도출: 전송(ifpFor), 검증 파이프라인(releaseApprovals)·게이트(G2/G5)는 firmwareId 로 연결.
   - 큐레이션 오버레이: 채널·차단·다음 책임자(서사용 readiness 모델 — docs/01-integration-orchestration.md).
   firmwareId 가 있는 산출물은 gates.ts gateFirmwareRelease / mockups.ts releaseApprovals 로 5단계 드릴인.
   ============================================================ */
import { ifpFor } from "@station/contracts";

export type Channel = "draft" | "canary" | "beta" | "stable";
export type Readiness = "verified" | "in_progress" | "blocked";

export interface ReleaseArtifact {
  artifact: string; // "MCU" · "manipulator EE"
  kind: "node" | "module";
  ownerOrg: string; // ORG-*
  ownerName: string;
  readiness: Readiness;
  channel: Channel;
  nextOwner?: string; // 막힌/진행 중일 때 다음 책임자
  firmwareId?: string; // releaseApprovals/gateFirmwareRelease 연결 키 → 5단계·G2 드릴인
  auditState?: string; // G5 audit→operational 평가 입력
}

export interface Release {
  id: string; // REL-*
  robotId: string; // RBT-* (scope 연결)
  label: string;
  blueprint: string;
  version: string;
  channel: Channel; // 현 채널
  targetChannel: Channel; // 목표
  createdAt: string;
  artifacts: ReleaseArtifact[];
}

/** node 산출물의 전송은 IF-P 에서 자동 도출. module 등은 undefined. */
export function transportOf(a: ReleaseArtifact): string | undefined {
  if (a.kind !== "node") return undefined;
  return ifpFor(a.artifact)?.transport;
}

export const RELEASES: Release[] = [
  // 김제 토마토 적과 — 대표 릴리즈(랜딩 보드 데이터 이관). beta 후보, ACU 차단.
  {
    id: "REL-THIN-0001-beta-rc2",
    robotId: "RBT-THIN-0001",
    label: "온실 적과 로봇",
    blueprint: "blueprint.greenhouse-thin",
    version: "1.2.0-rc2",
    channel: "canary",
    targetChannel: "beta",
    createdAt: "2026-06-02",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "stable" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "verified", channel: "beta" },
      { artifact: "VPU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "beta", firmwareId: "FW-CAM-2.4.2", auditState: "approved" },
      { artifact: "ACU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "blocked", channel: "draft", nextOwner: "메타파머스 — ACU conformance(TS-ACU) 재검증", firmwareId: "FW-EEP-3.1.0", auditState: "waiver_required" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
      { artifact: "manipulator EE", kind: "module", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "beta" },
      { artifact: "thinning EE", kind: "module", ownerOrg: "ORG-NAS", ownerName: "국립농업과학원", readiness: "in_progress", channel: "draft", nextOwner: "국립농업과학원 — EE 변형 납품·conformance" },
    ],
  },
  // 같은 로봇의 이전 릴리즈(이미 발행) — 릴리즈 셀렉터 시연용.
  {
    id: "REL-THIN-0001-stable-1.1",
    robotId: "RBT-THIN-0001",
    label: "온실 적과 로봇",
    blueprint: "blueprint.greenhouse-thin",
    version: "1.1.0",
    channel: "stable",
    targetChannel: "stable",
    createdAt: "2026-04-18",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "stable" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "verified", channel: "stable" },
      { artifact: "VPU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "stable", firmwareId: "FW-CAM-2.4.1", auditState: "approved" },
      { artifact: "ACU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "stable" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
      { artifact: "manipulator EE", kind: "module", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "verified", channel: "stable" },
    ],
  },
  // 국립농업과학원 생육분석 — 라이브. VPU 비전 검증 진행.
  {
    id: "REL-SCAN-0001-beta-rc1",
    robotId: "RBT-SCAN-0001",
    label: "생육분석 로봇",
    blueprint: "blueprint.greenhouse-scan",
    version: "0.9.0-rc1",
    channel: "canary",
    targetChannel: "beta",
    createdAt: "2026-05-28",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "beta" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "verified", channel: "beta" },
      { artifact: "VPU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "in_progress", channel: "draft", nextOwner: "메타파머스 — NIR 생육지표 conformance", firmwareId: "FW-CAM-2.4.2" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
      { artifact: "scan sensor EE", kind: "module", ownerOrg: "ORG-NAS", ownerName: "국립농업과학원", readiness: "in_progress", channel: "draft", nextOwner: "국립농업과학원 — RGB/NIR 캘리브 납품" },
    ],
  },
  // 부여 추종형 이송 — 안정화 단계.
  {
    id: "REL-CARRY-0001-stable-2.0",
    robotId: "RBT-CARRY-0001",
    label: "추종형 이송 로봇",
    blueprint: "blueprint.greenhouse-carry",
    version: "2.0.1",
    channel: "stable",
    targetChannel: "stable",
    createdAt: "2026-03-30",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "stable" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "verified", channel: "stable" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
      { artifact: "carry tray", kind: "module", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "stable" },
    ],
  },
  // 상주 예찰 — 초기 통합, 다수 차단.
  {
    id: "REL-SCOUT-0001-canary-0.4",
    robotId: "RBT-SCOUT-0001",
    label: "예찰 로봇",
    blueprint: "blueprint.orchard-scout",
    version: "0.4.0",
    channel: "draft",
    targetChannel: "canary",
    createdAt: "2026-05-20",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "beta" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "blocked", channel: "draft", nextOwner: "대동로보틱스 — 과수원 야외 측위 conformance" },
      { artifact: "VPU", kind: "node", ownerOrg: "ORG-META", ownerName: "메타파머스", readiness: "in_progress", channel: "draft", nextOwner: "메타파머스 — 병해충 분류 모델 납품", firmwareId: "FW-CAM-2.4.2" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
    ],
  },
  // 영주 방제 — 안전 게이트 중심.
  {
    id: "REL-SPRAY-0001-beta-1.3",
    robotId: "RBT-SPRAY-0001",
    label: "방제 로봇",
    blueprint: "blueprint.orchard-spray",
    version: "1.3.0",
    channel: "beta",
    targetChannel: "stable",
    createdAt: "2026-05-12",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "stable" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "verified", channel: "beta" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
      { artifact: "spray nozzle EE", kind: "module", ownerOrg: "ORG-NAS", ownerName: "국립농업과학원", readiness: "blocked", channel: "draft", nextOwner: "국립농업과학원 — 약액 잔류 안전 검증" },
    ],
  },
  // 김제 고추 제초 — 초기.
  {
    id: "REL-WEED-0001-canary-0.6",
    robotId: "RBT-WEED-0001",
    label: "제초 로봇",
    blueprint: "blueprint.field-weed",
    version: "0.6.0",
    channel: "draft",
    targetChannel: "canary",
    createdAt: "2026-06-01",
    artifacts: [
      { artifact: "MCU", kind: "node", ownerOrg: "ORG-AGE", ownerName: "에이지로보틱스", readiness: "verified", channel: "beta" },
      { artifact: "LPU", kind: "node", ownerOrg: "ORG-DAEDONG", ownerName: "대동로보틱스", readiness: "in_progress", channel: "draft", nextOwner: "대동로보틱스 — 노지 이랑 추종 측위" },
      { artifact: "Telemetry", kind: "node", ownerOrg: "ORG-VIA", ownerName: "비아", readiness: "verified", channel: "stable" },
      { artifact: "weed EE", kind: "module", ownerOrg: "ORG-NAS", ownerName: "국립농업과학원", readiness: "in_progress", channel: "draft", nextOwner: "국립농업과학원 — 기계식 제초 EE 납품" },
    ],
  },
];

export const getReleases = (): Release[] => RELEASES;
export const getReleasesOfRobot = (robotId: string): Release[] => RELEASES.filter((r) => r.robotId === robotId);
export const getRelease = (id: string): Release | null => RELEASES.find((r) => r.id === id) ?? null;

export interface ReleaseSummary {
  verified: number;
  total: number;
  pct: number;
  blocked: ReleaseArtifact[];
}
export function summarizeRelease(rel: Release): ReleaseSummary {
  const verified = rel.artifacts.filter((a) => a.readiness === "verified").length;
  const total = rel.artifacts.length;
  const blocked = rel.artifacts.filter((a) => a.readiness === "blocked");
  return { verified, total, pct: total ? Math.round((verified / total) * 100) : 0, blocked };
}
