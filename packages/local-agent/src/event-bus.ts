import type { Event } from "@station/contracts";
import type { EventBus } from "@station/contracts/runtime";

type EventFilter = Partial<Pick<Event, "source" | "code" | "severity">>;

/**
 * Step1 — EventBus. Event 발행 + {source·code·severity} 필터 구독 + 최근 이력(ring).
 */
export class InMemoryEventBus implements EventBus {
  #ring: Event[] = [];
  readonly #max = 200;
  #subs = new Set<{ filter: EventFilter; cb: (e: Event) => void }>();

  publish(e: Event): void {
    this.#ring.push(e);
    if (this.#ring.length > this.#max) this.#ring.shift();
    for (const { filter, cb } of this.#subs) {
      if (this.#match(filter, e)) cb(e);
    }
  }

  subscribe(filter: EventFilter, cb: (e: Event) => void): () => void {
    const entry = { filter, cb };
    this.#subs.add(entry);
    return () => {
      this.#subs.delete(entry);
    };
  }

  recent(n: number): Event[] {
    return this.#ring.slice(-n);
  }

  #match(f: EventFilter, e: Event): boolean {
    return (
      (f.source === undefined || f.source === e.source) &&
      (f.code === undefined || f.code === e.code) &&
      (f.severity === undefined || f.severity === e.severity)
    );
  }
}
