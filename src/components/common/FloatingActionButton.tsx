import { useState } from 'react';
import { Plus, Wallet, CreditCard, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddAsset = () => {
    setOpen(false);
    navigate('/assets/add');
  };

  const handleAddLiability = () => {
    setOpen(false);
    navigate('/liabilities/add');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-3">
        {open && (
          <>
            <button
              onClick={handleAddLiability}
              className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2.5 active:scale-95 transition-all animate-fade-in"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <CreditCard size={16} className="text-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-800 pr-1">添加负债</span>
            </button>
            <button
              onClick={handleAddAsset}
              className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2.5 active:scale-95 transition-all animate-fade-in"
              style={{ animationDelay: '50ms' }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Wallet size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-gray-800 pr-1">添加资产</span>
            </button>
          </>
        )}
        <button
          onClick={() => setOpen(!open)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            open
              ? 'bg-gray-700 rotate-[135deg]'
              : 'bg-[#1e3a5f] hover:bg-[#152d4e]'
          }`}
        >
          {open ? (
            <X size={26} className="text-white" />
          ) : (
            <Plus size={28} className="text-white" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  );
};
