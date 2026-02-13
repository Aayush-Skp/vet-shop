import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/products", destination: "/products.html" },
      { source: "/product/:id", destination: "/product-detail.html" },
    ];
  },
};

export default nextConfig;
