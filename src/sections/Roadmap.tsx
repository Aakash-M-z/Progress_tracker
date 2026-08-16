import { useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn } from '@/animations/variants';

const ROADMAP_NODES = [
  { id: 'core', label: 'AI Core', angle: 0, radius: 0, isCenter: true },
  { id: 'dsa', label: 'DSA', angle: 0, radius: 160 },
  { id: 'java', label: 'Java', angle: 51, radius: 160 },
  { id: 'spring', label: 'Spring Boot', angle: 102, radius: 160 },
  { id: 'sysdesign', label: 'System Design', angle: 153, radius: 160 },
  { id: 'aws', label: 'AWS', angle: 204, radius: 160 },
  { id: 'ai', label: 'AI/ML', angle: 255, radius: 160 },
  { id: 'fullstack', label: 'Full Stack', angle: 306, radius: 160 },
  // Outer tier
  { id: 'arrays', label: 'Arrays', angle: 345, radius: 280 },
  { id: 'graphs', label: 'Graphs', angle: 25, radius: 280 },
  { id: 'dp', label: 'Dynamic Prog.', angle: 65, radius: 280 },
  { id: 'microservices', label: 'Microservices', angle: 115, radius: 280 },
  { id: 'kafka', label: 'Kafka', angle: 155, radius: 280 },
  { id: 'cdn', label: 'CDN & Caching', angle: 195, radius: 280 },
  { id: 'lambda', label: 'Lambda', angle: 235, radius: 280 },
  { id: 'react', label: 'React', angle: 275, radius: 280 },
  { id: 'node', label: 'Node.js', angle: 315, radius: 280 },
];

const CONNECTIONS = [
  ['core', 'dsa'], ['core', 'java'], ['core', 'spring'], ['core', 'sysdesign'],
  ['core', 'aws'], ['core', 'ai'], ['core', 'fullstack'],
  ['dsa', 'arrays'], ['dsa', 'graphs'], ['dsa', 'dp'],
  ['spring', 'microservices'],
  ['sysdesign', 'kafka'], ['sysdesign', 'cdn'],
  ['aws', 'lambda'],
  ['fullstack', 'react'], ['fullstack', 'node'],
];

function getNodePos(node: typeof ROADMAP_NODES[number], cx: number, cy: number) {
  if ('isCenter' in node && node.isCenter) return { x: cx, y: cy };
  const rad = (node.angle * Math.PI) / 180;
  return {
    x: cx + node.radius * Math.cos(rad),
    y: cy + node.radius * Math.sin(rad),
  };
}

export function Roadmap() {
  const ref = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-10%' });

  const CX = 340;
  const CY = 300;

  const nodePositions = ROADMAP_NODES.reduce(
    (acc, node) => {
      acc[node.id] = getNodePos(node, CX, CY);
      return acc;
    },
    {} as Record<string, { x: number; y: number }>
  );

  return (
    <section
      ref={ref}
      id="roadmap"
      className="relative py-32 lg:py-40 px-6 lg:px-12 overflow-hidden"
      data-testid="roadmap-section"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.span
              variants={fadeIn}
              className="inline-block text-white/35 text-[11px] font-medium letter-widest uppercase tracking-[0.2em] mb-5"
            >
              Learning Paths
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-[40px] sm:text-[52px] font-bold leading-[1.0] letter-tight text-white mb-5"
            >
              Your roadmap.
              <br />
              <span className="text-white/40">Alive.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-lg leading-relaxed mb-8">
              A living knowledge tree that grows with you. Every branch represents a domain. Every node is a milestone you can own.
            </motion.p>

            <motion.div variants={staggerContainer} className="space-y-4">
              {['DSA & Algorithms', 'Java + Spring Boot', 'System Design', 'AWS & Cloud', 'AI / ML Fundamentals', 'Full-Stack Development'].map((track) => (
                <motion.div
                  key={track}
                  variants={fadeUp}
                  className="flex items-center gap-3 text-white/55 text-sm"
                >
                  <div className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                  {track}
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10">
              <a
                href="#pricing"
                className="
                  inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                  bg-white text-black text-sm font-semibold
                  hover:bg-white/90 active:scale-[0.98]
                  transition-all duration-200 hover:scale-[1.02]
                "
                data-testid="roadmap-cta"
              >
                Explore all paths
              </a>
            </motion.div>
          </motion.div>

          {/* Right — SVG roadmap visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            className="relative"
            data-testid="roadmap-visualization"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 680 600"
              className="w-full max-w-[520px] mx-auto"
              style={{ overflow: 'visible' }}
            >
              {/* Connection lines */}
              {CONNECTIONS.map(([fromId, toId]) => {
                const from = nodePositions[fromId];
                const to = nodePositions[toId];
                if (!from || !to) return null;
                return (
                  <motion.line
                    key={`${fromId}-${toId}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                );
              })}

              {/* Nodes */}
              {ROADMAP_NODES.map((node, i) => {
                const pos = nodePositions[node.id];
                const isCenter = 'isCenter' in node && node.isCenter;
                const isInner = node.radius === 160;

                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.07 }}
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  >
                    {/* Node glow */}
                    {isCenter && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={28}
                        fill="rgba(255,255,255,0.04)"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isCenter ? 18 : isInner ? 12 : 8}
                      fill={isCenter ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.05)'}
                      stroke={isCenter ? 'rgba(255,255,255,1)' : isInner ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={isCenter ? 0 : 1}
                      className="cursor-pointer"
                      style={{ filter: isCenter ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none' }}
                    />

                    {/* Inner dot for non-center */}
                    {!isCenter && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isInner ? 3 : 2}
                        fill="rgba(255,255,255,0.7)"
                      />
                    )}

                    {/* Label */}
                    <text
                      x={pos.x}
                      y={pos.y + (isCenter ? 32 : isInner ? 22 : 18)}
                      textAnchor="middle"
                      fill={isCenter ? 'rgba(255,255,255,0.6)' : isInner ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)'}
                      fontSize={isCenter ? 10 : isInner ? 10 : 9}
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                      letterSpacing="0.08em"
                    >
                      {node.label}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
