import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, requireRole } from '../middlewares/auth';
import { AuthRequest } from '../types';
import { differenceInDays } from 'date-fns';
import { sendBookingCancellationEmail } from '../services/emailService';

const router = Router();

const bookingSchema = z.object({
  vehicle_id: z.number().int(),
  start_date: z.string(),
  end_date: z.string(),
  pickup_location: z.string().optional(),
  return_location: z.string().optional(),
});

// Create booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const data = bookingSchema.parse(req.body);
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (endDate < startDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check vehicle availability
    const vehicleResult = await pool.query(
      'SELECT daily_price, status FROM vehicles WHERE id = $1',
      [data.vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicleResult.rows[0].status !== 'available') {
      return res.status(400).json({ error: 'Vehicle is not available' });
    }

    // Check for overlapping bookings
    const overlapResult = await pool.query(
      `SELECT id FROM bookings 
       WHERE vehicle_id = $1 
       AND status IN ('pending', 'confirmed')
       AND (start_date <= $2 AND end_date >= $3)`,
      [data.vehicle_id, endDate, startDate]
    );

    if (overlapResult.rows.length > 0) {
      return res.status(400).json({ error: 'Vehicle is already booked for these dates' });
    }

    const days = differenceInDays(endDate, startDate) + 1;
    const totalPrice = vehicleResult.rows[0].daily_price * days;

    const bookingResult = await pool.query(
      `INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, pickup_location, return_location, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [authReq.user!.id, data.vehicle_id, startDate, endDate, data.pickup_location, data.return_location, totalPrice]
    );

    // Update vehicle status to reserved
    await pool.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['reserved', data.vehicle_id]);

    res.status(201).json({ booking: bookingResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const result = await pool.query(
      `SELECT b.*, v.brand, v.model, v.plate_number, v.images
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [authReq.user!.id]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, v.*, u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    const authReq = req as AuthRequest;
    if (result.rows[0].user_id !== authReq.user?.id && authReq.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Confirm booking (admin only)
router.put('/:id/confirm', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['confirmed', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.put('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns the booking or is admin
    const authReq = req as AuthRequest;
    if (booking.user_id !== authReq.user?.id && authReq.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', req.params.id]
    );

    // Update vehicle status back to available
    await pool.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['available', booking.vehicle_id]);

    // Send cancellation email
    try {
      await sendBookingCancellationEmail(booking.id);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get all bookings (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, v.brand, v.model, v.plate_number, u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;

