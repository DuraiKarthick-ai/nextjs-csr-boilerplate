import Link from "next/link";

export default function ServerError() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "Roboto, sans-serif",
        color: "#333",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0, color: "#d32f2f" }}>500</h1>
      <p style={{ fontSize: "1.25rem", marginTop: "1rem", color: "#666" }}>
        An unexpected error occurred.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "1.5rem",
          padding: "10px 24px",
          background: "#005DAB",
          color: "#fff",
          borderRadius: 4,
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Go to Home
      </Link>
    </div>
  );
}
