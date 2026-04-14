/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
  turbopack: {
    root: __dirname,
  },
};

// Wrap with Sentry for source map upload + auto-instrumentation
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    // Suppress source map upload logs
    silent: true,
    // No org/project here — only needed when uploading source maps via auth token
    // Source maps will only be uploaded if SENTRY_AUTH_TOKEN is set in build env
  },
  {
    // Wider source map upload settings
    widenClientFileUpload: true,
    // Hide source maps from public
    hideSourceMaps: true,
    // Disable Sentry telemetry on the build server
    telemetry: false,
  }
);
