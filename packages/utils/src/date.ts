/**
 * Domain-safe date parsing and validation.
 */

/**
 * Parse an ISO 8601 date string into a Date object.
 * Returns null if the input is invalid or not a valid ISO date.
 */
export function parseISODate(value: string | null | undefined): Date | null {
  if (value == null || typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const trimmed = value.trim();
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed);
}
