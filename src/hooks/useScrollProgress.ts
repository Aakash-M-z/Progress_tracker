import { useState, useEffect, useRef } from 'react';
import type { ScrollState } from '@/types';

export function useScrollProgress() {
  const [scrollState, setScrollState] = useState<ScrollState>({
    progress: 0,
    scrollY: 0,
    direction: 'down',
  });
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const currentScrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? currentScrollY / maxScroll : 0;
        const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';

        // Only update if difference is meaningful
        if (Math.abs(currentScrollY - lastScrollY.current) > 3) {
          lastScrollY.current = currentScrollY;
          setScrollState({ progress, scrollY: currentScrollY, direction });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return scrollState;
}
