import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Find the existing oneOf rule array (Next.js uses oneOf for file matching)
    const oneOfRule = config.module.rules.find((rule: any) => rule.oneOf);
    
    if (oneOfRule) {
      // Insert GLSL loader rule before the default file-loader rule
      oneOfRule.oneOf.unshift({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          "raw-loader",
          {
            loader: "glslin-loader",
            options: {
              root: path.resolve(__dirname, "lib/shaders/utils"),
            },
          },
          "glslify-loader",
        ],
      });
    } else {
      // Fallback: add to rules array if oneOf doesn't exist
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          "raw-loader",
          {
            loader: "glslin-loader",
            options: {
              root: path.resolve(__dirname, "lib/shaders/utils"),
            },
          },
          "glslify-loader",
        ],
      });
    }

    return config;
  },
  // Add empty turbopack config to allow webpack config
  turbopack: {},
};

export default nextConfig;
