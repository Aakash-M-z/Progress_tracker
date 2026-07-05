import { useEffect, useRef } from 'react';
import {
  CODE_LINES,
  flattenLine,
  drawScreen,
  tickTyping,
  type TypeState,
} from './drawScreenContent';

interface SceneFallbackProps {
  mouseX?: number;
  mouseY?: number;
  scrollProgress?: number;
}

export function SceneFallback({ mouseX = 0, mouseY = 0 }: SceneFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(performance.now());

  const typeState = useRef<TypeState>({
    line: 0,
    col: 0,
    done: false,
    cps: 32,
    lastTick: 0,
    pauseUntil: 0,
  });

  const visibleRef = useRef<number[]>(CODE_LINES.map(() => 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const draw = () => {
      const now = performance.now();
      const t = (now - startRef.current) / 1000;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      ctx.clearRect(0, 0, W, H);

      tickTyping(typeState.current, visibleRef.current, now);

      // ── Monitor layout — shifted to the right ─────────────────────────────
      const parallaxX = mouseX * -10;
      const parallaxY = mouseY * -6;

      // Monitor center: 74% from left — clearly on right half
      const mx = W * 0.74 + parallaxX;
      const my = H * 0.47 + parallaxY;

      const monW = Math.min(W * 0.62, 600);
      const monH = monW * 0.622;
      const frameP = monW * 0.018;
      const scrW = monW - frameP * 2;
      const scrH = monH;
      const scrX = mx - monW / 2 + frameP;
      const scrY = my - monH / 2;

      // ── Ambient glow ──────────────────────────────────────────────────────
      const breath = (Math.sin(t * (Math.PI / 4.5)) + 1) / 2;
      const glowG = ctx.createRadialGradient(mx, my, monW * 0.08, mx, my, monW * 0.9);
      glowG.addColorStop(0, `rgba(100,60,220,${0.07 + breath * 0.07})`);
      glowG.addColorStop(0.5, `rgba(60,40,160,${0.025 + breath * 0.025})`);
      glowG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowG;
      ctx.fillRect(mx - monW, my - monH, monW * 2, monH * 2);

      // ── Stand ─────────────────────────────────────────────────────────────
      const standBot = my + monH / 2 + frameP;
      ctx.fillStyle = '#0d0d0d';
      ctx.beginPath(); ctx.roundRect(mx - 5, standBot, 10, 48, 2); ctx.fill();
      const baseW = monW * 0.27;
      ctx.fillStyle = '#0b0b0b';
      ctx.beginPath(); ctx.roundRect(mx - baseW / 2, standBot + 45, baseW, 7, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1; ctx.stroke();

      // ── Desk ──────────────────────────────────────────────────────────────
      const deskY = standBot + 52;
      ctx.fillStyle = '#070707';
      ctx.beginPath(); ctx.roundRect(mx - monW * 0.9, deskY, monW * 1.8, 7, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.032)'; ctx.lineWidth = 1; ctx.stroke();

      // Desk reflection
      const reflG = ctx.createLinearGradient(mx - monW * 0.5, deskY, mx + monW * 0.5, deskY);
      reflG.addColorStop(0, 'rgba(0,0,0,0)');
      reflG.addColorStop(0.5, `rgba(100,60,220,${0.06 + breath * 0.06})`);
      reflG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = reflG;
      ctx.fillRect(mx - monW * 0.55, deskY - 1, monW * 1.1, 5);

      // ── Frame ─────────────────────────────────────────────────────────────
      ctx.save();
      ctx.shadowColor = `rgba(80,40,200,${0.35 + breath * 0.22})`;
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#060606';
      ctx.beginPath(); ctx.roundRect(mx - monW / 2, my - monH / 2, monW, monH + frameP * 2, 8); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(mx - monW / 2, my - monH / 2, monW, monH + frameP * 2, 8); ctx.stroke();

      // ── Screen clip + content ─────────────────────────────────────────────
      ctx.save();
      ctx.beginPath(); ctx.roundRect(scrX, scrY, scrW, scrH, 3); ctx.clip();

      // Translate so drawScreen draws from (0,0)
      ctx.save();
      ctx.translate(scrX, scrY);
      drawScreen(ctx, t, scrW, scrH, visibleRef.current, typeState.current);
      ctx.restore();

      ctx.restore();

      // Screen top glare
      ctx.save();
      ctx.globalAlpha = 0.018;
      ctx.beginPath(); ctx.roundRect(scrX, scrY, scrW, scrH * 0.22, [3, 3, 0, 0]); ctx.clip();
      const glare = ctx.createLinearGradient(0, scrY, 0, scrY + scrH * 0.22);
      glare.addColorStop(0, 'rgba(255,255,255,1)');
      glare.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glare;
      ctx.fillRect(scrX, scrY, scrW, scrH * 0.22);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 60% 55% at 72% 48%, rgba(55,25,140,0.09) 0%, #000 58%)' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
