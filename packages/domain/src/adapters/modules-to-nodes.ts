/* ============================================================
   기존 모듈(MOD-*)·표준채널(TCH-*) → 노드(MCU/VPU/ACU/Telemetry/LPU) 분류 + owner_org
   (비파괴: release.ts mock 을 읽어 표준 Node[] 로 투영)
   ============================================================ */
import type { Node } from "@station/contracts";
import { toNamespace } from "@station/contracts";
import { RELEASE } from "../data/release";

export type NodeKind = "MCU" | "VPU" | "ACU" | "Telemetry" | "LPU";

/** MOD-* → 부착 노드. 매니퓰레이터/엔드이펙터(ARM/EE)는 ACU에 붙는다. */
export function moduleNode(moduleId: string): NodeKind {
  if (moduleId.startsWith("MOD-CAM")) return "VPU";
  if (moduleId.startsWith("MOD-NAV")) return "LPU";
  return "ACU";
}

/** TCH-* 표준채널 → 소속 노드 */
const CHANNEL_NODE: Record<string, NodeKind> = {
  "TCH-gh-temp": "Telemetry",
  "TCH-gh-humidity": "Telemetry",
  "TCH-gh-co2": "Telemetry",
  "TCH-gh-lux": "Telemetry",
  "TCH-cam-fps": "VPU",
  "TCH-arm-joint-temp": "ACU",
  "TCH-ee-grip-force": "ACU",
  "TCH-nav-deviation": "ACU",
  "TCH-batt-voltage": "MCU",
};

export function channelNode(tchId: string): NodeKind | undefined {
  return CHANNEL_NODE[tchId];
}

const NODE_META: Record<NodeKind, { id: string; owner: string; label: string }> = {
  MCU: { id: "NODE-MCU-AGE", owner: "ORG-AGE", label: "모바일 베이스" },
  VPU: { id: "NODE-VPU-META", owner: "ORG-META", label: "비전·AI인식" },
  ACU: { id: "NODE-ACU-META", owner: "ORG-META", label: "자율제어+작업모듈" },
  Telemetry: { id: "NODE-TEL-VIA", owner: "ORG-VIA", label: "통신 게이트웨이" },
  LPU: { id: "NODE-LPU-DAEDONG", owner: "ORG-DAEDONG", label: "측위" },
};

const channelsForNode = (k: NodeKind): string[] =>
  Object.entries(CHANNEL_NODE)
    .filter(([, v]) => v === k)
    .map(([tch]) => toNamespace(tch) ?? tch);

const modulesForNode = (k: NodeKind): string[] => RELEASE.modules.filter((m) => moduleNode(m.id) === k).map((m) => m.id);

/** 5종 표준 노드(owner_org·표준채널·부착 모듈) 투영 */
export function modulesToNodes(): (Node & { modules: string[] })[] {
  return (Object.keys(NODE_META) as NodeKind[]).map((k) => {
    const meta = NODE_META[k];
    return {
      nodeId: meta.id,
      kind: k,
      ownerOrg: meta.owner,
      label: meta.label,
      signals: channelsForNode(k),
      modules: modulesForNode(k),
    };
  });
}
