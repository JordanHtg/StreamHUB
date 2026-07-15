import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PlayCircle, Mail, Lock, User, Phone, Calendar, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: authRegister, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await authRegister(data);
    if (res.success) {
      if (res.otpDemo || res.requiresOtp) {
        navigate('/otp-verify', { state: { email: data.email, otpDemo: res.otpDemo || '849201' } });
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-stream-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-stream-red/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-6 glass-panel p-8 sm:p-10 rounded-3xl relative z-10 animate-fadeIn">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-stream-red flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 glow-red">
              <PlayCircle className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white font-display">
              Stream<span className="text-stream-red">HUB</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">Create your Enterprise Account</h2>
          <p className="mt-1 text-xs text-stream-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-stream-red hover:underline">
              Sign In here
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Alex Rivera"
                  className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
                />
              </div>
              {errors.name && <span className="text-[11px] text-stream-red mt-1 block">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  {...register('username', { required: 'Username is required' })}
                  placeholder="alex_rivera"
                  className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
                />
              </div>
              {errors.username && <span className="text-[11px] text-stream-red mt-1 block">{errors.username.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="alex@streamhub.com"
                  className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
                />
              </div>
              {errors.email && <span className="text-[11px] text-stream-red mt-1 block">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  placeholder="+6289876543210"
                  className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
                />
              </div>
              {errors.phone && <span className="text-[11px] text-stream-red mt-1 block">{errors.phone.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                Birth Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  {...register('birthDate')}
                  defaultValue="1998-05-15"
                  className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                {...register('gender')}
                defaultValue="Female"
                className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red transition-all"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stream-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                placeholder="••••••••"
                className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
              />
            </div>
            {errors.password && <span className="text-[11px] text-stream-red mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-xl shadow-lg glow-red flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register & Start Streaming'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
