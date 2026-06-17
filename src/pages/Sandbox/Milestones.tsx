import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Award, Target, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/utils/format';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export const SandboxMilestonesPage = () => {
  const navigate = useNavigate();
  const milestones = useStore((s) => s.sandbox.milestones);
  const refreshMilestones = useStore((s) => s.refreshMilestones);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const stats = useMemo(() => {
    const total = milestones.length;
    const achieved = milestones.filter((m) => m.achieved).length;
    const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;

    const achievedMilestones = milestones
      .filter((m) => m.achieved && m.achievedDate)
      .sort((a, b) => (b.achievedDate || '').localeCompare(a.achievedDate || ''));
    const latest = achievedMilestones[0];

    return { total, achieved, rate, latest };
  }, [milestones]);

  const allAchieved = stats.total > 0 && stats.achieved === stats.total;

  useEffect(() => {
    if (allAchieved) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [allAchieved]);

  const handleRefresh = async () => {
    setRefreshing(true);
    refreshMilestones();
    setTimeout(() => setRefreshing(false), 800);
  };

  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const ageA = a.achieved ? a.achievedAge || 0 : a.predictedAge || 999;
      const ageB = b.achieved ? b.achievedAge || 0 : b.predictedAge || 999;
      return ageA - ageB;
    });
  }, [milestones]);

  return (
    <div className="pb-24 min-h-screen bg-gray-50 relative overflow-hidden">
      {showConfetti && <Confetti />}

      <Header
        title="里程碑墙"
        showBack
        rightContent={
          <button
            onClick={handleRefresh}
            className={cn(
              'p-2 -mr-2 rounded-full active:bg-gray-100 transition-all',
              refreshing && 'animate-spin'
            )}
          >
            <RefreshCw size={22} className="text-gray-700" />
          </button>
        }
      />

      <div className="max-w-md mx-auto">
        {allAchieved && (
          <div className="mx-5 mt-4 mb-2">
            <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200 overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles size={22} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">🎉 恭喜！全部里程碑已达成！</p>
                  <p className="text-xs text-amber-600 mt-1">
                    你已经完成了所有人生财务目标，享受美好生活吧！
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4f7c] mx-5 mt-4 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-400" />
              <p className="text-sm font-medium text-white/80">里程碑总览</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-amber-300 font-medium">
              达成率 {stats.rate}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-white/60">已达成 / 总数</p>
              <p className="text-2xl font-bold mt-1 tabular-nums">
                <span className="text-amber-400">{stats.achieved}</span>
                <span className="text-white/50 text-lg mx-1">/</span>
                <span className="text-white/80 text-xl">{stats.total}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">进度</p>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-700"
                  style={{ width: `${stats.rate}%` }}
                />
              </div>
            </div>
          </div>

          {stats.latest ? (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/60 mb-2">最近达成</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0 text-xl">
                  {stats.latest.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{stats.latest.name}</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {formatDate(stats.latest.achievedDate)}
                    {stats.latest.achievedAge && ` · ${stats.latest.achievedAge}岁`}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-amber-400 text-[#1e3a5f] text-xs font-bold">
                  ✅ 达成
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/50">
                <Target size={16} />
                <p className="text-xs">还没有达成里程碑，继续加油！</p>
              </div>
            </div>
          )}
        </div>

        <div className="mx-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#d4a84b]" />
              里程碑卡片
            </h2>
            <span className="text-xs text-gray-400">{milestones.length} 项</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {milestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </div>

        <div className="mx-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#1e3a5f]" />
              时间线
            </h2>
            <span className="text-xs text-gray-400">按年龄排序</span>
          </div>

          <Card className="pb-5">
            <div className="relative">
              <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-amber-300 via-amber-200 to-gray-200" />

              <div className="space-y-5 pt-2">
                {sortedMilestones.map((milestone, index) => {
                  const displayAge = milestone.achieved
                    ? milestone.achievedAge
                    : milestone.predictedAge;
                  const isLast = index === sortedMilestones.length - 1;

                  return (
                    <div key={milestone.id} className="relative flex gap-4 pl-1">
                      <div className="relative z-10 flex flex-col items-center pt-1">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all',
                            milestone.achieved
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 shadow-md shadow-amber-200/50'
                              : 'bg-white border-gray-300 opacity-70'
                          )}
                        >
                          {milestone.achieved ? (
                            milestone.icon
                          ) : (
                            <span className="grayscale opacity-60">{milestone.icon}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              milestone.achieved ? 'text-gray-900' : 'text-gray-500'
                            )}
                          >
                            {milestone.name}
                          </p>
                          {milestone.achieved ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium flex items-center gap-1">
                              ✅ {milestone.achievedAge}岁达成
                            </span>
                          ) : displayAge ? (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                              预计 {displayAge}岁
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-medium">
                              待规划
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-xs mt-1',
                            milestone.achieved ? 'text-gray-500' : 'text-gray-400'
                          )}
                        >
                          {milestone.description}
                        </p>
                        {milestone.achieved && milestone.achievedDate && (
                          <p className="text-[11px] text-amber-600 mt-1">
                            {formatDate(milestone.achievedDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <div className="mx-5 mt-6 mb-6">
          <Button fullWidth variant="secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw
              size={16}
              className={cn('mr-2', refreshing && 'animate-spin')}
            />
            {refreshing ? '检测中...' : '重新检测里程碑'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MilestoneCardProps {
  milestone: ReturnType<typeof useStore.getState>['sandbox']['milestones'][number];
}

function MilestoneCard({ milestone }: MilestoneCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        milestone.achieved
          ? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 to-white shadow-amber-100/50 shadow-md'
          : 'opacity-60'
      )}
      padding="sm"
    >
      {milestone.achieved && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
            <span className="text-[10px]">✅</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3',
          milestone.achieved
            ? 'bg-gradient-to-br from-amber-100 to-amber-50'
            : 'bg-gray-100 grayscale'
        )}
      >
        {milestone.icon}
      </div>

      <p
        className={cn(
          'text-sm font-semibold mb-1 pr-7',
          milestone.achieved ? 'text-gray-900' : 'text-gray-500'
        )}
      >
        {milestone.name}
      </p>

      <p
        className={cn(
          'text-xs leading-relaxed line-clamp-2 min-h-[32px]',
          milestone.achieved ? 'text-gray-500' : 'text-gray-400'
        )}
      >
        {milestone.description}
      </p>

      <div className="mt-3 pt-3 border-t border-gray-100">
        {milestone.achieved ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">达成年龄</span>
              <span className="text-xs font-bold text-amber-600 tabular-nums">
                {milestone.achievedAge}岁
              </span>
            </div>
            {milestone.achievedDate && (
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {formatDate(milestone.achievedDate)}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">预计年龄</span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                milestone.predictedAge ? 'text-gray-600' : 'text-gray-400'
              )}
            >
              {milestone.predictedAge ? `${milestone.predictedAge}岁达成` : '待规划'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 8,
        color: ['#d4a84b', '#f59e0b', '#1e3a5f', '#10b981', '#ef4444', '#8b5cf6'][
          Math.floor(Math.random() * 6)
        ],
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
