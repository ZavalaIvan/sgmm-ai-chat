import type { NextConfig } from "next";

// next-pwa does not currently ship typed ESM helpers, so the wrapper is loaded via require here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/i,
      handler: "NetworkFirst",
      method: "GET",
      options: {
        cacheName: "http-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: /\/api\/chat$/i,
      handler: "NetworkOnly",
      method: "POST",
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
};

export default withPWA(nextConfig);
