import type { Signal, SignalChannel } from "@station/contracts";
import type { SignalStore } from "@station/contracts/runtime";

/**
 * Step1 — SignalStore. 채널별 최신값(latest-value) 저장 + 구독 fan-out.
 * 노드가 발행한 Signal을 흡수해 HMI/관제가 표준 NS로 구독하게 한다(IF-L-HMI-AGG).
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
