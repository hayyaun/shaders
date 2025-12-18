import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add GLSL loader - webpack applies loaders from right to left
    // Order: raw-loader (last) -> glslify-loader -> glslin-loader (first)
    // Insert at the beginning to ensure it's processed before other rules
    config.module.rules.unshift({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        "raw-loader",
        "glslify-loader",
        {
          loader: "glslin-loader",
          options: {
            root: path.resolve(__dirname, "lib/shaders/utils"),
          },
        },
      ],
    });

    return config;
  },
  // Add empty turbopack config to allow webpack config
  turbopack: {},
};

export default nextConfig;
