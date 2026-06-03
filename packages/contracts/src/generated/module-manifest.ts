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
  attachesToNode: "MCU" | "VPU" | "ACU" | "Telemetry" | "LPU";
  controller?: {
    kind?: "MCU" | "VPU" | "ACU";
    model?: string;
  };
  protocol?: {
    transport: "MQTT" | "ROS2" | "DDS";
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
   * App Runtime(인포테인먼트 런처)가 보장해야 할 모듈 앱
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
