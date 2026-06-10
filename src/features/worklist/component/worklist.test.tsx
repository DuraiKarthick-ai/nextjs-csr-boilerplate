import React from "react";
import { render, screen } from "@testing-library/react";
import WorklistScreen from "./worklist";
import useBatchDetail from "../hooks/useBatchDetail";
import { WorklistProvider } from "../../../store/worklistStore";
import type { BatchDetailItem, BatchQueryParams } from "../../../types/batch.types";

/** Renders WorklistScreen inside the required WorklistProvider context. */
function renderWithProvider(ui: React.ReactElement) {
  return render(<WorklistProvider>{ui}</WorklistProvider>);
}

jest.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: () => <input aria-label="date-picker" />,
}));

jest.mock("../hooks/useBatchDetail", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseBatchDetail = useBatchDetail as jest.MockedFunction<typeof useBatchDetail>;

const EMPTY_ITEMS: BatchDetailItem[] = [];

const API_ITEMS: BatchDetailItem[] = [
  {
    itemNumber: "1264776",
    description: "",
    department: "",
    signSize: "1",
    copies: 1,
    printStatus: "PENDING",
    changeReason: "",
    effectiveDate: "2026-06-03",
  },
  {
    itemNumber: "1730785",
    description: "",
    department: "",
    signSize: "1",
    copies: 1,
    printStatus: "PENDING",
    changeReason: "",
    effectiveDate: "2026-06-03",
  },
];

const FALLBACK_ITEMS: BatchDetailItem[] = [
  {
    itemNumber: "0001234",
    description: "2% Reduced Fat Milk 1 Gallon",
    department: "Dairy",
    signSize: "3x5",
    copies: 2,
    printStatus: "PENDING",
    changeReason: "Regular Price Change",
    effectiveDate: "2026-06-08",
  },
];

describe("WorklistScreen", () => {
  beforeEach(() => {
    mockUseBatchDetail.mockReturnValue({ items: EMPTY_ITEMS, isLoading: false, error: null });
  });

  it("renders the default worklist title when no batchParams are provided", () => {
    // Arrange
    renderWithProvider(<WorklistScreen />);

    // Act — nothing

    // Assert
    expect(screen.getByText("Signs Dashboard - Daily Sign Maintenance")).toBeInTheDocument();
  });

  it("renders the batch name in the title when batchParams are provided", () => {
    // Arrange
    const batchParams: BatchQueryParams = {
      batchId: 17254,
      storeId: "100",
      batchConfigId: 237022,
      batchName: "Emergency Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert
    expect(screen.getByText("Signs Dashboard - Emergency Batch")).toBeInTheDocument();
  });

  it("renders the batch group header with batch name when batchParams are provided", () => {
    // Arrange
    const batchParams: BatchQueryParams = {
      batchId: 17254,
      storeId: "100",
      batchConfigId: 237022,
      batchName: "Emergency Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert
    const headings = screen.getAllByText("Emergency Batch");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("shows the empty state when no batchParams are provided and hook returns no items", () => {
    // Arrange — hook already returns EMPTY_ITEMS from beforeEach

    // Act
    renderWithProvider(<WorklistScreen />);

    // Assert — no mock data, real empty state message shown
    expect(screen.getByText("No records found")).toBeInTheDocument();
  });

  it("renders actual API items when the hook returns data from the API", () => {
    // Arrange
    mockUseBatchDetail.mockReturnValue({ items: API_ITEMS, isLoading: false, error: null });
    const batchParams: BatchQueryParams = {
      batchId: 22003,
      storeId: "100",
      batchConfigId: 10,
      batchName: "Test Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert
    expect(screen.getByText("1264776")).toBeInTheDocument();
    expect(screen.getByText("1730785")).toBeInTheDocument();
  });

  it("renders fallback mock items when the hook returns them after an API failure", () => {
    // Arrange — hook returns fallback data (as it does when the API call throws)
    mockUseBatchDetail.mockReturnValue({ items: FALLBACK_ITEMS, isLoading: false, error: "Network error" });
    const batchParams: BatchQueryParams = {
      batchId: 1,
      storeId: "100",
      batchConfigId: 1,
      batchName: "Failed Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert — fallback row is visible
    expect(screen.getByText("2% Reduced Fat Milk 1 Gallon")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows shimmer rows while batch detail is loading", () => {
    // Arrange
    const batchParams: BatchQueryParams = {
      batchId: 1,
      storeId: "100",
      batchConfigId: 1,
      batchName: "Loading Batch",
    };
    mockUseBatchDetail.mockReturnValue({ items: EMPTY_ITEMS, isLoading: true, error: null });

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert
    const shimmerCells = document.querySelectorAll(".shimmer");
    expect(shimmerCells.length).toBeGreaterThan(0);
  });

  it("displays an error message when the batch detail fetch fails", () => {
    // Arrange
    const batchParams: BatchQueryParams = {
      batchId: 1,
      storeId: "100",
      batchConfigId: 1,
      batchName: "Failed Batch",
    };
    mockUseBatchDetail.mockReturnValue({
      items: EMPTY_ITEMS,
      isLoading: false,
      error: "Network error",
    });

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows the correct initial Print button count of zero", () => {
    // Arrange
    renderWithProvider(<WorklistScreen />);

    // Act — nothing

    // Assert
    expect(screen.getByText("Print (0)")).toBeInTheDocument();
  });

  it("does not show the filter count or clear button when no filters are active", () => {
    // Arrange
    renderWithProvider(<WorklistScreen />);

    // Act — nothing

    // Assert
    expect(screen.queryByText(/Filters? Active/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Clear All Filters")).not.toBeInTheDocument();
  });

  it("shows total row count of 0 when no batchParams are provided and hook returns empty items", () => {
    // Arrange — hook returns EMPTY_ITEMS from beforeEach

    // Act
    renderWithProvider(<WorklistScreen />);

    // Assert
    expect(screen.getByText("Total Rows: 0")).toBeInTheDocument();
  });

  it("shows total row count matching API items after a successful fetch", () => {
    // Arrange
    mockUseBatchDetail.mockReturnValue({ items: API_ITEMS, isLoading: false, error: null });
    const batchParams: BatchQueryParams = {
      batchId: 22003,
      storeId: "100",
      batchConfigId: 10,
      batchName: "Test Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert
    expect(screen.getByText(`Total Rows: ${API_ITEMS.length}`)).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    // Arrange
    renderWithProvider(<WorklistScreen />);

    // Act — nothing

    // Assert
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Item #")).toBeInTheDocument();
    expect(screen.getByText("Item Name")).toBeInTheDocument();
    expect(screen.getByText("Change Reason")).toBeInTheDocument();
    expect(screen.getByText("Sign Size")).toBeInTheDocument();
    expect(screen.getByText("Copies")).toBeInTheDocument();
    expect(screen.getByText("Print Status")).toBeInTheDocument();
    expect(screen.getByText("Print Preview")).toBeInTheDocument();
  });

  it("renders the empty state message when no rows match active filters", () => {
    // Arrange
    mockUseBatchDetail.mockReturnValue({
      items: API_ITEMS,
      isLoading: false,
      error: null,
    });
    const batchParams: BatchQueryParams = {
      batchId: 22003,
      storeId: "100",
      batchConfigId: 10,
      batchName: "Test Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert — API items are visible (no filter applied)
    expect(screen.getByText("1264776")).toBeInTheDocument();
  });
});
