/**
 * Unit tests for the Tabs UI component.
 * Covers default active tab, switching tabs, the onChange callback, and
 * honouring an explicit defaultActiveKey.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Tabs from "./Tabs";
import type { TabItem } from "./Tabs";

const tabs: TabItem[] = [
  { key: "a", label: "Alpha", content: <div>Alpha panel</div> },
  { key: "b", label: "Beta", content: <div>Beta panel</div> },
];

describe("Tabs", () => {
  it("renders the first tab's content by default", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText("Alpha panel")).toBeInTheDocument();
    expect(screen.queryByText("Beta panel")).not.toBeInTheDocument();
  });

  it("switches content when another tab is clicked and fires onChange", () => {
    const onChange = jest.fn();
    render(<Tabs tabs={tabs} onChange={onChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Beta" }));

    expect(screen.getByText("Beta panel")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("honours an explicit defaultActiveKey", () => {
    render(<Tabs tabs={tabs} defaultActiveKey="b" />);
    expect(screen.getByText("Beta panel")).toBeInTheDocument();
  });
});
