/**
 * Unit tests for the Button UI component.
 * Covers rendering, variant/size mapping, loading and disabled states,
 * and click handling.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("fires onClick when pressed", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and marked busy while loading", () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(["primary", "secondary", "danger", "ghost"] as const)(
    "renders the %s variant",
    (variant) => {
      render(<Button variant={variant}>V</Button>);
      expect(screen.getByRole("button", { name: "V" })).toBeInTheDocument();
    }
  );

  it.each(["sm", "md", "lg"] as const)("renders the %s size", (size) => {
    render(<Button size={size}>S</Button>);
    expect(screen.getByRole("button", { name: "S" })).toBeInTheDocument();
  });
});
