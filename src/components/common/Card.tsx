import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ children, className = '', onClick, padding = 'md' }: CardProps) => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        paddingMap[padding],
        onClick && 'active:scale-[0.98] transition-transform cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
