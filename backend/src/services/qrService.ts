import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { pool } from '../config/database';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const QR_STORAGE_PATH = process.env.QR_STORAGE_PATH || './uploads/qr-codes';

// Ensure directory exists
if (!existsSync(QR_STORAGE_PATH)) {
  mkdirSync(QR_STORAGE_PATH, { recursive: true });
}

export async function generateQRForVehicle(vehicleId: number): Promise<string> {
  // Check if QR already exists
  const existingResult = await pool.query(
    'SELECT id, qr_code_value FROM qr_tags WHERE vehicle_id = $1',
    [vehicleId]
  );

  if (existingResult.rows.length > 0) {
    return existingResult.rows[0].qr_code_value;
  }

  // Generate unique QR value
  const qrValue = `VEH-${vehicleId}-${uuidv4().substring(0, 8).toUpperCase()}`;

  // Generate QR code image
  const qrImagePath = join(QR_STORAGE_PATH, `${qrValue}.png`);
  await QRCode.toFile(qrImagePath, qrValue, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
  });

  // Save to database
  const result = await pool.query(
    `INSERT INTO qr_tags (vehicle_id, qr_code_value, qr_image_url)
     VALUES ($1, $2, $3)
     RETURNING id, qr_code_value`,
    [vehicleId, qrValue, `/api/qr-images/${qrValue}.png`]
  );

  const qrTagId = result.rows[0].id;

  // Update vehicle with qr_code_id
  await pool.query('UPDATE vehicles SET qr_code_id = $1 WHERE id = $2', [qrTagId, vehicleId]);

  return qrValue;
}

export async function getVehicleByQR(qrValue: string) {
  const result = await pool.query(
    `SELECT v.*, q.id as qr_tag_id, q.qr_image_url
     FROM vehicles v
     JOIN qr_tags q ON v.qr_code_id = q.id
     WHERE q.qr_code_value = $1`,
    [qrValue]
  );

  return result.rows[0] || null;
}

export async function logQRScan(
  qrTagId: number,
  scannedBy: number | null,
  scanType: 'check-in' | 'check-out',
  bookingId?: number,
  location?: { lat: number; lng: number },
  note?: string
) {
  const result = await pool.query(
    `INSERT INTO qr_logs (qr_tag_id, scanned_by, scan_type, booking_id, scan_location, note)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [qrTagId, scannedBy, scanType, bookingId || null, location ? JSON.stringify(location) : null, note]
  );

  return result.rows[0];
}


