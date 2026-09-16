import React from 'react';
import { X, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

const RoleChecklistModal = ({ isOpen, onClose, currentRole }) => {
  if (!isOpen) return null;

  const rolesMatrix = [
    {
      feature: 'Lihat Data & Cari Karyawan',
      admin: true,
      head: true,
      leader: true
    },
    {
      feature: 'Tambah Data Karyawan Baru (NIK bebas/angka)',
      admin: true,
      head: true,
      leader: true
    },
    {
      feature: 'Update Data / Status Karyawan (Aktif/Non-Aktif)',
      admin: true,
      head: true,
      leader: true
    },
    {
      feature: 'Hapus Data Karyawan Non-Aktif (Soft Delete)',
      admin: true,
      head: true,
      leader: false
    },
    {
      feature: 'Kelola System Users & Hak Akses',
      admin: true,
      head: false,
      leader: false
    },
    {
      feature: 'Export Data (CSV / Excel)',
      admin: true,
      head: true,
      leader: true
    },
    {
      feature: 'Export Data Medical (Excel)',
      admin: true,
      head: false,
      leader: false
    },
    {
      feature: 'Bulk Reset Budget Medical (Semua Karyawan)',
      admin: true,
      head: false,
      leader: false
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} color="#6366f1" />
            <h3>Matriks Hak Akses & Matriks Role</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Daftar fitur dan batasan akses untuk masing-masing role di Sistem Portal HRGA PT Cemindo Gemilang Tbk:
        </p>

        <div className="table-container" style={{ maxHeight: '380px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fitur System</th>
                <th style={{ textAlign: 'center' }}>Administrator</th>
                <th style={{ textAlign: 'center' }}>Section Head</th>
                <th style={{ textAlign: 'center' }}>HRGA Leader</th>
              </tr>
            </thead>
            <tbody>
              {rolesMatrix.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{item.feature}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.admin ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {item.head ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {item.leader ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default RoleChecklistModal;
