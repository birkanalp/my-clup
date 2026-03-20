import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@myclup/staff_leads_v1';

export type StoredLead = { id: string; name: string; source: string };

function isLeadArray(value: unknown): value is StoredLead[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof (row as StoredLead).id === 'string' &&
      typeof (row as StoredLead).name === 'string' &&
      typeof (row as StoredLead).source === 'string'
  );
}

export async function loadStoredLeads(): Promise<StoredLead[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return isLeadArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function persistLeads(leads: StoredLead[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}
