import React from "react";
import {
  usePortalAuth,
  PORTAL_LOGIN_URL,
  type PortalAuthResult,
} from "@/hooks/usePortalAuth";

/**
 * AuthGate — UI-layer authentication gate.
 *
 * OWASP A01: This is the client-side UX layer only.
 * Real server-side protection is enforced by src/middleware.ts which
 * validates tokens before any React code runs.
 *
 * Renders:
 *  - Spinner while resolving federated context
 *  - "Go to Portal" screen in standalone mode
 *  - "Please Log In" if federated but unauthenticated
 *  - children when fully authenticated
 */

interface AuthGateProps {
  children: React.ReactNode;
  portalUrl?: string;
}

export default function AuthGate({ children, portalUrl }: AuthGateProps) {
  const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== "false";
  const auth: PortalAuthResult = usePortalAuth();
  const loginUrl = portalUrl ?? PORTAL_LOGIN_URL;

  /* ── Auth bypass — skip all auth checks when disabled via env ─── */
  if (!authRequired) {
    return <>{children}</>;
  }

  if (auth.isResolvingCtx) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} aria-hidden="true" />
        <p style={{ color: "#64748b", marginTop: "1rem" }} role="status">
          Connecting to Portal…
        </p>
      </div>
    );
  }

  if (auth.isStandalone) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle} role="main">
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }} aria-hidden="true">🔒</div>
          <h2 style={headingStyle}>Authentication Required</h2>
          <p style={descStyle}>
            This micro-frontend must be accessed through the{" "}
            <strong>Portal</strong> application.
          </p>
          {/* OWASP A10: loginUrl is validated against allowlist in usePortalAuth */}
          <a href={loginUrl} style={linkBtnStyle} rel="noopener noreferrer">
            Go to Portal →
          </a>
          <p style={hintStyle}>
            Developer? Start the Portal at{" "}
            <code style={codeStyle}>{loginUrl}</code> first.
          </p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated && !auth.isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle} role="main">
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }} aria-hidden="true">🔑</div>
          <h2 style={headingStyle}>Please Log In</h2>
          <p style={descStyle}>You need to be logged in to view this page.</p>
          <button onClick={() => auth.login()} style={linkBtnStyle} type="button">
            Log in via Portal
          </button>
        </div>
      </div>
    );
  }

  if (auth.isLoading) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} aria-hidden="true" />
        <p style={{ color: "#64748b", marginTop: "1rem" }} role="status">
          Checking authentication…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/* ── Inline styles ───────────────────────────────────────────────── */

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 320,
  padding: "2rem 1rem",
};

const cardStyle: React.CSSProperties = {
  textAlign: "center",
  maxWidth: 440,
  padding: "2.5rem 2rem",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "0.5rem",
};

const descStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#475569",
  lineHeight: 1.6,
  marginBottom: "1.25rem",
};

const linkBtnStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.625rem 1.5rem",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: "0.875rem",
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
};

const hintStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  fontSize: "0.75rem",
  color: "#94a3b8",
  lineHeight: 1.5,
};

const codeStyle: React.CSSProperties = {
  background: "#f1f5f9",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: "0.75rem",
};

const spinnerStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: "3px solid #e2e8f0",
  borderTop: "3px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
