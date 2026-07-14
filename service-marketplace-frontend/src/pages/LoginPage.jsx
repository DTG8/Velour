import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login(username, password);
      if (data.role === 'provider') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-charcoal border border-border mb-4">
            <Sparkles size={32} className="text-gold" />
          </div>
          <h1 className="font-display text-4xl text-ivory tracking-tight">Velour</h1>
          <p className="text-ash mt-2">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-charcoal border border-border rounded-3xl p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-dark"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="text-xs text-ash uppercase tracking-widest font-medium px-1 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-4 text-base"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-ash">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold hover:text-gold-light font-medium transition-colors">
              Create one now
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
