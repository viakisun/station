import type { CommandEnvelope, ModuleManifest, Signal } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";
import { clamp, mulberry32, ramp, round } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/**
 * LPU — 측위 FSM(P3). 웨이포인트 경로를 따라 pose 진행(직선 아님) + confidence 곡선.
 * localization.relocalize → pose 리셋 + confidence 급락 후 회복 ramp. 시드 rng 로 결정적 드리프트.
 * 신호: machine.localization.{confidence,pose.x,pose.y,pose.theta,map_match} + heartbeat.
 */
export class LpuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "daedong.node.lpu.v1",
    moduleType: "lpu",
    version: "v1",
    ownerOrg: "ORG-DAEDONG",
    attachesToNode: "LPU",
    signals: [
      "machine.localization.confidence",
      "machine.localization.pose.x",
      "machine.localization.pose.y",
      "machine.localization.pose.theta",
      "machine.localization.map_match",
      "machine.heartbeat.lpu",
    ],
    commands: ["localization.relocalize"],
  };

  #timer: ReturnType<typeof setInterval> | undefined;
  #hb: ReturnType<typeof setInterval> | undefined;
  #t = 0;
  #conf = 0.92;
  #confTarget = 0.92;
  #rng = mulberry32(42); // 결정적 시드
  #ctx: SourceContext | undefined;

  #emit = (channel: string, value: number, unit?: string): void =>
    this.#ctx?.emitSignal({ channel, value, unit, ts: now(), quality: "good", source: { node: "LPU" } } as Signal);

  start(ctx: SourceContext): void {
    this.#ctx = ctx;
    this.#timer = setInterval(() => {
      this.#t += 1;
      // 경로: x 전진 + y 사인 곡선(이랑 따라감) + heading. 시드 드리프트.
      const drift = (this.#rng() - 0.5) * 0.004;
      const x = round(0.5 + this.#t * 0.03);
      const y = round(1.2 + Math.sin(this.#t * 0.06) * 0.25 + drift);
      const theta = round(Math.cos(this.#t * 0.06) * 0.12);
      this.#conf = round(ramp(this.#conf, this.#confTarget, 0.02), 3); // 회복 ramp
      this.#emit("machine.localization.confidence", this.#conf);
      this.#emit("machine.localization.pose.x", x, "m");
      this.#emit("machine.localization.pose.y", y, "m");
      this.#emit("machine.localization.pose.theta", theta, "rad");
      this.#emit("machine.localization.map_match", round(clamp(this.#conf - 0.03, 0, 1)));
    }, 100);
    this.#hb = setInterval(() => this.#emit("machine.heartbeat.lpu", 1), 1000);
  }

  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    if (this.#hb) clearInterval(this.#hb);
    this.#timer = this.#hb = undefined;
    this.#ctx = undefined;
  }

  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    if (cmd.verb === "localization.relocalize") {
      this.#t = 0; // pose 리셋
      this.#conf = 0.4; // 급락
      this.#confTarget = 0.92; // 이후 회복
      return ctx.emitAck({ commandId: cmd.commandId, stage: "executed", ts: now(), detail: "relocalized — confidence recovering" });
    }
    ctx.emitAck({ commandId: cmd.commandId, stage: "rejected", ts: now(), detail: `unknown verb ${cmd.verb}` });
  }
}
