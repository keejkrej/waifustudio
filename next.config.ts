import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@electric-sql/pglite",
    "pg",
    "better-auth",
    "kysely",
  ],
  async rewrites() {
    return [
      { source: "/__app-env", destination: "/api/app-env" },
      { source: "/__grok/manifest.webmanifest", destination: "/api/grok/manifest" },
      { source: "/__grok/manifest.json", destination: "/api/grok/manifest" },
    ];
  },
};

export default nextConfig;
