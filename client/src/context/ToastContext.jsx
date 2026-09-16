import React, { createContext, useState, useContext } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  // Show Toast Notification (auto-dismiss)
  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Show Custom Alert Dialog (Returns Promise resolved on close)
  const showAlert = ({ title = 'Pemberitahuan', message, type = 'info', buttonText = 'OK' }) => {
    return new Promise((resolve) => {
      setConfirmModal({
        title,
        message,
        type,
        confirmText: buttonText,
        cancelText: null, // Single button alert mode
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(true);
        }
      });
    });
  };

  // Show Custom Confirm Dialog (Returns Promise<boolean>)
  const showConfirm = ({
    title = 'Konfirmasi Kebutuhan',
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      setConfirmModal({
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        }
      });
    });
  };

  return (
    <ToastContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
              {toast.type === 'error' && <XCircle size={18} color="#ef4444" />}
              {toast.type === 'warning' && <AlertTriangle size={18} color="#f59e0b" />}
              {toast.type === 'info' && <Info size={18} color="var(--primary-500)" />}
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{toast.message}</span>
            </div>
            <button className="close-btn" onClick={() => removeToast(toast.id)} style={{ padding: '2px' }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom Confirmation / Alert Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={confirmModal.onCancel}>
          <div
            className="modal-content"
            style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem 1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Type Icon */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: confirmModal.type === 'danger' || confirmModal.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                          confirmModal.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                          confirmModal.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(181, 29, 34, 0.15)'
            }}>
              {confirmModal.type === 'danger' || confirmModal.type === 'error' ? (
                <XCircle size={32} color="#ef4444" />
              ) : confirmModal.type === 'warning' ? (
                <AlertTriangle size={32} color="#f59e0b" />
              ) : confirmModal.type === 'success' ? (
                <CheckCircle2 size={32} color="#10b981" />
              ) : (
                <Info size={32} color="var(--primary-500)" />
              )}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {confirmModal.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              {confirmModal.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {confirmModal.cancelText && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.7rem' }}
                  onClick={confirmModal.onCancel}
                >
                  {confirmModal.cancelText}
                </button>
              )}
              <button
                type="button"
                className={`btn ${confirmModal.type === 'danger' || confirmModal.type === 'error' ? 'btn-danger' : 'btn-primary'}`}
                style={{ flex: 1, padding: '0.7rem' }}
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
