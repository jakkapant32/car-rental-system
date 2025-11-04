import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axios';

interface Vehicle {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  daily_price: number;
  status: string;
  images: string[];
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await axiosInstance.get(`/api/vehicles?${params}`);
      setVehicles(res.data.vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">กำลังโหลด...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">รถยนต์ทั้งหมด</h1>
        <p className="text-gray-600">ค้นหาและเลือกรถยนต์ที่คุณต้องการ</p>
      </div>

      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="ค้นหารถ..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">ทุกสถานะ</option>
          <option value="available">พร้อมให้เช่า</option>
          <option value="reserved">ถูกจอง</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            to={`/vehicles/${vehicle.id}`}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all"
          >
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={vehicle.model}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">ไม่มีรูปภาพ</span>
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-600 mb-3">ปี {vehicle.year} • {vehicle.plate_number}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  ฿{vehicle.daily_price.toLocaleString()}
                  <span className="text-base font-normal text-gray-600">/วัน</span>
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {vehicle.status === 'available' ? 'พร้อมให้เช่า' : 'ถูกจอง'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">ไม่พบรถที่ค้นหา</p>
        </div>
      )}
    </div>
  );
}


