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
      const count = 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.5;
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
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.3,
          alpha: 0.4 + Math.random() * 0.35,
          decay: 0.006 + Math.random() * 0.008,
          size: 0.8 + Math.random() * 1.6,
          color: col,
          trail: [],
          dust: true,
        });
      }
    };

    // ── Full supernova on click ─────────────────────────────────────────────
    const spawnSupernova = (x, y) => {
      const count = 55;

      // Shockwave ring
      rings.current.push({
        x, y,
        r: 0,
        maxR: 120 + Math.random() * 80,
        alpha: 0.7,
        decay: 0.014,
        width: 2,
      });
      // Second fainter ring
      rings.current.push({
        x, y,
        r: 0,
        maxR: 80 + Math.random() * 50,
        alpha: 0.35,
        decay: 0.009,
        width: 1,
      });

      // Central stellar flash
      particles.current.push({
        x, y, vx: 0, vy: 0,
        alpha: 1, decay: 0.025,
        size: 22, color: 'rgba(255,255,255,',
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
        const isFast = Math.random() > 0.4;
        const speed = isFast
          ? 1.2 + Math.random() * 2.8
          : 0.2 + Math.random() * 0.8;
        const col = palettes[Math.floor(Math.random() * palettes.length)];
        const size = isFast
          ? 1.0 + Math.random() * 1.8
          : 2.0 + Math.random() * 3.5;  // slow = bigger nebula puffs
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.7 + Math.random() * 0.3,
          decay: isFast
            ? 0.008 + Math.random() * 0.01
            : 0.003 + Math.random() * 0.005,
          size,
          color: col,
          trail: [],
          dust: false,
          gravity: 0,
          drag: isFast ? 0.985 : 0.998,
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
        ctx.lineWidth = r.width + (1 - progress) * 2;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#8B5CF6';
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
          ctx.globalAlpha = p.alpha * 0.55;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(255,255,255,1)');
          grad.addColorStop(0.3, 'rgba(200,220,255,0.8)');
          grad.addColorStop(1, 'rgba(139,92,246,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.alpha -= p.decay;
          p.size *= 1.12;
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
        ctx.shadowBlur = p.dust ? 6 : 14;
        ctx.shadowColor = p.color + '0.9)';
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
    const isInteractive = (el) =>
      el && (
        ['button','a','input','textarea','select','label'].includes(el.tagName.toLowerCase()) ||
        el.closest('button, a, input, textarea, [role="button"]')
      );

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
