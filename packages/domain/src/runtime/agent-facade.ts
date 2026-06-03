import type {
  CommandAck,
  CommandEnvelope,
  Event,
  ModuleManifest,
  Signal,
  SignalChannel,
} from "@station/contracts";
import type { GrowthObservation } from "@station/local-agent/browser";

/* ============================================================
   AgentFacade — hooks/UI 가 소비하는 최소 면. in-process ReferenceLocalAgent
   와 원격 RemoteAgentClient(WS) 가 둘 다 구조적으로 만족한다 → seam 교체 시
   hooks·UI 불변. (M4 인프로세스 ↔ M5 원격 모니터링)
   ============================================================ */
export type ConnectionState = "connecting" | "connected" | "disconnected";

export interface AgentFacade {
  manifests(): ModuleManifest[];
  readonly signals: {
    latest(channel: string): Signal | undefined;
    channels(): SignalChannel[];
    subscribe(cb: (s: Signal) => void): () => void;
  };
  readonly events: {
    recent(n: number): Event[];
    subscribe(
      filter: Partial<Pick<Event, "source" | "code" | "severity">>,
      cb: (e: Event) => void,
    ): () => void;
  };
  readonly observations: {
    subscribe(cb: (o: GrowthObservation) => void): () => void;
  };
  readonly commands: {
    dispatch(cmd: CommandEnvelope, onAck: (a: CommandAck) => void): Promise<CommandAck> | void;
  };
}
