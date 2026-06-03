import type { CommandEnvelope, ModuleManifest } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";

const now = (): string => new Date().toISOString();

/**
 * VPU mock — 비전 FPS 신호 + (스캔 중) 작물 생육 채널.
 * vision.capture.start → crop.growth.{plant_height,lai,ndvi} emit 시작 · stop → 중지.
 * requiredApps 에 station.app.growth-scan 선언(앱 파생 출처, Part G).
 */
export class VpuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "meta.node.vpu.v1",
    moduleType: "vpu",
    version: "v1",
    ownerOrg: "ORG-META",
    attachesToNode: "VPU",
    requiredApps: [{ id: "station.app.growth-scan", minVersion: "1.0.0" }],
    signals: ["machine.vision.fps", "crop.growth.plant_height", "crop.growth.lai", "crop.growth.ndvi"],
    commands: ["vision.capture.start", "vision.capture.stop", "vision.calibrate"],
  };
  #fpsTimer: ReturnType<typeof setInterval> | undefined;
  #scanTimer: ReturnType<typeof setInterval> | undefined;
  #ctx: SourceContext | undefined;
  #frame = 0;

  start(ctx: SourceContext): void {
    this.#ctx = ctx;
    this.#fpsTimer = setInterval(
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
    if (this.#fpsTimer) clearInterval(this.#fpsTimer);
    this.#stopScan();
    this.#fpsTimer = undefined;
    this.#ctx = undefined;
  }
  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    if (cmd.verb === "vision.capture.start") this.#startScan(ctx);
    if (cmd.verb === "vision.capture.stop") this.#stopScan();
    ctx.emitAck({ commandId: cmd.commandId, stage: "executed", ts: now() });
  }

  // 고정 mock(실 추론 아님) — 프레임마다 미세 변동만 줘 aggregator 흐름을 실증.
  #startScan(ctx: SourceContext): void {
    if (this.#scanTimer) return;
    this.#scanTimer = setInterval(() => {
      this.#frame += 1;
      const jitter = (this.#frame % 5) * 0.01;
      const emit = (channel: string, value: number, unit?: string): void =>
        ctx.emitSignal({ channel, value, unit, ts: now(), quality: "good", source: { node: "VPU" } });
      emit("crop.growth.plant_height", 1.42 + jitter, "m");
      emit("crop.growth.lai", 3.1 + jitter);
      emit("crop.growth.ndvi", 0.78 + jitter); // ndvi 가 aggregator 트리거 → 마지막에 emit
    }, 120);
  }
  #stopScan(): void {
    if (this.#scanTimer) clearInterval(this.#scanTimer);
    this.#scanTimer = undefined;
  }
}
