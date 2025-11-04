import express, { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, requireRole } from '../middlewares/auth';
import { AuthRequest } from '../types';
import { 
  createPaymentIntent, 
  verifyWebhookSignature, 
  handlePaymentSuccess, 
  handlePaymentFailure,
  isStripeConfigured 
} from '../services/paymentService';
import { sendBookingConfirmationEmail } from '../services/emailService';

const router = Router();

const paymentSchema = z.object({
  booking_id: z.number().int(),
  amount: z.number().positive(),
  method: z.string().optional(),
});

// Create payment intent (Stripe)
router.post('/create-intent', authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const data = paymentSchema.parse(req.body);

    // Verify booking exists and belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [data.booking_id, authReq.user!.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      // Fallback to mock payment for development
      return res.status(503).json({ 
        error: 'Payment gateway not configured',
        fallback: true 
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent({
      bookingId: data.booking_id,
      amount: data.amount,
      currency: 'thb',
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    next(error);
  }
});

// Create payment (fallback for development without Stripe)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const data = paymentSchema.parse(req.body);

    // Verify booking exists and belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [data.booking_id, authReq.user!.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Mock payment for development (when Stripe is not configured)
    const paymentResult = await pool.query(
      `INSERT INTO payments (booking_id, amount, method, status, transaction_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.booking_id, data.amount, data.method || 'credit_card', 'completed', `txn_${Date.now()}`]
    );

    // Update booking status to confirmed
    await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
      ['confirmed', data.booking_id]
    );

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(booking.id);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ payment: paymentResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get payment by booking ID
router.get('/booking/:bookingId', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC',
      [req.params.bookingId]
    );

    res.json({ payments: result.rows });
  } catch (error) {
    next(error);
  }
});

// Payment webhook (for Stripe callbacks)
// Note: This route uses raw body from middleware in main app
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody || req.body;

    // If no signature, try fallback mode (for development/testing)
    if (!signature) {
      // Try to parse as JSON (fallback mode)
      try {
        const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
        const { booking_id, transaction_id, status } = body;

        if (status === 'success' || status === 'completed') {
          await pool.query(
            'UPDATE payments SET status = $1 WHERE transaction_id = $2',
            ['completed', transaction_id]
          );

          await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2',
            ['confirmed', booking_id]
          );

          try {
            await sendBookingConfirmationEmail(booking_id);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }
        }

        return res.json({ received: true, mode: 'fallback' });
      } catch (parseError) {
        return res.status(400).json({ error: 'Missing stripe-signature header or invalid JSON' });
      }
    }

    // Verify webhook signature with raw body
    const event = verifyWebhookSignature(rawBody, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as any);
        
        // Send confirmation email
        const paymentIntent = event.data.object as any;
        const bookingId = parseInt(paymentIntent.metadata.booking_id);
        try {
          await sendBookingConfirmationEmail(bookingId);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // If signature verification fails, try fallback
    if (error.message && (error.message.includes('No signatures found') || error.message.includes('No signature'))) {
      try {
        const body = typeof (req as any).rawBody === 'string' 
          ? JSON.parse((req as any).rawBody) 
          : req.body;
        const { booking_id, transaction_id, status } = body;

        if (status === 'success' || status === 'completed') {
          await pool.query(
            'UPDATE payments SET status = $1 WHERE transaction_id = $2',
            ['completed', transaction_id]
          );

          await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2',
            ['confirmed', booking_id]
          );

          try {
            await sendBookingConfirmationEmail(booking_id);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }
        }

        return res.json({ received: true, mode: 'fallback' });
      } catch (parseError) {
        // If fallback also fails, return error
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }
    }
    next(error);
  }
});

export default router;

