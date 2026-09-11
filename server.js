require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { getMedicalLimits } = require('./medicalUtils');
const crypto = require('crypto');
const { sendResetPasswordEmail, sendDeductionNotification } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cemindo_hrga_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Default Permissions Generator
function getDefaultPermissions(role) {
    switch (role) {
        case 'administrator':
            return { view: true, add: true, edit: true, delete: true, export: true, manage_users: true };
        case 'hrga_section_head':
            return { view: true, add: true, edit: true, delete: true, export: true, manage_users: false };
        case 'hrga_leader':
            return { view: true, add: true, edit: true, delete: false, export: true, manage_users: false };
        case 'user_basic':
        default:
            return { view: true, add: false, edit: false, delete: false, export: false, manage_users: false };
    }
}

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
        }
        req.user = user;
        next();
    });
}

// Granular Permission Authorization Middleware
function authorizePermission(permissionKey) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Akses ditolak.' });
        }

        // Administrator has all permissions by default
        if (req.user.role === 'administrator') {
            return next();
        }

        const userPerms = req.user.permissions || {};
        if (userPerms[permissionKey] === true) {
            return next();
        }

        return res.status(403).json({
            message: `Akses ditolak. Anda tidak memiliki izin '${permissionKey}' untuk fitur ini.`
        });
    };
}

// System Activity Logger
async function logActivity(userId, action, description) {
    if (!userId) return;
    try {
        await db.query('INSERT INTO system_logs (user_id, action, description) VALUES (?, ?, ?)', [userId, action, description]);
    } catch (err) {
        console.error('Failed to write system log:', err);
    }
}

// --- AUTH ROUTES ---

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi.' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        let permissionsObj;
        try {
            permissionsObj = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : getDefaultPermissions(user.role);
        } catch (e) {
            permissionsObj = getDefaultPermissions(user.role);
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            nama: user.nama,
            role: user.role,
            permissions: permissionsObj
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

        await logActivity(user.id, 'LOGIN', `User ${user.username} berhasil login`);

        res.json({
            message: 'Login berhasil',
            token,
            user: tokenPayload
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        await logActivity(req.user.id, 'LOGOUT', `User ${req.user.username} berhasil logout`);
        res.json({ message: 'Logout activity logged' });
    } catch (error) {
        console.error('Logout log error:', error);
        res.status(500).json({ message: 'Error logging logout activity' });
    }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email wajib diisi.' });

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Email tidak ditemukan.' });
        }
        
        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [resetToken, tokenExpiry, user.id]);

        const resetUrl = `http://localhost:5173/?resetToken=${resetToken}`;
        const emailResult = await sendResetPasswordEmail(user.email, resetUrl);

        if (emailResult.success) {
            await logActivity(user.id, 'FORGOT_PASSWORD', `User requesting password reset via email`);
            res.json({ message: 'Link reset password telah dikirim ke email Anda.' });
        } else {
            res.status(500).json({ message: 'Gagal mengirim email reset password.' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: 'Token dan password baru wajib diisi.' });

        const [users] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, new Date()]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Token reset password tidak valid atau sudah kedaluwarsa.' });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, user.id]);
        await logActivity(user.id, 'RESET_PASSWORD', `User successfully reset their password`);

        res.json({ message: 'Password berhasil direset. Silakan login dengan password baru.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// PUT /api/auth/change-password (All authenticated roles can change their own password)
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Password saat ini dan password baru wajib diisi.' });
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ message: 'Password baru minimal 4 karakter.' });
        }

        const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password saat ini tidak sesuai.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        await logActivity(req.user.id, 'CHANGE_PASSWORD', `User mengubah password mereka`);

        res.json({ message: 'Password Anda berhasil diperbarui.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Gagal memperbarui password.' });
    }
});

// --- KARYAWAN ROUTES ---

