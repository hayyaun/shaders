import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Resolve loader paths to absolute paths with fallback
    let rawLoaderPath: string;
    let glslinLoaderPath: string;

    try {
      rawLoaderPath = require.resolve("raw-loader");
      glslinLoaderPath = require.resolve("glslin-loader");
    } catch (e) {
      // Fallback to string names if require.resolve fails
      rawLoaderPath = "raw-loader";
      glslinLoaderPath = "glslin-loader";
    }

    // Find the existing oneOf rule - Next.js uses oneOf rules
    const oneOfRule = config.module.rules.find(
      (rule: any) => rule && typeof rule === "object" && rule.oneOf
    ) as any;

    const glslRule = {
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: rawLoaderPath,
        },
        {
          loader: glslinLoaderPath,
          options: {
            root: path.resolve(__dirname, "lib/shaders/utils"),
          },
        },
      ],
    };

    if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
      // Insert our GLSL rule at the beginning of oneOf array
      oneOfRule.oneOf.unshift(glslRule);
    } else {
      // Fallback: add as a regular rule at the beginning
      config.module.rules.unshift(glslRule);
    }

    return config;
  },
  // Add empty turbopack config to allow webpack config
  turbopack: {},
};

export default nextConfig;
