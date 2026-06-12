/* ============================================================
   local-agent browser-safe 진입점 — wire/ws-hub(Node 전용 ws) 제외.
   인프로세스(loopback) 토폴로지로 브라우저에서 Reference Local Agent 를
   그대로 구동하기 위한 엔트리. transport-adapter·serve 는 node-kit 을
   type-only 로만 참조(빌드 시 erase)하므로 ws 누출 없음.
   index.ts(Node barrel)·run*.ts·테스트는 불변 — 본 파일은 가산.
   ============================================================ */
export * from "./signal-store";
export * from "./event-bus";
export * from "./node-registry";
export * from "./command-router";
export * from "./command-catalog";
export * from "./observation-store";
export * from "./app-runtime";
export * from "./mint";
export * from "./apps/growth-scan";
export * from "./local-agent";
export * from "./conformance";
export * from "./conformance-runner"; // runConformance — 브라우저 실행(타입-only 임포트뿐)
export * from "./interface-guard"; // checkUplink·isDeclared — IF-P 검사(contracts 만 의존)
export * from "./policy-engine"; // PolicyEngine — 안전규칙 평가(타입-only)
export { MockMcuNode } from "./nodes/mock-mcu";
export * from "./wire/transport-adapter";
export * from "./wire/serve";
export * from "./wire/hmi-protocol"; // 순수 타입(browser-safe) — RemoteAgentClient 가 소비
// 제외: ./wire/ws-hub, ./wire/hmi-hub (import ... from "ws" — Node 전용)
