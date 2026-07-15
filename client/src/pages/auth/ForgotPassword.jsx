import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PlayCircle, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { forgotPassword } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    const res = await forgotPassword(data.email);
    if (res.success) {
      setSuccessMsg(res.message || 'OTP sent! Redirecting to verification...');
      setTimeout(() => {
        navigate('/otp-verify', { state: { email: data.email, otpDemo: res.otpDemo || '592018' } });
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Could not send OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-stream-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl relative z-10 animate-fadeIn">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-stream-red flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 glow-red">
              <PlayCircle className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white font-display">
              Stream<span className="text-stream-red">HUB</span>
            </span>
          </Link>
          <div className="mt-6 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-stream-red">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">Forgot Password?</h2>
          <p className="mt-2 text-xs text-stream-gray-400 max-w-xs mx-auto">
            Enter your email address and we will send you an OTP verification code to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

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
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="user@streamhub.com"
                className="w-full bg-stream-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
              />
            </div>
            {errors.email && <span className="text-[11px] text-stream-red mt-1 block">{errors.email.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-xl shadow-lg glow-red flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            <span>Send OTP Verification Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/10">
          <Link to="/login" className="text-xs font-semibold text-stream-gray-400 hover:text-white transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
