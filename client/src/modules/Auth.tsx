import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@lifeadmin.ai');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { email, password });
        login(response.data.user, response.data.token);
        navigate('/');
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const response = await api.post('/auth/register', { name, email, password });
        login(response.data.user, response.data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
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

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl shadow-soft border border-slate-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin 
                ? 'Please enter your credentials to access your dashboard'
                : 'Sign up to start organizing your personal records'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="input-field pl-10 h-12" 
                    required={!isLogin}
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
              <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Password</label>
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

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <label htmlFor="remember" className="text-xs font-medium text-slate-500">Remember Me</label>
                </div>
                <button type="button" className="text-xs font-bold text-primary hover:underline uppercase tracking-tight">Forgot Password?</button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary h-12 text-base shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {loading 
                ? 'Processing...' 
                : isLogin ? 'Login' : 'Create Account'
              }
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-slate-50">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
              <button 
                onClick={() => {
                  setError(null);
                  setIsLogin(!isLogin);
                }}
                className="font-bold text-primary hover:underline uppercase tracking-tighter cursor-pointer"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
