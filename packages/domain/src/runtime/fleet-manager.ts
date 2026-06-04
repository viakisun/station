"use client";
/* ============================================================
   [SWC-FLEET / MVP-3] connection-scoped 멀티 에이전트 fan-in.
   1 로봇 = 1 Local Agent = 1 RemoteAgentClient. "어느 로봇"=어느 연결.
   CommandEnvelope 불변(robot_id 미주입) — robot 스코프는 연결 단위(ADR-019).
   데모: 한 로봇만 실 endpoint(실행 중 start:agent), 나머지는 offline(mock).
   TODO(SWT-FLEET-002): 실 endpoint directory(cloud lookup)로 교체.
   ============================================================ */
import { RemoteAgentClient } from "./remote-agent";

const DEFAULT_WS = process.env.NEXT_PUBLIC_AGENT_WS ?? "ws://localhost:7101";

// robot → WS endpoint. 데모는 RBT-THIN-0001 한 대만 라이브, 나머지 null(offline).
const ENDPOINTS: Record<string, string> = {
  "RBT-THIN-0001": DEFAULT_WS,
};

class FleetManager {
  #clients = new Map<string, RemoteAgentClient>();

  endpointFor(robotId: string): string | null {
    return ENDPOINTS[robotId] ?? null;
  }

  /** 로봇의 라이브 클라이언트(endpoint 없으면 null = offline/mock). lazy + 캐시. */
  client(robotId: string): RemoteAgentClient | null {
    const ep = this.endpointFor(robotId);
    if (!ep) return null;
    let c = this.#clients.get(robotId);
    if (!c) {
      c = new RemoteAgentClient(ep);
      this.#clients.set(robotId, c);
    }
    return c;
  }
}

export const fleet = new FleetManager();
