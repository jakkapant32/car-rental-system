import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        axiosInstance.get('/api/vehicles'),
        axiosInstance.get('/api/bookings'),
      ]);

      const vehicles = vehiclesRes.data.vehicles;
      const bookings = bookingsRes.data.bookings;

      setStats({
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter((v: any) => v.status === 'available').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ด</h1>
        <p className="text-gray-600">ภาพรวมของระบบเช่ารถ</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
          <h3 className="text-sm font-medium text-gray-600 mb-3">รถทั้งหมด</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
          <h3 className="text-sm font-medium text-gray-600 mb-3">พร้อมให้เช่า</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.availableVehicles}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
          <h3 className="text-sm font-medium text-gray-600 mb-3">การจองทั้งหมด</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
          <h3 className="text-sm font-medium text-gray-600 mb-3">รอยืนยัน</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
        </div>
      </div>
    </div>
  );
}


