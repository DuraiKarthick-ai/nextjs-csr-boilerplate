import { useCallback, useRef, useState } from "react";

const PAGE_SIZE = 5;

/**
 * Manages incremental rendering of a scrollable table container.
 *
 * Starts with `PAGE_SIZE` visible rows and increases the count by `PAGE_SIZE`
 * each time the user scrolls near the bottom of the container.
 *
 * @param {number} total - Total number of rows available in the dataset.
 * @returns {{ visibleCount: number, scrollRef: React.RefCallback<HTMLDivElement> }}
 *   - `visibleCount`: number of rows to render.
 *   - `scrollRef`: ref callback to attach to the scrollable container element.
 */
export function useTableScroll(total: number): {
  visibleCount: number;
  scrollRef: React.RefCallback<HTMLDivElement>;
} {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, total));
    }
  }, [total]);

  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
      containerRef.current = node;
      if (node) {
        node.addEventListener("scroll", handleScroll);
      }
    },
    [handleScroll],
  );

  return { visibleCount, scrollRef };
}
