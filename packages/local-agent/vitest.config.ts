import { defineConfig } from "vitest/config";

// @station/contracts 는 raw-TS 워크스페이스 패키지 → 변환 대상으로 inline.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    server: { deps: { inline: [/@station\/contracts/] } },
  },
});
