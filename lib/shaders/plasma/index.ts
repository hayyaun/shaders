import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export const plasmaShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    uSpeed: { value: 0.5 },
    uScale: { value: 5.0 },
  },
};

