import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  ChevronRight,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSnapshot } from '@/hooks/useSnapshot';
import { useReminders } from '@/hooks/useReminders';
import {
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  calculateAssetsByCategory,
  calculateLiabilitiesByCategory,
  calculateNetWorthChange,
} from '@/utils/calculate';
import { formatCurrency, formatDate, formatNumber, formatMonth, getDaysDiff } from '@/utils/format';
import { getAssetCategoryColor, getLiabilityCategoryColor } from '@/constants/categories';
import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { EmptyState } from '@/components/common/EmptyState';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const assets = useStore((s) => s.assets);
  const liabilities = useStore((s) => s.liabilities);
  const settings = useStore((s) => s.settings);
  const { getTrendData, manualSnapshot, snapshots } = useSnapshot();
  const { urgentReminders, hasReminders } = useReminders();

  const totalAssets = useMemo(() => calculateTotalAssets(assets), [assets]);
  const totalLiabilities = useMemo(() => calculateTotalLiabilities(liabilities), [liabilities]);
  const netWorth = useMemo(() => calculateNetWorth(assets, liabilities), [assets, liabilities]);

  const trendData = useMemo(() => {
    const data = getTrendData(6);
    return data.map((s) => ({
      label: formatMonth(s.date).slice(5),
      value: s.netWorth,
    }));
  }, [getTrendData]);

  const netWorthChange = useMemo(() => calculateNetWorthChange(snapshots), [snapshots]);

  const assetsByCategory = useMemo(() => {
    return calculateAssetsByCategory(assets).map((item) => ({
      ...item,
      color: getAssetCategoryColor(item.name),
    }));
  }, [assets]);

  const liabilitiesByCategory = useMemo(() => {
    return calculateLiabilitiesByCategory(liabilities).map((item) => ({
      ...item,
      color: getLiabilityCategoryColor(item.name),
    }));
  }, [liabilities]);

  const isEmpty = assets.length === 0 && liabilities.length === 0;

  if (isEmpty) {
    return (
      <div className="pb-24">
        <div className="max-w-md mx-auto">
          <div className="px-5 pt-4 pb-2">
            <p className="text-sm text-gray-500">欢迎使用</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">资产管家</h1>
          </div>
          <EmptyState
            icon={
              <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <PiggyBank size={28} className="text-[#1e3a5f]" />
              </div>
            }
            title="开始管理您的资产"
            description="添加您的第一笔资产或负债，开启财富管理之旅"
            actionText="添加资产"
            onAction={() => navigate('/assets/add')}
          />
        </div>
        <FloatingActionButton />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="max-w-md mx-auto">
        {hasReminders && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <div className="px-5 py-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    {urgentReminders.length} 项待办事项
                  </p>
                  <div className="space-y-1">
                    {urgentReminders.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        onClick={() =>
                          navigate(
                            r.type === 'asset-maturity'
                              ? `/assets/${r.relatedId}`
                              : `/liabilities/${r.relatedId}`
                          )
                        }
                        className="flex items-center justify-between text-xs text-amber-700 cursor-pointer"
                      >
                        <span className="truncate pr-2">{r.title}</span>
                        <span className="flex-shrink-0 font-medium">
                          {r.daysLeft === 0
                            ? '今天'
                            : r.daysLeft === 1
                            ? '明天'
                            : `${r.daysLeft}天后`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">我的净资产</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">
              {formatCurrency(netWorth, settings.currency)}
            </h1>
          </div>
          <button
            onClick={manualSnapshot}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="刷新快照"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="px-5">
          {snapshots.length >= 2 && (
            <div className="flex items-center gap-1 mb-4">
              {netWorthChange.value >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span
                className={`text-sm font-medium tabular-nums ${
                  netWorthChange.value >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {netWorthChange.value >= 0 ? '+' : ''}
                {formatCurrency(netWorthChange.value, settings.currency, 0)}
              </span>
              <span
                className={`text-xs ${
                  netWorthChange.value >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                ({netWorthChange.percent >= 0 ? '+' : ''}
                {netWorthChange.percent.toFixed(2)}%)
              </span>
              <span className="text-xs text-gray-400 ml-1">较上期</span>
            </div>
          )}
        </div>

        <div className="px-5 space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet size={16} className="text-emerald-600" />
                </div>
                <span className="text-xs text-emerald-700 font-medium">总资产</span>
              </div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(totalAssets, settings.currency, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{assets.length} 项</p>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <CreditCard size={16} className="text-red-600" />
                </div>
                <span className="text-xs text-red-700 font-medium">总负债</span>
              </div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(totalLiabilities, settings.currency, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{liabilities.length} 项</p>
            </Card>
          </div>
        </div>

        {trendData.length > 0 && (
          <div className="px-5 mb-5">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">净值走势</h3>
                <span className="text-xs text-gray-400">近6个月</span>
              </div>
              <LineChart
                data={trendData}
                height={180}
                color="#1e3a5f"
                fillColor="rgba(30, 58, 95, 0.1)"
              />
            </Card>
          </div>
        )}

        <div className="px-5 space-y-4 mb-5">
          <Card>
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => navigate('/assets')}
            >
              <h3 className="text-sm font-semibold text-gray-800">资产构成</h3>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            {assetsByCategory.length > 0 ? (
              <DonutChart
                data={assetsByCategory}
                size={150}
                thickness={22}
                centerText={formatNumber(totalAssets, 0)}
                centerSubText="总资产"
              />
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">暂无资产数据</p>
            )}
          </Card>

          <Card>
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => navigate('/liabilities')}
            >
              <h3 className="text-sm font-semibold text-gray-800">负债构成</h3>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            {liabilitiesByCategory.length > 0 ? (
              <DonutChart
                data={liabilitiesByCategory}
                size={150}
                thickness={22}
                centerText={formatNumber(totalLiabilities, 0)}
                centerSubText="总负债"
              />
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">暂无负债数据</p>
            )}
          </Card>
        </div>

        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">快捷入口</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/assets/add')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Wallet size={20} className="text-emerald-600" />
              </div>
              <span className="text-xs text-gray-600">添加资产</span>
            </button>
            <button
              onClick={() => navigate('/liabilities/add')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <CreditCard size={20} className="text-red-600" />
              </div>
              <span className="text-xs text-gray-600">添加负债</span>
            </button>
            <button
              onClick={() => navigate('/profile/report')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">财务报告</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <PiggyBank size={20} className="text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">数据管理</span>
            </button>
          </div>
        </div>
      </div>
      <FloatingActionButton />
    </div>
  );
};
