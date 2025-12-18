'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { ShaderMaterial } from './ShaderMaterial';
import { WaterRippleScene } from './WaterRippleScene';
import type { ShaderConfig } from '@/lib/types';
import { useMemo } from 'react';

interface ShaderSceneProps {
  shader: ShaderConfig;
  controls?: boolean;
  uniformValues?: Record<string, unknown>;
  shaderKey?: string;
}

function FullscreenPlane({ shader, uniformValues, materialKey }: { shader: ShaderConfig; uniformValues?: Record<string, unknown>; materialKey: string }) {
  const { viewport } = useThree();
  
  // Use viewport dimensions to fill the entire screen
  // viewport gives us world-space dimensions that match the camera frustum
  // Use a key based on viewport dimensions to force geometry recreation on resize
  const geometryKey = `${viewport.width.toFixed(2)}-${viewport.height.toFixed(2)}`;
  
  return (
    <mesh>
      <planeGeometry key={geometryKey} args={[viewport.width, viewport.height, 32, 32]} />
      <ShaderMaterial key={materialKey} shader={shader} uniformValues={uniformValues} />
    </mesh>
  );
}

export function ShaderScene({ shader, controls = true, uniformValues, shaderKey }: ShaderSceneProps) {
  // Safety check
  if (!shader) {
    return null;
  }
  
  // Use special WaterRippleScene for water ripple shader
  if (shaderKey === 'Water Ripple') {
    return (
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <WaterRippleScene uniformValues={uniformValues} />
      </Canvas>
    );
  }
  
  // Create a stable key for the material based on shader identity
  const materialKey = useMemo(() => {
    if (shaderKey) return shaderKey;
    if (shader.vertexShader) return shader.vertexShader.slice(0, 50);
    return 'default-shader';
  }, [shaderKey, shader.vertexShader]);

  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <FullscreenPlane shader={shader} uniformValues={uniformValues} materialKey={materialKey} />
      {controls && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}

