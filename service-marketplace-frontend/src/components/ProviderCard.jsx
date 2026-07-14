import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Star, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProviderCard({ provider, index }) {
  const { favorites, toggleFavorite } = useApp();
  const navigate = useNavigate();
  const isFav = favorites.has(provider.user_id);

  // Fallback for avatar using initials and a consistent gradient
  const initials = provider.display_name?.charAt(0).toUpperCase() || '?';
  const avatarFallback = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal to-void text-gold/30 text-4xl font-display">
      {initials}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="card-base cursor-pointer group relative"
      onClick={() => navigate(`/provider/${provider.user_id}`)}
    >
      {/* Photo */}
      <div className="relative overflow-hidden aspect-[3/4]">
        {provider.avatar_url ? (
          <img
            src={provider.avatar_url}
            alt={provider.display_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : avatarFallback}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

        {/* Online dot */}
        {provider.is_online && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400">Online</span>
          </div>
        )}

        {/* Favourite */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(provider.user_id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <Heart
            size={15}
            className={isFav ? 'fill-gold text-gold' : 'text-silver'}
            strokeWidth={isFav ? 0 : 1.8}
          />
        </motion.button>

        {/* Verified badge */}
        {provider.is_verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-gold/10 border border-gold/30 rounded-full px-2 py-0.5">
            <CheckCircle2 size={10} className="text-gold" />
            <span className="text-[10px] font-semibold text-gold uppercase tracking-tighter">Verified</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ivory text-base tracking-wide">
            {provider.display_name}
            <span className="text-ash font-normal text-sm ml-1.5">{provider.age}</span>
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-silver text-xs">
          <MapPin size={11} className="text-gold shrink-0" />
          <span>{provider.location}</span>
        </div>

        {/* Service badges */}
        <div className="flex gap-1.5">
          {provider.st_rate && <span className="badge-st">ST</span>}
          {provider.ovn_rate && <span className="badge-ovn">OVN</span>}
        </div>
      </div>
    </motion.div>
  );
}
