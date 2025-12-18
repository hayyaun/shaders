uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uCanvasTexture;
uniform float uRippleIntensity;
uniform float uRippleDecay;
uniform float uWaveSpeed;
uniform vec3 uRippleColor;

varying vec2 vUv;

#include "hash.glsl"
#include "noise.glsl"

void main() {
  // Sample canvas texture directly - NO FLIP, just use UV as-is
  vec4 canvasSample = texture2D(uCanvasTexture, vUv);
  
  // Show canvas directly
  gl_FragColor = canvasSample;
}

