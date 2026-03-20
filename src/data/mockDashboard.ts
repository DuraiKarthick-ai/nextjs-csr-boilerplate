import type {
  SignsDashboardData,
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

/* ── Dashboard mock data ───────────────────────────────────────── */

export const MOCK_DASHBOARD_DATA: SignsDashboardData = {
  lastUpdated: "Last Updated 10:31am - 08/02/25",
  stats: [
    { id: "active-jobs", label: "Active Jobs", value: 24, icon: "jobs" },
    { id: "completed-today", label: "Completed Today", value: 156, icon: "completed" },
    { id: "templates", label: "Templates", value: 12, icon: "templates" },
    { id: "printers-online", label: "Printers Online", value: 8, icon: "printers" },
  ],
  recentActivity: [
    {
      jobId: "327898",
      product: "Frozen Yogurt",
      template: "Rebate Medium 7x4",
      status: "Completed",
    },
    {
      jobId: "167890",
      product: "Potato Fish Sticks",
      template: "Bullet Large 14 x 8.5",
      status: "Pending",
    },
    {
      jobId: "297836",
      product: "Smoked Black Pepper Jerky...",
      template: "Bullet Large 14 x 8.5",
      status: "Printing",
    },
  ],
};
