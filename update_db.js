require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateDatabase() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cemindo_hr'
        });

        console.log("1. Checking table 'karyawan' for 'is_deleted' column...");
        const [columns] = await connection.query(`SHOW COLUMNS FROM karyawan LIKE 'is_deleted'`);
        if (columns.length === 0) {
            console.log("Adding column 'is_deleted' to 'karyawan'...");
            await connection.query(`ALTER TABLE karyawan ADD COLUMN is_deleted TINYINT(1) DEFAULT 0`);
            console.log("Column 'is_deleted' added successfully.");
        }

        console.log("1b. Checking table 'karyawan' for family data columns...");
        const [familyCols] = await connection.query(`SHOW COLUMNS FROM karyawan LIKE 'nama_istri'`);
        if (familyCols.length === 0) {
            console.log("Adding family data columns and removing alamat & join_date...");
            await connection.query(`ALTER TABLE karyawan ADD COLUMN nama_istri VARCHAR(100) NULL`);
            await connection.query(`ALTER TABLE karyawan ADD COLUMN nama_anak_pertama VARCHAR(100) NULL`);
            await connection.query(`ALTER TABLE karyawan ADD COLUMN nama_anak_kedua VARCHAR(100) NULL`);
            await connection.query(`ALTER TABLE karyawan ADD COLUMN nama_anak_ketiga VARCHAR(100) NULL`);
            
            try { await connection.query(`ALTER TABLE karyawan DROP COLUMN alamat`); } catch (e) {}
            try { await connection.query(`ALTER TABLE karyawan DROP COLUMN join_date`); } catch (e) {}
            console.log("Family data columns updated successfully.");
        }

        console.log("2. Creating/checking table 'users'...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nama VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL,
                permissions TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if permissions column exists (in case table was created previously)
        const [userCols] = await connection.query(`SHOW COLUMNS FROM users LIKE 'permissions'`);
        if (userCols.length === 0) {
            console.log("Adding column 'permissions' to 'users'...");
            await connection.query(`ALTER TABLE users ADD COLUMN permissions TEXT NULL`);
        }

        console.log("2b. Creating/checking table 'system_logs'...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                action VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        console.log("3. Seeding/updating default user accounts with permission maps...");
        const defaultUsers = [
            {
                username: 'admin',
                password: 'admin123',
                nama: 'Dev Administrator',
                role: 'administrator',
                permissions: JSON.stringify({
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    export: true,
                    manage_users: true
                })
            },
            {
                username: 'sectionhead',
                password: 'head123',
                nama: 'Section Head HRGA',
                role: 'hrga_section_head',
                permissions: JSON.stringify({
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    export: true,
                    manage_users: false
                })
            },
            {
                username: 'leader',
                password: 'leader123',
                nama: 'Leader HRGA',
                role: 'hrga_leader',
                permissions: JSON.stringify({
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    export: true,
                    manage_users: false
                })
            }
        ];

        for (const user of defaultUsers) {
            const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [user.username]);
            if (existing.length === 0) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await connection.query(
                    'INSERT INTO users (username, password, nama, role, permissions) VALUES (?, ?, ?, ?, ?)',
                    [user.username, hashedPassword, user.nama, user.role, user.permissions]
                );
                console.log(`User created: ${user.username} (${user.role})`);
            } else {
                // Update permissions for existing seed users if null
                await connection.query(
                    'UPDATE users SET permissions = ? WHERE username = ? AND (permissions IS NULL OR permissions = "")',
                    [user.permissions, user.username]
                );
                console.log(`User ${user.username} updated with default permissions.`);
            }
        }

        console.log("\n✅ Database update completed successfully!");
    } catch (error) {
        console.error("❌ Database update failed:", error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateDatabase();
