'use client';

import { ShaderScene } from '@/components/ShaderScene';
import { exampleGradientShader } from '@/lib/shaders';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <main className="w-full h-screen">
        <div className="absolute top-4 left-4 z-10 text-white">
          <h1 className="text-2xl font-bold mb-2">Shader Library</h1>
          <p className="text-sm text-gray-400">
            Example Gradient Shader
          </p>
        </div>
        <ShaderScene shader={exampleGradientShader} />
      </main>
    </div>
  );
}
