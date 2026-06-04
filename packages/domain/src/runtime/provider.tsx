"use client";
/* ============================================================
   AgentRuntimeProvider — Local Agent 면(AgentFacade)을 React 트리에 노출.
   기본 = 원격(RemoteAgentClient → ws://localhost:7101, 별 프로세스의 Local
   Agent app). NEXT_PUBLIC_AGENT_MODE=inproc 시 M4 인프로세스 시뮬 폴백
   (오프라인/CI). useAgent()/useAgentStatus() 노출.
   ============================================================ */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AgentFacade, ConnectionState } from "./agent-facade";
import { RemoteAgentClient } from "./remote-agent";
import { getRuntime, peekRuntime } from "./agent-runtime";
import { fleet } from "./fleet-manager";

const MODE: "remote" | "inproc" =
  process.env.NEXT_PUBLIC_AGENT_MODE === "inproc" ? "inproc" : "remote";
const AGENT_WS = process.env.NEXT_PUBLIC_AGENT_WS ?? "ws://localhost:7101";

export interface AgentStatus {
  mode: "remote" | "inproc";
  state: ConnectionState;
  agentId: string;
  endpoint: string;
}

const AgentContext = createContext<AgentFacade | null>(null);
const StatusContext = createContext<AgentStatus>({
  mode: MODE,
  state: "connecting",
  agentId: "",
  endpoint: MODE === "remote" ? AGENT_WS : "in-process",
});

// 원격 클라이언트 싱글톤(탭 수명 — 네비게이션마다 재연결 방지).
let remoteSingleton: RemoteAgentClient | undefined;
function getRemote(): RemoteAgentClient {
  if (!remoteSingleton) remoteSingleton = new RemoteAgentClient(AGENT_WS);
  return remoteSingleton;
}

export function AgentRuntimeProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentFacade | null>(() =>
    MODE === "remote" ? getRemote() : peekRuntime(),
  );
  const [status, setStatus] = useState<AgentStatus>(() => ({
    mode: MODE,
    state: "connecting",
    agentId: "",
    endpoint: MODE === "remote" ? AGENT_WS : "in-process",
  }));

  useEffect(() => {
    if (MODE === "remote") {
      const client = getRemote();
      setAgent(client);
      const sync = () =>
        setStatus({ mode: "remote", state: client.state, agentId: client.agentId, endpoint: client.endpoint });
      sync();
      return client.subscribeState(sync);
    }
    // inproc 폴백
    let alive = true;
    void getRuntime().then((a) => {
      if (!alive) return;
      setAgent(a);
      setStatus({ mode: "inproc", state: "connected", agentId: "NODE-AGENT-VIA", endpoint: "in-process" });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AgentContext.Provider value={agent}>
      <StatusContext.Provider value={status}>{children}</StatusContext.Provider>
    </AgentContext.Provider>
  );
}

/**
 * [SWC-FLEET / MVP-3] 로봇-스코프 provider — connection-scoped fan-in.
 * scope.robotId 의 Local Agent 연결(FleetManager)을 동일 AgentContext/StatusContext로
 * 제공 → 기존 hooks(useAgent/useSignals/…) 불변 소비. endpoint 없으면 offline.
 */
export function FleetAgentProvider({ robotId, children }: { robotId: string | null; children: ReactNode }) {
  const initEp = robotId ? fleet.endpointFor(robotId) : null;
  const [agent, setAgent] = useState<AgentFacade | null>(() => (robotId ? fleet.client(robotId) : null));
  const [status, setStatus] = useState<AgentStatus>(() => ({
    mode: "remote",
    state: initEp ? "connecting" : "disconnected",
    agentId: "",
    endpoint: robotId ? (initEp ?? "(no live agent · offline)") : "(no robot selected)",
  }));

  useEffect(() => {
    const c = robotId ? fleet.client(robotId) : null;
    setAgent(c);
    if (!c) {
      setStatus({ mode: "remote", state: "disconnected", agentId: "", endpoint: robotId ? "(no live agent · offline)" : "(no robot selected)" });
      return;
    }
    const sync = () => setStatus({ mode: "remote", state: c.state, agentId: c.agentId, endpoint: c.endpoint });
    sync();
    return c.subscribeState(sync);
  }, [robotId]);

  return (
    <AgentContext.Provider value={agent}>
      <StatusContext.Provider value={status}>{children}</StatusContext.Provider>
    </AgentContext.Provider>
  );
}

/** 라이브 에이전트 면(부팅/연결 전엔 null 또는 빈 미러). */
export function useAgent(): AgentFacade | null {
  return useContext(AgentContext);
}

/** 연결 상태(remote: ws 연결 / inproc: 부팅). */
export function useAgentStatus(): AgentStatus {
  return useContext(StatusContext);
}
