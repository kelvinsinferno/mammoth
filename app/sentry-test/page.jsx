'use client';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  const [fired, setFired] = useState(null);

  const fireMessage = () => {
    const id = Sentry.captureMessage('sentry-test: message from kelvin', 'info');
    setFired({ kind: 'message', id });
  };

  const fireException = () => {
    try {
      throw new Error('sentry-test: intentional exception from kelvin');
    } catch (e) {
      const id = Sentry.captureException(e);
      setFired({ kind: 'exception', id });
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '60px auto', fontFamily: "'IBM Plex Mono', monospace", color: '#e4e4e7', padding: 20 }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Sentry pipeline test</h1>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#a1a1aa', marginBottom: 24 }}>
        Click a button. If Sentry is wired up correctly, an event will land in the Sentry project dashboard within ~15 seconds.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={fireMessage} style={{ padding: '10px 16px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
          Fire test message
        </button>
        <button onClick={fireException} style={{ padding: '10px 16px', background: '#F43F5E', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
          Fire test exception
        </button>
      </div>
      {fired && (
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, padding: 12, fontSize: 12 }}>
          <div>Fired: <strong>{fired.kind}</strong></div>
          <div>Event ID: <code>{fired.id || '(no ID returned — likely disabled in dev or DSN missing)'}</code></div>
          <div style={{ marginTop: 8, color: '#a1a1aa' }}>
            If event ID is missing, Sentry did not initialize. Check the browser console for Sentry debug output.
          </div>
        </div>
      )}
    </div>
  );
}
