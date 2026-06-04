/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@station/design-system", "@station/domain", "@station/app-kit", "@station/contracts", "@station/local-agent", "@station/node-kit", "@station/node-mcu", "@station/node-vpu", "@station/node-lpu", "@station/node-acu"],
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
