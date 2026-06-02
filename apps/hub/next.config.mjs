/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@station/design-system"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
