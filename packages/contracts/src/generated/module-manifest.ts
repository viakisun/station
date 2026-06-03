/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 작업모듈/노드 산출물의 단일 매니페스트. 어느 기관(owner_org)이 만들었고 어느 노드에 붙으며 어떤 신호/명령/계약을 갖는지 선언한다. release.ts auditArtifacts의 manifest.json 슬롯을 형식화.
 */
export interface ModuleManifest {
  /**
   * 기관 스코프 ID. 예 meta.module.manipulator.v1, age.node.mcu.v1
   */
  manifestId: string;
  /**
   * 예 manipulator, thinning_ee, vision_cam
   */
  moduleType: string;
  version: string;
  ownerOrg: string;
  /**
   * 기존 목업 벤더명 정합(선택)
   */
  vendorAlias?: string;
  /**
   * 기존 MOD-* 매핑(선택). 예 MOD-ARM-A2
   */
  legacyModuleId?: string;
  /**
   * (개방형 노드종류 — 권장 MCU·VPU·ACU·Telemetry·LPU + custom 허용)
   */
  attachesToNode: string;
  controller?: {
    /**
     * (개방형 노드종류 — 권장 MCU·VPU·ACU + custom 허용)
     */
    kind?: string;
    model?: string;
  };
  protocol?: {
    transport: "MQTT" | "ROS2" | "DDS" | "CAN" | "SERIAL" | "WS";
    /**
     * ProtocolProfile.id
     */
    profileRef: string;
  };
  requiredDriver?: {
    id: string;
    minVersion: string;
  };
  /**
   * 이 모듈이 요구하는 작업 앱(station.app.*). App Runtime이 부팅·모듈 교체 시 derive·로드한다(Part G). id는 AppManifest.appId를 가리킴.
   */
  requiredApps?: {
    id: string;
    minVersion: string;
  }[];
  /**
   * 표준 채널 NS 이름 목록
   */
  signals?: string[];
  /**
   * 명령 verb 목록
   */
  commands?: string[];
  calibration?: {
    req: string;
    cadence: string;
  }[];
  /**
   * 예 FW-EEP-3.1.0
   */
  firmwareRef?: string;
  conformance?: {
    suite?: string;
    passRate?: number;
  };
}
