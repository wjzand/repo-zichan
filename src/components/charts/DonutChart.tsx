import { useEffect, useRef } from 'react';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataItem[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerText?: string;
  centerSubText?: string;
  animated?: boolean;
}

export const DonutChart = ({
  data,
  size = 180,
  thickness = 28,
  showLegend = true,
  centerText,
  centerSubText,
  animated = true,
}: DonutChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - thickness) / 2;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    ctx.clearRect(0, 0, size, size);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = thickness;
      ctx.stroke();
      return;
    }

    const drawChart = (progress: number) => {
      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = thickness;
      ctx.stroke();

      let startAngle = -Math.PI / 2;
      const visibleTotal = total * progress;
      let accumulated = 0;

      for (const item of data) {
        if (accumulated >= visibleTotal) break;
        const itemValue = Math.min(item.value, visibleTotal - accumulated);
        const sweepAngle = (itemValue / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sweepAngle);
        ctx.strokeStyle = item.color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'butt';
        ctx.stroke();

        startAngle += sweepAngle;
        accumulated += itemValue;
      }

      if (centerText) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (progress >= 0.9) {
          ctx.fillText(centerText, centerX, centerY - (centerSubText ? 8 : 0));
        }
      }
      if (centerSubText) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (progress >= 0.95) {
          ctx.fillText(centerSubText, centerX, centerY + 10);
        }
      }
    };

    if (animated) {
      let start = 0;
      const duration = 700;
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
  }, [data, size, thickness, centerText, centerSubText, animated]);

  return (
    <div className="flex items-center gap-4">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: 'block', flexShrink: 0 }}
      />
      {showLegend && (
        <div className="flex-1 space-y-1.5 min-w-0">
          {(() => {
            const chartTotal = data.reduce((sum, d) => sum + d.value, 0);
            return data.map((item) => {
              const percent = chartTotal > 0 ? ((item.value / chartTotal) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 truncate flex-1">{item.name}</span>
                  <span className="text-gray-900 font-medium tabular-nums">{percent}%</span>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};
