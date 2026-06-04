/* ============================================================
   @station/domain/runtime — Local Agent 클라이언트(브라우저, "use client").
   기본 = 원격(RemoteAgentClient, WS) · 폴백 = 인프로세스 시뮬(M4).
   SSR-safe 동기 selectors(@station/domain 의 ".")와 분리된 서브패스.
   ============================================================ */
export { AgentRuntimeProvider, FleetAgentProvider, useAgent, useAgentStatus, type AgentStatus } from "./provider";
export { fleet } from "./fleet-manager";
export { getRuntime, peekRuntime, teardownRuntime } from "./agent-runtime";
export { RemoteAgentClient } from "./remote-agent";
export type { AgentFacade, ConnectionState } from "./agent-facade";
export {
  useNodes,
  useSignals,
  useEvents,
  useObservations,
  useDispatch,
  type RuntimeNode,
} from "./hooks";
