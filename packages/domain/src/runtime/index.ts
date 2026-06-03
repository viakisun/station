/* ============================================================
   @station/domain/runtime — 라이브 Local Agent 클라이언트(브라우저, "use client").
   SSR-safe 동기 selectors(@station/domain 의 ".")와 분리된 서브패스.
   ============================================================ */
export { AgentRuntimeProvider, useAgent } from "./provider";
export { getRuntime, peekRuntime, teardownRuntime } from "./agent-runtime";
export {
  useNodes,
  useSignals,
  useEvents,
  useObservations,
  useDispatch,
  type RuntimeNode,
} from "./hooks";
