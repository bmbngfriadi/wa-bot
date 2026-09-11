const db = require('./db');

async function alterTable() {
    try {
        await db.query('ALTER TABLE medical_transactions ADD COLUMN foto_bukti LONGTEXT NULL;');
        console.log('Successfully added foto_bukti column to medical_transactions');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column foto_bukti already exists.');
        } else {
            console.error('Error:', e.message);
        }
    } finally {
        process.exit();
    }
}

alterTable();
