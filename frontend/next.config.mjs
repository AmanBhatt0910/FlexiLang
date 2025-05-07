// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
      serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"]
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    transpilePackages: ['react-syntax-highlighter'],
  };
  
  export default nextConfig;