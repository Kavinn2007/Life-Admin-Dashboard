import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('admin@lifeadmin.ai');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Demo mode: bypass all API calls
    const demoUser = {
      id: 'demo-user',
      email: email || 'demo@lifeadmin.ai',
      name: name || email?.split('@')[0] || 'Demo User',
      role: 'user',
    };

    if (mode === 'forgot') {
      setSuccess('Password reset successful! You can now log in.');
      setMode('login');
      setPassword('');
      setLoading(false);
      return;
    }

    // Login or Register — go straight to dashboard
    login(demoUser, 'demo-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Left side: Illustration / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar-bg relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-10 shadow-2xl">
            <ShieldCheck className="text-white" size={36} />
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Life Admin <br/> Dashboard
          </h1>
          <p className="text-xl text-slate-400 font-medium mb-10">
            The enterprise-grade solution to organize your bills, insurance, documents, subscriptions, and reminders in one place.
          </p>
          
          <div className="space-y-4">
            {['Secure Vault', 'Smart Reminders', 'AI Driven Insights', 'Insurance Tracking'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="text-primary" size={18} />
                <span className="font-semibold text-sm uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl shadow-soft border border-slate-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {mode === 'login' ? 'Welcome Back!' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'login' 
                ? 'Please enter your credentials to access your dashboard'
                : mode === 'register'
                  ? 'Sign up to start organizing your personal records'
                  : 'Enter your email and a new password to reset it'
              }
            </p>
          </div>



          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-xs flex items-center gap-2 font-medium">
              <CheckCircle size={16} className="shrink-0 text-green-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" 
                    className="input-field pl-10 h-12" 
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com" 
                  className="input-field pl-10 h-12" 
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">
                {mode === 'forgot' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-field pl-10 h-12" 
                  required
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <label htmlFor="remember" className="text-xs font-medium text-slate-500">Remember Me</label>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setSuccess(null);
                    setMode('forgot');
                    setPassword('');
                  }}
                  className="text-xs font-bold text-primary hover:underline uppercase tracking-tight cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary h-12 text-base shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {loading 
                ? 'Processing...' 
                : mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Reset Password'
              }
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-slate-50">
            <p className="text-sm text-slate-500">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setSuccess(null);
                      setMode('register');
                    }}
                    className="font-bold text-primary hover:underline uppercase tracking-tighter cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setSuccess(null);
                      setMode('login');
                    }}
                    className="font-bold text-primary hover:underline uppercase tracking-tighter cursor-pointer"
                  >
                    Log In
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setSuccess(null);
                    setMode('login');
                  }}
                  className="font-bold text-primary hover:underline uppercase tracking-tighter cursor-pointer"
                >
                  Back to Login
                </button>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
