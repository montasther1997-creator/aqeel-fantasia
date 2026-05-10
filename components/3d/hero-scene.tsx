'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

function FloatingShape() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.4, 1]} />
      <meshStandardMaterial
        color="#0066FF"
        wireframe
        emissive="#0066FF"
        emissiveIntensity={0.4}
        opacity={0.7}
        transparent
      />
    </mesh>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#C0C0C8" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function GlowSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.06 + Math.sin(s.clock.elapsedTime * 0.6) * 0.02;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.2, 32, 32]} />
      <meshBasicMaterial color="#8B0000" transparent opacity={0.06} side={THREE.BackSide} />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 60 }} dpr={[1, 1.6]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#0066FF" />
        <pointLight position={[-5, -3, -3]} intensity={0.5} color="#8B0000" />
        <ParticleField />
        <FloatingShape />
        <GlowSphere />
      </Suspense>
    </Canvas>
  );
}
