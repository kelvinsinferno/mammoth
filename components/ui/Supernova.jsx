'use client';
import { useEffect, useRef } from 'react';

export default function Supernova() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particles = useRef([]);
  const rings = useRef([]);
  const stars = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-seed background stars on resize
      stars.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2,
        alpha: 0.15 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Cosmic dust particle spawned by mouse move ──────────────────────────
    const spawnDust = (x, y) => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 1.2;
        // Deep space palette: pale blue, purple nebula, faint cyan, dim white
        const palettes = [
          `rgba(167,139,250,`,   // lavender
          `rgba(34,211,238,`,    // faint cyan
          `rgba(200,220,255,`,   // pale starlight
          `rgba(139,92,246,`,    // nebula purple
          `rgba(255,255,255,`,   // stellar white
        ];
        const col = palettes[Math.floor(Math.random() * palettes.length)];
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.5,
          alpha: 0.7 + Math.random() * 0.3,
          decay: 0.008 + Math.random() * 0.010,
          size: 1.5 + Math.random() * 3.0,
          color: col,
          trail: [],
          dust: true,
        });
      }
    };

    // ── Full supernova on click ─────────────────────────────────────────────
    const spawnSupernova = (x, y) => {
      const count = 90;

      // Three shockwave rings — different speeds and sizes
      rings.current.push({ x, y, r: 0, maxR: 280 + Math.random() * 120, alpha: 0.9, decay: 0.010, width: 3 });
      rings.current.push({ x, y, r: 0, maxR: 180 + Math.random() * 80,  alpha: 0.6, decay: 0.007, width: 2 });
      rings.current.push({ x, y, r: 0, maxR: 100 + Math.random() * 60,  alpha: 0.4, decay: 0.005, width: 1.5 });

      // Central stellar flash — bigger, longer
      particles.current.push({
        x, y, vx: 0, vy: 0,
        alpha: 1, decay: 0.016,
        size: 60, color: 'rgba(255,255,255,',
        flash: true, trail: [],
      });
      // Secondary orange flash
      particles.current.push({
        x, y, vx: 0, vy: 0,
        alpha: 0.8, decay: 0.012,
        size: 40, color: 'rgba(255,180,80,',
        flash: true, trail: [],
      });

      const palettes = [
        'rgba(200,220,255,',   // pale blue stellar core
        'rgba(139,92,246,',    // deep purple nebula
        'rgba(167,139,250,',   // lavender cloud
        'rgba(34,211,238,',    // ionized cyan
        'rgba(255,200,120,',   // dying star amber
        'rgba(255,120,80,',    // red giant ember
        'rgba(255,255,255,',   // stellar white
      ];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        // Speed varies a lot — some slow nebula wisps, some fast ejecta
        const isFast = Math.random() > 0.35;
        const speed = isFast
          ? 2.5 + Math.random() * 5.5
          : 0.4 + Math.random() * 1.5;
        const col = palettes[Math.floor(Math.random() * palettes.length)];
        const size = isFast
          ? 1.5 + Math.random() * 3.0
          : 4.0 + Math.random() * 6.0;  // slow = big nebula puffs
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.85 + Math.random() * 0.15,
          decay: isFast
            ? 0.005 + Math.random() * 0.007
            : 0.002 + Math.random() * 0.003,
          size,
          color: col,
          trail: [],
          dust: false,
          gravity: 0,
          drag: isFast ? 0.982 : 0.997,
        });
      }
    };

    // ── Draw loop ───────────────────────────────────────────────────────────
    let tick = 0;
    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Twinkling background stars
      for (const s of stars.current) {
        s.twinkle += 0.012;
        const a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#d0e8ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Shockwave rings
      rings.current = rings.current.filter(r => r.alpha > 0.01);
      for (const r of rings.current) {
        const progress = r.r / r.maxR;
        r.r += (r.maxR - r.r) * 0.06 + 0.8;  // accelerates then slows
        r.alpha -= r.decay;
        ctx.save();
        ctx.globalAlpha = r.alpha * (1 - progress * 0.5);
        ctx.strokeStyle = `rgba(167,139,250,1)`;
        ctx.lineWidth = r.width + (1 - progress) * 4;
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#A78BFA';
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Particles
      particles.current = particles.current.filter(p => p.alpha > 0.005);
      for (const p of particles.current) {

        // Flash (central glow)
        if (p.flash) {
          ctx.save();
          ctx.globalAlpha = p.alpha * 0.85;
          ctx.shadowBlur = 60;
          ctx.shadowColor = p.color + '1)';
          const isOrange = p.color.includes('255,180');
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, isOrange ? 'rgba(255,240,200,1)' : 'rgba(255,255,255,1)');
          grad.addColorStop(0.2, isOrange ? 'rgba(255,180,80,0.9)' : 'rgba(210,230,255,0.9)');
          grad.addColorStop(0.55, isOrange ? 'rgba(200,80,20,0.5)' : 'rgba(139,92,246,0.5)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.alpha -= p.decay;
          p.size *= 1.18;
          continue;
        }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        const trailLen = p.dust ? 4 : 9;
        if (p.trail.length > trailLen) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.save();
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length;
            ctx.globalAlpha = p.alpha * t * (p.dust ? 0.2 : 0.3);
            ctx.strokeStyle = p.color + '1)';
            ctx.lineWidth = p.size * t * (p.dust ? 0.5 : 0.8);
            ctx.lineCap = 'round';
            ctx.shadowBlur = p.dust ? 4 : 10;
            ctx.shadowColor = p.color + '0.8)';
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Particle glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color + '1)';
        ctx.shadowBlur = p.dust ? 14 : 30;
        ctx.shadowColor = p.color + '1)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        if (p.drag) { p.vx *= p.drag; p.vy *= p.drag; }
        else { p.vx *= 0.99; p.vy *= 0.99; }
        p.alpha -= p.decay;
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    // ── Events ──────────────────────────────────────────────────────────────
    // Treat anything that looks clickable/typeable/UI-chromed as interactive.
    // Walk up the tree so an icon inside a clickable div also counts.
    const INTERACTIVE_SELECTOR = [
      'button',
      'a[href]',
      'input',
      'textarea',
      'select',
      'label',
      'summary',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="switch"]',
      '[role="slider"]',
      '[role="textbox"]',
      '[role="combobox"]',
      '[role="listbox"]',
      '[role="dialog"]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
      '[data-supernova-ignore]',
    ].join(',');

    const isInteractive = (el) => {
      if (!el) return true;
      if (el.closest?.(INTERACTIVE_SELECTOR)) return true;
      // Walk ancestors; any element with cursor:pointer is a UI feature.
      // Stops at body to keep this cheap.
      let node = el;
      while (node && node !== document.body && node !== document.documentElement) {
        if (node.nodeType === 1) {
          const cursor = window.getComputedStyle(node).cursor;
          if (cursor === 'pointer' || cursor === 'text') return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    // Mouse move → cosmic dust on background only
    const onMouseMove = (e) => {
      if (isInteractive(e.target)) return;
      spawnDust(e.clientX, e.clientY);
    };

    // Click → full supernova on background only
    const onClick = (e) => {
      if (isInteractive(e.target)) return;
      spawnSupernova(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }}
    />
  );
}
