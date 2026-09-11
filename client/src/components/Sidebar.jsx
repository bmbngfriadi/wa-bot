import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, LayoutDashboard, LogOut, Info, Settings, X, Activity, HeartPulse, History } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const Sidebar = ({ activeTab, setActiveTab, onOpenRoleModal, isOpenMobile, onCloseMobile }) => {
  const { user, logout } = useContext(AuthContext);

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
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
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

            {/* Mobile Close Button */}
            {isOpenMobile && (
              <button className="close-btn" onClick={onCloseMobile} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            )}
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
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
        >
          <LogOut size={18} />
          Keluar (Logout)
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
