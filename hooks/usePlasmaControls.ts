import { useControls } from 'leva';

interface UsePlasmaControlsProps {
  isActive: boolean;
}

export function usePlasmaControls({ isActive }: UsePlasmaControlsProps) {
  const controls = useControls(
    'Plasma',
    {
      Speed: {
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
        render: () => isActive,
      },
      Scale: {
        value: 5.0,
        min: 1,
        max: 20,
        step: 0.5,
        render: () => isActive,
      },
    },
    {
      collapsed: true,
      render: () => isActive,
    }
  );

  return {
    uSpeed: controls.Speed,
    uScale: controls.Scale,
  };
}

