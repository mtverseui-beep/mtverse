import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const frameDenyHeaders = [{ key: "X-Frame-Options", value: "DENY" }];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-59d1b450736b455084e9eebc2ed27f14.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/:path((?!api/preview|preview|dashboard-kits).*)",
        headers: frameDenyHeaders,
      },

      {
        source: "/dashboard-kits/:slug*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors https://www.mtverse.dev https://mtverse.dev http://localhost:3000 http://127.0.0.1:3000" },
        ],
      },
      {
        source: "/prompts/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/templates/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=600, stale-while-revalidate=1200" },
        ],
      },
    ]
  },
};

export default nextConfig;