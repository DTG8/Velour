import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, User, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'client', // 'client' | 'provider'
    email: '',
    phone_number: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...payload } = formData;
      const data = await signup(payload);
      if (data.role === 'provider') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h1 className="font-display text-4xl text-ivory tracking-tight">Create Account</h1>
          <p className="text-ash mt-2">Join the Velour community</p>
        </div>

        <form className="mt-8 space-y-6 bg-charcoal border border-border rounded-3xl p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-void border border-border rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'client' })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                formData.role === 'client' ? 'bg-charcoal text-gold shadow-lg border border-border' : 'text-ash hover:text-silver'
              }`}
            >
              <User size={14} /> Client
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'provider' })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                formData.role === 'provider' ? 'bg-charcoal text-gold shadow-lg border border-border' : 'text-ash hover:text-silver'
              }`}
            >
              <Briefcase size={14} /> Provider
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-dark"
                placeholder="Pick a username"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-dark"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                  Confirm
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-dark"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-dark"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="input-dark"
                placeholder="+234..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-4 text-base"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-ash">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
