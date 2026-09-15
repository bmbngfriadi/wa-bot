import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import * as XLSX from 'xlsx';
import {
  Users, UserCheck, UserX, Plus, Search, Filter, Edit3, Trash2,
  ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, X, FileSpreadsheet,
  Upload, Download, FileCheck, Calendar, User, CheckSquare, Square, CheckCircle2
} from 'lucide-react';

const PRESET_DEPARTMENTS = [
  "Finance",
  "HRGA & Supporting",
  "Maintenance",
  "Plant Head",
  "Port & Dispatch",
  "PPIC",
  "Production",
  "Purchasing",
  "Quality Control",
  "SHE",
  "Warehouse"
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast, showAlert, showConfirm } = useContext(ToastContext);

  const [employees, setEmployees] = useState([]);
  const [metrics, setMetrics] = useState({ total_karyawan: 0, total_aktif: 0, total_non_aktif: 0 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalRows: 0, totalPages: 1 });

  // Checkbox Selection for Bulk Delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectAllFiltered, setIsSelectAllFiltered] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    department: 'Production',
    status: 'Aktif',
    jenis_kelamin: 'Laki-laki',
    golongan: '4 (A-B)',
    nama_istri: '',
    nama_anak_pertama: '',
    nama_anak_kedua: '',
    nama_anak_ketiga: ''
  });
  const [formError, setFormError] = useState('');

  // Bulk Import State
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  // Permission Checks
  const isAddAllowed = user?.role === 'administrator' || user?.permissions?.add !== false;
  const isEditAllowed = user?.role === 'administrator' || user?.permissions?.edit !== false;
  const isDeleteAllowed = user?.role === 'administrator' || user?.permissions?.delete === true;
  const isBulkDeleteAllowed = user?.role === 'administrator';
  const isExportAllowed = user?.role === 'administrator' || user?.permissions?.export !== false;

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/karyawan', {
        params: {
          search,
          department: selectedDept,
          status: selectedStatus,
          page,
          limit: 10
        }
      });
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
      setMetrics(res.data.metrics || { total_karyawan: 0, total_aktif: 0, total_non_aktif: 0 });
      setDepartments(res.data.departments || []);
      setSelectedIds([]);
      setIsSelectAllFiltered(false);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedStatus, page]);

  // Checkbox Select All Toggle (Current Page)
  const handleSelectAllCurrentPage = () => {
    if (selectedIds.length === employees.length && employees.length > 0) {
      setSelectedIds([]);
      setIsSelectAllFiltered(false);
    } else {
      setSelectedIds(employees.map(emp => emp.id));
      setIsSelectAllFiltered(false);
    }
  };

  // Select ALL Matching Records Across All Pages
  const handleSelectAllFilteredRecords = () => {
    setSelectedIds(employees.map(emp => emp.id));
    setIsSelectAllFiltered(true);
  };

  // Checkbox Single Row Toggle
  const handleSelectRow = (id) => {
    setIsSelectAllFiltered(false);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Hard Delete Handler with Custom Confirm Dialog
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 && !isSelectAllFiltered) return;

    const confirmCountText = isSelectAllFiltered
      ? `SELURUH ${pagination.totalRows} data karyawan terfilter`
      : `${selectedIds.length} data karyawan terpilih`;

    const isConfirmed = await showConfirm({
      title: 'Hapus Permanen Massal (Bulk Delete)',
      message: `Apakah Anda yakin ingin menghapus PERMANEN ${confirmCountText} dari database MySQL?`,
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        let deletedCount = 0;
        if (isSelectAllFiltered) {
          const res = await api.post('/karyawan/bulk-delete', {
            deleteAllFiltered: true,
            search,
            department: selectedDept,
            status: selectedStatus
          });
          deletedCount = res.data.deletedCount;
        } else {
          const res = await api.post('/karyawan/bulk-delete', { ids: selectedIds });
          deletedCount = res.data.deletedCount;
        }
        setSelectedIds([]);
        setIsSelectAllFiltered(false);
        showToast(`Berhasil menghapus ${deletedCount} data karyawan secara permanen.`, 'success');
        fetchEmployees();
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal melakukan hapus massal.', 'error');
      }
    }
  };

  // Export Excel Audit Report Function
  const handleExportExcel = async () => {
    try {
      const res = await api.get('/karyawan', {
        params: {
          search,
          department: selectedDept,
          status: selectedStatus,
          page: 1,
          limit: 10000
        }
      });
      const exportDataList = res.data.data;

      const now = new Date();
      const formattedDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) + ' Pukul ' + now.toLocaleTimeString('id-ID') + ' WIB';

      const roleNameMap = {
        administrator: 'Administrator (Dev)',
        hrga_section_head: 'HRGA & Supporting Section Head',
        hrga_leader: 'HRGA Leader',
        user_basic: 'User Basic'
      };
      const userRoleText = roleNameMap[user?.role] || user?.role;
      const exportByText = `${user?.nama || 'User'} (@${user?.username || 'user'}) - ${userRoleText}`;

      // Audit Header Rows
      const sheetData = [
        ['PT CEMINDO GEMILANG TBK - PLANT BATAM'],
        ['LAPORAN AUDIT DATA KARYAWAN'],
        [`Tanggal Export : ${formattedDate}`],
        [`Export By       : ${exportByText}`],
        [`Filter Dept     : ${selectedDept || 'Semua Department'}`],
        [`Filter Status   : ${selectedStatus || 'Semua Status'}`],
        [''],
        ['NO', 'NIK KARYAWAN', 'NAMA LENGKAP', 'JENIS KELAMIN', 'DEPARTMENT', 'STATUS KARYAWAN', 'GRADE / GOL.', 'NAMA ISTRI', 'ANAK PERTAMA', 'ANAK KEDUA', 'ANAK KETIGA']
      ];

      exportDataList.forEach((emp, index) => {
        sheetData.push([
          index + 1,
          emp.nik,
          emp.nama_lengkap,
          emp.jenis_kelamin || 'Laki-laki',
          emp.department,
          emp.status,
          emp.golongan || '-',
          emp.nama_istri || '-',
          emp.nama_anak_pertama || '-',
          emp.nama_anak_kedua || '-',
          emp.nama_anak_ketiga || '-'
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      worksheet['!cols'] = [
        { wch: 6 },  { wch: 18 }, { wch: 30 }, { wch: 16 },
        { wch: 22 }, { wch: 18 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Audit Karyawan');

      const fileName = `Laporan_Audit_Karyawan_Cemindo_${now.toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showToast(`Laporan Audit Excel '${fileName}' berhasil diunduh.`, 'success');
    } catch (err) {
      console.error('Export Excel error:', err);
      showToast('Gagal mengekspor data ke Excel.', 'error');
    }
  };

  // Download Bulk Import Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      ['NIK', 'NAMA_LENGKAP', 'JENIS_KELAMIN', 'DEPARTMENT', 'STATUS', 'NAMA_ISTRI', 'NAMA_ANAK_PERTAMA', 'NAMA_ANAK_KEDUA', 'NAMA_ANAK_KETIGA'],
      ['2024001', 'Budi Santoso', 'Laki-laki', 'Produksi', 'Aktif', 'Siti', 'Agus', '-', '-'],
      ['2024002', 'Siti Rahma', 'Perempuan', 'HRD', 'Aktif', '-', 'Rini', 'Dino', '-'],
      ['2024003', 'Dedi Kurniawan', 'Laki-laki', 'Maintenance', 'Aktif', 'Ayu', 'Rendi', '-', '-']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 14 }, { wch: 26 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Data');
    XLSX.writeFile(workbook, 'Template_Import_Karyawan_Cemindo.xlsx');
    showToast('Template Excel resmi berhasil diunduh.', 'success');
  };

  // Handle Import File Selection & Parse
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (data.length === 0) {
          setImportError('File Excel tidak berisi data.');
          setImportData([]);
        } else {
          setImportData(data);
        }
      } catch (err) {
        console.error('Parse file error:', err);
        setImportError('Gagal membaca file Excel/CSV. Pastikan format file sesuai.');
        setImportData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Bulk Import Data
  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (importData.length === 0) {
      setImportError('Tidak ada data valid untuk diimpor.');
      return;
    }

    setImportLoading(true);
    setImportError('');
    setImportResult(null);

    try {
      const res = await api.post('/karyawan/bulk-import', { employees: importData });
      setImportResult(res.data);
      showToast(res.data.message, 'success');
      fetchEmployees();
    } catch (err) {
      setImportError(err.response?.data?.message || 'Gagal melakukan impor massal data karyawan.');
    } finally {
      setImportLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      nik: '',
      nama_lengkap: '',
      department: departments[0] || 'Production',
      status: 'Aktif',
      jenis_kelamin: 'Laki-laki',
      golongan: '4 (A-B)',
      nama_istri: '',
      nama_anak_pertama: '',
      nama_anak_kedua: '',
      nama_anak_ketiga: ''
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      nik: emp.nik,
      nama_lengkap: emp.nama_lengkap,
      department: emp.department,
      status: emp.status,
      jenis_kelamin: emp.jenis_kelamin || 'Laki-laki',
      golongan: emp.golongan || '4 (A-B)',
      nama_istri: emp.nama_istri || '',
      nama_anak_pertama: emp.nama_anak_pertama || '',
      nama_anak_kedua: emp.nama_anak_kedua || '',
      nama_anak_ketiga: emp.nama_anak_ketiga || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/karyawan', formData);
      setIsAddModalOpen(false);
      showToast(`Karyawan '${formData.nama_lengkap}' berhasil ditambahkan.`, 'success');
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menambahkan karyawan.');
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/karyawan/${selectedEmp.id}`, formData);
      setIsEditModalOpen(false);
      showToast(`Data karyawan '${formData.nama_lengkap}' berhasil diperbarui.`, 'success');
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal merubah data karyawan.');
    }
  };

  // Submit Hard Delete via Confirm Modal
  const handleOpenDelete = async (emp) => {
    const isConfirmed = await showConfirm({
      title: 'Konfirmasi Hapus Data',
      message: `Apakah Anda yakin ingin menghapus data Karyawan "${emp.nama_lengkap}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`,
      confirmText: 'Ya, Hapus Permanen',
      confirmColor: 'var(--danger-color)',
    });
    
    if (isConfirmed) {
      try {
        await api.delete(`/karyawan/${emp.id}`);
        showToast(`Karyawan '${emp.nama_lengkap}' berhasil dihapus permanen.`, 'success');
        fetchEmployees();
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal menghapus karyawan.', 'error');
      }
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Manajemen Data Karyawan</h1>
          <p>
            Kelola data karyawan PT Cemindo Gemilang Tbk - Plant Batam (Terintegrasi Real-Time WhatsApp Bot)
          </p>
        </div>
        
        <div className="page-header-actions">
          {(selectedIds.length > 0 || isSelectAllFiltered) && isBulkDeleteAllowed && (
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              <Trash2 size={18} />
              {isSelectAllFiltered
                ? `Hapus Terpilih (Semua ${pagination.totalRows} Data)`
                : `Hapus Terpilih (${selectedIds.length} Data)`}
            </button>
          )}

          {isExportAllowed && (
            <button className="btn btn-secondary" onClick={handleExportExcel} style={{ borderColor: '#10b981', color: '#10b981' }}>
              <FileSpreadsheet size={18} />
              Export to Excel
            </button>
          )}

          {user?.role === 'administrator' && (
            <button className="btn btn-secondary" onClick={() => { setIsImportModalOpen(true); setImportResult(null); setImportError(''); setImportFile(null); setImportData([]); }}>
              <Upload size={18} />
              Bulk Import Excel
            </button>
          )}

          {isAddAllowed && (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              Tambah Karyawan Baru
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--primary-gradient)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Karyawan</h4>
            <p>{metrics.total_karyawan || 0}</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--success-gradient)' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h4>Status Aktif</h4>
            <p style={{ color: '#10b981' }}>{metrics.total_aktif || 0}</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--warning-gradient)' }}>
            <UserX size={24} />
          </div>
          <div className="stat-info">
            <h4>Status Non-Aktif</h4>
            <p style={{ color: '#f59e0b' }}>{metrics.total_non_aktif || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Cari NIK, Nama Karyawan, Istri, atau Anak..."
              style={{ paddingLeft: '2.4rem' }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
            >
              <option value="">Semua Department</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-icon" onClick={fetchEmployees} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Banner for Select All Filtered Data */}
      {selectedIds.length === employees.length && employees.length > 0 && isBulkDeleteAllowed && (
        <div style={{
          background: 'rgba(181, 29, 34, 0.12)',
          border: '1px solid rgba(181, 29, 34, 0.3)',
          borderRadius: '4px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-main)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            {isSelectAllFiltered ? (
              <span>
                <b>Seluruh {pagination.totalRows} data karyawan terfilter</b> di seluruh halaman telah dipilih.
              </span>
            ) : (
              <span>
                Anda memilih <b>{employees.length}</b> data karyawan di halaman ini.
              </span>
            )}
          </div>

          {pagination.totalRows > employees.length && (
            <div>
              {!isSelectAllFiltered ? (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleSelectAllFilteredRecords}
                  style={{ color: 'var(--primary-500)', borderColor: 'var(--primary-500)' }}
                >
                  <CheckCircle2 size={15} /> Pilih Seluruh {pagination.totalRows} Data Terfilter
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setSelectedIds([]); setIsSelectAllFiltered(false); }}
                >
                  Batalkan Pilihan
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Employee Data Table */}
      <div className="glass-card table-wrapper-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {isBulkDeleteAllowed && (
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={employees.length > 0 && selectedIds.length === employees.length}
                      onChange={handleSelectAllCurrentPage}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-500)' }}
                      title="Pilih Semua di Halaman Ini"
                    />
                  </th>
                )}
                <th>No</th>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Jenis Kelamin</th>
                <th>Department</th>
                <th>Gol.</th>
                <th>Keluarga (Istri / Anak)</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isBulkDeleteAllowed ? "10" : "9"} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Memuat data karyawan...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={isBulkDeleteAllowed ? "10" : "9"} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => {
                  const isSelected = selectedIds.includes(emp.id) || isSelectAllFiltered;
                  return (
                    <tr key={emp.id} style={{ backgroundColor: isSelected ? 'rgba(181, 29, 34, 0.08)' : 'transparent' }}>
                      {isBulkDeleteAllowed && (
                        <td data-label="Pilih" style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(emp.id)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-500)' }}
                          />
                        </td>
                      )}
                      <td data-label="No">{(page - 1) * 10 + index + 1}</td>
                      <td data-label="NIK" style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-500)' }}>{emp.nik}</td>
                      <td data-label="Nama Lengkap" style={{ fontWeight: 600 }}>{emp.nama_lengkap}</td>
                      <td data-label="Jenis Kelamin">
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          background: emp.jenis_kelamin === 'Perempuan' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: emp.jenis_kelamin === 'Perempuan' ? '#ec4899' : '#3b82f6',
                          border: `1px solid ${emp.jenis_kelamin === 'Perempuan' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}>
                          {emp.jenis_kelamin || 'Laki-laki'}
                        </span>
                      </td>
                      <td data-label="Department">{emp.department}</td>
                      <td data-label="Golongan"><span style={{fontWeight: 'bold', color: 'var(--primary-500)'}}>{emp.golongan || '4 (A-B)'}</span></td>
                      <td data-label="Keluarga" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        <div style={{ marginBottom: '2px' }}>Istri : {emp.nama_istri || '-'}</div>
                        <div style={{ marginBottom: '2px' }}>Anak 1 : {emp.nama_anak_pertama || '-'}</div>
                        <div style={{ marginBottom: '2px' }}>Anak 2 : {emp.nama_anak_kedua || '-'}</div>
                        <div>Anak 3 : {emp.nama_anak_ketiga || '-'}</div>
                      </td>
                      <td data-label="Status">
                        <span className={`badge ${emp.status === 'Aktif' ? 'badge-aktif' : 'badge-nonaktif'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td data-label="Aksi" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {/* Edit Status & Data Button */}
                          {isEditAllowed ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(emp)}
                              title="Edit Data / Update Status"
                            >
                              <Edit3 size={15} color="var(--primary-500)" />
                              Update Status
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled
                              title="Akses Ditolak: Anda tidak memiliki izin untuk merubah status."
                            >
                              <Edit3 size={15} color="#6b7280" />
                              Update Status
                            </button>
                          )}

                          {/* Hard Delete Button */}
                          {isDeleteAllowed ? (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOpenDelete(emp)}
                              title="Hapus Karyawan Permanen (Hard Delete)"
                            >
                              <Trash2 size={15} />
                              Hapus
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled
                              title="Akses Ditolak: Anda tidak memiliki izin menghapus data karyawan."
                            >
                              <Trash2 size={15} color="#6b7280" />
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Menampilkan <b>{employees.length}</b> dari <b>{pagination.totalRows}</b> total karyawan (Halaman {pagination.page} dari {pagination.totalPages})
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} /> Sebelum
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Berikut <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL: BULK IMPORT EXCEL --- */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Upload size={22} color="var(--primary-500)" />
                <h3>Bulk Import Data Karyawan (Excel / CSV)</h3>
              </div>
              <button className="close-btn" onClick={() => setIsImportModalOpen(false)}><X size={20} /></button>
            </div>

            {/* Template Download Prompt */}
            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '4px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Belum punya format file?</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Unduh template Excel resmi (termasuk kolom Jenis Kelamin & Join Date).</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate} style={{ color: 'var(--primary-500)' }}>
                <Download size={15} /> Unduh Template
              </button>
            </div>

            {importError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {importError}
              </div>
            )}

            {importResult && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '1rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileCheck size={18} /> {importResult.message}
                </div>
                {importResult.errorList && importResult.errorList.length > 0 && (
                  <div style={{ marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto', fontSize: '0.775rem', color: '#fca5a5' }}>
                    {importResult.errorList.map((errItem, idx) => (
                      <div key={idx}>• {errItem}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleBulkImportSubmit}>
              <div className="form-group">
                <label>Pilih File Excel (.xlsx / .xls / .csv)</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {/* Data Preview Table */}
              {importData.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Pratinjau Data Impor ({importData.length} baris terdeteksi):
                  </div>
                  <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <table className="data-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>NIK</th>
                          <th>Nama Lengkap</th>
                          <th>Jenis Kelamin</th>
                          <th>Department</th>
                          <th>Join Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.NIK || row.nik || '-'}</td>
                            <td>{row.NAMA_LENGKAP || row.nama_lengkap || '-'}</td>
                            <td>{row.JENIS_KELAMIN || row.jenis_kelamin || 'Laki-laki'}</td>
                            <td>{row.DEPARTMENT || row.department || '-'}</td>
                            <td>{row.JOIN_DATE || row.join_date || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importData.length > 5 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', textAlign: 'right' }}>
                      ... dan {importData.length - 5} baris data lainnya.
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Tutup</button>
                <button type="submit" className="btn btn-primary" disabled={importLoading || importData.length === 0}>
                  {importLoading ? 'Memproses Impor...' : `Proses Impor (${importData.length} Baris)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH KARYAWAN --- */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tambah Karyawan Baru</h3>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>

            {formError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>NIK Karyawan (Format Angka)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: 2024001 atau 123456789"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nama Lengkap Karyawan"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select
                  className="form-control"
                  value={formData.jenis_kelamin}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  className="form-control"
                  value={PRESET_DEPARTMENTS.includes(formData.department) ? formData.department : (formData.department ? 'Others' : '')}
                  onChange={(e) => {
                    if (e.target.value === 'Others') {
                      setFormData({ ...formData, department: ' ' });
                    } else {
                      setFormData({ ...formData, department: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="" disabled>Pilih Department...</option>
                  {PRESET_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="Others">Others (Ketik Manual)</option>
                </select>
                {(!PRESET_DEPARTMENTS.includes(formData.department) && formData.department !== '') && (
                  <input
                    type="text"
                    className="form-control"
                    style={{ marginTop: '0.5rem' }}
                    placeholder="Ketik nama department baru..."
                    value={formData.department.trim()}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label>Golongan</label>
                <select
                  className="form-control"
                  value={formData.golongan}
                  onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                  required
                >
                  <option value="" disabled>Pilih Golongan...</option>
                  <option value="10 (A-B)">10 (A-B)</option>
                  <option value="9 (A-B)">9 (A-B)</option>
                  <option value="8 (A-B)">8 (A-B)</option>
                  <option value="7 (A-B)">7 (A-B)</option>
                  <option value="6 (A-B)">6 (A-B)</option>
                  <option value="5 (A-B)">5 (A-B)</option>
                  <option value="4 (A-B)">4 (A-B)</option>
                  <option value="3 (A-B)">3 (A-B)</option>
                  <option value="2 (B-D)">2 (B-D)</option>
                  <option value="2A">2A</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nama Istri (Opsional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nama Istri"
                  value={formData.nama_istri}
                  onChange={(e) => setFormData({ ...formData, nama_istri: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Anak 1 (Opsional)</label>
                <input type="text" className="form-control" placeholder="Nama Anak Pertama" value={formData.nama_anak_pertama} onChange={(e) => setFormData({ ...formData, nama_anak_pertama: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label>Anak 2 (Opsional)</label>
                <input type="text" className="form-control" placeholder="Nama Anak Kedua" value={formData.nama_anak_kedua} onChange={(e) => setFormData({ ...formData, nama_anak_kedua: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label>Anak 3 (Opsional)</label>
                <input type="text" className="form-control" placeholder="Nama Anak Ketiga" value={formData.nama_anak_ketiga} onChange={(e) => setFormData({ ...formData, nama_anak_ketiga: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Status Karyawan</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Karyawan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT DATA / UPDATE STATUS --- */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Status & Data Karyawan</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>

            {formError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>NIK</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select
                  className="form-control"
                  value={formData.jenis_kelamin}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  className="form-control"
                  value={PRESET_DEPARTMENTS.includes(formData.department) ? formData.department : (formData.department ? 'Others' : '')}
                  onChange={(e) => {
                    if (e.target.value === 'Others') {
                      setFormData({ ...formData, department: ' ' });
                    } else {
                      setFormData({ ...formData, department: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="" disabled>Pilih Department...</option>
                  {PRESET_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="Others">Others (Ketik Manual)</option>
                </select>
                {(!PRESET_DEPARTMENTS.includes(formData.department) && formData.department !== '') && (
                  <input
                    type="text"
                    className="form-control"
                    style={{ marginTop: '0.5rem' }}
                    placeholder="Ketik nama department baru..."
                    value={formData.department.trim()}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label>Golongan</label>
                <select
                  className="form-control"
                  value={formData.golongan}
                  onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                  required
                >
                  <option value="" disabled>Pilih Golongan...</option>
                  <option value="10 (A-B)">10 (A-B)</option>
                  <option value="9 (A-B)">9 (A-B)</option>
                  <option value="8 (A-B)">8 (A-B)</option>
                  <option value="7 (A-B)">7 (A-B)</option>
                  <option value="6 (A-B)">6 (A-B)</option>
                  <option value="5 (A-B)">5 (A-B)</option>
                  <option value="4 (A-B)">4 (A-B)</option>
                  <option value="3 (A-B)">3 (A-B)</option>
                  <option value="2 (B-D)">2 (B-D)</option>
                  <option value="2A">2A</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nama Istri (Opsional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nama Istri"
                  value={formData.nama_istri}
                  onChange={(e) => setFormData({ ...formData, nama_istri: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Anak 1 (Opsional)</label>
                <input type="text" className="form-control" placeholder="Nama Anak Pertama" value={formData.nama_anak_pertama} onChange={(e) => setFormData({ ...formData, nama_anak_pertama: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label>Anak 2 (Opsional)</label>
                <input type="text" className="form-control" placeholder="Nama Anak Kedua" value={formData.nama_anak_kedua} onChange={(e) => setFormData({ ...formData, nama_anak_kedua: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label>Anak 3 (Opsional)</label>
                <input type="text" className="form-control" placeholder="Nama Anak Ketiga" value={formData.nama_anak_ketiga} onChange={(e) => setFormData({ ...formData, nama_anak_ketiga: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Status Karyawan</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Update Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
