import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, LayoutDashboard, LogOut, Settings, X, Activity, HeartPulse, History, Menu, Sun, Moon } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'administrator':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">1. Administrator (Dev)</span>;
      case 'hrga_section_head':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">2. HRGA Section Head</span>;
      case 'hrga_leader':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">3. HRGA Leader</span>;
      case 'user_basic':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">4. User Basic</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{role}</span>;
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  const desktopBtnClass = (isActive) =>
    `flex items-center gap-3 px-4 py-3 rounded-full font-semibold transition-all ${
      isActive
        ? 'bg-[var(--primary-500)] text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)] -translate-y-[1px]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] hover:translate-x-1'
    }`;

  const mobileNavClass = (isActive) => 
    `flex flex-col items-center gap-1.5 p-2 text-xs font-semibold transition-colors ${
      isActive ? 'text-[var(--primary-500)]' : 'text-[var(--text-secondary)]'
    }`;

  const mobileNavIconClass = (isActive) =>
    `transition-colors ${isActive ? 'text-[var(--primary-500)] fill-[var(--primary-500)]/10' : 'text-[var(--text-secondary)]'}`;

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-shrink-0 bg-[var(--bg-card)] rounded-[24px] shadow-sm border border-[var(--border-color)] flex-col justify-between p-6 sticky top-6 h-[calc(100vh-3rem)] z-40 transition-colors duration-300">
        <div>
          {/* Official Brand Logo */}
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Cemindo Gemilang Logo" className="h-10 object-contain" />
              <div>
                <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight leading-none">Cemindo HRGA</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Plant Batam Portal</p>
              </div>
            </div>
            
            {/* Theme Toggle in Sidebar Header */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-105 transition-all"
              title={`Beralih ke ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
          </div>

          {/* User Card */}
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-4 mb-8">
            <div className="text-sm font-bold text-[var(--text-primary)]">{user?.nama || 'User'}</div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mb-3">@{user?.username}</div>
            <div>{getRoleBadge(user?.role)}</div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button className={desktopBtnClass(activeTab === 'karyawan')} onClick={() => handleNavClick('karyawan')}>
              <LayoutDashboard size={18} /> Data Karyawan
            </button>

            <button className={desktopBtnClass(activeTab === 'medical')} onClick={() => handleNavClick('medical')}>
              <HeartPulse size={18} /> Medical Plafond
            </button>

            <button className={desktopBtnClass(activeTab === 'medical_history')} onClick={() => handleNavClick('medical_history')}>
              <History size={18} /> Medical History
            </button>

            {(user?.role === 'administrator' || user?.permissions?.manage_users) && (
              <button className={desktopBtnClass(activeTab === 'users')} onClick={() => handleNavClick('users')}>
                <Users size={18} /> Kelola User (Admin)
              </button>
            )}

            {user?.role === 'administrator' && (
              <button className={desktopBtnClass(activeTab === 'system_logs')} onClick={() => handleNavClick('system_logs')}>
                <Activity size={18} /> Log System
              </button>
            )}

            <button className={desktopBtnClass(activeTab === 'settings')} onClick={() => handleNavClick('settings')}>
              <Settings size={18} /> Pengaturan
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          className="flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4"
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <LogOut size={18} /> Keluar (Logout)
        </button>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex justify-around items-center pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <button className={mobileNavClass(activeTab === 'karyawan')} onClick={() => handleNavClick('karyawan')}>
          <LayoutDashboard size={24} className={mobileNavIconClass(activeTab === 'karyawan')} />
          <span>Karyawan</span>
        </button>
        <button className={mobileNavClass(activeTab === 'medical')} onClick={() => handleNavClick('medical')}>
          <HeartPulse size={24} className={mobileNavIconClass(activeTab === 'medical')} />
          <span>Plafond</span>
        </button>
        <button className={mobileNavClass(activeTab === 'medical_history')} onClick={() => handleNavClick('medical_history')}>
          <History size={24} className={mobileNavIconClass(activeTab === 'medical_history')} />
          <span>History</span>
        </button>
        <button className={mobileNavClass(activeTab === 'settings')} onClick={() => handleNavClick('settings')}>
          <Settings size={24} className={mobileNavIconClass(activeTab === 'settings')} />
          <span>Settings</span>
        </button>
        <button className={mobileNavClass(isMoreOpen)} onClick={() => setIsMoreOpen(!isMoreOpen)}>
          <Menu size={24} className={mobileNavIconClass(isMoreOpen)} />
          <span>Lainnya</span>
        </button>
      </nav>

      {/* 3. Mobile "More" Drawer Overlay */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => setIsMoreOpen(false)}>
          <div className="w-full bg-[var(--bg-card)] rounded-t-[32px] p-6 animate-slide-up-sheet shadow-[0_-20px_40px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Menu Lainnya</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-secondary)]" onClick={() => setIsMoreOpen(false)}>
                  <X size={20}/>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {(user?.role === 'administrator' || user?.permissions?.manage_users) && (
                <button className={desktopBtnClass(activeTab === 'users')} onClick={() => handleNavClick('users')}>
                  <Users size={18} /> Kelola User (Admin)
                </button>
              )}
              {user?.role === 'administrator' && (
                <button className={desktopBtnClass(activeTab === 'system_logs')} onClick={() => handleNavClick('system_logs')}>
                  <Activity size={18} /> Log System
                </button>
              )}
              
              <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-4 mt-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{user?.nama || 'User'}</div>
                  <div className="text-xs font-medium text-[var(--text-secondary)]">@{user?.username}</div>
                </div>
                {getRoleBadge(user?.role)}
              </div>

              <div className="border-t border-[var(--border-color)] my-2" />
              <button className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/20 transition-colors" onClick={() => {
                setIsMoreOpen(false);
                setIsLogoutModalOpen(true);
              }}>
                <LogOut size={18} /> Keluar (Logout)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Logout Confirmation Modal (Bottom Sheet on Mobile) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setIsLogoutModalOpen(false)}>
          <div className="w-full sm:max-w-md bg-[var(--bg-card)] rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 animate-slide-up-sheet sm:animate-fade-in-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Konfirmasi Logout</h3>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors" onClick={() => setIsLogoutModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-[var(--text-secondary)] font-medium text-base mb-8 leading-relaxed">
              Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses data.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-[var(--text-primary)] bg-[var(--bg-color)] border border-[var(--border-color)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsLogoutModalOpen(false)}>
                Batal
              </button>
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all" onClick={() => {
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
