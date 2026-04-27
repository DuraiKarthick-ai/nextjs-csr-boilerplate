import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const DEFAULT_VIEW_ROUTE = "/dashboard";

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
  fontFamily: '"Roboto", sans-serif',
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "32rem",
  padding: "2rem",
  borderRadius: "1rem",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.75rem",
};

const descriptionStyle: React.CSSProperties = {
  margin: "1rem 0 0",
  fontSize: "1rem",
  lineHeight: 1.6,
};

const linkStyle: React.CSSProperties = {
  color: "#0f62fe",
  fontWeight: 600,
};

/**
 * Root index page that responds successfully for health checks and redirects users.
 *
 * The page renders a lightweight HTML response so infrastructure probes that hit
 * / receive a stable 200 OK response, while browsers are immediately forwarded to
 * the default dashboard view.
 *
 * @returns {JSX.Element} A lightweight landing page with client and meta refresh redirects.
 */
export default function IndexRedirect(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    void router.replace(DEFAULT_VIEW_ROUTE);
  }, [router]);

  return (
    <>
      <Head>
        <title>Signs</title>
        <meta httpEquiv="refresh" content={`0;url=${DEFAULT_VIEW_ROUTE}`} />
      </Head>
      <main style={containerStyle}>
        <section style={cardStyle} aria-labelledby="signs-redirect-title">
          <h1 id="signs-redirect-title" style={titleStyle}>
            Signs
          </h1>
          <p style={descriptionStyle}>Redirecting to the dashboard.</p>
          <p style={descriptionStyle}>
            If you are not redirected automatically, continue to the{" "}
            <a href={DEFAULT_VIEW_ROUTE} style={linkStyle}>
              dashboard
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
