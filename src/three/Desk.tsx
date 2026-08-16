import * as THREE from 'three';

interface DeskProps {
  position?: [number, number, number];
}

export function Desk({ position = [0, 0, 0] }: DeskProps) {
  // Soft matte dark — no harsh specular, premium feel
  const darkMatte: Partial<THREE.MeshStandardMaterialParameters> = {
    color: '#0a0a0a',
    roughness: 0.82,
    metalness: 0.15,
  };

  // Slightly darker edge — subtle definition only
  const darkEdge: Partial<THREE.MeshStandardMaterialParameters> = {
    color: '#111111',
    roughness: 0.78,
    metalness: 0.12,
  };

  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.4, 0.05, 1.1]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Desk surface edge — front */}
      <mesh position={[0, -0.02, 0.55]}>
        <boxGeometry args={[2.4, 0.055, 0.012]} />
        <meshStandardMaterial {...darkEdge} />
      </mesh>

      {/* Desk surface edge — back */}
      <mesh position={[0, -0.02, -0.55]}>
        <boxGeometry args={[2.4, 0.055, 0.012]} />
        <meshStandardMaterial {...darkEdge} />
      </mesh>

      {/* Desk surface edge — left */}
      <mesh position={[-1.2, -0.02, 0]}>
        <boxGeometry args={[0.012, 0.055, 1.1]} />
        <meshStandardMaterial {...darkEdge} />
      </mesh>

      {/* Desk surface edge — right */}
      <mesh position={[1.2, -0.02, 0]}>
        <boxGeometry args={[0.012, 0.055, 1.1]} />
        <meshStandardMaterial {...darkEdge} />
      </mesh>

      {/* Left leg pair — front */}
      <mesh position={[-1.0, -0.52, 0.38]} receiveShadow>
        <boxGeometry args={[0.055, 1.0, 0.055]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Left leg pair — back */}
      <mesh position={[-1.0, -0.52, -0.38]} receiveShadow>
        <boxGeometry args={[0.055, 1.0, 0.055]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Left leg crossbar */}
      <mesh position={[-1.0, -0.82, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.72]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Right leg pair — front */}
      <mesh position={[1.0, -0.52, 0.38]} receiveShadow>
        <boxGeometry args={[0.055, 1.0, 0.055]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Right leg pair — back */}
      <mesh position={[1.0, -0.52, -0.38]} receiveShadow>
        <boxGeometry args={[0.055, 1.0, 0.055]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Right leg crossbar */}
      <mesh position={[1.0, -0.82, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.72]} />
        <meshStandardMaterial {...darkMatte} />
      </mesh>

      {/* Cable management channel */}
      <mesh position={[0, -0.012, -0.42]}>
        <boxGeometry args={[0.5, 0.018, 0.035]} />
        <meshStandardMaterial color="#060606" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Small keyboard — soft matte */}
      <mesh position={[0, 0.032, 0.25]} receiveShadow>
        <boxGeometry args={[0.6, 0.008, 0.2]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.80} metalness={0.1} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.45, 0.03, 0.28]} receiveShadow>
        <capsuleGeometry args={[0.035, 0.07, 4, 12]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.78} metalness={0.1} />
      </mesh>
    </group>
  );
}
