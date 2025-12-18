import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export const auroraShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    uSpeed: { value: 0.3 },
    uIntensity: { value: 1.5 },
    uWaveFrequency: { value: 4.0 },
    uColorShift: { value: 0.0 },
    uColor1: { value: [0.0, 0.2, 0.4] }, // Deep blue
    uColor2: { value: [0.0, 0.8, 0.6] }, // Cyan
    uColor3: { value: [0.2, 0.6, 1.0] }, // Light blue
    uColor4: { value: [0.4, 0.2, 0.8] }, // Purple
  },
};

