uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uStarDensity;
uniform float uGlitterIntensity;
uniform float uTwinkleSpeed;
uniform float uStarSize;
uniform vec3 uStarColor;
uniform vec3 uGlitterColor;
uniform vec3 uBackgroundColor;

varying vec2 vUv;

#include "hash.glsl"
#include "noise.glsl"

void main() {
  // Adjust UV coordinates to account for aspect ratio
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  uv.x = (uv.x - 0.5) * aspect + 0.5;
  float t = uTime * uSpeed;
  
  // Initialize color with background
  vec3 color = uBackgroundColor;
  
  // Create glitter particles - increased density
  vec2 glitterUV = uv * uStarDensity * 8.0;
  vec2 glitterID = floor(glitterUV);
  vec2 glitterPos = fract(glitterUV) - 0.5;
  
  // Random glitter positions
  vec2 glitterOffset = vec2(
    hash(glitterID),
    hash(glitterID + vec2(1.0))
  ) - 0.5;
  
  vec2 glitterCenter = glitterPos - glitterOffset * 0.3;
  float glitterDist = length(glitterCenter);
  
  // Animate glitter
  float glitterTime = t * 2.0 + hash(glitterID) * 6.28318;
  float glitterSize = 0.02 + sin(glitterTime) * 0.01;
  float glitterAlpha = step(glitterDist, glitterSize);
  
  // Make glitter twinkle
  float glitterTwinkle = sin(glitterTime * 3.0) * 0.5 + 0.5;
  glitterAlpha *= glitterTwinkle;
  
  // Add glitter trails
  float trail = 1.0 - smoothstep(0.0, glitterSize * 2.0, glitterDist);
  trail *= glitterTwinkle * 0.3;
  
  // Glitter color with variation
  vec3 glitterColor = uGlitterColor;
  glitterColor += vec3(
    sin(glitterTime) * 0.2,
    cos(glitterTime * 1.3) * 0.2,
    sin(glitterTime * 0.7) * 0.2
  );
  
  color += glitterColor * (glitterAlpha + trail) * uGlitterIntensity;
  
  // Add second layer of glitter particles for more density
  vec2 glitterUV2 = uv * uStarDensity * 12.0;
  vec2 glitterID2 = floor(glitterUV2);
  vec2 glitterPos2 = fract(glitterUV2) - 0.5;
  
  vec2 glitterOffset2 = vec2(
    hash(glitterID2 + vec2(50.0)),
    hash(glitterID2 + vec2(51.0))
  ) - 0.5;
  
  vec2 glitterCenter2 = glitterPos2 - glitterOffset2 * 0.3;
  float glitterDist2 = length(glitterCenter2);
  
  float glitterTime2 = t * 2.5 + hash(glitterID2) * 6.28318;
  float glitterSize2 = 0.015 + sin(glitterTime2) * 0.008;
  float glitterAlpha2 = step(glitterDist2, glitterSize2);
  
  float glitterTwinkle2 = sin(glitterTime2 * 3.5) * 0.5 + 0.5;
  glitterAlpha2 *= glitterTwinkle2;
  
  float trail2 = 1.0 - smoothstep(0.0, glitterSize2 * 2.0, glitterDist2);
  trail2 *= glitterTwinkle2 * 0.25;
  
  vec3 glitterColor2 = uGlitterColor;
  glitterColor2 += vec3(
    sin(glitterTime2 * 1.2) * 0.15,
    cos(glitterTime2 * 1.5) * 0.15,
    sin(glitterTime2 * 0.9) * 0.15
  );
  
  color += glitterColor2 * (glitterAlpha2 + trail2) * uGlitterIntensity * 0.8;
  
  // Add third layer of glitter for even more density
  vec2 glitterUV3 = uv * uStarDensity * 16.0;
  vec2 glitterID3 = floor(glitterUV3);
  vec2 glitterPos3 = fract(glitterUV3) - 0.5;
  
  vec2 glitterOffset3 = vec2(
    hash(glitterID3 + vec2(100.0)),
    hash(glitterID3 + vec2(101.0))
  ) - 0.5;
  
  vec2 glitterCenter3 = glitterPos3 - glitterOffset3 * 0.25;
  float glitterDist3 = length(glitterCenter3);
  
  float glitterTime3 = t * 3.0 + hash(glitterID3) * 6.28318;
  float glitterSize3 = 0.012 + sin(glitterTime3) * 0.006;
  float glitterAlpha3 = step(glitterDist3, glitterSize3);
  
  float glitterTwinkle3 = sin(glitterTime3 * 4.0) * 0.5 + 0.5;
  glitterAlpha3 *= glitterTwinkle3;
  
  float trail3 = 1.0 - smoothstep(0.0, glitterSize3 * 1.8, glitterDist3);
  trail3 *= glitterTwinkle3 * 0.2;
  
  vec3 glitterColor3 = uGlitterColor * 0.9;
  glitterColor3 += vec3(
    sin(glitterTime3 * 0.8) * 0.1,
    cos(glitterTime3 * 1.1) * 0.1,
    sin(glitterTime3 * 0.6) * 0.1
  );
  
  color += glitterColor3 * (glitterAlpha3 + trail3) * uGlitterIntensity * 0.6;
  
  // Add moving sparkles - increased density
  vec2 sparkleUV = uv * 25.0;
  float sparkle = fbm(sparkleUV + t * 0.5);
  sparkle = step(0.93, sparkle);
  
  // Animate sparkles
  float sparklePulse = sin(t * 5.0 + hash(sparkleUV) * 6.28318) * 0.5 + 0.5;
  sparkle *= sparklePulse;
  
  color += vec3(1.0, 1.0, 1.0) * sparkle * 0.6;
  
  // Add more sparkles at different scale
  vec2 sparkleUV2 = uv * 35.0;
  float sparkle2 = fbm(sparkleUV2 + t * 0.7);
  sparkle2 = step(0.94, sparkle2);
  
  float sparklePulse2 = sin(t * 6.0 + hash(sparkleUV2) * 6.28318) * 0.5 + 0.5;
  sparkle2 *= sparklePulse2;
  
  color += vec3(1.0, 1.0, 1.0) * sparkle2 * 0.4;
  
  // Add subtle nebula-like background with noise
  vec2 nebulaUV = uv * 2.0 + vec2(t * 0.1, t * 0.05);
  float nebula = fbm(nebulaUV) * 0.15;
  nebula += fbm(nebulaUV * 3.0 + t * 0.2) * 0.1;
  
  // Color the nebula with background color variation
  vec3 nebulaColor = uBackgroundColor * (1.0 + nebula);
  nebulaColor += uGlitterColor * nebula * 0.2;
  
  color = mix(nebulaColor, color, 0.7);
  
  // Add depth with radial fade
  vec2 center = uv - vec2(0.5);
  float dist = length(center);
  float edgeFade = 1.0 - smoothstep(0.4, 0.7, dist);
  color *= edgeFade;
  
  // Final color
  gl_FragColor = vec4(color, 1.0);
}

