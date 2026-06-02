/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@station/design-system", "@station/domain", "@station/shell"],
  // 빌드는 타입 검증으로 게이팅(아래 typecheck). 린트는 `pnpm lint`로 별도 실행 —
  // 레퍼런스 마크업을 100% 보존하기 위해 스타일 린트로 빌드를 막지 않는다.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
