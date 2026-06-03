import { mintScan } from "./mint";

/**
 * GrowthObservation — growth-scan 앱 aggregator가 합성하는 관측(OBS-*).
 * pose(LPU)·crop(VPU)·quality(autonomy state ⊕ signal quality) 를 한 표본으로 결합.
 * pose 는 Signal.value 가 scalar(number|boolean)라 LPU가 pose.{x,y,theta} 서브채널로 emit → 여기서 결합.
 */
export interface GrowthObservation {
  observationId: string; // OBS-*
  scanSessionId: string; // SCN-*
  ts: string;
  pose?: { x: number; y: number; theta: number };
  crop: { plant_height?: number; lai?: number; ndvi?: number };
  quality: "good" | "warn" | "bad";
}

/**
 * ObservationStore — 스캔 세션을 열고(SCN-*) 관측(OBS-*)을 누적·구독.
 * SignalStore 가 latest-value 면이라면 이쪽은 append-only 관측 면.
 */
export interface ObservationStore {
  /** 새 스캔 세션 열기 → SCN-*. */
  openSession(): string;
  /** 세션 종료(이후 addObservation 은 거부). */
  closeSession(scn: string): void;
  /** 세션이 열려 있는지. */
  isOpen(scn: string): boolean;
  addObservation(o: GrowthObservation): void;
  latest(): GrowthObservation | undefined;
  bySession(scn: string): GrowthObservation[];
  subscribe(cb: (o: GrowthObservation) => void): () => void;
}

export class InMemoryObservationStore implements ObservationStore {
  #open = new Set<string>();
  #observations: GrowthObservation[] = [];
  #subs = new Set<(o: GrowthObservation) => void>();

  openSession(): string {
    const scn = mintScan();
    this.#open.add(scn);
    return scn;
  }

  closeSession(scn: string): void {
    this.#open.delete(scn);
  }

  isOpen(scn: string): boolean {
    return this.#open.has(scn);
  }

  addObservation(o: GrowthObservation): void {
    if (!this.#open.has(o.scanSessionId)) {
      throw new Error(`addObservation: session ${o.scanSessionId} not open`);
    }
    this.#observations.push(o);
    for (const cb of this.#subs) cb(o);
  }

  latest(): GrowthObservation | undefined {
    return this.#observations.at(-1);
  }

  bySession(scn: string): GrowthObservation[] {
    return this.#observations.filter((o) => o.scanSessionId === scn);
  }

  subscribe(cb: (o: GrowthObservation) => void): () => void {
    this.#subs.add(cb);
    return () => {
      this.#subs.delete(cb);
    };
  }
}
