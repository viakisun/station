import type { CommandEnvelope, ModuleManifest, Signal } from "@station/contracts";
import type { MockSource, SourceContext } from "@station/node-kit";
import { clamp, ramp, round } from "@station/node-kit/sim";

const now = (): string => new Date().toISOString();

/**
 * MCU — 결정적 하위제어 FSM(P3). 베어메탈/CAN 의 거동을 읽기 쉽게 재현.
 * state: idle → accel → running → decel → stopped (+ estop 래치).
 * 명령이 거동을 실제로 바꾼다 — set_speed_limit 상한 clamp, stop ramp→0.
 * 신호: machine.motion.speed(20Hz ramp) · machine.power.battery_voltage · machine.safety.estop ·
 *       machine.heartbeat.mcu(1Hz). 모두 IF-P-MCU carries.
 */
export class McuSource implements MockSource {
  readonly manifest: ModuleManifest = {
    manifestId: "age.node.mcu.v1",
    moduleType: "mcu",
    version: "v1",
    ownerOrg: "ORG-AGE",
    attachesToNode: "MCU",
    signals: ["machine.motion.speed", "machine.power.battery_voltage", "machine.safety.estop", "machine.heartbeat.mcu"],
    commands: ["motion.stop", "motion.set_speed_limit"],
  };

  #tick: ReturnType<typeof setInterval> | undefined;
  #hb: ReturnType<typeof setInterval> | undefined;
  #speed = 0; // m/s 현재
  #target = 1.2; // m/s 목표(cruise)
  #limit = 1.5; // m/s 상한(set_speed_limit)
  #estop = false;
  #battery = 24.0; // V

  start(ctx: SourceContext): void {
    const emit = (channel: string, value: number | boolean, unit?: string): void =>
      ctx.emitSignal({ channel, value, unit, ts: now(), quality: "good", source: { node: "MCU" } } as Signal);

    this.#tick = setInterval(() => {
      const goal = this.#estop ? 0 : Math.min(this.#target, this.#limit);
      this.#speed = round(ramp(this.#speed, goal, 0.08)); // 가/감속 ramp
      this.#battery = round(clamp(this.#battery - 0.0005, 21, 24), 2); // 완만 방전
      emit("machine.motion.speed", this.#speed, "m/s");
    }, 50);

    this.#hb = setInterval(() => {
      emit("machine.heartbeat.mcu", 1);
      emit("machine.power.battery_voltage", this.#battery, "V");
      emit("machine.safety.estop", this.#estop);
    }, 1000);
  }

  stop(): void {
    if (this.#tick) clearInterval(this.#tick);
    if (this.#hb) clearInterval(this.#hb);
    this.#tick = this.#hb = undefined;
  }

  onCommand(cmd: CommandEnvelope, ctx: SourceContext): void {
    const ack = (stage: "executed" | "rejected", detail?: string): void =>
      ctx.emitAck({ commandId: cmd.commandId, stage, ts: now(), detail });

    if (cmd.verb === "motion.set_speed_limit") {
      const v = Number(cmd.args?.limit ?? cmd.args?.value ?? this.#limit);
      if (!Number.isFinite(v) || v < 0) return ack("rejected", "invalid limit");
      this.#limit = clamp(v, 0, 3);
      return ack("executed", `limit=${this.#limit} m/s`);
    }
    if (cmd.verb === "motion.stop") {
      this.#target = 0; // ramp→0
      return ack("executed", "stopping");
    }
    ack("rejected", `unknown verb ${cmd.verb}`);
  }
}
