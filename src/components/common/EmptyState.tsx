import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        {icon || (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Plus size={24} className="text-gray-400" />
          </div>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>
      )}
      {actionText && onAction && (
        <Button onClick={onAction} size="md">
          <Plus size={18} className="mr-1.5" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
