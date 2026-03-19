import React from "react";
import { useProducts } from "@/hooks/useProducts";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import AuthGate from "@/components/auth/AuthGate";
import type { SignItem } from "@/types";
import styles from "./ProductsPage.module.css";

/* ── column config ─────────────────────────────────────────────── */

type Column = {
  key: keyof SignItem;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: SignItem) => React.ReactNode;
};

const STATUS_LABELS: Record<string, { label: string; bg: string; fg: string }> =
  {
    A: { label: "Active", bg: "#dcfce7", fg: "#166534" },
    D: { label: "Discontinued", bg: "#fee2e2", fg: "#991b1b" },
    I: { label: "Inactive", bg: "#fef9c3", fg: "#854d0e" },
  };

const columns: Column[] = [
  { key: "signItemId", label: "ID", align: "center" },
  { key: "itemnum", label: "Item #", align: "center" },
  {
    key: "itemdesc1",
    label: "Description",
    render: (_v, row) => (
      <div>
        <span style={{ fontWeight: 600 }}>
          {row.itemdesc1 ?? row.Itemdesc1 ?? "—"}
        </span>
        {(row.itemdesc2 ?? row.Itemdesc2) && (
          <span style={{ color: "#64748b", marginLeft: 6, fontSize: "0.8125rem" }}>
            {row.itemdesc2 ?? row.Itemdesc2}
          </span>
        )}
        {(row.itemdesc3 ?? row.Itemdesc3) && (
          <span
            style={{
              display: "inline-block",
              marginLeft: 6,
              fontSize: "0.75rem",
              background: "#f1f5f9",
              color: "#475569",
              padding: "1px 6px",
              borderRadius: 4,
            }}
          >
            {row.itemdesc3 ?? row.Itemdesc3}
          </span>
        )}
      </div>
    ),
  },
  { key: "categorycode", label: "Category", align: "center" },
  { key: "companycode", label: "Company", align: "center" },
  { key: "location", label: "Location", align: "center" },
  { key: "department", label: "Dept", align: "center" },
  { key: "onhandSellQty", label: "On Hand", align: "right" },
  {
    key: "sellprice",
    label: "Price",
    align: "right",
    render: (_v, row) => {
      const v = row.sellprice ?? row.Sellprice;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return "—";
      return (
        <span style={{ fontWeight: 600, color: "#059669" }}>
          ${n.toFixed(2)}
        </span>
      );
    },
  },
  {
    key: "itemstatus",
    label: "Status",
    align: "center",
    render: (_v, row) => {
      const status = (row.itemstatus ?? row.Itemstatus) as string | undefined;
      const s = STATUS_LABELS[status ?? ""] ?? {
        label: String(status ?? "—"),
        bg: "#f1f5f9",
        fg: "#334155",
      };
      return (
        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "2px 10px",
            borderRadius: 9999,
            background: s.bg,
            color: s.fg,
          }}
        >
          {s.label}
        </span>
      );
    },
  },
  { key: "processingStatus", label: "Processing", align: "center" },
  {
    key: "createdDate",
    label: "Created",
    align: "center",
    render: (v) => {
      if (!v) return "—";
      const d = new Date(String(v));
      return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
    },
  },
  { key: "reasonforchange", label: "Change Reason" },
];

/* ── component ─────────────────────────────────────────────────── */

/**
 * ProductsPage — Federated Component
 *
 * Consumes portal/AuthContext for token injection.
 * Renders the sign-items catalogue in a data table.
 */
export default function ProductsPage({
  initialProducts,
}: {
  initialProducts?: SignItem[];
}) {
  /* ── portal auth context (hook-safe) ─── */
  const auth = usePortalAuth();

  const { products, isLoading, error, refetch } = useProducts({
    initialProducts,
  });

  /* ── Token wiring is no longer needed here ───────────────────────
   * The apiClient's request interceptor now dynamically imports
   * portal/AuthTokenService.getToken() and attaches the Bearer token
   * automatically. No manual accessor injection required.
   * ─────────────────────────────────────────────────────────────── */

  /* ── search filter ─── */
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        String(p.itemnum).includes(q) ||
        (p.itemdesc1 ?? p.Itemdesc1 ?? "").toLowerCase().includes(q) ||
        (p.itemdesc2 ?? p.Itemdesc2 ?? "").toLowerCase().includes(q) ||
        (p.categorycode ?? p.Categorycode ?? "").toLowerCase().includes(q) ||
        (p.reasonforchange ?? p.Reasonforchange ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  /* ── render ─── */
  return (
    <AuthGate>
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Sign Items</h2>
          <p className={styles.subtitle}>
            Loaded from the <strong>Signs</strong> micro-frontend
            {auth.isAuthenticated && auth.user && (
              <> — authenticated as {auth.user.email ?? auth.user.name ?? auth.user.sub}</>
            )}
          </p>
        </div>
        <div className={styles.actions}>
          <input
            className={styles.search}
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={styles.btn}
            onClick={() => void refetch()}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && products.length === 0 && (
        <div className={styles.status}>
          <div className={styles.spinner} />
          Loading sign items…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className={styles.error} role="alert">
          <strong>Error:</strong> {error}
          <button
            className={styles.retry}
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && products.length === 0 && (
        <div className={styles.empty}>
          <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            No sign items found
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Items will appear here once the API returns data.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && filtered.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{ textAlign: col.align ?? "left" }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={
                      item.signItemId ??
                      item.id ??
                      item.itemnum ??
                      idx
                    }
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align ?? "left" }}
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : String(item[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#94a3b8",
                      }}
                    >
                      No items match &ldquo;{search}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className={styles.count}>
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{products.length}</strong> items
          </p>
        </>
      )}
    </div>
    </AuthGate>
  );
}
