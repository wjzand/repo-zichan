import { useEffect, useRef, useState } from 'react';
import { LifePath, SimulationParams, YearlySimulationPoint } from '@/types';
import { DEFAULT_PARAMS } from '@/constants/lifeSandbox';

interface PathChartProps {
  paths: LifePath[];
  activePathId: string;
  compareMode: boolean;
  onTogglePath: (pathId: string) => void;
  height?: number;
}

const DEEP_BLUE = '#1e3a5f';
const GOLD = '#d4a84b';
const LIGHT_GOLD = '#f5d78e';
const GRID_COLOR = 'rgba(30, 58, 95, 0.1)';
const TEXT_COLOR = '#4b5563';
const TEXT_LIGHT = '#9ca3af';

const formatNetWorth = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  if (abs >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return value.toFixed(0);
};

const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
};

const getEffectiveParams = (path: LifePath): SimulationParams => {
  return { ...DEFAULT_PARAMS, ...path.params };
};

export const PathChart = ({
  paths,
  activePathId,
  compareMode,
  onTogglePath,
  height = 360,
}: PathChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hiddenPaths, setHiddenPaths] = useState<Set<string>>(new Set());
  const animationRef = useRef<number>();

  const togglePathVisibility = (pathId: string) => {
    if (pathId === activePathId && !compareMode) return;
    setHiddenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathId)) {
        next.delete(pathId);
      } else {
        next.add(pathId);
      }
      return next;
    });
    onTogglePath(pathId);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 24, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const visiblePaths = compareMode
      ? paths.filter((p) => !hiddenPaths.has(p.id))
      : paths.filter((p) => p.id === activePathId);

    if (visiblePaths.length === 0) return;

    const activePath = paths.find((p) => p.id === activePathId);
    const activeParams = activePath ? getEffectiveParams(activePath) : DEFAULT_PARAMS;
    const { currentAge, retirementAge, lifeExpectancy } = activeParams;

    const allNetWorths: number[] = [];
    visiblePaths.forEach((path) => {
      path.simulation.forEach((point) => {
        allNetWorths.push(point.netWorth);
      });
    });

    const rawMin = Math.min(...allNetWorths, 0);
    const rawMax = Math.max(...allNetWorths, 0);
    const range = rawMax - rawMin || 1;
    const paddingValue = range * 0.1;
    const minValue = rawMin - paddingValue;
    const maxValue = rawMax + paddingValue;
    const valueRange = maxValue - minValue || 1;

    const ageToX = (age: number) => {
      const ratio = (age - currentAge) / (lifeExpectancy - currentAge);
      return padding.left + chartWidth * ratio;
    };

    const valueToY = (value: number) => {
      const ratio = (value - minValue) / valueRange;
      return padding.top + chartHeight - chartHeight * ratio;
    };

    const drawChart = (progress: number) => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const gridLines = 5;
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight * i) / gridLines;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const value = maxValue - (valueRange * i) / gridLines;
        ctx.fillStyle = TEXT_LIGHT;
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatNetWorth(value), padding.left - 8, y);
      }

      const ageStep = Math.ceil((lifeExpectancy - currentAge) / 8);
      ctx.fillStyle = TEXT_LIGHT;
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let age = currentAge; age <= lifeExpectancy; age += ageStep) {
        const x = ageToX(age);
        ctx.fillText(`${age}岁`, x, height - padding.bottom + 8);
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();
      }
      const lastX = ageToX(lifeExpectancy);
      ctx.fillText(`${lifeExpectancy}岁`, lastX, height - padding.bottom + 8);

      const currentAgeX = ageToX(currentAge);
      ctx.strokeStyle = DEEP_BLUE;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(currentAgeX, padding.top);
      ctx.lineTo(currentAgeX, padding.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = DEEP_BLUE;
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('当前', currentAgeX, padding.top - 4);

      if (retirementAge > currentAge && retirementAge <= lifeExpectancy) {
        const retirementX = ageToX(retirementAge);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(retirementX, padding.top);
        ctx.lineTo(retirementX, padding.top + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = GOLD;
        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${retirementAge}岁 退休`, retirementX, padding.top - 4);
      }

      visiblePaths.forEach((path) => {
        const isActive = path.id === activePathId;
        const lineWidth = isActive ? 3 : 1.5;
        const opacity = isActive ? 1 : compareMode ? 0.6 : 1;
        const sim = path.simulation;

        if (sim.length === 0) return;

        const visiblePoints = Math.ceil(sim.length * progress);

        if (visiblePoints > 1) {
          ctx.beginPath();
          ctx.moveTo(ageToX(sim[0].age), valueToY(sim[0].netWorth));
          for (let i = 1; i < visiblePoints; i++) {
            const p = sim[i];
            ctx.lineTo(ageToX(p.age), valueToY(p.netWorth));
          }
          ctx.strokeStyle = isActive ? path.color : path.color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (isActive) {
          for (let i = 0; i < visiblePoints; i++) {
            const p = sim[i];
            if (p.isFinanciallyFree) {
              const sx = ageToX(p.age);
              const sy = valueToY(p.netWorth);
              ctx.fillStyle = GOLD;
              ctx.strokeStyle = LIGHT_GOLD;
              ctx.lineWidth = 1.5;
              drawStar(ctx, sx, sy, 5, 9, 4);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = GOLD;
              ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(`★ ${p.age}岁自由`, sx, sy - 14);
              break;
            }
          }
        }
      });

      ctx.strokeStyle = DEEP_BLUE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);
      ctx.lineTo(width - padding.right, padding.top + chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, padding.top + chartHeight);
      ctx.stroke();

      ctx.fillStyle = DEEP_BLUE;
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.save();
      ctx.translate(14, padding.top + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('净资产', 0, 0);
      ctx.restore();

      ctx.fillStyle = DEEP_BLUE;
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('年龄', width - padding.right - chartWidth / 2, height - 8);
    };

    let start = 0;
    const duration = 800;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      drawChart(eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [paths, activePathId, compareMode, hiddenPaths, height]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
      {paths.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center mt-3 px-4">
          {paths.map((path) => {
            const isActive = path.id === activePathId;
            const isHidden = hiddenPaths.has(path.id);
            const showInactive = compareMode ? !isHidden : isActive;
            return (
              <button
                key={path.id}
                onClick={() => togglePathVisibility(path.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-sm'
                    : compareMode
                    ? isHidden
                      ? 'border-gray-200 bg-gray-50 text-gray-400 line-through'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-50 text-gray-400'
                }`}
                style={{
                  opacity: showInactive ? 1 : 0.5,
                }}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white"
                  style={{
                    backgroundColor: path.color,
                    boxShadow: isActive ? `0 0 0 1px ${path.color}` : 'none',
                  }}
                />
                <span className="max-w-[120px] truncate">{path.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PathChart;
