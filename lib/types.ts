import { Uniform } from 'three';

export interface ShaderConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    [key: string]: { value: any };
  };
}

export interface ShaderUniforms {
  [key: string]: Uniform;
}

