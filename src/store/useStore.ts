import { create } from 'zustand';
import { AppState, Asset, Liability, Repayment, Settings, Snapshot, LifePath, LifeEvent, SimulationParams, Milestone, LifeSandboxState } from '@/types';
import { loadFromStorage, saveToStorage, clearStorage, importFromJson, PersistedState, loadSandboxFromStorage } from '@/utils/storage';
import { generateAssetId, generateLiabilityId, generateEventId, generatePathId, generateId } from '@/utils/id';
import { createSnapshot, calculateTotalAssets, calculateTotalLiabilities } from '@/utils/calculate';
import { DEFAULT_PARAMS, LIFE_PATH_COLORS, DEFAULT_EVENTS_BASE } from '@/constants/lifeSandbox';
import { runSimulation, detectMilestones, calculateFinancialFreedom } from '@/utils/simulation';

interface StoreState extends AppState {
  sandbox: LifeSandboxState;

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

  addLifePath: (name: string, color?: string, cloneFromId?: string) => LifePath;
  updateLifePath: (id: string, updates: Partial<Omit<LifePath, 'simulation'>>) => void;
  deleteLifePath: (id: string) => void;
  setActivePath: (id: string) => void;
  addLifeEvent: (pathId: string, event: Omit<LifeEvent, 'id'>) => void;
  updateLifeEvent: (pathId: string, eventId: string, updates: Partial<LifeEvent>) => void;
  deleteLifeEvent: (pathId: string, eventId: string) => void;
  updateGlobalParams: (updates: Partial<SimulationParams>) => void;
  runAllSimulations: () => void;
  simulatePath: (pathId: string) => void;
  refreshMilestones: () => void;
  updateUserProfile: (updates: Partial<LifeSandboxState['userProfile']>) => void;
}

const createDefaultPaths = (params: SimulationParams): LifePath[] => {
  const now = new Date().toISOString();
  const defaultEvents: LifeEvent[] = DEFAULT_EVENTS_BASE.map((e) => ({
    ...e,
    id: generateEventId(),
  }));

  const baseline: LifePath = {
    id: generatePathId(),
    name: '基准人生',
    description: '默认人生路径，包含常见人生节点',
    color: LIFE_PATH_COLORS[0],
    isDefault: true,
    events: defaultEvents,
    params: {},
    simulation: [],
    createdAt: now,
    updatedAt: now,
  };

  return [baseline];
};

const initSandboxState = (): LifeSandboxState => {
  const saved = loadSandboxFromStorage();
  const params = { ...DEFAULT_PARAMS, ...saved?.globalParams };

  let paths: LifePath[];
  if (saved?.paths && saved.paths.length > 0) {
    paths = saved.paths;
  } else {
    paths = createDefaultPaths(params);
  }

  const activePathId = saved?.activePathId || paths[0]?.id;
  const milestones = saved?.milestones || [];
  const userProfile = saved?.userProfile || { currentAge: params.currentAge };

  return {
    paths,
    activePathId,
    globalParams: params,
    milestones,
    userProfile,
  };
};

