import type { TransportTrace } from "@station/node-kit";

/* ============================================================
   TransportMonitor — ProfiledTransport 트레이스를 모아 매체별 롤업 +
   최근 트레이스 링버퍼로 노출. 콘솔 표(run-rig)와 웹 시각화(S3)가 공유.
   ============================================================ */

export interface TransportRollup {
  profileId: string;
  transport: TransportTrace["transport"];
  node: string; // 프로파일 → 노드 라벨
  msgs: number; // 전송 시도(메시지)
  frames: number; // 누적 매체 프레임
  appBytes: number; // 누적 앱 바이트
  dropped: number; // 손실 확정 수
  retries: number; // 누적 재시도
  avgLatencyMs: number; // 평균 모델 지연
  lastChannel?: string;
}

export class TransportMonitor {
  #roll = new Map<string, TransportRollup & { _latSum: number }>();
  #ring: TransportTrace[] = [];
  #cap: number;
  #nodeOf: (profileId: string) => string;

  constructor(opts: { ring?: number; nodeOf?: (profileId: string) => string } = {}) {
    this.#cap = opts.ring ?? 200;
    this.#nodeOf = opts.nodeOf ?? ((p) => p);
  }

  record = (t: TransportTrace): void => {
    const key = t.profileId;
    let r = this.#roll.get(key);
    if (!r) {
      r = {
        profileId: t.profileId,
        transport: t.transport,
        node: this.#nodeOf(t.profileId),
        msgs: 0,
        frames: 0,
        appBytes: 0,
        dropped: 0,
        retries: 0,
        avgLatencyMs: 0,
        _latSum: 0,
      };
      this.#roll.set(key, r);
    }
    r.msgs++;
    r.frames += t.frames;
    r.appBytes += t.appBytes;
    if (!t.delivered) r.dropped++;
    r.retries += t.retries;
    r._latSum += t.latencyMs;
    r.avgLatencyMs = +(r._latSum / r.msgs).toFixed(3);
    r.lastChannel = t.channel;

    this.#ring.push(t);
    if (this.#ring.length > this.#cap) this.#ring.shift();
  };

  rollups(): TransportRollup[] {
    return [...this.#roll.values()]
      .map(({ _latSum, ...r }) => r)
      .sort((a, b) => a.transport.localeCompare(b.transport));
  }

  recent(n = 30): TransportTrace[] {
    return this.#ring.slice(-n);
  }

  /** 콘솔 1줄 표 행. */
  table(): string {
    const head = "  node      transport  msgs  frames  KB     drop  avgLat";
    const rows = this.rollups().map((r) => {
      const kb = (r.appBytes / 1024).toFixed(1);
      const dropPct = r.msgs ? ((r.dropped / r.msgs) * 100).toFixed(1) : "0.0";
      return `  ${r.node.padEnd(9)} ${r.transport.padEnd(9)} ${String(r.msgs).padStart(4)}  ${String(r.frames).padStart(6)}  ${kb.padStart(5)}  ${dropPct.padStart(4)}%  ${r.avgLatencyMs.toFixed(2).padStart(6)}ms`;
    });
    return [head, ...rows].join("\n");
  }
}
