import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axiosInstance from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

export default function ScanQR() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanType, setScanType] = useState<'check-in' | 'check-out'>('check-in');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    try {
      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQRScan(decodedText);
          scanner.stop();
          setScanning(false);
        },
        () => {}
      );
      setScanning(true);
    } catch (error) {
      console.error('Error starting scan:', error);
      alert('ไม่สามารถเปิดกล้องได้');
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const handleQRScan = async (qrValue: string) => {
    try {
      // Get vehicle info
      const vehicleRes = await axiosInstance.get(`/api/qr/${qrValue}`);
      const vehicle = vehicleRes.data.vehicle;

      // Log scan
      const scanRes = await axiosInstance.post(`/api/qr/${qrValue}/scan`, {
        scan_type: scanType,
      });

      setResult({
        success: true,
        vehicle,
        message: `สแกน ${scanType === 'check-in' ? 'เช็คอิน' : 'เช็คเอาท์'} สำเร็จ`,
      });

      setTimeout(() => setResult(null), 5000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'เกิดข้อผิดพลาด',
      });
      setTimeout(() => setResult(null), 5000);
    }
  };

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">คุณไม่มีสิทธิ์เข้าถึง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">สแกน QR Code</h1>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setScanType('check-in')}
            className={`flex-1 py-2 rounded ${
              scanType === 'check-in'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            เช็คอิน
          </button>
          <button
            onClick={() => setScanType('check-out')}
            className={`flex-1 py-2 rounded ${
              scanType === 'check-out'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            เช็คเอาท์
          </button>
        </div>

        <div id="reader" className="mb-4"></div>

        {!scanning ? (
          <button
            onClick={startScan}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            เริ่มสแกน
          </button>
        ) : (
          <button
            onClick={stopScan}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
          >
            หยุดสแกน
          </button>
        )}

        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.success
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p className="font-semibold">{result.message}</p>
            {result.vehicle && (
              <div className="mt-2 text-sm">
                <p>รถ: {result.vehicle.brand} {result.vehicle.model}</p>
                <p>ป้ายทะเบียน: {result.vehicle.plate_number}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


