// Sentry config for the browser/client.
// This file is loaded in the user's browser. The DSN here IS exposed to clients
// (that's by design — it's a write-only key for sending events to Sentry).
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Sample 100% of errors. Adjust if you hit free-tier quota (5k/mo).
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Don't capture errors in development to avoid noise
  enabled: process.env.NODE_ENV === 'production',

  // Privacy: redact common PII from error context
  beforeSend(event) {
    // Strip query params from URLs that might contain API keys
    if (event.request?.url) {
      try {
        const u = new URL(event.request.url);
        u.searchParams.forEach((_, key) => {
          if (/api[-_]?key|token|secret/i.test(key)) {
            u.searchParams.set(key, '[redacted]');
          }
        });
        event.request.url = u.toString();
      } catch {}
    }
    return event;
  },

  // Session replay: capture the user's session around any error so we can see
  // exactly what they clicked. Quota-friendly (only records on errors).
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});
