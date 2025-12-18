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
  // Sample canvas texture directly
  vec4 canvasSample = texture2D(uCanvasTexture, vUv);
  float alpha = (canvasSample.a - 0.1) / 0.9;
  
  // Use alpha channel - multiply RGB by alpha to show fading
  vec3 color = canvasSample.rgb * alpha;
  
  gl_FragColor = vec4(color, alpha);
}