// GET /api/karyawan (Fetch list with search, filter & pagination, plus metrics)
app.get('/api/karyawan', authenticateToken, async (req, res) => {
    try {
        const search = req.query.search || '';
        const department = req.query.department || '';
        const status = req.query.status || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const queryParams = [];

        if (search) {
            const searchCols = ['nik', 'nama_lengkap', 'jenis_kelamin', 'department', 'status', 'nama_istri', 'nama_anak_pertama', 'nama_anak_kedua', 'nama_anak_ketiga'];
            whereClause += ' AND (' + searchCols.map(col => `${col} ILIKE ?`).join(' OR ') + ')';
            queryParams.push(...Array(searchCols.length).fill(`%${search}%`));
        }

        if (department) {
            whereClause += ' AND department = ?';
            queryParams.push(department);
        }

        if (status) {
            whereClause += ' AND status = ?';
            queryParams.push(status);
        }

        // Count total matching records
        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM karyawan ${whereClause}`, queryParams);
        const totalRows = countResult[0].total;

        // Fetch paginated data sorted alphabetically A-Z by name
        const dataQuery = `SELECT id, nik, nama_lengkap, department, status, jenis_kelamin, golongan, email, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga FROM karyawan ${whereClause} ORDER BY nama_lengkap ASC LIMIT ? OFFSET ?`;
        const [rows] = await db.query(dataQuery, [...queryParams, limit, offset]);

        // Fetch summary metrics
        const [metricsRows] = await db.query(`
            SELECT 
                COUNT(*) as total_karyawan,
                SUM(CASE WHEN status = 'Aktif' THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN status != 'Aktif' THEN 1 ELSE 0 END) as total_non_aktif
            FROM karyawan
        `);

        // Fetch distinct departments list
        const [deptRows] = await db.query(`SELECT DISTINCT department FROM karyawan ORDER BY department ASC`);
        const departmentsList = deptRows.map(d => d.department);

        res.json({
            data: rows,
            pagination: {
                page,
                limit,
                totalRows,
                totalPages: Math.ceil(totalRows / limit)
            },
            metrics: metricsRows[0],
            departments: departmentsList
        });
    } catch (error) {
        console.error('Fetch karyawan error:', error);
        res.status(500).json({ message: 'Gagal mengambil data karyawan.' });
    }
});

// POST /api/karyawan (Add new employee - requires 'add' permission)
app.post('/api/karyawan', authenticateToken, authorizePermission('add'), async (req, res) => {
    try {
        const { nik, nama_lengkap, department, status, jenis_kelamin, golongan, email, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga } = req.body;

        if (!nik || !nama_lengkap || !department) {
            return res.status(400).json({ message: 'NIK, Nama Lengkap, dan Department wajib diisi.' });
        }

        const employeeStatus = status || 'Aktif';
        const employeeGender = jenis_kelamin || 'Laki-laki';

        // Check if NIK already exists
        const [existing] = await db.query('SELECT id FROM karyawan WHERE nik = ?', [nik]);
        if (existing.length > 0) {
            return res.status(400).json({ message: `NIK '${nik}' sudah terdaftar pada sistem.` });
        }

        const [result] = await db.query(
            'INSERT INTO karyawan (nik, nama_lengkap, department, status, jenis_kelamin, golongan, email, bot_password, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
            [nik.trim(), nama_lengkap.trim(), department.trim(), employeeStatus, employeeGender, golongan || '4 (A-B)', email || null, nik.trim(), nama_istri || null, nama_anak_pertama || null, nama_anak_kedua || null, nama_anak_ketiga || null]
        );

        await logActivity(req.user.id, 'CREATE_KARYAWAN', `Menambahkan karyawan baru: ${nama_lengkap} (NIK: ${nik})`);

        res.status(201).json({
            message: 'Karyawan berhasil ditambahkan.',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create karyawan error:', error);
        res.status(500).json({ message: 'Gagal menambahkan data karyawan.' });
    }
});

// POST /api/karyawan/bulk-import (Bulk import employees from Excel/CSV - Administrator Only)
app.post('/api/karyawan/bulk-import', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return res.status(403).json({ message: 'Akses ditolak. Fitur bulk import hanya dapat diakses oleh Administrator.' });
        }

        const { employees } = req.body;
        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({ message: 'Data impor tidak boleh kosong.' });
        }

        let insertedCount = 0;
        let skippedCount = 0;
        const errorList = [];

        for (let i = 0; i < employees.length; i++) {
            const item = employees[i];
            const nik = item.nik || item.NIK || item.Nik;
            const nama_lengkap = item.nama_lengkap || item.NAMA_LENGKAP || item.Nama_Lengkap || item['Nama Lengkap'] || item.nama || item.Nama;
            const department = item.department || item.DEPARTMENT || item.Department || item.dept || item.Dept;
            const golongan = item.golongan || item.Golongan || item.GOLONGAN || item.grade || item.Grade || item.GRADE || '4 (A-B)';
            const nama_istri = item.nama_istri || item.NAMA_ISTRI || item.Nama_Istri || item['Nama Istri'] || null;
            const nama_anak_pertama = item.nama_anak_pertama || item.NAMA_ANAK_PERTAMA || item.Nama_Anak_Pertama || item['Nama Anak Pertama'] || item['Nama Anak 1'] || null;
            const nama_anak_kedua = item.nama_anak_kedua || item.NAMA_ANAK_KEDUA || item.Nama_Anak_Kedua || item['Nama Anak Kedua'] || item['Nama Anak 2'] || null;
            const nama_anak_ketiga = item.nama_anak_ketiga || item.NAMA_ANAK_KETIGA || item.Nama_Anak_Ketiga || item['Nama Anak Ketiga'] || item['Nama Anak 3'] || null;

            if (!nik || !nama_lengkap || !department) {
                skippedCount++;
                errorList.push(`Baris #${i + 1}: Diabaikan (NIK, Nama, atau Department kosong)`);
                continue;
            }

            const cleanNik = String(nik).trim();
            const cleanName = String(nama_lengkap).trim();
            const cleanDept = String(department).trim();
            const rawStatus = item.status || item.Status || item.STATUS || 'Aktif';
            const rawGender = item.jenis_kelamin || item.Jenis_Kelamin || item['Jenis Kelamin'] || item.Gender || item.JENIS_KELAMIN || 'Laki-laki';
            
            const cleanStatus = String(rawStatus).trim() || 'Aktif';
            const cleanGender = String(rawGender).trim() || 'Laki-laki';

            // Check if NIK already exists
            const [existing] = await db.query('SELECT id FROM karyawan WHERE nik = ?', [cleanNik]);
            if (existing.length > 0) {
                skippedCount++;
                errorList.push(`Baris #${i + 1} (NIK '${cleanNik}'): Diabaikan (NIK sudah terdaftar)`);
                continue;
            }

            await db.query(
                'INSERT INTO karyawan (nik, nama_lengkap, department, status, jenis_kelamin, golongan, bot_password, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
                [cleanNik, cleanName, cleanDept, cleanStatus, cleanGender, golongan, cleanNik, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga]
            );
            insertedCount++;
        }

        await logActivity(req.user.id, 'BULK_IMPORT', `Import ${insertedCount} karyawan sukses, skip ${skippedCount}`);

        res.json({
            message: `Proses impor selesai. ${insertedCount} data berhasil ditambahkan, ${skippedCount} data diabaikan.`,
            insertedCount,
            skippedCount,
            totalProcessed: employees.length,
            errorList
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memproses impor massal.' });
    }
});

