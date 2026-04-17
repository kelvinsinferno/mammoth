// Browser Sentry init. Replaces sentry.client.config.js for @sentry/nextjs v8+.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
  beforeSend(event) {
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
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
