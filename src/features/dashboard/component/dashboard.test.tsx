import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardScreen from "./dashboard";
import useBatches from "../hooks/useBatches";
import type { BatchItem } from "../../../types/batch.types";
import { BatchStatus } from "../../../types/batch.types";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../hooks/useBatches", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseBatches = useBatches as jest.MockedFunction<typeof useBatches>;

const mockBatches: BatchItem[] = [
  {
    batchId: 17254,
    batchName: "Emergency Batch",
    storeId: "100",
    batchConfigId: 237022,
    status: BatchStatus.READY,
    signQuantity: 10,
    printedQuantity: 2,
  },
];

describe("DashboardScreen", () => {
  beforeEach(() => {
    mockUseBatches.mockReturnValue({
      batches: [],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("renders the dashboard title", () => {
    // Arrange
    // (mocks above provide default empty state)

    // Act
    render(<DashboardScreen />);

    // Assert
    expect(screen.getByText("Signs Dashboard")).toBeInTheDocument();
  });

  it("renders Quick Links section", () => {
    // Arrange
    // (mocks above provide default empty state)

    // Act
    render(<DashboardScreen />);

    // Assert
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
  });

  it("renders Batch Jobs section heading when batches are present", () => {
    // Arrange
    mockUseBatches.mockReturnValue({
      batches: mockBatches,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    // Act
    render(<DashboardScreen />);

    // Assert
    expect(screen.getByText("worklistSummary.heading")).toBeInTheDocument();
  });

  it("does not render the batch section when no batches and not loading", () => {
    // Arrange
    // mocks return empty batches and isLoading false by default

    // Act
    render(<DashboardScreen />);

    // Assert — heading is absent because BatchJobsSection returns null
    expect(screen.queryByText("worklistSummary.heading")).not.toBeInTheDocument();
  });
});
