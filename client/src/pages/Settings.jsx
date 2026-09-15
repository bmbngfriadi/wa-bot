import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import { Sun, Moon, Check, Monitor, Database, ShieldCheck, KeyRound, Lock } from 'lucide-react';

const Settings = () => {
  const { user, theme, toggleTheme } = useContext(AuthContext);
  const { showToast, showConfirm } = useContext(ToastContext);

  // Self Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (newPassword.length < 4) {
      setPassError('Password baru minimal 4 karakter.');
      return;
    }

    const isConfirmed = await showConfirm({
      title: 'Konfirmasi Ubah Password',
      message: 'Apakah Anda yakin ingin mengubah password akun Anda?',
      confirmText: 'Ya, Ubah Password',
    });

    if (!isConfirmed) return;

    setPassLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      const msg = res.data.message || 'Password berhasil diperbarui.';
      setPassSuccess(msg);
      showToast(msg, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal merubah password. Periksa password lama Anda.';
      setPassError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSelectTheme = (mode) => {
    toggleTheme(mode);
    showToast(`Tema berhasil diubah ke ${mode === 'dark' ? 'Dark Mode (Gelap)' : 'Light Mode (Terang)'}.`, 'info');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6em', fontWeight: 800, color: 'var(--text-main)' }}>Pengaturan Sistem (Settings)</h1>
        <p style={{ fontSize: '0.875em', color: 'var(--text-muted)' }}>
          Atur preferensi tema antarmuka dan ubah password akun Anda.
        </p>
      </div>

      {/* Theme Selection Card */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1em', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Tampilan Tema (Theme Mode)
        </h3>
        <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Pilih tema antarmuka sesuai kenyamanan mata Anda. Seluruh elemen (font, kartu, tabel, dan warna) akan menyesuaikan secara otomatis.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => handleSelectTheme('dark')}
            style={{
              padding: '1.5rem',
              borderRadius: '4px',
              border: `2px solid ${theme === 'dark' ? 'var(--primary-500)' : 'var(--border-color)'}`,
              background: '#0d0e12',
              color: '#fff',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxShadow: theme === 'dark' ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Moon size={24} color="var(--primary-500)" />
              {theme === 'dark' && <div style={{ background: 'var(--primary-500)', borderRadius: '50%', padding: '2px' }}><Check size={14} color="#fff" /></div>}
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1em', color: '#fff' }}>Dark Mode (Mode Gelap)</h4>
            <p style={{ fontSize: '0.775em', color: '#9ca3af', marginTop: '0.25rem' }}>
              Tampilan gelap futuristik dengan kontras merah Cemindo yang elegan.
            </p>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => handleSelectTheme('light')}
            style={{
              padding: '1.5rem',
              borderRadius: '4px',
              border: `2px solid ${theme === 'light' ? 'var(--primary-500)' : 'var(--border-color)'}`,
              background: '#ffffff',
              color: '#0f172a',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxShadow: theme === 'light' ? '0 0 20px rgba(181, 29, 34, 0.25)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Sun size={24} color="#f59e0b" />
              {theme === 'light' && <div style={{ background: 'var(--primary-500)', borderRadius: '50%', padding: '2px' }}><Check size={14} color="#fff" /></div>}
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1em', color: '#0f172a' }}>Light Mode (Mode Terang)</h4>
            <p style={{ fontSize: '0.775em', color: '#64748b', marginTop: '0.25rem' }}>
              Tampilan bersih terang dengan latar belakang putih slate dan visibilitas tinggi.
            </p>
          </div>
        </div>
      </div>

      {/* Self Change Password Card (All Roles) */}
      <div className="glass-card" style={{ marginBottom: user?.role === 'administrator' ? '2rem' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <KeyRound size={22} color="var(--primary-500)" />
          <h3 style={{ fontSize: '1.1em', fontWeight: 700, color: 'var(--text-main)' }}>
            Ubah Password Akun Saya (@{user?.username})
          </h3>
        </div>
        <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Fitur ubah password dapat digunakan oleh semua role ({user?.nama}) untuk menjaga keamanan akun Anda.
        </p>

        {passError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            color: '#f87171',
            fontSize: '0.85em',
            marginBottom: '1.25rem'
          }}>
            {passError}
          </div>
        )}

        {passSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            color: '#34d399',
            fontSize: '0.85em',
            marginBottom: '1.25rem'
          }}>
            {passSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
          <div className="form-group">
            <label>Password Saat Ini</label>
            <input
              type="password"
              className="form-control"
              placeholder="Masukkan password lama"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password Baru</label>
            <input
              type="password"
              className="form-control"
              placeholder="Masukkan password baru (min 4 karakter)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Konfirmasi Password Baru</label>
            <input
              type="password"
              className="form-control"
              placeholder="Ketik ulang password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={passLoading}
          >
            {passLoading ? 'Memperbarui...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>

      {/* System Status Information (ONLY Administrator Role) */}
      {user?.role === 'administrator' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1em', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Informasi & Integrasi Sistem (Administrator Only)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--input-bg)', borderRadius: '4px' }}>
              <Database size={20} color="var(--primary-500)" />
              <div>
                <div style={{ fontSize: '0.9em', fontWeight: 600, color: 'var(--text-main)' }}>Database Server (MySQL)</div>
                <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>`cemindo_hr` • Terhubung langsung dengan WhatsApp Bot</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--input-bg)', borderRadius: '4px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.9em', fontWeight: 600, color: 'var(--text-main)' }}>Autentikasi & Keamanan (RBAC)</div>
                <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Token JWT Terenkripsi (Berlaku 24 jam) • Proteksi Izin Akses Granular</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--input-bg)', borderRadius: '4px' }}>
              <Monitor size={20} color="#3b82f6" />
              <div>
                <div style={{ fontSize: '0.9em', fontWeight: 600, color: 'var(--text-main)' }}>Express REST API Server</div>
                <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>http://localhost:5000/api</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
