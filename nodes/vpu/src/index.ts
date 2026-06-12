import type { CommandEnvelope, ModuleManifest, Signal } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";
import { round } from "@station/node-kit/sim";

const now = (): string => new Date().toISOString();

/**
 * VPU — 비전 FSM(P3). idle → scanning. capture.start/stop 으로 스캔 토글, vision.calibrate 처리.
 * 신호: machine.vision.{fps,framedrop,worker_detected} + (스캔 중) crop.growth.* +
 *       machine.heartbeat.vpu. worker_detected 는 안전정책(P4) 입력.
 * 보정 게이팅은 Agent App 레벨(requires.calibration)이 담당 — 노드는 캘 명령만 수행.
 * 주: crop.growth.* 는 형식상 앱 제공이나, 본 시뮬은 VPU 가 직접 emit 해 growth-scan 폐루프 실증.
 */
export class VpuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "meta.node.vpu.v1",
    moduleType: "vpu",
    version: "v1",
    ownerOrg: "ORG-META",
    attachesToNode: "VPU",
    requiredApps: [{ id: "station.app.growth-scan", minVersion: "1.0.0" }],
    signals: [
      "machine.vision.fps",
      "machine.vision.framedrop",
      "machine.vision.worker_detected",
      "crop.growth.plant_height",
      "crop.growth.lai",
      "crop.growth.ndvi",
      "machine.heartbeat.vpu",
    ],
    commands: ["vision.capture.start", "vision.capture.stop", "vision.calibrate"],
  };

  #fps: ReturnType<typeof setInterval> | undefined;
  #scan: ReturnType<typeof setInterval> | undefined;
  #hb: ReturnType<typeof setInterval> | undefined;
  #ctx: SourceContext | undefined;
  #frame = 0;
  #scanning = false;

  #emit = (channel: string, value: number | boolean, quality: "good" | "warn" = "good", unit?: string): void =>
    this.#ctx?.emitSignal({ channel, value, unit, ts: now(), quality, source: { node: "VPU" } } as Signal);

  start(ctx: SourceContext): void {
    this.#ctx = ctx;
    this.#fps = setInterval(() => {
      this.#emit("machine.vision.fps", 29.6, "good", "fps");
      this.#emit("machine.vision.framedrop", 0);
      this.#emit("machine.vision.worker_detected", false); // 안전: 기본 미감지
    }, 200);
    this.#hb = setInterval(() => this.#emit("machine.heartbeat.vpu", 1), 1000);
  }

  stop(): void {
    for (const t of [this.#fps, this.#scan, this.#hb]) if (t) clearInterval(t);
    this.#fps = this.#scan = this.#hb = undefined;
    this.#scanning = false;
    this.#ctx = undefined;
  }

  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    const ack = (stage: "executed" | "rejected", detail?: string): void =>
      ctx.emitAck({ commandId: cmd.commandId, stage, ts: now(), detail });

    if (cmd.verb === "vision.calibrate") {
      return ack("executed", "calibrated (NIR+RGB)"); // 보정 수행
    }
    if (cmd.verb === "vision.capture.start") {
      this.#startScan();
      return ack("executed", "scanning");
    }
    if (cmd.verb === "vision.capture.stop") {
      this.#stopScan();
      return ack("executed", "stopped");
    }
    ack("rejected", `unknown verb ${cmd.verb}`);
  }

  #startScan(): void {
    if (this.#scan) return;
    this.#scanning = true;
    this.#scan = setInterval(() => {
      this.#frame += 1;
      // 세션 경과에 따른 결정적 성장 곡선(상수 아님) — frame 으로 천천히 증가.
      const g = Math.min(1, this.#frame / 120);
      this.#emit("crop.growth.plant_height", round(1.35 + g * 0.2), "good", "m");
      this.#emit("crop.growth.lai", round(2.8 + g * 0.6), "good");
      this.#emit("crop.growth.ndvi", round(0.74 + g * 0.12), "good"); // ndvi 가 aggregator 트리거(마지막)
    }, 120);
  }
  #stopScan(): void {
    if (this.#scan) clearInterval(this.#scan);
    this.#scan = undefined;
    this.#scanning = false;
  }
}
