/**
 * Unit tests for pdfFromImage.
 * Image and canvas are stubbed (jsdom has no real canvas) so the PNG→JPEG→PDF
 * pipeline can run. Covers single/multi-page conversion, the empty guard, and
 * the blob download helper.
 */

import {
  multipleBase64PngsToPdfBlob,
  base64PngToPdfBlob,
  downloadBlob,
} from "./pdfFromImage";

class FakeImage {
  onload: () => void = () => undefined;
  onerror: () => void = () => undefined;
  naturalWidth = 100;
  naturalHeight = 200;
  set src(_value: string) {
    // Fire load asynchronously, mirroring a real <img>.
    setTimeout(() => this.onload(), 0);
  }
}

describe("pdfFromImage", () => {
  beforeAll(() => {
    // jsdom does not expose TextEncoder on the global scope; polyfill from Node.
    if (typeof (global as unknown as { TextEncoder?: unknown }).TextEncoder === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      (global as unknown as { TextEncoder: unknown }).TextEncoder = (require("util") as typeof import("util")).TextEncoder;
    }
    (global as unknown as { Image: typeof FakeImage }).Image = FakeImage;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage: jest.fn() })) as never;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(
      () => `data:image/jpeg;base64,${btoa("jpegbytes")}`
    );
  });

  it("rejects when given no images", async () => {
    await expect(multipleBase64PngsToPdfBlob([])).rejects.toThrow(/No images/);
  });

  it("builds a single-page PDF blob from one PNG", async () => {
    const blob = await base64PngToPdfBlob(btoa("png"));
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });

  it("builds a multi-page PDF blob from several PNGs", async () => {
    const blob = await multipleBase64PngsToPdfBlob([btoa("a"), btoa("b")]);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });

  describe("downloadBlob", () => {
    it("creates an object URL, clicks an anchor, and revokes the URL", () => {
      jest.useFakeTimers();
      const createObjectURL = jest.fn(() => "blob:fake");
      const revokeObjectURL = jest.fn();
      (URL as unknown as { createObjectURL: unknown }).createObjectURL = createObjectURL;
      (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revokeObjectURL;
      const clickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => undefined);

      downloadBlob(new Blob(["x"]), "file.pdf");

      expect(createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();

      jest.advanceTimersByTime(5000);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");

      clickSpy.mockRestore();
      jest.useRealTimers();
    });
  });
});
