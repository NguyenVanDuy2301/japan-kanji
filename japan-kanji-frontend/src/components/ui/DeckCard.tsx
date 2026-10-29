import {
  BookOpen,
  Folder,
  Layers,
  MoreVertical,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DeckResponse } from "../../services/deck.service";
import { useState, useRef, useEffect } from "react";

interface DeckCardVariantProps {
  deck: DeckResponse;
  type: "official" | "custom" | "saved";
  actions?: React.ReactNode;
  onStudy?: () => void;
}

export default function DeckCard({
  deck,
  type,
  actions,
  onStudy,
}: DeckCardVariantProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const iconBadgeStyle =
    type === "official"
      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-1)] border-[var(--color-accent-1)]/20"
      : type === "custom"
        ? "bg-[var(--color-paper-2)] text-[var(--color-ink-1)] border-[var(--color-border-subtle)]"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      onClick={() => onStudy?.()}
      className="group relative bg-[var(--color-paper-1)] rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-colors duration-200 flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-[var(--color-accent-1)] focus-within:ring-offset-2"
    >
      {/* Left side: Icon + Text */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0 ${iconBadgeStyle}`}
        >
          {type === "official" ? (
            <BookOpen size={22} />
          ) : type === "saved" ? (
            <Bookmark size={22} />
          ) : (
            <Folder size={22} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--color-ink-1)] group-hover:text-[var(--color-accent-1)] transition-colors truncate">
              {deck.title}
            </h3>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] mt-0.5 truncate">
            {deck.description || "Bộ thẻ học từ vựng và Hán tự"}
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-ink-2)] bg-[var(--color-paper-2)] px-2 py-0.5 rounded-md mt-2">
            <Layers
              size={12}
              className="text-[var(--color-accent-1)] shrink-0"
            />
            <span className="tabular-nums">{deck.vocabularyCount} từ vựng</span>
          </div>
        </div>
      </div>

      {/* Right side: Button + Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStudy?.();
          }}
          className="bg-[var(--color-ink-1)] group-hover:bg-[var(--color-accent-1)] text-[var(--color-paper-1)] font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1 shadow-xs active:scale-[0.97] cursor-pointer text-xs"
        >
          <span>Vào học</span>
          <ChevronRight
            size={15}
            className="transform group-hover:translate-x-0.5 transition-transform"
          />
        </button>

        {actions && (
          <div
            className="relative flex items-center"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink-1)] active:scale-95 cursor-pointer"
              aria-label="Menu tuỳ chọn"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-panel bg-[var(--color-paper-1)]/95 rounded-xl shadow-[var(--shadow-elevated)] border border-[var(--color-border-subtle)] z-20 overflow-hidden"
                >
                  <div
                    className="flex flex-col p-1.5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {actions}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
