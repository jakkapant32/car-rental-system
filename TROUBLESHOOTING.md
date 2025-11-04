# 🔧 Troubleshooting Guide

## ปัญหา: Frontend ไม่สามารถเชื่อมต่อ Backend

### อาการ
- Error: `connect ECONNREFUSED ::1:3001` หรือ `connect ECONNREFUSED 127.0.0.1:3001`
- Vite proxy error: `/api/auth/register` หรือ endpoint อื่นๆ

### สาเหตุ
1. **Backend server ไม่ได้รันอยู่**
   - Backend ยังไม่ได้ start
   - Backend มี error และไม่สามารถ start ได้

2. **Port 3001 ถูกใช้งานโดยโปรแกรมอื่น**
   - มี process อื่นใช้ port 3001 อยู่

3. **Proxy configuration ไม่ถูกต้อง**
   - IPv6 vs IPv4 issue

### วิธีแก้ไข

#### 1. ตรวจสอบว่า Backend รันอยู่

เปิด Terminal ใหม่และรัน:

```bash
cd backend
npm run dev
```

คุณควรเห็น:
```
✅ Database connected
🚀 Server running on port 3001
📝 Environment: development
```

ถ้าไม่เห็น แสดงว่า backend ยังไม่ได้ start หรือมี error

#### 2. ตรวจสอบว่า Port 3001 ว่าง

**Windows PowerShell:**
```powershell
netstat -ano | findstr :3001
```

**Linux/Mac:**
```bash
lsof -i :3001
```

ถ้ามี process ใช้ port อยู่:
- หยุด process นั้น
- หรือเปลี่ยน PORT ใน `.env` file

#### 3. Restart Frontend

หลังจากแก้ไข proxy config แล้ว:

1. **หยุด frontend server** (Ctrl+C ใน terminal)
2. **Start ใหม่:**

```bash
# Customer
cd frontend/web-customer
npm run dev

# Admin
cd frontend/web-admin
npm run dev

# Staff
cd frontend/staff-app
npm run dev
```

#### 4. ทดสอบการเชื่อมต่อ

เปิด browser ไปที่: `http://localhost:3001/health`

ควรเห็น:
```json
{"status":"ok","database":"connected"}
```

ถ้าไม่เห็น แสดงว่า backend ไม่ได้รันอยู่

### การแก้ไข Proxy Config

เราได้แก้ไข proxy config ให้ใช้ `127.0.0.1` แทน `localhost` เพื่อหลีกเลี่ยงปัญหา IPv6

ถ้ายังมีปัญหา ลอง:

1. **ตรวจสอบ firewall:**
   - ตรวจสอบว่า Windows Firewall ไม่ได้บล็อก port 3001

2. **ใช้ IP address โดยตรง:**
   ```typescript
   target: 'http://127.0.0.1:3001'
   ```

3. **ตรวจสอบ CORS:**
   - ตรวจสอบว่า `FRONTEND_URL` ใน `.env` ถูกต้อง

### Checklist

- [ ] Backend server รันอยู่ที่ port 3001
- [ ] Port 3001 ไม่ถูกใช้งานโดย process อื่น
- [ ] Proxy config ใช้ `127.0.0.1` แทน `localhost`
- [ ] Frontend restart แล้ว
- [ ] `/health` endpoint ทำงานได้

### ยังแก้ไม่ได้?

1. ตรวจสอบ backend logs ใน terminal
2. ตรวจสอบ frontend logs ใน terminal
3. ตรวจสอบ browser console (F12)
4. ตรวจสอบ Network tab ใน browser DevTools

