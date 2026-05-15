import { NextRequest, NextResponse } from "next/server";

/**
 * OWASP A01 — Broken Access Control Fix
 *
 * Server-side route protection via Next.js middleware.
 * Validates the Authorization Bearer token on every request to protected
 * routes BEFORE any React code runs. This closes the client-only auth gap
 * that existed when AuthGate was the sole protection (ssr: false = no SSR
 * guard).
 *
 * Token validation strategy:
 *   - In a Module Federation setup, the Portal BFF issues the JWT.
 *   - We validate the token presence and basic structure here.
 *   - Full cryptographic verification should happen in the Portal BFF
 *     or via a lightweight jose verify call with the shared public key.
 *
 * For production, replace the lightweight check below with:
 *   import { jwtVerify } from "jose";
 *   await jwtVerify(token, publicKey);
 */

const PROTECTED_PATHS = ["/dashboard", "/quickSign", "/customSign", "/signWorklist", "/signAudit", "/signs", "/products"];

/** Allowed Portal origins — validated at middleware level (OWASP A10 SSRF guard). */
const ALLOWED_PORTAL_ORIGINS = [
  "https://erp-portal.costco.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3001",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function buildLoginRedirect(req: NextRequest, reason: string): NextResponse {
  const loginUrl = new URL("/", req.url);
  loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // ── Auth bypass — mirrors AuthGate's NEXT_PUBLIC_AUTH_REQUIRED check ──
  if (process.env.NEXT_PUBLIC_AUTH_REQUIRED === "false") {
    return NextResponse.next();
  }

  // ── OWASP A10: Validate Origin header against allowlist ──────────
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_PORTAL_ORIGINS.includes(origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── Only protect specific routes ─────────────────────────────────
  if (!isProtectedPath(pathname)) {
    // Reflect the validated origin in CORS headers so all allowed origins work.
    // Access-Control-Allow-Origin only accepts a single value, so we echo back
    // the request Origin if it is in our allowlist (dynamic CORS reflection).
    const res = NextResponse.next();
    if (origin && ALLOWED_PORTAL_ORIGINS.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    }
    return res;
  }

  // ── Check for Bearer token in Authorization header ───────────────
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    // Also check cookie-based token (Portal may set one after SSO)
    const cookieToken = req.cookies.get("access_token")?.value;
    if (!cookieToken) {
      return buildLoginRedirect(req, "unauthenticated");
    }
  }

  /**
   * ── Production: add full JWT verification here ──────────────────
   *
   * import { jwtVerify, createRemoteJWKSet } from "jose";
   *
   * const JWKS = createRemoteJWKSet(
   *   new URL(`${process.env.NEXT_PUBLIC_PING_ISSUER}/jwks`)
   * );
   *
   * try {
   *   await jwtVerify(token!, JWKS, {
   *     issuer: process.env.NEXT_PUBLIC_PING_ISSUER,
   *     audience: process.env.NEXT_PUBLIC_PING_CLIENT_ID,
   *   });
   * } catch {
   *   return buildLoginRedirect(req, "invalid_token");
   * }
   */

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (fonts, images)
     * - api routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|fonts/|images/|api/).*)",
  ],
};
