import { ifpFor } from "@station/contracts";

/* ============================================================
   HeartbeatMonitor — IF-P heartbeat 기반 생존 판정.
   노드가 IF-P.heartbeat.channel 로 주기 신호를 올리면 살아있음. periodMs 후 timeoutMs
   초과 무수신 → setHealthy(false)+이벤트(현재는 연결 종료로만 판정). 회복 시 healthy.
   관대 모드: heartbeat 를 한 번도 안 보낸 노드는 감시 안 함(P3 전 미적용 — 데모 비파괴).
   ============================================================ */

export interface HeartbeatSink {
  setHealthy(node: string, healthy: boolean): void;
  emit(node: string, code: string, message: string): void;
}

interface Watch {
  node: string;
  channel: string;
  timeoutMs: number;
  lastTs?: number; // 첫 heartbeat 전엔 undefined → 감시 안 함
  healthy: boolean;
}

export class HeartbeatMonitor {
  #watches = new Map<string, Watch>(); // node → watch
  #timer: ReturnType<typeof setInterval> | undefined;
  #now: () => number;

  constructor(
    private readonly sink: HeartbeatSink,
    opts: { now?: () => number } = {},
  ) {
    this.#now = opts.now ?? (() => Date.now());
  }

  /** 노드 등록 시 IF-P.heartbeat 가 있으면 감시 대상에 추가. */
  watch(node: string): void {
    const hb = ifpFor(node)?.heartbeat;
    if (hb) this.#watches.set(node, { node, channel: hb.channel, timeoutMs: hb.timeoutMs, healthy: true });
  }

  /** 노드 신호 1건 관측 — heartbeat 채널이면 타임스탬프 갱신(+회복). */
  observe(node: string, channel: string): void {
    const w = this.#watches.get(node);
    if (!w || channel !== w.channel) return;
    w.lastTs = this.#now();
    if (!w.healthy) {
      w.healthy = true;
      this.sink.setHealthy(node, true);
      this.sink.emit(node, "HEARTBEAT-RECOVER", `${node} heartbeat 회복`);
    }
  }

  start(intervalMs = 500): void {
    this.#timer = setInterval(() => this.#check(), intervalMs);
  }
  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = undefined;
  }

  #check(): void {
    const t = this.#now();
    for (const w of this.#watches.values()) {
      if (w.lastTs === undefined) continue; // 아직 heartbeat 없음 → 미감시(관대)
      if (w.healthy && t - w.lastTs > w.timeoutMs) {
        w.healthy = false;
        this.sink.setHealthy(w.node, false);
        this.sink.emit(w.node, "HEARTBEAT-LOST", `${w.node} heartbeat ${t - w.lastTs}ms 무수신 → unhealthy`);
      }
    }
  }
}
