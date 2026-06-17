import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { createSnapshot } from '@/utils/calculate';

export const useSnapshot = () => {
  const snapshots = useStore((s) => s.snapshots);
  const assets = useStore((s) => s.assets);
  const liabilities = useStore((s) => s.liabilities);
  const addSnapshot = useStore((s) => s.addSnapshot);
  const checkAndCreateMonthlySnapshot = useStore((s) => s.checkAndCreateMonthlySnapshot);
  const autoSnapshot = useStore((s) => s.settings.autoSnapshot);

  useEffect(() => {
    if (autoSnapshot) {
      checkAndCreateMonthlySnapshot();
    }
  }, [autoSnapshot, checkAndCreateMonthlySnapshot]);

  const getTrendData = (months: number = 6) => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    const result = sorted.slice(-months);

    if (result.length < 2 && (assets.length > 0 || liabilities.length > 0)) {
      const current = createSnapshot(assets, liabilities);
      if (result.length === 0 || result[result.length - 1].date !== current.date) {
        result.push(current);
      }
    }

    return result;
  };

  const manualSnapshot = () => {
    addSnapshot();
  };

  return {
    snapshots,
    getTrendData,
    manualSnapshot,
  };
};
