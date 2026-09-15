import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';
import api from '../services/api';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const Login = () => {
  const { login, loading, error, theme, toggleTheme } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-login)',
      padding: '1.5rem',
      transition: 'background 0.3s ease'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: '8px', position: 'relative' }}>

        {/* Theme Toggle Button */}
        <button
          onClick={() => toggleTheme()}
          className="btn btn-secondary btn-icon"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: '50%' }}
          title={`Beralih ke ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#b51d22" />}
        </button>

        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src={LOGO_URL}
              alt="Cemindo Gemilang Logo"
              style={{ height: '65px', objectFit: 'contain', maxWidth: '100%' }}
            />
          </div>
          <h2 style={{ fontSize: '1.5em', fontWeight: 800, color: 'var(--text-main)' }}>HRGA Web Portal</h2>
          <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            PT Cemindo Gemilang Tbk - Plant Batam
          </p>
        </div>

        {isForgotPassword ? (
          <>
            {resetMessage && (
              <div style={{ background: '#c6f6d5', color: '#22543d', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.85em', marginBottom: '1.5rem', textAlign: 'center' }}>
                {resetMessage}
              </div>
            )}
            {resetError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '0.85rem 1rem', color: '#dc2626', fontSize: '0.85em', marginBottom: '1.5rem', textAlign: 'center' }}>
                {resetError}
              </div>
            )}
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Email Akun Anda</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Masukkan alamat email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={isResetLoading}>
                {isResetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85em', fontWeight: 600 }} onClick={() => setIsForgotPassword(false)}>
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
                fontSize: '0.85em',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '0.95em' }}
                disabled={loading}
              >
                {loading ? 'Memproses Authentikasi...' : <>Masuk ke Sistem <ArrowRight size={18} /></>}
              </button>
            </form>
            <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
              <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85em' }} onClick={() => setIsForgotPassword(true)}>
                Lupa Password?
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75em', color: 'var(--text-dim)' }}>
          © 2026 PT Cemindo Gemilang Tbk - Plant Batam
        </div>

      </div>
    </div>
  );
};

export default Login;
