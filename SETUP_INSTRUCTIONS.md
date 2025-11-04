# 🚀 คำแนะนำการตั้งค่า Backend

## ขั้นตอนที่ 1: สร้างไฟล์ .env

1. Copy ไฟล์ `.env.setup` เป็น `.env`:
   ```bash
   cd backend
   copy .env.setup .env
   ```
   
   หรือบน Linux/Mac:
   ```bash
   cp .env.setup .env
   ```

2. ไฟล์ `.env` จะมีข้อมูล database จาก Render.com แล้ว

## ขั้นตอนที่ 2: Generate JWT Secrets (แนะนำ)

สำหรับ production ควร generate secrets ที่ปลอดภัย:

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Linux/Mac:
```bash
openssl rand -base64 32
```

หรือใช้ online tool: https://generate-secret.vercel.app/32

แล้วแก้ไขใน `.env`:
```
JWT_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
```

## ขั้นตอนที่ 3: ติดตั้ง Dependencies

```bash
cd backend
npm install
```

## ขั้นตอนที่ 4: รัน Database Migrations

```bash
npm run migrate:dev
```

ถ้าสำเร็จจะเห็น:
```
🔄 Running migrations...
✅ Migrations completed successfully
```

## ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อ

```bash
npm run dev
```

ถ้าเห็น:
```
✅ Database connected
🚀 Server running on port 3001
```

แสดงว่าทุกอย่างพร้อมใช้งานแล้ว!

## 🔍 Troubleshooting

### Connection Error
- ตรวจสอบว่าใช้ **External Database URL** (hostname เต็ม)
- ตรวจสอบว่า password ถูกต้อง
- ตรวจสอบว่า database เปิดให้ external connection แล้ว

### Migration Error
- ตรวจสอบว่า database name ถูกต้อง (`car_rental_o6a8`)
- ตรวจสอบว่า user มีสิทธิ์สร้าง tables

## 📝 หมายเหตุ

- ไฟล์ `.env` ถูก ignore แล้ว (ไม่ถูก commit)
- สำหรับ production deployment ควรใช้ **Internal Database URL** (hostname สั้น)
- ต้องใช้ SSL connection เมื่อ connect จาก localhost


