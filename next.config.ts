import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Find the existing oneOf rule - Next.js uses oneOf rules
    const oneOfRule = config.module.rules.find(
      (rule: any) => rule.oneOf
    ) as any;

    // Resolve loader paths
    const rawLoader = require.resolve("raw-loader");
    const glslifyLoader = require.resolve("glslify-loader");
    const glslinLoader = require.resolve("glslin-loader");

    const glslRule = {
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        rawLoader,
        glslifyLoader,
        {
          loader: glslinLoader,
          options: {
            root: path.resolve(__dirname, "lib/shaders/utils"),
          },
        },
      ],
    };

    if (oneOfRule) {
      // Insert our GLSL rule at the beginning of oneOf array
      oneOfRule.oneOf.unshift(glslRule);
    } else {
      // Fallback: add as a regular rule if oneOf doesn't exist
      config.module.rules.unshift(glslRule);
    }

    return config;
  },
  // Add empty turbopack config to allow webpack config
  turbopack: {},
};

export default nextConfig;
