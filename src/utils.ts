/**
 * Generates an array from a range of numbers.
 */
export function rangeArray(first: number, last: number, step = 1): Array<number> {
  return Array.from({ length: (last - first) / step + 1 }, (_, i) => first + i * step);
}
