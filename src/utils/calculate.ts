import { Asset, Liability, Snapshot } from '@/types';

export const calculateTotalAssets = (assets: Asset[]): number => {
  return assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
};

export const calculateTotalLiabilities = (liabilities: Liability[]): number => {
  return liabilities.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
};

export const calculateNetWorth = (
  assets: Asset[],
  liabilities: Liability[]
): number => {
  return calculateTotalAssets(assets) - calculateTotalLiabilities(liabilities);
};

export const calculateAssetProfit = (asset: Asset): number => {
  if (!asset.cost || asset.cost === 0) return 0;
  return asset.currentValue - asset.cost;
};

export const calculateAssetProfitRate = (asset: Asset): number => {
  if (!asset.cost || asset.cost === 0) return 0;
  return ((asset.currentValue - asset.cost) / asset.cost) * 100;
};

export const calculateLiabilityProgress = (liability: Liability): number => {
  if (!liability.totalLoan || liability.totalLoan === 0) return 0;
  const repaid = liability.totalLoan - liability.remainingBalance;
  return (repaid / liability.totalLoan) * 100;
};

export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  months: number
): number => {
  if (months === 0) return principal;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
};

export const groupAssetsByCategory = (
  assets: Asset[]
): Map<string, Asset[]> => {
  const map = new Map<string, Asset[]>();
  assets.forEach((asset) => {
    const list = map.get(asset.category) || [];
    list.push(asset);
    map.set(asset.category, list);
  });
  return map;
};

export const groupLiabilitiesByCategory = (
  liabilities: Liability[]
): Map<string, Liability[]> => {
  const map = new Map<string, Liability[]>();
  liabilities.forEach((liability) => {
    const list = map.get(liability.category) || [];
    list.push(liability);
    map.set(liability.category, list);
  });
  return map;
};

export const calculateAssetsByCategory = (
  assets: Asset[]
): { name: string; value: number }[] => {
  const map = groupAssetsByCategory(assets);
  const result: { name: string; value: number }[] = [];
  map.forEach((list, name) => {
    result.push({
      name,
      value: list.reduce((sum, a) => sum + a.currentValue, 0),
    });
  });
  return result.sort((a, b) => b.value - a.value);
};

export const calculateLiabilitiesByCategory = (
  liabilities: Liability[]
): { name: string; value: number }[] => {
  const map = groupLiabilitiesByCategory(liabilities);
  const result: { name: string; value: number }[] = [];
  map.forEach((list, name) => {
    result.push({
      name,
      value: list.reduce((sum, l) => sum + l.remainingBalance, 0),
    });
  });
  return result.sort((a, b) => b.value - a.value);
};

export const createSnapshot = (
  assets: Asset[],
  liabilities: Liability[],
  date?: string
): Snapshot => {
  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  return {
    date: date || new Date().toISOString().slice(0, 10),
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
};

export const calculateNetWorthChange = (
  snapshots: Snapshot[]
): { value: number; percent: number } => {
  if (snapshots.length < 2) {
    return { value: 0, percent: 0 };
  }
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const current = sorted[sorted.length - 1].netWorth;
  const previous = sorted[sorted.length - 2].netWorth;
  const diff = current - previous;
  const percent = previous === 0 ? 0 : (diff / previous) * 100;
  return { value: diff, percent };
};
