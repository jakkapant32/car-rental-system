import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

interface Vehicle {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  seats: number;
  transmission: string;
  fuel_type: string;
  daily_price: number;
  status: string;
  images: string[];
}

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await axiosInstance.get(`/api/vehicles/${id}`);
      setVehicle(res.data.vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">กำลังโหลด...</div>;
  if (!vehicle) return <div className="text-center py-12">ไม่พบรถ</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={vehicle.model}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xl">ไม่มีรูปภาพ</span>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">
            {vehicle.brand} {vehicle.model}
          </h1>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">รายละเอียด</h3>
              <ul className="space-y-2 text-gray-600">
                <li>ปี: {vehicle.year}</li>
                <li>ป้ายทะเบียน: {vehicle.plate_number}</li>
                {vehicle.category && <li>ประเภท: {vehicle.category}</li>}
                {vehicle.seats && <li>จำนวนที่นั่ง: {vehicle.seats}</li>}
                {vehicle.transmission && <li>เกียร์: {vehicle.transmission}</li>}
                {vehicle.fuel_type && <li>เชื้อเพลิง: {vehicle.fuel_type}</li>}
              </ul>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                ฿{vehicle.daily_price}/วัน
              </div>
              <span
                className={`inline-block px-3 py-1 rounded ${
                  vehicle.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {vehicle.status === 'available' ? 'พร้อมให้เช่า' : 'ถูกจอง'}
              </span>
            </div>
          </div>

          {vehicle.status === 'available' && (
            <Link
              to={`/booking/${vehicle.id}`}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              {user ? 'จองรถ' : 'เข้าสู่ระบบเพื่อจอง'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


