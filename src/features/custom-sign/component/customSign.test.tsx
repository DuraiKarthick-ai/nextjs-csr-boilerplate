import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomSignScreen from "./customSign";
import * as customSignService from "../services/customSignService";

jest.mock("../services/customSignService");

const mockRenderCustomSign = customSignService.renderCustomSign as jest.MockedFunction<
  typeof customSignService.renderCustomSign
>;

const MOCK_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const MOCK_RENDER_RESPONSE = {
  success: true,
  statusCode: 200,
  message: "Custom signs rendered successfully",
  data: [
    {
      responseData: MOCK_BASE64,
      hashCode: "abc123",
      physicalWidth: 39370,
      physicalHeight: 15748,
    },
  ],
  timestamp: "2026-06-05T00:00:00.000Z",
};

// The Lookup button requires both a product code and a size to be enabled.
// MUI Select renders as role="combobox" with aria-label from inputProps.
function selectSize() {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: /select size/i }));
  fireEvent.click(screen.getByRole("option", { name: "S-Small" }));
}

describe("CustomSignScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Item # / UPC input and Lookup button", () => {
    // Arrange

    // Act
    render(<CustomSignScreen />);

    // Assert
    expect(screen.getByPlaceholderText("Enter Item # / UPC")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lookup/i })).toBeInTheDocument();
  });

  it("renders the empty sign preview placeholder before lookup", () => {
    // Arrange
    render(<CustomSignScreen />);

    // Act — nothing

    // Assert
    expect(screen.getByText("Sign preview will be shown here")).toBeInTheDocument();
  });

  it("does not render text input fields before a successful lookup", () => {
    // Arrange
    render(<CustomSignScreen />);

    // Act — nothing

    // Assert
    expect(screen.queryByPlaceholderText("Title Line 1")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Title Line 2")).not.toBeInTheDocument();
  });

  it("disables the Lookup button when the item number input is empty", () => {
    // Arrange
    render(<CustomSignScreen />);

    // Act — nothing, checking initial state

    // Assert — button is disabled so no API call can be made
    expect(screen.getByRole("button", { name: /lookup/i })).toBeDisabled();
    expect(mockRenderCustomSign).not.toHaveBeenCalled();
  });

  it("calls renderCustomSign with the entered item number on Lookup click", async () => {
    // Arrange
    mockRenderCustomSign.mockResolvedValueOnce(MOCK_RENDER_RESPONSE);
    render(<CustomSignScreen />);
    selectSize();
    const input = screen.getByPlaceholderText("Enter Item # / UPC");
    fireEvent.change(input, { target: { value: "1007086" } });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /lookup/i }));

    // Assert
    await waitFor(() => {
      expect(mockRenderCustomSign).toHaveBeenCalledTimes(1);
      expect(mockRenderCustomSign).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ productCode: "1007086" }),
        ])
      );
    });
  });

  it("displays the preview image and text fields after a successful lookup", async () => {
    // Arrange
    mockRenderCustomSign.mockResolvedValueOnce(MOCK_RENDER_RESPONSE);
    render(<CustomSignScreen />);
    selectSize();
    fireEvent.change(screen.getByPlaceholderText("Enter Item # / UPC"), {
      target: { value: "1007086" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /lookup/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByAltText("Custom sign preview")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Title Line 1")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Title Line 2")).toBeInTheDocument();
    });
  });

  it("shows an error message when the render API call fails", async () => {
    // Arrange
    mockRenderCustomSign.mockRejectedValueOnce(new Error("Network error"));
    render(<CustomSignScreen />);
    selectSize();
    fireEvent.change(screen.getByPlaceholderText("Enter Item # / UPC"), {
      target: { value: "1007086" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /lookup/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
    expect(screen.queryByPlaceholderText("Title Line 1")).not.toBeInTheDocument();
  });

  it("resets state and hides text fields when Reset is clicked", async () => {
    // Arrange
    mockRenderCustomSign.mockResolvedValueOnce(MOCK_RENDER_RESPONSE);
    render(<CustomSignScreen />);
    selectSize();
    fireEvent.change(screen.getByPlaceholderText("Enter Item # / UPC"), {
      target: { value: "1007086" },
    });
    fireEvent.click(screen.getByRole("button", { name: /lookup/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title Line 1")).toBeInTheDocument();
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    // Assert
    expect(screen.queryByPlaceholderText("Title Line 1")).not.toBeInTheDocument();
    expect(screen.getByText("Sign preview will be shown here")).toBeInTheDocument();
  });

  it("disables the Print button before a successful lookup", () => {
    // Arrange
    render(<CustomSignScreen />);

    // Act — nothing

    // Assert
    expect(screen.getByRole("button", { name: /print/i })).toBeDisabled();
  });

  it("enables the Print button after a successful lookup", async () => {
    // Arrange
    mockRenderCustomSign.mockResolvedValueOnce(MOCK_RENDER_RESPONSE);
    render(<CustomSignScreen />);
    selectSize();
    fireEvent.change(screen.getByPlaceholderText("Enter Item # / UPC"), {
      target: { value: "1007086" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /lookup/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /print/i })).not.toBeDisabled();
    });
  });
});
