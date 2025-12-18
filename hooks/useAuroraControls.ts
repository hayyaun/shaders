import { colorToVec3 } from "@/lib/utils/colorUtils";
import { useControls } from "leva";

interface UseAuroraControlsProps {
  isActive: boolean;
}

export function useAuroraControls({ isActive }: UseAuroraControlsProps) {
  const controls = useControls(
    "Aurora",
    {
      Speed: {
        value: 0.3,
        min: 0,
        max: 2,
        step: 0.1,
      },
      Intensity: {
        value: 1.5,
        min: 0.5,
        max: 4,
        step: 0.1,
      },
      "Wave Frequency": {
        value: 4.0,
        min: 1,
        max: 10,
        step: 0.5,
      },
      "Color Shift": {
        value: 0.0,
        min: 0,
        max: 10,
        step: 0.1,
      },
      "Color 1": {
        value: "#003366", // Deep blue
      },
      "Color 2": {
        value: "#00cc99", // Cyan
      },
      "Color 3": {
        value: "#3399ff", // Light blue
      },
      "Color 4": {
        value: "#6633cc", // Purple
      },
    },
    {
      collapsed: !isActive,
    }
  );

  return {
    uSpeed: controls.Speed,
    uIntensity: controls.Intensity,
    uWaveFrequency: controls["Wave Frequency"],
    uColorShift: controls["Color Shift"],
    uColor1: colorToVec3(controls["Color 1"]),
    uColor2: colorToVec3(controls["Color 2"]),
    uColor3: colorToVec3(controls["Color 3"]),
    uColor4: colorToVec3(controls["Color 4"]),
  };
}

