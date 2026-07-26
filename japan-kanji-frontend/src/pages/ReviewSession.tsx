import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { studyService } from "../services/study.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function ReviewSession() {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Hybrid State
  const [inputValue, setInputValue] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [cardState, setCardState] = useState<
    "inputting" | "correct" | "failed" | "submitting"
  >("inputting");

  // Animation Triggers
  const [shakeKey, setShakeKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonGoodRef = useRef<HTMLButtonElement>(null);
  const buttonAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await studyService.getDueReviews();
        setVocabularies([...data].sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    setInputValue("");
    setWrongCount(0);
    setCardState("inputting");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIndex]);

  useEffect(() => {
    if (cardState === "correct") {
      setTimeout(() => buttonGoodRef.current?.focus(), 100);
    } else if (cardState === "failed") {
      setTimeout(() => buttonAgainRef.current?.focus(), 100);
    }
  }, [cardState]);

  const normalizeString = (str: string) => str.toLowerCase().trim();

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardState !== "inputting") return;
    if (!inputValue.trim()) return;

    const answer = normalizeString(inputValue);
    const currentVocab = vocabularies[currentIndex];

    const isCorrect =
      answer === normalizeString(currentVocab.onyomi || "") ||
      answer === normalizeString(currentVocab.kunyomi || "") ||
      answer === normalizeString(currentVocab.meaning || "");

    if (isCorrect) {
      setCardState("correct");
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      if (newCount >= 3) {
        setCardState("failed");
      } else {
        setShakeKey((prev) => prev + 1);
        setInputValue("");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleShowAnswer = () => {
    if (cardState === "inputting") {
      setCardState("failed");
    }
  };

  const handleSubmitQuality = async (quality: number) => {
    if (cardState === "submitting") return;
    setCardState("submitting");

    const currentVocab = vocabularies[currentIndex];
    try {
      await studyService.submitReview(currentVocab.id, quality);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }

    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-ink-inverse-2)] border-t-[var(--color-accent-1)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isFinished || vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-paper-1)] rounded-3xl p-10 text-center shadow-2xl border border-[oklch(0.90_0.01_250)]">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-ink-1)] mb-2">
            Đã hoàn tất
          </h2>
          <p className="text-[var(--color-ink-2)] mb-8">
            {vocabularies.length === 0
              ? "Bạn không có chữ Hán nào cần ôn tập hôm nay."
              : "Hoàn thành xuất sắc phiên ôn tập!"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-4 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] text-[var(--color-ink-inverse-1)] text-sm font-bold rounded-xl transition-colors"
          >
            Quay về Tổng quan
          </button>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = (currentIndex / vocabularies.length) * 100;
  const isAnswerRevealed =
    cardState === "correct" ||
    cardState === "failed" ||
    cardState === "submitting";

  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col font-sans">
      {/* Header */}
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
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-inverse-2)] tracking-wider">
            Còn {vocabularies.length - currentIndex}
          </span>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Main Content Area */}
      <main
        className="flex-1 flex flex-col items-center justify-center p-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <motion.div
          layout
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[440px] bg-[var(--color-paper-1)] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[oklch(0.90_0.01_250)] cursor-default"
        >
          {/* Top: Kanji Display */}
          <motion.div
            layout
            className="p-10 flex flex-col items-center text-center bg-[var(--color-paper-1)] relative z-10"
          >
            <h3
              className={clsx(
                "text-[10px] font-bold uppercase tracking-[0.2em] mb-4 transition-colors",
                wrongCount > 0 && !isAnswerRevealed
                  ? "text-red-500 animate-pulse"
                  : "text-[var(--color-accent-1)]"
              )}
            >
              {wrongCount > 0 && !isAnswerRevealed
                ? `Sai ${wrongCount}/3 lần`
                : "Ôn Tập Kanji"}
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

            <AnimatePresence>
              {isAnswerRevealed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={clsx(
                    "absolute top-6 right-6",
                    cardState === "correct" ? "text-green-500" : "text-red-500"
                  )}
                >
                  {cardState === "correct" ? (
                    <CheckCircle2 size={32} />
                  ) : (
                    <X size={32} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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

          {/* Bottom: Controls */}
          <div className="p-6 bg-[oklch(0.97_0.01_250)] border-t border-[oklch(0.90_0.01_250)]">
            <AnimatePresence mode="wait">
              {!isAnswerRevealed ? (
                <motion.div
                  key="input-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <form onSubmit={handleInputSubmit} className="relative">
                    <motion.div
                      key={shakeKey}
                      initial={false}
                      animate={shakeKey > 0 ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 10,
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Nhập cách đọc / ý nghĩa..."
                        className={clsx(
                          "w-full bg-white text-[var(--color-ink-1)] border-2 rounded-xl focus:outline-none py-4 px-5 text-base transition-colors font-medium shadow-sm",
                          wrongCount > 0
                            ? "border-red-400 bg-red-50 text-red-900 placeholder:text-red-300"
                            : "border-[oklch(0.90_0.01_250)] focus:border-[var(--color-accent-1)]"
                        )}
                      />
                    </motion.div>
                  </form>
                  <button
                    type="button"
                    onClick={handleShowAnswer}
                    className="mt-4 text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] text-xs font-bold uppercase tracking-wider transition-colors w-full text-center"
                  >
                    Không nhớ? Xem đáp án ngay
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="quality-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  {cardState === "correct" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSubmitQuality(0)}
                        className="py-3 bg-white text-[var(--color-ink-1)] text-sm font-bold border border-[oklch(0.90_0.01_250)] rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
                      >
                        Lại (Hard)
                      </button>
                      <button
                        onClick={() => handleSubmitQuality(3)}
                        className="py-3 bg-white text-[var(--color-ink-1)] text-sm font-bold border border-[oklch(0.90_0.01_250)] rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
                      >
                        Khó
                      </button>
                      <button
                        ref={buttonGoodRef}
                        onClick={() => handleSubmitQuality(4)}
                        className="col-span-2 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-base rounded-xl transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] focus:outline-none focus:ring-4 focus:ring-green-500/50"
                      >
                        Tốt (Enter)
                      </button>
                      <button
                        onClick={() => handleSubmitQuality(5)}
                        className="col-span-2 py-3 bg-white text-blue-600 text-sm font-bold border border-[oklch(0.90_0.01_250)] rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
                      >
                        Rất Dễ
                      </button>
                    </div>
                  ) : (
                    <button
                      ref={buttonAgainRef}
                      onClick={() => handleSubmitQuality(0)}
                      className="w-full py-5 bg-red-500 hover:bg-red-600 text-white font-bold text-base rounded-xl transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] focus:outline-none focus:ring-4 focus:ring-red-500/50"
                    >
                      Ôn Lại Lần Sau (Enter)
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
