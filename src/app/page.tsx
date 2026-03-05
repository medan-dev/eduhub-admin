'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, GraduationCap, ArrowRight, ShieldCheck, AlertCircle, Loader2, LogIn, Eye, Terminal } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push('/dashboard');
      }
    } catch {
      setError('An unexpected connection error occurred');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      } 
    },
  };

  return (
    <div className="login-container">
      <div className="mesh-gradient-bg" />
      
      <motion.div 
        className="login-card"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="login-logo-container" variants={itemVariants}>
          <div className="login-logo-icon">
            <span>&gt;_</span>
          </div>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back 👋</h1>
          <p className="text-text-muted text-[14px]">Sign in to your admin control panel.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="login-error flex items-center gap-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="login-form mt-10">
          <motion.div className="form-group" variants={itemVariants}>
            <label className="form-label text-[10px] uppercase tracking-[0.1em] font-bold opacity-40 mb-2 block">USERNAME</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50 transition-colors group-focus-within:text-accent-primary">
                <User size={18} />
              </span>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '48px', fontSize: '14px', height: '52px', background: 'rgba(235, 240, 255, 0.9)', color: '#1a1a1a', borderRadius: '14px' }}
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants} style={{ marginBottom: '28px' }}>
            <label className="form-label text-[10px] uppercase tracking-[0.1em] font-bold opacity-40 mb-2 block">PASSWORD</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50 transition-colors group-focus-within:text-accent-primary">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '48px', fontSize: '14px', height: '52px', background: 'rgba(235, 240, 255, 0.9)', color: '#1a1a1a', borderRadius: '14px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-30">
                <Eye size={18} />
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button 
              type="submit" 
              className="btn btn-primary login-btn w-full" 
              disabled={loading}
              style={{ 
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </motion.div>

          <motion.div className="login-footer" variants={itemVariants}>
            <div className="footer-signature">
              <ShieldCheck size={12} />
              Protected portal · Mctech-hub Systems © 2026
            </div>
            <a href="#" className="footer-link">← Back to website</a>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
