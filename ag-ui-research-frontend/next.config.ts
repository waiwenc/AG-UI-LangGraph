import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/copilotkit/:path*", // The path the frontend is trying to call
        destination: "http://localhost:8000/langgraph-research", // Your FastAPI server and endpoint
      },
    ];
  },

  async headers() {
    return [
      {
        // Apply CSP to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: isDev
              // 👇 Allow eval & inline scripts only in dev for tools like CopilotKit or Next.js HMR
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self';"
              // 👇 Strict production policy
              : "script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
