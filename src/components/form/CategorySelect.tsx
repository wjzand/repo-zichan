import { CategoryItem } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CategorySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  categories: CategoryItem[];
  required?: boolean;
  allowCustom?: boolean;
}

export const CategorySelect = ({
  label,
  value,
  onChange,
  categories,
  required = false,
  allowCustom = false,
}: CategorySelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((cat) => {
          const selected = value === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onChange(cat.name)}
              className={cn(
                'relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all',
                selected
                  ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-sm'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              )}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  selected ? 'text-[#1e3a5f]' : 'text-gray-600'
                )}
              >
                {cat.name}
              </span>
              {selected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
        {allowCustom && (
          <div className="col-span-4 mt-1">
            <input
              type="text"
              value={categories.find(c => c.name === value) ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="或输入自定义类别..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
};
