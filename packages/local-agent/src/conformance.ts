import type { Node } from "@station/contracts";
import { isId } from "@station/contracts";

export interface ConformanceIssue {
  nodeId: string;
  kind: "signal" | "command" | "protocol";
  detail: string;
}

/** 기대 protocolRef (Part F IF-P 시트, spec-canonical). */
export const EXPECTED_PROTOCOL: Record<string, string> = {
  MCU: "PRT-CAN-v1",
  LPU: "PRT-DDS-v1",
  VPU: "PRT-ROS-v1",
  ACU: "PRT-DDS-v1",
  Telemetry: "PRT-MQTT-v2",
};

/**
 * F7 conformance — 노드 선언이 계약/IF-P 시트와 정합하는지 검사.
 * signals·commands 는 표준 NS(채널 문법), protocolRef 는 기대값과 대조.
 * (현재 examples/node.*.json 의 stale protocolRef 가 Annex E 불일치로 드러난다.)
 */
export function checkNodeConformance(node: Node): ConformanceIssue[] {
  const issues: ConformanceIssue[] = [];
  for (const ch of node.signals ?? []) {
    if (!isId("channel", ch)) {
      issues.push({ nodeId: node.nodeId, kind: "signal", detail: `invalid channel NS: ${ch}` });
    }
  }
  for (const verb of node.commands ?? []) {
    if (!isId("channel", verb)) {
      issues.push({ nodeId: node.nodeId, kind: "command", detail: `invalid verb NS: ${verb}` });
    }
  }
  const expected = EXPECTED_PROTOCOL[node.kind];
  if (expected && node.protocolRef && node.protocolRef !== expected) {
    issues.push({
      nodeId: node.nodeId,
      kind: "protocol",
      detail: `protocolRef ${node.protocolRef} ≠ expected ${expected} (Annex E)`,
    });
  }
  return issues;
}
