import { useRef, useEffect, useState, useCallback } from 'react';
import { LifeEvent } from '@/types';
import { LIFE_STAGES, getEventTemplate } from '@/constants/lifeSandbox';

interface LifeTimelineProps {
  events: LifeEvent[];
  currentAge: number;
  lifeExpectancy: number;
  onEventClick: (eventId: string) => void;
  onAddEventAtAge: (age: number) => void;
}

const COLORS = {
  deepBlue: '#1e3a5f',
  deepBlueDark: '#0f2744',
  deepBlueLight: '#2a4f7a',
  gold: '#d4a84b',
  goldLight: '#e8c97a',
  goldDark: '#b8922f',
  red: '#ef4444',
  textLight: '#f1f5f9',
  textMuted: '#94a3b8',
};

const STAGE_BG_OPACITY = 0.15;
const PIXELS_PER_YEAR = 30;
const MIN_AGE = 0;
const MAX_AGE = 90;
const TIMELINE_HEIGHT = 180;
const AXIS_Y = 120;
const EVENT_RADIUS = 10;
const TICK_HEIGHT_SMALL = 8;
const TICK_HEIGHT_LARGE = 16;
const PADDING_LEFT = 20;
const PADDING_RIGHT = 20;

export const LifeTimeline = ({
  events,
  currentAge,
  lifeExpectancy,
  onEventClick,
  onAddEventAtAge,
}: LifeTimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [dpr, setDpr] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const lastClickTime = useRef(0);
  const hasDragged = useRef(false);

  const totalWidth = (MAX_AGE - MIN_AGE) * PIXELS_PER_YEAR + PADDING_LEFT + PADDING_RIGHT;

  const ageToX = useCallback((age: number) => {
    return PADDING_LEFT + (age - MIN_AGE) * PIXELS_PER_YEAR;
  }, []);

  const xToAge = useCallback((x: number) => {
    return Math.round((x - PADDING_LEFT) / PIXELS_PER_YEAR);
  }, []);

  const getEventIcon = (event: LifeEvent): string => {
    const template = getEventTemplate(event.type);
    return template?.icon || '✨';
  };

  const getEventColor = (event: LifeEvent): string => {
    const template = getEventTemplate(event.type);
    return template?.color || COLORS.gold;
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasWidth(w);
        setDpr(window.devicePixelRatio || 1);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const visibleWidth = canvasWidth;
    const actualWidth = Math.max(totalWidth, visibleWidth);

    canvas.width = visibleWidth * dpr;
    canvas.height = TIMELINE_HEIGHT * dpr;
    canvas.style.width = `${visibleWidth}px`;
    canvas.style.height = `${TIMELINE_HEIGHT}px`;

    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, visibleWidth, TIMELINE_HEIGHT);

      ctx.save();
      ctx.translate(-scrollLeft, 0);

      const bgGradient = ctx.createLinearGradient(0, 0, 0, TIMELINE_HEIGHT);
      bgGradient.addColorStop(0, COLORS.deepBlueDark);
      bgGradient.addColorStop(1, COLORS.deepBlue);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, actualWidth, TIMELINE_HEIGHT);

      for (const stage of LIFE_STAGES) {
        const startX = ageToX(stage.ageRange[0]);
        const endX = ageToX(stage.ageRange[1]);
        const stageWidth = endX - startX;

        ctx.fillStyle = stage.color;
        ctx.globalAlpha = STAGE_BG_OPACITY;
        ctx.fillRect(startX, 0, stageWidth, AXIS_Y - 20);
        ctx.globalAlpha = 1;

        ctx.fillStyle = stage.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(startX, AXIS_Y - 20, 2, AXIS_Y);
        ctx.globalAlpha = 1;

        const labelX = startX + stageWidth / 2;
        ctx.fillStyle = stage.color;
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(stage.label, labelX, 8);
      }

      const axisGradient = ctx.createLinearGradient(0, AXIS_Y, actualWidth, AXIS_Y);
      axisGradient.addColorStop(0, COLORS.deepBlueLight);
      axisGradient.addColorStop(0.5, COLORS.gold);
      axisGradient.addColorStop(1, COLORS.deepBlueLight);
      ctx.strokeStyle = axisGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ageToX(MIN_AGE), AXIS_Y);
      ctx.lineTo(ageToX(MAX_AGE), AXIS_Y);
      ctx.stroke();

      for (let age = MIN_AGE; age <= MAX_AGE; age++) {
        const x = ageToX(age);
        const isDecade = age % 10 === 0;
        const isHalf = age % 5 === 0 && !isDecade;

        if (isDecade) {
          ctx.strokeStyle = COLORS.gold;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, AXIS_Y - TICK_HEIGHT_LARGE / 2);
          ctx.lineTo(x, AXIS_Y + TICK_HEIGHT_LARGE);
          ctx.stroke();

          ctx.fillStyle = COLORS.textLight;
          ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(`${age}岁`, x, AXIS_Y + TICK_HEIGHT_LARGE + 4);

          ctx.fillStyle = COLORS.gold;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(x, AXIS_Y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (isHalf) {
          ctx.strokeStyle = COLORS.textMuted;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, AXIS_Y - TICK_HEIGHT_SMALL / 2);
          ctx.lineTo(x, AXIS_Y + TICK_HEIGHT_SMALL);
          ctx.stroke();
        } else {
          ctx.strokeStyle = COLORS.deepBlueLight;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, AXIS_Y);
          ctx.lineTo(x, AXIS_Y + TICK_HEIGHT_SMALL);
          ctx.stroke();
        }
      }

      const sortedEvents = [...events].sort((a, b) => a.age - b.age);

      const rowMap = new Map<number, number>();
      const getRow = (age: number): number => {
        let row = 0;
        const roundedAge = Math.round(age * 2) / 2;
        while (true) {
          let conflict = false;
          for (let da = -1; da <= 1; da++) {
            const key = `${(roundedAge + da * 0.5).toFixed(1)}_${row}`;
            if (rowMap.has(key as unknown as number)) {
              conflict = true;
              break;
            }
          }
          if (!conflict) break;
          row++;
        }
        rowMap.set(`${roundedAge.toFixed(1)}_${row}` as unknown as number, 1);
        return row;
      };

      const eventPositions: Array<{ event: LifeEvent; x: number; y: number; row: number }> = [];

      for (const event of sortedEvents) {
        const x = ageToX(event.age);
        const row = getRow(event.age);
        const yOffset = row * 28;
        const y = AXIS_Y - 30 - yOffset;
        eventPositions.push({ event, x, y, row });
      }

      for (const { event, x, y, row } of eventPositions) {
        const lineTop = y + EVENT_RADIUS + 4;
        const lineBottom = AXIS_Y - TICK_HEIGHT_LARGE / 2;

        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, lineTop);
        ctx.lineTo(x, lineBottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        const color = getEventColor(event);

        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = COLORS.deepBlueDark;
        ctx.beginPath();
        ctx.arc(x, y, EVENT_RADIUS + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, EVENT_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = COLORS.goldLight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, EVENT_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        const icon = getEventIcon(event);
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x, y + 0.5);

        if (row === 0) {
          const ageLabel = `${event.age}岁`;
          ctx.fillStyle = COLORS.textLight;
          ctx.font = '10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(ageLabel, x, y - EVENT_RADIUS - 6);
        }
      }

      if (currentAge >= MIN_AGE && currentAge <= MAX_AGE) {
        const x = ageToX(currentAge);

        ctx.shadowColor = COLORS.red;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = COLORS.red;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, TIMELINE_HEIGHT - 30);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = COLORS.red;
        ctx.beginPath();
        ctx.moveTo(x - 8, TIMELINE_HEIGHT - 30);
        ctx.lineTo(x + 8, TIMELINE_HEIGHT - 30);
        ctx.lineTo(x, TIMELINE_HEIGHT - 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = COLORS.red;
        const labelWidth = 52;
        const labelHeight = 22;
        const labelX = x - labelWidth / 2;
        const labelY = 4;
        const radius = 6;

        ctx.beginPath();
        ctx.moveTo(labelX + radius, labelY);
        ctx.lineTo(labelX + labelWidth - radius, labelY);
        ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
        ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
        ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
        ctx.lineTo(labelX + radius, labelY + labelHeight);
        ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
        ctx.lineTo(labelX, labelY + radius);
        ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${currentAge}岁 ← 现在`, x, labelY + labelHeight / 2 + 0.5);
      }

      if (lifeExpectancy > currentAge && lifeExpectancy <= MAX_AGE) {
        const x = ageToX(lifeExpectancy);
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(x, 28);
        ctx.lineTo(x, AXIS_Y - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        ctx.fillStyle = COLORS.gold;
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`🏁 ${lifeExpectancy}岁`, x, AXIS_Y - 18);
      }

      ctx.restore();
    };

    draw();
  }, [events, currentAge, lifeExpectancy, scrollLeft, canvasWidth, dpr, totalWidth, ageToX]);

  const findEventAtPosition = useCallback(
    (clientX: number, clientY: number): LifeEvent | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const localX = clientX - rect.left + scrollLeft;
      const localY = clientY - rect.top;

      for (const event of events) {
        const x = ageToX(event.age);

        const sortedEvents = [...events].sort((a, b) => a.age - b.age);
        const rowMap = new Map<number, number>();
        const getRow = (age: number): number => {
          let row = 0;
          const roundedAge = Math.round(age * 2) / 2;
          while (true) {
            let conflict = false;
            for (let da = -1; da <= 1; da++) {
              const key = `${(roundedAge + da * 0.5).toFixed(1)}_${row}`;
              if (rowMap.has(key as unknown as number)) {
                conflict = true;
                break;
              }
            }
            if (!conflict) break;
            row++;
          }
          rowMap.set(`${roundedAge.toFixed(1)}_${row}` as unknown as number, 1);
          return row;
        };
        for (const ev of sortedEvents) {
          getRow(ev.age);
        }

        const row = getRow(event.age);
        const y = AXIS_Y - 30 - row * 28;

        const dx = localX - x;
        const dy = localY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= EVENT_RADIUS + 6) {
          return event;
        }
      }
      return null;
    },
    [events, scrollLeft, ageToX]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setIsDragging(true);
      hasDragged.current = false;
      dragStartX.current = clientX;
      dragStartScroll.current = scrollLeft;
    },
    [scrollLeft]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = clientX - dragStartX.current;
      if (Math.abs(delta) > 5) {
        hasDragged.current = true;
      }
      const maxScroll = Math.max(0, totalWidth - canvasWidth);
      const newScroll = Math.max(0, Math.min(maxScroll, dragStartScroll.current - delta));
      setScrollLeft(newScroll);
    },
    [isDragging, totalWidth, canvasWidth]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const now = Date.now();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
      setIsDragging(false);

      if (hasDragged.current) {
        return;
      }

      if (now - lastClickTime.current < 300) {
        lastClickTime.current = 0;
        return;
      }
      lastClickTime.current = now;

      const event = findEventAtPosition(clientX, clientY);
      if (event) {
        onEventClick(event.id);
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const localX = clientX - rect.left + scrollLeft;
        const age = xToAge(localX);
        if (age >= MIN_AGE && age <= MAX_AGE) {
          onAddEventAtAge(age);
        }
      }
    },
    [isDragging, scrollLeft, findEventAtPosition, onEventClick, onAddEventAtAge, xToAge]
  );

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const maxScroll = Math.max(0, totalWidth - canvasWidth);
    setScrollLeft((prev) => Math.max(0, Math.min(maxScroll, prev + e.deltaY)));
  }, [totalWidth, canvasWidth]);

  const scrollToCurrentAge = () => {
    const targetX = ageToX(currentAge) - canvasWidth / 2;
    const maxScroll = Math.max(0, totalWidth - canvasWidth);
    setScrollLeft(Math.max(0, Math.min(maxScroll, targetX)));
  };

  return (
    <div ref={containerRef} className="w-full select-none">
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-[#2a4f7a]/50"
        style={{ background: COLORS.deepBlueDark }}
      >
        <canvas
          ref={canvasRef}
          className={`block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
        />

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-[#0f2744]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-[#2a4f7a]/40">
            <span className="text-[#94a3b8] text-[10px]">拖动滚动</span>
            <span className="text-[#d4a84b]">⇆</span>
          </div>
          <button
            onClick={scrollToCurrentAge}
            className="pointer-events-auto flex items-center gap-1.5 bg-[#d4a84b]/90 hover:bg-[#d4a84b] active:bg-[#b8922f] transition-colors px-2.5 py-1.5 rounded-lg text-[#0f2744] text-[11px] font-bold shadow-md"
          >
            <span>📍</span>
            <span>回到现在</span>
          </button>
        </div>

        {totalWidth > canvasWidth && (
          <div className="absolute top-2 right-2 bg-[#0f2744]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-[#2a4f7a]/40 pointer-events-none">
            <span className="text-[#d4a84b] text-[10px] font-medium">
              {Math.round((scrollLeft / (totalWidth - canvasWidth)) * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {LIFE_STAGES.map((stage) => (
          <div
            key={stage.stage}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1e3a5f]/30 border border-[#2a4f7a]/30"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[#cbd5e1] text-[10px]">
              {stage.label} ({stage.ageRange[0]}-{stage.ageRange[1]}岁)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
