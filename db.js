require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.PG_USER || process.env.DB_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'Gamaadmin53',
    database: process.env.PG_DATABASE || process.env.DB_NAME || 'cemindo_hr',
    port: process.env.PG_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

function formatPgQuery(sql, params) {
    if (!params || params.length === 0) return { text: sql, values: [] };
    
    let text = "";
    let values = [];
    let paramIndex = 1;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        
        if (char === "'" || char === '"') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
            text += char;
            continue;
        }

        if (char === '?' && !inString) {
            const p = params.shift();
            // Handle array for IN (?) or INSERT VALUES ?
            if (Array.isArray(p)) {
                if (Array.isArray(p[0])) {
                     // Bulk insert: [[a,b], [c,d]]
                     let bulkText = [];
                     for (let row of p) {
                         let rowText = [];
                         for (let val of row) {
                             rowText.push('$' + paramIndex++);
                             values.push(val);
                         }
                         bulkText.push('(' + rowText.join(', ') + ')');
                     }
                     text += bulkText.join(', ');
                } else {
                     // Array for IN clause: [1, 2, 3]
                     let arrText = [];
                     for (let val of p) {
                         arrText.push('$' + paramIndex++);
                         values.push(val);
                     }
                     text += arrText.join(', ');
                }
            } else {
                text += '$' + paramIndex++;
                values.push(p);
            }
        } else {
            text += char;
        }
    }
    
    if (text.toUpperCase().includes('INSERT IGNORE')) {
        text = text.replace(/INSERT IGNORE/i, 'INSERT');
        text += ' ON CONFLICT DO NOTHING';
    }

    if (/^\s*INSERT\s+INTO/i.test(text) && !text.toUpperCase().includes('RETURNING')) {
        text += ' RETURNING id';
    }
    
    return { text, values };
}

const db = {
    async query(sql, params) {
        const p = Array.isArray(params) ? [...params] : (params ? [params] : []);
        const { text, values } = formatPgQuery(sql, p);
        
        // Convert MySQL backticks to standard Postgres double quotes
        let cleanText = text.replace(/`/g, '"'); 
        
        try {
            const res = await pool.query(cleanText, values);
            
            if (['INSERT', 'UPDATE', 'DELETE'].includes(res.command)) {
                const resultObj = {
                    affectedRows: res.rowCount,
                    insertId: (res.rows && res.rows[0] && res.rows[0].id) ? res.rows[0].id : 0
                };
                return [resultObj, res.fields];
            }
            
            if (res.rows && res.rows.length > 0) {
                 res.rows.forEach(row => {
                     for (let key in row) {
                         // Postgres COUNT returns bigint string, convert to number for JS logic
                         if (row[key] !== null && typeof row[key] === 'string' && (key === 'total' || key === 'count' || key === 'COUNT(*)')) {
                             row[key] = parseInt(row[key], 10);
                         }
                     }
                 });
            }

            return [res.rows, res.fields];
        } catch (error) {
            console.error("PG Query Error | SQL:", cleanText, "| Values:", values, "| Error:", error.message);
            throw error;
        }
    }
};

module.exports = db;
