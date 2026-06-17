import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  currency?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AmountInput = ({
  label,
  value,
  onChange,
  currency = '¥',
  placeholder = '0.00',
  required = false,
  className = '',
  disabled = false,
}: AmountInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [innerValue, setInnerValue] = useState<string>('');

  useEffect(() => {
    if (value === '') {
      setInnerValue('');
    } else {
      const numStr = String(value);
      if (document.activeElement !== inputRef.current) {
        const formatted = Number(value).toLocaleString('zh-CN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        setInnerValue(formatted);
      } else {
        setInnerValue(numStr);
      }
    }
  }, [value]);

  const handleFocus = () => {
    if (value !== '' && value !== 0) {
      setInnerValue(String(value));
    }
  };

  const handleBlur = () => {
    if (value !== '' && value !== 0) {
      const formatted = Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      setInnerValue(formatted);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d.]/g, '');
    if (raw === '') {
      setInnerValue('');
      onChange('');
      return;
    }
    if (raw.startsWith('.')) {
      raw = '0' + raw;
    }
    const dotIndex = raw.indexOf('.');
    if (dotIndex === -1) {
      setInnerValue(raw);
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onChange(num);
      }
    } else {
      const integer = raw.slice(0, dotIndex);
      const decimal = raw.slice(dotIndex + 1, dotIndex + 3);
      const formattedStr = `${integer}.${decimal}`;
      const hasTrailingDot = raw.endsWith('.');
      setInnerValue(hasTrailingDot ? `${integer}.` : formattedStr);
      const num = parseFloat(formattedStr);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium z-10">
          {currency}
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={innerValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50',
            'text-right text-lg font-semibold tabular-nums text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
            'transition-all placeholder:text-gray-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
      </div>
    </div>
  );
};
