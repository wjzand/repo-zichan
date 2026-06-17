import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ArrowUpDown, ChevronRight, CreditCard, CalendarClock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useReminders } from '@/hooks/useReminders';
import { calculateTotalLiabilities, groupLiabilitiesByCategory } from '@/utils/calculate';
import { formatCurrency, formatDate, getDaysDiff } from '@/utils/format';
import { getLiabilityCategoryColor, LIABILITY_CATEGORIES } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';

type SortType = 'urgency' | 'amount-desc' | 'amount-asc';

export const LiabilitiesListPage = () => {
  const navigate = useNavigate();
  const liabilities = useStore((s) => s.liabilities);
  const settings = useStore((s) => s.settings);
  const { todayPayments } = useReminders();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('urgency');
  const [showFilter, setShowFilter] = useState(false);

  const totalLiabilities = useMemo(() => calculateTotalLiabilities(liabilities), [liabilities]);

  const filteredLiabilities = useMemo(() => {
    let list = [...liabilities];
    if (filterCategory !== 'all') {
      list = list.filter((l) => l.category === filterCategory);
    }
    switch (sortType) {
      case 'amount-desc':
        list.sort((a, b) => b.remainingBalance - a.remainingBalance);
        break;
      case 'amount-asc':
        list.sort((a, b) => a.remainingBalance - b.remainingBalance);
        break;
      case 'urgency':
      default:
        list.sort((a, b) => {
          const aDate = a.nextPaymentDate ? new Date(a.nextPaymentDate).getTime() : Infinity;
          const bDate = b.nextPaymentDate ? new Date(b.nextPaymentDate).getTime() : Infinity;
          return aDate - bDate;
        });
    }
    return list;
  }, [liabilities, filterCategory, sortType]);

  const groupedLiabilities = useMemo(
    () => groupLiabilitiesByCategory(filteredLiabilities),
    [filteredLiabilities]
  );

  const categories = ['all', ...LIABILITY_CATEGORIES.map((c) => c.name)];
  const todayPaymentIds = new Set(todayPayments.map((p) => p.relatedId));

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <Header
        title="我的负债"
        rightContent={
          <button
            onClick={() => navigate('/liabilities/add')}
            className="p-2 -mr-2 rounded-full active:bg-gray-100"
          >
            <Plus size={22} className="text-gray-700" />
          </button>
        }
      />

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 px-5 py-5 text-white">
          <p className="text-sm text-white/70">总负债</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">
            {formatCurrency(totalLiabilities, settings.currency, 0)}
          </p>
          <p className="text-sm text-white/60 mt-1">{liabilities.length} 项负债</p>
        </div>

        {todayPayments.length > 0 && (
          <div className="mx-5 -mt-3 mb-3">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-800">
                    今日有 {todayPayments.length} 笔需还款
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5 truncate">
                    {todayPayments.map((p) => p.title).join('、')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="px-5 py-3 flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory !== 'all'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Filter size={14} />
            筛选
          </button>
          <button
            onClick={() => {
              const sorts: SortType[] = ['urgency', 'amount-desc', 'amount-asc'];
              const idx = sorts.indexOf(sortType);
              setSortType(sorts[(idx + 1) % sorts.length]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-200 whitespace-nowrap"
          >
            <ArrowUpDown size={14} />
            {sortType === 'urgency'
              ? '按紧迫度'
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
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        )}

        <div className="px-5">
          {filteredLiabilities.length === 0 ? (
            <EmptyState
              icon={
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <CreditCard size={26} className="text-red-400" />
                </div>
              }
              title={filterCategory === 'all' ? '恭喜，没有负债！' : '该分类下暂无负债'}
              description={filterCategory === 'all' ? '如有负债可添加进行管理' : '试试其他分类或添加新负债'}
              actionText={filterCategory === 'all' ? '添加负债' : undefined}
              onAction={filterCategory === 'all' ? () => navigate('/liabilities/add') : undefined}
            />
          ) : (
            <div className="space-y-4 pb-5">
              {[...groupedLiabilities.entries()].map(([category, list]) => {
                const categoryTotal = list.reduce((sum, l) => sum + l.remainingBalance, 0);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getLiabilityCategoryColor(category) }}
                        />
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-xs text-gray-400">{list.length}项</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(categoryTotal, settings.currency, 0)}
                      </span>
                    </div>
                    <Card padding="none" className="overflow-hidden">
                      {list.map((liability, idx) => {
                        const isTodayPayment = todayPaymentIds.has(liability.id);
                        const daysToPayment = liability.nextPaymentDate
                          ? getDaysDiff(liability.nextPaymentDate)
                          : null;
                        return (
                          <div
                            key={liability.id}
                            onClick={() => navigate(`/liabilities/${liability.id}`)}
                            className={`flex items-center gap-3 p-4 cursor-pointer active:bg-gray-50 transition-colors ${
                              idx !== list.length - 1 ? 'border-b border-gray-50' : ''
                            } ${isTodayPayment ? 'bg-amber-50/50' : ''}`}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: `${getLiabilityCategoryColor(
                                  liability.category
                                )}15`,
                              }}
                            >
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: getLiabilityCategoryColor(liability.category),
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {liability.name}
                                </p>
                                {isTodayPayment && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-medium flex-shrink-0">
                                    今日还款
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                月供 {formatCurrency(liability.monthlyPayment, settings.currency, 0)}
                                {liability.nextPaymentDate &&
                                  ` · ${formatDate(liability.nextPaymentDate)}`}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-semibold text-gray-900 tabular-nums">
                                {formatCurrency(liability.remainingBalance, settings.currency, 0)}
                              </p>
                              {daysToPayment !== null && daysToPayment >= 0 && (
                                <p
                                  className={`text-xs mt-0.5 ${
                                    daysToPayment === 0
                                      ? 'text-amber-600 font-medium'
                                      : daysToPayment <= 3
                                      ? 'text-red-500'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {daysToPayment === 0 ? '今天' : `${daysToPayment}天后`}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                          </div>
                        );
                      })}
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
