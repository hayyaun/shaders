import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export const waterRippleShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
  },
};

