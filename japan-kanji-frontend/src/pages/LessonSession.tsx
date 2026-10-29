import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { studyService } from "../services/study.service";
import { deckService } from "../services/deck.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/Skeleton";
import { Confetti } from "../components/ui/Confetti";
import { useToast } from "../components/ui/Toast";
import clsx from "clsx";

export default function LessonSession() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"new" | "practice" | "loading">("loading");

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        if (!deckId) return;

        const savedDecks = await deckService.getSavedDecks();
        setIsSaved(savedDecks.some((d) => d.id === Number(deckId)));

        let data = await studyService.getLessons(Number(deckId), 10);

        if (data.length > 0) {
          setMode("new");
        } else {
          data = await studyService.getPractice(Number(deckId));
          setMode("practice");
        }

        setVocabularies(data);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        toast("Không thể tải dữ liệu bài học.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [deckId, toast]);

  const handleToggleSave = async () => {
    if (!deckId || isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await deckService.unsaveDeck(Number(deckId));
        setIsSaved(false);
        toast("Đã bỏ lưu bộ bài khỏi tủ sách.", "info");
      } else {
        await deckService.saveDeck(Number(deckId));
        setIsSaved(true);
        toast("Đã lưu bộ bài vào Tủ sách của bạn!");
      }
    } catch (error) {
      console.error("Failed to toggle save deck:", error);
      toast("Không thể cập nhật trạng thái lưu bộ bài.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = useCallback(async () => {
    if (currentIndex < vocabularies.length && mode === "new") {
      const currentVocab = vocabularies[currentIndex];
      try {
        await studyService.submitReview(currentVocab.id, 4);
      } catch (error) {
        console.error("Failed to submit review:", error);
      }
    }

    if (currentIndex < vocabularies.length - 1) {
      setIsAnswerRevealed(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 140);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, vocabularies, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || isFinished || vocabularies.length === 0) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (!isAnswerRevealed) {
          setIsAnswerRevealed(true);
        } else {
          handleNext();
        }
      } else if (e.key === "Escape") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLoading,
    isFinished,
    vocabularies.length,
    isAnswerRevealed,
    handleNext,
    navigate,
  ]);

  if (isLoading || mode === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full flex flex-col min-h-[520px] bg-[var(--color-paper-1)] rounded-2xl shadow-[var(--shadow-elevated)] p-8 border border-[var(--color-border-subtle)]">
          <Skeleton className="h-5 w-32 mb-8 mx-auto" />
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-36 w-36 rounded-2xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[var(--color-paper-1)] rounded-2xl p-10 text-center shadow-[var(--shadow-elevated)] border border-[var(--color-border-subtle)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-paper-2)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-border-subtle)]">
            <CheckCircle2 size={32} className="text-[var(--color-ink-3)]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-ink-1)] mb-2">
            Bộ bài chưa có từ vựng
          </h2>
          <p className="text-sm text-[var(--color-ink-2)] mb-8">
            Hãy thêm chữ Hán vào bộ bài trước khi bắt đầu phiên học tập.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3.5 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Quay về Tổng quan
          </button>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <Confetti />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="max-w-md w-full bg-[var(--color-paper-1)] rounded-2xl p-10 text-center shadow-[var(--shadow-elevated)] border border-[var(--color-border-subtle)] relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={34} className="text-[var(--color-emerald-1)]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-ink-1)] mb-2">
            Hoàn Thành {mode === "practice" ? "Luyện Tập" : "Bài Học"}!
          </h2>
          <p className="text-sm text-[var(--color-ink-2)] mb-8">
            Bạn đã hoàn thành{" "}
            <strong className="text-[var(--color-ink-1)] tabular-nums">
              {vocabularies.length}
            </strong>{" "}
            chữ Kanji trong phiên này. Tuyệt vời lắm!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsAnswerRevealed(false);
                setIsFinished(false);
              }}
              className="w-full px-6 py-3.5 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink-1)] font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Học lại từ đầu</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3.5 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Quay về Tổng quan
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = ((currentIndex + 1) / vocabularies.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col font-sans select-none">
      {/* Top Studio Bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
        <button
          onClick={() => navigate("/")}
          className="p-2.5 rounded-xl text-[var(--color-ink-inverse-2)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Quay lại (Esc)"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 max-w-md mx-6 flex items-center gap-4">
          <div className="h-2 flex-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-accent-1)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
            />
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-inverse-2)] tabular-nums">
            {currentIndex + 1} / {vocabularies.length}
          </span>
        </div>

        <button
          onClick={handleToggleSave}
          disabled={isSaving}
          title={isSaved ? "Bỏ lưu bộ bài" : "Lưu bộ bài vào Tủ sách"}
          className={clsx(
            "p-2.5 rounded-xl transition-colors focus:outline-none cursor-pointer",
            isSaved
              ? "text-[var(--color-accent-1)] bg-white/10"
              : "text-[var(--color-ink-inverse-2)] hover:text-white hover:bg-white/10"
          )}
        >
          <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
        </button>
      </header>

      {/* Main Flashcard Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          key={currentVocab.id}
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="w-full max-w-[420px] min-h-[520px] bg-[var(--color-paper-1)] rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden flex flex-col border border-[var(--color-border-subtle)]"
        >
          <div className="flex-1 flex flex-col justify-center">
            {/* Top: Kanji Display on Practice Grid */}
            <motion.div
              layout
              onClick={() => !isAnswerRevealed && setIsAnswerRevealed(true)}
              className={clsx(
                "p-8 flex flex-col items-center text-center relative z-10",
                !isAnswerRevealed &&
                  "kanji-practice-grid flex-1 justify-center cursor-pointer"
              )}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-1)] text-xs font-bold mb-3">
                <span>
                  {mode === "practice" ? "Chế độ Luyện tập" : "Bài học từ mới"}
                </span>
                {currentVocab.jlptLevel && (
                  <span className="opacity-75">• {currentVocab.jlptLevel}</span>
                )}
              </div>

              <motion.h1
                layout="position"
                className={clsx(
                  "font-serif font-bold text-[var(--color-ink-1)] leading-none transition-all duration-300",
                  isAnswerRevealed ? "text-[84px] my-2" : "text-[136px] my-6"
                )}
              >
                {currentVocab.kanji}
              </motion.h1>
            </motion.div>

            {/* Middle: Revealed Answer Details */}
            <AnimatePresence>
              {isAnswerRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="px-8 pb-8 text-center relative z-0 origin-top"
                >
                  <div className="space-y-5 pt-5 hairline-t">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink-3)] mb-1">
                        Nghĩa tiếng Việt
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-ink-1)]">
                        {currentVocab.meaning}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink-3)] mb-1">
                        Âm Hán Việt
                      </p>
                      <p className="text-xl font-serif font-bold text-[var(--color-accent-1)]">
                        {currentVocab.hanViet || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-0.5">
                          Âm Onyomi
                        </span>
                        <span className="font-bold text-sm text-[var(--color-ink-1)]">
                          {currentVocab.onyomi || "—"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-0.5">
                          Âm Kunyomi
                        </span>
                        <span className="font-bold text-sm text-[var(--color-ink-1)]">
                          {currentVocab.kunyomi || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Controls */}
          <div className="p-5 bg-[var(--color-paper-2)] hairline-t mt-auto">
            <AnimatePresence mode="wait">
              {!isAnswerRevealed ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={() => setIsAnswerRevealed(true)}
                    className="w-full py-3.5 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <RefreshCw size={16} />
                    <span>Lật xem đáp án (Space)</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="next"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 bg-[var(--color-emerald-1)] hover:opacity-95 text-white font-semibold text-sm rounded-xl transition-opacity shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <CheckCircle2 size={18} />
                    <span>Đã ghi nhớ — Tiếp tục (Space)</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
