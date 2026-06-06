import type { CommandEnvelope, ModuleManifest, Signal } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";
import { clamp, round } from "@station/node-kit";

const now = (): string => new Date().toISOString();

// autonomy.state 코드값. Signal.value 가 scalar 라 enum 을 코드로.
const STATE = { idle: 0, running: 1, paused: 2 } as const;

/**
 * ACU — 미션 FSM(P3). idle → running → paused. slow_down 으로 속도계수↓(deviation·progress 영향).
 * 명령: autonomy.mission.start(→running) · autonomy.pause(→paused) · autonomy.slow_down(계수↓).
 * 신호: machine.autonomy.{state,mode} · machine.navigation.deviation(결정적 진동) · heartbeat.
 * 금지: 하위 노드 직접제어 — 반드시 Agent 경유(IF-P-ACU notCarried = motion/vision).
 */
export class AcuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "meta.node.acu.v1",
    moduleType: "acu",
    version: "v1",
    ownerOrg: "ORG-META",
    attachesToNode: "ACU",
    signals: ["machine.autonomy.state", "machine.autonomy.mode", "machine.navigation.deviation", "machine.heartbeat.acu"],
    commands: ["autonomy.mission.start", "autonomy.pause", "autonomy.slow_down"],
  };

  #timer: ReturnType<typeof setInterval> | undefined;
  #hb: ReturnType<typeof setInterval> | undefined;
  #state: number = STATE.idle;
  #speedFactor = 1; // slow_down 으로 감소(1 → 0.5 → …)
  #t = 0;
  #ctx: SourceContext | undefined;

  #emit = (channel: string, value: number, unit?: string): void =>
    this.#ctx?.emitSignal({ channel, value, unit, ts: now(), quality: "good", source: { node: "ACU" } } as Signal);

  start(ctx: SourceContext): void {
    this.#ctx = ctx;
    this.#timer = setInterval(() => {
      this.#t += 1;
      // running 일 때만 경로편차 진동(speedFactor 가 진폭·진행 영향).
      const dev = this.#state === STATE.running ? round(Math.sin(this.#t * 0.12) * 18 * this.#speedFactor + 4) : 0;
      this.#emit("machine.navigation.deviation", dev, "mm");
      this.#emit("machine.autonomy.state", this.#state);
      this.#emit("machine.autonomy.mode", this.#speedFactor < 1 ? 2 : 1); // 1=normal · 2=slow
    }, 100);
    this.#hb = setInterval(() => this.#emit("machine.heartbeat.acu", 1), 1000);
  }

  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    if (this.#hb) clearInterval(this.#hb);
    this.#timer = this.#hb = undefined;
    this.#ctx = undefined;
  }

  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    const ack = (stage: "executed" | "rejected", detail?: string): void =>
      ctx.emitAck({ commandId: cmd.commandId, stage, ts: now(), detail });

    if (cmd.verb === "autonomy.mission.start") {
      this.#state = STATE.running;
      this.#speedFactor = 1;
      return ack("executed", "mission running");
    }
    if (cmd.verb === "autonomy.pause") {
      this.#state = STATE.paused;
      return ack("executed", "paused");
    }
    if (cmd.verb === "autonomy.slow_down") {
      this.#speedFactor = clamp(round(this.#speedFactor * 0.5, 2), 0.25, 1);
      return ack("executed", `speedFactor=${this.#speedFactor}`);
    }
    ack("rejected", `unknown verb ${cmd.verb}`);
  }
}
