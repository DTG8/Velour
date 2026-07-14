import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, MessageCircle, Heart, Star, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MediaGallery from '../components/MediaGallery';
import { api } from '../lib/api';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isAuthenticated } = useApp();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProvider = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProfile(id);
      setProvider(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-ash text-xs uppercase tracking-widest animate-pulse">Loading Profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-display text-ivory">Profile Unavailable</h2>
        <p className="text-ash mt-2 mb-6">{error}</p>
        <div className="flex gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm">Go Back</button>
          <button onClick={fetchProvider} className="btn-gold px-6 text-sm flex items-center gap-2">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const isFav = favorites.has(provider.user_id);

  const handleStartChat = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/provider/${id}` } });
      return;
    }
    navigate(`/chat/${provider.user_id}`);
  };

  return (
    <div className="pb-24 min-h-screen bg-void">
      {/* Hero Section */}
      <div className="relative h-[65vh] w-full">
        {provider.avatar_url ? (
          <img 
            src={provider.avatar_url} 
            alt={provider.display_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-charcoal to-void flex items-center justify-center text-gold/10 text-9xl font-display">
            {provider.display_name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
        
        {/* Top Controls */}
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(provider.user_id)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10"
          >
            <Heart size={20} className={isFav ? 'fill-gold text-gold' : 'text-white'} />
          </motion.button>
        </div>

        {/* Floating Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-display text-white">{provider.display_name}, {provider.age}</h1>
                {provider.is_verified && <CheckCircle2 className="text-gold" size={24} />}
              </div>
              <div className="flex items-center gap-2 text-silver text-sm">
                <MapPin size={14} className="text-gold" />
                {provider.location}
              </div>
            </div>
            {provider.is_online && (
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8 space-y-10">
        {/* Quick Stats */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {provider.st_rate && <span className="badge-st py-2 px-4 text-xs">⚡ Short-Term Available</span>}
          {provider.ovn_rate && <span className="badge-ovn py-2 px-4 text-xs">🌙 Overnight Available</span>}
          <span className="flex items-center gap-1.5 px-4 py-2 bg-charcoal border border-border rounded-xl text-ash text-xs font-semibold">
            <ShieldCheck size={14} className="text-gold" /> Discreet
          </span>
        </div>

        {/* Bio */}
        <section className="space-y-3">
          <h2 className="font-display text-xl text-ivory uppercase tracking-widest">About Me</h2>
          <p className="text-ash leading-relaxed">
            {provider.bio || "No biography provided yet."}
          </p>
        </section>

        {/* Gallery */}
        <MediaGallery username={provider.display_name} />

        {/* Trust Indicators */}
        <div className="p-6 rounded-3xl bg-charcoal/50 border border-border space-y-4">
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest">Safety & Discretion</h3>
          <div className="space-y-3">
            <div className="flex gap-3 text-sm text-silver">
              <div className="w-5 h-5 shrink-0 rounded-full bg-gold/10 flex items-center justify-center text-gold">✓</div>
              <p>Profile information has been verified by our team.</p>
            </div>
            <div className="flex gap-3 text-sm text-silver">
              <div className="w-5 h-5 shrink-0 rounded-full bg-gold/10 flex items-center justify-center text-gold">✓</div>
              <p>End-to-end encrypted messaging for your privacy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-void via-void to-transparent z-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartChat}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-3 py-4 rounded-2xl bg-gold text-void font-bold shadow-2xl shadow-gold/20"
        >
          <MessageCircle size={20} className="fill-void" />
          START CONVERSATION
        </motion.button>
      </div>
    </div>
  );
}
