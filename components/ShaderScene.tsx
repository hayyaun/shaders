'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ShaderMaterial } from './ShaderMaterial';
import type { ShaderConfig } from '@/lib/types';

interface ShaderSceneProps {
  shader: ShaderConfig;
  controls?: boolean;
}

export function ShaderScene({ shader, controls = true }: ShaderSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <mesh>
        <planeGeometry args={[2, 2, 32, 32]} />
        <ShaderMaterial shader={shader} />
      </mesh>
      {controls && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}

