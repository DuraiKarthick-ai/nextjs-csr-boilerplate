// @ts-check
const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

const PORTAL_REMOTE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD
    : (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV ?? "http://localhost:3000");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Access-Control-Allow-Origin",
            value: PORTAL_REMOTE_URL ?? "http://localhost:3000",
          },
        ],
      },
    ];
  },

  webpack(config, options) {
    const { isServer } = options;

    config.plugins.push(
      new NextFederationPlugin({
        name: "signs",
        filename: "static/chunks/remoteEntry.js",
        remotes: {
          portal: `portal@${PORTAL_REMOTE_URL}/_next/static/${isServer ? "ssr" : "chunks"}/remoteEntry.js`,
        },
        exposes: {
          "./ProductsPage": "./src/components/products/ProductsPage.tsx",
        },
        shared: {
          react: { singleton: true, eager: true, requiredVersion: "18.3.1" },
          "react-dom": { singleton: true, eager: true, requiredVersion: "18.3.1" },
        },
        extraOptions: {
          exposePages: false,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
        },
      })
    );

    return config;
  },
  
  // Experimental features
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;
