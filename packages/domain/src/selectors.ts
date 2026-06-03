/* ============================================================
   동기 mock 셀렉터 (앱-레벨 도메인) — robots·sessions·incidents·firmwares 등.
   이들은 런타임(@station/local-agent)에 출처가 없는 **앱-레벨** 데이터라
   현재 mock SSOT 를 그대로 반환한다(SSR-safe 동기 면).

   런타임-native 데이터(Signal·Event·Command/ACK·Observation·노드)는 여기가
   아니라 라이브 에이전트를 구독한다 → @station/domain/runtime 의 hooks.

   [영속화 seam] 향후 앱-레벨 데이터의 출처 교체 지점:
     예) export const getRobots = () => repo.query("robots")
         또는 await apiClient.GET("/robots")  (셀렉터를 async 로 전환 시 UI 는
         React Query/SWR 로 흡수). DB(SQLite/Postgres) 또는 seed .json 어느 쪽이든
         이 파일의 반환부만 바꾸면 화면은 불변.
   ============================================================ */
import { CONTROL } from "./data/control";
import { INCIDENT } from "./data/incident";
import { TELEMETRY } from "./data/telemetry";
import { RELEASE } from "./data/release";
import { HMI } from "./data/hmi";

// ---- C01 Control ----
export const getControlData = () => CONTROL;
export const getRobots = () => CONTROL.robots;
export const getRobot = (id: string) => CONTROL.robots.find((r) => r.id === id) || null;
export const getSessions = () => CONTROL.sessions;
export const getSession = (id: string) => CONTROL.sessions.find((s) => s.id === id) || null;
export const getGreenhouses = () => CONTROL.greenhouses;
export const getMaps = () => CONTROL.maps;
export const getWorkplan = () => CONTROL.workplan;
export const getEvents = () => CONTROL.events;
export const getModulesOf = (robotId: string) => CONTROL.modules[robotId] || [];

// ---- C03 Incident ----
export const getIncidentData = () => INCIDENT;
export const getIncidents = () => INCIDENT.incidents;
export const getIncident = (id: string) =>
  INCIDENT.incidents.find((i) => i.id === id) || null;

// ---- T01 Telemetry ----
export const getTelemetryData = () => TELEMETRY;

// ---- C02 Audit / C04 Firmware ----
export const getReleaseData = () => RELEASE;
export const getFirmwares = () => RELEASE.firmwares;
export const getModules = () => RELEASE.modules;

// ---- H01 HMI ----
export const getHmiData = () => HMI;
