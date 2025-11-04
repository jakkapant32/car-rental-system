# 🚀 Quick Start Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ ติดตั้ง dependencies ทั้งหมด (backend + frontend)
2. ✅ สร้าง directories สำหรับ uploads
3. ✅ ตั้งค่าไฟล์ `.env` พร้อม JWT secrets ที่ปลอดภัย
4. ✅ รัน database migrations สำเร็จ

## 📋 ขั้นตอนต่อไป

### 1. เริ่ม Backend Server

เปิด terminal ใหม่และรัน:

```bash
cd backend
npm run dev
```

คุณควรเห็น:
```
✅ Database connected
🚀 Server running on port 3001
📝 Environment: development
🔗 Frontend URL: http://localhost:3000
💳 Stripe: ❌ Not configured (using fallback)
📧 Email: ❌ Not configured
```

### 2. เริ่ม Frontend Apps

เปิด terminal ใหม่สำหรับแต่ละ frontend:

**Customer Site (Port 3000):**
```bash
cd frontend/web-customer
npm run dev
```

**Admin Panel (Port 3002):**
```bash
cd frontend/web-admin
npm run dev
```

**Staff App (Port 3003):**
```bash
cd frontend/staff-app
npm run dev
```

## 🧪 ทดสอบระบบ

### 1. Health Check
เปิด browser ไปที่: `http://localhost:3001/health`

ควรเห็น:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. สร้าง Admin Account (ครั้งแรก)

ใช้ API หรือ frontend admin panel เพื่อสร้าง admin account แรก

### 3. ทดสอบ Features

- ✅ Login/Register
- ✅ เพิ่มรถยนต์ (Admin)
- ✅ จองรถ (Customer)
- ✅ สแกน QR Code (Staff)
- ✅ Payment (Mock mode - ไม่ต้องใช้ Stripe)

## 📝 หมายเหตุ

- **Stripe**: ยังไม่ตั้งค่า (ใช้ mock payment mode)
- **Email**: ยังไม่ตั้งค่า (emails จะถูก log แต่ไม่ส่งจริง)
- **Database**: เชื่อมต่อกับ Render.com PostgreSQL แล้ว

## 🔧 Troubleshooting

### Server ไม่เริ่มต้น
- ตรวจสอบว่า port 3001 ไม่ถูกใช้งาน
- ตรวจสอบ `.env` file ว่ามีค่าครบถ้วน
- ดู error logs ใน terminal

### Database Connection Error
- ตรวจสอบ credentials ใน `.env`
- ตรวจสอบว่า database บน Render.com เปิดอยู่
- ใช้ External Connection String (มี SSL)

### Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบว่า backend กำลังรันอยู่
- ตรวจสอบ `FRONTEND_URL` ใน `.env`
- ตรวจสอบ CORS settings

## 🎉 พร้อมใช้งาน!

ระบบพร้อมใช้งานแล้ว! เริ่มต้นด้วยการรัน backend server แล้วตามด้วย frontend apps


