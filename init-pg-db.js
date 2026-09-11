const { Client } = require('pg');

async function init() {
    const client = new Client({
        host: 'localhost',
        user: 'postgres',
        password: 'Gamaadmin53',
        port: 5432,
        database: 'postgres'
    });
    try {
        await client.connect();
        console.log("Connected to PostgreSQL as 'postgres'");
        
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'cemindo_hr'");
        if (res.rowCount === 0) {
            console.log("Creating database 'cemindo_hr'...");
            await client.query('CREATE DATABASE cemindo_hr');
            console.log("Database created.");
        } else {
            console.log("Database 'cemindo_hr' already exists.");
        }
    } catch (err) {
        console.error("Error initializing PostgreSQL DB:", err);
    } finally {
        await client.end();
    }
}
init();
