import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// const withPWA = withPWAInit({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
//   reloadOnOnline: true,
// });
const withPWA = (config: any) => config;

// Read package.json to get version
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8"),
);
const { version = "0" } = packageJson;
const isExport = process.env.NEXT_PUBLIC_SSR !== "true";

const nextConfig: NextConfig = {
  transpilePackages: ["@heroui/system", "@heroui/react"],
  turbopack: {}, // Empty config to acknowledge we're using webpack
  reactStrictMode: true,
  output: isExport ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: isExport,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "137.184.201.204",
      },
    ],
  },
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ["@heroui/react", "lucide-react", "react-icons"],
  },
  allowedDevOrigins: ["localhost", "127.0.0.1", "*.localhost"],
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
      ignored: ["**/node_modules", "**/.git", "D:\\WindowsApps"],
    };
    return config;
  },
};

export default withPWA(nextConfig);
