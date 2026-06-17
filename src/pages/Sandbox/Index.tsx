import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Edit2, Trash2, Copy, BarChart3, Award, GitCompare, X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LifeTimeline } from '@/components/sandbox/LifeTimeline';
import { PathChart } from '@/components/sandbox/PathChart';
import { AddEventModal } from '@/components/sandbox/AddEventModal';
import { getPathKeyMetrics } from '@/utils/simulation';
import { formatCurrency } from '@/utils/format';
import { getEventTemplate } from '@/constants/lifeSandbox';
import { LifeEvent } from '@/types';
import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  color?: 'blue' | 'gold' | 'green' | 'red' | 'gray';
  className?: string;
}

const Tag = ({ children, color = 'blue', className = '' }: TagProps) => {
  const colors = {
    blue: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20',
    gold: 'bg-[#d4a84b]/15 text-[#b8922f] border-[#d4a84b]/30',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      colors[color],
      className
    )}>
      {children}
    </span>
  );
};

interface PathMenuState {
  pathId: string;
  x: number;
  y: number;
}

type ModalMode = 'add' | 'edit';

export const SandboxIndexPage = () => {
  const navigate = useNavigate();

  const sandbox = useStore((s) => s.sandbox);
  const activePathId = sandbox.activePathId;
  const activePath = sandbox.paths.find((p) => p.id === activePathId);
  const globalParams = sandbox.globalParams;

  const runAllSimulations = useStore((s) => s.runAllSimulations);
  const simulatePath = useStore((s) => s.simulatePath);
  const setActivePath = useStore((s) => s.setActivePath);
  const addLifePath = useStore((s) => s.addLifePath);
  const updateLifePath = useStore((s) => s.updateLifePath);
  const deleteLifePath = useStore((s) => s.deleteLifePath);
  const addLifeEvent = useStore((s) => s.addLifeEvent);
  const updateLifeEvent = useStore((s) => s.updateLifeEvent);
  const deleteLifeEvent = useStore((s) => s.deleteLifeEvent);

  const [compareMode, setCompareMode] = useState(false);
  const [pathMenu, setPathMenu] = useState<PathMenuState | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [defaultAge, setDefaultAge] = useState(globalParams.currentAge);
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editingPathName, setEditingPathName] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runAllSimulations();
  }, [runAllSimulations]);

  useEffect(() => {
    if (activePathId && activePath?.simulation.length === 0) {
      simulatePath(activePathId);
    }
  }, [activePathId, activePath, simulatePath]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPathMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const metrics = activePath ? getPathKeyMetrics(activePath.simulation) : null;
  const currentSimPoint = activePath?.simulation?.[0];
  const retirementSimPoint = activePath?.simulation?.find(
    (p) => p.age === globalParams.retirementAge
  ) || activePath?.simulation?.[activePath.simulation.length - 1];

  const handlePathClick = (pathId: string) => {
    if (pathId !== activePathId) {
      setActivePath(pathId);
      simulatePath(pathId);
    }
  };

  const handleAddPath = () => {
    const newPath = addLifePath(`新路径 ${sandbox.paths.length + 1}`);
    simulatePath(newPath.id);
  };

  const handlePathMenu = (e: React.MouseEvent, pathId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPathMenu({
      pathId,
      x: rect.right,
      y: rect.bottom + 4,
    });
  };

  const handleLongPress = (pathId: string) => {
    return (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setPathMenu({
        pathId,
        x: clientX,
        y: clientY + 8,
      });
    };
  };

  const handleRenamePath = (pathId: string) => {
    const path = sandbox.paths.find((p) => p.id === pathId);
    if (path) {
      setEditingPathId(pathId);
      setEditingPathName(path.name);
    }
    setPathMenu(null);
  };

  const handleConfirmRename = () => {
    if (editingPathId && editingPathName.trim()) {
      updateLifePath(editingPathId, { name: editingPathName.trim() });
    }
    setEditingPathId(null);
    setEditingPathName('');
  };

  const handleClonePath = (pathId: string) => {
    const path = sandbox.paths.find((p) => p.id === pathId);
    if (path) {
      const newPath = addLifePath(`${path.name} 副本`, undefined, pathId);
      simulatePath(newPath.id);
    }
    setPathMenu(null);
  };

  const handleDeletePath = (pathId: string) => {
    if (sandbox.paths.length <= 1) {
      alert('至少保留一条路径');
      setPathMenu(null);
      return;
    }
    if (confirm('确定要删除这条路径吗？')) {
      deleteLifePath(pathId);
    }
    setPathMenu(null);
  };

  const handleEventClick = (eventId: string) => {
    if (!activePath) return;
    const event = activePath.events.find((e) => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setModalMode('edit');
      setDefaultAge(event.age);
      setEventModalOpen(true);
    }
  };

  const handleAddEventAtAge = (age: number) => {
    setEditingEvent(null);
    setModalMode('add');
    setDefaultAge(age);
    setEventModalOpen(true);
  };

  const handleSubmitEvent = (eventData: Omit<LifeEvent, 'id'>) => {
    if (!activePathId) return;
    if (modalMode === 'edit' && editingEvent) {
      updateLifeEvent(activePathId, editingEvent.id, eventData);
    } else {
      addLifeEvent(activePathId, eventData);
    }
    setEventModalOpen(false);
    setEditingEvent(null);
    setTimeout(() => simulatePath(activePathId), 50);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!activePathId) return;
    if (confirm('确定要删除这个事件吗？')) {
      deleteLifeEvent(activePathId, eventId);
      setEventModalOpen(false);
      setEditingEvent(null);
      setTimeout(() => simulatePath(activePathId), 50);
    }
  };

  const handleEditEventFromList = (event: LifeEvent) => {
    setEditingEvent(event);
    setModalMode('edit');
    setDefaultAge(event.age);
    setEventModalOpen(true);
  };

  const handleTogglePathVisibility = useCallback((_pathId: string) => {
  }, []);

  const sortedEvents = activePath
    ? [...activePath.events].sort((a, b) => a.age - b.age)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2744] via-[#1e3a5f]/10 to-gray-50">
      <Header
        title="人生沙盘"
        showBack
        rightContent={
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/profile/report')}
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              title="财务自由仪表盘"
            >
              <BarChart3 size={18} className="text-[#1e3a5f]" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              title="里程碑墙"
            >
              <Award size={18} className="text-[#d4a84b]" />
            </button>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={cn(
                'p-2 rounded-full transition-colors',
                compareMode
                  ? 'bg-[#d4a84b]/20 active:bg-[#d4a84b]/30'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              )}
              title="对比模式"
            >
              <GitCompare
                size={18}
                className={compareMode ? 'text-[#d4a84b]' : 'text-gray-600'}
              />
            </button>
          </div>
        }
      />

      <div className="max-w-md mx-auto pb-24">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#d4a84b]" />
              人生路径
            </h2>
            <span className="text-xs text-white/60">
              {sandbox.paths.length} 条路径
            </span>
          </div>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {sandbox.paths.map((path) => {
                const isActive = path.id === activePathId;
                const isEditing = editingPathId === path.id;
                let pressTimer: ReturnType<typeof setTimeout> | null = null;

                return (
                  <div
                    key={path.id}
                    className={cn(
                      'relative flex-shrink-0 w-36 rounded-2xl p-3 transition-all duration-200 border-2',
                      isActive
                        ? 'bg-[#0f2744] border-[#d4a84b] shadow-lg shadow-[#d4a84b]/20'
                        : 'bg-white/10 border-white/10 backdrop-blur-sm'
                    )}
                    onClick={() => !isEditing && handlePathClick(path.id)}
                    onMouseDown={() => {
                      pressTimer = setTimeout(() => {
                        handleLongPress(path.id);
                      }, 500);
                    }}
                    onMouseUp={() => {
                      if (pressTimer) clearTimeout(pressTimer);
                    }}
                    onMouseLeave={() => {
                      if (pressTimer) clearTimeout(pressTimer);
                    }}
                    onTouchStart={() => {
                      pressTimer = setTimeout(() => {
                        handleLongPress(path.id);
                      }, 500);
                    }}
                    onTouchEnd={() => {
                      if (pressTimer) clearTimeout(pressTimer);
                    }}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingPathName}
                          onChange={(e) => setEditingPathName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename();
                            if (e.key === 'Escape') {
                              setEditingPathId(null);
                              setEditingPathName('');
                            }
                          }}
                          autoFocus
                          className="flex-1 min-w-0 px-2 py-1 text-xs rounded bg-white/10 text-white border border-[#d4a84b]/50 focus:outline-none focus:border-[#d4a84b]"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmRename();
                          }}
                          className="p-1 rounded-full bg-[#d4a84b] text-[#0f2744]"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPathId(null);
                            setEditingPathName('');
                          }}
                          className="p-1 rounded-full bg-white/10 text-white/70"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white/30"
                              style={{ backgroundColor: path.color }}
                            />
                            <span
                              className={cn(
                                'text-sm font-semibold truncate',
                                isActive ? 'text-white' : 'text-white/90'
                              )}
                            >
                              {path.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handlePathMenu(e, path.id)}
                            className="p-1 -mr-1 -mt-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
                          >
                            <MoreVertical
                              size={14}
                              className={isActive ? 'text-white/70' : 'text-white/50'}
                            />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag color={isActive ? 'gold' : 'gray'}>
                            {path.events.length} 事件
                          </Tag>
                          {path.isDefault && (
                            <Tag color="blue">默认</Tag>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleAddPath}
                className="flex-shrink-0 w-20 rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-1 py-3 hover:border-[#d4a84b]/60 hover:bg-white/5 transition-all active:scale-[0.97]"
              >
                <div className="w-8 h-8 rounded-full bg-[#d4a84b]/20 flex items-center justify-center">
                  <Plus size={16} className="text-[#d4a84b]" />
                </div>
                <span className="text-xs text-white/70">新增</span>
              </button>
            </div>

            {pathMenu && (
              <div
                ref={menuRef}
                className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-36"
                style={{
                  left: Math.min(pathMenu.x, window.innerWidth - 150),
                  top: Math.min(pathMenu.y, window.innerHeight - 180),
                }}
              >
                <button
                  onClick={() => handleRenamePath(pathMenu.pathId)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 size={14} />
                  重命名
                </button>
                <button
                  onClick={() => handleClonePath(pathMenu.pathId)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                >
                  <Copy size={14} />
                  克隆路径
                </button>
                <button
                  onClick={() => handleDeletePath(pathMenu.pathId)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                >
                  <Trash2 size={14} />
                  删除路径
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 mt-4">
          <Card className="overflow-hidden !p-0">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#d4a84b]" />
                人生时间轴
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddEventAtAge(globalParams.currentAge)}
              >
                <Plus size={14} className="mr-1" />
                添加事件
              </Button>
            </div>
            <div className="px-4 pb-4">
              <LifeTimeline
                events={activePath?.events || []}
                currentAge={globalParams.currentAge}
                lifeExpectancy={globalParams.lifeExpectancy}
                onEventClick={handleEventClick}
                onAddEventAtAge={handleAddEventAtAge}
              />
            </div>
          </Card>
        </div>

        <div className="px-4 mt-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#1e3a5f]" />
                净资产趋势
              </h3>
              {compareMode && (
                <Tag color="gold">对比模式</Tag>
              )}
            </div>
            <PathChart
              paths={sandbox.paths}
              activePathId={activePathId}
              compareMode={compareMode}
              onTogglePath={handleTogglePathVisibility}
            />
          </Card>
        </div>

        <div className="px-4 mt-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#d4a84b]" />
              关键指标
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-gradient-to-br from-[#1e3a5f] to-[#0f2744]">
                <div className="text-[11px] text-white/60 mb-1">当前年龄</div>
                <div className="text-xl font-bold text-white">
                  {globalParams.currentAge}
                  <span className="text-xs font-normal text-white/60 ml-1">岁</span>
                </div>
              </div>

              <div className="rounded-xl p-3 bg-gradient-to-br from-[#d4a84b] to-[#b8922f]">
                <div className="text-[11px] text-white/80 mb-1">财务自由</div>
                <div className="text-xl font-bold text-white">
                  {metrics?.freedomAge ? (
                    <>
                      {metrics.freedomAge}
                      <span className="text-xs font-normal text-white/80 ml-1">岁</span>
                    </>
                  ) : (
                    <span className="text-sm">未达成</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <div className="text-[11px] text-gray-500 mb-1">当前净资产</div>
                <div className="text-lg font-bold text-[#1e3a5f]">
                  {currentSimPoint
                    ? formatCurrency(currentSimPoint.netWorth, 'CNY', 0)
                    : '-'}
                </div>
              </div>

              <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <div className="text-[11px] text-gray-500 mb-1">退休时净资产</div>
                <div className="text-lg font-bold text-[#1e3a5f]">
                  {retirementSimPoint
                    ? formatCurrency(retirementSimPoint.netWorth, 'CNY', 0)
                    : '-'}
                </div>
              </div>

              <div className="rounded-xl p-3 bg-red-50 border border-red-100">
                <div className="text-[11px] text-red-500 mb-1">最大负债</div>
                <div className="text-lg font-bold text-red-600">
                  {metrics
                    ? formatCurrency(metrics.maxLiabilities, 'CNY', 0)
                    : '-'}
                </div>
              </div>

              <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-100">
                <div className="text-[11px] text-emerald-600 mb-1">平均年储蓄</div>
                <div className="text-lg font-bold text-emerald-700">
                  {metrics
                    ? formatCurrency(metrics.avgAnnualSavings, 'CNY', 0)
                    : '-'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="px-4 mt-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#1e3a5f]" />
                人生事件
                <span className="text-xs font-normal text-gray-400">
                  ({sortedEvents.length})
                </span>
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAddEventAtAge(globalParams.currentAge)}
              >
                <Plus size={14} />
              </Button>
            </div>

            {sortedEvents.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm text-gray-500 mb-3">还没有人生事件</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddEventAtAge(globalParams.currentAge)}
                >
                  添加第一个事件
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedEvents.map((event, index) => {
                  const template = getEventTemplate(event.type);
                  const nextEvent = sortedEvents[index + 1];
                  const showAgeDivider = !nextEvent || nextEvent.age !== event.age;

                  return (
                    <div key={event.id}>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border-2 border-white shadow-sm"
                            style={{ backgroundColor: `${template?.color}15` }}
                          >
                            {template?.icon || '✨'}
                          </div>
                          {showAgeDivider && index < sortedEvents.length - 1 && (
                            <div className="flex-1 w-0.5 bg-gray-100 my-1 min-h-[12px]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <Tag color="gold">{event.age}岁</Tag>
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {event.name}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {event.description || template?.description || ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEditEventFromList(event)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1e3a5f] transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="h-8" />
      </div>

      <AddEventModal
        open={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmitEvent}
        defaultAge={defaultAge}
      />

      {modalMode === 'edit' && editingEvent && eventModalOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
          <div className="max-w-md mx-auto">
            <Button
              variant="danger"
              fullWidth
              onClick={() => handleDeleteEvent(editingEvent.id)}
            >
              <Trash2 size={16} className="mr-2" />
              删除此事件
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SandboxIndexPage;
