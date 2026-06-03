/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 작업 앱(station.app.*)의 매니페스트. Software-Defined Work Layer(Part G G1)의 정형화 — 모듈/노드 requiredApps[].id가 가리키는 대상. 앱은 작업 로직을 선언·제공하되 플랫폼 권한을 갖지 않는다(명령은 CommandCatalog 등록 후 evaluateGate를 통과해야 실행, 앱 선언 safety는 비신뢰).
 */
export interface AppManifest {
  /**
   * platform 네임스페이스 식별자. 예 station.app.growth-scan
   */
  appId: string;
  /**
   * semver. 버전은 식별자가 아니라 매니페스트에.
   */
  version: string;
  /**
   * 작업 유형
   */
  appType: "control" | "calibration" | "scan" | "aggregate";
  /**
   * 공급 벤더(멀티벤더 추적)
   */
  ownerOrg: string;
  /**
   * 호환 범위(semver range)
   */
  compatibility?: {
    platform?: string;
    contracts?: string;
    runtime?: string;
  };
  /**
   * resolving 입력 — 필요 노드·모듈·보정·계약
   */
  requires?: {
    /**
     * 필요 NodeKind. 예 VPU·LPU·ACU
     */
    nodes?: string[];
    /**
     * 필요 ModuleManifest.manifestId
     */
    modules?: string[];
    /**
     * 필요 보정. 예 CAL-VPU-NIR
     */
    calibration?: string[];
    contracts?: string[];
  };
  /**
   * 앱이 가산하는 verb·channel·관측
   */
  provides?: {
    /**
     * 추가 명령 verb. CommandCatalog 등록 대상(G3.5)
     */
    commands?: string[];
    signals?: string[];
    /**
     * 예 GrowthObservation(OBS-*)
     */
    observations?: string[];
  };
  /**
   * 3rd-party 샌드박스 — 앱이 접근 가능한 범위
   */
  permissions?: {
    commands?: string[];
    signals?: string[];
  };
  /**
   * 앱 선언(참고값 — 플랫폼이 재판단). 최종 판단은 Platform Policy.
   */
  safety?: {
    class?: "none" | "guarded" | "safety_critical";
    requiresGate?: boolean;
  };
  /**
   * 미션 program 위치·번들 참조
   */
  program?: {
    /**
     * (개방형) 권장 Agent·ACU·VPU
     */
    runsOn?: string;
    ref?: string;
  };
  /**
   * 관측 합성기(Agent측, 선택)
   */
  aggregator?: {
    ref?: string;
    produces?: string;
  };
  /**
   * Operator Interaction Face — PanelDescriptor.panelId 참조(panel-host 계약). 선택.
   */
  panel?: string;
  /**
   * 배포-오케스트레이션 힌트(선택·후속)
   */
  resources?: {
    cpu?: string;
    gpu?: string;
    storage?: string;
  };
  conformance?: {
    suite?: string;
    version?: string;
  };
}
