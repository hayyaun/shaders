import { colorToVec3 } from "@/lib/utils/colorUtils";
import { useControls } from "leva";

interface UseWaterSplashControlsProps {
  isActive: boolean;
}

export function useWaterSplashControls({ isActive }: UseWaterSplashControlsProps) {
  const controls = useControls(
    "Water Splash",
    {
      "Ripple Speed": {
        value: 1.0,
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      "Ripple Intensity": {
        value: 1.0,
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      "Ripple Decay": {
        value: 3.0,
        min: 1,
        max: 10,
        step: 0.5,
      },
      "Ripple Frequency": {
        value: 20.0,
        min: 5,
        max: 50,
        step: 1,
      },
      "Wave Speed": {
        value: 0.3,
        min: 0.1,
        max: 1.0,
        step: 0.05,
      },
      "Ripple Color": {
        value: "#3366cc", // Blue
      },
    },
    {
      collapsed: !isActive,
    }
  );

  return {
    uRippleSpeed: controls["Ripple Speed"],
    uRippleIntensity: controls["Ripple Intensity"],
    uRippleDecay: controls["Ripple Decay"],
    uRippleFrequency: controls["Ripple Frequency"],
    uWaveSpeed: controls["Wave Speed"],
    uRippleColor: colorToVec3(controls["Ripple Color"]),
  };
}

