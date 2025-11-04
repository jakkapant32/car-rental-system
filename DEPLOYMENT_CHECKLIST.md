# 🚀 Deployment Checklist สำหรับ Render.com

## ✅ Pre-Deployment Checks

### 1. Code Quality
- [x] ✅ Backend TypeScript compiles successfully
- [x] ✅ No linter errors
- [x] ✅ All imports resolved
- [x] ✅ Environment validation working

### 2. Configuration Files
- [x] ✅ `.env.example` หรือ `env.template` exists
- [x] ✅ `Dockerfile` exists และถูกต้อง
- [x] ✅ `package.json` มี scripts ที่จำเป็น
- [x] ✅ Database migrations ready

### 3. Dependencies
- [x] ✅ All dependencies installed
- [x] ✅ No missing packages
- [x] ✅ Build scripts working

## 📋 Render.com Deployment Steps

### Step 1: Prepare Database

1. **สร้าง PostgreSQL Database บน Render.com:**
   - ไปที่ Render Dashboard
   - New → PostgreSQL
   - ตั้งชื่อ: `car-rental-db`
   - เลือก Region: `Oregon (US West)` หรือใกล้ที่สุด
   - PostgreSQL Version: `15` (แนะนำ)

2. **บันทึก Connection Information:**
   - Internal Database URL (สำหรับ backend service)
   - External Connection String (สำหรับ localhost)
   - Database name, user, password

### Step 2: Deploy Backend

1. **สร้าง Web Service:**
   - New → Web Service
   - Connect GitHub repository
   - Name: `car-rental-backend`
   - Region: เลือกเดียวกับ database
   - Branch: `main` หรือ `master`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run migrate && npm start`

2. **ตั้งค่า Environment Variables:**
   ```
   # Database
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
   FRONTEND_URL=https://your-frontend-domain.onrender.com
   FRONTEND_URLS=https://customer-domain.onrender.com,https://admin-domain.onrender.com
   
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
   - ใช้ **Internal Database URL** สำหรับ `DB_HOST` (ไม่ต้องใช้ SSL)
   - Generate JWT secrets ใหม่ (ไม่ใช้ของเดิม)
   - ตั้งค่า `FRONTEND_URL` และ `FRONTEND_URLS` ให้ถูกต้อง
   - `NODE_ENV=production`

### Step 3: Run Migrations

หลัง deploy backend แล้ว migrations จะรันอัตโนมัติ (จาก Dockerfile CMD)

หรือรัน manual:
```bash
# ใน Render Shell หรือ local
npm run migrate
```

### Step 4: Deploy Frontend Apps

**Option 1: Static Site (แนะนำ)**

1. **Build Frontend:**
   ```bash
   cd frontend/web-customer
   npm run build
   ```

2. **Deploy to Render Static Site:**
   - New → Static Site
   - Connect GitHub
   - Build Command: `cd frontend/web-customer && npm install && npm run build`
   - Publish Directory: `frontend/web-customer/dist`
   - Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`

3. **ทำซ้ำสำหรับ:**
   - `web-admin` (port 3002)
   - `staff-app` (port 3003)

**Option 2: Web Service (Docker)**

- ใช้ Dockerfile ที่มีอยู่แล้ว
- Deploy เป็น Web Service แต่ละตัว

### Step 5: Update Frontend API URLs

1. **สร้างไฟล์ `.env.production` สำหรับแต่ละ frontend:**

**frontend/web-customer/.env.production:**
```env
VITE_API_URL=https://car-rental-backend.onrender.com
```

**frontend/web-admin/.env.production:**
```env
VITE_API_URL=https://car-rental-backend.onrender.com
```

**frontend/staff-app/.env.production:**
```env
VITE_API_URL=https://car-rental-backend.onrender.com
```

2. **อัปเดต API base URL ใน code:**
   - ตรวจสอบ `AuthContext.tsx` ว่าอ่านจาก environment variable

### Step 6: Test Deployment

1. **Backend Health Check:**
   ```
   https://your-backend.onrender.com/health
   ```
   ควรเห็น: `{"status":"ok","database":"connected"}`

2. **Test API Endpoints:**
   - `POST /api/auth/register`
   - `GET /api/vehicles`
   - `POST /api/bookings`

3. **Test Frontend:**
   - เปิด frontend URLs
   - ทดสอบ login/register
   - ทดสอบการจองรถ

## 🔧 Common Issues & Solutions

### Issue 1: Database Connection Failed
**Solution:**
- ตรวจสอบว่าใช้ Internal Database URL (ไม่ใช่ External)
- ตรวจสอบ environment variables
- ตรวจสอบว่า database อยู่ใน region เดียวกัน

### Issue 2: CORS Error
**Solution:**
- ตั้งค่า `FRONTEND_URL` และ `FRONTEND_URLS` ให้ถูกต้อง
- ตรวจสอบว่า frontend URLs ตรงกับที่ deploy จริง

### Issue 3: Build Failed
**Solution:**
- ตรวจสอบ Build Command: `npm install && npm run build`
- ตรวจสอบ Root Directory: `backend`
- ตรวจสอบ Node version: `18` หรือสูงกว่า

### Issue 4: Migrations Failed
**Solution:**
- ตรวจสอบ database credentials
- ตรวจสอบว่า database user มีสิทธิ์สร้าง tables
- รัน migrations manual: `npm run migrate`

### Issue 5: Static Files Not Found
**Solution:**
- ตรวจสอบ `UPLOAD_DIR` path
- ใช้ persistent storage (Render Disk) สำหรับ uploads
- หรือใช้ cloud storage (S3, Cloudinary)

## 📝 Post-Deployment

### 1. Security
- [ ] เปลี่ยน JWT secrets เป็น production secrets
- [ ] ตั้งค่า CORS สำหรับ production domains
- [ ] เปิดใช้งาน HTTPS (Render ทำอัตโนมัติ)
- [ ] ตรวจสอบ rate limiting

### 2. Monitoring
- [ ] ตั้งค่า health checks
- [ ] ตรวจสอบ logs ใน Render dashboard
- [ ] ตั้งค่า alerts (ถ้ามี)

### 3. Backups
- [ ] ตั้งค่า database backups (Render ทำอัตโนมัติ)
- [ ] Backup environment variables

### 4. Documentation
- [ ] บันทึก production URLs
- [ ] บันทึก API endpoints
- [ ] บันทึก admin credentials (ปลอดภัย)

## 🎯 Quick Deploy Commands

### Backend
```
Build: npm install && npm run build
Start: npm run migrate && npm start
```

### Frontend
```
Build: npm install && npm run build
Output: dist/
```

## ✅ Final Checklist

- [ ] Database deployed และเชื่อมต่อได้
- [ ] Backend deployed และ health check ผ่าน
- [ ] Frontend apps deployed
- [ ] Environment variables ตั้งค่าครบ
- [ ] Migrations รันสำเร็จ
- [ ] CORS ตั้งค่าถูกต้อง
- [ ] API endpoints ทำงานได้
- [ ] Frontend เชื่อมต่อ backend ได้
- [ ] ทดสอบ login/register สำเร็จ
- [ ] ทดสอบการจองรถสำเร็จ

---

**Ready to Deploy! 🚀**

