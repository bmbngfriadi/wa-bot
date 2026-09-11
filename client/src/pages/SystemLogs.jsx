import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import { Activity, Clock } from 'lucide-react';

const SystemLogs = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs');
      setLogs(res.data.logs);
    } catch (err) {
      console.error('Fetch logs error:', err);
      showToast(err.response?.data?.message || 'Gagal mengambil data log.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'administrator') {
      fetchLogs();
    }
  }, [user]);

  const getActionBadge = (action) => {
    let color = '';
    let bgColor = '';
    
    if (action.includes('LOGIN')) {
      color = '#10b981'; bgColor = '#10b98120';
    } else if (action.includes('LOGOUT')) {
      color = '#8b5cf6'; bgColor = '#8b5cf620';
    } else if (action.includes('CREATE') || action.includes('IMPORT')) {
      color = '#3b82f6'; bgColor = '#3b82f620';
    } else if (action.includes('UPDATE') || action.includes('CHANGE') || action.includes('RESET')) {
      color = '#f59e0b'; bgColor = '#f59e0b20';
    } else if (action.includes('DELETE')) {
      color = '#ef4444'; bgColor = '#ef444420';
    } else {
      color = '#6b7280'; bgColor = '#f3f4f6';
    }

    return (
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        color: color,
        backgroundColor: bgColor,
        display: 'inline-block'
      }}>
        {action}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (user?.role !== 'administrator') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444', fontWeight: 600 }}>
        Akses Ditolak. Halaman ini khusus untuk Administrator.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="var(--primary-500)" />
            System Activity Logs
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Memantau seluruh aktivitas perubahan data (CRUD) dan login di dalam sistem secara real-time. (Maks 500 log terakhir)
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh Logs'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Waktu / Tanggal</th>
                <th>Aksi (Action)</th>
                <th>Deskripsi Aktivitas</th>
                <th>Pelaku (Actor)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Memuat data log aktivitas...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Belum ada log aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Clock size={14} />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td style={{ fontWeight: 500 }}>{log.description}</td>
                    <td>
                      {log.actor_username ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{log.actor_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontFamily: 'monospace' }}>@{log.actor_username}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>System / User Dihapus</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
