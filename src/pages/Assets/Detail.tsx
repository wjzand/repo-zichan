import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2,
  Trash2,
  Calendar,
  TrendingUp,
  FileText,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  calculateAssetProfit,
  calculateAssetProfitRate,
} from '@/utils/calculate';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  getDaysDiff,
} from '@/utils/format';
import { getAssetCategoryColor } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Timeline, TimelineItem } from '@/components/common/Timeline';

export const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const asset = useStore((s) => s.assets.find((a) => a.id === id));
  const deleteAsset = useStore((s) => s.deleteAsset);
  const settings = useStore((s) => s.settings);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="资产详情" showBack />
        <div className="max-w-md mx-auto px-5 py-10 text-center">
          <p className="text-gray-500">资产不存在</p>
        </div>
      </div>
    );
  }

  const profit = calculateAssetProfit(asset);
  const profitRate = calculateAssetProfitRate(asset);
  const daysToMaturity = asset.maturityDate ? getDaysDiff(asset.maturityDate) : null;

  const historyItems: TimelineItem[] = asset.history.map((h) => ({
    date: formatDate(h.date),
    content: (
      <div className="flex items-center justify-between">
        <span className="text-gray-700">金额变更</span>
        <span className="font-semibold tabular-nums text-gray-900">
          {formatCurrency(h.value, settings.currency, 0)}
        </span>
      </div>
    ),
  }));

  const handleDelete = () => {
    deleteAsset(asset.id);
    navigate('/assets');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header
        title="资产详情"
        showBack
        rightContent={
          <button
            onClick={() => navigate(`/assets/edit/${asset.id}`)}
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
            background: `linear-gradient(135deg, ${getAssetCategoryColor(
              asset.category
            )}dd 0%, ${getAssetCategoryColor(asset.category)}99 100%)`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium">
              {asset.category}
            </span>
          </div>
          <h1 className="text-xl font-bold mb-1">{asset.name}</h1>
          <p className="text-3xl font-bold mt-2 tabular-nums">
            {formatCurrency(asset.currentValue, settings.currency, 0)}
          </p>
          {asset.cost && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                {profit >= 0 ? (
                  <TrendingUp size={14} className="text-white/80" />
                ) : (
                  <TrendingUp
                    size={14}
                    className="text-white/80 rotate-180"
                  />
                )}
                <span
                  className={`text-sm font-medium ${
                    profit >= 0 ? 'text-white' : 'text-red-100'
                  }`}
                >
                  {profit >= 0 ? '+' : ''}
                  {formatCurrency(profit, settings.currency, 0)}
                </span>
              </div>
              <span className="text-sm text-white/70">
                {profitRate >= 0 ? '+' : ''}
                {formatPercent(profitRate)}
              </span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          {asset.maturityDate && (
            <Card
              className={
                daysToMaturity !== null && daysToMaturity <= 7
                  ? 'bg-amber-50 border-amber-200'
                  : ''
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    daysToMaturity !== null && daysToMaturity <= 7
                      ? 'bg-amber-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <AlertCircle
                    size={20}
                    className={
                      daysToMaturity !== null && daysToMaturity <= 7
                        ? 'text-amber-600'
                        : 'text-gray-500'
                    }
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      daysToMaturity !== null && daysToMaturity <= 7
                        ? 'text-amber-800'
                        : 'text-gray-700'
                    }`}
                  >
                    {daysToMaturity !== null && daysToMaturity < 0
                      ? '已到期'
                      : daysToMaturity === 0
                      ? '今天到期'
                      : daysToMaturity === 1
                      ? '明天到期'
                      : `还有 ${daysToMaturity} 天到期`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    到期日期：{formatDate(asset.maturityDate)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {asset.photo && (
            <Card padding="none" className="overflow-hidden">
              <img
                src={asset.photo}
                alt={asset.name}
                className="w-full h-48 object-cover"
              />
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-gray-500" />
              基本信息
            </h3>
            <div className="space-y-3">
              <InfoRow label="资产类别" value={asset.category} />
              <InfoRow
                label="当前估值"
                value={formatCurrency(asset.currentValue, settings.currency)}
                valueClass="font-semibold text-gray-900"
              />
              {asset.cost !== undefined && asset.cost > 0 && (
                <InfoRow
                  label="购买成本"
                  value={formatCurrency(asset.cost, settings.currency)}
                />
              )}
              {asset.interestRate !== undefined && (
                <InfoRow label="年化利率" value={formatPercent(asset.interestRate)} />
              )}
              {asset.purchaseDate && (
                <InfoRow
                  label="购入日期"
                  value={formatDate(asset.purchaseDate)}
                  icon={Calendar}
                />
              )}
              {asset.maturityDate && (
                <InfoRow
                  label="到期日期"
                  value={formatDate(asset.maturityDate)}
                  icon={Calendar}
                />
              )}
              {asset.description && (
                <InfoRow label="备注" value={asset.description} />
              )}
              <InfoRow
                label="创建时间"
                value={formatDateTime(asset.createdAt)}
              />
              <InfoRow
                label="更新时间"
                value={formatDateTime(asset.updatedAt)}
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-500" />
              变更记录
            </h3>
            <Timeline items={historyItems} />
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowDeleteModal(true)}
            className="border-0"
          >
            <Trash2 size={18} className="mr-1.5" />
            删除资产
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
          确定要删除「{asset.name}」吗？此操作不可恢复，相关变更记录也将被清除。
        </p>
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
