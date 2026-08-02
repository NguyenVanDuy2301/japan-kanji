import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, CheckCircle2, RefreshCw } from "lucide-react";
import { studyService } from "../services/study.service";
import { deckService } from "../services/deck.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/Skeleton";
import clsx from "clsx";

export default function LessonSession() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
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

        // Check if deck is saved
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [deckId]);

  const handleToggleSave = async () => {
    if (!deckId || isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await deckService.unsaveDeck(Number(deckId));
        setIsSaved(false);
      } else {
        await deckService.saveDeck(Number(deckId));
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save deck:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
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
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading || mode === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full flex-1 flex flex-col min-h-[600px] bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-neutral-200">
          <Skeleton className="h-6 w-32 mb-8 mx-auto" />
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-32 w-32 md:h-48 md:w-48 rounded-2xl" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-paper-1)] rounded-3xl p-10 text-center shadow-2xl border border-[oklch(0.90_0.01_250)]">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-ink-1)] mb-2">
            Bộ bài trống!
          </h2>
          <p className="text-[var(--color-ink-2)] mb-8">
            Bộ bài này chưa có từ vựng nào. Hãy thêm từ vựng trước khi học.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-4 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] text-[var(--color-ink-inverse-1)] font-bold rounded-xl transition-colors"
          >
            Quay về Tổng quan
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-paper-1)] rounded-3xl p-10 text-center shadow-2xl border border-[oklch(0.90_0.01_250)]">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-ink-1)] mb-2">
            Hoàn Thành {mode === "practice" ? "Luyện Tập" : "Bài Học"}!
          </h2>
          <p className="text-[var(--color-ink-2)] mb-8">
            Bạn đã học {vocabularies.length} chữ Kanji hôm nay. Làm tốt lắm!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsAnswerRevealed(false);
                setIsFinished(false);
              }}
              className="w-full px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-[var(--color-ink-1)] font-bold rounded-xl transition-colors"
            >
              Học lại từ đầu
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-4 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] text-[var(--color-ink-inverse-1)] font-bold rounded-xl transition-colors"
            >
              Quay về Tổng quan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = (currentIndex / vocabularies.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col font-sans">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-[var(--color-ink-inverse-2)] hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex-1 max-w-md mx-6 flex items-center gap-4">
          <div className="h-1.5 flex-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent-1)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-inverse-2)] tracking-wider">
            {currentIndex + 1}/{vocabularies.length}
          </span>
        </div>

        <button
          onClick={handleToggleSave}
          disabled={isSaving}
          className={clsx(
            "p-2 transition-colors focus:outline-none",
            isSaved
              ? "text-[var(--color-accent-1)]"
              : "text-[var(--color-ink-inverse-2)] hover:text-white"
          )}
        >
          <Bookmark size={24} className={isSaved ? "fill-current" : ""} />
        </button>
      </header>

      {/* Main Content Area */}
      <main
        className="flex-1 flex flex-col items-center justify-center p-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <motion.div
          layout
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] min-h-[500px] bg-[var(--color-paper-1)] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[oklch(0.90_0.01_250)] cursor-default"
        >
          {/* Top Wrapper for Kanji and Details */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Top: Kanji Display */}
            <motion.div
              layout
              className="p-10 flex flex-col items-center text-center bg-[var(--color-paper-1)] relative z-10"
            >
              <h3 className="text-[10px] font-bold text-[var(--color-accent-1)] uppercase tracking-[0.2em] mb-4">
                {mode === "practice" ? "Luyện Tập" : "Bài Học Mới"}
              </h3>
              <motion.h1
                layout="position"
                className={clsx(
                  "font-serif font-bold text-[var(--color-ink-1)] leading-none transition-all duration-500",
                  isAnswerRevealed ? "text-[80px]" : "text-[140px] my-6"
                )}
              >
                {currentVocab.kanji}
              </motion.h1>
            </motion.div>

            {/* Middle: Details (Snap up on reveal) */}
            <AnimatePresence>
              {isAnswerRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="px-10 pb-10 text-center relative z-0 origin-top"
                >
                  <div className="space-y-6 pt-4 border-t border-[oklch(0.95_0.01_250)]">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1">
                        Ý nghĩa
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-ink-1)]">
                        {currentVocab.meaning}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1">
                        Âm Hán Việt
                      </p>
                      <p className="text-lg font-serif text-[var(--color-accent-1)]">
                        {currentVocab.hanViet}
                      </p>
                    </div>
                    <div className="flex justify-center gap-10 pt-4 hairline-t text-left">
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1">
                          Onyomi
                        </span>
                        <span className="font-medium text-[var(--color-ink-1)]">
                          {currentVocab.onyomi || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1">
                          Kunyomi
                        </span>
                        <span className="font-medium text-[var(--color-ink-1)]">
                          {currentVocab.kunyomi || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom: Controls */}
          <div className="p-6 bg-[oklch(0.97_0.01_250)] border-t border-[oklch(0.90_0.01_250)] mt-auto">
            <AnimatePresence mode="wait">
              {!isAnswerRevealed ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={() => setIsAnswerRevealed(true)}
                    className="w-full py-4 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] text-[var(--color-ink-inverse-1)] font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Xem Đáp Án{" "}
                    <RefreshCw
                      size={18}
                      className="text-[var(--color-ink-inverse-2)]"
                    />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="next"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-base rounded-xl transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                  >
                    Đã ghi nhớ (Enter) <CheckCircle2 size={20} />
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
