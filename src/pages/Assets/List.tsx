import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ArrowUpDown, ChevronRight, Wallet } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateTotalAssets, groupAssetsByCategory } from '@/utils/calculate';
import { formatCurrency, formatDate } from '@/utils/format';
import { getAssetCategoryColor, ASSET_CATEGORIES } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';

type SortType = 'amount-desc' | 'amount-asc' | 'date-desc';

export const AssetsListPage = () => {
  const navigate = useNavigate();
  const assets = useStore((s) => s.assets);
  const settings = useStore((s) => s.settings);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [showFilter, setShowFilter] = useState(false);

  const totalAssets = useMemo(() => calculateTotalAssets(assets), [assets]);

  const filteredAssets = useMemo(() => {
    let list = [...assets];
    if (filterCategory !== 'all') {
      list = list.filter((a) => a.category === filterCategory);
    }
    switch (sortType) {
      case 'amount-desc':
        list.sort((a, b) => b.currentValue - a.currentValue);
        break;
      case 'amount-asc':
        list.sort((a, b) => a.currentValue - b.currentValue);
        break;
      case 'date-desc':
      default:
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return list;
  }, [assets, filterCategory, sortType]);

  const groupedAssets = useMemo(
    () => groupAssetsByCategory(filteredAssets),
    [filteredAssets]
  );

  const categories = ['all', ...ASSET_CATEGORIES.map((c) => c.name)];

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <Header
        title="我的资产"
        rightContent={
          <button
            onClick={() => navigate('/assets/add')}
            className="p-2 -mr-2 rounded-full active:bg-gray-100"
          >
            <Plus size={22} className="text-gray-700" />
          </button>
        }
      />

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4f7c] px-5 py-5 text-white">
          <p className="text-sm text-white/70">总资产</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">
            {formatCurrency(totalAssets, settings.currency, 0)}
          </p>
          <p className="text-sm text-white/60 mt-1">{assets.length} 项资产</p>
        </div>

        <div className="px-5 py-3 flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory !== 'all'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Filter size={14} />
            筛选
          </button>
          <button
            onClick={() => {
              const sorts: SortType[] = ['date-desc', 'amount-desc', 'amount-asc'];
              const idx = sorts.indexOf(sortType);
              setSortType(sorts[(idx + 1) % sorts.length]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-200 whitespace-nowrap"
          >
            <ArrowUpDown size={14} />
            {sortType === 'date-desc'
              ? '最近更新'
              : sortType === 'amount-desc'
              ? '金额从高到低'
              : '金额从低到高'}
          </button>
        </div>

        {showFilter && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        )}

        <div className="px-5">
          {filteredAssets.length === 0 ? (
            <EmptyState
              icon={
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Wallet size={26} className="text-emerald-500" />
                </div>
              }
              title={filterCategory === 'all' ? '还没有添加资产' : '该分类下暂无资产'}
              description={filterCategory === 'all' ? '添加您的第一笔资产开始管理' : '试试其他分类或添加新资产'}
              actionText="添加资产"
              onAction={() => navigate('/assets/add')}
            />
          ) : (
            <div className="space-y-4 pb-5">
              {[...groupedAssets.entries()].map(([category, list]) => {
                const categoryTotal = list.reduce((sum, a) => sum + a.currentValue, 0);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getAssetCategoryColor(category) }}
                        />
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-xs text-gray-400">{list.length}项</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(categoryTotal, settings.currency, 0)}
                      </span>
                    </div>
                    <Card padding="none" className="overflow-hidden">
                      {list.map((asset, idx) => (
                        <div
                          key={asset.id}
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className={`flex items-center gap-3 p-4 cursor-pointer active:bg-gray-50 transition-colors ${
                            idx !== list.length - 1 ? 'border-b border-gray-50' : ''
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${getAssetCategoryColor(asset.category)}15` }}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getAssetCategoryColor(asset.category) }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {asset.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              更新于 {formatDate(asset.updatedAt)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-semibold text-gray-900 tabular-nums">
                              {formatCurrency(asset.currentValue, settings.currency, 0)}
                            </p>
                          </div>
                          <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                        </div>
                      ))}
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <FloatingActionButton />
    </div>
  );
};
