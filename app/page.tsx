"use client";

import { useControls, Leva } from "leva";
import { ShaderScene } from "@/components/ShaderScene";
import {
  gradientFogShader,
  plasmaShader,
  starGlitterShader,
  waterRippleShader,
  pointerLineShader,
} from "@/lib/shaders";
import { useRef, useEffect, useState } from "react";
import { useShaderStore } from "@/lib/store/shaderStore";
import { usePlasmaControls } from "@/hooks/usePlasmaControls";
import { useGradientControls } from "@/hooks/useGradientControls";
import { useStarGlitterControls } from "@/hooks/useStarGlitterControls";
import { PointerLineCanvas, PointerLineCanvasRef } from "@/components/PointerLineCanvas";
import { CanvasTexture, RGBAFormat } from "three";

import type { ShaderConfig } from "@/lib/types";

const shaders: Record<string, ShaderConfig> = {
  "Gradient Fog": gradientFogShader,
  Plasma: plasmaShader,
  "Star Glitter": starGlitterShader,
  "Water Ripple": waterRippleShader,
  "Pointer Line": pointerLineShader,
};

export default function Home() {
  const { selectedShader, setSelectedShader } = useShaderStore();
  const isInitialMount = useRef(true);
  const previousShaderRef = useRef<string | null>(null);
  const canvasRef = useRef<PointerLineCanvasRef>(null);
  const [canvasTexture, setCanvasTexture] = useState<CanvasTexture | null>(null);

  const shaderNames = Object.keys(shaders);
  const currentShaderName =
    selectedShader && shaders[selectedShader] ? selectedShader : shaderNames[0];
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

  // Create texture from canvas
  useEffect(() => {
    if (currentShaderName !== "Pointer Line") {
      return;
    }

    const createTexture = () => {
      const canvas = canvasRef.current?.getCanvas();
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        setCanvasTexture((prev) => {
          if (prev) {
            prev.dispose();
          }
          const texture = new CanvasTexture(canvas);
          // Ensure texture reads alpha channel from canvas
          texture.format = RGBAFormat;
          texture.needsUpdate = true;
          return texture;
        });
      } else {
        // Retry if canvas not ready
        setTimeout(createTexture, 50);
      }
    };

    createTexture();
  }, [currentShaderName]);

  // Cleanup texture when switching away from Pointer Line
  useEffect(() => {
    return () => {
      if (canvasTexture) {
        canvasTexture.dispose();
      }
    };
  }, [canvasTexture]);

  // Always call all hooks (React rules), but only use the active one's values
  const plasmaUniforms = usePlasmaControls({
    isActive: currentShaderName === "Plasma",
  });
  const gradientUniforms = useGradientControls({
    isActive: currentShaderName === "Gradient Fog",
  });
  const starGlitterUniforms = useStarGlitterControls({
    isActive: currentShaderName === "Star Glitter",
  });

  const uniformValues =
    currentShaderName === "Plasma"
      ? plasmaUniforms
      : currentShaderName === "Gradient Fog"
      ? gradientUniforms
      : currentShaderName === "Star Glitter"
      ? starGlitterUniforms
      : currentShaderName === "Pointer Line"
      ? {
          uCanvasTexture: canvasTexture || pointerLineShader.uniforms.uCanvasTexture.value,
        }
      : {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Leva collapsed={false} />
      <main className="w-full h-screen">
        <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
          <h1 className="text-2xl font-bold mb-2">Shader Library</h1>
          <p className="text-sm text-gray-400">{currentShaderName} Shader</p>
        </div>
        <ShaderScene
          shader={selectedShaderConfig}
          uniformValues={uniformValues}
          shaderKey={currentShaderName}
        />
        {currentShaderName === "Pointer Line" && <PointerLineCanvas ref={canvasRef} />}
      </main>
    </div>
  );
}
