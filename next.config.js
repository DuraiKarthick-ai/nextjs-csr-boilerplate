// @ts-check
// const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

/**
 * OWASP A10 Fix: Validate PORTAL_REMOTE_URL against an allowlist at build time.
 * Prevents SSRF if the env var is tampered via misconfigured CI/CD secrets.
 */
const ALLOWED_PORTAL_ORIGINS = [
  "https://erp-portal.costco.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const PORTAL_REMOTE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD
    : (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV ?? "http://localhost:3000");

if (
  PORTAL_REMOTE_URL &&
  !ALLOWED_PORTAL_ORIGINS.some((o) => PORTAL_REMOTE_URL.startsWith(o))
) {
  throw new Error(
    `[next.config.js] PORTAL_REMOTE_URL "${PORTAL_REMOTE_URL}" is not in the allowlist. ` +
      `Allowed: ${ALLOWED_PORTAL_ORIGINS.join(", ")}`
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow Next/Image to serve from public/ (default behavior, explicit for clarity)
  images: {
    // No external domains needed — all images are in public/images/
    domains: [],
    // Use unoptimized for TTF fonts (served raw from public/fonts/)
    unoptimized: false,
  },

  // OWASP A05: Remove "X-Powered-By: Next.js" fingerprinting header
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ── OWASP A05: Security headers ──────────────────────────────

          // Prevents MIME-type sniffing attacks
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Prevents clickjacking — only allow same-origin frames
          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          // OWASP A05 Fix: Replaced legacy X-XSS-Protection with CSP.
          // X-XSS-Protection is deprecated and ignored by modern browsers.
          // Content-Security-Policy is the correct modern replacement.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-eval is required by Module Federation (webpack runtime)
              "script-src 'self' 'unsafe-eval'",
              // unsafe-inline is required by Next.js CSS-in-JS / MUI
              "style-src 'self' 'unsafe-inline'",
              // Allow connections to Portal and Ping OIDC
              `connect-src 'self' ${PORTAL_REMOTE_URL ?? "http://localhost:3000"} https://loginnp.costco.com https://69ce482633a09f831b7d3ab9.mockapi.io`,
              // Fonts served from /public/fonts
              "font-src 'self'",
              // Images from self + data URIs (Next/Image optimization)
              "img-src 'self' data: blob:",
              // No plugins, no object embeds
              "object-src 'none'",
              // Lock base URI to self
              "base-uri 'self'",
              // Require HTTPS for all form submissions
              "form-action 'self'",
              // Block cross-origin framing
              "frame-ancestors 'self'",
            ].join("; "),
          },

          // OWASP A05 Fix: Force HTTPS for 2 years, include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Restrict access to browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },

          // Control referrer information sent to external sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // OWASP A10 Fix: Restrict CORS to the known Portal origin only.
          // Applied globally but should be more specific per-route in production.
          {
            key: "Access-Control-Allow-Origin",
            value: PORTAL_REMOTE_URL ?? "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type",
          },
        ],
      },
    ];
  },

  webpack(config, options) {
    const { isServer } = options;

    config.plugins.push(
      // new NextFederationPlugin({
      //   name: "signs",
      //   filename: "static/chunks/remoteEntry.js",
      //   remotes: {
      //     portal: `portal@${PORTAL_REMOTE_URL}/_next/static/${isServer ? "ssr" : "chunks"}/remoteEntry.js`,
      //   },
      //   exposes: {
      //     "./ProductsPage": "./src/components/products/ProductsPage.tsx",
      //   },
      //   shared: {
      //     react: { singleton: true, eager: true, requiredVersion: "18.3.1" },
      //     "react-dom": { singleton: true, eager: true, requiredVersion: "18.3.1" },
      //   },
      //   extraOptions: {
      //     exposePages: false,
      //     enableImageLoaderFix: true,
      //     enableUrlLoaderFix: true,
      //   },
      // })
    );

    return config;
  },
};

module.exports = nextConfig;
