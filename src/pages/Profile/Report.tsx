import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSnapshot } from '@/hooks/useSnapshot';
import {
  calculateNetWorthChange,
  calculateAssetsByCategory,
  calculateLiabilitiesByCategory,
} from '@/utils/calculate';
import { formatCurrency, formatMonth, formatNumber } from '@/utils/format';
import { getAssetCategoryColor, getLiabilityCategoryColor } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/charts/LineChart';

type ReportType = 'month' | 'year';

export const ReportPage = () => {
  const assets = useStore((s) => s.assets);
  const liabilities = useStore((s) => s.liabilities);
  const settings = useStore((s) => s.settings);
  const { snapshots } = useSnapshot();
  const [reportType, setReportType] = useState<ReportType>('month');

  const trendData = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    const count = reportType === 'month' ? 6 : 12;
    return sorted.slice(-count).map((s) => ({
      label: formatMonth(s.date).slice(5),
      value: s.netWorth,
    }));
  }, [snapshots, reportType]);

  const netWorthChange = useMemo(() => calculateNetWorthChange(snapshots), [snapshots]);

  const assetsByCategory = useMemo(
    () =>
      calculateAssetsByCategory(assets).slice(0, 3).map((item) => ({
        ...item,
        color: getAssetCategoryColor(item.name),
      })),
    [assets]
  );

  const liabilitiesByCategory = useMemo(
    () =>
      calculateLiabilitiesByCategory(liabilities).slice(0, 3).map((item) => ({
        ...item,
        color: getLiabilityCategoryColor(item.name),
      })),
    [liabilities]
  );

  const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remainingBalance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const now = new Date();
  const reportTitle =
    reportType === 'month'
      ? `${now.getFullYear()}年${now.getMonth() + 1}月财务简报`
      : `${now.getFullYear()}年度财务报告`;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header title="财务报告" showBack />

      <div className="max-w-md mx-auto px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('month')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              reportType === 'month'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            月度报告
          </button>
          <button
            onClick={() => setReportType('year')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              reportType === 'year'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            年度报告
          </button>
        </div>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4f7c] text-white border-0">
          <p className="text-xs text-white/60">{reportTitle}</p>
          <p className="text-xs text-white/50 mt-1">
            生成时间：{now.toLocaleDateString('zh-CN')}
          </p>
          <div className="mt-4">
            <p className="text-sm text-white/70">本期净资产</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">
              {formatCurrency(netWorth, settings.currency, 0)}
            </p>
            {snapshots.length >= 2 && (
              <div className="flex items-center gap-1.5 mt-2">
                {netWorthChange.value >= 0 ? (
                  <ArrowUpCircle size={16} className="text-emerald-300" />
                ) : (
                  <ArrowDownCircle size={16} className="text-red-300" />
                )}
                <span
                  className={`text-sm font-medium ${
                    netWorthChange.value >= 0 ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {netWorthChange.value >= 0 ? '+' : ''}
                  {formatCurrency(netWorthChange.value, settings.currency, 0)}
                </span>
                <span
                  className={`text-xs ${
                    netWorthChange.value >= 0 ? 'text-emerald-200/80' : 'text-red-200/80'
                  }`}
                >
                  ({netWorthChange.percent >= 0 ? '+' : ''}
                  {netWorthChange.percent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <span className="text-xs text-gray-500">总资产</span>
            </div>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatCurrency(totalAssets, settings.currency, 0)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{assets.length} 项</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <CreditCard size={16} className="text-red-500" />
              </div>
              <span className="text-xs text-gray-500">总负债</span>
            </div>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatCurrency(totalLiabilities, settings.currency, 0)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{liabilities.length} 项</p>
          </Card>
        </div>

        {trendData.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1e3a5f]" />
              净值趋势
            </h3>
            <LineChart
              data={trendData}
              height={160}
              color="#1e3a5f"
              fillColor="rgba(30, 58, 95, 0.1)"
            />
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">资产构成 TOP3</h3>
          {assetsByCategory.length > 0 ? (
            <div className="space-y-3">
              {assetsByCategory.map((item) => {
                const percent = totalAssets > 0 ? (item.value / totalAssets) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 tabular-nums">
                          {formatCurrency(item.value, settings.currency, 0)}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">暂无资产数据</p>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">负债构成 TOP3</h3>
          {liabilitiesByCategory.length > 0 ? (
            <div className="space-y-3">
              {liabilitiesByCategory.map((item) => {
                const percent =
                  totalLiabilities > 0 ? (item.value / totalLiabilities) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 tabular-nums">
                          {formatCurrency(item.value, settings.currency, 0)}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">暂无负债数据</p>
          )}
        </Card>

        <Card className="bg-blue-50/50 border-blue-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">📊 财务摘要</h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>
              · 当前净资产为{' '}
              <span className="font-semibold text-gray-900">
                {formatCurrency(netWorth, settings.currency, 0)}
              </span>
              {netWorth >= 0 ? '，财务状况良好' : '，需注意控制负债'}
            </p>
            {assetsByCategory[0] && (
              <p>
                · 主要资产为「{assetsByCategory[0].name}」，占比{' '}
                <span className="font-medium">
                  {((assetsByCategory[0].value / totalAssets) * 100).toFixed(1)}%
                </span>
              </p>
            )}
            {liabilitiesByCategory[0] && (
              <p>
                · 主要负债为「{liabilitiesByCategory[0].name}」，占比{' '}
                <span className="font-medium">
                  {((liabilitiesByCategory[0].value / totalLiabilities) * 100).toFixed(1)}%
                </span>
              </p>
            )}
            {snapshots.length >= 2 && netWorthChange.value !== 0 && (
              <p>
                · 较上期净资产
                <span
                  className={
                    netWorthChange.value >= 0
                      ? 'text-emerald-600 font-medium'
                      : 'text-red-500 font-medium'
                  }
                >
                  {' '}
                  {netWorthChange.value >= 0 ? '增长' : '减少'}{' '}
                  {formatCurrency(Math.abs(netWorthChange.value), settings.currency, 0)}
                </span>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
