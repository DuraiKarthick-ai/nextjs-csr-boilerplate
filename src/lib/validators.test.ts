/**
 * Unit tests for input validation utilities.
 * Covers item-number, price, quantity, string, department, date, and
 * search-term sanitisation logic, including boundary and injection cases.
 */

import {
  isValidItemNumber,
  isValidPrice,
  isValidQuantity,
  isNonEmptyString,
  isValidDepartment,
  isValidDateString,
  sanitiseSearchTerm,
} from "./validators";
import { MAX_PRINT_QUANTITY } from "./constants";

describe("isValidItemNumber", () => {
  it("accepts alphanumeric values with hyphens", () => {
    expect(isValidItemNumber("ABC-123")).toBe(true);
    expect(isValidItemNumber("12345")).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidItemNumber("  A1  ")).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(isValidItemNumber("")).toBe(false);
    expect(isValidItemNumber("   ")).toBe(false);
  });

  it("rejects values longer than 20 characters", () => {
    expect(isValidItemNumber("a".repeat(20))).toBe(true);
    expect(isValidItemNumber("a".repeat(21))).toBe(false);
  });

  it("rejects special characters that could form injection payloads", () => {
    expect(isValidItemNumber("ABC<script>")).toBe(false);
    expect(isValidItemNumber("12 34")).toBe(false);
    expect(isValidItemNumber("DROP;TABLE")).toBe(false);
  });
});

describe("isValidPrice", () => {
  it("accepts positive amounts with up to two decimals", () => {
    expect(isValidPrice(12.99)).toBe(true);
    expect(isValidPrice(5)).toBe(true);
    expect(isValidPrice(0.5)).toBe(true);
  });

  it("rejects zero and negative amounts", () => {
    expect(isValidPrice(0)).toBe(false);
    expect(isValidPrice(-1)).toBe(false);
  });

  it("rejects non-finite values", () => {
    expect(isValidPrice(Infinity)).toBe(false);
    expect(isValidPrice(NaN)).toBe(false);
  });

  it("rejects amounts with more than two decimal places", () => {
    expect(isValidPrice(1.999)).toBe(false);
  });
});

describe("isValidQuantity", () => {
  it("accepts integers within the allowed range", () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(MAX_PRINT_QUANTITY)).toBe(true);
  });

  it("rejects values outside the range", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(MAX_PRINT_QUANTITY + 1)).toBe(false);
  });

  it("rejects non-integer values", () => {
    expect(isValidQuantity(1.5)).toBe(false);
    expect(isValidQuantity(NaN)).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("returns true for strings with non-whitespace content", () => {
    expect(isNonEmptyString("hello")).toBe(true);
    expect(isNonEmptyString("  x  ")).toBe(true);
  });

  it("returns false for blank or whitespace-only strings", () => {
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString("   ")).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    expect(isNonEmptyString(undefined as unknown as string)).toBe(false);
    expect(isNonEmptyString(null as unknown as string)).toBe(false);
    expect(isNonEmptyString(123 as unknown as string)).toBe(false);
  });
});

describe("isValidDepartment", () => {
  const valid = ["PRODUCE", "BAKERY", "DELI"];

  it("returns true when the department is in the allowed list", () => {
    expect(isValidDepartment("BAKERY", valid)).toBe(true);
  });

  it("returns false when the department is not in the allowed list", () => {
    expect(isValidDepartment("UNKNOWN", valid)).toBe(false);
    expect(isValidDepartment("", valid)).toBe(false);
  });
});

describe("isValidDateString", () => {
  it("accepts parseable ISO date strings", () => {
    expect(isValidDateString("2026-06-19")).toBe(true);
    expect(isValidDateString("2026-06-19T10:30:00Z")).toBe(true);
  });

  it("rejects empty and unparseable strings", () => {
    expect(isValidDateString("")).toBe(false);
    expect(isValidDateString("not-a-date")).toBe(false);
  });
});

describe("sanitiseSearchTerm", () => {
  it("strips injection-prone characters", () => {
    expect(sanitiseSearchTerm('a<b>"c\';&|`$\\d')).toBe("abcd");
  });

  it("trims whitespace", () => {
    expect(sanitiseSearchTerm("  query  ")).toBe("query");
  });

  it("caps the result at 100 characters", () => {
    const long = "x".repeat(150);
    expect(sanitiseSearchTerm(long)).toHaveLength(100);
  });

  it("leaves a clean term unchanged", () => {
    expect(sanitiseSearchTerm("organic apples")).toBe("organic apples");
  });
});
