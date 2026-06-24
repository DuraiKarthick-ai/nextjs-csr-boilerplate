/**
 * Unit tests for formatting utilities (currency, date, price delta, truncation).
 * Date tests use explicit local-time strings to avoid timezone-dependent flakiness.
 */

import {
  formatCurrency,
  formatDate,
  calculatePriceDelta,
  getPriceChangeDirection,
  truncateText,
} from "./format";

describe("formatCurrency", () => {
  it("formats whole numbers with two decimals", () => {
    expect(formatCurrency(5)).toBe("$5.00");
  });

  it("pads a single decimal to two places", () => {
    expect(formatCurrency(12.9)).toBe("$12.90");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-3.5)).toBe("-$3.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("formats a local date string as MM/dd/yyyy", () => {
    // Noon local time keeps the calendar date stable across timezones.
    expect(formatDate("2026-06-19T12:00:00")).toBe("06/19/2026");
  });

  it("zero-pads single-digit months and days", () => {
    expect(formatDate("2026-01-05T12:00:00")).toBe("01/05/2026");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
    expect(formatDate("")).toBe("");
  });
});

describe("calculatePriceDelta", () => {
  it("returns a positive delta for an increase", () => {
    expect(calculatePriceDelta(10, 12.5)).toBe(2.5);
  });

  it("returns a negative delta for a decrease", () => {
    expect(calculatePriceDelta(12.5, 10)).toBe(-2.5);
  });

  it("rounds to two decimal places", () => {
    expect(calculatePriceDelta(10, 10.123)).toBe(0.12);
    expect(calculatePriceDelta(10, 10.126)).toBe(0.13);
  });

  it("returns 0 for unchanged prices", () => {
    expect(calculatePriceDelta(9.99, 9.99)).toBe(0);
  });
});

describe("getPriceChangeDirection", () => {
  it("returns 'increase' when the new price is higher", () => {
    expect(getPriceChangeDirection(5, 6)).toBe("increase");
  });

  it("returns 'decrease' when the new price is lower", () => {
    expect(getPriceChangeDirection(6, 5)).toBe("decrease");
  });

  it("returns 'unchanged' when prices are equal", () => {
    expect(getPriceChangeDirection(5, 5)).toBe("unchanged");
  });
});

describe("truncateText", () => {
  it("returns the original text when within the limit", () => {
    expect(truncateText("hello", 10)).toBe("hello");
    expect(truncateText("hello", 5)).toBe("hello");
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    expect(truncateText("hello world", 5)).toBe("hello…");
  });

  it("handles an empty string", () => {
    expect(truncateText("", 5)).toBe("");
  });
});
