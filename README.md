# 🚗 ระบบเช่ารถออนไลน์พร้อม QR Code

ระบบเช่ารถออนไลน์แบบครบวงจร พร้อมระบบ QR Code สำหรับการเช็คอิน/เช็คเอาท์

## ✨ ฟีเจอร์

- **เว็บลูกค้า**: ค้นหา จอง และชำระเงินออนไลน์
- **Admin Dashboard**: จัดการรถ การจอง และรายงาน
- **Staff PWA**: สแกน QR Code สำหรับเช็คอิน/เช็คเอาท์
- **QR Code System**: สร้างและจัดการ QR Code อัตโนมัติ
- **Payment Integration**: ระบบชำระเงินพร้อม webhook
- **Real-time Status**: อัปเดตสถานะรถแบบเรียลไทม์

## 🏗️ โครงสร้างโปรเจ็กต์

```
car-rental-project/
├── frontend/
│   ├── web-customer/     # SPA สำหรับลูกค้า (React + TypeScript)
│   ├── web-admin/        # SPA สำหรับแอดมิน
│   └── staff-app/        # PWA สำหรับพนักงานสแกน QR
├── backend/              # API Server (Express + TypeScript)
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/    # Business logic
│   │   ├── middlewares/ # Auth, rate limiting
│   │   └── migrations/  # Database migrations
├── scripts/              # Utility scripts
└── docker-compose.yml    # Docker setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (หรือใช้ Docker)
- npm หรือ yarn

### 1. ติดตั้ง Dependencies

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend Customer
cd ../frontend/web-customer
npm install

# Frontend Admin
cd ../web-admin
npm install

# Frontend Staff
cd ../staff-app
npm install
```

### 2. Setup Database

#### ใช้ Render.com PostgreSQL:

1. สร้าง PostgreSQL database บน Render.com
2. Copy connection string
3. สร้างไฟล์ `backend/.env`:

```env
DB_HOST=your-db-host.onrender.com
DB_PORT=5432
DB_NAME=car_rental
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

#### หรือใช้ Docker (Local Development):

```bash
docker-compose up -d postgres
```

### 3. Run Migrations

```bash
cd backend
npm run migrate:dev
```

### 4. Start Backend

```bash
cd backend
npm run dev
```

Backend จะรันที่ `http://localhost:3001`

### 5. Start Frontend

เปิด terminal ใหม่สำหรับแต่ละ frontend:

```bash
# Customer site (port 3000)
cd frontend/web-customer
npm run dev

# Admin panel (port 3002)
cd frontend/web-admin
npm run dev

# Staff app (port 3003)
cd frontend/staff-app
npm run dev
```

## 🐳 Docker Deployment

```bash
# Build และ start ทุก services
docker-compose up -d

# ดู logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน

### Vehicles
- `GET /api/vehicles` - รายการรถ (พร้อม filters)
- `GET /api/vehicles/:id` - รายละเอียดรถ
- `POST /api/vehicles` - เพิ่มรถ (admin only)
- `PUT /api/vehicles/:id` - แก้ไขรถ (admin only)
- `DELETE /api/vehicles/:id` - ลบรถ (admin only)

### Bookings
- `POST /api/bookings` - สร้างการจอง
- `GET /api/bookings/my-bookings` - การจองของฉัน
- `GET /api/bookings/:id` - รายละเอียดการจอง
- `PUT /api/bookings/:id/confirm` - ยืนยันการจอง (admin)
- `PUT /api/bookings/:id/cancel` - ยกเลิกการจอง

### QR Code
- `GET /api/qr/:qrValue` - ข้อมูลรถจาก QR (public, rate-limited)
- `POST /api/qr/:qrValue/scan` - สแกน QR (staff/admin)

### Admin
- `POST /api/admin/vehicles/:id/generate-qr` - สร้าง QR สำหรับรถ
- `GET /api/admin/reports/occupancy` - รายงานอัตราการใช้งาน
- `GET /api/admin/reports/revenue` - รายงานรายได้
- `GET /api/admin/qr-logs` - QR scan logs

## 🔐 Authentication

ระบบใช้ JWT tokens:
- Access token: ใช้สำหรับ API calls
- Refresh token: ใช้สำหรับต่ออายุ token

Headers:
```
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### ตารางหลัก:
- `users` - ผู้ใช้ (customer/admin/staff)
- `vehicles` - รถยนต์
- `qr_tags` - QR codes
- `bookings` - การจอง
- `payments` - การชำระเงิน
- `qr_logs` - บันทึกการสแกน QR
- `notifications` - การแจ้งเตือน
- `audit_logs` - Audit trail

ดูรายละเอียดใน `backend/src/migrations/001_create_tables.sql`

## 🔒 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (QR endpoints)
- ✅ Input validation (Zod)
- ✅ SQL injection protection (parameterized queries)

## 📱 Staff PWA

Staff app เป็น Progressive Web App ที่สามารถ:
- สแกน QR Code ด้วยกล้องมือถือ
- เช็คอิน/เช็คเอาท์รถ
- ทำงานแบบออฟไลน์ได้ (sync เมื่อออนไลน์)

## 🧪 Testing

```bash
# Backend tests (เมื่อมี)
cd backend
npm test

# Frontend tests (เมื่อมี)
cd frontend/web-customer
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=
DB_PORT=5432
DB_NAME=car_rental
DB_USER=
DB_PASSWORD=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚢 Deployment

### Render.com

1. **Backend**: 
   - Connect GitHub repo
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `cd backend && npm start`
   - Environment variables: ตั้งค่า DB และ JWT secrets

2. **Frontend**: 
   - Deploy แต่ละ frontend เป็น static site
   - หรือใช้ Vercel/Netlify

3. **Database**: 
   - ใช้ Render PostgreSQL (ที่สร้างไว้แล้ว)

### Production Checklist

- [x] ตั้งค่า environment variables (มี validation แล้ว)
- [ ] เปลี่ยน JWT secrets (ใช้ secrets ที่ปลอดภัย)
- [x] ตั้งค่า CORS สำหรับ production domains (รองรับหลาย domains)
- [ ] เปิดใช้งาน HTTPS
- [ ] ตั้งค่า backup database
- [ ] ตั้งค่า monitoring (Sentry, etc.)
- [x] ทดสอบ payment gateway integration (Stripe integrated)
- [x] ทดสอบ QR scanning flow
- [x] Image upload system
- [x] Email notifications

### New Features (Latest Update)

- ✅ **Stripe Payment Integration**: ระบบชำระเงินจริงผ่าน Stripe
- ✅ **Email Notifications**: ส่งอีเมลยืนยันการจองและยกเลิก
- ✅ **Image Upload**: อัปโหลดรูปภาพรถยนต์ (admin only)
- ✅ **Environment Validation**: ตรวจสอบ environment variables อัตโนมัติ
- ✅ **Production CORS**: ตั้งค่า CORS สำหรับ production

## 📄 License

MIT

## 👥 Contributors

Created for Car Rental System Project

## 📞 Support

หากมีคำถามหรือพบปัญหา กรุณาเปิด issue ใน repository

---

**หมายเหตุ**: ระบบนี้เป็น Production-ready แต่ควรทำ security audit และ penetration testing ก่อนใช้งานจริง

