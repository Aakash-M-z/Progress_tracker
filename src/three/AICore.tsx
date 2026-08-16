import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface AICoreProps {
  position?: [number, number, number];
  scale?: number;
  onBreathPhase?: (phase: number) => void;
}

export function AICore({ position = [0, 0, 0], scale = 1, onBreathPhase }: AICoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coreDotRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const neuralGroupRef = useRef<THREE.Group>(null);

  const breathPhase = useRef(0);
  const lastNeuralTime = useRef(0);
  const activeNeuralLines = useRef(0);

  // ─── Orbiting particle positions (20 particles in elliptical orbits) ─────────
  const orbitData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      speed: 0.04 + Math.random() * 0.08,
      phase: (i / 24) * Math.PI * 2,
      a: 0.14 + Math.random() * 0.1,          // semi-major axis
      b: 0.06 + Math.random() * 0.07,          // semi-minor axis
      tilt: Math.random() * Math.PI,
      yOff: (Math.random() - 0.5) * 0.06,
      size: 0.003 + Math.random() * 0.004,
    }));
  }, []);

  // ─── Floating dust (invisible micro-particles) ───────────────────────────────
  const dustGeo = useMemo(() => {
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);  // stored in userData
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 0.28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3]     = (Math.random() - 0.5) * 0.0004;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.0004;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.0002;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    (geo as any).__vel = vel;
    return geo;
  }, []);

  // ─── Energy ring meshes ──────────────────────────────────────────────────────
  const ringMeshes = useRef<THREE.Mesh[]>([]);

  // ─── Neural line pool ────────────────────────────────────────────────────────
  const neuralPool = useRef<THREE.Line[]>([]);

  // ─── GSAP breathing on core ─────────────────────────────────────────────────
  useEffect(() => {
    if (!coreRef.current) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(breathPhase, {
      current: 1,
      duration: 4.5,
      ease: 'sine.inOut',
      onUpdate: () => onBreathPhase?.(breathPhase.current),
    }).to(breathPhase, {
      current: 0,
      duration: 4.5,
      ease: 'sine.inOut',
      onUpdate: () => onBreathPhase?.(breathPhase.current),
    });
    return () => { tl.kill(); };
  }, [onBreathPhase]);

  // ─── GSAP energy rings ───────────────────────────────────────────────────────
  useEffect(() => {
    ringMeshes.current.forEach((ring, i) => {
      if (!ring) return;
      const animate = () => {
        ring.scale.set(1, 1, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.15;
        gsap.fromTo(
          ring.scale,
          { x: 1, y: 1, z: 1 },
          {
            x: 1.8, y: 1.8, z: 1,
            duration: 5,
            delay: i * 1.0,
            ease: 'sine.out',
            repeat: -1,
            repeatDelay: i * 1.0,
          }
        );
        gsap.fromTo(
          mat,
          { opacity: 0.15 },
          {
            opacity: 0,
            duration: 5,
            delay: i * 1.0,
            ease: 'sine.out',
            repeat: -1,
            repeatDelay: i * 1.0,
          }
        );
      };
      animate();
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const bp = breathPhase.current; // 0→1→0

    // ─── Core breathing ───────────────────────────────────────────────────────
    if (coreRef.current) {
      const s = 1.0 + bp * 0.04;
      coreRef.current.scale.setScalar(s);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.92 + bp * 0.08;
      mat.emissiveIntensity = 0.7 + bp * 0.4;
    }

    // ─── Core dot ─────────────────────────────────────────────────────────────
    if (coreDotRef.current) {
      const mat = coreDotRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + bp * 1.5;
    }

    // ─── Light breathing ──────────────────────────────────────────────────────
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 0.3 + bp * 0.6;
      coreLightRef.current.distance = 1.0 + bp * 0.5;
    }

    // ─── Orbiting particles ───────────────────────────────────────────────────
    if (orbitGroupRef.current) {
      orbitGroupRef.current.children.forEach((child, i) => {
        const d = orbitData[i];
        const angle = t * d.speed + d.phase;
        const x = d.a * Math.cos(angle);
        const z = d.b * Math.sin(angle);
        const rotX = d.tilt;
        child.position.set(
          x * Math.cos(rotX),
          x * Math.sin(rotX) + d.yOff,
          z
        );
      });
    }

    // ─── Floating dust drift ──────────────────────────────────────────────────
    const dustPositions = dustGeo.getAttribute('position') as THREE.BufferAttribute;
    const vel = (dustGeo as any).__vel as Float32Array;
    const arr = dustPositions.array as Float32Array;
    const R = 0.28;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3]     += vel[i * 3];
      arr[i * 3 + 1] += vel[i * 3 + 1];
      arr[i * 3 + 2] += vel[i * 3 + 2];
      const dist = Math.sqrt(arr[i*3]**2 + arr[i*3+1]**2 + arr[i*3+2]**2);
      if (dist > R) {
        const scale2 = R / dist * 0.7;
        arr[i * 3]     *= scale2;
        arr[i * 3 + 1] *= scale2;
        arr[i * 3 + 2] *= scale2;
      }
    }
    dustPositions.needsUpdate = true;

    // ─── Neural connections ───────────────────────────────────────────────────
    const neuralGroup = neuralGroupRef.current;
    if (neuralGroup && t - lastNeuralTime.current > 6 + Math.random() * 2 && activeNeuralLines.current < 2) {
      lastNeuralTime.current = t;
      activeNeuralLines.current++;

      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.random() * Math.PI;
      const r = 0.1;
      const startX = r * Math.sin(phi1) * Math.cos(theta1);
      const startY = r * Math.sin(phi1) * Math.sin(theta1);
      const startZ = r * Math.cos(phi1);

      const theta2 = Math.random() * Math.PI * 2;
      const phi2 = Math.random() * Math.PI;
      const r2 = 0.16 + Math.random() * 0.1;
      const endX = r2 * Math.sin(phi2) * Math.cos(theta2);
      const endY = r2 * Math.sin(phi2) * Math.sin(theta2);
      const endZ = r2 * Math.cos(phi2);

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(endX, endY, endZ),
      ]);

      const mat2 = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
      });

      const line = new THREE.Line(geo, mat2);
      neuralGroup.add(line);

      // Grow → hold → fade
      const tl = gsap.timeline({
        onComplete: () => {
          neuralGroup.remove(line);
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
          activeNeuralLines.current--;
        },
      });
      tl.to(mat2, { opacity: 0.18, duration: 1.2, ease: 'sine.in' })
        .to(mat2, { opacity: 0, duration: 1.8, ease: 'sine.out', delay: 0.8 });
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* ── Outer ambient haze ── */}
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.012} side={THREE.BackSide} />
      </mesh>

      {/* ── Energy rings (3) ── */}
      <group>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) ringMeshes.current[i] = el; }}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.09 + i * 0.01, 0.095 + i * 0.01, 48]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* ── Orbiting particles ── */}
      <group ref={orbitGroupRef}>
        {orbitData.map((d, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[d.size, 4, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>

      {/* ── Floating dust ── */}
      <points geometry={dustGeo}>
        <pointsMaterial
          color="#ffffff"
          size={0.004}
          transparent
          opacity={0.05}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ── Neural connections group ── */}
      <group ref={neuralGroupRef} />

      {/* ── Core sphere (breathing) ── */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.085, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.7}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ── Bright inner dot ── */}
      <mesh ref={coreDotRef}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.5}
          roughness={0}
          metalness={0}
        />
      </mesh>

      {/* ── Core light source (breathes with animation) ── */}
      <pointLight
        ref={coreLightRef}
        color="#ffffff"
        intensity={0.3}
        distance={1.0}
        decay={2}
      />
    </group>
  );
}
