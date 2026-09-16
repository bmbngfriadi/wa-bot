import React, { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider, ToastContext } from './context/ToastContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserAdmin from './pages/UserAdmin';
import Settings from './pages/Settings';
import SystemLogs from './pages/SystemLogs';
import MedicalPlafond from './pages/MedicalPlafond';
import MedicalHistory from './pages/MedicalHistory';
import Sidebar from './components/Sidebar';
import RoleChecklistModal from './components/RoleChecklistModal';
import ResetPassword from './components/ResetPassword';
import { Sun, Moon } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const MainLayout = () => {
  const { user, sessionExpiredMessage, setSessionExpiredMessage, theme, toggleTheme } = useContext(AuthContext);
  const { showAlert } = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState('karyawan');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically direct to Data Karyawan menu on fresh login
  useEffect(() => {
    if (user) {
      setActiveTab('karyawan');
    }
  }, [user?.id]);

  // Trigger Custom Alert Modal on 10-minute inactivity session timeout
  useEffect(() => {
    if (sessionExpiredMessage) {
      showAlert({
        title: 'Sesi Login Kedaluwarsa',
        message: sessionExpiredMessage,
        type: 'warning',
        buttonText: 'OK, Login Kembali'
      }).then(() => {
        setSessionExpiredMessage('');
      });
    }
  }, [sessionExpiredMessage]);

  // Check for resetToken in URL
  const searchParams = new URLSearchParams(window.location.search);
  const resetToken = searchParams.get('resetToken');

  if (resetToken) {
    return <ResetPassword token={resetToken} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-color)] transition-colors duration-300">
      {/* Mobile Sticky Top Header */}
      <div className="flex lg:hidden items-center justify-between p-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-8 object-contain" />
          <span className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight">HRGA Web Portal System</span>
        </div>
        
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex-shrink-0 ml-2"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
        </button>
      </div>

      <div className="flex w-full min-h-screen p-0 lg:p-6 gap-6 relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main key={activeTab} className="page-transition flex-1 bg-[var(--bg-card)] lg:rounded-[24px] lg:border lg:border-[var(--border-color)] shadow-sm p-4 lg:p-8 min-h-full overflow-x-hidden pb-24 lg:pb-8 transition-colors duration-300 w-full max-w-full">
          {activeTab === 'karyawan' && <Dashboard />}
          {activeTab === 'medical' && <MedicalPlafond />}
          {activeTab === 'medical_history' && <MedicalHistory />}
          {activeTab === 'users' && user.role === 'administrator' && <UserAdmin />}
          {activeTab === 'system_logs' && user.role === 'administrator' && <SystemLogs />}
          {activeTab === 'settings' && <Settings />}
        </main>

        <RoleChecklistModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          currentRole={user.role}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
