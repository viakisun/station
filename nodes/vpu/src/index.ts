import type { CommandEnvelope, ModuleManifest } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/** VPU mock — 비전 FPS 신호. vision.capture.* 명령 처리. */
export class VpuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "meta.node.vpu.v1",
    moduleType: "vpu",
    version: "v1",
    ownerOrg: "ORG-META",
    attachesToNode: "VPU",
    signals: ["machine.vision.fps"],
    commands: ["vision.capture.start", "vision.capture.stop", "vision.calibrate"],
  };
  #timer: ReturnType<typeof setInterval> | undefined;

  start(ctx: SourceContext): void {
    this.#timer = setInterval(
      () =>
        ctx.emitSignal({
          channel: "machine.vision.fps",
          value: 29.6,
          unit: "fps",
          ts: now(),
          quality: "good",
          source: { node: "VPU" },
        }),
      200,
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
