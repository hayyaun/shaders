'use client';

import { useControls, Leva } from 'leva';
import { ShaderScene } from '@/components/ShaderScene';
import { exampleGradientShader, plasmaShader } from '@/lib/shaders';
import type { ShaderConfig } from '@/lib/types';
import { useMemo, useRef, useEffect } from 'react';
import { useShaderStore } from '@/lib/store/shaderStore';

const shaders: Record<string, ShaderConfig> = {
  'Gradient': exampleGradientShader,
  'Plasma': plasmaShader,
};

export default function Home() {
  const { selectedShader, setSelectedShader } = useShaderStore();
  const isInitialMount = useRef(true);
  const previousShaderRef = useRef<string | null>(null);
  
  // Get valid shader name - use stored value if valid, otherwise default to first shader
  const shaderNames = Object.keys(shaders);
  // Use selectedShader from store (will be hydrated from localStorage by Zustand)
  const currentShaderName = (selectedShader && shaders[selectedShader]) ? selectedShader : shaderNames[0];
  const selectedShaderConfig = shaders[currentShaderName];
  
  // Track the previous shader to detect actual changes
  useEffect(() => {
    previousShaderRef.current = currentShaderName;
    // After first render, we're no longer on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [currentShaderName]);
  
  const controls = useControls({
    shader: {
      value: currentShaderName,
      options: shaderNames,
      onChange: (value) => {
        // Only update if this is not the initial mount and the value actually changed
        if (!isInitialMount.current && value !== previousShaderRef.current) {
          setSelectedShader(value);
        }
      },
    },
    // Plasma shader uniforms
    'Plasma - Speed': {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.1,
    },
    'Plasma - Scale': {
      value: 5.0,
      min: 1,
      max: 20,
      step: 0.5,
    },
  });

  const uniformValues = useMemo(() => {
    if (currentShaderName === 'Plasma') {
      return {
        uSpeed: controls['Plasma - Speed'],
        uScale: controls['Plasma - Scale'],
      };
    }
    return {};
  }, [currentShaderName, controls['Plasma - Speed'], controls['Plasma - Scale']]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Leva collapsed={false} />
      <main className="w-full h-screen">
        <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
          <h1 className="text-2xl font-bold mb-2">Shader Library</h1>
          <p className="text-sm text-gray-400">
            {currentShaderName} Shader
          </p>
        </div>
        <ShaderScene shader={selectedShaderConfig} uniformValues={uniformValues} shaderKey={currentShaderName} />
      </main>
    </div>
  );
}
