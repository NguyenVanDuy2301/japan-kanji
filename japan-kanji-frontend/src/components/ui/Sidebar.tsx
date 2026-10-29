import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Compass,
  Settings,
  User as UserIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { studyService } from "../../services/study.service";
import clsx from "clsx";

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [dueReviewsCount, setDueReviewsCount] = useState(0);

  useEffect(() => {
    if (user) {
      studyService
        .getDueReviews()
        .then((data) => setDueReviewsCount(data.length))
        .catch((err) =>
          console.error("Failed to fetch due reviews for sidebar:", err)
        );
    }
  }, [user, location.pathname]);

  const navItems = [
    {
      name: "Tổng quan",
      shortName: "Tổng quan",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Từ điển Hán tự",
      shortName: "Tra cứu",
      path: "/kanji",
      icon: Search,
    },
    {
      name: "Ôn tập thông minh",
      shortName: "Ôn tập",
      path: "/study/review",
      icon: Compass,
      badge: dueReviewsCount > 0 ? dueReviewsCount : null,
    },
  ];

  if (isAdmin) {
    navItems.push({
      name: "Quản trị Hán tự",
      shortName: "Quản trị",
      path: "/admin/kanji",
      icon: Settings,
      badge: null,
    });
  }

  const checkActive = (path: string) =>
    location.pathname === path ||
    (path === "/" && location.pathname.startsWith("/decks/")) ||
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-68 flex-shrink-0 hairline-r bg-[var(--color-paper-1)] flex-col justify-between h-screen sticky top-0 select-none z-30">
        <div className="p-6">
          {/* Brand Header with Hanko Cinnabar Seal */}
          <Link
            to="/"
            className="group flex items-center gap-3.5 mb-10 focus-visible:outline-2 focus-visible:outline-[var(--color-accent-1)] rounded-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-1)] text-[var(--color-paper-1)] flex items-center justify-center font-serif font-bold text-xl shadow-sm group-hover:scale-105 group-hover:rotate-[-3deg] transition-transform duration-200">
              漢
            </div>
            <div>
              <span className="block text-lg font-extrabold tracking-tight text-[var(--color-ink-1)] leading-none">
                Japan Kanji
              </span>
              <span className="block text-[11px] font-medium text-[var(--color-ink-3)] mt-1">
                Học & Ôn tập Hán tự
              </span>
            </div>
          </Link>

          {/* Navigation Links with Spring Sliding Indicator */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = checkActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "relative flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200",
                    isActive
                      ? "text-[var(--color-ink-1)]"
                      : "text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-paper-2)]/70"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute inset-0 bg-[var(--color-paper-3)] border border-[var(--color-border-subtle)] rounded-xl -z-10"
                    />
                  )}
                  <Icon
                    size={18}
                    className={clsx(
                      "transition-colors",
                      isActive
                        ? "text-[var(--color-accent-1)]"
                        : "text-[var(--color-ink-2)]"
                    )}
                  />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[var(--color-accent-1)] text-[var(--color-paper-1)] text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Due Review Prompt inside Sidebar */}
          {dueReviewsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent-1)]/20"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent-1)] mb-1">
                <Sparkles size={14} />
                <span>Nhắc ôn tập SRS</span>
              </div>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed mb-3">
                Bạn có{" "}
                <strong className="text-[var(--color-ink-1)] tabular-nums">
                  {dueReviewsCount}
                </strong>{" "}
                chữ Hán đến hạn cần ôn tập hôm nay.
              </p>
              <Link
                to="/study/review"
                className="block w-full text-center py-2 px-3 rounded-lg bg-[var(--color-accent-1)] hover:bg-[var(--color-accent-2)] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Vào ôn tập ngay
              </Link>
            </motion.div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 m-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-ink-1)] text-[var(--color-paper-1)] flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
              {user?.username ? (
                user.username.charAt(0).toUpperCase()
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-ink-1)] truncate">
                {user?.username || "Khách"}
              </p>
              <p className="text-[11px] font-medium text-[var(--color-ink-2)] truncate">
                {user?.role === "ADMIN" ? "Quản trị viên" : "Học viên"}
              </p>
            </div>
            {user && (
              <button
                onClick={logout}
                className="p-2 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-accent-1)] hover:bg-[var(--color-paper-1)] transition-colors flex-shrink-0 cursor-pointer"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Top Header Bar */}
      <header className="lg:hidden sticky top-0 z-30 glass-panel hairline-b px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-1)] text-[var(--color-paper-1)] flex items-center justify-center font-serif font-bold text-base">
            漢
          </div>
          <span className="text-base font-extrabold tracking-tight text-[var(--color-ink-1)]">
            Japan Kanji
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-ink-2)] bg-[var(--color-paper-3)] px-2.5 py-1 rounded-full">
            {user?.username}
          </span>
          {user && (
            <button
              onClick={logout}
              className="p-2 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-accent-1)] transition-colors"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-panel hairline-t px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-semibold transition-colors",
                isActive
                  ? "text-[var(--color-accent-1)]"
                  : "text-[var(--color-ink-2)]"
              )}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[var(--color-accent-1)] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{item.shortName}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
