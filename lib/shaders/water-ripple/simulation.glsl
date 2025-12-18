uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uPreviousState;
uniform vec2 uMouse;
uniform float uMousePressed;
uniform float uFrame;

varying vec2 vUv;

// Make this a smaller number for a smaller timestep.
// Don't make it bigger than 1.4 or the universe will explode.
const float delta = 1.0;

void main() {
    if (uFrame < 1.0) {
        gl_FragColor = vec4(0.0);
        return;
    }
    
    // Get current pixel position in screen space
    vec2 fragCoord = vUv * uResolution;
    ivec2 pixelCoord = ivec2(fragCoord);
    
    // Sample current state
    vec4 currentState = texture2D(uPreviousState, vUv);
    float pressure = currentState.x;
    float pVel = currentState.y;

    // Sample neighbors
    vec2 texelSize = 1.0 / uResolution;
    float p_right = texture2D(uPreviousState, vUv + vec2(texelSize.x, 0.0)).x;
    float p_left = texture2D(uPreviousState, vUv - vec2(texelSize.x, 0.0)).x;
    float p_up = texture2D(uPreviousState, vUv + vec2(0.0, texelSize.y)).x;
    float p_down = texture2D(uPreviousState, vUv - vec2(0.0, texelSize.y)).x;
    
    // Change values so the screen boundaries aren't fixed.
    if (fragCoord.x <= 0.5) p_left = p_right;
    if (fragCoord.x >= uResolution.x - 0.5) p_right = p_left;
    if (fragCoord.y <= 0.5) p_down = p_up;
    if (fragCoord.y >= uResolution.y - 0.5) p_up = p_down;

    // Apply horizontal wave function
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    // Apply vertical wave function (these could just as easily have been one line)
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;
    
    // Change pressure by pressure velocity
    pressure += delta * pVel;
    
    // "Spring" motion. This makes the waves look more like water waves and less like sound waves.
    pVel -= 0.005 * delta * pressure;
    
    // Velocity damping so things eventually calm down
    pVel *= 1.0 - 0.002 * delta;
    
    // Pressure damping to prevent it from building up forever.
    pressure *= 0.999;
    
    //x = pressure. y = pressure velocity. Z and W = X and Y gradient
    vec4 result = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);
    
    // Mouse interaction
    if (uMousePressed > 0.5) {
        float dist = distance(fragCoord, uMouse);
        if (dist <= 20.0) {
            result.x += 1.0 - dist / 20.0;
        }
    }
    
    // Automatic initial ripple on first few frames to get things started
    if (uFrame < 10.0) {
        vec2 center = uResolution * 0.5;
        float dist = distance(fragCoord, center);
        if (dist <= 30.0) {
            result.x += (1.0 - dist / 30.0) * 0.5;
        }
    }
    
    gl_FragColor = result;
}

