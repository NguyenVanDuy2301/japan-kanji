import { useState } from "react";
import type { FormEvent, Dispatch, SetStateAction, ChangeEvent } from "react";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });
      login(response.token, response.username, response.userId, response.role);
      navigate("/");
    } catch (err: any) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (setter: Dispatch<SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError("");
    };

  return (
    <div className="min-h-screen flex bg-[var(--color-paper-2)] font-sans">
      {/* Left Panel - Japanese Editorial Showcase */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-surface-1)] relative items-center justify-center overflow-hidden p-16">
        <img
          src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop"
          alt="Kyoto Japan"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-3)] via-[var(--color-surface-1)]/60 to-transparent" />

        {/* Large Decorative Kanji Watermark */}
        <span
          aria-hidden="true"
          className="absolute -right-12 -bottom-16 font-serif text-[320px] font-bold text-white/[0.04] leading-none select-none pointer-events-none"
        >
          字
        </span>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md text-left"
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-1)] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-lg">
              漢
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--color-ink-inverse-1)]">
              Japan Kanji
            </span>
          </div>

          <h2 className="font-serif text-4xl xl:text-5xl font-bold tracking-tight text-[var(--color-ink-inverse-1)] leading-[1.15] mb-5">
            Chinh phục Hán tự mỗi ngày.
          </h2>
          <p className="text-base text-[var(--color-ink-inverse-2)] leading-relaxed">
            Ghi nhớ sâu âm Hán Việt, Onyomi, Kunyomi và thứ tự nét viết thông
            qua phương pháp lặp lại ngắt quãng SM-2.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 washi-grid">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-md bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-elevated)]"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-1)] text-white flex items-center justify-center font-serif font-bold text-lg">
              漢
            </div>
            <span className="text-lg font-extrabold text-[var(--color-ink-1)]">
              Japan Kanji
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink-1)] tracking-tight">
              Đăng nhập
            </h1>
            <p className="text-sm text-[var(--color-ink-2)] mt-1.5">
              Chào mừng bạn quay lại không gian học tập Hán tự.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent-1)]/30 text-[var(--color-accent-1)] text-sm font-medium flex items-center gap-2.5 animate-[shake_0.45s_ease-in-out]">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={handleInputChange(setUsername)}
                className={`w-full px-4 py-3 rounded-xl border bg-[var(--color-paper-2)] text-[var(--color-ink-1)] text-sm font-medium placeholder:text-[var(--color-ink-3)] ${
                  error
                    ? "border-[var(--color-accent-1)] focus:border-[var(--color-accent-1)]"
                    : "border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)]"
                } focus:bg-[var(--color-paper-1)] focus:outline-none transition-colors`}
                placeholder="Nhập tên đăng nhập"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                className={`w-full px-4 py-3 rounded-xl border bg-[var(--color-paper-2)] text-[var(--color-ink-1)] text-sm font-medium placeholder:text-[var(--color-ink-3)] ${
                  error
                    ? "border-[var(--color-accent-1)] focus:border-[var(--color-accent-1)]"
                    : "border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)]"
                } focus:bg-[var(--color-paper-1)] focus:outline-none transition-colors`}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-[var(--color-paper-1)] font-semibold text-sm mt-2 transition-colors shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 hairline-t text-center text-sm text-[var(--color-ink-2)]">
            Chưa có tài khoản?{" "}
            <Link
              to="/signup"
              className="text-[var(--color-accent-1)] font-bold hover:underline underline-offset-4"
            >
              Đăng ký ngay
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
