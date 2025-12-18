import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

// Initialize flattened array of mouse positions [x0, y0, x1, y1, ...]
const initialMousePositions: number[] = [];
for (let i = 0; i < 200; i += 2) {
  initialMousePositions.push(0.5, 0.5);
}

// Initialize array of mouse speeds (one per point)
const initialMouseSpeeds: number[] = [];
for (let i = 0; i < 100; i++) {
  initialMouseSpeeds.push(0.0);
}

export const waterSplashShader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    uMousePositions: { value: initialMousePositions },
    uMouseSpeeds: { value: initialMouseSpeeds },
    uMouseCount: { value: 0 },
    uMouseSpeed: { value: 0.0 },
    uRippleSpeed: { value: 1.0 },
    uRippleIntensity: { value: 0.8 },
    uRippleDecay: { value: 4.0 },
    uRippleFrequency: { value: 20.0 },
    uWaveSpeed: { value: 0.3 },
    uRippleColor: { value: [0.2, 0.5, 0.9] }, // Blue
  },
};

