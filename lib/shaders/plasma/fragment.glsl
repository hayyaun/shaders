uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

#include "hash.glsl"

void main() {
  // Adjust UV coordinates to account for aspect ratio
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  uv.x = (uv.x - 0.5) * aspect + 0.5;
  
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
  
  // Create a three-color gradient that cycles through all colors
  // Map v (0-1) to three segments: 0-0.5 (color1 to color2), 0.5-1.0 (color2 to color3)
  vec3 color;
  if (v < 0.5) {
    // First half: blend from color1 to color2
    float t = v * 2.0; // Map 0-0.5 to 0-1
    color = mix(uColor1, uColor2, t);
  } else {
    // Second half: blend from color2 to color3
    float t = (v - 0.5) * 2.0; // Map 0.5-1.0 to 0-1
    color = mix(uColor2, uColor3, t);
  }
  
  gl_FragColor = vec4(color, 1.0);
}

