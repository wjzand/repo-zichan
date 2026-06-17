import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: number | '';
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  required?: boolean;
}

export const AmountInput = ({
  label,
  value,
  onChange,
  currency = '¥',
  placeholder = '0.00',
  required = false,
  className = '',
  ...props
}: AmountInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, '');
    if (raw === '') {
      onChange(0);
      return;
    }
    const parts = raw.split('.');
    const integer = parts[0];
    const decimal = parts[1]?.slice(0, 2) || '';
    const formatted = decimal ? `${integer}.${decimal}` : integer;
    const num = parseFloat(formatted);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const displayValue = value === '' ? '' : value === 0 ? '' : formatNumber(Number(value));

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          {currency}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50',
            'text-right text-lg font-semibold tabular-nums text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
            'transition-all placeholder:text-gray-300'
          )}
          {...props}
        />
      </div>
    </div>
  );
};
