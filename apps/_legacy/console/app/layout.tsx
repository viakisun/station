import "@station/design-system/tokens.css";
import type { Metadata } from "next";
import { AppShell } from "./app-shell";

export const metadata: Metadata = {
  title: "STATION Control — Multi-Robot Control Platform",
  description: "온실 통합관제 — 멀티로봇 데스크톱 콘솔 (C01·C02·C03·C04)",
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
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
