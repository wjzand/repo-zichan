import { AppState, Settings } from '@/types';

const STORAGE_KEY = 'asset_liability_manager_data';
const MAX_SIZE = 4 * 1024 * 1024;

const DEFAULT_SETTINGS: Settings = {
  currency: 'CNY',
  firstDayOfMonth: 1,
  autoSnapshot: true,
  remindBeforeDays: 3,
};

const DEFAULT_STATE: AppState = {
  assets: [],
  liabilities: [],
  snapshots: [],
  settings: DEFAULT_SETTINGS,
};

export const loadFromStorage = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(data) as AppState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const saveToStorage = (state: AppState): boolean => {
  try {
    const data = JSON.stringify(state);
    if (data.length > MAX_SIZE) {
      console.warn('Storage size exceeds limit, some data may be lost');
      return false;
    }
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch (e) {
    console.error('Failed to save to storage:', e);
    return false;
  }
};

export const getStorageSize = (): number => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  } catch {
    return 0;
  }
};

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportToJson = (state: AppState): string => {
  return JSON.stringify(state, null, 2);
};

export const importFromJson = (jsonStr: string): AppState | null => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (
      'assets' in parsed &&
      'liabilities' in parsed &&
      'snapshots' in parsed &&
      'settings' in parsed
    ) {
      return parsed as AppState;
    }
    return null;
  } catch {
    return null;
  }
};

export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
