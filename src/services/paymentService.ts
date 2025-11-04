import Stripe from 'stripe';
import { pool } from '../config/database';
import { env } from '../config/env';

// Initialize Stripe (optional - will work without it in development)
let stripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

export interface PaymentIntentData {
  bookingId: number;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe payment intent for a booking
 */
export async function createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
  }

  // Get booking details
  const bookingResult = await pool.query(
    'SELECT * FROM bookings WHERE id = $1',
    [data.bookingId]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error('Booking not found');
  }

  const booking = bookingResult.rows[0];

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100), // Convert to cents
    currency: data.currency || 'thb',
    metadata: {
      booking_id: data.bookingId.toString(),
      user_id: booking.user_id.toString(),
      vehicle_id: booking.vehicle_id.toString(),
      ...data.metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

/**
 * Verify webhook signature from Stripe
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook is not configured');
  }

  // Ensure payload is Buffer for Stripe
  const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);

  return stripe.webhooks.constructEvent(
    payloadBuffer,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Handle successful payment webhook
 */
export async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = parseInt(paymentIntent.metadata.booking_id);
  const transactionId = paymentIntent.id;
  const amount = paymentIntent.amount / 100; // Convert from cents

  // Create payment record
  await pool.query(
    `INSERT INTO payments (booking_id, amount, method, status, transaction_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    [bookingId, amount, paymentIntent.payment_method_types[0] || 'card', 'completed', transactionId]
  );

  // Update booking status
  await pool.query(
    'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
    ['confirmed', bookingId]
  );

  // Update vehicle status
  const bookingResult = await pool.query(
    'SELECT vehicle_id FROM bookings WHERE id = $1',
    [bookingId]
  );

  if (bookingResult.rows.length > 0) {
    await pool.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['reserved', bookingResult.rows[0].vehicle_id]
    );
  }
}

/**
 * Handle failed payment webhook
 */
export async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = parseInt(paymentIntent.metadata.booking_id);
  const transactionId = paymentIntent.id;
  const amount = paymentIntent.amount / 100;

  // Create payment record with failed status
  await pool.query(
    `INSERT INTO payments (booking_id, amount, method, status, transaction_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    [bookingId, amount, paymentIntent.payment_method_types[0] || 'card', 'failed', transactionId]
  );
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return stripe !== null && env.STRIPE_SECRET_KEY !== undefined;
}

