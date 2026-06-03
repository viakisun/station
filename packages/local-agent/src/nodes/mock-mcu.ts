import type { CommandAck, CommandEnvelope, Event, ModuleManifest, Signal } from "@station/contracts";
import type { NodeAdapter } from "@station/contracts/runtime";

const now = (): string => new Date().toISOString();

/**
 * Mock MCU 노드 (NodeAdapter). MockSource ⟂ transport — M1은 in-process(전송 없음).
 * start: machine.motion.speed 를 20Hz 로 발행. send(motion.stop): 정지(0)·executed ack.
 * Phase 2에서 같은 NodeAdapter를 transport-backed 로 교체(코드 재작성 아님).
 */
export class MockMcuNode implements NodeAdapter {
  readonly manifest: ModuleManifest = {
    manifestId: "age.node.mcu.v1",
    moduleType: "mcu",
    version: "v1",
    ownerOrg: "ORG-AGE",
    attachesToNode: "MCU",
    signals: ["machine.motion.speed"],
    commands: ["motion.stop", "motion.set_speed_limit"],
  };

  #sig = new Set<(s: Signal) => void>();
  #evt = new Set<(e: Event) => void>();
  #ack = new Set<(a: CommandAck) => void>();
  #timer: ReturnType<typeof setInterval> | undefined;

  async start(): Promise<void> {
    this.#timer = setInterval(() => {
      const s: Signal = {
        channel: "machine.motion.speed",
        value: 1.2,
        unit: "m/s",
        ts: now(),
        quality: "good",
        source: { node: "MCU", rawKey: "wheel_rpm", hex: "0x21" },
      };
      for (const cb of this.#sig) cb(s);
    }, 50);
  }

  async stop(): Promise<void> {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = undefined;
  }

  onSignal(cb: (s: Signal) => void): () => void {
    this.#sig.add(cb);
    return () => this.#sig.delete(cb);
  }
  onEvent(cb: (e: Event) => void): () => void {
    this.#evt.add(cb);
    return () => this.#evt.delete(cb);
  }
  onAck(cb: (a: CommandAck) => void): () => void {
    this.#ack.add(cb);
    return () => this.#ack.delete(cb);
  }

  async send(cmd: CommandEnvelope): Promise<void> {
    if (cmd.verb === "motion.stop") {
      // 모터 정지 모사: 발행 중단 + 최종 0 신호
      if (this.#timer) clearInterval(this.#timer);
      this.#timer = undefined;
      const stopped: Signal = {
        channel: "machine.motion.speed",
        value: 0,
        unit: "m/s",
        ts: now(),
        quality: "good",
        source: { node: "MCU" },
      };
      for (const cb of this.#sig) cb(stopped);
    }
    for (const cb of this.#ack) cb({ commandId: cmd.commandId, stage: "executed", ts: now() });
  }
}
