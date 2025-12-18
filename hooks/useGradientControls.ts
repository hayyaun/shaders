import { useControls } from 'leva';

interface UseGradientControlsProps {
  isActive: boolean;
}

// Helper to convert hex/rgb color to vec3 array [r, g, b] in 0-1 range
function colorToVec3(color: string | { r: number; g: number; b: number }): [number, number, number] {
  if (typeof color === 'string') {
    // Handle hex colors like "#3366cc" or "rgb(51, 102, 204)"
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return [r, g, b];
    }
    // Handle rgb() strings
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]) / 255, parseInt(match[2]) / 255, parseInt(match[3]) / 255];
    }
  }
  // Handle object format { r, g, b } where values are 0-255
  if (typeof color === 'object' && 'r' in color && 'g' in color && 'b' in color) {
    // Check if values are in 0-1 range or 0-255 range
    const max = Math.max(color.r, color.g, color.b);
    const divisor = max > 1 ? 255 : 1;
    return [color.r / divisor, color.g / divisor, color.b / divisor];
  }
  return [0.2, 0.4, 0.8]; // Default fallback
}

export function useGradientControls({ isActive }: UseGradientControlsProps) {
  const controls = useControls(
    'Gradient',
    {
      'Color 1': {
        value: '#3366cc', // Blue in hex
        render: () => isActive,
      },
      'Color 2': {
        value: '#cc3366', // Pink in hex
        render: () => isActive,
      },
      'Color 3': {
        value: '#33cc66', // Green in hex
        render: () => isActive,
      },
    },
    {
      collapsed: true,
      render: () => isActive,
    }
  );

  return {
    uColor1: colorToVec3(controls['Color 1']),
    uColor2: colorToVec3(controls['Color 2']),
    uColor3: colorToVec3(controls['Color 3']),
  };
}

