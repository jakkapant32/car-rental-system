import nodemailer from 'nodemailer';
import { pool } from '../config/database';
import { env } from '../config/env';

// Create email transporter (optional - will work without it)
let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
}

export function isEmailConfigured(): boolean {
  return transporter !== null;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(bookingId: number): Promise<void> {
  if (!transporter) {
    console.log(`📧 Email not configured - skipping confirmation email for booking ${bookingId}`);
    return;
  }

  // Get booking details
  const bookingResult = await pool.query(
    `SELECT b.*, v.brand, v.model, v.plate_number, v.daily_price,
            u.name as user_name, u.email as user_email
     FROM bookings b
     JOIN vehicles v ON b.vehicle_id = v.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error('Booking not found');
  }

  const booking = bookingResult.rows[0];
  const fromEmail = env.SMTP_FROM || env.SMTP_USER || 'noreply@carrental.com';

  const mailOptions = {
    from: `Car Rental System <${fromEmail}>`,
    to: booking.user_email,
    subject: `การจองรถของคุณได้รับการยืนยัน - Booking #${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
          .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ การจองได้รับการยืนยัน</h1>
          </div>
          <div class="content">
            <p>สวัสดีคุณ ${booking.user_name},</p>
            <p>การจองรถของคุณได้รับการยืนยันแล้ว! รายละเอียดการจอง:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">เลขที่การจอง:</span>
                <span class="detail-value">#${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">รถยนต์:</span>
                <span class="detail-value">${booking.brand} ${booking.model} (${booking.plate_number})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">วันที่เช่า:</span>
                <span class="detail-value">${new Date(booking.start_date).toLocaleDateString('th-TH')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">วันที่คืน:</span>
                <span class="detail-value">${new Date(booking.end_date).toLocaleDateString('th-TH')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">สถานที่รับรถ:</span>
                <span class="detail-value">${booking.pickup_location || 'ไม่ระบุ'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">สถานที่คืนรถ:</span>
                <span class="detail-value">${booking.return_location || 'ไม่ระบุ'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ราคารวม:</span>
                <span class="detail-value"><strong>฿${parseFloat(booking.total_price).toLocaleString('th-TH')}</strong></span>
              </div>
            </div>

            <p>กรุณามาเช็คอินตามวันที่กำหนด หากมีคำถาม กรุณาติดต่อเรา</p>
            <p>ขอบคุณที่ใช้บริการ</p>
          </div>
          <div class="footer">
            <p>ระบบเช่ารถออนไลน์</p>
            <p>อีเมลนี้ถูกส่งอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
การจองรถของคุณได้รับการยืนยัน!

เลขที่การจอง: #${booking.id}
รถยนต์: ${booking.brand} ${booking.model} (${booking.plate_number})
วันที่เช่า: ${new Date(booking.start_date).toLocaleDateString('th-TH')}
วันที่คืน: ${new Date(booking.end_date).toLocaleDateString('th-TH')}
ราคารวม: ฿${parseFloat(booking.total_price).toLocaleString('th-TH')}

กรุณามาเช็คอินตามวันที่กำหนด
ขอบคุณที่ใช้บริการ
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Confirmation email sent to ${booking.user_email} for booking #${bookingId}`);
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellationEmail(bookingId: number): Promise<void> {
  if (!transporter) {
    console.log(`📧 Email not configured - skipping cancellation email for booking ${bookingId}`);
    return;
  }

  const bookingResult = await pool.query(
    `SELECT b.*, v.brand, v.model, v.plate_number,
            u.name as user_name, u.email as user_email
     FROM bookings b
     JOIN vehicles v ON b.vehicle_id = v.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error('Booking not found');
  }

  const booking = bookingResult.rows[0];
  const fromEmail = env.SMTP_FROM || env.SMTP_USER || 'noreply@carrental.com';

  await transporter.sendMail({
    from: `Car Rental System <${fromEmail}>`,
    to: booking.user_email,
    subject: `การจองรถถูกยกเลิก - Booking #${bookingId}`,
    html: `
      <h2>การจองรถถูกยกเลิก</h2>
      <p>สวัสดีคุณ ${booking.user_name},</p>
      <p>การจองรถของคุณ (เลขที่ #${booking.id}) ถูกยกเลิกแล้ว</p>
      <p>รถยนต์: ${booking.brand} ${booking.model} (${booking.plate_number})</p>
      <p>หากคุณต้องการจองใหม่ กรุณาเยี่ยมชมเว็บไซต์ของเรา</p>
    `,
  });

  console.log(`✅ Cancellation email sent to ${booking.user_email} for booking #${bookingId}`);
}


