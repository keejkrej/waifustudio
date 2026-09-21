import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@electric-sql/pglite",
    "pg",
    "better-auth",
    "kysely",
  ],
  async rewrites() {
    return [{ source: "/__app-env", destination: "/api/app-env" }];
  },
};

export default nextConfig;
