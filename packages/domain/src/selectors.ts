/* ============================================================
   동기 mock 셀렉터 — 추후 Platform Core API 클라이언트 교체 seam.
   현 단계는 mock 데이터를 그대로 반환한다.
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
