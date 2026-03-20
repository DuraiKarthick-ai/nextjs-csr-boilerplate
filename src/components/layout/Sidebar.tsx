import React from "react";
import type { SidebarItem } from "@/types/dashboard";
import styles from "./Sidebar.module.css";

/* ── Props ─────────────────────────────────────────────────────── */

interface SidebarProps {
  /** Primary nav items (Signs Management, Sign Worklist, etc.) */
  items: SidebarItem[];
  /** Currently selected item id */
  activeId: string;
  /** Callback when a nav item is clicked */
  onSelect: (id: string) => void;
}

/* ── SVG Icons (matching the Figma design) ─────────────────────── */

const ToolsIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/* ── Component ─────────────────────────────────────────────────── */

export default function Sidebar({ items, activeId, onSelect }: SidebarProps) {
  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Signs navigation">
      {/* Back to My Apps */}
      <button className={styles.backLink} type="button" aria-label="Back to My Apps">
        <span className={styles.backArrow}>←</span>
        My Apps
      </button>

      {/* Primary nav */}
      <nav className={styles.navSection}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? styles.navItemActive : styles.navItem}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
              {item.id === "signs-management" && (
                <span className={isActive ? styles.chevronUp : styles.chevron}>
                  ▾
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className={styles.divider} role="separator" />

      {/* Tools */}
      <button className={styles.toolsItem} type="button">
        <ToolsIcon />
        Tools
      </button>

      {/* Bottom divider */}
      <div className={styles.divider} role="separator" />
    </aside>
  );
}
