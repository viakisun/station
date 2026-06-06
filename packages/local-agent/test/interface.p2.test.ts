import { INTERFACES, ifpFor } from "@station/contracts";
import { HeartbeatMonitor, checkUplink } from "../src/index";
import { describe, expect, it } from "vitest";

describe("P2 — InterfaceSpec 레지스트리", () => {
  it("IF-P 가 노드 kind 로 조회되고 carries/notCarried/heartbeat 를 가진다", () => {
    const mcu = ifpFor("MCU");
    expect(mcu?.id).toBe("IF-P-MCU");
    expect(mcu?.carries?.commands).toContain("motion.stop");
    expect(mcu?.notCarried).toContain("machine.autonomy.*");
    expect(mcu?.heartbeat?.channel).toBe("machine.heartbeat.mcu");
    expect(Object.keys(INTERFACES).length).toBeGreaterThanOrEqual(15);
  });
});

describe("P2 — notCarried 가드", () => {
  it("MCU 가 autonomy.* 를 올리면 차단, motion 은 허용", () => {
    expect(checkUplink("MCU", "machine.motion.speed").ok).toBe(true);
    expect(checkUplink("MCU", "machine.autonomy.state").ok).toBe(false);
    expect(checkUplink("VPU", "machine.motion.speed").ok).toBe(false); // VPU 는 motion 금지
    expect(checkUplink("FCU", "anything").ok).toBe(true); // custom 노드 통과
  });
});

describe("P2 — HeartbeatMonitor (관대)", () => {
  it("heartbeat 무수신 timeoutMs 초과 → unhealthy", async () => {
    let clock = 1000;
    const health: Record<string, boolean> = {};
    const events: string[] = [];
    const mon = new HeartbeatMonitor(
      { setHealthy: (n, h) => (health[n] = h), emit: (_n, code) => events.push(code) },
      { now: () => clock },
    );
    mon.watch("MCU"); // timeoutMs=3000
    mon.observe("MCU", "machine.heartbeat.mcu"); // last=1000
    clock = 5000; // 1000 + 3000 초과
    mon.start(5);
    await new Promise((r) => setTimeout(r, 30)); // 한 틱 이상
    mon.stop();
    expect(health["MCU"]).toBe(false);
    expect(events).toContain("HEARTBEAT-LOST");
  });

  it("heartbeat 한 번도 없으면 감시 안 함(관대)", async () => {
    let clock = 1000;
    const health: Record<string, boolean> = {};
    const mon = new HeartbeatMonitor({ setHealthy: (n, h) => (health[n] = h), emit: () => {} }, { now: () => clock });
    mon.watch("MCU");
    clock = 999999;
    mon.start(5);
    await new Promise((r) => setTimeout(r, 30));
    mon.stop();
    expect(health["MCU"]).toBeUndefined(); // 미감시
  });
});
