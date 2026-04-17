/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Strip noisy console.* in production, but keep error/warn so Sentry's
    // captureConsoleIntegration can forward them.
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
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

module.exports = withSentryConfig(nextConfig, {
  org: 'mammoth-1m',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  telemetry: false,
  // Source map upload only runs when SENTRY_AUTH_TOKEN is present in the build env.
});
