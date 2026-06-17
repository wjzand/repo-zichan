import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2,
  Trash2,
  Calendar,
  CalendarClock,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateLiabilityProgress } from '@/utils/calculate';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  getDaysDiff,
} from '@/utils/format';
import { getLiabilityCategoryColor } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Timeline, TimelineItem } from '@/components/common/Timeline';
import { AmountInput } from '@/components/form/AmountInput';
import { DatePicker } from '@/components/form/DatePicker';

export const LiabilityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const liability = useStore((s) => s.liabilities.find((l) => l.id === id));
  const deleteLiability = useStore((s) => s.deleteLiability);
  const addRepayment = useStore((s) => s.addRepayment);
  const settings = useStore((s) => s.settings);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState<number | ''>('');
  const [repaymentDate, setRepaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [repaymentNote, setRepaymentNote] = useState('');

  if (!liability) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="负债详情" showBack />
        <div className="max-w-md mx-auto px-5 py-10 text-center">
          <p className="text-gray-500">负债不存在</p>
        </div>
      </div>
    );
  }

  const progress = calculateLiabilityProgress(liability);
  const daysToPayment = liability.nextPaymentDate
    ? getDaysDiff(liability.nextPaymentDate)
    : null;
  const repaidAmount = liability.totalLoan - liability.remainingBalance;

  const repaymentItems: TimelineItem[] = liability.repayments.map((r) => ({
    date: formatDate(r.date),
    content: (
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-gray-700">还款</span>
          <span className="font-semibold tabular-nums text-emerald-600">
            -{formatCurrency(r.amount, settings.currency, 0)}
          </span>
        </div>
        {r.note && <p className="text-xs text-gray-400">{r.note}</p>}
      </div>
    ),
    dotColor: '#10b981',
  }));

  const handleAddRepayment = () => {
    if (!repaymentAmount || repaymentAmount <= 0) {
      alert('请输入有效的还款金额');
      return;
    }
    if (!repaymentDate) {
      alert('请选择还款日期');
      return;
    }
    addRepayment(liability.id, {
      amount: Number(repaymentAmount),
      date: repaymentDate,
      note: repaymentNote.trim() || undefined,
    });
    setShowRepaymentModal(false);
    setRepaymentAmount('');
    setRepaymentDate(new Date().toISOString().slice(0, 10));
    setRepaymentNote('');
  };

  const handleDelete = () => {
    deleteLiability(liability.id);
    navigate('/liabilities');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header
        title="负债详情"
        showBack
        rightContent={
          <button
            onClick={() => navigate(`/liabilities/edit/${liability.id}`)}
            className="p-2 -mr-2 rounded-full active:bg-gray-100"
          >
            <Edit2 size={20} className="text-gray-700" />
          </button>
        }
      />

      <div className="max-w-md mx-auto">
        <div
          className="px-5 py-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${getLiabilityCategoryColor(
              liability.category
            )}dd 0%, ${getLiabilityCategoryColor(liability.category)}99 100%)`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium">
              {liability.category}
            </span>
          </div>
          <h1 className="text-xl font-bold mb-1">{liability.name}</h1>
          <p className="text-3xl font-bold mt-2 tabular-nums">
            {formatCurrency(liability.remainingBalance, settings.currency, 0)}
          </p>
          <p className="text-sm text-white/70 mt-1">
            剩余应还 · 已还 {formatPercent(progress)}
          </p>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {liability.nextPaymentDate && (
            <Card
              className={
                daysToPayment !== null && daysToPayment <= 3
                  ? daysToPayment === 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                  : ''
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    daysToPayment !== null && daysToPayment <= 3
                      ? daysToPayment === 0
                        ? 'bg-red-100'
                        : 'bg-amber-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <CalendarClock
                    size={20}
                    className={
                      daysToPayment !== null && daysToPayment <= 3
                        ? daysToPayment === 0
                          ? 'text-red-600'
                          : 'text-amber-600'
                        : 'text-gray-500'
                    }
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      daysToPayment !== null && daysToPayment <= 3
                        ? daysToPayment === 0
                          ? 'text-red-800'
                          : 'text-amber-800'
                        : 'text-gray-700'
                    }`}
                  >
                    {daysToPayment !== null && daysToPayment < 0
                      ? '还款日已过'
                      : daysToPayment === 0
                      ? '今日需还款'
                      : `还有 ${daysToPayment} 天还款`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    还款日：{formatDate(liability.nextPaymentDate)} · 月供{' '}
                    {formatCurrency(liability.monthlyPayment, settings.currency, 0)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-gray-500 mb-1">总借款额</p>
              <p className="text-lg font-semibold text-gray-900 tabular-nums">
                {formatCurrency(liability.totalLoan, settings.currency, 0)}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 mb-1">已还金额</p>
              <p className="text-lg font-semibold text-emerald-600 tabular-nums">
                {formatCurrency(repaidAmount, settings.currency, 0)}
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-gray-500" />
              基本信息
            </h3>
            <div className="space-y-3">
              <InfoRow label="负债类别" value={liability.category} />
              <InfoRow
                label="剩余应还"
                value={formatCurrency(liability.remainingBalance, settings.currency)}
                valueClass="font-semibold text-gray-900"
              />
              <InfoRow
                label="月还款额"
                value={formatCurrency(liability.monthlyPayment, settings.currency)}
              />
              {liability.interestRate !== undefined && (
                <InfoRow label="年化利率" value={formatPercent(liability.interestRate)} />
              )}
              {liability.startDate && (
                <InfoRow
                  label="开始日期"
                  value={formatDate(liability.startDate)}
                  icon={Calendar}
                />
              )}
              {liability.endDate && (
                <InfoRow
                  label="结束日期"
                  value={formatDate(liability.endDate)}
                  icon={Calendar}
                />
              )}
              {liability.nextPaymentDate && (
                <InfoRow
                  label="下一还款日"
                  value={formatDate(liability.nextPaymentDate)}
                  icon={CalendarClock}
                />
              )}
              {liability.note && <InfoRow label="备注" value={liability.note} />}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                还款记录
              </h3>
              <button
                onClick={() => {
                  setRepaymentAmount(liability.monthlyPayment || '');
                  setShowRepaymentModal(true);
                }}
                className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                + 记录还款
              </button>
            </div>
            <Timeline items={repaymentItems} />
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setRepaymentAmount(liability.monthlyPayment || '');
              setShowRepaymentModal(true);
            }}
          >
            <Check size={18} className="mr-1.5" />
            记录还款
          </Button>
          <Button
            variant="danger"
            className="flex-1 border-0"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={18} className="mr-1.5" />
            删除
          </Button>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              取消
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          确定要删除「{liability.name}」吗？此操作不可恢复，还款记录也将被清除。
        </p>
      </Modal>

      <Modal
        open={showRepaymentModal}
        onClose={() => setShowRepaymentModal(false)}
        title="记录还款"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowRepaymentModal(false)}
            >
              取消
            </Button>
            <Button fullWidth onClick={handleAddRepayment}>
              确认还款
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <AmountInput
            label="还款金额"
            value={repaymentAmount}
            onChange={setRepaymentAmount}
            required
          />
          <DatePicker
            label="还款日期"
            value={repaymentDate}
            onChange={setRepaymentDate}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">备注（可选）</label>
            <input
              type="text"
              value={repaymentNote}
              onChange={(e) => setRepaymentNote(e.target.value)}
              placeholder="如：第XX期还款"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  valueClass = '',
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ElementType;
}) => {
  const Icon = icon;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0 flex items-center gap-1.5">
        {Icon && <Icon size={14} />}
        {label}
      </span>
      <span className={`text-sm text-gray-800 text-right ${valueClass}`}>{value}</span>
    </div>
  );
};