export const useStore = create<StoreState>((set, get) => {
  const initialState = loadFromStorage();
  const sandbox = initSandboxState();

  const persist = (state: Partial<StoreState>) => {
    const fullState = { ...get(), ...state };
    const toPersist: PersistedState = {
      assets: fullState.assets,
      liabilities: fullState.liabilities,
      snapshots: fullState.snapshots,
      settings: fullState.settings,
      sandbox: {
        paths: fullState.sandbox.paths,
        activePathId: fullState.sandbox.activePathId,
        milestones: fullState.sandbox.milestones,
        globalParams: fullState.sandbox.globalParams,
        userProfile: fullState.sandbox.userProfile,
      },
    };
    saveToStorage(toPersist);
  };

  const getSimConfig = () => {
    const { assets, liabilities, sandbox } = get();
    const totalAssets = calculateTotalAssets(assets);
    const totalLiabilities = calculateTotalLiabilities(liabilities);
    const netWorth = totalAssets - totalLiabilities;
    const monthlyIncome = sandbox.userProfile.monthlyIncome || 15000;
    const monthlyExpense = sandbox.userProfile.monthlyExpense || 8000;
    return {
      currentNetWorth: netWorth,
      currentTotalAssets: totalAssets,
      currentTotalLiabilities: totalLiabilities,
      currentAnnualIncome: monthlyIncome * 12,
      currentAnnualExpense: monthlyExpense * 12,
      currentMonthlySavings: monthlyIncome - monthlyExpense,
    };
  };

  const getEffectiveParams = (path: LifePath): SimulationParams => {
    const state = get();
    return { ...state.sandbox.globalParams, ...path.params };
  };

  return {
    ...initialState,
    sandbox,

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
        return {
          assets: imported.assets,
          liabilities: imported.liabilities,
          snapshots: imported.snapshots,
          settings: imported.settings,
          sandbox: imported.sandbox ? initSandboxState() : sandbox,
        } as StoreState;
      });
      return true;
    },

    clearAllData: () => {
      clearStorage();
      const fresh = loadFromStorage();
      set({ ...fresh, sandbox: initSandboxState() });
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

    addLifePath: (name, color, cloneFromId) => {
      const state = get();
      const now = new Date().toISOString();
      const newColor = color || LIFE_PATH_COLORS[state.sandbox.paths.length % LIFE_PATH_COLORS.length];

      let events: LifeEvent[] = [];
      let params: Partial<SimulationParams> = {};
      if (cloneFromId) {
        const source = state.sandbox.paths.find((p) => p.id === cloneFromId);
        if (source) {
          events = source.events.map((e) => ({ ...e, id: generateEventId() }));
          params = { ...source.params };
        }
      }

      const newPath: LifePath = {
        id: generatePathId(),
        name,
        color: newColor,
        events,
        params,
        simulation: [],
        createdAt: now,
        updatedAt: now,
      };

      set((s) => {
        const sandbox = {
          ...s.sandbox,
          paths: [...s.sandbox.paths, newPath],
          activePathId: newPath.id,
        };
        persist({ sandbox });
        return { sandbox };
      });

      return newPath;
    },

    updateLifePath: (id, updates) => {
      const now = new Date().toISOString();
      set((s) => {
        const paths = s.sandbox.paths.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: now } : p
        );
        const sandbox = { ...s.sandbox, paths };
        persist({ sandbox });
        return { sandbox };
      });
    },

    deleteLifePath: (id) => {
      set((s) => {
        if (s.sandbox.paths.length <= 1) return s;
        const remaining = s.sandbox.paths.filter((p) => p.id !== id);
        const activePathId = s.sandbox.activePathId === id ? remaining[0].id : s.sandbox.activePathId;
        const sandbox = { ...s.sandbox, paths: remaining, activePathId };
        persist({ sandbox });
        return { sandbox };
      });
    },

    setActivePath: (id) => {
      set((s) => {
        const sandbox = { ...s.sandbox, activePathId: id };
        persist({ sandbox });
        return { sandbox };
      });
    },

    addLifeEvent: (pathId, event) => {
      const newEvent: LifeEvent = { ...event, id: generateEventId() };
      set((s) => {
        const paths = s.sandbox.paths.map((p) => {
          if (p.id !== pathId) return p;
          const events = [...p.events, newEvent].sort((a, b) => a.age - b.age);
          return { ...p, events, updatedAt: new Date().toISOString() };
        });
        const sandbox = { ...s.sandbox, paths };
        persist({ sandbox });
        return { sandbox };
      });
    },

    updateLifeEvent: (pathId, eventId, updates) => {
      set((s) => {
        const paths = s.sandbox.paths.map((p) => {
          if (p.id !== pathId) return p;
          const events = p.events
            .map((e) => (e.id === eventId ? { ...e, ...updates } : e))
            .sort((a, b) => a.age - b.age);
          return { ...p, events, updatedAt: new Date().toISOString() };
        });
        const sandbox = { ...s.sandbox, paths };
        persist({ sandbox });
        return { sandbox };
      });
    },

    deleteLifeEvent: (pathId, eventId) => {
      set((s) => {
        const paths = s.sandbox.paths.map((p) => {
          if (p.id !== pathId) return p;
          const events = p.events.filter((e) => e.id !== eventId);
          return { ...p, events, updatedAt: new Date().toISOString() };
        });
        const sandbox = { ...s.sandbox, paths };
        persist({ sandbox });
        return { sandbox };
      });
    },

    updateGlobalParams: (updates) => {
      set((s) => {
        const sandbox = {
          ...s.sandbox,
          globalParams: { ...s.sandbox.globalParams, ...updates },
        };
        persist({ sandbox });
        return { sandbox };
      });
    },

    simulatePath: (pathId) => {
      const state = get();
      const path = state.sandbox.paths.find((p) => p.id === pathId);
      if (!path) return;

      const params = getEffectiveParams(path);
      const config = getSimConfig();
      const sim = runSimulation(path.events, params, config);

      set((s) => {
        const paths = s.sandbox.paths.map((p) =>
          p.id === pathId ? { ...p, simulation: sim } : p
        );
        const sandbox = { ...s.sandbox, paths };
        persist({ sandbox });
        return { sandbox };
      });
    },

    runAllSimulations: () => {
      const state = get();
      const config = getSimConfig();
      const paths = state.sandbox.paths.map((p) => {
        const params = getEffectiveParams(p);
        const sim = runSimulation(p.events, params, config);
        return { ...p, simulation: sim };
      });

      set((s) => {
        const activePath = paths.find((p) => p.id === s.sandbox.activePathId);
        const milestones = activePath?.simulation?.length
          ? detectMilestones(activePath.simulation, s.sandbox.milestones)
          : s.sandbox.milestones;

        const sandbox = { ...s.sandbox, paths, milestones };
        persist({ sandbox });
        return { sandbox };
      });
    },

    refreshMilestones: () => {
      const state = get();
      const activePath = state.sandbox.paths.find((p) => p.id === state.sandbox.activePathId);
      if (!activePath || activePath.simulation.length === 0) {
        get().simulatePath(state.sandbox.activePathId);
      }
      const path = get().sandbox.paths.find((p) => p.id === get().sandbox.activePathId);
      if (path?.simulation?.length) {
        const milestones = detectMilestones(path.simulation, get().sandbox.milestones);
        set((s) => {
          const sandbox = { ...s.sandbox, milestones };
          persist({ sandbox });
          return { sandbox };
        });
      }
    },

    updateUserProfile: (updates) => {
      set((s) => {
        const sandbox = {
          ...s.sandbox,
          userProfile: { ...s.sandbox.userProfile, ...updates },
        };
        if (updates.currentAge) {
          sandbox.globalParams = { ...sandbox.globalParams, currentAge: updates.currentAge };
        }
        persist({ sandbox });
        return { sandbox };
      });
    },
  };
});
