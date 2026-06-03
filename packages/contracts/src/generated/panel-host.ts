/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * HMI panel-host 계약(Part G G8 / Annex E8 갭 정형화). 작업 앱·모듈이 제공하는 운영자 패널(Operator Interaction Face)이 어느 벤더 HMI 셸에도 렌더되도록 하는 host-agnostic 디스크립터. 패널은 Agent API(IF-L-HMI-AGG)만 통해 데이터를 구독하고 명령은 evaluateGate를 경유한다 — 게이트 우회·노드 직결 불가.
 */
export interface PanelDescriptor {
  /**
   * 패널 식별자. 예 panel.growth-scan
   */
  panelId: string;
  /**
   * 이 패널을 제공하는 앱(모듈 제공 시 생략 가능)
   */
  ownerAppId?: string;
  title: string;
  /**
   * host 셸 마운트 위치 — 고정 셸 영역(E2.1)
   */
  slot: "work" | "status" | "modal" | "sidebar";
  /**
   * panel-host 계약 버전(semver)
   */
  apiVersion: string;
  /**
   * 요구 최소 HMI 셸 버전(멀티벤더 HMI 호환)
   */
  minHostVersion?: string;
  /**
   * host가 패널을 로드하는 방식 — 셸 종류와 무관하게 해석 가능해야 한다
   */
  entry: {
    kind: "webview" | "native" | "declarative";
    /**
     * 번들/URL/선언 스펙 참조
     */
    ref: string;
  };
  /**
   * 패널이 구독하는 신호/관측 — Agent aggregate(read-only) 경유
   */
  dataBindings?: {
    /**
     * channel NS 또는 observation. 예 crop.growth.ndvi · OBS-*
     */
    source: string;
    as?: string;
  }[];
  /**
   * 패널이 발신 가능한 verb — 전부 evaluateGate 경유(노드 직결 0)
   */
  commands?: string[];
  /**
   * 샌드박스 — 패널이 접근 가능한 범위
   */
  permissions?: {
    signals?: string[];
    commands?: string[];
  };
}
