/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 노드/모듈의 통신 계약(구 mockups2 ProtocolProfileMock 승격). 노드 어댑터가 이 프로파일로 transport를 흡수.
 */
export interface ProtocolProfile {
  /**
   * 예 PRT-MQTT-v2
   */
  id: string;
  transport: "MQTT" | "ROS2" | "DDS" | "CAN" | "SERIAL" | "WS";
  topics?: {
    dir: "cmd" | "telemetry" | "event";
    topic: string;
    payload: string;
  }[];
  ack?: "at_least_once" | "exactly_once" | "at_most_once";
  timeout?: string;
  /**
   * 예 TLS · X.509
   */
  security?: string;
  /**
   * 샘플 메시지(예시)
   */
  sample?: string;
}
