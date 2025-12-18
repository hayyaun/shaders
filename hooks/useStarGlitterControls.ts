import { colorToVec3 } from "@/lib/utils/colorUtils";
import { useControls } from "leva";

interface UseStarGlitterControlsProps {
  isActive: boolean;
}

export function useStarGlitterControls({ isActive }: UseStarGlitterControlsProps) {
  const controls = useControls(
    "Star Glitter",
    {
      Speed: {
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
      "Star Density": {
        value: 12.0,
        min: 4,
        max: 30,
        step: 0.5,
      },
      "Glitter Intensity": {
        value: 1.0,
        min: 0,
        max: 3,
        step: 0.1,
      },
      "Twinkle Speed": {
        value: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      "Star Size": {
        value: 0.12,
        min: 0.05,
        max: 0.5,
        step: 0.01,
      },
      "Star Color": {
        value: "#ffffe6", // Warm white
      },
      "Glitter Color": {
        value: "#ccddff", // Cool white/blue
      },
      "Background Color": {
        value: "#0d0d26", // Dark blue
      },
    },
    {
      collapsed: true,
    }
  );

  return {
    uSpeed: controls.Speed,
    uStarDensity: controls["Star Density"],
    uGlitterIntensity: controls["Glitter Intensity"],
    uTwinkleSpeed: controls["Twinkle Speed"],
    uStarSize: controls["Star Size"],
    uStarColor: colorToVec3(controls["Star Color"]),
    uGlitterColor: colorToVec3(controls["Glitter Color"]),
    uBackgroundColor: colorToVec3(controls["Background Color"]),
  };
}

