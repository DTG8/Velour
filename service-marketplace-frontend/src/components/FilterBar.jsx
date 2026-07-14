import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const LAGOS_DISTRICTS = [
  "All Locations", "Lagos Island", "Lagos Mainland", "Eti-Osa", "Ikoyi", "Victoria Island",
  "Lekki", "Ajah", "Badagry", "Ikeja", "Surulere", "Mushin", "Oshodi-Isolo", "Agege",
  "Alimosho", "Ifako-Ijaiye", "Shomolu", "Kosofe", "Somolu", "Ikorodu", "Epe", "Ibeju-Lekki",
];

export default function FilterBar({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const handleLocation = (loc) =>
    onChange({ ...filters, location: loc === 'All Locations' ? '' : loc });

  const handleServiceType = (type) =>
    onChange({ ...filters, service_type: filters.service_type === type ? '' : type });

  const activeCount = [
    filters.location,
    filters.service_type,
    filters.min_age,
    filters.max_age,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            placeholder="Search by name or location…"
            className="input-dark pl-9 text-sm"
            value={filters.query || ''}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium ${
            open || activeCount > 0
              ? 'border-gold text-gold bg-gold/5'
              : 'border-border text-silver bg-charcoal'
          }`}
        >
          <SlidersHorizontal size={15} />
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-gold text-void text-xs font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-charcoal border border-border rounded-2xl p-4 space-y-4">
              {/* Service type */}
              <div>
                <p className="text-xs text-ash font-medium mb-2 uppercase tracking-widest">Service Type</p>
                <div className="flex gap-2">
                  {['ST', 'OVN'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleServiceType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        filters.service_type === type
                          ? type === 'ST'
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                            : 'bg-violet-500/15 border-violet-500/50 text-violet-400'
                          : 'border-border text-silver'
                      }`}
                    >
                      {type === 'ST' ? '⚡ Short-Term' : '🌙 Overnight'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs text-ash font-medium mb-2 uppercase tracking-widest">Location</p>
                <div className="flex flex-wrap gap-2">
                  {LAGOS_DISTRICTS.map((loc) => {
                    const selected =
                      loc === 'All Locations'
                        ? !filters.location
                        : filters.location === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => handleLocation(loc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selected
                            ? 'border-gold text-gold bg-gold/5'
                            : 'border-border text-silver'
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Age range */}
              <div>
                <p className="text-xs text-ash font-medium mb-2 uppercase tracking-widest">
                  Age Range
                  {(filters.min_age || filters.max_age) && (
                    <span className="ml-2 text-gold normal-case tracking-normal">
                      {filters.min_age || 18}–{filters.max_age || 60}
                    </span>
                  )}
                </p>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    min={18} max={60}
                    value={filters.min_age || 18}
                    onChange={(e) => onChange({ ...filters, min_age: +e.target.value })}
                    className="flex-1 accent-yellow-500"
                  />
                  <input
                    type="range"
                    min={18} max={60}
                    value={filters.max_age || 60}
                    onChange={(e) => onChange({ ...filters, max_age: +e.target.value })}
                    className="flex-1 accent-yellow-500"
                  />
                </div>
              </div>

              {/* Reset */}
              {activeCount > 0 && (
                <button
                  onClick={() => onChange({ query: '', location: '', service_type: '', min_age: null, max_age: null })}
                  className="flex items-center gap-1.5 text-xs text-ash hover:text-silver transition-colors"
                >
                  <X size={12} /> Reset all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
