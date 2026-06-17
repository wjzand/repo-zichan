import { create } from 'zustand';
import { AppState, Asset, Liability, Repayment, Settings, Snapshot } from '@/types';
import { loadFromStorage, saveToStorage, clearStorage, importFromJson } from '@/utils/storage';
import { generateAssetId, generateLiabilityId } from '@/utils/id';
import { createSnapshot } from '@/utils/calculate';

interface StoreState extends AppState {
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<Liability, 'id' | 'repayments'>) => void;
  updateLiability: (id: string, updates: Partial<Liability>) => void;
  deleteLiability: (id: string) => void;
  addRepayment: (liabilityId: string, repayment: Repayment) => void;
  addSnapshot: (snapshot?: Snapshot) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
  checkAndCreateMonthlySnapshot: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  const initialState = loadFromStorage();

  const persist = (state: Partial<StoreState>) => {
    const fullState = { ...get(), ...state };
    saveToStorage({
      assets: fullState.assets,
      liabilities: fullState.liabilities,
      snapshots: fullState.snapshots,
      settings: fullState.settings,
    });
  };

  return {
    ...initialState,

    addAsset: (assetData) => {
      const now = new Date().toISOString();
      const newAsset: Asset = {
        ...assetData,
        id: generateAssetId(),
        createdAt: now,
        updatedAt: now,
        history: [{ value: assetData.currentValue, date: now.slice(0, 10) }],
      };
      set((state) => {
        const newState = { assets: [...state.assets, newAsset] };
        persist(newState);
        return newState;
      });
    },

    updateAsset: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        const assets = state.assets.map((a) => {
          if (a.id !== id) return a;
          const updated = { ...a, ...updates, updatedAt: now };
          if (
            updates.currentValue !== undefined &&
            updates.currentValue !== a.currentValue
          ) {
            updated.history = [
              ...a.history,
              { value: updates.currentValue, date: now.slice(0, 10) },
            ];
          }
          return updated;
        });
        const newState = { assets };
        persist(newState);
        return newState;
      });
    },

    deleteAsset: (id) => {
      set((state) => {
        const newState = { assets: state.assets.filter((a) => a.id !== id) };
        persist(newState);
        return newState;
      });
    },

    addLiability: (liabilityData) => {
      const newLiability: Liability = {
        ...liabilityData,
        id: generateLiabilityId(),
        repayments: [],
      };
      set((state) => {
        const newState = { liabilities: [...state.liabilities, newLiability] };
        persist(newState);
        return newState;
      });
    },

    updateLiability: (id, updates) => {
      set((state) => {
        const liabilities = state.liabilities.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        );
        const newState = { liabilities };
        persist(newState);
        return newState;
      });
    },

    deleteLiability: (id) => {
      set((state) => {
        const newState = {
          liabilities: state.liabilities.filter((l) => l.id !== id),
        };
        persist(newState);
        return newState;
      });
    },

    addRepayment: (liabilityId, repayment) => {
      set((state) => {
        const liabilities = state.liabilities.map((l) => {
          if (l.id !== liabilityId) return l;
          return {
            ...l,
            remainingBalance: Math.max(0, l.remainingBalance - repayment.amount),
            repayments: [...l.repayments, repayment],
          };
        });
        const newState = { liabilities };
        persist(newState);
        return newState;
      });
    },

    addSnapshot: (snapshot) => {
      const { assets, liabilities } = get();
      const snap = snapshot || createSnapshot(assets, liabilities);
      set((state) => {
        const existingIdx = state.snapshots.findIndex((s) => s.date === snap.date);
        let snapshots;
        if (existingIdx >= 0) {
          snapshots = [...state.snapshots];
          snapshots[existingIdx] = snap;
        } else {
          snapshots = [...state.snapshots, snap];
        }
        snapshots.sort((a, b) => a.date.localeCompare(b.date));
        const newState = { snapshots };
        persist(newState);
        return newState;
      });
    },

    updateSettings: (updates) => {
      set((state) => {
        const newState = {
          settings: { ...state.settings, ...updates },
        };
        persist(newState);
        return newState;
      });
    },

    importData: (jsonStr) => {
      const imported = importFromJson(jsonStr);
      if (!imported) return false;
      set(() => {
        persist(imported);
        return imported;
      });
      return true;
    },

    clearAllData: () => {
      clearStorage();
      const fresh = loadFromStorage();
      set(fresh);
    },

    checkAndCreateMonthlySnapshot: () => {
      const state = get();
      if (!state.settings.autoSnapshot) return;

      const today = new Date();
      const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const exists = state.snapshots.some((s) => s.date === monthStart);

      if (!exists) {
        get().addSnapshot(createSnapshot(state.assets, state.liabilities, monthStart));
      }
    },
  };
});
