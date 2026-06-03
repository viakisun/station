import type {
  CommandAck,
  CommandEnvelope,
  Event,
  ModuleManifest,
  Signal,
} from "@station/contracts";
import type { GrowthObservation } from "../observation-store";

/* ============================================================
   HMI 옵저버 프로토콜 (IF-L-HMI-AGG · station-field-os §11) — 순수 타입.
   노드↔Agent 의 WireMsg 와 별개. HMI/관제(원격 웹)가 Local Agent 에
   접속해 실시간 신호·ACK·이벤트·관측을 구독하고 명령을 발행하는 면.
   browser-safe(ws 무관) — Node HmiHub 와 브라우저 RemoteAgentClient 가 공유.
   ============================================================ */

/** agent → hmi (상향 스트림). */
export type HmiServerMsg =
  | {
      t: "snapshot";
      nodes: ModuleManifest[];
      signals: Signal[];
      events: Event[];
      observations: GrowthObservation[];
      agentId: string;
    }
  | { t: "signal"; s: Signal }
  | { t: "event"; e: Event }
  | { t: "observation"; o: GrowthObservation }
  | { t: "ack"; a: CommandAck };

/** hmi → agent (하향 명령). */
export type HmiClientMsg = { t: "command"; c: CommandEnvelope };
