require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateMedicalDatabase() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cemindo_hr'
        });

        // 1. Add 'golongan' column
        console.log("Checking table 'karyawan' for 'golongan' column...");
        const [golonganCols] = await connection.query(`SHOW COLUMNS FROM karyawan LIKE 'golongan'`);
        if (golonganCols.length === 0) {
            console.log("Adding column 'golongan' to 'karyawan'...");
            await connection.query(`ALTER TABLE karyawan ADD COLUMN golongan VARCHAR(10) DEFAULT '4A'`);
            console.log("Column 'golongan' added successfully.");
        }

        // 2. Add 'bot_password' column
        console.log("Checking table 'karyawan' for 'bot_password' column...");
        const [passCols] = await connection.query(`SHOW COLUMNS FROM karyawan LIKE 'bot_password'`);
        if (passCols.length === 0) {
            console.log("Adding column 'bot_password' to 'karyawan'...");
            await connection.query(`ALTER TABLE karyawan ADD COLUMN bot_password VARCHAR(50) NULL`);
            // Set default bot_password to NIK
            console.log("Setting default bot_password to match NIK for existing records...");
            await connection.query(`UPDATE karyawan SET bot_password = nik WHERE bot_password IS NULL`);
            console.log("Column 'bot_password' added and seeded successfully.");
        }

        // 3. Create 'medical_transactions' table
        console.log("Creating/checking table 'medical_transactions'...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS medical_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                karyawan_id INT NOT NULL,
                kategori VARCHAR(50) NOT NULL,
                nominal DECIMAL(15,2) NOT NULL,
                deskripsi TEXT NULL,
                tanggal DATE NOT NULL,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log("Table 'medical_transactions' ready.");

        console.log("\n✅ Database update completed successfully!");
    } catch (error) {
        console.error("❌ Database update failed:", error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateMedicalDatabase();
