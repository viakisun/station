/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 런타임 명령 1 인스턴스. HMI/관제 → Local Agent CommandRouter → 대상 노드.
 */
export interface CommandEnvelope {
  /**
   * 예 CMD-WKS-20260601-00045-0007
   */
  commandId: string;
  verb: string;
  target: {
    node: "MCU" | "VPU" | "ACU" | "Telemetry" | "LPU";
    /**
     * 예 MOD-EE-PINCH (선택)
     */
    module?: string;
  };
  /**
   * 예 WKS-20260601-00045
   */
  workSessionId?: string;
  issuedBy: {
    role: "operator" | "manager" | "maintainer" | "system";
    id?: string;
  };
  issuedAt: string;
  args?: {
    [k: string]: number | string | boolean;
  };
  ack?: "at_least_once" | "exactly_once" | "at_most_once";
  timeoutMs?: number;
  safety?: "none" | "guarded" | "safety_critical";
}
