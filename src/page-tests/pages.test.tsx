/**
 * Unit tests for the thin Next.js page wrappers.
 * Each feature screen is stubbed so we exercise only the page wrapper logic
 * (PageContainer composition, router query parsing, provider wrapping).
 */

jest.mock("next/router", () => ({
  useRouter: () => ({ query: {}, push: jest.fn() }),
}));

jest.mock("../features/dashboard/component/dashboard", () => ({
  __esModule: true,
  default: () => <div>DashboardScreenStub</div>,
}));
jest.mock("../features/custom-sign/component/customSign", () => ({
  __esModule: true,
  default: () => <div>CustomSignScreenStub</div>,
}));
jest.mock("../features/quick-print/component/quickPrint", () => ({
  __esModule: true,
  default: () => <div>QuickPrintScreenStub</div>,
}));
jest.mock("../features/worklist/component/worklist", () => ({
  __esModule: true,
  default: () => <div>WorklistScreenStub</div>,
}));

import { render, screen } from "@testing-library/react";
import DashboardPage from "../pages/dashboard";
import CustomSignPage from "../pages/signs/custom";
import QuickPrintPage from "../pages/signs/quick-print";
import WorklistPage from "../pages/signs/worklist";
import IndexPage from "../pages/index";

describe("page wrappers", () => {
  it("DashboardPage renders the dashboard screen", () => {
    render(<DashboardPage />);
    expect(screen.getByText("DashboardScreenStub")).toBeInTheDocument();
  });

  it("CustomSignPage renders the custom sign screen", () => {
    render(<CustomSignPage />);
    expect(screen.getByText("CustomSignScreenStub")).toBeInTheDocument();
  });

  it("QuickPrintPage renders the quick print screen", () => {
    render(<QuickPrintPage />);
    expect(screen.getByText("QuickPrintScreenStub")).toBeInTheDocument();
  });

  it("WorklistPage renders the worklist screen inside its provider", () => {
    render(<WorklistPage />);
    expect(screen.getByText("WorklistScreenStub")).toBeInTheDocument();
  });

  it("IndexPage renders a minimal status response", () => {
    render(<IndexPage />);
    expect(screen.getByLabelText("root-status")).toHaveTextContent("ok");
  });
});
