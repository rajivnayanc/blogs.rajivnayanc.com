import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const nextConfig = (phase: string): NextConfig => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // Config for development server
    return {
      distDir: 'build',
      // No basePath needed for local development
    };
  }

  const isGithubPages = process.env.GITHUB_PAGES === 'true';

  if (isGithubPages) {
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
