import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const nextConfig = (phase: string): NextConfig => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // Config for development server
    return {
      // No basePath needed for local development
    };
  }

  if (process.env.GITHUB_PAGES) {
    // Config for GitHub Pages build
    const repoName = '/blogs.rajivnayanc.com';
    return {
      output: 'export',
      distDir: 'build',
      basePath: repoName,
      assetPrefix: repoName, // Also recommended for static assets
      images: {
        unoptimized: true, // Required for static export
      },
    };
  }

  // Config for regular production build (not GitHub Pages)
  return {
    output: 'export',
    distDir: 'build',
    // No basePath needed for standard production deployment
  };
};

export default nextConfig;
