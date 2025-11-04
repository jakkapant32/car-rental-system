import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, requireRole } from '../middlewares/auth';
import { generateQRForVehicle } from '../services/qrService';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Generate QR for vehicle
router.post('/vehicles/:id/generate-qr', async (req, res, next) => {
  try {
    const vehicleId = parseInt(req.params.id);

    const vehicleResult = await pool.query('SELECT id FROM vehicles WHERE id = $1', [vehicleId]);

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const qrValue = await generateQRForVehicle(vehicleId);

    const qrResult = await pool.query(
      `SELECT q.* FROM qr_tags q
       JOIN vehicles v ON v.qr_code_id = q.id
       WHERE v.id = $1`,
      [vehicleId]
    );

    res.json({
      message: 'QR code generated successfully',
      qr: qrResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// Get occupancy report
router.get('/reports/occupancy', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        v.id,
        v.plate_number,
        v.brand,
        v.model,
        COUNT(b.id) as booking_count,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN b.status IN ('pending', 'confirmed') THEN 1 ELSE 0 END) as active_bookings
      FROM vehicles v
      LEFT JOIN bookings b ON v.id = b.vehicle_id
    `;

    const params: any[] = [];
    if (startDate && endDate) {
      query += ` WHERE (b.start_date <= $1 AND b.end_date >= $2) OR b.id IS NULL`;
      params.push(endDate, startDate);
    }

    query += ` GROUP BY v.id, v.plate_number, v.brand, v.model ORDER BY booking_count DESC`;

    const result = await pool.query(query, params);
    res.json({ report: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get revenue report
router.get('/reports/revenue', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as booking_count,
        SUM(total_price) as total_revenue,
        AVG(total_price) as avg_booking_value
      FROM bookings
      WHERE status = 'completed'
    `;

    const params: any[] = [];
    if (startDate) {
      query += ` AND created_at >= $1`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ` GROUP BY DATE(created_at) ORDER BY date DESC`;

    const result = await pool.query(query, params);
    res.json({ report: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get QR scan logs
router.get('/qr-logs', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT 
        ql.*,
        q.qr_code_value,
        v.plate_number,
        v.brand,
        v.model,
        u.name as scanned_by_name
       FROM qr_logs ql
       JOIN qr_tags q ON ql.qr_tag_id = q.id
       JOIN vehicles v ON q.vehicle_id = v.id
       LEFT JOIN users u ON ql.scanned_by = u.id
       ORDER BY ql.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ logs: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;


