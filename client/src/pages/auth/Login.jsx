import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PlayCircle, Mail, Lock, LogIn, AlertCircle, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, socialLogin, loading, mockMode, toggleMockMode } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await login(data.email, data.password);
    if (res.success) {
      if (res.user?.role === 'Uploader') {
        navigate('/uploader/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-stream-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-stream-red selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-stream-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl relative z-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-stream-red flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 glow-red">
              <PlayCircle className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white font-display">
              Stream<span className="text-stream-red">HUB</span>
            </span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-xs text-stream-gray-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-stream-red hover:text-stream-red-hover transition-colors">
              create a new enterprise account
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email_input"
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="user@streamhub.com"
                className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
              />
            </div>
            {errors.email && <span className="text-[11px] text-stream-red mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-stream-red hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password_input"
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
              />
            </div>
            {errors.password && <span className="text-[11px] text-stream-red mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-xl shadow-lg glow-red flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-stream-card text-stream-gray-400 font-semibold tracking-wider">
                Or Continue With
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => socialLogin('Google').then(() => navigate('/'))}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stream-gray-400">
          <span className="flex items-center space-x-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /><span>256-bit Encrypted</span></span>
          <button onClick={toggleMockMode} className="hover:text-white font-medium">
            {mockMode ? '⚡ Hybrid Mock Active' : '📡 Live API Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
