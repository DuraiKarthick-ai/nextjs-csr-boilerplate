/**
 * Unit tests for the PrintByItem screen.
 * global.fetch is mocked for the item-search lookup; covers add/duplicate/
 * not-found/error, undo/redo, clear list, remove item, clear fields, and
 * opening the print modal.
 */

import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import PrintByItem from "./PrintByItem";

const originalFetch = global.fetch;

/** Routes fetch by URL substring to JSON bodies. */
function routeFetch(routes: Record<string, unknown>): void {
  global.fetch = jest.fn((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    return Promise.resolve({ json: async () => (key ? routes[key] : { success: true }) } as Response);
  }) as unknown as typeof fetch;
}

const foundItem = {
  "/item-search": {
    success: true,
    items: [{ styleId: 7, styleName: "S", description: "Milk", productTypeCode: "ITM" }],
  },
};

/** Types an item number and clicks Add to List. */
async function addItem(upc: string): Promise<void> {
  fireEvent.change(screen.getByLabelText("Item number or UPC"), { target: { value: upc } });
  fireEvent.click(screen.getByRole("button", { name: "Add to List" }));
  await waitFor(() => expect(screen.getAllByText(upc).length).toBeGreaterThan(0));
}

describe("PrintByItem", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("renders the form fields and list title", () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    expect(screen.getByPlaceholderText("Enter or Scan Item # / UPC")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Copies")).toBeInTheDocument();
    expect(screen.getByText("Quick Sign Print List")).toBeInTheDocument();
  });

  it("adds a found item to the list", async () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    await addItem("12345");
    expect(screen.getByText("12345")).toBeInTheDocument();
  });

  it("shows an error for a not-found item", async () => {
    routeFetch({ "/item-search": { success: true, items: [] } });
    render(<PrintByItem />);
    fireEvent.change(screen.getByLabelText("Item number or UPC"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to List" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/not found/i));
  });

  it("rejects a duplicate item", async () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    await addItem("12345");
    fireEvent.change(screen.getByLabelText("Item number or UPC"), { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to List" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/already in the list/i));
  });

  it("shows an error when the lookup request fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    render(<PrintByItem />);
    fireEvent.change(screen.getByLabelText("Item number or UPC"), { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to List" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/Failed to look up/i));
  });

  it("undoes and redoes adding an item", async () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    await addItem("12345");

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(screen.queryByText("12345")).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    await waitFor(() => expect(screen.getByText("12345")).toBeInTheDocument());
  });

  it("clears the whole list", async () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    await addItem("12345");
    fireEvent.click(screen.getByRole("button", { name: "Clear List" }));
    await waitFor(() => expect(screen.queryByText("12345")).not.toBeInTheDocument());
  });

  it("removes a single item via its remove button", async () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    await addItem("12345");
    fireEvent.click(screen.getByRole("button", { name: "Remove item 12345" }));
    await waitFor(() => expect(screen.queryByText("12345")).not.toBeInTheDocument());
  });

  it("clears the input fields with Clear Fields", async () => {
    routeFetch(foundItem);
    render(<PrintByItem />);
    const input = screen.getByLabelText("Item number or UPC") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear Fields" }));
    expect(input.value).toBe("");
  });

  it("opens the print modal once items are queued", async () => {
    routeFetch({ ...foundItem, "/session": { success: true, sessionID: "s1" }, "/printers": { success: true, printers: ["P1"] }, "/trays": { success: true, trays: ["T1"] } });
    render(<PrintByItem />);
    await addItem("12345");

    fireEvent.click(screen.getByRole("button", { name: /Print \(/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(within(screen.getByRole("dialog")).getByText("Quick Print")).toBeInTheDocument();
  });
});
