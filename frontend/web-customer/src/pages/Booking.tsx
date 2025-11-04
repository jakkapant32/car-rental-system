import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays } from 'date-fns';

export default function Booking() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [pickupLocation, setPickupLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const res = await axiosInstance.get(`/api/vehicles/${vehicleId}`);
      setVehicle(res.data.vehicle);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post('/api/bookings', {
        vehicle_id: parseInt(vehicleId!),
        start_date: startDate,
        end_date: endDate,
        pickup_location: pickupLocation,
      });

      // Redirect to payment
      navigate(`/booking/${res.data.booking.id}/payment`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return <div className="text-center py-12">กำลังโหลด...</div>;

  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const totalPrice = vehicle.daily_price * days;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">จองรถ</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="text-gray-600">฿{vehicle.daily_price}/วัน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">วันที่เริ่มเช่า</label>
            <input
              type="date"
              className="w-full border rounded-lg px-4 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">วันที่คืน</label>
            <input
              type="date"
              className="w-full border rounded-lg px-4 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">สถานที่รับรถ</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="ที่อยู่หรือสถานที่"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>ราคาต่อวัน</span>
              <span>฿{vehicle.daily_price}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>จำนวนวัน</span>
              <span>{days} วัน</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>ยอดรวม</span>
              <span className="text-blue-600">฿{totalPrice}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
          </button>
        </form>
      </div>
    </div>
  );
}


