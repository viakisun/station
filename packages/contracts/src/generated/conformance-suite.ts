/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * F7 적합성 스위트 — 노드가 선언 계약대로 동작하는지 실행 검사 정의. conformance-runner 가 노드를 부팅→verb 주입→ACK 체인·신호 emit·SLA 대조→리포트.
 */
export interface ConformanceSuite {
  /**
   * 예 TS-MCU
   */
  id: string;
  /**
   * 노드 kind. MCU·VPU·LPU·ACU
   */
  node: string;
  /**
   * 기대 ProtocolProfile id
   */
  protocolRef?: string;
  /**
   * 부팅 후 windowMs 내 emit 되어야 하는 채널
   */
  expectSignals: string[];
  /**
   * 주입 시 executed ACK 가 와야 하는 verb
   */
  expectCommands: string[];
  /**
   * 신호 관측 창(기본 1500)
   */
  windowMs?: number;
  /**
   * 명령 executed 까지 허용(기본 1000)
   */
  maxAckMs?: number;
}
