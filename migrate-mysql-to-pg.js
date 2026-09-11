require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');

async function migrate() {
    console.log("=== Starting Database Migration from MySQL to PostgreSQL ===");

    // MySQL connection
    const mysqlConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cemindo_hr'
    });
    console.log("Connected to MySQL 'cemindo_hr'");

    // PostgreSQL connection
    const pgClient = new Client({
        host: 'localhost',
        user: 'postgres',
        password: 'Gamaadmin53',
        port: 5432,
        database: 'cemindo_hr'
    });
    await pgClient.connect();
    console.log("Connected to PostgreSQL 'cemindo_hr'");

    try {
        console.log("\n1. Dropping existing tables and recreating them in PostgreSQL...");
        await pgClient.query('DROP TABLE IF EXISTS medical_transactions, system_logs, karyawan, users CASCADE');

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) NULL,
                password VARCHAR(255) NOT NULL,
                reset_token VARCHAR(255) NULL,
                reset_token_expires TIMESTAMP NULL,
                nama VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL,
                permissions TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS karyawan (
                id SERIAL PRIMARY KEY,
                nik VARCHAR(50) UNIQUE NOT NULL,
                nama_lengkap VARCHAR(100) NOT NULL,
                department VARCHAR(100) NOT NULL,
                status VARCHAR(50) DEFAULT 'Aktif',
                is_deleted BOOLEAN DEFAULT false,
                nama_istri VARCHAR(100) NULL,
                nama_anak_pertama VARCHAR(100) NULL,
                nama_anak_kedua VARCHAR(100) NULL,
                nama_anak_ketiga VARCHAR(100) NULL,
                golongan VARCHAR(10) DEFAULT '4A',
                email VARCHAR(255) NULL,
                bot_password VARCHAR(50) NULL
            );
        `);

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id SERIAL PRIMARY KEY,
                user_id INT NULL,
                action VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pgClient.query(`
            CREATE TABLE IF NOT EXISTS medical_transactions (
                id SERIAL PRIMARY KEY,
                karyawan_id INT NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
                kategori VARCHAR(50) NOT NULL,
                nominal DECIMAL(15,2) NOT NULL,
                deskripsi TEXT NULL,
                tanggal DATE NOT NULL,
                foto_bukti TEXT NULL,
                created_by INT NULL REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tables created successfully.");

        // Function to chunk and insert
        const insertData = async (tableName, columns, pgColumns, mapRow) => {
            console.log(`\nFetching data from MySQL table: ${tableName}...`);
            const [rows] = await mysqlConn.query(`SELECT * FROM ${tableName}`);
            console.log(`Found ${rows.length} rows.`);

            if (rows.length === 0) return;

            const valuesPlaceholder = pgColumns.map((_, idx) => `$${idx + 1}`).join(', ');
            const query = `INSERT INTO ${tableName} (${pgColumns.join(', ')}) VALUES (${valuesPlaceholder})`;

            let successCount = 0;
            for (const row of rows) {
                const values = mapRow(row);
                try {
                    await pgClient.query(query, values);
                    successCount++;
                } catch (e) {
                    console.error(`Failed to insert row ID ${row.id} into ${tableName}:`, e.message);
                }
            }
            console.log(`Successfully inserted ${successCount} rows into PostgreSQL ${tableName}.`);
            
            // Reset sequence
            await pgClient.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM ${tableName}`);
            console.log(`Sequence for ${tableName} reset.`);
        };

        // 2. Migrate Users
        await insertData(
            'users', 
            ['id', 'username', 'email', 'password', 'reset_token', 'reset_token_expires', 'nama', 'role', 'permissions', 'created_at'],
            ['id', 'username', 'email', 'password', 'reset_token', 'reset_token_expires', 'nama', 'role', 'permissions', 'created_at'],
            (r) => {
                let expires = r.reset_token_expires;
                if (expires && !isNaN(Number(expires))) {
                    expires = new Date(Number(expires));
                }
                return [r.id, r.username, r.email, r.password, r.reset_token, expires, r.nama, r.role, r.permissions, r.created_at];
            }
        );

        // 3. Migrate Karyawan
        await insertData(
            'karyawan',
            ['id', 'nik', 'nama_lengkap', 'department', 'status', 'is_deleted', 'nama_istri', 'nama_anak_pertama', 'nama_anak_kedua', 'nama_anak_ketiga', 'golongan', 'email', 'bot_password'],
            ['id', 'nik', 'nama_lengkap', 'department', 'status', 'is_deleted', 'nama_istri', 'nama_anak_pertama', 'nama_anak_kedua', 'nama_anak_ketiga', 'golongan', 'email', 'bot_password'],
            (r) => [r.id, r.nik, r.nama_lengkap, r.department, r.status, r.is_deleted === 1, r.nama_istri, r.nama_anak_pertama, r.nama_anak_kedua, r.nama_anak_ketiga, r.golongan, r.email, r.bot_password]
        );

        // 4. Migrate System Logs
        await insertData(
            'system_logs',
            ['id', 'user_id', 'action', 'description', 'created_at'],
            ['id', 'user_id', 'action', 'description', 'created_at'],
            (r) => [r.id, r.user_id, r.action, r.description, r.created_at]
        );

        // 5. Migrate Medical Transactions
        await insertData(
            'medical_transactions',
            ['id', 'karyawan_id', 'kategori', 'nominal', 'deskripsi', 'tanggal', 'foto_bukti', 'created_by', 'created_at'],
            ['id', 'karyawan_id', 'kategori', 'nominal', 'deskripsi', 'tanggal', 'foto_bukti', 'created_by', 'created_at'],
            (r) => [r.id, r.karyawan_id, r.kategori, r.nominal, r.deskripsi, r.tanggal, r.foto_bukti, r.created_by, r.created_at]
        );

        console.log("\n=== Migration completed successfully! ===");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await mysqlConn.end();
        await pgClient.end();
    }
}

migrate();
