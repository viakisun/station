import "@station/design-system/tokens.css";
import "@station/app-kit/app-kit.css";
import "./landing.css";
import type { Metadata } from "next";
import { ScopeProvider } from "@station/app-kit";

export const metadata: Metadata = {
  title: "STATION — Commercial SaaS Suite",
  description: "VIA 통합관제 SaaS 제품군 런처 — Ops · Build · Field · Agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" />
      </head>
      <body data-theme="hub" data-skin="light" style={{ margin: 0, background: "var(--surface-canvas)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
        <ScopeProvider seedFirstProject={false}>{children}</ScopeProvider>
      </body>
    </html>
  );
}
