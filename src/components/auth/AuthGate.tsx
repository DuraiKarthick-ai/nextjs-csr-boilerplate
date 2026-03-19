import React from "react";
import {
  usePortalAuth,
  PORTAL_LOGIN_URL,
  type PortalAuthResult,
} from "@/hooks/usePortalAuth";

/* ── AuthGate ──────────────────────────────────────────────────────
 *
 * Wraps any screen that requires Portal authentication.
 *
 *  • Standalone mode  → shows a message + redirect link to the Portal.
 *  • Not authenticated → shows a "please log in" prompt.
 *  • Authenticated     → renders children.
 *
 * Usage:
 *   <AuthGate>
 *     <ProductsPage />
 *   </AuthGate>
 *
 * Or use the hook directly for more control:
 *   const auth = usePortalAuth();
 * ─────────────────────────────────────────────────────────────────── */

interface AuthGateProps {
  children: React.ReactNode;
  /** Optional: override where the "Go to Portal" link points. */
  portalUrl?: string;
}

export default function AuthGate({ children, portalUrl }: AuthGateProps) {
  const auth: PortalAuthResult = usePortalAuth();
  const loginUrl = portalUrl ?? PORTAL_LOGIN_URL;

  /* ── Still resolving the federated context ─── */
  if (auth.isResolvingCtx) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: "#64748b", marginTop: "1rem" }}>
          Connecting to Portal…
        </p>
      </div>
    );
  }

  /* ── Standalone — Portal not available ─── */
  if (auth.isStandalone) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
          <h2 style={headingStyle}>Authentication Required</h2>
          <p style={descStyle}>
            This micro-frontend must be accessed through the{" "}
            <strong>Portal</strong> application. Running it standalone does not
            provide the authentication context needed to fetch data.
          </p>
          <a href={loginUrl} style={linkBtnStyle}>
            Go to Portal →
          </a>
          <p style={hintStyle}>
            If you&apos;re a developer, start the Portal on{" "}
            <code style={codeStyle}>{loginUrl}</code> and access the Signs app
            from there.
          </p>
        </div>
      </div>
    );
  }

  /* ── Federated but user not authenticated yet ─── */
  if (!auth.isAuthenticated && !auth.isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔑</div>
          <h2 style={headingStyle}>Please Log In</h2>
          <p style={descStyle}>
            You need to be logged in to view this page.
          </p>
          <button
            onClick={() => auth.login()}
            style={linkBtnStyle}
          >
            Log in via Portal
          </button>
        </div>
      </div>
    );
  }

  /* ── Auth loading state ─── */
  if (auth.isLoading) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: "#64748b", marginTop: "1rem" }}>
          Checking authentication…
        </p>
      </div>
    );
  }

  /* ── Authenticated — render the protected content ─── */
  return <>{children}</>;
}

/* ── Inline styles (no CSS module dependency) ─────────────────────── */

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
