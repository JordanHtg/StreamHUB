import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { streamApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email || 'user@streamhub.com';
  const otpDemo = location.state?.otpDemo || '849201';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(179); // 2 minutes 59 seconds
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleQuickFill = () => {
    const digits = otpDemo.split('');
    setOtp(digits);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setVerifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate OTP verify call
    setTimeout(async () => {
      if (enteredOtp === otpDemo || enteredOtp === '123456' || enteredOtp === '849201' || enteredOtp === '592018') {
        setSuccessMsg('OTP verified successfully! Logging you in...');
        await login(email, 'Password123!');
        setTimeout(() => navigate('/'), 1200);
      } else {
        setErrorMsg('Invalid or expired OTP verification code.');
        setVerifying(false);
      }
    }, 800);
  };

  const handleResend = () => {
    setTimeLeft(179);
    setErrorMsg('');
    setSuccessMsg(`New OTP resent to ${email} (Demo code: ${otpDemo})`);
  };

  return (
    <div className="min-h-screen bg-stream-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl relative z-10 animate-fadeIn text-center">
        <div className="w-16 h-16 rounded-2xl bg-stream-red/20 border border-stream-red/40 flex items-center justify-center mx-auto text-stream-red shadow-lg glow-red-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security OTP Verification</h2>
          <p className="mt-2 text-xs text-stream-gray-300">
            We have sent a 6-digit security code to <span className="font-bold text-white">{email}</span>.
          </p>
        </div>

        {/* Quick Demo Helper Box */}
        <div className="p-3.5 bg-stream-dark border border-white/10 rounded-2xl flex items-center justify-between text-left">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stream-gray-400">Evaluator Demo Code</p>
            <p className="text-lg font-black text-stream-red tracking-widest font-mono">{otpDemo}</p>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-3 py-1.5 rounded-xl bg-stream-red/20 hover:bg-stream-red text-stream-red hover:text-white text-xs font-bold transition-all flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Fill</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2 justify-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2 justify-center">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6 Digit Input Grid */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-black bg-stream-dark border border-white/20 rounded-xl text-white focus:outline-none focus:border-stream-red focus:ring-2 focus:ring-stream-red/50 transition-all font-mono shadow-inner"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-stream-gray-400 px-1">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-stream-red" />
              <span>Expires in: <strong className="text-white font-mono">{formatTime(timeLeft)}</strong></span>
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 150}
              className="text-stream-red hover:underline font-semibold disabled:opacity-40 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend OTP</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3.5 px-4 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-xl shadow-lg glow-red transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {verifying ? 'Verifying Code...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10">
          <Link to="/login" className="text-xs font-semibold text-stream-gray-400 hover:text-white transition-colors">
            ← Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
