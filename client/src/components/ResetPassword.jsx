import React, { useState } from 'react';
import api from '../services/api';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const ResetPassword = ({ token }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password.length < 4) {
            setError('Password minimal 4 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/reset-password', { token, newPassword: password });
            setMessage(response.data.message);
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mereset password');
        } finally {
            setIsLoading(false);
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
                
                {/* Header Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={LOGO_URL}
                            alt="Cemindo Gemilang Logo"
                            style={{ height: '65px', objectFit: 'contain', maxWidth: '100%' }}
                        />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Buat Password Baru</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Silakan masukkan password baru untuk akun Anda.
                    </p>
                </div>

                {message && (
                    <div style={{ background: '#c6f6d5', color: '#22543d', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <CheckCircle size={18} /> {message}
                    </div>
                )}
                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '0.85rem 1rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {isSuccess ? (
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}
                        onClick={() => window.location.href = '/'}
                    >
                        Kembali ke Login <ArrowRight size={18} style={{ marginLeft: '8px', display: 'inline' }} />
                    </button>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password Baru</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Minimal 4 karakter"
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Konfirmasi Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Ulangi password baru"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </button>
                    </form>
                )}
                
                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    © 2026 PT Cemindo Gemilang Tbk - All Rights Reserved
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

