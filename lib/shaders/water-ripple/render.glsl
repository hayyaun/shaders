uniform vec2 uResolution;
uniform sampler2D uSimulationState;
uniform sampler2D uBackgroundTexture;

varying vec2 vUv;

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vUv;

    vec4 data = texture2D(uSimulationState, uv);
    
    // Color = texture with distortion
    vec4 color = texture2D(uBackgroundTexture, uv + 0.2 * data.zw);
    
    // Sunlight glint
    vec3 normal = normalize(vec3(-data.z, 0.2, -data.w));
    vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));
    float specular = pow(max(0.0, dot(normal, lightDir)), 60.0);
    color += vec4(1.0) * specular;
    
    // Ensure alpha is 1.0
    color.a = 1.0;
    
    gl_FragColor = color;
}

