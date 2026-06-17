import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart,
  Download,
  Upload,
  Settings,
  Trash2,
  ChevronRight,
  Shield,
  Database,
  CalendarClock,
  User,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSnapshot } from '@/hooks/useSnapshot';
import {
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
} from '@/utils/calculate';
import { formatCurrency, formatNumber } from '@/utils/format';
import { exportToJson, downloadFile, getStorageSize } from '@/utils/storage';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useReminders } from '@/hooks/useReminders';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const assets = useStore((s) => s.assets);
  const liabilities = useStore((s) => s.liabilities);
  const settings = useStore((s) => s.settings);
  const importData = useStore((s) => s.importData);
  const clearAllData = useStore((s) => s.clearAllData);
  const { manualSnapshot, snapshots } = useSnapshot();
  const { reminders, hasReminders } = useReminders();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<string | null>(null);

  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  const netWorth = calculateNetWorth(assets, liabilities);
  const storageSize = (getStorageSize() / 1024).toFixed(1);

  const handleExportJson = () => {
    const state = useStore.getState();
    const json = exportToJson({
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots,
      settings: state.settings,
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(json, `资产管家_备份_${date}.json`, 'application/json');
  };

  const handleExportCsv = () => {
    const state = useStore.getState();
    let csv = '类型,名称,类别,金额,备注,日期\n';
    state.assets.forEach((a) => {
      csv += `资产,"${a.name}","${a.category}",${a.currentValue},"${a.description || ''}",${a.updatedAt.slice(0, 10)}\n`;
    });
    state.liabilities.forEach((l) => {
      csv += `负债,"${l.name}","${l.category}",${l.remainingBalance},"${l.note || ''}",${l.nextPaymentDate || ''}\n`;
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `资产管家_数据_${date}.csv`, 'text/csv');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setImportPreview(content);
      setShowImportConfirm(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    const success = importData(importPreview);
    if (success) {
      alert('数据导入成功');
    } else {
      alert('数据导入失败，文件格式不正确');
    }
    setShowImportConfirm(false);
    setImportPreview(null);
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <Header title="我的" />

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4f7c] px-5 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">资产管家</p>
              <p className="text-sm text-white/70 mt-0.5">
                {assets.length} 项资产 · {liabilities.length} 项负债
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <p className="text-xs text-white/60">总资产</p>
              <p className="text-base font-semibold tabular-nums mt-0.5">
                {formatNumber(totalAssets / 10000, 1)}万
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">总负债</p>
              <p className="text-base font-semibold tabular-nums mt-0.5">
                {formatNumber(totalLiabilities / 10000, 1)}万
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">净资产</p>
              <p className="text-base font-semibold tabular-nums mt-0.5">
                {formatNumber(netWorth / 10000, 1)}万
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Card padding="none" className="overflow-hidden">
            <MenuRow
              icon={FileBarChart}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title="财务报告"
              desc="查看月度/年度财务报告"
              onClick={() => navigate('/profile/report')}
            />
            <MenuRow
              icon={CalendarClock}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              title="提醒事项"
              desc={hasReminders ? `${reminders.length} 项待办` : '暂无待办'}
              onClick={() => {}}
              hideArrow
            />
          </Card>

          <Card padding="none" className="overflow-hidden">
            <MenuRow
              icon={Download}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title="导出JSON备份"
              desc="完整数据备份，可用于恢复"
              onClick={handleExportJson}
            />
            <MenuRow
              icon={Download}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              title="导出CSV表格"
              desc="兼容Excel的表格格式"
              onClick={handleExportCsv}
            />
            <MenuRow
              icon={Upload}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              title="导入数据"
              desc="从JSON备份文件恢复"
              onClick={handleImportClick}
            />
          </Card>

          <Card padding="none" className="overflow-hidden">
            <MenuRow
              icon={Database}
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
              title="数据存储"
              desc={`已使用 ${storageSize} KB`}
              onClick={manualSnapshot}
              hideArrow
            />
            <MenuRow
              icon={Settings}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              title="设置"
              desc="偏好设置与选项"
              onClick={() => navigate('/profile/settings')}
            />
          </Card>

          <Card padding="none" className="overflow-hidden">
            <button
              onClick={() => setShowClearModal(true)}
              className="w-full flex items-center gap-3 p-4 active:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-red-600">清除所有数据</p>
                <p className="text-xs text-red-400 mt-0.5">此操作不可恢复</p>
              </div>
            </button>
          </Card>

          <div className="flex items-center justify-center gap-2 pt-2 pb-4">
            <Shield size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400">所有数据仅存储在本地浏览器中</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="确认清除所有数据"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowClearModal(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                clearAllData();
                setShowClearModal(false);
              }}
            >
              确认清除
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          确定要清除所有资产、负债和快照数据吗？此操作不可恢复，建议先导出备份。
        </p>
      </Modal>

      <Modal
        open={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setImportPreview(null);
        }}
        title="确认导入数据"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowImportConfirm(false);
                setImportPreview(null);
              }}
            >
              取消
            </Button>
            <Button fullWidth onClick={handleConfirmImport}>
              确认导入
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          导入将覆盖当前所有数据，确定要继续吗？
        </p>
      </Modal>
    </div>
  );
};

const MenuRow = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  desc,
  onClick,
  hideArrow = false,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc?: string;
  onClick?: () => void;
  hideArrow?: boolean;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 active:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
  >
    <div
      className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
    >
      <Icon size={18} className={iconColor} />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    {!hideArrow && <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />}
  </button>
);
