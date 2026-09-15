import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import { Users, UserPlus, Shield, Edit3, Trash2, X, KeyRound, Check } from 'lucide-react';

const defaultPermissionPresets = {
  administrator: { view: true, add: true, edit: true, delete: true, export: true, manage_users: true, reset_password: true, reset_pass_bot: true, edit_medical_history: true, delete_medical_history: true, export_medical_history: true, bulk_reset_budget: true },
  hrga_section_head: { view: true, add: true, edit: true, delete: true, export: true, manage_users: false, reset_password: false, reset_pass_bot: false, edit_medical_history: true, delete_medical_history: false, export_medical_history: false },
  hrga_leader: { view: true, add: true, edit: true, delete: false, export: true, manage_users: false, reset_password: false, reset_pass_bot: false, edit_medical_history: false, delete_medical_history: false, export_medical_history: false },
  user_basic: { view: true, add: false, edit: false, delete: false, export: false, manage_users: false, reset_password: false, reset_pass_bot: false, edit_medical_history: false, delete_medical_history: false, export_medical_history: false }
};

const UserAdmin = () => {
  const { user: currentUser } = useContext(AuthContext);
  const { showToast, showConfirm } = useContext(ToastContext);

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nama: '',
    role: 'hrga_leader',
    permissions: defaultPermissionPresets.hrga_leader
  });
  const [resetPassInput, setResetPassInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsersList(res.data.users);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRolePresetChange = (role) => {
    const defaultPerms = defaultPermissionPresets[role] || defaultPermissionPresets.hrga_leader;
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: { ...defaultPerms }
    }));
  };

  const handlePermissionToggle = (permKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      nama: '',
      role: 'hrga_leader',
      permissions: defaultPermissionPresets.hrga_leader
    });
    setFormError('');
    setFormSuccess('');
    setIsAddUserOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (usr) => {
    setSelectedUser(usr);
    const userPerms = usr.permissions || defaultPermissionPresets[usr.role] || defaultPermissionPresets.hrga_leader;
    setFormData({
      username: usr.username,
      email: usr.email || '',
      password: '',
      nama: usr.nama,
      role: usr.role,
      permissions: { ...userPerms }
    });
    setFormError('');
    setFormSuccess('');
    setIsEditUserOpen(true);
  };

  // Open Reset Password Modal
  const handleOpenResetPass = (usr) => {
    setSelectedUser(usr);
    setResetPassInput('');
    setFormError('');
    setFormSuccess('');
    setIsResetPassOpen(true);
  };

  // Submit Add User
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/users', formData);
      setIsAddUserOpen(false);
      showToast(`User '@${formData.username}' berhasil dibuat.`, 'success');
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal membuat user baru.');
    }
  };

  // Submit Edit User
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/users/${selectedUser.id}`, {
        username: formData.username,
        email: formData.email,
        nama: formData.nama,
        role: formData.role,
        permissions: formData.permissions
      });
      setIsEditUserOpen(false);
      showToast(`Data user '@${formData.username}' berhasil diperbarui.`, 'success');
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal memperbarui data/username user.');
    }
  };

  // Submit Reset Password by Admin
  const handleResetPassSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/users/${selectedUser.id}/password`, {
        newPassword: resetPassInput
      });
      setIsResetPassOpen(false);
      showToast(`Password user '@${selectedUser.username}' berhasil diperbarui.`, 'success');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal meriset password user.');
    }
  };

  // Submit Delete User with Custom Confirm Modal
  const handleDeleteUser = async (id, username) => {
    const isConfirmed = await showConfirm({
      title: 'Hapus User System',
      message: `Apakah Anda yakin ingin menghapus akun user '@${username}' secara permanen dari sistem?`,
      confirmText: 'Ya, Hapus Akun',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        showToast(`User '@${username}' berhasil dihapus.`, 'success');
        fetchUsers();
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal menghapus user.', 'error');
      }
    }
  };

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

  const renderPermissionPills = (perms) => {
    if (!perms) return null;
    const labels = [];
    if (perms.view) labels.push({ text: 'Lihat', color: '#10b981' });
    if (perms.add) labels.push({ text: 'Tambah', color: '#3b82f6' });
    if (perms.edit) labels.push({ text: 'Edit/Status', color: '#818cf8' });
    if (perms.delete) labels.push({ text: 'Hapus', color: '#ef4444' });
    if (perms.export) labels.push({ text: 'Export', color: '#f59e0b' });
    if (perms.manage_users) labels.push({ text: 'Manage User', color: '#a855f7' });
    if (perms.reset_password) labels.push({ text: 'Reset Pass Web', color: '#f59e0b' });
    if (perms.reset_pass_bot) labels.push({ text: 'Reset Pass Bot', color: '#d97706' });
    if (perms.edit_medical_history) labels.push({ text: 'Edit Med-His', color: '#8b5cf6' });
    if (perms.delete_medical_history) labels.push({ text: 'Del Med-His', color: '#dc2626' });
    if (perms.export_medical_history) labels.push({ text: 'Exp Med-His', color: '#059669' });

    return (
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {labels.map((lbl, idx) => (
          <span key={idx} style={{
            fontSize: '0.7em',
            fontWeight: 600,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            background: 'var(--input-bg)',
            border: `1px solid ${lbl.color}40`,
            color: lbl.color
          }}>
            {lbl.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Manajemen User System (Administrator Only)</h1>
          <p>
            Fitur CRUD Lengkap: Tambah user, <b>edit username</b>, ubah nama & hak akses, riset password, dan hapus akun.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <UserPlus size={18} />
            Tambah User Baru
          </button>
        </div>
      </div>

      <div className="glass-card table-wrapper-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Role Utama</th>
                <th>Checklist Fitur Aktif</th>
                <th style={{ textAlign: 'center' }}>Aksi CRUD (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Memuat data user...
                  </td>
                </tr>
              ) : usersList.map((usr, idx) => (
                <tr key={usr.id}>
                  <td data-label="No">{idx + 1}</td>
                  <td data-label="Nama Lengkap" style={{ fontWeight: 600 }}>{usr.nama}</td>
                  <td data-label="Username" style={{ fontFamily: 'monospace', color: 'var(--primary-500)', fontWeight: 700 }}>@{usr.username}</td>
                  <td data-label="Role Utama">{getRoleBadge(usr.role)}</td>
                  <td data-label="Checklist Fitur Aktif">{renderPermissionPills(usr.permissions)}</td>
                  <td data-label="Aksi CRUD" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      {/* Edit Username, Nama & Role/Perms */}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(usr)}
                        title="Edit Username, Nama & Hak Akses"
                      >
                        <Edit3 size={15} color="var(--primary-500)" />
                        Edit User / Username
                      </button>

                      {/* Reset Password Button */}
                      {(currentUser?.role === 'administrator' || currentUser?.permissions?.reset_password) && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenResetPass(usr)}
                          title="Riset Password User"
                        >
                          <KeyRound size={15} color="#f59e0b" />
                          Riset Pass
                        </button>
                      )}

                      {/* Delete User */}
                      {usr.id !== currentUser?.id ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(usr.id, usr.username)}
                          title="Hapus User"
                        >
                          <Trash2 size={15} />
                          Hapus
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled title="Tidak dapat menghapus akun sendiri">
                          <Trash2 size={15} color="#6b7280" />
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: TAMBAH USER --- */}
      {isAddUserOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tambah Akun Web User Baru</h3>
              <button className="close-btn" onClick={() => setIsAddUserOpen(false)}><X size={20} /></button>
            </div>

            {formError && <div style={{ color: '#f87171', fontSize: '0.85em', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleAddUserSubmit}>
              <div className="form-group">
                <label>Nama Lengkap User</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Ahmad Yani"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (Untuk Reset Password)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Contoh: ahmad@cemindo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Username (Digunakan untuk Login)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username unik (tanpa spasi)"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimal 4 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pilih Preset Role Utama</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => handleRolePresetChange(e.target.value)}
                >
                  <option value="administrator">1. Administrator (Dev)</option>
                  <option value="hrga_section_head">2. HRGA & Supporting Section Head</option>
                  <option value="hrga_leader">3. HRGA Leader</option>
                  <option value="user_basic">4. User Basic</option>
                </select>
              </div>

              {/* Rincian Checklist Fitur */}
              <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85em', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                  Checklist Rincian Fitur Yang Diizinkan:
                </label>
                <div className="form-grid-2" style={{ gap: '0.65rem' }}>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.view} onChange={() => handlePermissionToggle('view')} />
                    <span>Lihat & Cari Karyawan</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.add} onChange={() => handlePermissionToggle('add')} />
                    <span>Tambah Karyawan Baru</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.edit} onChange={() => handlePermissionToggle('edit')} />
                    <span>Edit / Update Status</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.delete} onChange={() => handlePermissionToggle('delete')} />
                    <span style={{ color: formData.permissions.delete ? '#ef4444' : 'inherit' }}>Hapus Karyawan</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.export} onChange={() => handlePermissionToggle('export')} />
                    <span>Export Data (Excel)</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.manage_users} onChange={() => handlePermissionToggle('manage_users')} />
                    <span style={{ color: formData.permissions.manage_users ? '#a855f7' : 'inherit' }}>Kelola System Users</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.reset_password} onChange={() => handlePermissionToggle('reset_password')} />
                    <span style={{ color: formData.permissions.reset_password ? '#f59e0b' : 'inherit' }}>Reset Password Web</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.reset_pass_bot} onChange={() => handlePermissionToggle('reset_pass_bot')} />
                    <span style={{ color: formData.permissions.reset_pass_bot ? '#d97706' : 'inherit' }}>Reset Pass Bot</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.edit_medical_history} onChange={() => handlePermissionToggle('edit_medical_history')} />
                    <span style={{ color: formData.permissions.edit_medical_history ? '#8b5cf6' : 'inherit' }}>Edit Medical History</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.delete_medical_history} onChange={() => handlePermissionToggle('delete_medical_history')} />
                    <span style={{ color: formData.permissions.delete_medical_history ? '#dc2626' : 'inherit' }}>Delete Medical History</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.export_medical_history || false} onChange={() => handlePermissionToggle('export_medical_history')} />
                    <span style={{ color: formData.permissions.export_medical_history ? '#059669' : 'inherit' }}>Export Medical History</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.bulk_reset_budget || false} onChange={() => handlePermissionToggle('bulk_reset_budget')} />
                    <span style={{ color: formData.permissions.bulk_reset_budget ? '#be123c' : 'inherit' }}>Bulk Reset Budget</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Buat Akun User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT USER, USERNAME & PERMISSIONS --- */}
      {isEditUserOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsEditUserOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User, Username & Hak Akses</h3>
              <button className="close-btn" onClick={() => setIsEditUserOpen(false)}><X size={20} /></button>
            </div>

            {formError && <div style={{ color: '#f87171', fontSize: '0.85em', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleEditUserSubmit}>
              <div className="form-group">
                <label>Nama Lengkap User</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (Untuk Reset Password)</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Editable Username Field */}
              <div className="form-group">
                <label style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
                  Username Login (Edit Username)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan username baru"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label>Pilih Preset Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => handleRolePresetChange(e.target.value)}
                >
                  <option value="administrator">1. Administrator (Dev)</option>
                  <option value="hrga_section_head">2. HRGA & Supporting Section Head</option>
                  <option value="hrga_leader">3. HRGA Leader</option>
                  <option value="user_basic">4. User Basic</option>
                </select>
              </div>

              {/* Rincian Checklist Fitur Specific Toggle */}
              <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875em', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'block' }}>
                  Checklist Rincian Akses Fitur Khusus:
                </label>
                <div className="form-grid-2" style={{ gap: '0.65rem' }}>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.view} onChange={() => handlePermissionToggle('view')} />
                    <span style={{ fontSize: '0.85em' }}>Lihat & Cari Karyawan</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.add} onChange={() => handlePermissionToggle('add')} />
                    <span style={{ fontSize: '0.85em' }}>Tambah Karyawan Baru</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.edit} onChange={() => handlePermissionToggle('edit')} />
                    <span style={{ fontSize: '0.85em' }}>Edit / Update Status</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.delete} onChange={() => handlePermissionToggle('delete')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.delete ? '#ef4444' : 'inherit' }}>Hapus Karyawan</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.export} onChange={() => handlePermissionToggle('export')} />
                    <span style={{ fontSize: '0.85em' }}>Export Data (Excel)</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.manage_users} onChange={() => handlePermissionToggle('manage_users')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.manage_users ? '#a855f7' : 'inherit' }}>Kelola System Users</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.reset_password} onChange={() => handlePermissionToggle('reset_password')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.reset_password ? '#f59e0b' : 'inherit' }}>Reset Password Web</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.reset_pass_bot} onChange={() => handlePermissionToggle('reset_pass_bot')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.reset_pass_bot ? '#d97706' : 'inherit' }}>Reset Pass Bot</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.edit_medical_history} onChange={() => handlePermissionToggle('edit_medical_history')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.edit_medical_history ? '#8b5cf6' : 'inherit' }}>Edit Medical History</span>
                  </label>

                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.delete_medical_history} onChange={() => handlePermissionToggle('delete_medical_history')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.delete_medical_history ? '#dc2626' : 'inherit' }}>Delete Medical History</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.export_medical_history || false} onChange={() => handlePermissionToggle('export_medical_history')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.export_medical_history ? '#059669' : 'inherit' }}>Export Medical History</span>
                  </label>
                  <label className="checkbox-group">
                    <input type="checkbox" checked={formData.permissions.bulk_reset_budget || false} onChange={() => handlePermissionToggle('bulk_reset_budget')} />
                    <span style={{ fontSize: '0.85em', color: formData.permissions.bulk_reset_budget ? '#be123c' : 'inherit' }}>Bulk Reset Budget</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditUserOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RISET PASSWORD USER BY ADMIN --- */}
      {isResetPassOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsResetPassOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b' }}>
                <KeyRound size={22} />
                <h3>Riset Password User</h3>
              </div>
              <button className="close-btn" onClick={() => setIsResetPassOpen(false)}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Masukkan password baru untuk akun <b>@{selectedUser.username}</b> ({selectedUser.nama}):
            </p>

            {formError && <div style={{ color: '#f87171', fontSize: '0.85em', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleResetPassSubmit}>
              <div className="form-group">
                <label>Password Baru</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Masukkan password baru"
                  value={resetPassInput}
                  onChange={(e) => setResetPassInput(e.target.value)}
                  required
                  minLength={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsResetPassOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Password Baru</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserAdmin;
