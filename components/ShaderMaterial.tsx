'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial as ThreeShaderMaterial } from 'three';
import type { ShaderConfig } from '@/lib/types';

interface ShaderMaterialProps {
  shader: ShaderConfig;
  [key: string]: any;
}

export function ShaderMaterial({ shader, ...props }: ShaderMaterialProps) {
  const materialRef = useRef<ThreeShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      // Update time uniform
      if (materialRef.current.uniforms.uTime) {
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      }
      
      // Update resolution uniform
      if (materialRef.current.uniforms.uResolution) {
        materialRef.current.uniforms.uResolution.value = [
          state.size.width,
          state.size.height,
        ];
      }
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={shader.vertexShader}
      fragmentShader={shader.fragmentShader}
      uniforms={shader.uniforms}
      {...props}
    />
  );
}

