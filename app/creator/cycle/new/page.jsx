'use client';
import { useRouter } from 'next/navigation';

// TASK-009: Full Create Cycle page — curve config, rights config, treasury routing, live preview
export default function NewCyclePage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🦣</div>
        <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>Create Cycle</div>
        <div>Coming soon — TASK-009</div>
        <button onClick={() => router.push('/creator')} style={{ marginTop: 16, background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
