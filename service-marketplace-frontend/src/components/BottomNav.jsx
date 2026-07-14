import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid2X2, MessageCircle, User, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isProvider } = useApp();

  const NAV_ITEMS = isProvider ? [
    { path: '/dashboard', label: 'Dashboard', icon: Briefcase },
    { path: '/chats',     label: 'Chats',     icon: MessageCircle },
    { path: '/profile',   label: 'Profile',   icon: User },
  ] : [
    { path: '/',         label: 'Discover',  icon: Grid2X2 },
    { path: '/chats',   label: 'Chats',     icon: MessageCircle },
    { path: '/profile', label: 'Profile',   icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-obsidian/95 backdrop-blur border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-4 py-3 pb-safe">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 min-w-[64px] relative"
            >
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative"
              >
                <Icon
                  size={22}
                  className={active ? 'text-gold' : 'text-ash'}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                  />
                )}
              </motion.div>
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-gold' : 'text-ash'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
