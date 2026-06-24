import { NextResponse, type NextRequest } from "next/server";

/**
 * Origins allowed to call the Signs app's API routes cross-origin.
 * Used by Module Federation: the portal host embeds the Signs remote,
 * so its origin makes cross-origin fetch() calls to the Signs API.
 */
const ALLOWED_ORIGINS = [
  "https://adt.erp.np.cc-costco.com",
  "https://adt-signs.erp.np.cc-costco.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3000",
  "https://localhost:3001",
  "https://localhost:3002",
  "https://qat-signs.erp.np.cc-costco.com"
];

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400",
};

export function middleware(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  // Handle OPTIONS preflight — must return 204 before Next.js routes it.
  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin) {
      preflight.headers.set("Access-Control-Allow-Origin", origin);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => preflight.headers.set(k, v));
    }
    return preflight;
  }

  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
