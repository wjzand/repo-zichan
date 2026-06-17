import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  fillColor?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
}

export const LineChart = ({
  data,
  height = 200,
  color = '#d4a84b',
  fillColor = 'rgba(212, 168, 75, 0.15)',
  showGrid = true,
  showLabels = true,
  animated = true,
}: LineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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

    const padding = { top: 20, right: 16, bottom: showLabels ? 28 : 12, left: 48 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 0);
    const valueRange = maxValue - minValue || 1;

    const drawChart = (progress: number) => {
      ctx.clearRect(0, 0, width, height);

      if (showGrid) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 0.5;
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const y = padding.top + (chartHeight * i) / gridLines;
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();

          const value = maxValue - (valueRange * i) / gridLines;
          ctx.fillStyle = '#9ca3af';
          ctx.font = '10px -apple-system, system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(formatShort(value), padding.left - 6, y);
        }
      }

      const points = data.map((d, i) => ({
        x: padding.left + (data.length === 1 ? chartWidth / 2 : (chartWidth * i) / (data.length - 1)),
        y: padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight,
      }));

      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        for (let i = 0; i < points.length; i++) {
          const nextI = Math.min(i + 1, points.length - 1);
          const t = Math.min(1, progress * points.length - i);
          if (t <= 0) continue;
          const p1 = points[i];
          const p2 = points[nextI];
          const px = p1.x + (p2.x - p1.x) * Math.min(1, t);
          const py = p1.y + (p2.y - p1.y) * Math.min(1, t);
          if (i === 0 || t >= 1) {
            ctx.lineTo(p1.x, p1.y);
          }
          if (t < 1 && t > 0) {
            ctx.lineTo(px, py);
          }
        }
        const lastVisibleIdx = Math.min(Math.floor(progress * points.length), points.length - 1);
        ctx.lineTo(points[lastVisibleIdx].x, padding.top + chartHeight);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(1, 'rgba(212, 168, 75, 0.02)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const t = progress * points.length - i;
        if (t <= 0) continue;
        const p1 = points[i];
        if (t >= 1 && i < points.length - 1) {
          const p2 = points[i + 1];
          if (i === 0) ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        } else if (t > 0 && t < 1 && i < points.length - 1) {
          const p2 = points[i + 1];
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;
          if (i === 0) ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(px, py);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      for (let i = 0; i < points.length; i++) {
        const t = progress * points.length - i;
        if (t < 0.3) continue;
        const p = points[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (showLabels) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const step = Math.ceil(data.length / 6);
        data.forEach((d, i) => {
          if (i % step === 0 || i === data.length - 1) {
            ctx.fillText(d.label, points[i].x, height - padding.bottom + 8);
          }
        });
      }
    };

    if (animated) {
      let start = 0;
      const duration = 600;
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
    } else {
      drawChart(1);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, height, color, fillColor, showGrid, showLabels, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    />
  );
};

const formatShort = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  if (abs >= 10000) return `${(value / 10000).toFixed(1)}万`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(0);
};
