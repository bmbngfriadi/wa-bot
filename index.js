const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('./db');
const { getMedicalLimits } = require('./medicalUtils');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--mute-audio'
        ],
    }
});

const sessions = {}; // In-memory session tracking

client.on('qr', (qr) => {
    console.log('----------------------------------------------------');
    console.log('Silakan scan QR Code di bawah ini melalui WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
    console.log('----------------------------------------------------');
});

client.on('ready', () => {
    console.log('🚀 WhatsApp Bot HRGA PT Cemindo Gemilang Tbk Berhasil Siap & Terhubung!');
});

function getWibTimestamp() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${dateStr} ${timeStr} WIB`;
}

function getFooter() {
    return `_(Ketik *0* untuk menyelesaikan sesi dan kembali ke menu awal)_\n════════════════════════════════════\n⏱️ _${getWibTimestamp()}_`;
}

function formatRp(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function getMatchContext(emp, query) {
    const q = query.toLowerCase();
    let contexts = [];
    if (emp.nama_lengkap && emp.nama_lengkap.toLowerCase().includes(q)) contexts.push(`Nama Karyawan`);
    if (emp.nik && emp.nik.toLowerCase().includes(q)) contexts.push(`NIK Karyawan`);
    if (emp.nama_istri && emp.nama_istri.toLowerCase().includes(q)) contexts.push(`Istri dari Karyawan (${emp.nama_lengkap})`);
    if (emp.nama_anak_pertama && emp.nama_anak_pertama.toLowerCase().includes(q)) contexts.push(`Anak Pertama dari Karyawan (${emp.nama_lengkap})`);
    if (emp.nama_anak_kedua && emp.nama_anak_kedua.toLowerCase().includes(q)) contexts.push(`Anak Kedua dari Karyawan (${emp.nama_lengkap})`);
    if (emp.nama_anak_ketiga && emp.nama_anak_ketiga.toLowerCase().includes(q)) contexts.push(`Anak Ketiga dari Karyawan (${emp.nama_lengkap})`);
    return contexts;
}

async function safeReply(msg, text) {
    try {
        const chatId = msg.fromMe ? msg.to : msg.from;
        await client.sendMessage(chatId, text);
    } catch (e) {
        console.error('[WA-BOT] ❌ Gagal mengirim pesan:', e);
    }
}

// Function to handle employee data search (reused for CEK# and Menu 1)
async function handleEmployeeSearch(queryParam, msg) {
    const [rowsByNik] = await db.query('SELECT * FROM karyawan WHERE nik = ?', [queryParam]);
    let employee = null;
    let multipleMatches = [];

    if (rowsByNik.length > 0) {
        employee = rowsByNik[0];
    } else {
        const searchCols = ['nik', 'nama_lengkap', 'jenis_kelamin', 'department', 'status', 'nama_istri', 'nama_anak_pertama', 'nama_anak_kedua', 'nama_anak_ketiga'];
        const likeQuery = searchCols.map(col => `${col} ILIKE ?`).join(' OR ');
        const params = Array(searchCols.length).fill(`%${queryParam}%`);
        const [rowsByName] = await db.query(`SELECT * FROM karyawan WHERE ${likeQuery} ORDER BY nama_lengkap ASC`, params);
        
        if (rowsByName.length > 0) {
            if (rowsByName.length === 1) {
                employee = rowsByName[0];
            } else {
                multipleMatches = rowsByName;
            }
        }
    }

    if (multipleMatches.length > 1) {
        let matchItemsText = '';
        multipleMatches.forEach((emp, index) => {
            const statusBadge = emp.status === 'Aktif' ? '🟢' : '🔴';
            const anakList = [emp.nama_anak_pertama, emp.nama_anak_kedua, emp.nama_anak_ketiga].filter(Boolean).join(', ') || '-';
            const matchCtx = getMatchContext(emp, queryParam);
            const familyMatches = matchCtx.filter(c => c.includes('dari Karyawan'));
            let matchNote = '';
            if (familyMatches.length > 0) matchNote = `\n   📌 *Pencarian Cocok Sebagai:* ${familyMatches.join(', ')}`;
            matchItemsText += `${index + 1}. *${emp.nama_lengkap}*${matchNote}\n   ├ 🆔 NIK: \`${emp.nik}\`\n   ├ 🏢 Dept: ${emp.department}\n   ├ 👩 Istri: ${emp.nama_istri || '-'}\n   ├ 👦 Anak: ${anakList}\n   └ ${statusBadge} Status: *${emp.status}*\n\n`;
        });
        const multiResultText = `🔍 *HASIL PENCARIAN MULTIPEL (${multipleMatches.length} Data)*\n🏢 *PT CEMINDO GEMILANG TBK - PLANT BATAM*\n════════════════════════════════════\nDitemukan beberapa data karyawan yang cocok dengan kata kunci "*${queryParam}*":\n\n${matchItemsText}💡 *Saran:* Ketik spesifik NIK untuk data akurat.\n\n${getFooter()}`;
        await safeReply(msg, multiResultText);
        return;
    }

    if (employee && employee.status === 'Aktif') {
        const activeReplyText = `✅ *VERIFIKASI DATA KARYAWAN AKTIF*\n🏢 *PT CEMINDO GEMILANG TBK - PLANT BATAM*\n════════════════════════════════════\nBenar bahwa data karyawan di bawah ini berstatus *AKTIF* di PT Cemindo Gemilang Tbk (Plant Batam).\n\n📋 *DETAIL PROFILE:*\n👤 *Nama Lengkap*  : *${employee.nama_lengkap}*\n🆔 *NIK Karyawan*  : \`${employee.nik}\`\n🚻 *Jenis Kelamin* : ${employee.jenis_kelamin || 'Laki-laki'}\n🏢 *Department*    : ${employee.department}\n🟢 *Status Kerja*   : *AKTIF*\n\n👨‍👩‍👧‍👦 *DATA KELUARGA:*\n👩 *Istri*  : ${employee.nama_istri || '-'}\n👦 *Anak 1* : ${employee.nama_anak_pertama || '-'}\n👦 *Anak 2* : ${employee.nama_anak_kedua || '-'}\n👦 *Anak 3* : ${employee.nama_anak_ketiga || '-'}\n\n${getFooter()}`;
        await safeReply(msg, activeReplyText);
        return;
    } 
    
    if (employee && employee.status !== 'Aktif') {
        const nonActiveReplyText = `⚠️ *KARYAWAN SUDAH TIDAK AKTIF*\n🏢 *PT CEMINDO GEMILANG TBK - PLANT BATAM*\n════════════════════════════════════\nData ditemukan, namun status karyawan bersangkutan saat ini adalah *${employee.status.toUpperCase()}*.\n\n📋 *DETAIL DATA:*\n👤 *Nama Lengkap*  : *${employee.nama_lengkap}*\n🆔 *NIK Karyawan*  : \`${employee.nik}\`\n🏢 *Department*    : ${employee.department}\n🔴 *Status Kerja*   : *${employee.status.toUpperCase()}*\n\n${getFooter()}`;
        await safeReply(msg, nonActiveReplyText);
        return;
    }

    const notFoundReplyText = `❌ *DATA TIDAK DITEMUKAN*\n🏢 *PT CEMINDO GEMILANG TBK - PLANT BATAM*\n════════════════════════════════════\nData dengan NIK/Nama "*${queryParam}*" *TIDAK TERDAFTAR*.\nSilakan coba lagi.\n\n${getFooter()}`;
    await safeReply(msg, notFoundReplyText);
}

