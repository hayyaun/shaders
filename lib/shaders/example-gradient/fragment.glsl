uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

// Hash function for pseudo-randomness
float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Noise function
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal noise
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  
  float t = uTime;
  vec2 center = vec2(0.5, 0.5);
  vec2 pos = uv - center;
  
  // Multiple time scales for chaotic behavior
  float t1 = t * 0.3;
  float t2 = t * 0.7;
  float t3 = t * 1.2;
  float t4 = t * 0.5;
  
  // Random rotation angles that change over time
  float angle1 = t1 + hash(floor(t1 * 0.5)) * 6.28;
  float angle2 = t2 * 0.7 + hash(floor(t2 * 0.3)) * 6.28;
  
  // Rotate positions with multiple angles
  float c1 = cos(angle1);
  float s1 = sin(angle1);
  float c2 = cos(angle2);
  float s2 = sin(angle2);
  
  vec2 rotated1 = vec2(
    pos.x * c1 - pos.y * s1,
    pos.x * s1 + pos.y * c1
  );
  
  vec2 rotated2 = vec2(
    pos.x * c2 - pos.y * s2,
    pos.x * s2 + pos.y * c2
  );
  
  // Multiple distance calculations with noise
  float dist1 = length(rotated1);
  float dist2 = length(rotated2);
  float dist3 = length(pos);
  
  // Add noise-based distortion
  vec2 noiseUV = uv * 3.0 + vec2(t3, t4);
  float n = fbm(noiseUV);
  float n2 = fbm(noiseUV * 2.0 + t * 0.5);
  
  // Chaotic distance variations
  dist1 += sin(dist1 * 5.0 + t1) * 0.15 + n * 0.2;
  dist2 += cos(dist2 * 7.0 + t2) * 0.12 + n2 * 0.15;
  dist3 += sin(dist3 * 3.0 + t3) * 0.1;
  
  // Multiple gradient patterns
  float gradient1 = sin(dist1 * 6.0 - t1 * 2.0) * 0.5 + 0.5;
  float gradient2 = cos(dist2 * 8.0 + t2 * 1.5) * 0.5 + 0.5;
  float gradient3 = sin(dist3 * 4.0 - t3 * 3.0) * 0.5 + 0.5;
  
  // Combine gradients with noise
  float gradient = (gradient1 + gradient2 * 0.7 + gradient3 * 0.5) / 2.2;
  gradient += n * 0.3;
  gradient = fract(gradient * 1.5);
  
  // Random color shifts that come and go
  float colorShift1 = sin(t1 * 0.8) * 0.5 + 0.5;
  float colorShift2 = cos(t2 * 1.1) * 0.5 + 0.5;
  float colorShift3 = sin(t3 * 0.6) * 0.5 + 0.5;
  
  // Weird color combinations that change over time
  vec3 weirdColor1 = vec3(
    0.3 + sin(t1) * 0.3,
    0.1 + cos(t2) * 0.4,
    0.7 + sin(t3) * 0.2
  );
  
  vec3 weirdColor2 = vec3(
    0.8 + cos(t2) * 0.15,
    0.2 + sin(t1) * 0.3,
    0.4 + cos(t3) * 0.25
  );
  
  vec3 weirdColor3 = vec3(
    0.1 + sin(t3) * 0.2,
    0.6 + cos(t1) * 0.3,
    0.3 + sin(t2) * 0.4
  );
  
  vec3 weirdColor4 = vec3(
    0.5 + hash(floor(t * 0.2)) * 0.4,
    0.3 + hash(floor(t * 0.3)) * 0.5,
    0.7 + hash(floor(t * 0.25)) * 0.3
  );
  
  // Mix colors based on multiple factors
  vec3 color = mix(weirdColor1, weirdColor2, gradient);
  color = mix(color, weirdColor3, gradient * colorShift1);
  color = mix(color, weirdColor4, n * colorShift2);
  
  // Add base colors with varying intensity
  color = mix(color, uColor1, sin(t1) * 0.2 + 0.1);
  color = mix(color, uColor2, cos(t2) * 0.15 + 0.1);
  color = mix(color, uColor3, sin(t3) * 0.2 + 0.1);
  
  // Add random sparkles and flashes
  float sparkle = step(0.98, hash(uv * 50.0 + floor(t * 10.0)));
  color += sparkle * vec3(1.0, 1.0, 1.0) * (sin(t * 5.0) * 0.5 + 0.5);
  
  // Radial fade with noise
  float fade = 1.0 - smoothstep(0.2, 0.8, dist3 + n * 0.3);
  color *= fade;
  
  // Add some saturation variations
  float saturation = 0.8 + sin(t * 0.4) * 0.2 + n * 0.1;
  vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
  color = mix(gray, color, saturation);
  
  gl_FragColor = vec4(color, 1.0);
}

