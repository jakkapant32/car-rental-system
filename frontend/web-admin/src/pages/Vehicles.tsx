import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    daily_price: 0,
    status: 'available',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axiosInstance.get('/api/vehicles');
      setVehicles(res.data.vehicles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/vehicles', formData);
      fetchVehicles();
      setShowForm(false);
      setFormData({
        plate_number: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        daily_price: 0,
        status: 'available',
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try {
      await axiosInstance.delete(`/api/vehicles/${id}`);
      fetchVehicles();
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const generateQR = async (id: number) => {
    try {
      await axiosInstance.post(`/api/admin/vehicles/${id}/generate-qr`);
      alert('สร้าง QR Code สำเร็จ');
      fetchVehicles();
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการรถ</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'ยกเลิก' : '+ เพิ่มรถ'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">เพิ่มรถใหม่</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ป้ายทะเบียน"
              className="border rounded px-4 py-2"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="ยี่ห้อ"
              className="border rounded px-4 py-2"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="รุ่น"
              className="border rounded px-4 py-2"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="ปี"
              className="border rounded px-4 py-2"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              required
            />
            <input
              type="number"
              placeholder="ราคาต่อวัน"
              className="border rounded px-4 py-2"
              value={formData.daily_price}
              onChange={(e) => setFormData({ ...formData, daily_price: parseFloat(e.target.value) })}
              required
            />
            <select
              className="border rounded px-4 py-2"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">พร้อมให้เช่า</option>
              <option value="maintenance">ซ่อมบำรุง</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              บันทึก
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">ป้ายทะเบียน</th>
                <th className="px-6 py-3 text-left">รถ</th>
                <th className="px-6 py-3 text-left">ราคา/วัน</th>
                <th className="px-6 py-3 text-left">สถานะ</th>
                <th className="px-6 py-3 text-left">QR Code</th>
                <th className="px-6 py-3 text-left">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t">
                  <td className="px-6 py-4">{vehicle.plate_number}</td>
                  <td className="px-6 py-4">
                    {vehicle.brand} {vehicle.model}
                  </td>
                  <td className="px-6 py-4">฿{vehicle.daily_price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        vehicle.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {vehicle.qr_code_value ? (
                      <span className="text-green-600">✓ มี QR</span>
                    ) : (
                      <button
                        onClick={() => generateQR(vehicle.id)}
                        className="text-blue-600 hover:underline"
                      >
                        สร้าง QR
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


