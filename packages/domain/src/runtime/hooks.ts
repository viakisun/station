"use client";
/* ============================================================
   런타임 React hooks — 라이브 SignalStore·EventBus·ObservationStore·
   CommandRouter 를 구독해 React state 로 투영. unmount 시 unsub.
   신호는 고빈도(노드 100~200ms)라 ref 버퍼 + 250ms flush 로 스로틀.
   ============================================================ */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CommandAck, CommandEnvelope, Event, Signal } from "@station/contracts";
import type { GrowthObservation } from "@station/local-agent/browser";
import { useAgent, useAgentStatus } from "./provider";

/** 노드 종류별 표시 메타(런타임 manifest 스냅샷). */
export interface RuntimeNode {
  nodeId: string;
  kind: string;
  ownerOrg: string;
  label: string;
  signals: string[];
  commands: string[];
}

/**
 * 노드들의 manifest 스냅샷. remote 의 경우 manifest 는 연결 후 snapshot 으로
 * 도착하므로(클라이언트 identity 는 불변) status.state·agentId 변화에 재계산한다.
 */
export function useNodes(): RuntimeNode[] {
  const agent = useAgent();
  const status = useAgentStatus();
  return useMemo(() => {
    if (!agent) return [];
    return agent.manifests().map((m) => ({
      nodeId: `NODE-${m.attachesToNode}-${m.ownerOrg.replace("ORG-", "")}`,
      kind: m.attachesToNode,
      ownerOrg: m.ownerOrg,
      label: m.moduleType.toUpperCase(),
      signals: m.signals ?? [],
      commands: m.commands ?? [],
    }));
    // status.state/agentId 가 snapshot 도착(연결) 시 바뀌어 재계산을 트리거.
  }, [agent, status.state, status.agentId]);
}

/** 채널별 최신 Signal 맵(250ms 스로틀). */
export function useSignals(): Record<string, Signal> {
  const agent = useAgent();
  const [signals, setSignals] = useState<Record<string, Signal>>({});
  const buf = useRef<Record<string, Signal>>({});
  const dirty = useRef(false);

  useEffect(() => {
    if (!agent) return;
    // 현재 latest 시드
    for (const c of agent.signals.channels()) {
      const s = agent.signals.latest(c.channel);
      if (s) buf.current[c.channel] = s;
    }
    setSignals({ ...buf.current });

    const unsub = agent.signals.subscribe((s) => {
      buf.current[s.channel] = s;
      dirty.current = true;
    });
    const flush = setInterval(() => {
      if (!dirty.current) return;
      dirty.current = false;
      setSignals({ ...buf.current });
    }, 250);
    return () => {
      unsub();
      clearInterval(flush);
    };
  }, [agent]);

  return signals;
}

/** 최근 이벤트(신규가 앞). */
export function useEvents(max = 60): Event[] {
  const agent = useAgent();
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    if (!agent) return;
    setEvents(agent.events.recent(max).slice().reverse());
    const unsub = agent.events.subscribe({}, (e) => setEvents((prev) => [e, ...prev].slice(0, max)));
    return unsub;
  }, [agent, max]);
  return events;
}

/** 합성된 GrowthObservation(신규가 앞). */
export function useObservations(max = 50): GrowthObservation[] {
  const agent = useAgent();
  const [obs, setObs] = useState<GrowthObservation[]>([]);
  useEffect(() => {
    if (!agent) return;
    const unsub = agent.observations.subscribe((o) => setObs((prev) => [o, ...prev].slice(0, max)));
    return unsub;
  }, [agent, max]);
  return obs;
}

/** 게이트 경유 명령 디스패치(노드 직결 0). */
export function useDispatch(): (cmd: CommandEnvelope, onAck: (a: CommandAck) => void) => void {
  const agent = useAgent();
  return useCallback(
    (cmd: CommandEnvelope, onAck: (a: CommandAck) => void) => {
      if (!agent) return;
      void agent.commands.dispatch(cmd, onAck);
    },
    [agent],
  );
}
