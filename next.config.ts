import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
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

    return config;
  },
  // Add empty turbopack config to allow webpack config
  turbopack: {},
};

export default nextConfig;
