'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllPositions } from './ProjectDetail';
import { fmtTokens, saveProjectMeta, loadProjectMeta } from '../lib/utils';
import { closeCycleOnChain, openCycleOnChain } from '../lib/curves';
import { PublicKey } from '@solana/web3.js';
import { parseTransactionError, activateCycle } from '../lib/anchorClient';
import { useApp } from '../lib/AppContext';
import { useToast } from '../components/ui/Toast';
import { SkeletonList } from '../components/ui/Skeleton';
import ConfigureAgentModal from '../components/modals/ConfigureAgentModal';

const LINK_FIELDS = [
  ['website',   'Website'],
  ['twitter',   'Twitter / X'],
  ['telegram',  'Telegram'],
  ['discord',   'Discord'],
  ['github',    'GitHub'],
  ['farcaster', 'Farcaster'],
  ['youtube',   'YouTube'],
  ['docs',      'Docs'],
];

function MetadataEditor({ project: p }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: p.name || '',
    ticker: p.ticker || '',
    description: p.description || '',
    image: p.image || p.imagePreview || '',
    website: p.website || '', twitter: p.twitter || '', telegram: p.telegram || '',
    discord: p.discord || '', github: p.github || '', farcaster: p.farcaster || '',
    youtube: p.youtube || '', docs: p.docs || '',
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('image', reader.result);
    reader.readAsDataURL(file);
  };
  const save = (e) => {
    e.stopPropagation();
    Object.assign(p, form, { imagePreview: form.image });
    saveProjectMeta(p.mint || p.id, { ...form, imagePreview: form.image });
    setOpen(false);
  };
  return (
    <div style={{ marginBottom:10, background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:7, padding:'10px 12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: open ? 10 : 0 }}>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', fontWeight:600, marginBottom:2 }}>✏️ Project details</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>Image, description, links — editable any time</div>
        </div>
        <button onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
          style={{ background:'none', border:'1px solid var(--border)', borderRadius:4, padding:'3px 9px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', cursor:'pointer' }}>
          {open ? 'CANCEL' : 'EDIT'}
        </button>
      </div>
      {open && (
        <div style={{ animation:'fadeUp 0.12s ease' }} onClick={e => e.stopPropagation()}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'6px 8px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>Ticker</label>
              <input type="text" value={form.ticker} onChange={e => update('ticker', e.target.value.toUpperCase())}
                style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'6px 8px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}/>
            </div>
          </div>
          <div style={{ marginBottom:8 }}>
            <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
              style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'6px 8px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', resize:'vertical' }}/>
          </div>
          <div style={{ marginBottom:8 }}>
            <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>Image</label>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {form.image && <img src={form.image} alt="" style={{ width:36, height:36, borderRadius:5, objectFit:'cover', border:'1px solid var(--border)' }}/>}
              <input type="file" accept="image/*" onChange={onFile}
                style={{ flex:1, fontSize:10, color:'var(--text-dim)', fontFamily:"'IBM Plex Mono',monospace" }}/>
              {form.image && (
                <button onClick={e => { e.stopPropagation(); update('image', ''); }}
                  style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:4, padding:'4px 8px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#F43F5E', cursor:'pointer' }}>
                  CLEAR
                </button>
              )}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            {LINK_FIELDS.map(([k, label]) => (
              <div key={k}>
                <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>{label}</label>
                <input type="url" value={form[k]} onChange={e => update(k, e.target.value)} placeholder="https://"
                  style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'6px 8px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}/>
              </div>
            ))}
          </div>
          <button onClick={save}
            style={{ width:'100%', padding:'8px 0', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:5, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:10, color:'#A78BFA', cursor:'pointer' }}>
            SAVE DETAILS
          </button>
        </div>
      )}
    </div>
  );
}

