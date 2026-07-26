/* Hallmark · component: DeckCard · genre: modern-minimal · theme: catalog
 * states: default · hover · focus-visible · active
 * contrast: pass
 */
import {
  BookOpen,
  Folder,
  Layers,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
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

  return (
    <div className="group relative bg-[var(--color-paper-1)] border border-[oklch(0.90_0.01_250)] p-4 sm:p-5 hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4 focus-within:ring-2 focus-within:ring-[var(--color-accent-1)] focus-within:ring-offset-2">
      {/* Left side: Icon + Text */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`p-3 ${type === "official" ? "bg-[oklch(0.95_0.10_25)] text-[var(--color-accent-1)]" : type === "custom" ? "bg-[var(--color-paper-3)] text-[var(--color-ink-1)]" : "bg-[oklch(0.95_0.05_250)] text-[var(--color-ink-1)]"} transition-transform group-hover:scale-105 shrink-0`}
        >
          {type === "official" ? <BookOpen size={24} /> : <Folder size={24} />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[var(--color-ink-1)] group-hover:text-[var(--color-accent-1)] transition-colors truncate">
            {deck.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-2)] mt-1 truncate">
            <Layers size={14} className="shrink-0" />
            <span className="font-medium shrink-0">
              {deck.vocabularyCount} từ
            </span>
            <span className="opacity-40 mx-1 shrink-0">•</span>
            <span className="truncate">
              {deck.description || "Chưa có mô tả"}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Button + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStudy?.();
          }}
          className="bg-[var(--color-paper-2)] border border-[oklch(0.90_0.01_250)] text-[var(--color-ink-1)] font-bold px-4 py-2 transition-all duration-200 flex items-center justify-center group/btn shadow-sm hover:shadow-md hover:bg-[var(--color-accent-1)] hover:text-[var(--color-paper-1)] hover:border-[var(--color-accent-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-1)] active:scale-[0.98] cursor-pointer text-sm"
        >
          Học
          <ChevronRight
            size={16}
            className="ml-1 transform group-hover/btn:translate-x-0.5 transition-transform"
          />
        </button>

        {actions && (
          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-2)] active:scale-95 cursor-pointer"
              aria-label="Menu tuỳ chọn"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-paper-1)]/95 backdrop-blur-xl shadow-xl border border-[oklch(0.90_0.01_250)] z-20 animate-in fade-in zoom-in duration-200">
                <div
                  className="flex flex-col p-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {actions}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
