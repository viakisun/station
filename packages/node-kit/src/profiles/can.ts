import type { ProtocolProfile, WireBinding } from "@station/contracts";
import type { WireMsg } from "../transport";
import { type ProtocolModel, type TransportFrame, msgChannel, wireBytes } from "./model";
import { entryFor, payloadBytes } from "./binding";

/* ============================================================
   CAN 2.0B (MCU — 모터/엔코더/E-stop, 500kbps, 베어메탈).
   · 데이터 프레임 = 8 바이트. 큰 페이로드는 ISO-TP 멀티프레임으로 단편화
     (First Frame 6B + Consecutive 7B). → JSON 200B 가 ~30 프레임이 되는 게
     "MCU는 JSON 말고 바이너리" 라는 레퍼런스 교훈으로 그대로 드러난다.
   · 토픽 없음 → 29-bit 확장 arbitration ID(J1939 톤). 우선순위=ID.
   · 종단 ACK 없음(프레임 ACK 비트만) → at_most_once, 재시도 0.
   · 지연 = 프레임당 ~130µs(500kbps, 비트스터핑) + 중재 지터. 서브-ms.
   ============================================================ */

const FRAME_DATA = 8; // 바이트/프레임
const FIRST_FRAME = 6; // ISO-TP First Frame 데이터 바이트
const CONSEC_FRAME = 7; // ISO-TP Consecutive Frame 데이터 바이트
const PER_FRAME_MS = 0.13; // 500kbps 기준 한 프레임(스터핑 포함) 전송시간

/** 채널/verb 를 안정적 29-bit ID 로 해시 → 0x18FFxxYY 형태. */
function arbitrationId(label: string | undefined): string {
  let h = 0;
  for (const ch of label ?? "?") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pgn = (h & 0xffff).toString(16).padStart(4, "0").toUpperCase();
  return `0x18FF${pgn}`; // priority 6, EDP/DP 0, PF 0xFF (proprietary)
}

function frameCount(bytes: number): number {
  if (bytes <= FRAME_DATA) return 1; // Single Frame
  return 1 + Math.ceil((bytes - FIRST_FRAME) / CONSEC_FRAME); // FF + CFs
}

export class CanModel implements ProtocolModel {
  constructor(
    readonly profile: ProtocolProfile,
    private readonly binding?: WireBinding,
  ) {}

  encode(msg: WireMsg): { frames: TransportFrame[]; appBytes: number; topic: string; qos: string } {
    // 바인딩 있으면 선언된 frameId + 바이트 레이아웃(바이너리 ≤8B → 단일 프레임).
    const entry = entryFor(this.binding, msg);
    if (entry?.frameId) {
      const appBytes = payloadBytes(entry);
      const total = frameCount(appBytes);
      const frames: TransportFrame[] = Array.from({ length: total }, (_, i) => ({ seq: i, total, bytes: Math.min(i === 0 ? FRAME_DATA : CONSEC_FRAME, appBytes - i * CONSEC_FRAME) }));
      return { frames, appBytes, topic: entry.frameId, qos: "at_most_once (no E2E ack)" };
    }
    // 폴백: 바인딩 없으면 JSON 휴리스틱(레퍼런스 대비용 — 큰 프레임 수).
    const appBytes = wireBytes(msg);
    const total = frameCount(appBytes);
    const frames: TransportFrame[] = [];
    let left = appBytes;
    for (let i = 0; i < total; i++) {
      const cap = i === 0 ? (total === 1 ? FRAME_DATA : FIRST_FRAME) : CONSEC_FRAME;
      const b = Math.min(cap, left);
      frames.push({ seq: i, total, bytes: b });
      left -= b;
    }
    return { frames, appBytes, topic: arbitrationId(msgChannel(msg)), qos: "at_most_once (no E2E ack)" };
  }

  latencyMs(appBytes: number, rng: () => number): number {
    const frames = frameCount(appBytes);
    const jitter = rng() * 0.4; // 중재 대기 지터
    return +(frames * PER_FRAME_MS + jitter).toFixed(3);
  }

  lossProb(): number {
    return 0.005; // 0.5% 버스 에러/충돌 손실(프레임 ACK 실패)
  }

  maxRetries(): number {
    return 0; // 브로드캐스트 fire-and-forget
  }
}
