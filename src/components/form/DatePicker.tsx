import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/utils/format';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const DatePicker = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = '选择日期',
  ...props
}: DatePickerProps) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Calendar
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50',
            'text-sm text-gray-800 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
            'transition-all'
          )}
          {...props}
        />
        {!value && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {placeholder}
          </span>
        )}
      </div>
      {value && (
        <p className="text-xs text-gray-400 pl-1">{formatDate(value)}</p>
      )}
    </div>
  );
};
