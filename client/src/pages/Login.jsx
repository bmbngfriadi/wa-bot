import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Lock, User, ArrowRight, Sun, Moon, Eye, EyeOff } from 'lucide-react';
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
    <div className="login-split-container">
      {/* Left Panel - Branding */}
      <div className="login-left-panel">
        <div className="login-brand-wrapper">
          <div className="login-logo-box">
            <img
              src={LOGO_URL}
              alt="Cemindo Gemilang Logo"
              style={{ height: '55px', objectFit: 'contain' }}
            />
          </div>
          
          <div className="login-left-content">
            <h1>HRGA Web<br />Portal System</h1>
            <hr />
            <p>
              Sistem manajemen operasional dan administrasi karyawan terpadu untuk efisiensi dan transparansi lingkungan kerja.
            </p>
          </div>
        </div>
        
        <div className="login-footer-text">
          PT CEMINDO GEMILANG TBK - PLANT BATAM
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-right-panel">
        {/* Theme Toggle Button */}
        <button
          onClick={() => toggleTheme()}
          className="btn btn-secondary btn-icon"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: '50%' }}
          title={`Beralih ke ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#b51d22" />}
        </button>

        <div className="login-right-content">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Selamat Datang</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Silakan login untuk mengakses dashboard operasional.
            </p>
          </div>

          {isForgotPassword ? (
            <>
              {resetMessage && (
                <div style={{ background: '#c6f6d5', color: '#22543d', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {resetMessage}
                </div>
              )}
              {resetError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '0.85rem 1rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {resetError}
                </div>
              )}
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Email Akun Anda</label>
                  <div style={{ position: 'relative' }}>
                    <div className="login-icon-wrapper"><User size={18} /></div>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 600 }} disabled={isResetLoading}>
                  {isResetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => setIsForgotPassword(false)}>
                  Kembali ke Login
                </button>
              </div>
            </>
          ) : (
            <>
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '0.85rem 1rem',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem'
                }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Username / Email</label>
                  <div style={{ position: 'relative' }}>
                    <div className="login-icon-wrapper"><User size={18} /></div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <div className="login-icon-wrapper"><Lock size={18} /></div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, margin: 0, color: 'var(--text-muted)' }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-500)' }} />
                    Remember me
                  </label>
                  <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }} onClick={() => setIsForgotPassword(true)}>
                    Lupa Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 600, justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : <>Sign In <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} /></>}
                </button>
              </form>
            </>
          )}

          <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
            © 2026 SEMEN MERAH PUTIH
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
