'use client';

import { useControls, Leva } from 'leva';
import { ShaderScene } from '@/components/ShaderScene';
import { gradientFogShader, plasmaShader, auroraShader, starGlitterShader, waterSplashShader } from '@/lib/shaders';
import { useRef, useEffect } from 'react';
import { useShaderStore } from '@/lib/store/shaderStore';
import { usePlasmaControls } from '@/hooks/usePlasmaControls';
import { useGradientControls } from '@/hooks/useGradientControls';
import { useAuroraControls } from '@/hooks/useAuroraControls';
import { useStarGlitterControls } from '@/hooks/useStarGlitterControls';
import { useWaterSplashControls } from '@/hooks/useWaterSplashControls';
import { useMousePosition } from '@/hooks/useMousePosition';

import type { ShaderConfig } from '@/lib/types';

const shaders: Record<string, ShaderConfig> = {
  'Gradient Fog': gradientFogShader,
  'Plasma': plasmaShader,
  'Aurora': auroraShader,
  'Star Glitter': starGlitterShader,
  'Water Splash': waterSplashShader,
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

  // Mouse position tracking (only needed for Water Splash, but always call for consistency)
  const mousePos = useMousePosition();
  
  // Always call all hooks (React rules), but only use the active one's values
  const plasmaUniforms = usePlasmaControls({ isActive: currentShaderName === 'Plasma' });
  const gradientUniforms = useGradientControls({ isActive: currentShaderName === 'Gradient Fog' });
  const auroraUniforms = useAuroraControls({ isActive: currentShaderName === 'Aurora' });
  const starGlitterUniforms = useStarGlitterControls({ isActive: currentShaderName === 'Star Glitter' });
  const waterSplashUniforms = useWaterSplashControls({ isActive: currentShaderName === 'Water Splash' });
  
  const uniformValues = currentShaderName === 'Plasma' 
    ? plasmaUniforms 
    : currentShaderName === 'Gradient Fog' 
      ? gradientUniforms 
      : currentShaderName === 'Aurora'
        ? auroraUniforms
        : currentShaderName === 'Star Glitter'
          ? starGlitterUniforms
          : currentShaderName === 'Water Splash'
            ? { 
                ...waterSplashUniforms, 
                uMousePositions: mousePos.positions.flat(), // Flatten array of [x, y] pairs
                uMouseCount: mousePos.positions.length,
                uMouseSpeed: mousePos.speed
              }
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
