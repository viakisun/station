import "@station/design-system/tokens.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STATION Field — HMI · Telemetry",
  description: "현장 태블릿 — HMI 커미셔닝(H01) · Telemetry 설정(T01)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body data-theme="field">{children}</body>
    </html>
  );
}
