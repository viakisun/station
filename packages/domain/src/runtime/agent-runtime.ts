"use client";
/* ============================================================
   인프로세스 런타임 부트스트랩 (M4) — 브라우저 안에서 실제 Reference Local
   Agent + mock 노드(loopback)를 구동한다. ws 없음(browser 서브패스만 사용).
   목업 UI 가 Math.random 대신 이 라이브 런타임을 구독한다.

   [영속화 seam] 노드 데이터는 현재 mock(VpuSource 등 setInterval).
   향후: mock 노드를 Real* 소스 또는 WsHub 분산 토폴로지로 교체(NodeAdapter
   추상화 유지 → UI 코드 변경 0). 관측/신호 이력의 DB·JSON 영속화는
   observation-store.ts·signal-store.ts 의 seam 참조.
   ============================================================ */
import {
  createLocalAgent,
  serveTransport,
  AppRuntime,
  type ReferenceLocalAgent,
} from "@station/local-agent/browser";
import { createLoopbackPair, NodeHost } from "@station/node-kit/browser";
import { McuSource } from "@station/node-mcu";
import { VpuSource } from "@station/node-vpu";
import { LpuSource } from "@station/node-lpu";
import { AcuSource } from "@station/node-acu";

const SEED_CALIBRATIONS = ["CAL-VPU-NIR", "CAL-VPU-RGB"]; // growth-scan gating 충족

interface Runtime {
  agent: ReferenceLocalAgent;
  teardown: () => Promise<void>;
}

let singleton: Runtime | undefined;
let booting: Promise<ReferenceLocalAgent> | undefined;

/** 이미 부팅된 런타임을 동기 반환(없으면 null). Provider 초기값용. */
export function peekRuntime(): ReferenceLocalAgent | null {
  return singleton?.agent ?? null;
}

/**
 * 런타임 1회 부팅(브라우저 탭 수명 동안 싱글톤). 노드 합류 → growth-scan active.
 * StrictMode 이중 마운트에도 1회만 부팅(booting 가드).
 */
export async function getRuntime(): Promise<ReferenceLocalAgent> {
  if (singleton) return singleton.agent;
  if (booting) return booting;

  booting = (async () => {
    const agent = createLocalAgent({ calibrations: SEED_CALIBRATIONS });
    await agent.start(); // 허브 먼저 → 노드는 동적 합류(즉시 healthy)
    const hosts: NodeHost[] = [];
    for (const source of [new McuSource(), new VpuSource(), new LpuSource(), new AcuSource()]) {
      const { nodeEnd, agentEnd } = createLoopbackPair();
      serveTransport(agent, agentEnd); // hello → register
      const host = new NodeHost(source, nodeEnd);
      hosts.push(host);
      await host.start();
    }
    // 노드 안정 후 requiredApps derive → growth-scan 로드/active.
    const appIds = AppRuntime.deriveRequiredApps(agent.manifests());
    await agent.apps.deriveAndLoad(appIds);

    singleton = {
      agent,
      teardown: async () => {
        for (const h of hosts) await h.stop();
        await agent.stop();
        singleton = undefined;
        booting = undefined;
      },
    };
    return agent;
  })();

  return booting;
}

/** 명시 종료(보통 미사용 — 싱글톤은 탭 수명 동안 유지). */
export async function teardownRuntime(): Promise<void> {
  await singleton?.teardown();
}
