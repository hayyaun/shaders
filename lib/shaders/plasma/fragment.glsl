uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uScale;

varying vec2 vUv;

#include "hash.glsl"

void main() {
  vec2 uv = vUv;
  
  float t = uTime * uSpeed;
  
  // Create plasma effect with multiple sine waves
  float v = 0.0;
  
  // Multiple oscillating waves
  v += sin((uv.x + t) * uScale);
  v += sin((uv.y + t) * uScale * 0.8);
  v += sin((uv.x + uv.y + t) * uScale * 1.5) * 0.5;
  
  // Add rotation effect
  vec2 center = uv - vec2(0.5);
  float angle = atan(center.y, center.x);
  float radius = length(center);
  v += sin(angle * 3.0 + radius * uScale * 2.0 - t);
  
  // Normalize and create color
  v = v * 0.5 + 0.5;
  
  // Create colorful plasma with RGB channels offset
  float r = sin(v * 3.14159) * 0.5 + 0.5;
  float g = sin(v * 3.14159 + 2.094) * 0.5 + 0.5;
  float b = sin(v * 3.14159 + 4.189) * 0.5;
  
  vec3 color = vec3(r, g, b);
  
  gl_FragColor = vec4(color, 1.0);
}

