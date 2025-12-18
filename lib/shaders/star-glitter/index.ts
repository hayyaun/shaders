import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export const starGlitterShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    uSpeed: { value: 0.5 },
    uStarDensity: { value: 12.0 },
    uGlitterIntensity: { value: 1.0 },
    uTwinkleSpeed: { value: 2.0 },
    uStarSize: { value: 0.12 },
    uStarColor: { value: [1.0, 1.0, 0.9] }, // Warm white
    uGlitterColor: { value: [0.8, 0.9, 1.0] }, // Cool white/blue
    uBackgroundColor: { value: [0.05, 0.05, 0.15] }, // Dark blue
  },
};

