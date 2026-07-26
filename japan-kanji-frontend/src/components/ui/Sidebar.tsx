import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Compass,
  Settings,
  User as UserIcon,
  LogOut,
} from "lucide-react";
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
  }, [user]);

  const navItems = [
    { name: "Tổng quan", path: "/", icon: LayoutDashboard },
    { name: "Tra cứu", path: "/kanji", icon: Search },
    {
      name: "Ôn tập thông minh",
      path: "/study/review",
      icon: Compass,
      badge: dueReviewsCount > 0 ? dueReviewsCount : null,
    },
  ];

  if (isAdmin) {
    navItems.push({
      name: "Quản lý Hán tự",
      path: "/admin/kanji",
      icon: Settings,
      badge: null,
    });
  }

  return (
    <aside className="w-64 flex-shrink-0 hairline-r bg-[var(--color-paper-1)] flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6">
        <Link
          to="/"
          className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-sm bg-[var(--color-accent-1)] text-[var(--color-paper-1)] flex items-center justify-center font-serif font-bold text-lg">
            漢
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--color-ink-1)]">
            Japan Kanji
          </span>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-neutral-100 text-[var(--color-ink-1)]"
                    : "text-[var(--color-ink-2)] hover:bg-neutral-50 hover:text-[var(--color-ink-1)]"
                )}
              >
                <Icon size={18} /> {item.name}
                {item.badge && (
                  <span className="ml-auto bg-[var(--color-accent-1)] text-[var(--color-paper-1)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 hairline-t mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
            <UserIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--color-ink-1)] truncate">
              {user?.username || "Guest"}
            </p>
            <p className="text-xs text-[var(--color-ink-2)] truncate">
              Vai trò: {user?.role || "-"}
            </p>
          </div>
          {user && (
            <button
              onClick={logout}
              className="p-1.5 text-[var(--color-ink-2)] hover:text-[var(--color-accent-1)] transition-colors flex-shrink-0"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
