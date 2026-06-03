/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 로봇 한 종류 = 노드 + 작업모듈 + 표준계약의 조합 선언. STATION Field OS의 핵심 일반화: 어떤 로봇이든 Blueprint 하나로 정의된다(온실 thin/pinch, 물류 AMR, 방제 드론 모두 동일 틀). robot-agnostic core.
 */
export interface RobotBlueprint {
  /**
   * 예 blueprint.greenhouse-thin, blueprint.spray-drone
   */
  blueprintId: string;
  /**
   * 로봇 분류. 예 greenhouse-thinning-robot, delivery-amr, spray-drone
   */
  robotClass: string;
  label: string;
  description?: string;
  /**
   * 인스턴스 프로파일(도메인). 예 greenhouse. core(robot-agnostic)와 분리.
   */
  profile?: string;
  /**
   * 이 로봇을 구성하는 컴퓨트 노드. kind 는 권장 표준(MCU/VPU/ACU/Telemetry/LPU) + custom 개방형.
   */
  nodes: {
    /**
     * 노드 종류(개방형). 권장: MCU·VPU·ACU·Telemetry·LPU, 그 외 custom 허용
     */
    kind: string;
    ownerOrg: string;
    role?: string;
  }[];
  /**
   * 노드에 부착되는 작업모듈(ModuleManifest 참조)
   */
  modules?: {
    /**
     * ModuleManifest.manifestId. 예 meta.module.manipulator.v1
     */
    manifestRef: string;
    /**
     * 부착 노드 종류
     */
    attachesToNode: string;
  }[];
  /**
   * 이 로봇이 의존하는 표준 계약명. 예 Signal, Command, Event, Calibration
   */
  requiredContracts?: string[];
}
