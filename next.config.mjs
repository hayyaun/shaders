import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // shader support - matching working portfolio config
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

