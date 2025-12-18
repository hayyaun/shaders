import { useState, useEffect, useRef } from 'react';

const MAX_POSITIONS = 100;
const FRAME_TIME = 1.0 / 60.0; // ~60fps

export function useMousePosition() {
  const [mousePositions, setMousePositions] = useState<Array<[number, number]>>([[0.5, 0.5]]);
  const [mouseSpeeds, setMouseSpeeds] = useState<Array<number>>([0.0]);
  const [mouseSpeed, setMouseSpeed] = useState<number>(0.0);
  const currentMousePosRef = useRef<[number, number]>([0.5, 0.5]);
  const previousMousePosRef = useRef<[number, number]>([0.5, 0.5]);
  const smoothedSpeedRef = useRef<number>(0.0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Update current mouse position on mousemove (don't append to array, just update ref)
    const handleMouseMove = (e: MouseEvent) => {
      // Find the Canvas element to get its actual size and position
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        // Fallback to window if canvas not found
        const x = e.clientX / window.innerWidth;
        const y = 1.0 - (e.clientY / window.innerHeight);
        currentMousePosRef.current = [x, y];
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      
      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convert to normalized coordinates (0-1 range)
      const x = mouseX / canvasWidth;
      const y = 1.0 - (mouseY / canvasHeight); // Flip Y axis for GLSL convention
      
      currentMousePosRef.current = [x, y];
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Append current mouse position to array on each frame and calculate speed
    const updatePositions = () => {
      const now = Date.now();
      const dt = Math.max((now - lastFrameTimeRef.current) / 1000.0, 0.001); // Prevent division by zero
      lastFrameTimeRef.current = now;
      
      // Calculate mouse speed (distance moved per second)
      const dx = currentMousePosRef.current[0] - previousMousePosRef.current[0];
      const dy = currentMousePosRef.current[1] - previousMousePosRef.current[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const instantSpeed = distance / dt;
      
      // Exponential smoothing for gradual fade
      const smoothingFactor = 0.1; // Lower = slower fade
      smoothedSpeedRef.current = smoothedSpeedRef.current * (1.0 - smoothingFactor) + instantSpeed * smoothingFactor;
      
      // Update speed state
      setMouseSpeed(smoothedSpeedRef.current);
      
      // Update previous position
      previousMousePosRef.current = [...currentMousePosRef.current];
      
      // Update positions and speeds arrays together
      setMousePositions((prev) => {
        // Add current position at the head (index 0)
        const newPositions = [currentMousePosRef.current, ...prev];
        // Remove the last position if we exceed max
        if (newPositions.length > MAX_POSITIONS) {
          newPositions.pop();
        }
        return newPositions;
      });
      
      setMouseSpeeds((prev) => {
        // Add current speed at the head (index 0) - use the speed at the time this point was created
        const newSpeeds = [smoothedSpeedRef.current, ...prev];
        // Remove the last speed if we exceed max
        if (newSpeeds.length > MAX_POSITIONS) {
          newSpeeds.pop();
        }
        return newSpeeds;
      });
      
      animationFrameRef.current = requestAnimationFrame(updatePositions);
    };

    animationFrameRef.current = requestAnimationFrame(updatePositions);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty deps - only run once to start the animation loop

  return { positions: mousePositions, speeds: mouseSpeeds, speed: mouseSpeed };
}

