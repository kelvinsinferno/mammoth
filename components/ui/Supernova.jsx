'use client';
import { useEffect, useRef } from 'react';

export default function Supernova() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const idleTimer = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn a supernova burst at (x, y)
    const spawn = (x, y, count = 28) => {
      const colors = ['#8B5CF6', '#22D3EE', '#A78BFA', '#FF9F1C', '#10B981', '#F43F5E'];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 1.2 + Math.random() * 3.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 1.2 + Math.random() * 2.5;
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.85 + Math.random() * 0.15,
          decay: 0.012 + Math.random() * 0.018,
          size,
          color,
          trail: [],
        });
      }
      // Central flash
      particles.current.push({
        x, y, vx: 0, vy: 0,
        alpha: 1, decay: 0.04,
        size: 18 + Math.random() * 14,
        color: '#ffffff',
        flash: true,
        trail: [],
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(p => p.alpha > 0.01);

      for (const p of particles.current) {
        if (p.flash) {
          ctx.save();
          ctx.globalAlpha = p.alpha * 0.4;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.alpha -= p.decay;
          p.size *= 1.08;
          continue;
        }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.save();
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length;
            ctx.globalAlpha = p.alpha * t * 0.35;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * t * 0.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Particle dot
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vy += 0.03; // subtle gravity
        p.alpha -= p.decay;
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    // Click anywhere on page → spawn supernova
    const onClick = (e) => {
      // Don't spawn if clicking on an interactive element
      const tag = e.target.tagName.toLowerCase();
      const interactive = ['button', 'a', 'input', 'textarea', 'select', 'label'];
      if (interactive.includes(tag) || e.target.closest('button, a, input, textarea, [role="button"]')) return;
      spawn(e.clientX, e.clientY);
    };

    // Idle spawn — if mouse hasn't moved for 4s, spawn a small one at last position
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        const { x, y } = mouseRef.current;
        // Only spawn on idle if not over interactive element
        const el = document.elementFromPoint(x, y);
        if (!el) return;
        const tag = el.tagName.toLowerCase();
        const interactive = ['button', 'a', 'input', 'textarea', 'select'];
        if (!interactive.includes(tag) && !el.closest('button, a, input, textarea, [role="button"]')) {
          spawn(x, y, 14); // smaller idle burst
        }
      }, 4000);
    };

    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(idleTimer.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
