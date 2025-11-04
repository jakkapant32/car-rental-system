import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { pool } from './config/database';
import { env } from './config/env';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import qrRoutes from './routes/qr';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';

const app = express();

// CORS Configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow localhost
    if (env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }

    // In production, check allowed origins
    const allowedOrigins = env.FRONTEND_URLS 
      ? env.FRONTEND_URLS.split(',').map(url => url.trim())
      : [env.FRONTEND_URL];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Stripe webhook needs raw body - must be before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Store raw body for Stripe verification
  (req as any).rawBody = req.body;
  next();
});

// Regular JSON parsing for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (QR codes, vehicle images)
app.use('/api/uploads', express.static(join(process.cwd(), env.UPLOAD_DIR)));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qr', rateLimiter, qrRoutes); // Rate limit QR endpoints
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`💳 Stripe: ${env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured (using fallback)'}`);
  console.log(`📧 Email: ${env.SMTP_HOST ? '✅ Configured' : '❌ Not configured'}`);
});

