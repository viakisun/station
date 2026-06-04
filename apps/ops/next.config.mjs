/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@station/design-system", "@station/domain", "@station/app-kit", "@station/contracts"],
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
