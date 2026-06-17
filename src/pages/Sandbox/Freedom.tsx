import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  Info,
  User,
  Wallet,
  CreditCard,
  Cake,
  Plus,
  Minus,
  Rocket,
  Percent,
  Banknote,
  Coins,
  Crown,
  Target as TargetIcon,
  Gauge,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { calculateFinancialFreedom, runSimulation } from '@/utils/simulation';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import { calculateTotalAssets, calculateTotalLiabilities } from '@/utils/calculate';

const FREEDOM_COLORS = {
  deepBlue: '#1e3a5f',
  deepBlueDark: '#0f2744',
  gold: '#d4a84b',
  goldLight: '#f0d080',
  goldDark: '#b8922f',
};

interface FreedomProgressRingProps {
  percent: number;
  size?: number;
}

const FreedomProgressRing = ({ percent, size = 240 }: FreedomProgressRingProps) => {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percent));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0 0 20px rgba(212, 168, 75, 0.25))' }}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={FREEDOM_COLORS.goldLight} />
            <stop offset="50%" stopColor={FREEDOM_COLORS.gold} />
            <stop offset="100%" stopColor={FREEDOM_COLORS.goldDark} />
          </linearGradient>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a4a73" />
            <stop offset="100%" stopColor={FREEDOM_COLORS.deepBlue} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#bgGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          opacity={0.1}
        />
      </svg>
    </div>
  );
};

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  icon?: React.ReactNode;
  suffix?: string;
}

const NumberStepper = ({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
  icon,
  suffix,
}: NumberStepperProps) => {
  const handleDecrease = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrease = () => {
    onChange(value + step);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/[^0-9]/g, ''));
    onChange(isNaN(v) ? 0 : v);
  };

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1">
        {icon}
        {label}
      </label>
      <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
        <button
          onClick={handleDecrease}
          className="p-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Minus size={16} className="text-gray-600" />
        </button>
        <div className="flex-1 flex items-center justify-center px-2 py-1.5 bg-white">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            className="w-full text-center text-sm font-semibold text-gray-900 outline-none tabular-nums bg-transparent"
          />
          {suffix && (
            <span className="text-xs text-gray-500 ml-1">{suffix}</span>
          )}
        </div>
        <button
          onClick={handleIncrease}
          className="p-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Plus size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

interface BoostItemProps {
  title: string;
  description: string;
  yearsSaved: number;
  positive?: boolean;
}

