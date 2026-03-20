import { describe, expect, it, vi, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStoredLeads, persistLeads } from './leadStorage';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('leadStorage', () => {
  beforeEach(() => {
    vi.mocked(AsyncStorage.getItem).mockReset();
    vi.mocked(AsyncStorage.setItem).mockReset();
  });

  it('returns empty list when storage empty', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    await expect(loadStoredLeads()).resolves.toEqual([]);
  });

  it('loads valid lead rows', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify([{ id: '1', name: 'Ada', source: 'walk-in' }])
    );
    await expect(loadStoredLeads()).resolves.toEqual([{ id: '1', name: 'Ada', source: 'walk-in' }]);
  });

  it('persists leads as JSON', async () => {
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
    await persistLeads([{ id: 'x', name: 'y', source: 'z' }]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@myclup/staff_leads_v1',
      JSON.stringify([{ id: 'x', name: 'y', source: 'z' }])
    );
  });
});