// PUT /api/karyawan/:id (Update employee - requires 'edit' permission)
app.put('/api/karyawan/:id', authenticateToken, authorizePermission('edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nik, nama_lengkap, department, status, jenis_kelamin, golongan, email, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga } = req.body;

        if (!nik || !nama_lengkap || !department || !status) {
            return res.status(400).json({ message: 'NIK, Nama Lengkap, Department, dan Status wajib diisi.' });
        }

        const [existing] = await db.query('SELECT id FROM karyawan WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Data karyawan tidak ditemukan.' });
        }

        const [nikCheck] = await db.query('SELECT id FROM karyawan WHERE nik = ? AND id != ?', [nik, id]);
        if (nikCheck.length > 0) {
            return res.status(400).json({ message: `NIK '${nik}' sudah digunakan oleh karyawan lain.` });
        }

        const employeeGender = jenis_kelamin || 'Laki-laki';

        await db.query(
            'UPDATE karyawan SET nik = ?, nama_lengkap = ?, department = ?, status = ?, jenis_kelamin = ?, golongan = ?, email = ?, nama_istri = ?, nama_anak_pertama = ?, nama_anak_kedua = ?, nama_anak_ketiga = ? WHERE id = ?',
            [nik.trim(), nama_lengkap.trim(), department.trim(), status, employeeGender, golongan || '4 (A-B)', email || null, nama_istri || null, nama_anak_pertama || null, nama_anak_kedua || null, nama_anak_ketiga || null, id]
        );

        await logActivity(req.user.id, 'UPDATE_KARYAWAN', `Memperbarui data karyawan ID ${id} (${nama_lengkap})`);

        res.json({ message: 'Data karyawan berhasil diperbarui.' });
    } catch (error) {
        console.error('Update karyawan error:', error);
        res.status(500).json({ message: 'Gagal memperbarui data karyawan.' });
    }
});

