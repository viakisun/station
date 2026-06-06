/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * Local Agent App aggregator가 합성하는 관측(OBS-*). SignalStore가 latest-value 면이라면 이쪽은 append-only 관측 면. growth-scan이 첫 구현(GrowthObservation). 후속 앱은 obsType 으로 분기.
 */
export interface Observation {
  /**
   * OBS-YYYYMMDD-NNNN
   */
  observationId: string;
  /**
   * SCN-YYYYMMDD-NNNN — 소속 스캔 세션
   */
  scanSessionId: string;
  ts: string;
  /**
   * 관측 종류. 앱이 합성한 관측 모델 식별. 예 growth
   */
  obsType: "growth";
  quality: "good" | "warn" | "bad";
  /**
   * 관측 시점 로봇 pose(LPU). pose 서브채널 결합.
   */
  pose?: {
    x?: number;
    y?: number;
    theta?: number;
  };
  /**
   * growth 관측 페이로드(VPU 생육분석).
   */
  crop?: {
    plant_height?: number;
    lai?: number;
    ndvi?: number;
  };
}
