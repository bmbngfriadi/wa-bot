import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, ArrowRight, Sun, Moon, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import api from '../services/api';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const Login = () => {
  const { login, loading, error, theme, toggleTheme } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setIsResetLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetMessage(response.data.message);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Terjadi kesalahan pada server');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="login-split-container page-transition">
      {/* Dark Mode Toggle - Positioned top right globally */}
      <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50">
        <button
          onClick={toggleTheme}
          className="w-12 h-12 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-[var(--surface)] border border-gray-200 dark:border-gray-700/50 shadow-sm text-[var(--primary-600)] dark:text-[var(--primary-400)] hover:scale-105 transition-transform"
          title={`Beralih ke ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Left side (Top on mobile) */}
      <div className="login-left-panel">
        {/* Floating Glowing Orbs for "Alive" aesthetic */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse mix-blend-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse mix-blend-overlay" style={{ animationDelay: '1s' }}></div>

        <div className="text-center lg:text-left mx-auto lg:mx-0 lg:ml-12 xl:ml-20 flex flex-col h-full justify-center lg:justify-start lg:py-12 relative z-10 px-6 lg:px-0 mt-12 lg:mt-0 pb-24 lg:pb-12">
          <div className="animate-fade-down">
            <div className="bg-white p-3 rounded-xl inline-block mb-4 lg:mb-10 shadow-lg border border-white/20">
              <img src={LOGO_URL} alt="Semen Merah Putih Logo" className="h-9 lg:h-10 object-contain" />
            </div>
            <h1 className="text-2xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight mb-4 lg:mb-6 leading-tight text-white drop-shadow-sm">
              HRGA Web <br className="hidden lg:block" />Portal System
            </h1>
            <p className="text-white/90 text-sm lg:text-lg max-w-md leading-relaxed font-medium mx-auto lg:mx-0 drop-shadow-sm">
              Sistem manajemen data administrasi karyawan yang terintegrasi dengan BOT Whatsapp.
            </p>
          </div>
          <div className="hidden lg:block mt-auto pt-16 text-white/70 text-sm font-semibold tracking-wide animate-fade-in delay-200">
            PT CEMINDO GEMILANG TBK - PLANT BATAM
          </div>
        </div>
      </div>

      {/* Right side (Bottom overlapping card on mobile) */}
      <div className="login-right-panel animate-fade-up delay-100">
        <div className="login-right-content text-center lg:text-left">
          <div className="mb-10 -mt-2 lg:mt-0">
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Selamat Datang</h2>
            <p className="text-[var(--text-secondary)] font-medium">
              Silakan login untuk mengakses dashboard operasional.
            </p>
          </div>

          {isForgotPassword ? (
            <div className="animate-fade-in-up">
              {resetMessage && (
                <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
                  {resetMessage}
                </div>
              )}
              {resetError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
                  {resetError}
                </div>
              )}
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5 ml-1">Email Akun Anda</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                      <User size={18} />
                    </div>
                    <input
                      type="email"
                      className="form-control pl-11"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/30 transition-all shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5"
                  disabled={isResetLoading}
                >
                  {isResetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
              <div className="text-center mt-6">
                <button
                  type="button"
                  className="text-sm font-bold text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5 ml-1">Username / Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      className="form-control pl-11"
                      placeholder="Enter your username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control pl-11 pr-11"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[var(--primary-500)] focus:ring-[var(--primary-500)] accent-[var(--primary-500)]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm font-bold text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Lupa Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/30 transition-all shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin mr-2" /> Processing...</>
                  ) : (
                    <>Sign In <ArrowRight size={18} className="ml-2" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="mt-12 text-center lg:text-left text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Semen Merah Putih - Plant Batam
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
