import { describe, it, expect } from 'vitest';
import { parseISODate } from './date';

describe('parseISODate', () => {
  it('parses valid ISO 8601 date string', () => {
    const result = parseISODate('2024-03-15T10:30:00.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('2024-03-15T10:30:00.000Z');
  });

  it('parses date-only string', () => {
    const result = parseISODate('2024-03-15');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(15);
  });

  it('returns null for null input', () => {
    expect(parseISODate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(parseISODate(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseISODate('')).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(parseISODate('not-a-date')).toBeNull();
    expect(parseISODate('2024-13-45')).toBeNull();
  });

  it('trims whitespace before parsing', () => {
    const result = parseISODate('  2024-03-15  ');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });
});
