import type { CommandEnvelope, ModuleManifest, Signal } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();
const speed = (v: number): Signal => ({
  channel: "machine.motion.speed",
  value: v,
  unit: "m/s",
  ts: now(),
  quality: "good",
  source: { node: "MCU" },
});

/** MCU mock — 구동 속도 신호(20Hz). motion.stop 시 정지(0). */
export class McuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "age.node.mcu.v1",
    moduleType: "mcu",
    version: "v1",
    ownerOrg: "ORG-AGE",
    attachesToNode: "MCU",
    signals: ["machine.motion.speed"],
    commands: ["motion.stop", "motion.set_speed_limit"],
  };
  #timer: ReturnType<typeof setInterval> | undefined;

  start(ctx: SourceContext): void {
    this.#timer = setInterval(() => ctx.emitSignal(speed(1.2)), 50);
  }
  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = undefined;
  }
  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    if (cmd.verb === "motion.stop") {
      if (this.#timer) clearInterval(this.#timer);
      this.#timer = undefined;
      ctx.emitSignal(speed(0));
    }
    ctx.emitAck({ commandId: cmd.commandId, stage: "executed", ts: now() });
  }
}
