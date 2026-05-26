// @ts-check
const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

/**
 * OWASP A10 Fix: Validate PORTAL_REMOTE_URL against an allowlist at build time.
 * Prevents SSRF if the env var is tampered via misconfigured CI/CD secrets.
 */
const ALLOWED_PORTAL_ORIGINS = [
  "https://erp-portal.costco.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3001",
];

const PORTAL_REMOTE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD
    : (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV ?? "http://localhost:3000");

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "";

/**
 * Allowed image origins for CSP img-src.
 *
 * Includes self/data/blob plus explicit remote origins used by federation
 * assets in local/dev scenarios.
 */
const ALLOWED_IMAGE_ORIGINS = [
  "http://localhost:3002",
  "https://localhost:3001",
  APP_ORIGIN,
  PORTAL_REMOTE_URL,
].filter(Boolean).join(" ");

/**
 * Module Federation gate.
 *
 * The federation plugin registers extra webpack resolver hooks that, on
 * Windows + Next 14.2 + enhanced-resolve 5.21.x, surface a known upstream
 * "TypeError: _resolveContext_stack.delete is not a function" during
 * `next build`. Standalone builds don't need federation, so we make it
 * opt-in via the ENABLE_MODULE_FEDERATION env var.
 */
const ENABLE_MODULE_FEDERATION = process.env.ENABLE_MODULE_FEDERATION === "true";

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

  // Skip ESLint during `next build` — lint is run separately in CI via `npm run lint`.
  // This prevents import-order warnings and unused-var warnings from blocking production builds.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Next 14.2 ships a default `experimental.optimizePackageImports` list that
  // includes `@mui/material`, which routes barrel imports through the
  // `__barrel_optimize__` virtual module and into the broken
  // OptionalPeerDependencyResolverPlugin path (enhanced-resolve 5.21.x bug
  // on Windows). Override to an empty list to disable the experimental
  // optimizer for @mui/material. Source files use direct subpath imports
  // (e.g. `import Select from "@mui/material/Select"`) to avoid barrel
  // resolution entirely.
  experimental: {
    optimizePackageImports: [],
  },

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
              `connect-src 'self' ${PORTAL_REMOTE_URL ?? "https://localhost:3001"} https://loginnp.costco.com https://69ce482633a09f831b7d3ab9.mockapi.io http://34.133.77.6:8080 http://localhost:3002 https://localhost.ecsglobalinc.com:8083 https://costcotest.ecsglobalinc.com`,
              // Fonts served from /public/fonts
              "font-src 'self'",
              // Images from self + data URIs (Next/Image optimization)
              `img-src 'self' data: blob: ${ALLOWED_IMAGE_ORIGINS}`,
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

          // OWASP A10: CORS headers are set dynamically in src/middleware.ts
          // (dynamic origin reflection) so that all allowlisted origins work.
          // Static Access-Control-Allow-Origin is intentionally omitted here
          // because it only accepts a single value and would break multi-origin setups.
        ],
      },
    ];
  },

  webpack(config, options) {
    const { isServer } = options;

    // Module Federation is opt-in (set ENABLE_MODULE_FEDERATION=true) because the
    // federation plugin's resolver hooks trigger an upstream Next/enhanced-resolve
    // bug on Windows during `next build`.
    if (!isServer && ENABLE_MODULE_FEDERATION) {
      config.plugins.push(
        new NextFederationPlugin({
          name: "signs",
          filename: "static/chunks/remoteEntry.js",
          exposes: {
            // Single entry point — the host app imports `signs/app` and receives
            // all components, hooks, and types. No need to list each component.
            "./app": "./src/federation/index.ts",
          },
          shared: {
            react: { singleton: true, eager: true, requiredVersion: "18.3.1" },
            "react-dom": { singleton: true, eager: true, requiredVersion: "18.3.1" },
            "react/jsx-runtime": { singleton: true, eager: true, requiredVersion: "18.3.1" },
            "react/jsx-dev-runtime": { singleton: true, eager: true, requiredVersion: "18.3.1" },
          },
          extraOptions: {
            exposePages: false,
            enableImageLoaderFix: true,
            enableUrlLoaderFix: true,
          },
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
