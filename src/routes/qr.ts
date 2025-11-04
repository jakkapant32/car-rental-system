import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, requireRole } from '../middlewares/auth';
import { AuthRequest } from '../types';
import { getVehicleByQR, logQRScan } from '../services/qrService';
import { qrRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

const scanSchema = z.object({
  booking_id: z.number().int().optional(),
  scan_type: z.enum(['check-in', 'check-out']),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  note: z.string().optional(),
});

// Get vehicle by QR code (public, rate-limited)
router.get('/:qrValue', qrRateLimiter, async (req, res, next) => {
  try {
    const vehicle = await getVehicleByQR(req.params.qrValue);

    if (!vehicle) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Return basic vehicle info (no sensitive data)
    res.json({
      vehicle: {
        id: vehicle.id,
        plate_number: vehicle.plate_number,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        status: vehicle.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Scan QR code (staff only)
router.post('/:qrValue/scan', authenticate, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const data = scanSchema.parse(req.body);
    const vehicle = await getVehicleByQR(req.params.qrValue);

    if (!vehicle) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Log the scan
    const log = await logQRScan(
      vehicle.qr_tag_id,
      authReq.user!.id,
      data.scan_type,
      data.booking_id,
      data.location,
      data.note
    );

    // Update vehicle status based on scan type
    if (data.scan_type === 'check-in') {
      await pool.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['rented', vehicle.id]);

      // Update booking status if provided
      if (data.booking_id) {
        await pool.query(
          'UPDATE bookings SET status = $1 WHERE id = $2',
          ['completed', data.booking_id]
        );
      }
    } else if (data.scan_type === 'check-out') {
      await pool.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['available', vehicle.id]);
    }

    res.json({
      message: `QR scan logged: ${data.scan_type}`,
      log,
      vehicle: {
        id: vehicle.id,
        plate_number: vehicle.plate_number,
        status: data.scan_type === 'check-in' ? 'rented' : 'available',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

