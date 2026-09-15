import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, LayoutDashboard, LogOut, Settings, X, Activity, HeartPulse, History, Menu } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'administrator':
        return <span className="badge badge-role-admin">1. Administrator (Dev)</span>;
      case 'hrga_section_head':
        return <span className="badge badge-role-head">2. HRGA Section Head</span>;
      case 'hrga_leader':
        return <span className="badge badge-role-leader">3. HRGA Leader</span>;
      case 'user_basic':
        return <span className="badge badge-role-basic">4. User Basic</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="sidebar desktop-sidebar">
        <div>
          {/* Official Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={LOGO_URL}
                alt="Cemindo Gemilang Logo"
                style={{ height: '40px', objectFit: 'contain' }}
              />
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sidebar-text)', letterSpacing: '-0.02em' }}>Cemindo HRGA</h2>
                <p style={{ fontSize: '0.725rem', color: 'var(--sidebar-text-muted)' }}>Plant Batam • Portal System</p>
              </div>
            </div>
          </div>

          {/* User Card */}
          <div style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--sidebar-text)' }}>{user?.nama || 'User'}</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--sidebar-text-muted)', marginBottom: '0.5rem' }}>@{user?.username}</div>
            <div>{getRoleBadge(user?.role)}</div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              className={`btn ${activeTab === 'karyawan' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => handleNavClick('karyawan')}
            >
              <LayoutDashboard size={18} />
              Data Karyawan
            </button>

            <button
              className={`btn ${activeTab === 'medical' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => handleNavClick('medical')}
            >
              <HeartPulse size={18} />
              Medical Plafond
            </button>

            <button
              className={`btn ${activeTab === 'medical_history' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => handleNavClick('medical_history')}
            >
              <History size={18} />
              Medical History
            </button>

            {(user?.role === 'administrator' || user?.permissions?.manage_users) && (
              <button
                className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleNavClick('users')}
              >
                <Users size={18} />
                Kelola User (Admin)
              </button>
            )}

            {user?.role === 'administrator' && (
              <button
                className={`btn ${activeTab === 'system_logs' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleNavClick('system_logs')}
              >
                <Activity size={18} />
                Log System
              </button>
            )}

            <button
              className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => handleNavClick('settings')}
            >
              <Settings size={18} />
              Pengaturan (Settings)
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-ghost"
          style={{ justifyContent: 'flex-start', width: '100%', color: '#f87171' }}
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <LogOut size={18} />
          Keluar (Logout)
        </button>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav-bar mobile-only">
        <button className={`bottom-nav-item ${activeTab === 'karyawan' ? 'active' : ''}`} onClick={() => handleNavClick('karyawan')}>
          <LayoutDashboard size={22} />
          <span>Karyawan</span>
        </button>
        <button className={`bottom-nav-item ${activeTab === 'medical' ? 'active' : ''}`} onClick={() => handleNavClick('medical')}>
          <HeartPulse size={22} />
          <span>Plafond</span>
        </button>
        <button className={`bottom-nav-item ${activeTab === 'medical_history' ? 'active' : ''}`} onClick={() => handleNavClick('medical_history')}>
          <History size={22} />
          <span>History</span>
        </button>
        <button className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleNavClick('settings')}>
          <Settings size={22} />
          <span>Settings</span>
        </button>
        <button className={`bottom-nav-item ${isMoreOpen ? 'active' : ''}`} onClick={() => setIsMoreOpen(!isMoreOpen)}>
          <Menu size={22} />
          <span>Lainnya</span>
        </button>
      </nav>

      {/* 3. Mobile "More" Drawer */}
      <div className={`more-drawer-backdrop mobile-only ${isMoreOpen ? 'open' : ''}`} onClick={() => setIsMoreOpen(false)} />
      <div className={`more-drawer mobile-only ${isMoreOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Menu Lainnya</h3>
          <button className="close-btn" onClick={() => setIsMoreOpen(false)}><X size={20}/></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(user?.role === 'administrator' || user?.permissions?.manage_users) && (
            <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleNavClick('users')}>
              <Users size={18} /> Kelola User (Admin)
            </button>
          )}
          {user?.role === 'administrator' && (
            <button className={`btn ${activeTab === 'system_logs' ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleNavClick('system_logs')}>
              <Activity size={18} /> Log System
            </button>
          )}
          
          <div style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1rem',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.nama || 'User'}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>@{user?.username}</div>
            </div>
            {getRoleBadge(user?.role)}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', color: '#f87171' }} onClick={() => {
            setIsMoreOpen(false);
            setIsLogoutModalOpen(true);
          }}>
            <LogOut size={18} /> Keluar (Logout)
          </button>
        </div>
      </div>

      {/* 4. Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogoutModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Konfirmasi Logout</h3>
              <button className="close-btn" onClick={() => setIsLogoutModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginTop: '1rem', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses data.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsLogoutModalOpen(false)}>Batal</button>
              <button className="btn btn-danger" onClick={() => {
                setIsLogoutModalOpen(false);
                logout();
              }}>
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
