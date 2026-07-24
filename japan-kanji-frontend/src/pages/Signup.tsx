import { useState } from "react";
import type { FormEvent, Dispatch, SetStateAction, ChangeEvent } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await authService.register({ username, email, password });
      login(response.token, response.username, response.userId, response.role);
      navigate("/"); // Redirect to home/dashboard
    } catch (err: any) {
      // Show persistent error
      if (err.response && err.response.data && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else if (err.response && err.response.status === 400) {
        setError("Dữ liệu không hợp lệ. Tên đăng nhập hoặc email có thể đã tồn tại.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter: Dispatch<SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522850959516-58f958dde2c1?q=80&w=2070&auto=format&fit=crop"
          alt="Tokyo Japan"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <BookOpen size={48} className="mx-auto mb-6 text-red-400" />
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Bắt Đầu Hành Trình
          </h2>
          <p className="text-lg text-neutral-300">
            Tham gia cùng hàng nghìn học viên chinh phục Kanji với hệ thống lặp lại ngắt quãng. Tạo tài khoản miễn phí ngay hôm nay.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Tạo tài khoản</h1>
            <p className="text-neutral-500 mt-2">Bắt đầu học Kanji hoàn toàn miễn phí.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
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
                disabled={isLoading}
                className={`w-full px-0 py-2 border-b-2 bg-transparent ${error ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'} focus:outline-none transition-colors rounded-none`}
                placeholder="johndoe123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2 mt-4">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                disabled={isLoading}
                className={`w-full px-0 py-2 border-b-2 bg-transparent ${error ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'} focus:outline-none transition-colors rounded-none`}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  disabled={isLoading}
                  className={`w-full px-0 py-2 border-b-2 bg-transparent ${error ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'} focus:outline-none transition-colors rounded-none`}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={handleInputChange(setConfirmPassword)}
                  disabled={isLoading}
                  className={`w-full px-0 py-2 border-b-2 bg-transparent ${error ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'} focus:outline-none transition-colors rounded-none`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-medium mt-8 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-neutral-500">
            Đã có tài khoản? <Link to="/login" className="text-neutral-900 font-semibold underline underline-offset-2">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
