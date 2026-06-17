import { ReactNode } from 'react';

export interface TimelineItem {
  date: string;
  content: ReactNode;
  dotColor?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline = ({ items }: TimelineProps) => {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">暂无记录</p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {[...items].reverse().map((item, idx) => (
          <div key={idx} className="relative flex gap-3 pl-0.5">
            <div
              className="relative z-10 w-3.5 h-3.5 rounded-full border-2 border-white mt-1 flex-shrink-0"
              style={{ backgroundColor: item.dotColor || '#d4a84b' }}
            />
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-xs text-gray-400 mb-1">{item.date}</p>
              <div className="text-sm text-gray-700">{item.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
