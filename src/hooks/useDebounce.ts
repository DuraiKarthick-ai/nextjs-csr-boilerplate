/**
 * useDebounce hook — delays updating the returned value until the
 * specified delay has elapsed without a new value being supplied.
 *
 * Typical use case: debouncing search input to avoid firing an API
 * request on every keystroke.
 *
 * @template T - The type of the value being debounced.
 * @param {T} value - The value to debounce.
 * @param {number} delayMs - Delay in milliseconds before updating.
 * @returns {T} The debounced value.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);
 */

import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default useDebounce;
