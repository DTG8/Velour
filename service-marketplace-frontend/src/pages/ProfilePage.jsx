import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Settings, Shield, CreditCard, Heart, LogOut, 
  ChevronRight, Briefcase, MessageSquare, Star, Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { user, favorites, logout, isProvider } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => navigate(isProvider ? '/dashboard' : '/profile/edit') },
    { icon: Heart, label: 'Favorites', badge: favorites.size, action: () => navigate('/') },
    { icon: MessageSquare, label: 'My Conversations', action: () => navigate('/chats') },
    { icon: Shield, label: 'Safety & Privacy', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
  ];

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-display text-ivory tracking-tight">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-charcoal border border-border flex items-center justify-center text-ash hover:text-gold transition-colors">
          <Settings size={20} />
        </button>
      </header>

      {/* User Card */}
      <section className="relative p-6 rounded-3xl bg-charcoal border border-border overflow-hidden">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-void border border-border flex items-center justify-center overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-gold/20" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ivory">{user?.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-lg bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider">
                {user?.role}
              </span>
              <span className="text-ash text-xs">• Joined May 2026</span>
            </div>
          </div>
        </div>
        
        {/* Background Sparkle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
      </section>

      {/* Provider Dashboard Shortcut */}
      {isProvider && (
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="w-full p-5 rounded-3xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center text-void">
              <Briefcase size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-ivory">Provider Dashboard</h3>
              <p className="text-xs text-gold/70">Manage your catalogue & profile</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gold group-hover:translate-x-1 transition-transform" />
        </motion.button>
      )}

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-charcoal/40 border border-border/50 hover:bg-charcoal hover:border-border transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-void flex items-center justify-center text-ash group-hover:text-gold transition-colors">
                <item.icon size={18} />
              </div>
              <span className="text-sm font-medium text-silver group-hover:text-ivory">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              {item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-void text-gold text-[10px] font-bold border border-gold/20">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={16} className="text-ash/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-all font-medium text-sm"
      >
        <LogOut size={18} />
        Sign Out
      </button>

      <div className="text-center">
        <p className="text-[10px] text-ash uppercase tracking-[0.3em] opacity-30">Velour v1.0.0 Stable</p>
      </div>
    </div>
  );
}
