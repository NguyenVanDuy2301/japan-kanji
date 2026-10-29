import { useState } from "react";
import type { FormEvent, Dispatch, SetStateAction, ChangeEvent } from "react";
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d)/.test(password);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Mật khẩu phải dài tối thiểu 8 ký tự, bao gồm cả chữ và số.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await authService.register({
        username,
        email,
        password,
      });
      login(response.token, response.username, response.userId, response.role);
      navigate("/");
    } catch (err: any) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          setError(data);
        } else if (data.error) {
          setError(data.error);
        } else {
          const firstError = Object.values(data)[0] as string;
          setError(
            firstError || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
          );
        }
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
          src="https://images.unsplash.com/photo-1522850959516-58f958dde2c1?q=80&w=2070&auto=format&fit=crop"
          alt="Tokyo Japan"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-3)] via-[var(--color-surface-1)]/60 to-transparent" />

        <span
          aria-hidden="true"
          className="absolute -right-12 -bottom-16 font-serif text-[320px] font-bold text-white/[0.04] leading-none select-none pointer-events-none"
        >
          道
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
            Khởi đầu hành trình Hán tự.
          </h2>
          <p className="text-base text-[var(--color-ink-inverse-2)] leading-relaxed">
            Tạo bộ bài riêng, tra cứu nét viết trực quan và sưu tầm ấn chương
            thành tựu từ N5 đến N1.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto washi-grid">
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

          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink-1)] tracking-tight">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm text-[var(--color-ink-2)] mt-1.5">
              Bắt đầu học và lưu trữ tiến độ Kanji hoàn toàn miễn phí.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
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
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)] bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-sm font-medium placeholder:text-[var(--color-ink-3)] focus:outline-none transition-colors"
                placeholder="vd: nguyenvana"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)] bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-sm font-medium placeholder:text-[var(--color-ink-3)] focus:outline-none transition-colors"
                placeholder="ban@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)] bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-sm font-medium placeholder:text-[var(--color-ink-3)] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={handleInputChange(setConfirmPassword)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)] bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-sm font-medium placeholder:text-[var(--color-ink-3)] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Password hints */}
            {password.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    hasMinLength
                      ? "text-[var(--color-emerald-1)]"
                      : "text-[var(--color-ink-3)]"
                  }`}
                >
                  <CheckCircle2 size={13} /> Tối thiểu 8 ký tự
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    hasLetterAndNumber
                      ? "text-[var(--color-emerald-1)]"
                      : "text-[var(--color-ink-3)]"
                  }`}
                >
                  <CheckCircle2 size={13} /> Có cả chữ và số
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-[var(--color-paper-1)] font-semibold text-sm mt-3 transition-colors shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký tài khoản</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 hairline-t text-center text-sm text-[var(--color-ink-2)]">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-[var(--color-accent-1)] font-bold hover:underline underline-offset-4"
            >
              Đăng nhập
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
