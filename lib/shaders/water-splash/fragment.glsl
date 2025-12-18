uniform float uTime;
uniform vec2 uResolution;
uniform float uMousePositions[200]; // Flattened array: [x0, y0, x1, y1, ...]
uniform int uMouseCount;
uniform float uMouseSpeed;
uniform float uRippleSpeed;
uniform float uRippleIntensity;
uniform float uRippleDecay;
uniform float uRippleFrequency;
uniform float uWaveSpeed;
uniform vec3 uRippleColor;

varying vec2 vUv;

#include "hash.glsl"
#include "noise.glsl"

void main() {
  vec2 uv = vUv;
  
  // Start with calm black background
  vec3 color = vec3(0.0);
  
  // Calculate speed-based intensity multiplier
  // Normalize speed (typical range 0-10, but can be higher)
  // Use smoothstep to create a nice curve
  float speedIntensity = smoothstep(0.0, 5.0, uMouseSpeed);
  speedIntensity = clamp(speedIntensity, 0.0, 1.0);
  
  // Accumulate effect from all mouse positions in history
  float totalEffect = 0.0;
  
  // Process each position in the history
  // Index 0 is the current position (dt=0), higher indices are older (higher dt)
  for (int i = 0; i < 100; i++) {
    if (i >= uMouseCount) break;
    
    // Reconstruct vec2 from flattened array
    int idx = i * 2;
    vec2 mousePos = vec2(uMousePositions[idx], uMousePositions[idx + 1]);
    
    // Calculate distance from current pixel to this mouse position
    vec2 toMouse = uv - mousePos;
    float dist = length(toMouse);
    
    // Time offset for this position (index 0 = current, index i = i * timeStep)
    float dt = float(i) * 0.016; // Time step between positions
    
    // Wave expands outward from the point where mouse was
    // Wave radius grows over time: radius = waveSpeed * dt
    float waveRadius = uWaveSpeed * dt;
    
    // Distance from wave front
    float distFromWave = abs(dist - waveRadius);
    
    // Create repel effect - water is pushed away from mouse position
    // The depression creates a wave that expands outward
    float depressionRadius = 0.03;
    float depression = 1.0 - smoothstep(0.0, depressionRadius, dist);
    
    // Only show depression for recent positions (within small radius)
    depression *= step(dist, depressionRadius * 2.0);
    depression *= 1.0 - smoothstep(0.0, 0.5, dt); // Fade out depression over time
    
    // Create expanding wave ring
    // Wave is visible when we're near the wave front
    float waveWidth = 0.02; // Width of the wave ring
    float wave = 1.0 - smoothstep(0.0, waveWidth, distFromWave);
    
    // Wave only exists if it has propagated to this distance
    wave *= step(waveRadius, dist + waveWidth * 2.0);
    
    // Wave fades as it expands
    float waveDecay = 1.0 / (1.0 + dist * uRippleDecay);
    waveDecay *= 1.0 / (1.0 + dt * 2.0); // Also fade over time
    wave *= waveDecay;
    
    // Combine depression and wave
    float effect = depression * 0.4 + wave * 0.8;
    
    // Apply intensity modulated by mouse speed
    totalEffect += effect * uRippleIntensity * speedIntensity;
  }
  
  // Add very subtle calm water movement (only when mouse is slow/stopped)
  float calmFactor = 1.0 - speedIntensity;
  vec2 calmUV = uv * 1.5 + vec2(uTime * 0.02, uTime * 0.015);
  float calmNoise = fbm(calmUV) * 0.02;
  calmNoise *= calmFactor;
  
  totalEffect += calmNoise;
  
  // Create color with ripple color
  vec3 rippleColor = uRippleColor;
  
  // Apply effect to color
  color = rippleColor * totalEffect;
  
  // Clamp color
  color = clamp(color, 0.0, 1.0);
  
  gl_FragColor = vec4(color, 1.0);
}

