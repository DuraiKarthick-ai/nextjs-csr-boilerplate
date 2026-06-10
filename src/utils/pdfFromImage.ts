/**
 * pdfFromImage — pure browser utility.
 *
 * Converts a base64-encoded PNG into a downloadable PDF Blob without any
 * external library.  The approach:
 *   1. Render the PNG onto a canvas element.
 *   2. Re-encode as JPEG (canvas.toDataURL) — JPEG uses DCT compression,
 *      which maps directly to PDF's /Filter /DCTDecode filter.
 *   3. Embed the raw JPEG bytes inside a minimal single-page PDF structure.
 *   4. Return as a Blob (application/pdf).
 */

/** A4 page dimensions in PDF points (72 dpi). */
const PAGE_W = 595.28;
const PAGE_H = 841.89;

/**
 * Loads a base64 PNG into an Image element and draws it onto a canvas,
 * then returns the result encoded as a JPEG Uint8Array.
 */
async function pngToJpeg(
  base64Png: string
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const raw = atob(dataUrl.split(",")[1] ?? "");
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

      resolve({ bytes, width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => reject(new Error("Failed to load preview image"));
    img.src = `data:image/png;base64,${base64Png}`;
  });
}

/**
 * Builds a multi-page PDF (one A4 page per image) from an array of JPEG images.
 * Each image is centred and scaled to fit the page while preserving aspect ratio.
 *
 * PDF object layout per page i (0-indexed):
 *   (3 + i*3)  Page dictionary
 *   (4 + i*3)  Content stream
 *   (5 + i*3)  Image XObject (raw JPEG / DCTDecode)
 */
function buildMultiPagePdf(
  images: Array<{ bytes: Uint8Array; width: number; height: number }>
): Blob {
  const enc = new TextEncoder();
  const e = (s: string) => enc.encode(s);
  const N = images.length;

  const parts: Array<Uint8Array | string> = [];
  const offsets: number[] = [];
  let cursor = 0;

  const add = (s: string | Uint8Array) => {
    parts.push(s);
    cursor += typeof s === "string" ? e(s).length : s.length;
  };

  add(`%PDF-1.4\n`);

  offsets[1] = cursor;
  add(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  const kidRefs = Array.from({ length: N }, (_, i) => `${3 + i * 3} 0 R`).join(" ");
  offsets[2] = cursor;
  add(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs}] /Count ${N} >>\nendobj\n`);

  for (let i = 0; i < N; i++) {
    const { bytes: jpeg, width: imgW, height: imgH } = images[i]!;
    const scale = Math.min(PAGE_W / imgW, PAGE_H / imgH);
    const fw = (imgW * scale).toFixed(2);
    const fh = (imgH * scale).toFixed(2);
    const fx = ((PAGE_W - imgW * scale) / 2).toFixed(2);
    const fy = ((PAGE_H - imgH * scale) / 2).toFixed(2);

    const imgName  = `Im${i + 1}`;
    const pageNum  = 3 + i * 3;
    const contNum  = 4 + i * 3;
    const imgNum   = 5 + i * 3;

    const cs = `q ${fw} 0 0 ${fh} ${fx} ${fy} cm /${imgName} Do Q`;

    offsets[pageNum] = cursor;
    add(
      `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contNum} 0 R ` +
      `/Resources << /XObject << /${imgName} ${imgNum} 0 R >> >> >>\nendobj\n`
    );

    offsets[contNum] = cursor;
    add(`${contNum} 0 obj\n<< /Length ${cs.length} >>\nstream\n${cs}\nendstream\nendobj\n`);

    offsets[imgNum] = cursor;
    add(
      `${imgNum} 0 obj\n<< /Type /XObject /Subtype /Image ` +
      `/Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB ` +
      `/BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
    );
    add(jpeg);
    add(`\nendstream\nendobj\n`);
  }

  const xrefStart = cursor;
  const totalObjs = 2 + N * 3;
  const pad = (n: number) => String(n).padStart(10, "0");

  let xref = `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjs; i++) xref += `${pad(offsets[i]!)} 00000 n \n`;
  xref += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  add(xref);

  const buffers = parts.map((p) => (typeof p === "string" ? e(p) : p));
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const buf of buffers) { result.set(buf, pos); pos += buf.length; }

  return new Blob([result], { type: "application/pdf" });
}

/**
 * Converts an array of base64-encoded PNG strings into a single multi-page PDF Blob.
 * Each PNG becomes one A4 page in the output.
 */
export async function multipleBase64PngsToPdfBlob(base64Images: string[]): Promise<Blob> {
  if (base64Images.length === 0) throw new Error("No images to convert to PDF");
  const jpegs = await Promise.all(base64Images.map((b64) => pngToJpeg(b64)));
  return buildMultiPagePdf(jpegs);
}

/**
 * Converts a single base64-encoded PNG string to a single-page PDF Blob.
 */
export async function base64PngToPdfBlob(base64Png: string): Promise<Blob> {
  const { bytes, width, height } = await pngToJpeg(base64Png);
  return buildMultiPagePdf([{ bytes, width, height }]);
}

/**
 * Triggers a browser file download for the given Blob.
 *
 * @param blob - The file data.
 * @param filename - The suggested filename shown in the browser's save dialog.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Revoke after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}
