import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, isAuthenticated, initializing, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
        AI Write
      </Link>

      <div className="flex items-center gap-4">
        {initializing ? (
          <span className="text-sm text-gray-400">加载中...</span>
        ) : isAuthenticated && user ? (
          <>
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              文档列表
            </Link>
            <span className="text-sm text-gray-400">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              退出登录
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
