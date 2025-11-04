import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export default function Reports() {
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [occRes, revRes] = await Promise.all([
        axiosInstance.get('/api/admin/reports/occupancy'),
        axiosInstance.get('/api/admin/reports/revenue'),
      ]);
      setOccupancy(occRes.data.report);
      setRevenue(revRes.data.report);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">รายงาน</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">อัตราการใช้งานรถ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">รถ</th>
                  <th className="text-right py-2">จำนวนการจอง</th>
                </tr>
              </thead>
              <tbody>
                {occupancy.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.plate_number}</td>
                    <td className="text-right py-2">{item.booking_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">รายได้</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">วันที่</th>
                  <th className="text-right py-2">จำนวน</th>
                  <th className="text-right py-2">รายได้</th>
                </tr>
              </thead>
              <tbody>
                {revenue.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.date}</td>
                    <td className="text-right py-2">{item.booking_count}</td>
                    <td className="text-right py-2">฿{parseFloat(item.total_revenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


