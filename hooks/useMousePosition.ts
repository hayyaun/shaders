import { useState, useEffect, useRef } from 'react';

const MAX_POSITIONS = 100;
const TIME_STEP = 0.016; // ~60fps

export function useMousePosition() {
  const [mousePositions, setMousePositions] = useState<Array<[number, number]>>([[0.5, 0.5]]);
  const lastUpdateTime = useRef<number>(Date.now());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = (now - lastUpdateTime.current) / 1000.0; // Convert to seconds
      
      // Only update if enough time has passed (throttle)
      if (dt < TIME_STEP * 0.5) {
        return;
      }
      
      // Convert mouse position to normalized coordinates (0-1 range)
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - (e.clientY / window.innerHeight); // Flip Y axis for GLSL convention
      
      setMousePositions((prev) => {
        // Add new position at the head (index 0)
        const newPositions = [[x, y], ...prev];
        // Remove the last position if we exceed max
        if (newPositions.length > MAX_POSITIONS) {
          newPositions.pop();
        }
        return newPositions;
      });
      
      lastUpdateTime.current = now;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return mousePositions;
}

