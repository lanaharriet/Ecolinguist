import React, { useState, useEffect } from 'react';
import { login, register } from '../services/api';
import { Mail, Lock, User, Sprout, ChevronRight, Check } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });

  // Load saved username on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('saved_username');
    if (savedUser) {
      setFormData(prev => ({ ...prev, username: savedUser }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login({ username: formData.username, password: formData.password });
        localStorage.setItem('access_token', res.data.access);
        
        // Save username if remember me is checked
        if (rememberMe) {
          localStorage.setItem('saved_username', formData.username);
        } else {
          localStorage.removeItem('saved_username');
        }
        
        window.location.href = '/'; // Force reload to trigger auth check in App.jsx
      } else {
        // Sign Up
        const res = await register(formData);
        localStorage.setItem('access_token', res.data.access);
        
        // Smooth transition to dashboard
        window.location.href = '/';
      }
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0c0d]">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: 'url("/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) blur(4px)'
        }}
      />
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] z-0 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] z-0" />

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 md:px-0 animate-slide-up">
        <div className="glass-panel p-8 md:p-10 flex flex-col gap-8 border-white/10 shadow-2xl overflow-hidden relative">
          
          {/* Progress Bar for Loading */}
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/20 overflow-hidden">
              <div className="h-full bg-emerald-500 animate-pulse w-1/3 shadow-[0_0_10px_#10b981]" />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center transition-all duration-500 transform">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner animate-float">
              <Sprout size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join EcoLinguist'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm max-w-[280px] mx-auto">
                {isLogin ? 'Enter your credentials to access your farm dashboard.' : 'Start your journey towards sustainable farming today.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form 
            key={isLogin ? 'login' : 'signup'}
            onSubmit={handleSubmit} 
            className="flex flex-col gap-5 animate-fade-in-scale"
          >
            <div className="flex flex-col gap-4">
              {/* Username Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-400 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              {/* Email Field (Sign Up only) */}
              {!isLogin && (
                <div className="relative group animate-slide-up">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    placeholder="Email Address"
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              )}

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  placeholder="Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}
                  >
                    {rememberMe && <Check size={14} className="text-emerald-950 font-bold" />}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-2">
            <button 
              onClick={() => {
                // Smooth state change
                setIsLogin(!isLogin);
              }} 
              className="text-sm text-muted-foreground hover:text-white transition-colors group"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-emerald-400 font-bold group-hover:underline ml-1">
                {isLogin ? 'Sign Up' : 'Log In'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Help Link */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/40 font-bold tracking-[0.2em] uppercase">
            &copy; 2026 ECOLINGUIST AI &bull; SECURED BY LLAMA-70B
          </p>
        </div>
      </div>
    </div>
  );
}
