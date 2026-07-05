import { useState, useEffect, useRef } from 'react';
import type { ScrollState } from '@/types';

export function useScrollProgress() {
  const [scrollState, setScrollState] = useState<ScrollState>({
    progress: 0,
    scrollY: 0,
    direction: 'down',
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';

      lastScrollY.current = scrollY;

      setScrollState({ progress, scrollY, direction });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollState;
}
