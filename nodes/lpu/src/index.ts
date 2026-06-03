import type { CommandEnvelope, ModuleManifest } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/** LPU mock — 측위 confidence 신호(0–1). localization.relocalize 명령 처리. */
export class LpuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "daedong.node.lpu.v1",
    moduleType: "lpu",
    version: "v1",
    ownerOrg: "ORG-DAEDONG",
    attachesToNode: "LPU",
    signals: ["machine.localization.confidence"],
    commands: ["localization.relocalize"],
  };
  #timer: ReturnType<typeof setInterval> | undefined;

  start(ctx: SourceContext): void {
    this.#timer = setInterval(
      () =>
        ctx.emitSignal({
          channel: "machine.localization.confidence",
          value: 0.92,
          ts: now(),
          quality: "good",
          source: { node: "LPU" },
        }),
      100,
    );
  }
  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = undefined;
  }
  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    ctx.emitAck({ commandId: cmd.commandId, stage: "executed", ts: now() });
  }
}
