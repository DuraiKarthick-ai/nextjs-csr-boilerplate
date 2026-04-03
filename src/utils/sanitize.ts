/**
 * OWASP A03 Fix — XSS-safe isomorphic sanitizer
 *
 * DOMPurify requires a real DOM and is a silent no-op in Node.js/SSR.
 * This module wraps it properly:
 *   - Browser: uses native DOMPurify (fast, full-featured)
 *   - Server/Node: uses DOMPurify with a jsdom window (correct sanitization)
 *
 * Usage:
 *   import { sanitize } from "@/utils/sanitize";
 *   const clean = sanitize(apiResponseData);
 */

import DOMPurify from "dompurify";

type DOMPurifyInstance = typeof DOMPurify;

let _purify: DOMPurifyInstance | null = null;

function getPurify(): DOMPurifyInstance {
  if (_purify) return _purify;

  if (typeof window !== "undefined") {
    // Browser — native DOMPurify with the real window
    _purify = DOMPurify;
  } else {
    // Node.js / SSR — create a jsdom window for DOMPurify to operate on.
    // We use a dynamic require so this code path is only hit server-side
    // and doesn't bloat the client bundle.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { JSDOM } = require("jsdom") as { JSDOM: typeof import("jsdom").JSDOM };
      const { window } = new JSDOM("");
      _purify = DOMPurify(window as unknown as Parameters<typeof DOMPurify>[0]);
    } catch {
      // jsdom not available — return a pass-through with a console warning.
      // This should not happen in production; add jsdom as a dependency.
      console.warn(
        "[sanitize] jsdom not available — DOMPurify disabled server-side. " +
          "Add jsdom to dependencies to fix: npm install jsdom @types/jsdom"
      );
      _purify = {
        sanitize: (dirty: string) => dirty,
      } as unknown as DOMPurifyInstance;
    }
  }

  return _purify;
}

/**
 * Sanitizes a single string value.
 */
export function sanitizeString(dirty: string): string {
  return getPurify().sanitize(dirty, { USE_PROFILES: { html: true } });
}

/**
 * Recursively sanitizes all string values in an object/array.
 * Safe to use on API response payloads.
 */
export function sanitize<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizeString(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      cleaned[key] = sanitize(value);
    }
    return cleaned as T;
  }
  return data;
}
