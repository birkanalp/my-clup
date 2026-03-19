/**
 * Unit tests for localeStorage — AsyncStorage read/write for locale preference.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredLocale, setStoredLocale } from './localeStorage';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('localeStorage', () => {
  beforeEach(() => {
    vi.mocked(AsyncStorage.getItem).mockClear();
    vi.mocked(AsyncStorage.setItem).mockClear();
  });

  it('getStoredLocale returns undefined when empty', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    const result = await getStoredLocale();
    expect(result).toBeUndefined();
  });

  it('getStoredLocale returns undefined when getItem throws', async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error('storage error'));
    const result = await getStoredLocale();
    expect(result).toBeUndefined();
  });

  it('write then read returns stored value', async () => {
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
    vi.mocked(AsyncStorage.getItem).mockResolvedValue('tr');
    await setStoredLocale('tr');
    const result = await getStoredLocale();
    expect(result).toBe('tr');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@myclup/locale', 'tr');
  });

  it('setStoredLocale ignores persistence errors', async () => {
    vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('write failed'));
    await expect(setStoredLocale('en')).resolves.toBeUndefined();
  });
});
