import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, User, MapPin, Sparkles, CheckCircle2, 
  AlertCircle, Loader2, Save, Power, Trash2, Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import UploadDashboard from '../components/UploadDashboard';
import MediaGallery from '../components/MediaGallery';

const LAGOS_DISTRICTS = [
  "Lagos Island", "Lagos Mainland", "Eti-Osa", "Ikoyi", "Victoria Island",
  "Lekki", "Ajah", "Badagry", "Ikeja", "Surulere", "Mushin", "Oshodi-Isolo", "Agege",
  "Alimosho", "Ifako-Ijaiye", "Shomolu", "Kosofe", "Somolu", "Ikorodu", "Epe", "Ibeju-Lekki",
];

export default function ProviderDashboardPage() {
  const { user, hydrate } = useApp();
  const [profile, setProfile] = useState({
    display_name: '',
    age: 20,
    location: 'Lekki',
    bio: '',
    st_rate: false,
    ovn_rate: false,
    is_online: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    setAvatarError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const updatedProfile = await api.uploadAvatar(formData);
      setProfile(prev => ({ ...prev, avatar_url: updatedProfile.avatar_url }));
      await hydrate();
    } catch (err) {
      console.error(err);
      setAvatarError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getMyProfile();
      setProfile(data);
    } catch (err) {
      if (err.message !== 'Profile not found — create one first via POST /profile') {
        setStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      // Check if profile exists to decide POST or PATCH
      try {
        await api.getMyProfile();
        await api.updateProfile(profile);
      } catch (err) {
        await api.createProfile(profile);
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const toggleOnline = async () => {
    const nextStatus = !profile.is_online;
    setProfile(prev => ({ ...prev, is_online: nextStatus }));
    try {
      await api.setOnlineStatus(nextStatus);
    } catch (err) {
      console.error('Failed to toggle online status', err);
      // Revert on failure
      setProfile(prev => ({ ...prev, is_online: !nextStatus }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-gold animate-spin" />
        <p className="text-ash text-xs uppercase tracking-widest">Loading Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-ivory tracking-tight">Dashboard</h1>
          <p className="text-ash text-sm">Manage your professional presence</p>
        </div>
        <button 
          onClick={toggleOnline}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
            profile.is_online 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-charcoal border-border text-ash'
          }`}
        >
          <Power size={20} />
        </button>
      </header>

      {/* Online Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
        profile.is_online 
          ? 'bg-emerald-500/5 border-emerald-500/10' 
          : 'bg-charcoal/30 border-border/50 opacity-60'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${profile.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-ash'}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${profile.is_online ? 'text-emerald-400' : 'text-ash'}`}>
            {profile.is_online ? 'You are visible to clients' : 'You are currently hidden'}
          </span>
        </div>
        <span className="text-[10px] text-ash/50 font-medium">{profile.is_online ? 'LIVE' : 'IDLE'}</span>
      </div>

      {/* Profile Editor */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl text-ivory uppercase tracking-widest">Public Profile</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSave} className="bg-charcoal border border-border rounded-3xl p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center pb-4 border-b border-border/50">
            <div className="relative group w-24 h-24 rounded-3xl overflow-hidden bg-void border border-border flex items-center justify-center">
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <Loader2 size={24} className="text-gold animate-spin" />
                </div>
              ) : profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-gold/20" />
              )}
              
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-opacity">
                <Camera size={18} className="text-gold mb-1" />
                Edit
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            {avatarError && (
              <p className="text-red-400 text-[10px] uppercase font-bold tracking-wider mt-2">{avatarError}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium mb-1.5 block">Display Name</label>
              <input 
                type="text" 
                className="input-dark" 
                value={profile.display_name}
                onChange={e => setProfile({...profile, display_name: e.target.value})}
                placeholder="e.g. Amara"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ash uppercase tracking-widest font-medium mb-1.5 block">Age</label>
                <input 
                  type="number" 
                  min="18" max="80"
                  className="input-dark" 
                  value={profile.age}
                  onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-ash uppercase tracking-widest font-medium mb-1.5 block">Location</label>
                <select 
                  className="input-dark appearance-none"
                  value={profile.location}
                  onChange={e => setProfile({...profile, location: e.target.value})}
                  required
                >
                  {LAGOS_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium mb-1.5 block">Bio</label>
              <textarea 
                className="input-dark min-h-[100px] py-3" 
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell clients about yourself…"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-void border border-border cursor-pointer group">
                <span className="text-xs font-semibold text-silver">Short-Term</span>
                <input 
                  type="checkbox" 
                  checked={profile.st_rate}
                  onChange={e => setProfile({...profile, st_rate: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-border text-gold bg-charcoal focus:ring-gold/20"
                />
              </label>
              <label className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-void border border-border cursor-pointer group">
                <span className="text-xs font-semibold text-silver">Overnight</span>
                <input 
                  type="checkbox" 
                  checked={profile.ovn_rate}
                  onChange={e => setProfile({...profile, ovn_rate: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-border text-gold bg-charcoal focus:ring-gold/20"
                />
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="btn-gold w-full py-4 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>

          <AnimatePresence>
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-emerald-400 text-sm justify-center"
              >
                <CheckCircle2 size={16} /> Profile updated successfully
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm justify-center"
              >
                <AlertCircle size={16} /> Failed to save profile
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </section>

      {/* Catalogue Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl text-ivory uppercase tracking-widest">Media Catalogue</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        
        <UploadDashboard />
        
        <div className="pt-4">
          <h3 className="text-xs text-ash font-bold uppercase tracking-widest mb-4">Current Gallery</h3>
          <MediaGallery username={profile.display_name} />
        </div>
      </section>

      {/* Account Safety */}
      <section className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Danger Zone</h3>
        </div>
        <p className="text-xs text-ash leading-relaxed">
          Deactivating your account will hide your profile from all search results and stop incoming messages.
        </p>
        <button className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
          Deactivate Profile
        </button>
      </section>
    </div>
  );
}
