import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  // In development, enable additional page extensions for dev-only routes
  const pageExtensions = isDev
    ? ["ts", "tsx", "md", "mdx", "dev.ts", "dev.tsx"]
    : ["ts", "tsx", "md", "mdx"];

  const common: NextConfig = {
    pageExtensions,
    images: {
      unoptimized: true, // Required for static export
    },
  };

  if (isDev) {
    return {
      ...common,
    };
  }

  if (process.env.GITHUB_PAGES) {
    return {
      ...common,
      output: "export",
      distDir: "build",
      basePath: "/blogs.rajivnayanc.com",
    };
  }

  // Standard production build
  return {
    ...common,
    output: "export",
    distDir: "build",
  };
};

export default nextConfig;
