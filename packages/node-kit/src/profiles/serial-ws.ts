import type { ProtocolProfile } from "@station/contracts";
import type { WireMsg } from "../transport";
import { type ProtocolModel, type TransportFrame, msgChannel, wireBytes } from "./model";

/* ============================================================
   SERIAL(RS-232/485) 과 WS — 단순 매체.
   SERIAL: 반이중, baud 율로 바이트 지연. 작은 프레임. at_most_once.
   WS    : 현 구현의 기준선(신뢰·저지연). 단편화 없음.
   ============================================================ */

const BAUD = 115200; // RS-485 기본
const SERIAL_BYTES_PER_MS = BAUD / 10 / 1000; // 10 bit/byte(8N1) → bytes/ms

export class SerialModel implements ProtocolModel {
  constructor(readonly profile: ProtocolProfile) {}
  encode(msg: WireMsg): { frames: TransportFrame[]; appBytes: number; topic: string; qos: string } {
    const appBytes = wireBytes(msg);
    return { frames: [{ seq: 0, total: 1, bytes: appBytes }], appBytes, topic: `serial://${this.profile.id}`, qos: "at_most_once" };
  }
  latencyMs(appBytes: number, rng: () => number): number {
    return +(appBytes / SERIAL_BYTES_PER_MS + rng() * 0.5).toFixed(3);
  }
  lossProb(): number {
    return 0.008;
  }
  maxRetries(): number {
    return 0;
  }
}

export class WsModel implements ProtocolModel {
  constructor(readonly profile: ProtocolProfile) {}
  encode(msg: WireMsg): { frames: TransportFrame[]; appBytes: number; topic: string; qos: string } {
    const appBytes = wireBytes(msg);
    return { frames: [{ seq: 0, total: 1, bytes: appBytes }], appBytes, topic: `ws:${msgChannel(msg) ?? msg.t}`, qos: "reliable (TCP)" };
  }
  latencyMs(_appBytes: number, rng: () => number): number {
    return +(0.2 + rng() * 0.3).toFixed(3);
  }
  lossProb(): number {
    return 0;
  }
  maxRetries(): number {
    return 0;
  }
}
