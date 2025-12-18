'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import { ShaderMaterial as ThreeShaderMaterial } from 'three';
import type { ShaderConfig } from '@/lib/types';

interface ShaderMaterialProps {
  shader: ShaderConfig;
  uniformValues?: Record<string, unknown>;
  [key: string]: unknown;
}

export function ShaderMaterial({ shader, uniformValues, ...props }: ShaderMaterialProps) {
  const materialRef = useRef<ThreeShaderMaterial>(null);

  // Create a stable uniforms object - only recreate when shader code or uniforms structure changes
  const uniforms = useMemo(() => {
    const merged: Record<string, { value: unknown }> = {};
    // Deep clone all uniforms from shader config
    Object.keys(shader.uniforms).forEach((key) => {
      const uniformValue = shader.uniforms[key].value;
      // Handle array uniforms (like vec2, vec3, etc.)
      if (Array.isArray(uniformValue)) {
        merged[key] = { value: [...uniformValue] };
      } else {
        merged[key] = { value: uniformValue };
      }
    });
    return merged;
  }, [shader.uniforms]);

  // Update custom uniform values when they change (don't recreate uniforms object)
  useEffect(() => {
    if (materialRef.current) {
      if (uniformValues) {
        Object.keys(uniformValues).forEach((key) => {
          if (materialRef.current?.uniforms[key]) {
            materialRef.current.uniforms[key].value = uniformValues[key];
          }
        });
      }
    }
  }, [uniformValues]);

  useFrame((state) => {
    if (materialRef.current) {
      // Update time uniform
      if (materialRef.current.uniforms.uTime) {
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      }
      
      // Update resolution uniform - use actual canvas dimensions
      if (materialRef.current.uniforms.uResolution) {
        const canvas = state.gl.domElement;
        materialRef.current.uniforms.uResolution.value = [
          canvas.clientWidth,
          canvas.clientHeight,
        ];
      }
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={shader.vertexShader}
      fragmentShader={shader.fragmentShader}
      uniforms={uniforms}
      {...props}
    />
  );
}

