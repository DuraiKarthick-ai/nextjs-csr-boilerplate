import { renderHook, act } from "@testing-library/react";
import { useTableScroll } from "@/hooks/useTableScroll";

/**
 * Creates a mock div whose scroll properties can be controlled.
 * jsdom does not implement layout, so scrollTop/clientHeight/scrollHeight
 * must be set via Object.defineProperty.
 */
function makeScrollDiv({
  scrollTop = 0,
  clientHeight = 100,
  scrollHeight = 1000,
}: {
  scrollTop?: number;
  clientHeight?: number;
  scrollHeight?: number;
} = {}): HTMLDivElement {
  const div = document.createElement("div");
  Object.defineProperty(div, "scrollTop", { value: scrollTop, configurable: true });
  Object.defineProperty(div, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(div, "scrollHeight", { value: scrollHeight, configurable: true });
  return div;
}

describe("useTableScroll", () => {
  /**
   * Verifies the initial visible row count equals the PAGE_SIZE constant (5).
   */
  it("initialises visibleCount to 5", () => {
    // Arrange & Act
    const { result } = renderHook(() => useTableScroll(20));

    // Assert
    expect(result.current.visibleCount).toBe(5);
  });

  /**
   * Verifies that scrolling near the bottom (within 40px) increments
   * visibleCount by the page size (5).
   */
  it("increments visibleCount by 5 when scrolled near bottom", () => {
    // Arrange
    const { result } = renderHook(() => useTableScroll(20));
    // scrollTop(200) + clientHeight(100) = 300 >= scrollHeight(260) - 40 = 220 → near bottom
    const div = makeScrollDiv({ scrollTop: 200, clientHeight: 100, scrollHeight: 260 });
    act(() => { result.current.scrollRef(div); });

    // Act
    act(() => { div.dispatchEvent(new Event("scroll")); });

    // Assert
    expect(result.current.visibleCount).toBe(10);
  });

  /**
   * Verifies that visibleCount is capped at total, preventing out-of-bounds rendering.
   */
  it("caps visibleCount at total", () => {
    // Arrange
    const { result } = renderHook(() => useTableScroll(7));
    const div = makeScrollDiv({ scrollTop: 200, clientHeight: 100, scrollHeight: 260 });
    act(() => { result.current.scrollRef(div); });

    // Act
    act(() => { div.dispatchEvent(new Event("scroll")); });

    // Assert
    expect(result.current.visibleCount).toBe(7);
  });

  /**
   * Verifies that scrolling far from the bottom does NOT change visibleCount.
   */
  it("does not increment when not near bottom", () => {
    // Arrange
    const { result } = renderHook(() => useTableScroll(20));
    // scrollTop(0) + clientHeight(100) = 100, scrollHeight(900) - 40 = 860 → not near bottom
    const div = makeScrollDiv({ scrollTop: 0, clientHeight: 100, scrollHeight: 900 });
    act(() => { result.current.scrollRef(div); });

    // Act
    act(() => { div.dispatchEvent(new Event("scroll")); });

    // Assert
    expect(result.current.visibleCount).toBe(5);
  });

  /**
   * Verifies that the scroll event listener is removed when the scrollRef
   * is detached (node set to null), preventing memory leaks.
   */
  it("removes scroll listener when scrollRef is detached", () => {
    // Arrange
    const { result } = renderHook(() => useTableScroll(20));
    const div = makeScrollDiv();
    const removeSpy = jest.spyOn(div, "removeEventListener");
    act(() => { result.current.scrollRef(div); });

    // Act
    act(() => { result.current.scrollRef(null); });

    // Assert
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  /**
   * Verifies multiple scroll events continue to increment until the cap is reached.
   */
  it("increments on each scroll event until total is reached", () => {
    // Arrange
    const { result } = renderHook(() => useTableScroll(12));
    const div = makeScrollDiv({ scrollTop: 200, clientHeight: 100, scrollHeight: 260 });
    act(() => { result.current.scrollRef(div); });

    // Act
    act(() => { div.dispatchEvent(new Event("scroll")); }); // 5 → 10
    act(() => { div.dispatchEvent(new Event("scroll")); }); // 10 → 12 (capped)

    // Assert
    expect(result.current.visibleCount).toBe(12);
  });
});
