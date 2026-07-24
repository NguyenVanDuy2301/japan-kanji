import { BookOpen, LogOut, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="text-red-600" size={28} />
            <span className="text-xl font-bold tracking-tight text-neutral-900">Japan Kanji</span>
          </Link>
          
          <div className="h-6 w-px bg-neutral-300 hidden sm:block"></div>
          
          <Link 
            to="/kanji" 
            className="hidden sm:flex items-center gap-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Search size={18} />
            <span>Từ điển Kanji</span>
          </Link>

          {isAdmin && (
            <Link 
              to="/admin/kanji" 
              className="hidden sm:flex items-center gap-1.5 text-neutral-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <BookOpen size={18} />
              <span>Quản lý Hán tự</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-neutral-600 hidden sm:block">
            Xin chào, <span className="text-neutral-900 font-bold">{user?.username}</span>
          </div>
          <div className="h-6 w-px bg-neutral-300"></div>
          <button 
            onClick={logout}
            className="text-neutral-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
