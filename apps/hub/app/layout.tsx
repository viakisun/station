import "@station/design-system/tokens.css";
import "./hub.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STATION — Multi-Robot Developer Platform",
  description: "Build your own control surface for heterogeneous farm-robot fleets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
