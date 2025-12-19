'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import { WebGLRenderTarget, ShaderMaterial as ThreeShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, Scene, OrthographicCamera, Mesh, PlaneGeometry, Group } from 'three';
import { Text } from '@react-three/drei';
import { ShaderMaterial } from './ShaderMaterial';
import type { ShaderConfig } from '@/lib/types';
import simulationShaderSource from '@/lib/shaders/water-ripple/simulation.glsl';
import renderShaderSource from '@/lib/shaders/water-ripple/render.glsl';
import vertexShaderSource from '@/lib/shaders/water-ripple/vertex.glsl';

interface WaterRippleSceneProps {
  uniformValues?: Record<string, unknown>;
}

// Background component for "wow" text
function BackgroundText() {
  return (
    <>
      <ambientLight intensity={1.0} />
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color="#1e40af"
        anchorX="center"
        anchorY="middle"
      >
        wow
      </Text>
    </>
  );
}

function WaterRipplePlane({ uniformValues }: WaterRippleSceneProps) {
  const { viewport, gl, size, camera } = useThree();
  const renderMaterialRef = useRef<ThreeShaderMaterial>(null);
  const frameCountRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, pressed: false });
  const backgroundGroupRef = useRef<Group>(null);
  
  // Use refs for mutable values that are used in useFrame
  const renderTargetsRef = useRef<{ rt1: WebGLRenderTarget; rt2: WebGLRenderTarget; current: WebGLRenderTarget; previous: WebGLRenderTarget; initialTexture: DataTexture; backgroundRT: WebGLRenderTarget } | null>(null);
  const simulationMaterialRef = useRef<ThreeShaderMaterial | null>(null);
  
  // Create separate scene and camera for simulation pass
  const simulationSceneRef = useRef<Scene | null>(null);
  const simulationCameraRef = useRef<OrthographicCamera | null>(null);
  const simulationMeshRef = useRef<Mesh | null>(null);

  // Create render targets for ping-pong buffering and background
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
    
    // Render target for background scene (with "wow" text)
    const backgroundRT = new WebGLRenderTarget(width, height, {
      format: RGBAFormat,
      type: FloatType,
    });
    
    // Create simulation scene
    const simScene = new Scene();
    const simCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simGeometry = new PlaneGeometry(2, 2);
    const simMesh = new Mesh(simGeometry);
    simScene.add(simMesh);
    
    return { 
      rt1, 
      rt2, 
      current: rt1, 
      previous: rt2, 
      initialTexture, 
      backgroundRT,
      simScene,
      simCamera,
      simMesh,
    };
  }, [size.width, size.height]);

  // Set up refs after render targets are created
  useEffect(() => {
    if (renderTargets) {
      simulationSceneRef.current = renderTargets.simScene;
      simulationCameraRef.current = renderTargets.simCamera;
      simulationMeshRef.current = renderTargets.simMesh;
      renderTargetsRef.current = renderTargets;
    }
  }, [renderTargets]);

  // Create simulation material directly (not through React component)
  const simulationMaterial = useMemo(() => {
    return new ThreeShaderMaterial({
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
  }, [size.width, size.height]);

  // Set simulation material ref
  useEffect(() => {
    simulationMaterialRef.current = simulationMaterial;
  }, [simulationMaterial]);

  // Cleanup render targets on unmount
  useEffect(() => {
    return () => {
      if (renderTargetsRef.current) {
        renderTargetsRef.current.rt1.dispose();
        renderTargetsRef.current.rt2.dispose();
        renderTargetsRef.current.backgroundRT.dispose();
      }
      if (simulationMaterialRef.current) {
        simulationMaterialRef.current.dispose();
      }
    };
  }, []);

  // Create render shader config
  const renderShader: ShaderConfig = useMemo(() => {
    return {
      vertexShader: vertexShaderSource,
      fragmentShader: renderShaderSource,
      uniforms: {
        uResolution: { value: [size.width, size.height] },
        uSimulationState: { value: null },
        uBackgroundTexture: { value: null }, // Will be set in useFrame
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
    if (simulationMeshRef.current && simulationMaterialRef.current) {
      simulationMeshRef.current.material = simulationMaterialRef.current;
    }
    // Initialize render material with initial texture
    if (renderMaterialRef.current && renderTargetsRef.current) {
      renderMaterialRef.current.uniforms.uSimulationState.value = renderTargetsRef.current.initialTexture;
    }
  }, []);

  // Update simulation and swap buffers
  useFrame((state) => {
    const renderTargets = renderTargetsRef.current;
    const simulationMaterial = simulationMaterialRef.current;
    
    if (!simulationMaterial || !renderMaterialRef.current || !simulationSceneRef.current || !simulationCameraRef.current || !simulationMeshRef.current) return;
    if (!backgroundGroupRef.current || !renderTargets) return;

    frameCountRef.current += 1;

    // Render background scene (with "wow" text) to background render target
    // Create a temporary scene with just the background group
    const tempScene = new Scene();
    tempScene.add(backgroundGroupRef.current.clone());
    
    gl.setRenderTarget(renderTargets.backgroundRT);
    gl.clear();
    gl.render(tempScene, camera);
    
    const pixelWidth = size.width * window.devicePixelRatio;
    const pixelHeight = size.height * window.devicePixelRatio;

    // Update simulation uniforms
    const simUniforms = simulationMaterial.uniforms;
    simUniforms.uTime.value = state.clock.elapsedTime;
    simUniforms.uFrame.value = frameCountRef.current;
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

    // Update render shader to use current simulation state and background texture
    renderMaterialRef.current.uniforms.uSimulationState.value = renderTargets.current.texture;
    renderMaterialRef.current.uniforms.uBackgroundTexture.value = renderTargets.backgroundRT.texture;
    renderMaterialRef.current.uniforms.uResolution.value = [size.width, size.height];

    // Swap buffers for next frame
    const temp = renderTargets.current;
    renderTargets.current = renderTargets.previous;
    renderTargets.previous = temp;
  });

  const geometryKey = `${viewport.width.toFixed(2)}-${viewport.height.toFixed(2)}`;

  return (
    <>
      {/* Background scene with "wow" text (rendered to texture, positioned behind) */}
      <group ref={backgroundGroupRef} position={[0, 0, -0.5]}>
        <BackgroundText />
      </group>
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

