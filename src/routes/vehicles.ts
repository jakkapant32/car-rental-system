import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

const vehicleSchema = z.object({
  plate_number: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  category: z.string().optional(),
  seats: z.number().int().optional(),
  transmission: z.enum(['manual', 'automatic']).optional(),
  fuel_type: z.string().optional(),
  mileage: z.number().int().default(0),
  daily_price: z.number().positive(),
  status: z.enum(['available', 'reserved', 'rented', 'maintenance']).default('available'),
  images: z.array(z.string()).default([]),
});

// Get all vehicles (with filters)
router.get('/', async (req, res, next) => {
  try {
    const { status, category, minPrice, maxPrice, search } = req.query;
    let query = 'SELECT v.*, q.qr_code_value FROM vehicles v LEFT JOIN qr_tags q ON v.qr_code_id = q.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND v.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      query += ` AND v.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND v.daily_price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND v.daily_price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (search) {
      query += ` AND (v.brand ILIKE $${paramIndex} OR v.model ILIKE $${paramIndex} OR v.plate_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY v.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ vehicles: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT v.*, q.qr_code_value, q.qr_image_url 
       FROM vehicles v 
       LEFT JOIN qr_tags q ON v.qr_code_id = q.id 
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ vehicle: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Create vehicle (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const data = vehicleSchema.parse(req.body);

    const result = await pool.query(
      `INSERT INTO vehicles (plate_number, brand, model, year, category, seats, transmission, fuel_type, mileage, daily_price, status, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.plate_number,
        data.brand,
        data.model,
        data.year,
        data.category,
        data.seats,
        data.transmission,
        data.fuel_type,
        data.mileage,
        data.daily_price,
        data.status,
        JSON.stringify(data.images),
      ]
    );

    res.status(201).json({ vehicle: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Plate number already exists' });
    }
    next(error);
  }
});

// Update vehicle (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const data = vehicleSchema.partial().parse(req.body);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        updates.push(`images = $${paramIndex}`);
        params.push(JSON.stringify(data.images));
      } else {
        updates.push(`${key} = $${paramIndex}`);
        params.push((data as any)[key]);
      }
      paramIndex++;
    });

    updates.push(`updated_at = NOW()`);
    params.push(req.params.id);

    const query = `UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ vehicle: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete vehicle (admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


