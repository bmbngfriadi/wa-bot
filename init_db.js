require('dotenv').config();
const mysql = require('mysql2/promise');

const dummyNames = ["Bambang", "Siti", "Andi", "Budi", "Joko", "Rina", "Ani", "Eko", "Yuni", "Rudi"];
const dummyLastNames = ["Setiawan", "Wijaya", "Kurniawan", "Sari", "Lestari", "Hidayat", "Saputra", "Wahyuni", "Pratama", "Siregar"];
const dummyDepartments = ["Produksi", "Maintenance", "Logistik", "HRD", "Quality Control", "Gudang", "Safety", "Engineering"];

function generateRandomEmployee(index) {
    const nik = `NIK${2024000 + index}`;
    const firstName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const lastName = dummyLastNames[Math.floor(Math.random() * dummyLastNames.length)];
    const name = `${firstName} ${lastName}`;
    const address = `Jl. Mawar No. ${index}, Batam`;
    const department = dummyDepartments[Math.floor(Math.random() * dummyDepartments.length)];
    
    return [nik, name, address, department];
}

async function initializeDatabase() {
    try {
        // Connect without database selected first to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'cemindo_hr';

        console.log(`Creating database ${dbName} if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        console.log("Creating table karyawan...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS karyawan (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nik VARCHAR(50) UNIQUE NOT NULL,
                nama_lengkap VARCHAR(100) NOT NULL,
                alamat TEXT NOT NULL,
                department VARCHAR(100) NOT NULL,
                status VARCHAR(50) DEFAULT 'Aktif'
            )
        `);

        // Check if data already exists
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM karyawan`);
        if (rows[0].count > 0) {
            console.log(`Data already exists (${rows[0].count} rows). Skipping dummy generation.`);
            process.exit(0);
        }

        console.log("Generating 100 dummy employees...");
        const values = [];
        for (let i = 1; i <= 100; i++) {
            values.push(generateRandomEmployee(i));
        }

        const query = 'INSERT INTO karyawan (nik, nama_lengkap, alamat, department) VALUES ?';
        await connection.query(query, [values]);

        console.log("Successfully inserted 100 dummy employees!");
        await connection.end();
        console.log("Database initialization completed.");
        process.exit(0);

    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1);
    }
}

initializeDatabase();
