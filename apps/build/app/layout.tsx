import "@station/design-system/tokens.css";
import "@station/app-kit/app-kit.css";
import type { Metadata } from "next";
import { AppFrame } from "./_frame";

export const metadata: Metadata = {
  title: "STATION Build · 통합/SDK",
  description: "통합자·개발자 — 모듈/앱/계약·런타임 인스펙션 (non-operational)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" />
      </head>
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
