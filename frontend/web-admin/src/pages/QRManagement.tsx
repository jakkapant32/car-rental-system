import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export default function QRManagement() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/qr-logs');
      setLogs(res.data.logs);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">QR Code Logs</h1>

      {loading ? (
        <div className="text-center py-12">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">เวลา</th>
                <th className="px-6 py-3 text-left">QR Code</th>
                <th className="px-6 py-3 text-left">รถ</th>
                <th className="px-6 py-3 text-left">ประเภท</th>
                <th className="px-6 py-3 text-left">สแกนโดย</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-6 py-4">
                    {new Date(log.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4">{log.qr_code_value}</td>
                  <td className="px-6 py-4">
                    {log.brand} {log.model} ({log.plate_number})
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        log.scan_type === 'check-in'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {log.scan_type === 'check-in' ? 'เช็คอิน' : 'เช็คเอาท์'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{log.scanned_by_name || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


