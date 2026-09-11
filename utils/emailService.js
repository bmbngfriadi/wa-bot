const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendResetPasswordEmail = async (email, resetUrl) => {
    try {
        const mailOptions = {
            from: `"${process.env.SMTP_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Password Web HRGA Portal',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; }
                        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                        .header { background-color: #b51d22; padding: 30px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
                        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
                        .content h2 { color: #1a1a1a; font-size: 20px; margin-top: 0; }
                        .btn-container { text-align: center; margin: 40px 0; }
                        .btn { background-color: #b51d22; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(181, 29, 34, 0.2); }
                        .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
                        .footer p { margin: 5px 0; color: #64748b; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HRGA Portal System</h1>
                        </div>
                        <div class="content">
                            <h2>Permintaan Reset Password</h2>
                            <p>Halo,</p>
                            <p>Kami menerima permintaan untuk melakukan reset password pada akun Web HRGA Portal Anda. Jika Anda merasa mengajukan permintaan ini, silakan klik tombol di bawah ini untuk membuat password baru yang aman.</p>
                            
                            <div class="btn-container">
                                <a href="${resetUrl}" class="btn">Reset Password Sekarang</a>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                                <strong>Catatan:</strong> Tautan ini dienkripsi dengan aman dan hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak pernah merasa meminta reset password, Anda dapat mengabaikan email ini.
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} PT Cemindo Gemilang Tbk - Plant Batam.</p>
                            <p>Email ini dikirimkan otomatis oleh sistem, mohon untuk tidak membalas.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending reset password email:', error);
        return { success: false, error };
    }
};

const sendDeductionNotification = async (email, nama, nik, kategori, nominal, sisaPlafon) => {
    try {
        const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

        const mailOptions = {
            from: `"${process.env.SMTP_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Notifikasi Pemotongan Plafon Medis',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                    <h2 style="color: #e53e3e;">Notifikasi Pemotongan Plafon Medis</h2>
                    <p>Halo <strong>${nama}</strong> (${nik}),</p>
                    <p>Telah terjadi pemotongan/klaim pada plafon medis Anda. Berikut rinciannya:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: bold;">Kategori Klaim</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${kategori}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: bold;">Nominal Potongan</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #e53e3e; font-weight: bold;">${formatRp(nominal)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: bold;">Sisa Plafon</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #38a169; font-weight: bold;">${formatRp(sisaPlafon)}</td>
                        </tr>
                    </table>
                    <p style="color: #718096; font-size: 0.9em;">Informasi ini dihasilkan secara otomatis. Jika ada ketidaksesuaian, silakan hubungi bagian HRGA.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="color: #a0aec0; font-size: 0.8em; text-align: center;">PT Cemindo Gemilang Tbk - Plant Batam</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending deduction notification email:', error);
        return { success: false, error };
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendDeductionNotification
};
