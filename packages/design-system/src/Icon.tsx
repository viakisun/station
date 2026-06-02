"use client";
/* ============================================================
   라인 아이콘 세트 (간단한 stroke SVG) — 전 콘솔 ICONS 통합 superset
   (원본: 각 콘솔 components.jsx 의 ICONS — incident-console 기준 전체 union)
   ============================================================ */
import type { CSSProperties } from "react";

export const ICONS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  route: "M6 19a3 3 0 100-6 3 3 0 000 6zM18 11a3 3 0 100-6 3 3 0 000 6zM18 8h-5a3 3 0 00-3 3v2a3 3 0 01-3 3H6",
  board: "M4 4h16v16H4zM4 9h16M9 9v11M14 9v11",
  audit: "M9 3h6l1 3h3v15H5V6h3l1-3zM9 13l2 2 4-4",
  alert: "M12 3l9 16H3l9-16zM12 9v5M12 17h.01",
  chip: "M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M6 6h12v12H6zM10 10h4v4h-4z",
  hmi: "M4 5h16v11H4zM2 20h20M9 16v4M15 16v4",
  telemetry: "M4 14a8 8 0 0116 0M7 14a5 5 0 0110 0M12 14a0 0 0 010 0M3 18h18",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 00-2-1.2L14 2h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 002 1.2L10 22h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.5-2-1.5A7 7 0 0019 12z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 01-3.4 0",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  chevL: "M15 6l-6 6 6 6",
  close: "M6 6l12 12M18 6L6 18",
  battery: "M3 8h14v8H3zM17 11h2v2h-2",
  robot: "M12 2v3M7 7h10v9H7zM10 11h.01M14 11h.01M9 20h6M9 16v4M15 16v4",
  pause: "M8 5v14M16 5v14",
  play: "M7 4l13 8-13 8z",
  stop: "M6 6h12v12H6z",
  home2: "M3 11l9-8 9 8M5 10v10h14V10",
  refresh: "M21 12a9 9 0 11-3-6.7M21 4v4h-4",
  filter: "M3 5h18l-7 8v5l-4 2v-7z",
  ext: "M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5",
  check: "M5 13l4 4 10-11",
  lock: "M6 11h12v9H6zM9 11V8a3 3 0 016 0v3",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  plus: "M12 5v14M5 12h14",
  dl: "M12 4v11M7 11l5 5 5-5M4 20h16",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
  beaker: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M7 14h10",
  pkg: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  branch: "M6 3v12M6 21a3 3 0 100-6 3 3 0 000 6zM6 6a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 100-6 3 3 0 000 6zM18 6a9 9 0 01-9 9",
  rocket: "M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 11a8 8 0 015-7c4 0 6 2 6 6a8 8 0 01-7 5l-2-2-2-2zM14 9h.01",
  terminal: "M4 5h16v14H4zM7 9l3 3-3 3M13 15h4",
  code: "M8 6l-5 6 5 6M16 6l5 6-5 6",
  key: "M14 7a4 4 0 11-4 4l-7 7v3h3l1-1v-2h2v-2h2l1.5-1.5A4 4 0 0014 7z",
  server: "M4 4h16v6H4zM4 14h16v6H4zM7 7h.01M7 17h.01",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  rollback: "M3 12a9 9 0 109-9 9 9 0 00-6.7 3M3 4v4h4",
  gauge: "M12 14l4-4M5 19a9 9 0 1114 0M12 14a2 2 0 100-4 2 2 0 000 4",
  fileCode: "M7 3h7l5 5v13H7zM14 3v5h5M10 13l-2 2 2 2M14 13l2 2-2 2",
  flag: "M5 21V4h11l-1.5 4L16 12H5",
  wifi: "M5 12.5a10 10 0 0114 0M8 16a5 5 0 018 0M12 20h.01",
  plug: "M9 2v6M15 2v6M7 8h10v3a5 5 0 01-10 0zM12 16v6",
  scan: "M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M4 12h16",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6M17 20h3",
  sliders: "M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M6 14v4",
  power: "M12 3v9M6.5 7a8 8 0 1011 0",
  link: "M9 15l6-6M10 7l1-1a4 4 0 016 6l-1 1M14 17l-1 1a4 4 0 01-6-6l1-1",
  unlink: "M9 15l-1 1a4 4 0 01-6-6l1-1M15 9l1-1a4 4 0 016 6l-1 1M5 3l16 16",
  node: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v4M12 18v4M2 12h4M18 12h4",
  activity: "M3 12h4l3 8 4-16 3 8h4",
  database: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  thermo: "M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0zM12 9v5",
  drop: "M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z",
  sun: "M12 7a5 5 0 100 10 5 5 0 000-10zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19",
  waves: "M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
  arrowRight2: "M5 12h14M13 6l6 6-6 6",
  zap: "M13 2L4 14h7l-1 8 9-12h-7z",
  trending: "M3 17l6-6 4 4 8-8M15 7h6v6",
  wrench: "M14 7a4 4 0 00-5 5l-6 6 2 2 6-6a4 4 0 005-5l-2.5 2.5L12 11l-1-1 2.5-2.5z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0",
  dot: "M12 12h.01",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  stroke = 2,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const d = ICONS[name] || "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {d
        .split("M")
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={"M" + seg} />
        ))}
    </svg>
  );
}
