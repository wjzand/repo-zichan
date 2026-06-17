import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, User } from 'lucide-react';

const navItems = [
  { path: '/', label: '总览', Icon: LayoutDashboard },
  { path: '/assets', label: '资产', Icon: Wallet },
  { path: '/liabilities', label: '负债', Icon: CreditCard },
  { path: '/profile', label: '我的', Icon: User },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-[#1e3a5f]' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? 'text-[#1e3a5f]' : 'text-gray-400'}
                />
                <span
                  className={`text-xs mt-0.5 font-medium ${
                    isActive ? 'text-[#1e3a5f]' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
