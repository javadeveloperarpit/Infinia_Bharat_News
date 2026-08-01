import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "172.16.224.103",
  ],

  serverExternalPackages: [
    "firebase-admin",
  ],
};

export default nextConfig;