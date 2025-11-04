import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/api/bookings');
      setBookings(res.data.bookings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (id: number) => {
    try {
      await axiosInstance.put(`/api/bookings/${id}/confirm`);
      fetchBookings();
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const getStatusText = (status: string) => {
    const map: { [key: string]: string } = {
      pending: 'รอยืนยัน',
      confirmed: 'ยืนยันแล้ว',
      cancelled: 'ยกเลิก',
      completed: 'เสร็จสิ้น',
    };
    return map[status] || status;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">การจอง</h1>

      {loading ? (
        <div className="text-center py-12">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">ลูกค้า</th>
                <th className="px-6 py-3 text-left">รถ</th>
                <th className="px-6 py-3 text-left">วันที่</th>
                <th className="px-6 py-3 text-left">ยอดรวม</th>
                <th className="px-6 py-3 text-left">สถานะ</th>
                <th className="px-6 py-3 text-left">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-6 py-4">#{booking.id}</td>
                  <td className="px-6 py-4">{booking.user_name}</td>
                  <td className="px-6 py-4">
                    {booking.brand} {booking.model}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(booking.start_date).toLocaleDateString('th-TH')} -{' '}
                    {new Date(booking.end_date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">฿{booking.total_price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => confirmBooking(booking.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        ยืนยัน
                      </button>
                    )}
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


