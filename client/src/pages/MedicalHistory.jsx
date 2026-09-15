import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import { Search, HeartPulse, X, History, Plus, ChevronDown, Image as ImageIcon, Eye, Edit, Trash2, Info, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const formatRp = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const MedicalHistory = () => {
  const { user } = useContext(AuthContext);
  const { showToast, showConfirm } = useContext(ToastContext);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
  const [karyawans, setKaryawans] = useState([]);
  const [searchKaryawan, setSearchKaryawan] = useState('');
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  // Deduct Form
  const [deductForm, setDeductForm] = useState({
    kategori: 'Rawat Inap Total',
    nominal: '',
    deskripsi: '',
    tanggal: new Date().toISOString().slice(0, 10),
    foto_bukti: null
  });
  const [deductLoading, setDeductLoading] = useState(false);

  const isEditAllowed = user?.role === 'administrator' || user?.permissions?.edit !== false;
  const hasEditPermission = user?.role === 'administrator' || user?.permissions?.edit_medical_history;
  const hasDeletePermission = user?.role === 'administrator' || user?.permissions?.delete_medical_history;
  const hasExportPermission = user?.role === 'administrator' || user?.permissions?.export_medical_history;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/medical/history-all');
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data histori medical.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchKaryawans = async () => {
    try {
      const res = await api.get('/medical'); // We reuse this to get all active employees
      setKaryawans(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchKaryawans();
  }, []);

  const handleOpenAddModal = () => {
    setSearchKaryawan('');
    setSelectedKaryawan(null);
    setIsDropdownOpen(false);
    setDeductForm({
      kategori: 'Rawat Inap Total',
      nominal: '',
      deskripsi: '',
      tanggal: new Date().toISOString().slice(0, 10),
      foto_bukti: null
    });
    setIsDeductModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG/PNG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width *= MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setDeductForm(prev => ({...prev, foto_bukti: dataUrl}));
      };
    };
  };

  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKaryawan) {
      return showToast('Harap pilih karyawan terlebih dahulu.', 'error');
    }
    if (!deductForm.nominal || isNaN(deductForm.nominal) || Number(deductForm.nominal) <= 0) {
      return showToast('Nominal harus berupa angka lebih dari 0.', 'error');
    }

    setDeductLoading(true);
    try {
      await api.post('/medical/deduct', {
        karyawan_id: selectedKaryawan.id,
        ...deductForm
      });
      showToast('Berhasil menambahkan riwayat medical.', 'success');
      setIsDeductModalOpen(false);
      fetchHistory(); // Refresh table
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan transaksi.', 'error');
    } finally {
      setDeductLoading(false);
    }
  };

  const handleOpenEditModal = (h, e) => {
    e.stopPropagation();
    setSearchKaryawan('');
    setSelectedKaryawan({ id: h.karyawan_id, nama_lengkap: h.nama_lengkap, nik: h.nik });
    setDeductForm({
      id: h.id,
      kategori: h.kategori,
      nominal: h.nominal,
      deskripsi: h.deskripsi || '',
      tanggal: new Date(h.tanggal).toISOString().slice(0, 10),
      foto_bukti: h.foto_bukti
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!deductForm.nominal || isNaN(deductForm.nominal) || Number(deductForm.nominal) <= 0) {
      return showToast('Nominal harus berupa angka lebih dari 0.', 'error');
    }

    setDeductLoading(true);
    try {
      await api.put(`/medical/history/${deductForm.id}`, deductForm);
      showToast('Berhasil mengupdate transaksi medical.', 'success');
      setIsEditModalOpen(false);
      fetchHistory(); // Refresh table
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengupdate transaksi.', 'error');
    } finally {
      setDeductLoading(false);
    }
  };

  const handleDelete = async (h, e) => {
    e.stopPropagation();
    const isConfirmed = await showConfirm({
      title: 'Hapus Transaksi',
      message: `Anda yakin ingin menghapus transaksi medis untuk ${h.nama_lengkap} senilai Rp${formatRp(h.nominal)}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await api.delete(`/medical/history/${h.id}`);
        showToast('Transaksi berhasil dihapus.', 'success');
        fetchHistory();
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal menghapus transaksi.', 'error');
      }
    }
  };

  const handleRowClick = (h) => {
    setSelectedDetail(h);
    setIsDetailModalOpen(true);
  };

  const filteredKaryawan = karyawans.filter(k => 
    k.nama_lengkap.toLowerCase().includes(searchKaryawan.toLowerCase()) || 
    k.nik.toLowerCase().includes(searchKaryawan.toLowerCase())
  );

  const filteredHistory = history.filter(h => {
    if (startDate && new Date(h.tanggal) < new Date(startDate)) return false;
    if (endDate && new Date(h.tanggal) > new Date(endDate)) return false;
    return true;
  });

  const handleExportExcel = () => {
    if (filteredHistory.length === 0) {
      return showToast('Tidak ada data histori medical untuk diekspor pada rentang tanggal tersebut.', 'error');
    }

    const exportDataList = [...filteredHistory].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];
    
    const userRoleText = user?.role === 'administrator' ? 'Administrator' : 'HRGA';
    const exportByText = `${user?.nama || 'User'} (@${user?.username || 'user'}) - ${userRoleText}`;
    
    // Headers
    worksheetData.push(['LAPORAN RIWAYAT MEDICAL PLAFOND (KLAIM) KARYAWAN PT CEMINDO GEMILANG TBK - BATAM']);
    worksheetData.push([`Tanggal Export : ${new Date().toLocaleString('id-ID')}`]);
    worksheetData.push([`Diekspor Oleh  : ${exportByText}`]);
    
    const periodeStr = (startDate && endDate) ? `Periode: ${startDate} s.d ${endDate}` : (startDate ? `Mulai: ${startDate}` : (endDate ? `Hingga: ${endDate}` : `Periode: Keseluruhan`));
    worksheetData.push([periodeStr]);
    worksheetData.push([]);
    
    worksheetData.push([
      'No', 
      'Tanggal Transaksi', 
      'Nama Karyawan', 
      'NIK', 
      'Kategori Claim', 
      'Nominal Potongan (Rp)', 
      'Deskripsi Keterangan', 
      'Status Lampiran', 
      'Sistem / PIC HRGA'
    ]);
    
    exportDataList.forEach((h, index) => {
      worksheetData.push([
        index + 1,
        new Date(h.tanggal).toLocaleDateString('id-ID'),
        h.nama_lengkap,
        h.nik,
        h.kategori,
        h.nominal,
        h.deskripsi || '-',
        h.foto_bukti ? 'Ada Bukti (Disimpan di Sistem)' : 'Tidak Ada',
        h.pic_name || 'Sistem Terautomasi'
      ]);
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Column Widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 18 }, // Tanggal
      { wch: 30 }, // Nama
      { wch: 15 }, // NIK
      { wch: 25 }, // Kategori
      { wch: 20 }, // Nominal
      { wch: 45 }, // Deskripsi
      { wch: 25 }, // Lampiran
      { wch: 25 }  // PIC
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Histori Medical');
    XLSX.writeFile(workbook, `Medical_History_Report_${new Date().getTime()}.xlsx`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Medical History</h1>
          <p>
            Daftar seluruh riwayat transaksi plafond kesehatan karyawan.
          </p>
        </div>
        
        <div className="page-header-actions">
          {hasExportPermission && (
            <div className="history-filter-box">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter:</span>
              <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem', fontSize: '0.8rem' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} title="Dari Tanggal" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>s/d</span>
              <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem', fontSize: '0.8rem' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} title="Sampai Tanggal" />
              
              <button className="btn btn-secondary" onClick={handleExportExcel} style={{ borderColor: '#10b981', color: '#10b981', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> Export Excel
              </button>
            </div>
          )}
          
          {isEditAllowed && (
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} /> Add Medical History
            </button>
          )}
        </div>
      </div>

      <div className="glass-card table-wrapper-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Karyawan</th>
                <th>Kategori</th>
                <th>Nominal</th>
                <th>Deskripsi</th>
                <th>Bukti Foto</th>
                <th>PIC (HR)</th>
                {(hasEditPermission || hasDeletePermission) && <th style={{ textAlign: 'center' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat data...</td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Tidak ada data riwayat transaksi.</td>
                </tr>
              ) : (
                filteredHistory.map((h, index) => (
                  <tr key={h.id} onClick={() => handleRowClick(h)} style={{ cursor: 'pointer' }} className="table-row-hover">
                    <td data-label="No">{index + 1}</td>
                    <td data-label="Tanggal">{new Date(h.tanggal).toLocaleDateString('id-ID')}</td>
                    <td data-label="Karyawan">
                      <div style={{ fontWeight: 600 }}>{h.nama_lengkap}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontFamily: 'monospace' }}>{h.nik}</div>
                    </td>
                    <td data-label="Kategori"><span style={{ fontWeight: 600 }}>{h.kategori}</span></td>
                    <td data-label="Nominal" style={{ color: '#ef4444', fontWeight: 600 }}>-{formatRp(h.nominal)}</td>
                    <td data-label="Deskripsi" style={{ fontSize: '0.85rem' }}>{h.deskripsi || '-'}</td>
                    <td data-label="Bukti Foto">
                      {h.foto_bukti ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedPhoto(h.foto_bukti); setPhotoViewerOpen(true); }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={14} /> Lihat Foto
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td data-label="PIC (HR)" style={{ fontSize: '0.85rem' }}>{h.pic_name || 'System'}</td>
                    {(hasEditPermission || hasDeletePermission) && (
                      <td data-label="Aksi" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          {hasEditPermission && (
                            <button className="btn btn-secondary btn-sm" onClick={(e) => handleOpenEditModal(h, e)} title="Edit Transaksi">
                              <Edit size={15} color="var(--primary-500)" />
                              Edit
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(h, e)} title="Hapus Transaksi">
                              <Trash2 size={15} />
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: POTONG BUDGET --- */}
      {isDeductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeductModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HeartPulse size={22} color="var(--primary-500)" />
                <h3>Add Medical History</h3>
              </div>
              <button className="close-btn" onClick={() => setIsDeductModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleDeductSubmit}>
              
              {/* Autocomplete Karyawan Selection */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Cari Karyawan (Nama / NIK)</label>
                {selectedKaryawan ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sidebar-bg)', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedKaryawan.nama_lengkap}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedKaryawan.nik} - Golongan: {selectedKaryawan.golongan}</div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedKaryawan(null); setSearchKaryawan(''); }}>
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ketik atau klik untuk mencari karyawan..."
                      value={searchKaryawan}
                      onChange={(e) => {
                        setSearchKaryawan(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <div 
                      style={{ 
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', 
                        cursor: 'pointer', color: 'var(--text-muted)' 
                      }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <ChevronDown size={18} />
                    </div>
                    {isDropdownOpen && (
                      <div style={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, 
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
                        borderRadius: '4px', marginTop: '4px', maxHeight: '200px', 
                        overflowY: 'auto', zIndex: 9999, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                      }}>
                        {filteredKaryawan.length > 0 ? (
                          filteredKaryawan.map(k => (
                            <div 
                              key={k.id} 
                              style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedKaryawan(k);
                                setIsDropdownOpen(false);
                                setSearchKaryawan(k.nama_lengkap);
                              }}
                              className="dropdown-item-hover"
                            >
                              <div style={{ fontWeight: 600 }}>{k.nama_lengkap}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{k.nik} - Gol. {k.golongan}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Karyawan tidak ditemukan</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Kategori Plafond</label>
                <select 
                  className="form-control" 
                  value={deductForm.kategori} 
                  onChange={(e) => setDeductForm({...deductForm, kategori: e.target.value})}
                >
                  <option value="Rawat Inap Total">Rawat Inap Total</option>
                  <option value="Rawat Jalan">Rawat Jalan</option>
                  <option value="Kacamata">Bantuan Kacamata</option>
                  <option value="Persalinan">Biaya Persalinan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nominal Potongan (Rp)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Contoh: 500000"
                  value={deductForm.nominal}
                  onChange={(e) => setDeductForm({...deductForm, nominal: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tanggal Transaksi</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={deductForm.tanggal}
                  onChange={(e) => setDeductForm({...deductForm, tanggal: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deskripsi Keterangan (Opsional)</label>
                <textarea 
                  className="form-control" 
                  placeholder="Contoh: Pembelian kacamata di optik Melawai"
                  value={deductForm.deskripsi}
                  onChange={(e) => setDeductForm({...deductForm, deskripsi: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Lampiran Bill / Kuitansi (Opsional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                    <ImageIcon size={16} /> Pilih Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  {deductForm.foto_bukti && (
                    <div style={{ position: 'relative' }}>
                      <img src={deductForm.foto_bukti} alt="Preview" style={{ height: '40px', width: 'auto', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                      <button 
                        type="button" 
                        onClick={() => setDeductForm({...deductForm, foto_bukti: null})}
                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsDeductModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={deductLoading || !selectedKaryawan}>
                  {deductLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT TRANSAKSI --- */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Edit size={22} color="var(--primary-500)" />
                <h3>Edit Medical History</h3>
              </div>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <label>Pilih Karyawan</label>
                <div style={{ padding: '0.6rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600 }}>
                  {selectedKaryawan?.nama_lengkap} ({selectedKaryawan?.nik})
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Kategori Claim</label>
                  <select 
                    className="form-control" 
                    value={deductForm.kategori}
                    onChange={(e) => setDeductForm({...deductForm, kategori: e.target.value})}
                  >
                    <option value="Rawat Inap Total">Rawat Inap Total</option>
                    <option value="Rawat Inap Kamar">Rawat Inap Kamar</option>
                    <option value="Rawat Jalan">Rawat Jalan</option>
                    <option value="Kacamata">Kacamata</option>
                    <option value="Persalinan">Persalinan</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tanggal Transaksi</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={deductForm.tanggal}
                    onChange={(e) => setDeductForm({...deductForm, tanggal: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nominal Pemotongan (Rp)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Contoh: 1500000"
                  value={deductForm.nominal}
                  onChange={(e) => setDeductForm({...deductForm, nominal: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deskripsi Keterangan (Opsional)</label>
                <textarea 
                  className="form-control" 
                  placeholder="Contoh: Pembelian kacamata di optik Melawai"
                  value={deductForm.deskripsi}
                  onChange={(e) => setDeductForm({...deductForm, deskripsi: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Lampiran Bill / Kuitansi (Opsional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                    <ImageIcon size={16} /> Pilih Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  {deductForm.foto_bukti && (
                    <div style={{ position: 'relative' }}>
                      <img src={deductForm.foto_bukti} alt="Preview" style={{ height: '40px', width: 'auto', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                      <button 
                        type="button" 
                        onClick={() => setDeductForm({...deductForm, foto_bukti: null})}
                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={deductLoading}>
                  {deductLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DETAIL POPUP --- */}
      {isDetailModalOpen && selectedDetail && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Info size={22} color="var(--primary-500)" />
                <h3>Detail Transaksi Medical</h3>
              </div>
              <button className="close-btn" onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Karyawan:</span>
                <span style={{ fontWeight: 600 }}>{selectedDetail.nama_lengkap} ({selectedDetail.nik})</span>
                
                <span style={{ color: 'var(--text-muted)' }}>Kategori:</span>
                <span style={{ fontWeight: 600 }}>{selectedDetail.kategori}</span>
                
                <span style={{ color: 'var(--text-muted)' }}>Nominal:</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>Rp {formatRp(selectedDetail.nominal)}</span>
                
                <span style={{ color: 'var(--text-muted)' }}>Tanggal:</span>
                <span>{new Date(selectedDetail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                
                <span style={{ color: 'var(--text-muted)' }}>Deskripsi:</span>
                <span>{selectedDetail.deskripsi || '-'}</span>
                
                <span style={{ color: 'var(--text-muted)' }}>PIC (HR):</span>
                <span>{selectedDetail.pic_name || 'System'}</span>
              </div>
              
              {selectedDetail.foto_bukti && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Lampiran Bukti:</span>
                  <img 
                    src={selectedDetail.foto_bukti} 
                    alt="Bukti Transaksi" 
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)' }} 
                    onClick={() => { setSelectedPhoto(selectedDetail.foto_bukti); setPhotoViewerOpen(true); }}
                  />
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setIsDetailModalOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: PHOTO VIEWER --- */}
      {photoViewerOpen && selectedPhoto && (
        <div className="modal-overlay" onClick={() => setPhotoViewerOpen(false)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', border: 'none', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="modal-actions" style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <button 
                onClick={() => setPhotoViewerOpen(false)}
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}
              >
                <X size={24} />
              </button>
            </div>
            <img src={selectedPhoto} alt="Bukti" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}
      
      {/* Add CSS for dropdown hover effect if not exist globally */}
      <style>{`
        .dropdown-item-hover:hover {
          background: var(--input-bg);
        }
        .table-row-hover:hover {
          background-color: var(--input-bg) !important;
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
};

export default MedicalHistory;
