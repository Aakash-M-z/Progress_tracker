import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CODE_LINES,
  flattenLine,
  drawScreen,
  tickTyping,
  type TypeState,
} from './drawScreenContent';

interface MonitorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scrollProgress?: number;
  onBreathPhase?: (phase: number) => void;
}

// 2× resolution for sharp canvas texture — renders crisp at any camera distance
const TEX_W = 2048;
const TEX_H = 1280;

export function Monitor({ position = [0, 0, 0], rotation = [0, 0, 0], scrollProgress = 0, onBreathPhase }: MonitorProps) {
  const reflectionRef = useRef<THREE.Mesh>(null);
  const screenMeshRef = useRef<THREE.Mesh>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const lastUpdateRef = useRef(0);

  // ── Offscreen canvas + texture ─────────────────────────────────────────────
  const offscreen = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = TEX_W;
    c.height = TEX_H;
    return c;
  }, []);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(offscreen);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4);
    return tex;
  }, [offscreen, gl]);

  // ── Typing state ───────────────────────────────────────────────────────────
  const typeState = useRef<TypeState>({
    line: 0,
    col: 0,
    done: false,
    cps: 32,
    lastTick: 0,
    pauseUntil: 0,
  });

  const visibleChars = useRef<number[]>(CODE_LINES.map(() => 0));

  // ── Breath phase for glow ──────────────────────────────────────────────────
  const breathPhase = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const bp = (Math.sin(t * (Math.PI / 4.5)) + 1) / 2;
    breathPhase.current = bp;
    onBreathPhase?.(bp);

    // Advance typing
    const changed = tickTyping(typeState.current, visibleChars.current, performance.now());

    // Throttle texture updates to ~24fps (every 40ms) to avoid CPU-to-GPU bandwidth bottlenecks
    const now = performance.now();
    if (changed || now - lastUpdateRef.current > 40) {
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        drawScreen(ctx, t, TEX_W, TEX_H, visibleChars.current, typeState.current);
        texture.needsUpdate = true;
      }
      lastUpdateRef.current = now;
    }

    // Desk reflection breathes with screen
    if (reflectionRef.current) {
      const mat = reflectionRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.04 + bp * 0.07;
    }

    // Outer glow ring pulses
    if (glowRingRef.current) {
      const mat = glowRingRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.06 + bp * 0.12;
    }
  });

  // Matte premium bezel material
  const bezelMat: Partial<THREE.MeshStandardMaterialParameters> = {
    color: '#0b0b0b',
    roughness: 0.72,
    metalness: 0.18,
  };

  // Soft-matte stand material (no harsh mirror)
  const standMat: Partial<THREE.MeshStandardMaterialParameters> = {
    color: '#0d0d0d',
    roughness: 0.70,
    metalness: 0.20,
  };

  return (
    <group position={position} rotation={rotation}>
      {/* ── Stand base ── */}
      <mesh position={[0, -0.72, 0]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.025, 48]} />
        <meshStandardMaterial {...standMat} />
      </mesh>

      {/* ── Stand neck ── */}
      <mesh position={[0, -0.46, 0.03]} receiveShadow>
        <boxGeometry args={[0.038, 0.52, 0.038]} />
        <meshStandardMaterial {...standMat} />
      </mesh>

      {/* ── Stand arm connector ── */}
      <mesh position={[0, -0.22, 0.02]} castShadow>
        <boxGeometry args={[0.18, 0.038, 0.038]} />
        <meshStandardMaterial {...standMat} />
      </mesh>

      {/* ── Monitor outer frame (premium matte bezel) ── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.72, 0.036]} />
        <meshStandardMaterial {...bezelMat} />
      </mesh>

      {/* ── Inner frame lip — subtle dark inset ── */}
      <mesh position={[0, 0, 0.016]}>
        <boxGeometry args={[1.08, 0.65, 0.005]} />
        <meshStandardMaterial color="#050505" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* ── Screen — 2× res canvas texture, sharp and crisp ── */}
      <mesh ref={screenMeshRef} position={[0, 0.005, 0.022]}>
        <planeGeometry args={[1.04, 0.61]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* ── Screen glass glare (top strip) ── */}
      <mesh position={[0, 0.21, 0.024]}>
        <planeGeometry args={[1.04, 0.08]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.018}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Screen backlight halo — soft glow behind bezel ── */}
      <mesh ref={glowRingRef} position={[0, 0, -0.024]}>
        <planeGeometry args={[1.22, 0.78]} />
        <meshStandardMaterial
          color="#4060ff"
          emissive="#4060ff"
          emissiveIntensity={0.08}
          transparent
          opacity={0.0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Screen ambient point light (drives scene glow) ── */}
      <pointLight
        position={[0, 0, 0.42]}
        color="#7c6aff"
        intensity={0.3 + scrollProgress * 0.5}
        distance={3.2}
        decay={2}
      />

      {/* ── Secondary warm accent light from lower-right ── */}
      <pointLight
        position={[0.55, -0.28, 0.36]}
        color="#4080ff"
        intensity={0.06 + scrollProgress * 0.08}
        distance={2}
        decay={2}
      />

      {/* ── Desk reflection (faint colour bleed onto surface) ── */}
      <mesh ref={reflectionRef} position={[0, -0.65, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshStandardMaterial
          color="#5040ff"
          emissive="#5040ff"
          emissiveIntensity={1}
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
