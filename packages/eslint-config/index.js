/** Shared ESLint config (legacy eslintrc form) for STATION apps. */
module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    // 레퍼런스 텍스트를 100% 그대로 보존(작은따옴표 등) — 노이즈 규칙 비활성화
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
  },
};