// DELETE /api/karyawan/:id (Hard delete - requires 'delete' permission)
app.delete('/api/karyawan/:id', authenticateToken, authorizePermission('delete'), async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT id, nama_lengkap FROM karyawan WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Data karyawan tidak ditemukan.' });
        }

        await db.query('DELETE FROM karyawan WHERE id = ?', [id]);
        
        await logActivity(req.user.id, 'DELETE_KARYAWAN', `Menghapus karyawan ID ${id}`);

        res.json({
            message: `Karyawan '${existing[0].nama_lengkap}' berhasil dihapus secara permanen dari database.`
        });
    } catch (error) {
        console.error('Delete karyawan error:', error);
        res.status(500).json({ message: 'Gagal menghapus data karyawan.' });
    }
});

// POST /api/karyawan/bulk-delete (Bulk Hard Delete - requires 'delete' permission)
app.post('/api/karyawan/bulk-delete', authenticateToken, authorizePermission('delete'), async (req, res) => {
    try {
        const { ids, search, department, status, deleteAllFiltered } = req.body;

        if (deleteAllFiltered) {
            let whereClause = 'WHERE 1=1';
            const queryParams = [];

            if (search) {
                whereClause += ' AND (nik ILIKE ? OR nama_lengkap ILIKE ?)';
                queryParams.push(`%${search}%`, `%${search}%`);
            }

            if (department) {
                whereClause += ' AND department = ?';
                queryParams.push(department);
            }

            if (status) {
                whereClause += ' AND status = ?';
                queryParams.push(status);
            }

            const [result] = await db.query(`DELETE FROM karyawan ${whereClause}`, queryParams);

            await logActivity(req.user.id, 'BULK_DELETE', `Menghapus massal ${result.affectedRows} karyawan`);

            return res.json({
                message: `Berhasil menghapus seluruh ${result.affectedRows} data karyawan yang terfilter secara permanen dari database.`,
                deletedCount: result.affectedRows
            });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Tidak ada data yang dipilih untuk dihapus.' });
        }

        const [result] = await db.query('DELETE FROM karyawan WHERE id IN (?)', [ids]);
        
        await logActivity(req.user.id, 'BULK_DELETE', `Menghapus massal ${result.affectedRows} karyawan`);

        res.json({
            message: `Berhasil menghapus ${result.affectedRows} data karyawan secara permanen dari database.`,
            deletedCount: result.affectedRows
        });
    } catch (error) {
        console.error('Bulk delete karyawan error:', error);
        res.status(500).json({ message: 'Gagal melakukan penghapusan massal data karyawan.' });
    }
});

// --- USER MANAGEMENT ROUTES (requires 'manage_users' permission or administrator role) ---

// GET /api/users
app.get('/api/users', authenticateToken, authorizePermission('manage_users'), async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, nama, role, permissions, created_at FROM users ORDER BY id ASC');
        const parsedUsers = users.map(u => {
            let permsObj;
            try {
                permsObj = u.permissions ? (typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions) : getDefaultPermissions(u.role);
            } catch (e) {
                permsObj = getDefaultPermissions(u.role);
            }
            return { ...u, permissions: permsObj };
        });
        res.json({ users: parsedUsers });
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Gagal mengambil data user.' });
    }
});

