import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            เช่ารถออนไลน์
            <span className="block text-gray-600 font-normal mt-2">ง่าย สะดวก รวดเร็ว</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            ค้นหาและจองรถยนต์ที่คุณต้องการได้ทันที พร้อมบริการครบวงจร
          </p>
          <Link
            to="/vehicles"
            className="inline-block bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
          >
            เริ่มค้นหารถ
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ค้นหาได้ง่าย</h3>
            <p className="text-gray-600 leading-relaxed">ค้นหารถที่ต้องการจากหลายรุ่นหลายยี่ห้อด้วยระบบค้นหาที่ทันสมัย</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ชำระเงินออนไลน์</h3>
            <p className="text-gray-600 leading-relaxed">ชำระเงินได้ทันทีผ่านระบบออนไลน์ที่ปลอดภัยและเชื่อถือได้</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">จัดการผ่าน QR Code</h3>
            <p className="text-gray-600 leading-relaxed">รับ-คืนรถง่ายด้วยระบบ QR Code ที่สะดวกและรวดเร็ว</p>
          </div>
        </div>
      </section>
    </div>
  );
}


