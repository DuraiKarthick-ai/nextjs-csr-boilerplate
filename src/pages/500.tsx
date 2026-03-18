import React from "react";

/**
 * Custom 500 page.
 * Intentionally avoids next/head and next/link to prevent Module Federation
 * shared-React singleton errors during static prerendering.
 */
export default function ServerError() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: 800, color: "#e2e8f0" }}>
        500
      </h1>
      <p style={{ fontSize: "1.125rem", color: "#64748b", marginTop: "0.5rem" }}>
        Something went wrong on our end. Please try again later.
      </p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        style={{
          marginTop: "1.5rem",
          padding: "0.5rem 1.25rem",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          fontSize: "0.875rem",
          color: "#334155",
        }}
      >
        ← Back to Home
      </a>
    </div>
  );
}
