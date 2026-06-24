/**
 * Unit tests for the PageContainer layout component.
 * Covers children rendering and the optional title/description heading.
 */

import { render, screen } from "@testing-library/react";
import PageContainer from "./PageContainer";

describe("PageContainer", () => {
  it("renders its children", () => {
    render(
      <PageContainer>
        <p>Page body</p>
      </PageContainer>
    );
    expect(screen.getByText("Page body")).toBeInTheDocument();
  });

  it("renders a title as a level-1 heading", () => {
    render(
      <PageContainer title="Dashboard">
        <span>x</span>
      </PageContainer>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <PageContainer title="Dashboard" description="Overview of activity">
        <span>x</span>
      </PageContainer>
    );
    expect(screen.getByText("Overview of activity")).toBeInTheDocument();
  });

  it("omits the heading block when no title or description is given", () => {
    render(
      <PageContainer>
        <span>only body</span>
      </PageContainer>
    );
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});
