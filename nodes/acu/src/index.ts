import type { CommandEnvelope, ModuleManifest } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/**
 * ACU mock — 경로 편차(mm) + 자율주행 상태. autonomy.* 명령 처리.
 * machine.autonomy.state: 0=idle · 1=running. autonomy.mission.start → running.
 * (state 는 enum 이지만 Signal.value 가 scalar 라 코드값으로 emit.)
 */
export class AcuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "meta.node.acu.v1",
    moduleType: "acu",
    version: "v1",
    ownerOrg: "ORG-META",
    attachesToNode: "ACU",
    signals: ["machine.navigation.deviation", "machine.autonomy.state"],
    commands: ["autonomy.mission.start", "autonomy.pause", "autonomy.slow_down"],
  };
  #timer: ReturnType<typeof setInterval> | undefined;
  #state = 0; // 0 idle · 1 running

  start(ctx: SourceContext): void {
    this.#timer = setInterval(() => {
      ctx.emitSignal({
        channel: "machine.navigation.deviation",
        value: 12,
        unit: "mm",
        ts: now(),
        quality: "good",
        source: { node: "ACU" },
      });
      ctx.emitSignal({
        channel: "machine.autonomy.state",
        value: this.#state,
        ts: now(),
        quality: "good",
        source: { node: "ACU" },
      });
    }, 100);
  }
  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = undefined;
    this.#state = 0;
  }
  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    if (cmd.verb === "autonomy.mission.start") this.#state = 1;
    if (cmd.verb === "autonomy.pause") this.#state = 0;
    ctx.emitAck({ commandId: cmd.commandId, stage: "executed", ts: now() });
  }
}
