import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import { Texture } from 'three';

// Create a default empty texture (will be replaced with canvas texture)
const defaultTexture = new Texture();
defaultTexture.needsUpdate = true;

export const pointerLineShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    uCanvasTexture: { value: defaultTexture },
    uRippleIntensity: { value: 0.8 },
    uRippleDecay: { value: 4.0 },
    uWaveSpeed: { value: 0.3 },
    uRippleColor: { value: [0.2, 0.5, 0.9] }, // Blue
  },
};