function RevealEditor({ project: p }) {
  const isScheduled = p.status === 'COMING_SOON' && p.goPublicAt;
  const isPast = p.goPublicAt && new Date(p.goPublicAt) <= new Date();
  const [editingReveal, setEditingReveal] = useState(false);
  const [revealDate, setRevealDate] = useState(p.goPublicAt ? new Date(p.goPublicAt).toISOString().split('T')[0] : '');
  const [revealTime, setRevealTime] = useState(p.goPublicAt ? new Date(p.goPublicAt).toTimeString().slice(0,5) : '00:00');
  return (
    <div style={{ marginBottom:10, background: isScheduled && !isPast ? 'rgba(139,92,246,0.06)' : 'var(--panel-alt)', border:`1px solid ${isScheduled && !isPast ? 'rgba(139,92,246,0.25)' : 'var(--border)'}`, borderRadius:7, padding:'10px 12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: editingReveal ? 10 : 0 }}>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', fontWeight:600, marginBottom:2 }}>
            {isScheduled && !isPast ? '📅 Scheduled reveal' : '🌐 Publicly visible'}
          </div>
          {isScheduled && !isPast && (
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#A78BFA' }}>
              {new Date(p.goPublicAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · {new Date(p.goPublicAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
            </div>
          )}
        </div>
        <button onClick={e => { e.stopPropagation(); setEditingReveal(v => !v); }}
          style={{ background:'none', border:'1px solid var(--border)', borderRadius:4, padding:'3px 9px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', cursor:'pointer' }}>
          {editingReveal ? 'CANCEL' : 'EDIT'}
        </button>
      </div>
      {editingReveal && (
        <div style={{ animation:'fadeUp 0.12s ease' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>Reveal date</label>
              <input type="date" value={revealDate} onChange={e => setRevealDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'6px 8px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', marginBottom:3 }}>Reveal time</label>
              <input type="time" value={revealTime} onChange={e => setRevealTime(e.target.value)}
                style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'6px 8px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={e => { e.stopPropagation();
                const dt = revealDate ? new Date(`${revealDate}T${revealTime||'00:00'}`).toISOString() : null;
                const status = dt && new Date(dt) > new Date() ? 'COMING_SOON' : 'BETWEEN';
                p.goPublicAt = dt; p.status = status;
                saveProjectMeta(p.mint || p.id, { goPublicAt: dt, status });
                setEditingReveal(false); }}
              style={{ flex:1, padding:'7px 0', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:5, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:10, color:'#A78BFA', cursor:'pointer' }}>
              SAVE DATE
            </button>
            {p.goPublicAt && (
              <button onClick={e => { e.stopPropagation();
                  p.goPublicAt = null; p.status = 'BETWEEN';
                  saveProjectMeta(p.mint || p.id, { goPublicAt: null, status: 'BETWEEN' });
                  setEditingReveal(false); }}
                style={{ padding:'7px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:5, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#F43F5E', cursor:'pointer' }}>
                MAKE PUBLIC NOW
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const BASE = 'https://mammothprotocol.com';

function TelegramSetupModal({ project, onClose }) {
  const mint = project.mint || project.id;
  const miniUrl = `${BASE}/mini/${mint}`;
  const [copied, setCopied] = React.useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => copy(text, id)}
      style={{ background: copied===id ? 'rgba(16,185,129,0.12)' : 'transparent', border: `1px solid ${copied===id ? 'rgba(16,185,129,0.3)' : 'rgba(41,182,246,0.3)'}`, borderRadius: 4, padding: '3px 10px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 700, color: copied===id ? '#10B981' : '#29B6F6', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
      {copied === id ? '✓ COPIED' : 'COPY'}
    </button>
  );

  const steps = [
    {
      n: '01',
      title: 'Create your bot',
      desc: 'Open Telegram and message @BotFather. Send the command below to create a new bot. BotFather will ask for a name and username, then give you a token — save it, you\'ll need it in step 4.',
      cmd: '/newbot',
      cmdNote: 'Send this to @BotFather',
      link: 'https://t.me/BotFather',
      linkLabel: 'Open @BotFather →',
    },
    {
      n: '02',
      title: 'Register your Mini App',
      desc: 'After creating the bot, send /newapp to BotFather. It will ask for your bot, then prompt for a title, description, photo, and the web app URL. Use your Mammoth mini app URL below.',
      cmd: '/newapp',
      cmdNote: 'Send this to @BotFather after /newbot',
      extra: { label: 'Your Mini App URL (paste when BotFather asks)', value: miniUrl },
    },
    {
      n: '03',
      title: 'Set the menu button (optional)',
      desc: 'Add a persistent button to your bot\'s chat that opens the mini app. This makes it one tap to buy from inside your Telegram community.',
      cmd: '/setmenubutton',
      cmdNote: 'Send this to @BotFather, then follow the prompts',
    },
    {
      n: '04',
      title: 'Share a direct open link',
      desc: 'Once your bot is set up, anyone can open your mini app directly using this link format. Replace YOUR_BOT_USERNAME with your bot\'s @username.',
      extra: { label: 'Direct Mini App link', value: `https://t.me/YOUR_BOT_USERNAME/YOUR_APP_NAME` },
    },
    {
      n: '05',
      title: 'Share as a message button',
      desc: 'To send a message with a "Buy Now" button that opens the mini app, use the Telegram Bot API. This is the code to send in your bot\'s sendMessage call.',
      code: `{
  "chat_id": "YOUR_CHAT_ID",
  "text": "🦣 ${project.name} ($${project.ticker}) — new cycle is OPEN!",
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "🚀 Buy $${project.ticker} on Mammoth",
        "web_app": { "url": "${miniUrl}" }
      }
    ]]
  }
}`,
    },
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(6px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:540, padding:'24px 20px', maxHeight:'90vh', overflowY:'auto', animation:'slideUp 0.18s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Telegram Mini App Setup</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{project.name} · ${project.ticker}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>

        {/* Intro */}
        <div style={{ background:'rgba(41,182,246,0.06)', border:'1px solid rgba(41,182,246,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:20 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#29B6F6', lineHeight:1.75 }}>
            Your mini app is already live at the URL below. These steps connect it to a Telegram bot so buyers can open it full-screen inside Telegram with a single tap. You do this once per token — takes about 5 minutes.
          </div>
        </div>

        {/* Mini app URL callout */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#29B6F6', textTransform:'uppercase', letterSpacing:'0.06em' }}>Your Mini App URL</span>
            <CopyBtn text={miniUrl} id="miniUrl" />
          </div>
          <div style={{ background:'var(--panel-alt)', border:'1px solid rgba(41,182,246,0.2)', borderRadius:6, padding:'9px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', wordBreak:'break-all' }}>
            {miniUrl}
          </div>
        </div>

        {/* Steps */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:9, padding:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(41,182,246,0.15)', border:'1px solid rgba(41,182,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#29B6F6' }}>{s.n}</span>
                </div>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>{s.title}</span>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    style={{ marginLeft:'auto', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#29B6F6', textDecoration:'none', flexShrink:0 }}>
                    {s.linkLabel}
                  </a>
                )}
              </div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.75, marginBottom: (s.cmd||s.extra||s.code) ? 10 : 0 }}>
                {s.desc}
              </div>
              {s.cmd && (
                <div style={{ marginBottom: s.extra ? 8 : 0 }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:4 }}>{s.cmdNote}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--panel)', border:'1px solid #252848', borderRadius:6, padding:'8px 12px' }}>
                    <code style={{ flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color:'#29B6F6' }}>{s.cmd}</code>
                    <CopyBtn text={s.cmd} id={`cmd-${i}`} />
                  </div>
                </div>
              )}
              {s.extra && (
                <div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:4 }}>{s.extra.label}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--panel)', border:'1px solid #252848', borderRadius:6, padding:'8px 12px' }}>
                    <code style={{ flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', wordBreak:'break-all' }}>{s.extra.value}</code>
                    <CopyBtn text={s.extra.value} id={`extra-${i}`} />
                  </div>
                </div>
              )}
              {s.code && (
                <div style={{ position:'relative' }}>
                  <pre style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:6, padding:'10px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#22D3EE', overflowX:'auto', whiteSpace:'pre', margin:0, lineHeight:1.7 }}>
                    {s.code}
                  </pre>
                  <div style={{ position:'absolute', top:8, right:8 }}>
                    <CopyBtn text={s.code} id={`code-${i}`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop:16, fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', lineHeight:1.7, textAlign:'center' }}>
          Your mini app URL never changes — set it up once and it works for all future cycles.
        </div>
      </div>
    </div>
  );
}

function EmbedModal({ project, onClose }) {
  const mint = project.mint || project.id;
  const [theme, setTheme] = React.useState('dark');
  const [accent, setAccent] = React.useState('8B5CF6');
  const [size, setSize] = React.useState('full');
  const [copied, setCopied] = React.useState(null);

  const widgetUrl = `${BASE}/widget/${mint}?theme=${theme}&accent=${encodeURIComponent('#'+accent.replace('#',''))}&size=${size}`;

  const iframeCode = `<iframe
  src="${widgetUrl}"
  width="${size === 'compact' ? '340' : '420'}"
  height="${size === 'compact' ? '220' : '560'}"
  frameborder="0"
  style="border-radius:12px;overflow:hidden;"
  allow="clipboard-write"
></iframe>`;

  const scriptCode = `<div id="mammoth-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = "${widgetUrl}";
    iframe.width = "${size === 'compact' ? '340' : '420'}";
    iframe.height = "${size === 'compact' ? '220' : '560'}";
    iframe.frameBorder = "0";
    iframe.style.cssText = "border-radius:12px;overflow:hidden;";
    document.getElementById('mammoth-widget').appendChild(iframe);
  })();
</script>`;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:520, padding:'24px 20px', maxHeight:'90vh', overflowY:'auto', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Embed Widget</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{project.name} · ${project.ticker}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>

        {/* Live preview */}
        <div style={{ marginBottom:16, borderRadius:10, overflow:'hidden', border:'1px solid #1d2540', background:'#0d1117', display:'flex', justifyContent:'center', padding:12 }}>
          <iframe src={widgetUrl} width={size === 'compact' ? 320 : 400} height={size === 'compact' ? 200 : 560} frameBorder="0" style={{ borderRadius:10, display:'block' }}/>
        </div>

        {/* Customisation */}
        <div style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Customise</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {/* Theme */}
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase' }}>Theme</label>
              {['dark','light'].map(t => (
                <div key={t} onClick={() => setTheme(t)} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 0', cursor:'pointer' }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', border: theme===t ? '4px solid #8B5CF6' : '2px solid var(--border)', flexShrink:0 }}/>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: theme===t ? '#A78BFA' : 'var(--text-dim)' }}>{t}</span>
                </div>
              ))}
            </div>
            {/* Size */}
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase' }}>Size</label>
              {['full','compact'].map(s => (
                <div key={s} onClick={() => setSize(s)} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 0', cursor:'pointer' }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', border: size===s ? '4px solid #8B5CF6' : '2px solid var(--border)', flexShrink:0 }}/>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: size===s ? '#A78BFA' : 'var(--text-dim)' }}>{s}</span>
                </div>
              ))}
            </div>
            {/* Accent */}
            <div>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase' }}>Accent</label>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <input type="color" value={'#'+accent.replace('#','')} onChange={e => setAccent(e.target.value.replace('#',''))}
                  style={{ width:28, height:28, borderRadius:4, border:'1px solid var(--border)', cursor:'pointer', padding:2, background:'none' }}/>
                <input type="text" value={accent.replace('#','')} onChange={e => setAccent(e.target.value.replace('#',''))} maxLength={6}
                  style={{ flex:1, background:'var(--panel)', border:'1px solid var(--border)', borderRadius:4, padding:'4px 6px', color:'var(--text)', fontSize:10, fontFamily:"'IBM Plex Mono',monospace", outline:'none' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Code snippets */}
        {[
          { label:'iframe (recommended)', key:'iframe', code: iframeCode },
          { label:'Script tag', key:'script', code: scriptCode },
          { label:'Widget URL', key:'url', code: widgetUrl },
        ].map(({ label, key, code }) => (
          <div key={key} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
              <button onClick={() => copy(code, key)}
                style={{ background: copied===key ? 'rgba(16,185,129,0.15)' : 'transparent', border:`1px solid ${copied===key ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius:4, padding:'3px 10px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color: copied===key ? '#10B981' : 'var(--text-muted)', cursor:'pointer', transition:'all 0.15s' }}>
                {copied === key ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
            <pre style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'10px 12px', fontSize:9, color:'#22D3EE', fontFamily:"'IBM Plex Mono',monospace", overflowX:'auto', whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0, lineHeight:1.7 }}>{code}</pre>
          </div>
        ))}

        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', lineHeight:1.7, marginTop:4 }}>
          The widget connects to Mammoth Protocol on-chain. Buyers need a Solana wallet (Phantom, Solflare). No API key required.
        </div>
      </div>
    </div>
  );
}

function CycleManagerModal({ cycle: cycleProp, project, onClose, onLaunchCycle, onTerminate }) {
  // Projects with no active cycle pass cycle=null. Substitute a zero-state
  // placeholder so the rest of the render reads safe numeric fields. Actions
  // that need a real cycle are gated on `hasCycle`.
  const hasCycle = !!cycleProp;
  const cycle = cycleProp || { id: 0, status: 'NONE', allocation: 0, sold: 0, currentPrice: 0, stepSize: 0, stepIncrement: 0, rightsWindowEnd: null };

  const { connection, getWalletAdapter } = useApp();
  const toast = useToast();
  const [action, setAction] = useState(null);
  const [params, setParams] = useState({ cycleAllocation: cycle.allocation || 1_000_000, stepSize: cycle.stepSize || 5000 });
  const [submitting, setSubmitting] = useState(false);

  const handleLaunch = async () => {
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      onLaunchCycle?.({ ...cycle, id:cycle.id+1, allocation:params.cycleAllocation, stepSize:params.stepSize });
      onClose();
    } catch(e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    setSubmitting(true);
    try {
      const walletAdapter = getWalletAdapter();
      const mintAddress = project?.mint || project?.id;
      const isRealMint = mintAddress && mintAddress.length >= 32 && !mintAddress.includes('...');

      if (walletAdapter && isRealMint) {
        const { getProgram } = await import('../lib/anchorClient');
        // getProgram signature is (connection, wallet) — was reversed here.
        const program = getProgram(connection, walletAdapter);
        // cycle.id mirrors project.current_cycle (incremented by open_cycle),
        // but activate_cycle's PDA seed matches cycle_state.cycle_index which
        // is one less. Off-by-one here meant activation always failed.
        const cycleIndex = Math.max(0, (cycle?.id ?? 1) - 1);
        // getProjectStatePDA calls .toBuffer() — must pass PublicKey.
        const mintPubkey = new PublicKey(mintAddress);
        await activateCycle(program, mintPubkey, cycleIndex);
        toast.success('Cycle activated — public buying is now open!');
      } else {
        await new Promise(r => setTimeout(r, 800));
        toast.success('Cycle activated (demo)');
      }
      onClose();
    } catch(e) {
      const userMsg = parseTransactionError(e);
      if (userMsg === null) { setSubmitting(false); return; }
      toast.error(userMsg || 'Failed to activate cycle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminate = async () => {
    if (!confirm('Terminate cycle? This cannot be undone.')) return;
    setSubmitting(true);
    try {
      const walletAdapter = getWalletAdapter();
      const mintAddress = project?.mint || project?.id;
      const isRealMint = mintAddress && mintAddress.length >= 32 && !mintAddress.includes('...');

      if (walletAdapter && isRealMint) {
        await closeCycleOnChain({ connection, walletAdapter, mintAddress });
        toast.success('Cycle ended on-chain');
      } else {
        await new Promise(r => setTimeout(r, 800));
      }
      onTerminate?.();
      onClose();
    } catch(e) {
      const userMsg = parseTransactionError(e);
      if (userMsg === null) { setSubmitting(false); return; }
      toast.error(userMsg || 'Failed to end cycle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="cycle-manager-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-manager-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:400, padding:'22px 20px', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'var(--text)' }}>{action?'Settings':'Manage cycle'}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>{project.name} · {hasCycle ? `Cycle #${cycle.id}` : 'No active cycle'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, lineHeight:1 }}>✕</button>
        </div>

        {!action ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8, animation:'fadeUp 0.15s ease' }}>

            {/* RIGHTS_WINDOW status — show countdown + activate button */}
            {(cycle.status==='RIGHTS_WINDOW' || cycle.status==='rightsWindow') && (() => {
              const now = Math.floor(Date.now() / 1000);
              const expired = cycle.rightsWindowEnd && now >= cycle.rightsWindowEnd;
              const remaining = cycle.rightsWindowEnd ? Math.max(0, cycle.rightsWindowEnd - now) : null;
              const hrs = remaining !== null ? Math.floor(remaining / 3600) : null;
              const mins = remaining !== null ? Math.floor((remaining % 3600) / 60) : null;
              return (
                <>
                  <div style={{ background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:8, padding:'12px 14px' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600, marginBottom:4 }}>
                      🛡️ Rights Window {expired ? 'EXPIRED' : 'ACTIVE'}
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.6 }}>
                      {expired
                        ? 'Rights window has ended. You can now activate the cycle to open public buying.'
                        : remaining !== null
                          ? `Holders can exercise rights for ${hrs}h ${mins}m. Activate after window closes.`
                          : 'Existing holders may exercise their pro-rata rights at launch price.'}
                    </div>
                  </div>
                  {expired && (
                    <button
                      onClick={handleActivate}
                      disabled={submitting}
                      style={{ display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.12))', border:'1px solid rgba(34,211,238,0.35)', borderRadius:8, padding:'12px 14px', cursor:submitting?'not-allowed':'pointer', transition:'all 0.12s', width:'100%', minHeight:52, opacity:submitting?0.6:1 }}
                      onMouseEnter={e => { if(!submitting) e.currentTarget.style.borderColor='#22D3EE'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(34,211,238,0.35)'; }}>
                      {submitting
                        ? <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid #1a2438', borderTopColor:'#22D3EE', animation:'spin 0.7s linear infinite' }}/>
                        : <span style={{ fontSize:16, lineHeight:1 }}>⚡</span>
                      }
                      <div style={{ textAlign:'left' }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#22D3EE', fontWeight:700 }}>
                          {submitting ? 'Activating...' : 'Activate cycle'}
                        </div>
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>
                          Open public buying — rights window is closed
                        </div>
                      </div>
                    </button>
                  )}
                </>
              );
            })()}

            {cycle.status==='ACTIVE' && (
              <>
                <button onClick={() => setAction('launch')}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(139,92,246,0.13)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%', minHeight:52 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#8B5CF6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.28)'}>
                  <span style={{ fontSize:16, lineHeight:1 }}>🚀</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>Launch next cycle</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Continue issuance with new params</div>
                  </div>
                </button>
                <button onClick={() => setAction('terminate')}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%', minHeight:52 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(248,113,113,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(248,113,113,0.2)'}>
                  <span style={{ fontSize:16, lineHeight:1 }}>⏹</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>End cycle early</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Lock supply; skip to secondary</div>
                  </div>
                </button>
              </>
            )}
            {cycle.status==='COMPLETED' && (
              <button onClick={() => setAction('launch')}
                style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(139,92,246,0.13)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%' }}>
                <span style={{ fontSize:16, lineHeight:1 }}>🚀</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>Launch next cycle</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Begin cycle #{cycle.id+1}</div>
                </div>
              </button>
            )}
          </div>
        ) : action === 'launch' ? (
          <div style={{ animation:'fadeUp 0.15s ease' }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Cycle allocation</label>
              <input type="number" value={params.cycleAllocation} onChange={e => setParams(p => ({ ...p, cycleAllocation:parseInt(e.target.value) }))} min={1}
                style={{ width:'100%', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none' }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:3 }}>{fmtTokens(params.cycleAllocation)} tokens</div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Step size (for stepwise curves)</label>
              <input type="number" value={params.stepSize} onChange={e => setParams(p => ({ ...p, stepSize:parseInt(e.target.value) }))} min={100}
                style={{ width:'100%', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none' }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAction(null)} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'var(--text-dim)', cursor:'pointer', opacity:submitting?0.5:1 }}>CANCEL</button>
              <button onClick={handleLaunch} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'#8B5CF6', border:'none', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#fff', cursor:'pointer', opacity:submitting?0.5:1 }}>CONFIRM</button>
            </div>
          </div>
        ) : action === 'terminate' ? (
          <div style={{ animation:'fadeUp 0.15s ease' }}>
            <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'12px', marginBottom:16 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#F43F5E', fontWeight:600, marginBottom:4 }}>⚠ Terminate cycle?</div>
              <div style={{ fontSize:11, color:'rgba(248,113,113,0.8)', fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6 }}>
                Cycle will end immediately. No more tokens issued. Holders move to secondary market. This cannot be reversed.
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAction(null)} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'var(--text-dim)', cursor:'pointer', opacity:submitting?0.5:1 }}>CANCEL</button>
              <button onClick={handleTerminate} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#F43F5E', cursor:'pointer', opacity:submitting?0.5:1 }}>TERMINATE</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CycleDashboard({ myProjects, onClose, onLaunchCycle, onTerminateProject, theme, loading, onLaunchNew, onResumeDraft }) {
  const { connection, getWalletAdapter, loadOnChainProjects } = useApp();
  const toast = useToast();
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();
  const goToToken = (p) => router.push(`/token/${p.mint || p.id}`);
  const [manageModal, setManageModal] = useState(null);
  const [openingCycleFor, setOpeningCycleFor] = useState(null);

  const handleOpenFirstCycle = async (e, p) => {
    e.stopPropagation();
    const mint = p.mint || p.id;
    const walletAdapter = getWalletAdapter?.();
    if (!walletAdapter) { toast.error('Connect your wallet first'); return; }

    // Pull cycle params saved at launch time. Fall back to project fields
    // (handleLaunchToken persisted them onto myProjects for this session).
    const saved = loadProjectMeta(mint) || {};
    const params = {
      curveType: saved.curveType ?? p.curveType ?? 'linear',
      startPrice: Number(saved.startPrice ?? p.startPrice ?? p.price ?? 0.001),
      endPrice: Number(saved.endPrice ?? p.endPrice ?? 0) || 0,
      stepSize: Number(saved.stepSize ?? p.stepSize ?? 0) || 0,
      stepIncrement: Number(saved.stepIncrement ?? p.stepIncrement ?? 0) || 0,
      expMultiplier: Number(saved.expMultiplier ?? p.expMultiplier ?? 0) || 0,
      rightsRequired: !!(saved.rightsRequired ?? p.rightsRequired),
      rightsWindowHours: Number(saved.rightsWindowHours ?? p.rightsWindowHours ?? 24),
      supplyCap: Math.floor(
        Number(saved.totalSupply ?? p.totalSupply ?? 1_000_000_000)
        * ((saved.publicAllocationBps ?? p.publicAllocationBps ?? 6000) / 10000)
      ),
      activatesAt: saved.scheduledLaunchAt ?? p.scheduledLaunchAt ?? null,
    };

    if (!params.startPrice || params.startPrice <= 0) {
      toast.error('Missing cycle parameters — relaunch from the wizard');
      return;
    }

    setOpeningCycleFor(mint);
    try {
      await openCycleOnChain({ connection, walletAdapter, mintAddress: mint, params });
      saveProjectMeta(mint, { cyclePending: false });
      toast.success(params.activatesAt ? 'Cycle scheduled on-chain' : 'Cycle is now open');
      setTimeout(() => loadOnChainProjects?.(), 3000);
    } catch (err) {
      console.error('[mammoth openFirstCycle] failed:', err);
      toast.error(err?.message?.slice(0, 120) || 'Failed to open cycle');
    } finally {
      setOpeningCycleFor(null);
    }
  };

  const [embedModal, setEmbedModal] = useState(null);
  const [tgModal, setTgModal] = useState(null);
  const [agentModal, setAgentModal] = useState(null);
  const [activeTab, setActiveTab] = useState('tokens'); // 'tokens' | 'drafts' | 'portfolio'
  const [drafts, setDrafts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Load drafts from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('mammoth_drafts') || '[]');
      setDrafts(saved);
    } catch {}
    try {
      setPortfolio(getAllPositions());
    } catch {}
    // Tick every 30s to update countdowns
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const deleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('mammoth_drafts', JSON.stringify(updated));
  };

  // Loading state
  if (loading) return (
    <div onClick={onClose} className="cycle-dash-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-dash-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:600, padding:'24px 20px', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Your tokens</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
        </div>
        <SkeletonList count={3} />
      </div>
    </div>
  );

  return (
    <div onClick={onClose} className="cycle-dash-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease', overflow:'auto' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-dash-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:600, padding:'24px 20px', animation:'slideUp 0.18s ease', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Creator Dashboard</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:2, background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:7, padding:3, marginBottom:16 }}>
          {[['tokens', `🪙 Tokens (${myProjects.length})`], ['portfolio', `📊 Portfolio${portfolio.length > 0 ? ` (${portfolio.length})` : ''}`], ['drafts', `📝 Drafts${drafts.length > 0 ? ` (${drafts.length})` : ''}`]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ flex:1, background:activeTab===key?'#8B5CF6':'none', border:'none', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600, padding:'7px 10px', borderRadius:5, color:activeTab===key?'#fff':'var(--text-dim)', transition:'all 0.12s', minHeight:36 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tokens tab */}
        {activeTab === 'tokens' && <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {myProjects.length === 0 && (
            <div style={{ background:'var(--panel-alt)', border:'1px dashed #252848', borderRadius:10, padding:'28px 20px', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:6 }}>No launched tokens yet</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:16, lineHeight:1.6 }}>
                {drafts.length > 0 ? 'Finish a draft or start a new token to see it here.' : 'Create your first token to start managing cycles.'}
              </div>
              {onLaunchNew && (
                <button onClick={onLaunchNew}
                  style={{ background:'#FF9F1C', border:'none', borderRadius:6, padding:'10px 18px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#000', cursor:'pointer', letterSpacing:'0.04em' }}>
                  LAUNCH A TOKEN →
                </button>
              )}
            </div>
          )}
          {myProjects.map(p => (
            <div key={p.id} className="token-row-card" style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:10, padding:'14px', cursor:'pointer', transition:'all 0.12s', animation:'fadeUp 0.2s ease both', animationDelay:`${myProjects.indexOf(p)*0.05}s` }}
              onClick={() => setExpandedId(expandedId===p.id?null:p.id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:3 }}>{p.name} <span style={{ fontSize:11, color:'var(--text-dim)' }}>/ ${p.ticker}</span></div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    {p.cycleData ? (
                      <>
                        <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
                          Cycle #{p.cycleData.id} · {fmtTokens(p.cycleData.sold)} / {fmtTokens(p.cycleData.allocation)} sold
                        </span>
                        {(p.cycleData.status==='RIGHTS_WINDOW'||p.cycleData.status==='rightsWindow') && (() => {
                          const expired = p.cycleData.rightsWindowEnd && Math.floor(Date.now()/1000) >= p.cycleData.rightsWindowEnd;
                          return (
                            <span style={{ fontSize:9, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, padding:'2px 6px', borderRadius:3, background: expired ? 'rgba(255,159,28,0.15)' : 'rgba(34,211,238,0.1)', color: expired ? '#FF9F1C' : '#22D3EE', border: expired ? '1px solid rgba(255,159,28,0.3)' : '1px solid rgba(34,211,238,0.25)' }}>
                              {expired ? '⚡ READY TO ACTIVATE' : '🛡 RIGHTS WINDOW'}
                            </span>
                          );
                        })()}
                        {p.cycleData.status==='ACTIVE' && <span style={{ fontSize:9, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(139,92,246,0.13)', color:'#22D3EE', border:'1px solid rgba(139,92,246,0.28)' }}>● OPEN</span>}
                      </>
                    ) : (
                      <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>No active cycle · launch one to begin</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize:14, opacity:expandedId===p.id?0.6:1 }}>{expandedId===p.id?'▼':'▶'}</span>
              </div>

              {expandedId === p.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #1a2438', animation:'slideDown 0.15s ease' }}>
                  {/* Cycle status banner — behavior depends on whether a cycle
                      exists on-chain and what state it's in */}
                  {(() => {
                    const busy = openingCycleFor === (p.mint || p.id);
                    const cd = p.cycleData;
                    const hasScheduledCycle = cd && (cd.status === 'RIGHTS_WINDOW' || cd.status === 'rightsWindow');
                    const hasActiveCycle = cd && cd.status === 'ACTIVE';
                    const hasEndedCycle = cd && (cd.status === 'CLOSED' || cd.status === 'TERMINATED' || cd.status === 'ENDED');
                    const needsFirstCycle = !cd; // no cycle on-chain yet

                    if (hasActiveCycle) return null; // active cycle = no banner here

                    if (hasScheduledCycle) {
                      const activatesAt = cd.activatesAt;
                      const rightsWindowEnd = cd.rightsWindowEnd;
                      const windowOpensAt = activatesAt ?? (rightsWindowEnd ? rightsWindowEnd - 60 : null);
                      const fmt = (unix) => unix ? new Date(unix * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                      return (
                        <div style={{ background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:7, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                          <div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>🛡 Cycle scheduled</div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>
                              Public buying opens {fmt(windowOpensAt)} — on-chain, no second signature needed
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (hasEndedCycle) {
                      return (
                        <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:7, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                          <div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', fontWeight:600 }}>Cycle #{cd.id} ended</div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Open a new cycle with fresh allocation, curve, and schedule.</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); router.push(`/creator/cycle/new?mint=${p.mint || p.id}`); }}
                            style={{ background:'#FF9F1C', border:'none', borderRadius:5, padding:'6px 14px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'#000', cursor:'pointer', letterSpacing:'0.04em', whiteSpace:'nowrap', minHeight:28 }}>
                            OPEN NEW CYCLE →
                          </button>
                        </div>
                      );
                    }

                    if (needsFirstCycle) {
                      return (
                        <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:7, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                          <div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', fontWeight:600 }}>No active cycle</div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>
                              {p.cyclePending ? 'First cycle tx didn\'t land. Retry in one click:' : 'Open a new cycle to start raising.'}
                            </div>
                          </div>
                          <button onClick={e => handleOpenFirstCycle(e, p)}
                            disabled={busy}
                            style={{ background: busy ? 'var(--panel-alt)' : '#FF9F1C', border: busy ? '1px solid var(--border)' : 'none', borderRadius:5, padding:'6px 14px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color: busy ? 'var(--text-muted)' : '#000', cursor: busy ? 'not-allowed' : 'pointer', letterSpacing:'0.04em', whiteSpace:'nowrap', minHeight:28, opacity: busy ? 0.7 : 1 }}>
                            {busy ? 'OPENING...' : 'LAUNCH CYCLE →'}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="creator-project-stats" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                    {[
                      { k:'Current price', v:`${p.price.toFixed(5)} SOL`, c:'#22D3EE' },
                      { k:'24h change', v:`${p.change>=0?'▲':'▼'} ${Math.abs(p.change).toFixed(1)}%`, c:p.change>=0?'#22D3EE':'#F43F5E' },
                      { k:'24h volume', v:`${p.volume} SOL`, c:'var(--text-dim)' },
                      { k:'Total raised', v:p.raised, c:'var(--text-dim)' },
                    ].map((x,i) => (
                      <div key={i} style={{ background:'var(--panel)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 10px' }}>
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:3 }}>{x.k}</div>
                        <div style={{ fontSize:12, color:x.c, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{x.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* ── Project details editor (image, description, links) ── */}
                  <MetadataEditor project={p} />
                  {/* ── Visibility / reveal date editor ── */}
                  <RevealEditor project={p} />


                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={e => { e.stopPropagation(); goToToken(p); }}
                      style={{ flex:1, padding:'10px 0', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#22D3EE', cursor:'pointer', letterSpacing:'0.04em', transition:'all 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='#8B5CF6'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.28)'}>
                      VIEW PROJECT →
                    </button>
                    <button onClick={e => { e.stopPropagation(); setEmbedModal(p); }}
                      style={{ padding:'10px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'var(--text-dim)', cursor:'pointer', transition:'all 0.12s', flexShrink:0 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#FF9F1C'; e.currentTarget.style.color='#FF9F1C'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-dim)'; }}
                      title="Get embed code">
                      {'</>'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); setTgModal(p); }}
                      style={{ padding:'10px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-dim)', cursor:'pointer', transition:'all 0.12s', flexShrink:0 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#29B6F6'; e.currentTarget.style.color='#29B6F6'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-dim)'; }}
                      title="Telegram Mini App setup">
                      ✈️
                    </button>
                    <button onClick={e => { e.stopPropagation(); setAgentModal(p); }}
                      style={{ padding:'10px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-dim)', cursor:'pointer', transition:'all 0.12s', flexShrink:0 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#22D3EE'; e.currentTarget.style.color='#22D3EE'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-dim)'; }}
                      title="Configure AI agent access">
                      🤖
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>}

        {/* Portfolio tab */}
        {activeTab === 'portfolio' && (
          <div>
            {portfolio.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 16px' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>📊</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:6 }}>No holdings yet</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>Tokens you buy on Mammoth will appear here.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {/* Portfolio summary */}
                {(() => {
                  const totalSpent = portfolio.reduce((s, p) => s + p.totalSol, 0);
                  return (
                    <div style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>{portfolio.length} token{portfolio.length > 1 ? 's' : ''} held</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>Total spent: <span style={{ color:'var(--text)', fontWeight:700 }}>{totalSpent.toFixed(4)} SOL</span></span>
                    </div>
                  );
                })()}
                {portfolio.map((pos) => {
                  const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'2-digit' });
                  const fmt = (n) => n >= 0.01 ? n.toFixed(4) : n.toPrecision(3);
                  // Look up current price from all projects if available
                  const liveProject = myProjects?.find(p => String(p.mint || p.id) === String(pos.mintAddress));
                  const currentPrice = liveProject?.price || pos.avgPrice;
                  const currentCycle = liveProject?.cycle || liveProject?.cycleData?.id || 0;
                  const hasNewCycle = currentCycle > (pos.lastBuy?.cycleId || 0);
                  const newCycleOpen = hasNewCycle && liveProject?.status === 'ACTIVE';
                  const currentValue = pos.totalTokens * currentPrice;
                  const pnlSol = currentValue - pos.totalSol;
                  const pnlPct = pos.totalSol > 0 ? (pnlSol / pos.totalSol) * 100 : 0;
                  const up = pnlSol >= 0;
                  const cycleOpen = pos.cycleStatus === 'ACTIVE';
                  return (
                    <div key={pos.mintAddress} style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:9, padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>{pos.name || pos.ticker}</span>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', background:'var(--badge-bg)', border:'1px solid #252848', borderRadius:3, padding:'1px 6px' }}>${pos.ticker}</span>
                            {cycleOpen && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'#22D3EE', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'1px 6px', fontWeight:700 }}>CYCLE OPEN</span>}
                            {hasNewCycle && !cycleOpen && (
                              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'#FF9F1C', background:'rgba(255,159,28,0.1)', border:'1px solid rgba(255,159,28,0.3)', borderRadius:3, padding:'1px 6px', fontWeight:700 }}>
                                {newCycleOpen ? '🔔 NEW CYCLE OPEN' : '🔔 NEW CYCLE'}
                              </span>
                            )}
                          </div>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>
                            {pos.buyCount} buy{pos.buyCount > 1 ? 's' : ''} · last {fmtDate(pos.lastBuy.ts)}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color: up ? '#10B981' : '#F43F5E' }}>
                            {up ? '+' : ''}{fmt(pnlSol)} SOL
                          </div>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color: up ? '#10B981' : '#F43F5E' }}>
                            {up ? '+' : ''}{pnlPct.toFixed(1)}% P&L
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                        {[
                          { label:'Holdings', value:`${pos.totalTokens.toLocaleString()}` },
                          { label:'Avg price', value:`${pos.avgPrice.toPrecision(3)} SOL` },
                          { label:'Current val', value:`${fmt(currentValue)} SOL`, color:'#22D3EE' },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background:'var(--panel-alt)', borderRadius:5, padding:'7px 8px' }}>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color: color || 'var(--text)' }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Drafts tab */}
        {activeTab === 'drafts' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {drafts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:10 }}>📝</div>
                No drafts saved yet.<br/>
                <span style={{ fontSize:10, opacity:0.7 }}>Use the wizard to save a draft or schedule a launch.</span>
              </div>
            ) : drafts.map(draft => {
              const isScheduled = !!draft.scheduledFor;
              const launchTime = isScheduled ? new Date(draft.scheduledFor) : null;
              const msUntil = launchTime ? launchTime - now : null;
              const ready = msUntil !== null && msUntil <= 0;
              const hrsUntil = msUntil ? Math.floor(msUntil / 3600000) : 0;
              const minsUntil = msUntil ? Math.floor((msUntil % 3600000) / 60000) : 0;

              return (
                <div key={draft.id} className="draft-card" style={{ background:'var(--panel-alt)', border:`1px solid ${ready ? 'rgba(255,159,28,0.3)' : '#1d2540'}`, borderRadius:10, padding:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>
                        {draft.name || 'Unnamed Token'}
                        {draft.ticker && <span style={{ fontSize:11, color:'var(--text-dim)', marginLeft:6 }}>/ ${draft.ticker.toUpperCase()}</span>}
                      </div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:3 }}>
                        Saved {new Date(draft.savedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                        {isScheduled && (
                          <span style={{ marginLeft:8, color: ready ? '#FF9F1C' : '#22D3EE', fontWeight:600 }}>
                            {ready ? '⚡ READY TO LAUNCH' : `⏰ launches in ${hrsUntil}h ${minsUntil}m`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteDraft(draft.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:14, lineHeight:1, padding:'0 0 0 8px' }} title="Delete draft">✕</button>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                    {[
                      ['Supply', draft.supplyMode || '—'],
                      ['Start price', draft.startPrice ? `${draft.startPrice} SOL` : '—'],
                      ['Allocation', draft.initialAllocation ? `${Number(draft.initialAllocation).toLocaleString()} tokens` : '—'],
                      ['Curve', draft.curveType || '—'],
                    ].map(([k,v],i) => (
                      <div key={i} style={{ background:'var(--panel)', border:'1px solid #1a2438', borderRadius:5, padding:'6px 9px' }}>
                        <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</div>
                        <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => onResumeDraft?.(draft)}
                      style={{ flex:1, padding:'9px 0', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'#A78BFA', cursor:'pointer' }}>
                      ✏️ EDIT & LAUNCH
                    </button>
                    {(ready || !isScheduled) && (
                      <button onClick={() => onResumeDraft?.(draft, true)}
                        style={{ flex:1, padding:'9px 0', background: ready ? '#FF9F1C' : 'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color: ready ? '#000' : '#fff', cursor:'pointer' }}>
                        🚀 LAUNCH
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {manageModal && (
        <CycleManagerModal cycle={manageModal.cycleData} project={manageModal} onClose={() => setManageModal(null)} onLaunchCycle={onLaunchCycle} onTerminate={() => onTerminateProject?.(manageModal.id)}/>
      )}
      {embedModal && <EmbedModal project={embedModal} onClose={() => setEmbedModal(null)} />}
      {tgModal && <TelegramSetupModal project={tgModal} onClose={() => setTgModal(null)} />}
      {agentModal && <ConfigureAgentModal project={agentModal} onClose={() => setAgentModal(null)} />}
    </div>
  );
}
