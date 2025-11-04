import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { authenticate } from '../middlewares/auth';
import { AuthRequest } from '../types';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['customer', 'admin', 'staff']).default('customer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [data.name, data.email, data.phone, passwordHash, data.role]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      refreshToken,
    });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await pool.query(
      'SELECT id, name, email, phone, role, password_hash FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const authReq = req as AuthRequest;
  res.json({ user: authReq.user });
});

export default router;

