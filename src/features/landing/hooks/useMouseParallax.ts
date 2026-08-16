import { useState, useEffect, useCallback, useRef } from 'react';

interface MousePosition {
    x: number;
    y: number;
    normalizedX: number;
    normalizedY: number;
}

interface UseMouseParallaxOptions {
    strength?: number;
    ease?: number;
}

export function useMouseParallax(options: UseMouseParallaxOptions = {}) {
    const { strength = 1, ease = 0.08 } = options;
    const [position, setPosition] = useState<MousePosition>({
        x: 0,
        y: 0,
        normalizedX: 0,
        normalizedY: 0,
    });
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);

    const animate = useCallback(() => {
        const dx = targetRef.current.x - currentRef.current.x;
        const dy = targetRef.current.y - currentRef.current.y;

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            currentRef.current.x += dx * ease;
            currentRef.current.y += dy * ease;

            setPosition({
                x: currentRef.current.x * strength,
                y: currentRef.current.y * strength,
                normalizedX: currentRef.current.x,
                normalizedY: currentRef.current.y,
            });
        }

        rafRef.current = requestAnimationFrame(animate);
    }, [ease, strength]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            targetRef.current.x = (e.clientX - centerX) / centerX;
            targetRef.current.y = (e.clientY - centerY) / centerY;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, [animate]);

    return position;
}
