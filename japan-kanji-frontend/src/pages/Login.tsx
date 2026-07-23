import { useState } from "react";
import type { FormEvent, Dispatch, SetStateAction, ChangeEvent } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập cả tên đăng nhập và mật khẩu.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });
      login(response.token, response.username, response.userId);
      navigate("/"); // Redirect to home/dashboard
    } catch (err: any) {
      // Show persistent error
      if (err.response && err.response.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing again
  const handleInputChange = (setter: Dispatch<SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop"
          alt="Kyoto Japan"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <BookOpen size={48} className="mx-auto mb-6 text-red-400" />
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Chinh phục Hán tự
          </h2>
          <p className="text-lg text-neutral-300">
            Học, ôn tập và theo dõi tiến độ của bạn qua hàng nghìn chữ Hán thiết yếu với hệ thống lặp lại ngắt quãng.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Đăng nhập</h1>
            <p className="text-neutral-500 mt-2">Chào mừng bạn quay lại Japan Kanji</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50/50 border border-red-200 text-red-600 text-sm flex items-center animate-[shake_0.5s_ease-in-out]">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={handleInputChange(setUsername)}
                className={`w-full px-0 py-2 border-b-2 bg-transparent ${error ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'} focus:outline-none transition-colors rounded-none`}
                placeholder="Nhập tên đăng nhập"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2 mt-6">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                className={`w-full px-0 py-2 border-b-2 bg-transparent ${error ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'} focus:outline-none transition-colors rounded-none`}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-medium mt-6 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-neutral-500">
            Chưa có tài khoản? <Link to="/signup" className="text-neutral-900 font-semibold underline underline-offset-2">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
