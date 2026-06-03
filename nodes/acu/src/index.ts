import type { CommandEnvelope, ModuleManifest } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/** ACU mock — 경로 편차 신호(mm). autonomy.* 명령 처리(LPU pose·VPU 결과 소비는 Phase 3). */
export class AcuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "meta.node.acu.v1",
    moduleType: "acu",
    version: "v1",
    ownerOrg: "ORG-META",
    attachesToNode: "ACU",
    signals: ["machine.navigation.deviation"],
    commands: ["autonomy.mission.start", "autonomy.pause", "autonomy.slow_down"],
  };
  #timer: ReturnType<typeof setInterval> | undefined;

  start(ctx: SourceContext): void {
    this.#timer = setInterval(
      () =>
        ctx.emitSignal({
          channel: "machine.navigation.deviation",
          value: 12,
          unit: "mm",
          ts: now(),
          quality: "good",
          source: { node: "ACU" },
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
