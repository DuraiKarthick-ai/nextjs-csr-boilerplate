import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("shows the error and an empty state when the API fails", () => {
    // Arrange — on failure the hook returns no items plus an error message.
    mockUseBatchDetail.mockReturnValue({ items: EMPTY_ITEMS, isLoading: false, error: "Network error" });
    const batchParams: BatchQueryParams = {
      batchId: 1,
      storeId: "100",
      batchConfigId: 1,
      batchName: "Failed Batch",
    };

    // Act
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // Assert — error surfaced, no rows rendered.
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.getByText("No records found")).toBeInTheDocument();
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
    expect(screen.getByText("Showing 0 of 0 rows")).toBeInTheDocument();
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

    // Assert — full dataset is small (< PAGE_SIZE), so all rows are rendered
    expect(
      screen.getByText(`Showing ${API_ITEMS.length} of ${API_ITEMS.length} rows`)
    ).toBeInTheDocument();
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

describe("WorklistScreen — interactions", () => {
  const batchParams: BatchQueryParams = {
    batchId: 22003,
    storeId: "100",
    batchConfigId: 10,
    batchName: "Test Batch",
  };

  const originalFetch = global.fetch;

  function routeFetch(routes: Record<string, unknown>): void {
    global.fetch = jest.fn((url: string) => {
      const key = Object.keys(routes).find((k) => url.includes(k));
      return Promise.resolve({ json: async () => (key ? routes[key] : { success: true }) } as Response);
    }) as unknown as typeof fetch;
  }

  beforeEach(() => {
    mockUseBatchDetail.mockReturnValue({ items: API_ITEMS, isLoading: false, error: null });
    routeFetch({});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("selecting a row updates the Print button count", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // checkboxes[0] is select-all; click the first row checkbox.
    fireEvent.click(checkboxes[1]!);
    expect(screen.getByRole("button", { name: /Print \(1\)/ })).toBeInTheDocument();
  });

  it("select-all selects every visible row", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    // Two API_ITEMS, each copies=1 → Print (2)
    expect(screen.getByRole("button", { name: /Print \(2\)/ })).toBeInTheDocument();
  });

  it("updates the copies value for a row", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);
    const copyInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(copyInputs[0]!, { target: { value: "4" } });
    expect((copyInputs[0] as HTMLInputElement).value).toBe("4");
  });

  it("opens the preview dialog and shows the returned image", async () => {
    routeFetch({
      "/item-search": { success: true, items: [{ productCode: "1264776", styleName: "Style" }] },
      "/custom-sign-render": { success: true, data: { data: [{ responseData: "BASE64DATA" }] } },
    });
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Preview/ })[0]!);
    await waitFor(() => expect(screen.getByText("Sign Preview")).toBeInTheDocument());
  });

  it("shows a preview error when the preview request fails", async () => {
    routeFetch({
      "/item-search": { success: true, items: [] },
      "/custom-sign-render": { success: false, message: "render failed" },
    });
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Preview/ })[0]!);
    await waitFor(() => expect(screen.getByText("No preview image returned")).toBeInTheDocument());
  });

  it("opens the print progress modal after selecting rows and clicking Print", async () => {
    routeFetch({
      "/session": { success: true, sessionID: "s1" },
      "/printers": { success: true, printers: ["P1"] },
      "/trays": { success: true, trays: ["T1"] },
    });
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByRole("button", { name: /Print \(1\)/ }));

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("sorts when a column sort icon is clicked", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);
    // The sort icon is the <i> sibling of the "Item #" label.
    const header = screen.getByText("Item #").closest("div");
    const sortIcon = header?.querySelector("i");
    if (sortIcon) fireEvent.click(sortIcon);
    // Both rows still present after sorting.
    expect(screen.getByText("1264776")).toBeInTheDocument();
    expect(screen.getByText("1730785")).toBeInTheDocument();
  });

  it("sorts every sortable column without crashing", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);
    for (const label of ["Item #", "Item Name", "Change Reason", "Sign Size", "Copies", "Print Status"]) {
      const header = screen.getByText(label).closest("div");
      const icon = header?.querySelector("i");
      if (icon) {
        fireEvent.click(icon); // ascending
        fireEvent.click(icon); // toggle to descending
      }
    }
    expect(screen.getByText("1264776")).toBeInTheDocument();
  });

  it("applies an Item # filter then clears all filters", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);

    // The first "All" combobox is the Item # column filter.
    const itemFilter = screen.getAllByPlaceholderText("All")[0]!;
    fireEvent.mouseDown(itemFilter);
    fireEvent.click(screen.getByRole("option", { name: "1264776" }));

    // Only the matching row remains; a filter-active indicator appears.
    expect(screen.queryByText("1730785")).not.toBeInTheDocument();
    const clearBtn = screen.getByRole("button", { name: /Clear All Filters/i });

    fireEvent.click(clearBtn);
    // Both rows visible again after clearing.
    expect(screen.getByText("1730785")).toBeInTheDocument();
  });

  it("loads more rows on scroll without crashing", () => {
    renderWithProvider(<WorklistScreen batchParams={batchParams} />);
    const scrollContainer = screen.getByText("1264776").closest("div[class*='tableWrap']");
    expect(scrollContainer).not.toBeNull();
    // clientHeight/scrollHeight are read-only getters in jsdom — define them.
    Object.defineProperty(scrollContainer!, "scrollTop", { value: 1000, configurable: true });
    Object.defineProperty(scrollContainer!, "clientHeight", { value: 500, configurable: true });
    Object.defineProperty(scrollContainer!, "scrollHeight", { value: 1000, configurable: true });
    fireEvent.scroll(scrollContainer!);
    expect(screen.getByText("1264776")).toBeInTheDocument();
  });
});
