const db = require('./db');

async function alter() {
    try {
        await db.query('ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL AFTER username;');
        console.log('users.email added');
    } catch (e) { console.log(e.message); }

    try {
        await db.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER password;');
        console.log('users.reset_token added');
    } catch (e) { console.log(e.message); }
    
    try {
        await db.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL AFTER reset_token;');
        console.log('users.reset_token_expires added');
    } catch (e) { console.log(e.message); }

    try {
        await db.query('ALTER TABLE karyawan ADD COLUMN email VARCHAR(255) NULL AFTER golongan;');
        console.log('karyawan.email added');
    } catch (e) { console.log(e.message); }

    process.exit(0);
}

alter();
