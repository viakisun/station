/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * Part F ICD 를 1급 객체로. IF-P(물리 spoke 노드↔Agent) · IF-L(논리 데이터 provider↔consumer) · IF-X(외부/클라우드 경계). carries(나르는 채널/verb/event) + notCarried(금지) + heartbeat 를 코드로 강제.
 */
export interface InterfaceSpec {
  /**
   * 예 IF-P-MCU · IF-L-HMI-AGG · IF-X-OTA
   */
  id: string;
  class: "IF-P" | "IF-L" | "IF-X";
  /**
   * 공급측. 노드 kind(MCU…) · Agent · App · Cloud · HMI
   */
  provider: string;
  /**
   * 소비측
   */
  consumer: string;
  transport?: "MQTT" | "ROS2" | "DDS" | "CAN" | "SERIAL" | "WS" | "REST";
  /**
   * WireBinding.interfaceId(IF-P 페이로드 IDL)
   */
  bindingRef?: string;
  /**
   * 이 인터페이스가 나르는 것. carries ⊆ provider 노드 manifest 로 교차검증.
   */
  carries?: {
    signals?: string[];
    commands?: string[];
    events?: string[];
  };
  /**
   * 이 인터페이스로 *보내선 안 되는* 채널/verb 접두(glob). 예 MCU 는 autonomy.* 금지. 런타임 가드가 강제.
   */
  notCarried?: string[];
  /**
   * 노드 생존 신호. periodMs 내 무수신 timeoutMs 초과 → unhealthy.
   */
  heartbeat?: {
    channel: string;
    periodMs: number;
    timeoutMs: number;
  };
  note?: string;
}