// POST /api/users (Add new user)
app.post('/api/users', authenticateToken, authorizePermission('manage_users'), async (req, res) => {
    try {
        const { username, password, nama, email, role, permissions } = req.body;

        if (!username || !password || !nama || !role) {
            return res.status(400).json({ message: 'Semua field utama wajib diisi.' });
        }

        const validRoles = ['administrator', 'hrga_section_head', 'hrga_leader', 'user_basic'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid.' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ message: `Username '${username}' sudah digunakan.` });
        }

        const permsObj = permissions || getDefaultPermissions(role);
        const permsJson = JSON.stringify(permsObj);
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (username, password, email, nama, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [username.trim(), hashedPassword, email || null, nama.trim(), role, permsJson]
        );

        await logActivity(req.user.id, 'CREATE_USER', `Membuat user baru: ${username} (${role})`);

        res.status(201).json({ message: 'User berhasil dibuat.' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Gagal membuat user baru.' });
    }
});

// PUT /api/users/:id (Update user info, username, role & permissions - ONLY Administrator)
app.put('/api/users/:id', authenticateToken, authorizePermission('manage_users'), async (req, res) => {
    try {
        const { id } = req.params;
        const { username, nama, email, role, permissions, password } = req.body;

        if (!nama || !role) {
            return res.status(400).json({ message: 'Nama dan Role wajib diisi.' });
        }

        const validRoles = ['administrator', 'hrga_section_head', 'hrga_leader', 'user_basic'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid.' });
        }

        const [existing] = await db.query('SELECT id, username FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        let updatedUsername = existing[0].username;
        if (username && username.trim()) {
            updatedUsername = username.trim();
            const [usernameCheck] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [updatedUsername, id]);
            if (usernameCheck.length > 0) {
                return res.status(400).json({ message: `Username '${updatedUsername}' sudah digunakan oleh user lain.` });
            }
        }

        const permsObj = permissions || getDefaultPermissions(role);
        const permsJson = JSON.stringify(permsObj);

        if (password && password.trim().length >= 4) {
            const hashedPassword = await bcrypt.hash(password.trim(), 10);
            await db.query('UPDATE users SET username = ?, email = ?, nama = ?, role = ?, permissions = ?, password = ? WHERE id = ?', [updatedUsername, email || null, nama.trim(), role, permsJson, hashedPassword, id]);
        } else {
            await db.query('UPDATE users SET username = ?, email = ?, nama = ?, role = ?, permissions = ? WHERE id = ?', [updatedUsername, email || null, nama.trim(), role, permsJson, id]);
        }

        await logActivity(req.user.id, 'UPDATE_USER', `Memperbarui data user ID ${id} (${updatedUsername})`);

        res.json({ message: 'Data, username, dan hak akses user berhasil diperbarui.' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Gagal memperbarui user.' });
    }
});

// PUT /api/users/:id/password (Administrator reset user password)
app.put('/api/users/:id/password', authenticateToken, authorizePermission('manage_users'), async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.trim().length < 4) {
            return res.status(400).json({ message: 'Password baru minimal 4 karakter.' });
        }

        const [existing] = await db.query('SELECT id, username FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

        await logActivity(req.user.id, 'RESET_PASSWORD', `Meriset password untuk user ID ${id} (${existing[0].username})`);

        res.json({ message: `Password untuk user '${existing[0].username}' berhasil diperbarui.` });
    } catch (error) {
        console.error('Reset user password error:', error);
        res.status(500).json({ message: 'Gagal meriset password user.' });
    }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticateToken, authorizePermission('manage_users'), async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        
        await logActivity(req.user.id, 'DELETE_USER', `Menghapus akun user ID ${id}`);

        res.json({ message: 'User berhasil dihapus.' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Gagal menghapus user.' });
    }
});

// --- LOGS ROUTE ---
app.get('/api/logs', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return res.status(403).json({ message: 'Akses ditolak. Hanya administrator yang dapat melihat log.' });
        }
        const [logs] = await db.query(`
            SELECT sl.id, sl.action, sl.description, sl.created_at, u.nama AS actor_name, u.username AS actor_username
            FROM system_logs sl
            LEFT JOIN users u ON sl.user_id = u.id
            ORDER BY sl.created_at DESC
            LIMIT 500
        `);
        res.json({ logs });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ message: 'Gagal mengambil data log.' });
    }
});

// --- MEDICAL PLAFOND ROUTES ---

