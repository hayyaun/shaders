'use client';

import { useControls, Leva } from 'leva';
import { ShaderScene } from '@/components/ShaderScene';
import { gradientFogShader, plasmaShader } from '@/lib/shaders';
import { useRef, useEffect } from 'react';
import { useShaderStore } from '@/lib/store/shaderStore';
import { usePlasmaControls } from '@/hooks/usePlasmaControls';
import { useGradientControls } from '@/hooks/useGradientControls';

import type { ShaderConfig } from '@/lib/types';

const shaders: Record<string, ShaderConfig> = {
  'Gradient Fog': gradientFogShader,
  'Plasma': plasmaShader,
};

export default function Home() {
  const { selectedShader, setSelectedShader } = useShaderStore();
  const isInitialMount = useRef(true);
  const previousShaderRef = useRef<string | null>(null);
  
  const shaderNames = Object.keys(shaders);
  const currentShaderName = (selectedShader && shaders[selectedShader]) ? selectedShader : shaderNames[0];
  const selectedShaderConfig = shaders[currentShaderName];
  
  useEffect(() => {
    previousShaderRef.current = currentShaderName;
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [currentShaderName]);
  
  useControls({
    shader: {
      value: currentShaderName,
      options: shaderNames,
      onChange: (value) => {
        if (!isInitialMount.current && value !== previousShaderRef.current) {
          setSelectedShader(value);
        }
      },
    },
  });

  // Always call both hooks (React rules), but only use the active one's values
  const plasmaUniforms = usePlasmaControls({ isActive: currentShaderName === 'Plasma' });
  const gradientUniforms = useGradientControls({ isActive: currentShaderName === 'Gradient Fog' });
  
  const uniformValues = currentShaderName === 'Plasma' 
    ? plasmaUniforms 
    : currentShaderName === 'Gradient Fog' 
      ? gradientUniforms 
      : {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Leva key={currentShaderName} collapsed={false} />
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
