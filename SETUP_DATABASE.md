# 📚 คู่มือตั้งค่า Database บน Render.com

## ขั้นตอนที่ 1: สร้าง PostgreSQL Database

1. ไปที่ [Render.com Dashboard](https://dashboard.render.com)
2. คลิก **"New +"** → เลือก **"PostgreSQL"**

### ข้อมูลที่ควรกรอก:

- **Name**: `car-rental-db`
- **Database**: `car_rental` ⭐ (แนะนำให้ตั้งชื่อ)
- **User**: `car_rental_user` ⭐ (แนะนำให้ตั้งชื่อ)
- **Region**: เลือก region ที่ใกล้ที่สุด (เช่น `Oregon (US West)`)
- **PostgreSQL Version**: `17` หรือ `15` (แนะนำ `15` สำหรับความเสถียร)
- **Project**: สร้างโปรเจ็กต์ใหม่ชื่อ `car-rental-project` (เพื่อจัดกลุ่ม resources)

## ขั้นตอนที่ 2: เก็บ Connection Information

หลังจากสร้าง database แล้ว:

1. ไปที่หน้า Database ที่สร้างไว้
2. คลิกที่แท็บ **"Connections"** หรือ **"Info"**
3. คัดลอกข้อมูลต่อไปนี้:

### Internal Database URL (สำหรับใช้ใน Render.com)
```
postgresql://car_rental_user:password@hostname.onrender.com:5432/car_rental
```

### External Connection String (สำหรับใช้จาก localhost)
```
postgresql://car_rental_user:password@hostname.onrender.com:5432/car_rental?sslmode=require
```

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### สำหรับ Local Development

สร้างไฟล์ `backend/.env`:

```env
# Database (จาก Render.com)
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=car_rental
DB_USER=car_rental_user
DB_PASSWORD=your-password-from-render

# JWT Secrets (สร้างใหม่ด้วยคำสั่ง: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### สำหรับ Production (Render.com Backend Service)

เมื่อ deploy backend บน Render.com ให้ตั้งค่า Environment Variables:

1. ไปที่ Backend Service → **Environment**
2. เพิ่ม variables:

```
DB_HOST=<internal-host-from-render>
DB_PORT=5432
DB_NAME=car_rental
DB_USER=car_rental_user
DB_PASSWORD=<password-from-render>
JWT_SECRET=<generate-new-secret>
JWT_REFRESH_SECRET=<generate-new-secret>
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**หมายเหตุ**: สำหรับ Render.com ควรใช้ **Internal Database URL** เพื่อให้เชื่อมต่อผ่าน private network (เร็วกว่าและปลอดภัยกว่า)

## ขั้นตอนที่ 4: รัน Migrations

หลังจากตั้งค่า `.env` แล้ว:

```bash
cd backend
npm install
npm run migrate:dev
```

หรือถ้าใช้ production:

```bash
npm run build
npm run migrate
```

## 🔍 วิธีหา Connection Info จาก Render.com

1. **Internal Connection** (สำหรับ services ใน Render เดียวกัน):
   - ไปที่ Database → **Connections** tab
   - คัดลอก **"Internal Database URL"**
   - ใช้ hostname จาก URL นี้ (เช่น `dpg-xxxxx-a.oregon-postgres.render.com`)

2. **External Connection** (สำหรับ localhost):
   - ไปที่ Database → **Connections** tab
   - คัดลอก **"External Connection String"**
   - หรือใช้ **"Connection Pooling"** URL (แนะนำสำหรับ production)

## ✅ ทดสอบการเชื่อมต่อ

```bash
cd backend
npm run dev
```

ถ้าเห็นข้อความ `✅ Database connected` แสดงว่าสำเร็จ!

## 🚨 Security Tips

1. **อย่า commit `.env` file** → มีอยู่ใน `.gitignore` แล้ว
2. **ใช้ strong passwords** สำหรับ database
3. **Generate JWT secrets** ที่ปลอดภัย:
   ```bash
   openssl rand -base64 32
   ```
4. **ใช้ Internal Database URL** เมื่อ deploy บน Render.com (ไม่ต้องใช้ SSL)
5. **ใช้ External Connection String** เมื่อ connect จาก localhost (ต้องใช้ SSL)

## 📝 ตัวอย่าง Connection String

### Internal (Render.com → Render.com)
```
postgresql://user:pass@host.internal:5432/dbname
```

### External (Localhost → Render.com)
```
postgresql://user:pass@host.onrender.com:5432/dbname?sslmode=require
```

---

**หลังจากตั้งค่าเสร็จแล้ว อย่าลืมรัน migrations เพื่อสร้าง tables!**


