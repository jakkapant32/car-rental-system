import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

interface Booking {
  id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  brand: string;
  model: string;
  plate_number: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/api/bookings/my-bookings');
      setBookings(res.data.bookings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'รอยืนยัน',
      confirmed: 'ยืนยันแล้ว',
      cancelled: 'ยกเลิก',
      completed: 'เสร็จสิ้น',
    };
    return statusMap[status] || status;
  };

  if (!user) return <div className="text-center py-12">กรุณาเข้าสู่ระบบ</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">โปรไฟล์ของฉัน</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลส่วนตัว</h2>
        <div className="space-y-2">
          <p><strong>ชื่อ:</strong> {user.name}</p>
          <p><strong>อีเมล:</strong> {user.email}</p>
          <p><strong>บทบาท:</strong> {user.role}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">ประวัติการจอง</h2>

        {loading ? (
          <div className="text-center py-8">กำลังโหลด...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">ยังไม่มีการจอง</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">
                      {booking.brand} {booking.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {booking.plate_number}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      booking.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>วันที่: {new Date(booking.start_date).toLocaleDateString('th-TH')} - {new Date(booking.end_date).toLocaleDateString('th-TH')}</p>
                  <p className="mt-1">ยอดรวม: ฿{booking.total_price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


