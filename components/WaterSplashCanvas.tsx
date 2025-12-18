'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

interface WaterSplashCanvasProps {
  width?: number; // Canvas width in pixels
}

export interface WaterSplashCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
}

export const WaterSplashCanvas = forwardRef<WaterSplashCanvasRef, WaterSplashCanvasProps>(
  ({ width = 200 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
    const fadeAmountRef = useRef<number>(0.95); // Keep 95% opacity each frame (fade 5%)

    // Expose canvas via ref
    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Calculate canvas dimensions based on page aspect ratio
    const updateCanvasSize = () => {
      const pageAspect = window.innerWidth / window.innerHeight;
      const canvasHeight = width / pageAspect;
      canvas.width = width;
      canvas.height = canvasHeight;
      
      // Clear and set initial background
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Handle mouse move to draw lines (track mouse across entire page)
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas || !ctx) return;

      // Map mouse position from page coordinates to canvas coordinates
      // Mouse position relative to page (0-1 normalized)
      const pageX = e.clientX / window.innerWidth;
      const pageY = e.clientY / window.innerHeight;

      // Convert to canvas coordinates
      const canvasX = pageX * canvas.width;
      const canvasY = pageY * canvas.height;

      // Draw line from last position to current position
      if (lastMousePosRef.current) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastMousePosRef.current.x, lastMousePosRef.current.y);
        ctx.lineTo(canvasX, canvasY);
        ctx.stroke();
      }

      lastMousePosRef.current = { x: canvasX, y: canvasY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop to fade opacity
    const fadeOpacity = () => {
      if (!canvas || !ctx) return;

      // Get current image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Decrease opacity of all pixels
      for (let i = 3; i < data.length; i += 4) {
        // i is the alpha channel (every 4th byte)
        data[i] = Math.max(0, data[i] * fadeAmountRef.current);
      }

      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);

      requestAnimationFrame(fadeOpacity);
    };

    const animationFrameId = requestAnimationFrame(fadeOpacity);

      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    }, [width]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      />
    );
  }
);

WaterSplashCanvas.displayName = 'WaterSplashCanvas';

