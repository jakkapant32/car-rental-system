import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900 tracking-tight">
              CarRental
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/vehicles" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              รถทั้งหมด
            </Link>
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