// GET /api/medical
app.get('/api/medical', authenticateToken, async (req, res) => {
    try {
        const search = req.query.search || '';
        let whereClause = "WHERE is_deleted = 0 AND status = 'Aktif'";
        const queryParams = [];

        if (search) {
            whereClause += ' AND (nik ILIKE ? OR nama_lengkap ILIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const [karyawans] = await db.query(`SELECT id, nik, nama_lengkap, department, golongan FROM karyawan ${whereClause} ORDER BY nama_lengkap ASC`, queryParams);
        
        const [transactions] = await db.query(`
            SELECT karyawan_id, kategori, SUM(nominal) as total_used 
            FROM medical_transactions 
            WHERE EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE) 
            GROUP BY karyawan_id, kategori
        `);

        const trxMap = {};
        transactions.forEach(t => {
            if (!trxMap[t.karyawan_id]) trxMap[t.karyawan_id] = {};
            trxMap[t.karyawan_id][t.kategori] = parseFloat(t.total_used);
        });

        const data = karyawans.map(k => {
            const limits = getMedicalLimits(k.golongan);
            const usage = trxMap[k.id] || {};
            return {
                id: k.id,
                nik: k.nik,
                nama_lengkap: k.nama_lengkap,
                department: k.department,
                golongan: k.golongan,
                limits,
                usage: {
                    'Rawat Inap Total': usage['Rawat Inap Total'] || 0,
                    'Rawat Jalan': usage['Rawat Jalan'] || 0,
                    'Kacamata': usage['Kacamata'] || 0,
                    'Persalinan': usage['Persalinan'] || 0
                }
            };
        });

        res.json({ data });
    } catch (error) {
        console.error('Fetch medical data error:', error);
        res.status(500).json({ message: 'Gagal mengambil data medical plafond.' });
    }
});

// POST /api/medical/deduct
app.post('/api/medical/deduct', authenticateToken, authorizePermission('edit'), async (req, res) => {
    try {
        const { karyawan_id, kategori, nominal, deskripsi, tanggal, foto_bukti } = req.body;
        if (!karyawan_id || !kategori || !nominal || !tanggal) {
            return res.status(400).json({ message: 'Data potongan tidak lengkap.' });
        }
        
        await db.query(
            'INSERT INTO medical_transactions (karyawan_id, kategori, nominal, deskripsi, tanggal, created_by, foto_bukti) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [karyawan_id, kategori, nominal, deskripsi || null, tanggal, req.user.id, foto_bukti || null]
        );
        
        await logActivity(req.user.id, 'MEDICAL_DEDUCT', `Memotong plafond ${kategori} sebesar ${nominal} untuk karyawan ID ${karyawan_id}`);
        
        // Fetch employee details to check for email and send notification
        const [empRows] = await db.query('SELECT nik, nama_lengkap, email, golongan FROM karyawan WHERE id = ?', [karyawan_id]);
        if (empRows.length > 0 && empRows[0].email) {
            const emp = empRows[0];
            const limits = getMedicalLimits(emp.golongan);
            const plafonKategori = limits[kategori] || 0;
            const [transactions] = await db.query(`
                SELECT SUM(nominal) as total_used 
                FROM medical_transactions 
                WHERE EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE) AND karyawan_id = ? AND kategori = ?
            `, [karyawan_id, kategori]);
            const totalUsed = transactions[0].total_used || 0;
            const sisaPlafon = plafonKategori - totalUsed;
            
            // Send email asynchronously
            sendDeductionNotification(emp.email, emp.nama_lengkap, emp.nik, kategori, nominal, sisaPlafon).catch(err => console.error('Error in sendDeductionNotification:', err));
        }

        res.json({ message: 'Potongan plafond berhasil disimpan.' });
    } catch (error) {
        console.error('Deduct medical error:', error);
        res.status(500).json({ message: 'Gagal menyimpan transaksi.' });
    }
});

// GET /api/medical/history-all (Global history)
app.get('/api/medical/history-all', authenticateToken, async (req, res) => {
    try {
        const [history] = await db.query(`
            SELECT m.*, k.nama_lengkap, k.nik, u.nama as pic_name 
            FROM medical_transactions m 
            LEFT JOIN karyawan k ON m.karyawan_id = k.id
            LEFT JOIN users u ON m.created_by = u.id 
            ORDER BY m.tanggal DESC, m.id DESC
        `);
        res.json({ history });
    } catch (error) {
        console.error('Fetch all history error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat transaksi global.' });
    }
});

