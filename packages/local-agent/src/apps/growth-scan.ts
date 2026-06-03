import type { AppManifest, CommandAck, CommandEnvelope } from "@station/contracts";
import manifestJson from "../../../contracts/examples/app.growth-scan.json";
import type { AppCommand, AppContext, WorkApp } from "../app-runtime";
import { mintObservation } from "../mint";

const now = (): string => new Date().toISOString();
const manifest = manifestJson as AppManifest;

/**
 * GrowthScanApp — 첫 작업 앱(station.app.growth-scan, ADR-016).
 * scan.start → 세션 open(SCN-*) + ACU 미션 + VPU capture(둘 다 게이트 경유) → executed.
 * aggregator 트리거 = crop.growth.ndvi 도착 → pose⊕crop⊕state 스냅샷 → GrowthObservation(OBS-*).
 * program 은 reference 에선 Agent-hosted(ACU-hosted 아님, G6).
 */
export class GrowthScanApp implements WorkApp {
  readonly manifest = manifest;

  #ctx!: AppContext;
  #session: string | undefined;
  #unsubNdvi: (() => void) | undefined;

  onLoad(ctx: AppContext): void {
    this.#ctx = ctx;
  }

  onUnload(): void {
    this.#stopAggregator();
    if (this.#session) {
      this.#ctx.observations.closeSession(this.#session);
      this.#session = undefined;
    }
  }

  commands(): AppCommand[] {
    const gateRefs = this.manifest.requires?.calibration ?? [];
    return [
      {
        verb: "scan.start",
        targetNodeKind: "AGENT",
        safetyClass: "guarded",
        requiredRole: "operator",
        gateRefs,
        handler: (cmd, ack) => this.#startScan(cmd, ack),
      },
      {
        verb: "scan.stop",
        targetNodeKind: "AGENT",
        safetyClass: "guarded",
        requiredRole: "operator",
        gateRefs,
        handler: (cmd, ack) => this.#stopScan(cmd, ack),
      },
    ];
  }

  async #startScan(cmd: CommandEnvelope, ack: (a: CommandAck) => void): Promise<void> {
    const scn = this.#ctx.observations.openSession();
    this.#session = scn;

    // aggregator 무장 — ndvi 프레임 도착마다 관측 합성.
    this.#unsubNdvi = this.#ctx.signals.subscribe((s) => {
      if (s.channel === "crop.growth.ndvi") this.#aggregate(scn, s.ts);
    });

    // 두 노드 명령을 게이트 경유로 디스패치(노드 직결 0). 하나라도 막히면 스캔 중단.
    let visionRejected = false;
    await this.#ctx.dispatch(
      {
        commandId: `CMD-${scn}-CAP`,
        verb: "vision.capture.start",
        target: { node: "VPU" },
        issuedBy: { role: "system", id: manifest.appId },
        issuedAt: now(),
      },
      (a) => {
        if (a.stage === "rejected") visionRejected = true;
      },
    );

    if (visionRejected) {
      this.#stopAggregator();
      this.#ctx.observations.closeSession(scn);
      this.#session = undefined;
      ack({
        commandId: cmd.commandId,
        stage: "rejected",
        ts: now(),
        code: "G-Dependency",
        detail: "vision.capture.start blocked",
      });
      return;
    }

    await this.#ctx.dispatch(
      {
        commandId: `CMD-${scn}-MIS`,
        verb: "autonomy.mission.start",
        target: { node: "ACU" },
        issuedBy: { role: "system", id: manifest.appId },
        issuedAt: now(),
      },
      () => {},
    );

    this.#ctx.events.publish({
      ts: now(),
      severity: "info",
      source: manifest.appId,
      code: "SCAN-OPEN",
      message: `scan session ${scn} open`,
    });
    ack({ commandId: cmd.commandId, stage: "executed", ts: now(), detail: scn });
  }

  #stopScan(cmd: CommandEnvelope, ack: (a: CommandAck) => void): void {
    const scn = this.#session;
    this.#stopAggregator();
    if (scn) {
      this.#ctx.observations.closeSession(scn);
      this.#session = undefined;
    }
    // capture/mission 정지(게이트 경유). 정지 명령은 ACK 무시(베스트에포트).
    void this.#ctx.dispatch(
      {
        commandId: `CMD-${scn ?? "NONE"}-CAPSTOP`,
        verb: "vision.capture.stop",
        target: { node: "VPU" },
        issuedBy: { role: "system", id: manifest.appId },
        issuedAt: now(),
      },
      () => {},
    );
    ack({ commandId: cmd.commandId, stage: "executed", ts: now(), detail: scn });
  }

  /** ndvi 프레임 순간 스냅샷 → GrowthObservation 1개 합성. */
  #aggregate(scn: string, ts: string): void {
    if (!this.#ctx.observations.isOpen(scn)) return;
    const num = (ch: string): number | undefined => {
      const s = this.#ctx.signals.latest(ch);
      return typeof s?.value === "number" ? s.value : undefined;
    };
    const x = num("machine.localization.pose.x");
    const y = num("machine.localization.pose.y");
    const theta = num("machine.localization.pose.theta");
    const pose =
      x !== undefined && y !== undefined && theta !== undefined ? { x, y, theta } : undefined;

    const ndviSig = this.#ctx.signals.latest("crop.growth.ndvi");
    const running = num("machine.autonomy.state") === 1;
    const quality: "good" | "warn" | "bad" =
      running && ndviSig?.quality === "good" ? "good" : "warn";

    this.#ctx.observations.addObservation({
      observationId: mintObservation(),
      scanSessionId: scn,
      ts,
      pose,
      crop: {
        plant_height: num("crop.growth.plant_height"),
        lai: num("crop.growth.lai"),
        ndvi: num("crop.growth.ndvi"),
      },
      quality,
    });
    this.#ctx.events.publish({
      ts: now(),
      severity: "info",
      source: manifest.appId,
      code: "OBS-COMPLETE",
      message: `GrowthObservation synthesized for ${scn}`,
    });
  }

  #stopAggregator(): void {
    this.#unsubNdvi?.();
    this.#unsubNdvi = undefined;
  }
}

export { manifest as growthScanManifest };
