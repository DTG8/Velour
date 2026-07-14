import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function MediaGallery({ username }) {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const data = await api.getProviderCatalogue(username);
        setMedia(data);
      } catch (err) {
        console.error('Failed to fetch media catalogue', err);
        setError('Unable to load gallery');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchMedia();
  }, [username]);

  if (loading) return (
    <div className="h-48 flex flex-col items-center justify-center gap-3 text-ash">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-widest opacity-50">Loading Catalogue…</p>
    </div>
  );

  if (error) return (
    <div className="h-48 flex flex-col items-center justify-center gap-2 text-ash/60 border border-dashed border-border rounded-2xl">
      <AlertCircle size={20} />
      <p className="text-xs uppercase tracking-widest">{error}</p>
    </div>
  );

  if (media.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display text-xl text-ivory uppercase tracking-widest">Catalogue</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Masonry-style Grid */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {media.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(item)}
            className="relative break-inside-avoid cursor-pointer group rounded-xl overflow-hidden border border-border hover:border-gold/30 transition-all"
          >
            {item.media_type === 'image' ? (
              <img src={item.file_url} alt="Catalogue" className="w-full object-cover" />
            ) : (
              <div className="relative">
                <video src={item.file_url} className="w-full object-cover" muted loop playsInline />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                   <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/20">
                      <Play size={16} className="text-white fill-white ml-0.5" />
                   </div>
                </div>
              </div>
            )}
            
            {item.is_featured && (
               <div className="absolute top-2 left-2 px-2 py-0.5 bg-gold/90 text-void text-[10px] font-bold rounded uppercase">
                 Featured
               </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-charcoal border border-border flex items-center justify-center text-ivory hover:text-gold transition-all"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-5xl w-full max-h-[85vh] flex items-center justify-center overflow-hidden rounded-2xl"
            >
              {selected.media_type === 'image' ? (
                <img src={selected.file_url} className="max-w-full max-h-full object-contain shadow-2xl" />
              ) : (
                <video
                  src={selected.file_url}
                  className="max-w-full max-h-full shadow-2xl"
                  controls
                  autoPlay
                  muted
                  loop
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
