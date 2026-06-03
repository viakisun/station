import type { Signal, SignalChannel } from "@station/contracts";
import type { SignalStore } from "@station/contracts/runtime";

/**
 * Step1 — SignalStore. 채널별 최신값(latest-value) 저장 + 구독 fan-out.
 * 노드가 발행한 Signal을 흡수해 HMI/관제가 표준 NS로 구독하게 한다(IF-L-HMI-AGG).
 *
 * [영속화 seam] latest-value 캐시(#latest)는 본질상 in-memory 로 유지하되,
 * 이력(시계열)이 필요하면 write() 에 time-series 싱크를 가산:
 *   write(s) → { this.#latest.set(...); fanout; tsdb.append(s) }  // 예: SQLite/Influx/.jsonl
 * 라이브 면(latest/subscribe)은 불변, 이력 조회만 별도 Repository 로.
 */
export class InMemorySignalStore implements SignalStore {
  #latest = new Map<string, Signal>();
  #subs = new Set<(s: Signal) => void>();

  write(s: Signal): void {
    this.#latest.set(s.channel, s);
    for (const cb of this.#subs) cb(s);
  }

  latest(channel: string): Signal | undefined {
    return this.#latest.get(channel);
  }

  channels(): SignalChannel[] {
    return [...this.#latest.values()].map((s) => ({
      channel: s.channel,
      label: s.channel,
      unit: s.unit ?? "",
      node: s.source?.node,
    }));
  }

  subscribe(cb: (s: Signal) => void): () => void {
    this.#subs.add(cb);
    return () => {
      this.#subs.delete(cb);
    };
  }
}
