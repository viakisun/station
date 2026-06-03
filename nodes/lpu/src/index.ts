import type { CommandEnvelope, ModuleManifest } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/**
 * LPU mock — 측위 confidence(0–1) + pose. localization.relocalize 명령 처리.
 * pose 는 Signal.value 가 scalar 라 pose.{x,y,theta} 서브채널로 분해 emit(aggregator 가 결합).
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
    ],
    commands: ["localization.relocalize"],
  };
  #timer: ReturnType<typeof setInterval> | undefined;
  #t = 0;

  start(ctx: SourceContext): void {
    this.#timer = setInterval(() => {
      this.#t += 1;
      const emit = (channel: string, value: number, unit?: string): void =>
        ctx.emitSignal({ channel, value, ts: now(), quality: "good", unit, source: { node: "LPU" } });
      emit("machine.localization.confidence", 0.92);
      // 직선 주행 mock — x 가 천천히 전진, y·theta 미세 변동.
      emit("machine.localization.pose.x", 0.5 + this.#t * 0.05, "m");
      emit("machine.localization.pose.y", 1.2, "m");
      emit("machine.localization.pose.theta", 0.01, "rad");
    }, 100);
  }
  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = undefined;
  }
  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    ctx.emitAck({ commandId: cmd.commandId, stage: "executed", ts: now() });
  }
}
