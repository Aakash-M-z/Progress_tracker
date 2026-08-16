import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Monitor } from './Monitor';
import { Desk } from './Desk';
import { Floor } from './Floor';

interface CameraControllerProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
  breathPhaseRef: React.MutableRefObject<number>;
}

function CameraController({ scrollProgress, mouseX, mouseY, breathPhaseRef }: CameraControllerProps) {
  const { camera } = useThree();
  // Camera centered on the scene — canvas is already clipped to right side
  const currentX = useRef(0.3);
  const currentY = useRef(0.28);
  const currentZ = useRef(2.4);

  useFrame(() => {
    const bp = breathPhaseRef.current;

    // Cinematic scroll zoom toward the monitor screen
    const targetZ = THREE.MathUtils.lerp(2.4, 0.8, scrollProgress * 0.9);
    const targetY = THREE.MathUtils.lerp(0.28, 0.08, scrollProgress * 0.6);

    // Subtle breath micro-movement
    const breathZ = Math.sin(bp * Math.PI) * 0.007;

    // Mouse parallax — gentle
    const targetX = 0.3 + mouseX * 0.07;
    const targetYOffset = -mouseY * 0.04;

    currentX.current += (targetX - currentX.current) * 0.05;
    currentY.current += (targetY + targetYOffset - currentY.current) * 0.05;
    currentZ.current += (targetZ + breathZ - currentZ.current) * 0.05;

    camera.position.set(currentX.current, currentY.current, currentZ.current);
    // Look at monitor center — no offset needed, canvas is already right-clipped
    camera.lookAt(0.3, -0.02, 0);
  });

  return null;
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.025} />
      <directionalLight
        position={[2, 5, 3]}
        intensity={0.32}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-bias={-0.001}
      />
      {/* Very soft fill — no harsh secondary shadows */}
      <directionalLight position={[-2, 2, 2]} intensity={0.06} color="#d8d0ff" />
      {/* Gentle back fill */}
      <directionalLight position={[0, 0.5, -3]} intensity={0.03} color="#ffffff" />
      {/* Dim screen glow */}
      <pointLight position={[0.3, 0.1, 1.2]} intensity={0.04} color="#7ab4ff" distance={3} decay={2} />
    </>
  );
}

interface SceneContentProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}

function SceneContent({ scrollProgress, mouseX, mouseY }: SceneContentProps) {
  const breathPhaseRef = useRef(0);

  return (
    <>
      <CameraController
        scrollProgress={scrollProgress}
        mouseX={mouseX}
        mouseY={mouseY}
        breathPhaseRef={breathPhaseRef}
      />
      <SceneLights />

      <fog attach="fog" args={['#000000', 6, 20]} />

      {/* Scene centered within the right-side canvas container */}
      <Desk position={[0.3, -0.72, 0]} />
      <Monitor
        position={[0.3, -0.08, -0.28]}
        scrollProgress={scrollProgress}
        onBreathPhase={(p) => { breathPhaseRef.current = p; }}
      />
      <Floor />

      <ContactShadows
        position={[0.3, -1.04, 0]}
        opacity={0.5}
        scale={7}
        blur={1.8}
        far={3}
      />
    </>
  );
}

interface CinematicSceneProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}

export function CinematicScene({ scrollProgress, mouseX, mouseY }: CinematicSceneProps) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.82,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
    >
      {/* FOV 38° — balanced: monitor is large but full desk visible */}
      <PerspectiveCamera makeDefault fov={38} near={0.1} far={28} position={[0.3, 0.28, 2.4]} />
      <SceneContent scrollProgress={scrollProgress} mouseX={mouseX} mouseY={mouseY} />
    </Canvas>
  );
}
