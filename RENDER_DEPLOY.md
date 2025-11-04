# 🚀 คู่มือ Deploy บน Render.com

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] ✅ Backend TypeScript compiles successfully
- [x] ✅ No linter errors
- [x] ✅ All axios calls use axiosInstance (production-ready)
- [x] ✅ Environment validation working

### 2. Configuration
- [x] ✅ Dockerfile exists และถูกต้อง
- [x] ✅ Environment variables template ready
- [x] ✅ Database migrations ready

## 📋 ขั้นตอน Deployment

### Step 1: สร้าง PostgreSQL Database

1. ไปที่ [Render Dashboard](https://dashboard.render.com)
2. คลิก **"New +"** → **"PostgreSQL"**
3. ตั้งค่า:
   - **Name**: `car-rental-db`
   - **Database**: `car_rental_o6a8` (หรือชื่อที่คุณต้องการ)
   - **User**: `car_rental_user`
   - **Region**: `Oregon (US West)` (หรือใกล้ที่สุด)
   - **PostgreSQL Version**: `15`
4. รอให้ database สร้างเสร็จ

### Step 2: Deploy Backend

1. **สร้าง Web Service:**
   - คลิก **"New +"** → **"Web Service"**
   - Connect GitHub repository
   - ตั้งค่า:
     - **Name**: `car-rental-backend`
     - **Region**: เลือกเดียวกับ database
     - **Branch**: `main` หรือ `master`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run migrate && npm start`

2. **ตั้งค่า Environment Variables:**
   ```
   # Database (ใช้ Internal Database URL)
   DB_HOST=<internal-host-from-render-database>
   DB_PORT=5432
   DB_NAME=car_rental_o6a8
   DB_USER=car_rental_user
   DB_PASSWORD=<password-from-render>
   
   # JWT (Generate new secrets!)
   JWT_SECRET=<generate-new-secret-min-32-chars>
   JWT_REFRESH_SECRET=<generate-new-secret-min-32-chars>
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Server
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-customer-app.onrender.com
   FRONTEND_URLS=https://customer-app.onrender.com,https://admin-app.onrender.com,https://staff-app.onrender.com
   
   # Stripe (Optional)
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Email (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@carrental.com
   
   # File Upload
   UPLOAD_DIR=./uploads
   QR_STORAGE_PATH=./uploads/qr-codes
   ```

3. **Important Notes:**
   - ใช้ **Internal Database URL** สำหรับ `DB_HOST` (ไม่มี `.internal` ในชื่อ)
   - Generate JWT secrets ใหม่ (ใช้ `openssl rand -base64 32`)
   - ตั้งค่า `FRONTEND_URLS` ให้เป็น URLs จริงของ frontend apps

### Step 3: Deploy Frontend Apps

**สำหรับแต่ละ frontend (Customer, Admin, Staff):**

1. **สร้าง Static Site:**
   - คลิก **"New +"** → **"Static Site"**
   - Connect GitHub repository
   - ตั้งค่า:
     - **Name**: `car-rental-customer` (หรือ admin/staff)
     - **Root Directory**: `frontend/web-customer` (หรือ web-admin/staff-app)
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **ตั้งค่า Environment Variables:**
   ```
   VITE_API_URL=https://car-rental-backend.onrender.com
   ```

3. **ทำซ้ำสำหรับ:**
   - `frontend/web-admin` → `car-rental-admin`
   - `frontend/staff-app` → `car-rental-staff`

### Step 4: Update CORS Configuration

หลังจากได้ frontend URLs แล้ว:

1. ไปที่ Backend Service → Environment
2. อัปเดต `FRONTEND_URLS`:
   ```
   FRONTEND_URLS=https://car-rental-customer.onrender.com,https://car-rental-admin.onrender.com,https://car-rental-staff.onrender.com
   ```
3. Restart service

### Step 5: Test Deployment

1. **Backend Health Check:**
   ```
   https://car-rental-backend.onrender.com/health
   ```
   ควรเห็น: `{"status":"ok","database":"connected"}`

2. **Test Frontend:**
   - เปิด frontend URLs
   - ทดสอบ login/register
   - ทดสอบการจองรถ

## 🔧 Troubleshooting

### Database Connection Failed
- ใช้ Internal Database URL (ไม่ใช่ External)
- ตรวจสอบว่า database และ backend อยู่ใน region เดียวกัน
- ตรวจสอบ environment variables

### CORS Error
- ตรวจสอบ `FRONTEND_URLS` ว่าถูกต้อง
- ตรวจสอบว่า URLs ตรงกับที่ deploy จริง
- ตรวจสอบว่าไม่มี trailing slash

### Build Failed
- ตรวจสอบ Build Command
- ตรวจสอบ Root Directory
- ตรวจสอบ logs ใน Render dashboard

### Migrations Failed
- ตรวจสอบ database credentials
- ตรวจสอบว่า user มีสิทธิ์สร้าง tables
- ดู logs ใน Render dashboard

## 📝 Important URLs

หลัง deploy แล้ว บันทึก URLs เหล่านี้:

- **Backend**: `https://car-rental-backend.onrender.com`
- **Customer**: `https://car-rental-customer.onrender.com`
- **Admin**: `https://car-rental-admin.onrender.com`
- **Staff**: `https://car-rental-staff.onrender.com`
- **Database**: (Internal connection string)

## ✅ Final Checklist

- [ ] Database deployed
- [ ] Backend deployed และ health check ผ่าน
- [ ] Frontend apps deployed (3 ตัว)
- [ ] Environment variables ตั้งค่าครบ
- [ ] CORS ตั้งค่าถูกต้อง
- [ ] Migrations รันสำเร็จ
- [ ] API endpoints ทำงานได้
- [ ] Frontend เชื่อมต่อ backend ได้
- [ ] ทดสอบ login/register สำเร็จ
- [ ] ทดสอบการจองรถสำเร็จ

---

**Ready to Deploy! 🚀**

