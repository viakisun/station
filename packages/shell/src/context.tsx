"use client";
import { createContext, useContext } from "react";

/** 셸 ↔ 화면 상호작용 (로봇 드로어 열기 / 세션 열기 / 워크스페이스 이동) */
export interface ShellApi {
  selectRobot: (id: string) => void;
  openSession: (id: string) => void;
  navWorkspace: (id: string, ctx?: Record<string, unknown>) => void;
}

export const ShellContext = createContext<ShellApi>({
  selectRobot: () => {},
  openSession: () => {},
  navWorkspace: () => {},
});

export const useShell = () => useContext(ShellContext);
