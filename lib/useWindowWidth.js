'use client';
import { useState, useEffect } from 'react';

export function useWindowWidth() {
  const [width, setWidth] = useState(1200); // safe SSR default
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Before mount (SSR / hydration), always return wide so server HTML matches
  if (!mounted) return 1200;
  return width;
}
