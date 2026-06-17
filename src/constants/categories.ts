import { CategoryItem } from '@/types';

export const ASSET_CATEGORIES: CategoryItem[] = [
  { name: '现金', color: '#10b981', icon: 'wallet' },
  { name: '银行存款', color: '#3b82f6', icon: 'building-2' },
  { name: '投资理财', color: '#8b5cf6', icon: 'trending-up' },
  { name: '房产', color: '#f59e0b', icon: 'home' },
  { name: '车辆', color: '#ef4444', icon: 'car' },
  { name: '贵重物品', color: '#ec4899', icon: 'gem' },
  { name: '应收账款', color: '#06b6d4', icon: 'receipt' },
  { name: '其他', color: '#6b7280', icon: 'more-horizontal' },
];

export const LIABILITY_CATEGORIES: CategoryItem[] = [
  { name: '信用卡', color: '#ef4444', icon: 'credit-card' },
  { name: '消费贷款', color: '#f59e0b', icon: 'shopping-bag' },
  { name: '房贷', color: '#8b5cf6', icon: 'home' },
  { name: '车贷', color: '#3b82f6', icon: 'car' },
  { name: '个人借款', color: '#ec4899', icon: 'users' },
  { name: '其他', color: '#6b7280', icon: 'more-horizontal' },
];

export const getAssetCategoryColor = (name: string): string => {
  const found = ASSET_CATEGORIES.find(c => c.name === name);
  return found?.color || '#6b7280';
};

export const getLiabilityCategoryColor = (name: string): string => {
  const found = LIABILITY_CATEGORIES.find(c => c.name === name);
  return found?.color || '#6b7280';
};

export const getAssetCategoryIcon = (name: string): string => {
  const found = ASSET_CATEGORIES.find(c => c.name === name);
  return found?.icon || 'circle';
};

export const getLiabilityCategoryIcon = (name: string): string => {
  const found = LIABILITY_CATEGORIES.find(c => c.name === name);
  return found?.icon || 'circle';
};
