'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ShaderMaterial } from './ShaderMaterial';
import type { ShaderConfig } from '@/lib/types';
import { useMemo } from 'react';

interface ShaderSceneProps {
  shader: ShaderConfig;
  controls?: boolean;
  uniformValues?: Record<string, any>;
  shaderKey?: string;
}

export function ShaderScene({ shader, controls = true, uniformValues, shaderKey }: ShaderSceneProps) {
  // Create a stable key for the material based on shader identity
  const materialKey = useMemo(() => {
    if (shaderKey) return shaderKey;
    if (shader?.vertexShader) return shader.vertexShader.slice(0, 50);
    return 'default-shader';
  }, [shaderKey, shader?.vertexShader]);
  
  // Safety check
  if (!shader) {
    return null;
  }
  
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <mesh>
        <planeGeometry args={[2, 2, 32, 32]} />
        <ShaderMaterial key={materialKey} shader={shader} uniformValues={uniformValues} />
      </mesh>
      {controls && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}

