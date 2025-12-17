import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export const exampleGradientShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    uColor1: { value: [0.2, 0.4, 0.8] }, // Blue
    uColor2: { value: [0.8, 0.2, 0.6] }, // Pink
    uColor3: { value: [0.2, 0.8, 0.4] }, // Green
  },
};