// GET /api/medical/history/:id
app.get('/api/medical/history/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [history] = await db.query(`
            SELECT m.*, u.nama as pic_name 
            FROM medical_transactions m 
            LEFT JOIN users u ON m.created_by = u.id 
            WHERE m.karyawan_id = ?
            ORDER BY m.tanggal DESC, m.id DESC
        `, [id]);
        res.json({ history });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil riwayat transaksi.' });
    }
});

// PUT /api/medical/history/:id
app.put('/api/medical/history/:id', authenticateToken, authorizePermission('edit_medical_history'), async (req, res) => {
    try {
        const { id } = req.params;
        const { kategori, nominal, deskripsi, tanggal, foto_bukti } = req.body;
        
        if (!kategori || !nominal || !tanggal) {
            return res.status(400).json({ message: 'Kategori, nominal, dan tanggal wajib diisi.' });
        }
        
        const [existing] = await db.query('SELECT * FROM medical_transactions WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        
        let query = 'UPDATE medical_transactions SET kategori=?, nominal=?, deskripsi=?, tanggal=?';
        let params = [kategori, nominal, deskripsi, tanggal];
        
        if (foto_bukti !== undefined) {
            query += ', foto_bukti=?';
            params.push(foto_bukti);
        }
        
        query += ' WHERE id=?';
        params.push(id);
        
        await db.query(query, params);
        
        const [emp] = await db.query('SELECT nama_lengkap FROM karyawan WHERE id = ?', [existing[0].karyawan_id]);
        await logActivity(req.user.id, 'EDIT_MED_HISTORY', `Edit transaksi medical karyawan ${emp[0]?.nama_lengkap || 'Unknown'}`);
        
        res.json({ message: 'Transaksi berhasil diupdate.' });
    } catch (error) {
        console.error('Update medical history error:', error);
        res.status(500).json({ message: 'Gagal mengupdate transaksi.' });
    }
});

// DELETE /api/medical/history/:id
app.delete('/api/medical/history/:id', authenticateToken, authorizePermission('delete_medical_history'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const [existing] = await db.query('SELECT karyawan_id FROM medical_transactions WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        
        await db.query('DELETE FROM medical_transactions WHERE id = ?', [id]);
        
        const [emp] = await db.query('SELECT nama_lengkap FROM karyawan WHERE id = ?', [existing[0].karyawan_id]);
        await logActivity(req.user.id, 'DELETE_MED_HISTORY', `Hapus transaksi medical karyawan ${emp[0]?.nama_lengkap || 'Unknown'}`);
        
        res.json({ message: 'Transaksi berhasil dihapus.' });
    } catch (error) {
        console.error('Delete medical history error:', error);
        res.status(500).json({ message: 'Gagal menghapus transaksi.' });
    }
});

// PUT /api/medical/reset-bot-password/:id
app.put('/api/medical/reset-bot-password/:id', authenticateToken, authorizePermission('edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const [existing] = await db.query('SELECT nik, nama_lengkap FROM karyawan WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Karyawan tidak ditemukan.' });
        
        const targetPassword = newPassword && newPassword.trim() ? newPassword.trim() : existing[0].nik;
        const isCustom = newPassword && newPassword.trim() ? 'kustom' : 'default (NIK)';
        await db.query('UPDATE karyawan SET bot_password = ? WHERE id = ?', [targetPassword, id]);
        await logActivity(req.user.id, 'RESET_BOT_PASSWORD', `Reset bot password karyawan ${existing[0].nama_lengkap} ke ${isCustom}`);
        
        res.json({ message: `Password Bot WhatsApp berhasil diubah ke ${isCustom}.` });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mereset password bot.' });
    }
});

// DELETE /api/medical/bulk-reset-budget
app.delete('/api/medical/bulk-reset-budget', authenticateToken, authorizePermission('edit'), async (req, res) => {
    try {
        await db.query('DELETE FROM medical_transactions WHERE EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE)');
        await logActivity(req.user.id, 'BULK_RESET_BUDGET', `Melakukan bulk reset manual budget medical untuk seluruh karyawan (tahun ini)`);
        res.json({ message: 'Budget seluruh karyawan untuk tahun ini berhasil di-reset.' });
    } catch (error) {
        console.error('Bulk reset budget error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat bulk reset budget.' });
    }
});

// DELETE /api/medical/reset-budget/:id
app.delete('/api/medical/reset-budget/:id', authenticateToken, authorizePermission('edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT nama_lengkap FROM karyawan WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Karyawan tidak ditemukan.' });
        
        await db.query('DELETE FROM medical_transactions WHERE karyawan_id = ? AND EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE)', [id]);
        
        await logActivity(req.user.id, 'RESET_BUDGET', `Reset manual budget medical karyawan ${existing[0].nama_lengkap} untuk tahun ini`);
        
        res.json({ message: 'Budget medical berhasil di-reset untuk tahun berjalan.' });
    } catch (error) {
        console.error('Reset budget error:', error);
        res.status(500).json({ message: 'Gagal mereset budget.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server Backend API HRGA berjalan di http://localhost:${PORT}`);
});
