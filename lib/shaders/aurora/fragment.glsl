uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uIntensity;
uniform float uWaveFrequency;
uniform float uColorShift;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

varying vec2 vUv;

#include "hash.glsl"
#include "noise.glsl"

void main() {
  vec2 uv = vUv;
  float t = uTime * uSpeed;
  
  // Create flowing wave patterns with more intensity
  vec2 p = uv * uWaveFrequency;
  
  // Multiple layers of waves for organic flow - enhanced
  float wave1 = sin(p.x * 2.0 + t * 0.5) * 0.5 + 0.5;
  float wave2 = sin(p.x * 3.0 - t * 0.7 + p.y * 2.0) * 0.5 + 0.5;
  float wave3 = sin(p.x * 1.5 + t * 0.3 + p.y * 3.0) * 0.5 + 0.5;
  float wave4 = sin(p.x * 4.0 + t * 0.9 + p.y * 1.5) * 0.5 + 0.5;
  
  // Combine waves with stronger presence
  float waves = (wave1 * 0.35 + wave2 * 0.3 + wave3 * 0.2 + wave4 * 0.15);
  waves = pow(waves, 0.8); // Increase contrast
  
  // Add noise for organic texture - more layers
  vec2 noiseCoord1 = uv * 4.0 + vec2(t * 0.2, t * 0.15);
  vec2 noiseCoord2 = uv * 6.0 + vec2(-t * 0.25, t * 0.1);
  vec2 noiseCoord3 = uv * 8.0 + vec2(t * 0.3, -t * 0.2);
  float noise1 = fbm(noiseCoord1);
  float noise2 = fbm(noiseCoord2);
  float noise3 = fbm(noiseCoord3);
  
  // Create vertical flowing bands - more pronounced
  float verticalFlow = sin(uv.x * 8.0 + t * 0.4) * 0.5 + 0.5;
  verticalFlow = pow(verticalFlow, 1.5);
  
  // Add horizontal ripples for more movement
  float horizontalRipple = sin(uv.y * 5.0 + t * 0.6) * 0.3 + 0.7;
  
  // Combine all elements with stronger weighting
  float pattern = waves * 0.5 + noise1 * 0.25 + noise2 * 0.15 + noise3 * 0.1;
  pattern = pattern * verticalFlow * horizontalRipple;
  pattern = pow(pattern, 0.9); // Brighter overall
  
  // Create horizontal gradient (aurora typically flows horizontally)
  float horizontalGradient = uv.y;
  horizontalGradient = smoothstep(0.0, 0.2, horizontalGradient) * 
                       (1.0 - smoothstep(0.6, 1.0, horizontalGradient));
  horizontalGradient = pow(horizontalGradient, 0.7); // More intense
  
  // Add vertical variation with more movement
  float verticalVariation = sin(uv.y * 3.0 + t * 0.2) * 0.4 + 0.6;
  verticalVariation += sin(uv.y * 6.0 + t * 0.5) * 0.2;
  
  // Combine pattern with gradients
  float finalPattern = pattern * horizontalGradient * verticalVariation;
  finalPattern = pow(finalPattern, 0.85); // Boost brightness
  finalPattern *= uIntensity * 1.5; // Much stronger intensity
  
  // Create color bands that shift over time - more dynamic
  float colorTime = t * 0.5 + uColorShift;
  
  // Multiple color layers with different frequencies - stronger mixing
  float colorLayer1 = sin(finalPattern * 3.14159 + colorTime) * 0.5 + 0.5;
  float colorLayer2 = sin(finalPattern * 3.14159 * 1.5 + colorTime * 1.3) * 0.5 + 0.5;
  float colorLayer3 = sin(finalPattern * 3.14159 * 2.0 + colorTime * 0.7) * 0.5 + 0.5;
  float colorLayer4 = sin(finalPattern * 3.14159 * 2.5 + colorTime * 1.1) * 0.5 + 0.5;
  
  // Blend colors based on pattern intensity - more vibrant mixing
  vec3 color = mix(uColor1, uColor2, colorLayer1);
  color = mix(color, uColor3, colorLayer2 * 0.8);
  color = mix(color, uColor4, colorLayer3 * 0.6);
  color = mix(color, uColor2, colorLayer4 * 0.4);
  
  // Add brightness variation based on pattern - much brighter
  float brightness = finalPattern * 2.5;
  brightness = smoothstep(0.0, 1.0, brightness);
  brightness = pow(brightness, 0.7); // Boost highlights
  color *= brightness;
  
  // Add strong glow effect - much more pronounced
  float glow1 = sin(finalPattern * 12.0 + t * 3.0) * 0.3 + 0.7;
  float glow2 = sin(finalPattern * 8.0 + t * 2.0) * 0.2 + 0.8;
  float glow = glow1 * glow2;
  color += (uColor2 + uColor3) * 0.4 * glow * finalPattern;
  color += uColor4 * 0.2 * glow * finalPattern;
  
  // Add pulsing effect for more life
  float pulse = sin(t * 1.5) * 0.15 + 0.85;
  color *= pulse;
  
  // Add sparkle effect for stars/particles - brighter
  vec2 sparkleUV = uv * 25.0;
  float sparkle = step(0.97, fbm(sparkleUV + t * 0.15));
  sparkle += step(0.99, fbm(sparkleUV * 1.5 + t * 0.2)) * 0.5;
  color += sparkle * vec3(1.0, 1.0, 1.0) * 0.8;
  
  // Add color shifting highlights
  vec3 highlight = mix(uColor2, uColor3, sin(t * 0.8) * 0.5 + 0.5);
  color += highlight * finalPattern * 0.3;
  
  // Soft edges - less aggressive fade
  vec2 center = uv - vec2(0.5);
  float dist = length(center);
  float edgeFade = 1.0 - smoothstep(0.45, 0.75, dist);
  color *= edgeFade;
  
  // Boost saturation for more vibrant colors
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luminance), color, 1.4);
  color = clamp(color, 0.0, 2.0); // Allow overbright
  
  // Final color with alpha
  gl_FragColor = vec4(color, 1.0);
}

