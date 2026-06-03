"use client";
/* ============================================================
   AgentRuntimeProvider — 라이브 Local Agent 를 React 트리에 노출.
   mount 시 인프로세스 런타임을 부팅(싱글톤)하고 useAgent()로 제공.
   싱글톤은 탭 수명 동안 유지(StrictMode 이중 마운트에 teardown 안 함).
   ============================================================ */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ReferenceLocalAgent } from "@station/local-agent/browser";
import { getRuntime, peekRuntime } from "./agent-runtime";

const AgentContext = createContext<ReferenceLocalAgent | null>(null);

export function AgentRuntimeProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<ReferenceLocalAgent | null>(() => peekRuntime());

  useEffect(() => {
    let alive = true;
    void getRuntime().then((a) => {
      if (alive) setAgent(a);
    });
    return () => {
      alive = false;
    };
  }, []);

  return <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>;
}

/** 라이브 에이전트(부팅 전엔 null). */
export function useAgent(): ReferenceLocalAgent | null {
  return useContext(AgentContext);
}
