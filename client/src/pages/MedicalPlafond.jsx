import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import { Search, HeartPulse, MinusCircle, RefreshCw, KeyRound, X, History } from 'lucide-react';

const formatRp = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const MedicalPlafond = () => {
  const { user } = useContext(AuthContext);
  const { showToast, showConfirm } = useContext(ToastContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isEditAllowed = user?.role === 'administrator' || user?.permissions?.edit !== false;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/medical', { params: { search } });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data medical.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);


  const handleOpenHistory = async (emp) => {
    setSelectedEmp(emp);
    setHistory([]);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/medical/history/${emp.id}`);
      setHistory(res.data.history);
    } catch (err) {
      showToast('Gagal memuat riwayat transaksi.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const [resetPassForm, setResetPassForm] = useState({
    newPassword: '',
    useDefault: true
  });
  const [resetPassLoading, setResetPassLoading] = useState(false);

  const handleOpenResetPassword = (emp) => {
    setSelectedEmp(emp);
    setResetPassForm({ newPassword: '', useDefault: true });
    setIsResetPassModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetPassLoading(true);
    try {
      const payload = {};
      if (!resetPassForm.useDefault) {
        if (!resetPassForm.newPassword) {
            showToast('Password baru tidak boleh kosong', 'error');
            setResetPassLoading(false);
            return;
        }
        payload.newPassword = resetPassForm.newPassword;
      }
      
      const res = await api.put(`/medical/reset-bot-password/${selectedEmp.id}`, payload);
      showToast(res.data.message || 'Password berhasil diubah.', 'success');
      setIsResetPassModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal merubah password.', 'error');
    } finally {
      setResetPassLoading(false);
    }
  };

  const handleResetBudget = async (emp) => {
    const isConfirmed = await showConfirm({
      title: 'Reset Manual Budget',
      message: `Anda yakin ingin me-reset (menghapus) semua riwayat pemakaian budget tahun ini untuk ${emp.nama_lengkap}? Saldo akan kembali penuh.`,
      confirmText: 'Ya, Reset Budget',
      cancelText: 'Batal',
      type: 'warning'
    });

    if (isConfirmed) {
      try {
        await api.delete(`/medical/reset-budget/${emp.id}`);
        showToast('Budget berhasil di-reset.', 'success');
        fetchData();
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal me-reset budget.', 'error');
      }
    }
  };

  const handleBulkResetBudget = async () => {
    const isConfirmed = await showConfirm({
      title: 'Bulk Reset Budget (Semua)',
      message: `PERINGATAN! Anda yakin ingin me-reset (menghapus) semua riwayat pemakaian budget tahun ini untuk SELURUH karyawan? Aksi ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Reset Semua',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await api.delete(`/medical/bulk-reset-budget`);
        showToast('Budget seluruh karyawan berhasil di-reset.', 'success');
        fetchData();
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal me-reset budget.', 'error');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Medical Plafond</h1>
          <p>
            Kelola budget rawat inap, rawat jalan, kacamata, dan persalinan karyawan.
          </p>
        </div>
        <div className="page-header-actions">
          {user?.role === 'administrator' && (
            <button className="btn btn-danger" onClick={handleBulkResetBudget}>
              Bulk Reset Budget (Semua Data)
            </button>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Cari NIK atau Nama Karyawan..."
              style={{ paddingLeft: '2.4rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-icon" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="glass-card table-wrapper-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Karyawan</th>
                <th>Gol.</th>
                <th>Rawat Inap</th>
                <th>Rawat Jalan</th>
                <th>Kacamata</th>
                <th>Persalinan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                data.map((emp, index) => {
                  const sisaInap = emp.limits.rawat_inap_total - emp.usage['Rawat Inap Total'];
                  const sisaJalan = emp.limits.rawat_jalan - emp.usage['Rawat Jalan'];
                  const sisaKacamata = emp.limits.kacamata - emp.usage['Kacamata'];
                  const sisaPersalinan = emp.limits.persalinan - emp.usage['Persalinan'];

                  return (
                    <tr key={emp.id}>
                      <td data-label="No">{index + 1}</td>
                      <td data-label="Karyawan">
                        <div style={{ fontWeight: 600 }}>{emp.nama_lengkap}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontFamily: 'monospace' }}>{emp.nik}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.department}</div>
                      </td>
                      <td data-label="Golongan"><span style={{ fontWeight: 'bold' }}>{emp.golongan}</span></td>
                      <td data-label="Rawat Inap" style={{ fontSize: '0.85rem' }}>
                        <div><b>Limit:</b> {formatRp(emp.limits.rawat_inap_total)}</div>
                        <div style={{ color: '#ef4444' }}><b>Pakai:</b> {formatRp(emp.usage['Rawat Inap Total'])}</div>
                        <div style={{ color: '#10b981' }}><b>Sisa:</b> {formatRp(sisaInap)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Kamar/Malam: {formatRp(emp.limits.rawat_inap_kamar)}</div>
                      </td>
                      <td data-label="Rawat Jalan" style={{ fontSize: '0.85rem' }}>
                        <div><b>Limit:</b> {formatRp(emp.limits.rawat_jalan)}</div>
                        <div style={{ color: '#ef4444' }}><b>Pakai:</b> {formatRp(emp.usage['Rawat Jalan'])}</div>
                        <div style={{ color: '#10b981' }}><b>Sisa:</b> {formatRp(sisaJalan)}</div>
                      </td>
                      <td data-label="Kacamata" style={{ fontSize: '0.85rem' }}>
                        <div><b>Limit:</b> {formatRp(emp.limits.kacamata)}</div>
                        <div style={{ color: '#ef4444' }}><b>Pakai:</b> {formatRp(emp.usage['Kacamata'])}</div>
                        <div style={{ color: '#10b981' }}><b>Sisa:</b> {formatRp(sisaKacamata)}</div>
                      </td>
                      <td data-label="Persalinan" style={{ fontSize: '0.85rem' }}>
                        <div><b>Limit:</b> {formatRp(emp.limits.persalinan)}</div>
                        <div style={{ color: '#ef4444' }}><b>Pakai:</b> {formatRp(emp.usage['Persalinan'])}</div>
                        <div style={{ color: '#10b981' }}><b>Sisa:</b> {formatRp(sisaPersalinan)}</div>
                      </td>
                      <td data-label="Aksi" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenHistory(emp)} style={{ width: '100%' }}>
                            <History size={14} /> Riwayat
                          </button>
                          {(user?.role === 'administrator' || user?.permissions?.reset_pass_bot) && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenResetPassword(emp)} style={{ width: '100%', borderColor: '#f59e0b', color: '#d97706' }}>
                              <KeyRound size={14} /> Reset Pass Bot
                            </button>
                          )}
                          {user?.role === 'administrator' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleResetBudget(emp)} style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>
                              <RefreshCw size={14} /> Reset Budget
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* --- MODAL: RIWAYAT TRANSAKSI --- */}
      {isHistoryModalOpen && selectedEmp && (
        <div className="modal-overlay" onClick={() => setIsHistoryModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Riwayat Potongan - {selectedEmp.nama_lengkap}</h3>
              <button className="close-btn" onClick={() => setIsHistoryModalOpen(false)}><X size={20} /></button>
            </div>

            {historyLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat riwayat...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada riwayat pemotongan di tahun ini.</div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Kategori</th>
                      <th>Nominal</th>
                      <th>PIC (HR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td data-label="Tanggal">{new Date(h.tanggal).toLocaleDateString('id-ID')}</td>
                        <td data-label="Kategori">{h.kategori}</td>
                        <td data-label="Nominal" style={{ color: '#ef4444', fontWeight: 600 }}>-{formatRp(h.nominal)}</td>
                        <td data-label="PIC (HR)">{h.pic_name || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: RESET PASS BOT --- */}
      {isResetPassModalOpen && selectedEmp && (
        <div className="modal-overlay" onClick={() => setIsResetPassModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <KeyRound size={22} color="#f59e0b" />
                <h3>Reset Password Bot</h3>
              </div>
              <button className="close-btn" onClick={() => setIsResetPassModalOpen(false)}><X size={20} /></button>
            </div>

            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div><b>Nama:</b> {selectedEmp.nama_lengkap} ({selectedEmp.nik})</div>
            </div>

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="radio" 
                    checked={resetPassForm.useDefault} 
                    onChange={() => setResetPassForm({ ...resetPassForm, useDefault: true })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Gunakan NIK sebagai Default
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="radio" 
                    checked={!resetPassForm.useDefault} 
                    onChange={() => setResetPassForm({ ...resetPassForm, useDefault: false })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Ubah dengan Password Baru
                </label>
              </div>

              {!resetPassForm.useDefault && (
                <div className="form-group" style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Masukkan password baru..."
                    value={resetPassForm.newPassword}
                    onChange={(e) => setResetPassForm({ ...resetPassForm, newPassword: e.target.value })}
                    required={!resetPassForm.useDefault}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsResetPassModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} disabled={resetPassLoading}>
                  {resetPassLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalPlafond;
