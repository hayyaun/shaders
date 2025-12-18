import { colorToVec3 } from "@/lib/utils/colorUtils";
import { useControls } from "leva";

interface UsePlasmaControlsProps {
  isActive: boolean;
}

export function usePlasmaControls({ isActive }: UsePlasmaControlsProps) {
  const controls = useControls(
    "Plasma",
    {
      Speed: {
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
      Scale: {
        value: 5.0,
        min: 1,
        max: 20,
        step: 0.5,
      },
      "Color 1": {
        value: "#000000", // Black
      },
      "Color 2": {
        value: "#0080ff", // Cyan
      },
      "Color 3": {
        value: "#8000ff", // Purple
      },
    },
    {
      collapsed: !isActive,
    }
  );

  return {
    uSpeed: controls.Speed,
    uScale: controls.Scale,
    uColor1: colorToVec3(controls["Color 1"]),
    uColor2: colorToVec3(controls["Color 2"]),
    uColor3: colorToVec3(controls["Color 3"]),
  };
}
