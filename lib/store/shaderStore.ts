import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShaderStore {
  selectedShader: string;
  setSelectedShader: (shader: string) => void;
}

const VALID_SHADERS = ['Gradient Fog', 'Plasma', 'Aurora', 'Star Glitter'];

export const useShaderStore = create<ShaderStore>()(
  persist(
    (set) => ({
      selectedShader: 'Gradient Fog',
      setSelectedShader: (shader: string) => {
        // Validate and set shader
        if (VALID_SHADERS.includes(shader)) {
          set({ selectedShader: shader });
        }
      },
    }),
    {
      name: 'shader-storage', // unique name for localStorage key
      // Validate on rehydration
      onRehydrateStorage: () => {
        return (state) => {
          if (state && state.selectedShader && !VALID_SHADERS.includes(state.selectedShader)) {
            state.selectedShader = 'Gradient Fog';
          }
        };
      },
    }
  )
);

