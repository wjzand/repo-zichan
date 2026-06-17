import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

export const Header = ({ title, showBack = false, rightContent }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="w-10 flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
          )}
        </div>
        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
        <div className="w-10 flex items-center justify-end">{rightContent}</div>
      </div>
    </header>
  );
};
