uniform float uTime;
uniform vec2 uResolution;
uniform float uMousePositions[200]; // Flattened array: [x0, y0, x1, y1, ...]
uniform float uMouseSpeeds[100]; // Speed at each point index
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
  // Adjust UV coordinates to account for aspect ratio
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  uv.x = (uv.x - 0.5) * aspect + 0.5;
  
  // Start with calm black background
  vec3 color = vec3(0.0);
  
  // Calculate current speed-based intensity multiplier for calm water effect
  float currentSpeedIntensity = smoothstep(0.0, 5.0, uMouseSpeed);
  currentSpeedIntensity = clamp(currentSpeedIntensity, 0.0, 1.0);
  
  // Accumulate effect from all mouse positions in history
  float totalEffect = 0.0;
  
  // Process segments between consecutive points for smooth interpolation
  // Index 0 is the current position (dt=0), higher indices are older (higher dt)
  for (int i = 0; i < 99; i++) {
    if (i + 1 >= uMouseCount) break;
    
    // Get two consecutive points
    int idx1 = i * 2;
    int idx2 = (i + 1) * 2;
    vec2 point1 = vec2(uMousePositions[idx1], uMousePositions[idx1 + 1]);
    vec2 point2 = vec2(uMousePositions[idx2], uMousePositions[idx2 + 1]);
    
    // Calculate segment vector and length
    vec2 segment = point2 - point1;
    float segmentLength = length(segment);
    
    // Skip if points are too close (avoid division issues)
    if (segmentLength < 0.0001) continue;
    
    // Find closest point on line segment to current pixel
    vec2 toPoint1 = uv - point1;
    float t = dot(toPoint1, segment) / (segmentLength * segmentLength);
    t = clamp(t, 0.0, 1.0); // Clamp to segment bounds
    
    // Interpolated position along the segment
    vec2 closestPoint = point1 + segment * t;
    
    // Calculate distance from current pixel to closest point on segment
    vec2 toClosest = uv - closestPoint;
    float dist = length(toClosest);
    
    // Interpolate time offset along the segment
    // Time offset for this segment (average of the two points)
    float dt1 = float(i) * 0.016;
    float dt2 = float(i + 1) * 0.016;
    float dt = mix(dt1, dt2, t); // Interpolate time along segment
    
    // Interpolate speed along the segment (use speed at the time each point was created)
    float speed1 = uMouseSpeeds[i];
    float speed2 = uMouseSpeeds[i + 1];
    float pointSpeed = mix(speed1, speed2, t); // Interpolate speed along segment
    
    // Calculate speed-based intensity for this specific point
    float pointSpeedIntensity = smoothstep(0.0, 5.0, pointSpeed);
    pointSpeedIntensity = clamp(pointSpeedIntensity, 0.0, 1.0);
    
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
    
    // Apply intensity modulated by the speed at the time this point was created
    totalEffect += effect * uRippleIntensity * pointSpeedIntensity;
  }
  
  // Add very subtle calm water movement (only when mouse is slow/stopped)
  float calmFactor = 1.0 - currentSpeedIntensity;
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

