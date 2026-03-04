'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, GraduationCap, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

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
            <GraduationCap size={32} />
          </div>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight">EduHub UG</h1>
          <p className="text-text-muted text-sm px-4">Advanced Admin Management</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="login-error flex items-center gap-2 p-3 mt-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.2)', color: '#ff4757', borderRadius: '8px', fontSize: '13px' }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="login-form mt-8">
          <motion.div className="form-group" variants={itemVariants}>
            <label className="form-label text-[11px] uppercase tracking-wider opacity-60 ml-1">Administrator Email</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-primary">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="admin@eduhubug.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label className="form-label text-[11px] uppercase tracking-wider opacity-60 ml-1">Secure Access Password</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-primary">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <button 
              type="submit" 
              className="btn btn-primary login-btn w-full" 
              disabled={loading}
              style={{ 
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="font-semibold">Authenticate Access</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </motion.div>

          <motion.div 
            className="flex items-center justify-center gap-2 mt-8 text-[10px] text-text-muted uppercase tracking-[0.2em]"
            variants={itemVariants}
          >
            <ShieldCheck size={14} className="text-secondary" />
            Secure Enterprise Encryption
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
