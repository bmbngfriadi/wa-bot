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
import { Menu, AlertTriangle, X } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png';

const MainLayout = () => {
  const { user, sessionExpiredMessage, setSessionExpiredMessage } = useContext(AuthContext);
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile Sticky Top Header */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src={LOGO_URL} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sidebar-text)' }}>Cemindo HRGA</span>
        </div>
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Buka Menu Sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="app-container">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="main-content">
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