async function sendBudgetReport(msg, emp) {
    const limits = getMedicalLimits(emp.golongan);
    const [trx] = await db.query(`SELECT kategori, SUM(nominal) as total FROM medical_transactions WHERE karyawan_id = ? AND EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE) GROUP BY kategori`, [emp.id]);
    
    // Ambil transaksi terakhir
    const [lastTrx] = await db.query(`SELECT kategori, nominal, tanggal, deskripsi FROM medical_transactions WHERE karyawan_id = ? ORDER BY tanggal DESC, id DESC LIMIT 1`, [emp.id]);

    const usage = {
        'Rawat Inap Total': 0,
        'Rawat Jalan': 0,
        'Kacamata': 0,
        'Persalinan': 0
    };
    trx.forEach(t => { usage[t.kategori] = parseFloat(t.total); });

    const sisaInap = limits.rawat_inap_total - usage['Rawat Inap Total'];
    const sisaJalan = limits.rawat_jalan - usage['Rawat Jalan'];
    const sisaKacamata = limits.kacamata - usage['Kacamata'];
    const sisaPersalinan = limits.persalinan - usage['Persalinan'];

    let report = `🏥 *LAPORAN SISA BUDGET MEDICAL PLAFOND*\n👤 *${emp.nama_lengkap}* (${emp.nik})\n════════════════════════════════════\n\n🛏️ *Rawat Inap*\n- Limit Tahunan: ${formatRp(limits.rawat_inap_total)}\n- Sisa Budget  : *${formatRp(sisaInap)}*\n_(Maks Kamar/Malam: ${formatRp(limits.rawat_inap_kamar)})_\n\n🩺 *Rawat Jalan*\n- Limit Tahunan: ${formatRp(limits.rawat_jalan)}\n- Sisa Budget  : *${formatRp(sisaJalan)}*\n\n👓 *Bantuan Kacamata*\n- Limit Tahunan: ${formatRp(limits.kacamata)}\n- Sisa Budget  : *${formatRp(sisaKacamata)}*\n\n👶 *Biaya Persalinan*\n- Limit Tahunan: ${formatRp(limits.persalinan)}\n- Sisa Budget  : *${formatRp(sisaPersalinan)}*\n`;

    if (lastTrx.length > 0) {
        const lt = lastTrx[0];
        const dateStr = new Date(lt.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        report += `\n📝 *Riwayat Pemotongan Terakhir*\n- Tanggal: ${dateStr}\n- Kategori: ${lt.kategori}\n- Nominal: ${formatRp(parseFloat(lt.nominal))}\n- Ket: ${lt.deskripsi || '-'}\n`;
    }

    report += `\n${getFooter()}`;

    await safeReply(msg, report);
}

client.on('message_create', async msg => {
    try {
        if (!msg.body) return;
        if (msg.fromMe && (msg.body.includes('🤖 *WA BOT') || msg.body.includes('✅ *VERIFIKASI') || msg.body.includes('🔍 *HASIL'))) return;

        // Skip Group Messages unless explicitly mentioned (optional)
        const isGroup = msg.from.endsWith('@g.us');
        
        const rawText = msg.body.trim();
        const upperText = rawText.toUpperCase();
        const sender = msg.from;

        if (!sessions[sender]) {
            sessions[sender] = { state: 'IDLE' };
        }
        const session = sessions[sender];

        // Group Chat Logic: Strict mention/reply rules
        if (isGroup) {
            let isReplyingToBot = false;
            if (msg.hasQuotedMsg) {
                try {
                    const quotedMsg = await msg.getQuotedMessage();
                    if (quotedMsg && quotedMsg.fromMe) {
                        isReplyingToBot = true;
                    }
                } catch (err) {
                    console.error('getQuotedMessage error:', err.message);
                    const quotedPart = msg._data && msg._data.quotedParticipant;
                    if (quotedPart) {
                        try {
                            const contact = await client.getContactById(quotedPart);
                            if (contact && contact.isMe) {
                                isReplyingToBot = true;
                            }
                        } catch (e) {
                            console.error('Fallback quoted resolve error:', e.message);
                        }
                    }
                }
            }

            // Check if bot is mentioned
            let mentionsBot = false;
            if (msg.mentionedIds && msg.mentionedIds.length > 0) {
                try {
                    const mentions = await msg.getMentions();
                    console.log('Mentions resolved:', mentions.map(c => ({ id: c.id._serialized, isMe: c.isMe })));
                    for (const contact of mentions) {
                        if (contact.isMe) {
                            mentionsBot = true;
                            break;
                        }
                    }
                } catch (e) {
                    console.error('Mention resolve error:', e);
                }
            }
            
            const isHaloCmd = upperText.includes('HALO');
            
            console.log('Group Check ->', { mentionsBot, isHaloCmd, isReplyingToBot, state: session.state });

            if (session.state === 'IDLE') {
                // Must mention the bot and include the word 'HALO' to start, OR be replying to the bot
                if ((!mentionsBot || !isHaloCmd) && !isReplyingToBot) {
                    return; // Ignore other messages silently
                }
            } else {
                // To continue the session, user MUST reply to the bot
                if (!isReplyingToBot) {
                    return; // Ignore if not replying directly to the bot
                }
            }
        }

        // Evaluate selected menu
        let selectedMenu = '';
        if (upperText === '1') {
            selectedMenu = 'menu_data_karyawan';
        } else if (upperText === '2') {
            selectedMenu = 'menu_plafon_medis';
        }

        // Global Cancellation
        if (upperText === 'BATAL' || upperText === 'CANCEL' || upperText === '0') {
            session.state = 'IDLE';
            await safeReply(msg, "Sesi dibatalkan. Ketik *HALO* untuk memunculkan menu kembali.");
            return;
        }

        // Legacy format fallback
        if (upperText.startsWith('CEK#')) {
            const queryParam = rawText.substring(4).split('\n')[0].trim();
            if (!queryParam) return safeReply(msg, "Mohon masukkan parameter pencarian.");
            session.state = 'IDLE';
            await handleEmployeeSearch(queryParam, msg);
            return;
        }

        // Help / Intro Command
        let isHelpCommand = ['HELP', 'MENU', 'INFO', 'BOT', 'HALO', 'HI', 'P'].some(cmd => upperText === cmd);
        if (isGroup && session.state === 'IDLE' && upperText.includes('HALO')) {
            isHelpCommand = true;
        }
        if (isHelpCommand) {
            session.state = 'IDLE';
            const welcomeText = `🤖 *WA BOT HRGA PORTAL AUTOMATION*\n🏢 *PT CEMINDO GEMILANG TBK - PLANT BATAM*\n════════════════════════════════════\n\nSelamat datang! Silakan pilih menu layanan di bawah ini dengan membalas angka (contoh: 1 atau 2):\n\n*1.* 🔍 Cek Data Karyawan\n*2.* 🏥 Cek Sisa Budget Medical Plafond\n\n_(Ketik *BATAL* kapan saja untuk mengakhiri sesi)_\n════════════════════════════════════\n⏱️ _${getWibTimestamp()}_`;
            await safeReply(msg, welcomeText);
            return;
        }

        // Menu Selection
        if (session.state === 'IDLE') {
            if (selectedMenu === 'menu_data_karyawan') {
                session.state = 'WAIT_CEK_DATA';
                await safeReply(msg, "🔍 *CEK DATA KARYAWAN*\nSilakan ketikkan *Nama* atau *NIK* karyawan yang ingin dicari (Contoh: Budi atau 2024001):");
                return;
            } else if (selectedMenu === 'menu_plafon_medis') {
                session.state = 'WAIT_NIK_BUDGET';
                await safeReply(msg, "🏥 *CEK MEDICAL PLAFOND*\nSilakan ketikkan *NIK Anda* untuk memulai:");
                return;
            } else if (!isGroup) {
                // Ignore unknown commands in idle state to avoid spam
            }
            return;
        }

        // State Machine Handling
        if (session.state === 'WAIT_CEK_DATA') {
            session.state = 'IDLE';
            await handleEmployeeSearch(rawText, msg);
            return;
        }

        if (session.state === 'WAIT_NIK_BUDGET') {
            const [rows] = await db.query('SELECT * FROM karyawan WHERE nik = ?', [rawText]);
            if (rows.length === 0) {
                await safeReply(msg, "❌ NIK tidak ditemukan di sistem. Silakan coba ketik NIK dengan benar atau ketik *BATAL*.");
                return;
            }
            session.employee = rows[0];
            session.state = 'WAIT_PASS_BUDGET';
            await safeReply(msg, `Halo *${rows[0].nama_lengkap}*.\nSilakan masukkan *Password* Bot Anda:`);
            return;
        }

        if (session.state === 'WAIT_PASS_BUDGET') {
            const emp = session.employee;
            if (rawText !== emp.bot_password) {
                await safeReply(msg, "❌ *Password Salah!*\nSilakan coba lagi atau hubungi HRGA jika Anda lupa password.\n(Ketik *BATAL* untuk keluar)");
                return;
            }

            // If password is default (NIK), force change password
            if (rawText === emp.nik) {
                session.state = 'WAIT_NEW_PASS_BUDGET';
                await safeReply(msg, "⚠️ *PERHATIAN*\nSaat ini Anda masih menggunakan password default (NIK). Demi keamanan, silakan ketikkan *Password Baru* Anda sekarang:\n_(Note: Ingat baik-baik password baru Anda)_");
                return;
            }

            // Success - Fetch Limits and Transactions
            session.state = 'IDLE'; // Reset state
            await sendBudgetReport(msg, emp);
            delete session.employee;
            return;
        }

        if (session.state === 'WAIT_NEW_PASS_BUDGET') {
            const emp = session.employee;
            const newPassword = rawText;
            
            // Update database
            await db.query('UPDATE karyawan SET bot_password = ? WHERE id = ?', [newPassword, emp.id]);
            
            // Notify user and send budget
            await safeReply(msg, "✅ *Password berhasil diubah!*\nMohon gunakan password baru ini untuk pengecekan selanjutnya.\n\nBerikut adalah data plafon Anda:");
            session.state = 'IDLE';
            await sendBudgetReport(msg, emp);
            delete session.employee;
            return;
        }

    } catch (error) {
        console.error('[WA-BOT] ❌ Error saat memproses pesan WhatsApp:', error);
    }
});

client.initialize();
