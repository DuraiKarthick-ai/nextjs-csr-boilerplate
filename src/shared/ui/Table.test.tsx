/**
 * Unit tests for the generic Table UI component.
 * Covers header rendering, row rendering via column render functions,
 * empty data, and caption.
 */

import { render, screen } from "@testing-library/react";
import Table from "./Table";
import type { TableColumn } from "./Table";

interface Row {
  id: string;
  name: string;
  qty: number;
}

const columns: TableColumn<Row>[] = [
  { key: "name", header: "Name", render: (r) => r.name },
  { key: "qty", header: "Qty", render: (r) => String(r.qty) },
];

const data: Row[] = [
  { id: "1", name: "Apples", qty: 3 },
  { id: "2", name: "Bananas", qty: 5 },
];

describe("Table", () => {
  it("renders column headers", () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
  });

  it("renders a cell for each row via the render function", () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText("Apples")).toBeInTheDocument();
    expect(screen.getByText("Bananas")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders headers only when data is empty", () => {
    render(<Table columns={columns} data={[]} rowKey={(r) => r.id} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.queryByText("Apples")).not.toBeInTheDocument();
  });

  it("applies the caption as the table's accessible name", () => {
    render(
      <Table columns={columns} data={data} rowKey={(r) => r.id} caption="Items table" />
    );
    expect(screen.getByRole("table", { name: "Items table" })).toBeInTheDocument();
  });
});
