import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { useStore } from '@/store/useStore';

export const SettingsPage = () => {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header title="设置" showBack />

      <div className="max-w-md mx-auto px-5 py-4 space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">通用设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">货币单位</p>
                <p className="text-xs text-gray-400 mt-0.5">选择显示的货币符号</p>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => updateSettings({ currency: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                <option value="CNY">¥ 人民币</option>
                <option value="USD">$ 美元</option>
                <option value="EUR">€ 欧元</option>
                <option value="GBP">£ 英镑</option>
                <option value="JPY">¥ 日元</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">提前提醒天数</p>
                <p className="text-xs text-gray-400 mt-0.5">还款/到期前多少天开始提醒</p>
              </div>
              <select
                value={settings.remindBeforeDays}
                onChange={(e) =>
                  updateSettings({ remindBeforeDays: Number(e.target.value) })
                }
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                <option value={1}>1 天前</option>
                <option value={3}>3 天前</option>
                <option value={5}>5 天前</option>
                <option value={7}>7 天前</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">数据快照</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">自动月度快照</p>
              <p className="text-xs text-gray-400 mt-0.5">每月自动记录净资产快照</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSnapshot}
                onChange={(e) => updateSettings({ autoSnapshot: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
            </label>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">关于</h3>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>应用版本</span>
              <span className="text-gray-700">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>数据存储</span>
              <span className="text-gray-700">本地浏览器</span>
            </div>
            <p className="text-xs text-gray-400 pt-2 leading-relaxed">
              所有数据仅存储在您的浏览器本地，不会上传到任何服务器。建议定期导出备份以防数据丢失。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
