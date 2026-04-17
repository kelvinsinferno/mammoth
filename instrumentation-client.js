// Browser Sentry init. Replaces sentry.client.config.js for @sentry/nextjs v8+.
import * as Sentry from '@sentry/nextjs';

// Patterns that aren't real bugs — mostly third-party library / browser-extension noise.
const NOISE_PATTERNS = [
  /was registered as a Standard Wallet/i,
  /can be removed from your app/i,
  /Cannot redefine property: ethereum/i,
  /error inject ethereum to the window/i,
  /Extension context invalidated/i,
  /Unchecked runtime\.lastError/i,
  /SES Removing unpermitted intrinsics/i,
  /Download the Apollo DevTools/i,
];

function isNoise(text) {
  if (!text) return false;
  return NOISE_PATTERNS.some((re) => re.test(text));
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
  ignoreErrors: NOISE_PATTERNS,
  beforeSend(event, hint) {
    const candidates = [
      event.message,
      hint?.originalException?.message,
      event.exception?.values?.[0]?.value,
    ];
    if (candidates.some(isNoise)) return null;

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
  beforeSendBreadcrumb(crumb) {
    if (crumb.category === 'console' && isNoise(crumb.message)) return null;
    return crumb;
  },
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.captureConsoleIntegration({ levels: ['error', 'warn'] }),
    Sentry.extraErrorDataIntegration({ depth: 6 }),
  ],
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  attachStacktrace: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
