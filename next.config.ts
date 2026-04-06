import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["pdfjs-dist"],
  webpack: (config) => {
    // Allow importing .mjs files from node_modules (required for pdfjs-dist v5)
    config.module.rules.push({
      test: /node_modules[/\\]pdfjs-dist[/\\].*\.mjs$/,
      type: "javascript/auto",
    });
    return config;
  },
};

export default nextConfig;
