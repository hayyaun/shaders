import { useControls } from "leva";
import { colorToVec3 } from "@/lib/utils/colorUtils";

interface UseGradientControlsProps {
  isActive: boolean;
}

export function useGradientControls({ isActive }: UseGradientControlsProps) {
  const controls = useControls(
    "Gradient",
    {
      "Color 1": {
        value: "#3366cc", // Blue in hex
      },
      "Color 2": {
        value: "#cc3366", // Pink in hex
      },
      "Color 3": {
        value: "#33cc66", // Green in hex
      },
    },
    {
      collapsed: !isActive,
    }
  );

  return {
    uColor1: colorToVec3(controls["Color 1"]),
    uColor2: colorToVec3(controls["Color 2"]),
    uColor3: colorToVec3(controls["Color 3"]),
  };
}
