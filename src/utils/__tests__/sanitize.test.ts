import { sanitize, sanitizeString } from "@/utils/sanitize";

describe("sanitize utility (OWASP A03)", () => {
  describe("sanitizeString", () => {
    it("passes clean strings through unchanged", () => {
      // Arrange
      const input = "Hello World";

      // Act
      const result = sanitizeString(input);

      // Assert
      expect(result).toBe("Hello World");
    });

    it("strips script tags from strings", () => {
      // Arrange
      const malicious = '<script>alert("xss")</script>Hello';

      // Act
      const result = sanitizeString(malicious);

      // Assert
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("strips onerror attributes", () => {
      // Arrange
      const malicious = '<img src="x" onerror="alert(1)">';

      // Act
      const result = sanitizeString(malicious);

      // Assert
      expect(result).not.toContain("onerror");
    });
  });

  describe("sanitize (recursive)", () => {
    it("sanitizes nested objects", () => {
      // Arrange
      const input = {
        name: "John",
        bio: '<script>alert("xss")</script>Developer',
        nested: {
          note: '<img onerror="hack()" src="x">',
        },
      };

      // Act
      const result = sanitize(input);

      // Assert
      expect(result.bio).not.toContain("<script>");
      expect(result.nested.note).not.toContain("onerror");
    });

    it("sanitizes arrays of strings", () => {
      // Arrange
      const input = ["safe", '<script>bad()</script>'];

      // Act
      const result = sanitize(input);

      // Assert
      expect(result[0]).toBe("safe");
      expect(result[1]).not.toContain("<script>");
    });

    it("passes non-string primitives through", () => {
      // Arrange — primitive values that should be returned unchanged

      // Act & Assert
      expect(sanitize(42)).toBe(42);
      expect(sanitize(true)).toBe(true);
      expect(sanitize(null)).toBe(null);
    });
  });
});
