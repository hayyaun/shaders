'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import { WebGLRenderTarget, ShaderMaterial as ThreeShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, Scene, OrthographicCamera, Mesh, PlaneGeometry } from 'three';
import { ShaderMaterial } from './ShaderMaterial';
import type { ShaderConfig } from '@/lib/types';
import simulationShaderSource from '@/lib/shaders/water-ripple/simulation.glsl';
import renderShaderSource from '@/lib/shaders/water-ripple/render.glsl';
import vertexShaderSource from '@/lib/shaders/water-ripple/vertex.glsl';

interface WaterRippleSceneProps {
  uniformValues?: Record<string, unknown>;
}

function WaterRipplePlane({ uniformValues }: WaterRippleSceneProps) {
  const { viewport, gl, size } = useThree();
  const renderMaterialRef = useRef<ThreeShaderMaterial>(null);
  const frameCountRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, pressed: false });
  
  // Create separate scene and camera for simulation pass
  const simulationSceneRef = useRef<Scene | null>(null);
  const simulationCameraRef = useRef<OrthographicCamera | null>(null);
  const simulationMeshRef = useRef<Mesh | null>(null);

  // Create render targets for ping-pong buffering
  const renderTargets = useMemo(() => {
    const width = Math.max(1, Math.floor(size.width * window.devicePixelRatio));
    const height = Math.max(1, Math.floor(size.height * window.devicePixelRatio));
    
    // Initialize with zeros
    const initialData = new Float32Array(width * height * 4);
    const initialTexture = new DataTexture(initialData, width, height, RGBAFormat, FloatType);
    initialTexture.needsUpdate = true;
    
    const rt1 = new WebGLRenderTarget(width, height, {
      format: RGBAFormat,
      type: FloatType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    });
    
    const rt2 = new WebGLRenderTarget(width, height, {
      format: RGBAFormat,
      type: FloatType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    });
    
    // Initialize both render targets with the initial texture
    const gl = document.createElement('canvas').getContext('webgl');
    if (gl) {
      // We'll initialize them properly in useFrame
    }
    
    // Create simulation scene
    const simScene = new Scene();
    const simCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simGeometry = new PlaneGeometry(2, 2);
    const simMesh = new Mesh(simGeometry);
    simScene.add(simMesh);
    
    simulationSceneRef.current = simScene;
    simulationCameraRef.current = simCamera;
    simulationMeshRef.current = simMesh;
    
    return { rt1, rt2, current: rt1, previous: rt2, initialTexture };
  }, [size.width, size.height]);

  // Create simulation material directly (not through React component)
  const simulationMaterial = useMemo(() => {
    const material = new ThreeShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: simulationShaderSource,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [size.width * window.devicePixelRatio, size.height * window.devicePixelRatio] },
        uPreviousState: { value: null },
        uMouse: { value: [0, 0] },
        uMousePressed: { value: 0 },
        uFrame: { value: 0 },
      },
    });
    return material;
  }, [size.width, size.height]);

  // Cleanup render targets on unmount
  useEffect(() => {
    return () => {
      renderTargets.rt1.dispose();
      renderTargets.rt2.dispose();
      simulationMaterial.dispose();
    };
  }, [renderTargets, simulationMaterial]);

  // Create render shader config
  const renderShader: ShaderConfig = useMemo(() => {
    // Create a simple gradient background texture
    const width = 256;
    const height = 256;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const u = x / width;
        const v = y / height;
        // Simple gradient from blue to cyan
        data[idx] = Math.floor(u * 50); // R
        data[idx + 1] = Math.floor(100 + v * 100); // G
        data[idx + 2] = Math.floor(150 + u * 50); // B
        data[idx + 3] = 255; // A
      }
    }
    const backgroundTexture = new DataTexture(data, width, height, RGBAFormat);
    backgroundTexture.needsUpdate = true;

    return {
      vertexShader: vertexShaderSource,
      fragmentShader: renderShaderSource,
      uniforms: {
        uResolution: { value: [size.width, size.height] },
        uSimulationState: { value: null },
        uBackgroundTexture: { value: backgroundTexture },
      },
    };
  }, [size.width, size.height]);

  // Handle mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX * window.devicePixelRatio;
      mouseRef.current.y = (size.height - e.clientY) * window.devicePixelRatio; // Flip Y coordinate
    };

    const handleMouseDown = () => {
      mouseRef.current.pressed = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.pressed = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [size.height]);

  // Set simulation material on mesh and initialize render material
  useEffect(() => {
    if (simulationMeshRef.current && simulationMaterial) {
      simulationMeshRef.current.material = simulationMaterial;
    }
    // Initialize render material with initial texture
    if (renderMaterialRef.current) {
      renderMaterialRef.current.uniforms.uSimulationState.value = renderTargets.initialTexture;
    }
  }, [simulationMaterial, renderTargets]);

  // Update simulation and swap buffers
  useFrame((state) => {
    if (!simulationMaterial || !renderMaterialRef.current || !simulationSceneRef.current || !simulationCameraRef.current || !simulationMeshRef.current) return;

    frameCountRef.current += 1;

    // Update simulation uniforms
    const simUniforms = simulationMaterial.uniforms;
    simUniforms.uTime.value = state.clock.elapsedTime;
    simUniforms.uFrame.value = frameCountRef.current;
    const pixelWidth = size.width * window.devicePixelRatio;
    const pixelHeight = size.height * window.devicePixelRatio;
    simUniforms.uResolution.value = [pixelWidth, pixelHeight];
    
    // Use initial texture on first frame, otherwise use previous render target
    if (frameCountRef.current === 1) {
      simUniforms.uPreviousState.value = renderTargets.initialTexture;
    } else {
      simUniforms.uPreviousState.value = renderTargets.previous.texture;
    }
    
    simUniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
    simUniforms.uMousePressed.value = mouseRef.current.pressed ? 1 : 0;

    // Render simulation pass to current buffer
    gl.setRenderTarget(renderTargets.current);
    gl.clear();
    gl.render(simulationSceneRef.current, simulationCameraRef.current);
    gl.setRenderTarget(null);

    // Update render shader to use current simulation state
    renderMaterialRef.current.uniforms.uSimulationState.value = renderTargets.current.texture;
    renderMaterialRef.current.uniforms.uResolution.value = [size.width, size.height];

    // Swap buffers for next frame
    const temp = renderTargets.current;
    renderTargets.current = renderTargets.previous;
    renderTargets.previous = temp;
  });

  const geometryKey = `${viewport.width.toFixed(2)}-${viewport.height.toFixed(2)}`;

  return (
    <>
      {/* Render pass (visible) */}
      <mesh>
        <planeGeometry key={`render-${geometryKey}`} args={[viewport.width, viewport.height, 32, 32]} />
        <ShaderMaterial
          ref={renderMaterialRef}
          shader={renderShader}
          uniformValues={uniformValues}
        />
      </mesh>
    </>
  );
}

export function WaterRippleScene({ uniformValues }: WaterRippleSceneProps) {
  return (
    <WaterRipplePlane uniformValues={uniformValues} />
  );
}

