import type {
  SidebarItem,
} from "@/types/dashboard";

/* ── Sidebar navigation items ──────────────────────────────────── */

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "signs-management", label: "Signs Management", active: true },
  { id: "sign-worklist", label: "Sign Worklist" },
  { id: "custom-template", label: "Custom Template" },
  { id: "sign-audit", label: "Sign Audit" },
  { id: "quick-sign-print", label: "Quick Sign Print" },
];

export const SIDEBAR_TOOLS: SidebarItem[] = [
  { id: "tools", label: "Tools" },
];