const BoostItem = ({ title, description, yearsSaved, positive = true }: BoostItemProps) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-100/80">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          positive ? 'bg-amber-500/15' : 'bg-emerald-500/15'
        }`}
      >
        {positive ? (
          <Rocket size={18} className="text-amber-600" />
        ) : (
          <TrendingUp size={18} className="text-emerald-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-bold" style={{ color: FREEDOM_COLORS.goldDark }}>
          {yearsSaved > 0 ? `-${yearsSaved}` : '—'}
        </p>
        <p className="text-xs text-gray-500">{yearsSaved > 0 ? '年' : ''}</p>
      </div>
    </div>
  );
};

export const SandboxFreedomPage = () => {
  const navigate = useNavigate();

  const assets = useStore((s) => s.assets);
  const liabilities = useStore((s) => s.liabilities);
  const sandbox = useStore((s) => s.sandbox);
  const settings = useStore((s) => s.settings);
  const updateUserProfile = useStore((s) => s.updateUserProfile);
  const updateGlobalParams = useStore((s) => s.updateGlobalParams);

  const activePath = sandbox.paths.find((p) => p.id === sandbox.activePathId);

  const simulationConfig = useMemo(() => {
    const totalAssets = calculateTotalAssets(assets);
    const totalLiabilities = calculateTotalLiabilities(liabilities);
    const netWorth = totalAssets - totalLiabilities;
    const monthlyIncome = sandbox.userProfile.monthlyIncome || 15000;
    const monthlyExpense = sandbox.userProfile.monthlyExpense || 8000;
    return {
      currentNetWorth: netWorth,
      currentTotalAssets: totalAssets,
      currentTotalLiabilities: totalLiabilities,
      currentAnnualIncome: monthlyIncome * 12,
      currentAnnualExpense: monthlyExpense * 12,
      currentMonthlySavings: monthlyIncome - monthlyExpense,
    };
  }, [assets, liabilities, sandbox.userProfile]);

  const effectiveParams = useMemo(() => {
    return { ...sandbox.globalParams, ...(activePath?.params || {}) };
  }, [sandbox.globalParams, activePath?.params]);

  const baseSimulation = useMemo(() => {
    if (!activePath) return [];
    return runSimulation(activePath.events || [], effectiveParams, simulationConfig);
  }, [activePath, effectiveParams, simulationConfig]);

  const freedomResult = useMemo(() => {
    return calculateFinancialFreedom(baseSimulation, effectiveParams, simulationConfig);
  }, [baseSimulation, effectiveParams, simulationConfig]);

  const currentPoint = baseSimulation[0];
  const currentPassiveIncome = currentPoint?.passiveIncome || 0;
  const currentAnnualExpense = currentPoint?.expense || simulationConfig.currentAnnualExpense;
  const freedomFundTarget = currentAnnualExpense * 25;
  const currentGap = Math.max(0, currentAnnualExpense - currentPassiveIncome);
  const baseFreedomAge = freedomResult.freedomAge;

  const calcFreedomAgeForScenario = (
    extraMonthlySaving = 0,
    extraReturnRate = 0
  ): number | undefined => {
    const newConfig = {
      ...simulationConfig,
      currentMonthlySavings: simulationConfig.currentMonthlySavings + extraMonthlySaving,
    };
    const newParams = {
      ...effectiveParams,
      investmentReturnRate: effectiveParams.investmentReturnRate + extraReturnRate,
    };
    const sim = runSimulation(activePath?.events || [], newParams, newConfig);
    for (const point of sim) {
      if (point.isFinanciallyFree) {
        return point.age;
      }
    }
    return undefined;
  };

  const boostScenarios = useMemo(() => {
    const baseAge = baseFreedomAge;
    const calcYearsSaved = (scenarioAge: number | undefined) => {
      if (!baseAge || !scenarioAge) return 0;
      return Math.max(0, baseAge - scenarioAge);
    };

    return {
      save1000: calcYearsSaved(calcFreedomAgeForScenario(1000, 0)),
      save2000: calcYearsSaved(calcFreedomAgeForScenario(2000, 0)),
      save5000: calcYearsSaved(calcFreedomAgeForScenario(5000, 0)),
      return1: calcYearsSaved(calcFreedomAgeForScenario(0, 0.01)),
      return2: calcYearsSaved(calcFreedomAgeForScenario(0, 0.02)),
    };
  }, [baseFreedomAge, effectiveParams, activePath, simulationConfig]);

  const handleMonthlyIncomeChange = (v: number) => {
    updateUserProfile({ monthlyIncome: v });
  };

  const handleMonthlyExpenseChange = (v: number) => {
    updateUserProfile({ monthlyExpense: v });
  };

  const handleCurrentAgeChange = (v: number) => {
    updateUserProfile({ currentAge: v });
    updateGlobalParams({ currentAge: v });
  };

  const coveragePercent = currentAnnualExpense > 0
    ? (currentPassiveIncome / currentAnnualExpense) * 100
    : 0;

  const savingsRatePercent = simulationConfig.currentAnnualIncome > 0
    ? ((simulationConfig.currentMonthlySavings * 12) / simulationConfig.currentAnnualIncome) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="财务自由仪表盘" showBack />
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* 顶部大卡片 */}
        <Card
          padding="lg"
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${FREEDOM_COLORS.deepBlue} 0%, ${FREEDOM_COLORS.deepBlueDark} 100%)`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: FREEDOM_COLORS.gold, transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5"
            style={{ background: FREEDOM_COLORS.gold, transform: 'translate(-20%, 20%)' }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <FreedomProgressRing percent={freedomResult.freedomIndex} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-5xl font-bold tabular-nums"
                  style={{ color: FREEDOM_COLORS.gold }}
                >
                  {freedomResult.freedomIndex}
                </span>
                <span className="text-sm text-gray-300 mt-0.5">%</span>
              </div>
            </div>
            <p
              className="text-center mt-4 text-lg font-semibold"
              style={{ color: FREEDOM_COLORS.goldLight }}
            >
              你已走完 {freedomResult.freedomIndex}% 的财务自由之路
            </p>
            <p className="text-center text-sm text-gray-400 mt-1">
              {freedomResult.freedomIndex >= 100
                ? '🎉 恭喜你，你已经实现财务自由！'
                : freedomResult.tip || '坚持储蓄，合理投资，自由就在前方'}
            </p>
            {freedomResult.freedomIndex >= 100 && (
              <div
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(212, 168, 75, 0.2)', color: FREEDOM_COLORS.goldLight }}
              >
                <Crown size={14} />
                <span className="text-xs font-medium">财务自由达成</span>
              </div>
            )}
          </div>
        </Card>

        {/* 自由指数解释卡 */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${FREEDOM_COLORS.deepBlue}15%` }}
            >
              <Gauge size={16} style={{ color: FREEDOM_COLORS.deepBlue }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">自由指数明细</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50/50 border border-amber-100/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${FREEDOM_COLORS.gold}20%` }}
                >
                  <Coins size={16} style={{ color: FREEDOM_COLORS.goldDark }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">当前被动收入</p>
                  <p className="text-xs text-gray-400">（年度）</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-gray-900 tabular-nums">
                  {formatCurrency(currentPassiveIncome, settings.currency, 0)}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: FREEDOM_COLORS.goldDark }}
                >
                  {formatPercent(coveragePercent)} 覆盖
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-200/60 flex items-center justify-center">
                  <Banknote size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">当前年度支出</p>
                  <p className="text-xs text-gray-400">（含预计）</p>
                </div>
              </div>
              <p className="text-base font-bold text-gray-900 tabular-nums">
                {formatCurrency(currentAnnualExpense, settings.currency, 0)}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50/50 border border-rose-100/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <TargetIcon size={16} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">还差多少</p>
                  <p className="text-xs text-gray-400">（年度被动收入缺口）</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-rose-600 tabular-nums">
                  {currentGap > 0 ? formatCurrency(currentGap, settings.currency, 0) : '—'}
                </p>
                <p className="text-xs text-gray-400">
                  {currentGap === 0 ? '已达成' : '/年'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 财务自由预估 */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${FREEDOM_COLORS.deepBlue}15%` }}
            >
              <Calendar size={16} style={{ color: FREEDOM_COLORS.deepBlue }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">财务自由预估</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div
              className="text-center p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${FREEDOM_COLORS.deepBlue}08 0%, ${FREEDOM_COLORS.deepBlue}15 100%)`,
              }}
            >
              <div
                className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                style={{ background: `${FREEDOM_COLORS.deepBlue}15%` }}
              >
                <Cake size={18} style={{ color: FREEDOM_COLORS.deepBlue }} />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">预计自由年龄</p>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: FREEDOM_COLORS.deepBlue }}
              >
                {baseFreedomAge ? `${baseFreedomAge}岁` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {baseFreedomAge
                  ? `还需${baseFreedomAge - effectiveParams.currentAge}年`
                  : '未能达成'}
              </p>
            </div>

            <div
              className="text-center p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${FREEDOM_COLORS.gold}08 0%, ${FREEDOM_COLORS.gold}18 100%)`,
              }}
            >
              <div
                className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                style={{ background: `${FREEDOM_COLORS.gold}20%` }}
              >
                <Crown size={18} style={{ color: FREEDOM_COLORS.goldDark }} />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">自由时净资产</p>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: FREEDOM_COLORS.goldDark }}
              >
                {freedomResult.freedomNetWorth
                  ? formatNumber(freedomResult.freedomNetWorth / 10000, 1) + '万'
                  : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {freedomResult.freedomNetWorth ? '元' : ''}
              </p>
            </div>

            <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                <Target size={18} className="text-gray-700" />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">自由基金倍数</p>
              <p className="text-xl font-bold text-gray-800 tabular-nums">25×</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatCurrency(freedomFundTarget, settings.currency, 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* 加速自由 */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${FREEDOM_COLORS.gold}20%` }}
              >
                <Rocket size={16} style={{ color: FREEDOM_COLORS.goldDark }} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">加速自由</h3>
            </div>
            <span className="text-xs text-gray-400">提前达成</span>
          </div>
          <div className="space-y-2.5">
            <BoostItem
              title="每月多储蓄 1,000 元"
              description={`当前月储蓄 +¥1,000，年增储蓄¥12,000`}
              yearsSaved={boostScenarios.save1000}
            />
            <BoostItem
              title="每月多储蓄 2,000 元"
              description={`当前月储蓄 +¥2,000，年增储蓄¥24,000`}
              yearsSaved={boostScenarios.save2000}
            />
            <BoostItem
              title="每月多储蓄 5,000 元"
              description={`当前月储蓄 +¥5,000，年增储蓄¥60,000`}
              yearsSaved={boostScenarios.save5000}
            />
            <div className="my-3 border-t border-gray-100" />
            <BoostItem
              title="投资回报率提高 1%"
              description={`年化收益从 ${(effectiveParams.investmentReturnRate * 100).toFixed(1)}% → ${(effectiveParams.investmentReturnRate * 100 + 1).toFixed(1)}%`}
              yearsSaved={boostScenarios.return1}
              positive={false}
            />
            <BoostItem
              title="投资回报率提高 2%"
              description={`年化收益从 ${(effectiveParams.investmentReturnRate * 100).toFixed(1)}% → ${(effectiveParams.investmentReturnRate * 100 + 2).toFixed(1)}%`}
              yearsSaved={boostScenarios.return2}
              positive={false}
            />
          </div>
        </Card>

        {/* 用户配置卡 */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${FREEDOM_COLORS.deepBlue}15%` }}
            >
              <User size={16} style={{ color: FREEDOM_COLORS.deepBlue }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">快速调整参数</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberStepper
              label="月收入"
              icon={<Wallet size={12} className="text-emerald-600" />}
              value={sandbox.userProfile.monthlyIncome || 0}
              onChange={handleMonthlyIncomeChange}
              step={1000}
              min={0}
              suffix="元"
            />
            <NumberStepper
              label="月支出"
              icon={<CreditCard size={12} className="text-rose-600" />}
              value={sandbox.userProfile.monthlyExpense || 0}
              onChange={handleMonthlyExpenseChange}
              step={500}
              min={0}
              suffix="元"
            />
            <NumberStepper
              label="当前年龄"
              icon={<Cake size={12} style={{ color: FREEDOM_COLORS.deepBlue }} />}
              value={sandbox.userProfile.currentAge}
              onChange={handleCurrentAgeChange}
              step={1}
              min={18}
              suffix="岁"
            />
          </div>
          <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 flex items-start gap-2">
              <Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span>
                当前月储蓄：
                <span className="font-semibold text-gray-700">
                  {formatCurrency(simulationConfig.currentMonthlySavings, settings.currency, 0)}
                </span>
                <span className="mx-1">（</span>
                <span
                  className="font-semibold"
                  style={{ color: FREEDOM_COLORS.goldDark }}
                >
                  {savingsRatePercent.toFixed(1)}%
                </span>
                <span>储蓄率）</span>
              </span>
            </p>
          </div>
        </Card>

        {/* 自由定义 */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${FREEDOM_COLORS.gold}20%` }}
            >
              <Info size={16} style={{ color: FREEDOM_COLORS.goldDark }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">自由的定义</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: `${FREEDOM_COLORS.deepBlue}15%` }}
                >
                  <Percent size={12} style={{ color: FREEDOM_COLORS.deepBlue }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: FREEDOM_COLORS.deepBlue }}>
                  4% 法则
                </p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                由麻省理工学院学者 William Bengen 在 1994 年提出的经典退休提取策略：
                <span className="font-medium text-gray-800">退休后每年从投资组合中提取 4%</span>
                用于生活开销，投资组合在 30 年内不会枯竭。该法则假设投资组合由 50% 股票 + 50% 债券构成。
              </p>
            </div>

            <div
              className="p-3 rounded-xl border border-gray-100"
              style={{
                background: `linear-gradient(135deg, ${FREEDOM_COLORS.gold}06 0%, ${FREEDOM_COLORS.gold}12 100%)`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: `${FREEDOM_COLORS.gold}20%` }}
                >
                  <Target size={12} style={{ color: FREEDOM_COLORS.goldDark }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: FREEDOM_COLORS.goldDark }}>
                  25 倍年支出
                </p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                4% 法则的推论：当你的
                <span className="font-medium text-gray-800">投资资产达到年支出的 25 倍</span>
                时，按 4% 提取率可以覆盖全部生活支出。
                <span className="font-medium" style={{ color: FREEDOM_COLORS.goldDark }}>
                  {formatCurrency(freedomFundTarget, settings.currency, 0)}
                </span>
                是你的财务自由目标金额。
              </p>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-gray-200/80 flex items-center justify-center">
                  <Sparkles size={12} className="text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">自由指数计算</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                自由指数 = <span className="font-medium text-gray-800">当前被动收入 ÷ 当前年度支出 × 100%</span>
                。指数越高，代表被动收入越能覆盖日常开销。当指数达到
                <span className="font-medium" style={{ color: FREEDOM_COLORS.goldDark }}>105%</span>
                ，即达成财务自由。
              </p>
            </div>
          </div>
        </Card>

        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3.5 rounded-xl font-medium text-white transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${FREEDOM_COLORS.deepBlue} 0%, ${FREEDOM_COLORS.deepBlueDark} 100%)`,
          }}
        >
          返回沙盘
        </button>
      </div>
    </div>
  );
};
