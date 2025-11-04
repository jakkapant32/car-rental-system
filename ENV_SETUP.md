# Environment Variables Setup Guide

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values (see below)

3. Generate JWT secrets:
   ```bash
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

   # Linux/Mac
   openssl rand -base64 32
   ```

## Required Variables

### Database
```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=car_rental
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### JWT (Required - Minimum 32 characters)
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Server
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=https://customer.example.com,https://admin.example.com  # Optional: for production
```

## Optional Variables

### Stripe Payment Gateway
For production, integrate with Stripe:
1. Sign up at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
3. Set up webhook at https://dashboard.stripe.com/webhooks

```env
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From webhook settings
```

**Note**: If not configured, the system will use mock payments for development.

### Email Notifications
For sending booking confirmation emails:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # For Gmail, use App Password
SMTP_FROM=noreply@carrental.com
```

**Gmail Setup**:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the App Password as `SMTP_PASSWORD`

**Note**: If not configured, emails will be skipped (logged only).

### File Upload
```env
UPLOAD_DIR=./uploads
QR_STORAGE_PATH=./uploads/qr-codes
```

## Validation

The application validates all environment variables on startup. If any required variable is missing or invalid, the server will not start and show a clear error message.

## Production Checklist

- [ ] All required variables set
- [ ] JWT secrets are strong (32+ characters, random)
- [ ] Database credentials are secure
- [ ] Stripe keys are production keys (not test keys)
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Email SMTP configured and tested
- [ ] FRONTEND_URLS set for production domains
- [ ] NODE_ENV=production

## Testing Configuration

To test if your configuration is valid:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running on port 3001
📝 Environment: development
🔗 Frontend URL: http://localhost:3000
💳 Stripe: ✅ Configured (or ❌ Not configured)
📧 Email: ✅ Configured (or ❌ Not configured)
```


