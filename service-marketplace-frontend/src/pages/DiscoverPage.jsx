import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import ProviderCard from '../components/ProviderCard';
import { api } from '../lib/api';

export default function DiscoverPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    service_type: '',
    min_age: null,
    max_age: null,
  });

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchProviders(filters);
      setProviders(data);
    } catch (err) {
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filter changes
    const timeout = setTimeout(() => {
      fetchProviders();
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-ivory tracking-tight">Discover</h1>
          <p className="text-ash text-sm">Find your perfect companion</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-charcoal border border-border flex items-center justify-center">
          <Sparkles size={20} className="text-gold" />
        </div>
      </header>

      {/* Search & Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] rounded-3xl bg-charcoal animate-pulse border border-border" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-ivory font-semibold">Unable to load results</h3>
                <p className="text-ash text-sm mt-1">{error}</p>
              </div>
              <button onClick={fetchProviders} className="btn-ghost text-gold flex items-center gap-2">
                <RefreshCw size={16} /> Try Again
              </button>
            </motion.div>
          ) : providers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <p className="text-ash italic">No providers match your search.</p>
              <button 
                onClick={() => setFilters({ query: '', location: '', service_type: '', min_age: null, max_age: null })}
                className="text-gold text-sm mt-2 font-medium"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {providers.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
